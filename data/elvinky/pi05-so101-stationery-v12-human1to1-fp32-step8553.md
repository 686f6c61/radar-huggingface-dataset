# Elvinky/pi05-so101-stationery-v12-human1to1-fp32-step8553

## Resumen

`Elvinky/pi05-so101-stationery-v12-human1to1-fp32-step8553` es un modelo de política robótica de tipo vision-language-action (VLA) publicado en HuggingFace bajo la familia PI05, la implementación de LeRobot de la línea pi0.5. Se trata de un fine-tune completado sobre el checkpoint `Travor278/pi05-so101-stationery-jax-v12` (originalmente en JAX, convertido a PyTorch antes de este entrenamiento). El modelo tiene 4.143.404.816 parámetros en FP32 y resuelve una única tarea de manipulación: `put stationery table into bag` (recoger material de papelería de una mesa e introducirlo en una bolsa) sobre un brazo robótico SO-101.

La particularidad del release es su estrategia de entrenamiento: un fine-tune de parámetros completos con proporción 1:1 entre demostraciones originales y muestras de intervención humana (human-in-the-loop, esquema tipo DAgger). La vista humana contiene 741 segmentos contiguos marcados como `intervention=true` y 109.466 fotogramas a 30 FPS (1 h 00 min 48,9 s), mientras que la vista original contiene 397 episodios y 1.256.576 fotogramas. El objetivo declarado fue dar 2,5 pasadas sobre los datos humanos, no sobre ambas fuentes.

Es relevante ahora porque documenta de forma inusualmente detallada la proveniencia del entrenamiento (semilla, hiperparámetros, configuración de hardware, estrategia de enmascarado de pérdida) y porque publica pesos completos en FP32 listos para inferencia con LeRobot. Ahora bien, el propio autor advierte de que el modelo **no ha pasado ninguna evaluación en robot físico**: la pérdida de entrenamiento no establece rendimiento ni seguridad de despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política VLA (vision-language-action) PI05; configuración `PI05Config` de LeRobot. Detalle interno del backbone no disponible en la información proporcionada |
| Parametros totales | 4.143.404.816 (≈4,14 mil millones) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible. Horizonte de acción (`chunk/action horizon`) = 50 pasos |
| Tipos de cuantizacion | No disponible. El release publica únicamente pesos FP32; no se ofrecen versiones GGUF, INT8 ni de 4 bits |
| Idiomas soportados | No disponible. Las instrucciones de tarea observadas están en inglés (`put stationery table into bag`) |
| Licencia | No disponible |
| Formato de pesos | `safetensors` (PyTorch), precisión FP32. Modelo, config y processor en la raíz del repositorio; artefactos de proveniencia en `provenance/` |

## Arquitectura y entrenamiento

La arquitectura es una política VLA PI05 gestionada mediante LeRobot 0.6.1, con pesos en FP32 y pipeline de inferencia PyTorch. La model card no describe la composición interna del backbone (codificador visual, modelo de lenguaje y experto de acción), por lo que ese detalle debe confirmarse en la documentación de LeRobot y de la familia pi0.5. El modelo consume tres flujos de entrada propios de una política VLA: observaciones de cámara, estado del robot y una instrucción de lenguaje, y produce chunks de acción de 50 pasos. El release incluye los pipelines de processor guardados y los mapeos de cámara y acción, y advierte de que hay que usarlos tal cual: la normalización original de v12 se conservó para ambas fuentes de datos.

El entrenamiento se ejecutó en 8 GPU A800 con batch 8 por GPU (batch global 64), semilla 1000 y 8.553 pasos de optimizador, con DDP de parámetros completos en FP32, TF32 desactivado, gradient checkpointing activado y AdamW con `foreach=false`. No se usó AMP, ZeRO, FSDP ni LoRA. El scheduler va de 2,5e-6 a 2,5e-7 con 200 pasos de warmup, weight decay 0,01 y grad clip 1,0. En cada batch y por rank se mezclaron 4 demostraciones originales y 4 muestras de intervención humana. El padding temporal y de dimensión de acción se excluyó de la pérdida, lo que evita que el modelo aprenda a predecir relleno. Los datos provienen de `MINT-SJTU/RW-RL-Dataset` y de `Elvinky/so101-stationery-dagger-20260909`. No se menciona RLHF ni DPO, algo esperable en un modelo de control robótico.

## Capacidades

- Generación de acciones de manipulación robótica de horizonte corto: predice chunks de 50 pasos de acción para el brazo SO-101.
- Ejecución de una tarea concreta de manipulación guiada por lenguaje: `put stationery table into bag`.
- Condicionamiento multimodal: integra observaciones de cámara, estado del robot e instrucción textual.
- Aprendizaje por intervención humana: el fine-tune incorpora 741 segmentos de corrección humana, de modo que la política ha sido ajustada con datos de recuperación de errores, no solo con demostraciones limpias.
- Inferencia offline: el release incluye todos los ficheros necesarios (modelo, config, processor, tokenizer) y puede ejecutarse sin dependencia externa del modelo base, sobreescribiendo la ruta del tokenizer con el directorio local descargado.
- Compatibilidad con el ecosistema LeRobot: config compatible con `PI05Config` estándar (solo se eliminó el campo de entrenamiento `mask_action_padding_loss`).
- No disponible: tool calling, function calling, agentes multi-paso genéricos, capacidades multilingües, visión general, audio o modo de razonamiento explícito. Es un modelo de robótica, no un asistente conversacional.

## Casos de uso

- Automatización de recogida de material de oficina o laboratorio: el modelo está entrenado específicamente para trasladar material de papelería disperso sobre una mesa a una bolsa. Es el escenario de despliegue directo y el único para el que existe evidencia de entrenamiento.
- Investigación en aprendizaje por intervención humana (DAgger / HG-DAgger): la receta de mezcla 1:1 entre datos originales y datos de intervención, junto con el enmascarado del padding en la pérdida, sirve como referencia reproducible para estudiar cuánto ayuda la corrección humana frente al dato demostrativo puro.
- Punto de partida para fine-tunes sobre el mismo hardware: al publicarse pesos completos en FP32 y la configuración exacta de optimizador, es un candidato natural para continuar el entrenamiento con nuevas tareas sobre el brazo SO-101 en lugar de empezar desde el modelo base en JAX.
- Evaluación comparativa de políticas VLA en un banco de pruebas acotado: al ser una tarea única y un entorno único, permite medir de forma controlada el efecto de cambios de iluminación, posición inicial de los objetos o del layout de las cámaras.
- Análisis de robustez y de modos de fallo: útil para estudiar cómo se degrada una política ajustada con intervenciones humanas cuando el objeto o la superficie cambian respecto a la distribución de entrenamiento.
- Reproducción de pipelines de conversión JAX → PyTorch: el release documenta que la política JAX v12 se convirtió a PyTorch antes del fine-tune, lo que resulta útil como referencia de portabilidad entre frameworks en el ecosistema LeRobot.
- Docencia y demostraciones de VLA en robótica de bajo coste: sobre un SO-101, un brazo de coste contenido, el modelo permite ilustrar el ciclo completo de demostración, intervención, entrenamiento y despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente menciona la pérdida de entrenamiento como métrica, sin reportar su valor, y declara explícitamente que no se ha realizado ninguna evaluación sobre robot físico. No se incluyen tasas de éxito, números de MMLU, HumanEval, GSM8K ni métricas equivalentes de manipulación (por ejemplo, success rate por episodio), por lo que no es posible comparar el rendimiento con otros modelos de la misma categoría.

## Requisitos de hardware

- Peso de los pesos en FP32: 4.143.404.816 parámetros × 4 bytes ≈ 16,6 GB, coherente con el tamaño del repositorio (16,6 GB). A esto hay que sumar activaciones, memoria de los tres flujos de cámara y el estado del bucle de control.
- VRAM estimada por precisión: ≈16,6 GB en FP32; ≈8,3 GB en FP16/BF16; ≈4,1 GB en INT8; ≈2,1 GB en 4 bits (las tres últimas son estimaciones teóricas de peso, no formatos publicados por el autor).
- GPU de centro de datos: A800, A100 y H100 (40/80 GB) son suficientes con margen en FP32. El entrenamiento se hizo precisamente en 8× A800.
- GPU de consumo: cabe en RTX 4090, RTX 3090 o RTX 5090 (24-32 GB) en FP32, aunque con poco margen para activaciones; en BF16 el margen es amplio. En GPUs de 16 GB o menos no cabe en FP32 sin cuantizar, y no hay versiones cuantizadas publicadas.
- Opciones de despliegue: LeRobot (librería declarada, `library_name: lerobot`) con PyTorch 2.11.0+cu128 como referencia. Para inferencia offline hay que descargar el release completo y sobreescribir `tokenizer_name` del processor con el directorio local. vLLM, TGI, llama.cpp u Ollama no son aplicables de forma estándar a una política VLA de este tipo, y el autor no publica pesos GGUF.
- Latencia y throughput: no disponible. No se reportan mediciones de frecuencia de control, latencia por chunk de 50 acciones ni FPS de inferencia alcanzables.

## Comparativa con modelos similares

Los datos de terceros que figuran a continuación provienen de la documentación pública de cada proyecto y no han podido verificarse con las fuentes de esta búsqueda; se marcan como referencia orientativa. El rendimiento de manipulación no es comparable porque ningún proyecto publica métricas sobre la misma tarea y el mismo robot.

| Modelo | Parametros | Contexto / horizonte | Licencia | Disponibilidad | Rendimiento en esta tarea |
|---|---|---|---|---|---|
| pi05-so101-stationery-v12-human1to1-fp32-step8553 | 4,14 mil M (FP32) | No disponible; chunk de 50 acciones | No disponible | Pesos safetensors en HuggingFace, 0 descargas | No evaluado en robot físico |
| pi0 / pi0.5 (Physical Intelligence) | Del orden de miles de millones (no confirmado aquí) | No disponible en esta ficha | No disponible en esta ficha | Pesos abiertos vía repositorio openpi | No aplica a esta tarea |
| OpenVLA | 7 mil M aprox. (referencia pública) | No disponible en esta ficha | Licencia comunitaria del modelo base (referencia pública) | Pesos abiertos en HuggingFace | No aplica a esta tarea |
| SmolVLA | ~450 M (referencia pública) | No disponible en esta ficha | Apache 2.0 (referencia pública) | Pesos abiertos, integrado en LeRobot | No aplica a esta tarea |

La comparación honesta es que este modelo no compite por métricas generales: compite por ser un artefacto reproducible de una tarea específica sobre un SO-101, con proveniencia de entrenamiento documentada paso a paso, algo poco habitual incluso en releases de investigación.

## Limitaciones y advertencias

- Sin evaluación en robot físico: el autor lo declara explícitamente. La pérdida de entrenamiento no es evidencia de rendimiento ni de seguridad en despliegue. Cualquier uso real exige validación previa en un entorno controlado.
- Licencia no disponible: no se especifica licencia en la model card ni en los metadatos. Esto impide determinar si el uso comercial está permitido; en la práctica, equivale a un bloqueo legal para producción hasta que el autor lo aclare.
- Especialización extrema: una sola tarea (`put stationery table into bag`), un solo robot (SO-101) y un entorno concreto. No hay evidencia de generalización a otras tareas, objetos o morfologías.
- Dependencia de la configuración de percepción: el release exige usar los mapeos de cámara y acción y la normalización originales. Cambiar la disposición de las cámaras, la resolución o los límites de las articulaciones invalida el modelo.
- Riesgo de sobreajuste a la distribución de entrenamiento: la vista original contiene 397 episodios, y el fine-tune prioriza datos de intervención humana. Variaciones de iluminación, fondo u objeto pueden provocar acciones erráticas, que en robótica es el equivalente funcional de una alucinación.
- Sesgo de operador: los 741 segmentos de intervención humana provienen de uno o varios teleoperadores concretos. Sus estrategias de recuperación de errores quedan codificadas en la política y pueden no ser óptimas ni generalizables.
- Coste de inferencia: pesos FP32 de 16,6 GB sin versiones cuantizadas publicadas, lo que dificulta el despliegue en hardware embebido o en GPU de gama media.
- Datos de entrenamiento parcialmente no publicados: no se suben vídeos crudos de entrenamiento, estado del optimizador ni estado RNG. Esto limita la reproducibilidad exacta del entrenamiento, aunque no la de la inferencia.
- Ausencia de validación comunitaria: 0 descargas y 0 likes en el momento de la consulta. No hay terceros que hayan replicado resultados.
- Fecha de creación declarada: 2026-09-10, con entrenamiento finalizado el 2026-09-10 a las 19:25 (Asia/Shanghai). Conviene verificar la vigencia del repositorio antes de basar en él un proyecto.
- Idiomas: no se declara ningún idioma soportado. La instrucción de tarea está en inglés, por lo que el comportamiento con instrucciones en castellano es desconocido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Elvinky/pi05-so101-stationery-v12-human1to1-fp32-step8553
- Espejo del modelo: https://hf-mirror.com/Elvinky/pi05-so101-stationery-v12-human1to1-fp32-step8553
- Modelo base (JAX v12): https://huggingface.co/Travor278/pi05-so101-stationery-jax-v12
- Dataset de intervenciones: https://huggingface.co/datasets/Elvinky/so101-stationery-dagger-20260909
- Dataset de referencia: https://huggingface.co/datasets/MINT-SJTU/RW-RL-Dataset
- LeRobot (librería de referencia, versión 0.6.1 en el entrenamiento): https://github.com/huggingface/lerobot
- Búsqueda web realizada: no se ha encontrado ningún resultado relevante sobre este modelo. Los resultados devueltos correspondían a foros de aerolíneas y a una consulta lingüística en Zhihu, sin relación con el modelo. No se dispone, por tanto, de paper, blog técnico, demo ni repositorio adicional asociado.

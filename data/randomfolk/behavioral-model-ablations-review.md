# randomfolk/behavioral-model-ablations-review

## Resumen

`randomfolk/behavioral-model-ablations-review` no es un modelo de lenguaje en el sentido habitual, sino un paquete de artefactos de revision anonima que acompanan un manuscrito cientifico sobre ablaciones de historial de recompensa en modelos predictivos. El objetivo declarado del autor es comprobar si las ablaciones del historial de recompensa de modelos predictivos recuperan la respuesta de generadores de eleccion secuencial conocidos. Todo el material es sintetico: no contiene datos humanos ni resultados reservados del conjunto de test.

El repositorio, de 13,6 GB, incluye 28 adaptadores LoRA de ajuste supervisado (SFT) sobre LLaMA, repartidos en dos tareas, dos condiciones de entrenamiento (entrada completa o solo eleccion) y siete pesos de mezcla de politica de recompensa. Ademas, incorpora 168 checkpoints de GRU y de Transformer entrenado desde cero, con sus configuraciones, metricas e historiales de entrenamiento (dos tareas, dos condiciones, siete pesos y tres semillas), junto con trayectorias sinteticas de entrenamiento y validacion, el codigo fuente anonimo y las pruebas.

El modelo base de los adaptadores es `unsloth/Meta-Llama-3.1-70B-bnb-4bit`, que no se redistribuye: cargarlos exige acceso compatible, licencia y software de GPU adecuados. La relevancia de esta ficha es acotada: sirve para evaluar un artefacto de reproducibilidad cientifica, no un modelo desplegable en produccion. No se concede licencia alguna para los materiales de revision anonima.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA sobre transformer denso LLaMA 3.1 70B; el repositorio incluye ademas checkpoints de GRU y de Transformer entrenado desde cero |
| Parametros totales | 70 000 millones en el modelo base; numero de parametros de los adaptadores LoRA: no disponible |
| Parametros activos | No aplica (modelo base denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base LLaMA 3.1 70B) |
| Tipos de cuantizacion | El modelo base se distribuye como `bnb-4bit`; los adaptadores LoRA se almacenan en safetensors. No se documentan otros formatos cuantizados |
| Idiomas soportados | No disponible. El contenido es sintetico y orientado a eleccion secuencial, no a generacion multilingue |
| Licencia | No se concede licencia para los materiales de revision anonima. El modelo base queda sujeto a la licencia de Llama 3.1 |
| Formato de pesos | safetensors (etiqueta del repositorio) para los adaptadores; formato de los checkpoints de GRU/Transformer: no disponible |

## Arquitectura y entrenamiento

La parte LLaMA del artefacto consiste en 28 adaptadores LoRA finales de SFT, organizados factorialmente: dos tareas, dos condiciones de entrenamiento (entrada completa frente a solo eleccion) y siete pesos de mezcla de politica de recompensa. Es un diseno de ablacion controlada, no un entrenamiento orientado a capacidades generales. No se especifican el rango de LoRA, el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de alineacion adicionales como RLHF o DPO. El modelo base indicado es `unsloth/Meta-Llama-3.1-70B-bnb-4bit`, una version cuantizada a 4 bits de Meta-Llama-3.1-70B.

La segunda familia de artefactos son 168 checkpoints de GRU y de Transformer entrenado desde cero, seleccionados como los mejores de cada configuracion, con sus metricas e historiales. Estos cubren las mismas dos tareas, dos condiciones, siete pesos y tres semillas, lo que permite comparar el comportamiento de un modelo predictivo grande (via LoRA) con generadores de eleccion secuencial mas simples y completamente entrenables. El repositorio incluye auditorias de generadores, trayectorias sinteticas de entrenamiento y validacion, y datos de entrada preparados, pero no los checkpoints intermedios ni las trayectorias reservadas de test. El ZIP `anonymous_review_code.zip` contiene una version compacta del codigo y las instantaneas de figuras, con su propio manifiesto.

## Capacidades

- No es un modelo de proposito general: no se documenta generacion de texto abierta, razonamiento, codigo, matematicas ni vision.
- Modelado de eleccion secuencial: los adaptadores y los checkpoints estan entrenados para predecir elecciones dentro de trayectorias sinteticas.
- Ablacion de historial de recompensa: la variable experimental central es la mezcla de pesos de politica de recompensa y la condicion de entrada (entrada completa frente a solo eleccion).
- Comparacion entre familias de modelos: permite contrastar un LLaMA 70B con adaptadores frente a GRU y Transformers entrenados desde cero bajo el mismo diseno factorial.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Reproduccion de experimentos de ablacion: el repositorio incluye codigo fuente, scripts, pruebas y manifiestos con digests SHA-256, de modo que un revisor puede reconstruir las comparaciones entre condiciones de entrenamiento y pesos de recompensa sin volver a generar los datos.
- Auditoria de generadores de eleccion secuencial: las auditorias de generadores y las trayectorias sinteticas permiten verificar que el proceso de simulacion produce distribuciones de eleccion coherentes antes de usarlo como referencia.
- Estudio de transferencia entre arquitecturas: comparar los 28 adaptadores LoRA sobre LLaMA 70B con los 168 checkpoints de GRU y Transformer desde cero aporta evidencia sobre si un modelo grande ajustado con pocos parametros recupera el comportamiento de un generador parametrico conocido.
- Docencia e investigacion en modelado del comportamiento: el diseno factorial (dos tareas, dos condiciones, siete pesos, tres semillas) es un material didactico util para ilustrar controles experimentales y analisis de sensibilidad.
- Reconstruccion de figuras para revision por pares: el ZIP compacto con instantaneas de figuras usa resumenes congelados de validacion de desarrollo y permite regenerar las figuras del manuscrito sin reejecutar el ajuste.
- Base metodologica para nuevos experimentos: la estructura de datos, entradas preparadas y scripts de analisis puede reutilizarse como plantilla para estudios de ablacion en otros dominios de eleccion secuencial.
- Verificacion de integridad de artefactos: los manifiestos en la raiz y en `review_artifacts/` permiten comprobar la integridad de cada adaptador LoRA, su configuracion y los ficheros auxiliares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio contiene metricas de entrenamiento y evaluacion en `review_artifacts/outputs/` junto con los checkpoints, pero no se proporcionan cifras de MMLU, HumanEval, GSM8K ni de ninguna otra prueba estandar, y el artefacto no esta orientado a esas tareas.

## Requisitos de hardware

- Los adaptadores LoRA requieren cargar el modelo base `unsloth/Meta-Llama-3.1-70B-bnb-4bit`, que no se redistribuye y exige acceso y licencia compatibles.
- VRAM estimada para inferencia sobre el base en 4 bits (estimacion estandar para un denso de 70B, no confirmada por el autor): aproximadamente 40-48 GB solo para pesos, mas la cache KV segun contexto y lote.
- En bf16 completo: unos 140 GB de pesos, lo que obliga a multi-GPU (por ejemplo, 2 x H100 80 GB o 4 x A100 40 GB).
- GPU recomendadas: A100 80 GB, H100 80 GB o H200 para 4 bits; configuraciones multi-GPU para precision completa.
- GPU de consumo: una RTX 4090 de 24 GB no es suficiente por si sola para el base de 70B. Solo seria viable con descarga a CPU o con una cuantizacion mas agresiva, y el repositorio no distribuye pesos GGUF.
- Opciones de despliegue: PEFT y bitsandbytes para cargar los adaptadores, vLLM o TGI para servir el base cuantizado, Unsloth para el flujo de ajuste. llama.cpp u Ollama requeriria convertir el base a GGUF, algo que no esta documentado ni autorizado por la licencia del artefacto.
- Latencia y throughput: no disponibles.
- Los checkpoints de GRU y Transformer desde cero tienen requisitos muy inferiores, probablemente ejecutables en CPU o en una GPU de consumo, pero no se especifican tamanos ni configuraciones de computo.

## Comparativa con modelos similares

No existe un modelo publico directamente comparable: se trata de un paquete de artefactos de revision anonima, no de un modelo con pesos de proposito general. La tabla siguiente situa el artefacto frente a sus componentes de referencia.

| Elemento | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Adaptadores LoRA del repositorio | Base de 70 000 M; LoRA: no disponible | No disponible | Sin benchmarks; solo metricas internas en `outputs/` | Sin licencia concedida | Adaptadores si; base no redistribuido |
| `unsloth/Meta-Llama-3.1-70B-bnb-4bit` | 70 000 M (denso) | No disponible en esta informacion | Benchmarks del modelo original LLaMA 3.1 70B, no aplicables al ajuste | Licencia de Llama 3.1 | Publico, requiere aceptacion |
| Checkpoints GRU y Transformer desde cero incluidos | No disponible | No aplica | Sin benchmarks publicos; metricas en las configuraciones incluidas | Sin licencia concedida | Solo los mejores checkpoints finales |
| Alternativas de la misma categoria | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- No se concede licencia alguna para los materiales de revision anonima, por lo que no esta permitido el uso comercial ni la redistribucion tal como se distribuyen.
- El modelo base LLaMA 3.1 70B no se redistribuye: cargar los adaptadores exige acceso compatible, licencia aceptada y software de GPU adecuado.
- Todos los datos son sinteticos; no hay datos humanos ni resultados del conjunto de test reservado, de modo que cualquier metrica de validacion puede no reflejar comportamiento fuera de la simulacion.
- No se documentan sesgos, riesgos de alucinacion ni limitaciones idiomaticas, pero al ser un modelo de eleccion secuencial ajustado sobre trayectorias sinteticas, la extrapolacion a texto libre o a decisiones reales no esta justificada.
- No se especifican hiperparametros del LoRA (rango, alpha, modulos objetivo), tokens de entrenamiento ni composicion del dataset, lo que limita la reproducibilidad exacta del ajuste.
- Solo se incluyen los adaptadores finales y los mejores checkpoints; los checkpoints intermedios y las trayectorias reservadas de test no estan disponibles, lo que restringe la replicacion completa del analisis.
- La reconstruccion de figuras incluidas usa resumenes congelados de validacion de desarrollo y no reejecuta el ajuste, por lo que no constituye una verificacion independiente del pipeline.
- Los metadatos de HuggingFace (0 descargas, 0 likes, pipeline no definido, sin idiomas declarados) y la fecha de creacion registrada (2026-09-25) son atipicos y deben tratarse con cautela.
- Antes de reutilizar cualquier componente conviene verificar los digests SHA-256 de los manifiestos, dado que el repositorio esta pensado para revision anonima y no para consumo general.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/randomfolk/behavioral-model-ablations-review
- Modelo base requerido (no redistribuido): https://huggingface.co/unsloth/Meta-Llama-3.1-70B-bnb-4bit
- Ficheros internos de referencia dentro del repositorio: `review_artifacts/README.md` (mapa de paper a codigo), `review_artifacts/FULL_ARTIFACTS_STATUS.md` (alcance de los artefactos grandes), `review_artifacts/MANIFEST.json` y `MANIFEST.json` de la raiz (digests SHA-256), `anonymous_review_code.zip` (suplemento compacto con su propio manifiesto).
- La busqueda web realizada no devolvio ningun enlace relevante sobre este modelo: los resultados obtenidos corresponden a contenidos audiovisuales sin relacion con el repositorio. No se han encontrado paper, blog, repositorio de codigo ni demo adicionales en la informacion disponible.

# kiroaiseoul/NAJY_act_all11_c100_gist30_t02il_27D_60k_s2000

## Resumen

El modelo identificado como `kiroaiseoul/NAJY_act_all11_c100_gist30_t02il_27D_60k_s2000` es un checkpoint de robótica basado en ACT (Action Chunking with Transformers), la arquitectura de imitación con transformer y autoencoder condicional popularizada por ALOHA y empaquetada en la librería LeRobot. Lo publica el usuario kiroaiseoul y corresponde a un entrenamiento etiquetado internamente como `t39_all11_c100_gist30_t02il_60k_s2000`, en el paso 60 000, ejecutado sobre una estación DGX (identificada en la model card como "1호기 DGX_1"). El repositorio pesa 0,2 GB y contiene 51 700 368 parámetros en formato safetensors.

El problema que resuelve es la generación de acciones motoras por imitación a partir de observaciones multimodales: el modelo recibe el estado del robot (vector de 27 dimensiones) y tres cámaras RGB de 480x640 (`cam_high`, `cam_left_wrist`, `cam_right_wrist`), y produce un vector de acción de 16 dimensiones. Está asociado al ecosistema de simulación Trossen AI y al dataset Trossen Mobile AI, lo que lo sitúa en el ámbito de la manipulación robótica sobre base móvil.

Su relevancia es limitada y muy específica: se trata de un checkpoint de análisis y evaluación, no de un modelo de propósito general. La propia model card indica explícitamente que es una subida para análisis y puntuación, y que no equivale a una confirmación como candidato de despliegue real. Tiene cero descargas y cero likes, y no incluye resultados de benchmarks ni documentación de la composición del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder-decodificador y CVAE; no disponible el detalle exacto de capas en la informacion proporcionada |
| Parametros totales | 51 700 368 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; la "ventana" operativa la define el horizonte de chunking de acciones, no documentado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica; no procesa lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`, sha256 `bcf8612b5ef477fde619d2346af117f400cf8e79f6e98cbba9aa367432ef4917`); repositorio compatible con la estructura `pretrained_model` de LeRobot |

Entradas y salidas declaradas en la model card:

| Feature | Forma |
|---|---|
| `observation.state` | [27] |
| `observation.images.cam_high` | [3, 480, 640] |
| `observation.images.cam_left_wrist` | [3, 480, 640] |
| `observation.images.cam_right_wrist` | [3, 480, 640] |
| `action` | [16] |

## Arquitectura y entrenamiento

ACT es una arquitectura de imitación supervisada diseñada para aprender políticas de manipulación a partir de demostraciones teleoperadas. Combina un transformer encoder-decodificador con un cuello de botella variacional condicional (CVAE) y predicción por bloques de acciones (*action chunking*), de modo que el modelo emite varias acciones futuras de una sola pasada en lugar de una acción por paso. Esto reduce el error de composición acumulado y suaviza el comportamiento en tareas de contacto. El sufijo `c100` del nombre del run sugiere un tamaño de chunk de 100 y `gist30` un número de tokens de tipo *gist* de 30, pero la model card no documenta el significado de estas etiquetas, por lo que no se puede confirmar. El estado se codifica como un vector de 27 dimensiones y las acciones como un vector de 16 dimensiones, coherente con un robot móvil con base y brazos.

En cuanto a los datos de entrenamiento, la información disponible es mínima: solo se indica que corresponde al run `t39_all11_c100_gist30_t02il_60k_s2000` en el paso 60 000, que fue entrenado en una DGX etiquetada como "1호기 DGX_1" y que se enmarca en el trabajo del proyecto `trossen-ai-simulation` (documento `docs/mobile_base_investigation.md` §94). No se especifica el número de episodios, la composición del dataset, ni si se aplicaron fases de RLHF, DPO o ajuste posterior. El campo de log de entrenamiento aparece como `?` en la propia model card, lo que indica que ni siquiera el autor conserva esa referencia en el repositorio. El directorio incluye además un `multi_manifest.json` con banderas de análisis que la herramienta de puntuación `stage_cond_diag.py` consume mediante `--checkpoint <carpeta>`.

## Capacidades

- Generación de políticas de acción por imitación: mapea estado propioceptivo (27 dimensiones) y tres vistas de cámara a comandos de acción (16 dimensiones).
- Percepción visual multivista: procesa simultáneamente una cámara cenital y dos cámaras de muñeca a resolución 480x640, lo que permite razonar sobre la escena y sobre la posición relativa de los efectores.
- Predicción por bloques de acciones (*action chunking*), que habilita control a mayor frecuencia efectiva que un modelo de acción única.
- Ejecución en el stack LeRobot: el repositorio mantiene la estructura `pretrained_model`, por lo que se puede cargar directamente con las utilidades de LeRobot y con scripts de diagnóstico propios del autor.
- Integración con el ecosistema de simulación Trossen AI para evaluación y puntuación de checkpoints.
- Tool calling: no soportado.
- Soporte de agentes y razonamiento multi-paso: no aplicable; no es un modelo de lenguaje.
- Capacidades multilingües: no aplicable.
- Capacidades especiales: no se documentan modos de razonamiento, visión general, audio ni decodificación especulativa.

## Casos de uso

- Investigación en imitación robótica: sirve como checkpoint de referencia para comparar variantes de ACT dentro de un mismo pipeline de entrenamiento (distintos valores de chunk, gist o número de pasos) y medir su efecto en la tasa de éxito en simulación.
- Manipulación con base móvil: el vector de estado de 27 dimensiones y la acción de 16 sugieren un robot con base desplazable y brazos; el modelo puede emplearse para tareas que requieran aproximarse a un objeto antes de manipularlo.
- Tareas con oclusión parcial: las dos cámaras de muñeca aportan vistas cercanas que complementan la cenital, útil en escenarios donde la cámara superior pierde de vista el objeto durante el agarre.
- Evaluación reproducible de checkpoints: el repositorio incluye hash sha256 del archivo de pesos y un manifiesto con banderas, lo que permite verificar integridad y ejecutar rutinas de puntuación automática (`stage_cond_diag.py`, `--checkpoint`) sobre resultados comparables.
- Reproducción de experimentos en simulación: al estar ligado a `trossen-ai-simulation`, encaja en flujos de reentrenamiento o ablación sobre escenas simuladas antes de considerar transferencia al robot físico.
- Diagnóstico de fallos de política: cargando el checkpoint en LeRobot se pueden inspeccionar las distribuciones de acción predichas y compararlas con las demostraciones, para detectar modos colapsados o sesgos de chunking.
- Punto de partida para *fine-tuning*: con licencia Apache 2.0 y pesos safetensors, es viable ajustarlo sobre demostraciones propias del mismo formato de observación y acción, siempre que coincidan las 27 dimensiones de estado y las 16 de acción.
- Docencia y prototipado en robótica de imitación: permite a un equipo montar un pipeline completo de ACT sin partir de cero, aunque con la advertencia de que el autor no lo considera un candidato de despliegue confirmado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, métricas de error de acción, comparaciones con otros checkpoints ni curvas de entrenamiento; únicamente identifica el paso 60 000 del run y un hash de verificación del archivo de pesos.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia de orden de magnitud, 51,7 millones de parámetros ocupan aproximadamente 207 MB en fp32 y 103 MB en fp16; la huella real será mayor por los encoders visuales, los búferes de las tres cámaras a 480x640 y el estado interno del CVAE durante el entrenamiento.
- GPU recomendadas para inferencia: no especificadas por el autor. Por tamaño, cualquier GPU con al menos 4-6 GB de VRAM debería ser suficiente en fp32 para inferencia, aunque no hay confirmación.
- GPU recomendadas para entrenamiento: el run se entrenó en una estación DGX; no se detalla el modelo de GPU concreto.
- Viabilidad en GPU de consumo: probable en tarjetas tipo RTX 3060/4060 o superiores, dado el tamaño del modelo; sin verificación oficial.
- Opciones de despliegue: LeRobot (estructura `pretrained_model`), PyTorch. No aplican vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles. En ACT, la latencia relevante es el tiempo por bloque de acciones y depende del tamaño de chunk, no documentado aquí.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NAJY_act_all11_c100_gist30_t02il_27D_60k_s2000 | 51,7 M | no disponible (chunking no documentado) | Imitación visomotora, robot móvil con 3 cámaras | Apache 2.0 | HuggingFace, 0 descargas |
| ACT original (ALOHA) | no disponible en la informacion proporcionada | chunking de acciones | Imitación bimanual | no disponible en la informacion proporcionada | Repositorio público de los autores |
| Diffusion Policy | no disponible en la informacion proporcionada | horizonte de predicción de acciones | Imitación visomotora generativa | no disponible en la informacion proporcionada | Repositorio público |
| SmolVLA | no disponible en la informacion proporcionada (aproximadamente 450 M según fuentes externas no verificadas aquí) | condicionado por lenguaje | Política visión-lenguaje-acción | no disponible en la informacion proporcionada | HuggingFace / LeRobot |

La comparación cuantitativa no es posible con los datos aportados: no hay métricas de éxito ni especificaciones de contexto para ninguno de los modelos citados dentro de la información disponible. La diferencia funcional relevante es que este checkpoint es específico de una configuración concreta (27 dimensiones de estado, 16 de acción, tres cámaras Trossen) y no un modelo de propósito general reutilizable sin adaptación.

## Limitaciones y advertencias

- Modelo de uso muy restringido: solo es aplicable a robots cuya interfaz de observación y acción coincida exactamente con las formas declaradas (estado de 27 dimensiones, acción de 16, tres cámaras a 480x640). Cualquier discrepancia invalida el checkpoint.
- Estado de publicación explícitamente provisional: la model card indica que es una subida para análisis y puntuación, y que no equivale a la confirmación de un candidato de despliegue en hardware real. No debe tratarse como listo para producción.
- Ausencia total de validación publicada: sin benchmarks, sin tasas de éxito y sin curvas de entrenamiento, no hay evidencia de rendimiento más allá de la declaración del paso 60 000.
- Trazabilidad incompleta: el campo de log de entrenamiento aparece como `?` y el significado de las etiquetas del run (`all11`, `c100`, `gist30`, `t02il`, `s2000`) no está documentado, lo que dificulta reproducir la receta.
- Riesgo de sobreajuste al dominio de entrenamiento, habitual en políticas de imitación entrenadas sobre un conjunto acotado de demostraciones; no se documenta ningún mecanismo de generalización ni de aumento de datos.
- Riesgo de alucinación en sentido estricto: no aplicable al no generar texto, pero sí existe el riesgo equivalente de acciones incoherentes o inseguras fuera de la distribución de estados observada durante el entrenamiento.
- Sin información sobre sesgos demográficos ni lingüísticos, porque el modelo no procesa lenguaje ni datos personales.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución y conservación del aviso de licencia, pero el autor no ofrece garantías ni soporte, y la responsabilidad sobre un despliegue físico recae enteramente en quien lo integra.
- Advertencia de seguridad física: cualquier uso sobre un robot real exige límites de par, paradas de emergencia y validación en simulación previa; el repositorio no incluye dichas salvaguardas.
- Metadatos anómalos: las marcas temporales de creación y actualización (2026-10-13) son futuras respecto al momento habitual de publicación, lo que conviene verificar antes de tomarlas como referencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kiroaiseoul/NAJY_act_all11_c100_gist30_t02il_27D_60k_s2000
- Documento de referencia citado por el autor: `trossen-ai-simulation`, `docs/mobile_base_investigation.md` §94 (no se proporciona URL en la informacion disponible)
- Herramienta de diagnostico mencionada: `stage_cond_diag.py` (incluida en el propio repositorio o en el proyecto del autor; no se proporciona URL)
- Manifiesto de banderas: `multi_manifest.json` (incluido en la carpeta del checkpoint)
- LeRobot (libreria de carga): https://github.com/huggingface/lerobot
- Paper de ACT / ALOHA (arquitectura base): https://arxiv.org/abs/2304.13705

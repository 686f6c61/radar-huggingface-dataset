# dddddsds31341/Long-WAM-Nesting-Doll-Unclipped-30k-Step-5000

## Resumen

Long-WAM-Nesting-Doll-Unclipped-30k-Step-5000 es un checkpoint de inferencia derivado del modelo base Efficient-Large-Model/Long-WAM-YAM, un modelo de robotica (pipeline `robotics`) orientado a la generacion de acciones motoras a partir de instrucciones en lenguaje natural y observaciones visuales. Lo publica el usuario dddddsds31341 como un fine-tuning sobre el dataset yuyingyinya/nesting_doll, centrado en una unica tarea manipulativa: anidar munecas rusas de menor a mayor tamano.

Se trata de un artefacto de investigacion, no de un modelo de proposito general: el repositorio contiene pesos de inferencia de un entrenamiento de 30.000 pasos optimizados (este corresponde al paso 5.000), sin estado de optimizador, scheduler ni RNG, por lo que no permite reanudar el entrenamiento de forma exacta. La model card no declara parametros totales, longitud de contexto en tokens ni idiomas soportados; la informacion disponible se limita a la configuracion de entrenamiento, el formato de las acciones (14D absolutas de articulaciones y pinza) y los assets necesarios para ejecutarlo.

Su relevancia es acotada: sirve como referencia reproducible de un pipeline de imitation learning sobre el modelo Long-WAM, con estadisticas de normalizacion incluidas y codigo SIP archivado, pero sin metricas de exito ni evaluacion held-out publicadas. El repositorio pesa 12,0 GB y se distribuye bajo licencia "other", heredando las restricciones del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Long-WAM-YAM; requiere Wan2.2 VAE y UMT5 text encoder) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (historial de P48 frames; chunk de accion de 32 pasos) |
| Tipos de cuantizacion | no disponible (checkpoint en BF16, `torch_dtype` incluido en `model.pt`) |
| Idiomas soportados | no disponible |
| Licencia | other (sujeta a la licencia del modelo base) |
| Formato de pesos | PyTorch (`model.pt` con claves `mot`, `proprio_encoder`, `step`, `torch_dtype`) |

## Arquitectura y entrenamiento

El checkpoint se inicializa desde Efficient-Large-Model/Long-WAM-YAM y se fine-tunea sobre el dataset yuyingyinya/nesting_doll (revision ae8a879c9a635d3c666aba58a4d9ac996225edb8), compuesto por 100 demostraciones y 164.571 frames. El entrenamiento se ejecuto en cuatro GPU A100 con batch de 12 por GPU, acumulacion de gradiente 1 (batch global 48), learning rate constante de 1e-05, optimizador AdamW con weight decay 0.01, semilla 42, precision BF16 y DeepSpeed ZeRO-1. El objetivo de la ejecucion era de 30.000 pasos de optimizador; este repositorio corresponde al paso 5.000.

La representacion de acciones es de 14 dimensiones absolutas en unidades originales de pinza: seis articulaciones y pinza del brazo izquierdo, seguidas de seis articulaciones y pinza del brazo derecho. La normalizacion es z-score especifica de la tarea y sin recorte de valores normalizados, por lo que las estadisticas incluidas en `dataset_stats.json` deben usarse junto con el codigo del repositorio. Las entradas visuales provienen de tres camaras RGB (top_head, hand_left, hand_right) con layout de video procesado de 384x320, historial P48 y chunk de accion de 32 pasos. La model card no detalla la arquitectura interna (transformer, MoE, hibrida u otra) ni el volumen total de tokens de entrenamiento.

## Capacidades

- Generacion de acciones motoras de 14 dimensiones (articulaciones y pinzas de ambos brazos) condicionadas por instruccion de tarea y observaciones de tres camaras RGB.
- Ejecucion de una tarea manipulativa concreta: anidar munecas rusas de menor a mayor hasta introducirlas todas en la mayor.
- Procesamiento de historial visual de P48 frames y emision de chunks de accion de 32 pasos.
- Normalizacion z-score especifica de tarea sin recorte, con estadisticas suministradas en el repositorio.
- No se declaran capacidades de tool calling, function calling, agentes multi-paso, razonamiento general, codigo, matematicas, vision general, audio ni modo de pensamiento.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Reproduccion de experimentos de imitation learning: cargar `model.pt` con `longwam.inference.load_model` y `expected_step=5000` para replicar el punto de control del paso 5.000 y comparar con otros checkpoints de la misma ejecucion.
- Evaluacion de politicas sobre la tarea de anidado de munecas rusas: usar el modelo como baseline en un banco de pruebas robotico con las tres camaras y el layout 384x320 especificados.
- Estudio de normalizacion sin recorte: analizar el efecto de la normalizacion z-score sin clipping sobre la estabilidad de las acciones generadas, comparando con variantes con recorte.
- Desarrollo de pipelines de inferencia para Long-WAM: integrar el checkpoint en el codigo SIP archivado (`long-wam-sip-nesting-30k-resumable-20261103-v41.zip`) para validar el flujo de carga, configuracion y ejecucion.
- Investigacion en chunking de acciones: evaluar el impacto del chunk de 32 pasos y del historial P48 en la calidad de las trayectorias de anidado.
- Docencia y divulgacion: ejemplo reproducible de fine-tuning de un modelo de robotica con DeepSpeed ZeRO-1 en cuatro A100, util para ilustrar configuraciones de entrenamiento distribuidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se reclama tasa de exito del robot ni rendimiento en conjuntos held-out.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio pesa 12,0 GB y los pesos se almacenan en BF16, por lo que el peso en memoria es del orden de decenas de GB, pero no se especifica la cifra exacta.
- GPU recomendadas: no disponible; el entrenamiento se realizo en cuatro A100, lo que sugiere que la inferencia se plantea en GPU de clase datacenter.
- Compatibilidad con GPU de consumo: no disponible; no se confirma que quepa en RTX 4090 u otras GPU consumer.
- Opciones de despliegue: carga mediante el codigo SIP incluido (`longwam.inference.load_run_config` y `load_model`), con PyTorch como libreria. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Assets adicionales requeridos: Wan2.2 VAE, UMT5 text encoder y tokenizer, que deben obtenerse por separado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Long-WAM-Nesting-Doll-Unclipped-30k-Step-5000 | no disponible | no disponible (P48 frames, chunk 32) | Manipulacion robotica (anidado de munecas) | other | Hugging Face, 0 descargas |
| Efficient-Large-Model/Long-WAM-YAM (modelo base) | no disponible | no disponible | Robotica general (base) | ver model card del base | Hugging Face |
| Otros checkpoints epoch-named de Long-WAM | no disponible | no disponible | Robotica (misma familia) | other | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- No se declaran sesgos conocidos, pero al ser un fine-tuning sobre 100 demostraciones de una unica tarea, la generalizacion fuera de ella es muy limitada.
- Riesgo de alucinacion en el sentido de acciones no validas fisicamente: no hay evaluacion de exito ni de seguridad en ejecucion real.
- El checkpoint es solo de inferencia: no contiene estado de optimizador, scheduler ni RNG, por lo que no permite reanudar el entrenamiento de forma exacta.
- La configuracion conserva rutas SIP del entorno original; es necesario adaptar rutas de assets, dataset, estadisticas y cache a la maquina destino.
- Requiere assets externos (Wan2.2 VAE, UMT5 text encoder y tokenizer) que no se incluyen en el repositorio.
- La licencia "other" remite a la licencia del modelo base; deben revisarse las restricciones de uso comercial en la model card de Efficient-Large-Model/Long-WAM-YAM antes de cualquier despliegue productivo.
- El repositorio tiene 0 descargas y 0 likes, sin validacion externa conocida.
- No se especifican idiomas soportados ni contexto en tokens; la unica instruccion documentada esta en ingles.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/dddddsds31341/Long-WAM-Nesting-Doll-Unclipped-30k-Step-5000
- Modelo base: https://huggingface.co/Efficient-Large-Model/Long-WAM-YAM
- Licencia del modelo base: https://huggingface.co/Efficient-Large-Model/Long-WAM-YAM
- Dataset: https://huggingface.co/datasets/yuyingyinya/nesting_doll (revision ae8a879c9a635d3c666aba58a4d9ac996225edb8)

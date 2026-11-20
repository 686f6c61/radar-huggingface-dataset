# Shrijanagain/SPEED2-V0-0B7-CPT-SFT-fp8cpt

## Resumen

SPEED2-V0-0B7-CPT-SFT-fp8cpt es un modelo de lenguaje de arquitectura Mixture of Experts (MoE) publicado por el usuario Shrijanagain en Hugging Face. Se trata de un checkpoint de continued pretraining sobre una version previa del mismo modelo, entrenado con el dataset `Shrijanagain/Speed-5B-mX-parquet`. El modelo tiene 746.280.448 parametros totales segun los pesos en safetensors, aunque su repo ocupa 229,9 GB, lo que sugiere que el checkpoint almacena estados adicionales o pesos en formatos de alta precision.

La relevancia tecnica del modelo reside en su politica de precision mixta: durante el entrenamiento emplea GEMMs en fp8 E4M3 para las proyecciones de atencion y los expertos, mientras mantiene en bf16/fp16 los embeddings, el router y las normalizaciones RMSNorm, y los momentos del optimizador en fp32. Los pesos finales se guardan de vuelta en fp16, de modo que el checkpoint es ejecutable en cualquier dispositivo sin necesidad de hardware con soporte fp8.

No obstante, la informacion publicada es muy limitada: no se declara licencia, no se especifican idiomas soportados, no hay resultados de benchmarks ni una descripcion detallada del dataset de entrenamiento. La model card se limita a documentar la configuracion del run de entrenamiento (33.750 pasos, 1.105.920.000 tokens vistos, una sola GPU, seq_len 2048).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) tipo transformer, con atencion multi-cabeza y expertos compartidos |
| Parametros totales | 746.280.448 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el entrenamiento uso seq_len de 2048) |
| Tipos de cuantizacion | fp8 E4M3 (solo en entrenamiento); pesos distribuidos en fp16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (con `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura MoE con atencion estandar (proyecciones q/k/v/o) y una capa de expertos con proyecciones gate/up/down, mas un conjunto de expertos compartidos. Incluye un router con bias y normalizaciones RMSNorm. La politica de precision del entrenamiento diferencia entre componentes: embeddings (atados con `lm_head`), router, router_bias y pesos RMSNorm se mantienen en bf16/fp16, mientras que las GEMMs de atencion y de expertos se ejecutan en fp8 E4M3 en hardware sm89 o superior. Los momentos del optimizador se conservan en fp32.

El continued pretraining se realizo sobre el dataset `Shrijanagain/Speed-5B-mX-parquet` durante 33.750 pasos, con un total de 1.105.920.000 tokens vistos. La configuracion del run incluye una sola GPU con DDP, seq_len de 2048, micro batch de 1, acumulacion de gradiente de 16, learning rate de 5e-05, 100 pasos de warmup y weight decay de 0.1. No se documenta la composicion del dataset, el numero de expertos ni si hubo fases de RLHF o DPO posteriores.

## Capacidades

- Generacion de texto autoregresiva (pipeline `text-generation`).
- Arquitectura MoE con expertos compartidos, lo que en principio permite activar solo una fraccion de los parametros por token (aunque el numero de parametros activos no se declara).
- Entrenamiento de continued pretraining sobre un corpus propio, orientado a adaptar el modelo base a un dominio o distribucion concreta.
- Soporte de tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion.
- Capacidades multilingues: no disponible en la informacion.
- Capacidades especiales (vision, audio, thinking mode): no disponible en la informacion.

## Casos de uso

- Experimentacion con arquitecturas MoE en fp8: el modelo sirve como banco de pruebas para validar pipelines de entrenamiento con GEMMs fp8 E4M3 en GPUs sm89+ (Ada Lovelace y posteriores), manteniendo el checkpoint final en fp16 para inferencia en cualquier dispositivo.
- Continued pretraining sobre corpus de dominio: el checkpoint es un punto de partida para adaptar el modelo a un corpus especializado (el autor lo hizo sobre `Speed-5B-mX-parquet`), con una receta de entrenamiento documentada (lr, warmup, weight decay, acumulacion).
- Generacion de texto en entornos con restricciones de memoria: al guardarse en fp16 y con 746 M de parametros totales, el checkpoint puede cargarse en GPUs de consumo para tareas de generacion de texto de proposito general.
- Investigacion sobre politicas de precision mixta: permite estudiar el impacto de mantener embeddings, router y RMSNorm en bf16 frente a ejecutar las GEMMs en fp8, comparando estabilidad y calidad frente a un entrenamiento totalmente en bf16.
- Fine-tuning supervisado posterior (SFT): el nombre del checkpoint incluye "SFT", por lo que es un candidato natural para fases de ajuste supervisado sobre tareas concretas antes de desplegarlo.
- Reproduccion de runs de entrenamiento: la model card documenta paso, tokens, shards, GPUs y hyperparametros, lo que facilita replicar o extender el entrenamiento en un entorno con una sola GPU y DDP.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 746 M de parametros totales en fp16, el peso ocupa aproximadamente 1,5 GB; en fp32, unos 3 GB. La VRAM real depende del numero de expertos activos y del contexto.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para inferencia en fp16. Para reproducir el entrenamiento con GEMMs fp8 se requiere hardware sm89+ (por ejemplo, RTX 4090, L40S, H100).
- GPU de consumo: si, cabe en GPUs de consumo como RTX 3060, RTX 4060, RTX 4090 y similares.
- Opciones de despliegue: transformers con `trust_remote_code=True` (requerido por el modelo); no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible en la informacion.

## Comparativa con modelos similares

No disponible. La informacion publicada no permite identificar modelos comparables de forma fiable, ya que no se declaran parametros activos, contexto, licencia ni resultados de benchmarks.

## Limitaciones y advertencias

- La model card no declara licencia, lo que impide determinar si el uso comercial esta permitido; hay que contactar con el autor antes de usarlo en produccion.
- No se especifican los idiomas soportados ni la composicion del dataset de entrenamiento, por lo que se desconoce la cobertura linguistica y los posibles sesgos.
- No hay resultados de benchmarks, evaluaciones de calidad ni comparaciones con modelos de referencia.
- El modelo base declarado es el mismo ID que el checkpoint, lo que genera ambiguedad sobre la procedencia exacta de los pesos.
- El repo ocupa 229,9 GB para 746 M de parametros, un tamano desproporcionado que sugiere la presencia de estados de entrenamiento u otros artefactos; conviene revisar los ficheros antes de descargarlo completo.
- El uso de `trust_remote_code=True` implica ejecutar codigo del autor; hay que auditar el codigo antes de cargarlo en entornos de produccion.
- Riesgo de alucinacion y de comportamiento impredecible inherente a un checkpoint de continued pretraining sin fases de alineacion documentadas.
- La ventana de contexto no esta declarada; el entrenamiento uso 2048 tokens, por lo que no se garantiza un contexto mayor.

## Enlaces

- Hugging Face: https://huggingface.co/Shrijanagain/SPEED2-V0-0B7-CPT-SFT-fp8cpt
- Dataset de entrenamiento: https://huggingface.co/datasets/Shrijanagain/Speed-5B-mX-parquet
- Modelo base: https://huggingface.co/Shrijanagain/SPEED2-V0-0B7-CPT-SFT-fp8cpt

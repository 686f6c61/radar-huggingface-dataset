# reaperdoesntknow/delta

## Resumen

delta es un checkpoint de lenguaje de la familia TAMELM publicado por el usuario reaperdoesntknow en Hugging Face. Se presenta explicitamente como un modelo de concepto e investigacion, no como un modelo listo para produccion: la propia model card advierte que los nombres de arquitectura y los campos de configuracion describen la implementacion, no una capacidad de razonamiento demostrada ni resultados de benchmarks. El repositorio incluye pesos, tokenizer, `config.json` y el codigo de modelado personalizado (`modeling_tamelm.py`), con 410.256.184 parametros totales segun los safetensors publicados.

La arquitectura es propietaria (tipo `tamelm_two_axis`) e incorpora tres mecanismos declarados por el autor: atencion enrutada (routed attention), atencion de profundidad (depth attention) y un mezcla de expertos (MoE) sin descarte de tokens (dropless). La configuracion publicada fija 28 capas, dimension de embedding 512, 16 cabezas de query y solo 2 cabezas key/value (GQA), 4 expertos con top-k 2, y una longitud maxima de secuencia de 1024 tokens.

Su relevancia es fundamentalmente experimental: sirve para estudiar una configuracion arquitectonica concreta (atencion FlexAttention, expertos agrupados con Triton) y para reproducir el checkpoint, pero no hay receta de entrenamiento documentada, ni evaluacion reproducible, ni licencia declarada. Cualquier uso en produccion exige verificacion independiente y revision previa del codigo remoto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TAMELM (`tamelm_two_axis`), transformer con routed attention, depth attention y MoE dropless |
| Parametros totales | 410.256.184 (segun safetensors) |
| Parametros activos | no disponible (MoE con 4 expertos y top-k 2, pero sin recuento activo publicado) |
| Longitud de contexto | 1024 tokens (maximo configurado) |
| Tipos de cuantizacion | no disponible (solo se declara dtype configurado float32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (no se declara licencia en el repositorio) |
| Formato de pesos | safetensors, con codigo de modelado personalizado (`modeling_tamelm.py`) |

Otros parametros de configuracion publicados: 28 capas, dimension de embedding 512, 16 cabezas de query, 2 cabezas key/value, 4 expertos con top-k 2, dimension oculta de experto 2048, modo de profundidad `attention` con dimension 512, 4 cabezas de profundidad y 16 slots de profundidad, backend de atencion `flex`, backend de expertos `grouped`, vocabulario de 49152 tokens, `use_cache: false` y version de Transformers registrada 5.5.0.

## Arquitectura y entrenamiento

El modelo es un transformer causal con una configuracion poco convencional. Combina atencion con solo 2 cabezas key/value frente a 16 de query (atencion con grupos, GQA), una capa de "depth attention" con 4 cabezas y 16 slots que opera sobre una dimension de profundidad de 512, y una capa MoE con 4 expertos de dimension oculta 2048 y enrutamiento top-2 sin descarte de tokens. El codigo incluye alternativas densas de referencia y aceleracion opcional mediante CUDA FlexAttention y GEMM agrupado con Triton; la compatibilidad de estos backends depende del runtime, el hardware y los paquetes instalados.

No hay informacion sobre el entrenamiento: la model card indica explicitamente que no se documentan el dataset ni sus licencias, el preprocesado, la duracion o el numero de tokens, los hiperparametros del optimizador, el hardware ni los criterios de seleccion de checkpoints. Tampoco se declara si hubo RLHF, DPO u otra fase de alineamiento. No se debe inferir precision de entrenamiento a partir del dtype configurado (`float32`), ni calidad de contexto largo a partir del limite de secuencia configurado.

## Capacidades

- Generacion de texto autoregresiva como tarea principal declarada (`text-generation`).
- Arquitectura MoE con enrutamiento top-2 sobre 4 expertos, orientada a explorar eficiencia computacional.
- Atencion de profundidad y atencion enrutada como mecanismos experimentales de modelado.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (no se declaran idiomas).
- Modo thinking, vision o audio: no disponible.
- Cache de inferencia: la configuracion publica `use_cache: false`, por lo que la generacion no aprovecha cache KV por defecto.

## Casos de uso

- Investigacion de arquitecturas MoE: el checkpoint permite estudiar el comportamiento de un MoE dropless con 4 expertos y top-2 en un modelo pequeno (410 M parametros), comparando variantes densas y dispersas del mismo codigo.
- Estudio de atencion con GQA extrema: con 16 cabezas de query y 2 key/value, sirve para analizar el impacto de la compresion de KV en calidad y memoria en un entorno controlado.
- Experimentacion con depth attention: los 16 slots y 4 cabezas de profundidad permiten probar hipotesis sobre razonamiento iterativo en capas, siempre con evaluacion propia.
- Reproduccion de resultados de investigacion: al incluir pesos, tokenizer y codigo, es util para replicar experimentos sobre `modeling_tamelm.py` fijando una revision concreta del repositorio.
- Pruebas de integracion de FlexAttention y Triton: el modelo permite validar pipelines de aceleracion con backends CUDA en entornos de laboratorio.
- Benchmarking interno de infraestructura: con 410 M parametros y contexto de 1024 tokens, es manejable para medir latencia y throughput de un stack de inferencia antes de escalar a modelos mayores.
- Docencia y formacion: un modelo pequeno con arquitectura no estandar es adecuado para explicar mecanismos de atencion y MoE en cursos tecnicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card afirma explicitamente que no se declaran puntuaciones de benchmark, mejoras comparativas ni garantias de preparacion para produccion.

## Requisitos de hardware

- VRAM estimada para inferencia: en float32, los 410 M parametros ocupan aproximadamente 1,6 GB solo en pesos; con estados de activacion y overhead del runtime, un entorno de 4-8 GB de VRAM es un punto de partida razonable, aunque no hay medicion publicada.
- GPU recomendadas: no disponibles. El modelo declara aceleracion opcional con CUDA FlexAttention y Triton grouped-GEMM, lo que sugiere GPUs NVIDIA modernas, pero no se especifican modelos concretos.
- GPU de consumo: por tamano, deberia caber en GPUs de consumo con suficiente VRAM (por ejemplo, RTX 3060 de 12 GB o superiores), aunque no hay validacion end-to-end publicada.
- Opciones de despliegue: requiere Transformers con `trust_remote_code=True` y el codigo del repositorio. No hay soporte declarado para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. La configuracion `use_cache: false` puede penalizar la generacion autoregresiva larga.
- Nota: la model card indica que no se ha validado una receta de carga y generacion end-to-end para esta ficha, y no se ofrece garantia de inferencia independiente del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| delta (TAMELM) | 410 M | 1024 | TAMELM con MoE y depth attention | no disponible | Hugging Face, codigo remoto |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables de la misma categoria en la documentacion proporcionada, por lo que no se puede establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Modelo de investigacion: la model card lo describe como concepto arquitectonico, no como modelo evaluado ni listo para produccion.
- Sin evaluacion: no hay benchmarks, ni informe de evaluacion reproducible, ni datos de calidad de contexto largo.
- Sin receta de entrenamiento: se desconocen dataset, licencias de datos, tokens de entrenamiento e hiperparametros, lo que impide auditar el modelo.
- Licencia no declarada: no se puede asumir uso comercial; es obligatorio confirmar los terminos con el propietario del repositorio antes de redistribuir o desplegar.
- Codigo remoto: requiere `trust_remote_code=True`; hay que revisar `modeling_tamelm.py` y fijar una revision concreta para reproducibilidad.
- Riesgo de alucinacion y sesgos: inherente a cualquier modelo de lenguaje; la model card recomienda evaluar precision, sesgo, memorizacion y seguridad antes de usar las salidas.
- Contexto limitado: 1024 tokens es una ventana corta para tareas de documento largo o conversaciones extensas.
- Idiomas no declarados: no se puede garantizar un rendimiento multilingue.
- Sin cache de inferencia por defecto (`use_cache: false`), lo que puede aumentar la latencia en generacion larga.
- Dependencia de backends opcionales (FlexAttention, Triton) cuya compatibilidad varia con hardware y versiones de paquetes.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/reaperdoesntknow/delta
- Ficheros del repositorio: https://huggingface.co/reaperdoesntknow/delta/tree/main
- Configuracion publicada: https://huggingface.co/reaperdoesntknow/delta/blob/main/config.json
- Implementacion del modelo: https://huggingface.co/reaperdoesntknow/delta/blob/main/modeling_tamelm.py

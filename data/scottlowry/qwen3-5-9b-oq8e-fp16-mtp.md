# scottlowry/Qwen3.5-9B-oQ8e-fp16-mtp

## Resumen

Qwen3.5-9B-oQ8e-fp16-mtp es una cuantizacion mixta del modelo Qwen/Qwen3.5-9B, publicada por el usuario scottlowry en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una conversion de pesos orientada a la inferencia eficiente en Apple Silicon mediante la libreria MLX y la herramienta oQ (oMLX v0.7.4.dev1), que aplica cuantizacion de precision mixta en lugar de una cuantizacion uniforme.

El checkpoint conserva la arquitectura multimodal del modelo base: incluye el modelo de lenguaje, un componente de vision y una cabeza MTP (multi-token prediction) destinada a decodificacion especulativa. Con 9.653 millones de parametros totales, el autor reporta una media efectiva de 9,637 bits por peso, lo que situa el almacenamiento en 10,830 GiB, muy por debajo de los aproximadamente 19 GB que ocuparia el modelo en FP16.

Su relevancia es practica: permite ejecutar un modelo de casi 10.000 millones de parametros con vision y decodificacion especulativa en equipos con memoria unificada de 16 GB, manteniendo la mayor parte de los pesos en 8 bits afines con grupo de 64 y reservando FP16 y FP32 para componentes sensibles. La ficha se limita a los datos publicados por el autor; el modelo base Qwen/Qwen3.5-9B no aporta informacion adicional en la documentacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (modelo de lenguaje + vision + cabeza MTP); detalles del modelo base no disponibles |
| Parametros totales | 9.653.104.368 (9,653B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: affine 8-bit con grupo de 64 (94,917% de los pesos), FP16 (0,359%), FP32 (4,724%) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria mlx) |
| Precision efectiva media | 9,637 bits/peso |
| Tamano del repositorio | 46,5 GB |
| Componentes | Lenguaje: 8,954B (9,514 GB); vision: 0,456B (1,824 GB); cabeza MTP: 0,243B (0,290 GB) |

## Arquitectura y entrenamiento

El checkpoint es una conversion de pesos, no un entrenamiento nuevo. La arquitectura subyacente corresponde a Qwen3.5-9B, un transformer multimodal con un modulo de vision de 0,456B de parametros y una cabeza de prediccion multi-token (MTP) de 0,243B. Esta cabeza MTP es la que habilita tecnicas de decodificacion especulativa, en las que el modelo propone varios tokens por paso y un verificador los valida, reduciendo el numero de pasos de decodificacion.

La innovacion tecnica del checkpoint reside en la estrategia de cuantizacion de oQ: en lugar de aplicar 8 bits a todos los tensores, asigna precision segun la sensibilidad de cada componente. Los pesos del modelo de lenguaje se almacenan en affine 8-bit con grupo de 64 (8,50 bits efectivos por peso), mientras que el modulo de vision y la cabeza MTP se mantienen en FP32 (1,699 GiB en total) y una pequena fraccion en FP16 (0,065 GiB). El resultado es un checkpoint de 10,830 GiB con una media de 9,637 bits por peso. No se dispone de informacion sobre el dataset de entrenamiento del modelo base, el numero de tokens utilizados ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento: heredadas del modelo base Qwen3.5-9B, aunque no se detallan en la documentacion disponible.
- Procesamiento de vision: el checkpoint incluye explicitamente un modulo de vision de 0,456B de parametros, por lo que se espera soporte de entrada de imagenes.
- Decodificacion especulativa: la cabeza MTP de 0,243B permite acelerar la generacion mediante prediccion multi-token.
- Inferencia en Apple Silicon: disenado para la libreria MLX, con soporte nativo de memoria unificada.
- Capacidades multilingues: no disponible.
- Tool calling y function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Inferencia local en Mac con memoria unificada: el checkpoint ocupa 10,830 GiB, por lo que cabe en equipos de 16 GB o mas y permite ejecutar un modelo de 9,653B de parametros sin GPU dedicada, usando MLX como backend.
- Prototipado de aplicaciones multimodales en escritorio: al incluir un modulo de vision, se puede usar para tareas de descripcion de imagenes o respuesta a preguntas visuales en un portatil Apple Silicon, sin depender de servicios en la nube.
- Evaluacion de decodificacion especulativa: la cabeza MTP permite medir la ganancia de throughput frente a la decodificacion autoregresiva estandar en el mismo hardware, util para comparar estrategias de aceleracion.
- Desarrollo de asistentes conversacionales offline: la cuantizacion a 8 bits reduce el coste de memoria y permite mantener el modelo cargado de forma permanente en un equipo de desarrollo para pruebas de integracion.
- Investigacion sobre cuantizacion de precision mixta: sirve como referencia reproducible para estudiar el impacto de mantener vision y MTP en FP32 mientras el modelo de lenguaje va en 8 bits.
- Despliegue en entornos con restricciones de red: al ser un checkpoint local de 46,5 GB en el repositorio, se puede distribuir internamente y ejecutar sin conexion, adecuado para laboratorios con datos sensibles.
- Generacion de codigo y texto en flujos de trabajo de desarrollo: si el modelo base conserva las capacidades de la familia Qwen, podria integrarse en editores y scripts locales, aunque no hay datos publicados que lo confirmen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM o memoria unificada estimada: 10,830 GiB para los pesos; se recomienda un minimo de 16 GB de memoria unificada para dejar margen a la cache KV y al contexto.
- GPU dedicadas: no aplica de forma nativa, ya que el checkpoint esta en formato MLX; para CUDA seria necesario convertir los pesos a otro formato.
- Equipos Apple Silicon: cabe en Mac con 16 GB o mas de memoria unificada (M1/M2/M3/M4 en configuraciones de 16, 24, 32 GB o superiores).
- GPU de consumo: no hay soporte directo documentado para RTX 4090 u otras GPU NVIDIA con este checkpoint; requeriria conversion.
- Opciones de despliegue: MLX (libreria nativa del checkpoint) y oMLX; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI para este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-oQ8e-fp16-mtp | 9,653B | no disponible | safetensors MLX (8-bit mixto) | no disponible | Hugging Face, 78 descargas |
| Qwen/Qwen3.5-9B (base) | 9,653B (mismo modelo) | no disponible | no disponible | no disponible | Hugging Face |
| Alternativas de ~9B en 8-bit | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones de modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Es una cuantizacion, no un modelo original: cualquier limitacion del modelo base Qwen3.5-9B se hereda, y la cuantizacion a 8 bits puede introducir degradacion adicional en tareas sensibles.
- La licencia no esta indicada en la informacion disponible, por lo que no se puede confirmar el uso comercial; es imprescindible verificar la licencia del modelo base Qwen/Qwen3.5-9B antes de cualquier despliegue en produccion.
- El checkpoint esta en formato MLX y depende de la libreria mlx; no es directamente usable en ecosistemas CUDA sin conversion.
- El repositorio ocupa 46,5 GB, aunque el checkpoint final pesa 10,830 GiB; la descarga requiere espacio en disco considerable.
- El autor indica que el modelo fue re-cuantizado el 2026-11-11 con oMLX v0.7.4.dev1 y recomienda volver a descargarlo si se tenia una copia anterior, lo que implica que versiones previas pueden diferir en precision.
- No hay informacion sobre sesgos, riesgo de alucinacion, idiomas soportados ni longitud de contexto, por lo que no se pueden evaluar estos riesgos con los datos disponibles.
- El numero de descargas (78) y de likes (0) es bajo, lo que sugiere poca validacion comunitaria del checkpoint.
- La cabeza MTP y el modulo de vision se mantienen en FP32, lo que incrementa el peso del checkpoint respecto a una cuantizacion uniforme de 8 bits.

## Enlaces

- Hugging Face: https://huggingface.co/scottlowry/Qwen3.5-9B-oQ8e-fp16-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Herramienta oQ (oMLX): https://github.com/jundot/omlx

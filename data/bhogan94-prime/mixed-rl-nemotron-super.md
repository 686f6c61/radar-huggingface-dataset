# bhogan94-prime/mixed-rl-nemotron-super

## Resumen

mixed-rl-nemotron-super es un ajuste fino (fine-tune) del modelo nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16, publicado por el usuario bhogan94-prime en Hugging Face. Se trata de un modelo de generación de texto y conversación derivado de la familia Nemotron 3.5 de NVIDIA, con 120.668.707.840 parámetros totales según los pesos en safetensors, y con la nomenclatura "A12B" en el nombre base que sugiere una arquitectura de mezcla de expertos (MoE) con aproximadamente 12 mil millones de parámetros activos por token.

El modelo se distribuye bajo licencia openmdw-1.1 (etiquetada como "other" en los tags de Hugging Face) y requiere acceso restringido: es necesario aceptar las condiciones del repositorio antes de poder descargarlo. El repositorio ocupa 241,4 GB, lo que es coherente con un modelo de 120B parámetros almacenado en precisión BF16.

La relevancia de esta ficha es limitada pero concreta: se trata de un derivado comunitario de un modelo base de NVIDIA con capacidades declaradas de visión-lenguaje (VL), orientado a generación de texto conversacional, y cuyo interés principal reside en el ajuste con refuerzo (RL) mixto que sugiere su nombre. No obstante, la información pública disponible es muy escasa: no hay model card descriptiva, no se han publicado resultados de benchmarks y el número de descargas es de solo 2 en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Nemotron 3.5; el nombre "A12B" sugiere MoE con ~12B activos) |
| Parametros totales | 120.668.707.840 |
| Parametros activos | ~12B (inferido del sufijo A12B del modelo base; no confirmado en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16/safetensors) |
| Idiomas soportados | no disponible |
| Licencia | openmdw-1.1 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Tamano del repositorio | 241,4 GB |
| Acceso | restringido (gated), requiere aceptar condiciones |
| Modelo base | nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16 |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna en la informacion proporcionada. El modelo base es nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16, cuya nomenclatura indica un modelo de 120B parametros totales con aproximadamente 12B parametros activos (sufijo A12B), lo que es caracteristico de una arquitectura de mezcla de expertos (MoE). El sufijo "VL" sugiere capacidades de vision-lenguaje en el modelo base, y "BF16" indica la precision de los pesos originales.

El nombre del repositorio, "mixed-rl-nemotron-super", sugiere que el ajuste se realizo mediante aprendizaje por refuerzo (RL) con una mezcla de objetivos o datasets, aunque no se especifica en la informacion disponible que algoritmos concretos (RLHF, DPO, GRPO u otros) se emplearon, ni el volumen o composicion de los datos de entrenamiento. Tampoco se detallan innovaciones tecnicas como decodificacion especulativa o mecanismos de atencion lineal. Toda esta informacion debe considerarse no disponible.

## Capacidades

- Generacion de texto y conversacion: el pipeline declarado es text-generation con tag conversational, por lo que el modelo esta orientado a dialogos multi-turno.
- Capacidades de vision-lenguaje: el modelo base incluye el sufijo VL, lo que sugiere soporte de entrada de imagenes, aunque no se confirma en la informacion disponible para este fine-tune.
- Razonamiento y ajuste por refuerzo: el nombre "mixed-rl" indica un ajuste mediante RL, presumiblemente orientado a mejorar el razonamiento o la calidad de las respuestas.
- Compatibilidad con endpoints: el tag endpoints_compatible indica que puede desplegarse en la infraestructura de inferencia de Hugging Face.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se declaran idiomas soportados.
- Modo thinking o razonamiento extendido: no disponible en la informacion proporcionada.

## Casos de uso

- Experimentacion con ajuste por refuerzo: el modelo puede utilizarse como referencia para estudiar como un fine-tune RL sobre un base MoE de 120B afecta al comportamiento conversacional, comparando respuestas con el modelo base original.
- Investigacion en modelos MoE de gran escala: con ~12B parametros activos sobre 120B totales, es adecuado para estudiar el equilibrio entre coste computacional y calidad en despliegues con requisitos de memoria elevados.
- Evaluacion de modelos derivados comunitarios: util para investigadores que quieran medir la degradacion o mejora respecto al modelo base de NVIDIA en tareas de generacion de texto.
- Generacion de texto conversacional en entornos controlados: dado su caracter gated y su escasa adopcion, encaja en prototipos internos donde se pueda validar la calidad antes de produccion.
- Reproduccion de pipelines de RL: el nombre y la estructura del repositorio permiten reproducir o auditar el proceso de ajuste si el autor publica la configuracion.
- Base para nuevos fine-tunes: al estar en safetensors y ser compatible con transformers, sirve como punto de partida para ajustes posteriores en dominios especificos, siempre que se respete la licencia openmdw-1.1.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 241 GB solo para pesos, mas memoria para el KV cache y activaciones; requiere multiple GPU de alta gama.
- VRAM estimada en cuantizacion de 8 bits: en torno a 120 GB, todavia fuera del alcance de GPU consumer.
- VRAM estimada en cuantizacion de 4 bits: en torno a 60-70 GB, posible en configuraciones multi-GPU consumer (por ejemplo, 2x RTX 4090 de 24 GB no bastan; se requeriria 4x RTX 4090 o una RTX 6000 Ada / A100 80GB).
- GPU recomendadas: H100 80GB, A100 80GB, H200; para cuantizaciones agresivas, configuraciones multi-GPU de 24 GB.
- Cabe en GPU consumer: no en una sola unidad; solo mediante cuantizacion extrema y reparto entre varias GPU, con latencia elevada.
- Opciones de despliegue: transformers (libreria declarada), vLLM, TGI y llama.cpp (si se generan pesos GGUF, no disponibles en el repositorio).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mixed-rl-nemotron-super | 120,7B | ~12B (inferido) | no disponible | openmdw-1.1 | gated, 2 descargas |
| nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16 (base) | 120B | ~12B | no disponible | no disponible en esta ficha | publico en Hugging Face |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion suficiente para establecer una comparativa cuantitativa con alternativas de la misma categoria (mismo tamano o misma tarea). La comparacion mas directa es con el modelo base de NVIDIA, del que este repositorio es un fine-tune, pero no se han publicado metricas que permitan contrastar el rendimiento relativo.

## Limitaciones y advertencias

- Ausencia de model card: no hay documentacion sobre datos de entrenamiento, hiperparametros de RL ni evaluacion, lo que impide auditar el ajuste.
- Riesgo de alucinacion: inherente a los modelos generativos de esta escala; sin benchmarks publicados no puede acotarse su magnitud.
- Sesgos: no documentados; al no declararse composicion del dataset, no es posible evaluar sesgos de genero, idioma o dominio.
- Idiomas: no se declaran idiomas soportados, por lo que el rendimiento multilingue es desconocido.
- Licencia: openmdw-1.1 con etiqueta "other"; es imprescindible revisar los terminos antes de cualquier uso comercial, ya que puede imponer restricciones adicionales derivadas del modelo base de NVIDIA.
- Acceso restringido: el repositorio es gated y requiere aceptar condiciones, lo que anade friccion a la reproducibilidad.
- Madurez: solo 2 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion ni validacion por la comunidad.
- Contexto: se desconoce la longitud de contexto soportada, lo que limita la planificacion de casos de uso con documentos largos.
- Requisitos de hardware muy elevados: 241 GB de pesos en BF16 excluyen el despliegue en infraestructura convencional sin cuantizacion o multi-GPU.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/bhogan94-prime/mixed-rl-nemotron-super
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16
- Licencia openmdw-1.1: no disponible en la informacion proporcionada
- Paper, blog o demo: no disponible en la informacion proporcionada

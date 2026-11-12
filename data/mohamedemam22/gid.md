# MohamedEmam22/GID

## Resumen

GID (siglas del nombre del repositorio, sin desarrollo explícito en la model card) es un autoencoder convolucional de grafos entrenado sobre datos multi-ómicos de cáncer. Lo desarrolla MohamedEmam22 y se publica bajo licencia MIT. El modelo aprende representaciones latentes de genes a partir de cinco capas ómicas medidas en 1.007 líneas celulares cancerosas, usando una red génica de 1.998 genes como estructura de grafo. Resuelve el problema de integrar y comprimir datos multi-ómicos heterogéneos en un espacio latente de baja dimensión útil para análisis posteriores.

A diferencia de los modelos de lenguaje, GID no procesa texto ni mantiene conversaciones: es un modelo biológico de representación (embedding) de genes. Su relevancia radica en que ofrece pesos ya entrenados y reproducibles para un cohorte concreto de líneas celulares, lo que permite reutilizar las representaciones latentes sin reentrenar desde cero.

El modelo tiene 6.128.652 parámetros, una dimensión oculta de 400 y una dimensión latente de 190. No dispone de ventana de contexto en el sentido de los LLM, sino de un grafo fijo de 1.998 nodos génicos con 5.035 features de entrada por gen.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Autoencoder convolucional de grafos (GCN encoder + decoder espejo) |
| Parámetros totales | 6.128.652 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo sobre grafo de 1.998 nodos; sin contexto textual) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (modelo biológico, sin procesamiento de lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors y PyTorch (`model.pt`) |

## Arquitectura y entrenamiento

GID es un autoencoder de grafos con dos capas de convolución en el encoder (dimensión oculta 400, dimensión latente 190), normalización por lotes, activación PReLU, dropout de 0,1518 y una conexión residual lineal. El decoder replica la estructura del encoder de forma simétrica. Las features de cada nodo (gen) son sus valores en cada línea celular y en cada capa ómica, lo que da 5.035 features de entrada por gen.

El entrenamiento se realizó sobre 1.007 líneas celulares cancerosas, con 1.998 genes como nodos y 5 capas ómicas. La model card no detalla el número de tokens ni la composición exacta del dataset, ni si hubo ajuste fino con RLHF o DPO (no aplicable en este dominio). Tampoco se especifican innovaciones como decodificación especulativa o atención lineal, que no tienen sentido en este tipo de modelo. La reproducibilidad se apoya en el código del repositorio de GitHub y en el comando `python -m gid.infer`, que recalcula las redes a partir de las tablas de entrada.

## Capacidades

- Generación de embeddings latentes de genes a partir de datos multi-ómicos (5 capas) y de una red génica de 1.998 nodos.
- Integración de datos multi-ómicos en un espacio latente de 190 dimensiones.
- Reconstrucción de las features de entrada mediante el decoder (autoencoder).
- Extracción de representaciones por gen (`gene_embeddings.npy`) calculadas sobre todas las muestras.
- Carga reproducible del checkpoint con hiperparámetros, nombres de capas y número de muestras (`gid.train.load_model`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Análisis exploratorio de líneas celulares cancerosas: usar los embeddings latentes de 190 dimensiones para agrupar o visualizar las 1.007 líneas celulares según su perfil multi-ómico, aprovechando que el modelo ya integra las 5 capas en un único espacio.
- Selección de genes candidatos: analizar las representaciones latentes de los 1.998 genes para identificar módulos o vecindades génicas con comportamiento similar a través de las capas ómicas.
- Reutilización de pesos preentrenados: cargar `model.pt` con `gid.train.load_model` y aplicar el encoder a nuevos lotes de datos que respeten el orden génico y las capas del cohorte original, evitando reentrenar desde cero.
- Reproducción de experimentos: recomputar las redes con `python -m gid.infer` a partir de las tablas de entrada indicadas en la sección Data availability del manuscrito, para verificar resultados publicados.
- Base para transferencia a tareas downstream: congelar el encoder y usar los embeddings como features de entrada en clasificadores o modelos de supervivencia, dado el reducido tamaño del modelo (6,1 M de parámetros).
- Integración en pipelines bioinformáticos: al ser un modelo PyTorch ligero con pesos en safetensors, puede incorporarse en flujos de análisis que ya usen PyTorch sin requerir GPU de gran capacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 6,1 M de parámetros el modelo ocupa del orden de decenas de MB en FP32, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no se especifican; cualquier GPU con soporte CUDA (por ejemplo, RTX 3060 o superior) es más que suficiente. También puede ejecutarse en CPU.
- Cabe en GPU consumer: sí, en cualquier GPU moderna e incluso en CPU.
- Opciones de despliegue: PyTorch nativo mediante el paquete `gid` del repositorio de GitHub (`gid.train.load_model`, `gid.infer`). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de autoencoders de grafos multi-ómicos con los que contrastar parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- El modelo está entrenado para un cohorte concreto de 1.007 líneas celulares y un orden génico específico (1.998 genes); no es directamente aplicable a otros cohortes sin reentrenamiento o adaptación.
- Las features de entrada deben seguir la estructura de 5 capas ómicas y 5.035 features por gen; desviarse de ese formato invalida la inferencia.
- No se documentan sesgos, pero al derivarse de líneas celulares cancerosas, las representaciones pueden no generalizar a tejidos sanos u otras poblaciones.
- Riesgo de alucinación no aplica en el sentido de los LLM, pero sí existe riesgo de interpretaciones biológicas erróneas si se usan los embeddings fuera de su dominio previsto.
- Licencia MIT: permite uso comercial y modificación, pero conviene revisar las licencias de los datos de entrada originales citados en el manuscrito.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación externa por la comunidad.
- La model card no detalla el dataset de entrenamiento, el número de épocas ni métricas de reconstrucción, lo que limita la evaluación de su calidad.

## Enlaces

- Hugging Face: https://huggingface.co/MohamedEmam22/GID
- Repositorio de código: https://github.com/Mohamedema/GID
- Manuscrito: no disponible (la model card remite a la sección Data availability del manuscrito, sin enlace directo)

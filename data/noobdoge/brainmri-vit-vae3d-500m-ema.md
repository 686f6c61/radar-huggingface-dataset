# NoobDoge/brainmri-vit-vae3d-500m-ema

## Resumen

BrainMRI ViT-VAE 3D es un autoencoder variacional (VAE) con arquitectura transformer (ViT) disenado para comprimir y reconstruir volumenes de resonancia magnetica cerebral en 3D. Lo publica el usuario NoobDoge bajo el paraguas del proyecto OncoMMAI, y acompana al trabajo *A High-Compression Transformer VAE for Efficient 3D Medical Image Generation*. Su funcion no es generar texto ni responder preguntas, sino actuar como codificador latente de alta compresion: transforma un volumen 3D completo en un latente gaussiano de 16 canales y lo reconstruye, sirviendo de base para entrenar modelos de difusion (DiT) sobre imagenes medicas.

El modelo tiene 499.260.960 parametros y emplea un esquema asimetrico poco habitual: solo 4 bloques en el encoder frente a 36 en el decoder, con anchura 1024 y parches de 8x8x8. El latente es un tensor de 16 canales con cabeza lineal (sin tanh) y convencion de entrada/salida en el rango [0, 1]. Se distribuyen los pesos en estado EMA (media movil exponencial) correspondientes al paso de entrenamiento 462.000.

Es relevante ahora porque la generacion de imagenes medicas 3D afronta un cuello de botella de memoria y computo: comprimir volumenes de alta resolucion a latentes manejables permite entrenar modelos generativos posteriores con recursos razonables. Este checkpoint se publica especificamente como pieza de inferencia congelada para ese flujo, con estadisticas de normalizacion latente y preprocesado fijado incluidos en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT-VAE 3D (transformer con encoder y decoder asimetricos) |
| Parametros totales | 499.260.960 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; opera sobre volumenes 3D) |
| Tipos de cuantizacion | no disponible (pesos publicados en float32; la inferencia admite bf16 segun el codigo) |
| Idiomas soportados | no disponible (modelo de imagen medica, no linguistico) |
| Licencia | no disponible |
| Formato de pesos | safetensors (float32), mas config.json, weights_info.json, preprocess.json y latent_stats.json |
| Bloques encoder / decoder | 4 / 36 |
| Anchura del modelo | 1024 |
| Tamano de parche | 8x8x8 |
| Latente | 16 canales gaussianos, media posterior en encode |
| Convencion de entrada/salida | [0, 1], cabeza lineal, sin tanh |
| Paso de entrenamiento del checkpoint | 462.000 (estado EMA) |
| Tamano del repositorio | 2.0 GB |

## Arquitectura y entrenamiento

El modelo es un VAE completamente transformer sobre volumenes 3D. Tokeniza la imagen con parches de 8x8x8 y procesa la secuencia con una anchura de 1024. La asimetria es marcada: el encoder usa 4 bloques y el decoder 36, lo que concentra la mayor parte de la capacidad en la reconstruccion y permite un encoder ligero que produce un latente de 16 canales. La cabeza de salida es lineal (sin tanh), con datos normalizados en [0, 1]. El `encode` devuelve la media de la posterior, sin escala ni desplazamiento en la frontera del VAE; para entrenar difusion aguas abajo se aplica una transformacion por canal congelada (`u = (z - mean) / std`) y se invierte antes de decodificar.

El checkpoint publicado son pesos EMA en el paso 462.000, exportados en float32. El repositorio incluye `preprocess.json` con el preprocesado de inferencia congelado (orientacion RAS, rejilla de 1 mm, recorte de percentiles 0,5/99,5, rango [0, 1], padding a cero y sin normalizacion del latente) y `latent_stats.json` con media y desviacion tipica por canal de la media posterior, calculadas sobre 1000 volumenes de entrenamiento (marcado como `subset_estimate: true`). No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF/DPO (no aplicables a un VAE). Los datos de entrenamiento y la informacion a nivel de paciente no se distribuyen.

## Capacidades

- Codificacion de volumenes de resonancia magnetica cerebral 3D a un latente gaussiano de 16 canales de alta compresion.
- Reconstruccion de volumenes 3D a partir del latente, con geometria devuelta por el encoder.
- Inferencia en bf16 sobre GPU (el codigo de referencia usa `precision="bf16"`).
- Preprocesado de inferencia congelado y reproducible (RAS, 1 mm, percentiles, [0, 1]).
- Suministro de estadisticas por canal para normalizar el latente en el entrenamiento de modelos de difusion posteriores (DiT).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: no es un modelo de lenguaje.
- No incluye modo thinking, vision general, audio ni generacion de texto.

## Casos de uso

- Entrenamiento de modelos de difusion 3D sobre imagenes medicas: el VAE comprime cada volumen a un latente de 16 canales, de modo que el DiT se entrena en el espacio latente con un coste de memoria muy inferior al de operar en espacio de voxels; las estadisticas por canal incluidas permiten normalizar el latente de forma consistente.
- Reconstruccion y control de calidad de volumenes de RM: codificar y decodificar un volumen permite medir la fidelidad de reconstruccion y detectar artefactos o anomalias en el pipeline de adquisicion antes de usarlo en produccion.
- Preprocesado de datasets de imagen medica: el `preprocess.json` congelado (RAS, 1 mm, percentiles 0,5/99,5) sirve como especificacion reproducible para homogeneizar cohortes de volumenes antes de alimentar modelos generativos.
- Aumento de datos sinteticos en investigacion oncologica: combinado con un generador latente, el VAE decodifica latentes muestreados a volumenes plausibles, util para ampliar cohortes pequenas en estudios de imagen (con validacion clinica obligatoria).
- Compresion de almacenamiento de estudios: el latente de 16 canales reduce drasticamente el espacio frente al volumen original, lo que permite archivar representaciones compactas y reconstruir bajo demanda en flujos de investigacion.
- Extraccion de caracteristicas latentes para tareas aguas abajo: la media posterior por canal puede usarse como representacion compacta para clasificacion, segmentacion o analisis morfometrico, siempre con supervision y validacion adecuadas.
- Integracion en pipelines de investigacion reproducibles: el bundle incluye SHA-256 de pesos y estadisticas, lo que facilita verificar la integridad del checkpoint en entornos de laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 499,26 M de parametros, los pesos en float32 ocupan aproximadamente 2,0 GB; en bf16, alrededor de 1,0 GB. A esto hay que sumar activaciones y el volumen de entrada, que crecen con las dimensiones del volumen y el tamano de lote.
- GPU recomendadas: cualquier GPU con al menos 8-12 GB de VRAM para volumenes y lotes moderados; para lotes grandes o volumenes de alta resolucion conviene disponer de 24 GB o mas (RTX 4090, A100, H100).
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas para inferencia con lotes pequenos; el limite practico lo marca el tamano del volumen y el lote, no los pesos.
- Opciones de despliegue: el codigo de referencia (`vae3d`, con `load_model` y `VAEInference`) sobre PyTorch con CUDA; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto / latente | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BrainMRI ViT-VAE 3D (este) | 499,26 M | VAE transformer 3D, parche 8x8x8 | Latente de 16 canales | no disponible | Hugging Face, pesos safetensors |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- Dominio restringido: entrenado para resonancia magnetica cerebral 3D; no es un modelo de proposito general ni de lenguaje.
- Datos de entrenamiento no distribuidos: no se publican el dataset ni informacion a nivel de paciente, lo que impide auditar sesgos de poblacion o de adquisicion.
- Estadisticas latentes parciales: `latent_stats.json` se calcula sobre 1000 volumenes (`subset_estimate: true`); el autor recomienda recalcularlas sobre el split completo si un DiT de produccion lo requiere.
- Licencia no especificada: no hay terminos declarados, por lo que el uso comercial queda sin marco claro y no deberia asumirse permitido.
- Riesgo de reconstruccion imperfecta: como VAE de alta compresion, puede perder detalle fino; no debe usarse para diagnostico clinico sin validacion.
- Sin garantias de robustez fuera de la distribucion de entrenamiento: volumenes con otras modalidades, resoluciones o protocolos pueden degradar la reconstruccion.
- No apto para uso clinico directo: es una herramienta de investigacion; cualquier aplicacion medica requiere validacion regulatoria y supervision profesional.
- Repositorio sin descargas ni likes y creado recientemente: no hay evidencia de adopcion ni de validacion independiente.

## Enlaces

- Hugging Face: https://huggingface.co/NoobDoge/brainmri-vit-vae3d-500m-ema
- Codigo de inferencia y documentacion: https://github.com/OncoMMAI/brainmri-vit-vae3d
- Paper de referencia (*A High-Compression Transformer VAE for Efficient 3D Medical Image Generation*): no disponible como enlace directo en la informacion proporcionada.

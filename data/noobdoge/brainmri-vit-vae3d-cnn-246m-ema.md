# NoobDoge/brainmri-vit-vae3d-cnn-246m-ema

## Resumen

BrainMRI ViT-VAE 3D — CNN VAE (EMA) es un autoencoder variacional convolucional en 3D publicado por el usuario NoobDoge en Hugging Face, con 246.463.649 parámetros en precisión float32. Forma parte del trabajo *A High-Compression Transformer VAE for Efficient 3D Medical Image Generation*, donde este componente CNN actúa como VAE base para la generación y compresión de volúmenes de resonancia magnética cerebral. El modelo se distribuye con pesos en estado EMA (media móvil exponencial) correspondientes al paso de entrenamiento 160.000.

El modelo resuelve el problema de comprimir volúmenes 3D de imagen médica a una representación latente de baja dimensionalidad (16 canales con factor de compresión espacial 8x8x8) manteniendo la capacidad de reconstrucción, lo que habilita pipelines de difusión sobre latentes en lugar de sobre píxeles. La arquitectura es un UNet convolucional de 4 niveles con base 128 y bloques residuales 2/3, con una cabeza latente gaussiana de 16 canales.

Es relevante ahora porque la generación de imágenes médicas 3D afronta costes computacionales muy elevados; un VAE con compresión 8x8x8 reduce el espacio de trabajo de un volumen típico en un factor de 512, lo que hace viable entrenar modelos generativos posteriores (DiT) sobre latentes. El repositorio incluye artefactos de preprocesado congelado y estadísticas latentes por canal para normalización downstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNet convolucional 3D de 4 niveles, base 128, 2/3 bloques residuales, VAE con latente gaussiano de 16 canales |
| Parametros totales | 246.463.649 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen, no de texto) |
| Tipos de cuantizacion | no disponible (pesos publicados en float32) |
| Idiomas soportados | no disponible (modelo de imagen médica, sin capacidades linguisticas) |
| Licencia | no disponible |
| Formato de pesos | safetensors (float32) |
| Tamano del repo | 1.0 GB |
| Patch / factor de compresion | 8x8x8 |
| Canales latentes | 16 |
| Convencion de entrada/salida | rango [0,1], cabeza lineal, sin tanh |
| Paso de entrenamiento del checkpoint | 160.000 (estado EMA) |

## Arquitectura y entrenamiento

El modelo es un VAE convolucional 3D con un UNet de cuatro niveles, ancho base 128 y bloques residuales de 2/3 repeticiones. La entrada es un volumen de un canal `(B,1,D,H,W)` en rango [0,1] y la salida es una reconstruccion en el mismo rango mediante cabeza lineal, sin activacion tanh. El encoder proyecta a un latente gaussiano de 16 canales tras un patch de 8x8x8, lo que supone una compresion espacial de 512x. El decoder reconstruye el volumen a partir del latente y de la geometria devuelta por `encode`.

Los pesos publicados corresponden al estado EMA en el paso 160.000 del entrenamiento descrito en el paper asociado. El repositorio incluye `preprocess.json` con el preprocesado congelado de inferencia (orientacion RAS, remuestreo a 1 mm, normalizacion por percentiles 0.5/99.5, escalado a [0,1] y padding a cero) y `latent_stats.json` con la media y desviacion tipica por canal de la media posterior, calculadas sobre 1000 volumenes de entrenamiento (`subset_estimate: true`). No se distribuyen los datos de entrenamiento ni informacion a nivel de paciente. No se detalla en la informacion disponible la composicion del dataset, el numero de tokens o volumenes vistos ni si hubo tecnicas de RLHF/DPO (no aplicables a un VAE de imagen).

## Capacidades

- Codificacion de volumenes 3D de resonancia magnetica cerebral a un latente gaussiano de 16 canales con compresion espacial 8x8x8.
- Reconstruccion de volumenes 3D a partir del latente, con geometria devuelta por el encoder.
- Inferencia en precision bf16 mediante el runner `VAEInference` del codigo asociado.
- Exportacion de la media posterior como latente (sin escala ni desplazamiento en la frontera del VAE); la normalizacion por canal se aplica externamente para entrenamiento de difusion.
- Preprocesado congelado reproducible (RAS, 1 mm, percentiles 0.5/99.5, [0,1], padding a cero).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un modelo de imagen, no de lenguaje.
- No dispone de modo thinking, vision 2D general, audio ni otras capacidades multimodales.

## Casos de uso

- Entrenamiento de modelos de difusion latente 3D: el VAE comprime volumenes en un factor 512, de modo que un DiT puede entrenarse sobre latentes de 16 canales en lugar de vóxeles completos, reduciendo drasticamente el coste de memoria y computo.
- Aumento de datos en investigacion de neuroimagen: generar volumenes sinteticos de RM cerebral a partir de latentes muestreados y decodificarlos con este VAE para ampliar cohortes de entrenamiento en tareas de segmentacion o clasificacion.
- Compresion de estudios para almacenamiento o transmision: codificar volumenes a latentes de 16 canales y reconstruirlos bajo demanda, util en entornos con ancho de banda limitado entre centros.
- Preprocesado estandarizado en pipelines clinicos de investigacion: usar `preprocess.json` y el encoder para obtener representaciones latentes homogeneas (RAS, 1 mm, percentiles fijos) que alimenten modelos downstream de deteccion de anomalias.
- Reconstruccion y control de calidad: evaluar la fidelidad de reconstruccion sobre volumenes reales para validar que el latente preserva estructuras anatomicas antes de usarlo en generacion.
- Investigacion en modelos generativos medicos: servir como baseline CNN frente al Transformer VAE del paper para comparar fidelidad, compresion y coste computacional en generacion de RM 3D.
- Integracion en flujos de aumento de datos para entrenamiento de redes de segmentacion cerebral, decodificando latentes perturbados para producir variaciones realistas del volumen original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en float32: aproximadamente 1 GB solo para pesos, mas activaciones; para volumenes 3D grandes las activaciones pueden dominar el consumo, por lo que se recomienda al menos 16-24 GB para lotes pequenos.
- VRAM estimada en bf16: alrededor de 0,5 GB para pesos, con margen adicional para activaciones del UNet 3D.
- GPU recomendadas: A100 o H100 para entrenamiento o inferencia por lotes; RTX 4090 (24 GB) viable para inferencia de volumenes individuales en bf16.
- Cabe en GPU de consumo: si, en tarjetas con 16-24 GB para inferencia de un volumen a la vez; el factor limitante es el tamano del volumen de entrada y las activaciones, no los pesos.
- Opciones de despliegue: PyTorch con el paquete `vae3d` del repositorio de codigo (`load_model`, `VAEInference`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Compresion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BrainMRI ViT-VAE 3D — CNN VAE (EMA) | 246.463.649 | VAE convolucional 3D (UNet) | 8x8x8, 16 canales | no disponible | Hugging Face, safetensors |
| Transformer VAE del mismo paper | no disponible | VAE transformer 3D | no disponible | no disponible | no disponible en la informacion |
| Otros VAE 3D medicos genericos | no disponible | VAE convolucional 3D | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de alternativas comparables en la informacion proporcionada, por lo que la comparacion cuantitativa no esta disponible.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en RM cerebral 3D; no es un modelo de lenguaje ni multimodal general.
- No se distribuyen datos de entrenamiento ni informacion a nivel de paciente, lo que limita la auditoria de sesgos poblacionales (edad, sexo, patologia, equipo de adquisicion).
- Riesgo de reconstruccion inexacta o alucinacion estructural en volumenes fuera de la distribucion de entrenamiento (patologias raras, secuencias no vistas, resoluciones distintas).
- Las estadisticas latentes se calcularon sobre una submuestra de 1000 volumenes (`subset_estimate: true`); para produccion con un DiT se recomienda recalcularlas sobre el split completo de entrenamiento.
- El preprocesado es congelado y no negociable (RAS, 1 mm, percentiles 0.5/99.5, [0,1]); desviarse de el degrada la reconstruccion.
- Licencia no especificada: no se puede confirmar el uso comercial; debe contactarse con el autor antes de cualquier despliegue productivo.
- Sin garantias clinicas: no apto para diagnostico ni decision medica sin validacion regulatoria independiente.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion externa de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/NoobDoge/brainmri-vit-vae3d-cnn-246m-ema
- Codigo de inferencia y documentacion: https://github.com/OncoMMAI/brainmri-vit-vae3d
- Paper asociado (*A High-Compression Transformer VAE for Efficient 3D Medical Image Generation*): no disponible como enlace directo en la informacion proporcionada.

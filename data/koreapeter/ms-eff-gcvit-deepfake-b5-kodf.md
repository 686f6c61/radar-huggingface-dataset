# KoreaPeter/ms-eff-gcvit-deepfake-b5-kodf

## Resumen

ms-eff-gcvit-deepfake-b5-kodf es un modelo de clasificacion de imagenes orientado a la deteccion de deepfakes, desarrollado por el usuario KoreaPeter y publicado en Hugging Face bajo el paraguas del proyecto DeepGuard. Combina un backbone convolucional EfficientNet-B5 (concretamente el checkpoint `timm/tf_efficientnet_b5.ns_jft_in1k`, preentrenado en ImageNet-1k con Noisy Student) con un modulo de atencion basado en Global Context Vision Transformer (GCViT), dando lugar a una arquitectura hibrida CNN-Transformer especializada en discriminacion forense de imagenes manipuladas.

El modelo cuenta con 52.743.453 parametros totales y se distribuye en formato safetensors con codigo personalizado (`custom_code`), lo que obliga a cargarlo con `trust_remote_code=True`. Aunque la etiqueta de pipeline en Hugging Face es `video-classification`, la arquitectura y el tag `image-classification` apuntan a un clasificador de fotogramas individuales que puede aplicarse a video mediante muestreo de frames.

Su relevancia actual radica en la creciente demanda de herramientas de verificacion de contenido audiovisual en un contexto de proliferacion de medios sinteticos. El acceso al repositorio esta restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargar los pesos. La licencia es MIT, lo que facilita su integracion en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida CNN + Transformer: EfficientNet-B5 (backbone) + Global Context Vision Transformer (GCViT) |
| Parametros totales | 52.743.453 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, sin contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Modelo base | timm/tf_efficientnet_b5.ns_jft_in1k |
| Tamano del repositorio | 0,2 GB |
| Pipeline declarado | video-classification (con tag image-classification) |
| Requiere codigo remoto | si (`custom_code`) |
| Acceso | restringido (gated) |

## Arquitectura y entrenamiento

La arquitectura `ms_eff_gcvit` es una construccion hibrida que parte de un EfficientNet-B5 preentrenado en ImageNet-1k (variante Noisy Student, `ns_jft_in1k`), utilizado como extractor de caracteristicas convolucionales. Sobre esa base se incorpora un modulo GCViT (Global Context Vision Transformer), que aporta mecanismos de atencion con contexto global para capturar dependencias de largo alcance en la imagen, algo relevante en la deteccion de artefactos de manipulacion que pueden aparecer en regiones distantes del rostro o del fondo. El sufijo `kodf` del identificador sugiere una variante o dataset especifico de entrenamiento, si bien no se detalla su significado en la informacion disponible.

No se dispone de informacion publica sobre el volumen de datos de entrenamiento, la composicion del dataset, el uso de tecnicas de alineamiento (RLHF, DPO) ni sobre innovaciones adicionales como decodificacion especulativa o atencion lineal. Tampoco se documentan las clases exactas de salida ni el esquema de etiquetado empleado. Todo ello debe considerarse no disponible a partir de la informacion proporcionada.

## Capacidades

- Clasificacion de imagenes para deteccion de deepfakes: el modelo emite una prediccion binaria o multiclase (no detallada) sobre la autenticidad del contenido visual.
- Procesamiento de fotogramas individuales y, por extension, de secuencias de video mediante muestreo de frames, coherente con el pipeline `video-classification` declarado.
- Extraccion de caracteristicas visuales de alto nivel gracias al backbone EfficientNet-B5 y al modulo de atencion global.
- Integracion con el ecosistema Transformers y PyTorch mediante `custom_code`.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues, por tratarse de un modelo puramente visual.
- No se documentan capacidades de vision multimodal (VQA, captioning) ni modos especiales como thinking mode, audio o generacion de texto.

## Casos de uso

- Moderacion de contenido en plataformas: integrado como filtro previo en pipelines de subida de imagenes y videos, el modelo puede marcar contenido potencialmente sintetico para revision humana, aprovechando su backbone convolucional para procesar lotes de fotogramas a bajo coste.
- Verificacion periodistica: redacciones y equipos de fact-checking pueden usar el clasificador como primera senal de alerta ante imagenes virales sospechosas, combinando la salida del modelo con analisis forense adicional.
- Deteccion de identidades sinteticas en procesos KYC: en onboarding digital, el modelo puede analizar selfies y documentos para detectar manipulaciones faciales antes de validar la identidad.
- Analisis forense de video: muestreando frames clave de un video sospechoso, el clasificador puede agregar predicciones por fotograma para estimar la probabilidad de manipulacion de la secuencia completa.
- Investigacion academica en deteccion de deepfakes: sirve como linea base o componente de ensembles en estudios comparativos de arquitecturas CNN vs. hibridas CNN-Transformer.
- Proteccion de marcas y derechos de imagen: monitorizacion automatizada de campanas publicitarias o contenidos de terceros para detectar uso no autorizado de rostros generados sinteticamente.
- Filtrado en datasets de entrenamiento: limpieza de corpus visuales masivos eliminando imagenes sinteticas antes de reutilizarlas para entrenar otros modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 52,7 millones de parametros, los pesos en precision completa (fp32) ocupan aproximadamente 211 MB; en fp16, unos 105 MB. La VRAM real necesaria depende del tamano de entrada y del batch, pero se estima por debajo de 2 GB para inferencia en fp16 con lotes moderados.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente. Una RTX 3060 (12 GB), RTX 4060, RTX 4090 o incluso GPUs de gama de entrada con 4-6 GB pueden ejecutar el modelo. En entornos de servidor, A100 o H100 no son necesarias para este tamano, aunque pueden usarse para procesar lotes masivos.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con al menos 4 GB de VRAM.
- Opciones de despliegue: Transformers con PyTorch (requiere `trust_remote_code=True`), exportacion a ONNX o TorchScript para servir via Triton o similar. No se documenta soporte nativo en vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ms-eff-gcvit-deepfake-b5-kodf | 52,7 M | Hibrido CNN + GCViT para deteccion de deepfakes | Imagen / frames de video | MIT | Gated en Hugging Face |
| EfficientNet-B5 (timm) | ~30 M | CNN pura, clasificacion generica ImageNet | Imagen | Apache 2.0 (timm) | Publico |
| ViT-B/16 (base) | ~86 M | Transformer puro de vision | Imagen | Apache 2.0 | Publico |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada, por lo que la comparativa se limita a aspectos estructurales y de licencia.

## Limitaciones y advertencias

- No se documentan sesgos conocidos, pero al ser un clasificador visual entrenado sobre un dataset no especificado, puede heredar sesgos demograficos, de iluminacion o de calidad de imagen del corpus de entrenamiento.
- Riesgo de alucinacion en sentido estricto no aplica (no genera texto), pero si existe riesgo de falsos positivos y falsos negativos en la clasificacion, especialmente ante tecnicas de deepfake no representadas en el conjunto de entrenamiento.
- No se especifican los idiomas ni la cobertura geografica o demografica del dataset, lo que limita la evaluacion de su robustez intercultural.
- El acceso es restringido (gated): es necesario aceptar condiciones en Hugging Face antes de la descarga, lo que anade friccion a la integracion automatizada en CI/CD.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo personalizado del autor; conviene auditar el codigo antes de desplegarlo en produccion.
- La licencia MIT permite uso comercial, pero el modelo base EfficientNet-B5 de timm tiene su propia licencia (Apache 2.0 en timm), que debe respetarse en la redistribucion.
- El pipeline declarado (`video-classification`) no coincide con el tag `image-classification`; conviene validar el comportamiento real sobre video antes de asumir clasificacion de secuencias completas.
- No hay informacion publica sobre el dataset de entrenamiento ni sobre metricas de validacion, lo que impide estimar su tasa de error en dominios concretos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KoreaPeter/ms-eff-gcvit-deepfake-b5-kodf
- Modelo base en timm: https://huggingface.co/timm/tf_efficientnet_b5.ns_jft_in1k
- Dataset ImageNet-1k referenciado: https://huggingface.co/datasets/ILSVRC/imagenet-1k

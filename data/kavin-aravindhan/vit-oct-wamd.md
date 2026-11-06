# kavin-aravindhan/vit-oct-wamd

## Resumen

vit-oct-wamd es un modelo de clasificación de imágenes médicas desarrollado por Kavin Aravindhan (Columbia University) y presentado como material de soporte del artículo "Co-Annotator: Expert-Distilled ViT and VLM for Visual and Documentation Guidance in Age-Related Macular Degeneration" (UIST '26). El modelo parte del encoder visual de SigLIP (`google/siglip-so400m-patch14-384`) y se ajusta de extremo a extremo para una tarea binaria muy concreta: clasificar imágenes de tomografía de coherencia óptica (OCT) de retina, en concreto B-scans, como normales o con degeneración macular asociada a la edad (DMAE) húmeda o neovascular.

La arquitectura es un Vision Transformer de aproximadamente 400 millones de parámetros (variante so400m de SigLIP) con parches de 14×14 y resolución de entrada de 384×384 píxeles. Sobre el token CLS del encoder se aplica una única capa lineal (1152 → 2) precedida de dropout. El checkpoint incluye además una rama auxiliar de alineamiento imagen-texto basada en un encoder de texto T5-base congelado, usada solo durante el entrenamiento y descartada en inferencia.

La relevancia del modelo es acotada pero clara: demuestra el uso de un encoder vision-language de gran escala como extractor de características para una tarea clínica de nicho, con un conjunto de entrenamiento muy pequeño (112 imágenes únicas) y una receta de aumento de datos agresiva. No es un modelo generativo ni multimodal en inferencia: es un clasificador de imagen puro empaquetado como repositorio de investigación reproducible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (SigLIP so400m, patch 14, resolución 384) + cabeza lineal |
| Parametros totales | No disponible (encoder SigLIP so400m, del orden de 400 M; el checkpoint incluye además rama auxiliar T5-base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de imagen; entrada 384×384 píxeles) |
| Tipos de cuantizacion | No disponible (checkpoint en `best_model.pt`, sin versiones GGUF/ONNX publicadas) |
| Idiomas soportados | No aplica en inferencia (la rama de texto es auxiliar y no se usa) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`best_model.pt`, checkpoint completo con estado de optimizador y scheduler) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning end-to-end del encoder visual de SigLIP so400m con parches de 14×14 a 384×384. La cabeza de clasificación es una capa lineal de 1152 a 2 dimensiones con dropout (0,057) previo. Durante el entrenamiento se añade una rama auxiliar compuesta por un encoder de texto T5-base congelado y una proyección, que aporta una pérdida contrastiva imagen-texto (`siglip_loss`) mezclada con la pérdida de clasificación mediante un coeficiente alpha de 0,884. En inferencia `forward()` solo invoca `image_encoder` y `cls_head`, por lo que la rama de texto no consume cómputo.

El entrenamiento usa un conjunto de solo 112 imágenes únicas etiquetadas con subtítulos clínicos, del que se muestrean 1000 ejemplos por época con reemplazo y aumento de datos. Los hiperparámetros principales son batch size 8, learning rate 1e-4, weight decay 1,6e-6, 50 épocas con early stopping de paciencia 20, y una búsqueda de hiperparámetros Optuna de 500 trials cuyos valores quedan registrados en `training_config.json`. El dataset (`kavin-aravindhan/oct-wamd`) está alojado como repositorio privado a la espera de aprobación del IRB. El preprocesado de imagen es redimensionado a 384×384 y normalización al rango [-1, 1].

## Capacidades

- Clasificación binaria de B-scans OCT de retina: normal frente a DMAE húmeda (neovascular).
- Extracción de características visuales mediante un encoder SigLIP so400m preentrenado y ajustado.
- Salida de probabilidad por clase (el CLI muestra etiqueta y confianza; en el ejemplo de la model card, `wet_amd` con confianza 0,513).
- Inferencia sobre GPU (segundos por imagen) o CPU (15-20 s por imagen).
- No soporta generación de texto, tool calling, agentes, razonamiento multi-paso ni capacidades multimodales en inferencia.
- No soporta otros idiomas ni entradas de texto en producción: la rama de texto es solo de entrenamiento.

## Casos de uso

- Triaje asistido en consulta oftalmológica: el modelo puede preclasificar B-scans OCT como normales o sospechosos de DMAE húmeda antes de la revisión del especialista, reduciendo el tiempo de lectura en volúmenes altos de exploraciones.
- Segunda opinión en lectura de OCT: integrado en un visor de imágenes, ofrece una probabilidad de DMAE húmeda que el clínico puede contrastar con su propia valoración, útil en entornos con poca disponibilidad de retinólogos.
- Investigación en clasificación de OCT: sirve como línea base reproducible (scripts `train.py`, `infer.py`, hiperparámetros y receta de aumento incluidos) para comparar estrategias de fine-tuning de encoders vision-language en datasets pequeños.
- Docencia y formación: el demo Gradio local (`demo_app.py`) permite a residentes subir un B-scan y ver la predicción del modelo, como apoyo ilustrativo en sesiones formativas.
- Preetiquetado en pipelines de anotación: el modelo puede generar etiquetas iniciales sobre nuevos B-scans que luego se revisan y corrigen por expertos, acelerando la construcción de datasets clínicos.
- Filtrado de cohorts en estudios retrospectivos: aplicar el clasificador sobre archivos OCT para separar candidatos con posible DMAE húmeda antes de una revisión manual más costosa.
- Evaluación de encoders SigLIP en dominio médico: como caso de estudio de transferencia de un encoder preentrenado genérico a imágenes oftalmológicas con muy pocos datos etiquetados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de validación (exactitud, AUC, sensibilidad, especificidad) ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint completo ocupa ~5,1 GB; en FP32 el encoder SigLIP so400m requiere del orden de 6-8 GB de VRAM, y en FP16 aproximadamente 3-4 GB (estimación a partir del tamaño del checkpoint, no confirmada por el autor).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP32; una RTX 4090, A100 o H100 ejecutan la inferencia en segundos por imagen.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y superiores, así como en GPUs con 8 GB en FP16.
- CPU: funciona, con latencia de ~15-20 s por imagen según la model card.
- Opciones de despliegue: scripts propios del repositorio (`infer.py`, `demo_app.py` con Gradio); no se publican pesos en GGUF ni integraciones con vLLM, llama.cpp, Ollama o TGI (son herramientas para modelos de lenguaje y no aplican a este clasificador).
- Latencia y throughput: unos segundos por imagen en GPU y 15-20 s en CPU, según la model card; no se especifica throughput por lote.
- Dependencias críticas: `transformers==4.53.0` y versiones fijadas de torch y huggingface_hub; versiones más recientes pueden cambiar nombres internos de parámetros de `SiglipVisionModel` y romper la carga del state dict.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este modelo ni de alternativas comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa fiable. A modo de referencia estructural:

| Modelo | Base | Parametros | Tarea | Contexto/entrada | Licencia |
|---|---|---|---|---|---|
| vit-oct-wamd | SigLIP so400m-patch14-384 | ~400 M (encoder) | Clasificación binaria OCT (normal/DMAE húmeda) | Imagen 384×384 | MIT |
| google/siglip-so400m-patch14-384 | SigLIP | ~400 M | Vision-language zero-shot | Imagen 384×384 + texto | Apache 2.0 (según el modelo original) |
| Alternativas específicas de clasificación OCT | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Conjunto de entrenamiento muy reducido: solo 112 imágenes únicas, con 1000 muestras por época generadas por reemplazo y aumento; el riesgo de sobreajuste es alto y la generalización a otros equipos, poblaciones o protocolos de captura no está demostrada.
- Calibración dudosa: el ejemplo de la model card arroja una confianza de 0,513 para `wet_amd`, es decir, prácticamente una moneda al aire; no debe interpretarse la probabilidad como calibrada clínicamente.
- Sin métricas publicadas: no hay exactitud, AUC, sensibilidad ni especificidad en la información disponible, lo que impide evaluar su utilidad clínica.
- No es un dispositivo médico: no consta validación regulatoria (CE, FDA) ni estudios clínicos prospectivos; su uso en decisiones diagnósticas requeriría validación independiente.
- Sesgos desconocidos: no se documenta la composición demográfica del dataset ni la distribución de equipos OCT, por lo que no pueden evaluarse sesgos poblacionales o de fabricante.
- Dataset no público: el conjunto de datos está pendiente de aprobación del IRB, lo que limita la reproducibilidad completa del entrenamiento.
- Dependencias frágiles: requiere versiones fijadas de `transformers` (4.53.0) y del resto del stack; actualizar sin control rompe la carga del checkpoint.
- Checkpoint no estándar: se distribuye como `best_model.pt` con estado de optimizador y scheduler, no como safetensors ni con `config.json` de `transformers`; la carga exige los módulos `modeling.py`, `alignment.py` y `embedder.py` del repositorio.
- Rama de texto no utilizable en inferencia: el encoder T5-base incluido solo sirvió para la pérdida auxiliar de alineamiento y no aporta capacidades multimodales en producción.
- Licencia MIT: permisiva para uso comercial, pero ello no exime de las obligaciones regulatorias aplicables a software sanitario ni de las responsabilidades sobre datos de pacientes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kavin-aravindhan/vit-oct-wamd
- Modelo base: https://huggingface.co/google/siglip-so400m-patch14-384
- Dataset (acceso pendiente de IRB): https://huggingface.co/datasets/kavin-aravindhan/oct-wamd
- Paper asociado: Li, Z., Freeman, B., Raman, A., Rajkumar, K. A., Fang, X., Srivastava, R., Feiner, S., Thakoor, K. A. "Co-Annotator: Expert-Distilled ViT and VLM for Visual and Documentation Guidance in Age-Related Macular Degeneration", UIST '26 (ACM Symposium on User Interface Software and Technology).
- Referencia arXiv indicada en los tags: arxiv:2608.30352 (no verificable en la información disponible).
- Contacto del autor: kr3131@columbia.edu

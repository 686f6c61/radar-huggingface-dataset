# medarc/OpenMidnight-1.0-SPECTRA

## Resumen

OpenMidnight-1.0-SPECTRA es un modelo de extracción de características visuales para patología digital, desarrollado por MedARC en colaboración con Sophont. Se trata de un ajuste fino (finetune) del modelo base SophontAI/OpenMidnight, al que se le ha aplicado la técnica SPECTRA: un entrenamiento contrastivo sobre teselas de imagen PLISM registradas, cuyo objetivo es alinear las representaciones del mismo tejido a través de distintos escáneres y tinciones. Los pesos resultantes se fusionan directamente en el modelo completo, de modo que el artefacto publicado es autónomo y no requiere adaptadores ni checkpoints adicionales.

El modelo resuelve un problema clásico en histopatología computacional: la variabilidad de dominio entre escáneres y protocolos de tinción, que degrada el rendimiento de los modelos downstream cuando se despliegan en entornos distintos a los del entrenamiento. Al producir embeddings robustos a esa variabilidad, facilita la generalización de clasificadores y segmentadores entrenados sobre características extraídas.

Arquitectura de tipo transformer de visión (ViT) implementada en la librería timm, con aproximadamente 1.134 millones de parámetros y una salida de embeddings de 1.536 dimensiones. La entrada se procesa a 224 × 224 píxeles con normalización ImageNet. Está pensado exclusivamente para extracción de características a nivel de tesela; las predicciones a nivel de portaobjetos requieren un modelo downstream. Se distribuye bajo licencia Apache 2.0 y únicamente en inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de visión (ViT) vía timm |
| Parametros totales | 1.134.774.272 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (imagen 224 × 224 píxeles de entrada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (timm) |

## Arquitectura y entrenamiento

El modelo parte de SophontAI/OpenMidnight, un backbone de visión transformer, y se adapta mediante SPECTRA. El entrenamiento se realizó sobre teselas de imagen PLISM registradas, empleando un objetivo contrastivo que alinea las representaciones del mismo tejido capturado por distintos escáneres y con distintas tinciones. Las actualizaciones aprendidas se fusionan en los pesos completos del modelo, por lo que la inferencia no depende de adaptadores externos ni de acceso a clúster.

El preprocesado es relevante para reproducir resultados: la configuración usa `crop_pct=1.0` y `crop_mode="squash"`, de modo que la imagen completa se redimensiona directamente a 224 × 224 píxeles con interpolación bicúbica y normalización ImageNet almacenada en `config.json`. El recorte central final que genera timm es una operación nula porque la imagen ya mide 224 × 224. El embedding se obtiene del token CLS (`tokens[:, 0]`), con 1.536 dimensiones. Para decodificadores de segmentación deben excluirse los tokens CLS y de registro mediante `tokens[:, model.num_prefix_tokens:]`.

La model card advierte de un cambio de configuración respecto a versiones previas: antes se usaba `crop_pct=0.875`, que conservaba solo los 224 × 224 píxeles centrales de una tesela de 256 × 256. Emplear esas características contra una máscara de tejido completa desalinea imagen y objetivo, por lo que es necesario recargar la configuración actualizada, recalcular los embeddings en caché y reentrenar el decodificador de segmentación. Al interpolar logits de decodificador a la resolución original de la máscara puede usarse interpolación bilineal; si se redimensiona una máscara de etiquetas discretas, debe usarse vecino más cercano.

## Capacidades

- Extracción de características de imágenes histopatológicas RGB a nivel de tesela, con salida de embeddings de 1.536 dimensiones.
- Robustez a variabilidad de dominio entre escáneres y tinciones gracias al entrenamiento contrastivo SPECTRA.
- Soporte como backbone para tareas downstream de clasificación y segmentación de tejido.
- Integración nativa con timm (`timm.create_model("hf-hub:medarc/OpenMidnight-1.0-SPECTRA", pretrained=True)`).
- Inferencia en CPU o GPU (CUDA) sin dependencias de servicios externos.
- No soporta generación de texto, tool calling, agentes, razonamiento multi-paso ni modalidades de audio o vídeo.
- Capacidad multilingüe no aplicable: es un modelo de visión sin componente textual.

## Casos de uso

- Clasificación de subtipos tumorales: extraer embeddings de teselas de tejido y entrenar un clasificador ligero (regresión logística, MLP) sobre ellos; la alineación entre escáneres reduce la degradación al aplicar el clasificador a imágenes de otro centro.
- Segmentación de regiones tisulares: usar los tokens de parche como entrada a un decodificador de segmentación tipo THUNDER, interpolando los logits a la resolución original de la máscara.
- Recuperación de imágenes similares (image retrieval): indexar los embeddings de 1.536 dimensiones en una base vectorial para buscar teselas morfológicamente parecidas en cohortes grandes.
- Control de calidad de escaneo: detectar teselas atípicas o artefactos comparando sus embeddings con la distribución de referencia del conjunto de entrenamiento.
- Preentrenamiento de modelos de portaobjetos (slide-level): agregar los embeddings de tesela con mecanismos de atención múltiple para construir modelos de diagnóstico a nivel de portaobjetos.
- Análisis de robustez entre dominios: evaluar cómo varían las representaciones de la misma muestra escaneada con distintos equipos, aprovechando que el objetivo contrastivo se diseñó precisamente para minimizar esa diferencia.
- Extracción masiva de características en pipelines de investigación: procesar lotes de teselas en GPU con `torch.inference_mode()` para generar cachés de embeddings reutilizables en experimentos downstream.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 4,5 GB solo para pesos (1.134 M de parámetros × 4 bytes), más activaciones; en la práctica se recomienda al menos 8 GB para lotes pequeños.
- En fp16/bf16 los pesos ocupan unos 2,3 GB; con activaciones, 4-6 GB suelen ser suficientes para lotes moderados.
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM para inferencia en precisión reducida (RTX 3070/4060 Ti, RTX 4090); A100 o H100 para extracción masiva por lotes a gran escala.
- Cabe en GPU de consumo: sí, en modelos con 8 GB o más de VRAM; también puede ejecutarse en CPU, a costa de mayor latencia.
- Opciones de despliegue: timm con `hf-hub` (vía oficial documentada), PyTorch nativo; no se documenta soporte específico de vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos generativos de texto.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OpenMidnight-1.0-SPECTRA | 1.134 M | imagen 224 × 224 | Extracción de características histopatológicas | Apache 2.0 | Hugging Face (timm) |
| SophontAI/OpenMidnight (base) | no disponible | no disponible | Backbone de visión | no disponible | Hugging Face |
| OpenMidnight-1.1-SPECTRA | no disponible | no disponible | Extracción de características histopatológicas | no disponible | Hugging Face (versión actual recomendada por el autor) |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la información proporcionada, por lo que no es posible comparar rendimiento numérico.

## Limitaciones y advertencias

- Modelo de extracción de características: no genera texto ni predicciones diagnósticas por sí mismo; requiere un modelo downstream para clasificación o segmentación.
- Entrenado exclusivamente para teselas de histología; su uso fuera de ese dominio (radiología, imagen natural) no está validado.
- Idioma declarado: inglés; no aplica componente lingüístico.
- Riesgo de sesgo por composición del dataset PLISM: la cobertura de escáneres, tinciones y poblaciones puede no representar todos los entornos clínicos.
- La model card marca esta versión como legacy y recomienda OpenMidnight-1.1-SPECTRA para uso actual; conviene evaluar la migración.
- Cambio de configuración de preprocesado respecto a versiones previas: embeddings en caché calculados con `crop_pct=0.875` deben recalcularse para evitar desalineación con máscaras de tejido completo.
- No debe usarse como dispositivo médico ni para decisiones clínicas sin validación regulatoria y clínica independiente.
- Licencia Apache 2.0 permite uso comercial, pero no se documentan garantías ni soporte del autor.
- No se documentan opciones de cuantización ni métricas de latencia, lo que dificulta planificar despliegues con requisitos estrictos de rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/medarc/OpenMidnight-1.0-SPECTRA
- Modelo base: https://huggingface.co/SophontAI/OpenMidnight
- Versión actual recomendada: https://huggingface.co/medarc/OpenMidnight-1.1-SPECTRA
- MedARC: https://www.medarc.ai/
- Sophont: https://sophont.med/
- Paper: pendiente de publicación según la model card (no disponible)

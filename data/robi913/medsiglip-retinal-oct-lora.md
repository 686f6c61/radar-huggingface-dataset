# robi913/medsiglip-retinal-oct-lora

## Resumen

MedSigLIP-OCT es una adaptación mediante LoRA del modelo visión-lenguaje google/medsiglip-448, desarrollada por Robert-Emanuel Ardelean (Universidad Técnica de Cluj-Napoca) y publicada en el repositorio robi913/medsiglip-retinal-oct-lora. Está especializada en el análisis de tomografías de coherencia óptica (OCT) de retina, con soporte para clasificación zero-shot, clasificación supervisada (AMD, DME, DRUSEN y NORMAL), recuperación cross-modal imagen-texto y estimación de severidad inspirada en la escala AREDS.

Su aportación técnica principal es un módulo de fusión por atención cruzada bidireccional con compuertas (Gated Bidirectional Cross-Attention Fusion), que resuelve la limitación de 64 tokens por prompt del codificador de texto de SigLIP. El sistema divide los informes clínicos en dos sub-prompts (perfil estructural y perfil patológico) que se procesan por separado y se fusionan en un embedding textual unificado, alineado con el embedding visual en el mismo espacio latente. Esto permite manejar descripciones clínicas de 180-250 tokens sin truncar contexto relevante.

El modelo se distribuye como adaptadores PEFT sobre el modelo base, con un tamaño de repositorio de 7,2 GB. Es relevante porque aborda dos problemas reales de los VLM médicos: el límite de contexto del codificador textual y la necesidad de alinear morfología y biomarcadores en un único espacio de representación. No obstante, el propio autor lo clasifica como prototipo de investigación experimental, no validado clínicamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language Model de doble codificador (SigLIP, ViT SoViT-400m/14 a 448x448) con adaptadores LoRA y módulo Gated Bidirectional Cross-Attention Fusion |
| Parametros totales | No disponible (el modelo base google/medsiglip-448 no detalla cifra exacta en la información proporcionada; el codificador visual corresponde a SoViT-400m/14) |
| Longitud de contexto | 64 tokens por sub-prompt (prompt_a y prompt_b); el informe clínico completo se reparte entre ambos, sin límite único documentado para el texto agregado |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (según la model card); los metadatos de HuggingFace no especifican idiomas |
| Licencia | Health AI Developer Foundations (heredada del modelo base); términos en https://developers.google.com/health-ai-developer-foundations/terms |
| Formato de pesos | No disponible con confirmación. La model card referencia un checkpoint PyTorch (`final_with_probe.pth`), mientras que el repositorio está etiquetado como `peft`. No se documenta safetensors |
| Tamano del repositorio | 7,2 GB |
| Pipeline declarado | zero-shot-image-classification |
| Modelo base | google/medsiglip-448 |
| Fecha de creacion | 2026-09-16 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo parte del doble codificador SigLIP de google/medsiglip-448: un codificador visual ViT SoViT-400m/14 que opera a 448x448 píxeles con patches de 14x14, y un codificador de texto con un límite fijo de 64 tokens. Sobre esta base se añaden adaptadores LoRA (la librería declarada es `peft`) y una cabeza de fusión personalizada, `CrossAttentionFusion`, integrada en una envoltura `MedSigLIPMultiTask` que no forma parte de `AutoModel` estándar y debe importarse desde el código fuente del autor.

La innovación central es el mecanismo de fusión por atención cruzada bidireccional con compuertas. Los informes de OCT suelen requerir entre 180 y 250 tokens para describir simultáneamente la estructura de capas anatómicas y los biomarcadores patológicos. El framework divide el texto en `prompt_a` (perfil estructural) y `prompt_b` (perfil patológico), cada uno truncado de forma segura a 64 tokens, y los combina en un embedding textual final (t_final) proyectado en la misma esfera latente que el embedding visual (v), de modo que la similitud imagen-texto siga siendo calculable con la función de pérdida contrastiva original.

En cuanto a los datos de entrenamiento, la model card menciona una fase de expansión del dataset con etiquetas débiles o "silver labels" procedentes de detecciones de YOLOv12 con umbral de confianza 0,25, complementadas con opiniones secundarias. No se especifica el número de tokens de texto, el volumen de imágenes de OCT ni la composición exacta del dataset. Tampoco se documenta el uso de RLHF o DPO; el paradigma es de adaptación supervisada multi-tarea con alineación latente. El trabajo se asocia a dos artículos aceptados: uno sobre fusión de embeddings de texto para superar límites de tokens (CSSC UTCN 2026) y otro sobre adaptación de dominio de VLM para análisis de OCT retiniano (ICCP 2026).

## Capacidades

- Generación de embeddings alineados de imagen y texto para tomografías OCT de retina.
- Clasificación zero-shot y supervisada en cuatro categorías: AMD (degeneración macular asociada a la edad), DME (edema macular diabético), DRUSEN y NORMAL.
- Recuperación cross-modal bidireccional: imagen-a-texto (I2T) y texto-a-imagen (T2I).
- Estimación de severidad continua basada en una formulación abstracta de la escala AREDS.
- Detección multi-etiqueta de biomarcadores mediante cabezas específicas (marcadas por el autor como no validadas médicamente).
- Manejo de informes clínicos largos mediante la división en dos sub-prompts procesados por atención cruzada, superando el truncado a 64 tokens.
- Integración con herramientas de explicabilidad, concretamente EigenCAM aplicado por SVD sobre las activaciones del ViT.
- Cuantificación de incertidumbre mediante Monte Carlo Dropout.
- Idiomas: inglés, según la model card. No se documentan capacidades multilingües.
- No se documenta soporte de tool calling, function calling ni razonamiento agéntico multi-paso.

## Casos de uso

- Triaje experimental en investigación oftalmológica: el modelo puede actuar como asistente de segunda opinión sobre lotes de OCT, priorizando imágenes con mayor probabilidad de patología antes de la revisión por un especialista humano, siempre dentro de un flujo con human-in-the-loop.
- Indexación y búsqueda de bases de datos de OCT: gracias a los embeddings alineados, permite construir un índice vectorial que relacione cada tomografía con descripciones textuales, habilitando consultas del tipo "texto a imagen" sobre archivos históricos sin necesidad de etiquetas manuales.
- Etiquetado asistido de grandes volúmenes: la clasificación zero-shot en AMD, DME, DRUSEN y NORMAL facilita el preetiquetado de datasets para su posterior revisión, reduciendo el coste de anotación en cohortes de cribado.
- Estratificación de severidad en estudios longitudinales: la estimación continua inspirada en AREDS permite ordenar pacientes por gravedad estimada y analizar progresión a lo largo del tiempo, con la cautela de que la severidad está acoplada a la clase predicha.
- Análisis morfológico y de biomarcadores combinado: la fusión de dos sub-prompts permite que un único pase cubra tanto la estructura de capas retinianas como la presencia de lesiones, algo que un VLM con truncado a 64 tokens perdería en informes largos.
- Auditoría con explicabilidad en publicaciones: la combinación con EigenCAM sobre activaciones del ViT permite generar mapas de calor por clase para verificar qué regiones de la OCT sustentan la predicción, útil en validación metodológica.
- Priorización de casos inciertos: aplicando Monte Carlo Dropout, los centros de investigación pueden aislar las predicciones con mayor incertidumbre, teniendo en cuenta que el autor reporta sobreconfianza sistemática y recomienda escalado de temperatura.
- Adaptación a nuevas cohortes: al ser un adaptador LoRA sobre un modelo base público, se puede reentrenar sobre datos de otro fabricante de OCT o distinta distribución demográfica sin partir de cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye tablas con métricas como AUC, F1, precisión, recall, MMLU, HumanEval o GSM8K. Únicamente menciona de forma cualitativa la existencia de un error de calibración elevado (ECE alto) detectado mediante Monte Carlo Dropout, sin cifra concreta, y advierte de que el rendimiento en clases heterogéneas como AMD (desde drusen tempranos hasta atrofia geográfica avanzada) puede fluctuar. No se dispone de comparaciones numéricas frente a otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. A partir del tamaño del repositorio (7,2 GB) y del codificador visual SoViT-400m/14 del modelo base, se puede estimar un consumo de inferencia en fp16 en el rango de pocos gigabytes, pero se trata de una estimación no confirmada por el autor.
- GPU recomendadas: no especificadas en la información disponible. Por el orden de magnitud del modelo base, una GPU consumer de gama media-alta con 8-12 GB de VRAM (por ejemplo, RTX 3060 12 GB, RTX 4070, RTX 4080) sería presumiblemente suficiente, pero no hay validación publicada.
- Cabe en GPU consumer: probablemente sí, dado que el modelo base es un codificador SigLIP de escala media; no confirmado por el autor.
- Opciones de despliegue: al requerir las clases personalizadas `MedSigLIPMultiTask` y `CrossAttentionFusion`, el modelo no se carga con `AutoModel` estándar. Se necesita PyTorch más `transformers` (solo el procesador) e importar el código fuente del autor. No se documenta compatibilidad con vLLM, TGI, llama.cpp, Ollama ni otros servidores de inferencia al uso.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de texto | Tarea principal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| medsiglip-retinal-oct-lora | No disponible (base SoViT-400m/14 + LoRA) | 64 tokens por sub-prompt, dos sub-prompts fusionados | Clasificación y recuperación cross-modal en OCT retiniano | Health AI Developer Foundations (heredada) | HuggingFace, 0 descargas, requiere código personalizado |
| google/medsiglip-448 (modelo base) | No disponible en la información proporcionada (codificador visual SoViT-400m/14) | 64 tokens | Visión-lenguaje médica general | Health AI Developer Foundations | HuggingFace |
| Otros VLM o CLIP médicos (BiomedCLIP, MedGemma, etc.) | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento comparativo entre estas opciones, por lo que la comparación se limita a aspectos estructurales y de licencia.

## Limitaciones y advertencias

- Modelo no validado clínicamente: el propio autor declara que las cabezas de detección multi-etiqueta de biomarcadores y la estimación de severidad son prototipos de investigación y no deben usarse para diagnóstico autónomo de pacientes sin validación clínica estricta.
- Propagación del error de severidad: la puntuación de severidad está fuertemente acoplada a la clase predicha. Un error de clasificación (por ejemplo, una OCT normal clasificada como AMD) infla artificialmente la severidad estimada.
- Sobreconfianza: las evaluaciones con Monte Carlo Dropout revelan sobreconfianza sistemática con un ECE elevado, por lo que las puntuaciones de confianza brutas no deben interpretarse directamente sin escalado de temperatura.
- Etiquetas débiles: la fase de expansión del dataset empleó opiniones secundarias y "silver labels" generadas por detecciones de YOLOv12 con umbral de confianza 0,25, lo que introduce ruido en el entrenamiento de biomarcadores.
- Heterogeneidad de clases: el rendimiento en AMD puede fluctuar de forma notable porque la clase abarca desde drusen tempranos hasta atrofia geográfica avanzada.
- Limitación de contexto por diseño: cada sub-prompt se trunca a 64 tokens. Aunque la fusión amplía la cobertura efectiva, cualquier información que exceda ese límite en cualquiera de los dos sub-prompts se descarta.
- Idioma: el modelo está entrenado y documentado únicamente en inglés, lo que limita su uso directo con informes clínicos en castellano.
- Dependencia de código propietario del autor: no funciona con `AutoModel` estándar; hay que importar las clases de fusión desde el código fuente, lo que complica el despliegue y la reproducibilidad.
- Inconsistencia de formato: el repositorio se etiqueta como `peft`, pero la model card carga un checkpoint `final_with_probe.pth`, sin que se aclare si existen adaptadores LoRA en safetensors.
- Licencia restrictiva: la licencia Health AI Developer Foundations impone condiciones específicas de uso; debe revisarse el enlace de términos antes de cualquier uso comercial o clínico.
- Madurez mínima: el repositorio tiene 0 descargas y 0 likes, sin evidencia de uso en producción ni validación externa por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/robi913/medsiglip-retinal-oct-lora
- Modelo base: https://huggingface.co/google/medsiglip-448
- Términos de licencia Health AI Developer Foundations: https://developers.google.com/health-ai-developer-foundations/terms
- Artículo: "Text Embedding Cross Fusion for Overcoming Token Limits in Vision Language Models" (aceptado en CSSC UTCN 2026) - sin URL disponible en la información proporcionada
- Artículo: "Domain Adaptation of Vision-Language Models for Retinal OCT Analysis via Multi-Task Latent Alignment and Cross-Attention Fusion" (aceptado en ICCP 2026) - sin URL disponible en la información proporcionada
- Repositorio de código: no disponible públicamente en la información proporcionada
- Demos: no disponibles
- Búsqueda web: no se han encontrado enlaces relevantes; los resultados devueltos no guardan relación con el modelo

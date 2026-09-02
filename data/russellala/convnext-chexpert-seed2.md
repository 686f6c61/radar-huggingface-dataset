# RussellALA/convnext-chexpert-seed2

## Resumen

`RussellALA/convnext-chexpert-seed2` es un clasificador de radiografías de tórax (chest X-ray) de cinco hallazgos, desarrollado por RussellALA como parte de un estudio de auditoría de invariancias en modelos de visión médica. Se trata de un `facebook/convnextv2-tiny-22k-384` ajustado (fine-tuned) de extremo a extremo sobre el conjunto de datos CheXpert v1.0-small, empleando únicamente proyecciones frontales. El modelo forma parte de un par entrenado con la misma receta pero distinta semilla aleatoria; su propósito principal es permitir la reproducción del experimento que compara las invarianzas aprendidas por dos modelos idénticos en arquitectura y datos pero con distinta inicialización.

El modelo tiene 27,87 millones de parámetros y una resolución de entrada de 384×384 píxeles. Produce cinco logits independientes para las etiquetas Atelectasia, Cardiomegalia, Consolidación, Edema y Derrame pleural. No es un modelo de lenguaje: no tiene contexto textual ni capacidades generativas. Su relevancia actual reside en que sirve como sujeto de estudio en el artículo *"Show Me What You Don't Know: Efficient Sampling from Invariant Sets for Model Validation"* (Rousselot, Wendebourg y Köthe, 2026), donde se analiza qué imágenes mapean a la misma representación interna, revelando equivalencias que un radiólogo no consideraría válidas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvNeXt V2-tiny (convolucional puro, inspirado en Vision Transformers) |
| Parametros totales | 27.870.341 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no aplica (modelo de visión, sin contexto textual) |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | no aplica (no procesa lenguaje) |
| Licencia | chexpert-research-use (uso exclusivo para investigación, no comercial) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es ConvNeXt V2-tiny, una arquitectura puramente convolucional diseñada en 2022 por Liu et al. que adopta ideas de los Vision Transformers (normalización por capas, kernel grande, etc.) manteniendo la eficiencia de las CNN. Sobre esta base se realizó un fine-tuning end-to-end en CheXpert v1.0-small, limitado a vistas frontales, con una división estratificada por paciente (`StratifiedGroupKFold` agrupado en `PatientID`) para evitar fugas de datos entre entrenamiento y validación. Las imágenes se redimensionaron a 384×384 y se normalizaron con estadísticas ImageNet por canal (media 0.485, 0.456, 0.406; desviación 0.229, 0.224, 0.225). Se aplicaron aumentos de rotación (±15°) y volteo horizontal.

La función de pérdida fue Masked Asymmetric Loss (Ridnik et al., 2020) con `gamma_neg=3`, y las etiquetas inciertas (valor -1 en CheXpert) se enmascararon en lugar de imputarse. El optimizador fue AdamW con tasa de aprendizaje 1e-3, weight decay 0.02, programación coseno y 1600 pasos de calentamiento. Se entrenaron 3 épocas con batch size 16, seleccionando el mejor checkpoint según la pérdida de validación. Una particularidad relevante: el modelo fue entrenado con normalización per-channel, pero en el pipeline de auditoría del paper se usa una normalización en escala de grises colapsada (media 0.4490, desviación 0.2260) y repetición del canal tres veces; la distancia de probabilidad entre ambas convenciones es de solo 0.0016%, lo que indica una sensibilidad muy baja a este cambio.

## Capacidades

- Clasificación multi-etiqueta de radiografías de tórax: produce logits independientes para Atelectasia, Cardiomegalia, Consolidación, Edema y Derrame pleural.
- Inferencia sobre imágenes de 384×384 píxeles, con normalización ImageNet estándar.
- Acepta tanto imágenes RGB como, mediante el wrapper del paper, imágenes de un solo canal repetidas a tres canales (con normalización adaptada).
- Integración sencilla con `transformers` mediante `AutoModelForImageClassification`.
- No dispone de tool calling, razonamiento multi-paso, generación de texto ni capacidades multimodales más allá de la imagen.
- No está calibrado: las etiquetas inciertas se enmascararon durante el entrenamiento, por lo que el modelo no aprende a expresar incertidumbre.

## Casos de uso

- Reproducción de auditorías de invarianza: el modelo es el sujeto de estudio del paper asociado; puede usarse para reproducir los experimentos de muestreo de fibras (conjuntos de imágenes que producen la misma representación) y comparar con el seed 1.
- Investigación en interpretabilidad de modelos médicos: analizar qué patrones visuales considera equivalentes el modelo puede revelar sesgos o atajos (shortcuts) en el aprendizaje.
- Desarrollo de métodos de validación de modelos: sirve como caso de prueba para técnicas que buscan identificar imágenes que el modelo clasifica de forma incorrecta pero con alta confianza.
- Benchmark de clasificación de hallazgos torácicos: aunque no es un modelo clínico, puede usarse como referencia académica para comparar arquitecturas en el subconjunto de cinco hallazgos de CheXpert.
- Estudio de robustidad ante cambios de normalización: la sensibilidad medida entre las dos convenciones (per-channel vs. escala de grises) permite investigar el efecto de preprocesados alternativos.
- Formación en visión por computador médica: como ejemplo de fine-tuning de un modelo preentrenado de propósito general sobre un dominio específico, con una receta de entrenamiento documentada y reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que el paper reporta la pérdida de fibra (fiber loss) y una línea base de vecino más cercano en su Tabla 5, así como la concordancia entre este modelo y su gemelo seed 1 en la Figura 18, pero no se proporcionan valores numéricos concretos. Tampoco se indican métricas de AUROC, exactitud ni otras medidas de rendimiento diagnóstico.

## Requisitos de hardware

- VRAM estimada: menos de 1 GB en fp32 (el modelo tiene 27,87 M de parámetros, ~111 MB en fp32); en fp16 ocuparía ~56 MB.
- GPU recomendada: cualquier GPU con al menos 2 GB de VRAM; una RTX 3060 o superior es más que suficiente. También puede ejecutarse en CPU con tiempos de inferencia aceptables (del orden de decenas de milisegundos por imagen).
- Compatible con GPUs consumer: sí, sin restricciones.
- Opciones de despliegue: `transformers` (inferencia directa), ONNX Runtime, TorchScript. No se documentan integraciones con vLLM, llama.cpp u Ollama por ser un modelo de visión.
- Latencia y throughput: no se proporcionan mediciones oficiales; para una sola imagen en GPU moderna se espera una latencia inferior a 10 ms.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de clasificación de radiografías de tórax en la información proporcionada. El propio autor publica dos modelos relacionados: `RussellALA/convnext-chexpert-seed1` (misma receta, distinta semilla) y `RussellALA/biomedclip-chexpert` (basado en BiomedCLIP), pero no se ofrecen especificaciones numéricas de estos ni resultados comparativos. Por tanto, no es posible elaborar una comparativa con datos concretos.

## Limitaciones y advertencias

- No es un dispositivo diagnóstico: está expresamente indicado como artefacto de investigación y no debe usarse para decisiones clínicas ni con pacientes.
- Entrenado en un único centro hospitalario (Stanford Hospital) y con una resolución de 384×384, lo que limita su generalización a otras instituciones y equipos de adquisición.
- Solo cubre cinco de los catorce hallazgos de CheXpert; no detecta otras patologías relevantes.
- La auditoría del paper concluye que el modelo asigna la misma representación a imágenes que un radiólogo consideraría diferentes, lo que indica invarianzas potencialmente peligrosas para uso clínico.
- Las etiquetas inciertas se enmascararon, por lo que el modelo no expresa incertidumbre y sus salidas no están calibradas.
- Hereda los sesgos demográficos y de adquisición presentes en CheXpert (población mayoritariamente de un solo centro, distribución de edades y sexos no controlada).
- Licencia restrictiva: uso exclusivo para investigación no comercial; los pesos se consideran derivados de CheXpert y están sujetos al acuerdo de uso de Stanford.
- Las imágenes originales no se redistribuyen; deben solicitarse a Stanford.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RussellALA/convnext-chexpert-seed2
- Modelo compañero seed 1: https://huggingface.co/RussellALA/convnext-chexpert-seed1
- Modelo compañero BiomedCLIP: https://huggingface.co/RussellALA/biomedclip-chexpert
- Código del estudio de auditoría: https://github.com/vislearn/InvarianceAuditing
- Paper (arXiv): https://arxiv.org/abs/2603.21782
- Página oficial de CheXpert (Stanford): https://stanfordmlgroup.github.io/competitions/chexpert/
- Documentación de ConvNeXt en transformers: https://github.com/huggingface/transformers/blob/main/docs/source/en/model_doc/convnext.md

# 1aurent/resnext101_32x8d.tiatoolbox-kather100k

## Resumen

`resnext101_32x8d.tiatoolbox-kather100k` es un modelo de clasificación de imágenes de patología digital desarrollado por el Tissue Image Analytics (TIA) Centre de la Universidad de Warwick. Se trata de un ResNeXt-D preentrenado y ajustado sobre el conjunto de parches histológicos kather100k (también conocido como NCT-CRC-HE), compuesto por 100.000 parches de 224 x 224 píxeles procedentes de imágenes de tejido colorectal teñido con H&E. El modelo se distribuye a través de Hugging Face con la librería `timm` y forma parte del ecosistema TIAToolbox.

El modelo resuelve la tarea de clasificación de tejido histológico en ocho clases (tejido adiposo, fondo, debris, linfocitos, mucosa, músculo liso, tejido normal y estroma), así como la extracción de embeddings para tareas downstream como búsqueda por similitud, clustering o entrenamiento de clasificadores con menos datos. Con 87 millones de parámetros y pesos en formato safetensors, es lo bastante pequeño para ejecutarse en GPUs de consumo, lo que lo hace útil en flujos de trabajo de investigación en patología computacional.

Su relevancia actual radica en que proporciona una línea base reproducible y abierta (licencia CC BY 4.0) para tareas de análisis de imágenes de cáncer colorrectal, integrándose de forma nativa con TIAToolbox, una librería de referencia en el campo. No es un modelo generativo ni multimodal: es un clasificador/backbone de visión especializado en un dominio biomédico concreto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ResNeXt-D (CNN con bloques residuales agrupados) |
| Parámetros totales | 86.963.657 (87,0 M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, entrada de 224 x 224 x 3) |
| Tipos de cuantización | no disponible en la información proporcionada |
| Idiomas soportados | no aplica (modelo de imagen) |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors (compatible con `timm`) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura ResNeXt-D, una variante de ResNet que sustituye las convoluciones estándar por convoluciones agrupadas (grouped convolutions) con cardinalidad 32 y ancho de 8, de ahí el sufijo `32x8d`. Esta configuración incrementa la capacidad representacional sin disparar el coste computacional en la misma proporción que un aumento equivalente de profundidad o anchura. La entrada es una imagen RGB de 224 x 224 píxeles y la salida, según el modo de uso, es un vector de logits de clasificación o un vector de características (con `num_classes=0`).

El ajuste fino se realizó sobre el conjunto kather100k / NCT-CRC-HE, formado por parches de 224 x 224 extraídos de imágenes de tejido colorrectal teñido con hematoxilina y eosina (H&E). El modelo card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de aumento de datos, regularización específica o ajuste con RLHF/DPO (no aplicable en clasificación). Tampoco se documenta si hubo una fase de preentrenamiento en ImageNet previa al ajuste en kather100k, aunque es lo habitual en los modelos `timm`. No se describen innovaciones técnicas adicionales como decodificación especulativa o atención lineal, por tratarse de una CNN estándar.

## Capacidades

- Clasificación de parches histológicos en ocho clases de tejido colorrectal (adiposo, fondo, debris, linfocitos, mucosa, músculo liso, tejido normal y estroma).
- Extracción de embeddings de imagen (feature backbone) mediante `num_classes=0`, útil para tareas downstream.
- Integración con TIAToolbox para pipelines de patología digital.
- Compatible con `timm.create_model` y con el resolvedor automático de transformaciones (`resolve_model_data_config`).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de capacidades multilingües (no procesa texto).
- No dispone de modo "thinking", visión general, audio ni otras modalidades fuera de la imagen RGB.
- Específico de dominio: no es un modelo de propósito general.

## Casos de uso

- Clasificación de tejido en pipelines de investigación en cáncer colorrectal: el modelo clasifica parches de 224 x 224 en las ocho clases de kather100k, lo que permite segmentar y cuantificar la composición tisular de portaobjetos completos (WSI) cuando se combina con herramientas de teselado como las de TIAToolbox.
- Extracción de características para búsqueda por similitud: usando el modelo como backbone con `num_classes=0`, se generan embeddings que alimentan índices vectoriales para recuperar parches histológicamente similares en grandes archivos de imágenes.
- Entrenamiento de clasificadores con pocas etiquetas: los embeddings congelados sirven como entrada a clasificadores lineales o modelos ligeros, reduciendo el coste de anotación en nuevos conjuntos de patología.
- Control de calidad de tejido: la clase "fondo" y "debris" permite filtrar parches no informativos antes de análisis downstream, evitando ruido en pipelines de segmentación o detección.
- Análisis de infiltración linfocitaria: la clase "linfocitos" facilita la cuantificación aproximada de densidad de células inmunes en el microambiente tumoral, un biomarcador relevante en inmuno-oncología.
- Docencia y reproducibilidad en patología computacional: al ser un modelo abierto con licencia CC BY 4.0 y código de ejemplo en la model card, sirve como línea base reproducible para comparar nuevos métodos en publicaciones.
- Preprocesado en pipelines de investigación clínica: integrado en TIAToolbox, el modelo puede formar parte de flujos end-to-end que van de la lectura de WSI a la generación de mapas de tejido, con la ventaja de ejecutarse en GPUs modestas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4-0,6 GB en FP32 para un lote pequeño (87 M parámetros x 4 bytes ≈ 348 MB de pesos, más activaciones y overhead); en FP16 aproximadamente la mitad.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funcionan correctamente RTX 3060, RTX 4090, A100, H100 y GPUs integradas de gama media para lotes pequeños.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs consumer actuales (GTX 1650 en adelante), así como en CPU para inferencia puntual.
- Opciones de despliegue: `timm` (vía `timm.create_model`), TIAToolbox, exportación a TorchScript/ONNX (no documentada en la model card pero viable por ser una CNN estándar); no se documenta soporte nativo para vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `1aurent/resnext101_32x8d.tiatoolbox-kather100k` | 87,0 M | 224 x 224 x 3 | Clasificación de parches histológicos (8 clases) | CC BY 4.0 | Hugging Face, vía `timm` |
| ResNet-50 (línea base genérica en patología) | ~25,6 M | 224 x 224 x 3 | Clasificación / backbone | variable según pesos | Amplia |
| Modelos tipo ViT-B/16 ajustados en patología | ~86 M | 224 x 224 x 3 | Clasificación / backbone | variable | Amplia |
| Otros modelos de TIAToolbox sobre kather100k | variable | 224 x 224 x 3 | Clasificación de parches | CC BY 4.0 | Hugging Face (organización 1aurent) |

La comparación cuantitativa de rendimiento entre estos modelos no está disponible en la información proporcionada. La ventaja principal del modelo descrito frente a alternativas genéricas es su ajuste específico al dominio histológico y su integración con TIAToolbox; su limitación es que solo cubre ocho clases de tejido colorrectal.

## Limitaciones y advertencias

- Sesgos de dominio: entrenado exclusivamente con parches de tejido colorrectal teñido con H&E; su rendimiento puede degradarse en otros órganos, otras tinciones (IHC, PAS) o distintos escáneres y protocolos de laboratorio.
- Riesgo de alucinación en sentido amplio: como clasificador, puede asignar clases con alta confianza a parches ambiguos o fuera de distribución; no proporciona estimaciones de incertidumbre calibradas de forma explícita.
- Limitaciones de contexto: la entrada es fija a 224 x 224 píxeles; no procesa portaobjetos completos de forma nativa, requiere teselado previo.
- Limitaciones de idioma: no aplica, pero conviene subrayar que no procesa texto ni metadatos clínicos.
- Restricciones de licencia: CC BY 4.0 permite uso comercial con atribución; es obligatorio citar al autor y la licencia en trabajos derivados.
- Caveat para producción: no es un dispositivo médico ni está validado clínicamente; su uso en entornos asistenciales requiere validación regulatoria independiente.
- Mantenimiento: el repositorio tiene pocas descargas (149) y ningún "like", lo que sugiere una comunidad reducida y menor probabilidad de soporte activo.
- No se documentan métricas de calibración, robustez frente a artefactos de tinción ni evaluación en cohortes externas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/1aurent/resnext101_32x8d.tiatoolbox-kather100k
- Repositorio TIAToolbox: https://github.com/TissueImageAnalytics/tiatoolbox
- Documentación de TIAToolbox: https://tia-toolbox.readthedocs.io/
- Dataset kather100k / NCT-CRC-HE (referencia en TIAToolbox): https://tia-toolbox.readthedocs.io/en/latest/_autosummary/tiatoolbox.models.dataset.info.KatherPatchDataset.html
- Artículo de TIAToolbox (Communications Medicine, 2022): https://www.nature.com/articles/s43856-022-00186-5
- DOI del artículo: https://doi.org/10.1038/s43856-022-00186-5
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/legalcode
- Centro TIA (Universidad de Warwick): https://warwick.ac.uk/fac/cross_fac/tia/
- Repositorio HistoSSLscaling (imagen de ejemplo usada en la model card): https://github.com/owkin/HistoSSLscaling

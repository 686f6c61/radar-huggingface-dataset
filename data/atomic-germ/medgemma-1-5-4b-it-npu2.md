# Atomic-Germ/medgemma-1.5-4b-it-NPU2

## Resumen

MedGemma 1.5 4B es un modelo multimodal desarrollado por Google, diseñado específicamente para el ámbito sanitario. Combina un encoder de imágenes SigLIP preentrenado con datos médicos (radiografías de tórax, dermatología, oftalmología, histopatología) y un modelo de lenguaje basado en la arquitectura Gemma 3. Está disponible en su variante 4B, orientada a tareas de comprensión de texto e imágenes médicas, y se distribuye bajo la licencia Health AI Developer Foundations.

Este modelo resuelve el problema de adaptar modelos generativos de propósito general a dominios médicos especializados, donde se requiere conocimiento de terminología clínica, interpretación de imágenes radiológicas y razonamiento sobre datos de historias clínicas. La versión 1.5 amplía las capacidades de su predecesor con soporte para imágenes tridimensionales (CT/MRI), análisis de diapositivas completas de histopatología, comparación temporal de radiografías de tórax y localización anatómica mediante cuadros delimitadores. Con una ventana de contexto de 128.000 tokens y generación de hasta 8.192 tokens, permite procesar documentos médicos largos y secuencias de imágenes.

Es relevante porque ofrece un punto de partida sólido para desarrolladores que construyen aplicaciones de IA en salud, con la posibilidad de afinar el modelo para casos de uso concretos. Sin embargo, no está optimizado para conversaciones multiturno y su sensibilidad al prompt requiere ajustes cuidadosos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only transformer con atención grouped-query (basado en Gemma 3) y encoder de imágenes SigLIP |
| Parametros totales | 4.000 millones (4B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens (contexto total), generación de hasta 8.192 tokens |
| Tipos de cuantizacion | No disponible (el repositorio no especifica cuantizaciones; se espera compatibilidad con formatos estándar como FP16, BF16, INT8, INT4 mediante herramientas de cuantización) |
| Idiomas soportados | No disponible (no se indica en la documentación; el modelo base Gemma 3 soporta múltiples idiomas, pero no se especifica para MedGemma) |
| Licencia | Health AI Developer Foundations (términos de uso específicos, acceso restringido mediante aceptación de licencia) |
| Formato de pesos | safetensors (repo de 4.8 GB, compatible con transformers) |

## Arquitectura y entrenamiento

MedGemma 1.5 4B se basa en la arquitectura de Gemma 3, un transformer decoder-only con atención grouped-query para reducir la memoria de la caché de atención. El encoder de imágenes es un SigLIP pre-entrenado específicamente con datos médicos deidentificados, incluyendo chest X-rays, imágenes de dermatología, oftalmología y diapositivas de histopatología. El componente de lenguaje se entrena sobre una amplia variedad de datos médicos: textos clínicos, pares de pregunta-respuesta médica, registros de salud electrónicos en formato FHIR, imágenes radiológicas 2D y 3D, histopatología, oftalmología, dermatología e informes de laboratorio para comprensión documental. No se detalla el número exacto de tokens de entrenamiento ni el uso de RLHF/DPO, aunque se indica que la adaptación a instrucciones (instruction tuning) forma parte del proceso. La versión 1.5 incorpora capacidades adicionales de imagen de alta dimensión (volúmenes CT/MRI, múltiples parches de histopatología), análisis longitudinal de chest X-ray, localización anatómica mediante bounding boxes y extracción de datos estructurados de informes médicos.

## Capacidades

- Generación de texto médico y razonamiento clínico sobre consultas de texto.
- Comprensión de imágenes médicas 2D estándar (chest X-ray, dermatología, oftalmología, histopatología).
- Procesamiento de imágenes de alta dimensión: interpretación de volúmenes 3D de CT y MRI (entrada de múltiples cortes).
- Análisis de diapositivas completas de histopatología (whole-slide imaging, WSI) mediante la interpretación simultánea de múltiples parches.
- Comparación temporal de chest X-rays (análisis longitudinal, comparación de imágenes actuales con históricas).
- Localización anatómica mediante bounding boxes para hallazgos en chest X-rays.
- Comprensión de documentos médicos: extracción de valores y unidades de informes de laboratorio no estructurados.
- Interpretación de registros de salud electrónicos (EHR) basados en texto (FHIR).
- Soporte de entrada multimodal (imagen + texto) y generación de texto (no genera imágenes).
- No está optimizado para aplicaciones multiturno (conversaciones largas), según la documentación oficial.

## Casos de uso

- **Asistencia al diagnóstico radiológico**: el modelo puede interpretar una radiografía de tórax y proporcionar un informe descriptivo de hallazgos, ayudando a radiólogos en tareas de cribado o como segunda opinión.
- **Análisis longitudinal de pacientes**: al poder comparar chest X-rays de diferentes momentos, puede señalar la evolución de una enfermedad (p. ej., progresión de neumonía o evaluación de respuesta a tratamiento).
- **Histopatología digital**: en patología, el modelo procesa diapositivas completas para identificar regiones de interés o clasificar patrones histológicos, facilitando la revisión de biopsias.
- **Triaje en dermatología**: a partir de una imagen de una lesión cutánea y una breve descripción clínica, el modelo puede sugerir diagnósticos diferenciales o derivar a especialistas.
- **Extracción de datos de informes de laboratorio**: automatiza la conversión de informes de laboratorio no estructurados en datos estructurados (valores, unidades, rangos) para su integración en sistemas de gestión hospitalaria.
- **Resúmenes de historias clínicas**: interpreta registros electrónicos (EHR) y genera resúmenes clínicos concisos para la consulta rápida del profesional.
- **Educación médica**: como herramienta de simulación para estudiantes, generando explicaciones sobre casos clínicos basados en imágenes y texto.
- **Desarrollo de agentes de salud**: al integrarse con herramientas de tool calling (si se añade mediante afinamiento), puede servir de base para asistentes virtuales que consulten bases de datos médicas o generen alertas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La documentación oficial menciona que el modelo ha sido evaluado en una serie de benchmarks clínicos (open y internos), pero no se detallan las cifras en la documentación accesible. El informe técnico (arXiv:2604.05081) podría contener datos, pero no se incluyen en la información proporcionada. Por tanto, no se presentan tablas comparativas.

## Requisitos de hardware

- **VRAM estimada para inferencia**: para un modelo de 4B en FP16/BF16 se requieren aproximadamente 8-10 GB de VRAM (incluyendo overhead de atención y caché). Con cuantización de 4 bits, puede reducirse a unos 4-5 GB.
- **GPU recomendadas**: tarjetas de consumo como RTX 3090/4090 (24 GB) o RTX 4080 (16 GB) son suficientes para inferencia en FP16. Para despliegue con contexto largo (128K), se necesita más memoria para la caché KV, por lo que se recomienda GPU con 24 GB o más, o usar cuantización.
- **¿Cabe en GPU consumer?** Sí, en la mayoría de las GPU modernas con 8 GB o más, especialmente con cuantización de 4 bits.
- **Opciones de despliegue**: compatible con la librería transformers (HuggingFace) para inferencia local; puede desplegarse con vLLM, TensorRT-LLM o llama.cpp (si se convierte a GGUF). No se menciona soporte nativo de Ollama, pero es posible mediante conversión.
- **Latencia y throughput**: no disponibles; dependerán del hardware y la optimización. Con una RTX 4090, una generación de 512 tokens puede tardar entre 2 y 5 segundos aproximadamente, pero esto es una estimación general basada en modelos de tamaño similar.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Diferencias clave |
|---|---|---|---|---|
| MedGemma 1.5 4B (este) | 4B | 128K | Health AI Developer Foundations (restringida) | Capacidades avanzadas de imagen médica 3D, WSI, longitudinal, localización anatómica. |
| MedGemma 1 4B | 4B | 128K | Health AI Developer Foundations | Versión anterior, sin soporte para imágenes 3D ni WSI, menor precisión en razonamiento médico. |
| Gemma 3 4B (base) | 4B | 128K | Apache 2.0 | Modelo generalista, sin especialización médica ni encoder de imágenes médicas. |

La comparativa muestra que MedGemma 1.5 4B es una evolución de MedGemma 1 con nuevas funcionalidades, mientras que Gemma 3 es el modelo base sin adaptación médica. No hay modelos comparables de código abierto con capacidades médicas multimodales tan específicas en el mismo rango de tamaño.

## Limitaciones y advertencias

- **Sensibilidad al prompt**: según la documentación, el modelo puede ser más sensible al prompt que Gemma 3; pequeños cambios en la formulación pueden afectar la respuesta.
- **No optimizado para multiturno**: la documentación indica que no ha sido evaluado ni optimizado para aplicaciones de múltiples turnos de conversación.
- **Sesgos y alucinaciones**: como cualquier modelo de lenguaje, puede generar contenido incorrecto o inventado; en el ámbito médico esto es especialmente crítico y requiere validación clínica.
- **Licencia restrictiva**: el uso está sujeto a los términos de Health AI Developer Foundations, que incluyen restricciones para aplicaciones médicas y responsabilidad; no es una licencia de código abierto convencional (no Apache).
- **Idiomas**: no se especifican idiomas soportados; es probable que esté optimizado principalmente para inglés médico, aunque puede funcionar en otros idiomas con menor rendimiento.
- **Datos de entrenamiento**: no se detalla la composición completa del dataset ni la proporción de datos en español; se recomienda afinar con datos específicos del dominio para uso en producción.
- **Uso comercial**: revisar los términos de la licencia Health AI Developer Foundations antes de cualquier uso comercial; se exige cumplimiento de normativas sanitarias locales.

## Enlaces

- Modelo original en Hugging Face: [google/medgemma-1.5-4b-it](https://huggingface.co/google/medgemma-1.5-4b-it)
- Repositorio de Google Health: [GitHub](https://github.com/google-health/medgemma)
- Documentación de MedGemma: [Google Health AI Developer Foundations](https://developers.google.com/health-ai-developer-foundations/medgemma)
- Technical report: [arXiv:2604.05081](https://arxiv.org/pdf/2604.05081)
- Colección de modelos MedGemma en HF: [Collection](https://huggingface.co/collections/google/medgemma-release-680aade845f90bec6a3f60c4)
- Model Garden (Vertex AI): [https://console.cloud.google.com/vertex-ai/publishers/google/model-garden/medgemma](https://console.cloud.google.com/vertex-ai/publishers/google/model-garden/medgemma)
- Repo de la variante NPU2 (este repo): [https://huggingface.co/Atomic-Germ/medgemma-1.5-4b-it-NPU2](https://huggingface.co/Atomic-Germ/medgemma-1.5-4b-it-NPU2)

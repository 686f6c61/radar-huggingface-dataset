# mradermacher/Noir-0.8B-ja-en-GGUF

## Resumen

Noir-0.8B-ja-en es un modelo de lenguaje de aproximadamente 1.000 millones de parámetros (1.006.672.704 pesos en safetensors) desarrollado por catsaiagency, especializado en la detección de información personal identificable (PII), enmascaramiento y anonimización de texto. Está entrenado específicamente para el par de idiomas japonés-inglés, lo que lo hace relevante para pipelines de protección de datos en entornos bilingües donde los modelos genéricos suelen fallar al identificar entidades japonesas (nombres, direcciones, números de teléfono, identificadores corporativos).

La versión aquí descrita es una cuantización GGUF publicada por mradermacher, que facilita el despliegue en CPU y GPU de consumo mediante llama.cpp y herramientas compatibles. El repositorio incluye cuantizaciones estáticas desde Q2_K hasta f16, además de ficheros mmproj que sugieren soporte multimodal en el modelo base, aunque la model card no detalla las capacidades de visión.

Por su tamaño reducido y su enfoque vertical (PII masking ja/en), el modelo se posiciona como una alternativa ligera y desplegable en local frente a soluciones basadas en APIs de terceros o modelos mucho mayores, a costa de una menor generalidad y de una licencia personalizada (catsai-model-license) que conviene revisar antes de un uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformers; pesos en safetensors y GGUF) |
| Parámetros totales | 1.006.672.704 (~1,0 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; además mmproj-f16 y mmproj-Q8_0 (suplemento multimodal) |
| Idiomas soportados | ja, en |
| Licencia | catsai-model-license (other); enlace a MODEL-LICENSE.md en el repo base |
| Formato de pesos | GGUF (esta versión); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base catsaiagency/Noir-0.8B-ja-en en la documentación proporcionada: no se especifica si es un transformer decoder-only estándar, ni el número de capas, dimensión oculta o cabezas de atención. El recuento de parámetros (1.006.672.704) y el tamaño del repo (9,9 GB, incluyendo todas las cuantizaciones) son los únicos datos estructurales disponibles. La presencia de ficheros mmproj en la distribución GGUF indica que el modelo base incorpora algún componente multimodal, presumiblemente visión, aunque su naturaleza exacta no está documentada.

Tampoco se detallan los datos de entrenamiento: no hay información sobre el número de tokens, la composición del corpus (más allá de que cubre japonés e inglés), ni sobre si se aplicaron técnicas de alineación como RLHF, DPO o instruction tuning supervisado. La model card del repositorio GGUF es únicamente una ficha de cuantización generada por mradermacher y no reproduce la documentación técnica del modelo original.

La innovación principal de esta publicación no reside en el modelo en sí, sino en la distribución: cuantizaciones estáticas generadas con llama.cpp que permiten ejecutar un modelo de 1 B en hardware modesto, con tamaños que van desde 0,6 GB (Q2_K) hasta 2,1 GB (f16). El autor indica que no hay cuantizaciones con imatrix/weighted disponibles en el momento de la publicación.

## Capacidades

- Detección de PII en texto japonés e inglés: identificación de entidades personales (nombres, direcciones, teléfonos, correos, identificadores) según los tags del modelo.
- Enmascaramiento y anonimización: sustitución o redacción de entidades sensibles en documentos.
- Procesamiento bilingüe ja-en: cubre texto en japonés, en inglés y presumiblemente mezclas de ambos.
- Posible soporte multimodal: la presencia de ficheros mmproj sugiere entrada de imágenes, aunque la naturaleza exacta (visión, OCR u otra) no está documentada.
- Conversacional: la etiqueta `conversational` en los metadatos indica formato de chat, aunque no se detalla la plantilla.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere despliegue vía Inference Endpoints de Hugging Face.
- No se documentan capacidades de tool calling, function calling, agentes ni modo de razonamiento extendido (thinking).

## Casos de uso

- Anonimización de registros médicos bilingües: el modelo puede procesar historiales en japonés e inglés para enmascarar nombres de pacientes, direcciones y números de identificación antes de almacenarlos o compartirlos con terceros, aprovechando su entrenamiento específico en PII para ambos idiomas.
- Cumplimiento de RGPD y APPI en pipelines de datos: integración en procesos ETL que ingieren texto de formularios o correos y deben redactar datos personales antes de persistirlos, con despliegue local en CPU mediante llama.cpp para evitar enviar datos sensibles a APIs externas.
- Preprocesado de datasets para entrenamiento: limpieza de corpus ja-en (foros, reseñas, soporte técnico) eliminando PII antes de usarlos en el entrenamiento de otros modelos, reduciendo el riesgo de memorización de datos personales.
- Redacción de documentos legales y contractuales: enmascaramiento de nombres de partes, direcciones y números de registro en contratos bilingües antes de su publicación o revisión por terceros.
- Moderación y privacidad en atención al cliente: filtrado en tiempo real de conversaciones de chat (japonés/inglés) para detectar y ocultar datos personales antes de que se registren en logs o se envíen a sistemas analíticos.
- Sanitización de logs de aplicaciones: procesamiento por lotes de trazas y mensajes de error que puedan contener correos, IPs o identificadores de usuario, ejecutándose en el mismo servidor de aplicaciones gracias a su huella de memoria reducida (Q4_K_M ~0,8 GB).
- Investigación en privacidad diferencial: uso como componente de anonimización en estudios que requieren compartir corpus ja-en con la comunidad sin exponer información personal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6 GB (Q2_K) hasta 1,2 GB (Q8_0) para los pesos; con overhead de contexto, entre 1 y 2 GB en la mayoría de configuraciones prácticas. La versión f16 requiere unos 2,1 GB solo para pesos.
- GPU recomendadas: cualquier GPU con 2 GB o más de VRAM es suficiente para las cuantizaciones Q4/Q5; una RTX 3060, RTX 4060 o superior ofrece margen holgado. En entornos de servidor, una T4, L4 o A10 bastan para despliegues concurrentes.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna (GTX 1650 4 GB en adelante) e incluso en iGPU con memoria compartida para cuantizaciones bajas.
- Despliegue en CPU: viable con llama.cpp, Ollama o LM Studio; el modelo de 1 B en Q4_K_M ocupa menos de 1 GB y puede ejecutarse en portátiles sin GPU dedicada.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python; también es compatible con Inference Endpoints de Hugging Face según los tags. Para el modelo base en safetensors, transformers con PyTorch.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Por el tamaño, se espera un throughput alto en GPU y decenas de tokens por segundo en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| Noir-0.8B-ja-en (este) | ~1,0 B | no disponible | ja, en | catsai-model-license | PII masking / anonimización |
| Qwen2.5-0.5B / 1.5B | 0,5 B / 1,5 B | 32 K (familia Qwen2.5) | multilingüe | Apache 2.0 (Qwen2.5-0.5B/1.5B) | propósito general |
| Llama 3.2 1B | 1,2 B | 128 K | multilingüe | Llama 3.2 Community License | propósito general |
| Gemma 2 2B | 2,6 B | 8 K | multilingüe | Gemma Terms of Use | propósito general |

La comparación con modelos de propósito general es orientativa: Noir está especializado en PII ja-en, tarea en la que los modelos genéricos de tamaño similar suelen rendir peor sin fine-tuning específico. No se dispone de datos de benchmarks que permitan una comparación cuantitativa de rendimiento en tareas de anonimización.

## Limitaciones y advertencias

- Licencia personalizada (catsai-model-license): es imprescindible revisar MODEL-LICENSE.md antes de cualquier uso comercial; no es una licencia open source estándar y puede imponer restricciones adicionales.
- Sesgos conocidos: no documentados en la información disponible; al estar entrenado en ja-en, puede tener sesgos culturales y lingüísticos propios de esos corpus.
- Riesgo de alucinación: como todo modelo generativo, puede producir enmascaramientos incorrectos o pasar por alto entidades PII, especialmente en dominios no cubiertos por su entrenamiento; no debe usarse como único mecanismo de cumplimiento normativo sin validación humana.
- Limitaciones de idioma: solo japonés e inglés; el rendimiento en otros idiomas (incluido el español) no está garantizado.
- Contexto: no se ha publicado la longitud de contexto, lo que dificulta planificar su uso en documentos largos; conviene validar empíricamente el comportamiento en entradas extensas.
- Multimodalidad no documentada: la presencia de mmproj sugiere visión, pero no hay especificaciones sobre resolución, tipo de imágenes o tareas soportadas.
- Sin benchmarks publicados: no hay evidencia cuantitativa de precisión, recall o F1 en tareas de detección de PII, lo que obliga a evaluar el modelo en el dominio concreto antes de producción.
- Cuantizaciones estáticas: el autor advierte que no hay versiones con imatrix; las cuantizaciones de 2-3 bits pueden degradar la precisión en una tarea sensible como la detección de entidades.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema limitado, poca validación comunitaria y soporte incierto a largo plazo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Noir-0.8B-ja-en-GGUF
- Modelo base: https://huggingface.co/catsaiagency/Noir-0.8B-ja-en
- Licencia del modelo base: https://huggingface.co/catsaiagency/Noir-0.8B-ja-en/blob/main/MODEL-LICENSE.md
- Página de descargas del cuantizador: https://hf.tst.eu/model#Noir-0.8B-ja-en-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (README de referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9

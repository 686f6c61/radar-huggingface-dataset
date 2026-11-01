# cstr/OXR-1.0-DFINE-layout-GGUF

## Resumen
OXR-1.0-DFINE-layout-GGUF es una conversión a formato GGUF del detector de layout que forma parte de la pipeline documental OXR-1.0, desarrollada por SoMark Team y redistribuida por el usuario cstr para el runtime nativo ggml de CrispEmbed. No es un modelo de lenguaje: es un detector de objetos D-FINE (arquitectura de detección basada en transformers) especializado en análisis de layout de documentos, es decir, localizar y clasificar regiones como bloques de texto, tablas, figuras o encabezados sobre una página escaneada.

El modelo resuelve la etapa de segmentación estructural dentro de una pipeline OCR, previa al reconocimiento de texto que realiza el modelo hermano cstr/OXR-1.0-GGUF. Con 19.517.482 parámetros y un único fichero F32 de 78 MB, es un componente ligero pensado para ejecutarse en CPU junto al resto de la pipeline documental.

Su relevancia es doble: por un lado, ofrece una vía de despliegue de la detección de layout de OXR-1.0 sin depender de PyTorch; por otro, su licencia OXR (Apache-2.0 con términos adicionales) impone umbrales de facturación y restricciones sobre servicios competidores que condicionan su uso comercial.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | D-FINE (detector de objetos, familia DETR con refinamiento de distribución) |
| Parametros totales | 19.517.482 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no de texto) |
| Tipos de cuantizacion | F32 (única variante publicada en este repo; el autor indica que las variantes cuantizadas se generan con `crispembed-quantize`) |
| Idiomas soportados | no disponible (el modelo opera sobre layout, no sobre texto; la pipeline se validó con páginas en inglés, alemán, japonés y escaneos) |
| Licencia | OXR (Apache-2.0 con términos adicionales de SoMark) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento
El modelo implementa la arquitectura D-FINE, un detector de objetos de la familia DETR que refina las predicciones mediante distribución de probabilidad sobre las coordenadas de las cajas, en lugar de regresión directa. En CrispEmbed se carga bajo el identificador de arquitectura `layout_detect` con `layout.arch = dfine`, y actúa como etapa de layout de la pipeline nativa de OXR-1.0, alimentando al modelo de reconocimiento cstr/OXR-1.0-GGUF.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens o imágenes, ni sobre si hubo ajuste fino con RLHF o DPO. La model card indica que el checkpoint público más cercano es D-FINE-M Objects365, con una similitud coseno de aproximadamente 0,94, aunque el linaje exacto de los pesos está calificado como no probado. La conversión a GGUF consistió únicamente en renombrado de tensores, casting y embebido de metadatos de tokenizador y preprocesado; no se entrenó, ajustó ni fusionó ningún peso.

## Capacidades
- Detección de regiones de layout en páginas de documento: bloques de texto, tablas, figuras y otros elementos estructurales.
- Salida de regiones seleccionadas con etiquetas y orden, equivalente a la del detector PyTorch original en las páginas de referencia.
- Integración como etapa previa a OCR dentro de la pipeline OXR-1.0 (reconocimiento con cstr/OXR-1.0-GGUF).
- Ejecución en CPU mediante el runtime ggml de CrispEmbed, sin dependencia de PyTorch.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso: es exclusivamente un modelo de visión para detección.
- Capacidades multilingües no aplicables al modelo en sí; la pipeline se validó con páginas en varios idiomas.

## Casos de uso
- Digitalización de archivos administrativos: el detector segmenta cada página escaneada en bloques de texto y tablas antes de pasarla al OCR, lo que permite conservar la estructura del documento en la salida.
- Extracción de tablas de facturas y albaranes: al aislar las regiones de tabla, el reconocedor posterior puede procesarlas con un modelo o postprocesado específico en lugar de tratar la página como texto plano.
- Pipeline OCR autoalojada en CPU: al ser un GGUF de 78 MB ejecutable con ggml, encaja en servidores sin GPU o en entornos con recursos limitados donde no se quiere desplegar PyTorch.
- Procesamiento de documentos con maquetación compleja (informes, artículos, formularios): la detección previa de layout permite reconstruir el orden de lectura y la jerarquía de secciones.
- Indexación documental para búsqueda: la segmentación por regiones facilita asociar metadatos estructurales (tipo de bloque, posición) a cada fragmento de texto extraído.
- Prototipado e investigación en análisis de layout: al estar en GGUF y con paridad verificada frente al detector original en CPU, sirve como referencia reproducible para comparar implementaciones nativas.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks estándar (mAP, AP de layout) en la información disponible. La model card sí documenta una verificación de paridad frente al detector PyTorch original en CPU sobre 5 páginas congeladas:

| Página | Regiones seleccionadas | Resultado |
|---|---:|---|
| receipt | 21 | Etiquetas idénticas y en el mismo orden |
| german | 17 | Etiquetas idénticas y en el mismo orden |
| scan | 9 | Etiquetas idénticas y en el mismo orden |
| table | 2 | Etiquetas idénticas y en el mismo orden |
| japanese | 1 | Etiquetas idénticas y en el mismo orden |

Además, la implementación nativa resulta más próxima que PyTorch FP32 a una referencia F64 en 56 de 56 etapas, y la velocidad en CPU es aproximadamente 2,6 veces la de PyTorch. Los presupuestos estrictos por etapa fallan en las capas 2-3 del decodificador en dos páginas. F16, GPU y el AP representativo de layout no están cualificados.

## Requisitos de hardware
- VRAM: no aplica para la variante F32 en CPU; el fichero ocupa 78 MB y el modelo tiene unos 19,5 millones de parámetros, por lo que la inferencia en GPU requeriría muy poca memoria (estimación no publicada).
- GPU recomendadas: no disponibles; la model card indica explícitamente que la ejecución en GPU no está cualificada.
- CPU: es el entorno validado, con una velocidad aproximada de 2,6 veces la del detector PyTorch en FP32.
- Despliegue: runtime nativo ggml de CrispEmbed mediante `crispembed-server --layout oxr-1.0-dfine-layout-f32.gguf`, con las variables `CRISPEMBED_OXR=1` y `CRISPEMBED_ACCEPT_OXR_LICENSE=1`. No se documenta soporte en vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles más allá de la comparación relativa con PyTorch en CPU.

## Comparativa con modelos similares
| Modelo | Tipo | Parámetros | Formato | Licencia | Notas |
|---|---|---:|---|---|---|
| OXR-1.0-DFINE-layout-GGUF (este) | D-FINE layout | 19,5 M | GGUF | OXR (Apache-2.0 + términos) | Paridad verificada en CPU con el original |
| SoMarkAI/OXR-1.0 (original) | Pipeline documental completa | no disponible | PyTorch | OXR | Modelo base; incluye layout y reconocimiento |
| cstr/OXR-1.0-GGUF | Reconocimiento OCR | no disponible | GGUF | OXR | Etapa de reconocimiento de la misma pipeline |
| D-FINE-M Objects365 | D-FINE detección general | no disponible | PyTorch | no disponible | Checkpoint público más cercano (coseno ~0,94), linaje no probado |

No se dispone de datos de rendimiento comparativo (AP de layout) entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias
- La licencia OXR permite uso comercial sin licencia específica de SoMark solo si la entidad y sus afiliadas se mantienen por debajo de 2.000.000 USD en financiación total y en ingresos anuales.
- Un servicio en línea construido sobre OXR o sus derivados debe identificar de forma prominente a SoMark OXR.
- No se permite ofrecer a terceros una API alojada que compita con los servicios de parsing documental, OCR o layout de SoMark, sin licencia escrita, independientemente del tamaño.
- El incumplimiento de estos términos extingue automáticamente la licencia.
- La paridad solo está verificada en CPU y con la variante F32; F16, GPU y el AP representativo de layout no están cualificados.
- Los presupuestos estrictos por etapa fallan en las capas 2-3 del decodificador en dos de las páginas de referencia.
- El linaje de los pesos respecto a checkpoints públicos no está probado (similitud coseno ~0,94 con D-FINE-M Objects365).
- Es un detector de layout, no un modelo de lenguaje: no genera texto ni admite instrucciones; cualquier expectativa de razonamiento o generación es inaplicable.
- No se documentan sesgos específicos ni tasas de error por idioma o tipo de documento; la validación se limita a cinco páginas congeladas.
- Al ser una conversión de formato, cualquier defecto del modelo original se hereda sin cambios.

## Enlaces
- Repositorio HuggingFace: https://huggingface.co/cstr/OXR-1.0-DFINE-layout-GGUF
- Modelo base: https://huggingface.co/SoMarkAI/OXR-1.0/tree/c708407f9d2b4df658f2543d9132b62bb7221df4
- Modelo de reconocimiento de la pipeline: https://huggingface.co/cstr/OXR-1.0-GGUF
- Runtime CrispEmbed: https://github.com/CrispStrobe/CrispEmbed

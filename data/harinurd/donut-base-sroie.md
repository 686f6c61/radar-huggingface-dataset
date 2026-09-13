# HariNurd/donut-base-sroie

## Resumen

donut-base-sroie es un ajuste fino (fine-tuning) del modelo naver-clova-ix/donut-base, publicado por el usuario HariNurd en Hugging Face. Donut, acrónimo de Document Understanding Transformer, es una arquitectura OCR-free: recibe directamente la imagen de un documento y genera como salida una secuencia de texto estructurado (habitualmente JSON) con los campos extraídos, sin necesidad de un motor OCR intermedio ni de detección de layout. El nombre del repositorio sugiere un ajuste orientado a la extracción de información de recibos y tickets de compra, aunque la model card no confirma qué dataset concreto se ha utilizado más allá de la etiqueta genérica "imagefolder".

El modelo tiene 202.060.216 parámetros (dato real declarado en los pesos safetensors), lo que lo sitúa en la gama de 200 millones: es lo bastante pequeño para ejecutarse en GPU de consumo e incluso en CPU, y lo bastante grande para modelar documentos con layouts complejos. Se distribuye con licencia MIT, lo que permite uso comercial sin restricciones por parte del autor, y es compatible con el pipeline `image-text-to-text` de Transformers.

Su relevancia es doble. Por un lado, sirve como ejemplo práctico de ajuste de Donut para un dominio vertical concreto (documentos financieros), un flujo muy habitual en automatización de back-office. Por otro lado, y de forma importante para quien evalúe desplegarlo, es un modelo con muy poca validación pública: 20 descargas, 0 likes, model card autogenerada sin métricas de evaluación y sin resultados de benchmarks declarados. Debe tratarse, por tanto, como un punto de partida experimental y no como un modelo listo para producción sin una evaluación propia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-encoder-decoder: encoder de imagen tipo Swin Transformer + decoder autorregresivo tipo BART (arquitectura Donut) |
| Parámetros totales | 202.060.216 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base Donut trabaja con secuencias objetivo del orden de 768 tokens |
| Tipos de cuantización | No disponible (no se publican versiones cuantizadas; pesos en precisión completa) |
| Idiomas soportados | No disponible (el modelo base se entrena mayoritariamente con documentos en inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Pipeline | image-text-to-text |
| Tamaño del repositorio | 2,4 GB |
| Modelo base | naver-clova-ix/donut-base (ajuste fino) |
| Dataset declarado | imagefolder (sin más detalle) |
| Descargas / likes | 20 / 0 |
| Fecha de creación | 2026-09-12 |

## Arquitectura y entrenamiento

La arquitectura es la de Donut: un encoder visual Swin Transformer que procesa la imagen completa del documento a resolución elevada y un decoder autorregresivo de estilo BART que genera la secuencia de salida token a token. La innovación central de Donut es eliminar por completo la dependencia de un OCR externo y de un analizador de layout: la imagen entra cruda y sale directamente el JSON con los campos (por ejemplo, nombre del comercio, fecha, total, impuestos). Esto simplifica enormemente el pipeline de despliegue y evita la propagación de errores típica de las cadenas OCR + modelo de extracción.

El ajuste fino se realizó sobre naver-clova-ix/donut-base con los siguientes hiperparámetros declarados en la model card: learning rate 2e-05, `train_batch_size` 2, `eval_batch_size` 8, semilla 42, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal y 3 épocas. El entrenamiento se ejecutó con PyTorch 2.14.0+cpu, es decir, sobre CPU, lo que unido al batch reducido sugiere un ajuste ligero y posiblemente limitado en cuanto a convergencia. No se declara ningún uso de RLHF, DPO ni técnicas de alineación; se trata de un ajuste supervisado estándar. La model card no especifica el número de tokens de entrenamiento, la composición del dataset ni el volumen de ejemplos utilizados, y la sección de resultados de entrenamiento está vacía.

## Capacidades

- Extracción de información estructurada a partir de imágenes de documentos: genera JSON con pares clave-valor directamente desde la imagen, sin OCR previo.
- Comprensión de documentos con layout complejo, al utilizar un encoder visual de alta resolución en lugar de texto plano.
- Generación de texto condicionada por imagen (pipeline `image-text-to-text`).
- Extracción de campos típicos de recibos y facturas simples: comercio, fecha, número de ticket, líneas de artículo, subtotal, impuestos y total.
- Compatibilidad con el ecosistema Transformers: `DonutProcessor` + `VisionEncoderDecoderModel`.
- No se declara soporte de tool calling ni de function calling.
- No se declara soporte de agentes, planificación multi-paso ni razonamiento encadenado.
- No se declara modo de razonamiento explícito (thinking mode), audio ni visión general fuera del dominio documental.
- Capacidades multilingües: no declaradas; presumiblemente limitadas al idioma predominante en los datos de ajuste, no especificado.

## Casos de uso

- Digitalización de tickets y recibos para contabilidad: el modelo recibe la fotografía o el escaneo del ticket y devuelve un JSON con fecha, comercio, importe total e impuestos, que se puede volcar directamente a un asiento contable sin intervención manual.
- Automatización de notas de gastos en ERP: integrado como microservicio detrás de una cola de mensajes, procesa lotes de recibos y publica los campos extraídos en sistemas como Odoo o SAP mediante su API, reduciendo el trabajo de introducción manual.
- Gestión de reembolsos y seguros: extracción de los importes y conceptos de facturas presentadas por clientes para validar automáticamente que la cuantía reclamada coincide con el documento aportado.
- Auditoría fiscal y cumplimiento normativo: extracción masiva de los campos obligatorios de facturas y tickets para comprobar la presencia de datos fiscales y detectar documentos incompletos antes de archivarlos.
- Indexado y búsqueda sobre archivos escaneados: el JSON generado se almacena junto al identificador del documento, de modo que un buscador o un sistema RAG pueda recuperar recibos por comercio, fecha o importe.
- Base para ajuste específico de dominio: al ser un modelo pequeño y con licencia MIT, es un punto de partida razonable para reentrenar con etiquetas propias de una empresa (por ejemplo, un formato de recibo interno) sin coste de licencia.
- Prototipado e investigación en document AI OCR-free: sirve como referencia ligera para comparar enfoques OCR-free frente a pipelines clásicos de OCR más modelo de extracción en experimentos académicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El `model-index` de la model card contiene un array de resultados vacío y la sección "Training results" está en blanco, por lo que no existe ninguna métrica oficial de precisión, F1 sobre campos (campo exacto o F1 de entidad), ni pérdida de evaluación.

## Requisitos de hardware

- Tamaño de los pesos: aproximadamente 810 MB en fp32, 405 MB en fp16/bf16, 200 MB en int8 y 100 MB en int4 (estimación teórica a partir de los 202 millones de parámetros).
- VRAM estimada para inferencia: alrededor de 1-2 GB en fp16 con batch 1, y del orden de 3-4 GB con lotes grandes o imágenes de alta resolución, dado que el encoder visual consume activaciones significativas al procesar documentos grandes.
- GPU de consumo: sí, cabe holgadamente en cualquier GPU con 4 GB o más, como GTX 1650, RTX 3050, RTX 3060 o RTX 4090. También es viable en CPU para cargas de bajo volumen.
- GPU profesionales recomendadas para servicio: T4, L4, A10 o RTX 4090 para despliegue en producción; A100 o H100 no aportan ventaja relevante salvo que se necesite throughput masivo por lote.
- Opciones de despliegue: Transformers con PyTorch (soporte nativo y el único garantizado), posible exportación a ONNX mediante las utilidades de Optimum. No hay soporte nativo conocido en vLLM, TGI, llama.cpp ni Ollama para esta arquitectura vision-encoder-decoder, y no existen pesos en formato GGUF.
- Latencia y throughput: no disponibles. No se han publicado mediciones y dependerán fuertemente de la resolución de entrada y del hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Enfoque | Requiere OCR externo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HariNurd/donut-base-sroie | 202.060.216 | OCR-free, imagen a JSON | No | MIT | Hugging Face, 20 descargas |
| naver-clova-ix/donut-base | 202.060.216 | OCR-free, preentrenado para DocVQA/CORD y similares | No | MIT | Hugging Face, ampliamente utilizado como base |
| microsoft/layoutlmv3-base | ~133 M (aproximado) | Multimodal texto + layout + imagen | Sí | CC BY-NC-SA 4.0 | Hugging Face |
| microsoft/trocr-base-printed | ~334 M (aproximado) | OCR de línea de texto (encoder-decoder) | No, es el propio OCR | No verificado en la información disponible | Hugging Face |

Nota: las cifras de parámetros y licencias de los modelos alternativos corresponden a información pública de sus respectivas fichas y conviene verificarlas antes de tomar decisiones de licencia. La diferencia más relevante para uso comercial es la licencia: donut-base-sroie y donut-base son MIT, mientras que LayoutLMv3-base se distribuye bajo CC BY-NC-SA 4.0, lo que restringe el uso comercial.

## Limitaciones y advertencias

- Model card prácticamente vacía: no especifica dataset, número de ejemplos, composición, idioma ni usos previstos. Las secciones "Model description", "Intended uses & limitations" y "Training and evaluation data" contienen literalmente "More information needed".
- Riesgo elevado de alucinación: los modelos generativos OCR-free pueden inventar campos ausentes o completar valores plausibles en documentos degradados, borrosos o fuera de dominio. Es imprescindible validar la salida con un esquema estricto y reglas de negocio (sumas, formatos de fecha, dígitos de control).
- Sin métricas de evaluación: no hay forma de saber el rendimiento real del ajuste. Cualquier decisión de despliegue debería ir precedida de una evaluación propia con un conjunto de test representativo.
- Entrenamiento ligero: 3 épocas, batch de 2 y ejecución sobre CPU. Es plausible un ajuste insuficiente o un sobreajuste al pequeño conjunto utilizado.
- Licencia MIT del modelo, pero licencia del dataset de entrenamiento no declarada. Si los datos proceden de un corpus con restricciones de uso (por ejemplo, el conjunto SROIE de ICDAR está pensado para investigación), el uso comercial podría quedar comprometido por la vía de los datos, aunque la licencia del modelo lo permita.
- Adopción mínima: 20 descargas y 0 likes. No hay validación por parte de la comunidad, ni issues, ni discusiones que permitan anticipar problemas conocidos.
- Sin capacidades de agente ni de function calling: no es adecuado para flujos de razonamiento multi-paso ni para orquestación de herramientas.
- Sin versiones cuantizadas oficiales ni pesos en GGUF, lo que limita las opciones de despliegue en entornos que dependen de llama.cpp u Ollama.
- Dominio estrecho: el rendimiento fuera de recibos y documentos financieros simples no está garantizado y probablemente sea pobre.
- Idiomas no declarados: no se puede asumir soporte para documentos en castellano sin una prueba previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HariNurd/donut-base-sroie
- Modelo base: https://huggingface.co/naver-clova-ix/donut-base
- Paper original de Donut: no disponible en la información proporcionada
- Búsqueda web: no se han encontrado enlaces relevantes al modelo. Los resultados devueltos corresponden a Ondo Finance y a información sobre activos tokenizados, sin relación alguna con este modelo, por lo que se descartan.

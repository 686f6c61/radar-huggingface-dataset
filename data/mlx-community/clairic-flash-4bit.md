# mlx-community/clairic-flash-4bit

## Resumen

Clairic Flash es un modelo de extracción estructurada de información desarrollado por Cloudflare, no un modelo conversacional al uso. Recibe un estado (texto o JSON, opcionalmente acompañado de imágenes o PDF) y un esquema de campos tipados, y devuelve un valor tipado por campo junto con una puntuación de confianza y una probabilidad de nulo. Además realiza estimaciones numéricas y previsiones con distribución de cuantiles. La versión aquí descrita es la conversión a 4 bits realizada por mlx-community para Apple Silicon.

El modelo base, `Cloudflare/clairic-flash`, emplea una arquitectura `qwen3_5` con aproximadamente 1.860 millones de parámetros y un contexto de 65.000 tokens. Su funcionamiento real depende de un pipeline de peticiones propio de Cloudflare que reescribe cada campo en un prompt independiente, aplica decodificación restringida por gramática y utiliza una cabeza tipada separada (`clair_head.safetensors`) para fechas, horas, duraciones, cálculos, estimaciones y previsiones.

Esta conversión MLX sustituye el motor de inferencia original (PyTorch con kernels CUDA) por uno implementado en MLX, manteniendo el pipeline y el formato de peticiones y respuestas del modelo original. Es relevante para desarrolladores que necesiten ejecutar extracción estructurada multimodal en Macs con Apple Silicon sin depender de GPU NVIDIA.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | qwen3_5 (backbone transformer) con cabeza tipada adicional (`clair_head.safetensors`) y pipeline de decodificación restringida por gramática |
| Parámetros totales | 1.861.246.192 |
| Parámetros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | 65.000 tokens |
| Tipos de cuantización | 4 bits (esta versión); el modelo base admite bfloat16 |
| Idiomas soportados | no disponible (la model card menciona pruebas en cuatro idiomas sin especificarlos) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), más `clair_head.safetensors` y código propio (`clairic_runtime/`) |
| Pipeline | image-text-to-text (multimodal) |
| Límite de imágenes/PDF | 4 imágenes o páginas por petición; 4 MiB por fichero embebido |
| Tamaño del repositorio | 6,2 GB |

## Arquitectura y entrenamiento

El backbone es un transformer de la familia `qwen3_5` con 1.860 millones de parámetros. Sobre él se apoya una cabeza tipada independiente que lee los estados ocultos del backbone en un único forward pass para producir fechas, horas, datetime, duraciones, valores calculados, estimaciones y previsiones. Los campos de tipo `text`, `number`, `boolean`, `enum`, `object` y listas de estos se resuelven mediante decodificación restringida por gramática, generando un prompt corto por campo o por elemento de lista.

El pipeline de Cloudflare reescribe cada campo en su propio prompt, construye una gramática a partir del esquema del campo (y, para valores copiados del documento, a partir del propio documento), puntúa la probabilidad de nulo, reintenta cuando es necesario y ensambla listas y tablas. La conversión MLX conserva este pipeline (`clairic_runtime/`, Apache 2.0) y sustituye únicamente el motor de ejecución por `clairic_runtime/mlx_engine.py`. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Extracción de campos tipados: `text`, `number`, `boolean`, `enum`, `object` y listas de estos, con valor, confianza y probabilidad de nulo por campo.
- Extracción de tipos temporales y numéricos especializados mediante cabeza tipada: `date`, `time`, `datetime`, `duration`, `compute`, `estimate`, `forecast` y listas de fechas.
- Procesamiento multimodal: acepta imágenes y PDF (hasta cuatro imágenes o páginas por petición), en formato PIL, ruta de fichero o data URI base64.
- Estimaciones y previsiones con distribución de probabilidad; opción `include_quantiles` para obtener cuantiles.
- Decodificación restringida por gramática para garantizar que la salida cumple el esquema solicitado.
- Opciones de campo: `instructions`, `nullable`, `decimals`, `unit`, `enum`, `source_only`, `knowledge`, `reference_date`.
- Servidor HTTP local compatible con el formato de peticiones y respuestas del modelo original (`/v1/systemone`), con autenticación opcional por bearer token mediante `CLAIRIC_API_KEY`.
- API síncrona (`systemone`, `model.predict_async`) y línea de comandos (`clairic_mlx.py`).
- No es un modelo de chat: no está diseñado para conversación multi-turno ni generación libre de texto.

## Casos de uso

- Extracción de datos de facturas: enviar el PDF o la imagen de una factura con un esquema de campos (proveedor, total, fecha de emisión, líneas de detalle) y obtener valores tipados con confianza, útil para automatizar la contabilidad de cuentas a pagar.
- Procesamiento de tickets de soporte: extraer categoría, prioridad, producto afectado y fecha del incidente de correos o capturas, con tipos `enum` y `date` que evitan post-procesado.
- Digitalización de recibos de gastos: leer la imagen de un recibo y obtener comercio, importe con dos decimales y fecha, aprovechando la cabeza tipada para fechas e importes.
- Previsión de demanda a corto plazo: pasar una serie de valores diarios y solicitar un campo `forecast` con horizonte e intervalo, obteniendo cuantiles para planificación de inventario.
- Enrutamiento y clasificación documental: usar campos `enum` y `boolean` para clasificar documentos entrantes y decidir el flujo posterior, con `source_only` para restringir valores a los presentes en el documento.
- Extracción de datos de documentos largos: aprovechar la ventana de 65.000 tokens para procesar contratos o informes extensos (la model card cita pruebas con documentos de 1.000 a 39.000 tokens) y extraer cláusulas o metadatos concretos.
- Despliegue local en estaciones de trabajo Apple Silicon: ejecutar el servidor HTTP en un Mac de 16 GB o más para integrar la extracción estructurada en herramientas internas sin enviar documentos a la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card incluye una evaluación de fidelidad frente al runtime oficial de Cloudflare en una H100 con bfloat16: 81 peticiones con respuestas conocidas (facturas, tickets, fechas y horas, valores calculados, listas y tablas, todas las opciones de campo, cuatro idiomas, documentos de 1.000 a 39.000 tokens, 13 peticiones de imagen y 3 de PDF), con 262 campos de valor exacto más estimaciones y previsiones. Los resultados numéricos de esa comparación no están disponibles en la información proporcionada.

## Requisitos de hardware

- Plataforma: exclusivamente Apple Silicon (MLX); requiere macOS y Python 3.11 o superior (probado con 3.12).
- Memoria: 6 GB en reposo y hasta 11 GB en las peticiones medidas; 16 GB de RAM unificada es el mínimo práctico y 24 GB ofrece más margen.
- No está pensado para GPU NVIDIA, AMD ni CPU x86: el motor es MLX y el pipeline original con kernels CUDA ha sido sustituido.
- Despliegue: script de línea de comandos `clairic_mlx.py`, servidor HTTP `server.py` (puerto configurable, por defecto 8093) y API Python (`load`, `systemone`, `predict_async`).
- Concurrencia: el servidor atiende una petición a la vez; cada petición se expande internamente en muchos prompts por lotes, por lo que las peticiones concurrentes esperan turno.
- Dependencias: `pip install -r requirements.txt`; `xgrammar` arrastra PyTorch como dependencia, aunque el modelo se ejecuta íntegramente en MLX.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo de tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mlx-community/clairic-flash-4bit | 1,86 B | 65.000 tokens | Extracción estructurada multimodal | Apache 2.0 | Hugging Face (MLX) |
| Cloudflare/clairic-flash | no disponible | 65.000 tokens | Extracción estructurada multimodal | Apache 2.0 | Hugging Face (PyTorch/CUDA) |
| mlx-community/clairic-4bit | no disponible | no disponible | Extracción estructurada multimodal | no disponible | Hugging Face (MLX) |

La model card señala que `mlx-community/clairic-4bit` es el modelo «más grande y preciso» de la familia. No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparados en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de chat: usarlo con `mlx_lm.load` o `mlx_vlm.load` carga el backbone pero no reproduce el comportamiento de Clairic; es imprescindible el código incluido en el repositorio.
- Depende de código personalizado (`clairic_runtime/`), lo que complica la integración con herramientas estándar de inferencia y con servidores compatibles con OpenAI.
- Solo funciona en Apple Silicon; no hay soporte para CUDA ni para CPU genérica en esta conversión.
- La cuantización a 4 bits puede reducir la fidelidad respecto al modelo base en bfloat16; la model card remite a la evaluación de fidelidad, cuyos resultados numéricos no se detallan en la información disponible.
- Límite de cuatro imágenes o páginas PDF por petición y 4 MiB por fichero embebido.
- El servidor procesa una petición cada vez; no es adecuado para despliegues de alta concurrencia sin una capa de encolado.
- Idiomas soportados no especificados; la model card solo indica pruebas en cuatro idiomas sin identificarlos.
- Riesgo de alucinación y sesgos: no se documentan en la información disponible; al ser un modelo de extracción con decodificación restringida, el riesgo principal es la asignación incorrecta de valores o la estimación errónea de confianza, no la generación libre.
- Licencia Apache 2.0 en el modelo y en el pipeline, lo que permite uso comercial, pero conviene revisar las dependencias (`xgrammar`, PyTorch) por si imponen condiciones adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mlx-community/clairic-flash-4bit
- Modelo base: https://huggingface.co/Cloudflare/clairic-flash
- Modelo mayor de la familia en MLX: https://huggingface.co/mlx-community/clairic-4bit
- Repositorio de MLX: https://github.com/ml-explore/mlx

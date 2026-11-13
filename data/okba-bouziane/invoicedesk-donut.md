# okba-bouziane/invoicedesk-donut

## Resumen

InvoiceDesk Donut es un modelo de comprensión de documentos basado en la arquitectura Donut (Document Understanding Transformer), desarrollado por okba-bouziane. Se trata de un fine-tuning de `naver-clova-ix/donut-base` especializado en la extracción de campos estructurados de facturas de proveedor, devolviendo datos como proveedor, NIF, número de factura, fecha, cliente, líneas de detalle, total HT, TVA, timbre fiscal y total TTC, o respondiendo a preguntas sobre la factura en francés o inglés.

El modelo resuelve el problema de digitalización de facturas en entornos contables, sustituyendo pipelines clásicos de OCR más reglas heurísticas por un enfoque end-to-end de image-to-text. Fue entrenado en una única GPU Kaggle T4 durante 3 épocas (1280×960 de entrada, 135 minutos) sobre tres tareas simultáneas: recibos CORD-v2, facturas argelinas generadas sintéticamente y preguntas sobre esas facturas. Cuenta con 202.149.304 parámetros y un tamaño de repositorio de 0,8 GB.

Es relevante ahora por su enfoque práctico en un dominio concreto (facturación argelina, sin dataset público disponible) y por demostrar que un fine-tuning ligero de Donut sobre datos sintéticos supera ampliamente a Tesseract OCR con reglas en la extracción de campos (F1 de 0,968 frente a 0,428 en layouts vistos, y 0,698 frente a 0,477 en layouts no vistos durante el entrenamiento).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-encoder-decoder (Donut, basada en transformer) |
| Parametros totales | 202.149.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo genera secuencias de hasta 512 tokens en el ejemplo de uso) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | francés (fr), inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Modelo base | naver-clova-ix/donut-base |
| Pipeline | image-to-text |
| Resolucion de entrada | 1280×960 (durante el entrenamiento) |
| Dataset de entrenamiento | naver-clova-ix/cord-v2 y facturas argelinas generadas |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Donut, un vision-encoder-decoder en la que un encoder visual procesa la imagen del documento y un decoder autoregresivo genera directamente la secuencia de texto estructurado, sin necesidad de un módulo OCR intermedio. El decoder utiliza tokens especiales para seleccionar la tarea: `<s_dzinv>` para extraer campos de una factura, `<s_cord-v2>` para leer un recibo estilo CORD y `<s_docvqa><s_question>{question}</s_question><s_answer>` para responder preguntas sobre el documento.

El fine-tuning se realizó sobre `naver-clova-ix/donut-base` durante 3 épocas en una GPU Kaggle T4, con imágenes de entrada de 1280×960, en 135 minutos. El entrenamiento combinó tres tareas simultáneas: recibos CORD-v2 (dataset CC BY 4.0), facturas argelinas generadas sintéticamente (empresas, personas y números inventados, ya que no existe dataset público de facturas argelinas) y preguntas sobre esas facturas. No se especifica en la información disponible si se aplicaron técnicas de RLHF o DPO, ni el número total de tokens de entrenamiento.

## Capacidades

- Extracción de campos estructurados de facturas de proveedor: proveedor, NIF, RC, número de factura, fecha, cliente, líneas de detalle, total HT, TVA, timbre fiscal y total TTC.
- Lectura de recibos estilo CORD-v2 mediante el token de tarea `<s_cord-v2>`.
- Document question answering (DocVQA): responde a preguntas sobre la factura en francés o inglés mediante el prompt `<s_docvqa><s_question>...</s_question><s_answer>`.
- Generación de secuencias estructuradas con etiquetas tipo `<s_vendor>…</s_vendor><s_items>…`, convertibles a JSON mediante utilidades del repositorio.
- Capacidad multilingüe limitada a francés e inglés.
- No se documenta soporte de tool calling, function calling, agentes ni multi-step reasoning en la información disponible.
- No se documenta capacidad de visión general más allá de comprensión de documentos, ni audio.

## Casos de uso

- Automatización de contabilidad de proveedores: el modelo recibe la foto de una factura y devuelve los campos que un contable teclearía (proveedor, NIF, número, fecha, líneas, totales), reduciendo la entrada manual de datos en flujos de cuentas por pagar.
- Digitalización masiva de facturas argelinas: adecuado para empresas que operan en Argelia y necesitan procesar facturas con layouts locales, ya que fue entrenado específicamente con facturas argelinas generadas y alcanza F1 de 0,968 en los seis layouts de entrenamiento.
- Validación automática de totales: el módulo `invoicedesk/normalize.py` del repositorio comprueba los totales extraídos, por lo que el modelo puede integrarse en un pipeline de verificación de coherencia entre líneas, total HT, TVA, timbre y total TTC.
- Extracción de recibos de gastos: mediante el token `<s_cord-v2>`, el modelo procesa recibos estilo CORD-v2 para extraer importes y conceptos en aplicaciones de gestión de gastos.
- Asistente de consulta documental: un usuario puede preguntar en francés o inglés sobre el contenido de una factura (por ejemplo, el importe total o el nombre del proveedor) y obtener una respuesta directa mediante el modo DocVQA, útil en interfaces de atención al empleado o al gestor.
- Clasificación y enrutado de facturas por proveedor: los campos extraídos (proveedor, NIF, RC) permiten enrutar automáticamente documentos al departamento o sistema correspondiente.
- Preprocesado para ERP: la salida estructurada convertida a JSON puede alimentar sistemas ERP o herramientas de conciliación bancaria sin intervención manual.

## Benchmarks y rendimiento

| Conjunto de prueba | Este modelo (F1 de campo) | Tesseract OCR + reglas |
|---|---|---|
| Facturas en los 6 layouts de entrenamiento (300) | 0,968 | 0,428 |
| Layout y fuente nunca vistos en entrenamiento (300) | 0,698 | 0,477 |
| Recibos CORD-v2 de test (100) | 0,592 | n/a |
| Preguntas formuladas de forma distinta a las de entrenamiento, exact match (300) | 0,777 | n/a |

El campo NIF es el más débil, con un 61,7 % de aciertos exactos, normalmente por un dígito de diferencia. El autor indica que las tablas completas, puntuaciones por campo y limitaciones están en el README de GitHub.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 202 millones de parámetros en safetensors y un repositorio de 0,8 GB, el modelo es de tamaño reducido y cabe holgadamente en GPUs de consumo.
- GPU recomendadas: el entrenamiento se realizó en una única Kaggle T4, lo que indica que la inferencia es viable en GPUs de gama consumer y en T4.
- Cabe en GPU consumer: sí, por tamaño (202 M parámetros) y por haberse entrenado en una T4.
- Opciones de despliegue: la model card muestra uso con `transformers` (`DonutProcessor` y `VisionEncoderDecoderModel`). No se documentan opciones específicas para vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| InvoiceDesk Donut | 202.149.304 | no disponible | F1 0,968 en layouts vistos; 0,698 en layout no visto; 0,592 en CORD-v2; 0,777 exact match en QA | MIT | Hugging Face (okba-bouziane/invoicedesk-donut) |
| naver-clova-ix/donut-base | no disponible en la información | no disponible | no disponible | MIT | Hugging Face |
| Tesseract OCR + reglas | no aplica (no es un modelo neuronal end-to-end) | no aplica | F1 0,428 en layouts vistos; 0,477 en layout no visto | no disponible | open source |

No se dispone de datos de benchmarks de `donut-base` ni de otros modelos comparables en la información proporcionada para establecer una comparación cuantitativa adicional.

## Limitaciones y advertencias

- El campo NIF es el más propenso a error: solo el 61,7 % de los NIF se extraen de forma exacta, normalmente con un dígito de diferencia.
- El rendimiento cae significativamente ante layouts y fuentes no vistos durante el entrenamiento (F1 de 0,698 frente a 0,968 en layouts conocidos), lo que limita su generalización a facturas de otros países o formatos.
- El rendimiento en recibos CORD-v2 es moderado (F1 de 0,592), inferior al obtenido en facturas.
- Las facturas argelinas de entrenamiento y test son generadas sintéticamente (empresas, personas y números inventados); no existe dataset público de facturas argelinas, por lo que el rendimiento en facturas reales argelinas no está validado en la información disponible.
- Idiomas limitados a francés e inglés; no se documenta soporte de castellano ni de otros idiomas.
- Riesgo de alucinación: no se documenta explícitamente en la información disponible, pero es inherente a los modelos generativos image-to-text.
- Sesgos conocidos: no disponible.
- Licencia MIT, que permite uso comercial; el modelo base Donut es MIT y el dataset CORD-v2 es CC BY 4.0, por lo que deben respetarse las condiciones de atribución de este último.
- No se documentan requisitos de contexto máximo ni límites de longitud de secuencia de salida más allá de los 512 tokens usados en el ejemplo de generación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/okba-bouziane/invoicedesk-donut
- Modelo base Donut: https://huggingface.co/naver-clova-ix/donut-base
- Repositorio GitHub (código, generador de datos, entrenamiento y evaluación): https://github.com/okba-bouziane/InvoiceDesk
- Dataset CORD-v2: https://huggingface.co/datasets/naver-clova-ix/cord-v2

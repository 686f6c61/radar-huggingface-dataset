# saiiexd/qwen3-1.7b-qlora-receipt-extraction

## Resumen

`saiiexd/qwen3-1.7b-qlora-receipt-extraction` es un adaptador LoRA entrenado con QLoRA sobre el modelo base Qwen/Qwen3-1.7B, publicado por el usuario saiiexd en Hugging Face. Su proposito es muy concreto: recibir el texto OCR de un ticket o recibo escaneado y devolver un objeto JSON con cuatro campos extraidos (nombre de la empresa, fecha, direccion y total). No procesa imagenes: trabaja exclusivamente sobre texto OCR ya transcrito.

El modelo resuelve una tarea clasica de extraccion de informacion estructurada en documentos, enmarcada en el dataset SROIE (ICDAR 2019 Task 3), compuesto por recibos escaneados en ingles. Frente a soluciones basadas en reglas o en modelos de vision-lenguaje de mayor tamano, este adaptador aprovecha un LLM pequeno (1.7B parametros) para producir directamente JSON parseable, lo que simplifica la integracion en pipelines de contabilidad, gestion de gastos o digitalizacion documental.

Es relevante porque demuestra que un adaptador de apenas decenas de MB, entrenado en una GPU de consumo (RTX 3050 Laptop de 6 GB) en unos 33 minutos, puede especializar un modelo de 1.7B en una tarea de extraccion con formato estricto. La licencia Apache 2.0 facilita su uso comercial, aunque el alcance queda limitado al dominio de recibos en ingles y al prompt exacto de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (QLoRA) sobre transformer decoder-only Qwen3-1.7B |
| Parametros totales | 1.738.007.552 en el modelo base; adaptador con 17.432.576 parametros entrenables (1,0 %) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible para el adaptador; longitud maxima de secuencia en entrenamiento: 1536 tokens (ejemplo mas largo: 1133 tokens) |
| Tipos de cuantizacion | Base cargada en 4-bit NF4 con doble cuantizacion y computo en bf16; adaptador en safetensors (precision completa del adaptador) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere descargar el modelo base por separado |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-1.7B, un transformer decoder-only de la familia Qwen3. El entrenamiento emplea QLoRA: el modelo base permanece congelado en cuantizacion 4-bit NF4 con doble cuantizacion y computo en bf16, mientras se entrenan adaptadores LoRA de rango 16 y alpha 32 con dropout 0,05 sobre las siete proyecciones lineales (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`). El optimizador es paged 8-bit AdamW con tasa de aprendizaje 2e-4, schedule coseno y warmup del 5 % de los pasos; batch efectivo de 16 (1 por paso con acumulacion de 16), 3 epocas (108 pasos de optimizador) y semilla 42.

Los datos de entrenamiento son 563 recibos del split de entrenamiento de SROIE, con 63 ejemplos del mismo split reservados para validacion y los 347 recibos oficiales de test usados una unica vez para la evaluacion final. Las reglas de etiquetado estan codificadas en el prompt de sistema (campo ausente como cadena vacia, fecha sin hora, direccion unida con un espacio, total con dos decimales y sin simbolo de moneda), y el adaptador se entreno con ese prompt exacto, por lo que debe usarse sin modificaciones. El entrenamiento se ejecuto en una NVIDIA RTX 3050 Laptop de 6 GB, con un pico de VRAM de 4871 MB y una duracion de 33,4 minutos. La decodificacion recomendada es greedy (sin muestreo) con `enable_thinking=False`.

## Capacidades

- Extraccion de informacion estructurada: convierte texto OCR de recibos en un JSON con los campos `company`, `date`, `address` y `total`.
- Generacion de JSON estricto: el prompt exige unicamente el objeto JSON, sin markdown ni explicaciones.
- Manejo de campos ausentes: devuelve cadena vacia cuando un campo no aparece en el texto.
- Normalizacion de valores: fecha sin hora, direccion concatenada en una linea, total con dos decimales y sin moneda.
- Procesamiento de texto OCR multilinea separado por saltos de linea.
- Integracion via PEFT: el adaptador se carga sobre el modelo base con `PeftModel.from_pretrained`.
- Servicio HTTP: el repositorio de codigo incluye un servidor FastAPI con endpoint `POST /extract`.
- No soporta vision: no lee imagenes, solo texto OCR.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni audio.

## Casos de uso

- Digitalizacion de gastos corporativos: procesar lotes de tickets OCR y obtener JSON listo para insertar en un ERP o sistema de contabilidad, gracias a la salida con formato fijo y parseable.
- Automatizacion de notas de gastos: extraer empresa, fecha y total de cada recibo para generar informes de reembolso sin intervencion manual.
- Pipeline OCR + extraccion: encadenar un motor OCR (Tesseract, PaddleOCR, etc.) con este adaptador para convertir imagenes de tickets en registros estructurados.
- Conciliacion de transacciones: comparar el campo `total` extraido con los cargos de una tarjeta corporativa para detectar discrepancias.
- Servicio interno de extraccion: desplegar el endpoint FastAPI `POST /extract` como microservicio dentro de una aplicacion de gestion documental.
- Etiquetado y auditoria de datasets: usar el modelo para preanotar recibos y revisar manualmente solo los casos dudosos, reduciendo el coste de anotacion.
- Prototipado rapido en hardware modesto: validar una idea de extraccion documental en una GPU de consumo de 6 GB antes de invertir en modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que los 347 recibos de test de SROIE se usaron para la puntuacion final, pero no incluye las cifras obtenidas ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: el entrenamiento con QLoRA 4-bit alcanzo un pico de 4871 MB en una RTX 3050 Laptop de 6 GB; la inferencia con la misma configuracion 4-bit NF4 deberia caber en GPUs de 6 GB o mas.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA y al menos 6 GB de VRAM; el autor uso una RTX 3050 Laptop. Para mayor throughput, A100 o H100, aunque el modelo es pequeno y no las requiere.
- Cabe en GPU de consumo: si, segun el autor, en una RTX 3050 Laptop de 6 GB con cuantizacion 4-bit.
- Requiere CUDA GPU: la model card indica explicitamente que se necesita una GPU CUDA.
- Dependencias: `torch`, `transformers`, `peft`, `bitsandbytes` y `accelerate`.
- Opciones de despliegue: PEFT + transformers (metodo documentado); servicio HTTP con FastAPI incluido en el repositorio de codigo. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| saiiexd/qwen3-1.7b-qlora-receipt-extraction | 1.7B (base) + adaptador LoRA | no disponible (entrenado hasta 1536 tokens) | Extraccion de campos de recibos en JSON | Apache 2.0 | Hugging Face (adaptador) |
| Qwen/Qwen3-1.7B (base) | 1.7B | no disponible en la informacion | LLM generalista | no disponible en la informacion | Hugging Face |
| Alternativas especializadas en SROIE | no disponible | no disponible | Extraccion de informacion documental | no disponible | no disponible |

No se dispone de datos de benchmarks ni de otros adaptadores comparables en la informacion proporcionada para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Dominio restringido: solo extrae los cuatro campos definidos (`company`, `date`, `address`, `total`) de recibos en ingles; no esta pensado para otros tipos de documento ni otros esquemas.
- Dependencia del prompt: el adaptador se entreno con un prompt de sistema concreto; modificarlo puede degradar la calidad de la salida.
- Solo texto: no procesa imagenes; requiere un paso OCR previo cuya calidad condiciona el resultado.
- Idioma: unicamente ingles; no se garantiza comportamiento en otros idiomas.
- Riesgo de alucinacion: como todo LLM, puede inventar valores o devolver JSON malformado; se recomienda validar con `json.loads` o con `parse_output` del repositorio de codigo.
- Datos de entrenamiento limitados: 563 recibos de entrenamiento y 63 de validacion, lo que puede reducir la generalizacion a formatos de recibo muy distintos de SROIE.
- Licencia de datos: el dataset `ryanznie/SROIE_2019_with_labels` no declara licencia en su pagina, lo que conviene revisar antes de un uso comercial intensivo.
- Requiere GPU CUDA: no se documenta soporte para CPU ni para otros backends de inferencia.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento frente a alternativas.
- Advertencia de seguridad: la model card no menciona evaluaciones de sesgo ni de robustez frente a entradas adversarias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/saiiexd/qwen3-1.7b-qlora-receipt-extraction
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Codigo, pipeline de datos y registro de decisiones: https://github.com/saiiexd/llm-document-extraction
- Dataset ICDAR2019-SROIE (etiquetas): https://huggingface.co/datasets/jsdnrs/ICDAR2019-SROIE
- Dataset SROIE 2019 con etiquetas (texto OCR): https://huggingface.co/datasets/ryanznie/SROIE_2019_with_labels
- Paper SROIE (ICDAR 2019 Task 3): https://arxiv.org/abs/2103.10213
- Paper QLoRA: https://arxiv.org/abs/2305.14314
- Paper LoRA: https://arxiv.org/abs/2106.09685

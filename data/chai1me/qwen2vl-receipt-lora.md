# chai1me/qwen2vl-receipt-lora

## Resumen

`chai1me/qwen2vl-receipt-lora` es un adaptador LoRA (entrenado con QLoRA) sobre el modelo vision-lenguaje Qwen2-VL-2B-Instruct, desarrollado por el usuario chai1me. Su proposito es muy concreto: recibir la imagen de un ticket o recibo y devolver un JSON con la lista de lineas de compra (nombre y precio) y el total. No es un modelo generalista, sino un ajuste fino orientado a una unica tarea de extraccion de documentos.

El adaptador se entreno sobre el dataset CORD-v2 (recibos de cafeteria y restaurante, mayoritariamente indonesios) con solo 18,46 millones de parametros entrenables, un 0,83% del total del modelo base. El entrenamiento se realizo en una unica GPU T4 de Kaggle, lo que lo convierte en un ejemplo de ajuste fino de bajo coste sobre un VLM de 2B parametros.

Su relevancia practica esta en el nicho: demuestra que un adaptador pequeno sobre un VLM compacto puede alcanzar un 100% de JSON valido y un 90% de coincidencia exacta en el campo total sobre un conjunto de validacion de 60 recibos. Es util como punto de partida para pipelines de digitalizacion de tickets, pero sus limitaciones de evaluacion y dominio son notables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer vision-lenguaje Qwen2-VL-2B-Instruct (base cuantizada en 4 bits) |
| Parametros totales | 2.227.450.368 (modelo base); 18.464.768 entrenables en el adaptador (0,83%) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2-VL-2B; no especificada) |
| Tipos de cuantizacion | Base en 4-bit (bnb-4bit) para entrenamiento e inferencia; el adaptador se distribuye en safetensors sin cuantizar |
| Idiomas soportados | no disponible en la model card; el dataset de entrenamiento es mayoritariamente indonesio |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); el modelo base en formato bnb-4bit |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2-VL-2B-Instruct, un transformer multimodal que procesa imagenes y texto. Los modulos LoRA se insertan unicamente en las capas de atencion y MLP del modelo de lenguaje; las capas de vision permanecen congeladas. La configuracion LoRA es rango 16, alpha 16, dropout 0 y sin sesgos. El entrenamiento uso QLoRA con el modelo base cuantizado en 4 bits y el optimizador 8-bit AdamW con weight decay 0,01.

Los datos proceden de CORD-v2: se usaron los primeros 400 recibos utilizables del split de entrenamiento, con imagenes redimensionadas a un maximo de 1024 px. Se entrenaron 2 epochs (100 pasos) con batch size 2 y 4 pasos de acumulacion de gradiente (batch efectivo 8), tasa de aprendizaje 2e-4 con decaimiento lineal y 5 pasos de calentamiento, semilla 3407. No hubo seleccion de checkpoint ni RLHF/DPO; es un ajuste supervisado directo sobre pares imagen-instruccion-JSON.

## Capacidades

- Extraccion de campos de recibos: genera un JSON con `items` (lista de objetos `name` y `price`) y `total`.
- Salida estructurada: el 100% de las salidas en el conjunto de evaluacion fueron JSON valido.
- Procesamiento de imagen y texto: hereda la capacidad image-text-to-text del modelo base Qwen2-VL-2B-Instruct.
- Instruccion fija: el prompt de entrenamiento y evaluacion es "Extract the receipt into JSON with keys: items (a list of name and price) and total. Output only JSON."
- Generacion determinista: el ejemplo de uso emplea `do_sample=False` con `max_new_tokens=256`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni multilingue mas alla de lo heredado del modelo base.
- No se documenta modo thinking, audio ni otras modalidades.

## Casos de uso

- Digitalizacion de tickets de cafeteria y restaurante: el adaptador convierte la imagen de un recibo en JSON estructurado con lineas y total, adecuado para volcar datos a un sistema de contabilidad o ERP. Es su dominio de entrenamiento directo (CORD-v2).
- Automatizacion de gastos de empresa: procesar fotos de recibos enviadas por empleados y extraer el total para conciliacion de gastos, con la salvedad de que solo el campo total esta evaluado de forma rigurosa.
- Prototipado rapido de pipelines de extraccion documental: al ser un adaptador de 0,1 GB sobre un VLM de 2B, permite montar una demo en una GPU consumer o incluso en una T4 de Kaggle, util para validar una idea antes de invertir en un modelo mayor.
- Base para fine-tuning adicional: el adaptador y su receta (QLoRA, rango 16, 2 epochs) sirven como punto de partida para adaptar la extraccion a otros tipos de documento retrenando sobre un dataset propio.
- Investigacion sobre eficiencia de adaptadores: su tamano (18,46 M de parametros entrenables, 0,83%) y su entrenamiento en una sola T4 lo hacen util para estudiar el rendimiento de LoRA en tareas de extraccion visual con presupuesto minimo.
- Educacion y experimentacion con VLMs: el codigo de entrenamiento y evaluacion esta publicado en GitHub, lo que facilita reproducir el flujo completo con Unsloth o Transformers + PEFT.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre 60 recibos del split de validacion de CORD-v2 (no usados en entrenamiento):

| Metrica | Resultado |
|---|---|
| JSON valido | 100% |
| Coincidencia exacta del total | 90% |
| Similitud media de caracteres del campo total (60 recibos) | 0,957 |

Notas: solo se evalua el campo `total`; los nombres y precios de los items no se puntuan. La similitud es 1 menos la distancia de Levenshtein normalizada sobre el total, promediada sobre los 60 recibos; los 6 fallos promedian aproximadamente 0,57. No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con el modelo base en 4 bits y el adaptador en safetensors, la inferencia cabe holgadamente en GPUs con 8-16 GB de VRAM; el entrenamiento se realizo en una T4 (16 GB).
- GPU recomendadas: T4, RTX 3060/4060 (12-16 GB), RTX 4090, A100 o H100 para mayor throughput; el autor entreno en una unica T4.
- Cabe en GPU consumer: si, en tarjetas con al menos 8-12 GB de VRAM en configuracion 4-bit.
- Opciones de despliegue: Unsloth (`FastVisionModel`), Transformers + PEFT (`PeftModel`), y potencialmente vLLM o TGI con soporte para Qwen2-VL y adaptadores LoRA (no verificado en la informacion proporcionada).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos alternativos en la informacion proporcionada. Como referencia cualitativa:

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| chai1me/qwen2vl-receipt-lora | 2B (base) + 18,46 M adaptador | no disponible | Extraccion de recibos a JSON | apache-2.0 | Hugging Face, 6 descargas |
| Qwen2-VL-2B-Instruct (base) | 2B | no disponible | Vision-lenguaje general | apache-2.0 | Hugging Face |
| Alternativas de extraccion documental especializadas | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han identificado en la informacion disponible modelos comparables con metricas equivalentes sobre CORD-v2.

## Limitaciones y advertencias

- Dominio restringido: entrenado solo con CORD-v2 (recibos de cafeteria y restaurante, mayoritariamente indonesios); otros tipos de documento requieren reentrenamiento.
- Evaluacion limitada: solo 60 recibos, una unica ejecucion de entrenamiento y unicamente se puntua el campo total; los items no estan evaluados.
- Errores conocidos a nivel de item: lineas con precio cero omitidas y espaciado de moneda alterado (por ejemplo, `Rp29,090` frente a `Rp 29,090`).
- No es un detector de fraude ni de manipulacion: solo extrae campos.
- Riesgo de alucinacion: como cualquier VLM, puede generar valores plausibles pero incorrectos, especialmente fuera del dominio de entrenamiento.
- Idiomas: no se documenta soporte multilingue especifico; el entrenamiento esta sesgado al indonesio.
- Licencia apache-2.0 permite uso comercial, pero debe verificarse la licencia del modelo base y del dataset CORD-v2 para produccion.
- Para produccion se recomienda validacion posterior del JSON y de los importes extraidos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chai1me/qwen2vl-receipt-lora
- Codigo y evaluacion: https://github.com/Chaithra3-6/qwen2vl-receipt-extraction
- Modelo base: https://huggingface.co/unsloth/Qwen2-VL-2B-Instruct-bnb-4bit
- Dataset CORD-v2: https://huggingface.co/datasets/naver-clova-ix/cord-v2

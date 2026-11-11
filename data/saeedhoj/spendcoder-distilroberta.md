# Saeedhoj/spendcoder-distilroberta

## Resumen

SpendCoder es un modelo de clasificación de texto derivado de distilroberta-base, desarrollado por el usuario Saeedhoj, que asigna líneas de compra o factura a una de 14 categorías de gasto (spend categories) con una puntuación de confianza asociada. El modelo está pensado para el ámbito de cuentas a pagar y procurement: recibe una descripción corta como "ANNUAL MAINTENANCE OF HV SWITCHGEAR" y devuelve la categoría correspondiente, permitiendo derivar a revisión humana las líneas de baja confianza.

Se trata de un fine-tuning de distilroberta-base, con 82.129.166 parámetros totales y un repositorio de 0,7 GB que incluye pesos en safetensors y una exportación ONNX para servir en CPU sin necesidad de PyTorch. El modelo se entrenó con descripciones de contratos del Departamento de Energía de EE. UU. y sus Product and Service Codes de USAspending.gov, agrupados en 14 categorías.

Su relevancia práctica está en que ofrece un punto de partida ligero y desplegable en CPU para la codificación automática de gasto, con un umbral de revisión explícito (0,95) que prioriza la precisión sobre la cobertura: solo el 31,3 % de las líneas de test se codifican automáticamente, con un 88,8 % de acierto en esas líneas. Está publicado con licencia Apache 2.0 y solo soporta inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa destilado, distilroberta-base) para clasificación de secuencias |
| Parametros totales | 82.129.166 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (se distribuye en safetensors y ONNX; no se documentan cuantizaciones) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PyTorch/Transformers) y ONNX (`onnx/model.onnx`, `tokenizer.json`, `spendcoder.json`) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de distilroberta-base, un transformer encoder de tipo RoBERTa destilado, adaptado como `AutoModelForSequenceClassification` con 14 etiquetas de salida. La tarea es de clasificación de una sola línea de texto corta (descripción de compra o factura), no de generación. El repositorio incluye además una exportación ONNX con el tokenizador y un fichero `spendcoder.json` que contiene las etiquetas y el umbral de revisión, lo que permite servir el modelo en CPU con onnxruntime sin dependencia de PyTorch.

Los datos de entrenamiento provienen de descripciones de contratos del Departamento de Energía de EE. UU. y sus Product and Service Codes, obtenidos de USAspending.gov (dominio público), agrupados en 14 categorías de gasto. El conjunto se divide en 17.098 líneas de entrenamiento (contratos iniciados antes de octubre de 2023), 2.065 de validación (octubre de 2023 a septiembre de 2024) y 1.547 de test (desde octubre de 2024). Se eliminaron del test las líneas cuyo texto exacto aparecía en entrenamiento. No se documentan en la información disponible detalles sobre el proceso de entrenamiento (hiperparámetros, número de épocas, técnicas de regularización) ni sobre el uso de RLHF o DPO, que no aplican a este tipo de modelo de clasificación.

## Capacidades

- Clasificación de líneas de compra o factura en 14 categorías de gasto: Engineering & professional services, Research & development, Facility operations & management, Construction & building maintenance, Equipment maintenance & repair, IT & telecom services, Environmental services, Utilities, security & housekeeping, Other services, IT hardware & software, Electrical & power equipment, Lab instruments & chemicals, Vehicles & machinery y Other goods.
- Salida con puntuación de confianza, que permite aplicar un umbral de revisión y derivar líneas dudosas a revisión humana.
- Despliegue en CPU mediante ONNX Runtime, sin necesidad de PyTorch.
- Integración con la librería Transformers (`AutoModelForSequenceClassification.from_pretrained(...)`).
- Compatible con text-embeddings-inference y endpoints según las etiquetas del repositorio.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto: es exclusivamente un clasificador.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Codificación automática de líneas de cuentas a pagar: el modelo clasifica cada línea de factura en una de las 14 categorías y, aplicando el umbral de revisión de 0,95, deriva a un humano las líneas de baja confianza. Es adecuado porque está entrenado específicamente sobre descripciones de compra y factura del sector público.
- Enrutamiento de compras en procurement: las líneas se asignan a la categoría de gasto correspondiente para dirigirlas al equipo o flujo de aprobación adecuado, reduciendo la clasificación manual.
- Preetiquetado para revisión humana: el modelo sugiere una categoría y una confianza, y el revisor solo confirma o corrige, lo que acelera el proceso sin asumir el riesgo de un posting automático.
- Limpieza y consolidación de datos de gasto histórico: clasificación masiva de descripciones de contratos o facturas antiguas para análisis de spend por categoría.
- Despliegue ligero en entornos sin GPU: gracias a la exportación ONNX y a sus 82 millones de parámetros, puede servirse en CPU con onnxruntime en un servicio interno de clasificación.
- Prototipado y evaluación de pipelines de codificación de gasto: sirve como referencia inicial para comparar con reglas, TF-IDF o modelos mayores antes de invertir en un desarrollo a medida.
- Filtrado y control de calidad en la entrada de facturas: detección de líneas mal descritas o ambiguas que deben revisarse antes de continuar el proceso.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el año de test (contratos no vistos por el modelo):

| Modelo | Accuracy | Macro F1 | Weighted F1 |
|---|---|---|---|
| TF-IDF + regresión logística (baseline) | 0,673 | 0,616 | 0,675 |
| distilroberta-base fine-tuned (SpendCoder) | 0,675 | 0,547 | 0,667 |

Con el umbral de revisión elegido (0,95), el 31,3 % de las líneas de test se codifican automáticamente con un 88,8 % de acierto; el resto se deriva a una persona.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 82 millones de parámetros; en fp32 ocupa aproximadamente 0,33 GB de pesos, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU con onnxruntime. Cualquier GPU consumer (por ejemplo, RTX 3060 o superior) es más que suficiente si se quiere acelerar el procesamiento por lotes.
- Cabe en GPU consumer: sí, en todas las GPU consumer actuales, e incluso en CPU.
- Opciones de despliegue: Transformers (PyTorch), ONNX Runtime (exportación incluida en `onnx/`), text-embeddings-inference y endpoints compatibles según las etiquetas del repositorio.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SpendCoder (distilroberta-base fine-tuned) | 82.129.166 | No disponible | Clasificación de líneas de gasto en 14 categorías | Apache 2.0 | Hugging Face y GitHub |
| TF-IDF + regresión logística (baseline del autor) | No aplica | No aplica | Clasificación de líneas de gasto | No disponible | Referenciado en la model card |
| distilroberta-base (modelo base) | No disponible en la información | No disponible | Modelo encoder general, sin cabeza de clasificación de gasto | Apache 2.0 | Hugging Face |

No se dispone de información sobre otros modelos comparables de clasificación de gasto en la documentación proporcionada.

## Limitaciones y advertencias

- Entrenado con la redacción de un único comprador del sector público (Departamento de Energía de EE. UU.); antes de usarlo en otra empresa hay que evaluarlo con líneas etiquetadas de esa empresa y, probablemente, hacer un fine-tuning adicional.
- Solo soporta inglés.
- El rendimiento en macro F1 es inferior al del baseline TF-IDF (0,547 frente a 0,616), lo que indica un peor comportamiento en las categorías minoritarias.
- No debe usarse para contabilización automática sin revisión: la model card indica explícitamente que no es para posting automático sin revisión humana.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de clasificación errónea con alta confianza; el umbral de 0,95 solo codifica automáticamente el 31,3 % de las líneas, con un 88,8 % de acierto en ese subconjunto.
- No se documentan sesgos conocidos en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero no se ofrecen garantías sobre el rendimiento en dominios distintos al de entrenamiento.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/Saeedhoj/spendcoder-distilroberta
- Repositorio de código, preparación de datos y tests: https://github.com/saeedm31/SpendCoder
- Fuente de datos: https://www.usaspending.gov
- Modelo base: https://huggingface.co/distilbert/distilroberta-base

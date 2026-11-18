# ryanrovshen/xlm-roberta-base-pii-en-ko

## Resumen

`xlm-roberta-base-pii-en-ko` es un modelo de clasificación de tokens (token classification) desarrollado por el usuario ryanrovshen, consistente en un fine-tuning de `FacebookAI/xlm-roberta-base` para la detección de datos personales (PII) en textos en inglés y coreano. El modelo identifica siete tipos de entidades sensibles: nombres de personas, teléfonos, correos electrónicos, números de tarjeta, direcciones postales, números de cuenta bancaria/IBAN y números de registro coreanos (주민등록번호 y 외국인등록번호).

Su propósito declarado es actuar como capa de modelo dentro de una pasarela de anonimización que enmascara datos personales antes de enviar un mensaje a un LLM alojado. Se distribuye tanto en formato ONNX (con tabla de embeddings cuantizada a 8 bits, 533 MB) como en safetensors en fp32 (1,1 GB), y está pensado para ejecutarse en CPU junto a una capa de reglas complementaria. La licencia es MIT, lo que permite uso comercial sin restricciones adicionales.

El modelo es relevante para desarrolladores que necesiten una primera barrera de privacidad local y de baja latencia (32 ms por texto en CPU de portátil) antes de delegar contenido en servicios de terceros. No obstante, al haberse entrenado únicamente con datos sintéticos, su rendimiento en texto real cae de forma notable en entidades como nombres y direcciones, por lo que debe considerarse una pieza más de un sistema de defensa en profundidad y no una solución de cumplimiento por sí sola.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa base) con cabeza de clasificación de tokens |
| Parámetros totales | 277.464.591 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (el autor indica que textos más largos deben dividirse en ventanas solapadas) |
| Tipos de cuantización | Embeddings en int8 (ONNX, `model.emb8.onnx`); safetensors en fp32; cuantización completa a 8 bits descartada por pérdida de recall |
| Idiomas soportados | inglés (en) y coreano (ko) |
| Licencia | MIT |
| Formato de pesos | safetensors (fp32, 1,1 GB) y ONNX (embeddings int8, 533 MB) |

## Arquitectura y entrenamiento

El modelo parte de `FacebookAI/xlm-roberta-base`, un encoder transformer de 277 millones de parámetros, y se afina como clasificador de tokens con etiquetado BIO de 15 etiquetas (siete tipos de entidad más la etiqueta `O`). Todos los pesos se actualizan durante el fine-tuning. La salida es una secuencia de etiquetas por token que el consumidor debe decodificar a spans de caracteres, con recorte de partículas y puntuación.

El entrenamiento se realizó sobre el dataset `ai4privacy/pii-masking-openpii-1.5m`, con 8.000 ejemplos de entrenamiento según la model card. Los datos son íntegramente sintéticos: todos los valores (nombres, direcciones, números) fueron generados. No se documenta en la información disponible el uso de RLHF, DPO ni otras técnicas de alineación, algo esperable en un modelo discriminativo de este tipo. La innovación técnica destacable es la decisión de cuantizar únicamente la tabla de embeddings a 8 bits: al ser una tabla de 250.000 tokens × 768 dimensiones que solo se consulta y nunca se multiplica, la pérdida de precisión es de como máximo 0,1 puntos, mientras que cuantizar todos los pesos a 8 bits resultó tres veces más rápido pero perdió 2 puntos de recall en el test principal y 12 en el externo, por lo que ese archivo no se publicó.

## Capacidades

- Detección de siete tipos de PII: `PERSON`, `PHONE`, `EMAIL`, `CARD`, `ADDRESS`, `ACCOUNT` y `KR_RRN`.
- Clasificación de tokens a nivel de carácter con etiquetado BIO, apta para extracción de spans exactos.
- Procesamiento bilingüe inglés-coreano en un único modelo multilingüe afinado.
- Ejecución en CPU sin PyTorch mediante ONNX Runtime, con latencia mediana de 32 ms por texto con dos hilos.
- Integración con la librería `transformers` mediante pipeline `token-classification` con `aggregation_strategy="simple"`.
- Diseñado para combinarse con una capa de reglas externa que mejora el recall en los conjuntos evaluados.
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni audio: es un modelo exclusivamente discriminativo de etiquetado.

## Casos de uso

- Pasarela de anonimización previa a un LLM alojado: el modelo se ejecuta en CPU junto a una capa de reglas y enmascara nombres, teléfonos y correos antes de que el texto salga del perímetro de la organización. Es su caso de uso declarado y para el que se midieron los resultados.
- Cumplimiento de privacidad en logs y telemetría: filtrado de campos PII en registros de aplicaciones antes de enviarlos a un sistema de observabilidad o a un almacén centralizado, aprovechando el formato ONNX de 533 MB para despliegue ligero.
- Preprocesado de datos para entrenamiento: limpieza de datasets en inglés y coreano que contengan datos personales antes de usarlos en fine-tuning de otros modelos, reduciendo el riesgo de memorización de PII.
- Atención al cliente en coreano e inglés: detección de números de registro coreano (`KR_RRN`) y números de cuenta en transcripciones de tickets antes de su almacenamiento o análisis, con la capa de reglas cubriendo los casos sin palabra contextual cercana.
- Enmascaramiento en pipelines de correo electrónico: identificación de direcciones postales y correos en cuerpos de mensajes para su redacción automática antes del archivado, con la advertencia de que las direcciones en estilos no vistos se detectan solo al 50 %.
- Moderación de contenido generado por usuarios: marcado de PII en publicaciones o comentarios en foros bilingües antes de la revisión humana, usando el modelo como primer filtro de bajo coste.
- Anonimización de documentos financieros: detección de números de tarjeta y cuentas bancarias en extractos o facturas en inglés y coreano, con la limitación conocida de que las cuentas sin palabra contextual cercana se escapan.

## Benchmarks y rendimiento

Resultados en la vista de fuga (una entidad se considera detectada solo si todos sus caracteres están cubiertos por spans predichos). Recall / precisión en porcentaje.

| Conjunto de test | Modelo solo | Con capa de reglas |
|---|---|---|
| Principal: 1.000 ejemplos, 2.012 entidades | 98,5 / 99,2 | 99,4 / 99,1 |
| Externo: 300 filas fuente, 724 entidades | 76,4 / 99,1 | 77,9 / 98,6 |
| Adversarial: 70 ejemplos escritos a mano, 82 entidades | no medido | 87,8 / 96,2 |

Desglose por tipo, modelo solo (recall / precisión):

| Tipo | Test principal | Test externo |
|---|---|---|
| `PERSON` | 99,4 / 99,1 | 57,8 / 98,4 |
| `PHONE` | 100 / 99,6 | 100 / 100 |
| `EMAIL` | 99,6 / 100 | 93,1 / 99,3 |
| `CARD` | 100 / 99,3 | 97,2 / 100 |
| `ADDRESS` | 100 / 98,4 | 50,0 / 98,8 |
| `ACCOUNT` | 89,2 / 100 | sin ejemplos |
| `KR_RRN` | 98,3 / 98,4 | 100 / 100 |

Falsos positivos en ejemplos sin PII: 5 de 120 en el test principal y 1 de 24 en el externo. El autor advierte que el test principal procede de los mismos generadores que los datos de entrenamiento y por tanto es optimista, mientras que el externo es el dataset fuente sin tocar y resulta severo; el texto real se sitúa entre ambos.

## Requisitos de hardware

- VRAM estimada: no requiere GPU; el archivo ONNX de 533 MB cabe en memoria RAM de cualquier equipo y el safetensors fp32 ocupa 1,1 GB.
- GPU recomendadas: no necesarias. Cualquier GPU consumer (RTX 3060 o superior) aceleraría la inferencia, pero el diseño apunta a CPU.
- Cabe en GPU consumer: sí, en cualquier modelo con al menos 2 GB de VRAM, aunque el despliegue previsto es en CPU.
- Opciones de despliegue: ONNX Runtime (formato servido y medido), `transformers` con pipeline `token-classification`, y cualquier runtime compatible con safetensors.
- Latencia y throughput: 32 ms por texto en mediana en CPU de portátil con dos hilos (ONNX Runtime). No se publican cifras de throughput ni de latencia en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| `ryanrovshen/xlm-roberta-base-pii-en-ko` | 277 M | 512 tokens | en, ko | MIT | PII, 7 tipos, datos sintéticos |
| `FacebookAI/xlm-roberta-base` | 277 M | 512 tokens | 100 idiomas | MIT | Modelo base sin fine-tuning de PII |
| `dslim/bert-base-NER` | 110 M | 512 tokens | en | MIT | NER genérico (PER, ORG, LOC, MISC) |
| `ai4privacy/pii-masking-openpii-1.5m` (dataset) | no aplica | no aplica | en, ko | no disponible | Corpus sintético de origen |

La comparación con `dslim/bert-base-NER` es aproximada: aquel detecta entidades nombradas genéricas, no PII específica como tarjetas o cuentas, y solo en inglés. No se dispone de benchmarks comparativos directos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente con datos sintéticos: en el test externo, nombres y direcciones escritos de forma distinta se detectan solo en torno al 50 % (recall de 57,8 para `PERSON` y 50,0 para `ADDRESS`).
- Los números de cuenta bancaria sin palabras como "account" o "계좌" cerca se escapan tanto al modelo como a las reglas (1 de 7 en el conjunto adversarial).
- Solo inglés y coreano: el modelo base conoce cien idiomas, pero el fine-tuning cubre dos.
- Una sola ejecución de entrenamiento con una sola semilla; el intervalo de confianza al 95 % para el recall en el test principal es de 97,8 a 98,9.
- Los textos de más de 512 tokens deben dividirse en ventanas solapadas por parte del consumidor.
- Reduce la cantidad de PII que sale de un sistema, pero no es una garantía ni una herramienta de cumplimiento por sí sola.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de falsos positivos (5 de 120 en el test principal) y de spans mal delimitados en fronteras, ya que el pipeline de `transformers` agrupa tokens de forma ligeramente distinta al decodificador de la pasarela.
- Licencia MIT: permite uso comercial sin restricciones adicionales, pero no exime de las obligaciones legales de protección de datos aplicables.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ryanrovshen/xlm-roberta-base-pii-en-ko
- Demo (Space): https://huggingface.co/spaces/ryanrovshen/pii-gateway
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-base
- Dataset de entrenamiento: https://huggingface.co/datasets/ai4privacy/pii-masking-openpii-1.5m

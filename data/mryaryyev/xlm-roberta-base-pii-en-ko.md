# mryaryyev/xlm-roberta-base-pii-en-ko

## Resumen

`xlm-roberta-base-pii-en-ko` es un modelo de clasificación de tokens (token classification) desarrollado por el usuario mryaryyev, consistente en un ajuste fino de `FacebookAI/xlm-roberta-base` para la detección de datos personales identificables (PII) en textos en inglés y coreano. El modelo identifica siete tipos de entidad: nombres de personas, teléfonos, correos electrónicos, tarjetas de pago, direcciones postales, números de cuenta bancaria y números de registro de residentes coreanos (주민등록번호). Su propósito declarado es actuar como capa de modelo dentro de una pasarela que enmascara datos personales antes de enviar un mensaje a un LLM alojado, ejecutándose en CPU junto a una capa de reglas.

Arquitectónicamente es un transformer encoder XLM-RoBERTa de 277 millones de parámetros con una cabeza de clasificación token a token sobre 15 etiquetas BIO. El contexto máximo es de 512 tokens, limitación inherente al modelo base. Se distribuye en dos formatos: pesos safetensors en precisión de 32 bits (1,1 GB) y un ONNX con la tabla de embeddings cuantizada a 8 bits (533 MB), que es el que el autor sirve y con el que se midieron los resultados publicados.

La relevancia del modelo reside en su enfoque práctico de privacidad: en lugar de un detector genérico multilingüe, ofrece un ajuste específico para inglés y coreano con métricas desglosadas por tipo de entidad y por conjunto de evaluación, incluyendo un conjunto externo sin tocar y un conjunto adversarial. La licencia MIT facilita su integración en productos comerciales, aunque el propio autor advierte que no es una herramienta de cumplimiento por sí sola.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa base) con cabeza de clasificación de tokens |
| Parámetros totales | 277.464.591 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantización | Pesos safetensors en FP32; ONNX con tabla de embeddings en int8 (resto de pesos sin especificar) |
| Idiomas soportados | Inglés (en) y coreano (ko) |
| Licencia | MIT |
| Formato de pesos | safetensors (FP32, 1,1 GB) y ONNX (`model.emb8.onnx` + `model.emb8.onnx.data`, 533 MB) |

## Arquitectura y entrenamiento

El modelo parte de `FacebookAI/xlm-roberta-base`, un encoder transformer de 277 millones de parámetros, y actualiza todos los pesos durante el ajuste fino. La cabeza de salida es una capa de clasificación token a token sobre 15 etiquetas en formato BIO, que cubren las siete entidades más la etiqueta `O` y las variantes `B-`/`I-`. No se trata de un modelo generativo ni de un MoE: es un extractor de spans puro.

El entrenamiento se realizó sobre el dataset `ai4privacy/pii-masking-openpii-1.5m`, con aproximadamente 8.000 textos según la información disponible. Todos los valores del conjunto de entrenamiento son sintéticos, generados automáticamente, lo que explica la brecha entre el rendimiento en el conjunto principal (generado por los mismos generadores) y el conjunto externo (filas del dataset original sin procesar). No se menciona uso de RLHF ni DPO, algo esperable en una tarea de etiquetado supervisado. La innovación técnica destacable no está en la arquitectura sino en la estrategia de cuantización: el autor conserva la tabla de embeddings (250.000 tokens × 768 dimensiones) en 8 bits porque solo se consulta, nunca se multiplica, lo que reduce el archivo a la mitad con una pérdida máxima de 0,1 puntos. Cuantizar todos los pesos a 8 bits resultó tres veces más rápido pero perdió 2 puntos de recall en el conjunto principal y 12 en el externo, por lo que ese archivo no se publica.

## Capacidades

- Detección de siete tipos de PII: `PERSON`, `PHONE`, `EMAIL`, `CARD`, `ADDRESS`, `ACCOUNT` y `KR_RRN` (números de registro de residentes y extranjeros coreanos).
- Clasificación de tokens con etiquetas BIO y decodificación a spans de caracteres con recorte de partículas y puntuación.
- Procesamiento bilingüe inglés-coreano en un único modelo.
- Ejecución en CPU sin PyTorch mediante ONNX Runtime, con latencia mediana de 32 ms por texto con dos hilos.
- Integración con la librería `transformers` mediante `pipeline("token-classification")`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio: es un modelo discriminativo de extracción de entidades.
- No dispone de modo "thinking" ni de generación de texto libre.

## Casos de uso

- Pasarela de anonimización previa a LLM: el modelo se sitúa delante de una API de modelo generativo alojado y enmascara nombres, teléfonos y correos antes de que el texto salga del perímetro de la organización. Su latencia de 32 ms en CPU permite desplegarlo en el mismo host sin GPU dedicada.
- Cumplimiento de protección de datos en atención al cliente: en un sistema de tickets o chat, el modelo detecta y redacta PII en inglés y coreano antes de almacenar transcripciones o enviarlas a sistemas analíticos, reduciendo la superficie de exposición en registros históricos.
- Enmascaramiento en pipelines de logging: integrado como paso previo al envío de logs a un agregador externo, filtra números de tarjeta y cuentas bancarias que aparecen en trazas de aplicación o mensajes de error.
- Preprocesado de datasets para entrenamiento: al preparar corpus bilingües, el modelo permite identificar y sustituir datos personales reales por placeholders antes de publicar o compartir el dataset, especialmente útil con el par inglés-coreano poco cubierto por detectores genéricos.
- Filtrado en herramientas internas de RRHH o soporte: en formularios y correos internos en coreano, detecta números de registro de residentes (`KR_RRN`) que de otro modo pasarían a bases de datos secundarias.
- Capa de modelo complementaria a reglas: dado que el autor reporta que la combinación con una capa de reglas eleva el recall del 98,5 % al 99,4 % en el conjunto principal, el modelo encaja como componente de un sistema híbrido donde las reglas cubren patrones fijos (IBAN, tarjetas) y el modelo cubre variabilidad (nombres, direcciones).
- Moderación de contenido en foros bilingües: detección de datos personales publicados por usuarios en comunidades en inglés y coreano antes de que el contenido se haga visible.

## Benchmarks y rendimiento

Resultados publicados por el autor, en porcentaje de recall / precisión, medidos en "leak view" (una entidad se considera detectada solo si todos sus caracteres están cubiertos por spans predichos, independientemente del tipo):

| Conjunto de test | Modelo solo | Con capa de reglas |
|---|---|---|
| Principal: 1.000 ejemplos, 2.012 entidades | 98,5 / 99,2 | 99,4 / 99,1 |
| Externo: 300 filas originales, 724 entidades | 76,4 / 99,1 | 77,9 / 98,6 |
| Adversarial: 70 ejemplos escritos a mano, 82 entidades | no medido | 87,8 / 96,2 |

Desglose por tipo de entidad, modelo solo (recall / precisión):

| Tipo | Test principal | Test externo |
|---|---|---|
| `PERSON` | 99,4 / 99,1 | 57,8 / 98,4 |
| `PHONE` | 100 / 99,6 | 100 / 100 |
| `EMAIL` | 99,6 / 100 | 93,1 / 99,3 |
| `CARD` | 100 / 99,3 | 97,2 / 100 |
| `ADDRESS` | 100 / 98,4 | 50,0 / 98,8 |
| `ACCOUNT` | 89,2 / 100 | sin ejemplos |
| `KR_RRN` | 98,3 / 98,4 | 100 / 100 |

Falsos positivos en textos sin PII: 5 de 120 en el conjunto principal y 1 de 24 en el externo. El autor señala que el conjunto principal procede de los mismos generadores que el entrenamiento y por tanto es optimista, mientras que el externo es duro; el rendimiento en texto real se sitúa entre ambos. El intervalo de confianza al 95 % para el recall en el conjunto principal es 97,8–98,9.

## Requisitos de hardware

- VRAM estimada: el modelo es pequeño (277 M de parámetros). En FP32 ocupa unos 1,1 GB de memoria; el ONNX con embeddings en int8 ocupa 533 MB en disco y una cantidad de memoria similar o inferior en ejecución.
- GPU recomendadas: no requiere GPU. Puede ejecutarse en CPU con ONNX Runtime con 32 ms de latencia mediana por texto con dos hilos. En GPU, cualquier tarjeta con 2 GB o más es suficiente (RTX 3060, RTX 4090, A100, H100), aunque el beneficio es marginal para esta carga.
- Cabe en cualquier GPU de consumo, incluidas integradas, y en CPU de portátil.
- Opciones de despliegue: ONNX Runtime (formato recomendado por el autor), `transformers` con `pipeline("token-classification")`, y potencialmente servidores compatibles con modelos de token classification. No se mencionan integraciones específicas con vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos generativos.
- Throughput: no disponible más allá de la latencia mediana de 32 ms por texto en CPU de portátil con dos hilos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| `mryaryyev/xlm-roberta-base-pii-en-ko` | 277 M | 512 | en, ko | MIT | Detección de PII, 7 entidades |
| `FacebookAI/xlm-roberta-base` | 277 M | 512 | ~100 | MIT | Modelo base sin ajuste de PII |
| Detectores NER multilingües genéricos (p. ej. ajustes de XLM-R para NER) | ~277 M | 512 | variable | variable | NER general (PER, LOC, ORG, MISC), no PII específica |

No se dispone de datos de benchmarks comparativos con alternativas específicas de detección de PII en la información proporcionada. La comparación con el modelo base es estructural: comparten arquitectura y tamaño, pero el ajuste añade la cabeza de clasificación de 15 etiquetas BIO y la especialización bilingüe inglés-coreano.

## Limitaciones y advertencias

- Entrenado exclusivamente con datos sintéticos: el rendimiento en el conjunto externo (recall del 76,4 %) muestra que en nombres y direcciones con estilos no vistos se pierde aproximadamente la mitad de las entidades.
- Los números de cuenta bancaria sin una palabra contextual como "account" o "계좌" cerca se pierden tanto por el modelo como por las reglas (1 de 7 en el conjunto adversarial).
- Solo inglés y coreano: el modelo base conoce un centenar de idiomas, pero el ajuste fino cubre únicamente dos.
- Una sola ejecución de entrenamiento con una sola semilla; el intervalo de confianza al 95 % del recall en el conjunto principal es 97,8–98,9, lo que deja margen de variabilidad no explorado.
- Los textos de más de 512 tokens deben dividirse en ventanas solapadas por parte del llamador; el modelo no gestiona contextos largos de forma nativa.
- Reduce la cantidad de datos personales que salen de un sistema, pero no es una garantía ni una herramienta de cumplimiento por sí sola; el autor lo indica explícitamente.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de falsos negativos (PII no detectada) y falsos positivos (spans que tocan datos reales pero con tipo incorrecto, aceptados en la métrica de leak view).
- La licencia MIT permite uso comercial sin restricciones adicionales, pero conviene verificar la procedencia del dataset de entrenamiento (`ai4privacy/pii-masking-openpii-1.5m`) para usos regulados.
- El pipeline de `transformers` agrupa tokens de forma ligeramente distinta a la decodificación propia de la pasarela del autor, por lo que los límites de span pueden variar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mryaryyev/xlm-roberta-base-pii-en-ko
- Space de demostración: https://huggingface.co/spaces/ryanrovshen/pii-gateway
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-base
- Dataset de entrenamiento: https://huggingface.co/datasets/ai4privacy/pii-masking-openpii-1.5m

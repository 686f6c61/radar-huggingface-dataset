# praveen-ritual/pii-redactor

## Resumen

pii-redactor es un modelo de clasificación de tokens (token-classification) especializado en la detección de información personal identificable (PII) en texto multilingüe. Lo desarrolla el usuario praveen-ritual y se publica bajo licencia Apache 2.0. Se trata de un fine-tune completo sobre `microsoft/Multilingual-MiniLM-L12-H384`, con una cabeza de clasificación de tokens entrenada desde cero, no copiada de otro modelo de PII. El modelo resuelve el problema de localizar y etiquetar exactamente fragmentos de texto que contienen datos sensibles (nombres, direcciones, identificadores, datos financieros, secretos, etc.), lo que lo hace útil como componente de anonimización y cumplimiento normativo.

La arquitectura es un transformer encoder BERT multilingüe de 117.517.855 parámetros totales, con una ventana de inferencia de 256 tokens y un stride de 64 para procesar documentos largos por fragmentos solapados. El checkpoint se publica tanto en formato PyTorch (safetensors) como en ONNX (opset 17) con cuantización weight-only INT8, de modo que ambos forwards producen resultados equivalentes.

Su relevancia actual radica en que ofrece una alternativa ligera y desplegable en CPU para pipelines de redacción de PII, con métricas publicadas por tipo de entidad en cuatro conjuntos de evaluación distintos (Gretel EN, Gretel Finance, Nemotron y OpenPII) y una micro F1 global de 0,9293 en el conjunto Nemotron. El modelo se distribuye con 0 descargas y 0 likes en el momento de la consulta, lo que indica que es una publicación reciente y de nicho.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT (base: microsoft/Multilingual-MiniLM-L12-H384) con cabeza de token-classification |
| Parámetros totales | 117.517.855 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana de 256 tokens con stride de 64 (procesamiento por fragmentos) |
| Tipos de cuantización | ONNX weight-only INT8 (MatMul en INT8 con una escala por grupo de 8 features de entrada); checkpoint PyTorch con los mismos pesos dequantizados |
| Idiomas soportados | multilingüe (según metadatos; no se detalla la lista de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX (opset 17) |
| Tamaño del repo | 0,9 GB |
| Pipeline | token-classification |
| Librería | transformers |
| Precisión de entrenamiento | bf16 |

## Arquitectura y entrenamiento

El modelo parte de `microsoft/Multilingual-MiniLM-L12-H384` (revisión `6e8c1ec6b4ec4e3fc6eb7d2cd834fcd582b61daf`), un encoder transformer BERT de 12 capas y 384 dimensiones ocultas, sobre el que se añade una cabeza de clasificación de tokens inicializada desde cero. El fine-tune es completo (no se congela el encoder en la configuración ganadora) y se realizó en bf16 con ventana de 256 tokens y stride de 64. Los datos de entrenamiento provienen de cuatro conjuntos: `nvidia/Nemotron-PII`, `gretelai/gretel-pii-masking-en-v1`, `gretelai/synthetic_pii_finance_multilingual` y `ai4privacy/pii-masking-openpii-1m`.

El autor documenta un barrido de hiperparámetros con cinco configuraciones, seleccionando la de mayor micro F1 exact-span en held-out (regla de desempate: mayor HTTP micro F1 si la diferencia es inferior a 0,001 absoluto). La configuración ganadora fue `lr5e5_ep5_trainable_base`: learning rate 5e-05, 5 épocas, embeddings entrenables y sin slices extra. Se realizaron 17.455 pasos de entrenamiento en 4.466,6 segundos, con batch size 96 y semilla 20261119. La innovación técnica destacable es la publicación de un ONNX con cuantización weight-only INT8 (opset 17) que replica exactamente los pesos del checkpoint PyTorch dequantizado, garantizando paridad entre ambos forwards. Las entradas son `input_ids` y `attention_mask`; la salida es `logits`.

## Capacidades

- Detección y etiquetado de entidades PII a nivel de span exacto (coincidencia de inicio, fin y tipo).
- Tipos de entidad cubiertos: PERSON, CONTACT, ADDRESS, GOV_ID, FINANCIAL, SECRET, NETWORK_ID, RECORD_ID, DATE_OF_BIRTH, DATE, LOCATION, ORGANIZATION, AGE, DEMOGRAPHIC y OTHER.
- Procesamiento multilingüe (según metadatos del modelo).
- Clasificación de tokens por fragmentos solapados (ventana 256, stride 64) para cubrir documentos largos.
- Inferencia en PyTorch (transformers) y en ONNX Runtime con pesos INT8.
- No soporta tool calling ni function calling (es un modelo de clasificación, no generativo).
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Anonimización de documentos antes de enviarlos a un LLM externo: el modelo detecta spans de PII y permite sustituirlos por marcadores antes de la llamada a la API, reduciendo el riesgo de fuga de datos.
- Cumplimiento del RGPD en pipelines de ingesta: integrado como paso previo al almacenamiento, etiqueta identificadores gubernamentales, datos financieros y contactos para su enmascarado o borrado.
- Redacción de logs de aplicaciones: procesa líneas de log por fragmentos de 256 tokens para localizar IPs, emails, tokens y secretos (NETWORK_ID, SECRET) antes de persistirlos.
- Enmascarado de datasets para fine-tuning: etiqueta nombres, direcciones y fechas de nacimiento en corpus de entrenamiento para evitar que el modelo los memorice.
- Procesamiento de tickets de soporte: detecta datos personales en conversaciones multi-turno y permite redactarlos antes de que lleguen a herramientas de analítica.
- Despliegue en edge o CPU: gracias a su tamaño (117,5 M de parámetros) y al ONNX INT8, puede ejecutarse en servidores sin GPU dentro de un servicio de preprocesado de baja latencia.
- Enriquecimiento de datos financieros: el conjunto Gretel Finance evalúa su comportamiento en dominios bancarios, útil para redactar extractos o formularios antes de su archivado.

## Benchmarks y rendimiento

Resultados publicados por el autor (micro F1 exact-span, checkpoint ganador):

| Conjunto de evaluación | Micro F1 | Precisión | Recall | Comparativa one-epoch | Comparativa untrained |
|---|---:|---:|---:|---:|---:|
| eval_gretel_en | 0,9121 (INT8) | 0,9002 | 0,9242 | 0,8592 | 0,0000 |
| eval_gretel_finance | 0,7443 (INT8) | 0,6632 | 0,8482 | 0,6864 | 0,0003 |
| eval_nemotron | 0,9293 | 0,9004 | 0,9601 | 0,9131 | 0,0004 |
| eval_openpii | 0,8920 | 0,8787 | 0,9058 | 0,8393 | 0,0024 |

F1 por tipo de entidad destacados en eval_nemotron: PERSON 0,9850, CONTACT 0,9778, FINANCIAL 0,9644, RECORD_ID 0,9610, ORGANIZATION 0,9476, LOCATION 0,9448, DATE_OF_BIRTH 0,9406, ADDRESS 0,9276, GOV_ID 0,9267, SECRET 0,9156, DEMOGRAPHIC 0,8564, NETWORK_ID 0,8551, DATE 0,8217, AGE 0,8074.

F1 por tipo destacados en eval_gretel_en: CONTACT 0,9635, RECORD_ID 0,9543, GOV_ID 0,9429, DEMOGRAPHIC 0,9371, NETWORK_ID 0,9345, ADDRESS 0,9243, FINANCIAL 0,9086, SECRET 0,8923, DATE_OF_BIRTH 0,8860, PERSON 0,8513, ORGANIZATION 0,8452, DATE 0,8217, LOCATION 0,7678.

En eval_gretel_finance los peores tipos son LOCATION (0,5338), SECRET (0,6382) y FINANCIAL (0,7132), lo que indica degradación en dominio financiero. En eval_openpii destacan DEMOGRAPHIC 0,9661 y LOCATION 0,9549, con PERSON en 0,8257 y AGE en 0,7982.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint en bf16 ocupa aproximadamente 235 MB de pesos (117,5 M de parámetros × 2 bytes); en ONNX INT8, unos 118 MB. Con activaciones y overhead de runtime, el consumo se mantiene por debajo de 1 GB en la mayoría de configuraciones.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060, RTX 4090, A100 y H100 son sobredimensionadas para este modelo. Funciona correctamente en CPU.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna (GTX 1650 en adelante) e incluso en iGPU y CPU.
- Opciones de despliegue: transformers (PyTorch), ONNX Runtime (recomendado para INT8), y servidores compatibles con el pipeline token-classification (por ejemplo, TGI o endpoints de Hugging Face). No se documenta soporte específico para vLLM o llama.cpp, que están orientados a modelos generativos.
- Latencia y throughput: no disponibles en la información proporcionada. El entrenamiento se completó en 4.466,6 segundos para 17.455 pasos con batch 96, pero no se publican cifras de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| praveen-ritual/pii-redactor | 117,5 M | ventana 256, stride 64 | token-classification PII | Apache 2.0 | Hugging Face (0 descargas) |
| microsoft/Multilingual-MiniLM-L12-H384 | ~117 M | 512 tokens (BERT estándar) | encoder multilingüe genérico | MIT (según modelo base) | Hugging Face, ampliamente usado |
| Modelos PII basados en BERT publicados en Hugging Face | variable | variable | token-classification PII | variable | Hugging Face |

No se dispone de datos de benchmarks de modelos competidores en la información proporcionada, por lo que no es posible una comparación cuantitativa de rendimiento. La comparativa con el modelo base es la más directa: pii-redactor añade una cabeza entrenada específicamente para PII y publica métricas por tipo de entidad, mientras que el modelo base no realiza esta tarea de forma nativa.

## Limitaciones y advertencias

- El modelo tiene 0 descargas y 0 likes en el momento de la consulta; no hay validación independiente por parte de la comunidad.
- Los resultados en dominio financiero son notablemente inferiores: micro F1 de 0,7443 en eval_gretel_finance frente a 0,9293 en eval_nemotron. Tipos como LOCATION (0,5338) y SECRET (0,6382) son poco fiables en ese dominio.
- La clase AGE no tiene soporte en eval_gretel_en ni en eval_gretel_finance (support 0), y en eval_openpii obtiene F1 0,7982; su cobertura es desigual.
- La ventana de 256 tokens con stride 64 puede fragmentar entidades que crucen los límites de ventana; el autor no documenta una estrategia de fusión de spans entre ventanas.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de falsos positivos y falsos negativos en la detección de spans; la precisión en PERSON en eval_gretel_finance es solo 0,6417.
- No se detalla la lista concreta de idiomas cubiertos pese a la etiqueta "multilingual"; la cobertura real por idioma no está documentada.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; el modelo se publica tal cual.
- El ONNX INT8 usa una escala por grupo de 8 features de entrada, lo que puede introducir diferencias numéricas frente al checkpoint bf16 en algunos entornos; el autor afirma que los forwards coinciden, pero no publica métricas de paridad separadas.
- No se han publicado resultados de benchmarks frente a modelos competidores de PII, solo frente a variantes del propio entrenamiento (one-epoch y untrained).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/praveen-ritual/pii-redactor
- Modelo base: https://huggingface.co/microsoft/Multilingual-MiniLM-L12-H384
- Dataset nvidia/Nemotron-PII: https://huggingface.co/datasets/nvidia/Nemotron-PII
- Dataset gretelai/gretel-pii-masking-en-v1: https://huggingface.co/datasets/gretelai/gretel-pii-masking-en-v1
- Dataset gretelai/synthetic_pii_finance_multilingual: https://huggingface.co/datasets/gretelai/synthetic_pii_finance_multilingual
- Dataset ai4privacy/pii-masking-openpii-1m: https://huggingface.co/datasets/ai4privacy/pii-masking-openpii-1m

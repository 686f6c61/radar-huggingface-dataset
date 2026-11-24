# blue2959/Llama-ai4privacy-piiguard-bert-noisy-s2

## Resumen

Llama-ai4privacy-piiguard-bert-noisy-s2 es un modelo de clasificación de tokens (token-classification) especializado en la detección de información personal identificable (PII) en textos en inglés. Lo publica el usuario blue2959 como parte del proyecto de curso PIIGuard (CSED490E) y se construye mediante fine-tuning del modelo base gravitee-io/bert-small-pii-detection, un BERT de tipo "small" con 28.527.155 parámetros. A pesar del nombre, no es un modelo Llama: la referencia a Llama proviene de que el dataset de entrenamiento (ai4privacy/open-pii-masking-500k-ai4privacy) se generó con Llama 3.1 y 3.3, y de ahí que la licencia aplicable sea la Llama 3.3 Community License.

El modelo aborda un problema concreto de robustez: evaluar si entrenar un etiquetador de PII con texto ruidoso (erratas, espacios ausentes, minúsculas, puntuación eliminada y formatos numéricos alterados) recupera el rendimiento que el ruido hace perder. Esta es la versión (b) "clean + noisy", semilla 2, entrenada sobre los registros limpios de ai4privacy más una copia ruidosa de cada uno (231.066 registros en total). Su contraparte es la versión clean-s2, de la que solo se diferencia en las copias ruidosas.

Es relevante como pieza de investigación reproducible sobre robustez ante ruido en tareas de anonimización, no como componente de producción. El autor lo declara explícitamente como modelo de investigación, sin auditoría sobre datos personales reales y con convenciones de etiquetado heredadas del dataset sintético de ai4privacy.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT small (transformer encoder), fine-tuning para token-classification |
| Parametros totales | 28.527.155 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens (entrenamiento); inferencia mediante ventanas solapadas de 256 con stride 64 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | llama-3.3-community-license (modelo base bajo Apache-2.0) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Se trata de un encoder transformer de tipo BERT small, inicializado desde gravitee-io/bert-small-pii-detection (revisión f8c27a85c5) y ajustado para etiquetado BIO de tokens. Se conservan las 51 etiquetas BIO del modelo base, aunque el entrenamiento solo cubre seis clases: PERSON, EMAIL_ADDRESS, PHONE_NUMBER, LOCATION (número de edificio y calle), DATE_TIME y CREDIT_CARD. El resto de clases del modelo base se entrenan como `O`. El tokenizador pasa todo el texto a minúsculas.

Los datos proceden del split de entrenamiento en inglés de ai4privacy/open-pii-masking-500k-ai4privacy, con 5.000 registros reservados como dev (semilla 0). Para esta versión se añade una copia ruidosa de cada registro, con un edit por cada diez palabras y tipos de ruido mezclados (semilla 2), sumando 231.066 registros. El entrenamiento consta de 10.832 pasos (tres pasadas sobre el conjunto limpio), batch 32, optimizador AdamW con learning rate 5e-5, warm-up lineal del 6% seguido de decaimiento lineal, weight decay 0.01, longitud de 256 tokens y precisión bf16. Se conserva el checkpoint del último paso; las pérdidas de dev finales son 0,0126 en limpio y 0,0254 en ruidoso. El archivo `training.json` recoge ajustes, sumas de comprobación de los ficheros de datos, pérdidas registradas, tiempos, GPU y versiones de paquetes.

## Capacidades

- Detección y etiquetado de PII a nivel de token en textos en inglés, con etiquetas BIO.
- Reconocimiento de seis clases entrenadas: nombres de persona, correo electrónico, teléfono, dirección (número y calle), fecha/hora y tarjeta de crédito.
- Clasificación de tokens con `pipeline("token-classification", aggregation_strategy="simple")` de Transformers.
- Procesamiento de textos largos mediante ventanas solapadas de 256 tokens con stride de 64.
- Robustez parcial ante ruido textual sintético (erratas, minúsculas, falta de puntuación, formatos numéricos alterados).
- No soporta tool calling, function calling, agentes, visión, audio ni modo de razonamiento; es un modelo exclusivamente de etiquetado de tokens.

## Casos de uso

- Investigación sobre robustez ante ruido: comparar esta versión con la clean-s2 y con las distintas semillas para medir cuánto recupera el entrenamiento con datos ruidosos frente al deterioro que introduce el ruido en test. Es el uso principal declarado por el autor.
- Anonimización de textos sintéticos en pipelines de experimentación: aplicar el modelo sobre corpus generados con ai4privacy para enmascarar las seis clases entrenadas antes de reutilizar los datos en otros experimentos.
- Evaluación de modelos de detección de PII: usar sus métricas (F2 micro con coincidencia estricta y tasa de fuga) como referencia para comparar otros etiquetadores sobre los mismos conjuntos de test (ai4privacy, Nemotron-PII, Gretel).
- Preprocesado de datos para investigación en privacidad: filtrar o marcar correos, teléfonos y tarjetas de crédito en corpus de estudio de dominio corto, siempre con revisión humana posterior.
- Docencia y reproducción de experimentos: el repositorio incluye registro completo de entrenamiento (`training.json`) y checksums, lo que permite reproducir el ajuste y estudiar el efecto del ruido en tareas de NER.
- Prototipado de sistemas de redacción de documentos: como paso previo a un sistema de masking en entornos controlados, detectando spans de las seis clases para sustituirlos por marcadores, aceptando las limitaciones de borde en direcciones y correos.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (F2 micro con coincidencia estricta sobre las seis etiquetas y tasa de fuga, es decir, proporción de valores PII reales no enmascarados por completo):

| Conjunto de test | F2 limpio | F2 ruido mixto | Fuga limpio | Fuga ruido mixto |
|---|---:|---:|---:|---:|
| ai4privacy (in-domain) | 0,983 | 0,962 | 1,2% | 2,0% |
| Nemotron-PII | 0,789 | 0,757 | 9,9% | 12,9% |
| Gretel | 0,545 | 0,530 | 35,4% | 36,5% |

No se han publicado en la información disponible resultados comparativos con otros modelos ni métricas adicionales (MMLU, HumanEval, GSM8K no aplican a esta tarea).

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (28,5 M de parámetros, unos 114 MB de pesos) y en torno a 60 MB en bf16/fp16; el repositorio ocupa 0,1 GB.
- GPU recomendadas: cualquier GPU consumer moderna sirve; el modelo cabe holgadamente en GTX 1650, RTX 3060, RTX 4090 o superiores. Para lotes grandes, A100 o H100 aportan margen pero no son necesarias.
- Cabe en GPU consumer y también en CPU para volúmenes moderados, dado el tamaño reducido.
- Opciones de despliegue: pipeline de Transformers, Text Generation Inference (TGI) no aplica por ser encoder, vLLM no es la vía natural para token-classification; alternativas habituales son Transformers, ONNX Runtime y TorchScript. llama.cpp/Ollama no están orientados a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-ai4privacy-piiguard-bert-noisy-s2 | 28,5 M | 256 tokens (ventanas) | NER de PII (6 clases) | Llama 3.3 Community License | Hugging Face |
| gravitee-io/bert-small-pii-detection (base) | no disponible | no disponible | NER de PII (51 etiquetas BIO) | Apache-2.0 | Hugging Face |
| Llama-ai4privacy-piiguard-bert-clean-s2 (contraparte) | 28,5 M (misma arquitectura) | 256 tokens (ventanas) | NER de PII (6 clases) | Llama 3.3 Community License | Hugging Face |

No se dispone en la información proporcionada de datos de rendimiento del modelo base ni de la versión clean-s2 para establecer una comparación cuantitativa; la model card solo indica que ambas versiones difieren únicamente en las copias ruidosas del entrenamiento.

## Limitaciones y advertencias

- Modelo exclusivamente de investigación: el autor declara explícitamente que no es para uso en producción y que no se ha auditado con datos personales reales.
- Convenciones de direcciones: ai4privacy solo marca número de edificio y calle como dirección; ciudad, código postal y número de piso quedan fuera. El modelo aprende esos bordes cortos y, en datasets que marcan direcciones completas (como Gretel), las recorta, dejando sin enmascarar el resto.
- Formas de correo: ningún correo de ai4privacy tiene punto antes de la `@` (0 de 13.282) y usan pocos proveedores comunes; el modelo parte direcciones como `john.miller@example.com` en fragmentos, algo que el modelo base no hace.
- Dominio único de entrenamiento: frases cortas generadas en inglés; el rendimiento cae fuera de ese dominio (F2 de 0,545 y fuga del 35,4% en Gretel).
- Ruido sintético: el ruido se genera con un script a una tasa fija; los errores de tecleo reales difieren.
- Tokenizador en minúsculas: puede afectar a la detección de entidades sensibles a mayúsculas.
- Licencia Llama 3.3 Community License: restricciones de uso comercial y sujeción a la Llama Acceptable Use Policy; el modelo base es Apache-2.0, pero los pesos derivados quedan bajo la licencia Llama.
- Riesgo de fuga de PII en textos fuera de dominio (hasta 36,5% en Gretel), lo que desaconseja su uso como único mecanismo de anonimización.
- Sin datos de sesgo publicados; al entrenarse sobre datos sintéticos generados, puede heredar sesgos de ese corpus.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/blue2959/Llama-ai4privacy-piiguard-bert-noisy-s2
- Versión clean (contraparte): https://huggingface.co/blue2959/Llama-ai4privacy-piiguard-bert-clean-s2
- Modelo base: https://huggingface.co/gravitee-io/bert-small-pii-detection
- Dataset de entrenamiento: https://huggingface.co/datasets/ai4privacy/open-pii-masking-500k-ai4privacy
- Licencia Llama 3.3: https://huggingface.co/blue2959/Llama-ai4privacy-piiguard-bert-noisy-s2/blob/main/LICENSE-llama-3.3.txt

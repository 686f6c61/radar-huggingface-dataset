# blue2959/Llama-ai4privacy-piiguard-bert-clean-s1

## Resumen

Llama-ai4privacy-piiguard-bert-clean-s1 es un modelo de clasificación de tokens (token-classification) especializado en la detección de información personal identificable (PII) en textos en inglés. Lo desarrolla el usuario blue2959 en el marco de un proyecto de curso (PIIGuard, CSED490E) y parte del modelo base gravitee-io/bert-small-pii-detection, un BERT pequeño de aproximadamente 28,5 millones de parámetros. El modelo se ha ajustado sobre el split de entrenamiento limpio del dataset ai4privacy/open-pii-masking-500k-ai4privacy, con 115.533 registros.

El objetivo del proyecto es medir si entrenar un etiquetador de PII sobre texto con ruido (erratas, espacios ausentes, minúsculas, puntuación eliminada, formatos numéricos alterados) recupera el rendimiento que ese ruido hace perder. Esta ficha corresponde a la versión limpia (a) con semilla 1; existe una variante con ruido y tres semillas por versión. Aunque el nombre incluye "Llama", no es un modelo Llama: la referencia a Llama procede de la licencia (Llama 3.3 Community License) y de que los datos de ai4privacy se generaron con Llama 3.1 y 3.3.

Es relevante para desarrolladores que necesiten un detector de PII ligero, desplegable en CPU o GPU consumer, y que quieran evaluar el impacto del ruido en tareas de anonimización. No obstante, el propio autor lo marca explícitamente como modelo de investigación y no apto para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder transformer), modelo base gravitee-io/bert-small-pii-detection |
| Parametros totales | 28.527.155 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens (longitud de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | inglés (en) |
| Licencia | Llama 3.3 Community License (license: other); el modelo base es Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Se trata de un encoder BERT pequeño (bert-small) con cabeza de clasificación de tokens en formato BIO, heredando los 51 etiquetas del modelo base sin cambios. El ajuste se realizó sobre el split de entrenamiento en inglés de ai4privacy, con 5.000 registros reservados como conjunto de desarrollo (semilla 0). Se entrenaron seis clases efectivas: PERSON, EMAIL_ADDRESS, PHONE_NUMBER, LOCATION (solo número de portal y calle), DATE_TIME y CREDIT_CARD; el resto de clases del modelo base se entrenaron como `O`.

El entrenamiento consta de 10.832 pasos (tres pasadas sobre el conjunto limpio), batch de 32, optimizador AdamW con learning rate 5e-5, warm-up lineal del 6 % seguido de decaimiento lineal, weight decay 0.01, longitud de 256 tokens y precisión bf16. Se conservó el checkpoint del último paso. La pérdida final en desarrollo fue de 0.0119 en limpio y 0.1330 en ruidoso. El tokenizador pasa todo el texto a minúsculas.

## Capacidades

- Detección de entidades PII mediante etiquetado BIO a nivel de token.
- Reconocimiento de nombres de persona (PERSON).
- Detección de direcciones de correo electrónico (EMAIL_ADDRESS).
- Detección de números de teléfono (PHONE_NUMBER).
- Detección de direcciones postales parciales: número de portal y calle (LOCATION).
- Detección de fechas (DATE_TIME).
- Detección de números de tarjeta de crédito (CREDIT_CARD).
- Procesamiento por ventanas deslizantes para textos largos (el proyecto usó ventanas de 256 tokens con stride de 64).
- No soporta tool calling, agentes, visión, audio ni modo de razonamiento: es un modelo discriminativo de etiquetado.

## Casos de uso

- Anonimización previa a registro (logging) en aplicaciones: el modelo puede enmascarar correos, teléfonos y nombres en trazas y mensajes antes de almacenarlos, con un coste computacional muy bajo al tener 28,5 M de parámetros.
- Filtrado de PII en pipelines de datos de entrenamiento: permite detectar y eliminar datos personales de corpus en inglés antes de usarlos en el ajuste de otros modelos.
- Investigación sobre robustez frente a ruido: sirve como línea base limpia para comparar con su variante ruidosa (Llama-ai4privacy-piiguard-bert-noisy-s1) y medir la caída de F2 y el aumento de fugas.
- Pretratamiento de textos de formularios o correos generados sintéticamente: adecuado para dominios de frases cortas en inglés similares a ai4privacy.
- Prototipado de sistemas de cumplimiento de privacidad (RGPD en entornos en inglés): útil para validar arquitecturas de detección antes de sustituir por un modelo auditado.
- Evaluación comparativa de detectores de PII: su reducido tamaño permite ejecutarlo en paralelo con otros modelos en la misma GPU para comparar precisión y tasa de fuga.
- Docencia y experimentación: reproducible mediante `training.json` con checksums, pérdidas y versiones de paquetes.

## Benchmarks y rendimiento

Resultados publicados por el autor (F2 micro con coincidencia estricta y tasa de fuga sobre seis etiquetas):

| Conjunto de prueba | F2 limpio | F2 ruido mixto | Fuga limpio | Fuga ruido mixto |
|---|---:|---:|---:|---:|
| ai4privacy (en dominio) | 0.986 | 0.915 | 1.0 % | 2.3 % |
| Nemotron-PII | 0.709 | 0.627 | 17.9 % | 25.2 % |
| Gretel | 0.507 | 0.461 | 41.2 % | 43.6 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, lo cual es esperable en un modelo de etiquetado de tokens.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (28,5 M de parámetros, ~114 MB de pesos); en bf16, aproximadamente 57 MB.
- Cabe holgadamente en cualquier GPU consumer (GTX 1060, RTX 2060, RTX 3060, RTX 4090) y también en CPU.
- GPU recomendadas para alto throughput: A100, H100 o L4 para procesamiento por lotes a gran escala; para uso individual basta una GPU consumer.
- Opciones de despliegue: `transformers` con pipeline de token-classification (documentado por el autor), servidores de inferencia compatibles con modelos BERT (TGI, vLLM para encoder), o exportación a ONNX. No se han publicado pesos GGUF para llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Notas |
|---|---|---|---|---|---|
| blue2959/Llama-ai4privacy-piiguard-bert-clean-s1 | 28,5 M | 256 tokens | Detección PII (6 clases) | Llama 3.3 Community | Investigación; F2 0.986 en dominio |
| gravitee-io/bert-small-pii-detection (base) | ~28,5 M | no disponible | Detección PII (51 etiquetas BIO) | Apache-2.0 | Modelo original; el ajustado hereda sus etiquetas |
| blue2959/Llama-ai4privacy-piiguard-bert-noisy-s1 | 28,5 M | 256 tokens | Detección PII con ruido | Llama 3.3 Community | Variante entrenada con ruido sintético; comparación directa |
| Modelos NER genéricos tipo BERT-base (p. ej. dslim/bert-base-NER) | ~110 M | 512 tokens | NER general (PER, ORG, LOC, MISC) | según modelo | No específicos de PII; no comparables en tasa de fuga |

No se dispone de datos de benchmarks comparativos con otros detectores de PII en la información proporcionada.

## Limitaciones y advertencias

- No apto para producción: el autor lo declara explícitamente como modelo de investigación, sin auditoría sobre datos personales reales.
- Sesgo de fronteras de dirección: ai4privacy solo marca número de portal y calle; ciudad, código postal y número de piso quedan sin enmascarar en datos que marcan direcciones completas (por ejemplo, Gretel), con una tasa de fuga del 41,2 % en limpio.
- Formas de correo electrónico: ningún correo de ai4privacy contiene un punto antes de la `@`; el modelo fragmenta direcciones como `john.miller@example.com`, algo que el modelo base no hace.
- Dominio único de entrenamiento: frases cortas generadas en inglés; el rendimiento cae fuera de ese dominio (F2 0.709 en Nemotron-PII y 0.507 en Gretel).
- Ruido sintético: las erratas se generan por script a una tasa fija y no reflejan errores reales de tecleo.
- Idioma: solo inglés; el tokenizador pasa todo a minúsculas, lo que puede afectar a la detección de nombres propios en mayúsculas.
- Contexto limitado a 256 tokens: requiere ventanas solapadas para textos largos, con riesgo de entidades partidas en los bordes.
- Licencia: Llama 3.3 Community License y Llama Acceptable Use Policy; el uso comercial está sujeto a las restricciones de dicha licencia, aunque el modelo base sea Apache-2.0.
- Riesgo de falsos negativos en entidades no incluidas entre las seis clases entrenadas, ya que el resto se entrenaron como `O`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/blue2959/Llama-ai4privacy-piiguard-bert-clean-s1
- Variante con ruido: https://huggingface.co/blue2959/Llama-ai4privacy-piiguard-bert-noisy-s1
- Modelo base: https://huggingface.co/gravitee-io/bert-small-pii-detection
- Dataset de entrenamiento: https://huggingface.co/datasets/ai4privacy/open-pii-masking-500k-ai4privacy
- Licencia Llama 3.3: https://huggingface.co/blue2959/Llama-ai4privacy-piiguard-bert-clean-s1/blob/main/LICENSE-llama-3.3.txt

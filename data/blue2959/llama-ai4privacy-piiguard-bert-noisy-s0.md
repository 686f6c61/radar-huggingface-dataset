# blue2959/Llama-ai4privacy-piiguard-bert-noisy-s0

## Resumen

Llama-ai4privacy-piiguard-bert-noisy-s0 es un modelo de clasificación de tokens (token classification) para detección de información personal identificable (PII) en textos en inglés. Lo publica el usuario blue2959 en Hugging Face como parte del proyecto de curso PIIGuard (CSED490E). Se trata de un fine-tune del modelo `gravitee-io/bert-small-pii-detection`, una arquitectura BERT small con 28.527.155 parámetros totales, sobre el conjunto de datos `ai4privacy/open-pii-masking-500k-ai4privacy`.

El modelo aborda un problema concreto de investigación: determinar si entrenar un etiquetador de PII con texto ruidoso (erratas, falta de espacios, minúsculas, puntuación eliminada, formatos numéricos alterados) recupera el rendimiento que el ruido hace perder. Esta versión concreta es la variante (b) "clean + noisy" con semilla 0, entrenada sobre los registros limpios del split de entrenamiento de ai4privacy más una copia ruidosa de cada uno (231.066 registros en total).

Es relevante ahora porque la detección robusta de PII es un componente crítico en pipelines de anonimización y cumplimiento normativo, y el modelo documenta de forma transparente tanto sus métricas como sus limitaciones específicas (convenciones de spans de ai4privacy, formas de correo electrónico, dominio único de entrenamiento). El autor advierte explícitamente que no es apto para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT small (transformer encoder), fine-tune de `gravitee-io/bert-small-pii-detection` (revisión `f8c27a85c5`) |
| Parametros totales | 28.527.155 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens (entrenamiento); para textos mayores se recomienda ventanas solapadas de 256 con stride de 64 |
| Tipos de cuantizacion | no disponible (pesos safetensors en bf16 durante entrenamiento) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Llama 3.3 Community License (`license: other`, `license_name: llama-3.3-community-license`); el modelo base es Apache-2.0 |
| Formato de pesos | safetensors |
| Pipeline | token-classification |
| Etiquetas | 51 tags BIO del modelo base, sin cambios; entrenado sobre 6 clases: PERSON, EMAIL_ADDRESS, PHONE_NUMBER, LOCATION (dirección: número y calle), DATE_TIME y CREDIT_CARD |
| Dataset de entrenamiento | `ai4privacy/open-pii-masking-500k-ai4privacy` (split de entrenamiento en inglés) |
| Tamano del repo | 0.1 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un transformer encoder tipo BERT small, inicializado desde `gravitee-io/bert-small-pii-detection` y ajustado para etiquetado de tokens con esquema BIO de 51 etiquetas, conservadas del modelo base. El entrenamiento se realizó sobre el split de entrenamiento en inglés de ai4privacy, con 5.000 registros reservados como dev (semilla 0). La variante (b) añade una copia ruidosa de cada registro limpio, generada con una edición por cada diez palabras de tipos mixtos (semilla 2), lo que da un total de 231.066 registros.

La configuración de entrenamiento incluye 10.832 pasos (tres pasadas sobre el conjunto limpio), batch de 32, optimizador AdamW con learning rate 5e-5, warm-up lineal del 6% seguido de decaimiento lineal, weight decay 0.01, longitud de 256 tokens y precisión bf16. Se conservó el checkpoint del último paso; los conjuntos dev solo se registraron. La pérdida final en dev fue de 0.0138 en limpio y 0.0267 en ruidoso. El archivo `training.json` del repositorio contiene el registro completo con ajustes, checksums de los ficheros de datos, todas las pérdidas registradas, tiempos, GPU y versiones de paquetes. No se documenta uso de RLHF ni DPO; es un fine-tune supervisado de etiquetado.

## Capacidades

- Detección y etiquetado de entidades PII en inglés: PERSON, EMAIL_ADDRESS, PHONE_NUMBER, LOCATION (número y calle), DATE_TIME y CREDIT_CARD.
- Clasificación de tokens con esquema BIO de 51 etiquetas, compatible con el modelo base.
- Robustez parcial frente a ruido textual sintético (erratas, minúsculas, falta de espacios, puntuación eliminada, formatos numéricos alterados).
- Integración con el pipeline `token-classification` de Transformers, con `aggregation_strategy="simple"`.
- Tokenizador que convierte todo el texto a minúsculas.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking; es un modelo discriminativo de etiquetado, no generativo.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Anonimización previa a logging: el modelo puede etiquetar correos, teléfonos y tarjetas de crédito en líneas de log en inglés antes de almacenarlas, reduciendo la exposición de datos personales en sistemas de observabilidad. Su ventana de 256 tokens obliga a procesar por ventanas solapadas.
- Enmascarado en pipelines de datos de entrenamiento: para limpiar corpus en inglés antes de usarlos en fine-tuning de otros modelos, detectando PERSON, EMAIL_ADDRESS y PHONE_NUMBER con F2 de 0.983 en dominio ai4privacy limpio.
- Filtrado de PII en formularios y correos de soporte: el modelo puede marcar números de teléfono y direcciones (número y calle) en mensajes cortos en inglés, un formato cercano a su dominio de entrenamiento de frases generadas cortas.
- Evaluación de robustez frente a ruido: sirve como referencia en experimentos que comparen etiquetadores entrenados solo con texto limpio frente a variantes con aumentación ruidosa, gracias a la pareja `clean-s0` y a las tres semillas publicadas.
- Prototipado de sistemas de cumplimiento (GDPR/CCPA) en investigación: permite construir un detector base de PII para estudiar tasas de fuga (leak rate) y estrategias de enmascarado antes de sustituirlo por un modelo auditado.
- Detección de tarjetas de crédito y fechas en textos sintéticos: útil en entornos de investigación con datos generados, donde el modelo alcanza F2 de 0.963 incluso con ruido mixto en el conjunto en dominio.
- Docencia y experimentación con token classification: el repositorio incluye registro de entrenamiento completo y scripts de evaluación, lo que facilita reproducir el experimento en un curso o laboratorio.

## Benchmarks y rendimiento

Métricas publicadas por el autor: micro F2 con coincidencia estricta (mismo inicio, fin y etiqueta) sobre seis etiquetas, y tasa de fuga (proporción de valores PII de referencia no enmascarados por completo).

| Conjunto de test | F2, limpio | F2, ruido mixto | Fuga, limpio | Fuga, ruido mixto |
|---|---:|---:|---:|---:|
| ai4privacy (en dominio) | 0.983 | 0.963 | 1.2% | 2.0% |
| Nemotron-PII | 0.779 | 0.761 | 11.2% | 12.7% |
| Gretel | 0.529 | 0.516 | 38.0% | 39.2% |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (28,5 M de parámetros, ~114 MB de pesos) y en torno a 60 MB en bf16/fp16; el repo completo ocupa 0.1 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo cabe holgadamente en RTX 3060, RTX 4090, A100 o H100. También puede ejecutarse en CPU con latencia aceptable para textos cortos.
- Cabe en cualquier GPU consumer e incluso en entornos sin GPU.
- Opciones de despliegue: pipeline `token-classification` de Transformers, TGI (Text Generation Inference no aplica a clasificación, pero puede servirse con contenedores de inferencia estándar), ONNX Runtime y despliegues con FastAPI o similar. No se documenta soporte específico de vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | F2 en dominio (limpio) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-ai4privacy-piiguard-bert-noisy-s0 | 28,5 M | 256 tokens | 0.983 | Llama 3.3 Community | Hugging Face |
| Llama-ai4privacy-piiguard-bert-clean-s0 | no disponible (mismo base) | 256 tokens | no disponible | Llama 3.3 Community | Hugging Face |
| gravitee-io/bert-small-pii-detection (base) | no disponible | no disponible | no disponible | Apache-2.0 | Hugging Face |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que la comparación de rendimiento se limita al modelo descrito.

## Limitaciones y advertencias

- No apto para producción: el autor lo declara explícitamente como modelo de investigación, no auditado para datos personales reales.
- Sesgos de anotación heredados de ai4privacy: solo se marcan como dirección el número de edificio y la calle; ciudad, código postal y número de piso no forman parte del span. En datos que anotan direcciones completas (por ejemplo, Gretel) el modelo las recorta y deja sin enmascarar el resto.
- Formas de correo electrónico: ningún correo de ai4privacy tiene punto antes de la `@` (0 de 13.282) y usan pocos proveedores comunes; el modelo fragmenta direcciones como `john.miller@example.com`, algo que el modelo base no hace.
- Dominio único de entrenamiento: frases cortas generadas en inglés; el rendimiento cae fuera de ese dominio (F2 de 0.529 y fuga del 38,0% en Gretel).
- Ruido sintético generado por script a una tasa fija; los errores tipográficos reales difieren.
- Ventana de contexto de 256 tokens; textos más largos requieren ventanas solapadas y pueden perder entidades en los bordes.
- Tokenizador que fuerza minúsculas, lo que puede afectar a la detección de nombres propios en contextos sensibles a mayúsculas.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de falsos positivos y falsos negativos en la etiquetación.
- Restricciones de licencia: Llama 3.3 Community License y Llama Acceptable Use Policy para el modelo; el modelo base es Apache-2.0, pero la distribución del fine-tune queda sujeta a la licencia Llama.
- Sin descargas ni likes en el momento de la ficha; no hay evidencia de uso comunitario ni validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/blue2959/Llama-ai4privacy-piiguard-bert-noisy-s0
- Modelo contraparte (clean, seed 0): https://huggingface.co/blue2959/Llama-ai4privacy-piiguard-bert-clean-s0
- Modelo base: https://huggingface.co/gravitee-io/bert-small-pii-detection
- Dataset de entrenamiento: https://huggingface.co/datasets/ai4privacy/open-pii-masking-500k-ai4privacy
- Licencia Llama 3.3: https://huggingface.co/blue2959/Llama-ai4privacy-piiguard-bert-noisy-s0/blob/main/LICENSE-llama-3.3.txt

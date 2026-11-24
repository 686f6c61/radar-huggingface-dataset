# blue2959/Llama-ai4privacy-piiguard-bert-clean-s0

## Resumen

Llama-ai4privacy-piiguard-bert-clean-s0 es un modelo de clasificación de tokens (reconocimiento de entidades nombradas, NER) especializado en la detección de información personal identificable (PII) en textos en inglés. Lo publica el usuario blue2959 dentro del proyecto de curso PIIGuard (CSED490E) y parte del modelo base gravitee-io/bert-small-pii-detection, un BERT de 28,5 millones de parámetros, sobre el que se ha hecho un ajuste fino supervisado con el conjunto de datos ai4privacy/open-pii-masking-500k-ai4privacy.

El modelo no es un generador de texto: es un etiquetador de secuencias que asigna etiquetas BIO a cada token para localizar seis clases de PII (PERSON, EMAIL_ADDRESS, PHONE_NUMBER, LOCATION, DATE_TIME y CREDIT_CARD). Su interés es metodológico: forma parte de un experimento controlado que compara el entrenamiento sobre datos limpios frente a datos con ruido sintético (errores tipográficos, falta de espacios, minúsculas, puntuación eliminada y formatos numéricos alterados), con tres semillas por variante. Esta ficha corresponde a la versión limpia con semilla 0.

A pesar del nombre, no es un modelo Llama: el término "Llama" del identificador refleja que los datos de entrenamiento se generaron con Llama 3.1 y 3.3, y por eso la licencia aplicada es la Llama 3.3 Community License. El autor lo marca explícitamente como modelo de investigación, no apto para producción ni auditado con datos personales reales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer tipo BERT (encoder), clasificación de tokens con etiquetado BIO |
| Parámetros totales | 28.527.155 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens (longitud de entrenamiento; para textos mayores se recomienda ventana deslizante con stride 64) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Llama 3.3 Community License (license_name: llama-3.3-community-license); el modelo base es Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder BERT pequeño (bert-small) con cabeza de clasificación de tokens. Conserva las 51 etiquetas BIO del modelo base sin modificarlas, pero solo entrena seis clases: PERSON, EMAIL_ADDRESS, PHONE_NUMBER, LOCATION (solo número de edificio y calle), DATE_TIME (cualquier fecha) y CREDIT_CARD; el resto de clases del modelo base se entrenan como `O`. El ajuste fino se realizó sobre la partición de entrenamiento en inglés de ai4privacy, con 115.533 registros limpios y 5.000 reservados como conjunto de desarrollo (semilla 0).

El entrenamiento consistió en 10.832 pasos (tres pasadas sobre el conjunto limpio) con batch de 32, optimizador AdamW, learning rate 5e-5, calentamiento lineal del 6 % seguido de decaimiento lineal, weight decay 0.01, longitud de 256 tokens y precisión bf16. Se guardó el checkpoint del último paso. La pérdida final en desarrollo fue de 0.0124 sobre datos limpios y 0.1314 sobre datos ruidosos. El repositorio incluye un `training.json` con la configuración completa, sumas de verificación de los ficheros de datos, todas las pérdidas registradas, tiempos, GPU y versiones de paquetes. La innovación principal no es arquitectónica sino experimental: el par limpio/ruidoso y las tres semillas permiten aislar el efecto del ruido sintético en el rendimiento del etiquetador.

## Capacidades

- Detección de PII en inglés mediante etiquetado BIO a nivel de token, con agregación de entidades a nivel de span.
- Seis clases entrenadas: nombres de persona, direcciones de correo, números de teléfono, direcciones (número y calle), fechas y tarjetas de crédito.
- Clasificación de tokens lista para usarse con el pipeline `token-classification` de Transformers y `aggregation_strategy="simple"`.
- Procesamiento de textos largos mediante ventanas solapadas de 256 tokens con stride de 64.
- Tokenizador que normaliza a minúsculas todo el texto de entrada.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo de pensamiento: es exclusivamente un etiquetador de secuencias.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Enmascaramiento previo a registros: el modelo puede detectar y sustituir correos, teléfonos y nombres en textos antes de enviarlos a sistemas de logging o analítica, con una tasa de fuga del 0,9 % sobre el conjunto de prueba en dominio.
- Anonimización de corpus para investigación: útil para preprocesar conjuntos de datos en inglés antes de compartirlos, siempre que se validen los resultados dado que las métricas fuera de dominio caen notablemente.
- Filtrado de PII en pipelines de datos sintéticos: al haber sido entrenado sobre datos generados con Llama 3.1 y 3.3, encaja en la verificación de que los textos sintéticos no contienen identificadores reales.
- Prototipado de sistemas de cumplimiento de privacidad: sirve como línea base rápida y ligera (28,5 M de parámetros) para comparar con detectores basados en expresiones regulares o modelos mayores.
- Investigación sobre robustez frente a ruido: el par limpio/ruidoso y las tres semillas permiten estudiar cómo afectan los errores tipográficos a la detección de entidades, con métricas de F2 y tasa de fuga ya publicadas.
- Detección de datos de tarjeta de crédito y fechas en textos de soporte o formularios en inglés, con la advertencia de que las fronteras de span siguen las convenciones de ai4privacy y pueden recortar entidades.
- Evaluación comparativa de tokenizadores y estrategias de ventana deslizante en tareas de NER sobre textos largos.

## Benchmarks y rendimiento

Métricas publicadas por el autor para esta semilla: F2 micro con coincidencia estricta (mismo inicio, fin y etiqueta) sobre seis etiquetas, y tasa de fuga (proporción de valores PII reales no enmascarados por completo).

| Conjunto de prueba | F2, limpio | F2, ruido mixto | Fuga, limpio | Fuga, ruido mixto |
|---|---:|---:|---:|---:|
| ai4privacy (en dominio) | 0.987 | 0.915 | 0.9 % | 2.4 % |
| Nemotron-PII | 0.706 | 0.626 | 19.0 % | 26.0 % |
| Gretel | 0.497 | 0.451 | 42.4 % | 45.3 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que el modelo no es generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (28,5 M de parámetros, unos 114 MB de pesos) y del orden de 60 MB en bf16; el repositorio completo ocupa 0,1 GB.
- GPU recomendadas: cualquier GPU consumer moderna sirve; el modelo cabe holgadamente en una RTX 3060, RTX 4090 o incluso en CPU. No requiere A100 ni H100.
- Cabe en GPU consumer: sí, en todas las gamas actuales, y también en CPU con latencia aceptable para textos cortos.
- Opciones de despliegue: pipeline `token-classification` de Transformers, así como servidores de inferencia compatibles con modelos BERT (por ejemplo, TGI o servicios de clasificación de tokens); no se documentan integraciones específicas con vLLM, llama.cpp u Ollama.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-ai4privacy-piiguard-bert-clean-s0 | 28,5 M | 256 tokens | NER de PII (6 clases) | Llama 3.3 Community License | Hugging Face, 0 descargas |
| gravitee-io/bert-small-pii-detection (base) | no disponible | no disponible | NER de PII (51 etiquetas BIO) | Apache-2.0 | Hugging Face |
| Llama-ai4privacy-piiguard-bert-noisy-s0 (variante hermana) | 28,5 M | 256 tokens | NER de PII (6 clases) | Llama 3.3 Community License | Hugging Face |

La comparación con otros detectores de PII de propósito general no está disponible en la información proporcionada; las diferencias observadas frente al modelo base se limitan a las convenciones de span aprendidas (por ejemplo, el recorte de direcciones y la división de correos con punto antes de la arroba).

## Limitaciones y advertencias

- Modelo de investigación: el autor indica explícitamente que no es apto para producción y que no se ha auditado con datos personales reales.
- Fronteras de dirección: ai4privacy solo marca número de edificio y calle como dirección; ciudad, código postal y número de piso quedan fuera, por lo que en datos con direcciones completas (como Gretel) el modelo recorta la entidad y deja sin enmascarar el resto.
- Formas de correo: ningún correo de ai4privacy tiene punto antes de la arroba (0 de 13.282) y usan pocos proveedores; el modelo divide direcciones como `john.miller@example.com` en fragmentos, algo que el modelo base no hace.
- Dominio único de entrenamiento: frases cortas generadas en inglés; el rendimiento cae fuera de dominio (F2 de 0.497 en Gretel y fuga del 42,4 %).
- Ruido sintético generado por script a una tasa fija; los errores de tecleo reales difieren.
- Riesgo de fuga de PII en textos fuera de dominio, con tasas de hasta el 45,3 % en Gretel con ruido; no debe usarse como único mecanismo de anonimización.
- Ventana de 256 tokens: textos más largos requieren ventanas solapadas y pueden perder entidades en las fronteras.
- Licencia Llama 3.3 Community License con su política de uso aceptable, que impone restricciones adicionales al uso comercial frente a la Apache-2.0 del modelo base.
- Idiomas: solo inglés; no hay soporte documentado para castellano ni otras lenguas.
- Sesgos: no se documentan análisis de sesgo en la información disponible.
- Riesgo de alucinación: no aplica en sentido generativo, pero sí de falsos positivos y negativos en la detección de entidades.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/blue2959/Llama-ai4privacy-piiguard-bert-clean-s0
- Variante ruidosa hermana: https://huggingface.co/blue2959/Llama-ai4privacy-piiguard-bert-noisy-s0
- Modelo base: https://huggingface.co/gravitee-io/bert-small-pii-detection
- Conjunto de datos: https://huggingface.co/datasets/ai4privacy/open-pii-masking-500k-ai4privacy
- Licencia Llama 3.3: https://huggingface.co/blue2959/Llama-ai4privacy-piiguard-bert-clean-s0/blob/main/LICENSE-llama-3.3.txt

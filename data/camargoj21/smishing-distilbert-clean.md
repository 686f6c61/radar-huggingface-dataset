# CamargoJ21/smishing-distilbert-clean

## Resumen

Smishing detector, DistilBERT (clean) es un modelo de clasificación de texto obtenido por ajuste fino de `distilbert-base-uncased` para detectar phishing por SMS (smishing). Lo desarrolla CamargoJ21 como proyecto de curso y se publica bajo licencia MIT. El modelo resuelve un problema binario: decidir si un mensaje SMS es legítimo (etiqueta 0) o malicioso, es decir, spam o smishing (etiqueta 1). Su relevancia es acotada: sirve como referencia comparativa frente a una versión "hardened" del mismo detector, no como filtro de producción.

Arquitectónicamente es un transformer encoder destilado de BERT, con 66.955.010 parámetros totales y un repositorio de 0,3 GB en formato safetensors. Solo admite inglés y está pensado para entradas de texto cortas preprocesadas con la función `clean_text` del proyecto, que sustituye enlaces, teléfonos, importes y números por los tokens `<URL>`, `<PHONE>`, `<MONEY>` y `<NUM>`.

El punto técnico más relevante es el umbral de decisión: 0,0312 sobre P(malicioso), calibrado para no superar el 1 % de falsos positivos en validación. Ese umbral tan bajo refleja un problema de clases desbalanceadas y condiciona por completo el comportamiento práctico del modelo: cualquier uso fuera del pipeline previsto (sin limpieza de texto o con otro umbral) invalida la calibración.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilado de `distilbert-base-uncased`) |
| Parametros totales | 66.955.010 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (limitada por la arquitectura DistilBERT, 512 tokens; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de `distilbert-base-uncased`, un encoder transformer de 6 capas obtenido por destilación de BERT-base. Sobre esa base se aplica un ajuste fino supervisado para clasificación binaria de secuencias. La cabeza de clasificación emite una probabilidad de la clase maliciosa, y la decisión final se toma aplicando un umbral fijo de 0,0312.

El entrenamiento se realizó exclusivamente sobre el Mendeley SMS Phishing Dataset, con 4 épocas, tasa de aprendizaje 2e-05, tamaño de lote 32 y función de pérdida ponderada por clase para compensar el desbalance entre SMS legítimos y maliciosos. No se documenta en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO (no aplicables en un clasificador de este tipo). La innovación destacable no es arquitectónica sino de calibración operativa: el umbral se seleccionó para acotar los falsos positivos al 1 % en validación, lo que desplaza el punto de operación hacia una alta sensibilidad.

## Capacidades

- Clasificación binaria de texto: legítimo (0) frente a malicioso, spam o smishing (1).
- Detección de patrones de phishing en SMS en inglés: urgencia, suplantación de entidades, solicitud de datos.
- Preprocesamiento integrado esperado: normalización de URLs, teléfonos, importes y números mediante los tokens especiales del proyecto.
- Salida de probabilidad calibrada con umbral operativo definido (0,0312).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo thinking, visión ni audio.
- Capacidad multilingüe: no, únicamente inglés.
- Integración con `text-embeddings-inference` y endpoints compatibles, según los tags del repositorio.

## Casos de uso

- Filtrado previo de SMS en una pasarela de mensajería: el modelo clasifica cada mensaje entrante y marca como sospechosos los que superan el umbral, derivándolos a revisión humana. Es adecuado por su tamaño reducido y su baja latencia esperada, aunque requiere aplicar antes la función `clean_text`.
- Señal auxiliar en un sistema antiphishing multicapa: se usa como una de varias puntuaciones (junto con reputación de remitente y análisis de URL) para reducir falsos positivos del conjunto.
- Etiquetado y triaje en investigación académica: sirve como línea base "clean" para comparar contra el modelo endurecido del mismo autor en experimentos de detección de smishing.
- Análisis retrospectivo de corpus de SMS: clasificación por lotes de conjuntos históricos para medir la prevalencia de mensajes maliciosos, con la advertencia de que el umbral está calibrado para otro régimen de datos.
- Demostración interactiva en el Space `CamargoJ21/smishing-detector`: el modelo alimenta una demo pública donde el usuario pega un SMS y obtiene la probabilidad de malicious.
- Docencia y reproducción de experimentos: por su licencia MIT y su tamaño (0,3 GB), es fácil de desplegar en entornos de aula para ilustrar ajuste fino de transformers y calibración de umbrales.
- Generación de datos de entrenamiento sintéticos etiquetados: uso del clasificador para preetiquetar grandes volúmenes de SMS que después se revisan manualmente antes de incorporarse a un dataset mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo documenta el criterio de calibración (máximo 1 % de falsos positivos en validación con umbral 0,0312), sin métricas de accuracy, precision, recall ni F1.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (66,9 M de parámetros, aproximadamente 268 MB de pesos) y en torno a 70 MB en int8; el repositorio completo ocupa 0,3 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; no requiere A100 ni H100.
- Cabe holgadamente en GPU de consumo: GTX 1650, RTX 3050, RTX 4060, RTX 4090, e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: `transformers` con PyTorch, `text-embeddings-inference` (según los tags del repo), ONNX Runtime y cuantización dinámica con PyTorch. No se documenta soporte explícito de vLLM, llama.cpp ni Ollama en la información disponible.
- Latencia y throughput estimados: no disponibles. Por el tamaño del modelo, se espera del orden de milisegundos por petición en GPU de consumo y decenas de milisegundos en CPU, sin cifras confirmadas por el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CamargoJ21/smishing-distilbert-clean | 66.955.010 | no disponible | Clasificación smishing (inglés) | MIT | Hugging Face |
| Versión "hardened" del mismo autor | no disponible | no disponible | Clasificación smishing (inglés) | no disponible | Mencionada en la model card, sin enlace |
| `distilbert-base-uncased` | 66.955.010 | 512 tokens (arquitectura) | Modelo base, sin ajuste para smishing | Apache 2.0 | Hugging Face |
| BERT-base-uncased ajustado para phishing | 109.000.000 (aprox.) | 512 tokens (arquitectura) | Clasificación de phishing | Apache 2.0 (base) | Hugging Face |

La comparación con la versión "hardened" es la más pertinente según el propio autor, pero no se dispone de sus especificaciones ni de sus métricas en la información proporcionada.

## Limitaciones y advertencias

- El autor indica explícitamente que es un proyecto de curso y no un filtro de producción.
- El umbral de 0,0312 está calibrado para un máximo del 1 % de falsos positivos en un conjunto de validación concreto; cambiar el umbral, el preprocesamiento o la distribución de datos invalida esa garantía.
- El modelo espera texto ya normalizado con `clean_text`; si se le pasa texto en bruto, el rendimiento puede degradarse de forma significativa.
- Solo admite inglés; los SMS en castellano u otros idiomas quedan fuera de su ámbito.
- Entrenado únicamente con el Mendeley SMS Phishing Dataset, lo que limita la generalización a otros dominios, canales o variedades de smishing.
- Riesgo de sesgo por desbalance de clases y por la composición del dataset de entrenamiento, no documentada en detalle.
- Riesgo de alucinación no aplicable en sentido estricto (es un clasificador, no un generador), pero sí de falsos negativos y falsos positivos sistemáticos.
- No se documentan métricas de evaluación más allá del criterio de calibración, por lo que no es posible estimar su calidad real frente a alternativas.
- Licencia MIT: permite uso comercial, pero sin garantías del autor y sin soporte documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CamargoJ21/smishing-distilbert-clean
- Space de demostración: https://huggingface.co/spaces/CamargoJ21/smishing-detector
- Modelo base: https://huggingface.co/distilbert-base-uncased
- Dataset citado (Mendeley SMS Phishing Dataset): no disponible como enlace en la información proporcionada
- Paper o blog del autor: no disponible

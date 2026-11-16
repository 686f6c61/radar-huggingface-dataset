# SergioJr06/distilbert-multilingual-prompt-injection

## Resumen

`SergioJr06/distilbert-multilingual-prompt-injection` es un clasificador de texto basado en DistilBERT multilingüe, afinado para detectar intentos de prompt injection en entradas dirigidas a sistemas LLM. Lo desarrolla SergioJr06, un estudiante de Ingeniería de Computación, como parte del proyecto `rag-seguro-docs`, con el objetivo de sustituir filtros basados en patrones de texto por un modelo entrenado. El modelo resuelve una tarea binaria: clasificar una entrada como `injecao` (ataque) o `normal`.

Arquitectónicamente es un transformer encoder de tipo DistilBERT (destilado de BERT), con 135.326.210 parámetros totales y una cabeza de clasificación nueva sobre el checkpoint `distilbert-base-multilingual-cased`. El contexto de entrada está limitado a 128 tokens durante el entrenamiento, y los pesos se distribuyen en formato safetensors dentro de un repositorio de 0,5 GB. La licencia es Apache 2.0.

Su relevancia es acotada pero concreta: ofrece una alternativa ligera y desplegable en CPU/GPU consumer para el filtrado de entradas en pipelines RAG, con resultados reportados de 94,8 % de accuracy y F1 de 0,947 en la clase ataque sobre el conjunto de test oficial de `deepset/prompt-injections`. No obstante, el propio autor advierte que el entrenamiento se basa en solo 546 ejemplos y que el modelo no constituye una garantía de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilado de BERT) con cabeza de clasificación binaria |
| Parametros totales | 135.326.210 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens (longitud máxima usada en entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32; admite cuantización dinámica vía PyTorch/ONNX, no documentada por el autor) |
| Idiomas soportados | en, de (entrenamiento); portugués solo evaluado en un conjunto propio de 29 textos |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `distilbert-base-multilingual-cased`, un encoder transformer de 6 capas y 135 M de parámetros obtenido por destilación de BERT multilingüe, y añade una capa de clasificación nueva para la tarea binaria. El entrenamiento se realizó sobre el dataset `deepset/prompt-injections` (Apache 2.0), compuesto por 546 ejemplos de entrenamiento (343 normales, 203 ataques) y 116 de test (56 normales, 60 ataques), en inglés y alemán. Se reservó un 10 % del entrenamiento para validación.

Los hiperparámetros fueron: 4 épocas, learning rate 3e-5, batch size 16, weight decay 0,01, longitud máxima 128, semilla 42, sobre una GPU T4 gratuita de Colab (aproximadamente 17 segundos de entrenamiento). Los hiperparámetros se fijaron antes de consultar el test. No se documenta uso de RLHF, DPO ni técnicas de aumentación de datos. El autor reporta estabilidad con cuatro semillas (42, 1, 2 y 3), con accuracy oficial entre 94,0 % y 94,8 % y entre 53 y 54 ataques detectados de 60 en todas ellas.

## Capacidades

- Clasificación binaria de texto: distingue entre intento de prompt injection (`injecao`) y texto normal (`normal`).
- Detección de instrucciones maliciosas en inglés y alemán, incluyendo instrucciones ocultas en documentos según las pruebas del autor.
- Integración directa con `transformers` mediante `pipeline("text-classification", ...)`.
- Compatible con Text Embeddings Inference (tag `text-embeddings-inference`) y con endpoints compatibles (tag `endpoints_compatible`).
- No soporta generación de texto, tool calling, razonamiento multi-paso, visión ni audio: es exclusivamente un clasificador.
- Capacidad multilingüe limitada a los idiomas vistos en entrenamiento; el portugués solo se evaluó de forma anecdótica.

## Casos de uso

- Filtro de entrada en pipelines RAG: el modelo se sitúa antes del recuperador y del LLM para descartar consultas que contengan instrucciones de anulación de sistema ("ignore previous instructions", "reveal your system prompt"), con una latencia muy baja al ser un encoder de 135 M de parámetros.
- Moderación de prompts en asistentes conversacionales: clasificación previa de cada turno del usuario en inglés o alemán para bloquear intentos de jailbreak antes de llegar al modelo generativo, como capa adicional a otras defensas.
- Protección de agentes con acceso a herramientas: al recibir texto de fuentes externas (documentos, correos, resultados web) que se inyectará en el contexto del agente, se puede clasificar cada fragmento y descartar los que contengan instrucciones sospechosas.
- Detección de inyecciones indirectas en documentos: el autor reporta 14 de 14 ataques detectados en su conjunto propio, que incluía instrucciones escondidas en documentos, lo que lo hace útil como preprocesador de corpus antes de la indexación.
- Despliegue en entornos con recursos limitados: al ocupar 0,5 GB en fp32 y ser un modelo tipo DistilBERT, puede ejecutarse en CPU o en GPU consumer (por ejemplo, RTX 3060 o superior) con throughput alto para clasificación por lotes.
- Evaluación comparativa de filtros: sirve como referencia ligera frente a filtros basados en expresiones regulares o TF-IDF + regresión logística (línea base del autor con 74,1 % de accuracy frente al 94,8 % del modelo).
- Investigación en seguridad de LLM: útil como punto de partida reproducible para estudiar el sesgo de sobrebloqueo en preguntas legítimas sobre seguridad y para experimentar con aumentación de datos.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre el test oficial de `deepset/prompt-injections` (116 ejemplos):

| Metrica | Linea base (TF-IDF + regresion logistica) | Este modelo |
|---|---|---|
| Accuracy | 74,1 % | 94,8 % |
| Ataques detectados | 30 de 60 | 54 de 60 |
| Textos normales bloqueados | 0 de 56 | 0 de 56 |
| F1 en la clase ataque | 0,667 | 0,947 |

Resultados en el conjunto propio del autor (29 textos, nunca usados en entrenamiento):

| Metrica | Linea base | Este modelo |
|---|---|---|
| Ataques detectados | 4 de 14 | 14 de 14 |
| Preguntas normales de seguridad bloqueadas por error | 0 de 15 | 4 de 15 |

Estabilidad con cuatro semillas (42, 1, 2, 3): accuracy oficial entre 94,0 % y 94,8 %, entre 53 y 54 ataques detectados de 60, 0 textos normales bloqueados en el test oficial, y entre 0 y 4 preguntas normales de seguridad bloqueadas de 15 en el conjunto propio. El modelo publicado corresponde a la semilla 42, que resultó la peor en ese último punto.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que el modelo no es generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en fp32 (tamaño del repositorio); alrededor de 0,14 GB con cuantización int8 dinámica, aunque el autor no documenta cuantizaciones.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; el entrenamiento se realizó en una T4 de Colab. Para inferencia en producción, T4, L4, A10G o RTX 3060 en adelante son suficientes.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna (GTX 1650, RTX 2060, RTX 3060, RTX 4090) e incluso en CPU para cargas moderadas.
- Opciones de despliegue: `transformers` (pipeline de text-classification), Text Embeddings Inference (tag oficial), endpoints compatibles, y exportación a ONNX no documentada por el autor.
- Latencia y throughput: no disponibles de forma explícita. El entrenamiento completo de 4 épocas sobre 546 ejemplos tardó unos 17 segundos en una T4, lo que sugiere una latencia de inferencia del orden de milisegundos por muestra en GPU, pero no se aportan mediciones formales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SergioJr06/distilbert-multilingual-prompt-injection | 135 M | 128 tokens | Clasificación binaria de prompt injection (en, de) | Apache 2.0 | Hugging Face, 0 descargas, 0 likes |
| deepset/deberta-v3-base-prompt-injection | no disponible en la informacion | no disponible | Clasificación de prompt injection | no disponible | Hugging Face (referencia de la comunidad, sin datos verificados aqui) |
| protectai/deberta-v3-base-prompt-injection-v2 | no disponible en la informacion | no disponible | Clasificación de prompt injection | no disponible | Hugging Face (referencia de la comunidad, sin datos verificados aqui) |
| Linea base TF-IDF + regresion logistica (autor) | no aplica | no aplica | Clasificación binaria | no disponible | Repositorio del autor |

La comparación con los modelos de deepset y protectai se incluye como referencia de categoría; no se dispone de sus especificaciones verificadas en la información proporcionada, por lo que no se comparan métricas. El modelo del autor destaca por su tamaño reducido (135 M) y su licencia Apache 2.0, pero carece de validación externa y de adopción en la comunidad (0 descargas, 0 likes en el momento de la consulta).

## Limitaciones y advertencias

- Dataset de entrenamiento muy pequeño: 546 ejemplos. Los resultados en el test oficial pueden estar optimizados, ya que el dataset contiene pares de textos traducidos entre inglés y alemán y una traducción podría haber quedado en entrenamiento y la otra en test.
- Sobrebloqueo de preguntas legítimas sobre seguridad: entre 0 y 4 de 15 (media del 13 %) en las pruebas del autor. La hipótesis no verificada es que palabras como "prompt" o "jailbreak" solo aparecen en ataques en el conjunto de entrenamiento.
- Etiqueta "ataque" demasiado amplia: en el dataset original, instrucciones como "translate to polish" o "generate SQL code" están etiquetadas como ataque, lo que provocaría falsos positivos en aplicaciones de traducción o generación de código.
- Cobertura lingüística limitada: entrenado solo en inglés y alemán; el portugués se evaluó únicamente en 29 textos propios.
- No es una defensa completa: el autor indica explícitamente que no debe usarse como única protección. No se probaron ataques nuevos, codificados ni en otros idiomas.
- Riesgo de alucinación no aplica en sentido generativo, pero sí existe riesgo de clasificación errónea en dominios no representados.
- Sesgos conocidos: no documentados por el autor más allá del sesgo hacia el bloqueo de terminología de seguridad.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base `distilbert-base-multilingual-cased` también es Apache 2.0, por lo que no hay restricciones adicionales conocidas.
- Advertencia para producción: con 0 descargas y 0 likes, no hay evidencia de uso en producción ni validación independiente; conviene evaluarlo sobre el dominio concreto antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SergioJr06/distilbert-multilingual-prompt-injection
- Modelo base: https://huggingface.co/distilbert/distilbert-base-multilingual-cased
- Dataset de entrenamiento: https://huggingface.co/datasets/deepset/prompt-injections
- Repositorio del proyecto del autor: https://github.com/SergioJr06/rag-seguro-docs
- Perfil del autor en Hugging Face: https://huggingface.co/SergioJr06

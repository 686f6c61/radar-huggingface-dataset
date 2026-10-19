# BeardedMonster/afro-xlmr-base-masakhaner2-bam

## Resumen

`BeardedMonster/afro-xlmr-base-masakhaner2-bam` es un checkpoint de clasificación de tokens (reconocimiento de entidades nombradas, NER) obtenido por fine-tuning de `Davlan/afro-xlmr-base` sobre el corpus MasakhaNER 2.0 para el idioma bambara (`bam`). El modelo lo publica el usuario BeardedMonster como parte de un conjunto de adaptaciones por idioma generadas con el arnés de evaluación de su proyecto, que según la model card reproduce las baselines publicadas de MasakhaNER 2.0 con una desviación de aproximadamente 0,25 F1.

Arquitectónicamente es un encoder transformer tipo XLM-RoBERTa base (familia BERT multilingüe con tokenizador SentencePiece), con 277.459.977 parámetros totales y un límite posicional de 512 tokens; el ajuste se realizó con longitud máxima de 256. No es un modelo generativo: su salida es una etiqueta BIO por token, con `id2label` configurado para decodificar directamente a nombres de etiqueta.

Su relevancia es acotada pero clara: cubre una lengua africana de bajos recursos (bambara, unos 15 millones de hablantes) para la que existen muy pocos modelos NER publicados, y lo hace con un F1 de span de 0,8096 en el protocolo `bam` de MasakhaNER 2.0. Con 14 descargas y 0 likes en el momento de la consulta, es un artefacto de investigación reciente, sin validación independiente por parte de la comunidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo XLM-RoBERTa base (BERT multilingüe, tokenizador SentencePiece) |
| Parámetros totales | 277.459.977 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 posiciones máximas de la arquitectura base; entrenado con `max_length` = 256 |
| Tipos de cuantización | No se publican versiones cuantizadas; el repo contiene safetensors en precisión completa. Admite cuantización dinámica int8 vía ONNX Runtime o PyTorch, no verificada en la información disponible |
| Idiomas soportados | `bam` (bambara) como idioma de ajuste; el modelo base es multilingüe (100 idiomas), extremo no validado en este checkpoint |
| Licencia | No disponible en los metadatos de HuggingFace; la model card remite a la licencia y términos de `Davlan/afro-xlmr-base`, que rigen cualquier uso derivado |
| Formato de pesos | safetensors (carga vía `transformers` con `AutoModelForTokenClassification`); no hay GGUF ni ONNX publicados |
| Tarea / pipeline | Clasificación de tokens (NER), etiquetas BIO decodificables por `id2label` |
| Tamaño del repositorio | 2,2 GB |
| Fecha de creación | 2026-10-19 |
| Descargas / likes | 14 / 0 |

## Arquitectura y entrenamiento

El checkpoint es un fine-tuning completo de `Davlan/afro-xlmr-base`, un XLM-RoBERTa base adaptado a lenguas africanas mediante entrenamiento continuo sobre corpus africanos. La cabeza es una capa lineal de clasificación de tokens sobre las representaciones del encoder, con el conjunto de etiquetas de MasakhaNER 2.0 (esquema BIO con las categorías de persona, organización, localización y fecha del corpus). No hay decodificación autorregresiva, atención lineal, decodificación especulativa ni mecanismos híbridos: es un encoder bidireccional estándar.

Los hiperparámetros declarados del ajuste son 50 épocas, tasa de aprendizaje 5e-05, batch size 32 y longitud máxima 256, sobre un único idioma (`bam`) y con `span_f1` como métrica de selección. La model card no documenta el volumen de tokens de entrenamiento, la composición exacta del split, ni si hubo búsqueda de hiperparámetros; tampoco se menciona RLHF, DPO ni ningún otro ajuste por preferencias, algo esperable en un modelo discriminativo.

El punto metodológico relevante es la calibración: el autor afirma que su arnés reproduce las baselines publicadas de MasakhaNER 2.0 con un margen de aproximadamente 0,25 F1, de modo que las cifras son comparables a las de los papers. Sin embargo, advierte explícitamente que los resultados provienen de una sola ejecución, mientras que los artículos de referencia promedian cinco, por lo que diferencias pequeñas deben tratarse como ruido.

## Capacidades

- Reconocimiento de entidades nombradas en bambara: etiqueta cada token con las categorías del corpus MasakhaNER 2.0 (persona, organización, localización, fecha) en formato BIO.
- Extracción de spans de entidades: la métrica objetivo es `span_f1`, es decir, se evalúa la coincidencia exacta de la entidad completa, no solo la etiqueta por token.
- Decodificación directa: `id2label` está configurado, por lo que la salida del modelo se traduce a nombres de etiqueta sin post-procesado manual del mapeo.
- procesamiento por lotes con `max_length` 256: adecuado para frases, titulares y párrafos cortos.
- Integración con el ecosistema `transformers`: tokenizador y modelo se cargan con `AutoTokenizer` y `AutoModelForTokenClassification`.
- No soporta generación de texto, razonamiento multi-paso, tool calling, function calling, uso como agente, matemáticas, código ni visión.
- No dispone de modo "thinking" ni de capacidades de audio.
- El multilingüismo del modelo base no está validado en este checkpoint; la model card solo declara `bam`.

## Casos de uso

- Pre-anotación de corpus NER en bambara: el modelo propone etiquetas sobre textos nuevos y un anotador humano las corrige, reduciendo el coste de construir recursos supervisados para una lengua de bajos recursos. Es el uso más directo y para el que está calibrado.
- Extracción de entidades en monitorización de medios: procesar titulares y cuerpos de noticias en bambara para identificar personas, organizaciones y localizaciones mencionadas, con troceado de documentos a 256 tokens y agregación posterior de spans.
- Enriquecimiento de índices de búsqueda: generar campos estructurados (quién, dónde, qué organización) a partir de texto plano para mejorar la recuperación documental en archivos en bambara.
- Construcción de grafos de conocimiento locales: alimentar un grafo entidad-relación a partir de prensa y documentos institucionales, usando los spans extraídos como nodos candidatos y resolviendo correferencia con un paso posterior.
- Evaluación comparativa de modelos africanos: servir como baseline reproducible de NER en `bam` para comparar con XLM-R base, mBERT u otros checkpoints de AfroXLMR, dado que el arnés del autor está calibrado contra las baselines publicadas.
- Filtrado y clasificación de documentos por relevancia: detectar si un texto menciona una organización o localización concreta antes de pasarlo a un pipeline más costoso, con inferencia en CPU por el tamaño reducido del modelo.
- Docencia y prototipado en NLP de bajos recursos: ejemplo funcional de fine-tuning NER con `transformers` sobre un corpus africano, reutilizable como plantilla para otras lenguas de MasakhaNER 2.0.

## Benchmarks y rendimiento

| Benchmark | Idioma | Métrica | Resultado |
|---|---|---|---|
| MasakhaNER 2.0 (`bam`) | Bambara | span_f1 | 0,8096 |

- El resultado corresponde a una única ejecución; las baselines publicadas promedian cinco semillas, por lo que la comparación directa tiene un margen de ruido no cuantificado.
- El autor indica que su arnés reproduce las baselines publicadas de MasakhaNER 2.0 con una desviación de aproximadamente 0,25 F1.
- Los desgloses por idioma están en `metrics.json` del repositorio, no incluidos en la información disponible.
- No se han publicado resultados de benchmarks de propósito general (MMLU, HumanEval, GSM8K) en la información disponible, ni tendrían sentido para un encoder de clasificación de tokens.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB en fp32 (277 M parámetros × 4 bytes) y unos 0,55 GB en fp16; el pico real depende del batch y de la longitud de secuencia, pero con `max_length` 256 y batch 32 se mantiene muy por debajo de 4 GB.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en iGPU o CPU. Para entrenamiento, un ajuste completo a 256 tokens con batch 32 entra en 8-12 GB de VRAM.
- GPU de datacenter (A100, H100, L40S) innecesarias para inferencia; solo tendrían sentido para reentrenar a gran escala o servir muchas réplicas.
- Inferencia en CPU viable: con 277 M parámetros, un procesador moderno puede servir peticiones individuales con latencia de decenas de milisegundos por secuencia de 256 tokens (cifra estimada, no medida en la información disponible).
- Opciones de despliegue: `transformers` con `pipeline("token-classification")`, ONNX Runtime para cuantización dinámica int8, TorchServe o un servicio FastAPI propio. vLLM, llama.cpp, Ollama y TGI están orientados a modelos generativos y no aplican a este checkpoint.
- Throughput y latencia concretos: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Resultado en `bam` | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (`afro-xlmr-base-masakhaner2-bam`) | 277 M | 512 (entrenado a 256) | NER | span_f1 0,8096 (1 ejecución) | No disponible (ríge la del base) | HuggingFace, 14 descargas |
| `Davlan/afro-xlmr-base` | ≈277 M (mismo tamaño que XLM-R base) | 512 | Modelo base (representaciones) | No disponible: no es un modelo NER ajustado | No verificada en la información disponible | HuggingFace |
| XLM-RoBERTa base (`FacebookAI/xlm-roberta-base`) | ≈278 M | 512 | Modelo base (representaciones) | No disponible | No verificada en la información disponible | HuggingFace |
| Otros checkpoints de AfroXLMR ajustados a MasakhaNER 2.0 por el mismo autor | ≈277 M | 512 (entrenado a 256) | NER | No disponible para `bam` en la información consultada | Ídem | HuggingFace |

La comparación cuantitativa con alternativas ajustadas a NER en bambara no está disponible en la información proporcionada; el propio autor advierte que las diferencias por debajo del margen de calibración (~0,25 F1) no deben interpretarse como mejoras reales.

## Limitaciones y advertencias

- Licencia no declarada en los metadatos: la model card remite a los términos de `Davlan/afro-xlmr-base`. Antes de cualquier uso comercial es obligatorio verificar la licencia del modelo base; la información disponible no permite confirmarla.
- Resultado de una sola ejecución: sin media sobre semillas ni intervalos de confianza, la cifra de 0,8096 no permite afirmar superioridad frente a otras baselines.
- Validación comunitaria nula: 14 descargas y 0 likes; no hay evidencia de uso independiente ni de evaluaciones de terceros.
- Cobertura lingüística restringida a `bam`. Aunque el modelo base es multilingüe, este checkpoint no ha sido evaluado en otras lenguas y el uso fuera de bambara no está respaldado por datos.
- Sesgo de dominio: el rendimiento está medido sobre el corpus MasakhaNER 2.0; en otros dominios (legal, clínico, conversacional) la precisión puede degradarse de forma no cuantificada.
- Límite de longitud: entrenado con `max_length` 256 sobre una arquitectura de 512 posiciones. Documentos largos requieren troceado con solapamiento y agregación de spans, lo que puede partir entidades en los límites de fragmento.
- Riesgo de falsos negativos y positivos en entidades ambiguas o anidadas: el esquema BIO no representa entidades solapadas.
- No es un modelo generativo: no alucina texto, pero sí puede producir extracciones incorrectas con alta confianza; no debe usarse como fuente de verdad sin verificación.
- Sin garantías de mantenimiento ni de soporte por parte del autor; el repositorio no documenta el proceso de entrenamiento más allá de los hiperparámetros.
- Ortografía del bambara: variantes gráficas y diacríticos poco frecuentes pueden aumentar los errores por tokenización SentencePiece; no hay análisis de este efecto en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BeardedMonster/afro-xlmr-base-masakhaner2-bam
- Modelo base: https://huggingface.co/Davlan/afro-xlmr-base
- Corpus MasakhaNER 2.0: disponible en HuggingFace bajo el proyecto Masakhane (enlace no incluido en la información proporcionada)
- Paper de MasakhaNER 2.0, paper de AfroXLMR, repositorio del arnés de evaluación y demos: no disponibles en la información proporcionada.

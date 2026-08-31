# itzune/gemma-4-e4b-horkonpon

## Resumen

El modelo `itzune/gemma-4-e4b-horkonpon` es un fine-tuning del modelo base `google/gemma-4-E4B-it` (julio 2026, licencia Apache 2.0) especializado en la corrección gramatical del euskera (euskara). Desarrollado por el usuario itzune, este modelo transforma la tarea de corrección de errores gramaticales en un proceso explicable: en lugar de devolver únicamente la frase corregida, genera una salida JSON estructurada con cada edición, su categoría, una referencia normativa a la obra *Euskara Batuaren Eskuliburua* (EBE) de Euskaltzaindia y una explicación en euskera. Esta característica permite filtrar las correcciones en tiempo de ejecución según su tipo, severidad o naturaleza normativa.

El modelo se basa en la arquitectura Gemma 4 E4B, que combina 8.000 millones de parámetros totales con 4.500 millones de parámetros efectivos, lo que lo hace adecuado para su ejecución en hardware de consumo. Se entrenó con QLoRA 4-bit y LoRA r=16 sobre un corpus específico para euskera, `horkonpon-corpus`, con más de 199.000 registros de entrenamiento. Su relevancia actual radica en que cubre una necesidad poco atendida: la corrección gramatical automática de calidad para una lengua minoritaria, con un nivel de explicabilidad y control normativo que no ofrecen los correctores genéricos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4 E4B (PLE, 8B totales / 4.5B efectivos) |
| Parametros totales | 7.996.156.490 (~8B) |
| Parametros activos | 4.5B efectivos (según model card) |
| Longitud de contexto | no disponible (el modelo base soporta hasta 256K tokens) |
| Tipos de cuantizacion | no disponible (pesos en FP16, cuantización posterior posible) |
| Idiomas soportados | euskera (eu) - fine-tune monolingüe |
| Licencia | Gemma Terms of Use (modelo) · CC-BY-SA 4.0 (datos y código) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-E4B-it`, un modelo de la familia Gemma 4 de Google DeepMind que combina arquitecturas densas y de mezcla de expertos (MoE). En este caso, el modelo base tiene 8B parámetros totales pero solo 4.5B efectivos, lo que sugiere una arquitectura MoE o de activación parcial (PLE, por sus siglas en inglés, aunque no se detalla su significado exacto). El fine-tuning se realizó mediante QLoRA 4-bit con un rango LoRA de 16, y los pesos resultantes se fusionaron a 16 bits para la inferencia.

El entrenamiento se llevó a cabo sobre el corpus `horkonpon-corpus`, un conjunto de datos específico para euskera que consta de 208.051 registros (83.121 con errores, 88.009 limpios y 36.921 sugerencias), de los cuales 199.662 se usaron para entrenamiento y 1.088 para evaluación. El corpus está fundamentado en la normativa EBE de Euskaltzaindia e incluye 16 inyectores deterministas de errores en 9 categorías. El modelo fue entrenado con el formato "explain-then-correct": dado un texto con errores, genera un JSON con la frase corregida y una lista de ediciones anotadas con metadatos estructurados.

## Capacidades

- Corrección gramatical del euskera con salida JSON estructurada, incluyendo la frase corregida y metadatos por edición.
- Explicación de cada corrección en euskera, con referencia normativa a la obra EBE de Euskaltzaindia.
- Clasificación de errores en 9 categorías: `capitalization`, `word_level`, `spelling`, `zalantza` (elección de palabra), `terminology`, `morphology`, `punctuation`, `proper_noun` y `calque`.
- Distinción entre errores normativos (nature=`error`) y sugerencias editoriales (nature=`suggestion`), lo que permite filtrar por tipo de intervención en tiempo de inferencia.
- Capacidad de generación de texto en euskera (heredada del modelo base), aunque el fine-tuning está orientado exclusivamente a la corrección.
- Salida JSON con tasa de parseo del 100% en la evaluación, lo que garantiza que la estructura es siempre válida.
- Inferencia determinista con decodificación greedy (sin muestreo), adecuada para tareas de corrección donde se busca consistencia.

## Casos de uso

- **Corrector integrado en procesadores de texto para euskera**: el modelo puede analizar oraciones y devolver correcciones con explicaciones, lo que permite a los usuarios entender el error y aprender la regla. Su formato JSON facilita la integración en editores como LibreOffice o aplicaciones web.
- **Revisión de textos periodísticos y editoriales**: los medios en euskera pueden usar el filtro por `nature` para aplicar solo correcciones normativas (EBE) y descartar sugerencias editoriales, manteniendo el estilo de la publicación.
- **Herramienta educativa para aprendizaje del euskera**: al generar explicaciones en euskera con referencias normativas, sirve como tutor automático para estudiantes que quieren mejorar su gramática.
- **Preprocesamiento de corpus para NLP en euskera**: el modelo puede limpiar grandes volúmenes de texto en euskera antes de entrenar otros modelos, reduciendo errores ortográficos y gramaticales.
- **Sistema de revisión de traducciones automáticas**: cuando un traductor automático produce texto en euskera, este modelo puede detectar y corregir errores comunes, mejorando la calidad final antes de la publicación.
- **Filtrado de errores por categoría en aplicaciones de escritura**: gracias a la salida estructurada, una aplicación puede ignorar categorías problemáticas (por ejemplo, `calque`, que tiene bajo rendimiento) o aplicar solo correcciones de ortografía.
- **Evaluación de calidad lingüística en entornos profesionales**: empresas que generan documentación en euskera pueden usar el modelo como control de calidad, obteniendo un informe de errores con categorías y referencias normativas.

## Benchmarks y rendimiento

La model card incluye una evaluación comparativa con GECToR-v2 (`gector-eus-v2`), un modelo de corrección basado en etiquetado de secuencias con RoBERTa-eus-base (124M parámetros), entrenado sobre el mismo corpus. La evaluación se realizó sobre el split de validación de `horkonpon-corpus` (1.088 registros con errores y 1.088 limpios), con decodificación greedy y `max_new_tokens=256`.

| Metrica | GECToR-v2 | Gemma 4 (este modelo) | Ganador |
|---|:---:|:---:|---|
| F0.5 | 78.8 | **80.8** | Gemma 4 |
| Exact match | 52.7% | **65.5%** | Gemma 4 |
| Precision | **88.7%** | 86.3% | GECToR-v2 |
| Recall | 54.4% | **64.4%** | Gemma 4 |
| Clean FP rate | **1.4%** | 8.6% | GECToR-v2 |
| JSON parse rate | N/A | **100%** | — |

Recuperación por categoría:

| Categoria | GECToR-v2 | Gemma 4 (este modelo) | Notas |
|---|:---:|:---:|---|
| capitalization | 100% (33/33) | 100% (33/33) | empate |
| word_level | 97.2% (35/36) | 100% (36/36) | |
| spelling | 40.6% (69/170) | **90.6%** (154/170) | mejora 2.2× |
| zalantza | 48.3% (43/89) | **92.1%** (82/89) | mejora 1.9× |
| terminology | — | 88.2% (45/51) | solo sugerencias |
| morphology | **94.5%** (276/292) | 77.1% (225/292) | GECToR gana |
| punctuation | 25.6% (66/258) | **72.9%** (188/258) | mejora 2.8× |
| proper_noun | 22.9% (19/83) | **68.7%** (57/83) | mejora 3.0× |
| calque | 6.6% (5/76) | 17.1% (13/76) | ambos débiles |

## Requisitos de hardware

- **VRAM estimada**: el modelo tiene ~8B parámetros en FP16 (16 GB de peso). Para inferencia con cuantización de 4 bits, se estima un consumo de ~5-6 GB de VRAM; con 8 bits, ~8-9 GB.
- **GPU recomendadas**: para FP16 se necesita una GPU con al menos 16 GB (por ejemplo, RTX 4080/4090, A100, L40). Con cuantización 4-bit cabe en GPUs consumer de 8 GB como RTX 3060/3070/4060.
- **Compatibilidad con hardware de consumo**: sí, es viable en GPUs de gama media con cuantización. El entrenamiento se realizó en una NVIDIA L40 (46 GB VRAM), pero la inferencia es mucho menos exigente.
- **Opciones de despliegue**: al ser un modelo de la familia Gemma compatible con Transformers, puede servirse con vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama. El formato safetensors permite su uso directo con la librería `transformers`.
- **Latencia y throughput**: no se han publicado datos específicos para este fine-tune. Como referencia, un modelo de 4.5B activos en una GPU moderna puede generar decenas de tokens por segundo, suficiente para uso interactivo.

## Comparativa con modelos similares

La comparativa principal se establece con GECToR-v2, presentada en la sección de benchmarks. A continuación se resumen las diferencias clave:

| Modelo | Parámetros | Arquitectura | Contexto | Salida | Licencia |
|---|---|---|---|---|---|
| `itzune/gemma-4-e4b-horkonpon` | 8B totales / 4.5B activos | Gemma 4 E4B (MoE/PLE) | no disponible | JSON explicable | Gemma ToU |
| `itzune/gector-eus-v2` | 124M | GECToR (RoBERTa-eus-base) | 512 tokens | Ediciones discretas | no disponible |
| `google/gemma-4-E4B-it` | 8B totales / 4.5B activos | Gemma 4 E4B | 256K | Texto libre | Apache 2.0 |

Frente a GECToR-v2, este modelo ofrece una ventaja significativa en categorías semánticas (ortografía, elección de palabra, puntuación) y una salida mucho más rica, aunque pierde en precisión sobre texto limpio (mayor tasa de falsos positivos) y en morfología. Frente al modelo base sin fine-tuning, este está especializado exclusivamente en corrección gramatical en euskera con salida estructurada, mientras que el base es un modelo general multilingüe.

## Limitaciones y advertencias

- **Monolingüe**: el modelo solo está entrenado para euskera. No debe usarse para otros idiomas, aunque el modelo base sea multilingüe.
- **Tasa de falsos positivos alta**: en texto limpio (sin errores) el modelo marca un 8.6% de frases como erróneas, frente al 1.4% de GECToR-v2. Para herramientas de escritura, esto puede generar correcciones incorrectas e irritar al usuario.
- **Debilidad en calque**: la categoría `calque` (calcos léxicos) tiene un rendimiento bajo (17.1% de recall), lo que limita su utilidad para detectar préstamos inadecuados.
- **Rendimiento inferior en morfología**: frente a GECToR-v2, el modelo acierta menos en errores morfológicos (77.1% vs 94.5%), una categoría frecuente en euskera.
- **Sesgos y alucinaciones**: al ser un modelo generativo, puede producir explicaciones incorrectas o referencias normativas erróneas. La evaluación no mide la veracidad de las referencias EBE.
- **Licencia**: el modelo se distribuye bajo Gemma Terms of Use, que puede imponer restricciones de uso comercial. Los datos de entrenamiento y el código están bajo CC-BY-SA 4.0, lo que requiere compartir derivados bajo la misma licencia.
- **Contexto limitado en la práctica**: aunque el modelo base soporta hasta 256K tokens, no se ha verificado el contexto efectivo del fine-tuning. Para la corrección de frases individuales no es un problema, pero para documentos largos puede haber degradación.
- **Sin evaluación externa**: los benchmarks provienen del propio autor y no han sido replicados por terceros. Se recomienda validar en el caso de uso concreto.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/itzune/gemma-4-e4b-horkonpon)
- [Modelo base google/gemma-4-E4B-it](https://huggingface.co/google/gemma-4-E4B-it)
- [Corpus horkonpon-corpus (GitHub)](https://github.com/itzune/horkonpon-corpus)
- [Modelo comparativo gector-eus-v2](https://huggingface.co/itzune/gector-eus-v2)
- [Página oficial de Gemma 4 (Google DeepMind)](https://deepmind.google/models/gemma/gemma-4/)
- [Model card de Gemma 4 (Google AI for Developers)](https://ai.google.dev/gemma/docs/core/model_card_4)
- [Gemma 4 E4B en Ollama](https://ollama.com/library/gemma4:e4b)
- [Guía de Gemma 4 E4B](https://gemma4.dev/models/gemma-4-e4b)

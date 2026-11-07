# masterofaudio2077/egy-g2p-byt5-accent

## Resumen
egy-g2p-byt5-accent es un modelo experimental de conversión de grafemas a fonemas (G2P) para árabe egipcio (código ISO `arz`), es decir, traduce texto escrito en árabe egipcio a su representación fonética en IPA. Lo desarrolla el usuario masterofaudio2077 y se construye mediante un ajuste fino completo de `google/byt5-small`, un modelo byte-level de 300 millones de parámetros con encoder bidireccional y arquitectura T5. El resultado se publica como una versión v0 explícitamente marcada como experimental.

El interés del modelo reside en su capacidad de orientar la salida hacia uno de cuatro acentos regionales (Cairo, Sharqia, Sohag y Aswan) mediante un token centinela que se antepone a los bytes del texto de entrada. Esto lo diferencia de los G2P monolíticos habituales, que producen una única transcripción canónica. La arquitectura byte-level de ByT5 evita depender de un tokenizador de palabras, lo que resulta útil para una lengua con ortografía y variantes dialectales poco normalizadas.

La relevancia práctica es limitada pero específica: sirve como componente para sistemas de síntesis de voz (TTS) o reconocimiento de voz (ASR) en árabe egipcio, y como base para investigar variación fonética dialectal. Conviene tener presente desde el principio que las etiquetas IPA del conjunto de datos son generadas por un LLM y no han sido verificadas por hablantes nativos, por lo que las métricas miden la fidelidad al etiquetado, no la corrección fonética real.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | T5 byte-level (ByT5), encoder bidireccional y decoder autorregresivo |
| Parametros totales | 299.637.760 (aproximadamente 300 M) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible; las frases del conjunto de datos tienen una mediana de 74 bytes y un maximo de 261 bytes |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF, ONNX ni cuantizaciones oficiales) |
| Idiomas soportados | arabe egipcio (`arz`), con cuatro etiquetas de acento: `arz_cairo`, `arz_sharqia`, `arz_sohag`, `arz_aswan` |
| Licencia | Apache-2.0 (pesos); el conjunto de datos de entrenamiento es CC-BY-4.0 |
| Formato de pesos | safetensors (repo de 1,2 GB) |

## Arquitectura y entrenamiento
El modelo parte de `google/byt5-small`, un transformer T5 en el que la entrada y la salida se procesan a nivel de byte en lugar de token. El ajuste fino es completo, no mediante adaptadores. La etiqueta de acento se implementa reutilizando las filas de embedding de los tokens `<extra_id_0>` a `<extra_id_3>` del checkpoint original, que se anteponen a la secuencia de bytes UTF-8 del texto; la salida es la transcripción IPA. Por ello el tokenizador estándar no basta y el repositorio incluye `g2p_byt5_lib.py` para codificar y decodificar correctamente.

Los datos de entrenamiento proceden del conjunto `masterofaudio2077/egy-g2p-dialects`: 1.750 frases multiplicadas por cuatro acentos, es decir, 7.000 filas, con un reparto 80/10/10 mediante hash estable de la frase de modo que las cuatro variantes de una misma frase caen siempre en el mismo fold. La función de pérdida combina label smoothing de 0,1, R-Drop con alpha 1 y un peso 4x sobre los bytes de salida que difieren de la lectura de Cairo, ya que aproximadamente el 97 % de los caracteres son idénticos entre acentos. El optimizador es Lion con learning rate 1,2e-4 (elegido tras una prueba de dos épocas sobre 3e-5, 6e-5 y 1,2e-4), decoupled weight decay de 0,1 solo en matrices de pesos, esquema warm-up/constante/decaimiento lineal (6 %/69 %/25 %), precisión fp32, `torch.compile` y dos GPU T4. Se ejecutaron 12 épocas; la PER de validación dejó de mejorar en la época 4 (0,056) y los pesos publicados corresponden a esa mejor época. Para Sharqia, en cada época una fila con lectura variante se entrena con una u otra lectura al 50/50, y la evaluación acepta cualquiera de las dos.

## Capacidades
- Conversión de grafemas a fonemas (G2P) de texto en árabe egipcio a transcripción IPA.
- Control de acento mediante etiqueta explícita entre cuatro variantes: Cairo, Sharqia, Sohag y Aswan.
- Procesamiento byte-level, sin tokenizador de palabras, lo que permite manejar grafías no normalizadas.
- Generación con búsqueda por haz (beam search); los resultados publicados usan beam 4.
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento.
- Capacidad multilingüe limitada al árabe egipcio; no se documenta soporte de otros idiomas o dialectos árabes.

## Casos de uso
- Síntesis de voz (TTS) en árabe egipcio: el modelo proporciona la secuencia de fonemas IPA que alimenta el front-end de un sistema TTS, y la etiqueta de acento permite generar voces con pronunciación de Cairo, Sharqia, Sohag o Aswan.
- Investigación en variación fonética dialectal: al aceptar una etiqueta de acento, permite comparar sistemáticamente las lecturas producidas para una misma frase en las cuatro variantes y estudiar qué segmentos cambian.
- Preprocesamiento para reconocimiento de voz (ASR): las transcripciones fonéticas pueden servir como referencia auxiliar o para normalizar léxicos de pronunciación en un sistema ASR de árabe egipcio.
- Evaluación de recursos lingüísticos: el modelo y su conjunto de datos permiten medir la calidad de etiquetados IPA generados automáticamente, ya que las métricas PER y WER cuantifican la fidelidad a esas etiquetas.
- Prototipado de aplicaciones de aprendizaje de pronunciación: dado que las frases del conjunto son cortas (mediana de 74 bytes), el modelo encaja en la generación de transcripciones para ejercicios de pronunciación de frases sueltas.
- Base para ajuste fino adicional: al ser un ByT5-small completo con licencia Apache-2.0, puede reentrenarse sobre datos verificados por hablantes nativos o ampliarse a otros dialectos árabes.
- Integración en pipelines de datos lingüísticos: la librería `g2p_byt5_lib.py` permite procesar lotes de frases cortas en CPU o GPU, lo que facilita anotar corpus de texto egipcio con transcripción IPA.

## Benchmarks y rendimiento
Resultados publicados en la model card sobre frases de test reservadas, con beam 4 y la mejor época seleccionada por PER de validación. La columna "oráculo copy Cairo" no es un modelo, sino una referencia que devuelve la lectura correcta de Cairo para todos los acentos.

| Metrica | Este modelo | Oraculo "copy Cairo" |
|---|---|---|
| Phoneme error rate (PER) | 0,0552 | 0,0182 |
| Word error rate (WER) | 0,2423 | 0,1017 |
| Exact sentence match | 0,1608 | 0,6177 |

Desglose por acento:

| Acento | PER | WER | Exact match |
|---|---|---|---|
| arz_cairo | 0,0535 | 0,2376 | 0,1631 |
| arz_sharqia | 0,0562 | 0,2460 | 0,1600 |
| arz_sohag | 0,0555 | 0,2429 | 0,1600 |
| arz_aswan | 0,0556 | 0,2429 | 0,1600 |

Métricas de comportamiento de la etiqueta de acento: `tag_follow_rate` de 0,980 sobre pares de frases cuyas lecturas de referencia difieren entre dos acentos (el modelo sigue el acento correcto en el 98,0 % de los casos; 0,5 significaría que ignora la etiqueta) y `tag_spurious_rate` de 0,232 sobre pares cuyas referencias son idénticas (el modelo produce dos cadenas distintas en el 23 % de los pares, cuando el valor ideal es 0).

## Requisitos de hardware
- VRAM estimada para inferencia: con 300 M parámetros en fp32, los pesos ocupan aproximadamente 1,2 GB; en fp16 o bf16 bajarían a unos 0,6 GB, aunque no se publican cuantizaciones oficiales.
- GPU recomendadas: el modelo se entrenó en 2x T4, por lo que una T4, una V100 o cualquier GPU con al menos 2 GB de VRAM libre es suficiente para inferencia.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060 o superiores; también puede ejecutarse en CPU, como muestra el ejemplo de la model card.
- Opciones de despliegue: `transformers` con `T5ForConditionalGeneration`; el repositorio incluye `g2p_byt5_lib.py`, que requiere torch, pandas y rapidfuzz. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI más allá de la etiqueta `text-generation-inference` y `endpoints_compatible` del repositorio.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| egy-g2p-byt5-accent | 300 M | no disponible (frases de hasta 261 bytes en entrenamiento) | G2P byte-level con etiqueta de acento para arabe egipcio | Apache-2.0 | Hugging Face |
| google/byt5-small | 300 M | no disponible | Modelo base byte-level multilingue, sin funcion G2P especifica | Apache-2.0 | Hugging Face |
| Alternativas G2P para arabe | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de otros modelos G2P comparables para árabe egipcio con control de acento, por lo que la comparativa con alternativas de la misma tarea queda como no disponible.

## Limitaciones y advertencias
- Las etiquetas IPA del conjunto de datos son generadas por un LLM y no verificadas (`annotation_source=llm_generated`, `verified=False`); el modelo hereda sus errores y las métricas miden la fidelidad al etiquetado, no la corrección fonética egipcia.
- Solo existen dos lecturas primarias distintas en los datos (Cairo = Sharqia y Sohag = Aswan); Sharqia se diferencia de Cairo únicamente por variantes opcionales, lo que limita el comportamiento específico por acento.
- El exact sentence match es del 16 %: una frase típica todavía contiene varios fonemas incorrectos.
- Las frases de entrenamiento son cortas (mediana de 74 bytes, máximo de 261); no se han probado textos largos, cambio de código, números, nombres propios ni entrada con diacríticos.
- No se ha evaluado contra pronunciación egipcia transcrita por humanos.
- Riesgo de alucinación fonética: al ser un modelo generativo autorregresivo, puede producir secuencias IPA plausibles pero incorrectas, especialmente en entradas fuera de distribución.
- Sesgos: los derivados del conjunto de datos y de su generación automática; no se documentan sesgos adicionales.
- Licencia Apache-2.0 para los pesos, lo que permite uso comercial con las obligaciones habituales de atribución; el conjunto de datos es CC-BY-4.0 y debe acreditarse.
- Al depender de un token centinela antepuesto a los bytes, el tokenizador estándar no es suficiente; es obligatorio usar la librería incluida para obtener resultados correctos.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/masterofaudio2077/egy-g2p-byt5-accent
- Conjunto de datos de entrenamiento: https://huggingface.co/datasets/masterofaudio2077/egy-g2p-dialects
- Modelo base: https://huggingface.co/google/byt5-small
- Conjunto de datos egyptian-streets: https://huggingface.co/datasets/masterofaudio2077/egyptian-streets
- Conjunto de datos egyptian-streets-youtube: https://huggingface.co/datasets/masterofaudio2077/egyptian-streets-youtube

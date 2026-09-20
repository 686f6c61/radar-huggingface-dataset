# chrismattmann/pantogloss-500-en-v7

## Resumen

Pantogloss 500-to-English successor v7 es un modelo de traducción automática many-to-English desarrollado por chrismattmann (Chris Mattmann) y publicado en HuggingFace bajo licencia Apache 2.0. Se distribuye como artefacto de precisión completa FP32 con un repositorio de 2,2 GB y se ejecuta a través de la librería `pantogloss`, un paquete Python construido sobre TensorFlow/Keras. El modelo parte de `chrismattmann/pantogloss-500-en-v6` y aplica sobre él un ajuste fino acotado para traducción conversacional español-inglés, sin modificar la arquitectura, los tokenizadores ni la dirección many-to-English de la familia.

La relevancia de esta versión es acotada y medible: no añade idiomas nuevos, sino que mejora una capacidad ya existente. Sobre el modelo padre v6, con decodificación greedy idéntica, el candidato seleccionado obtiene incrementos de chrF de entre +2,036 y +2,973 puntos en los conjuntos de evaluación Fisher y CALLHOME, y una mejora agregada de +0,217 chrF y +0,278 BLEU en la suite FLORES+ de 8.250 ejemplos y 50 idiomas.

Su linaje procede del modelo RTG many-to-English descrito por Gowda, Zhang, Mattmann y May en ACL-IJCNLP 2021 (System Demonstrations). La denominación "500-to-English" describe la procedencia del entrenamiento de la familia, no una calidad uniforme en 500 lenguas: la evaluación multilingüe publicada cubre 50 idiomas y el modelo no detecta el idioma de origen ni proporciona confianza calibrada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. Modelo de traducción de secuencia a secuencia de la familia RTG many-to-English (Gowda, Zhang, Mattmann y May, ACL-IJCNLP 2021), con proyecciones query/value en la atención cruzada del decodificador; implementado en TensorFlow/Keras |
| Parametros totales | No disponible (los pesos completos en FP32 ocupan 2,2 GB en el repositorio) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible. La versión publicada es de precisión completa FP32; el ajuste fino usó LoRA de rango 8, pero es un artefacto de entrenamiento, no una variante cuantizada distribuida |
| Idiomas soportados | Dirección many-to-English. Procedencia de familia declarada como 500 lenguas; evaluación multilingüe publicada sobre 50 idiomas; ajuste fino v7 específico de español conversacional |
| Licencia | Apache 2.0 (artefacto del modelo). Las fuentes de entrenamiento conservan sus propios términos y atribución |
| Formato de pesos | TensorFlow/Keras en formato Pantogloss (FP32) |

## Arquitectura y entrenamiento

La arquitectura no se describe en detalle en la información disponible, más allá de que v7 conserva la misma arquitectura, tokenizadores, dirección many-to-English y cobertura de lenguas de la familia que v6. El único detalle estructural explícito es que el ajuste fino aplicó LoRA de rango 8 exclusivamente sobre las proyecciones query y value de la atención cruzada del decodificador, seguido de una fusión del adaptador con factor 0,90 sobre los pesos RTG ordinarios y una conversión de vuelta al formato Pantogloss de TensorFlow/Keras. El modelo publicado es el resultado de esa fusión, en FP32.

El entrenamiento de v7 utilizó 4.000 ejemplos equilibrados de español-inglés procedentes del proyecto de corpus Joshua Decoder, con material Fisher y CALLHOME. Se eliminaron las intervenciones del origen de entrenamiento que solapaban con las fuentes españolas reservadas para evaluación. No se documenta uso de RLHF ni de DPO, ni el número total de tokens de entrenamiento, ni la composición completa del dataset original de la familia. El texto del corpus, el texto de evaluación y el estado del optimizador de PyTorch no se incluyen en el repositorio; los detalles de atribución y preparación están en `V7-ATTRIBUTION.md`.

## Capacidades

- Traducción de texto a inglés (many-to-English) para entradas en otros idiomas; el modelo está etiquetado con el pipeline `translation`.
- Mejora específica de traducción conversacional español-inglés, medida sobre transcripciones de habla espontánea de Fisher y CALLHOME.
- Cobertura multilingüe heredada de la familia, con evaluación publicada en 50 idiomas mediante la suite FLORES+.
- Decodificación greedy documentada en la evaluación; el autor no describe otras estrategias de decodificación para los resultados presentados.
- Integración mediante el paquete Python `pantogloss`: `Translator.from_pretrained("pantogloss-500-en-v7", device="auto")` y llamada a `translator.translate(...)`, con selección automática de dispositivo.
- No es un reconocedor automático de habla: se ajustó con texto de transcripciones, no con audio. No procesa audio de entrada.
- No se documenta soporte de tool calling, function calling, capacidades de agente, razonamiento multi-paso, visión ni modo de pensamiento.
- No detecta el idioma de origen ni devuelve confianza calibrada.

## Casos de uso

- Traducción de transcripciones conversacionales de investigación: el modelo se ajustó con material Fisher/CALLHOME, por lo que es adecuado para convertir transcripciones de habla espontánea español-inglés en corpus paralelos, siempre con revisión de hablantes nativos.
- Pipelines de subtitulado con ASR externo: combinado con un sistema de reconocimiento de voz que genere texto en español, el modelo produce la versión inglesa de los subtítulos; conviene revisar las frases largas por riesgo de acortamiento o repetición.
- Analítica de voz del cliente en centros de contacto: transcripciones de llamadas en español se homogeneizan a inglés para aplicar después clasificación de temas o análisis de sentimiento sobre un único idioma de trabajo.
- Localización de documentación y contenidos: traducción de textos de producto o soporte al inglés como paso previo a la revisión editorial humana, aprovechando la licencia Apache 2.0 para uso comercial.
- Indexación y búsqueda multilingüe: traducción de documentos a inglés para alimentar un índice de búsqueda único, con el texto original conservado como referencia.
- Aumento de datos para otros sistemas: generación de pares de traducción destinados a entrenar o evaluar modelos de traducción o clasificadores, teniendo en cuenta que las salidas no están validadas por hablantes nativos.
- Investigación en traducción automática: reproducción de las comparativas chrF publicadas frente a v6 y análisis de los descensos observados en lenguas concretas de FLORES+.
- Preprocesado de encuestas y feedback abierto: normalización a inglés de respuestas en varios idiomas antes de un análisis temático, asumiendo la variabilidad de calidad por dominio y registro.

## Benchmarks y rendimiento

Incrementos de chrF del candidato v7 frente al modelo padre v6 publicado, con decodificación greedy idéntica en ambos. Candidato y padre registraron cero fallos de ejecución en todos los conjuntos listados.

| Division de evaluacion | Ejemplos | chrF v6 | chrF v7 | Delta |
|---|---:|---:|---:|---:|
| Fisher dev | 3.979 | 65,939 | 68,912 | +2,973 |
| Callhome devtest | 3.966 | 50,969 | 53,147 | +2,178 |
| Fisher dev2 | 3.961 | 66,838 | 69,492 | +2,655 |
| Fisher test, confirmación sellada | 3.641 | 65,252 | 68,027 | +2,776 |
| Callhome evltest, confirmación sellada | 1.829 | 51,314 | 53,351 | +2,036 |

Los dos conjuntos de confirmación se abrieron una única vez, después de fijar la selección de checkpoint y la puerta de desarrollo multilingüe.

Evaluación multilingüe sobre la suite fijada de 8.250 ejemplos y 50 idiomas de FLORES+ (desarrollo):

| Metrica | Cambio de v7 frente a v6 |
|---|---|
| chrF agregado | +0,217 |
| BLEU agregado | +0,278 |
| Fallos | 0 |
| Lenguas por debajo del suelo de retención fijado en −0,5 chrF | Ninguna |

Doce idiomas presentaron deltas negativos pequeños de chrF. Los mayores fueron indonesio −0,473, esloveno −0,431, danés −0,306 y zulú −0,184. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K y similares no aplican a este modelo) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia, los pesos completos en FP32 ocupan 2,2 GB en el repositorio, por lo que se necesita al menos ese espacio de memoria más el sobrecoste del runtime de TensorFlow/Keras; no se documenta el pico real de memoria.
- GPU recomendadas: no disponibles. El autor no publica una tabla de hardware compatible.
- ¿Cabe en GPU de consumo? No se confirma explícitamente. El tamaño de los pesos en FP32 (2,2 GB) hace plausible su ejecución en GPUs de consumo con memoria suficiente, pero es una inferencia a partir del tamaño del repositorio, no un dato verificado por el autor.
- Opciones de despliegue: paquete Python `pantogloss` con `Translator.from_pretrained(..., device="auto")` sobre TensorFlow/Keras. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que el formato de pesos es TensorFlow/Keras y no GGUF ni safetensors.
- Latencia y throughput: no disponibles. La model card no incluye medidas de velocidad ni de tokens por segundo.

## Comparativa con modelos similares

La información proporcionada solo permite comparar v7 con su modelo padre directo, `chrismattmann/pantogloss-500-en-v6`. No se dispone de datos de otros modelos de traducción comparables (por ejemplo, alternativas many-to-English de otros autores) en la información consultada.

| Modelo | Relacion | Parametros | Contexto | chrF Fisher dev | chrF Callhome devtest | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| pantogloss-500-en-v7 | Modelo evaluado | No disponible (2,2 GB en FP32) | No disponible | 68,912 | 53,147 | Apache 2.0 | HuggingFace |
| pantogloss-500-en-v6 | Modelo padre | No disponible | No disponible | 65,939 | 50,969 | No disponible en la informacion | HuggingFace |
| Otras alternativas many-to-English | — | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- La calidad varía según el idioma, el dominio, el sistema de escritura y la frase concreta; el propio autor lo advierte.
- El modelo no detecta el idioma de origen ni ofrece confianza calibrada, lo que dificulta el enrutado automático y el control de errores en producción.
- Las entradas pueden traducirse mal, acortarse, alucinarse o repetirse.
- No ha sido validado para decisiones críticas de seguridad, médicas, legales ni de otro tipo de alto riesgo; las traducciones con consecuencias deben revisarse.
- Las métricas automáticas no sustituyen la revisión de hablantes nativos.
- "500-to-English" describe la procedencia de entrenamiento de la familia, no una calidad uniforme en 500 lenguas; la evaluación multilingüe publicada cubre 50 idiomas.
- Doce idiomas mostraron descensos pequeños de chrF en FLORES+ (indonesio −0,473, esloveno −0,431, danés −0,306, zulú −0,184 y otros), pese a la mejora agregada.
- Las mejoras en español conversacional pueden no transferirse por igual a todos los dialectos, registros, transcripciones acústicas o dominios generales.
- No es un reconocedor automático de habla: se ajustó con texto de transcripciones Fisher/CALLHOME, no con audio.
- El ajuste fino se realizó sobre 4.000 ejemplos, un volumen reducido; conviene vigilar el sobreajuste al dominio conversacional.
- Licencia Apache 2.0 para el artefacto del modelo, pero las fuentes de entrenamiento conservan sus propios términos y requieren atribución; los creadores de las fuentes, los contribuidores del corpus, LDC y los hablantes no respaldan Pantogloss.
- El repositorio no incluye el texto del corpus, el texto de evaluación ni el estado del optimizador, lo que limita la reproducibilidad exacta del ajuste.
- El modelo se publica como opt-in explícito: el modelo compacto de Pantogloss sigue siendo el predeterminado del paquete.
- A fecha de creación de la ficha, el repositorio registra 0 descargas y 0 "likes", por lo que la validación por parte de la comunidad es nula.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/chrismattmann/pantogloss-500-en-v7
- Modelo base (v6): https://huggingface.co/chrismattmann/pantogloss-500-en-v6
- Atribución y preparación de datos: https://huggingface.co/chrismattmann/pantogloss-500-en-v7/blob/main/V7-ATTRIBUTION.md
- Referencia del linaje: Gowda, Zhang, Mattmann y May, "Many-to-English Machine Translation at Scale", ACL-IJCNLP 2021 System Demonstrations (URL no disponible en la información proporcionada).
- Proyecto de corpus Joshua Decoder: URL no disponible en la información proporcionada.
- Corpus Fisher y CALLHOME (LDC): URL no disponible en la información proporcionada.
- Otros enlaces: la búsqueda web realizada no devolvió resultados relevantes para este modelo; los resultados obtenidos trataban sobre Windows 11 y no guardan relación con Pantogloss.

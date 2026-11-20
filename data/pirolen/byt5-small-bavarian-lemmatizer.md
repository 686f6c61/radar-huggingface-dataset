# pirolen/byt5-small-bavarian-lemmatizer

## Resumen

El modelo `byt5-small-bavarian-lemmatizer` es un ajuste fino de `google/byt5-small` (299.637.760 parámetros) desarrollado por el usuario pirolen para una tarea muy específica: la lematización de palabras bávaras en contexto hacia la forma canónica (headword) del *Bayerisches Wörterbuch* (BWB), el diccionario de los dialectos bávaros de Baviera elaborado por la Academia de Ciencias y Humanidades de Baviera (BAdW). Dado un término tal y como aparece en un testimonio textual y la frase que lo contiene, el modelo devuelve la entrada de diccionario bajo la que se archiva.

La elección de una arquitectura byte-level seq2seq no es casual: la ortografía bávara es enormemente variable y carece de vocabulario fijo, por lo que tokenizar a nivel de byte evita los problemas de cobertura léxica que afectarían a un tokenizador subword convencional. El modelo se entrenó sobre aproximadamente 21.000 pares testimonio/entrada extraídos del corpus Bar-Lem, presentado en un artículo de EACL 2027, con una partición agrupada por lema que garantiza que ningún lema de test aparece en entrenamiento.

Su relevancia actual reside en que demuestra que un modelo de 300M parámetros puede igualar estadísticamente a LLMs de 7-10B ajustados con QLoRA en esta tarea lingüística histórica, con un coste computacional unas 25 veces menor. Es una herramienta de nicho para humanidades digitales, lexicografía histórica y procesamiento de dialectos, no un modelo de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (T5) byte-level, ByT5-small |
| Parámetros totales | 299.637.760 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 bytes de entrada (truncados en entrenamiento); salida máxima de 48 bytes |
| Tipos de cuantización | no disponible (pesos en safetensors; compatible con cuantización estándar de transformers, pero no se documentan variantes publicadas) |
| Idiomas soportados | bar (bávaro), de (alemán) |
| Licencia | CC BY-SA 4.0 (pesos); modelo base Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `google/byt5-small`, un transformer encoder-decoder de la familia T5 que opera directamente sobre bytes UTF-8 en lugar de tokens subword. Esta decisión arquitectónica es clave para datos dialectales: elimina el vocabulario fijo y permite representar cualquier variante ortográfica sin tokens fuera de vocabulario. El ajuste fino se realizó durante 3 épocas (1.947 pasos), con batch size 32, learning rate 3e-4, precisión bf16 (ByT5 diverge en fp16), semilla 42 y una única GPU NVIDIA RTX 5000 Ada de 32 GB en aproximadamente 8 minutos. La longitud máxima de entrada fue de 256 bytes y la de salida de 48 bytes; la decodificación en evaluación fue greedy.

Los datos provienen íntegramente del *Bayerisches Wörterbuch*: 25.862 pares testimonio/entrada, divididos 80/10/10 en 20.752 de entrenamiento, 2.687 de validación y 2.423 de test. La partición está agrupada por lema, de modo que el conjunto de test no comparte ningún lema con entrenamiento, lo que mide generalización y no memorización. Aproximadamente el 30 % de las filas están fechadas; las regiones con más datos son Alta Baviera, Alto Palatinado y Baja Baviera, mientras que Alta Franconia, Media Franconia y Suabia están escasamente representadas. Un 24,8 % de los pares son filas de identidad (la palabra foco ya coincide con su lema ignorando mayúsculas), resolubles por copia, por lo que los resultados se reportan por separado. No se documenta uso de RLHF ni DPO; es un ajuste supervisado estándar sobre datos reales de diccionario, sin datos sintéticos.

## Capacidades

- Lematización contextual de palabras bávaras hacia la forma canónica del BWB, con formato de entrada fijo: `lemma: <palabra foco> | kontext: <frase>`.
- Generación de texto seq2seq a nivel de byte, sin dependencia de vocabulario subword.
- Manejo de variabilidad ortográfica extrema propia de los dialectos bávaros.
- Cobertura de material histórico y moderno (bávaro medio-alto alemán hasta actualidad).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas a bar y de; no es un modelo multilingüe general.
- Modo thinking, visión o audio: no disponible.
- No genera puntuaciones de confianza ni mecanismos de abstención.

## Casos de uso

- Lexicografía histórica asistida: el modelo permite a lexicógrafos del BWB pre-asignar automáticamente testimonios a su entrada de diccionario, reduciendo el trabajo manual de archivo de decenas de miles de *Belege* con una tasa de acierto estricto del 53,3 % en casos no triviales.
- Digitalización de corpus dialectales: al procesar transcripciones o ediciones de textos bávaros, el modelo normaliza formas ortográficamente variables hacia lemas canónicos, facilitando la indexación y búsqueda en repositorios digitales.
- Investigación en humanidades digitales: permite estudios cuantitativos de frecuencia léxica y evolución histórica al disponer de lemas normalizados sobre material dialectal históricamente heterogéneo.
- Enriquecimiento de ediciones críticas: integrado en pipelines de anotación, añade la entrada de diccionario como metadato a cada aparición textual, útil para anotaciones filológicas reproducibles.
- Filtrado y agrupación de material dialectal: agrupar testimonios por lema para detectar variantes ortográficas de un mismo término y estudiar su distribución geográfica o temporal.
- Componente en pipelines de PLN histórico de bajo coste: al requerir solo 300M parámetros y ~8 minutos de ajuste en una GPU de 32 GB, es desplegable en infraestructura modesta para tareas de normalización previas a modelos mayores.
- Evaluación comparativa de LLMs en tareas de nicho: sirve como referencia ligera frente a LLMs de 7-10B en lematización dialectal, útil para benchmarking de eficiencia.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (test completo, n = 2.423, sin muestreo; STRICT = coincidencia exacta ignorando mayúsculas; ACCEPTED = incluye otro lema válido del mismo foco):

| Subconjunto | n | STRICT | ACCEPTED |
|---|--:|--:|--:|
| No identidad (requiere transformación real) | 1.938 | 53,3 % | 55,5 % |
| Identidad (foco ya igual a lema) | 485 | 90,9 % | 92,0 % |
| Global | 2.423 | 60,8 % | 62,8 % |
| Baseline de copia (salida = entrada), global | 2.423 | 20,0 % | no disponible |
| Baseline de copia, no identidad | 1.938 | 0 % | no disponible |

Comparación declarada por el autor en el mismo test: nueve LLMs de 7-10B ajustados con QLoRA (Apertus, Occiglot, EuroLLM, LLaMmlein, Mistral, Llama-3.1, Gemma-2, Qwen2.5 y genba-10b) obtuvieron entre 45,9 % y 52,2 % en STRICT no identidad. Este modelo de 300M se sitúa en la parte alta de esa banda y es estadísticamente indistinguible del mejor LLM (Occiglot, 52,2 %; McNemar p = 0,63) con aproximadamente 1/25 del tamaño. Salamandra-7B (36,6 %) y Teuken-7B (23,0 %) quedaron muy por debajo.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16/fp16, aproximadamente 0,6 GB de pesos (300M parámetros) más overhead de activaciones; cómodo en cualquier GPU con 2 GB o más.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; también CPU para volúmenes moderados. El entrenamiento documentado usó una RTX 5000 Ada de 32 GB, pero el ajuste fino cabe en GPUs de 16 GB con batch reducido.
- Cabe en GPU consumer: sí, holgadamente, incluso en GPUs de gama baja y en hardware integrado para inferencia por lotes pequeños.
- Opciones de despliegue: `transformers` (AutoModelForSeq2SeqLM), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible`), y exportación a ONNX o cuantización estándar para CPU. No se documentan pesos GGUF publicados.
- Latencia y throughput estimados: no disponible en la información proporcionada; el autor solo indica ~8 minutos de entrenamiento en una RTX 5000 Ada.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | STRICT no identidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| byt5-small-bavarian-lemmatizer | 300M | Lematización BWB bávara | 53,3 % | CC BY-SA 4.0 | Hugging Face |
| Occiglot (QLoRA 7-10B) | 7-10B | Lematización BWB bávara | 52,2 % | según modelo base | Ajuste no publicado como tal |
| Salamandra-7B (QLoRA) | 7B | Lematización BWB bávara | 36,6 % | según modelo base | Ajuste no publicado como tal |
| Teuken-7B (QLoRA) | 7B | Lematización BWB bávara | 23,0 % | según modelo base | Ajuste no publicado como tal |

Los datos de los LLMs comparados provienen de la model card del autor; no se dispone de información sobre la publicación de esos ajustes concretos. No se conocen otros lematizadores bávaros públicos comparables en la información disponible.

## Limitaciones y advertencias

- Predice convenciones de entrada del BWB, que pueden diferir de los lemas del alemán estándar (por ejemplo, `Abtritt(s)adel` o entradas con sufijo como `-a`); no es un lematizador de alemán estándar.
- Casi la mitad de las predicciones no identidad son erróneas: errores típicos son formas plausibles pero no canónicas (por ejemplo, `Abputzicht` en lugar de `Abputzet`) y palabras en ortografía antigua tipo alto alemán medio que se dejan sin cambiar (por ejemplo, `achseln` en lugar de `Achsel`).
- Siempre genera algo: no hay puntuación de confianza ni abstención, lo que exige validación humana en producción.
- La cobertura sigue al diccionario: regiones con pocos datos (Alta Franconia, Media Franconia, Suabia) y material sin fechar están infrarrepresentados.
- Entrenado solo con palabras foco que son testimonios de diccionario; su comportamiento en texto corrido arbitrario (redes sociales, transcripciones) no se ha evaluado.
- Licencia CC BY-SA 4.0 en los pesos: el uso comercial es posible pero obliga a atribución y a compartir obras derivadas bajo la misma licencia; además, los datos de entrenamiento provienen de artículos del BWB, cada uno con su propia licencia, lo que puede imponer restricciones adicionales.
- Riesgo de sesgo geográfico y temporal derivado de la distribución del corpus; no se documentan evaluaciones de sesgo adicionales.
- Riesgo de alucinación en el sentido de generar lemas plausibles pero inexistentes en el diccionario, dado que no hay mecanismo de verificación contra el léxico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pirolen/byt5-small-bavarian-lemmatizer
- Modelo base: https://huggingface.co/google/byt5-small
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- Artículo EACL 2027 del corpus Bar-Lem: no disponible (referenciado en la model card sin enlace directo)
- *Bayerisches Wörterbuch* (BAdW): no disponible en la información proporcionada
- Repositorio o demo adicional: no disponible

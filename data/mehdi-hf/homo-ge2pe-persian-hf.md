# mehdi-hf/Homo-GE2PE-Persian-HF

## Resumen

Homo-GE2PE-Persian-HF es un modelo de generación de pronunciación (G2P, grapheme-to-phoneme) para persa, desarrollado originalmente por Elnaz Rahmati y colaboradores, y reempaquetado por mehdi-hf en formato transformers nativo. El modelo resuelve dos problemas del procesamiento del persa: la restauración del ezafe (la vocal de enlace entre un sustantivo y su modificador, que no se escribe en la escritura persa) y la desambiguación de homógrafos (palabras que se escriben igual pero se pronuncian distinto, como کرم que puede ser *karam* "generosidad" o *kerem* "crema"). Su arquitectura es un T5 encoder-decoder basado en google/byt5-small, con 8.264.064 parámetros en total, y opera a nivel de bytes, lo que le permite manejar la escritura persa sin necesidad de un tokenizador específico.

Este repositorio no es un modelo nuevo: los pesos son byte-idénticos a los de MahtaFetrat/Homo-GE2PE-Persian. La diferencia es el empaquetado: el original incluye una dependencia externa (Parsivar) y un wrapper personalizado (GE2PE.py), mientras que esta versión es un modelo T5 estándar que se puede cargar directamente con `from_pretrained()`. Esto lo convierte en un frontend de pronunciación apto para integrarse en pipelines de TTS como pocket-tts-farsi, con un coste computacional muy bajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | T5 (encoder-decoder) basado en google/byt5-small, byte-level |
| Parametros totales | 8.264.064 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | fa (persa) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo usa la arquitectura T5 con codificación byte-level, heredada de ByT5-small. Esto significa que no depende de un tokenizador con vocabulario fijo, sino que opera sobre bytes, lo que es especialmente útil para el persa por su escritura y su uso del ZWNJ (zero-width non-joiner). El modelo fue entrenado desde la base de google/byt5-small (Apache 2.0) con el dataset HomoRich-G2P-Persian, que contiene 528.891 oraciones persas anotadas con su pronunciación, incluyendo información sobre ezafes y homógrafos. El artículo que lo acompaña (arXiv:2505.12973) aboga por un enfoque de G2P basado en datos ricos y modelos rule-based, en lugar de soluciones más complejas.

La innovación técnica principal del modelo es su capacidad de desambiguar homógrafos y restaurar ezafes usando contexto. La versión reempaquetada elimina la dependencia de Parsivar, un normalizador persa que se usaba en el original. Según las mediciones del autor del reempaquetado, al eliminar Parsivar se mejoran todas las métricas en el benchmark SentenceBench, porque Parsivar fusionaba preposiciones con la palabra siguiente de forma inconsistente con las anotaciones de referencia. El modelo emite una romanización interna propia (GE2PE) que requiere mapeo para compararse con notaciones convencionales; por ejemplo, el símbolo `1` marca la inserción de un ezafe y no es un fonema.

## Capacidades

- Generación de G2P (grapheme-to-phoneme) para persa: convierte texto persa a notación fonética romanizada.
- Restauración de ezafe: inserta la vocal de enlace entre sustantivo y modificador en contextos donde la escritura persa no la representa.
- Desambiguación de homógrafos: distingue entre lecturas alternativas de palabras homógrafas en función del contexto (por ejemplo, کرم como *karam* o *kerem*).
- Integración directa con transformers: el modelo se carga con `AutoTokenizer` y `T5ForConditionalGeneration`, sin dependencias adicionales.
- Funcionamiento en CPU: al ser un modelo de 8 millones de parámetros, puede ejecutarse en entornos sin GPU.
- No soporta tool calling, vision, audio ni procesamiento multimodal.

## Casos de uso

- Frontend de un sistema TTS persa: el modelo convierte texto escrito a fonemas, que luego se alimentan a un sintetizador de voz. Su tamaño reducido permite ejecutarlo en tiempo real incluso en CPU.
- Normalización de pronunciación en asistentes de voz: cuando el usuario ha escrito texto libre, el modelo corrige la pronunciación de homógrafos antes de la síntesis.
- Lectura asistida para estudiantes de persa: puede pronunciar automáticamente palabras ambiguas en libros o artículos.
- Accesibilidad para personas con dislexia: una aplicación de ayuda a la lectura puede desambiguar pronunciaciones y mostrar la vocalización correcta.
- Análisis fonológico en lingüística computacional: investigadores pueden usar el modelo para generar transcripciones fonéticas de corpus persas sin necesidad de herramientas externas pesadas.
- Integración en pipelines de procesamiento de lenguaje natural: el modelo puede preprocesar texto para sistemas de reconocimiento de voz (ASR) persa, alineando la ortografía con la pronunciación esperada.

## Benchmarks y rendimiento

| Metrica (SentenceBench, 400 oraciones) | Original (con Parsivar) | Este repo |
|---|---|---|
| PER (phoneme error rate) ↓ | 3,47 % | 3,22 % |
| WER (word error rate) ↓ | 19,47 % | 16,07 % |
| Homograph accuracy ↑ | 67,45 % | 70,28 % |
| Ezafe F1 ↑ | 82,76 % | 85,04 % |

No se han publicado resultados adicionales de benchmarks en la informacion disponible, como MMLU, HumanEval o GSM8K, porque este modelo no esta pensado para tareas generales de razonamiento o codigo. Los resultados presentados son los que constan en la model card del autor del reempaquetado, basados en el benchmark SentenceBench.

## Requisitos de hardware

- VRAM estimada: el modelo tiene ~8M parametros, por lo que la inferencia requiere menos de 100 MB de memoria en precision f32. En cuantizacion ligera o en CPU, la memoria total es inferior a 1 GB.
- GPU recomendada: no se requiere GPU especifica. Cualquier GPU moderna (incluso una integrada) o directamente una CPU sirve para ejecutarlo con latencia aceptable.
- Compatibilidad con GPU de consumo: si, se puede ejecutar en tarjetas de gama baja como GTX 1650 o inferiores.
- Opciones de despliegue: gracias a su formato transformers, es compatible con pipelines de Hugging Face, y se puede servir con TGI, vLLM (aunque no es necesario) o simplemente con PyTorch en un script.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Dada la pequenez del modelo, se espera una latencia inferior a 100 ms en CPU para frases cortas, pero no hay datos publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mehdi-hf/Homo-GE2PE-Persian-HF | 8.264.064 | no disponible | MIT | safetensors | Reempaquetado sin Parsivar, pesos identicos al original |
| MahtaFetrat/Homo-GE2PE-Persian | 8.264.064 | no disponible | MIT | original (zip + wrapper GE2PE.py) | Version original, requiere Parsivar y wrapper |
| google/byt5-small | ~300M | no disponible | Apache 2.0 | safetensors | Modelo base preentrenado sin ajuste fino para G2P persa |

La comparativa se limita a modelos relacionados porque no se dispone de otros modelos G2P persas comparables en la informacion disponible. La diferencia clave entre este reempaquetado y el original es la eliminacion de Parsivar, que mejora las metricas de error y la precision en homografos y ezafe.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos especificos en la informacion disponible, pero el modelo se entreno solo con persa y su comportamiento dependera de la composicion del dataset HomoRich.
- Riesgo de alucinacion: como todo modelo generativo, puede producir salidas incorrectas en textos con caracteres arabes (ي/ك), digitos extranos o inconsistencias de ZWNJ para los que no fue entrenado.
- Limitaciones de contexto: no se ha especificado la longitud de contexto del modelo. Por su arquitectura ByT5, se recomienda usar tramos de texto cortos (frases u oraciones); el autor sugiere `max_length=512` en la decodificacion.
- Restricciones de licencia: el modelo es MIT, lo que permite uso comercial. Sin embargo, el modelo base google/byt5-small es Apache 2.0, y la informacion del repositorio incluye atribuciones en NOTICE.md. Es responsabilidad del usuario cumplir con ambas licencias en produccion.
- Caveat para produccion: es obligatorio normalizar el texto de entrada en un sistema real; si no se hace, el modelo puede fallar. El autor del reempaquetado recomienda usar un normalizador razonable o aplicar normalizacion propia, pero no incluye ninguno.
- Advertencia sobre la notacion de salida: la romanizacion que emite el modelo difiere de la notacion fonetica convencional. Para comparar con otros sistemas hay que mapear los simbolos (por ejemplo, `/` a `a`, `a` a `A`, `1` se elimina). Ignorar este mapeo produce errores de aproximadamente el 30% en PER, en lugar del ~3% real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mehdi-hf/Homo-GE2PE-Persian-HF
- Modelo original: https://huggingface.co/MahtaFetrat/Homo-GE2PE-Persian
- Dataset HomoRich: https://huggingface.co/datasets/MahtaFetrat/HomoRich-G2P-Persian
- Benchmark SentenceBench: https://huggingface.co/datasets/MahtaFetrat/SentenceBench
- Articulo en arXiv: https://arxiv.org/abs/2505.12973
- Modelo TTS asociado: https://huggingface.co/mehdi-hf/pocket-tts-farsi

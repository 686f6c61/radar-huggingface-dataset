# SlayerLab/GoLLeM-45M-PL

## Resumen

GoLLeM-45M-PL es un modelo de lenguaje de tipo GPT-2 con 42,5 millones de parámetros, entrenado desde cero sobre 2,96 GB de texto en polaco procedente del corpus SpeakLeash. Fue desarrollado por Kate Majzel (el repositorio de Hugging Face de SlayerLab es una copia espejo) como artefacto de un experimento de investigación sobre tokenización: el objetivo era determinar si un tokenizer BPE dedicado al polaco ofrece ventajas frente al tokenizer original de GPT-2 con el mismo presupuesto de entrenamiento. La conclusión principal del estudio es que el tokenizer polaco no produce un modelo mejor, pero sí comparable, y lo hace 2,5 veces más barato en coste computacional.

El modelo tiene una arquitectura transformer estándar de 8 capas, 8 cabezas de atención y 512 dimensiones de ocultación, con una ventana de contexto de 1024 tokens. Se distribuye bajo licencia MIT en formato safetensors y es compatible con la librería Transformers. Su relevancia actual radica en que aporta evidencia empírica sobre el impacto real de los tokenizers en modelos pequeños, una cuestión que afecta al diseño de modelos multilingües y de bajo coste.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder), 8 capas, 8 cabezas, 512 dimensiones |
| Parametros totales | 42.521.600 (25,7 M sin embeddings) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible (pesos en bfloat16 en el repositorio) |
| Idiomas soportados | Polaco |
| Licencia | MIT |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT-2 estándar: un transformer decoder con 8 capas, 8 cabezas de atención y 512 dimensiones de representación. No emplea mecanismos de mezcla de expertos ni atención lineal; es un transformer denso clásico. El tokenizer es un byte-level BPE entrenado específicamente para polaco, con 32.568 posiciones de vocabulario más 200 tokens especiales. Un 27,9% de las posiciones corresponden a tokens con diacríticos polacos, y el tokenizer tiene una densidad de 1,96 veces más bytes por token que el tokenizer de GPT-2 (4,050 frente a 2,066 bytes/token en el corpus de entrenamiento).

El entrenamiento se realizó sobre 2,96 GB de texto, 803.177 documentos, procedentes de SpeakLeash. La composición del corpus es: 37% enciclopedia y literatura, 22% foros, 27% web, 11% periodismo y ciencia, y 3% textos oficiales. Se excluyeron deliberadamente traducciones, subtítulos, texto sintético, letras de canciones y Common Crawl sin filtrar. El modelo se entrenó durante 1 época con 731 millones de tokens (17,2 tokens por parámetro), usando AdamW con tasa de aprendizaje de 1e-3 a 1e-4, en bfloat16, sobre una única GPU RTX 5080, con un tiempo total de 49,7 minutos. No se aplicó RLHF ni DPO; es un modelo base de continuación de texto.

## Capacidades

- Generación de texto en polaco: produce frases gramaticalmente correctas a nivel de oración, aunque pierde coherencia en textos largos.
- Modelado de lenguaje: presenta un BPB de 1,2114 en un conjunto held-out privado de SpeakLeash (1.999 documentos, 2.767.440 bytes).
- Clasificación de sentimiento zero-shot mediante log-likelihood con normalización PMI: alcanza un 47,2% de precisión en PolEmo2-IN, superando la clase mayoritaria (40%) y al GPT-2 original (20,8%).
- Clasificación de tópicos zero-shot: 31,5% de precisión en 8Tags, frente a 16,5% de la clase mayoritaria y 17,8% del GPT-2.
- Continuación de texto con parámetros de generación recomendados: muestreo con temperatura 0,8, top-p 0,9 y penalización de repetición 1,15.
- No soporta tool calling, ni agentes, ni capacidades multimodales. Es un modelo base sin ajuste instructivo.

## Casos de uso

- Investigación académica sobre tokenización: el modelo es una herramienta de referencia para estudiar el impacto del tokenizer en el rendimiento de modelos pequeños. Puede usarse para replicar el experimento o para comparar otras estrategias de tokenización en polaco.
- Experimentos de fine-tuning para tareas de clasificación de texto en polaco: al ser un modelo base pequeño, permite ajustar capas de clasificación sobre conjuntos de datos como PolEmo2 o 8Tags con recursos mínimos, sirviendo como línea base para modelos más grandes.
- Evaluación de métricas de modelado de lenguaje: su BPB medido sobre un corpus held-out estandarizado permite comparar objetivamente modelos con tokenizers diferentes, evitando el sesgo de la perplexidad por token.
- Docencia y divulgación: por su tamaño reducido y licencia MIT, es adecuado para cursos de procesamiento de lenguaje natural donde se expliquen arquitecturas transformer, entrenamiento de tokenizers o metodología experimental.
- Generación de texto creativa de baja exigencia: puede producir cuentos cortos, poemas o textos informales en polaco, siempre que el usuario supervise el resultado y asuma la posible incoherencia o alucinación.
- Desarrollo de herramientas de análisis lingüístico: su tokenizer dedicado al polaco puede integrarse en pipelines de preprocesado o en estudios sobre frecuencia de unidades subpalabra en esta lengua.

## Benchmarks y rendimiento

Los resultados que se muestran a continuación son los declarados por el autor en la model card. No se han verificado de forma independiente.

| Tarea | Dataset | Métrica | GoLLeM-45M-PL | R2a (GPT-2 tokenizer) | GPT-2 original | Clase mayoritaria |
|---|---|---|---|---|---|---|
| Clasificación de sentimiento (zero-shot) | PolEmo2.0-IN | Accuracy (PMI-normalized) | 47,2% | 43,8% | 20,8% | 40,0% |
| Clasificación de tópicos (zero-shot) | 8Tags | Accuracy (PMI-normalized) | 31,5% | 29,8% | 17,8% | 16,5% |
| Modelado de lenguaje | SpeakLeash held-out | BPB (media de 3 semillas) | 1,2114 (sd 0,0100) | 1,1946 (sd 0,0035) | 2,9555 | — |

Además, el autor reporta una comparativa de coste de entrenamiento: el modelo con tokenizer polaco (R1) necesitó 49,7 minutos y 42,5 M de parámetros, mientras que el mismo presupuesto de texto con tokenizer GPT-2 (R2a) requirió 122,4 minutos y 51,5 M de parámetros. Con presupuesto de tokens equivalente (R2b), el modelo con tokenizer polaco supera al de tokenizer GPT-2 en BPB en un 5,30%, equivalente a 6,4 desviaciones estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en bfloat16, el modelo ocupa aproximadamente 85 MB. En float32 serían unos 170 MB. Es viable en cualquier GPU con al menos 1 GB de VRAM, incluidas GPUs integradas.
- GPU recomendadas: cualquier GPU moderna, desde una RTX 3050 hasta una RTX 4090 o A100. También funciona en CPU sin problema para generación de texto corto.
- Cabe en GPUs de consumo: sí, incluso en las más modestas. También se puede ejecutar en Raspberry Pi o en entornos sin GPU.
- Opciones de despliegue: compatible con Transformers (pipeline de text-generation), puede servirse con Text Generation Inference (TGI) dado que es compatible con `endpoints_compatible`, y puede convertirse a GGUF para usar con llama.cpp u Ollama.
- Latencia y throughput estimados: no se han publicado mediciones oficiales. Dado el tamaño, la generación de 50 tokens debería ser prácticamente instantánea en GPU y de unos pocos cientos de milisegundos en CPU moderna.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tokenizer | BPB (SpeakLeash) | Licencia |
|---|---|---|---|---|---|
| GoLLeM-45M-PL | 42,5 M | 1024 | Polaco BPE (32.768) | 1,2114 | MIT |
| R2a (mismo experimento) | 51,5 M | 1024 | GPT-2 BPE (50.257) | 1,1946 | MIT |
| GPT-2 original (zero-shot) | 124 M | 1024 | GPT-2 BPE | 2,9555 | MIT |

No se dispone de datos de otros modelos pequeños en polaco (como Bielik v3) para comparar directamente, ya que los benchmarks reportados se limitan al experimento interno. La comparativa más relevante es la interna entre los tres modelos del estudio, que muestra que el tokenizer polaco logra un rendimiento casi equivalente al de GPT-2 con un 17% menos de parámetros y un 59% menos de tiempo de entrenamiento.

## Limitaciones y advertencias

- Modelo base sin ajuste instructivo: solo realiza continuación de texto, no sigue instrucciones ni tiene filtrado de seguridad.
- Escala muy reducida: produce polaco correcto a nivel de oración, pero alucina hechos y pierde coherencia después de unas pocas frases. El autor cita un ejemplo donde el modelo genera una localización geográfica falsa combinando nombres reales.
- Datos de foros: el 22% del corpus proviene de foros de internet, por lo que el modelo puede reproducir prejuicios, lenguaje ofensivo o sesgos presentes en esas fuentes. No debe usarse en aplicaciones con usuarios finales, especialmente menores, sin supervisión humana.
- Perplexity no comparable entre tokenizers: el autor advierte explícitamente de que la perplexidad por token no es una métrica válida para comparar modelos con tokenizers diferentes; solo el bits-per-byte es fiable.
- Un solo punto de escala: los resultados se refieren a 42 M de parámetros y 3 GB de datos; no se pueden extrapolar a modelos más grandes sin verificación adicional.
- Registro dependiente del dominio: el rendimiento varía según el tipo de texto (por ejemplo, cuentos infantiles frente a textos legales) debido a la composición del corpus.
- Repositorio espejo: la versión de SlayerLab es una copia; el repositorio original y las actualizaciones están en KateMajzel/GoLLeM-45M-PL.

## Enlaces

- Repositorio en Hugging Face (espejo): https://huggingface.co/SlayerLab/GoLLeM-45M-PL
- Repositorio original en Hugging Face: https://huggingface.co/KateMajzel/GoLLeM-45M-PL
- Código, datos y metodología: https://github.com/KateMajzel/gollem-pl
- Corpus SpeakLeash: https://speakleash.org/
- Referencia independiente mencionada (Bielik v3 PL): arXiv 2604.10799 (no verificado)

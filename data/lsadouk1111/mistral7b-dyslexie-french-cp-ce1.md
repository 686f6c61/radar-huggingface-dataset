# lsadouk1111/mistral7b-dyslexie-french-cp-ce1

## Resumen

El modelo lsadouk1111/mistral7b-dyslexie-french-cp-ce1 es un ajuste fino mediante LoRA de Mistral-7B-Instruct-v0.2 (cuantizado en 4 bits) especializado en la simplificación automática de textos escolares en francés para niños disléxicos de 6 a 8 años, correspondientes a los niveles CP y CE1 del sistema educativo francés, en el contexto de las escuelas marroquíes de enseñanza en francés. Lo desarrolla Lamyaa Sadouk (usuario lsadouk1111) y está pensado para sustituir la simplificación manual que realizan logopedas y docentes de educación inclusiva por un proceso reproducible y basado en reglas.

La propuesta técnica no consiste en un modelo generalista de reescritura, sino en un decodificador guiado por un referencial fónico de 13 reglas que impone frases de 8 a 10 palabras como máximo, estructura Sujeto-Verbo-Complemento, vocabulario de tres sílabas o menos, segmentación silábica con guiones (ma-man, jar-din, é-lè-ve) y conservación íntegra de los detalles narrativos. El entrenamiento se realizó con solo 294 pares de texto sobre 3 épocas con Unsloth y TRL en una única GPU NVIDIA T4 de Google Colab Pro, con el mejor checkpoint en el paso 60.

Su relevancia radica en que demuestra que un ajuste fino ligero y de bajo coste puede superar ampliamente al modelo base sin ajustar en una tarea de accesibilidad concreta: BLEU 70,02 frente a 26,85 y SARI 84,64 frente a 53,01. El repositorio publicado (0,2 GB) contiene únicamente el adaptador LoRA, no los pesos fusionados, y el modelo tiene por el momento 0 descargas y 0 likes, por lo que debe considerarse un artefacto de investigación más que un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Mistral-7B-Instruct-v0.2) con adaptador LoRA |
| Parametros totales | 7 B heredados del modelo base; el repositorio publicado contiene solo el adaptador LoRA (0,2 GB) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 1.024 tokens en la configuración de ejemplo (`max_seq_length=1024`); la ventana nativa del modelo base no se detalla en la información disponible |
| Tipos de cuantizacion | Modelo base en 4 bits (bnb-4bit); el adaptador se distribuye en safetensors. No se documentan otras cuantizaciones |
| Idiomas soportados | Francés (fr) |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors (adaptador LoRA) |
| Modelo base | unsloth/mistral-7b-instruct-v0.2-bnb-4bit (referencia a mistralai/Mistral-7B-Instruct-v0.2) |
| Hiperparametros LoRA | r=16, alpha=32 |
| Pipeline declarado | text-generation (en la model card figuran también text2text-generation y conversational) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only de 7 B parámetros, Mistral-7B-Instruct-v0.2, cargado en precisión de 4 bits (bnb-4bit) y adaptado mediante LoRA con rango 16 y alpha 32. No se modifica la topología del modelo base: el ajuste se aplica sobre las matrices de bajo rango, lo que permite entrenar en una sola GPU T4. El entrenamiento se hizo con Unsloth y TRL, 3 épocas sobre 294 pares de texto (original simplificado), con el mejor checkpoint en el paso 60 según la pérdida de validación. La decodificación recomendada por el autor usa temperatura 0,3, top_p 0,9, repetition_penalty 1,1 y un máximo de 600 tokens nuevos.

El elemento diferencial no es arquitectónico sino de diseño de la tarea: el prompt del sistema fija un referencial fónico explícito que el modelo debe aplicar de forma obligatoria, con reglas enumeradas como frases de 10 palabras o menos (R1), vocabulario de hasta 3 sílabas (R2), estructura Sujeto-Verbo-Complemento (R3), segmentación silábica con guiones (R4), fidelidad narrativa completa (R5) y salto de línea tras cada frase (R6), dentro de un conjunto total de 13 reglas. No se documenta en la información disponible el uso de RLHF, DPO ni una fase de alineamiento adicional; el ajuste supervisado clásico es el único procedimiento descrito. El conjunto de datos asociado (lsadouk1111/dyslexia-french-cp-ce1) está publicado por separado.

## Capacidades

- Simplificación de texto en francés: reescribe textos escolares para niveles CP y CE1 aplicando un referencial de 13 reglas fónicas.
- Segmentación silábica explícita con guiones (por ejemplo, "ma-man", "jar-din", "é-lè-ve"), orientada a la decodificación lectora.
- Control de longitud y estructura de frase: frases de 8 a 10 palabras y patrón Sujeto-Verbo-Complemento.
- Sustitución de vocabulario por equivalentes de tres sílabas o menos.
- Preservación de la fidelidad narrativa: mantiene todos los detalles del texto original, incluidos nombres propios y elementos de la trama.
- Formato de salida con salto de línea tras cada frase, para facilitar la lectura en materiales impresos o digitales.
- Generación de texto conversacional e instruccional, heredada del modelo base Mistral-7B-Instruct-v0.2.
- Capacidad multilingüe: limitada al francés según la model card; no se declaran otros idiomas.
- Soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión o audio: no documentado en la información disponible.

## Casos de uso

- Adaptación de materiales escolares para aulas de educación inclusiva: un docente introduce el texto de una lección y obtiene una versión con frases cortas, vocabulario simplificado y sílabas separadas, lista para imprimir o proyectar. La ventana de 1.024 tokens cubre textos de una página de manual de CP/CE1.
- Generación de fichas de lectura para logopedas: el modelo permite preparar ejercicios de decodificación silábica de forma repetible, aplicando la misma regla R4 a todos los textos de una sesión y reduciendo el tiempo de preparación manual.
- Creación de libros de lectura graduados: editoriales o equipos de Contenidos pueden generar versiones adaptadas de cuentos y narraciones conservando la trama completa (regla R5), algo crítico para no infantilizar el contenido.
- Traducción intralingüística para alumnado con dislexia en escuelas de francés como lengua de instrucción en Marruecos: el modelo está entrenado específicamente para ese contexto curricular (CP/CE1 del sistema francés en centros marroquíes).
- Preprocesado de exámenes y enunciados: simplificar instrucciones de evaluación para garantizar que el alumno con dislexia entienda la consigna sin que la dificultad de lectura condicione el resultado.
- Investigación en procesamiento de lenguaje natural educativo: el modelo y su dataset asociado permiten reproducir el experimento (LoRA r=16 sobre 294 pares) y servir de línea base frente a otros métodos de simplificación léxica y sintáctica en francés.
- Prototipado de asistentes de lectura en aplicaciones móviles: integrado por API en una app de apoyo a la lectura, el modelo tarda aproximadamente 12,5 segundos por texto en una T4, suficiente para un flujo asíncrono de preprocesado por lotes.
- Generación de audio-libros accesibles: la salida segmentada silábicamente con guiones puede alimentar un sintetizador de voz que marque pausas silábicas para entrenamiento fonológico.

## Benchmarks y rendimiento

Evaluación sobre un conjunto de test fijo de 36 pares, según la model card del autor:

| Metrica | Este modelo | Mistral-7B zero-shot | ETR-fr/Mistral+LoRA |
|---|---|---|---|
| BLEU | 70,02 | 26,85 | no disponible |
| SARI | 84,64 | 53,01 | 42,27 |
| SARI Add | 68,18 | no disponible | no disponible |
| SARI Keep | 89,48 | no disponible | no disponible |
| SARI Delete | 96,25 | no disponible | no disponible |

Indices de legibilidad comparados con el texto original:

| Metrica | Texto original | Texto simplificado |
|---|---|---|
| Flesch Reading Ease | 92,98 | 94,85 |
| Gunning Fog | 6,67 | 5,95 |
| ARI (Automated Readability Index) | 4,61 | 3,70 |

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en inferencia: aproximadamente 4-5 GB para los pesos del modelo base en 4 bits según el tamaño indicado del repositorio y la configuración declarada; se recomienda reservar 8 GB para dar cabida al contexto de 1.024 tokens y a los tokens generados (estimación a partir del tamaño del modelo base, no medida publicada).
- VRAM estimada si se fusiona el adaptador y se sirve en fp16: en torno a 14-16 GB (estimación).
- GPU utilizadas en el desarrollo: NVIDIA T4 de 16 GB en Google Colab Pro. El autor indica que se requiere GPU NVIDIA T4 o equivalente.
- GPU compatibles con holgura: A100, H100, L40S, RTX 4090, RTX 4080, RTX 3090 (24 GB).
- GPU de consumo: cabe en RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB y RTX 4070 en configuraciones de 4 bits; en tarjetas de 8 GB el margen es ajustado y depende del backend.
- Latencia declarada: aproximadamente 12,5 segundos por texto en una T4. El throughput por lotes no se documenta.
- Opciones de despliegue: Unsloth y TRL para carga del adaptador (procedimiento del autor), transformers con PEFT, y vLLM con soporte de adaptadores LoRA. No se han publicado pesos en GGUF, por lo que llama.cpp y Ollama requerirían fusionar el adaptador y convertirlo previamente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SARI | BLEU | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| mistral7b-dyslexie-french-cp-ce1 | 7 B + LoRA r=16 | 1.024 tokens configurados | 84,64 | 70,02 | CC BY 4.0 | Adaptador LoRA en HuggingFace, 0 descargas |
| Mistral-7B-Instruct-v0.2 zero-shot | 7 B | no disponible en la informacion proporcionada | 53,01 | 26,85 | Apache 2.0 (modelo base) | Pesos completos en HuggingFace |
| ETR-fr/Mistral+LoRA | 7 B + LoRA | no disponible | 42,27 | no disponible | no disponible | no disponible en la informacion proporcionada |

Los tres sistemas comparados comparten la misma familia de modelo base, de modo que la diferencia de SARI (84,64 frente a 53,01 y 42,27) refleja el efecto del ajuste fino y del referencial de reglas, no un cambio de escala. No se dispone de comparativas con modelos especializados en simplificación de francés de otras familias (por ejemplo, enfoques basados en mT5) en la información proporcionada.

## Limitaciones y advertencias

- Precisión de segmentación silábica de aproximadamente el 73 % en textos no vistos, según el propio autor; alrededor de una de cada cuatro palabras puede segmentarse de forma incorrecta.
- Los errores se concentran en palabras monosílabas con consonantes mudas y en nombres propios poco frecuentes, un riesgo relevante porque el vocabulario de textos infantiles incluye muchos monosílabos.
- El entrenamiento se realizó con solo 294 pares de texto y 3 épocas, lo que limita la generalización a dominios, registros y longitudes distintos de los del conjunto de entrenamiento.
- El modelo está especializado exclusivamente en francés y en el contexto curricular CP/CE1 (6-8 años); su uso con otros idiomas, niveles educativos o textos técnicos no está validado.
- Requiere GPU para la inferencia y tarda alrededor de 12,5 segundos por texto en una T4, lo que descarta el uso interactivo en tiempo real sin optimización adicional.
- La licencia es CC BY 4.0, que permite uso comercial con atribución, pero el modelo base Mistral-7B-Instruct-v0.2 se distribuye bajo Apache 2.0: conviene revisar el cumplimiento de ambas licencias al redistribuir pesos fusionados.
- Riesgo de alucinación inherente al modelo base: existe la posibilidad de que se alteren o inventen detalles narrativos pese a la regla R5 de fidelidad, por lo que se recomienda revisión humana antes de publicar material educativo.
- El repositorio registra 0 descargas y 0 likes, y las fechas de creación y actualización son de septiembre de 2026, posteriores a las de la mayoría de los modelos de referencia: la madurez y el soporte de la comunidad no están contrastados.
- Los resultados se han medido sobre un conjunto de test fijo de 36 pares, un tamaño reducido que limita la significación estadística de las métricas BLEU y SARI reportadas.
- No se ofrecen métricas de sesgo, toxicidad ni evaluación de seguridad, y no se documentan salvaguardas adicionales más allá de las del modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lsadouk1111/mistral7b-dyslexie-french-cp-ce1
- Dataset asociado: https://huggingface.co/datasets/lsadouk1111/dyslexia-french-cp-ce1
- Código y reproducibilidad: https://github.com/lsadouk1111/dyslexia-french-simplification
- Modelo base (referencia de la model card): https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.2
- Modelo base utilizado para el ajuste (4 bits): https://huggingface.co/unsloth/mistral-7b-instruct-v0.2-bnb-4bit
- Cita académica: Sadouk, Lamyaa (2026), "Automatic Generation of Dyslexia-Friendly French Educational Texts Using Fine-Tuned LLMs: A Phonics-Aware Approach for Moroccan Primary School Children"
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo, al dataset ni al artículo; las busquedas devolvieron exclusivamente paginas sin relacion con el proyecto.

# DavidAU/Psyonic-Cetacean-Ultra-Quality-21.3B-22.5B-BRAINSTORM-5x-10x-GGUF

## Resumen

Psyonic-Cetacean-Ultra-Quality-21.3B-22.5B-BRAINSTORM-5x-10x es un modelo de generación de texto en inglés, publicado por DavidAU (David Belton), especializado en escritura creativa, narrativa de ficción, roleplaying y generación de escenas. Parte del modelo base Psyonic-Cetacean-Ultra-Quality-20B y le aplica el método propietario "Brainstorm", que descompone, reensambla y expande por 5x y 10x los "centros de razonamiento" del modelo, calibrando cada uno de ellos de forma individual para modificar la forma en que el modelo razona y escribe. El resultado son dos variantes (5x y 10x) con 21.300 y 22.500 millones de parámetros respectivamente, frente a los 20B del original.

El objetivo declarado no es aumentar la "inteligencia" del modelo, sino mejorar la calidad de la prosa: mayor detalle, coherencia, conexión entre descripción y contenido, metáforas mejor integradas, mayor engagement emocional y menor tendencia a los clichés, manteniendo el seguimiento de instrucciones. El autor indica explícitamente que el proceso no se calibró ni se probó para mejorar el "IQ" del modelo, sino su comportamiento creativo.

El repositorio contiene únicamente cuantizaciones GGUF (tanto 5x como 10x), con un tamaño total de 115,5 GB, y está pensado para su uso con llama.cpp y derivados (Ollama, LM Studio, etc.). La licencia es Apache 2.0 y el único idioma declarado es el inglés. El modelo se apoya conceptualmente en el paper "Progressive LLaMA with Block Expansion" (arXiv:2401.02415), aunque el autor señala que su enfoque diverge completamente del descrito en dicho trabajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Psyonic-Cetacean-Ultra-Quality-20B, con expansión de "centros de razonamiento" 5x/10x) |
| Parametros totales | 22.849.203.200 (variante 22.5B); 21.3B en la variante 5x |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (múltiples niveles de cuantización, en variantes 5x y 10x) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (float32 como tag; cuantizaciones GGUF en el repo) |

## Arquitectura y entrenamiento

El modelo se basa en un transformer derivado de Psyonic-Cetacean-Ultra-Quality-20B. Sobre esa base, el autor aplica el proceso "Brainstorm" directamente a nivel de ficheros fuente: el centro de razonamiento del LLM se descompone, se reensambla y se expande 5x o 10x, generando múltiples "centros" que se calibran individualmente y que interactúan entre sí. Cada centro adicional actúa como un punto de ajuste que modifica sutilmente el proceso de razonamiento del modelo. El autor cita como inspiración conceptual el paper "Progressive LLaMA with Block Expansion" (arXiv:2401.02415), aunque indica que su dirección es completamente distinta.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en la información proporcionada. El autor menciona que el proceso se ha probado en modelos Llama2, Llama3 y Mistral de varios tamaños, así como en modelos "root" (Llama3 Instruct, Mistral Instruct) y en modelos fusionados o afinados. También señala que tecnologías complementarias suyas ("Ultra" para precisión, "Neo Imatrix" para datasets de imatrix personalizados y "X-quants" para aplicación custom del proceso imatrix) pueden potenciar adicionalmente el rendimiento del modelo. El proceso es aplicable a nivel de fuente, por lo que el modelo puede cuantizarse a GGUF, EXL2, AWQ y otros formatos.

## Capacidades

- Generación de texto creativo en inglés: ficción, relato corto, novela, horror, ciencia ficción.
- Escritura de prosa detallada y de longitud potencialmente larga o extrema (el autor advierte que puede requerir límite duro de longitud).
- Roleplaying y generación de escenas y continuación de escenas.
- "Brainstorming" creativo: generación de ideas, conceptos y conexiones conceptuales.
- Mejora declarada de coherencia, matices, símiles y metáforas integradas en la narrativa.
- Mayor engagement emocional y sensación de "estar presente" en la escena.
- Seguimiento de instrucciones más estricto que el modelo base, con menos "libertades" y menos conjeturas.
- Respuesta más fuerte cuanto más detalladas e instructivas sean las directivas proporcionadas.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, matemáticas, código ni visión.
- Capacidad multilingüe: no disponible (solo inglés declarado).

## Casos de uso

- Escritura de ficción larga: el modelo está diseñado para generar prosa de longitud extensa con detalle y coherencia, adecuado para redactar capítulos de novela o relatos de género (horror, ciencia ficción) donde se requiere continuidad descriptiva y conexión entre escena y personaje.
- Roleplaying narrativo: su entrenamiento orientado a RP y generación de escenas permite mantener diálogos y descripciones en primera o tercera persona con mayor matiz emocional y menor dependencia de clichés, útil en plataformas de rol por texto.
- Continuación de escenas: la capacidad "scene continue" permite tomar un fragmento existente y extenderlo respetando tono, voz y detalles previos, gracias al mayor seguimiento de directivas y a la menor tendencia a "adivinar".
- Brainstorming creativo: la expansión de centros de razonamiento busca generar conexiones conceptuales más ricas, útil para lluvia de ideas argumentales, tramas alternativas o desarrollo de worldbuilding.
- Generación de descripciones atmosféricas: el énfasis en detalles vívidos y en la conexión entre descripción y contenido lo hace adecuado para pasajes descriptivos densos en narrativa de terror o ciencia ficción.
- Asistencia a guionistas y escritores: como generador de borradores y variantes de escena con control fino mediante instrucciones detalladas, integrable en flujos de trabajo locales con llama.cpp u Ollama.
- Prototipado de narrativa interactiva: para experimentar con motores de ficción interactiva en local, dado que los GGUF pueden ejecutarse en hardware de consumo (aunque el tamaño de 21-22B limita las opciones).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no presenta métricas cuantitativas (MMLU, HumanEval, GSM8K ni similares) y señala explícitamente que el cambio de "IQ" no fue un objetivo ni se calibró ni se probó. Las mejoras descritas son cualitativas y basadas en observaciones de laboratorio del propio autor (prosa, coherencia, matices, engagement emocional).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma exacta; para un modelo de ~21-22B en GGUF, las necesidades dependen del nivel de cuantización. Como referencia orientativa del rango (no confirmada por el autor para este modelo concreto): Q4_K_M ~13-14 GB, Q5_K_M ~15-16 GB, Q8_0 ~23-24 GB, FP16 ~42-45 GB.
- GPU recomendadas: no especificadas por el autor. Por tamaño, un modelo de 21-22B cuantizado a 4-5 bits puede caber en GPUs de consumo con 16-24 GB (RTX 4090, RTX 4080, etc.); para cuantizaciones altas o FP16 se requiere A100/H100 o múltiples GPU.
- ¿Cabe en GPU de consumo? Sí, en cuantizaciones bajas/medias (4-5 bits) en GPUs de 16-24 GB; las cuantizaciones altas y el float32 no.
- Opciones de despliegue: llama.cpp y derivados (Ollama, LM Studio, koboldcpp); el repo es GGUF, por lo que vLLM/TGI requerirían conversión a otros formatos (no documentado).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| Psyonic-Cetacean-Ultra-Quality-21.3B-22.5B-BRAINSTORM-5x-10x | 21.3B / 22.5B | No disponible | Escritura creativa / RP (Brainstorm 5x-10x) | Apache 2.0 | GGUF |
| Psyonic-Cetacean-Ultra-Quality-20B (base) | 20B | No disponible | Escritura creativa / RP | No disponible en la información | GGUF (repo del autor) |
| Mistral Instruct (referencia citada por el autor) | No disponible | No disponible | Instrucciones generales | No disponible en la información | No disponible |
| Llama3 Instruct (referencia citada por el autor) | No disponible | No disponible | Instrucciones generales | No disponible en la información | No disponible |

El autor cita Mistral Instruct y Llama3 Instruct como modelos sobre los que ha probado el proceso Brainstorm, pero no proporciona comparativas de rendimiento ni especificaciones detalladas de esas variantes en la información disponible.

## Limitaciones y advertencias

- Modelo exclusivamente en inglés: no se declara soporte de otros idiomas.
- Riesgo de alucinación: no evaluado ni documentado por el autor; el proceso no se calibró para reducirla.
- El autor advierte que el proceso no hace al modelo "5x o 10x más inteligente" y que el cambio de "IQ" no se probó ni calibró.
- Sensibilidad alta a los parámetros de muestreo: el autor recomienda ajustar temperatura y repetition penalty en incrementos de 0,01 o menos, partiendo de temp 0,2 y rep pen 1,1.
- Puede generar prosa de longitud extrema; se recomienda fijar un límite duro de longitud.
- El autor señala que, raramente, puede aparecer una palabra mal escrita o una letra fuera de lugar.
- El modelo "adivina" menos y sigue más estrictamente las directivas, lo que puede reducir la creatividad espontánea si las instrucciones son escasas.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base Psyonic-Cetacean-Ultra-Quality-20B, cuya licencia no se detalla en la información disponible.
- El repositorio contiene solo GGUF; no se ofrecen pesos en safetensors ni otros formatos en este repo.
- Sin datos de benchmarks ni de contexto máximo: no apto para planificación de producción que requiera garantías cuantitativas sin evaluación previa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/DavidAU/Psyonic-Cetacean-Ultra-Quality-21.3B-22.5B-BRAINSTORM-5x-10x-GGUF
- Modelo base (GGUF): https://huggingface.co/DavidAU/Psyonic-Cetacean-Ultra-Quality-20b-GGUF
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
- FAQs y soporte: https://huggingface.co/DavidAU/support
- Paper citado (Progressive LLaMA with Block Expansion): https://arxiv.org/pdf/2401.02415

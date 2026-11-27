# cmod/Qwen3.8-27B-ASCII-Condensed-Heretic-Q3_K_XL-GGUF

## Resumen

Qwen3.8-27B-ASCII-Condensed-Heretic-Q3_K_XL-GGUF es una cuantización GGUF de un modelo de lenguaje de 27.000 millones de parámetros derivado de la familia Qwen3.8, publicada por el usuario cmod. El modelo base es `0bserverx/Qwen3.8-27B-Heretic-Abliterated-Uncensored`, una variante "abliterated" (con los mecanismos de rechazo suprimidos mediante la técnica de abliteration) del Qwen3.8 original. Esta versión concreta añade tres modificaciones técnicas: pesos cuantizados `UD-Q3_K_XL` (Dynamic 3.1) de Unsloth con las 60 matrices alteradas por la abliteration reinsertadas, un vocabulario reducido a ASCII que baja de 248.320 a 128.190 tokens, y decodificación especulativa por n-gramas.

El objetivo declarado es ejecutar un modelo de 27B con ventana de contexto de 131.072 tokens íntegramente en una GPU de 16 GB de VRAM, incluyendo pesos y caché KV. Según las mediciones del autor en una RTX 5080 de 16 GB, el modelo alcanza 111 tok/s generando código a 115K de profundidad de contexto y 59 tok/s en prosa, con cero rechazos explícitos sobre 100 prompts de un conjunto de evaluación de rechazos.

Es relevante ahora porque demuestra que técnicas de compresión de vocabulario y cuantización dinámica permiten llevar contextos largos a hardware de consumo, aunque a costa de restricciones severas: solo inglés y código, licencia Apache 2.0 sobre un modelo derivado, y una fidelidad respecto al modelo de referencia ligeramente inferior a la de las cuantizaciones estándar de Unsloth.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.8), con cabeza MTP (multi-token prediction) en `blk.64.*` |
| Parámetros totales | 26.090.566.656 (26,09B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 131.072 tokens (112.640 en perfil por defecto con margen para escritorio; 90.112 en perfil "fast"; 73.728 en perfil "quality") |
| Tipos de cuantización | Q3_K_XL (Dynamic 3.1) para pesos; caché KV en q4_0 o q8_0; variante IQ4_NL-MTP para 24 GB |
| Idiomas soportados | inglés y código únicamente (el vocabulario ASCII no preserva otros idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen3.8 con 26,09B parámetros. La ficha no documenta el proceso de preentrenamiento original (número de tokens, composición del dataset, uso de RLHF o DPO); esa información correspondería al modelo Qwen3.8 base publicado por su desarrollador original y no se incluye en la model card de esta cuantización.

La innovación de esta publicación es la cadena de transformaciones aplicadas sobre el modelo base. Primero, la abliteration del modelo `0bserverx/Qwen3.8-27B-Heretic-Abliterated-Uncensored`, que modifica 60 matrices de pesos para suprimir el comportamiento de rechazo. Segundo, la cuantización `UD-Q3_K_XL` (Dynamic 3.1) de Unsloth, sobre la que se reinsertan esas 60 matrices alteradas mientras el resto de tensores se mantiene byte a byte igual al original de Unsloth. Tercero, una poda del vocabulario a caracteres ASCII que reduce el embedding de 248.320 a 128.190 tokens, liberando espacio suficiente para los últimos 11K de ventana de contexto; según el autor, el inglés y el código tokenizan exactamente igual que antes y las distribuciones de siguiente token ASCII quedan inalteradas (top-20 idéntico en 37/37 comprobaciones, diferencias de log-probabilidad por debajo de 8e-7). Cuarto, decodificación especulativa por n-gramas (`--spec-type ngram-mod`), sin coste adicional de VRAM, que según las mediciones triplica la velocidad en código a gran profundidad de contexto. Existe además un perfil "fast" que usa la cabeza MTP del propio modelo como drafter, con un coste aproximado de 950 MiB de ventana.

## Capacidades

- Generación de texto conversacional y asistencia general (código, agentes, documentos largos).
- Generación y razonamiento sobre código, con velocidades medidas de 111 tok/s a 114K de profundidad y 465 tok/s con prompt corto usando drafting por n-gramas.
- Modo "thinking" activado por defecto; se desactiva por petición con `"chat_template_kwargs": {"enable_thinking": false}`.
- Recuperación de información en contextos muy largos: 80/80 hechos recordados a 115K de profundidad según el autor.
- Decodificación especulativa integrada mediante n-gramas y, opcionalmente, mediante la cabeza MTP del modelo.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags) y con llama.cpp.
- Capacidades multilingües: limitadas a inglés y código; el vocabulario ASCII no soporta otros idiomas.
- Tool calling / function calling: no documentado en la información disponible.
- Visión y audio: no soportados.

## Casos de uso

- Asistencia de código en local sobre GPU de consumo: con 111 tok/s a 114K de profundidad y 465 tok/s en prompts cortos en una RTX 5080, es viable como autocompletado y generación de parches en un IDE sin depender de la nube.
- Análisis de repositorios completos: la ventana de 131K tokens permite cargar varios ficheros de código y documentación en una sola pasada para tareas de revisión, refactorización o explicación de arquitectura.
- Procesamiento de documentos largos en inglés: contratos, informes técnicos o papers de hasta ~100K tokens caben en el contexto con la caché KV en q4_0, manteniendo pesos y caché en una única tarjeta de 16 GB.
- Despliegue en estaciones de trabajo con GPUs de 16 GB (RTX 4080/5080, 4060 Ti 16 GB, A4000): permite servir un asistente de 27B sin infraestructura de centro de datos, con el binario `llama-server` y una única línea de comandos.
- Investigación sobre alineación y abliteration: la variante incluye el adaptador LoRA de abliteration (`Qwen3.8-27B-Heretic-ablation-LoRA-F16.gguf`) que permite activar y desactivar la supresión de rechazos sobre el fichero de Unsloth, útil para estudiar el efecto de estas intervenciones.
- Evaluación de fidelidad de cuantizaciones: los registros en `recipe/` documentan KLD, perplejidad y tasas de rechazo comparadas con las cuantizaciones estándar de Unsloth, lo que sirve como referencia metodológica para medir el impacto de cuantizar modelos abliterated.
- Servicio de inferencia en tarjetas Pascal sin tensor cores (Tesla P40): la variante IQ4_NL-MTP de 14,55 GiB ofrece 128K de contexto con mayor fidelidad que la Q3_K_XL.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card:

| Métrica | Este fichero | Unsloth 3.1 (stock) | Abliterated Q8_0 | Adaptador sobre Unsloth 3.1 |
|---|---|---|---|---|
| KLD media vs Q8_0 de referencia | 0,0898 ± 0,0015 | 0,0835 ± 0,0014 | — | 0,0873 ± 0,0015 |
| Percentil 99 de KLD | 1,594 | 1,521 | — | 1,540 |
| Mismo token top-1 | 91,62% | 91,75% | — | 91,62% |
| Perplejidad | 3,848 | 3,801 | — | 3,846 |
| Rechazos explícitos, set mlabonne (por 100) | 53 / 0 / 44 | 100 / 100 / 99 | 55 / 0 / 46 | 52 / 1 / 44 |
| Rechazos explícitos, set JBB (por 100) | 46 / 1 / 41 | 96 / 94 / 96 | 46 / 1 / 46 | 44 / 2 / 44 |
| Rechazos explícitos, set JBB benigno (por 100) | 7 / 0 / 9 | 38 / 30 / 38 | 7 / 1 / 11 | 4 / 0 / 7 |

Velocidad medida en RTX 5080 16 GB:

| Perfil | Ventana | tok/s en código (profundo) | tok/s en prosa |
|---|---|---|---|
| long (por defecto) | 131.072 | 111 a 115K | 59 |
| fast | 90.112 | 150 a 79K | 113 |
| quality | 73.728 | 137 a 65K | 59 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el fichero Q3_K_XL ocupa 11,60 GiB; cada 16K de ventana de contexto cuesta 288 MiB de caché KV. Con `-c 112640` y caché q4_0 cabe en 16 GB dejando margen para el escritorio; el contexto completo de 131.072 requiere una tarjeta sin otro uso.
- GPUs recomendadas: RTX 5080 16 GB y RTX 4080 16 GB para el perfil long; RTX 4060 Ti 16 GB y A4000 para uso con margen reducido; Tesla P40 (24 GB, sin tensor cores) para la variante IQ4_NL-MTP de 14,55 GiB.
- Cabe en GPU de consumo: sí, en tarjetas de 16 GB con la configuración indicada. La variante IQ4_NL-MTP requiere 24 GB.
- Opciones de despliegue: llama.cpp (`llama-server`), con soporte de decodificación especulativa por n-gramas (`--spec-type ngram-mod`) y por MTP (`--spec-type draft-mtp`). No se documentan otros motores (vLLM, TGI, Ollama).
- Latencia y throughput: 111 tok/s en código a 114K de profundidad, 465 tok/s en código con prompt corto, 59 tok/s en prosa (perfil long); hasta 150 tok/s en código y 113 tok/s en prosa con el perfil fast.
- Nota de despliegue: llama.cpp estándar asigna los pesos como un bloque único de 11 GiB, lo que puede fallar con `cudaMalloc failed: out of memory` en tarjetas que también manejan el escritorio; el autor proporciona dos parches en `recipe/tools/`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este fichero (Q3_K_XL ASCII) | 26,09B | 131.072 | GGUF | Apache 2.0 | Abliterated; solo inglés y código; 11,60 GiB |
| Unsloth UD-Q3_K_XL 3.1 (stock) | 26,09B | no disponible | GGUF | Apache 2.0 | Sin abliteration; rechazos 100/100/99 en set mlabonne; KLD 0,0835 |
| Variante IQ4_NL-MTP del mismo autor | 26,09B | 128K | GGUF | Apache 2.0 | 14,55 GiB; para 24 GB; mayor fidelidad |
| Modelo base abliterated Q8_0 | 26,09B | no disponible | safetensors/GGUF | Apache 2.0 | Referencia de fidelidad; KLD 0,0169 frente al base; rechazos 55/0/46 |

## Limitaciones y advertencias

- La abliteration suprime los rechazos de forma deliberada: el modelo responde a prompts que el modelo original rechazaría (0 rechazos explícitos de 100 en el set mlabonne según el scorer de declaraciones de rechazo). Esto traslada al operador la responsabilidad de filtrado y moderación en producción.
- Solo inglés y código: el vocabulario ASCII reducido elimina la tokenización de otros idiomas, por lo que el rendimiento multilingüe no está soportado.
- Fidelidad inferior a la cuantización estándar: KLD media de 0,0898 frente a 0,0835 de Unsloth 3.1, un 7% peor respecto a su referencia, atribuido al redondeo estándar de llama.cpp en los 60 tensores reinsertados.
- Riesgo de alucinación: no se han publicado evaluaciones de veracidad; el modelo base es un Qwen3.8 sin datos de benchmarks en esta ficha.
- El contexto efectivo depende de la configuración: el perfil por defecto usa 112.640 tokens, no los 131.072 completos, para dejar margen al escritorio.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo deriva de Qwen3.8 y de un modelo abliterated de terceros; conviene verificar las condiciones de la cadena de modelos base antes de desplegar comercialmente.
- Requiere parches de llama.cpp en algunos entornos: la asignación de pesos como bloque único de 11 GiB puede fallar en GPUs que también gestionan el escritorio.
- Los datos de rendimiento proceden de una única RTX 5080 16 GB y de registros del propio autor; no hay validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cmod/Qwen3.8-27B-ASCII-Condensed-Heretic-Q3_K_XL-GGUF
- Modelo base: https://huggingface.co/0bserverx/Qwen3.8-27B-Heretic-Abliterated-Uncensored
- Registros de construcción y medición: carpeta `recipe/` del repositorio (incluye `recipe/tools/` con los parches de llama.cpp)
- Sumas de verificación: fichero `SHA256SUMS` del repositorio
- Mapa de tokens del vocabulario podado: `kept-token-ids.json` en el repositorio

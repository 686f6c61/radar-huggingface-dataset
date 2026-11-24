# aikexue170/rewrite3-27b-iq4xs

## Resumen

rewrite3-27b-iq4xs es una cuantización GGUF IQ4_XS del modelo rewrite3-27B, un fine-tune especializado en reescritura de novelas web chinas desarrollado por el usuario aikexue170 sobre la base Qwen/Qwen3.8-27B. Su propósito no es la generación generalista, sino tomar texto degradado por generación automática (lo que el autor denomina "AIGC劣化稿", borradores con estilo artificial) y reescribirlo en prosa fluida, con voz de autor propia y sin copiar literalmente el original. El modelo incorpora un razonamiento de reescritura específico y un discriminador externo (jevnovel3 0.8B) que puntúa la probabilidad de que una frase suene a "estilo IA" (métrica JEV), usada tanto en la construcción del dataset como en la evaluación.

El modelo cuenta con 27.320.697.856 parámetros (unos 27,3 mil millones) y se distribuye en este repositorio como GGUF cuantizado IQ4_XS de 14,4 GB (13,4 GiB), con la cabeza MTP (multi-token prediction) embebida en los pesos (`blk.64.nextn.*`) para decodificación especulativa. Está pensado para despliegue local en GPUs de consumo: con 16 GB de VRAM permite 8k de contexto añadiendo `--parallel 1`, y con 24 GB o más permite 16k. La licencia declarada es Apache 2.0 y el único idioma soportado es el chino (zh).

Su relevancia actual radica en dos puntos concretos: por un lado, ataca un problema muy específico del ecosistema de novela web china (la "limpieza" de borradores generados por IA manteniendo estilo humano y evitando el plagio literal, con una restricción dura de no copiar más de 15 caracteres consecutivos); por otro, publica una evaluación comparativa entre formatos de cuantización (FP8, IQ4_XS, NVFP4) sobre la misma batería de seis prompts, algo poco habitual en modelos de nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.8-27B), con cabeza MTP embebida para decodificación especulativa |
| Parametros totales | 27.320.697.856 (27,3 B) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | Hasta 16.384 tokens (configuración recomendada con 24 GB+); 8.192 tokens con 16 GB de VRAM y `--parallel 1` |
| Tipos de cuantizacion | IQ4_XS (este repositorio); la familia incluye BF16, Q8_0, FP8 W8A8, NVFP4 W4A4, Q4_K_M, Q3_K_M e IQ3_XS |
| Idiomas soportados | Chino (zh) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (este repositorio); también safetensors en las variantes BF16/FP8/NVFP4 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen/Qwen3.8-27B, un transformer de 27,3 mil millones de parámetros. Sobre esa base, el autor aplicó un fine-tune orientado a reescritura de novela web con un esquema de datos en tres fases. La primera generación de datos (rewrite2) consistía en 20.000 pares de entrada degradada por AIGC y salida de prosa humana original; el autor documenta tres fallos de ese enfoque: el modelo tendía a acortar el texto (porque el mapeo degradado→original era mayoritariamente de eliminación), la ausencia de cadena de pensamiento reducía la atención y la generalización, y el modelo no distinguía realmente el "estilo IA" del estilo humano, causando falsos positivos sobre frases buenas.

El dataset de rewrite3 corrige esto con un pipeline de anotación: se usa jevnovel3 0.8B como clasificador de "probabilidad de frase mala" (JEV, tomando el final de la curva de percepción como p_bad de la frase completa), se amplía el texto humano original con Claude Opus 5.5 para añadir detalle descriptivo sin introducir información no inferible del fragmento, se puntúa de nuevo con jevnovel3 y se aplican modificaciones puntuales con Spark X 2.6 (iFlytek), cerrando con una pasada de Kimi K3. El modelo final incorpora un razonamiento de reescritura especializado ("改写思维链") para mejorar la generalización y una cabeza MTP afinada para aumentar los tokens por segundo mediante decodificación especulativa (`--spec-type draft-mtp --spec-draft-n-max 3` en llama.cpp).

## Capacidades

- Reescritura de prosa china: transforma borradores degradados por generación automática en texto fluido con voz de autor, evitando la copia literal (restricción de no superar 15 caracteres consecutivos idénticos al original).
- Razonamiento de reescritura explícito (cadena de pensamiento específica del dominio) que mejora la coherencia lógica y la generalización frente al modelo sin CoT.
- Detección implícita de "estilo IA" (八股): el modelo ha sido entrenado con señales de un discriminador externo para eliminar fórmulas vacías y relleno.
- Control de longitud mediante instrucciones en el prompt (el autor advierte de que sin fijar la longitud puede "alargar" el texto para compensar).
- Decodificación especulativa vía cabeza MTP integrada, compatible con llama.cpp nightly b12374 o superior.
- Generación de texto conversacional (pipeline `text-generation`, tag `conversational`).
- No se declaran capacidades de tool calling, agentes multi-paso, visión, audio ni multilingüismo; el modelo está limitado al chino.

## Casos de uso

- Limpieza de borradores de novela web: un pipeline editorial recibe capítulos generados por IA y el modelo los reescribe en prosa con estilo propio, manteniendo la trama pero eliminando fórmulas repetitivas; el contexto de 8k-16k permite procesar capítulos completos de una pasada.
- Reescritura con control de plagio: en entornos donde el texto de salida no debe coincidir literalmente con la fuente, la restricción entrenada de no copiar más de 15 caracteres consecutivos lo hace adecuado para tareas de paráfrasis profunda.
- Humanización de contenido generado: agencias de contenido chino pueden pasar textos producidos por modelos generalistas por rewrite3 para reducir la puntuación JEV (probabilidad de estilo IA) antes de publicación.
- Edición asistida con preservación de estilo: dado un fragmento de referencia del autor, el modelo reescribe secciones manteniendo el registro y añadiendo detalle descriptivo sin inventar información no inferible.
- Evaluación comparativa de cuantizaciones: investigadores pueden reproducir la batería de seis prompts del autor y medir JEV, grado de desvinculación del original (脱稿度) y longitud de copia para estudiar el impacto de la cuantización en tareas creativas.
- Despliegue local en estación de trabajo: con una GPU de 16 GB y 8k de contexto, un escritor individual puede ejecutar el modelo en local con llama.cpp sin depender de servicios en la nube.
- Filtrado de corpus: la señal JEV aprendida permite usar el modelo como reescritor en pipelines de curación de datos de entrenamiento para otros modelos de escritura creativa.

## Benchmarks y rendimiento

El autor publica una comparativa de seis prompts sobre la misma máquina, con KV cache en bf16, midiendo JEV medio (menor es mejor), grado de desvinculación del original (脱稿度, mayor es mejor), longitud de copia literal y tiempo medio:

| Formato | JEV medio ↓ | Desvinculación ↑ | Copia máxima (caracteres) ↓ | Copia total ↓ | Longitud media | Muestras sobredimensionadas | Tiempo medio |
|:--|--:|--:|--:|--:|--:|--:|--:|
| FP8 (W8A8) | 0,0966 | 0,844 | 31,2 | 54,2 | 1036 | 3/6 | 71 s |
| IQ4_XS (GGUF) | 0,0982 | 0,767 | 25,2 | 86,0 | 1007 | 0/6 | 41 s |
| NVFP4 (W4A4) | 0,1016 | 0,804 | 25,5 | 70,2 | 944 | 0/6 | 43 s |

Los datos corresponden a la receta de cuantización v1; el autor indica que la v2 (actual) obtiene JEV ligeramente mejor o equivalente en pruebas ciegas con peticiones reales. BF16 se usa como referencia de calidad pero no se evaluó en esta batería; Q3_K_M, Q4_K_M e IQ3_XS no se han probado. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 14,4 GB de pesos (13,4 GiB) en IQ4_XS; con 8k de contexto y `--parallel 1` el consumo total ronda 14,7 GiB.
- GPU recomendadas: 24 GB o más (RTX 3090/4090, A100, H100) para 16k de contexto con MTP; 16 GB (RTX 4060 Ti 16GB, RTX 4080, A4000) para 8k de contexto.
- Cabe en GPU de consumo: sí, con IQ4_XS en tarjetas de 16 GB; Q4_K_M (17,0 GB) no cabe en 16 GB según el autor, que recomienda IQ4_XS en su lugar.
- Opciones de despliegue: llama.cpp nightly b12374 o superior con `llama-server` (soporte MTP); vLLM para las variantes BF16, FP8 y NVFP4 (NVFP4 requiere Blackwell).
- Nota de configuración: llama.cpp asigna por defecto 4 ranuras paralelas y el estado GDN del MTP consume unos 1,8 GB extra; usar `--parallel 1` en 16 GB.
- Rendimiento: 41 s de media por petición en la batería de seis prompts (incluyendo razonamiento y texto final) frente a 71 s en FP8, es decir, aproximadamente 1,7 veces más rápido que FP8 en la misma máquina.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| rewrite3-27b-iq4xs (este) | 27,3 B | 8k-16k | GGUF IQ4_XS | Apache 2.0 | Especializado en reescritura de novela web china; JEV 0,0982 |
| rewrite3-27b-fp8 | 27,3 B | 8k-16k | FP8 W8A8 (35,9 GB) | Apache 2.0 | Mejor calidad de la familia (JEV 0,0966), 71 s por petición |
| rewrite3-27b-nvfp4 | 27,3 B | 8k-16k | NVFP4 W4A4 (19,7 GB) | Apache 2.0 | Requiere Blackwell; JEV 0,1016 |
| Qwen/Qwen3.8-27B (base) | 27,3 B | no disponible | safetensors | no disponible | Modelo generalista del que deriva; sin fine-tune de reescritura |

No se dispone de datos de benchmarks frente a modelos de reescritura de otros autores en la información proporcionada.

## Limitaciones y advertencias

- Idioma único: solo chino; no se ha entrenado ni evaluado para castellano u otras lenguas.
- Dominio estrecho: optimizado para reescritura de novela web; su rendimiento en otros géneros o tareas generales no está documentado.
- Riesgo de alargamiento: el modelo puede "añadir material" para compensar longitud; el autor recomienda fijar la longitud explícitamente en el prompt.
- Riesgo de alucinación: el pipeline de datos usó modelos generativos (Claude Opus 5.5, Spark X 2.6, Kimi K3) para ampliar y corregir; puede introducir detalles no presentes en el original pese a la instrucción de evitar información no inferible.
- Dependencia de la métrica JEV: la evaluación se basa en un discriminador propio (jevnovel3 0.8B) y no en benchmarks estándar, por lo que las cifras no son comparables con MMLU o HumanEval.
- Copia literal: aunque la restricción es de 15 caracteres, la evaluación registra copias máximas de 25,2 caracteres en IQ4_XS, por lo que la garantía no es absoluta.
- Requisito de versión: el soporte MTP exige llama.cpp nightly b12374 o superior; versiones anteriores no cargarán correctamente la cabeza `blk.64.nextn.*`.
- Licencia Apache 2.0 declarada, pero el modelo base Qwen/Qwen3.8-27B puede tener condiciones adicionales que conviene verificar antes de uso comercial.
- Sin datos de sesgo: no se documentan evaluaciones de sesgo ni de seguridad.

## Enlaces

- Hugging Face: https://huggingface.co/aikexue170/rewrite3-27b-iq4xs
- ModelScope: https://modelscope.cn/models/alkaid55555/rewrite3-27b-iq4xs
- Variante BF16: https://huggingface.co/aikexue170/rewrite3-27b-bf16
- Variante Q8_0: https://huggingface.co/aikexue170/rewrite3-27b-q8_0
- Variante FP8: https://huggingface.co/aikexue170/rewrite3-27b-fp8
- Variante NVFP4: https://huggingface.co/aikexue170/rewrite3-27b-nvfp4
- Variante Q4_K_M: https://huggingface.co/aikexue170/rewrite3-27b-q4km
- Variante Q3_K_M: https://huggingface.co/aikexue170/rewrite3-27b-q3km
- Variante IQ3_XS: https://huggingface.co/aikexue170/rewrite3-27b-iq3xs
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B

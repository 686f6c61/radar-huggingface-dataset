# aikexue170/rewrite3-27b-iq3xs

## Resumen

rewrite3-27b-iq3xs es una cuantización GGUF de tipo IQ3_XS del modelo rewrite3-27B, un ajuste fino sobre Qwen/Qwen3.8-27B orientado específicamente a la reescritura de novelas web en chino. El modelo está desarrollado por el usuario aikexue170 y su objetivo es transformar textos degradados generados por IA (con estilo "AIGC", fórmulas repetitivas y relleno) en prosa fluida, con voz de autor y sin copiar literalmente el original. Es relevante porque aborda un problema muy concreto del sector editorial chino de web-novel: la limpieza y humanización de borradores producidos automáticamente.

La arquitectura subyacente es la de Qwen3.8-27B (transformer denso, 27.320.697.856 parámetros), sobre la que se ha aplicado un proceso de ajuste con cadenas de pensamiento específicas para reescritura y un componente MTP (multi-token prediction) para decodificación especulativa. Esta variante concreta pesa 12,3 GB y está pensada para entornos con VRAM muy limitada, sacrificando algo de calidad frente a FP8 o IQ4_XS a cambio de un tamaño notablemente menor.

El modelo solo declara soporte para chino (zh) y su licencia es Apache 2.0. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible; la evaluación del autor se centra en métricas propias de calidad de reescritura (puntuación JEV, grado de desvinculación del original y longitud de copia literal).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen/Qwen3.8-27B) con cabeza MTP para decodificación especulativa |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el ejemplo de despliegue usa `-c 16384`) |
| Tipos de cuantizacion | IQ3_XS (GGUF); el proyecto publica además BF16, Q8_0, FP8 W8A8, NVFP4 W4A4, IQ4_XS, Q4_K_M y Q3_K_M |
| Idiomas soportados | zh (chino) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 12,3 GB; MTP embebido en `blk.32.nextn.*`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un transformer denso de 27.320 millones de parámetros, y se ajusta con un dataset construido específicamente para reescritura de web-novel china. El pipeline de datos descrito por el autor es notablemente elaborado: se toma como punto de partida un corpus de 20.000 pares "texto degradado por IA → original humano" de la generación anterior (rewrite2), y se corrige mediante un proceso de tres fases. Primero, un clasificador externo de 0,8B (jevnovel3) asigna a cada frase una probabilidad de "mala calidad" (p_bad) al final de la oración. Después, un modelo de primera pasada (Claude Opus 5.5) expande detalles del original humano evitando introducir información no inferible del texto. A continuación, jevnovel3 vuelve a puntuar y un segundo modelo (Spark X 2.6) aplica modificaciones puntuales; finalmente, un tercer modelo (Kimi K3) realiza una última ronda de revisión.

Sobre ese corpus enriquecido se generan cadenas de pensamiento con Gemini 4 Argon, que recibe el catálogo de fórmulas "AIGC" (八股), el texto degradado, sus puntuaciones JEV y la versión enriquecida, y produce el razonamiento que conecta la puntuación, el tipo de fórmula detectada y la estrategia de reescritura. El resultado es un modelo entrenado para razonar explícitamente sobre qué frases son artificiales y cómo sustituirlas, en lugar de aplicar una transformación superficial. La innovación técnica destacable es la incorporación de una cabeza MTP (multi-token prediction) afinada, que permite decodificación especulativa en llama.cpp (`--spec-type draft-mtp`) para aumentar tokens por segundo.

## Capacidades

- Reescritura de prosa en chino: transforma textos degradados por IA en texto fluido con estilo de autor, respetando una restricción de no copiar más de 15 caracteres consecutivos del original.
- Razonamiento explícito sobre calidad literaria: genera una cadena de pensamiento que identifica fórmulas "AIGC", justifica los cambios y decide qué añadir.
- Detección y eliminación de relleno y clichés característicos de la generación automática en chino.
- Expansión controlada de detalles: puede añadir descripciones y matices ausentes en el borrador, con riesgo de alargar el texto si no se fija la longitud en el prompt.
- Decodificación especulativa mediante MTP integrado, compatible con llama.cpp nightly (b12374 o superior).
- Generación de texto conversacional (`text-generation`, etiqueta `conversational`).
- No se declara soporte de tool calling, function calling, agentes multi-paso, visión ni audio en la información disponible.
- Capacidad multilingüe: únicamente chino declarado.

## Casos de uso

- Limpieza de borradores de web-novel generados por IA: el modelo recibe un capítulo producido automáticamente y lo reescribe eliminando fórmulas repetitivas y relleno, manteniendo la trama; es su caso de uso principal y para el que fue entrenado.
- Humanización de texto para plataformas editoriales chinas: editoriales o agregadores que publican ficción por entregas pueden pasar los textos por el modelo antes de publicarlos para reducir la detección de "sabor a IA" y mejorar la retención de lectores.
- Post-procesado en pipelines de generación aumentada: integrar el modelo como etapa final tras un generador de borradores, de modo que el primer modelo produzca estructura y el segundo aporte estilo y naturalidad.
- Reescritura con control de similitud: gracias a la restricción de copia literal (máximo 15 caracteres consecutivos) y a la métrica de "desvinculación", encaja en flujos donde se exige originalidad verificable respecto al texto fuente.
- Despliegue local en hardware de gama media: con 12,3 GB en IQ3_XS cabe en GPUs de 16 GB y permite ejecutar el modelo en estaciones de trabajo sin GPU de datacenter, usando llama.cpp con MTP para compensar la pérdida de calidad de la cuantización.
- Prototipado e investigación sobre estilos de escritura: útil para estudiar cómo un modelo razona sobre calidad literaria y fórmulas repetitivas, ya que expone su cadena de pensamiento sobre los cambios aplicados.
- Servicio de revisión literaria asistida: asistir a autores humanos señalando pasajes artificiales y proponiendo reescrituras, en lugar de sustituirlos por completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor publica una evaluación propia sobre seis prompts con métricas de calidad de reescritura, comparando formatos de cuantización del mismo modelo (no modelos distintos):

| Formato | JEV medio (menor mejor) | Desvinculación del original (mayor mejor) | Copia literal máxima (caracteres) | Copia literal total | Longitud del texto | Muestras demasiado largas | Tiempo medio |
|---|---|---|---|---|---|---|---|
| FP8 (W8A8) | 0,0966 | 0,844 | 31,2 | 54,2 | 1036 | 3/6 | 71 s |
| IQ4_XS (GGUF) | 0,0982 | 0,767 | 25,2 | 86,0 | 1007 | 0/6 | 41 s |
| NVFP4 (W4A4) | 0,1016 | 0,804 | 25,5 | 70,2 | 944 | 0/6 | 43 s |

La puntuación JEV es la probabilidad media de frase "mala" asignada por el clasificador jevnovel3 0,8B; el autor considera limpio un valor por debajo de 0,08 y normal el rango 0,08–0,12. La variante IQ3_XS de este repositorio no aparece en la tabla: el autor indica que las cuantizaciones de 3 y 4 bits (Q3_K_M, Q4_K_M, IQ3_XS) aún no se han evaluado con este conjunto de seis prompts.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF pesa 12,3 GB (11,5 GiB); con contexto de 16.384 tokens y caché KV en bf16 hay que reservar varios GB adicionales, por lo que conviene apuntar a 16 GB de VRAM o más.
- GPU recomendadas: RTX 4090 (24 GB), RTX 4080 (16 GB) al límite, A100 o H100 para despliegues con mayor concurrencia. El autor posiciona esta variante como "extremo de VRAM mínima" y recomienda IQ4_XS o FP8 cuando haya margen.
- Cabe en GPU de consumo: sí, en tarjetas de 16 GB o superiores; el autor advierte que Q4_K_M (17,0 GB) no entra en 16 GB y sugiere IQ4_XS para ese caso, mientras que IQ3_XS está pensado precisamente para ese límite.
- Opciones de despliegue: llama.cpp / llama-server (nightly b12374 o superior) con MTP mediante `--spec-type draft-mtp --spec-draft-n-max 3`; para BF16, FP8 o NVFP4 el autor remite a vLLM con los repositorios correspondientes.
- Latencia y throughput: en la evaluación del autor, IQ4_XS tarda 41 s de media frente a 71 s de FP8 en la misma máquina, prácticamente la mitad. No hay cifras de tokens por segundo para IQ3_XS.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rewrite3-27b-iq3xs | 27,3 B | no disponible | Reescritura de web-novel china, GGUF IQ3_XS | Apache 2.0 | Hugging Face, ModelScope |
| rewrite3-27b-fp8 | 27,3 B | no disponible | Misma tarea, formato FP8 W8A8 (35,9 GB) | Apache 2.0 | Hugging Face, ModelScope |
| rewrite3-27b-iq4xs | 27,3 B | no disponible | Misma tarea, GGUF IQ4_XS (15,5 GB) | Apache 2.0 | Hugging Face, ModelScope |
| Qwen/Qwen3.8-27B | 27,3 B | no disponible | Modelo base generalista | no disponible | Hugging Face |

No se dispone de datos sobre modelos de terceros comparables en la misma categoría (reescritura literaria en chino) en la información proporcionada, por lo que la comparación se limita a las variantes del propio proyecto y al modelo base.

## Limitaciones y advertencias

- Especialización estrecha: el modelo está entrenado para reescritura de ficción china; su rendimiento en otras tareas (código, matemáticas, razonamiento general) no está documentado y probablemente sea inferior al del Qwen3.8-27B original.
- Idioma único: solo declara chino; no hay evidencia de calidad en castellano u otros idiomas.
- Pérdida de calidad por cuantización: IQ3_XS es la variante más agresiva del proyecto y el autor no la ha evaluado con su conjunto de pruebas; FP8 e IQ4_XS obtienen mejores métricas JEV y de copia literal.
- Riesgo de alargar el texto: el autor reconoce que el modelo puede "añadir material para ganar longitud" (3 de 6 muestras demasiado largas en FP8); es necesario fijar la longitud en el prompt.
- Riesgo de alucinación: al expandir detalles puede introducir información no presente en el borrador; el pipeline de datos se diseñó para evitarlo, pero no hay garantía en producción.
- Sesgos: no se documentan sesgos específicos; al entrenarse sobre web-novel china puede reproducir tics de género (clichés de novela de cultivación, romance, etc.).
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.8-27B, cuyo modelo card no se detalla en la información disponible.
- Dependencia de herramientas: el MTP requiere llama.cpp nightly reciente; versiones estables pueden no cargar la cabeza especulativa.
- Sin benchmarks estándar publicados: no es posible comparar su calidad general con otros modelos de 27B mediante métricas convencionales.

## Enlaces

- Hugging Face: https://huggingface.co/aikexue170/rewrite3-27b-iq3xs
- ModelScope: https://modelscope.cn/models/alkaid55555/rewrite3-27b-iq3xs
- Variante BF16: https://huggingface.co/aikexue170/rewrite3-27b-bf16
- Variante Q8_0: https://huggingface.co/aikexue170/rewrite3-27b-q8_0
- Variante FP8: https://huggingface.co/aikexue170/rewrite3-27b-fp8
- Variante NVFP4: https://huggingface.co/aikexue170/rewrite3-27b-nvfp4
- Variante IQ4_XS: https://huggingface.co/aikexue170/rewrite3-27b-iq4xs
- Variante Q4_K_M: https://huggingface.co/aikexue170/rewrite3-27b-q4km
- Variante Q3_K_M: https://huggingface.co/aikexue170/rewrite3-27b-q3km
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B

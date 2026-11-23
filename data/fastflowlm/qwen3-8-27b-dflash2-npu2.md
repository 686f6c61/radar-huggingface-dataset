# FastFlowLM/Qwen3.8-27B-DFlash2-NPU2

## Resumen

FastFlowLM/Qwen3.8-27B-DFlash2-NPU2 es un paquete de pesos auxiliares publicado por FastFlowLM: se trata del modelo borrador (draft) de decodificacion especulativa DFlash 2 para Qwen3.8-27B, convertido para ejecutarse en la NPU de los procesadores AMD Ryzen AI mediante el motor `flm` de FastFlowLM. No es un modelo autonomo: por si solo no genera texto, sino que propone tokens que el modelo principal (`qwen3.8-mtp:27b`, es decir, Qwen3.8-27B-NPU2) verifica en una sola pasada.

El borrador tiene 2.000 millones de parametros, 5 capas de estilo Qwen3 con hidden de 5120, FFN de 17408, 32 cabezas de consulta y 8 de clave-valor de 128 dimensiones, ventana deslizante de 2048 y convoluciones dinamicas de dos tomas. Comparte la tabla de embeddings y la cabeza de salida con el modelo objetivo, y consume caracteristicas de las capas 5, 19, 33, 47 y 61 del modelo principal, fusionadas mediante una capa `fc`.

Su relevancia es practica: permite acelerar la decodificacion de un modelo de 27B en hardware de consumo con NPU integrada (Ryzen AI MAX+), con una mejora medida de 1,16x de media en tokens por segundo respecto a usar solo la cabeza MTP del modelo principal. La licencia es Apache-2.0 para el borrador, mientras que los pesos principales se rigen por la licencia del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer borrador de decodificacion especulativa (5 capas Qwen3-style, convoluciones dinamicas de dos tomas, selector de candidatos) |
| Parametros totales | 2 B (borrador); el modelo objetivo Qwen3.8-27B no declara parametros totales en la informacion disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventana deslizante de 2048 en el borrador; contexto del modelo principal no disponible |
| Tipos de cuantizacion | Q4_K para matrices fc, q/k/v/o y MLP; BF16 para normas, tensores de convolucion dinamica, proyeccion del selector y codebooks |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (borrador); la licencia del modelo principal aplica a los pesos principales |
| Formato de pesos | `dflash_weight.q4nx` (1,39 GB); el upstream son safetensors BF16 |

## Arquitectura y entrenamiento

El borrador es un transformer ligero de 5 capas con atencion de 32 cabezas de consulta y 8 de clave-valor (GQA), hidden de 5120 y FFN de 17408, con ventana deslizante de 2048. Incorpora convoluciones dinamicas de dos tomas y un selector de candidatos (top 16, rango 256) que elige un camino coherente entre las propuestas de cada posicion. Comparte la tabla de embeddings y la cabeza de salida con Qwen3.8-27B, de modo que no duplica esos tensores. Las caracteristicas de entrada son las salidas de las capas 5, 19, 33, 47 y 61 (indexadas desde cero) del modelo objetivo, fusionadas por la capa `fc`.

El entrenamiento del borrador corresponde a Inco AI (DFlash 2, con el DFlash original de Chen, Liang y Liu, ICML 2026); la model card no detalla el volumen de tokens, la composicion del dataset ni si hubo RLHF o DPO. La innovacion tecnica es la decodificacion especulativa con verificacion en bloque: en cada paso el borrador propone 7 tokens en una pasada y el modelo principal verifica las 8 posiciones (7 mas una propia) en una sola pasada, conservando el prefijo mas largo con el que coincide. El borrador se ejecuta sobre los mismos kernels de NPU que el modelo principal: matrices en el motor fusionado de dequantizacion Q4_K y matmul, proyeccion de salida en la cabeza de 8 filas, y atencion, convoluciones y selector en CPU.

## Capacidades

- No genera texto de forma autonoma: es un componente de aceleracion para Qwen3.8-27B en FastFlowLM.
- Propone 7 tokens por paso y selecciona un camino coherente mediante su selector de candidatos (top 16, rango 256).
- Acelera la decodificacion del modelo principal, con mayor ganancia en texto predecible (codigo y respuestas estructuradas).
- Hereda las capacidades del modelo principal Qwen3.8-27B (generacion, razonamiento, codigo, vision, tool calling), aunque la model card no las detalla.
- Permite conmutar al cabezal MTP propio del modelo con `FLM_DFLASH=0`, comportandose entonces como `qwen3.8-mtp:27b`.
- Requiere FastFlowLM 1.0.12 o superior.

## Casos de uso

- Despliegue local de Qwen3.8-27B en equipos con NPU AMD Ryzen AI: el paquete permite ejecutar el modelo principal con decodificacion especulativa mediante `flm run qwen3.8-dflash2:27b`, sin GPU dedicada.
- Asistentes de codigo en estacion de trabajo: la mayor tasa de aceptacion del borrador en prompts de codigo (6,6 tokens aceptados de media en un prompt corto de codigo, segun las mediciones del autor) se traduce en la mayor ganancia de velocidad en este tipo de texto.
- Generacion de respuestas estructuradas (JSON, plantillas, extraccion de campos): al ser texto predecible, el borrador acierta mas tokens y reduce el tiempo por respuesta.
- Prototipado e investigacion sobre decodificacion especulativa: el paquete expone pesos Q4_K y un borrador de 2 B, util para reproducir y medir tasas de aceptacion en NPU.
- Servicio local con `flm serve`: util para entornos de desarrollo que necesitan un endpoint compatible con la API de OpenAI en hardware de consumo.
- Evaluacion comparativa de estrategias de aceleracion: permite contrastar `qwen3.8-mtp:27b` frente a `qwen3.8-dflash2:27b` con el mismo modelo principal y el mismo hardware.

## Benchmarks y rendimiento

Calidad del borrador (replay teacher-forced de una ejecucion real en NPU, greedy, 300 tokens, thinking desactivado; media de tokens aceptados de los 7 propuestos por paso):

| Borrador | Prompt de codigo (52 pasos) | Prompt de prosa (66 pasos) |
|---|---:|---:|
| Pesos BF16, matematicas fp32 (referencia de z-lab) | 5,02 | 3,36 |
| Pesos Q4_K de este paquete, matematicas fp32 | 4,87 | 3,49 |
| Este paquete en NPU (activaciones bf16) | 4,60 | 3,41 |

Longitudes de aceptacion publicadas de DFlash 2 (incluyen el token anadido): 4,1 en MT-Bench y 4,4 a 5,5 en codigo y matematicas. Este motor mantiene aproximadamente 3,1 en prosa abierta y 6,6 en un prompt corto de codigo.

Rendimiento de FastFlowLM (Ryzen AI MAX+, Linux, modo de energia por defecto, `flm serve`, 160 tokens generados, greedy, diez prompts cortos, tokens/s de decodificacion):

| | `qwen3.8-mtp:27b` | `qwen3.8-dflash2:27b` |
|---|---:|---:|
| Media | 3,23 | 3,74 (1,16x) |
| Por prompt | | 0,87x a 1,47x |

Un paso tarda aproximadamente 1,2 s con cualquiera de los dos borradores (0,9 s para verificar las 8 posiciones, unos 0,27 s para el borrado).

## Requisitos de hardware

- Hardware objetivo: NPU de AMD Ryzen AI (medido en Ryzen AI MAX+ con Linux); no se documenta soporte para otras plataformas.
- VRAM: no aplica en el sentido habitual; el borrador ocupa 1,39 GB en disco y se ejecuta en la NPU junto al modelo principal.
- GPU recomendadas: no disponible; el paquete esta orientado a NPU, no a GPU.
- Cabe en GPU de consumo: no disponible (no es el objetivo del paquete).
- Despliegue: FastFlowLM (`flm`) 1.0.12 o superior; `flm pull qwen3.8-dflash2:27b` descarga el borrador y el modelo principal `qwen3.8-mtp:27b`; `flm run qwen3.8-dflash2:27b` lo ejecuta. Con `FLM_DFLASH=0` se usa el cabezal MTP del modelo principal.
- Latencia y throughput: aproximadamente 1,2 s por paso; 3,74 tokens/s de media en decodificacion (frente a 3,23 sin el borrador) en el hardware medido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FastFlowLM/Qwen3.8-27B-DFlash2-NPU2 | 2 B (borrador) | ventana 2048 en el borrador | Decodificacion especulativa DFlash 2 para NPU AMD | Apache-2.0 | Hugging Face, via `flm` |
| z-lab/Qwen3.8-27B-DFlash2 | 2 B (borrador) | no disponible | Borrador DFlash 2 de referencia en BF16 safetensors | no disponible en la informacion proporcionada | Hugging Face |
| `qwen3.8-mtp:27b` (Qwen3.8-27B-NPU2) | no disponible | no disponible | Modelo principal con cabezal MTP propio | licencia del modelo principal | Paquete FastFlowLM |

## Limitaciones y advertencias

- No es un modelo autonomo: sin el paquete principal `qwen3.8-mtp:27b` no funciona.
- Requiere FastFlowLM 1.0.12 o superior y hardware NPU AMD Ryzen AI; no hay soporte documentado para otras plataformas.
- La verificacion de 8 posiciones en una sola pasada redondea de forma distinta a la decodificacion token a token, por lo que la salida greedy puede diferir de `qwen3.8-mtp:27b` en empates cercanos (4 de 5 respuestas cortas greedy identicas, 5 de 10 largas).
- Los tokens propuestos se comparan con el token mas probable del modelo y omiten el sampler, igual que con el cabezal MTP.
- La ganancia de velocidad es variable (0,87x a 1,47x por prompt) y depende de la previsibilidad del texto; en prompts poco predecibles puede ser inferior a no usar el borrador.
- La cuantizacion Q4_K no degrada de forma medible la calidad del borrador, pero las activaciones bf16 de la NPU cuestan unos puntos porcentuales en codigo.
- Sesgos, riesgo de alucinacion y limitaciones de idioma: no disponibles en la informacion proporcionada; heredados del modelo principal.
- La licencia Apache-2.0 cubre el borrador; los pesos principales se rigen por la licencia del modelo base, que debe verificarse antes de un uso comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FastFlowLM/Qwen3.8-27B-DFlash2-NPU2
- Upstream del borrador: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Espejo del borrador: https://huggingface.co/incoai/Qwen3.8-27B-DFlash2
- Repositorio de FastFlowLM: https://github.com/FastFlowLM/FastFlowLM
- Blog de DFlash 2 (Inco AI): https://inco.ai/blog/dflash2/
- DFlash original (z-lab): https://github.com/z-lab/dflash
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B

# aikexue170/rewrite3-27b-iq3xs

## Resumen

rewrite3-27b-iq3xs es una cuantización GGUF IQ3_XS del modelo rewrite3-27B, un ajuste fino supervisado (SFT) sobre Qwen/Qwen3.8-27B especializado en la reescritura de novelas web en chino. Lo desarrolla el usuario aikexue170 y su propósito no es la generación creativa libre ni la continuación de texto, sino la reescritura controlada: recibe un borrador degradado por generación automática (con marcas de "estilo IA") y lo reescribe preservando trama, personajes y eventos, eliminando redundancias y fórmulas repetitivas.

La particularidad del modelo es que el prompt incorpora puntuaciones por frase generadas por un discriminador externo independiente, jevnovel3 0.8B, que asigna a cada oración una probabilidad de ser texto "de IA de baja calidad". El modelo usa esas puntuaciones como señal de localización para decidir qué reescribir primero, y produce una cadena de pensamiento de tipo editorial (diagnóstico, plan de corrección y texto final).

Este repositorio concreto es la variante IQ3_XS en formato GGUF, con un peso de 12,3 GB (11,5 GiB), pensada para despliegue local con llama.cpp. Incluye una cabeza MTP (multi-token prediction) reentrenada que actúa como decodificación especulativa, con una tasa de aceptación declarada del 56 % en decodificación voraz con n=3 y una aceleración extremo a extremo de aproximadamente 2x.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.8-27B), con cabeza MTP reentrenada para decodificación especulativa |
| Parametros totales | 27B (según denominación del modelo base; no se detalla el desglose exacto) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 16.384 tokens en el ejemplo de despliegue con llama.cpp (`-c 16384`); no se especifica el máximo nativo |
| Tipos de cuantizacion | IQ3_XS (GGUF); la familia incluye BF16, FP8 W8A8, NVFP4 W4A4 e IQ4_XS |
| Idiomas soportados | Chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con módulo MTP embebido en `blk.32.nextn.*`); otras variantes en BF16/FP8/NVFP4 |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B, un transformer denso de 27B parámetros, y se somete a un ajuste fino supervisado orientado a una tarea única: la reescritura de prosa. Los datos de entrenamiento incorporan cadenas de pensamiento editoriales completas (identificación de problemas de estilo, justificación y plan de reescritura) junto con el texto final reescrito, de modo que el modelo aprende a analizar antes de reescribir. El objetivo declarado es mantener invariantes trama, personajes y eventos, reorganizando oraciones y comprimiendo repeticiones, con una restricción dura de no copiar más de 15 caracteres consecutivos del original.

La innovación técnica más destacable es la incorporación de un discriminador externo (jevnovel3 0.8B) cuyas puntuaciones por frase se inyectan en la entrada, y una cabeza MTP reentrenada sobre datos propios (v14-sfw) que funciona como borrador especulativo. No se especifican en la información disponible el volumen de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO.

## Capacidades

- Reescritura de prosa en chino con preservación de trama, personajes y eventos.
- Diagnóstico editorial explícito: identifica frases con "estilo IA", explica por qué y propone un plan de corrección antes de reescribir.
- Uso de puntuaciones externas por frase (JEV) como señal de localización de los fragmentos a corregir; admite ejecución sin puntuaciones, aunque fuera de la distribución de entrenamiento.
- Reorganización a nivel de párrafo en lugar de sustitución sinonímica frase a frase.
- Adición controlada de detalles de ambiente, acción o psicología (permitida), sin invención de elementos de la historia.
- Decodificación especulativa mediante MTP embebido (n=3, aceptación ~56 %).
- Capacidad multilingüe: limitada al chino según la model card.
- No se documentan tool calling, function calling ni capacidades de agente, visión o audio.

## Casos de uso

- Limpieza de borradores generados por IA en plataformas de novela web: el modelo recibe capítulos con marcas de estilo automático y los reescribe manteniendo la continuidad narrativa, gracias a su ventana de 16.384 tokens que cubre capítulos completos.
- Edición asistida para autores: el modo de análisis previo permite usar el modelo como revisor que señala pasajes redundantes o formulaicos antes de entregar la versión corregida.
- Control de calidad en pipelines editoriales: integrado tras un generador, el discriminador JEV marca frases problemáticas y rewrite3 las corrige en una segunda pasada, reduciendo la intervención manual.
- Despliegue local en estaciones de trabajo: con 12,3 GB de pesos IQ3_XS y MTP embebido, puede ejecutarse con llama.cpp en GPUs de consumo de gama alta, útil para editores que no pueden enviar manuscritos a servicios en la nube.
- Normalización de estilo en corpus: reescritura por lotes de textos para homogeneizar registro y eliminar muletillas antes de publicar o entrenar otros modelos.
- Reducción de longitud con fidelidad: el modelo admite instrucciones de compresión, útil para ajustar capítulos a límites de extensión manteniendo los hechos intactos.
- Evaluación comparativa de cuantizaciones: el repositorio documenta métricas JEV, grado de desvío del original y solapamiento literal, lo que permite medir el impacto de la cuantización en una tarea concreta antes de elegir el formato de producción.

## Benchmarks y rendimiento

La model card incluye una comparativa de la propia familia sobre seis prompts, con KV cache en bf16 y la misma máquina. Las métricas son específicas de la tarea (JEV medio, desvío del original, copia literal), no benchmarks estándar.

| Formato | JEV medio ↓ | Desvío ↑ | Copia máxima (caracteres) ↓ | Copia total ↓ | Longitud media | Muestras sobredimensionadas | Tiempo medio |
|---|---|---|---|---|---|---|---|
| FP8 (W8A8) | 0,0966 | 0,844 | 31,2 | 54,2 | 1036 | 3/6 | 71 s |
| IQ4_XS (GGUF) | 0,0982 | 0,767 | 25,2 | 86,0 | 1007 | 0/6 | 41 s |
| NVFP4 (W4A4) | 0,1016 | 0,804 | 25,5 | 70,2 | 944 | 0/6 | 43 s |

El repositorio IQ3_XS no aparece en esta tabla; el autor indica que las variantes de 3 y 4 bits (Q3_K_M, Q4_K_M, IQ3_XS) aún no se han evaluado. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el archivo IQ3_XS pesa 12,3 GB (11,5 GiB); con contexto de 16.384 tokens y KV cache en bf16 hay que añadir varios GB, por lo que conviene planificar entre 16 y 24 GB de VRAM.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 para ejecución completa en GPU; A100/H100 para mayor contexto o lotes.
- Cabe en GPU de consumo: sí, en tarjetas de 24 GB con margen; en 16 GB requeriría reducir contexto o descargar capas a CPU.
- Despliegue: llama.cpp (nightly b12374 o superior) con `--spec-type draft-mtp --spec-draft-n-max 3`; para BF16/FP8/NVFP4, vLLM.
- Rendimiento: el autor cita aproximadamente 2x de aceleración con MTP frente a decodificación sin especulación; no se publican tokens por segundo absolutos para esta variante.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rewrite3-27B IQ3_XS (este) | 27B | 16.384 (config. ejemplo) | Reescritura de novela web en chino con JEV y MTP | Apache 2.0 | GGUF en Hugging Face |
| rewrite3-27B FP8 | 27B | no disponible | Igual, formato de producción | Apache 2.0 | Hugging Face / ModelScope |
| rewrite3-27B BF16 | 27B | no disponible | Referencia de calidad | Apache 2.0 | Hugging Face / ModelScope |
| Qwen/Qwen3.8-27B (base) | 27B | no disponible | Propósito general | no disponible en la información | Hugging Face |

No se dispone de datos de benchmarks estándar que permitan comparar el rendimiento con alternativas de propósito general o de reescritura de otros desarrolladores.

## Limitaciones y advertencias

- Modelo monolingüe en chino: no está entrenado para reescritura en castellano ni en otros idiomas.
- Dependencia de la señal JEV: sin las puntuaciones del discriminador, la entrada queda fuera de la distribución de entrenamiento y la calidad puede degradarse.
- Riesgo de "inflado" de longitud: en 3 de 6 muestras con FP8 el texto resultante superó al original; conviene fijar el nivel de compresión en el prompt.
- Riesgo de invención: aunque el entrenamiento prohíbe crear tramas nuevas, el modelo puede añadir detalles de ambiente o psicología; requiere revisión humana en producción.
- Alucinación en datos factuales: no es un modelo de conocimiento general y no debe usarse para consultas informativas.
- Sesgos: no documentados por el autor; al derivar de un modelo base chino puede heredar sesgos culturales y estilísticos de su corpus.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el modelo base ni sobre el discriminador jevnovel3.
- La variante IQ3_XS no está incluida en la tabla comparativa del autor; su calidad relativa frente a FP8 o IQ4_XS no está medida.
- Requiere llama.cpp muy reciente (nightly b12374 o superior) para aprovechar el MTP embebido; versiones anteriores ignorarán la cabeza especulativa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/aikexue170/rewrite3-27b-iq3xs
- Variante BF16: https://huggingface.co/aikexue170/rewrite3-27b-bf16
- Variante BF16 en ModelScope: https://modelscope.cn/models/alkaid55555/rewrite3-27b-bf16
- Variante FP8: https://huggingface.co/aikexue170/rewrite3-27b-fp8
- Variante FP8 en ModelScope: https://modelscope.cn (ruta truncada en la información disponible)
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B

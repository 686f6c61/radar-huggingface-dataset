# senorperez/qwen3.6-35b-a3b-puzzle-60pct

## Resumen

`senorperez/qwen3.6-35b-a3b-puzzle-60pct` es un checkpoint de investigación experimental producido por poda de las FFN de los expertos del modelo MoE `Qwen/Qwen3.6-35B-A3B`, reduciendo su ancho al 60% (media de 305,6 de 512 canales por capa). El resultado es un modelo de 21,68 mil millones de parámetros que, según su autor, es peor que el modelo padre en todos los benchmarks evaluados y no cumple las expectativas de recuperación de capacidades mediante destilación. Se publica únicamente con fines de reproducibilidad, no para uso en producción.

El modelo aplica la metodología de compresión estilo NVIDIA Puzzle (arXiv 2411.19146), con selección de canales consciente de la covarianza blanqueada, asignación de ancho por capa mediante programación dinámica y un proceso de "healing" con optimizador Muon y destilación KL de cola gruesa. Su única ventaja práctica es que cabe en 16 GiB de VRAM con cuantización de 4 bits (12,35 GiB), lo que motivó su creación. Requiere un parche específico para cargarse con `transformers` porque usa anchos de FFN por capa (`moe_intermediate_sizes`), y no es compatible con vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con FFN de expertos podadas (per-layer widths) |
| Parametros totales | 21.675.045.504 (21,68 B) |
| Parametros activos | no disponible (el modelo base Qwen3.6-35B-A3B tiene ~3 B activos, pero no se especifica tras la poda) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | 4-bit (mencionado en la model card, 12,35 GiB) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.6-35B-A3B`, un transformer de mezcla de expertos (MoE) con 35 B de parámetros totales y aproximadamente 3 B activos. La poda se aplica exclusivamente a las FFN de los expertos, reduciendo su ancho a un 60% medio por capa mediante selección de canales basada en covarianza blanqueada (método Puzzle). La asignación de ancho por capa se resuelve con programación dinámica. Tras la poda, se realiza un proceso de "healing" con el optimizador Muon y destilación KL de cola gruesa, primero por bloques y luego global. El autor documenta que ningún intento de healing recuperó las capacidades perdidas, y que la retención de rendimiento es lineal desde el 75% hasta el 60% de ancho, sin un punto de inflexión claro.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base, pero degradadas significativamente (p. ej., GPQA Diamond cae de 80,81 a 56,57).
- Codigo y matematicas: no se reportan benchmarks específicos, pero se asume degradación similar al resto de tareas.
- Tool calling y agentes: no se menciona soporte específico; el modelo base probablemente lo tenga, pero no está verificado en este checkpoint.
- Multilingue: no se especifican idiomas.
- Capacidades especiales: ninguna adicional; es un modelo de texto puro.

## Casos de uso

- Investigacion en poda de modelos MoE: sirve como punto de referencia para estudiar la relacion entre ancho de FFN, retencion de capacidades y coste de inferencia.
- Estudio de destilacion y "healing": permite analizar por que la destilacion KL no recupera el rendimiento perdido tras una poda agresiva.
- Evaluacion de metodos de compresion: comparar con otros checkpoints podados (s75, etc.) para trazar curvas de retencion.
- Pruebas de cuantizacion en hardware limitado: al caber en 16 GiB con 4 bits, puede usarse para validar pipelines de cuantizacion en GPUs de consumo.
- Desarrollo de parches para `transformers` con MoE de anchos variables: el repositorio incluye un modulo `perlayer_moe` que puede servir de base para otras investigaciones.
- Reproducibilidad de resultados negativos: documentar y compartir fallos de metodos de compresion para evitar que otros equipos repitan el mismo camino.

## Benchmarks y rendimiento

| Benchmark | Qwen3.6-35B-A3B (padre) | Este modelo (s60) |
|---|---|---|
| MMLU-Pro | 77,78 | 67,80 |
| IFEval | 84,10 | 71,90 |
| GPQA Diamond | 80,81 | 56,57 |

El autor indica que la perdida de rendimiento es lineal desde el 75% al 60% de ancho: GPQA Diamond pierde 12,12 puntos porcentuales del padre al s75, y otros 12,12 del s75 a este modelo. No se han publicado mas benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 12,35 GiB con cuantizacion de 4 bits; el checkpoint en bfloat16 ocupa aproximadamente 43,4 GB en disco, por lo que en precision nativa se necesitarian al menos 48 GiB de VRAM.
- GPU recomendadas: cualquier GPU con 16 GiB o mas (RTX 4080, RTX 4090, A100 40 GB, etc.) para la version 4-bit; para bfloat16 se requieren GPUs de datacenter (A100 80 GB, H100).
- Compatibilidad con GPU de consumo: si, con cuantizacion 4-bit en GPUs de 16 GiB.
- Opciones de despliegue: solo `transformers` con el parche `perlayer_moe` incluido en el repositorio. vLLM no es compatible. No se menciona soporte para llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU-Pro | IFEval | GPQA-D | Licencia |
|---|---|---|---|---|---|---|
| Qwen3.6-35B-A3B (padre) | 35 B totales, ~3 B activos | no disponible | 77,78 | 84,10 | 80,81 | Apache-2.0 |
| Este modelo (s60) | 21,68 B | no disponible | 67,80 | 71,90 | 56,57 | Apache-2.0 |
| Otros modelos podados de la misma serie (s75) | no disponible | no disponible | no disponible | no disponible | 68,69 (estimado por diferencia) | no disponible |

No se dispone de datos publicos de otros modelos comparables fuera de la serie de poda del propio autor. La comparativa principal es contra el modelo padre, que supera a este checkpoint en todos los benchmarks.

## Limitaciones y advertencias

- Modelo experimental: el propio autor advierte que es peor que el padre en todos los benchmarks y que no cumple las expectativas. No debe usarse en produccion.
- Requiere parche especifico: `transformers` estandar no puede cargar los pesos debido a los anchos de FFN por capa; es necesario aplicar `perlayer_moe.patch()` antes de `from_pretrained`.
- Sin soporte vLLM: no se puede desplegar con el servidor de inferencia habitual para modelos MoE.
- Riesgo de alucinacion y sesgos: al ser una version degradada del modelo base, puede presentar mayor tendencia a errores factuales y de razonamiento.
- Licencia Apache-2.0: permite uso comercial, pero el autor desaconseja su uso por su bajo rendimiento.
- Documentacion incompleta: no se especifican idiomas, longitud de contexto, ni detalles del dataset de destilacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/senorperez/qwen3.6-35b-a3b-puzzle-60pct
- Paper de referencia (Puzzle): https://arxiv.org/abs/2411.19146
- Repositorio del autor (privado): https://github.com/sootaugur/puzzle

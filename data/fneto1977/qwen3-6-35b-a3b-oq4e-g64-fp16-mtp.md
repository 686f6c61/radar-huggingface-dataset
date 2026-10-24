# fneto1977/Qwen3.6-35B-A3B-oQ4e-g64-fp16-mtp

## Resumen

Este repositorio no es un modelo entrenado desde cero, sino una cuantizacion experimental del modelo Qwen/Qwen3.6-35B-A3B (35.951.822.704 parametros totales, arquitectura MoE segun el tag `qwen3_5_moe`), publicada por el usuario fneto1977 bajo licencia apache-2.0. El pack se genero con oMLX 0.7.2 en nivel oQ4e, con imatrix derivada de `oqe_code_multilingual` (1.024 muestras de 512 tokens), `dtype=float16`, `preserve_mtp=True` y una modificacion concreta: `group_size=64` tambien en los tensores protegidos de los MoE de 150 o mas expertos, donde el oQ estandar usa 128. Su proposito declarado es reproducir y medir el issue jundot/omlx#4772, no distribuir una release oficial.

La particularidad tecnica es el uso de pesos fp16 en lugar de bf16, motivado porque las GPU M1 (applegpu_g13) no tienen ALU de bf16. Segun el autor, en un M1 Ultra esto se traduce en aproximadamente un 7% mas de velocidad en decodificacion simple, un 15% en decodificacion con MTP y un 55% en prefill. El pack corre en cualquier Mac con Apple Silicon, aunque en M2 y posteriores el autor recomienda un pack en bf16.

Es relevante ahora por dos motivos: primero, porque documenta con mediciones la perdida de calidad de una cuantizacion mixta de 4 bits frente a una referencia de 8 bits (KL medio 0,0212 y 94,47% de acuerdo top-1 frente a 0,0217 y 94,20% del oQ4e estandar); segundo, porque corrige publicamente una conclusion previa erronea sobre la ventaja de `group_size=64`. La adopcion es muy baja (18 descargas, 0 likes), coherente con su naturaleza de experimento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con mezcla de expertos (MoE); tag de arquitectura `qwen3_5_moe`. Detalle de capas, atencion y configuracion exacta del modelo base: no disponible en la informacion proporcionada |
| Parametros totales | 35.951.822.704 (aproximadamente 35,95 mil millones), segun safetensors |
| Parametros activos | Aproximadamente 3 mil millones por token, inferido de la nomenclatura A3B del modelo base; cifra exacta no disponible |
| Longitud de contexto | No disponible en la informacion proporcionada (remitirse a la model card de Qwen/Qwen3.6-35B-A3B) |
| Tipos de cuantizacion | oQ4e mixta de 4 bits con group size 64: 193 tensores a 8 bits, 9 tensores a 6 bits y 108 tensores a 5 bits; tensores restantes en fp16 |
| Idiomas soportados | No disponibles. La imatrix de calibracion (`oqe_code_multilingual`) sugiere enfasis en codigo y contenido multilingue, pero no hay lista oficial de idiomas |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en formato MLX (`library_name: mlx`); no se distribuye GGUF. Tamano del repositorio: 22,5 GB |
| Parametros de decodificacion | MTP (multi-token prediction) preservado en el pack (`preserve_mtp=True`) |
| Fecha de publicacion | Creado el 2026-10-23, actualizado el 2026-10-24 |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3.6-35B-A3B, un transformer decoder-only con mezcla de expertos: 35,95 mil millones de parametros totales de los que se activan aproximadamente 3 mil millones por token, lo que permite ejecutar un modelo de ese tamano con un coste de computo por token propio de un modelo mucho mas pequeno. Este repositorio es una cuantizacion, no un reentrenamiento: no hay datos de entrenamiento propios ni fases de RLHF o DPO documentadas en la informacion disponible, y el conocimiento del modelo proviene integramente del checkpoint base de Qwen.

El proceso de cuantizacion, documentado por el autor: oMLX 0.7.2, nivel oQ 4, `enhanced=True` con imatrix construida a partir de `oqe_code_multilingual` (1.024 muestras x 512 tokens), `dtype=float16`, `preserve_mtp=True` y `group_size=64`. La unica desviacion respecto al oQ estandar es que la funcion `gs()` de `omlx/oq.py` devuelve 64 en lugar de 128 para los tensores protegidos (con bits elevados) de los MoE de 150 o mas expertos, dando el layout 8 bits/g64 x193, 5 bits/g64 x108 y 6 bits/g64 x9. El uso de fp16 en los tensores no cuantizados responde a la ausencia de ALU de bf16 en las GPU M1; el autor indica que en M2 y posteriores un pack bf16 es la eleccion natural. La innovacion tecnica evaluada, por tanto, es puramente de compresion y de preservacion de la cabeza MTP para decodificacion especulativa.

## Capacidades

- Generacion de texto y razonamiento general heredados del modelo base Qwen3.6-35B-A3B; el nivel de capacidad concreto no esta evaluado en la informacion disponible.
- Generacion de codigo: la imatrix de calibracion se construyo con `oqe_code_multilingual`, por lo que la cuantizacion esta optimizada para preservar pesos relevantes en codigo.
- Contenido multilingue: la calibracion incluye material multilingue, aunque no se publica la lista de idiomas soportados.
- Decodificacion especulativa mediante MTP (multi-token prediction) preservada en el pack, con ganancias de velocidad reportadas en hardware M1.
- Capacidad de mezcla de expertos: activacion de aproximadamente 3 mil millones de parametros por token sobre un total de 35,95 mil millones, lo que reduce el coste de inferencia por token.
- Soporte de tool calling / function calling: no documentado en la informacion disponible para este pack; depende de las capacidades del modelo base y de la plantilla de chat que se use en MLX.
- Comportamiento como agente y razonamiento multi-paso: no evaluado en la informacion disponible.

## Casos de uso

- Desarrollo local en Mac con Apple Silicon: ejecutar un MoE de 35,95 mil millones de parametros en un unico equipo con memoria unificada de 24 GB o mas, sin GPU dedicada ni servicio en la nube, usando mlx-lm u oMLX.
- Prototipado offline de asistentes de codigo: el pack esta calibrado con un imatrix orientado a codigo y multilingue, lo que lo hace util para autocompletado y refactorizacion en entornos sin conexion sobre macOS.
- Evaluacion de tecnicas de cuantizacion: sirve como referencia reproducible para medir KL y acuerdo top-1 de una receta oQ4e con `group_size=64` frente a una referencia de 8 bits, con el script de benchmark publicado por el autor.
- Investigacion sobre decodificacion especulativa: al preservar MTP, permite medir el impacto de la prediccion multi-token en velocidad de decodificacion sobre GPU M1 frente a M2 o posteriores.
- Procesamiento por lotes de texto sensible a privacidad: al ejecutarse integramente en local, es adecuado para resumir o clasificar documentos que no pueden salir de la maquina del usuario.
- Comparativa de dtypes en hardware Apple: util para cuantificar la diferencia fp16 frente a bf16 en un mismo modelo (aproximadamente 7% en decodificacion simple, 15% con MTP y 55% en prefill sobre M1 Ultra).
- Docencia y formacion: example práctico de como un cambio de `group_size` en los tensores protegidos afecta (o no) tanto a la calidad como al rendimiento, con datos publicados y un issue reproducible.

## Benchmarks y rendimiento

El autor solo publica una evaluacion de calidad frente a `mlx-community/Qwen3.6-35B-A3B-8bit`, sobre 8.192 tokens de Python y Markdown:

| Pack | KL medio | Acuerdo top-1 |
|---|---|---|
| oQ4e estandar (g128 en tensores protegidos) | 0,0217 | 94,20% |
| Este pack (g64 en todos los tensores) | 0,0212 | 94,47% |

No se han publicado resultados de benchmarks en la informacion disponible (MMLU, HumanEval, GSM8K u otros). El autor indica ademas que la ventaja de velocidad medida inicialmente para este pack no se reprodujo: en un M1 Max queda a la par del clon en fp16 del pack publicado, y una reconstruccion con `group_size=128` y la misma receta resulto aproximadamente un 8% mas rapida; un M1 Ultra no mostro diferencias por tamano de grupo. La variable que si importa en M1 es el dtype: fp16 frente a bf16 dio aproximadamente un 7% mas en decodificacion simple, un 15% en decodificacion con MTP y un 55% en prefill sobre un M1 Ultra. No se publican valores absolutos de latencia ni de tokens por segundo.

## Requisitos de hardware

- VRAM/memoria unificada estimada: alrededor de 22,4 GB solo para pesos (el repositorio ocupa 22,5 GB), por lo que se recomienda un minimo de 24 GB de memoria unificada y, de forma realista, 32 GB o mas para dejar margen al contexto y a las activaciones.
- GPU compatibles: exclusivamente Apple Silicon (M1, M1 Pro/Max/Ultra, M2 en adelante). Las GPU M1 son el objetivo primario por ser fp16; en M2 y posteriores el autor recomienda un pack bf16.
- No es ejecutable en GPU NVIDIA o AMD con este formato: al ser pesos MLX, no hay ruta directa a CUDA.
- Cabe en equipos de consumo: MacBook Pro con M1 Max o M2/M3 Max de 32 GB o mas, Mac Studio con M1 Max/Ultra o M2 Ultra de 64 GB o mas.
- Opciones de despliegue: mlx-lm (generacion y servidor HTTP), oMLX 0.7.2 o superior. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI sin conversion previa de formato.
- Latencia y throughput: no se publican valores absolutos. Solo hay cifras relativas en M1 Ultra (fp16 frente a bf16: +7% decodificacion simple, +15% decodificacion con MTP, +55% prefill) y en M1 Max (g128 aproximadamente 8% mas rapido que g64 con la misma receta).

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Calidad (KL vs 8 bits) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| fneto1977/Qwen3.6-35B-A3B-oQ4e-g64-fp16-mtp | 35,95 B totales, ~3 B activos | oQ4e mixta, g64, fp16, MTP | no disponible | 0,0212 / 94,47% top-1 | apache-2.0 | MLX, 22,5 GB, 18 descargas |
| mlx-community/Qwen3.6-35B-A3B-8bit | 35,95 B totales, ~3 B activos | 8 bits | no disponible | referencia | apache-2.0 (segun modelo base) | MLX, mayor tamano en disco |
| oQ4e estandar (g128 en tensores protegidos) | 35,95 B totales, ~3 B activos | oQ4e mixta, g128, MTP | no disponible | 0,0217 / 94,20% top-1 | apache-2.0 | MLX |
| root4k/Qwen3.6-35B-A3B-oQ4e-fp16-mtp | 35,95 B totales, ~3 B activos | oQ4e, fp16, MTP | no disponible | no disponible | apache-2.0 (segun modelo base) | MLX |
| tfjack/Qwen3.6-35B-A3B-oQ4e-fp16-mtp | 35,95 B totales, ~3 B activos | oQ4e, fp16, MTP | no disponible | no disponible | no disponible | MLX; LLM Explorer cita 22,4 GB de VRAM |
| Qwen/Qwen3.6-35B-A3B (base) | 35,95 B totales, ~3 B activos | bf16 sin cuantizar | no disponible | referencia de maxima calidad | apache-2.0 | safetensors, formato original |

## Limitaciones y advertencias

- Es un pack experimental publicado para reproducir un issue concreto (jundot/omlx#4772), no una release oficial de oMLX ni un modelo validado para produccion.
- La evaluacion de calidad se limita a 8.192 tokens de Python y Markdown; no hay datos sobre matematicas, razonamiento, multilingue ni instrucciones de formato largo, donde una cuantizacion mixta de 4 bits puede degradar mas.
- El propio autor rectifico su primera conclusion sobre la velocidad: la ventaja medida inicialmente no se reprodujo, y con la misma receta `group_size=128` resulto aproximadamente un 8% mas rapido en M1 Max. No debe citarse la version anterior del resultado.
- Solo funciona en Apple Silicon y en formato MLX; no es portable a CUDA, llama.cpp ni Ollama sin conversion, lo que limita su uso en servidores convencionales.
- Los pesos estan en fp16 por una limitacion de hardware de M1; en M2 y posteriores no es la eleccion optima en rendimiento.
- Riesgo de alucinacion: inherente al modelo base y no cuantificado en esta ficha; la cuantizacion de 4 bits puede incrementarlo en dominios poco representados por la imatrix de calibracion.
- Idiomas soportados no documentados: la imatrix es multilingue, pero no hay garantia de cobertura por idioma.
- Sesgos: no se han publicado analisis de sesgo para este pack ni para el base en la informacion disponible.
- Licencia apache-2.0: permite uso comercial y modificacion, pero el usuario debe verificar los terminos del modelo base Qwen/Qwen3.6-35B-A3B y citar correctamente la cadena de derivacion.
- Adopcion minima (18 descargas, 0 likes): no hay evidencia de comunidad que valide el pack en casos reales.

## Enlaces

- HuggingFace del pack: https://huggingface.co/fneto1977/Qwen3.6-35B-A3B-oQ4e-g64-fp16-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Issue de oMLX con las mediciones: https://github.com/jundot/omlx/issues/4772
- Script de benchmark: https://gist.github.com/fneto1977/cd3c6b3b58061798411776524d6bffc4
- Referencia de calidad (8 bits): https://huggingface.co/mlx-community/Qwen3.6-35B-A3B-8bit
- Variante similar de otro autor: https://huggingface.co/root4k/Qwen3.6-35B-A3B-oQ4e-fp16-mtp
- Ficha en LLM Explorer (variante tfjack): https://llm-explorer.com/model/tfjack%2FQwen3.6-35B-A3B-oQ4e-fp16-mtp,12o5WSCemECxm2PwXDhML9
- Catalogo de NVIDIA NGC del modelo base: https://catalog.ngc.nvidia.com/orgs/nim/teams/qwen/models/qwen3.6-35b-a3b
- Ficha en free2aitools (variante thederby): https://free2aitools.com/model/thederby/qwen3.6-35b-a3b-oq4e-fp16-mtp

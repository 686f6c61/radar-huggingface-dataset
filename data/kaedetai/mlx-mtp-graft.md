# KaedeTai/mlx-mtp-graft

## Resumen

KaedeTai/mlx-mtp-graft es un repositorio que contiene únicamente la cabeza de predicción multi-token (MTP) del modelo Qwen3.8-27B, junto con una herramienta para injertarla en checkpoints MLX cuantizados que han perdido silenciosamente esos pesos. Muchas cuantizaciones MLX de la serie Qwen3.5/3.6/3.8 mantienen `mtp_num_hidden_layers: 1` en su `config.json` pero eliminan los tensores MTP, de modo que el checkpoint carga y genera correctamente pero no puede usar la decodificación especulativa MTP en oMLX. Este repo resuelve ese problema proporcionando la cabeza MTP por separado (314 MB) y un script de injerto que no redistribuye los pesos base.

El autor, KaedeTai, ha medido mejoras de velocidad de hasta 2,18× en generación de código sobre un Apple M5 Max con 128 GB, y 1,39× en prosa china, comparables a las de un checkpoint que ya incluía las cabezas MTP intactas. El proyecto es relevante para quienes ejecutan Qwen3.8-27B cuantizado en Apple Silicon y quieren aprovechar la decodificación especulativa sin re-descargar el modelo completo. La licencia es Apache-2.0 y el formato de pesos es MLX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza MTP (multi-token prediction) para Qwen3.8-27B, modelo base transformer denso |
| Parametros totales | 314 MB (tamano del repo: 0.3 GB) |
| Parametros activos | no aplica (componente auxiliar, no es un modelo autonomo) |
| Longitud de contexto | no disponible (depende del modelo base Qwen3.8-27B) |
| Tipos de cuantizacion | no aplica (la cabeza se injerta en checkpoints MLX cuantizados, tipicamente 4-bit affine) |
| Idiomas soportados | no disponible (hereda los del modelo base; las pruebas incluyen ingles y chino) |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

El repositorio contiene una cabeza MTP entrenada para el modelo denso Qwen3.8-27B. La cabeza se usa como componente de decodificacion especulativa: propone varios tokens por paso y el modelo base los verifica en lote, aceptando los que coinciden con su distribucion. No se redistribuyen los pesos del modelo base; solo se proporciona la cabeza (46 tensores) y un script `graft_mtp.py` que la anade a un checkpoint receptor mediante hard-links, sin copiar los pesos existentes.

No se proporcionan detalles sobre el entrenamiento de la cabeza (datos, numero de pasos, funcion de perdida). El autor indica que la cabeza funciona correctamente con oMLX, que es el unico stack que realmente la utiliza. La herramienta de injerto valida que el receptor tenga `hidden_size`, numero de cabezas, `vocab_size`, `num_experts` y `moe_intermediate_size` compatibles antes de proceder.

## Capacidades

- Aceleracion de inferencia mediante decodificacion especulativa multi-token en modelos Qwen3.8-27B cuantizados en MLX.
- Compatible con oMLX (reporta `Lightning MTP (model_type=qwen3_5_moe, active)` en modelos MoE y equivalente en densos).
- Mejora de throughput especialmente notable en generacion de codigo (hasta 2,18×) y moderada en prosa china (~1,4×).
- Tasa de aceptacion de tokens propuestos: 93,7% en codigo y 53-56% en prosa china para el modelo denso de 27B.
- Funciona con checkpoints abliterados (p. ej. `trohrbaugh/Qwen3.8-27B-heretic-ara`) y con modelos MoE (aunque sin ganancia de velocidad en estos ultimos).
- No altera la semantica de la salida: el modelo base verifica y acepta las propuestas, por lo que no puede generar contenido que el modelo base rechazaria.

## Casos de uso

- Aceleracion de generacion de codigo en Macs Apple Silicon: un desarrollador que sirve Qwen3.8-27B cuantizado en 4-bit con oMLX puede injertar esta cabeza y duplicar el throughput en tareas de autocompletado o generacion de funciones Python, sin cambiar el modelo base.
- Despliegue de asistentes de programacion locales: con la cabeza injertada, un asistente de codigo que antes generaba a ~29 tok/s pasa a ~61 tok/s, reduciendo la latencia percibida en entornos interactivos.
- Restauracion de funcionalidad MTP en checkpoints existentes: si un usuario ya tiene descargado un checkpoint MLX de Qwen3.8-27B sin cabezas MTP, puede anadir esta cabeza sin re-descargar el modelo completo (solo 314 MB adicionales).
- Evaluacion de decodificacion especulativa en investigacion: el repositorio incluye datos de aceptacion y tiempos de verificacion que permiten comparar el rendimiento de MTP frente a otras tecnicas como DFlash2 en el mismo hardware.
- Uso con modelos MoE para medir el punto de equilibrio: aunque el autor desaconseja mantener la cabeza en MoE por falta de ganancia, el script permite experimentar y medir si en otro hardware o configuracion la relacion coste/beneficio cambia.
- Integracion en pipelines de oMLX con requisitos de reproducibilidad: para aplicaciones donde la salida debe ser bit-reproducible, se puede desactivar MTP y usar el checkpoint sin cabeza, manteniendo ambos disponibles.

## Benchmarks y rendimiento

Los datos provienen de la model card, medidos en Apple M5 Max, 128 GB, macOS 26.4.1, oMLX 0.6.3rc1, con decodificacion greedy y thinking desactivado.

| Contenido | Antes (sin MTP) | Despues (con injerto) | Speedup |
|---|---:|---:|---:|
| Python LRU cache | 29,0 / 29,9 tok/s | 61,1 / 67,1 tok/s | 2,18× |
| Prosa china (200 caracteres) | 29,4 tok/s | 41,6 / 40,3 tok/s | 1,39× |

| Recipiente | Prompt | Aceptacion | Tok/cycle | tok/s | Tiempo backbone / MTP |
|---|---|---:|---:|---:|---:|
| ARA (dense 27B) | codigo | 93,7% | 3,53 | 70,6 | 2003 ms / 27,8 ms |
| ARA (dense 27B) | prosa china | 53-56% | 1,90 | 40-42 | 4724 ms / 62,8 ms |
| BigBang (MoE 35B-A3B) | codigo | 58,9-62,2% | 1,84-2,16 | 108 | 1005 ms / 50,5 ms |
| BigBang (MoE 35B-A3B) | prosa china | 25,8% | 1,29 | 101 | 362 ms / 10,2 ms |

Para referencia, un checkpoint que ya incluia MTP intacto (`tozp/…-OBLITERATED-V2`) alcanza 63,3 tok/s en codigo y 39-41 tok/s en prosa china en la misma maquina, lo que indica que el injerto iguala el rendimiento nativo.

## Requisitos de hardware

- Probado en Apple M5 Max con 128 GB de memoria unificada y macOS 26.4.1.
- Requiere Apple Silicon (MLX no soporta GPUs NVIDIA/AMD de forma nativa).
- La cabeza MTP anade 314 MB al checkpoint receptor; el modelo base Qwen3.8-27B cuantizado a 4-bit ocupa aproximadamente 14-16 GB (estimacion, no confirmada por el autor).
- Memoria total necesaria: la del modelo base cuantizado mas la cabeza, mas overhead de oMLX. Con 128 GB hay margen amplio; en Macs con 32 GB o 64 GB deberia caber, pero no hay datos publicados.
- Despliegue recomendado: oMLX (unico stack que usa la cabeza). mlx_vlm funciona pero ignora la cabeza. mlx_lm no es compatible (produce salida corrupta).
- Latencia: en el modelo denso, el tiempo de backbone por paso es 33,8 ms y el de verificacion MTP es 27,8 ms; en el MoE, 9,5 ms y 10,2 ms respectivamente.

## Comparativa con modelos similares

| Metodo | Tipo | Speedup en codigo | Compatibilidad | Licencia |
|---|---|---|---|---|
| KaedeTai/mlx-mtp-graft | Cabeza MTP injertable | 2,18× (dense 27B) | oMLX, mlx_vlm | Apache-2.0 |
| MTPLX (youssofal/MTPLX) | Framework para crear modelos MTP en MLX | "3x faster" (segun repo) | MLX, incluye entrenamiento de adaptador | no disponible |
| DFlash2 (mencionado en la model card) | Decodificacion especulativa por difusion de bloques | 142 tok/s denso -> 19-28 tok/s con draft (empeora) | no disponible | no disponible |

La comparativa se basa en datos publicados por el autor. MTPLX es un proyecto complementario que permite generar modelos MTP desde cero, mientras que este repo ofrece una cabeza ya entrenada para un modelo especifico. DFlash2 se menciona como alternativa que no mejora el rendimiento en el mismo hardware.

## Limitaciones y advertencias

- Incompatibilidad con `mlx_lm`: cualquier checkpoint que contenga tensores MTP produce salida corrupta bajo `mlx_lm.load`, sin error ni advertencia. Se recomienda conservar una copia sin injertar si se necesita esa via.
- La salida no es bit-reproducible con MTP activado: en temperatura 0, textos creativos pueden divergir a partir de un token (p. ej. prosa china con similitud 0,663). Textos de baja entropia (codigo, aritmetica) se reproducen exactamente.
- La ganancia de velocidad es fuertemente dependiente del contenido: codigo ~2,2×, prosa china ~1,4×, otros idiomas no medidos.
- En modelos MoE (p. ej. BigBang 35B-A3B) el injerto no aporta mejora de throughput (101-108 tok/s con y sin cabeza) y anade 475 MB de peso; no es danino pero es inutil.
- No se redistribuyen los pesos base; el usuario debe tener un checkpoint receptor compatible (mismo `hidden_size`, `vocab_size`, etc.).
- No hay datos sobre sesgos, alucinacion o calidad de generacion del modelo base; la cabeza solo acelera, no modifica el comportamiento del modelo.
- La licencia Apache-2.0 cubre la cabeza y la herramienta, pero el uso del modelo base Qwen3.8-27B esta sujeto a su propia licencia (Apache-2.0 segun el repo de HuggingFace, pero conviene verificarlo).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/KaedeTai/mlx-mtp-graft
- Proyecto MTPLX (framework relacionado): https://github.com/youssofal/mtplx
- Web de MTPLX: https://www.mtplx.com/
- Guia de MTP de unsloth: https://unsloth.ai/docs/models/mtp
- Otro proyecto del autor (sovits-mlx): https://github.com/KaedeTai/sovits-mlx
- Otro modelo del autor (VisionPsy-Nano-460M-MLX): https://huggingface.co/KaedeTai/VisionPsy-Nano-460M-MLX

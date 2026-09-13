# AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-Text-NVFP4-MTP-XS

## Resumen

Qwen3.6-27B-AEON-Ultimate-Uncensored-Text-NVFP4-MTP-XS es una cuantizacion NVFP4 del modelo AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-BF16, publicada por el usuario AEON-7. Se trata de un derivado "abliterated" (sin censura) de la familia Qwen3.6, con torre de vision eliminada, orientado exclusivamente a generacion de texto. Su rasgo distintivo es una cuantizacion mixta deliberada: las proyecciones matriciales de GatedDeltaNet bajan a NVFP4, mientras que el kernel `linear_attn.conv1d` y los vectores de estado del SSM se preservan en BF16 para no degradar la recurrencia en contextos largos.

El modelo sigue una arquitectura hibrida de atencion (etiquetas `hybrid-attention`, `mamba`, `gated-deltanet`), en la linea de los disenos que combinan capas de atencion clasica con capas de estado recurrente para reducir el coste de inferencia en secuencias largas. Incorpora una cabeza MTP (multi-token prediction) injertada desde el modelo base y verificada bit a bit, lo que habilita decodificacion especulativa. El objetivo del autor es ofrecer una version de huella reducida que quepa en GPUs consumer Blackwell de 24-32 GB (RTX 5090), con unos 21 GB de VRAM en tiempo de ejecucion frente a los ~27 GB de la variante regular.

La relevancia de esta ficha es doble: por un lado ilustra una practica de cuantizacion selectiva por capas criticas; por otro, el propio autor ha marcado el modelo como obsoleto ("superseded") en favor de Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-NVFP4-MIXED, por lo que su interes es principalmente historico y de referencia metodologica. Los pesos ocupan 15.145.419.776 parametros segun safetensors, pese a la nomenclatura comercial "27B".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con atencion lineal/SSM: GatedDeltaNet + Mamba (etiquetas `hybrid-attention`, `gated-deltanet`, `mamba`, `qwen3_5`) |
| Parametros totales | 15.145.419.776 (~15,1 B) segun safetensors; la nomenclatura comercial indica 27B |
| Parametros activos | no aplica (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (proyecciones GDN) + BF16 preservado (`linear_attn.conv1d`, vectores de estado SSM `A_log`, `dt_bias`, `norm.weight`, cabeza MTP) |
| Idiomas soportados | en, zh, multilingue |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compatible con transformers) |

## Arquitectura y entrenamiento

La informacion disponible no detalla el proceso de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF/DPO), ya que se trata de un derivado cuantizado de un modelo base publicado por separado. Lo que si se especifica es la arquitectura: un diseno hibrido con mecanismos de atencion lineal basados en GatedDeltaNet y componentes tipo Mamba, junto con atencion clasica. La parte GatedDeltaNet incluye `linear_attn.conv1d`, una convolucion 1D critica para la recurrencia del SSM, y vectores de estado (`A_log`, `dt_bias`) que el autor preserva en BF16 por motivos de estabilidad numerica.

La innovacion tecnica principal de esta publicacion es la receta de cuantizacion, adaptada de la serie Qwen3.6-27B-NVFP4-MTP de sakamakismile. Se cuantizan a NVFP4 las proyecciones `in_proj_qkv`, `in_proj_z`, `in_proj_a/b` y `out_proj` (que pasan de ~11 GB a ~3 GB), mientras que `linear_attn.conv1d` y el estado del SSM permanecen en BF16. El autor justifica la decision indicando que FP4 sobre `conv1d` provoca deriva observable en inferencia de contexto largo, mientras que las proyecciones son matmuls limitadas por ancho de banda donde FP4 rinde bien. Adicionalmente se injerta una cabeza MTP en bf16 desde el modelo base, verificada bit a bit, que permite decodificacion especulativa. La torre de vision del modelo base se elimina por completo.

## Capacidades

- Generacion de texto y conversacion multi-turno en ingles, chino y otros idiomas (etiqueta `multilingual`).
- Razonamiento con modos diferenciados: el material proporcionado menciona explicitamente configuraciones con "thinking on" y "thinking off".
- Decodificacion especulativa mediante cabeza MTP injertada, y soporte de decodificacion especulativa DFlash como alternativa.
- Modelo "abliterated"/"uncensored": se ha eliminado el comportamiento de rechazo del modelo base, orientado a uso sin filtros.
- Capacidad de tool calling / function calling: no confirmada explicitamente en la informacion disponible.
- Capacidades de agente y razonamiento multi-paso: no confirmadas explicitamente, aunque existen referencias a un fichero `AGENTS.md` en el repositorio de despliegue.
- Vision: no soportada. La torre de vision fue eliminada del modelo base (etiqueta `text-only`).
- Audio: no soportado segun la informacion disponible.

## Casos de uso

- Inferencia local en GPU consumer: con ~21 GB de VRAM en tiempo de ejecucion, esta variante esta pensada para RTX 5090 y tarjetas de 24-32 GB donde la version regular de ~27 GB no deja margen para cache KV. Se usaria como asistente local sin conexion a APIs externas.
- Despliegue en estaciones de trabajo con Blackwell: el autor cita RTX PRO 6000, B100 y B200 (sm_100/sm_120) como plataformas objetivo, aprovechando el soporte nativo de NVFP4 en hardware Blackwell.
- Generacion de texto de alto rendimiento en DGX Spark / GB10: con la imagen v3 y decodificacion DFlash se miden 38,5 tok/s de mediana y 71,3 tok/s de pico, lo que lo hace adecuado para servir cargas interactivas en un unico nodo compacto.
- Investigacion sobre cuantizacion selectiva: sirve como caso de estudio reproducible de que capas toleran FP4 y cuales conviene preservar en BF16 en arquitecturas hibridas SSM/atencion.
- Experimentacion con decodificacion especulativa: el injerto de la cabeza MTP permite comparar el rendimiento de estrategias MTP frente a DFlash en la misma familia de pesos.
- Aplicaciones de texto sin requisitos de moderacion: dado su caracter uncensored y abliterated, encaja en entornos de investigacion y generacion creativa donde los filtros estandar son un obstaculo.
- Sustituir la variante regular en GPUs de 24 GB: cualquier pipeline ya escrito para Qwen3.6-27B-AEON-Ultimate-Uncensored-Text-NVFP4-MTP puede migrarse a este XS para liberar unos 6 GB de VRAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor solo reporta mediciones de throughput en DGX Spark con la imagen v3 y decodificacion especulativa DFlash:

| Configuracion | tok/s mediana | tok/s pico | Modo |
|---|---|---|---|
| XS + DFlash spec decode, imagen v3 | 38,5 | 71,3 | thinking on |
| XS + DFlash spec decode, imagen v3 | 38,1 | 68,4 | thinking off |

Segun la model card, esta configuracion supone una mejora del +17 % al +26 % frente a la produccion anterior (`-NVFP4` con DFlash antiguo e imagen v2.1). El autor indica que se trata de la configuracion de mayor throughput medida en Spark hasta la fecha.

## Requisitos de hardware

- VRAM en tiempo de ejecucion: ~21 GB para la variante XS (frente a ~27 GB de la variante regular).
- Espacio en disco: ~20 GB para XS (frente a ~26 GB de la variante regular).
- GPUs objetivo declaradas: RTX 5090 (etiquetas `rtx-5090`, `24gb`), RTX PRO 6000 (`32gb`), B100 y B200 (`sm_100`), DGX Spark / GB10. Se requiere hardware Blackwell con soporte NVFP4 (`sm_120` para consumer, `sm_100` para datacenter).
- GPU consumer: si, cabe en RTX 5090 (24 GB) y en tarjetas de 32 GB. El autor recomienda explicitamente esta variante para el rango de 24-32 GB.
- Opciones de despliegue: vLLM mediante los contenedores oficiales `ghcr.io/aeon-7/aeon-vllm-ultimate:latest` (Spark / GB10) y `ghcr.io/aeon-7/aeon-vllm-ultimate-rtx:latest` (RTX discreta), o `ghcr.io/aeon-7/vllm-aeon-ultimate-dflash:qwen36-v3` para la configuracion con decodificacion DFlash. No se menciona soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: 38,5 tok/s de mediana y 71,3 tok/s de pico en DGX Spark con thinking activado; 38,1 / 68,4 con thinking desactivado.

## Comparativa con modelos similares

| Modelo | Parametros | Disco | VRAM runtime | `conv1d` | Vision | Licencia |
|---|---|---|---|---|---|---|
| Este modelo (XS) | 15,1 B (base) | ~20 GB | ~21 GB | BF16 preservado | eliminada | apache-2.0 |
| AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-Text-NVFP4-MTP (regular) | 15,1 B (base) | ~26 GB | ~27 GB | BF16 preservado | eliminada | apache-2.0 |
| sakamakismile/Qwen3.6-27B-Text-NVFP4-MTP | no disponible | no disponible | no disponible | BF16 preservado (receta original) | no disponible | no disponible |
| AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-NVFP4-MIXED (sucesor) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

Diferencias clave: el XS se distingue de la variante regular unicamente por cuantizar a NVFP4 las proyecciones de `linear_attn` (unos 8 GB menos de pesos), manteniendo en ambos casos `conv1d` y el estado del SSM en BF16. El autor posiciona el sucesor Qwen3.8 como "muy superior en capacidad", con una metodologia de cuantizacion mixta NVFP4 + FP8 mas refinada.

## Limitaciones y advertencias

- Modelo marcado como obsoleto por su propio autor: la model card recomienda usar Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-NVFP4-MIXED para trabajo nuevo. Esta ficha se mantiene por razones historicas y de compatibilidad con despliegues existentes.
- Modelo abliterated/uncensored: no aplica filtros de rechazo, por lo que puede generar contenido inapropiado, ofensivo o peligroso sin salvaguardas. Requiere evaluacion y contencion externa en produccion.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad factual ni de calibracion para esta cuantizacion.
- Deriva en contexto largo: el autor documenta que cuantizar `conv1d` a FP4 provoca inestabilidad en la recurrencia con contextos largos; la solucion adoptada preserva esa capa en BF16, pero no se cuantifica el impacto residual de cuantizar el resto de proyecciones del SSM.
- Discrepancia de nomenclatura: el nombre comercial indica 27B, mientras que el recuento real de parametros safetensors es de 15,14 B. Conviene verificar antes de dimensionar recursos.
- Longitud de contexto no documentada en la informacion disponible, lo que impide garantizar el comportamiento en ventanas extensas.
- Requiere hardware Blackwell con soporte NVFP4; no es desplegable en GPUs Ampere o Ada sin conversion previa de pesos.
- Idiomas: aunque la etiqueta es multilingue, solo se declaran explicitamente ingles y chino.
- Licencia apache-2.0: permite uso comercial, pero al ser un derivado de Qwen conviene revisar las condiciones de la licencia del modelo base original.
- Dependencia de infraestructura propietaria: las recetas de despliegue y los benchmarks remiten a repositorios e imagenes de contenedor del propio autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-Text-NVFP4-MTP-XS
- Modelo base BF16: https://huggingface.co/AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-BF16
- Variante regular (no XS): https://huggingface.co/AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-Text-NVFP4-MTP
- Sucesor recomendado: https://huggingface.co/AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-NVFP4-MIXED
- Receta de referencia de sakamakismile: https://huggingface.co/sakamakismile/Qwen3.6-27B-Text-NVFP4-MTP
- Repositorio de despliegue, configuracion y benchmarks: https://github.com/AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-DFlash
- Contenedor Spark / GB10: ghcr.io/aeon-7/aeon-vllm-ultimate:latest
- Contenedor RTX discreta: ghcr.io/aeon-7/aeon-vllm-ultimate-rtx:latest
- Contenedor con decodificacion DFlash: ghcr.io/aeon-7/vllm-aeon-ultimate-dflash:qwen36-v3
- No se han encontrado otros enlaces relevantes en la busqueda web realizada.

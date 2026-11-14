# jfrick/malama-base-checkpoint-85b

## Resumen

Malama Base es un modelo de lenguaje de 0,96 mil millones de parametros (960M) con una arquitectura hibrida que combina Kimi Delta Attention (KDA) y atencion completa. El checkpoint publicado en este repositorio, `jfrick/malama-base-checkpoint-85b`, no es un modelo listo para inferencia, sino un checkpoint intermedio de entrenamiento tomado a los 84.824.555.520 tokens (aproximadamente 84,8B), justo antes de que comenzara la fase de decaimiento del learning rate hacia los 100B tokens.

El autor del repositorio es `jfrick`, si bien el codigo de entrenamiento referenciado pertenece al proyecto `koogle/lm-exploration` (rama `training/hybrid/`). El checkpoint esta pensado como punto de bifurcacion para experimentos de midtraining: desde aqui se puede lanzar un decaimiento propio con datos distintos (por ejemplo, codigo con fill-in-the-middle) y comparar contra la curva de decaimiento original, que actua como control.

Por tanto, su relevancia es fundamentalmente para investigadores que quieran reproducir o ramificar el entrenamiento, no para despliegue en produccion. Incluye pesos en fp32, estado de los optimizadores Muon y AdamW, cursores de datos por fuente, estado del RNG, configuracion del run y hashes SHA-256 de los ficheros fuente del trainer. El repositorio ocupa 8,6 GB en un unico fichero PyTorch pickle (`step-000080895.pt`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: Kimi Delta Attention (KDA) + atencion completa |
| Parametros totales | 0,96B (960M) |
| Parametros activos | no disponible (no es MoE segun la informacion proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint en fp32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch pickle (`.pt`), fp32; no safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura es un transformer hibrido que intercala capas con Kimi Delta Attention (una variante de atencion lineal con estado recurrente delta) y capas con atencion completa. Esta combinacion busca reducir el coste computacional y de memoria de la atencion clasica manteniendo la calidad en tareas que requieren recuperacion precisa de contexto largo. El modelo tiene 0,96B parametros e incluye una cabeza de multi-token prediction (MTP), que predice varios tokens futuros por paso y suele usarse como objetivo auxiliar de entrenamiento.

El entrenamiento se realizo con el run `kda-960m-foundation-20261110-01` (sesion `pretrain-a6-s03`) usando el codigo de `koogle/lm-exploration` en el commit `a5c0d47`. El checkpoint corresponde al step 80.895, con 84.824.555.520 tokens consumidos y una perdida de entrenamiento de 2,07 (media de 500 steps). El learning rate estaba en su fase constante (peak); el decaimiento comienza a los 85B tokens y se extiende hasta los 100B. El estado guardado incluye optimizadores Muon y AdamW, cursores de datos por fuente y hashes de los ficheros del trainer, lo que permite reanudar el entrenamiento de forma determinista solo si los ficheros fuente coinciden con los hashes almacenados. No se detalla la composicion del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto autoregresiva (modelo base, sin fine-tuning instruccional conocido).
- Razonamiento y modelado de lenguaje general, derivado del preentrenamiento a gran escala.
- Prediccion multi-token mediante la cabeza MTP incluida en el checkpoint.
- Capacidad potencial de reanudar entrenamiento con estado de optimizador y cursores de datos intactos.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-step: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Investigacion en arquitecturas hibridas: comparar el rendimiento de KDA + atencion completa frente a transformers densos de tamano similar en tareas de modelado de lenguaje.
- Midtraining con datos propios: ramificar desde este checkpoint y ejecutar un decaimiento del learning rate con datos de dominio (por ejemplo, codigo con fill-in-the-middle) para estudiar el efecto en la calidad final.
- Reproducibilidad de experimentos: usar el estado de optimizador, cursores de datos y hashes del trainer para reanudar exactamente el run original y validar resultados.
- Estudio de objetivos auxiliares: analizar el impacto de la cabeza de multi-token prediction en la convergencia y en la calidad del modelo.
- Formacion y docencia: servir como ejemplo practico de gestion de checkpoints intermedios, hashes de codigo y estado de entrenamiento en pipelines de preentrenamiento.
- Base para fine-tuning posterior: partir de los pesos base (una vez extraidos del pickle) para tareas downstream especificas, siempre que se valide la calidad del checkpoint intermedio.
- Analisis de eficiencia computacional: medir throughput y memoria de la atencion lineal KDA frente a atencion completa en GPUs de distinta generacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma fiable; los pesos en fp32 de un modelo de 0,96B ocupan aproximadamente 3,8 GB, pero el fichero de 8,6 GB incluye tambien estado de optimizador y metadatos.
- GPU recomendadas: no disponible.
- Cabe en GPU consumer: probablemente si en GPUs con 8-16 GB de VRAM una vez extraidos y convertidos los pesos, pero no hay datos confirmados.
- Opciones de despliegue: no disponible; el checkpoint no esta en formato GGUF ni safetensors y requiere conversion previa. El repositorio solo documenta carga via `torch.load` y reanudacion con `model_hybrid.train`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de modelos comparables ni resultados de benchmarks que permitan una comparacion rigurosa con alternativas de tamano similar.

## Limitaciones y advertencias

- El fichero es un PyTorch pickle: cargarlo con `weights_only=False` ejecuta codigo arbitrario, por lo que solo debe hacerse en un entorno controlado y de confianza.
- No es un modelo listo para produccion: es un checkpoint intermedio antes del decaimiento del learning rate, por lo que su calidad final es inferior a la del modelo tras 100B tokens.
- Licencia no especificada: no hay autorizacion explicita para uso comercial ni para redistribucion.
- Idiomas y contexto no documentados: no se puede garantizar comportamiento multilingue ni una ventana de contexto concreta.
- Riesgo de alucinacion: inherente a un modelo base sin alineacion; no hay datos sobre RLHF o DPO.
- Sesgos: no disponible; no se describe la composicion del dataset de entrenamiento.
- Reanudacion restringida: el trainer rechaza reanudar si los ficheros fuente no coinciden con los hashes almacenados, lo que limita modificaciones del codigo.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jfrick/malama-base-checkpoint-85b
- Codigo de entrenamiento: https://github.com/koogle/lm-exploration (commit `a5c0d47`, directorio `training/hybrid/`)
- Repositorio del modelo base (mencionado en la model card): no disponible como URL directa en la informacion proporcionada.

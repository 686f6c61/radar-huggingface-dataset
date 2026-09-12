# jini-yang/tc3r_forcasting_ckpt

## Resumen

`jini-yang/tc3r_forcasting_ckpt` es un repositorio de checkpoints de investigación, no un modelo listo para usar. Contiene los pesos resultantes de un entrenamiento de *flow matching* que convierte TrackCraft3R —un modelo construido sobre Wan2.1-T2V-1.3B— en un predictor de trayectorias 3D. El autor lo publica como material de reproducibilidad del entrenamiento ejecutado en el clúster Isambard, con todos los pasos (steps) de cada ejecución (*run*), no solo el checkpoint final.

La relevancia del repositorio es metodológica más que de producto: documenta y verifica una técnica de deduplicación de checkpoints. El entrenamiento congela por completo el DiT base y solo optimiza los adaptadores PlainLoRA (`A`/`B`), el `injector` y el `mask_head`, de modo que el autor puede publicar únicamente los tensores aprendidos (0,18 GB por step) en lugar del estado completo con optimizador (3,17 GB por step). La verificación se apoya en que los tensores restantes son byte a byte idénticos al release oficial de TrackCraft3R.

No hay model card con especificaciones de arquitectura, licencia, idiomas ni benchmarks: la información disponible se limita a la estructura de directorios, la justificación de la deduplicación y un fragmento de código para cargar los ficheros `dedup`. El tamaño total del repositorio es de 108,8 GB, coherente con almacenar múltiples ejecuciones y múltiples steps.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) con flow matching, derivada de Wan2.1-T2V-1.3B; el modelo base TrackCraft3R se reutiliza como predictor de trayectorias 3D. Adaptadores PlainLoRA inyectados en la atención, mas `injector` y `mask_head` |
| Parametros totales | no disponible (el modelo base es Wan2.1-T2V-1.3B, ~1,3 mil millones de parametros; el repositorio no declara el total tras el injerto de LoRA) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de difusion/flow sobre video; se citan parametros de entrenamiento `history_len` y `total_len`, sin valores publicados) |
| Tipos de cuantizacion | no disponible (no se ofrecen variantes cuantizadas; los pesos se publican en precision de entrenamiento) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; el condicionamiento de texto heredado de Wan2.1 no se documenta en este repositorio) |
| Licencia | no disponible en la model card. Nota: el modelo base Wan2.1-T2V-1.3B se distribuye habitualmente bajo Apache-2.0, pero esta ficha no puede confirmar que la licencia se aplique a estos checkpoints derivados |
| Formato de pesos | `.pt` (checkpoint completo con estado del optimizador, 3,17 GB) y `.safetensors` (solo tensores aprendidos: LoRA `A`/`B`, `injector`, `mask_head`; 0,18 GB) |
| Tamano del repositorio | 108,8 GB |
| Fecha de creacion | 2026-09-12 |
| Fecha de actualizacion | 2026-09-12 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El repositorio parte de TrackCraft3R, una adaptación de Wan2.1-T2V-1.3B —un transformer de difusion para generacion de video— reconvertida en predictor de trayectorias 3D. Sobre ese DiT se inyectan adaptadores PlainLoRA en los modulos de atencion, junto con un `injector` y un `mask_head`. El entrenamiento es de tipo *flow matching*: el script `scripts/train_forecast_flow_delta.py` congela integramente el DiT y coloca en el optimizador unicamente los parametros de PlainLoRA (`A` y `B`), el `injector` y el `mask_head`. No se documentan en la model card el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO, por lo que esos datos no estan disponibles.

La innovacion tecnica destacable es la estrategia de deduplicacion de checkpoints, verificada empiricamente por el autor. El argumento tiene tres partes: (1) `base.base_layer.*` y `base.lora_*.default` son byte a byte identicos al `model.safetensors` del release oficial de TrackCraft3R (comprobado sobre 3 ejecuciones y 960 tensores, con 0 discrepancias); (2) las rutas `base.lora_*.forecast` tienen la matriz `B` inicializada a cero por PEFT y congelada por el entrenador, de modo que su contribucion en la propagacion directa es siempre nula (720 modulos verificados con `B=0`); y (3) el estado `opt` solo es necesario para reanudar el entrenamiento. El script `scripts/verify_dedup_cpu.py` confirma que las 300 capas `forecast_B` nuevas son cero y que la salida de 240 modulos es bit a bit identica a la del checkpoint original.

## Capacidades

- Prediccion de trayectorias 3D: el modelo se ha reconvertido especificamente para forecasting de trayectorias en 3D a partir de historial, segun describe el autor.
- Aprendizaje por flow matching sobre un backbone de difusion de video (Wan2.1-T2V-1.3B), con condicionamiento heredado de ese modelo.
- Reanudacion de entrenamiento: los ficheros `full/<run>/flow_stepN.pt` incluyen el estado del optimizador y permiten continuar el entrenamiento.
- Inferencia y evaluacion con pesos reducidos: los ficheros `dedup/<run>/flow_stepN.safetensors` bastan para evaluacion, cargando los deltas sobre el release oficial.
- Inspeccion del historial de entrenamiento: se publican todas las ejecuciones y todos los steps, lo que permite analisis de curvas de aprendizaje.
- No hay evidencia en la informacion disponible de soporte de *tool calling*, capacidades de agente, razonamiento multi-paso, vision de proposito general, audio ni modo *thinking*.

## Casos de uso

- Reproduccion de experimentos de forecasting 3D: el repositorio permite a un equipo de investigacion cargar cualquiera de los steps publicados y replicar la curva de evaluacion del autor, ya que se incluye el historial completo y no solo el checkpoint final.
- Reanudacion de entrenamientos interrumpidos: los ficheros `full/*.pt` (3,17 GB) llevan el estado del optimizador, de modo que un entrenamiento en un cluster puede retomarse exactamente en el step guardado sin recalcular el estado de Adam.
- Investigacion sobre deduplicacion de checkpoints: el caso sirve como referencia metodologica para publicar releases mas ligeros, apoyandose en la verificacion de que los tensores no aprendidos son identicos al modelo base.
- Evaluacion comparativa de variantes de adaptadores: al publicarse varias ejecuciones (`3 runs`) y multiples steps, se pueden comparar configuraciones de entrenamiento bajo el mismo backbone congelado.
- Integracion en pipelines de investigacion sobre modelos de mundo: la salida de forecasting sobre trayectorias 3D encaja en experimentos de prediccion de dinamica para video o robotica, siempre que se construya el pipeline de Wan2.1 por separado.
- Auditoria de integridad de pesos: los scripts de verificacion (`verify_dedup_cpu.py`) permiten a un tercero comprobar que los deltas publicados se comportan de forma identica al checkpoint completo, util en revisiones de artefactos de investigacion.
- Base para ajuste fino posterior: los deltas LoRA publicados pueden actuar como punto de partida para nuevos entrenamientos sobre TrackCraft3R sin necesidad de reentrenar desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de error de trayectoria, comparaciones con otros predictores ni resultados de evaluacion de ningun tipo.

## Requisitos de hardware

- VRAM estimada para inferencia: la model card no la declara. Como referencia, el checkpoint completo con optimizador ocupa 3,17 GB en disco y los deltas 0,18 GB; la inferencia requiere ademas el `model.safetensors` oficial de TrackCraft3R. Cualquier cifra de VRAM seria una estimacion no confirmada por el autor.
- GPU recomendadas: no disponible. No se documenta hardware de entrenamiento ni de inferencia, solo que el entrenamiento se ejecuto en Isambard (clúster de supercomputacion del Reino Unido).
- GPU de consumo: no confirmado. Dado que el backbone base es de ~1,3 mil millones de parametros, es plausible que quepa en GPU de consumo con suficiente VRAM, pero no hay dato publicado que lo respalde.
- Opciones de despliegue: el unico camino documentado es PyTorch, cargando el release oficial de TrackCraft3R y aplicando despues los deltas mediante `PlainLoRA` e `injector.load_state_dict(...)`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, y no serian aplicables al no ser un modelo de lenguaje ni publicarse en GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este checkpoint, por lo que la comparacion se limita a aspectos estructurales.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `jini-yang/tc3r_forcasting_ckpt` | no disponible (base Wan2.1-T2V-1.3B, ~1,3B) | no disponible (parametros `history_len`/`total_len` sin valores) | no disponible | Publico en HuggingFace; requiere el release oficial de TrackCraft3R para funcionar |
| Wan2.1-T2V-1.3B (modelo base) | ~1,3 mil millones | no aplica (modelo de generacion de video) | Apache-2.0 (segun su distribucion habitual) | Publico |
| TrackCraft3R (modelo de partida) | no disponible | no disponible | no disponible | Release oficial referenciado por el autor, no enlazado en esta ficha |
| Otros predictores de trayectoria 3D | no disponible | no disponible | no disponible | no disponible |

El codigo de entrenamiento (`sheep1283/TrackCraft3R_forcasting`) se declara privado, lo que limita la comparabilidad con alternativas.

## Limitaciones y advertencias

- No es un modelo utilizable de forma autonoma: es un conjunto de checkpoints de investigacion que exige el `model.safetensors` oficial de TrackCraft3R y codigo no publico (`sheep1283/TrackCraft3R_forcasting`, privado) para reconstruir el pipeline.
- Licencia no declarada: no se puede confirmar si se permite uso comercial. La licencia del modelo base no queda necesariamente heredada por estos pesos derivados, y el repositorio no incluye terminos de uso.
- Ausencia total de documentacion de evaluacion: sin benchmarks, sin metricas de error de trayectoria y sin comparaciones, no es posible estimar la calidad del forecasting.
- Riesgo de alucinacion: no evaluado en la informacion disponible. Al tratarse de generacion sobre un backbone de difusion, las predicciones de trayectoria pueden ser plausibles pero fisicamente inconsistentes; no hay validacion publicada.
- Sesgos: no documentados. No se describe la composicion del dataset de entrenamiento, por lo que no se puede evaluar el sesgo de dominio ni la generalizacion fuera de la distribucion de entrenamiento.
- Idiomas y contexto: sin datos. Al no ser un modelo de lenguaje, el termino "contexto" se refiere aqui a la ventana de frames (`history_len`, `total_len`), cuyos valores concretos no se publican.
- Los ficheros `dedup` no permiten reanudar entrenamiento: solo sirven para inferencia y evaluacion. Para reanudar hay que usar `full/*.pt`.
- Advertencia de integridad: los deltas `dedup` son seguros unicamente si se aplican sobre la version exacta del release oficial de TrackCraft3R contra la que se verificaron. Cualquier otra revision del modelo base invalida la comprobacion de identidad byte a byte.
- El repositorio ocupa 108,8 GB, con implicaciones de almacenamiento y ancho de banda para quien quiera descargarlo completo.
- Fechas de creacion y actualizacion registradas como 2026-09-12, sin historial de revisiones posteriores.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jini-yang/tc3r_forcasting_ckpt
- Codigo de entrenamiento referenciado por el autor: `sheep1283/TrackCraft3R_forcasting` (privado, sin URL publica en la model card)
- Modelo base: Wan2.1-T2V-1.3B (Wan-AI, repositorio oficial no enlazado en la model card)
- Release oficial de TrackCraft3R: referenciado en la model card como origen de `model.safetensors`, sin enlace publicado
- Busqueda web: no se han encontrado enlaces relevantes al modelo. Los resultados devueltos por la busqueda corresponden a foros sin relacion con el contenido tecnico de esta ficha y se han descartado.

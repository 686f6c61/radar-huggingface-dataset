# erdem-erdem/dyn-spec-dflash-mix100k-static-lora-attn-r512-3ep-kl

## Resumen

`dyn-spec-dflash-mix100k-static-lora-attn-r512-3ep-kl` es un checkpoint de entrenamiento de un drafter (modelo borrador) para decodificacion especulativa, publicado por el usuario erdem-erdem en Hugging Face. No es un modelo generativo autonomo: es un adaptador LoRA entrenado para acelerar la inferencia de `Qwen/Qwen3-8B` mediante la tecnica DFlash, un esquema de decodificacion especulativa. El artefacto forma parte del port del generador DFlash del proyecto dyn-spec y se corresponde con la rama `fresh_lora` en etapa de pretraining.

El repositorio contiene el estado completo del entrenamiento (checkpoint con estado del optimizador), resultados de validacion, evaluaciones offline y trazabilidad de procedencia. El autor advierte explicitamente de que no se trata de un paquete listo para servir: el export de serving de DFlash aun no se ha portado, por lo que el checkpoint no puede desplegarse directamente en produccion tal cual.

La relevancia de este artefacto es acotada y muy tecnica: sirve como material de reproducibilidad e investigacion para quienes trabajen en decodificacion especulativa con LoRA sobre Qwen3-8B. El modelo base sobre el que opera es Qwen3-8B, y el drafter de partida es `z-lab/Qwen3-8B-DFlash-b16`. El repo ocupa 0,5 GB y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre drafter DFlash (decodificacion especulativa); modelo objetivo Qwen3-8B |
| Parametros totales | no disponible (rango LoRA r=512 indicado en el nombre; recuento exacto no publicado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `checkpoint.pt` (PyTorch, con estado del optimizador); no es un bundle de serving |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 512 aplicado sobre las capas de atencion del drafter `z-lab/Qwen3-8B-DFlash-b16`, que a su vez actua como modelo borrador para decodificacion especulativa sobre el modelo objetivo `Qwen/Qwen3-8B`. La rama de entrenamiento es `fresh_lora` en etapa de pretraining, con 16.667 updates, semilla 42 y un dataset de mezcla de 100.000 ejemplos (`mix100k`). El nombre del run indica 3 epocas y una componente de regularizacion KL.

El entrenamiento se realizo con el generador DFlash del proyecto dyn-spec, e incluye en el repositorio el comando de entrenamiento (`train_command.txt`), un parche (`speculators.patch`), registros de tiempos, metricas y procedencia del almacen de activaciones (identidad del store, registro del extractor, procedencia del lanzamiento de vLLM y registros de relleno). El checkpoint incluye estado del optimizador, lo que permite reanudar el entrenamiento. No se documentan en la informacion disponible el numero total de tokens procesados, la composicion detallada del dataset ni si hubo fases de RLHF o DPO.

## Capacidades

- Aceleracion de inferencia mediante decodificacion especulativa: actua como drafter que propone tokens candidatos que el modelo objetivo Qwen3-8B verifica.
- Entrenamiento reanudable: el checkpoint incluye estado del optimizador.
- Reproducibilidad: incluye comando de entrenamiento, parche, metricas, tiempos y trazabilidad completa de procedencia.
- Evaluacion offline: el repositorio incorpora resultados de reproduccion, coeficientes M4, donantes M7, similitud D13 y coste D14 con metricas por fila.
- No es un modelo de proposito general: no genera texto de forma autonoma, no soporta tool calling ni agentes por si mismo, y no tiene capacidades multilingues propias documentadas.

## Casos de uso

- Investigacion en decodificacion especulativa: el checkpoint permite reproducir el run `fresh_lora` con semilla 42 y comparar la evolucion de la tasa de aceptacion del drafter frente al estado inicial (update 0).
- Reanudacion de entrenamiento: al incluir estado del optimizador y el comando exacto, un equipo puede continuar el pretraining desde el update 16.667 sin reconstruir el pipeline.
- Auditoria de procedencia: los registros de identidad del store de activaciones y del lanzamiento de vLLM permiten verificar que los datos de entrenamiento corresponden a la configuracion declarada.
- Base para portar el export de serving: el autor indica que el export DFlash aun no esta portado, por lo que este checkpoint sirve como punto de partida para desarrollar ese export.
- Analisis de la regularizacion KL: la variante `kl` del run permite estudiar el efecto de esta componente sobre la calidad del drafter comparando con otras variantes del proyecto dyn-spec.
- Evaluacion de tecnicas LoRA de alto rango: con r=512 sobre atencion, sirve para medir el equilibrio entre capacidad del adaptador y coste de entrenamiento en tareas de drafting.

## Benchmarks y rendimiento

Los unicos datos publicados son las metricas de validacion interna sobre 200 filas fijas (una fila por LoRA, `full_acc`):

| Update | Score | τ (eal) | chat | code | math | stem |
|---|---|---|---|---|---|---|
| 0 | 0.5265 | 7.703 | 0.3463 | 0.5956 | 0.6775 | 0.4866 |
| 16667 | 0.5380 | 7.972 | 0.3553 | 0.6113 | 0.6876 | 0.4977 |

El entrenamiento mejora el score de 0,5265 a 0,5380 y la longitud media de aceptacion (τ) de 7,703 a 7,972. Las mejoras por dominio son moderadas: chat +0,0090, code +0,0157, math +0,0101 y stem +0,0111. No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un drafter sobre Qwen3-8B, el requisito dominante es el del modelo objetivo (aproximadamente 16 GB en FP16 para 8B, sin contar el drafter).
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; depende del modelo objetivo Qwen3-8B, que cabe en GPUs de 24 GB en cuantizacion de 8 bits o inferior.
- Opciones de despliegue: el autor indica que el export de serving DFlash no esta portado, por lo que no hay bundle listo para vLLM, llama.cpp, Ollama o TGI. El repositorio incluye procedencia de un lanzamiento de vLLM, lo que sugiere que el pipeline de entrenamiento uso vLLM para generar activaciones.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| dyn-spec-dflash-mix100k-static-lora-attn-r512-3ep-kl | LoRA drafter DFlash | no disponible (r=512) | no disponible | no disponible | Checkpoint de entrenamiento, no serving |
| z-lab/Qwen3-8B-DFlash-b16 | Drafter DFlash base | no disponible | no disponible | no disponible | Modelo de partida del adaptador |
| Qwen/Qwen3-8B | LLM objetivo | 8B | no disponible | no disponible | Modelo verificado por el drafter |

No se dispone de datos de rendimiento comparables entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo desplegable: el autor advierte de que es un checkpoint de entrenamiento, no un bundle de serving, y que el export DFlash no esta portado.
- Licencia no declarada: no se especifica licencia, lo que impide evaluar su uso comercial.
- Idiomas no declarados: no hay informacion sobre cobertura linguistica.
- Mejora marginal: la ganancia de score es de solo 0,0115 puntos absolutos sobre el estado inicial, y la de τ de 0,269; conviene validar si compensa el coste del adaptador en produccion.
- Riesgo de sobreajuste al conjunto de validacion: las metricas se miden sobre 200 filas fijas, sin conjunto de test independiente documentado.
- Sin descargas ni validacion externa: cero descargas y cero likes en el momento de la consulta, sin evidencia de uso por terceros.
- Dependencia estricta del modelo base: solo es valido con Qwen3-8B y el drafter `z-lab/Qwen3-8B-DFlash-b16` en el commit indicado.
- Sin datos de sesgo ni de alucinacion: al no ser un modelo generativo autonomo, estas metricas no aplican directamente, pero el drafter hereda las caracteristicas del modelo objetivo.

## Enlaces

- Hugging Face: https://huggingface.co/erdem-erdem/dyn-spec-dflash-mix100k-static-lora-attn-r512-3ep-kl
- Drafter base: https://huggingface.co/z-lab/Qwen3-8B-DFlash-b16
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3-8B
- Repositorio dyn-spec: no disponible en la informacion proporcionada
- Paper o blog de DFlash: no disponible en la informacion proporcionada

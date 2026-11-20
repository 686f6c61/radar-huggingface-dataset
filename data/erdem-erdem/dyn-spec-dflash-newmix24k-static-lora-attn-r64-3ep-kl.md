# erdem-erdem/dyn-spec-dflash-newmix24k-static-lora-attn-r64-3ep-kl

## Resumen

`dyn-spec-dflash-newmix24k-static-lora-attn-r64-3ep-kl` es un checkpoint de entrenamiento de un *drafter* de decodificación especulativa (speculative decoding) desarrollado por el usuario erdem-erdem. No es un modelo de lenguaje autónomo, sino un adaptador LoRA entrenado sobre el drafter `z-lab/Qwen3-8B-DFlash-b16` para acelerar la inferencia del modelo objetivo `Qwen/Qwen3-8B`. El nombre del repositorio codifica la configuracion del experimento: mezcla de datos `newmix24k`, LoRA estatico con rango 64 sobre las capas de atencion, 3 epocas y una funcion de perdida con termino KL.

El artefacto pertenece a una linea de trabajo de investigacion sobre *dynamic speculation* (dyn-spec) con el generador DFlash, y se publica como checkpoint intermedio con estado del optimizador, resultados de validacion, evaluaciones offline y trazabilidad completa (provenance). El autor advierte explicitamente de que no es un paquete listo para servir: la exportacion de serving de DFlash aun no se ha portado.

La relevancia de esta publicacion es acotada y muy tecnica: sirve como evidencia reproducible de un experimento de adaptacion de drafters, no como modelo desplegable. Con 0 descargas y 0 likes en el momento de la consulta, y un tamano de repositorio de 0,1 GB, se trata de un artefacto de investigacion mas que de un modelo de uso general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Drafter de decodificacion especulativa basado en DFlash con adaptador LoRA (rango 64, atencion), sobre `z-lab/Qwen3-8B-DFlash-b16` |
| Parametros totales | no disponible (el repositorio contiene un checkpoint de entrenamiento de 0,1 GB, no pesos completos) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `checkpoint.pt` (PyTorch) con estado del optimizador; no es un bundle de serving |
| Modelo objetivo | Qwen/Qwen3-8B |
| Drafter base | `z-lab/Qwen3-8B-DFlash-b16` (commit `9b41424b7109f9c5413454f481b09a82b85333f4`) |
| Brazo / etapa | `fresh_lora` / `pretraining` |
| Actualizaciones de entrenamiento | 4000 |
| Semilla | 42 |
| Git SHA | `b5757cd714b7df14a172afb83b02329603b58026` |
| SHA256 del checkpoint | `615cb934ead6547c27ebb020eaba4cf14baa343a32e639ac2063d12b9eb3d672` |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 64 aplicado sobre las capas de atencion del drafter DFlash `z-lab/Qwen3-8B-DFlash-b16`, que a su vez actua como cabecera de prediccion especulativa para `Qwen/Qwen3-8B`. La decodificacion especulativa consiste en que un modelo pequeno y rapido (el drafter) propone varios tokens candidatos que el modelo objetivo verifica en paralelo, reduciendo el coste por token generado cuando la tasa de aceptacion es alta. DFlash es la variante de drafter empleada en este linaje de experimentos.

El entrenamiento se realizo en la etapa de `pretraining` del brazo `fresh_lora`, con 4000 actualizaciones y semilla 42. El nombre del repositorio indica una mezcla de datos `newmix24k`, LoRA estatico de rango 64 sobre atencion, 3 epocas y una componente de perdida KL. El checkpoint incluye estado del optimizador, lo que permite reanudar el entrenamiento. La validacion se hizo sobre 200 filas fijas, una fila por LoRA, midiendo `full_acc` y la longitud media de aceptacion `τ (eal)`, desglosada por dominio (chat, code, formal, math, roleplay, science). No se dispone de informacion sobre el numero total de tokens de entrenamiento ni sobre la composicion detallada del dataset.

## Capacidades

- Prediccion especulativa de tokens para acelerar la inferencia de `Qwen/Qwen3-8B`; no genera respuestas de forma autonoma.
- Mejora medible de la tasa de aceptacion del drafter: `full_acc` pasa de 0,4447 (update 0) a 0,4555 (update 4000), y `τ (eal)` de 5,987 a 6,220.
- Rendimiento por dominio en validacion (update 4000): chat 0,2815, code 0,5692, formal 0,5150, math 0,6855, roleplay 0,2203, science 0,4615.
- Soporte de tool calling: no disponible (no es una capacidad del drafter).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales: no disponible.

## Casos de uso

- Investigacion en decodificacion especulativa: reproducir el experimento `fresh_lora` con semilla 42 y 4000 actualizaciones para comparar la tasa de aceptacion frente al drafter base sin adaptar.
- Analisis de dominios de aceptacion: usar el desglose por dominio (math 0,6855 frente a roleplay 0,2203) para decidir en que cargas de trabajo conviene desplegar el drafter adaptado y en cuales no aporta.
- Reanudacion de entrenamiento: el checkpoint incluye estado del optimizador, por lo que sirve para continuar el *fine-tuning* desde la actualizacion 4000 con la misma configuracion.
- Auditoria de reproducibilidad: el repositorio incluye `MANIFEST.json` con tamano y SHA256 de cada fichero, `train_command.txt`, `speculators.patch` y `provenance/`, lo que permite verificar la identidad del *activation store* y el lanzamiento de vLLM.
- Estudio de coeficientes y donantes: los resultados en `run/offline_eval/` (reproduccion, coeficientes M4, donantes M7, similitud D13, coste D14) permiten analizar el comportamiento del drafter sin necesidad de servir el modelo.
- Base para un futuro bundle de serving: cuando se porte la exportacion de serving de DFlash, este checkpoint podria convertirse en el punto de partida del drafter adaptado para `Qwen3-8B`.

## Benchmarks y rendimiento

Los unicos datos publicados son los de validacion interna sobre 200 filas fijas (`full_acc` y `τ (eal)`), no benchmarks estandar como MMLU o HumanEval.

| Update | full_acc | τ (eal) | chat | code | formal | math | roleplay | science |
|---|---|---|---|---|---|---|---|---|
| 0 | 0,4447 | 5,987 | 0,2764 | 0,5573 | 0,4909 | 0,6774 | 0,2107 | 0,4554 |
| 4000 | 0,4555 | 6,220 | 0,2815 | 0,5692 | 0,5150 | 0,6855 | 0,2203 | 0,4615 |

No se han publicado resultados de benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio (0,1 GB) contiene un checkpoint de entrenamiento con estado del optimizador, no pesos listos para servir.
- GPU recomendadas: no disponible. El modelo objetivo es `Qwen/Qwen3-8B`, por lo que el despliegue completo requeriria hardware capaz de servir un modelo de 8 mil millones de parametros, pero no se detalla en la informacion disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el autor indica que la exportacion de serving de DFlash no se ha portado; el repositorio incluye provenance de un lanzamiento de vLLM, pero no un bundle servible. No se confirma compatibilidad con vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| dyn-spec-dflash-newmix24k-static-lora-attn-r64-3ep-kl | Checkpoint de drafter LoRA | no disponible | no disponible | no disponible | Publicado, no servible |
| z-lab/Qwen3-8B-DFlash-b16 | Drafter DFlash base | no disponible | no disponible | no disponible | Base del adaptador |
| Qwen/Qwen3-8B | Modelo objetivo | 8B | no disponible en esta ficha | no disponible en esta ficha | Modelo servible |

No se dispone de datos de rendimiento comparables entre estos artefactos en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: es un checkpoint de entrenamiento de un drafter; no puede usarse para generar texto de forma directa.
- No es un bundle de serving: el autor indica explicitamente que la exportacion de serving de DFlash no se ha portado.
- Licencia no disponible: no se puede confirmar el uso comercial ni las condiciones de redistribucion.
- Idiomas no disponibles: no se documenta cobertura linguistica.
- Sesgos conocidos: no disponibles.
- Riesgo de alucinacion: no aplica de forma directa al ser un drafter, pero cualquier token aceptado incorrectamente degrada la salida del modelo objetivo; la tasa de aceptacion varia fuertemente por dominio (roleplay 0,2203 frente a math 0,6855).
- Limitaciones de contexto: no se documenta la ventana de contexto del drafter.
- Trazabilidad: el checkpoint depende de un commit concreto del drafter base (`9b41424b...`) y de la identidad del *activation store* registrada en `provenance/store/`; cambios en esos artefactos invalidan la reproducibilidad.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; artefacto de investigacion sin validacion externa.

## Enlaces

- Hugging Face: https://huggingface.co/erdem-erdem/dyn-spec-dflash-newmix24k-static-lora-attn-r64-3ep-kl
- Drafter base: https://huggingface.co/z-lab/Qwen3-8B-DFlash-b16
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3-8B

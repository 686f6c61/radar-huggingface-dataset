# midas-llm-research/qwen3-8b-dflash-baseline

## Resumen

Qwen3-8B DFlash baseline es un modelo borrador (*draft model*) entrenado por midas-llm-research para decodificacion especulativa sobre el modelo objetivo Qwen3-8B. No es un modelo generativo autonomo: su funcion es proponer bloques de hasta 16 tokens que el modelo objetivo verifica en paralelo, acelerando la inferencia sin alterar la distribucion de salida del modelo grande. Se distribuye con arquitectura DFlash propia (codigo Python incluido en el repositorio) y pesos completos en `model.safetensors`.

El modelo parte de la arquitectura y el codigo de z-lab/Qwen3-8B-DFlash-b16 y ha sido reentrenado como baseline de referencia dentro del proyecto MIDAS. Con 1.048.626.432 parametros (aproximadamente 1,05 mil millones), es un orden de magnitud mas pequeno que el objetivo Qwen3-8B, lo que permite ejecutarlo en la misma GPU con un coste de memoria y computo reducido.

Su relevancia es practica: la decodificacion especulativa es una de las tecnicas mas eficaces para reducir la latencia de decodificacion en LLM, y este repositorio ofrece un borrador ya entrenado y verificado con SGLang 0.5.18 mediante el algoritmo DFLASH. La licencia MIT facilita su integracion en pipelines de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFlash (modelo borrador para decodificacion especulativa), codigo propio en el repositorio |
| Parametros totales | 1.048.626.432 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (hereda el tokenizer del modelo objetivo Qwen3-8B) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`), con `config.json` y ficheros Python de la arquitectura |

## Arquitectura y entrenamiento

El modelo implementa la arquitectura DFlash definida en z-lab/Qwen3-8B-DFlash-b16, cuyo codigo y estructura inicial reutiliza midas-llm-research para producir este baseline entrenado. Se trata de un borrador que predice bloques de 16 tokens (`b16`) que el modelo objetivo Qwen3-8B valida despues; la verificacion paralela garantiza que la salida final coincide con la que produciria el objetivo en decodificacion autoregresiva estandar. El repositorio incluye los ficheros Python con la definicion de la arquitectura, por lo que requiere `--trust-remote-code` en el runtime.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO; tampoco se detalla la innovacion interna de atencion o el mecanismo exacto de prediccion de bloques mas alla de la referencia a DFlash. El unico dato de validacion aportado es que la exportacion se probo con SGLang 0.5.18 usando `--speculative-algorithm DFLASH` y `--speculative-draft-model-path` apuntando a este repositorio.

## Capacidades

- Generacion de tokens candidatos para decodificacion especulativa sobre Qwen3-8B, en bloques de 16 tokens.
- Aceleracion de la inferencia del modelo objetivo sin modificar su distribucion de salida (verificacion por el objetivo).
- Integracion con SGLang 0.5.18 mediante el algoritmo DFLASH y `--trust-remote-code`.
- Uso del tokenizer del modelo objetivo Qwen3-8B (el repositorio no incluye tokenizer propio).
- No soporta tool calling, agentes, vision, audio ni modos de razonamiento de forma autonoma: es un componente auxiliar, no un modelo de proposito general.
- Capacidades multilingues: no disponibles como capacidad propia; dependen del objetivo Qwen3-8B.

## Casos de uso

- Aceleracion de inferencia en produccion: desplegar Qwen3-8B con SGLang y este borrador para reducir la latencia por token en cargas de decodificacion intensiva, manteniendo la calidad del objetivo gracias a la verificacion.
- Servicio de chat de baja latencia: usar el borrador para mejorar el tiempo hasta el primer token efectivo en conversaciones multi-turno servidas con Qwen3-8B.
- Generacion de codigo interactiva: integrar en asistentes de autocompletado o edicion donde la latencia de decodificacion es critica y el modelo objetivo ya es Qwen3-8B.
- Baseline de investigacion: servir como referencia de comparacion para nuevas variantes de borradores DFlash entrenadas por el equipo MIDAS.
- Evaluacion de tecnicas de decodificacion especulativa: medir tasas de aceptacion de tokens y speedup frente a decodificacion autoregresiva estandar con SGLang.
- Despliegue en infraestructura limitada: al ocupar aproximadamente 2,1 GB en safetensors, el borrador anade poca memoria sobre el objetivo y permite acelerar sin cambiar de hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo indica que el modelo fue probado con SGLang 0.5.18, sin cifras de tasa de aceptacion, speedup ni latencia.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,1 GB en safetensors para los pesos del borrador; el consumo real depende del runtime y del modelo objetivo Qwen3-8B, que debe residir en la misma GPU.
- GPU recomendadas: no disponibles de forma especifica; al ser un borrador de aproximadamente 1,05 mil millones de parametros, cabe junto a Qwen3-8B en GPU de clase A100, H100 o similares con suficiente memoria para ambos modelos.
- GPU de consumo: no se especifica compatibilidad; el requisito principal es disponer de memoria suficiente para alojar simultaneamente el objetivo y el borrador.
- Opciones de despliegue: SGLang 0.5.18 con `--speculative-algorithm DFLASH`, `--speculative-draft-model-path` apuntando a este repositorio y `--trust-remote-code`. No se documentan otras opciones (vLLM, llama.cpp, Ollama, TGI).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Funcion | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| midas-llm-research/qwen3-8b-dflash-baseline | 1.048.626.432 | Borrador DFlash (16 tokens) para Qwen3-8B | no disponible | MIT | Publicado |
| z-lab/Qwen3-8B-DFlash-b16 | no disponible | Borrador DFlash (16 tokens) para Qwen3-8B | no disponible | no disponible | Modelo base de partida |
| Qwen3-8B (objetivo) | 8 mil millones (aproximado) | Modelo generativo de proposito general | no disponible | no disponible | Modelo objetivo requerido |

No se dispone de datos de rendimiento comparado entre el baseline de MIDAS y el borrador original de z-lab.

## Limitaciones y advertencias

- No es un modelo autonomo: sin el modelo objetivo Qwen3-8B no produce respuestas utiles; su salida son tokens candidatos sujetos a verificacion.
- Requiere el tokenizer del modelo objetivo; el repositorio no incluye tokenizer propio.
- Necesita `--trust-remote-code` por la inclusion de codigo Python con la arquitectura DFlash, lo que implica ejecutar codigo del repositorio.
- Solo se ha validado con SGLang 0.5.18; la compatibilidad con otras versiones o runtimes no esta documentada.
- No hay datos publicados sobre tasa de aceptacion, speedup, sesgos o tasas de alucinacion del borrador; el riesgo de alucinacion del sistema final recae en el modelo objetivo.
- Idiomas soportados y longitud de contexto no estan especificados.
- Licencia MIT: permite uso comercial, pero conviene revisar las condiciones del modelo base z-lab/Qwen3-8B-DFlash-b16 y del objetivo Qwen3-8B antes de desplegar en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/midas-llm-research/qwen3-8b-dflash-baseline
- Modelo base: https://huggingface.co/z-lab/Qwen3-8B-DFlash-b16
- Repositorio MIDAS: https://github.com/midas-llm-research/midas
- SGLang: https://github.com/sgl-project/sglang

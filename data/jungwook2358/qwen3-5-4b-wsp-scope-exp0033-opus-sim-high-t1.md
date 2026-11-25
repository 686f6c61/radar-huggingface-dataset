# jungwook2358/Qwen3.5-4B-wsp-scope-exp0033-opus-sim-high-t1

## Resumen

Este repositorio contiene un checkpoint intermedio de un experimento de edicion de pesos (weight editing) sobre el modelo base Qwen/Qwen3.5-4B, identificado como EXP-0033. El autor, jungwook2358, publica el estado acumulado tras el primer paso aceptado de una sesion de edicion que, segun la model card, seguia en ejecucion en el momento de la publicacion. No es un modelo entrenado ni afinado: los pesos se han modificado directamente mediante el flujo de trabajo WSP-Scope, sin ninguna fase de entrenamiento supervisado ni de RLHF.

El objetivo declarado de este paso es corregir un fallo observado en el modelo base cuando se usa como agente de codigo (code-as-policy) en el simulador de robotica LIBERO-PRO: el modelo tiende a solicitar imagenes de forma habitual (robo.show()), lo que provoca el agotamiento de la ventana de contexto de 65k tokens. La edicion pretende eliminar una direccion de "look-intent" (intencion de mirar) en las escrituras residuales de las capas 16 a 31.

El checkpoint incluye la arquitectura multimodal de Qwen3.5-4B (procesamiento de imagen y texto), con 4.659.865.088 parametros totales segun los safetensors del repositorio. Es relevante como material de investigacion sobre edicion de pesos y control de comportamiento en agentes, no como modelo listo para produccion: el propio autor advierte que no ha sido evaluado en kakao y que los efectos medidos provienen de sus propios rollouts, no de una evaluacion formal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de Qwen3.5 con atencion lineal (linear_attn) y atencion estandar (self_attn) por capas; multimodal image-text-to-text |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 65k tokens (mencionado en la model card como contexto que el modelo base agota) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.5-4B base, revision 851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a. Segun los nombres de tensores modificados, la red combina capas con atencion lineal (linear_attn.out_proj) y capas con atencion estandar (self_attn.o_proj), ademas de bloques MLP con down_proj. La pipeline declarada es image-text-to-text, por lo que el modelo procesa entradas multimodales de imagen y texto.

No hubo entrenamiento. El autor describe un proceso de edicion de pesos: Claude Opus 5.5 (effort high, Claude Code) ejecuto el modelo base como agente PyRUA-Lean en el simulador LIBERO-PRO, sirviendolo con vLLM 0.32 bajo la configuracion de evaluacion, con semillas 0-4 del simulador y descartando las que repetian escenas. A partir de esos rollouts diagnostico el fallo (sobreuso de imagenes que agota el contexto de 65k) y edito directamente los pesos con WSP-Scope, conservando una edicion solo cuando los rollouts pareados en semillas no usadas para construirla mostraban una mejora clara. El paso 1 se denomina step1_T1_look_intent_ablation y su hipotesis es eliminar la direccion u de look-intent (media de residuales en posiciones show-unit de la capa 20 menos la media de otras posiciones de inicio de linea, 25 frente a 450 posiciones, con coseno de particion mitad-mitad de 0,80) de las escrituras residuales con beta=1.0 en las capas 16 a 31. Se modificaron 32 tensores, con entre aproximadamente 7,9 y 17,8 millones de valores almacenados cambiados por tensor.

## Capacidades

- Generacion de texto y razonamiento conversacional, heredados del modelo base Qwen3.5-4B.
- Procesamiento de imagen y texto (image-text-to-text): el modelo puede recibir imagenes junto con instrucciones textuales.
- Actuacion como agente de codigo (code-as-policy): genera politicas en codigo para el simulador de robotica LIBERO-PRO, con llamadas a funciones del simulador como robo.show().
- Razonamiento multi-paso en entornos simulados, segun el uso descrito en los rollouts del editor.
- Capacidad de tool calling / function calling: no confirmada explicitamente en la informacion disponible.
- Capacidades multilingues: no disponibles.
- Modo thinking, audio u otras capacidades especiales: no disponibles.

## Casos de uso

- Investigacion en edicion de pesos: sirve como caso de estudio reproducible de una sesion WSP-Scope, ya que el repositorio incluye wsp-patch/steps/NN-*/patch.json con el parche acumulado y change.json con los cambios de cada paso, permitiendo reconstruir y evaluar cada paso por separado.
- Estudio de control de comportamiento en agentes: util para analizar si la ablacion de una direccion de look-intent reduce las peticiones habituales de imagen y evita el agotamiento del contexto de 65k en tareas de agente.
- Evaluacion de agentes en robotica simulada: el checkpoint puede probarse en las cuatro suites de intercambio de LIBERO-PRO con vLLM 0.32, comparando el comportamiento frente al modelo base sin editar.
- Analisis de robustez de modelos multimodales: permite medir como afecta una edicion en las capas 16-31 al resto de capacidades de imagen y texto del Qwen3.5-4B original.
- Reproducibilidad de experimentos de edicion: los tensores modificados y las hipotesis estan documentados, lo que facilita replicar el diagnostico y verificar si la mejora medida se mantiene en semillas nuevas.
- Docencia y divulgacion tecnica: ejemplo concreto de flujo weight editing sin entrenamiento, con criterios de aceptacion basados en rollouts pareados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que el modelo no ha sido evaluado en kakao y que los efectos medidos por el editor provienen de sus propios rollouts, no de una evaluacion formal.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo de 4,66 mil millones de parametros en precision completa (fp16/bf16) requiere aproximadamente 9,3 GB solo para los pesos, mas memoria para el contexto de 65k y el procesador de vision; el tamano del repositorio es de 10,4 GB.
- GPU recomendadas: no disponibles en la informacion proporcionada. El autor menciona el uso de vLLM 0.32 para servir el modelo durante la evaluacion, sin especificar la GPU empleada.
- Compatibilidad con GPU de consumo: no confirmada. Con cuantizacion a 8 bits o 4 bits podria caber en GPUs de consumo con suficiente VRAM, pero no se aportan datos verificados.
- Opciones de despliegue: vLLM 0.32 (usado por el autor) y transformers, que es la libreria declarada. Otras opciones como llama.cpp, Ollama o TGI no estan confirmadas en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| jungwook2358/Qwen3.5-4B-wsp-scope-exp0033-opus-sim-high-t1 | 4.659.865.088 | 65k | apache-2.0 | Hugging Face, 25 descargas | Checkpoint intermedio de edicion de pesos, sin evaluacion formal |
| Qwen/Qwen3.5-4B (base) | 4B (clase) | 65k (segun la model card) | no disponible en esta ficha | Hugging Face | Modelo original sin editar; referencia de comparacion del experimento |
| jungwook2358/Qwen3.5-4B-wsp-scope-exp0033-opus-sim-high | no disponible | no disponible | no disponible | Hugging Face | Repositorio destino de los pasos posteriores del mismo experimento, segun la model card |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo no ha sido evaluado formalmente: el autor advierte que no se ha evaluado en kakao y que los efectos medidos proceden de sus propios rollouts, no de una evaluacion independiente.
- Es un checkpoint intermedio de una sesion de edicion que seguia en ejecucion al publicarse; los pasos posteriores, si existen, se publican en otro repositorio.
- No hubo entrenamiento: los cambios son ediciones directas de pesos con hipotesis no validadas de forma general, por lo que pueden degradar capacidades no medidas.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; se heredan los del modelo base Qwen3.5-4B, no descritos aqui.
- Limitaciones de contexto e idioma: el contexto declarado es de 65k tokens, que el propio experimento identifica como recurso que el modelo base agota por sobreuso de imagenes; los idiomas soportados no estan disponibles.
- Licencia apache-2.0: permite uso comercial, pero al tratarse de un artefacto de investigacion sin evaluacion, no es recomendable desplegarlo en produccion sin validacion propia.
- El repositorio tiene 25 descargas y 0 likes, lo que indica una adopcion muy limitada y ausencia de validacion por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jungwook2358/Qwen3.5-4B-wsp-scope-exp0033-opus-sim-high-t1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio de pasos posteriores del experimento: https://huggingface.co/jungwook2358/Qwen3.5-4B-wsp-scope-exp0033-opus-sim-high
- No se han encontrado en la informacion disponible enlaces a papers, blogs, repositorios de codigo ni demos adicionales.

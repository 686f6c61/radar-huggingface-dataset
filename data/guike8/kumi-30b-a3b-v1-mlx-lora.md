# guike8/Kumi-30B-A3B-v1-MLX-LoRA

## Resumen

Kumi-30B-A3B-v1-MLX-LoRA es un adaptador LoRA experimental publicado por el desarrollador guike8 sobre el modelo base mlx-community/Qwen3-Coder-30B-A3B-Instruct-4bit, una version cuantizada a 4 bits del Qwen3-Coder-30B-A3B-Instruct de Alibaba. El adaptador se ha entrenado para invocar las herramientas nativas de produccion musical de Kumi, un sistema de asistencia para DAW (Digital Audio Workstation) centrado en Ableton. No se trata de un modelo autonomo, sino de pesos LoRA que deben cargarse junto con el modelo base exacto en un Mac con Apple Silicon.

El entrenamiento se ha realizado con MLX 0.32.4 y MLX-LM 0.32.2 sobre 96 episodios sinteticos generados por un profesor scriptado (`scripted_oracle_v1`) que opera contra un verificador de estado sintetico de Ableton. El corpus es muy reducido: 288 microbatches, 36 actualizaciones del optimizador y 6.684.672 parametros entrenables en 192 tensores. La relevancia actual es acotada: se trata de una prueba de concepto de ajuste fino para tool calling especializado en un dominio vertical concreto, no de un modelo de proposito general.

El checkpoint v1 esta finalizado y documentado con hashes de integridad, pero el propio autor advierte que no se ha evaluado la precision en tareas reales ni la calidad musical. Las perdidas reportadas (0,00164 en entrenamiento y 0,00052 en validacion) son perdidas teacher-forced sobre un corpus sintetico y repetitivo, no una medida de competencia. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer MoE (modelo base Qwen3-Coder-30B-A3B-Instruct) |
| Parametros totales | 6.684.672 parametros entrenables en el adaptador (192 tensores, float32); el modelo base completo no se distribuye en este repositorio |
| Parametros activos | No disponible para el adaptador; el modelo base es MoE con 30B totales y 3B activos segun su denominacion |
| Longitud de contexto | 32.768 tokens (longitud maxima de secuencia usada en entrenamiento); contexto nativo del base no disponible en la informacion proporcionada |
| Tipos de cuantizacion | El adaptador se distribuye en float32; el modelo base requerido esta cuantizado a 4 bits |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | `adapters.safetensors` (formato MLX LoRA, no PEFT de Transformers) |

## Arquitectura y entrenamiento

El adaptador aplica LoRA sobre las proyecciones `self_attn.q_proj` y `self_attn.v_proj` de las 48 capas del transformer del modelo base, con rango 16, escala 16 y dropout 0. El optimizador es AdamW con tasa de aprendizaje 0,00002, batch size 1 con acumulacion de 8, 288 microbatches y 36 actualizaciones del optimizador. Se activo gradient checkpointing y enmascaramiento de prompt, con semilla 7 y longitud maxima de secuencia de 32.768 tokens.

El corpus de entrenamiento consta de 96 episodios sinteticos expandidos a 432 prefijos objetivo de asistente: 288 de entrenamiento, 72 de validacion y 72 de test retenido, agrupados por semilla en la particion. El profesor scriptado `scripted_oracle_v1` genero las demostraciones contra un verificador sintetico de estado de Ableton, usando cuatro plantillas y un unico layout. No se emplearon sesiones humanas, renders reales de DAW, datos de preferencia humana, xLAM ni el profesor Sol. Solo los 288 registros de entrenamiento contribuyeron al gradiente.

Una innovacion tecnica relevante es el uso del parser de Qwen3-Coder de MLX-LM con una correccion de union tipada documentada en el repositorio KumiLLM, necesaria para el bucle de ejecucion de herramientas. El autor advierte que la perdida por defecto de MLX-LM 0.32.2 incluye el primer token de padding en el enmascaramiento final del asistente, por lo que no se uso la perdida estricta posterior que excluye padding.

## Capacidades

- Generacion de texto en ingles sobre el modelo base Qwen3-Coder-30B-A3B-Instruct.
- Invocacion de herramientas nativas de produccion musical de Kumi (tool calling especializado en operaciones de DAW).
- Soporte de bucle de ejecucion de herramientas multi-paso a traves del runtime KumiLLM, incluyendo parser de union tipada.
- Razonamiento sobre estado sintetico de proyecto Ableton (pistas, envios, ediciones) segun las plantillas del profesor scriptado.
- Capacidades de codigo y matematicas heredadas del modelo base Qwen3-Coder, no evaluadas en este adaptador.
- Capacidades multilingues limitadas al ingles segun la model card.
- No se documentan capacidades de vision, audio ni modo thinking especifico para este adaptador.

## Casos de uso

- Prototipado de asistentes de produccion musical en Ableton: el adaptador permite experimentar con tool calling especializado sobre un modelo base de codigo, cargandolo en un Mac con Apple Silicon mediante MLX y el runtime KumiLLM para validar el bucle de ejecucion de herramientas.
- Investigacion sobre ajuste fino LoRA en dominios verticales: sirve como caso de estudio reproducible de un entrenamiento con corpus sintetico pequeno (288 microbatches), profesor scriptado y verificador de estado, util para comparar metodologias de generacion de datos.
- Evaluacion de parsers de tool calling en MLX-LM: el adaptador y su documentacion sobre la correccion de union tipada del parser Qwen3-Coder permiten probar integraciones de runtime en entornos Apple Silicon.
- Desarrollo de verificadores de estado de DAW: el flujo de entrenamiento contra un verificador sintetico de Ableton puede reutilizarse para construir validadores de operaciones musicales antes de ejecutarlas en un proyecto real.
- Docencia y demostraciones de LoRA sobre modelos MoE cuantizados a 4 bits: el repositorio incluye `training_config.json`, `training_summary.json` y `SHA256SUMS`, lo que facilita reproducir y auditar el proceso en un curso o taller.
- Base para iteraciones futuras del propio proyecto Kumi: el checkpoint v1, con hashes y procedencia documentados, sirve como punto de partida para versiones con corpus mayor, datos humanos o evaluacion de precision en tareas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor reporta unicamente perdidas teacher-forced: 0,0016465982 en el microbatch 288 de entrenamiento y 0,0005211607 en validacion (evaluada sobre cuatro batches y reportada en el microbatch 287, antes de la ultima actualizacion). No hay validacion posterior a la ultima actualizacion ni benchmark de precision en tareas del modelo entrenado.

## Requisitos de hardware

- VRAM o memoria unificada estimada: no disponible de forma explicita; el modelo base es una cuantizacion a 4 bits de un MoE de 30B parametros totales, por lo que se requiere un equipo con memoria unificada suficiente para cargar el base completo mas el adaptador.
- GPU recomendadas: el adaptador esta disenado para Apple Silicon con MLX; no se documenta soporte para A100, H100 ni RTX 4090 en la informacion proporcionada.
- Cabe en consumer GPU: no disponible; el flujo documentado es exclusivamente para Mac con Apple Silicon.
- Opciones de despliegue: MLX y MLX-LM (versiones 0.32.4 y 0.32.2 respectivamente) junto con `huggingface_hub`; no se documenta vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kumi-30B-A3B-v1-MLX-LoRA | Adaptador LoRA de 6,68M parametros entrenables sobre base MoE 30B/3B | 32.768 tokens (entrenamiento) | MLX LoRA (`adapters.safetensors`) | Apache 2.0 | Hugging Face, 0 descargas, 1 like |
| Qwen/Qwen3-Coder-30B-A3B-Instruct | MoE 30B totales, 3B activos | No disponible en la informacion proporcionada | Safetensors | Apache 2.0 | Hugging Face (modelo base original) |
| mlx-community/Qwen3-Coder-30B-A3B-Instruct-4bit | MoE 30B totales, 3B activos, cuantizado a 4 bits | No disponible en la informacion proporcionada | MLX cuantizado | Apache 2.0 | Hugging Face (base exacta requerida) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- El adaptador no es un modelo autonomo: requiere el modelo base exacto `mlx-community/Qwen3-Coder-30B-A3B-Instruct-4bit` en la revision `6e302ea604ad9ab206367e2c501d1571023e7b6d` y no funciona como adaptador PEFT de Transformers.
- El corpus de entrenamiento es sintetico, pequeno y repetitivo (96 episodios, cuatro plantillas, un layout), por lo que la generalizacion a proyectos reales de Ableton no esta demostrada.
- Las perdidas reportadas son teacher-forced y no miden precision ni competencia musical; no hay benchmark de tareas posterior al entrenamiento.
- La perdida de MLX-LM 0.32.2 incluye el primer token de padding en el enmascaramiento final del asistente, lo que introduce un sesgo conocido en el calculo de perdida.
- La fiabilidad en DAW real, la capacidad de escucha, el gusto musical y la competitividad frente al profesor no se han establecido.
- Riesgo de alucinacion en la propuesta de ediciones musicales: el autor recomienda verificar las ediciones y el estado resultante del proyecto a traves del runtime Kumi.
- Idioma limitado al ingles segun la model card.
- Es un fine-tune comunitario sin afiliacion ni respaldo de Qwen, Apple ni Ableton.
- La licencia Apache 2.0 aplica al adaptador; los pesos y el tokenizer del base deben obtenerse por separado bajo sus propios terminos.
- Repositorio con 0 descargas y 1 like en el momento de la consulta, lo que indica escasa validacion externa.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/guike8/Kumi-30B-A3B-v1-MLX-LoRA
- Modelo base en MLX: https://huggingface.co/mlx-community/Qwen3-Coder-30B-A3B-Instruct-4bit
- Modelo original: https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct
- Repositorio KumiLLM: https://github.com/guike8/KumiLLM

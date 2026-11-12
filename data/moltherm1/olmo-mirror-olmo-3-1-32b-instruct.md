# moltherm1/olmo-mirror-olmo-3.1-32b-instruct

## Resumen

Olmo-3.1-32B-Instruct es un modelo de lenguaje autoregresivo de tipo transformer, desarrollado por el Allen Institute for AI (Ai2) dentro de la familia Olmo 3. Se trata de la variante "Instruct" (no "Think") del modelo de 32 000 millones de parametros, entrenada para seguir instrucciones y mantener conversaciones multi-turno, sin el modo de razonamiento de cadena de pensamiento larga que caracteriza a las variantes Think. El modelo que nos ocupa es un espejo (mirror) publicado por el usuario moltherm1 sobre el checkpoint oficial `allenai/Olmo-3.1-32B-Instruct-DPO`.

La relevancia de Olmo radica en su caracter completamente abierto: Ai2 publica los pesos, el codigo de entrenamiento, los checkpoints intermedios y los datos (Dolma 3 para preentrenamiento y Dolci para postentrenamiento), lo que permite reproducir y auditar el proceso completo. Esto lo convierte en una alternativa poco habitual frente a modelos de pesos abiertos pero datos cerrados. El modelo esta pensado para investigacion y uso educativo, con licencia Apache 2.0.

La ficha se basa en la model card del repositorio espejo, que reproduce la informacion del modelo original de Ai2. No se dispone de datos especificos de benchmarks en la informacion proporcionada, por lo que esos apartados se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autoregresivo (estilo decoder-only) |
| Parametros totales | 32 000 millones (32B) |
| Parametros activos | no disponible (no es MoE segun la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 via bitsandbytes (mencionado en la model card); otras no disponibles |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de transformers); otros no disponibles |

## Arquitectura y entrenamiento

El modelo es un transformer autoregresivo de estilo decoder-only, segun la descripcion oficial de Ai2. Forma parte de la familia Olmo 3, que incluye variantes de 7B y 32B en versiones Instruct y Think. El preentrenamiento se realizo sobre el dataset Dolma 3 y el postentrenamiento sobre los datasets Dolci. La cadena de postentrenamiento incluye una fase de SFT (supervised fine-tuning) seguida de DPO (direct preference optimization) y, en los modelos finales, RLVR (reinforcement learning with verifiable rewards). El checkpoint base de este modelo es `allenai/Olmo-3.1-32B-Instruct-DPO`, y el dataset de postentrenamiento citado es `allenai/Dolci-Instruct-RL`.

La fecha de corte de conocimiento indicada por Ai2 es diciembre de 2024. La model card menciona que se publican codigo, checkpoints, logs y detalles de entrenamiento, y que el modelo es compatible con transformers 4.57.0 o superior. No se especifican en la informacion disponible el numero exacto de tokens de entrenamiento, la composicion detallada del dataset ni innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto y conversacion multi-turno en ingles.
- Seguimiento de instrucciones (variante Instruct, sin modo de razonamiento largo).
- Razonamiento general y tareas de conocimiento, segun el proposito declarado de la familia (las variantes Think mejoran matematicas y codigo; esta variante no incluye ese modo).
- Capacidades multilingues limitadas al ingles segun la model card.
- Compatibilidad con la libreria transformers y con cuantizacion int8 mediante bitsandbytes.
- Soporte de tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Asistente conversacional en ingles: el modelo puede gestionar dialogos multi-turno gracias a su entrenamiento Instruct con DPO, adecuado para prototipos de atencion al cliente en entornos de investigacion.
- Generacion de texto y redaccion asistida: util para tareas de resumen, reescritura y generacion de contenido en ingles con un modelo de 32B parametros.
- Investigacion en alineacion y postentrenamiento: al ser un modelo completamente abierto con checkpoints intermedios, permite estudiar el efecto de SFT, DPO y RLVR en el comportamiento final.
- Fine-tuning especifico de dominio: la model card documenta recetas de ajuste fino con OLMo-core y permite partir de checkpoints intermedios (`step_XXXX`) para experimentos controlados.
- Evaluacion comparativa de modelos abiertos: sirve como referencia reproducible en estudios de rendimiento y sesgos frente a otros modelos de tamano similar.
- Despliegue en entornos con requisitos de licencia permisiva: la licencia Apache 2.0 facilita su integracion en productos y pipelines internos, sujeto a las guias de uso responsable de Ai2.
- Educacion y docencia: la disponibilidad de codigo, datos y logs lo hace adecuado para ensenar el ciclo completo de entrenamiento de un LLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 64 GB solo para los pesos (32B × 2 bytes), mas overhead de activaciones y cache KV; se recomienda al menos 80 GB para comodidad.
- VRAM estimada con cuantizacion int8: aproximadamente 32 GB para los pesos, mas overhead; cabe en GPUs de 40-48 GB.
- GPU recomendadas: A100 80 GB, H100 80 GB para fp16 sin cuantizar; A100 40 GB o L40S 48 GB con int8.
- GPU de consumo: no cabe en RTX 4090 (24 GB) en fp16 ni en int8 sin tecnicas adicionales de offloading o cuantizacion mas agresiva (no documentadas en la informacion).
- Opciones de despliegue: transformers (soporte oficial desde 4.57.0) y bitsandbytes para int8; vLLM, llama.cpp, Ollama o TGI no se mencionan en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Olmo-3.1-32B-Instruct (este) | 32B | no disponible | Apache 2.0 | Pesos abiertos en HF |
| Olmo-3.1-32B-Think | 32B | no disponible | Apache 2.0 | Pesos abiertos en HF |
| Olmo-3-7B-Instruct | 7B | no disponible | Apache 2.0 | Pesos abiertos en HF |
| Olmo-3.1-32B-Instruct-DPO (base) | 32B | no disponible | Apache 2.0 | Pesos abiertos en HF |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Idioma: el modelo esta entrenado y declarado unicamente para ingles; su rendimiento en castellano no esta garantizado.
- Fecha de corte: diciembre de 2024; no conoce eventos posteriores.
- Riesgo de alucinacion: inherente a los modelos generativos; no se documentan evaluaciones especificas de fidelidad en la informacion disponible.
- Sesgos: no se detallan evaluaciones de sesgo en la model card proporcionada.
- Licencia: Apache 2.0 permite uso comercial, pero Ai2 indica que el modelo esta pensado para investigacion y uso educativo conforme a sus guias de uso responsable; conviene revisar dichas guias antes de un despliegue en produccion.
- Repositorio espejo: este repositorio (`moltherm1/olmo-mirror-olmo-3.1-32b-instruct`) es una copia de terceros con 0 descargas y 0 likes; para uso en produccion es preferible referenciar el repositorio oficial de Ai2.
- Checkpoints: la model card advierte que, por un problema de checkpointing, solo se publican los ultimos checkpoints del modelo original.
- No se documentan capacidades de tool calling, agentes ni vision; no deben asumirse.

## Enlaces

- Repositorio espejo en Hugging Face: https://huggingface.co/moltherm1/olmo-mirror-olmo-3.1-32b-instruct
- Modelo base: https://huggingface.co/allenai/Olmo-3.1-32B-Instruct-DPO
- Modelo final oficial: https://huggingface.co/allenai/Olmo-3.1-32B-Instruct
- Pagina del proyecto Olmo: https://allenai.org/olmo
- Repositorio Open-Instruct (DPO y RLVR): https://github.com/allenai/open-instruct
- Repositorio OLMo-core (preentrenamiento y SFT): https://github.com/allenai/OLMo-core
- Guias de uso responsable de Ai2: https://allenai.org/responsible-use
- Paper citado en los tags (arxiv:2512.13961): https://arxiv.org/abs/2512.13961

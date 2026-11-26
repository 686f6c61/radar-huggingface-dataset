# MANGSEOK123/qwen3-4b-tau2-oel-retail-source-success-only-n74

## Resumen

qwen3-4b-tau2-oel-retail-source-success-only-n74 es un ajuste fino del modelo Qwen/Qwen3-4B-Instruct-2507, desarrollado por el usuario MANGSEOK123. El modelo aplica una tecnica de internalizacion de habilidades (skill internalization) mediante autodestilacion en politica (on-policy self-distillation, OPSD) sobre el benchmark tau2-bench en su dominio retail (version v1.0.1). El objetivo es que el modelo estudiante aprenda a resolver tareas conversacionales de atencion al cliente sin necesidad de que la habilidad se le proporcione explicitamente en el prompt del sistema.

La relevancia de este modelo es metodologica: demuestra un flujo de destilacion en el que un profesor congelado (copia del modelo inicial) recibe la habilidad en el system prompt, mientras el estudiante debe resolver la misma tarea sin ella, alineandose mediante una divergencia KL inversa a nivel de token sobre los 256 tokens mas probables. El resultado es un modelo de 4.411.424.256 parametros (aproximadamente 4,4 mil millones), en formato BF16, publicado bajo la libreria transformers con pesos safetensors.

Se trata de un artefacto de investigacion con cero descargas y cero likes en el momento de la consulta, sin model card extendida mas alla de la descripcion del procedimiento de entrenamiento. No se declara licencia ni lista de idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-4B-Instruct-2507); detalles internos no disponibles |
| Parametros totales | 4.411.424.256 |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible como especificacion del modelo; en entrenamiento se usaron prompts de hasta 8192 tokens y respuestas de hasta 1024 tokens por turno |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Instruct-2507, un transformer decoder-only de aproximadamente 4,4 mil millones de parametros. El ajuste se realiza con la tecnica OPSD (on-policy self-distillation) usando el codebase OEL (LMOps). El profesor es una copia congelada del modelo inicial que recibe la habilidad correspondiente en su system prompt; el estudiante es el modelo que se entrena y debe resolver cada tarea sin la habilidad. La perdida es una KL inversa a nivel de token calculada sobre los 256 tokens mas probables del estudiante.

Los datos de entrenamiento consisten en 74 pares (habilidad, tarea de origen) muestreados con `random.Random(42)` a partir de las 276 habilidades cuyo task de origen supero pass@3 en tau2-bench retail v1.0.1. No se aplico probing, gate ni refinamiento: el fichero de pares se usa tal cual. La configuracion es de 1 epoca, 8 pares por actualizacion, temperatura 0,7 en la simulacion del estudiante y un simulador de usuario basado en GPT-4.1-mini. El optimizador es AdamW con learning rate constante de 3e-6, weight decay 0,01 y grad clip 1,0. Los pesos finales se guardan en BF16.

## Capacidades

- Generacion de texto conversacional multi-turno orientada a tareas de atencion al cliente en el dominio retail.
- Internalizacion de habilidades: el modelo ha sido entrenado para resolver tareas sin que la habilidad se le indique explicitamente en el prompt del sistema.
- Ejecucion de tareas del benchmark tau2-bench retail (v1.0.1), que implican interaccion con un usuario simulado y uso de herramientas del entorno.
- Razonamiento multi-paso dentro de un episodio conversacional, segun el procedimiento de entrenamiento descrito.
- Tool calling / function calling: no se documenta de forma explicita en la informacion disponible, aunque el dominio de tau2-bench retail implica interacciones con herramientas.
- Capacidades multilingues: no disponible.
- Capacidades de vision o audio: no disponibles (el modelo base es de texto).

## Casos de uso

- Investigacion en destilacion de habilidades: el modelo sirve como referencia reproducible para estudiar OPSD sobre tau2-bench, ya que la configuracion (semilla 42, 74 pares, 1 epoca) esta documentada y es replicable.
- Evaluacion de internalizacion sin prompt de habilidad: permite comparar el rendimiento del estudiante sin habilidad explicita frente al profesor con habilidad, aislando el efecto de la destilacion.
- Prototipado de agentes de atencion al cliente en retail: el modelo esta especializado en tareas conversacionales de ese dominio, por lo que puede usarse como base para experimentos de soporte automatizado.
- Benchmarking de tecnicas de alineacion: util para comparar KL inversa a nivel de token frente a otras perdidas (forward KL, DPO) en tareas de dominio acotado.
- Generacion de dialogos sinteticos de retail: puede emplearse para producir trayectorias de conversacion que alimenten otros pipelines de entrenamiento o evaluacion.
- Estudio de sensibilidad a hiperparametros: al ser un ajuste acotado (74 pares, 1 epoca), es adecuado para analizar como varian los resultados con cambios en el numero de pares, la temperatura del estudiante o el tamano del top-k de la KL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe el procedimiento de entrenamiento (74 pares muestreados de 276 habilidades con pass@3 en tau2-bench retail v1.0.1) pero no reporta metricas finales del modelo ajustado ni comparaciones con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 8,8 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, alrededor de 10-12 GB para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 4,5-5 GB para pesos; en 4 bits, alrededor de 2,5-3 GB.
- GPU recomendadas: A100, H100 o L40S para despliegue en BF16 con concurrencia; RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia en BF16 sin problemas de memoria.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090, RTX 4080 (16 GB) en BF16 con contexto limitado, y en GPUs de 8-12 GB si se cuantiza a 8 o 4 bits.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference`), y en general cualquier runtime compatible con safetensors; llama.cpp, Ollama o vLLM requeririan conversion o soporte especifico del formato, no confirmado en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-4b-tau2-oel-retail-source-success-only-n74 | 4,41 B | no disponible | Retail (tau2-bench) | no disponible | Hugging Face (0 descargas) |
| Qwen/Qwen3-4B-Instruct-2507 (base) | ~4,4 B | no disponible en esta ficha | Generalista | no disponible en esta ficha | Hugging Face (modelo base publico) |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento del modelo ajustado frente al base ni frente a otros ajustes de tau2-bench, por lo que la comparativa cuantitativa no esta disponible.

## Limitaciones y advertencias

- Modelo de investigacion con 0 descargas y 0 likes: no hay evidencia de uso en produccion ni validacion externa.
- Entrenado exclusivamente sobre 74 pares del dominio retail de tau2-bench v1.0.1: el riesgo de sobreajuste a ese subconjunto es alto y la generalizacion a otras tareas o dominios no esta demostrada.
- No se declara licencia: no se puede asumir uso comercial permitido; hay que verificar los terminos del modelo base Qwen3-4B-Instruct-2507 y del autor del ajuste.
- Idiomas soportados no declarados: no se puede garantizar un comportamiento multilingue fiable.
- Riesgo de alucinacion inherente a los modelos de ~4 B en tareas conversacionales con herramientas; sin evaluacion publicada no hay datos para cuantificarlo.
- La model card no reporta metricas de exito en tau2-bench tras el ajuste, por lo que no se puede confirmar que la internalizacion de habilidades haya funcionado.
- El uso de un simulador de usuario GPT-4.1-mini durante el entrenamiento introduce dependencia de un servicio externo y posibles sesgos del simulador.
- Sin garantias de soporte en runtimes distintos de transformers y text-generation-inference.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MANGSEOK123/qwen3-4b-tau2-oel-retail-source-success-only-n74
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- No se han encontrado en la informacion disponible enlaces a papers, blogs, repositorios o demos adicionales.

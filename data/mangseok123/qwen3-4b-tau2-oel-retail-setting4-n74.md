# MANGSEOK123/qwen3-4b-tau2-oel-retail-setting4-n74

## Resumen

`MANGSEOK123/qwen3-4b-tau2-oel-retail-s4-n74` es un ajuste fino del modelo denso Qwen/Qwen3-4B-Instruct-2507, entrenado con un ciclo de Online Experiential Learning (OEL) sobre el dominio *retail* del benchmark tau2-bench. El autor lo publica como artefacto reproducible para estudiar el método, no como un modelo mejorado: la propia model card indica que el OEL no ha superado al modelo base en esta serie de experimentos.

La innovación metodológica es que el OEL aquí es *self-distillation*, no aprendizaje por refuerzo: no existe señal de recompensa. Profesor y alumno comparten pesos; la única diferencia es que al profesor se le añade la memoria de la tarea al *system prompt*. El alumno se ajusta a la distribución del profesor con una pérdida KL completa a nivel de token, de modo que el comportamiento debería sobrevivir sin la memoria en el prompt en tiempo de inferencia.

Con 4.411.424.256 parámetros y pesos en safetensors (8,8 GB de repositorio), el modelo es relevante ahora como pieza de investigación sobre destilación de memoria en pesos frente a memoria en contexto, y como base de experimentación para agentes de atención al cliente con *tool calling* en el dominio retail. Su utilidad práctica como modelo de producción no está demostrada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-4B-Instruct-2507); numero de capas, cabezas y tipo de atencion no disponible en la informacion proporcionada |
| Parametros totales | 4.411.424.256 (4,41 mil millones) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible para este fine-tune; el modelo base Qwen3-4B-Instruct-2507 declara contexto nativo de 262.144 tokens |
| Tipos de cuantizacion | no disponible; el repositorio solo publica safetensors en precision completa (8,8 GB). No se publican GGUF, GPTQ ni AWQ |
| Idiomas soportados | en (ingles), segun la etiqueta de idioma del repositorio |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 |
| Dominio de ajuste | tau2-bench, dominio retail |

## Arquitectura y entrenamiento

No se documentan cambios arquitectonicos: el modelo conserva la arquitectura del Qwen3-4B-Instruct-2507, un transformer denso de 4,41 mil millones de parametros. El entrenamiento consiste en una epoca (9 pasos) de Online Experiential Learning sobre 72 pares (memoria, tarea sintetizada) del dominio retail de tau2-bench. La configuracion es: *batch size* 8 repartido en 4 GPU, *learning rate* 3e-6, perdida KL completa sobre todos los tokens de respuesta, *gradient clipping* de 1.0 y gpt-4.1-mini como simulador de usuario.

La innovacion tecnica es el esquema de *self-distillation*: profesor y alumno comparten pesos y solo se diferencian en que el profesor recibe la memoria de la tarea anexada a su *system prompt*. El alumno se ajusta a la distribucion del profesor token a token, con el objetivo de internalizar ese comportamiento sin necesidad de la memoria en el prompt. El autor advierte de dos detalles relevantes: las normas de gradiente estuvieron muy por encima del umbral de recorte de 1.0 durante todo el entrenamiento (por lo que el *clip*, y no el *learning rate*, determino el tamano de paso efectivo), y una segunda epoca empeoro ligeramente los resultados en lugar de mejorarlos.

## Capacidades

- Generacion de texto y dialogo multi-turno en ingles, heredadas del modelo base Qwen3-4B-Instruct-2507.
- *Tool calling* / *function calling*: la model card documenta el despliegue con vLLM usando `--enable-auto-tool-choice --tool-call-parser hermes`, lo que implica soporte del formato de llamadas a herramientas estilo Hermes.
- Comportamiento de agente en tareas del dominio retail de tau2-bench: resolucion de tareas con herramientas, seguimiento de politicas y conversacion con simulador de usuario.
- Razonamiento multi-paso dentro de una conversacion con herramientas, en el marco del benchmark tau2-bench.
- Capacidades multilingues: no acreditadas. El repositorio solo declara el ingles, aunque el modelo base es multilingue.
- Modo *thinking* explicito: no disponible en este ajuste (el modelo base es la variante Instruct-2507, sin modo de razonamiento separado).
- Vision, audio y otras modalidades: no disponibles.

## Casos de uso

- Reproduccion de experimentos de Online Experiential Learning: el modelo se publica explicitamente como artefacto reproducible, con hiperparametros documentados (9 pasos, lr 3e-6, KL completa, *clip* 1.0), para replicar o refutar el resultado en el dominio retail.
- Estudio de destilacion de memoria frente a memoria en contexto: permite comparar el comportamiento del alumno (sin memoria en el prompt) con el del profesor (con memoria) y medir cuanto del comportamiento se recupera en los pesos.
- Baseline de agentes para tau2-bench retail: sirve como punto de partida para medir agentes de atencion al cliente con herramientas en un dominio acotado y con simulador de usuario.
- Desarrollo y depuracion de *harnesses* de evaluacion: su integracion directa con vLLM y el *tool-call parser* Hermes lo hace util para validar pipelines de evaluacion de *tool calling* antes de escalar a modelos mayores.
- Ablaciones de estabilidad de entrenamiento: dado que las normas de gradiente superaron el *clip* de 1.0, es un caso de estudio para analizar el efecto del recorte de gradiente en fine-tunes muy cortos con pocos datos.
- Fine-tuning posterior en dominios especificos: al ser un modelo denso de 4,41B con licencia Apache-2.0 y pesos safetensors, sirve como punto de partida para ajustes adicionales en verticales concretas de retail, comercio electronico o soporte.
- Prototipado local de agentes con herramientas: con cuantizacion de 4 bits cabe en GPU de consumo, lo que permite probar flujos de *tool calling* en estaciones de trabajo sin clúster.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que el modelo "not yet evaluated on the held-out test split".

Como unico dato de rendimiento, el autor senala que, en la serie de ejecuciones de este tipo, el OEL no mejoro al modelo base: las diferencias quedan dentro de un error estandar (SE ~0,06-0,08 con 40 tareas), y una segunda epoca empeoro ligeramente los resultados. No se proporcionan puntuaciones absolutas de tau2-bench ni de otros benchmarks.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: aproximadamente 9-11 GB solo para pesos (8,8 GB de safetensors) mas cache KV y sobrecarga del runtime; en la practica, 12-16 GB para contextos moderados.
- Cuantizacion de 8 bits: aproximadamente 4,5-5,5 GB de pesos; cuantizacion de 4 bits: aproximadamente 2,5-3,5 GB de pesos. Estas cuantizaciones no se publican en el repositorio y habria que generarlas.
- GPU consumer: viable en RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090 y similares en bf16; en GPU de 8 GB solo con cuantizacion de 4 bits.
- GPU de datacenter: A100, H100, L40S y equivalentes, sin necesidad de paralelismo de tensor para una sola replica.
- Opciones de despliegue: vLLM es la ruta documentada por el autor (`vllm serve MANGSEOK123/qwen3-4b-tau2-oel-retail-s4-n74 --enable-auto-tool-choice --tool-call-parser hermes`). Al publicarse en safetensors, es compatible con Transformers y TGI; para llama.cpp u Ollama habria que convertir los pesos a GGUF, conversion no disponible en el repositorio.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| qwen3-4b-tau2-oel-retail-s4-n74 | 4,41B | no disponible (base: 262.144 tokens) | Apache-2.0 | safetensors | Fine-tune OEL sobre tau2-bench retail; sin mejora demostrada sobre el base; sin evaluacion en el split de test |
| Qwen/Qwen3-4B-Instruct-2507 | 4,41B | 262.144 tokens (segun su model card) | Apache-2.0 | safetensors y GGUF publicados por Qwen | Modelo base sin ajuste; capacidades generales multilingues y de *tool calling* |
| Qwen3-4B (variante con modo thinking) | 4,41B | no disponible | Apache-2.0 | safetensors | Alternativa de la misma familia con razonamiento explicito |
| Llama-3.2-3B-Instruct | 3,2B | no disponible | Llama 3.2 Community License | safetensors y GGUF | Alternativa de tamano similar, licencia distinta y sin ajuste especifico para tau2-bench |

No se dispone de otros fine-tunes comparables especificos para el dominio retail de tau2-bench en la informacion proporcionada.

## Limitaciones y advertencias

- Rendimiento no demostrado: el propio autor afirma que el OEL no ha mejorado al modelo base en esta serie y que las diferencias caen dentro de un error estandar (SE ~0,06-0,08 con 40 tareas). No debe presentarse como una mejora.
- Sin evaluacion: no hay resultados en el split de test reservado de tau2-bench.
- Sobreajuste probable: entrenamiento de 1 epoca y 9 pasos sobre solo 72 pares (memoria, tarea), con normas de gradiente por encima del *clip* de 1.0, lo que sugiere un paso efectivo controlado por el recorte y no por el *learning rate*.
- Idiomas: el repositorio declara unicamente ingles. No hay evidencia de rendimiento en castellano ni en otros idiomas, aunque el modelo base sea multilingue.
- Dominio estrecho: el ajuste se limita al dominio retail de tau2-bench; el comportamiento fuera de ese dominio y de ese formato de herramientas no esta caracterizado.
- Riesgo de alucinacion: inherente a un modelo de 4,41B en tareas de agente con herramientas; no hay datos especificos de tasas de alucinacion para este ajuste.
- Sesgos: no se documenta ninguna evaluacion de sesgos ni de seguridad en la informacion disponible.
- Licencia: Apache-2.0, lo que permite uso comercial y modificacion, pero el modelo se distribuye sin garantias y sin evaluacion de seguridad; conviene revisar tambien las condiciones del modelo base.
- Caveat de produccion: es un artefacto de investigacion reproducible, no un modelo listo para produccion; cualquier despliegue real deberia validarse contra el modelo base y contra alternativas mayores.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MANGSEOK123/qwen3-4b-tau2-oel-retail-setting4-n74
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Benchmark tau2-bench: referenciado en las etiquetas del repositorio; URL no incluida en la informacion proporcionada
- Paper del metodo OEL: no disponible en la informacion proporcionada
- Repositorio de codigo o demo: no disponible en la informacion proporcionada

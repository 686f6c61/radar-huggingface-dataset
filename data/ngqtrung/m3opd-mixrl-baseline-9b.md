# ngqtrung/M3OPD-MixRL-Baseline-9B

## Resumen

M3OPD-MixRL-Baseline-9B es un ajuste fino multimodal de Qwen3.5-9B publicado por el usuario de Hugging Face ngqtrung (Nguyen Quang Trung) como parte del trabajo denominado M3OPD-Reasoner. El modelo parte de la arquitectura, tokenizador, procesador y plantilla de chat de Qwen3.5-9B y se entrena en dos fases: un ajuste supervisado (SFT) sobre la mezcla combinada de datos de tres dominios (MixSFT) y, a continuacion, un entrenamiento con refuerzo mediante GSPO sobre la totalidad de los prompts del dataset M3OPD-RL-193K, empleando los hiperparametros de los profesores de cada dominio.

Se trata explicitamente de una linea base (baseline) del recetario, no del modelo principal del paper. El checkpoint publicado corresponde al paso 240, que segun el autor es el mejor evaluado de esta receta. El modelo es multimodal (pipeline image-text-to-text) y esta orientado a razonamiento multimodal, con soporte de modo thinking nativo de Qwen3.5 y formato de respuesta final en caja (`\boxed{}`).

Su relevancia es acotada pero clara para la comunidad de investigacion: documenta una receta reproducible de destilacion on-policy combinada con RL sobre un modelo base abierto de 9B, con datasets publicados (M3OPD-SFT-1.35M y M3OPD-RL-193K) y licencia Apache 2.0, lo que facilita la comparacion y la replicacion de experimentos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal derivada de Qwen3.5-9B (etiqueta de arquitectura en pesos: `qwen3_5`) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 40.960 tokens (valor usado en el ejemplo de despliegue con `--max-model-len 40960`; el maximo nativo de Qwen3.5-9B no se detalla en la informacion disponible) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (heredados de Qwen3.5-9B, sin listado explicito en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |
| Tamano del repositorio | 18,8 GB |
| Pipeline | image-text-to-text |
| Modelo base | Qwen/Qwen3.5-9B (relacion: finetune) |

## Arquitectura y entrenamiento

El modelo hereda integramente la arquitectura de Qwen3.5-9B, incluyendo tokenizador, procesador multimodal y plantilla de chat, por lo que es ejecutable en cualquier stack que soporte el modelo base (Transformers, vLLM, SGLang). No se especifica en la informacion disponible el detalle interno de la arquitectura (numero de capas, dimension oculta, mecanismo de atencion, encoder de vision), mas alla de la etiqueta `qwen3_5` en los pesos y su naturaleza image-text-to-text.

El entrenamiento consta de dos etapas. Primero, un SFT sobre MixSFT, la mezcla de datos supervisados de los tres dominios del proyecto, con 1,35 millones de ejemplos (dataset M3OPD-SFT-1.35M). Despues, un refinamiento con aprendizaje por refuerzo mediante GSPO sobre todos los prompts de M3OPD-RL-193K (193.000 prompts), usando los ajustes de los profesores de dominio. La model card enmarca la receta dentro de destilacion on-policy (on-policy distillation) combinada con RL. El checkpoint publicado es el paso 240. No se detalla el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas adicionales como DPO.

## Capacidades

- Generacion de texto y razonamiento multimodal: entrada de imagen y texto con salida textual (pipeline image-text-to-text).
- Modo thinking nativo de Qwen3.5: el entrenamiento y la evaluacion se realizan con thinking habilitado.
- Formato de respuesta final delimitada: se entrena con una linea de formato tras la pregunta, por ejemplo `Put your final answer within \boxed{}.`, orientada a tareas verificables.
- Razonamiento multi-paso: la receta incluye RL sobre prompts de razonamiento, lo que refuerza cadenas de razonamiento largas.
- Capacidades multilingues: no disponibles de forma explicita; se asumen las del modelo base Qwen3.5-9B.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes: no disponible en la informacion proporcionada.
- Capacidades de audio: no disponible.

## Casos de uso

- Investigacion en destilacion on-policy y RL: el modelo sirve como linea base reproducible para comparar recetas de SFT + GSPO frente a variantes del proyecto M3OPD-Reasoner, usando los datasets publicados.
- Razonamiento sobre documentos con imagenes: al ser image-text-to-text, puede responder preguntas que requieren leer graficos, tablas o diagramas y razonar sobre ellos con cadena de pensamiento explicita.
- Evaluacion de tecnicas de RL para razonamiento verificable: el formato `\boxed{}` permite extraer respuestas automaticamente y calcular recompensas en pipelines de RLVR o de evaluacion automatizada.
- Reproduccion de experimentos academicos: al compartir arquitectura y plantilla con Qwen3.5-9B y publicar los datasets de SFT y RL, permite replicar el paso 240 y comparar con otros checkpoints de la coleccion.
- Generacion de soluciones razonadas en dominios cientificos o matematicos con soporte visual: util para prototipos de tutoria o asistencia que requieran justificar el resultado paso a paso.
- Despliegue en infraestructura existente de Qwen3.5-9B: al ser compatible con vLLM y SGLang, se puede servir con `vllm serve ngqtrung/M3OPD-MixRL-Baseline-9B --max-model-len 40960` sin cambios en el stack.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo indica que el paso 240 es "el mejor checkpoint evaluado" de la receta, sin cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (BF16): aproximadamente 19 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda al menos 24 GB para contexto corto y bastante mas para contextos largos.
- Con contexto de 40.960 tokens, la cache KV crece de forma significativa; se recomienda planificar GPUs con 40-80 GB para uso comodo a maxima longitud.
- GPU recomendadas: A100 40/80 GB, H100 80 GB para produccion y contextos largos; L40S 48 GB como opcion intermedia.
- GPU de consumo: una RTX 4090 (24 GB) puede alojar los pesos en BF16 de forma ajustada y con contexto reducido; para contextos amplios o mayor paralelismo conviene cuantizacion, aunque el autor no publica variantes cuantizadas.
- Opciones de despliegue: Transformers, vLLM y SGLang (soportados explicitamente por la model card). llama.cpp u Ollama no se mencionan y no hay GGUF publicado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Notas |
|---|---|---|---|---|---|
| M3OPD-MixRL-Baseline-9B | 9,41B | 40.960 (configurado) | Imagen + texto | Apache 2.0 | Linea base SFT + GSPO, paso 240 |
| Qwen/Qwen3.5-9B | 9B (aprox.) | no disponible en la informacion | Imagen + texto | Apache 2.0 | Modelo base sin ajuste de la receta M3OPD |
| Otros checkpoints de la coleccion M3OPD-Reasoner | no disponible | no disponible | Imagen + texto | Apache 2.0 (presumible) | Variantes de la misma receta; el modelo principal no es esta linea base |

No se dispone de datos de benchmarks que permitan una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Es una linea base, no el modelo principal del paper; su rendimiento debe interpretarse en ese contexto.
- No se han publicado resultados de benchmarks, por lo que no hay evidencia cuantitativa de calidad en la informacion disponible.
- Sesgos conocidos: no documentados; hereda los del modelo base Qwen3.5-9B y los de los datasets M3OPD-SFT-1.35M y M3OPD-RL-193K, cuya composicion no se detalla.
- Riesgo de alucinacion: no evaluado en la informacion disponible; es esperable en tareas de razonamiento multimodal sin verificacion externa.
- Limitaciones de idioma: no se especifica el soporte multilingue; la receta se entrena con plantilla nativa y sin system prompt, lo que puede afectar al comportamiento fuera de ese formato.
- El modelo espera thinking habilitado, sin system prompt y con una linea de formato de respuesta; usarlo fuera de ese protocolo puede degradar los resultados.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3.5-9B y de los datasets empleados.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- No hay variantes cuantizadas publicadas, lo que limita el despliegue en hardware de consumo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ngqtrung/M3OPD-MixRL-Baseline-9B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset SFT: https://huggingface.co/datasets/ngqtrung/M3OPD-SFT-1.35M
- Dataset RL: https://huggingface.co/datasets/ngqtrung/M3OPD-RL-193K
- Coleccion M3OPD-Reasoner: https://huggingface.co/collections/ngqtrung/m3opd-reasoner-6aed5164d151b6643a1b3b2d
- Perfil del autor: https://huggingface.co/ngqtrung
- Colecciones del autor: https://huggingface.co/ngqtrung/collections

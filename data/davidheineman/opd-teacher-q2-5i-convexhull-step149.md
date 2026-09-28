# davidheineman/opd-teacher-Q2.5I-ConvexHull-step149

## Resumen

`opd-teacher-Q2.5I-ConvexHull-step149` es un ajuste fino del modelo `Qwen/Qwen2.5-1.5B-Instruct` publicado por David Heineman en Hugging Face. No se trata de un modelo de propósito general, sino de un artefacto de investigación: un «teacher» (modelo profesor) entrenado con RLVE y GRPO sobre un único entorno denominado `ConvexHull`, con dificultad 0. El checkpoint corresponde a la actualización número 150 (índice `step149`, basado en cero) y su función declarada es servir como profesor dentro de un experimento de destilación on-policy sobre 32 entornos.

La arquitectura es la del modelo base, un transformer decoder de tipo Qwen2 con 1.543.714.304 parámetros (aproximadamente 1,5 mil millones). Los pesos se convirtieron desde el checkpoint nativo final a safetensors de Hugging Face y se validaron contra los nombres y formas de tensor del modelo base, por lo que la estructura es idéntica a la de Qwen2.5-1.5B-Instruct. El repositorio ocupa 3,1 GB, lo que es coherente con pesos en fp16/bf16.

Su relevancia es metodológica más que práctica: documenta un pipeline de RL con recompensa verificable (GRPO sobre entornos ejecutables) y su uso como fuente de destilación. Con cero descargas y cero «likes» en el momento de redactar esta ficha, es un checkpoint de un sweep experimental, no un modelo pensado para producción. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (familia Qwen2), heredada de Qwen2.5-1.5B-Instruct |
| Parametros totales | 1.543.714.304 (1,54 B) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 32.768 tokens segun la documentacion publica del modelo base Qwen2.5-1.5B-Instruct; no se especifica en la model card de este checkpoint |
| Tipos de cuantizacion | No disponible. El repositorio solo contiene safetensors (3,1 GB, consistente con fp16/bf16). El autor no publica versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | Ingles (declarado en la model card: `language: en`) |
| Licencia | Apache 2.0 (se incluye el fichero `LICENSE` original de Qwen) |
| Formato de pesos | safetensors (libreria `transformers`) |
| Modelo base | Qwen/Qwen2.5-1.5B-Instruct (finetune) |
| Entorno de entrenamiento | `ConvexHull`, dificultad 0 |
| Algoritmo de RL | GRPO (150 actualizaciones) |
| Framework declarado | RLVE (`davidheineman/rlve`) |
| Pipeline | text-generation |
| Compatibilidad | `text-generation-inference`, `endpoints_compatible` |
| Fecha de publicacion | 28 de septiembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura no se modifica respecto del modelo base: un transformer decoder Qwen2 de 1,54 B de parametros, con los mismos nombres y formas de tensor (el autor indica que los pesos se validaron precisamente contra esos nombres y formas). No hay innovaciones arquitectonicas propias en este checkpoint.

El entrenamiento si es el elemento diferencial. Partiendo de Qwen2.5-1.5B-Instruct, se aplico RLVE (el framework del autor) con GRPO durante 150 actualizaciones sobre el entorno `ConvexHull` en dificultad 0, con recompensa presumiblemente verificable de forma programatica dada la naturaleza del entorno (calculo de envolventes convexas). El resultado publicado es el checkpoint final, `step149` en indexacion basada en cero. El run esta registrado en Weights & Biases con el identificador `90b0b7bb`, dentro del grupo de sweep `opd-teachers-20260927-191939`. No se especifican en la informacion disponible el volumen de tokens, la composicion del dataset, ni si hubo fases adicionales de DPO o RLHF mas alla del propio GRPO. No se documentan tecnicas de decodificacion especulativa ni mecanismos de atencion alternativos.

## Capacidades

- Generacion de texto conversacional: hereda la capacidad de chat del modelo base Qwen2.5-1.5B-Instruct, con formato de plantilla Qwen2.5.
- Razonamiento sobre el entorno `ConvexHull`: es la unica tarea para la que existe evidencia de entrenamiento especifico en este checkpoint.
- Rol de modelo profesor: su proposito declarado es generar trayectorias o respuestas que sirvan de supervision para un experimento de destilacion on-policy sobre 32 entornos.
- Multilingue: limitado. La model card declara unicamente ingles (`language: en`), aunque el modelo base tiene cobertura multilingue amplia que este ajuste puede haber degradado parcialmente.
- Tool calling / function calling: no documentado en la informacion disponible para este checkpoint; el modelo base Qwen2.5-1.5B-Instruct si lo soporta.
- Capacidades de agente y razonamiento multi-paso: no documentadas para este checkpoint.
- Vision, audio o modo «thinking» explicito: no disponibles.
- Capacidades generales (codigo, matematicas, conocimientos): no evaluadas ni documentadas en la informacion proporcionada.

## Casos de uso

- Destilacion on-policy en investigacion: es su uso previsto y explicito. El checkpoint actua como teacher que genera respuestas sobre el entorno `ConvexHull` para entrenar un modelo alumno dentro de un experimento de 32 entornos, aprovechando que ya ha sido optimizado con GRPO en esa tarea concreta.
- Estudio de aprendizaje por refuerzo con recompensa verificable: sirve como referencia reproducible de un pipeline RLVE + GRPO, con run de W&B enlazado, para comparar curvas de entrenamiento y comportamiento entre checkpoints del mismo sweep.
- Analisis de sobreajuste a un unico entorno: al haberse entrenado 150 pasos sobre una sola tarea, es un caso de estudio util para medir cuanto se degradan las capacidades generales de un modelo de 1,5 B tras RL especializado.
- Generacion de soluciones geometricas verificables (prototipo): en tareas de computacion geometrica del tipo del entorno `ConvexHull`, puede usarse para producir candidatos que despues se validan programaticamente; el filtrado por verificador es imprescindible.
- Baseline en experimentos de comparacion de algoritmos: como punto de partida frente a otros teachers del mismo sweep (`opd-teachers-20260927-191939`) para aislar el efecto del entorno y de la dificultad.
- Prototipado local de bajo coste: con 1,54 B de parametros y pesos de 3,1 GB, permite iterar en una unica GPU de consumo en flujos de experimentacion que no requieran calidad de frontera.
- Educacion y divulgacion tecnica: ilustrar de forma tangible que es un checkpoint intermedio de un sweep de RL y como se valida una conversion de pesos nativos a safetensors frente al modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, GSM8K, HumanEval, MATH ni de ninguna otra evaluacion, ni para el checkpoint ni comparado con el modelo base. El run de Weights & Biases (`90b0b7bb`) se enlaza, pero su contenido numerico no forma parte de la informacion proporcionada, por lo que no se reproduce aqui.

## Requisitos de hardware

- VRAM para inferencia en fp16/bf16: alrededor de 3,1 GB solo para los pesos; con cache KV y overhead del runtime, aproximadamente 4-5 GB para contextos cortos y mas a medida que crece la ventana. Cifras estimadas a partir del tamano del repositorio, no publicadas por el autor.
- VRAM en cuantizacion de 8 bits: en torno a 1,6 GB para los pesos (estimacion).
- VRAM en cuantizacion de 4 bits: en torno a 0,9-1,1 GB para los pesos (estimacion). Requiere convertir los pesos, ya que el autor no publica GGUF ni formatos cuantizados.
- GPU de consumo: si cabe. Una RTX 3060 de 12 GB, una RTX 4060 de 8 GB o una RTX 4090 lo ejecutan con holgura en fp16. En tarjetas de 4 GB solo seria viable con cuantizacion agresiva.
- GPU de centro de datos: A100, H100 y similares lo ejecutan sin limitaciones de memoria; sobredimensionadas para 1,5 B salvo que se busque throughput masivo.
- Opciones de despliegue: `transformers` (libreria declarada), Text Generation Inference (el modelo lleva el tag `text-generation-inference` y `endpoints_compatible`) y vLLM. Para llama.cpp u Ollama haria falta convertir los pesos a GGUF por cuenta propia.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| opd-teacher-Q2.5I-ConvexHull-step149 | 1,54 B | 32.768 tokens (heredado del base; no confirmado en la model card) | Apache 2.0 | Pesos safetensors en Hugging Face, 0 descargas |
| Qwen/Qwen2.5-1.5B-Instruct (modelo base) | 1,54 B | 32.768 tokens | Apache 2.0 | Ampliamente desplegado, con versiones GGUF y cuantizadas de terceros |
| meta-llama/Llama-3.2-1B-Instruct | 1,24 B | 128.000 tokens | Licencia comunitaria de Llama 3.2 | Ampliamente desplegado |
| HuggingFaceTB/SmolLM2-1.7B-Instruct | 1,7 B | 8.192 tokens | Apache 2.0 | Ampliamente desplegado |
| google/gemma-2-2b-it | 2,6 B | 8.192 tokens | Licencia de Gemma | Ampliamente desplegado |

Los datos de contexto y licencia de los modelos comparables proceden de su documentacion publica y no forman parte de la informacion proporcionada en la busqueda. La diferencia clave de este checkpoint no es de rendimiento, sino de proposito: es un teacher de un unico entorno frente a instructivos generalistas.

## Limitaciones y advertencias

- Especializacion extrema: el entrenamiento se limita a un solo entorno (`ConvexHull`) en dificultad 0. Es razonable esperar un estrechamiento del comportamiento y posible olvido catastrofico de capacidades generales tras 150 pasos de GRPO, aunque no se aportan mediciones que lo cuantifiquen.
- Sin evaluacion publicada: no hay benchmarks que permitan afirmar que el modelo conserva las capacidades del base ni que mejora en la tarea objetivo.
- Riesgo de alucinacion: no evaluado. Como cualquier modelo de 1,5 B, tiende a producir contenido plausible pero incorrecto, especialmente fuera del dominio de entrenamiento.
- Idioma: la model card declara unicamente ingles, lo que limita el uso en castellano y otros idiomas.
- Contexto: la ventana util depende del modelo base y no se valida en este checkpoint; ademas, la calidad de atencion a contexto largo en un modelo de 1,5 B es limitada.
- Sesgos: no documentados ni evaluados por el autor. Se heredan los sesgos del corpus de entrenamiento de Qwen2.5.
- Licencia: Apache 2.0 permite uso comercial, pero el repositorio incluye la licencia original de Qwen, por lo que conviene revisar ambas condiciones antes de un despliegue comercial.
- Artefacto de investigacion: cero descargas y cero interacciones en el momento de redactar la ficha. No hay garantia de mantenimiento, soporte ni actualizaciones.
- Uso responsable: pensado como profesor en un experimento de destilacion; emplearlo como asistente de produccion sin evaluacion previa no es recomendable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davidheineman/opd-teacher-Q2.5I-ConvexHull-step149
- Modelo base Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Run de entrenamiento en Weights & Biases: https://wandb.ai/david-heineman/rl-data-opd-teachers/runs/90b0b7bb
- Codigo de entrenamiento (RLVE): https://github.com/davidheineman/rlve
- Perfil del autor en Hugging Face: https://huggingface.co/davidheineman
- Pagina personal del autor: https://davidheineman.com/index.html

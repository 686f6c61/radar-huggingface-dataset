# kushasareen/qwen35-9b-ft-j100

## Resumen

kushasareen/qwen35-9b-ft-j100 es un ajuste fino (fine-tune) del modelo base Qwen/Qwen3.5-9B, desarrollado por el usuario kushasareen y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un checkpoint intermedio resultante de un proceso de aprendizaje por refuerzo (RL) tras 100 pasos de optimizacion, guardado tal cual por el entrenador, con pesos, configuracion y tokenizer listos para cargarse mediante `AutoModelForCausalLM.from_pretrained`.

El modelo forma parte del experimento identificado como `up_cmh_cispo_q359b_judge2_k4_16k_v5`, en el que se parte de Qwen3.5-9B y se aplica CISPO (un algoritmo de optimizacion de politica para RL) con una longitud de contexto de 16k sobre el conjunto de datos `contest_math_hard_v2`. La asignacion de credito se realiza mediante un LLM-juez (gemini-3.8-flash, rubrica v2) y se organizan equipos de 4 agentes ("teams of 4 by mail"), lo que sugiere un esquema de RL multi-agente con evaluacion automatica.

Por su naturaleza de checkpoint intermedio de investigacion (100 pasos, 0 descargas, 0 likes en el momento de la consulta), no debe considerarse un modelo listo para produccion, sino un artefacto experimental para reproducir o continuar el entrenamiento de RL. No se dispone de informacion publicada sobre benchmarks, idiomas soportados ni detalles completos de la arquitectura mas alla de lo que hereda del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen/Qwen3.5-9B; detalles especificos no disponibles) |
| Parametros totales | 9B (segun el nombre del modelo base; no confirmado en la model card) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 16k (longitud de entrenamiento CISPO indicada; contexto nativo del modelo base no disponible) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato por defecto del trainer de transformers; no confirmado explicitamente) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del modelo base Qwen/Qwen3.5-9B, un transformer de aproximadamente 9.000 millones de parametros. La model card no proporciona detalles adicionales sobre la arquitectura interna (numero de capas, dimension oculta, mecanismos de atencion, etc.), por lo que esa informacion debe consultarse en la ficha del modelo base.

El entrenamiento consiste en un ajuste fino por aprendizaje por refuerzo con el algoritmo CISPO, ejecutado durante 100 pasos de optimizacion sobre el dataset `contest_math_hard_v2` con una ventana de 16k tokens. La senal de recompensa proviene de un LLM-juez (gemini-3.8-flash con rubrica v2) que asigna credito a las respuestas, y el esquema organiza a los agentes en equipos de 4 ("teams of 4 by mail"). El experimento esta registrado en Weights & Biases con el identificador a7855255. No se especifica el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron fases previas de SFT o DPO.

## Capacidades

- Generacion de texto y razonamiento matematico: el ajuste se orienta especificamente a problemas de matematicas de competicion (`contest_math_hard_v2`), por lo que se espera un refuerzo en razonamiento paso a paso en ese dominio.
- Razonamiento multi-paso: el esquema de asignacion de credito con LLM-juez y equipos de agentes sugiere entrenamiento para tareas de razonamiento extendido.
- Herencia de capacidades del modelo base Qwen3.5-9B: al ser un fine-tune, conserva las capacidades generales del base (generacion, codigo, conocimiento general), aunque no se documentan explicitamente en esta ficha.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Investigacion en RL para matematicas: utilizar el checkpoint como punto de partida o referencia para reproducir el experimento CISPO sobre `contest_math_hard_v2`, comparando el efecto de 100 pasos de optimizacion frente al modelo base.
- Evaluacion de asignacion de credito con LLM-juez: emplear el modelo para estudiar como influye un juez automatico (gemini-3.8-flash, rubrica v2) en la calidad de las respuestas matematicas generadas.
- Ablaciones de entrenamiento: al ser un checkpoint intermedio (paso 100), sirve para analizar la curva de aprendizaje y decidir si continuar el entrenamiento con mas pasos.
- Generacion de soluciones a problemas de competicion: uso experimental para producir razonamientos matematicos extensos dentro de la ventana de 16k tokens.
- Desarrollo de pipelines de RL multi-agente: el esquema de "teams of 4" puede reutilizarse como base para experimentos de colaboracion entre agentes en tareas de razonamiento.
- Fine-tuning posterior: al estar en formato transformers con licencia Apache 2.0, puede servir como inicializacion para otros ajustes (SFT, DPO) en dominios matematicos o cientificos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo de ~9B parametros, en FP16 se requieren aproximadamente 18 GB de VRAM, y en cuantizacion de 8 bits unos 9-10 GB (estimacion orientativa, no confirmada por el autor).
- GPU recomendadas: no disponible en la informacion proporcionada; por tamano, cabria esperar A100, H100 o RTX 4090 para FP16, pero no se documenta.
- Compatibilidad con GPU de consumo: no confirmada; un modelo de 9B en cuantizacion de 4-8 bits podria caber en GPUs de consumo con 12-24 GB, pero no hay datos del autor.
- Opciones de despliegue: la model card indica carga mediante `AutoModelForCausalLM.from_pretrained` (transformers). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| kushasareen/qwen35-9b-ft-j100 | ~9B | 16k (entrenamiento) | Apache 2.0 | Hugging Face (0 descargas) | Checkpoint RL intermedio, sin benchmarks |
| Qwen/Qwen3.5-9B | ~9B | no disponible | no disponible | Hugging Face (modelo base) | Base del fine-tune; capacidades generales |
| Otros fine-tunes de Qwen3.5-9B | ~9B | variable | variable | Hugging Face | No se dispone de comparativas publicadas |

No se dispone de datos de rendimiento que permitan una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Checkpoint intermedio: solo 100 pasos de optimizacion, por lo que el modelo puede no haber convergido y presentar un rendimiento inestable.
- Ausencia de benchmarks: no hay evaluaciones publicadas que validen su calidad frente al modelo base u otras alternativas.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; el ajuste en matematicas no elimina este riesgo en otros dominios.
- Sesgos: no documentados por el autor; se heredan los del modelo base y los del dataset de entrenamiento.
- Idiomas: no se especifican los idiomas soportados; el entrenamiento se centra en problemas matematicos, posiblemente en ingles.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-9B puede tener sus propias condiciones que conviene verificar.
- Uso en produccion: no recomendado sin evaluacion previa, dado su caracter experimental y la falta de documentacion.
- Reproducibilidad: la model card referencia un experimento de W&B (a7855255) y un juez externo (gemini-3.8-flash), lo que dificulta la reproduccion completa sin acceso a esos recursos.

## Enlaces

- Hugging Face: https://huggingface.co/kushasareen/qwen35-9b-ft-j100
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Experimento W&B (referenciado en la model card): identificador a7855255 (URL no proporcionada)
- Paper o blog de CISPO: no disponible en la informacion proporcionada
- Repositorio de codigo: no disponible en la informacion proporcionada

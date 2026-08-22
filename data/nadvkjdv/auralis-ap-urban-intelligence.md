# nadvkjdv/auralis-ap-urban-intelligence

## Resumen

Auralis AP Urban Intelligence es un adaptador LoRA entrenado sobre el modelo base Qwen/Qwen2.5-1.5B-Instruct, diseñado para actuar como capa conversacional de la plataforma Auralis, un sistema de operaciones basado en evidencia para infraestructura urbana en Andhra Pradesh (India). El adaptador se encarga únicamente de gestionar conversaciones: saludos, seguimientos y explicaciones sobre el funcionamiento de la plataforma. No es la fuente de datos reales; todas las lecturas (meteorología, calidad del aire, caudal de ríos, tráfico, etc.) se obtienen mediante herramientas externas y se muestran al usuario sin pasar por el modelo.

Este enfoque es relevante porque separa explícitamente el razonamiento conversacional de la obtención de datos, evitando que un modelo de 1.5B de parámetros alucine mediciones plausibles pero incorrectas. La arquitectura es un LoRA (PEFT) con rank 16 sobre el modelo base Qwen2.5-1.5B-Instruct, y el adaptador tiene un tamaño de repositorio de 0.1 GB. El modelo está pensado para ejecutarse en CPU, aunque también funciona en GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5-1.5B-Instruct (base) + adaptador LoRA |
| Parametros totales | 1.5B (modelo base) + adaptador LoRA (no se especifica numero) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base Qwen2.5-1.5B-Instruct soporta 32768 tokens, pero no se indica para el adaptador) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 (hereda la licencia del modelo base) |
| Formato de pesos | safetensors (adaptador LoRA, via PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (PEFT) sobre el modelo base Qwen/Qwen2.5-1.5B-Instruct, que es un transformer de 1.5B de parametros con arquitectura causal de lenguaje. El adaptador se entrena con rango 16, alpha 32 y modulos objetivo `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. La tarea es CAUSAL_LM (generacion de texto).

No se proporcionan datos sobre el conjunto de entrenamiento (numero de tokens, composicion del dataset) ni sobre el proceso de alineacion (RLHF, DPO, etc.). La model card indica que el adaptador se ha entrenado especificamente para el vocabulario de civic intelligence de Andhra Pradesh, y que fuera de ese dominio el modelo vuelve al comportamiento base.

Una innovacion tecnica destacable es el diseño arquitectonico del sistema completo: el modelo conversacional esta deliberadamente separado de la capa de datos. El sistema prompt prohibe al modelo emitir cualquier medicion real, ya que todas las lecturas se obtienen mediante herramientas y se muestran directamente al usuario. Esto evita la alucinacion de datos en un modelo pequeno.

## Capacidades

- Generacion de texto conversacional: mantiene saludos, preguntas de seguimiento y explica el funcionamiento de la plataforma.
- Comprension de dominio: entiende vocabulario especifico de infraestructura urbana de Andhra Pradesh (calidad del aire, trafico, rios, etc.).
- Integracion con sistema de herramientas: el modelo no ejecuta herramientas, pero su salida puede ser complementada por respuestas basadas en datos reales obtenidos por el sistema.
- Multilingue: solo ingles (el modelo base Qwen2.5-1.5B-Instruct soporta mas idiomas, pero el adaptador esta entrenado para ingles).
- No soporta tool calling ni function calling de forma nativa; las herramientas se gestionan fuera del modelo.
- No tiene modo de razonamiento explicito; es un modelo pequeno orientado a conversacion ligera.

## Casos de uso

- **Asistente dentro de una plataforma de operaciones urbanas**: el adaptador se usa para responder preguntas sobre como usar la plataforma, por ejemplo "¿Que hace la pagina Trace?" o "¿Como interpreto el grafico de calidad del aire?". El modelo explica las funcionalidades sin inventar datos.
- **Interfaz de chat para operadores de infraestructura**: los trabajadores municipales pueden interactuar con el sistema mediante lenguaje natural para navegar por paneles, consultar el estado de las herramientas o recibir instrucciones de uso.
- **Soporte de primer nivel para ciudadanos**: en un portal de servicios urbanos, el modelo puede atender consultas basicas sobre como reportar incidencias, donde encontrar informacion, etc., siempre derivando a los datos reales cuando sea necesario.
- **Sistema de fallback para el asistente**: si el modelo no esta disponible (por ejemplo, por falta de recursos), el sistema responde directamente con los resultados de las herramientas sin pasar por el modelo conversacional, garantizando que la informacion critica siempre llegue al usuario.
- **Entrenamiento de personal**: se puede usar para crear simulacros de conversacion con nuevos operadores, mostrando como interactuar con la plataforma sin riesgo de dar datos incorrectos.
- **Prototipo de chatbot para smart city**: dado su bajo coste (0.1 GB de adaptador) y su licencia Apache 2.0, puede integrarse en prototipos de plataformas de ciudad inteligente en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de rendimiento (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con otros modelos.

## Requisitos de hardware

- **CPU**: segun la model card, el modelo corre en CPU con una latencia estimada de 10-30 segundos por respuesta para unos pocos cientos de tokens. No se indica la CPU concreta.
- **GPU**: con una GPU moderna, la latencia baja a menos de 1 segundo por respuesta. No se especifica el modelo de GPU.
- **VRAM**: no disponible en la informacion. Para el modelo base Qwen2.5-1.5B-Instruct en fp16 se estiman ~3 GB, en int8 ~1.5 GB y en int4 ~0.8 GB, pero no se confirma para este adaptador.
- **Opciones de despliegue**: se puede ejecutar con la libreria `transformers` y `peft` (como se muestra en el ejemplo de uso). No se menciona vLLM, llama.cpp, Ollama ni TGI, pero al ser un modelo base estandar, es compatible con estos frameworks si se usa el adaptador fusionado.
- **Latencia**: los valores de CPU y GPU estan indicados en la model card, pero no se proporcionan mediciones de throughput.

## Comparativa con modelos similares

No se dispone de comparaciones con otros modelos en la informacion proporcionada. Como referencia, el modelo base Qwen2.5-1.5B-Instruct es un modelo de 1.5B con contexto de 32768 tokens y licencia Apache 2.0. Otros modelos pequenos comparables en tamano y licencia abierta son Llama-3.2-1B-Instruct (MIT) y Phi-3.5-mini (MIT), pero no se tienen datos de rendimiento para comparar.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Auralis AP Urban Intelligence (adaptador) | 1.5B (base) | No disponible | Apache 2.0 | Adaptador LoRA especifico para conversacion en smart city |
| Qwen2.5-1.5B-Instruct | 1.5B | 32768 tokens | Apache 2.0 | Modelo base general |
| Llama-3.2-1B-Instruct | 1B | 128k tokens | MIT | Modelo general mas pequeño |

## Limitaciones y advertencias

- **Modelo pequeno**: no es un motor de razonamiento; no debe usarse para tareas de logica compleja ni para responder preguntas que requieran inferencia profunda.
- **Riesgo de alucinacion**: aunque el sistema prompt prohibe dar mediciones reales, el modelo podria generar datos plausibles si se le pide directamente. No debe usarse como fuente de hechos sobre el mundo real.
- **Dominio restringido**: el adaptador esta entrenado para vocabulario de civic intelligence de Andhra Pradesh; fuera de ese dominio, el modelo vuelve al comportamiento base de Qwen, que puede no ser adecuado para tareas especificas.
- **Idioma**: solo soporta ingles. No hay soporte para otros idiomas en el adaptador.
- **Licencia**: Apache 2.0, pero se hereda la licencia del modelo base, que es Apache 2.0 tambien, por lo que es utilizable comercialmente sin restricciones adicionales (salvo las del propio modelo base).
- **Dependencia de herramientas externas**: el modelo no puede obtener datos por si mismo; para aplicaciones reales se requiere la infraestructura de herramientas que lo acompañan en la plataforma Auralis.
- **No disponible**: no se especifican detalles de entrenamiento (dataset, tokens, tecnicas de alineacion), por lo que se desconoce el sesgo potencial derivado del entrenamiento.

## Enlaces

- HuggingFace: https://huggingface.co/nadvkjdv/auralis-ap-urban-intelligence
- Plataforma Auralis AI (referencia del sistema que usa el adaptador): https://auralis.ai/

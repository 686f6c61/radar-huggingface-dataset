# mjpsm/project-creation-qwen2.5-1.5b-sft-v1

## Resumen

El modelo `project-creation-qwen2.5-1.5b-sft-v1` es un ajuste fino supervisado (SFT) del modelo base Qwen2.5-1.5B-Instruct, desarrollado por el usuario mjpsm para la plataforma educativa MyVillage. Su proposito es generar proyectos de equipo para estudiantes: recibe una peticion breve que indica una audiencia (primaria, secundaria, bachillerato o universidad) y un tema, y devuelve un titulo y una descripcion de proyecto en un formato Markdown fijo. Cada proyecto gira en torno a un artefacto tecnologico concreto (un juego, una simulacion, una historia ramificada, un chatbot, un robot, etc.) que el equipo debe construir.

El modelo es relevante por su especializacion extrema: no es un asistente generalista, sino un generador de contenido pedagogico con formato controlado, pensado para integrarse en un pipeline mayor que genera las actividades paso a paso por separado. Con 1.543 millones de parametros, es lo bastante pequeno para ejecutarse en CPU (aunque con latencia de uno o dos minutos por generacion) y en GPUs de consumo, lo que lo hace accesible para despliegues educativos de bajo coste.

Arquitectura transformer decoder-only de la familia Qwen2, fine-tuneada mediante QLoRA sobre 900 pares de peticion/proyecto y fusionada en el modelo base. Se distribuye bajo licencia Apache 2.0 y solo declara soporte para ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 1.543.714.304 (~1,5 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; el modelo base admite cuantizacion GGUF/AWQ, pero no se documenta para este fine-tune) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B-Instruct, un transformer decoder-only denso con atencion causal estandar, y se ajusta mediante QLoRA con aprendizaje supervisado (SFT). El conjunto de entrenamiento consta de 1.000 pares `input`/`output`, de los cuales 900 se usaron para entrenamiento; el split restante no se detalla en la informacion disponible. El dataset se construyo a partir de 6 proyectos semilla escritos y aprobados por el autor, presumiblemente ampliados hasta el millar de ejemplos. Los adaptadores LoRA se fusionaron en el modelo base, por lo que se distribuye un unico checkpoint denso listo para inferencia.

No se documenta el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si hubo etapas de RLHF o DPO posteriores al SFT. Tampoco se describen innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.). El formato de salida esta fuertemente constrenido por los ejemplos de entrenamiento: el modelo reproduce la estructura `**Project Title: ...**` seguida de `**Project Description:**` y 3-4 parrafos, con una longitud tipica de 1.300-1.800 caracteres.

## Capacidades

- Generacion de titulos y descripciones de proyectos educativos en Markdown con formato fijo.
- Adaptacion del contenido a cuatro niveles de audiencia: primaria, secundaria, bachillerato y universidad.
- Seleccion autonoma del tipo de artefacto tecnologico adecuado al tema (juego, simulacion, herramienta interactiva, historia ramificada, dashboard, chatbot, robot, simulador).
- Descripcion del producto final y de los criterios de finalizacion del proyecto, sin incluir instrucciones paso a paso (delegadas a la plataforma MyVillage).
- Aceptacion de peticiones formuladas de forma libre y coloquial ("What would be a good project for college students learning about cybersecurity?").
- Conversacion mediante plantilla de chat (`apply_chat_template`) con system prompt especifico.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, vision, audio ni modo de pensamiento extendido.

## Casos de uso

- Generacion automatica de proyectos en la plataforma MyVillage: el modelo actua como primer eslabon de un pipeline que produce el titulo y la descripcion del proyecto, y la plataforma genera despues las actividades paso a paso. Su formato de salida fijo permite parsear titulo y descripcion con expresiones regulares de forma fiable.
- Creacion de catalogos de proyectos por nivel educativo: un centro puede generar lotes de proyectos para primaria, secundaria o bachillerato sobre un temario concreto (ciclo del agua, cambio climatico, ciberseguridad) y revisarlos antes de publicarlos.
- Prototipado rapido de actividades docentes: un profesor introduce un tema y una audiencia y obtiene en segundos un borrador de proyecto con criterios de finalizacion, que luego adapta manualmente.
- Generacion de contenido para talleres de tecnologia o extraescolares: el modelo propone artefactos construibles (juegos, simulaciones, chatbots) adecuados al material disponible y a la edad del grupo.
- Despliegue en entornos con recursos limitados: al ejecutarse en CPU o en GPUs de consumo, puede alojarse en el propio centro escolar o en un Space gratuito de Hugging Face sin depender de APIs externas de pago.
- Integracion via API REST: el Space `mjpsm/project-creation-api` expone un endpoint `/predict` que acepta un JSON con el campo `prompt` (8-1.500 caracteres) y devuelve `title`, `description` y `model`, lo que facilita su incorporacion en aplicaciones web educativas.
- Generacion de ideas para clubes de ciencia o ferias de proyectos: dado un tema y un nivel, el modelo propone un proyecto concreto con un artefacto tecnologico como entregable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp16/bf16): aproximadamente 3-4 GB para los pesos, mas overhead de activaciones y cache KV; en la practica, unos 4-6 GB.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 2 GB; en 4 bits, alrededor de 1 GB (estimaciones para el tamano de 1,5 B, no verificadas para este checkpoint).
- GPU recomendadas: cualquier GPU con 6 GB o mas de VRAM (RTX 3060, RTX 4060, RTX 4090, A100, H100). El modelo es sobredimensionado para GPUs de datacenter.
- Cabe en GPUs de consumo: si, en la mayoria de tarjetas modernas con 6 GB o mas; tambien en Apple Silicon mediante `device_map="auto"`.
- Ejecucion en CPU: posible, pero una generacion completa de 650 tokens puede tardar uno o dos minutos. Con GPU o Apple Silicon, unos segundos.
- Opciones de despliegue: transformers (probado por el autor), text-generation-inference (tag `text-generation-inference` en el repo), endpoints compatibles de Hugging Face. No se documenta soporte explicito para vLLM, llama.cpp u Ollama, aunque el modelo base Qwen2.5-1.5B-Instruct si suele estar disponible en esos formatos.
- Latencia y throughput: el Space publico corre en CPU gratuita y tarda aproximadamente 1-2 minutos por peticion, mas el tiempo de arranque si el Space esta dormido. No se publican cifras de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| project-creation-qwen2.5-1.5b-sft-v1 | ~1,5 B | No disponible | Generacion de proyectos educativos (formato fijo) | Apache 2.0 | Hugging Face + Space API |
| Qwen/Qwen2.5-1.5B-Instruct | ~1,5 B | No disponible en la informacion proporcionada | Asistente generalista, multilingue | Apache 2.0 | Hugging Face |
| mjpsm/project-creation-qwen2.5-1.5b-sft-v1-lora | ~1,5 B (base + adaptadores) | No disponible | Misma tarea, adaptadores LoRA sin fusionar | No disponible | Hugging Face |

La comparativa con alternativas de otros autores no esta disponible en la informacion proporcionada. Frente a su modelo base, la diferencia principal es la especializacion: el fine-tune produce salidas en el formato Markdown exacto que espera MyVillage, mientras que el modelo base requeriria ingenieria de prompts mas elaborada y no garantiza la estructura.

## Limitaciones y advertencias

- Modelo altamente especializado: fuera de la generacion de proyectos educativos con el formato entrenado, su calidad como asistente general sera inferior a la del modelo base.
- Solo declara soporte para ingles; el rendimiento en castellano no esta documentado y previsiblemente sera deficiente en el formato entrenado.
- Riesgo de alucinacion en detalles pedagogicos o tecnicos: el modelo puede proponer artefactos o criterios de finalizacion poco realistas para el material o el tiempo disponible.
- Sesgo hacia los 6 proyectos semilla y los 900 ejemplos de entrenamiento: la diversidad tematica y de formatos puede ser limitada, con riesgo de repetir estructuras o ideas.
- No se documentan evaluaciones cuantitativas (benchmarks, tasas de alucinacion, evaluacion humana), por lo que la calidad real no esta verificada de forma independiente.
- La longitud de contexto no esta documentada; las salidas de 1.300-1.800 caracteres caben en 650 tokens, pero entradas muy largas pueden no estar soportadas.
- El Space publico corre en CPU gratuita con latencia de 1-2 minutos y posibles tiempos de arranque en frio; no es adecuado para produccion con requisitos de baja latencia sin desplegar en GPU propia.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre la idoneidad del contenido generado para menores ni sobre su exactitud curricular.
- No se documentan capacidades de tool calling ni de agentes, por lo que no debe emplearse en flujos que dependan de ellas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mjpsm/project-creation-qwen2.5-1.5b-sft-v1
- Adaptadores LoRA: https://huggingface.co/mjpsm/project-creation-qwen2.5-1.5b-sft-v1-lora
- API alojada (Space): https://huggingface.co/spaces/mjpsm/project-creation-api
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct

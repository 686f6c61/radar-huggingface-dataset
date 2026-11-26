# selorahomes/Selora-AI-14B

## Resumen

Selora AI 14B es un modelo de lenguaje instruido específicamente para Home Assistant, desarrollado por Selora Homes. Se construye sobre Qwen3-14B mediante cinco adaptadores LoRA especializados que comparten una única base y se intercambian en caliente según la intención de cada petición: control de dispositivos, creación de automatizaciones, respuesta sobre el estado del hogar, aclaración de peticiones ambiguas y consulta de documentación. El objetivo es resolver el problema de la interacción en lenguaje natural con un hogar domótico sin depender de servicios en la nube, con un consumo de memoria ajustado a unos 16 GB.

La relevancia del modelo reside en su enfoque de despliegue local en hardware de gama media (Selora Hubs de 32 GB de RAM) y en su formato de salida compacto en JSON, diseñado para integrarse directamente con la API de Home Assistant. El modelo se distribuye en GGUF con la base cuantizada a Q5_K_S (10,3 GB) más los cinco adaptadores en F16 (entre 26 y 96 MB cada uno), lo que reduce el coste total a unos 10,5 GB de pesos frente a los cinco modelos independientes que serían necesarios en un enfoque convencional.

Es importante señalar que esta ficha corresponde a un bundle de cinco adaptadores que el autor ha marcado como **obsoleto** a partir de la versión v0.8.1. Los archivos permanecen disponibles para integraciones antiguas, pero el desarrollo continúa en un modelo fusionado único (`selorahomes/Selora-AI-LLM-14B-ollama`). La licencia es Apache-2.0 y el idioma declarado es únicamente inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-14B) con cinco adaptadores LoRA especializados |
| Parametros totales | 14.768.307.200 (base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 4096 tokens (presupuesto de entrenamiento y de `runtime.ctx_size`) |
| Tipos de cuantizacion | Base en GGUF Q5_K_S; adaptadores LoRA en F16 |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (base + 5 adaptadores LoRA), Modelfile para Ollama |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-14B, un transformer decoder-only de 14.768 millones de parámetros, sobre el que se entrenaron cinco adaptadores LoRA de bajo rango. Cada adaptador se especializa en una intención concreta y comparte la misma base, de modo que el runtime carga los pesos una sola vez y aplica el adaptador correspondiente por petición mediante `--lora-init-without-apply` en `llama-server`. Los adaptadores tienen tamaños muy dispares (26 MB para aclaración, 96 MB para automatizaciones), lo que refleja la complejidad de cada tarea: la generación de YAML de blueprints requiere más capacidad que una pregunta de seguimiento.

El entrenamiento se realizó sobre un corpus propio orientado a Home Assistant, con prompts de sistema fijos por especialista que se publican en el repositorio (`prompts/{intent}_system_prompt.txt`). Ambas líneas del proyecto (1.7B y 14B) se entrenaron con el mismo corpus y los mismos prompts, y emiten el mismo formato de "slim envelopes" JSON compacto. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. La cuantización Q5_K_S se eligió explícitamente frente a Q4_K_M porque esta última degradaba de forma medible la precisión en la consulta de documentación.

## Capacidades

- Control de dispositivos del hogar: traducción de lenguaje natural a llamadas de servicio de Home Assistant (`command`).
- Autoría de automatizaciones y blueprints en YAML, con declaración y cableado de todas las entradas solicitadas (`automation`).
- Respuesta a preguntas sobre el estado en vivo del hogar (`answer`).
- Formulación de preguntas de aclaración ante peticiones ambiguas (`clarification`).
- Consulta de documentación con citas para mantenimiento, resolución de problemas y configuración (`utilities`).
- Soporte de tool use / function calling, implícito en la emisión de llamadas de servicio de Home Assistant.
- Salida estructurada en JSON compacto (slim envelopes) consumible directamente por la integración.
- Intercambio en caliente de adaptadores por petición sin recargar la base.
- Capacidades multilingües: únicamente inglés declarado.

## Casos de uso

- Control por voz o texto de dispositivos domóticos: el adaptador `command` convierte "turn off the kitchen lights" en la llamada de servicio correspondiente de Home Assistant, con contexto de 4096 tokens suficiente para el historial reciente de la conversación.
- Generación de automatizaciones para usuarios no técnicos: el adaptador `automation` produce YAML de blueprint que Home Assistant acepta, con todas las entradas declaradas y cableadas, evitando que el usuario tenga que escribir YAML a mano.
- Asistente de estado del hogar: el adaptador `answer` responde a preguntas como el estado de una entidad o el valor de un sensor consultando el estado en vivo, adecuado para paneles de control conversacionales.
- Desambiguación en interfaces de voz: el adaptador `clarification` genera preguntas de seguimiento cuando la petición es ambigua ("enciende la luz" sin especificar cuál), reduciendo ejecuciones erróneas en producción.
- Soporte técnico y mantenimiento guiado: el adaptador `utilities` responde con documentación citada sobre configuración y resolución de problemas, útil para integradores que instalan o depuran un hub.
- Despliegue en hardware de borde: con ~16 GB de memoria total (modelo, caché KV y Home Assistant), el modelo cabe en un Selora Hub de 32 GB de RAM o en un mini-PC con GPU de gama media, sin enviar datos del hogar a la nube.
- Integración en pipelines de domótica existentes: mediante `llama-server` con soporte LoRA o Ollama 0.30+ por especialista, se puede exponer un endpoint compatible con la integración `ha-selora-ai`.

## Benchmarks y rendimiento

Resultados medidos sobre el suite abierto `allenporter/home-assistant-datasets` (el harness del leaderboard de Home Assistant), a temperatura 0, con llama.cpp sobre CUDA y la cuantización de distribución. Se reportan dos modos: "model only" (sin los overrides deterministas de la integración) y "net + model" (con los overrides en el bucle).

| Dataset | Casos | Model only | Net + model |
|---|---|---|---|
| assist | 460 | 85,9% [82,4; 88,8] | 92,2% [89,4; 94,3] |
| assist-mini | 196 | 95,9% [92,2; 97,9] | 100,0% [98,1; 100,0] |
| questions | 370 | 91,9% [88,7; 94,3] | 94,6% [91,8; 96,5] |
| automations | 20 | 100,0% [83,9; 100,0] | 100,0% [83,9; 100,0] |

Intervalos de Wilson al 95%. La tarea `automations` son cuatro tareas de blueprint con cinco muestras cada una; una respuesta se considera válida si Home Assistant la acepta como blueprint con todas las entradas solicitadas declaradas y cableadas, sin ejecutar la automatización. El autor indica que el build fusionado único puntúa dos puntos por debajo en `assist` con los overrides activados.

## Requisitos de hardware

- Memoria: aproximadamente 16 GB para el modelo, la caché KV y Home Assistant ejecutándose junto.
- Pesos: ~10,5 GB en total (base Q5_K_S de 10,3 GB más los cinco adaptadores F16).
- GPU recomendadas: no se especifican modelos concretos; el autor reporta mediciones con llama.cpp sobre CUDA. Por tamaño, cabe en GPUs consumer con 16 GB o más de VRAM (por ejemplo, RTX 4080/4090) y en aceleradores de datacenter (A100, H100) con holgura.
- Cabe en GPU consumer: sí, en tarjetas con al menos 16 GB de VRAM, o en configuraciones CPU/GPU mixtas.
- Opciones de despliegue: `llama-server` de llama.cpp con soporte LoRA (`--lora-init-without-apply --lora ...`), u Ollama 0.30+ con un Modelfile por especialista.
- Contexto de ejecución: `--ctx-size 4096`, alineado con el presupuesto de entrenamiento.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Selora AI 14B (este) | 14,77B | 4096 | 5 LoRA sobre Qwen3-14B para Home Assistant | Apache-2.0 | GGUF en HF (obsoleto, v0.8.1) |
| Selora AI LLM 1.7B | ~1,7B | no disponible | Misma línea, menor huella de memoria | Apache-2.0 | HF |
| Selora AI LLM 14B (fused) | 14,77B | no disponible | Modelo fusionado único, sucesor de este bundle | Apache-2.0 | HF (`-ollama`) |
| Qwen3-14B (base) | 14,77B | mayor que 4096 (no especificado aquí) | Modelo generalista sin especialización domótica | Apache-2.0 | HF |

No se dispone de datos de benchmarks comparativos frente a alternativas generalistas en la información proporcionada.

## Limitaciones y advertencias

- **Modelo obsoleto**: el bundle de cinco adaptadores fue retirado tras v0.8.1 y no recibe más actualizaciones; el autor recomienda migrar al modelo fusionado `selorahomes/Selora-AI-LLM-14B-ollama`.
- Idioma: solo inglés declarado; no hay soporte verificado de castellano ni de otros idiomas.
- Contexto limitado a 4096 tokens, insuficiente para conversaciones muy largas o documentos extensos.
- Especialización estrecha: está entrenado para Home Assistant y puede degradarse fuera de ese dominio.
- Riesgo de alucinación en la generación de YAML de automatizaciones y en la consulta de documentación; los benchmarks de `automations` se evalúan sin ejecutar la automatización, por lo que la validez semántica no está garantizada.
- Las cifras "net + model" se obtuvieron con la aprobación y la allowlist de comandos seguros desactivadas, y la métrica `questions` está inflada en casos de calendario por fixtures que aportan datos que un Home Assistant real no tiene.
- La licencia Apache-2.0 permite uso comercial, pero se debe conservar el aviso de atribución a Qwen3 incluido en `NOTICE`.
- Requiere runtime con soporte de intercambio de adaptadores LoRA (llama.cpp con `--lora-init-without-apply` u Ollama 0.30+ por especialista); otros servidores de inferencia pueden no soportar este esquema.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/selorahomes/Selora-AI-14B
- Modelo fusionado sucesor: https://huggingface.co/selorahomes/Selora-AI-LLM-14B-ollama
- Línea 1.7B: https://huggingface.co/selorahomes/Selora-AI-LLM-1.7B
- Modelo base Qwen3-14B: https://huggingface.co/Qwen/Qwen3-14B
- Integración Home Assistant: https://github.com/SeloraHomes/ha-selora-ai
- Suite de evaluación: https://github.com/allenporter/home-assistant-datasets
- Sitio del autor: https://selorahomes.com
- Home Assistant: https://www.home-assistant.io/

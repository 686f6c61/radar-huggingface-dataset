# Skdnslxbls/DeepSeek-R1

## Resumen

DeepSeek-R1 es un modelo de razonamiento de gran escala desarrollado por DeepSeek AI, presentado como la primera generacion de modelos de razonamiento de la compania. Su principal innovacion es demostrar que las capacidades de razonamiento de un LLM pueden incentivarse mediante aprendizaje por refuerzo (RL) a gran escala sobre el modelo base, sin depender de un ajuste supervisado (SFT) previo como paso obligatorio. La variante DeepSeek-R1-Zero valido este enfoque de forma pura, mientras que DeepSeek-R1 incorpora datos de arranque en frio (cold-start) antes del RL para corregir problemas de repetibilidad, legibilidad y mezcla de idiomas.

El modelo emplea la arquitectura deepseek_v3 (transformer de tipo Mixture of Experts) y cuenta con 684.489.845.504 parametros totales segun los pesos en safetensors del repositorio. Los pesos se distribuyen en formato fp8, con un tamano de repositorio de 688,6 GB. La model card declara compatibilidad con text-generation-inference y endpoints_compatible, y esta etiquetado con la arquitectura deepseek_v3 y codigo personalizado (custom_code).

La relevancia de este lanzamiento radica en su comparabilidad declarada con OpenAI-o1 en tareas de matematicas, codigo y razonamiento, y en la publicacion abierta tanto del modelo completo como de seis modelos densos destilados a partir de el (1.5B, 7B, 8B, 14B, 32B y 70B, basados en Qwen2.5 y Llama3). El repositorio aqui descrito es una copia publicada por el usuario Skdnslxbls bajo licencia MIT, con cero descargas y cero likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | deepseek_v3 (transformer Mixture of Experts) |
| Parametros totales | 684.489.845.504 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la model card trunca la tabla de descargas en este punto) |
| Tipos de cuantizacion | pesos en fp8; otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (fp8) |

## Arquitectura y entrenamiento

DeepSeek-R1 se construye sobre la arquitectura deepseek_v3, un transformer con capas de tipo Mixture of Experts, segun la etiqueta de arquitectura del repositorio. El entrenamiento sigue un pipeline de cuatro etapas: dos fases de RL orientadas a descubrir patrones de razonamiento mejorados y alinearse con preferencias humanas, y dos fases de SFT que sirven como semilla para las capacidades de razonamiento y no razonamiento del modelo. La variante DeepSeek-R1-Zero se entreno aplicando RL directamente sobre el modelo base sin SFT previo, lo que hizo emerger comportamientos como autoverificacion, reflexion y generacion de cadenas de pensamiento largas.

Una de las aportaciones tecnicas destacadas es la validacion de que el razonamiento puede incentivarse unicamente mediante RL, sin necesidad de SFT. Ademas, el equipo demuestra que los patrones de razonamiento de modelos grandes pueden destilarse en modelos densos mas pequenos, obteniendo mejores resultados que los que se lograrian descubriendo esos patrones mediante RL directamente en modelos pequenos. No se dispone en la informacion proporcionada del numero de tokens de entrenamiento, la composicion exacta del dataset ni detalles sobre el uso de DPO.

## Capacidades

- Generacion de texto y razonamiento complejo con cadenas de pensamiento largas (long CoT).
- Autoverificacion y reflexion durante el proceso de razonamiento.
- Rendimiento destacado en matematicas, codigo y tareas de razonamiento, comparable a OpenAI-o1 segun la model card.
- Generacion de datos de razonamiento reutilizables para destilar modelos mas pequenos.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita, aunque las capacidades de CoT largo son la base para ello.
- Capacidades multilingues: no disponible; la model card menciona la mezcla de idiomas como un problema corregido en R1 frente a R1-Zero.
- Modo thinking: implicito en el diseno del modelo (razonamiento explicito antes de la respuesta), aunque no se detalla un flag de activacion.
- Vision y audio: no disponibles.

## Casos de uso

- Razonamiento matematico asistido: el modelo puede resolver problemas de matematicas de varios pasos generando cadenas de pensamiento explicitas, util para herramientas educativas o de verificacion de calculos.
- Generacion y revision de codigo: adecuado para tareas de programacion que requieren planificacion previa, dado su rendimiento declarado en benchmarks de codigo comparable a o1.
- Destilacion de modelos mas pequenos: el modelo puede emplearse para generar datos de razonamiento con los que afinar modelos densos de 1.5B a 70B, tal como hizo el propio equipo de DeepSeek.
- Investigacion en RL para LLMs: sirve como referencia abierta para estudiar como el RL sin SFT previo hace emerger comportamientos de razonamiento.
- Prototipado de asistentes de analisis: su capacidad de reflexion y autoverificacion encaja en flujos donde se necesita contrastar hipotesis antes de responder.
- Evaluacion comparativa de modelos de razonamiento: util como baseline abierto frente a modelos propietarios en pruebas internas de matematicas y logica.
- Despliegue en infraestructura propia: al publicarse con licencia MIT y pesos safetensors, permite integraciones en entornos controlados sin dependencia de API, aunque con requisitos de hardware muy elevados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona de forma cualitativa que DeepSeek-R1 alcanza un rendimiento comparable a OpenAI-o1 en matematicas, codigo y razonamiento, y que DeepSeek-R1-Distill-Qwen-32B supera a OpenAI-o1-mini en varios benchmarks, pero no se incluyen las tablas numericas en el contenido proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: con 684.489.845.504 parametros en fp8, los pesos ocupan aproximadamente 685 GB; se necesita un nodo multi-GPU con al menos esa capacidad agregada, mas memoria para el estado de inferencia y el contexto.
- GPU recomendadas: clusters de GPU de centro de datos (H100, A100 80GB) en configuracion multi-nodo; no es viable en una sola GPU consumer.
- Cabe en consumer GPU: no. Ni siquiera en RTX 4090 (24 GB) ni en configuraciones multi-GPU de gama alta domesticas.
- Opciones de despliegue: transformers con custom_code, text-generation-inference (declarado en los tags) y endpoints_compatible. Otras opciones como vLLM, llama.cpp u Ollama no estan confirmadas en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-R1 (este repo) | 684.489.845.504 | no disponible | comparable a OpenAI-o1 en matemáticas, código y razonamiento (declarado) | MIT | pesos safetensors fp8 |
| DeepSeek-R1-Zero | no disponible | no disponible | razonamiento emergente via RL puro; problemas de repeticion y mezcla de idiomas | MIT (según model card) | abierto por DeepSeek |
| DeepSeek-R1-Distill-Qwen-32B | 32B (denso) | no disponible | supera a OpenAI-o1-mini en varios benchmarks (declarado) | MIT (según model card) | abierto por DeepSeek |
| OpenAI-o1 | no disponible (propietario) | no disponible | referencia de comparacion declarada | propietaria | solo API |

## Limitaciones y advertencias

- El repositorio es una copia publicada por un tercero (Skdnslxbls) con cero descargas y cero likes; no es el repositorio oficial de DeepSeek AI, por lo que conviene verificar la integridad de los pesos antes de usarlos en produccion.
- La model card esta truncada en la informacion disponible: faltan la longitud de contexto, los parametros activos y la tabla completa de descargas.
- DeepSeek-R1-Zero presento problemas de repeticion sin fin, legibilidad pobre y mezcla de idiomas; aunque R1 los mitiga con datos de arranque en frio, el riesgo de respuestas excesivamente largas o divagantes persiste en modelos de razonamiento de este tipo.
- Riesgo de alucinacion inherente a los LLM, especialmente en dominios factuales donde el razonamiento extenso puede reforzar premisas erroneas.
- Idiomas soportados no declarados; el comportamiento multilingue no esta garantizado.
- Requisitos de hardware extremos (aproximadamente 685 GB solo en pesos fp8), lo que limita su uso a infraestructura de centro de datos.
- Aunque la licencia es MIT, al tratarse de una copia no oficial conviene contrastar los terminos con el repositorio original de DeepSeek antes de un uso comercial.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Skdnslxbls/DeepSeek-R1
- Repositorio oficial de DeepSeek AI en Hugging Face: https://huggingface.co/deepseek-ai
- Paper de DeepSeek-R1: https://github.com/deepseek-ai/DeepSeek-R1/blob/main/DeepSeek_R1.pdf
- Repositorio GitHub de DeepSeek-R1: https://github.com/deepseek-ai/DeepSeek-R1
- Licencia en GitHub: https://github.com/deepseek-ai/DeepSeek-R1/blob/main/LICENSE
- Web oficial: https://www.deepseek.com/
- Chat: https://chat.deepseek.com/
- Discord: https://discord.gg/Tc7c45Zzu5
- Twitter/X: https://twitter.com/deepseek_ai
- arXiv: https://arxiv.org/abs/2501.12948

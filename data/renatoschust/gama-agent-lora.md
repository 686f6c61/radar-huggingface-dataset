# renatoschust/gama-agent-lora

## Resumen

GAMA Agent 35B LoRA es un adaptador LoRA publicado por renatoschust (gamAI) sobre el modelo base Qwen/Qwen3.5-35B-A3B, un transformer MoE de la familia Qwen 3.5. El adaptador está especializado en comportamiento de agente y tool calling para bosnio y las variantes regionales de croata y serbio, además de inglés. Se distribuye como repositorio PEFT con pesos en safetensors de aproximadamente 3,7 GB, con rango r=16, alpha=16 y sin dropout.

El objetivo del modelo es cubrir la brecha de modelos de agentes en lenguas eslavas del sur (bs/hr/sr), un nicho poco atendido por los fine-tunes de tool calling disponibles, que suelen centrarse en inglés. El adaptador se entrenó con SFT y DPO sobre el stack de transformers, trl, peft y unsloth, apuntando tanto a las proyecciones de atención como a las de MLP, incluidas las proyecciones de expertos del MoE.

La relevancia actual radica en que permite obtener un agente conversacional multilingüe regional partiendo de un MoE de 35B con licencia Apache-2.0, sin necesidad de entrenar desde cero. El adaptador está pensado para fusionarse con los pesos base o para continuar el entrenamiento; para inferencia lista para usar, el autor remite a la versión cuantizada GGUF del repositorio principal gama-agent.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer MoE Qwen3.5-35B-A3B |
| Parametros totales | no disponible (adaptador de ~3,7 GB; el modelo base es un MoE de 35B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF disponible en el repositorio gama-agent (tipos concretos no disponibles) |
| Idiomas soportados | bs (bosnio), hr (croata), sr (serbio), en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adapter_model.safetensors), PEFT |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen/Qwen3.5-35B-A3B, un modelo base con arquitectura Mixture of Experts. El LoRA es de tipo "fused-expert MoE LoRA", con rango 16, alpha 16 y dropout 0, y tiene como objetivos las capas de atención y de MLP, incluyendo las proyecciones de los expertos del MoE, dentro del stack de texto y lenguaje. La tarea declarada es CAUSAL_LM.

El entrenamiento se realizó con transformers, trl, peft y unsloth, e incluye fases de SFT y DPO según las etiquetas del repositorio. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni detalles sobre la mezcla de datos por idioma. Tampoco se documentan innovaciones técnicas adicionales más allá del enfoque de LoRA sobre proyecciones de expertos.

## Capacidades

- Generación de texto conversacional en bosnio, croata, serbio e inglés.
- Tool calling y function calling, orientado a flujos de agente.
- Comportamiento de agente multi-paso (etiqueta "agent" en el repositorio).
- Entrenamiento con SFT y DPO, lo que sugiere alineación con preferencias en tareas de agente.
- Soporte de plantilla de chat propia (chat_template.jinja) y tokenizer incluidos.
- Capacidades multilingües limitadas a los cuatro idiomas declarados.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito ("thinking mode") en la información disponible.

## Casos de uso

- Asistentes de atención al cliente en bosnio, croata y serbio: el adaptador está afinado para conversación multi-turno y tool calling, lo que permite integrarlo en un backend que consulte APIs de pedidos o estado de cuenta y responda en la lengua del usuario.
- Automatización de soporte interno con agentes: al soportar function calling, puede conectarse a sistemas de ticketing o bases de conocimiento corporativas y ejecutar acciones estructuradas en lugar de solo generar texto.
- Generación de código asistida en inglés dentro de pipelines: el modelo base Qwen3.5 aporta capacidad de código y el adaptador mantiene el formato de tool calling necesario para integrarse en entornos de CI/CD o asistentes de IDE.
- Extracción estructurada de datos de conversaciones en lenguas regionales: útil para normalizar formularios o registros en bosnio/croata/serbio y volcarlos a JSON mediante llamadas a funciones.
- Chatbots de dominio público para administraciones o medios locales en los Balcanes: el soporte nativo de bs/hr/sr reduce la necesidad de traducción intermedia y mejora la naturalidad de las respuestas.
- Investigación en adaptación de agentes a lenguas de bajos recursos: el adaptador sirve como punto de partida para continuar entrenamiento (SFT/DPO) con datasets propios, dado que se distribuye en formato PEFT.
- Despliegue en entornos con recursos limitados: al ser un adaptador LoRA, permite servir múltiples variantes sobre una única instancia del modelo base, reduciendo el coste de memoria frente a pesos completos duplicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador en sí ocupa ~3,7 GB en safetensors, pero la inferencia requiere cargar el modelo base Qwen3.5-35B-A3B completo.
- VRAM estimada para el modelo base en bfloat16: no disponible con precisión; un MoE de 35B en bf16 requiere del orden de decenas de GB, aunque al ser MoE solo se activan una fracción de parámetros por token.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño del modelo base, se esperaría hardware de clase A100/H100 o GPUs consumer de gama alta con cuantización, pero no hay datos confirmados.
- Despliegue: el autor recomienda usar el GGUF cuantizado del repositorio renatoschust/gama-agent para inferencia lista para usar; también es posible cargar y fusionar con transformers + peft. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| gama-agent-lora (este) | LoRA sobre MoE 35B | no disponible | bs, hr, sr, en | Apache-2.0 | PEFT safetensors |
| Qwen/Qwen3.5-35B-A3B (base) | MoE 35B | no disponible | multilingüe (no detallado) | Apache-2.0 | safetensors |
| renatoschust/gama-agent | MoE 35B fusionado | no disponible | bs, hr, sr, en | Apache-2.0 | GGUF |

No se dispone de información sobre benchmarks ni sobre otros adaptadores comparables de tool calling en bosnio/croata/serbio en la información proporcionada.

## Limitaciones y advertencias

- El adaptador no es un modelo autónomo: requiere cargar el modelo base Qwen/Qwen3.5-35B-A3B para funcionar.
- Cobertura lingüística limitada a bs, hr, sr y en; no se garantiza calidad en otras lenguas.
- Riesgo de alucinación inherente a los modelos generativos; el tool calling puede producir llamadas mal formadas o argumentos incorrectos, por lo que conviene validar las salidas en producción.
- No se documentan evaluaciones de sesgo ni de seguridad; se desconoce el comportamiento en dominios sensibles.
- El entrenamiento con SFT y DPO puede introducir sesgos de estilo o de dominio derivados de los datos utilizados, que no se detallan.
- Licencia Apache-2.0 permite uso comercial, pero se hereda del modelo base; conviene verificar las condiciones del modelo Qwen3.5-35B-A3B.
- No hay información sobre longitud de contexto efectiva tras el fine-tuning; el adaptador podría degradar el rendimiento en contextos muy largos respecto al base.
- El repositorio tiene muy pocas descargas (27) y ningún "like", lo que sugiere poca validación comunitaria.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/renatoschust/gama-agent-lora
- Modelo fusionado / GGUF: https://huggingface.co/renatoschust/gama-agent
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
- Repositorio GitHub: https://github.com/gamai-io/gama-agent
- Sitio del autor: https://gamai.io
- Endpoint de inferencia en FriendliAI: https://friendli.ai/models/renatoschust/gama-agent-lora

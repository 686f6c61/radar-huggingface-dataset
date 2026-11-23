# Jahirrrr/Klyra-350M-Chat

## Resumen

Klyra-350M-Chat (publicado en el repositorio como Klyra-350M-ChatAgent) es un modelo de lenguaje de pequeno tamano desarrollado por el usuario Jahirrrr, obtenido mediante ajuste fino supervisado con LoRA sobre el modelo base LiquidAI/LFM2.5-350M-Base y publicado como pesos fusionados (fully merged). Cuenta con 354.483.968 parametros y esta orientado a conversacion en ingles y a invocacion ligera de herramientas (tool calling). Su proposito es servir como base experimental para chatbots, asistentes de mensajeria y prototipos de soporte al cliente en entornos con recursos limitados.

El modelo hereda la arquitectura LFM2.5 de Liquid AI y se distribuye en formato safetensors con precision BF16, con un tamano de repositorio de aproximadamente 0,7 GB. Es un modelo unicamente en ingles, con licencia LFM Open License v1.0, lo que condiciona su uso comercial. El autor lo describe explicitamente como experimental, sin garantias de fiabilidad en produccion ni de capacidades de contexto extendido.

Su relevancia radica en la tendencia hacia modelos pequenos especializados que pueden ejecutarse en hardware modesto y desplegarse en asistentes conversacionales de bajo coste. No obstante, al no contar con descargas ni validacion publica en el momento de la consulta, debe tratarse como un artefacto de investigacion mas que como un componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2.5 (transformer, segun modelo base) |
| Parametros totales | 354.483.968 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | en (ingles) |
| Licencia | LFM Open License v1.0 (etiquetada como "other") |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre LiquidAI/LFM2.5-350M-Base y conserva la arquitectura LFM2.5 de Liquid AI. El ajuste se realizo mediante LoRA con supervision (supervised fine-tuning) y posteriormente se fusionaron los adaptadores en los pesos base, dando lugar a un modelo independiente en BF16. La model card no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

El autor menciona un "formato de entrenamiento experimental" para el uso de herramientas, lo que implica que el modelo ha sido expuesto a ejemplos de function calling durante el ajuste, pero sin una especificacion publica del esquema. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal especifica de esta variante.

## Capacidades

- Generacion de texto conversacional en ingles, orientada a dialogos multi-turno.
- Invocacion de herramientas y function calling estructurado, segun el formato experimental de entrenamiento del autor.
- Soporte de plantilla de chat mediante `apply_chat_template` en la libreria transformers.
- Uso previsto en asistentes de mensajeria (WhatsApp, Telegram) y experimentos de soporte al cliente.
- Capacidades multilingues limitadas al ingles.
- No se documentan capacidades de vision, audio, modo de razonamiento explicito ni agentes multi-paso verificados.

## Casos de uso

- Prototipos de chatbot conversacional: el modelo puede gestionar dialogos simples en ingles con bajo coste computacional, adecuado para validar flujos de conversacion antes de escalar a modelos mayores.
- Asistentes de mensajeria (WhatsApp, Telegram): su tamano reducido permite desplegarlo en infraestructura modesta para respuestas automatizadas de primer nivel.
- Experimentos de soporte al cliente: util para probar respuestas a preguntas frecuentes y derivacion a agentes humanos en entornos de laboratorio.
- Invocacion de funciones en aplicaciones: puede generar llamadas estructuradas a APIs en prototipos, siempre que una capa externa valide y ejecute las llamadas.
- Generacion de respuestas en pipelines de bajo consumo: adecuado para tareas de texto corto donde la latencia y el coste importan mas que la precision.
- Educacion e investigacion: sirve como caso de estudio de ajuste fino LoRA fusionado sobre un modelo base pequeno de Liquid AI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 0,7 GB para los pesos, mas overhead de activaciones y cache KV; en la practica cabe en GPUs consumer con 4 GB o mas.
- Cuantizacion a 8 bits o 4 bits reduciria aun mas el requisito, aunque no se publican versiones GGUF oficiales.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) o incluso CPU para inferencia en lote pequeno; GPUs de datacenter (A100, H100) innecesarias por el tamano.
- Opciones de despliegue: transformers (soporte oficial documentado); vLLM, llama.cpp, Ollama o TGI no estan verificados en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Klyra-350M-Chat | 354M | no disponible | LFM Open License v1.0 | Hugging Face (0 descargas) |
| LiquidAI/LFM2.5-350M-Base | ~350M | no disponible | LFM Open License v1.0 | Hugging Face (modelo base) |
| Qwen2.5-0.5B-Instruct | ~500M | 32K (segun documentacion publica del modelo) | Apache 2.0 | Hugging Face |
| SmolLM2-360M-Instruct | ~360M | 8K (segun documentacion publica del modelo) | Apache 2.0 | Hugging Face |

Los datos de contexto y licencia de los modelos comparables provienen de su documentacion publica; el rendimiento comparativo no puede establecerse sin benchmarks publicados de Klyra.

## Limitaciones y advertencias

- Modelo experimental: el propio autor advierte que no se garantiza la fiabilidad en produccion.
- Solo ingles: no soporta castellano ni otros idiomas de forma fiable.
- Riesgo de alucinacion elevado por su tamano reducido y falta de evaluacion publica.
- Tool calling experimental: requiere validacion externa de las llamadas generadas antes de ejecutarlas.
- Licencia LFM Open License v1.0: impone restricciones que deben revisarse antes de cualquier uso comercial.
- Los datasets de entrenamiento pueden imponer requisitos adicionales no detallados.
- Sin descargas ni likes en el momento de la consulta: ausencia de validacion por la comunidad.
- Longitud de contexto no documentada: no apta para tareas que requieran ventanas largas sin verificacion previa.
- Sesgos conocidos: no documentados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jahirrrr/Klyra-350M-Chat
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-350M-Base
- Licencia LFM Open License v1.0: https://huggingface.co/LiquidAI/LFM2.5-350M-Base/blob/main/LICENSE

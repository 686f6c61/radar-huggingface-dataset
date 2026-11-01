# celebibasar/DroidSenior-7B-GGUF

## Resumen

DroidSenior-7B-GGUF es la distribucion en formato GGUF del modelo DroidSenior-7B, un asistente de codigo de 7B parametros especializado en desarrollo Android/Kotlin, publicado por el usuario celebibasar en HuggingFace. El modelo parte de una base Qwen2 (segun las etiquetas del repositorio) y ha sido ajustado mediante LoRA, SFT y DPO para responder con el estilo de un ingeniero Android senior, priorizando Kotlin moderno, Jetpack Compose, Coroutines/Flow, Hilt y Room frente a APIs obsoletas.

Esta version GGUF esta pensada para inferencia local ligera: los cuantizados Q4_K_M (4,7 GB) y Q5_K_M (4,6 GB) caben en GPUs de 8 GB de VRAM o en Macs con Apple Silicon de 16 GB de memoria unificada, y se integran directamente con Ollama, LM Studio y llama.cpp. El modelo declara soporte para ingles y turco, licencia Apache 2.0 y esta orientado a generacion de texto conversacional. El repositorio tiene 17,4 GB y, en el momento de la consulta, cero descargas y cero likes, lo que indica que es un lanzamiento muy reciente y practicamente sin validacion externa.

El interes practico esta en disponer de un asistente de codigo Android ejecutable en hardware de consumo, sin dependencia de APIs en la nube, con un system prompt predefinido que fuerza respuestas idiomaticas y explicaciones breves de decisiones de diseno. Al no existir benchmarks publicados, la evaluacion debe basarse en pruebas propias sobre el stack Android del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, base Qwen2 (derivada de las etiquetas del repo) |
| Parametros totales | 7.615.616.512 (7,6 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M (4,7 GB), Q5_K_M (4,6 GB), Q8_0 (8,1 GB) |
| Idiomas soportados | Ingles (en), turco (tr) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base DroidSenior-7B es un transformer decoder-only de 7,6 mil millones de parametros construido sobre Qwen2, segun las etiquetas del repositorio. El ajuste se realizo en tres etapas declaradas en las etiquetas: LoRA, SFT (supervised fine-tuning) y DPO (direct preference optimization), con el objetivo de alinear las respuestas hacia practicas Android modernas y descartar APIs deprecadas. La model card de esta version GGUF remite al repositorio principal para los detalles de entrenamiento y evaluacion, por lo que no se dispone aqui de informacion sobre volumen de tokens, composicion del dataset ni hiperparametros.

La innovacion tecnica principal de esta publicacion es la distribucion cuantizada para inferencia local: se ofrecen tres niveles de compresion con perdida progresiva, desde Q4_K_M hasta Q8_0, este ultimo descrito por el autor como el mas cercano a la calidad original. No se documentan tecnicas adicionales como decodificacion especulativa, atencion lineal o arquitecturas hibridas.

## Capacidades

- Generacion de codigo Kotlin idiomatico orientado a Android moderno: Jetpack Compose, Coroutines/Flow, Hilt y Room.
- Asistencia de codigo conversacional con explicaciones breves de decisiones de diseno y trade-offs.
- Evitacion explicita de APIs deprecadas y de sobreingenieria, segun el system prompt recomendado.
- Generacion de tests cuando aportan valor, segun el mismo system prompt.
- Respuesta en el idioma del usuario (el prompt indica "Answer in the user's language").
- Soporte multilingue declarado limitado a ingles y turco.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente o razonamiento multi-paso: no documentadas.
- Vision, audio o thinking mode explicito: no disponibles.

## Casos de uso

- Migracion de vistas XML a Jetpack Compose: el modelo puede reescribir pantallas y layouts legacy en composables modernos, justificando brevemente la estructura elegida y evitando APIs obsoletas.
- Revision de codigo Android en local: integrado en el IDE o en un hook de pre-commit mediante llama.cpp u Ollama, permite detectar uso de APIs deprecadas y proponer alternativas idiomaticas sin enviar el codigo a servicios externos.
- Generacion de capas de datos: creacion de entidades Room, DAOs y repositorios con Coroutines/Flow, adecuado porque el modelo esta ajustado especificamente sobre ese stack.
- Configuracion de inyeccion de dependencias con Hilt: generacion de modulos, scopes y bindings para proyectos Android, con explicaciones de las decisiones de arquitectura.
- Asistencia a desarrolladores junior: el tono de "senior engineer" y las explicaciones de trade-offs lo hacen util como mentor en entornos de formacion o pair programming.
- Prototipado en dispositivos de gama media: al caber en 8 GB de VRAM o en un Mac de 16 GB, puede ejecutarse en estaciones de trabajo modestas o incluso en entornos de desarrollo sin GPU dedicada mediante llama.cpp en CPU.
- Documentacion tecnica de modulos Android: redaccion de notas de arquitectura y justificacion de decisiones a partir del codigo existente, en ingles o turco.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: Q4_K_M y Q5_K_M caben en 8 GB de VRAM; Q8_0 requiere aproximadamente 9-10 GB de VRAM para pesos y overhead de contexto (estimacion a partir de los tamanos de fichero declarados).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 y H100 para Q8_0 con contexto amplio; cualquier GPU con 8 GB o mas para Q4_K_M.
- Consumer GPU: si, el modelo cuantizado Q4_K_M esta disenado explicitamente para GPUs de 8 GB y Macs Apple Silicon de 16 GB.
- Opciones de despliegue: Ollama (`ollama run hf.co/celebibasar/DroidSenior-7B-GGUF:Q4_K_M`), llama.cpp, LM Studio y cualquier runtime compatible con GGUF. El repositorio incluye un `Modelfile` para Ollama.
- Plantilla de chat: ChatML, segun la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DroidSenior-7B-GGUF | 7,6 B | No disponible | Asistente Android/Kotlin | Apache 2.0 | GGUF en HuggingFace, Ollama |
| Qwen2.5-Coder-7B | 7 B | 32 768 tokens (segun documentacion publica del modelo base) | Codigo general | Apache 2.0 | safetensors y GGUF |
| CodeLlama-7B | 7 B | 16 384 tokens (segun documentacion publica) | Codigo general | Llama 2 license | safetensors y GGUF |

La comparativa con Qwen2.5-Coder-7B y CodeLlama-7B se ofrece como referencia de categoria; no se dispone de datos de rendimiento de DroidSenior-7B que permitan una comparacion cuantitativa. Su ventaja diferencial es la especializacion en el stack Android moderno y el tono de ingeniero senior, no el rendimiento bruto en benchmarks generales de codigo.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de calidad frente a modelos de codigo establecidos.
- Cero descargas y cero likes en el momento de la consulta: el modelo no ha sido validado por la comunidad.
- Idiomas limitados a ingles y turco; el castellano no esta declarado, aunque el prompt pide responder en el idioma del usuario, lo que puede degradar la calidad en espanol.
- Longitud de contexto no documentada: riesgo de truncamiento en bases de codigo grandes o conversaciones largas.
- Riesgo de alucinacion en APIs, librerias y versiones de Android; conviene verificar todo codigo generado antes de llevarlo a produccion.
- Sesgos potenciales derivados del dataset de ajuste, no documentado; pueden manifestarse en preferencias de librerias o patrones de arquitectura concretos.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen2 y el origen de los datos de entrenamiento deberian revisarse en el repositorio principal antes de un despliegue comercial.
- El cuantizado Q4_K_M introduce perdida de calidad respecto al modelo original; para produccion sensible conviene Q8_0 o los safetensors del modelo base.
- No se documentan capacidades de tool calling ni de agente, por lo que no debe asumirse su disponibilidad en pipelines automatizados.

## Enlaces

- Repositorio GGUF: https://huggingface.co/celebibasar/DroidSenior-7B-GGUF
- Modelo base: https://huggingface.co/celebibasar/DroidSenior-7B
- Perfil del autor: https://huggingface.co/celebibasar
- Ollama: https://ollama.com
- llama.cpp: https://github.com/ggerganov/llama.cpp
- LM Studio: https://lmstudio.ai

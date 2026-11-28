# kmhkAb/qwen3.5-0.8b-rag-ft

## Resumen

qwen3.5-0.8b-rag-ft es un ajuste fino (fine-tuning) del modelo Qwen/Qwen3.5-0.8B, desarrollado por el usuario kmhkAb y publicado en Hugging Face bajo licencia Apache-2.0. Se trata de un modelo de lenguaje de aproximadamente 752 millones de parametros (0,8B) orientado especificamente a tareas de generacion de respuestas cortas en pipelines de RAG (Retrieval-Augmented Generation). El autor lo entrena sobre el corpus JSQuAD, parte del benchmark japones JGLUE, con prompts construidos de forma automatica.

El modelo hereda la arquitectura del Qwen3.5-0.8B original, un transformer decoder-only de la familia Qwen, y se distribuye en formato safetensors con un tamano de repositorio de 1,5 GB. La relevancia de esta ficha es limitada pero concreta: se trata de un ajuste fino de nicho, con cero descargas y cero likes en el momento de la consulta, pensado para responder preguntas factuales cortas a partir de contexto recuperado, principalmente en japones.

Al ser un modelo de 0,8B, su interes practico reside en el despliegue en entornos con recursos muy limitados (CPU, GPUs de gama baja o dispositivos edge), donde modelos mayores no son viables. No obstante, la informacion publicada por el autor es muy escasa: no hay datos de benchmarks, ni de composicion detallada del dataset, ni de hiperparametros de entrenamiento, por lo que muchas especificaciones deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5, segun el modelo base) |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no publicadas por el autor) |
| Idiomas soportados | no disponible (el dataset de ajuste fino es japones: JSQuAD/JGLUE) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Qwen/Qwen3.5-0.8B, un transformer decoder-only de la familia Qwen3.5 con aproximadamente 752 millones de parametros. La model card no detalla la arquitectura interna (numero de capas, dimensiones ocultas, mecanismo de atencion, uso de RoPE, etc.), por lo que esos datos deben consultarse en la ficha del modelo base. El tag `qwen3_5_text` en Hugging Face sugiere que se trata de la variante exclusivamente de texto de la familia, sin modulo de vision.

El entrenamiento se realizo sobre JSQuAD, el subconjunto de lectura comprensiva del benchmark japones JGLUE (licencia CC BY-SA 4.0), con prompts construidos de forma automatica ("machine-constructed prompts"). El objetivo declarado es la generacion de respuestas cortas para RAG. No se especifican el numero de tokens de entrenamiento, la composicion exacta del dataset, la presencia de RLHF/DPO, ni los hiperparametros (learning rate, epochs, batch size). Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto y respuesta a preguntas extractivas y cortas a partir de un contexto proporcionado en el prompt (orientado a RAG).
- Comprension lectora en japones, dado que el ajuste fino se realizo sobre JSQuAD/JGLUE.
- Respuestas de formato corto, adecuadas para integrarse en pipelines que necesitan salidas concisas.
- Capacidades heredadas del modelo base Qwen3.5-0.8B: generacion de texto general, razonamiento basico y posible soporte multilingue, aunque no verificadas ni documentadas para este ajuste fino.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado; el ajuste esta orientado a respuesta corta, no a planificacion.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Respuesta a preguntas sobre documentacion interna en japones: el modelo recibe un fragmento recuperado por un buscador vectorial y devuelve una respuesta corta y extractiva; su tamano de 0,8B permite desplegarlo en CPU junto al motor de recuperacion sin apenas coste.
- Asistente de FAQ en atencion al cliente: integrado en un pipeline RAG, responde consultas frecuentes con respuestas breves a partir de una base de conocimiento, reduciendo la latencia frente a modelos mayores.
- Extraccion de respuestas en formularios o chatbots de soporte tecnico: al estar ajustado para salidas cortas, encaja en flujos donde se espera un dato concreto (fecha, nombre, valor) en lugar de texto libre.
- Prototipado rapido de sistemas RAG: sirve como modelo de referencia de bajo coste para validar la arquitectura de recuperacion antes de escalar a modelos mayores.
- Despliegue en entornos edge o sin GPU: con 752 millones de parametros y pesos en safetensors de 1,5 GB, puede ejecutarse en dispositivos con poca memoria o en CPU, util para demos y entornos con restricciones de hardware.
- Evaluacion comparativa de ajustes finos en japones: util como linea base para experimentos academicos sobre JSQuAD y para medir el efecto de distintos esquemas de prompting en tareas extractivas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5-2 GB en fp16 (752 millones de parametros), y en torno a 0,5-1 GB con cuantizacion de 4 bits, aunque el autor no publica versiones cuantizadas.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 4060); tambien es viable en CPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU moderna de gama media o baja.
- Opciones de despliegue: transformers (PyTorch) de forma nativa al estar en safetensors; llama.cpp, Ollama o vLLM requeririan conversion previa a GGUF u otros formatos, no publicados por el autor.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| kmhkAb/qwen3.5-0.8b-rag-ft | 752.393.024 | no disponible | apache-2.0 | Ajuste fino para RAG corto sobre JSQuAD |
| Qwen/Qwen3.5-0.8B (modelo base) | ~0,8B | no disponible | apache-2.0 (segun model card) | Modelo generalista sin ajuste especifico para RAG |
| Alternativas de tamano similar | no disponible | no disponible | no disponible | No se dispone de datos verificados de otros modelos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al entrenarse sobre JSQuAD (japones), puede presentar sesgos propios del corpus y del modelo base.
- Riesgo de alucinacion: presente como en cualquier modelo de lenguaje; el ajuste para respuestas cortas no elimina la posibilidad de generar contenido no sustentado en el contexto.
- Limitaciones de contexto e idioma: la longitud de contexto no esta documentada y el ajuste fino se realizo unicamente en japones, por lo que el rendimiento en castellano u otros idiomas no esta garantizado.
- Restricciones de licencia: el modelo se publica bajo Apache-2.0, pero el dataset de entrenamiento (JSQuAD/JGLUE) tiene licencia CC BY-SA 4.0, lo que puede condicionar la redistribucion de datos derivados.
- Caveats para produccion: cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados ni documentacion de hiperparametros; se recomienda evaluacion propia antes de cualquier uso en produccion.
- El modelo esta disenado para respuestas cortas, por lo que no es adecuado para generacion long-form, razonamiento complejo ni tareas de agente.

## Enlaces

- Hugging Face: https://huggingface.co/kmhkAb/qwen3.5-0.8b-rag-ft
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- JGLUE (repositorio del benchmark): https://github.com/yahoojapan/JGLUE

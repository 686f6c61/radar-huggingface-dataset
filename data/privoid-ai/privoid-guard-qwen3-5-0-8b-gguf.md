# Privoid-ai/Privoid-Guard-Qwen3.5-0.8B-GGUF

## Resumen

Privoid Guard 0.8B GGUF es la distribucion en formato GGUF para llama.cpp de Privoid-ai/Privoid-Guard-Qwen3.5-0.8B, un modelo de guardarrail de 0,8 mil millones de parametros disenado para clasificar texto como `injection` o `benign` antes de que una aplicacion de IA lo procese. Lo desarrolla Privoid-ai y se publica bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

El modelo resuelve un problema concreto de seguridad en produccion: la deteccion de prompt injection y jailbreak en la entrada del usuario. A diferencia de clasificadores tradicionales basados en BERT, aqui se parte de un modelo de la familia Qwen3.5 afinado para una tarea de clasificacion binaria, y se distribuye en cuantizaciones que van de F16 a Q4_K_M para permitir inferencia en dispositivo (on-device) con llama.cpp.

Su relevancia actual radica en el tamano reducido (772.845.888 parametros reales segun safetensors) y en la disponibilidad de pesos GGUF listos para `llama-server`, lo que facilita desplegar un firewall de LLM local sin dependencias de API externas. El autor reporta F1 de 0,898 en deepset/prompt-injections y 0,743 en jackhhao/jailbreak-classification sobre conjuntos de test publicos no vistos en entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3.5), afinado para clasificacion de texto |
| Parametros totales | 772.845.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q4_K_M |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo base es Privoid-ai/Privoid-Guard-Qwen3.5-0.8B, un afinamiento de la familia Qwen3.5 con 772.845.888 parametros. La model card indica que se uso Unsloth en el proceso de entrenamiento (tag `unsloth`), aunque no se detalla el numero de tokens, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. La tarea es de clasificacion binaria con etiquetas `injection` y `benign`, y el pipeline declarado en HuggingFace es `text-classification`.

La innovacion practica no esta en la arquitectura sino en el empaquetado: se ofrecen tres cuantizaciones GGUF (F16 de 1,56 GB, Q8_0 de 0,83 GB y Q4_K_M de 0,54 GB) verificadas en llama.cpp. El autor indica que cada fichero fue cargado y etiqueto correctamente un ataque obvio y una peticion inofensiva antes de subirse. No se documentan innovaciones como decodificacion especulativa o atencion lineal.

## Capacidades

- Clasificacion binaria de texto de entrada como `injection` o `benign`.
- Deteccion de prompt injection y jailbreak en peticiones a aplicaciones LLM.
- Ejecucion local y offline mediante llama.cpp, sin llamadas a API externas.
- Integracion como guardarrail previo a un LLM principal (firewall de LLM).
- Inferencia en dispositivo gracias a las cuantizaciones Q4_K_M y Q8_0.
- Compatibilidad con `llama-server` y el flag `--jinja` para plantillas de chat.
- Soporte unicamente de ingles; no se declaran capacidades multilingues, de codigo, vision ni audio.
- No se documenta tool calling, function calling ni razonamiento multi-paso.

## Casos de uso

- Filtrado previo de entradas en un chatbot: cada mensaje del usuario se clasifica con el modelo antes de pasarlo al LLM principal; si la etiqueta es `injection`, se bloquea o se deriva a revision, reduciendo el riesgo de manipulacion del sistema.
- Firewall de LLM en aplicaciones RAG: se intercala el guardarrail entre la consulta del usuario y el recuperador, de modo que instrucciones maliciosas no lleguen a contaminar la generacion ni el contexto recuperado.
- Despliegue on-device en aplicaciones de escritorio o moviles: con la cuantizacion Q4_K_M (0,54 GB) el modelo cabe en equipos con recursos limitados y funciona sin conexion, lo que es adecuado para asistentes locales que no pueden enviar texto a la nube.
- Moderacion de contenido generado por usuarios en foros o comentarios: se clasifican los textos entrantes para detectar intentos de jailbreak dirigidos a bots publicos integrados en la plataforma.
- Proteccion de agentes autonomos: antes de que un agente ejecute una accion basada en texto externo (correo, web, documento), el guardarrail etiqueta la entrada y evita que instrucciones inyectadas activen herramientas no deseadas.
- Evaluacion y monitorizacion de seguridad en CI/CD: se ejecuta el modelo sobre un corpus de prompts de prueba para medir la tasa de deteccion y detectar regresiones antes de desplegar cambios en el sistema de IA.
- Servicio de guardarrail como microservicio: se levanta con `llama-server -hf Privoid-ai/Privoid-Guard-Qwen3.5-0.8B-GGUF:Q8_0 --jinja` y se expone por HTTP para que varias aplicaciones internas lo consulten.

## Benchmarks y rendimiento

| Conjunto de evaluacion | Metrica | Resultado |
|---|---|---|
| deepset/prompt-injections | F1 | 0,898 |
| jackhhao/jailbreak-classification | F1 | 0,743 |

Los resultados corresponden a conjuntos de test publicos no utilizados en entrenamiento, segun la model card. No se publican resultados de MMLU, HumanEval, GSM8K ni comparativas numericas detalladas con ProtectAI DeBERTa v2 en la informacion disponible; la model card remite a la pagina principal del modelo base para ver graficas y comparativas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6 GB con Q4_K_M, 0,9 GB con Q8_0 y 1,7 GB con F16, sumando overhead del runtime.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM; tambien funciona en CPU.
- Cabe en GPU consumer: si, en practicamente cualquier tarjeta moderna (GTX 1650, RTX 3060, RTX 4090) e incluso en CPU.
- Opciones de despliegue: llama.cpp y `llama-server`; el formato GGUF es compatible con Ollama y otros runtimes basados en llama.cpp. No se documenta soporte para vLLM o TGI en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | F1 prompt injection | Licencia | Formato |
|---|---|---|---|---|---|
| Privoid Guard 0.8B GGUF | 772.845.888 | no disponible | 0,898 (deepset) | apache-2.0 | GGUF |
| ProtectAI DeBERTa v2 | no disponible en la informacion | no disponible | no disponible | no disponible | no disponible |
| Alternativas de guardarrail de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

La model card menciona una comparacion con ProtectAI DeBERTa v2 en la pagina principal del modelo base, pero no se proporcionan los valores numericos en la informacion disponible. No se dispone de datos suficientes para comparar con otras alternativas.

## Limitaciones y advertencias

- Solo soporta ingles; el rendimiento en otros idiomas no esta documentado y probablemente sea deficiente.
- El F1 en jackhhao/jailbreak-classification (0,743) es notablemente inferior al de deepset/prompt-injections (0,898), lo que sugiere menor robustez frente a jailbreaks que frente a inyecciones directas.
- No se documentan sesgos conocidos, pero al ser un modelo afinado sobre datasets publicos de seguridad puede heredar los sesgos de esos corpus.
- Riesgo de falsos negativos: ataques novedosos u ofuscados pueden clasificarse como `benign`; no debe usarse como unica capa de defensa.
- Riesgo de falsos positivos: texto legitimo con instrucciones imperativas puede etiquetarse como `injection` y bloquear flujos validos.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre la eficacia del modelo en produccion.
- No se especifica la longitud de contexto, lo que limita la planificacion de entradas largas.
- El modelo esta pensado como clasificador, no como generador; no debe esperarse de el comportamiento conversacional general.

## Enlaces

- HuggingFace (GGUF): https://huggingface.co/Privoid-ai/Privoid-Guard-Qwen3.5-0.8B-GGUF
- Modelo base: https://huggingface.co/Privoid-ai/Privoid-Guard-Qwen3.5-0.8B
- Dataset deepset/prompt-injections: https://huggingface.co/datasets/deepset/prompt-injections
- Dataset jackhhao/jailbreak-classification: https://huggingface.co/datasets/jackhhao/jailbreak-classification
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Unsloth: https://github.com/unslothai/unsloth

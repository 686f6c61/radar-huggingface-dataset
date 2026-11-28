# nong0521/wordbeasts-dev-summon-models

## Resumen

Wordbeasts Dev Summon Models es un ajuste fino (fine-tune) del modelo Qwen/Qwen3-4B-Instruct-2507, desarrollado por el usuario nong0521 y publicado en Hugging Face bajo licencia Apache 2.0. Se distribuye en formato GGUF para su uso con llama.cpp y está orientado a conversacion, con soporte declarado para japones, ingles y chino. El repositorio tiene acceso restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargarlo.

El modelo parte de la arquitectura Qwen3 de 4.000 millones de parametros (4.022.468.096 exactamente, segun los pesos en safetensors) y hereda las capacidades del modelo base instruct, que incluye modo de razonamiento explicito y una ventana de contexto nativa de 262.144 tokens (ampliable). El ajuste fino parece orientado a un caso de uso concreto ("wordbeasts-dev-summon-models"), probablemente generacion de personajes o criaturas para desarrollo de videojuegos, aunque la model card no detalla la composicion del dataset de entrenamiento.

La relevancia de esta ficha es limitada pero ilustrativa: se trata de un modelo comunitario pequeno, sin descargas ni likes en el momento de la consulta, que sirve como ejemplo de fine-tune de Qwen3-4B para una tarea vertical. Para produccion conviene evaluarlo contra el modelo base antes de adoptarlo, dado que no hay benchmarks publicados ni documentacion sobre los datos de ajuste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3) |
| Parametros totales | 4.022.468.096 (4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la model card (el base Qwen3-4B-Instruct-2507 soporta 262.144 tokens nativos) |
| Tipos de cuantizacion | GGUF (el repo incluye pesos en formato GGUF; niveles concretos no disponibles) |
| Idiomas soportados | japones (ja), ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (libreria llama.cpp); el modelo base dispone de safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune del Qwen3-4B-Instruct-2507, un transformer decoder-only denso de 4.000 millones de parametros. Qwen3-4B-Instruct-2507 es la variante "instruct" no thinking del Qwen3-4B, optimizada para respuestas directas sin cadena de razonamiento visible, con atencion por query-key normalization, RoPE y entrenamiento sobre un corpus multilingue amplio (119 idiomas en el modelo base, aunque este fine-tune declara solo ja, en y zh).

No se dispone de informacion sobre el dataset de ajuste fino: numero de tokens, composicion, uso de RLHF/DPO o tecnicas de alineacion adicionales. La model card no documenta hiperparametros, metodo de entrenamiento (SFT, LoRA, QLoRA) ni proceso de cuantizacion a GGUF. El tag `base_model:finetune:Qwen/Qwen3-4B-Instruct-2507` confirma el linaje, pero no hay mas detalles tecnicos publicados. Tampoco se documenta ninguna innovacion arquitectonica propia; se heredan las del base (atencion estandar, sin decodificacion especulativa integrada).

## Capacidades

- Generacion de texto conversacional en japones, ingles y chino.
- Razonamiento y respuesta a instrucciones heredados del Qwen3-4B-Instruct-2507.
- Generacion de codigo basica (capacidad del base, no verificada en el fine-tune).
- Soporte de conversaciones multi-turno mediante plantilla de chat compatible con llama.cpp.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que permite desplegarlo tras una API compatible con OpenAI.
- Capacidad especializada no documentada: el nombre sugiere generacion de "wordbeasts" (criaturas o personajes), pero no hay especificacion funcional.
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio en este fine-tune.

## Casos de uso

- Prototipado de generacion de personajes o criaturas para videojuegos: el nombre del modelo sugiere un ajuste para producir descripciones de "wordbeasts"; se usaria como generador de fichas de personajes en un pipeline de diseno, con validacion humana posterior.
- Chat multilingue ligero en japones, ingles y chino: adecuado para asistentes conversacionales en entornos con recursos limitados, dado su tamano de 4B y su empaquetado GGUF.
- Inferencia en CPU o GPU de gama baja: al ser un GGUF de 4B, cabe en equipos consumer y permite desplegar un chatbot local sin infraestructura dedicada.
- Generacion de texto creativo en japones: util para escritura asistida o generacion de dialogos en proyectos de localizacion, siempre que se valide la calidad frente al base.
- Servicio de API compatible con OpenAI: gracias al tag `endpoints_compatible`, puede montarse tras un servidor llama.cpp con endpoint tipo OpenAI para integrarlo en aplicaciones existentes.
- Experimentacion academica con fine-tunes comunitarios: sirve como caso de estudio de ajuste de Qwen3-4B para una tarea vertical y de comparacion contra el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Para un modelo de 4B en GGUF, las estimaciones tipicas son aproximadamente 2,5-3 GB en cuantizacion Q4_K_M, 3,5-4 GB en Q5_K_M y 5-6 GB en Q8_0, mas el overhead de contexto.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM (RTX 3060, RTX 4060, RTX 4070) para cuantizaciones Q4-Q8; A100/H100 no son necesarias para este tamano.
- Cabe en GPU consumer: si, en la mayoria de GPUs con 8 GB o mas; tambien puede ejecutarse en CPU via llama.cpp.
- Opciones de despliegue: llama.cpp (libreria declarada), servidores compatibles con endpoints OpenAI, Ollama (si se convierte el GGUF al manifiesto correspondiente), y potencialmente vLLM si se dispone de pesos safetensors del base ajustado (no confirmado para este repo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Wordbeasts Dev Summon Models | 4B | no disponible (base: 262.144) | Apache 2.0 | GGUF | Fine-tune comunitario, acceso gated, sin benchmarks |
| Qwen/Qwen3-4B-Instruct-2507 | 4B | 262.144 | Apache 2.0 | safetensors, GGUF | Modelo base; referencia obligada de comparacion |
| Qwen/Qwen3-8B | 8B | 32.768 nativo (ampliable) | Apache 2.0 | safetensors, GGUF | Mayor capacidad; citado como base secundario en los tags |
| Llama 3.2 3B Instruct | 3B | 128.000 | Llama 3.2 Community License | safetensors, GGUF | Alternativa de tamano similar con licencia mas restrictiva |

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face antes de la descarga.
- Sin benchmarks ni evaluacion publicada: no hay evidencia de que el fine-tune mejore al base; puede degradar capacidades generales.
- Documentacion minima: se desconoce el dataset, el metodo de entrenamiento y los hiperparametros, lo que dificulta la reproducibilidad.
- Riesgo de alucinacion: inherente a modelos de 4B; el ajuste fino sobre un dominio concreto puede aumentar la confianza en respuestas incorrectas fuera de ese dominio.
- Cobertura idiomatica limitada: solo ja, en y zh declarados; el castellano no esta soportado explicitamente.
- Licencia Apache 2.0 permite uso comercial, pero el acceso gated y la falta de garantias del autor exigen revision propia antes de produccion.
- Sin soporte documentado de tool calling ni agentes: no recomendable para pipelines que dependan de function calling sin verificacion previa.
- Modelo comunitario con 0 descargas y 0 likes en el momento de la consulta: sin senales de validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/nong0521/wordbeasts-dev-summon-models
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Modelo base secundario: https://huggingface.co/Qwen/Qwen3-8B
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp

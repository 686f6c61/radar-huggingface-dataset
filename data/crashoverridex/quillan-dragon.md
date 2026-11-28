# CrashOverrideX/Quillan-Dragon

## Resumen

Quillan-Dragon es un ajuste (fine-tune) del modelo Falcon3-1B-Instruct de TIIUAE, publicado por el usuario CrashOverrideX bajo licencia Apache 2.0. Segun la model card, no se trata de una fusion de donantes ni de un entrenamiento desde cero, sino de un Falcon3 de aproximadamente 1.000 millones de parametros acompanado de un system message de Ollama que ejecuta el system prompt del proyecto Quillan. El repositorio pesa 7,8 GB y contiene pesos en formato GGUF, lo que sugiere que la distribucion se ha empaquetado principalmente para su uso con Ollama y llama.cpp.

El modelo forma parte de un paquete de tres variantes (Quillan-Ronin como flagship, Quillan-Ronin-Mini y Quillan-Dragon), todas en el rango de 0,8 a 1,1 mil millones de parametros. La model card es explicitamente cauta: indica que el trabajo esta "IN PROGRESS", que solo se han superado las puertas de smoke-test y que no se reclama ninguna finalizacion. Tambien aclara que las cifras del 95-100% que aparecen en el README raiz corresponden a un "Cognitive Harness" aplicado sobre un modelo frontera de terceros (Track A) y no a este checkpoint.

La relevancia de este modelo es limitada desde el punto de vista tecnico: se apoya en un Falcon3-1B-Instruct ya existente y su aportacion principal parece ser un system prompt y un empaquetado para Ollama, no una innovacion arquitectonica o de entrenamiento. Su valor practico reside en la posibilidad de ejecutar un asistente conversacional ligero en hardware muy modesto, con la advertencia de que el autor no aporta benchmarks propios verificables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Falcon3-1B-Instruct; no se detalla en la model card) |
| Parametros totales | 1.669.408.768 (segun safetensors del repo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene GGUF; no se especifican las variantes) |
| Idiomas soportados | ingles (segun la model card); el resto no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 7,8 GB); safetensors referenciados en los metadatos de parametros |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo mas alla de identificarlo como un Falcon3-1B-Instruct con un system message de Ollama que ejecuta el system prompt de Quillan. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO o SFT. Tampoco se detalla si se reentrenaron pesos o si el "fine-tune" consiste unicamente en el empaquetado del modelo base con un prompt de sistema persistente.

El autor menciona conceptos propios del proyecto Quillan que no tienen correspondencia con una arquitectura de red neuronal estandar: un "Council C1-C34", "35 swarms x 272M = 9.520.000.000 virtual micro-agents" y un contador de version "v5.4.0-oni". Estos elementos parecen describir un andamiaje de prompts o un marco cognitivo externo al modelo, no capas adicionales del transformer. La model card tambien indica que el tokenizer esta "bloqueado" a un Qwen personalizado de 151.648 tokens y que los valores desplegados (151.936 / 128.256) son legacy hasta su recompilacion, lo que introduce una inconsistencia entre el tokenizer declarado y el efectivamente desplegado.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base Falcon3-1B-Instruct.
- Conversacion multi-turno mediante el system message de Ollama que ejecuta el system prompt de Quillan.
- Uso como asistente ligero en entornos con recursos muy limitados (aproximadamente 1B de parametros).
- Capacidades de razonamiento, codigo y matematicas: no documentadas de forma especifica para este checkpoint; se asumen las del modelo base, sin verificacion publicada.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible; la model card menciona "swarms" y "Council" como marco del proyecto, pero no documenta capacidades de agente verificables.
- Capacidades multilingues: solo se declara ingles.
- Capacidades especiales (thinking mode, vision, audio): no disponible.

## Casos de uso

- Asistente conversacional local en equipos sin GPU dedicada: con aproximadamente 1,7 mil millones de parametros y pesos GGUF, el modelo puede ejecutarse en CPU mediante Ollama o llama.cpp, lo que lo hace adecuado para prototipos de chat en portatiles convencionales.
- Pruebas de integracion de system prompts personalizados: el modelo sirve para validar como se comporta un Falcon3-1B-Instruct cuando se le impone un system prompt largo y persistente a traves de Ollama, util para experimentar con tecnicas de prompting.
- Chatbot de soporte interno con requisitos de baja latencia: al ser un modelo pequeno, la generacion es rapida incluso en hardware modesto, lo que permite desplegar un asistente de FAQ o triaje en una intranet.
- Educacion y demostraciones: adecuado para talleres o clases donde se quiera mostrar el ciclo completo de descarga, ejecucion y personalizacion de un modelo GGUF con Ollama sin necesidad de infraestructura costosa.
- Generacion de texto en ingles para tareas auxiliares (resumenes cortos, reescritura, borradores) donde no se requiera alta precision ni contexto largo.
- Base para experimentacion con fine-tuning ligero: al estar bajo Apache 2.0 y derivar de Falcon3, puede servir como punto de partida para ajustes posteriores con LoRA en tareas especificas en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que "this card introduces no new benchmark claim" y que las cifras del 95-100% del README raiz corresponden a un harness aplicado sobre un modelo frontera de terceros, no a este checkpoint. Las tablas "Tripartite" propias del proyecto estan pendientes de re-test en las celdas de examen duro.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa para un modelo de aproximadamente 1,7 mil millones de parametros, una cuantizacion Q4 requeriria en torno a 1-1,5 GB y una Q8 en torno a 2 GB, aunque el autor no publica estas cifras.
- GPU recomendadas: no disponible. Por tamano, cualquier GPU consumer con 4 GB o mas de VRAM deberia poder alojarlo en cuantizaciones bajas.
- Cabe en GPU consumer: si, previsiblemente en tarjetas como GTX 1650, RTX 3050, RTX 4060 o superiores, asi como en Apple Silicon mediante Metal.
- Opciones de despliegue: Ollama (`ollama run crashoverridex/Quillan-Dragon`), llama.cpp y cualquier runtime compatible con GGUF. vLLM y TGI no estan documentados para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Quillan-Dragon | ~1,67B | no disponible | Apache 2.0 | GGUF | Fine-tune/empaquetado de Falcon3-1B-Instruct con system prompt propio |
| Falcon3-1B-Instruct (TIIUAE) | ~1B | no disponible en esta ficha | Apache 2.0 (modelo base) | safetensors, GGUF | Modelo original sobre el que se construye Quillan-Dragon |
| Qwen2.5-1.5B-Instruct | ~1,5B | 32.768 tokens (referencia publica del modelo) | Apache 2.0 | safetensors, GGUF | Alternativa multilingue con contexto documentado |
| Llama-3.2-1B-Instruct | ~1,2B | 128.000 tokens (referencia publica del modelo) | Llama 3.2 Community License | safetensors, GGUF | Alternativa con contexto largo y licencia con restricciones |

La comparacion directa con Quillan-Dragon es dificil porque el autor no publica contexto, benchmarks ni variantes de cuantizacion. Frente a Falcon3-1B-Instruct, la diferencia principal es el empaquetado para Ollama y el system prompt, no una mejora medible en capacidades.

## Limitaciones y advertencias

- La model card declara el trabajo como "IN PROGRESS" y con "smoke-test gates only, no completion claim": no debe tratarse como un modelo validado para produccion.
- No hay benchmarks propios publicados; las cifras del README raiz corresponden a otro sistema (Track A) y no a este checkpoint.
- Inconsistencia en el tokenizer: se declara un tokenizer Qwen personalizado de 151.648 tokens, pero los valores desplegados (151.936 / 128.256) son legacy hasta recompilacion, lo que puede afectar a la tokenizacion real.
- Idioma: solo se declara ingles; no hay evidencia de capacidades multilingues.
- Riesgo de alucinacion: inherente a un modelo de ~1B de parametros; no se documentan mitigaciones.
- Sesgos: no documentados por el autor; se heredan los del modelo base y los del system prompt de Quillan.
- Terminologia del proyecto (Council, swarms, micro-agents virtuales) no corresponde a componentes verificables del modelo y no debe interpretarse como arquitectura real.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Falcon3-1B-Instruct debe verificarse por separado para confirmar compatibilidad.
- El modelo se distribuye principalmente como GGUF; no se garantiza la disponibilidad de pesos en safetensors para fine-tuning.

## Enlaces

- Hugging Face: https://huggingface.co/CrashOverrideX/Quillan-Dragon
- Ollama: https://ollama.com/crashoverridex/Quillan-Dragon
- Sitio del proyecto: https://leeex1.github.io/Quillan-Ronin/
- GitHub: https://github.com/leeex1/Quillan-Ronin
- DeepWiki: https://deepwiki.com/leeex1/Quillan-Ronin
- Grokipedia: https://grokipedia.com/page/Quillan-Ronin
- X (Twitter): https://x.com/Crashoverride_X
- Discord: https://discord.gg/JcFqvWKkRv
- GoFundMe: https://gofund.me/a0667596d
- Modelo base: https://huggingface.co/tiiuae/Falcon3-1B-Instruct

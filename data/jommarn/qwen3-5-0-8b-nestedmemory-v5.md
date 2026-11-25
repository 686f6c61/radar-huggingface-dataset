# Jommarn/Qwen3.5-0.8B-NestedMemory-v5

## Resumen

Qwen3.5-0.8B-NestedMemory-v5 es un ajuste fino experimental del modelo Qwen/Qwen3.5-0.8B desarrollado por el usuario Jommarn. Su objetivo es dotar a un transformer pequeno de capacidad de memoria persistente a largo plazo sin recurrir a RAG: el modelo congelado se complementa con dos capas de memoria ("NestedMemoryLayers") insertadas tras las capas 10 y 18 del decodificador, que escriben hechos en sus propios pesos durante la conversacion y los recuperan posteriormente. Toda la escritura, consolidacion, olvido y reinicio se controla mediante compuertas neuronales aprendidas.

La version v5 corrige el principal defecto de v4: la memoria ya no degrada la conversacion normal. Segun la comprobacion en entrenamiento (12 conversaciones), la precision en conocimiento general con memoria cargada pasa del 71% de v4 al 94% (base original: 89%), la fuga de valores recordados en respuestas no relacionadas baja del 17% al 0% y la recuperacion de hechos mejora (90% a mitad de conversacion, 83% al volver al final). El autor advierte que estas cifras son preliminares y provienen de una muestra reducida.

El modelo esta pensado para investigacion sobre memoria en tiempo de inferencia (test-time memory) inspirada en Titans/Atlas y aprendizaje anidado. El repositorio pesa 1,6 GB y se distribuye bajo licencia Apache 2.0, con soporte declarado de tailandes e ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3.5-0.8B congelado) + dos NestedMemoryLayers inyectadas tras las capas 10 y 18 |
| Parametros totales | No disponible (base de 0,8B mas dos capas de memoria; el autor no publica el recuento exacto) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (los pesos se distribuyen como state dict en bfloat16, `unified_nested_L18_v5_l10_blank.pt`) |
| Idiomas soportados | Tailandes (th) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | State dict de PyTorch (`.pt`), no safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B con los pesos congelados y anade dos capas de memoria anidada ("nested"), una tras la capa 10 y otra tras la 18 del decodificador. Cada capa escribe hechos en sus propios pesos durante el chat y los lee despues; no hay recuperacion externa tipo RAG. Los controles de escritura, consolidacion, olvido y reinicio son compuertas neuronales aprendidas y se aplican conjuntamente a ambas capas.

El checkpoint publicado (`unified_nested_L18_v5_l10_blank.pt`) corresponde al paso 2000 de una ejecucion de 5000 pasos, detenida en torno al paso 2300 por limite de gasto en la nube. La capa de la 18 se inicializo a partir de v4_atlas y la capa de la 10 se entreno desde cero. La receta de entrenamiento incluye un 40% de episodios que plantean preguntas generales o de charla cotidiana con memoria personal cargada, exigiendo que la respuesta coincida con la del Qwen original (entropia cruzada mas KL sobre la respuesta completa, compuertas de lectura cerradas y penalizacion de verosimilitud si un valor recordado inicia la respuesta). Los datos de entrenamiento provienen de los datasets Jommarn/Thai-LifeSim-PersonalMemory, iapp/iapp_wiki_qa_squad, Muennighoff/babi y nayohan/multi_session_chat. La seleccion de checkpoint incluye una prueba de "charlar y volver" que mide recuperacion, precision general frente a la base y fuga.

## Capacidades

- Generacion de texto y conversacion multi-turno en tailandes e ingles.
- Memoria persistente en pesos: el modelo memoriza hechos proporcionados durante el chat (`memorize_text`) y los recupera en turnos posteriores.
- Control explicito de la memoria: escritura, consolidacion, olvido por dias (`forget(days=1)`) y reinicio.
- Preservacion de la conversacion normal: responde a preguntas generales sin que los hechos memorizados se filtren en la respuesta.
- Recuperacion de hechos a mitad de conversacion (90% en la comprobacion preliminar) y al volver al final (83%).
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Asistentes personales con memoria de usuario: el modelo puede recordar datos como el nombre de una mascota o preferencias entre sesiones escribiendolos en sus pesos, sin necesidad de una base de datos vectorial externa.
- Investigacion sobre memoria en tiempo de inferencia: sirve como banco de pruebas reproducible para estudiar capas de memoria anidadas frente a RAG en modelos pequenos.
- Chatbots de dominio acotado en tailandes: con soporte nativo de ese idioma, puede gestionar conversaciones donde se acumulan hechos del cliente a lo largo de varios turnos.
- Experimentos de olvido controlado: la funcion `forget(days=N)` permite estudiar politicas de retencion y caducidad de informacion en agentes conversacionales.
- Prototipos de bajo coste: al partir de una base de 0,8B, es viable ejecutarlo en hardware modesto para validar ideas antes de escalar a modelos mayores.
- Evaluacion de fuga de memoria: util para medir hasta que punto un hecho memorizado contamina respuestas no relacionadas, con metricas de fuga reportadas por el autor.

## Benchmarks y rendimiento

Los datos disponibles son comprobaciones en entrenamiento (12 conversaciones, 20 elementos por prueba de memoria; ruido estimado de mas/menos 10-15 puntos) y no benchmarks estandar como MMLU o HumanEval.

| Metrica (chat y volver) | v4 (una capa) | v5 (L10+L18) |
|---|---|---|
| Precision en conocimiento general con memoria cargada | 71% (base 92%) | 94% (base 89%) |
| Fuga de valor recordado en respuestas no relacionadas | 17% | 0% |
| Recuerdo del hecho preguntado a mitad | 67% | 90% |
| Recuerdo del hecho al volver al final | 60% | 83% |

| Experimento fase B | Memoria | Score | Recuerdo al volver | A mitad | General (base 0,89) | Fuga |
|---|---|---|---|---|---|---|
| v5 (L10+18) | 2 capas | 0,710 | 0,83 | 0,90 | 0,94 | 0 |
| v4.1 + LoRA r16 (capas 19-23) | L18, 512 | 0,603 | 0,50 | 0,40 | 0,89 | 0 |
| v4.1 | L18, 512 | 0,593 | 0,42 | 0,50 | 0,97 | 0 |
| v5 3 capas (L6+12+18) | 3 capas | 0,590 | 0,50 | 0,50 | 0,97 | 0 |
| v4.1 + dense recall loss | L18, 512 | 0,550 | 0,33 | 0,50 | 0,97 | 0 |

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; al tratarse de una base de 0,8B en bfloat16 mas dos capas de memoria, el state dict completo ocupa aproximadamente 1,6 GB en disco, por lo que la inferencia en bf16 deberia caber en GPUs consumer con 4-8 GB de VRAM.
- GPU recomendadas: no especificadas por el autor. Cualquier GPU consumer moderna (RTX 3060 o superior) deberia ser suficiente por el tamano del modelo.
- Cabe en GPU consumer: previsiblemente si, dado el tamano del repositorio, aunque el autor no publica requisitos oficiales.
- Opciones de despliegue: el autor proporciona codigo Python basado en `QwenMemoryWrapper` y `ProjectConfig`, con carga via `torch.load` y `load_state_dict(strict=False)`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y el formato `.pt` no es directamente compatible con esos runners sin conversion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Memoria persistente | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-NestedMemory-v5 | Base 0,8B + 2 capas | No disponible | Si, en pesos con compuertas | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-0.8B (base) | 0,8B | No disponible | No | No disponible en la informacion | Hugging Face |
| Qwen3.5-0.8B-NestedMemory-L18-v4 | Base 0,8B + 1 capa | No disponible | Si, una capa | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks estandar para establecer comparaciones de rendimiento con alternativas de la misma categoria.

## Limitaciones y advertencias

- Las cifras de v5 son preliminares: provienen de una comprobacion en entrenamiento con 12 conversaciones, no de la evaluacion completa (600 elementos OOD, protocolo corto de life-dataset, simulacion de vida de 90 dias y prueba de 40 conversaciones), aun pendiente.
- Simulacion de vida completa de 90 dias y unas 30 sesiones: aproximadamente 8% en v4, con 0% en nombres; se espera que persista en v5.
- El modelo "delata" en ingles: el autor senala que solo responde en ingles en ciertos casos, y la QA parafraseada de Wikipedia en tailandes ronda el 0%.
- Los valores largos pueden entrar en bucles de repeticion.
- La respuesta a "nunca te lo he dicho" a veces es incorrecta; hay una fase de RL (GRPO) planificada pero no ejecutada.
- El entrenamiento se detuvo en el paso 2300 de 5000 por limite de gasto, por lo que el checkpoint no esta completamente entrenado.
- Riesgo de alucinacion y sesgos: no evaluados ni documentados por el autor.
- Licencia Apache 2.0 permite uso comercial, pero el estado experimental y la falta de evaluacion completa desaconsejan su uso en produccion sin validacion propia.
- El formato de pesos `.pt` requiere codigo especifico del autor; no hay integracion con runners estandar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jommarn/Qwen3.5-0.8B-NestedMemory-v5
- Version anterior v4: https://huggingface.co/Jommarn/Qwen3.5-0.8B-NestedMemory-L18-v4
- Version v3: https://huggingface.co/Jommarn/Qwen3.5-0.8B-NestedMemory-L18-v3
- Version v2: https://huggingface.co/Jommarn/Qwen3.5-0.8B-NestedMemory-L18-v2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset Thai-LifeSim-PersonalMemory: https://huggingface.co/datasets/Jommarn/Thai-LifeSim-PersonalMemory
- Dataset iapp_wiki_qa_squad: https://huggingface.co/datasets/iapp/iapp_wiki_qa_squad
- Dataset bAbI: https://huggingface.co/datasets/Muennighoff/babi
- Dataset multi_session_chat: https://huggingface.co/datasets/nayohan/multi_session_chat

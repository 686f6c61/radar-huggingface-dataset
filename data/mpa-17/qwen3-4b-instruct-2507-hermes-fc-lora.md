# mpa-17/Qwen3-4B-Instruct-2507-hermes-fc-LoRA

## Resumen

Qwen3-4B-Instruct-2507-hermes-fc-LoRA es un adaptador LoRA publicado por el usuario mpa-17 que especializa el modelo base Qwen3-4B-Instruct-2507 (desarrollado por Alibaba Qwen) en la tarea de function calling y tool calling. El adaptador se entrena sobre el dataset NousResearch/hermes-function-calling-v1 y se distribuye como pesos PEFT en safetensors, con una compilacion GGUF paralela para inferencia en llama.cpp. Su proposito es mejorar la fiabilidad del modelo base a la hora de emitir llamadas a herramientas en formato JSON estrictamente valido y con los nombres de funcion y argumentos correctos.

El modelo base pertenece a la familia Qwen3, una arquitectura transformer densa de 4 mil millones de parametros con ventana de contexto nativa de 262.144 tokens (extensible segun la documentacion de Qwen3). El adaptador no modifica la arquitectura: solo ajusta las proyecciones de atencion y MLP mediante LoRA con rango 16, por lo que hereda las capacidades, el tokenizador y el contexto del modelo original.

La relevancia de esta ficha es practica: demuestra que un ajuste ligero (200 pasos, 25,4 minutos en una Tesla T4) sobre un modelo de 4B puede elevar la tasa de llamadas completamente correctas del 73 % al 81 % en un conjunto de evaluacion retenido, manteniendo coherencia con el modelo base (KLD bajo en cuantizaciones Q8_0 y Q4_K_M). Es un ejemplo reproducible de especializacion barata para pipelines de agentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), adaptador LoRA sobre proyecciones de atencion y MLP |
| Parametros totales | 4B (modelo base); adaptador LoRA con rango 16, alpha 16 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens en el modelo base Qwen3-4B-Instruct-2507 (entrenamiento del adaptador con max length 2048) |
| Tipos de cuantizacion | GGUF F16, Q8_0, Q4_K_M, Q4_K_M con imatrix; base QLoRA 4-bit NF4 durante entrenamiento |
| Idiomas soportados | en (segun model card); el modelo base Qwen3 soporta multilingue, pero el adaptador solo declara ingles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PEFT); GGUF disponible en repositorio separado |

## Arquitectura y entrenamiento

El adaptador se entrena con QLoRA (base cuantizada en 4-bit NF4, computo en fp16) usando la libreria Unsloth. La configuracion LoRA es r=16, alpha=16, dropout 0, aplicada a todas las proyecciones de atencion y MLP. El entrenamiento dura 200 pasos con batch efectivo 8, learning rate 0,0002 y longitud maxima 2048, completandose en 25,4 minutos sobre una Tesla T4. La perdida se calcula unicamente sobre los tokens del asistente, y las herramientas se pasan mediante la plantilla de chat nativa de Qwen3, con el formato `<tool_call>{"name": ..., "arguments": ...}</tool_call>`.

Los datos provienen de NousResearch/hermes-function-calling-v1, filtrando solo ejemplos cuya respuesta de referencia consiste en llamadas a herramientas JSON estrictamente validas. Se incluyen `func_calling_singleturn` (excluyendo la parte de extraccion de informacion por JSON malformado) y los primeros turnos de `glaive_func_calling`, deduplicados por consulta. El conjunto final es de 1800 ejemplos de entrenamiento y 100 de test retenido (57 de `func_calling_singleturn` y 43 de `glaive_func_calling`). No se menciona RLHF ni DPO; el ajuste es supervisado sobre el formato nativo de tool calling.

## Capacidades

- Generacion de texto conversacional y razonamiento general heredados del modelo base Qwen3-4B-Instruct-2507.
- Function calling y tool calling en formato nativo Qwen3, con emision de `<tool_call>` y argumentos JSON.
- Mayor fiabilidad en la estructura de la llamada: 100 % de emision de `<tool_call>` y 100 % de JSON valido en F16, Q8_0 y Q4_K_M segun la evaluacion del autor.
- Soporte de llamadas multi-turno limitado a los primeros turnos de `glaive_func_calling` en el dataset de entrenamiento.
- Capacidades multilingues del modelo base no garantizadas por el adaptador, que declara solo ingles.
- No se documentan capacidades de vision, audio ni modo thinking especifico en la informacion disponible.

## Casos de uso

- Agentes de atencion al cliente con herramientas: el adaptador emite llamadas JSON a funciones como consulta de pedidos o gestion de tickets con una tasa de llamada completamente correcta del 81 % en F16, adecuada para flujos donde el modelo base (73 %) cometia mas errores de argumentos.
- Orquestacion de APIs en produccion: al usar el formato nativo de Qwen3 y plantilla de chat, se integra en pipelines que pasan definiciones de herramientas y esperan `<tool_call>` parseable, reduciendo fallos de parseo a practicamente cero en Q8_0 y Q4_K_M.
- Despliegue en hardware modesto: la version Q4_K_M ocupa 2,50 GB y mantiene 81 % de llamadas completamente correctas, por lo que cabe en GPUs de consumo y en CPU via llama.cpp para asistentes locales con acceso a herramientas.
- Extraccion de informacion estructurada desde conversaciones: aunque el autor excluye la parte de Information Extraction del dataset por JSON malformado, el adaptador sigue generando argumentos JSON validos en el 99-100 % de los casos, util para rellenar formularios o parametros de busqueda.
- Prototipado rapido de agentes multi-step: con 4B parametros y contexto nativo de 262.144 tokens del base, permite mantener historiales largos de herramientas y resultados sin truncar, aunque el adaptador se entreno con 2048 tokens.
- Evaluacion comparativa de tecnicas de ajuste: el repositorio documenta PPL, KLD y tasas de acierto por cuantizacion, lo que lo convierte en referencia reproducible para medir el impacto de QLoRA con Unsloth en tareas de tool calling.
- Asistentes de codigo con ejecucion de funciones: puede invocar funciones de compilacion, busqueda o ejecucion de tests en entornos de desarrollo, siempre que las herramientas se definan en la plantilla de chat.

## Benchmarks y rendimiento

Evaluacion del autor sobre 100 ejemplos retenidos, con llama.cpp v1.0.0 `llama-server`, decodificacion greedy y los mismos tokens de prompt. "Completamente correcto" exige mismos nombres de funcion y argumentos que la referencia (orden indistinto); intervalo de confianza Wilson del 95 % entre parentesis.

| Modelo | Con `<tool_call>`, % | JSON valido, % | Funciones correctas, % | Llamada completamente correcta, % |
|---|---|---|---|---|
| Base F16 | 100 | 99 | 89 | 73 (64-81) |
| FT F16 | 100 | 100 | 92 | 81 (72-87) |
| FT Q4_K_M-imat | 100 | 99 | 92 | 78 (69-85) |
| FT Q8_0 | 100 | 100 | 92 | 81 (72-87) |
| FT Q4_K_M | 100 | 100 | 92 | 81 (72-87) |

Perplejidad y divergencia KL frente al modelo F16 ajustado (`llama-perplexity --kl-divergence`, contexto 512, 100 fragmentos de texto retenido):

| Cuantizacion | Tamano, GB | bpw | PPL | KLD medio vs F16 | KLD 99 % | Mismo top-p, % |
|---|---|---|---|---|---|---|
| F16 | 8,05 | 16,01 | 2,6767 | — | — | — |
| Q8_0 | 4,28 | 8,51 | 2,6775 | 0,00104 ± 0,00002 | 0,0088 | 98,79 |
| Q4_K_M | 2,50 | 4,97 | 2,6989 | 0,01778 ± 0,00101 | 0,1380 | 95,82 |
| Q4_K_M-imat | 2,50 | 4,97 | 2,6830 | 0,01109 ± 0,00047 | 0,1004 | 96,30 |

## Requisitos de hardware

- VRAM estimada: F16 requiere aproximadamente 8,05 GB de pesos mas overhead de contexto; Q8_0 unos 4,28 GB; Q4_K_M unos 2,50 GB.
- GPU recomendadas: Tesla T4 (usada para el entrenamiento del adaptador), RTX 4090, A100 o H100 para mayor throughput; cualquier GPU con al menos 8 GB para F16 y 4 GB para Q4_K_M.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas para F16 y con 4-6 GB para Q4_K_M, incluyendo RTX 3060, RTX 4060 y superiores.
- Opciones de despliegue: llama.cpp (`llama-server`) para GGUF, Ollama si se importa el GGUF, vLLM o TGI para el adaptador PEFT con el modelo base, y transformers con PEFT para cargar el adaptador en safetensors.
- Latencia y throughput: no se publican mediciones de latencia ni tokens por segundo en la informacion disponible; el entrenamiento de 200 pasos tardo 25,4 minutos en una Tesla T4.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tool calling | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-4B-Instruct-2507-hermes-fc-LoRA | 4B (base) + LoRA r=16 | 262.144 (base) | Formato nativo Qwen3, 81 % llamadas correctas en F16 | apache-2.0 | Hugging Face (PEFT y GGUF) |
| Qwen3-4B-Instruct-2507 (base) | 4B | 262.144 | Formato nativo, 73 % llamadas correctas en F16 | apache-2.0 | Hugging Face |
| Qwen3-4B-Instruct-2507-hermes-fc-GGUF (misma autoria) | 4B | 262.144 | Misma evaluacion, 78-81 % segun cuantizacion | apache-2.0 | Hugging Face (GGUF) |
| Otros modelos de 4B con tool calling | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de modelos de terceros en la informacion proporcionada, por lo que la comparativa se limita al modelo base y a la variante GGUF del mismo autor.

## Limitaciones y advertencias

- El adaptador declara solo ingles; el rendimiento en castellano u otros idiomas no esta validado y depende del modelo base.
- El conjunto de evaluacion es pequeno (100 ejemplos) y los intervalos de confianza son amplios (por ejemplo, 72-87 % para F16), por lo que las diferencias de 3 puntos entre cuantizaciones deben interpretarse con cautela.
- El entrenamiento se limita a 200 pasos y 1800 ejemplos, con max length 2048; llamadas con historiales largos o esquemas de herramientas muy complejos pueden degradarse.
- La parte de Information Extraction del dataset fue excluida por JSON malformado, de modo que la extraccion estructurada no esta cubierta explicitamente por el entrenamiento.
- Riesgo de alucinacion de nombres de funcion o argumentos inexistentes, inherente al modelo base y no cuantificado en la evaluacion.
- Licencia apache-2.0 permite uso comercial, pero se recomienda revisar las condiciones del modelo base Qwen3 y del dataset NousResearch/hermes-function-calling-v1.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, por lo que no hay validacion independiente de los resultados.
- No se documentan sesgos especificos ni evaluaciones de seguridad en la informacion disponible.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/mpa-17/Qwen3-4B-Instruct-2507-hermes-fc-LoRA
- Version GGUF: https://huggingface.co/mpa-17/Qwen3-4B-Instruct-2507-hermes-fc-GGUF
- Modelo base: https://huggingface.co/unsloth/Qwen3-4B-Instruct-2507
- Dataset de entrenamiento: https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1
- Libreria Unsloth: https://github.com/unslothai/unsloth

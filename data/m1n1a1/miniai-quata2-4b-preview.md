# M1n1A1/MiniAI-Quata2-4b-Preview

## Resumen

MiniAI Quata2 4B Preview es un asistente conversacional compacto desarrollado por MiniAI, construido sobre Qwen3.5-4B y distribuido en formato GGUF. Se trata de una versión preliminar (preview) de la próxima iteración Quata2 4B, publicada para que los usuarios prueben el modelo que actualmente impulsa chat.codeminute.dev. El propio autor advierte que es una versión temprana e inacabada que aún no supera a su modelo base en varios benchmarks.

El modelo se ha ajustado mediante fine-tuning supervisado con datasets de instrucciones (OpenHermes-2.5, Tulu-3), function calling (Hermes, ToolACE, When2Call) y datos propios de identidad y verificación, combinando posteriormente los pesos con el modelo base mediante WiSE-FT. Sus puntos fuertes son el tool calling (87.9 en BFCL), el conocimiento general (72.6 en MMLU) y la consistencia al mantener respuestas correctas ante objeciones del usuario. Sus debilidades declaradas son el seguimiento estricto de instrucciones, la generación de código y errores factuales ocasionales con confianza. La versión completa (Quata2 4B v0.2) está en entrenamiento, y para uso estable el autor recomienda la versión anterior MiniAI-Quata2-4b.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3.5-4B); detalles completos no disponibles |
| Parametros totales | 4.326.350.848 (dato real de safetensors) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | 8192 tokens (según el comando de ejemplo con llama-server); máximo nativo no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF, 4 bits); otras cuantizaciones no disponibles |
| Idiomas soportados | Ingles (principal), serbio, croata y bosnio (con gramatica inferior al ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo MiniAI-Quata2-4b-Preview-Q4_K_M.gguf, 2,8 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B y aplica un proceso de fine-tuning en varias etapas: primero un ajuste supervisado sobre OpenHermes-2.5, Tulu-3 (seguimiento de instrucciones), Hermes function calling, ToolACE y WhenCall (uso de herramientas), junto con datos propios de MiniAI sobre identidad, recuperacion de errores de herramientas y verificacion doble (double-check). A continuacion se integra un fine-tune adicional de uso de herramientas fusionado al 30 %. Finalmente, los pesos se mezclan en una proporcion 80/20 hacia Qwen3.5-4B mediante WiSE-FT, una tecnica de interpolacion de pesos que preserva las capacidades del modelo base mientras incorpora el ajuste.

El archivo GGUF distribuido conserva la plantilla de chat de Qwen3.5, con soporte nativo de tool calling y modo thinking activable o desactivable. Es importante senalar que la parte de vision de Qwen3.5 no esta incluida en este archivo, por lo que el modelo es solo de texto.

## Capacidades

- Generacion de texto conversacional en ingles (idioma principal) y, con calidad gramatical inferior, en serbio, croata y bosnio.
- Tool calling nativo mediante la plantilla de chat de Qwen3.5 (requiere `--jinja` en llama.cpp); 87.9 en BFCL, por encima de su modelo base (85.1).
- Ejecucion de tareas de agente sobre herramientas reales: 80.1 % resueltas, igualando al modelo base.
- Modo thinking activable/desactivable heredado de Qwen3.5.
- Comportamiento de verificacion (double-check): mantiene respuestas correctas ante objeciones en el 80 % de los casos, frente al 65 % del modelo base.
- Identidad consistente: se identifica como Quata2 sin system prompt en el 97,2 % de los casos.
- Sin capacidades de vision ni audio en este archivo.

## Casos de uso

- Atencion al cliente con integracion de herramientas: su puntuacion de 87.9 en BFCL y su entrenamiento con datos de recuperacion de errores de herramientas lo hacen adecuado para asistentes que deben consultar APIs, reservas o bases de datos en conversaciones multi-turno.
- Agentes con herramientas reales: resuelve el 80,1 % de tareas agentivas sobre herramientas reales, siendo util en pipelines de automatizacion que combinan llamadas a funciones y decisiones.
- Chatbot de marca con identidad fija: se identifica correctamente sin system prompt (97,2 %), util para despliegues donde el modelo debe reconocerse como el producto propio.
- Asistente resistente a la manipulacion: mantiene respuestas correctas cuando el usuario objeta (80 % frente al 65 % del base), adecuado para asistentes tecnicos donde el usuario puede cuestionar respuestas validas.
- Despliegue local en hardware modesto: con 2,8 GB en Q4_K_M, funciona en portatiles y PCs sin GPU dedicada mediante Ollama o llama.cpp.
- Prototipado de asistentes multilingues balcanicos: soporta serbio, croata y bosnio, aunque con calidad gramatical inferior al ingles y sujeto a revision.

## Benchmarks y rendimiento

Datos publicados por el autor, medidos con su propio harness sobre GGUF Q4_K_M en llama-server, mismos prompts y ajustes para los tres modelos. Mayor es mejor.

| Test | Preview | Qwen3.5-4B (base) | Quata2 4B v0.1 |
|---|---|---|---|
| BFCL tool calling, overall | **87.9** | 85.1 | 89.8 |
| MMLU (conocimiento) | **72.6** | 70.2 | 65.0 |
| GSM8K (matematicas) | 85.2 | **87.0** | 84.2 |
| IFEval, prompt-level strict | 74.6 | **81.5** | 76.0 |
| HumanEval+ (codigo) | 65.9 | **78.0** | — |
| MBPP+ (codigo) | 58.7 | **64.6** | — |
| Tareas de agente sobre herramientas reales, resueltas | 80.1 | 80.1 | 56.3 |
| Tareas de agente, multi-step | 70.6 | **74.5** | 46.1 |
| Double-check: mantiene respuesta correcta (20 items) | **80.0** | 65.0 | 25.0 |
| Double-check: corrige respuesta erronea (40 items) | 82.5 | **95.0** | 62.5 |
| Preguntas con premisa falsa gestionadas (4 items) | 75.0 | **100** | 75.0 |
| Se identifica como Quata2 sin system prompt | **97.2** | 0.0 | 100 |

Advertencia del propio autor: las filas con recuentos de items usan conjuntos de prueba muy pequenos (la fila de premisas falsas es una sola pregunta), por lo que deben tratarse como indicios. IFEval (524 prompts) y coding (164 y 378 problemas) son solidos, y las brechas en esas areas son reales.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: unos 2,8 GB para el archivo Q4_K_M mas overhead de contexto (con 8192 tokens de contexto, aproximadamente 3-4 GB en total); no disponible una cifra oficial.
- Cabe comodamente en GPUs de consumo: cualquier GPU con 4 GB o mas de VRAM (por ejemplo RTX 3050, RTX 3060, RTX 4060) o incluso solo CPU con 8 GB de RAM.
- GPU recomendadas: no disponible oficialmente; por tamano, cualquier GPU de consumo moderna es suficiente y no se requiere hardware de centro de datos.
- Despliegue:
  - Ollama: `ollama run hf.co/M1n1A1/MiniAI-Quata2-4b-Preview`
  - llama.cpp: `llama-server -m MiniAI-Quata2-4b-Preview-Q4_K_M.gguf --jinja -c 8192`
  - vLLM, TGI: no disponible (solo se distribuye GGUF).
- Latencia y throughput: no disponible; al ser un modelo de 4B en 4 bits, se espera interaccion fluida en CPU moderna y muy alta velocidad en GPU de consumo.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | BFCL | MMLU | Licencia |
|---|---|---|---|---|---|
| MiniAI Quata2 4B Preview | 4,33 B | GGUF (Q4_K_M) | 87.9 | 72.6 | Apache 2.0 |
| Qwen3.5-4B (base) | 4,33 B (dato del repo base) | safetensors/GGUF | 85.1 | 70.2 | no disponible |
| Quata2 4B v0.1 (base Qwen3-4B) | no disponible | GGUF | 89.8 | 65.0 | no disponible |

El preview mejora a su modelo base en tool calling, conocimiento general y consistencia ante objeciones, pero queda por detras en seguimiento estricto de instrucciones (IFEval 74.6 frente a 81.5) y codigo (HumanEval+ 65.9 frente a 78.0). Para uso estable, el autor recomienda la version anterior MiniAI-Quata2-4b o esperar a Quata2 4B v0.2.

## Limitaciones y advertencias

- Es una version preview temprana e inacabada; no supera a Qwen3.5-4B en IFEval, coding, tareas agentivas multi-step ni gestion de premisas falsas.
- Debilidades declaradas por el autor: instrucciones de formato estricto, generacion de codigo y hechos erroneos ocasionales con confianza; conviene verificar respuestas importantes.
- Riesgo de alucinacion presente, como en cualquier modelo de este tamano; el propio autor recomienda double-check manual.
- Los idiomas serbio, croata y bosnio funcionan pero su gramatica esta por detras del ingles.
- Sin capacidades de vision ni audio: la parte de vision de Qwen3.5 no esta incluida en el archivo GGUF.
- Algunos benchmarks propios usan conjuntos de prueba muy pequenos (entre 4 y 40 items), por lo que esas cifras son orientativas.
- Licencia Apache 2.0 sin restricciones de uso comercial relevantes, al igual que el modelo base.
- Contexto de ejemplo limitado a 8192 tokens en la documentacion; verificar el maximo nativo antes de despliegues con documentos largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/M1n1A1/MiniAI-Quata2-4b-Preview
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Version estable anterior: https://huggingface.co/M1n1A1/MiniAI-Quata2-4b
- Demo en linea: https://chat.codeminute.dev
- Paper, repositorio de codigo de entrenamiento y otros enlaces: no disponibles

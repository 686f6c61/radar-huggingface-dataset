# netprojects/Qwen3.8-27B-super-adapter-MLX-4bit

## Resumen

Qwen3.8-27B-super-adapter-MLX-4bit es una cuantizacion en 4 bits para Apple Silicon del modelo harness-hub/Qwen3.8-27B-super-adapter, publicado por el usuario netprojects. Se trata de un "super-adapter" construido por harness-hub que fusiona tres especialistas de reinforcement learning entrenados sobre Qwen/Qwen3.8-27B, cada uno optimizado para un agente de programacion distinto: pi, Hermes Agent y OpenCode. La fusion se realiza a peso 1/2 por especialista, sin entrenamiento adicional, y el resultado se convierte a formato MLX con mlx-vlm incluyendo el encoder de vision y la capa MTP (multi-token prediction) de Qwen.

El modelo resuelve un problema concreto: obtener un unico checkpoint que rinda bien en varios harnesses de agentes de codigo sin necesidad de mantener tres modelos separados. Segun los datos publicados por harness-hub, con thinking activado la media de pass@1 en SWE-bench Pro (hard 51) y Terminal-Bench 2.1 pasa del 55,5% del modelo base al 63,5%, con entre un 19% y un 48% menos de llamadas a herramientas por tarea. Con thinking desactivado, la media sube del 39,5% al 49,0% con entre un 53% y un 73% menos de llamadas a herramientas.

Esta build concreta pesa 16,3 GB y esta pensada para Macs con memoria unificada limitada (32 GB o mas). Es la variante de menor fidelidad de la familia MLX publicada por netprojects: conserva el mismo siguiente token que bf16 en el 96,2% de los casos y presenta una divergencia KL de 0,0194 frente a bf16, con un pico de memoria de 17,1 GB para un prompt de 8K tokens. El modelo tiene 27.781.427.952 parametros totales y pipeline image-text-to-text, por lo que conserva capacidad multimodal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.8-27B) con encoder de vision y capa MTP; adaptado mediante fusion de tres LoRA y convertido a MLX |
| Parametros totales | 27.781.427.952 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (Hermes Agent requiere al menos 64.000 tokens de contexto) |
| Tipos de cuantizacion | 4 bits afino (affine), group size 64, sobre capas lineales; familia disponible en 3, 4, 6 y 8 bits |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (libreria mlx, mlx-vlm) |

## Arquitectura y entrenamiento

La base es Qwen/Qwen3.8-27B (revision 3756181), un transformer denso de aproximadamente 27,8 mil millones de parametros con encoder de vision y una capa de multi-token prediction (MTP) propia de Qwen. Sobre esa base, harness-hub entreno tres especialistas de reinforcement learning, uno por harness: pi y Hermes Agent en el step 160 y OpenCode en el step 150. El super-adapter fusiona los tres conjuntos de pesos LoRA a peso 1/2 cada uno, sin entrenamiento posterior, y se publica como revision adb00e9.

La build de netprojects aplica ese adapter fusionado sobre el modelo base y convierte el conjunto a MLX con mlx-vlm, manteniendo el encoder de vision y la capa MTP. La cuantizacion es affine de 4 bits con group size 64 sobre las capas lineales, lo que reduce el checkpoint a 16,3 GB. El tokenizer y la plantilla de chat son los archivos originales de harness-hub, sin modificaciones, y la plantilla activa thinking por defecto. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni los detalles del proceso de RL (recompensas, DPO, etc.) mas alla de los steps indicados.

## Capacidades

- Generacion de texto y razonamiento con modo thinking activable o desactivable mediante la plantilla de chat (`enable_thinking`).
- Programacion y resolucion de tareas de ingenieria de software en entornos reales, con enfasis en parcheo de bugs y ejecucion de tests.
- Uso de herramientas (tool calling / function calling) en el protocolo OpenAI-compatible que expone mlx-lm.
- Comportamiento agentico multi-paso orientado a harnesses concretos: pi, Hermes Agent y OpenCode.
- Capacidad multimodal image-text-to-text: procesa imagenes junto con texto mediante el encoder de vision (por ejemplo, capturas de terminal o pantallas).
- Decodificacion con capa MTP de Qwen incluida en la conversion.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Reparacion automatica de tests en un repositorio local: servir el modelo con `mlx_lm.server` y lanzar pi o OpenCode contra el endpoint para que localice por que fallan los tests de un fichero concreto y aplique el parche. El modelo esta entrenado especificamente para este flujo y reduce el numero de llamadas a herramientas frente al base.
- Agente de terminal autonomo: con Terminal-Bench 2.1 como referencia, el modelo puede encadenar comandos de shell, leer salidas y corregir errores en tareas de administracion o build. Hermes Agent requiere al menos 64.000 tokens de contexto, por lo que conviene configurar el servidor con una ventana amplia.
- Asistente de codigo en local para desarrolladores con Mac: al caber en 32 GB de memoria unificada, permite trabajar sin enviar codigo propiedad de la empresa a APIs externas, con licencia Apache 2.0.
- Analisis de capturas de pantalla o salidas de terminal: usando mlx-vlm, el modelo puede interpretar una imagen de error y proponer la causa, util en soporte tecnico interno o triaje de incidencias.
- Integracion en pipelines de CI/CD: el servidor OpenAI-compatible permite invocar el modelo desde scripts de integracion para tareas de revision o generacion de parches acotados, siempre que el hardware donde corre el runner tenga Apple Silicon y memoria suficiente.
- Evaluacion comparativa de harnesses: al ser un unico checkpoint que cubre los tres agentes, sirve para medir el rendimiento de pi, Hermes Agent y OpenCode sobre el mismo modelo sin cambiar de pesos.
- Prototipado de agentes multimodales en local: la combinacion de vision, tool calling y thinking permite construir demos de agentes que inspeccionan pantallas y actuan sobre ellas sin depender de la nube.

## Benchmarks y rendimiento

Resultados publicados por harness-hub para el super-adapter (no especificos de esta build de 4 bits), sobre SWE-bench Pro (hard 51) y Terminal-Bench 2.1:

| Configuracion | Base (thinking) | Super-adapter (thinking) | Base (sin thinking) | Super-adapter (sin thinking) |
|---|---|---|---|---|
| Media pass@1 (6 pares harness-benchmark) | 55,5% | 63,5% | 39,5% | 49,0% |
| SWE-bench Pro bajo OpenCode | 47,1% | 66,7% | No disponible | No disponible |
| SWE-bench Pro bajo Hermes Agent | 45,1% | 60,8% | No disponible | No disponible |
| Reduccion de llamadas a herramientas | Referencia | 19-48% menos | Referencia | 53-73% menos |

Fidelidad de la cuantizacion de esta build frente a bf16:

| Metrica | 4-bit | 6-bit | 8-bit |
|---|---|---|---|
| Mismo siguiente token que bf16 | 96,2% | 99,5% | 99,6% |
| KL vs bf16 | 0,0194 | 0,0014 | 0,0005 |
| GSM8K (50 preguntas) | 45/50 | 45/50 | 45/50 |
| Tamano | 16,3 GB | 23,1 GB | 30,0 GB |
| Pico de memoria con prompt de 8K | 17,1 GB | 23,4 GB | 29,7 GB |
| Memoria de Mac sugerida | 32 GB+ | 36 GB+ | 48 GB+ |

No se han publicado resultados de benchmarks del modelo base Qwen3.8-27B en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada: 17,1 GB de pico con prompt de 8K tokens; se recomienda un Mac con 32 GB o mas de memoria unificada.
- Hardware: exclusivamente Apple Silicon (MLX); no es ejecutable en GPU NVIDIA ni en CPU x86 con esta build.
- Cabe en Macs consumer con 32 GB (M1/M2/M3/M4 Pro y Max de gama adecuada); para 6 bits se recomiendan 36 GB+ y para 8 bits 48 GB+.
- Despliegue: `mlx_lm.server` (servidor OpenAI-compatible, requiere mlx-lm >= 0.32.2), `mlx-lm` para texto en Python y `mlx-vlm` >= 0.7.11 para inferencia con imagenes.
- Integracion con harnesses: pi (Node.js 22.19+), Hermes Agent y OpenCode 2.2.7 mediante configuracion de proveedor OpenAI-compatible.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Para thinking-on, harness-hub evaluo con hasta 32.768 tokens de salida por llamada; conviene permitir respuestas largas en el servidor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| netprojects/Qwen3.8-27B-super-adapter-MLX-4bit | 27,8B | No disponible | 4 bits MLX | 16,3 GB | Apache 2.0 | Hugging Face |
| netprojects/Qwen3.8-27B-super-adapter-MLX-6bit | 27,8B | No disponible | 6 bits MLX | 23,1 GB | Apache 2.0 | Hugging Face |
| netprojects/Qwen3.8-27B-super-adapter-MLX-8bit | 27,8B | No disponible | 8 bits MLX | 30,0 GB | Apache 2.0 | Hugging Face |
| harness-hub/Qwen3.8-27B-super-adapter (bf16) | 27,8B | No disponible | bf16 | ~55,6 GB (referencia local) | Apache 2.0 | Hugging Face |
| netprojects/Qwen3.8-27B-pi-adapted-MLX-6bit | 27,8B | No disponible | 6 bits MLX | No disponible | Apache 2.0 | Hugging Face |
| netprojects/Qwen3.8-27B-hermes-adapted-MLX-6bit | 27,8B | No disponible | 6 bits MLX | No disponible | Apache 2.0 | Hugging Face |
| netprojects/Qwen3.8-27B-opencode-adapted-MLX-6bit | 27,8B | No disponible | 6 bits MLX | No disponible | Apache 2.0 | Hugging Face |

Las builds especializadas (pi, Hermes Agent, OpenCode) son la alternativa recomendada por harness-hub cuando se usa un unico harness con thinking desactivado; el super-adapter es preferible cuando se alterna entre varios harnesses o se mantiene thinking activado.

## Limitaciones y advertencias

- La cuantizacion de 4 bits degrada la fidelidad: solo el 96,2% de los siguientes tokens coinciden con bf16 y la KL es de 0,0194, un orden de magnitud peor que la build de 6 bits. Para tareas sensibles conviene usar 6 u 8 bits.
- El modelo esta especializado en agentes de codigo; su comportamiento fuera de ese dominio no esta documentado y puede degradarse respecto al base.
- Riesgo de alucinacion inherente a los LLM, agravado en tareas de agente donde una accion erronea puede modificar ficheros o ejecutar comandos. Se recomienda sandboxing y revision humana de los cambios.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Idiomas soportados: no disponibles; no se garantiza un rendimiento adecuado en castellano ni en otros idiomas distintos del ingles.
- Longitud de contexto: no disponible; Hermes Agent exige al menos 64.000 tokens, lo que limita el uso con harnesses que requieran ventanas mayores.
- Dependencia de Apple Silicon: no hay build para CUDA, ROCm ni CPU generica; el despliegue en servidores x86 no es posible con estos pesos.
- El modelo requiere thinking-on para alcanzar los mejores resultados segun harness-hub; con thinking-off conviene usar el especialista del harness correspondiente.
- Licencia Apache 2.0 permite uso comercial, pero se heredan las condiciones del modelo base Qwen y de los datos de entrenamiento de los adapters; conviene revisar la model card original antes de desplegar en produccion.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en produccion por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/Qwen3.8-27B-super-adapter-MLX-4bit
- Adapter original: https://huggingface.co/harness-hub/Qwen3.8-27B-super-adapter
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Build de 6 bits: https://huggingface.co/netprojects/Qwen3.8-27B-super-adapter-MLX-6bit
- Build de 8 bits: https://huggingface.co/netprojects/Qwen3.8-27B-super-adapter-MLX-8bit
- Build especializada para pi: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-6bit
- Build especializada para Hermes Agent: https://huggingface.co/netprojects/Qwen3.8-27B-hermes-adapted-MLX-6bit
- Build especializada para OpenCode: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-6bit
- Repositorio de pi: https://github.com/earendil-works/pi
- Repositorio de Hermes Agent: https://github.com/NousResearch/hermes-agent
- OpenCode: https://opencode.ai

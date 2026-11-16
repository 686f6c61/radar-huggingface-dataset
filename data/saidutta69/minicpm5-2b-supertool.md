# saidutta69/MiniCPM5-2B-Supertool

## Resumen

MiniCPM5-2B-Supertool es un ajuste fino del modelo base `openbmb/MiniCPM5-2B` (2.516.756.480 parámetros) desarrollado por el usuario de Hugging Face `saidutta69`. Su propósito es especializar al modelo en la emisión de llamadas a herramientas (tool calling / function calling), concretamente en la superficie de herramientas de Claude Code: `Bash`, `Read`, `Write`, `Edit`, `Glob`, `Grep`, `WebFetch`, `WebSearch`, `TodoWrite`, `TaskUpdate` y `ToolSearch`. El modelo emite las llamadas en la forma XML nativa del modelo base, del estilo `<function name="Bash"><param name="command">ls tasks/</param></function>`.

El problema que aborda es la baja fiabilidad de los modelos pequeños al generar llamadas estructuradas a funciones: el modelo base solo produce una llamada parseable aproximadamente la mitad de las veces. Supertool eleva la tasa de éxito en un benchmark independiente de APIs retenidas del 49,3 % al 77,3 %, y reduce los fallos de formato del 50,0 % al 8,7 %. Es relevante para quienes despliegan agentes de código en entornos con recursos limitados, ya que un modelo de 2,5B puede ejecutarse en GPUs de consumo.

La licencia es Apache-2.0, los pesos se distribuyen en precisión completa con el adaptador LoRA ya fusionado y el repositorio ocupa 5,1 GB. El modelo está pensado exclusivamente para inglés y no incluye compilación GGUF publicada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de `openbmb/MiniCPM5-2B`); detalles internos no disponibles |
| Parámetros totales | 2.516.756.480 (2,5B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el entrenamiento usó secuencias de 4096 tokens) |
| Tipos de cuantización | Pesos en precisión completa (fp16/bf16); el entrenamiento usó QLoRA NF4 4-bit; no hay GGUF publicado |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (transformers); LoRA fusionado |

## Arquitectura y entrenamiento

El modelo parte de `openbmb/MiniCPM5-2B`, un transformer de 2,5B parámetros, y se ajusta mediante QLoRA con cuantización NF4 de 4 bits, rango de LoRA r=16, alpha=32 y dropout 0. Los módulos objetivo del adaptador son `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. El adaptador se fusiona posteriormente en los pesos, de modo que el modelo se carga directamente con `AutoModelForCausalLM` sin necesidad de PEFT ni de un paso de adaptación adicional.

El entrenamiento utilizó únicamente el split `claude_code` del dataset `saidutta69/fable-5.1-premium-v2`, con 42.514 ejemplos (uno por turno de asistente con llamada a herramienta), cubriendo aproximadamente 3.500 de 4.132 trayectorias con 12 ejemplos por trayectoria. Se validaron 347.136 llamadas sin JSON malformado ni campos obligatorios ausentes. La supervisión se aplicó solo al turno final del asistente mediante una división prompt/completion. El calendario fue de 240 pasos, batch efectivo de 16, secuencia de 4096 tokens, learning rate 2e-4 con decaimiento coseno y warmup del 3 %. La pérdida bajó de 1,107 a 0,276. El entrenamiento se ejecutó en 2× Tesla T4 (sm_75) en fp16 durante 7 horas y 40 minutos, con un pico de 8,92 GB por tarjeta.

Los datos proceden originalmente de `MoreThought/Fable-5.1-Max-Reasoning-Filtered-10000x` y fueron reprocesados: se descartó la mitad anonimizada (`unknown_tool`), se eliminaron llamadas sin respuesta de herramienta asociada y mensajes huérfanos, se reserializaron los mensajes de forma canónica y se deduplicaron por SHA-256, se reconstruyó el esquema de 14 herramientas de Claude Code y se validó cada llamada contra él, y se excluyó la configuración `fable_code` porque 203.750 de sus 203.794 llamadas llevaban el esquema renderizado como valor (`{"path": "<file_path>"}`), lo que enseña al modelo a emitir marcadores de posición.

## Capacidades

- Generación de llamadas a herramientas en formato XML nativo del modelo base, con nombre de función y parámetros.
- Cobertura del conjunto de herramientas de Claude Code: `Bash`, `Read`, `Write`, `Edit`, `Glob`, `Grep`, `WebFetch`, `WebSearch`, `TodoWrite`, `TaskUpdate` y `ToolSearch`.
- Soporte de esquemas de herramientas mediante `apply_chat_template(tools=...)`, igual que el modelo base.
- Escritura de cuerpos de fichero reales en llamadas `Write` (no marcadores de posición), lo que explica la truncación observada en el benchmark in-domain.
- Transferencia entre esquemas: el benchmark FC-Eval sobre 89 APIs no vistas en entrenamiento muestra capacidad de generalización parcial, no limitada al esquema de Claude Code.
- Conversación multi-turno básica heredada del modelo base, aunque más débil que este en diálogo abierto.
- Sin modo de razonamiento explícito, sin visión, sin audio y sin capacidades multimodales documentadas.
- Sin soporte multilingüe: solo inglés.

## Casos de uso

- Agentes de codificación en local: el modelo puede integrarse como planificador de llamadas a herramientas en un agente tipo Claude Code sobre una GPU de consumo, emitiendo llamadas `Bash`, `Read` o `Edit` que un orquestador valida y ejecuta. Su tamaño de 2,5B permite ejecutarlo junto al resto del pipeline en una sola tarjeta.
- Automatización de tareas de sistema de ficheros: con las herramientas `Glob`, `Grep` y `Read`, puede construir llamadas para localizar ficheros por patrón, buscar contenido y leer resultados, útil en scripts de mantenimiento de repositorios.
- Edición de código asistida por lotes: las herramientas `Edit` y `Write` permiten generar parches y ficheros completos, adecuado para pipelines de refactorización donde cada llamada se valida contra el esquema antes de aplicarse.
- Búsqueda web aumentada: con `WebFetch` y `WebSearch`, puede emitir llamadas para recuperar documentación o resultados de búsqueda dentro de un agente de investigación, siempre que se filtre la salida no confiable antes de realimentarla.
- Gestión de tareas en agentes multi-paso: las herramientas `TodoWrite` y `TaskUpdate` permiten mantener un estado de tareas dentro de un agente, útil para flujos de trabajo con varios pasos y seguimiento de progreso.
- Evaluación y generación de datos sintéticos de tool calling: al ser un especialista en un esquema conocido, puede usarse para generar trazas de llamadas etiquetadas que sirvan como datos de entrenamiento o para pruebas de robustez de orquestadores.
- Prototipado en entornos con presupuesto de VRAM reducido: al requerir poco más de 8,9 GB por tarjeta en entrenamiento con 4 bits, es viable para experimentación en una T4 o en GPUs de consumo con cuantización.

## Benchmarks y rendimiento

FC-Eval, conjunto retenido de 89 APIs no vistas en entrenamiento, 150 tareas, decodificación greedy, ambos modelos en fp16:

| Métrica | Base | Supertool |
|---|---:|---:|
| Éxito de tarea (llamada exacta) | 49,3 % | 77,3 % |
| Nombre de herramienta correcto | 50,0 % | 90,0 % |
| Claves de argumento correctas | 50,0 % | 87,3 % |
| Fallos de formato | 50,0 % | 8,7 % |
| Tiempo total, 150 tareas | 1071 s | 886 s |

Trazas de agente in-domain, 120 ejemplos del split `validation` del dataset de entrenamiento, greedy, `max_new=384`, ambos modelos en 4 bits sobre una Tesla T4:

| Métrica | Base | Supertool |
|---|---:|---:|
| Pérdida de completion | 1,5691 | 1,1246 |
| Nombre de herramienta correcto | 47,5 % | 54,2 % |
| Nombres de argumento correctos | 31,7 % | 46,7 % |
| Coincidencia completa | 0,0 % | 4,2 % |
| Llamada parseable emitida | 88,3 % | 75,8 % |

Entre las llamadas que sí emite Supertool en in-domain: nombre de herramienta correcto 71,4 % frente a 53,8 % del base, y nombres de argumento correctos 61,5 % frente a 35,8 %. El autor atribuye la menor tasa de llamadas parseables a truncación en llamadas `Write` cortadas por el límite de generación, no a incumplimiento de formato.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16, los 2,5B parámetros requieren aproximadamente 5 GB de pesos más overhead de activaciones y KV cache; en 4 bits, alrededor de 1,5-2 GB de pesos.
- GPU recomendadas: Tesla T4 (usada en el entrenamiento y en la evaluación in-domain), A100, H100 para mayor throughput; RTX 4090 y GPUs de consumo con 8 GB o más para fp16.
- Cabe en GPU de consumo: sí, en tarjetas con al menos 8 GB de VRAM en fp16 y en tarjetas con 4-6 GB usando cuantización de 4 bits.
- Opciones de despliegue: transformers (soporte nativo), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible` en el repositorio). No hay compilación GGUF ni llama.cpp publicada, por lo que Ollama no está disponible de forma directa.
- Latencia y throughput: en FC-Eval, 886 s para 150 tareas greedy en fp16 (aproximadamente 5,9 s por tarea, incluyendo generación completa); el base tardó 1071 s. No se publican cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM5-2B-Supertool | 2,5B | No disponible | Tool calling Claude Code | Apache-2.0 | Hugging Face, safetensors |
| openbmb/MiniCPM5-2B (base) | 2,5B | No disponible | Propósito general | Apache-2.0 (según el autor) | Hugging Face |
| Alternativas de tool calling de tamaño similar | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks de terceros para establecer una comparación cuantitativa con otros modelos de tool calling de tamaño comparable en la información proporcionada.

## Limitaciones y advertencias

- No es un asistente general: es un especialista de 2,5B que emite llamadas a herramientas y es más débil que el modelo base en conversación abierta.
- Entrenado sobre una única familia de herramientas (Claude Code); la transferencia a esquemas arbitrarios es parcial, como muestra FC-Eval.
- La coincidencia exacta in-domain es baja (5 de 120); los payloads largos de `Write` se aproximan y se truncan con facilidad.
- Entrenamiento de una sola pasada: 240 pasos equivalen a aproximadamente tres cuartos de una época.
- No hay compilación GGUF ni llama.cpp publicada, lo que limita el despliegue en CPU y en herramientas como Ollama.
- La pérdida en retenido es peor que la de una ejecución anterior más estrecha de la misma receta (1,125 frente a 0,976), aunque la precisión de herramientas es mejor: más datos implican menos memorización y más generalización.
- Sin guardarraíles: no fue entrenado ni evaluado para resistir inyección de prompts y seguirá instrucciones que lleguen dentro de la salida de una herramienta. Debe validarse cada llamada antes de ejecutar acciones destructivas y no debe exponerse a resultados de herramientas no confiables sin una capa de políticas.
- Solo inglés; no se documentan capacidades multilingües.
- Licencia Apache-2.0 permite uso comercial, pero el autor remite a la model card del modelo base para condiciones adicionales (texto truncado en la información disponible).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/saidutta69/MiniCPM5-2B-Supertool
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Dataset de evaluación FC-Eval: https://huggingface.co/datasets/saidutta69/fc-eval-benchmark
- Dataset de entrenamiento: https://huggingface.co/datasets/saidutta69/fable-5.1-premium-v2
- Dataset de origen de las trazas: https://huggingface.co/datasets/MoreThought/Fable-5.1-Max-Reasoning-Filtered-10000x

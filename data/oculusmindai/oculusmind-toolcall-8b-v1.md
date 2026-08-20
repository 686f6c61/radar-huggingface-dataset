# OculusMindAI/OculusMind-ToolCall-8B-v1

## Resumen

OculusMind-ToolCall-8B-v1, también conocido como "Pico", es un fine-tuning LoRA del modelo `mistralai/Ministral-3-8B-Instruct-2512-BF16` desarrollado por OculusMind.AI. Está diseñado específicamente para mejorar el function calling en agentes de una sola vuelta (single-turn), aunque sus propios autores documentan que no mejora el uso de herramientas multi-turno y que reduce la capacidad de rechazar llamadas innecesarias. Se distribuye bajo licencia Apache-2.0 en formato GGUF (Q4_K_M y Q8_0) y como adaptador LoRA, sin pesos safetensors fusionados.

El modelo parte de una arquitectura `mistral3` con 8,92 mil millones de parámetros y una ventana de contexto nativa de 262 144 tokens mediante YaRN, aunque se sirve y evalúa a 65 536. El entrenamiento consumió 14 456 filas de un mix de datasets públicos (ToolACE, hermes_reasoning_tool_use, hermes-function-calling-v1, smol-smoltalk) más 53 capturas internas propietarias de OculusMind. La model card es inusualmente transparente: publica todos los resultados, incluidos los negativos, y documenta que el modelo no superó su propia regla interna de promoción, siendo marcado como ROLLBACK aunque se publica igualmente para evaluación externa.

La relevancia de este modelo reside en su honestidad metodológica: sirve como caso de estudio de cómo un fine-tuning puede mejorar una métrica concreta (single-turn AST en BFCL V4) mientras degrada otras (restricción y relevancia), y de cómo una organización puede publicar resultados completos sin cherry-picking. Para un evaluador técnico, es útil como referencia de qué esperar de un LoRA de rango 16 sobre Ministral-3 en tareas de tool calling.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | mistral3 (`Mistral3ForConditionalGeneration`) |
| Parametros totales | 8 918 000 000 (8,92 B) en el modelo base; 44 564 480 entrenables (0,50 %) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 144 nativa (YaRN, base 16 384); servida y evaluada a 65 536 |
| Tipos de cuantizacion | GGUF Q4_K_M y Q8_0; adaptador LoRA (sin safetensors fusionado) |
| Idiomas soportados | ingles, chino |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (Q4_K_M, Q8_0), adaptador LoRA |

## Arquitectura y entrenamiento

El modelo es un fine-tuning LoRA de rango 16 sobre `mistralai/Ministral-3-8B-Instruct-2512-BF16`, un transformer denso de la familia mistral3 con 34 capas de lenguaje. El adaptador LoRA se entrena con supervisión (SFT) y se fusiona posteriormente en los pesos base. Se consumieron 14 456 filas de un mix de 14 465, con 1 807 actualizaciones de optimizador (1 época, batch 1, gradiente acumulado 8). Los datasets externos son todos Apache-2.0: Team-ACE/ToolACE, interstellarninja/hermes_reasoning_tool_use, NousResearch/hermes-function-calling-v1 y HuggingFaceTB/smol-smoltalk. Además se incluyen 53 filas de capturas internas de producción de OculusMind, que permanecen propietarias y no se redistribuyen.

La innovación técnica principal no está en la arquitectura, sino en el proceso de evaluación: el equipo fija un harness de BFCL V4 en un commit concreto, mide cada cuantización contra el base a la misma cuantización, y publica todas las categorías, incluidas las que empeoran. No se aplicó RLHF ni DPO; es SFT puro. El nombre "Pico" está incrustado en el mensaje de sistema por defecto de los builds GGUF, de forma similar a como el base se llama "Le Chat".

## Capacidades

- Generacion de texto y razonamiento conversacional multilingue (ingles y chino).
- Function calling de una sola vuelta (single-turn) con mejora sustancial sobre el base en BFCL V4: Non-Live AST 73,71 → 87,96 y Live AST 66,25 → 79,13 en Q4_K_M.
- Soporte de tool calling estructurado y round-trip de resultados de herramientas, verificado en Ollama 0.32.5.
- No mejora el uso de herramientas multi-turno: todas las categorías multi-turno quedan dentro de la banda de ruido del 95 %.
- Capacidad reducida de rechazar llamadas irrelevantes: regresión en `live_irrelevance` (−16,18) e `irrelevance` (−7,08).
- Ventana de contexto larga (hasta 262 144 nativa, 65 536 en servicio) para tareas con historial extenso.
- Sin capacidades de vision, audio ni thinking mode documentadas.

## Casos de uso

- Asistentes de automatizacion de una sola llamada: el modelo es adecuado para escenarios donde un agente debe invocar una herramienta concreta a partir de una instruccion unica, como extraer datos de una API o ejecutar una busqueda puntual, gracias a la mejora de +14,25 en Non-Live AST.
- Evaluacion de pipelines de function calling: por su transparencia y resultados publicados, sirve como banco de pruebas para comparar metodologias de fine-tuning y cuantizacion en tareas de tool use.
- Prototipado rapido con Ollama: los builds GGUF estan verificados con Ollama 0.32.5, incluyendo llamadas estructuradas y el ciclo de retorno de resultados, lo que facilita integraciones locales sin infraestructura compleja.
- Investigacion sobre alineacion y restriccion: el caso documentado de regresion en irrelevance lo convierte en un objeto de estudio para entender como el SFT puede degradar la capacidad de un modelo para declinar acciones.
- Despliegue en entornos con recursos limitados: al ser un modelo de 8B en Q4_K_M, cabe en GPUs de consumo con 6-8 GB de VRAM, permitiendo inferencia local de tool calling sin depender de APIs externas.
- Generacion de codigo con herramientas: aunque no se reportan benchmarks especificos de codigo, su base Ministral-3-Instruct tiene capacidades de generacion de codigo, y el fine-tuning preserva la generacion de texto; puede usarse para asistentes de desarrollo que invoquen funciones de CI/CD o linters.

## Benchmarks y rendimiento

Resultados medidos por OculusMind.AI en BFCL V4 con harness fijado en el commit `f7cf7359b7ac615a0b294831c5ba2bc95ee4a000` (bfcl-eval 2025.12.17), comparando cada cuantizacion contra el base a la misma cuantizacion. Se evaluaron 4 441 items sin juez.

| Metrica | Base Q4_K_M | Pico Q4_K_M | Delta | Base Q8_0 | Pico Q8_0 | Delta |
|---|---|---|---|---|---|---|
| Non-Live AST | 73,71 | 87,96 | +14,25 | no disponible | no disponible | +11,62 |
| Live AST | 66,25 | 79,13 | +12,88 | no disponible | no disponible | +11,03 |
| Multi-turn (agregado) | 16,38 | 17,38 | +1,00 | no disponible | no disponible | −1,00 |
| live_irrelevance | 85,29 | 69,12 | −16,18 | no disponible | no disponible | no disponible |
| irrelevance | 89,58 | 82,50 | −7,08 | no disponible | no disponible | no disponible |

Suite privada de agentes de produccion: 52/62 (0,839) en el base frente a 45/62 (0,726) en el fine-tune, una regresion de 7 puntos. No se publican resultados de MMLU, HumanEval, GSM8K ni otros benchmarks genericos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5-6 GB para Q4_K_M y 9-10 GB para Q8_0 en un modelo de 8B (estimacion razonable, no medida por el autor).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para Q4_K_M (p. ej., RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090); para Q8_0 se recomienda 12 GB o mas.
- Cabe en GPUs de consumo: si, especialmente en Q4_K_M.
- Opciones de despliegue: Ollama (verificado en 0.32.5), llama.cpp, vLLM, TGI; el formato GGUF es compatible con estos motores.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de una comparativa directa publicada con otros modelos de la misma categoria. Como referencia, el modelo base `mistralai/Ministral-3-8B-Instruct-2512-BF16` es el punto de partida natural, y el propio fine-tune se evalua contra el. Otros modelos de 8B con capacidades de tool calling, como Qwen3-8B, existen en el ecosistema, pero no hay datos de comparacion en la informacion disponible.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| OculusMind-ToolCall-8B-v1 | 8,92 B | 262 144 (nativa) | Apache-2.0 | GGUF, LoRA | Fine-tune LoRA para single-turn tool calling |
| Ministral-3-8B-Instruct-2512 | 8,92 B | 262 144 (nativa) | Apache-2.0 | safetensors, GGUF | Modelo base, sin fine-tuning especifico |
| Qwen3-8B | 8,03 B | 32 768 (base) | Apache-2.0 | safetensors, GGUF | Modelo generico con capacidades de tool calling, sin datos de comparacion con Pico |

## Limitaciones y advertencias

- No mejora el uso de herramientas multi-turno: todas las categorias multi-turno de BFCL V4 quedan dentro de la banda de ruido, y en Q8_0 hay una ligera regresion (−1,00).
- Regresion en restriccion: el modelo es menos capaz de rechazar llamadas irrelevantes (`live_irrelevance` cae de 85,29 a 69,12), lo que puede provocar invocaciones espurias de herramientas en produccion.
- Regresion en la suite privada de agentes: de 52/62 a 45/62, lo que indica una degradacion general en cargas de trabajo reales de agente.
- Resultado no replicado entre semillas: solo se entreno una semilla (seed 42); las semillas 43 y 44 se cancelaron, por lo que la robustez del resultado no esta confirmada.
- El modelo fue marcado como ROLLBACK internamente por no cumplir la regla de promocion de OculusMind; se publica con esa advertencia explicita.
- No hay pesos safetensors fusionados: solo GGUF y adaptador LoRA, lo que limita su uso en frameworks que requieran el formato original.
- Datos de entrenamiento parcialmente propietarios: 53 filas de capturas internas no se redistribuyen, lo que dificulta la reproducibilidad completa del entrenamiento.
- Idiomas limitados a ingles y chino; no se garantiza rendimiento en otros idiomas.
- Riesgo de alucinacion y sesgos no documentados especificamente, pero presentes como en cualquier modelo de 8B entrenado con SFT.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OculusMindAI/OculusMind-ToolCall-8B-v1
- Organizacion OculusMind.AI en GitHub: https://github.com/OculusMindAI/
- Repositorio del SDK de agentes: https://github.com/OculusMindAI/oculusmind-agents-sdk
- Modelo base: https://huggingface.co/mistralai/Ministral-3-8B-Instruct-2512-BF16
- Dataset ToolACE: https://huggingface.co/datasets/Team-ACE/ToolACE
- Dataset hermes_reasoning_tool_use: https://huggingface.co/datasets/interstellarninja/hermes_reasoning_tool_use
- Dataset hermes-function-calling-v1: https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1
- Dataset smol-smoltalk: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk

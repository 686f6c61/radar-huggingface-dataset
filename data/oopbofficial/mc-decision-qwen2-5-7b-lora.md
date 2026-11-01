# oopbofficial/mc-decision-qwen2.5-7b-lora

## Resumen

mc-decision-qwen2.5-7b-lora es un adaptador LoRA (entrenado con QLoRA) sobre Qwen2.5-7B-Instruct, publicado por el usuario oopbofficial bajo licencia Apache-2.0. Su funcion es mapear un estado de texto compacto con tematica de Minecraft y una instruccion de jugador a una decision de control de tarea (continue, pause, cancel, replace_task o clarify) y, opcionalmente, a una skill de reemplazo (follow_player, return_home, collect, craft o store_items). No es un agente jugador: es un prototipo de clasificacion de intenciones offline que no ve el juego ni ejecuta acciones.

El adaptador pesa 0,2 GB y se distribuye como pesos PEFT en safetensors, no como modelo completo. El modelo base es Qwen2.5-7B-Instruct (revision a09a35458c702b33eeacc393d103063234e8bc28), un transformer denso de 7.000 millones de parametros con contexto nativo de 32.768 tokens, aunque este adaptador se entreno y evaluo con un limite real de secuencia de 512 tokens.

Su relevancia es acotada pero clara: demuestra como un ajuste fino pequeno y barato puede imponer un contrato de salida JSON estricto y mejorar de forma medible la precision de decision frente al modelo base (de 60,33% a 91,00% en accuracy estricta sobre un test congelado de 300 ejemplos). Es un caso de estudio de clasificacion de intenciones con datos sinteticos en chino, no un modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA/QLoRA sobre transformer denso (Qwen2.5-7B-Instruct) |
| Parametros totales | 7B en el modelo base; el adaptador LoRA ocupa 0,2 GB |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (limite real de entrenamiento e inferencia); el base soporta 32.768 |
| Tipos de cuantizacion | NF4 de 4 bits (usada en evaluacion); el base admite cuantizaciones estandar |
| Idiomas soportados | chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 16 y alpha 32, con dropout 0,05, entrenado mediante QLoRA (carga del base en 4 bits NF4). La tasa de aprendizaje es 0,0001 y el limite de epocas es 2,0. La seleccion de checkpoint se hace por perdida de validacion, no sobre el test bloqueado. Es un experimento de semilla unica (semilla 42), con protocolo sin modo thinking (enable_thinking: false) y decodificacion greedy.

Los datos son sinteticos y autorales, en chino: 1.000 registros de entrenamiento, 160 de validacion y 300 de test bloqueado. El corpus de entrenamiento contiene 250 semillas de enunciado agrupadas en 25 familias de historia correlacionadas, cada una renderizada en cuatro instantaneas de estado. La validacion cubre cuatro familias y el test combina 200 variantes controladas y 100 casos desafio escritos por un agente separado. Los splits se hacen por familia antes de la expansion, aunque el autor advierte que esto no elimina toda similitud semantica entre splits. No hay anotacion humana ni trayectorias reales de Minecraft.

## Capacidades

- Clasificacion de intenciones: asigna una de cinco decisiones (continue, pause, cancel, replace_task, clarify) a partir de un estado de texto y una instruccion.
- Contrato de salida estricto: genera exactamente un objeto JSON con las claves decision y skill, con skill nulo salvo en replace_task.
- Seleccion de skill de reemplazo: follow_player, return_home, collect, craft o store_items.
- Generacion de texto conversacional heredada del base Qwen2.5-7B-Instruct.
- Capacidad multilingue limitada al chino en el dominio entrenado.
- No soporta tool calling nativo del adaptador, ni vision, ni audio, ni modo thinking.

## Casos de uso

- Clasificacion de intenciones en prototipos de agentes de juego: el adaptador traduce instrucciones de jugador en chino a decisiones de control de tarea, util para validar pipelines de decision antes de integrar un agente real.
- Enrutamiento de comandos en asistentes de Minecraft: convierte frases como pausar o recoger objetos en etiquetas estructuradas que un motor de juego podria consumir.
- Investigacion sobre contratos de salida JSON: sirve como ejemplo reproducible de como un LoRA pequeno impone un esquema estricto y eleva la validez de esquema del 77,33% al 100%.
- Evaluacion de tecnicas QLoRA: caso de referencia para medir el efecto de un ajuste fino de bajo coste sobre un base de 7B en una tarea de clasificacion acotada.
- Generacion de datos sinteticos etiquetados: el pipeline de familias de historia y variantes controladas es reutilizable para construir corpus de intenciones en otros dominios.
- Docencia y demostraciones: ejemplo didactico de adaptador PEFT con evaluacion congelada, matrices de confusion y artefactos de predicciones crudas.

## Benchmarks y rendimiento

Resultados medidos sobre un test congelado de 300 ejemplos, carga NF4 de 4 bits, decodificacion greedy y limite de salida de 96 tokens.

| Metrica | Modelo base | Adaptador |
|---|---:|---:|
| Accuracy estricta de decision | 60,33% | 91,00% |
| Accuracy conjunta decision + skill | 60,33% | 91,00% |
| Validez de esquema | 77,33% | 100,00% |
| Accuracy de skill de reemplazo | 71,67% | 86,67% |
| Macro-F1 de decision | 0,6617 | 0,9118 |
| Accuracy conjunta controlada (n=200) | 65,00% | 98,00% |
| Accuracy conjunta desafio (n=100) | 51,00% | 77,00% |

Diagnosticos secundarios post hoc:

| Diagnostico | Modelo base | Adaptador |
|---|---:|---:|
| Validez sintactica JSON cruda | 88,67% | 100,00% |
| Accuracy solo de decision | 72,00% | 91,00% |
| Accuracy conjunta extraida | 68,33% | 91,00% |

## Requisitos de hardware

- VRAM estimada: en carga NF4 de 4 bits, el base de 7B requiere aproximadamente 5-6 GB para pesos, mas overhead de activaciones y contexto; en bf16/fp16, unos 14-16 GB.
- GPU recomendadas: A100, H100 o L40S para despliegue en precision completa; RTX 4090 o RTX 3090 para bf16; RTX 3060 de 12 GB o superior para NF4.
- Cabe en GPU de consumo: si, con cuantizacion de 4 bits en tarjetas de 8-12 GB.
- Opciones de despliegue: transformers + peft (protocolo usado en la model card), vLLM o TGI con soporte de adaptadores LoRA, y llama.cpp/Ollama tras fusionar el adaptador con el base y convertir a GGUF.
- Latencia y throughput: la model card indica que la latencia registrada es especifica de la ejecucion y no constituye un benchmark de serving portable; no se publican cifras de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mc-decision-qwen2.5-7b-lora | 7B (adaptador 0,2 GB) | 512 tokens | Clasificacion de intenciones Minecraft en chino | Apache-2.0 | HuggingFace |
| Qwen2.5-7B-Instruct (base) | 7B | 32.768 tokens | Modelo generalista | Apache-2.0 | HuggingFace |
| Adaptadores de clasificacion de intenciones genericos | variable | variable | Clasificacion de intenciones de dominio general | variable | HuggingFace |

No se dispone de datos publicados que permitan comparar este adaptador con alternativas especificas de la misma tarea.

## Limitaciones y advertencias

- No es un jugador de Minecraft: no ve el juego, no ejecuta acciones y no puede verificar resultados.
- Datos 100% sinteticos y autorales, sin anotacion humana ni acuerdo entre anotadores.
- Experimento de semilla unica (42): no hay estudio de estabilidad multi-semilla.
- Las etiquetas de clarificacion implementan una politica autoral conservadora, no una interpretacion unica de la intencion humana.
- El rendimiento mide esta politica finita, no comprension general de intenciones de jugador.
- Limitado al chino; sin capacidades multilingues demostradas.
- Limite real de secuencia de 512 tokens, muy por debajo del contexto nativo del base.
- Riesgo de alucinacion fuera del dominio entrenado y de fallos de esquema en entradas atipicas.
- Sin integracion real con Minecraft ni pruebas de aceptacion en produccion.
- Licencia Apache-2.0 permite uso comercial, pero el autor no reclama rendimiento de juego ni originalidad investigadora.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/oopbofficial/mc-decision-qwen2.5-7b-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Repositorio del proyecto: https://github.com/myconstance1999-pixel/mc-decision-lab
- Dependencias de entrenamiento: https://github.com/myconstance1999-pixel/mc-decision-lab/blob/main/training/requirements-colab.txt

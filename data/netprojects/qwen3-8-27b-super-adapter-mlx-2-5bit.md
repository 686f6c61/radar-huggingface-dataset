# netprojects/Qwen3.8-27B-super-adapter-MLX-2.5bit

## Resumen

Qwen3.8-27B-super-adapter-MLX-2.5bit es una cuantización de 2,5 bits (aproximadamente 3,65 bits por peso en promedio) del modelo Qwen3.8-27B con el super-adapter de harness-hub fusionado, convertida a formato MLX para su ejecución en Apple Silicon. Lo publica el usuario netprojects y está pensada para Macs con memoria unificada limitada (24 GB o más), a costa de una fidelidad notablemente inferior respecto a bf16. El modelo base subyacente es Qwen3.8-27B (27.745.371.136 parámetros totales), y el super-adapter es una LoRA que combina tres especialistas de reinforcement learning orientados a agentes de código (pi, Hermes Agent y OpenCode).

El interés de esta ficha radica en que es una compilación de conveniencia: no añade entrenamiento propio, sino que empaqueta un adaptador de agentes de código en un formato MLX muy agresivo en compresión. Según la model card, el adaptador sin cuantizar mejora al modelo base en tareas de SWE-bench Pro y Terminal-Bench 2.1, pero esta variante de 2,5 bits retiene solo el 85,2% de coincidencia en el siguiente token respecto a bf16 y presenta una divergencia KL de 0,2433, la más alta de toda la familia de builds publicada.

La relevancia es acotada: sirve para probar flujos de agentes de código locales en equipos Apple Silicon modestos, no para producción con requisitos de fidelidad alta. Para ese fin, el propio autor recomienda la build de 6 bits.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con atención completa y linear-attention (Gated DeltaNet); incluye capa MTP (multi-token prediction); conversión con mlx-vlm; build solo texto (encoder de visión eliminado) |
| Parámetros totales | 27.745.371.136 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la información proporcionada (Hermes Agent requiere al menos 64.000 tokens de contexto) |
| Tipos de cuantización | MLX 2,5 bits: proyecciones gate y up del MLP a 2 bits, down a 3 bits, proyecciones de atención y linear-attention a 4 bits, embedding y capa de salida a 4 bits (afín, grupo 64); ~3,65 bits por peso en promedio |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (librería mlx) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3.8-27B, un transformer que combina capas de atención completa con capas de linear-attention basadas en Gated DeltaNet, e incorpora una capa MTP (multi-token prediction) que se conserva en esta conversión. La conversión a MLX se realizó con mlx-vlm y elimina el encoder de visión, por lo que el resultado es estrictamente texto. La cuantización es mixta y selectiva: las proyecciones más sensibles del MLP (gate y up) se comprimen a 2 bits, la down a 3 bits, y atención, linear-attention, embedding y capa de salida a 4 bits, con cuantización afín de grupo 64.

El super-adapter de harness-hub no entrena nada nuevo: fusiona a peso ½ cada uno de los tres especialistas de RL de pi, Hermes Agent y OpenCode (pi y Hermes Agent en el paso 160, OpenCode en el paso 150) en una única LoRA sobre Qwen3.8-27B. Los resultados publicados por harness-hub corresponden a esa LoRA sin cuantizar; esta build de 2,5 bits es una compresión posterior y, por tanto, no hereda automáticamente esas cifras. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO más allá de la mención a los especialistas de reinforcement learning.

## Capacidades

- Generación de texto conversacional y razonamiento en modo thinking (activado por defecto en la plantilla de chat) y sin thinking.
- Agente de código: resolución de tareas de reparación de bugs y edición de repositorios, con soporte para los harnesses pi, Hermes Agent y OpenCode.
- Uso de herramientas (tool calling) a través de la API compatible con OpenAI que sirve mlx-lm.
- Razonamiento multi-paso y ejecución de tareas de agente con reducción de llamadas a herramientas según los datos del adaptador original (19-48% menos con thinking on; 53-73% menos con thinking off).
- Capacidad de predicción multi-token (MTP) por la capa incluida en la conversión.
- Sin capacidades de visión: el encoder visual fue eliminado en esta build.
- Capacidades multilingües: no disponible.

## Casos de uso

- Reparación de bugs en local sobre Apple Silicon: servir el modelo con `mlx_lm.server` y conectarlo a pi u OpenCode para lanzar tareas del tipo "encuentra por qué fallan los tests y corrige el bug", aprovechando que la build cabe en 24 GB de memoria unificada.
- Pruebas de flujos de agentes de código antes de invertir en hardware: validar la integración de pi, Hermes Agent u OpenCode contra un endpoint local compatible con OpenAI sin depender de APIs de pago.
- Automatización de tareas de terminal en Macs de gama media: usar el modelo con thinking off para reducir el número de llamadas a herramientas y acelerar iteraciones cortas.
- Evaluación comparativa de cuantizaciones: emplear esta build como extremo inferior de la escala (junto a las de 3, 4, 6 y 8 bits del mismo autor) para medir el impacto de la compresión en tareas de código.
- Prototipado de asistentes conversacionales con contexto largo: Hermes Agent exige al menos 64.000 tokens de contexto, por lo que sirve para probar conversaciones multi-turno extensas en local.
- Docencia y experimentación con agentes RL-adaptados: estudiar cómo se comporta una LoRA que fusiona tres especialistas de RL bajo distintos harnesses sin necesidad de GPU dedicada.

## Benchmarks y rendimiento

Datos de la familia de builds publicados por el autor (el GSM8K se midió con 50 preguntas):

| Build | Tamaño | Mismo siguiente token que bf16 | KL vs bf16 | GSM8K (50 preguntas) | Memoria pico con prompt de 8K | Memoria de Mac sugerida |
|---|---|---|---|---|---|---|
| MLX-6bit (recomendada) | 23,1 GB | 99,5% | 0,0014 | 45/50 | 23,4 GB | 36 GB+ |
| MLX-8bit | 30,0 GB | 99,6% | 0,0005 | 45/50 | 29,7 GB | 48 GB+ |
| MLX-4bit | 16,3 GB | 96,2% | 0,0194 | 45/50 | 17,1 GB | 32 GB+ |
| MLX-3bit | 13,8 GB | 92,2% | 0,0885 | 46/50 | 14,6 GB | 24 GB+ |
| MLX-2.5bit (esta build) | 11,8 GB | 85,2% | 0,2433 | 41/50 | 13,8 GB | 24 GB+ |
| bf16 de referencia (no publicado) | 55,6 GB | referencia | referencia | 45/50 | 53,4 GB | 96 GB+ |

Resultados del adaptador original sin cuantizar, publicados por harness-hub (SWE-bench Pro hard 51 y Terminal-Bench 2.1):

| Configuración | Métrica | Base | Super-adapter |
|---|---|---|---|
| Thinking on | pass@1 medio | 55,5% | 63,5% |
| Thinking on | SWE-bench Pro bajo OpenCode | 47,1% | 66,7% |
| Thinking on | SWE-bench Pro bajo Hermes Agent | 45,1% | 60,8% |
| Thinking off | pass@1 medio | 39,5% | 49,0% |

No se han publicado resultados de benchmarks específicos para esta build de 2,5 bits más allá de la tabla de fidelidad y GSM8K anterior.

## Requisitos de hardware

- Memoria pico medida: 13,8 GB con un prompt de 8.000 tokens; el autor sugiere un Mac con 24 GB o más de memoria unificada.
- Tamaño en disco: 11,8 GB.
- Cabe en Macs Apple Silicon de 24 GB (M-series base y superiores); no está pensada para GPU NVIDIA ni CUDA.
- Despliegue mediante `mlx-lm>=0.32.2` con `mlx_lm.server` (API compatible con OpenAI) o desde Python con `mlx_lm.load` y `generate`.
- Integración con pi (Node.js 22.19 o superior), Hermes Agent (requiere al menos 64.000 tokens de contexto) y OpenCode 2.2.7.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Tamaño | Contexto | Fidelidad vs bf16 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.8-27B-super-adapter-MLX-2.5bit | 27,7B | 11,8 GB | no disponible | 85,2% mismo token; KL 0,2433 | Apache 2.0 | Hugging Face (netprojects) |
| Qwen3.8-27B-super-adapter-MLX-6bit | 27,7B | 23,1 GB | no disponible | 99,5% mismo token; KL 0,0014 | Apache 2.0 | Hugging Face (netprojects) |
| Qwen3.8-27B-super-adapter-MLX-4bit | 27,7B | 16,3 GB | no disponible | 96,2% mismo token; KL 0,0194 | Apache 2.0 | Hugging Face (netprojects) |
| Qwen3.8-27B-pi-adapted-MLX-6bit | 27,7B | no disponible | no disponible | no disponible | Apache 2.0 | Hugging Face (netprojects) |

Frente a las builds de 4 y 6 bits del mismo autor, esta variante gana 4,5 GB y 11,3 GB de tamaño respectivamente, pero pierde entre 11 y 14,3 puntos de coincidencia en el siguiente token y multiplica por 12,5 y 174 la divergencia KL. Frente al especialista único de pi en 6 bits, esta build ofrece el super-adapter combinado a costa de mayor compresión.

## Limitaciones y advertencias

- La fidelidad respecto a bf16 es la más baja de la familia: 85,2% de coincidencia en el siguiente token y KL de 0,2433, lo que se traduce en degradación perceptible en generación libre y en tareas de código.
- GSM8K cae a 41/50 frente a 45/50 de las builds de 4, 6 y 8 bits, lo que sugiere pérdida de precisión aritmética.
- Los resultados de SWE-bench Pro y Terminal-Bench citados corresponden al adaptador sin cuantizar, no a esta build; no deben atribuirse a la versión de 2,5 bits.
- Build solo texto: no procesa imágenes.
- Idiomas soportados no documentados; no se garantiza un comportamiento correcto fuera del inglés.
- Riesgo de alucinación y de tool calls mal formados mayor que en cuantizaciones superiores, especialmente con thinking off.
- Exclusiva para Apple Silicon con MLX; no es desplegable en vLLM, TGI, llama.cpp ni Ollama con este formato.
- Licencia Apache 2.0 permite uso comercial, pero el autor recomienda la build de 6 bits para cualquier uso serio; esta variante está pensada para pruebas en memoria limitada.
- No se documentan sesgos específicos ni composición del dataset de entrenamiento del adaptador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/Qwen3.8-27B-super-adapter-MLX-2.5bit
- Modelo base del adaptador: https://huggingface.co/harness-hub/Qwen3.8-27B-super-adapter
- Modelo Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Build recomendada de 6 bits: https://huggingface.co/netprojects/Qwen3.8-27B-super-adapter-MLX-6bit
- Build de 8 bits: https://huggingface.co/netprojects/Qwen3.8-27B-super-adapter-MLX-8bit
- Build de 4 bits: https://huggingface.co/netprojects/Qwen3.8-27B-super-adapter-MLX-4bit
- Build de 3 bits: https://huggingface.co/netprojects/Qwen3.8-27B-super-adapter-MLX-3bit
- Especialista pi en MLX 6 bits: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-6bit
- Especialista Hermes Agent en MLX 6 bits: https://huggingface.co/netprojects/Qwen3.8-27B-hermes-adapted-MLX-6bit
- Especialista OpenCode en MLX 6 bits: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-6bit
- Repositorio de pi: https://github.com/earendil-works/pi
- Repositorio de Hermes Agent: https://github.com/NousResearch/hermes-agent
- OpenCode: https://opencode.ai/

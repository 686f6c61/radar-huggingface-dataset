# kingjones777/Mellum2-12B-A2.5B-Thinking-ROCmFPX-Q8_0-GGUF

## Resumen

Mellum2-12B-A2.5B-Thinking-ROCmFPX-Q8_0-GGUF es una cuantización de 8 bits en formato GGUF del modelo JetBrains/Mellum2-12B-A2.5B-Thinking, realizada por el usuario kingjones777. Está específicamente optimizada para la APU AMD Ryzen AI MAX+ 395 (gfx1151, Strix Halo) mediante los tipos de cuantización ROCmFPX, que requieren un fork de llama.cpp con soporte para estos formatos. El modelo base es un MoE de 12.15B parámetros totales con 2.5B activos, entrenado por JetBrains para razonamiento aumentado y generación de código.

Esta cuantización permite ejecutar el modelo en hardware AMD de última generación con un rendimiento de 75.72 tokens por segundo en decodificación, según las mediciones del autor. El archivo pesa 11.70 GiB con 8.27 bits por peso, y se deriva de una fuente BF16 GGUF sin pérdidas, verificada byte a byte contra el blob original. Es relevante porque acerca un modelo de razonamiento de código de nivel medio a hardware de consumo AMD, aunque con limitaciones importantes de compatibilidad de software.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) con 64 expertos, 8 activos por token; atención híbrida (sliding-window + full attention) |
| Parametros totales | 12.149.923.072 (12.15B) |
| Parametros activos | 2.5B (según denominación del modelo) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | Q8_0_ROCMFPX (8-bit, ftype 111); también existen variantes 4-bit COHERENT (ftype 102) y 8-bit AGENT (ftype 115) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF con tipos ROCmFPX (no compatible con llama.cpp estándar) |

## Arquitectura y entrenamiento

El modelo base Mellum2-12B-A2.5B-Thinking emplea una arquitectura MoE con 64 expertos y 8 activos por token, combinando capas de atención con ventana deslizante y atención completa. Fue producido a partir de Mellum2-12B-A2.5B-Base mediante supervisión fina (SFT) y post-entrenamiento orientado a razonamiento, lo que le confiere un modo de pensamiento explícito. La cuantización ROCmFPX no altera la arquitectura, solo los pesos, y se realizó desde una fuente BF16 GGUF sin pérdidas, verificada contra el blob original. El autor no ha publicado detalles sobre el dataset de entrenamiento ni sobre técnicas como RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento multi-paso con modo de pensamiento explícito (thinking mode), aunque el presupuesto de tokens de pensamiento puede agotar la ventana si se configura mal.
- Generación y completado de código, con soporte para tareas de code completion según las etiquetas del modelo.
- Razonamiento matemático básico: el autor verificó operaciones como 17×23=391 y preguntas factuales (capital de Japón, días en 2024).
- Capacidad multilingüe limitada: solo se declara inglés.
- No se ha evaluado el soporte de tool calling ni de agentes multi-paso en esta cuantización.
- No se ha probado el rendimiento en contextos largos (más allá de la ventana declarada).

## Casos de uso

- Inferencia local en APU AMD Ryzen AI MAX+ 395: el caso principal es ejecutar el modelo en un equipo con esta APU, aprovechando la memoria unificada y el soporte ROCmFPX para obtener ~75 tok/s en decodificación.
- Asistente de programación offline: el modelo puede completar código y razonar sobre problemas de desarrollo en un entorno sin conexión, gracias a su entrenamiento específico en código.
- Prototipado de aplicaciones de razonamiento: su modo de pensamiento explícito permite experimentar con cadenas de razonamiento en tareas de lógica o matemáticas, siempre que se ajuste el presupuesto de tokens.
- Evaluación de cuantizaciones alternativas: al existir variantes de 4 y 8 bits, se puede comparar el rendimiento y la calidad en el mismo hardware para decidir el mejor equilibrio.
- Desarrollo de herramientas de generación de código para AMD: integración en entornos de desarrollo que requieran inferencia local sin depender de GPUs NVIDIA.
- Investigación sobre formatos de cuantización ROCmFPX: sirve como caso de estudio para medir el impacto de estos formatos en modelos MoE con y sin cabezal MTP.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor solo reporta pruebas de corrección puntuales (17×23=391, capital de Japón=Tokyo, días en 2024) y mediciones de velocidad de decodificación en una única máquina (Ryzen AI MAX+ 395, ROCm 7.2.4):

| Variante | ftype | Tamaño | bpw | Decode (mediana) |
|---|---|---|---|---|
| 4-bit COHERENT | 102 | 6.49 GiB | 4.59 | 104.99 tok/s |
| 8-bit AGENT | 115 | 11.88 GiB | 8.39 | 74.41 tok/s |
| 8-bit plain | 111 | 11.70 GiB | 8.27 | 75.72 tok/s |

No se realizaron pruebas de perplexity, ni comparaciones de calidad contra el modelo fuente, ni evaluaciones de contexto largo o tool calling.

## Requisitos de hardware

- APU AMD Ryzen AI MAX+ 395 (gfx1151, Strix Halo) con ROCm 7.2.4 o superior.
- Memoria unificada: el archivo de 11.70 GiB requiere al menos 16 GiB de RAM/VRAM disponible; se recomienda 32 GiB para margen.
- Software: fork de llama.cpp del repositorio charlie12345/ROCmFPX; el llama.cpp estándar no cargará el modelo (error `invalid ggml type 103`).
- No es compatible con GPUs NVIDIA ni con otras arquitecturas AMD sin soporte gfx1151.
- Rendimiento medido: 75.72 tok/s en decodificación con la variante de 8 bits; la variante de 4 bits alcanza 104.99 tok/s.
- Opciones de despliegue: exclusivamente mediante el fork ROCmFPX de llama.cpp; no hay soporte para vLLM, Ollama ni TGI en esta cuantización.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Mellum2-12B-A2.5B-Thinking (base) | 12.15B | 2.5B | 131.072 | Apache-2.0 | BF16 / safetensors |
| Esta cuantización ROCmFPX | 12.15B | 2.5B | 131.072 | Apache-2.0 | GGUF (ROCmFPX) |
| Qwen3-30B-A3B (referencia MoE similar) | 30B | 3B | 131.072 | Apache-2.0 | GGUF / safetensors |

No se dispone de datos de rendimiento comparativos entre estos modelos en la información proporcionada. La comparación se limita a parámetros y disponibilidad. El modelo base de JetBrains está disponible en HuggingFace y ModelScope; la cuantización solo existe para hardware AMD específico.

## Limitaciones y advertencias

- Requiere un fork no oficial de llama.cpp (ROCmFPX) y hardware AMD gfx1151; no funciona con el llama.cpp estándar ni con otras GPUs.
- No se han realizado pruebas de calidad exhaustivas (perplexity, benchmarks estándar, contexto largo, tool calling); las verificaciones son solo de hechos memorizados.
- El modo de pensamiento puede consumir todo el presupuesto de tokens y devolver contenido vacío si se configura un límite demasiado pequeño (advertencia del autor).
- La variante 8-bit AGENT no ofrece ventaja sobre la plain en este modelo porque Mellum2 no tiene cabezal MTP, según el autor.
- Solo soporta inglés; no hay garantía de rendimiento en otros idiomas.
- Licencia Apache-2.0 permite uso comercial, pero el software necesario (fork ROCmFPX) puede tener restricciones adicionales no documentadas.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que no ha sido validado por la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/kingjones777/Mellum2-12B-A2.5B-Thinking-ROCmFPX-Q8_0-GGUF
- Variante 4-bit: https://huggingface.co/kingjones777/Mellum2-12B-A2.5B-Thinking-ROCmFP4-GGUF
- Variante 8-bit AGENT: https://huggingface.co/kingjones777/Mellum2-12B-A2.5B-Thinking-ROCmFPX-Q8_0-AGENT-GGUF
- Modelo base: https://huggingface.co/JetBrains/Mellum2-12B-A2.5B-Thinking
- ModelScope del modelo base: https://www.modelscope.cn/models/JetBrains/Mellum2-12B-A2.5B-Thinking
- Fork ROCmFPX de llama.cpp: https://github.com/charlie12345/ROCmFPX
- PR de integración de Mellum en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/23966
- Scripts de conversión y evaluación (para la variante Instruct): https://github.com/altibola/Mellum2-12B-A2.5B-Instruct-GGUF
- Receta vLLM para el modelo base: https://github.com/vraoresearch/vllm-recipes/blob/main/models/JetBrains/Mellum2-12B-A2.5B-Thinking.yaml

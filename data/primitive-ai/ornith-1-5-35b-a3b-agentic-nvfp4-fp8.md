# primitive-ai/Ornith-1.5-35B-A3B-agentic-NVFP4-FP8

## Resumen

Ornith-1.5-35B-A3B-agentic-NVFP4-FP8 es una cuantización mixta de precisión del modelo base ornith-ai/Ornith-1.5-35B-A3B, publicada por primitive-ai. Se trata de una variante específicamente calibrada para tareas de tool calling y uso agéntico, que mantiene la precisión del modelo en BF16 en dichas tareas (75.1 en la suite de tool calling) reduciendo el tamaño a 22.6 GiB, aproximadamente un tercio del original. El modelo base es un MoE con arquitectura qwen3_5_moe, 19.8 mil millones de parámetros totales (según safetensors) y 3 mil millones activos, con capacidades multimodales (imagen-texto a texto) y un bloque MTP (Multi-Token Prediction) preservado para decodificación especulativa.

La relevancia de esta versión radica en que ofrece una alternativa de bajo coste de inferencia para sistemas agénticos en producción, con una estabilidad run-to-run notablemente superior a la del build general de la misma familia (desviación típica de 1.1 frente a 3.1). Está diseñada para ejecutarse en hardware Blackwell con soporte nativo NVFP4/FP8 y también en Ampere mediante la ruta weight-only Marlin. La licencia MIT permite uso comercial sin restricciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) basada en qwen3_5_moe, con visión (image-text-to-text) |
| Parametros totales | 19.845.695.344 (según safetensors; el nombre comercial indica 35B) |
| Parametros activos | 3B (según la nomenclatura A3B) |
| Longitud de contexto | 32.768 tokens (según el comando de ejemplo de vLLM) |
| Tipos de cuantizacion | NVFP4 (expertos enrutados, group 16), FP8 E4M3 (atención y proyecciones), BF16 (lm_head, embeddings, vision tower, MTP, router gates, norms) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors con compressed-tensors |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-35B-A3B es un transformer MoE con 40 capas, donde cada capa tiene expertos enrutados (gate/up/down projections) y un experto compartido. Incluye atención lineal (linear_attn) además de atención softmax estándar, y un bloque MTP (Multi-Token Prediction) integrado en el checkpoint que permite decodificación especulativa. La variante aquí descrita es una cuantización post-entrenamiento, no un modelo entrenado desde cero. primitive-ai aplicó GPTQ con un conjunto de calibración específico de tool-call y trayectorias agénticas, disjunto del conjunto de evaluación, para elegir el redondeo de cada tensor. Los expertos enrutados se cuantizan a NVFP4 con grupo de 16, las proyecciones de atención y del experto compartido a FP8 E4M3, y los componentes críticos (lm_head, embeddings, vision tower, MTP, router gates y norms) se mantienen en BF16. Esta configuración mixta permite cargar el modelo en vLLM estándar sin modificaciones, con soporte nativo en Blackwell y ruta Marlin en Ampere.

## Capacidades

- Tool calling y function calling: calibrado específicamente para invocar herramientas con precisión, igualando al BF16 de referencia (75.1 en la suite de tool calling).
- Uso agéntico: diseñado para agentes que requieren múltiples pasos de razonamiento y llamadas a herramientas, con mayor estabilidad entre ejecuciones que el build general.
- Razonamiento con modo thinking: el modelo base soporta un modo de pensamiento explícito, y la cuantización lo preserva (se fuerza en las evaluaciones).
- Capacidades multimodales: pipeline image-text-to-text, con vision tower en BF16, lo que permite procesar imágenes junto con texto.
- Decodificación especulativa: el bloque MTP completo (785 tensores) se conserva, habilitando aceleración de inferencia en vLLM.
- Generación de texto y conocimiento general: mantiene 90.9 en la suite de conocimiento, ligeramente por debajo del build general (91.7).
- Multilingüe: no confirmado en la información disponible.

## Casos de uso

- Agentes autónomos con llamada a herramientas: el modelo puede gestionar flujos agénticos complejos donde debe decidir cuándo invocar una API, cuándo abstenerse y cómo encadenar llamadas. Su calibración específica y su baja varianza entre ejecuciones lo hacen adecuado para sistemas de producción donde la reproducibilidad importa.
- Atención al cliente automatizada: con 32K tokens de contexto, puede mantener conversaciones multi-turno extensas, consultar bases de conocimiento externas mediante tool calling y derivar tickets a sistemas humanos cuando corresponde. El modo abstain (60.0 en la suite) reduce invocaciones innecesarias.
- Asistentes de código con integración de herramientas: puede generar, revisar y modificar código, invocando compiladores, linters o repositorios remotos a través de function calling. Su tamaño reducido permite desplegarlo en entornos con VRAM limitada.
- Análisis de documentos con imágenes: al ser multimodal, puede procesar capturas de pantalla, diagramas o formularios escaneados y extraer información estructurada, combinando visión con razonamiento textual.
- RAG agéntico: puede orquestar pipelines de recuperación aumentada donde decide qué consultas lanzar a un buscador, cómo reformularlas y cómo sintetizar la respuesta final, con control fino sobre el uso de herramientas.
- Automatización de procesos empresariales: integrable en flujos de trabajo que requieren interacción con múltiples APIs (CRM, ERP, calendarios), donde la precisión en la elección de herramientas y la estabilidad entre ejecuciones son críticas.

## Benchmarks y rendimiento

La model card reporta resultados de 1.370 ítems en 14 benchmarks públicos: una suite de conocimiento de 1.170 ítems sobre 9 benchmarks y una suite de tool calling de 200 ítems sobre 5 benchmarks (BFCL v4, xLAM/APIGen, ToolACE, Glaive v2, nvidia When2Call). Protocolo fijo: temperatura 0.6, top_p 0.95, top_k 20, thinking forzado, presupuesto de 16.384 tokens, concurrencia 32, en una RTX PRO 6000 Blackwell.

| build | tamaño | tool calling | knowledge | pooled |
|---|---|---|---|---|
| BF16 reference | 67.0 G | 75.1 ± 0.7 (n=4) | 92.0 | 89.5 |
| ornith-ai FP8 | 36.7 G | 74.9 ± 0.8 (n=4) | 91.2 | 89.0 |
| **este repo** | **22.6 G** | **75.1 ± 0.6 (n=4)** | 90.9 (n=3) | 88.6 |
| ornith-ai NVFP4 | 21.8 G | 73.1 ± 0.6 (n=4) | 90.9 | 88.3 |
| build general (primitive-ai) | 22.6 G | 71.8 ± 1.3 (n=6) | 91.7 | 88.6 |

En la sub-suite de 40 ítems donde la acción correcta es no llamar a ninguna herramienta, este build obtiene 60.0 de abstain frente a 55.0 del build general. La model card advierte que diferencias inferiores a 2 puntos no son significativas dado el spread run-to-run de los builds cuantizados.

## Requisitos de hardware

- Tamaño del checkpoint: 22.6 GiB, lo que permite inferencia en GPUs consumer con 24 GB de VRAM, como la RTX 4090 o RTX 5090, dejando margen para KV cache y overhead.
- GPUs verificadas: Blackwell (nativo NVFP4/FP8) y Ampere (A100, vía ruta weight-only Marlin). También debería funcionar en Ada Lovelace con soporte FP8, aunque no está explícitamente verificado.
- VRAM estimada: con cuantización NVFP4/FP8, el modelo cabe en 24 GB; para contexto completo de 32K tokens se recomienda al menos 32 GB si se usa decodificación especulativa.
- Opciones de despliegue: vLLM (comando oficial: `vllm serve primitive-ai/Ornith-1.5-35B-A3B-agentic-NVFP4-FP8 --max-model-len 32768`), compatible con compressed-tensors. También puede usarse con llama.cpp u Ollama si se convierten los pesos, aunque no está documentado.
- Latencia y throughput: no se proporcionan cifras concretas. El bloque MTP preservado permite decodificación especulativa, que típicamente acelera la generación entre 1.5× y 2× en vLLM.

## Comparativa con modelos similares

La comparativa más directa es con las variantes del mismo modelo base, ya que comparten arquitectura y solo difieren en cuantización y calibración:

| Modelo | Tamaño | Tool calling | Knowledge | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **Este repo (agentic NVFP4/FP8)** | 22.6 G | 75.1 | 90.9 | MIT | HuggingFace |
| Build general (mixed NVFP4/FP8) | 22.6 G | 71.8 | 91.7 | MIT | HuggingFace |
| ornith-ai FP8 | 36.7 G | 74.9 | 91.2 | MIT | HuggingFace |
| ornith-ai NVFP4 | 21.8 G | 73.1 | 90.9 | MIT | HuggingFace |
| BF16 reference | 67.0 G | 75.1 | 92.0 | MIT | HuggingFace |

Frente a otros MoE de tamaño similar (por ejemplo, Qwen3-30B-A3B o DeepSeek-V3-Lite), no se dispone de datos comparativos en la información proporcionada. La ventaja principal de este build es su equilibrio entre tamaño reducido y precisión en tool calling, con una estabilidad entre ejecuciones que lo hace fiable para agentes.

## Limitaciones y advertencias

- Pérdida de conocimiento general: sacrifica 0.8 puntos frente al build general (90.9 vs 91.7) y 1.1 frente al BF16 (92.0). No es adecuado si la prioridad es responder preguntas de conocimiento general.
- Variabilidad run-to-run: aunque este build es más estable (sd 1.1), sigue siendo superior a la del BF16 (sd 1.4 en tool calling). En producción, se recomienda fijar semilla y evaluar con múltiples ejecuciones.
- Sesgos y alucinaciones: no se han publicado evaluaciones específicas de sesgos o toxicidad. Como todo LLM, puede generar contenido falso o tendencioso; se recomienda validación humana en dominios sensibles.
- Idiomas: no se ha confirmado el soporte multilingüe. El modelo base probablemente hereda capacidades de Qwen, pero no hay datos.
- Contexto limitado a 32K tokens: aunque es suficiente para la mayoría de casos agénticos, no compite con modelos de contexto largo (128K+). Para documentos muy extensos, puede ser insuficiente.
- Requisito de hardware específico: el formato NVFP4 requiere GPUs Blackwell para máximo rendimiento; en Ampere se usa la ruta Marlin weight-only, que puede tener menor throughput.
- Calibración específica: al estar calibrado para tool calling, puede ser más conservador a la hora de invocar herramientas (mejor abstain, pero menos agresivo en llamadas), lo que podría no ser óptimo para casos de uso que requieran invocaciones frecuentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/primitive-ai/Ornith-1.5-35B-A3B-agentic-NVFP4-FP8
- Build general (mixed NVFP4/FP8): https://huggingface.co/primitive-ai/Ornith-1.5-35B-A3B-mixed-NVFP4-FP8
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Blog de Ornith sobre Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Perfil en BenchLM: https://benchlm.ai/models/ornith-1-5-35b-a3b
- Análisis de despliegue local en MindStudio: https://www.mindstudio.ai/blog/ornith-1-5-35b-a3b-local-run
- Web de primitive: https://primitive.com

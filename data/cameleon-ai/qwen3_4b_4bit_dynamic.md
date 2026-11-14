# cameleon-ai/qwen3_4b_4bit_dynamic

## Resumen

cameleon-ai/qwen3_4b_4bit_dynamic es una exportación del modelo Qwen/Qwen3-4B del equipo Qwen (Alibaba Cloud) al formato Core AI de Apple, con los pesos cuantizados a 4 bits. No se ha reentrenado ni ajustado nada: se trata de una conversión de formato más una compresión de pesos, manteniendo el tokenizador y la plantilla de chat originales. El resultado es un bundle `.aimodel` que un runtime Core AI puede cargar directamente en el ecosistema Apple.

El modelo base es un transformer denso de 4.000 millones de parámetros con una ventana de contexto de 40.960 tokens, capaz de razonar antes de responder (modo thinking) y de desactivar ese razonamiento mediante la plantilla de chat. Esta exportación concreta está pensada para ejecución local en dispositivos Apple a través del paquete Swift coreai-models y FoundationModels, lo que la sitúa en el nicho de inferencia on-device más que en el de servidores GPU.

Su relevancia es acotada pero clara: permite usar un modelo de 4B con contexto largo en aplicaciones macOS/iOS sin depender de infraestructura externa, con un tamaño de repositorio de 2,3 GB que cabe en memoria unificada de equipos consumer. La licencia Apache-2.0 del original se mantiene, lo que facilita el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), exportado a formato Core AI (`.aimodel`) |
| Parametros totales | 4.000 millones (modelo base Qwen3-4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 40.960 tokens |
| Tipos de cuantizacion | 4 bits (preset macOS, pesos dinámicos); no se documentan otros formatos en esta exportación |
| Idiomas soportados | no disponible (la model card no enumera idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | Core AI LLM bundle (`.aimodel`), con `metadata.json` y `tokenizer/`; no incluye safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-4B: un transformer denso con atención estándar y 40.960 tokens de contexto, entrenado por el equipo Qwen. Esta ficha no dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del modelo original; esa información debe consultarse en la model card de Qwen/Qwen3-4B. Lo único documentado aquí es el proceso de exportación: conversión mediante `coreai.llm.export Qwen/Qwen3-4B` de apple/coreai-models (coreai-core 1.0.0b3) el 2026-10-08, con cuantización de pesos a 4 bits y formas dinámicas.

La innovación técnica de esta variante no está en el entrenamiento sino en el empaquetado: el bundle incluye `metadata.json` (con el tipo `llm`, el asset a cargar y la longitud de contexto), el modelo compilado y el tokenizador con su plantilla de chat. Esa plantilla permite controlar el nivel de razonamiento; con `ContextOptions(reasoningLevel: .custom("none"))` se desactiva el modo thinking de Qwen3. No se documentan técnicas como decodificación especulativa o atención lineal en esta exportación.

## Capacidades

- Generación de texto y razonamiento: el modelo base Qwen3-4B razona antes de responder por defecto, comportamiento que puede desactivarse vía plantilla de chat.
- Razonamiento multi-paso en modo thinking, útil para problemas que requieren descomposición.
- Generación de código y matemáticas: capacidades heredadas del modelo base, aunque no se aportan métricas en esta ficha.
- Conversación multi-turno a través de `LanguageModelSession` de FoundationModels, con instrucciones de sistema.
- Contexto largo de 40.960 tokens, adecuado para documentos extensos o historiales de conversación amplios.
- Integración con el ecosistema Apple: API Swift (`CoreAILanguageModels`), ejecución local sin red.
- Capacidades multilingües: no disponibles en la documentación de esta exportación.
- Tool calling, function calling, agentes y visión: no documentados en la información disponible para esta variante.

## Casos de uso

- Asistentes integrados en apps macOS/iOS: cargar el bundle con `CoreAILanguageModel(resourcesAt:)` y crear una `LanguageModelSession` con instrucciones de sistema permite ofrecer un asistente local sin llamadas a servidores externos, con los 40.960 tokens de contexto para mantener historiales largos.
- Procesamiento de documentos en local: resumir o extraer información de contratos, informes o artículos que quepan en la ventana de contexto, sin enviar datos sensibles fuera del dispositivo, algo relevante en entornos con requisitos de privacidad.
- Prototipado rápido en Swift: desarrolladores que ya usan FoundationModels pueden sustituir el modelo del sistema por este bundle para experimentar con un modelo de 4B y comparar comportamientos sin montar infraestructura de inferencia.
- Funciones de razonamiento bajo demanda: activar el modo thinking para tareas de análisis (clasificación compleja, planificación) y desactivarlo con `reasoningLevel: .custom("none")` para respuestas rápidas y directas en tareas simples.
- Herramientas internas de soporte al desarrollo: generación y explicación de fragmentos de código dentro de un IDE o utilidad de escritorio, aprovechando que el modelo corre en el propio Mac.
- Demos y evaluación de modelos on-device: investigadores que quieran medir latencia y calidad de un 4B cuantizado a 4 bits en hardware Apple antes de decidir si lo integran en un producto.
- Aplicaciones educativas o de accesibilidad offline: tutores o asistentes que deben funcionar sin conectividad, con el modelo residente en disco (2,3 GB).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de esta exportación no incluye métricas de MMLU, HumanEval, GSM8K ni similares, y remite a la model card de Qwen/Qwen3-4B para la evaluación del modelo original. Tampoco se documentan latencia ni throughput de esta variante cuantizada.

## Requisitos de hardware

- VRAM/memoria: el repositorio ocupa 2,3 GB; en Apple Silicon se carga en memoria unificada, por lo que se necesita al menos ese espacio más el overhead del runtime y del contexto (que crece con la longitud de la ventana utilizada).
- Hardware objetivo: equipos Apple con Core AI y el paquete Swift coreai-models; no está pensado para GPU NVIDIA.
- GPU consumer: no aplica en el sentido habitual (RTX 4090, etc.); el equivalente es memoria unificada de Mac con Apple Silicon. No se especifican modelos mínimos de chip en la documentación.
- Despliegue: runtime Core AI mediante `CoreAILanguageModel` y `LanguageModelSession` de FoundationModels. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en esta exportación, dado el formato `.aimodel`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| cameleon-ai/qwen3_4b_4bit_dynamic | 4B | 40.960 | Core AI `.aimodel` 4 bits | Apache-2.0 | Exportación on-device para Apple; sin benchmarks publicados |
| Qwen/Qwen3-4B | 4B | 40.960 | safetensors | Apache-2.0 | Modelo original; referencia para evaluación y para otras cuantizaciones |
| Otras cuantizaciones de Qwen3-4B (GGUF, etc.) | 4B | 40.960 | GGUF y otros | Apache-2.0 | Ejecutables en llama.cpp/Ollama; no disponibles en la información proporcionada como comparación concreta |

La comparación relevante es contra el propio Qwen3-4B original: misma arquitectura, mismos parámetros y mismo contexto, con la diferencia de formato (Core AI frente a safetensors) y de compresión (4 bits). No se dispone de datos de rendimiento de esta variante que permitan cuantificar la pérdida por cuantización.

## Limitaciones y advertencias

- Sin benchmarks publicados: no hay evidencia en esta ficha sobre la degradación de calidad introducida por la cuantización a 4 bits; conviene evaluarla en la tarea concreta antes de producción.
- Ecosistema restringido: el formato `.aimodel` solo se carga con el runtime Core AI de Apple; no es portable a servidores Linux con GPU ni a pipelines habituales de inferencia.
- Idiomas no documentados: la model card no enumera los idiomas soportados, por lo que el comportamiento multilingüe debe validarse empíricamente.
- Riesgo de alucinación: inherente al modelo base Qwen3-4B; no se documentan mitigaciones específicas en esta exportación.
- Sesgos: no se aporta información sobre sesgos conocidos en la documentación disponible.
- Modo thinking por defecto: Qwen3 razona antes de responder salvo que se desactive explícitamente; esto incrementa la latencia y el consumo de tokens si no se configura `reasoningLevel`.
- Licencia: Apache-2.0 permite uso comercial, pero debe conservarse la atribución al equipo Qwen y a la conversión realizada por cameleon-ai.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día; no hay historial de uso que respalde su fiabilidad.
- Fecha de exportación: generado con coreai-core 1.0.0b3, una versión beta; posibles incompatibilidades con versiones futuras del runtime.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/cameleon-ai/qwen3_4b_4bit_dynamic
- Modelo original Qwen/Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Repositorio apple/coreai-models: https://github.com/apple/coreai-models

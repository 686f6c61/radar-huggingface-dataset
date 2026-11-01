# grabbou/qwen3-0.6b-CoreAI

## Resumen

`grabbou/qwen3-0.6b-CoreAI` es una exportación del modelo Qwen3-0.6B de Alibaba al formato Core AI de Apple para su ejecución en dispositivos iOS. No se trata de un modelo entrenado desde cero, sino de un artefacto derivado que convierte los pesos originales de Qwen3-0.6B (un transformer denso de 0,6 mil millones de parámetros) a un formato optimizado para el motor de inferencia on-device de Apple, con cuantización mixta de 4 y 8 bits mediante palettization.

El modelo resuelve el problema de ejecutar un LLM generativo en un iPhone sin conexión a red ni servidores externos, aprovechando el framework Foundation Models de iOS 27 y la librería `coreai-models` de Apple. Está pensado para desarrolladores de aplicaciones móviles, en particular del ecosistema React Native, que quieran integrar generación de texto local mediante el paquete `@react-native-ai/core-ai`.

La relevancia de esta ficha radica en que documenta un caso concreto de despliegue edge de un modelo open source con licencia Apache-2.0, con un contexto estático limitado a 4096 tokens y un tamaño de artefacto de 440 MB, lo que lo hace viable en dispositivos Apple modernos pero con restricciones claras de memoria y longitud de contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), exportado a formato Core AI (`.aimodel`) |
| Parametros totales | 0,6 mil millones (modelo base Qwen3-0.6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (estática, fijada en la exportación) |
| Tipos de cuantizacion | Palettization mixta 4-bit y 8-bit |
| Idiomas soportados | no disponible (no declarados en la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.aimodel` (Core AI), más `metadata.json` y tokenizer en la carpeta `ios/` |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-0.6B, un transformer denso desarrollado por el equipo Qwen de Alibaba, descrito en el Qwen3 Technical Report (arXiv:2505.09388). La model card de esta exportación no aporta detalles sobre el dataset de entrenamiento, el número de tokens vistos ni si se aplicaron técnicas de RLHF o DPO; esa información corresponde al modelo base original y no se reproduce aquí.

La innovación técnica de esta ficha no está en el entrenamiento sino en la exportación: se ha utilizado la receta `coreai.llm.export qwen3-0.6b --platform iOS` del repositorio `apple/coreai-models` para generar un artefacto `.aimodel` con palettization mixta de 4 y 8 bits y contexto estático de 4096 tokens. El artefacto resultante (440 MB) se ejecuta a través de `LanguageModelSession` del framework Foundation Models de iOS 27, con el producto `CoreAILM` de `coreai-models`. Según la model card, la exportación es idéntica a la del repositorio `mlboydaisuke/qwen3-0.6b-CoreAI-official` en el commit `7406ece`, y se fija esa versión concreta porque los artefactos Core AI dependen del sistema operativo y del toolchain que los produjo.

## Capacidades

- Generación de texto autoregresiva, heredada de Qwen3-0.6B.
- Modo de razonamiento (thinking) activado por defecto: Qwen3 "piensa" antes de responder salvo que se desactive explícitamente con `reasoning: 'none'`.
- Ejecución completamente on-device en iOS, sin necesidad de conectividad de red.
- Integración con React Native mediante `@react-native-ai/core-ai` y el SDK `ai` (función `generateText`).
- Soporte de instrucciones y prompts de sistema a través de la API `LanguageModelSession`.
- No se declaran capacidades de tool calling, agentes multi-paso, visión, audio ni multilingüismo explícito en la información disponible.

## Casos de uso

- Asistentes de texto offline en aplicaciones iOS: el modelo se carga desde un fichero local y genera respuestas sin conexión, adecuado para apps de notas, diarios o productividad que requieran privacidad total de los datos del usuario.
- Autocompletado y sugerencias en editores móviles: con 4096 tokens de contexto estático, puede mantener el hilo de un documento corto o de una conversación breve y sugerir continuaciones en tiempo real.
- Chatbots embebidos en apps React Native: mediante `@react-native-ai/core-ai` y `generateText`, se integra un asistente conversacional en la interfaz sin backend, útil para demos, prototipos y apps de nicho sin infraestructura cloud.
- Clasificación y reescritura de texto local: tareas de resumen, reformulación o extracción de entidades sobre textos cortos que quepan en el contexto de 4096 tokens, ejecutadas íntegramente en el dispositivo.
- Procesamiento de lenguaje natural en entornos sin red: aplicaciones de campo, viajes o zonas con conectividad limitada donde se necesita generación de texto y no se puede depender de una API remota.
- Pruebas y validación de pipelines edge: desarrolladores que evalúan el rendimiento de Core AI y Foundation Models con un modelo pequeño y de licencia permisiva antes de invertir en modelos mayores o en hardware dedicado.
- Generación de texto con razonamiento controlado: cuando se necesita una respuesta meditada (thinking activado) para tareas de análisis breve, o una respuesta directa (reasoning desactivado) para latencia mínima.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de latencia o throughput para este artefacto Core AI.

## Requisitos de hardware

- VRAM: no aplica en sentido estricto; el modelo se ejecuta en memoria unificada del dispositivo Apple. El artefacto pesa 440 MB, por lo que se necesita al menos ese espacio libre y memoria disponible para el contexto de 4096 tokens.
- GPU recomendadas: no disponible. El modelo está diseñado para el motor Core AI de iOS 27 sobre hardware Apple (iPhone/iPad con chip de la serie A o M compatible con Foundation Models), no para GPU de escritorio.
- Cabe en consumer GPU: no es el objetivo del artefacto; está orientado a dispositivos iOS, no a GPUs NVIDIA o AMD.
- Opciones de despliegue: framework Foundation Models de iOS 27 con `LanguageModelSession` y el producto `CoreAILM` de `coreai-models`; integración vía `@react-native-ai/core-ai`. No se documentan opciones vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput: no disponibles en la información proporcionada. La model card advierte que generar más allá del contexto de 4096 tokens provoca un crash del motor de iOS, por lo que se debe fijar `maxOutputTokens` cuando el modo thinking esté activo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / despliegue | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| grabbou/qwen3-0.6b-CoreAI | 0,6 B | 4096 (estático) | Core AI (`.aimodel`), iOS 27 | Apache-2.0 | HuggingFace, 0 descargas |
| Qwen/Qwen3-0.6B | 0,6 B | no disponible en esta ficha | safetensors (modelo base) | Apache-2.0 | HuggingFace (modelo original) |
| mlboydaisuke/qwen3-0.6b-CoreAI-official | 0,6 B | 4096 (estático) | Core AI (`.aimodel`), iOS 27 | Apache-2.0 | HuggingFace (exportación de referencia) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Contexto estático de 4096 tokens: no es ampliable y generar más allá de ese límite provoca un crash del motor de iOS según la model card.
- Modo thinking activado por defecto: si no se desactiva con `reasoning: 'none'`, el modelo consume tokens en razonamiento interno, lo que reduce el espacio efectivo para la respuesta y aumenta la latencia.
- Dependencia del sistema operativo y del toolchain: los artefactos Core AI están ligados a la versión de iOS y a las herramientas que los generaron; la portabilidad entre versiones no está garantizada.
- Idiomas soportados no declarados: no se especifica qué lenguas cubre esta exportación, por lo que no se puede asegurar un rendimiento multilingüe.
- Riesgo de alucinación: inherente a un modelo de 0,6 B de parámetros; su capacidad de razonamiento y factualidad es limitada en comparación con modelos mayores.
- Sin datos de benchmarks ni de sesgos: no se han publicado evaluaciones de sesgo, toxicidad o rendimiento para este artefacto.
- Licencia Apache-2.0: permite uso comercial, pero se debe conservar el aviso de licencia y atribuir al modelo base Qwen3 y a los autores de la exportación.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso en producción ni de validación comunitaria de este artefacto concreto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/grabbou/qwen3-0.6b-CoreAI
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Exportación de referencia: https://huggingface.co/mlboydaisuke/qwen3-0.6b-CoreAI-official
- Repositorio apple/coreai-models: https://github.com/apple/coreai-models
- Paquete @react-native-ai/core-ai: https://github.com/callstackincubator/ai
- Qwen3 Technical Report: https://arxiv.org/abs/2505.09388

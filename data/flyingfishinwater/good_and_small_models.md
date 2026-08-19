# flyingfishinwater/good_and_small_models

## Resumen

Este repositorio de HuggingFace, mantenido por el usuario flyingfishinwater, es una colección de modelos de lenguaje pequeños (4B parámetros) cuantizados en formato GGUF, optimizados para su ejecución en dispositivos móviles. Incluye tres modelos principales: Qwen3-4B-Instruct-2507, Qwen3-4B-Thinking-2507 y GLM Edge 4B Chat, todos ellos cuantizados a Q4 para reducir el uso de memoria y permitir inferencia completamente local. El repositorio está vinculado a la aplicación Privacy AI para iOS, que ejecuta estos modelos sin conexión a servidores externos, garantizando la privacidad de los datos del usuario.

La relevancia de este proyecto radica en la combinación de modelos de última generación (Qwen3-2507 y GLM-4) con formatos eficientes (GGUF) y un caso de uso concreto: IA generativa en dispositivos con recursos limitados. Para desarrolladores e investigadores, ofrece un punto de partida práctico para desplegar modelos con soporte de tool calling, razonamiento avanzado y multilingüismo, bajo licencias permisivas en el caso de los modelos Qwen3. El repositorio incluye además etiquetas de compatibilidad con endpoints y cuantización con imatrix, lo que facilita su integración en pipelines de servidores.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-4B y GLM-4 Edge) |
| Parametros totales | 360.748.032 (según safetensors del repo; los modelos descritos son de 4B) |
| Parametros activos | no aplicable (modelos densos, no MoE) |
| Longitud de contexto | Qwen3: 262K tokens nativos (configurado a 2048 en el despliegue móvil); GLM Edge: 128K nativos (configurado a 1024 en el despliegue móvil) |
| Tipos de cuantizacion | Q4_0, Q4_K_M (GGUF), imatrix |
| Idiomas soportados | Qwen3: multilingüe; GLM Edge: 26 idiomas (japonés, coreano, alemán, entre otros) |
| Licencia | Apache 2.0 (Qwen3); licencia propia de THUDM (GLM Edge) |
| Formato de pesos | GGUF, safetensors, ONNX |

## Arquitectura y entrenamiento

Los tres modelos del repositorio utilizan arquitecturas transformer densas. Qwen3-4B-Instruct-2507 y Qwen3-4B-Thinking-2507 son la última generación de la serie Qwen3 de Alibaba, con mejoras significativas en razonamiento, matemáticas, ciencia, código y uso de herramientas. La variante Thinking tiene el modo de razonamiento activado por defecto, lo que genera cadenas de pensamiento antes de responder. GLM Edge 4B Chat, de Zhipu AI (THUDM), es la generación más reciente de la serie GLM-4, con soporte para navegación web, ejecución de código, function calling y razonamiento con contexto largo de hasta 128K tokens.

Los pesos se han cuantizado a Q4 (Q4_0 para los modelos Qwen3 y Q4_K_M para GLM Edge) para reducir el tamaño a aproximadamente 2,1-2,6 GB por modelo, lo que permite su carga en la memoria de dispositivos móviles. El repositorio incluye también el formato ONNX, lo que facilita la conversión a otros runtimes de inferencia. No se dispone de información sobre el dataset de entrenamiento ni sobre el proceso de alineación (RLHF/DPO) de los modelos originales en la documentación del repositorio.

## Capacidades

- Generación de texto y conversación multi-turno en los tres modelos.
- Razonamiento avanzado y pensamiento encadenado (thinking mode) en Qwen3-4B-Thinking-2507, activado por defecto.
- Tool calling y function calling en Qwen3-4B-Instruct-2507 y GLM Edge 4B Chat.
- Ejecución de código y navegación web en GLM Edge 4B Chat.
- Soporte multilingüe: 26 idiomas en GLM Edge (japonés, coreano, alemán, etc.) y multilingüe en los modelos Qwen3.
- Mejoras en matemáticas, ciencia y razonamiento lógico en la serie Qwen3-2507.
- Inferencia on-device sin conexión, con privacidad total de datos.
- Compatibilidad con servidores OpenAI-compatible a través de la app Privacy AI.
- Plantilla de chat estándar "qwen" con tokens BOS/EOS configurados.

## Casos de uso

- Asistente personal privado en iOS: la app Privacy AI ejecuta estos modelos localmente para responder preguntas, gestionar tareas y mantener conversaciones sin enviar datos a servidores externos, aprovechando la cuantización Q4 para caber en la memoria del dispositivo.
- Análisis de salud on-device: la app Privacy AI incluye análisis de salud que se ejecutan localmente, utilizando la capacidad de razonamiento de Qwen3-4B para interpretar datos médicos y ofrecer recomendaciones sin comprometer la privacidad del paciente.
- Búsqueda web integrada: GLM Edge 4B Chat puede navegar por internet y resumir resultados, útil para aplicaciones de noticias, investigación móvil o asistentes de productividad que necesitan información actualizada.
- Generación de código en entornos sin conexión: Qwen3-4B-Instruct-2507 soporta tool calling y puede ayudar a programadores en dispositivos móviles o portátiles de bajos recursos, con un tamaño de 2,4 GB que cabe en cualquier equipo moderno.
- Atención al cliente automatizada: con 128K de contexto nativo, GLM Edge puede gestionar conversaciones largas con historial extenso en aplicaciones de soporte, aunque el despliegue móvil limite el contexto efectivo a 1024 tokens.
- Educación y tutoría: los modelos Qwen3-2507 destacan en matemáticas y razonamiento, adecuados para apps educativas que expliquen problemas paso a paso o generen ejercicios personalizados.
- Traducción y asistencia multilingüe: GLM Edge soporta 26 idiomas, lo que lo hace adecuado para apps de traducción, aprendizaje de idiomas o comunicación internacional.
- Prototipado rápido de chatbots: los GGUF cuantizados pueden ejecutarse en portátiles con 4-8 GB de RAM mediante llama.cpp u Ollama, ideales para desarrollo y pruebas locales antes de escalar a producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos en la información disponible del repositorio. La model card menciona que GLM-4 supera a Llama-3 en evaluaciones de semántica, matemáticas, razonamiento, código y conocimiento, pero no proporciona cifras concretas. Para los modelos Qwen3-2507, el autor no incluye tablas de benchmarks en este repositorio; se recomienda consultar las model cards originales de Qwen y THUDM para datos de rendimiento detallados.

## Requisitos de hardware

- Los modelos GGUF Q4 ocupan entre 2,1 y 2,6 GB, por lo que caben en la memoria de cualquier smartphone moderno (iPhone con 4+ GB de RAM, Android con 6+ GB).
- Para inferencia en escritorio, se puede ejecutar con llama.cpp u Ollama en CPUs con 8+ GB de RAM sin necesidad de GPU.
- Con GPU, una RTX 3060 de 12 GB o superior puede ejecutar estos modelos con margen para contexto extendido.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (con conversión a formato compatible) y la app Privacy AI para iOS.
- El tamaño reducido (Q4) permite latencias de decodificación de 10-30 tokens/segundo en CPUs modernas de móvil, dependiendo del dispositivo y de la longitud del contexto configurada.
- Para despliegue en producción con múltiples usuarios, se recomienda vLLM o TGI en una GPU A10G o L4 (16-24 GB VRAM) para servir el modelo con contexto completo.
- El repositorio incluye la etiqueta "endpoints_compatible", lo que sugiere que los modelos pueden servirse a través de APIs compatibles con OpenAI.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto nativo | Licencia | Formato | Uso movil |
|---|---|---|---|---|---|
| Qwen3-4B-Instruct-2507 (este repo) | 4B | 262K | Apache 2.0 | GGUF Q4 | Sí |
| Llama-3.2-3B | 3B | 128K | Llama 3.2 | GGUF | Sí |
| Phi-3.5-mini | 3,8B | 128K | MIT | GGUF | Sí |
| Gemma-2-2B | 2B | 8K | Gemma | GGUF | Sí |

Los modelos de este repositorio ofrecen la ventaja de ser los más recientes de sus respectivas familias (Qwen3-2507 y GLM-4), con mejoras en razonamiento y tool usage frente a alternativas más antiguas como Llama-3.2 o Phi-3.5. Sin embargo, la licencia de GLM Edge es propia de THUDM, por lo que hay que revisar sus términos antes de uso comercial. En términos de contexto nativo, Qwen3-4B destaca con 262K tokens, muy por encima de los 128K de Llama-3.2 y Phi-3.5, y de los 8K de Gemma-2.

## Limitaciones y advertencias

- La model card indica una longitud de contexto de 2048 tokens para los modelos Qwen3 y 1024 para GLM Edge en el despliegue móvil, muy inferior a los 262K/128K nativos. Esto limita las conversaciones largas en la app Privacy AI y puede provocar cortes en tareas que requieran contexto extenso.
- Existe una discrepancia entre el número de parámetros reportado (360M según safetensors) y los modelos descritos (4B), lo que sugiere que el repositorio contiene archivos adicionales no documentados en la model card. El tamaño total del repositorio (279,2 GB) respalda esta hipótesis.
- No se proporcionan benchmarks específicos en el repositorio, por lo que el rendimiento real en tareas concretas no está verificado por el autor.
- La licencia de GLM Edge es de THUDM y puede tener restricciones de uso comercial; es necesario revisar el LICENSE del modelo original antes de desplegarlo en producción.
- Los modelos cuantizados a Q4 pueden sufrir degradación de calidad frente a las versiones en FP16, especialmente en tareas de razonamiento complejo o generación de código extenso.
- La app Privacy AI es una aplicación comercial; el repositorio actúa como distribución de pesos, no como proyecto de investigación formal, por lo que el soporte y la documentación pueden ser limitados.
- Riesgo de alucinación inherente a modelos de 4B, especialmente en tareas de conocimiento factual o generación de código complejo; se recomienda validación humana en aplicaciones críticas.
- La plantilla de prompt de los modelos Qwen3 aparece vacía en la model card, lo que puede dificultar la integración correcta en frameworks de inferencia si no se usa la plantilla "qwen" estándar.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/flyingfishinwater/good_and_small_models
- Modelo original Qwen3-4B-Instruct-2507: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Modelo original Qwen3-4B-Thinking-2507: https://huggingface.co/Qwen/Qwen3-4B-Thinking-2507
- Organización THUDM (GLM Edge 4B Chat): https://huggingface.co/THUDM
- Privacy AI en App Store: https://apps.apple.com/app/apple-store/id6738392421
- Sitio oficial de Privacy AI: https://privacyai.acmeup.com

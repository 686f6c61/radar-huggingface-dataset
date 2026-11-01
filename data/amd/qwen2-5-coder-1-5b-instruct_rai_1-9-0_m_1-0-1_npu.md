# amd/Qwen2.5-Coder-1.5B-Instruct_rai_1.9.0_m_1.0.1_npu

## Resumen

AMD publica en HuggingFace una versión optimizada del modelo Qwen2.5-Coder-1.5B-Instruct para su plataforma Ryzen AI. Se trata de una conversión a formato ONNX del modelo original de Alibaba, empaquetada específicamente para ejecutarse sobre las NPU (unidades de procesamiento neuronal) integradas en los procesadores AMD Ryzen AI. El sufijo `rai_1.9.0_m_1.0.1_npu` indica la versión del runtime Ryzen AI (1.9.0) y la versión del artefacto de modelo (1.0.1) orientado a NPU.

El modelo base, Qwen2.5-Coder-1.5B-Instruct, es un transformer decoder-only de 1.500 millones de parámetros desarrollado por el equipo Qwen de Alibaba, especializado en generación y razonamiento de código, con capacidades conversacionales gracias a un ajuste por instrucciones. Esta conversión de AMD no modifica los pesos ni el comportamiento del modelo, sino que los adapta al formato y a las restricciones operativas del stack Ryzen AI para permitir inferencia local acelerada por hardware en equipos de sobremesa y portátiles con NPU integrada.

La relevancia de esta ficha radica en que ejemplifica el patrón creciente de distribuciones de modelos optimizadas por fabricante de silicio: el mismo modelo de pesos abiertos se redistribuye en formatos propietarios de despliegue (ONNX + runtime Ryzen AI) para aprovechar aceleradores específicos. El repositorio tiene acceso restringido (gated), requiere aceptar condiciones en HuggingFace y, en el momento de la consulta, no registra descargas ni likes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5), conversión ONNX para Ryzen AI NPU |
| Parámetros totales | 1.500 millones (1.5B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el modelo base Qwen2.5-Coder-1.5B-Instruct soporta 32.768 tokens; esta conversión no lo especifica) |
| Tipos de cuantización | No disponible en la información proporcionada (el artefacto se distribuye para NPU Ryzen AI; el repo ocupa 1,5 GB) |
| Idiomas soportados | Inglés (según tag `en` del repositorio) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (runtime Ryzen AI, artefacto `m_1.0.1_npu`) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen2.5-Coder-1.5B-Instruct, un transformer decoder-only denso de 1.500 millones de parámetros con atención causal estándar, desarrollo por el equipo Qwen de Alibaba. La familia Qwen2.5-Coder se entrenó con un corpus específico de código y texto técnico, y la variante Instruct incorpora ajuste supervisado y optimización por preferencias para seguir instrucciones y mantener conversaciones multi-turno. No se dispone en la información proporcionada de detalles sobre el número exacto de tokens de entrenamiento, la composición del dataset ni las técnicas de alineación empleadas.

La contribución de AMD en este repositorio no es de entrenamiento sino de compilación y empaquetado: los pesos se convierten a ONNX y se estructuran como artefacto compatible con el runtime Ryzen AI 1.9.0, con un identificador de modelo `m_1.0.1_npu` que apunta a ejecución sobre la NPU del sistema. No se documentan en la información disponible innovaciones arquitectónicas adicionales (decodificación especulativa, atención lineal u otras) más allá de la conversión de formato y la integración con el runtime.

## Capacidades

- Generación de texto y código: el modelo base está especializado en completar, explicar y generar código en múltiples lenguajes de programación.
- Razonamiento conversacional: la variante Instruct sigue instrucciones y mantiene diálogos multi-turno.
- Razonamiento matemático y lógico básico, heredado del entrenamiento del modelo base.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información proporcionada para esta conversión.
- Capacidades de agente y razonamiento multi-paso: no confirmadas en la información proporcionada.
- Capacidades multilingües: el repositorio declara únicamente inglés (`en`); el modelo base Qwen2.5-Coder tiene cobertura multilingüe más amplia, pero esta conversión solo declara inglés.
- Capacidades especiales (modo thinking, visión, audio): no disponibles en esta conversión; es un modelo exclusivamente de texto.

## Casos de uso

- Autocompletado de código en IDE local: el modelo puede integrarse en editores sobre equipos con NPU Ryzen AI para sugerir líneas y bloques de código sin enviar datos a la nube, aprovechando la aceleración por hardware y el tamaño reducido de 1.5B parámetros.
- Asistente de refactorización en portátiles: con 1.5B parámetros y ejecución en NPU, permite explicar funciones, proponer refactorizaciones y generar pruebas unitarias en un flujo de trabajo offline.
- Generación de documentación técnica: el modelo puede redactar docstrings y comentarios a partir de fragmentos de código, adecuado por su entrenamiento específico en código y su bajo coste de inferencia.
- Chatbot de soporte para desarrolladores: despliegue de un asistente conversacional local que responde dudas sobre APIs y sintaxis, con la ventaja de privacidad al no requerir conexión externa.
- Enseñanza de programación: uso en entornos educativos con hardware AMD Ryzen AI para generar ejemplos, corregir ejercicios y explicar errores de compilación de forma interactiva y local.
- Preprocesado y generación de scripts en pipelines de datos: tareas de generación de código auxiliar (parsers, transformaciones, scripts de automatización) en estaciones de trabajo con NPU, donde la latencia y el consumo energético importan.
- Prototipado rápido en entornos con restricciones de red: al ejecutarse localmente en la NPU, permite iterar sobre código en máquinas aisladas o con políticas estrictas de confidencialidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio de AMD no incluye métricas de evaluación (MMLU, HumanEval, GSM8K u otras) para esta conversión específica, y no se debe asumir que el rendimiento coincide con el del modelo original sin verificación empírica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. El repositorio ocupa 1,5 GB, lo que sugiere un artefacto compacto, pero no se especifica la cuantización ni el consumo de memoria en ejecución.
- GPU recomendadas: no aplica en el sentido habitual; el artefacto está orientado a NPU integrada en procesadores AMD Ryzen AI, no a GPU discretas.
- Compatibilidad con GPU de consumo: no confirmada. El formato ONNX con runtime Ryzen AI está diseñado para la NPU del SoC; su ejecución en otras GPU no está documentada en la información disponible.
- Opciones de despliegue: runtime Ryzen AI (versión 1.9.0 según el identificador del repositorio); no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI para este artefacto concreto.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| AMD Qwen2.5-Coder-1.5B-Instruct (rai_1.9.0_m_1.0.1_npu) | 1.5B | No disponible | Apache 2.0 | ONNX para NPU Ryzen AI | Conversión de fabricante, acceso restringido, solo inglés declarado |
| Qwen2.5-Coder-1.5B-Instruct (original) | 1.5B | 32.768 tokens | Apache 2.0 | Safetensors, GGUF, múltiples runtimes | Modelo base, multilingüe, amplia compatibilidad de despliegue |
| Qwen2.5-Coder-7B-Instruct | 7B | 32.768 tokens | Apache 2.0 | Safetensors, GGUF | Mayor capacidad a costa de más recursos; requiere GPU o CPU con más memoria |
| DeepSeek-Coder-1.3B-Instruct | 1.3B | 16.384 tokens (modelo base) | Licencia específica de DeepSeek | Safetensors | Alternativa de tamaño similar orientada a código; licencia distinta a Apache 2.0 |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información proporcionada; el modelo base puede heredar sesgos de sus datos de entrenamiento, pero no se detallan.
- Riesgo de alucinación: presente como en cualquier modelo de 1.5B parámetros; puede generar APIs, funciones o fragmentos de código inexistentes, por lo que requiere verificación en producción.
- Limitaciones de contexto e idioma: el repositorio declara únicamente inglés; no se especifica la longitud de contexto efectiva de esta conversión, que puede diferir de los 32.768 tokens del modelo original.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el acceso al repositorio está restringido (gated) y requiere aceptar condiciones en HuggingFace; conviene revisar los términos del runtime Ryzen AI, que es un componente separado del modelo.
- Caveats de producción: el artefacto está atado a la versión 1.9.0 del runtime Ryzen AI y a la NPU de procesadores AMD compatibles; no es portable a otros aceleradores sin reconversión. El repositorio no registra descargas ni validación comunitaria, y no se han publicado benchmarks que confirmen el rendimiento en la NPU.
- Dependencia de hardware propietario: el valor del artefacto depende de disponer de un equipo Ryzen AI compatible; en otro hardware, la versión original del modelo en safetensors o GGUF es la opción recomendada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/amd/Qwen2.5-Coder-1.5B-Instruct_rai_1.9.0_m_1.0.1_npu
- Modelo base Qwen2.5-Coder-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- Documentación de Ryzen AI: no disponible en la información proporcionada
- Paper o blog de AMD sobre esta conversión: no disponible en la información proporcionada

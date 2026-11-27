# Deadcracker23/Flint-GGUF

## Resumen

Flint es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por RecursiveSI y distribuido en formato GGUF por el usuario Deadcracker23. Con 39.785.287.456 parámetros totales (aproximadamente 39,8B) y solo unos 2,5B parámetros activos por token, se posiciona como una alternativa eficiente para inferencia local: la mayor parte del cómputo se concentra en una fracción pequeña de los expertos, lo que reduce el coste por token frente a un modelo denso del mismo tamaño.

La arquitectura consta de 49 capas (2 densas y 47 MoE) con 256 expertos enrutados, de los que se activan 6 por token, más un experto compartido. El contexto declarado alcanza los 262.144 tokens, un valor notable para un modelo de este tamaño y relevante para tareas de contexto largo como análisis de documentos o agentes multi-turno.

Este repositorio concreto es una conversión cuantizada del modelo base `RecursiveSI/flint`, publicada en tres variantes (BF16, Q8_0 y Q4_K_M) y pensada para ejecutarse con llama.cpp mediante una compilación que incluya soporte específico para Flint. Es relevante ahora porque permite desplegar un MoE de casi 40B en hardware de consumo con la cuantización Q4_K_M, manteniendo los tensores críticos (embeddings, atención y experto compartido) en Q8_0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE); 49 capas (2 densas + 47 MoE) |
| Parametros totales | 39.785.287.456 (~39,8B) |
| Parametros activos | ~2,5B por token |
| Longitud de contexto | 262.144 tokens (262K) |
| Tipos de cuantizacion | BF16, Q8_0, Q4_K_M (en Q4_K_M los tensores no expertos se mantienen en Q8_0) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 145,4 GB) |

Detalles adicionales de arquitectura: 256 expertos enrutados con 6 activos por token más un experto compartido. El modelo es solo texto: no incluye mmproj, MTP ni sidecars DFlash.

## Arquitectura y entrenamiento

Flint es un transformer con arquitectura MoE de enrutamiento disperso: de los 256 expertos por capa se activan 6 por token, complementados por un experto compartido siempre activo. Las dos primeras capas son densas y las 47 restantes son MoE. Esta configuración permite un total de ~39,8B parámetros con un coste computacional por token equivalente a un modelo de ~2,5B activos, lo que explica su viabilidad en hardware modesto.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO; la model card del repositorio cuantizado no los detalla. Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal. La conversión a GGUF se ha realizado automáticamente con la herramienta `ggml-org/convert` y requiere una build de llama.cpp con soporte para Flint (PR #30928).

## Capacidades

- Generación de texto conversacional: el tag `conversational` y la pipeline `text-generation` indican uso orientado a diálogo.
- Razonamiento y generación de texto general, derivados del modelo base `RecursiveSI/flint`.
- Contexto largo: ventana de 262K tokens, adecuada para documentos extensos y conversaciones multi-turno.
- Eficiencia MoE: ~2,5B parámetros activos por token permiten throughput alto relativo al tamaño total.
- Capacidades multilingües: no disponibles (no se declaran idiomas en la información proporcionada).
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no, el modelo es solo texto.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional local: con ~2,5B parámetros activos y cuantización Q4_K_M, puede desplegarse en una estación de trabajo con GPU de consumo para chats multi-turno con contexto largo de hasta 262K tokens.
- Análisis de documentos extensos: la ventana de 262K tokens permite introducir contratos, informes o bases de código completas sin fragmentación agresiva, manteniendo coherencia entre secciones.
- Generación de código asistida: como modelo de texto general puede integrarse en editores o pipelines de revisión, aunque no se documenta soporte explícito de tool calling.
- Procesamiento por lotes en servidor: el bajo número de parámetros activos reduce el coste por token, lo que lo hace adecuado para tareas de resumen, clasificación o extracción sobre grandes volúmenes de texto.
- Despliegue en hardware limitado: la variante Q4_K_M con tensores críticos en Q8_0 permite ejecutar un MoE de ~40B en GPUs de consumo mediante llama.cpp, algo inviable con un modelo denso equivalente.
- Prototipado e investigación: al ser Apache 2.0 y estar disponible en GGUF, es apto para experimentación local, ajuste de prompts y evaluación comparativa de arquitecturas MoE sin restricciones comerciales.
- Chatbot embebido en aplicaciones de escritorio: la integración con la app Llama (`llama serve -hf`) facilita desplegar el modelo como servicio local en herramientas de productividad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en Q4_K_M, el repo completo ocupa 145,4 GB, pero esa cifra incluye todas las variantes; la huella de Q4_K_M de un modelo de ~40B con expertos cuantizados ronda los 20-25 GB, aunque no se confirma en la información disponible. En Q8_0 y BF16 las necesidades crecen considerablemente (del orden de 40 GB y 80 GB respectivamente, estimación no confirmada).
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, Q4_K_M podría caber en GPUs de consumo de gama alta (24 GB) y en GPUs profesionales como A100 o H100 para las variantes de mayor precisión.
- ¿Cabe en GPU de consumo? Probablemente la variante Q4_K_M en GPUs con 24 GB o más, aunque no se especifica oficialmente.
- Opciones de despliegue: llama.cpp (requiere build con soporte Flint, PR #30928), app Llama (`llama serve -hf ggml-org/Flint-GGUF`). No se documenta compatibilidad con vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Flint (este repo) | ~39,8B | ~2,5B | 262K | Apache 2.0 | GGUF |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría (MoE de ~40B con ~2,5B activos) en la documentación proporcionada, por lo que no se puede establecer una comparativa fiable de rendimiento.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al no especificarse la composición del dataset de entrenamiento, no es posible evaluar sesgos de dominio o demográficos.
- Riesgo de alucinación: inherente a los modelos generativos; no se han publicado evaluaciones de fidelidad factual.
- Idiomas: no se declaran idiomas soportados, por lo que el rendimiento multilingüe es desconocido.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base `RecursiveSI/flint` por si impone condiciones adicionales.
- Dependencia de tooling específico: requiere una build de llama.cpp con soporte Flint (PR #30928); las versiones estándar pueden no cargar el modelo correctamente.
- Solo texto: no admite entrada multimodal; no hay mmproj, MTP ni sidecars DFlash.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la ficha, lo que implica ausencia de validación comunitaria y de reportes de calidad.
- Conversión automática: al haberse generado con `ggml-org/convert`, pueden existir diferencias de comportamiento frente al modelo original en safetensors.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Deadcracker23/Flint-GGUF
- Modelo base: https://huggingface.co/RecursiveSI/flint
- App Llama: https://llama.app
- PR de soporte en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/30928
- Herramienta de conversión: https://github.com/ggml-org/convert

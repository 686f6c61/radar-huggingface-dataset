# hipfire-models/LFM2.5-8B-A1B

## Resumen

LFM2.5-8B-A1B es un modelo de lenguaje de tipo Mixture of Experts (MoE) híbrido desarrollado por Liquid AI, orientado a razonamiento y despliegue en entornos de borde (edge). Combina 24 capas: 18 bloques de convolución LIV con doble compuerta y 6 bloques de atención GQA (Grouped Query Attention), con 8.300 millones de parámetros totales y 1.500 millones activos por token. Su ventana de contexto alcanza los 128.000 tokens y su vocabulario también es de 128.000 entradas.

La ficha que nos ocupa, `hipfire-models/LFM2.5-8B-A1B`, no es el modelo original de Liquid AI, sino una versión pre-cuantizada del mismo para hipfire, un motor de inferencia nativo en Rust diseñado específicamente para GPUs AMD con arquitectura RDNA (vía HIP/ROCm directo, sin Python en la ruta crítica). El artefacto distribuido emplea el formato propietario HFQ de hipfire con cuantización MQ4 (4 bits rotados mediante transformada de Walsh-Hadamard), lo que reduce el peso a 4,90 GB.

Es relevante ahora porque demuestra la viabilidad de ejecutar un MoE de 8.300 millones de parámetros con contexto de 128.000 tokens en GPUs de consumo AMD (validado en una RX 7900 XTX con gfx1100), manteniendo coherencia en la generación y un rendimiento de decodificación de aproximadamente 300 tokens por segundo. El modelo original está ajustado para razonamiento y emite bloques `<think>` antes de responder.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE híbrida: 18 bloques de convolución LIV con doble compuerta + 6 bloques de atención GQA |
| Parámetros totales | 8.300 millones (8.3B) |
| Parámetros activos | 1.500 millones (1.5B) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantización | MQ4 (MagnumQuant 4-bit, rotación FWHT); único formato distribuido en este repo |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (lfm1.0) |
| Formato de pesos | HFQ (contenedor propietario de hipfire, extensión `.mq4`); no es GGUF ni safetensors |
| Vocabulario | 128.000 tokens |
| Capas | 24 (18 LIV + 6 GQA) |
| Tamaño del repo | 4,90 GB |
| Librería | hipfire |
| Modelo base | LiquidAI/LFM2.5-8B-A1B |

## Arquitectura y entrenamiento

La arquitectura es un transformer híbrido MoE que alterna bloques de convolución LIV (Linear Input-Varying, con doble compuerta) con bloques de atención GQA. Esta combinación busca reducir el coste computacional de la atención sobre contextos largos (128.000 tokens) sustituyendo la mayoría de capas de atención por convoluciones, manteniendo solo 6 capas con atención agrupada. El modelo tiene 8.300 millones de parámetros totales pero solo activa 1.500 millones por token, lo que lo hace apto para despliegue en hardware limitado.

El modelo original de Liquid AI está ajustado para razonamiento (reasoning-tuned) y genera bloques `<think>` antes de la respuesta final. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. La versión de hipfire no modifica los pesos más allá de la re-cuantización a MQ4/HFQ y la incrustación del `chat_template.jinja` original en los metadatos del contenedor; no hay otros cambios según la nota de modificación de la licencia.

La innovación técnica destacable de esta distribución es la cuantización MQ4: los pesos se pre-rotan mediante una transformada de Walsh-Hadamard en el momento de la cuantización y el vector de entrada se rota con la misma transformada en tiempo de ejecución dentro de los kernels GEMV. Esta rotación aplana los valores atípicos y, según el autor, ofrece una calidad de salida cercana a Q8 con almacenamiento de 4 bits.

## Capacidades

- Generación de texto y razonamiento multi-paso, con modo de pensamiento explícito mediante bloques `<think>`.
- Razonamiento matemático y resolución de problemas, derivado del ajuste para razonamiento del modelo base.
- Generación de código, aunque no se detalla en la información disponible el nivel de soporte ni benchmarks específicos.
- Procesamiento de contextos largos de hasta 128.000 tokens, adecuado para documentos extensos y conversaciones multi-turno prolongadas.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: el modo `<think>` facilita cadenas de razonamiento, aunque no se confirma soporte nativo de agentes.
- Capacidades de visión o audio: no disponibles.
- Muestreo recomendado por el autor: temperatura 0.2, top_k 80, repetition_penalty 1.05.

## Casos de uso

- Razonamiento asistido en local sobre GPU AMD de consumo: el modelo puede ejecutarse en una RX 7900 XTX con el motor hipfire y resolver problemas de lógica o matemáticas mostrando el bloque `<think>`, lo que permite auditar el proceso de razonamiento sin depender de la nube.
- Procesamiento de documentos largos: con 128.000 tokens de contexto, puede resumir o extraer información de contratos, informes o bases de código extensas en una sola pasada.
- Asistente de código en estación de trabajo: integrado vía `hipfire serve`, puede atender consultas de programación y explicar fragmentos de código, aprovechando el bajo coste de activación (1.5B parámetros activos) para respuestas rápidas.
- Chat multi-turno con historial extenso: su ventana de contexto permite mantener conversaciones prolongadas sin truncar el historial, útil en atención al cliente técnica o soporte interno.
- Despliegue en entornos con restricciones de privacidad: al ejecutarse íntegramente en local con hipfire (Rust, sin Python en la ruta crítica), los datos no salen del equipo, lo que encaja en sectores regulados.
- Prototipado e investigación en GPUs AMD: sirve como banco de pruebas para estudiar el comportamiento de MoE híbridos cuantizados a 4 bits y para validar pipelines de inferencia en RDNA.
- Generación de texto por lotes en hardware de gama alta de consumo: los ~300 tok/s de decodificación medidos permiten tareas de generación masiva sin GPU de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente reporta una validación cualitativa y de rendimiento en gfx1100 (RX 7900 XTX): carga del daemon, generación greedy, batería de detección de coherencia limpia (sin atractores, sin fugas de tokens especiales, sin bucles) y aproximadamente 300 tok/s de decodificación en una prueba greedy de 80 tokens.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5 GB para el archivo MQ4 de 4,90 GB, más overhead del runtime y de la caché KV para contextos largos (no cuantificada en la información disponible).
- GPU recomendadas: AMD RDNA con soporte HIP/ROCm; validado específicamente en gfx1100 (Radeon RX 7900 XTX).
- Cabe en GPU de consumo: sí, al menos en RX 7900 XTX; no se confirma compatibilidad con otras GPU de consumo ni con GPUs NVIDIA (el motor hipfire está orientado a RDNA).
- Opciones de despliegue: exclusivamente hipfire (instalación vía script, `hipfire pull`, `hipfire run`, `hipfire serve`). No es compatible con llama.cpp, Ollama, vLLM, TGI ni transformers, dado el formato HFQ.
- Latencia y throughput: ~300 tok/s de decodificación en una prueba greedy de 80 tokens sobre RX 7900 XTX; no se dispone de datos de latencia de primer token ni de throughput en otros hardware.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Licencia | Formato / disponibilidad |
|---|---|---|---|---|
| LFM2.5-8B-A1B (hipfire, esta ficha) | 8.3B / 1.5B | 128.000 | LFM Open License v1.0 (comercial solo < 10 M USD de ingresos) | HFQ `.mq4`, solo motor hipfire |
| LiquidAI/LFM2.5-8B-A1B (original) | 8.3B / 1.5B | 128.000 | LFM Open License v1.0 | Safetensors, ecosistema transformers |
| Alternativas de tamaño similar (p. ej. MoE de ~8B con ~1-2B activos) | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de rendimiento comparativo con otros modelos, por lo que la comparativa se limita a parámetros, contexto, licencia y formato de distribución.

## Limitaciones y advertencias

- El formato HFQ `.mq4` es propietario de hipfire: no se puede cargar en llama.cpp, transformers, Ollama, vLLM ni TGI. La portabilidad es nula fuera del ecosistema hipfire.
- Compatibilidad de hardware restringida a GPUs AMD RDNA con HIP/ROCm; no hay soporte confirmado para NVIDIA ni para CPU.
- Licencia LFM Open License v1.0: el uso comercial solo está permitido a entidades con ingresos anuales inferiores a 10 millones de dólares estadounidenses (sección 5). Es imprescindible revisar el archivo LICENSE antes de cualquier uso en producción.
- Al ser un derivado cuantizado a 4 bits, puede existir una degradación de calidad respecto al modelo original en safetensors, aunque el autor afirma una calidad cercana a Q8; no se aportan métricas comparativas que lo respalden.
- El modelo está ajustado para razonamiento y emite bloques `<think>`; en producción habrá que filtrar o gestionar estos bloques en la respuesta.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan evaluaciones específicas de fidelidad factual.
- Idiomas soportados no documentados: no se puede garantizar un rendimiento adecuado fuera de los idiomas del entrenamiento original.
- Sesgos conocidos: no disponibles en la información proporcionada.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica una validación comunitaria muy limitada.
- La caché KV para contextos de 128.000 tokens puede requerir VRAM adicional significativa no cuantificada en la documentación.

## Enlaces

- Repositorio Hugging Face de esta versión: https://huggingface.co/hipfire-models/LFM2.5-8B-A1B
- Modelo base original: https://huggingface.co/LiquidAI/LFM2.5-8B-A1B
- Motor hipfire: https://github.com/Kaden-Schutt/hipfire
- Script de instalación de hipfire: https://raw.githubusercontent.com/Kaden-Schutt/hipfire/master/scripts/install.sh
- Licencia LFM Open License v1.0: archivo LICENSE incluido en el repositorio (copiado del upstream)

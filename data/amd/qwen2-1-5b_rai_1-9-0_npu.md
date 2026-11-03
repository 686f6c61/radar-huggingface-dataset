# amd/Qwen2-1.5B_rai_1.9.0_npu

## Resumen

AMD Qwen2-1.5B_rai_1.9.0_npu es una distribución del modelo Qwen2-1.5B de Alibaba optimizada por AMD para su ejecución sobre las NPU (unidades de procesamiento neuronal) integradas en los procesadores Ryzen AI, dentro del stack Ryzen AI Software 1.9.0. El modelo se publica en formato ONNX y ha sido cuantizado con Quark, la herramienta de compresión de modelos de AMD, para adaptarse a las restricciones de memoria y cómputo de la NPU. No se trata de un modelo nuevo entrenado desde cero, sino de un artefacto de despliegue: el mismo Qwen2-1.5B con pesos recompilados y cuantizados para el acelerador.

La relevancia de esta ficha radica en que ejemplifica una tendencia creciente: los fabricantes de silicio publican versiones listas para producción de modelos open source sobre su hardware. En este caso, permite ejecutar generación de texto conversacional en inglés de forma local en un PC con Ryzen AI, sin GPU dedicada, delegando la inferencia a la NPU XDNA/XDNA2. El repositorio tiene 2,5 GB y está sujeto a acceso restringido (gated) en HuggingFace.

El modelo base Qwen2-1.5B es un transformer decoder-only de 1.500 millones de parámetros con licencia Apache 2.0, lo que facilita su uso comercial. La variante de AMD hereda esa licencia, aunque el acceso al artefacto ONNX requiere aceptar las condiciones del repositorio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), exportado a ONNX para NPU Ryzen AI |
| Parámetros totales | 1.500 millones (modelo base Qwen2-1.5B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base Qwen2-1.5B soporta hasta 32.768 tokens, pero la ficha no lo confirma para esta variante) |
| Tipos de cuantización | cuantización Quark para NPU; nivel exacto (p. ej. INT8/INT4) no disponible |
| Idiomas soportados | inglés (según la ficha del repo) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |
| Tamaño del repositorio | 2,5 GB |
| Pipeline | text-generation |
| Acceso | restringido (gated) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen2-1.5B, un transformer decoder-only de la familia Qwen2 de Alibaba, con atención causal estándar y 1.500 millones de parámetros. No se trata de una arquitectura MoE ni híbrida. AMD no ha reentrenado el modelo: la aportación consiste en la exportación a ONNX y la cuantización con Quark para que la inferencia se ejecute sobre la NPU de Ryzen AI dentro del stack Ryzen AI 1.9.0.

No se dispone de información sobre el dataset de entrenamiento, número de tokens, composición de datos ni si hubo RLHF o DPO en esta variante; esos datos corresponden al modelo base Qwen2-1.5B publicado por Alibaba, pero no se detallan en la información proporcionada. La innovación técnica destacable es el propio pipeline de despliegue: compilación ONNX + cuantización Quark + ejecución en NPU, que permite inferencia local de bajo consumo en hardware de PC.

## Capacidades

- Generación de texto conversacional en inglés.
- Razonamiento básico y respuesta a preguntas de dominio general, limitado por el tamaño de 1.5B parámetros.
- Generación de código y matemáticas a nivel básico (heredado del modelo base Qwen2-1.5B).
- Soporte de tool calling / function calling: no confirmado en la información disponible para esta variante.
- Capacidades de agente y razonamiento multi-paso: no confirmadas; el tamaño del modelo limita su fiabilidad en cadenas largas.
- Multilingüismo: la ficha declara únicamente inglés, aunque el modelo base Qwen2 tiene cobertura multilingüe más amplia.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Asistentes conversacionales locales en PC con Ryzen AI: el modelo se ejecuta en la NPU sin GPU dedicada, lo que permite un chatbot de texto en inglés con bajo consumo energético y sin enviar datos a la nube.
- Procesamiento de texto en el borde (edge computing): resúmenes, clasificación y extracción de información en equipos sin acelerador gráfico, aprovechando la NPU XDNA.
- Prototipado de aplicaciones ONNX: sirve como referencia para desarrolladores que quieran validar pipelines de inferencia ONNX sobre Ryzen AI antes de escalar a modelos mayores.
- Generación de texto en herramientas de productividad offline: borradores, reescritura y autocompletado en aplicaciones de escritorio que requieren privacidad y funcionamiento sin conexión.
- Evaluación de cuantización Quark: útil para medir el impacto de la cuantización en calidad y latencia sobre NPU frente a la versión FP en CPU/GPU.
- Filtrado y moderación de contenido en local: clasificación de texto y respuestas controladas en inglés dentro de flujos con requisitos de baja latencia y sin dependencia de API externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Hardware objetivo: NPU integrada en procesadores AMD Ryzen AI (stack Ryzen AI Software 1.9.0).
- VRAM estimada: no aplica para NPU; el repo ocupa 2,5 GB en disco. La memoria requerida en NPU depende del nivel de cuantización Quark, no especificado.
- GPU recomendadas: no aplica; el artefacto está pensado para NPU. Para ejecutar el modelo base Qwen2-1.5B en GPU se necesitarían aproximadamente 3-4 GB en FP16 (estimación para el modelo base, no confirmada para esta variante).
- ¿Cabe en GPU de consumo? El modelo base de 1.5B sí cabe en GPUs de consumo con 4-8 GB de VRAM, pero esta variante ONNX está orientada a NPU.
- Opciones de despliegue: Ryzen AI Software 1.9.0 con runtime ONNX; otras opciones (vLLM, llama.cpp, Ollama, TGI) no están confirmadas para este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Orientación |
|---|---|---|---|---|---|
| AMD Qwen2-1.5B_rai_1.9.0_npu | 1.5B | no disponible | ONNX (NPU) | Apache 2.0 | NPU Ryzen AI |
| Qwen2-1.5B (Alibaba) | 1.5B | 32.768 tokens (modelo base) | safetensors, GGUF | Apache 2.0 | GPU/CPU genérico |
| Qwen2.5-1.5B (Alibaba) | 1.5B | 32.768 tokens (modelo base) | safetensors, GGUF | Apache 2.0 | GPU/CPU genérico |
| Llama 3.2 1B | 1.2B | 128.000 tokens | safetensors, GGUF | Llama 3.2 Community License | GPU/CPU genérico |

La comparativa directa más justa es con el Qwen2-1.5B original: mismos parámetros y licencia, pero distinto formato y hardware objetivo. Frente a Llama 3.2 1B, la diferencia clave es la licencia (Apache 2.0 frente a licencia comunitaria con restricciones) y el contexto, mayor en Llama 3.2.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en HuggingFace antes de la descarga.
- Idioma: la ficha declara únicamente inglés; el rendimiento en castellano no está garantizado.
- Tamaño limitado: con 1.5B parámetros, la fiabilidad en razonamiento complejo, matemáticas avanzadas y código de producción es limitada.
- Riesgo de alucinación: inherente a modelos de esta escala, especialmente en tareas de conocimiento factual.
- Dependencia de hardware: el artefacto ONNX está optimizado para NPU Ryzen AI; su ejecución fuera de ese stack no está garantizada.
- Contexto: no se confirma la longitud de contexto efectiva de esta variante; no asumir los 32.768 tokens del modelo base sin verificación.
- Licencia: Apache 2.0 permite uso comercial, pero las condiciones del repositorio gated pueden añadir requisitos adicionales.
- Sin benchmarks publicados: no hay evidencia de rendimiento específica para esta variante cuantizada.

## Enlaces

- HuggingFace: https://huggingface.co/amd/Qwen2-1.5B_rai_1.9.0_npu
- Modelo base Qwen2-1.5B (Alibaba): https://huggingface.co/Qwen/Qwen2-1.5B
- Ryzen AI Software (AMD): https://www.amd.com/en/developer/resources/ryzen-ai-software.html
- Quark (cuantización AMD): https://quark.amd.com/

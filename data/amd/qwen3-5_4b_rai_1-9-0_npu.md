# amd/Qwen3.5_4B_rai_1.9.0_npu

## Resumen

El modelo `amd/Qwen3.5_4B_rai_1.9.0_npu` es una distribución del modelo Qwen3.5 de 4.000 millones de parámetros, publicada por AMD en formato ONNX y optimizada específicamente para ejecutarse sobre la NPU (Neural Processing Unit) de los procesadores AMD Ryzen AI. No se trata de un modelo entrenado desde cero por AMD, sino de una conversión y empaquetado del Qwen3.5 4B original para su despliegue en hardware de PC con aceleración NPU mediante el stack Ryzen AI (RAI) en su versión 1.9.0.

El problema que resuelve es la brecha entre modelos de lenguaje de buena calidad y el hardware de consumo: permitir que un LLM de 4B parámetros se ejecute de forma eficiente en la NPU integrada de los Ryzen AI, con menor consumo energético y sin depender exclusivamente de la GPU o la CPU. Esto es relevante para escenarios de inferencia local en portátiles y equipos de sobremesa con dichos procesadores.

La información disponible es limitada: el repositorio está restringido (gated), no tiene descargas ni likes, y la model card pública no aporta detalles sobre datos de entrenamiento, benchmarks o composición del dataset. Los datos técnicos de arquitectura y contexto del Qwen3.5 4B subyacente no se especifican en la información proporcionada, por lo que se indican como no disponibles cuando corresponde.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5, según tag `qwen3_5`); detalles no disponibles |
| Parámetros totales | 4B (según nombre del modelo) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (formato ONNX; se desconoce si hay variantes cuantizadas) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (optimizado para NPU Ryzen AI) |

## Arquitectura y entrenamiento

El modelo se distribuye como artefacto ONNX orientado a la NPU de AMD Ryzen AI, dentro del ecosistema Ryzen AI (RAI) 1.9.0. La arquitectura subyacente corresponde a la familia Qwen3.5, un transformer de 4B parámetros, pero la información proporcionada no detalla el número de capas, dimensión oculta, mecanismo de atención ni innovaciones específicas (por ejemplo, si incorpora atención lineal o decodificación especulativa).

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO. Tampoco se documentan en la información disponible detalles sobre el proceso de conversión a ONNX, el grado de cuantización aplicado para la NPU o las optimizaciones específicas del runtime Ryzen AI. Cualquier afirmación al respecto sería especulativa y, por tanto, se omite.

## Capacidades

- Generación de texto y conversación multi-turno (pipeline `text-generation`, tag `conversational`).
- Razonamiento y respuesta a instrucciones, heredadas del modelo Qwen3.5 4B subyacente (no verificado en la información disponible).
- Ejecución acelerada en NPU de AMD Ryzen AI mediante el stack RAI 1.9.0.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas a inglés según el tag de idioma (`en`).
- Capacidades especiales (thinking mode, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Asistentes locales en portátiles con Ryzen AI: el modelo puede ejecutarse en la NPU integrada, liberando CPU y GPU para otras tareas y reduciendo el consumo energético en escenarios de productividad offline.
- Procesamiento de texto en el borde (edge computing): adecuado para aplicaciones que requieren inferencia de LLM sin conexión a la nube, como resumen de documentos o clasificación de texto en equipos de sobremesa con NPU.
- Chatbots de escritorio integrados en aplicaciones: al ser un modelo de 4B, permite respuestas conversacionales con latencia baja en hardware de consumo, útil para asistentes embebidos en herramientas de escritorio.
- Prototipado de pipelines de IA generativa en entornos AMD: sirve como base para desarrolladores que quieran validar flujos de inferencia ONNX sobre Ryzen AI antes de escalar a modelos mayores.
- Generación de texto asistida en IDE o editores: con 4B parámetros y ejecución en NPU, puede emplearse para autocompletado o generación de documentación en local, aunque la falta de datos de contexto y licencia del modelo base debe verificarse.
- Investigación en eficiencia energética: útil para medir el rendimiento por vatio de LLMs en NPU frente a GPU/CPU en la misma máquina, dado el empaquetado específico para Ryzen AI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- NPU: requiere un procesador AMD Ryzen AI compatible con el stack Ryzen AI 1.9.0 (modelo empaquetado específicamente para NPU).
- VRAM/RAM: el repositorio ocupa 7,3 GB; se desconoce el tamaño exacto de los pesos ONNX y si hay variantes cuantizadas. Como referencia, un modelo de 4B en FP16 ocupa aproximadamente 8 GB, pero no se confirma el formato de precisión en esta distribución.
- GPU recomendadas: no aplica para la ruta NPU; para ejecución en GPU no se dispone de información.
- ¿Cabe en GPU de consumo? No disponible; el artefacto está orientado a NPU, no a CUDA.
- Opciones de despliegue: Ryzen AI (RAI) 1.9.0 con runtime ONNX; otras opciones (vLLM, llama.cpp, Ollama, TGI) no están documentadas para este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| amd/Qwen3.5_4B_rai_1.9.0_npu | 4B | no disponible | apache-2.0 | ONNX para NPU Ryzen AI | Distribución específica de AMD, gated |
| Qwen3.5 4B (original) | 4B | no disponible | no disponible en esta ficha | safetensors / GGUF (según distribución) | Modelo base del que deriva; detalles no verificados |
| Otros LLM 4B para edge (p. ej., Phi-3-mini, Llama 3.2 3B) | 3-4B | 4K-128K según modelo | MIT / Llama license | ONNX, GGUF, etc. | Alternativas genéricas; comparación no verificada en la información disponible |

No se dispone de datos de rendimiento comparativo en la información proporcionada; la comparativa se limita a parámetros, licencia y formato de despliegue.

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar el modelo.
- Idiomas: el tag de idioma indica únicamente inglés (`en`); el rendimiento en castellano no está garantizado.
- Sesgos: no documentados en la información disponible; al heredar el modelo Qwen3.5, pueden persistir sesgos del entrenamiento original.
- Alucinación: riesgo inherente a los LLM; no hay evaluaciones publicadas para esta distribución.
- Licencia: apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5 y del stack Ryzen AI.
- Compatibilidad: el artefacto está atado a la NPU Ryzen AI y a la versión RAI 1.9.0; no es portable a otras plataformas sin conversión adicional.
- Falta de documentación: sin datos de contexto, cuantización ni benchmarks, la evaluación en producción requiere pruebas propias.
- Fecha de creación futura (2026-11-02): conviene verificar la vigencia y el estado del repositorio antes de adoptarlo.

## Enlaces

- Hugging Face: https://huggingface.co/amd/Qwen3.5_4B_rai_1.9.0_npu
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.

# dakerholdings/Qwen3.8-Empero-4B-ridge_4_6_8-mlx

## Resumen

El modelo `dakerholdings/Qwen3.8-Empero-4B-ridge_4_6_8-mlx` es una conversión a formato MLX de una variante destilada del modelo Qwen3.8-4B, desarrollada originalmente por el laboratorio independiente Empero (con sede en Alemania) y posteriormente cuantizada por dakerholdings con una receta mixta denominada `ridge_4_6_8`. Esta receta asigna 4 bits a las capas FFN intermedias, 6 bits a las proyecciones de atención y FFN de los bordes, y 8 bits a los tensores de estado `ssm_alpha` y `ssm_beta`, manteniendo en fp16 las normas, la convolución 1D y otros tensores SSM. El resultado es un modelo de 4.21 mil millones de parámetros que ocupa aproximadamente 3 GB en disco y está pensado para ejecutarse en hardware de consumo, como demuestra el ejemplo de generación en un MacBook Air M1 con un pico de memoria de 3.1 GB.

El modelo se basa en la arquitectura híbrida de la serie Qwen3.8, que combina capas transformer con bloques SSM (Gated DeltaNet), lo que le permite manejar contextos largos con una huella de memoria reducida. Al ser una destilación, conserva las capacidades de razonamiento, function calling y conversación del modelo original, pero con un tamaño mucho menor. Su licencia no está especificada en la ficha de HuggingFace, aunque el modelo base `empero-ai/Qwen3.8-4B` se publica bajo Apache-2.0.

Este modelo es relevante para desarrolladores que necesitan un LLM eficiente y desplegable en entornos con recursos limitados (portátiles, dispositivos edge) sin renunciar a capacidades avanzadas como el razonamiento multi-paso o la integración con herramientas. La cuantización mixta intenta preservar la calidad en los pesos más sensibles, lo que lo convierte en una opción interesante para pruebas de concepto y prototipos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida transformer + SSM (Gated DeltaNet, tipo Qwen3.5/3.8) |
| Parametros totales | 4.21B (según model card; el conteo automático de HF subestima por la cuantización) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Cuantización mixta `ridge_4_6_8`: 4-bit FFN intermedia, 6-bit proyecciones de atención y FFN de bordes, 8-bit `ssm_alpha`/`ssm_beta`; fp16 para normas, `ssm_conv1d`, `ssm_a`, `ssm_dt` |
| Idiomas soportados | No disponible (el modelo base parece estar orientado al inglés) |
| Licencia | No disponible (modelo base: Apache-2.0) |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de la serie Qwen3.8, que extiende el diseño de Qwen3.5 incorporando capas SSM (State Space Models) junto con bloques transformer tradicionales. Los tensores `ssm_alpha`, `ssm_beta`, `ssm_conv1d`, `ssm_a` y `ssm_dt` presentes en la cuantización indican la presencia de un mecanismo de atención lineal o Gated DeltaNet, que reduce el coste computacional en contextos largos. La destilación realizada por Empero parte del modelo Qwen3.8-4B original (probablemente una versión destilada de un modelo mayor) y produce variantes de 9B, 4B y 2B mediante técnicas de distillation con SFT y posiblemente RLHF/DPO, aunque no se proporcionan detalles específicos del proceso.

La conversión a MLX y la cuantización `ridge_4_6_8` son obra de dakerholdings. La política de cuantización asigna más bits a las proyecciones de atención y a los tensores de estado SSM, que son los más sensibles a la pérdida de precisión, mientras que las capas FFN intermedias se cuantizan a 4 bits para ahorrar memoria. El resultado es un modelo con un tamaño medio de 6 bits por peso, pero con una calidad esperada superior a una cuantización uniforme de 6 bits.

## Capacidades

- Generación de texto conversacional y de propósito general.
- Razonamiento multi-paso y resolución de problemas matemáticos (el ejemplo de la raíz cuadrada de 2 muestra una respuesta correcta y bien estructurada).
- Soporte de function calling / tool calling (heredado del modelo base).
- Capacidades de agente y razonamiento encadenado.
- Multilingüe limitado (el modelo base está orientado al inglés, aunque podría funcionar con otros idiomas).
- Soporte de visión (el modelo base está etiquetado como `image-text-to-text`, y la conversión MLX es compatible con `mlx_vlm`), aunque no se proporcionan ejemplos concretos.

## Casos de uso

- Asistente conversacional en dispositivos edge: al ocupar solo 3 GB y requerir ~3.1 GB de RAM, puede ejecutarse en portátiles, mini-PCs o incluso en dispositivos móviles con MLX, ofreciendo respuestas a ~16 tokens/s en un MacBook Air M1.
- Generación de código asistida en entornos sin GPU: su soporte de function calling permite integrarlo en IDEs o pipelines de CI/CD para autocompletar o revisar fragmentos de código, con una latencia aceptable en CPU.
- Chatbot de atención al cliente con contexto largo: la arquitectura híbrida SSM permite manejar conversaciones extensas sin agotar la memoria, ideal para sistemas de soporte con historial prolongado.
- Prototipado rápido de agentes de IA: al ser un modelo pequeño y de código abierto, es adecuado para experimentar con flujos de agente (planificación, uso de herramientas) sin incurrir en costes de API.
- Razonamiento matemático y educativo: el ejemplo de la raíz cuadrada de 2 demuestra capacidad para explicar conceptos matemáticos, útil para tutores automáticos o asistentes de estudio.
- Inferencia en local con privacidad: al ejecutarse íntegramente en el dispositivo, es apropiado para aplicaciones que manejan datos sensibles y no pueden enviar información a la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica de rendimiento es el ejemplo de generación incluido en la model card, que reporta 135 tokens generados a ~16-17 tokens/s con un pico de memoria de 3.135 GB en un MacBook Air con Apple M1. No hay datos comparativos con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: ~3.1 GB (medido en MacBook Air M1 con MLX). En GPU, una cuantización mixta de ~6 bits debería caber en tarjetas con 4 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (RTX 3050, RTX 4060, etc.) o Apple Silicon con 8 GB de RAM unificada.
- Sí cabe en GPUs de consumo: RTX 3060, RTX 4060, GTX 1660 Super, etc., siempre que se use una librería compatible con MLX o se convierta a otro formato (GGUF, etc.).
- Opciones de despliegue: `mlx_lm` y `mlx_vlm` (runtimes soportados oficialmente). También se puede convertir a GGUF para usar con llama.cpp u Ollama, aunque no está garantizado.
- Latencia y throughput estimados: ~16-17 tokens/s en Apple M1 (CPU/GPU unificada). En GPU dedicada se esperaría mayor velocidad, pero no hay datos publicados.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos. Como referencia estructural, se puede comparar con otros modelos densos de ~4B parámetros:

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| dakerholdings/Qwen3.8-Empero-4B-ridge_4_6_8-mlx | 4.21B | No disponible | No disponible (base Apache-2.0) | MLX (safetensors) |
| Qwen2.5-3B | 3.09B | 32K | Apache-2.0 | Transformers, GGUF |
| Llama-3.2-3B | 3.21B | 128K | Llama 3.2 Community | Transformers, GGUF |
| Phi-3.5-mini | 3.82B | 128K | MIT | Transformers, GGUF |

La principal diferencia es que este modelo incorpora una arquitectura híbrida SSM, lo que puede ofrecer mejor eficiencia en contextos largos que los transformers puros, aunque no hay benchmarks que lo confirmen.

## Limitaciones y advertencias

- No se han publicado resultados de benchmarks, por lo que la calidad real en tareas estándar es desconocida.
- La licencia no está especificada en la ficha de HuggingFace; aunque el modelo base es Apache-2.0, la conversión y cuantización podrían tener restricciones adicionales. Se recomienda contactar con el autor antes de un uso comercial.
- El modelo está orientado principalmente al inglés; el rendimiento en otros idiomas puede ser inferior.
- Al ser un modelo pequeño (4B), puede presentar alucinaciones y errores en tareas complejas o de conocimiento factual.
- La cuantización mixta puede degradar la calidad en comparación con el modelo original en precisión completa, especialmente en tareas que requieren matemáticas precisas.
- No se proporcionan detalles sobre el dataset de entrenamiento de la destilación, lo que dificulta evaluar posibles sesgos.
- El soporte de visión no está documentado con ejemplos; solo se infiere de la etiqueta `image-text-to-text` del modelo base.

## Enlaces

- [HuggingFace - dakerholdings/Qwen3.8-Empero-4B-ridge_4_6_8-mlx](https://huggingface.co/dakerholdings/Qwen3.8-Empero-4B-ridge_4_6_8-mlx)
- [HuggingFace - empero-ai/Qwen3.8-4B (modelo base)](https://huggingface.co/empero-ai/Qwen3.8-4B)
- [Empero - sitio oficial del laboratorio](https://empero.org/)
- [GitHub - QwenLM/Qwen3.8 (serie de modelos)](https://github.com/QwenLM/Qwen3.8)

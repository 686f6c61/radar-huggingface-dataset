# nm-testing/convert_awq_w4a16_asym-e2e

## Resumen

Este repositorio contiene una versión cuantizada con AWQ (Activation-aware Weight Quantization) en 4 bits del modelo Qwen2.5-0.5B-Instruct, desarrollado por Alibaba Cloud. La cuantización reduce el tamaño del modelo a aproximadamente 0,7 GB, manteniendo la mayor parte de las capacidades del modelo original, lo que permite su despliegue en entornos con recursos limitados, como GPUs de consumo o incluso CPU. El modelo está pensado para tareas de generación de texto y chat, con soporte de contexto largo de hasta 32 768 tokens.

La arquitectura es un transformer causal con 24 capas, atención GQA (14 cabezas de consulta y 2 de clave/valor), RoPE, SwiGLU y RMSNorm, con embeddings atados. El modelo base fue pre-entrenado y ajustado con instrucciones, y esta versión concreta es una conversión de prueba (e2e) realizada por el usuario nm-testing, no un lanzamiento oficial de Qwen. A pesar de su pequeño tamaño (0,5B parámetros), ofrece capacidades de razonamiento, código y matemáticas mejoradas respecto a la generación anterior, según la documentación de Qwen2.5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (RoPE, SwiGLU, RMSNorm, GQA, embeddings atados) |
| Parametros totales | 630 167 424 (según safetensors; la model card indica 0,49B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32 768 tokens (generación de hasta 8192 tokens) |
| Tipos de cuantizacion | AWQ 4-bit (w4a16 asimétrico) |
| Idiomas soportados | Inglés (declarado en la model card; el modelo base Qwen2.5 soporta 29 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con formato AWQ) |

## Arquitectura y entrenamiento

El modelo es una versión cuantizada de Qwen2.5-0.5B-Instruct, que sigue la arquitectura estándar de los modelos Qwen2.5: transformer causal con 24 capas, atención de consulta agrupada (GQA) con 14 cabezas de consulta y 2 de clave/valor, normalización RMSNorm, activación SwiGLU y embeddings de palabras atados. La cuantización AWQ se aplicó sobre los pesos del modelo original, utilizando un proceso de calibración que ajusta factores de escala para minimizar la pérdida de precisión en los pesos más relevantes. No se dispone de información detallada sobre el dataset de entrenamiento del modelo base en la documentación proporcionada; solo se referencia el blog oficial de Qwen2.5, que menciona mejoras en conocimiento, codificación y matemáticas, así como un ajuste fino con instrucciones.

## Capacidades

- Generación de texto y chat conversacional, con soporte de plantillas de chat mediante `apply_chat_template`.
- Razonamiento y comprensión de instrucciones, con mejoras significativas en el seguimiento de instrucciones y generación de texto largo (más de 8K tokens).
- Generación de código y resolución de problemas matemáticos, gracias a las mejoras de la serie Qwen2.5.
- Comprensión de datos estructurados (tablas) y generación de salidas estructuradas, especialmente JSON.
- Soporte de contexto largo de hasta 32 768 tokens, útil para documentos extensos o conversaciones multi-turno.
- Capacidades multilingües del modelo base (29 idiomas), aunque la model card de este repositorio solo declara inglés.
- No se menciona explícitamente soporte de tool calling o function calling en la model card, pero el modelo base Qwen2.5-Instruct lo incluye; se recomienda verificar con la documentación oficial.

## Casos de uso

- Chatbots ligeros para atención al cliente: el modelo puede gestionar conversaciones multi-turno con contexto de hasta 32K tokens, adecuado para sistemas de soporte en tiempo real con requisitos de baja latencia y recursos limitados.
- Generación de código en entornos de desarrollo integrado (IDE) o pipelines de CI/CD: su tamaño reducido permite ejecutarlo en máquinas sin GPU dedicada, ofreciendo autocompletado o sugerencias de código.
- Clasificación y extracción de información en documentos: gracias a su capacidad de entender datos estructurados y generar JSON, puede usarse para parsear facturas, formularios o correos electrónicos.
- Asistentes de escritura y corrección: el modelo puede redactar, resumir o reformular textos en inglés, con un consumo de memoria muy bajo.
- Prototipado rápido de aplicaciones de IA: al ser pequeño y cuantizado, es ideal para pruebas de concepto en entornos de desarrollo sin infraestructura costosa.
- Inferencia en dispositivos edge o móviles: con un tamaño de ~0,7 GB, puede desplegarse en dispositivos con poca memoria, como Raspberry Pi o smartphones, para tareas de generación de texto offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card referencia el blog de Qwen2.5 y la documentación de benchmarks de cuantización, pero no se incluyen cifras concretas en este repositorio.

## Requisitos de hardware

- VRAM estimada: con cuantización 4-bit, los pesos ocupan aproximadamente 0,35 GB (630M parámetros × 0,5 bytes/parámetro), más overhead de activaciones y KV cache. Se puede ejecutar en GPUs con 2 GB de VRAM o menos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como NVIDIA GTX 1650, RTX 2060, o incluso integradas modernas. También es viable en CPU con llama.cpp.
- Compatibilidad con GPU de consumo: sí, cabe en la mayoría de GPUs de consumo actuales.
- Opciones de despliegue: vLLM, Hugging Face TGI, llama.cpp, Ollama, o directamente con `transformers` (cargando el modelo con `device_map="auto"`).
- Latencia y throughput: no se dispone de datos medidos en la información proporcionada; al ser un modelo pequeño, se espera una latencia baja (del orden de decenas de milisegundos por token en GPU), pero no se puede cuantificar sin pruebas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Cuantización | Notas |
|---|---|---|---|---|---|
| Qwen2.5-0.5B-Instruct (este repo) | 0,63B (safetensors) | 32K | Apache 2.0 | AWQ 4-bit | Modelo pequeño, multilingüe, con mejoras en código y matemáticas |
| Llama-3.2-1B | 1,23B | 128K | Llama 3.2 (uso comercial permitido) | No cuantizado (disponible en GGUF) | Más grande, contexto mayor, pero requiere más recursos |
| Gemma-2-2B | 2,6B | 8K | Gemma (uso comercial permitido) | No cuantizado | Más capaz en razonamiento, pero mayor huella de memoria |
| Qwen2.5-1.5B-Instruct | 1,54B | 32K | Apache 2.0 | No cuantizado | Versión superior de la misma familia, con más parámetros |

No se dispone de datos de rendimiento comparativo (benchmarks) en la información proporcionada, por lo que la comparación se limita a características técnicas.

## Limitaciones y advertencias

- Al ser un modelo de solo 0,5B parámetros, su capacidad de razonamiento complejo y conocimiento factual es limitada en comparación con modelos más grandes; puede producir respuestas superficiales o incorrectas en tareas avanzadas.
- La cuantización AWQ 4-bit puede introducir una ligera degradación en la precisión respecto al modelo original en bfloat16, especialmente en tareas de matemáticas o código.
- El idioma declarado en la model card es inglés; aunque el modelo base es multilingüe, no se garantiza un rendimiento óptimo en otros idiomas en esta versión cuantizada.
- Riesgo de alucinaciones: como cualquier modelo de lenguaje, puede generar información falsa o inventada, especialmente en dominios especializados.
- Este repositorio es una conversión de prueba (e2e) realizada por un usuario no oficial; no está respaldado por el equipo de Qwen y puede contener errores de conversión o falta de mantenimiento.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base Qwen2.5 para asegurar el cumplimiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/nm-testing/convert_awq_w4a16_asym-e2e
- Repositorio relacionado (w4a16_asym_awq-e2e): https://huggingface.co/nm-testing/w4a16_asym_awq-e2e
- Documentación de AWQ (GitHub mit-han-lab/llm-awq): https://github.com/mit-han-lab/llm-awq
- Ejemplo de AWQ en llm-compressor: https://github.com/vllm-project/llm-compressor/blob/main/examples/awq/README.md
- Blog oficial de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- Documentación de Qwen (cuantización y benchmarks): https://qwen.readthedocs.io/en/latest/

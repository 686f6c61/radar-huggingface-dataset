# reaperdoesntknow/Qwen3.5-2B-CyberSec-GGUF

## Resumen

El modelo `reaperdoesntknow/Qwen3.5-2B-CyberSec-GGUF` es una exportación en formato GGUF del checkpoint de ciberseguridad `Qwen3.5-2B-CyberSec`, desarrollado por el usuario reaperdoesntknow. El checkpoint original se construyó a partir del modelo base `unsloth/Qwen3.5-2B` (perteneciente a la serie Qwen3.5 de Alibaba Cloud) y se ajustó con el dataset de instrucciones de ciberseguridad de Trendyol. Su propósito declarado es la evaluación cualitativa local y la experimentación en CPU o GPU de consumo, centrada en tareas conversacionales y de ciberseguridad.

El modelo tiene aproximadamente 1,94 mil millones de parámetros (1.942.653.248) y se distribuye en cuatro archivos GGUF: BF16 (3,90 GB), Q8_0 (2,08 GB), Q4_K_M (1,31 GB) y un proyector multimodal BF16. La licencia es Apache-2.0. No se han publicado resultados de benchmarks ni informes de seguridad con esta versión, y el soporte multimodal no está verificado documentalmente. La relevancia actual radica en ofrecer un modelo compacto y cuantizado para ejecución local en el ámbito de la ciberseguridad, con un coste de hardware reducido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (basado en Qwen3.5-2B, presumiblemente transformer denso) |
| Parametros totales | 1.942.653.248 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q4_K_M |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna del modelo. Se sabe que el checkpoint base es `unsloth/Qwen3.5-2B`, perteneciente a la serie Qwen3.5 de Alibaba Cloud, que según fuentes externas (Qualcomm AI Hub) es una familia de modelos multilingües con mejoras en razonamiento e instrucción respecto a Qwen3. El entrenamiento del checkpoint de ciberseguridad se realizó con el dataset `Trendyol-Cybersecurity-Instruction-Tuning-Dataset`, utilizando las librerías Unsloth y TRL de Hugging Face, lo que permitió un entrenamiento aproximadamente 2 veces más rápido (según FriendliAI). No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas como RLHF o DPO.

El archivo GGUF incluye un proyector multimodal (`BF16-mmproj.gguf`) que sugiere la presencia de componentes de visión en la configuración del modelo fuente, pero la model card advierte explícitamente que no se ha documentado una prueba de humo multimodal y que se debe verificar la compatibilidad antes de asumir soporte de visión.

## Capacidades

- Generación de texto conversacional orientado a ciberseguridad, basado en el dataset de instrucciones de Trendyol.
- Manejo de instrucciones y preguntas relacionadas con seguridad informática, análisis de vulnerabilidades y buenas prácticas.
- Posible soporte multimodal (visión) mediante el proyector incluido, aunque no verificado ni documentado.
- Ejecución local en CPU o GPU de consumo gracias a la cuantización GGUF.
- Compatible con runtimes basados en llama.cpp (llama-cli, Ollama, etc.).
- No se menciona soporte de tool calling, function calling ni capacidades de agente en la información disponible.

## Casos de uso

- Evaluación local de calidad del checkpoint de ciberseguridad: permite comparar las salidas de las distintas cuantizaciones (BF16, Q8_0, Q4_K_M) para decidir el equilibrio entre fidelidad y uso de recursos.
- Experimentación en entornos aislados: investigadores pueden probar el comportamiento del modelo en escenarios de ciberseguridad sin depender de APIs externas, gracias a su pequeño tamaño y compatibilidad con llama.cpp.
- Generación de informes de análisis de seguridad: el modelo puede redactar resúmenes o explicaciones sobre hallazgos de seguridad, aunque sus salidas deben ser revisadas por expertos.
- Asistente conversacional de concienciación en seguridad: útil para entornos educativos donde se expliquen conceptos de ciberseguridad a usuarios no técnicos.
- Pruebas de concepto en sistemas con recursos limitados: al caber en GPUs de consumo (incluso con 4 GB de VRAM en cuantización Q4_K_M), es adecuado para prototipos en edge computing o dispositivos embebidos.
- Comparación de rendimiento entre cuantizaciones: los desarrolladores pueden medir el impacto de la cuantización en la calidad de las respuestas para decidir qué archivo usar en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay informes de evaluación de rendimiento ni de seguridad asociados a esta versión GGUF. Por tanto, no se proporcionan tablas comparativas.

## Requisitos de hardware

- VRAM estimada para inferencia: según el archivo GGUF, el Q4_K_M (1,31 GB) puede ejecutarse en GPUs con al menos 2-4 GB de VRAM; el Q8_0 (2,08 GB) requiere unos 3-4 GB; el BF16 (3,90 GB) necesita unos 5-6 GB. Estas cifras son orientativas y dependen del runtime y del contexto.
- GPU recomendadas: cualquier GPU consumer moderna con 4 GB o más de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 4060) puede manejar las cuantizaciones más ligeras. Para BF16 se recomienda al menos 6 GB (RTX 3060 o superior).
- Compatibilidad con CPU: al ser GGUF, puede ejecutarse en CPU con llama.cpp, aunque con mayor latencia.
- Opciones de despliegue: llama.cpp (llama-cli), Ollama, y cualquier runtime compatible con GGUF (llama-cpp-python, etc.). También es posible usar TGI si soporta GGUF, aunque no está confirmado.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos en la información proporcionada. El modelo pertenece a la categoría de LLMs de ~2B parámetros cuantizados para ciberseguridad, pero no se han publicado comparaciones con alternativas como Qwen2.5-1.5B, Llama-3.2-1B u otros modelos especializados en seguridad. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- La cuantización puede alterar la calidad y el comportamiento del modelo respecto al checkpoint original en BF16.
- No se han publicado informes de seguridad, evaluación de sesgos ni pruebas de robustez para esta versión.
- Las instrucciones de seguridad generadas pueden ser incorrectas, inseguras o de doble uso (dual use); no deben ejecutarse sin revisión y aislamiento.
- El modelo no debe utilizarse como control de seguridad autoritativo ni como tomador de decisiones en entornos de producción.
- El soporte multimodal (visión) no está verificado; se debe probar la compatibilidad del proyector, el formato de prompt, la versión del runtime y la ruta de imagen antes de asumir dicha capacidad.
- No se especifican los idiomas soportados; la información disponible no permite confirmar cobertura multilingüe.
- La licencia Apache-2.0 permite uso comercial, pero el modelo deriva de Qwen3.5 (cuyos términos de uso pueden tener restricciones adicionales) y del dataset de Trendyol; se recomienda revisar las licencias de los componentes upstream.

## Enlaces

- [Repositorio HuggingFace del modelo GGUF](https://huggingface.co/reaperdoesntknow/Qwen3.5-2B-CyberSec-GGUF)
- [Checkpoint fuente (Qwen3.5-2B-CyberSec)](https://huggingface.co/reaperdoesntknow/Qwen3.5-2B-CyberSec)
- [Modelo base registrado (unsloth/Qwen3.5-2B)](https://huggingface.co/unsloth/Qwen3.5-2B)
- [Dataset de ciberseguridad de Trendyol](https://huggingface.co/datasets/Trendyol/Trendyol-Cybersecurity-Instruction-Tuning-Dataset)
- [Colección CIx de modelos de ciberseguridad](https://huggingface.co/collections/reaperdoesntknow/cix-cybersecurity-models)
- [Página del modelo en Qualcomm AI Hub (Qwen3.5-2B)](https://aihub.qualcomm.com/compute/models/qwen3_5_2b)
- [Artículo de HackerNoon sobre un modelo derivado de Qwen3.5-2B](https://hackernoon.com/qwen35-2b-distills-opus-reasoning-into-a-tiny-gguf-model)

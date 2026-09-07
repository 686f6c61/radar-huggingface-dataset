# liodon-ai/Qwen2.5-Coder-3B-Instruct-FP8

## Resumen

`Qwen2.5-Coder-3B-Instruct-FP8` es una cuantización FP8 dinámica del modelo `Qwen/Qwen2.5-Coder-3B-Instruct`, publicada por Liodon AI. El objetivo es reducir el tamaño de los pesos de 6.2 GB a 3.4 GB manteniendo las capacidades de generación de código y conversación del modelo original. Está diseñado para ejecutarse de forma eficiente en GPUs NVIDIA modernas con soporte de cómputo FP8 (compute capability >= 8.9), y es compatible con vLLM, Text Generation Inference (TGI) y SGLang.

El modelo base es un Transformer decoder-only de 3.09 mil millones de parámetros, especializado en tareas de programación. La cuantización utiliza el esquema `FP8_DYNAMIC` de `llm-compressor`: los pesos se convierten a FP8 (E4M3) por canal de forma estática, mientras que las activaciones se cuantizan dinámicamente por token en tiempo de inferencia. Al no requerir dataset de calibración, los pesos cuantizados son numéricamente una conversión directa de los originales, lo que evita sesgos derivados de la calibración. El `lm_head` se mantiene sin cuantizar para preservar la calidad de la salida.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parámetros totales | 3.085.938.688 (3.09B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | FP8 (E4M3) dinámico; `lm_head` sin cuantizar |
| Idiomas soportados | No disponible |
| Licencia | other |
| Formato de pesos | safetensors (compressed-tensors FP8) |

## Arquitectura y entrenamiento

El modelo base es `Qwen2.5-Coder-3B-Instruct`, un Transformer decoder-only de 3.09 mil millones de parámetros entrenado para tareas de programación. La cuantización aplicada por Liodon AI no altera la arquitectura: solo transforma la representación de los pesos a FP8 con el esquema `FP8_DYNAMIC`. Los pesos se convierten a FP8 (E4M3) por canal, mientras que las activaciones se cuantizan a FP8 de forma dinámica por token durante la inferencia. Este esquema no necesita dataset de calibración, por lo que no introduce sesgos adicionales respecto al modelo original. El `lm_head` se deja sin cuantizar porque su tamaño es despreciable y su cuantización tendría un impacto desproporcionado en la calidad. El resultado es un modelo de 3.4 GB en disco, frente a los 6.2 GB del original.

## Capacidades

- Generación de texto y código: al estar basado en `Qwen2.5-Coder-3B-Instruct`, es capaz de responder instrucciones en formato conversacional y generar código.
- Inferencia eficiente en FP8: aprovecha el hardware NVIDIA con compute capability >= 8.9 para reducir el uso de VRAM y acelerar la generación en comparación con los pesos FP16.
- Compatibilidad con múltiples servidores de inferencia: vLLM, Text Generation Inference (TGI) y SGLang pueden cargarlo directamente.
- Despliegue mediante la librería `transformers`: permite usarlo en entornos que no requieran optimizaciones específicas.
- Sin capacidades multimodales: procesa exclusivamente texto.

## Casos de uso

- Asistente de programación en IDE: puede integrarse en extensiones como Continue para autocompletar código, explicar fragmentos y responder preguntas técnicas en tiempo real.
- Chat de código en terminal: se despliega como servidor local con TGI o vLLM y se conecta a un cliente CLI para consultas rápidas de programación.
- Automatización en CI/CD: se utiliza para generar pruebas unitarias, revisar cambios propuestos o crear documentación automática en pipelines de integración continua, gracias a su baja latencia.
- Generación de documentación técnica: puede producir comentarios, docstrings y READMEs a partir de código fuente, reduciendo el trabajo manual en repositorios.
- Tutor de programación: en plataformas de aprendizaje, puede responder preguntas de estudiantes y proporcionar ejemplos de código corregidos en tiempo real.
- Prototipado en entornos con GPU limitada: al caber en aproximadamente 4-6 GB de VRAM, es viable en GPUs de consumo como una RTX 4060 o en instancias cloud pequeñas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 4 y 6 GB para ejecución FP8 nativa con vLLM o TGI, incluyendo pesos, activaciones y KV cache.
- GPU recomendadas: cualquier NVIDIA con compute capability >= 8.9, como RTX 40-series, L4/L40S, H100/H200, B100/B200 o GB10.
- Consumer GPU: el modelo cabe en RTX 4060, RTX 4070 y superiores. En GPUs con compute capability inferior a 8.9, los motores de inferencia descuantizan los pesos a FP16/BF16, perdiendo los beneficios de velocidad y memoria.
- Opciones de despliegue: vLLM, Text Generation Inference (TGI), SGLang y la librería `transformers`.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Tamaño | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-Coder-3B-Instruct (base) | 3.09B | No disponible | other | 6.2 GB (FP16) | HuggingFace |
| Qwen2.5-Coder-3B-Instruct-FP8 | 3.09B | No disponible | other | 3.4 GB (FP8) | HuggingFace |

No se dispone de datos de otros modelos comparables en la información proporcionada. La comparación natural es con el modelo base sin cuantizar, que comparte arquitectura y parámetros, pero requiere el doble de espacio y no aprovecha las ventajas de FP8.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible.
- Riesgo de alucinación: inherente a los modelos de lenguaje; debe validarse la salida en aplicaciones de producción.
- Limitaciones de idioma: no se especifican los idiomas soportados, por lo que el rendimiento fuera de inglés o chino no está garantizado.
- Restricciones de licencia: la licencia se indica como `other`; es necesario revisar los términos exactos antes de un uso comercial.
- Requisitos de hardware: la ejecución FP8 nativa solo es posible en GPUs con compute capability >= 8.9. En hardware más antiguo se descuantiza y se pierden las ventajas.
- La cuantización puede introducir una ligera degradación en la precisión respecto al modelo original, aunque el esquema `FP8_DYNAMIC` minimiza el impacto al no usar calibración.

## Enlaces

- Modelo cuantizado: https://huggingface.co/liodon-ai/Qwen2.5-Coder-3B-Instruct-FP8
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct

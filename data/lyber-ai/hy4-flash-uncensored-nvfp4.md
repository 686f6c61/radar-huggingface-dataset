# lyber-ai/Hy4-flash-UNCENSORED-NVFP4

## Resumen

Hy4-flash-UNCENSORED-NVFP4 es una versión cuantizada y sin censura (uncensored) del modelo Tencent/Hy4-flash, publicada por el usuario lyber-ai en Hugging Face. Se trata de un modelo de generación de texto con arquitectura Mixture-of-Experts (MoE) de 152.767.005.094 parámetros totales, derivado del modelo base de Tencent Hunyuan, y cuantizado a NVFP4 con la técnica W4A16 (pesos de 4 bits, activaciones de 16 bits) mediante ModelOpt. El resultado es un checkpoint de aproximadamente 218,8 GB en formato safetensors, pensado para inferencia con transformers.

El modelo conserva las capacidades del base: razonamiento, tool calling, conversación multi-turno y soporte multilingüe en inglés, chino, español, francés, japonés, coreano y ruso. La modificación "uncensored" implica la eliminación o relajación de los filtros de rechazo y alineamiento de seguridad del modelo original, lo que lo orienta a usos de investigación y entornos controlados donde se requiere generar contenido sin restricciones de rechazo.

Su relevancia es doble: por un lado, demuestra la viabilidad de cuantizar un MoE de más de 150.000 millones de parámetros a 4 bits manteniendo el formato de pesos para transformers; por otro, al ser un modelo gated con licencia tencent-hunyuan, su uso comercial queda sujeto a los términos del modelo base. La información pública disponible es escasa y no se han publicado benchmarks propios de esta variante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE), transformer; tag hy_v4_flash |
| Parametros totales | 152.767.005.094 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (W4A16), pesos de 4 bits con activaciones de 16 bits; tag 8-bit en el repo |
| Idiomas soportados | en, zh, es, fr, ja, ko, ru |
| Licencia | tencent-hunyuan (other); acceso gated |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es una variante del Tencent/Hy4-flash, un transformer con arquitectura Mixture-of-Experts (MoE) identificado por el tag hy_v4_flash y la familia Hunyuan. El checkpoint publicado no es un entrenamiento nuevo, sino un finetune/cuantización del modelo base: los pesos se han convertido a NVFP4 mediante ModelOpt con esquema W4A16, es decir, pesos de 4 bits y activaciones de 16 bits, lo que reduce el tamaño del repositorio a 218,8 GB frente a los aproximadamente 305 GB que ocuparían los pesos en BF16 para 152.767 millones de parámetros. El tag 8-bit del repositorio sugiere además algún componente o metadato de cuantización de 8 bits, aunque la designación principal es NVFP4.

La modificación "uncensored" indica un ajuste fino orientado a eliminar los comportamientos de rechazo del modelo base, presumiblemente mediante entrenamiento supervisado o DPO sobre datos sin filtrar. No se dispone de información pública sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicó RLHF adicional en esta variante. Tampoco se han publicado detalles sobre innovaciones técnicas específicas de esta versión más allá de la cuantización NVFP4.

## Capacidades

- Generación de texto conversacional multi-turno en siete idiomas (en, zh, es, fr, ja, ko, ru).
- Razonamiento explícito (tag reasoning en el repositorio).
- Tool calling y function calling, según los tags del modelo.
- Soporte de agentes y razonamiento multi-paso, heredado del modelo base.
- Generación de contenido sin filtros de rechazo (variante uncensored).
- Compatibilidad con endpoints (tag endpoints_compatible).
- Capacidades de código y matemáticas: no confirmadas explícitamente en la información disponible, aunque plausibles en un modelo de esta familia.

## Casos de uso

- Investigación sobre alineamiento y seguridad: el modelo permite estudiar el comportamiento de un LLM sin filtros de rechazo y compararlo con el base para analizar qué tipos de contenido se bloquean y por qué, en un entorno de laboratorio controlado.
- Generación de datos sintéticos para entrenamiento: al no rechazar peticiones, puede producir datasets de instrucciones y respuestas en dominios sensibles (ficción, debates, escenarios hipotéticos) que otros modelos censuran, siempre que se cumplan los términos de la licencia.
- Evaluación de cuantización NVFP4: sirve como banco de pruebas para medir la pérdida de calidad de un MoE de 152.000 millones de parámetros al pasar a 4 bits, comparando salidas con el modelo base en BF16.
- Despliegue de agentes con tool calling: el modelo puede integrarse en pipelines de agentes que necesitan invocar funciones externas y mantener contexto conversacional largo, aprovechando el soporte multilingüe para usuarios en español, francés, japonés, coreano y ruso.
- Atención al cliente en entornos internos: para empresas que acepten los términos de la licencia Hunyuan, el modelo puede gestionar conversaciones multi-turno en varios idiomas sin las restricciones de rechazo que interrumpen flujos legítimos.
- Redacción creativa y role-play: útil en aplicaciones de ficción interactiva o narrativa donde los filtros de seguridad del modelo base degradan la experiencia, con la advertencia de que el contenido generado no está moderado.
- Prototipado de asistentes multilingües: los siete idiomas soportados permiten construir demos de asistentes para mercados asiáticos y europeos con un único checkpoint.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 218,8 GB en NVFP4; se necesita al menos esa cantidad de memoria de GPU para cargar los pesos completos en una sola máquina, más overhead de activaciones y KV cache.
- GPU recomendadas: configuraciones multi-GPU de clase数据中心 como 4× H100 80 GB, 8× A100 80 GB o 4× H200 141 GB; una sola GPU consumer no es suficiente.
- GPU consumer: no cabe en ninguna GPU consumer actual (RTX 4090 con 24 GB, RTX 5090 con 32 GB) sin offloading a CPU/RAM, lo que degradaría severamente el throughput.
- Opciones de despliegue: transformers (librería declarada en el repositorio); compatibilidad con vLLM, llama.cpp, Ollama o TGI no confirmada para el formato NVFP4.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| lyber-ai/Hy4-flash-UNCENSORED-NVFP4 | 152.767.005.094 | no disponible | tencent-hunyuan (gated) | safetensors NVFP4 | Variante uncensored cuantizada |
| tencent/Hy4-flash | no disponible | no disponible | tencent-hunyuan | safetensors (BF16 presumiblemente) | Modelo base original, con filtros de seguridad |
| Alternativas MoE de escala similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada |

## Limitaciones y advertencias

- La variante uncensored elimina los filtros de rechazo, por lo que puede generar contenido ofensivo, peligroso o ilegal; no es apta para aplicaciones de cara al público sin moderación externa.
- Riesgo elevado de alucinación: no se han publicado evaluaciones de fidelidad factual para esta variante.
- La cuantización NVFP4 W4A16 puede degradar la calidad respecto al modelo base en tareas de razonamiento fino, código y matemáticas; no hay benchmarks que lo cuantifiquen.
- Licencia tencent-hunyuan: el uso comercial está sujeto a los términos del modelo base de Tencent, que pueden incluir restricciones de redistribución y de uso; es necesario revisarlos antes de producción.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que limita la reproducibilidad y la distribución automatizada.
- Longitud de contexto y número de parámetros activos no disponibles, lo que impide dimensionar con precisión los requisitos de memoria para contextos largos.
- Idiomas: aunque soporta siete idiomas, la calidad relativa por idioma no está documentada; el español figura entre los soportados, pero sin evaluaciones públicas.
- El tag 8-bit junto a NVFP4 sugiere posibles inconsistencias en los metadatos del repositorio; conviene verificar la configuración de cuantización antes de desplegar.

## Enlaces

- [Hugging Face: lyber-ai/Hy4-flash-UNCENSORED-NVFP4](https://huggingface.co/lyber-ai/Hy4-flash-UNCENSORED-NVFP4)
- [Modelo base: tencent/Hy4-flash](https://huggingface.co/tencent/Hy4-flash)

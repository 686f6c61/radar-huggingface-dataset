# FrancescoArno94/Qwen3-1.7B-dpo-ultrafeedback_binarized-16bit-gguf

## Resumen

Qwen3-1.7B-dpo-ultrafeedback_binarized-16bit-gguf es un ajuste fino (fine-tuning) del modelo Qwen3-1.7B de Alibaba, publicado por el usuario FrancescoArno94 en Hugging Face. El nombre indica que se ha aplicado un entrenamiento con DPO (Direct Preference Optimization) sobre el dataset UltraFeedback binarized, un corpus de preferencias ampliamente utilizado para alinear modelos conversacionales, y que el resultado se ha convertido a formato GGUF de 16 bits para su uso con llama.cpp.

El modelo parte de la arquitectura Qwen3, un transformer denso de aproximadamente 1.720 millones de parámetros (1.7B). Al estar empaquetado en GGUF F16, el peso del repositorio es de unos 3,4 GB, lo que lo hace manejable en hardware de consumo. El ajuste se realizó con la librería Unsloth, que acelera el entrenamiento y la conversión a GGUF.

La relevancia de esta ficha es limitada pero concreta: se trata de un experimento de alineación sobre un modelo pequeño de la familia Qwen3, orientado a despliegue local mediante llama.cpp. No hay información publicada sobre evaluación, licencia explícita ni idiomas soportados más allá de lo que hereda del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3) |
| Parametros totales | 1.720.574.976 (1,7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16 (GGUF de 16 bits) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (F16) |
| Tamano del repositorio | 3,4 GB |
| Pipeline | no disponible |
| Herramienta de entrenamiento | Unsloth |
| Metodo de alineacion | DPO sobre UltraFeedback binarized |

## Arquitectura y entrenamiento

El modelo base es Qwen3-1.7B, un transformer denso de la familia Qwen3 desarrollada por Alibaba. Sobre esa base se aplicó un ajuste fino con DPO (Direct Preference Optimization) utilizando el dataset UltraFeedback en su variante binarized, que contiene pares de respuestas preferidas y rechazadas para alinear el comportamiento del modelo hacia respuestas más útiles y menos dañinas. El entrenamiento y la conversión a GGUF se realizaron con Unsloth, que optimiza el uso de memoria y acelera el proceso.

No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset más allá del nombre, ni si se aplicaron etapas adicionales de RLHF o SFT. Tampoco hay datos sobre innovaciones técnicas específicas (decodificación especulativa, atención lineal, etc.) más allá de las que herede del modelo base Qwen3, que no se detallan en la información proporcionada.

## Capacidades

- Generación de texto conversacional en formato chat (el repositorio está etiquetado como "conversational").
- Razonamiento y respuesta a instrucciones, presumiblemente mejorados por el ajuste DPO sobre UltraFeedback.
- Uso con llama.cpp mediante `llama-cli` con la opción `--jinja` para plantillas de chat.
- Compatibilidad declarada con endpoints (tag "endpoints_compatible").
- Capacidades multilingües: no disponibles explícitamente, aunque se heredan del modelo base Qwen3.
- Soporte de tool calling / function calling: no disponible en la información.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Despliegue local en estaciones de trabajo: al ser un GGUF F16 de 1,7B, puede ejecutarse con llama.cpp en CPU o GPU de consumo para prototipos de asistentes conversacionales sin depender de la nube.
- Experimentación con alineación DPO: sirve como caso de estudio reproducible para comparar el comportamiento del Qwen3-1.7B base frente a la versión ajustada con UltraFeedback binarized.
- Chatbot de bajo coste en entornos con recursos limitados: el tamaño del modelo permite inferencia en GPUs de gama media o incluso CPU, adecuado para demos y pruebas internas.
- Integración en pipelines de llama.cpp: el formato GGUF y la compatibilidad con `--jinja` facilitan su uso en herramientas que ya consumen modelos GGUF (por ejemplo, servidores compatibles con la API de llama.cpp).
- Evaluación de calidad de respuestas: útil para probar si el ajuste DPO mejora la utilidad percibida en tareas de instrucción simples antes de escalar a modelos mayores.
- Base para nuevos ajustes: al ser un checkpoint pequeño y abierto en formato GGUF, puede servir como punto de partida para fine-tunes posteriores con Unsloth u otras herramientas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en F16: aproximadamente 3,4 GB solo para los pesos, más overhead de contexto y KV cache; en la práctica, entre 4 y 6 GB según longitud de contexto y backend.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM para F16 (por ejemplo, RTX 3060, RTX 4060, RTX 4090); también puede ejecutarse en CPU con llama.cpp.
- Cabe en GPU de consumo: sí, en modelos con 6 GB o más de VRAM en F16; con cuantizaciones menores (no incluidas en este repo) cabría en GPUs de 4 GB.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), y herramientas compatibles con GGUF como Ollama o LM Studio (previa importación del archivo).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-1.7B-dpo-ultrafeedback_binarized-16bit-gguf | 1,7B | no disponible | GGUF F16 | no disponible | Hugging Face |
| Qwen3-1.7B (base) | 1,7B | no disponible | safetensors / GGUF | no disponible | Hugging Face |
| Otros fine-tunes DPO de modelos pequeños (p. ej. variantes de Qwen2.5-1.5B) | ~1,5B | no disponible | GGUF / safetensors | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo ni de especificaciones de contexto para establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar si el uso comercial está permitido; conviene verificar la licencia del modelo base Qwen3 antes de usarlo en producción.
- Sin benchmarks publicados: no hay evidencia cuantitativa de que el ajuste DPO mejore al modelo base en tareas concretas.
- Riesgo de alucinación inherente a modelos de 1,7B, especialmente en dominios especializados.
- Idiomas soportados no declarados: el rendimiento multilingüe no está garantizado más allá de lo que herede del modelo base.
- Longitud de contexto no documentada en esta ficha; debe consultarse la del modelo Qwen3-1.7B original.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni evidencia de uso en producción.
- Solo se ofrece cuantización F16, lo que limita el despliegue en hardware muy restringido sin reconvertir a otras cuantizaciones.
- El ajuste DPO sobre UltraFeedback binarized puede introducir sesgos de estilo o preferencias del dataset que no estén documentados.

## Enlaces

- Hugging Face: https://huggingface.co/FrancescoArno94/Qwen3-1.7B-dpo-ultrafeedback_binarized-16bit-gguf
- Unsloth (herramienta de entrenamiento y conversión): https://github.com/unslothai/unsloth
- llama.cpp (runtime recomendado por la model card): no disponible en la información proporcionada como enlace directo, pero referenciado en las instrucciones de uso.

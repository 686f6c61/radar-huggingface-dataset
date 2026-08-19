# orcarouter/Qwen3.8-27B-Uncensored-FP8

## Resumen

El modelo `orcarouter/Qwen3.8-27B-Uncensored-FP8` es una variante modificada y cuantizada del modelo base Qwen/Qwen3.8-27B, desarrollado por el usuario de HuggingFace `orcarouter`. Se trata de un modelo de visión-lenguaje (image-text-to-text) de arquitectura densa que incorpora capacidades de razonamiento, function calling y control de pensamiento flexible. La versión "uncensored" implica un proceso de abliteration, es decir, la eliminación de los mecanismos de rechazo del modelo original, lo que lo hace especialmente interesante para tareas de red-teaming y evaluación de seguridad.

La cuantización en FP8 (block-FP8) reduce el tamaño del modelo a 30,9 GB, manteniendo un contexto de 256K tokens según la documentación de Unsloth. El modelo está pensado para despliegue eficiente en GPUs modernas como H200, RTX PRO 6000 o RTX 5090, y es compatible con motores de inferencia como vLLM y SGLang. Su licencia Apache 2.0 permite uso comercial, aunque el acceso está restringido en HuggingFace y requiere aceptación de condiciones.

La relevancia de este modelo radica en su doble vertiente: por un lado, ofrece las capacidades multimodales y de razonamiento del Qwen3.8-27B en un formato FP8 optimizado; por otro, al eliminar las restricciones de contenido, se convierte en una herramienta valiosa para investigadores que estudian los límites de los modelos de lenguaje y desarrollan técnicas de alineación más robustas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dense hybrid GDN vision-language model (según documentación de SGLang) |
| Parametros totales | 27.781.427.952 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 256K tokens (según Unsloth) |
| Tipos de cuantizacion | FP8 (block-FP8) |
| Idiomas soportados | Inglés, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (FP8) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un modelo denso híbrido que combina atención estándar con mecanismos de visión, diseñado para procesar tanto texto como imágenes y vídeos. Según la documentación de SGLang, se describe como "dense hybrid GDN vision-language model", aunque no se especifican los detalles exactos de la arquitectura interna (número de capas, dimensiones, etc.). La variante FP8 ha sido cuantizada con block-FP8, un esquema que agrupa los pesos en bloques para reducir la pérdida de precisión.

El proceso de abliteration aplicado sobre el modelo base elimina los "refusals" (negativas a responder) mediante la modificación de los pesos, de modo que el modelo responde a cualquier consulta sin filtros de seguridad. No se dispone de información sobre el dataset de entrenamiento original, el número de tokens procesados ni si se utilizaron técnicas como RLHF o DPO en el modelo base. La cuantización FP8 y la abliteration son modificaciones posteriores que no requieren reentrenamiento, sino ajuste de pesos.

## Capacidades

- Procesamiento multimodal: entiende imágenes y vídeos además de texto, lo que permite tareas de visión-lenguaje como descripción de imágenes, respuesta a preguntas visuales o razonamiento sobre contenido multimedia.
- Razonamiento multi-paso: el modelo está diseñado para llevar a cabo tareas complejas que requieren varios pasos de razonamiento, con control flexible sobre el "modo pensamiento" (thinking mode).
- Function calling: soporta invocación de herramientas externas, lo que lo hace apto para integraciones en agentes y pipelines automatizados.
- Conversacional: capacidad de mantener diálogos multi-turno con contexto largo gracias a su ventana de 256K tokens.
- Multilingüe: soporte para inglés y chino, con posible degradación en otros idiomas.
- Sin restricciones de contenido: debido a la abliteration, no rechaza peticiones sobre temas sensibles, violencia, contenido ilegal, etc. Esto es una capacidad técnica, no una recomendación de uso.

## Casos de uso

- Red-teaming y auditoría de seguridad: el modelo puede usarse para generar respuestas sin filtros que permitan identificar vulnerabilidades en sistemas de moderación o en otros modelos. Los equipos de seguridad pueden emplearlo para probar la robustez de sus propios filtros de contenido.
- Investigación en alineación de IA: al eliminar los rechazos, los investigadores pueden estudiar qué comportamientos emergen cuando un modelo no tiene restricciones, y así diseñar mejores técnicas de alineación y control.
- Evaluación de sesgos y toxicidad: útil para generar contenido extremo o controvertido de forma controlada, con el fin de medir métricas de toxicidad o sesgo en datasets de prueba.
- Prototipado de agentes multimodales: gracias a su capacidad de visión y function calling, puede integrarse en prototipos de asistentes que necesiten interpretar capturas de pantalla, imágenes o vídeos y ejecutar acciones mediante herramientas.
- Despliegue en entornos con recursos limitados: la cuantización FP8 reduce el uso de VRAM a unos 30 GB, lo que permite ejecutarlo en GPUs de gama alta consumer (RTX 5090) o profesionales (RTX PRO 6000) sin necesidad de hardware de centro de datos.
- Generación de contenido creativo sin restricciones: para proyectos artísticos o de ficción que requieran explorar temas tabú o controvertidos, siempre que se cumplan las leyes locales y las condiciones de uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para la variante `orcarouter/Qwen3.8-27B-Uncensored-FP8` en la información disponible. Los datos de rendimiento del modelo base Qwen3.8-27B (como MMLU, HumanEval o GSM8K) no se han facilitado en las fuentes consultadas, por lo que no es posible ofrecer una tabla comparativa fiable. Se recomienda consultar la documentación oficial de Qwen para obtener métricas del modelo original y asumir que la cuantización FP8 puede introducir una degradación mínima (típicamente inferior al 1% en la mayoría de tareas).

## Requisitos de hardware

- VRAM estimada: el tamaño del repositorio es de 30,9 GB, por lo que se necesitan al menos 32 GB de VRAM para cargar el modelo en FP8 sin offloading. Con cuantizaciones adicionales (por ejemplo, GGUF Q4) el requisito baja a unos 17 GB, según Unsloth.
- GPUs recomendadas: H200 (141 GB), RTX PRO 6000 (48 GB), RTX 5090 (32 GB) y DGX Spark (según documentación de SGLang). También es compatible con GPUs AMD Ryzen AI Max y Radeon según el blog de AMD.
- Consumo en consumer GPU: cabe en RTX 4090 (24 GB) solo si se aplica una cuantización más agresiva (por ejemplo, 4 bits), pero no en FP8 completo. En RTX 5090 (32 GB) sí es posible cargar el modelo FP8 completo.
- Opciones de despliegue: vLLM (indicado en los tags), SGLang, Unsloth (con soporte para GGUF y NVFP4), LM Studio (para hardware AMD) y TGI.
- Latencia y throughput: no disponibles en las fuentes consultadas. Dependerá de la GPU, el batch size y el motor de inferencia utilizado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Cuantización | Notas |
|---|---|---|---|---|---|
| Qwen/Qwen3.8-27B (base) | 27,8B | 256K | Apache 2.0 | BF16, FP8, NVFP4 | Modelo original con filtros de seguridad |
| orcarouter/Qwen3.8-27B-Uncensored-FP8 | 27,8B | 256K | Apache 2.0 | FP8 | Versión abliterada y cuantizada |
| Qwen3.8-2.4T-A95B (MoE) | 2,4T total, 95B activos | 256K | Apache 2.0 | BF16, FP8 | Versión MoE de mayor tamaño, no comparable en recursos |

La comparativa directa con otros modelos abliterados (por ejemplo, versiones de Llama-3) no está disponible en la información proporcionada. La principal diferencia frente al modelo base es la eliminación de los rechazos y la cuantización FP8, que reduce el tamaño de 55 GB (BF16) a 30,9 GB.

## Limitaciones y advertencias

- Contenido sin filtrar: al ser "uncensored", el modelo puede generar texto dañino, ilegal, violento, sexualmente explícito o que promueva actividades peligrosas. No debe utilizarse en aplicaciones orientadas al público general sin un sistema de moderación externo robusto.
- Acceso restringido: el repositorio está marcado como "gated", lo que significa que los usuarios deben solicitar acceso y aceptar condiciones adicionales antes de descargar los pesos.
- Idiomas limitados: solo se garantiza soporte para inglés y chino. Otros idiomas pueden producir respuestas de menor calidad o alucinaciones.
- Riesgo de alucinaciones: como todos los modelos de lenguaje, puede inventar información, especialmente en tareas de razonamiento complejo o cuando se le pide generar contenido sobre temas poco representados en sus datos de entrenamiento.
- Sesgos desconocidos: no se han publicado estudios de sesgo para esta variante concreta. El proceso de abliteration puede amplificar ciertos sesgos presentes en el modelo base.
- Sin garantías de producción: al ser una modificación comunitaria sin respaldo oficial de Qwen, no hay garantías de estabilidad, corrección o soporte a largo plazo. Se recomienda validar exhaustivamente antes de cualquier uso en producción.
- Compatibilidad de cuantización: aunque FP8 es ampliamente soportado por vLLM y SGLang, algunos kernels pueden no estar optimizados para todas las GPUs, lo que podría afectar al rendimiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored-FP8
- Documentación de Qwen3.8 en Unsloth: https://unsloth.ai/docs/models/qwen3.8
- Guía de despliegue con SGLang: https://docs.sglang.io/cookbook/autoregressive/Qwen/Qwen3.8-27B
- Blog de AMD sobre soporte Day 0: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Dataset de referencia en Kaggle: https://www.kaggle.com/datasets/saltb0x/qwen3-8-27b-fp8

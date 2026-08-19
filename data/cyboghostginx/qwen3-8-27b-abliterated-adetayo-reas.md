# cyboghostginx/Qwen3.8-27B-abliterated-Adetayo-reas

## Resumen

El modelo Qwen3.8-27B-abliterated-Adetayo-reas es una versión modificada del modelo Qwen/Qwen3.8-27B, desarrollado por el usuario cyboghostginx. Se trata de una "ablación direccional de rechazo" (directional refusal ablation) aplicada mediante la herramienta Heretic 1.4.0, que busca eliminar o reducir las respuestas de rechazo del modelo original sin recurrir a un fine-tuning tradicional. El resultado es un modelo que responde a peticiones que un instruct estándar declinaría, manteniendo una divergencia KL baja respecto al original (0.0545). Está pensado para investigación sobre direcciones de rechazo, evaluación de seguridad y red teaming.

La arquitectura base es híbrida: combina 48 capas de atención lineal GatedDeltaNet con 16 capas de atención completa (self_attn), sumando 64 capas, e incluye una torre de visión y una cabeza de decodificación especulativa (MTP). El modelo tiene aproximadamente 27.36 mil millones de parámetros y se distribuye en formato safetensors con licencia Apache-2.0. Al ser un modelo de razonamiento, genera cadenas de pensamiento antes de responder.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: 48 capas GatedDeltaNet linear_attn + 16 capas self_attn, más torre de visión y cabeza MTP |
| Parámetros totales | 27.356.728.560 (27,36 mil millones) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en bf16 según verificación) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3.8-27B, cuya arquitectura es híbrida: 48 capas de atención lineal (GatedDeltaNet) y 16 capas de atención completa (self_attn) distribuidas en 64 capas totales, más una torre de visión para procesamiento de imágenes y una cabeza MTP (Multi-Token Prediction) para decodificación especulativa. Esta combinación busca eficiencia computacional sin sacrificar la capacidad de modelado de dependencias a largo plazo.

No se realizó ningún entrenamiento supervisado ni fine-tuning. En su lugar, se aplicó una técnica de ablación direccional de rechazo mediante la herramienta Heretic 1.4.0. El proceso identifica la dirección del rechazo en el flujo residual del modelo y ortogonaliza cada matriz de pesos que escribe en ese flujo contra dicha dirección. Se optimizaron los parámetros de ablación con Optuna, buscando minimizar dos objetivos simultáneamente: la tasa de rechazos restantes y la divergencia KL respecto al modelo original. El resultado seleccionado (trial 63) reduce los rechazos de 98/100 a 24/100 con una divergencia KL de 0.0545. La ablación se aplicó por capa, concentrándose en un rango específico de capas, y afecta a los proyectores de salida de las capas de atención lineal y completa, así como a los proyectores de bajada del MLP. La torre de visión, las capas de normalización y las embeddings quedan intactas.

## Capacidades

- Generación de texto y razonamiento: al ser un modelo de razonamiento, produce cadenas de pensamiento internas antes de dar una respuesta final.
- Procesamiento de imágenes: gracias a la torre de visión integrada, puede recibir entradas de imagen y texto (pipeline image-text-to-text).
- Conversación multi-turno: soporta diálogos conversacionales.
- Respuesta sin rechazo: a diferencia del modelo base, responde a solicitudes que normalmente serían rechazadas por políticas de seguridad, lo que lo hace útil para investigación en seguridad y red teaming.
- Decodificación especulativa: la cabeza MTP permite acelerar la generación al proponer múltiples tokens que son verificados por el modelo principal.
- Multilingüismo: no se especifican idiomas, pero al derivar de Qwen, probablemente soporte varios idiomas, aunque no está confirmado.

## Casos de uso

- Investigación sobre direcciones de rechazo en modelos de lenguaje: el modelo permite estudiar cómo se comporta un modelo sin mecanismos de rechazo, facilitando el análisis de los circuitos internos que generan esas respuestas.
- Evaluación de seguridad y red teaming: se puede utilizar para probar la robustez de sistemas de moderación o para identificar vulnerabilidades en modelos instruct estándar, al comparar las respuestas con y sin ablación.
- Reducción de sobre-rechazo en aplicaciones benignas: en escenarios donde el modelo base rechaza peticiones legítimas por exceso de cautela, esta versión puede ofrecer respuestas más útiles, aunque con el riesgo de perder el filtrado de contenido dañino.
- Generación de contenido creativo sin restricciones: para proyectos de ficción, escritura libre o simulación de personajes donde se requiera evitar censura, siempre bajo responsabilidad del usuario.
- Benchmarking de técnicas de ablación: sirve como referencia para comparar métodos de modificación de comportamiento en modelos grandes, dado que se ha verificado que los deltas son de rango 1 y no hay cambios en el tokenizador.
- Desarrollo de herramientas de análisis de interpretabilidad: al ser una modificación mínima y bien documentada, es útil para estudiar la influencia de capas específicas en el comportamiento del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card únicamente reporta métricas de rechazo y divergencia KL, que se resumen a continuación:

| Métrica | Valor |
|---|---|
| Refusals antes de la ablación | 98/100 |
| Refusals después de la ablación | 24/100 |
| Divergencia KL vs modelo original | 0.05455201119184494 |

Estas cifras indican una reducción significativa de los rechazos, aunque la cuenta se basa en coincidencia de subcadenas como "harmful" o "unethical", por lo que puede sobreestimar la tasa de cumplimiento real. No hay datos sobre rendimiento en tareas de razonamiento, código o matemáticas.

## Requisitos de hardware

- VRAM estimada: con 27,36 mil millones de parámetros en bf16 (2 bytes por parámetro), se necesitan aproximadamente 54,7 GB solo para los pesos. Con overhead de activaciones y memoria intermedia, se recomienda al menos 70-80 GB de VRAM para inferencia sin cuantización.
- GPUs recomendadas: NVIDIA A100 80GB, H100 80GB o A6000 48GB (con cuantización). En GPUs de consumo como RTX 4090 (24 GB) solo sería posible con cuantización a 8 bits o menos, aunque no se han proporcionado pesos cuantizados.
- Opciones de despliegue: al ser un modelo transformers estándar, se puede servir con vLLM, Text Generation Inference (TGI), o mediante la librería transformers directamente. También es compatible con endpoints (endpoints_compatible).
- Latencia y throughput: no disponibles. Dependerán del hardware y de la configuración de decodificación especulativa, que puede acelerar la generación.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar directamente con otros modelos de la misma categoría. El modelo base Qwen3.8-27B sería el punto de referencia natural, pero no se han proporcionado sus especificaciones completas ni benchmarks. Otras versiones "abliterated" de modelos Qwen existen en la comunidad, pero no hay datos públicos de rendimiento comparativo. Por tanto, la comparativa se limita a lo siguiente:

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.8-27B (base) | 27,36B | no disponible | Apache-2.0 | Modelo original con rechazo estándar |
| Qwen3.8-27B-abliterated (este) | 27,36B | no disponible | Apache-2.0 | Sin rechazo, misma arquitectura |

No se recomienda usar este modelo en producción sin una evaluación exhaustiva de riesgos.

## Limitaciones y advertencias

- El modelo ha sido deliberadamente despojado de mecanismos de rechazo, por lo que puede generar contenido dañino, ilegal o poco ético. El autor advierte explícitamente que "el comportamiento de seguridad se ha eliminado sustancialmente".
- La tasa de rechazo residual es del 24%, lo que significa que aún rechaza algunas peticiones, pero no de forma fiable.
- No se han realizado evaluaciones de sesgos, alucinaciones o calidad de generación en tareas estándar. El modelo puede tener los mismos sesgos que el base, agravados por la falta de filtros.
- La longitud de contexto no está documentada; se desconoce el límite real de tokens de entrada.
- Los idiomas soportados no están especificados, aunque probablemente herede el multilingüismo de Qwen, pero sin confirmación.
- La licencia Apache-2.0 permite uso comercial, pero el autor declina responsabilidad sobre el uso indebido. Se recomienda revisar la licencia del modelo base.
- Al ser un modelo de razonamiento, la generación puede ser más lenta si no se usa la cabeza MTP adecuadamente.
- No se proporcionan pesos cuantizados, lo que limita su despliegue en hardware de gama media.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/cyboghostginx/Qwen3.8-27B-abliterated-Adetayo-reas)
- [Modelo base Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Heretic (herramienta de ablación)](https://github.com/p-e-w/heretic)

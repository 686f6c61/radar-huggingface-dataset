# Kelvin000010191/Syrus-1B-SFT-v2

## Resumen

Syrus-1B-SFT-v2 es un modelo de lenguaje publicado en HuggingFace por el usuario Kelvin000010191 (Kelvin Tepes), con acceso restringido (gated) y sin model card pública más allá de los metadatos del repositorio. Los pesos en safetensors suman 1.720.574.976 parámetros, es decir, 1,72 mil millones, pese a que el nombre comercial del checkpoint indica "1B". La etiqueta `qwen3` del repositorio apunta a una arquitectura de la familia Qwen 3, aunque no hay confirmación oficial en la información disponible.

El sufijo "SFT" sugiere un ajuste supervisado (supervised fine-tuning) sobre un modelo base, y "v2" indica una segunda revisión del checkpoint. No se han publicado datos sobre el conjunto de entrenamiento, el número de tokens, la longitud de contexto ni la licencia, lo que limita seriamente cualquier evaluación de producción.

Su relevancia potencial reside en el segmento de modelos pequeños (1-2B) desplegables en hardware de consumo, pero en el momento de redactar esta ficha el modelo cuenta con 17 descargas y 1 like, no tiene pipeline declarado y su licencia es desconocida. Se trata, por tanto, de un checkpoint experimental dentro de un ecosistema personal de modelos (Vanessa-1B, Syrus-1B-DPO, Krypton-1) más que de un modelo listo para adopción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (la etiqueta `qwen3` sugiere arquitectura transformer densa de la familia Qwen 3, sin confirmar) |
| Parametros totales | 1.720.574.976 (1,72B), según safetensors |
| Parametros activos | No aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio solo declara safetensors; no se listan GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 69,4 GB |
| Acceso | Restringido (gated): requiere aceptar condiciones en HuggingFace |
| Pipeline declarado | No disponible |
| Fecha de creacion | 21 de octubre de 2026 |
| Ultima actualizacion | 23 de octubre de 2026 |
| Descargas / likes | 17 / 1 |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura en la información disponible. El único indicio es la etiqueta `qwen3` del repositorio, que sugiere que el checkpoint deriva de un modelo Qwen 3, y el recuento de parámetros (1,72B) es coherente con el tamaño del Qwen3-1.7B denso. El nombre "SFT" indica que se ha aplicado un ajuste supervisado sobre un modelo base, pero se desconoce el dataset, el número de tokens de entrenamiento, la composición de los datos y si hubo etapas posteriores de alineación (RLHF, DPO u otras).

Tampoco hay información sobre innovaciones técnicas (atención lineal, decodificación especulativa, modos de razonamiento explícito) ni sobre la tokenización o el vocabulario. Un dato relevante para la trazabilidad: el repositorio ocupa 69,4 GB, aproximadamente veinte veces el tamaño de los pesos en bf16 de un modelo de 1,72B (unos 3,4 GB), lo que sugiere la presencia de múltiples checkpoints, estados de optimizador u otros artefactos de entrenamiento en el mismo repositorio. Conviene verificar la estructura de archivos antes de descargar.

## Capacidades

- Generación de texto: capacidad esperable por tratarse de un modelo de lenguaje, pero no documentada ni verificada en la información disponible.
- Razonamiento y matemáticas: no disponible.
- Generación de código: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Ajuste supervisado: el nombre del checkpoint indica una etapa de SFT, sin detalle sobre la tarea o el estilo de las respuestas resultantes.

## Casos de uso

Dado que no hay evaluación publicada, los siguientes escenarios son hipótesis de uso razonables por tamaño y formato, y requieren validación empírica antes de cualquier despliegue:

- Prototipado local de asistentes conversacionales: con 1,72B de parámetros, el modelo puede ejecutarse en una GPU de consumo con cuantización de 4 bits, lo que lo hace adecuado para pruebas de concepto en estaciones de trabajo sin aceleradores de datacenter.
- Experimentación académica con SFT: al ser un checkpoint ajustado, sirve como punto de partida para estudiar el efecto del fine-tuning supervisado frente a su modelo base, siempre que se confirme la licencia.
- Evaluación comparativa de checkpoints de la misma familia: permite contrastar Syrus-1B-SFT-v2 con Syrus-1B-DPO y con el modelo base para medir el impacto de cada etapa de alineación.
- Generación de datos sintéticos a pequeña escala: un modelo de 1,72B puede producir borradores de texto para filtrado y curación posterior en pipelines de datos, con revisión humana obligatoria por el riesgo de alucinación.
- Tareas de extracción y clasificación tras fine-tuning específico: el tamaño reducido permite reentrenar el modelo completo con presupuesto modesto en una sola GPU.
- Despliegue en entornos con restricciones de VRAM: escenarios de edge computing o servicios con GPUs de 8-16 GB donde un modelo mayor no cabe, sujeto a verificar latencia y calidad.
- Base para investigación en seguridad y alineación: útil para estudiar comportamientos de modelos pequeños ajustados sin documentación pública de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos de MMLU, HumanEval, GSM8K, MT-Bench ni de evaluaciones multilingües para este checkpoint, y el autor no ha publicado métricas en la información accesible.

## Requisitos de hardware

Estimaciones derivadas del recuento de parámetros (1,72B), no verificadas experimentalmente:

- VRAM para inferencia en bf16/fp16: unos 3,4 GB solo de pesos; con caché KV y overhead, entre 5 y 6 GB.
- VRAM en int8: aproximadamente 1,7 GB de pesos, en torno a 2,5-3,5 GB en total.
- VRAM en int4: aproximadamente 0,9 GB de pesos, en torno a 1,5-2,5 GB en total.
- GPU de consumo: cabe holgadamente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090 en cualquiera de las precisiones indicadas; también en GPUs de 8 GB con cuantización.
- GPU de datacenter: A100, H100 y L40S no son necesarias para inferencia; solo tendrían sentido para reentrenamiento del modelo completo o para servir muchas réplicas.
- Almacenamiento: el repositorio ocupa 69,4 GB, muy por encima de los pesos en bf16, por lo que hay que prever espacio en disco y revisar qué artefactos contiene.
- Opciones de despliegue: no hay confirmación de compatibilidad con vLLM, TGI, llama.cpp u Ollama, y no se publican ficheros GGUF. Al ser safetensors con etiqueta `qwen3`, es probable que funcione con librerías que soporten dicha arquitectura (Transformers, vLLM), pero requiere verificación.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

Los datos de los modelos comparables provienen de sus fichas públicas; los del modelo analizado son "no disponible" salvo parámetros y formato.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Benchmarks publicos |
|---|---|---|---|---|---|
| Syrus-1B-SFT-v2 | 1,72B | No disponible | No disponible | Gated en HuggingFace | No disponible |
| Qwen3-1.7B | 1,7B | 32.768 tokens (extensible) | Apache 2.0 | Abierta | Amplia documentación |
| Llama 3.2 1B | 1,24B | 128.000 tokens | Licencia comunitaria Llama 3.2 | Gated en HuggingFace y Meta | Amplia documentación |
| Gemma 3 1B | 1B | 32.000 tokens | Terminos de uso de Gemma | Abierta | Amplia documentación |

La diferencia principal no está en el tamaño, sino en la trazabilidad: los tres modelos de referencia publican licencia, idiomas y evaluaciones, mientras que Syrus-1B-SFT-v2 no ofrece ninguno de esos datos. Para cualquier uso en producción, los modelos comparables presentan menor riesgo legal y técnico.

## Limitaciones y advertencias

- Licencia no disponible: no se puede determinar si el uso comercial está permitido. Esto bloquea por sí solo cualquier despliegue en producto.
- Acceso restringido: requiere aceptar condiciones en HuggingFace, lo que añade fricción para CI/CD y para la reproducibilidad de experimentos.
- Ausencia total de model card: no hay información sobre datos de entrenamiento, por lo que no se pueden evaluar sesgos, contaminación de benchmarks ni procedencia de los datos.
- Riesgo de alucinación: desconocido y no medido; en un modelo de 1,72B el riesgo suele ser alto, pero no hay evidencia publicada para este checkpoint.
- Limitaciones de contexto e idioma: se desconocen la ventana de contexto y los idiomas cubiertos; no se debe asumir un rendimiento correcto en castellano.
- Discrepancia de nomenclatura: el nombre indica "1B" pero los pesos declaran 1,72B; conviene verificar el checkpoint real antes de dimensionar infraestructura.
- Tamano del repositorio desproporcionado (69,4 GB frente a unos 3,4 GB de pesos en bf16): posible presencia de estados de optimizador u otros artefactos; revisar antes de descargar.
- Sin benchmarks ni evaluaciones de terceros: no hay ninguna señal cuantitativa de calidad frente al modelo base del que deriva.
- Etapa SFT sin documentar: el ajuste supervisado puede haber degradado capacidades del modelo base o introducido sesgos de estilo no deseados.
- Advertencia sobre el ecosistema: el autor publica otros checkpoints (Vanessa-1B, Syrus-1B-DPO, Krypton-1) sin documentación extensa; no hay garantía de mantenimiento ni de soporte.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Kelvin000010191/Syrus-1B-SFT-v2
- Perfil del autor: https://huggingface.co/Kelvin000010191
- Otro checkpoint del autor, Vanessa-1B: https://huggingface.co/Kelvin000010191/Vanessa-1B
- Registro de Syrus-1B-DPO en free2aitools: https://free2aitools.com/model/kelvin000010191/syrus-1b-dpo
- Lista de modelos de seguridad ofensiva en GitHub (aparece en la búsqueda, sin relación confirmada con este modelo): https://github.com/JoasASantos/Offensive-Security-AI-Models
- Paper, blog o demo oficial: no disponible

# satishsggcbc/avika-sovereign-v9

## Resumen

Avika Sovereign v9 es un modelo de lenguaje de razonamiento desarrollado desde cero por Satish Kumar (usuario `satishsggcbc` en Hugging Face), presentado como una arquitectura "100% soberana" e independiente de los transformers convencionales. El modelo combina 12 capas Mamba-2 SSD con 4 capas MLA (Multi-head Latent Attention) intercaladas en una proporción 3:1, e incorpora un esquema de recurrencia de 28 pasos de ejecución y un motor matemático basado en Program-Aided Language (PAL) con aritmética de precisión arbitraria.

Con 97.348.224 parámetros físicos y 30.993.024 parámetros activos por token, se sitúa en la categoría de modelos pequeños (sub-100M), lo que lo hace potencialmente desplegable en hardware de consumo. Su relevancia radica en la exploración de arquitecturas híbridas SSM/attention con recurrencia explícita para tareas de razonamiento, un enfoque poco común en modelos de este tamaño.

No obstante, la información pública disponible es extremadamente limitada: el repositorio tiene 0 descargas y 0 likes, no se especifican idiomas soportados, no hay resultados de benchmarks publicados y la model card se limita a una descripción arquitectónica de alto nivel.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 12 capas Mamba-2 SSD + 4 capas MLA intercaladas (3:1), con mHC de 2 flujos |
| Parametros totales | 97.348.224 (físicos) |
| Parametros activos | 30.993.024 por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (tamaño del repo: 0.4 GB) |

## Arquitectura y entrenamiento

La arquitectura es híbrida y se aparta del transformer estándar: intercala 12 capas Mamba-2 SSD (State Space Model con descomposición semiseparable) con 4 capas MLA (Multi-head Latent Attention) en una proporción 3:1. Incorpora además un esquema de "mHC de 2 flujos" (multi-head communication, presumiblemente) y un mecanismo de recurrencia con 28 pasos de ejecución ("recurrent unroll execution steps"), lo que sugiere que el modelo reutiliza bloques o estados internos de forma iterativa para aumentar la profundidad efectiva sin incrementar el número de parámetros físicos.

El modelo incluye un motor matemático nativo basado en Program-Aided Language (PAL) con aritmética de precisión arbitraria, lo que implica que el razonamiento matemático se delega a la generación y ejecución de programas auxiliares en lugar de depender exclusivamente de la computación neuronal. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste por instrucciones.

## Capacidades

- Generación de texto y razonamiento multi-paso mediante recurrencia explícita (28 pasos de ejecución).
- Razonamiento matemático con motor PAL y aritmética de precisión arbitraria.
- Procesamiento de secuencias mediante capas SSM (Mamba-2), potencialmente eficiente en contextos largos.
- Capacidades multilingües: no disponibles.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes: no disponible explícitamente, aunque la recurrencia y el motor PAL apuntan a razonamiento multi-paso.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Razonamiento matemático asistido por programa: el motor PAL permite resolver problemas aritméticos de alta precisión generando y ejecutando código auxiliar, útil en entornos educativos o de cálculo simbólico.
- Experimentación en arquitecturas híbridas SSM/attention: investigadores pueden usar el modelo como banco de pruebas para estudiar el comportamiento de Mamba-2 combinado con MLA en tareas de razonamiento.
- Prototipado en hardware de consumo: con 97M de parámetros físicos y 0.4 GB de repo, es viable ejecutarlo en GPU domésticas para pruebas de concepto.
- Investigación sobre recurrencia en LLMs: los 28 pasos de unroll permiten estudiar el efecto de la profundidad efectiva frente a la profundidad física en modelos pequeños.
- Generación de texto en entornos con recursos limitados: su tamaño reducido facilita el despliegue en dispositivos edge, siempre que se valide su calidad.
- Base para fine-tuning experimental: la licencia Apache 2.0 permite adaptarlo y redistribuirlo en proyectos de investigación aplicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 97M de parámetros físicos, en FP16 requeriría aproximadamente 0,2 GB de pesos; en FP32, unos 0,4 GB. Añadiendo overhead de activaciones y estados SSM, es razonable estimar menos de 2 GB en la mayoría de configuraciones, aunque no hay datos oficiales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM debería ser suficiente; se desconoce si el modelo requiere kernels específicos para Mamba-2.
- Cabe en GPU de consumo: previsiblemente sí (RTX 3060, RTX 4060, RTX 4090, etc.), sujeto a la disponibilidad de kernels compatibles.
- Opciones de despliegue: no disponible. La presencia de capas Mamba-2 puede requerir librerías específicas (por ejemplo, `mamba-ssm`) y no es seguro que sea compatible con vLLM, llama.cpp u Ollama sin conversión previa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Avika Sovereign v9 | 97,3M físicos / 31,0M activos | no disponible | Híbrida Mamba-2 + MLA con recurrencia | Apache 2.0 | Hugging Face (0 descargas) |
| Mamba-2 (referencia) | ~130M | 2K–8K típico | SSM puro | Apache 2.0 | Público |
| Phi-1.5 | 1,3B | 2K | Transformer | MIT | Público |
| TinyLlama | 1,1B | 2K | Transformer | Apache 2.0 | Público |

La comparación es orientativa: no existen datos de rendimiento publicados para Avika Sovereign v9 que permitan una comparación cuantitativa con estas alternativas.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no es posible evaluar su calidad frente a alternativas.
- Modelo con 0 descargas y 0 likes: sin validación por parte de la comunidad.
- Idiomas soportados no especificados: riesgo de comportamiento deficiente fuera del idioma de entrenamiento (desconocido).
- Longitud de contexto no documentada: no apto para producción en tareas que requieran ventanas largas sin validación previa.
- Riesgo de alucinación: inherente a modelos de este tamaño, agravado por la falta de datos de evaluación.
- Compatibilidad de despliegue incierta: las capas Mamba-2 pueden requerir toolchains específicas y no está claro que funcione con los runners estándar.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte.
- Fecha de creación futura (2026-11-07) en los metadatos: posible inconsistencia que conviene verificar antes de confiar en el repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/satishsggcbc/avika-sovereign-v9
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.

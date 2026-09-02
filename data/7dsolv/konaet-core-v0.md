# 7dsolv/Konaet-Core-v0

## Resumen

Konaet-Core-v0 es un modelo de lenguaje experimental desarrollado por el autor 7dsolv bajo la marca Konaet. Se trata de una fundación neural creada completamente desde cero, sin utilizar modelos base, pesos importados, vocabularios externos, destilación ni respuestas de profesor. Con aproximadamente 17,8 millones de parámetros, esta versión inicial tiene como objetivo validar la arquitectura propuesta y no está preparada para uso general.

El modelo incorpora tres innovaciones arquitectónicas principales: memoria acumulativa causal, convolución local multiescala y puertas de lectura/escritura. Está orientado al idioma portugués (pt) y se distribuye bajo una licencia personalizada ("other"). Su relevancia radica en ser un intento de construir un modelo de lenguaje desde cero con un diseño propio, aunque su estado actual es puramente experimental y carece de documentación pública sobre rendimiento o capacidades concretas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Memoria acumulativa causal, convolución local multiescala, puertas de lectura/escritura (detalles completos no disponibles) |
| Parametros totales | 17.841.408 |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Portugués (pt) |
| Licencia | other (personalizada, no especificada) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura de Konaet-Core-v0 se describe en la model card como un núcleo que utiliza memoria acumulativa causal, convolución local multiescala y puertas de lectura/escritura. No se proporcionan detalles adicionales sobre la implementación exacta, el número de capas, la dimensionalidad o el mecanismo de atención. El modelo fue entrenado desde cero, sin emplear modelos base, destilación ni datos de profesor, lo que sugiere un enfoque de entrenamiento autónomo, aunque no se especifican el volumen de datos, el número de tokens ni el proceso de optimización (RLHF, DPO, etc.). Tampoco se indica si se utilizó alguna técnica de regularización o ajuste fino posterior.

## Capacidades

- Generación de texto: al ser un modelo de lenguaje, se espera que pueda generar texto en portugués, aunque no se han documentado capacidades específicas.
- Razonamiento: no hay información disponible sobre habilidades de razonamiento o matemáticas.
- Código: no se menciona soporte para generación de código.
- Tool calling / function calling: no disponible.
- Soporte para agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: solo se declara portugués (pt).
- Capacidades especiales (visión, audio, thinking mode): no disponibles.

Dado el carácter experimental y el tamaño reducido del modelo, es probable que sus capacidades sean muy limitadas, pero no se dispone de datos objetivos para confirmarlo.

## Casos de uso

- Investigación académica en arquitecturas de modelos de lenguaje: el modelo puede servir como banco de pruebas para estudiar el comportamiento de la memoria acumulativa causal y la convolución local multiescala en tareas de generación de texto a pequeña escala.
- Validación de técnicas de entrenamiento desde cero: investigadores interesados en entrenar modelos sin dependencia de pesos preentrenados pueden analizar este ejemplo como referencia metodológica.
- Experimentación en entornos con recursos mínimos: al tener solo 17,8 millones de parámetros, es viable ejecutarlo en CPU o GPUs de gama baja, lo que permite probar hipótesis sin grandes inversiones.
- Estudio de la influencia del idioma en modelos pequeños: al estar enfocado en portugués, puede utilizarse para analizar cómo se comporta un modelo entrenado desde cero en un idioma distinto al inglés.
- Desarrollo de técnicas de interpretabilidad: su tamaño reducido facilita el análisis de los mecanismos internos de atención y memoria, útil para investigar la causalidad en modelos generativos.
- Comparación con modelos destilados o preentrenados: permite contrastar el rendimiento de un modelo "puro" frente a otros que usan destilación o transferencia, aunque no hay benchmarks públicos para ello.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos sobre MMLU, HumanEval, GSM8K ni otras métricas estándar. Tampoco se ofrecen comparaciones con modelos similares.

## Requisitos de hardware

- VRAM estimada: con 17,8 millones de parámetros, el modelo en precisión FP32 ocupa aproximadamente 71 MB (17.841.408 × 4 bytes). En FP16 serían unos 36 MB. Cabe en cualquier GPU moderna, incluso en las integradas.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; también puede ejecutarse en CPU.
- Compatibilidad con GPU de consumo: sí, cualquier GPU de consumo (RTX 2060, RTX 3060, etc.) puede ejecutarlo sin problemas.
- Opciones de despliegue: al estar en formato safetensors, puede cargarse con bibliotecas como Transformers o llama.cpp (si se convierte a GGUF). No se menciona soporte para vLLM, Ollama o TGI, pero por su tamaño sería trivial.
- Latencia y throughput: no hay datos publicados, pero en una GPU moderna la generación sería extremadamente rápida (del orden de miles de tokens por segundo) debido al pequeño número de parámetros.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (modelos desde cero de ~18M parámetros). No hay datos suficientes para establecer una comparativa objetiva con alternativas como GPT-2 pequeño (124M) o modelos tipo TinyStories, ya que Konaet-Core-v0 no tiene benchmarks publicados ni documentación técnica detallada.

## Limitaciones y advertencias

- Modelo experimental: la propia model card indica que esta versión sirve para validar la arquitectura y no está lista para uso general.
- Sin documentación de rendimiento: no hay benchmarks, evaluaciones de sesgo ni análisis de alucinaciones.
- Riesgo de alucinación: al ser un modelo pequeño entrenado desde cero, es probable que genere texto incoherente o factualmente incorrecto, aunque no hay datos que lo confirmen.
- Licencia restrictiva: la licencia "other" no especifica términos de uso; se recomienda consultar el archivo `foundation_provenance.json` antes de cualquier uso, como advierte el autor.
- Idioma limitado: solo portugués, sin soporte multilingüe.
- Sin garantías de producción: no es adecuado para aplicaciones comerciales o críticas.
- Falta de transparencia: no se detallan los datos de entrenamiento, el proceso de optimización ni los hiperparámetros.

## Enlaces

- HuggingFace: https://huggingface.co/7dsolv/Konaet-Core-v0
- GitHub del autor (repositorio konaet-os, relacionado con el mismo proyecto): https://github.com/7dsolv/konaet-os/tree/main
- Perfil de GitHub del autor: https://github.com/7dsolv/7dsolv

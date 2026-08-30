# karen2225484488484/GAPTI

## Resumen

GAPTI es un modelo de lenguaje ligero diseñado específicamente para la generación de texto en persa (farsi). Desarrollado por el usuario karen2225484488484, se presenta como una solución para inferencia local con recursos mínimos, empleando una arquitectura recurrente basada en GRU de dos capas. Con menos de un millón de parámetros (953.004) y un vocabulario reducido de 684 tokens, GAPTI está pensado para entornos donde los modelos grandes no son viables, como dispositivos embebidos o sistemas con limitaciones de memoria. Su licencia Apache 2.0 permite uso comercial y modificación sin restricciones significativas. La relevancia actual radica en la creciente demanda de modelos pequeños y eficientes para lenguas de baja representación, aunque sus capacidades son deliberadamente limitadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GRU de 2 capas |
| Parametros totales | 953.004 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP32 e INT8 (formatos de peso) |
| Idiomas soportados | Persa (fa) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (se mencionan tensores, pero no el formato exacto) |

## Arquitectura y entrenamiento

GAPTI emplea una arquitectura de red neuronal recurrente (RNN) basada en GRU (Gated Recurrent Unit) con dos capas. La dimensión de embedding es de 128 y la dimensión oculta de 256, con un vocabulario de 684 tokens. El modelo tiene 21 tensores de pesos, disponibles en precisión FP32 e INT8. No se proporciona información sobre el proceso de entrenamiento: ni el tamaño del corpus, ni el número de tokens, ni la metodología (por ejemplo, si se usó RLHF o DPO). La implementación de inferencia se describe como "libre de NumPy", lo que sugiere una implementación en Python puro o con dependencias mínimas, facilitando su ejecución en entornos sin bibliotecas de cálculo numérico pesadas.

## Capacidades

- Generación de texto en persa: el modelo es capaz de producir texto en este idioma, aunque con limitaciones evidentes por su tamaño.
- Inferencia local: al ser extremadamente pequeño, puede ejecutarse en CPU sin necesidad de GPU, incluso en dispositivos con poca memoria.
- Pesos en FP32 e INT8: ofrece flexibilidad para balancear precisión y uso de memoria.
- Implementación sin NumPy: facilita el despliegue en entornos minimalistas o con restricciones de dependencias.
- No se reportan capacidades como tool calling, razonamiento multi-paso, soporte de agentes, ni multimodalidad.

## Casos de uso

- Prototipado rápido en persa: GAPTI puede servir para validar conceptos de generación de texto en persa sin requerir infraestructura compleja, gracias a su bajo coste computacional.
- Educación e investigación: útil para enseñar arquitecturas RNN o experimentar con modelos de lenguaje pequeños en contextos académicos con pocos recursos.
- Generación de texto en entornos embebidos: al ser tan ligero, podría integrarse en dispositivos IoT o aplicaciones móviles de baja gama para tareas simples como autocompletado de frases en persa.
- Pruebas de pipelines de inferencia: su implementación sin NumPy permite probar flujos de trabajo en entornos con restricciones de bibliotecas, como contenedores mínimos o sistemas con Python reducido.
- Generación de datos sintéticos: aunque limitado, puede usarse para crear pequeñas cantidades de texto persa con fines de aumento de datos en otros modelos.
- Aplicaciones educativas de PLN: para demostrar el funcionamiento de modelos recurrentes en tareas de lenguaje natural, dado que su arquitectura es transparente y fácil de inspeccionar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos sobre MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. Dado el tamaño del modelo, es esperable que su rendimiento en tareas complejas sea muy bajo, pero no se dispone de métricas concretas.

## Requisitos de hardware

- Al tener 953.004 parámetros, el modelo ocupa aproximadamente 3,8 MB en FP32 y 1 MB en INT8 (estimación basada en el número de parámetros y el tamaño de cada peso). No se especifican requisitos oficiales.
- Es viable en cualquier CPU moderna, incluso en Raspberry Pi o dispositivos similares, gracias a su tamaño reducido y a la implementación sin NumPy.
- No requiere GPU para inferencia; en caso de usarse, cualquier GPU con más de 1 GB de VRAM sería más que suficiente.
- Opciones de despliegue: al ser un modelo pequeño, puede ejecutarse directamente con el código de inferencia proporcionado en el repositorio. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, pero al ser un modelo con pesos propios, podría adaptarse a estos frameworks si se convierte a formatos compatibles, aunque no hay documentación al respecto.
- Latencia y throughput: no se proporcionan datos, pero por su tamaño, la generación de texto debería ser casi instantánea en CPU.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (modelos de lenguaje persa extremadamente pequeños basados en RNN). Existen modelos más grandes como los de la familia GPT para persa, pero no son directamente comparables por su escala y arquitectura. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un modelo muy pequeño, es propenso a generar respuestas incorrectas, repetitivas o incompletas. La model card advierte explícitamente que sus salidas deben ser revisadas antes de usarse como información factual.
- Cobertura lingüística limitada: su vocabulario de 684 tokens es extremadamente reducido, lo que limita severamente su capacidad para manejar texto persa diverso y complejo.
- Sin contexto largo: no se especifica la longitud de contexto, pero por la arquitectura GRU y el tamaño, es probable que tenga una ventana muy corta (típicamente unas decenas de tokens).
- Sin soporte para tareas avanzadas: no realiza tool calling, razonamiento multi-paso ni comprensión lectora profunda.
- Riesgo en producción: no es recomendable para aplicaciones críticas o que requieran precisión, dado su carácter experimental y sus limitaciones.
- Formato de pesos no estándar: al no especificarse el formato (safetensors, bin, etc.), puede haber dificultades para integrarlo con herramientas estándar del ecosistema.

## Enlaces

- Repositorio de Hugging Face: [karen2225484488484/GAPTI](https://huggingface.co/karen2225484488484/GAPTI)

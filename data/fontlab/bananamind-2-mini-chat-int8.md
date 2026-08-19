# fontlab/BananaMind-2-Mini-Chat-int8

## Resumen

BananaMind-2-Mini-Chat-int8 es una versión cuantizada del modelo BananaMind-2-Mini-Chat, desarrollado por BananaMind y cuantizado por el usuario fontlab para el motor de inferencia bananamend. El modelo base es un pequeño modelo de lenguaje conversacional de 25,2 millones de parámetros, con una ventana de contexto de 4.096 tokens, publicado bajo licencia Apache 2.0. Esta variante int8 reduce el tamaño de los pesos de 100,72 MB a 26,79 MB (3,76 veces más pequeño) mediante una cuantización mixta que combina matrices ternarias y de 8 bits, manteniendo una calidad muy cercana al original.

La relevancia de este modelo reside en su extrema ligereza: puede ejecutarse en hardware muy limitado, como Raspberry Pi, móviles o CPUs sin GPU, lo que lo hace adecuado para prototipos, educación y aplicaciones de chat en el borde. Sin embargo, su capacidad es reducida al tratarse de un modelo de 25M de parámetros, por lo que no compite con modelos de mayor escala en tareas complejas. El formato de pesos es propietario del motor bananamend y no es compatible con transformers, lo que limita su uso a ese ecosistema.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de lenguaje transformer, no confirmado) |
| Parametros totales | 25.571.968 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens (según llmrun.dev para el modelo base) |
| Tipos de cuantizacion | int8 con grupo de 64, mezcla de matrices ternarias y 8-bit |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | bananamend (códigos y escalas, no floats) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base (número de capas, dimensiones, tipo de atención, etc.). Por el tamaño de parámetros (25,2M) se infiere que se trata de un transformer pequeño, probablemente con menos de 10 capas y dimensiones de embedding reducidas, pero este dato no está confirmado en la documentación disponible.

El proceso de cuantización aplicado por fontlab sigue estos pasos documentados en la model card:

1. Calibración con un texto de referencia para registrar las activaciones de cada matriz.
2. Para cada grupo de 64 pesos, se busca el umbral que minimiza el error, usando escalas separadas para pesos positivos y negativos (Ternary Weight Networks con el grid asimétrico de PT2-LLM).
3. Cuantización columna a columna con compensación de error (GPTQ).
4. Medición de cada matriz para decidir cuáles pueden ser ternarias sin degradar significativamente las respuestas, dentro de un presupuesto de cambio total.
5. El resto de matrices se cuantizan a 8 bits.

El resultado es un modelo con 99 matrices de 8 bits y 0 matrices ternarias (según la tabla interna), aunque la descripción menciona que la cuantización es mixta. No hay información sobre el entrenamiento del modelo base (datos, tokens, técnicas de alineación como RLHF o DPO).

## Capacidades

- Generación de texto conversacional: el modelo está diseñado para mantener diálogos multi-turno, como se muestra en los ejemplos de uso con `model.chat()`.
- Respuesta a preguntas simples y tareas de lenguaje básicas.
- Soporte de contexto de hasta 4.096 tokens, suficiente para conversaciones de longitud media.
- Capacidad multilingüe: no disponible (no se especifican idiomas soportados).
- Tool calling, function calling, razonamiento multi-paso, visión o audio: no disponibles (no se mencionan en la documentación).

## Casos de uso

- Asistente conversacional en dispositivos de bajo consumo: el modelo puede ejecutarse en una Raspberry Pi o un smartphone gracias a su tamaño reducido (26,79 MB), ofreciendo un chat básico sin conexión.
- Prototipado rápido de interfaces de chat: los desarrolladores pueden integrarlo en aplicaciones de demostración o pruebas de concepto donde no se requiere alta calidad de lenguaje.
- Educación y aprendizaje: sirve para enseñar conceptos de cuantización, inferencia local y despliegue de modelos pequeños en cursos de IA.
- Chatbot para entornos con restricciones de privacidad: al ejecutarse localmente, evita enviar datos a la nube, útil para datos sensibles o entornos offline.
- Generación de respuestas automáticas en sistemas de soporte de nivel básico: puede manejar preguntas frecuentes sencillas y derivar a un humano cuando no sabe responder.
- Investigación en cuantización extrema: el repositorio incluye un `quantization_report.json` con métricas por tensor, útil para estudiar el impacto de la cuantización mixta en modelos pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo incluye métricas de calidad de la cuantización comparando el checkpoint int8 con el float original:

| Medida | Valor |
|---|---|
| Mismo siguiente token | 96,8% |
| Siguiente token dentro de los cinco primeros | 100,0% |
| Divergencia KL | 0,0017 |
| Perplejidad (int8 vs float) | 49,5 vs 49,1 |
| Respuestas greedy idénticas | 7/8 |

Estas cifras indican que la cuantización degrada muy poco la calidad, pero no hay datos de rendimiento en tareas específicas.

## Requisitos de hardware

- VRAM estimada: el archivo cuantizado pesa 26,79 MB, por lo que en memoria ocupará menos de 30 MB. En BF16 el modelo base necesita unos 0,37 GB según llmrun.dev; la versión int8 requerirá significativamente menos, probablemente menos de 0,1 GB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; también puede ejecutarse en CPU, ya que el tamaño es mínimo.
- Compatibilidad con consumer GPU: sí, incluso en iGPUs o GPUs antiguas.
- Opciones de despliegue: el modelo solo funciona con el motor bananamend (librería `bananamendr`). No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se dispone de datos medidos, pero al ser un modelo de 25M de parámetros, la inferencia será muy rápida en cualquier hardware moderno (del orden de milisegundos por token).

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas de la misma categoría (modelos de ~25M de parámetros). El único punto de comparación directo es el modelo base sin cuantizar, que ofrece la misma capacidad pero con mayor peso y sin la restricción del motor bananamend. No se conocen otros modelos cuantizados con este formato específico.

## Limitaciones y advertencias

- Modelo extremadamente pequeño: con 25M de parámetros, su capacidad de razonamiento, conocimiento y generación de texto es muy limitada en comparación con modelos de cientos de millones o miles de millones de parámetros.
- Riesgo de alucinación: al ser pequeño, es más propenso a generar respuestas incorrectas o inventadas, especialmente en temas especializados.
- Dependencia del motor bananamend: los pesos están en un formato propietario (códigos y escalas) que no puede ser leído por transformers ni otras librerías estándar. Esto limita su portabilidad y el uso de herramientas de la comunidad.
- La cuantización introduce una ligera degradación (perplejidad 49,5 vs 49,1), aunque las respuestas greedy coinciden en 7 de 8 casos.
- No se han documentado sesgos específicos, pero al ser un modelo pequeño entrenado con datos desconocidos, puede reflejar sesgos de su corpus de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero hay que cumplir con los términos de atribución y distribución del modelo base.

## Enlaces

- Modelo cuantizado en Hugging Face: https://huggingface.co/fontlab/BananaMind-2-Mini-Chat-int8
- Modelo base en Hugging Face: https://huggingface.co/BananaMind/BananaMind-2-Mini-Chat
- Repositorio del motor bananamend: https://github.com/twardoch/bananamend
- Página de hardware y compatibilidad del modelo base: https://llmrun.dev/model/bananamind-bananamind-2-mini

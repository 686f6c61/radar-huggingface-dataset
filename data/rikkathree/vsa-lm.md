# rikkathree/vsa-lm

## Resumen

VSA-LM es un modelo de lenguaje de 100 millones de parámetros desarrollado por el investigador Rikka3 (usuario rikkathree en HuggingFace). Su principal innovación es sustituir el caché de atención creciente (KV-cache) de los transformadores convencionales por una memoria de tamaño fijo basada en capas de atención lineal con estado fijo y decay aprendible por cabeza. El modelo combina 6 capas VSA con 2 capas de atención softmax estándar, formando una arquitectura híbrida que pretende mantener un coste de memoria O(1) durante la inferencia.

El objetivo del proyecto es responder si un modelo pequeño con capas de memoria de atención lineal puede igualar a un transformer regular entrenado de forma idéntica. Según el autor, a escala de 100M parámetros el rendimiento es comparable dentro del ruido, pero con un uso de memoria significativamente menor. Además, el modelo permite escribir un documento en su memoria y borrarlo de forma exacta, una capacidad que los transformadores convencionales no ofrecen.

El modelo se entrenó en una sola GPU T4 de Kaggle durante aproximadamente 20 horas, utilizando el dataset HuggingFaceFW/fineweb-edu y un total de 500 millones de tokens. Su ventana de contexto es de 512 posiciones y no ha sido ajustado por instrucciones. Está disponible con licencia MIT y puede encontrarse en HuggingFace junto con el código y los scripts de entrenamiento en GitHub.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: 8 capas, 6 VSA (atención lineal con estado fijo y decay aprendible por cabeza) + 2 capas softmax |
| Parámetros totales | 100 millones |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés |
| Licencia | MIT |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

VSA-LM está compuesto por 8 capas en total: 6 capas VSA (el acrónimo no se expande en la documentación) que utilizan un estado fijo por cabeza con una tasa de decay aprendible, y 2 capas de atención softmax convencionales. Esta combinación híbrida permite que el modelo mantenga una memoria de tamaño fijo en lugar de un caché de atención que crece con la longitud de la secuencia. El autor implementó kernels Triton personalizados para el entrenamiento, incluyendo un gradiente adjunto para las tasas de decay, y cada kernel se verifica contra una implementación de referencia en PyTorch puro antes de iniciar el entrenamiento (vsa_lm/tests.py).

El entrenamiento se realizó en una única GPU T4 gratuita de Kaggle durante unas 20 GPU-horas, en precisión fp16 con el optimizador AdamW de 8 bits. El dataset utilizado fue HuggingFaceFW/fineweb-edu, con un total de 500 millones de tokens. El autor señala que esta cantidad representa aproximadamente el 5% de lo que un modelo de este tamaño debería idealmente consumir, por lo que tanto VSA-LM como el baseline están limitados por datos. No se menciona ningún proceso de RLHF, DPO ni ajuste por instrucciones.

## Capacidades

- Generación de texto en inglés: completa texto de forma razonablemente gramatical, aunque sin garantías de veracidad factual.
- Memoria de tamaño fijo: permite escribir un documento en la memoria del modelo y borrarlo de forma exacta, una capacidad que los transformadores convencionales no ofrecen.
- Atención lineal con coste de memoria O(1): reduce el uso de memoria durante la inferencia en comparación con el KV-cache tradicional.
- Entrenamiento con kernels Triton personalizados y verificación automática contra referencias PyTorch.
- No soporta tool calling, function calling, visión, audio ni modos de razonamiento explícitos.
- No está ajustado por instrucciones ni diseñado para chat: el modelo simplemente continúa texto.

## Casos de uso

- Investigación en arquitecturas de atención lineal: el modelo sirve como banco de pruebas para comparar capas VSA con capas softmax en modelos pequeños, permitiendo a investigadores evaluar el equilibrio entre memoria y rendimiento.
- Prototipado de gestión de memoria en modelos de lenguaje: gracias a su capacidad de escribir y borrar documentos en memoria, es útil para experimentar con sistemas de memoria externa o recuperación de información en entornos controlados.
- Educación sobre kernels Triton y entrenamiento eficiente: el código incluye kernels Triton con gradientes adjuntos y pruebas de referencia, lo que lo convierte en un recurso didáctico para aprender implementaciones de bajo nivel.
- Evaluación de límites de datos en modelos pequeños: el proyecto documenta explícitamente la limitación de 500M tokens, lo que permite estudiar el efecto de la escasez de datos en modelos de 100M parámetros.
- Generación de texto corto en inglés para prototipos: puede emplearse para completar fragmentos de texto en aplicaciones de demostración que no requieran precisión factual.
- Comparación de eficiencia de memoria en inferencia: permite medir el ahorro de memoria frente a un transformer baseline de tamaño similar cuando se ejecuta en hardware con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible en la información proporcionada. Dado el tamaño de 100M parámetros, se espera que sea muy baja, pero no hay cifras oficiales.
- GPU recomendadas: no se especifican. El entrenamiento se realizó en una NVIDIA T4, por lo que es una referencia válida.
- Compatibilidad con GPU de consumo: previsiblemente sí, dado el reducido tamaño del modelo, aunque no hay confirmación oficial.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. El modelo se ejecuta mediante PyTorch y Triton.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en los datos proporcionados. El autor menciona un baseline transformer entrenado de forma idéntica, pero no se especifica su nombre ni se publican resultados de comparación.

## Limitaciones y advertencias

- El modelo fue entrenado con solo 500 millones de tokens, aproximadamente el 5% de lo que se considera ideal para un modelo de 100M parámetros, lo que limita su calidad y generalización.
- La ventana de contexto está limitada a 512 posiciones.
- No está ajustado por instrucciones ni es un modelo de chat: genera texto que puede ser gramatical pero contiene "tonterías confiadas" para hechos, lo que implica un alto riesgo de alucinación.
- La memoria de tamaño fijo puede contener cientos de tokens de forma limpia, pero no bibliotecas enteras.
- Solo soporta inglés.
- No se han publicado benchmarks formales, por lo que no es posible validar su rendimiento frente a otros modelos.
- Es un proyecto de investigación con fines experimentales; no se recomienda su uso en producción sin una evaluación exhaustiva.
- La licencia MIT permite uso comercial, pero el modelo no está optimizado para tareas reales.

## Enlaces

- HuggingFace: https://huggingface.co/rikkathree/vsa-lm
- GitHub (código y scripts de entrenamiento): https://github.com/Rikka3/vsa-lm
- GitHub (repositorio relacionado sobre arquitectura VSA): https://github.com/Rikka3/VLLM

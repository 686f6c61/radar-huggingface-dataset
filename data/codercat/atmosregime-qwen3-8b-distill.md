# codercat/AtmosRegime-Qwen3-8B-Distill

## Resumen

AtmosRegime-Qwen3-8B-Distill es un ajuste fino de Qwen3-8B desarrollado por el usuario codercat (autor del paper Maohao Ran y colaboradores) mediante destilación on-policy. El modelo aborda un problema concreto documentado en el paper "Physical regime changes expose formula misuse in large language models": los LLM fallan al aplicar fórmulas físicas cuando el problema cambia de régimen físico (por ejemplo, pasar de un forzamiento radiativo lineal a uno logarítmico según la concentración de CO2). El modelo base resolvía el 0 % de los casos fuera de régimen, y este ajuste eleva esa precisión al 71 % en los mecanismos que el modelo base solo resolvía cuando se le proporcionaba la fórmula correcta.

Técnicamente es un transformer denso de 8.190.735.360 parámetros, derivado directamente de Qwen3-8B, con contexto heredado del modelo base (no especificado en la información disponible). La innovación no está en la arquitectura sino en el procedimiento de entrenamiento: el estudiante nunca ve la fórmula, pero se le empuja hacia la distribución de tokens de un profesor congelado que sí la recibe, combinando KL forward sobre los 32 tokens más probables del profesor con la recompensa de respuesta.

Es relevante ahora porque demuestra que la destilación on-policy puede corregir fallos sistemáticos de razonamiento científico sin aumentar el tamaño del modelo ni cambiar la arquitectura, y porque publica código, datos y una colección de modelos reproducibles. La licencia Apache 2.0 y el formato safetensors facilitan su integración en pipelines existentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-8B) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors, sin GGUF publicado) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-8B, un transformer denso de 8,19 mil millones de parámetros, y se ajusta mediante destilación on-policy. El estudiante es Qwen3-8B con el modo thinking desactivado. El profesor es una copia congelada del mismo Qwen3-8B cuyo prompt incluye además la fórmula física correcta. El estudiante nunca ve la fórmula: sobre sus propias muestras se le empuja hacia la distribución de tokens del profesor mediante KL forward calculado sobre los 32 tokens más probables del profesor, combinado con la recompensa de respuesta.

El entrenamiento se realizó con la librería verl, tasa de aprendizaje 1e-6, 128 problemas × 8 muestras por paso, 120 pasos y sin muestreo dinámico. Los datos corresponden al fold 1 de entrenamiento de las plantillas del estudio (29 de los 70 mecanismos), con semilla 42. No se especifica el número total de tokens de entrenamiento ni la composición completa del dataset más allá de esta descripción. La innovación destacable es el uso de un profesor informado con la fórmula como señal de destilación sobre las muestras propias del estudiante, sin que este reciba la fórmula en el prompt.

## Capacidades

- Generación de código Python: el modelo responde con un programa que define una función `solve()` para resolver el problema físico planteado.
- Razonamiento científico aplicado a problemas de régimen físico en ciencias atmosféricas (forzamiento radiativo, mecanismos de las 70 plantillas del estudio).
- Aplicación de fórmulas físicas en problemas fuera de régimen, donde el modelo base fallaba sistemáticamente.
- Generación de texto conversacional con la plantilla de chat de Qwen3.
- Funciona con thinking desactivado; no se documenta un modo thinking específico para este checkpoint.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.
- Capacidades multilingües: solo inglés declarado.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Resolución automática de problemas de forzamiento radiativo: el modelo genera un programa Python que calcula el forzamiento a partir de concentraciones de CO2 y otros parámetros, útil para validar cálculos en modelos climáticos sencillos.
- Generación de código científico reproducible: al devolver una función `solve()` ejecutable, se puede integrar en pipelines de evaluación automática que ejecutan y califican el programa (el repositorio incluye las utilidades en `atmoscoder_rl/evaluation/`).
- Docencia y evaluación de razonamiento físico: sirve para estudiar cómo un LLM aplica fórmulas cuando el régimen físico cambia, comparando sus salidas con las del modelo base.
- Investigación en destilación on-policy: el checkpoint es un punto de partida para reproducir o extender el método del paper con otros dominios científicos.
- Herramienta de apoyo en cálculo atmosférico: para problemas de las 29 plantillas de entrenamiento, el modelo puede generar borradores de código que el investigador revisa y ejecuta.
- Benchmark de referencia para fallos de régimen: permite medir la brecha entre el modelo base y el ajustado en mecanismos concretos, como insumo para estudios de robustez científica.

## Benchmarks y rendimiento

La información proporcionada solo incluye el dato agregado del paper: la precisión fuera de régimen pasa del 0 % al 71 % en mecanismos que el modelo base nunca resolvía pero sí resolvía una vez informado de la fórmula. No se publican resultados por benchmark estándar (MMLU, HumanEval, GSM8K) en la información disponible. El propio autor advierte que este checkpoint es un solo fold y una sola semilla, mientras que las cifras del paper promedian dos folds y dos semillas, por lo que este modelo por sí solo no reproduce exactamente esos números.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 16,4 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda al menos 24 GB para comodidad.
- VRAM en cuantización de 8 bits: alrededor de 8-9 GB para pesos; en 4 bits, alrededor de 4-5 GB. No se publican GGUF oficiales, por lo que la cuantización requeriría conversión propia.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para fp16 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en fp16 con contexto limitado, y en GPUs de 12-16 GB si se cuantiza.
- Opciones de despliegue: transformers (formato nativo), text-generation-inference (etiqueta endpoints_compatible), y vLLM o llama.cpp tras conversión a los formatos correspondientes.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AtmosRegime-Qwen3-8B-Distill | 8,19 B | No disponible | Destilación on-policy para régimen físico | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-8B (base) | 8,19 B | No disponible | Modelo generalista | Apache 2.0 | Hugging Face |
| Otros modelos de la colección AtmosRegime | No disponible | No disponible | Variantes del estudio | No disponible | Colección en Hugging Face |

La comparación directa con alternativas de la misma categoría (modelos científicos ajustados de 8 B) no está disponible en la información proporcionada. El contraste más relevante es con su modelo base: mismo tamaño, misma licencia y misma arquitectura, pero con la precisión fuera de régimen elevada del 0 % al 71 % según el paper.

## Limitaciones y advertencias

- Es un checkpoint de un solo fold y una sola semilla; no reproduce exactamente las cifras promedio del paper.
- La destilación solo ayudó donde el profesor podía resolver el problema una vez informado de la fórmula; en mecanismos donde el profesor tampoco resolvía, no hay mejora garantizada.
- No es un asistente generalista de ciencias atmosféricas; su uso está acotado al formato de prompt y a las plantillas del estudio.
- Requiere el formato de prompt exacto del repositorio (`atmoscoder_rl.prompts.chat`) y thinking desactivado; usarlo con otro formato degrada la calidad de salida.
- Solo declara inglés como idioma soportado.
- Riesgo de alucinación en fórmulas y constantes físicas fuera de las 29 plantillas de entrenamiento; el código generado debe ejecutarse y validarse antes de usarse en producción.
- Sesgos conocidos: no documentados en la información proporcionada.
- Licencia Apache 2.0 permite uso comercial, pero el modelo hereda las limitaciones del base Qwen3-8B y no incluye garantías de corrección científica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/codercat/AtmosRegime-Qwen3-8B-Distill
- Paper: https://arxiv.org/abs/2611.28669
- Repositorio de código y datos: https://github.com/acodercat/AtmosRegime
- Colección AtmosRegime: https://huggingface.co/collections/codercat/AtmosRegime
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B

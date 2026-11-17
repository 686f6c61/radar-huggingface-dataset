# AdeelK93/gpttrace-v8s-1b-mlx-int8

## Resumen

GPTTrace v8s 1B MLX int8 es una conversión no oficial del detector de texto generado por IA `nakas/gpttrace-v8s-1b`, publicada por el usuario AdeelK93. El modelo original lo desarrolla Andrew Nakas dentro del proyecto GPTTrace y se distribuye como un clasificador de texto basado en ModernBERT con 1.031.267.330 parámetros. Esta variante concreta cuantiza a int8 los pesos de las capas lineales del encoder y de los embeddings, manteniendo en FP16 las activaciones, las capas de normalización y la cabeza de scoring.

La relevancia de esta versión es práctica: reduce el peso del repositorio a 1,1 GB y permite ejecutar el detector en local sobre Apple Silicon mediante la librería MLX, sin depender de infraestructura de GPU. El autor documenta que la deriva numérica frente a FP16 es mínima (cambio máximo de 0,000830 en 23 textos sintéticos de comparación), aunque advierte de que esa métrica mide acuerdo numérico, no precisión real del detector.

Se trata de un modelo de clasificación, no de generación: recibe un texto y devuelve una puntuación orientada a determinar si fue escrito por un humano o por un modelo de lenguaje. Conserva la normalización original, el tokenizador, el límite de 512 tokens y el umbral de margen de logit de 9,3 del modelo base. Los textos cortos se consideran poco fiables y esta variante no ha sido recalibrada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer), clasificador de texto |
| Parametros totales | 1.031.267.330 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (límite del modelo original) |
| Tipos de cuantizacion | int8 affine, group_size 64, en capas lineales del encoder y embeddings; activaciones, normas y cabeza de scoring en FP16 |
| Idiomas soportados | inglés (en) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors (librería MLX) |

## Arquitectura y entrenamiento

El modelo base es un encoder ModernBERT de aproximadamente 1.000 millones de parámetros, adaptado como clasificador binario o de scoring para detección de texto generado por IA. La arquitectura sigue el patrón de un transformer encoder con atención bidireccional, orientado a representaciones contextuales del texto completo de entrada en lugar de a la generación autorregresiva. La cabeza de clasificación produce una puntuación que se compara con un umbral de margen de logit fijado en 9,3.

Esta variante no introduce cambios arquitectónicos: es una conversión de pesos a MLX con cuantización affine de 8 bits y tamaño de grupo 64 aplicada a las matrices lineales y a los embeddings, dejando en FP16 las activaciones, las capas de normalización y la cabeza de scoring. El autor no documenta en la información disponible detalles sobre el corpus de entrenamiento del modelo base, el número de tokens utilizados, la composición del dataset ni si hubo fases de ajuste fino con RLHF o DPO. Tampoco se especifican innovaciones técnicas adicionales más allá de la propia cuantización y del script de scoring incluido en el repositorio.

## Capacidades

- Clasificación de texto orientada a detectar contenido generado por IA, devolviendo una puntuación y una decisión basada en umbral.
- Procesamiento de entradas de hasta 512 tokens con la normalización y el tokenizador originales del modelo base.
- Ejecución local en Apple Silicon mediante MLX, con un script de scoring propio (`gpttrace.py`) incluido en el repositorio.
- Inferencia en precisión mixta int8/FP16 con deriva numérica documentada frente a la versión FP16.
- No soporta tool calling ni function calling: es un clasificador, no un modelo conversacional.
- No soporta agentes ni razonamiento multi-step.
- Capacidades multilingües limitadas al inglés.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Filtrado de contenido en plataformas editoriales: el modelo puede puntuar textos recibidos y marcar aquellos con alta probabilidad de haber sido generados por IA antes de su publicación, usando el umbral de 9,3 para decisiones automáticas y revisión humana en la zona gris.
- Moderación de foros y comunidades: integrado como paso previo en un pipeline de moderación, permite detectar aportaciones sintéticas masivas y priorizar la revisión manual de los casos dudosos.
- Análisis de integridad académica: como señal adicional (nunca como prueba única) en la revisión de entregas, aprovechando que el modelo está pensado para textos de hasta 512 tokens y funciona mejor con fragmentos sustanciales.
- Auditoría de datasets: puntuar grandes volúmenes de texto para estimar la proporción de contenido sintético antes de usar un corpus en entrenamiento, ejecutando el modelo en local sobre Apple Silicon sin coste de API.
- Investigación sobre detección de IA: servir como referencia cuantizada para reproducir experimentos de detección, comparar la versión int8 con la FP16 y medir el impacto de la cuantización en las decisiones del clasificador.
- Despliegue en estaciones de trabajo sin GPU dedicada: al ocupar 1,1 GB en disco y ejecutarse con MLX, encaja en portátiles y equipos de sobremesa con chip Apple para tareas de scoring por lotes.
- Prototipado de herramientas antiplagio o anti-bot: permite validar rápidamente una idea de producto basada en detección de texto sintético antes de invertir en infraestructura o en el modelo original completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor únicamente documenta una comparación numérica frente a la versión FP16: en 23 textos sintéticos de comparación, el cambio máximo de puntuación fue de 0,000830 y no se modificó ninguna decisión calibrada por umbral. Esa métrica mide acuerdo numérico entre precisiones, no precisión del detector. Los detalles completos están en `quantization-benchmark.json` y `quantization-benchmark.md` del repositorio.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido habitual; el modelo está pensado para MLX sobre memoria unificada de Apple Silicon. El repositorio ocupa 1,1 GB, por lo que la huella en memoria es del orden de 1-2 GB según el lote y los buffers de activación.
- GPU recomendadas: chips Apple Silicon (series M1, M2, M3, M4 y posteriores) con MLX. No se documentan requisitos para GPU NVIDIA o AMD en esta variante.
- ¿Cabe en GPU de consumo? Sí, en el ecosistema Apple Silicon; para GPUs NVIDIA no se proporciona una ruta de despliegue en esta conversión.
- Opciones de despliegue: MLX con el script incluido (`uv run python gpttrace.py score --model . --text "..."`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI para esta variante.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| AdeelK93/gpttrace-v8s-1b-mlx-int8 | 1.031.267.330 | 512 tokens | safetensors MLX int8/FP16 | CC BY-SA 4.0 | Conversión no oficial, cuantizada, para Apple Silicon |
| AdeelK93/gpttrace-v8s-1b-mlx-fp16 | no disponible en la información | 512 tokens | safetensors MLX FP16 | CC BY-SA 4.0 | Versión de referencia en FP16 del mismo autor de la conversión |
| nakas/gpttrace-v8s-1b | no disponible en la información | 512 tokens | no disponible | no disponible | Modelo original de Andrew Nakas / GPTTrace |

No se dispone de datos de benchmarks comparativos entre estas variantes ni frente a otros detectores de texto generado por IA en la información proporcionada.

## Limitaciones y advertencias

- Es una conversión no oficial: los pesos y la conversión están bajo CC BY-SA 4.0, con atribución y modificaciones documentadas en `NOTICE.md` y `LICENSE.md`. El uso comercial queda sujeto a las condiciones de esa licencia (compartir igual).
- El modelo no ha sido recalibrado tras la cuantización; el umbral de 9,3 se hereda del modelo base y puede no ser óptimo en todos los dominios.
- Los textos cortos se consideran poco fiables según el propio autor.
- La detección de texto generado por IA es inherentemente probabilística: existen falsos positivos y falsos negativos, y los resultados no deben usarse como prueba definitiva en contextos disciplinarios o legales.
- Riesgo de sesgo: no se documenta la composición del dataset de entrenamiento del modelo base, por lo que se desconocen sesgos por dominio, registro o variedad de inglés.
- Limitación de idioma: solo inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Límite de contexto de 512 tokens: textos más largos deben fragmentarse, lo que puede alterar la puntuación global.
- La comparación numérica publicada (23 textos sintéticos) es reducida y no constituye una validación de precisión del detector.
- Dependencia del ecosistema MLX: no hay ruta documentada para GPUs NVIDIA en esta variante, lo que limita su uso en servidores convencionales.
- El repositorio no registra descargas ni interacciones, por lo que no existe validación comunitaria de su comportamiento en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdeelK93/gpttrace-v8s-1b-mlx-int8
- Versión FP16 del mismo autor de la conversión: https://huggingface.co/AdeelK93/gpttrace-v8s-1b-mlx-fp16
- Modelo original: https://huggingface.co/nakas/gpttrace-v8s-1b
- Proyecto GPTTrace (referencia citada en la model card): https://huggingface.co/nakas/gpttrace-v8s-1b

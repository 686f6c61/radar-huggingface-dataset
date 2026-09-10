# Jeesup/svd-safety-l2_remove40_random_b010

## Resumen

Jeesup/svd-safety-l2_remove40_random_b010 es un checkpoint de investigación derivado de `meta-llama/Llama-2-7b-chat-hf`, comprimido mediante SVD-LLM y restaurado de forma parcial. Forma parte de un estudio que analiza cómo la compresión por descomposición en valores singulares (SVD) afecta al comportamiento de seguridad del modelo y qué estrategia de selección de componentes resulta más eficaz para repararlo. En esta variante concretamente se eliminó el 39,03 % de los parámetros y se restauró un presupuesto del 1,0 % de los parámetros densos usando una regla de selección aleatoria (“random”) con semilla 42, lo que deja el checkpoint en el 60,97 % de los parámetros originales. No está pensado como asistente conversacional general, sino como sujeto experimental para cuantificar el compromiso entre seguridad y utilidad bajo compresión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decodificador (Llama-2-7b-chat) |
| Parametros totales | 6.738.415.616 |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (sin cuantizaciones documentadas; se distribuye en safetensors) |
| Idiomas soportados | no disponibles |
| Licencia | Llama 2 Community License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura de `Llama-2-7b-chat`, un transformer decodificador con atención de múltiples cabezas y normalización RMS, tal como se indica en la información disponible. El proceso de compresión se realizó con SVD-LLM, que descompone los pesos en valores singulares y elimina los de menor importancia. En este checkpoint se eliminó el 39,03 % de los parámetros, dejando una fracción de 0,6097 del total denso. Posteriormente se restauraron 5901 componentes SVD, lo que corresponde a un presupuesto del 1,0 % de los parámetros densos, seleccionados mediante la regla `random` con semilla 42. No se detallan los datos de entrenamiento, el número de tokens ni si se realizó RLHF o DPO adicional. El resultado es un artefacto experimental de una cuadrícula más amplia sobre reglas de selección y presupuestos de restauración, útil para medir el efecto de la compresión sobre el comportamiento seguro del modelo.

## Capacidades

- Generación de texto conversacional (limitada): hereda la arquitectura y el vocabulario de Llama-2-7b-chat, pero la compresión degrada su calidad y fiabilidad de salida.
- No se han documentado capacidades de tool calling, function calling, visión, audio ni soporte de agentes.
- Las capacidades multilingües no están declaradas; se asume el comportamiento del modelo base, pero no se puede verificar con los datos disponibles.
- La principal capacidad medida en la ficha es la de evaluar la seguridad de un modelo comprimido, utilizada como métrica de investigación.

## Casos de uso

- Investigación sobre compresión y seguridad: permite medir cómo la SVD degrada la resistencia a ataques adversarios (AdvBench ASR) frente a un modelo sin comprimir, usando el valor 0,3346 como referencia para la línea de compresión.
- Estudio de técnicas de reparación post-compresión: sirve como célula de comparación para evaluar si la selección aleatoria de componentes restaurados, frente a otras reglas de selección, recupera comportamiento seguro.
- Análisis de interpretabilidad: facilita el estudio de qué componentes SVD concretos influyen más en la activación de respuestas seguras o tóxicas.
- Benchmarking de over-refusal: permite analizar la tasa de rechazo excesivo (macro over-refusal de WildGuard) bajo compresión y presupuesto reducido, con un valor de 0,1128.
- Evaluación de la utilidad lingüística: la perplexidad en WikiText-2, fijada en 11,2594, puede usarse como métrica proxy para comparar la preservación del lenguaje en distintas variantes comprimidas.
- Desarrollo de metodologías de cuantización segura: sirve como banco de pruebas para diseñar pipelines de compresión que no rompan las alineaciones de seguridad, contrastando esta variante con otras de la misma cuadrícula.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (HarmBench judge) | 0,3346 |
| StrongREJECT ASR (HarmBench judge) | 0,1725 |
| Macro over-refusal (WildGuard) | 0,1128 |
| WikiText-2 perplexity | 11,2594 |

No se han publicado resultados de benchmarks adicionales ni comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para FP16: ~13,5 GB solo para los pesos, tal como indica el tamaño del repositorio; se necesita al menos 16 GB considerando overhead de inferencia.
- Mediante cuantización a 4 bits se podría reducir la huella a ~4-5 GB, pero no hay configuraciones oficiales ni archivos cuantizados en el repositorio.
- GPU recomendada para FP16 sin cuantizar: A100 40 GB o RTX 4090 24 GB. Con cuantización a 8 bits puede ejecutarse en GPUs con 16 GB de VRAM.
- El modelo es compatible con vLLM, Hugging Face TGI y llama.cpp (si se convierte a GGUF), ya que se distribuye en formato safetensors con la librería transformers.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información fiable sobre otros modelos comparables dentro de la misma cuadrícula experimental. La única referencia es el modelo base `meta-llama/Llama-2-7b-chat-hf`, del que se sabe que es el punto de partida sin comprimir, pero no se aportan sus métricas de seguridad ni de perplexidad en los mismos benchmarks. Por tanto, la comparativa con alternativas de la misma categoría se considera no disponible.

## Limitaciones y advertencias

- Es un artefacto experimental, no un modelo de propósito general; el propio autor advierte de que no debe desplegarse como asistente conversacional.
- La compresión SVD degrada deliberadamente el comportamiento seguro; el AdvBench ASR de 0,3346 indica una mayor tasa de éxito de ataques en comparación con lo esperable en el modelo sin comprimir.
- La regla de selección `random` es una de las variantes menos eficaces para restaurar seguridad, como indica la macro over-refusal de 0,1128, que refleja rechazos excesivos de respuestas legítimas.
- Al ser una derivada de Llama-2-7b-chat, puede conservar los sesgos del modelo base y sus restricciones de licencia.
- La licencia Llama 2 obliga a aceptar `LICENSE.txt` y `USE_POLICY.md`; el uso comercial queda condicionado por los términos de la licencia de Llama 2.
- No hay evaluaciones externas independientes ni documentación detallada del proceso de compresión más allá de las métricas incluidas en la model card.

## Enlaces

- HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_remove40_random_b010
- No se han encontrado papers, blogs, demos u otros enlaces relevantes relacionados con este modelo en la búsqueda web; los resultados devueltos no eran pertinentes.

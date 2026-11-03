# ansulev/Ornith-1.5-9B-uncensored

## Resumen

Ornith-1.5-9B-uncensored es una variante "abliterated" (dirección de rechazo ablacionada) del modelo multimodal ornith-ai/Ornith-1.5-9B, publicada por el usuario ansulev y atribuida en su model card a VeriSafe.Live. El modelo conserva la torre de visión del original y los pesos completos en bf16, con 9.409.813.744 parámetros reales según los safetensors del repositorio. La arquitectura declarada en las etiquetas es `qwen3_5`, un transformer multimodal de tipo image-text-to-text.

La modificación consiste en una edición de pesos de rango 1 sobre un tramo de capas conocido, orientada a eliminar la dirección de rechazo del modelo base sin añadir sobrecarga en tiempo de inferencia. El objetivo declarado es servir como instrumento de investigación para red teaming y evaluación de seguridad defensiva, midiendo el techo de capacidad real de los pesos frente a la versión original.

Es relevante ahora porque permite comparar pares controlados (base frente a abliterated) en un modelo de 9B con visión, y porque la licencia Apache 2.0 facilita su uso y redistribución. No obstante, el repositorio no incluye información sobre idiomas soportados, datos de entrenamiento ni resultados de benchmarks, y el número de descargas y likes es cero en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (`qwen3_5`), image-text-to-text |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | bf16 en este repositorio; existen variantes MLX-8bit y GGUF Q8_0 en la familia |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal con torre de visión, identificado en las etiquetas como `qwen3_5` y con pipeline `image-text-to-text`. El checkpoint aquí publicado es una edición directa de pesos en precisión completa (bf16): no se ha reentrenado ni ajustado con datos nuevos, sino que se ha aplicado una ablación de la dirección de rechazo sobre un tramo de capas especificado. Según la model card, la torre de visión y los cabezales de predicción multi-token (MTP) se preservan, y el base oficial de 9B no contiene tensores `mtp.*`, por lo que no se injertó ningún bloque adicional.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si el modelo base empleó RLHF o DPO. La innovación técnica destacable es precisamente el método de abliteración: una edición de rango 1 sobre un intervalo de capas conocido, que actúa como control experimental limpio frente al modelo original y no introduce coste computacional adicional en inferencia.

## Capacidades

- Generación de texto conversacional multi-turno.
- Procesamiento de imagen y texto combinados (image-text-to-text) gracias a la torre de visión preservada.
- Razonamiento y respuesta a instrucciones heredados del modelo base.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo "thinking" u otras capacidades especiales: no disponible en la información proporcionada.
- Comportamiento sin rechazos en la mayoría de dominios, con algunos rechazos residuales documentados (reafirmación multi-turno, direccionamiento por system prompt, rechazos en la ruta de visión).

## Casos de uso

- Red teaming automatizado: el modelo actúa como objetivo que no rechaza, lo que permite aislar la variable bajo prueba (inyección de prompts, abuso de herramientas, rutas de exfiltración de datos) sin que el sistema se detenga por rechazos no relacionados.
- Evaluación de la pila defensiva: se emplea como mitad "tratamiento" de un par controlado frente al modelo base para medir si los filtros de entrada, clasificadores de salida y APIs de moderación detectan contenido que el modelo original habría rechazado.
- Medición del techo de capacidad: permite acotar superiormente lo que los pesos pueden producir en un dominio concreto, independientemente de los rechazos incluidos en la versión publicada.
- Generación de datos etiquetados para moderación: produce completaciones para entrenar o evaluar modelos de detección de abuso y clasificación de salidas.
- Investigación en interpretabilidad del rechazo residual: al ser una edición de rango 1 sobre un tramo conocido, el par base/abliterated constituye un control experimental limpio para estudiar qué rechazos sobreviven y por qué.
- Análisis multimodal de imágenes en entornos de investigación: la torre de visión preservada permite probar rutas de rechazo específicas de imagen frente a texto.
- Despliegue en Apple Silicon o llama.cpp: las variantes MLX-8bit y GGUF Q8_0 de la familia permiten ejecutar el modelo en hardware de consumo para experimentación local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 18,8 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda al menos 24 GB para comodidad.
- GPU recomendadas para bf16: A100 40/80 GB, H100, L40S; en consumer, RTX 4090 (24 GB) puede alojar los pesos pero con margen ajustado para contexto largo.
- Cabe en consumer GPU: sí, en RTX 4090 con bf16 justo; para GPUs de 16 GB o menos es necesario recurrir a las variantes cuantizadas de la familia (MLX-8bit, GGUF Q8_0) o a cuantizaciones adicionales no publicadas en este repositorio.
- Opciones de despliegue: transformers (formato nativo), llama.cpp mediante la variante GGUF Q8_0, mlx-vlm en Apple Silicon mediante la variante MLX-8bit. vLLM y TGI no están confirmados en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Ornith-1.5-9B-uncensored | 9,41 B | No disponible | Sí | Apache 2.0 | Safetensors bf16 | Abliterated, par control del base |
| ornith-ai/Ornith-1.5-9B | No disponible | No disponible | Sí | No disponible en esta ficha | Safetensors | Modelo base original con rechazos |
| Ornith-1.5-35B-A3B-uncensored | No disponible | No disponible | Sí | No disponible en esta ficha | MLX-8bit, GGUF Q8_0 | Variante mayor de la misma familia, presumiblemente MoE por el sufijo A3B |

No se dispone de datos de rendimiento ni de benchmarks para establecer una comparación cuantitativa con alternativas de otros autores.

## Limitaciones y advertencias

- La abliteración elimina una dirección, no una política: sobreviven rechazos residuales en reafirmación multi-turno, direccionamiento por system prompt y rutas de visión.
- No debe exponerse como endpoint público sin una capa de moderación independiente; el despliegue asume la responsabilidad de la moderación que los guardarraíles originales cubrían.
- Riesgo elevado de generar contenido dañino, sesgado o inexacto al haberse eliminado los rechazos; el modelo puede alucinar con mayor facilidad al no negarse a responder.
- No hay información sobre sesgos conocidos, idiomas soportados ni composición del dataset de entrenamiento del base.
- La licencia Apache 2.0 permite uso comercial, pero el uso previsto declarado por el autor es investigación en red teaming y seguridad defensiva; el despliegue comercial sin moderación propia es responsabilidad del operador.
- Cualquier evaluación debe reportarse como delta frente al modelo base y re-medirse con los prompts propios del evaluador.
- El repositorio presenta cero descargas y cero likes, y fue creado y actualizado el mismo día (2026-11-03), lo que indica ausencia de validación comunitaria.
- La model card contiene enlaces a repositorios de la colección `junafinity` que no coinciden con el ID del autor del repositorio (`ansulev`); conviene verificar la procedencia de los artefactos antes de usarlos en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ansulev/Ornith-1.5-9B-uncensored
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Colección de la familia (según model card): https://huggingface.co/collections/junafinity/ornith-15-uncensored-6a896c737cf40ad660af2ebd
- Variante MLX-8bit (según model card): https://huggingface.co/junafinity/Ornith-1.5-9B-uncensored-MLX-8bit
- Variante GGUF-8bit (según model card): https://huggingface.co/junafinity/Ornith-1.5-9B-uncensored-GGUF-8bit
- Variante 35B-A3B MLX-8bit (según model card): https://huggingface.co/junafinity/Ornith-1.5-35B-A3B-uncensored-MLX-8bit
- Variante 35B-A3B GGUF-8bit (según model card): https://huggingface.co/junafinity/Ornith-1.5-35B-A3B-uncensored-GGUF-8bit
- Sitio del autor declarado: https://verisafe.live

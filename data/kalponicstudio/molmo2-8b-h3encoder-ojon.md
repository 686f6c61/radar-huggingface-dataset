# KalponicStudio/Molmo2-8B-H3Encoder-Ojon

## Resumen

Molmo2-8B-H3Encoder-Ojon es una derivación del modelo vision-language Molmo2-8B de AllenAI, publicada por KalponicStudio, recortada y cuantizada para funcionar como codificador de texto (text encoder) en el ecosistema MiniMax H3, empleado en pipelines de generación de imagen y vídeo. El autor ha truncado el modelo original para conservar únicamente los hidden states hasta la capa 25, que es lo que el sistema H3 consume realmente, y lo ha cuantizado con su propio método Ojon. El objetivo declarado es sustituir al codificador Qwen3-VL de 32B parámetros, reduciendo el peso en disco de 15,7 GB a 4,65 GB.

Se distribuyen dos artefactos: un GGUF Q6_K de 4,65 GB pensado para motores tipo stable-diffusion.cpp mediante el flag `--llm`, y un safetensors INT8 en `int8-l25/` de 7,17 GB que actúa como reemplazo directo del paquete INT8 ConvRot de Alissonerdx en ComfyUI, usando el nodo ComfyUI-Molmo2-H3. Aunque el repositorio declara el modelo base como Molmo2-8B, los pesos en safetensors suman 5.425.584.128 parámetros, coherente con el truncado a la capa 25.

La relevancia de esta ficha es acotada: se trata de un componente auxiliar de un pipeline generativo, no de un modelo conversacional de propósito general. Su interés está en la reducción de requisitos de VRAM para el codificador, que permite ejecutar el flujo H3 en tarjetas de 16 GB, según la medición del propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-language (derivado de Molmo2-8B), truncado a la capa 25 |
| Parametros totales | 5.425.584.128 (safetensors del repositorio) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q6_K (GGUF), INT8 (safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF y safetensors |

## Arquitectura y entrenamiento

El modelo parte de allenai/Molmo2-8B, un VLM de AllenAI, y no ha sido reentrenado: la intervención del autor consiste en un truncado estructural (conservar solo las capas hasta la 25, que es donde MiniMax H3 lee los hidden states) y una cuantizacion posterior. En el GGUF se aplican lineales Q6_K, normas en F32 y una proyección H3 en F16; el safetensors INT8 sigue el mismo layout que el paquete INT8 ConvRot de Alissonerdx, cortado también en la capa 25.

No se documentan en la información disponible los datos de entrenamiento originales de Molmo2-8B, el número de tokens, la composición del dataset ni si hubo RLHF o DPO. Tampoco se describe el método de cuantizacion Ojon más allá de su nombre y de los tipos resultantes. La innovación técnica destacable es exclusivamente de eficiencia: recortar el codificador a las capas efectivamente consumidas por H3 y cuantizarlo para reducir el peso de 15,7 GB a 4,65 GB.

## Capacidades

- Codificación de texto e imagen en hidden states hasta la capa 25, para consumo por parte de MiniMax H3 en generación de imagen y vídeo.
- Integración con motores tipo stable-diffusion.cpp mediante `--llm` usando el GGUF Q6_K.
- Integración con ComfyUI mediante el nodo ComfyUI-Molmo2-H3 y el safetensors INT8, con la proyección del paquete de Alissonerdx.
- No está pensado como modelo generativo de texto autónomo ni como asistente conversacional.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-step: no disponible.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Modo thinking, visión o audio como capacidades de usuario final: no disponibles; la visión existe solo como parte del codificador heredado de Molmo2.

## Casos de uso

- Generación de imagen con H3 en ComfyUI: cargar `molmo2_8b_int8_convrot.safetensors` desde `int8-l25/` junto con el nodo ComfyUI-Molmo2-H3 y la proyección del paquete de Alissonerdx para sustituir al codificador Qwen3-VL de 32B, reduciendo el peso del codificador de 15,7 GB a 7,17 GB.
- Generación de vídeo con H3 en ComfyUI: el autor documenta la creación de un vídeo PRISM (H3) con el archivo INT8-L25 en una tarjeta de 16 GB, lo que lo hace viable en GPUs de gama alta de consumo.
- Despliegue en motores tipo stable-diffusion.cpp: usar el GGUF Q6_K de 4,65 GB con el flag `--llm` para pipelines fuera de ComfyUI que sigan la interfaz de stable-diffusion.cpp.
- Reducción de VRAM en entornos con una sola GPU: al recortar el codificador a la capa 25 y cuantizarlo, el pipeline completo cabe en configuraciones donde el codificador de 32B no entraba.
- Validación de fidelidad de la cuantizacion: comparar la conditioning resultante contra la referencia Python usando la similitud coseno media de 0,998 reportada por el autor, como test de regresión en un pipeline propio.
- Pruebas de reproducibilidad de imagen: el autor indica que el test H3-Image produce la misma imagen que con el codificador de 32B, lo que permite usarlo como control en evaluaciones A/B de pipelines.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (MMLU, HumanEval, GSM8K u otros). Las únicas métricas aportadas por el autor son de fidelidad y de tamaño:

| Metrica | Valor |
|---|---|
| Similitud coseno media Q6_K vs referencia Python (conditioning) | 0,998 |
| Peso del GGUF Q6_K | 4,65 GB |
| Peso del safetensors INT8 | 7,17 GB |
| Peso del codificador sustituido (Qwen3-VL 32B) | 15,7 GB |
| Test H3-Image | misma imagen que el codificador de 32B (según el autor) |
| Test de vídeo PRISM (H3) | generado en ComfyUI con 16 GB de VRAM (según el autor) |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el autor confirma que el pipeline H3 con el archivo INT8-L25 funciona en una tarjeta de 16 GB.
- El GGUF Q6_K ocupa 4,65 GB en disco y el safetensors INT8 7,17 GB, por lo que el codificador en sí requiere al menos esa cantidad de memoria más el resto del pipeline.
- GPU recomendadas: no disponibles. El único dato concreto es una tarjeta de 16 GB para el flujo ComfyUI con INT8.
- Cabe en GPU de consumo: sí, según el testimonio del autor en 16 GB; no se especifica el modelo exacto de tarjeta.
- Opciones de despliegue: stable-diffusion.cpp-style engines (`--llm`) con el GGUF; ComfyUI con el nodo ComfyUI-Molmo2-H3 y el safetensors INT8.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Peso del codificador | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Molmo2-8B-H3Encoder-Ojon (este) | 5.425.584.128 (truncado a capa 25) | no disponible | 4,65 GB (GGUF Q6_K) / 7,17 GB (INT8) | Apache 2.0 | Hugging Face |
| Qwen3-VL 32B (codificador sustituido) | 32B (según el autor) | no disponible | 15,7 GB | no disponible | no disponible |
| Alissonerdx/Molmo2-8B-Minimax-H3 | no disponible | no disponible | no disponible | no disponible | Hugging Face |

La comparación se limita a los datos aportados por el autor; no hay cifras de rendimiento de ninguno de los tres que permitan contrastar calidad más allá de la equivalencia visual declarada.

## Limitaciones y advertencias

- El modelo está truncado a la capa 25: no es utilizable como Molmo2-8B completo ni para tareas que requieran las capas superiores.
- No es un modelo conversacional ni un VLM de propósito general; su uso está restringido a codificador en pipelines H3.
- Las métricas de fidelidad (coseno 0,998, misma imagen, vídeo en 16 GB) son afirmaciones del autor sin verificación independiente ni reproducibilidad publicada.
- No se declaran idiomas soportados, lo que impide evaluar el comportamiento multilingüe del codificador.
- No hay información sobre sesgos, riesgo de alucinación ni evaluación de seguridad; al ser un codificador, los riesgos se trasladan al pipeline generativo que lo consume.
- La licencia Apache 2.0 del modelo base se mantiene, pero el uso comercial debe verificarse también contra las licencias de MiniMax H3, ComfyUI-Molmo2-H3 y el paquete de proyección de Alissonerdx.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día: no hay evidencia de uso en producción.
- La integración en ComfyUI depende de que el layout INT8 coincida exactamente con el paquete de Alissonerdx; cualquier cambio en ese paquete puede romper la compatibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KalponicStudio/Molmo2-8B-H3Encoder-Ojon
- Modelo base: https://huggingface.co/allenai/Molmo2-8B
- Paquete INT8 ConvRot de referencia: https://huggingface.co/Alissonerdx/Molmo2-8B-Minimax-H3
- Paper, blog, repositorio del nodo ComfyUI-Molmo2-H3 y demos: no disponibles en la informacion proporcionada.

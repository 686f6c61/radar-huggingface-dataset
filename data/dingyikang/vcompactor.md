# dingyikang/VCompactor

## Resumen

VCompactor es un conjunto de adaptadores de compresión de tokens visuales desarrollado por el usuario de Hugging Face dingyikang. No es un modelo de lenguaje completo, sino un módulo entrenado que sustituye los tokens de visión originales de un VLM congelado por un conjunto mucho más reducido de tokens compactos, sin modificar los pesos del modelo base. El repositorio contiene cinco subcarpetas, cada una asociada a un VLM concreto: LLaVA-OneVision-7B, LLaVA-Video-7B, Qwen3.6-35B-A3B y Qwen3.8-27B.

El problema que resuelve es el coste computacional y de memoria que supone procesar vídeo en modelos visión-lenguaje: un vídeo de 64 fotogramas puede generar más de 10.000 tokens visuales en el contexto, lo que dispara los requisitos de VRAM y degrada la latencia. VCompactor reduce esa cifra a 64 o 128 tokens compactos manteniendo una precisión razonable en benchmarks de comprensión de vídeo (MVBench, EgoSchema, LongVideoBench y Video-MME).

La relevancia actual radica en que permite reutilizar VLMs ya desplegados con un adaptador ligero (fp32, repo de 16,6 GB en total) y en que una de sus variantes, la Matryoshka, ofrece un único codificador que sirve varios presupuestos de tokens (32, 64, 128, 320 y 640), lo que facilita ajustar el equilibrio precisión-coste en producción sin reentrenar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador de compresión de tokens visuales sobre VLM congelado (no es un LLM autónomo) |
| Parámetros totales | no disponible (repo de 16,6 GB en fp32, repartido en 5 subcarpetas) |
| Parámetros activos | no disponible (el modelo base Qwen3.6-35B-A3B es MoE, pero VCompactor no es un MoE) |
| Longitud de contexto | no disponible (depende del VLM base) |
| Tipos de cuantización | pesos en fp32; no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (config.json + model.safetensors por subcarpeta) |

## Arquitectura y entrenamiento

VCompactor se implementa como un módulo externo que aprende representaciones visuales compactas para un VLM congelado. Los tokens compactos generados reemplazan a los tokens visuales originales en la entrada del VLM, de modo que el modelo base no se modifica en ningún momento. Cada subcarpeta del repositorio contiene el compactor específico para un VLM: `llava-onevision-7b-64tok`, `llava-onevision-7b-matryoshka`, `llava-video-7b-128tok`, `qwen3.6-35b-a3b-64tok` y `qwen3.8-27b-64tok`.

El entrenamiento se realizó sobre vídeos y preguntas del dataset LLaVA-Video-178K. La variante Matryoshka emplea un único codificador que soporta cinco presupuestos de tokens mediante `TOKENS_PER_STEP` = 1/2/4/10/20 tokens por fotograma, lo que permite truncar la representación a 32, 64, 128, 320 o 640 tokens según necesidad. La compresión por defecto reduce de 6.272 tokens visuales (LLaVA-OneVision) o 10.816 (LLaVA-Video) a entre 64 y 128 tokens compactos. En el caso de Qwen3.8 se restringe el primer token generado a las letras A-E (`ANSWER_LETTERS=ABCDE`) para forzar respuestas de opción múltiple.

## Capacidades

- Compresión de tokens visuales para vídeo: reduce de miles de tokens visuales a 64, 128 o presupuestos variables (32 a 640) por clip.
- Comprensión de vídeo sobre VLM congelados: mantiene la capacidad de responder preguntas sobre vídeos (MVBench, EgoSchema, LongVideoBench, Video-MME).
- Presupuesto de tokens ajustable con un solo codificador en la variante Matryoshka.
- Transferencia a imágenes: la variante Matryoshka también funciona en tareas de imagen (POPE, MME perception).
- Compatibilidad con cuatro VLM base distintos (LLaVA-OneVision-7B, LLaVA-Video-7B, Qwen3.6-35B-A3B, Qwen3.8-27B).
- No modifica los pesos del VLM base: se integra como adaptador externo.
- No se documentan capacidades de tool calling, agentes, audio ni thinking mode.

## Casos de uso

- Análisis de vídeo largo en producción: con 64 tokens compactos en lugar de más de 10.000, se puede procesar vídeo de decenas de fotogramas en GPUs con VRAM limitada, reduciendo el coste por inferencia.
- Despliegue de VLM existentes con menor huella de contexto: integrar el compactor sobre un LLaVA-OneVision-7B ya en producción para recortar el uso de memoria del KV cache sin reentrenar el modelo.
- Moderación de contenido audiovisual: clasificar clips con preguntas de opción múltiple (como hace la variante Qwen3.8 con `ANSWER_LETTERS=ABCDE`) para etiquetado automático a escala.
- Búsqueda y recuperación sobre archivos de vídeo: indexar descripciones compactas de clips para un motor de búsqueda semántica, aprovechando el bajo coste por fotograma.
- Investigación en eficiencia de VLMs: usar la variante Matryoshka como banco de pruebas para estudiar la curva precisión-presupuesto de tokens (de 32 a 640) con un único codificador.
- Análisis de imágenes con presupuesto variable: aplicar la variante Matryoshka a tareas de imagen (POPE, MME) ajustando tokens por recorte según la latencia objetivo.
- Prototipado académico: evaluar compresión de tokens visuales sin necesidad de entrenar un VLM desde cero, partiendo de modelos base Apache-2.0.

## Benchmarks y rendimiento

Precisión media sobre MVBench, EgoSchema, LongVideoBench y Video-MME (sin comprimir: 6.272 tokens visuales; 10.816 para LLaVA-Video):

| Subcarpeta | VLM congelado | Fotogramas | Tokens compactos | Precisión | Sin comprimir |
|---|---|---:|---:|---:|---:|
| llava-onevision-7b-64tok | LLaVA-OneVision-7B | 32 | 64 | 56,3 | 58,4 |
| llava-onevision-7b-matryoshka | LLaVA-OneVision-7B | 32 | 32 / 64 / 128 / 320 / 640 | 54,7 / 55,8 / 57,0 / 57,4 / 57,5 | 58,4 |
| llava-video-7b-128tok | LLaVA-Video-7B | 64 | 128 | 58,1 | 60,7 |
| qwen3.6-35b-a3b-64tok | Qwen3.6-35B-A3B | 64 | 64 | 64,8 | 70,6 |
| qwen3.8-27b-64tok | Qwen3.8-27B | 64 | 64 | 58,7 | 64,1 |

Resultados de la variante Matryoshka en imagen (tokens por recorte 2 / 4 / 10 / 20):

| Benchmark | 2 tok | 4 tok | 10 tok | 20 tok |
|---|---:|---:|---:|---:|
| POPE accuracy | 81,11 | 83,89 | 85,63 | 86,12 |
| MME perception | 1081,4 | 1140,0 | 1346,9 | 1375,3 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el compactor se suma al VLM base, por lo que el requisito dominante es el del VLM congelado más el adaptador (fp32).
- GPU recomendadas: no disponibles en la información proporcionada; el VLM base Qwen3.6-35B-A3B y Qwen3.8-27B requerirán GPUs de datacenter (A100, H100) o configuraciones multi-GPU; los modelos de 7B pueden caber en RTX 4090 con cuantización del base.
- Cabe en GPU consumer: los compactores para LLaVA-OneVision-7B y LLaVA-Video-7B son compatibles con GPUs consumer si el VLM base se ejecuta cuantizado; los de Qwen3.6-35B-A3B y Qwen3.8-27B no caben en una sola GPU consumer en fp16/fp32.
- Opciones de despliegue: código propio del repositorio `DingYikang/longvlm` (rama `release`), con `requirements.txt` para LLaVA y `requirements-qwen.txt` para Qwen. No se documenta integración con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La reducción de tokens visuales (de más de 6.000 a 64-128) reduce el coste de atención, pero no se publican cifras de latencia.

## Comparativa con modelos similares

| Modelo | Tipo | Tokens visuales | Precisión (media 4 benchmarks) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VCompactor (llava-onevision-7b-64tok) | Compresor sobre LLaVA-OneVision-7B | 64 | 56,3 | Apache-2.0 | Hugging Face |
| VCompactor (llava-video-7b-128tok) | Compresor sobre LLaVA-Video-7B | 128 | 58,1 | Apache-2.0 | Hugging Face |
| LLaVA-OneVision-7B sin comprimir | VLM completo | 6.272 | 58,4 | Apache-2.0 | Hugging Face |
| LLaVA-Video-7B sin comprimir | VLM completo | 10.816 | 60,7 | Apache-2.0 | Hugging Face |

No se dispone de datos de otros compresores de tokens visuales comparables en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el VLM base correspondiente y el código de `longvlm`; no funciona como pipeline estándar de transformers.
- Pérdida de precisión medible: entre 0,9 y 5,8 puntos según el VLM y el presupuesto de tokens (por ejemplo, Qwen3.6-35B-A3B cae de 70,6 a 64,8).
- Pesos en fp32: el repo ocupa 16,6 GB y no se ofrecen cuantizaciones alternativas, lo que encarece el despliegue.
- Idiomas soportados no documentados; el comportamiento multilingüe depende del VLM base.
- Entrenado sobre LLaVA-Video-178K: posible sesgo hacia los dominios y estilos de pregunta de ese dataset; conviene validar en el dominio objetivo.
- Riesgo de alucinación heredado del VLM base, agravado por la pérdida de información visual al comprimir.
- La variante Qwen3.8 restringe la respuesta a las letras A-E, lo que limita su uso a tareas de opción múltiple.
- Licencia Apache-2.0 para el compactor, pero el uso de los datos de entrenamiento queda sujeto a los términos de LLaVA-Video-178K.
- Sin descargas ni likes en el momento de la consulta: ecosistema y soporte comunitario muy limitados.

## Enlaces

- Hugging Face: https://huggingface.co/dingyikang/VCompactor
- Código: https://github.com/DingYikang/longvlm/tree/release
- VLM base LLaVA-OneVision-7B: https://huggingface.co/lmms-lab/llava-onevision-qwen2-7b-ov
- VLM base LLaVA-Video-7B: https://huggingface.co/lmms-lab/LLaVA-Video-7B-Qwen2
- VLM base Qwen3.6-35B-A3B: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Dataset de entrenamiento: https://huggingface.co/datasets/lmms-lab/LLaVA-Video-178K

# donedynamics/Qwen3.8-27B-heretic-VL-MLX-bf16

## Resumen

El modelo `donedynamics/Qwen3.8-27B-heretic-VL-MLX-bf16` es una conversión a formato MLX (Apple Silicon) en precisión bfloat16 del modelo `trohrbaugh/Qwen3.8-27B-heretic-ara`, que a su vez es una variante "abliterada" (sin comportamientos de rechazo) del modelo oficial `Qwen/Qwen3.8-27B` de Alibaba. Se trata de un modelo de visión-lenguaje (image-text-to-text) que conserva el codificador de visión completo, por lo que puede procesar imágenes junto con texto. El autor de esta conversión, donedynamics, ha verificado que la visión funciona correctamente mediante pruebas con imágenes sintéticas, confirmando la identificación de formas, colores, posiciones y lectura de texto.

El modelo está pensado para ejecutarse en hardware Apple Silicon mediante la librería `mlx-vlm`, y se distribuye en varias cuantizaciones (4, 6, 8 bits y bf16) para adaptarse a distintos presupuestos de memoria. Al ser una variante "heretic", no incluye alineación de seguridad, por lo que responderá a peticiones que un modelo con ajuste de seguridad rechazaría. Esto lo hace útil para investigación y casos de uso donde se requiere libertad de contenido, pero exige una evaluación cuidadosa antes de exponerlo a usuarios finales. La licencia Apache-2.0 se hereda a través de la cadena de derivación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con codificador de vision (arquitectura Qwen3.8) |
| Parametros totales | 27.356.728.560 (27,36 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base Qwen3.8-27B soporta hasta 262.144 tokens segun fuentes externas |
| Tipos de cuantizacion | bf16 (este repo), 4-bit, 6-bit, 8-bit (repos hermanos) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

El modelo base `Qwen/Qwen3.8-27B` es un transformer denso con codificador de vision integrado, disenado para tareas multimodales (imagen y texto). La variante "heretic" de trohrbaugh aplica una tecnica de "abliteracion" que elimina quirurgicamente los circuitos de rechazo del modelo, de modo que ya no se niega a responder a prompts que un modelo con ajuste de seguridad rechazaria. Esta operacion no anade ni elimina alineacion adicional; simplemente modifica los pesos para suprimir el comportamiento de rechazo.

La conversion a MLX realizada por donedynamics conserva el vision tower completo: de los 2180 tensores del modelo, 333 pertenecen al `vision_tower`, y la configuracion de vision (`vision_config`) esta presente. La conversion se realizo con `mlx-vlm` 0.6.13 a partir de los pesos bf16 de la revision `a67ae100d933c0d17af3232bda35825979fc63ce`. El modelo soporta un modo de razonamiento (thinking) activado por defecto, controlable mediante los parametros `enable_thinking` y `reasoning_effort` en la plantilla de chat.

## Capacidades

- Generacion de texto y respuestas a partir de imagenes (vision-lenguaje).
- Razonamiento multimodal: identifica formas, colores, posiciones y texto en imagenes (verificado por el autor).
- Modo de razonamiento extendido (thinking mode) que genera tokens de reflexion antes de la respuesta final.
- Soporte de tool calling y funciones agénticas, segun las caracteristicas del modelo base Qwen3.8-27B.
- Capacidad de seguir instrucciones complejas y mantener conversaciones multi-turno.
- Al ser una variante abliterada, no presenta barreras de rechazo ante contenido sensible o controvertido.

## Casos de uso

- Investigacion en alineacion y seguridad de modelos: al eliminar el rechazo, permite estudiar el comportamiento del modelo sin restricciones de seguridad, por ejemplo para analizar sesgos o medir la eficacia de tecnicas de desabliteracion.
- Generacion de contenido creativo sin filtros: escritura de ficcion, guiones o material narrativo que requiera explorar temas tabu o controversiales sin censura automatica.
- Analisis de imagenes en entornos controlados: el modelo puede describir o razonar sobre imagenes en aplicaciones de investigacion donde no se requiera moderacion de contenido.
- Desarrollo de agentes conversacionales experimentales: gracias al soporte de tool calling y razonamiento multi-paso, puede integrarse en prototipos de agentes que necesiten libertad de respuesta.
- Evaluacion comparativa de modelos abliterados: util para medir diferencias de rendimiento entre variantes con y sin alineacion en tareas de razonamiento, vision o codigo.
- Despliegue local en Apple Silicon: al ser una conversion MLX, permite ejecutar un modelo de 27B con vision en un Mac Studio o MacBook Pro con memoria unificada suficiente, sin depender de la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye mediciones de velocidad de generacion en un Mac Studio M3 Ultra (512 GB unificada, macOS 26.5.2, mlx-vlm 0.6.13) con un prompt multimodal de 470 tokens:

| Build | Bits/peso | Velocidad de generacion | Memoria pico |
|---|---|---|---|
| 4-bit | 4.695 | 38.9 tok/s | 19.2 GB |
| 6-bit | 6.661 | 29.2 tok/s | 27.0 GB |
| 8-bit | 8.627 | 23.1 tok/s | 34.7 GB |
| bf16 (este repo) | 16 | 13.2 tok/s | 55.8 GB |

El prompt processing se mantuvo entre 303 y 331 tok/s en todas las variantes. Estas cifras son orientativas, medidas en una unica ejecucion y un solo prompt.

## Requisitos de hardware

- Para la variante bf16 (este repo): requiere al menos 56 GB de memoria unificada en Apple Silicon. Se recomienda un Mac Studio M3 Ultra o MacBook Pro con 64 GB o mas de RAM unificada.
- Para la variante 4-bit: 19.2 GB de memoria pico, apta para Macs con 24 GB o mas.
- Para la variante 6-bit: 27.0 GB de memoria pico, apta para Macs con 32 GB o mas.
- Para la variante 8-bit: 34.7 GB de memoria pico, apta para Macs con 48 GB o mas.
- Solo compatible con hardware Apple Silicon (M-series) mediante `mlx-vlm`. No se puede ejecutar con CUDA ni ROCm.
- Despliegue mediante `mlx_vlm.generate` en linea de comandos o mediante la API Python de `mlx-vlm`.
- No es compatible con vLLM, llama.cpp u Ollama directamente, al ser un formato MLX especifico de Apple.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (oficial) | 27 B | 262k | Si | Apache-2.0 | Modelo base con alineacion de seguridad |
| trohrbaugh/Qwen3.8-27B-heretic-ara | 27 B | no disponible | Si | Apache-2.0 | Variante abliterada sin rechazo |
| donedynamics/Qwen3.8-27B-heretic-VL-MLX-bf16 | 27 B | no disponible | Si | Apache-2.0 | Conversion MLX del anterior, solo Apple Silicon |
| lyf/Qwen3.8-27B-Heretic-ARA-NVFP4-MTP-VL | 27 B | 192k/262k | Si | Apache-2.0 | Variante NVFP4 con MTP para vLLM |

No se dispone de datos de rendimiento comparativos (benchmarks) entre estas variantes.

## Limitaciones y advertencias

- Modelo abliterado: se ha eliminado el comportamiento de rechazo, por lo que puede generar contenido inapropiado, ofensivo o peligroso. No es apto para uso directo en produccion sin una capa de moderacion externa.
- Solo para Apple Silicon: el formato MLX no es portable a GPUs NVIDIA o AMD. Para otros entornos, usar las variantes originales en formato safetensors o GGUF.
- La conversion MLX no anade ni elimina alineacion: el modelo hereda los sesgos y limitaciones del modelo base Qwen3.8-27B, incluidos posibles sesgos de genero, raza o idioma.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede inventar informacion, especialmente en tareas de vision cuando la imagen es ambigua o de baja resolucion.
- El modo de razonamiento (thinking) esta activado por defecto y consume tokens antes de la respuesta, lo que puede agotar el presupuesto de `max_tokens` si no se configura adecuadamente.
- No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, etc.) para esta variante, por lo que su rendimiento relativo frente a otros modelos no esta cuantificado.
- La licencia Apache-2.0 permite uso comercial, pero el caracter "uncensored" puede implicar responsabilidades legales segun el contenido generado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/donedynamics/Qwen3.8-27B-heretic-VL-MLX-bf16
- Modelo base abliterado: https://huggingface.co/trohrbaugh/Qwen3.8-27B-heretic-ara
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Variante 4-bit (repos hermanos): https://huggingface.co/donedynamics/Qwen3.8-27B-heretic-MLX-4bit
- Articulo de AMD sobre Qwen3.8 27B: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Guia de ejecucion local (Yottalabs): https://www.yottalabs.ai/post/how-to-run-qwen-3-8-27b-locally-ollama-gguf-single-gpu-2026
- Ficha en Jetson AI Lab: https://www.jetson-ai-lab.com/models/qwen3-8-27b/
- Repositorio GitHub de version uncensored: https://github.com/Wassimyounes01/qwen38-uncensored

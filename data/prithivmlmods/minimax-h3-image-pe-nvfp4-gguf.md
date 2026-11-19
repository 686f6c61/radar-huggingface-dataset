# prithivMLmods/MiniMax-H3-Image-PE-NVFP4-GGUF

## Resumen

MiniMax-H3-Image-PE es el modelo de expansión de prompts que MiniMax utiliza como componente previo de su generador de imágenes MiniMax-H3-Image. Está afinado a partir de Qwen3.8-27B y su función es convertir una petición breve del usuario en una descripción de imagen detallada, devolviendo además una relación de aspecto recomendada en formato JSON con los campos `expanded_caption` y `aspect_ratio`. La variante aquí descrita es una cuantización NVFP4 en formato GGUF publicada por prithivMLmods, pensada para ejecutarse con aceleración nativa de tensor cores FP4 en GPUs NVIDIA Blackwell.

El modelo tiene 26.895.999.266 parámetros (aproximadamente 27B) y el repositorio ocupa 17,9 GB, con un archivo de pesos NVFP4 de 17 GB y un proyector multimodal de 931 MB. La arquitectura subyacente es la de Qwen3.8-27B, un transformer denso, y el pipeline declarado es `image-text-to-text`, por lo que admite entradas de imagen además de texto. El idioma declarado es únicamente inglés.

Su relevancia actual radica en dos factores: por un lado, expone como modelo independiente una pieza que normalmente queda oculta dentro de un pipeline de generación de imágenes, lo que permite integrarla en flujos propios; por otro, la cuantización NVFP4 demuestra la viabilidad de servir un modelo de 27B con unos 15 GiB de VRAM efectivos en hardware Blackwell. La licencia es la MiniMax-H3-Image Community License Agreement, no Apache 2.0, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3.8-27B) |
| Parametros totales | 26.895.999.266 (aprox. 27B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens en la configuracion de prueba publicada; no se especifica el maximo teorico |
| Tipos de cuantizacion | NVFP4 (4 bits, formato NVIDIA); KV cache en q8_0 en la prueba del autor |
| Idiomas soportados | Ingles (en) |
| Licencia | MiniMax-H3-Image Community License Agreement |
| Formato de pesos | GGUF (pesos NVFP4 + proyector multimodal mmproj) |

## Arquitectura y entrenamiento

El modelo es un transformer denso derivado de Qwen3.8-27B, afinado por MiniMax para la tarea concreta de expansión de prompts de generación de imágenes. La salida está restringida a un esquema JSON mediante XGrammar, de modo que el modelo no puede desviarse del formato `expanded_caption` / `aspect_ratio`. El modo de razonamiento está activado por defecto, con `reasoning_effort` en `xhigh` y un máximo de 4.096 tokens que incluyen el razonamiento; este razonamiento se devuelve en un campo separado de la respuesta. No se han publicado detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

La innovación técnica relevante en esta variante no está en la arquitectura sino en la cuantización: los pesos se han convertido a NVFP4 con NVIDIA ModelOpt y se empaquetan en GGUF para llama.cpp, aprovechando los tensor cores FP4 de las GPUs Blackwell (SM120, GB202, B200, B300). Los pesos cubren únicamente la expansión text-to-image. Para edición de imágenes, el release proporciona solo una plantilla de tarea y un ejemplo de ensamblado de mensajes para un modelo visión-lenguaje a elección del usuario, y la propia model card indica que el soporte de edición sigue en desarrollo.

## Capacidades

- Expansión de prompts: transforma una petición corta en una descripción de imagen detallada y estructurada.
- Recomendación de relación de aspecto: devuelve un campo `aspect_ratio` junto a la descripción expandida.
- Salida JSON con esquema forzado mediante XGrammar, lo que garantiza parseabilidad en pipelines automatizados.
- Modo de razonamiento activado por defecto, con el razonamiento devuelto por separado del resultado final.
- Entrada multimodal: el pipeline declarado es `image-text-to-text` y el repositorio incluye un proyector multimodal (`mmproj`) de 931 MB.
- En modo edición (soporte en desarrollo), describe qué se preserva y qué se cambia, y devuelve un `target_aspect_ratio`.
- No se documenta soporte explícito de tool calling, function calling ni comportamiento agéntico multi-paso.
- Capacidad multilingüe limitada: solo se declara inglés.

## Casos de uso

- Preprocesado en pipelines de text-to-image: el modelo se coloca delante de un generador como MiniMax-H3-Image para convertir prompts escuetos de usuario en descripciones ricas, mejorando la fidelidad del resultado sin tocar el generador.
- Automatización de interfaces de creación de imágenes: al devolver JSON validado por esquema, la salida se puede consumir directamente por un orquestador que seleccione relación de aspecto y parámetros de render sin parsing frágil.
- Enriquecimiento por lotes de catálogos de prompts: procesar miles de peticiones breves en una cola y generar descripciones expandidas listas para revisión o generación posterior.
- Herramientas internas de equipos de diseño: un formulador que traduzca una idea escueta del equipo creativo en una especificación de imagen detallada y consistente.
- Servicio local en estaciones de trabajo con GPU Blackwell: con unos 15 GiB de VRAM efectivos en la prueba del autor, se puede desplegar en una RTX PRO 6000 o en GPUs de la serie 50 para uso individual sin depender de la nube.
- Experimentación con edición de imágenes asistida: usando la plantilla de tarea y el ejemplo de ensamblado de mensajes incluidos, se puede prototipar un flujo de edición que describa preservaciones y cambios, asumiendo que el soporte es todavía incompleto.
- Investigación sobre expansión de prompts: al ser un modelo aislado y cuantizado, permite medir el impacto de la expansión de prompts en la calidad final de un generador de imágenes de forma controlada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card indica explícitamente que no incluye benchmarks.

Sí se publican métricas de inferencia para la cuantización NVFP4 en hardware concreto:

| Metrica | Valor |
|---|---|
| GPU | NVIDIA RTX PRO 6000 Blackwell Server Edition (96 GB VRAM) |
| Velocidad media de procesamiento de prompt | 326,89 tokens/s |
| Velocidad media de generación | 74,94 tokens/s |
| Tiempo total de ejecucion | 77,5 s |
| Longitud de contexto en la prueba | 8.192 tokens |
| KV cache | q8_0 |
| VRAM pico | 14,94 GiB |
| Utilizacion pico de GPU | 96% |
| Capas offloaded | 99 (`-ngl 99`) |
| Decodificacion especulativa | No |
| Repeticiones | 5 |

## Requisitos de hardware

- VRAM estimada: aproximadamente 19 GiB según la model card para la ruta Diffusers con pesos FP4; la prueba con llama.cpp registra un pico de 14,94 GiB con contexto de 8.192 tokens y KV cache en q8_0.
- GPU recomendadas: NVIDIA Blackwell, es decir, RTX PRO 6000, serie RTX 50, B200 y B300. La aceleración FP4 nativa depende de estos chips (SM120, GB202).
- Cabe en GPU de consumo de la generación Blackwell (serie RTX 50) siempre que se disponga de VRAM suficiente para pesos, proyector multimodal y KV cache; en generaciones anteriores no se aprovecha la aceleración FP4.
- Opciones de despliegue: llama.cpp (`llama-cli` documentado, con `-ngl 99`), SGLang 0.5.23 o superior, y los bloques de Modular Diffusers. También se etiqueta compatibilidad con text-generation-inference.
- Rendimiento observado: 326,89 tokens/s de procesamiento de prompt y 74,94 tokens/s de generación en RTX PRO 6000 con offload total.
- Nota: la ruta Diffusers ejecuta las activaciones en bf16, por lo que sus salidas difieren ligeramente de las del despliegue con SGLang.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| MiniMax-H3-Image-PE-NVFP4-GGUF (este) | 26,9B | 8.192 en prueba | GGUF NVFP4 | MiniMax-H3-Image Community License | Especializado en expansion de prompts, solo ingles, requiere Blackwell para FP4 |
| MiniMaxAI/MiniMax-H3-Image-PE (base) | 26,9B | No disponible | FP4 (formato original) | MiniMax-H3-Image Community License | Modelo original del que deriva esta cuantizacion |
| Qwen3.8-27B | 27B | No disponible | No disponible | Apache 2.0 | Base del afinado; licencia permisiva, proposito general |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- La licencia es la MiniMax-H3-Image Community License Agreement, no Apache 2.0, y algunos usos requieren autorización escrita adicional de MiniMax; conviene revisar el texto completo antes de un despliegue comercial.
- El modelo solo declara soporte de inglés, lo que limita su uso en productos en castellano sin un paso de traducción previo.
- El soporte de edición de imágenes está explícitamente en desarrollo; el release solo aporta una plantilla de tarea y un ejemplo de ensamblado de mensajes.
- El razonamiento está activado por defecto con `reasoning_effort` en `xhigh` y hasta 4.096 tokens, lo que incrementa el coste y la latencia frente a una generación directa.
- La cuantización NVFP4 está optimizada para Blackwell; en GPUs anteriores se pierde la ventaja de los tensor cores FP4 y el rendimiento puede degradarse.
- Las salidas de la ruta Diffusers (activaciones en bf16) difieren ligeramente de las de SGLang, lo que puede afectar a la reproducibilidad entre entornos.
- No se han publicado benchmarks de calidad, por lo que no hay evidencia cuantitativa sobre su precisión en expansión de prompts frente a alternativas.
- Existe una versión posterior publicada por el mismo autor (`prithivMLmods/MiniMax-H3-Image-PE-NVFP4-MTP-GGUF`), señalada en la model card como `new_version`.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; al tratarse de un modelo de lenguaje generativo, son aplicables las advertencias habituales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/prithivMLmods/MiniMax-H3-Image-PE-NVFP4-GGUF
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image-PE
- Licencia: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image/blob/main/LICENSE
- Version posterior (MTP): https://huggingface.co/prithivMLmods/MiniMax-H3-Image-PE-NVFP4-MTP-GGUF
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Perfil del autor de la cuantizacion: https://huggingface.co/prithivMLmods

# prithivMLmods/MiniMax-H3-Image-PE-NVFP4-MTP-Repacked

## Resumen

MiniMax-H3-Image-PE-NVFP4-MTP-Repacked es una versión cuantizada a NVFP4 (FP4 de NVIDIA) y reempaquetada del modelo MiniMax-H3-Image-PE, el modelo de expansión de prompts que MiniMax ha desarrollado para alimentar su generador de imágenes MiniMax-H3-Image. El modelo original está afinado a partir de Qwen3.8-27B y su función es convertir una petición breve del usuario en una descripción de imagen detallada, devolviendo además una recomendación de relación de aspecto en formato JSON con los campos `expanded_caption` y `aspect_ratio`, con la salida restringida a un esquema mediante XGrammar. Este reempaquetado lo publica el usuario prithivMLmods e incorpora pesos en NVFP4 con decodificación especulativa MTP (multi-token prediction), pensados para GPUs NVIDIA Blackwell (SM120, GB202, B200, B300).

La relevancia del modelo reside en su rol como pieza intermedia de un pipeline de generación de imágenes: no genera imágenes, sino que enriquece el prompt textual que consumirá el generador. Con 27.781.427.952 parámetros totales (unos 27,8 mil millones) y un repositorio de 18,8 GB, el formato NVFP4 reduce la huella de memoria hasta unos 19 GiB de VRAM según la model card, lo que lo hace viable en hardware profesional Blackwell y en configuraciones de consumo de gama alta con suficiente memoria.

La ficha se centra en el modelo reempaquetado tal como se distribuye en Hugging Face, con licencia MiniMax-H3-Image Community License Agreement (no Apache 2.0), lo que condiciona su uso comercial. El modelo base Qwen3.8-27B sí es Apache 2.0, pero la licencia del derivado prevalece.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3.8-27B) con cabeza MTP para decodificación especulativa |
| Parámetros totales | 27.781.427.952 (≈27,8 B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | NVFP4 (FP4 de NVIDIA), con pesos en BF16/U8 según la tabla de ficheros; existe variante GGUF publicada aparte |
| Idiomas soportados | Inglés (en) |
| Licencia | MiniMax-H3-Image Community License Agreement (other); el base Qwen3.8-27B es Apache 2.0 |
| Formato de pesos | safetensors (4 shards) + configs JSON; GGUF disponible en repo separado |

## Arquitectura y entrenamiento

El modelo es un transformer denso de aproximadamente 27,8 mil millones de parámetros, fine-tuneado desde Qwen3.8-27B. Incorpora una cabeza MTP (multi-token prediction) que habilita decodificación especulativa, de ahí el sufijo MTP del reempaquetado. La salida está restringida mediante XGrammar a un esquema JSON con dos campos: `expanded_caption` (la descripción detallada de la imagen) y `aspect_ratio` (la relación de aspecto recomendada). El modo thinking está activado por defecto con `reasoning_effort` en xhigh y un máximo de 4.096 tokens incluyendo el razonamiento, que se devuelve por separado del JSON final.

Los pesos cubren la expansión text-to-image. Para edición de imágenes, la release original solo proporciona un prompt de tarea y un ejemplo de ensamblado de mensajes para un modelo visión-lenguaje a elección del usuario; la propia model card indica que el soporte de edición sigue en desarrollo. En modo edición el modelo describe qué se preserva y qué se cambia, y devuelve un `target_aspect_ratio`. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

La cuantización NVFP4 se ha realizado con NVIDIA ModelOpt (etiquetas Model Optimizer y ModelOpt), orientada a GPUs Blackwell. El despliegue puede hacerse con SGLang (0.5.23 o posterior) o localmente mediante los bloques de Modular Diffusers, donde los pesos FP4 ocupan unos 19 GiB de VRAM; en la ruta Diffusers las activaciones corren en bf16, por lo que las salidas difieren ligeramente del despliegue con SGLang.

## Capacidades

- Expansión de prompts: transforma una petición corta en una descripción de imagen detallada y estructurada.
- Salida JSON con esquema forzado: campos `expanded_caption` y `aspect_ratio`, garantizados por XGrammar.
- Recomendación de relación de aspecto para el generador de imágenes.
- Modo thinking por defecto: razonamiento separado de la salida final, con `reasoning_effort` configurable (xhigh por defecto) y límite de 4.096 tokens incluyendo razonamiento.
- Decodificación especulativa MTP: acelera la generación mediante predicción multi-token.
- Soporte de edición (en desarrollo): descripción de preservación/cambios y `target_aspect_ratio`, con prompt de tarea y ensamblado de mensajes para un VLM externo.
- Procesamiento multimodal image-text-to-text según el pipeline declarado, con `processor_config.json` para texto y visión.
- Conversacional: incluye `chat_template.jinja` para formatear diálogos.
- Idioma: inglés.

## Casos de uso

- Pipeline de generación de imágenes text-to-image: el modelo recibe la petición breve del usuario y devuelve un `expanded_caption` detallado más la relación de aspecto, que se pasa directamente al generador MiniMax-H3-Image; su salida JSON con esquema fijo simplifica la integración sin parseo frágil.
- Enriquecimiento automático de prompts en herramientas creativas: un editor o plugin puede llamar al modelo para convertir una idea escueta en una descripción rica antes de invocar el generador, mejorando la fidelidad del resultado sin que el usuario escriba prompts largos.
- Generación por lotes de descripciones consistentes: en producción de assets gráficos, el modelo produce captions estructuradas y homogéneas para cientos de peticiones, con la relación de aspecto normalizada por el esquema.
- Razonamiento previo a la generación: el modo thinking separado permite auditar el razonamiento del modelo (hasta 4.096 tokens) antes de aceptar el caption, útil en flujos con control de calidad.
- Edición de imágenes asistida (experimental): usando el prompt de tarea y el ensamblado de mensajes con un VLM externo, el modelo describe qué preservar y qué cambiar y sugiere `target_aspect_ratio`; adecuado para prototipos mientras el soporte de edición siga en desarrollo.
- Despliegue de alta concurrencia en Blackwell: con SGLang y pesos NVFP4 más MTP, el modelo cabe en unos 19 GiB de VRAM y puede servirse con decodificación especulativa en GPUs B200/B300 o RTX Pro 6000 para atender múltiples peticiones de expansión de prompts.
- Integración en plataformas de agentes: al devolver JSON estructurado, el modelo puede actuar como herramienta (tool) dentro de un agente que orqueste generación de imágenes y edición.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card original no incluye métricas de MMLU, HumanEval, GSM8K ni similares, y el reempaquetado tampoco aporta datos.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 19 GiB con pesos NVFP4 según la model card (ruta Modular Diffusers, activaciones en bf16).
- GPUs recomendadas: NVIDIA Blackwell, en concreto SM120/GB202, RTX Pro 6000, B200 y B300, según las etiquetas del repositorio.
- Cabe en GPU de consumo: no hay confirmación explícita; los 19 GiB de VRAM quedan por encima de las GPUs de consumo de 16 GB y requieren modelos de 24 GB o más, siempre que soporten NVFP4 (Blackwell).
- Opciones de despliegue: SGLang 0.5.23 o posterior; Modular Diffusers; llama.cpp/llama-cli mediante la variante GGUF publicada aparte; text-generation-inference según etiquetas.
- Latencia y throughput: no disponibles; la decodificación especulativa MTP está pensada para reducir latencia, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax-H3-Image-PE-NVFP4-MTP-Repacked (este) | ≈27,8 B | No disponible | NVFP4, GGUF | MiniMax-H3-Image Community License | Hugging Face, SGLang, Diffusers, llama.cpp |
| MiniMaxAI/MiniMax-H3-Image-PE (base) | No disponible | No disponible | FP4 (original) | MiniMax-H3-Image Community License | Hugging Face, SGLang, Diffusers |
| Qwen/Qwen3.8-27B (base del fine-tune) | ≈27 B (según nombre) | No disponible | No disponible | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Licencia restrictiva: MiniMax-H3-Image Community License Agreement, no Apache 2.0; algunos usos requieren autorización escrita adicional de MiniMax.
- Idioma: solo inglés declarado, lo que limita su uso directo en castellano u otros idiomas.
- Soporte de edición incompleto: la propia model card indica que sigue en desarrollo y depende de un VLM externo para el ensamblado de mensajes.
- Diferencias de salida entre rutas de despliegue: la ruta Diffusers usa activaciones bf16 y produce resultados ligeramente distintos a SGLang.
- Riesgo de alucinación: como modelo generativo de texto, puede inventar detalles en el caption expandido; el esquema JSON no valida la veracidad del contenido.
- Sesgos: no se documentan sesgos conocidos en la información disponible.
- Contexto: no se especifica la longitud de ventana, dato crítico para prompts largos.
- Dependencia de hardware Blackwell para NVFP4: en GPUs anteriores el formato no es aprovechable y hay que recurrir a la variante GGUF.
- Repositorio con 0 descargas y 1 like: ecosistema muy incipiente, sin validación comunitaria amplia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/prithivMLmods/MiniMax-H3-Image-PE-NVFP4-MTP-Repacked
- Variante GGUF: https://huggingface.co/prithivMLmods/MiniMax-H3-Image-PE-NVFP4-MTP-GGUF
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image-PE
- Base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Licencia: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image/blob/main/LICENSE

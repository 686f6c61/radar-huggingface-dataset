# DarkRomeo88/gemma-4-12b-it-heretic-comfyui

## Resumen

DarkRomeo88/gemma-4-12b-it-heretic-comfyui es una conversión en un único archivo (formato diffusion-single-file) del modelo Gemma 4 12B de Google, ajustado a partir de la variante sin censura «Heretic» de llmfan46. El objetivo declarado del autor es ofrecer un archivo listo para su uso como text encoder dentro del ecosistema ComfyUI, el entorno de generación por nodos ampliamente utilizado en la comunidad de difusión. Se trata de un modelo con licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

El modelo base, google/gemma-4-12B-it, es un LLM multimodal de 12.000 millones de parámetros con ventana de contexto de hasta 256.000 tokens, capaz de procesar texto, imagen, vídeo y audio. La variante "Heretic" elimina los filtros de seguridad del modelo original, lo que lo convierte en una opción para tareas que requieren respuestas sin restricciones de contenido. Este repositorio concreto presenta la conversión a un formato de archivo único compatible con ComfyUI, con 0 descargas y 0 likes en el momento de la redacción de esta ficha, lo que indica un proyecto incipiente y sin validación comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (VLM, texto, imagen, vídeo y audio) basada en google/gemma-4-12B-it |
| Parametros totales | 12.000 millones (12B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Hasta 256.000 tokens (según documentación de ComfyUI para Gemma 4) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el modelo base de Google soporta múltiples idiomas, pero la variante convertida no documenta el listado) |
| Licencia | Apache-2.0 |
| Formato de pesos | diffusion-single-file (archivo único para ComfyUI) |

## Arquitectura y entrenamiento

El modelo se construye sobre la arquitectura de Gemma 4 12B de Google DeepMind, un transformer multimodal entrenado para comprender y generar texto, imágenes, vídeo y audio. El modelo base `google/gemma-4-12B-it` es la variante instruida (instruction-tuned) de la familia Gemma 4, desarrollada siguiendo los mismos protocolos de seguridad que los modelos propietarios de Google. La variante "Heretic" de llmfan46 aplica técnicas de abliteración o fine-tuning sin censura sobre el modelo base, eliminando los rechazos de contenido sensible.

En este repositorio, el autor DarkRomeo88 ha convertido la variante Heretic al formato diffusion-single-file, un contenedor de pesos pensado para ser cargado directamente como text encoder en flujos de trabajo de ComfyUI. No se proporcionan datos sobre el proceso de conversión, la composición del dataset de entrenamiento, ni el número de tokens utilizados. La licencia Apache-2.0 se hereda del modelo base de Google, aunque la variante sin censura añade consideraciones éticas y legales adicionales que se detallan en la sección de limitaciones.

## Capacidades

- Generación de texto y razonamiento multilingüe heredados de Gemma 4 12B, incluyendo comprensión de imágenes, vídeo y audio.
- Integración directa con ComfyUI como text encoder, permitiendo flujos de trabajo de generación de imágenes y vídeo que combinan comprensión visual y generación de texto.
- Modo sin censura: el modelo no rechaza peticiones de contenido sensible, violento, sexual o controvertido, a diferencia de la variante oficial de Google.
- Ventana de contexto extendida de hasta 256.000 tokens, útil para procesar documentos largos, vídeos completos o conversaciones multi-turno extensas.
- Compatible con la API de ComfyUI y con los nodos de LLM de la plataforma, lo que facilita su uso en pipelines de automatización.

## Casos de uso

- Generación de imágenes y vídeo en ComfyUI: el modelo se puede usar como text encoder para guiar la generación de imágenes y vídeos con prompts detallados, aprovechando su capacidad multimodal para entender referencias visuales.
- Análisis de vídeo y audio en local: gracias a su contexto de 256K tokens, puede transcribir y analizar vídeos completos o grabaciones de audio en un solo paso, útil para investigadores que trabajan con datos multimedia sin enviar información a la nube.
- Creación de contenido narrativo sin restricciones: escritores y creadores pueden generar guiones, diálogos o descripciones con contenido adulto o violento sin que el modelo rechace las peticiones, algo que los modelos censurados bloquean.
- Desarrollo de asistentes de rol y personajes: la ausencia de filtros permite construir agentes conversacionales con personalidades complejas y respuestas sin censura, adecuados para juegos de rol o simulación de escenarios.
- Investigación en seguridad de IA: los investigadores pueden estudiar el comportamiento de un modelo sin filtros de seguridad, comparando sus respuestas con la variante oficial para evaluar el impacto de la abliteración.
- Pipelines de subtitulado y descripción de contenido: integrado en ComfyUI, puede generar descripciones de imágenes, vídeos y audio para subtitulado automático, etiquetado de archivos o accesibilidad, con la ventaja de ejecución completamente local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de rendimiento, y no se dispone de evaluaciones de MMLU, HumanEval, GSM8K o similares para esta conversión concreta. Los benchmarks del modelo base Gemma 4 12B de Google están disponibles en la documentación oficial de DeepMind, pero no se han reproducido en esta ficha para evitar atribuir resultados de la variante oficial a esta conversión sin censura.

## Requisitos de hardware

- VRAM estimada: un modelo de 12B parámetros en precisión fp16 requiere aproximadamente 24 GB de VRAM para inferencia. Con cuantización a 8 bits se reduce a unos 12-14 GB, y a 4 bits a unos 6-8 GB, aunque este repositorio no proporciona archivos cuantizados específicos.
- GPU recomendadas: para fp16 completo se necesita una GPU de 24 GB o más, como RTX 4090, A100 40GB o H100. Con cuantización, una RTX 3090 (24 GB) o RTX 4070 (12 GB) pueden ser suficientes.
- Compatibilidad con GPU de consumo: sí, con cuantización a 4 bits cabe en GPUs de 8-12 GB como RTX 4070 o RTX 4060, aunque con rendimiento reducido.
- Opciones de despliegue: dado que el formato es diffusion-single-file, el despliegue principal es a través de ComfyUI. El modelo base también se puede ejecutar con vLLM, llama.cpp, Ollama o TGI, pero esta conversión concreta no está probada en esos entornos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| google/gemma-4-12B-it (oficial) | 12B | 256K | Apache-2.0 | safetensors | Con filtros de seguridad, multimodal |
| llmfan46/gemma-4-12B-it-uncensored-heretic | 12B | 256K | Apache-2.0 | safetensors | Variante sin censura, base de este repositorio |
| DarkRomeo88/gemma-4-12b-it-heretic-comfyui | 12B | 256K | Apache-2.0 | diffusion-single-file | Conversión para ComfyUI, sin censura |
| Qwen 3.6 abliterated (alternativa sin censura) | 14B | 128K | Apache-2.0 | safetensors/GGUF | Otra opción sin censura en el mercado |

La comparativa se basa en la información disponible; los datos de Qwen 3.6 abliterated proceden de la guía de InsiderLLM, que lo menciona como alternativa sin censura en la misma categoría de VRAM.

## Limitaciones y advertencias

- Modelo sin filtros de seguridad: la variante "heretic" ha eliminado los mecanismos de rechazo de contenido, lo que puede generar respuestas inapropiadas, ofensivas o peligrosas en contextos de producción. No se recomienda su uso en sistemas de cara al público sin supervisión humana.
- Riesgo de alucinación: al igual que el modelo base, puede inventar datos, citas o información falsa, especialmente en tareas de razonamiento complejo o de hechos específicos.
- Sin benchmarks propios: no hay métricas de rendimiento validadas para esta conversión, por lo que no se puede garantizar que las capacidades del modelo base se mantengan intactas tras la conversión.
- Cero adopción comunitaria: con 0 descargas y 0 likes, el modelo no ha sido validado por la comunidad. Su funcionamiento en ComfyUI no está confirmado por terceros.
- Riesgo legal: el uso de contenido generado sin censura puede violar las políticas de plataformas de distribución o las leyes de contenido en algunas jurisdicciones. La licencia Apache-2.0 no exime de responsabilidad legal.
- Formato limitado: el formato diffusion-single-file está pensado exclusivamente para ComfyUI; no es directamente utilizable con vLLM, Ollama o la mayoría de los frameworks de inferencia estándar.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/DarkRomeo88/gemma-4-12b-it-heretic-comfyui
- Modelo base oficial de Google: https://huggingface.co/google/gemma-4-12B
- Documentación de ComfyUI para Gemma 4: https://docs.comfy.org/tutorials/llm/gemma4/gemma4
- Página oficial de Gemma 4 en Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Guía de modelos sin censura por VRAM (InsiderLLM): https://insiderllm.com/guides/best-uncensored-local-llms/

# openbmb/MiniCPM-V-4.6-Thinking

## Resumen

MiniCPM-V 4.6 Thinking es la variante de razonamiento con cadena de pensamiento larga del modelo multimodal MiniCPM-V 4.6, desarrollado por OpenBMB. Se trata de un MLLM (modelo de lenguaje multimodal) de tipo "pocket-sized" disenado para ejecutarse en dispositivos de borde, incluidos telefonos moviles, manteniendo capacidades de comprension de imagen y video. El modelo combina un codificador visual SigLIP2-400M con un LLM Qwen3.5-0.8B, sumando aproximadamente 1.300 millones de parametros totales segun los pesos en safetensors.

La innovacion principal de esta variante Thinking es que genera una traza de razonamiento explicita antes de emitir la respuesta final, lo que incrementa el rendimiento en tareas complejas de razonamiento multimodal, matematicas y OCR intensivo, manteniendo la misma arquitectura ligera que la version instruct. Incorpora ademas la compresion mixta de tokens visuales 4x/16x de MiniCPM-V 4.6, que permite reducir el coste computacional del procesamiento de imagenes.

Su relevancia actual radica en que demuestra que es posible desplegar razonamiento multimodal de calidad en hardware de consumo y en telefonos (iOS, Android y HarmonyOS), con licencia Apache 2.0, lo que facilita su adopcion tanto en investigacion como en productos comerciales con requisitos de privacidad y latencia estrictos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal: codificador visual SigLIP2-400M + LLM Qwen3.5-0.8B |
| Parametros totales | 1.300.428.016 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el repo ocupa 2,6 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura multimodal compuesta por un codificador visual SigLIP2 de 400 millones de parametros y un modelo de lenguaje Qwen3.5 de 0.800 millones de parametros, unidos mediante un proyector multimodal. La variante Thinking anade una fase de razonamiento explicito (long chain-of-thought) antes de la respuesta final, manteniendo la arquitectura "edge-friendly" de la version base MiniCPM-V 4.6.

Una de las innovaciones tecnicas destacables es la compresion mixta de tokens visuales con modos 4x y 16x, seleccionable en inferencia mediante el parametro `downsample_mode`. El modo 16x reduce el numero de tokens visuales para escenarios de eficiencia, mientras que el modo 4x preserva mayor detalle para tareas de OCR o analisis fino. El procesamiento de imagenes admite ademas `max_slice_nums` para controlar el troceado de imagenes de alta resolucion. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en la informacion proporcionada.

## Capacidades

- Comprension de imagen y video (pipeline image-text-to-text), con soporte de multiples imagenes y video.
- Razonamiento multimodal con cadena de pensamiento explicita (modo Thinking) antes de la respuesta final.
- Razonamiento matematico y tareas de OCR intensivo, segun la model card.
- Comprension de imagenes de alta resolucion mediante troceado adaptativo (`max_slice_nums`) y compresion de tokens visuales 4x/16x.
- Conversacion multiturno (tag `conversational`).
- Despliegue en dispositivos de borde: iOS, Android y HarmonyOS.
- Compatibilidad con endpoints (`endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Cobertura multilingue: no disponible en la informacion proporcionada.

## Casos de uso

- OCR y digitalizacion de documentos en movil: el modelo puede extraer texto de tickets, formularios y documentos capturados con la camara del telefono, usando `downsample_mode="4x"` para preservar detalle en caracteres pequenos, como muestran los ejemplos de la model card en iPhone, Android y HarmonyOS.
- Asistencia educativa con resolucion de problemas: gracias al modo Thinking, el modelo genera la traza de razonamiento paso a paso antes de la respuesta, lo que resulta adecuado para explicar ejercicios de matematicas o fisica a partir de una foto del enunciado.
- Analisis de imagenes tecnicas y cientificas: el ejemplo de refraccion de la model card ilustra el uso para explicar fenomenos fisicos a partir de una imagen, con capacidad de razonamiento causal.
- Comprension de video en dispositivos: la inferencia de video con Transformers (torchcodec o PyAV) permite resumir o describir clips directamente en el dispositivo, util para accesibilidad o analisis de contenido grabado.
- Asistentes de accesibilidad: descripcion de escenas y lectura de texto para usuarios con discapacidad visual, ejecutandose localmente en el telefono sin enviar imagenes a la nube.
- Procesamiento con privacidad en el borde: al ejecutarse en el dispositivo, permite analizar documentos sensibles (identificaciones, informes medicos) sin transmitir datos a servidores externos.
- Prototipado rapido con la API publica: OpenBMB ofrece una API gratuita con clave publica, adecuada para evaluar el modelo antes de desplegarlo en produccion.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks en la informacion disponible. La model card incluye graficas de rendimiento (comparativa Thinking vs. Instruct, throughput en alta concurrencia y TTFT por peticion) pero sin valores numericos textuales en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1.300 millones de parametros, en bfloat16 requiere aproximadamente 2,6 GB de pesos; en cuantizaciones de 8 o 4 bits el requisito baja de forma proporcional (valores exactos no disponibles).
- GPU recomendadas: no disponibles de forma explicita; por tamano, cabe en GPUs de consumo como RTX 3060/4060/4090. La model card recomienda Flash Attention 2 para aceleracion y ahorro de memoria en escenarios multi-imagen y video.
- Cabe en GPU de consumo: si, dado el tamano del modelo; tambien esta disenado para ejecutarse en telefonos iOS, Android y HarmonyOS.
- Opciones de despliegue: Transformers (>=5.7.0) con `AutoModelForImageTextToText`; el procesamiento de video requiere `torchcodec` o `av` (PyAV) como alternativa por compatibilidad CUDA. Otras opciones como vLLM, llama.cpp, Ollama o TGI no estan confirmadas en la informacion disponible.
- Latencia y throughput: la model card incluye graficas de throughput en alta concurrencia y TTFT de una sola peticion, pero sin cifras numericas en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| MiniCPM-V 4.6 Thinking | ~1,3 B (SigLIP2-400M + Qwen3.5-0.8B) | no disponible | Apache 2.0 | Variante con razonamiento explicito, despliegue en movil |
| MiniCPM-V 4.6 (Instruct) | ~1,3 B (misma arquitectura) | no disponible | Apache 2.0 | Version sin cadena de pensamiento, mas rapida |
| Otros MLLM ligeros de borde | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- La informacion sobre sesgos conocidos no esta disponible en la documentacion proporcionada.
- Riesgo de alucinacion inherente a los modelos generativos, especialmente en el modo Thinking con cadenas de razonamiento largas; conviene validar respuestas en tareas criticas.
- Longitud de contexto no documentada, lo que dificulta planificar escenarios con muchas imagenes o videos largos.
- Idiomas soportados no disponibles; la cobertura multilingue no puede confirmarse.
- Aunque la licencia es Apache 2.0 y permite uso comercial, deben revisarse las condiciones de los componentes subyacentes (Qwen3.5 y SigLIP2) y de las dependencias de inferencia.
- El procesamiento de video con `torchcodec` puede fallar segun la version de CUDA; se recomienda PyAV o fijar la version de CUDA.
- El modo Thinking incrementa la latencia y el numero de tokens generados frente a la variante Instruct, lo que puede no ser adecuado para aplicaciones en tiempo real estricto.

## Enlaces

- Hugging Face: https://huggingface.co/openbmb/MiniCPM-V-4.6-Thinking
- Version Instruct: https://huggingface.co/openbmb/MiniCPM-V-4.6
- GitHub: https://github.com/OpenBMB/MiniCPM-o
- Wiki (chino): https://openbmb.cn/docs/
- CookBook: https://github.com/OpenSQZ/MiniCPM-V-CookBook
- Demo: https://huggingface.co/spaces/openbmb/MiniCPM-V-4.6-Thinking-Demo
- Documentacion de la API: https://github.com/OpenBMB/MiniCPM-V/blob/main/docs/api.md
- Papers referenciados en los tags: arXiv 2604.27393, arXiv 2509.18154, arXiv 2408.01800, arXiv 2605.08985

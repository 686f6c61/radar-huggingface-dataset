# dylanqi27/NExTGPT

## Resumen

NExT-GPT es un modelo multimodal de tipo *any-to-any* presentado en el paper "NExT-GPT: Any-to-Any Multimodal LLM" (ICML 2024, Oral). El repositorio `dylanqi27/NExTGPT` no es el modelo original, sino una reproducción de su interfaz de entrada/salida multimodal, empaquetada como aplicación Gradio en Hugging Face Spaces. La arquitectura original combina un codificador multimodal ImageBind-Huge con un LLM basado en Vicuna-7B v0 y tres módulos de difusión para generar imagen (Stable Diffusion v1-5), vídeo (ZeroScope v2_576w) y audio (AudioLDM-l-full).

El repositorio distingue tres modos de ejecución: `offline` (materiales de relleno en CPU, sin pesos), `lite` (llamadas a la API serverless de Hugging Face con Qwen2.5-7B-Instruct, FLUX.1-schnell, MMS-TTS y LTX-Video) y `full` (requiere los pesos oficiales `7b_tiva_v0` y al menos una GPU A100 de 40 GB). Solo el modo `full` constituye una reproducción a nivel de pesos; los otros dos son reproducciones a nivel de interfaz.

Es relevante como referencia docente y como punto de partida para reproducir un pipeline multimodal de extremo a extremo con tokens de señal, pero no debe confundirse con el modelo oficial ni usarse en producción: el repositorio tiene 0 descargas, 0 likes y no declara licencia propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multimodal any-to-any: ImageBind-Huge (encoder) + proyección de entrada + LLM Vicuna-7B v0 + proyección de salida + difusores (SD v1-5, ZeroScope v2_576w, AudioLDM-l-full) |
| Parametros totales | No disponible (el LLM base es de 7B; el total del sistema no se especifica) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible en el repositorio; el código oficial NExT-GPT es BSD-3-Clause con restricción a investigación no comercial, los pesos `ChocoWu/nextgpt_7b_tiva_v0` son CC-BY-NC-SA-4.0 y LLaMA está bajo licencia no comercial de Meta |
| Formato de pesos | `pytorch_model.pt` (delta oficial); el repositorio no publica pesos propios |

## Arquitectura y entrenamiento

La arquitectura reproduce el diseño del paper: ImageBind-Huge codifica entradas de imagen, vídeo y audio, una proyección las alinea con el espacio del LLM (Vicuna-7B v0, derivado de LLaMA-7B mediante el delta de Vicuna), y el LLM emite tanto tokens de texto como tokens de señal específicos de modalidad. Según la model card, el número de tokens de señal coincide con el `config/base.yaml` oficial: 4 para imagen (`[IMG0..3]`), 24 para vídeo (`[VID0..23]`) y 8 para audio (`[AUD0..7]`). Una proyección de salida traduce esos tokens a las condiciones de los difusores: Stable Diffusion v1-5 para imagen, ZeroScope v2_576w para vídeo y AudioLDM-l-full para audio.

No se proporciona información sobre el volumen de datos de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en esta reproducción. El repositorio no entrena nada: en modo `full` carga los pesos oficiales `7b_tiva_v0` (LLaMA-7B + delta Vicuna v0 + ImageBind-Huge + delta NExT-GPT + tres difusores). En modo `lite` delega la generación en servicios serverless (Qwen2.5-7B-Instruct, FLUX.1-schnell, MMS-TTS, LTX-Video) con degradación automática a `offline` si falla alguna llamada.

## Capacidades

- Generación de texto a partir de entradas multimodales (imagen, vídeo, audio) mediante el LLM Vicuna-7B.
- Generación de imagen condicionada por tokens de señal `[IMG0..3]` a través de Stable Diffusion v1-5.
- Generación de vídeo condicionada por tokens `[VID0..23]` a través de ZeroScope v2_576w.
- Generación de audio condicionada por tokens `[AUD0..7]` a través de AudioLDM-l-full.
- Conversión any-to-any: cualquier combinación de modalidad de entrada a modalidad de salida, según el diseño del paper.
- Modo `lite` con sustitución por modelos serverless (Qwen2.5-7B-Instruct para texto, FLUX.1-schnell para imagen, MMS-TTS para voz, LTX-Video para vídeo).
- Modo `offline` para validar la tubería de tokens de señal sin pesos.
- No se documenta soporte de tool calling, function calling ni comportamiento agéntico multi-paso.
- Capacidades multilingües: no documentadas; el LLM base (Vicuna-7B) está optimizado principalmente para inglés.

## Casos de uso

- Docencia y reproducción de investigación: el repositorio sirve para estudiar cómo se conecta un encoder multimodal con un LLM y con difusores mediante tokens de señal, ejecutando el modo `offline` en CPU sin coste.
- Prototipado de interfaces any-to-any: el modo `lite` permite montar una demo funcional de entrada de imagen/vídeo/audio y salida multimodal usando APIs serverless, sin GPU propia.
- Validación de pipelines de tokens de señal: los modos `offline` y `lite` permiten comprobar el conteo y enrutado de tokens (4/24/8) antes de invertir en el despliegue con pesos.
- Experimentación académica con pesos oficiales: el modo `full` sobre A100 40 GB permite ejecutar el sistema completo para estudiar calidad de generación cross-modal en entornos de investigación no comercial.
- Generación de vídeo corto condicionada por texto o imagen en investigación: mediante ZeroScope v2_576w y los 24 tokens de vídeo, útil para estudiar coherencia temporal en modelos de difusión de vídeo.
- Generación de audio condicionada: AudioLDM-l-full con 8 tokens de audio permite experimentar con síntesis de efectos de sonido o clips cortos en un contexto de investigación.
- Benchmarking de sistemas multimodales: comparar la calidad de la reproducción frente al paper original en tareas de generación de imagen, vídeo y audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Modo `offline`: funciona en CPU, pensado para el tier gratuito de Hugging Face Spaces; no requiere GPU ni pesos.
- Modo `lite`: no requiere hardware local; depende de la API serverless de Hugging Face y de un `HF_TOKEN` configurado como secreto del Space.
- Modo `full`: requiere al menos 1 GPU A100 de 40 GB según la model card, además de las variables `NEXTGPT_ROOT` y `NEXTGPT_CKPT` apuntando a los pesos oficiales.
- VRAM estimada para `full`: no disponible con detalle por componente; el límite indicado por el autor es A100 40 GB.
- GPU consumer: no se documenta que quepa en RTX 4090 u otras GPU de consumo; el sistema completo incluye un LLM de 7B más tres difusores.
- Opciones de despliegue: aplicación Gradio (`app.py`) en Hugging Face Spaces; el paquete `reproduce/` contiene el arranque local. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NExT-GPT (repositorio `dylanqi27/NExTGPT`) | LLM 7B + 3 difusores | No disponible | Imagen, vídeo, audio, texto (any-to-any) | No declarada en el repo; componentes con restricciones no comerciales | Repo público, 0 descargas, pesos oficiales en `ChocoWu/nextgpt_7b_tiva_v0` |
| NExT-GPT oficial (paper ICML 2024) | LLM 7B + 3 difusores | No disponible en la información proporcionada | Imagen, vídeo, audio, texto | Código BSD-3-Clause no comercial; pesos CC-BY-NC-SA-4.0 | Código en GitHub y pesos en Hugging Face |
| Qwen2.5-7B-Instruct (usado en modo `lite`) | 7B | No disponible en la información proporcionada | Texto | No disponible en la información proporcionada | Usado vía API serverless en este repositorio |
| FLUX.1-schnell (usado en modo `lite`) | No disponible | No aplica | Texto a imagen | No disponible en la información proporcionada | Usado vía API serverless en este repositorio |

La comparación con alternativas de la misma categoría (modelos any-to-any como NExT-GPT oficial) se limita al propio original, ya que no se dispone de datos de otros sistemas comparables en la información proporcionada.

## Limitaciones y advertencias

- El repositorio no es el modelo oficial: los modos `offline` y `lite` son reproducciones de interfaz y no cargan los pesos del paper; solo `full` reproduce a nivel de pesos.
- Licencia no declarada en el repositorio, lo que impide determinar condiciones de uso comercial.
- Los componentes subyacentes tienen restricciones: el código oficial NExT-GPT es solo para investigación no comercial, los pesos `ChocoWu/nextgpt_7b_tiva_v0` son CC-BY-NC-SA-4.0 y LLaMA está sujeto a la licencia no comercial de Meta. El uso comercial está, por tanto, bloqueado en la práctica.
- El modo `lite` depende de servicios externos de Hugging Face y degrada a `offline` ante cualquier fallo, lo que puede producir resultados de relleno sin aviso explícito al usuario final.
- No se documentan sesgos, tasas de alucinación ni evaluación de calidad; al ser una reproducción sin benchmarks publicados, no hay evidencia de rendimiento.
- Longitud de contexto e idiomas soportados no documentados; el LLM base (Vicuna-7B) está orientado principalmente al inglés.
- Requisito de hardware elevado para el modo `full` (A100 40 GB), lo que limita su uso a entornos con GPU de centro de datos.
- Repositorio con 0 descargas y 0 likes, creado y actualizado en noviembre de 2026; no hay señales de mantenimiento ni de comunidad.
- No se documenta soporte de tool calling ni de flujos agénticos, por lo que no es adecuado para pipelines de producción que requieran esas capacidades.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/dylanqi27/NExTGPT
- Paper NExT-GPT (arXiv): https://arxiv.org/abs/2309.05519
- Código oficial: https://github.com/NExT-GPT/NExT-GPT
- Página del proyecto: https://next-gpt.github.io/
- Pesos delta oficiales: https://huggingface.co/ChocoWu/nextgpt_7b_tiva_v0
- LLaMA-7B: https://huggingface.co/huggyllama/llama-7b
- Vicuna delta v0: https://huggingface.co/lmsys/vicuna-7b-delta-v0

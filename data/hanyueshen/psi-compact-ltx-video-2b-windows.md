# HanyueShen/psi-compact-ltx-video-2b-windows

## Resumen

PSI Compact for LTX-Video 2B es una distribución para Windows x64 del modelo de generación de vídeo LTX-Video 2B 0.9.8 destilado, empaquetada por YH Intelligence Technology Team. En lugar de ofrecer los pesos originales en formato Safetensors, el paquete reorganiza los tensores en contenedores de ejecución PSI (`psi-execution-pack-v1`) y los carga mediante un runtime de streaming por sub-operadores, lo que permite ejecutar el modelo con un consumo de VRAM muy reducido (pico reservado de 1,615 GiB en el decodificador y 82,0 MiB en el denoiser). El resultado es un instalador autónomo que genera vídeos MP4 locales a partir de prompts de texto, sin necesidad de configurar entornos Python ni dependencias adicionales.

El modelo base, LTX-Video, es un Diffusion Transformer (DiT) desarrollado por Lightricks, capaz de generar vídeo de alta fidelidad con audio sincronizado en una sola pasada. Esta versión destilada se limita a una salida fija de 704×448 píxeles, 120 fotogramas a 24 fps (5 segundos) con 7 pasos de denoise, y se distribuye bajo la licencia LTXV Open Weights License 0.X. Aunque el repositorio de Hugging Face no ha registrado descargas ni valoraciones, la propuesta es relevante para usuarios de Windows que buscan una solución de generación de vídeo local con requisitos de hardware modestos y sin cuantización (precisión BF16).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) |
| Parametros totales | 2B (segun denominacion del modelo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de video, no texto) |
| Tipos de cuantizacion | ninguno (BF16 nativo) |
| Idiomas soportados | no disponibles |
| Licencia | LTXV Open Weights License 0.X |
| Formato de pesos | PSI execution-pack-v1 (no Safetensors, no GGUF) |

## Arquitectura y entrenamiento

El modelo subyacente es LTX-Video 2B, un Diffusion Transformer que genera vídeo directamente en el espacio latente. La versión 0.9.8 destilada reduce el número de pasos de denoise necesarios (7 en este paquete) en comparación con el modelo original, lo que acelera la inferencia. La distribución PSI Compact no modifica los valores de los tensores, sino que los reorganiza en un orden de ejecución específico para el runtime de streaming por sub-operadores, que carga y ejecuta cada sub-operador de forma secuencial, minimizando la memoria reservada. No se dispone de información sobre el dataset de entrenamiento, el número de tokens o el uso de técnicas como RLHF o DPO; la model card solo indica que se trata de una versión destilada del checkpoint oficial.

## Capacidades

- Generacion de video a partir de prompts de texto: acepta una descripcion en lenguaje natural y produce un clip MP4 de 5 segundos a 704×448, 24 fps.
- Ejecucion local en Windows: todo el procesamiento ocurre en la maquina del usuario; los prompts y los videos generados no salen del equipo.
- Bajo consumo de VRAM: el pico reservado del decodificador es de 1,615 GiB y el del denoiser de 82,0 MiB, lo que permite operar en GPUs con 6 GiB de VRAM (minimo validado) e incluso teoricamente en torno a 2 GiB.
- Precision BF16 sin cuantizacion: mantiene la fidelidad numerica del modelo original sin perdidas por cuantizacion.
- Integracion con el ecosistema LTX-Video: compatible con la licencia y las restricciones de uso del modelo base, incluyendo la marcacion automatica de contenido generado por IA en los metadatos MP4.
- No incluye capacidades de tool calling, agentes, vision o audio; es exclusivamente text-to-video.

## Casos de uso

- Creacion de clips cortos para redes sociales: un creador de contenido puede generar videos de 5 segundos a 704×448 directamente en su PC con Windows, sin depender de servicios en la nube, y subirlos a plataformas como TikTok o Instagram Reels.
- Prototipado de storyboards para produccion audiovisual: directores o guionistas pueden visualizar escenas rapidamente a partir de descripciones textuales, acelerando la preproduccion sin necesidad de equipos de render.
- Generacion de material de demostracion para presentaciones: profesionales pueden crear videos ilustrativos breves para incluir en diapositivas o informes, manteniendo los datos locales.
- Pruebas de concepto en entornos corporativos con requisitos de privacidad: empresas que manejan informacion confidencial pueden evaluar la generacion de video sin enviar prompts a servicios externos, gracias a la ejecucion 100% local.
- Educacion y formacion: instructores pueden generar ejemplos visuales personalizados para explicar conceptos abstractos, adaptando el contenido a cada leccion.
- Desarrollo de aplicaciones de escritorio: integradores pueden embeber el ejecutable PSI Compact en herramientas propias para ofrecer generacion de video como funcionalidad, aprovechando el instalador autónomo y la baja huella de VRAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (como MMLU, HumanEval o GSM8K) en la informacion disponible, ya que se trata de un modelo de generacion de video y no de texto o codigo. La model card incluye mediciones de rendimiento del smoke test realizado en una NVIDIA RTX A6000, que se detallan a continuacion como referencia de latencia:

| Etapa | Tiempo (s) |
|---|---|
| Prompt encoding | 59,25 |
| Denoise (7 pasos) | 141,85 |
| Decode | 12,85 |
| MP4 encode | 1,20 |
| End-to-end | 218,31 |

Estos valores son mediciones puntuales en un hardware especifico y no constituyen una promesa de rendimiento en otros dispositivos.

## Requisitos de hardware

- VRAM minima validada: 6 GiB (fisica). VRAM teorica minima: aproximadamente 2 GiB, segun los picos reservados medidos (1,615 GiB decodificador, 82,0 MiB denoiser).
- GPU recomendada: NVIDIA con al menos 6 GiB de VRAM y driver actual. El smoke test se realizo en una RTX A6000, pero cualquier GPU NVIDIA compatible con CUDA y con esa memoria deberia funcionar.
- RAM del sistema: 32 GiB recomendados.
- Espacio en disco: aproximadamente 60 GiB durante la instalacion; unos 35 GiB tras eliminar el archivo de entrega.
- Sistema operativo: Windows 10/11 x64.
- Opciones de despliegue: no es un modelo para vLLM, Ollama o TGI; se distribuye como un instalador ejecutable (`Install PSI Compact.exe`) que instala la aplicacion PSI Compact y genera videos MP4.
- Latencia: en la RTX A6000, el proceso completo tarda unos 218 segundos para un video de 5 segundos. En GPUs menos potentes, el tiempo puede aumentar.

## Comparativa con modelos similares

No se dispone de informacion suficiente en la documentacion proporcionada para establecer una comparativa con otros modelos de generacion de video (como Stable Video Diffusion, AnimateDiff o CogVideoX). La model card no menciona alternativas ni ofrece datos comparativos de calidad o rendimiento. Por tanto, esta seccion se considera no disponible.

## Limitaciones y advertencias

- Sesgos y alucinaciones: no se documentan sesgos especificos, pero al ser un modelo de generacion de video, puede producir contenido visual inexacto o no deseado segun el prompt. No hay informacion sobre mitigaciones.
- Riesgo de alucinacion: inherente a los modelos generativos; los videos pueden no corresponder fielmente a la descripcion textual.
- Limitaciones de contexto e idioma: no se especifican idiomas soportados; el modelo base LTX-Video esta entrenado principalmente en ingles, por lo que los prompts en otros idiomas pueden dar resultados suboptimos.
- Restricciones de licencia: la LTXV Open Weights License 0.X exige identificar el contenido generado como producido por IA (PSI Compact lo anade a los metadatos MP4). Las entidades con ingresos anuales de al menos 10.000.000 USD deben revisar el requisito de licencia comercial y contactar con Lightricks.
- Limitaciones tecnicas: el paquete no incluye los pesos originales en Safetensors ni un cache de Hugging Face; solo funciona en Windows x64. Los ejecutables no estan firmados con Authenticode, por lo que SmartScreen puede mostrar advertencias.
- Resolucion y duracion fijas: la salida esta limitada a 704×448, 120 fotogramas, 24 fps y 5 segundos; no se pueden cambiar estos parametros desde la interfaz proporcionada.
- Sin garantia de equivalencia entre GPUs: la model card advierte que no se garantiza una equivalencia bit-exacta entre arquitecturas de GPU.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/HanyueShen/psi-compact-ltx-video-2b-windows
- Modelo base LTX-Video en Hugging Face: https://huggingface.co/Lightricks/LTX-Video
- Repositorio oficial de LTX-Video en GitHub: https://github.com/Lightricks/LTX-Video
- Paquete PyPI de ltx-video: https://pypi.org/project/ltx-video/
- Licencia LTXV Open Weights License 0.X: https://huggingface.co/Lightricks/LTX-Video/blob/main/LICENSE

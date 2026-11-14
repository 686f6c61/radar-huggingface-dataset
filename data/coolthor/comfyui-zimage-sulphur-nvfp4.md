# coolthor/comfyui-zimage-sulphur-nvfp4

## Resumen

Este repositorio no es un modelo entrenado desde cero, sino un paquete de cuantizacion y empaquetado para ComfyUI del modelo de difusion Z-Image Turbo, desarrollado originalmente por Tongyi-MAI (Alibaba). Lo publica el usuario coolthor (Thor Lin) bajo el paraguas de ai-muninn, y su proposito es ofrecer una version en formato NVFP4 del modelo de difusion junto con todos los componentes auxiliares necesarios (VAE, codificadores de texto y ControlNet) listos para su uso en flujos de trabajo de ComfyUI sobre GPUs Blackwell.

El interes practico radica en el formato NVFP4, el formato nativo de 4 bits de las GPUs Blackwell (RTX 5090, DGX Spark/GB10), que aproximadamente reduce a la mitad el consumo de VRAM del modelo de difusion frente a fp8 o bf16 sin dejar de alimentar los tensor cores. Esto permite mantener la generacion en pocos pasos caracteristica de Z-Image Turbo sin desbordar a memoria del sistema. El paquete incluye ademas variantes de codificador de texto en FP8 y FP4 mixto para ajustar el equilibrio entre calidad y huella de memoria.

El repositorio tiene un tamano total de 31,1 GB y combina componentes con licencias distintas: el modelo base y el ControlNet son Apache-2.0, mientras que el codificador Gemma-3-12B-IT incluido queda cubierto por los Terminos de Uso de Gemma de Google. No se dispone de informacion sobre arquitectura interna, numero de parametros del modelo de difusion ni datos de entrenamiento mas alla de la ascendencia declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion (text-to-image); detalles internos no disponibles |
| Parametros totales | No disponible para el modelo de difusion; codificadores de texto: Qwen3-4B (4B) y Gemma-3-12B-IT (12B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | NVFP4 (modelo de difusion), FP8 mixto y BF16 (Qwen3-4B), FP4 mixto (Gemma-3-12B-IT) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (paquete y modelo base); Gemma Terms of Use para el fichero `gemma_3_12B_it_fp4_mixed.safetensors` |
| Formato de pesos | safetensors (single-file para ComfyUI) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo de difusion Z-Image Turbo (tipo de backbone, mecanismo de atencion, scheduler de muestreo ni numero de pasos). El autor del empaquetado no documenta estos detalles y la model card se limita a describir el proceso de cuantizacion y empaquetado. Se sabe que es un modelo de generacion texto-a-imagen de la familia Z-Image de Tongyi-MAI y que existe una variante Turbo orientada a generacion en pocos pasos, pero no se aportan datos sobre tokens de entrenamiento, composicion del dataset ni si hubo RLHF o DPO.

El trabajo realizado por coolthor consiste en conversion a NVFP4 y empaquetado de codificadores en FP8/FP4 mixto, sin fine-tuning ni merge adicional registrado. El ControlNet Union es un componente entrenado aguas arriba. La procedencia exacta de los ficheros VAE y codificadores no se recupero, y el commit upstream usado en el build figura como "not recorded". El repositorio incluye checksums SHA-256 de cada fichero para verificacion de integridad.

## Capacidades

- Generacion de imagenes a partir de texto (pipeline text-to-image) mediante el modelo de difusion Z-Image Turbo.
- Generacion en pocos pasos, segun la naturaleza Turbo del modelo base (numero exacto de pasos no disponible).
- Control estructural de la generacion mediante ControlNet Union (pose, profundidad, bordes y otras condiciones combinables, segun el componente upstream).
- Eleccion de codificador de texto: Qwen3-4B en BF16 o FP8 mixto, o Gemma-3-12B-IT en FP4 mixto, para ajustar calidad frente a huella de memoria.
- Integracion directa en ComfyUI mediante carga de ficheros single-file en las carpetas de modelos correspondientes.
- Ejecucion nativa en formato NVFP4 sobre GPUs Blackwell, con aceleracion por tensor cores.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision de entrada ni audio.

## Casos de uso

- Generacion de imagenes en produccion sobre RTX 5090: el modelo de difusion en NVFP4 ocupa 4,5 GB, lo que permite mantener el modelo residente en VRAM junto con el VAE y un codificador de texto y encadenar generaciones sin recargar pesos.
- Despliegue en DGX Spark / GB10: al ser NVFP4 el formato nativo de la plataforma, se aprovechan los tensor cores para generacion en pocos pasos con huella reducida, adecuado para prototipado en estaciones compactas.
- Flujos de trabajo con ControlNet en ComfyUI: el paquete incluye el ControlNet Union (3,1 GB), lo que permite condicionar la generacion por pose, profundidad o bordes sin buscar componentes adicionales.
- Ajuste de calidad frente a memoria en el codificador de texto: se puede elegir Qwen3-4B en BF16 (8,0 GB) para maxima fidelidad textual, Qwen3-4B FP8 mixto (5,6 GB) como termino medio, o Gemma-3-12B-IT FP4 mixto (9,4 GB) cuando se prefiera un codificador mayor con cuantizacion agresiva.
- Iteracion rapida en estudio de diseno: la combinacion de generacion en pocos pasos y pesos cuantizados reduce el tiempo por imagen, lo que facilita la exploracion de variaciones de prompt y semilla en sesiones interactivas.
- Reproducibilidad y auditoria de artefactos: los checksums SHA-256 publicados permiten verificar que los ficheros descargados coinciden con la release fijada, util en entornos donde se exige trazabilidad de los pesos.
- Evaluacion comparativa de cuantizacion: el paquete sirve para medir en primera persona el impacto de NVFP4 frente a FP8/BF16 en calidad visual y velocidad sobre hardware Blackwell.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a ai-muninn.com para benchmarks completos, pero no se incluyen cifras en el material proporcionado.

## Requisitos de hardware

- VRAM estimada: el modelo de difusion NVFP4 ocupa 4,5 GB; el VAE 335 MB; el codificador Qwen3-4B BF16 8,0 GB o FP8 mixto 5,6 GB; el codificador Gemma-3-12B-IT FP4 mixto 9,4 GB; el ControlNet Union 3,1 GB. El consumo total depende de que componentes se carguen simultaneamente.
- GPU recomendadas: RTX 5090 y DGX Spark / GB10, unicas plataformas donde NVFP4 se ejecuta de forma nativa segun el autor.
- Compatibilidad con consumer GPU: si, en RTX 5090 (Blackwell). No se documenta soporte en GPUs de generaciones anteriores, donde NVFP4 no es nativo.
- Opciones de despliegue: ComfyUI, cargando los ficheros en `models/diffusion_models/`, `models/vae/`, `models/text_encoders/` y `models/controlnet/`. No se documentan otras opciones (vLLM, llama.cpp, Ollama, TGI no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| coolthor/comfyui-zimage-sulphur-nvfp4 | No disponible (difusion); codificadores 4B y 12B | No disponible | NVFP4, FP8 mixto, FP4 mixto, BF16 | Apache-2.0 (Gemma bajo sus terminos) | Hugging Face, single-file para ComfyUI |
| Tongyi-MAI/Z-Image-Turbo | No disponible | No disponible | Pesos originales (no cuantizados) | Apache-2.0 | Hugging Face |
| alibaba-pai/Z-Image-Turbo-Fun-Controlnet-Union | No disponible | No disponible | Pesos originales | Apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento ni de especificaciones internas de los modelos comparables en la informacion proporcionada, por lo que la comparacion se limita a formato, licencia y disponibilidad.

## Limitaciones y advertencias

- El paquete esta disenado para GPUs Blackwell; en hardware anterior NVFP4 no es nativo y el rendimiento o la compatibilidad no estan garantizados.
- La procedencia de los ficheros VAE y codificadores de texto no se recupero, y el commit upstream usado en el build figura como no registrado; la verificacion por checksum confirma integridad del fichero, no el linaje completo de los pesos.
- El fichero `gemma_3_12B_it_fp4_mixed.safetensors` esta sujeto a los Terminos de Uso de Gemma de Google, no a Apache-2.0; su uso comercial debe revisarse contra esos terminos.
- El repositorio no documenta sesgos, tasas de alucinacion visual ni limitaciones de idioma del modelo de difusion.
- No se aportan datos de calidad comparativa entre las variantes de codificador, por lo que la eleccion entre Qwen3-4B BF16/FP8 y Gemma-3-12B-IT FP4 debe validarse empiricamente.
- El repositorio tiene 31,1 GB, lo que exige espacio en disco y ancho de banda considerables para la descarga completa.
- No se documenta el numero de pasos de muestreo recomendado, la resolucion nativa ni los parametros de generacion optimos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/coolthor/comfyui-zimage-sulphur-nvfp4
- Modelo base: https://huggingface.co/Tongyi-MAI/Z-Image-Turbo
- ControlNet: https://huggingface.co/alibaba-pai/Z-Image-Turbo-Fun-Controlnet-Union
- Web del autor (benchmarks y notas): https://ai-muninn.com
- Perfil del autor en Hugging Face: https://huggingface.co/coolthor
- Terminos de Uso de Gemma: https://ai.google.dev/gemma/terms
- Revision fijada inspeccionada: https://huggingface.co/coolthor/comfyui-zimage-sulphur-nvfp4/tree/85d8426976b4cf8e92c2e037bd153e9ccfc6a8fc

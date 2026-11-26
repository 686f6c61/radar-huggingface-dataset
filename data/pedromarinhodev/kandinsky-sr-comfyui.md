# PedroMarinhoDev/Kandinsky-SR-ComfyUI

## Resumen

Kandinsky-SR-ComfyUI es un repositorio de pesos empaquetados para ComfyUI que reúne los modelos de superresolución de Kandinsky 6.0: el superresolutor de vídeo VSR 2.0 (variante destilada a 2 pasos) y el superresolutor de imagen ImageSR 2.0. No es un modelo nuevo entrenado por el autor del repositorio, sino una conversión de los pesos oficiales publicados por kandinskylab a ficheros safetensors individuales que llevan su arquitectura y configuración embebidas en los metadatos, de forma que las nodes de ComfyUI-KandinskySR pueden cargarlos sin ficheros de configuración ni una estructura de carpetas concreta. El repositorio lo mantiene PedroMarinhoDev y no está afiliado a kandinskylab.

El problema que resuelve es de tipo práctico: los bundles originales de Kandinsky VSR e ImageSR vienen en formato Diffusers, con directorios separados para transformer, VAE y latent upscaler, y requieren código de inferencia propio. Este repositorio los reempaqueta en siete ficheros safetensors listos para colocar en `ComfyUI/models`, incluyendo variantes cuantizadas a int8 en formato ConvRot de ComfyUI para reducir el consumo de VRAM. Los pesos son los liberados por kandinskylab, conservados en el dtype en que la referencia calcula (bf16), con verificación tensor a tensor por parte de los conversores.

La relevancia actual es doble: por un lado, permite usar superresolución de vídeo e imagen de última generación dentro de ComfyUI sin escribir código; por otro, las variantes int8 reducen el peso del transformer de vídeo de 3,19 GB a 1,96 GB y el de imagen de 9,06 GB a 5,14 GB, lo que acerca estos modelos a GPUs de consumo. La licencia MIT de los pesos originales se mantiene.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (DiT) para VSR e ImageSR; VAE 3D convolucional (KVAE 3D 2.0) para vídeo; latent upscaler dedicado |
| Parametros totales | no disponible (el repositorio distribuye pesos, no indica recuento de parámetros) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de superresolución, no de lenguaje) |
| Tipos de cuantizacion | bf16 y int8 ConvRot (formato int8 de ComfyUI para lineales de atención y feed-forward) |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | MIT (pesos upstream); el VAE de ImageSR proviene de FLUX.1-schnell, Apache-2.0 |
| Formato de pesos | safetensors (un fichero por componente, con metadatos de arquitectura embebidos) |

## Arquitectura y entrenamiento

El repositorio empaqueta dos familias de modelos. El VSR 2.0 de vídeo está compuesto por un transformer de difusión destilado con pi-Flow a 2 evaluaciones por tile, un VAE de vídeo KVAE 3D 2.0 con 64 canales, factor 16x espacial y 4x temporal, y un banco de latent upscalers x2 y x4 (el x2 se usa también para x2.25). El ImageSR 2.0 es un transformer de superresolución de imagen que soporta x2 y x4 en un solo paso, con tablas de timestep precalculadas ("baked"), y reutiliza el VAE de FLUX.1-schnell (`ae.safetensors`) tensor a tensor. Los conversores del repositorio de nodes verifican cada tensor escrito contra el original.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens o imágenes, ni sobre el proceso de alineación (RLHF/DPO) en la documentación proporcionada; esos detalles corresponden a las model cards upstream de kandinskylab, que no se incluyen aquí. La innovación técnica destacable es la destilación a 2 pasos del VSR (frente a muestreos más largos) y la conversión a int8 ConvRot, que mantiene la atención y las capas feed-forward en 8 bits con el formato nativo de ComfyUI.

## Capacidades

- Superresolución de vídeo: aumenta la resolución espacial de vídeo mediante un transformer DiT con VAE 3D y upscalers latentes x2 y x4.
- Superresolución de imagen: escalado x2 y x4 en un solo paso con el transformer ImageSR 2.0.
- Inferencia destilada: el VSR 2.0 requiere solo 2 evaluaciones por tile, lo que reduce el coste computacional frente a modelos de difusión no destilados.
- Integración nativa en ComfyUI: los ficheros llevan arquitectura y ajustes en metadatos, sin configs externas.
- Cuantización int8: variantes ConvRot para atención y feed-forward que reducen el peso en disco y la VRAM.
- Procesamiento por tiles: el VSR opera por tiles, lo que permite tratar vídeos de resolución alta sin cargar el frame completo en memoria.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades lingüísticas: no es un modelo de lenguaje.

## Casos de uso

- Restauración de vídeo antiguo o de baja resolución: el VSR 2.0 con KVAE 3D y upscaler x2/x4 permite reescalar metraje SD a HD o 4K dentro de un flujo de ComfyUI, procesando por tiles para mantener la memoria bajo control.
- Upstream de pipelines de generación de vídeo: usar el VSR como etapa final de superresolución sobre clips generados por modelos de vídeo de menor resolución, aprovechando la destilación a 2 pasos para no multiplicar el tiempo de inferencia.
- Mejora de imágenes para impresión o catálogo: el ImageSR 2.0 en un solo paso escala fotografía x2 o x4, adecuado para lotes de producto o material editorial donde se requiere detalle fino sin pipeline de difusión completo.
- Preprocesado para visión por computador: aumentar la resolución de frames o imágenes antes de pasarlos a detectores o segmentadores que rinden mejor con más píxeles, integrado como nodo en ComfyUI.
- Postproducción audiovisual en estación de trabajo: con la variante int8 del transformer de vídeo (1,96 GB) y el KVAE bf16 (3,48 GB), el conjunto cabe en GPUs de consumo de 24 GB, lo que permite superresolver clips en local sin servicio en la nube.
- Restauración de material de archivo y digitalización: combinar el upscaler x4 con el VSR para recuperar detalle en grabaciones históricas, controlando el coste por tile y la coherencia temporal que aporta el VAE 3D.
- Prototipado e investigación en superresolución: al estar los pesos en safetensors con metadatos y conversores verificados, sirve como base para experimentar con cuantización int8 ConvRot y comparar fidelidad frente a bf16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para VSR en bf16: transformer 3,19 GB + KVAE 3,48 GB + upscaler x2 1,53 GB o x4 2,89 GB; en la práctica, el consumo real depende del tamaño de tile y de la resolución del clip.
- VRAM estimada para VSR en int8: transformer 1,96 GB + KVAE 3,48 GB + upscaler correspondiente.
- VRAM estimada para ImageSR en bf16: transformer 9,06 GB + VAE de FLUX.1-schnell (no rehostado, ya presente en `models/vae/` de ComfyUI).
- VRAM estimada para ImageSR en int8: transformer 5,14 GB + VAE de FLUX.1-schnell.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño de pesos, el VSR en int8 es candidato a GPUs de consumo de 24 GB (por ejemplo, RTX 4090) y el ImageSR en bf16 requiere GPUs de 24 GB o más con margen para el VAE y activaciones.
- Cabe en GPU de consumo: sí para VSR int8 en tarjetas de 24 GB; el ImageSR bf16 es ajustado en 24 GB y más holgado en A100/H100.
- Opciones de despliegue: ComfyUI con las nodes de ComfyUI-KandinskySR; descarga vía `hf download` al directorio `ComfyUI/models`. No se documentan opciones vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Kandinsky-SR-ComfyUI (este repo) | VSR + ImageSR empaquetado para ComfyUI | no disponible | no aplica | MIT (VAE ImageSR Apache-2.0) | safetensors bf16/int8 | Hugging Face, 0 descargas |
| Kandinsky-6.0-VSR-2.0-distilled2steps-Diffusers (upstream) | VSR | no disponible | no aplica | MIT | Diffusers (directorios) | Hugging Face |
| Kandinsky-ImageSR-2.0 (upstream) | ImageSR | no disponible | no aplica | MIT (VAE Apache-2.0) | Diffusers (directorios) | Hugging Face |

No se dispone de datos de benchmarks ni de otros modelos comparables en la información proporcionada; la comparativa se limita a las variantes upstream del mismo modelo.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no tiene capacidades de texto, razonamiento, código ni tool calling; cualquier evaluación en esos ejes no aplica.
- El repositorio no está afiliado a kandinskylab; la responsabilidad de la conversión recae en el autor del empaquetado, aunque los conversores verifican tensor a tensor.
- Las variantes int8 ConvRot introducen una pérdida de fidelidad respecto a bf16 no cuantificada en la información disponible; conviene validar la calidad perceptual antes de producción.
- El ImageSR requiere el VAE de FLUX.1-schnell, que no se rehosta en este repositorio y debe obtenerse por separado (Apache-2.0).
- El VSR procesa por tiles: pueden aparecer costuras o inconsistencias entre tiles en clips con movimiento rápido o texturas repetitivas; no se documentan mitigaciones.
- No se han publicado benchmarks ni métricas de latencia/throughput en la información disponible, por lo que no es posible comparar rendimiento objetivamente.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es un empaquetado reciente (creado el 26 de noviembre de 2026) sin validación comunitaria documentada.
- La licencia MIT permite uso comercial de los pesos, pero el VAE de ImageSR queda sujeto a Apache-2.0; hay que conservar los avisos de copyright de ambos.
- No se dispone de información sobre sesgos del modelo de superresolución (por ejemplo, sesgos de dominio en caras o texto) en la documentación proporcionada.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/PedroMarinhoDev/Kandinsky-SR-ComfyUI
- Nodes de ComfyUI (GitHub): https://github.com/PedroMarinhoDev/ComfyUI-KandinskySR
- Conversores: https://github.com/PedroMarinhoDev/ComfyUI-KandinskySR/tree/main/tools
- Kandinsky 6.0 VSR 2.0 (upstream, Hugging Face): https://huggingface.co/kandinskylab/Kandinsky-6.0-VSR-2.0-distilled2steps-Diffusers
- Kandinsky ImageSR 2.0 (upstream, Hugging Face): https://huggingface.co/kandinskylab/Kandinsky-ImageSR-2.0
- Repositorio kandinsky-video-sr: https://github.com/kandinskylab/kandinsky-video-sr
- Repositorio kandinsky-image-sr: https://github.com/kandinskylab/kandinsky-image-sr
- VAE de FLUX.1-schnell (ae.safetensors): https://huggingface.co/black-forest-labs/FLUX.1-schnell/blob/main/ae.safetensors

# Arrokothwhi/RefDecoder

## Resumen

RefDecoder es un marco de entrenamiento e inferencia que incorpora condicionamiento por fotograma de referencia en autoencoders de vídeo (VAE). Desarrollado por Xiang Fan, Yuheng Wang, Bohan Fang, Zhongzheng Ren y Ranjay Krishna, el modelo inyecta un fotograma de referencia seleccionado en el decodificador para preservar la apariencia y la identidad visual a lo largo del vídeo, mejorando la calidad de reconstruccion y de generacion imagen-a-vídeo respecto a los decodificadores VAE originales.

El repositorio publica dos checkpoints: RefDecoder-Wan, construido sobre el VAE del modelo Wan2.1 I2V (14B, 480P), y RefDecoder-VideoVAEPlus, construido sobre el autoencoder VideoVAE+ con arquitectura 2+1D. No se trata de un modelo generativo de lenguaje, sino de un componente de decodificacion para pipelines de generacion de vídeo, por lo que su relevancia reside en la mejora de la fidelidad de reconstruccion y de la coherencia temporal en sistemas de image-to-video.

La informacion disponible no incluye el numero de parametros, la longitud de contexto ni datos de benchmarks del propio RefDecoder; la model card se centra en el uso practico y en la integracion con los backbones mencionados. El repositorio ocupa 6,2 GB y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VAE de vídeo con condicionamiento por fotograma de referencia en el decodificador; dos backbones: Wan2.1 I2V VAE y VideoVAE+ (2+1D) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision/vídeo, no linguistico) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (.pt): `wan2.1_ref.pt` y `videovaeplus_ref.pt` |

## Arquitectura y entrenamiento

RefDecoder no es un transformer generativo, sino un decodificador VAE de vídeo condicionado por referencia. La innovacion consiste en inyectar un fotograma de referencia seleccionado en el decodificador, de modo que el modelo conserva pistas de apariencia e identidad a lo largo de toda la secuencia. Se ofrecen dos variantes: RefDecoder-Wan, que inicializa su VAE base a partir de `Wan-AI/Wan2.1-I2V-14B-480P-Diffusers` (subcarpeta `vae`), y RefDecoder-VideoVAEPlus, que parte del checkpoint base `sota-4-16z.ckpt` de VideoVAE+ con arquitectura 2+1D.

La informacion proporcionada no detalla el volumen de datos de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO (no aplicables en un VAE). Tampoco se especifican innovaciones adicionales como decodificacion especulativa o atencion lineal. El paper asociado es arXiv:2605.15196, titulado "RefDecoder: Enhancing Visual Generation with Conditional Video Decoding".

## Capacidades

- Reconstruccion de vídeo de alta fidelidad con preservacion de apariencia e identidad mediante condicionamiento por fotograma de referencia.
- Decodificacion de latentes de vídeo para pipelines de generacion imagen-a-vídeo.
- Integracion como componente VAE en flujos de difusion de vídeo (Wan2.1 I2V y VideoVAE+).
- Soporte de inferencia multi-GPU segun el repositorio de codigo.
- Flujos de evaluacion con VBench para decodificacion image-to-video.
- No soporta generacion de texto, razonamiento linguistico, tool calling ni agentes; es un componente de vision/vídeo.

## Casos de uso

- Mejora de pipelines de image-to-video: sustitucion del decodificador VAE original de Wan2.1 por RefDecoder-Wan para preservar la identidad del sujeto del fotograma inicial a lo largo del vídeo generado.
- Reconstruccion de vídeo con alta fidelidad: uso de RefDecoder-VideoVAEPlus para decodificar latentes conservando detalles de apariencia entre fotogramas.
- Post-procesado en sistemas de generacion de vídeo: integracion del decodificador condicionado como etapa final para reducir la deriva visual (flicker, cambios de identidad).
- Evaluacion comparativa de VAEs de vídeo: el repositorio incluye flujos de VBench image-to-video para medir la mejora frente a los decodificadores base.
- Investigacion en autoencoders de vídeo: base para experimentar con condicionamiento por referencia en arquitecturas VAE 2+1D o basadas en Wan2.1.
- Prototipado en entornos con GPU unica: los scripts de inferencia permiten ejecutar reconstruccion sobre clips con resoluciones como 480x832 (Wan) o 216x216 (VideoVAE+).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio ocupa 6,2 GB y requiere ademas el VAE base de Wan2.1 (14B, 480P) o el checkpoint `sota-4-16z.ckpt` de VideoVAE+.
- GPU recomendadas: no especificadas; los scripts de inferencia aceptan dispositivo `cuda:0` y el repositorio menciona inferencia multi-GPU.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible.
- Opciones de despliegue: scripts propios del repositorio (`scripts/run_inference.sh`) con configuraciones YAML (`configs/inference/eval_wan.yaml`, `configs/inference/eval_videovaeplus.yaml`); no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un VAE de vídeo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Backbone | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RefDecoder | VAE de vídeo condicionado por referencia | Wan2.1 I2V VAE / VideoVAE+ | no disponible | Apache 2.0 | Hugging Face (Arrokothwhi/RefDecoder) |
| Wan2.1 I2V VAE | VAE de vídeo (decodificador base) | Wan2.1 | no disponible | no disponible en la informacion | Hugging Face (Wan-AI) |
| VideoVAE+ | Autoencoder de vídeo 2+1D | VideoVAE+ | no disponible | no disponible en la informacion | Checkpoint `sota-4-16z.ckpt` |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no procesa texto ni ofrece capacidades linguisticas, de razonamiento o de tool calling.
- Requiere el VAE base correspondiente (Wan2.1 I2V 14B o VideoVAE+ `sota-4-16z.ckpt`), lo que anade dependencias y peso al despliegue.
- La calidad depende de la eleccion del fotograma de referencia; no se documentan criterios automaticos de seleccion.
- No se han publicado metricas de benchmarks en la informacion disponible, por lo que la mejora frente a los decodificadores base no puede cuantificarse con los datos aportados.
- Riesgo de sesgos y alucinacion visual: no documentado en la model card.
- Uso comercial permitido bajo Apache 2.0, sujeto a las licencias de los backbones base (Wan2.1 y VideoVAE+), que no se detallan en la informacion proporcionada.
- Repositorio con 0 descargas en el momento de la consulta; madurez y soporte comunitario limitados.

## Enlaces

- Hugging Face: https://huggingface.co/Arrokothwhi/RefDecoder
- Paper (arXiv): https://arxiv.org/abs/2605.15196
- Project page: https://refdecoder.github.io/
- GitHub: https://github.com/RefDecoder/RefDecoder
- VAE base Wan2.1: https://huggingface.co/Wan-AI/Wan2.1-I2V-14B-480P-Diffusers

# Papina/MiniMax-H3-ref2va-int8

## Resumen
MiniMax-H3-ref2va-int8 es una derivada cuantizada del modelo MiniMax-H3 de MiniMax, específicamente para el flujo de trabajo `ref2va` (referencia a audio-vídeo). El modelo original es un sistema generativo omni-modal que acepta entradas de texto, imagen, vídeo y audio, y produce vídeo con audio estéreo nativo, con resoluciones de hasta 2K y duraciones de hasta 15 segundos. Esta versión, publicada por el usuario Papina, aplica cuantización de solo pesos (weight-only) en int8 mediante torchao sobre los dos componentes más grandes del pipeline: el transformer de referencia (originalmente ~67,3 GB en bf16) y el codificador de texto Qwen3-VL (originalmente ~59,3 GB en bf16), reduciendo así el requisito de memoria para ejecutarlo en GPUs con menos VRAM.

La cuantización se realiza por conversión directa de los pesos bf16 originales, sin reentrenamiento ni calibración. El resto de componentes (VAE, audio VAE, tokenizer, processor, schedulers) se cargan sin modificar desde el repositorio original. Esta versión solo incluye el flujo `ref2va`; para los flujos `t2va` o `fl2va` es necesario usar el `transformer/` del repositorio original. El modelo está pensado para usuarios que necesitan ejecutar MiniMax-H3 localmente con recursos más limitados, manteniendo la funcionalidad completa del flujo de referencia a audio-vídeo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion para video omni-modal (transformer + text encoder Qwen3-VL + VAE + audio VAE) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 weight-only (torchao Int8WeightOnlyConfig) |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license-agreement |
| Formato de pesos | safetensors (presumible, no confirmado en la model card) |

## Arquitectura y entrenamiento
El modelo original MiniMax-H3 es un sistema omni-modal de generacion de video con audio sincronizado. Utiliza un pipeline de difusion que combina un transformer principal, un codificador de texto (Qwen3-VL), un VAE para video e imagen, y un audio VAE para generar audio nativo. El flujo `ref2va` permite tomar una referencia de audio y generar un video sincronizado con ella, ademas de otras modalidades de referencia.

Esta derivada no ha sido entrenada ni calibrada: se ha realizado una cuantizacion exclusivamente de pesos (weight-only) sobre los dos componentes mas grandes (transformer_ref y text_encoder) usando la configuracion `Int8WeightOnlyConfig` de torchao. Los pesos se convirtieron directamente desde los bf16 originales sin ajuste posterior. Esta tecnica reduce el uso de VRAM a aproximadamente la mitad en esos componentes, a costa de una posible ligera degradacion en la precision numerica que no ha sido evaluada formalmente.

## Capacidades
- Generacion de video a partir de texto, imagen, video de referencia o audio de referencia.
- Animacion de imagenes estaticas siguiendo el movimiento de un video de referencia.
- Preservacion de personajes y consistencia visual a partir de imagenes de referencia.
- Sincronizacion labial y de audio nativo generado por el modelo (audio estéreo).
- Soporte de resoluciones hasta 2K y duraciones de hasta 15 segundos (limitacion del modelo original).
- Capacidades multimodales: entradas de texto, imagen, video y audio.
- Cuantizacion int8 que reduce el requisito de memoria, permitiendo ejecucion en GPUs con menos VRAM que el modelo original.

## Casos de uso
- **Doblaje y locucion automatizada**: dado un audio de voz (por ejemplo, un dialogo), el modelo genera un video de un personaje hablando sincronizado con ese audio, util para produccion de contenido en multiples idiomas o voces sinteticas.
- **Creacion de contenido para redes sociales**: generar clips cortos de video con audio nativo a partir de una imagen de referencia y un audio de fondo, ideal para plataformas como TikTok o Instagram Reels.
- **Previsualizacion de escenas cinematograficas**: los directores pueden usar el flujo `ref2va` para generar un boceto animado de una escena con dialogo de referencia, antes de la produccion final.
- **Tutorias y material educativo**: crear videos explicativos con narracion generada y animaciones basadas en imagenes, sin necesidad de equipos de grabacion.
- **Publicidad personalizada**: generar anuncios de video con audio de referencia (por ejemplo, un jingle) y una imagen de producto, para pruebas A/B de campañas.
- **Investigacion en generacion multimodal**: servir como base para experimentos sobre cuantizacion de modelos de difusion y su impacto en la calidad de video y audio, gracias a su disponibilidad en int8.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- El modelo original requiere aproximadamente 130 GB de VRAM solo para el transformer y el text encoder en bf16. Esta version int8 reduce ese requisito a aproximadamente la mitad: estimacion de ~33,7 GB para el transformer_ref y ~29,7 GB para el text encoder, sumando unos 63 GB para esos componentes, mas el VAE y audio VAE (que se cargan en bf16) y otros overheads.
- Se recomienda una GPU con al menos 80 GB de VRAM (por ejemplo, A100 80GB, H100 80GB) para ejecutar el pipeline completo. Con activacion de offload automatico de CPU, podria ser posible en GPUs de 48 GB o 24 GB, aunque con mayor latencia.
- No se ha confirmado si cabe en GPUs de consumo (RTX 4090 24GB) sin offload agresivo; es probable que requiera offload de CPU o particionado.
- Opciones de despliegue: el modelo se usa mediante la libreria `diffusers` con `ComponentsManager` y `ModularPipeline`. Tambien hay versiones compatibles con ComfyUI (archivos .safetensors con prefijo `convrot`).
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares
No disponible. No se han encontrado comparaciones directas con otros modelos de generacion de video con audio sincronizado en la informacion proporcionada.

## Limitaciones y advertencias
- La cuantizacion int8 puede introducir una degradacion sutil en la calidad de generacion, especialmente en detalles finos de video o audio, aunque no se han realizado evaluaciones formales.
- Esta version solo incluye el flujo `ref2va`; no es compatible con `t2va` ni `fl2va` sin usar el transformer original.
- La licencia `minimax-h3-community-license-agreement` es una licencia comunitaria que puede imponer restricciones al uso comercial. Se recomienda revisar el texto completo de la licencia.
- El modelo original tiene limitaciones de duracion (maximo 15 segundos) y resolucion (maximo 2K), que se heredan en esta version.
- No se dispone de informacion sobre sesgos o riesgos de alucinacion especificos de este modelo cuantizado.
- El repositorio no incluye el `transformer/` original; los usuarios que necesiten otros flujos deben descargar el modelo base por separado.

## Enlaces
- [Repositorio HuggingFace de Papina/MiniMax-H3-ref2va-int8](https://huggingface.co/Papina/MiniMax-H3-ref2va-int8)
- [Modelo original MiniMaxAI/MiniMax-H3](https://huggingface.co/MiniMaxAI/MiniMax-H3)
- [GitHub de MiniMax-AI/MiniMax-H3](https://github.com/MiniMax-AI/MiniMax-H3)
- [Articulo sobre MiniMax H3 en ComfyUI (aistudynow.com)](https://aistudynow.com/minimax-h3-comfyui-workflow-almost-3x-faster-ref2va-guide/)
- [Descargas de archivos del modelo MiniMax H3 (minimaxh3.run)](https://minimaxh3.run/minimax-h3-model-files-downloads)
- [Archivo de ejemplo en Comfy-Org (int8 convrot)](https://huggingface.co/Comfy-Org/MiniMax-H3/blob/main/diffusion_models/minimax_h3_ref2va_int8_convrot.safetensors)

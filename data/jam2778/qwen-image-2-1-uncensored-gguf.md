# jam2778/Qwen-Image-2.1-Uncensored-GGUF

## Resumen

Qwen-Image-2.1-Uncensored-GGUF es una recopilación de cuantizaciones del modelo de generación de imágenes Qwen/Qwen-Image-2.1, publicada por el usuario jam2778 en HuggingFace. El paquete incluye el transformer de difusión cuantizado en múltiples formatos (GGUF y safetensors) junto con los ficheros complementarios necesarios para su ejecución: un text encoder Qwen3-VL de 8.000 millones de parámetros y un VAE específico. El objetivo es facilitar la inferencia local de Qwen-Image-2.1 en hardware de consumo mediante ComfyUI y la extensión ComfyUI-GGUF.

El transformer principal cuenta con 7.115.124.736 parámetros (~7,1 B) según los datos de safetensors, y el repositorio ocupa 105,2 GB en total. La etiqueta "uncensored" indica que se han eliminado total o parcialmente los mecanismos de filtrado de contenido del modelo base, lo que permite generar imágenes sobre temáticas restringidas en el original, pero también incrementa considerablemente los riesgos de uso indebido.

La relevancia de esta ficha reside en que permite a desarrolladores e investigadores desplegar un modelo de difusión de alta calidad en GPUs consumer, con opciones de cuantización desde BF16 (14,23 GB) hasta Q4_0 (4,15 GB), y con compatibilidad con flujos de trabajo estándar de ComfyUI. La licencia qwen-research heredada del modelo base condiciona el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (DiT) para generacion text-to-image, basado en Qwen/Qwen-Image-2.1; text encoder Qwen3-VL 8B y VAE independientes |
| Parametros totales | 7.115.124.736 (~7,1 B) en el transformer; el text encoder Qwen3-VL anade 8 B adicionales |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16, FP8, INT8 ConvRot, NVFP4, MLX 4-bit, MLX 6-bit, MLX 8-bit, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_0 |
| Idiomas soportados | No disponible |
| Licencia | qwen-research (license: other) |
| Formato de pesos | GGUF y safetensors |
| Modelo base | Qwen/Qwen-Image-2.1 |
| Tamano del repositorio | 105,2 GB |
| Fecha de publicacion | 2026-10-03 |

## Arquitectura y entrenamiento

Se trata de una cuantizacion del modelo Qwen-Image-2.1, un sistema text-to-image basado en un transformer de difusion (DiT). El pipeline se compone de tres piezas separadas: el transformer de difusion (7,1 B de parametros) que genera los latentes de imagen; el text encoder Qwen3-VL 8B, que convierte el prompt textual en representaciones semanticas; y el VAE qwen_image_2.1_vae_bf16, que decodifica los latentes en pixeles. No se han publicado en la informacion disponible detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF, DPO o ajuste por preferencias.

La peculiaridad de esta publicacion es su caracter "uncensored": el autor indica que emplea "the original upstream base weights" de Qwen-Image-2.1, lo que sugiere que las cuantizaciones se han construido sobre pesos base sin el ajuste de alineacion o filtrado que habitualmente aplica el proveedor original. No se documentan en la model card innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal ni variantes arquitectonicas) mas alla de la propia cuantizacion.

## Capacidades

- Generacion de imagenes a partir de prompts textuales (text-to-image) mediante difusion latente.
- Comprension de prompts complejos gracias al text encoder Qwen3-VL 8B, un modelo multimodal de vision-lenguaje.
- Generacion de contenido sin las restricciones de filtrado tipicas del modelo original (caracter "uncensored").
- Compatibilidad con flujos de trabajo de ComfyUI mediante nodos estandar como `Unet Loader (GGUF)`, `CLIPLoader` y `VAELoader`.
- Soporte de multiples precisiones para ajustar calidad frente a consumo de memoria.
- Capacidades multilingues: no disponibles en la informacion proporcionada (dependen del text encoder Qwen3-VL, pero no se detallan idiomas).
- No se documenta soporte de tool calling, function calling ni comportamiento agentico; el modelo es exclusivamente generativo de imagen.

## Casos de uso

- Ilustracion conceptual y arte digital: el modelo permite generar bocetos e ilustraciones de alta fidelidad a partir de descripciones textuales detalladas, apropiado para estudios de diseno que necesiten iterar rapidamente sobre conceptos visuales sin depender de servicios en la nube.
- Creacion de assets para videojuegos: generacion de texturas, personajes y entornos en resoluciones controladas mediante ComfyUI, con la ventaja de que las cuantizaciones Q4 permiten trabajar en una unica GPU consumer.
- Prototipado de campanas de marketing: produccion rapida de imagenes de concepto para pruebas A/B de creatividades, usando el modelo de forma local para evitar costes por llamada de API.
- Investigacion sobre alineacion y seguridad en modelos generativos: al tratarse de una version "uncensored", permite estudiar el comportamiento del modelo sin capas de rechazo, util para auditar sesgos y contenidos generados.
- Generacion de imagenes para datasets sinteticos: creacion de datos de entrenamiento para clasificadores o detectores, con control fino del prompt y del seed.
- Edicion y variacion sobre imagenes base: dentro del ecosistema ComfyUI se pueden encadenar nodos de img2img, inpainting y upscaling sobre las salidas del modelo para flujos de retoque profesional.
- Demostraciones y talleres de IA generativa: el modelo cabe en equipos con GPU consumer (por ejemplo, una RTX 4090 con la cuantizacion Q4_K_M), lo que lo hace adecuado para formacion presencial sin infraestructura cloud.
- Automatizacion de pipelines de contenido: integracion en sistemas que generen imagenes de forma masiva para catalogos, blogs o redes, siempre que la licencia lo permita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card incluye una referencia a una imagen (`assets/Qwen-Image-2.1-Benchmark.png`) que no aporta cifras textuales ni comparativas cuantificables en este contexto.

## Requisitos de hardware

- VRAM estimada para el transformer, segun cuantizacion:
  - BF16: ~14,23 GB.
  - FP8: ~6,63 GB.
  - INT8 ConvRot: ~6,76 GB.
  - NVFP4: ~4,20 GB.
  - MLX 4-bit: ~4,00 GB; MLX 6-bit: ~5,78 GB; MLX 8-bit: ~7,56 GB.
  - Q8_0: ~7,59 GB; Q6_K: ~5,88 GB; Q5_K_M: ~5,22 GB; Q4_K_M: ~4,60 GB; Q4_0: ~4,15 GB.
- Componentes adicionales que tambien consumen VRAM:
  - Text encoder Qwen3-VL 8B: 17,53 GB en BF16 o 9,35 GB en Int8 ConvRot.
  - VAE: 676 MB en BF16.
- Estimacion total en el caso recomendado (Q4_K_M + text encoder Int8 + VAE): aproximadamente 14,6 GB de VRAM. Con el text encoder en BF16, la cifra sube a unos 22,8 GB.
- GPUs recomendadas: una RTX 4090 (24 GB) o RTX 3090 (24 GB) permite ejecutar configuraciones Q4/Q5 con el text encoder en Int8; una RTX 4080 (16 GB) o 4060 Ti 16 GB puede funcionar con Q4 y text encoder Int8; una RTX 3060 de 12 GB queda al limite y probablemente requiera descargar el text encoder a RAM o usar NVFP4/MLX 4-bit.
- Para BF16 sin cuantizar hacen falta aproximadamente 32 GB de VRAM (por ejemplo, A100 40 GB, H100 80 GB, o configuraciones duales).
- Opciones de despliegue: ComfyUI con la extension ComfyUI-GGUF (se recomienda el fork mantenido leejet/ComfyUI-GGUF, que anade soporte nativo para la arquitectura Qwen-Image 2.1); en macOS con Apple Silicon se ofrecen variantes MLX 4/6/8-bit.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos en la informacion proporcionada. A continuacion se contrastan caracteristicas estructurales con alternativas del mismo segmento, marcando como "no disponible" los apartados sin datos verificables.

| Modelo | Parametros | Contexto | Licencia | Formatos | Rendimiento |
|---|---|---|---|---|---|
| Qwen-Image-2.1-Uncensored-GGUF | ~7,1 B (transformer) + 8 B text encoder | No disponible | qwen-research | GGUF, safetensors | No disponible |
| Qwen/Qwen-Image-2.1 (base) | ~7,1 B (transformer) + 8 B text encoder | No disponible | qwen-research | safetensors | No disponible |
| Stable Diffusion 3.5 Large | ~8 B (transformer) | No disponible | Stability Community License | safetensors, GGUF (comunidad) | No disponible en esta ficha |
| FLUX.1-dev | ~12 B | No disponible | FLUX.1-dev Non-Commercial | safetensors, GGUF (comunidad) | No disponible en esta ficha |

## Limitaciones y advertencias

- Caracter "uncensored": al haberse eliminado o reducido los filtros del modelo original, existe riesgo elevado de generar contenido ofensivo, sexualmente explicito, violento o ilegal. El despliegue en produccion requiere moderacion externa obligatoria.
- Herencia de sesgos: cualquier sesgo presente en Qwen-Image-2.1 y en su dataset de entrenamiento se mantiene; no hay documentacion sobre mitigaciones aplicadas.
- Riesgo de alucinacion visual: como todo modelo generativo, puede producir detalles anatomicos o fisicos incoherentes, texto ilegible o elementos fuera de lugar que el prompt no solicita.
- Idiomas: no se especifican idiomas soportados. El comportamiento con prompts en castellano no esta documentado y depende del text encoder Qwen3-VL.
- Licencia: la licencia "qwen-research" (heredada del modelo base) restringe el uso comercial. Debe revisarse el texto completo de la licencia antes de cualquier despliegue empresarial. Ademas, la publicacion figura como license: other, por lo que no se garantiza compatibilidad con la licencia original de Qwen.
- Repositorio sin soporte comunitario: 0 descargas y 0 "likes" en el momento de redactar esta ficha, creado y actualizado el mismo dia (2026-10-03), sin historial de mantenimiento ni issues abiertos. No hay garantia de que los ficheros se mantengan o se actualicen.
- Dependencia de terceros: requiere el fork leejet/ComfyUI-GGUF; con versiones antiguas (city96/ComfyUI-GGUF) se producira el error `Unknown model architecture!`.
- Sin datos de calidad: no se aportan metricas FID, CLIP score ni comparativas cuantitativas que permitan validar la fidelidad de las cuantizaciones frente al modelo BF16 original.
- Consumo de disco: el repositorio completo ocupa 105,2 GB, lo que obliga a planificar el almacenamiento antes de descargar.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/jam2778/Qwen-Image-2.1-Uncensored-GGUF
- Modelo base Qwen/Qwen-Image-2.1: https://huggingface.co/Qwen/Qwen-Image-2.1
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
- Extension ComfyUI-GGUF (fork recomendado): https://github.com/leejet/ComfyUI-GGUF
- Ficheros de cuantizacion (rutas citadas en la model card, bajo el usuario abenzerps): https://huggingface.co/abenzerps/Qwen-Image-2.1-Uncensored-GGUF

# nihui-szyl/h3-image-ncnn

## Resumen

MiniMax-H3-Image for ncnn es una conversión de los pesos del modelo de difusión MiniMax-H3-Image al formato ncnn, orientada a inferencia local en CPU y GPU Vulkan mediante BF16. El repositorio lo publica el usuario nihui-szyl, conocido por su trabajo en la implementación ncnn, y resuelve el problema de desplegar un modelo de generación de imágenes de gran tamano (el repositorio completo ocupa 185,8 GB) en entornos sin infraestructura de datacenter, usando backends portables como Vulkan.

El modelo subyacente es un DiT (Diffusion Transformer) para text-to-image y edición de imágenes de referencia, con un núcleo transformer de 40,14 GB en BF16 y bancos de modulación fijos para schedules de 4, 5 y 6 pasos. La conversión preserva los pesos del checkpoint original byte a byte y solo actualiza metadatos para hacer las identidades independientes de timestamps de descarga.

Es relevante ahora porque permite ejecutar un modelo de difusión de gran escala en hardware consumer mediante streaming de pesos desde almacenamiento, con un runtime ncnn que soporta identidades portables `H3-fixed-model-v2` y formatos de banco `H3FIXED` 3/4. La descarga mínima del deployment preparado es de aproximadamente 93,46 GB (87,04 GiB).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) convertido a ncnn |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (pesos ncnn); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | ncnn (.bin + .param); BF16 |

## Arquitectura y entrenamiento

La arquitectura subyacente es un Diffusion Transformer (DiT) para generación de imágenes condicionada por texto e imagen de referencia. La conversión a ncnn separa el núcleo transformer dependiente de imagen/texto (`transformer-core.ncnn.bin` + `.param`, 40,14 GB) de los bancos de modulación fijos en BF16, que codifican los schedules de pasos. Se publican tres bancos: seis pasos por defecto (`fixed-modulations-bf16.bin`, 349 MB), cuatro pasos experimentales (233 MB) y cinco pasos experimentales (291 MB). Existe además un productor opcional de modulaciones (`fixed-build/modulations.ncnn.bin` + `.param`, 26,11 GB) para preparar otros schedules en línea.

Los pesos del núcleo se copian byte a byte desde el checkpoint original; solo se actualizan metadatos para que las identidades del modelo no dependan de timestamps de descarga. CPU y Vulkan comparten el mismo banco BF16, aunque distintos backends de ejecución pueden producir imágenes finales diferentes. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO para el modelo original.

## Capacidades

- Generación de texto a imagen (text-to-image) mediante un schedule de difusión de seis pasos por defecto.
- Edición de imagen con imagen de referencia (image-to-image / reference-image conditioning).
- Schedules alternativos de cuatro y cinco pasos, marcados como experimentales.
- Ejecución en CPU y en GPU Vulkan con pesos BF16.
- Streaming de pesos desde almacenamiento cuando la RAM/VRAM es insuficiente para el núcleo completo.
- Verificación de integridad mediante checksums SHA-256 y manifiesto de tensores (`dit-manifest.json`).
- No se documentan tool calling, agentes, vision encoder separado ni capacidades multilingües en la información disponible.

## Casos de uso

- Generación de imágenes en estaciones de trabajo sin GPU de datacenter: el runtime ncnn con backend Vulkan permite ejecutar el DiT de 40 GB en GPUs consumer, haciendo streaming de pesos desde disco SSD cuando la VRAM no alcanza.
- Edición de imágenes de referencia en local: el núcleo compatible con condicionamiento por imagen de referencia permite flujos de image-to-image sin subir datos a servicios en la nube, útil en entornos con requisitos de privacidad.
- Prototipado de pipelines de difusión en CPU: el mismo banco BF16 se usa en CPU y Vulkan, lo que facilita validar resultados en máquinas sin GPU antes de desplegar en GPU.
- Despliegue portable en Windows/Linux/macOS vía ncnn: el formato ncnn y el backend Vulkan permiten distribuir el modelo como aplicación de escritorio sin dependencias de CUDA.
- Experimentación con schedules de pasos: los bancos de 4 y 5 pasos permiten comparar calidad y latencia frente al schedule de 6 pasos por defecto, con el productor opcional para preparar otros schedules.
- Integración en herramientas de creación de imágenes offline: el deployment preparado de 93,46 GB se puede empaquetar junto con el runtime para uso sin conexión, verificando checksums al arrancar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el núcleo transformer ocupa 40,14 GB en BF16; no cabe completo en GPUs consumer típicas, por lo que el runtime hace streaming de pesos. La descarga mínima del deployment es de 93,46 GB (87,04 GiB), incluyendo procesador, text encoder, vision, VAE y bancos.
- GPU recomendadas: no se documentan modelos concretos en la información disponible; el backend es Vulkan, por lo que se aplica a GPUs con soporte Vulkan.
- Cabe en consumer GPU: no de forma completa; requiere streaming desde RAM/almacenamiento. La velocidad depende de RAM/VRAM y almacenamiento disponibles.
- Opciones de despliegue: runtime ncnn con soporte de identidades `H3-fixed-model-v2` y formatos `H3FIXED` 3/4; builds antiguos con identidades por timestamp deben actualizarse.
- Latencia y throughput: no disponibles; dependen del hardware y del schedule de pasos (6 pasos por defecto, 4 y 5 experimentales).

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones comparables de alternativas en la información proporcionada; comparativa no disponible.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar el uso comercial permitido.
- Idiomas soportados no documentados.
- Los schedules de 4 y 5 pasos son experimentales y alteran el schedule de 6 pasos publicado.
- Distintos backends (CPU vs Vulkan) pueden producir imágenes finales diferentes.
- El núcleo de 40 GB no cabe entero en GPUs pequeñas; el rendimiento depende de RAM/VRAM y almacenamiento, y el streaming puede degradar la latencia.
- Requiere runtimes actualizados con identidades portables `H3-fixed-model-v2`; builds antiguos fallarán.
- Los archivos del modelo deben mantenerse inmutables durante su uso y verificarse contra `dit-SHA256SUMS`.
- No se documentan sesgos ni tasas de alucinación en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/nihui-szyl/h3-image-ncnn
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.

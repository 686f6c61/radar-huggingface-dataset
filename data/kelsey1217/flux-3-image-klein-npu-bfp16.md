# Kelsey1217/FLUX.3-image-klein-NPU-BFP16

## Resumen

FLUX.3-image-klein-NPU-BFP16 es una conversión de pesos del modelo de generación de imágenes FLUX.3-image-klein de Black Forest Labs, empaquetada específicamente para su ejecución en las NPU XDNA2 integradas en los procesadores AMD Ryzen AI 300. La conversión la firma el usuario Kelsey1217 y no es un producto oficial de Black Forest Labs: se trata de un trabajo independiente que adapta las matrices del transformer de difusión, del codificador de texto y del VAE a un formato BFP16 con el layout de memoria que esperan los kernels de la NPU.

El paquete está pensado para el runtime VigenFlow, que gestiona la descarga, el desempaquetado y la inferencia en hardware AMD. Las matrices se almacenan como vectores de bytes U8 dentro de tres shards de safetensors (unos 10,6 GiB), de modo que no son cargables directamente con Diffusers ni con PyTorch estándar. El modelo suma 11.412.346.564 parámetros y su pipeline es text-to-image, con edición de imagen prevista para una versión posterior del runtime.

La relevancia de esta ficha es doble: por un lado documenta el primer empaquetado conocido de FLUX.3 para NPU de consumo en portátiles Ryzen AI, y por otro advierte de sus restricciones, ya que los pesos heredan la FLUX Kommunity License, que limita el uso comercial a usuarios calificados (empresas por debajo de 5 millones de dólares de facturación anual) y prohíbe la redistribución fuera de los términos de dicha licencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (DiT) FLUX.3 con codificador de texto Qwen3-VL-4B-Instruct y VAE; pesos convertidos a BFP16 con layout NPU |
| Parámetros totales | 11.412.346.564 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BFP16 (block floating point de 16 bits) para matrices en NPU; tensores bf16 en CPU |
| Idiomas soportados | no disponible (el codificador de texto es Qwen3-VL-4B-Instruct, multilingüe, pero no se detalla la cobertura) |
| Licencia | FLUX Kommunity License v1.0 (uso no comercial salvo usuarios calificados; ver limitaciones) |
| Formato de pesos | safetensors con entradas U8 empaquetadas, formato `vgf-npu-weights-1`; 3 shards, ~10,6 GiB |

## Arquitectura y entrenamiento

El modelo subyacente es FLUX.3-image-klein, un transformer de difusión para text-to-image de Black Forest Labs, convertido desde la revisión `09561231f44e41381c461caf53d5452005a60ac9`. La conversión preserva la estructura del modelo original pero reorganiza las matrices en el layout de memoria que requieren los kernels de la NPU XDNA2, las transpone o rellena con ceros cuando es necesario y las almacena como BFP16. El codificador de texto es Qwen3-VL-4B-Instruct, empaquetado también en BFP16 para NPU, y el VAE se distribuye en formatos empaquetados para el decodificador y el codificador.

No se han publicado en la información disponible datos sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO. La innovación técnica destacable es el propio empaquetado: cada entrada de los shards es un vector plano de bytes U8 nombrado por su ruta relativa dentro de la carpeta de modelo preparada, lo que permite al runtime VigenFlow reconstruir la carpeta `all_model_weights/flux3_image_klein/` sin necesidad de cargar los pesos en PyTorch. El paquete incluye 984 entradas empaquetadas, entre ellas `LICENSE`, `Notice` y `prepare_manifest.json`, y un fichero `SHA256SUMS` para verificar la integridad de cada shard.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) con resolución de 1024 × 1024 en la configuración medida.
- Edición de imágenes anunciada para una versión posterior del runtime VigenFlow, no disponible en este paquete.
- Codificación de prompts mediante Qwen3-VL-4B-Instruct, lo que aporta comprensión de instrucciones textuales complejas.
- Inferencia híbrida CPU + NPU: las matrices se ejecutan en la NPU XDNA2 y los tensores auxiliares en CPU.
- Ejecución local en portátiles con AMD Ryzen AI 300, sin dependencia de GPU dedicada.
- No se documentan capacidades de tool calling, agentes, visión de entrada ni modo thinking en la información disponible.

## Casos de uso

- Generación de ilustraciones y concept art en local: el modelo produce imágenes de 1024 × 1024 en aproximadamente 32 segundos con 16 pasos de denoising en un Ryzen AI 9 HX 370, suficiente para iterar prompts en un portátil sin GPU dedicada.
- Prototipado de assets para videojuegos: permite generar variaciones de personajes y entornos en el propio equipo del artista, integrando el resultado en el pipeline de arte antes de un render final.
- Creación de material para marketing y redes sociales: con la licencia Kommunity, los usuarios calificados (facturación anual inferior a 5 millones de dólares) pueden usar comercialmente las salidas, lo que encaja en pequeñas agencias y estudios.
- Educación e investigación en generación de imágenes: al ejecutarse en NPU de consumo, facilita experimentos reproducibles sobre difusión sin infraestructura de centro de datos.
- Pruebas de concepto de aplicaciones de escritorio con IA generativa: VigenFlow expone el modelo mediante un runtime de línea de comandos que se puede invocar desde scripts y herramientas locales.
- Evaluación de despliegue en hardware AMD: sirve como banco de pruebas para medir latencia y consumo de la NPU XDNA2 en cargas de difusión, comparando con implementaciones en GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (FID, CLIP score, etc.) en la información disponible. El único dato de rendimiento es el tiempo de inferencia medido por el autor:

| Tarea | Modelo VigenFlow | Pasos de denoising | Tiempo aproximado |
|---|---|---:|---:|
| Text-to-image 1024 × 1024 | `flux3-klein` | 16 | ~32 s |

El tiempo corresponde a la etapa de inferencia en un AMD Ryzen AI 9 HX 370 con CPU + NPU XDNA2 y pesos BFP16, excluyendo carga del modelo, arranque del proceso, cola y transferencia de red, por lo que la petición completa tarda más.

## Requisitos de hardware

- NPU XDNA2 integrada en procesadores AMD Ryzen AI 300 (medido en Ryzen AI 9 HX 370).
- Almacenamiento: aproximadamente 10,6 GiB para los tres shards, más espacio temporal durante el desempaquetado.
- Memoria: no se especifica el consumo de RAM; el paquete combina matrices en NPU y tensores bf16 en CPU, por lo que se recomienda un equipo con al menos 16 GB de RAM, aunque este dato no está confirmado por el autor.
- GPU dedicada: no es necesaria; el modelo está diseñado para CPU + NPU.
- Despliegue: exclusivamente mediante VigenFlow v0.2.0-beta.6 o superior, con `prepare_base.exe` para descargar y desempaquetar. No es compatible con vLLM, llama.cpp, Ollama, TGI ni Diffusers.
- Latencia: ~32 s por imagen de 1024 × 1024 con 16 pasos en el hardware de referencia; el throughput no se documenta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Hardware objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FLUX.3-image-klein-NPU-BFP16 | 11.412.346.564 | no disponible | NPU XDNA2 (Ryzen AI 300) | FLUX Kommunity License | Hugging Face, 0 descargas |
| FLUX.3-image-klein (original) | no disponible en la información | no disponible | GPU | FLUX Kommunity License | Hugging Face (Black Forest Labs) |
| Otros modelos text-to-image de tamaño comparable | no disponible | no disponible | GPU | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de alternativas en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- Licencia restrictiva: los pesos son un derivado de un modelo FLUX y se distribuyen bajo la FLUX Kommunity License v1.0; el uso comercial solo está permitido a usuarios calificados (facturación anual inferior a 5 millones de dólares, incluidas filiales) y bajo los términos del texto legal.
- No es un producto oficial de Black Forest Labs: la conversión es independiente y no está validada ni respaldada por el fabricante original.
- Los archivos no son cargables como checkpoints de Diffusers o PyTorch; requieren el runtime VigenFlow y su preparador.
- Dependencia de hardware muy específica: solo funciona en NPU XDNA2 de Ryzen AI 300, lo que excluye GPU NVIDIA, AMD Radeon y otras NPU.
- La edición de imágenes no está disponible en este paquete; solo text-to-image.
- No se documentan sesgos, tasas de alucinación visual ni cobertura idiomática del codificador de texto.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, sin validación comunitaria.
- La licencia del codificador de texto Qwen3-VL-4B-Instruct es Apache 2.0, pero el conjunto del paquete queda sujeto a la licencia FLUX.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kelsey1217/FLUX.3-image-klein-NPU-BFP16
- Modelo base: https://huggingface.co/black-forest-labs/flux-3-image-klein
- Repositorio VigenFlow: https://github.com/jia1217/vigenflow
- Guía de instalación de VigenFlow: https://github.com/jia1217/vigenflow#-quick-install
- Última release de VigenFlow: https://github.com/jia1217/vigenflow/releases/latest
- Configuración de modelos de VigenFlow: https://huggingface.co/Kelsey1217/FLUX.3-image-klein-NPU-BFP16/resolve/main/prepare_models.jsonc?download=true
- Licencia FLUX Kommunity: https://huggingface.co/Kelsey1217/FLUX.3-image-klein-NPU-BFP16/blob/main/LICENSE
- Licencia comercial de Black Forest Labs: https://bfl.ai/licensing

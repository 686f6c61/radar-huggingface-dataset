# nanqing233/hassaku-v13-qnn2.28

## Resumen

Hassaku v13 QNN 2.28 es un paquete preconvertido del modelo de difusion Stable Diffusion 1.5 `Hassaku-SD1.5-v13` de Ikena, adaptado para ejecutarse sobre la NPU de Qualcomm mediante el SDK QNN 2.28 y la aplicacion Local Dream. No se trata de un modelo nuevo: es una cuantizacion y empaquetado del checkpoint original para inferencia local en dispositivos moviles con Snapdragon 8 Gen 2 o superior, evitando al usuario el proceso de conversion a formato QNN.

El modelo resuelve el problema de desplegar generacion de imagenes SD1.5 en hardware movil sin GPU dedicada, aprovechando la NPU Hexagon. Incluye el UNet base de 512x512 mas dos parches de resolucion (512x768 y 768x512) aplicados como diferencias zstd sobre el UNet base. El repositorio ocupa 2,0 GB y distribuye los artefactos en dos archivos ZIP.

Es relevante por su caracter practico: elimina la barrera tecnica de la conversion QNN y ofrece checksums verificables, pero esta restringido a una familia concreta de chips (8 Gen 2 en adelante), no soporta LoRA y esta orientado a contenido para adultos (R18).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Stable Diffusion 1.5 (UNet + CLIP + VAE, difusion latente) |
| Parametros totales | no disponible (checkpoint SD1.5, ~860M en UNet; cifra exacta no publicada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de difusion, sin contexto textual extendido; CLIP con limite estandar de 77 tokens) |
| Tipos de cuantizacion | Cuantizacion QNN propietaria para NPU (sin detalle de bits en la model card) |
| Idiomas soportados | no disponible (prompts en ingles por herencia de SD1.5; no declarado) |
| Licencia | `civitai-model-permissions` (licencia `other`) |
| Formato de pesos | Artefactos QNN (`.bin` para unet/clip/vae, tokenizer y embeddings) empaquetados en ZIP; parches `.patch` en zstd |
| Modelo base | Ikena/Hassaku-SD1.5-v13 |
| SDK / runtime | QNN SDK 2.28, app Local Dream |
| Chips compatibles | Snapdragon 8 Gen 2, 8 Gen 3, 8 Elite, 8s Gen 4, 8 Elite Gen 5 (8 Gen 1 y anteriores no soportados) |
| Resoluciones | 512x512, 512x768, 768x512 |
| clip_skip | 2 |
| Tamano del repo | 2,0 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es Stable Diffusion 1.5, un modelo de difusion latente compuesto por un UNet, un text encoder CLIP y un VAE. El paquete distribuido no entrena nada nuevo: toma el checkpoint `Hassaku-SD1.5-v13` de Ikena y lo convierte al formato QNN para ejecucion en la NPU Hexagon de Qualcomm. La model card no documenta el dataset de entrenamiento original, el numero de tokens ni si hubo tecnicas de alineacion como RLHF o DPO; esa informacion corresponde al modelo base y no se incluye aqui.

La innovacion tecnica del paquete es el empaquetado para NPU: los pesos se cuantizan y se separan en componentes (`unet`, `clip`, `vae`, `tokenizer`, `embeddings`) dentro de `qnn_models_8gen2/`. Los parches de resolucion (`.patch`) son diferencias zstd calculadas sobre el UNet base y deben residir en el mismo directorio que `unet.bin`; no deben descomprimirse ni renombrarse por separado. Se fija `clip_skip` en 2, un ajuste comun en modelos SD1.5 orientados a ilustracion.

## Capacidades

- Generacion de imagenes texto-a-imagen con Stable Diffusion 1.5 en resoluciones 512x512, 512x768 y 768x512.
- Ejecucion sobre NPU Qualcomm mediante QNN SDK 2.28 y la app Local Dream, con importacion directa del ZIP sin conversion manual.
- Aplicacion automatica de parches de resolucion al cambiar entre las tres resoluciones soportadas.
- Estilo orientado a ilustracion y contenido para adultos (R18), heredado del checkpoint Hassaku v13.
- No soporta LoRA ni ajustes finos adicionales tras la cuantizacion.
- No dispone de tool calling, capacidades de agente, vision de entrada, audio ni modo de razonamiento; es exclusivamente un modelo de difusion de imagen.
- Capacidades multilingues de prompt no declaradas; se asume el comportamiento estandar de CLIP en SD1.5.

## Casos de uso

- Generacion de ilustracion en dispositivo movil: un usuario con un Snapdragon 8 Gen 2 o superior importa el ZIP en Local Dream y genera imagenes 512x512 sin conexion, aprovechando la NPU para reducir consumo energetico frente a CPU o GPU integrada.
- Prototipado de pipelines de difusion en Android: desarrolladores que evaluan el rendimiento de SD1.5 sobre Hexagon pueden usar este paquete como referencia funcional sin escribir el conversor QNN.
- Aplicaciones de ocio y creatividad offline: apps que ofrezcan generacion de imagenes privada en el propio telefono, sin enviar prompts a servidores externos.
- Pruebas de resoluciones no cuadradas: los parches 512x768 y 768x512 permiten evaluar composiciones verticales y horizontales en movil con el mismo paquete.
- Investigacion sobre cuantizacion en NPU: comparar la calidad de salida del checkpoint original frente a la version QNN 2.28 en el mismo hardware.
- Demostraciones y contenido para adultos en entornos controlados: generacion local de imagenes R18 para usuarios verificados mayores de 18 anos, dado el caracter del checkpoint base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Hardware obligatorio: SoC Snapdragon 8 Gen 2, 8 Gen 3, 8 Elite, 8s Gen 4 u 8 Elite Gen 5. Los chips 8 Gen 1 y anteriores no son compatibles.
- VRAM: no aplica; la inferencia se ejecuta en la NPU Hexagon del SoC, no en GPU dedicada.
- GPU de escritorio: el paquete no esta pensado para A100, H100 ni RTX 4090; esta empaquetado exclusivamente para QNN en movil.
- Almacenamiento: el ZIP completo ocupa 942 MB y la variante base512 932 MB; el repositorio total es de 2,0 GB.
- Despliegue: app Local Dream (https://github.com/xororz/local-dream) con importacion del ZIP sin descomprimir. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| Hassaku v13 QNN 2.28 (este) | SD1.5 (~860M UNet) | no aplica | QNN 2.28, NPU Snapdragon 8 Gen 2+ | civitai-model-permissions | Preconvertido, sin LoRA, R18 |
| Ikena/Hassaku-SD1.5-v13 (base) | SD1.5 | no aplica | safetensors / diffusers | civitai-model-permissions | Checkpoint original sin cuantizar, ejecutable en GPU |
| Stable Diffusion 1.5 estandar | SD1.5 | no aplica | safetensors, ONNX, etc. | CreativeML OpenRAIL-M | Referencia generica, sin adaptacion NPU |

No se dispone de datos de rendimiento comparado entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Compatibilidad de hardware muy restringida: solo Snapdragon 8 Gen 2 y posteriores; no funciona en 8 Gen 1 ni anteriores.
- No soporta LoRA ni ajustes posteriores a la cuantizacion, lo que limita la personalizacion.
- Contenido R18: uso exclusivo para mayores de 18 anos; puede no ser apto para entornos laborales o productos dirigidos al publico general.
- Licencia `civitai-model-permissions`: permite obras derivadas y uso comercial de las imagenes generadas, pero prohibe la reventa del modelo en si. Conviene revisar los terminos completos en Civitai antes de uso comercial.
- Riesgo de sesgos y alucinaciones visuales inherente a SD1.5 y al checkpoint base; no se documentan evaluaciones de sesgo.
- Los parches `.patch` deben mantenerse junto a `unet.bin` en el mismo directorio; manipularlos o renombrarlos rompe la aplicacion de resoluciones.
- Ausencia de benchmarks publicados impide estimar la perdida de calidad respecto al checkpoint original.
- El autor declara no tener afiliacion con Qualcomm, xororz ni el autor original; el soporte es limitado.

## Enlaces

- Hugging Face: https://huggingface.co/nanqing233/hassaku-v13-qnn2.28
- Modelo base: https://huggingface.co/Ikena/Hassaku-SD1.5-v13
- Modelo original en Civitai: https://civitai.com/models/2583
- App Local Dream: https://github.com/xororz/local-dream

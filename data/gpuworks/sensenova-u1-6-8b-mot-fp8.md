# gpuworks/SenseNova-U1.6-8B-MoT-FP8

## Resumen

SenseNova-U1.6-8B-MoT-FP8 es un checkpoint cuantizado en FP8 del modelo multimodal nativo SenseNova-U1.6-8B-MoT, desarrollado originalmente por SenseNova (SenseTime) y convertido a FP8 por el usuario gpuworks. Se trata de un modelo any-to-any que combina comprensión multimodal (texto e imagen) con generación y edición de imágenes en una única arquitectura transformer de 42 capas, con 17.532.854.464 parámetros totales (aproximadamente 17,5 mil millones). La cuantización reduce el peso en disco de 35 GB a 18,86 GB, lo que permite cargarlo en una única GPU de 24 GB como la RTX 4090 sin necesidad de offloading a RAM del host.

El modelo base emplea una arquitectura de tipo Mixture-of-Transformers (MoT), con ramas separadas para comprensión y generación dentro de cada capa del decodificador, e integra codificadores de visión y un cabezal de píxeles para la síntesis de imágenes. Está pensado para tareas de generación de texto e imagen, edición de imágenes y extracción de características, y se sirve mediante vLLM-Omni (versión 0.34 o superior), que detecta automáticamente los pesos FP8 a partir del `config.json`.

La relevancia de esta ficha radica en que demuestra un flujo de cuantización offline reproducible y verificada: según el autor, las salidas son idénticas píxel a píxel a las de la cuantización FP8 en línea de vLLM-Omni, con la ventaja de un arranque más rápido, menor uso de RAM del host y menor huella en disco y en VRAM. La licencia es Apache-2.0, lo que facilita su uso comercial con las condiciones habituales de atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal nativo con Mixture-of-Transformers (MoT), 42 capas de decodificador, ramas de comprensión y generación (`*_mot_gen`), codificadores de visión y cabezal de píxeles |
| Parametros totales | 17.532.854.464 (aproximadamente 17,5 mil millones) |
| Parametros activos | no disponible (no se especifica que sea MoE; MoT hace referencia a Mixture-of-Transformers, no a mezcla de expertos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 W8A8 (pesos `float8_e4m3fn` con escala `float32` por tensor y activaciones dinámicas); el modelo base admite BF16 |
| Idiomas soportados | inglés (en) y chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (5 shards, 18,86 GB), con `config.json` que incluye `quantization_config` con `quant_method: fp8` |

## Arquitectura y entrenamiento

El modelo base SenseNova-U1.6-8B-MoT emplea una arquitectura Mixture-of-Transformers (MoT) en la que cada una de las 42 capas del decodificador contiene dos ramas: una para comprensión y otra para generación (`*_mot_gen`). Esta separación permite que el modelo procese entradas multimodales y genere tanto texto como imágenes dentro de un mismo stack. La arquitectura incluye codificadores de visión (`vision_model` y `fm_modules.vision_model_mot_gen`), embedders de timestep y escala de ruido, y un cabezal de píxeles (`fm_modules.*`) para la síntesis de imágenes. El modelo se etiqueta como "native multimodal" y "any-to-any", lo que indica que acepta y produce múltiples modalidades de forma nativa.

En cuanto al entrenamiento, la información disponible no detalla el número de tokens, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card del checkpoint cuantizado remite a la model card del modelo base para esos datos, que no se incluyen en la información proporcionada. La innovación técnica destacable de esta ficha es el proceso de cuantización: se cuantizan 588 capas lineales (las proyecciones `q`, `k`, `v`, `o` de atención y `gate`, `up`, `down` del MLP en ambas ramas de las 42 capas) a FP8, mientras que se mantienen en BF16 los embeddings, el `lm_head`, las normalizaciones RMSNorm y q-k norm, los codificadores de visión, los embedders de timestep y ruido y el cabezal de píxeles. La conversión se realiza con el kernel `scaled_fp8_quant` de vLLM sobre GPU, con escalas de grupo compartidas para las proyecciones fusionadas q/k/v y gate/up.

## Capacidades

- Generación de texto e imágenes en un único modelo any-to-any, con soporte de text-to-image a resoluciones de 1024x1024 y 2048x2048.
- Edición de imágenes a través del endpoint `/v1/images/edits`, con capacidad de modificar imágenes existentes según instrucciones.
- Comprensión multimodal: procesa imágenes junto con texto gracias a los codificadores de visión integrados.
- Extracción de características (feature extraction), según la etiqueta de pipeline del repositorio.
- Soporte multilingüe limitado a inglés y chino.
- Servicio mediante vLLM-Omni con endpoints compatibles con la API de OpenAI para generación de imágenes (`/v1/images/generations`).
- No se especifica en la información disponible soporte de tool calling, function calling, agentes o modos de razonamiento multi-paso.

## Casos de uso

- Generación de imágenes por prompt en producción: el modelo puede generar imágenes a 1024x1024 en aproximadamente 9,2 segundos en una RTX 4090 con 50 pasos de denoising, lo que lo hace adecuado para pipelines de creación de contenido visual bajo demanda.
- Edición de imágenes asistida: mediante el endpoint `/v1/images/edits`, se puede integrar en herramientas de retoque o modificación de imágenes guiada por instrucciones en lenguaje natural, con latencias de unos 10 segundos por edición a 1024x1024.
- Generación de imágenes de alta resolución: la capacidad de generar a 2048x2048 (en torno a 42 segundos en una RTX 4090) permite producir material para impresión o fondos de pantalla de alta densidad sin recurrir a modelos separados de upscaling.
- Extracción de características multimodales: al estar etiquetado como `feature-extraction`, puede emplearse para obtener representaciones de imágenes y texto en sistemas de búsqueda semántica o clasificación.
- Despliegue en hardware de consumo: al caber en una única GPU de 24 GB (RTX 4090) con un pico de 21,1 GiB en 2048x2048, es viable para prototipado y despliegues de pequeña escala en estaciones de trabajo con GPU consumer.
- Servicio de API compatible con OpenAI: al exponerse mediante vLLM-Omni con endpoints `/v1/images/generations`, se puede integrar en aplicaciones existentes que ya consuman APIs de generación de imágenes, facilitando la migración.
- Entornos con recursos limitados de disco y RAM: con 18,86 GB en disco y un pico de RSS de host de 2,8 GiB durante la carga, es adecuado para servidores con almacenamiento ajustado o contenedores con límites de memoria estrictos.

## Benchmarks y rendimiento

La información disponible no incluye resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros). Se presentan, en su lugar, las mediciones de rendimiento del autor en una RTX 4090 (24 GB), con vLLM-Omni v0.34.0, 50 pasos de denoising, concurrencia 1 y mediana de 3 peticiones tras un calentamiento:

| Metrica | FP8 en linea (base BF16) | Este checkpoint FP8 |
|---|---|---|
| Text-to-image 1024x1024 | 9,27 s | 9,23 s |
| Text-to-image 2048x2048 | 42,38 s | 42,47 s |
| Edicion de imagen 1024x1024 | 10,00 s | 10,00 s |
| Arranque del servidor a healthy (cache de pagina caliente) | 32 s | 30 s (26 s con `-q fp8` explicito) |
| Pico de RSS del host durante carga y servicio | 12,3 GiB | 2,8 GiB (5,5 GiB con `-q fp8` explicito) |
| Memoria GPU tras la carga | 19,3 GiB | 18,7 GiB |
| Pico de memoria GPU (2048x2048) | 21,7 GiB | 21,1 GiB |
| Disco | 35,07 GB | 18,86 GB |

En cuanto a calidad, el autor reporta que las 9 imágenes de prueba (3 text-to-image a 1024, 3 a 2048 y 3 ediciones a 1024) son idénticas píxel a píxel a las generadas con FP8 en línea (PSNR infinito, SSIM 1,0, diferencia absoluta media 0). No se ha comparado contra la salida en BF16, por lo que la pérdida de calidad FP8 frente a BF16 no está cuantificada en esta información.

## Requisitos de hardware

- VRAM estimada: aproximadamente 18,7 GiB tras la carga y un pico de 21,1 GiB en generación a 2048x2048; cabe en una GPU de 24 GB.
- GPU verificada: NVIDIA RTX 4090 (Ada, compute capability 8.9), donde vLLM selecciona el kernel CUTLASS FP8 W8A8.
- GPU Hopper: utilizan la misma ruta W8A8 según el autor.
- GPU Ampere (RTX 3090, A100): carecen de tensor cores FP8; vLLM recurre a Marlin weight-only FP8 (W8A16) para checkpoints FP8 serializados por tensor, pero el autor indica que no ha probado este checkpoint en Ampere.
- Cabe en GPU consumer: sí, en RTX 4090 (24 GB) y previsiblemente en otras GPU con al menos 22 GB de VRAM efectiva, aunque no se confirma en la información.
- Opciones de despliegue: vLLM-Omni (versión 0.34 o superior), con la imagen `vllm/vllm-omni:v0.34.0` o instalación vía `pip install "vllm-omni>=0.34"`. El flag `--omni` detecta los pesos FP8 automáticamente; `--quantization fp8` explícito también funciona y produce salidas idénticas.
- Latencia y throughput: 9,23 s para 1024x1024 y 42,47 s para 2048x2048 con 50 pasos y concurrencia 1; el arranque en caliente es de 30 s (26 s con `-q fp8` explícito). No se proporcionan datos de throughput con mayor concurrencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| SenseNova-U1.6-8B-MoT-FP8 (este) | 17,53 mil millones | no disponible | Apache-2.0 | safetensors FP8 (18,86 GB) | Cuantizado offline, idéntico a FP8 en línea, cabe en 24 GB |
| SenseNova-U1.6-8B-MoT (base) | 17,53 mil millones | no disponible | Apache-2.0 | safetensors BF16 (35,07 GB) | Requiere más VRAM; no cabe en 24 GB sin offloading |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de otros modelos any-to-any comparables en la información proporcionada |

## Limitaciones y advertencias

- La cuantización FP8 es intrínsecamente con pérdida; aunque el autor verifica identidad píxel a píxel frente a FP8 en línea, no se ha cuantificado la pérdida frente a la salida en BF16, que podría afectar a la calidad en casos no medidos.
- El modelo solo soporta inglés y chino; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- No se dispone de información sobre sesgos, riesgo de alucinación ni limitaciones de contexto del modelo base en la documentación proporcionada; se remite a la model card del modelo base.
- El checkpoint no ha sido probado en GPU Ampere (RTX 3090, A100); en esas tarjetas vLLM recurre a una ruta W8A16 (Marlin) cuya calidad y rendimiento no están verificados por el autor.
- Aunque la licencia es Apache-2.0, se debe conservar la atribución correspondiente y verificar las condiciones del modelo base (SenseNova / SenseTime) para uso comercial.
- El despliegue requiere vLLM-Omni 0.34 o superior; versiones anteriores pueden no detectar correctamente el `quantization_config` con `is_checkpoint_fp8_serialized`.
- El rendimiento medido corresponde a concurrencia 1; no se ofrecen datos de latencia o throughput bajo carga concurrente, lo que limita las estimaciones para producción a gran escala.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria independiente de los resultados reportados por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gpuworks/SenseNova-U1.6-8B-MoT-FP8
- Modelo base: https://huggingface.co/sensenova/SenseNova-U1.6-8B-MoT
- Repositorio vLLM-Omni: https://github.com/vllm-project/vllm-omni
- Script de conversión incluido en el repo: `convert_fp8.py` (referenciado en la model card del checkpoint)
- Paper, blog o demo del modelo base: no disponible en la información proporcionada.

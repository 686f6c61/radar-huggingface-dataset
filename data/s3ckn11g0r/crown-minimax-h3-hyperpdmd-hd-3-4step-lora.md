# S3ckn11g0r/CROWN-MiniMax-H3-HyperPDMD-HD-3-4Step-LoRA

## Resumen

CROWN MiniMax-H3 HyperPDMD-HD es una suite de LoRAs de aceleración y destilación para el modelo de generación de vídeo con audio MiniMax-H3, publicado por el usuario S3ckn11g0r bajo la marca NineCrowns (`[CROWN]`). Su función es reducir el número de pasos de muestreo necesarios para generar vídeo (de decenas a 3-4 pasos) manteniendo la nitidez espacial, además de ofrecer robustez frente a distintos niveles de cuantización del modelo base (BF16, INT8 con rotación de Hadamard y GGUF Q4_K_M). El paquete ocupa unos 2,2 GB en el repositorio, aunque los pesos principales rondan los 340-346 MiB por variante en rango 38 y 591,6 MiB en rango 64.

El modelo base sobre el que opera es MiniMax-H3, un DiT conjunto de vídeo y audio estéreo a 32 kHz con aproximadamente 33.000 millones de parámetros, según la model card. La LoRA se distribuye en dos variantes funcionales: FL2VA (que cubre text-to-video, image-to-video y first-last-frame-to-video-audio) y Ref2VA (reference-to-video-audio con soporte de múltiples referencias y lip-sync). Ambas se ofrecen en versión comprimida (rango medio 38) y en versión maestra sin comprimir (rango 64).

La relevancia de esta ficha es doble: por un lado, ejemplifica el ecosistema de LoRAs de aceleración para modelos de vídeo de gran tamaño, que permiten inferencia en GPUs de consumo; por otro, su diseño "todo en uno" para múltiples precisiones evita tener que mantener LoRAs separadas por formato de pesos. La licencia declarada es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptadores de bajo rango) sobre DiT conjunto de vídeo y audio MiniMax-H3 |
| Parametros totales | No disponible (la LoRA ocupa 340,3-591,6 MiB por variante; el modelo base se describe como 33B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16, ConvRot INT8 (bloques de 256 con Hadamard), GGUF Q4_K_M |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (variantes r38 y r64); el modelo base admite GGUF e INT8 |

## Arquitectura y entrenamiento

La LoRA se aplica sobre las proyecciones lineales del DiT de MiniMax-H3 y del módulo TokenRefiner, cubriendo según la model card las 208 capas lineales del modelo base (208/208, es decir, el 100 %). Se ofrecen dos rangos: un rango medio de 38 (comprimido, con retención de energía declarada del 99,96 % en FL2VA y 99,98 % en Ref2VA) y un rango 64 sin comprimir (retención del 100 %). El entrenamiento se realizó según el autor en clústeres de 8×NVIDIA B200 con perturbación en línea de los pesos del estudiante para simular tres precisiones: 45 % GGUF Q4_K_M, 35 % INT8 con rotación de Hadamard por bloques de 256 y 20 % BF16 puro.

La técnica de destilación se denomina HyperPDMD (Projected Distribution Matching Distillation), complementada con un discriminador espectral basado en un VideoVAE con convolución 3D de 5 fotogramas. El objetivo declarado es eliminar artefactos típicos de la generación a 4 pasos sin LoRA, como el congelamiento en image-to-video de un solo fotograma, el colapso en text-to-video puro y el doble fantasma o desenfoque en la franja media del clip (5-10 s). El autor afirma mejoras de 6,5× a 10× en nitidez óptica medida con Laplaciano.

## Capacidades

- Generación de vídeo a partir de texto (T2V), imagen (I2V), primer y último fotograma (FL2V) y referencias múltiples (R2V) mediante las variantes FL2VA y Ref2VA.
- Generación conjunta de vídeo y audio estéreo a 32 kHz, con soporte de diálogo y lip-sync en la variante Ref2VA.
- Aceleración a 3-4 pasos de muestreo, con clips de hasta 15 segundos (362 fotogramas a 24 fps).
- Funcionamiento con el modelo base en BF16, INT8 ConvRot o GGUF Q4_K_M sin necesidad de LoRAs específicas por precisión.
- Compatibilidad nativa con ComfyUI 0.33.0 o superior, con flujos de trabajo listos para ejecutar en 480P y 768P.
- Soporte de referencia de imagen de alta resolución para fidelidad facial a nivel de poro en 768P (parámetro `ref_image_size = "max"`).
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso; el modelo es exclusivamente generativo audiovisual.

## Casos de uso

- Prototipado rápido de vídeo publicitario: con 3-4 pasos de muestreo y clips de hasta 15 segundos, un estudio puede iterar decenas de variaciones de un anuncio en una sola GPU de consumo, algo inviable con el modelo base sin aceleración.
- Generación de vídeo con diálogo para redes sociales: la variante Ref2VA permite introducir una referencia de personaje y obtener un clip con audio estéreo y lip-sync, útil para crear avatares o presentadores virtuales sin pipeline de audio separado.
- Previsualización de storyboards en producción audiovisual: la variante FL2VA con primer y último fotograma permite fijar la composición inicial y final de un plano y generar la interpolación con audio, agilizando la revisión de guion gráfico.
- Despliegue en estaciones de trabajo con menos de 9 GiB de VRAM: combinando la LoRA con el modelo base en GGUF Q4_K_M y `UnetLoaderGGUFAdvanced` con `patch_dtype="target"`, se puede ejecutar en GPUs de consumo sin sobrecoste de VRAM por la LoRA.
- Creación de contenido para e-commerce: generar clips de producto a 768P a partir de una imagen de referencia y texto descriptivo, con la ventaja de que la LoRA mantiene nitidez en la franja media del clip donde el modelo base sin LoRA genera doble exposición.
- Investigación en destilación de modelos de difusión: el paquete incluye comparativas multi-precisión en vídeo y flujos de trabajo, lo que lo convierte en un banco de pruebas para estudiar el efecto de la cuantización en la calidad de vídeo generado.
- Integración en pipelines de ComfyUI existentes: los seis flujos JSON incluidos (T2V, I2V/FL2V y R2V en 480P y 768P) permiten incorporar la aceleración a instalaciones ya operativas sin reescribir grafos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente aporta métricas internas del autor (retención de energía del 99,96-100 % y mejora de nitidez Laplaciana de 6,5×-10× frente a ejecuciones sin LoRA a 4 pasos), sin comparaciones con otros modelos ni valores absolutos de FVD, CLIP score u otras métricas estándar.

## Requisitos de hardware

- VRAM estimada: menos de 9 GiB con el modelo base en GGUF Q4_K_M y `UnetLoaderGGUFAdvanced` con `patch_dtype="target"` (sin sobrecoste de VRAM atribuido a la LoRA); 16-24 GiB con el modelo base en INT8 ConvRot; estación de trabajo o nube con BF16.
- GPU recomendadas: el autor cita clústeres de 8×NVIDIA B200 para el entrenamiento; para inferencia, GPUs de consumo con menos de 9 GiB, GPUs de 16-24 GiB para INT8 y estaciones de trabajo para BF16. No se especifican modelos concretos de GPU de consumo.
- Cabe en GPU de consumo: sí, según el autor, con la configuración GGUF Q4_K_M.
- Opciones de despliegue: ComfyUI 0.33.0 o superior (flujos incluidos), con `SamplerCustomAdvanced`, `BasicGuider` con CFG=1.0, `KSamplerSelect` con "euler", `BetaSamplingScheduler` (3-4 pasos, alpha y beta 0.6) y `MiniMaxH3SigmaShift` (shift_video 12.0 y shift_audio 3.0 en FL2VA; shift_video 9.0 en Ref2VA a 1344×768). La librería declarada es diffusers, aunque los flujos proporcionados son de ComfyUI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otras LoRAs de aceleración ni con otros modelos de generación de vídeo con audio, y no se dispone de datos de benchmarks que permitan una comparación rigurosa.

## Limitaciones y advertencias

- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria de los resultados declarados por el autor.
- Las métricas de retención de energía y mejora de nitidez proceden exclusivamente de la model card y no han sido verificadas de forma independiente.
- El modelo base MiniMax-H3 se describe como un DiT de 33B, lo que implica requisitos de memoria y cómputo elevados incluso con la aceleración; el umbral de menos de 9 GiB depende de usar GGUF Q4_K_M y un nodo concreto de ComfyUI.
- La licencia Apache 2.0 se declara para la LoRA, pero el uso comercial está condicionado por la licencia del modelo base MiniMax-H3, que debe verificarse por separado.
- No se documentan sesgos conocidos ni riesgos de alucinación específicos; al ser un modelo generativo de vídeo, existe riesgo de contenido sintético no fiel a la realidad y de reproducción de sesgos presentes en los datos de entrenamiento del modelo base.
- No se especifican idiomas soportados ni limitaciones de contexto, por lo que no es posible evaluar su comportamiento multilingüe.
- La configuración recomendada depende de una versión concreta de ComfyUI (0.33.0+) y de nodos específicos; cambios de versión pueden romper la compatibilidad de los flujos incluidos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/S3ckn11g0r/CROWN-MiniMax-H3-HyperPDMD-HD-3-4Step-LoRA
- Modelo base MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Modelo base en Comfy-Org: https://huggingface.co/Comfy-Org/MiniMax-H3
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repositorios de código o demos.

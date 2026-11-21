# moonbox-dev/LTX-2.5-PyTorch

## Resumen

LTX-2.5-PyTorch es un paquete de pesos del modelo de generacion de video LTX-2.5 desarrollado originalmente por Lightricks, redistribuido y convertido por moonbox-dev para su uso en la aplicacion de escritorio Moonbox. Se trata de una conversion a formato MLX (Apple silicon) y cuantizacion del transformer destilado de 22B parametros de LTX-2.5, junto con su text encoder Gemma 4 12B, los VAE de video y audio, el vocoder, el upscaler y un conjunto de LoRAs de edicion. El repositorio no es una release oficial de Lightricks, sino un espejo de los ficheros que descarga la aplicacion Moonbox.

El modelo resuelve generacion de video a partir de texto (text-to-video) y a partir de una imagen inicial (image-to-video), con audio sincronizado, en clips de 2 a 10 segundos y resoluciones de hasta HD. La relevancia actual radica en que permite ejecutar un modelo de video de 22B en ordenadores con Apple silicon mediante cuantizacion a 6 bits del DiT y 8 bits (o 4 bits) del text encoder, algo que en precision completa requeriria hardware mucho mas potente.

El repositorio ocupa 118,6 GB e incluye tanto el DiT de audio+video como una variante solo de video, ademas de 16 LoRAs de edicion (relight, restauracion, colorizacion, reencuadre, deblur, SDR a HDR, simulacion de agua, entre otras). La licencia es la LTX-2.x Community License, distinta de las licencias open source estandar, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (DiT) destilado, con ramas de audio y video; text encoder Gemma 4 12B |
| Parametros totales | 22B (transformer destilado); text encoder Gemma 4 12B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 6 bits (DiT), 8 bits y 4 bits (text encoder), en formato MLX |
| Idiomas soportados | no disponible |
| Licencia | LTX-2.x Community License (license: other) |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base es LTX-2.5 de Lightricks, un transformer de difusion (DiT) destilado de 22B parametros que genera video y audio de forma conjunta. La version redistribuida por moonbox-dev incluye dos variantes del DiT: una que produce audio y video simultaneamente (`dit_q6_av.safetensors`) y otra solo de video (`dit_q6_video.safetensors`), ambas cuantizadas a 6 bits para MLX. El pipeline se completa con un VAE de video convolucional (encoder y decoder), un VAE de audio, un vocoder, un upscaler espacial x2 v1.0 y una cabeza de duracion.

El text encoder es Gemma 4 12B afinado especificamente para LTX (`gemma4-12b-with-proj-ltx-2.5`), sobre la base de google/gemma-4-12B, cuantizado a 8 bits con una variante a 4 bits para equipos con menos memoria. El proceso de destilacion del transformer original permite reducir pasos de inferencia, aunque la model card no detalla el numero de tokens de entrenamiento ni la composicion del dataset. No se documenta en la informacion disponible si hubo RLHF, DPO ni otras tecnicas de alineacion.

## Capacidades

- Generacion de video a partir de texto (text-to-video) con audio sincronizado.
- Generacion de video a partir de una imagen inicial (image-to-video).
- Clips de 2 a 10 segundos de duracion y resoluciones de hasta HD.
- Generacion de audio asociada al video (rama de audio del DiT mas vocoder).
- Dieciseis ediciones sobre clip o imagen fija mediante LoRAs: relight, restauracion, colorizacion, reencuadre, deblur, descompresion, SDR a HDR, simulacion de agua, cinemagraph, control de slow motion, in/outpainting, shave instantaneo, control de motion track, union control, alpha gen, clean plate, ingredients, layout-to-render, pixel spatial upscaler y refine details.
- Upscaling espacial x2 mediante upscaler dedicado y LoRA de pixel spatial upscaler.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso, al no ser un modelo de lenguaje conversacional.

## Casos de uso

- Generacion de clips publicitarios cortos: el modelo produce videos de 2 a 10 segundos con audio a partir de un prompt de texto, adecuado para anuncios en redes sociales y formatos verticales.
- Animacion de stills para previsualizacion: a partir de una imagen inicial (image-to-video) se generan animaciones cortas que permiten validar una direccion de arte antes de producir en 3D o rodaje real.
- Postproduccion y restauracion de metraje: las LoRAs de Restore, Deblur, Decompression y Refine Details permiten limpiar y mejorar clips existentes sin salir del pipeline.
- Colorizacion y conversion de rango dinamico: las LoRAs Colorization y SDR-To-HDR posibilitan recuperar material en blanco y negro o ampliar el rango dinamico de grabaciones antiguas.
- Edicion de iluminacion y atmosfera: las LoRAs Day-To-Night, Relight y Water-Simulation permiten cambiar la hora del dia o anadir efectos de agua sobre un clip ya rodado.
- Generacion de assets con transparencia: la LoRA Alpha-Gen facilita la creacion de elementos con canal alfa para composicion en editores de video.
- Prototipado en escritorio con Apple silicon: al estar cuantizado a 6 bits y en formato MLX, permite iterar en local en un Mac con memoria unificada, sin depender de GPUs en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio completo ocupa 118,6 GB, por lo que se recomienda almacenamiento NVMe o SSD de al menos 150 GB libres.
- El DiT de 22B cuantizado a 6 bits requiere aproximadamente 16-18 GB solo para los pesos del transformer; el text encoder de 12B a 8 bits anade unos 12 GB, y a 4 bits unos 6-7 GB. En total, la inferencia completa necesita del orden de 30-40 GB de memoria unificada en la configuracion de 8 bits, y menos con la variante de 4 bits.
- Orientado a Apple silicon (formato MLX): Mac con chip M-series y memoria unificada de 32 GB o superior para la variante de 8 bits; 24 GB o mas para la variante de 4 bits en tamanos Draft y Small.
- GPU NVIDIA no soportadas de forma nativa por estos pesos MLX; para CUDA seria necesario usar los pesos originales de Lightricks/LTX-2.5 en bf16, que requieren GPUs de 80 GB (A100, H100) o multi-GPU.
- Opciones de despliegue: la aplicacion Moonbox (que verifica cada fichero contra una lista firmada) o el ecosistema MLX de Apple. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / duracion | Licencia | Disponibilidad |
|---|---|---|---|---|
| LTX-2.5-PyTorch (esta ficha) | 22B DiT + 12B text encoder | clips de 2-10 s, hasta HD | LTX-2.x Community | MLX, safetensors |
| Lightricks/LTX-2.5 (original) | 22B DiT + 12B text encoder | clips de 2-10 s, hasta HD | LTX-2.x Community | bf16, safetensors |
| LTX-2.5 (4-bit encoder) | 22B DiT + 12B encoder a 4 bits | clips Draft y Small | LTX-2.x Community | MLX, safetensors |

No se dispone de datos de benchmarks que permitan comparar el rendimiento cualitativo frente a otras alternativas de generacion de video en la informacion proporcionada.

## Limitaciones y advertencias

- No es una release oficial de Lightricks: el repositorio lo mantiene moonbox-dev y esta pensado como fuente de descarga para la aplicacion Moonbox; puede no recibir actualizaciones ni soporte del autor original.
- La licencia LTX-2.x Community License no es una licencia open source estandar; es necesario revisar sus terminos antes de cualquier uso comercial, redistribucion o despliegue en produccion.
- Los pesos estan cuantizados a 6 bits (DiT) y 8/4 bits (text encoder), lo que puede introducir perdida de calidad respecto a los pesos bf16 originales.
- El formato MLX limita el uso a Apple silicon; no es directamente utilizable en GPUs NVIDIA o AMD sin reconversion.
- No se documentan idiomas soportados, sesgos conocidos ni tasas de alucinacion en la informacion disponible.
- La duracion maxima de los clips es de 10 segundos, lo que restringe su uso para contenido de mayor longitud sin concatenacion o extension.
- El repositorio de 118,6 GB incluye gran cantidad de LoRAs y componentes auxiliares; descargar solo los ficheros necesarios reduce el consumo de disco.
- Al ser un modelo de difusion para video, no dispone de tool calling, agentes ni razonamiento multi-paso; no debe evaluarse como un LLM.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/moonbox-dev/LTX-2.5-PyTorch
- Modelo base original: https://huggingface.co/Lightricks/LTX-2.5
- Licencia LTX-2.x Community: https://github.com/Lightricks/LTX-2/blob/main/LICENSE-2_x
- Aplicacion Moonbox: https://moonbox.dev
- Text encoder base: https://huggingface.co/google/gemma-4-12B
- LoRA In-Outpainting: https://huggingface.co/Lightricks/LTX-2.3-22b-IC-LoRA-In-Outpainting
- LoRA Instant-Shave: https://huggingface.co/Lightricks/LTX-2.3-22b-IC-LoRA-Instant-Shave
- LoRA Motion-Track-Control: https://huggingface.co/Lightricks/LTX-2.3-22b-IC-LoRA-Motion-Track-Control
- LoRA Union-Control: https://huggingface.co/Lightricks/LTX-2.3-22b-IC-LoRA-Union-Control
- LoRA Alpha-Gen: https://huggingface.co/Lightricks/LTX-2.5-22b-IC-LoRA-Alpha-Gen
- LoRA Clean-Plate: https://huggingface.co/Lightricks/LTX-2.5-22b-IC-LoRA-Clean-Plate
- LoRA Colorization: https://huggingface.co/Lightricks/LTX-2.5-22b-IC-LoRA-Colorization
- LoRA Day-To-Night: https://huggingface.co/Lightricks/LTX-2.5-22b-IC-LoRA-Day-To-Night
- LoRA Deblur: https://huggingface.co/Lightricks/LTX-2.5-22b-IC-LoRA-Deblur
- LoRA Decompression: https://huggingface.co/Lightricks/LTX-2.5-22b-IC-LoRA-Decompression
- LoRA Ingredients: https://huggingface.co/Lightricks/LTX-2.5-22b-IC-LoRA-Ingredients
- LoRA Layout-To-Render: https://huggingface.co/Lightricks/LTX-2.5-22b-IC-LoRA-Layout-To-Render
- LoRA Pixel-Spatial-Upscaler: https://huggingface.co/Lightricks/LTX-2.5-22b-IC-LoRA-Pixel-Spatial-Upscaler
- LoRA Refine-Details: https://huggingface.co/Lightricks/LTX-2.5-22b-IC-LoRA-Refine-Details
- LoRA Restore: https://huggingface.co/Lightricks/LTX-2.5-22b-IC-LoRA-Restore
- LoRA SDR-To-HDR: https://huggingface.co/Lightricks/LTX-2.5-22b-IC-LoRA-SDR-To-HDR
- LoRA Water-Simulation: https://huggingface.co/Lightricks/LTX-2.5-22b-IC-LoRA-Water-Simulation
- LoRA Cinemagraph: https://huggingface.co/Lightricks/LTX-2.5-22b-LoRA-Cinemagraph
- LoRA Slow-Motion-Control: https://huggingface.co/Lightricks/LTX-2.5-22b-LoRA-Slow-Motion-Control
- Depth-Anything-V2-Small: https://huggingface.co/depth-anything/Depth-Anything-V2-Small-hf

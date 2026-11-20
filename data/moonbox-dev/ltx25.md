# moonbox-dev/ltx25

## Resumen

LTX-2.5 for Moonbox es un paquete de pesos convertidos a MLX del modelo de generacion de video LTX-2.5 de Lightricks, preparado por moonbox-dev para su aplicacion de escritorio Moonbox en Apple silicon. No se trata de un modelo entrenado desde cero, sino de una redistribucion empaquetada del transformer de difusion destilado de 22B parametros de LTX-2.5, cuantizado a 6 bits para el transformer y a 8 bits (con variante de 4 bits) para el codificador de texto Gemma 4 12B afinado para LTX. El repositorio incluye ademas los VAE de video y audio, el vocoder, un upscaler espacial x2, una cabeza de duracion y veinte LoRAs de Lightricks que implementan las ediciones de video de la aplicacion.

El modelo resuelve generacion de video con audio a partir de texto o de un primer fotograma, con clips de 2 a 10 segundos y resoluciones de hasta HD. Su relevancia radica en que lleva un modelo de difusion de video de gran tamano a hardware de consumo Apple mediante el framework MLX y cuantizacion agresiva, algo poco habitual en esta categoria. La licencia es la LTX-2.x Community License de Lightricks, no una licencia open source estandar.

El repositorio tiene 118,6 GB y esta pensado exclusivamente como fuente de descarga para la app Moonbox: el autor indica explicitamente que no es un release oficial de los modelos originales. La fecha de creacion es el 19 de noviembre de 2026 y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (DiT) destilado, con variantes audio+video y solo video; VAE convolucional de video, VAE de audio, vocoder y upscaler espacial x2 |
| Parametros totales | 22B (transformer DiT); codificador de texto Gemma 4 12B adicional |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 6 bits (DiT, MLX), 8 bits (codificador de texto, MLX), 4 bits (variante ligera del codificador de texto) |
| Idiomas soportados | no disponible |
| Licencia | ltx-2.x-community-license (other) |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El componente principal es un transformer de difusion destilado de 22B parametros, distribuido en dos variantes: un DiT conjunto de audio y video (`dit_q6_av.safetensors`) y un DiT solo de video (`dit_q6_video.safetensors`), acompanados de un conector de embeddings. El pipeline se completa con un VAE de video de codificador y decodificador convolucionales, un VAE de audio, un vocoder, un upscaler espacial x2 v1.0 y una cabeza de duracion que controla la longitud del clip generado. La generacion condicionada por texto se realiza mediante un codificador Gemma 4 12B afinado especificamente para LTX (`gemma4-12b-with-proj-ltx-2.5`), derivado de google/gemma-4-12B.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; esos detalles corresponden al modelo original de Lightricks y no se detallan en la informacion proporcionada. La innovacion tecnica destacable de este repositorio es la conversion completa del pipeline a MLX con cuantizacion por componente (6 bits en el DiT, 8 o 4 bits en el codificador de texto), lo que permite ejecutar un modelo de 22B en memoria unificada de Apple silicon. Se incluyen ademas veinte LoRAs de Lightricks (familias LTX-2.3 y LTX-2.5) para tareas de edicion como relight, restauracion, colorizacion, reencuadre, deblur, descompresion, SDR a HDR, simulacion de agua, cinemagraph y control de movimiento lento.

## Capacidades

- Generacion de video a partir de texto (text-to-video) con audio sincronizado.
- Generacion de video a partir de un primer fotograma (image-to-video), que es el pipeline declarado del repositorio.
- Clips de 2 a 10 segundos de duracion, controlados por la cabeza de duracion incluida.
- Resoluciones de hasta HD, con upscaler espacial x2 para aumentar la resolucion final.
- Generacion de audio asociada al video mediante VAE de audio y vocoder.
- Edicion de video y de imagenes fijas mediante LoRAs: relight, restauracion, colorizacion, reencuadre, in/outpainting, deblur, descompresion, layout-to-render, refine details, SDR a HDR, alpha generation, clean plate, ingredients, water simulation, pixel spatial upscaler, cinemagraph y slow motion control.
- Estimacion de profundidad auxiliar mediante Depth-Anything-V2-Small incluido en el paquete.
- No se documentan capacidades de tool calling, function calling ni razonamiento multi-paso; no es un modelo de lenguaje conversacional.

## Casos de uso

- Generacion de clips publicitarios cortos: el modelo produce videos de 2 a 10 segundos con audio a partir de un brief de texto, adecuado para prototipos creativos y variantes de anuncio sin salir del portatil.
- Animacion de fotografias de producto: partiendo de un primer fotograma (image-to-video), se generan movimientos de camara y reflejos para fichas de e-commerce, con el upscaler x2 para alcanzar HD.
- Restauracion y mejora de metraje de archivo: las LoRAs Restore, Deblur, Decompression y SDR-To-HDR permiten limpiar y modernizar material antiguo en un flujo por lotes.
- Colorizacion de material en blanco y negro: la LoRA Colorization convierte imagenes o clips monocromos en color, util en documentales y archivos historicos.
- Previsualizacion de storyboards: la LoRA Layout-To-Render transforma bocetos de composicion en renders con movimiento, acelerando la iteracion previa al rodaje.
- Efectos de postproduccion: relight, day-to-night, clean plate e in/outpainting cubren tareas de retoque que de otro modo requeririan rotoscopia manual.
- Prototipado de videojuegos y animacion: cinemagraph y slow motion control permiten generar bucles y camaras lentas para material de presentacion.
- Flujos de trabajo locales en Apple silicon: investigadores que necesitan generar video sin enviar material a servicios en la nube pueden ejecutar el paquete en un Mac con memoria unificada suficiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El paquete esta orientado a Apple silicon mediante MLX; no se documenta soporte para CUDA ni ROCm.
- El repositorio completo ocupa 118,6 GB, por lo que se necesita espacio en disco equivalente antes de la descarga.
- El DiT de 22B en 6 bits requiere del orden de 16-17 GB solo para los pesos del transformer; sumando el codificador de texto de 12B en 8 bits (unos 12 GB) y los VAE, vocoder y upscaler, el pico de memoria es elevado. La variante de codificador de 4 bits reduce la demanda y esta pensada para equipos con menos memoria.
- No se especifican modelos de Mac concretos ni minimos oficiales; la aplicacion Moonbox selecciona la variante segun la memoria del equipo.
- Opciones de despliegue: la aplicacion Moonbox (unica via documentada); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a un modelo de difusion de video.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / duracion | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LTX-2.5 for Moonbox (este repo) | 22B DiT + Gemma 4 12B | clips de 2-10 s, hasta HD | safetensors MLX (6/8/4 bits) | LTX-2.x Community License | Hugging Face, via app Moonbox |
| Lightricks/LTX-2.5 (original) | 22B DiT + Gemma 4 12B | clips de 2-10 s, hasta HD | safetensors bf16 | LTX-2.x Community License | Hugging Face |
| Lightricks/LTX-2.3 (LoRAs incluidas) | 22B | no disponible | safetensors | LTX-2.x Community License | Hugging Face |
| Depth-Anything-V2-Small (auxiliar) | no disponible | no disponible | safetensors | no disponible | Hugging Face |

La comparativa se limita a la familia LTX porque la informacion proporcionada no incluye datos de otros generadores de video.

## Limitaciones y advertencias

- No es un release oficial de Lightricks: es una conversion no oficial a MLX empaquetada por moonbox-dev para su aplicacion; el autor lo indica explicitamente.
- La licencia LTX-2.x Community License no es open source estandar; es necesario revisar sus terminos antes de cualquier uso comercial.
- El repositorio esta pensado para ser consumido por Moonbox, que verifica cada archivo contra una lista firmada; no se documenta un flujo de uso independiente.
- Solo Apple silicon: no hay pesos GGUF ni soporte CUDA, lo que excluye GPUs NVIDIA.
- Duracion maxima de 10 segundos por clip, lo que limita escenarios que requieran tomas largas.
- El codificador de texto en 4 bits degrada la calidad respecto a la variante de 8 bits segun la propia descripcion del autor.
- Riesgo de artefactos y alucinaciones visuales inherente a los modelos de difusion de video; no se documentan evaluaciones cuantitativas.
- No se dispone de informacion sobre sesgos, idiomas soportados ni comportamiento multilingue.
- El modelo base LTX-2.5 se distribuye en bf16; la cuantizacion a 6 bits puede introducir perdida de fidelidad no medida.
- El tamano del repositorio (118,6 GB) y el pico de memoria hacen inviable su uso en equipos con poca memoria unificada.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/moonbox-dev/ltx25
- Modelo base: https://huggingface.co/Lightricks/LTX-2.5
- Licencia: https://github.com/Lightricks/LTX-2/blob/main/LICENSE-2_x
- Aplicacion Moonbox: https://moonbox.dev
- Codificador de texto base: https://huggingface.co/google/gemma-4-12B
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

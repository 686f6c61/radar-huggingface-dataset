# rkcth/MiniMax-H3-Ref2VA-Radiance-W4A8

## Resumen

MiniMax-H3-Ref2VA-Radiance-W4A8 es una conversión cuantizada del modelo MiniMax-H3 de MiniMax, empaquetada por el usuario rkcth para el runtime Radiance sobre GPUs AMD. No se trata de un modelo nuevo, sino de un checkpoint de inferencia de 53,31 GiB en formato `.rad` que incluye el denoiser convertido desde los pesos `transformer_ref/` del modelo original, junto con el codificador de texto/visión, los códecs de vídeo y los componentes de audio. La tarea declarada es image-text-to-video con referencias de sujeto (Ref2VA), es decir, generar vídeo con audio sincronizado a partir de imágenes de referencia y un prompt textual.

La relevancia de este paquete es acotada pero concreta: permite ejecutar un modelo de generación de vídeo con audio sobre hardware AMD (Radeon AI PRO R9700) mediante el fork Radiance, un camino poco habitual en un ecosistema dominado por CUDA. La cuantización W4A8 aplica pesos de 4 bits con rotación de Hadamard e activaciones INT8 en las cuatro proyecciones principales del denoiser, mientras que el resto de tensores usan INT8, BF16 o FP32 según la receta de conversión incluida.

No se dispone de información sobre el número de parámetros del modelo base, la longitud de contexto del codificador de texto ni los idiomas soportados. La model card se centra en el procedimiento de despliegue, la validación funcional y las restricciones de licencia, no en las características arquitectónicas del modelo original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (denoiser transformer del modelo base MiniMax-H3; pipeline image-text-to-video con codificador de texto/visión, códecs de vídeo y componentes de audio) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (el presupuesto de procesamiento es compartido entre prompt, duración del clip y referencias) |
| Tipos de cuantización | W4A8 (pesos 4 bits con rotación de Hadamard, activaciones INT8) en las cuatro proyecciones principales del denoiser; INT8, BF16 o FP32 en el resto según receta |
| Idiomas soportados | no disponible |
| Licencia | MiniMax H3 Community License Agreement (pesos); Apache 2.0 para componentes del codificador Qwen |
| Formato de pesos | `.rad` (checkpoint Radiance, 53,31 GiB) |
| Tamaño del repositorio | 57,2 GB |
| Resolución de salida | múltiplos de 32, mínimo 256 por dimensión, ratio máximo 4:1; área máxima configurable hasta 1.032.192 píxeles (ejemplo validado: 864×480 = 414.720 píxeles) |
| Vídeo de salida | MP4 con audio estéreo sincronizado a 32 kHz; 24 fps; 5 s = 124 frames |
| Referencias de imagen | hasta 9 imágenes de referencia (sujeto al presupuesto de filas) |
| Pasos de denoising | 50 puntos de rejilla, 49 evaluaciones del denoiser por defecto |
| Revisión del modelo base | MiniMaxAI/MiniMax-H3 en `42ed227ee7df40d41602854ae760620d6eb651fe` |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo MiniMax-H3 original ni su proceso de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO). Lo que sí se documenta es la cadena de conversión: el denoiser se deriva de los pesos `transformer_ref/` del checkpoint upstream fijado en la revisión `42ed227ee7df40d41602854ae760620d6eb651fe`, y se transforma a un formato Radiance que combina cuantización de 4 bits con rotación de Hadamard en las cuatro proyecciones principales, activaciones INT8 y precisión mixta (INT8/BF16/FP32) en el resto de tensores. Las LoRA se mantienen como adaptadores separados y no se fusionan en estos pesos.

El pipeline completo integra un codificador de texto/visión (con componentes Qwen bajo Apache 2.0), códecs de vídeo y componentes de audio, de modo que la generación produce MP4 con pista estéreo sincronizada a 32 kHz. La ruta Ref2VA acepta hasta nueve imágenes de referencia y existe una ruta separada de vídeo de referencia con codificación a resolución reducida; el comportamiento de guiado por vídeo a resolución completa y alineado temporalmente para intercambio de personajes queda declarado como inacabado.

## Capacidades

- Generación de vídeo a partir de texto e imágenes de referencia (task `ref2va`), con animación de un sujeto proporcionado en las imágenes de entrada.
- Generación de audio sincronizado con el vídeo, en estéreo a 32 kHz, incluido en el MP4 de salida.
- Aceptación de hasta nueve imágenes de referencia para condicionar la identidad del sujeto.
- Ruta de vídeo de referencia con codificación a resolución reducida (compatibilidad completa con guiado por vídeo no validada).
- Control de resolución de salida (múltiplos de 32, mínimo 256, ratio máximo 4:1) y de duración del clip.
- Reproducibilidad determinista con semilla: la reproducción en caliente con la misma semilla produjo bytes MP4 idénticos en la prueba del autor.
- Cliente auxiliar `krea2_to_h3.py` para animar una imagen Krea guardada o solicitar primero una imagen Krea.
- API HTTP compatible con `/v1/videos` para envío de trabajos, sondeo de estado y descarga del contenido.
- No se documentan capacidades de tool calling, razonamiento multi-paso ni soporte multilingüe explícito.

## Casos de uso

- Prototipado de vídeo generativo sobre hardware AMD: el paquete está pensado para ejecutarse en GPUs Radeon AI PRO R9700 con ROCm mediante el fork Radiance, lo que permite evaluar generación de vídeo con audio en entornos sin CUDA.
- Generación de clips cortos para redes sociales: con 5 segundos a 24 fps (124 frames) y resolución 864×480, el modelo produce piezas breves con audio sincronizado listas para revisión o publicación tras control de calidad.
- Animación de personajes a partir de una imagen de referencia: usando `ref_image_1` y un prompt que describa la acción, se puede dar movimiento a un sujeto estático manteniendo su identidad visual en el clip.
- Creación de material de previsualización en estudios de animación: clips de baja resolución y corta duración para validar encuadres, movimiento y ritmo antes de producir en alta calidad.
- Generación de vídeo con audio para demostraciones de producto: el audio integrado a 32 kHz evita un paso posterior de sincronización en clips promocionales cortos.
- Investigación en cuantización de modelos de vídeo: el checkpoint permite comparar la calidad W4A8 frente a BF16 en una tarea generativa multimodal, aunque el propio autor advierte que las comparaciones amplias de calidad aún son limitadas.
- Integración en pipelines automatizados vía API: el flujo POST/GET/descarga sobre `/v1/videos` facilita encadenar generación, revisión y entrega en herramientas internas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta validaciones funcionales: generación con referencia de imagen a 864×480 probada en dos Radeon AI PRO R9700 con aproximadamente 184 GiB de RAM de host, y reproducción determinista con semilla (bytes MP4 idénticos). No se proporcionan métricas de calidad (FVD, CLIP score, etc.) ni comparaciones cuantitativas frente a BF16.

## Requisitos de hardware

- VRAM: el checkpoint ocupa 53,31 GiB; la configuración de ejemplo usa `tp: 2` (tensor parallelism sobre dos GPUs) con el vision tower colocado en RAM (`vision-tower-placement: ram`).
- GPUs validadas: dos AMD Radeon AI PRO R9700 de 32 GiB cada una, compartiendo las tarjetas con Qwen Flash Next.
- RAM de host: aproximadamente 184 GiB en la configuración probada; configuraciones con menos memoria de host y operación con una sola tarjeta no han sido cualificadas para este paquete.
- Software: fork Radiance en el commit `da0b36f1d2417f1b7527b681d0a6873e826b7026` con el parche `radiance-h3-support.patch` aplicado, compilado para ROCm con `-DRAD_WITH_FFMPEG=ON`.
- No se documenta compatibilidad con CUDA, vLLM, llama.cpp, Ollama ni TGI; el despliegue es específico del runtime Radiance.
- Latencia y throughput: no disponibles. La model card advierte de que la carga en frío del modelo y la admisión en cola pueden retrasar la respuesta inicial al POST, y que el offload en reposo de H3 puede tardar decenas de segundos con recuperación gradual del throughput de texto.
- Presupuesto de tokens: `max-num-batched-tokens: 27000` en la configuración de ejemplo.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos de generación de vídeo con audio que permitan una comparación rigurosa. Como referencia estructural, el propio modelo base MiniMaxAI/MiniMax-H3 en BF16 sería el punto de comparación natural para evaluar el impacto de la cuantización W4A8, pero no se aportan métricas de esa comparación.

## Limitaciones y advertencias

- La licencia MiniMax H3 Community License restringe territorios, uso y redistribución, con exclusiones explícitas para la UE, Reino Unido, Corea del Sur y Estados Unidos salvo permiso separado. Es imprescindible leer `LICENSE` y la Acceptable Use Policy antes de descargar o usar el checkpoint.
- El paquete está atado a un runtime concreto (fork Radiance en un commit fijo más un parche), lo que dificulta su mantenimiento y actualización.
- Las comparaciones amplias de calidad de la cuantización frente a BF16 son limitadas según el propio autor; no hay garantía de que W4A8 preserve la fidelidad del modelo original.
- El comportamiento completo de guiado por vídeo para intercambio de personajes, a resolución completa y alineado temporalmente, está declarado como inacabado; la validación realizada no establece compatibilidad completa.
- El paging de memoria de host puede retrasar la generación de texto durante el cambio de modelo y la recuperación tras un clip.
- Solo se ha cualificado la operación con dos GPUs y ~184 GiB de RAM de host; una sola tarjeta o menos memoria no están validadas.
- No se documentan sesgos conocidos, riesgos de alucinación específicos ni soporte de idiomas; al ser un modelo generativo de vídeo, existe riesgo de producir contenido visual o sonoro inexacto o no fiel al prompt.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin adopción comunitaria que permita contrastar la calidad de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rkcth/MiniMax-H3-Ref2VA-Radiance-W4A8
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Checkpoint original fijado: https://huggingface.co/MiniMaxAI/MiniMax-H3/tree/42ed227ee7df40d41602854ae760620d6eb651fe
- Fork Radiance: https://github.com/rkcth/radiance
- Licencia MiniMax H3 Community License: incluida como `LICENSE` en el repositorio
- Licencia Apache 2.0 de componentes Qwen: incluida como `LICENSE-Qwen-encoder` en el repositorio

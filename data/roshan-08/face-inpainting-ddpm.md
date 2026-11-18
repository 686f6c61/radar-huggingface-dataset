# roshan-08/face-inpainting-ddpm

## Resumen

Face inpainting DDPM es un ajuste fino (fine-tune) del modelo de difusión `google/ddpm-ema-celebahq-256`, especializado en rellenar huecos en fotografías de rostros de 256×256 píxeles. Lo desarrolla Roshan Kumar Singh (usuario `roshan-08` en Hugging Face) y su objetivo es demostrar, con un caso acotado, cómo adaptar un DDPM preentrenado para una tarea condicionada por máscara sin reentrenar desde cero. El modelo hereda la arquitectura UNet2D de la familia DDPM de Google y amplía la capa de entrada de 3 a 7 canales para aceptar la imagen latente, la foto enmascarada y la máscara.

La relevancia es fundamentalmente didáctica y de investigación: la model card incluye el recetario de entrenamiento, el código de muestreo y métricas de hueco sobre caras de validación de CelebA-HQ. No es un modelo de propósito general ni compite con soluciones de inpainting modernas como Stable Diffusion Inpainting o LaMa; su alcance está limitado a rostros alineados y frontales con agujeros rectangulares o irregulares de tamaño moderado.

El repositorio pesa 0,2 GB y contiene únicamente los pesos del UNet en fp16 (113.677.827 parámetros), sin EMA ni estado del optimizador. No se publican idiomas soportados porque la tarea es puramente visual y la model card no declara capacidades lingüísticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNet2D de difusión (DDPM), condicionada por máscara, `in_channels=7` |
| Parametros totales | 113.677.827 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen, resolución 256×256) |
| Tipos de cuantizacion | no disponible (pesos publicados en fp16; el autor no documenta cuantizaciones adicionales) |
| Idiomas soportados | no disponible (modelo de imagen, sin capacidades lingüísticas) |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | safetensors (`model.safetensors`, fp16) + `unet_config.json` |

## Arquitectura y entrenamiento

El modelo parte de `google/ddpm-ema-celebahq-256`, un DDPM con UNet2D que opera en el espacio de píxeles a 256×256 y un schedule de ruido de 1.000 pasos. El ajuste fino modifica la primera convolución del UNet para aceptar 7 canales en lugar de 3: `[x_t (3) | foto·máscara (3) | máscara (1)]`, donde la máscara vale 1 en píxeles conocidos y 0 en el hueco. Se realizaron 6.000 pasos de fine-tuning condicionado por máscara sobre 28.000 imágenes de entrenamiento de CelebA-HQ (dataset `korexyz/celeba-hq-256x256`). No se incluye copia EMA ni estado del optimizador en el repositorio.

El muestreo se realiza con reemplazo por paso de los píxeles conocidos (per-step known-pixel replacement), tal como implementa `face_inpainting.sampling.inpaint` en el repositorio de GitHub. El schedule de ruido se lee del modelo base. No se documenta uso de RLHF, DPO ni decodificación especulativa; es un fine-tune supervisado estándar de difusión.

## Capacidades

- Relleno de huecos (inpainting) en rostros de 256×256 alineados y frontales, con máscaras rectangulares o irregulares.
- Condicionamiento explícito por máscara binaria en la entrada del UNet.
- Muestreo DDPM completo de 1.000 pasos con reemplazo de píxeles conocidos en cada paso.
- Integración con la librería `diffusers` (pipeline `image-to-image`).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (modelo puramente visual).
- No dispone de modo thinking, visión general, audio ni otras modalidades.

## Casos de uso

- Investigación educativa sobre inpainting con difusión: sirve como ejemplo reproducible de cómo adaptar un DDPM preentrenado a una tarea condicionada por máscara, con recetario y código públicos.
- Restauración de retratos con oclusiones pequeñas: rellenar gafas de sol, manos o marcas en fotos de caras alineadas de 256×256, siempre que el hueco no supere aproximadamente el 15-20 % de la imagen.
- Preprocesado en pipelines de reconocimiento facial: completar regiones ocluidas antes de pasar la imagen a un modelo de verificación o identificación, aunque con la advertencia de que los resultados en huecos grandes no son fieles a la identidad.
- Generación de datos sintéticos controlados: crear variaciones de caras con regiones rellenadas para aumentar datasets de investigación en visión por computador.
- Docencia y demostraciones de difusión: ilustrar el funcionamiento de un DDPM y del condicionamiento por máscara en cursos o talleres, dado el bajo coste computacional del modelo.
- Pruebas de concepto de edición facial: experimentar con máscaras rectangulares e irregulares para evaluar límites del modelo antes de migrar a soluciones de mayor calidad.
- Benchmark interno de inpainting: usar las métricas de hueco (PSNR y L1) como línea base para comparar con otros métodos en el mismo conjunto de validación.

## Benchmarks y rendimiento

Métricas de hueco publicadas por el autor sobre las primeras 8 caras de validación de CelebA-HQ (no usadas en fine-tuning), semilla 0:

| Máscara | Hole PSNR | Hole L1 |
|---|---:|---:|
| Caja central, 96×96 (14 %) | 19,10 dB | 0,074 |
| Irregular, 2-5 rectángulos (17 %) | 18,06 dB | 0,082 |
| Mitad izquierda ausente (50 %) | 11,60 dB | 0,219 |

El autor advierte de que el modelo base se entrenó con todo CelebA-HQ, incluidas las caras de validación usadas en la evaluación, por lo que estas cifras pueden ser algo optimistas. No se publican comparaciones con otros modelos de inpainting.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 4 GB en fp16, dado que el UNet tiene 113,7 M de parámetros y opera a 256×256; el muestreo completo de 1.000 pasos no requiere memoria adicional significativa.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; se recomienda una CUDA GPU por la latencia del muestreo de 1.000 pasos.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 o superiores.
- Opciones de despliegue: scripts del repositorio de GitHub (`scripts/inpaint.py`), integración con `diffusers`; no se documentan soportes para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de imagen).
- Latencia y throughput: no disponibles; el autor solo indica que se recomienda GPU CUDA por los 1.000 pasos de denoising.

## Comparativa con modelos similares

| Modelo | Parámetros | Resolución | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| face-inpainting-ddpm (este) | 113,7 M | 256×256 | Inpainting facial condicionado por máscara | Apache-2.0 (pesos), datos CelebA no comerciales | Hugging Face + GitHub |
| google/ddpm-ema-celebahq-256 (base) | no disponible en la información | 256×256 | Generación incondicional de caras | Apache-2.0 | Hugging Face |
| Stable Diffusion Inpainting | no disponible en la información | 512×512 | Inpainting general texto-imagen | no disponible en la información | Hugging Face |
| LaMa | no disponible en la información | variable | Inpainting general de imágenes | no disponible en la información | Repositorio público |

La comparación se limita a categorías y tareas; no se dispone de datos de benchmarks cruzados en la información proporcionada.

## Limitaciones y advertencias

- Solo funciona con rostros alineados y frontales similares a CelebA-HQ; caras pequeñas o descentradas en fotos amplias producen resultados emborronados.
- Entrenado únicamente con huecos rectangulares; los huecos grandes generan una cara plausible pero no necesariamente la persona original (PSNR de 11,60 dB con el 50 % de la imagen ausente).
- El modelo base se entrenó con todo CelebA-HQ, incluidas las caras de validación usadas en las métricas, por lo que los resultados publicados pueden ser optimistas.
- Los datos de entrenamiento (CelebA) están liberados solo para investigación no comercial; aunque los pesos son Apache-2.0, el uso comercial debe respetar esa restricción sobre los datos.
- Riesgo de alucinación visual: el modelo inventa contenido plausible en el hueco, no recupera la información real.
- No debe usarse para engañar a personas ni para alterar fotos de personas reales sin su consentimiento, según indica el autor.
- No dispone de soporte multilingüe, tool calling, agentes ni otras capacidades propias de modelos de lenguaje.
- No se documentan sesgos específicos más allá de los inherentes al dataset CelebA-HQ.

## Enlaces

- Hugging Face: https://huggingface.co/roshan-08/face-inpainting-ddpm
- Modelo base: https://huggingface.co/google/ddpm-ema-celebahq-256
- Repositorio de código y recetario: https://github.com/roshan-008/face-inpainting-ddpm
- Dataset de fine-tuning: https://huggingface.co/datasets/korexyz/celeba-hq-256x256

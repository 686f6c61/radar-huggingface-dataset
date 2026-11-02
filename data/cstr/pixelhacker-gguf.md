# cstr/PixelHacker-GGUF

## Resumen

PixelHacker-GGUF es una conversión al formato GGUF del modelo de inpainting de imágenes PixelHacker, desarrollado originalmente por el grupo hustvl (Huazhong University of Science and Technology, Vision and Learning Lab). El modelo resuelve la tarea de eliminación y reconstrucción de regiones enmascaradas de una imagen (image inpainting), es decir, rellenar de forma coherente los huecos indicados por una máscara. La relevancia de esta publicación concreta no está en el modelo en sí, sino en que ofrece los pesos en formato GGUF con distintos niveles de cuantización, pensados para ejecutarse en el motor nativo de inpainting de CrispEmbed.

El repositorio lo publica el usuario cstr y contiene cuatro variantes (F32, F16, Q8_0 y Q4_K), todas copias exactas de ficheros ya cualificados, sin recuantización adicional. El modelo tiene 862.251.708 parámetros según los safetensors de referencia y el repositorio ocupa 6,6 GB en total. La arquitectura subyacente es un modelo de difusión latente (diffusion_pytorch_model.bin) entrenado sobre Places2 y que requiere un VAE complementario (SDXL-VAE) para operar en el espacio latente.

La publicación es explícitamente experimental: los ficheros solo funcionan dentro del motor de inpainting de CrispEmbed y detrás de flags desactivados por defecto (`CRISPEMBED_PIXELHACKER=1` y, para cuantizaciones no F32, `CRISPEMBED_INPAINT_QUANT=1`). No es un modelo de propósito general ni se puede cargar con librerías estándar como transformers o llama.cpp.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de difusión latente (diffusion_pytorch_model) para inpainting; requiere VAE SDXL complementario |
| Parámetros totales | 862.251.708 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen, no de texto) |
| Tipos de cuantización | F32, F16, Q8_0, Q4_K |
| Idiomas soportados | no disponible (modelo de imagen) |
| Licencia | MIT (pesos); código upstream Apache-2.0; flash-linear-attention MIT |
| Formato de pesos | GGUF (variantes f32, f16, q8_0, q4_k) |

## Arquitectura y entrenamiento

PixelHacker es un modelo de difusión latente especializado en inpainting. El checkpoint original (`ft_places2/diffusion_pytorch_model.bin`, sha256 `ef5e28199cd03344ac22a6e6ff456ba8b868e83fb90d8174cc2ad83d7ef4296c`) fue entrenado sobre Places2, un dataset de escenas naturales a gran escala. El modelo opera en el espacio latente de un VAE SDXL, por lo que necesita el VAE complementario (publicado aparte en `cstr/SDXL-VAE-inpaint-GGUF`) emparejado al mismo nivel de precisión que el UNet de inpainting. La información disponible no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO (poco habituales en modelos de difusión de imagen).

La innovación técnica relevante en este repositorio es el proceso de conversión y cuantización: el script `models/convert-latent-inpaint-to-gguf.py` transforma el checkpoint PyTorch a GGUF y el cuantizador `crispembed-quantize` (política `inpaint-v1`) genera las variantes F16, Q8_0 y Q4_K. El autor documenta barreras de aceptación basadas en la similitud coseno de la salida final respecto al modelo PyTorch original (panel sintético) o respecto a F32 nativo (fotos reales): F32 > 0,99, F16 > 0,98, Q8_0 > 0,97, Q4_K > 0,94. Los ports nativos estudian además flash-linear-attention (MIT).

## Capacidades

- Inpainting de imágenes: reconstrucción de regiones enmascaradas de forma coherente con el contexto visual.
- Eliminación de objetos: rellenar el hueco dejado al borrar un objeto de una fotografía.
- Operación en espacio latente SDXL: requiere emparejamiento con el VAE SDXL correspondiente (F32 con F32, F16 con F16, etc.).
- Cuantización con degradación controlada: Q8_0 mantiene coseno mínimo de 0,9859; Q4_K de 0,9425 (borderline en fotos).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual de inpainting.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Retoque fotográfico automatizado: eliminar objetos no deseados de una foto proporcionando una máscara; el modelo rellena la región con contenido coherente usando el contexto latente SDXL.
- Restauración de imágenes dañadas: reconstruir zonas con arañazos, marcas de agua o elementos corruptos en digitalizaciones, indicando las regiones afectadas mediante máscara.
- Limpieza de datasets visuales: eliminar logos, marcas de agua o texto superpuesto de imágenes de entrenamiento antes de reutilizarlas en pipelines de visión por computador.
- Edición de producto en e-commerce: borrar fondos no deseados o elementos distractores en fotos de catálogo manteniendo la coherencia de la escena.
- Preprocesado en pipelines de generación aumentada: rellenar huecos en imágenes antes de pasarlas a un modelo de captioning o de detección, reduciendo artefactos que confundan al siguiente modelo.
- Investigación en cuantización de modelos de difusión: las variantes Q8_0 y Q4_K con métricas de coseno documentadas sirven para estudiar el impacto de la cuantización en tareas de inpainting en entornos con VRAM limitada.
- Prototipado dentro de CrispEmbed: validar el motor nativo de inpainting con flags experimentales antes de integrarlo en un producto, usando F32 como referencia de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (PSNR, SSIM, FID, LPIPS) en la información disponible. El autor sí documenta métricas internas de fidelidad respecto al modelo original:

| Variante | Fichero | Bytes | Coseno mínimo | Barrera | Notas |
|---|---|---|---|---|---|
| F32 | `pixelhacker-f32.gguf` | 3.449.075.872 | 1,0 | 0,99 | emparejar con SDXL-VAE F32 |
| F16 | `pixelhacker-f16.gguf` | 1.725.648.672 | 0,999999 | 0,98 | solo panel sintético; sin ejecución F16 en fotos |
| Q8_0 | `pixelhacker-q8_0.gguf` | 917.886.464 | 0,9859 | 0,97 | emparejar con SDXL-VAE Q8_0 |
| Q4_K | `pixelhacker-q4_k.gguf` | 487.079.936 | 0,9425 | 0,94 | borderline: 0,9425 en fotos; emparejar con SDXL-VAE Q4_K |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Como referencia, el fichero F32 ocupa 3,45 GB y el Q4_K 487 MB; a ello hay que sumar el VAE SDXL complementario y las activaciones del motor de difusión.
- GPU recomendadas: no disponible. Por tamaño, el F32 debería caber en GPUs consumer con 8-12 GB de VRAM, pero el autor no lo confirma.
- ¿Cabe en GPU consumer? Probablemente sí en el caso de Q8_0 y Q4_K, pero no hay confirmación oficial en la información proporcionada.
- Opciones de despliegue: exclusivamente el motor nativo de inpainting de CrispEmbed, con las flags `CRISPEMBED_PIXELHACKER=1` y `CRISPEMBED_INPAINT_QUANT=1` (para F16/Q8_0/Q4_K). No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| PixelHacker-GGUF (este) | 862 M | no aplica | Inpainting | MIT (pesos) / Apache-2.0 (código) | GGUF | Solo CrispEmbed |
| PixelHacker original (hustvl) | 862 M | no aplica | Inpainting | MIT (pesos) / Apache-2.0 (código) | PyTorch (.bin) | HuggingFace, uso general |
| Stable Diffusion Inpainting (SD 1.5/2.x) | ~860 M (UNet) | no aplica | Inpainting | CreativeML OpenRAIL-M | safetensors, ckpt | Amplia (diffusers, A1111, ComfyUI) |
| LaMa | ~51 M | no aplica | Inpainting | Apache-2.0 | PyTorch | Amplia (librerías de inpainting) |

La comparativa se limita a los datos disponibles. PixelHacker original es la referencia directa; SD Inpainting y LaMa son alternativas de la misma categoría, pero no se dispone de comparaciones de rendimiento publicadas en la información proporcionada.

## Limitaciones y advertencias

- Estado experimental: los ficheros solo se ejecutan en CrispEmbed con flags desactivadas por defecto; no son utilizables en otros entornos sin adaptación.
- Dependencia del VAE SDXL: es obligatorio emparejar cada variante con el VAE del mismo nivel de precisión (`cstr/SDXL-VAE-inpaint-GGUF`); un emparejamiento incorrecto degrada la calidad.
- Q4_K es borderline: el coseno mínimo de 0,9425 en fotos está muy cerca de la barrera de 0,94, por lo que en producción conviene usar Q8_0 o superior.
- F16 no se ha validado en fotos reales, solo en panel sintético; su comportamiento en imágenes reales es incierto.
- Riesgo de alucinación visual: como todo modelo generativo de inpainting, puede inventar contenido plausible pero incorrecto en la región enmascarada.
- Sesgos: no documentados en la información disponible; al entrenarse sobre Places2, puede estar sesgado hacia escenas naturales y tener dificultades con dominios muy distintos (texto, ilustración, médico).
- Sin soporte de texto, tool calling ni agentes: no es un modelo de lenguaje.
- Licencia MIT para los pesos, pero el código upstream es Apache-2.0; revisar los ficheros `licenses/` del repositorio antes de uso comercial.
- Sin datos de benchmarks estándar de calidad de imagen (PSNR, SSIM, FID, LPIPS), lo que dificulta comparar con alternativas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/cstr/PixelHacker-GGUF
- VAE complementario: https://huggingface.co/cstr/SDXL-VAE-inpaint-GGUF
- Código upstream PixelHacker: https://github.com/hustvl/PixelHacker/tree/f5567db2871598aa178fe7a34c520dd478a0b41b
- Pesos originales: https://huggingface.co/hustvl/PixelHacker/resolve/012fd343158936a265b8a0ee38a791a7a2841f45/ft_places2/diffusion_pytorch_model.bin
- Documentación de CrispEmbed: `docs/inpainting-cli.md` y `docs/inpainting-precision.md` (no se proporciona URL pública)
- flash-linear-attention: no se proporciona URL en la información disponible

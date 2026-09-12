# OzzyGT/taew2_1

## Resumen

TAEW 2.1 es un autoencoder minúsculo (tiny autoencoder, TAE) diseñado específicamente para el espacio latente de Wan 2.1. No es un modelo generativo ni un modelo de lenguaje: es un decodificador que transforma un tensor de latentes en imágenes o fotogramas. Cuenta con 11,3 millones de parámetros en fp16 (fichero de 22.642.902 bytes, 128 tensores) y su razon del ser es abaratar la previsualización: decodifica un latente a imagen aproximadamente cincuenta veces más barato en cómputo que el VAE completo de Wan 2.1, lo que hace asequible mostrar una previsualización en cada paso del proceso de denoising.

El repositorio `OzzyGT/taew2_1` es un espejo sin modificar del fichero `taew2_1.safetensors` publicado por Ollin Boer Bohan en el repositorio de GitHub `madebyollin/taehv`. El autor del espejo lo aloja en HuggingFace porque el proyecto original distribuye estos pesos a través de GitHub; el contenido es idéntico byte a byte, sin conversión, cuantización ni reentrenamiento.

Su relevancia práctica viene de que los espacios latentes de Krea 2 y Qwen-Image coinciden exactamente con el de Wan 2.1, por lo que este decodificador también sirve para previsualizar sus latentes. De hecho, el repositorio `OzzyGT/krea2_preview_blocks` lo descarga en tiempo de ejecución para mostrar la predicción de Krea 2 mientras el proceso de denoising avanza.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Autoencoder minúsculo (TAE) para el espacio latente de Wan 2.1; decodificador convolucional con factor de escala espacial 8x |
| Parámetros totales | 11,3 millones |
| Longitud de contexto | no aplica (no es un modelo autorregresivo ni de lenguaje) |
| Tipos de cuantización | no disponible; los pesos del repositorio están en fp16 |
| Idiomas soportados | no aplica (no procesa texto) |
| Licencia | MIT, (c) 2025 Ollin Boer Bohan |
| Formato de pesos | safetensors (fp16, 128 tensores, 22.642.902 bytes) |
| Otros datos | sha256 `04766eac0221b5390b985ae3fdcca652cbb4b1e8b82b28ea7ff89dfad1b1a93f`; pipeline de HuggingFace no disponible; 0 descargas y 0 likes en el momento de la consulta |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de que se trata de un tiny autoencoder del proyecto TAEHV, orientado al espacio latente de Wan 2.1. Lo documentado es su interfaz funcional: `decode_video` acepta latentes normalizados con forma `(N, T, C, H, W)` y devuelve fotogramas con forma `(N, T, 3, H*8, W*8)` en el rango `[0, 1]`, es decir, aplica un factor de sobremuestreo espacial de 8x y produce tres canales RGB. El uso indicado es `TAEHV(hf_hub_download("OzzyGT/taew2_1", "taew2_1.safetensors"), arch_name="taew2_1").cuda().eval()`, importando `taehv.py` desde el repositorio original; es obligatorio pasar `arch_name` de forma explícita porque la versión upstream infiere la arquitectura a partir del nombre del fichero del checkpoint, y en este espejo dicho nombre es una ruta de caché.

No se dispone de datos sobre el conjunto de entrenamiento, el número de tokens o muestras, ni sobre si hubo fases de ajuste como RLHF o DPO; este tipo de decodificadores se entrena típicamente por destilación desde el VAE completo correspondiente, pero ese extremo no se confirma en la información proporcionada. Lo que sí está documentado es la procedencia exacta: los pesos provienen de `safetensors/taew2_1.safetensors` en el commit `0ad83bb8fdc48e9e94138704e939d500a3b43660` del repositorio `madebyollin/taehv`, y el fichero alojado en el Hub es idéntico byte a byte al original, sin ninguna transformación.

## Capacidades

- Decodificación de latentes a imagen o vídeo: convierte latentes normalizados del espacio de Wan 2.1 en fotogramas RGB en el rango `[0, 1]` con un factor de escala espacial de 8x.
- Decodificación de vídeo por lotes y por secuencia temporal: la firma `decode_video` trabaja con tensores de cinco dimensiones `(N, T, C, H, W)` y devuelve `(N, T, 3, H*8, W*8)`.
- Previsualización de bajo coste: decodifica aproximadamente cincuenta veces más barato que el VAE completo, lo que permite mostrar una imagen por cada paso de denoising.
- Compatibilidad con espacios latentes equivalentes: funciona sobre latentes de Wan 2.1, Krea 2 y Qwen-Image, ya que comparten el mismo espacio latente.
- No soporta generación de texto, razonamiento, código, matemáticas ni visión de entrada (no es un modelo multimodal).
- No soporta tool calling, function calling ni flujos de agentes.
- No tiene capacidades multilingües: no procesa lenguaje natural.
- No incluye modo de razonamiento ni capacidades de audio.

## Casos de uso

- Previsualización por paso en pipelines de generación de vídeo con Wan 2.1: integrar el decodificador en el bucle de denoising para obtener un fotograma aproximado tras cada paso, con un coste de cómputo unas cincuenta veces menor que decodificar con el VAE completo.
- Previsualización en interfaces interactivas de Krea 2 y Qwen-Image: al compartir espacio latente, permite mostrar al usuario cómo evoluciona la generación sin esperar a la decodificación final.
- Dependencia de runtime para `krea2_preview_blocks`: este repositorio descarga `taew2_1.safetensors` en tiempo de ejecución, de modo que el espejo actúa como origen estable de los pesos en el Hub.
- Inspección de latentes durante el ajuste fino: al entrenar LoRA o adaptadores sobre Wan 2.1 resulta útil decodificar latentes intermedios para comprobar que el modelo no está divergiendo, con un coste de memoria y tiempo muy reducido.
- Generación de hojas de contacto de pasos intermedios: crear una parrilla de imágenes a partir de los latentes guardados en distintos pasos `t` para analizar la trayectoria de muestreo o comparar schedulers.
- Prototipado en hardware limitado: con 11,3 millones de parámetros en fp16 (unos 22,6 MB de pesos), el decodificador puede ejecutarse en GPU de gama baja o incluso en CPU, algo inviable con el VAE completo.
- Reducción de coste en servicios de generación a escala: en granjas de inferencia que ofrecen previsualizaciones en vivo, sustituir el VAE por este decodificador reduce de forma directa el cómputo por petición.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los únicos datos cuantitativos documentados son el tamaño del modelo (11,3 millones de parámetros), el tamaño del fichero de pesos (22.642.902 bytes), el número de tensores (128), la precisión (fp16) y la afirmación del autor de que la decodificación es aproximadamente cincuenta veces más barata que la del VAE completo. No se especifican métricas de fidelidad como PSNR, SSIM o LPIPS frente al VAE completo, ni latencias absolutas medidas.

## Requisitos de hardware

- VRAM estimada para los pesos: en torno a 22,6 MB en fp16, una cifra despreciable frente a cualquier VAE completo.
- VRAM adicional: depende del tamaño del tensor de latentes de entrada y del lote; no se dispone de cifras concretas.
- GPU recomendadas: cualquier GPU con soporte CUDA, incluidas las de gama de entrada; el ejemplo de la model card usa `.cuda().eval()`, pero el modelo es lo bastante pequeño como para ejecutarse en CPU.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU de consumo actuales e incluso en iGPU y CPU, dado el tamaño del modelo.
- Opciones de despliegue: PyTorch con el módulo `taehv.py` del repositorio `madebyollin/taehv`; no es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no se trata de un modelo de lenguaje.
- Latencia y throughput: no disponibles. La única referencia es la comparación cualitativa de ~50x menos coste frente al VAE completo.

## Comparativa con modelos similares

| Modelo | Parámetros | Función | Coste de decodificación | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TAEW 2.1 (`OzzyGT/taew2_1`) | 11,3 M | Decodificar latentes de Wan 2.1 (y de Krea 2 / Qwen-Image) a imagen o vídeo | ~50x más barato que el VAE completo | MIT | Espejo en HuggingFace; original en GitHub `madebyollin/taehv` |
| VAE completo de Wan 2.1 | no disponible | Decodificación de referencia del mismo espacio latente | Referencia (1x) | no disponible | Pesos oficiales del modelo Wan 2.1 |
| Decodificadores TAE/TAESD del mismo autor para otros espacios latentes | no disponible | Decodificación rápida en su espacio latente correspondiente (SD, SDXL, Flux, etc.) | no disponible | MIT (según el proyecto upstream) | Repositorio `madebyollin/taehv` y proyectos relacionados |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo ni de lenguaje: no puede generar texto, razonar, ejecutar código ni atender instrucciones; cualquier expectativa en ese sentido es errónea.
- Está pensado para previsualización: la información disponible no documenta su fidelidad frente al VAE completo, por lo que no debe asumirse que sustituya a este para la salida final de un pipeline.
- Dependencia externa: el repositorio no incluye `taehv.py`; es necesario obtenerlo del repositorio upstream, lo que introduce una dependencia de código ajena al Hub.
- Requisito de API: hay que pasar `arch_name="taew2_1"` explícitamente, ya que la detección automática de arquitectura del upstream falla al inferir desde una ruta de caché.
- Licencia MIT: permite uso comercial y modificación, pero obliga a conservar el aviso de copyright original, atribuido a Ollin Boer Bohan (2025). El repositorio incluye el fichero `LICENSE` upstream sin cambios.
- Riesgo de confusión con modelos generativos: al compartir etiquetas con el ecosistema Wan/Krea, puede descargarse por error esperando un modelo de difusión completo.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin validación por parte de la comunidad; el tamaño del repo se reporta como 0.0 GB.
- La búsqueda web realizada no arrojó documentación técnica adicional ni resultados de evaluación; los resultados obtenidos no guardaban relación con el modelo.
- Cualquier corrección o incidencia debería reportarse al proyecto upstream, dado que este espejo no modifica el fichero original.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/OzzyGT/taew2_1
- Repositorio upstream en GitHub: https://github.com/madebyollin/taehv
- Fichero de pesos original: https://github.com/madebyollin/taehv/blob/main/safetensors/taew2_1.safetensors
- Commit de procedencia: https://github.com/madebyollin/taehv/commit/0ad83bb8fdc48e9e94138704e939d500a3b43660
- Repositorio consumidor de este espejo: https://huggingface.co/OzzyGT/krea2_preview_blocks

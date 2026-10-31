# IvmeLabs/Ivme-Denoise-v1

## Resumen

İvme-Denoise-v1 (nombre en clave "Margay 1") es un modelo de eliminación de ruido en imágenes ciego (blind denoiser) desarrollado por IvmeLabs, primera release de visión de la serie İvme, una familia de modelos deliberadamente diminutos diseñados para rendir por encima de su tamaño. Con solo 2.971.342 parámetros (unos 12 MB en safetensors fp32), el autor afirma que supera a DnCNN en todos los benchmarks estándar usando un 35 % menos de FLOPs, y se queda a entre 0,22 y 0,54 dB de DRUNet y Restormer empleando un 38 % de su cómputo y un 9–11 % de sus parámetros.

La innovación central no es una arquitectura ajustada, sino derivada: cada no-linealidad de la red es la media a posteriori exacta de una mezcla de escalas gaussianas (Gaussian Scale Mixture), en lugar de una ReLU aprendida empíricamente. Esta fundamentación bayesiana, apoyada en los resultados de Tweedie/Miyasawa, permite que una red de 3 M de parámetros alcance el territorio de modelos de 26 M con solo 7,5 horas de GPU de entrenamiento y 1.200 imágenes de datos.

Es relevante ahora porque se sitúa en la frontera de Pareto precisión/coste de los denoisers publicados, con latencias de 17,9 ms por fotograma de 512² en una RTX PRO 6000 (bf16), lo que lo hace atractivo para despliegue en producción con hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | İvmetron-Guanine1 (U-Net bayesiana de shrinkage multi-escala) |
| Parametros totales | 2.971.342 |
| Parametros activos | no disponible (arquitectura densa, no MoE) |
| Longitud de contexto | no aplicable (modelo de imagen; acepta cualquier resolución) |
| Tipos de cuantizacion | fp32 (pesos originales); bf16 usado en inferencia según la model card |
| Idiomas soportados | no aplicable (modelo de visión) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (12 MB, fp32) |

## Arquitectura y entrenamiento

İvmetron-Guanine1 es una U-Net de shrinkage bayesiano con 3 escalas (resolución completa, 1/2 y 1/4), 3 bloques de shrinkage bayesiano por escala y ancho base de 96 canales (192 internos, 384 y 768 en las escalas inferiores). Las dilataciones 1/2/4 proporcionan un campo receptivo de aproximadamente 150 píxeles. La no-linealidad es una ganancia a posteriori GSM, monótona en un único estadístico escalar de energía, derivada analíticamente de la formulación de mezcla de escalas gaussianas: dado un modelo `c = √z · w` con contraste local oculto `z`, la estimación se reduce a `E[c|y] = U diag(g_i(e)) Uᵀ y`, donde las ganancias `g_i` son esperas sobre la posterior de `z`. Esto convierte el denoising en estimación del score de la densidad suavizada (identidad de Tweedie/Miyasawa), de modo que la red no necesita redescubrir la ley de shrinkage, solo aprender el enmarcado.

El condicionamiento de ruido es doble: FiLM sobre un σ global más un mapa espacial de σ como canal de entrada, lo que habilita la operación ciega (el modelo estima el nivel de ruido por sí mismo). El entrenamiento se realizó desde cero durante 300.000 pasos, con batch 32 y recortes de 128², sobre DIV2K train (800) + DIV2K valid (100) + BSD500 train/val (500), es decir, 1.200 imágenes en total, con un coste aproximado de 7,5 horas de GPU en una sola GPU. La entrada/salida es sRGB con gamma codificada, float32 en [0, 1], a cualquier resolución.

## Capacidades

- Eliminación de ruido gaussiano ciego en imágenes sRGB: el modelo estima su propio mapa de σ sin ajuste por imagen.
- Restauración de imagen a imagen (pipeline `image-to-image`) a cualquier resolución, con inferencia en mosaicos (tiling) para imágenes grandes.
- Procesado de una sola pasada (one pass) de fotogramas de alto ISO reales, según los ejemplos de la model card (12,3 MP en 6,5 s con tiling).
- Manejo de casos difíciles: ruido de croma en zonas negras, altas luces saturadas (sin bloom) y grano sobre colores saturados bajo luz de sodio, sin la planicie plástica de un desenfoque gaussiano fuerte.
- Robustez a un nivel de ruido mal especificado: la model card incluye una sección específica sobre tolerancia a σ incorrecto (detalles numéricos no disponibles en la información proporcionada).
- Eficiencia: 56,8 GFLOP a 256² y 158 GFLOP a 512², con un 35 % menos de FLOPs que DnCNN.
- No soporta texto, audio ni tareas generativas; es un modelo puramente de restauración de imagen.

## Casos de uso

- Limpieza de fotografías de alto ISO en flujos de trabajo fotográficos: una pasada con `denoise_auto` y tiling procesa un fotograma de 12,3 MP en unos 6,5 s, sin ajuste manual del nivel de ruido, adecuado para revelado por lotes.
- Visión por computador en entornos de poca luz: preprocesado de frames capturados con cámaras de seguridad o industriales antes de detección o clasificación, gracias al condicionamiento espacial de σ que adapta el filtrado zona a zona.
- Procesado en el borde (edge) y en tiempo casi real: con 17,9 ms por frame de 512² en GPU (bf16) y un footprint de 12 MB, cabe en pipelines de vídeo con hardware contenido.
- Restauración de archivos fotográficos digitalizados: eliminación de grano en escaneos preservando bordes y texto (la model card muestra el dígito "34" de una locomotora manteniéndose legible).
- Preprocesado para OCR: la preservación de bordes nítidos y detalles finos en zonas oscuras favorece el reconocimiento posterior de texto en imágenes ruidosas.
- Integración en apps móviles o de escritorio: el tamaño mínimo (2,97 M de parámetros) y el formato safetensors facilitan el despliegue local sin dependencias pesadas.
- Investigación en arquitecturas derivadas bayesianas: al ser un modelo "from scratch" con fundamentación teórica explícita, sirve como referencia reproducible para estudiar no-linealidades derivadas de GSM.

## Benchmarks y rendimiento

La model card aporta datos comparativos de coste y precisión relativos, sin tablas numéricas completas de PSNR/SSIM por dataset:

| Comparativa | Dato publicado |
|---|---|
| vs. DnCNN | Supera a DnCNN en todos los benchmarks estándar, con un 35 % menos de FLOPs |
| vs. DRUNet y Restormer | Dentro de 0,22–0,54 dB, con el 38 % de su cómputo y el 9–11 % de sus parámetros |
| FLOPs propios | 56,8 GFLOP @ 256²; 158 GFLOP @ 512² |
| Latencia | 17,9 ms por frame 512² (RTX PRO 6000, bf16); 6,5 s para 12,3 MP con tiling |
| Entrenamiento | 300.000 pasos, ≈7,5 GPU-horas, 1.200 imágenes (DIV2K + BSD500) |

No se han publicado valores absolutos de PSNR/SSIM por dataset (Set12, BSD68, Urban100, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible explícitamente; dado el tamaño de 12 MB en fp32 y los 158 GFLOP a 512², es razonable esperar que funcione en GPUs de consumo con pocos GB de VRAM (ninguna cifra oficial ha sido publicada).
- GPU de referencia en la model card: NVIDIA RTX PRO 6000 con precisión bf16 (17,9 ms por frame 512²).
- Consumer GPUs: no hay pruebas publicadas, pero el coste computacional (comparable o inferior a DnCNN) sugiere viabilidad en GPUs de la gama RTX de consumo; no disponible como dato confirmado.
- CPU: no disponible; al ser un modelo PyTorch de 3 M de parámetros, la ejecución en CPU es plausible pero sin latencias publicadas.
- Despliegue: PyTorch con `custom_code` (el repo incluye código propio, con `denoise_auto` y inferencia en mosaicos). No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables: no es un modelo de lenguaje).
- Descargas actuales: 80, por lo que se trata de un modelo muy reciente y con poco historial de despliegue comunitario.

## Comparativa con modelos similares

| Modelo | Parametros | Cómputo | Precisión relativa | Licencia |
|---|---|---|---|---|
| İvme-Denoise-v1 | 2,97 M | 158 GFLOP @ 512² | Referencia de esta ficha | Apache-2.0 |
| DnCNN | no disponible | +35 % FLOPs vs. İvme | Inferior según el autor | no disponible |
| DRUNet | no disponible (≈9–11× más que İvme) | ≈2,6× el cómputo de İvme | 0,22–0,54 dB por encima | no disponible |
| Restormer | no disponible (≈9–11× más que İvme) | ≈2,6× el cómputo de İvme | 0,22–0,54 dB por encima | no disponible |

Los datos proceden de las afirmaciones del autor en la model card; no se han verificado de forma independiente y faltan cifras absolutas de PSNR/SSIM y licencias de los modelos comparados (no disponible).

## Limitaciones y advertencias

- Los resultados de benchmarks proceden exclusivamente de la model card del autor; no hay verificación independiente ni tablas de PSNR/SSIM por dataset publicadas en la información disponible.
- El modelo es muy reciente (creado en octubre de 2026, con 80 descargas y 6 likes), por lo que carece de historial comunitario y de pruebas en producción.
- Entrenado solo con 1.200 imágenes (DIV2K + BSD500), un conjunto pequeño; el rendimiento en dominios muy distintos (imágenes médicas, astrofotografía, sensores no Bayer, artefactos JPEG o ruido real complejo no gaussiano) no está documentado.
- Diseñado para ruido gaussiano (el planteamiento teórico asume `n ~ N(0, σ² I)`); el ruido de sensores real (Poisson-gaussiano, banding, ruido cuantizado) puede comportarse peor.
- Requiere `custom_code` de confianza al cargar desde HuggingFace (trust_remote_code), lo que exige revisar el código del repo antes de usarlo en entornos sensibles.
- La licencia Apache-2.0 permite uso comercial sin restricciones relevantes más allá de la atribución y la nota de licencia estándar.
- Sesgos: al entrenar sobre fotografías naturales de DIV2K/BSD500, posible degradación en contenido sintético, gráficos o imágenes con texturas atípicas (no disponible como evaluación explícita).
- Riesgo de alucinación: no aplicable en el sentido de LLMs, pero como todo denoiser puede suavizar o inventar textura fina en zonas muy ruidosas; la model card no publica métricas de fidelidad perceptual (LPIPS u otras) (no disponible).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/IvmeLabs/Ivme-Denoise-v1
- Datasets de entrenamiento: DIV2K (https://huggingface.co/datasets/eugenesiow/Div2k) y BSD500 (no disponible un enlace oficial en la información proporcionada)
- Paper, blog, repositorio de código independiente o demo: no disponible en la información proporcionada

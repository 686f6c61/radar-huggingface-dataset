# opera-rsi/opera-tools-full-r2b

## Resumen

`opera-rsi/opera-tools-full-r2b` no es un modelo único, sino un paquete de 12 checkpoints de herramientas expertas de restauración de imagen (SwinIR, Restormer y X-Restormer) ajustadas de extremo a extremo para funcionar como ejecutoras de las cadenas de operaciones que genera el planificador congelado `opera-rsi/opera-planner-sft-r2`. Lo publica el usuario `opera-rsi` como parte de una reproducción del proyecto OPERA (planificación de cadenas de herramientas de restauración guiada por un modelo de lenguaje), siguiendo el protocolo del apéndice D del artículo y con código en `opera-rsi/opera-repro-code`.

El interés técnico está en el enfoque: en lugar de entrenar un restaurador monolítico, se congelan las decisiones (el planificador) y se ajustan únicamente las herramientas neuronales sobre las cadenas reales que ese planificador produce para un conjunto sintético (`synth_5k_135`). Con 3.221 pares de entrenamiento —muy pocos para este tipo de tareas—, el ajuste mejora el PSNR medio en MiO100 de 22,09 a 22,84 dB y el LPIPS de 0,364 a 0,334 respecto a las mismas herramientas preentrenadas, pero queda lejos del 24,16 dB que reporta el artículo original para su etapa *Full*.

Es un artefacto de investigación, no un producto: 0 descargas, 1 like, pipeline no declarado, licencia `other` y configuración con rutas locales de clúster. Resulta útil para reproducir el *fine-tuning* conjunto planificador-herramientas, para ablaciones sobre presupuesto de entrenamiento (12 épocas frente a las 23 del paper) y como conjunto de pesos de restauración por dominio (JPEG, dehaze, defocus, rain, SR, denoise), no como sustituto de un restaurador generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conjunto de 12 herramientas de restauración de imagen: SwinIR (transformer basado en ventanas), Restormer (transformer con atención por canales) y X-Restormer (variante extendida de Restormer) |
| Parametros totales | No disponible (la model card no publica el recuento por herramienta ni el agregado) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No aplica: no es un modelo de lenguaje; en entrenamiento se usan parches de 128×128 px |
| Tipos de cuantizacion | No disponible; los pesos se distribuyen sin cuantizar (entrenamiento en fp32) y no se han publicado variantes INT8/INT4 ni GGUF |
| Idiomas soportados | No aplica: entrada y salida son imágenes, no texto |
| Licencia | `other` (términos no detallados en la model card; verificar antes de uso comercial) |
| Formato de pesos | `.pth` (state dicts en el formato del *trainer*, un fichero por herramienta: `models/<tool>_epoch_9.pth`); sin safetensors ni GGUF |
| Tamano del repositorio | 1,3 GB (incluye 12 checkpoints, métricas, gráficas, configs y resultados de MiO) |
| Fecha de publicacion | 23 de octubre de 2026 (creación y última actualización el mismo día) |
| Descargas / likes | 0 / 1 |

## Arquitectura y entrenamiento

El paquete contiene exclusivamente los pesos de las herramientas que aparecen en las cadenas generadas por el planificador `opera-planner-sft-r2`, con el número de pares de entrenamiento asociado a cada una: `swinir.car.jpeg40` (1.418), `xrestormer.dehaze` (956), `restormer.deblur.defocus-single` (832), `restormer.derain` (795), `xrestormer.sr.real` (723), `restormer.deblur.motion` (613), `restormer.denoise.color-sigma50` (491), `swinir.sr.real-psnr` (424), `restormer.denoise.color-sigma25` (261), `xrestormer.derain` (206), `swinir.denoise.color-sigma25` (98) y `xrestormer.deblur.motion` (34). Las herramientas que nunca aparecieron en una cadena (`restormer.denoise.color-sigma15`, `swinir.denoise.color-sigma15/50`, `xrestormer.denoise.gaussian`) no se incluyen y deben tomarse de los pesos originales, de modo que el conjunto no cubre el catálogo completo de OPERA.

El protocolo de ajuste se aplica sobre 3.221 pares de entrenamiento y 741 de validación extraídos de `synth_5k_135`, con las cadenas dictadas por el planificador congelado. Se descartan las imágenes cuya cadena contiene un paso `cv2 brighten`: como esas operaciones no tienen parámetros, eliminar solo el paso enseñaría a las herramientas neuronales a iluminar la imagen (el error de la ejecución 1). Se usa Adam con lr 1e-6, parches de 128 px, batch 1 con acumulación de gradiente 4, recorte de gradiente 0,5 y pérdida L1 más perceptual progresiva (VGG) con peso creciente durante el primer 30 % de las épocas. El entrenamiento se hizo en fp32 porque la autocast a fp16 produjo NaN en el primer batch, y se limitó a 12 épocas (el artículo usa 23), guardando checkpoint por época. La época 9 se eligió por PSNR-Y de validación interna (24,37 dB) y MiO100 se evaluó una sola vez sobre esa época.

## Capacidades

- Restauración de artefactos de compresión JPEG de calidad 40 (`swinir.car.jpeg40`, la herramienta con más pares de entrenamiento).
- Eliminación de neblina y calima (`xrestormer.dehaze`).
- Deblurring de desenfoque de desenfoque de foco simple y de movimiento (`restormer.deblur.defocus-single`, `restormer.deblur.motion`, `xrestormer.deblur.motion`).
- Eliminación de lluvia (`restormer.derain`, `xrestormer.derain`).
- Superresolución real y orientada a PSNR (`xrestormer.sr.real`, `swinir.sr.real-psnr`).
- Eliminación de ruido de color con sigma 25 y 50 (`restormer.denoise.color-sigma25/50`, `swinir.denoise.color-sigma25`).
- Ejecución como herramientas de un agente: cada checkpoint se invoca desde una cadena planificada por `opera-planner-sft-r2`, que decide el orden y la selección de operaciones por imagen.
- No soporta tool calling en sentido LLM, ni razonamiento multi-paso propio, ni generación de texto, audio o vídeo: la "planificación" reside en el planificador separado, no en estos pesos.
- Sin capacidades multilingües ni modo *thinking*: son modelos puramente visuales.

## Casos de uso

- Reproducción del *fine-tuning* conjunto del apéndice D de OPERA: cargar los 12 checkpoints con `TOOLS_CKPT=<dir> TOOLS_EPOCH=9 SKIP_PLAN=1 bash overlay/step0_eval.sh` y comparar contra las herramientas preentrenadas para medir cuánto aporta el ajuste sobre las cadenas reales del planificador.
- Ablaciones de presupuesto de entrenamiento: la model card publica el PSNR-Y de validación época a época (23,45 a 24,37 dB), lo que permite estudiar la curva de convergencia y el efecto del *loss ramp* perceptual sin reentrenar desde cero.
- Recuperación de fotografía de archivo y móvil: combinar `swinir.car.jpeg40` con `xrestormer.sr.real` para lotes de imágenes recomprometidas con JPEG agresivo antes de ampliarlas, un escenario habitual en digitalización de fondos fotográficos.
- Preprocesado para *pipelines* de visión por computador: aplicar `xrestormer.dehaze` o `restormer.derain` antes de un detector o un modelo de segmentación, de forma que el modelo aguas abajo reciba imágenes con menos degradación; el ajuste sobre cadenas reales reduce el riesgo de que la restauración introduzca artefactos que confundan al detector.
- Vigilancia de tráfico y cámaras exteriores: `restormer.deblur.motion` y `xrestormer.deblur.motion` atacan el desenfoque de movimiento, mientras que el denoising de color sigma 25/50 cubre el ruido de sensores pequeños en condiciones de baja luz.
- Restauración guiada por agente sobre lotes heterogéneos: dejar que el planificador elija la cadena por imagen y usar estas herramientas como ejecutoras, útil cuando el lote mezcla neblina, lluvia y JPEG y no se quiere entrenar un clasificador de degradación aparte.
- Evaluación comparativa de restauradores por dominio: usar los pesos como *baseline* reproducible sobre MiO100 (1.440 imágenes, canal Y) para contrastar con SwinIR, Restormer o X-Restormer originales en cada subcategoría A/B/C.

## Benchmarks y rendimiento

Resultados en MiO100 (1.440 imágenes, canal Y, con los planes del propio planificador r2):

| Modelo | Cat. A | Cat. B | Cat. C | PSNR medio | SSIM | LPIPS | CLIPIQA |
|---|---|---|---|---|---|---|---|
| r2 Planning (herramientas preentrenadas) | 22,57 | 22,71 | 20,99 | 22,09 | 0,710 | 0,364 | 0,408 |
| **r2 + estas herramientas (época 9 de 12)** | **23,39** | **23,62** | **21,51** | **22,84** | **0,727** | **0,334** | **0,451** |
| OPERA paper Full (reportado) | 24,81 | 24,63 | 23,04 | 24,16 | 0,74 | 0,24 | No disponible |

Validación interna por época (PSNR-Y sobre el 20 % de validación de los pares de entrenamiento, tras el *loss ramp* del 30 %):

| Epoca | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| PSNR-Y | 23,45 | 23,93 | 23,94 | 23,86 | 23,97 | 24,17 | 24,34 | 24,18 | 24,37 | 24,24 | 24,20 | 24,32 |

El ajuste mejora las tres categorías y las cuatro métricas respecto a las herramientas preentrenadas, con una ganancia de +0,75 dB de PSNR medio y −0,030 de LPIPS. La brecha con la etapa *Full* del artículo (1,32 dB de PSNR, 0,094 de LPIPS) se explica en parte por el menor presupuesto de entrenamiento (12 épocas frente a 23) y por las diferencias de implementación del *pipeline*.

## Requisitos de hardware

- VRAM por herramienta: no disponible. La model card no publica parámetros ni huellas de memoria de cada checkpoint.
- Estimación derivada (no dato del autor): el repositorio completo ocupa 1,3 GB e incluye 12 checkpoints más métricas, gráficas y resultados, lo que sitúa cada fichero de pesos en el orden de decenas o pocos cientos de MB. Con ese tamaño, la inferencia por parches en una GPU de consumo (gama RTX xx70/xx80) es plausible, pero debe verificarse empíricamente.
- GPU de datacenter: no se especifica ninguna; para reproducir el entrenamiento hace falta una GPU con soporte de fp32 razonable (el autor descarta fp16 por inestabilidad) y capacidad para batch 1 con acumulación de gradiente 4 sobre parches de 128 px.
- Despliegue: no aplica vLLM, TGI, Ollama ni llama.cpp, que son *runtimes* de modelos de lenguaje. El camino previsto es PyTorch con el código de `opera-rsi/opera-repro-code` (script `overlay/step0_eval.sh`) y las variables de entorno `TOOLS_CKPT`, `TOOLS_EPOCH` y `SKIP_PLAN`.
- Dependencia obligatoria de un planificador: sin `opera-rsi/opera-planner-sft-r2` (o un plan manual) no hay cadena de operaciones que ejecutar, salvo invocación directa de cada herramienta por separado.
- Latencia y throughput: no disponibles. Cualquier medida debe tener en cuenta que una cadena encadena varias herramientas en secuencia, por lo que el coste total es la suma de las etapas más el coste de planificación.
- Almacenamiento: 1,3 GB para el repositorio; los pesos originales de las cinco herramientas ausentes deben descargarse aparte.

## Comparativa con modelos similares

| Modelo | Herramientas | PSNR medio (MiO100) | SSIM | LPIPS | Epocas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| `opera-tools-full-r2b` (esta ficha) | 12 ajustadas sobre cadenas r2 | 22,84 | 0,727 | 0,334 | 12 | `other` | Pesos en HF, 0 descargas |
| `opera-planner-sft-r2` con herramientas preentrenadas | SwinIR/Restormer/X-Restormer originales | 22,09 | 0,710 | 0,364 | 0 (sin ajuste) | `other` | Pesos en HF |
| OPERA Full del artículo (implementación de referencia) | Catálogo completo de OPERA | 24,16 | 0,74 | 0,24 | 23 | No disponible en la información | Solo resultados reportados |

No se han encontrado en la información proporcionada comparativas con restauradores generalistas tipo SwinIR o Restormer *all-in-one* evaluados en MiO100, por lo que la comparación se limita a las variantes del propio proyecto.

## Limitaciones y advertencias

- Cobertura incompleta: faltan cinco herramientas del catálogo (`restormer.denoise.color-sigma15`, `swinir.denoise.color-sigma15/50`, `xrestormer.denoise.gaussian`) porque no aparecieron en las cadenas de r2. Un *pipeline* que las necesite debe mezclar estos pesos con los originales, con el riesgo de inconsistencias de estilo o de escala entre etapas.
- Sesgo de selección de época: la época 9 se eligió por PSNR-Y en el mismo *split* de validación que luego se reporta, y MiO100 se evaluó una única vez sobre ella. Sin un conjunto de test independiente, la cifra de 24,37 dB de validación está optimistamente sesgada.
- Dependencia del planificador: el ajuste está especializado en las distribuciones de cadenas de `opera-planner-sft-r2`. Si se cambia el planificador o se usan planes manuales distintos, la ventaja frente a los pesos preentrenados puede reducirse o desaparecer.
- Punto ciego del brillo: las imágenes cuyas cadenas incluyen pasos `cv2 brighten` se descartaron del entrenamiento, de modo que el sistema no está validado para escenas que requieran corrección de exposición.
- Dominio sintético: el entrenamiento usa `synth_5k_135`, un conjunto sintético. No hay evidencia en la información disponible sobre el comportamiento en fotografías reales fuera de MiO100.
- Métricas solo en canal Y: PSNR, SSIM y LPIPS se calculan sobre luminancia; el comportamiento en crominancia (por ejemplo, virajes de color tras el dehaze) no se ha evaluado.
- fp16 inestable: la autocast fp16 produjo NaN en el primer batch durante el entrenamiento. No se documenta si la inferencia en fp16 es segura; conviene validar en fp32 antes de optimizar.
- Licencia `other`: los términos no están detallados en la model card. No se puede asumir uso comercial sin consultar al autor.
- Madurez: 0 descargas, 1 like, publicación y actualización el mismo día, sin *pipeline tag* y con rutas locales de clúster en `configs/train_config.json` y `configs/val_config.json`. No es un artefacto listo para producción.
- Riesgo de seguridad al cargar pesos: los `.pth` son *pickles* de PyTorch y requieren `torch.load`; no se ofrecen safetensors. Cargar solo desde el repositorio oficial y en un entorno aislado.
- Riesgo de alucinación en sentido estricto no aplica (no genera texto), pero sí existe riesgo de artefactos plausibles: la superresolución y el dehaze pueden inventar texturas o eliminar detalles finos con apariencia realista, algo crítico en contextos forenses o médicos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/opera-rsi/opera-tools-full-r2b
- Planificador congelado utilizado para generar las cadenas: https://huggingface.co/opera-rsi/opera-planner-sft-r2
- Código de reproducción (incluye `overlay/full_r2_chain.sh`, `overlay/train_smoke.sh`, `overlay/step0_eval.sh` y `Opera/tools/restormer/training/train_combined.py`): https://huggingface.co/opera-rsi/opera-repro-code
- Ficheros dentro del repositorio: `models/<tool>_epoch_9.pth`, `metrics/validation_metrics.csv`, `metrics/metrics_history.json`, `plots/`, `configs/train_config.json`, `configs/val_config.json`, `mio_eval/`
- Conjunto de datos `synth_5k_135` y artículo de OPERA (apéndice D): referenciados en la model card, sin enlace público en la información disponible
- Resultados de búsqueda web: las entradas devueltas corresponden al navegador Opera (opera.com, clubic.com, apps-opera.com) y no guardan relación con este modelo; no se han localizado papers, blogs ni demos adicionales.

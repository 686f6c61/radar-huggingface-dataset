# JeonghyeokDo/ReFlowSET-baselines

## Resumen

ReFlowSET-baselines es un repositorio que contiene los checkpoints reentrenados de los quince métodos de comparación del benchmark **ReFlowSET** de traducción SAR a óptica (SAR-to-EO), sobre los dos conjuntos de datos del benchmark: **QXS-SAROPT** (256 px) y **SAR2Opt** (512 px). En total son treinta celdas de checkpoints, cada una correspondiente a un método y un dataset. El autor, Jeonghyeok Do (investigador postdoctoral en KAIST, VIC Lab), reentrenó todos los métodos con un presupuesto de entrenamiento unificado y un protocolo de evaluación común, lo que permite comparar los métodos entre sí de forma justa, aunque no con los números publicados en los artículos originales.

La relevancia de este repositorio radica en que proporciona una base de comparación homogénea para la traducción de imágenes SAR a ópticas, un problema clave en teledetección. Incluye métodos generales de image-to-image (pix2pix, CycleGAN, pix2pixHD, SPADE, DDPM, SD2.1 fine-tune, BBDM, ControlNet, HI-Diff, ResShift, StegoGAN) y métodos específicos de SAR-to-EO (Conditional Diffusion, cBBDM, E3Diff, C-DiffSET). Todos los pesos están en formato safetensors y el repositorio tiene un tamaño de 6,9 GB. El modelo ReFlowSET en sí no está incluido aquí, sino en un repositorio separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multiples: GAN (pix2pix, CycleGAN, pix2pixHD, SPADE, StegoGAN), difusion (DDPM, BBDM, ControlNet, HI-Diff, ResShift, Conditional Diffusion, cBBDM, E3Diff, C-DiffSET, SD2.1 fine-tune) |
| Parametros totales | no disponible (cada metodo tiene los suyos) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (imagen) |
| Tipos de cuantizacion | no disponible (safetensors de precision completa) |
| Idiomas soportados | no aplica (imagen) |
| Licencia | per-method-see-below (depende de cada metodo) |
| Formato de pesos | safetensors (PyTorch) |

## Arquitectura y entrenamiento

El repositorio contiene quince arquitecturas diferentes, cada una con su propio diseño: desde GANs condicionales (pix2pix, pix2pixHD, SPADE) y no condicionadas (CycleGAN, StegoGAN) hasta modelos de difusion denoising (DDPM, BBDM, ControlNet, HI-Diff, ResShift) y variantes especificas para SAR-to-EO (Conditional Diffusion, cBBDM, E3Diff, C-DiffSET). Tambien se incluye un fine-tune de Stable Diffusion 2.1.

El entrenamiento se realizo con un presupuesto unificado en **updates de optimizador**, no en epocas, debido a la gran diferencia de tamano entre los dos datasets (16.001 pares de entrenamiento en QXS-SAROPT frente a 1.450 en SAR2Opt). Varios metodos se entrenaron con una fraccion de su horario publicado; por ejemplo, HI-Diff se entreno durante 50.000 updates frente a los 600.000 de su receta original, con progressive resizing desactivado. Todos los metodos usaron el mismo split oficial, la misma resolucion (256 px para QXS-SAROPT y 512 px para SAR2Opt, con centre-crop en este ultimo) y el mismo pipeline de evaluacion, que incluye una auditoria de colapso de identidad y de fuga de ground truth.

## Capacidades

- Traduccion de imagen SAR (radar de apertura sintetica) a imagen optica (EO, electro-optica) en resoluciones de 256 px y 512 px.
- Generacion de imagenes condicionada por la entrada SAR, tanto con modelos GAN como con modelos de difusion.
- Los metodos incluidos cubren un espectro amplio de enfoques: desde GANs clasicas hasta difusion de ultima generacion, lo que permite estudiar el rendimiento relativo de cada familia de modelos.
- No soporta tool calling, agentes ni procesamiento de lenguaje; es exclusivamente un conjunto de modelos de traduccion de imagenes.

## Casos de uso

- **Generacion de imagenes opticas sinteticas para entrenamiento de modelos de clasificacion**: los checkpoints pueden usarse para sintetizar imagenes opticas a partir de SAR, ampliando datasets etiquetados escasos en teledeteccion.
- **Fusion de datos multi-sensor**: en aplicaciones de observacion de la Tierra, la traduccion SAR-to-EO permite combinar informacion de radar (disponible en cualquier condicion meteorologica) con imagenes opticas, mejorando la robustez de analisis posteriores.
- **Monitoreo de desastres naturales**: las imagenes SAR se obtienen incluso con nubes o de noche; traducirlas a opticas facilita la interpretacion visual por parte de equipos de emergencia y sistemas automaticos.
- **Agricultura de precision**: la traduccion de SAR a optico puede ayudar a estimar indices de vegetacion o detectar anomalias en cultivos cuando la cobertura optica es limitada.
- **Evaluacion comparativa de metodos de image-to-image**: este repositorio sirve como banco de pruebas estandarizado para comparar nuevas arquitecturas de traduccion de imagenes bajo las mismas condiciones de entrenamiento y evaluacion.
- **Investigacion en difusion aplicada a teledeteccion**: los checkpoints de modelos de difusion (DDPM, BBDM, ControlNet, etc.) permiten estudiar el comportamiento de estas arquitecturas en un dominio especifico con metricas unificadas.

## Benchmarks y rendimiento

Los resultados que se muestran a continuacion son mediciones propias del autor sobre las imagenes generadas por cada checkpoint, con un pipeline de evaluacion comun. No son comparables con los numeros de los articulos originales, pero si entre si dentro del benchmark.

### QXS-SAROPT (n = 3.999, 256 px)

| Metodo | Venue | FID↓ | DISTS↓ | LPIPS↓ | SSIM↑ | PSNR↑ |
|---|---|---|---|---|---|---|
| pix2pix | CVPR'17 | 174.6 | 0.373 | 0.665 | 0.203 | 12.33 |
| CycleGAN ⚠ | ICCV'17 | 104.4 | 0.376 | 0.653 | 0.262 | 12.92 |
| pix2pixHD | CVPR'18 | 85.7 | 0.298 | 0.573 | 0.358 | 16.13 |
| SPADE | CVPR'19 | 90.7 | 0.292 | 0.599 | 0.320 | 14.53 |
| DDPM (SR3-class) | TPAMI'22 | 43.8 | 0.311 | 0.620 | 0.359 | 14.04 |
| SD2.1 fine-tune only | CVPR'22 | 19.1 | 0.257 | 0.561 | 0.348 | 15.40 |
| BBDM | CVPR'23 | 76.6 | 0.270 | 0.568 | 0.352 | 15.34 |
| ControlNet | ICCV'23 | 50.4 | 0.307 | 0.604 | 0.297 | 13.42 |
| HI-Diff | NeurIPS'23 | 324.3 | 0.539 | 0.692 | 0.457 | 17.10 |
| ResShift | NeurIPS'23 | 140.2 | 0.334 | 0.607 | 0.217 | 14.20 |
| StegoGAN ⚠ | CVPR'24 | 106.8 | 0.384 | 0.658 | 0.254 | 12.96 |
| Conditional Diffusion | GRSL'24 | 88.6 | 0.355 | 0.730 | 0.213 | 11.55 |
| cBBDM | GRSL'25 | 50.6 | 0.246 | 0.539 | 0.372 | 16.02 |
| E3Diff | GRSL'25 | 47.8 | 0.278 | 0.530 | 0.302 | 16.44 |
| C-DiffSET | TCSVT'26 | 19.9 | 0.233 | 0.526 | 0.380 | 16.92 |
| **ReFlowSET (ours)** | — | 19.1 | 0.231 | 0.534 | 0.355 | 16.09 |

### SAR2Opt (n = 627, 512 px, centre crops de 600 px)

| Metodo | Venue | FID↓ | DISTS↓ | LPIPS↓ | SSIM↑ | PSNR↑ |
|---|---|---|---|---|---|---|
| pix2pix | CVPR'17 | 261.9 | 0.347 | 0.657 | 0.199 | 13.39 |
| CycleGAN ⚠ | ICCV'17 | 143.5 | 0.330 | 0.650 | 0.178 | 12.90 |
| pix2pixHD | CVPR'18 | 146.3 | 0.283 | 0.567 | 0.268 | 15.95 |
| SPADE | CVPR'19 | 142.5 | 0.265 | 0.597 | 0.234 | 14.47 |
| DDPM (SR3-class) | TPAMI'22 | 122.5 | 0.295 | 0.610 | 0.313 | 13.65 |
| SD2.1 fine-tune only | CVPR'22 | 71.8 | 0.211 † | 0.541 | 0.293 | 16.24 |
| BBDM | CVPR'23 | 143.1 | 0.290 | 0.590 | 0.276 | 15.29 |
| ControlNet | ICCV'23 | 140.5 | 0.350 | 0.643 | 0.217 | 11.73 |
| HI-Diff | NeurIPS'23 | 319.8 | 0.473 | 0.692 | 0.384 | 17.36 |
| ResShift | NeurIPS'23 | 141.7 | 0.304 | 0.597 | 0.177 | 14.31 |
| StegoGAN ⚠ | CVPR'24 | 150.1 | 0.347 | 0.655 | 0.158 | 12.47 |
| Conditional Diffusion | GRSL'24 | 211.8 | 0.415 | 0.686 | 0.248 | 12.48 |
| cBBDM | GRSL'25 | 222.3 | 0.377 | 0.571 | 0.361 | 17.05 |
| E3Diff | GRSL'25 | 104.7 | 0.232 | 0.529 | 0.249 | 16.09 |
| C-DiffSET | TCSVT'26 | 78.1 | 0.214 † | 0.529 | 0.314 | 16.81 |
| **ReFlowSET (ours)** | — | 66.3 | 0.185 | 0.522 | 0.287 | 16.06 |

Notas: ⚠ indica que el metodo falla la auditoria de copia de entrada (input-copy audit). † indica que esos valores DISTS fueron re-medidos sobre los dumps actuales; el resto de metricas no se vieron afectadas.

## Requisitos de hardware

- No se proporcionan requisitos de hardware especificos en la informacion disponible.
- Al tratarse de modelos de difusion y GANs en PyTorch con safetensors, se requiere una GPU con VRAM suficiente para inferencia a resoluciones de 256 px o 512 px. Como referencia orientativa, los modelos de difusion tipicos necesitan al menos 8-12 GB de VRAM para inferencia a esas resoluciones, pero no hay datos confirmados para estos checkpoints concretos.
- El repositorio usa la libreria `diffusers` (segun los tags), por lo que es compatible con pipelines de Hugging Face y con herramientas como `diffusers` para carga y generacion.
- No se indican opciones de despliegue especificas (vLLM, llama.cpp, etc.), ya que no es un modelo de lenguaje.

## Comparativa con modelos similares

No se dispone de informacion sobre otros benchmarks de SAR-to-EO con los que comparar directamente este repositorio. La comparativa interna entre los quince metodos es el proposito principal del benchmark, y los resultados de la tabla anterior permiten evaluar diferencias relativas. El modelo ReFlowSET (el metodo propuesto por el autor) se incluye como fila de referencia en las tablas, pero no esta en este repositorio.

## Limitaciones y advertencias

- **Los numeros no son comparables con los articulos originales**: los presupuestos de entrenamiento se ajustaron a un maximo comun, por lo que algunos metodos se entrenaron con menos updates que en sus recetas publicadas (p. ej., HI-Diff con 50.000 updates frente a 600.000).
- **Algunos metodos fallan la auditoria de copia de entrada**: CycleGAN y StegoGAN estan marcados con ⚠ en las tablas, lo que indica que sus salidas pueden copiar la entrada SAR en lugar de generar una traduccion genuina.
- **La metrica LPIPS usa una convencion especifica**: LPIPS-VGG con entradas mapeadas a `[-1, 1]` y `normalize=False`; esto puede diferir de otras implementaciones y dificultar la comparacion con otros estudios.
- **SAR2Opt se evalua con centre-crops de 512 px** sobre tiles de 600 px, sin redimensionado; esto puede afectar la comparabilidad con metodos que usan la resolucion completa.
- **La licencia es "per-method-see-below"**: cada metodo puede tener su propia licencia (muchos son de articulos academicos con restricciones de uso comercial). Es necesario revisar la licencia de cada metodo individual antes de un uso en produccion.
- **El repositorio no incluye el modelo ReFlowSET en si**, solo los checkpoints de los metodos de comparacion; para el modelo principal hay que acudir a [JeonghyeokDo/ReFlowSET](https://huggingface.co/JeonghyeokDo/ReFlowSET).

## Enlaces

- Repositorio HuggingFace: [JeonghyeokDo/ReFlowSET-baselines](https://huggingface.co/JeonghyeokDo/ReFlowSET-baselines)
- Repositorio del benchmark ReFlowSET: [JeonghyeokDo/ReFlowSET](https://huggingface.co/JeonghyeokDo/ReFlowSET)
- Codigo: [https://github.com/KAIST-VICLab/ReFlowSET](https://github.com/KAIST-VICLab/ReFlowSET)
- Pagina del proyecto: [https://kaist-viclab.github.io/ReFlowSET_site/](https://kaist-viclab.github.io/ReFlowSET_site/)
- Perfil del autor en GitHub: [https://github.com/JeonghyeokDo](https://github.com/JeonghyeokDo)
- Pagina personal del autor: [https://jeonghyeokdo.github.io/](https://jeonghyeokdo.github.io/)

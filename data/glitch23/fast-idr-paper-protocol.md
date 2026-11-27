# glitch23/fast-idr-paper-protocol

## Resumen

Fast IDR es una reproducción del método IDR (Iterative Data Refinement), presentado en el paper *IDR: Self-Supervised Image Denoising via Iterative Data Refinement* (Zhang et al., CVPR 2022), publicada por el usuario glitch23 en Hugging Face. El repositorio contiene 42 checkpoints finales de 50.000 pasos de entrenamiento que cubren tanto el modelo self-supervised IDR como su cota superior supervisada, además de adaptaciones a datos sísmicos. No es un modelo de lenguaje ni un modelo fundacional generativo: es una colección de pesos de una red de eliminación de ruido de imágenes (y secciones sísmicas) entrenada bajo el protocolo exacto del paper original.

El interés técnico reside en que reproduce de forma sistemática las condiciones del paper (red `UNet_n2n_un` del repositorio original de IDR, batch 4, recortes de 256 píxeles, 50.000 pasos Adam, lr 3e-4 con decaimiento a 25k y 40k, pérdida L1 y L2 enmascarada para ruidos específicos, profesor Fast IDR refrescado cada 12.500 pasos) y añade una adaptación al dominio sísmico con corpus sintéticos (Marmousi2, Overthrust, Salt) y datos de campo (F3 Netherlands). El repositorio ocupa 0,2 GB y se distribuye bajo licencia MIT.

La relevancia actual es acotada pero clara: sirve como referencia reproducible para investigadores que trabajan en denoising self-supervised, como base para adaptaciones a dominios científicos (sísmica, imagen médica, astronomía) y como conjunto de pesos listos para evaluar sin reentrenar. No hay pipeline declarado en Hugging Face ni idiomas soportados, lo que confirma que no es un modelo de NLP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net (`UNet_n2n_un`, del repositorio zhangyi-3/IDR) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen/sísmica, no de texto) |
| Tipos de cuantizacion | no disponible (pesos en FP32/TF32; no se documentan GGUF ni INT8) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | `weights.pth` (state_dict de PyTorch) + `config.json` + `training_summary.json` |
| Canales de entrada | 3 (RGB) o 1 (gris / sísmica) según run |
| Resolución de entrenamiento | recortes de 256 píxeles, batch 4 |
| Pasos de entrenamiento | 50.000 Adam por run |
| Hardware de entrenamiento | una RTX 5070 Ti |

## Arquitectura y entrenamiento

La red es una U-Net (`UNet_n2n_un`) heredada del repositorio oficial de IDR, sin modificaciones arquitectónicas respecto al upstream. El entrenamiento sigue el protocolo del paper: optimizador Adam con learning rate 3e-4, decaimiento a la mitad en los pasos 25.000 y 40.000, batch de 4 recortes de 256 píxeles, pérdida L1 por defecto y pérdida L2 enmascarada para ruidos binomial, impulso y trazas muertas. La innovación clave del método IDR es el uso de un profesor Fast IDR que se refresca cada 12.500 pasos para refinar iterativamente los pares de entrenamiento; el repositorio incluye además runs `nr2n` (etapa 0 del Fast IDR) y `n2n` como baselines.

Los datos de entrenamiento son ImageNet val (50.000 imágenes) para los runs de imagen, con ruido gaussiano σ∈[0,50], binomial, impulso, gaussiano correlado (cuatro escenarios) y ruido fijo. Para los runs sísmicos se emplean corpus sintéticos (Marmousi2, Overthrust, Salt) y datos de campo de F3 Netherlands, con ruido gaussiano blanco, band-limited 5–60 Hz, spikes y trazas muertas. Se documenta un control en FP32 frente a TF32 y tres semillas (`s0`, `s1`, `s2`) para medir varianza de entrenamiento. No se documenta RLHF, DPO ni decodificación especulativa, por no ser aplicables al dominio.

## Capacidades

- Eliminación de ruido gaussiano en imágenes RGB y en escala de grises (σ∈[0,50]).
- Eliminación de ruido binomial, impulso y gaussiano correlado (cuatro escenarios) en imágenes.
- Eliminación de ruido en secciones sísmicas 1 canal: gaussiano blanco, band-limited 5–60 Hz, spikes y trazas muertas.
- Modo self-supervised (IDR) y modo supervisado (cota superior) para comparación controlada.
- Baselines Noisier2Noise (`nr2n`) y Noise2Noise (`n2n`) incluidos para reproducir la jerarquía del paper.
- Inferencia con corrección Nr2N documentada (`nr2n_correct.py`, fórmula x̂ = 2·f(y+n′) − (y+n′)).
- Adaptación a datos de campo (F3) con rango de σ estimado [0,02722, 0,08165].
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües.

## Casos de uso

- Reproducción académica del paper IDR: los 42 checkpoints permiten verificar cifras de PSNR/SSIM sin reentrenar, comparando seeds y control FP32 frente a TF32 para aislar la varianza numérica.
- Denoising de secciones sísmicas en exploración: los runs `C*` y `F*` están entrenados sobre Marmousi2, Overthrust, Salt y F3, y pueden aplicarse directamente a secciones (time, trace) escaladas a RMS unitario para limpiar ruido blanco o band-limited antes de la migración.
- Adaptación a nuevos dominios científicos: la U-Net de 1 canal y los pesos `C1_idr_sg_s0` sirven como inicialización para denoising en imagen médica, astronomía o microscopía, con el mismo protocolo de padding reflect a múltiplo de 32.
- Benchmark de métodos self-supervised: al incluir `idr`, `sup`, `nr2n` y `n2n` bajo el mismo protocolo, permite comparar la brecha self-supervised/supervisado en igualdad de condiciones.
- Preprocesado en pipelines de imagen: los runs `A1`/`A2` pueden insertarse como etapa de limpieza en flujos de visión por computador donde el ruido gaussiano degrada la detección posterior.
- Estudio de robustez frente a ruido correlado: los cuatro escenarios `A9_idr_scn1..4` permiten analizar el comportamiento de IDR cuando la hipótesis de ruido independiente no se cumple.
- Docencia y formación: el repositorio incluye `config.json` y `training_summary.json` por run, lo que facilita reproducir el experimento completo en una sola GPU consumer.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card referencia un informe (`repro/reports/paperproto/REPORT.md`) y ficheros `*_summary.json` con PSNR/SSIM para imagen y SNR/SSIM/similitud local para sísmica, pero las cifras no se incluyen en la información proporcionada y no deben inventarse.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; por el tamaño del repositorio (0,2 GB para 42 checkpoints) cada checkpoint individual es del orden de pocos MB, lo que sugiere un modelo pequeño apto para GPU consumer.
- GPU de entrenamiento documentada: una RTX 5070 Ti para los 50.000 pasos de cada run.
- GPU recomendadas para inferencia: cualquier GPU con soporte CUDA; una RTX 4090 o superior sobra para el tamaño aparente del modelo.
- Cabe en GPU consumer: sí, según el hardware de entrenamiento declarado (RTX 5070 Ti).
- Opciones de despliegue: PyTorch nativo cargando `weights.pth` con `UNet_n2n_un` del repositorio IDR/dat-repro; no se documentan exportaciones a ONNX, TensorRT, vLLM, llama.cpp ni Ollama (no aplicables al dominio).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Enfoque | Canales | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Fast IDR (este repo) | U-Net denoising | IDR self-supervised + supervisado + sísimica | 1 y 3 | MIT | Pesos en HF |
| IDR original (zhangyi-3/IDR) | U-Net denoising | IDR self-supervised | 3 | no disponible en la información | Código y pesos upstream |
| Noise2Noise | U-Net denoising | Pares ruidosos | 3 | no disponible en la información | Repositorio original |
| Noisier2Noise | U-Net denoising | Ruido adicional sintético | 3 | no disponible en la información | Repositorio original |

La comparativa se limita a métodos de la misma familia (denoising self-supervised con U-Net); no se dispone de cifras de rendimiento comparables en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no admite prompts de texto, tool calling ni razonamiento; cualquier uso en ese sentido es un error de categoría.
- Los pesos están en formato PyTorch (`weights.pth`) y dependen del código `UNet_n2n_un` del repositorio IDR/dat-repro; sin ese código no se pueden cargar directamente.
- Las entradas deben respetar convenciones estrictas: float en [0,1] para imagen, resta de 0,5 para ruido gaussiano (`zero_mean`), padding reflect a múltiplo de 32, y escala a RMS unitario para sísmica. Saltarse estas convenciones degrada la salida sin aviso.
- El ruido de entrenamiento está acotado a los escenarios documentados (gaussiano σ∈[0,50], binomial, impulso, correlado, band-limited 5–60 Hz, spikes, trazas muertas); fuera de ese rango el comportamiento no está caracterizado.
- Los runs de campo (F3) usan un rango de σ estimado ([0,02722, 0,08165]) y ruido fijo de un run sintético, lo que puede introducir desajuste respecto al ruido real.
- Riesgo de alucinación no aplica en el sentido de NLP, pero sí existe riesgo de artefactos y sobre-suavizado en la reconstrucción, especialmente con ruido correlado o trazas muertas.
- Sesgos conocidos: no documentados en la información proporcionada; los datasets sísmicos (Marmousi2, Overthrust, Salt, F3) tienen sesgos geológicos y de adquisición que condicionan la generalización.
- Licencia MIT permite uso comercial, pero el código upstream de IDR y los datasets (ImageNet val, Marmousi2, F3) tienen sus propias licencias que deben respetarse por separado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria ni issues documentados.

## Enlaces

- Hugging Face: https://huggingface.co/glitch23/fast-idr-paper-protocol
- Código de reproducción: GitHub `AkshatT2307/dat-repro`, rama `paper-protocol`, carpeta `repro/paperproto/`
- Informe de resultados: `repro/reports/paperproto/REPORT.md` en el mismo repositorio
- Repositorio upstream de IDR (red `UNet_n2n_un`): zhangyi-3/IDR
- Paper original: Zhang et al., *IDR: Self-Supervised Image Denoising via Iterative Data Refinement*, CVPR 2022
- Script de corrección Nr2N: `nr2n_correct.py` en el repositorio de reproducción

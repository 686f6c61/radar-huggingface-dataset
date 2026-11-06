# autonomousvision/learn2splat

## Resumen

Learn2Splat es un optimizador metaaprendido para 3D Gaussian Splatting (3DGS) desarrollado por el grupo Autonomous Vision (Universidad de Tubinga, con colaboraciones de Meta Reality Labs y la Universidad de Bonn, segun la lista de autores). Sustituye optimizadores disenados a mano como Adam o SGD por una regla de actualizacion aprendida que predice directamente las actualizaciones estructuradas de los parametros de las gaussianas. El objetivo es acelerar la convergencia temprana sin sacrificar estabilidad en horizontes largos de optimizacion.

El modelo se entrena sobre multiples escenas y se aplica en zero-shot a escenas y resoluciones no vistas, sin necesidad de fine-tuning en tiempo de test. No es un modelo de lenguaje: es un componente de vision por computador orientado a reconstruccion 3D y sintesis de vistas (novel view synthesis). El repositorio ocupa 1,5 GB e incluye tres checkpoints: `joint` (optimizador unico para vistas dispersas y densas), `joint_resplat_v2` (entrenado con el inicializador ReSplat-Base) y `resplat_init` (inicializador ReSplat pre-release).

La relevancia actual reside en que 3DGS se ha convertido en una alternativa eficiente a NeRF para reconstruccion y renderizado en tiempo real, y la optimizacion de sus parametros sigue dependiendo de heuristicas manuales. Learn2Splat demuestra que una regla de actualizacion aprendida puede superar a Adam ajustado en PSNR, SSIM y LPIPS en benchmarks como DL3DV, RE10K, DTU, LLFF y Mip-NeRF 360, manteniendo estabilidad a largo plazo sin schedules de learning rate ni condicionamiento por paso temporal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Optimizador metaaprendido para 3D Gaussian Splatting (red neuronal que predice actualizaciones de parametros; detalles internos no disponibles en la informacion proporcionada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en PyTorch; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | Checkpoints de PyTorch (repositorio de 1,5 GB con carpetas `joint/`, `joint_resplat_v2/`, `resplat_init/`) |

## Arquitectura y entrenamiento

Learn2Splat es un optimizador metaaprendido: en lugar de aplicar una regla fija como Adam, una red aprendida recibe el estado de la optimizacion y emite actualizaciones estructuradas sobre los parametros de las gaussianas 3D (posiciones, covarianzas, opacidades y coeficientes de color, presumiblemente, aunque el desglose exacto no se detalla en la informacion disponible). El entrenamiento se realiza sobre muchas escenas para que la regla de actualizacion generalice a escenas no vistas y a resoluciones distintas en zero-shot. Una propiedad destacada es que no requiere schedules de learning rate ni condicionamiento por paso temporal, y mantiene estabilidad en horizontes largos de optimizacion.

El modelo se distribuye en tres checkpoints con propositos diferenciados. `joint` es el optimizador unico para vistas dispersas y densas, y es el que reproduce la tabla del paper (con `antialiased` y `eps2d=0.3`). `joint_resplat_v2` se entrena con el inicializador ReSplat-Base de Xu et al. (2025), cargado desde `haofeixu/resplat`, y se evalua con los ajustes de renderizado de ReSplat (`antialiased`, `eps2d=0.1`), por lo que sus cifras no son directamente comparables con las del paper. `resplat_init` es la version pre-release de ReSplat usada como inicializador para `joint`. No se especifican en la informacion disponible el numero de tokens, la composicion del dataset de entrenamiento ni si se emplearon tecnicas de RLHF o DPO (no aplicables en este dominio).

## Capacidades

- Optimizacion aprendida de representaciones 3D Gaussian Splatting, sustituyendo a Adam/SGD con una regla de actualizacion neuronal.
- Convergencia temprana mas rapida que los optimizadores estandar, segun los resultados reportados.
- Estabilidad en optimizacion de horizonte largo sin schedules de learning rate ni condicionamiento por time-step.
- Generalizacion zero-shot a escenas y resoluciones no vistas, sin fine-tuning en test.
- Soporte de configuracion para vistas dispersas (sparse views) y vistas densas (dense views) con el checkpoint `joint`.
- Integracion con inicializadores externos, en concreto ReSplat-Base para el caso de vistas dispersas.
- Reconstruccion 3D y sintesis de vistas noveles (novel view synthesis) evaluadas con PSNR, SSIM y LPIPS.
- No es un modelo de lenguaje: no soporta generacion de texto, tool calling, agentes ni capacidades multilingues.

## Casos de uso

- Reconstruccion 3D a partir de pocas imagenes (sparse-view 3DGS): el checkpoint `joint` acelera la convergencia cuando solo se dispone de 8 vistas, un escenario habitual en captura movil o robotica donde no se pueden obtener decenas de imagenes.
- Pipelines de sintesis de vistas para realidad virtual y aumentada: el modelo permite obtener representaciones gaussianas utiles en menos pasos de optimizacion, lo que reduce el tiempo hasta un renderizado aceptable en flujos interactivos.
- Comparacion y sustitucion de optimizadores en investigacion: al ser un drop-in aprendido frente a Adam, se puede integrar en codigos de 3DGS existentes para medir ganancias de PSNR/SSIM/LPIPS en benchmarks propios (DL3DV, RE10K, DTU, LLFF, Mip-NeRF 360).
- Refinamiento rapido sobre inicializaciones ReSplat: `joint_resplat_v2` supera a los 4 pasos de refinamiento de ReSplat (unos 0,5 s) en DL3DV con 8 vistas a 512x960 y con 32 vistas a 256x448, lo que lo hace util en sistemas que ya usan ReSplat como inicializador.
- Digitalizacion de escenas para gemelos digitales: la optimizacion estable a largo plazo permite entrenamientos prolongados sin degradacion, adecuado para reconstrucciones de alta fidelidad de entornos reales.
- Evaluacion comparativa de metodos de reconstruccion: los checkpoints y comandos de evaluacion publicados permiten reproducir tablas de resultados con ajustes de renderizado concretos (`antialiased`, `eps2d`), util para revisiones por pares y replicabilidad.

## Benchmarks y rendimiento

Resultados de `joint_resplat_v2` con vistas dispersas e inicializacion ReSplat-Base (PSNR / SSIM / LPIPS al runtime de 4000 pasos de Adam):

| Benchmark | Init | Adam | Adam (tuned) | `joint_resplat_v2` |
|---|---|---|---|---|
| DL3DV, 8 vistas, 256x448 | 27,35 | 30,30 / 0,916 / 0,093 | 30,51 / 0,920 / 0,088 | **30,79 / 0,922 / 0,084** |
| DL3DV, 8 vistas, 512x960 | 26,14 | 27,84 / 0,866 / 0,169 | 27,88 / 0,869 / 0,166 | **28,26 / 0,874 / 0,156** |
| DL3DV, 32 vistas, 256x448 | 26,31 | 30,21 / 0,913 / 0,095 | 30,37 / **0,918** / 0,091 | **30,61 / 0,918 / 0,089** |
| RE10K, 8 vistas | 21,30 | 27,58 / 0,873 / 0,192 | 27,81 / **0,880 / 0,181** | **27,91** / 0,878 / 0,182 |
| Mip-NeRF 360, 8 vistas | 19,59 | 23,00 / 0,657 / 0,326 | 23,47 / **0,698 / 0,292** | **23,84** / 0,660 / 0,316 |

Comparacion frente al refinamiento propio de ReSplat (4 pasos, ~0,5 s), misma inicializacion:

| Benchmark | ReSplat (4 pasos) | `joint_resplat_v2` |
|---|---|---|
| DL3DV, 8 vistas, 512x960 | 27,65 / 0,866 / **0,161** | **27,78 / 0,871** / 0,165 |
| DL3DV, 32 vistas, 256x448 | 28,31 / 0,889 / 0,114 | **28,55 / 0,901 / 0,114** |

Resultados con vistas densas e inicializacion SfM (PSNR / SSIM / LPIPS al runtime de 4000 pasos de Adam):

| Benchmark | Adam | Adam (tuned) | `joint` (paper) | `joint_resplat_v2` |
|---|---|---|---|---|
| DL3DV | 27,78 / 0,880 / 0,183 | 26,94 / 0,860 / 0,213 | **28,96 / 0,895 / 0,157** | 28,95 / **0,895 / 0,157** |
| DTU | 28,91 / 0,899 / 0,309 | **29,32** / 0,892 / 0,328 | 29,30 / **0,900 / 0,307** | 29,31 / 0,899 / 0,309 |
| LLFF | 22,73 / 0,730 / 0,357 | 20,97 / 0,659 / 0,446 | 24,61 / 0,768 / 0,300 | **24,63 / 0,771 / 0,299** |
| Mip-NeRF 360 | 25,62 / **0,716** / 0,372 | 24,38 / 0,663 / 0,432 | 25,73 / 0,714 / 0,368 | **25,75** / 0,715 / **0,367** |

Nota del autor: los numeros de `joint_resplat_v2` se evaluan con ajustes de renderizado de ReSplat (`eps2d=0,1`) y no son comparables con la tabla del paper (`eps2d=0,3`).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Depende del numero de gaussianas y de la resolucion de renderizado, no de un tamano fijo de parametros del modelo.
- GPU recomendadas: no especificadas por el autor; al ser un pipeline de 3DGS con PyTorch, se espera compatibilidad con GPUs NVIDIA con soporte CUDA, pero no se confirma en la documentacion disponible.
- Capacidad en GPU de consumo: no confirmada en la informacion disponible.
- Opciones de despliegue: el codigo es PyTorch (repositorio `autonomousvision/learn2splat` en GitHub); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: se menciona un runtime de referencia de 4000 pasos de Adam y un refinamiento de ReSplat de aproximadamente 0,5 s para 4 pasos, pero no se proporcionan cifras de latencia absoluta por imagen ni throughput.

## Comparativa con modelos similares

| Modelo | Tipo | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|
| Learn2Splat | Optimizador aprendido para 3DGS | Regla de actualizacion neuronal, zero-shot | CC-BY-4.0 | Hugging Face y GitHub |
| Adam / Adam ajustado | Optimizador manual | Regla fija con hiperparametros | No aplica | Estandar en PyTorch |
| ReSplat (Xu et al., 2025) | Inicializador y refinamiento para 3DGS con vistas dispersas | Red de inicializacion y pasos de refinamiento | no disponible en la informacion proporcionada | `haofeixu/resplat` en Hugging Face |

No se dispone de datos de parametros, contexto ni rendimiento de alternativas adicionales en la informacion proporcionada. La comparativa cuantitativa disponible se limita a las tablas de benchmarks frente a Adam, Adam ajustado y ReSplat.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no debe evaluarse con criterios de LLM (contexto, idiomas, tool calling, alucinacion textual).
- Los numeros de `joint_resplat_v2` no son comparables con la tabla del paper por diferencias en ajustes de renderizado (`eps2d=0,1` frente a `eps2d=0,3`); mezclar cifras de ambas fuentes induce a error.
- El rendimiento depende del inicializador: `joint_resplat_v2` requiere ReSplat-Base y `joint` se entreno con `resplat_init`; usar inicializaciones distintas puede degradar los resultados.
- La evaluacion se limita a benchmarks academicos (DL3DV, RE10K, DTU, LLFF, Mip-NeRF 360); no se documenta comportamiento en dominios industriales o capturas con condiciones adversas.
- No se detallan sesgos, riesgos de alucinacion ni limitaciones de contexto o idioma porque no aplican al dominio, pero tampoco se documentan sesgos de dataset en la informacion disponible.
- Licencia CC-BY-4.0: permite uso comercial con atribucion; es necesario citar el paper y respetar los terminos de los checkpoints de terceros (ReSplat) que se cargan como dependencia.
- El repositorio tiene 0 descargas y 2 likes en el momento de la consulta, lo que sugiere adopcion temprana y poca validacion externa independiente.
- No se documentan requisitos de hardware ni latencias absolutas, lo que dificulta planificar despliegues en produccion sin pruebas propias.

## Enlaces

- Hugging Face: https://huggingface.co/autonomousvision/learn2splat
- Pagina del proyecto: https://autonomousvision.github.io/learn2splat/
- Paper (Learn2Splat): https://arxiv.org/abs/2605.15760
- Paper (ReSplat): https://arxiv.org/abs/2510.08575
- Codigo: https://github.com/autonomousvision/learn2splat
- README del codigo: https://github.com/autonomousvision/learn2splat#readme
- Model zoo: https://huggingface.co/autonomousvision/learn2splat/blob/main/MODEL_ZOO.md
- Checkpoint ReSplat: https://huggingface.co/haofeixu/resplat

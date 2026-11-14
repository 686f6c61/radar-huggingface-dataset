# BudgetAny/Budget3D-Idol

## Resumen

Budget3D-Idol es un ajuste fino (fine-tune) de speridlabs/idol, un generador de Gaussian splats 3D a partir de una sola imagen. Lo desarrolla BudgetAny, una iniciativa comunitaria de reimplementacion y extension de la idea de tokenizacion adaptativa al computo descrita en el articulo BudgetPix (Kara et al., 2026). El modelo resuelve un problema concreto: permitir que un unico checkpoint opere con distintos presupuestos de tokens en inferencia, de modo que el coste de muestreo se reduce al fusionar en tokens mas gruesos las regiones del latente con menor variacion (empezando por el espacio vacio).

La arquitectura parte del denoiser DiT de Idol, que trabaja sobre 8.192 tokens latentes, y anade los modulos Budget3D que implementan la fusion adaptativa de tokens. El checkpoint publicado contiene el denoiser ajustado (DiT de Idol mas modulos Budget3D) con pesos EMA en fp32, con 378 M de parametros y un tamano de 1,51 GB. Los codificadores de imagen y los decodificadores gaussianos de Idol se reutilizan sin cambios y se descargan por separado desde el repositorio base.

Su relevancia actual radica en que demuestra que la tokenizacion adaptativa al computo, planteada originalmente para difusion de imagenes en espacio de pixeles, se puede trasladar a la generacion image-to-3D. En la practica, el mismo modelo sirve para un abanico de presupuestos (del 100 % al 10 % de los tokens en los informes completos) con aceleraciones medibles y sin reentrenar pesos por cada nivel de calidad. Existe ademas una variante de 5 pasos, BudgetAny/Budget3D-Idol-Turbo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer (DiT) de Idol con modulos Budget3D de tokenizacion adaptativa; decodificacion a Gaussian splats |
| Parametros totales | 378 M (denoiser con modulos Budget3D) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica; opera sobre 8.192 tokens latentes (presupuesto configurable del 6,25 % al 100 %) |
| Tipos de cuantizacion | No disponible (pesos publicados en fp32 EMA; la inferencia optimizada usa bf16 en los bloques transformer y TF32 en el resto) |
| Idiomas soportados | No disponible (modelo de imagen a 3D, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`budget3d_idol.safetensors`, fp32 EMA) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del denoiser de Idol, un diffusion transformer que genera representaciones 3D en forma de Gaussian splats a partir de una unica imagen de entrada. Sobre esa base, Budget3D incorpora modulos de tokenizacion adaptativa: en cada paso de muestreo, las regiones del latente con menor variacion se fusionan en tokens mas gruesos, priorizando el espacio vacio, de forma que el transformer procesa menos tokens cuando el presupuesto es menor. Los codificadores de imagen y los decodificadores gaussianos de Idol no se modifican.

El checkpoint publicado contiene unicamente el denoiser ajustado, con pesos EMA en fp32. El muestreo por defecto emplea 50 pasos Euler con classifier-free guidance de escala 3. La model card no detalla la composicion del dataset de ajuste ni el numero de tokens de entrenamiento, y tampoco indica si se emplearon tecnicas de RLHF o DPO (no aplicables de forma habitual en este tipo de modelo). La innovacion tecnica principal es la posibilidad de elegir el presupuesto de tokens en inferencia con un unico conjunto de pesos, con un modo `--fast` que activa inferencia optimizada (bloques en bf16, TF32, atencion fusionada de cuDNN y torch.compile).

## Capacidades

- Generacion image-to-3D: produce Gaussian splats 3D a partir de una sola imagen de entrada.
- Presupuesto de tokens ajustable en inferencia: `--budget` acepta fracciones de 0,0625 a 1 sobre los 8.192 tokens latentes.
- Fusion adaptativa de tokens: las regiones de baja variacion (espacio vacio primero) se agrupan en tokens mas gruesos para acelerar el muestreo.
- Inferencia optimizada opcional (`--fast`): bloques transformer en bf16, TF32 en el resto, atencion fusionada y torch.compile.
- Salida en formato PLY (`.ply`) con las gaussianas generadas, renderizable en orbitas de camara.
- Variante Turbo de 5 pasos disponible en un repositorio separado (BudgetAny/Budget3D-Idol-Turbo).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un modelo puramente visual y 3D.

## Casos de uso

- Prototipado rapido de assets 3D: a partir de una foto o ilustracion se obtiene un splat 3D en segundos con presupuestos bajos (40-50 %), adecuado para iterar conceptos antes de modelar en detalle.
- Generacion por lotes con coste controlado: con batches de 8 objetos y presupuesto del 50 %, el muestreo baja a 3,18 s por objeto en H100 con inferencia optimizada, lo que permite procesar catalogos grandes en menos tiempo.
- Renderizado de orbitas para previsualizacion: el pipeline incluye la renderizacion de una orbita de 72 fotogramas (3,60 s por objeto), util para generar vistas de producto o fichas interactivas.
- Entornos con VRAM limitada: con presupuesto del 40 % en fp32 la memoria pico de muestreo baja a 10,7 GB, lo que facilita desplegar en GPUs de gama alta para consumo frente a los 14,8 GB del presupuesto completo.
- Investigacion sobre tokenizacion adaptativa: al ser una reimplementacion abierta y no oficial de BudgetPix aplicada a image-to-3D, sirve como base para experimentar con fusion de tokens y comparar curvas de calidad frente a coste.
- Escaneo y digitalizacion de objetos cotidianos: a partir de una unica foto se obtiene una representacion 3D ligera para visores web o experiencias de realidad aumentada, ajustando el presupuesto segun la fidelidad requerida.
- Generacion de contenido para videojuegos o simulacion: los splats resultantes pueden importarse como assets provisionales en motores que soporten Gaussian splatting, acelerando la iteracion de niveles.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks de calidad (PSNR, LPIPS, Chamfer, etc.) frente a otros modelos. Si se documentan mediciones de velocidad y memoria en una NVIDIA H100 80GB HBM3, con 50 pasos Euler, classifier-free guidance 3, batches de 8 objetos e inferencia optimizada (`--fast`):

| Presupuesto | Tokens | Muestreo por objeto | Aceleracion | Memoria pico de muestreo | Extremo a extremo por objeto |
|---:|---:|---:|---:|---:|---:|
| 100 % | 8.192 | 5,67 s | 1,00x | 9,9 GB | 11,80 s |
| 90 % | 7.373 | 5,15 s | 1,10x | 9,6 GB | 10,85 s |
| 80 % | 6.554 | 4,59 s | 1,24x | 9,2 GB | 10,34 s |
| 70 % | 5.734 | 4,10 s | 1,39x | 8,9 GB | 9,64 s |
| 60 % | 4.915 | 3,60 s | 1,58x | 8,5 GB | 9,33 s |
| 50 % | 4.096 | 3,18 s | 1,79x | 8,2 GB | 8,96 s |
| 40 % | 3.277 | 2,66 s | 2,14x | 7,8 GB | 8,62 s |

En precision completa (fp32) y hasta el 10 % de los tokens, con 160 objetos por configuracion:

| Presupuesto | Tokens | Muestreo por objeto | Aceleracion | Memoria pico de muestreo | Extremo a extremo por objeto |
|---:|---:|---:|---:|---:|---:|
| 100 % | 8.192 | 63,44 s | 1,00x | 14,8 GB | 67,60 s |
| 50 % | 4.096 | 32,20 s | 1,97x | 11,4 GB | 36,25 s |
| 20 % | 1.638 | 18,28 s | 3,47x | 9,4 GB | 22,53 s |
| 10 % | 819 | 14,48 s | 4,38x | 8,7 GB | 18,82 s |

La memoria pico incluye unos 4,5 GB de pesos residentes y codificadores de imagen. El tiempo extremo a extremo anade la decodificacion de las gaussianas (2,53 s) y la renderizacion de la orbita de 72 fotogramas (3,60 s), que no dependen del presupuesto.

## Requisitos de hardware

- VRAM estimada: 14,8 GB de memoria pico de muestreo en fp32 con presupuesto completo, que baja a 8,7 GB al 10 % de los tokens; en inferencia optimizada, 9,9 GB al 100 % y 7,8 GB al 40 %.
- GPU de referencia: NVIDIA H100 80GB HBM3 (todas las mediciones publicadas). No se han publicado mediciones en otras GPU.
- GPU para consumo: no disponible; no se documenta el comportamiento en RTX 4090 u otras tarjetas consumer, aunque el rango de memoria pico en fp32 (8,7-14,8 GB) sugiere que podria caber en GPUs con 16 GB o mas, sin datos verificados.
- Opciones de despliegue: repositorio oficial Budget3D (scripts `sample.py`) con libreria `idol`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: 5,67 s por objeto en muestreo al 100 % con inferencia optimizada en H100 (2,66 s al 40 %); en fp32, 63,44 s al 100 % y 14,48 s al 10 %. El tiempo extremo a extremo anade decodificacion y renderizado.

## Comparativa con modelos similares

| Modelo | Parametros | Presupuesto de tokens | Contexto latente | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Budget3D-Idol | 378 M (denoiser) | Configurable (6,25-100 %) | 8.192 tokens | Apache 2.0 | Hugging Face |
| speridlabs/idol (base) | No disponible | Fijo (8.192 tokens) | 8.192 tokens | No disponible en la informacion | Hugging Face |
| BudgetAny/Budget3D-Idol-Turbo | No disponible | Configurable | 8.192 tokens (5 pasos) | No disponible en la informacion | Hugging Face |

No se dispone de datos de otros generadores image-to-3D comparables (por ejemplo, basados en triplanos o NeRF) en la informacion proporcionada, por lo que la comparativa se limita a la familia Idol.

## Limitaciones y advertencias

- Modelo no oficial: es una reimplementacion comunitaria de la idea de BudgetPix y no una release oficial del articulo; las cifras de la model card son mediciones del proyecto, no resultados del paper.
- Calidad a presupuestos bajos: la fusion de tokens prioriza el espacio vacio, pero no se publican metricas de calidad (PSNR, LPIPS, Chamfer) por presupuesto, por lo que el deterioro visual a fracciones bajas no esta cuantificado.
- Dependencia del modelo base: los codificadores de imagen y decodificadores gaussianos se descargan de speridlabs/idol; cambios o retirada de ese repositorio afectan al funcionamiento.
- Sin soporte de lenguaje: no procesa texto, no tiene capacidades multilingues ni de tool calling; los campos de idiomas y contexto conversacional no aplican.
- Sesgos: no documentados en la informacion disponible; al generar 3D a partir de imagenes, hereda los sesgos de los datos visuales de entrenamiento de Idol, no detallados.
- Riesgo de artefactos: la generacion image-to-3D puede producir geometria incompleta o ruido en zonas ocluidas de la imagen de entrada; no se documenta su comportamiento en objetos con transparencias o superficies reflectantes.
- Licencia Apache 2.0 en este checkpoint, pero la licencia del modelo base Idol no se especifica en la informacion disponible; conviene verificarla antes de uso comercial.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, con un unico checkpoint publicado; no hay historial de mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BudgetAny/Budget3D-Idol
- Modelo base: https://huggingface.co/speridlabs/idol
- Variante Turbo: https://huggingface.co/BudgetAny/Budget3D-Idol-Turbo
- Pagina del proyecto: https://budgetany.github.io/budget3d/
- Codigo: https://github.com/BudgetAny/Budget3D
- Articulo BudgetPix: https://arxiv.org/abs/2610.12307
- Organizacion BudgetAny: https://huggingface.co/BudgetAny

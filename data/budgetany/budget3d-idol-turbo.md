# BudgetAny/Budget3D-Idol-Turbo

## Resumen

Budget3D-Idol-Turbo es un modelo de generacion de 3D Gaussian splats a partir de una unica imagen, desarrollado por BudgetAny, un proyecto comunitario de reimplementacion y extension de la idea de tokenizacion adaptativa al computo presentada en el paper BudgetPix. El modelo es un fine-tune de speridlabs/idol-turbo, la destilacion sin guiado en 5 pasos del generador Idol, y su innovacion principal es que un unico checkpoint puede ejecutarse con distintos presupuestos de tokens en inferencia: el usuario elige cuantas de las 8.192 tokens latentes procesa el transformer, y las regiones de menor variacion (espacio vacio primero) se fusionan en tokens mas gruesos para acelerar el muestreo.

El modelo mantiene sin cambios los codificadores de imagen y los decodificadores gaussianos de Idol, y solo modifica el denoiser (un DiT) anadiendo modulos Budget3D y dos expertos LoRA heredados de Idol-turbo. El resultado es un unico conjunto de pesos fp32 EMA de 407 M de parametros y 1,63 GB que sirve para cualquier presupuesto entre el 6,25 % y el 100 % de los tokens, con aceleraciones de hasta 3,22x en el muestreo a costa de calidad.

Es relevante ahora porque demuestra que la tokenizacion adaptativa al computo, planteada originalmente para difusion de imagenes en espacio de pixeles, se puede trasladar a la generacion image-to-3D, permitiendo ajustar el coste de inferencia sin reentrenar ni cambiar de checkpoint. La licencia Apache 2.0 y la disponibilidad del codigo facilitan su experimentacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (denoiser de Idol) con modulos Budget3D de tokenizacion adaptativa y dos expertos LoRA de Idol-turbo |
| Parametros totales | 407 M (denoiser fine-tuneado con modulos Budget3D y LoRA) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; 8.192 tokens latentes densos, reducibles a entre 512 (6,25 %) y 8.192 (100 %) en inferencia; 4.102 tokens de condicionamiento de imagen no reducibles |
| Tipos de cuantizacion | no disponible (pesos distribuidos en fp32 EMA; inferencia optimizada en bf16 para bloques del transformer y TF32 en el resto) |
| Idiomas soportados | no disponible (modelo image-to-3D, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`budget3d_idol_turbo.safetensors`) |

## Arquitectura y entrenamiento

El modelo parte de Idol, un generador de 3D Gaussian splats a partir de una imagen que emplea un transformer de difusion (DiT) sobre 8.192 tokens latentes, con codificadores de imagen y decodificadores gaussianos propios. Sobre Idol-turbo, la variante destilada sin guiado que muestrea en 5 pasos Euler, Budget3D anade modulos de tokenizacion adaptativa que fusionan los tokens latentes de menor variacion (empezando por el espacio vacio) en tokens mas gruesos, de modo que el mismo conjunto de pesos puede ejecutarse con cualquier fraccion del total de tokens. Los dos expertos LoRA de Idol-turbo se conservan en el checkpoint.

El checkpoint contiene los pesos EMA en fp32 del denoiser fine-tuneado, los dos expertos LoRA y los modulos Budget3D; los codificadores de imagen y decodificadores gaussianos se descargan por separado desde speridlabs/idol. No se especifican en la informacion disponible el volumen de datos de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO (no aplicables en un modelo de difusion de este tipo). La innovacion tecnica destacable es la tokenizacion adaptativa al computo trasladada de difusion de imagenes (BudgetPix) a image-to-3D, junto con la inferencia optimizada (`--fast`) que usa bloques en bf16, TF32, atencion fusionada de cuDNN y torch.compile.

## Capacidades

- Generacion de 3D Gaussian splats a partir de una unica imagen de entrada (pipeline image-to-3d).
- Muestreo en 5 pasos Euler sin guiado (destilacion turbo), con salida en formato `.ply`.
- Presupuesto de tokens ajustable en inferencia entre el 6,25 % y el 100 % de los 8.192 tokens latentes, con el mismo checkpoint.
- Fusion adaptativa de regiones de baja variacion (espacio vacio primero) en tokens mas gruesos.
- Generacion de orbitas renderizadas de 72 frames como parte del pipeline de evaluacion.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step (no es un modelo de lenguaje).
- No dispone de capacidades multilingues, de vision general ni de audio; la entrada es una imagen y la salida es geometria 3D gaussiana.

## Casos de uso

- Prototipado rapido de assets 3D: con 5 pasos de muestreo y presupuestos bajos (10-30 % de tokens) se obtienen mallas gaussianas en aproximadamente 0,15-0,22 s de muestreo por objeto en una RTX PRO 6000, adecuado para iterar sobre conceptos antes de un render final a presupuesto completo.
- Generacion por lotes en pipelines de contenido: el modelo procesa lotes de 8 objetos con un pico de memoria de muestreo de 6,0-8,0 GB segun presupuesto, lo que permite encadenar la generacion de muchos objetos en una sola GPU de servidor.
- Captura y digitalizacion de objetos reales: a partir de una foto se obtiene una representacion gaussiana 3D util para catalogos, e-commerce o visores web, usando el presupuesto completo (100 %) cuando la fidelidad es prioritaria.
- Renderizado de orbitas para previsualizacion: el pipeline incluye el render de una orbita de 72 frames (2,25 s por objeto, independiente del presupuesto), util para generar turntables automaticos de productos.
- Investigacion sobre eficiencia en generacion 3D: al ser una implementacion abierta de tokenizacion adaptativa aplicada a image-to-3D, sirve como base para estudiar el compromiso calidad-coste con presupuestos de tokens variables.
- Despliegue en GPUs de gama media para experimentacion: con presupuestos reducidos el pico de memoria de muestreo baja hasta 6,0 GB, lo que abre la puerta a GPUs consumer con suficiente VRAM para el conjunto de pesos y codificadores (aproximadamente 4,6 GB residentes).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (PSNR, LPIPS, Chamfer, etc.) en la informacion disponible. La model card incluye mediciones de velocidad y memoria en una NVIDIA RTX PRO 6000 Blackwell Server Edition, 5 pasos Euler sin guiado, lotes de 8 objetos e inferencia optimizada (`--fast`):

| Presupuesto | Tokens | Muestreo / objeto | Aceleracion | Memoria pico de muestreo | Extremo a extremo / objeto |
|---:|---:|---:|---:|---:|---:|
| 100 % | 8.192 | 0,48 s | 1,00x | 8,0 GB | 3,64 s |
| 90 % | 7.373 | 0,44 s | 1,09x | 7,8 GB | 3,51 s |
| 80 % | 6.554 | 0,39 s | 1,22x | 7,5 GB | 3,45 s |
| 70 % | 5.734 | 0,35 s | 1,36x | 7,3 GB | 3,37 s |
| 60 % | 4.915 | 0,31 s | 1,52x | 7,1 GB | 3,25 s |
| 50 % | 4.096 | 0,27 s | 1,74x | 6,9 GB | 3,27 s |
| 40 % | 3.277 | 0,25 s | 1,95x | 6,6 GB | 3,39 s |
| 30 % | 2.458 | 0,22 s | 2,21x | 6,4 GB | 3,21 s |
| 20 % | 1.638 | 0,17 s | 2,74x | 6,2 GB | 3,15 s |
| 10 % | 819 | 0,15 s | 3,22x | 6,0 GB | 3,23 s |

El pico de memoria incluye unos 4,6 GB de pesos y codificadores residentes. El tiempo extremo a extremo anade el decodificado de gaussianas (0,92 s) y el render de la orbita de 72 frames (2,25 s), que no dependen del presupuesto. La aceleracion es menor que el ahorro de tokens porque cada secuencia lleva ademas 4.102 tokens de condicionamiento de imagen que el presupuesto no reduce. A 100 % el modelo cuesta lo mismo que el Idol-turbo original en el mismo ajuste (0,47 s por objeto, mediana). Los informes completos estan en `perf/` del repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Presupuesto de tokens | Pasos de muestreo | Licencia |
|---|---|---|---|---|---|
| Budget3D-Idol-Turbo | 407 M (denoiser) | Image-to-3D con tokenizacion adaptativa, fine-tune de Idol-turbo | Ajustable (6,25-100 %) | 5 | Apache 2.0 |
| speridlabs/idol-turbo | no disponible | Image-to-3D, destilacion turbo de Idol | Fijo (100 %) | 5 | no disponible |
| speridlabs/idol | no disponible | Image-to-3D con 3D Gaussian splats | Fijo (100 %) | 50 | no disponible |
| BudgetAny/Budget3D-Idol | no disponible | Image-to-3D con tokenizacion adaptativa, fine-tune de Idol | Ajustable | 50 | Apache 2.0 |

No se dispone de datos de rendimiento comparativo (calidad) entre estos modelos en la informacion proporcionada. Las diferencias documentadas se limitan al numero de pasos de muestreo y a la presencia o no de presupuesto de tokens ajustable.

## Limitaciones y advertencias

- Implementacion no oficial: es una reimplementacion y extension comunitaria de la idea de BudgetPix; no es un lanzamiento oficial del paper ni de sus autores, y BudgetAny no es una empresa ni un laboratorio.
- El paper original cubre solo difusion de imagenes en espacio de pixeles; la aplicacion a image-to-3D es una extension realizada por este proyecto, y las cifras de la model card son mediciones propias, no resultados del paper.
- No se han publicado metricas de calidad (fidelidad geometrica, textura, similitud con la imagen de entrada) en la informacion disponible; la reduccion del presupuesto de tokens degrada la calidad de forma no cuantificada en la ficha.
- La aceleracion esta limitada por los 4.102 tokens de condicionamiento de imagen, que no se reducen con el presupuesto.
- Dependencia de pesos externos: los codificadores de imagen y decodificadores gaussianos se descargan de speridlabs/idol, por lo que el despliegue requiere acceso a ese repositorio.
- Requiere el codigo de github.com/BudgetAny/Budget3D y una configuracion especifica (libreria `idol`, inferencia optimizada con cuDNN y torch.compile) para reproducir las cifras de rendimiento.
- Riesgo de sesgos y alucinacion geometrica: al ser un modelo de difusion entrenado sobre un dataset no documentado en la informacion disponible, puede generar geometrias o texturas plausibles pero incorrectas en objetos fuera de distribucion.
- No procesa lenguaje ni soporta tool calling; no es adecuado para tareas de texto, razonamiento o agentes.
- Uso comercial permitido bajo Apache 2.0, pero sin garantias del autor; verificar la licencia de los componentes descargados desde speridlabs/idol antes de un despliegue en produccion.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y el tech report asociado esta anunciado como "coming soon"; la validacion externa es practicamente inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BudgetAny/Budget3D-Idol-Turbo
- Pagina del proyecto: https://budgetany.github.io/budget3d/
- Codigo: https://github.com/BudgetAny/Budget3D
- Paper BudgetPix: https://arxiv.org/abs/2610.12307
- Organizacion BudgetAny: https://huggingface.co/BudgetAny
- Modelo base Idol-turbo: https://huggingface.co/speridlabs/idol-turbo
- Modelo Idol: https://huggingface.co/speridlabs/idol
- Variante de 50 pasos: https://huggingface.co/BudgetAny/Budget3D-Idol
- Perfil del autor del paper (Ozgur Kara): https://karaozgur.com/

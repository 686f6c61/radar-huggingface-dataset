# BudgetAny/Budget3D-Idol-Turbo

## Resumen

Budget3D-Idol-Turbo es un modelo de generación de *Gaussian splats* 3D a partir de una sola imagen, publicado por BudgetAny, un proyecto comunitario de reimplementación y extensión de la idea de *tokenización adaptativa al cómputo* del artículo BudgetPix (Kara et al., 2026). Se trata de un *fine-tune* de speridlabs/idol-turbo, la destilación sin guiado en 5 pasos del generador imagen-a-3D Idol. La innovación central es que un único *checkpoint* permite elegir en inferencia cuántos de los 8.192 tokens latentes procesa el transformer: las regiones con menor variación latente (empezando por el espacio vacío) se fusionan en tokens más gruesos, reduciendo tiempo y memoria sin cambiar los pesos.

El modelo conserva sin modificar los codificadores de imagen y los decodificadores gaussianos de Idol, y añade los módulos Budget3D sobre el denoiser DiT. El resultado es un generador que mantiene la calidad de Idol-turbo al 100 % de tokens y degrada de forma controlada al reducir el presupuesto, con aceleraciones de hasta 3,22× en el muestreo al 10 % de tokens. Es relevante porque ofrece control explícito del compromiso calidad/coste en un pipeline de imagen-a-3D de pocos pasos, sin necesidad de reentrenar por cada presupuesto.

El repositorio contiene un único archivo de pesos de 1,63 GB (407 M de parámetros en fp32 EMA) y reportes de rendimiento medidos en una NVIDIA RTX PRO 6000 Blackwell. La licencia es Apache 2.0 y la librería de inferencia es `idol`. No es una publicación oficial del artículo BudgetPix, sino una extensión independiente del mismo a la tarea imagen-a-3D.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (denoiser de Idol) con dos expertos LoRA de Idol-turbo y modulos Budget3D de tokenizacion adaptativa |
| Parametros totales | 407 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens latentes densos (presupuesto configurable entre 0,0625 y 1,0) + 4.102 tokens de condicionamiento de imagen |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32 EMA; inferencia optimizada en bf16 para bloques del transformer y TF32 en el resto) |
| Idiomas soportados | no disponible (modelo imagen-a-3D, no linguistico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`budget3d_idol_turbo.safetensors`) |

## Arquitectura y entrenamiento

El modelo parte de Idol, un generador de *Gaussian splats* 3D a partir de una imagen que usa un transformer de difusion (DiT) sobre 8.192 tokens latentes, con codificadores de imagen y decodificadores gaussianos separados. Sobre esa base, Budget3D-Idol-Turbo incorpora los módulos de tokenización adaptativa de BudgetPix: en inferencia, los tokens latentes con menor variación (priorizando el espacio vacío) se fusionan en tokens más gruesos, de modo que el transformer procesa una secuencia más corta. Los pesos son los mismos para cualquier presupuesto; no hay *checkpoints* separados por nivel de tokens.

El *fine-tune* se aplica sobre Idol-turbo, la destilación sin guiado en 5 pasos de Idol, lo que permite muestrear con 5 pasos Euler sin *classifier-free guidance*. Los pesos publicados son EMA en fp32 e incluyen el denoiser DiT ajustado, los dos expertos LoRA de Idol-turbo y los módulos Budget3D. Los codificadores de imagen y decodificadores gaussianos se descargan sin cambios desde speridlabs/idol. No se detalla en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO (no aplica en un modelo generativo 3D de este tipo). La innovación destacable es la tokenización adaptativa al cómputo aplicada a imagen-a-3D, una extensión no oficial del método BudgetPix, que el artículo original plantea solo para difusión de imágenes en espacio de píxeles.

## Capacidades

- Generación de *Gaussian splats* 3D a partir de una única imagen de entrada (pipeline `image-to-3d`).
- Muestreo en 5 pasos Euler sin guiado (*guidance-free distillation*).
- Presupuesto de tokens configurable en inferencia (`--budget` de 0,0625 a 1,0), con el mismo *checkpoint* para todos los niveles.
- Fusión adaptativa de tokens latentes de baja variación (espacio vacío primero) para acelerar el muestreo.
- Inferencia optimizada opcional (`--fast`) con bf16 en bloques del transformer, TF32, atención fusionada cuDNN y `torch.compile`.
- Salida en formato PLY de *splats* gaussianos, renderizable en órbitas de 72 fotogramas.
- No soporta *tool calling*, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo generativo 3D, no un LLM.

## Casos de uso

- Prototipado rápido de activos 3D: a partir de una foto de producto se genera un *splat* gaussiano en unos 3,2-3,6 s por objeto (con renderizado de órbita incluido) en una RTX PRO 6000, adecuado para iterar conceptos en un pipeline de diseño.
- Catálogos de e-commerce: generar vistas 3D navegables de productos desde una sola imagen, ajustando el presupuesto de tokens para priorizar velocidad en previsualizaciones y calidad en la ficha final.
- Realidad aumentada y virtual: crear representaciones 3D ligeras de objetos para su visualización en visores AR/VR, donde los *splats* gaussianos ofrecen renderizado en tiempo real.
- Generación masiva por lotes: con presupuestos bajos (10-30 % de tokens) el muestreo baja a 0,15-0,22 s por objeto, útil para poblar escenarios o datasets sintéticos a gran escala.
- Previsualización interactiva en WebUI: el *checkpoint* se integra en la WebUI comunitaria y en el *demo* de Hugging Face Spaces, permitiendo a artistas probar objetos con distintos presupuestos sin reentrenar.
- Investigación en tokenización adaptativa: sirve como referencia para estudiar el compromiso calidad/cómputo en difusión 3D, comparando contra el modelo base Idol-turbo al 100 % de tokens.
- Reconstrucción de objetos para simulación: generar mallas/*splats* de objetos físicos a partir de capturas fotográficas para entornos de simulación o robótica, donde el control de memoria (6,0-8,0 GB de pico en muestreo) permite desplegar en GPUs de gama media.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (PSNR, LPIPS, Chamfer, etc.) en la información disponible. Los datos aportados son de velocidad y memoria, medidos en una NVIDIA RTX PRO 6000 Blackwell Server Edition con 5 pasos Euler sin guiado, lotes de 8 objetos e inferencia optimizada (`--fast`):

| Presupuesto | Tokens | Muestreo / objeto | Aceleracion | Memoria pico de muestreo | Extremo a extremo / objeto |
|---:|---:|---:|---:|---:|---:|
| 100 % | 8.192 | 0,48 s | 1,00× | 8,0 GB | 3,64 s |
| 90 % | 7.373 | 0,44 s | 1,09× | 7,8 GB | 3,51 s |
| 80 % | 6.554 | 0,39 s | 1,22× | 7,5 GB | 3,45 s |
| 70 % | 5.734 | 0,35 s | 1,36× | 7,3 GB | 3,37 s |
| 60 % | 4.915 | 0,31 s | 1,52× | 7,1 GB | 3,25 s |
| 50 % | 4.096 | 0,27 s | 1,74× | 6,9 GB | 3,27 s |
| 40 % | 3.277 | 0,25 s | 1,95× | 6,6 GB | 3,39 s |
| 30 % | 2.458 | 0,22 s | 2,21× | 6,4 GB | 3,21 s |
| 20 % | 1.638 | 0,17 s | 2,74× | 6,2 GB | 3,15 s |
| 10 % | 819 | 0,15 s | 3,22× | 6,0 GB | 3,23 s |

La memoria pico incluye unos 4,6 GB de pesos y codificadores residentes. El tiempo extremo a extremo añade 0,92 s de decodificación de gaussianos y 2,25 s de renderizado de una órbita de 72 fotogramas, que no dependen del presupuesto. Al 100 % el modelo cuesta lo mismo que Idol-turbo original en el mismo ajuste (0,47 s por objeto, mediana). La aceleración es menor que el ahorro de tokens porque cada secuencia arrastra 4.102 tokens de condicionamiento de imagen que el presupuesto no acorta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto (tokens latentes) | Pasos de muestreo | Presupuesto adaptable | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Budget3D-Idol-Turbo | 407 M | 8.192 (0,0625-1,0 configurable) | 5 | Si | Apache 2.0 | Hugging Face + codigo en GitHub |
| speridlabs/idol-turbo (base) | no disponible | 8.192 fijos | 5 | No | no disponible | Hugging Face |
| BudgetAny/Budget3D-Idol | no disponible | 8.192 (configurable) | 50 | Si | no disponible | Hugging Face |
| speridlabs/idol | no disponible | 8.192 fijos | 50 | No | no disponible | Hugging Face |

No se dispone de datos de benchmarks de calidad para comparar el rendimiento de estos modelos; la comparación se limita a parámetros, presupuesto de tokens, pasos y licencia.

## Limitaciones y advertencias

- Implementación no oficial: es una reimplementación comunitaria del método BudgetPix, no una publicación de los autores del artículo; los números son mediciones del proyecto, no resultados del *paper*.
- El artículo BudgetPix cubre solo difusión de imágenes en espacio de píxeles; la aplicación a imagen-a-3D es una extensión propia sin validación por pares publicada.
- No hay benchmarks de calidad 3D (PSNR, LPIPS, Chamfer) en la información disponible; la degradación de calidad al reducir el presupuesto no está cuantificada más allá de los vídeos de ejemplo.
- La aceleración está limitada por los 4.102 tokens de condicionamiento de imagen, que no se reducen con el presupuesto.
- Los pesos se publican en fp32 EMA (1,63 GB); no se documentan cuantizaciones GGUF u otras, lo que limita el despliegue en GPUs de muy baja VRAM.
- Las mediciones de velocidad y memoria se han hecho en una sola GPU (RTX PRO 6000 Blackwell) con lotes de 8; el rendimiento en otras GPUs no está documentado.
- Riesgo de artefactos y alucinación geométrica inherente a la generación 3D desde una sola vista: partes oclusas del objeto se infieren, no se observan.
- Sesgos del dataset de entrenamiento (Dome-Objaverse e imágenes de Idol) pueden afectar a la diversidad de objetos y categorías representadas.
- Aunque la licencia es Apache 2.0, conviene verificar las licencias de los componentes descargados de speridlabs/idol y del dataset de entrenamiento antes de uso comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BudgetAny/Budget3D-Idol-Turbo
- Página del proyecto: https://budgetany.github.io/budget3d/
- Código: https://github.com/BudgetAny/Budget3D
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/hugging-apps/budget3d-idol
- WebUI comunitaria: https://github.com/RetroUpgrade-YouTube/budget3d-webui
- Artículo BudgetPix: https://arxiv.org/abs/2610.12307
- Organización BudgetAny: https://huggingface.co/BudgetAny
- Modelo base Idol-turbo: https://huggingface.co/speridlabs/idol-turbo
- Modelo Idol: https://huggingface.co/speridlabs/idol
- Variante de 50 pasos: https://huggingface.co/BudgetAny/Budget3D-Idol

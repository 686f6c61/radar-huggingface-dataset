# RunningHubAI/rh-qwen-rapid-aio-sfw-v5-checkpoint

## Resumen

rh-qwen-rapid-aio-sfw-v5-checkpoint es un checkpoint de edicion de imagen distribuido por RunningHubAI en Hugging Face. No es un modelo de lenguaje: su pipeline es image-text-to-image y esta pensado para cargarse en ComfyUI, en la plataforma RunningHub o directamente desde Hugging Face. El repositorio contiene un unico fichero de pesos, `Qwen-Rapid-AIO-SFW-v5.safetensors`, de 27.636 MiB (unos 27 GB), dentro de un repositorio de 29,0 GB.

El modelo se presenta como un ajuste fino derivado de Qwen-Edit-2509 a traves del proyecto original `Phr00t/Qwen-Image-Edit-Rapid-AIO`. El sufijo AIO (all-in-one) y el flujo de trabajo en ComfyUI apuntan a un checkpoint consolidado que agrupa en un solo fichero los componentes necesarios para editar imagenes a partir de una imagen de entrada y una instruccion de texto. El sufijo SFW (safe for work) sugiere un filtrado de contenido explicito, aunque la model card no lo confirma de forma explicita.

Su relevancia practica es acotada y hay que ser honesto al respecto: el repositorio acumula 0 descargas y 0 likes en el momento de la consulta, no incluye model card tecnica, no publica licencia concreta ni resultados de evaluacion, y ni siquiera declara el numero de parametros. Se trata, por tanto, de un artefacto de despliegue publicado por una plataforma (RunningHub) en nombre de un autor, util para quien ya trabaje dentro de ese ecosistema y quiera un checkpoint de edicion de imagen listo para cargar, pero sin garantias tecnicas documentadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (checkpoint de difusion para edicion de imagen; derivado de Qwen-Edit-2509 via `Phr00t/Qwen-Image-Edit-Rapid-AIO`) |
| Parámetros totales | no disponible (la model card no publica recuento; el fichero de pesos ocupa 27.636 MiB) |
| Parámetros activos | no aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | no disponible (no aplica ventana de contexto textual en el sentido de un LLM) |
| Tipos de cuantización | no disponible (el repositorio solo publica safetensors; no se listan variantes FP8, GGUF ni INT) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica que se debe seguir la licencia del proyecto original o del upstream, sin especificarla) |
| Formato de pesos | safetensors (fichero unico `Qwen-Rapid-AIO-SFW-v5.safetensors`, 27.636 MiB) |
| Tipo de pipeline | image-text-to-image |
| Tamaño del repositorio | 29,0 GB |
| Plataformas de uso | ComfyUI, RunningHub (nube), Hugging Face |
| Autor / distribuidor | RunningHubAI, en nombre del autor `@T8star-Aix` |
| Versión | v5 |

## Arquitectura y entrenamiento

La informacion disponible no permite reconstruir la arquitectura interna. Lo unico documentado es la cadena de ascendencia: el checkpoint se describe como ajuste fino de Qwen-Edit-2509, canalizado a traves del proyecto `Phr00t/Qwen-Image-Edit-Rapid-AIO`, un "all-in-one" que, segun la convencion de nombres del ecosistema, fusiona en un unico fichero de pesos los componentes que normalmente se cargan por separado en ComfyUI. La model card no detalla que componentes concretos se han consolidado, ni si se ha fusionado el VAE, el codificador de texto o adaptadores de destilacion para pocos pasos de muestreo.

Tampoco hay informacion sobre el proceso de entrenamiento: no se indica numero de tokens o de pares imagen-texto, composicion del dataset, resoluciones de entrenamiento, ni si se emplearon tecnicas de alineacion como RLHF, DPO o destilacion por consistencia. El termino "Rapid" en el nombre, heredado del proyecto original, sugiere una optimizacion orientada a reducir el numero de pasos de inferencia, pero no hay cifras publicadas que lo confirmen. Del mismo modo, "SFW" apunta a un filtrado de contenido explicito, sin que la ficha lo declare formalmente.

## Capacidades

- Edicion de imagen guiada por texto: el pipeline declarado es image-text-to-image, es decir, transformacion de una imagen de entrada siguiendo una instruccion en lenguaje natural.
- Generacion de imagen condicionada por referencia visual y prompt.
- Ejecucion local en ComfyUI, mediante la carga directa del checkpoint en safetensors.
- Ejecucion en nube a traves de la API de RunningHub, sin necesidad de GPU propia.
- Formato de un solo fichero, lo que simplifica el graf de ComfyUI frente a configuraciones multimodulo.
- Filtrado de contenido SFW (inferido del nombre del checkpoint; no confirmado en la documentacion).
- Soporte de tool calling / function calling: no aplica (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues de prompt: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponibles mas alla de la edicion de imagen.

## Casos de uso

- Edicion de producto para comercio electronico: partiendo de una fotografia de catalogo y un prompt del tipo "cambia el fondo por una superficie de marmol blanco y suaviza las sombras", el checkpoint puede producir variantes listas para ficha de producto sin repetir sesion fotografica. Es adecuado porque combina imagen de referencia y texto en un unico paso de inferencia.
- Post-produccion fotografica automatizada: retoques locales guiados por instrucciones (eliminacion de objetos, cambio de color de una prenda, ajuste de iluminacion) dentro de un flujo ComfyUI que procese lotes de imagenes.
- Pre-produccion de campanas de marketing: generacion rapida de variaciones de una misma escena para validar direcciones creativas antes de producir el material definitivo.
- Creacion de assets para prototipado de interfaces e ilustracion: generar mockups y elementos graficos a partir de bocetos o referencias, integrándolos en un pipeline de diseno iterativo.
- Automatizacion sin infraestructura propia: despliegue mediante la API de RunningHub para equipos que quieran incorporar edicion de imagen por prompt en un producto sin mantener GPU dedicada ni gestionar pesos de 27 GB.
- Enriquecimiento de catalogos y archivos historicos: normalizacion de imagenes antiguas (resolucion, fondo, encuadre) mediante instrucciones de texto sobre la imagen original.
- Entornos con politica de contenido estricta: si el filtrado SFW declarado en el nombre es efectivo, el checkpoint encaja en plataformas que necesitan bloquear contenido explicito; conviene verificar este extremo antes de confiar en el.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FID, CLIP score, SSIM, evaluaciones humanas de edicion), ni comparaciones cuantitativas con el modelo base o con alternativas. Tampoco se documentan el numero de pasos de muestreo recomendado, la resolucion de trabajo ni el tiempo de inferencia esperado.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero de pesos ocupa 27.636 MiB (unos 27 GB); cargarlo completo en precision de entrenamiento exige aproximadamente 28 GB de VRAM solo para pesos, y mas de 32 GB una vez se anaden el codificador de texto, el VAE y los buffers de activaciones. Cifra estimada a partir del tamano del fichero, no publicada por el autor.
- GPU recomendadas: A100 (40 GB o 80 GB), H100, L40S (48 GB), RTX 6000 Ada (48 GB) o cualquier acelerador con 40 GB o mas de memoria. Los perfiles de 24 GB (RTX 3090, RTX 4090) no permiten cargar el checkpoint completo sin offloading ni cuantizacion.
- GPU de consumo: no cabe en tarjetas de 24 GB ni inferiores sin recurrir a offloading a RAM del sistema o a cuantizacion, y el repositorio no publica variantes cuantizadas.
- Requisitos de disco: 29,0 GB de repositorio y 27.636 MiB por el fichero de pesos.
- Opciones de despliegue: ComfyUI (local, con el checkpoint en safetensors) y RunningHub (nube, con API documentada). vLLM, llama.cpp, Ollama y TGI no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. El nombre "Rapid" sugiere un muestreo con pocos pasos, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| rh-qwen-rapid-aio-sfw-v5-checkpoint | no disponible | no aplica | safetensors (27.636 MiB) | no disponible | Hugging Face, ComfyUI, RunningHub | 0 descargas y 0 likes en el momento de la consulta; sin benchmarks |
| Phr00t/Qwen-Image-Edit-Rapid-AIO (proyecto original) | no disponible | no aplica | no disponible | no disponible | Hugging Face | Fuente directa de este ajuste fino; la model card remite a el |
| Qwen-Edit-2509 (modelo base) | no disponible | no aplica | no disponible | no disponible | Hugging Face | Base declarada del ajuste fino |

No se dispone de datos de rendimiento comparados entre estas opciones, por lo que la comparacion se limita a la procedencia y al formato de distribucion. Para una evaluacion real seria necesario ejecutar los tres modelos con los mismos pares de imagen y prompt.

## Limitaciones y advertencias

- Ausencia de model card tecnica: no se documentan arquitectura, parametros, datos de entrenamiento, resolucion de trabajo ni pasos de muestreo recomendados.
- Licencia sin especificar: la ficha remite a la licencia del proyecto original o del upstream sin nombrarla. Esto impide determinar si el uso comercial esta permitido; hay que consultar la cadena upstream antes de desplegarlo en produccion.
- Riesgo de alucinacion visual: como cualquier modelo de edicion generativa, puede introducir cambios no solicitados, deformar rostros, manos o texto, y alterar zonas que el usuario esperaba intactas. No hay evaluaciones publicadas que acoten esta tasa de error.
- Idiomas de prompt no declarados: se desconoce que lenguas maneja correctamente el codificador de texto del modelo base.
- Filtrado SFW no verificado: el sufijo del nombre sugiere un filtrado de contenido explicito, pero la documentacion no lo confirma ni describe su alcance.
- Trazabilidad limitada: repositorio con 0 descargas y 0 likes, publicado por una plataforma en nombre de un autor, sin historial de validacion por parte de la comunidad.
- Anomalia en los metadatos: la fecha de creacion registrada es 2026-09-24, posterior a la fecha habitual de publicacion de modelos de esta familia; conviene tratarla como un posible error de metadatos y no como una fecha fiable.
- Coste de despliegue elevado: 27,6 GB de pesos en un unico fichero hacen inviable la inferencia en GPUs de consumo sin offloading o cuantizacion, y el repositorio no ofrece versiones reducidas.
- Dependencia del ecosistema: esta pensado para ComfyUI y RunningHub; su uso fuera de esos entornos no esta documentado.

## Enlaces

- Ficha en Hugging Face: https://huggingface.co/RunningHubAI/rh-qwen-rapid-aio-sfw-v5-checkpoint
- Proyecto original (Phr00t/Qwen-Image-Edit-Rapid-AIO): https://huggingface.co/Phr00t/Qwen-Image-Edit-Rapid-AIO
- RunningHub (sitio internacional): https://www.runninghub.ai
- RunningHub (sitio para China): https://www.runninghub.cn
- Documentacion de la API (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Pagina de entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- Pagina del modelo en RunningHub: https://www.runninghub.cn/model/public/1978075102338240514
- Perfil del autor (@T8star-Aix): https://www.runninghub.cn/user-center/1819214514410942465

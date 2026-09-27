# FINAL-Bench/POCKET-Zimage-CPU

## Resumen

POCKET-Zimage-CPU es una distribucion cuantizada en formato GGUF del modelo de difusion texto-a-imagen Tongyi-MAI/Z-Image-Turbo, empaquetada por el usuario FINAL-Bench para ejecutarse exclusivamente en CPU, sin GPU, sin CUDA y sin entorno Python. El objetivo declarado por el autor es cubrir un hueco concreto: la mayoria de los modelos de generacion de imagenes asumen disponibilidad de acelerador grafico, mientras que la mayoria de los equipos del mundo no lo tienen. Con un unico binario de stable-diffusion.cpp y tres ficheros, un PC de oficina genera una imagen fotorrealista de 512x512 en menos de un minuto.

El modelo pesa 6.154.908.736 parametros (unos 6,15 mil millones) y el repositorio ocupa 3,5 GB en disco. La build esta pensada para cuantizacion Q4_0 y emplea atencion flash (`--fa`) y VAE tiling (`--vae-tiling`) para reducir el consumo de memoria. La licencia es Apache 2.0, heredada del modelo base, lo que permite uso comercial.

Su relevancia actual radica en el nicho de despliegue en el borde y en entornos sin acelerador: servidores sin GPU, portatiles modestos, maquinas aisladas sin Python y aplicaciones de escritorio distribuidas como binario autonomo. Es una build de inferencia, no un modelo nuevo: no introduce arquitectura propia, sino una receta de empaquetado y parametros de ejecucion medidos y publicados por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de difusion texto-a-imagen, pipeline `text-to-image`) |
| Parametros totales | 6.154.908.736 (≈6,15 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (generacion de imagenes) |
| Tipos de cuantizacion | GGUF Q4_0 (unico formato verificado en las mediciones del autor) |
| Idiomas soportados | no disponible; se documentan prompts en ingles y en coreano |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF, ejecutado con el runtime stable-diffusion.cpp |
| Modelo base | Tongyi-MAI/Z-Image-Turbo |
| Tamano del repositorio | 3,5 GB |
| Resoluciones soportadas | 512x512 (por defecto) y 1024x1024 (medida) |
| Pasos de muestreo | 3 por defecto; 4 medido sin ganancia visible |
| Descargas / likes | 76 descargas, 41 likes |

## Arquitectura y entrenamiento

No hay informacion en la documentacion proporcionada sobre la arquitectura interna del modelo base (tipo de backbone, numero de bloques, mecanismo de atencion, text encoder o VAE empleados), ni sobre el dataset de entrenamiento, el numero de tokens de imagen-texto o si hubo fases de RLHF o DPO. Lo unico verificable es que se trata de un modelo de difusion texto-a-imagen publicado bajo el pipeline `text-to-image` y que el modelo base es Z-Image-Turbo, de Tongyi-MAI, descrito por su repositorio oficial como un modelo destilado para muestreo con pocos pasos.

La innovacion de esta build no esta en el modelo, sino en la receta de ejecucion. El autor documenta un proceso de optimizacion medido paso a paso sobre hardware de CPU: partiendo de 244 segundos con la configuracion por defecto (20 pasos), se llega a 46,4 segundos aplicando cuatro cambios acumulativos. El primero y mas importante es reducir el numero de pasos de 20 a 4 (62,1 s), ya que Z-Image-Turbo esta destilado para pocos pasos y el valor por defecto desaprovecha esa caracteristica. Despues se activa atencion flash (59,5 s), se baja a 3 pasos (48,6 s) y finalmente se activa VAE tiling (46,4 s), que ademas reduce el pico de RAM de 8,00 GB a 6,42 GB. El autor indica que 3 pasos es el suelo practico: a 4 y 3 pasos no aprecia diferencias visibles en las muestras publicadas.

## Capacidades

- Generacion de imagenes fotorrealistas a partir de prompts de texto, con 512x512 como resolucion por defecto y 1024x1024 soportada.
- Inferencia exclusiva en CPU: no requiere GPU, ni CUDA, ni entorno Python; el autor la presenta como "un binario, tres ficheros".
- Muestreo con pocos pasos (3 pasos por defecto) gracias a la destilacion del modelo base.
- Atencion flash (`--fa`) y VAE tiling (`--vae-tiling`) como opciones de runtime para acelerar y reducir memoria.
- Prompts en coreano con coste temporal practicamente nulo: 45,3 s frente a 46,4 s en la misma resolucion y semilla.
- Ejecucion local y offline, sin dependencia de servicios en la nube, lo que la hace apta para entornos aislados.
- Demo publica alojada en un Hugging Face Space que genera sobre una maquina sin GPU.
- Capacidad de generar en lote sobre hardware de CPU, si bien el rendimiento por imagen es de decenas de segundos.
- No se documentan capacidades de edicion de imagen, inpainting, outpainting, control de estructura (ControlNet) ni generacion de video.

## Casos de uso

- Generacion de imagenes en equipos de oficina sin tarjeta grafica: un PC estandar con unos 8 GB de RAM libre ejecuta el binario de stable-diffusion.cpp y obtiene una imagen de 512x512 en unos 46 segundos, sin instalar CUDA ni Python.
- Prototipado de prompts en entornos aislados (air-gapped): al ser un binario autonomo con pesos GGUF locales, se puede desplegar en redes sin salida a internet ni acceso a repositorios de paquetes.
- Previsualizacion rapida antes de un render final en GPU: la build de CPU sirve para iterar sobre el prompt y la composicion a 512x512 a coste cero de VRAM, reservando el modelo completo en GPU solo para la version definitiva.
- Distribucion como aplicacion de escritorio: al no requerir toolchain de Python, el binario se puede empaquetar dentro de un instalador para Windows, Linux o macOS junto a los tres ficheros de pesos.
- Procesamiento por lotes en granjas de CPU: en servidores con muchos nucleos (la referencia medida usa 48 hilos) se pueden lanzar varios procesos en paralelo para generar catalogos de imagenes sin ocupar GPU.
- Contenido para audiencias coreanas: el autor documenta que los prompts en coreano no penalizan el tiempo de generacion, lo que permite producir materiales localizados sin un modelo distinto.
- Educacion y demostraciones: el Space publico permite mostrar un modelo de difusion funcionando en CPU, util para docencia o para evaluar la viabilidad del despliegue en el borde sin invertir en hardware.
- Pruebas de concepto de generacion local en portatiles modestos: con un pico de RAM de 6,42 GB a 512x512, entra en practicamente cualquier portatil actual con 8 GB o mas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. En concreto, no hay datos de FID, CLIP score, HPSv2 ni comparaciones de calidad frente a otros modelos de generacion de imagenes. Lo que si publica el autor son mediciones de latencia y consumo de memoria de su propia ejecucion, que se reproducen a continuacion.

Mediciones del autor, hardware Intel Xeon Gold 6526Y x2 (32 nucleos / 64 hilos, 48 hilos en uso), cuantizacion Q4_0, 3 pasos, con `--fa --vae-tiling`:

| Resolucion | Tiempo total | Muestreo | VAE | Pico de RAM |
|---|---|---|---|---|
| 512 x 512 | 46,4 s | 32,7 s | 12,5 s | 6,42 GB |
| 512 x 512 (prompt en coreano) | 45,3 s | 32,1 s | 12,0 s | 6,42 GB |
| 1024 x 1024 | 192,7 s | 135,1 s | 55,8 s | 6,76 GB |

Proceso de optimizacion documentado por el autor (misma maquina, Q4_0):

| Cambio aplicado | Tiempo | Pico de RAM |
|---|---|---|
| Configuracion por defecto (20 pasos) | 244 s | 8,16 GB |
| Reducir a 4 pasos | 62,1 s | 8,16 GB |
| Activar `--fa` (atencion flash) | 59,5 s | 8,18 GB |
| Reducir a 3 pasos | 48,6 s | 8,00 GB |
| Activar `--vae-tiling` | 46,4 s | 6,42 GB |

El autor indica que estas cifras provienen de una unica ejecucion por fila, por lo que no incluyen intervalo de confianza ni repeticiones.

## Requisitos de hardware

- GPU: no requerida en absoluto. Cero GPU en todas las mediciones publicadas.
- VRAM: no aplica; no se usa memoria de tarjeta grafica.
- Memoria RAM: pico de 6,42 GB a 512x512 y 6,76 GB a 1024x1024 con Q4_0. Se recomienda un margen adicional de 2-4 GB para el sistema operativo y el resto de procesos.
- Espacio en disco: 3,5 GB para el repositorio de pesos.
- CPU de referencia: Intel Xeon Gold 6526Y x2, 32 nucleos / 64 hilos, con 48 hilos utilizados. El rendimiento escala con el numero de hilos disponibles; el autor no publica mediciones sobre otras CPU.
- CPU de consumo: no se publican medidas sobre procesadores de escritorio o portatiles convencionales, por lo que no es posible estimar tiempos en un Ryzen o Core i5/i7 sin extrapolar. El requisito practico es disponer de unos 8 GB de RAM y varias decenas de nucleos o hilos para acercarse a las cifras publicadas.
- Opciones de despliegue: runtime stable-diffusion.cpp con pesos GGUF (opciones `--fa` y `--vae-tiling`). No se mencionan Ollama, vLLM, TGI ni llama.cpp en la informacion disponible; el autor solo cita stable-diffusion.cpp. Existe ademas un Hugging Face Space publico para probarlo sin instalar nada.
- Latencia medida: 46,4 s por imagen de 512x512 y 192,7 s por imagen de 1024x1024 en el hardware de referencia. No se publica throughput agregado en generaciones por segundo ni por lote.

## Comparativa con modelos similares

La informacion disponible solo permite comparar con el modelo base y con la variante NF4 del mismo autor. No hay datos de rendimiento de las alternativas, por lo que la comparacion se limita a parametros verificables.

| Modelo | Parametros | Entorno de ejecucion | Formato | Licencia |
|---|---|---|---|---|
| POCKET-Zimage-CPU (este) | 6.154.908.736 (≈6,15 B) | CPU exclusivamente, sin CUDA ni Python | GGUF (stable-diffusion.cpp) | Apache 2.0 |
| POCKET-Image-Zimage | no disponible | no disponible (variante NF4, orientada a GPU) | no disponible | no disponible |
| Tongyi-MAI/Z-Image-Turbo (modelo base) | no disponible | no disponible (uso tipico con GPU) | no disponible | no disponible |

Respecto a alternativas de terceros de la misma categoria (generacion texto-a-imagen local, como SDXL o FLUX.1-schnell), no se han encontrado en la busqueda datos comparativos publicados por el autor ni mediciones sobre el mismo hardware, por lo que no se incluyen cifras que no se puedan verificar.

## Limitaciones y advertencias

- No hay resultados de calidad publicados: la documentacion mide tiempos y RAM, pero no FID, CLIP ni evaluaciones humanas, de modo que no es posible afirmar nada sobre la fidelidad al prompt mas alla de las muestras incluidas.
- Las muestras publicadas incluyen un caso con prompt en coreano en el que el modelo "perdio la cuenta" de los objetos, lo que apunta a una adherencia limitada al conteo de elementos.
- La mejora de 4 a 3 pasos no muestra ganancia visible segun el propio autor, pero 3 pasos es el minimo practico; no hay margen documentado por debajo.
- Pasar de 512x512 a 1024x1024 multiplica por mas de cuatro el tiempo de generacion (de 46,4 s a 192,7 s en el hardware de referencia), lo que desaconseja la resolucion alta en flujos interactivos.
- Las cifras de rendimiento provienen de una unica ejecucion por fila sobre un servidor de doble Xeon con 48 hilos, un hardware muy por encima de un PC de oficina o un portatil; los tiempos en equipos de consumo seran previsiblemente superiores y no estan medidos.
- Todos los tiempos estan medidos con cuantizacion Q4_0; no se documenta el impacto de otras cuantizaciones en calidad o velocidad.
- El soporte multilingue no esta especificado como lista de idiomas: solo hay evidencia anecdotica de prompts en ingles y coreano. No hay garantia para el castellano ni para otros idiomas.
- No se documentan capacidades de edicion, inpainting, outpainting, control estructural ni generacion de video.
- No se han publicado datos sobre sesgos del modelo base ni sobre el filtrado del dataset de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Tongyi-MAI/Z-Image-Turbo, ya que esta build es una redistribucion cuantizada de sus pesos.
- Al depender de stable-diffusion.cpp, las capacidades y el rendimiento estan ligados a la evolucion de ese runtime y a las opciones concretas (`--fa`, `--vae-tiling`) empleadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FINAL-Bench/POCKET-Zimage-CPU
- Demo en Hugging Face Space: https://huggingface.co/spaces/FINAL-Bench/POCKET-Zimage-CPU
- Modelo base Tongyi-MAI/Z-Image-Turbo: https://huggingface.co/Tongyi-MAI/Z-Image-Turbo
- Repositorio GitHub de Tongyi-MAI/Z-Image: https://github.com/Tongyi-MAI/Z-Image
- Runtime stable-diffusion.cpp: https://github.com/leejet/stable-diffusion.cpp
- Variante NF4 del mismo autor (POCKET-Image-Zimage): https://huggingface.co/FINAL-Bench/POCKET-Image-Zimage
- Mirror comunitario AI-Joe-git/POCKET-Image-Zimage: https://huggingface.co/AI-Joe-git/POCKET-Image-Zimage
- Coleccion POCKET Models: https://huggingface.co/collections/FINAL-Bench/pocket-models-6a618ee5d23eafb7e185a5c6
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Leaderboard de referencia citado en la busqueda (benchlm.ai): https://benchlm.ai/
- Articulo sobre la familia POCKET en bvrobotics: https://www.bvrobotics.com/pocket-35b-parameter-model.html

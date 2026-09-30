# OzzyGT/taeh3

## Resumen

TAEH3 es un autoencoder diminuto (tiny autoencoder, TAE) que actua como decodificador del espacio latente de video de MiniMax-H3. No es un modelo generativo de lenguaje ni un modelo de difusion completo: es exclusivamente un decodificador de latentes a video, pensado para producir previsualizaciones baratas durante el proceso de denoising. Su funcion es reconstruir fotogramas de video a partir de los latentes que genera MiniMax-H3, de forma mucho mas economica que el VAE completo de H3.

El repositorio OzzyGT/taeh3 no es un modelo entrenado por su autor, sino un espejo (mirror) sin modificar del fichero `taeh3.safetensors` publicado por Ollin Boer Bohan en el repositorio `madebyollin/taehv`. El peso es byte por byte identico al original: no se convirtio, no se cuantizo y no se reentreno. El mirror existe porque el proyecto `OzzyGT/minimax_h3_preview_blocks` descarga este fichero en tiempo de ejecucion para previsualizar las predicciones de MiniMax-H3 mientras se aplica el denoising.

El modelo es extremadamente pequeno (11,3 millones de parametros, unos 22,7 MB en fp16) y su relevancia radica en permitir previsualizaciones por paso a bajo coste computacional, algo clave cuando se trabaja con modelos de video de gran tamano donde decodificar con el VAE completo en cada paso resulta prohibitivo. La licencia es MIT, con copyright de Ollin Boer Bohan (2025).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tiny autoencoder (TAE); decodificador del espacio latente de video de MiniMax-H3 |
| Parametros totales | 11,3 millones (11.3M) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica; no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible; el checkpoint se distribuye en fp16 sin cuantizar |
| Idiomas soportados | no disponible (no aplica; no procesa texto) |
| Licencia | MIT (c) 2025 Ollin Boer Bohan |
| Formato de pesos | safetensors (fp16, 128 tensores, 22.709.752 bytes) |

## Arquitectura y entrenamiento

Se trata de un tiny autoencoder del linaje `taehv` de madebyollin, adaptado especificamente al espacio latente del modelo de video MiniMax-H3 (de ahi el nombre `taeh3`). Su tarea es decodificar latentes normalizados con forma `(N, T, 24, h, w)` a video con forma `(N, F, 3, h*16, w*16)` en el rango [0, 1]. El decodificador respeta el troceado (chunking) propio de H3: `5 * n + 2` fotogramas latentes se decodifican a `17 * n + 5` fotogramas de video, el mismo recuento que produce el VAE completo.

No hay informacion disponible sobre el proceso de entrenamiento en la documentacion proporcionada (numero de tokens, composicion del dataset, uso de RLHF/DPO, etc.). Lo unico documentado es que este repositorio es un espejo sin modificaciones: no se reentreno ni se ajusto nada. Se conoce la procedencia exacta (commit `62f7591` del repositorio `madebyollin/taehv`) y el hash de integridad `sha256 4fd022bfcab08772fe0536b17ea1a3bbb5625be11e397868d1c5d891863d4c13`.

Una innovacion practica relevante es la decodificacion por chunks con dos modos: `parallel=False` decodifica fotograma a fotograma (bajo consumo de memoria), mientras que `parallel=True` mantiene las activaciones de todos los fotogramas a la vez (unos 25 GB para 209 fotogramas a 768x1344) y, segun la model card, no es mas rapido. Esto hace del modo secuencial la opcion por defecto sensata.

## Capacidades

- Decodificacion de latentes de video: convierte latentes normalizados de MiniMax-H3 en fotogramas de video RGB.
- Previsualizacion por paso: permite ver la evolucion del denoising de MiniMax-H3 de forma economica, decodificando el clip completo de latentes a un coste muy inferior al del VAE completo.
- Respeto del troceado nativo de H3: mantiene la correspondencia `5 * n + 2` latentes -> `17 * n + 5` fotogramas.
- Dos modos de decodificacion: secuencial (`parallel=False`) y paralelo (`parallel=True`).
- No es un modelo de lenguaje: no genera texto, no hace razonamiento, no soporta tool calling ni agentes.
- No dispone de capacidades multilingues, sino de vision (decodificacion de video).
- No se documenta soporte de audio ni de otras modalidades.

## Casos de uso

- Previsualizacion durante el denoising de MiniMax-H3: decodificar los latentes intermedios en cada paso para ver como evoluciona el video sin pagar el coste del VAE completo en cada iteracion.
- Integracion en pipelines de generacion de video: usar el TAE como decodificador ligero dentro de un flujo de inferencia de MiniMax-H3 para obtener resultados rapidos en fase de prototipado.
- Herramientas de depuracion de latentes: inspeccionar visualmente la representacion latente en puntos concretos del proceso, util para investigacion sobre espacios latentes de video.
- Interfaces interactivas de generacion de video: alimentar una UI de previsualizacion en tiempo casi real, gracias al bajo coste por fotograma del modo secuencial.
- Ahorro de VRAM en entornos limitados: decodificar fotograma a fotograma con `parallel=False` para reducir el pico de memoria frente al decodificador completo.
- Investigacion sobre autoencoders de video: servir como referencia reproducible (hash y procedencia documentados) para comparar tiny autoencoders frente a VAEs completos en tareas de reconstruccion.
- Dependencia de otro proyecto: el repositorio `OzzyGT/minimax_h3_preview_blocks` lo descarga en tiempo de ejecucion, por lo que este mirror da soporte directo a ese pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (PSNR, SSIM, LPIPS ni similares) ni comparaciones cuantitativas frente al VAE completo de MiniMax-H3. Unicamente se afirma de forma cualitativa que decodifica "mucho mas barato" que el VAE completo, sin cifras concretas.

## Requisitos de hardware

- VRAM para los pesos: minima. 11,3 millones de parametros en fp16 ocupan aproximadamente 22,7 MB, por lo que los pesos caben en cualquier GPU, incluida una integrada.
- Modo secuencial (`parallel=False`): decodifica fotograma a fotograma y mantiene un consumo de memoria bajo; es la opcion recomendada para GPUs con poca VRAM.
- Modo paralelo (`parallel=True`): retiene las activaciones de todos los fotogramas simultaneamente, del orden de 25 GB para 209 fotogramas a 768x1344, por lo que exige GPUs de gran memoria (por ejemplo, A100 40/80 GB, H100, o varias GPUs). Segun la model card, no es mas rapido que el modo secuencial.
- GPU consumer: si, cabe con holgura en cualquier GPU consumer actual (RTX 3060, RTX 4090, etc.), especialmente en modo secuencial.
- El ejemplo de la model card usa `.cuda().half().eval()`, es decir, fp16 sobre GPU CUDA.
- Opciones de despliegue: integracion via Python con `huggingface_hub` y `taehv.py` del repositorio upstream; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplica, al no ser un modelo de lenguaje).
- Latencia y throughput: no disponibles como cifras concretas; solo se indica que el modo paralelo no aporta velocidad frente al secuencial.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Latentes | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OzzyGT/taeh3 | Tiny autoencoder (decodificador) | 11,3 M | MiniMax-H3 | MIT | HuggingFace (mirror) |
| VAE completo de MiniMax-H3 | VAE de video completo | no disponible | MiniMax-H3 | no disponible | dentro del pipeline de MiniMax-H3 |
| Otros taehv (madebyollin) | Tiny autoencoders | no disponible en la informacion | otros espacios latentes | MIT | GitHub (`madebyollin/taehv`) |

El comparador natural es el VAE completo de MiniMax-H3: el TAE produce el mismo numero de fotogramas por el mismo troceado, pero a un coste muy inferior, a cambio de una calidad de reconstruccion presumiblemente menor (sin datos objetivos disponibles). Frente a otros tiny autoencoders del mismo autor, comparte linaje y licencia, pero esta especializado en el espacio latente de H3.

## Limitaciones y advertencias

- No es un modelo generativo de proposito general: no genera texto, no razona, no hace codigo ni matematicas. Cualquier expectativa de modelo de lenguaje es inaplicable.
- Calidad de reconstruccion: al ser un tiny autoencoder, se espera una fidelidad inferior a la del VAE completo de MiniMax-H3; no se aportan metricas que cuantifiquen esa diferencia.
- Dependencia externa: para usarlo se necesita `taehv.py` del repositorio upstream, y hay que pasar `arch_name="taeh3"` explicitamente, porque el codigo original infiere la arquitectura a partir del nombre del fichero, que en este mirror es una ruta de cache.
- Modo paralelo costoso en memoria: `parallel=True` requiere del orden de 25 GB para 209 fotogramas a 768x1344 y no es mas rapido; usarlo sin necesidad puede provocar fallos por falta de memoria.
- Sesgos conocidos: no disponibles.
- Riesgo de alucinacion: no aplica como tal (no genera texto), aunque la decodificacion puede introducir artefactos de reconstruccion.
- Restricciones de licencia: MIT, permisiva, permite uso comercial. El copyright corresponde a Ollin Boer Bohan; este repositorio solo aloja una copia.
- Advertencia de disponibilidad: el repositorio figura con 0 descargas, 0 likes y un tamano declarado de 0,0 GB, lo que sugiere que el contenido puede no estar efectivamente alojado o que la informacion de tamano no refleja el fichero de pesos; conviene verificar la integridad (hash `sha256 4fd022...`) antes de depender de el en produccion.
- Aviso de fecha: la fecha de creacion indicada (2026-09-30) es posterior a la del contexto habitual; conviene contrastarla con la fuente real.

## Enlaces

- HuggingFace: https://huggingface.co/OzzyGT/taeh3
- Repositorio upstream (taehv): https://github.com/madebyollin/taehv
- Fichero de pesos original: https://github.com/madebyollin/taehv/blob/main/safetensors/taeh3.safetensors
- Commit de procedencia: https://github.com/madebyollin/taehv/commit/62f7591f59dfbb4c3c02b7a621d180a9eeaba26c
- Proyecto que lo consume: https://huggingface.co/OzzyGT/minimax_h3_preview_blocks

# BiliSakura/GeoCore-9B-diffusers

## Resumen

GeoCore-9B es un modelo de generacion de imagen a partir de texto especializado en imagenes de satelite opticas de 256x256 pixeles, desarrollado por Jeonghyeok Do y Munchurl Kim (KAIST VICLab). A diferencia de los modelos de difusion de proposito general, acepta condicionamiento geoespacial opcional: indice de resolucion (`res`, definido como `17 - z` sobre el zoom XYZ de Google), latitud y longitud. Esto permite dirigir la generacion hacia un rango de escala real (con `res=0` se aproxima a 1,2 m/pixel en el ecuador, y cada incremento de `+1` duplica el GSD) y hacia una localizacion concreta del planeta.

Arquitectonicamente es un Diffusion Transformer (DiT) con flow matching de 9.235.868.416 parametros (9,24 B), compuesto por 8 bloques double-stream y 24 bloques single-stream con dimension oculta 4096 y 32 cabezas de atencion. Se apoya en dos codificadores de texto (CLIP ViT-L/14 y T5-XXL), en el autoencoder `AutoencoderKLFlux2` de Flux.2 y en el planificador `FlowMatchEulerDiscreteScheduler` con `shift=1.0`. La ficha que nos ocupa, `BiliSakura/GeoCore-9B-diffusers`, es una conversion autocontenida al formato Diffusers de los pesos originales publicados en `JeonghyeokDo/GeoCore-9B`.

Su relevancia actual es doble. Por un lado, cubre un nicho poco atendido: la generacion condicionada geograficamente para teledeteccion, util para aumento de datos, simulacion y docencia cuando no hay imagenes reales disponibles. Por otro, es un ejemplo de empaquetado reproducible en Diffusers con `trust_remote_code=True`, que agrupa DiT, VAE y codificadores de texto en un unico repositorio de 28,4 GB. El repositorio de conversion cuenta con 0 descargas y 0 "likes" en el momento de redactar esta ficha, por lo que su validacion por parte de la comunidad es todavia nula.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) con flow matching; 8 bloques double-stream + 24 bloques single-stream, hidden 4096, 32 cabezas |
| Parametros totales | 9.235.868.416 (9,24 B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (viene determinada por CLIP ViT-L/14 y T5-XXL incluidos; la model card no indica el limite de tokens de prompt) |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en safetensors, cargados en bf16 en el ejemplo oficial |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 (pesos del DiT y del checkpoint). El VAE procede de `black-forest-labs/FLUX.2-klein-base-4B` y se rige por su propio aviso (`LICENSE-FLUX2-VAE.md`). El dataset de entrenamiento Git-10M es CC BY-NC-ND 4.0 |
| Formato de pesos | safetensors, formato Diffusers (`DiffusionPipeline.from_pretrained`) |
| Resolucion de salida | 256x256 pixeles |
| Codificadores de texto | CLIP ViT-L/14 + T5-XXL (incluidos en el repositorio) |
| VAE | `AutoencoderKLFlux2` (Flux.2, incluido, Apache-2.0) |
| Planificador | `FlowMatchEulerDiscreteScheduler`, `shift=1.0` |
| Pipeline | `GeoCorePipeline` (`pipeline.py`, requiere `trust_remote_code=True`) |
| Dataset de entrenamiento | Git-10M (`lcybuaa/Git-10M`) |
| Tamano del repositorio | 28,4 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un transformer de difusion con formulacion de flow matching, no un transformer autorregresivo ni un modelo de espacio latente clasico tipo U-Net. La columna vertebral se organiza en 8 bloques double-stream (procesamiento conjunto de las secuencias de texto e imagen) seguidos de 24 bloques single-stream, con dimension oculta 4096 y 32 cabezas de atencion. La generacion se realiza en el espacio latente del VAE de Flux.2 y se muestrea con `FlowMatchEulerDiscreteScheduler` configurado con `shift=1.0`. El ejemplo oficial usa 50 pasos de Euler y `guidance_scale=4.0`.

La innovacion principal respecto a un generador texto-imagen convencional es la incorporacion de condicionamiento geoespacial. Ademas del prompt en lenguaje natural, el modelo acepta `res` (indice de resolucion), `lon` y `lat` (grados), cualquiera de los cuales puede omitirse pasando el valor centinela `-999.0`, que activa un embedding nulo aprendido. Los prompts siguen el estilo de Git-10M: descripciones breves de escena, como "A parking lot full of cars is located next to some trees." No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset Git-10M ni si se aplicaron fases de RLHF, DPO o ajuste por preferencias. Tampoco se documentan tecnicas de decodificacion especulativa ni de atencion lineal.

## Capacidades

- Generacion de imagenes de satelite opticas de 256x256 pixeles a partir de descripciones textuales breves en ingles.
- Condicionamiento geoespacial opcional mediante `res`, `lon` y `lat`, con embedding nulo aprendido (`-999.0`) para omitir cualquiera de los tres campos.
- Control de escala a traves de `res`, definido como `17 - z` sobre el esquema de zoom XYZ de Google: `res=0` equivale aproximadamente a 1,2 m/pixel en el ecuador y cada unidad adicional duplica el GSD.
- Generacion reproducible: el pipeline acepta `torch.Generator` con semilla fija (el ejemplo usa la semilla 42).
- Control del compromiso entre fidelidad al prompt y diversidad mediante `guidance_scale`, y del coste computacional mediante `num_inference_steps`.
- Carga autocontenida: el repositorio incluye DiT, VAE y ambos codificadores de texto, de modo que `DiffusionPipeline.from_pretrained` reconstruye el pipeline completo sin dependencias externas de pesos.
- No soporta tool calling ni function calling: es un modelo de difusion texto-imagen, no un modelo de lenguaje conversacional.
- No hay soporte declarado de agentes, razonamiento multi-paso, vision de entrada, audio ni video.
- No se documentan capacidades de edicion de imagen, inpainting, outpainting ni image-to-image.

## Casos de uso

- Aumento de datos para teledeteccion: generar tiles sinteticos de 256x256 con clases infrarepresentadas (rotondas, piscinas, aparcamientos, zonas comerciales) para equilibrar datasets de segmentacion semantica o deteccion de edificios, donde la recoleccion manual es costosa.
- Pruebas de robustez de detectores: fijar `lon` y `lat` y variar `res` permite producir la misma escena conceptual a distintas escalas, util para comprobar si un detector entrenado a un GSD concreto degrada su precision al cambiar la resolucion.
- Simulacion de escenarios de planificacion urbana: generar previsualizaciones de "que pasaria si" (por ejemplo, un aparcamiento junto a una zona arbolada, o un area comercial densa) antes de encargar imagen aerea real, como material de discusion preliminar.
- Relleno de huecos de cobertura: en regiones con escasa disponibilidad de imagen satelital reciente, generar tiles plausibles para completar mosaicos de demostracion o prototipos, siempre marcandolos explicitamente como sinteticos.
- Docencia y divulgacion en teledeteccion: producir ejemplos controlados de tipos de escena con atributos conocidos para explicar conceptos de GSD, cobertura del suelo o interpretacion visual, sin depender de licencias de imagen comercial.
- Investigacion sobre condicionamiento geografico: usar el par `res`/`lon`/`lat` como banco de pruebas para estudiar como un DiT incorpora variables continuas de contexto fisico en la generacion.
- Deteccion de imagenes sinteticas geoespaciales: emplear el modelo como generador de referencia en la construccion de clasificadores que distingan imagen satelital real de imagen generada, un problema creciente en verificacion de evidencia.
- Pruebas de integracion y CI de pipelines de difusion: validar la carga con `trust_remote_code=True`, la gestion de memoria en bf16 y el reparto multi-GPU con Accelerate antes de desplegar modelos mayores con la misma estructura de pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio de conversion y la informacion proporcionada no incluyen metricas como FID, CLIP score, MMLU, HumanEval ni GSM8K (estas ultimas no serian aplicables, al tratarse de un modelo de difusion texto-imagen y no de un modelo de lenguaje). Tampoco se aportan comparaciones cuantitativas con otros generadores de imagen satelital. La busqueda web realizada no devolvio ningun resultado relevante sobre el modelo: unicamente enlaces a la pagina principal de Amazon, sin relacion con GeoCore-9B. No se deben asumir cifras de rendimiento sin una evaluacion publicada.

## Requisitos de hardware

- DiT en bf16: aproximadamente 18,5 GB de pesos, segun la propia model card.
- Pipeline completo en bf16: el repositorio ocupa 28,4 GB e incluye DiT, T5-XXL, CLIP ViT-L/14 y VAE. La estimacion razonable de VRAM para cargar todo en una sola GPU es del orden de 28-32 GB; la model card no confirma una cifra exacta.
- GPU de 24 GB: el autor la describe como "justa" para la inferencia. Una RTX 3090 o RTX 4090 puede funcionar, pero con poco margen.
- GPU de 40-48 GB: A100 40 GB, A6000, L40S. Espacio holgado para el pipeline completo en bf16.
- GPU de 80 GB: H100 o A100 80 GB, sin restricciones relevantes de memoria para esta resolucion.
- GPU de consumo de 8, 12 o 16 GB: no es viable cargar el pipeline completo sin tecnicas de offload o sin dividir componentes, no documentadas en la model card.
- Multi-GPU: el autor recomienda dividir unicamente el transformer con Accelerate y mantener CLIP, T5 y el VAE en un solo dispositivo.
- Opciones de despliegue: `diffusers` con `DiffusionPipeline.from_pretrained(..., trust_remote_code=True, torch_dtype=torch.bfloat16)`, y Accelerate para el reparto entre GPUs. No hay soporte documentado de llama.cpp, Ollama, vLLM ni TGI para este checkpoint (son herramientas orientadas a modelos de lenguaje o a formatos GGUF, y aqui no se publican cuantizaciones GGUF).
- Latencia y throughput: no disponible. El ejemplo oficial usa 50 pasos de Euler con `guidance_scale=4.0` a 256x256, pero no se publican mediciones de tiempo por imagen ni imagenes por segundo en ningun hardware.

## Comparativa con modelos similares

La informacion disponible no incluye datos tecnicos ni de rendimiento de alternativas, y la busqueda web no devolvio resultados utiles, por lo que no es posible una comparacion rigurosa. La siguiente tabla recoge unicamente lo que consta en la informacion proporcionada.

| Modelo | Parametros | Resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|
| GeoCore-9B (`BiliSakura/GeoCore-9B-diffusers`) | 9,24 B | 256x256 | Apache-2.0 | safetensors en formato Diffusers, 28,4 GB |
| GeoCore-9B original (`JeonghyeokDo/GeoCore-9B`) | 9,24 B (mismo modelo) | 256x256 | Apache-2.0 | pesos originales; el checkpoint analizado es una conversion |
| FLUX.2-klein-base-4B | no disponible en la informacion (el nombre sugiere 4 B, sin confirmar) | no disponible | Apache-2.0 (segun el aviso del VAE) | usado como origen del autoencoder, no como alternativa evaluada |
| Otros generadores texto-imagen de proposito general (FLUX.1, SD 3.5, etc.) | no disponible | no disponible | no disponible | no disponible |

Criterio de comparacion pendiente: no hay datos publicados de FID, CLIP score ni calidad percibida que permitan situar GeoCore-9B frente a generadores generales o frente a otros modelos de teledeteccion. Cualquier afirmacion al respecto seria especulativa.

## Limitaciones y advertencias

- Resolucion fija de 256x256: insuficiente para analisis fino, cartografia de detalle o tareas que requieran identificar objetos pequenos. A `res=0`, el GSD aproximado es de 1,2 m/pixel en el ecuador, y empeora al aumentar `res`.
- Las imagenes generadas no representan ubicaciones reales. Aunque el modelo acepte `lon` y `lat`, la salida es una sintesis plausible, no una reconstruccion del terreno. No debe usarse como evidencia geografica ni cartografica.
- Riesgo de alucinacion visual: el modelo puede producir estructuras verosimiles pero inexistentes (edificaciones, viarios, masas de agua) que un observador no experto puede confundir con imagen real.
- Idioma: solo ingles. Los prompts en castellano no estan soportados oficialmente y pueden degradar la calidad de la generacion.
- Sesgos: dependen de la distribucion de Git-10M, cuya composicion no se detalla en la informacion disponible. Los ejemplos de la model card se centran en Seul (lon 126,97, lat 37,56), lo que no permite inferir el comportamiento en otras regiones del mundo. Cabe esperar un rendimiento desigual segun el tipo de paisaje y el nivel de urbanizacion.
- Licencia del dataset: los pesos se publican como Apache-2.0, pero Git-10M es CC BY-NC-ND 4.0 y la propia model card indica que no permite reentrenamiento comercial. Conviene revisar la cadena de licencias antes de cualquier uso en producto, especialmente si se planea afinar el modelo.
- Componente de terceros: el VAE procede de FLUX.2-klein-base-4B y se rige por su propio aviso de licencia (`LICENSE-FLUX2-VAE.md`), que debe consultarse aparte.
- `trust_remote_code=True` es obligatorio para cargar el pipeline: esto implica ejecutar codigo Python incluido en el repositorio. Es un riesgo de seguridad en entornos de produccion y exige revision previa de `pipeline.py`.
- Sin cuantizaciones oficiales: no hay versiones GGUF, int8 ni int4, lo que limita el despliegue en hardware modesto.
- Validacion comunitaria nula: 0 descargas y 0 likes en el repositorio de conversion. Es un checkpoint recien creado (14 de septiembre de 2026) sin verificacion independiente.
- Ausencia de benchmarks publicados: no hay evidencia cuantitativa de calidad, fidelidad al prompt ni adherencia al condicionamiento geografico.
- Requisitos de memoria elevados para una resolucion de salida tan baja: ~18,5 GB solo para el DiT en bf16, con una GPU de 24 GB descrita como "justa".

## Enlaces

- Repositorio HuggingFace analizado: https://huggingface.co/BiliSakura/GeoCore-9B-diffusers
- Pesos originales: https://huggingface.co/JeonghyeokDo/GeoCore-9B
- Pagina del proyecto: https://kaist-viclab.github.io/GeoCore-9B_site/
- Codigo fuente: https://github.com/KAIST-VICLab/GeoCore-9B
- Dataset de entrenamiento Git-10M: https://huggingface.co/datasets/lcybuaa/Git-10M
- Modelo de origen del VAE (FLUX.2-klein-base-4B): https://huggingface.co/black-forest-labs/FLUX.2-klein-base-4B
- Libreria Diffusers: https://github.com/huggingface/diffusers

Nota: la busqueda web asociada a esta ficha no devolvio ningun resultado relevante sobre el modelo (unicamente enlaces genericos a Amazon), por lo que no se han podido anadir paper, blog tecnico ni demo adicionales a la lista anterior.

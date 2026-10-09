# DeepBeepMeep/Prism

## Resumen

Prism es un modelo de difusion de generacion conjunta de video y audio: toma una imagen de partida y un prompt de texto y produce un clip de video acompanado de una banda sonora mono a 48 kHz. Lo desarrolla originalmente el equipo de Tencent Hunyuan (repositorio Tencent-Hunyuan/Prism, con terminos MIT e继承 de MOVA Apache-2.0), y esta ficha concreta corresponde a la conversion publicada por DeepBeepMeep, orientada a su runtime WanGP. Esta version no es un checkpoint de difusion generico: es un paquete de pesos cuantizados a INT8 con el esquema ConvRot, pensado para cargarse exclusivamente a traves de la integracion de Prism en WanGP.

El paquete incluye el transformador Alpha en un unico fichero con dos expertos de video, un transformador de audio y los puentes entre ambos; el codificador de condicionamiento UMT5-XXL tambien cuantizado a INT8 ConvRot; dos codecs nativos (video y audio) conservados en BF16; los activos del tokenizador; y un par de adaptadores aceleradores LightX2V en precision original. La cuantizacion afecta a 1.340 pesos Lineales del transformador y 168 del codificador; el resto de tensores conserva su precision original, incluidas las 24 tablas de embeddings de posicion relativa del UMT5, que permanecen en BF16.

Es relevante ahora porque permite ejecutar un modelo de generacion audiovisual conjunta sobre el stack WanGP con un consumo de VRAM medido bajo (4,37 GiB de pico asignado en una prueba a 848x480), reduciendo el coste de acceso a este tipo de modelos. El repositorio ocupa 45,9 GB y, en el momento de la consulta, no acumulaba descargas ni likes en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion para video y audio conjunto; dos expertos de video, un transformador de audio y puentes de conexion; codificador de texto UMT5-XXL |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 con esquema ConvRot (transformador y codificador de texto); codecs de video y audio en BF16 original |
| Idiomas soportados | no disponible (el codificador de condicionamiento es UMT5-XXL, de naturaleza multilingue, pero no se especifica la cobertura efectiva) |
| Licencia | MIT, con terminos Apache-2.0 heredados de MOVA (ver LICENSE y NOTICE) |
| Formato de pesos | safetensors (Prism_Alpha_int8_convrot.safetensors, video_vae_bf16.safetensors, audio_vae_bf16.safetensors); adaptadores LightX2V en loras_accelerators/ |

## Arquitectura y entrenamiento

La model card describe un transformador Alpha que agrupa dos expertos de video, un transformador de audio dedicado y puentes que los conectan, todo en un unico fichero safetensors. Los dos adaptadores LightX2V (HIGH y LOW, rank 256, de 260412) se mapean sobre los expertos de video de Prism, siguiendo la estructura habitual de los modelos Wan2.2 con expertos de ruido alto y bajo. La generacion de audio se acopla al video mediante un codec de audio nativo en BF16 y un codec de video nativo tambien en BF16, mientras que la condicion de texto la aporta un UMT5-XXL cuantizado.

Esta version concreta no aporta informacion sobre el entrenamiento del modelo base: no se detallan volumen de tokens, composicion del dataset ni si hubo etapas de RLHF o DPO. Lo que si documenta el autor es el proceso de preparacion de los pesos: el transformador BF16 se verifico como fichero unico, los tres fragmentos del UMT5 se fusionaron sin modificar bytes ni dtypes antes de la cuantizacion, y se cuantizaron 1.340 pesos Lineales del transformador y 168 del codificador, conservando el resto de tensores en su precision original. La receta de aceleracion adapta el metodo de FreeVideo Light a la atencion compartida de WanGP y a una cache de condicionamiento en BF16; el autor aclara explicitamente que no reclama paridad numerica, de calidad ni de velocidad con FreeVideo.

El flujo de inferencia base usa Euler con 50 pasos, guidance 5 y flow shift 7, con una referencia de 1280x720, 205 fotogramas y 24 fps, y recomienda atencion de video completa. Para el modo acelerado, el perfil LightX2V 260412 Rank256 carga ambos adaptadores con multiplicadores `1;0 0;1`, selecciona Full Video Attention, fija 8 pasos de video, flow shift 5 y guidance de video 2 en el primer paso (1 despues); el audio recibe cuatro actualizaciones Euler por cada paso de video con guidance 5.

## Capacidades

- Generacion de video a partir de una imagen de entrada y un prompt de texto (image-to-video).
- Generacion simultanea de audio: banda sonora mono a 48 kHz alineada con el clip generado.
- Condicionamiento de texto mediante un codificador UMT5-XXL, lo que abre la puerta a prompts multilingues (cobertura efectiva no documentada).
- Generacion con dos expertos de video, lo que permite alternar entre el modo base (Euler, 50 pasos) y el modo acelerado con adaptadores LightX2V (8 pasos).
- Ejecucion con atencion de video completa (Full Video Attention) y soporte de SageAttention 2 en el runtime WanGP.
- Compatibilidad con el cargador compartido INT8 ConvRot de WanGP, con liberacion de caches de paso y descarga reproducible de adaptadores.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso ni agentes; no es un modelo de lenguaje conversacional.

## Casos de uso

- Generacion de clips audiovisuales a partir de una fotografia: a partir de una imagen fija y un prompt se obtiene un video con sonido ambiente o banda sonora generada, util para prototipos creativos y demostraciones.
- Previsualizacion de storyboards con sonido: convertir un frame clave en un clip corto con audio para validar la direccion de una escena antes de producirla.
- Creacion de contenido para redes sociales: el modo acelerado (8 pasos) permite iterar rapido sobre variaciones de prompt e imagen sin esperar a un muestreo completo de 50 pasos.
- Prototipado de efectos de imagen a video en pipelines de investigacion: al integrarse en WanGP, puede encadenarse con el resto de herramientas del runtime para experimentar con recetas de atencion y aceleradores.
- Demostraciones de I+D en generacion audiovisual conjunta: sirve como banco de pruebas para estudiar la coherencia entre pistas de video y audio en modelos de difusion.
- Despliegue en entornos con VRAM limitada: el consumo medido de 4,37 GiB de pico asignado a 848x480 y 49 fotogramas hace viable probar el modelo en GPUs de gama consumer bien configuradas.
- Validacion de recetas de cuantizacion: util para equipos que quieran comparar la salida del transformador cuantizado INT8 ConvRot frente al original en BF16, ya que el autor documenta que descargar los adaptadores restaura la salida nativa exacta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El unico dato de rendimiento medido es una prueba de ejecucion del cargador y generador headless de WanGP: una renderizacion de 848x480, 49 fotogramas y 8 pasos, con SageAttention 2, head split 2 y perfil MMGP 4, completo en 2 minutos y 7 segundos incluyendo carga y guardado en la maquina de prueba, con 4,37 GiB de VRAM de pico asignada y 5,62 GiB reservada. El autor subraya que es una unica medicion y no una promesa de throughput general.

## Requisitos de hardware

- Repositorio completo: 45,9 GB de pesos y activos.
- VRAM medida en la prueba del autor: 4,37 GiB de pico asignado y 5,62 GiB reservado para 848x480, 49 fotogramas y 8 pasos con el perfil MMGP 4 (incluye offloading gestionado por WanGP).
- No se publican requisitos de VRAM para la resolucion de referencia de 1280x720 con 205 fotogramas; no disponible.
- GPU recomendadas: no disponibles de forma explicita. La medicion usa SageAttention 2, disponible en GPUs NVIDIA Ampere y posteriores. No se confirma el modelo concreto empleado.
- Viabilidad en GPU consumer: plausible segun el consumo medido a baja resolucion, pero no confirmada para la resolucion de referencia completa.
- Opciones de despliegue: exclusivamente a traves de la integracion de Prism en WanGP, que requiere su cargador compartido INT8 ConvRot. No es un checkpoint compatible con Diffusers de forma directa.
- Latencia y throughput: 2 minutos y 7 segundos para el clip de 49 fotogramas a 848x480 en la configuracion probada. Sin datos para otras configuraciones.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto o duracion | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| DeepBeepMeep/Prism (esta ficha) | Image-to-video con audio conjunto | 205 fotogramas a 24 fps en la referencia | MIT con terminos Apache-2.0 heredados | Hugging Face, 45,9 GB | Requiere WanGP; pesos INT8 ConvRot |
| FrancisRing/Prism | Image-to-video con audio conjunto | no disponible | no disponible en esta consulta | Hugging Face | Modelo base del que deriva esta cuantizacion |
| Wan2.2 (con adaptadores LightX2V) | Image-to-video | no disponible | Apache-2.0 | Hugging Face y variantes comunitarias | Origen de los adaptadores LightX2V que aqui se mapean a los expertos de video de Prism; el autor indica que otros adaptadores no se han validado |
| Tencent-Hunyuan/Prism | Image-to-video con audio conjunto | no disponible | MIT con terminos MOVA Apache-2.0 | GitHub | Implementacion de referencia upstream |

No se dispone de datos de benchmarks comparativos entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El paquete no es un checkpoint Diffusers utilizable directamente: exige la integracion de Prism en WanGP y su cargador compartido INT8 ConvRot. Los ficheros cuantizados no son intercambiables con checkpoints estandar.
- El audio generado en la prueba resulto tenue; la inteligibilidad del habla y la sincronizacion labial no han sido establecidas por el autor.
- La calidad visual a 720p y longitud completa no ha sido validada.
- Las resoluciones mas pequenas y los clips mas cortos se consideran experimentales en esta vista previa.
- La atencion dispersa (Sparse) sigue siendo experimental y produjo fotogramas finales danados en una muestra a 480p probada; se recomienda Full Video Attention.
- Solo se han validado los adaptadores LightX2V 260412 rank 256; otros adaptadores no han sido comprobados, y el par de Wan2.2 se mapea a los expertos de video de Prism sin garantia de equivalencia.
- El autor no reclama paridad numerica, de calidad ni de velocidad con la receta original de FreeVideo.
- No se documentan sesgos conocidos, tasas de alucinacion ni cobertura idiomatica efectiva; no disponible.
- Riesgo de alucinacion: al ser un modelo generativo de video y audio, no se dispone de evaluaciones publicadas sobre fidelidad al prompt ni sobre artefactos.
- Licencia MIT heredada, pero los componentes subyacentes (Wan2.2, LightX2V, MOVA) conservan terminos Apache-2.0 propios; conviene revisar LICENSE, NOTICE y las licencias de terceros antes de un uso comercial.
- El repositorio no registraba descargas ni likes en el momento de la consulta, por lo que la validacion por parte de la comunidad es nula.
- La fecha de creacion indicada (2026-10-08) corresponde a los metadatos del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DeepBeepMeep/Prism
- Modelo base: https://huggingface.co/FrancisRing/Prism/tree/0ff9e33dc323a9a97ca3defcc019d745e93f3a26
- Runtime WanGP: https://github.com/deepbeepmeep/Wan2GP
- Repositorio upstream de Prism: https://github.com/Tencent-Hunyuan/Prism
- Receta de aceleracion FreeVideo: https://github.com/FlashML-org/FreeVideo/tree/40525196a33bc7ff6a455ce9b18b74f3c827bbb1
- Documentacion de la receta Light para Prism en FreeVideo: https://github.com/FlashML-org/FreeVideo/blob/40525196a33bc7ff6a455ce9b18b74f3c827bbb1/docs/Prism.md
- Adaptadores LightX2V de origen (Kijai/WanVideo_comfy): https://huggingface.co/Kijai/WanVideo_comfy/tree/8260d429d19fd7a72304cad059160b95d843913f/LoRAs/Wan22_Lightx2v
- Repositorio relacionado del mismo autor: https://huggingface.co/DeepBeepMeep/prismaudio
- Perfil del autor en Hugging Face: https://huggingface.co/DeepBeepMeep

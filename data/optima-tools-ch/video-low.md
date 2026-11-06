# optima-tools-ch/video-low

## Resumen

`optima-tools-ch/video-low` es un paquete de pesos redistribuido por Optima Tools que contiene una copia fiel del modelo de generacion de video Lightricks LTX-2.5, en su variante destilada y cuantizada a INT8 para su uso en ComfyUI. No se trata de un modelo nuevo ni de un fine-tune: los seis archivos safetensors son identicos byte a byte (mismos tamanos y mismos SHA-256) a los publicados por Lightricks en la revision `49b093a39c19169a8a81721dcc541e07e945232f`, y el propio autor lo declara explicitamente. La unica diferencia respecto al repositorio `video-medium` del mismo autor son los ajustes de generacion preconfigurados (perfil "Rapido", formato SD, 4 segundos), no los pesos.

El modelo subyacente es LTX-2.5, un sistema text-to-video e image-to-video de Lightricks con un transformer de difusion de 22 000 millones de parametros en version destilada, acompanado de un text encoder Gemma 4 de 12 000 millones de parametros adaptado con proyeccion, dos VAE (video y audio) y un upscaler latente espacial x2. El pipeline declarado en Hugging Face es image-to-video, aunque las etiquetas del autor incluyen tambien text-to-video.

Su relevancia practica es acotada: el repositorio tiene cero descargas y cero likes en el momento de la consulta, el autor advierte que el paquete no ha sido probado en Optima Tools desde este repositorio y la licencia LTX-2.x Community License Agreement impone restricciones comerciales relevantes. Es util como espejo verificado de los pesos oficiales para flujos de trabajo en ComfyUI, no como una alternativa tecnica a LTX-2.5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (LTX-2.5 destilado) con text encoder Gemma 4 12B, VAE de video, VAE de audio y upscaler latente espacial x2 |
| Parametros totales | 22 000 millones en el transformer de difusion (etiqueta `22b` del nombre de archivo); 12 000 millones adicionales en el text encoder; total del paquete no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 (transformer y text encoder, variante `convrot`); BF16 en VAE, upscaler y duration head |
| Idiomas soportados | no disponible |
| Licencia | LTX-2.x Community License Agreement (11 de agosto de 2026); no es MIT ni Apache |
| Formato de pesos | safetensors (6 archivos, 39,69 GB en total; repo de 68,6 GB) |

Desglose de archivos del paquete:

| Archivo | Tamano | Precision |
|---|---:|---|
| `diffusion_models/ltx-2.5-22b-distilled-transformer-comfy-int8-convrot.safetensors` | 21,50 GB | INT8 |
| `text_encoders/gemma4-12b-with-proj-ltx-2.5-comfy-int8-convrot.safetensors` | 15,37 GB | INT8 |
| `vae/ltx-2.5-video-vae-conv-bf16.safetensors` | 1,45 GB | BF16 |
| `latent_upscale_models/ltx-2.5-latent-spatial-upscaler-x2-bf16-1.0.safetensors` | 1,00 GB | BF16 |
| `vae/ltx-2.5-audio-vae-bf16.safetensors` | 0,36 GB | BF16 |
| `model_patches/ltx-2.5-duration-head-bf16.safetensors` | ~0,00 GB | BF16 |

## Arquitectura y entrenamiento

La arquitectura corresponde integramente a LTX-2.5 de Lightricks; Optima Tools no aporta entrenamiento, fine-tune ni conversion propia. El nucleo es un transformer de difusion destilado de 22B parametros en INT8, que opera sobre latentes de video producidos por un VAE convolucional y sobre latentes de audio producidos por un VAE de audio independiente, lo que habilita generacion conjunta de video y pista sonora. El acondicionamiento textual se realiza mediante un Gemma 4 de 12B con una proyeccion especifica para LTX-2.5, tambien en INT8. Un upscaler latente espacial x2 en BF16 permite escalar la resolucion en el espacio latente, y un `duration-head` en BF16 controla la duracion de la secuencia generada.

El paquete incluye la variante destilada (`distilled`) del transformer, pensada para reducir el numero de pasos de muestreo, y la cuantizacion INT8 con sufijo `convrot` esta orientada al ecosistema ComfyUI. No se dispone de informacion sobre volumen de tokens de entrenamiento, composicion del dataset, uso de RLHF/DPO ni innovaciones de decodificacion, ya que la model card redistribuida no los detalla y no se ha consultado documentacion adicional de Lightricks. Cualquier afirmacion sobre el proceso de entrenamiento de LTX-2.5 queda fuera del alcance de la informacion disponible.

## Capacidades

- Generacion de video a partir de texto (text-to-video), segun las etiquetas del autor.
- Generacion de video a partir de una imagen de referencia (image-to-video), pipeline declarado en Hugging Face.
- Generacion de audio asociado al video, mediante el VAE de audio incluido en el paquete.
- Escalado espacial x2 en espacio latente mediante el upscaler dedicado.
- Control de duracion de la secuencia mediante el `duration-head`.
- Perfiles de generacion preconfigurados por Optima Tools: calidad "Rapido" (borrador a media resolucion del formato elegido), formato SD y duracion de 4 segundos.
- Integracion con ComfyUI mediante nombres de archivo reconocidos por el motor de Optima Tools.
- Soporte de tool calling, function calling, razonamiento multi-paso, modo thinking, vision de entrada o capacidades de agente: no disponible (no aplica a un modelo de generacion de video).

## Casos de uso

- Prototipado rapido de clips en ComfyUI: el perfil "Rapido" con formato SD y 4 segundos permite iterar sobre ideas de guion o composicion antes de lanzar una generacion a mayor resolucion con el upscaler latente x2.
- Animacion de stills para presentaciones: el pipeline image-to-video permite convertir una imagen fija en un clip corto, util para maquetas de producto o storyboards.
- Generacion de video con audio sincronizado: al incluir VAE de audio, el paquete puede producir clips con pista sonora en un unico flujo, evitando un paso separado de doblaje o Foley.
- Pruebas de integracion en pipelines de ComfyUI: los nombres de archivo estan pensados para que el motor los reconozca directamente, lo que facilita validar flujos de trabajo antes de adquirir hardware definitivo.
- Espejo verificado para auditoria de pesos: al mantener los SHA-256 de los archivos LFS originales, sirve para verificar la integridad de una instalacion de LTX-2.5 en entornos donde no se quiera depender del repositorio de Lightricks.
- Educacion y experimentacion con modelos de difusion de video: el desglose en transformer, text encoder, VAE de video, VAE de audio y upscaler hace visible la separacion de componentes de un sistema de video moderno.
- Demos internas de bajo coste computacional relativo: la cuantizacion INT8 reduce el peso en disco frente a BF16 (39,69 GB instalados), lo que simplifica la distribucion en estaciones de trabajo, aunque no reduce los requisitos de memoria del modelo segun advierte el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que "aucune mesure de performance n'est annoncee ici" y que los requisitos de memoria son los del modelo con independencia del perfil elegido.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. El autor advierte que no debe suponerse que un equipo modesto puede cargarlo, independientemente del perfil "Rapido". Como referencia de orden de magnitud, solo el transformer INT8 ocupa 21,50 GB y el text encoder INT8 15,37 GB, por lo que la carga completa de ambos en memoria supera los 36 GB antes de contar activaciones y latentes.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada. Por el volumen de pesos, las GPU de consumo con 24 GB no pueden alojar simultaneamente transformer y text encoder en INT8 sin estrategias de offload; no se dispone de datos de rendimiento con offload.
- Opciones de despliegue: ComfyUI mediante el motor de Optima Tools (nombres de archivo reconocidos); el paquete no ha sido probado en Optima Tools desde este repositorio. Soporte en vLLM, llama.cpp, Ollama o TGI: no disponible (no son runners habituales para difusion de video).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / duracion | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `optima-tools-ch/video-low` | 22B (difusion) + 12B (text encoder) | no disponible; perfil por defecto 4 s | safetensors INT8/BF16 | LTX-2.x Community License | Hugging Face, 0 descargas |
| `optima-tools-ch/video-medium` | Identicos (mismos SHA-256) | no disponible; perfil distinto | safetensors INT8/BF16 | LTX-2.x Community License | Hugging Face |
| `Lightricks/LTX-2.5` | 22B (difusion) + 12B (text encoder) | no disponible | safetensors (precision original) | LTX-2.x Community License | Hugging Face (repositorio oficial) |

La comparacion con alternativas de otros fabricantes (por ejemplo, modelos de video de otras familias) no esta disponible en la informacion proporcionada. Respecto a `video-medium`, la unica diferencia documentada son los ajustes de generacion, no los pesos; respecto al repositorio oficial de Lightricks, la diferencia es la cuantizacion INT8 y el empaquetado para ComfyUI.

## Limitaciones y advertencias

- El paquete no ha sido probado en Optima Tools desde este repositorio; el propio autor lo declara como estado "non teste".
- La licencia LTX-2.x Community License Agreement no es MIT ni Apache: impone restricciones de uso (Attachment A), exige incluir el texto integro del acuerdo y la politica de uso aceptable en cualquier redistribucion, obliga a senalar modificaciones y a conservar avisos de copyright y atribucion.
- Las entidades con facturacion anual, grupo incluido, igual o superior a 10 millones de USD necesitan una licencia comercial de pago de Lightricks para cualquier uso, salvo el uso no comercial definido en la seccion 2.2.
- El autor no anuncia ninguna medida de rendimiento; no deben extrapolarse cifras de calidad o velocidad a partir del perfil "Rapido".
- Los requisitos de memoria son los del modelo con independencia del perfil; un equipo modesto no puede cargarlo.
- Riesgo de sesgos y alucinacion visual: no documentado en la informacion disponible, pero aplicable a cualquier modelo generativo de video; no se han publicado evaluaciones al respecto para este paquete.
- Idiomas soportados: no disponibles. La model card esta redactada en frances y no especifica cobertura linguistica del text encoder.
- El repositorio registra cero descargas y cero likes, sin senales de validacion por parte de la comunidad.
- La licencia del text encoder Gemma 4 12B no se indica por separado en la fuente; se distribuye bajo los terminos del acuerdo LTX-2.x, lo que conviene verificar antes de un uso comercial.
- El repositorio ocupa 68,6 GB frente a los 39,69 GB de los seis archivos listados; el espacio adicional corresponde a metadatos y posiblemente a otros artefactos del paquete, no detallados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/optima-tools-ch/video-low
- Repositorio del modelo base: https://huggingface.co/Lightricks/LTX-2.5
- Revision concreta de origen: https://huggingface.co/Lightricks/LTX-2.5/tree/49b093a39c19169a8a81721dcc541e07e945232f
- Texto de la licencia LTX-2.x: https://github.com/Lightricks/LTX-2/blob/a95ab856bf29407b6b066ede0abe1846050db56c/LICENSE-2_x
- Politica de uso aceptable de Lightricks: https://static.lightricks.com/legal/ltx-acceptable-use-policy.pdf

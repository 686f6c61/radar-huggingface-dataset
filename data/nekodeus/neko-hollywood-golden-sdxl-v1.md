# Nekodeus/neko-hollywood-golden-sdxl-v1

## Resumen

Neko Hollywood Golden SDXL v1 es una coleccion de adaptadores LoRA de personajes para SDXL base 1.0, publicada por el usuario Nekodeus en HuggingFace. Cada entrada del set (denominada "golden1", "golden2", etc.) incluye dos artefactos: un archivo LoRA estandar en formato `.safetensors` compatible con A1111, ComfyUI y diffusers, y una carpeta de conversion a OpenVINO IR (`.xml`/`.bin`) pensada para inferencia en hardware Intel (CPU, iGPU o NPU) sin depender de CUDA.

El modelo no es un modelo fundacional, sino un conjunto de adaptadores de bajo rango (rank 8) entrenados sobre retratos curados para reproducir rostros concretos. En la version v1 solo se documenta la primera entrada, `golden1`, asociada al rostro de Margot Robbie; el resto del set se anuncia como "coming next" (golden2 a golden10) y no esta disponible en el repositorio en el momento de redactar esta ficha.

Su relevancia es limitada y muy especifica: el repositorio tiene 0 descargas y 0 likes, un tamano de 29,4 GB (dominado por las conversiones OpenVINO IR) y una licencia Apache-2.0. El interes tecnico esta en el doble formato de distribucion, que permite ejecutar SDXL en equipos sin GPU NVIDIA, mas que en una innovacion arquitectonica propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre SDXL base 1.0 (modelo de difusion latente) |
| Parametros totales | no disponible (no se publica el numero de parametros del adaptador; rank 8 declarado) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo text-to-image; sin ventana de contexto de tokens) |
| Tipos de cuantizacion | OpenVINO IR (precision no especificada en la model card); LoRA en safetensors sin cuantizar |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.safetensors` (LoRA) y OpenVINO IR (`.xml` + `.bin`) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rank 8 que se inyecta sobre `stabilityai/stable-diffusion-xl-base-1.0`. SDXL es un modelo de difusion latente compuesto por una U-Net como denoiser y dos codificadores de texto (CLIP ViT-L y OpenCLIP ViT-bigG), sobre los que opera el mecanismo de atencion cruzada que el LoRA modula. El entrenamiento declarado se basa en "retratos curados" (curated portraits), sin que la model card detalle el numero de imagenes, las iteraciones, el learning rate ni si se aplicaron tecnicas como regularizacion de clase o DreamBooth.

El segundo componente del repositorio son las conversiones a OpenVINO IR, que traducen el grafo del modelo para aprovechar optimizaciones de Intel en CPU, iGPU y NPU. La model card describe estas carpetas como "device-neutral", es decir, no atadas a un modelo de GPU concreto. No hay informacion sobre decodificacion especulativa, atencion lineal ni ninguna otra innovacion en el pipeline; tampoco se documenta el uso de RLHF, DPO o fine-tuning por preferencias, algo por otro lado inusual en modelos de difusion.

## Capacidades

- Generacion de imagenes text-to-image condicionada por prompt textual en ingles, heredando las capacidades del SDXL base.
- Reproduccion de un rostro concreto (el personaje `golden1`) mediante la invocacion del token de disparo en el prompt, segun el ejemplo de la model card: `a photo of golden1 woman, studio light`.
- Integracion como LoRA en tres ecosistemas de inferencia: diffusers (Python), Automatic1111 y ComfyUI.
- Ejecucion en hardware Intel sin CUDA a traves de las conversiones OpenVINO IR.
- Composicion con otros LoRA y con embeddings negativos, al ser un adaptador estandar de SDXL.
- Tool calling: no soportado.
- Soporte de agentes o razonamiento multi-paso: no soportado.
- Capacidades multilingues: no; el unico idioma declarado es el ingles.
- Capacidades especiales (modo thinking, vision, audio): no aplica; es un modelo de generacion de imagen, no un modelo de lenguaje ni multimodal de entrada.

## Casos de uso

- Prototipado de personajes para guiones y storyboards: el LoRA permite fijar la apariencia de un personaje en una serie de ilustraciones manteniendo coherencia facial entre escenas, usando el token `golden1` combinado con distintos prompts de vestuario y escenario.
- Pruebas de concepto de casting virtual: generar variaciones de un mismo rostro en distintos estilos de iluminacion y encuadre (studio light, cinematic, golden hour) para explorar direcciones visuales antes de producir.
- Desarrollo de assets para videojuegos o animacion: crear retratos de referencia de un personaje secundario reutilizando el mismo LoRA en un pipeline batch sobre ComfyUI.
- Evaluacion de despliegue en hardware Intel: las conversiones OpenVINO IR permiten medir el rendimiento de SDXL + LoRA en CPU, iGPU o NPU, util para equipos que quieren desplegar generacion de imagen en portatiles sin GPU dedicada.
- Investigacion sobre adaptadores de bajo rango: el ejemplo de rank 8 sirve como caso de estudio reproducible para analizar como un LoRA de rango bajo captura identidad facial en SDXL.
- Automatizacion de generacion de retratos en lote: integrar el LoRA en un script diffusers que recorra una lista de prompts y produzca variaciones consistentes del personaje, con la advertencia legal indicada en la seccion de limitaciones.
- Formacion y demos tecnicas: ilustrar la diferencia entre distribucion en safetensors y distribucion en OpenVINO IR en una misma ficha de modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas FID, CLIP score, similitud facial ni comparaciones cuantitativas con otros LoRA de personaje. Tampoco se proporcionan datos de latencia, throughput ni consumo de VRAM.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia, SDXL base 1.0 en FP16 suele requerir del orden de 8 a 12 GB de VRAM; el LoRA anade un consumo marginal, pero la model card no lo cuantifica.
- GPU recomendadas: no especificadas por el autor. El modelo es compatible con cualquier GPU capaz de ejecutar SDXL base 1.0 (por ejemplo, RTX 3060 de 12 GB en adelante o superiores de la familia RTX 40).
- Compatibilidad con GPU de consumo: si, siempre que cumplan los requisitos de VRAM de SDXL base 1.0. No se aportan pruebas concretas de rendimiento en ninguna GPU.
- Alternativa sin GPU: las conversiones OpenVINO IR permiten ejecucion en CPU, iGPU y NPU de Intel, que es el principal valor diferencial de este repositorio.
- Opciones de despliegue: diffusers (Python), Automatic1111, ComfyUI y OpenVINO Runtime para las carpetas IR.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este LoRA, por lo que la comparacion se limita a aspectos estructurales. No se han identificado alternativas concretas con metricas publicadas dentro de la informacion proporcionada.

| Modelo | Tipo | Formato | Idiomas | Licencia | Datos comparativos |
|---|---|---|---|---|---|
| Neko Hollywood Golden SDXL v1 (`golden1`) | LoRA de personaje rank 8 sobre SDXL 1.0 | safetensors + OpenVINO IR | en | Apache-2.0 | no disponible |
| Otros LoRA de personaje para SDXL | LoRA de personaje | habitual: safetensors | en (mayoria) | variable (a menudo sin licencia explicita) | no disponible |
| SDXL base 1.0 (Stability AI) | Modelo fundacional text-to-image | safetensors | en (principalmente) | licencia propia de Stability AI | no disponible en esta ficha |

La diferencia estructural mas destacable frente a LoRA de personaje convencionales es la inclusion de conversiones OpenVINO IR junto al safetensors, algo poco comun en este tipo de publicaciones.

## Limitaciones y advertencias

- Riesgo legal por derechos de imagen: el LoRA reproduce el rostro de una persona real identificable. Apache-2.0 cubre los pesos del adaptador, pero no otorga derechos sobre la imagen, el nombre ni la likeness de la persona representada. El uso comercial o la difusion publica pueden infringir derechos de publicidad o de imagen segun la jurisdiccion.
- Riesgo de deepfakes: la capacidad de generar retratos realistas de una persona concreta habilita usos de suplantacion, desinformacion o contenido sexual no consentido. Es responsabilidad del usuario aplicar salvaguardas y no distribuirlo sin controles.
- Idiomas: solo ingles. Los prompts en otros idiomas no estan soportados oficialmente.
- Sin benchmarks ni validacion: no hay metricas de calidad, similitud facial ni evaluaciones de sesgo. La calidad real del LoRA no puede verificarse con los datos disponibles.
- Repositorio practicamente sin adopcion: 0 descargas y 0 likes en el momento de la consulta, sin senales de comunidad ni issues resueltos.
- Ambiguedad de la licencia: aunque el campo declara Apache-2.0, la model card no incluye el texto de licencia ni aclara si cubre tambien las conversiones OpenVINO IR y el conjunto completo de personajes anunciados.
- Tamano del repositorio elevado: 29,4 GB, lo que encarece la descarga y el almacenamiento, sobre todo si solo se necesita el safetensors del LoRA.
- Contenido incompleto: solo `golden1` esta documentado; los personajes golden2 a golden10 se anuncian pero no se confirma su disponibilidad.
- Fechas de publicacion inusuales: la model card indica creacion en septiembre de 2026 y actualizacion en octubre de 2026, posteriores a la fecha habitual de consulta; conviene verificar la vigencia del repositorio.
- Inferencia sin GPU: las conversiones OpenVINO IR pueden presentar diferencias de calidad o de rendimiento respecto a la ejecucion en CUDA; no se documentan pruebas comparativas.

## Enlaces

- HuggingFace: https://huggingface.co/Nekodeus/neko-hollywood-golden-sdxl-v1
- Modelo base referenciado en la model card: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
- OpenVINO (runtime para las conversiones IR): no se proporciona enlace en la informacion disponible.

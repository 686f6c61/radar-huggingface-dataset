# Echo-Team/Echo-WM-Base-Diffusers

## Resumen

Echo-WM Base es un modelo de mundo (world model) omnimodal desarrollado por Echo-Team, un grupo asociado a JD (JoyAI), que genera simultáneamente video y audio sincronizado (sonido ambiental, música y voz) a partir de una imagen inicial, un prompt de texto y una secuencia de acciones de cámara. El modelo permite navegar por un entorno generado de forma interactiva, respondiendo a movimientos de cámara como desplazamientos, giros o inclinaciones, mientras el video y el audio evolucionan de manera coherente. Este repositorio en concreto ofrece los pesos convertidos al formato Diffusers, lo que facilita su integración con el ecosistema de Hugging Face y el pipeline modular de Diffusers.

La arquitectura se basa en un transformer 3D (EchoWMTransformer3DModel) que procesa tanto la información visual como la auditiva, junto con un módulo de control de cámara. El modelo tiene aproximadamente 19,8 mil millones de parámetros y está diseñado para trabajar con secuencias de hasta 241 fotogramas. Su relevancia actual radica en que representa un avance hacia modelos de mundo generativos que combinan modalidades visuales y auditivas con control interactivo, un área emergente en la IA generativa. La licencia restringe su uso a fines académicos y de investigación no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EchoWMTransformer3DModel (transformer 3D) con pipeline modular Diffusers |
| Parametros totales | 19.794.341.120 (~19,8 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (se recomienda bfloat16 para inferencia) |
| Idiomas soportados | Ingles (en) |
| Licencia | LTX-2 Community License (uso academico y no comercial) |
| Formato de pesos | safetensors (formato Diffusers) |

## Arquitectura y entrenamiento

Echo-WM Base emplea una arquitectura de transformer 3D que procesa secuencias de video y audio de forma conjunta. El modelo integra un mecanismo de control de camara que traduce secuencias de acciones (como movimientos hacia adelante, lateral, inclinacion o giro) en cambios coherentes en la escena generada. La version Diffusers de este repositorio adapta el checkpoint original a la API ModularPipeline de Diffusers, permitiendo cargar el modelo con componentes modulares y usar funciones como `enable_model_cpu_offload()` para optimizar el uso de memoria.

No se dispone de informacion detallada sobre el entrenamiento: no se especifican el numero de tokens, la composicion del dataset ni si se emplearon tecnicas como RLHF o DPO. El modelo se presenta como una conversion fiel del checkpoint original, sin modificaciones en los pesos. La innovacion principal reside en la generacion simultanea de video y audio sincronizado con control de camara, lo que lo diferencia de modelos de generacion de video puramente visuales.

## Capacidades

- Generacion de video a partir de una imagen inicial, un prompt de texto y una secuencia de acciones de camara.
- Generacion de audio sincronizado: sonido ambiental, musica y voz que acompanan al video de forma coherente.
- Control de camara interactivo mediante secuencias de acciones (W/S adelante/atras, A/D lateral, I/K inclinacion, J/L giro, none quieto).
- Soporte para prompts descriptivos que especifican entorno, personajes, estilo, perspectiva y sonidos deseados.
- Generacion de secuencias de hasta 241 fotogramas (aproximadamente 10 segundos a 24 fps).
- Integracion con el ecosistema Diffusers mediante pipeline modular.
- Capacidad multilingue: solo ingles (el prompt debe estar en ingles para un rendimiento optimo).

## Casos de uso

- Prototipado de escenas cinematograficas: un director puede generar una secuencia de video con audio ambiental y musica a partir de una imagen de referencia y un prompt descriptivo, explorando diferentes movimientos de camara para previsualizar una toma.
- Creacion de mundos virtuales para videojuegos: los desarrolladores pueden generar entornos navegables con sonido ambiental coherente, acelerando la fase de diseno de niveles.
- Simulacion de entornos para entrenamiento de agentes: el modelo permite generar escenarios sinteticos con control de camara y audio, utiles para probar algoritmos de navegacion o percepcion.
- Generacion de contenido educativo: se pueden crear videos explicativos con narracion y sonido sincronizado a partir de una imagen y un guion, sin necesidad de equipos de grabacion.
- Previsualizacion arquitectonica: a partir de una imagen de un espacio, el modelo genera un recorrido virtual con sonidos ambientales (agua, viento) para presentar proyectos a clientes.
- Investigacion en modelos de mundo: el modelo sirve como base para estudiar la generacion multimodal coherente y el control interactivo en IA generativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas como FVD (Fréchet Video Distance), CLIP score, ni comparaciones con otros modelos de generacion de video.

## Requisitos de hardware

- VRAM estimada para inferencia: dado el tamano de ~19,8 mil millones de parametros, se requieren aproximadamente 39 GB de VRAM en bfloat16 (sin cuantizacion). Con cuantizacion int8 (si estuviera disponible) se reduciria a ~20 GB, y con int4 a ~10 GB, pero no se han publicado versiones cuantizadas.
- GPU recomendadas: para inferencia completa en bfloat16 se necesitan GPU profesionales como A100 (80 GB), H100 (80 GB) o RTX 6000 Ada (48 GB). En GPUs consumer de gama alta como RTX 4090 (24 GB) solo sera posible con cuantizacion o usando `enable_model_cpu_offload()` para descargar pesos a CPU.
- Opciones de despliegue: el modelo esta disenado para Diffusers, por lo que se puede usar con `ModularPipeline` y `enable_model_cpu_offload()`. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que es un modelo de generacion de video y audio, no de texto.
- Latencia y throughput: no se proporcionan datos oficiales. La generacion de 241 fotogramas con 30 pasos de inferencia puede tardar varios minutos incluso en GPU de alta gama, dependiendo de la resolucion y la implementacion.

## Comparativa con modelos similares

No disponible. No se ha encontrado informacion sobre modelos directamente comparables en terminos de generacion de video con audio sincronizado y control de camara. Modelos como Sora (OpenAI) o Gen-3 (Runway) generan video a partir de texto, pero no incluyen audio sincronizado ni control de camara interactivo, y no son de codigo abierto. Otros modelos abiertos como Stable Video Diffusion no ofrecen generacion de audio ni control de camara.

## Limitaciones y advertencias

- Licencia restrictiva: solo permite uso academico y de investigacion no comercial. No se puede utilizar en productos comerciales sin una licencia especifica.
- Idioma limitado: el modelo esta entrenado principalmente en ingles, por lo que los prompts en otros idiomas pueden producir resultados suboptimos.
- Riesgo de alucinaciones: como todo modelo generativo, puede producir contenido visual o auditivo que no corresponda con el prompt o que contenga inconsistencias.
- Control de camara limitado: las acciones de camara son discretas y predefinidas (movimientos basicos), no permiten trayectorias complejas o cinematicas avanzadas.
- Requisitos de hardware elevados: la generacion de secuencias largas (241 fotogramas) exige GPUs con mucha memoria, lo que limita su uso en entornos con recursos modestos.
- Sin garantias de calidad de audio: la sincronizacion del audio con el video puede presentar fallos en escenas complejas, y la calidad de la voz generada no esta especificada.
- Fecha de creacion: el modelo fue creado en septiembre de 2026, por lo que su madurez y estabilidad aun no estan probadas en produccion.

## Enlaces

- Repositorio HuggingFace (formato Diffusers): https://huggingface.co/Echo-Team/Echo-WM-Base-Diffusers
- Checkpoint original: https://huggingface.co/Echo-Team/Echo-WM
- Pagina del proyecto: https://echo-team-joy-future-academy-jd.github.io/Echo-1.5-Page/wm/
- Codigo fuente: https://github.com/jd-opensource/JoyAI-Echo/tree/main/echo_wm
- Paper (arXiv): https://arxiv.org/abs/2608.23189
- Licencia: https://github.com/jd-opensource/JoyAI-Echo/blob/main/LICENSE

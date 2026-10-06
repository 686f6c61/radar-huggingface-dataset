# h3lloworld/ebc-jepa-rope-xattn16-desc-cont-s2-ed24-denoiser

## Resumen

EBC-JEPA ED24 denoiser es un modelo de investigacion para el denoising de datos de camaras de eventos, publicado por el usuario h3lloworld en HuggingFace bajo licencia MIT. No es un modelo de lenguaje ni un modelo generativo de imagenes: es un adaptador entrenado sobre el backbone V-JEPA 2.1 ViT-B de Meta, orientado a limpiar el ruido inherente a los flujos de eventos (pixeles que cambian de forma asincrona) que producen este tipo de sensores.

Tecnicamente es un experimento controlado sobre la posicion de codificacion rotatoria (RoPE) en la familia EBC-JEPA (Event-Based Camera JEPA). El identificador del modelo, `rope_xattn16_desc_cont_s2`, indica una variante con cross-attention de 16 cabezas, descriptores desactivados y modo RoPE continuo, comparada contra alternativas discretas. Sobre el backbone congelado de V-JEPA 2.1 se anaden adaptadores LoRA de rango 8 en las proyecciones qkv y proj, mas una cabeza especifica por evento (`per-event head`) y una proyeccion de tokenizacion de eventos.

Su relevancia es acotada pero concreta: el repositorio no acumula descargas ni validacion externa (0 descargas, 0 likes en el momento de la consulta) y solo publica los tensores entrenados, no los pesos completos. Aun asi, resulta util para investigadores que trabajen en denoising de vision por eventos, ya que documenta un protocolo de entrenamiento reproducible sobre ED24 (2.100 ficheros oficiales) y define un conjunto de evaluacion de generalizacion con DND21 y E-MLB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | V-JEPA 2.1 ViT-B (transformer de vision de la familia JEPA) con adaptadores LoRA en qkv y proj (rango 8), tokenizador de eventos y cabeza por evento |
| Parametros totales | no disponible (el repositorio solo contiene los tensores entrenados; el backbone es un ViT-B) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible (modelo de vision sobre ventanas temporales de eventos; la configuracion de ventana, layout y modo RoPE esta en `config.json`) |
| Tipos de cuantizacion | no disponible (no se publican pesos cuantizados) |
| Idiomas soportados | no aplica (modelo de vision, sin procesamiento de lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt`); requiere cargarse sobre el checkpoint base publico `vjepa2_1_vitb_dist_vitG_384.pt` |

## Arquitectura y entrenamiento

La base es V-JEPA 2.1 ViT-B, un transformer de vision de tipo joint-embedding predictive architecture (JEPA) desarrollado por Meta. En lugar de reconstruir pixeles, los modelos JEPA aprenden representaciones prediciendo embeddings en un espacio latente. El checkpoint base empleado (`vjepa2_1_vitb_dist_vitG_384`) es una version ViT-B destilada a partir de un modelo ViT-G y opera a resolucion 384. Sobre ese backbone, el autor entrena exclusivamente un conjunto reducido de tensores: una proyeccion del tokenizador de eventos, una cabeza por evento y adaptadores LoRA de bajo rango (r = 8) aplicados a las matrices qkv y proj de la atencion.

El entrenamiento se realiza sobre la totalidad de los 2.100 ficheros oficiales del dataset ED24 (asociado a EDformer), con los descriptores desactivados. La variante `rope_xattn16_desc_cont_s2` forma parte de un barrido experimental sobre el uso de RoPE continuo frente a discreto, con 16 cabezas de cross-attention. La generalizacion se evalua sobre DND21 y E-MLB. No se documentan en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset, ni si se emplearon tecnicas de alineacion como RLHF o DPO (no aplicables en un contexto de vision pura). El repositorio incluye un fichero `metrics.json` con resultados, pero sus valores no forman parte de la informacion proporcionada.

## Capacidades

- Denoising de flujos de eventos: eliminacion de ruido en la senal de camaras de eventos, que es la tarea principal para la que se entreno el modelo.
- Tokenizacion de eventos: aprende una proyeccion propia para convertir la representacion cruda de eventos en tokens compatibles con el backbone V-JEPA 2.1.
- Cabeza por evento: prediccion a nivel de evento individual, segun se describe en la model card.
- Extraccion de representaciones latentes: al derivar del backbone V-JEPA 2.1, puede producir embeddings de video/eventos utiles para tareas posteriores.
- Adaptacion eficiente: los adaptadores LoRA permiten reutilizar el backbone congelado y reentrenar solo una fraccion pequena de parametros.
- Evaluacion de generalizacion: el modelo esta pensado para medirse sobre ED24 (entrenamiento) y DND21 y E-MLB (prueba).
- No soporta tool calling, function calling, agentes, razonamiento multietapa ni capacidades multilingues: no es un modelo de lenguaje.
- No dispone de modo de razonamiento explicito (thinking mode), vision generativa, audio ni generacion de texto.

## Casos de uso

- Preprocesado en pipelines de robotica con camaras de eventos: el denoiser limpia la senal antes de pasarla a modulos de odometria visual o control, lo que reduce falsos positivos en la deteccion de movimiento a alta frecuencia temporal.
- Vision nocturna y conduccion autonoma: las camaras de eventos funcionan en condiciones de baja luminosidad; limpiar la senal permite mantener la deteccion de objetos cuando el ruido del sensor domina la lectura.
- Seguimiento de objetos a alta velocidad con drones: al eliminar ruido por evento, el tracker aguas abajo recibe menos detecciones espurias en escenas con mucho movimiento relativo.
- Interaccion y reconocimiento de gestos en AR/VR: los flujos de eventos son adecuados para baja latencia; el denoising mejora la precision de reconocimiento en manos y dedos en movimiento rapido.
- Investigacion en arquitecturas JEPA para vision por eventos: el modelo sirve como punto de partida reproducible para comparar variantes de RoPE (continuo frente a discreto) y de cross-attention.
- Ablacion y reproducibilidad experimental: los scripts `tools/lora_denoise/eval_emlb.py` y el protocolo documentado en `docs/lora_denoise/HANDOFF.md` permiten repetir la tabla de resultados y verificar variantes.
- Fine-tuning sobre nuevos dominios de eventos: al ser adaptadores LoRA pequenos sobre un backbone congelado, es viable reentrenar la cabeza de denoising con datasets propios sin reentrenar el ViT-B completo.
- Benchmarking de sensores o datasets de eventos: puede emplearse como referencia cuantitativa al comparar ED24, DND21 y E-MLB con nuevas propuestas de denoising.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye un fichero `metrics.json`, pero su contenido no se ha facilitado, por lo que no se pueden reportar cifras de PSNR, SSIM ni de ninguna otra metrica sobre ED24, DND21 o E-MLB.

## Requisitos de hardware

- VRAM estimada para inferencia: no hay mediciones publicadas. Como referencia orientativa, un backbone ViT-B estandar ocupa del orden de 0,3-0,5 GB en fp32 y ~0,2 GB en fp16 para los pesos; a ello hay que sumar las activaciones de las ventanas temporales de eventos, cuyo consumo depende de la configuracion de `config.json`.
- GPU recomendadas: cualquier GPU con soporte de PyTorch moderno; al tratarse de un ViT-B, una RTX 3060/4070 o superior es suficiente en la mayoria de configuraciones. Para lotes grandes o ventanas temporales largas, se recomienda A100, H100 o L40S.
- Viabilidad en GPU de consumo: si, es previsiblemente ejecutable en GPUs de consumo con 8-12 GB de VRAM, dado el tamano del backbone y que solo se anaden adaptadores LoRA de rango bajo.
- Opciones de despliegue: inferencia directa con PyTorch mediante los scripts del repositorio de codigo (`tools/lora_denoise/eval_emlb.py`). No hay soporte publicado para vLLM, llama.cpp, Ollama, TGI ni formatos GGUF, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / ventana | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EBC-JEPA ED24 denoiser (este modelo) | Adaptador LoRA sobre V-JEPA 2.1 ViT-B para denoising de eventos | no disponible | no disponible | MIT | Pesos parciales en HuggingFace (`trainable.pt`) |
| V-JEPA 2.1 ViT-B (`vjepa2_1_vitb_dist_vitG_384`) | Backbone de vision JEPA (Meta) | no disponible en la informacion proporcionada | no disponible | MIT | Checkpoint completo en servidor de Meta |
| EDformer | Modelo de denoising de datos de eventos citado como origen del dataset ED24 | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |

No se dispone de datos comparativos de rendimiento entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion sin validacion externa: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de verificacion independiente.
- Los pesos publicados son parciales (`trainable.pt` contiene solo tokenizador, cabeza y LoRA); sin el checkpoint base de Meta el modelo no es funcional.
- El repositorio tiene un tamano reportado de 0,0 GB, coherente con un contenido de adaptadores, pero no hay confirmacion de que todos los ficheros esten correctamente subidos.
- No hay informacion sobre sesgos del modelo. Al operar sobre senales de sensores, los sesgos potenciales se refieren a dominios de captura (iluminacion, tipo de escena, sensor), no a sesgos sociales.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero existe el riesgo de artefactos al eliminar eventos reales o al conservar ruido, especialmente fuera del dominio de ED24.
- Limitacion de generalizacion: el entrenamiento se limita a ED24; el rendimiento en DND21 y E-MLB se plantea como prueba de generalizacion, no como dominio de entrenamiento.
- Sin soporte de lenguaje ni de instrucciones: no puede emplearse para tareas de texto, dialogo, codigo ni agentes.
- Licencia MIT, permisiva para uso comercial, pero el modelo depende de V-JEPA 2.1 de Meta, tambien bajo MIT; conviene verificar los terminos del checkpoint base antes de un despliegue en produccion.
- Fecha de creacion registrada como 2026-10-06, posterior a la fecha habitual de consulta; conviene verificar la vigencia del repositorio.
- Ausencia de cuantizaciones oficiales: no hay versiones GGUF, int8 ni int4 publicadas, lo que limita el despliegue en hardware muy restringido.
- No se documentan requisitos de version de PyTorch, dependencias ni pasos de instalacion mas alla de los scripts de evaluacion.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/h3lloworld/ebc-jepa-rope-xattn16-desc-cont-s2-ed24-denoiser
- Codigo fuente (rama `denoise-lora`): https://github.com/whohyf/EBC-JEPA-share/tree/denoise-lora
- Checkpoint base V-JEPA 2.1 ViT-B (Meta): https://dl.fbaipublicfiles.com/vjepa2/vjepa2_1_vitb_dist_vitG_384.pt
- No se han proporcionado enlaces adicionales a papers, blogs, demos o datasets (ED24, DND21, E-MLB) en la informacion disponible.

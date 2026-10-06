# h3lloworld/ebc-jepa-rope-xattn16-cont-ed24-denoiser

## Resumen

EBC-JEPA RoPE experiment `rope_xattn16_cont` (ED24) es un modelo de denoising de datos de camara de eventos desarrollado por el usuario `h3lloworld`. No es un modelo de lenguaje ni un modelo multimodal texto-imagen: es un cabezal de limpieza de senal sobre representaciones de video, construido como un experimento controlado sobre el backbone V-JEPA 2.1 ViT-B de Meta. Su funcion es eliminar ruido de flujos de eventos (los sensores neuromorficos que registran cambios de luminosidad por pixel de forma asincrona) para que las representaciones aprendidas sean utilizables en tareas posteriores de vision.

El modelo se publica como un conjunto de tensores entrenables (`trainable.pt`) que se cargan sobre el checkpoint publico de V-JEPA 2.1 ViT-B. Concretamente, el entrenamiento ajusta la proyeccion del tokenizador de eventos, un cabezal por evento y adaptadores LoRA de rango 8 sobre las proyecciones qkv y de salida. El repo ocupa 0,0 GB, lo que confirma que no se redistribuyen los pesos del backbone, solo el delta entrenado.

El interes de esta publicacion es metodologico: forma parte de una comparativa entre codificaciones posicionales rotatorias (RoPE) continuas y discretas aplicadas a datos de eventos, con atencion cruzada de 16 cabezales. Se entreno sobre la totalidad de los 2.100 ficheros oficiales del dataset ED24 procedente de EDformer, y se evalua en generalizacion sobre DND21 y E-MLB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ViT-B (V-JEPA 2.1) con RoPE y atencion cruzada de 16 cabezales, mas LoRA y cabezal por evento |
| Parametros totales | No disponible (backbone ViT-B de V-JEPA 2.1; el repo solo contiene tensores entrenables) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (la ventana y el modo de lectura se definen en `config.json`, no se detallan en la model card) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo de vision sobre eventos, sin entrada o salida de texto) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt`); `trainable.pt` con tensores entrenables, mas `metrics.json` y `config.json` |

## Arquitectura y entrenamiento

El modelo parte de V-JEPA 2.1 ViT-B, un encoder de video basado en Vision Transformer que aprende representaciones predictivas en el espacio latente. Sobre ese backbone se anaden tres piezas entrenables: una proyeccion que convierte el flujo de eventos en tokens compatibles con el encoder, un cabezal por evento que produce la salida de denoising, y adaptadores LoRA de rango 8 aplicados a las matrices qkv y a la proyeccion de salida de la atencion. Segun la model card, los descriptores estan desactivados ("descriptors off") y, por tanto, el modelo opera sobre la senal cruda de eventos. La variante concreta es `rope_xattn16_cont`, es decir, la rama con RoPE continua dentro del experimento que compara codificaciones posicionales continuas frente a discretas.

El entrenamiento usa los 2.100 ficheros oficiales del dataset ED24 (EDformer) en su totalidad, sin subconjunto de validacion indicado en la informacion disponible. No se especifica en la model card el numero de tokens, la composicion exacta del dataset, ni si hubo etapas de RLHF o DPO, algo por otra parte poco habitual en un modelo de vision. Como pruebas de generalizacion se emplean DND21 y E-MLB. El ajuste se hace de forma eficiente mediante LoRA, de modo que el coste de reentrenamiento es bajo comparado con un fine-tuning completo del ViT-B.

## Capacidades

- Denoising de flujos de eventos: recibe datos de camara de eventos y produce una version limpia de la senal mediante un cabezal por evento.
- Extraccion de representaciones latentes: al apoyarse en V-JEPA 2.1 ViT-B, genera embeddings de video utilizables por cabezales posteriores.
- Adaptacion eficiente mediante LoRA: los tensores entrenables se pueden cargar sobre el checkpoint base sin redistribuir el backbone completo.
- Evaluacion de generalizacion: incluye utilidades para medir el comportamiento sobre DND21 y E-MLB, mas alla del dominio de entrenamiento ED24.
- Capacidades de generacion de texto, razonamiento, codigo, matematicas, vision semantica de alto nivel, tool calling, function calling y agentes: no disponibles, no son funciones de este modelo.
- Capacidades multilingues: no aplica, el modelo no procesa lenguaje natural.
- Modo de pensamiento, audio o vision convencional en RGB: no disponibles en la informacion proporcionada.

## Casos de uso

- Preprocesado en pipelines de vision neuromorfica: el modelo limpia el flujo de eventos antes de alimentar modulos de deteccion o clasificacion, reduciendo el ruido que degrada el rendimiento de los cabezales posteriores.
- Robotica y SLAM con camaras de eventos: en odometria visual y mapeo, un flujo de eventos denoised mejora la estimacion de movimiento en escenas con iluminacion dificil, donde una camara RGB convencional falla.
- Vision en conduccion autonoma con alto rango dinamico: los sensores de eventos capturan cambios bruscos de luz (tuneles, deslumbramientos) sin saturarse; el denoiser limpia la senal antes de la etapa de percepcion.
- Investigacion reproducible en el benchmark E-MLB: el script `eval_emlb.py` permite reproducir la evaluacion del experimento sobre un directorio de ejecuciones, util para comparar variantes.
- Comparativa de codificaciones posicionales: al ser un brazo del experimento RoPE continuo frente a discreto, sirve para estudiar el efecto de la codificacion posicional en datos de eventos.
- Fine-tuning sobre dominios propios: gracias a LoRA r8, un equipo puede reentrenar solo los tensores adaptadores con su propio dataset de eventos sin tocar el backbone.
- Drones y plataformas con restricciones de energia: la eficiencia del sensor de eventos y el bajo coste de adaptacion encajan en sistemas embarcados, siempre que la ventana de inferencia sea la adecuada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye un fichero `metrics.json` que presumiblemente contiene las metricas del experimento, pero sus valores no se detallan en la model card ni en los datos proporcionados, por lo que no se reproducen aqui.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como orientacion, un backbone ViT-B en precision de 32 bits ocupa del orden de 0,3-0,5 GB solo en pesos, a lo que hay que sumar activaciones y el procesamiento del flujo de eventos; estas cifras son una estimacion general de la clase de modelo, no un dato publicado para este experimento.
- GPU recomendadas: no disponibles en la informacion proporcionada. El entrenamiento se hizo con LoRA, por lo que no exige necesariamente aceleradores de gama alta, pero no se especifica el hardware empleado.
- Encaje en GPU de consumo: probable segun el tamano del backbone ViT-B, pero no confirmado en la documentacion del autor.
- Opciones de despliegue: no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI (son herramientas orientadas a modelos de lenguaje y no aplican). El flujo de uso documentado es evaluar con `tools/lora_denoise/eval_emlb.py` cargando `trainable.pt` sobre el checkpoint `vjepa2_1_vitb_dist_vitG_384.pt`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Backbone | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| EBC-JEPA `rope_xattn16_cont` (ED24) | Denoising de eventos con LoRA | V-JEPA 2.1 ViT-B | No disponible | No disponible | MIT | Repo con solo tensores entrenables |
| V-JEPA 2.1 ViT-B | Encoder de video auto-supervisado | ViT-B | No disponible | No disponible | MIT | Checkpoint publico de Meta |
| EDformer | Baseline de denoising de eventos | No disponible | No disponible | No disponible | No disponible | Dataset ED24 / DND21 / E-MLB |
| Otras variantes EBC-JEPA (RoPE discreto, otros cabezales) | Mismo pipeline experimental | V-JEPA 2.1 ViT-B | No disponible | No disponible | MIT | Mismo autor, repos separados |

No se dispone de datos numericos comparativos publicados en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona sobre lenguaje natural y no soporta tool calling ni agentes.
- El repositorio no incluye los pesos del backbone: para usarlo hay que descargar aparte el checkpoint de V-JEPA 2.1 ViT-B y cargar los tensores entrenables encima. Sin ese paso, `trainable.pt` es inutilizable.
- El repo ocupa 0,0 GB y no tiene descargas ni likes: es un artefacto de experimento, sin senales de validacion por parte de la comunidad.
- No se documentan sesgos, tasas de alucinacion (concepto poco aplicable aqui) ni limites de contexto. Tampoco se detalla la composicion del dataset ED24 mas alla de su origen.
- Al entrenarse sobre los 2.100 ficheros oficiales de ED24 sin validacion indicada, existe riesgo de sobreajuste al dominio; la propia model card remite a DND21 y E-MLB como pruebas de generalizacion.
- La licencia es MIT y permite uso comercial, pero se apoya en V-JEPA 2.1 de Meta, tambien MIT; conviene verificar las condiciones del checkpoint base y de los datasets empleados (ED24, DND21, E-MLB) antes de un despliegue en produccion.
- El nombre del experimento (`cont`, `xattn16`, `ed24`) sugiere un ajuste muy concreto; generalizar los resultados a otros sensores o resoluciones requiere reentrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/h3lloworld/ebc-jepa-rope-xattn16-cont-ed24-denoiser
- Codigo del proyecto (rama `denoise-lora`): https://github.com/whohyf/EBC-JEPA-share/tree/denoise-lora
- Checkpoint base V-JEPA 2.1 ViT-B: https://dl.fbaipublicfiles.com/vjepa2/vjepa2_1_vitb_dist_vitG_384.pt
- No se han encontrado enlaces adicionales relevantes en la busqueda web.

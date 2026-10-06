# h3lloworld/ebc-jepa-rope-event-disc-ed24-denoiser

## Resumen

EBC-JEPA RoPE experiment rope_event_disc (ED24) es un modelo de denoising de flujos de eventos para camaras de eventos, publicado por el usuario h3lloworld en HuggingFace bajo licencia MIT. No es un modelo de lenguaje: se trata de un adaptador de investigacion construido sobre el backbone de vision V-JEPA 2.1 ViT-B de Meta, al que se anaden una proyeccion de tokenizador de eventos, una cabeza por evento y adaptadores LoRA de rango 8 sobre las proyecciones qkv y proj.

El objetivo declarado es un experimento comparativo entre codificacion posicional rotatoria (RoPE) continua y discreta, identificado en el nombre del modelo como `rope_event_disc`. El modelo se entrena sobre la totalidad de los 2.100 ficheros oficiales del dataset ED24 (EDformer) y se evalua en generalizacion sobre DND21 y E-MLB.

Es relevante como artefacto de investigacion reproducible mas que como modelo listo para produccion: el repositorio solo contiene el fichero `trainable.pt` con los tensores entrenados, que deben cargarse encima del checkpoint publico de V-JEPA 2.1 ViT-B. El repositorio registra 0 descargas y 0 likes, y su tamano es de 0,0 GB, lo que sugiere que los pesos no estan efectivamente alojados o no se han subido completos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de vision (V-JEPA 2.1 ViT-B) con proyeccion de tokenizador de eventos, cabeza por evento y adaptadores LoRA (qkv, proj; rango 8) |
| Parametros totales | no disponible (backbone ViT-B; el repositorio solo contiene tensores entrenados) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (el layout y la ventana se definen en `config.json`, no incluido en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision, no procesa lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt`), mas `metrics.json` y `config.json` |
| Tarea | Denoising de flujos de eventos (event-camera denoising) |
| Fecha de publicacion | 2026-10-06 (segun metadatos de HuggingFace) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura parte del backbone V-JEPA 2.1 ViT-B preentrenado por Meta, un transformer de vision con atencion estandar. Sobre el se anaden tres componentes entrenables: una proyeccion que convierte los eventos en tokens compatibles con el backbone, una cabeza especifica por evento para la salida de denoising, y adaptadores LoRA de rango 8 aplicados a las proyecciones qkv y proj. Los descriptores (`descriptors`) estan desactivados en esta configuracion. La innovacion experimental concreta es la variante de RoPE empleada (continua frente a discreta) y su efecto sobre el denoising de eventos, que es precisamente la variable que aísla este run.

El entrenamiento usa la totalidad de los 2.100 ficheros oficiales del dataset ED24, procedente de EDformer. No se documenta en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO u otro ajuste por preferencias (no aplicables en un modelo de vision de este tipo). La evaluacion de generalizacion se plantea sobre DND21 y E-MLB mediante el script `tools/lora_denoise/eval_emlb.py`. El protocolo experimental y las tablas de resultados estan descritos en `docs/lora_denoise/HANDOFF.md` del repositorio de codigo.

## Capacidades

- Denoising de flujos de eventos: recibe representaciones de eventos de camara y devuelve una version denoised, mediante una cabeza por evento acoplada al backbone V-JEPA 2.1.
- Extraccion de caracteristicas de video/eventos: al apoyarse en V-JEPA 2.1 ViT-B, hereda la representacion latente del backbone preentrenado, ajustada con LoRA.
- Adaptacion ligera: los tensores entrenados (proyeccion del tokenizador, cabeza y LoRA) se cargan sobre el checkpoint publico, lo que permite reutilizar el backbone sin redistribuirlo.
- Evaluacion de variantes de RoPE: el run esta disenado para medir el efecto de RoPE continuo frente a discreto en esta tarea.
- Tool calling / function calling: no aplica, no es un modelo de lenguaje.
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no aplica, el modelo no procesa texto.
- Capacidades especiales (vision, audio, thinking mode): vision de eventos exclusivamente; no hay soporte de audio ni modo de razonamiento explicito.

## Casos de uso

- Robotica movil con camaras de eventos: el modelo puede limpiar el ruido de la senal de eventos antes de alimentar algoritmos de odometria visual o SLAM, donde el ruido de fondo degrada las correspondencias de caracteristicas.
- Vision en condiciones de baja iluminacion o alto rango dinamico: las camaras de eventos se usan en escenas con contraste extremo; el denoising previo mejora la calidad de los mapas de eventos antes del reconocimiento.
- Vehiculos autonimos y ADAS: reduccion de ruido en sensores neuromorficos que operan a alta frecuencia temporal, donde los falsos positivos de eventos pueden confundirse con obstaculos reales.
- Drones y UAV de alta velocidad: el flujo de eventos sin desenfoque de movimiento es util para evitacion de obstaculos; el denoising reduce eventos espurios a alta velocidad angular.
- Seguimiento ocular en gafas AR/VR: las camaras de eventos capturan movimientos sacadicos rapidos con bajo consumo; limpiar el ruido mejora la estimacion de la mirada.
- Inspeccion industrial de alta velocidad: deteccion de defectos en lineas de produccion donde una camara de eventos registra cambios de contraste a frecuencias que una camara RGB no alcanza.
- Investigacion en vision neuromorfica: el modelo sirve como baseline reproducible sobre ED24, DND21 y E-MLB para comparar variantes de codificacion posicional y estrategias de adaptacion LoRA.
- Preprocesado en pipelines de percepcion multimodal: uso del backbone ajustado como extractor de caracteristicas de eventos para tareas posteriores de clasificacion o deteccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye un fichero `metrics.json` que presumiblemente contiene las metricas del run, pero sus valores no forman parte de los datos proporcionados. La model card menciona evaluacion sobre ED24 (entrenamiento), DND21 y E-MLB (generalizacion), sin cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada.
- GPU recomendadas: no disponible. El backbone es un ViT-B, pero no se documentan requisitos oficiales.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; el backbone ViT-B y los adaptadores LoRA r8 son de escala reducida, pero no hay datos verificables de consumo de memoria.
- Opciones de despliegue: PyTorch con el checkpoint publico de V-JEPA 2.1 ViT-B mas `trainable.pt`; evaluacion mediante `tools/lora_denoise/eval_emlb.py`. No aplican servidores de inferencia de lenguaje como vLLM, TGI, llama.cpp u Ollama, ya que no es un modelo autorregresivo de texto y no se distribuye en formato GGUF.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EBC-JEPA RoPE rope_event_disc (ED24) | no disponible (ViT-B + LoRA r8) | no disponible (definida en `config.json`) | Denoising de eventos | MIT | HuggingFace, 0 descargas, repo de 0,0 GB |
| V-JEPA 2.1 ViT-B (Meta) | no disponible en la informacion proporcionada | no disponible | Representacion de video auto-supervisada | MIT | Checkpoint publico en `dl.fbaipublicfiles.com` |
| EDformer | no disponible | no disponible | Denoising de eventos (origen del dataset ED24) | no disponible | Referenciado como fuente del dataset ED24 |
| Otros runs EBC-JEPA (`denoise-lora`) | no disponible | no disponible | Denoising de eventos | MIT (segun el repositorio de codigo) | Repositorio GitHub |

Los datos de parametros, contexto y rendimiento de las alternativas no estan incluidos en la informacion proporcionada; la comparacion cuantitativa no es posible con los datos disponibles.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no soporta tool calling, agentes ni capacidades multilingues. Cualquier evaluacion con criterios de LLM seria inaplicable.
- El repositorio indica un tamano de 0,0 GB y 0 descargas, lo que sugiere que los ficheros (`trainable.pt`, `metrics.json`, `config.json`) pueden no estar disponibles o no haberse subido correctamente. Conviene verificar antes de intentar cargarlo.
- El modelo no es autonomo: requiere descargar aparte el checkpoint de V-JEPA 2.1 ViT-B de Meta y disponer del repositorio de codigo `EBC-JEPA-share` (rama `denoise-lora`) para poder ejecutar la evaluacion.
- Los hiperparametros criticos (layout de eventos, tamano de ventana, modo de lectura, variante de RoPE) residen en `config.json`, que no se incluye en la informacion proporcionada; sin el, la reproducibilidad del run queda comprometida.
- No hay resultados de benchmarks publicados en la informacion disponible, por lo que no es posible validar la calidad del denoising ni compararla con alternativas.
- La fecha de creacion registrada (2026-10-06) es posterior a la fecha de actualizacion esperada y poco habitual, lo que apunta a posibles inconsistencias en los metadatos del repositorio.
- Riesgo de sobreajuste al dominio: el entrenamiento usa exclusivamente ED24; el propio autor separa DND21 y E-MLB como pruebas de generalizacion, lo que implica que el comportamiento fuera de esa distribucion no esta garantizado.
- Licencia MIT: permite uso comercial y modificacion, pero al derivar de V-JEPA 2.1 (tambien MIT) conviene conservar las atribuciones correspondientes a Meta y verificar los terminos del dataset ED24, cuya licencia no se documenta aqui.
- No se documentan sesgos, pero al ser un modelo de percepcion sensible a las caracteristicas estadisticas de los datos de entrenamiento, puede degradarse en condiciones de sensor distintas (resolucion, tasa de eventos, ruido de fondo) a las de ED24.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/h3lloworld/ebc-jepa-rope-event-disc-ed24-denoiser
- Repositorio de codigo (rama `denoise-lora`): https://github.com/whohyf/EBC-JEPA-share/tree/denoise-lora
- Protocolo experimental (`docs/lora_denoise/HANDOFF.md`): https://github.com/whohyf/EBC-JEPA-share/blob/denoise-lora/docs/lora_denoise/HANDOFF.md
- Checkpoint base de V-JEPA 2.1 ViT-B (Meta): https://dl.fbaipublicfiles.com/vjepa2/vjepa2_1_vitb_dist_vitG_384.pt
- Busqueda web: no se han encontrado resultados relevantes sobre este modelo; las consultas devolvieron unicamente recetas de cocina sin relacion con el modelo.

# h3lloworld/ebc-jepa-rope-xattn16-desc-cont-ed24-denoiser

## Resumen
EBC-JEPA RoPE experiment `rope_xattn16_desc_cont` (ED24) es un checkpoint de adaptadores para eliminacion de ruido en flujos de camara de eventos, publicado por el usuario h3lloworld dentro de la familia EBC-JEPA (Event-Based Camera JEPA). No es un modelo autonomo: el fichero `trainable.pt` contiene unicamente los tensores entrenados (proyeccion del tokenizador de eventos, cabeza per-event y adaptadores LoRA de rango 8 sobre `qkv` y `proj`) que se cargan encima del checkpoint publico V-JEPA 2.1 ViT-B de Meta. El `config.json` define la disposicion de la ventana, el modo de lectura y el modo RoPE, que en esta variante es continuo con 16 cabezas de atencion cruzada y descriptores desactivados.

El problema que aborda es el ruido en sensores de eventos (pixeles que disparan eventos espurios), un cuello de botella clasico en pipelines de vision basada en eventos para robotica, automocion y vision de alta velocidad. El modelo se entreno sobre la totalidad de ED24 (los 2.100 ficheros oficiales del dataset de EDformer) y su generalizacion se evalua sobre DND21 y E-MLB.

Es relevante ahora como artefacto de investigacion reproducible: forma parte de una comparativa entre RoPE continuo y discreto, esta publicado con licencia MIT y su tamano reducido (adaptadores LoRA sobre un backbone ViT-B) lo hace asequible para reproduccion academica. Su madurez es, no obstante, temprana: cero descargas, cero likes y un repositorio de 0,0 GB.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | ViT-B de V-JEPA 2.1 (Meta) con adaptadores LoRA r=8 en `qkv` y `proj`, proyeccion de tokenizador de eventos, cabeza per-event, atencion cruzada de 16 cabezas y RoPE en modo continuo (`rope_xattn16_desc_cont`); descriptores desactivados |
| Parametros totales | no disponible (solo se publican los tensores entrenables, no el recuento total; el backbone ViT-B es un checkpoint externo) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (el `config.json` define ventana y modo de lectura, pero los valores no se incluyen en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; procesa datos de sensores de eventos) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt`); no se publican safetensors ni GGUF |

## Arquitectura y entrenamiento
El backbone es V-JEPA 2.1 ViT-B, un transformer de vision basado en el paradigma JEPA (Joint Embedding Predictive Architecture) de Meta, que aprende representaciones prediciendo en espacio latente en lugar de reconstruir pixeles. Sobre ese backbone congelado se anaden adaptadores LoRA de rango 8 en las proyecciones de consulta, clave, valor y salida, mas una proyeccion especifica para el tokenizador de eventos y una cabeza per-event que produce la salida de denoising evento a evento. El sufijo del experimento indica atencion cruzada con 16 cabezas y RoPE en modo continuo, en contraste con variantes discretas del mismo estudio.

El entrenamiento utilizo ED24 completo, con 2.100 ficheros oficiales, y el protocolo de evaluacion se apoya en DND21 y E-MLB. No se especifican en la informacion disponible el numero de tokens o eventos de entrenamiento, la composicion exacta del dataset, la funcion de perdida ni si hubo etapas de ajuste con RLHF o DPO; el numero de parametros del backbone tampoco se detalla. La innovacion destacable es metodologica: un banco de pruebas controlado para comparar codificaciones posicionales rotatorias continuas frente a discretas en un denoiser de eventos, con el codigo y la tabla de protocolo publicados en el repositorio de GitHub.

## Capacidades
- Denoising de flujos de camara de eventos: la cabeza per-event actua sobre la representacion de cada evento, no sobre frames completos.
- Extraccion de representaciones latentes sobre el backbone V-JEPA 2.1 ViT-B, reutilizables para tareas posteriores de vision.
- Carga como adaptador: los tensores de `trainable.pt` se superponen al checkpoint publico de V-JEPA 2.1 sin necesidad de reentrenar el backbone.
- Evaluacion integrada mediante `tools/lora_denoise/eval_emlb.py` sobre E-MLB, con soporte para comparar varias configuraciones (`--arms`).
- Reproduccion de la ablacion RoPE continuo frente a discreto y del numero de cabezas de atencion cruzada.
- No soporta generacion de texto, tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues.
- No se documentan capacidades multimodales de vision-lenguaje, audio ni modo de pensamiento.

## Casos de uso
- Preprocesado para SLAM y odometria visual en robotica: el denoising evento a evento reduce eventos espurios antes de alimentar algoritmos de estimacion de trayectoria, lo que mejora la estabilidad del seguimiento en escenas con iluminacion dificil.
- Vision nocturna y de alto rango dinamico: las camaras de eventos capturan cambios de brillo con latencia muy baja, y este adaptador limpia el ruido del sensor en condiciones de poca luz donde los sensores de fotogramas convencionales se saturan.
- Percepcion para conduccion autonoma: integrado como etapa previa a detectores y rastreadores, permite descartar eventos de ruido causados por vibracion, reflejos o deslumbramiento antes de la fusion con LiDAR o radar.
- Robotica aerea y drones: en plataformas con restricciones de peso y energia, un adaptador LoRA sobre un ViT-B es mucho mas ligero de desplegar que un denoiser entrenado desde cero, y el procesamiento por eventos reduce el ancho de banda.
- Reproduccion de resultados academicos: el repositorio incluye la tabla de protocolo en `docs/lora_denoise/HANDOFF.md`, de modo que un grupo de investigacion puede replicar la comparativa RoPE continuo/discreto sobre ED24, DND21 y E-MLB.
- Punto de partida para fine-tuning: al ser LoRA sobre un backbone congelado, permite reentrenar solo los adaptadores con un dataset de eventos propio (por ejemplo, grabaciones de un sensor concreto) sin asumir el coste de un entrenamiento completo.
- Analisis de calidad de sensores de eventos: sirve para caracterizar la tasa de ruido de un sensor comparando la salida denoised frente a la entrada cruda en el mismo flujo de eventos.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye un fichero `metrics.json` y el autor menciona evaluacion sobre DND21 y E-MLB, pero los valores numericos no se han facilitado, por lo que no se incluye tabla comparativa de metricas.

## Requisitos de hardware
- VRAM para inferencia: no disponible como cifra oficial. Como referencia orientativa, no documentada por el autor, un backbone ViT-B a 384 px en precision de 16 bits suele moverse en el rango de pocos GB, a lo que hay que sumar la activacion de la atencion cruzada de 16 cabezas y los tensores de eventos.
- GPU recomendadas: no disponibles. El autor no especifica hardware de entrenamiento ni de evaluacion.
- Viabilidad en GPU de consumo: no confirmada por el autor. Por el tamano del backbone (ViT-B) es plausible en tarjetas de gama alta de consumo, pero no hay dato publicado que lo respalde.
- Opciones de despliegue: no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje. El despliegue pasa por PyTorch y por el script `tools/lora_denoise/eval_emlb.py` del repositorio de codigo.
- Latencia y throughput: no disponibles.
- Dependencia obligatoria: hay que descargar aparte el checkpoint `vjepa2_1_vitb_dist_vitG_384.pt` de Meta, ademas de los ficheros del repositorio.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EBC-JEPA RoPE `rope_xattn16_desc_cont` (este) | no disponible (adaptadores LoRA r=8 sobre ViT-B) | no disponible | Denoising de eventos con ViT-B V-JEPA 2.1 y LoRA | MIT | Repositorio de 0,0 GB, sin descargas; requiere backbone externo y codigo de GitHub |
| V-JEPA 2.1 ViT-B (Meta), sin adaptador | no disponible en la informacion proporcionada | no disponible | Backbone JEPA de vision, sin cabeza de denoising de eventos | MIT | Checkpoint publico descargable desde los servidores de Meta |
| EDformer | no disponible en la informacion proporcionada | no disponible | Transformer especifico para denoising de eventos; origen del dataset ED24 | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada |
| E-MLB | no aplica (es un benchmark, no un modelo) | no disponible | Benchmark de denoising de eventos usado como prueba de generalizacion | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada |

## Limitaciones y advertencias
- El repositorio ocupa 0,0 GB y registra cero descargas y cero likes: conviene verificar que `trainable.pt` este realmente subido y no sea un puntero LFS roto antes de planificar cualquier uso.
- No es un modelo autonomo: sin el checkpoint `vjepa2_1_vitb_dist_vitG_384.pt` de Meta y sin el codigo de la rama `denoise-lora`, los tensores publicados no son utilizables.
- El entrenamiento se limita a ED24; la generalizacion se prueba en DND21 y E-MLB, por lo que existe riesgo de degradacion ante sensores, resoluciones o condiciones de ruido distintas de las de esos datasets.
- No hay informacion sobre sesgos, tasas de fallo, alucinacion o comportamiento en dominios fuera de distribucion; la model card no documenta analisis de errores.
- No se especifican los valores de cuantizacion, por lo que el despliegue en produccion exigiria validar por cuenta propia el impacto de fp16, bf16 o int8 en la calidad del denoising.
- No hay soporte de idiomas, texto, agentes ni tool calling; cualquier expectativa en ese sentido es un error de categoria.
- La licencia del adaptador es MIT y el backbone de Meta tambien es MIT, pero el dataset origen (ED24, de EDformer) puede tener condiciones propias que no se detallan en la informacion disponible.
- La fecha de creacion del repositorio (2026-10-03) es posterior a la fecha actual habitual de referencia; conviene tratarla como metadato del repositorio y no como garantia de estabilidad o mantenimiento.
- Ausencia total de documentacion sobre hardware, latencia y coste de entrenamiento: no es un artefacto listo para produccion sin una fase previa de validacion interna.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/h3lloworld/ebc-jepa-rope-xattn16-desc-cont-ed24-denoiser
- Codigo (rama `denoise-lora`): https://github.com/whohyf/EBC-JEPA-share/tree/denoise-lora
- Protocolo de tabla y handoff: `docs/lora_denoise/HANDOFF.md` dentro del repositorio anterior
- Checkpoint base V-JEPA 2.1 ViT-B de Meta: https://dl.fbaipublicfiles.com/vjepa2/vjepa2_1_vitb_dist_vitG_384.pt

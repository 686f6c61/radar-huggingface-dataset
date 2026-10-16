# lodestones/MOSS-Image-SFT-8-steps-dmd

## Resumen

MOSS-Image-SFT-8-steps-dmd es un checkpoint de destilacion (work-in-progress) del modelo de generacion de imagenes OpenMOSS-Team/MOSS-Image-SFT, publicado por el usuario lodestones. El objetivo es reducir el coste de inferencia del modelo base: pasa de una generacion de 50 pasos con classifier-free guidance (CFG 3) a tan solo 8 evaluaciones de red y sin CFG, manteniendo el mismo transformer subyacente. Se trata, por tanto, de un modelo de difusion latente para texto-a-imagen, no de un modelo de lenguaje.

La destilacion se ha realizado con la tecnica data-space DMD descrita en el paper arXiv 2610.12102. El generador itera sobre su propia estimacion limpia partiendo de ruido fijo, lo que da lugar a un sampler propio distinto del scheduler del modelo base. El checkpoint publicado corresponde a la actualizacion 2600 (EMA) con pesos en float32, y el transformer es un `MOSSImageTransformer` estandar que se carga con el `pipeline_moss_image.py` del repo de release.

Con 5.082.308.624 parametros en el transformer y un repositorio de 136,7 GB, el modelo esta pensado para ejecucion en fp32: segun el autor, el delta de la destilacion es mas pequeno que el paso de redondeo de bf16, de modo que cargar o ejecutar el transformer en bf16 descarta la mayor parte del efecto de la destilacion. La licencia es Apache 2.0 y la libreria de referencia es diffusers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion latente para texto-a-imagen (`MOSSImageTransformer`); destilado mediante data-space DMD |
| Parametros totales | 5.082.308.624 (~5,08 B) en el transformer |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (modelo de generacion de imagen; no aplica ventana de tokens) |
| Tipos de cuantizacion | fp32 obligatorio para el transformer, el step embedder y las modulaciones; LoRA en fp32 (rank 128, alpha 128); no se mencionan GGUF ni otras cuantizaciones |
| Idiomas soportados | no disponible (el text encoder y el tokenizer son los del repo base) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformer en fp32, `lora.safetensors`, `time_embedding.safetensors`, `generator.safetensors`, `dataspace.safetensors`) |

Datos adicionales observados en la model card: latente de 128 canales (`latent_mix.Q` es una matriz de 128x128 y el ruido se inicializa con forma `[1, 128, H//16, W//16]`), factor de downsampling del VAE de 16 y decodificacion con unpatchify 2x2. El repositorio ocupa 136,7 GB.

## Arquitectura y entrenamiento

El modelo es un transformer de difusion (familia DiT) que opera en el espacio latente de un VAE. La clase concreta es `MOSSImageTransformer`, tomada tal cual del repo base OpenMOSS-Team/MOSS-Image-SFT; el text encoder, el tokenizer y el VAE tambien provienen del repo base. La innovacion de este checkpoint no esta en la arquitectura, sino en el procedimiento de destilacion: se parte del modelo base (50 pasos, CFG 3) y se reduce a 8 evaluaciones de red sin CFG mediante data-space DMD (arXiv 2610.12102), en el que el generador itera sobre su propia estimacion limpia a partir de ruido fijo.

El sampler es propio y difiere del scheduler del release. Se carga `dataspace.safetensors` (que contiene `latent_mix.Q` y `step_codes`), se inicializa `z` con ruido gaussiano en fp32, se arranca con `x0 = 0` y se realizan 8 iteraciones de la forma `x = z + Q·x0`, evaluacion del transformer con el codigo de paso correspondiente y actualizacion `x0 = z - v`. El autor indica que el modelo esta entrenado sobre cada prefijo, por lo que funcionan tambien menos de 8 pasos. El entrenamiento se realizo con captions `scene_graph` en formato JSON compacto. El checkpoint corresponde a la actualizacion 2600 en EMA.

Se publican ademas dos formatos alternativos de adaptador para inferencia rapida en bf16 sin fusionar: `lora.safetensors` (LoRA fp32 de rango 128 y alpha 128 sobre `proj.{q,k,v,o,ffn_up_gate,ffn_down}` de cada bloque, con claves kohya) y `time_embedding.safetensors` (reemplazos fp32 de `time_embedding.*` y de las modulaciones `shared_block_modulation.bias` y `video_head_modulation.bias`, ya que el vector de tiempo t=1 esta plegado en esos sesgos). El fichero `generator.safetensors` contiene los mismos tensores con claves `<module>.lora_A/B` mas Q y los step codes.

## Capacidades

- Generacion de imagenes texto-a-imagen en espacio latente mediante difusion, a partir de prompts de texto.
- Inferencia rapida: 8 evaluaciones de red y sin classifier-free guidance, frente a los 50 pasos con CFG 3 del modelo base.
- Generacion con menos de 8 pasos (el autor indica que cada prefijo esta entrenado), a costa de calidad no especificada.
- Acepta captions estructurados del tipo `scene_graph` en JSON compacto, el formato usado durante el entrenamiento.
- Carga compatible con diffusers y con el `pipeline_moss_image.py` del repo base (`MOSSImageTransformer` estandar).
- Distribucion en varios formatos: transformer completo en fp32, LoRA fp32 para bf16 y ficheros de embeddings/parametros separados.
- No se documentan en la informacion disponible capacidades de tool calling, agentes, vision de entrada, audio ni modo de razonamiento: es un modelo exclusivamente de generacion de imagen.

## Casos de uso

- Generacion de imagenes en produccion con baja latencia: al requerir solo 8 evaluaciones de red y no usar CFG, reduce de forma notable el coste computacional por imagen respecto a los 50 pasos con CFG 3 del modelo base, lo que lo hace apto para servicios con muchas peticiones.
- Prototipado rapido de pipelines de difusion: sirve para experimentar con el transformer `MOSSImageTransformer` y el sampler de data-space DMD antes de comprometerse con el modelo base completo.
- Investigacion en destilacion de modelos de difusion: como ejemplo reproducible de data-space DMD (arXiv 2610.12102) aplicado a un transformer de 5,08 B de parametros, con el delta de destilacion separado en ficheros LoRA y de embeddings.
- Generacion de ilustraciones a partir de descripciones estructuradas: al estar entrenado sobre captions `scene_graph` en JSON compacto, encaja en flujos donde el prompt se construye programaticamente a partir de una escena con objetos, relaciones y atributos.
- Servicios interactivos de imagen (por ejemplo, previsualizaciones o variaciones en un editor): el bajo numero de pasos permite respuestas casi en tiempo real si se dispone de hardware adecuado para fp32.
- Integracion en aplicaciones basadas en diffusers: el checkpoint se carga con la libreria diffusers y el pipeline del repo base, lo que facilita su inclusion en codigo Python existente.
- Experimentacion con inferencia en bf16 mediante los adaptadores LoRA sin fusionar, para entornos donde el fp32 completo no cabe en memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (FID, CLIP score, etc.) ni comparaciones numericas con el modelo base u otros modelos.

## Requisitos de hardware

- VRAM estimada para el transformer: en fp32, los 5,08 B de parametros ocupan aproximadamente 20,3 GB solo en pesos. A ello hay que sumar el text encoder y el VAE del repo base (no cuantificados en la informacion disponible) y las activaciones, por lo que el requisito real de VRAM es sustancialmente mayor.
- El autor exige ejecucion en fp32 del transformer, el step embedder y las modulaciones para preservar la destilacion; el uso de bf16 descarta la mayor parte del efecto.
- GPU recomendadas: no se especifican en la informacion disponible. Por el tamano del transformer en fp32 y el encoder adicional, son necesarias GPU de clase profesional con 40-80 GB (por ejemplo, A100 40/80 GB o H100) o configuraciones multi-GPU.
- Encaje en GPU de consumo: el transformer en fp32 (~20,3 GB) mas el text encoder y el VAE excede con toda probabilidad la VRAM de una RTX 4090 (24 GB) si se carga todo en fp32, aunque la via de bf16 con adaptadores LoRA sin fusionar podria reducir el requisito a costa de degradar el efecto de la destilacion. No hay confirmacion en la informacion disponible.
- Opciones de despliegue: libreria diffusers y el `pipeline_moss_image.py` del repo base. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusion de imagen).
- Latencia y throughput: no disponibles. El unico dato de rendimiento indirecto es la reduccion de 50 pasos con CFG 3 a 8 pasos sin CFG.

## Comparativa con modelos similares

| Modelo | Parametros | Pasos / CFG | Licencia | Disponibilidad |
|---|---|---|---|---|
| lodestones/MOSS-Image-SFT-8-steps-dmd | 5,08 B (transformer) | 8 pasos, sin CFG | apache-2.0 | HuggingFace (0 descargas, 19 likes) |
| OpenMOSS-Team/MOSS-Image-SFT | no disponible | 50 pasos, CFG 3 | no disponible | HuggingFace (repo base) |

No se dispone de informacion sobre otros modelos comparables (mismo tamano o misma tarea) en los datos proporcionados. El unico punto de comparacion solido es el propio modelo base, del que este checkpoint es una destilacion orientada a reducir el coste de inferencia.

## Limitaciones y advertencias

- Estado work-in-progress: el propio autor lo describe como una destilacion en curso, por lo que la calidad final no esta garantizada.
- Precision obligatoria: cargar o ejecutar el transformer en bf16 (o con autocast) descarta la mayor parte de la destilacion, porque el delta de destilacion es menor que el paso de redondeo de bf16. Hay que usar fp32 en el transformer, el step embedder y las modulaciones.
- El sampler no es el scheduler del release: requiere el bucle de data-space DMD con `latent_mix.Q` y `step_codes`. Usar el sampler estandar daria resultados incorrectos.
- El step embedder y los sesgos de modulacion van acoplados (el vector de tiempo t=1 esta plegado en los sesgos), por lo que no deben separarse.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Riesgo de alucinacion: no disponible para este tipo de modelo; no hay evaluacion documentada de fidelidad prompt-imagen.
- Limitaciones de contexto o idioma: no disponibles. La cobertura linguistica depende del text encoder del repo base, no especificado.
- Restricciones de licencia: licencia Apache 2.0, que permite uso comercial, pero conviene verificar la licencia y las condiciones del modelo base (OpenMOSS-Team/MOSS-Image-SFT) del que deriva.
- Requisitos de recursos: ejecucion en fp32 con ~20,3 GB solo de transformer mas encoder y VAE, lo que limita su despliegue en hardware de consumo.
- Sin benchmarks publicados: no hay metricas objetivas de calidad ni comparativas numericas con el modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lodestones/MOSS-Image-SFT-8-steps-dmd
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Demo (Space): https://huggingface.co/spaces/hugging-apps/moss-image-8-step-dmd
- Paper de data-space DMD: arXiv 2610.12102 (referenciado en la model card)
- Repositorio de la libreria diffusers: no incluido en la informacion disponible

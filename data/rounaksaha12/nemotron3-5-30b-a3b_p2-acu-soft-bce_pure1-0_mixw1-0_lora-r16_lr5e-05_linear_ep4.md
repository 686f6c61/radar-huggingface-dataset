# rounaksaha12/nemotron3.5-30b-a3b_p2-acu-soft-bce_pure1.0_mixw1.0_lora-r16_lr5e-05_linear_ep4

## Resumen

Este repositorio contiene un adaptador LoRA (r=16) entrenado por el usuario rounaksaha12 sobre el modelo base `nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16`, un modelo de NVIDIA con arquitectura Mixture-of-Experts (30B parametros totales, ~3B activos). El objetivo declarado del fine-tuning es la deteccion de texto generado por IA (`ai-text-detection`), segun las etiquetas del repositorio. El nombre del checkpoint codifica la configuracion del entrenamiento: funciones de perdida ACU, soft-BCE, mezcla de datos con pesos `pure1.0_mixw1.0`, LoRA con rango 16, learning rate 5e-05, scheduler linear y 4 epocas.

Es relevante porque ilustra un patron habitual en Hugging Face: adaptadores especializados de bajo coste construidos sobre modelos fundacionales grandes para tareas de clasificacion/deteccion. El repo es pequeno (0,1 GB) y los pesos publicados en safetensors suman 11.367.296 parametros, lo que corresponde al adaptador LoRA y no al modelo completo. El acceso esta restringido (gated) y no se publican resultados de evaluacion ni detalles del dataset.

La ficha se limita a lo que puede verificarse en la informacion disponible; cualquier dato ausente se marca como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre transformer MoE (modelo base NVIDIA Nemotron-3.5-Lightning-30B-A3B) |
| Parametros totales | 11.367.296 (pesos del adaptador publicados); modelo base: 30B totales |
| Parametros activos | ~3B en el modelo base (MoE, segun nomenclatura A3B); no disponible para el adaptador |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Rango LoRA | 16 |
| Learning rate | 5e-05 |
| Scheduler | linear |
| Epocas | 4 |
| Funciones de perdida | ACU, soft-BCE |
| Mezcla de datos | pure1.0, mixw1.0 |
| Acceso | restringido (gated) |

## Arquitectura y entrenamiento

El artefacto publicado es un adaptador LoRA de rango 16 que se aplica sobre el modelo base `nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16`. El modelo base es un transformer con capas Mixture-of-Experts: 30B parametros totales con aproximadamente 3B activos por token (de ahi la denominacion A3B), lo que reduce el coste de inferencia frente a un modelo denso del mismo tamano. Los pesos del adaptador suman 11,37 millones de parametros en safetensors, coherente con un LoRA de rango bajo sobre un subconjunto de capas.

El nombre del checkpoint documenta la receta: perdida ACU combinada con soft-BCE, mezcla de datos con pesos `pure1.0_mixw1.0`, 4 epocas, learning rate 5e-05 y scheduler linear. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, si hubo RLHF/DPO ni innovaciones tecnicas adicionales. La tarea objetivo, segun las etiquetas, es la deteccion de texto generado por IA, lo que sugiere un uso como clasificador o cabeza de deteccion mas que como modelo generativo.

## Capacidades

- Deteccion de texto generado por IA (tarea declarada en las etiquetas del repositorio).
- Clasificacion binaria o puntuacion de probabilidad, segun el uso de soft-BCE en el entrenamiento.
- Generacion de texto y razonamiento heredados del modelo base Nemotron-3.5-Lightning-30B-A3B (no verificados en este adaptador).
- Soporte de tool calling / function calling: no disponible para el adaptador; depende del modelo base.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Moderacion de contenido en plataformas: usar el adaptador como clasificador para marcar textos sospechosos de ser generados por IA antes de revision humana, aprovechando la senal soft-BCE para obtener una probabilidad calibrada.
- Deteccion de ensayos o trabajos academicos generados automaticamente: integrar el modelo en un pipeline de preprocesado que puntue cada parrafo y derive una alerta al revisor.
- Filtrado de datasets de entrenamiento: aplicar el detector para eliminar o etiquetar muestras sinteticas antes de entrenar otros modelos, reduciendo contaminacion de datos.
- Analisis forense de contenido en medios: combinar la puntuacion del adaptador con metadatos y otras senales para triage de articulos o posts sospechosos.
- Investigacion sobre deteccion de IA: usar el checkpoint como linea base reproducible (receta LoRA documentada en el nombre) para comparar funciones de perdida y mezclas de datos.
- Integracion en APIs de verificacion: desplegar el adaptador sobre el modelo base en un servicio que devuelva una puntuacion de autenticidad por documento, con umbral configurable por el cliente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa 0,1 GB, pero requiere cargar el modelo base Nemotron-3.5-Lightning-30B-A3B en BF16 para inferencia.
- VRAM estimada para el modelo base en BF16: en torno a 60 GB (30B parametros x 2 bytes), mas overhead de activaciones y cache KV; no confirmado en la informacion disponible.
- GPU recomendadas: A100 80 GB o H100 para BF16 sin cuantizar; configuraciones multi-GPU para mayor throughput.
- En GPU de consumo (RTX 4090, 24 GB) solo cabria con cuantizacion agresiva del modelo base; no se publican pesos cuantizados de este adaptador.
- Opciones de despliegue: vLLM o TGI para el modelo base con el adaptador fusionado; llama.cpp/Ollama requeririan conversion a GGUF, no disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (LoRA sobre Nemotron-3.5-Lightning-30B-A3B) | 11,37M (adaptador); 30B base | no disponible | Deteccion de texto IA | no disponible | Gated en HF |
| NVIDIA Nemotron-3.5-Lightning-30B-A3B (base) | 30B totales / ~3B activos | no disponible | Generacion general | no disponible | HF (NVIDIA) |
| Detectores de texto IA comerciales (p. ej. GPTZero, Originality.ai) | no disponible | no disponible | Deteccion de texto IA | propietaria | API de pago |
| Clasificadores RoBERTa fine-tuned para deteccion de IA | ~125M | 512 tokens | Deteccion de texto IA | variable | Multiples en HF |

## Limitaciones y advertencias

- No se publican metricas de evaluacion (precision, recall, F1, AUC), por lo que el rendimiento real del detector es desconocido.
- El dataset de entrenamiento no esta documentado: se desconoce su composicion, idioma y posibles sesgos.
- La deteccion de texto generado por IA es intrinsecamente fragil: falsos positivos sobre texto humano y evasion ante parafraseo o edicion.
- El acceso es restringido (gated): requiere aceptar condiciones en Hugging Face antes de descargar.
- Licencia no especificada: no puede asumirse uso comercial; debe verificarse la licencia del modelo base de NVIDIA y la del adaptador.
- El repositorio tiene 5 descargas y 0 likes, sin validacion de la comunidad.
- Los pesos publicados corresponden solo al adaptador; es imprescindible el modelo base para cualquier uso.
- Riesgo de alucinacion y sesgos heredados del modelo base, no evaluados en este fine-tuning.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/rounaksaha12/nemotron3.5-30b-a3b_p2-acu-soft-bce_pure1.0_mixw1.0_lora-r16_lr5e-05_linear_ep4
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Perfil del autor: https://huggingface.co/rounaksaha12

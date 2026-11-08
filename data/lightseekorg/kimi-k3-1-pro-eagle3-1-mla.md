# lightseekorg/kimi-k3.1-pro-eagle3.1-mla

## Resumen

kimi-k3.1-pro-eagle3.1-pro-eagle3.1-mla es un modelo borrador (draft model) de decodificacion especulativa EAGLE-3.1 con atencion multi-latente (MLA), disenado para acelerar la inferencia del modelo objetivo Kimi-K3.1-Pro de Moonshot AI. Lo desarrolla lightseekorg mediante su framework TorchSpec, que entrena el borrador de forma online concurrentemente con la inferencia del modelo objetivo. No es un modelo generativo autonomo: su funcion es proponer tokens candidatos que el modelo grande verifica en paralelo, reduciendo la latencia por token generado.

El modelo parte del checkpoint previo `lightseekorg/kimi-k3-eagle3.1-mla` (entrenado para Kimi-K3) y se adapta a Kimi-K3.1-Pro reemplazando `embed_tokens`, `lm_head` y la normalizacion final por los del modelo objetivo. Con 3.015 millones de parametros (aproximadamente 3.000 millones), es dos ordenes de magnitud menor que el modelo que acelera, lo que lo hace desplegable en el mismo nodo de inferencia sin presion significativa de memoria.

Es relevante ahora porque la decodificacion especulativa se ha convertido en la palanca principal para reducir el coste por token en modelos de contexto largo, y la variante MLA encaja de forma natural con la arquitectura de Kimi-K3.1-Pro y con tecnicas de serving como PD-Disaggregation. No obstante, el propio autor advierte que se trata de un checkpoint preliminar (PRE-RELEASE) de un entrenamiento recortado a 1/4 de epoch, sin benchmarks ni mediciones de throughput completadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EAGLE-3.1 MTP draft model con MLA (Multi-Latent Attention); capas auxiliares 2, 46 y 90 del objetivo |
| Parametros totales | 3.015.625.728 (segun safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible como ventana propia; entrenado con secuencias de 46.000 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors) |
| Idiomas soportados | no disponible (hereda el vocabulario del objetivo, 163.840 tokens) |
| Licencia | other |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El borrador sigue el esquema EAGLE-3.1, que anade al EAGLE-3 clasico un post-norm sobre los estados ocultos del drafter y un RMSNorm por estado oculto capturado del modelo objetivo antes de la fusion. El objetivo es corregir la "deriva de atencion" descrita en el paper arXiv:2605.09992: en un drafter estilo EAGLE la magnitud del estado oculto crece de forma monotona con la profundidad de la cadena de especulacion, lo que hace que el borrador se comporte como una pila adicional de capas del objetivo y desvie la atencion del prompt hacia los tokens que acaba de generar. La normalizacion limita ese crecimiento y, segun el autor, mejora la aceptacion, la robustez fuera de distribucion (hasta 2x de aceptacion bajo perturbacion de plantilla de chat) y reduce la caida de aceptacion con la profundidad y el contexto.

El entrenamiento se realizo con TorchSpec usando "Anchored EAGLE-3", que supervisa el drafter desde posiciones ancla muestreadas a lo largo de la secuencia (512 anclas por muestra, `max_gap=0`) en lugar de solo desde la cola, exponiendo el modelo a una mayor variedad de longitudes de contexto y profundidades de cadena. El objetivo es LK^lambda (`lk_eta=3.0`) con KL forward durante los primeros 1.000 pasos, optimizador AdamW con LR pico 2e-5 y decaimiento coseno durante 54.612 pasos, batch de 4 muestras por paso (micro-batch 1 x 4 GPUs de entrenamiento) y 1% de warmup. Los datos son 1/4 de epoch (218.448 muestras) del conjunto de entrenamiento de `kimi-k3-eagle3.1-mla`. El computo total fue de aproximadamente 16 horas en 9 nodos GB200 (2 motores vLLM con PP=16 sobre 32 GPUs y un trainer FSDP de 4 GPUs). El vocabulario del drafter es de 163.840 tokens sin podar.

## Capacidades

- Decodificacion especulativa: propone tokens candidatos que Kimi-K3.1-Pro verifica en paralelo; no genera respuestas finales por si mismo.
- Metricas objetivo: longitud de aceptacion (accept_length) con `topk=1, num_steps=3, num_draft_tokens=4`, cuyo techo es 4.
- Integracion con arquitectura MLA del objetivo, lo que facilita la gestion de KV cache en motores de inferencia y en escenarios de PD-Disaggregation.
- Menor uso de KV cache que una variante MHA equivalente, reduciendo la presion de memoria en serving.
- Entrenamiento con anclas a lo largo de la secuencia, pensado para mantener la aceptacion en contextos largos.
- Robustez fuera de distribucion frente a cambios de plantilla de chat (segun las cifras del paper citado, no medidas aun en este checkpoint).
- No soporta tool calling, agentes, vision, audio ni modo thinking: es un componente de aceleracion, no un modelo de proposito general.

## Casos de uso

- Aceleracion de serving de Kimi-K3.1-Pro en produccion: emparejar el drafter con el modelo objetivo en vLLM u otro motor compatible con decodificacion especulativa para reducir la latencia inter-token (ITL) en cargas interactivas de chat.
- Despliegue con PD-Disaggregation: al compartir la arquitectura MLA del objetivo, el drafter encaja en la gestion de KV cache de arquitecturas separadas de prefill y decode, donde el coste de memoria del borrador es marginal frente al modelo grande.
- Reduccion de coste por token en inferencia de contexto largo: el entrenamiento con anclas y la normalizacion de EAGLE-3.1 estan disenados para que la aceptacion no colapse al crecer el contexto, lo que beneficia a pipelines de RAG y analisis de documentos extensos.
- Serving multi-tenant con concurrencia moderada: el autor planea medir throughput a concurrencias 1, 2, 4 y 16; el drafter anade poca memoria y puede mejorar el rendimiento agregado por GPU en cargas de chat y codigo.
- Evaluacion e investigacion en decodificacion especulativa: sirve como referencia reproducible para comparar EAGLE-3 frente a EAGLE-3.1 y variantes MLA frente a MHA en un objetivo de gran escala.
- Integracion en pipelines de generacion de codigo y matematicas: las categorias de benchmark previstas (HumanEval, GSM8K, MATH500, AIME 2026) apuntan a estos dominios como objetivos de validacion de la aceptacion.
- Base para continued training: al estar inicializado desde el drafter de Kimi-K3, puede reutilizarse como punto de partida para adaptar borradores a nuevas versiones del modelo objetivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye tablas con el esquema previsto (accept_length en MTBench, CEval, SPEED-Bench en sus variantes multilingual, coding, rag, qa y writing, GSM8K, MATH500, AIME 2026 y HumanEval, y throughput a concurrencia 1, 2, 4 y 16), pero todos los valores figuran como WIP. El autor indica explicitamente que la aceptacion y el throughput no se han medido y que los comandos de serving no han sido validados contra este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 6,0 GB en safetensors; en precision completa requiere del orden de 6 GB solo para pesos, mas KV cache del drafter (menor que una variante MHA gracias a MLA). Cifras exactas por cuantizacion: no disponibles.
- GPU recomendadas: el entrenamiento se realizo en nodos GB200; para serving se asume coubicacion con el modelo objetivo en GPUs de centro de datos (H100, H200, B200/GB200). No hay datos publicados de rendimiento en otras GPU.
- Cabe en GPU de consumo: con 6 GB de pesos en safetensors es tecnicamente posible alojarlo en una RTX 4090 o similar, pero carece de sentido aislado porque necesita el modelo objetivo Kimi-K3.1-Pro, de escala muy superior.
- Opciones de despliegue: el autor cita vLLM (motores con PP=16 en el entrenamiento) y el ecosistema transformers; no se confirma soporte validado en llama.cpp, Ollama ni TGI para este checkpoint.
- Latencia y throughput: no disponibles; pendientes de medicion segun la propia model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia | Estado |
|---|---|---|---|---|---|
| lightseekorg/kimi-k3.1-pro-eagle3.1-mla | 3.015 M | entrenado a 46.000 tokens | Draft EAGLE-3.1 MLA para Kimi-K3.1-Pro | other | Pre-release, sin benchmarks |
| lightseekorg/kimi-k3-eagle3.1-mla | no disponible | no disponible | Draft EAGLE-3.1 MLA para Kimi-K3 | no disponible | Checkpoint previo, base de este modelo |
| Drafts EAGLE-3 con MHA (genericos) | variable | no disponible | Decodificacion especulativa sobre objetivos con MHA | variable | Alternativa arquitectonica; mayor KV cache |

No se dispone de datos de rendimiento comparables porque ninguno de los modelos citados publica metricas en la informacion disponible.

## Limitaciones y advertencias

- Checkpoint preliminar: entrenado solo 1/4 de epoch; el autor advierte que sera reemplazado y que los comandos de serving no estan validados.
- Sin mediciones: no hay accept_length ni throughput publicados, por lo que no puede justificarse su adopcion en produccion con datos.
- No es un modelo autonomo: sin Kimi-K3.1-Pro no genera respuestas utiles; no debe evaluarse como modelo de chat o codigo independiente.
- Dependencia estricta del objetivo: solo es valido para Kimi-K3.1-Pro (mxfp4, 93 capas); usarlo con otra version o cuantizacion invalida las garantias de aceptacion.
- Licencia "other": no se detallan terminos de uso comercial en la informacion disponible; es imprescindible revisar el texto completo de la licencia antes de desplegarlo.
- Idiomas y sesgos: no disponibles; al heredar el vocabulario y los estados del objetivo, cualquier sesgo del modelo base puede propagarse a las propuestas del drafter.
- Riesgo de alucinacion: bajo por diseno, ya que el modelo objetivo verifica cada token propuesto; el riesgo real es de rendimiento (baja aceptacion), no de contenido incorrecto.
- Soporte de motores limitado: la integracion con vLLM y transformers es la unica documentada; otros runtimes requeririan adaptacion del manejo de MLA y de las capas auxiliares.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lightseekorg/kimi-k3.1-pro-eagle3.1-mla
- Repositorio de archivos: https://huggingface.co/lightseekorg/kimi-k3.1-pro-eagle3.1-mla/tree/main
- Modelo base: https://huggingface.co/moonshotai/Kimi-K3.1-Pro
- Checkpoint de inicializacion: https://huggingface.co/lightseekorg/kimi-k3-eagle3.1-mla
- Framework TorchSpec: https://github.com/lightseekorg/TorchSpec
- Paper citado (Attention Drift): https://arxiv.org/abs/2605.09992

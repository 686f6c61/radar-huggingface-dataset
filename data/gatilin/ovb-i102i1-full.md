# gatilin/ovb-i102i1-full

## Resumen

ovb-i102i1-full es un pipeline completo de difusion para generacion y edicion de imagenes, exportado por el usuario gatilin a partir de Qwen/Qwen-Image-2.1. No se trata de un adaptador LoRA, sino de un modelo autonomo en el que se han fusionado permanentemente los pesos de un adaptador LoRA (rango 32, alpha 64, rsLoRA) entrenado sobre la base Qwen-Image-2.1. El resultado es un transformer de 7.115.124.736 parametros en bfloat16 que ya incorpora la contribucion del adaptador y que puede cargarse como `QwenImage21Pipeline` sin necesidad de descargar ni aplicar el adaptador original.

El modelo esta orientado a tareas de vision por computador condicionadas por instrucciones: dado un par formado por una imagen RGB y una instruccion textual, devuelve una visualizacion. Las tareas cubiertas segun la model card son estimacion de profundidad (con mapa de color fijo), segmentacion semantica, de instancia y referida, y generacion de imagen. El pipeline se distribuye via la libreria diffusers con el identificador `QwenImage21Pipeline` y el transformer `QwenImage21Transformer2DModel`.

Su relevancia es fundamentalmente practica para el ecosistema diffusers: ofrece un punto de partida autocontenido y reproducible (con hashes SHA-256 de cada componente y metadatos de fusion maquina-legibles) para quien quiera investigar o evaluar el efecto de este adaptador concreto sin gestionar la cadena de dependencias base + LoRA. Conviene senalar que el propio autor advierte de que el comportamiento en benchmarks de esta exportacion fusionada no se ha vuelto a medir y que la inferencia de imagen completa no se ha validado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (Qwen-Image-2.1), pipeline image-to-image con text encoder congelado y VAE |
| Parametros totales | 7.115.124.736 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos almacenados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | qwen-research (research y evaluacion; uso no comercial) |
| Formato de pesos | safetensors (diffusers) |

## Arquitectura y entrenamiento

El modelo es un pipeline de difusion completo basado en Qwen-Image-2.1. Consta de un transformer fusionado en bfloat16, un text encoder congelado, un VAE, un procesador/tokenizer y un scheduler. Sobre la base original se aplico un adaptador LoRA de rango 32 y alpha 64 con escalado rsLoRA, entrenado durante 10.000 pasos sobre los modulos `to_k`, `to_out.0`, `to_v`, `img_mlp.out`, `img_mlp.gate_layer`, `img_mlp.proj` y `to_q`. La fusion se realizo mediante `PEFT merge_and_unload(safe_merge=True)` sobre 224 modulos, con la cadena de herramientas torch 2.6.0+cu124, diffusers 0.41.0, transformers 5.19.0 y peft 0.21.2.

No se aportan datos sobre el volumen de tokens, la composicion del dataset de entrenamiento ni sobre si se emplearon tecnicas de RLHF o DPO. El adaptador original se entreno desde la base Qwen-Image-2.1 sin afinar (no desde un padre OVB), y la seleccion del checkpoint se hizo mediante el protocolo de EMA de perdida de flujo macro de la ejecucion original. Esta exportacion no anade pasos de optimizacion ni entrenamiento nuevo: solo pliega pesos publicados en su base publicada. El condicionamiento por tarea sigue el contrato del proyecto: imagen RGB mas instruccion de tarea, con prompts, protocolo de evaluacion y ajustes de lienzo definidos en el repositorio del proyecto.

## Capacidades

- Generacion de imagen condicionada por instruccion textual (image-to-image).
- Estimacion de profundidad con mapa de color fijo.
- Segmentacion semantica.
- Segmentacion de instancia.
- Segmentacion referida (referring segmentation).
- Carga como pipeline completo (`QwenImage21Pipeline`) o como transformer aislado (`QwenImage21Transformer2DModel`) para reinicializacion con pesos entrenables.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades de audio: no disponible.

## Casos de uso

- Estimacion de profundidad monocular: se introduce una imagen RGB junto con la instruccion de tarea de profundidad y el modelo devuelve un mapa de profundidad visualizado con un mapa de color fijo, util para reconstruccion 3D, navegacion de robots o postprocesado de efectos.
- Segmentacion semantica en pipelines de vision: el modelo puede generar mascaras semanticas a partir de una imagen y una instruccion, lo que permite integrarlo en flujos de anotacion automatica o preprocesado para otros modelos.
- Segmentacion de instancia para conteo y seguimiento: al producir mascaras por instancia, resulta adecuado para tareas de conteo de objetos, analisis de escenas o generacion de datasets etiquetados.
- Segmentacion referida por lenguaje natural: permite seleccionar un objeto descrito textualmente dentro de una imagen, util en edicion asistida, interfaces de usuario por voz o herramientas de recorte inteligente.
- Generacion y edicion de imagen image-to-image: el pipeline base permite transformar una imagen de entrada segun una instruccion, aplicable a prototipado creativo, retoque o aumento de datos.
- Investigacion sobre fusion de LoRA en modelos de difusion: al ser un export reproducible con hashes y metadatos, sirve como referencia para estudiar el efecto de `merge_and_unload` frente a la aplicacion dinamica de adaptadores.
- Punto de partida para fine-tuning: el transformer puede cargarse con `requires_grad_(True)` como inicializacion nueva, lo que facilita experimentos de ajuste sobre una base que ya incorpora el adaptador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que el comportamiento en benchmarks de esta exportacion fusionada no se volvio a medir y que la inferencia de imagen completa no se valido (`offline_full_pipeline_loading` e `image_inference` figuran como `false` en los metadatos de validacion).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 7.115 millones de parametros en bfloat16, los pesos del transformer ocupan aproximadamente 14,2 GB; a ello hay que sumar el text encoder, el VAE y las activaciones, por lo que se recomienda planificar holgura adicional.
- GPU recomendadas: no disponible en la informacion proporcionada. Por volumen de pesos, se situa en el rango de GPUs de datacenter (A100, H100) o GPUs de consumo de gama alta con 24 GB o mas.
- Cabe en GPU de consumo: probable en tarjetas con 24 GB o mas usando `enable_model_cpu_offload()`, aunque no esta confirmado por el autor.
- Opciones de despliegue: diffusers (`QwenImage21Pipeline.from_pretrained`), con `enable_model_cpu_offload()` documentado en la model card. Otras opciones como vLLM, llama.cpp, Ollama o TGI no estan indicadas y no son aplicables de forma estandar a pipelines de difusion de este tipo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gatilin/ovb-i102i1-full | 7.115.124.736 | no disponible | Image-to-image, profundidad, segmentacion | qwen-research (no comercial) | Hugging Face, diffusers |
| Qwen/Qwen-Image-2.1 (base) | no disponible | no disponible | Generacion/edicion de imagen | qwen-research | Hugging Face, diffusers |
| khazic/ovb-ft_bl_i102i1_t1_cube_20261105_2213 (adaptador LoRA) | no disponible (adaptador) | no disponible | Igual que el modelo fusionado | no disponible | Hugging Face |

La comparativa se limita a los modelos de la cadena de procedencia citada en la model card; no se dispone de datos de rendimiento para contrastar con alternativas de la misma categoria.

## Limitaciones y advertencias

- Licencia qwen-research: uso restringido a investigacion y evaluacion; no se permite uso comercial. Se aplican los terminos de Qwen y de los repositorios padre.
- No es un checkpoint de estado de entrenamiento: no incluye optimizador, scheduler ni estado RNG, por lo que sirve como inicializacion nueva y no como reanudacion exacta de la ejecucion original.
- Inferencia no validada: la construccion completa del pipeline offline y la inferencia de imagen no se verificaron; los resultados deben considerarse no validados hasta reproducir un forward pass.
- Benchmarks no remedidos: el comportamiento de esta exportacion fusionada no se ha evaluado con el protocolo de referencia.
- Riesgo de alucinacion visual: al ser un modelo generativo, puede producir visualizaciones plausibles pero incorrectas en profundidad o segmentacion.
- Sesgos: no disponible en la informacion proporcionada.
- Limitaciones de contexto e idioma: no disponible.
- No aplicar de nuevo el adaptador padre: los pesos ya contienen su contribucion; volver a aplicarlo alteraria el resultado.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gatilin/ovb-i102i1-full
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Adaptador de origen: https://huggingface.co/khazic/ovb-ft_bl_i102i1_t1_cube_20261105_2213
- Repositorio del proyecto: https://github.com/isLinXu/open-vision-banana
- Script de fusion: https://github.com/isLinXu/open-vision-banana/blob/main/scripts/merge_qwen_image21_lora.py
- Metadatos de fusion: https://huggingface.co/gatilin/ovb-i102i1-full/blob/main/merge_metadata.json
- Licencia: https://huggingface.co/gatilin/ovb-i102i1-full/blob/main/LICENSE
- Aviso legal: https://huggingface.co/gatilin/ovb-i102i1-full/blob/main/NOTICE.txt

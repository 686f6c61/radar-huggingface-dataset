# OnePunchMonk101010/dptlab-klein-oft-subject5

## Resumen

dptlab-klein-oft-subject5 es un adaptador de post-entrenamiento para el modelo de generación de imágenes a partir de texto FLUX.2-klein-4B, publicado por el usuario OnePunchMonk101010. No es un modelo completo: es un conjunto de pesos adicionales (1,4 millones de parámetros entrenables) que se inyectan sobre el transformer de difusión del modelo base para especializarlo en un sujeto concreto, identificado como "subject-5" en el dataset de entrenamiento.

El adaptador se ha producido con la herramienta dptlab, aplicando la receta de tipo lora pero con un adaptador OFT (Orthogonal Fine-Tuning) de tamaño de bloque 32 y descomposición de Cayley-Neumann, en lugar de las matrices de bajo rango habituales. El entrenamiento se hizo a 512 píxeles de resolución, con rango y alpha de 16, 500 pasos, precisión mixta bf16 y máscaras activadas, sobre el dataset interno `/root/data/syncd/subject-5`.

Su relevancia es doble. Por un lado, sirve como ejemplo práctico de personalización de un modelo de difusión moderno con un presupuesto de parámetros ridículo (1,4 M). Por otro, y más importante para quien vaya a usarlo, documenta un detalle operativo crítico: el formato OFT no lo puede leer `pipe.load_lora_weights()`, que fallaría silenciosamente sirviendo el modelo base sin adaptador. La carga correcta requiere PEFT a través de la librería dptlab.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador OFT (Orthogonal Fine-Tuning, block size 32, Cayley-Neumann) sobre el transformer de difusion de FLUX.2-klein-4B; detalle interno de la arquitectura base no disponible |
| Parametros totales | 1,4 M parametros entrenables en el adaptador; el modelo base FLUX.2-klein-4B declara 4 B en su denominacion |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo texto a imagen; resolucion de entrenamiento de 512 px) |
| Tipos de cuantizacion | No disponible; el entrenamiento se realizo en bf16 |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador OFT, no legible por `load_lora_weights`; requiere PEFT) |

## Arquitectura y entrenamiento

El adaptador se engancha al transformer de difusion de FLUX.2-klein-4B mediante OFT, una familia de PEFT que aplica transformaciones ortogonales a los pesos en lugar de sumar matrices de bajo rango. La configuracion concreta usa `oft_block_size` de 32 y `oft_cayley_neumann: true`, lo que implica una parametrizacion ortogonal basada en la descomposicion de Cayley aproximada por Neumann. El numero de parametros entrenables resultante es de 1,4 M, coherente con la naturaleza compacta del metodo.

El entrenamiento siguió la receta `lora` de dptlab con `peft_method: oft`, learning rate 1e-4, batch size 1 con 4 pasos de acumulacion de gradiente, 500 pasos totales, `max_grad_norm` 1.0, semilla 42 y `use_masks: true` (entrenamiento enmascarado, habitual para preservar el fondo o aislar la region del sujeto). El dataset es `/root/data/syncd/subject-5`, no publicado ni descrito en la model card. No se documenta ninguna fase de RLHF, DPO ni ajuste por preferencias, algo esperable en un adaptador de este tipo.

## Capacidades

- Generacion de imagenes a partir de texto (pipeline `text-to-image`) sobre la base de FLUX.2-klein-4B.
- Personalizacion de sujeto: el adaptador esta entrenado para reproducir un sujeto concreto (subject-5) en contextos y escenas nuevos, segun indica el propio autor al describir el split de evaluacion.
- Inferencia en muy pocos pasos: el ejemplo de uso emplea `num_inference_steps=4` y `guidance_scale=1.0`, coherente con el parametro `sampling_steps_for_shift: 4` de la configuracion.
- Entrenamiento con mascaras (`use_masks: true`), lo que sugiere capacidad de control espacial durante el ajuste.
- No dispone de tool calling ni de function calling.
- No dispone de modo de razonamiento, agentes ni capacidades multi-paso.
- No procesa vision ni audio como entrada: es un modelo generativo de imagen, no multimodal de entrada.
- Capacidades multilingues: no disponibles; no se documenta el comportamiento de los prompts en idiomas distintos del usado en el entrenamiento.

## Casos de uso

- Personalizacion de un personaje recurrente: el adaptador permite generar el sujeto 5 en escenas que no aparecen en las imagenes de entrenamiento, util para mantener consistencia visual en series de ilustraciones.
- Prototipado rapido de assets: con 4 pasos de inferencia y una latencia media medida de 1596 ms, encaja en flujos de generacion de bocetos donde prima la velocidad sobre el acabado final.
- Pruebas de concepto de campanas: generar variaciones de un mismo sujeto en distintos entornos para validar direccion de arte antes de encargar produccion final.
- Investigacion en PEFT para difusion: sirve como referencia reproducible para comparar OFT frente a LoRA estandar sobre el mismo modelo base y el mismo dataset.
- Ajuste de un pipeline interno de generacion de imagenes: el adaptador se integra en un `DiffusionPipeline` de diffusers y puede cargarse por script para lotes de imagenes con un sujeto fijo.
- Generacion de material para videojuegos o narrativa visual: crear variaciones de un mismo personaje en poses y escenarios distintos sin reentrenar.
- Evaluacion de robustez de adaptadores pequenos: con solo 1,4 M parametros entrenables, es un caso de estudio util para medir hasta que punto un adaptador minimo retiene identidad de sujeto.

## Benchmarks y rendimiento

El autor publica un unico conjunto de resultados sobre un split `heldout` de 6 prompts, con escenas que no aparecen en ninguna imagen de entrenamiento.

| Metrica | Valor |
|---|---|
| CLIP-T (prompt) | 0,9176 |
| DINO (sujeto) | 0,2750 |
| CLIP-I (sujeto) | 0,6484 |
| Latencia media (ms) | 1596 |

El propio autor advierte que CLIP-T y DINO tiran en direcciones opuestas: un adaptador que no ha aprendido nada puntua bien en la primera metrica, y uno que ha memorizado sus imagenes de entrenamiento puntua bien en la segunda. Por tanto, los valores deben leerse en conjunto. El repositorio remite a `RESULTS.md` para consultar los seis metodos comparados y sus factores de confusion; esos datos no estan incluidos en la informacion disponible.

## Requisitos de hardware

- Pesos del transformer base en bf16: aproximadamente 8 GB para 4 B parametros. Es un calculo aritmetico a partir del tamano declarado, no una cifra medida.
- El adaptador en si ocupa unos pocos megabytes (1,4 M parametros), por lo que no altera de forma apreciable los requisitos.
- El consumo total del pipeline no esta documentado en la informacion disponible, ya que depende tambien de los codificadores de texto y del VAE del modelo base.
- GPU de clase profesional (A100, H100): soporte sin problemas para el pipeline completo en bf16.
- GPU de consumo: previsiblemente viable en RTX 4090 (24 GB) con el pipeline completo en bf16; en tarjetas de 16 GB o menos probablemente haga falta cuantizacion, cuyo soporte no se documenta aqui.
- Opciones de despliegue: diffusers con `DiffusionPipeline.from_pretrained` mas inyeccion PEFT mediante `load_peft_checkpoint` de dptlab. No se documenta soporte para vLLM, TGI, Ollama ni llama.cpp, que ademas no aplican a este tipo de modelo.
- Latencia medida por el autor: 1596 ms de media en el benchmark `heldout`. No se publica throughput ni las caracteristicas del hardware usado para medirla.

## Comparativa con modelos similares

No se dispone de resultados de otros adaptadores comparables en la informacion proporcionada; el autor menciona seis metodos evaluados en `RESULTS.md`, pero sus cifras no estan disponibles en esta ficha.

| Metodo | Parametros entrenables | Formato de carga | CLIP-T | DINO | Licencia |
|---|---|---|---|---|---|
| dptlab-klein-oft-subject5 (OFT) | 1,4 M | PEFT (no `load_lora_weights`) | 0,9176 | 0,2750 | apache-2.0 |
| Adaptador LoRA estandar sobre el mismo base | no disponible | `load_lora_weights` | no disponible | no disponible | no disponible |
| Ajuste completo de FLUX.2-klein-4B | 4 B (estimado por denominacion) | pesos completos | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Incompatibilidad de carga: `pipe.load_lora_weights()` no lee el formato OFT. El autor advierte que registraria "no LoRA keys found" y serviria el modelo base en silencio, dando la falsa impresion de que el adaptador funciona.
- Especializacion extrema: el adaptador esta entrenado sobre un unico sujeto (subject-5) y no debe esperarse que mejore otras capacidades del modelo base.
- Riesgo de sobreajuste: 500 pasos sobre un dataset no documentado, con rango 16 y resolucion 512, es un presupuesto pequeno que puede producir memorizacion de las poses o fondos vistos en entrenamiento. Las metricas CLIP-T y DINO apuntan precisamente a ese equilibrio.
- Dataset no publicado: no se describe la composicion, el numero de imagenes ni su procedencia, lo que impide evaluar sesgos y cobertura del sujeto.
- Sesgos: no documentados. Al no conocerse el dataset ni los prompts de entrenamiento, no es posible caracterizar sesgos de generacion.
- Alucinacion: aplicable en el sentido de generar atributos o detalles del sujeto que no le corresponden, especialmente con prompts alejados de la distribucion de entrenamiento.
- Limitaciones de contexto e idioma: no disponibles. No se documenta el comportamiento con prompts largos ni en idiomas distintos del usado en entrenamiento.
- Licencia: el adaptador se publica bajo apache-2.0, pero el uso comercial depende tambien de la licencia del modelo base FLUX.2-klein-4B, que no se detalla en la informacion disponible y debe verificarse por separado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; tamano de repo declarado de 0,0 GB, coherente con un adaptador de pocos megabytes, pero sin garantia de mantenimiento o soporte.
- Sin validacion publicada: `validation_prompts` esta vacio y `validation_steps` es 500, por lo que no hay seguimiento intermedio documentado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OnePunchMonk101010/dptlab-klein-oft-subject5
- Modelo base: https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
- Repositorio de la herramienta de entrenamiento dptlab: https://github.com/OnePunchMonk/diffusion-post-training-lab
- Resultados completos y factores de confusion: `RESULTS.md` dentro del repositorio del modelo
- La busqueda web realizada no devolvio enlaces relevantes sobre este modelo; los resultados obtenidos correspondian a documentacion de un asistente conversacional sin relacion con el modelo descrito.

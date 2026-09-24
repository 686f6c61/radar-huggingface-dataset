# phanviethoang1512/unpaired-edit-sd35-large-stage2

## Resumen

`phanviethoang1512/unpaired-edit-sd35-large-stage2` es un adaptador LoRA de edicion de imagen por instrucciones, entrenado sobre el modelo base `stabilityai/stable-diffusion-3.5-large`. Lo publica el usuario phanviethoang1512 en HuggingFace y esta pensado para edicion de imagen no emparejada (unpaired), es decir, sin requerir pares imagen-original / imagen-editada durante el entrenamiento. El adaptador se complementa con una red de gating por bloques (`gating_net.pt`) que modula un ControlNet de etapa 1, tambien basado en SD3.5-Large.

El punto clave para quien vaya a evaluarlo es que se trata de un checkpoint intermedio de entrenamiento, no de un modelo terminado. Se exporto en el `global_step = 14500` (aproximadamente la epoca 906) de un calendario de entrenamiento configurado para mucho mas tiempo, y el propio autor indica que el entrenamiento no habia convergido. Ademas, no incluye estado del optimizador, EMA ni RNG, por lo que solo sirve para inferencia o evaluacion y no permite reanudar el entrenamiento.

La relevancia actual es acotada pero concreta: es un ejemplo practico de combinacion de LoRA de alto rango (rank 128, alpha 128) con NFT (un objetivo de ajuste por recompensa, similar a un RLHF para difusion) y una red de gating entrenada de forma conjunta, todo sobre una arquitectura de difusion moderna con texto codificado por multiples encoders. Su utilidad principal es la investigacion sobre edicion de imagen no emparejada, no el despliegue en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre el transformer de difusion (MMDiT) de Stable Diffusion 3.5 Large; incluye red de gating por bloques que modula un ControlNet de etapa 1 |
| Parametros totales | No disponible para el adaptador (repositorio de 0,4 GB); los parametros del modelo base no se detallan en la informacion proporcionada |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de difusion para imagenes; la informacion proporcionada no indica resolucion de entrenamiento) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el entrenamiento fue en bf16) |
| Idiomas soportados | No disponible (el prompt de texto se procesa via los encoders del modelo base, no declarados en esta ficha) |
| Licencia | `other`: hereda la Stability AI Community License del modelo base |
| Formato de pesos | `adapter_model.safetensors` (LoRA), `adapter_config.json` (PEFT), `gating_net.pt` (state_dict de PyTorch), `training_state.json` (procedencia) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 128 y alpha 128, con dropout 0.0, aplicado en bf16 sobre los modulos de atencion del transformer de SD3.5-Large: `to_q`, `to_k`, `to_v`, `to_out.0`, `add_q_proj`, `add_k_proj`, `add_v_proj` y `to_add_out`. Es decir, se interviene tanto en la atencion propia como en la atencion cruzada con las representaciones de texto. Junto al LoRA se exporta `gating_net.pt`, un `state_dict` de una red de gating por bloques que modula la aportacion de un ControlNet de etapa 1 de SD3.5-Large; la escala de gating por defecto es 0.7 y se entreno conjuntamente con el LoRA. El adaptador no es autonomo: necesita el modelo base y un checkpoint de ControlNet de etapa 1.

El objetivo de entrenamiento es NFT (un esquema de ajuste con recompensa) con dos terminos, uno de edicion y otro de preservacion, ambos con peso `lambda = 1.0`, ademas de una penalizacion KL con `beta = 0.01` y `nft_beta = 0.5`; el EMA estaba activado. El modelo de recompensa empleado es `Qwen/Qwen3-VL-4B-Instruct` en bf16, que puntua las ediciones generadas. Segun el autor, en el momento de la exportacion se registraban `reward_edit_score` en torno a 0,80–0,91 y `reward_preservation_score` en torno a 0,51–0,62 sobre lotes muestreados, con un `gate_mean` de aproximadamente 0,717. Estas cifras son puntuaciones del modelo de recompensa durante el entrenamiento, no resultados sobre ningun benchmark con conjunto de evaluacion reservado. No se detalla en la informacion disponible el numero de tokens o de imagenes del dataset, ni su composicion.

## Capacidades

- Edicion de imagen guiada por instrucciones en lenguaje natural sobre el modelo base SD3.5-Large, en el regimen de edicion no emparejada (sin pares de imagenes supervisados).
- Preservacion de contenido no editado: el objetivo de entrenamiento incluye un termino explicito de preservacion, orientado a mantener la identidad de la imagen de entrada fuera de la zona editada.
- Control espacial mediante la red de gating que modula un ControlNet de etapa 1, con escala por defecto 0.7.
- Ajuste fino eficiente en parametros: al ser un adaptador PEFT, se puede cargar sobre el transformer base sin reentrenar el modelo completo.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (no es un modelo de lenguaje).
- Capacidades multilingues: no disponible.
- Capacidades especiales: no se declaran modos de pensamiento, audio ni vision adicionales; la unica capacidad declarada es la edicion de imagen.

## Casos de uso

- Investigacion en edicion de imagen no emparejada: sirve como punto de partida reproducible para estudiar el efecto de un LoRA de rango 128 con objetivo NFT sobre SD3.5-Large, comparando la contribucion del termino de edicion frente al de preservacion.
- Evaluacion de redes de gating sobre ControlNet: el `gating_net.pt` permite experimentar con la modulacion por bloques de un ControlNet de etapa 1 y medir como cambia la fidelidad de la edicion al variar la escala desde el 0.7 por defecto.
- Analisis de tecnicas de ajuste por recompensa en modelos de difusion: el uso de `Qwen/Qwen3-VL-4B-Instruct` como modelo de recompensa es un caso util para estudiar sesgos y limitaciones de este tipo de supervisores en tareas de edicion.
- Reproduccion de experimentos de PEFT multimodal: al distribuirse como `adapter_model.safetensors` y `adapter_config.json`, se integra en flujos de trabajo con la libreria `peft` y `diffusers` para auditar configuraciones de LoRA en transformers de difusion.
- Pruebas de concepto de edicion selectiva: en escenarios donde interesa retocar una region concreta de una imagen manteniendo el resto intacto, el termino de preservacion lo hace candidato para prototipos, siempre que se acepte su estado no convergido.
- Comparacion de metodos de edicion por instrucciones: puede emplearse como referencia intermedia en estudios que comparen edicion no emparejada frente a enfoques supervisados con pares de imagenes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo proporciona metricas del bucle de entrenamiento sobre lotes muestreados, que no constituyen una evaluacion sobre conjuntos reservados:

| Metrica (entrenamiento, no benchmark) | Rango registrado |
|---|---|
| `reward_edit_score` | 0,80–0,91 |
| `reward_preservation_score` | 0,51–0,62 |
| `gate_mean` | 0,717 |

## Requisitos de hardware

- VRAM estimada: no disponible como cifra publicada. Como referencia de orden de magnitud, el adaptador anade 0,4 GB de pesos, pero la inferencia requiere cargar el transformer completo de SD3.5-Large en bf16 junto con sus encoders de texto y el ControlNet de etapa 1, por lo que el consumo es el del modelo base, no el del adaptador.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por el tamano del modelo base, el rango habitual de trabajo es el de GPUs de centro de datos (A100, H100, L40S) para bf16 sin offload.
- GPU de consumo: no confirmado en la informacion disponible. El adaptador en si es ligero (0,4 GB), pero el conjunto base + ControlNet excede con toda probabilidad la VRAM de una GPU de consumo de gama media-alta sin cuantizacion u offload a CPU.
- Opciones de despliegue: el autor documenta la carga mediante `diffusers` (`SD3Transformer2DModel.from_pretrained`) y `peft` (`PeftModel.from_pretrained`), con carga del gating con `torch.load`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un modelo de difusion de imagen.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos de rendimiento de alternativas, por lo que no es posible establecer una comparativa cuantitativa. A modo de encuadre cualitativo, el enfoque se situa en la misma familia de problemas que otros trabajos de edicion de imagen por instrucciones (como los basados en difusion con supervision de pares o los metodos no emparejados), pero los datos numericos de esos sistemas no forman parte de la informacion disponible.

| Modelo / enfoque | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (LoRA sobre SD3.5-Large, etapa 2) | No disponible | No aplica | No disponible (sin benchmarks publicados) | Stability AI Community License (heredada) | HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| Modelo base `stabilityai/stable-diffusion-3.5-large` | No disponible en la informacion proporcionada | No aplica | No disponible en la informacion proporcionada | Stability AI Community License | Publico en HuggingFace |
| Otras alternativas de edicion por instrucciones | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Es un checkpoint intermedio, no un modelo final: se exporto en el `global_step = 14500` de un calendario mucho mas largo y el autor confirma que el entrenamiento no habia convergido. No debe evaluarse como un resultado definitivo.
- No se puede reanudar el entrenamiento: faltan el estado del optimizador, el EMA y el estado del RNG.
- No es autonomo: exige el modelo base `stabilityai/stable-diffusion-3.5-large` y un checkpoint de ControlNet de etapa 1 de SD3.5-Large, ademas de la arquitectura de la red de gating, que procede del repositorio de entrenamiento y no se documenta aqui.
- Riesgo de resultados degradados: con `reward_preservation_score` en 0,51–0,62, el termino de preservacion es claramente mas debil que el de edicion, lo que sugiere deriva en zonas que deberian permanecer inalteradas.
- Metricas no verificables externamente: las puntuaciones reportadas provienen del propio bucle de entrenamiento, sobre lotes muestreados y con un modelo de recompensa que es a la vez parte del sistema, lo que introduce riesgo de sobreajuste al reward model.
- Riesgo de sesgos: el adaptador hereda los sesgos del modelo base y de su dataset de entrenamiento, no documentados en la informacion disponible. El modelo de recompensa `Qwen/Qwen3-VL-4B-Instruct` tambien puede introducir sesgos en la senal de edicion y preservacion.
- Restricciones de licencia: la licencia declarada es `other`, con herencia de la Stability AI Community License. Es imprescindible revisar esos terminos antes de cualquier uso comercial; no se concede aqui una licencia de uso libre.
- Idiomas y contexto: no se declaran idiomas soportados ni resolucion de entrenamiento, por lo que el comportamiento multilingue de los prompts es indeterminado.
- Adopcion practicamente nula: 0 descargas y 0 likes, sin pipeline declarado en HuggingFace, lo que reduce la disponibilidad de validacion independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/phanviethoang1512/unpaired-edit-sd35-large-stage2
- Modelo base: https://huggingface.co/stabilityai/stable-diffusion-3.5-large
- Licencia Stability AI Community License: https://huggingface.co/stabilityai/stable-diffusion-3.5-large
- Modelo de recompensa empleado en el entrenamiento: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Resultados de busqueda web: no se han encontrado enlaces tecnicos relevantes sobre este modelo (papers, blogs, repositorios o demos). El resto de resultados devueltos por el buscador no guarda relacion con el modelo ni con el ambito tecnico.

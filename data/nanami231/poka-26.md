# Nanami231/poka-26

## Resumen

Poka-26 es un adaptador LoRA de tipo DreamBooth para el modelo de difusion texto-a-imagen Krea 2, publicado por el usuario Nanami231 en Hugging Face. El adaptador se entrena sobre la variante Krea 2 RAW y se presenta con ejemplos generados sobre Krea 2 Turbo, la version destilada para inferencia rapida. Su funcion es introducir un concepto visual concreto, invocado mediante el token de activacion `RUBY@26`, que el modelo base no genera de forma fiable por si solo.

El repositorio pesa 1,6 GB y esta etiquetado con licencia Apache 2.0. Se distribuye en formato diffusers, con la libreria del mismo nombre como dependencia de carga, y expone tres imagenes de ejemplo generadas con 8 pasos de inferencia y `guidance_scale=0.0`, lo que confirma su uso previsto sobre la variante Turbo. No se documentan datos de entrenamiento, numero de pasos, resolucion ni composicion del dataset.

La relevancia de esta ficha es limitada pero concreta: se trata de un adaptador de nicho, con 5 descargas y 0 likes en el momento de la consulta, sin benchmarks ni documentacion tecnica mas alla de la model card. Resulta util como referencia para quienes necesiten integrar LoRAs de concepto en pipelines de Krea 2 y quieran conocer el formato de invocacion y las limitaciones de un adaptador de este tipo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo de difusion texto-a-imagen; arquitectura del modelo base no especificada en la informacion disponible |
| Parametros totales | no disponible (el repositorio ocupa 1,6 GB, pero no se desglosa el numero de parametros del adaptador) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de imagen; no aplica ventana de contexto textual) |
| Tipos de cuantizacion | no disponible; el ejemplo oficial usa `torch.bfloat16` |
| Idiomas soportados | no disponible; las etiquetas de Hugging Face no declaran idiomas y los prompts de ejemplo estan en ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | diffusers (pesos LoRA cargables con `load_lora_weights`); no se indica presencia de safetensors ni GGUF en la informacion disponible |

## Arquitectura y entrenamiento

El adaptador es un LoRA de tipo DreamBooth entrenado sobre Krea 2 RAW, segun declara la model card. No se especifica el rango del adaptador, el numero de pasos de entrenamiento, la resolucion de las imagenes de entrenamiento, el tamano del dataset ni si se aplicaron tecnicas de regularizacion o captions automaticos. Tampoco se documenta si el entrenamiento uso optimizador, learning rate o scheduler concretos.

La unica informacion tecnica verificable es el flujo de uso: el adaptador se carga sobre `krea/Krea-2-Turbo` mediante `Krea2Pipeline` y `pipe.load_lora_weights("Nanami231/poka-26")`, y se invoca con el token `RUBY@26` dentro del prompt. Los ejemplos oficiales emplean 8 pasos de inferencia y `guidance_scale=0.0`, parametros coherentes con un modelo Turbo destilado. No se aportan datos sobre el proceso de destilacion ni sobre la arquitectura interna del modelo base.

## Capacidades

- Generacion de imagenes texto-a-imagen condicionada por el token de activacion `RUBY@26`.
- Introduccion de un concepto visual especifico (gema o cristal de tono carmesi, segun los ejemplos) que el modelo base no reproduce de forma fiable sin el adaptador.
- Compatibilidad con prompts descriptivos largos en ingles, incluyendo estilos cinematograficos, pintura al oleo y escenas de ciencia ficcion.
- Integracion con la libreria diffusers mediante `Krea2Pipeline` y `load_lora_weights`.
- Uso previsto sobre la variante Turbo con pocos pasos de inferencia (8 en los ejemplos).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking; no aplican a un modelo de difusion de imagen.
- No se declaran capacidades multilingues; los prompts de ejemplo estan exclusivamente en ingles.

## Casos de uso

- Prototipado de direccion de arte: generar variaciones de un motivo visual concreto (el concepto `RUBY@26`) para explorar paletas y composiciones antes de producir assets finales, aprovechando la inferencia en 8 pasos sobre Turbo.
- Generacion de ilustraciones conceptuales para ficcion: escenas de ciencia ficcion o fantasia que requieran un elemento visual recurrente, como un cristal o gema carmesi, manteniendo coherencia entre imagenes mediante el mismo token.
- Creacion de material para moodboards: combinar el adaptador con prompts de estilo (oleo, cinematografico, gran angular) para producir referencias visuales rapidas en estudios de diseno.
- Pruebas de integracion en pipelines diffusers: servir como ejemplo practico de carga de un LoRA de concepto sobre Krea 2 Turbo dentro de un flujo Python, util para validar la cadena de dependencias y el consumo de VRAM.
- Experimentacion en investigacion sobre personalizacion: estudiar como un token raro (`RUBY@26`) condiciona la generacion en un modelo destilado y medir la fidelidad del concepto con distintas semillas y escalas de guiado.
- Generacion de assets para juegos o prototipos: producir iconos o texturas con el motivo del adaptador para maquetas internas, siempre que la licencia Apache 2.0 del adaptador y la del modelo base lo permitan.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el adaptador pesa 1,6 GB y el ejemplo oficial carga el pipeline base en `bfloat16` sobre `cuda`, por lo que el requisito dominante es el del modelo Krea 2 Turbo, cuyo tamano no se detalla en la informacion proporcionada.
- GPU recomendadas: no disponible; el ejemplo oficial solo indica `cuda` sin especificar modelo de GPU.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; depende del modelo base, no del adaptador.
- Opciones de despliegue: diffusers (unica via documentada, con `Krea2Pipeline` y `load_lora_weights`). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de difusion de imagen.
- Latencia y throughput estimados: no disponibles; los ejemplos usan 8 pasos de inferencia con `guidance_scale=0.0`, pero no se publican tiempos por imagen.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros adaptadores LoRA comparables para Krea 2 ni datos de rendimiento que permitan una comparacion cuantitativa. La unica referencia es el propio modelo base (`krea/Krea-2-Raw` y `krea/Krea-2-Turbo`), del que no se detallan parametros, contexto ni benchmarks.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al ser un adaptador de concepto sobre un modelo de difusion, hereda los sesgos del modelo base, que no se describen en la informacion disponible.
- Riesgo de alucinacion: no aplica en el sentido textual, pero el adaptador puede generar el concepto `RUBY@26` de forma imprecisa o inconsistente fuera de los estilos de los prompts de ejemplo.
- Limitaciones de contexto o idioma: no se declaran idiomas soportados; los ejemplos estan en ingles y no hay evidencia de funcionamiento con prompts en castellano.
- Restricciones de licencia: el adaptador se publica bajo Apache 2.0, pero el uso comercial depende tambien de la licencia del modelo base Krea 2, que no se detalla en la informacion proporcionada; conviene verificarla antes de explotacion comercial.
- Caveats para produccion: el repositorio tiene 5 descargas y 0 likes, sin documentacion de entrenamiento ni validacion externa; no se especifican el rango del LoRA, la resolucion de entrenamiento ni la version exacta del modelo base, lo que dificulta reproducir resultados.
- El token de activacion `RUBY@26` incluye caracteres especiales (`@`), lo que puede requerir cuidado en el escapado dentro de pipelines y APIs que procesen prompts.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Nanami231/poka-26
- Modelo base declarado: https://huggingface.co/krea/Krea-2-Raw
- Variante Turbo usada en los ejemplos: https://huggingface.co/krea/Krea-2-Turbo
- Libreria diffusers: https://github.com/huggingface/diffusers

# neulab/t-dig-checkpoints

## Resumen

T-DIG es un conjunto de adaptadores LoRA que implementan las políticas de expansión de prompt del trabajo *T-DIG: Text-conditioned Diversity for Image Generation* (en revisión), desarrollado por el laboratorio neulab. El problema que resuelve es concreto: cuando se pide a un modelo texto-a-imagen (T2I) que genere varias imágenes a partir de un mismo prompt, la variación resultante es arbitraria. Estas políticas reciben un prompt y un eje de variación ("la hora del día", "el ángulo de cámara") y escriben K prompts, uno por imagen, que modifican ese eje y mantienen el resto del contenido. El modelo T2I no se modifica en ningún momento: solo cambia el texto que se le entrega.

Hay dos familias de políticas. Las de *generación* producen K prompts nuevos desde cero; las de *edición* reciben además las K imágenes actuales de un conjunto ya generado y emiten una instrucción de edición por imagen. Cada política se entrena con GRPO contra un modelo T2I concreto (Qwen-Image-2512, Stable Diffusion 3.5 Large, Stable Diffusion 3.5 Medium y FLUX.2 [klein] 9B) y funciona mejor con el suyo, aunque es transferible.

Los adaptadores se montan sobre la familia Qwen3.5 en tres tamaños (4B, 9B y 35B-A3B, este último con arquitectura MoE), con rango LoRA 32 y licencia Apache 2.0. El repositorio ocupa 3,5 GB y contiene una carpeta por combinación de modelo T2I y tamaño, cada una con su `adapter_model.safetensors`, `adapter_config.json` y `selection.json`. Es relevante ahora porque ataca un problema poco tratado —el control fino de la diversidad en generación de imágenes— desde el lado del prompt y con adaptadores ligeros que se sirven junto al LLM base en vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (rango 32) sobre LLMs decoder-only de la familia Qwen3.5; la variante 35B-A3B del modelo base es MoE |
| Parametros totales | No aplica al adaptador; modelos base de 4B, 9B y 35B (35B-A3B) |
| Parametros activos | Aproximadamente 3B en la variante 35B-A3B (según la nomenclatura A3B del modelo base); no aplica en 4B y 9B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los adaptadores se distribuyen en safetensors; la cuantización aplica al modelo base) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`adapter_model.safetensors`, `adapter_config.json`, `selection.json`) |
| Tamano del repositorio | 3,5 GB |
| Modelos T2I objetivo | Qwen-Image-2512, Stable Diffusion 3.5 Large, Stable Diffusion 3.5 Medium, FLUX.2 [klein] 9B |
| Libreria | PEFT (compatible con vLLM mediante `LoRARequest`) |
| Dataset de entrenamiento | neulab/t-dig-data: unas 76k parejas (prompt, eje) procedentes de 19,8k prompts |

## Arquitectura y entrenamiento

El modelo no es un transformer entrenado desde cero, sino un adaptador LoRA de rango 32 insertado en un LLM de la familia Qwen3.5. La política de generación transforma la instrucción construida por `tdig.instruction.instruction` (prompt original, eje de variación, K y presupuesto de palabras) en K bloques `<prompt>...</prompt>`. La política de edición consume además las K imágenes actuales y emite una instrucción de edición por imagen mediante `tdig.instruction.edit_instruction`. El pipeline declarado en HuggingFace es `text-to-image`, pero conviene leerlo con cuidado: el adaptador no genera imágenes, genera los prompts que alimentan al modelo T2I.

El entrenamiento usa GRPO con tamaño de conjunto K=4 y 8 completaciones por pareja (prompt, eje), learning rate 2e-5 y sin término KL. La recompensa combina cuatro señales: diversidad TPIPS-Vendi a lo largo del eje solicitado; un hinge negativo sobre VQAScore cuando la alineación cae por debajo del nivel i.i.d. del propio modelo T2I; una penalización por exceso de presupuesto de palabras; y un hinge pequeño sobre HPSv3 también por debajo del nivel i.i.d. Los datos de entrenamiento son aproximadamente 76k parejas (prompt, eje) extraídas de 19,8k prompts, publicadas como dataset independiente.

La selección de checkpoints publicados no es la del paper en todos los casos. Los `9b-generate-paper` son los que sustentan los resultados del artículo (update 800 para Qwen-Image y SD3.5 Large, 700 para SD3.5 Medium y FLUX.2 [klein]). El resto se eligió sobre 758 parejas (prompt, eje) reservadas con una regla fija: tomar checkpoints desde el update 400, descartar los que piden con frecuencia escribir texto en la imagen o añaden personas no mencionadas, y entre los restantes quedarse con el mejor VQAScore dentro de 0,04 de diversidad (D_a) del más diverso. El campo `selection_note` marca las ejecuciones en las que ningún checkpoint cumplió los límites del segundo paso. El propio autor advierte que entrenar más allá de estos puntos tiende a subir las métricas automáticas mediante atajos, no mediante mejores imágenes.

## Capacidades

- Expansión de prompt con diversidad controlada: dado un prompt y un eje, produce K prompts que varían solo ese eje.
- Políticas de edición: genera una instrucción de edición por imagen a partir de un conjunto existente y las K imágenes actuales.
- Control continuo de la fuerza de diversidad: escalar los pesos `lora_B` por un factor α entre 0 y 1 interpola entre el modelo sin entrenar (α=0) y la política entrenada (α=1).
- Ajuste del presupuesto de palabras del prompt de salida mediante el parámetro `word_cap`.
- Salida estructurada en bloques `<prompt>...</prompt>`, apta para parseo automático y consumo por el modelo T2I.
- Compatibilidad con varios modelos T2I: cada adaptador está entrenado contra uno, pero se ha validado su uso con los demás.
- Servido multi-LoRA en vLLM (`enable_lora=True`, `max_lora_rank=32`), lo que permite atender varias políticas desde un mismo modelo base.
- No soporta tool calling, agentes, visión ni audio: es un adaptador especializado en generación de texto para expansión de prompts.

## Casos de uso

- Generación por lotes con variación controlada: en un pipeline de creación de contenido, generar 8 imágenes de un mismo producto variando solo la iluminación; la política escribe 8 prompts que cambian ese eje y mantienen encuadre, objeto y estilo.
- Ilustración editorial y storyboards: a partir de una descripción de escena, producir variantes que recorran momentos del día o ángulos de cámara de forma coherente con la narración, en lugar de dejar la variación al azar del sampler.
- Aumento de datos para entrenar modelos T2I: generar conjuntos de prompts que cubren sistemáticamente un eje (por ejemplo, condiciones meteorológicas) para construir pares imagen-texto con diversidad medible.
- Exploración creativa con control interactivo: el repositorio de código expone el factor α como un slider, de modo que un diseñador puede abrir o cerrar la diversidad en tiempo real sin cambiar de modelo.
- Refinamiento iterativo de un set ya generado: con la política de edición, tomar las K imágenes actuales y pedir cambios específicos por imagen (vestuario, fondo, expresión) sin regenerar desde cero.
- Pruebas A/B de conceptos creativos: generar variantes controladas de un mismo concepto para campañas y comparar rendimiento por eje (por ejemplo, encuadre cerrado frente a abierto) con el resto de variables fijas.
- Evaluación de modelos T2I: usar la política como generador de prompts reproducible que permite medir la sensibilidad de un modelo T2I a un eje concreto, con el prompt base constante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye una tabla de MMLU, HumanEval, GSM8K ni métricas equivalentes, y el artículo está en revisión. Lo que sí se publica son métricas internas por checkpoint en cada `selection.json`: update de entrenamiento, VQAScore, diversidad D_a, HPSv3 y frecuencia de adiciones no solicitadas, calculadas sobre 758 parejas (prompt, eje) reservadas. Esas cifras no se reproducen aquí porque no están incluidas en la información proporcionada.

Cobertura de checkpoints publicados:

| Modelo T2I | 4B | 9B | 35B-A3B |
|---|---|---|---|
| Qwen-Image-2512 | generate, edit | generate, edit, generate-paper | generate |
| Stable Diffusion 3.5 Large | generate, edit | generate, edit, generate-paper | no disponible |
| Stable Diffusion 3.5 Medium | generate, edit | generate, edit, generate-paper | generate, edit |
| FLUX.2 [klein] 9B | generate, edit | generate, edit, generate-paper | generate, edit |

## Requisitos de hardware

- El adaptador en sí es pequeño (rango 32); el coste real lo determina el modelo base Qwen3.5 elegido.
- Base 4B: alrededor de 8 GB de VRAM en bf16 y unos 3 GB en cuantización de 4 bits; cabe en RTX 4090, RTX 4080, L4 y A10.
- Base 9B: alrededor de 18 GB en bf16 y unos 6 GB en 4 bits; cabe en RTX 4090 (24 GB), L40S y A100 40 GB.
- Base 35B-A3B: alrededor de 70 GB en bf16 y unos 20 GB en 4 bits; requiere A100 80 GB o H100 para bf16, y puede entrar en una RTX 4090 con cuantización agresiva gracias a que solo activa unos 3B de parámetros.
- Despliegue recomendado: vLLM con `enable_lora=True` y `max_lora_rank=32`, según el ejemplo de la model card; también es viable llama.cpp u Ollama con el modelo base cuantizado, aunque la integración de adaptadores LoRA PEFT está más rodada en vLLM.
- La configuración del ejemplo usa `temperature=1.0` y `max_tokens=1024`; el sampling debe mantenerse en valores altos porque la política está entrenada con esa configuración.
- Latencia y throughput: no disponibles. Como referencia cualitativa, la generación de K=4 prompts requiere una sola pasada de hasta 1024 tokens, muy por debajo del coste de las K imágenes que después se generan.
- El despliegue multi-LoRA permite servir varias políticas (distintos modelos T2I y tamaños) sobre un único modelo base, con un adaptador cargado por petición mediante `LoRARequest`.

## Comparativa con modelos similares

| Alternativa | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| T-DIG (este modelo) | Adaptador LoRA r=32 sobre bases de 4B, 9B y 35B-A3B | no disponible | Diversidad de prompts condicionada por eje, con recompensa sobre diversidad y alineación | Apache 2.0 | HuggingFace (neulab/t-dig-checkpoints) |
| Qwen3.5 base sin adaptador (α=0) | 4B / 9B / 35B-A3B | no disponible | LLM generalista; expande prompts sin control explícito del eje ni de la diversidad | Según el modelo base | HuggingFace (Qwen/Qwen3.5-4B, -9B, -35B-A3B) |
| Políticas de prompt fijas o templates manuales | No aplica | No aplica | Variación mediante plantillas y listas de modificadores | No aplica | Implementación propia |
| Otros adaptadores de expansión de prompt para T2I | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre adaptadores comparables de otros autores con el mismo objetivo, por lo que la comparación cuantitativa de rendimiento entre alternativas no está disponible.

## Limitaciones y advertencias

- Adiciones no solicitadas: las políticas entrenadas a veces introducen contenido que el usuario no pidió, sobre todo personas adicionales; en algunos modelos T2I también piden escribir texto dentro de la imagen. `selection.json` reporta la frecuencia por checkpoint.
- Las políticas de edición de Stable Diffusion 3.5 Medium son las que más incurren en ese problema, según la propia model card.
- Entrenar más allá de los checkpoints recomendados sube las métricas automáticas mediante atajos (texto en imagen, personas extra) en lugar de mejorar las imágenes; hay que usar los checkpoints publicados, no los últimos.
- Acoplamiento al modelo T2I: cada política se entrena con GRPO contra un T2I concreto; funciona con otros, pero rinde mejor con el suyo.
- Naturaleza del artefacto: es un adaptador LoRA, no un modelo autónomo; requiere descargar el modelo base Qwen3.5 correspondiente y respetar su licencia además de la Apache 2.0 del adaptador.
- El pipeline declarado en HuggingFace (`text-to-image`) puede inducir a error en herramientas automáticas: el adaptador genera texto, no imágenes.
- El artículo está en revisión y no hay información de cita publicada; los resultados del paper no están disponibles en la información proporcionada.
- Idiomas soportados y comportamiento multilingüe: no disponibles. Las instrucciones de entrenamiento y el dataset están en inglés, por lo que el rendimiento en castellano no está verificado.
- Longitud de contexto: no disponible; el ejemplo oficial limita la salida a 1024 tokens para K=4 prompts.
- Sin datos publicados de sesgos, tasa de alucinación o robustez frente a prompts adversarios.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/neulab/t-dig-checkpoints
- Dataset de entrenamiento: https://huggingface.co/datasets/neulab/t-dig-data
- Repositorio de código (incluye `tdig.instruction` y el framework interactivo con slider de diversidad): https://github.com/neulab/t-dig
- Modelo base Qwen3.5 4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Modelo base Qwen3.5 9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Modelo base Qwen3.5 35B-A3B: https://huggingface.co/Qwen/Qwen3.5-35B-A3B

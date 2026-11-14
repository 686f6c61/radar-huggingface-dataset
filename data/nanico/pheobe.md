# Nanico/pheobe

## Resumen

Nanico/pheobe es un LoRA de tipo DreamBooth para el modelo de difusion texto-a-imagen Krea 2, entrenado sobre la variante Krea-2-Raw y presentado por el autor sobre Krea-2-Turbo. Se publica en Hugging Face bajo la libreria diffusers con la etiqueta `template:sd-lora` y el prefijo de instancia `phb`, que actua como token disparador del concepto aprendido. El repositorio ocupa 1,0 GB y se distribuye con licencia Apache 2.0.

El modelo no es un modelo fundacional autonomo: es un adaptador de bajo rango que se carga sobre el pipeline `Krea2Pipeline` de Krea. Su proposito es inyectar un concepto visual concreto (referido como "phb" en los ejemplos de la model card) en las generaciones del modelo base, manteniendo el resto de capacidades del mismo. La model card muestra tres ejemplos generados con 8 pasos de inferencia y `guidance_scale=0.0` sobre Krea 2 Turbo.

La relevancia de esta ficha es limitada por la escasez de informacion tecnica publicada: no se detallan dimensiones del LoRA, rango, dataset de entrenamiento, numero de pasos ni resultados cuantitativos. Se trata de un artefacto reciente (creado y actualizado el 14 de noviembre de 2026) sin descargas ni likes registrados en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo de difusion texto-a-imagen; el modelo base Krea 2 no detalla su arquitectura en la informacion disponible |
| Parametros totales | no disponible (el repositorio pesa 1,0 GB, pero no se especifica el numero de parametros del adaptador) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica a modelos de difusion texto-a-imagen en el sentido de contexto de tokens de LLM) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el prompt de instancia es `phb`; los ejemplos estan en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible de forma explicita; el uso documentado es mediante `diffusers` (`load_lora_weights`), lo que implica pesos compatibles con la libreria (probablemente safetensors, no confirmado) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de tipo DreamBooth entrenado sobre Krea-2-Raw, la variante "raw" del modelo Krea 2, y esta pensado para ser usado en inferencia sobre Krea-2-Turbo. La model card indica que las muestras se generaron con Turbo en 8 pasos, con `guidance_scale=0.0`, lo que sugiere un ajuste orientado a la variante destilada de pocos pasos. El token de activacion es `phb`, declarado como `instance_prompt` en los metadatos.

No se publican datos sobre el numero de imagenes de entrenamiento, la resolucion, el rango del LoRA, la tasa de aprendizaje, el numero de pasos ni la composicion del dataset. Tampoco se documenta si hubo regularizacion, captions automaticas o tecnicas adicionales. La unica innovacion tecnica reseñable es su integracion con el ecosistema diffusers mediante `Krea2Pipeline` y `load_lora_weights`, que permite cargarlo sobre el modelo base sin reentrenamiento.

## Capacidades

- Generacion de imagenes texto-a-imagen condicionada por el token `phb`, que activa el concepto aprendido.
- Compatibilidad con el pipeline `Krea2Pipeline` de diffusers mediante `load_lora_weights`.
- Uso sobre Krea-2-Turbo con 8 pasos de inferencia y `guidance_scale=0.0`, segun los ejemplos de la model card.
- Composicion de escenas complejas: los ejemplos incluyen una calle cyberpunk nocturna, un viñedo toscano y una nebulosa cosmica, lo que indica que el LoRA preserva la capacidad del modelo base de generar entornos variados.
- Integracion del concepto en contextos diversos (objeto flotante en una pantalla holografica, objeto sobre una mesa, objeto tallado en roca), lo que sugiere cierta generalizacion del concepto.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking, ya que no aplican a un LoRA de difusion.
- Capacidades multilingues: no disponibles; los prompts de ejemplo estan en ingles.

## Casos de uso

- Ilustracion conceptual de marca: usar el token `phb` para insertar de forma consistente un elemento visual propio (mascota, producto o simbolo) en escenas generadas por Krea 2, manteniendo coherencia entre piezas de una campana.
- Prototipado rapido de assets para videojuegos: generar variaciones del concepto en entornos distintos (urbano, natural, cosmico) con 8 pasos en Krea-2-Turbo, lo que reduce el coste de iteracion frente a un modelo no destilado.
- Storyboarding y previsualizacion: producir imagenes de referencia para guiones o pitch decks combinando el concepto con descripciones de escena detalladas, gracias a la capacidad del modelo base de componer iluminacion y materiales.
- Pruebas de integracion en pipelines diffusers: servir como ejemplo de carga de LoRA sobre `Krea2Pipeline` para validar flujos de trabajo de generacion en produccion con `load_lora_weights`.
- Experimentacion artistica: explorar la interpolacion del concepto con estilos y entornos variados (cyberpunk, rustico, cosmico) para estudiar como un LoRA de bajo rango afecta a la composicion del modelo base.
- Generacion de material promocional: crear imagenes tematicas para redes o blogs usando el concepto como elemento recurrente, con la ventaja de que el adaptador es ligero (repositorio de 1,0 GB) y se carga sobre el modelo base sin duplicar pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente incluye tres imagenes de muestra generadas con 8 pasos y `guidance_scale=0.0` sobre Krea 2 Turbo, sin metricas cuantitativas (FID, CLIP score, similitud de concepto u otras).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica para el LoRA; depende enteramente del modelo base Krea 2, cuyos requisitos no se detallan en la informacion proporcionada.
- GPU recomendadas: no disponibles; la model card solo indica `.to("cuda")` en el ejemplo de codigo, sin especificar modelo de GPU.
- Compatibilidad con GPU de consumo: no confirmada; el repositorio del adaptador pesa 1,0 GB, pero el modelo base condiciona el requisito real de VRAM.
- Opciones de despliegue: `diffusers` con `Krea2Pipeline` y `load_lora_weights` (unico metodo documentado). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; los ejemplos usan 8 pasos de inferencia, lo que sugiere un regimen de baja latencia en la variante Turbo, pero no se aportan mediciones.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros LoRA comparables para Krea 2 ni datos de rendimiento que permitan una comparacion rigurosa. Como referencia estructural, la comparacion natural seria con otros adaptadores LoRA del mismo modelo base (krea/Krea-2-Raw), pero no se han identificado alternativas concretas en la informacion disponible.

## Limitaciones y advertencias

- Informacion tecnica muy escasa: no se documentan rango del LoRA, dataset, pasos de entrenamiento ni hiperparametros, lo que dificulta evaluar su calidad y reproducibilidad.
- Riesgo de sobreajuste al concepto: al ser un DreamBooth con un unico token (`phb`), puede degradar la diversidad de las generaciones o introducir artefactos cuando el concepto se combina con escenas muy distintas a las del entrenamiento.
- Dependencia del modelo base: su comportamiento esta ligado a Krea-2-Raw y Krea-2-Turbo; cambios en el pipeline o en las versiones del modelo base pueden alterar los resultados.
- Idiomas: no se documenta soporte multilingue; los prompts de ejemplo estan en ingles y se desconoce el comportamiento con prompts en castellano.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base Krea 2 puede tener sus propias condiciones que el usuario debe verificar por separado.
- Ausencia de validacion externa: 0 descargas y 0 likes en el momento de la consulta, sin evaluaciones de terceros ni benchmarks publicados.
- Riesgo de sesgos y alucinacion visual: no se documentan evaluaciones de sesgo; como todo modelo de difusion, puede generar contenido estereotipado o inexacto segun el prompt.

## Enlaces

- Hugging Face: https://huggingface.co/Nanico/pheobe
- Modelo base: https://huggingface.co/krea/Krea-2-Raw
- Modelo de inferencia mencionado: https://huggingface.co/krea/Krea-2-Turbo
- No se han encontrado en la informacion proporcionada papers, blogs, repositorios adicionales ni demos distintos de la propia model card.

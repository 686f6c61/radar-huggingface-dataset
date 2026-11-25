# PixoLabs/Dixi-350M

## Resumen

Dixi-350M es un adaptador LoRA experimental desarrollado por PixoLabs sobre el modelo base LiquidAI/LFM2.5-350M, orientado a tareas de decisión y clasificación. En lugar de generar texto libre, el modelo puntúa respuestas candidatas y devuelve una distribución de probabilidad normalizada sobre un conjunto de opciones (entre 2 y 26 con el motor original, hasta 255 con el motor experimental de opciones ampliadas). Está pensado para enrutamiento, clasificación y cualquier tarea formulable como elección entre alternativas.

Técnicamente, se trata de una adaptación compacta: el backbone LFM2.5 de aproximadamente 350M parámetros se especializa mediante 6,0M de parámetros LoRA entrenables. El modelo puntúa los logits de los tokens correspondientes a las letras de cada opción y aplica softmax sobre ellos; una pregunta de sí/no se mapea a dos opciones mediante el adaptador de evaluación. La longitud de contexto del modelo base es de 32.768 tokens, aunque el entrenamiento se limitó a 1.024 y la evaluación actual a 8.192.

Su relevancia es acotada y experimental: el propio autor lo describe como un checkpoint de primera ejecución en vista previa privada, sin puntuación privada completa en el Decision Index ni envío a la tabla de clasificación. No reproduce los cabezales de decisión nativos ni las capacidades multimodales de modelos como d1, en los que se inspira. La licencia es la LFM Open License v1.0 del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone de texto LFM2.5 con adaptador LoRA y puntuación de elección por siguiente token |
| Parametros totales | Aproximadamente 350M (backbone) |
| Parametros activos | No aplica (no es MoE); 6,0M de parámetros LoRA entrenables |
| Longitud de contexto | Base: 32.768 tokens; límite de entrenamiento: 1.024; límite de evaluación actual: 8.192 |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Base multilingüe; rendimiento de decisión por idioma no medido |
| Licencia | LFM Open License v1.0 (license_name: lfm1.0) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base y el código de puntuación incluido |

## Arquitectura y entrenamiento

Dixi-350M no es un modelo completo, sino un adaptador LoRA sobre LiquidAI/LFM2.5-350M. El mecanismo de decisión formatea el estado de texto, la pregunta y las opciones con la plantilla de chat del modelo base, evalúa los logits del siguiente token para las letras de cada opción y aplica softmax sobre esos logits para obtener probabilidades normalizadas. El motor original realiza una pasada hacia delante por pregunta; el motor experimental de opciones ampliadas requiere múltiples pasadas para manejar hasta 255 alternativas.

El adaptador se entrenó sobre el dataset `amyrmahdy/decima-synthetic-decisions`. No se especifican en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron técnicas de RLHF o DPO. El autor indica explícitamente que las puntuaciones no han demostrado estar calibradas y que el modelo se inspira en d1 sin reproducir sus cabezales de decisión nativos ni sus capacidades multimodales.

## Capacidades

- Clasificación de texto mediante elección entre alternativas (2 a 26 opciones con el motor original, hasta 255 con el motor experimental).
- Enrutamiento y toma de decisiones expresadas como selección entre opciones.
- Puntuación de respuestas candidatas con salida de distribución de probabilidad normalizada.
- Manejo de preguntas de sí/no mapeadas a dos opciones mediante el adaptador de evaluación.
- Capacidad multilingüe heredada del modelo base, aunque sin medición de rendimiento por idioma.
- No soporta generación de texto libre como tarea principal, ni tool calling, ni agentes multi-paso, ni visión, ni audio según la información disponible.

## Casos de uso

- Clasificación de sentimiento: el modelo recibe un estado de texto y una pregunta con opciones como "positive"/"negative" y devuelve probabilidades; el ejemplo de la model card ilustra este uso directo con una sola pasada.
- Enrutamiento de consultas: dado un mensaje de usuario y un conjunto de categorías o departamentos como opciones, el modelo asigna una probabilidad a cada ruta, útil en sistemas de triaje previos a un LLM mayor.
- Moderación de contenido por categorías: clasificación de textos en clases predefinidas de riesgo o temática mediante la puntuación de opciones múltiples.
- Etiquetado de datos a escala: clasificación automática de grandes volúmenes de texto en categorías discretas, aprovechando el tamaño reducido del backbone para procesar lotes con bajo coste.
- Selección de respuesta en pipelines de evaluación: puntuar varias respuestas candidatas generadas por otro modelo y elegir la de mayor probabilidad, como paso de re-ranking.
- Clasificación multilingüe ligera: uso del backbone multilingüe para tareas de elección entre alternativas en varios idiomas, con la advertencia de que el rendimiento por idioma no está medido.

## Benchmarks y rendimiento

La información disponible menciona que ambas ejecuciones del conjunto público del Decision Index están completas, pero no incluye los valores numéricos de los resultados. No hay puntuación privada completa ni envío a la tabla de clasificación.

No se han publicado resultados de benchmarks numéricos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; un backbone de 350M en precisión de 16 bits requiere aproximadamente 0,7 GB solo para pesos, más el adaptador LoRA de 6,0M de parámetros y el overhead de activaciones.
- GPU recomendadas: no especificadas en la información disponible; por tamaño, cualquier GPU con al menos unos pocos GB de VRAM debería ser suficiente.
- Compatibilidad con GPU de consumo: previsiblemente sí, dado el tamaño del backbone, aunque no se confirma en la documentación.
- Opciones de despliegue: el adaptador requiere el modelo base y el módulo de puntuación incluido (`dixe_decision`); el ejemplo usa `load_model` y `choice_probabilities` con `device="cuda:0"`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Dixi-350M | ~350M + 6,0M LoRA | 32.768 (base); 1.024 entrenamiento; 8.192 evaluación | Adaptador LoRA de decisión sobre LFM2.5 | LFM Open License v1.0 | Repositorio privado con acceso |
| LiquidAI/LFM2.5-350M | ~350M | 32.768 | Modelo base de texto | LFM Open License v1.0 | Público en Hugging Face |
| d1 (referencia citada) | No disponible | No disponible | Modelo de decisión con cabezales nativos y capacidades multimodales | No disponible | No disponible |

La comparación con d1 es únicamente referencial: el autor indica que Dixi-350M se inspira en él pero no reproduce sus cabezales de decisión nativos ni sus capacidades multimodales.

## Limitaciones y advertencias

- Modelo experimental en vista previa privada; el acceso requiere una cuenta con permisos al repositorio.
- Las puntuaciones no han demostrado estar calibradas, según el propio autor.
- El límite de entrenamiento es de 1.024 tokens, muy inferior al contexto base de 32.768; el uso con contextos largos puede degradar la calidad.
- El rendimiento de decisión por idioma no se ha medido, pese a que el backbone es multilingüe.
- No reproduce los cabezales de decisión nativos ni las capacidades multimodales de d1.
- No hay puntuación privada completa ni envío a la tabla de clasificación del Decision Index.
- Riesgo de alucinación y sesgos: no documentados en la información disponible.
- Restricciones de licencia: LFM Open License v1.0; deben revisarse sus términos para uso comercial, ya que no es una licencia permisiva estándar.
- Requiere el modelo base y el código de puntuación incluido; no es un checkpoint autónomo.

## Enlaces

- Hugging Face: https://huggingface.co/PixoLabs/Dixi-350M
- Organización PixoLabs: https://huggingface.co/PixoLabs
- Decision Index (Space): https://huggingface.co/spaces/multimodalart/jev-decision-index
- Modelo base LiquidAI/LFM2.5-350M: https://huggingface.co/LiquidAI/LFM2.5-350M
- Licencia LFM Open License v1.0: https://www.liquid.ai/lfm-license
- Dataset de entrenamiento: https://huggingface.co/datasets/amyrmahdy/decima-synthetic-decisions

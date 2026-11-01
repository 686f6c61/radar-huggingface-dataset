# AbstractPhil/qwen3.5-2b-think-symbolic-image

## Resumen

Lucia 2B es un adaptador LoRA de tipo vision-language construido sobre Qwen/Qwen3.5-2B, desarrollado por AbstractPhil. El modelo resuelve una tarea muy concreta: dado un imagen (arte, fotografía, objetos de museo), genera una "cadena de pensamiento" estructurada en forma de filas etiquetadas (see, place, form, colour, mood, caption, prompt, question) que documentan de forma simbólica lo que un observador cuidadoso vería y se preguntaría. No es un modelo generalista, sino un especialista en captioning interpretativo con razonamiento explícito.

Forma parte de la familia "Lucia", una serie de adaptadores del mismo recetario entrenados a distintos tamaños (2B, 4B, 9B). Según el autor, Lucia 2B iguala al 9B en la forma de las filas y en el término medio, aunque respalda sus pensamientos con algo menos de frecuencia y define más en las filas de especificación larga. Es relevante ahora porque propone un formato de salida simbólico y parseable (con marcadores `[record]`, `[chain]`, `[unknown]`) que facilita la evaluación automática y el uso en pipelines de catalogación.

El modelo base tiene 2 mil millones de parámetros y es multimodal (image-text-to-text). La longitud de contexto, el número de tokens de entrenamiento y los detalles de la composición del dataset no están disponibles en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con adaptador LoRA sobre Qwen/Qwen3.5-2B |
| Parametros totales | 2 mil millones (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; el base admite las cuantizaciones habituales de Qwen3.5-2B) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); existe una versión full fine-tune en el repo hermano |
| Libreria | peft (transformers 5, peft >= 0.18) |
| Pipeline | image-text-to-text |
| Tamano del repo | 0,1 GB |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (PEFT) sobre el modelo multimodal Qwen/Qwen3.5-2B. La receta de entrenamiento enseña al modelo a producir una "fila" estructurada de pensamiento simbólico: una secuencia de pasos nombrados (see, name, place, count, relate, form, light, colour, mood, mean, intend, story, compare, change, check, say) seguida de formulaciones (caption, prompt, tags, critique) y de preguntas con su respuesta y su justificación. Las preguntas se etiquetan con `[record]` (hecho de la imagen), `[chain]` (deducido por la cadena) o `[unknown]`.

Los datasets de entrenamiento citados son AbstractPhil/thought-symbolic-image-captions y AbstractPhil/qwen-symbolic-thinking-image-training. No se especifican en la información disponible el número de tokens, la composición exacta del dataset ni si hubo RLHF o DPO. El autor indica que todas las tallas de la familia se entrenan con las mismas filas y el mismo recetario, y que la profundidad del razonamiento se controla con palabras en el prompt ("a quick look" = 1-2 pensamientos, "a closer look" = 3-5, "a long look" = 6-10). El parser, scorer y trainer están en el repositorio qwen-symbolic-thinking.

## Capacidades

- Generación de texto e image captioning estructurado en formato simbólico de filas etiquetadas.
- Razonamiento visual en cadena (chain-of-thought) con pasos nombrados y control de profundidad mediante prompt.
- Producción de captions, prompts de generación de imágenes, tags y críticas a partir de una imagen.
- Formulación de preguntas abiertas sobre la imagen, clasificando cada respuesta como hecho, deducción o desconocido.
- Descripción de medio, forma, luz, color, estado de ánimo y composición en obras de arte, fotografías y objetos de museo.
- Capacidades multilingües: solo inglés (en).
- No se documenta soporte de tool calling, function calling ni comportamiento de agente multi-paso en la información disponible.

## Casos de uso

- Catalogación de colecciones de museo: el modelo genera filas estructuradas con medio, forma, color y preguntas abiertas para cada pieza, lo que permite poblar metadatos de forma semiautomática y marcar los campos `[unknown]` para revisión humana.
- Generación de prompts para modelos de imagen: a partir de una fotografía o pintura, produce la línea `prompt` con términos de estilo, medio y composición listos para reutilizar en pipelines de generación.
- Etiquetado y tagging de imágenes para búsqueda: la salida en filas parseables (ver `qwen_symbolic_thinking.chain.parse`) permite extraer tags y descripciones de forma programática sin post-procesado manual.
- Evaluación de modelos de visión: al emitir cadenas con pasos y justificaciones, sirve como generador de razonamientos auditables para comparar la calidad interpretativa entre modelos.
- Descripción accesible de obras de arte: genera descripciones en lenguaje natural y críticas breves útiles para fichas de accesibilidad o audio-guías.
- Investigación en razonamiento multimodal simbólico: el formato de filas y los marcadores `[record]`/`[chain]`/`[unknown]` permiten medir la fidelidad del razonamiento frente a la evidencia visual, lo que lo hace adecuado como banco de pruebas en investigación.

## Benchmarks y rendimiento

El autor publica una comparación entre Lucia 2B y Lucia v1 (9B) sobre 60 imágenes y 40 especificaciones no vistas en entrenamiento, y sobre el "término medio" con 500 imágenes de la National Gallery of Art y 200 de AIC, NGA, Cleveland y el Met. La información disponible solo incluye la primera fila de esa tabla:

| Metrica | Lucia 2B | Lucia v1 (9B) |
|---|---|---|
| Forma de fila, imágenes / especificaciones | 1,00 / 1,00 | 1,00 / 1,00 |
| Said / backed (fidelidad del respaldo) | no disponible | no disponible |
| Término medio (NGA + AIC/NGA/Cleveland/Met) | no disponible | no disponible |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.).

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Como referencia, un modelo de 2B en bfloat16 requiere aproximadamente 4-5 GB de pesos, más el adaptador LoRA (repo de 0,1 GB) y el procesador visual.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cabe en GPUs de consumo como RTX 3060 12 GB, RTX 4070 o superiores; también en A100/H100 para despliegue por lotes.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con 8 GB o más en bfloat16, aunque el dato no está confirmado en la información disponible.
- Opciones de despliegue: transformers 5 con peft >= 0.18 (carga y merge del adaptador según el ejemplo del autor). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Lucia 2B (este) | 2B | no disponible | Captioning simbólico con cadena de pensamiento | apache-2.0 | HuggingFace (adaptador LoRA) |
| Lucia 4B | no disponible | no disponible | Misma receta, mayor capacidad | no disponible | HuggingFace (familia Lucia) |
| Lucia v1 (9B) | 9B | no disponible | Misma receta, referencia de calidad | no disponible | HuggingFace (familia Lucia) |
| Qwen/Qwen3.5-2B | 2B | no disponible | Modelo base multimodal generalista | no disponible | HuggingFace |

La comparación más directa es con el modelo base Qwen3.5-2B (generalista) y con las otras tallas de la propia familia Lucia. No se dispone de datos de benchmarks cruzados con otros modelos de captioning en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés; no hay evidencia de capacidades multilingües.
- El modelo está entrenado para un formato de salida muy específico; un system prompt no visto en entrenamiento provoca sobreescritura según el autor, por lo que debe ejecutarse sin system prompt.
- Requiere decodificación greedy y thinking desactivado (`enable_thinking=False`) para reproducir el comportamiento esperado.
- Riesgo de alucinación en las filas de interpretación (mood, mean, story): el propio formato distingue `[record]`, `[chain]` y `[unknown]`, pero no garantiza que la clasificación sea correcta.
- El autor reconoce que la talla 2B "respalda sus pensamientos con algo menos de frecuencia" que el 9B y define más en las filas de especificación larga, lo que sugiere menor precisión en descripciones detalladas.
- Licencia apache-2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-2B.
- Sin descargas ni likes en el momento de la consulta; ecosistema y validación externa muy limitados.
- No se documentan sesgos específicos ni evaluación de robustez.

## Enlaces

- HuggingFace (adaptador LoRA): https://huggingface.co/AbstractPhil/qwen3.5-2b-think-symbolic-image
- Full fine-tune: https://huggingface.co/AbstractPhil/qwen3.5-2b-think-symbolic-image-full
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Dataset de captions: https://huggingface.co/datasets/AbstractPhil/thought-symbolic-image-captions
- Dataset de entrenamiento: https://huggingface.co/datasets/AbstractPhil/qwen-symbolic-thinking-image-training
- Repositorio de herramientas (parser, scorer, trainer): https://github.com/AbstractEyes/qwen-symbolic-thinking

# nenkoru/memorilla-token-path-loras

## Resumen

`nenkoru/memorilla-token-path-loras` es un conjunto de tres adaptadores LoRA de investigación para el modelo Qwen3-8B, publicados por el autor independiente nenkoru. No se trata de un modelo autónomo: los adaptadores están diseñados para funcionar exclusivamente junto al núcleo de memoria pv4 de Memorilla (proyecto de snap-stanford), que comprime cada hecho almacenado sobre un usuario en 16 tokens de memoria. Sin esos tokens, los LoRA no aportan ninguna funcionalidad útil sobre Qwen3-8B base.

El paquete contiene tres piezas con roles distintos: un `block-rater` que puntúa si un hecho concreto puede hacer que una respuesta típica sea incorrecta para ese usuario, un `reader` que responde a la petición a partir de los bloques de memoria seleccionados, y un `reader-grpo-pilot-step10` que es una variante del reader tras 10 pasos de GRPO (piloto detenido en el paso 19 de unos 50) y que no fue evaluada. Los pesos son LoRA PEFT con rango 16, alpha 32, aplicados sobre las proyecciones `q_proj`, `k_proj`, `v_proj` y `o_proj` de las 36 capas del transformer, en fp32.

La relevancia del artefacto es acotada y experimental: sirve como material reproducible para investigar la ruta de información entre tokens de memoria y atención en modelos de 8B, no como componente listo para producción. El repositorio ocupa 0,2 GB y se distribuye bajo licencia Apache 2.0, la misma que Qwen3-8B y Memorilla.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen3-8B; rango 16, alpha 32, en `q_proj`, `k_proj`, `v_proj`, `o_proj` de las 36 capas |
| Parametros totales | no disponible (adaptadores LoRA; el modelo base Qwen3-8B tiene 8 000 millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-8B, no especificada en la model card) |
| Tipos de cuantizacion | no disponible para los adaptadores; el block-rater se destiló sobre base int8 |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`adapter_model.safetensors`) y `.pt` originales |
| Modelo base | Qwen/Qwen3-8B |
| Libreria | peft |
| Tamano del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

Los adaptadores son LoRA de bajo rango (r=16, alpha=32) inyectados en las cuatro proyecciones de atención de cada una de las 36 capas de Qwen3-8B. El autor usa su propio wrapper de LoRA con la fórmula `y = W x + (x Aᵀ Bᵀ) · alpha/r`, matemáticamente equivalente a PEFT, y proporciona un script de conversión entre los `.pt` originales y el formato safetensors de PEFT. El `block-rater` fue destilado del rater de texto de 8B durante 90 minutos sobre base int8, con etiquetas generadas por Qwen3-8B. El `reader` se entrenó para responder a partir de los bloques de memoria seleccionados, y existe una variante tras 10 pasos de GRPO cuyo piloto se detuvo en el paso 19 de aproximadamente 50.

El detalle técnico distintivo no está en los LoRA en sí, sino en su acoplamiento con el núcleo de memoria pv4 de Memorilla: cada hecho del usuario se representa como 16 tokens de memoria que el modelo debe interpretar. Los adaptadores modifican la atención para que esa ruta de tokens sea explotable. La model card indica que los experimentos, el entrenamiento y la propia tarjeta fueron realizados por un agente de IA (Claude, de Anthropic) bajo la dirección del autor.

## Capacidades

- Puntuación de relevancia de hechos: el `block-rater` responde sí/no a la pregunta de si una respuesta típica podría ser incorrecta para ese usuario debido a un hecho concreto.
- Lectura condicionada por memoria: el `reader` genera la respuesta a la petición a partir de los bloques de memoria seleccionados.
- Integración con el pipeline de Memorilla: requiere el núcleo pv4 y los tokens de memoria de 16 posiciones por hecho.
- No soporta tool calling ni function calling de forma específica.
- No soporta agentes ni razonamiento multi-paso más allá de lo que herede de Qwen3-8B.
- Capacidades multilingües: no documentadas; dependen del modelo base.
- No incluye visión, audio ni modo de pensamiento propio.
- Sin los tokens de memoria de Memorilla, los adaptadores no aportan funcionalidad.

## Casos de uso

- Investigación sobre rutas de información en atención: permite estudiar cómo fluye la información desde tokens de memoria comprimidos hasta las capas de atención, usando el block-rater y el reader como sondas.
- Reproducción de experimentos de memoria personalizada: el repositorio incluye el informe `experiments/REPORT_2026-11-24_token_path.md` y las tablas de resultados, lo que facilita replicar el pipeline completo con Qwen3-8B.
- Evaluación de selectores de memoria: el block-rater sirve para medir la calidad de selección de hechos frente a un picker perfecto (≈0,80 de aciertos) o un juez de texto de 27B (0,68 / 0,53).
- Estudio de destilación de raters: el block-rater es un ejemplo de destilación de un rater de 8B a un adaptador LoRA sobre base int8, útil para analizar la pérdida de rendimiento en ese proceso.
- Análisis de GRPO en adaptadores pequeños: la variante `reader-grpo-pilot-step10` permite examinar el efecto de pasos tempranos de GRPO sobre un reader, aunque el autor advierte que puede estar dañada.
- Docencia y divulgación: sirve como caso práctico de LoRA acoplados a un sistema de memoria externo, con código y resultados publicados.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre tipos de hechos no vistos (held-out). Las métricas se expresan como fracción de aciertos.

| Componente | Metrica | Resultado |
|---|---|---|
| block-rater | El clue queda primero de 48 | 0,09 de los perfiles |
| block-rater | Top 2 de 8 | 0,60 |
| block-rater | Respuestas que actúan sobre el clue (top 1 de 8) | 0,44 |
| block-rater | Respuestas que actúan sobre el clue (top 4 de 48) | 0,30 |
| reader | Actúa cuando el clue es el primer bloque | 0,76–0,79 |
| reader | Actúa cuando el clue está más abajo | 0,40–0,60 |
| reader-grpo-pilot-step10 | No evaluado | no disponible |
| Referencia: picker perfecto | Actúa | ≈0,80 |
| Referencia: juez de texto de 27B | Actúa | 0,68 / 0,53 |

## Requisitos de hardware

- VRAM estimada: no disponible de forma específica; los adaptadores suman un tamaño despreciable al modelo base Qwen3-8B (repositorio de 0,2 GB).
- GPU recomendadas: no especificadas por el autor; al ejecutarse sobre Qwen3-8B, requiere hardware capaz de servir un modelo de 8 000 millones de parámetros.
- GPU de consumo: no confirmado; un modelo de 8B en cuantización de 4 bits puede caber en GPUs de consumo con suficiente VRAM, pero el autor no documenta requisitos.
- Opciones de despliegue: la librería indicada es PEFT; el autor usa scripts propios con wrapper de LoRA y conversión a safetensors. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de adaptadores directamente comparables en la información proporcionada. Como referencias del propio autor se citan un picker perfecto (≈0,80 de aciertos) y un juez de texto de 27B (0,68 / 0,53), pero no son modelos equivalentes.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| memorilla-token-path-loras (block-rater + reader) | LoRA sobre 8B | no disponible | 0,44 / 0,30 (block-rater); 0,76–0,79 (reader) | Apache 2.0 | Hugging Face, 0 descargas |
| Juez de texto de 27B (referencia del autor) | 27B | no disponible | 0,68 / 0,53 | no disponible | no disponible |
| Picker perfecto (referencia teórica) | no aplica | no aplica | ≈0,80 | no aplica | no aplica |

## Limitaciones y advertencias

- Dependencia total de Memorilla: sin el núcleo pv4 y los 16 tokens de memoria por hecho, los LoRA no hacen nada útil sobre Qwen3-8B.
- Resultados modestos: el block-rater solo coloca el clue primero de 48 en el 0,09 de los perfiles; el reader cae a 0,40–0,60 cuando el clue no es el primer bloque.
- La variante `reader-grpo-pilot-step10` no fue evaluada y el autor advierte que puede ser igual o peor, o estar dañada.
- Entrenamiento y tarjeta generados por un agente de IA (Claude), lo que exige revisión humana adicional antes de cualquier uso serio.
- Sin datos de sesgos, alucinación ni comportamiento multilingüe documentados.
- Sin descargas ni likes: no hay evidencia de uso comunitario ni validación externa.
- Licencia Apache 2.0 permite uso comercial, pero el acoplamiento a Memorilla y la falta de evaluación hacen desaconsejable su uso en producción.
- Idiomas soportados no disponibles; dependen del modelo base y no están verificados.

## Enlaces

- Hugging Face: https://huggingface.co/nenkoru/memorilla-token-path-loras
- Write-up del autor: https://blog.nenkoru.com/posts/memorilla-token-path/
- Código: https://github.com/nenkoru/memorilla-token-path
- Informe de experimentos: `experiments/REPORT_2026-11-24_token_path.md` (dentro del repositorio de código)
- Dataset de benchmarks: https://huggingface.co/datasets/nenkoru/memorilla-buried-clue
- Memorilla (snap-stanford): https://github.com/snap-stanford/memorilla
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B

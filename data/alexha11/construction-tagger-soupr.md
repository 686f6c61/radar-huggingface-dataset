# alexha11/construction-tagger-soupR

## Resumen

El modelo `alexha11/construction-tagger-soupR` es un adaptador LoRA sobre el modelo vision-language `Qwen/Qwen2.5-VL-3B-Instruct`, desarrollado por alexha11 (Duong Ha) para etiquetar fotografías de obras de construcción de fibra y servicios públicos según una taxonomía interna de 29 términos. No es un fine-tuning único, sino una media exacta en el espacio de pesos de tres ejecuciones del mismo entrenamiento con semillas 42, 1337 y 7, combinadas mediante concatenación a lo largo del eje de rango para evitar términos cruzados. El adaptador tiene rango 96 y se fusiona con los pesos base mediante `merge_and_unload()`, por lo que el coste de inferencia es idéntico al de un adaptador individual.

El modelo resuelve un problema concreto de clasificación multi-etiqueta en imágenes de construcción, con un micro-F1 de 0.9018 sobre 283 fotografías de validación, superando al modelo de producción anterior (0.8673). Su relevancia radica en que demuestra una técnica de ensamblaje de adaptadores LoRA (weight-space soup) que mejora la robustez sin aumentar el coste de inferencia, y en que está disponible públicamente con un demo interactivo. La licencia no está especificada, lo que limita su uso comercial sin verificación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen2.5-VL-3B-Instruct (transformer vision-language) |
| Parametros totales | no disponible (el adaptador tiene rango 96; el modelo base tiene 3B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base soporta 32k, pero no se confirma para este adaptador) |
| Tipos de cuantizacion | no disponible (el ejemplo de uso emplea bfloat16) |
| Idiomas soportados | no disponible (el modelo base es multilingue, pero no se especifica para este adaptador) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre el modelo base `Qwen2.5-VL-3B-Instruct`, un transformer multimodal que procesa imágenes y texto. La técnica de ensamblaje consiste en promediar exactamente los pesos de tres ejecuciones del mismo entrenamiento (semillas 42, 1337 y 7) concatenando las matrices A y B de LoRA a lo largo del eje de rango, de modo que la pila resultante calcula la media verdadera de las tres actualizaciones. Esto evita los términos cruzados que aparecerían si se promediaran los factores de bajo rango por separado. El rango es 96, superior al típico de 32, lo que permite mayor capacidad de adaptación.

Los datos de entrenamiento no se detallan en la model card, pero se menciona que las etiquetas fueron revisadas por humanos imagen a imagen, con 445 correcciones entre entrenamiento y prueba. El entrenamiento se realizó con imágenes de 560 píxeles, un formato de prompt específico llamado `definitions`, decodificación greedy (`do_sample=False`) y umbrales de zanja corregidos (0.3/0.6 m en lugar de 0.5/1.0 m). Estas cuatro condiciones son críticas: si se alteran, el rendimiento cae, especialmente los umbrales, que cuestan aproximadamente 0.035 de micro-F1 si se usan los antiguos.

## Capacidades

- Etiquetado de imágenes de obras de construcción (fibra y servicios públicos) con una taxonomía fija de 29 términos.
- Clasificación multi-etiqueta: una imagen puede recibir varias etiquetas simultáneamente.
- Comprensión visual de escenas de construcción, incluyendo elementos como zanjas, tuberías, equipos y personal.
- Integración con el ecosistema PEFT de Hugging Face: se carga como adaptador y se fusiona con el modelo base.
- Inferencia eficiente: al fusionarse, el coste es el mismo que el del modelo base sin adaptador.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni soporte multilingüe específico.

## Casos de uso

- Inspección automatizada de obras: el modelo puede etiquetar automáticamente fotografías tomadas en campo, permitiendo a los supervisores identificar rápidamente elementos como zanjas, conductos o señalización sin revisión manual.
- Documentación de progreso de obra: al clasificar imágenes por categorías, se puede generar un registro estructurado del avance de cada fase de construcción, útil para informes de cliente o auditorías.
- Control de calidad de instalaciones: las etiquetas permiten verificar que se cumplen los umbrales de profundidad de zanja (0.3/0.6 m) y detectar desviaciones en tiempo real.
- Archivado y búsqueda de imágenes: al etiquetar miles de fotos, se facilita la recuperación por categoría en bases de datos internas, reduciendo el tiempo de búsqueda manual.
- Entrenamiento de modelos auxiliares: las etiquetas generadas pueden servir como pseudo-etiquetas para entrenar otros modelos de visión o para enriquecer datasets de construcción.
- Demostración de técnicas de ensamblaje LoRA: el modelo sirve como ejemplo práctico de weight-space soup aplicado a adaptadores, útil para investigadores que quieran reproducir la metodología.

## Benchmarks y rendimiento

El autor reporta micro-F1 sobre 283 fotografías de validación, con etiquetas revisadas por humanos (445 correcciones en total entre train y test). Los resultados son:

| Modelo | Micro-F1 |
|---|---|
| soupR (este modelo) | 0.9018 |
| Semilla 7 | 0.8833 |
| Semilla 1337 | 0.8819 |
| Semilla 42 | 0.8738 |
| Modelo de producción anterior | 0.8673 |

No se proporcionan otros benchmarks (MMLU, HumanEval, etc.) porque el modelo es específico para etiquetado de imágenes de construcción y no se ha evaluado en tareas generales.

## Requisitos de hardware

- El modelo base es de 3B parámetros, por lo que en bfloat16 ocupa aproximadamente 6 GB de VRAM. El adaptador se fusiona, así que no añade memoria adicional.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM (RTX 3060, RTX 4060, RTX 4070, etc.) puede ejecutar la inferencia. Para mayor velocidad, una RTX 4090 o A100 es adecuada.
- Cabe en GPUs de consumo: sí, con 8 GB de VRAM es suficiente.
- Opciones de despliegue: se puede usar con `transformers` y `peft` directamente, o servir con vLLM, TGI o Ollama si se exporta el modelo fusionado a formato GGUF o similar.
- Latencia y throughput: no disponibles. Dado el tamaño del modelo, se espera una latencia de decenas de milisegundos por imagen en una GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (etiquetado de imágenes de construcción). El único punto de referencia es el modelo de producción anterior, que obtiene un micro-F1 de 0.8673, inferior al soupR. No se pueden comparar parámetros, contexto o licencia con alternativas porque no se han identificado modelos similares en la información disponible.

## Limitaciones y advertencias

- Dependencia crítica de las condiciones de entrenamiento: si se usan imágenes de resolución distinta a 560px, un prompt diferente al formato `definitions`, decodificación no greedy o umbrales de zanja antiguos (0.5/1.0 m), el rendimiento cae significativamente (hasta 0.035 de micro-F1 solo por los umbrales).
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar etiquetas incorrectas o inventar categorías si la imagen es ambigua o está fuera de distribución.
- Sesgos no documentados: no se ha evaluado el comportamiento con imágenes de otros tipos de construcción (edificación, carreteras) o de regiones geográficas distintas.
- Licencia no especificada: no se puede determinar si el uso comercial está permitido. Se recomienda contactar al autor antes de utilizarlo en producción.
- Alcance limitado: solo etiqueta según una taxonomía fija de 29 términos; no es un modelo general de visión por computador.
- El adaptador está pensado para ser fusionado; si se usa sin `merge_and_unload()`, el comportamiento puede diferir.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alexha11/construction-tagger-soupR
- Demo en vivo: https://alexha11-construction-tagger.static.hf.space
- Perfil de GitHub del autor: https://github.com/alexha11

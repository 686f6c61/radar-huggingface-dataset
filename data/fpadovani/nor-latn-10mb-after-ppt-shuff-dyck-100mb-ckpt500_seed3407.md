# fpadovani/nor-latn-10mb-after-ppt-shuff-dyck-100mb-ckpt500_seed3407

## Resumen

El modelo `fpadovani/nor-latn-10mb-after-ppt-shuff-dyck-100mb-ckpt500_seed3407` es un modelo de lenguaje de tipo GPT-2, desarrollado por fpadovani como parte de un experimento de investigación. Se trata de un fine-tuning con entrenamiento supervisado (SFT) realizado con la librería TRL de Hugging Face, partiendo del modelo base `fpadovani/nor-latn-10mb-ppt-shuff-dyck-100mb_seed3407`. El nombre del modelo sugiere que forma parte de una línea de trabajo sobre tokenizers, lenguajes de paréntesis (Dyck) y barajado de tokens, aunque no se proporciona documentación detallada al respecto.

El modelo tiene aproximadamente 39 millones de parámetros en formato safetensors, lo que lo convierte en un modelo muy pequeño, orientado a experimentación académica más que a uso en producción. La ficha de Hugging Face incluye un ejemplo de uso con el pipeline `text-generation` de Transformers, pero no se especifican la longitud de contexto, los idiomas soportados ni la licencia. El repositorio ocupa 2,9 GB, lo que sugiere que contiene artefactos de entrenamiento además de los pesos. Dado que no se han publicado benchmarks ni documentación técnica completa, el modelo debe considerarse como un recurso de investigación con capacidades no verificadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformers, decoder-only) |
| Parametros totales | 39.087.104 |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura GPT-2, un transformer decoder-only estándar. Según la ficha, ha sido entrenado mediante SFT (supervised fine-tuning) usando la librería TRL de Hugging Face. El entrenamiento parte del modelo base `fpadovani/nor-latn-10mb-ppt-shuff-dyck-100mb_seed3407`, que a su vez parece haber sido preentrenado en un corpus pequeño (10 MB) de texto en latín con alguna transformación relacionada con paréntesis de Dyck y barajado de tokens. No se especifica el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO. Tampoco se detallan innovaciones técnicas destacables más allá del uso de TRL.

El nombre del modelo y del repositorio sugieren que la investigación se centra en el efecto del tokenizador y de estructuras sintácticas artificiales (Dyck) sobre el aprendizaje de representaciones, pero no hay documentación que lo confirme. El enlace a Weights & Biases en la ficha apunta a un registro de entrenamiento, aunque no se ha podido acceder a los detalles.

## Capacidades

- Generación de texto: el modelo es capaz de generar texto autocompletado a partir de un prompt, como se muestra en el ejemplo de la ficha.
- No se documentan capacidades de razonamiento, matemáticas, código, visión ni audio.
- No se especifica soporte para tool calling, function calling ni agentes.
- No se documentan capacidades multilingües; el nombre sugiere que podría estar orientado a latín o lenguas romances, pero no hay confirmación.
- No se indica soporte para modo de pensamiento (thinking mode) ni otras capacidades especiales.

En resumen, las capacidades reales del modelo no están documentadas más allá de la generación básica de texto. Es un modelo experimental de tamaño muy reducido, sin características adicionales verificadas.

## Casos de uso

- Investigación en tokenización y lenguajes formales: el modelo podría utilizarse para estudiar cómo un tokenizador afecta al aprendizaje de estructuras sintácticas como los paréntesis de Dyck, dado el nombre del repositorio. Sin embargo, no hay documentación que respalde este uso.
- Pruebas de pipelines de fine-tuning con TRL: dado que el modelo se entrenó con TRL, puede servir como ejemplo minimalista para validar configuraciones de SFT en entornos académicos.
- Experimentos de interpretabilidad: al ser un modelo pequeño, podría usarse para analizar mecanismos internos de atención en transformers, aunque no se han publicado resultados.
- Demostraciones educativas: por su tamaño, podría emplearse en cursos o talleres para ilustrar el funcionamiento de un modelo de lenguaje y el proceso de fine-tuning, sin necesidad de hardware avanzado.
- Comparativas de eficiencia de entrenamiento: el modelo podría servir como referencia para medir el coste de entrenar modelos muy pequeños en diferentes configuraciones de hardware.
- Pruebas de inferencia en entornos con recursos limitados: al tener solo 39 millones de parámetros, es apto para probar despliegues en dispositivos de baja capacidad, aunque no se han publicado datos de latencia.

Dado que no se han documentado casos de uso reales, los puntos anteriores son hipótesis razonables basadas en el tamaño y el contexto del modelo, no afirmaciones verificadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación estándar. Tampoco se aportan comparativas con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: con 39.087.104 parámetros en FP32, el modelo ocupa aproximadamente 156 MB. En FP16 serían unos 78 MB, y con cuantización a 4 bits, unos 20 MB. Por tanto, cabría en cualquier GPU con al menos 1 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna, incluidas tarjetas de consumo como RTX 3060 o inferiores. No se requieren GPUs de centro de datos.
- Compatibilidad con GPU de consumo: sí, el modelo es extremadamente ligero y puede ejecutarse en hardware muy modesto, incluso en CPU.
- Opciones de despliegue: al estar basado en Transformers, es compatible con frameworks como vLLM, llama.cpp (si se convierte a GGUF), Ollama y TGI, aunque no se ha verificado su funcionamiento en ninguno de ellos.
- Latencia y throughput: no disponibles. Al ser un modelo tan pequeño, la latencia será muy baja en la mayoría de GPUs, pero no se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría. El único modelo relacionado conocido es el modelo base `fpadovani/nor-latn-10mb-ppt-shuff-dyck-100mb_seed3407`, del cual este es un fine-tuning. No se han publicado datos de rendimiento que permitan una comparación técnica.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos específicos, pero al ser un modelo entrenado en un corpus muy pequeño y sin filtrado conocido, es probable que herede sesgos del dataset.
- Riesgo de alucinación: no se ha evaluado. Los modelos pequeños suelen tener mayor tendencia a generar texto incoherente o repetitivo.
- Limitaciones de contexto o idioma: la longitud de contexto y los idiomas soportados no están especificados, lo que impide conocer sus límites reales.
- Restricciones de licencia: la licencia aparece como "no disponible", lo que genera incertidumbre sobre el uso comercial. Se recomienda contactar con el autor antes de cualquier uso productivo.
- Caveat importante para producción: este modelo es un artefacto de investigación sin documentación ni evaluación. No es adecuado para aplicaciones en producción ni para tareas críticas.

## Enlaces

- Página del modelo en Hugging Face: https://huggingface.co/fpadovani/nor-latn-10mb-after-ppt-shuff-dyck-100mb-ckpt500_seed3407
- Modelo base: https://huggingface.co/fpadovani/nor-latn-10mb-ppt-shuff-dyck-100mb_seed3407
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new_tokenizers/runs/let6etxf

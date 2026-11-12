# khimaros/unsloth-Qwen3.8-Flash-Next-hierophant-LoRA-GGUF

## Resumen

El repositorio `khimaros/unsloth-Qwen3.8-Flash-Next-hierophant-LoRA-GGUF` no contiene un modelo completo, sino un conjunto de adaptadores LoRA en formato GGUF diseñados para eliminar el comportamiento de rechazo (abliteration) del modelo base `unsloth/Qwen3.8-Flash-Next-GGUF`. Los adaptadores se generan con la herramienta `hierophant`, desarrollada por el propio autor (`khimaros`), y se publican uno por cada cuantización del modelo base, de modo que la edición sea exacta para el archivo concreto sobre el que se aplica. Cada adaptador es un archivo pequeño que se carga junto al modelo base en `llama.cpp`, no una segunda copia de los pesos.

El modelo base pertenece a la familia Qwen 3.8 Flash Next (licencia `qwen-community-1.0`) y este repositorio actúa como adaptador sobre él. El interés técnico reside en el método: en lugar de un abliteration genérico, `hierophant` calcula la dirección de rechazo a partir de las activaciones del propio modelo cuantizado, ejecutando prompts dañinos e inofensivos y tomando la diferencia de sus flujos residuales medios en el primer token generado. Esa dirección se resta de todas las matrices que escriben en el flujo residual.

La relevancia es doble: por un lado, demuestra un flujo de trabajo reproducible para modificar el comportamiento de rechazo de un modelo GGUF sin reentrenar; por otro, publica métricas de evaluación (tasa de rechazos, divergencia KL frente al base, bucles de repetición) que permiten valorar el coste de la intervención. El repositorio tiene 0 descargas y 1 like en el momento de la consulta, y un tamaño de 0,2 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo base transformer; el base es `unsloth/Qwen3.8-Flash-Next-GGUF` |
| Parametros totales | 79.470.592 (dato reportado en safetensors del repositorio) |
| Parametros activos | no disponible (no se indica que el base sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF; adaptador publicado para `UD-IQ4_XS` (tabla de adaptadores) |
| Idiomas soportados | no disponible |
| Licencia | `qwen-community-1.0` (etiquetada como `other` en los tags) |
| Formato de pesos | GGUF (adaptadores LoRA en GGUF para `llama.cpp`) |

## Arquitectura y entrenamiento

El repositorio contiene adaptadores LoRA, no un modelo completo. El método `hierophant` ejecuta prompts dañinos e inofensivos a través del modelo cuantizado y calcula la diferencia de sus flujos residuales medios en el primer token generado; esa diferencia se toma como dirección de rechazo. El adaptador elimina esa dirección de todas las matrices que escriben en el flujo residual, calculadas a partir de los pesos desquantizados de esa cuantización concreta, de modo que a escala 1 la edición es exacta para ese archivo.

La selección de la capa, la intensidad y si mantener la dirección alejada de los componentes principales de los prompts inofensivos (o añadir una segunda dirección residual) se realiza mediante búsqueda automática, clasificando por tasa de rechazos en prompts no usados para el ajuste, con un presupuesto fijo de divergencia KL. Para `UD-IQ4_XS` se probaron 73 recetas; la publicada es `L33, 8 harmless PCs`, con escala 0,94 y SHA-256 del archivo base `93ff23a08e5c` (prefijo).

## Capacidades

- Eliminación del comportamiento de rechazo (abliteration) sobre el modelo base Qwen3.8-Flash-Next en su cuantización `UD-IQ4_XS`.
- Carga como adaptador LoRA junto al modelo base en `llama.cpp` (`llama-server --lora-scaled`).
- Escala ajustable en tiempo de carga: `:0.94` (valor recomendado), `:0.8` (más cercano al base), `:0` (desactivado).
- Carga sin aplicación (`--lora-init-without-apply`) y aplicación por petición, permitiendo que un mismo servidor responda con y sin adaptador.
- Compatibilidad con el modo "thinking" del modelo base (se advierte que puede razonar extensamente antes de responder).
- Capacidades heredadas del base (generación de texto, razonamiento, etc.): no detalladas en la información disponible.

## Casos de uso

- Investigación sobre abliteration: servir el adaptador junto al base para comparar respuestas con y sin la dirección de rechazo eliminada, usando `--lora-init-without-apply` y aplicándolo por petición.
- Evaluación de robustez y seguridad: medir la tasa de rechazos (0,99 en base frente a 0,08 en adaptado, n=300) sobre prompts retenidos para estudiar la eficacia del método.
- Estudio de degradación por intervención: usar las métricas de KL (0,090 en primer token, 0,095 en WikiText) para analizar el coste de la edición sobre la distribución del modelo.
- Análisis de bucles de repetición: emplear la métrica de "loops" (0,14 sobre n=50) para detectar respuestas degeneradas en prompts dañinos.
- Despliegue controlado en `llama.cpp`: integrar el adaptador en un servidor local que alterne el comportamiento según la petición, sin duplicar pesos.
- Reproducibilidad de recetas: replicar la búsqueda de `hierophant` y comparar las 73 recetas probadas para `UD-IQ4_XS` con los resultados publicados.

## Benchmarks y rendimiento

Los datos disponibles son métricas internas del adaptador, no benchmarks estándar (MMLU, HumanEval, GSM8K, etc.).

| Metrica | Base | Adaptado | Notas |
|---|---|---|---|
| Tasa de rechazos | 0,99 | 0,08 | n=300, thinking off, prompts retenidos |
| KL en primer token | — | 0,090 | frente al base, a la escala indicada |
| KL en WikiText | — | 0,095 | frente al base |
| Bucles (loops) | — | 0,14 | n=50, proporción de respuestas completas que repiten un pasaje |

No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible para el adaptador de forma aislada; depende del modelo base cuantizado `UD-IQ4_XS` que se sirva junto a él.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible; el adaptador se carga en `llama.cpp`, que soporta ejecución en CPU y GPU, pero no se detallan requisitos.
- Despliegue: `llama.cpp` (`llama-server`) con `--lora-scaled` y, opcionalmente, `--lora-init-without-apply`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| khimaros/unsloth-Qwen3.8-Flash-Next-hierophant-LoRA-GGUF | Adaptador LoRA GGUF (abliteration) | 79.470.592 | no disponible | qwen-community-1.0 | Hugging Face, 0 descargas |
| unsloth/Qwen3.8-Flash-Next-GGUF | Modelo base GGUF | no disponible | no disponible | qwen-community-1.0 | Hugging Face |
| Otros adaptadores de abliteration | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre alternativas comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Solo válido para los archivos base listados: sobre otra cuantización la edición es aproximada y no medida.
- Con el modo "thinking" activado, las respuestas pueden razonar extensamente antes de contestar; conviene servir con un presupuesto de tokens generoso.
- El adaptador elimina el comportamiento de rechazo, lo que puede facilitar la generación de contenido dañino; su uso debe enmarcarse en investigación y con salvaguardas externas.
- La métrica de bucles (0,14) indica que una fracción de respuestas completas a prompts dañinos repite pasajes, algo que las respuestas cortas y la KL no reflejan.
- La licencia `qwen-community-1.0` impone condiciones de uso que deben revisarse antes de un despliegue comercial; el repositorio la etiqueta como `other`.
- No se detallan idiomas soportados, sesgos conocidos ni riesgos de alucinación específicos más allá de los heredados del modelo base.
- El repositorio tiene 0 descargas y 1 like, y fue creado y actualizado en la misma fecha (2026-11-12), lo que sugiere escasa validación externa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/khimaros/unsloth-Qwen3.8-Flash-Next-hierophant-LoRA-GGUF
- Modelo base: https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- Herramienta hierophant: https://github.com/khimaros/hierophant
- Licencia qwen-community-1.0: https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF

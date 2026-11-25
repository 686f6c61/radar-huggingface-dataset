# MergekitCloud/mergekit-182

## Resumen

MergekitCloud/mergekit-182 es un modelo de lenguaje de la familia Mistral obtenido mediante una fusión por *passthrough* con la herramienta mergekit. No se trata de un modelo entrenado desde cero, sino de una recombinación de capas del modelo base senseable/WestLake-7B-v2, un fine-tune de Mistral-7B orientado a generación de texto. El resultado es un checkpoint con 10.731.524.096 parámetros reales en safetensors, derivados de la concatenación por tramos de capas del modelo original.

El modelo se publica en el espacio MergekitCloud, un repositorio aparentemente automatizado que aloja fusiones generadas con mergekit. La relevancia de este tipo de publicaciones es limitada: no hay model card descriptiva más allá de la configuración YAML de la fusión, no se declaran idiomas, licencia ni datos de entrenamiento adicionales, y el modelo no cuenta con descargas ni valoraciones. Su interés es principalmente experimental, como ejemplo de técnica de fusión por capas y para estudiar el efecto de duplicar tramos del transformer sobre el comportamiento final.

La arquitectura subyacente es un transformer decoder-only tipo Mistral, con atención de ventana deslizante y RoPE, heredada íntegramente del modelo base. La fusión por passthrough duplica determinados rangos de capas (por ejemplo, las capas 5-9 aparecen tanto en el primer como en el segundo slice), lo que altera la profundidad efectiva y el flujo de información respecto al original, sin que se haya documentado una evaluación sistemática del resultado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Mistral), fusión passthrough de capas |
| Parametros totales | 10.731.524.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del base Mistral, sin confirmar) |
| Tipos de cuantizacion | no disponible (pesos publicados en float16/safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se genera con mergekit en modo `passthrough`, un método que no promedia pesos sino que concatena rangos de capas de los modelos fuente para construir una nueva pila de capas. La configuración YAML define cinco slices: `[0,9]`, `[5,14]`, `[10,19]`, `[15,24]` y `[20,32]`, todos extraídos del mismo modelo (senseable/WestLake-7B-v2). Esto implica solapamientos de cinco capas entre slices consecutivos, de modo que varias capas del transformer original aparecen duplicadas en el modelo fusionado. El resultado tiene más parámetros que el base (10.731 millones frente a los aproximadamente 7.242 millones de Mistral-7B), coherente con la duplicación de bloques.

No hay información sobre datos de entrenamiento adicionales, fine-tuning posterior, RLHF, DPO ni procesos de alineación específicos para esta fusión. Tampoco se documentan innovaciones técnicas propias más allá del procedimiento de fusión. Cualquier capacidad del modelo deriva del base WestLake-7B-v2, un fine-tune de Mistral-7B del que no se aportan detalles en la información disponible.

## Capacidades

- Generación de texto autoregresiva, heredada de la arquitectura Mistral del modelo base.
- Razonamiento y respuesta conversacional multi-turno, sujeto a la ventana de contexto del base (no confirmada en esta ficha).
- Generación de código y matemáticas a nivel del modelo base, sin evaluación específica publicada para esta fusión.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: no disponible (idiomas no declarados).
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Investigación sobre técnicas de fusión de modelos: el checkpoint sirve para estudiar cómo la duplicación de tramos de capas en un transformer afecta a la perplejidad y a la calidad de generación frente al modelo base. Es adecuado porque la configuración YAML es explícita y reproducible con mergekit.
- Experimentos de ablación en profundidad efectiva: al comparar este modelo con WestLake-7B-v2 se puede analizar el impacto de capas duplicadas en el flujo de activaciones y en la estabilidad del entrenamiento.
- Generación de texto creativo en entornos de prueba: puede emplearse como generador de borradores o textos exploratorios, siempre que se valide la calidad empíricamente antes de usarlo, dado que no hay benchmarks publicados.
- Prototipado de pipelines de inferencia con transformers y TGI: al estar etiquetado como `text-generation-inference` y `endpoints_compatible`, permite probar despliegues estándar con la librería transformers.
- Docencia y demostraciones de mergekit: útil como ejemplo práctico de fusión passthrough en talleres sobre modelos open source.
- Base para fusiones posteriores: puede servir como punto de partida en nuevas recetas de mergekit, aunque su licencia no declarada obliga a verificar los términos del modelo base antes de cualquier uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en float16: aproximadamente 21,5 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica se recomienda al menos 24 GB.
- En cuantización de 8 bits: en torno a 11-12 GB de VRAM.
- En cuantización de 4 bits: en torno a 6-7 GB de VRAM.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para float16 sin cuantizar; RTX 4090 (24 GB) para float16 justo al límite.
- GPU de consumo: cabe en RTX 3090/4090 con cuantización 8 o 4 bits; en float16 requiere 24 GB y deja poco margen para contexto largo.
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM; llama.cpp/Ollama requerirían conversión a GGUF, no incluida en el repo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MergekitCloud/mergekit-182 | 10.731 M | no disponible | no disponible | Hugging Face |
| senseable/WestLake-7B-v2 (base) | ~7.242 M | no disponible | no disponible | Hugging Face |
| Mistral-7B-v0.1 (arquitectura origen) | ~7.242 M | 8.192 tokens (según model card original) | Apache 2.0 | Hugging Face |

La comparativa con Mistral-7B-v0.1 se incluye por ser la arquitectura de origen; el dato de contexto corresponde a la model card pública original de Mistral y no a esta fusión, que no lo declara. No se dispone de benchmarks comparativos para mergekit-182.

## Limitaciones y advertencias

- No hay model card descriptiva: se desconoce el comportamiento real del modelo más allá de la configuración de fusión.
- La duplicación de capas puede degradar la coherencia y la calidad de generación respecto al base; no hay evaluación que lo descarte.
- Riesgo elevado de alucinación y de respuestas incoherentes, al no haberse documentado alineación ni evaluación.
- Idiomas soportados no declarados; no se puede garantizar un rendimiento correcto en castellano.
- Licencia no disponible: no se puede confirmar el uso comercial ni las obligaciones de atribución. Es imprescindible verificar la licencia de senseable/WestLake-7B-v2 y de Mistral-7B antes de cualquier despliegue en producción.
- Sin descargas ni validación comunitaria: no hay evidencia de uso real ni informes de calidad.
- Contexto máximo no confirmado: no asumir la ventana de Mistral sin verificar en el tokenizer y la configuración del repositorio.
- No recomendado para producción sin una evaluación propia exhaustiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MergekitCloud/mergekit-182
- Modelo base: https://huggingface.co/senseable/WestLake-7B-v2
- Repositorio de mergekit: https://github.com/cg123/mergekit

# praneet3/low-resource-mt-madlad

## Resumen

El modelo `praneet3/low-resource-mt-madlad` es un adaptador PEFT (QLoRA) sobre el modelo base `google/madlad400-3b-mt`, desarrollado por el usuario praneet3. Su propósito es la traducción automática entre inglés y dos idiomas de bajos recursos: khasi (`kha`) y bodo (`brx`). El repositorio contiene los artefactos de un estudio de ajuste fino de una única época con rango 16 sobre el modelo MADLAD-400 de 3.000 millones de parámetros.

El modelo base MADLAD-400 es un transformer encoder-decoder multilingüe entrenado por Google sobre datos web masivos en más de 400 idiomas, lo que lo convierte en una base razonable para transferencia a lenguas con poca presencia digital. Este adaptador no modifica los pesos originales: se aplica como un delta de bajo rango sobre las capas del modelo base, lo que reduce drásticamente el coste de entrenamiento y almacenamiento (el repositorio ocupa solo 0,2 GB).

La relevancia de esta ficha es limitada pero concreta: se trata de un artefacto de investigación, sin descargas ni validación externa, orientado a quien necesite un punto de partida para traducción inglés-khasi o inglés-bodo. No hay benchmarks públicos ni documentación de calidad más allá de la model card mínima del autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (modelo base MADLAD-400); adaptador QLoRA de rango 16 |
| Parámetros totales | 3B en el modelo base; el adaptador PEFT añade un número no especificado de parámetros (rango 16) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el adaptador se entrenó con QLoRA, lo que implica cuantización del base durante el ajuste, pero no se detalla el esquema) |
| Idiomas soportados | inglés (`en`), khasi (`kha`), bodo (`brx`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT; el repositorio incluye checkpoints con estado del optimizador) |

## Arquitectura y entrenamiento

El adaptador se construye sobre `google/madlad400-3b-mt`, un transformer encoder-decoder de 3.000 millones de parámetros diseñado para traducción multilingüe a gran escala. El ajuste fino se realizó mediante QLoRA con rango 16 y una sola época, según indica la model card. No se especifica el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de alineación adicionales como RLHF o DPO.

La evaluación, según el autor, se realizó sobre particiones de validación internas etiquetadas procedentes de los datos de entrenamiento de WMT26 Indic MT. Esto implica que las métricas no son comparables con resultados públicos de WMT y que no hay validación independiente. El repositorio contiene checkpoints con estado del adaptador y del optimizador, lo que sugiere que está pensado como artefacto reproducible de un experimento más que como modelo listo para producción.

## Capacidades

- Traducción automática entre inglés y khasi, y entre inglés y bodo, en ambas direcciones.
- Traducción bidireccional gracias a la arquitectura encoder-decoder del modelo base.
- Herencia de las capacidades multilingües del modelo base MADLAD-400, aunque el ajuste se limita a los tres idiomas declarados.
- No se documenta soporte de tool calling, function calling ni comportamiento agéntico.
- No se documenta modo de razonamiento explícito (thinking mode), visión ni audio.
- No se documenta capacidad de contexto largo más allá de la del modelo base, que no se especifica en la información disponible.

## Casos de uso

- Traducción de documentación técnica al khasi: el adaptador puede traducir manuales o guías del inglés al khasi, un idioma con escasa cobertura en modelos comerciales, usando el modelo base como respaldo para terminología no vista.
- Localización de interfaces para bodo: integración en pipelines de localización que necesiten traducir cadenas cortas del inglés al bodo, con revisión humana posterior dada la falta de benchmarks públicos.
- Investigación en traducción de bajos recursos: el repositorio sirve como punto de partida reproducible (checkpoints con estado del optimizador) para experimentos académicos sobre QLoRA en lenguas minoritarias.
- Preservación lingüística: traducción de materiales educativos o culturales al khasi y al bodo para iniciativas de digitalización de lenguas del noreste de la India.
- Generación de datos sintéticos paralelos: uso del adaptador para producir corpus inglés-khasi o inglés-bodo que alimenten otros modelos o sistemas de evaluación.
- Prototipado rápido de sistemas de traducción: al ser un adaptador PEFT de 0,2 GB, puede cargarse junto al base en entornos con recursos moderados para pruebas de concepto sin entrenar desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona evaluación sobre particiones internas de WMT26 Indic MT, pero no se proporcionan cifras (BLEU, chrF u otras).

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 3B en fp16 requiere aproximadamente 6-7 GB; en cuantización de 8 bits, unos 3-4 GB; en 4 bits, unos 2-3 GB. El adaptador añade una sobrecarga mínima. Estas cifras son estimaciones según el tamaño del base, no datos publicados por el autor.
- GPU recomendadas: A100 o H100 para despliegue en producción con el base en fp16; RTX 4090, RTX 3090 o A10G para inferencia cómoda en fp16 o 8 bits.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más de VRAM si se cuantiza el base a 8 o 4 bits (por ejemplo, RTX 3060 Ti, RTX 4060 Ti, RTX 3070).
- Opciones de despliegue: el adaptador PEFT puede cargarse con la librería `peft` de Hugging Face sobre el base; para servir, es compatible con TGI y vLLM si se fusiona el adaptador con el base o se usa soporte de adaptadores. llama.cpp y Ollama requerirían convertir el modelo fusionado a GGUF, paso no documentado por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| praneet3/low-resource-mt-madlad | 3B (base) + adaptador | no disponible | en, kha, brx | Apache 2.0 | Hugging Face, 0 descargas |
| google/madlad400-3b-mt | 3B | no disponible | más de 400 | Apache 2.0 | Hugging Face, ampliamente usado |
| google/madlad400-7b-mt | 7B | no disponible | más de 400 | Apache 2.0 | Hugging Face |
| NLLB-200 (Meta) | 600M a 54B | no disponible | 200 | CC-BY-NC 4.0 (no comercial) | Hugging Face |

El adaptador se diferencia del base en que especializa la traducción hacia khasi y bodo, idiomas que el MADLAD-400 original cubre de forma genérica. Frente a NLLB-200, la licencia Apache 2.0 permite uso comercial, a diferencia de la licencia no comercial de NLLB. No hay datos de rendimiento comparativo disponibles.

## Limitaciones y advertencias

- Artefacto de investigación sin validación externa: cero descargas y cero likes en el momento de la ficha; no hay evidencia de calidad más allá de la afirmación del autor.
- Evaluación sobre particiones internas de WMT26 Indic MT, no sobre test sets públicos; los resultados no son reproducibles ni comparables con la literatura.
- Entrenamiento de una sola época con rango 16: la capacidad de adaptación es limitada y puede no capturar variaciones dialectales o terminología especializada.
- Riesgo de alucinación y de traducciones incorrectas en textos largos o dominios no vistos, especialmente en bodo y khasi, lenguas con pocos datos paralelos.
- El repositorio contiene checkpoints con estado del optimizador, lo que aumenta el tamaño y no está pensado para inferencia directa sin extraer el adaptador.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene auditar el modelo antes de desplegarlo en producción.
- No se documenta el esquema de cuantización usado en QLoRA ni los hiperparámetros completos, lo que dificulta la reproducibilidad.
- Idiomas soportados limitados a inglés, khasi y bodo; no se garantiza un comportamiento correcto fuera de ese par de pares.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/praneet3/low-resource-mt-madlad
- Modelo base: https://huggingface.co/google/madlad400-3b-mt
- Paper de MADLAD-400: https://arxiv.org/abs/2309.10979
- Repositorio de PEFT: https://github.com/huggingface/peft

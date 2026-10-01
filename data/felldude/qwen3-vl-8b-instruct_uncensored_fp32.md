# Felldude/Qwen3-VL-8B-Instruct_Uncensored_FP32

## Resumen

Qwen3-VL-8B-Instruct_Uncensored_FP32 es un repositorio de pesos completos en precisión simple (FP32) publicado por el usuario Felldude en Hugging Face. Por el nombre y la etiqueta `qwen3_vl` del repositorio, se trata de una variante del modelo multimodal Qwen3-VL-8B-Instruct de Alibaba, con 8.767.123.696 parámetros (~8,77 mil millones) almacenados en safetensors. El tamaño del repositorio, 35,1 GB, es coherente con un volcado íntegro en FP32 (4 bytes por parámetro), sin cuantización ni reducción de precisión.

El interés de esta publicación es doble. Por un lado, ofrece el modelo en precisión completa, lo que resulta útil para tareas de fusión de pesos, cuantización propia o investigación que requiera el rango dinámico original. Por otro, el sufijo "Uncensored" indica que se ha modificado el comportamiento de alineamiento del modelo base para reducir las negativas o rechazos ante determinadas peticiones, algo habitual en variantes derivadas orientadas a investigación sobre seguridad y comportamiento de modelos.

Ahora bien, la ficha del repositorio no aporta ninguna documentación técnica: no hay model card descriptiva, no se indica la longitud de contexto, los idiomas soportados, el proceso de entrenamiento ni resultados de evaluación. Con 0 descargas y 0 "likes" en el momento de la consulta, se trata de una publicación reciente y sin validación por parte de la comunidad, por lo que cualquier uso en producción debería ir precedido de una evaluación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; la etiqueta del repositorio indica `qwen3_vl` (modelo multimodal de lenguaje y visión) |
| Parametros totales | 8.767.123.696 (~8,77 mil millones) |
| Parametros activos | No aplica / no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No se distribuyen cuantizaciones; los pesos publicados están en FP32. Es posible cuantizar a 8 bits o 4 bits por cuenta propia |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP32) |
| Tamano del repositorio | 35,1 GB |
| Fecha de creacion | 2026-09-30 |
| Ultima actualizacion | 2026-09-30 |

## Arquitectura y entrenamiento

La única información estructural disponible es la etiqueta `qwen3_vl`, que sitúa al modelo dentro de la familia Qwen3-VL de Alibaba, formada por modelos multimodales que combinan un codificador visual con un decodificador de lenguaje de tipo transformer. El recuento real de parámetros (8.767.123.696) y el tamaño del repositorio confirman que se trata de un modelo denso de aproximadamente 8,8 mil millones de parámetros volcado sin cuantizar. No se dispone de información sobre el número de capas, dimensión oculta, número de cabezas de atención, resolución de entrada de imagen ni arquitectura concreta del codificador visual.

Tampoco hay datos sobre el entrenamiento. Se desconoce el número de tokens utilizados, la composición del dataset, si hubo etapas de ajuste supervisado, RLHF o DPO, y cuál fue exactamente el procedimiento aplicado para obtener la variante "Uncensored" (abliteración de direcciones de rechazo, ajuste fino con datos sin filtrar u otro método). Del mismo modo, no se documenta si los pesos derivan de un ajuste fino sobre el modelo base o de una mera conversión de precisión a FP32, aunque el nombre sugiere ambas cosas simultáneamente. El autor no publica script de conversión, configuración de entrenamiento ni notas de la versión.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo base de la familia Qwen3-VL.
- Procesamiento de imágenes: la etiqueta `qwen3_vl` indica capacidades de visión y lenguaje, si bien no se detalla el tipo de tareas soportadas (descripción de imagen, OCR, VQA, grounding) ni la resolución admitida.
- Procesamiento de contextos multimodales con texto e imagen intercalados, presumiblemente.
- Reducción de rechazos ante peticiones que el modelo base declinaría, según indica el sufijo "Uncensored" del nombre.
- Soporte de tool calling / function calling: no disponible (no se documenta).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se documenta).
- Capacidades multilingües: no disponible (no se declara ningún idioma en el repositorio).
- Modo "thinking" explícito, audio o vídeo: no disponible (no se documenta).

## Casos de uso

- Investigación sobre alineamiento y seguridad: la variante "Uncensored" permite estudiar cómo cambia la tasa de rechazo y el comportamiento del modelo al eliminar capas de alineamiento, comparándola con el modelo base en un mismo conjunto de prompts.
- Análisis de imágenes en pipelines internos: con un modelo multimodal de ~8,8B es viable extraer descripciones, etiquetas o texto de imágenes en lotes, siempre que se valide previamente la calidad real del ajuste.
- Generación de documentación de precisión completa: mantener los pesos en FP32 facilita tareas de fusión con otros checkpoints, cuantización controlada a 8 o 4 bits, o extracción de estadísticas de pesos sin los artefactos que introducen las conversiones a bf16.
- Prototipado de asistentes multimodales en local: al tratarse de un modelo de tamaño medio, puede desplegarse en una estación de trabajo con GPU de 48 GB o con dos GPU de 24 GB, lo que permite experimentar sin depender de APIs externas.
- Evaluación comparativa de derivados: sirve como punto de referencia para medir cuánto degrada (o no) una modificación de alineamiento las capacidades del modelo original en tareas estándar de visión y lenguaje.
- Base para ajuste fino propio: al estar en FP32 y con licencia Apache 2.0, es un punto de partida razonable para un ajuste fino posterior orientado a un dominio concreto, como inspección visual de documentos o clasificación de imágenes técnicas.
- Experimentación con contenido sensible en entornos controlados: en investigación sobre moderación, permite generar respuestas que el modelo base bloquearía y analizarlas con las salvaguardas adecuadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K, MMMU, DocVQA ni ninguna otra métrica, y tampoco se han encontrado evaluaciones externas de esta variante concreta.

## Requisitos de hardware

- VRAM para inferencia en FP32: aproximadamente 35,1 GB solo para los pesos, más el espacio de activaciones y la caché KV, que depende de la longitud de contexto y del tamaño del lote. En la práctica, se necesitan entre 40 y 48 GB como mínimo para uso ligero.
- GPU recomendadas para FP32: A100 80 GB, H100 80 GB, L40S 48 GB, RTX 6000 Ada 48 GB o A6000 48 GB. Una A100 40 GB queda muy justa y puede provocar OOM con contextos largos.
- Configuraciones multi-GPU: dos RTX 4090 de 24 GB con paralelismo tensorial (vLLM) permiten repartir los pesos, aunque la comunicación entre tarjetas añade latencia.
- GPU de consumo: en FP32 no cabe en ninguna tarjeta de consumo actual. Si se convierte a bf16, el peso baja a unos 17,5 GB y sí cabe en una RTX 4090 de 24 GB con contexto moderado; en cuantización de 8 bits ocuparía en torno a 9 GB y en 4 bits alrededor de 5 GB, lo que lo haría viable en tarjetas de 8-12 GB.
- Opciones de despliegue: transformers con carga en FP32 (requiere la VRAM indicada), vLLM o TGI (recomendable convertir antes a bf16 para aprovechar kernels optimizados), llama.cpp u Ollama (requiere convertir los pesos a GGUF; no hay GGUF publicado por el autor).
- Latencia y throughput estimados: no disponible, no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato de pesos | Disponibilidad |
|---|---|---|---|---|---|
| Felldude/Qwen3-VL-8B-Instruct_Uncensored_FP32 | 8,77 mil millones | No disponible | Apache 2.0 | safetensors FP32 | Publicado, 0 descargas |
| Qwen3-VL-8B-Instruct (modelo base referenciado en el nombre) | No disponible en esta informacion | No disponible | No disponible en esta informacion | No disponible | Repositorio oficial de Alibaba en Hugging Face |
| Otras alternativas multimodales de ~7-11B (Qwen2.5-VL, InternVL3, Llama 3.2 Vision) | No disponible en esta informacion | No disponible | No disponible | No disponible | Publicadas por sus respectivos autores |

No se dispone de datos de rendimiento comparativos entre estas opciones dentro de la información proporcionada, por lo que la comparación se limita a los aspectos de empaquetado y licencia.

## Limitaciones y advertencias

- Ausencia total de documentación: no hay model card, configuración de entrenamiento, ni especificación de contexto o idiomas. Cualquier uso en producción exige una evaluación previa por cuenta propia.
- Riesgo de alucinación: inherente a los modelos de lenguaje de esta escala, y presumiblemente no mitigado en una variante "Uncensored". No hay datos que permitan cuantificarlo.
- Efectos de la desalineación: eliminar los mecanismos de rechazo puede aumentar la generación de contenido dañino, inexacto o legalmente problemático, además de degradar potencialmente el rendimiento en tareas que dependían de ese alineamiento.
- Sesgos: no evaluados ni documentados. Los sesgos del modelo base se heredan y pueden verse alterados por el proceso de "uncensoring".
- Limitaciones de contexto e idioma: no disponibles, el autor no declara ninguna.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero la licencia del modelo base de Qwen debería verificarse antes de redistribuir, ya que el repositorio no aclara la procedencia exacta de los pesos ni si se han cumplido las condiciones de la licencia original.
- Riesgo de procedencia: no se documenta el método de conversión ni el dataset de ajuste, por lo que no es posible auditar qué contiene realmente el checkpoint.
- Madurez: 0 descargas y 0 "likes" implican ausencia de validación por parte de la comunidad; es un artefacto sin contrastar.

## Enlaces

- Hugging Face: https://huggingface.co/Felldude/Qwen3-VL-8B-Instruct_Uncensored_FP32
- Paper asociado: no disponible
- Blog o anuncio del autor: no disponible
- Repositorio de código: no disponible
- Demo: no disponible
- Enlace al modelo base: no proporcionado en la información disponible

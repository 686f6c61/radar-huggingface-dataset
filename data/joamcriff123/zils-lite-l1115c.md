# joamCriff123/zils-lite-l1115c

## Resumen

zils-lite-l1115c es un modelo de decisión ("decision body") desarrollado por el usuario joamCriff123 para el pool lite de la subred 127 de Zils. Se trata de un ajuste fino (finetune) del modelo base Qwen/Qwen3.5-0.8B, un transformer de la familia Qwen 3.5 con aproximadamente 853 millones de parámetros. El modelo se publica bajo licencia Apache-2.0 y se distribuye en formato safetensors con código personalizado (`custom_code`), lo que implica que su carga requiere confiar en implementaciones no estándar del repositorio.

La relevancia de este modelo es limitada y muy específica: está orientado a la extracción de características y a la toma de decisiones dentro de una infraestructura de subred concreta (Zils, subred 127), no a la generación de texto general. El pipeline declarado en Hugging Face es `feature-extraction`, y las etiquetas incluyen `decision-model`, `zils` y `d3-lite`. No hay información pública sobre el proceso de entrenamiento, los datos utilizados ni los resultados obtenidos.

El modelo se creó y actualizó el 15 de noviembre de 2026, cuenta con cero descargas y cero "likes" en el momento de redactar esta ficha, y no dispone de model card detallada más allá de una descripción de una línea. Todo ello indica que se trata de un artefacto de investigación o de un componente interno de un sistema mayor, sin validación externa conocida.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen 3.5, según el modelo base Qwen/Qwen3.5-0.8B); detalles internos no disponibles |
| Parámetros totales | 852.985.920 (≈0,85 mil millones) |
| Parámetros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos publicados en safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (con `custom_code` y compatibilidad con endpoints) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del transformer Qwen/Qwen3.5-0.8B, del que no se detallan en la información proporcionada ni la composición de capas, ni el mecanismo de atención, ni la ventana de contexto nativa. El ajuste fino se presenta como un "d3-lite decision body", un término propio del ecosistema Zils que sugiere una especialización para tareas de decisión dentro de un pipeline de subred, no para generación abierta de texto.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, el uso de RLHF, DPO u otras técnicas de alineamiento, ni sobre innovaciones técnicas como decodificación especulativa o atención lineal. La model card únicamente indica la licencia, el modelo base, la librería (`transformers`) y las etiquetas del proyecto. Cualquier afirmación adicional sobre el entrenamiento sería especulativa.

## Capacidades

- Extracción de características (`feature-extraction`): es el pipeline declarado oficialmente en Hugging Face.
- Toma de decisiones dentro del ecosistema Zils (etiqueta `decision-model`, subred 127, pool lite).
- Herencia potencial de las capacidades del modelo base Qwen 3.5 de 0,8B (generación de texto, razonamiento básico, código), aunque no se documenta ninguna y el ajuste fino podría haber alterado o degradado estas habilidades.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (el campo de idiomas está vacío en la ficha de Hugging Face).
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Componente de decisión en la subred 127 de Zils: el modelo se integraría como "decision body" del pool lite, recibiendo representaciones o características y emitiendo decisiones dentro del protocolo de la subred. Es su uso previsto explícito según la model card.
- Extracción de embeddings para clasificación downstream: al declarar el pipeline `feature-extraction`, puede emplearse para obtener representaciones vectoriales de texto que alimenten clasificadores o sistemas de ranking propios, siempre que se valide su calidad frente al modelo base.
- Filtrado o enrutamiento de peticiones: en una arquitectura de agentes o de subred, un modelo de 0,85B puede actuar como clasificador ligero que decide qué ruta o qué herramienta corresponde a cada entrada, con un coste de inferencia bajo.
- Prototipado de investigación sobre ajustes finos de Qwen 3.5: sirve como ejemplo de finetune de la familia Qwen 3.5-0.8B para estudiar cómo se comporta un modelo pequeño tras un ajuste especializado, comparándolo con el base.
- Despliegue en entornos con recursos limitados: con menos de mil millones de parámetros, es viable en GPU de consumo para experimentación, aunque la presencia de `custom_code` obliga a auditar el repositorio antes de usarlo en producción.
- Evaluación comparativa de modelos de decisión: puede utilizarse como línea base en estudios internos que comparen "decision bodies" de distintos tamaños o familias dentro de un mismo pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 1,7 GB solo para pesos (coherente con el tamaño del repo de 1,7 GB), más overhead de activaciones y del código personalizado; en la práctica, entre 2 y 4 GB según longitud de secuencia y batch.
- Cuantización a 8 bits: aproximadamente 0,9 GB de pesos; a 4 bits, en torno a 0,5 GB, aunque no se publican variantes cuantizadas oficiales.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM para fp16; una RTX 3060, RTX 4060 o superior es suficiente. Para lotes grandes o baja latencia, A100 o H100 no aportan ventaja significativa dado el tamaño del modelo.
- Cabe en GPU de consumo: sí, previsiblemente en la mayoría de tarjetas con 6 GB o más, siempre que el `custom_code` no introduzca requisitos adicionales.
- Opciones de despliegue: `transformers` es la vía declarada; vLLM, llama.cpp, Ollama o TGI no están confirmados y podrían no funcionar sin adaptar el código personalizado. La etiqueta `endpoints_compatible` sugiere compatibilidad con los endpoints de Hugging Face.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-lite-l1115c | ≈0,85B | No disponible | Apache-2.0 | Hugging Face, 0 descargas | Finetune especializado para Zils, con `custom_code` |
| Qwen/Qwen3.5-0.8B (base) | ≈0,8B | No disponible en la información | Según el modelo base (no confirmada aquí) | Hugging Face | Modelo generalista del que deriva; sin especialización en decisiones |
| Alternativas de ~1B para clasificación/embeddings | Variable | Variable | Variable | Variable | No se dispone de datos concretos en la información proporcionada para establecer una comparación cuantitativa |

No se dispone de datos de rendimiento del modelo ni de alternativas evaluadas en las mismas condiciones, por lo que la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo sin validación externa: cero descargas y cero "likes" en Hugging Face; no hay evidencia pública de su calidad ni de su comportamiento.
- Ausencia de model card detallada: no se documentan datos de entrenamiento, evaluación, sesgos ni limitaciones, lo que impide auditar el ajuste fino.
- Riesgo de alucinación: desconocido, pero al ser un finetune de un modelo pequeño y especializado, no debe asumirse fiabilidad en generación abierta de texto.
- Idiomas y contexto no declarados: no se puede garantizar soporte multilingüe ni una ventana de contexto concreta.
- `custom_code`: la carga requiere ejecutar código del repositorio; conviene revisarlo antes de usarlo, especialmente en entornos de producción o multiusuario.
- Licencia Apache-2.0: permite uso comercial, pero deben respetarse las atribuciones del modelo base Qwen y los avisos incluidos en LICENSE y NOTICE del repositorio.
- Especificidad del dominio: su propósito está ligado a la subred 127 de Zils; fuera de ese contexto, su utilidad es incierta y probablemente inferior a la del modelo base.
- Fecha de creación futura en los metadatos (2026): conviene verificar la autenticidad y procedencia del repositorio antes de confiar en él.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joamCriff123/zils-lite-l1115c
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio del autor en Hugging Face: https://huggingface.co/joamCriff123
- No se han encontrado papers, blogs, repositorios de código ni demos adicionales en la información disponible.

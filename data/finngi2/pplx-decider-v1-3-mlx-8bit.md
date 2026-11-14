# finngi2/pplx-decider-v1.3-mlx-8bit

## Resumen

pplx-decider-v1.3-mlx-8bit es una conversión no oficial a 8 bits del modelo `perplexity-ai/pplx-decider-v1.3` para Apple Silicon, realizada por el usuario finngi2 mediante la librería MLX. No se trata de un modelo generativo de texto: es un modelo de clasificación y extracción de spans ("decider") que responde preguntas estructuradas sobre un estado de entrada, eligiendo entre opciones, emitiendo respuestas sí/no con puntuación o localizando fragmentos literales con offsets de caracteres.

El modelo base tiene 26.086.635.760 parámetros (aproximadamente 26B) y arquitectura `qwen3_5` con capas de atención completa no causal, lo que lo aparta del uso convencional de transformers causales. La conversión reduce los pesos de unos 54 GB en bf16 a 28,2 GB (unos 30 GB con el adaptador Locate cargado), lo que permite ejecutarlo en Macs con 48 GB o más de memoria unificada.

Su relevancia es doble: por un lado, demuestra el patrón de "decider" como alternativa a la generación libre para tareas de enrutamiento y extracción estructurada; por otro, ilustra las dificultades de portar arquitecturas no causales a runtimes de inferencia estándar, que requieren un runtime propio (`decider_mlx.py`) en lugar de `mlx_lm.load`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer con capas de atención completa no causal y lectura de decisión de 255 vías) |
| Parametros totales | 26.086.635.760 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit affine, group size 64 (módulos del language model); visión y `lm_head` en bf16; adaptador Locate en precisión original |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base es un transformer `qwen3_5` con capas de atención completa no causal: el modelo no predice el siguiente token, sino que lee una respuesta de 255 vías desde un token marcador (`readout.safetensors`, 255 × 5120, expuesto como `language_model.lm_head` en esta conversión). Incluye además un adaptador de extracción de spans ("Locate") consistente en un LoRA de rango 64 sobre cada capa lineal del modelo de texto, un embedding entrenado `<|locate|>` y una cabeza de spans (receta v3). El protocolo de decisión es v4 (`joint-chunked-readout-v1`), con los mismos token ids que el encoder oficial para preguntas de tipo choice, noul y score.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en la información proporcionada. La conversión a MLX sigue el flujo de `mlx_vlm.convert --quantize --q-bits 8 --q-group-size 64` para `qwen3_5`: renombrado de claves y correcciones de pesos con la lógica `sanitize` de mlx-vlm (desplazamiento de eje en conv1d, transposición de patch-embed, offset +1 en pesos de normalización), casteo a bf16 salvo `A_log` en float32, cuantización affine 8-bit con grupo 64 en todos los módulos cuantizables del language model, y visión en bf16. El adaptador `locate-span/` se copia sin cambios en su precisión original. Herramientas usadas: mlx 0.32.4, mlx-vlm 0.7.12, transformers 5.23.0.

## Capacidades

- Clasificación de decisión sobre un estado de entrada: preguntas de tipo `choice` (selección entre opciones), `noul` (sí/no) y `score` (puntuación).
- Extracción de spans literales con offsets de caracteres (fin exclusivo) y puntuaciones asociadas mediante el adaptador Locate.
- Procesamiento de estados de texto; las entradas de imagen no están conectadas aunque los pesos de visión estén incluidos.
- Una pasada forward por pregunta en `mode="separate"`, que es el modo por defecto y evaluado del modelo oficial.
- Formato de petición compatible con el paquete oficial `pplx_decider` (PyTorch).
- No soporta generación de texto libre, tool calling, agentes ni razonamiento multi-paso en el sentido de un LLM generativo.

## Casos de uso

- Enrutamiento de tickets de soporte: dado el texto de una incidencia, decidir a qué equipo asignarla (`billing`, `support`, `sales`) mediante una pregunta `choice`. El README documenta un ejemplo con `team = support` a 0.9995 de confianza.
- Detección de intención binaria: preguntas `noul` como "¿el cliente pide un reembolso?" para clasificar conversaciones sin generar texto libre.
- Extracción de entidades con offsets: localizar nombres de personas, organizaciones y lugares en noticias o documentos, devolviendo spans verbatim y puntuaciones, útil para pipelines de anonimización o indexación.
- Extracción de campos técnicos en incidencias: el README muestra la localización de "401" a 0.9998 y "API key" a 0.86 en un ticket de soporte, aplicable a enriquecimiento de tickets con códigos de error.
- Clasificación por puntuación: preguntas `score` para priorizar o puntuar estados (por ejemplo, urgencia de una reclamación) sin necesidad de un modelo generativo.
- Procesamiento local en Apple Silicon: despliegue en Macs con 48 GB o más de memoria unificada para tareas de clasificación y extracción que requieran confidencialidad de datos, sin enviar texto a la nube.
- Evaluación comparativa de arquitecturas no causales: uso en investigación para comparar el patrón decider frente a LLMs generativos en tareas de enrutamiento y extracción estructurada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no hay comparación lado a lado con el modelo bf16, por lo que el coste de precisión de la cuantización 8-bit no está medido, y que tampoco hay benchmark de velocidad. Como referencia cualitativa, cada pregunta implica una pasada forward completa de un modelo de 27B, por lo que el autor espera "segundos por pregunta" en lugar de milisegundos.

## Requisitos de hardware

- Memoria: 28,2 GB de pesos; unos 30 GB de memoria con el adaptador Locate cargado. Requiere Mac con 48 GB o más de memoria unificada.
- GPU: Apple Silicon exclusivamente (MLX). No aplica a A100, H100 ni RTX 4090.
- Cabe en consumer GPU de Apple: sí, en configuraciones de 48 GB o más de memoria unificada (por ejemplo, Mac Studio o MacBook Pro de gama alta); no cabe en configuraciones de 16 o 32 GB.
- Despliegue: runtime propio `decider_mlx.py` incluido en el repo, con dependencias `mlx==0.32.4`, `mlx-vlm==0.7.12`, `transformers`, `numpy` y `huggingface-hub`. No es compatible con `mlx_lm.load` ni `mlx_vlm.load`, ni con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no medidos; el autor anticipa segundos por pregunta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pplx-decider-v1.3-mlx-8bit | 26,09B | no disponible | Clasificación y extracción de spans | Apache-2.0 | Hugging Face (MLX, Apple Silicon) |
| perplexity-ai/pplx-decider-v1.3 (base) | 26,09B (implícito) | no disponible | Clasificación y extracción de spans | Apache-2.0 | Hugging Face (PyTorch, runtime `pplx_decider`) |
| LLMs generativos de tamaño similar | ~26B | variable | Generación de texto | variable | Hugging Face, vLLM, llama.cpp |

No se dispone de información sobre otros modelos decider comparables en la documentación proporcionada. La comparación con LLMs generativos de tamaño similar es estructuralmente imperfecta: estos predicen el siguiente token y no ofrecen la lectura de 255 vías ni los offsets de spans del decider.

## Limitaciones y advertencias

- Conversión no oficial: no tiene relación con Perplexity; el autor lo declara explícitamente.
- No funciona con runtimes estándar: `mlx_lm.load` y `mlx_vlm.load` cargan los pesos pero producen respuestas incorrectas por usar atención causal y cabeza de vocabulario.
- Solo `mode="separate"`: una pasada forward por pregunta; no se cubre el modo conjunto.
- Solo estados de texto: las entradas de imagen no están conectadas aunque los pesos de visión estén presentes.
- Precisión no verificada: no se ha medido el coste de la cuantización 8-bit frente a bf16; el autor asume que 8-bit affine suele ser casi sin pérdida, pero lo marca como no verificado.
- Velocidad no medida: se esperan segundos por pregunta.
- Sin datos de sesgos, alucinación, cobertura de idiomas ni contexto: no disponibles en la información proporcionada; se remite a la model card original para uso previsto, evaluación y limitaciones.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base y el adaptador Locate deben verificarse en la card original antes de producción.
- Estado del repo: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el 2026-11-14; sin validación de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/finngi2/pplx-decider-v1.3-mlx-8bit
- Modelo base: https://huggingface.co/perplexity-ai/pplx-decider-v1.3
- MLX: https://github.com/ml-explore/mlx
- mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Revisión del código fuente citada: `9c2ebb27470d3dec2ad7ab727727e40d142c7213`

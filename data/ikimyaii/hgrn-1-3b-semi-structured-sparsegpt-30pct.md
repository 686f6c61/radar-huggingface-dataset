# ikimyaii/HGRN-1.3B-semi-structured-SparseGPT-30pct

## Resumen

HGRN-1.3B-semi-structured-SparseGPT-30pct es una variante podada del modelo base fla-hub/hgrn-1.3B-100B, publicado por el usuario ikimyaii en Hugging Face. Se trata de un ejercicio de investigación sobre poda (pruning) one-shot sin reentrenamiento: el modelo original, basado en la arquitectura HGRN (Hierarchically Gated Recurrent Network, una red recurrente con compuertas jerárquicas de la familia de los modelos linear-attention), se reduce a un 30 % de dispersión semi-estructurada mediante una modificación del método SparseGPT.

La relevancia de esta ficha es acotada y experimental: no es un modelo pensado para uso en producción, sino una línea base (baseline) para comparar con otras variantes de poda del mismo autor (los modelos "EHWS" que menciona la model card). El interés técnico reside en la modificación del enmascaramiento: en lugar de la regla N:M clásica de SparseGPT, se impone una restricción por fila dentro de cada bloque de 128 columnas, de modo que cada fila poda exactamente el mismo número de entradas de menor magnitud según la métrica de Hessiana inversa.

El modelo conserva 1.364.396.032 parámetros en el checkpoint (las capas lineales internas de los bloques están podadas; los embeddings y la lm_head permanecen densos), ocupa 2,7 GB en el repositorio y se distribuye en formato safetensors. No se dispone de información sobre licencia, idiomas soportados ni pipeline declarado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | HGRN (Hierarchically Gated Recurrent Network), red recurrente con compuertas jerárquicas; transformer-like con capas lineales podadas |
| Parámetros totales | 1.364.396.032 (checkpoint); capas lineales internas al 30 % de dispersión, embeddings y lm_head densos |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base se entrenó con secuencias de 2.048 tokens según el protocolo de calibración) |
| Tipos de cuantización | no disponible (pesos en bfloat16 en el checkpoint) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Dispersión | 0,2999 medida sobre los pesos publicados (168 capas podadas) |
| Modelo base | fla-hub/hgrn-1.3B-100B |
| Método de poda | SparseGPT one-shot con restricción por fila dentro de bloques de 128 columnas |
| Calibración | 128 secuencias C4 de 2.048 tokens, seed 0 |
| Coste de poda | 3,6 minutos en una A100 40 GB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura HGRN del base fla-hub/hgrn-1.3B-100B, una red recurrente con compuertas jerárquicas que sustituye la atención cuadrática por recurrencia lineal, lo que reduce el coste computacional en secuencias largas. El nombre del modelo base ("100B") sugiere un entrenamiento sobre 100.000 millones de tokens, aunque la información proporcionada no detalla la composición del dataset ni si hubo fases de RLHF o DPO.

Sobre ese base se aplica una poda one-shot sin reentrenamiento mediante el código oficial `fasterprune` de SparseGPT, con una modificación en la generación de la máscara: dentro de cada bloque de 128 columnas, cada fila poda el mismo número de sus entradas de menor magnitud según la métrica `w² / [H⁻¹]_jj²` (la regla N:M de SparseGPT con M igual al tamaño del bloque). Esto garantiza que todas las filas de todas las capas podadas tengan idéntico número de no-ceros, lo que equilibra perfectamente el trabajo por fila en kernels dispersos. Las capas se podan en orden, calibrando cada bloque sobre las salidas de los bloques ya podados, con pesos en bfloat16. Embeddings y lm_head quedan densos.

## Capacidades

- Generación de texto autoregresiva con un modelo de 1.300 millones de parámetros.
- Razonamiento básico y respuesta a preguntas de opción múltiple (evaluado en ARC, HellaSwag, OpenBookQA, RTE, Winogrande, BoolQ).
- Comprensión lectora y sentido común a nivel de modelo pequeño.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- No dispone de modo "thinking", visión ni audio.
- El interés principal es servir de línea base para estudiar el impacto de la poda semi-estructurada en modelos recurrentes lineales.

## Casos de uso

- Investigación sobre poda de modelos: sirve como referencia (baseline) para comparar técnicas de pruning como SparseGPT, Wanda o EHWS sobre arquitecturas HGRN, midiendo la degradación de perplejidad y precisión zero-shot.
- Estudio de kernels dispersos: al garantizar el mismo número de no-ceros por fila en las 168 capas podadas, permite validar implementaciones de kernels semi-estructurados con carga por fila perfectamente balanceada.
- Despliegue en entornos con restricciones de memoria: los 2,7 GB del checkpoint y la dispersión del 30 % reducen la huella frente al modelo denso, útil para prototipos en GPUs de gama media.
- Evaluación comparativa de protocolos de calibración: el uso de 128 secuencias C4 de 2.048 tokens permite reproducir y contrastar resultados con otros trabajos de poda.
- Docencia y experimentación: modelo pequeño y de poda rápida (3,6 minutos en A100) para ilustrar el flujo completo de poda one-shot con `fasterprune`.
- Pruebas de inferencia con `flash-linear-attention`: requiere `import fla` y `AutoModelForCausalLM.from_pretrained(...)`, por lo que es útil para validar integraciones de la librería FLA.

## Benchmarks y rendimiento

Perplejidad (protocolo de evaluación de ELSA, WikiText-2 y C4, fp16):

| Modelo | WikiText-2 | C4 |
|---|---|---|
| Denso (base) | 11,81 | 16,09 |
| Este modelo | 12,37 | 16,68 |

Precisión zero-shot (lm-evaluation-harness):

| Tarea | Denso | Este modelo |
|---|---|---|
| arc_challenge | 0,2432 | 0,2398 |
| arc_easy | 0,5644 | 0,5589 |
| boolq | 0,5758 | 0,6009 |
| hellaswag | 0,3828 | 0,3757 |
| openbookqa | 0,2300 | 0,2340 |
| rte | 0,5379 | 0,5632 |
| winogrande | 0,5288 | 0,5288 |
| Media | 0,4376 | 0,4430 |

La dispersión medida sobre los pesos publicados es 0,2999. Todas las filas de las 168 capas podadas tienen el mismo número de no-ceros (verificado por el autor).

## Requisitos de hardware

- VRAM estimada: el checkpoint en bfloat16 ocupa unos 2,7 GB; en fp16, aproximadamente la misma cifra. Con cuantización a 8 bits cabría en torno a 1,5 GB y a 4 bits en torno a 0,8 GB (estimaciones por tamaño de parámetros, no verificadas).
- GPU recomendadas: A100 40 GB (usada para la poda), H100, o GPUs consumer con al menos 4-6 GB de VRAM para inferencia en bf16.
- Cabe en GPUs consumer: sí, en tarjetas con 6 GB o más (RTX 3060, RTX 4060, RTX 4090) en bf16; en cuantización de 4 bits cabría en GPUs de 2-4 GB.
- Opciones de despliegue: `AutoModelForCausalLM.from_pretrained(...)` con `flash-linear-attention` instalado (`import fla`). No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI; dada la arquitectura HGRN y la dispersión, es probable que requiera soporte específico de FLA.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dispersión | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo | 1.364.396.032 | no disponible | 30 % semi-estructurada | no disponible | Hugging Face |
| fla-hub/hgrn-1.3B-100B (base denso) | ~1,3 B | no disponible | 0 % | no disponible | Hugging Face |
| Variantes EHWS del mismo autor | no disponible | no disponible | no disponible | no disponible | Hugging Face (referenciadas en la model card) |

No se dispone de datos de benchmarks de modelos comparables de otros autores en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental de investigación: no está pensado para producción y no se declara licencia, lo que impide confirmar si el uso comercial está permitido.
- La poda one-shot sin reentrenamiento degrada la perplejidad (de 11,81 a 12,37 en WikiText-2 y de 16,09 a 16,68 en C4), aunque la media zero-shot mejora ligeramente (0,4376 a 0,4430), un resultado que conviene interpretar con cautela por el tamaño reducido del modelo.
- Riesgo de alucinación inherente a un modelo de 1,3 B sin ajuste por preferencias documentado.
- Idiomas soportados no declarados; no se garantiza un rendimiento adecuado en castellano.
- La dispersión semi-estructurada requiere kernels compatibles; sin ellos, el ahorro real de cómputo puede no materializarse y el modelo podría ejecutarse como denso.
- Requiere la librería `flash-linear-attention` y el código de poda `fasterprune`; la integración con ecosistemas estándar (vLLM, llama.cpp) no está documentada.
- Sin descargas ni "likes" en el momento de la consulta, lo que limita la validación comunitaria del checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikimyaii/HGRN-1.3B-semi-structured-SparseGPT-30pct
- Modelo base: https://huggingface.co/fla-hub/hgrn-1.3B-100B
- Librería flash-linear-attention (FLA): no disponible en la información proporcionada
- Repositorio fasterprune / SparseGPT: no disponible en la información proporcionada
- Paper de HGRN: no disponible en la información proporcionada
- Paper de SparseGPT: no disponible en la información proporcionada

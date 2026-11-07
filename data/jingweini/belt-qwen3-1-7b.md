# JingweiNi/BELT-Qwen3-1.7B

## Resumen

BELT-Qwen3-1.7B es un conjunto de artefactos de entrenamiento publicados por JingweiNi (EdisonNi-hku) como material de reproducibilidad del articulo "Same Beliefs, Different Policies: Learning Reusable Representations for Early Stopping in LLM Reasoning". No es un modelo de lenguaje autónomo: son checkpoints de un lector y una cabeza de clasificación (reader/head) personalizados que se cargan sobre el backbone Qwen/Qwen3-1.7B mediante el scorer del repositorio BELT. El repositorio no incluye pesos del backbone, manifiestos de preguntas, bancos completos de trayectorias ni políticas de parada ajustadas.

El problema que aborda es el early stopping en cadenas de razonamiento de LLM: decidir cuándo detener la generación de una traza de pensamiento para ahorrar coste computacional sin degradar la respuesta. La propuesta BELT aprende representaciones reutilizables (beliefs) que permiten entrenar políticas de parada distintas sobre una misma representación latente. El checkpoint usa cuatro objetivos de lectura (q, v, r, stability, correspondientes a Now, End, Later y Same) y se entrena con inicialización aleatoria de la cabeza (`--random-init-head`) sobre una plantilla ReProbe de la capa 16.

El modelo base es Qwen3-1.7B, un transformer denso de 2B parámetros de Alibaba Cloud con modos Thinking y Non-Thinking y contexto extensible de 131K tokens. El artefacto se publica con licencia no especificada y solo cubre el idioma inglés en los metadatos declarados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Lector y cabezas de clasificación (reader/head) sobre backbone transformer denso Qwen3-1.7B |
| Parametros totales | No disponible (el artefacto son pesos de cabeza/lector; el backbone Qwen3-1.7B tiene ~2B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible para el artefacto; el backbone Qwen3-1.7B soporta 131K tokens |
| Tipos de cuantizacion | No disponible (checkpoints en `.pt` de PyTorch; sin versiones GGUF/AWQ publicadas) |
| Idiomas soportados | Inglés (según metadatos) |
| Licencia | No disponible (el autor indica que no se asigna nueva licencia; aplican los términos del backbone y upstream) |
| Formato de pesos | PyTorch `.pt` (`s1_best.pt` por seed) más `reader-template/` y `val_scored.jsonl` |

## Arquitectura y entrenamiento

El artefacto no contiene un modelo generativo completo. Consiste en tres ejecuciones (seeds 0, 1 y 2), cada una con un fichero `s1_best.pt` que contiene el lector de cuatro objetivos (q, v, r, stability = Now, End, Later, Same) y sus readouts. El entrenamiento parte del Qwen/Qwen3-1.7B en la revisión `70d244cc86ccca08cf5af4e1e306ecf908b1ad5e`, carga una plantilla ReProbe de la capa 16 incluida en `reader-template/` (configuración y pesos de inicialización, no un resultado BELT adicional) y usa `--random-init-head` para inicializar la cabeza de forma aleatoria. Esta es la familia random-initialized empleada en las tablas principales de Qwen del artículo.

Cada ejecución incluye además el `val_scored.jsonl` original, que el scorer requiere y copia en la salida puntuada para calibración; los recuentos de filas, bytes y hashes están registrados bajo `validation_scores` en `CHECKPOINTS.json`. El repositorio incluye `CHECKPOINTS.json` (seed, precio de entrenamiento cuando aplica, ruta de origen, recuento de bytes y SHA256), `summary.json` por ejecución, metadatos de ejecución y `SHA256SUMS` que cubre todos los ficheros excepto él mismo. No se publican datos sobre número de tokens de entrenamiento, composición del dataset, RLHF ni DPO.

## Capacidades

- Puntuación de estados intermedios de razonamiento mediante un lector de cuatro objetivos (Now, End, Later, Same) sobre representaciones del backbone Qwen3-1.7B.
- Soporte para entrenamiento y evaluación de políticas de parada temprana reutilizables (BELT) sobre una misma representación latente.
- Integración con el scorer del repositorio BELT mediante el flag `--source-run` y el pool `iclr_score_pool`.
- Reproducibilidad verificable: hashes SHA256 por fichero y por ejecución, semillas documentadas y validación puntuada incluida.
- No es un modelo de chat, generación de texto, código, matemáticas, visión, tool calling ni agentes por sí mismo; esas capacidades dependen del backbone Qwen3-1.7B.
- Capacidades multilingües: no disponibles en el artefacto (metadatos solo en inglés).

## Casos de uso

- Investigación en early stopping de razonamiento: usar los checkpoints como `--source-run` con `iclr_score_pool` para reproducir las tablas principales del artículo sobre Qwen3-1.7B y comparar políticas de parada.
- Ahorro de coste en pipelines de razonamiento: entrenar una política de parada sobre las representaciones BELT para truncar cadenas de pensamiento en producción y reducir tokens generados por consulta.
- Evaluación de robustez entre semillas: comparar las tres ejecuciones (seeds 0, 1, 2) para medir la varianza del lector y de las políticas derivadas antes de desplegar.
- Calibración de scorers: reutilizar `val_scored.jsonl` para calibrar umbrales de parada sobre un conjunto de validación puntuado y verificar la reproducibilidad con los hashes registrados.
- Estudio de representaciones reutilizables: analizar si las creencias aprendidas (beliefs) transfieren entre distintas políticas de parada, tal como plantea el artículo.
- Reproducción de experimentos académicos: reconstruir el entorno del repositorio BELT con la plantilla ReProbe de la capa 16 y el runtime raíz de Qwen para validar resultados publicados.
- Base para extensiones: sustituir el backbone o la cabeza manteniendo el pipeline de lectura y puntuación para experimentar con otros modelos Qwen de la familia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas numéricas (MMLU, HumanEval, GSM8K ni métricas específicas de early stopping); remite al artículo y al repositorio BELT para los resultados.

## Requisitos de hardware

- VRAM estimada: no disponible para el artefacto aislado; depende del backbone Qwen3-1.7B cargado en el runtime raíz de Qwen.
- GPU recomendadas: no especificadas por el autor; el backbone de ~2B parámetros es viable en GPUs consumer con cuantización, pero el artefacto se distribuye en `.pt` sin versiones cuantizadas.
- Cabe en GPU consumer: probablemente sí con el backbone en precisión reducida, aunque no hay datos publicados que lo confirmen para este artefacto.
- Opciones de despliegue: scorer del repositorio BELT (https://github.com/EdisonNi-hku/BELT) con el runtime raíz de Qwen; no se documentan vLLM, llama.cpp, Ollama ni TGI para estos checkpoints.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BELT-Qwen3-1.7B | Cabezas sobre backbone ~2B | No disponible (backbone 131K) | Lector/head para early stopping | No disponible | Hugging Face (0 descargas) |
| Qwen/Qwen3-1.7B | ~2B | 131K | Modelo generativo denso con modos Thinking/Non-Thinking | No disponible en la información | Hugging Face |
| Alternativas de early stopping en razonamiento | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre otros artefactos comparables de early stopping publicados con métricas verificables; la comparación directa con modelos generativos no es equivalente porque BELT-Qwen3-1.7B no genera texto por sí mismo.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el backbone Qwen/Qwen3-1.7B en la revisión exacta y el scorer del repositorio BELT; no puede usarse con `transformers` de forma directa.
- No incluye pesos del backbone, manifiestos de preguntas, bancos completos de trayectorias ni políticas de parada ajustadas; hay que ajustar u obtener los parámetros de la política por separado antes de evaluarla.
- Licencia no especificada: el autor indica que la publicación no asigna nueva licencia y que aplican los términos del backbone y upstream; verificar antes de cualquier uso comercial.
- Idiomas: metadatos solo en inglés; no hay evidencia de comportamiento multilingüe del lector.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible; dependen del backbone y del conjunto de validación empleado.
- Repositorio con 0 descargas y 0 likes: ecosistema mínimo, sin validación comunitaria independiente.
- Los recuentos y hashes de `val_scored.jsonl` corresponden a puntuaciones de validación guardadas, no a datos generados de nuevo; no deben tratarse como resultados frescos.
- Fechas de creación y actualización (2026) posteriores a la información de referencia: verificar la vigencia de los artefactos antes de integrarlos en producción.

## Enlaces

- Hugging Face: https://huggingface.co/JingweiNi/BELT-Qwen3-1.7B
- Repositorio BELT (código y guía de reproducción): https://github.com/EdisonNi-hku/BELT
- Recetas: https://github.com/EdisonNi-hku/BELT/blob/main/docs/RECIPES.md
- Lista de artefactos: https://github.com/EdisonNi-hku/BELT/blob/main/docs/ARTIFACTS.md
- Aviso de atribución: https://github.com/EdisonNi-hku/BELT/blob/main/NOTICE.md
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Ficha de Qwen3-1.7B con specs y VRAM: https://apxml.com/models/qwen3-1-7b

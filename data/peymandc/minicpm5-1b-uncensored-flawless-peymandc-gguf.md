# Peymandc/MiniCPM5-1B-Uncensored-Flawless-Peymandc-GGUF

## Resumen

MiniCPM5-1B Uncensored Flawless — Peymandc (GGUF) es una versión modificada del modelo MiniCPM5-1B de OpenBMB, convertida al formato GGUF para inferencia local eficiente. La modificación principal consiste en la eliminación del comportamiento de rechazo (refusal) aprendido por el modelo original, mediante la técnica Heretic v2.1.0 y su método de ablación de rango arbitrario (Arbitrary-Rank Ablation, ARA). No se trata de un nuevo preentrenamiento ni de un fine-tuning supervisado convencional, sino de una intervención sobre los pesos que altera la dirección de rechazo sin reentrenar el modelo.

El modelo base MiniCPM5-1B cuenta con 1.080.632.832 parámetros totales y está orientado a generación de texto conversacional, con soporte declarado para contexto largo y tool calling. La versión GGUF está pensada para despliegue en dispositivos de borde (edge) y entornos con recursos limitados, ofreciendo cuatro cuantizaciones que van desde 688 MB (Q4_K_M) hasta 2,17 GB (BF16).

La relevancia de esta ficha radica en que documenta un caso de modificación de seguridad sobre un modelo pequeño, con métricas de evaluación publicadas por el autor (reducción de rechazos del 81% al 3% en una muestra de 100 prompts, con divergencia KL de 0,0070 respecto al original). Es un ejemplo útil para quienes investigan alineación, edición de comportamiento y despliegue de modelos pequeños en local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de MiniCPM5-1B; detalles específicos de capas y atención no disponibles en la información proporcionada) |
| Parametros totales | 1.080.632.832 |
| Parametros activos | no disponible (no es MoE según los datos disponibles) |
| Longitud de contexto | no disponible (la model card menciona "long-context" como tag, sin cifra concreta) |
| Tipos de cuantizacion | Q4_K_M, Q6_K, Q8_0, BF16 |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (derivados de un checkpoint BF16 en Safetensors) |

## Arquitectura y entrenamiento

El modelo es una cuantización GGUF del checkpoint BF16 modificado `Peymandc/MiniCPM5-1B-Uncensored-Flawless-Peymandc`, que a su vez deriva de `openbmb/MiniCPM5-1B`. La arquitectura subyacente es la del MiniCPM5-1B original, un transformer de 1.080 millones de parámetros. No se dispone en la información proporcionada de detalles sobre número de capas, dimensión oculta, mecanismo de atención ni composición del dataset de preentrenamiento original.

La modificación aplicada es una ablación de rango arbitrario (ARA) mediante Heretic v2.1.0, que actúa sobre las capas 7 a 15 del modelo. Los parámetros documentados de la ablación son: `start_layer_index` = 7, `end_layer_index` = 15, `preserve_good_behavior_weight` = 0,9075, `steer_bad_behavior_weight` = 0,0001, `overcorrect_relative_weight` = 0,5820 y `neighbor_count` = 1. Esta intervención modifica la dirección de rechazo aprendida sin reentrenar el modelo, y el autor reporta una divergencia KL de 0,0070 respecto al original en la muestra evaluada, lo que indica una alteración distribucional pequeña bajo ese protocolo concreto. No se documentan fases de RLHF o DPO adicionales en esta versión.

## Capacidades

- Generación de texto conversacional multi-turno, orientada a asistentes locales.
- Soporte declarado de tool calling / function calling (según los tags del repositorio; no se detalla el formato exacto en la model card).
- Capacidad declarada de contexto largo (tag "long-context"), sin cifra concreta publicada.
- Capacidades multilingües limitadas a inglés (en) y chino (zh).
- Comportamiento de rechazo reducido: el autor reporta 3/100 coincidencias de palabras clave de rechazo frente a 81/100 del original en la muestra evaluada.
- Orientado a despliegue en dispositivo (on-device) y edge AI por su tamaño reducido.
- No se documentan capacidades de visión, audio ni modo "thinking" en la información disponible.

## Casos de uso

- Asistentes conversacionales locales en dispositivos de borde: con 1.080 millones de parámetros y una cuantización Q4_K_M de 688 MB, el modelo puede ejecutarse en portátiles, mini-PC y dispositivos embebidos con poca memoria, gestionando diálogos multi-turno sin conexión a la nube.
- Investigación sobre alineación y edición de comportamiento: el repositorio documenta la configuración exacta de Heretic ARA y métricas de rechazo y divergencia KL, lo que permite reproducir y comparar intervenciones sobre modelos pequeños en estudios de seguridad.
- Prototipado rápido de aplicaciones de texto: gracias a su licencia Apache 2.0 y a los formatos GGUF, se puede integrar en pipelines de prueba con llama.cpp u Ollama sin coste de licencia.
- Generación de texto en entornos con restricciones de privacidad: al ejecutarse en local, evita enviar datos a servicios externos, adecuado para borradores, resúmenes o clasificación de texto sensible.
- Evaluación de cuantizaciones: el repositorio ofrece Q4_K_M, Q6_K, Q8_0 y BF16 del mismo checkpoint, lo que facilita experimentos comparativos de precisión y uso de memoria en un modelo pequeño.
- Educación y demos de IA generativa: su tamaño y licencia permiten incluirlo en talleres, notebooks y entornos docentes donde se necesita un modelo conversacional ligero y desplegable en CPU.
- Integración en agentes simples con tool calling: el modelo declara soporte de llamadas a funciones, lo que permite construir asistentes que consulten APIs o ejecuten acciones acotadas en entornos controlados.

## Benchmarks y rendimiento

El autor publica métricas de evaluación de la modificación Heretic sobre el checkpoint BF16 de origen, no sobre los ficheros GGUF individuales:

| Metrica | Checkpoint modificado (BF16) | MiniCPM5-1B original |
|---|---:|---:|
| Coincidencias de palabras clave de rechazo (KeywordRate, 100 prompts de `mlabonne/harmful_behaviors`) | 3/100 (3%) | 81/100 (81%) |
| Divergencia KL (100 prompts de `mlabonne/harmless_alpaca`) | 0,0070 | 0,0000 (referencia) |

El autor advierte que la métrica de rechazo es un proxy basado en palabras clave, no un clasificador semántico ni una evaluación humana, y que los ficheros GGUF no han sido evaluados de forma independiente. No se han publicado resultados de benchmarks de capacidad general (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 0,7 GB para Q4_K_M, 0,9 GB para Q6_K, 1,15 GB para Q8_0 y 2,17 GB para BF16, según los tamaños de fichero publicados. El autor advierte que estos tamaños no equivalen al uso total de memoria en tiempo de ejecución, que depende de la longitud de contexto, la caché KV, los búferes del runtime y el offloading a GPU.
- GPU recomendadas: no se especifican en la información disponible. Por tamaño, cualquier GPU consumer con al menos 2-4 GB de VRAM libre puede alojar las cuantizaciones pequeñas, aunque no se aportan datos medidos.
- Cabe en GPU consumer: sí, previsiblemente en modelos como RTX 3060, RTX 4060, RTX 4090 y similares, así como en CPU, dado el tamaño reducido. No se aportan cifras de latencia ni throughput medidos.
- Opciones de despliegue: llama.cpp y cualquier runtime compatible con GGUF (Ollama, LM Studio, entre otros). El repositorio incluye el tag `endpoints_compatible`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---:|---|---|---|---|
| MiniCPM5-1B Uncensored Flawless — Peymandc (GGUF) | 1.080.632.832 | no disponible | Apache 2.0 | GGUF | Versión con rechazo ablacionado; métricas de rechazo y KL publicadas |
| openbmb/MiniCPM5-1B | 1.080.632.832 (mismo tamaño según datos del repo) | no disponible | no disponible en la información proporcionada | Safetensors | Modelo original sin modificar; referencia de la evaluación Heretic |
| Peymandc/MiniCPM5-1B-Uncensored-Flawless-Peymandc | 1.080.632.832 (mismo checkpoint) | no disponible | Apache 2.0 | Safetensors (BF16) | Checkpoint fuente de las conversiones GGUF |

No se dispone de datos de benchmarks de capacidad general ni de otros modelos comparables de la misma categoría en la información proporcionada, por lo que la comparación se limita a las variantes del mismo modelo base.

## Limitaciones y advertencias

- La modificación Heretic elimina el comportamiento de rechazo aprendido; esto puede aumentar la probabilidad de generar contenido dañino, sesgado o inapropiado en producción. No debe desplegarse en aplicaciones orientadas al público sin filtros adicionales.
- La evaluación de rechazo se basa en coincidencias de palabras clave sobre 100 prompts, no en una evaluación semántica ni humana; los resultados no deben interpretarse como una medida integral de seguridad o utilidad.
- La divergencia KL de 0,0070 se midió sobre una muestra concreta y con el checkpoint BF16; los ficheros GGUF no han sido evaluados de forma independiente y la cuantización puede introducir diferencias adicionales.
- Idiomas soportados limitados a inglés y chino; el rendimiento en castellano no está documentado.
- No se publican cifras de longitud de contexto efectiva, benchmarks de capacidad general ni datos de latencia, lo que dificulta planificar su uso en producción.
- Riesgo de alucinación inherente a un modelo de 1.080 millones de parámetros; no se aportan métricas de factualidad.
- La licencia Apache 2.0 permite uso comercial, pero el usuario asume la responsabilidad sobre el contenido generado y sobre el cumplimiento normativo aplicable.
- El repositorio incluye un aviso de que los pesos GGUF derivan del checkpoint modificado y no del original de OpenBMB; conviene verificar la procedencia si se requiere trazabilidad.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/Peymandc/MiniCPM5-1B-Uncensored-Flawless-Peymandc-GGUF
- Checkpoint fuente modificado (Safetensors): https://huggingface.co/Peymandc/MiniCPM5-1B-Uncensored-Flawless-Peymandc
- Modelo original de OpenBMB: https://huggingface.co/openbmb/MiniCPM5-1B
- Heretic (herramienta de modificación): https://github.com/p-e-w/heretic
- Directorio de reproducción en el repo Safetensors: https://huggingface.co/Peymandc/MiniCPM5-1B-Uncensored-Flawless-Peymandc/tree/main/reproduce
- Página de apoyo del autor: https://huggingface.co/spaces/Peymandc/support

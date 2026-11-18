# moshy89/DeepSeek-V4.1-1017-Ablitrated-Efficient-v3

## Resumen

DeepSeek-V4.1-1017-Ablitrated-Efficient-v3 es un ajuste fino experimental publicado por el usuario moshy89 sobre la línea DeepSeek-V4.1-Flash-1017. Se trata de un modelo de arquitectura MoE (mixture of experts) con 763.205.315.794 parámetros totales y pesos en safetensors, distribuido en 48 shards que ocupan 513,8 GB en el repositorio. El modelo parte de `pentacoxian-dev/DeepSeek-V4.1-1017-Ablitrated-Efficient` (v2) y del modelo oficial `deepseek-ai/DeepSeek-V4.1-Flash-1017`, ambos bajo licencia MIT.

El objetivo declarado del autor es producir una versión sin rechazos (no-refusal) para investigación, corrigiendo además el problema de bucles repetitivos que arrastraba la variante anterior. La versión interna es V3.1, aunque el nombre del repositorio conserve el sufijo v3. La innovación principal de V3.1 consiste en separar el vector de bucle del vector de "uncensoring": el vector de bucle se ortogonaliza contra el vector singular dominante de cada capa antes de restarlo, lo que elimina la regresión en las métricas de re-verificación.

El modelo declara una longitud de contexto máxima de 1.048.576 tokens, con una tapa de evaluación de 32.768 turnos, y solo soporta inglés según la model card. Es una publicación de investigación, no un modelo listo para producción: cero descargas y cero likes en el momento de la consulta, y estado explícitamente marcado como experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer (model_type `deepseek_v41`) |
| Parametros totales | 763.205.315.794 |
| Parametros activos | no disponible |
| Longitud de contexto | 1.048.576 max; tapa de evaluación de 32.768 turnos |
| Tipos de cuantizacion | fp8 (etiqueta del repo); no se detallan otras variantes |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (48 shards) + delta overlay |
| Tamano del repositorio | 513,8 GB |
| Modelo base | pentacoxian-dev/DeepSeek-V4.1-1017-Ablitrated-Efficient (v2) y deepseek-ai/DeepSeek-V4.1-Flash-1017 |
| Libreria | transformers |
| Pipeline | text-generation |
| Variante interna | c2_km1_nr2 (router id) |

## Arquitectura y entrenamiento

La arquitectura es un transformer con mezcla de expertos (MoE) bajo el tipo `deepseek_v41`, heredado del modelo oficial DeepSeek-V4.1-Flash-1017. No se dispone de información sobre el número de parámetros activos por token, la composición del dataset de preentrenamiento ni el volumen de tokens utilizados. El proceso de ajuste no es un entrenamiento convencional: el autor describe una intervención sobre los pesos mediante edición de vectores de dirección (ablación de rechazo y reducción de bucles), no un fine-tuning con RLHF o DPO documentado.

La innovación técnica central de V3.1 es la separación ortogonal del vector de bucle respecto al vector de "uncensoring" dominante de cada capa. En versiones anteriores, restar el vector de bucle reintroducía comportamientos de rechazo o degradaba la re-verificación; en V3.1 el vector de bucle se proyecta ortogonal al vector singular de uncensoring antes de aplicarse, y el tensor oficial `layers.39.ffn.shared_experts.w2` se restaura. El autor documenta que ese tensor de capa tardía es especialmente delicado: eliminarlo reduce bucles pero también transporta señal relacionada con el rechazo, de modo que cualquier edición posterior debe re-medirse. Se distribuyen tanto los pesos fusionados completos (48 shards) como un delta overlay.

## Capacidades

- Generación de texto conversacional en inglés, con pipeline `text-generation`.
- Modo sin rechazos (no-refusal): la model card reporta una tasa de rechazo del 2,6 % en Orca 850 sin prompt y del 1,41 % con prompt.
- Corrección de bucles: 0 episodios bloqueados en las suites de agente held-out y dev de 96 episodios, con éxito del 100 %.
- Razonamiento de múltiples pasos en entornos agénticos, con una puntuación de bucle del 16,7 % (episodios con alguna repetición recuperable).
- Conocimiento general medido en MMLU (85,9 % en 5-shot completo).
- Contexto largo: hasta 1.048.576 tokens declarados, con evaluación a 32.768 turnos.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: solo inglés declarado.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Investigación sobre alineación y rechazo: el modelo sirve como objeto de estudio para medir cómo la ablación de direcciones en el espacio de activaciones afecta a las tasas de rechazo, con métricas reproducibles sobre Orca 850, HarmBench y XSTest.
- Evaluación de robustez frente a bucles en agentes: las suites de 96 episodios con 0 bloqueos permiten probar pipelines agénticos de múltiples pasos donde la repetición infinita es el fallo crítico, usando el contexto de 32.768 turnos para trazas largas.
- Análisis de clasificadores de seguridad: los resultados con el clasificador oficial HarmBench-Llama-2-13B (87,5 % de ASR global) permiten estudiar la fiabilidad de los clasificadores de daño frente a modelos abliterated.
- Generación de texto creativo sin filtros en inglés: para proyectos de escritura que requieran respuestas sin rechazos, con la advertencia de que el modelo es experimental y solo cubre inglés.
- Reproducción de experimentos de edición de pesos: el delta overlay y los pesos fusionados permiten replicar la separación ortogonal bucle/uncensoring y comparar con la variante c2_km1.
- Benchmarking de modelos MoE de gran escala: con 763.205 millones de parámetros y fp8, sirve para medir throughput y latencia en despliegues vLLM con contexto largo.

## Benchmarks y rendimiento

Resultados medidos el 2026-11-12 con V3.1 cargado, engram activado y vLLM, comparando con la variante c2_km1:

| Prueba | c2_km1 | V3.1 | Delta |
|---|---:|---:|---:|
| MMLU completo, 5-shot | 85,6 % (12.023/14.042) | 85,9 % (12.065/14.042) | +0,3 |
| MMLU-300 | 86,0 % (258/300) | 88,0 % (264/300) | +2,0 |
| Orca 850, sin prompt | 8,6 % (73/850) | 2,6 % (22/850) | −6,0 pt |
| Orca 850, con prompt | 11,3 % (96/850) | 1,41 % (12/850) | −9,9 pt |
| Harmful 500 | 8,2 % (41/500) | 2,6 % (13/500) | −5,6 pt |
| Benign 350 | 9,1 % (32/350) | 2,6 % (9/350) | −6,5 pt |
| XSTest falsos rechazos | 12,0 % (30/250) | 3,6 % (9/250) | −8,4 pt |
| JBB | 2,5 % (5/200) | 0,0 % (0/200) | — |
| MaliciousInstruct | 1,0 % (1/100) | 0,0 % (0/100) | — |
| SimpleSafetyTests | 32,0 % (16/50) | 6,0 % (3/50) | — |

Clasificador oficial HarmBench-Llama-2-13B (entrada de 4.096 tokens, greedy, 320 completaciones, sin system prompt):

| Split | c2_km1 | V3.1 |
|---|---:|---:|
| Estándar (159) | 65,4 % (104) | 91,8 % (146) |
| Contextual (81) | 43,2 % (35) | 90,1 % (73) |
| Copyright (80) | 50,0 % (40) | 76,3 % (61) |
| Total 320 | 55,9 % (179) | 87,5 % (280) |

Cumplimiento en 4 niveles con juez Dolphin-2.9.4-8B Q4_K_M (vista separada, no es el ASR oficial):

| Nivel | c2_km1 | V3.1 |
|---|---:|---:|
| COMPLY | 74,7 % (239) | 95,94 % (307) |
| SOFT_RED | 25,3 % (81) | 2,2 % (7) |
| HEDGE | 0,0 % | 0,0 % |
| HARD_REF | 0,0 % | 1,9 % (6) |
| UNCLEAR | 0,0 % | 0,0 % |

Bucles agénticos:

| Suite | c2_km1 | V3.1 | Puerta |
|---|---|---:|---|
| Held-out 96, esfuerzo 100 | 0 bloqueos, 100 % éxito | 0 bloqueos, 100 % | pasa |
| Dev 96, esfuerzo 100 | 0 bloqueos, 100 % éxito | 0 bloqueos, 100 % | pasa |
| Dev 96, esfuerzo 75 | 0 bloqueos, 100 % éxito | 0 bloqueos, 100 % | pasa |
| Bloqueos a 32k | 0 | 0 | pasa |
| Tokens medianos, held-out | 341 | 424 | — |

Puntuación de bucle (proporción de episodios con repetición recuperable): held-out 16,7 % (frente a 14,6 %), dev 16,7 % (frente a 15,6 %), esfuerzo 75 17,7 % (frente a 15,6 %). Re-verificación: held-out 24,4 % (frente a 26,2 %), dev 20,0 % (frente a 21,9 %), esfuerzo 75 36,1 % (frente a 39,5 %); respuestas prematuras 0,0 % y re-chequeos requeridos 100 % en dev.

## Requisitos de hardware

- VRAM estimada para inferencia: con 763.205 millones de parámetros en fp8, el peso ronda los 763 GB; se necesita un nodo multi-GPU. En cuantizaciones de 4 bits no documentadas por el autor, el peso bajaría a unos 380 GB, pero no se ofrecen ficheros GGUF oficiales.
- GPU recomendadas: nodos con múltiples H100 (80 GB) o A100 (80 GB); con 8×H100 se cubre el peso en fp8 con margen para KV cache.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en ninguna GPU consumer individual; el tamaño del repositorio (513,8 GB) ya excede cualquier configuración doméstica habitual.
- Opciones de despliegue: vLLM es el backend usado por el autor para las mediciones; transformers es la librería declarada. No se documentan recetas para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor solo reporta tokens medianos por episodio agéntico (424 en held-out), no throughput.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Estado |
|---|---|---|---|---|
| DeepSeek-V4.1-1017-Ablitrated-Efficient-v3 (este) | 763.205.315.794 | 1.048.576 | MIT | experimental, 0 descargas |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 | no disponible | no disponible | MIT | modelo oficial base |
| pentacoxian-dev/DeepSeek-V4.1-1017-Ablitrated-Efficient (v2) | no disponible | no disponible | no disponible | base de linaje, variante c2_km1 |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que la comparación se limita a parámetros, contexto, licencia y estado de publicación.

## Limitaciones y advertencias

- Modelo explícitamente experimental y de investigación: cero descargas y cero likes en el momento de la consulta, sin validación comunitaria.
- Solo inglés declarado; no hay soporte multilingüe documentado.
- La ablación de rechazo reduce la tasa de rechazo al 2,6 %, pero el clasificador oficial HarmBench reporta un 87,5 % de ASR global: el modelo genera contenido dañino con alta frecuencia según el clasificador oficial. No es apto para despliegues públicos sin filtros externos.
- El split de copyright es el más débil del clasificador HarmBench (76,3 %), lo que implica riesgo de reproducción de material protegido.
- XSTest queda en 3,6 %, ligeramente por encima de la puerta del 3,0 % fijada por el autor.
- El tensor `layers.39.ffn.shared_experts.w2` es frágil: cualquier edición posterior puede reintroducir bucles o alterar la tasa de rechazo; el autor exige re-medir tras cada cambio.
- Riesgo de alucinación no cuantificado en la información disponible; no se han publicado evaluaciones de veracidad.
- La licencia MIT permite uso comercial, pero el estado experimental y las métricas de seguridad desaconsejan producción sin auditoría propia.
- El nombre del repositorio (v3) no coincide con la versión interna (V3.1), lo que puede generar confusión al fijar revisiones.
- Los resultados de cumplimiento en 4 niveles usan un juez distinto al grader no publicado de dealign; el 95,94 % no es comparable con su 100 %.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/moshy89/DeepSeek-V4.1-1017-Ablitrated-Efficient-v3
- Modelo base de linaje: https://huggingface.co/pentacoxian-dev/DeepSeek-V4.1-1017-Ablitrated-Efficient
- Modelo oficial base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Clasificador HarmBench: https://huggingface.co/cais/HarmBench-Llama-2-13b-cls
- Juez de cumplimiento: https://huggingface.co/cognitivecomputations/dolphin-2.9.4-llama3.1-8b

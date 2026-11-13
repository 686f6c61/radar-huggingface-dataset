# DreamBlooms/JAD-S1-7B-A1B-v0.5

## Resumen

JAD-S1-7B-A1B-v0.5 es un adaptador LoRA publicado por DreamBlooms sobre el modelo base `inclusionAI/LLaDA-MoE-7B-A1B-Instruct`, un transformer de mezcla de expertos (MoE) con 7B parámetros totales y 1B activos, entrenado con paradigma de difusión de enmascaramiento (dLLM). El adaptador convierte el modelo base en un clasificador de decisión de opción múltiple: recibe un estado, una pregunta y una lista de opciones etiquetadas con letras, y devuelve en un único forward pass una distribución normalizada de probabilidad sobre las letras disponibles. No genera texto ni requiere parseo de salida.

La propuesta es relevante porque sustituye el patrón habitual de "generar y parsear" por un readout restringido de un solo paso (single mask slot), lo que reduce latencia y elimina errores de formato en tareas de decisión estructurada. El adaptador tiene tan solo 311 MB (LoRA con r=8, alpha=16 sobre q/k/v/o/gate/up/down) y se distribuye con licencia Apache-2.0, lo que permite uso comercial.

La versión v0.5 (2026-11-13) mejora sobre v0.2 en tres suites: JevBench (83,6% frente a 83,1%), Kev (75,94% frente a 74,00%) y VitaminC-dev (84,47% frente a 69,95%), además de reducir el error de calibración esperado (ECE) de 0,0175 a 0,0130 tras aplicar un escalado de temperatura de 1,2576.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer MoE con difusión de enmascaramiento (LLaDA-MoE) |
| Parámetros totales | 7B (modelo base); adaptador LoRA de 311 MB |
| Parámetros activos | 1B (modelo base MoE) |
| Longitud de contexto | 4.096 tokens recomendados; hasta 8.192 soportados |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en, zh (evaluados); transferencia a ja reportada en evaluación |
| Licencia | Apache-2.0 (adaptador, código y documentación) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre LLaDA-MoE-7B-A1B-Instruct, un modelo de difusión de lenguaje enmascarado (dLLM) con arquitectura MoE de 7B parámetros totales y 1B activos. A diferencia de los modelos autorregresivos, LLaDA genera mediante un proceso de denoising iterativo sobre tokens enmascarados. El adaptador explota esta propiedad colocando un único slot enmascarado en la posición del asistente y leyendo directamente la distribución de probabilidad restringida a las etiquetas A–Z ofrecidas por la tarea, en un solo paso de forward.

El LoRA se entrena con r=8, alpha=16 y afecta a las proyecciones q/k/v/o/gate/up/down. Según la model card, se usaron datos públicos con licencia abierta y datos sintéticos generados para el proyecto, sin datos de investigación de uso restringido. No se detalla el número de tokens de entrenamiento ni la composición exacta del dataset. Las probabilidades se calibran con una temperatura única ajustada sobre datos held-out (T=1,2576), que reduce el ECE de 0,039 a 0,013 sin alterar la letra elegida.

## Capacidades

- Decisión de opción múltiple en un solo forward pass, con distribución normalizada sobre las etiquetas disponibles (2 a 26 opciones, A–Z; 6 recomendadas).
- Readout restringido por etiqueta: no genera texto libre ni requiere parseo de la salida.
- Cobertura de escenarios variados: aplicación de reglas con excepciones, ventanas temporales y de plazo, comparación multi-salto, puntuación y rating, clasificación de temas y etiquetas, y verificación de evidencia/afirmaciones.
- Capacidades multilingües evaluadas en inglés, chino y japonés (este último solo en evaluación, no en entrenamiento).
- Calibración de confianza integrada mediante temperatura ajustada.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Enrutamiento de decisiones en pipelines de automatización: dado un estado del sistema y un conjunto acotado de acciones posibles, el modelo devuelve la acción más probable en un único paso, lo que encaja en flujos de baja latencia donde no se puede permitir generación libre.
- Moderación y clasificación de contenido: con opciones como "permitir", "revisar" o "bloquear", el adaptador ofrece una distribución calibrada que permite fijar umbrales de confianza antes de escalar a revisión humana.
- Verificación de afirmaciones y evidencia: el modelo está evaluado en tareas de evidence/claim verification, por lo que puede usarse para clasificar si una afirmación está respaldada, contradicha o es indeterminada respecto a un contexto dado.
- Aplicación de reglas con excepciones: en dominios como seguros, cumplimiento normativo o atención al cliente, el modelo puede decidir qué cláusula o política aplica a un caso concreto a partir de un estado textual y un conjunto de opciones predefinidas.
- Comparación multi-salto y rating: útil en sistemas de puntuación automática donde se comparan varias alternativas y se debe emitir una decisión discreta con confianza asociada.
- Clasificación multilingüe en inglés y chino: el adaptador transfiere de forma razonable entre ambos idiomas, lo que permite desplegar un único modelo para decisiones en productos con audiencia en ambos mercados.
- Selección de herramienta o ruta en agentes: aunque no se documenta tool calling nativo, el patrón de decisión restringida encaja como selector de la siguiente acción entre un conjunto finito de opciones en un bucle de agente.

## Benchmarks y rendimiento

Resultados publicados en la model card. JevBench v1.2.2 consta de 231 tareas de decisión de opción múltiple, con el mismo harness, readout restringido de un paso y contexto de 4.096 tokens.

| Modelo | easy | original | hard | all |
|---|---:|---:|---:|---:|
| v0.2 | 48/48 | 68/72 | 76/111 | 192/231 (83,1%) |
| **v0.5 1x** | 48/48 | 70/72 | 75/111 | **193/231 (83,6%)** |

Comparativa de suites entre versiones:

| Métrica | v0.2 | v0.5 1x |
|---|---:|---:|
| JevBench v1.2.2 (231) | 192/231 (83,1%) | 193/231 (83,6%) |
| Kev (2.581) | 74,00% | 75,94% |
| VitaminC-dev (599) | 69,95% | 84,47% |
| Temperatura | 1,2315 | 1,2576 |
| ECE tras calibración | 0,0175 | 0,0130 |

Resultados por idioma en JevBench (231 tareas):

| Idioma | JevBench (231) |
|---|---:|
| Inglés | 193/231 (83,6%) |
| Chino | 184/231 (79,7%) |
| Japonés | 183/231 (79,2%) |

Puntos de referencia públicos sobre las mismas 231 tareas:

| Modelo | all (231) |
|---|---:|
| GPT-5.6 Luna (none) | 206/231 (89,2%) |
| Jev 1.13.0 | 200/231 (86,6%) |
| Open-Jev 27B v1.1 | 197/231 (85,3%) |
| **v0.5 1x** | **193/231 (83,6%)** |
| v0.2 | 192/231 (83,1%) |

El intervalo de confianza al 95% para 193/231 es 78,2%–87,8%. El nivel "easy" está saturado; el nivel "original" mejora de 68/72 a 70/72; el nivel "hard" permanece prácticamente igual. En Kev, la media con pesos iguales sobre sus tres suites es 76,55%.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el modelo base es MoE de 7B parámetros totales y 1B activos, por lo que en precisión completa requiere aproximadamente 14 GB solo para pesos, más overhead de activaciones y del adaptador (311 MB).
- GPU recomendadas: no especificadas en la información disponible. Por tamaño del modelo base, GPUs de 24 GB o más (RTX 4090, A100, H100) son adecuadas para inferencia en fp16/bf16.
- Cabe en GPU de consumo: probable en GPUs de 24 GB con cuantización o en bf16 ajustado; no confirmado en la documentación.
- Opciones de despliegue: PEFT + Transformers (referencia oficial con `inference.py`), con `attn_implementation="sdpa"` y `trust_remote_code=True`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para este adaptador.
- Latencia y throughput: no disponibles. La ventaja declarada es que la decisión se obtiene en un único forward pass sin generación de texto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | JevBench (231) | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| **JAD-S1-7B-A1B v0.5** | 7B totales / 1B activos + LoRA | 4.096–8.192 | 193/231 (83,6%) | Apache-2.0 | Hugging Face (adaptador) |
| Jev 1.13.0 | no disponible | no disponible | 200/231 (86,6%) | no disponible | no disponible |
| Open-Jev 27B v1.1 | 27B | no disponible | 197/231 (85,3%) | no disponible | no disponible |
| GPT-5.6 Luna (none) | no disponible | no disponible | 206/231 (89,2%) | propietaria | API |

La comparativa se limita a los puntos de referencia publicados en la propia model card sobre JevBench; no se dispone de datos de parámetros, contexto ni licencia de los modelos alternativos en la información proporcionada.

## Limitaciones y advertencias

- Solo devuelve decisiones entre opciones predefinidas (A–Z); no es un modelo generativo de texto libre.
- El rendimiento en el nivel "hard" de JevBench no mejora respecto a v0.2 (75/111 frente a 76/111), lo que sugiere dificultad con los casos más complejos.
- El intervalo de confianza de 193/231 es amplio (78,2%–87,8%), por lo que las diferencias de uno o dos puntos entre versiones deben interpretarse con cautela.
- Los idiomas evaluados son inglés y chino; el japonés solo se reporta como transferencia del modelo base, sin entrenamiento específico.
- Riesgo de alucinación en el sentido de decisiones erróneas con alta confianza: aunque el ECE es bajo (0,0130), no es cero, y la calibración depende de la temperatura ajustada sobre datos held-out.
- Sesgos conocidos: no documentados en la información disponible.
- Restricciones de licencia: Apache-2.0 permite uso comercial, modificación y redistribución del adaptador, código y documentación; el modelo base también es Apache-2.0 según la model card.
- El adaptador requiere descargar por separado el modelo base `inclusionAI/LLaDA-MoE-7B-A1B-Instruct`; el repositorio solo contiene los pesos LoRA.
- Es necesario usar `inference.py` (o replicar la reconstrucción del rotary embedding en el dispositivo destino) para reproducir las puntuaciones; sin ese paso, algunas decisiones ajustadas pueden cambiar.
- Para entradas superiores a 4.096 tokens debe activarse `--max-seq-len 8192`.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/DreamBlooms/JAD-S1-7B-A1B-v0.5
- Modelo base: https://huggingface.co/inclusionAI/LLaDA-MoE-7B-A1B-Instruct

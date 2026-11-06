# oxpuppy635/gemma-4-26B-A4B-it-SOMPOA-heresy-NVFP4

## Resumen

`oxpuppy635/gemma-4-26B-A4B-it-SOMPOA-heresy-NVFP4` es una variante "abliterated" (decensurada) del modelo multimodal `google/gemma-4-26B-A4B-it`, generada mediante la herramienta Heretic v1.2.0 de P-E-W, con las tecnicas Self-Organizing Maps (SOM) y Magnitude-Preserving Orthogonal Ablation (MPOA) activadas. El objetivo del autor es eliminar los mecanismos de rechazo del modelo original manteniendo una divergencia KL lo mas baja posible respecto al modelo base.

El resultado publicado corresponde al "Trial 62", seleccionado tras descartar configuraciones con menos rechazos (como T187 o T147) por presentar mayor divergencia KL. El autor reporta 4 rechazos sobre 104 prompts de prueba (frente a 103/104 iniciales) con una divergencia KL de 0,1240, lo que situa esta version en un punto intermedio entre agresividad y preservacion de capacidades.

El repositorio contiene pesos en safetensors con un total de 14.849.486.030 parametros (unos 14,85 mil millones), lo que sugiere que el sufijo "26B-A4B" del nombre del modelo base no coincide con el conteo real de parametros almacenados; el dato fiable es el de safetensors. El modelo hereda la licencia Apache 2.0 declarada en el repositorio, aunque el modelo base de Google remite a la licencia propia de Gemma 4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Gemma 4, transformer multimodal imagen-texto) |
| Parametros totales | 14.849.486.030 (segun safetensors) |
| Parametros activos | no disponible (el nombre sugiere MoE con A4B, pero no confirmado en la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (formato de 4 bits FP, segun el nombre del repositorio); otros formatos no disponibles |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (con license_link a la licencia de Gemma 4 de Google) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base Gemma 4 mas alla de su naturaleza multimodal (pipeline `image-text-to-text`) y la probable estructura Mixture-of-Experts sugerida por el sufijo "A4B" del nombre. El modelo derivado no ha sido reentrenado: se trata de una modificacion de pesos mediante abliteracion, una tecnica que identifica direcciones en el espacio de activaciones asociadas a comportamientos de rechazo y las proyecta ortogonalmente fuera de los pesos.

La innovacion tecnica de esta ficha es el uso combinado de Self-Organizing Maps (SOM) y Magnitude-Preserving Orthogonal Ablation (MPOA) en Heretic v1.2.0. Los parametros publicados incluyen el `direction_index` (20.83) y pesos maximos/minimos por capa para `attn.o_proj` y `mlp.down_proj`, con posiciones de peso maximo en 25.12 y 21.04 respectivamente. La seleccion del trial 62 se hizo maximizando la reduccion de rechazos sujeta a un limite de divergencia KL, siguiendo el procedimiento habitual de Heretic.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base `gemma-4-26B-A4B-it`.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`), con entrada multimodal.
- Respuestas sin mecanismos de rechazo en la mayoria de los casos evaluados (4/104 rechazos en el conjunto de prueba del autor).
- Capacidades de razonamiento y codigo del modelo base (no verificadas de forma independiente en esta version).
- Soporte multilingue presumiblemente heredado del modelo base, aunque no documentado en la informacion disponible.
- No se documenta soporte explicito de tool calling ni de agentes en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineacion y abliteracion: el modelo sirve como caso de estudio para medir el equilibrio entre reduccion de rechazos y divergencia KL, comparando los distintos trials (T62, T147, T187, T223) publicados por el autor.
- Evaluacion de robustez de filtros de seguridad: permite probar si los sistemas de moderacion externos detectan contenido que el modelo base rechazaria, usando el conjunto de 104 prompts del autor como referencia.
- Generacion creativa sin restricciones: escritura de ficcion con tematicas sensibles, donde los rechazos del modelo base resultan un obstaculo, asumiendo la responsabilidad legal del operador.
- Analisis de contenido multimodal: al heredar la pipeline `image-text-to-text`, puede emplearse para descripcion de imagenes y tareas vision-lenguaje en entornos de investigacion controlados.
- Benchmarking de tecnicas de edicion de pesos: comparacion de SOM+MPOA frente a otras tecnicas de abliteracion sobre el mismo modelo base, usando PIQA como referencia de degradacion.
- Despliegue en hardware limitado mediante cuantizacion NVFP4: el formato de 4 bits reduce el espacio de pesos respecto a los 15,6 GB del repositorio, aunque la viabilidad exacta depende del soporte del runtime.
- Experimentacion con prompts largos: el autor recomienda aumentar la longitud maxima de respuesta a 120-150 tokens para este modelo concreto, lo que resulta util en pruebas de generacion extendida.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card (PIQA):

| Benchmark | acc | acc_norm |
|---|---|---|
| PIQA Base | 0,5675 | 0,5566 |
| PIQA ARA | 0,5675 | 0,5691 |
| PIQA T62 (esta version) | 0,5680 | 0,5620 |
| PIQA T223 | 0,5615 | 0,5604 |
| PIQA T48 | 0,5620 | 0,5582 |
| PIQA T201 | 0,5560 | 0,5550 |

Metricas de abliteracion del trial seleccionado (T62):

| Metrica | Valor |
|---|---|
| Rechazos iniciales | 103/104 |
| Rechazos finales | 4/104 |
| Divergencia KL | 0,1240 |
| direction_index | 20,83 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma exacta; el repositorio ocupa 15,6 GB en safetensors, por lo que en NVFP4 (4 bits) el peso efectivo deberia reducirse sustancialmente, aunque el runtime debe soportar dicho formato.
- GPU recomendadas: no disponibles; por tamano de pesos, una GPU con 24 GB o mas (RTX 4090, A100 40 GB, H100) es un punto de partida razonable, pero no confirmado.
- Compatibilidad con GPU de consumo: probable en formato NVFP4 si el runtime lo soporta, no confirmado.
- Opciones de despliegue: transformers (libreria declarada); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| gemma-4-26B-A4B-it-SOMPOA-heresy-NVFP4 (este) | 14,85 B (safetensors) | no disponible | apache-2.0 | Abliterated con SOM+MPOA, NVFP4 |
| google/gemma-4-26B-A4B-it (base) | no disponible | no disponible | licencia Gemma 4 | Modelo original con rechazos intactos |
| Variante ARA del mismo autor | no disponible | no disponible | apache-2.0 | Comportamiento similar segun el autor, PIQA 0,5691 acc_norm |

No se dispone de informacion suficiente para comparar con alternativas de otros autores de la misma categoria.

## Limitaciones y advertencias

- La abliteracion elimina rechazos pero no garantiza la ausencia de contenido danino; el operador asume la responsabilidad legal y etica del uso.
- El autor advierte que SOM "parece tener dificultades particularmente con los disclaimers", por lo que el modelo puede generar avisos o matices no deseados; se recomienda subir la longitud maxima de respuesta a 120-150 tokens.
- Riesgo de alucinacion heredado del modelo base, no cuantificado en la informacion disponible.
- Posible degradacion de capacidades por la edicion de pesos: la divergencia KL de 0,1240 es relativamente alta frente a otros trials, lo que sugiere cierto desplazamiento respecto al comportamiento original.
- La licencia Apache 2.0 declarada en el repositorio convive con la licencia propia de Gemma 4 enlazada por el autor; conviene verificar los terminos de uso comercial del modelo base antes de desplegarlo en produccion.
- El repositorio tiene 0 descargas y 0 likes, sin validacion comunitaria; no hay garantia de calidad mas alla de las pruebas del autor.
- Idiomas soportados no documentados; el rendimiento multilingue no esta verificado.
- El conteo real de parametros (14,85 B) no coincide con el "26B" del nombre, lo que puede inducir a error al planificar recursos de hardware.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/oxpuppy635/gemma-4-26B-A4B-it-SOMPOA-heresy-NVFP4
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Coleccion Gemma 4 de Google: https://huggingface.co/collections/google/gemma-4
- Heretic (herramienta de abliteracion): https://github.com/p-e-w/heretic
- Pull request SOM+MPOA en Heretic: https://github.com/p-e-w/heretic/pull/196
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license

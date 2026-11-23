# Snapkitty/gemma-2-2b-it-ternary-gguf

## Resumen

`Snapkitty/gemma-2-2b-it-ternary-gguf` es un artefacto experimental de cuantizacion ternaria construido sobre `google/gemma-2-2b-it`. No es un modelo nuevo ni un ajuste fino: es un repack de un checkpoint ternario intermedio (publicado en el repositorio `AHMADALIPARR/ternary-shards`) que empaqueta cada grupo de 128 valores ternarios en cuatro bloques Q4_0 estandar de GGUF, manteniendo la misma escala. El resultado conserva unicamente tres valores representables por peso (-1, 0, +1 escalados) aunque el contenedor sea Q4_0. Fue publicado por el usuario Snapkitty en noviembre de 2026 y cuenta con cero descargas y cero likes en el momento de redactar esta ficha.

Su relevancia es exclusivamente metodologica: sirve para estudiar como se comporta un transformer de 2.6 mil millones de parametros cuando sus matrices se ternarizan de forma con perdida a partir de un profesor Q4_K_M desquantizado a FP16. El propio autor advierte que las pruebas de humo de lenguaje y aritmetica fallaron, por lo que el artefacto no es apto para chat fiable ni para uso en produccion. Se trata, por tanto, de material de investigacion sobre cuantizacion, carga y reproducibilidad, no de un modelo desplegable.

La arquitectura subyacente es la de Gemma 2 2B Instruct (transformer decoder-only con atencion por ventanas alternas y destilacion del profesor 27B), pero las capacidades reales del artefacto ternario estan severamente degradadas segun la propia model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 2), pesos ternarios empaquetados en bloques Q4_0 |
| Parametros totales | 2.614.341.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Gemma 2 2B IT, no verificada en este artefacto) |
| Tipos de cuantizacion | Ternaria (valores -1/0/+1) almacenada en bloques Q4_0 con escala compartida; tensores de normalizacion en FP32 |
| Idiomas soportados | no disponible (la model card no los declara; el modelo base es multilingue) |
| Licencia | Gemma Terms of Use (licencia "gemma") |
| Formato de pesos | GGUF (1.477.445.184 bytes) |

## Arquitectura y entrenamiento

El modelo base `google/gemma-2-2b-it` es un transformer decoder-only de 2.6B parametros con atencion por ventanas alternas (alternating local/global attention) y entrenamiento por destilacion desde Gemma 2 27B. Sin embargo, este artefacto no incorpora ningun entrenamiento nuevo: el autor lo declara explicitamente ("No new training was performed for this release").

El proceso de construccion fue: desquantizar un profesor Q4_K_M a FP16 (revision exacta desconocida), aplicar ternarizacion con perdida, y repaquetar cada grupo de 128 valores ternarios en cuatro bloques Q4_0 estandar con la misma escala. Los tensores de normalizacion se ensancharon de FP16 a FP32. La metadata de arquitectura y tokenizer se tomo de la cabecera publica de `bartowski/gemma-2-2b-it-GGUF`. El autor verifico que el repack GGUF coincide con el checkpoint ternario origen en los 2.614.341.888 valores de tensor, lo que confirma la fidelidad del empaquetado pero no la calidad del modelo resultante.

No se documentan datos de entrenamiento, composicion del dataset, ni fases de RLHF/DPO especificas de este artefacto (las del modelo base no se detallan en la informacion disponible).

## Capacidades

- Generacion de texto: tecnicamente el artefacto carga y emite tokens (probado en Jetson Orin con llama.cpp b3496, 26 de 27 capas offloaded), pero las pruebas de humo de saludo y aritmetica fallaron.
- Razonamiento y matematicas: no fiables segun la propia model card.
- Codigo: no evaluado; no se reclama ninguna capacidad.
- Tool calling / function calling: no disponible en este artefacto.
- Agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no verificadas; el modelo base es multilingue pero la ternarizacion con perdida degrada la calidad.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Investigacion en cuantizacion ternaria: usar el artefacto para estudiar el impacto de la ternarizacion con perdida sobre un transformer de 2.6B, comparando la perplejidad y las salidas con el modelo base FP16 y con otras cuantizaciones (Q4_0, Q4_K_M, Q8_0).
- Reproducibilidad de pipelines de conversion: el repositorio incluye `SHA256SUMS` y verifica la coincidencia bit a bit con el checkpoint ternario origen, lo que permite auditar herramientas de conversion GGUF.
- Pruebas de carga en hardware embebido: el autor lo valido en Jetson Orin con 26/27 capas offloaded, util para medir requisitos de memoria y comportamiento de llama.cpp en dispositivos de borde.
- Estudio de empaquetado Q4_0 con valores ternarios: permite analizar si el almacenamiento Q4_0 con escala compartida introduce artefactos frente a un formato ternario nativo.
- Docencia sobre cuantizacion: ejemplo practico de como una cuantizacion agresiva destruye las capacidades de un modelo instruct, con evidencia empirica de fallo en pruebas de humo.
- Benchmarking de herramientas de inferencia: comparar el rendimiento de llama.cpp b3496 y otras versiones sobre un GGUF de 1.5 GB con pesos degenerados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que "no quality or speed claim is made" y que las pruebas de humo de saludo y aritmetica fallaron.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1.5 GB para los pesos en disco; en memoria, con overhead de contexto y KV cache, del orden de 2-3 GB segun longitud de contexto y backend.
- GPU recomendadas: no se especifican; el autor solo valido en Jetson Orin (memoria unificada) con llama.cpp b3496.
- Cabe en GPU consumer: si, en cualquier GPU con al menos 2-3 GB de VRAM disponible (por ejemplo, GTX 1650, RTX 3050, RTX 4060). El tamano no es el limitante; la calidad si.
- Opciones de despliegue: llama.cpp (version b3496 probada). No se documenta compatibilidad con vLLM, TGI, Ollama ni otros backends.
- Latencia y throughput estimados: no disponibles; el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Estado |
|---|---|---|---|---|---|
| Snapkitty/gemma-2-2b-it-ternary-gguf | 2.6B | no disponible | GGUF ternario en Q4_0 | Gemma | Experimental, pruebas de humo fallidas |
| google/gemma-2-2b-it | 2.6B | 8192 tokens (modelo base) | safetensors | Gemma | Modelo instruct oficial, funcional |
| bartowski/gemma-2-2b-it-GGUF | 2.6B | 8192 tokens (heredado) | GGUF (Q2 a Q8) | Gemma | Cuantizacion estandar, funcional |
| AHMADALIPARR/ternary-shards | 2.6B | no disponible | checkpoint ternario | no disponible | Origen del artefacto, experimental |

La diferencia clave frente a las alternativas funcionales es que este artefacto no conserva la calidad del modelo base: la ternarizacion con perdida a partir de un profesor Q4_K_M (no FP16) acumula dos perdidas sucesivas (cuantizacion Q4_K_M y ternarizacion), lo que explica el fallo de las pruebas de humo.

## Limitaciones y advertencias

- Calidad degradada: las pruebas de humo de saludo y aritmetica fallaron; no es apto para chat, razonamiento ni uso en produccion.
- Doble perdida acumulada: el profesor ya era Q4_K_M (con perdida) y se ternarizo despues, por lo que la degradacion es mayor que una ternarizacion desde FP16.
- Revision del profesor desconocida: el autor no identifica la revision exacta del checkpoint Q4_K_M utilizado, lo que dificulta la reproducibilidad completa.
- Sesgos: no documentados en la informacion disponible; hereda los del modelo base pero sin evaluacion especifica.
- Riesgo de alucinacion: alto, dado el fallo de las pruebas de humo y la ausencia de evaluacion.
- Restricciones de licencia: sujeto a Gemma Terms of Use y Gemma Prohibited Use Policy; las restricciones se aplican al uso y redistribucion downstream.
- Limitaciones de contexto e idioma: no verificadas; la model card no declara idiomas soportados ni longitud de contexto efectiva tras la ternarizacion.
- Sin soporte ni mantenimiento: cero descargas, cero likes, un unico autor, sin issues documentadas; no hay garantia de compatibilidad con versiones futuras de llama.cpp.
- No usar como sustituto del modelo base: para cualquier aplicacion practica, emplear `google/gemma-2-2b-it` o una cuantizacion GGUF estandar de bartowski.

## Enlaces

- Hugging Face: https://huggingface.co/Snapkitty/gemma-2-2b-it-ternary-gguf
- Modelo base: https://huggingface.co/google/gemma-2-2b-it
- Checkpoint ternario origen: https://github.com/AHMADALIPARR/ternary-shards/tree/59b510cd85df2cd1d79832fefaa56a39422d56e3
- Metadata de arquitectura y tokenizer: https://huggingface.co/bartowski/gemma-2-2b-it-GGUF/tree/855f67caed130e1befc571b52bd181be2e858883
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy

# review-artifacts-27/Loopy-Ouro-2.6B-W4A8-G32

## Resumen

Loopy-Ouro-2.6B-W4A8-G32 es un checkpoint cuantizado derivado de ByteDance/Ouro-2.6B, un modelo de lenguaje recurrente de 2.600 millones de parametros desarrollado originalmente por ByteDance. El artefacto lo publica el usuario review-artifacts-27 bajo licencia Apache-2.0 y se distribuye como resultado de un proceso de busqueda de cuantizacion denominado Loopy, que selecciona configuraciones W4A8 (pesos de 4 bits, activaciones de 8 bits) sobre un pool de 400 candidatos.

El modelo base Ouro-2.6B emplea una arquitectura recurrente con profundidad de recurrencia T=4, lo que significa que el bloque transformer se aplica iterativamente cuatro veces sobre el estado latente. Este checkpoint concreto fija esa profundidad en T=4 y aplica una rotacion Hadamard con semilla 204066314, potencia de escalado 1.2 y tamano de bloque Hadamard de 128, con cuantizacion dinamica por token de las activaciones.

La relevancia de esta publicacion es fundamentalmente metodologica: no se trata de un modelo nuevo, sino de un artefacto de investigacion que documenta de forma exhaustiva el protocolo de cuantizacion, las metricas de referencia y los ficheros de procedencia. Resulta util para investigadores que estudien tecnicas de cuantizacion post-entrenamiento sobre modelos recurrentes y para quienes necesiten reproducir los resultados reportados. No obstante, su adopcion en produccion es limitada: el checkpoint requiere un loader propio, no usa almacenamiento INT4 empaquetado ni kernel de inferencia INT4, y la evaluacion se realiza con cuantizacion falsa en BF16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer recurrente (profundidad de recurrencia T=4) |
| Parametros totales | 2.600 millones (modelo base Ouro-2.6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (usado en la evaluacion WT2) |
| Tipos de cuantizacion | W4A8: pesos 4 bits en contenedores INT8, activaciones A8 dinamicas por token; grupo de pesos 32; rotacion Hadamard bloque 128 |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 (pesos); el codigo de investigacion se rige por `code/THIRD_PARTY_NOTICES.md` |
| Formato de pesos | `selected.pt` (state dict PyTorch con codigos INT8, escalas, zero points, escalado de entrada y signos Hadamard); no usa almacenamiento INT4 empaquetado |

## Arquitectura y entrenamiento

El modelo base Ouro-2.6B es un transformer recurrente: el mismo bloque se aplica de forma iterativa sobre el estado oculto, con una profundidad de recurrencia configurada en T=4 para este checkpoint. Esta aproximacion busca aumentar la capacidad efectiva de computo sin incrementar proporcionalmente el numero de parametros, un planteamiento cercano a los modelos de razonamiento latente. El checkpoint no introduce cambios arquitectonicos respecto al modelo base; su intervencion se limita a la cuantizacion de pesos y activaciones.

El proceso Loopy consistio en una busqueda sobre 400 candidatos de cuantizacion, de los cuales se selecciono el identificado como `s204066314_p12_b128`. Los hiperparametros fijados son: semilla de rotacion 204066314, potencia de escalado 1.2, tamano de bloque Hadamard 128, tamano de grupo de pesos 32 y cuantizacion dinamica por token de las activaciones a 8 bits. La calibracion, la busqueda y la evaluacion de calidad utilizan grupos separados de 32 ventanas fijas derivadas del split de entrenamiento de WikiText-103 (revision `b08601e04326c79dfdd32d625aee71d232d685c3` de `Salesforce/wikitext`). No se dispone de informacion sobre el volumen de tokens de entrenamiento del modelo base ni sobre si se aplicaron tecnicas de RLHF o DPO.

Una innovacion destacable del artefacto es su trazabilidad: incluye `manifest.json` con tamanos y digests SHA-256, `provenance.json` con el mapeo de hashes de metadatos originales a exportados, y registros completos por etapa de la busqueda. La evaluacion emplea cuantizacion falsa en BF16, lo que significa que las metricas reportadas no reflejan el rendimiento de un kernel INT4 real, sino la calidad numerica de los pesos cuantizados simulados.

## Capacidades

- Generacion de texto en ingles: el modelo base es un modelo de lenguaje causal entrenado para prediccion del siguiente token.
- Razonamiento de sentido comun y conocimiento general: las tareas de evaluacion reportadas (WinoGrande, ARC-C, HellaSwag, MMLU) indican competencia en comprension lectora, razonamiento cientifico basico y conocimiento enciclopedico.
- Modelado de lenguaje a nivel de documento: la metrica WT2 emplea perplejidad de palabras con ventana deslizante de 4096 tokens, lo que sugiere manejo de contextos medios.
- Razonamiento iterativo latente: la profundidad de recurrencia T=4 permite reutilizar el bloque transformer para refinamiento interno del estado oculto.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun los tags del repositorio.
- Capacidades especiales (vision, audio, thinking mode explicito): no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion en cuantizacion post-entrenamiento: el artefacto sirve como referencia reproducible para estudiar el impacto de configuraciones W4A8 con rotacion Hadamard sobre modelos recurrentes, gracias a los registros completos de busqueda y a los ficheros de procedencia incluidos.
- Reproduccion de resultados academicos: los scripts `eval_wikitext.py` y `eval_tasks.py` permiten replicar las metricas reportadas (LAMBADA, WinoGrande, ARC-C, HellaSwag, MMLU) con el loader incluido y las ventanas fijas documentadas.
- Evaluacion comparativa de tecnicas de cuantizacion: al disponer de selecciones W4A4 y W4A8 separadas, permite contrastar el efecto de la precision de activaciones sobre la calidad del modelo en las mismas ventanas de calibracion.
- Prototipado de modelos recurrentes en entornos con VRAM limitada: con 2.600 millones de parametros y pesos de 4 bits almacenados en contenedores INT8, el checkpoint reduce el espacio de almacenamiento respecto a BF16, aunque la inferencia real requiere reconstruir los pesos.
- Analisis de robustez numerica: la documentacion de escalas, zero points, signos Hadamard y escalado de entrada permite auditar como afecta cada componente de la cuantizacion a las metricas finales.
- Docencia y formacion tecnica: el repositorio ejemplifica un flujo completo de publicacion de artefactos de investigacion con protocolo congelado, manifiestos de integridad y resultados de referencia separados de las evaluaciones en vivo.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---:|
| WT2 word PPL (contexto 4096, rolling) | 10.97 |
| LAMBADA PPL | 4.46 |
| LAMBADA acc. | 68.76 |
| WinoGrande | 70.48 |
| ARC-C (acc_norm) | 56.14 |
| HellaSwag (acc_norm) | 75.94 |
| MMLU | 71.86 |
| Media de exactitud (5 tareas, pesos iguales) | 68.64 |

Las exactitudes se expresan en porcentaje. ARC-C y HellaSwag usan `acc_norm`; el resto de tareas usan `acc`. La media pondera igualmente las cinco tareas de exactitud. Los resultados corresponden a la evaluacion con cuantizacion falsa en BF16 de los pesos cuantizados, no a una inferencia con kernel INT4 real. No se han publicado en la informacion disponible resultados comparativos con otros modelos en estas mismas tareas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Como referencia, un modelo de 2.600 millones de parametros en BF16 requiere aproximadamente 5,2 GB solo para pesos, mas overhead de activaciones y cache KV; el checkpoint almacena codigos W4 en contenedores INT8, pero la evaluacion se realiza con cuantizacion falsa en BF16, por lo que el consumo efectivo se aproxima al del modelo en BF16.
- GPU recomendadas: no especificadas en la informacion proporcionada. La evaluacion documentada usa `CUDA_VISIBLE_DEVICES=0`, es decir, una unica GPU.
- Compatibilidad con GPU de consumo: previsiblemente si para modelos de 2.600 millones en BF16 en GPUs con 8-12 GB o mas, pero no se confirma en la documentacion.
- Opciones de despliegue: no se soporta `from_pretrained()` generico de Transformers; se requiere el loader propio incluido en `code/`. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| Loopy-Ouro-2.6B-W4A8-G32 | 2,6 B | 4096 | Apache-2.0 | `selected.pt` con loader propio | Checkpoint cuantizado W4A8 de investigacion |
| ByteDance/Ouro-2.6B | 2,6 B | no disponible | Apache-2.0 | pesos originales del modelo base | Modelo upstream sin cuantizar |
| Alternativas de ~2-3 B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de informacion sobre otros modelos comparables de la misma categoria (tamano similar o misma tarea de cuantizacion) en la documentacion proporcionada, por lo que la comparativa se limita al modelo base del que deriva.

## Limitaciones y advertencias

- El checkpoint no es compatible con `from_pretrained()` generico de Transformers; requiere el loader propio incluido en el repositorio. Un uso incorrecto puede producir fallos silenciosos o resultados invalidos.
- No utiliza almacenamiento INT4 empaquetado ni kernel de inferencia INT4: los codigos W4 se guardan en contenedores INT8 y la evaluacion se hace con cuantizacion falsa en BF16, de modo que las metricas reportadas no reflejan el rendimiento de un despliegue INT4 real.
- El modelo solo declara soporte de ingles; no hay evidencia de capacidades multilingues.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero es un riesgo inherente a los modelos de lenguaje de esta escala.
- Sesgos conocidos: no documentados en la model card; el modelo base puede arrastrar sesgos de sus datos de entrenamiento, no especificados.
- La licencia Apache-2.0 se aplica a los pesos; el codigo de investigacion incluido se rige por `code/THIRD_PARTY_NOTICES.md`, cuyos terminos no se detallan en la informacion disponible. Verificar antes de uso comercial del codigo.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y procede de un usuario sin historial publico verificable; conviene tratarlo como artefacto de investigacion y no como release estable.
- No se documentan limitaciones de contexto mas alla de la ventana de 4096 tokens empleada en la evaluacion.
- No hay informacion sobre latencia, throughput ni comportamiento en produccion.

## Enlaces

- [Hugging Face: review-artifacts-27/Loopy-Ouro-2.6B-W4A8-G32](https://huggingface.co/review-artifacts-27/Loopy-Ouro-2.6B-W4A8-G32)
- [Modelo base: ByteDance/Ouro-2.6B](https://huggingface.co/ByteDance/Ouro-2.6B)
- [Dataset de evaluacion: Salesforce/wikitext](https://huggingface.co/datasets/Salesforce/wikitext)
- Protocolo completo: `code/docs/protocol.md` (incluido en el repositorio)
- Avisos de terceros: `code/THIRD_PARTY_NOTICES.md` (incluido en el repositorio)

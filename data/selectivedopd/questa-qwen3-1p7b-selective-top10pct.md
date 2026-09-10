# SelectiveDOPD/QuestA-Qwen3-1p7b-Selective-Top10pct

## Resumen

QuestA-Qwen3-1p7b-Selective-Top10pct es un ajuste fino (fine-tune) subido a HuggingFace por el usuario SelectiveDOPD, construido sobre la familia Qwen3, segun indican los tags del repositorio (`qwen3`) y el propio nombre del modelo. Se trata de un modelo de generacion de texto con pipeline `text-generation` y soporte conversacional, distribuido en formato `safetensors` bajo la libreria `transformers`. El recuento real de parametros a partir de los tensores safetensors es de 2.031.739.904, lo que situa al modelo en la categoria de ~2B parametros.

El modelo procede del experimento interno identificado como `questa_qwen3_1p7b_JSD_rel_90_100` dentro de los experimentos "BiDirect-OPD". La rama `main` corresponde al checkpoint `global_step_300`, y existen ramas adicionales con checkpoints intermedios desde `global_step_20` hasta `global_step_280`. El nombre "Selective-Top10pct" sugiere algun tipo de entrenamiento o seleccion selectiva sobre el 10 % superior, aunque la model card no detalla la metodologia.

La relevancia de esta ficha es limitada en terminos de adopcion: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, no declara licencia ni idiomas soportados, y la model card es minima. Se trata, por tanto, de un artefacto de investigacion mas que de un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, familia Qwen3 (segun tags y nombre) |
| Parametros totales | 2.031.739.904 (segun safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible para este fine-tune (el modelo base Qwen3-1.7B declara 32.768 tokens nativos, extensibles con YaRN; no confirmado en este repositorio) |
| Tipos de cuantizacion | no disponible; el repositorio solo distribuye pesos `safetensors`, sin variantes GGUF/AWQ/GPTQ documentadas |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura corresponde a un transformer decoder-only denso de la familia Qwen3, heredada del modelo base Qwen3-1.7B del que parte el nombre (`Questa-Qwen3-1p7b`). No se trata de una arquitectura MoE, de estado recurrente (SSM) ni hibrida: el recuento de parametros activos coincide con los totales. El repositorio no incluye configuracion de atencion ni detalles sobre el tokenizador mas alla de los tags.

En cuanto al entrenamiento, la model card indica que el modelo fue subido desde `questa_qwen3_1p7b_JSD_rel_90_100` dentro de los experimentos "BiDirect-OPD". La rama `main` contiene el checkpoint `global_step_300`, y se listan ramas adicionales con checkpoints en los pasos 20, 40, 60, 80, 100, 120, 140, 160, 180, 200, 220, 240, 260 y 280. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, si se emplearon tecnicas de RLHF/DPO, ni el significado concreto de las siglas "OPD" o de la etiqueta "Selective-Top10pct". Toda esa informacion se considera no disponible.

## Capacidades

- Generacion de texto autoregresiva y conversacion multi-turno, segun los tags `text-generation` y `conversational`.
- Compatibilidad con `text-generation-inference` (TGI) y con endpoints compatibles, segun los tags `text-generation-inference` y `endpoints_compatible`.
- Integracion con el ecosistema `transformers` y pesos en `safetensors`.
- Capacidades especificas de razonamiento, codigo, matematicas, vision, tool calling, agentes, modo "thinking", audio o multilingueismo: no disponibles. La model card no documenta ninguna de ellas.

## Casos de uso

- Experimentacion academica con distillation/OPD: dado que el repositorio documenta una secuencia de checkpoints (`global_step_20` a `global_step_300`) procedentes de un experimento BiDirect-OPD, el modelo es adecuado para reproducir o comparar curvas de entrenamiento y evaluar el efecto de cada checkpoint en tareas de generacion.
- Evaluacion de fine-tunes sobre Qwen3-1.7B: permite comparar variantes derivadas del mismo base para estudiar como afectan distintas estrategias de seleccion ("Selective-Top10pct") al comportamiento del modelo.
- Prototipado local de generacion de texto en hardware de consumo: al tener ~2B parametros, puede ejecutarse en una GPU de gama media o incluso en CPU para pruebas rapidas de prompting.
- Generacion de texto conversacional en entornos de investigacion: util para probar plantillas de chat y formato de dialogo sobre un backbone Qwen3 pequeno.
- Benchmarking interno de pipelines de servicio: al ser compatible con TGI y endpoints compatibles, sirve para validar despliegues de infraestructura de inferencia con un modelo de bajo coste.
- Docencia y practicas de fine-tuning: su tamano (~2B) y formato `safetensors` lo hacen manejable para ejercicios de carga, inferencia y adaptacion (LoRA) en cursos o laboratorios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de 2.031.739.904 parametros): aproximadamente 4,1 GB en FP16/BF16, unos 2,1 GB en cuantizacion de 8 bits y alrededor de 1,2 GB en 4 bits (estimaciones teoricas de pesos; el overhead de activaciones y cache KV se suma aparte).
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para FP16 (por ejemplo RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A10, L4, A100, H100). Para 4 bits basta con GPUs de 4 GB o incluso menos.
- Cabe en GPU de consumo: si. Con cuantizacion a 8 o 4 bits es viable en tarjetas tipo RTX 3060, RTX 4060, RTX 2070 o superiores; en FP16 requiere al menos ~8 GB para operar con comodidad.
- Opciones de despliegue: `transformers` (nativo), `text-generation-inference` (TGI, segun tags), endpoints compatibles con la API de OpenAI (tag `endpoints_compatible`). No se documentan variantes GGUF, por lo que su uso directo en `llama.cpp` u `Ollama` requeriria conversion por parte del usuario.
- Latencia y throughput estimados: no disponibles. El repositorio no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| QuestA-Qwen3-1p7b-Selective-Top10pct | 2.031.739.904 (safetensors) | no disponible | no disponible | no disponible | HuggingFace, 0 descargas |
| Qwen3-1.7B (base) | ~1,7 B (2,03 B contando embeddings segun recuento) | 32.768 tokens nativos (extensible con YaRN) | publicado por el autor del base | Apache 2.0 (modelo base) | ampliamente disponible |
| Llama 3.2 1B | ~1,24 B | 128.000 tokens | publicado por Meta | Llama 3.2 Community License | ampliamente disponible |
| Gemma 2 2B | ~2,6 B | 8.192 tokens | publicado por Google | Gemma Terms of Use | ampliamente disponible |

Nota: los datos de las filas comparativas corresponden a informacion publica de cada modelo base y no se han verificado contra este repositorio concreto; para el modelo objeto de la ficha solo se dispone del recuento de parametros y la categoria. La comparacion de rendimiento no puede realizarse porque no hay benchmarks publicados para QuestA-Qwen3-1p7b-Selective-Top10pct.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. No se documenta el dataset de entrenamiento ni su composicion, por lo que no puede estimarse el sesgo.
- Riesgo de alucinacion: inherente a los modelos de ~2B parametros sin documentacion de alineamiento; al no declararse tecnicas de RLHF/DPO, el riesgo no puede acotarse.
- Limitaciones de contexto e idioma: la longitud de contexto efectiva de este fine-tune y los idiomas soportados no estan declarados; el modelo base Qwen3 tiene capacidad multilingue, pero no se confirma que se haya conservado.
- Restricciones de licencia: la licencia no esta disponible en el repositorio, lo que impide determinar si su uso comercial esta permitido. No debe asumirse uso comercial sin aclaracion del autor.
- Caveats para produccion: el repositorio registra 0 descargas y 0 likes, carece de model card descriptiva y solo documenta checkpoints de un experimento interno ("BiDirect-OPD", `questa_qwen3_1p7b_JSD_rel_90_100`). No se recomienda su uso en produccion sin evaluacion propia.
- Cadena de custodia: el significado de "Selective-Top10pct" y de las siglas "OPD" no se explica; no hay informacion sobre el metodo de entrenamiento ni sobre posibles datos contaminados.
- Ausencia de cuantizaciones oficiales: no hay GGUF ni formatos de bajo bit publicados, lo que obliga a convertir los pesos para desplegarlos en runtimes ligeros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SelectiveDOPD/QuestA-Qwen3-1p7b-Selective-Top10pct
- La busqueda web realizada no ha devuelto enlaces relevantes al modelo; los resultados obtenidos corresponden a entidades empresariales no relacionadas ("Veco") y no se incluyen por no ser pertinentes.

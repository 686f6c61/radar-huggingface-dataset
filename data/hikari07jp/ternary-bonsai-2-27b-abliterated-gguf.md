# Hikari07jp/Ternary-Bonsai-2-27B-Abliterated-GGUF

## Resumen

Ternary-Bonsai-2-27B-Abliterated (PQ2_0) es una compilación GGUF derivada de prism-ml/Ternary-Bonsai-2-27B-gguf, publicada por el usuario Hikari07jp el 18 de septiembre de 2026 bajo licencia Apache 2.0. Se trata de un modelo de 26.895.998.464 parámetros (26,9B) cuya característica principal es que sus pesos están almacenados en un formato ternario de 2 bits propietario (PQ2_0, 2,13 bits por peso, tipo ggml 142), con un archivo de 7.206.168.928 bytes que ocupa 7,2 GB en el repositorio.

La particularidad técnica del artefacto es que el proceso de "abliteration" (reducción de rechazos) se ha aplicado directamente sobre los códigos de 2 bits del pack cuantizado original, sin descomprimir a BF16 ni volver a cuantizar. De los 851 tensores del modelo, 400 se han modificado (únicamente los códigos de 2 bits) y los otros 451 son idénticos byte a byte al pack padre; las escalas de bloque no se han tocado. El resultado es un modelo con la misma geometría, el mismo tamano de archivo y la misma ruta de kernel que el original, lo que garantiza compatibilidad con los runtimes existentes para ese tipo de cuantización.

El modelo base del que desciende la familia es Qwen/Qwen3.8-27B, según declara el propio autor. La relevancia de esta ficha radica en dos factores: por un lado, es un ejemplo poco habitual de edición de pesos sobre una red cuantizada nativa en 2 bits, un terreno donde la mayoría de técnicas de ajuste o abliteración requieren reconstruir el modelo en precisión completa; por otro, es una publicación en estado de vista previa (v0.1) con datos de evaluación autoinformados, pensada explícitamente para que la comunidad reproduzca y refute sus resultados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el autor no detalla la arquitectura; hereda la del pack padre prism-ml/Ternary-Bonsai-2-27B-gguf, a su vez derivado de Qwen/Qwen3.8-27B) |
| Parametros totales | 26.895.998.464 (26,9B) |
| Parametros activos | no aplica / no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible; el ejemplo oficial de despliegue usa `-c 32768` |
| Tipos de cuantizacion | PQ2_0 (2,13 bits por peso, ternario, tipo ggml 142); no se ofrecen otras cuantizaciones en el repositorio |
| Idiomas soportados | no disponible (la model card incluye una nota en japones y menciona la mezcla de idiomas como posible sintoma de dano en el retículo de cuantizacion) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (7.206.168.928 bytes, 7,2 GB); no se distribuyen safetensors |

## Arquitectura y entrenamiento

El modelo no se ha entrenado desde cero: es una edición in-place del pack cuantizado `prism-ml/Ternary-Bonsai-2-27B-gguf`. El autor describe el metodo a alto nivel: se actualizaron directamente los codigos de 2 bits almacenados en el pack oficial, de modo que el artefacto distribuido *es* el pack editado, sin desquantizacion a BF16 en ningun punto del pipeline, sin hook de runtime y sin adaptador. Para definir *que* habia que cambiar se uso una referencia libre de rechazos de precision completa de la misma familia base; ese cambio se escribio despues sobre el retículo de cuantizacion existente mediante un esquema de redondeo de codigos **insesgado**, de forma que el movimiento esperado del peso coincide con la edicion pretendida aunque cada codigo individual solo pueda desplazarse en pasos enteros del retículo. La edicion se barrio en amplitud y se selecciono por comportamiento medido.

No se publican ni la extraccion de direcciones, ni la construccion de la referencia, ni el esquema de redondeo. Tampoco hay datos sobre numero de tokens de entrenamiento, composicion del dataset ni si hubo RLHF o DPO, porque no se trata de un modelo entrenado en esta publicacion. La innovacion tecnica destacable es precisamente la metodologia de edicion sobre cuantizacion nativa: 400 de los 851 tensores han sido alterados en sus codigos de 2 bits y los otros 451 permanecen byte a byte identicos, lo que convierte el resultado en un artefacto con la misma huella de memoria y la misma ruta de kernel que su padre.

## Capacidades

- Generacion de texto conversacional en formato chat, con plantilla Jinja compatible con clientes OpenAI (`/v1/chat/completions`).
- Modo de razonamiento (*thinking*) configurable mediante `reasoning_effort`, con dos modos documentados: `medium` (recomendado y donde se hicieron las mediciones) y `xhigh` (valor por defecto de la plantilla, pero mas debil en esta compilacion).
- Matematicas: en el banco ejecutado por el autor, 10/10 en medium, identico al pack padre.
- Generacion de codigo: 19/20 en el banco ejecutado en medium, identico al pack padre.
- Uso de herramientas (*tool calling*): 15/15 en el banco ejecutado en medium, sin cambios respecto al padre.
- Comportamiento agente de dos pasos: 5/5 en el banco ejecutado en medium, sin cambios respecto al padre.
- Clasificacion y tareas cortas de un solo disparo: GSM8K-30 greedy 27/30 y SST-2-30 greedy 29/30.
- Reduccion drastica de rechazos: 0/40 rechazos en la sonda de contenido danino en medium, frente a 37/40 del pack padre.
- Capacidades multimodales, de audio o de vision: no disponibles / no declaradas.

## Casos de uso

- **Investigacion sobre alineacion y abliteracion**: el modelo permite estudiar como se comporta una edicion de pesos aplicada directamente sobre un retículo ternario de 2 bits, comparando item a item contra el pack padre con la misma configuracion de decodificacion. Es util porque el autor publica el sha256, el recuento de tensores modificados y los agregados en `metrics.json`.
- **Evaluacion de tecnicas de cuantizacion extrema**: sirve como caso de prueba de si una red de 2,13 bits por peso conserva razonamiento, codigo y uso de herramientas tras una edicion no trivial, con bancos ejecutados de 10 problemas de matematicas, 20 de codigo, 15 de herramientas y 5 de agente de dos pasos.
- **Despliegue local en GPU de consumo**: con 7,2 GB de pesos, puede ejecutarse integramente en una GPU de 12 GB o en memoria unificada de un equipo Apple Silicon, usando `llama-server` con `-ngl 999 -fa on -c 32768`.
- **Procesamiento por lotes offline en CPU**: para tareas de generacion no interactivas (resumen, extraccion, clasificacion) donde la latencia no es critica, el modelo cabe en RAM de un servidor modesto gracias a su tamano de archivo reducido.
- **Prototipado de agentes con tool calling**: los 15/15 en el banco de herramientas y los 5/5 en el banco agente sugieren que puede integrarse como planificador en pipelines que invocan funciones externas, siempre que se valide el comportamiento multi-turno por cuenta del integrador.
- **Pruebas de robustez y red-teaming**: dado que el rechazo se reduce a 0/40 en medium, el modelo puede emplearse como sujeto de pruebas para medir la eficacia de filtros, clasificadores de salida o capas de moderacion externas.
- **Analisis comparativo de seguridad en modelos abliterated**: permite contrastar la degradacion de capacidades (GSM8K 27 vs 28 de 30; SST-2 29 vs 29 de 30) frente a la ganancia en cumplimiento, como caso de estudio cuantificado.
- **Base para experimentos de post-procesado lingueistico**: la advertencia del autor sobre mezcla de idiomas y texto repetido lo convierte en un buen banco de pruebas para detectores de dano en el retículo de cuantizacion.

## Benchmarks y rendimiento

Los unicos datos disponibles son los del arnes propio del autor (etiquetador estricto, decodificacion greedy, runtime PrismML). No hay resultados publicados de MMLU, HumanEval, GSM8K completo ni otros benchmarks estandar. "Refusal" cuenta rechazos planos y respuestas de rechazo con giro posterior; "comply" es cumplimiento sustantivo.

| Instrumento (medium salvo indicacion) | Pack padre | Este modelo |
|---|---|---|
| Sonda danina n40, rechazos | 37/40 | 0/40 |
| Sonda danina n40, cumplimiento sustantivo | 3 | 37 |
| Sonda "hardest-stubborn" n25, rechazos | 25/25 | 0/25 |
| xhigh, sonda danina n40, rechazos | 25/40 | 1/40 |
| xhigh, sonda danina n40, cumplimiento sustantivo | 13 | 21 (16 respuestas vacias) |
| Matematicas (ejecutado) | 10/10 | 10/10 |
| Codigo (ejecutado) | 19/20 | 19/20 |
| Herramientas (ejecutado) | 15/15 | 15/15 |
| Agente de dos pasos (ejecutado) | 5/5 | 5/5 |
| GSM8K-30, un disparo, greedy | 28/30 | 27/30 |
| SST-2-30, un disparo, greedy | 29/30 | 29/30 |
| Sonda inofensiva n20 | 11 sustantivas, 7 superficiales | 14 sustantivas, 5 superficiales, 1 vacia |

## Requisitos de hardware

- Peso del archivo: 7,2 GB, por lo que el modelo entra sin problema en GPUs de consumo con 12 GB o mas de VRAM.
- Estimacion orientativa de VRAM en inferencia (pesos + cache KV + overhead del runtime): aproximadamente 9-13 GB para contextos de 8k a 32k tokens. El calculo exacto de la cache KV no es verificable porque no se publica la geometria de atencion del modelo.
- GPUs recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 / 4070 Ti Super, RTX 4080 y RTX 4090 24 GB; en el ambito profesional, L4 24 GB, A10G 24 GB, y A100 o H100 si se necesita servir muchas peticiones concurrentes. Usar A100 o H100 para una sola secuencia seria un desperdicio de recursos.
- Apple Silicon: viable con memoria unificada de 16 GB o superior mediante Metal.
- Solo CPU: posible con llama.cpp, pero no se publican cifras de tokens por segundo.
- Opciones de despliegue: llama-server / llama.cpp (ruta oficial y unica verificada por el autor), llama-cpp-python, Ollama, LM Studio y KoboldCpp a partir del GGUF. vLLM y TGI no soportan de forma conocida el tipo ggml 142 ternario, por lo que no estan confirmados.
- Configuracion de referencia del autor: `-ngl 999 -fa on -c 32768 --jinja --temp 1.0 --top-p 0.95 --top-k 20 --chat-template-kwargs '{"reasoning_effort": "medium"}'`.
- Latencia y throughput: no disponibles. El autor advierte ademas que en modo xhigh, con un presupuesto de 2500 tokens, 16 de 40 respuestas quedaron vacias por agotamiento del razonamiento; conviene subir `max_tokens` o usar medium.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion / tamano | Contexto | Comportamiento | Licencia |
|---|---|---|---|---|---|
| Hikari07jp/Ternary-Bonsai-2-27B-Abliterated-GGUF | 26,9B | PQ2_0 ternario, 2,13 bpw, 7,21 GB | no disponible (ejemplo a 32k) | 0/40 rechazos en medium; GSM8K-30 27/30; SST-2-30 29/30 | apache-2.0 |
| prism-ml/Ternary-Bonsai-2-27B-gguf (padre) | 26,9B | PQ2_0 ternario, 2,13 bpw, 7,21 GB | no disponible | 37/40 rechazos en medium; GSM8K-30 28/30; SST-2-30 29/30 | no disponible en la informacion proporcionada |
| Qwen/Qwen3.8-27B (base ascendente) | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada |

No hay disponibles en la informacion proporcionada otros modelos comparables de la misma categoria (abliteraciones de 2 bits o cuantizaciones ternarias de ~27B) con datos verificables.

## Limitaciones y advertencias

- **Modelo con seguridad reducida**: el rechazo esta practicamente eliminado en modo medium (0/40). El autor lo declara destinado a investigacion y uso local sin censura. Para cualquier despliegue en produccion con usuarios finales hay que anadir capas de moderacion externas y revisar las obligaciones legales aplicables (por ejemplo, las derivadas del reglamento europeo de IA).
- **El modo xhigh, que es el valor por defecto de la plantilla, es el mas debil**: aunque el rechazo baja a 1/40, 16 de 40 respuestas volvieron vacias al agotarse el presupuesto de 2500 tokens en el arnes del autor. Hay que pedir explicitamente `reasoning_effort: medium` o ampliar `max_tokens`.
- **Evaluacion limitada y autoinformada**: el banco de capacidades es pequeno (10 de matematicas, 20 de codigo, 15 de herramientas, 5 de agente de dos pasos) y es una puerta de un solo turno; no se midio robustez multi-turno. Los numeros provienen del arnes del propio autor, sin replicacion independiente.
- **Estado de vista previa (v0.1)**: no es una version final. El autor pide informes de regresiones y de posibles casos de rechazo persistente en otros idiomas, encuadres y conjuntos de prompts.
- **Riesgo de dano en el retículo de cuantizacion**: al editar codigos de 2 bits en lugar de pesos en precision completa, pueden aparecer sintomas como texto repetido, mezcla de idiomas o fluidez degradada. El autor los lista explicitamente como cosas a vigilar.
- **Metodologia no publicada**: no se detallan la extraccion de direcciones, la construccion de la referencia ni el esquema de redondeo, lo que limita la reproducibilidad del proceso (no del artefacto, cuyo sha256 si se publica).
- **Riesgo de alucinacion**: no cuantificado en la informacion disponible; no hay evaluaciones de veracidad ni de calibracion.
- **Idiomas**: no se declaran los idiomas soportados. Existe una nota en japones y una advertencia sobre mezcla de idiomas, pero no hay evaluacion multilingue.
- **Restricciones de licencia**: el artefacto se publica como apache-2.0, pero la licencia del pack padre y del modelo base ascendente no se detalla en la informacion disponible; conviene verificar la cadena completa antes de un uso comercial.
- **Repositorio con 0 descargas**: el modelo no tiene uso registrado, por lo que no existe evidencia externa de funcionamiento mas alla de la facilitada por el autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Hikari07jp/Ternary-Bonsai-2-27B-Abliterated-GGUF
- Pack padre: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Modelo base ascendente declarado: https://huggingface.co/Qwen/Qwen3.8-27B
- No se han encontrado en la busqueda web enlaces relevantes al modelo (papers, blogs, repositorios o demos): los resultados devueltos no guardan relacion con el contenido de esta ficha.

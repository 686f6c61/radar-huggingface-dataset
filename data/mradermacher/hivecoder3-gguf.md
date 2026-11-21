# mradermacher/HiveCoder3-GGUF

## Resumen

HiveCoder3-GGUF es la distribucion en formato GGUF del modelo HiveCoder3, desarrollado por The AI Learner (repositorio base `theailearner/HiveCoder3`) y cuantizado por mradermacher. Se trata de un modelo de lenguaje de aproximadamente 27.320 millones de parametros (27,3B) orientado a tareas de codigo y flujos agenticos, construido sobre la arquitectura de la familia Qwen3 segun las etiquetas del autor. La version GGUF permite ejecutar el modelo en hardware de consumo y en entornos con llama.cpp, ampliando su accesibilidad mas alla de la inferencia en GPU de datacenter.

El modelo se distribuye con las etiquetas `abliterated` y `uncensored`, lo que indica que se ha aplicado una tecnica de ablacion de direcciones de rechazo para eliminar los comportamientos de negativa del modelo alineado original. Esto lo hace adecuado para entornos de investigacion y para aplicaciones donde se requiere un control estricto del comportamiento sin rechazos por defecto, pero implica riesgos adicionales de seguridad y sesgo que deben gestionarse en produccion. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones significativas.

La relevancia actual del modelo radica en su combinacion de tamano moderado (27B), vocacion de codigo y agentes, y disponibilidad en cuantizaciones que van desde 11 GB (Q2_K) hasta 29,1 GB (Q8_0), lo que permite desplegarlo desde estaciones de trabajo con una sola GPU consumer hasta servidores con multiples aceleradores. El repositorio incluye ademas un proyector multimodal (`mmproj`) que sugiere capacidades de vision, aunque la informacion disponible no detalla su alcance.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3, segun etiquetas del autor) |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en (ingles; no se detallan otros) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de las etiquetas del autor, que identifican el modelo como perteneciente a la familia Qwen3. Se trata por tanto de un transformer decoder-only de 27,3B parametros, sin indicios de que sea un modelo de mezcla de expertos (MoE), dado que no se declaran parametros activos distintos de los totales. El modelo base es `theailearner/HiveCoder3`, y esta version es una cuantizacion estatica realizada por mradermacher con `convert_type: hf` y `output_tensor_quantised: 1`.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o RL para codigo. La etiqueta `abliterated` indica que se ha aplicado una ablacion de la direccion de rechazo en el espacio de activaciones, una tecnica que modifica los pesos para eliminar el comportamiento de negativa aprendido durante el alineamiento. La presencia de un proyector multimodal (`mmproj`) en el repositorio sugiere que el modelo base incorpora o soporta entrada de imagenes, aunque no se especifica el mecanismo ni los datos de entrenamiento multimodal.

## Capacidades

- Generacion de texto y codigo en ingles, con orientacion a tareas de programacion segun la nomenclatura del modelo (HiveCoder).
- Comportamiento `uncensored` y `abliterated`: el modelo no aplica los rechazos tipicos del alineamiento original, lo que permite generar contenido que el modelo base rechazaria.
- Soporte multimodal potencial: el repositorio incluye proyectores `mmproj-Q8_0` y `mmproj-f16`, lo que indica capacidad de procesar imagenes junto con texto, aunque no se detalla su alcance.
- Orientacion agentica: las etiquetas `agenticbees` y `hivecoder` sugieren un entrenamiento orientado a flujos de agentes y uso de herramientas, aunque no se confirma explicitamente el soporte de tool calling.
- Conversacional: el pipeline declarado es `conversational`, lo que indica formato de chat multi-turno.
- Capacidades multilingues: solo se declara ingles (`en`); no hay evidencia de soporte de otros idiomas.
- Modo de razonamiento extendido: no disponible en la informacion proporcionada.

## Casos de uso

- Generacion de codigo en produccion: el modelo puede integrarse en pipelines de CI/CD para autocompletar, refactorizar o generar tests, con la ventaja de su tamano de 27B que permite ejecutarlo en una sola GPU con cuantizacion Q4_K_M (16,9 GB) y obtener latencias aceptables para tareas por lotes.
- Asistente de programacion local y privado: al distribuirse en GGUF y con licencia Apache 2.0, puede desplegarse en estaciones de trabajo sin conexion a internet, lo que resulta adecuado para entornos con requisitos de confidencialidad del codigo.
- Investigacion sobre alineamiento y seguridad: al ser un modelo `abliterated`, sirve como objeto de estudio para analizar como la ablacion afecta a la utilidad, el sesgo y la tasa de rechazo en comparacion con el modelo alineado original.
- Agentes autonomos de codigo: las etiquetas `agenticbees` sugieren un uso previsto en sistemas multiagente; el modelo puede emplearse como generador de planes y acciones en bucles de razonamiento multi-paso, siempre que se valide externamente el soporte de tool calling.
- Procesamiento de documentacion tecnica con imagenes: gracias a los proyectores multimodales incluidos, puede emplearse para extraer informacion de diagramas, capturas de pantalla o documentacion escaneada y generar codigo o explicaciones a partir de ellas.
- Generacion de contenido sin restricciones para investigacion creativa: en entornos controlados, el caracter `uncensored` permite explorar generacion de texto tecnico sin los rechazos del alineamiento, util para estudiar sesgos o para tareas de redaccion tecnica que el modelo base bloquearia.
- Fine-tuning y destilacion: al estar disponible en safetensors (modelo base) y GGUF, puede servir como punto de partida para ajuste fino con LoRA en tareas de codigo especificas del dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto, aproximada):
  - Q2_K: ~11 GB de pesos; requiere al menos 12-14 GB de VRAM para contexto corto.
  - Q4_K_M: ~16,9 GB de pesos; requiere ~18-20 GB de VRAM para contexto moderado.
  - Q5_K_M: ~19,6 GB de pesos; requiere ~21-23 GB de VRAM.
  - Q6_K: ~22,5 GB de pesos; requiere ~24-26 GB de VRAM.
  - Q8_0: ~29,1 GB de pesos; requiere ~31-33 GB de VRAM.
- GPU recomendadas:
  - Q4_K_M y Q5_K_M: RTX 4090 (24 GB) o RTX 3090 (24 GB) con contexto limitado.
  - Q6_K y Q8_0: A100 40 GB, H100 80 GB o dos GPU consumer de 24 GB.
  - Q2_K y Q3_K: RTX 4080 (16 GB) o RTX 4070 Ti Super (16 GB) con contexto reducido.
- Cabe en GPU consumer: si, en modelos con 16 GB o mas de VRAM usando cuantizaciones Q2_K a Q4_K_S; en 24 GB caben Q4_K_M y Q5_K_M con margen para contexto.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, llama-cpp-python, y servidores compatibles con la API de endpoints (`endpoints_compatible`). Para el modelo base en safetensors, vLLM o TGI si el modelo base es compatible.
- Latencia y throughput: no disponibles en la informacion proporcionada. Como referencia orientativa no verificada, un modelo de 27B en Q4_K_M en una RTX 4090 suele generar del orden de 20-40 tokens/s, pero este dato no procede de la informacion facilitada y debe medirse en el hardware concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| HiveCoder3-GGUF | 27,3B | no disponible | Apache 2.0 | GGUF | Abliterated, uncensored, orientado a codigo y agentes |
| Qwen3-32B (referencia de familia) | 32,8B | no disponible en esta ficha | Apache 2.0 | safetensors, GGUF | Modelo base de la familia; alineado y con benchmarks publicos |
| Qwen2.5-Coder-32B | 32,8B | 131.072 tokens | Apache 2.0 | safetensors, GGUF | Especializado en codigo, con benchmarks publicos de HumanEval y similares |

La comparativa se ofrece a nivel de categoria y familia; no se dispone de datos de rendimiento de HiveCoder3 que permitan una comparacion cuantitativa directa con estas alternativas.

## Limitaciones y advertencias

- Al ser un modelo `abliterated` y `uncensored`, carece de las salvaguardas del alineamiento original: puede generar contenido toxico, sesgado o inseguro sin filtros, lo que exige moderacion externa en cualquier despliegue de produccion.
- Riesgo elevado de alucinacion en tareas de codigo y tecnicas, especialmente en cuantizaciones bajas (Q2_K, Q3_K_S), donde la perdida de precision degrada la calidad.
- Solo se declara soporte de ingles; el rendimiento en castellano no esta verificado y probablemente sea inferior.
- No se dispone de la longitud de contexto oficial, lo que impide planificar aplicaciones que dependan de ventanas largas sin una validacion empirica previa.
- No hay benchmarks publicados en la informacion disponible, por lo que no puede confirmarse su calidad relativa frente a modelos de codigo establecidos.
- La licencia Apache 2.0 permite uso comercial, pero el caracter uncensored traslada al integrador toda la responsabilidad legal y etica sobre el contenido generado.
- El repositorio ocupa 190,8 GB e incluye multiples cuantizaciones y proyectores multimodales; conviene descargar solo el archivo necesario para evitar consumo innecesario de almacenamiento.
- La fecha de creacion indicada (2026-11-07) es posterior a la fecha actual de redaccion de esta ficha y debe tratarse con cautela; verificar la procedencia y autenticidad del repositorio antes de usarlo en produccion.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/HiveCoder3-GGUF
- Modelo base: https://huggingface.co/theailearner/HiveCoder3
- Cuantizaciones ponderadas/imatrix: https://huggingface.co/mradermacher/HiveCoder3-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#HiveCoder3-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos del cuantizador: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/

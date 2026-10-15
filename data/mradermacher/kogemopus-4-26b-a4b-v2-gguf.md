# mradermacher/KoGemopus-4-26B-A4B-v2-GGUF

## Resumen

KoGemopus-4-26B-A4B-v2-GGUF es la version cuantizada en formato GGUF del modelo jiwon9703/KoGemopus-4-26B-A4B-v2, publicada por el usuario mradermacher. No se trata de un modelo entrenado desde cero, sino de una conversion a GGUF pensada para inferencia local con llama.cpp, Ollama o LM Studio, manteniendo la licencia Apache 2.0 del modelo original.

El modelo base es un ajuste fino de tipo SFT de la familia Gemma 4 de Google DeepMind, orientado principalmente al coreano (ko) con soporte de ingles (en), y con etiquetas que indican capacidades de razonamiento (reasoning) y formato conversacional. Por el nombre "Gemopus" y por referencias cruzadas en la busqueda web, se trata de un destilado de trazas de razonamiento de Claude Opus sobre una base Gemma 4.

La relevancia de esta ficha radica en que ofrece una via practica para desplegar un modelo de 25.233.142.046 parametros totales (~25,2 B) con arquitectura de mezcla de expertos (MoE) y solo unos 4 B de parametros activos por token (designacion A4B), lo que reduce de forma notable el coste de inferencia respecto a un modelo denso del mismo tamano. El repositorio GGUF ocupa 184,9 GB en total, con variantes desde Q2_K (10,7 GB) hasta Q8_0 (27,0 GB), e incluye ficheros mmproj que apuntan a soporte de entrada multimodal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con mezcla de expertos (MoE), familia Gemma 4 |
| Parametros totales | 25.233.142.046 (~25,2 B) |
| Parametros activos | ~4 B (designacion A4B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mas mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | coreano (ko), ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only con mezcla de expertos (MoE), heredada de la familia Gemma 4 de Google DeepMind, segun la etiqueta `gemma4` del repositorio. El modelo totaliza 25.233.142.046 parametros, pero solo activa aproximadamente 4 B por token, lo que lo situa en la categoria de MoE de activacion dispersa. Esta configuracion permite almacenar mas conocimiento en los expertos inactivos sin pagar el coste computacional completo en cada paso de decodificacion.

En cuanto al entrenamiento, las etiquetas `sft` y `reasoning` indican que el modelo base recibio un ajuste supervisado orientado a tareas de razonamiento, y el nombre del proyecto (Gemopus) junto con los resultados de busqueda web sugieren una destilacion de trazas de Claude Opus sobre la base Gemma 4. El foco linguistico es el coreano, con el ingles como idioma secundario. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron fases de RLHF o DPO posteriores al SFT. Esta publicacion concreta no anade entrenamiento alguno: es una cuantizacion estatica del modelo original, sin informacion publica sobre el pipeline de calibracion mas alla de los tipos de cuantizacion listados.

## Capacidades

- Generacion de texto conversacional en coreano e ingles, con formato de chat multi-turno.
- Razonamiento paso a paso, segun la etiqueta `reasoning` del modelo base.
- Capacidades heredadas de la familia Gemma 4, cuya documentacion publica describe tareas de codigo, matematicas y comprension lectora, aunque no se confirman resultados concretos para este ajuste.
- Entrada multimodal probable: el repositorio incluye ficheros `mmproj-Q8_0` y `mmproj-f16`, que en llama.cpp se emplean como proyector para entrada de imagenes.
- Soporte de tool calling o function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion proporcionada.
- Idiomas distintos de coreano e ingles: no disponible.

## Casos de uso

- Atencion al cliente en coreano: el modelo puede gestionar conversaciones multi-turno en coreano con un coste de inferencia bajo gracias a sus ~4 B de parametros activos, lo que permite desplegarlo en una GPU de 24 GB con cuantizacion Q4_K_M.
- Traduccion coreano-ingles: dado el soporte bilingue declarado, encaja en flujos de traduccion tecnica o de producto donde no se requiere un modelo multilingue amplio.
- Asistente local de escritorio: con Q4_K_S (15,6 GB) o Q4_K_M (16,9 GB) puede ejecutarse en una RTX 4090 o RTX 3090 mediante llama.cpp u Ollama, sin dependencia de APIs externas.
- Razonamiento asistido en coreano: tareas de analisis, resumen o resolucion de problemas donde las trazas de razonamiento destiladas de Claude Opus aportan valor sobre una base Gemma 4 convencional.
- Procesamiento de documentos con imagen (si se confirma el soporte multimodal): los ficheros mmproj permitirian pasar imagenes junto al texto en llama.cpp para tareas de OCR o descripcion.
- Prototipado e investigacion: al estar bajo Apache 2.0, es apto para experimentacion academica y para evaluar el comportamiento de un MoE de 25 B con activacion de 4 B frente a alternativas densas.
- Despliegue en hardware limitado: la variante Q2_K (10,7 GB) permite ejecutar el modelo en GPUs de 12 GB como la RTX 3060, con la perdida de calidad asociada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada por cuantizacion (solo pesos, sin cache KV):
  - Q2_K: 10,7 GB.
  - Q3_K_S: 12,3 GB; Q3_K_M: 13,4 GB; Q3_K_L: 13,9 GB.
  - IQ4_XS: 14,2 GB; Q4_K_S: 15,6 GB; Q4_K_M: 16,9 GB.
  - Q5_K_S: 18,1 GB; Q5_K_M: 19,2 GB.
  - Q6_K: 22,7 GB.
  - Q8_0: 27,0 GB.
  - Proyector multimodal: mmproj-Q8_0 0,9 GB; mmproj-f16 1,3 GB.
- GPU recomendadas:
  - RTX 3060 12 GB y similares: Q2_K y, con margen escaso, Q3_K_S.
  - RTX 3090 / 4090 (24 GB): Q4_K_S, Q4_K_M, Q5_K_M y Q6_K, con contexto moderado.
  - A100 40 GB / H100 / V100 32 GB: Q8_0 y contextos largos.
  - Dos GPU de 24 GB en paralelo: Q8_0 con contexto amplio o Q6_K con batches grandes.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB (Q2_K), RTX 4070/4080 16 GB (hasta IQ4_XS) y RTX 3090/4090 24 GB (hasta Q6_K).
- Opciones de despliegue: llama.cpp, llama.cpp server, Ollama, LM Studio y cualquier runtime compatible con GGUF. Para vLLM o TGI seria preferible partir del modelo base en safetensors.
- Latencia y throughput estimados: no disponible. Cabe esperar una velocidad de generacion relativamente alta frente a un denso de 25 B, dado que solo se activan ~4 B de parametros por token, pero no hay mediciones publicadas en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| KoGemopus-4-26B-A4B-v2-GGUF | 25,2 B | ~4 B | no disponible | apache-2.0 | GGUF |
| jiwon9703/KoGemopus-4-26B-A4B-v2 (base) | 25,2 B | ~4 B | no disponible | apache-2.0 | safetensors |
| Gemma 4 26B MoE (familia base) | no disponible | no disponible | no disponible | apache-2.0 | safetensors / GGUF |
| Qwen3-30B-A3B | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada |

No se dispone de datos verificados de rendimiento ni de contexto para establecer una comparacion cuantitativa fiable con alternativas de la misma categoria.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. Al estar especializado en coreano, es probable que refleje sesgos de los corpus coreanos utilizados en el ajuste, pero no hay documentacion al respecto.
- Riesgo de alucinacion: inherente a los modelos generativos; sin benchmarks publicados no puede cuantificarse su tasa de error en tareas factuales.
- Limitaciones de idioma: solo se declaran coreano e ingles. El rendimiento en castellano u otros idiomas no esta garantizado.
- Limitacion de contexto: la longitud de contexto no se especifica en la informacion disponible; conviene verificarla antes de usos con documentos largos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo es una cuantizacion derivada de un ajuste fino sobre Gemma 4, por lo que deben respetarse las condiciones de la familia Gemma de Google en la cadena de dependencias.
- Cuantizaciones agresivas: Q2_K y Q3_K_M (marcada como "lower quality" por el propio autor) degradan la calidad de forma perceptible; para produccion se recomienda Q4_K_M o superior.
- Repositorio con muy poca traccion: 103 descargas y 0 likes en el momento de la consulta, lo que implica escasa validacion comunitaria independiente.
- Modelo cuantizado, no original: las incidencias de calidad pueden provenir del proceso de cuantizacion y no del modelo base; conviene contrastar contra el repositorio original antes de atribuir fallos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/KoGemopus-4-26B-A4B-v2-GGUF
- Ficheros del repositorio: https://huggingface.co/mradermacher/KoGemopus-4-26B-A4B-v2-GGUF/tree/main
- Modelo base: https://huggingface.co/jiwon9703/KoGemopus-4-26B-A4B-v2
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/KoGemopus-4-26B-A4B-v2-i1-GGUF
- Listado de modelos del cuantizador: https://hf.tst.eu/model#KoGemopus-4-26B-A4B-v2-GGUF
- Preguntas frecuentes y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de referencia sobre GGUF de TheBloke: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Nethype GmbH: https://www.nethype.de/
- Ficha de terceros: https://free2aitools.com/model/mradermacher/kogemopus-4-26b-a4b-v2-gguf
- Guia de la familia Gemma 4: https://aurigait.com/blog/gemma-4-features-benchmarks-guide/

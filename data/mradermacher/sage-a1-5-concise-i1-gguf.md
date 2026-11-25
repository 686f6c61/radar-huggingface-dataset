# mradermacher/Sage-A1.5-Concise-i1-GGUF

## Resumen

Sage-A1.5-Concise-i1-GGUF es una coleccion de cuantizaciones GGUF generadas por mradermacher a partir del modelo base TheFusionCube/Sage-A1.5-Concise, un modelo de lenguaje de arquitectura Mixture-of-Experts (MoE) orientado a razonamiento eficiente y entrenado mediante aprendizaje por refuerzo. El modelo base cuenta con 35.505.251.456 parametros totales (segun los safetensors publicados) y esta etiquetado con las categorias moe, reasoning, efficient-reasoning y reinforcement-learning, lo que indica un diseno centrado en producir cadenas de razonamiento de forma economica en computo.

Este repositorio concreto no contiene los pesos originales en precision completa, sino versiones cuantizadas en formato GGUF con tecnicas de imatrix (importance matrix) y cuantizacion i1 (de un solo tensor de salida), pensadas para ejecucion local con llama.cpp y derivados. La model card indica que el modelo base es multimodal (vision), aunque los ficheros mmproj, si existen, se alojan en el repositorio estatico hermano. La licencia es Apache 2.0 y el idioma declarado es unicamente ingles.

Su relevancia practica radica en que permite desplegar un modelo MoE de ~35.5B parametros en hardware de consumo mediante cuantizaciones que van desde ~13 GB (Q2_K) hasta ~29 GB (Q6_K), manteniendo el comportamiento de razonamiento del modelo original. Es, por tanto, una via de acceso para desarrolladores que quieran evaluar el modelo base sin necesidad de infraestructura de datacenter.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) tipo transformer, segun tags del modelo base |
| Parametros totales | 35.505.251.456 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (mas fichero imatrix) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizado); pesos originales del modelo base en safetensors |
| Tamano del repo | 279,4 GB |
| Modelo base | TheFusionCube/Sage-A1.5-Concise |
| Cuantizador | mradermacher (quants ponderados con imatrix) |
| Compatibilidad de endpoints | endpoints_compatible |

## Arquitectura y entrenamiento

El modelo base Sage-A1.5-Concise es un transformer con capas Mixture-of-Experts, segun las etiquetas declaradas por el autor (moe). El pipeline registrado es reinforcement-learning, y las etiquetas incluyen reasoning, efficient-reasoning y reinforcement-learning, lo que sugiere un entrenamiento orientado a mejorar la calidad del razonamiento con un coste computacional reducido (posiblemente mediante tecnicas de RL sobre cadenas de razonamiento concisas). No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset ni la presencia de RLHF o DPO en la informacion proporcionada.

Este repositorio en particular no entrena ningun modelo: aplica cuantizacion de pesos con matrices de importancia (imatrix) generadas a partir del modelo base, usando el esquema i1 de llama.cpp (cuantizacion de un unico tensor de salida). La model card menciona que el modelo base es de vision, por lo que las cuantizaciones podrian requerir ficheros mmproj adicionales alojados en el repositorio estatico hermano (Sage-A1.5-Concise-GGUF). No se documentan innovaciones como decodificacion especulativa o atencion lineal en la informacion disponible.

## Capacidades

- Generacion de texto y razonamiento: el modelo esta etiquetado como reasoning y efficient-reasoning, orientado a producir cadenas de razonamiento concisas.
- Razonamiento eficiente: el enfasis en efficient-reasoning sugiere un diseno para reducir el coste de tokens de pensamiento.
- Capacidades multimodales: la model card indica que el modelo base es de vision; los ficheros mmproj, si existen, estarian en el repositorio estatico.
- Conversacion multi-turno: etiqueta conversational.
- Aprendizaje por refuerzo: pipeline reinforcement-learning declarado.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible explicitamente; el tag reasoning sugiere capacidad, pero no se documenta.
- Capacidades multilingues: solo ingles declarado.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Evaluacion local de razonamiento: desplegar la cuantizacion i1-Q4_K_M (~21,8 GB) en una estacion de trabajo con 24 GB de VRAM para comparar la calidad de razonamiento del modelo base frente a alternativas MoE sin necesidad de infraestructura cloud.
- Asistentes conversacionales en ingles: usar la variante i1-Q4_K_S (~20,5 GB) con llama.cpp para prototipar chatbots multi-turno en entornos con GPU de consumo, aprovechando la etiqueta conversational.
- Investigacion en razonamiento eficiente: emplear el modelo como referencia para estudiar el trade-off entre longitud de cadena de razonamiento y precision, dado el enfasis del modelo base en efficient-reasoning.
- Pruebas de cuantizacion comparativa: el repositorio incluye desde Q2_K hasta Q6_K, lo que permite medir la degradacion de calidad por nivel de cuantizacion en un modelo MoE de ~35.5B parametros.
- Despliegue en servidores con CPU y GPU mixtas: las variantes Q4_0 y Q4_K_S (~20 GB) permiten offloading parcial de capas a CPU en maquinas sin GPU de gran VRAM.
- Analisis de vision (si se usa el mmproj del repositorio estatico): el modelo base es multimodal, por lo que con los ficheros mmproj correspondientes podria procesar imagenes junto a texto, aunque esta capacidad no esta documentada en este repositorio.
- Fine-tuning posterior sobre GGUF: no recomendado directamente; para ajuste se usarian los pesos safetensors del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (segun tamano de fichero GGUF, mas overhead de contexto y KV cache):
  - i1-Q2_K: ~13,3 GB
  - i1-IQ3_M / i1-IQ3_S: ~15,7-15,9 GB
  - i1-Q3_K_M: ~17,3 GB
  - i1-IQ4_XS: ~19,3 GB
  - i1-Q4_K_S: ~20,5 GB
  - i1-Q4_K_M: ~21,8 GB
  - i1-Q5_K_M: ~25,4 GB
  - i1-Q6_K: ~29,3 GB
- GPU recomendadas:
  - RTX 4090 (24 GB): cabe hasta i1-Q4_K_M (~21,8 GB) con contexto moderado; i1-Q5_K_M requiere offloading parcial.
  - RTX 3090 (24 GB): mismo escenario que la 4090.
  - A100 40 GB / H100 80 GB: caben todas las cuantizaciones, incluida Q6_K, con contexto amplio.
  - GPU de 16 GB: solo caben Q2_K e IQ3_S con contexto limitado u offloading.
- Cabe en GPU de consumo: si, en RTX 4090/3090 con Q4_K_M o inferior; en GPUs de 16 GB solo con cuantizaciones bajas u offloading a CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. Al ser un modelo MoE, el rendimiento en llama.cpp depende del numero de expertos activos por token (no disponible).
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo base ni de modelos comparables en la informacion proporcionada para establecer una comparativa cuantitativa fiable. A continuacion se ofrece una comparativa estructural limitada a los datos disponibles:

| Modelo | Parametros totales | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Sage-A1.5-Concise (este repo, GGUF) | 35,5B (MoE) | no disponible | Apache 2.0 | GGUF | Solo ingles; orientado a razonamiento eficiente |
| Modelo base TheFusionCube/Sage-A1.5-Concise | 35,5B (MoE) | no disponible | Apache 2.0 | safetensors | Pesos originales; multimodal segun model card |
| Alternativas MoE de tamano similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion proporcionada; al ser un modelo entrenado predominantemente en ingles, es probable que presente sesgos culturales y linguisticos propios de ese corpus.
- Riesgo de alucinacion: no cuantificado; los modelos de razonamiento con cadenas de pensamiento pueden generar razonamientos plausibles pero incorrectos.
- Limitaciones de idioma: solo se declara ingles (en); el rendimiento en castellano u otros idiomas no esta garantizado.
- Limitaciones de contexto: la longitud de contexto no esta disponible; no debe asumirse una ventana larga sin verificacion empirica.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar la licencia y los terminos del modelo base TheFusionCube/Sage-A1.5-Concise antes de desplegar en produccion.
- Cuantizacion: las variantes Q2_K y Q3_K_S degradan la calidad; para produccion se recomienda Q4_K_M o superior.
- Vision: si se requiere la capacidad multimodal, es necesario descargar los ficheros mmproj del repositorio estatico hermano, no incluidos aqui.
- Parametros activos desconocidos: al ser MoE, el coste real de inferencia depende de los expertos activados por token, dato no publicado; las estimaciones de VRAM basadas en tamano de fichero son orientativas.
- Repositorio de gran tamano (279,4 GB): la descarga completa es costosa; conviene descargar unicamente la cuantizacion necesaria.

## Enlaces

- Repositorio Hugging Face (este modelo): https://huggingface.co/mradermacher/Sage-A1.5-Concise-i1-GGUF
- Modelo base: https://huggingface.co/TheFusionCube/Sage-A1.5-Concise
- Cuantizaciones estaticas (incluye mmproj si existe): https://huggingface.co/mradermacher/Sage-A1.5-Concise-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Sage-A1.5-Concise-i1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests

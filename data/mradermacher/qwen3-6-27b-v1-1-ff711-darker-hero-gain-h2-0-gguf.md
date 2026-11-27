# mradermacher/Qwen3.6-27B-V1.1-FF711-Darker-Hero-GAIN-H2.0-GGUF

## Resumen

Qwen3.6-27B-V1.1-FF711-Darker-Hero-GAIN-H2.0-GGUF es una cuantizacion estatica en formato GGUF del modelo DavidAU/Qwen3.6-27B-V1.1-FF711-Darker-Hero-GAIN-H2.0, un fine-tune de la familia Qwen3.6 de 27.320.697.856 parametros. El trabajo de cuantizacion lo firma mradermacher, un publicador habitual de versiones GGUF de modelos open source, y distribuye el modelo en 13 variantes de cuantizacion que van desde Q2_K (11,0 GB) hasta Q8_0 (29,1 GB), ademas de dos ficheros mmproj para el componente multimodal.

El modelo base es un tune multicapa ("multi-stage tuned", "multi-state-merge") orientado a usos creativos y de rol, con etiquetas que declaran explicitamente caracter heretico, abliterated y uncensored, y entrenado sobre los datasets DavidAU/Polar-STRICT-Datasets y DavidAU/F451-STRICT-Datasets. Incorpora modo thinking/razonamiento y esta marcado como "not-for-all-audiences", lo que condiciona su uso en produccion.

La relevancia de esta ficha es practica: permite ejecutar un modelo de 27B en hardware de consumo mediante cuantizacion GGUF, con opciones que caben en GPUs de 24 GB (Q4_K_M, 16,9 GB) e incluso en configuraciones mas ajustadas con Q2_K o Q3_K. La licencia declarada es Apache 2.0, aunque las restricciones derivadas de su naturaleza abliterated y de contenido para adultos deben evaluarse antes de cualquier despliegue comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.6); detalles internos no disponibles |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj Q8_0 y f16 |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizado); base en bfloat16 |

## Arquitectura y entrenamiento

El modelo base es un transformer de 27.320.697.856 parametros derivado de la familia Qwen3.6, afinado por DavidAU mediante un proceso descrito como "multi-stage tuned" y "multi-state-merge", es decir, una combinacion de ajuste fino en varias etapas y fusion de estados. El autor declara el uso de los datasets DavidAU/Polar-STRICT-Datasets y DavidAU/F451-STRICT-Datasets, sin que se detalle en la informacion disponible el numero de tokens, la composicion exacta del corpus ni si hubo fases de RLHF o DPO.

Entre las tecnicas aplicadas se mencionan explicitamente el abliteration (eliminacion de direcciones de rechazo en el espacio de activaciones) y el etiquetado "heretic", orientados a reducir las negativas del modelo ante contenido sensible. Tambien se declara soporte de modo thinking/razonamiento. No se dispone de informacion sobre innovaciones arquitectonicas adicionales como atencion lineal, decodificacion especulativa o capas hibridas. Esta publicacion concreta es una cuantizacion estatica del modelo base, sin reentrenamiento: mradermacher aplica los algoritmos de cuantizacion de llama.cpp sobre los pesos originales en bfloat16.

## Capacidades

- Generacion de texto generalista, con enfasis declarado en "all use cases".
- Razonamiento y modo thinking explicito.
- Generacion de codigo (etiqueta "coder").
- Escritura creativa: ficcion, relato, todos los generos y roleplaying.
- Conversacion multi-turno (pipeline conversacional).
- Capacidades multimodales: el repositorio incluye ficheros mmproj Q8_0 y f16, lo que indica soporte de entrada visual en el modelo base.
- Multilingue limitado a ingles y chino segun la model card.
- Contenido sin censura (abliterated/uncensored), incluido material para adultos.
- Tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.

## Casos de uso

- Escritura creativa y narrativa larga: el modelo esta afinado especificamente para ficcion y todos los generos, por lo que resulta adecuado para generar relatos, dialogos y tramas con coherencia estilistica; la cuantizacion Q6_K o Q8_0 preserva mejor el registro literario.
- Roleplaying y simulacion de personajes: las etiquetas de multi-stage tune y su orientacion conversacional permiten mantener personajes consistentes en sesiones largas; conviene usar Q4_K_M o superior para evitar degradacion del tono.
- Generacion de codigo en local: la etiqueta "coder" y el tamaNo de 27B permiten asistencia de programacion en estaciones de trabajo sin GPU de datacenter, con Q4_K_M (16,9 GB) como compromiso entre calidad y VRAM.
- Razonamiento con modo thinking: para tareas de analisis, matematicas o descomposicion de problemas donde se quiere traza de razonamiento explicita, activando el modo thinking del modelo base.
- Procesamiento de documentos con componente visual: los ficheros mmproj permiten alimentar imagenes junto con texto en llama.cpp, util para extraccion de informacion de capturas, diagramas o documentos escaneados.
- Experimentacion en investigacion sobre alineacion y abliteration: el modelo es un caso de estudio util para medir como el abliteration afecta a la tasa de rechazo, la utilidad y los sesgos, comparandolo con el Qwen3.6 original.
- Despliegue en hardware de consumo: con Q2_K (11,0 GB) o Q3_K_M (13,6 GB) se puede ejecutar en GPUs de 12-16 GB, lo que habilita prototipos locales de asistentes conversacionales sin infraestructura cloud.
- Generacion de contenido para adultos en entornos controlados: su naturaleza uncensored lo hace apto para plataformas de ficcion adulta que requieran este tipo de material, siempre con las salvaguardas legales y de moderacion adecuadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto, aproximada):
  - Q2_K: ~11,0 GB de pesos; ~12-13 GB con contexto moderado.
  - Q3_K_M: ~13,6 GB; ~15 GB con contexto.
  - IQ4_XS: ~15,5 GB; ~17 GB con contexto.
  - Q4_K_M: ~16,9 GB; ~18-19 GB con contexto.
  - Q5_K_M: ~19,6 GB; ~21 GB con contexto.
  - Q6_K: ~22,5 GB; ~24 GB con contexto.
  - Q8_0: ~29,1 GB; requiere 32 GB o mas.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M a Q6_K; RTX 3090 (24 GB) para Q4_K_M; A100 40/80 GB o H100 para Q8_0 y despliegues concurrentes; RTX 4080/4070 Ti Super (16 GB) para Q3_K_M o IQ4_XS.
- Cabe en GPU de consumo: si, en RTX 4090/3090 con Q4_K_M o Q5_K_M; en GPUs de 16 GB con Q3_K_M o IQ4_XS; en GPUs de 12 GB solo con Q2_K y contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y servidores compatibles con GGUF; el repositorio incluye quants i1 (imatrix) en una publicacion separada para mayor calidad por bit.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.6-27B-V1.1-FF711-Darker-Hero-GAIN-H2.0-GGUF (este) | 27,3B | no disponible | Apache 2.0 | GGUF | Fine-tune creativo, abliterated, multimodal via mmproj |
| DavidAU/Qwen3.6-27B-V1.1-FF711-Darker-Hero-GAIN-H2.0 (base) | 27,3B | no disponible | Apache 2.0 | safetensors (bfloat16) | Modelo original sin cuantizar; requiere ~55 GB en bf16 |
| Qwen3.6-27B (original de la familia) | ~27B | no disponible | no disponible | safetensors/GGUF | Referencia sin abliteration; comportamiento alineado estandar |
| Cuantizaciones i1 de mradermacher del mismo modelo | 27,3B | no disponible | Apache 2.0 | GGUF (imatrix) | Mayor calidad por bit a igual tamano; publicacion separada |

No se dispone de datos de rendimiento comparativo (benchmarks) en la informacion proporcionada para establecer diferencias cuantitativas con alternativas.

## Limitaciones y advertencias

- Modelo abliterated y uncensored: se ha eliminado deliberadamente parte de los mecanismos de rechazo, por lo que puede generar contenido ofensivo, ilegal o danino sin filtros; no es apto para aplicaciones orientadas al publico general sin moderacion externa.
- Etiqueta "not-for-all-audiences": el modelo esta disenado para contenido adulto y puede producir material sexual explicito o violento.
- Riesgo de alucinacion: como todo modelo de lenguaje de su escala, puede inventar hechos, citas y referencias; no se han publicado evaluaciones de factualidad.
- Sesgos conocidos: no documentados en la informacion disponible; los sesgos del corpus de entrenamiento y del proceso de abliteration pueden amplificar respuestas estereotipadas o polarizadas.
- Idiomas: solo se declaran ingles y chino; el rendimiento en castellano no esta garantizado ni evaluado.
- Contexto: la longitud de contexto no se especifica en la model card; conviene verificar el valor real en la configuracion del modelo base antes de disenar flujos con ventanas largas.
- Licencia: se declara Apache 2.0, pero el uso comercial de un modelo abliterated puede entrar en conflicto con las politicas de plataformas de despliegue y con la legislacion sobre contenido; requiere revision legal.
- Cuantizacion: las variantes Q2_K y Q3_K_S degradan notablemente la calidad; para produccion se recomienda Q4_K_M o superior.
- Repositorio grande (190,8 GB) y 205 descargas: ecosistema pequeno, poca validacion comunitaria y sin resultados de benchmarks publicados.
- Procedencia: es una cuantizacion de terceros de un fine-tune de terceros sobre un modelo base de terceros; la trazabilidad de datos de entrenamiento es limitada.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.6-27B-V1.1-FF711-Darker-Hero-GAIN-H2.0-GGUF
- Modelo base: https://huggingface.co/DavidAU/Qwen3.6-27B-V1.1-FF711-Darker-Hero-GAIN-H2.0
- Cuantizaciones i1 (imatrix): https://huggingface.co/mradermacher/Qwen3.6-27B-V1.1-FF711-Darker-Hero-GAIN-H2.0-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Qwen3.6-27B-V1.1-FF711-Darker-Hero-GAIN-H2.0-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de calidad de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Dataset Polar-STRICT: https://huggingface.co/datasets/DavidAU/Polar-STRICT-Datasets
- Dataset F451-STRICT: https://huggingface.co/datasets/DavidAU/F451-STRICT-Datasets

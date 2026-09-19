# Davd-b01/qwen3.8-flash-next-40b-prune-research

## Resumen

Davd-b01/qwen3.8-flash-next-40b-prune-research es el registro técnico completo de un experimento de poda quirúrgica de expertos sobre Qwen/Qwen3.8-Flash-Next, un MoE de clase ~180B (unos 130B de red principal, 51B de tabla de memoria n-gram y 4B de cabeza MTP). El autor reduce el número de expertos de 512 a 128 (una eliminación del 75 %) conservando 40.668.780.656 parámetros totales, y publica tanto el artefacto de investigación (metodología de máscaras, código de cirugía, cuaderno de laboratorio) como los pesos resultantes, identificados con el código de linaje `S6-K128-P4` y el nombre de evaluación `qwen-3.8-next-40b-exp-v6-rlvr-final`.

El modelo es un MoE híbrido etiquetado como "qwen4_exp": 36 capas Gated DeltaNet más 12 capas de atención dispersa, 128 expertos enrutados con top-10 por token y capa, un experto compartido, Hyper-Connections, memoria factual externa tipo PLE (n-gram), torre de visión y cabeza MTP preservadas. Tras la poda, el autor aplica un post-entrenamiento en tres etapas (SFT, SimPO y RLVR) con DoRA, con un presupuesto declarado de unos 300 dólares de GPU alquilada en 9 días. La licencia es Apache-2.0 y los idiomas declarados son inglés, chino y español.

Su relevancia es doble. Por un lado, es un caso documentado de que eliminar el 75 % de la masa de expertos no destruye el modelo: el daño es selectivo y cartografiable (sobreviven gramática, estructura del código y uso de herramientas; se degradan el recuerdo factual y la aritmética). Por otro, el propio autor publica resultados de benchmarks malos (GPQA Diamond 0,2778, MATH-500 0,178, IFEval prompt-level 0,3734, LiveCodeBench v6 0,1555) y atribuye la causa a la poda agresiva, a errores propios en el *heal*/finetune y, como sospechoso no ablacionado, al método "Thinking Cap". Es, por tanto, un artefacto de investigación honesto antes que un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrido "qwen4_exp": 36 capas Gated DeltaNet + 12 capas de atención dispersa, 128 expertos enrutados (top-10 por token y capa), experto compartido, Hyper-Connections, memoria factual n-gram externa (PLE), torre de visión y cabeza MTP |
| Parametros totales | 40.668.780.656 (40,7B) |
| Parametros activos | no disponible (configuración documentada: top-10 sobre 128 expertos enrutados más un experto compartido; el recuento exacto de parámetros activos no se publica) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos en safetensors; no se documentan artefactos GGUF, AWQ, GPTQ ni similares) |
| Idiomas soportados | en, zh, es |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tamaño del repositorio: 280,2 GB) |
| Modelo base | Qwen/Qwen3.8-Flash-Next (finetune) |
| Codigo de linaje | S6-K128-P4 (`qwen-3.8-next-40b-exp-v6-rlvr-final`) |
| Libreria declarada | transformers (la model card indica `inference: false`) |
| Fecha de publicacion | 19 de septiembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura de partida es un MoE híbrido en el que conviven dos mecanismos de secuencia: 36 capas Gated DeltaNet y 12 capas de atención dispersa, con 128 expertos enrutados y activación top-10 por token y capa, más un experto compartido siempre activo. El autor señala tres propiedades que hacen de este modelo un buen sujeto de experimentación: solo alrededor del 2 % de los expertos del modelo original (10 de 512) se activan por token y capa; los routers que toman todas las decisiones suman 15,7 M de parámetros (0,039 % de la red); y cerca de un tercio del modelo original era una tabla de consulta (memoria almacenada, no cómputo). De ahí una observación clave del informe: recortar el 75 % de los expertos ahorra memoria, no FLOPs, porque evaluar 10 expertos de 128 cuesta lo mismo por token que evaluar 10 de 512.

El proceso de poda parte de máscaras generadas en seis generaciones, con instrumentación de activaciones y una cirugía que el autor describe como bit-exacta, seguida de la reconstrucción de la memoria factual (PLE, n-gram) y de un post-entrenamiento en tres etapas: SFT, SimPO y RLVR, con DoRA entre las técnicas empleadas. Los conjuntos de datos asociados son Davd-b01/thinking-cap-tier-raw-traces, Davd-b01/thinking-cap-tier-curricula-complete y Davd-b01/thinking-cap-tier-lima-dense. La innovación metodológica central que se declara es el formato de pensamiento "Thinking Cap" por niveles, por el que pasan todas las trazas de entrenamiento; el propio autor lo identifica como el principal sospechoso no ablacionado de la degradación observada. El registro documenta explícitamente errores de proceso, entre ellos una primera máscara estadísticamente aleatoria, una memoria factual que cargó ruido aleatorio durante las etapas intermedias del linaje y un conjunto de datos de SimPO que estructuralmente no podía aprender.

## Capacidades

- Generación de texto y redacción estructurada: es la capacidad que el autor califica como genuinamente buena; la prosa de razonamiento es organizada, formal y autocorrectiva.
- Razonamiento en formato "thinking": las trazas pasan por el formato Thinking Cap con niveles de pensamiento (thinking-tiers), aunque su efecto no se ha ablacionado.
- Generación de código: produce código válido a nivel estructural, con un rendimiento medido bajo en problemas algorítmicos (LiveCodeBench v6 pass@1 de 0,1555 con n=16).
- Llamada a herramientas (tool calling): despacho canónico de herramientas, según la model card.
- Comportamiento conversacional: el autor indica que el modelo argumenta cuando se le afirma algo falso.
- Capacidades multimodales: las etiquetas del repositorio incluyen `image-text-to-text` y la arquitectura conserva la torre de visión; no se documentan detalles de evaluación multimodal.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad verificada; el uso de herramientas está declarado, pero no hay evaluación de flujos agénticos.
- Memoria factual externa: mantiene un mecanismo PLE (tabla n-gram) reconstruido durante el proceso, aunque el recuerdo factual es precisamente el área más degradada.
- Multilingüismo: inglés, chino y español declarados; el autor describe el resto de idiomas como cola larga sacrificada deliberadamente.

## Casos de uso

- Investigación en poda de expertos en MoE: el repositorio es un registro reproducible de metodología de máscaras, cirugía de expertos y evaluación del daño. Es adecuado porque documenta tanto los aciertos como los errores de proceso (§5 del informe) y ofrece puntos de comparación explícitos para una v2 con máscara K=192.
- Estudio de currículos de razonamiento por niveles: los tres conjuntos de datos thinking-cap-tier permiten analizar cómo afecta un formato de pensamiento estructurado al resultado de un post-entrenamiento SFT + SimPO + RLVR, incluida la hipótesis de que ese formato introduce artefactos de medición.
- Generación de texto técnico y documentación: la redacción estructurada y autocorrectiva es la capacidad mejor conservada tras la poda, por lo que encaja en tareas de redacción de documentación, resúmenes y plantillas donde no se exija exactitud factual estricta.
- Prototipado de enrutado de herramientas: el modelo despacha llamadas a herramientas de forma canónica, lo que permite usarlo en pruebas de concepto de pipelines con function calling, siempre que se verifique la corrección del resultado y no solo el formato.
- Generación de esqueletos de código y refactorización estructural: dado que la estructura del código sobrevive a la poda pero el rendimiento algorítmico medido es bajo (0,1555 en LiveCodeBench v6), el uso razonable es la producción de andamiaje, firmas y organización de módulos, con revisión humana posterior.
- Evaluación de mecanismos de memoria n-gram (PLE): la reconstrucción de la tabla factual es parte central del experimento y sirve como banco de pruebas para medir cuánta información factual reside en memoria externa frente a parámetros.
- Comparación de metodologías de alineación en modelos degradados: con un modelo cuyo techo es bajo, SimPO y RLVR se pueden estudiar en el régimen donde las mejoras de preferencia no quedan enmascaradas por el conocimiento previo.
- Docencia y divulgación sobre costes reales de entrenamiento: el informe cuantifica el proyecto completo (9 días, ~730 GB, 17 repositorios consolidados, unos 300 dólares), lo que sirve como referencia de orden de magnitud para proyectos de posgrado o laboratorios pequeños.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index de la model card (ninguno marcado como verificado):

| Benchmark | Tarea | Metrica | Resultado | Configuracion |
|---|---|---|---|---|
| GPQA Diamond | multiple-choice | accuracy | 0,2778 (27,78 %) | temperatura 0,7; top_p 0,95; zero-shot sin 4-shot |
| IFEval | constrained-generation | instruction-level strict accuracy | 0,4856 (48,56 %) | no disponible |
| IFEval | constrained-generation | prompt-level strict accuracy | 0,3734 (37,34 %) | no disponible |
| MATH-500 | text-generation | exact match | 0,178 (17,8 %) | no disponible |
| LiveCodeBench v6 | text-generation | pass@1 (n=16) | 0,1555 (15,55 %) | no disponible |

El propio autor califica estos resultados como malos y sitúa GPQA Diamond en el entorno del azar (0,2778 frente a 0,25 con cuatro opciones). No se han publicado en la informacion disponible resultados del modelo base Qwen3.8-Flash-Next ni de alternativas comparables, por lo que no es posible establecer una comparación cuantitativa del coste de la poda.

## Requisitos de hardware

Las cifras de VRAM siguientes son estimaciones derivadas del recuento de parametros publicados (40,668.780.656), no datos facilitados por el autor; el repositorio no documenta requisitos de despliegue.

- VRAM estimada para pesos (solo pesos, sin caché KV ni activaciones): ~81,3 GB en fp16/bf16; ~40,7 GB en int8; ~20,3 GB en 4 bits.
- Nota sobre MoE: al tratarse de un modelo con 128 expertos enrutados, todos los expertos deben residir en memoria, aunque solo se activen 10 por token y capa. El autor subraya que el recorte de expertos reduce memoria, no cómputo por token.
- Repositorio completo: 280,2 GB en safetensors, lo que sugiere la presencia de varios puntos de control o formatos; conviene verificar qué ficheros son necesarios antes de descargar.
- GPU recomendadas: A100 80 GB o H100 80 GB para fp16/bf16 con margen limitado por la caché KV; para fp16 sin margen, múltiples A100/H100 80 GB.
- GPU de consumo: una RTX 4090 (24 GB) no admite los pesos en fp16; encajaría únicamente con una cuantización de 4 bits no documentada en el repositorio.
- Opciones de despliegue: la librería declarada es transformers y la model card indica `inference: false`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI en la informacion disponible; una arquitectura híbrida con Gated DeltaNet y atención dispersa puede requerir kernels específicos.
- Latencia y throughput: no disponible. Tampoco se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos alternativos en la informacion proporcionada, por lo que la comparación se limita a características estructurales.

| Modelo | Parametros | Expertos | Contexto | Licencia | Benchmarks |
|---|---|---|---|---|---|
| Davd-b01/qwen3.8-flash-next-40b-prune-research | 40,7B | 128 enrutados (top-10) + compartido | no disponible | apache-2.0 | GPQA 0,2778; IFEval prompt-level 0,3734; MATH-500 0,178; LCB v6 0,1555 |
| Qwen/Qwen3.8-Flash-Next (base) | clase ~180B (130B red + 51B n-gram + 4B MTP) | 512 enrutados | no disponible | no disponible | no disponible |
| Modelos MoE de ~40B con licencia Apache-2.0 | no disponible | no disponible | no disponible | no disponible | no disponible |

El experimento no completó los controles que permitirían atribuir el daño: según el informe, ni la comparación con el modelo original sin podar ni la comparación con un denso de 27B llegaron a terminarse por agotamiento del presupuesto.

## Limitaciones y advertencias

- Rendimiento débil y declarado como tal por el autor: GPQA Diamond en el entorno del azar (0,2778), MATH-500 en 0,178, LiveCodeBench v6 en 0,1555 e IFEval prompt-level en 0,3734. No es un modelo apto para tareas que exijan exactitud factual o aritmética fiable.
- El recuerdo factual es el área más dañada por la poda; la memoria n-gram (PLE) se reconstruyó, pero durante etapas intermedias del entrenamiento cargó ruido aleatorio según el propio registro.
- Sacrificio deliberado de la cola larga: idiomas poco frecuentes, dominios de nicho y áreas completas de especialidad se perdieron de forma intencionada. Solo se declaran en, zh y es.
- Sesgos conocidos: no disponible. El informe no incluye una evaluación de sesgos.
- Riesgo de alucinación: elevado en conocimiento factual, coherente con las puntuaciones publicadas; el modelo puede producir texto bien formado y a la vez incorrecto.
- Atribución de causas no resuelta: el autor reparte la responsabilidad entre la poda agresiva, errores propios de *heal*/finetune, el método Thinking Cap (sospechoso no ablacionado) y artefactos de medición (parsers de formato, respuestas vacías por agotamiento de presupuesto). Los experimentos de control quedaron sin terminar.
- La model card declara `inference: false`, lo que indica que el repositorio no está preparado para inferencia directa con la librería transformers tal cual; hay que verificar los pesos campeones, que según el autor viven en repositorios hermanos.
- Licencia Apache-2.0 en el derivado, lo que en principio permite uso comercial; conviene comprobar por separado la licencia del modelo base Qwen/Qwen3.8-Flash-Next, no disponible en la informacion proporcionada.
- Estado de publicación: 0 descargas y 1 like en el momento de la consulta, con fecha de creación y última actualización del 19 de septiembre de 2026. No hay validación independiente de los resultados declarados, que figuran como no verificados.
- No se documentan cuantizaciones, contexto máximo ni requisitos de hardware, lo que dificulta planificar un despliegue en producción.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Davd-b01/qwen3.8-flash-next-40b-prune-research
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Data set de trazas: https://huggingface.co/datasets/Davd-b01/thinking-cap-tier-raw-traces
- Data set de currículos: https://huggingface.co/datasets/Davd-b01/thinking-cap-tier-curricula-complete
- Data set de destilación densa: https://huggingface.co/datasets/Davd-b01/thinking-cap-tier-lima-dense
- Referencias arXiv citadas en las etiquetas del repositorio: 2609.11029, 2308.01825, 2402.14800, 2510.13999, 2609.04575, 2609.04453, 2401.06066, 2412.19437, 2110.01786, 2509.10377, 2607.11444, 2607.16721, 2608.21693, 2608.15299, 2607.20427, 2402.03300, 2310.05914, 2402.09353, 2409.19606, 2406.11717 (los títulos no están disponibles en la informacion proporcionada)
- Enlaces promocionales incluidos en la model card: https://ko-fi.com/davdb01 y https://runpod.io?ref=ssakdva8
- Nota sobre la búsqueda web: los resultados obtenidos corresponden a páginas de ayuda de YouTube y no guardan relación con el modelo; no se han encontrado enlaces adicionales relevantes (papers, blogs, repositorios o demos) en la informacion disponible.

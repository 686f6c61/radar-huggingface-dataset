# mradermacher/Flint-40B-A2.5B-abliterated-i1-GGUF

## Resumen

Flint-40B-A2.5B-abliterated-i1-GGUF es una colección de cuantizaciones GGUF con matriz de importancia (imatrix, quants "i1") del modelo Flint-40B-A2.5B-abliterated, preparada por mradermacher, un cuantizador muy activo de la comunidad de Hugging Face. El modelo base es una versión "abliterated" (con los mecanismos de rechazo de seguridad neutralizados mediante intervención en los pesos) de Flint-40B-A2.5B, un modelo de arquitectura MoE (mixture of experts) con 39,79 mil millones de parámetros totales y unos 2,5 mil millones de parámetros activos por token, orientado según sus etiquetas a código y ciberseguridad.

La relevancia de esta ficha radica en la combinación de tres factores: una arquitectura MoE con solo 2,5B de parámetros activos, que permite inferencia rápida en hardware de consumo pese al tamaño total; el proceso de abliteración, que elimina los rechazos de seguridad del modelo original; y la amplia gama de cuantizaciones disponibles, desde IQ1_S (8,3 GB) hasta Q6_K (32,8 GB). Esto lo hace apto para investigación en seguridad ofensiva, análisis de malware y generación de código sin filtros, siempre bajo responsabilidad del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts), tipo transformer |
| Parametros totales | 39.785.287.456 (~39,8B) |
| Parametros activos | ~2,5B por token (A2.5B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (todas imatrix/i1) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base esta en safetensors |

## Arquitectura y entrenamiento

El modelo base, Flint-40B-A2.5B, es un transformer de tipo mixture of experts con aproximadamente 39,8 mil millones de parametros totales, de los cuales solo unos 2,5 mil millones se activan por token. Esta configuracion permite obtener la capacidad de un modelo de gran tamano con el coste de inferencia de uno mucho menor, ya que por cada token solo se procesan los expertos activos. No se ha publicado informacion sobre el numero de expertos, la granularidad, los datos de entrenamiento ni los procesos de post-entrenamiento (RLHF/DPO) en la documentacion disponible.

La version "abliterated" (dima6312/Flint-40B-A2.5B-abliterated) fue creada aplicando una tecnica de abliteracion que modifica los pesos para suprimir las direcciones de activacion responsables de los rechazos de seguridad. Segun los metadatos, se emplearon los datasets mlabonne/harmful_behaviors y mlabonne/harmless_alpaca en el proceso. Por su parte, esta coleccion de mradermacher consiste en cuantizaciones GGUF con matriz de importancia (imatrix), que estiman la relevancia de cada peso sobre datos de calibracion para minimizar la perdida de calidad en cuants agresivos; los quants IQ de ikawrakow suelen superar a los K-quants de tamano equivalente.

## Capacidades

- Generacion de texto conversacional (tag "conversational" en el repositorio).
- Generacion y comprension de codigo (tag "code" del modelo base).
- Orientacion a tareas de ciberseguridad (tag "cybersecurity" del modelo base).
- Modelo sin filtros de seguridad (abliterated/uncensored): responde a peticiones que otros modelos rechazarian.
- Inferencia eficiente gracias a la arquitectura MoE: solo ~2,5B de parametros activos por token.
- Compatibilidad con el ecosistema GGUF (llama.cpp, Ollama, LM Studio, etc.).
- No hay informacion disponible sobre tool calling, capacidades agenticas, vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Investigacion en ciberseguridad ofensiva: analisis de exploits, tecnicas de evasion y red teaming, donde los filtros de seguridad de modelos convencionales impiden el trabajo; la abliteracion permite razonar sobre estos temas sin rechazos.
- Analisis de malware y vulnerabilidades: el modelo puede describir, comentar y explicar codigo malicioso o payloads para informes de analisis forense, algo que los modelos alineados suelen bloquear.
- Generacion de codigo sin restricciones: escritura, refactorizacion y explicacion de codigo, incluidos fragmentos que los modelos alineados rechazan; con solo 2,5B de parametros activos, la latencia por token es baja y resulta viable en estaciones de trabajo locales.
- Entornos aislados (air-gapped): al ejecutarse localmente con GGUF, puede desplegarse en laboratorios sin conexion a internet, requisito habitual en auditorias de seguridad.
- Investigacion sobre alineacion y seguridad de LLM: estudio de como la abliteracion afecta al comportamiento del modelo, util para equipos que investigan jailbreaks y robustez de alineacion.
- Prototipado local de chatbots: el formato conversacional y el rango de cuantizaciones permiten probar el modelo en portatiles y GPUs de consumo antes de escalar a hardware mayor.
- Ejecucion en hardware modesto: cuants como i1-IQ3_M (17,6 GB) o i1-Q4_K_S (22,8 GB) caben en GPUs de 24 GB, aprovechando la MoE para mantener velocidades altas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Estimaciones basadas en el tamano de los archivos GGUF publicados; al ser un MoE con solo ~2,5B de parametros activos, la velocidad de generacion es alta incluso si el modelo completo no cabe en VRAM (los pesos inactivos pueden residir en RAM o disco).

- VRAM estimada para inferencia: desde ~8,3 GB (i1-IQ1_S) hasta ~32,8 GB (i1-Q6_K) segun el quant elegido; el quant recomendado i1-Q4_K_M ocupa 24,3 GB.
- Con cuants de 8-12 GB (IQ1/IQ2): cabe en GPUs de 12-16 GB (RTX 3060 12GB, RTX 4060 Ti 16GB), con calidad notablemente degradada.
- Con cuants de 17-24 GB (IQ3/Q4): caben en una RTX 3090 o RTX 4090 (24 GB); i1-Q4_K_S (22,8 GB) es señalado como el punto optimo de tamano/velocidad/calidad.
- Con cuants de 27-33 GB (Q5/Q6): requieren GPUs de 32-48 GB (RTX 5090, A6000, A100) o descarga parcial a RAM.
- Despliegue: llama.cpp (formato GGUF nativo), Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF e imatrix. No hay soporte directo de vLLM o TGI para GGUF.
- Latencia y throughput: no disponibles; la arquitectura MoE con 2,5B de parametros activos sugiere velocidades de generacion comparables a modelos densos de ese tamano, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Flint-40B-A2.5B-abliterated (esta ficha) | ~39,8B | ~2,5B | Apache 2.0 | GGUF (imatrix) | Abliterated, orientado a codigo y ciberseguridad |
| Qwen3-30B-A3B | ~30,5B | ~3,3B | Apache 2.0 | safetensors/GGUF | MoE de tamano similar, con datos de benchmarks publicados |
| Mixtral 8x7B Instruct | ~46,7B | ~12,9B | Apache 2.0 | safetensors/GGUF | MoE clasico, mas parametros activos, menor eficiencia por token |

No hay datos de rendimiento comparables publicados para Flint-40B-A2.5B, por lo que la comparativa se limita a caracteristicas tecnicas.

## Limitaciones y advertencias

- Al ser un modelo abliterated, carece de salvaguardas de seguridad: puede generar contenido harmful, ilegal o peligroso. Su uso esta restringido a investigacion y contextos legitimos; el usuario asume toda la responsabilidad legal y etica.
- Riesgo de alucinacion elevado en el uso sin filtros: la abliteracion puede degradar la calidad general del modelo, y no hay benchmarks que cuantifiquen este efecto.
- Idioma: el modelo esta etiquetado solo para ingles; el rendimiento en castellano no esta documentado y puede ser inferior.
- Longitud de contexto: no disponible en la documentacion, lo que dificulta planificar tareas de contexto largo.
- Cuants de baja calidad (IQ1_S, IQ1_M, IQ2_*): el propio autor los describe como "para desesperados" o de calidad muy baja; para trabajo serio se recomienda Q4_K_S o superior.
- Sin datos de benchmarks publicados: no es posible evaluar objetivamente su rendimiento frente a alternativas antes de probarlo.
- La licencia Apache 2.0 del modelo base y de los quants permite uso comercial, pero no exime de cumplir la legislacion aplicable al contenido generado.
- No hay informacion sobre tool calling, agentes ni capacidades multimodales; asumir que no existen salvo prueba en contrario.

## Enlaces

- Repositorio de la ficha: https://huggingface.co/mradermacher/Flint-40B-A2.5B-abliterated-i1-GGUF
- Modelo base abliterated: https://huggingface.co/dima6312/Flint-40B-A2.5B-abliterated
- Quants estaticos del mismo modelo: https://huggingface.co/mradermacher/Flint-40B-A2.5B-abliterated-GGUF
- Pagina de descargas de mradermacher: https://hf.tst.eu/model#Flint-40B-A2.5B-abliterated-i1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Datasets usados en la abliteracion: https://huggingface.co/datasets/mlabonne/harmful_behaviors y https://huggingface.co/datasets/mlabonne/harmless_alpaca

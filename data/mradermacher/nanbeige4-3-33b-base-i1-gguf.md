# mradermacher/Nanbeige4.3-33B-Base-i1-GGUF

## Resumen

Nanbeige4.3-33B-Base es un modelo de lenguaje denso de aproximadamente 33.100 millones de parámetros publicado por Nanbeige LLM Lab bajo licencia Apache 2.0, junto con su variante instruct. Esta ficha cubre concretamente la versión **GGUF cuantizada del checkpoint Base** publicada por mradermacher, que aplica cuantización con matriz de importancia (imatrix) sobre los pesos originales en BF16. El modelo base original está pensado para completado de texto y como punto de partida para ajuste fino; la familia se orienta a tareas de codificación agéntica y de oficina ("cowork"), y según la información pública de la familia alcanza 80,9 en Terminal-Bench 2.1.

La relevancia de esta publicación es doble: por un lado, Nanbeige libera pesos de un modelo de 33B en una franja de tamaño (30B-35B) muy competitiva para despliegue en una o dos GPU profesionales; por otro, la disponibilidad de cuantizaciones GGUF desde 8,4 GB hasta 27,3 GB permite ejecutarlo en hardware de consumo con pérdida controlada de calidad. El contexto declarado para la familia es de 524.288 tokens (512K), lo que lo sitúa por encima de la mayoría de alternativas de su clase.

Conviene subrayar que el repositorio aquí descrito contiene únicamente el **checkpoint Base** (sin alineamiento por instrucciones), y que su model card es la plantilla genérica del cuantizador: no aporta detalles de arquitectura, datos de entrenamiento ni benchmarks. Toda la información técnica específica del modelo procede del modelo original y de fuentes secundarias, y así se indica en cada apartado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (tipo exacto de atención y número de capas: no disponible) |
| Parámetros totales | 33.118.977.024 (33,1B) |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | 524.288 tokens (512K) según fuentes secundarias sobre la familia; no confirmado en la model card de este repositorio |
| Tipos de cuantización | i1 con imatrix: IQ1_M, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, Q3_K_S, IQ3_M, Q3_K_M, IQ4_XS, Q4_K_S, Q4_K_M, Q6_K (más fichero imatrix suelto). El autor etiqueta además otros tipos generados (IQ1_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ3_XS, Q3_K_L, Q4_0, Q4_1, Q5_K_S, Q5_K_M) |
| Idiomas soportados | inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (versionado i1, cuantización con importance matrix); el modelo original se distribuye en safetensors BF16 |
| Tamaño del repositorio | 248,1 GB (incluye todas las variantes) |
| Tag de despliegue | endpoints_compatible |

## Arquitectura y entrenamiento

El modelo original es un transformer **denso** de 33,1B parámetros, es decir, sin mezcla de expertos: todos los parámetros se activan en cada token, lo que simplifica el despliegue pero encarece la inferencia frente a arquitecturas MoE del mismo tamaño total. Los pesos de referencia ocupan aproximadamente 66 GB en BF16 según las fuentes secundarias, coherente con los 33,1B parámetros. No se dispone de información sobre el número de capas, la dimensionalidad oculta, el tipo de atención (completa, GQA, lineal o híbrida), la función de activación ni la implementación concreta de la ventana de 512K tokens.

Tampoco hay datos publicados en la información disponible sobre el volumen de tokens de entrenamiento, la composición del corpus, la mezcla de idiomas (más allá de en/zh), ni sobre las etapas de alineamiento del checkpoint instruct (RLHF, DPO u otras). El repositorio cuantizado no aporta nada de esto: la única técnica documentada es el propio proceso de cuantización, que usa una matriz de importancia (imatrix) calculada por el autor para minimizar la perplejidad en los niveles bajos de bits. Los cuantos i1 se generan en formato GGUF directamente desde los pesos en safetensors del checkpoint Base.

## Capacidades

- Generación de texto y completado de secuencias en inglés y chino: es la función nativa del checkpoint Base.
- Modelo de partida para ajuste fino supervisado y para destilación (las fuentes secundarias lo describen como "modelo profesor" abierto).
- Codificación y tareas agénticas heredadas de la familia: la variante instruct de Nanbeige4.3-33B se presenta explícitamente como modelo para agentes de código y tareas de oficina.
- Razonamiento multi-paso y uso de herramientas: atribuible al checkpoint instruct de la familia; **este repositorio es el Base**, por lo que no incorpora plantilla de chat ni alineamiento por instrucciones.
- Capacidades multilingües limitadas a inglés y chino; no se declara soporte de español ni de otros idiomas.
- No se declara soporte de visión, audio ni modo "thinking" explícito en la información disponible.
- Compatible con endpoints de inferencia (tag `endpoints_compatible`) a través de los formatos GGUF.

## Casos de uso

- Ajuste fino específico de dominio: el checkpoint Base en Q4_K_M o Q6_K sirve como inicialización para LoRA/QLoRA sobre corpus propios (legal, médico, industrial) sin partir de un modelo alineado que haya que "desalinear" antes de entrenar.
- Destilación de un modelo de 33B a tamaños de 3B-8B: las fuentes describen Nanbeige4.3-33B como modelo profesor abierto; el Base es el candidato natural para generar grandes volúmenes de texto sintético y etiquetas.
- Evaluación comparativa interna de cuantizaciones: al ofrecerse desde IQ1_M (8,4 GB) hasta Q6_K (27,3 GB) del mismo checkpoint, permite medir la degradación real de perplejidad y calidad en tareas propias antes de fijar un nivel de bits en producción.
- Generación de texto en lote para inglés y chino: clasificación, etiquetado, resumen extractivo o aumento de datos donde no se requiere seguir instrucciones complejas, con el coste reducido de un GGUF Q4_K_M de 20,2 GB.
- Investigación sobre contexto largo: con 512K tokens declarados en la familia, el Base permite estudiar degradación de atención y estrategias de KV cache en secuencias muy largas (requiere verificar empíricamente el soporte real en la pila de inferencia elegida).
- Base para pipelines de código en chino/inglés: combinado con un adaptador entrenado sobre instrucciones, puede integrarse en flujos de autocompletado o generación de tests en entornos con documentación bilingüe.
- Experimentación en hardware de consumo: la variante Q3_K_M (16,4 GB) o IQ4_XS (18,1 GB) permite reproducir experimentos de un 33B en una única GPU de 24 GB con contexto moderado.

## Benchmarks y rendimiento

La información disponible solo incluye un dato de benchmark, referido a la familia Nanbeige4.3-33B (no específicamente al checkpoint Base cuantizado) y procedente de fuentes secundarias, no de la model card de este repositorio:

| Benchmark | Nanbeige4.3-33B | Modelos comparables |
|---|---|---|
| Terminal-Bench 2.1 | 80,9 | no disponible en la información proporcionada |

No se han publicado resultados de MMLU, HumanEval, GSM8K, MMLU-Pro, LiveCodeBench ni de otros benchmarks en la información disponible para este repositorio. Tampoco hay mediciones de perplejidad por nivel de cuantización publicadas por el cuantizador más allá del gráfico genérico de comparación de tipos de cuantización que enlaza en su model card.

## Requisitos de hardware

Estimaciones calculadas a partir del tamaño de cada fichero GGUF; hay que sumar KV cache y buffers de cómputo, cuyo coste exacto no está disponible (depende del número de capas y cabezas, no publicados):

- IQ1_M (8,4 GB): ~9-10 GB de VRAM. Cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070. Calidad muy degradada ("mostly desperate", según el autor).
- IQ2_M (11,8 GB) / Q2_K (12,8 GB): ~13-14 GB. Cabe en RTX 4070 Ti Super, RTX 4080, RTX 4090.
- IQ3_M (15,3 GB) / Q3_K_M (16,4 GB): ~17-18 GB. RTX 4080 16 GB muy justa; RTX 4090 24 GB con holgura.
- IQ4_XS (18,1 GB) / Q4_K_S (19,2 GB): ~20-21 GB. RTX 4090 24 GB con contexto corto.
- Q4_K_M (20,2 GB), recomendado por el autor: ~22-24 GB. Encaja en RTX 4090 24 GB solo con contexto reducido; más cómodo en A100 40 GB, L40S 48 GB o H100.
- Q6_K (27,3 GB): ~29-31 GB. Requiere A100 40 GB, L40S 48 GB, o 2x RTX 3090/4090 con reparto por capas.
- Pesos BF16 originales (~66 GB): A100 80 GB, H100 80 GB o 2x GPU de 48 GB.
- Contexto de 512K: la KV cache a esa longitud es el factor limitante real; no hay cifras publicadas. En la práctica exige cuantización de KV cache (Q8/Q4) y probablemente varias GPU, incluso con pesos en Q4_K_M.
- Opciones de despliegue: llama.cpp (referencia para GGUF), Ollama y LM Studio (importando el GGUF), llama-cpp-python, text-generation-webui. vLLM y TGI no consumen GGUF de forma nativa para este modelo: para servir a gran escala conviene usar los safetensors originales.
- Latencia y throughput: no disponibles. Al ser un modelo denso de 33B, el throughput estará limitado por ancho de banda de memoria; en RTX 4090 (1008 GB/s) un Q4_K_M implica leer ~20 GB por token generado en el peor caso, lo que sitúa el techo teórico en decenas de tokens por segundo en batch 1.

## Comparativa con modelos similares

Datos de los comparables tomados de sus model cards públicas; el rendimiento en benchmarks de estas alternativas no está disponible en la información proporcionada, por lo que la comparación se limita a especificaciones.

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Formato GGUF |
|---|---|---|---|---|---|
| Nanbeige4.3-33B-Base (este repo, i1-GGUF) | 33,1B denso | 524.288 (512K)* | Apache 2.0 | en, zh | Sí, 12 variantes |
| Qwen2.5-Coder-32B | 32,5B denso | 131.072 | Apache 2.0 | multilingüe (incl. es) | Sí, amplio ecosistema |
| Qwen3-32B | 32,8B denso | 32.768 nativo, 131.072 con YaRN | Apache 2.0 | multilingüe (incl. es) | Sí |
| Gemma 3 27B | 27B denso | 128.000 | Términos de uso de Gemma | multilingüe | Sí |

\* Contexto declarado para la familia en fuentes secundarias; no verificado en este repositorio.

Diferencias cualitativas relevantes: Nanbeige4.3-33B es el único de la tabla con ventana de 512K declarada y el único centrado explícitamente en agentes de código y tareas de oficina con soporte nativo de chino; a cambio, su comunidad y su ecosistema de herramientas son mucho menores que los de Qwen o Gemma, y su cobertura de idiomas se limita a en/zh. Gemma 3 27B es la única alternativa con licencia no Apache, lo que puede ser un factor decisivo para uso comercial sin restricciones.

## Limitaciones y advertencias

- **Es el checkpoint Base, no el instruct**: no sigue instrucciones, no tiene plantilla de chat y no está alineado. Usarlo en un chat directo produce resultados pobres. Para tareas agénticas hay que usar el checkpoint instruct de la familia (no cuantizado en este repositorio) o entrenar un adaptador.
- Idiomas: solo inglés y chino declarados. El rendimiento en español no está evaluado y previsiblemente será muy inferior.
- Sesgos: no hay documentación sobre sesgos, filtrado de datos ni evaluaciones de seguridad en la información disponible. Un modelo Base reproduce y amplifica los sesgos de su corpus, especialmente en chino e inglés.
- Alucinación: sin alineamiento ni RLHF, la tasa de afirmaciones falsas es mayor que en modelos instruct; no es apto para producción sin capas de verificación.
- Contexto: los 512K tokens provienen de fuentes secundarias; la mayoría de pilas de inferencia GGUF no soportan esa longitud de forma práctica, y la KV cache resultante puede exceder la VRAM disponible. Hay que validar la longitud efectiva antes de diseñar nada.
- Cuantizaciones bajas: el propio autor advierte que IQ1_M es "mostly desperate" y que Q2_K_S es de "very low quality". Por debajo de Q4 se espera degradación notable en razonamiento y código.
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales, pero el cuantizador no ofrece garantías sobre los pesos derivados; conviene citar tanto a Nanbeige como a mradermacher.
- Madurez del ecosistema: 0 descargas y 1 like en el momento de la consulta; sin issues ni validación comunitaria. No hay informes independientes sobre la calidad de estas cuantizaciones concretas.
- Fecha de publicación reciente: posibles cambios en el repositorio (el autor mantiene versiones `i1` y puede regenerar ficheros).
- Repositorio de 248,1 GB: descargar el conjunto completo es inviable en la mayoría de conexiones; hay que bajar solo el fichero GGUF del nivel deseado.

## Enlaces

- Repositorio GGUF cuantizado (i1/imatrix): https://huggingface.co/mradermacher/Nanbeige4.3-33B-Base-i1-GGUF
- Cuantizaciones estáticas del mismo modelo: https://huggingface.co/mradermacher/Nanbeige4.3-33B-Base-GGUF
- Modelo base original (safetensors): https://huggingface.co/Nanbeige/Nanbeige4.3-33B-Base
- Página de descargas del cuantizador: https://hf.tst.eu/model#Nanbeige4.3-33B-Base-i1-GGUF
- Preguntas frecuentes y peticiones de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF citada por el autor: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Nota de MarkTechPost sobre el lanzamiento: https://www.marktechpost.com/2026/10/25/nanbeige-releases-nanbeige4-3-33b-open-agentic-coding-model/
- Análisis en ExplainX: https://explainx.ai/blog/nanbeige-4-3-33b-open-agentic-model-guide-2026
- Artículo en AI Modeling: https://www.aimodeling.com/en/news/slug/nanbeige-4-3-33b-open-agent-teacher-model
- Discusión sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9

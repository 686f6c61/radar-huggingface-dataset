# mradermacher/Nemotron-3.5-Bolt-E4B-Heretic-GGUF

## Resumen

Nemotron-3.5-Bolt-E4B-Heretic-GGUF es una colección de cuantizaciones estáticas en formato GGUF, publicada por el usuario mradermacher, del modelo base grumd0/Nemotron-3.5-Bolt-E4B-Heretic. Este modelo base es, a su vez, una versión "abliterated" (sin filtros de rechazo) de un modelo de la familia Nemotron 3.5 de NVIDIA, concretamente de la variante Bolt E4B, modificada mediante técnicas de abliteration basadas en la dirección de rechazo (refusal-direction), según indican las etiquetas del repositorio.

El propósito de este repo es facilitar la ejecución local del modelo en hardware de consumo: ofrece cuantizaciones desde Q2_K (4,5 GB) hasta f16 (15,2 GB), además de los suplementos multimodales mmproj en Q8_0 y f16. El modelo original es conversacional, multimodal (según la presencia de archivos mmproj) y soporta 34 idiomas, entre ellos el castellano.

Su relevancia actual radica en dos factores: la familia Nemotron de NVIDIA es una de las líneas de modelos abiertos más activas, y las versiones abliterated como esta "Heretic" responden a la demanda de modelos sin restricciones de rechazo para casos de uso legítimos (investigación, ficción, red teaming). La licencia del modelo base es openmdw-1.1, una licencia abierta de pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Nemotron 3.5 Bolt E4B (la denominación E4B sugiere una arquitectura MoE con unos 4B de parámetros activos; no confirmado en la documentación disponible) |
| Parametros totales | 7.518.069.290 (dato real de safetensors) |
| Parametros activos | no disponible (la etiqueta E4B sugiere ~4B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | 34: alemán, árabe, búlgaro, chino, coreano, danés, eslovaco, esloveno, español, estonio, finés, francés, griego, húngaro, inglés, italiano, japonés, letón, lituano, neerlandés, noruego, polaco, portugués, rumano, ruso, sueco, checo, tailandés, turco, ucraniano, urdu/hindi (hi), vietnamita, croata, indonesio |
| Licencia | openmdw-1.1 (other) |
| Formato de pesos | GGUF (esta cuantización); el modelo base está en safetensors |

## Arquitectura y entrenamiento

El modelo base pertenece a la familia Nemotron 3.5 de NVIDIA, variante Bolt E4B. La etiqueta "gemma4" presente en los tags sugiere que la arquitectura comparte elementos con la familia Gemma, aunque la documentación disponible no lo detalla. El nombre "E4B" en la nomenclatura de NVIDIA y Google suele indicar modelos de mezcla de expertos (MoE) con aproximadamente 4.000 millones de parámetros activos sobre un total mayor; con 7.518 millones de parámetros totales en safetensors, esta hipótesis es plausible pero no está confirmada en la información disponible.

Sobre el entrenamiento del modelo original (número de tokens, composición del dataset, uso de RLHF/DPO) no hay datos en la documentación proporcionada. Lo que sí está documentado es la modificación posterior: la versión "Heretic" ha sido abliterated, es decir, se ha eliminado la dirección interna que provoca los rechazos de seguridad, produciendo un modelo "uncensored" que responde a solicitudes que el modelo original rechazaría. La cuantización GGUF de mradermacher es estática (no imatrix); existen cuantizaciones ponderadas/imatrix en un repositorio complementario.

## Capacidades

- Generación de texto conversacional, con etiqueta de pipeline "conversational" en el repositorio.
- Capacidades multimodales: la presencia de archivos mmproj (mmproj-Q8_0 y mmproj-f16) indica soporte de entrada de imágenes mediante el proyector multimodal de llama.cpp.
- Soporte multilingüe en 34 idiomas, incluido el castellano.
- Ausencia de rechazos de seguridad (abliterated): responde a contenido que el modelo original filtraría, lo que lo hace útil para red teaming, escritura de ficción madura e investigación de alineamiento, pero también más riesgoso.
- Tool calling, agentes y razonamiento multi-paso: no disponible (no hay información al respecto en la documentación).
- Modo de pensamiento (thinking mode), audio: no disponible.

## Casos de uso

- Ejecución local en hardware de consumo: con la cuantización Q4_K_M (5,4 GB) el modelo cabe en GPUs de 8 GB de VRAM o incluso en equipos solo con CPU más RAM, lo que lo hace adecuado para desarrolladores que experimentan sin coste de nube.
- Aplicaciones multimodales locales: gracias a los archivos mmproj, se puede montar un asistente que describa o analice imágenes en local con llama.cpp, útil para privacidad en procesamiento de documentos o fotografías.
- Red teaming y evaluación de seguridad: al no tener la dirección de rechazo, es útil para investigadores que prueban sistemas de filtrado o estudian comportamientos no alineados sin que el modelo se niegue a colaborar.
- Escritura creativa sin restricciones: guiones, novela negra o ficción con contenido maduro donde los modelos con RLHF estándar rechazan la solicitud.
- Asistentes multilingües: soporte de 34 idiomas permite construir chatbots locales para mercados europeos y asiáticos, incluido el castellano.
- Investigación en abliteration y alineamiento: al derivar de un modelo Nemotron conocido, permite comparar el comportamiento del modelo original frente al abliterated y estudiar el efecto de la dirección de rechazo en la calidad de las respuestas.
- Despliegue en servidores pequeños: la variante Q8_0 (8,1 GB) ofrece calidad casi sin pérdida para VPS o estaciones de trabajo con GPUs de 12-16 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Tampoco hay comparativas de perplexity específicas para estas cuantizaciones; el README incluye un gráfico genérico de ikawrakow comparando tipos de cuantización de baja calidad, pero sin datos numéricos del modelo concreto.

## Requisitos de hardware

- VRAM estimada para inferencia (tamaño del archivo + contexto y KV cache):
  - Q2_K: ~4,5 GB
  - Q4_K_S / Q4_K_M: ~5,3-5,4 GB (cuantizaciones recomendadas por el autor)
  - Q6_K: ~6,3 GB
  - Q8_0: ~8,1 GB
  - f16: ~15,2 GB
  - Añadir 0,7-1,1 GB si se usa el suplemento multimodal mmproj.
- GPU recomendadas: con Q4_K_M cabe en una RTX 3060 de 12 GB o una RTX 4060 Ti de 16 GB con holgura; para Q8_0 conviene una RTX 4090, RTX 3090 o GPU de 16 GB. También es viable en Apple Silicon (Mac con 8-16 GB de memoria unificada).
- Consumer GPUs: sí, la mayoría de las cuantizaciones caben en GPUs de consumo de 8 GB en adelante (Q2_K a Q5_K_M en 8 GB; Q6_K y Q8_0 en 12-16 GB).
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, KoboldCpp y cualquier runtime compatible con GGUF. Al ser cuantizaciones GGUF, no es aplicable vLLM o TGI directamente (requerirían los pesos originales en safetensors).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Particularidad |
|---|---|---|---|---|
| Nemotron-3.5-Bolt-E4B-Heretic-GGUF (este) | 7,52B totales (E4B sugiere ~4B activos) | GGUF | openmdw-1.1 | Abliterated, multimodal (mmproj), 34 idiomas |
| Nemotron-3.5-Bolt-E4B (original de NVIDIA) | 7,52B totales | safetensors | no disponible | Con filtros de rechazo estándar, soporte oficial de NVIDIA |
| Otras cuantizaciones Heretic (p. ej. versiones abliterated de Qwen o Gemma en GGUF) | variable según base | GGUF | variable | Mismo enfoque de abliteration, bases y tamaños distintos |

La comparación más relevante es con el modelo base original: esta versión sacrifica los rechazos de seguridad a cambio de mayor complacencia, y las cuantizaciones GGUF de mradermacher añaden la posibilidad de ejecutarlo en hardware modesto frente a los safetensors originales, que requieren más VRAM o un servidor de inferencia compatible con transformers.

## Limitaciones y advertencias

- Al tratarse de un modelo abliterated, no rechazará solicitudes dañinas: el despliegue en producción sin capas de moderación externas conlleva riesgos legales y reputacionales significativos.
- La abliteration puede degradar la calidad general del modelo (coherencia, precisión, capacidad de razonamiento) respecto al original; no hay evaluaciones cuantitativas de esta degradación en la documentación disponible.
- Riesgo de alucinación: inherente a cualquier LLM, y posiblemente agravado por la abliteration; no hay datos medidos para esta variante.
- Cuantizaciones agresivas como Q2_K y Q3_K_M tienen pérdida de calidad notable (el propio README marca Q3_K_M como "lower quality").
- Longitud de contexto no documentada en esta ficha; consultar la documentación del modelo base antes de diseñar aplicaciones con documentos largos.
- Licencia openmdw-1.1 (tipo "other"): es una licencia abierta de pesos, pero conviene revisar sus términos exactos en https://openmdw.ai/license/1-1/ antes de uso comercial.
- La procedencia del modelo base (grumd0) es un fork de terceros, no el release oficial de NVIDIA: puede no recibir actualizaciones ni correcciones del fabricante.
- El soporte multimodal vía mmproj depende de la compatibilidad de llama.cpp con el proyector del modelo; puede requerir versiones recientes del runtime.

## Enlaces

- Repositorio de la cuantización GGUF: https://huggingface.co/mradermacher/Nemotron-3.5-Bolt-E4B-Heretic-GGUF
- Modelo base abliterated: https://huggingface.co/grumd0/Nemotron-3.5-Bolt-E4B-Heretic
- Cuantizaciones imatrix/ponderadas del mismo modelo: https://huggingface.co/mradermacher/Nemotron-3.5-Bolt-E4B-Heretic-i1-GGUF
- Página de descarga resumida de mradermacher: https://hf.tst.eu/model#Nemotron-3.5-Bolt-E4B-Heretic-GGUF
- Licencia openmdw-1.1: https://openmdw.ai/license/1-1/
- FAQ y solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Glosario sobre cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Guía de uso de GGUF de TheBloke: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Empresa de mradermacher (nethype GmbH): https://www.nethype.de/
- Repositorio oficial de NVIDIA Nemotron en Hugging Face: no disponible (no se ha proporcionado enlace en la información)

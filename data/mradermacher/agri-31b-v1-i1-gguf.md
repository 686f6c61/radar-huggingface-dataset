# mradermacher/agri-31b-v1-i1-GGUF

## Resumen

agri-31b-v1-i1-GGUF es una coleccion de cuantizaciones GGUF generadas por mradermacher a partir del modelo toiru99/agri-31b-v1, un modelo de lenguaje especializado en el dominio agricola y entrenado principalmente para coreano. El repositorio no contiene pesos originales en precision completa, sino un conjunto de ficheros GGUF con cuantizacion de tipo i1 (imatrix) y estatica, pensados para su uso con llama.cpp y derivados.

El modelo base cuenta con 30.697.345.596 parametros (aproximadamente 30,7 mil millones), lo que lo situa en la franja de modelos de gran tamano que requieren hardware de gama alta para inferencia en precision completa, pero que gracias a las cuantizaciones disponibles pueden desplegarse en configuraciones mas modestas. La licencia es Gemma, heredada del modelo original, lo que impone las condiciones de uso de la familia Gemma de Google.

La relevancia de esta ficha radica en que agrupa un modelo de dominio especifico (agricultura) con un ecosistema de cuantizaciones amplio (desde IQ1_S de 7,3 GB hasta Q6_K de 25,3 GB), lo que permite ajustar el equilibrio entre calidad y requisitos de memoria. El repo acumula 9.266 descargas, lo que indica un cierto interes practico pese a la escasez de documentacion tecnica publicada por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de tipo transformer, inferido por el uso de transformers y GGUF; no confirmado en la informacion) |
| Parametros totales | 30.697.345.596 (~30,7 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1 (imatrix) IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, IQ3_S, Q3_K_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K; version estatica en repo separado |
| Idiomas soportados | coreano (ko) |
| Licencia | Gemma |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base toiru99/agri-31b-v1 en la documentacion proporcionada. Por el nombre y el tamano (30,7 B parametros) y por el uso de la libreria transformers y la licencia Gemma, es plausible que se trate de un transformer decoder-only derivado de la familia Gemma, pero este extremo no se confirma en la model card. Tampoco se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF, DPO o ajuste supervisado.

La unica informacion tecnica concreta disponible se refiere al proceso de cuantizacion: mradermacher ha generado cuantizaciones ponderadas con imatrix (etiquetadas i1) y cuantizaciones estaticas en un repositorio aparte. El uso de imatrix implica que se ha calculado una matriz de importancia a partir de un corpus de calibracion para mejorar la calidad de las cuantizaciones de baja precision, lo que es especialmente relevante en los niveles IQ1 e IQ2. El repo incluye ademas el fichero imatrix.gguf (0,1 GB) para que terceros puedan generar sus propias cuantizaciones.

## Capacidades

- Generacion de texto conversacional en coreano, orientada al dominio agricola segun las etiquetas del modelo.
- Especializacion tematica en agricultura (tag "agriculture"), lo que sugiere un ajuste fino sobre corpus de ese dominio.
- Inferencia mediante llama.cpp y compatible con el ecosistema GGUF (Ollama, LM Studio, etc.).
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni modo thinking.
- No se documentan capacidades multilingues mas alla del coreano.
- No se documentan capacidades de codigo ni matematicas de forma especifica.

## Casos de uso

- Consultas agronomicas en coreano: el modelo puede responder preguntas sobre cultivos, plagas o practicas agricolas gracias a su ajuste de dominio, aunque la falta de documentacion sobre el dataset impide garantizar la cobertura tematica.
- Asistencia a agricultores en zonas con conectividad limitada: las cuantizaciones IQ2/IQ3 (entre 8,8 y 14,5 GB) permiten desplegar el modelo en estaciones de trabajo con GPU de consumo, lo que facilita su uso en entornos rurales sin infraestructura cloud.
- Prototipado rapido de chatbots sectoriales: al estar disponible en GGUF, se puede integrar en Ollama o llama.cpp en pocos minutos para validar una idea de producto vertical agrario.
- Generacion de material divulgativo en coreano: redaccion de fichas tecnicas, guias de cultivo o resumentes de practicas agricolas, siempre con revision humana por el riesgo de alucinacion.
- Investigacion sobre cuantizacion: el repositorio sirve como caso de estudio para comparar la degradacion de calidad entre niveles i1-IQ1_S y i1-Q6_K en un modelo de 30 B, usando el fichero imatrix incluido.
- Despliegue en servidores con una sola GPU de 24 GB: la cuantizacion i1-Q4_K_M (18,8 GB) o i1-Q5_K_M (21,9 GB) cabe en una RTX 4090 o A10G, permitiendo servir el modelo con latencia aceptable para uso interno.
- Filtrado y clasificacion de textos agricolas en coreano: uso del modelo como base para tareas de etiquetado o extraccion de informacion en pipelines de datos del sector primario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion (peso del fichero GGUF, sin contar KV cache):
  - i1-IQ1_S: 7,3 GB
  - i1-IQ2_M: 11,0 GB
  - i1-IQ3_M: 14,5 GB
  - i1-Q4_K_M: 18,8 GB
  - i1-Q5_K_M: 21,9 GB
  - i1-Q6_K: 25,3 GB
- GPU recomendadas: para IQ1-IQ2, GPU de 12-16 GB (RTX 4070 Ti, RTX 4080); para Q3-Q4, GPU de 24 GB (RTX 4090, A10G, L4); para Q5-Q6, GPU de 24-32 GB o configuracion multi-GPU.
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) con cuantizaciones hasta Q5_K_M; en RTX 4070/4080 (12-16 GB) solo con IQ1/IQ2.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF; el repo declara endpoints_compatible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| agri-31b-v1 (este) | ~30,7 B | no disponible | ko | Gemma | GGUF, safetensors (base) |
| Gemma 2 27B | 27 B | 8.192 tokens (segun documentacion publica de Gemma 2) | multilingue | Gemma | safetensors, GGUF |
| Qwen2.5 32B | 32,5 B | 32.768 tokens (segun documentacion publica de Qwen2.5) | multilingue | Apache 2.0 | safetensors, GGUF |
| Yi-34B | 34 B | 4.096 tokens (segun documentacion publica de Yi) | en, zh | Apache 2.0 (con restricciones) | safetensors, GGUF |

Nota: los datos de los modelos comparativos provienen de documentacion publica general y no de la informacion proporcionada en esta busqueda; se incluyen como referencia orientativa de categoria. La comparacion de rendimiento no es posible porque no hay benchmarks publicados del modelo agri-31b-v1.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no es posible evaluar la calidad real del modelo frente a alternativas.
- Documentacion muy escasa: se desconoce la composicion del dataset, el numero de tokens de entrenamiento y el proceso de alineacion, lo que dificulta evaluar sesgos y robustez.
- Modelo unicamente en coreano: no apto para produccion en castellano ni en otros idiomas sin una evaluacion previa.
- Licencia Gemma: impone restricciones de uso comercial y obligaciones de atribucion; es necesario revisar los terminos de la licencia Gemma antes de cualquier despliegue productivo.
- Riesgo de alucinacion en dominio agricola: al ser un modelo de ajuste fino sin datos de evaluacion, puede generar recomendaciones agronomicas incorrectas; requiere supervision humana en cualquier uso critico.
- Cuantizaciones IQ1 e IQ2 marcadas por el propio autor como "for the desperate" o "mostly desperate": la degradacion de calidad es significativa y no se recomiendan para produccion.
- El repositorio no contiene los pesos originales en bfloat16, solo GGUF; para reentrenamiento o ajuste fino hay que acudir al modelo base toiru99/agri-31b-v1.
- Tamano del repo de 334,8 GB: la descarga completa es costosa en almacenamiento y ancho de banda; conviene descargar solo la cuantizacion necesaria.

## Enlaces

- Repositorio Hugging Face (este modelo): https://huggingface.co/mradermacher/agri-31b-v1-i1-GGUF
- Modelo base: https://huggingface.co/toiru99/agri-31b-v1
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/agri-31b-v1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#agri-31b-v1-i1-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafico comparativo de calidad de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png

# mradermacher/llama-2-34b-uncode-GGUF

## Resumen

llama-2-34b-uncode-GGUF es una coleccion de cuantizaciones en formato GGUF del modelo base chargoddard/llama-2-34b-uncode, publicada por el usuario mradermacher. El modelo original parte de la arquitectura Llama 2 y ha sido sometido a un proceso de "uncensoring" (eliminacion de rechazos y sesgos de alineamiento) por parte de chargoddard, empleando tecnicas de fine-tuning sobre datasets como the_pile_books3 y una muestra de RedPajama-Data-1T. Esta version GGUF facilita la ejecucion local en hardware de consumo mediante llama.cpp y derivados.

El modelo cuenta con 33.743.970.304 parametros (aproximadamente 34B) en una arquitectura transformer densa, sin mezcla de expertos. Esta orientado exclusivamente al idioma ingles y se distribuye bajo la licencia Llama 2, lo que condiciona su uso comercial. Su relevancia actual reside en que permite desplegar un modelo de gran tamano con comportamiento menos restrictivo en entornos locales, aunque a costa de una mayor exigencia de VRAM y de los riesgos inherentes a un modelo sin alineamiento.

La publicacion incluye un abanico de cuantizaciones que van desde Q2_K (12,6 GB) hasta Q8_0 (36,0 GB), lo que permite ajustar el equilibrio entre calidad y requisitos de memoria segun el hardware disponible. No se han publicado resultados de benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Llama 2) |
| Parametros totales | 33.743.970.304 (~34B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | Ingles (en) |
| Licencia | Llama 2 |
| Formato de pesos | GGUF (cuantizaciones); modelo base en transformers |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer denso de tipo decoder-only de la familia Llama 2, con aproximadamente 34.000 millones de parametros. La variante "uncode" fue producida por chargoddard mediante fine-tuning sobre el modelo Llama 2 original, con el objetivo de reducir el comportamiento de rechazo y las restricciones de alineamiento tipicas de los modelos instructivos. Los datasets declarados en la model card son the_pile_books3 y una muestra de togethercomputer/RedPajama-Data-1T-Sample, lo que sugiere un entrenamiento orientado a texto libre y datos generales de gran escala.

No se especifica en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal. La aportacion de esta ficha concreta es la cuantizacion estatica en GGUF realizada por mradermacher, que conserva los pesos del modelo base pero los adapta para inferencia eficiente en CPU y GPU mediante llama.cpp.

## Capacidades

- Generacion de texto en ingles con estilo libre y menor tendencia al rechazo que los modelos alineados.
- Razonamiento general y respuesta a instrucciones, heredado del modelo Llama 2 base.
- Generacion de codigo y texto tecnico, aunque sin garantias de calidad especificas documentadas.
- Soporte multilingue limitado: el modelo esta entrenado y etiquetado exclusivamente para ingles.
- No se documenta soporte de tool calling, function calling ni agentes multi-paso.
- No se documenta modo de razonamiento explicito (thinking mode), vision ni audio.
- Capacidad de ejecucion local en CPU/GPU gracias al formato GGUF y a las multiples cuantizaciones.

## Casos de uso

- Experimentacion con modelos sin alineamiento: util para investigadores que estudian el comportamiento de modelos "uncensored" y comparan respuestas frente a variantes alineadas, aprovechando las cuantizaciones ligeras para iterar rapidamente.
- Generacion creativa de ficcion: el entrenamiento sobre the_pile_books3 favorece la produccion de texto narrativo largo; puede usarse en estaciones de trabajo con 24 GB de VRAM empleando Q4_K_M.
- Procesamiento por lotes de texto en ingles: con Q4_K_S (19,3 GB) se puede desplegar en una unica GPU de 24 GB para tareas de resumen, reescritura o clasificacion a gran escala.
- Entornos con hardware limitado: la cuantizacion Q2_K (12,6 GB) permite ejecutar el modelo en GPUs de consumo de 16 GB o en configuraciones CPU con RAM abundante, a costa de menor calidad.
- Investigacion sobre sesgos y seguridad: sirve como caso de estudio para medir como el "uncensoring" afecta a la generacion de contenido sensible y para calibrar filtros posteriores.
- Prototipado de asistentes de escritura en local: integrable en herramientas de escritorio mediante llama.cpp u Ollama, sin depender de APIs externas, siempre que el caso de uso sea en ingles y no requiera garantias de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~12,6 GB
  - Q3_K_S: ~14,7 GB
  - Q3_K_M: ~16,4 GB
  - Q3_K_L: ~17,9 GB
  - IQ4_XS: ~18,3 GB
  - Q4_K_S: ~19,3 GB
  - Q4_K_M: ~20,3 GB
  - Q5_K_S: ~23,3 GB
  - Q5_K_M: ~23,9 GB
  - Q6_K: ~27,8 GB
  - Q8_0: ~36,0 GB
- GPU recomendadas: A100 40/80 GB o H100 para Q6_K y Q8_0 con contexto amplio; RTX 3090/4090 (24 GB) para Q4_K_M y Q5_K_M; GPUs de 16 GB para Q2_K con contexto reducido.
- Cabe en GPU de consumo: si, en RTX 3090/4090 con cuantizaciones Q4 y Q5; en GPUs de 16 GB solo con Q2_K o Q3_K_S y contexto limitado.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF (por ejemplo, llama-cpp-python). vLLM y TGI no soportan GGUF de forma nativa para este modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| llama-2-34b-uncode-GGUF (este) | ~34B | no disponible | Llama 2 | GGUF | Variante sin alineamiento, solo ingles |
| chargoddard/llama-2-34b-uncode | ~34B | no disponible | Llama 2 | safetensors/transformers | Modelo base del que deriva esta cuantizacion |
| Meta Llama 2 34B (original) | ~34B | no disponible | Llama 2 | safetensors, GGUF | Version alineada y con rechazos de seguridad |
| Modelos GGUF de ~30-34B de otros autores | ~30-34B | variable | variable | GGUF | Alternativas de tamano similar para inferencia local |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo "uncensored": el proceso de eliminacion de alineamiento incrementa el riesgo de generar contenido ofensivo, ilegal o peligroso sin filtros; no es adecuado para produccion orientada al publico sin capas de moderacion adicionales.
- Riesgo elevado de alucinacion: no se documentan evaluaciones de fidelidad ni de tasas de error.
- Limitacion idiomatica: entrenado y etiquetado solo para ingles; el rendimiento en castellano no esta garantizado.
- Longitud de contexto no documentada: no se puede asumir la ventana de 4K de Llama 2 sin confirmacion.
- Licencia Llama 2: impone restricciones de uso comercial (limite de 700 millones de usuarios mensuales, obligaciones de atribucion y politicas de uso aceptable); revisar los terminos antes de desplegar.
- Las cuantizaciones de baja precision (Q2_K, Q3_K_S) degradan la calidad de forma apreciable; para produccion se recomienda Q4_K_M o superior.
- El modelo no incluye herramientas de seguridad, tool calling ni soporte de agentes; cualquier integracion en pipelines requiere desarrollo adicional.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/llama-2-34b-uncode-GGUF
- Modelo base: https://huggingface.co/chargoddard/llama-2-34b-uncode
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/llama-2-34b-uncode-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#llama-2-34b-uncode-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de modelos del autor: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png

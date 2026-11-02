# mradermacher/Carvalho-Salamandra-Instruct-GGUF

## Resumen

Carvalho-Salamandra-Instruct es un modelo de lenguaje instructivo de aproximadamente 7.770 millones de parametros, desarrollado por el consorcio Proxecto Nós (proxectonos) y publicado originalmente en HuggingFace. Esta ficha concreta corresponde a la version cuantizada en formato GGUF realizada por mradermacher, que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles. El modelo esta afinado para instrucciones y esta orientado a un contexto multilingue que cubre gallego, portugues, espanol, ingles y catalan.

El modelo resuelve el problema de disponer de un LLM instructivo de tamano medio (rango 7-8B) con cobertura real de lenguas ibericas minoritarias, un nicho habitualmente desatendido por los modelos comerciales. Su relevancia actual radica en que combina un peso manejable, licencia MIT permisiva y un conjunto de cuantizaciones GGUF que van desde 3,4 GB (Q2_K) hasta 15,6 GB (f16), lo que facilita su despliegue tanto en estaciones de trabajo como en servidores modestos.

La ficha se centra en la version GGUF, por lo que la informacion disponible sobre arquitectura interna, datos de entrenamiento y benchmarks procede unicamente de los metadatos y la model card del repositorio; los detalles que no aparecen alli se marcan explicitamente como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Salamandra; detalles internos no disponibles) |
| Parametros totales | 7.768.117.248 (aprox. 7,77B) |
| Parametros activos | no disponible (no es un modelo MoE segun los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | gallego (gl), portugues (pt), espanol (es), ingles (en), catalan (ca) |
| Licencia | MIT |
| Formato de pesos | GGUF (version cuantizada); el modelo base esta en formato transformers |
| Tamano del repositorio | 70,7 GB (incluye todas las cuantizaciones) |
| Modelo base | proxectonos/Carvalho-Salamandra-Instruct |
| Dataset de instrucciones | proxectonos/cpt_instruction_datasets |

## Arquitectura y entrenamiento

La informacion disponible indica que el modelo base es proxectonos/Carvalho-Salamandra-Instruct, un modelo de la familia Salamandra afinado para instrucciones. La model card del repositorio GGUF no detalla la arquitectura interna mas alla de la etiqueta "Salamandra" y "Instruction-tuning", por lo que no se puede confirmar el numero de capas, dimensiones ocultas, tipo de atencion ni si incorpora innovaciones como atencion lineal o decodificacion especulativa. El recuento de parametros (7.768.117.248) es coherente con un transformer denso de rango 7-8B.

Respecto al entrenamiento, la unica referencia disponible es el dataset proxectonos/cpt_instruction_datasets, empleado para el ajuste instructivo. No se especifican en la informacion proporcionada el numero de tokens de preentrenamiento, la composicion del corpus, ni si se aplicaron tecnicas de RLHF, DPO o similar. La version aqui descrita es una cuantizacion estatica (quantize_version 2, output_tensor_quantised 1) generada por mradermacher; el autor indica que las cuantizaciones ponderadas con imatrix no estaban disponibles en el momento de la publicacion.

## Capacidades

- Generacion de texto conversacional multi-turno en gallego, portugues, espanol, ingles y catalan.
- Seguimiento de instrucciones (instruction tuning) sobre el modelo base Salamandra.
- Razonamiento general y respuesta a preguntas, segun el etiquetado "Instruction-tuning" del repositorio.
- Capacidad multilingue limitada a los cinco idiomas declarados; no se documentan otros.
- No se documenta soporte explicito de tool calling, function calling ni uso como agente en la informacion disponible.
- No se documentan capacidades de vision, audio ni modo "thinking".
- Formato conversacional compatible con endpoints (tag "endpoints_compatible").

## Casos de uso

- Atencion al cliente en gallego y portugues: el modelo puede gestionar conversaciones multi-turno en estas lenguas, un escenario donde la mayoria de LLM comerciales tienen cobertura limitada; su licencia MIT permite integrarlo en productos propios sin restricciones de uso comercial.
- Generacion de contenido editorial en lenguas ibericas: redaccion de borradores, resumenes y adaptaciones de texto entre espanol, gallego, portugues y catalan, aprovechando el entrenamiento multilingue del modelo.
- Despliegue en local para desarrollo: con cuantizaciones Q4_K_M (5,0 GB) o Q5_K_M (5,7 GB) puede ejecutarse en una GPU de consumo de 8-12 GB o incluso en CPU, lo que lo hace util para prototipado sin coste de API.
- Traduccion asistida entre las cinco lenguas soportadas: util para flujos de localizacion en entornos con catalan, gallego y portugues, aunque sin garantia de calidad comparable a modelos especializados.
- Educacion y herramientas de aprendizaje de idiomas: generacion de ejercicios, explicaciones y dialogos en las lenguas cubiertas.
- Procesamiento por lotes en servidores modestos: al disponer de variantes Q2_K (3,4 GB) y Q3_K_S (3,9 GB), puede desplegarse en instancias con poca VRAM para tareas de clasificacion, extraccion o generacion masiva.
- Investigacion en PLN de lenguas minoritarias: base para experimentos de ajuste fino o evaluacion comparativa en gallego y catalan.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion: Q2_K ~3,4 GB; Q3_K_S ~3,9 GB; Q3_K_M ~4,1 GB; Q3_K_L ~4,4 GB; IQ4_XS ~4,6 GB; Q4_K_S ~4,8 GB; Q4_K_M ~5,0 GB; Q5_K_S ~5,6 GB; Q5_K_M ~5,7 GB; Q6_K ~6,5 GB; Q8_0 ~8,4 GB; f16 ~15,6 GB. A estas cifras hay que sumar el espacio para el contexto KV cache.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para cuantizaciones Q4-Q8; A100 o H100 solo necesarias para f16 o para alto throughput en produccion.
- Cabe en GPU de consumo: si, desde una GTX 1660 6 GB (Q3_K_S) hasta una RTX 4090 (Q8_0 o f16 con margen). Las cuantizaciones Q4_K_M y Q5_K_M son las recomendadas por el autor por equilibrio velocidad/calidad.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el modelo base puede servirse con vLLM o TGI en formato transformers.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Carvalho-Salamandra-Instruct (esta ficha, GGUF) | ~7,77B | no disponible | gl, pt, es, en, ca | MIT | GGUF |
| Salamandra (familia base) | no disponible | no disponible | no disponible | no disponible | transformers |
| Modelos 7-8B multilingues genericos (p. ej. variantes Llama/Mistral) | ~7-8B | variable segun version | principalmente en, con multilingue parcial | licencias variables (a menudo no MIT) | safetensors, GGUF |

La comparativa detallada con alternativas concretas no esta disponible en la informacion proporcionada; los datos de la familia Salamandra y de modelos comparables no se incluyen en el repositorio consultado.

## Limitaciones y advertencias

- No se documentan sesgos conocidos en la model card; al ser un modelo entrenado sobre corpus ibericos, es probable que herede sesgos de dichas fuentes, pero no hay evaluacion publicada en la informacion disponible.
- Riesgo de alucinacion inherente a los LLM de rango 7-8B; no hay datos de evaluacion de fidelidad.
- Longitud de contexto no documentada, lo que impide garantizar el manejo de conversaciones o documentos largos.
- Cobertura linguistica limitada a cinco idiomas; el rendimiento fuera de ellos no esta garantizado.
- Las cuantizaciones de baja precision (Q2_K, Q3_K_S) degradan la calidad; el autor advierte que Q3_K_M es de "lower quality".
- Las cuantizaciones ponderadas con imatrix no estaban disponibles en el momento de la publicacion, lo que puede afectar a la calidad de las variantes IQ.
- Licencia MIT permisiva, incluido uso comercial, pero conviene verificar las condiciones del modelo base proxectonos/Carvalho-Salamandra-Instruct, ya que la informacion disponible no detalla posibles restricciones adicionales.
- El repositorio ocupa 70,7 GB por incluir todas las cuantizaciones; descargar solo el archivo GGUF necesario.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Carvalho-Salamandra-Instruct-GGUF
- Modelo base: https://huggingface.co/proxectonos/Carvalho-Salamandra-Instruct
- Dataset de instrucciones: https://huggingface.co/datasets/proxectonos/cpt_instruction_datasets
- Pagina de descargas del autor: https://hf.tst.eu/model#Carvalho-Salamandra-Instruct-GGUF
- Guia de uso de GGUF (referencia TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests

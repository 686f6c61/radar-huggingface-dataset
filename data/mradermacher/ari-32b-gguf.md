# mradermacher/ARI-32B-GGUF

## Resumen

ARI-32B-GGUF es la versión cuantizada en formato GGUF del modelo ARI-32B, desarrollado originalmente por DAMI-Lab y convertido a GGUF por mradermacher. Se trata de un modelo de lenguaje de 32.762.123.264 parámetros (aproximadamente 32,8 mil millones) orientado a tareas de restauración, con etiquetas que hacen referencia a la dinastía Joseon, lo que sugiere un enfoque en la restauración de texto histórico o patrimonial. El modelo base está publicado bajo licencia Apache 2.0 y declara soporte únicamente para inglés.

La relevancia de esta ficha radica en que ofrece el modelo en múltiples niveles de cuantización GGUF, desde Q2_K (12,4 GB) hasta Q8_0 (34,9 GB), lo que permite desplegarlo en hardware muy diverso, desde GPUs de consumo con VRAM limitada hasta estaciones de trabajo con aceleradores profesionales. Al estar en formato GGUF, es compatible con llama.cpp y con los principales runners que lo implementan, como Ollama o LM Studio.

No se dispone de información detallada sobre la arquitectura interna, los datos de entrenamiento ni los resultados de benchmarks ni en la model card del repositorio cuantizado ni en los metadatos proporcionados. Esta ficha refleja exclusivamente los datos verificables disponibles y marca explícitamente como "no disponible" todo aquello que no se ha podido confirmar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer, inferido del uso de transformers y GGUF) |
| Parametros totales | 32.762.123.264 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

No se ha publicado en la informacion disponible la arquitectura concreta del modelo base DAMI-Lab/ARI-32B: no se especifica si es un transformer denso, un modelo con mezcla de expertos (MoE), una arquitectura hibrida con capas de atencion lineal o cualquier otra variante. El recuento de parametros (32.762.123.264) y el uso de la libreria transformers en los metadatos apuntan a un transformer denso de gran tamano, pero se trata de una inferencia, no de un dato confirmado.

Tampoco se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, la existencia de fases de RLHF, DPO u otras tecnicas de alineacion, ni sobre innovaciones tecnicas especificas como decodificacion especulativa o mecanismos de atencion eficiente. Las etiquetas del repositorio ("restoration", "joseon-dynasty") sugieren un entrenamiento o ajuste orientado a la restauracion de textos vinculados a la dinastia Joseon, pero no se detalla el proceso. La unica informacion tecnica verificable del repositorio cuantizado es el proceso de cuantizacion estatica realizado por mradermacher, que genera los 11 niveles de cuantizacion listados en las especificaciones.

## Capacidades

- Generacion de texto conversacional: los metadatos incluyen la etiqueta "conversational" y "endpoints_compatible", lo que indica que el modelo esta preparado para su uso en dialogos multi-turno a traves de endpoints compatibles con la API de transformers.
- Restauracion de texto: la etiqueta "restoration" sugiere capacidad para tareas de restauracion o reconstruccion de texto, presumiblemente de material historico o patrimonial.
- Enfoque en la dinastia Joseon: la etiqueta "joseon-dynasty" indica una especializacion o sesgo hacia contenido relacionado con ese periodo historico coreano.
- Capacidades multilingues: limitadas al ingles segun la model card; no se declaran otros idiomas.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades especiales (vision, audio, modo thinking): no disponible en la informacion proporcionada.

## Casos de uso

- Restauracion de documentos historicos: dado el etiquetado "restoration" y "joseon-dynasty", el modelo podria emplearse para reconstruir o completar fragmentos de textos historicos, aunque la licencia y el idioma declarado (ingles) limitan su aplicacion directa a corpus en coreano clasico sin validacion previa.
- Despliegue en entornos con VRAM limitada: con la cuantizacion Q2_K (12,4 GB) o Q3_K_S (14,5 GB) el modelo puede ejecutarse en GPUs de consumo de gama alta, lo que permite prototipado local sin infraestructura de servidor.
- Servicio de generacion de texto en produccion: las cuantizaciones Q4_K_M (19,9 GB) y Q5_K_M (23,3 GB) ofrecen un equilibrio entre calidad y velocidad adecuado para servir peticiones conversacionales mediante llama.cpp u Ollama.
- Investigacion sobre cuantizacion: al ofrecer 11 niveles de cuantizacion del mismo modelo base, el repositorio sirve como banco de pruebas para medir el impacto de la cuantizacion en la perplejidad y la calidad de salida en tareas de restauracion.
- Fine-tuning posterior sobre dominio historico: partiendo de la version Q8_0 (34,9 GB) o del modelo base en safetensors, un equipo podria ajustar el modelo a un corpus documental concreto y luego recuantizarlo para su despliegue.
- Evaluacion comparativa de modelos de 32B: permite incorporar un modelo de ~32,8 mil millones de parametros a suites de evaluacion locales sin depender de APIs externas, gracias a la disponibilidad de pesos GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto): Q2_K ~12,4 GB; Q3_K_S ~14,5 GB; Q3_K_M ~16,1 GB; Q3_K_L ~17,4 GB; IQ4_XS ~18,0 GB; Q4_K_S ~18,9 GB; Q4_K_M ~19,9 GB; Q5_K_S ~22,7 GB; Q5_K_M ~23,3 GB; Q6_K ~27,0 GB; Q8_0 ~34,9 GB.
- GPU recomendadas: para Q4_K_M en adelante se recomienda una GPU con al menos 24 GB de VRAM (RTX 3090, RTX 4090, A10G, L4 de 24 GB); para Q6_K y Q8_0 se requiere una A100 40 GB, H100 o una configuracion multi-GPU.
- Cabe en GPU de consumo: si, las cuantizaciones Q2_K a Q4_K_M caben en tarjetas de 16-24 GB (RTX 4080, RTX 4090, RTX 3090); las cuantizaciones Q5 y superiores requieren 24 GB o mas y dejan poco margen para el contexto.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el modelo base en safetensors puede servirse con vLLM o TGI si se dispone de la VRAM suficiente.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ARI-32B-GGUF (este) | 32,8 B | no disponible | Apache 2.0 | GGUF | Cuantizaciones estaticas de Q2_K a Q8_0 |
| DAMI-Lab/ARI-32B (base) | 32,8 B | no disponible | Apache 2.0 | safetensors | Modelo original sin cuantizar |
| Alternativas de ~32B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables de modelos comparables en la informacion proporcionada |

No se dispone de informacion suficiente para establecer una comparativa con modelos de la misma categoria mas alla del propio modelo base del que deriva esta cuantizacion.

## Limitaciones y advertencias

- Idioma: la model card declara unicamente ingles; el uso en castellano u otros idiomas no esta respaldado por la documentacion y puede degradar la calidad de forma significativa.
- Sesgos conocidos: no disponible; no se documentan sesgos especificos, pero al no conocerse la composicion del dataset de entrenamiento no es posible descartar sesgos historicos o culturales, especialmente dado el enfoque en la dinastia Joseon.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; como en cualquier modelo generativo de este tamano, existe riesgo de generar contenido plausible pero falso, especialmente en tareas de restauracion donde la fidelidad al original es critica.
- Limitaciones de contexto: la longitud de contexto no esta documentada, lo que impide garantizar el manejo de entradas largas en produccion.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion con atribucion; no obstante, conviene verificar la licencia del modelo base DAMI-Lab/ARI-32B, ya que esta ficha solo confirma la del repositorio cuantizado.
- Caveat de cuantizacion: las cuantizaciones de baja precision (Q2_K, Q3_K_S) degradan la calidad de forma notable; para produccion se recomienda Q4_K_M o superior.
- Disponibilidad de quants ponderados: el autor indica que no hay cuantizaciones con imatrix disponibles en el momento de la publicacion, lo que puede afectar a la calidad relativa frente a otras distribuciones GGUF.
- Madurez: el repositorio tiene pocas descargas (454) y cero likes, lo que sugiere una adopcion limitada y poca validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face (cuantizaciones GGUF): https://huggingface.co/mradermacher/ARI-32B-GGUF
- Modelo base: https://huggingface.co/DAMI-Lab/ARI-32B
- Pagina de descargas del autor: https://hf.tst.eu/model#ARI-32B-GGUF
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/

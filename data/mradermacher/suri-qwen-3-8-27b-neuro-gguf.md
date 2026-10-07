# mradermacher/Suri-Qwen-3.8-27B-Neuro-GGUF

## Resumen
Suri-Qwen-3.8-27B-Neuro-GGUF es la publicación de cuantizaciones GGUF del modelo SpaceTimee/Suri-Qwen-3.8-27B-Neuro, realizada por mradermacher, un autor especializado en convertir pesos de modelos abiertos a formatos de inferencia local. El modelo original tiene 26.895.998.464 parámetros (unos 26,9 mil millones) y está etiquetado para chino (zh) e inglés (en), con referencias a "suri", "neuro" y "neuro-sama", lo que lo sitúa en el ámbito de los personajes conversacionales derivados del ecosistema de VTubers con IA.

Esta publicación no aporta pesos nuevos ni entrenamiento: su aportación es ofrecer el modelo en 12 niveles de cuantización distintos (desde Q2_K de 10,8 GB hasta Q8_0 de 28,7 GB) más dos ficheros mmproj que actúan como suplemento multimodal. Eso permite ejecutar un modelo de casi 27.000 millones de parámetros en hardware de consumo, algo imposible con los pesos originales en precisión completa.

Es relevante porque cubre la franja de despliegue local de modelos conversacionales grandes: con Q4_K_M (16,6 GB) el modelo cabe en una GPU de 24 GB, y con Q2_K o Q3_K_S baja a equipos más modestos. La model card, tanto la original como la cuantizada, no documenta longitud de contexto, licencia, composición del dataset de entrenamiento ni resultados de benchmarks.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo se declara derivado de la familia Qwen segun etiquetas y nombre; no se detalla si es transformer denso, MoE o hibrida) |
| Parametros totales | 26.895.998.464 (aprox. 26,9 B), dato real de los safetensors |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; ademas mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | zh (chino), en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors en el modelo base; GGUF en esta publicacion (convert_type: hf, quantize_version 2) |

## Arquitectura y entrenamiento
La informacion disponible no describe la arquitectura interna del modelo base. Los metadatos de la cuantizacion indican `convert_type: hf` y `quantize_version: 2`, es decir, la conversion parte de pesos en formato HuggingFace y se aplica la version 2 del pipeline de cuantizacion de mradermacher (`output_tensor_quantised: 1`, cuantizacion por tensor de salida). No se especifica numero de tokens de entrenamiento, composicion del dataset, ni si hubo fases de RLHF, DPO o ajuste por instrucciones.

Tampoco se documentan innovaciones tecnicas como atencion lineal, decodificacion especulativa o modos de razonamiento. Lo unico verificable en la publicacion es la existencia de un proyector multimodal (`mmproj`) en dos precisiones, Q8_0 (0,7 GB) y f16 (1,0 GB), lo que implica que el modelo base fue entrenado o adaptado para aceptar entrada de imagen ademas de texto. El nombre del modelo sugiere una base Qwen en su version 3.8 con adaptacion de personaje ("Suri"/"Neuro"), pero este extremo no esta confirmado en la model card. Existe ademas una variante con cuantizacion ponderada/imatrix publicada en el repositorio mradermacher/Suri-Qwen-3.8-27B-Neuro-i1-GGUF.

## Capacidades
- Generacion de texto conversacional en chino e ingles, con orientacion a dialogo multi-turno segun las etiquetas `conversational` y `text-generation-inference`.
- Interpretacion de personaje: las etiquetas `suri` y `neuro-sama` apuntan a un modelo ajustado para mantener una personalidad concreta, aunque la model card no detalla su comportamiento ni el conjunto de datos de caracterizacion.
- Entrada multimodal (imagen + texto) mediante los ficheros mmproj incluidos, que actuan como suplemento multimodal del GGUF.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que puede servirse mediante APIs compatibles con HuggingFace.
- Cuantizacion flexible: doce niveles de precision que permiten intercambiar calidad por consumo de memoria segun el hardware.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Comportamiento agentico o razonamiento multi-paso: no disponible.
- Capacidades de codigo, matematicas o razonamiento formal: no disponible.
- Modo "thinking" o razonamiento explicito: no disponible.
- Soporte de audio: no disponible.
- Soporte de espanol: no declarado (los idiomas listados son unicamente zh y en).

## Casos de uso
- Chatbot de personaje y acompanamiento conversacional: el modelo esta etiquetado con nombres de personajes del ecosistema Neuro-sama, por lo que encaja en aplicaciones de rol, compania y entretenimiento conversacional desplegadas localmente con llama.cpp u Ollama.
- VTuber o asistente virtual en directo: combinado con los ficheros mmproj, puede generar respuestas de personaje a partir de una entrada de imagen o avatar, con la cuantizacion Q4_K_M para mantener latencia baja en una GPU de 24 GB.
- Despliegue local con privacidad estricta: al ejecutarse en GGUF dentro de la propia infraestructura, las conversaciones no salen del equipo; util para entornos con requisitos de confidencialidad donde no se permite enviar datos a APIs externas.
- Atencion al cliente bilingue chino-ingles: el modelo cubre ambos idiomas de forma nativa, lo que permite gestionar consultas en los dos mercados con un unico punto de inferencia, siempre que la licencia lo permita (dato no disponible).
- Asistente multimodal de escritorio: con el proyector mmproj cargado, se pueden construir flujos de descripcion de imagenes o respuesta a capturas de pantalla sin depender de servicios en la nube.
- Base para ajuste fino con LoRA o QLoRA: la disponibilidad de cuantizaciones de 4 y 5 bits (Q4_K_S, Q4_K_M, Q5_K_M) facilita el entrenamiento ligero en una sola GPU sobre el modelo base en safetensors.
- Evaluacion comparativa de cuantizaciones: el repositorio incluye desde Q2_K hasta Q8_0, lo que permite medir la degradacion de perplejidad y de calidad conversacional entre niveles con un unico modelo de referencia.
- Prototipado rapido en portatiles con GPU de 12-16 GB: las variantes Q2_K, Q3_K_S y Q3_K_M (10,8-13,4 GB) permiten probar el comportamiento del modelo antes de invertir en hardware mayor.
- Backend de demos offline en ferias o entornos sin conectividad: un fichero GGUF unico y un runtime de llama.cpp bastan para levantar una demo interactiva sin dependencias de red.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card de la publicacion GGUF ni los metadatos asociados incluyen valores de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra evaluacion. El unico dato de rendimiento indirecto es el grafico de perplejidad de tipos de cuantizacion enlazado en la model card (`quantpplgraph.png`), que compara tipos de cuantizacion entre si y no el modelo frente a alternativas.

## Requisitos de hardware
- VRAM aproximada segun el tamano real de cada fichero GGUF, anadiendo 1-3 GB de margen para contexto y cache KV:
  - Q2_K: 10,8 GB de pesos, unos 13-14 GB de VRAM.
  - Q3_K_S: 12,2 GB; Q3_K_M: 13,4 GB; Q3_K_L: 14,4 GB.
  - IQ4_XS: 15,3 GB; Q4_K_S: 15,7 GB; Q4_K_M: 16,6 GB (recomendado por el autor como rapido).
  - Q5_K_S: 18,8 GB; Q5_K_M: 19,3 GB; Q6_K: 22,2 GB ("very good quality" segun el autor).
  - Q8_0: 28,7 GB ("fast, best quality").
- Proyector multimodal adicional: mmproj-Q8_0 ocupa 0,7 GB y mmproj-f16 1,0 GB de VRAM.
- GPU de consumo: Q4_K_M y Q4_K_S caben en RTX 3090, RTX 4090, RTX 5090 o cualquier GPU de 24 GB. Q5_K_M (19,3 GB) tambien entra en 24 GB con contexto moderado. Q6_K (22,2 GB) entra en 24 GB con muy poco margen.
- GPU de 16 GB (RTX 4060 Ti 16 GB, RTX 4080): viables IQ4_XS y Q3_K_M con contexto reducido; Q4_K_M exige offload parcial a CPU.
- GPU de 12 GB (RTX 3060 12 GB): viables Q2_K y Q3_K_S con offload parcial.
- GPU profesional: Q8_0 (28,7 GB) requiere A100 40 GB, A100 80 GB, H100 o similar; Q6_K puede ejecutarse en A100 40 GB sin problemas.
- Repositorio completo: 187,9 GB de espacio en disco si se descargan todas las cuantizaciones y los ficheros mmproj.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, text-generation-webui, Ollama-compatible frontends y runners que consuman GGUF; la etiqueta `text-generation-inference` y `endpoints_compatible` apuntan a compatibilidad con endpoints tipo TGI/HuggingFace, aunque el soporte GGUF en vLLM y TGI es limitado en comparacion con llama.cpp.
- Latencia y throughput: no disponible, no se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares
No se dispone de datos verificables de benchmarks de este modelo ni de alternativas publicas de la misma categoria en la informacion proporcionada, por lo que la comparacion cuantitativa con otros modelos de ~27B no es posible. La comparacion factible es entre las distintas publicaciones de la misma familia:

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SpaceTimee/Suri-Qwen-3.8-27B-Neuro (base) | 26.895.998.464 | no disponible | safetensors | no disponible | HuggingFace, repositorio del autor original |
| mradermacher/Suri-Qwen-3.8-27B-Neuro-GGUF (esta publicacion) | 26.895.998.464 | no disponible | GGUF estatico, 12 cuantizaciones + 2 mmproj | no disponible | HuggingFace, 114 descargas, 0 likes |
| mradermacher/Suri-Qwen-3.8-27B-Neuro-i1-GGUF | 26.895.998.464 | no disponible | GGUF ponderado/imatrix | no disponible | HuggingFace |

Criterio de eleccion orientativo: las cuantizaciones estaticas de este repositorio son mas rapidas de generar y de comportamiento predecible, mientras que la variante i1 (imatrix ponderada) suele conservar mejor la calidad en tamanos bajos, a costa de un proceso de cuantizacion mas costoso.

## Limitaciones y advertencias
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido. Cualquier despliegue en produccion deberia verificar la licencia del modelo base SpaceTimee/Suri-Qwen-3.8-27B-Neuro antes de continuar.
- Cobertura idiomatica limitada: solo se declaran chino e ingles. No hay soporte confirmado de castellano, por lo que el rendimiento en espanol es incierto.
- Riesgo de alucinacion: no se han publicado evaluaciones de factualidad, y un ajuste orientado a personaje suele priorizar consistencia estilistica sobre precision factual.
- Ausencia total de benchmarks: no hay datos de MMLU, HumanEval, GSM8K ni evaluaciones de seguridad, lo que impide estimar la calidad del modelo antes de desplegarlo.
- Deriva de personaje: al tratarse de un modelo caracterizado, puede mantener el rol incluso cuando el usuario pide informacion objetiva, y puede generar contenido fuera de tono si el prompt no se controla.
- Contenido sensible: los modelos de personaje derivados de comunidades de VTubers pueden reproducir sesgos de estilo, lenguaje informal o contenido para adultos presente en sus datos de ajuste; se recomienda filtrado en produccion.
- Contexto desconocido: al no documentarse la longitud de contexto, es arriesgado disenar flujos que dependan de ventanas largas (por ejemplo, analisis de documentos extensos).
- Degradacion en cuantizaciones bajas: Q2_K y Q3_K_S reducen notablemente la fidelidad respecto a Q8_0; el propio autor marca Q3_K_M como "lower quality". Para tareas sensibles, usar Q5_K_M o superior.
- Metadatos anomalos: las fechas de creacion y actualizacion del repositorio (7 de octubre de 2026) son posteriores a la fecha habitual de consulta, lo que sugiere un error de registro; no afecta a los pesos, pero conviene tenerlo en cuenta al auditar procedencia.
- Adopcion muy baja: 114 descargas y 0 likes implican poca validacion externa de la calidad de la cuantizacion.
- Dependencia del modelo base: cualquier limitacion, sesgo o problema de licencia del modelo original se hereda integramente en esta publicacion.

## Enlaces
- Repositorio HuggingFace de esta publicacion: https://huggingface.co/mradermacher/Suri-Qwen-3.8-27B-Neuro-GGUF
- Modelo base: https://huggingface.co/SpaceTimee/Suri-Qwen-3.8-27B-Neuro
- Cuantizaciones ponderadas/imatrix: https://huggingface.co/mradermacher/Suri-Qwen-3.8-27B-Neuro-i1-GGUF
- Pagina de resumen y descargas del cuantizador: https://hf.tst.eu/model#Suri-Qwen-3.8-27B-Neuro-GGUF
- Peticiones de modelos y preguntas frecuentes de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (README de referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de perplejidad por tipo de cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9

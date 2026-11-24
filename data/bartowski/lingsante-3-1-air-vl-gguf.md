# bartowski/LingSante-3.1-air-VL-GGUF

## Resumen

LingSante-3.1-air-VL es un modelo de lenguaje multimodal de tipo mixture-of-experts (MoE) desarrollado por inclusionAI, disenado para tomar texto e imagenes como entrada y producir texto. Segun su model card, esta orientado a aplicaciones sanitarias: redaccion de informes de imagen medica, evaluacion de afecciones cutaneas y dieteticas, busqueda de evidencia medica y agentes GUI clinicos. Se presenta explicitamente como modelo de investigacion y no como dispositivo medico. La version aqui descrita es la cuantizacion GGUF realizada por bartowski a partir del checkpoint original `inclusionAI/LingSante-3.1-air-VL`.

El checkpoint fuente cuenta con aproximadamente 125.000 millones de parametros (124.414.211.552 en los pesos safetensors), lo que lo situa en la gama alta de modelos abiertos. La variante GGUF es compatible con llama.cpp y con el pipeline `image-text-to-text`, e incluye ficheros `mmproj` para el procesamiento de imagenes. El repositorio ocupa 1945,4 GB e incluye desde bf16 completo hasta cuantizaciones IQ3_M.

La relevancia actual radica en que combina tres elementos poco frecuentes en un mismo paquete abierto: escala MoE de 125B, capacidades multimodales (vision) y un enfoque declarado hacia el dominio sanitario, todo bajo licencia MIT. La cuantizacion GGUF de bartowski facilita su despliegue en entornos donde no se dispone de infraestructura de GPU de datacenter.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-experts (MoE) multimodal, construida sobre Ling-3.0-flash-VL |
| Parametros totales | 124.414.211.552 (~125B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, Q8_0, Q6_K, Q6_K_S, Q5_K_M, Q5_K_S, Q4_K_L, IQ4_NL, Q4_K_M, Q4_1, Q4_K_S, Q4_0, IQ4_XS, IQ3_M, Q3_K_L (lista parcial) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizado con llama.cpp b12600, imatrix) |

## Arquitectura y entrenamiento

El modelo es un transformer de tipo mixture-of-experts con capacidades multimodales, construido sobre la base Ling-3.0-flash-VL segun la model card. Acepta entradas de texto e imagen (esta ultima mediante un fichero `mmproj` separado) y genera texto. No se dispone de informacion detallada sobre el numero de expertos, la proporcion de parametros activos por token, el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

Entre los detalles tecnicos confirmados, la model card indica que no emplea decodificacion especulativa y que la cuantizacion se realizo con llama.cpp release b12600 usando matrices de importancia (imatrix). El formato de prompt emplea etiquetas `<role>` y `<|role_end|>`, con soporte de modo de razonamiento explicito mediante `detailed thinking on` y bloques `<think>`, asi como un formato XML especifico para definiciones y llamadas a herramientas.

## Capacidades

- Generacion de texto y razonamiento multimodal: procesa texto e imagenes conjuntamente y produce respuestas textuales.
- Razonamiento explicito: soporta modo de pensamiento detallado (`detailed thinking on`) con bloques `<think>`.
- Tool calling / function calling: admite definicion de funciones dentro de etiquetas `<tools>` y emision de llamadas en formato XML con `<tool_call>`, `<arg_key>` y `<arg_value>`.
- Agentes GUI: la model card menciona su uso como agente en interfaces graficas, en el contexto de aplicaciones medicas.
- Analisis de imagenes medicas: redaccion de informes de imagen diagnostica.
- Evaluacion visual de afecciones cutaneas y dieteticas (segun la model card, con caracter de investigacion).
- Busqueda de evidencia medica.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Redaccion asistida de informes de imagen medica: el modelo puede recibir una imagen diagnostica y texto de contexto clinico y generar un borrador de informe estructurado, aprovechando su naturaleza multimodal y su orientacion declarada al dominio sanitario. Requiere supervision profesional y no sustituye el diagnostico.
- Triaje visual de afecciones cutaneas en entornos de investigacion: dado un conjunto de imagenes dermatologicas y una descripcion textual, el modelo puede generar evaluaciones preliminares para estudios o prototipos, siempre con validacion clinica posterior.
- Agentes GUI clinicos: gracias al soporte de tool calling en formato XML, puede integrarse en flujos que interactuen con aplicaciones de historia clinica electronica, automatizando consultas y registros bajo supervision.
- Busqueda de evidencia medica asistida: el modelo puede formular y encadenar consultas a herramientas de recuperacion documental (PubMed, guias clinicas) mediante function calling, sintetizando los resultados en respuestas con razonamiento explicito.
- Analisis de imagenes en investigacion biomedica: extraccion de descripciones estructuradas de imagenes de laboratorio o histologia para tareas de anotacion y curaduria de datasets.
- Prototipos de asistencia nutricional: a partir de fotografias de alimentos y texto descriptivo, generar estimaciones cualitativas de dieta para aplicaciones de bienestar, con las advertencias propias de un modelo no validado clinicamente.
- Despliegue local en entornos con requisitos de privacidad: la version GGUF permite ejecutar el modelo en infraestructura propia (llama.cpp, Ollama) sin enviar datos de pacientes a servicios externos, lo que resulta relevante para cumplimiento normativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion (tamano de fichero, requiere ademas memoria para el contexto y el `mmproj`):
  - bf16: ~249 GB
  - Q8_0: ~132 GB
  - Q6_K: ~110 GB
  - Q5_K_M: ~96 GB
  - Q4_K_M: ~79 GB (opcion recomendada por el autor para equilibrio tamano/calidad)
  - IQ4_XS: ~69 GB
  - IQ3_M: ~68 GB
- GPU recomendadas: para bf16 y Q8_0 se requiere un conjunto multi-GPU de clase A100/H100 (80 GB cada una, minimo 2-4 unidades). Para Q4_K_M (~79 GB) es viable en 2x A100 40GB, 1x H100 80GB o configuraciones equivalentes.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) ni en GPUs consumer de 48 GB en ninguna cuantizacion disponible; el fichero mas pequeno listado (IQ3_M, ~68 GB) excede la VRAM de cualquier GPU consumer individual. Seria necesario repartir entre varias GPU o usar memoria unificada/CPU offload.
- Opciones de despliegue: llama.cpp (version b12600 o superior, usada para la cuantizacion), Ollama, y cualquier runtime compatible con GGUF e `mmproj` para vision. Para el checkpoint original en safetensors, vLLM o TGI segun soporte del modelo base.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones completas (parametros activos, contexto, benchmarks) de este modelo ni de alternativas directamente comparables en la informacion proporcionada, por lo que no es posible establecer una comparativa rigurosa. Como referencia estructural, se trata de un MoE multimodal de ~125B bajo licencia MIT, categoria en la que compiten modelos abiertos de gran escala con vision, pero no se aportan cifras verificables para contrastar.

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| LingSante-3.1-air-VL (este) | ~125B (MoE) | no disponible | MIT | GGUF, safetensors |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo de investigacion, no dispositivo medico: la propia model card lo declara explicitamente; no debe usarse para diagnostico, tratamiento ni decision clinica sin validacion regulatoria y supervision profesional.
- Riesgo de alucinacion: como todo modelo generativo, puede producir informes o afirmaciones clinicas plausibles pero incorrectas; en dominio sanitario el riesgo es especialmente grave.
- Sesgos conocidos: no disponibles en la informacion proporcionada; cabe esperar sesgos derivados de los datos de entrenamiento, no documentados aqui.
- Idiomas soportados: no disponibles; no se puede garantizar calidad en castellano ni en otros idiomas distintos de los no especificados.
- Longitud de contexto: no disponible, lo que impide planificar casos de uso con documentos o historiales extensos.
- Restricciones de licencia: licencia MIT, que permite uso comercial y modificacion con atribucion; no obstante, la licencia no exime del cumplimiento de normativas sanitarias (MDR, RGPD) en aplicaciones reales.
- Requisitos de hardware elevados: incluso la cuantizacion mas agresiva listada (~68 GB) impide su despliegue en GPU consumer; requiere multi-GPU o CPU offload con latencia muy superior.
- Sin decodificacion especulativa: la model card confirma que no la emplea, lo que limita las optimizaciones de latencia disponibles.
- Repositorio de 1945,4 GB: la descarga completa es costosa; conviene descargar unicamente la cuantizacion y el `mmproj` necesarios.
- Sin datos de benchmarks ni de parametros activos: no es posible estimar con rigor su calidad frente a alternativas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/bartowski/LingSante-3.1-air-VL-GGUF
- Modelo base original: https://huggingface.co/inclusionAI/LingSante-3.1-air-VL
- llama.cpp: https://github.com/ggml-org/llama.cpp/
- Release de llama.cpp usada para cuantizar (b12600): https://github.com/ggml-org/llama.cpp/releases/tag/b12600

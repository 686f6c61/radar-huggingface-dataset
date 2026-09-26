# mradermacher/TARA-English-Tutor-3B-GGUF

## Resumen

TARA-English-Tutor-3B-GGUF es la version cuantizada en formato GGUF del modelo sraivante/TARA-English-Tutor-3B, un ajuste fino orientado a la ensenanza del ingles. La cuantizacion la ha realizado mradermacher, un autor conocido por publicar conversiones GGUF sistematicas de modelos abiertos. El repositorio contiene doce variantes de cuantizacion, desde Q2_K (1,4 GB) hasta f16 (6,3 GB), lo que permite desplegar el modelo en hardware muy diverso, desde portatiles sin GPU dedicada hasta estaciones de trabajo.

El modelo base parte de la familia SmolLM3 (asi lo indica la etiqueta `smollm3` del repositorio) y ha sido entrenado sobre el dataset sraivante/TARA-English-Tutor-Instructions. La model card del autor de la cuantizacion no incluye detalles sobre composicion del dataset, numero de tokens de entrenamiento ni proceso de alineacion, y tampoco publica resultados de evaluacion. Los tags del repositorio (`education`, `english-tutor`, `structured-output`, `experimental`, `merged`) permiten inferir que el objetivo es la tutoria de ingles con salidas estructuradas, pero se trata de informacion declarativa, no verificada.

Su relevancia practica es acotada y muy especifica: se trata de un modelo de 3.075.098.624 parametros con licencia Apache-2.0, distribuido en GGUF, que puede ejecutarse en local y sin conexion. Eso lo hace apto para aplicaciones educativas embebidas donde el coste por inferencia y la privacidad del estudiante son requisitos, aunque sin datos de benchmarks no es posible comparar su calidad real frente a alternativas generalistas del mismo tamano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No confirmada en la informacion disponible; la etiqueta `smollm3` apunta a la familia SmolLM3 (transformer decoder-only) |
| Parametros totales | 3.075.098.624 |
| Parametros activos | No aplica (no hay indicios de que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (el modelo base se distribuye en safetensors) |
| Tamano del repositorio | 27,8 GB |
| Modelo base | sraivante/TARA-English-Tutor-3B |
| Dataset declarado | sraivante/TARA-English-Tutor-Instructions |
| Descargas / likes | 350 / 0 |
| Fecha de creacion del repositorio | 2026-09-26 |

## Arquitectura y entrenamiento

No se dispone de informacion tecnica detallada sobre la arquitectura en la model card de esta cuantizacion. El unico indicio es la etiqueta `smollm3`, que situa el modelo base dentro de la familia SmolLM3, de arquitectura transformer decoder-only. La etiqueta `merged` sugiere que el modelo base se obtuvo mediante la fusion de adaptadores o de checkpoints, practica habitual para consolidar un ajuste fino sobre los pesos originales, pero no hay confirmacion de la tecnica concreta empleada.

Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset sraivante/TARA-English-Tutor-Instructions, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o SFT supervisado. La etiqueta `structured-output` indica que el ajuste fino se oriento a producir respuestas con un formato predefinido (probablemente JSON o plantillas de correccion), lo que resulta coherente con un caso de uso de tutoria linguistica. La cuantizacion es de tipo estatico (`quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf`); el autor indica que no hay cuantizaciones ponderadas ni con imatrix disponibles en el momento de la publicacion. El aviso `experimental` del propio autor desaconseja tratarlo como un modelo consolidado.

## Capacidades

- Generacion de texto conversacional en ingles, con foco declarado en la tutoria del idioma.
- Salidas estructuradas: la etiqueta `structured-output` apunta a respuestas en formatos predefinidos, utiles para corregir ejercicios y devolver feedback parseable.
- Conversacion multi-turno (la etiqueta `conversational` esta presente en el repositorio).
- Capacidad multilingue: limitada al ingles segun el campo `language: en`; no se declara soporte de otros idiomas.
- Tool calling / function calling: no disponible, no se menciona en la informacion proporcionada.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Vision, audio u otras modalidades: no disponible.
- Ejecucion local sin conexion gracias al formato GGUF, con doce niveles de cuantizacion.

## Casos de uso

- Correccion gramatical automatizada en aplicaciones de aprendizaje: el modelo puede recibir una frase del estudiante y devolver la version corregida junto con una explicacion, aprovechando su orientacion a salidas estructuradas.
- Practica conversacional de ingles: dado su caracter conversacional y su ajuste sobre instrucciones de tutoria, puede mantener dialogos guiados por nivel (A1-C1) simulando situaciones cotidianas.
- Generacion de ejercicios y material didactico: produccion de listas de vocabulario, huecos para rellenar o preguntas de comprension a partir de un texto de entrada.
- Feedback estructurado en pipelines educativos: al devolver JSON u otro formato predefinido, la salida puede consumirse directamente por un backend que puntue respuestas y actualice el progreso del alumno.
- Asistente de apoyo al profesorado: borradores de rubricas, correcciones masivas de redacciones cortas y sugerencias de actividades, con revision humana posterior.
- Despliegue offline en aplicaciones moviles o de escritorio: la variante Q4_K_M ocupa solo 2,0 GB, lo que permite integrar tutoria de ingles en un portatil o dispositivo sin GPU dedicada y sin enviar datos del estudiante a un servicio externo.
- Prototipado rapido de productos educativos: el coste de inferencia de un modelo de 3B cuantizado permite iterar sobre prompts y flujos sin presupuesto de GPU de gama alta.
- Clasificacion y etiquetado de respuestas de estudiantes: deteccion de errores recurrentes (tiempos verbales, articulos, preposiciones) como paso previo a un informe agregado por aula.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos mas overhead de contexto y cache KV, valores orientativos calculados a partir del tamano de los ficheros):
  - Q2_K (1,4 GB): aproximadamente 1,8-2,5 GB.
  - Q4_K_M (2,0 GB): aproximadamente 2,5-3,5 GB.
  - Q5_K_M (2,3 GB): aproximadamente 3-4 GB.
  - Q8_0 (3,4 GB): aproximadamente 4-5 GB.
  - f16 (6,3 GB): aproximadamente 7-8 GB.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM para cuantizaciones Q4/Q5 (RTX 3050, RTX 3060, GTX 1660 Super, RTX 4060). Para f16 conviene una GPU con 8 GB o mas (RTX 3060 Ti, RTX 3070, RTX 4060 Ti, RTX 4070). Modelos como A100 o H100 son innecesarios para este tamano.
- Compatibilidad con GPU de consumo: si, en todas las cuantizaciones excepto quiza f16 en GPUs de 6 GB o menos. Las variantes Q4_K_S y Q4_K_M estan marcadas por el autor como "fast, recommended".
- CPU y Apple Silicon: las cuantizaciones Q4 y Q5 son viables en CPU moderna y en chips Apple M1/M2/M3 con memoria unificada; el rendimiento dependera del ancho de banda de memoria del equipo.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio, koboldcpp, llamafile, Jan, text-generation-webui). vLLM y TGI tienen soporte de GGUF limitado o experimental; para produccion con safetensors conviene usar el modelo base.
- Latencia y throughput: no disponibles. No se han publicado mediciones para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Enfoque |
|---|---|---|---|---|---|
| TARA-English-Tutor-3B (GGUF) | 3,08 B | no disponible | Apache-2.0 | GGUF, safetensors (base) | Tutoria de ingles |
| SmolLM3-3B | 3,08 B | 64 000 tokens, extensible a 128 000 con YaRN | Apache-2.0 | safetensors, GGUF | Modelo generalista |
| Llama-3.2-3B-Instruct | 3,21 B | 128 000 tokens | Licencia comunitaria de Llama 3.2 | safetensors, GGUF | Modelo generalista |
| Qwen2.5-3B-Instruct | 3,09 B | 32 768 tokens | Licencia Qwen Research | safetensors, GGUF | Modelo generalista y multilingue |

Los datos de contexto y licencia de los modelos comparativos proceden de sus fichas publicas y pueden variar. No hay resultados de benchmarks de TARA-English-Tutor-3B que permitan comparar calidad frente a estas alternativas; la ventaja diferencial de este modelo es su especializacion declarada en tutoria de ingles con salidas estructuradas, no un rendimiento general superior.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia objetiva de calidad frente a alternativas generalistas del mismo tamano.
- Modelo marcado como `experimental` por el propio autor de la cuantizacion.
- Idiomas: solo ingles declarado. No debe esperarse un comportamiento fiable en castellano u otros idiomas.
- Longitud de contexto no documentada: riesgos de truncado en conversaciones largas o en la correccion de textos extensos.
- Riesgo de alusionacion alto en un modelo de 3B especializado: puede inventar reglas gramaticales, excepciones o etimologias plausibles pero incorrectas. Es imprescindible validar el contenido pedagogico antes de publicarlo.
- Sesgos: no hay informacion sobre la composicion del dataset de instrucciones, por lo que no es posible evaluar sesgos demograficos, culturales o dialectales en las correcciones.
- Licencia Apache-2.0: permite uso comercial y modificacion, con obligacion de conservar los avisos de copyright y licencia. Conviene verificar la licencia del modelo base sraivante/TARA-English-Tutor-3B y del dataset de instrucciones, ya que la cuantizacion hereda las condiciones del modelo original.
- Cuantizaciones de baja precision: las variantes Q2_K y Q3_K degradan notablemente la calidad; para tareas de correccion linguistica conviene Q5_K_M, Q6_K o Q8_0.
- No hay cuantizaciones ponderadas ni con imatrix disponibles, por lo que la perdida de calidad respecto al modelo original no esta medida.
- El proceso de fusion (`merged`) sin documentacion impide reproducir el entrenamiento o verificar que no haya regresiones respecto al modelo base.
- Uso en produccion: sin evaluacion propia sobre un conjunto de test representativo del caso de uso, no deberia desplegarse con supervision automatica de estudiantes.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/mradermacher/TARA-English-Tutor-3B-GGUF
- Modelo base: https://huggingface.co/sraivante/TARA-English-Tutor-3B
- Dataset de instrucciones: https://huggingface.co/datasets/sraivante/TARA-English-Tutor-Instructions
- Pagina resumen del autor para este modelo: https://hf.tst.eu/model#TARA-English-Tutor-3B-GGUF
- FAQ y peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Guia de uso de ficheros GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica comparativa de perplejidad entre cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa que financia la cuantizacion (nethype GmbH): https://www.nethype.de/

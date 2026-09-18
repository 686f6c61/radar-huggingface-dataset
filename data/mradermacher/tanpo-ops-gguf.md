# mradermacher/tanpo-ops-GGUF

## Resumen

`mradermacher/tanpo-ops-GGUF` es la versión cuantizada en formato GGUF del modelo `d4rkninja/tanpo-ops`, un modelo de generación de texto conversacional de 1.170.340.608 parámetros (aproximadamente 1,17 mil millones) afinado sobre el dataset `d4rkninja/tanpo-ops-sft`. La publicación la firma mradermacher, un cuantizador conocido por distribuir versiones GGUF de modelos abiertos para su uso con llama.cpp y herramientas compatibles. El modelo original está etiquetado con los términos `ops` y `operations`, lo que apunta a un ajuste orientado a tareas de operaciones, aunque la información disponible no detalla la composición de ese dataset ni el proceso de ajuste.

El interés práctico de este repositorio no está en el modelo base, sino en el empaquetado: ofrece doce variantes de cuantización estática (desde Q2_K de 0,6 GB hasta f16 de 2,4 GB), lo que permite ejecutar un modelo de 1,17B en hardware muy modesto, incluidas GPU de consumo antiguas o incluso solo CPU. El modelo se distribuye bajo licencia `lfm-1.0`, catalogada en HuggingFace como `other`, y declara únicamente el idioma inglés.

Se trata de una publicación reciente (creada el 18 de septiembre de 2026 según los metadatos) y con nula tracción comunitaria: cero descargas y cero likes en el momento de redactar esta ficha. No se han publicado resultados de benchmarks ni una model card detallada del modelo base más allá de sus metadatos, por lo que cualquier evaluación de calidad debe hacerse de forma empírica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (la información proporcionada no especifica transformer, MoE, SSM ni híbrida) |
| Parámetros totales | 1.170.340.608 (dato real de safetensors del modelo base) |
| Parámetros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 (cuantizaciones estáticas; no hay versiones con imatrix) |
| Idiomas soportados | en (inglés) |
| Licencia | lfm-1.0 (etiquetada como `other` / `license_name: lfm-1.0`) |
| Formato de pesos | GGUF (el modelo base usa safetensors con `library_name: transformers`) |
| Modelo base | d4rkninja/tanpo-ops |
| Dataset de ajuste | d4rkninja/tanpo-ops-sft |
| Cuantizado por | mradermacher |
| Pipeline | text-generation |
| Etiquetas del repositorio | transformers, gguf, ops, operations, text-generation, conversational, tanpo, en |
| Tamaño del repositorio | 10,6 GB |
| Fecha de creación | 2026-09-18 |
| Última actualización | 2026-09-18 |
| Descargas / likes | 0 / 0 |

Tamaños de los ficheros publicados:

| Tipo | Tamaño (GB) | Nota del autor |
|---|---|---|
| Q2_K | 0,6 | |
| Q3_K_S | 0,7 | |
| Q3_K_M | 0,7 | calidad inferior |
| Q3_K_L | 0,7 | |
| IQ4_XS | 0,8 | |
| Q4_K_S | 0,8 | rápido, recomendado |
| Q4_K_M | 0,8 | rápido, recomendado |
| Q5_K_S | 0,9 | |
| Q5_K_M | 0,9 | |
| Q6_K | 1,1 | muy buena calidad |
| Q8_0 | 1,3 | rápido, mejor calidad |
| f16 | 2,4 | 16 bpw, excesivo según el autor |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura del modelo base `d4rkninja/tanpo-ops`. Los únicos datos objetivos son el recuento de parámetros (1.170.340.608), la librería declarada (`transformers`) y el pipeline (`text-generation`). No se especifica si se trata de un transformer denso, de un modelo de mezcla de expertos, de una arquitectura de espacio de estados o de un diseño híbrido, ni se indica el número de capas, la dimensión oculta o el mecanismo de atención empleado.

Respecto al entrenamiento, solo consta que el modelo fue ajustado sobre el dataset `d4rkninja/tanpo-ops-sft`, presumiblemente un conjunto de instrucciones supervisadas (SFT) orientado al dominio de operaciones. No hay información sobre el número de tokens de entrenamiento, la composición del corpus, el uso de RLHF, DPO u otras técnicas de alineación, ni sobre innovaciones técnicas como decodificación especulativa o atención lineal. La licencia `lfm-1.0` sugiere que el modelo base deriva de la familia de modelos fundacionales de Liquid AI, pero esto es una inferencia a partir del nombre de la licencia y no un dato confirmado en la información proporcionada. Esta versión GGUF, en concreto, solo añade el proceso de cuantización: el autor indica que se trata de cuantizaciones estáticas (`quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf`) y que no tiene previsto publicar variantes con imatrix salvo petición expresa.

## Capacidades

- Generación de texto conversacional en inglés, según los tags `text-generation` y `conversational` del repositorio.
- Ajuste orientado al dominio de operaciones (`ops`, `operations`), presumiblemente asistencia sobre procedimientos, incidencias y tareas operativas. El alcance exacto no está documentado.
- Razonamiento multi-turno: al ser un modelo conversacional, permite mantener diálogos con historial, aunque se desconoce la longitud de contexto soportada y, por tanto, cuántos turnos puede retener de forma fiable.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no. El repositorio declara únicamente `en`. No hay evidencia de soporte para castellano ni para otros idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponibles en la información proporcionada. No hay ninguna indicación de multimodalidad.
- Ejecución local en hardware limitado: gracias a las cuantizaciones GGUF de 0,6 a 2,4 GB, es viable en equipos de gama baja y en CPU.

## Casos de uso

- Asistente interno de operaciones sobre documentación propia: el modelo puede integrarse en un pipeline RAG que recupere runbooks, procedimientos y políticas de la empresa y use el modelo para redactar la respuesta. Su tamaño de 1,17B permite desplegarlo en la misma máquina que el resto del stack sin coste de GPU dedicada.
- Clasificación y enrutado de tickets: dado su bajo coste por inferencia, resulta adecuado para etiquetar incidencias por categoría, urgencia o equipo responsable antes de pasarlas a un modelo mayor o a un humano. Es un uso realista incluso sin benchmarks publicados, porque la tarea es acotada y verificable.
- Extracción de datos estructurados de texto libre: convertir correos, informes de turno o notas de incidencias en JSON con campos predefinidos. El formato GGUF y los cuants Q4_K_M permiten ejecutarlo en local con latencia de milisegundos por petición en GPU de gama media.
- Resumen de registros operativos: condensar logs de incidencias, actas de guardia o hilos de correo extensos en resúmenes breves. Requiere verificar la ventana de contexto real, que no está documentada.
- Prototipado rápido y evaluación de la familia tanpo-ops: sirve para probar si el ajuste SFT del modelo base aporta valor en un dominio concreto antes de invertir en una versión mayor o en un fine-tuning propio.
- Despliegue en el borde o en entornos aislados: al caber en 0,6-0,8 GB, puede ejecutarse en mini-PC, portátiles sin GPU dedicada o entornos sin conexión a internet mediante llama.cpp u Ollama, algo inviable con modelos de 7B o superiores.
- Generación asistida de borradores de procedimientos: redactar el primer esqueleto de un runbook o de un checklist a partir de una descripción breve, siempre con revisión humana posterior dado el riesgo de alucinación de un modelo de este tamaño.
- Base para fine-tuning en dominio: al ser un modelo pequeño, es asequible reentrenarlo o ajustarlo con LoRA sobre datos propios de operaciones en una única GPU de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Ni la model card del repositorio GGUF ni los metadatos del modelo base incluyen puntuaciones de MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación, y no se dispone de datos comparativos con modelos de tamaño similar.

## Requisitos de hardware

- VRAM estimada para inferencia (cifras orientativas, calculadas a partir del tamaño de los ficheros más la caché KV y el overhead de la librería; la caché KV depende de una longitud de contexto que no está documentada):
  - Q2_K (0,6 GB): en torno a 1 GB de VRAM efectiva.
  - Q4_K_M o Q4_K_S (0,8 GB): en torno a 1,2-1,5 GB de VRAM.
  - Q8_0 (1,3 GB): en torno a 2 GB de VRAM.
  - f16 (2,4 GB): en torno a 3-4 GB de VRAM.
- GPU recomendadas: no se especifican en la información disponible. Por tamaño, cualquier GPU con 4 GB o más de VRAM es suficiente en las cuantizaciones habituales; una RTX 3060, RTX 4060 o superior ofrece margen amplio, y tarjetas de gama de entrada o integradas pueden bastar en Q4.
- ¿Cabe en GPU de consumo? Sí. Es uno de los puntos fuertes del repositorio: las variantes Q4 caben en 2 GB de VRAM, por lo que funciona en portátiles con gráfica integrada moderna y en equipos con GPU de gama baja.
- Inferencia en CPU: viable sin GPU, ya que los ficheros Q4 rondan 0,8 GB y el modelo tiene 1,17B de parámetros.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, llama-cpp-python y text-generation-webui (llama.cpp). El soporte de GGUF en vLLM es parcial y no está confirmado para esta conversión concreta. El propio autor remite a los README de TheBloke para el uso de ficheros GGUF.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia para ninguna de las cuantizaciones.

## Comparativa con modelos similares

No es posible elaborar una comparativa rigurosa con la información disponible: no se conocen la arquitectura, la longitud de contexto, el rendimiento ni el proceso de entrenamiento del modelo base, y tampoco se han publicado benchmarks que permitan situarlo frente a alternativas. La tabla siguiente refleja únicamente lo que consta de forma explícita.

| Modelo | Parámetros | Contexto | Licencia | Formatos | Disponibilidad |
|---|---|---|---|---|---|
| d4rkninja/tanpo-ops (vía mradermacher/tanpo-ops-GGUF) | 1,17B | no disponible | lfm-1.0 | safetensors (base) y GGUF (12 cuantizaciones) | pública en HuggingFace, 0 descargas |
| Alternativa de la misma categoría (~1B) | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. No hay documentación sobre la composición del dataset `d4rkninja/tanpo-ops-sft` ni sobre evaluaciones de sesgo.
- Riesgo de alucinación: alto por diseño, dado que se trata de un modelo de 1,17B sin benchmarks publicados. No conviene usarlo en tareas donde una respuesta incorrecta tenga consecuencias sin un mecanismo de verificación posterior.
- Idioma: solo inglés declarado. No hay evidencia de que responda correctamente en castellano; si se necesita multilingüismo, hay que validarlo empíricamente antes de asumirlo.
- Contexto: se desconoce la longitud máxima de contexto. Cualquier caso de uso que dependa de ventanas largas debe validarse primero.
- Licencia: `lfm-1.0`, catalogada como `other` en HuggingFace, es decir, no es una licencia de código abierto permisiva estándar (MIT, Apache 2.0). Implica condiciones adicionales que hay que leer en el texto completo antes de un uso comercial, y esas condiciones afectan también a la redistribución de estas cuantizaciones.
- Ausencia de cuantizaciones con imatrix: el autor indica que no existen versiones weighted/imatrix en el momento de la publicación, lo que puede traducirse en una pérdida de calidad algo mayor en los cuants de 2 a 4 bits frente a las variantes con imatrix de otros repositorios.
- Falta de validación comunitaria: 0 descargas y 0 likes. No hay retroalimentación de terceros, informes de errores ni comparaciones independientes.
- Información del modelo base muy escasa: la model card del repositorio GGUF es una plantilla genérica de mradermacher y no incluye datos del autor original sobre arquitectura, entrenamiento o evaluación.
- Fechas de los metadatos: el repositorio figura como creado en septiembre de 2026, un dato que conviene verificar en la propia página de HuggingFace.
- Uso en producción: no recomendable como componente crítico sin una evaluación propia previa sobre el dominio objetivo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/tanpo-ops-GGUF
- Modelo base: https://huggingface.co/d4rkninja/tanpo-ops
- Dataset de ajuste: https://huggingface.co/datasets/d4rkninja/tanpo-ops-sft
- Página de resumen de cuantizaciones del autor: https://hf.tst.eu/model#tanpo-ops-GGUF
- Peticiones de modelos y preguntas frecuentes del cuantizador: https://huggingface.co/mradermacher/model_requests
- Guía de uso de ficheros GGUF (referencia del autor): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de perplejidad entre cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Sitio del patrocinador del cuantizador (nethype GmbH): https://www.nethype.de/

Nota: los resultados de la búsqueda web proporcionados no contenían enlaces relevantes al modelo, ya que correspondían a páginas de soporte de Microsoft sin relación con esta publicación.

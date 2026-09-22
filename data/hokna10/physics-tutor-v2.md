# hokna10/physics-tutor-v2

## Resumen

physics-tutor-v2 es un ajuste fino (fine-tuning) publicado por el usuario hokna10 en HuggingFace, desarrollado a partir del modelo base unsloth/Qwen3-14B-unsloth-bnb-4bit, que a su vez deriva del Qwen3-14B de Alibaba. Por el nombre, el modelo está orientado a actuar como tutor de física, si bien la model card no documenta el conjunto de datos de entrenamiento, el procedimiento seguido ni los objetivos concretos del ajuste. El repositorio ocupa 0,3 GB, un tamano muy inferior al de unos pesos completos de 14 000 millones de parámetros en bf16 (en torno a 28 GB), lo que sugiere que podría tratarse de adaptadores LoRA en lugar de pesos fusionados, aunque esta circunstancia no se confirma en la documentación publicada.

La relevancia de esta ficha es limitada desde el punto de vista de la evaluación técnica: el modelo no presenta descargas ni valoraciones, no incluye resultados de benchmarks y su model card es la plantilla automática de Unsloth, sin información sobre datos, hiperparámetros ni evaluación. Se desconoce igualmente si el ajuste se realizó sobre el modelo en precisión completa o sobre la versión cuantizada a 4 bits del repositorio base.

El interés principal radica en el modelo base subyacente, Qwen3-14B, un transformer denso de 14 800 millones de parámetros con soporte de modo de razonamiento explícito, ventana de contexto de 32 768 tokens extensible mediante YaRN y licencia Apache 2.0, lo que lo hace apto para uso comercial. Cualquier evaluación seria de physics-tutor-v2 debería partir de la comparación con ese modelo base, ya que no hay evidencia publicada de que el ajuste aporte mejoras medibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con decodificador (heredada de Qwen3-14B; no confirmada por el autor en el repositorio) |
| Parametros totales | 14 800 millones en el modelo base Qwen3-14B; no disponible para el ajuste concreto (el repo ocupa 0,3 GB) |
| Parametros activos | No aplica (el modelo base es denso, no MoE) |
| Longitud de contexto | No disponible en el repositorio; el modelo base Qwen3-14B soporta 32 768 tokens nativos, extensibles a 131 072 con YaRN |
| Tipos de cuantizacion | No disponible; el repositorio publica safetensors y el modelo base indicado esta en formato bnb-4bit |
| Idiomas soportados | en (unico idioma declarado en la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card no describe la arquitectura del ajuste ni el procedimiento de entrenamiento. Lo unico documentado es que el modelo parte de unsloth/Qwen3-14B-unsloth-bnb-4bit, una versión del Qwen3-14B adaptada por Unsloth para entrenamiento con menor consumo de memoria, y que el entrenamiento se realizó con la librería Unsloth, que la propia tarjeta describe como "2x faster". Las etiquetas del repositorio incluyen `trl`, lo que apunta al uso de TRL (Transformer Reinforcement Learning) de HuggingFace, probablemente mediante SFTTrainer, aunque no se especifica si hubo una fase de ajuste supervisado, DPO u otro método de alineamiento.

Del modelo base Qwen3-14B sí se conocen las características generales: arquitectura transformer densa con decodificador, atención con consultas agrupadas (GQA), ventana de contexto nativa de 32 768 tokens ampliable a 131 072 mediante escalado YaRN, y un modo dual que alterna entre razonamiento extendido (thinking) y respuesta directa. No obstante, no hay confirmación de que estas capacidades se hayan preservado tras el ajuste, ni de cuántos tokens se usaron, ni de la composición del dataset. Tampoco se documenta ninguna innovación técnica propia. El tamano del repositorio (0,3 GB) es compatible con adaptadores LoRA de bajo rango, con pesos parciales o con un error de carga, escenarios que la documentación no permite distinguir.

## Capacidades

- Generacion de texto en ingles, heredada del modelo base Qwen3-14B (no verificada tras el ajuste).
- Resolucion de problemas de fisica y matematicas a nivel educativo, inferida del nombre del modelo; no hay evaluacion publicada que lo respalde.
- Razonamiento paso a paso: el modelo base Qwen3-14B incorpora un modo de pensamiento explicito, aunque se desconoce si el ajuste lo conserva.
- Soporte de tool calling / function calling: presente en el modelo base Qwen3-14B, sin confirmacion en este ajuste.
- Razonamiento multi-paso y uso en agentes: no disponible; sin documentacion ni ejemplos en el repositorio.
- Capacidades multilingues: no disponibles; la model card declara unicamente ingles.
- Capacidades especiales (vision, audio, decodificacion especulativa): no disponibles.
- Formato de instrucciones (chat template): no disponible; presumiblemente hereda el de Qwen3, sin confirmar.

## Casos de uso

- Tutoria de fisica a nivel de secundaria y bachillerato: el modelo se usaria para explicar conceptos como cinematica, dinamica newtoniana o termodinamica en conversaciones multi-turno. Es el escenario que sugiere el nombre del modelo, aunque no existe documentacion que acredite su calidad en esta tarea.
- Resolucion guiada de problemas de fisica: dado un enunciado, generar el desarrollo paso a paso y la solucion final. Aprovecha el modo de razonamiento del modelo base, si se ha preservado.
- Generacion de ejercicios y problemas de practica: producir enunciados con datos numericos y soluciones para que un docente los revise antes de usarlos. Requiere validacion humana por el riesgo de errores de calculo.
- Explicacion de unidades y analisis dimensional: comprobar la coherencia de unidades en desarrollos de fisica, una tarea acotada donde los errores son faciles de detectar.
- Asistente de estudio con contexto largo: la ventana de 32 768 tokens del modelo base (si se mantiene) permite mantener capitulos completos de un libro de texto en el contexto de una sesion de estudio.
- Prototipado de pipelines de generacion aumentada por recuperacion (RAG) sobre apuntes y libros de fisica: el modelo actuaria como generador final sobre fragmentos recuperados de una base documental.
- Base para experimentos de ajuste incremental: al ser un ajuste ligero sobre Qwen3-14B, puede servir como punto de partida para comparar tecnicas de fine-tuning en dominios cientificos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones de MMLU, GSM8K, HumanEval ni de dominios cientificos como GPQA o MMLU-Pro Physics, y el repositorio no presenta ningún otro documento de evaluación. Tampoco existe comparación publicada con el modelo base Qwen3-14B que permita determinar si el ajuste mejora o degrada el rendimiento original.

## Requisitos de hardware

Las siguientes cifras son estimaciones basadas en el tamano del modelo base Qwen3-14B (14 800 millones de parametros densos) y no en mediciones publicadas por el autor del ajuste.

- VRAM para inferencia en bf16/fp16: aproximadamente 28-30 GB de pesos, más 2-6 GB de cache KV segun la longitud de contexto, lo que exige GPUs de 40-48 GB (A100 40 GB, A6000 48 GB, L40S 48 GB).
- VRAM en cuantizacion de 8 bits: en torno a 15-16 GB, viable en RTX 4090 (24 GB) y L4 (24 GB).
- VRAM en cuantizacion de 4 bits (GGUF Q4_K_M o AWQ/GPTQ): aproximadamente 9-10 GB, con margen para contexto moderado en RTX 4080/4090, RTX 3090 y tarjetas de 12-16 GB.
- Consumer GPU: si, en cuantizaciones de 4 bits cabe en GPUs de 12 GB o mas; en 8 bits requiere al menos 16-24 GB.
- Opciones de despliegue: la etiqueta text-generation-inference sugiere compatibilidad con TGI; tambien son esperables vLLM, SGLang, llama.cpp y Ollama en formato GGUF, y transformers con bitsandbytes para cuantizacion en carga. No hay confirmacion oficial de ninguna de estas opciones para este repositorio concreto.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia de primera respuesta.
- Nota: dado que el repositorio ocupa 0,3 GB, es probable que no contenga pesos completos y que sea necesario descargar el modelo base y cargar los adaptadores por separado, algo que la model card no aclara.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| hokna10/physics-tutor-v2 | No disponible (base de 14,8 B) | No disponible (base: 32 768 tokens) | Apache 2.0 | HuggingFace, 0 descargas | Sin benchmarks publicados |
| Qwen3-14B (modelo base) | 14,8 B densos | 32 768 tokens, 131 072 con YaRN | Apache 2.0 | HuggingFace, ampliamente desplegado | Benchmarks publicados por el autor del modelo base; no reproducidos aqui por no formar parte de la informacion proporcionada |
| Qwen3-14B-unsloth-bnb-4bit | 14,8 B en 4 bits | 32 768 tokens | Apache 2.0 | HuggingFace | Sin benchmarks propios; es una version de entrenamiento del anterior |
| Phi-4 (Microsoft) | 14,7 B densos | 16 384 tokens | MIT | HuggingFace | No disponible en la informacion proporcionada |
| Gemma 3 12B (Google) | 12 B densos | 131 072 tokens | Licencia Gemma | HuggingFace | No disponible en la informacion proporcionada |

La comparacion es estructural: no existen datos de rendimiento de physics-tutor-v2 que permitan establecer una comparacion funcional con alternativas de tutoria o de razonamiento cientifico.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card es la plantilla automatica de Unsloth y no describe datos, hiperparametros, metodologia ni limitaciones.
- Sin evaluacion publicada: no hay benchmarks, pruebas cualitativas ni ejemplos de uso que permitan estimar la calidad de las respuestas.
- Riesgo elevado de alucinacion en fisica y matematicas: los errores en desarrollos algebraicos, constantes fisicas y unidades son plausibles y no han sido medidos. Cualquier uso educativo requiere revision humana.
- Repositorio de 0,3 GB: es muy probable que no contenga los pesos completos del modelo y que se trate de adaptadores o de un subconjunto de archivos. Conviene verificar el contenido antes de integrarlo.
- Idiomas: la model card declara unicamente ingles, por lo que no hay garantia de un comportamiento correcto en castellano.
- Sesgos: no documentados por el autor; el modelo hereda los sesgos del corpus de entrenamiento de Qwen3-14B y del dataset de ajuste, que se desconoce.
- Licencia: Apache 2.0 permite uso comercial, pero conviene comprobar que el modelo base y los datos de ajuste no impongan restricciones adicionales (Qwen3-14B es Apache 2.0, por lo que no deberia haber conflicto).
- Trazabilidad: el repositorio no indica la fecha ni la version exacta del modelo base empleado, ni el numero de pasos de entrenamiento, lo que dificulta reproducir el ajuste.
- Inconsistencia temporal: la fecha de creacion registrada en HuggingFace (2026-09-22) es posterior a la fecha actual del analisis; conviene verificar la validez de los metadatos.
- Sin mantenimiento aparente: 0 descargas y 0 valoraciones, sin evidencia de actualizaciones posteriores.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/hokna10/physics-tutor-v2
- Modelo base indicado en la tarjeta: https://huggingface.co/unsloth/Qwen3-14B-unsloth-bnb-4bit
- Repositorio de Unsloth (mencionado en la model card): https://github.com/unslothai/unsloth
- Resultados de la busqueda web: no se ha encontrado ningun enlace relevante sobre este modelo. Las busquedas devolvieron exclusivamente contenidos de foros sobre Facebook en frances y castellano, sin relacion alguna con el modelo, por lo que no se incluyen.
- Paper, blog o demo oficial: no disponibles.

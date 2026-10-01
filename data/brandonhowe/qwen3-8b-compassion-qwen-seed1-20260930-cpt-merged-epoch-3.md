# BrandonHowe/Qwen3-8b-compassion-qwen-seed1-20260930-CPT-merged-epoch-3

## Resumen

Qwen3-8b-compassion-qwen-seed1-20260930-CPT-merged-epoch-3 es un modelo de generación de texto derivado de Qwen/Qwen3-8B-Base mediante entrenamiento continuado (continued pretraining, CPT) sobre un corpus de compasión. Lo publica el usuario de HuggingFace BrandonHowe y se distribuye como pesos fusionados en BF16, sin adaptador LoRA, listos para cargar directamente con transformers. El checkpoint corresponde a la época 3.0 (paso 1125) de un experimento de ajuste sobre el dataset `CompassioninMachineLearning/compassion_12185_cleaned`.

El modelo tiene 8.190.735.360 parámetros (unos 8,19 mil millones) y un repositorio de 16,4 GB, coherente con pesos BF16 empaquetados en ocho shards de safetensors. Su interés es principalmente de investigación: explora si el entrenamiento continuado sobre un corpus específico de compasión modifica el comportamiento del modelo base. La propia model card advierte de que el entrenamiento no demuestra una mejora en compasión y que ese aspecto debe evaluarse por separado.

Se trata de un artefacto experimental, con 0 descargas y 0 likes en el momento de la consulta, sin licencia declarada, sin idiomas declarados y sin resultados de benchmarks publicados. No está pensado como modelo de producción sin una evaluación previa, y cualquier uso comercial queda en un terreno legal ambiguo al no especificarse la licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, familia Qwen3 (heredada del modelo base Qwen/Qwen3-8B-Base); detalles de capas y atencion no disponibles en la informacion proporcionada |
| Parametros totales | 8.190.735.360 (8,19 mil millones) |
| Parametros activos | No aplica: el modelo es denso, no MoE |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos en BF16 sin cuantizar |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (BF16, ocho shards, fusionados con `save_pretrained_merged`, `save_method="merged_16bit"`) |
| Biblioteca | transformers (text-generation, text-generation-inference, endpoints_compatible) |
| Modelo base | Qwen/Qwen3-8B-Base |
| Dataset de entrenamiento | CompassioninMachineLearning/compassion_12185_cleaned (revision 95e233baf48a7751bcec55a08347697ed6e4c4a8) |
| Checkpoint | Epoca 3.0, paso 1125 |
| Tamano del repositorio | 16,4 GB |
| Fecha de creacion | 2026-09-30 |

## Arquitectura y entrenamiento

La arquitectura corresponde al modelo base Qwen/Qwen3-8B-Base, un transformer denso de 8,19 mil millones de parametros. La informacion proporcionada no detalla el numero de capas, el esquema de atencion (por ejemplo, si usa grouped-query attention), la dimension oculta ni la ventana de contexto nativa; esos datos habria que consultarlos en la ficha del modelo base. Este checkpoint concreto no introduce cambios estructurales: es el resultado de continuar el preentrenamiento del modelo base y fusionar despues los pesos.

El entrenamiento consistio en un continued pretraining sobre el dataset `compassion_12185_cleaned`. Por cada epoca se usaron 10.000 documentos distintos mas 2.000 exposiciones repetidas, con 200 documentos de validacion disjuntos. El checkpoint publicado es el de la epoca 3.0, paso 1125. La fusion se realizo con la funcion nativa de Unsloth `save_pretrained_merged(save_method="merged_16bit")`, validando los pesos en BF16 y empaquetandolos sin perdida en ocho shards de safetensors; no se requiere ningun adaptador para cargar el modelo. La model card indica que existe un `run_manifest.json` con la revision base, los hashes de seleccion de documentos, los hiperparametros de entrenamiento y la validacion de la exportacion. No se documentan tecnicas adicionales como RLHF, DPO, decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto autoregresiva en la linea del modelo base Qwen3-8B-Base.
- Continuacion y generacion de texto libre (pipeline `text-generation`).
- Perfil declarado como conversacional en las etiquetas del repositorio, si bien al derivar de un modelo Base no se documenta un formato de chat ni un ajuste por instrucciones.
- Compatibilidad con text-generation-inference y con endpoints compatibles, segun las etiquetas del repositorio.
- Especializacion tematica orientada a contenido relacionado con la compasion, fruto del corpus de CPT.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, vision, audio ni modo de pensamiento (thinking mode) en la informacion proporcionada.
- Cobertura multilingue: no disponible.

## Casos de uso

- Investigacion en NLP afectivo: comparar las respuestas de este checkpoint con las del modelo base Qwen3-8B-Base sobre un mismo conjunto de prompts, para estudiar si el CPT sobre el corpus de compasion altera el tono o el contenido de las respuestas generadas.
- Evaluacion de metodologias de continued pretraining: el par (modelo base, checkpoint de epoca 3.0) permite medir el efecto de la exposicion repetida (10.000 documentos unicos mas 2.000 repeticiones) frente a una sola pasada.
- Generacion de texto con sesgo tematico controlado: redaccion de borradores de material divulgativo o educativo sobre empatia y cuidado, siempre con revision humana posterior.
- Estudio de deriva de comportamiento (catastrophic forgetting): analizar si el ajuste sobre un corpus estrecho degrada capacidades generales del modelo base en tareas como matematicas o codigo, mediante baterias de evaluacion comparativas.
- Base para posteriores ajustes supervisados: al distribuirse como pesos fusionados BF16 sin adaptador, puede servir como punto de partida para un SFT o un DPO especifico sobre datos propios.
- Reproducibilidad de experimentos: el `run_manifest.json` con hashes de seleccion de documentos e hiperparametros permite auditar y replicar el entrenamiento dentro de un entorno de investigacion.
- Prototipado de asistentes conversacionales de apoyo: con la advertencia de que no hay evidencia publicada de mejora en compasion ni evaluacion de seguridad, y de que no se documenta licencia, por lo que no es apto para despliegue en produccion sin analisis legal y de calidad previos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de ninguna otra bateria, y advierte explicitamente de que el entrenamiento no establece una mejora en compasion, que debe evaluarse por separado.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16 (precision de publicacion): aproximadamente 17-20 GB solo para pesos, mas la memoria de activaciones y cache KV, que depende de la longitud de contexto y del tamano de lote.
- VRAM estimada en cuantizaciones de 8 bits: del orden de 9-11 GB; en 4 bits: del orden de 5-7 GB. Estas cifras son estimaciones a partir del numero de parametros (8,19 mil millones), no datos publicados por el autor.
- GPU profesionales: A100 40 GB, H100 80 GB o L40S 48 GB pueden ejecutar el modelo en BF16 con margen amplio.
- GPU de consumo: cabe en RTX 4090 (24 GB) y RTX 3090 (24 GB) en BF16, con contexto limitado; en tarjetas de 16 GB o menos seria necesario cuantizar, lo que requiere generar los pesos cuantizados por cuenta propia porque el repositorio solo distribuye BF16.
- Opciones de despliegue: transformers (ruta principal), text-generation-inference y endpoints compatibles segun las etiquetas del repositorio. Para llama.cpp u Ollama habria que convertir previamente los pesos a GGUF, ya que no se publican archivos GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3-8b-compassion-qwen-seed1-20260930-CPT-merged-epoch-3 | 8,19 mil millones (denso) | No disponible | No disponible | Pesos BF16 fusionados en HuggingFace | Checkpoint experimental; 0 descargas; sin benchmarks |
| Qwen/Qwen3-8B-Base | 8,19 mil millones (denso) | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Repositorio publico del modelo base en HuggingFace | Modelo de partida; sin ajuste sobre el corpus de compasion |
| Otras alternativas de ~8B | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificados en la informacion proporcionada para establecer una comparacion de rendimiento |

No se dispone de resultados de benchmarks del modelo evaluado ni de sus alternativas en la informacion proporcionada, por lo que no es posible comparar rendimiento numerico.

## Limitaciones y advertencias

- Riesgo de alucinacion: es un modelo de generacion de texto sin salvaguardas documentadas; la model card no menciona evaluaciones de veracidad ni de seguridad.
- Sin evidencia de mejora en compasion: la propia model card afirma que el entrenamiento no establece una mejora en ese aspecto y que debe evaluarse por separado.
- Licencia no declarada: al no especificarse licencia, el uso comercial queda en un terreno juridico incierto. Hay que verificar las condiciones de Qwen/Qwen3-8B-Base antes de cualquier uso.
- Idiomas no declarados: no hay confirmacion de cobertura multilingue para este checkpoint concreto.
- Contexto no documentado: se desconoce la ventana de contexto efectiva tras el entrenamiento continuado.
- Deriva por entrenamiento continuado: el ajuste sobre un corpus estrecho (10.000 documentos unicos, mas 2.000 repeticiones por epoca) puede degradar capacidades generales del modelo base; no se aportan evaluaciones que lo descarten (catastrophic forgetting).
- Ausencia de ajuste por instrucciones: al derivar de un modelo Base, no se documenta plantilla de chat ni entrenamiento SFT/RLHF/DPO, por lo que el seguimiento de instrucciones puede ser pobre pese a la etiqueta "conversational".
- Sesgos del dataset: los sesgos y la composicion del corpus `compassion_12185_cleaned` se trasladan al modelo; no se documenta ningun proceso de filtrado o mitigacion.
- Solo pesos BF16: no hay versiones cuantizadas oficiales, lo que eleva los requisitos de VRAM y complica el despliegue en hardware de consumo.
- Escasa adopcion y mantenimiento: 0 descargas, 0 likes y actualizacion el mismo dia de la creacion; no hay senales de soporte continuado.
- Fecha del checkpoint (2026) y ausencia de versionado adicional: conviene revisar `run_manifest.json` para reproducir el experimento antes de confiar en los resultados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BrandonHowe/Qwen3-8b-compassion-qwen-seed1-20260930-CPT-merged-epoch-3
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B-Base
- Dataset de entrenamiento: https://huggingface.co/datasets/CompassioninMachineLearning/compassion_12185_cleaned
- Repositorio de Qwen3 (referencia del modelo base): https://github.com/QwenLM/Qwen3
- Ficha del modelo Qwen3-8B (referencia de la familia): https://huggingface.co/Qwen/Qwen3-8B
- No se han encontrado papers, blogs ni demos adicionales en la informacion proporcionada.

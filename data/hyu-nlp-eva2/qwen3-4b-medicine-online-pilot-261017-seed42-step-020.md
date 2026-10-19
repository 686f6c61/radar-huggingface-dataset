# HYU-NLP-EVA2/qwen3-4b-medicine-online-pilot-261017-seed42-step-020

## Resumen

`qwen3-4b-medicine-online-pilot-261017-seed42-step-020` es un ajuste fino del modelo denso Qwen/Qwen3-4B-Instruct-2507, publicado por el usuario HYU-NLP-EVA2. Se trata de un checkpoint intermedio (step 20) de una ejecución de entrenamiento denominada `261017_medicine_online_pilot_seed42`, con semilla 42, orientada a lo que el autor describe como "medicine online-rubrics pilot". El repositorio contiene un export en BF16 para Transformers y, en la carpeta `original_checkpoint/`, los ficheros nativos veRL/FSDP junto con sus metadatos.

El modelo conserva la arquitectura y el tamaño del modelo base: 4.022.468.096 parámetros (aproximadamente 4,02 mil millones), transformer decoder-only denso, sin mezcla de expertos. La licencia declarada es Apache 2.0 y el pipeline es text-generation con soporte de TGI y endpoints compatibles.

Su relevancia es limitada y experimental: se trata de un artefacto de investigación con 0 descargas y 0 likes en el momento de redactar esta ficha, sin model card descriptiva del dataset, del algoritmo de entrenamiento ni de resultados de evaluación. No debe confundirse con un modelo médico listo para producción; es un punto de control de un piloto de ajuste con rúbricas en dominio sanitario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen3, variante Instruct-2507 del modelo base) |
| Parametros totales | 4.022.468.096 (4,02 B), dato real de safetensors |
| Parametros activos | No aplica: el modelo base Qwen3-4B es denso, no MoE |
| Longitud de contexto | No disponible en la informacion proporcionada (se hereda del modelo base; consultar la model card de Qwen/Qwen3-4B-Instruct-2507) |
| Tipos de cuantizacion | No publicados por el autor. El repositorio incluye un export en BF16; al ser un transformer denso de 4 B es cuantizable a GGUF/AWQ/GPTQ con herramientas estandar |
| Idiomas soportados | No disponible (el campo de idiomas no esta declarado en el repositorio) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (export BF16 para Transformers) + checkpoint nativo veRL/FSDP en `original_checkpoint/` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen3-4B-Instruct-2507: un transformer decoder-only denso de 4,02 B de parametros. El autor no documenta ninguna modificacion estructural, de modo que cabe asumir que el ajuste es puramente de pesos. El repositorio ocupa 25,7 GB, muy por encima de los ~8 GB que requieren los pesos en BF16, lo que es coherente con la presencia del checkpoint nativo de entrenamiento (estados de optimizador y metadatos de FSDP) en `original_checkpoint/`.

Respecto al entrenamiento, la informacion disponible es minima: se conoce el nombre de la ejecucion (`261017_medicine_online_pilot_seed42`), la semilla (42), el paso del checkpoint (20) y el uso de la pila veRL/FSDP. El termino "rubrics" en el nombre y el empleo de veRL apuntan a un ajuste por refuerzo guiado por rubricas en el dominio medico, pero no se especifican el algoritmo concreto, el volumen de tokens, la composicion del dataset, ni si hubo etapas de SFT, DPO o RLHF adicionales. Tampoco se detalla ninguna innovacion tecnica especifica mas alla del pipeline de entrenamiento distribuido.

## Capacidades

- Generacion de texto conversacional en el dominio general, heredada del modelo base Instruct.
- Respuesta a preguntas y razonamiento de dominio medico, presumiblemente reforzado por el piloto de rubricas (sin evaluacion publicada que lo cuantifique).
- Soporte de conversaciones multi-turno mediante plantilla de chat de la familia Qwen3.
- Compatibilidad con Text Generation Inference y endpoints compatibles con la API de inferencia, segun los tags del repositorio.
- Capacidad de tool calling y de razonamiento multi-paso: no verificada en este checkpoint concreto; depende de lo que preserve del modelo base y de lo que el ajuste haya podido degradar.
- Capacidades multimodales, de audio o de thinking mode explicito: no disponibles o no documentadas.

## Casos de uso

- Evaluacion comparativa de ajustes con rubricas: utilizar este checkpoint (step 20) como referencia intermedia frente a otros pasos de la misma ejecucion para medir como evoluciona la adherencia a criterios de evaluacion medicos.
- Investigacion en RL para dominio sanitario: reproducir o auditar la dinamica de entrenamiento a partir de los ficheros veRL/FSDP incluidos en `original_checkpoint/`.
- Generacion de respuestas borrador a preguntas medicas de caracter educativo, siempre con revision humana y sin uso clinico directo.
- Construccion de un corpus sintetico de preguntas y respuestas medicas para tareas de anotacion o filtrado previo por parte de revisores expertos.
- Pruebas de regresion de pipelines de inferencia: al ser un modelo de 4 B en BF16, sirve como carga ligera para validar despliegues en TGI o endpoints compatibles antes de pasar a modelos mayores.
- Experimentacion academica en evaluacion automatica de respuestas medicas mediante rubricas, comparando las salidas del modelo con puntuaciones de evaluadores humanos.
- Prototipado de asistentes de documentacion clinica en entornos de laboratorio, con datos sinteticos o anonimizados y sin exposicion a pacientes reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tabla de evaluacion, ni metricas de MMLU, HumanEval, GSM8K o MedQA, ni comparaciones con el modelo base. Cualquier cifra que se atribuya a este checkpoint sin una evaluacion propia debe considerarse no verificada.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 8 GB solo para pesos, mas cache KV y overhead del runtime; en la practica, del orden de 10-12 GB para contextos moderados. Cifra derivada del numero de parametros, no publicada por el autor.
- VRAM estimada en FP8/INT8: alrededor de 4-5 GB de pesos, con overhead adicional segun longitud de contexto.
- VRAM estimada en cuantizacion de 4 bits (GGUF Q4_K_M): aproximadamente 2,5-3 GB de pesos, viable en GPUs consumer de 8 GB con contextos cortos.
- GPU recomendadas: A100 40/80 GB o H100 para servir en BF16 con contextos largos y concurrencia; RTX 4090 (24 GB) o RTX 3090 (24 GB) sobradas para BF16 en un solo flujo.
- Cabe en GPU consumer: si. En BF16 en RTX 4090/3090/4080 (16 GB) con contexto moderado; en cuantizacion de 4-8 bits en tarjetas de 8-12 GB.
- Opciones de despliegue: Transformers, Text Generation Inference (soportado segun tags), vLLM, llama.cpp u Ollama previa conversion a GGUF, y endpoints compatibles con la API de inferencia.
- Latencia y throughput: no disponibles. No se han publicado mediciones del autor.
- Nota de almacenamiento: el repositorio completo ocupa 25,7 GB por el checkpoint nativo de entrenamiento; para servir solo hace falta el export BF16, no la carpeta `original_checkpoint/`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Naturaleza | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (`...step-020`) | 4,02 B | No disponible | Apache 2.0 | Ajuste con rubricas medicas, paso 20 de un piloto | 0 descargas, sin evaluacion |
| Qwen/Qwen3-4B-Instruct-2507 (base) | 4,02 B | No disponible en esta ficha; consultar su model card | Apache 2.0 | Modelo instruct generalista de referencia | Publico y ampliamente utilizado |
| Qwen2.5-3B-Instruct | ~3,09 B | No disponible en esta ficha | Apache 2.0 | Instruct generalista de menor tamano | Publico |
| Llama-3.2-3B-Instruct | ~3,21 B | No disponible en esta ficha | Licencia comunitaria Llama 3.2 | Instruct generalista de menor tamano | Publico, con restricciones de licencia |

No se dispone de datos de rendimiento comparativos entre estos modelos en la informacion proporcionada; la comparativa se limita a parametros, licencia y disponibilidad. Frente al modelo base, la unica diferencia verificable es el ajuste adicional y la presencia de artefactos de entrenamiento; no hay evidencia publicada de mejora en tareas medicas.

## Limitaciones y advertencias

- Checkpoint intermedio (step 20) de un piloto: no representa el resultado final de la ejecucion y puede estar infraentrenado o inestable.
- Ausencia total de evaluacion: sin benchmarks, sin evaluacion clinica y sin comparacion con el modelo base, no hay evidencia de que el ajuste mejore nada.
- Riesgo alto de alucinacion en contenido medico: no es un dispositivo medico ni debe usarse para diagnostico, prescripcion o decision clinica.
- Idiomas no declarados: se desconoce si el ajuste conserva el rendimiento multilingue del modelo base o lo ha degradado hacia un unico idioma.
- Datos de entrenamiento no documentados: se desconocen la procedencia, el volumen y la posible presencia de datos personales o con derechos, lo que impide evaluar sesgos y contaminacion.
- Sesgos potencialmente heredados del modelo base y amplificados por un corpus de rubricas no descrito.
- Trazabilidad limitada: el autor no publica hiperparametros, objetivo de entrenamiento ni criterios de parada.
- El repositorio incluye estados de optimizador en `original_checkpoint/`; su redistribucion y uso deben revisarse antes de reutilizarlos en produccion.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de garantias y de validacion clinica hace desaconsejable cualquier despliegue en entornos sanitarios reales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HYU-NLP-EVA2/qwen3-4b-medicine-online-pilot-261017-seed42-step-020
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Framework de entrenamiento veRL: https://github.com/volcengine/verl
- Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los enlaces obtenidos correspondian a sitios no relacionados (Hyundai France, canales de YouTube, ONE Championship y catalogos de Hyper U) y se han descartado por no aportar informacion tecnica.

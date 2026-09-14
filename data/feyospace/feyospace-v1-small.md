# feyospace/feyospace-v1-small

## Resumen

feyospace-v1-small es un modelo multimodal de tipo image-text-to-text publicado en Hugging Face por el usuario feyospace. Segun los metadatos del repositorio, cuenta con 27.781.427.952 parametros (aproximadamente 27,8 mil millones) almacenados en safetensors de precision BF16, lo que da un peso total en disco de unos 55,6 GB, coherente con el tamano declarado del repositorio. La model card indica que el paquete incluye pesos completos, tokenizer, chat template y configuracion de procesador de imagen y video, con una longitud de contexto declarada de 262.144 tokens.

El modelo se distribuye unicamente en pesos completos: no incluye estado de entrenamiento ni de optimizador, y no se publican variantes cuantizadas. La etiqueta `qwen3_5` del repositorio sugiere un parentesco con la familia de arquitecturas Qwen3.5, aunque el autor no documenta la arquitectura base ni el procedimiento de entrenamiento, por lo que esta relacion no puede confirmarse con la informacion disponible.

Su relevancia actual es limitada y debe interpretarse con cautela: el repositorio registra 0 descargas y 0 likes, no incluye licencia declarada, no especifica idiomas soportados y no aporta resultados de benchmarks ni detalles del dataset de entrenamiento. Se trata, por tanto, de un artefacto de pesos potencialmente util para experimentacion interna o evaluacion propia, pero no de un modelo listo para produccion sin una validacion previa exhaustiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card solo indica que se conservan los identificadores de clase de arquitectura y de procesador para compatibilidad de carga; la etiqueta del repositorio es `qwen3_5`) |
| Parametros totales | 27.781.427.952 (27,78 mil millones, dato real de safetensors) |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE en la informacion proporcionada) |
| Longitud de contexto | 262.144 tokens (segun la model card) |
| Tipos de cuantizacion | no se publican variantes cuantizadas; el repositorio solo contiene pesos BF16. La cuantizacion posterior (GPTQ, AWQ, bitsandbytes, GGUF) no esta verificada por el autor |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16) |
| Tamano del repositorio | 55,6 GB |
| Pipeline declarado | image-text-to-text |
| Libreria | transformers |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-14 |
| Ultima actualizacion | 2026-09-14 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna. Los unicos datos tecnicos explicitos son que se trata de un modelo con procesador de imagen y video, que emplea un chat template propio y que mantiene los identificadores de clase de arquitectura y procesador necesarios para cargarse con `transformers`. La etiqueta `qwen3_5` asociada al repositorio apunta a una posible base de la familia Qwen3.5, pero el autor no lo confirma ni especifica si se trata de un ajuste, una destilacion o un entrenamiento desde cero. Tampoco se detalla si la atencion es completa, con ventana deslizante o con algun esquema hibrido, ni la configuracion de cabezas, capas o dimension oculta.

En cuanto al entrenamiento, la informacion disponible es practicamente nula: no se indica el numero de tokens, la composicion del dataset, la mezcla de modalidades (texto, imagen, video), ni si hubo fases de ajuste supervisado, RLHF o DPO. El repositorio excluye explicitamente el estado de entrenamiento y de optimizador, por lo que solo se distribuyen los pesos finales. La unica innovacion tecnica constatable es la ventana de contexto declarada de 262.144 tokens, que situaria al modelo en el rango de contexto largo, si bien no hay ninguna evaluacion publicada que verifique el rendimiento efectivo en longitudes cercanas a ese limite.

## Capacidades

- Generacion de texto conversacional: el pipeline declarado es `image-text-to-text` con etiqueta `conversational`, e incluye chat template.
- Procesamiento de imagen: el repositorio incorpora configuracion de procesador de imagen, por lo que se espera soporte de entrada visual junto a texto.
- Procesamiento de video: la model card menciona configuracion de procesador de video, lo que sugiere capacidad de manejar secuencias temporales, aunque no se documenta su alcance (numero de frames, resolucion, muestreo temporal).
- Contexto largo: 262.144 tokens declarados, apto en teoria para documentos extensos, transcripciones o historiales completos.
- Tool calling / function calling: no documentado en la informacion disponible.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Modo thinking o razonamiento explicito: no documentado.
- Capacidades multilingues: no documentadas; no se declara ninguna lista de idiomas.
- Capacidades de audio: no documentadas.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que el repositorio esta preparado para desplegarse mediante Inference Endpoints de Hugging Face.

## Casos de uso

- Analisis de documentos escaneados en contexto largo: combinando la entrada de imagen con la ventana de 262.144 tokens, el modelo podria procesar lotes de facturas, contratos o informes en PDF convertidos a imagen y responder preguntas sobre el conjunto completo sin fragmentar el material. Requiere validacion previa de la calidad de OCR implicita.
- Extraccion de datos estructurados de capturas e interfaces: dado su pipeline image-text-to-text, es candidato para convertir pantallazos de paneles, formularios o tablas en JSON o CSV, util en automatizacion de back office. La precision debe medirse con un conjunto de evaluacion propio, ya que no hay benchmarks publicados.
- Descripcion y etiquetado de catalogos de producto: generacion de descripciones textuales y metadatos a partir de fotografias de producto, con el texto resultante revisado antes de publicarse. El contexto largo permitiria mantener consistencia de estilo a lo largo de un lote grande.
- Resumen de grabaciones o material audiovisual: si la configuracion de video funciona como se espera, podria resumir reuniones, clases o incidencias grabadas. Es el caso de uso con mayor incertidumbre, porque no se documentan ni el muestreo de frames ni los limites de duracion.
- Asistente conversacional autoalojado con datos sensibles: al distribuirse pesos completos, puede desplegarse en infraestructura propia y on-premise, lo que resulta adecuado para entornos con requisitos de confidencialidad (legal, sanitario, industrial) siempre que se resuelva antes la cuestion de la licencia.
- Evaluacion comparativa e investigacion: el modelo sirve como objeto de estudio para medir el comportamiento de una arquitectura multimodal de ~28 B con contexto de 262.144 tokens, comparando su rendimiento real frente a las cifras declaradas.
- Base para fine-tuning especifico de dominio: los pesos BF16 en safetensors y el chat template incluido permiten plantear ajustes supervisados o con LoRA sobre dominios concretos, partiendo de un modelo ya multimodal.
- Prototipado rapido de aplicaciones vision-lenguaje: mediante la etiqueta `endpoints_compatible`, se puede levantar un endpoint de pruebas en Hugging Face sin gestionar infraestructura propia, util para validar una idea de producto antes de invertir en GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna evaluacion (MMLU, HumanEval, GSM8K, MMMU, DocVQA ni similares), y los resultados de la busqueda web no contienen referencias tecnicas al modelo: unicamente aparecen paginas de calculadoras de fechas sin relacion alguna con el proyecto.

## Requisitos de hardware

Las cifras de esta seccion son estimaciones derivadas del recuento de parametros (27,78 B) y del formato BF16, no de la configuracion real de capas y cabezas del modelo, que no esta disponible.

| Precision | Peso aproximado de los pesos | VRAM practica estimada | GPU de ejemplo |
|---|---|---|---|
| BF16 (formato publicado) | ~55,6 GB | 64-80 GB, mas cache KV | A100 80 GB, H100 80 GB, 2 x RTX 4090/5090 con tensor parallel |
| FP8 | ~27,8 GB | 40-48 GB | L40S 48 GB, RTX 6000 Ada 48 GB, A6000 |
| INT8 | ~27,8 GB | 32-48 GB | A100 40 GB con margen ajustado |
| INT4 / AWQ / GPTQ | ~14-16 GB | 24 GB o mas segun contexto | RTX 4090 24 GB, RTX 5090, L4 |

- Cache KV: no puede calcularse con exactitud sin conocer el numero de capas, de cabezas KV y la dimension de cabeza. A modo de referencia, la formula es 2 x capas x cabezas KV x dimension de cabeza x bytes por valor x longitud de secuencia. Con 262.144 tokens, la cache KV puede superar con holgura el tamano de los propios pesos si el modelo no usa GQA agresivo ni atencion con ventana; en la practica, el contexto completo exigira paralelismo de tensor y almacenamiento de cache en GPU de 80 GB o en multiples GPU.
- Cabe en GPU de consumo: si, tras cuantizacion a 4 bits, en tarjetas de 24 GB como la RTX 4090, y en tarjetas de 32 GB como la RTX 5090, aunque con longitudes de contexto muy reducidas respecto a los 262.144 tokens declarados. En BF16 no cabe en ninguna GPU de consumo actual.
- Opciones de despliegue: `transformers` (libreria declarada), vLLM y SGLang (soporte multimodal dependiente de la arquitectura real), Hugging Face Inference Endpoints (etiqueta `endpoints_compatible`), TGI. Para llama.cpp u Ollama seria necesaria una conversion a GGUF que el autor no proporciona.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos verificados para establecer una comparativa cuantitativa. La unica referencia aportada por el propio repositorio es la etiqueta `qwen3_5`, que sugiere parentesco con la familia Qwen3.5, pero el autor no especifica el modelo base ni el procedimiento seguido.

| Modelo | Parametros | Contexto | Licencia | Rendimiento | Disponibilidad |
|---|---|---|---|---|---|
| feyospace-v1-small | 27,78 B | 262.144 tokens (declarado) | no disponible | no disponible | Pesos BF16 en Hugging Face, 0 descargas |
| Alternativas multimodales de rango 20-35 B (por ejemplo, modelos de las familias Qwen-VL, Gemma, InternVL) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |

No se han encontrado en la busqueda web articulos, papers ni comparativas que sitúen a este modelo frente a alternativas de su categoria. Cualquier comparacion debera realizarse mediante evaluacion propia.

## Limitaciones y advertencias

- Ausencia total de licencia: no se declara licencia en el repositorio. Sin una licencia explicita no puede asumirse permiso de uso comercial, redistribucion ni modificacion. Es un bloqueo directo para cualquier despliegue en produccion.
- Trazabilidad insuficiente: no se documenta el modelo base, el dataset de entrenamiento, el numero de tokens ni las fases de ajuste, lo que impide evaluar la procedencia de los datos y los posibles sesgos heredados.
- Riesgo de alucinacion: inherente a los modelos generativos. En tareas de extraccion de datos a partir de imagenes, un fallo silencioso puede introducir informacion inexistente en sistemas posteriores; se recomienda validacion por reglas y revision humana.
- Contexto declarado no verificado: los 262.144 tokens figuran en la model card, pero no hay ninguna evaluacion que mida la degradacion del rendimiento en longitudes largas. Es probable que el rendimiento efectivo decaiga mucho antes del limite declarado.
- Idiomas desconocidos: al no declararse lista de idiomas, no puede asumirse un soporte solido en castellano u otras lenguas; requiere prueba directa.
- Capacidades multimodales sin especificar: se menciona procesador de imagen y video, pero no se detallan resoluciones, numero de frames, formatos admitidos ni limites practicos.
- Tool calling y comportamiento de agente no documentados: no deben presuponerse en el diseno de una aplicacion.
- Madurez ecosistemica nula: 0 descargas y 0 likes en el momento de la consulta, sin issues, demos ni referencias externas. La ausencia de comunidad reduce la probabilidad de detectar y corregir problemas.
- Compatibilidad de despliegue incierta: aunque el repositorio es `transformers` y esta marcado como `endpoints_compatible`, no se garantiza que motores de inferencia de alto rendimiento como vLLM o SGLang reconozcan la arquitectura sin trabajo adicional.
- Coste de inferencia elevado: 27,78 B de parametros en BF16 requieren hardware de gama alta, y mantener contexto muy largo multiplica el consumo de memoria por la cache KV.
- Fechas del repositorio: creado y actualizado el 2026-09-14, sin historial posterior que permita juzgar el mantenimiento del proyecto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/feyospace/feyospace-v1-small
- Paper: no disponible
- Blog o articulo tecnico: no disponible
- Repositorio de codigo: no disponible
- Demo o espacio interactivo: no disponible
- Los resultados de la busqueda web no aportan enlaces relevantes: se limitan a calculadoras de fechas (timeanddate.com, timedatecalc.com, daysfromdate.com, calculator.today, calculator.net) sin relacion con el modelo.

# DesaiJayM/Llama-Gujarat-8B

## Resumen

Llama Gujarat 8B es un adaptador LoRA construido sobre meta-llama/Llama-3.1-8B-Instruct, publicado por DesaiJayM (Dr. Jay Desai) para adaptar el modelo base al guyaratí (código de idioma `gu`), manteniendo el inglés como idioma de retención. No es un modelo completo: el repositorio contiene únicamente los pesos del adaptador PEFT en safetensors (0,2 GB) y requiere descargar por separado los pesos del modelo base de Meta, cuya licencia hay que aceptar previamente.

El objetivo declarado es investigación lingüística: seguir instrucciones, traducción estructurada y respuesta a preguntas con contexto proporcionado en guyaratí. El autor documenta un proceso de entrenamiento en siete etapas (cinco con QLoRA NF4 y dos finales en BF16 nativo) y una evaluación de desarrollo sobre 48 preguntas de autoría propia, más un test pequeño de retención en inglés. La model card insiste explícitamente en que estos resultados no constituyen benchmarks independientes ni permiten afirmar una calidad general de traducción, matemáticas o bilingüismo.

La relevancia del proyecto reside en su nicho: el guyaratí es un idioma con cobertura limitada en los grandes modelos abiertos, y este adaptador es un punto de partida reproducible (receta y código publicados) para experimentar con adaptación de bajo rango sobre Llama 3.1 8B. El propio autor advierte de limitaciones aritméticas conocidas y de que la evaluación cuantizada no es la configuración medida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only denso, meta-llama/Llama-3.1-8B-Instruct |
| Parametros totales | No disponible para el adaptador (el repositorio ocupa 0,2 GB); modelo base de 8.000 millones de parametros |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card; al ser un adaptador hereda la ventana del modelo base, pero el dato no se especifica |
| Tipos de cuantizacion | Entrenamiento con QLoRA NF4 en las cinco primeras etapas; el autor indica que la inferencia cuantizada puede alterar los resultados y no es la configuracion medida (BF16 nativo) |
| Idiomas soportados | Guyaratí (gu) e ingles (en) |
| Licencia | llama3.1 (Llama 3.1 Community License de Meta) |
| Formato de pesos | safetensors (adaptador LoRA PEFT) |

## Arquitectura y entrenamiento

La pieza publicada es un adaptador LoRA sobre Llama 3.1 8B Instruct, un transformer decoder-only denso con atención causal estándar. El adaptador se entrenó en siete etapas secuenciales: `clean` (1 época a 2e-5), `refinement` (2 épocas a 5e-5), `bridge` (1 época a 3e-5), `terminology` (1 época a 1e-5), `coverage` (1 época a 2e-5), `transfer` (1 época a 1e-5) y `Gujarati arithmetic` (1 época a 1e-5). Las cinco primeras usaron QLoRA con cuantización NF4; las dos últimas continuaron el adaptador guardado con BF16 nativo y optimizadores nuevos.

La etapa final añadió 12.394 filas con explicaciones en guyaratí de acarreo, préstamo, multiplicación por columnas y porcentajes, además de conversión de numerales, con repetición (replay) de ejemplos en inglés y de contenido no matemático. La etapa completa supuso 775 pasos de optimizador; el autor aclara que los recuentos incluyen replay y no equivalen a ejemplos únicos. La pérdida de entrenamiento final fue de 0,0178173711; la pérdida de validación final sobre un conjunto de desarrollo de 122 ejemplos fue de 0,2046867821 frente a 0,4505630165 del modelo base emparejado. En un conjunto separado de 48 ejemplos, la pérdida fue de 0,0742802848 frente a 0,7192907749 del base. Estas cifras corresponden a NLL causal nativo en BF16 ponderado por tokens de finalización (incluyendo EOT), con el mismo colador y lote de 4, medidas en una evaluación con cero optimizador sobre una A100 de 80 GB y pesos finales sin modificar. La revisión del modelo base utilizada es `0e9e39f249a16976918f6564b8830bc894c89659` y el SHA256 del adaptador es `150c261d6b05e2f40efe01b131b29283ed527278d5cdcdb56f19f6a3e90081e2`.

## Capacidades

- Generación de texto conversacional en guyaratí e inglés, con pipeline declarado `text-generation`.
- Seguimiento de instrucciones en guyaratí, incluidas peticiones de respuesta corta.
- Traducción estructurada guyaratí-inglés: en la evaluación de desarrollo, las 16 traducciones planteadas preservaron el significado y todos los campos solicitados (sujeto, objeto, acción, destinatario y detalles numéricos).
- Respuesta a preguntas basada en contexto proporcionado: 8/8 respuestas recuperaron los dos campos de hábitat pedidos a partir de pasajes ficticios; 7/8 cumplieron estrictamente la restricción de responder solo con el hábitat (una repitió una frase extra del contexto).
- Aritmética elemental con explicaciones (acarreo, préstamo, multiplicación por columnas, porcentajes) y conversión de numerales, incorporadas en la etapa final de entrenamiento, si bien con limitaciones reconocidas.
- Retención limitada de inglés: un test de 6 ejemplos pasó tras normalizar mayúsculas y puntuación final.
- No se documenta soporte de tool calling, function calling, uso de agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento explícito.
- El autor indica expresamente que no se incluye ni se ha probado una integración con calculadora o agente.

## Casos de uso

- Traducción asistida guyaratí-inglés de documentos estructurados: el modelo ha mostrado preservar campos y detalles numéricos en plantillas, por lo que encaja en flujos donde se traducen formularios, fichas o registros con estructura fija, siempre con revisión humana.
- Atención al cliente en guyaratí: permite mantener conversaciones multi-turno en ese idioma partiendo de un modelo instruct ya alineado, útil para organizaciones que atienden a población gujaratí-parlante.
- Extracción de datos a partir de un contexto suministrado (RAG ligero): las pruebas con pasajes proporcionados indican que puede responder preguntas cerradas apoyándose únicamente en el texto aportado, un patrón típico de resumen de contratos, informes o artículos.
- Investigación en adaptación lingüística de bajo coste: al ser un adaptador LoRA de 0,2 GB con receta y código publicados, sirve como caso de estudio reproducible para experimentar con QLoRA NF4 y etapas de refinamiento sucesivas sobre Llama 3.1 8B.
- Creación de material educativo en guyaratí: generación y adaptación de explicaciones y enunciados en ese idioma, con revisión posterior para evitar errores factuales.
- Prototipado de asistentes bilingües gu/en: el adaptador mantiene cierta capacidad en inglés (test de retención de 6 ejemplos) además del guyaratí, lo que permite construir demos que alternan idiomas.
- Normalización de numerales y explicaciones aritméticas básicas: puede emplearse para generar borradores de operaciones paso a paso en guyaratí, integrado después con una calculadora externa que valide el resultado, dado que el propio autor recomienda esa verificación.
- Evaluación comparativa de adaptadores sobre Llama 3.1 8B: útil como referencia en estudios internos sobre qué gana y qué se pierde al especializar el modelo base en un idioma de bajos recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar independentes (MMLU, HumanEval, GSM8K, etc.) para este adaptador en la informacion disponible. La model card solo aporta una evaluación de desarrollo de autoría propia sobre 48 preguntas, además de un test de retención en inglés de 6 ejemplos, y advierte explícitamente de que no son benchmarks independientes ni cabeceras de rendimiento.

| Prueba de desarrollo (autoría del autor) | Resultado | Referencia |
|---|---|---|
| Traducciones estructuradas (significado y campos) | 16/16 | No aplica |
| Campos de hábitat con contexto suministrado | 8/8 en los campos centrales; 7/8 estrictamente solo hábitat | No aplica |
| Aritmética en guyaratí (12 preguntas) | 8/12 | Umbral original exigido: 11/12 (no superado) |
| Aritmética en inglés (12 preguntas) | 8/12 | Umbral original exigido: 11/12 (no superado) |
| Retención mínima de inglés (6 ejemplos) | 6/6 normalizado | No es un benchmark amplio de inglés |
| Pérdida de validación final (122 ejemplos) | 0,2046867821 | Base emparejado: 0,4505630165 |
| Pérdida en conjunto separado (48 ejemplos) | 0,0742802848 | Base emparejado: 0,7192907749 |
| Pérdida de entrenamiento final | 0,0178173711 | No aplica |

Datos del modelo base citados por el autor, no del adaptador: Meta reporta 84,5 % en GSM8K con 8 ejemplos y cadena de pensamiento, y 51,9 % en MATH con 0 ejemplos y cadena de pensamiento para Llama 3.1 8B Instruct. El autor subraya que son benchmarks en inglés y no establecen la misma tasa de error para el adaptador. Ninguna de las respuestas de la evaluación de desarrollo alcanzó el límite de 192 tokens establecido en las pruebas.

## Requisitos de hardware

- Inferencia en BF16 nativo (configuración medida): los pesos del modelo base de 8.000 millones de parametros ocupan aproximadamente 16 GB, por lo que se necesitan del orden de 18-20 GB de VRAM contando activaciones y caché KV. La evaluación del autor se realizó en una A100 de 80 GB.
- GPU consumer: una RTX 4090 (24 GB) o RTX 3090 (24 GB) deberían poder ejecutar el modelo base en BF16 junto con el adaptador. En GPUs de 16 GB (RTX 4080, RTX 4060 Ti 16 GB) o menos es necesario recurrir a cuantización.
- Inferencia cuantizada: el autor señala que la cuantización puede alterar los resultados y no es la configuración medida; en 4 bits los pesos de un modelo de 8B bajan a unos 5-6 GB, lo que lo hace viable en GPUs de 8-12 GB, pero con degradación no cuantificada en la model card.
- Entrenamiento: las cinco primeras etapas se hicieron con QLoRA NF4; las dos finales con BF16 nativo, lo que implica requisitos de VRAM superiores a los de la inferencia cuantizada.
- Despliegue: el autor proporciona un `inference.py` en el repositorio de código, pensado para PyTorch 2.6.0 con CUDA 12.4 y el fichero `requirements-gpu.txt`. El paquete usa `peft`, por lo que es compatible con el ecosistema de Transformers.
- vLLM o TGI: no documentado por el autor para este adaptador, aunque son opciones habituales para servir adaptadores LoRA sobre Llama 3.1 8B.
- llama.cpp u Ollama: no se proporcionan pesos en formato GGUF en el repositorio; su uso exigiría convertir tanto el modelo base como el adaptador, algo no documentado ni probado.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento documentado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama Gujarat 8B (adaptador LoRA) | Base de 8.000 M; adaptador de 0,2 GB en repositorio | No disponible (hereda del base) | Evaluación de desarrollo propia: 16/16 traducciones, 8/12 aritmética en guyaratí, 8/12 en inglés | llama3.1 | HuggingFace, requiere aceptar la licencia de Meta y descargar el base |
| meta-llama/Llama-3.1-8B-Instruct (modelo base) | 8.000 M | No especificado en la información proporcionada | GSM8K 84,5 % (8 ejemplos, CoT); MATH 51,9 % (0 ejemplos, CoT) | llama3.1 | HuggingFace (Meta) |
| Otros ajustes fino orientados al guyaratí o a idiomas indios | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks independientes ni de comparaciones controladas con otras alternativas centradas en guyaratí en la información proporcionada.

## Limitaciones y advertencias

- Limitación aritmética declarada: 8/12 en guyaratí y 8/12 en inglés en la pantalla de desarrollo, por debajo del umbral de 11/12 que el propio autor se había fijado. El lanzamiento se autoriza asumiendo explícitamente esta limitación.
- Los resultados de evaluación provienen de pruebas pequeñas, de autoría propia, con plantillas compartidas y revisadas por el autor; no son benchmarks independientes ni permiten afirmar precisión factual, matemática o bilingüe general.
- Riesgo de alucinación y de errores numéricos: el autor recomienda validar cantidades y operaciones y ejecutar una calculadora o código para cualquier cálculo exacto. No se incluye ni se ha probado integración con calculadora o agente.
- Una de las ocho respuestas con contexto suministrado repitió una frase extra de la fuente, incumpliendo la restricción de responder solo con el campo solicitado (7/8 estrictas).
- Los conjuntos completos de pruebas nuevas e históricas no se generaron tras la parada original de desarrollo; los resultados fallidos se conservan en el registro.
- La inferencia cuantizada puede cambiar los resultados respecto a la configuración BF16 medida.
- Licencia llama3.1 (Llama 3.1 Community License): es necesario aceptar la licencia de Meta y disponer de acceso a meta-llama/Llama-3.1-8B-Instruct. El uso comercial está sujeto a las condiciones de dicha licencia, incluidas las cláusulas de atribución y el umbral de 700 millones de usuarios mensuales.
- No se documentan sesgos específicos, pero al derivar de Llama 3.1 8B Instruct hereda los sesgos y comportamientos del modelo base, no evaluados en esta ficha.
- Cobertura idiomática limitada a guyaratí e inglés; no se documentan otros idiomas ni su calidad.
- No se documenta soporte de tool calling, agentes, visión, audio ni modo de pensamiento.
- El repositorio público excluye deliberadamente los paquetes de entrada privados, credenciales, registros de ejecución, pesos del modelo base y adaptadores anteriores no exitosos.
- La fecha de creación indicada en HuggingFace es 2026-10-06, posterior a la fecha de publicación de esta ficha en los registros consultados; se reproduce tal cual aparece en la ficha del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DesaiJayM/Llama-Gujarat-8B
- Código: https://github.com/jaydesaigu-arch/llama-gujarat-8b
- Página del proyecto: https://www.leoai.in/models/llama-gujarat-8b/
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Model card del base con los resultados de GSM8K y MATH: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct#instruction-tuned-models
- Nota: las búsquedas web realizadas no devolvieron resultados relevantes sobre este modelo; los enlaces anteriores proceden de la información de HuggingFace y de la model card del autor.

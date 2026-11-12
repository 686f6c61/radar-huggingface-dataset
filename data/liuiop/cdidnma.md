# liuiop/CDIDNMA

## Resumen

CDIDNMA (publicado por el autor liuiop bajo el nombre interno CAIAAD) es un adaptador LoRA para el modelo multimodal Qwen/Qwen3-VL-8B-Instruct, especializado en extracción de hechos científicos con anclaje de evidencia (evidence-grounded fact extraction). El adaptador transforma pasajes de artículos científicos en hechos estructurados compuestos por una cita textual literal, un valor numérico completo, su unidad original y un campo perteneciente a una taxonomía fija de 26 campos.

El modelo está entrenado específicamente sobre un corpus de desalinización capacitiva (CDI) y tratamiento de aguas: electroadsorción, superficies antibacterianas y química de ROS/H2O2. Resuelve el problema de que el modelo base no respeta el contrato de salida estructurado: según la model card, el Qwen3-VL-8B sin adaptador produce cero hechos que pasen el validador determinista, mientras que este adaptador alcanza un 84 % de precisión en el checkpoint publicado (época 4).

Es relevante porque demuestra un patrón práctico de ajuste fino barato (43,6 M de parámetros entrenables, 0,50 % del modelo base, entrenado en una única RTX 5090) para tareas de extracción de información científica con verificación determinista, un caso de uso creciente en pipelines de literatura científica automatizada. El repositorio ocupa 0,2 GB y se distribuye en formato PEFT/safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer multimodal Qwen3-VL-8B-Instruct |
| Parametros totales | 8B (modelo base) + 43.646.976 parámetros entrenables del adaptador (0,50 %) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen3-VL-8B-Instruct) |
| Tipos de cuantizacion | no disponible (entrenado en bf16 sin cuantizacion; el adaptador es compatible con el base cuantizado segun PEFT, no verificado) |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Libreria | peft |
| Tamano del repositorio | 0,2 GB |
| Modelo base | Qwen/Qwen3-VL-8B-Instruct |
| Configuracion LoRA | r=16, alpha=32, dropout=0.05, proyecciones q/k/v/o/gate/up/down |
| Fecha de publicacion | 2026-11-11 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-VL-8B-Instruct, un transformer multimodal (texto e imagen) de 8.000 millones de parametros. El ajuste es un SFT con LoRA en precision bf16 sin cuantizacion, con perdida causal-LM calculada unicamente sobre los tokens del asistente. La configuracion LoRA usa r=16, alpha=32, dropout de 0,05 y se aplica a las proyecciones q/k/v/o/gate/up/down. El optimizador es AdamW (betas 0,9/0,95, weight decay 0,01) con OneCycleLR, batch de 1 con acumulacion de gradiente de 8 y secuencia de 1.536 tokens. Se entrenaron 796 pasos (epoca 4 de 8) en una unica RTX 5090 de 24 GB con un pico de 22,0 GB.

Los datos de entrenamiento consisten en 7.556 hechos extraidos de 1.974 pasajes de 955 publicaciones del corpus CDI/tratamiento de aguas. Los objetivos no son anotacion humana, sino extracciones del modelo Qwen3-VL-30B auditadas por un validador determinista que comprueba cita literal, valor contenido en la cita, campo permitido, adyacencia de unidad y reglas de ensayo/atribucion. Los splits se hacen por DOI de publicacion para evitar fuga entre conjuntos: 1.587 pasajes y 6.049 hechos en entrenamiento, 199 pasajes y 776 hechos en validacion, y 188 pasajes y 731 hechos en test. La auditoria upstream elimino 1.132 de 8.745 hechos candidatos (591 afirmaciones erroneas, 541 pendientes de revision de reglas).

## Capacidades

- Extraccion de hechos cientificos estructurados a partir de pasajes de articulos: cita literal, valor numerico, unidad y campo de una taxonomia fija de 26 campos.
- Cumplimiento estricto de un contrato de salida JSON con mensajes de la forma `system=<protocolo de extraccion>` y `user={"task": "structured_scientific_extraction", "passages": [<chunk>]}`.
- Anclaje de evidencia: cada hecho debe incluir una cita textual verificable del pasaje de origen.
- Manejo de valores numericos con unidades y reglas de adyacencia unidad-valor.
- Capacidades multimodales heredadas del modelo base Qwen3-VL-8B-Instruct (vision y texto), aunque el adaptador esta entrenado para extraccion sobre texto cientifico.
- Soporte de ingles y chino (idiomas declarados).
- No se documenta soporte de tool calling, function calling, agentes multi-paso ni modo thinking especifico del adaptador.

## Casos de uso

- Extraccion automatizada de tablas de hechos en revision sistematica de literatura: el adaptador convierte pasajes de articulos de CDI y tratamiento de aguas en hechos estructurados con cita literal, lo que permite construir bases de datos de resultados experimentales (capacidad de adsorcion, potencial, concentracion de ROS) con trazabilidad a la publicacion original.
- Construccion de bases de conocimiento cientificas con procedencia: al exigir cita textual y validador determinista, los hechos extraidos pueden almacenarse junto al DOI y el pasaje de origen, facilitando auditoria posterior y citacion de las publicaciones originales.
- Enriquecimiento de repositorios de literatura interna: un equipo de materiales puede procesar lotes de PDFs y obtener campos normalizados de una taxonomia de 26 campos para alimentar motores de busqueda semantica o dashboards de seguimiento.
- Control de calidad de extracciones previas: el adaptador puede re-ejecutarse sobre pasajes ya procesados para detectar hechos que no cumplen las reglas del validador (valor fuera de la cita, unidad no adyacente) y marcarlos para revision.
- Prototipado rapido de pipelines de extraccion en dominios cientificos: el bajo coste de entrenamiento (43,6 M de parametros, una sola GPU de 24 GB) sirve como plantilla para adaptar el mismo esquema a otros dominios cientificos con corpus propios.
- Extraccion asistida en laboratorio: dado un fragmento de un articulo recien publicado, obtener de forma inmediata los valores numericos clave con su unidad y cita para compararlos con resultados propios, reduciendo el tiempo de lectura manual.
- Docencia y formacion en NLP cientifico: el adaptador y su configuracion de entrenamiento sirven como ejemplo reproducible de ajuste fino con validacion determinista sobre un modelo multimodal de 8B.

## Benchmarks y rendimiento

Evaluacion en 12 pasajes no vistos, con cada hecho producido re-verificado por el mismo validador determinista:

| Checkpoint | Hechos producidos | Pasan validador | Precision |
|---|---|---|---|
| Este adaptador (epoca 4) | 44 | 37 | 84 % |
| Epoca 8 (final) | 43 | 32 | 74 % |
| Qwen3-VL-8B base (sin adaptador) | 50 | 0 | 0 % |

Perdida de validacion: 0,0897 en la epoca 4 y 0,1025 en la epoca 8 (sobreajuste posterior). No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base es de 8B parametros; en bf16 requiere aproximadamente 16 GB solo para pesos, mas memoria para el adaptador (unos 87 MB en bf16 para 43,6 M de parametros) y el contexto. En cuantizacion de 4 bits el base cabria en torno a 5-6 GB, aunque no se ha verificado la compatibilidad del adaptador con el base cuantizado.
- GPU recomendadas: el entrenamiento se realizo en una unica RTX 5090 de 24 GB con 22,0 GB de pico. Para inferencia en bf16 se recomienda una GPU de 24 GB o superior (RTX 4090, RTX 5090, A100 40/80 GB, H100).
- Cabe en GPU de consumo: si, en RTX 4090 o RTX 5090 en bf16; en GPUs de 12-16 GB probablemente sea necesario cuantizar el modelo base.
- Opciones de despliegue: al ser un adaptador PEFT, se carga con `peft.PeftModel.from_pretrained` sobre el base con `transformers`; el despliegue en vLLM, TGI, llama.cpp u Ollama no esta documentado en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CDIDNMA (este) | 8B base + 43,6 M adaptador | no disponible | Extraccion de hechos cientificos CDI | Apache-2.0 | Hugging Face, 10 descargas |
| Qwen3-VL-8B-Instruct (base) | 8B | no disponible | Multimodal general | Apache-2.0 | Hugging Face |
| Qwen3-VL-30B (generador de objetivos) | 30B | no disponible | Extraccion cientifica general | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con otros adaptadores de extraccion cientifica en la informacion proporcionada.

## Limitaciones y advertencias

- Los objetivos de entrenamiento son generados por maquina y auditados por validador, no adjudicados por humanos; la auditoria upstream elimino 1.132 de 8.745 hechos candidatos.
- La perdida de validacion aumenta tras la epoca 4 (0,1025 en la epoca 8), por lo que los checkpoints posteriores estan sobreajustados y no se publicaron.
- Recall desigual: algunos pasajes producen demasiados pocos hechos y otros sobre-extraen (un pasaje genero 10 hechos donde la referencia tenia 2).
- Entrenado exclusivamente para literatura de CDI y tratamiento de aguas; otros dominios no estan probados.
- El adaptador puede emitir frases literales de articulos cientificos; es necesario citar las publicaciones originales al reutilizar las citas extraidas.
- Riesgo de alucinacion en valores o citas no presentes en el pasaje, mitigado pero no eliminado por el validador determinista.
- La evaluacion se realizo sobre solo 12 pasajes no vistos, una muestra pequena que limita la robustez de la precision reportada.
- Licencia Apache-2.0 compatible con uso comercial, pero los datos de entrenamiento derivan de literatura cientifica publicada y el corpus no se redistribuye en el repositorio.
- Solo soporta ingles y chino segun la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/liuiop/CDIDNMA
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Libreria PEFT: https://github.com/huggingface/peft
- No se han encontrado papers, blogs, repositorios o demos adicionales en la informacion proporcionada.

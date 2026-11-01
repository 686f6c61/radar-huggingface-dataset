# itsDigvijaysing/jiwo-0.8b-openvino-int8

## Resumen

jiwo-0.8b-openvino-int8 es una conversión a OpenVINO de 8 bits del modelo eljiwo/jiwo-0.8b, un modelo de decisión de 0,8 mil millones de parámetros entrenado para clasificar comandos de voz en una de varias opciones predefinidas. No es un modelo generativo de propósito general: recibe un estado, una pregunta y un menú de opciones en tiempo de petición, y devuelve una probabilidad calibrada por opción. El autor de la conversión, itsDigvijaysing, lo publica para el modo batería de AI Linux Assistant, un asistente de voz local para Linux, donde el modelo elige la herramienta adecuada en una GPU integrada Intel mientras la GPU NVIDIA permanece inactiva.

La conversión mantiene el comportamiento del original y reduce la dependencia de software: solo necesita `openvino`, `tokenizers` y `numpy`, sin PyTorch. Los pesos se comprimen a 8 bits con NNCF `compress_weights` (asimétrico, por canal) y el repositorio ocupa 0,76 GB. El modelo base emplea una arquitectura derivada de Qwen3.5 con atención lineal recurrente, exportada de forma que cualquier longitud de prompt funciona sin relleno.

Es relevante para quienes despliegan clasificadores de intención o enrutadores de herramientas en hardware Intel sin acelerador dedicado, y para quienes necesitan inferencia de baja latencia en CPU o iGPU con un consumo de memoria inferior a 1 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.5 con atención lineal recurrente; cabeza de lectura de 255 códigos |
| Parametros totales | 0,8 mil millones (según nombre del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (soporta cualquier longitud de prompt por el operador loop de OpenVINO) |
| Tipos de cuantizacion | INT8 asimétrico por canal (NNCF `compress_weights`) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | OpenVINO IR (`openvino_model.xml` + binarios) |

## Arquitectura y entrenamiento

El modelo base eljiwo/jiwo-0.8b se exportó con el pipeline de generación de texto Qwen3.5 de Optimum Intel (`export_from_model`): el backbone se trata como un `Qwen3_5ForCausalLM` cuya cabeza de salida es la lectura de 255 códigos propia de jiwo. La recurrencia de atención lineal se convierte en un único operador loop de OpenVINO, lo que permite procesar prompts de cualquier longitud sin relleno. Los pesos se comprimen a 8 bits con NNCF en modo asimétrico y por canal.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo original. La model card indica que la evaluación de la conversión se realizó sobre 771 peticiones (comandos escritos a mano y datos de test en inglés de MASSIVE y CLINC150), comparando contra el original en PyTorch sobre CPU. Los ficheros `tokenizer.json`, `tokenizer_config.json`, `chat_template.jinja`, `decision_config.json` y `LICENSE` son los originales sin modificar.

## Capacidades

- Clasificación de decisiones: recibe un estado, una pregunta y un menú de 2 a un máximo de opciones entrenadas, y devuelve una probabilidad calibrada por opción.
- Enrutamiento de herramientas (tool routing): selecciona la herramienta adecuada para un comando de voz entre un menú de hasta 26 opciones en las pruebas publicadas.
- Probabilidades calibradas: la salida se normaliza con la temperatura de tipo `choice` definida en `decision_config.json`, lo que permite aplicar umbrales de confianza (por ejemplo, el 2 % usado en la evaluación).
- Tratamiento del estado como datos: el prompt de sistema indica explícitamente que el contenido del estado no debe interpretarse como instrucciones.
- Inferencia sin PyTorch: solo requiere `openvino`, `tokenizers` y `numpy`.
- Ejecución en CPU x86-64 y en GPU integradas Intel; no hay backend para NVIDIA.
- No se documentan capacidades de generación libre, razonamiento multi-paso, código, matemáticas, visión, audio ni tool calling en el sentido de function calling estructurado.

## Casos de uso

- Enrutamiento de comandos de voz en asistentes locales: el modelo recibe la transcripción y un menú de herramientas (volumen, brillo, etc.) y devuelve la probabilidad de cada una; con una latencia mediana de 0,5 s por decisión en una Iris Xe, encaja en un bucle de interacción por voz.
- Modo batería en portátiles con GPU híbrida: al ejecutarse en la iGPU Intel, permite mantener la GPU NVIDIA en suspensión y reducir el consumo energético en un asistente de escritorio.
- Clasificación de intención en dominios cerrados: con menús de 2 a 26 opciones, sirve para enrutar peticiones de usuario a intents predefinidos en inglés, apoyándose en los datos de MASSIVE y CLINC150 usados en la evaluación.
- Filtrado con umbral de confianza: las probabilidades calibradas permiten descartar decisiones por debajo de un umbral (el 2 % en las pruebas) y derivar a un fallback o a un humano; en la evaluación, las acciones erróneas a ese umbral fueron del 2,3 %.
- Despliegue en equipos sin acelerador dedicado: al ocupar 0,76 GB y necesitar solo OpenVINO, cabe en portátiles y mini-PC con CPU x86-64, con un tiempo de carga de unos 8 s en frío y 1 s con la caché de modelos de OpenVINO.
- Prototipado de clasificadores de decisión sin PyTorch: el ejemplo de la model card muestra cómo integrar el modelo en un script Python mínimo con `openvino`, `tokenizers` y `numpy`, útil para entornos con dependencias restringidas.
- Sustitución de un clasificador de intención en pipelines existentes: al conservar el tokenizador, la plantilla de chat y `decision_config.json` originales, se puede intercambiar por el modelo original manteniendo el mismo formato de prompt.

## Benchmarks y rendimiento

| Métrica | Original (PyTorch, CPU) | Esta copia (Intel Iris Xe) |
|---|---|---|
| Misma respuesta top-1 | — | 764 / 771 |
| Diferencia de confianza | — | mediana 0,005; máxima 0,06 |
| Enrutamiento de herramientas, menú de 26 opciones (528 peticiones) | 85,2 % | 84,5 % |
| Acciones erróneas al umbral del 2 % | 2,7 % | 2,3 % |
| Tiempo mediano por decisión (prompt de ~520 tokens) | 3,3 s | 0,5 s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/espacio en disco: 0,76 GB de pesos en INT8; el repositorio completo ocupa 0,8 GB.
- GPU: GPU integradas Intel (probado en Iris Xe); OpenVINO no tiene backend para NVIDIA.
- CPU: cualquier x86-64 con OpenVINO; el original en PyTorch se midió en CPU.
- Cabe en GPU de consumo: sí, en iGPU Intel y en CPU de portátiles; no se documenta soporte para GPU discretas de consumo.
- Despliegue: OpenVINO Runtime (`ov.Core().compile_model(..., "GPU")` o `"CPU"`); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia: mediana de 0,5 s por decisión con prompt de ~520 tokens en Iris Xe (i7-12700H); 3,3 s en el original sobre CPU en PyTorch.
- Carga: ~8 s la primera vez en i7-12700H con Iris Xe; ~1 s con la caché de modelos de OpenVINO.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| jiwo-0.8b-openvino-int8 (esta ficha) | 0,8 B | no disponible | Clasificación de decisiones con probabilidades calibradas | Apache-2.0 | OpenVINO IR INT8 |
| eljiwo/jiwo-0.8b (original) | 0,8 B | no disponible | Clasificación de decisiones con probabilidades calibradas | Apache-2.0 | PyTorch |
| Clasificadores de intención tipo BERT/base | no disponible | no disponible | Clasificación de intención | variable | safetensors, ONNX |

No se dispone de datos de rendimiento de terceros para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- No es un modelo generativo: solo devuelve una distribución de probabilidad sobre las opciones del menú; no produce texto libre.
- Solo inglés: la model card declara únicamente `en`; no se garantiza comportamiento en castellano ni en otros idiomas.
- Menú acotado: el número de opciones va de 2 al máximo entrenado (26 en las pruebas publicadas); fuera de ese rango el comportamiento no está documentado.
- Precisión no perfecta: 84,5 % de acierto en enrutamiento con 26 opciones y 2,3 % de acciones erróneas al umbral del 2 %; requiere umbrales de confianza y fallback en producción.
- Riesgo de confusión semántica entre opciones con descripciones solapadas; la calidad depende de cómo se redacten las descripciones del menú.
- Dependencia de hardware: sin backend NVIDIA en OpenVINO; el rendimiento medido corresponde a una Iris Xe concreta y puede variar en otras iGPU o CPU.
- Conversión no oficial: la model card indica explícitamente que no es un lanzamiento oficial de jiwo; para citas y uso de referencia debe emplearse el modelo original.
- Licencia Apache-2.0: permite uso comercial, pero debe conservarse el fichero `LICENSE` y atribuirse al autor original; los cambios respecto al original están listados en la model card.
- Sin datos publicados sobre sesgos, alucinación o robustez frente a entradas adversarias; el prompt de sistema mitiga la inyección de instrucciones en el estado, pero no hay evaluación documentada de ese riesgo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/itsDigvijaysing/jiwo-0.8b-openvino-int8
- Modelo base: https://huggingface.co/eljiwo/jiwo-0.8b
- Revisión del modelo base usada en la exportación: `71b7911cf68f7df52fdc2dbf07de1e158bb807f2`
- Optimum Intel: no disponible en la información proporcionada
- NNCF: no disponible en la información proporcionada
- OpenVINO: no disponible en la información proporcionada
- Paper, blog o repositorio del modelo original: no disponible en la información proporcionada

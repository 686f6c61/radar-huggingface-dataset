# mradermacher/ScreenHighlighterRL-4B-i1-GGUF

## Resumen

`mradermacher/ScreenHighlighterRL-4B-i1-GGUF` es un repositorio de cuantizaciones GGUF generadas por el usuario mradermacher a partir del modelo base `mustafaah/ScreenHighlighterRL-4B`. No se trata, por tanto, de un modelo entrenado por el autor del repositorio, sino de una conversión a formatos de peso GGUF (con cuantización ponderada mediante imatrix, según indica la propia model card) pensada para su uso con motores de inferencia compatibles con llama.cpp. El identificador del modelo sugiere un modelo de aproximadamente 4.000 millones de parámetros cuyo nombre ("ScreenHighlighterRL") apunta a un ajuste mediante aprendizaje por refuerzo orientado a tareas de resaltado o localización de elementos en pantalla, aunque la model card no confirma ni la modalidad ni la tarea concreta.

La información publicada es extremadamente escasa: el repositorio no declara licencia, idiomas, pipeline ni arquitectura, y en el momento de la consulta acumula 0 descargas y 0 "likes". El único dato técnico verificable es la lista de cuantizaciones disponibles (desde IQ1_S hasta Q6_K) y el recuento de parámetros presente en los metadatos de safetensors, que asciende a 958.716 y resulta incoherente con el sufijo "4B" del nombre del modelo.

Por su relevancia práctica, el interés de esta ficha se limita a la disponibilidad de pesos cuantizados de un modelo base del que apenas existe documentación pública. Cualquier evaluación de capacidades, idiomas o calidad requiere consultar directamente el repositorio del modelo original, que a día de hoy tampoco aporta datos verificables en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | 958.716 según los metadatos de safetensors facilitados (cifra no coherente con el sufijo "4B" del nombre; no verificable) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q2_K_S, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ4_XS, IQ4_NL (small-IQ4_NL) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |
| Modalidad de cuantización | ponderada con imatrix (importance matrix) |
| Modelo base | mustafaah/ScreenHighlighterRL-4B |
| Autor de la cuantización | mradermacher |
| Tamaño del repositorio | 0,0 GB según los metadatos de HuggingFace (dato no fiable) |
| Fecha de creación | 15 de septiembre de 2026 |
| Última actualización | 15 de septiembre de 2026 |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo base en los materiales disponibles. El nombre del repositorio incluye el sufijo "RL", lo que sugiere que el modelo base pudo haberse ajustado mediante aprendizaje por refuerzo, y el prefijo "ScreenHighlighter" apunta a una especialización en resaltado o selección de regiones de pantalla, pero ninguna de estas inferencias está confirmada por la model card ni por los metadatos del repositorio. Tampoco hay datos sobre el número de tokens de entrenamiento, la composición del dataset, la existencia de fases de RLHF o DPO, ni sobre innovaciones técnicas como decodificación especulativa o mecanismos de atención lineal.

Lo único documentado es el proceso de conversión y cuantización: la model card indica que se trata de cuantizaciones ponderadas con imatrix, un método que calcula una matriz de importancia a partir de estadísticas de activación para asignar más precisión a los tensores más sensibles y reducir el error de las cuantizaciones agresivas (IQ1, IQ2, Q3). El repositorio ofrece 24 variantes de cuantización, lo que permite ajustar el compromiso entre tamaño en disco y fidelidad respecto a los pesos originales. No se especifica si el modelo base es de tipo denso o MoE, ni si incorpora un codificador visual, aunque la ausencia de un fichero mmproj entre los artefactos listados sugiere que la conversión GGUF es exclusivamente de texto.

## Capacidades

- Generación de texto: no confirmada explícitamente, pero es la capacidad mínima esperable en un modelo convertido a GGUF y ejecutable con llama.cpp.
- Razonamiento: no disponible.
- Generación de código: no disponible.
- Matemáticas: no disponible.
- Visión: no disponible; el nombre "ScreenHighlighter" sugiere un posible componente visual, pero la conversión GGUF no incluye proyector multimodal y la model card no lo menciona.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; el sufijo "RL" del nombre podría indicar un ajuste orientado a tareas agénticas, sin confirmación.
- Capacidades multilingües: no disponible.
- Modo de pensamiento (thinking mode): no disponible.
- Audio: no disponible.

## Casos de uso

Advertencia previa: la model card no describe la funcionalidad del modelo. Los casos siguientes se derivan del nombre del repositorio y de las características propias de un modelo de ~4B parámetros cuantizado en GGUF, por lo que deben considerarse hipótesis de uso a validar experimentalmente.

- Localización y resaltado de elementos de interfaz: si el modelo base conserva capacidades de comprensión de capturas de pantalla, podría emplearse para identificar y devolver las coordenadas o regiones de elementos concretos de una UI (botones, campos de texto, iconos), alimentando herramientas de automatización o de accesibilidad.
- Automatización robótica de procesos (RPA) asistida por modelo: integrado en un bucle agéntico, el modelo podría decidir la siguiente acción sobre una pantalla y señalar el elemento objetivo, reduciendo la necesidad de selectores frágiles basados en DOM o en coordenadas fijas.
- Pruebas end-to-end de interfaces: en pipelines de QA de UI, el modelo podría verificar si un elemento esperado aparece en la pantalla tras una acción y marcar discrepancias visuales entre versiones de una aplicación.
- Soporte técnico guiado por pantalla: en un sistema de atención al usuario, el modelo podría recibir una captura del cliente y devolver una indicación resaltada del control que debe pulsar, siempre que se valide previamente su precisión en ese dominio.
- Anotación asistida y generación de datos sintéticos: un modelo especializado en resaltar regiones puede utilizarse para preetiquetar conjuntos de datos de grounding de UI, que después se revisan manualmente y se emplean para entrenar modelos mayores.
- Despliegue en local o en el borde: con cuantizaciones desde IQ1_S hasta Q6_K, el modelo puede ejecutarse en equipos sin GPU dedicada o con GPU de gama media, lo que habilita prototipos offline sin coste de API y sin enviar capturas de pantalla a servicios externos.
- Evaluación comparativa de cuantizaciones: dada la disponibilidad de 24 variantes, el repositorio sirve como banco de pruebas para medir la degradación de calidad entre niveles de cuantización en tareas concretas.
- Filtrado y clasificación en lotes: si el modelo base es de texto, las versiones Q4_K_M o Q5_K_M permiten procesar grandes volúmenes de peticiones en una sola GPU consumer.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

Las estimaciones siguientes asumen un modelo denso de aproximadamente 4.000 millones de parámetros, tal como sugiere el sufijo "4B" del nombre. No se han podido confirmar a partir de los metadatos del repositorio.

- VRAM estimada para inferencia (pesos, sin caché KV):
  - IQ1_S / IQ2_XXS: en torno a 1,2-1,8 GB.
  - Q2_K / IQ3_XS: en torno a 1,8-2,2 GB.
  - Q3_K_M / IQ4_XS: en torno a 2,2-2,6 GB.
  - Q4_K_M / IQ4_NL: en torno a 2,5-3,0 GB.
  - Q5_K_M: en torno a 3,0-3,4 GB.
  - Q6_K: en torno a 3,5-4,0 GB.
  - Añadir entre 0,5 y 2 GB adicionales para caché KV y buffers de contexto, en función de la longitud de contexto real (desconocida) y del número de secuencias simultáneas.
- GPU recomendadas: cualquier GPU con 6 GB o más de VRAM para las cuantizaciones Q4 y Q5; RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090, A100 y H100 pueden ejecutar todas las variantes con holgura y con lotes grandes.
- GPU consumer: sí, cabe en GPU de consumo. Las cuantizaciones Q4_K_M y Q5_K_M son adecuadas para equipos con 8 GB de VRAM (RTX 3060 Ti, RTX 4060, RTX 2070). Las variantes IQ2 e IQ3 permiten incluso equipos con 4-6 GB o ejecución parcial en CPU.
- CPU: es viable en modo CPU-only, especialmente con Q4_K_M o inferiores, con velocidades del orden de unos pocos tokens por segundo en procesadores de escritorio modernos, aunque no se dispone de mediciones para este modelo concreto.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, text-generation-webui y servidores compatibles con GGUF. vLLM y TGI tienen soporte limitado o experimental de GGUF, por lo que no se recomiendan como primera opción con estos artefactos.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se ha podido identificar un modelo comparable a partir de la información proporcionada, ya que se desconoce la tarea, la arquitectura y la licencia del modelo base. A modo de referencia por clase de tamaño, se incluyen alternativas habituales de ~3-4B parámetros distribuidas también en GGUF; los datos del modelo de esta ficha figuran como no disponibles y los de la competencia provienen de información pública general, no verificada en esta búsqueda.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad GGUF |
|---|---|---|---|---|
| ScreenHighlighterRL-4B (este repositorio) | no disponible (nombre sugiere ~4B) | no disponible | no disponible | Sí, 24 cuantizaciones |
| Qwen3-4B | ~4B | 32.768 tokens nativos, ampliable | Apache 2.0 | Sí, amplia comunidad de cuantizaciones |
| Llama 3.2 3B Instruct | ~3B | 128.000 tokens | Llama 3.2 Community License | Sí |
| Gemma 3 4B | ~4B | 128.000 tokens | Gemma Terms of Use | Sí |
| Phi-4-mini | ~3,8B | 128.000 tokens | MIT | Sí |

La comparación de rendimiento entre estos modelos y el modelo de esta ficha no puede realizarse: no hay benchmarks publicados para ScreenHighlighterRL-4B ni datos de evaluación del repositorio de cuantizaciones.

## Limitaciones y advertencias

- Ausencia total de documentación: el repositorio no publica licencia, idiomas, pipeline, arquitectura ni datos de evaluación. Antes de usar el modelo en cualquier entorno productivo es imprescindible consultar el repositorio base `mustafaah/ScreenHighlighterRL-4B`, que tampoco aporta información en los datos disponibles.
- Licencia desconocida: al no declararse licencia, no se puede asumir permiso para uso comercial. La ausencia de licencia explícita implica, por defecto, reserva de derechos en muchas jurisdicciones.
- Riesgo de alucinación: no evaluado. En modelos de ~4B parámetros el riesgo de fabricación de contenido es habitualmente alto, especialmente en tareas de razonamiento y matemáticas.
- Posible degradación por cuantización: las variantes IQ1_S, IQ1_M, IQ2_XXS e IQ2_XS son extremadamente agresivas y pueden degradar de forma notable la coherencia, el formato de salida y la precisión en tareas estructuradas. Para uso serio se recomienda Q4_K_M o superior.
- Sesgos: no evaluados ni documentados.
- Limitaciones de contexto e idioma: se desconocen la ventana de contexto efectiva y los idiomas cubiertos. No hay garantía de un rendimiento correcto en castellano.
- Reproducibilidad: se desconoce la procedencia exacta de los pesos base (revisión, fecha, hash). No se puede garantizar la correspondencia entre la cuantización y una versión concreta del modelo original.
- Metadatos inconsistentes: el recuento de parámetros disponible (958.716) no cuadra con el sufijo "4B" del nombre ni con el tamaño de repositorio declarado (0,0 GB), lo que indica metadatos incompletos o mal poblados en HuggingFace.
- Uso multimodal: si el modelo base depende de entrada visual, esta conversión GGUF no incluye, según los artefactos listados, un fichero mmproj que aporte el proyector multimodal, por lo que la capacidad de visión podría no estar operativa.
- Adopción nula: 0 descargas y 0 "likes" en el momento de la consulta, sin retroalimentación de la comunidad sobre su funcionamiento.

## Enlaces

- Repositorio de cuantizaciones GGUF: https://huggingface.co/mradermacher/ScreenHighlighterRL-4B-i1-GGUF
- Modelo base: https://huggingface.co/mustafaah/ScreenHighlighterRL-4B

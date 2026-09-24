# lucasoc/sci-image-models

## Resumen

Sci-Image-Markdown es un adaptador LoRA de tipo PEFT entrenado sobre el modelo vision-language Qwen2.5-VL-3B-Instruct, publicado por el usuario lucasoc en HuggingFace. Su proposito concreto es extraer los datos cuantitativos representados en paneles de figuras cientificas (graficas de lineas, barras, dispersion, etc.) y devolverlos como tablas Markdown limpias y estructuradas, en lugar de limitarse a describir la imagen. El adaptador resuelve un problema de extraccion estructurada de informacion a partir de figuras de articulos, un caso de uso frecuente en revisiones sistematicas, meta-analisis y construcción de bases de datos cientificas.

Tecnicamente no es un modelo completo sino un adaptador de bajo rango (QLoRA con r=16 y alpha=32) que se carga sobre los pesos del modelo base de 3.000 millones de parametros. La innovacion principal declarada por el autor es la funcion de perdida utilizada durante el entrenamiento, denominada ICDAR Metric-Aware Loss, que combina una perdida diferenciable ponderada por token (numerica y estructural) con recompensas calculadas en GPU para Table Edit Distance (TEDS) y error RMS de celdas. El entrenamiento se realizo en una unica NVIDIA GTX 1660 con 6 GB de VRAM, lo que da una idea del bajo coste computacional del ajuste.

El modelo esta orientado exclusivamente al ingles y a la tarea especifica de extraccion de tablas a partir de figuras cientificas. Su relevancia actual reside en que demuestra que un ajuste fino eficiente con una perdida alineada con las metricas de evaluacion puede mejorar de forma notable la precision de celdas y la similitud estructural respecto al modelo base en modo zero-shot, sin necesidad de infraestructura de entrenamiento de gama alta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-language (Qwen2.5-VL) con adaptador LoRA (PEFT) |
| Parametros totales | 3.000 millones en el modelo base; parametros del adaptador LoRA (r=16, alpha=32) no disponibles |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | Base cargada en 4-bit NF4 (bitsandbytes, double quant); computo del adaptador en FP16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 para el adaptador; el modelo base se distribuye bajo Qwen Research License / Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA PEFT) |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen2.5-VL-3B-Instruct, un transformer multimodal que procesa imagenes y texto. La contribucion del autor no esta en la arquitectura del backbone, que se mantiene congelado, sino en el procedimiento de ajuste: QLoRA de 4 bits con rango 16 y alpha 32, pesos base en NF4 con doble cuantizacion y calculo del adaptador en FP16. El entrenamiento se ejecuto en una sola GPU NVIDIA GeForce GTX 1660 de 6 GB de VRAM, lo que confirma que se trata de un ajuste de bajo coste sobre un modelo de 3B.

La innovacion tecnica destacada es la funcion de perdida ICDAR Metric-Aware Loss, descrita como una perdida diferenciable ponderada por token para aspectos numericos y estructurales, complementada con recompensas calculadas directamente en VRAM para Table Edit Distance (TEDS) y error RMS entre celdas. El objetivo es alinear la optimizacion con las metricas con las que despues se evalua el modelo, en lugar de usar unicamente entropia cruzada estandar. No se especifican en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron fases adicionales de RLHF o DPO. La evaluacion se realizo sobre un conjunto de test de 373 figuras cientificas.

## Capacidades

- Extraccion de datos cuantitativos graficados en paneles de figuras cientificas y su volcado a tablas Markdown con cabeceras de columna.
- Generacion de tablas Markdown validas en el 99,73% de los casos segun el benchmark declarado por el autor.
- Comprension de imagen y texto combinados (pipeline image-to-text), heredada del modelo base Qwen2.5-VL-3B-Instruct.
- Salida estructurada (celdas y cabeceras) en lugar de descripcion libre de la figura.
- Capacidad de razonamiento visual basica sobre ejes, series y valores numericos representados en graficas.
- No se documenta soporte de tool calling, function calling ni comportamiento agentico especifico en la informacion proporcionada.
- No se documentan capacidades de audio, video ni modo de pensamiento explicito.
- Soporte multilingue limitado al ingles segun la model card.

## Casos de uso

- Revisiones sistematicas y meta-analisis: extraer automaticamente los valores de figuras de decenas o cientos de articulos y consolidarlos en una tabla Markdown reutilizable, reduciendo la transcripcion manual de datos.
- Construccion de bases de datos cientificas: poblar repositorios estructurados con mediciones numericas publicadas en figuras, manteniendo columnas y cabeceras coherentes entre articulos.
- Verificacion de reproducibilidad: comparar los valores reportados en tablas de texto con los representados en las figuras del mismo articulo para detectar discrepancias.
- Extraccion de series temporales en articulos de clima, economia o biomedicina: convertir graficas de lineas en tablas con pares valor-tiempo listos para analisis estadistico.
- Automatizacion en pipelines de gestion documental cientifica: integrar el adaptador como paso de post-procesado tras un OCR o un detector de figuras, de forma que cada figura detectada se convierta en una tabla estructurada.
- Enriquecimiento de asistentes de lectura de papers: permitir que un chatbot pregunte por los datos concretos de una figura y responda con la tabla extraida en lugar de una descripcion cualitativa.
- Control de calidad editorial: revisar de forma semiautomatica si las tablas generadas a partir de figuras cumplen unos criterios minimos de precision de celdas antes de la publicacion.
- Prototipado en hardware limitado: al caber en una GPU de 6 GB en 4 bits, permite desplegar la extraccion de tablas en estaciones de trabajo modestas o en portatiles con GPU de gama media.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre un conjunto de test de 373 figuras cientificas:

| Metrica | Modelo base (zero-shot) | SFT estandar (entropia cruzada) | LoRA con ICDAR Metric Loss |
|---|---|---|---|
| Tabla Markdown valida | 88,74% | 99,73% | 99,73% |
| Precision de celdas | 21,08% | 21,37% | 39,58% (+85,2%) |
| F1 de celdas | 18,42% | 20,60% | 34,67% (+68,3%) |
| TEDS (Tree Edit Distance) | 23,16% | 23,16% | 36,24% (+56,5%) |
| RMS numerico ICDAR | 48,12% | 48,12% | 51,66% (+7,4%) |
| Puntuacion compuesta ICDAR | 35,64% | 35,64% | 43,95% (+23,3%) |

No se han publicado en la informacion disponible otros benchmarks estandarizados (MMLU, HumanEval, GSM8K u similares) para este adaptador.

## Requisitos de hardware

- Entrenamiento declarado: una sola NVIDIA GeForce GTX 1660 con 6 GB de VRAM (QLoRA 4-bit, FP16 para el adaptador).
- Inferencia en 4-bit NF4: se estima un consumo de alrededor de 2-3 GB para los pesos del modelo base, mas el coste de activaciones del codificador visual y del contexto de imagen; en la practica, unos 5-7 GB de VRAM son suficientes para una imagen y una tabla de salida de hasta 1024 tokens.
- Inferencia en FP16: se estiman aproximadamente 6-7 GB para los pesos de 3B mas overhead, lo que situa la cifra total en torno a 10-12 GB de VRAM.
- GPU consumer compatibles: la propia GTX 1660 de 6 GB en 4 bits, RTX 3060 de 12 GB, RTX 4070/4080 y RTX 4090 en configuraciones de mayor precision o mayor tamano de lote.
- GPU de datacenter: A100, H100 y L40S son adecuadas para despliegues con concurrencia, aunque sobredimensionadas para un modelo de 3B.
- Opciones de despliegue: transformers mas peft y qwen-vl-utils para el flujo directo del ejemplo del autor; vLLM y TGI admiten modelos Qwen2.5-VL, aunque la carga de adaptadores LoRA depende del soporte de LoRA en cada servidor; llama.cpp y Ollama requieren conversion a GGUF y no se documentan en la informacion proporcionada.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea principal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sci-image-models (este adaptador) | 3B (base) + LoRA | No disponible | Extraccion de tablas desde figuras cientificas | Apache 2.0 (adaptador) | HuggingFace |
| Qwen2.5-VL-3B-Instruct (base, zero-shot) | 3B | No disponible | Vision-language general | Qwen Research License / Apache 2.0 | HuggingFace |
| Modelos especializados de extraccion de tablas cientificas alternativos | No disponible | No disponible | Extraccion de tablas | No disponible | No disponible |

La comparacion directa disponible en la model card es contra el modelo base sin ajustar y contra un ajuste fino estandar con entropia cruzada, ambos superados en las metricas de precision de celdas, F1 y TEDS. No se dispone de datos sobre otros adaptadores o modelos especializados equivalentes para establecer una comparativa mas amplia.

## Limitaciones y advertencias

- Especializacion estrecha: el adaptador esta entrenado para extraer datos cuantitativos graficados en figuras cientificas; no se documenta su comportamiento en tablas escaneadas, formularios, diagramas o imagenes no cientificas.
- Idioma: la model card declara unicamente ingles, por lo que el rendimiento en castellano u otros idiomas no esta validado.
- Riesgo de alucinacion numerica: la propia metrica de RMS numerico ICDAR se situa en 51,66%, lo que indica que una parte relevante de los valores extraidos puede presentar desviaciones respecto al original; se recomienda verificacion humana en usos criticos.
- Precision de celdas moderada: pese a la mejora del 85,2% frente al modelo base, la precision absoluta es del 39,58%, lo que implica que la mayoria de celdas pueden no coincidir exactamente con el dato de la figura.
- Tamano del conjunto de evaluacion reducido (373 figuras), lo que limita la generalizacion de los resultados declarados.
- Licencia del modelo base: el adaptador es Apache 2.0, pero el uso del modelo base Qwen2.5-VL-3B-Instruct esta sujeto a los terminos de Qwen Research License / Apache 2.0; conviene revisar las condiciones de uso comercial del modelo base antes de desplegarlo en produccion.
- Trazabilidad limitada: no se detallan la procedencia ni la composicion del dataset de entrenamiento, lo que dificulta evaluar sesgos o dominios infrarrepresentados.
- Impacto de la cuantizacion: el ejemplo de uso carga el modelo base en 4 bits, lo que puede degradar ligeramente la precision de la extraccion respecto a FP16.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, sin validacion externa conocida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lucasoc/sci-image-models
- Repositorio de codigo del autor: https://github.com/lucasdocunha/sci-image-markdown
- Modelo base Qwen2.5-VL-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
- Repositorio oficial de Qwen2.5-VL: https://github.com/QwenLM/Qwen2.5-VL

Nota: las busquedas web realizadas no han devuelto enlaces directamente relacionados con este adaptador ni con su funcion de perdida ICDAR; los resultados obtenidos tratan sobre benchmarks de generacion de imagenes cientificas, modelos de escalado de imagen y plataformas genericas de APIs, por lo que no se incluyen como referencias del modelo.

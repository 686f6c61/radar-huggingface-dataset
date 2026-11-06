# Czs-HF/microduck-sprint-test-v2

## Resumen

`Czs-HF/microduck-sprint-test-v2` es un artefacto derivado del modelo base `suraj-phanindra/microduck-sprint-hc5-aifund`, publicado por el usuario Czs-HF bajo la librería `microduck`. No se trata de un modelo de lenguaje: según la model card, el contenido son pesos de una política de control para un agente simulado llamado MicroDuck, junto con una tabla de pasos (step counter sobre `head_roll`) y una tabla conjunta de articulaciones y velocidad obtenida mediante búsqueda sobre las cinco semillas oficiales de un entorno denominado Arena.

El autor reporta una medición local de 0,861 s con una tasa de éxito de 5/5 a 1,15 m/s. Los pesos de la red son los del checkpoint `hc5` ya publicado; este repositorio añade únicamente el contador de pasos y la tabla de control. El repositorio tiene un tamaño de 0,0 GB, lo que sugiere que los pesos no están incluidos o son meros metadatos.

Es relevante únicamente como referencia para experimentos de control en simulación con la familia MicroDuck. No es un modelo de propósito general, no procesa texto ni imágenes, y su model card advierte explícitamente que es solo para simulación y que no debe cargarse en un MicroDuck físico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política de control (detalles no disponibles); el autor la describe como "network" con una cabeza `head_roll` |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible; el tag `onnx` sugiere exportación a ONNX, sin cuantizaciones documentadas |
| Idiomas soportados | no aplica |
| Licencia | no disponible |
| Formato de pesos | no disponible; el tag `onnx` apunta a ONNX, pero el tamaño del repo es 0,0 GB |
| Modelo base | suraj-phanindra/microduck-sprint-hc5-aifund (relación: finetune) |
| Librería | microduck |
| Tamaño del repositorio | 0,0 GB |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna de la red. La model card indica que los pesos son los del checkpoint publicado `suraj-phanindra/microduck-sprint-hc5-aifund` y que este repositorio añade dos elementos: un contador de pasos sobre la cabeza `head_roll` y una tabla de articulaciones y velocidad. La tabla se obtuvo mediante búsqueda (search) sobre las cinco semillas oficiales de un entorno llamado Arena, lo que sugiere un proceso de optimización de hiperparámetros o de política de control por búsqueda, no un entrenamiento desde cero.

No se especifican el número de tokens, la composición del dataset, ni si hubo RLHF, DPO o aprendizaje por refuerzo. Tampoco se detalla si la política es una red feedforward, un transformer o un modelo recurrente. La única innovación documentada es la adición del contador de pasos y la tabla de control buscada sobre semillas, que permite reproducir el comportamiento medido en simulación.

## Capacidades

- Control de un agente simulado MicroDuck en un entorno denominado Arena.
- Ejecución de una política de sprint a 1,15 m/s según la medición local reportada.
- Contador de pasos sobre la cabeza `head_roll` para secuenciar la marcha.
- Tabla conjunta de articulaciones y velocidad para las cinco semillas oficiales.
- Reproducibilidad limitada a las semillas 1-5 del entorno Arena.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, audio ni tool calling.
- No soporta agentes multi-step en el sentido de LLM; su "agencia" es control motor simulado.

## Casos de uso

- Reproducción de experimentos de control en simulación: cargar el checkpoint en el entorno MicroDuck y verificar la métrica de 0,861 s y 5/5 sobre las semillas 1-5, como línea base para comparar variantes de la política.
- Evaluación de robustez de la política `hc5`: usar la tabla de articulaciones y velocidad para medir cómo varía el rendimiento al cambiar la semilla o la velocidad objetivo alrededor de 1,15 m/s.
- Estudio de sensibilidad del contador de pasos: modificar el step counter sobre `head_roll` y observar el efecto en la estabilidad de la marcha simulada.
- Docencia en robótica simulada: ejemplo mínimo de cómo un artefacto de pesos y una tabla de control se combinan para producir una política de locomoción reproducible.
- Comparación de checkpoints derivados: contrastar este remix con el modelo base `suraj-phanindra/microduck-sprint-hc5-aifund` para aislar el efecto de la tabla buscada frente a los pesos originales.
- Validación de pipelines de exportación ONNX: dado el tag `onnx`, probar la carga y ejecución del artefacto en un runtime ONNX dentro del simulador, sin uso físico.

## Benchmarks y rendimiento

| Metrica | Valor reportado |
|---|---|
| Tiempo local de ejecución | 0,861 s |
| Tasa de éxito | 5/5 |
| Velocidad | 1,15 m/s |
| Semillas evaluadas | 1-5 (oficiales de Arena) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que el artefacto no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repo es 0,0 GB y no se documentan los pesos.
- GPU recomendadas: no disponible; al ser un controlador de simulación, probablemente se ejecute en CPU, pero no se confirma.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: la librería `microduck` y el tag `onnx` sugieren ejecución mediante un runtime ONNX; no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: solo se reporta el tiempo local de 0,861 s para la tarea de sprint; no hay datos de throughput.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Czs-HF/microduck-sprint-test-v2 | Política de control simulada (remix) | no disponible | no aplica | 0,861 s, 5/5, 1,15 m/s | no disponible | HuggingFace, repo de 0,0 GB |
| suraj-phanindra/microduck-sprint-hc5-aifund | Política de control simulada (base) | no disponible | no aplica | no disponible en esta ficha | no disponible | HuggingFace |
| Modelos de lenguaje comparables | no aplica | no aplica | no aplica | no aplica | no aplica | no aplica |

No se conocen otros artefactos de la familia MicroDuck con datos públicos suficientes para una comparación cuantitativa.

## Limitaciones y advertencias

- La model card advierte explícitamente: "Simulation only. Do not load it on a physical MicroDuck." No debe usarse en hardware físico.
- El repositorio tiene un tamaño de 0,0 GB, por lo que es posible que los pesos no estén incluidos y solo se distribuyan metadatos o tablas.
- No se especifica licencia; el uso comercial queda sin autorización clara.
- No hay información sobre sesgos, alucinación o limitaciones de idioma porque no es un modelo de lenguaje.
- El rendimiento reportado (0,861 s, 5/5, 1,15 m/s) es una medición local del autor y no ha sido verificada de forma independiente.
- La generalización está acotada a las cinco semillas oficiales de Arena; no se documenta comportamiento fuera de ese conjunto.
- No se detallan los requisitos de hardware ni el formato exacto de los pesos, lo que dificulta la reproducibilidad.
- Al ser un finetune/remix del checkpoint `hc5`, hereda cualquier limitación no documentada del modelo base.

## Enlaces

- HuggingFace: https://huggingface.co/Czs-HF/microduck-sprint-test-v2
- Modelo base: https://huggingface.co/suraj-phanindra/microduck-sprint-hc5-aifund
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.

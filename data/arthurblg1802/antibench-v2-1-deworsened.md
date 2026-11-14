# arthurblg1802/AntiBench-v2.1-deworsened

## Resumen

AntiBench-v2.1-deworsened es un modelo de lenguaje a nivel de caracter de tamano extremadamente reducido, publicado por el usuario arthurblg1802 en Hugging Face. Con solo 202.752 parametros totales, se enmarca en la categoria de "tiny language models" y se distribuye como modelo base (no instruido) bajo licencia Apache 2.0. El modelo esta etiquetado como `antichar`, lo que sugiere que su proposito es servir como referencia o linea base negativa en tareas de generacion de texto, mas que como modelo de proposito general.

La relevancia de este modelo no reside en su rendimiento, sino en su caracter de referencia: sus resultados en benchmarks estandar se situan en el nivel del azar (HellaSwag 24,90% frente a 25,00% de azar; ARC-Easy 25,38% frente a 25,00%; ARC-Challenge 24,57% frente a 25,00%; PIQA 47,82% frente a 50,00%), y su indice Open SLM es de -1,83. Estos datos lo convierten en un ejemplo util para estudiar el comportamiento de modelos minimos y para calibrar metricas de evaluacion.

El modelo esta entrenado exclusivamente en ingles y se distribuye en formato safetensors con pesos en PyTorch. Su tamano de repositorio es practicamente nulo (0.0 GB), lo que refleja la escasez de parametros. No se dispone de informacion sobre la composicion del dataset de entrenamiento ni sobre el proceso de alineacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer a nivel de caracter (character-level), segun tags del autor; detalles no disponibles |
| Parametros totales | 202.752 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PyTorch) |

## Arquitectura y entrenamiento

El modelo se presenta como un transformer a nivel de caracter (`character-level`) y como modelo base (`base-model`), sin informacion publica sobre el numero de capas, dimensiones ocultas, numero de cabezas de atencion ni funcion de activacion. El tag `custom_code` indica que la implementacion requiere codigo personalizado para cargarse, lo que implica que no es compatible directamente con `AutoModelForCausalLM` de Transformers sin pasos adicionales.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF, DPO o ajuste supervisado. El nombre "deworsened" sugiere una iteracion de un modelo previo ("worsened") que ha sido parcialmente corregida, pero no hay documentacion tecnica que lo confirme. No se han publicado innovaciones tecnicas destacables (atencion lineal, decodificacion especulativa, etc.) en la informacion disponible.

## Capacidades

- Generacion de texto a nivel de caracter en ingles, sin capacidad demostrada de coherencia semantica a nivel de palabra o frase.
- Modelo base sin ajuste por instrucciones: no sigue instrucciones ni mantiene formato conversacional de forma fiable.
- No se ha documentado soporte de tool calling ni function calling.
- No se ha documentado soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingue limitada al ingles segun la model card.
- No se ha documentado modo de razonamiento (thinking mode), vision, audio ni capacidades multimodales.
- Sus resultados en benchmarks estandar se situan en el nivel del azar, lo que limita cualquier uso como generador de contenido fiable.

## Casos de uso

- Linea base negativa en evaluacion de benchmarks: sirve para calibrar el suelo de rendimiento en pruebas como HellaSwag, ARC o PIQA, ya que sus puntuaciones coinciden con el azar y permiten verificar que una metrica no infla resultados.
- Estudio de modelos a nivel de caracter: util en investigacion sobre tokenizacion por caracter frente a subpalabras, al ser un caso extremo de modelo minimo con el que comparar comportamiento.
- Pruebas de infraestructura de despliegue: su tamano (202.752 parametros) permite validar pipelines de carga, serializacion safetensors y `custom_code` en entornos de CI sin coste de computo.
- Docencia y divulgacion: ejemplo didactico de un modelo que no aprende senal predictiva, para explicar la diferencia entre perdida de entrenamiento y rendimiento en benchmarks.
- Pruebas de robustez de herramientas de evaluacion: permite comprobar como se comportan los frameworks de benchmarking (lm-evaluation-harness y similares) ante modelos degenerados o de tamano trivial.
- Verificacion de licencias y metadatos: al estar bajo Apache 2.0 con metadatos completos, sirve como caso de prueba para validadores de model cards y cumplimiento de licencias en repositorios.

## Benchmarks y rendimiento

| Benchmark | Puntuacion | Azar |
|---|---:|---:|
| HellaSwag | 24,90% | 25,00% |
| ARC-Easy | 25,38% | 25,00% |
| ARC-Challenge | 24,57% | 25,00% |
| PIQA | 47,82% | 50,00% |
| ArithMark-3.0 | 22,50% | 25,00% |
| Open SLM index | -1,83 | 0,00 |

Todas las puntuaciones se situan en el nivel del azar o por debajo, lo que indica ausencia de capacidad predictiva medible en estas tareas. No se han publicado resultados en MMLU, HumanEval, GSM8K ni otros benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB en precision completa (202.752 parametros en fp32 equivalen a aproximadamente 0,8 MB), por lo que cabe en cualquier GPU o incluso en CPU.
- GPU recomendadas: ninguna en particular; cualquier GPU consumer (incluso integradas) es suficiente. No requiere A100, H100 ni RTX 4090.
- Cabe en cualquier GPU consumer y en CPU sin problemas de memoria.
- Opciones de despliegue: PyTorch nativo con `custom_code`; no se ha verificado compatibilidad con vLLM, llama.cpp, Ollama o TGI, y la presencia de `custom_code` puede requerir implementacion manual.
- Latencia y throughput: no disponibles; dado el tamano, la latencia estara dominada por el overhead de framework mas que por el computo del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| AntiBench-v2.1-deworsened | 202.752 | no disponible | Nivel de azar en benchmarks estandar | Apache 2.0 | Hugging Face |
| Modelos tiny de referencia (p. ej. TinyStories-1M) | ~1M | 512-2048 | Generacion coherente en dominio restringido | Varía | Hugging Face |
| GPT-2 small | 124M | 1024 | MMLU bajo, HellaSwag ~30% | MIT | Hugging Face |
| Modelos character-level academicos | 1M-10M | Variable | Dependiente del corpus | Variable | Repositorios academicos |

La comparacion es aproximada: no se dispone de datos publicados de los modelos alternativos en la informacion proporcionada, y el modelo evaluado no alcanza el rendimiento de modelos tiny de referencia en ninguna tarea estandar.

## Limitaciones y advertencias

- Rendimiento al nivel del azar en todos los benchmarks publicados: no es apto para generacion de texto util, razonamiento ni tareas de codigo.
- Riesgo elevado de alucinacion y de salidas incoherentes, dado que el modelo no ha demostrado aprendizaje de senal predictiva.
- Sesgos conocidos: no documentados, pero un modelo entrenado en ingles y sin alineacion puede reproducir sesgos del corpus; la ausencia de informacion sobre el dataset impide evaluarlo.
- Limitacion idiomatica: solo ingles segun la model card.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el rendimiento del modelo hace inviable cualquier aplicacion en produccion.
- Requiere `custom_code` para su carga, lo que anade riesgo de seguridad y mantenimiento en pipelines.
- El nombre "deworsened" y la ausencia de documentacion tecnica impiden verificar el proceso de entrenamiento y reproducibilidad.
- No usar como componente de sistemas de atencion al cliente, generacion de codigo ni agentes: sus puntuaciones no superan el azar.

## Enlaces

- Hugging Face: https://huggingface.co/arthurblg1802/AntiBench-v2.1-deworsened
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion disponible.

# AlmostNobody/Tinygpt-python-teacher

## Resumen

TinyGPT es un modelo de lenguaje de escala minima (aproximadamente 1,04 millones de parametros) desarrollado por el usuario AlmostNobody y publicado en Hugging Face. Se trata de un transformer decoder-only a nivel de caracter entrenado desde cero (no es un fine-tuning de ningun modelo existente) sobre un corpus reducido de ejemplos de pregunta-respuesta con un tono de "profesor de Python amigable". Su proposito es exclusivamente educativo: sirve como proyecto de aprendizaje para comprender el ciclo completo de entrenamiento de un transformer, desde la tokenizacion hasta la generacion.

El modelo emplea una arquitectura transformer de 5 capas, 4 cabezas de atencion y una dimension de embedding de 128, con una longitud de contexto de tan solo 128 caracteres. El vocabulario es de nivel de caracter (108 simbolos) y el corpus de entrenamiento consta de unas 3.000 parejas de pregunta-respuesta (aproximadamente 1,5 millones de caracteres) que cubren alrededor de 150 preguntas distintas.

Su relevancia es pedagogica y no practica: el autor advierte explicitamente de que no esta pensado para responder preguntas reales. Resulta util como referencia para quienes quieran replicar un entrenamiento desde cero con recursos minimos, o como ejemplo de las limitaciones intrinsecas de los modelos de muy baja escala (memorizacion, sobreajuste y ausencia de generalizacion).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (from-scratch) |
| Parametros totales | ~1,04 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 caracteres |
| Tipos de cuantizacion | no disponible (pesos en PyTorch `state_dict`; no se publican variantes cuantizadas) |
| Idiomas soportados | no disponibles (entrenado sobre un corpus en ingles de tematica Python) |
| Licencia | MIT |
| Formato de pesos | PyTorch `state_dict` (`tinygpt.pt`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 5 capas, 4 cabezas de atencion y dimension de embedding de 128, con tokenizacion a nivel de caracter sobre un vocabulario de 108 simbolos definido en `vocab.json`. La longitud de contexto es de 128 caracteres, lo que limita severamente la coherencia mas alla de una o dos frases.

El entrenamiento se realizo desde cero durante 3.000 pasos con el optimizador AdamW (learning rate 2e-3) y un tamano de batch de 64, sobre un total de 1.529.604 caracteres. Se reservaron 15 preguntas como conjunto de validacion. La perdida final reportada es de aproximadamente 0,16 en entrenamiento y 0,89 en validacion, una brecha que evidencia un sobreajuste considerable y confirma que el modelo memoriza en gran medida el conjunto de entrenamiento. No se menciona el uso de RLHF, DPO ni tecnicas de alineacion adicionales.

## Capacidades

- Generacion de texto a nivel de caracter con el formato de prompt `### Question:` / `### Answer:`.
- Reproduccion del estilo del corpus de entrenamiento: tono amable, uso de emojis y bloques de codigo.
- Memorizacion de respuestas para preguntas muy similares a las del conjunto de entrenamiento (por ejemplo, "How does a while loop work?" o "What is recursion?").
- No dispone de soporte de tool calling ni de function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de capacidades multilingues declaradas.
- No dispone de modo de razonamiento (thinking), vision ni audio.

## Casos de uso

- Material didactico para cursos de introduccion a transformers: el modelo permite recorrer de principio a fin el pipeline de entrenamiento (tokenizacion por caracter, definicion del modelo, bucle de entrenamiento y generacion) con un coste computacional minimo.
- Reproduccion de experimentos controlados: al ser un modelo de 1,04 M de parametros y 128 caracteres de contexto, permite iterar rapidamente sobre hiperparametros y observar el efecto del sobreajuste (perdida de validacion de 0,89 frente a 0,16 de entrenamiento).
- Demostracion de las limitaciones de los modelos de baja escala: sirve para ilustrar en clase por que la memorizacion no equivale a comprension, comparando respuestas ante preguntas vistas y no vistas.
- Prueba de infraestructura de inferencia: util para validar scripts de carga de `state_dict`, integracion con PyTorch y flujos de generacion antes de escalar a modelos mayores.
- Ejemplo de publicacion de modelos en Hugging Face: el repositorio incluye `model.py`, `config.json`, `vocab.json` y `generate.py`, lo que lo convierte en una plantilla para empaquetar un modelo propio.
- Referencia para comparativas de eficiencia: al ejecutarse en CPU sin problemas, permite medir latencias de generacion en entornos sin GPU y contrastarlas con modelos de mayor tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada por el autor es la perdida de entrenamiento (~0,16) y de validacion (~0,89) tras 3.000 pasos.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; los pesos de ~1,04 M de parametros en precision completa ocupan unos pocos megabytes.
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU sin dificultad.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, etc.) e incluso en entornos sin GPU dedicada.
- Opciones de despliegue: el autor proporciona un script `generate.py` basado en PyTorch; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles; con 128 caracteres de contexto y 5 capas, la generacion en CPU deberia ser del orden de milisegundos por token, aunque no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TinyGPT (AlmostNobody) | ~1,04 M | 128 caracteres | Transformer from-scratch, nivel de caracter | MIT | Hugging Face (PyTorch) |
| nanoGPT (Karpathy) | configurable (tipicamente ~10-124 M) | configurable | Transformer from-scratch, nivel de caracter | MIT | Repositorio GitHub |
| GPT-2 small | 124 M | 1.024 tokens | Transformer preentrenado, BPE | MIT | Hugging Face |
| Modelos comparables de 1 M de parametros con benchmarks publicados | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa con nanoGPT y GPT-2 small es orientativa por categoria (modelos pequenos de codigo abierto); no se dispone de resultados de benchmarks que permitan una comparacion cuantitativa con TinyGPT.

## Limitaciones y advertencias

- El propio autor indica que el modelo no esta pensado para responder preguntas reales y que su utilidad practica es nula fuera del ambito educativo.
- Fuerte sobreajuste: perdida de validacion (~0,89) muy superior a la de entrenamiento (~0,16); el modelo memoriza respuestas.
- El conjunto de entrenamiento contiene solo unas 150 preguntas distintas, por lo que ante formulaciones no vistas tiende a producir texto con apariencia segura pero incorrecto o sin sentido.
- Contexto de solo 128 caracteres, insuficiente para conversaciones multi-turno o documentos.
- Tokenizacion a nivel de caracter: sin capacidades multilingues declaradas y con eficiencia muy baja por token.
- Riesgo elevado de alucinacion y de respuestas incoherentes fuera de la distribucion de entrenamiento.
- No se han documentado evaluaciones de sesgo; al ser un corpus sintetico y minimo, no puede considerarse representativo.
- Licencia MIT: permite uso comercial y modificacion, pero el modelo no ofrece garantias de calidad ni de idoneidad para produccion.
- No se publican variantes cuantizadas ni integraciones con frameworks de servido de alto rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AlmostNobody/Tinygpt-python-teacher
- No se han encontrado en la busqueda web papers, blogs, repositorios adicionales ni demos asociados a este modelo.

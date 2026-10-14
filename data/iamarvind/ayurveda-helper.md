# iamarvind/ayurveda-helper

## Resumen

Ayurveda Helper es un ajuste por adaptacion de dominio del modelo Sarvam-M (24B) orientado a contenidos de Ayurveda en hindi e ingles. Lo desarrolla el usuario iamarvind y consiste en un entrenamiento LoRA de bajo rango aplicado sobre el modelo base sarvamai/sarvam-m, cuantizado a 4 bits con MLX, con el objetivo de mejorar el conocimiento del dominio ayurvedico en hindi, donde el modelo base no supera a alternativas mucho mas pequenas.

El modelo se encuentra en estado de entrenamiento en curso. Segun la model card, se han procesado 19.600 fragmentos de texto (unos 1.500 caracteres cada uno, aproximadamente el 70% en hindi) durante unos dos dias en un unico MacBook Pro con chip M4 Pro y 48 GB de memoria unificada. Los pesos finales y las puntuaciones definitivas se publicaran cuando termine la ejecucion y la evaluacion; por ahora solo estan disponibles los resultados de la linea base.

La relevancia del proyecto radica en su caracter experimental y de bajo coste: demuestra que es posible realizar adaptacion de dominio sobre un modelo de 24.000 millones de parametros en hardware de consumo Apple Silicon mediante MLX y LoRA, y aborda de forma explicita una brecha de rendimiento documentada en hindi frente al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de sarvamai/sarvam-m; detalles especificos no disponibles) |
| Parametros totales | 24B (modelo base Sarvam-M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (el entrenamiento LoRA uso una longitud maxima de 1.024 tokens) |
| Tipos de cuantizacion | 4-bit (MLX) |
| Idiomas soportados | hindi (hi), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX (libreria mlx-lm); pesos aun no publicados |

## Arquitectura y entrenamiento

El modelo parte de sarvamai/sarvam-m, un modelo de 24.000 millones de parametros bajo licencia Apache-2.0, cuantizado a 4 bits con MLX. Sobre esa base se aplica una adaptacion LoRA con rango 8 sobre 16 capas, tasa de aprendizaje 1e-5, tamano de lote 1, una sola epoca y longitud maxima de secuencia de 1.024 tokens. Segun la model card, esto supone entrenar aproximadamente el 0,08% de los pesos, lo que reduce drasticamente el coste computacional y de memoria.

El corpus de entrenamiento esta compuesto por 19.600 fragmentos de texto de unos 1.500 caracteres cada uno, con una mezcla aproximada del 70% en hindi. La composicion declarada es: sangraha_hi (4.051), wiki_en (6.000), fineweb2_hi (2.949) y wiki_hi (7.000). Las fuentes son Wikipedia en hindi e ingles (CC BY-SA 4.0), documentos en hindi extraidos de AI4Bharat Sangraha (CC BY 4.0) y FineWeb-2, filtrados por densidad de palabras clave relacionadas con Ayurveda. Se aplico un proceso de descontaminacion en el que se eliminaron 116 fragmentos que compartian alguna secuencia de 8 palabras con preguntas y respuestas de BhashaBench-Ayur, y se excluyeron paginas con aspecto de examen.

## Capacidades

- Generacion de texto en hindi e ingles, orientada a continuaciones de estilo enciclopedico o de manual sobre Ayurveda.
- Conocimiento de dominio especifico en Ayurveda, con foco en mejorar el rendimiento en hindi.
- Capacidad bilingue limitada a hindi e ingles; no se declaran otros idiomas.
- No incluye ajuste de instrucciones ni de chat (entrenado solo con texto plano), por lo que las respuestas pueden leerse como continuaciones de manual.
- Soporte de tool calling / function calling: no disponible, al tratarse de un modelo base sin ajuste conversacional.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de vision o audio: no disponibles.
- Modo de razonamiento explicito (thinking mode): no disponible.

## Casos de uso

- Investigacion en adaptacion de dominio: el modelo sirve como caso de estudio reproducible de LoRA de bajo rango sobre un modelo de 24B en MLX, con hiperparametros y composicion de datos documentados.
- Generacion de material educativo sobre Ayurveda: puede producir textos divulgativos en hindi e ingles a partir de un fragmento inicial, util para borradores de articulos o apuntes que luego se revisan manualmente.
- Ampliacion de corpus en hindi: puede emplearse para generar variaciones y reformulaciones de contenido ayurvedico, aunque requiere supervision posterior por el riesgo de errores.
- Experimentos de evaluacion bilingue: sirve para medir el efecto de la adaptacion de dominio en hindi frente al modelo base mediante BhashaBench-Ayur.
- Comparacion de tecnicas de cuantizacion: al estar en 4-bit MLX, permite estudiar el impacto de la cuantizacion en tareas de conocimiento factual de dominio.
- Desarrollo de asistentes especializados como base: sus pesos podrian servir de punto de partida para un posterior ajuste de instrucciones orientado a consultas sobre Ayurveda.
- Docencia y demostraciones en Apple Silicon: se ejecuta en LM Studio en equipos con chip Apple, lo que facilita talleres practicos sin GPU dedicada.

## Benchmarks y rendimiento

Resultados en BhashaBench-Ayur (14.963 preguntas, zero-shot, verosimilitud logaritmica, acc_norm %). El modelo de esta ficha aun no tiene resultados porque el entrenamiento esta en curso.

| Modelo | Global | Ingles | Hindi |
|---|---|---|---|
| AyurParam 2.9B (BharatGen) | 32,6 | 33,6 | 30,8 |
| Sarvam-M 24B 4-bit (base) | 36,0 | 39,1 | 30,8 |
| Ayurveda Helper (este modelo) | en entrenamiento | en entrenamiento | en entrenamiento |

Hallazgo declarado por el autor: Sarvam-M supera a AyurParam en 3,4 puntos globales (McNemar, p < 1e-15), pero toda la ganancia se concentra en ingles (+5,5 puntos). En hindi ambos modelos empatan en 30,8%, que es precisamente la brecha que este entrenamiento pretende cerrar.

## Requisitos de hardware

- VRAM estimada para inferencia (estimacion a partir de 24B en 4 bits): aproximadamente 13-16 GB solo para pesos, mas el coste de la cache KV, que depende de la longitud de contexto.
- GPU recomendadas para despliegue estandar: A100 40 GB, H100, L40S o RTX 6000 Ada con 48 GB. En 4 bits tambien cabe en GPU de 24 GB.
- Compatibilidad con GPU de consumo: si, cabe en tarjetas de 24 GB como RTX 3090 o RTX 4090 con cuantizacion de 4 bits, dependiendo de la longitud de contexto.
- Apple Silicon: entorno de referencia del proyecto; se entreno en un M4 Pro con 48 GB de memoria unificada y esta pensado para ejecutarse en LM Studio sobre chips Apple.
- Opciones de despliegue: mlx-lm (nativo) y LM Studio en Apple Silicon. Otros entornos como vLLM, llama.cpp, Ollama o TGI requeririan conversion previa del formato, por lo que no estan soportados de forma nativa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | BhashaBench-Ayur global | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ayurveda Helper | 24B (LoRA sobre Sarvam-M) | no disponible | en entrenamiento | Apache-2.0 | pesos aun no publicados |
| Sarvam-M 24B (base) | 24B | no disponible | 36,0 | Apache-2.0 | disponible |
| AyurParam 2.9B (BharatGen) | 2,9B | no disponible | 32,6 | no disponible | disponible |

La comparacion sugiere que un modelo de 2,9B especializado en Ayurveda (AyurParam) queda por debajo del modelo generalista de 24B, y que la adaptacion de dominio en hindi todavia no ha demostrado ganancias en la linea base evaluada.

## Limitaciones y advertencias

- No es consejo medico: la propia model card advierte de que no debe usarse para diagnostico ni tratamiento.
- Entrenado solo con texto plano, sin ajuste de instrucciones ni de chat; las respuestas pueden parecer continuaciones de manual.
- Evaluado unicamente con preguntas de opcion multiple; no hay evidencia de rendimiento en generacion abierta.
- El texto obtenido de la web puede contener errores y afirmaciones de salud no verificadas.
- Sesgos potenciales derivados de las fuentes (Wikipedia, Sangraha, FineWeb-2) y del filtrado por palabras clave, que puede sobrerrepresentar ciertos temas.
- Riesgo de alucinacion relevante en contenido medico o de salud, especialmente si se usa sin revision humana.
- Limitacion de idioma: solo hindi e ingles.
- Restricciones de licencia: Apache-2.0, lo que permite uso comercial, pero al derivar de sarvam-m conviene revisar las condiciones del modelo base.
- Estado del proyecto: pesos no publicados; los resultados definitivos no estan disponibles, por lo que no es apto para produccion en este momento.
- La adaptacion LoRA toca un 0,08% de los pesos, lo que limita la magnitud de los cambios aprendidos.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/iamarvind/ayurveda-helper
- Modelo base: https://huggingface.co/sarvamai/sarvam-m
- AI4Bharat Sangraha: https://huggingface.co/datasets/ai4bharat/sangraha
- FineWeb-2 (Hugging Face): https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- BhashaBench-Ayur / AyurParam (BharatGen): no disponible en la informacion proporcionada
- Repositorio MLX-LM: https://github.com/ml-explore/mlx-lm

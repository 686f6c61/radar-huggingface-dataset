# AlmostNobody/Tinygpt_v2_conversation

## Resumen

TinyGPT v2 Conversation es un modelo de lenguaje conversacional de escala minima, desarrollado por el usuario AlmostNobody y publicado en Hugging Face bajo licencia MIT. Se trata de un transformer decoder-only de estilo GPT construido y entrenado desde cero en PyTorch, con 1.022.592 parametros, 5 capas, 4 cabezas de atencion y una dimension de embedding de 128. Su ventana de contexto es de 128 caracteres y utiliza tokenizacion a nivel de caracter con un vocabulario de 56 caracteres mas un token de fin de respuesta.

El modelo no pretende competir con asistentes de proposito general: su objetivo es generar respuestas cortas en formato `User:` / `Bot:` y servir como material didactico para experimentar con tokenizacion, atencion y entrenamiento de modelos de lenguaje. Fue entrenado sobre el dataset sintetico `Neural-Labs/tiny-llm-dataset`, compuesto por 12.000 intercambios cortos de saludos en ingles (aproximadamente 697.000 caracteres).

Su relevancia es acotada y de caracter educativo: es un ejemplo reproducible y de tamano minimo que cabe en cualquier equipo y permite inspeccionar de principio a fin el pipeline de entrenamiento e inferencia de un modelo GPT. No es adecuado para produccion, razonamiento, codigo ni consultas factuales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT (atencion causal, LayerNorm, conexiones residuales, bloques MLP con GELU) |
| Parametros totales | 1.022.592 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 caracteres/tokens |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch en precision de entrenamiento; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (el dataset de entrenamiento es en ingles; la model card no declara idiomas oficiales) |
| Licencia | MIT |
| Formato de pesos | checkpoint PyTorch (`.pt`) con pesos y vocabulario de caracteres |
| Capas del transformer | 5 |
| Cabezas de atencion | 4 |
| Dimension de embedding | 128 |
| Tokenizacion | a nivel de caracter (56 caracteres + 1 token de fin de respuesta) |
| Dropout | 0,1 |
| Pesos compartidos | embedding de tokens y cabeza de salida atados |
| Pasos de entrenamiento | hasta 3.000 |
| Optimizador | AdamW |
| Learning rate pico | 0,002 |
| Batch size | 64 |
| Framework | PyTorch |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 5 bloques con atencion causal multi-cabeza (4 cabezas), LayerNorm, conexiones residuales y MLP con activacion GELU. La dimension de embedding es 128 y los pesos del embedding de tokens estan atados a los de la cabeza de salida, lo que reduce el numero de parametros. La tokenizacion es a nivel de caracter: cada caracter del vocabulario (56 en total) se mapea a un entero, mas un token especial de fin de respuesta. La generacion es autorregresiva caracter a caracter.

El entrenamiento se realizo sobre `Neural-Labs/tiny-llm-dataset`, un conjunto sintetico de 12.000 intercambios conversacionales cortos de saludos en ingles (aproximadamente 697.000 caracteres, 56 caracteres distintos), generado a partir de listas de frases escritas a mano con variaciones de mayusculas y puntuacion. El preprocesado normaliza finales de linea de Windows, divide el fichero en bloques de conversacion, elimina duplicados exactos, baraja con semilla fija, conserva ejemplos que caben en la ventana de 128 tokens y reserva un 5 por ciento para validacion. La perdida se calcula unicamente sobre la parte de respuesta del bot, no sobre el prompt.

La configuracion de entrenamiento incluye AdamW con learning rate pico de 0,002, 100 pasos de warmup seguidos de un schedule coseno, batch size de 64, dropout de 0,1 y recorte de gradiente a 1,0, durante un maximo de 3.000 pasos. El checkpoint se guarda cuando mejora la perdida de validacion. No se documenta uso de RLHF, DPO ni decodificacion especulativa.

## Capacidades

- Generacion de texto corto a nivel de caracter, orientada a respuestas conversacionales breves.
- Continuacion de dialogos en el formato exacto `User:` / `Bot:`.
- Reproduccion de patrones de saludo, presentacion, agradecimiento y despedida presentes en el dataset de entrenamiento.
- Valor didactico: permite inspeccionar tokenizacion por caracter, atencion causal y bucle de entrenamiento en PyTorch.
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de soporte de agentes ni de razonamiento multi-paso.
- No se declaran capacidades multilingues; el entrenamiento es en ingles.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Docencia y aprendizaje: usar el modelo como ejemplo completo y ejecutable de un GPT minimo para explicar tokenizacion por caracter, atencion causal y entrenamiento supervisado en un curso introductorio de deep learning.
- Experimentacion con tokenizadores: comparar el comportamiento de un tokenizador a nivel de caracter frente a BPE o WordPiece en un corpus pequeno, midiendo longitud de secuencia y perdida.
- Pruebas de pipelines de inferencia: validar scripts de carga de checkpoints PyTorch, generacion autorregresiva y gestion de vocabulario en entornos de CI sin necesidad de GPU.
- Demostraciones de prototipado rapido: ilustrar el ciclo completo de entrenamiento e inferencia en charlas o talleres sin depender de infraestructura de GPU.
- Pruebas de robustez y alucinacion: estudiar como un modelo de 1M de parametros produce texto repetitivo o incoherente, como caso base para comparar con modelos mayores.
- Reproduccion de experimentos: reentrenar desde cero con el notebook y el dataset publicados para verificar resultados y experimentar con hiperparametros (learning rate, pasos, dropout).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el checkpoint contiene aproximadamente 1,02 millones de parametros, por lo que en float32 ocupa del orden de 4 MB.
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU sin dificultad.
- Cabe en cualquier GPU de consumo, incluida una GTX 1050 o una iGPU moderna, y tambien en CPU.
- Opciones de despliegue: el repositorio incluye `inference.py`, un CLI basado en PyTorch. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y el formato de pesos (`.pt` con vocabulario de caracteres propio) no es directamente compatible con esos runners sin conversion.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo, la generacion caracter a caracter en CPU deberia ser practicamente instantanea, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tokenizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TinyGPT v2 Conversation | 1.022.592 | 128 caracteres | Caracter (56 + EOS) | MIT | Hugging Face, checkpoint PyTorch |
| GPT-2 small | 124 millones | 1.024 tokens | BPE | MIT | Hugging Face, safetensors/GGUF |
| TinyStories-1M | 1 millon (aprox.) | no disponible | BPE | MIT | Hugging Face |
| Karpathy nanoGPT (referencia) | configurable (tipicamente 10-124 millones) | configurable | Caracter o BPE | MIT | Repositorio GitHub |

La comparativa se limita a modelos de escala minima o proposito educativo; no se dispone de datos de rendimiento comparables para TinyGPT v2 Conversation, por lo que la comparacion se realiza solo en parametros, contexto y licencia.

## Limitaciones y advertencias

- Modelo de 1M de parametros entrenado sobre un dataset sintetico de saludos: no responde a preguntas factuales ni mantiene conversaciones largas.
- No es adecuado para razonamiento complejo, programacion ni matematicas.
- Ventana de contexto de solo 128 caracteres, lo que impide recordar informacion entre turnos extensos o sesiones.
- Puede producir texto repetitivo, incompleto o sin sentido; la propia model card lo advierte.
- Entrenado exclusivamente en ingles sobre un dataset de saludos; el rendimiento en castellano u otros idiomas no esta documentado y previsiblemente sera nulo.
- Riesgo alto de alucinacion y de respuestas incoherentes por la limitacion de capacidad y de datos.
- No debe usarse para consejo medico, legal, financiero ni en contextos de alto riesgo.
- Licencia MIT: permite uso comercial, pero la ausencia de calidad y de garantias hace desaconsejable su uso en produccion.
- El repositorio no incluye el dataset de entrenamiento; solo el checkpoint y el script de inferencia.
- El checkpoint esta en formato `.pt` con un vocabulario de caracteres propio, lo que complica su integracion en herramientas estandar de despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AlmostNobody/Tinygpt_v2_conversation
- Dataset de entrenamiento: https://huggingface.co/datasets/Neural-Labs/tiny-llm-dataset

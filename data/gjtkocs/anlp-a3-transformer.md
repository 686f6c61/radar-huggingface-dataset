# GJTKOCS/anlp-a3-transformer

## Resumen

`GJTKOCS/anlp-a3-transformer` es un modelo transformer de tipo encoder-decoder (o decoder, la model card no lo especifica con claridad) entrenado desde cero para una tarea muy concreta: el descifrado de texto a nivel de caracter. Es un trabajo academico correspondiente a la asignatura Advanced NLP (Monsoon 2026, A3), publicado en Hugging Face por el usuario GJTKOCS. No es un modelo de proposito general ni un LLM conversacional: es un artefacto de investigacion docente con un dominio de aplicacion muy restringido.

Con 4.774.231 parametros totales, `d_model=256`, 6 capas y un vocabulario de solo 87 tokens, el modelo esta disenado para operar sobre secuencias de caracteres, no sobre subpalabras. Su relevancia practica fuera del contexto academico es practicamente nula, pero resulta util como referencia para entender el entrenamiento de transformers pequenos en tareas de cifrado/descifrado y como ejemplo de pipeline completo (tokenizacion a nivel de caracter, entrenamiento desde cero, evaluacion).

La model card esta incompleta: la tabla de metricas de test aparece vacia, no se declara licencia, no se declaran idiomas soportados y no hay informacion sobre el dataset de entrenamiento. Todo lo que sigue se basa en los pocos datos tecnicos disponibles y en inferencias razonables a partir de la arquitectura declarada; cualquier dato no confirmado se marca como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (encoder-decoder o decoder, no especificado) |
| Parametros totales | 4.774.231 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors y pytorch) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors, pytorch (bin) |
| d_model | 256 |
| Numero de capas | 6 |
| Vocabulario | 87 tokens (nivel de caracter) |
| Libreria | pytorch |

## Arquitectura y entrenamiento

La arquitectura declarada es un transformer con `d_model=256`, 6 capas y un vocabulario de 87 simbolos. El vocabulario de 87 tokens es coherente con un tokenizador a nivel de caracter que cubre letras mayusculas y minusculas, digitos, signos de puntuacion y posiblemente caracteres especiales de control. El modelo esta entrenado desde cero ("trained from scratch"), sin inicializacion a partir de pesos preentrenados, lo que explica el bajo numero de parametros y el caracter cerrado de la tarea.

No hay informacion en la model card sobre el numero de tokens de entrenamiento, la composicion del dataset, el tipo de cifrado utilizado (Cesar, Vigenere, sustitucion, transposicion, etc.), ni sobre si se aplico RLHF, DPO o algun tipo de ajuste fino supervisado. Tampoco se documenta la funcion de perdida, el optimizador ni el esquema de learning rate. La tabla de metricas de test esta presente pero vacia, por lo que no se han publicado resultados cuantitativos de evaluacion.

## Capacidades

- Descifrado de texto a nivel de caracter: la unica capacidad documentada es la de transformar texto cifrado en texto plano, presumiblemente para un esquema de cifrado concreto definido en el enunciado de la practica.
- Generacion de texto limitada al alfabeto de 87 caracteres: no maneja subpalabras ni vocabulario abierto.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingue; el vocabulario de 87 caracteres sugiere un alfabeto latino basico, no cobertura multilingue real.
- No se documentan modos especiales (thinking mode, vision, audio, etc.).

## Casos de uso

- Docencia y evaluacion academica: el modelo sirve como referencia para corregir y comparar practicas de la asignatura ANLP A3, permitiendo a los estudiantes contrastar su implementacion con un artefacto publicado.
- Reproduccion de experimentos de cifrado: un investigador puede cargar los pesos y reproducir el pipeline de descifrado a nivel de caracter para estudiar el comportamiento de transformers pequenos en tareas simbolicas.
- Baseline para tareas de traduccion caracter a caracter: el modelo puede usarse como linea base en experimentos de seq2seq sobre alfabetos cerrados, por ejemplo transliteracion o normalizacion de texto.
- Estudio de eficiencia en modelos diminutos: con 4,77 M de parametros y `d_model=256`, es un caso de estudio util para medir latencia y consumo en CPU o GPUs de gama baja.
- Pruebas de infraestructura de despliegue: sirve para validar pipelines de inferencia (carga de safetensors, tokenizacion a nivel de caracter) antes de escalar a modelos mayores.
- Analisis de robustez frente a ruido: al operar sobre caracteres, permite estudiar como afectan los errores de un caracter a la salida descifrada, algo relevante en tareas de correccion ortografica o de recuperacion de texto corrupto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La tabla de metricas de test de la model card aparece sin filas ni valores.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 19 MB solo para pesos (4,77 M de parametros x 4 bytes), mas activaciones y buffers, en torno a 50-100 MB en funcion de la longitud de secuencia.
- VRAM estimada en fp16/bf16: aproximadamente 10 MB para pesos, con overhead de activaciones similar.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; el modelo cabe holgadamente en GTX 1650, RTX 3050, RTX 4090, A100 o H100.
- Cabe en GPU de consumo y tambien en CPU: es viable la inferencia en CPU con latencias de milisegundos para secuencias cortas.
- Opciones de despliegue: al ser un modelo PyTorch con pesos safetensors, se puede cargar con `transformers` si el autor publico la configuracion correspondiente, o directamente con PyTorch. No hay evidencia de soporte en vLLM, llama.cpp, Ollama o TGI, y por su tamano y tarea no es esperable que lo haya.
- Latencia y throughput: no disponibles. Por el tamano, se espera latencia sub-milisegundo por token en GPU moderna y throughput muy alto en batch, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No hay modelos comparables directos en la informacion disponible. Se puede situar frente a otras practicas academicas de transformers pequenos, pero no se dispone de datos de rendimiento de ninguno de ellos.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GJTKOCS/anlp-a3-transformer | 4,77 M | no disponible | Descifrado a nivel de caracter | no disponible | Hugging Face |
| Alternativas de la misma practica | no disponible | no disponible | Descifrado a nivel de caracter | no disponible | no disponible |
| Transformers pequenos genericos (p. ej. destilados) | 10-100 M | 512-2048 | Proposito general | variable | Hugging Face |

## Limitaciones y advertencias

- La model card no declara licencia, por lo que el uso comercial queda en un limbo legal: no se puede asumir permiso de uso sin consultar al autor.
- El modelo esta entrenado para un esquema de cifrado concreto no documentado; fuera de ese esquema su comportamiento es impredecible y probablemente erroneo.
- El vocabulario de 87 caracteres limita la entrada a un alfabeto cerrado; cualquier caracter fuera de ese conjunto (acentos, simbolos Unicode, emojis) no sera procesado correctamente.
- Riesgo alto de alucinacion fuera del dominio: al ser un modelo diminuto entrenado desde cero, no tiene conocimiento general y producira salidas sin sentido si se le alimenta con texto que no sea del tipo esperado.
- No hay informacion sobre sesgos, pero al entrenarse sobre un dataset academico no documentado podria reflejar los sesgos de dicho corpus.
- La ausencia de metricas de test impide conocer la calidad real del descifrado; no se debe asumir un rendimiento alto.
- No apto para produccion: sin licencia, sin documentacion de evaluacion, sin tokenizador publicado de forma explicita y sin garantias de mantenimiento.
- El repositorio ocupa 0,0 GB segun Hugging Face, lo que sugiere que los pesos podrian no estar subidos o que el tamano se redondea; conviene verificar la presencia real de los ficheros safetensors antes de intentar cargarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GJTKOCS/anlp-a3-transformer
- Repositorio del autor: no disponible
- Paper o blog asociado: no disponible
- Demo: no disponible

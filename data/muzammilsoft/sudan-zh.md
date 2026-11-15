# muzammilsoft/sudan-zh

## Resumen

Sudan-zh es un modelo de generacion de texto de tipo MiniGPT desarrollado por muzammilsoft y entrenado con TAIT, un framework de entrenamiento basado en NumPy. Su proposito es responder preguntas sobre Sudan, China y las relaciones bilaterales entre ambos paises en chino simplificado. Se trata de un experimento de demostracion orientado a hardware modesto y a inferencia en dispositivo (on-device), no de un modelo de proposito general.

El modelo sigue una arquitectura transformer de tipo GPT con 256 dimensiones de modelo, 1024 dimensiones de capa feed-forward y una longitud de bloque de 57 tokens. El vocabulario es de solo 1503 tokens BPE, y los pesos se distribuyen en un unico fichero `.npz` de NumPy de aproximadamente 11 MB. No se ha publicado el numero total de parametros en la informacion disponible, aunque por las dimensiones declaradas se trata de un modelo del orden de pocos millones de parametros.

Su relevancia es limitada y fundamentalmente metodologica: ilustra como entrenar un modelo de preguntas y respuestas en chino desde cero con recursos minimos y desplegarlo en navegador o en Android mediante los runners TAIT-TOY y KAIT. El propio autor reconoce que el modelo memoriza las preguntas de entrenamiento pero falla con frecuencia ante reformulaciones nuevas, por lo que debe tratarse como una prueba de concepto y no como una fuente fiable de informacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo GPT (MiniGPT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 57 tokens (block_size) |
| Tipos de cuantizacion | no disponible (pesos NumPy en `.npz`) |
| Idiomas soportados | chino simplificado |
| Licencia | MIT |
| Formato de pesos | `.npz` (NumPy + tokenizer BPE) |
| Dimension del modelo (d_model) | 256 |
| Dimension feed-forward (d_ff) | 1024 |
| Tamano de vocabulario | 1503 |
| Version de TAIT | 2.3.1 |
| Tamano del fichero | 11.009.118 bytes (~11 MB) |
| Tamano del repositorio | 0.0 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de tipo GPT con embeddings de 256 dimensiones, capas feed-forward de 1024 dimensiones y una ventana de contexto de 57 tokens, lo que lo situa en la categoria de los modelos MiniGPT. Los pesos se almacenan en formato NumPy (`.npz`) junto con un tokenizer BPE de 1503 entradas, y son compatibles con el runner de linea de comandos de TAIT, con la aplicacion web TAIT-TOY y con KAIT, el runner para Android.

El entrenamiento se realizo con TAIT 2.3.1 sobre el dataset `sudan-china-facts-zh`, compuesto por 150 hechos sobre Sudan, China y las relaciones sino-sudanesas, expandidos a 1363 ejemplos de entrenamiento. Se ejecutaron 60 epocas, con una perdida final de entrenamiento de 0.9368 y una perdida de validacion de 2.9876. La brecha entre ambas cifras es indicativa de sobreajuste: el modelo aprende bien los ejemplos exactos pero generaliza mal. No se menciona en la informacion disponible el uso de RLHF, DPO ni tecnicas de alineacion adicionales.

## Capacidades

- Generacion de texto en chino simplificado dentro del dominio acotado de Sudan, China y sus relaciones bilaterales.
- Respuesta a preguntas factuales cuando la formulacion coincide o se aproxima mucho a las del conjunto de entrenamiento.
- Inferencia en dispositivo: ejecucion en navegador (TAIT-TOY) y en Android (KAIT) sin necesidad de GPU.
- Carga mediante linea de comandos con `tait chat --model sudanzh-0.1.npz`.
- No dispone de soporte documentado de tool calling ni de function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de vision, audio ni modo de razonamiento explicito (thinking mode).
- Capacidad multilingue limitada al chino simplificado; no se documentan otros idiomas.

## Casos de uso

- Demostracion educativa de entrenamiento de un modelo GPT desde cero: sirve para ilustrar el ciclo completo (dataset, tokenizer, entrenamiento, evaluacion) con recursos minimos y en hardware debil.
- Prueba de concepto de asistentes Q&A en chino sobre un dominio muy acotado: util para validar pipelines de datos y de evaluacion antes de escalar a modelos mayores.
- Inferencia en navegador: integrable en TAIT-TOY para mostrar respuestas de ejemplo como chips de sugerencia cuando la interfaz esta en chino simplificado.
- Aplicacion movil offline en Android: el fichero de 11 MB se carga en KAIT, lo que permite experimentar con inferencia local sin conectividad ni servidores.
- Banco de pruebas de frameworks: sirve para verificar el funcionamiento de TAIT, KAIT y TAIT-TOY en entornos de desarrollo y CI.
- Material docente sobre sobreajuste y evaluacion honesta: la diferencia entre perdida de entrenamiento (0.9368) y de validacion (2.9876), junto con el 12,5% de acierto en preguntas reformuladas, constituye un caso practico claro de limitaciones de generalizacion.

## Benchmarks y rendimiento

| Evaluacion | Resultado |
|---|---|
| Preguntas retenidas con reformulaciones nuevas (40, decodificacion greedy) | 5 correctas (12,5%) |
| Perdida final de entrenamiento | 0.9368 |
| Perdida de validacion | 2.9876 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el fichero de pesos ocupa aproximadamente 11 MB.
- GPU recomendadas: no requiere GPU; el entrenamiento declarado se realizo con NumPy y el autor lo describe como viable en hardware debil.
- Compatibilidad con GPU de consumo: si, en cualquier GPU de consumo e incluso sin GPU (CPU).
- Opciones de despliegue: runner de TAIT (`tait chat`), TAIT-TOY en navegador y KAIT en Android. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo se espera latencia muy baja en CPU, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Sudan-zh (muzammilsoft) | no disponible (orden de millones) | 57 tokens | Chino simplificado | MIT | `.npz` (NumPy) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- Sobreajuste severo: perdida de validacion de 2.9876 frente a 0.9368 de entrenamiento, con solo un 12,5% de acierto en preguntas reformuladas.
- Alto riesgo de alucinacion, repeticion y respuestas fuera de tema, segun reconoce el propio autor.
- Ventana de contexto de solo 57 tokens, insuficiente para conversaciones multi-turno o documentos largos.
- Vocabulario de 1503 tokens, que limita la cobertura lexica y la calidad de la tokenizacion.
- Dominio restringido a 150 hechos sobre Sudan, China y sus relaciones; no es un modelo de proposito general.
- Idioma limitado al chino simplificado; no se documenta soporte de castellano ni de otros idiomas.
- Sesgos conocidos: no documentados en la informacion disponible, aunque el dataset se centra en un unico tema y perspectiva.
- Licencia MIT: permite uso comercial, pero el autor advierte explicitamente de que la salida no debe tratarse como fuente factual.
- No apto para produccion: debe considerarse exclusivamente un experimento de demostracion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/muzammilsoft/sudan-zh
- Dataset de entrenamiento: https://huggingface.co/datasets/muzammilsoft/sudan-china-facts-zh
- Repositorio de TAIT: https://github.com/muzammilsoft/tait

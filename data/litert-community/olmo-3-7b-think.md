# litert-community/Olmo-3-7B-Think

## Resumen

Olmo-3-7B-Think es un modelo de razonamiento de 7.298 millones de parametros desarrollado por el Allen Institute for AI (Ai2), publicado como parte de la familia Olmo 3 junto a variantes de 32B y a las versiones Instruct. Se trata de un transformer denso entrenado desde cero con el dataset Dolma 3 y afinado con las colecciones Dolci, cuyo flujo completo (datos, codigo y pesos) se libera de forma abierta. Su particularidad es que siempre razona: genera una cadena de pensamiento larga antes de responder, lo que mejora tareas de matematicas y codigo.

La ficha que nos ocupa no es el checkpoint original, sino la conversion realizada por la comunidad litert-community al formato LiteRT-LM (`.litertlm`) para el runtime de Google orientado a dispositivos. Se ofrecen tres ficheros: int8, int4 y una variante int4 con cache KV de 2.048 tokens pensada para telefonos. La conversion reduce el contexto operativo de 65.536 posiciones del modelo original a 4.096 (o 2.048 en la variante movil), un compromiso necesario para la inferencia en el borde.

Es relevante ahora porque demuestra que un modelo de razonamiento de 7B puede ejecutarse en hardware de consumo y en moviles de gama alta, con velocidades de decodificacion de 34,8 tok/s en un Mac Studio M4 Max y 7,0 tok/s en un Galaxy S26, manteniendo una precision cercana al modelo bf16 original en GSM8K (81 frente a 84).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atencion de ventana deslizante e hibrida |
| Parametros totales | 7.298.011.136 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 4.096 tokens en los ficheros int8 e int4; 2.048 en la variante `int4_c2048`; 65.536 en el modelo original |
| Tipos de cuantizacion | int8 (lineales y embedding) e int4 blockwise-32 (OCTAV) con embedding int8; activaciones en float |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); el modelo base esta en safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 32 capas con un diseno de atencion hibrida: 24 capas usan atencion de ventana deslizante de 4.096 tokens y 8 capas (cada cuarta) usan atencion completa. El tamano oculto es de 4.096, el intermedio de 11.008, con 32 cabezas de atencion y 32 cabezas KV de 128 dimensiones (multi-head attention sin agrupacion). Incorpora QK-norm sobre el ancho completo de la proyeccion, un bloque post-norm y RoPE con theta 500.000 y YaRN (factor 8 sobre 8.192 posiciones originales) aplicado en las capas de atencion completa. El vocabulario es de 100.278 tokens con embeddings no atados.

El entrenamiento parte del dataset Dolma 3 para el preentrenamiento y de las colecciones Dolci para el post-entrenamiento. La linea Think sigue una secuencia de SFT, DPO y finalmente RLVR, siendo este checkpoint el resultado final de esa cadena. El corte de datos es diciembre de 2024. En la conversion a LiteRT-LM, cada capa mantiene una cache KV de longitud completa de 4.096 posiciones, igual a la ventana deslizante, de modo que las capas deslizantes ven todos los tokens anteriores, replicando el comportamiento del modelo fuente para conversaciones de hasta 4.096 tokens. La conversion se realizo con litert-torch 0.9.4 y se probo con litert-lm 0.18.0.

## Capacidades

- Generacion de texto con razonamiento explicito: el modelo siempre emite una cadena de pensamiento delimitada por `<think>` y `</think>` antes de la respuesta final.
- Razonamiento matematico y resolucion de problemas de varios pasos, con especial rendimiento en MATH, AIME y GSM8K.
- Generacion de codigo y tareas de programacion competitiva (HumanEval+, LiveCodeBench).
- Razonamiento de sentido comun y tareas de comprension compleja (BBH, MMLU, GPQA).
- Seguimiento de instrucciones (IFEval).
- El runtime separa el canal de pensamiento (`thought`) del texto de respuesta, de modo que la salida visible contiene solo la respuesta.
- Capacidades multilingues limitadas al ingles.
- No soporta tool calling ni function calling de forma nativa segun la informacion disponible.
- No dispone de vision ni audio.
- El modo de pensamiento no se puede desactivar: las opciones `--thinking false` y `--thinking-budget 0` del CLI no alteran la salida.

## Casos de uso

- Tutoria matematica en dispositivos: el modelo puede resolver problemas paso a paso mostrando el razonamiento, lo que resulta util en aplicaciones educativas que se ejecutan localmente en un portatil o movil sin conexion, gracias a su formato LiteRT-LM y a su tamano int4 de 4,31 GB.
- Asistente de programacion offline: con una puntuacion de 89,9 en HumanEval+ y 75,2 en LiveCodeBench v3, puede integrarse en entornos de desarrollo sin acceso a red para generar y explicar fragmentos de codigo.
- Analisis de documentos tecnicos en el borde: su ventana de 4.096 tokens permite procesar articulos, informes o extractos de codigo en un Mac o en un telefono de gama alta, manteniendo los datos en el dispositivo.
- Prototipado de agentes de razonamiento en movil: la variante `int4_c2048` funciona en un Galaxy S26 de 12 GB con 7,0 tok/s, lo que permite experimentar con flujos de razonamiento multi-paso en hardware real de consumo.
- Evaluacion de modelos abiertos en investigacion: al liberarse datos, codigo y pesos, sirve para estudiar el comportamiento de cadenas de pensamiento largas y el efecto de la cuantizacion int4 frente a bf16 (80 frente a 84 en GSM8K).
- Despliegue en estaciones de trabajo sin GPU dedicada: el fichero int8 en CPU de un Mac M4 Max completa una prefill de 1.024 tokens mas 256 tokens decodificados en 46,04 segundos, viable para herramientas internas de baja concurrencia.
- Generacion de documentacion tecnica con justificacion: el canal de pensamiento separado permite auditar el razonamiento del modelo en tareas de sintesis o clasificacion compleja.

## Benchmarks y rendimiento

Resultados reportados por Ai2 para el modelo original (bf16) con sus ajustes de generacion:

| Benchmark | Resultado |
|---|---|
| MATH | 95,1 |
| AIME 2024 | 71,6 |
| AIME 2025 | 64,6 |
| BBH | 86,6 |
| HumanEval+ | 89,9 |
| LiveCodeBench v3 | 75,2 |
| IFEval | 88,2 |
| MMLU | 77,8 |
| GPQA | 46,2 |

Resultados de la conversion LiteRT-LM en GSM8K con presupuesto de salida de 2.048 tokens (respuestas puntuadas tras `</think>`):

| Version | GSM8K |
|---|---|
| bf16 (transformers) | 84 |
| int8 (`.litertlm`) | 81 |
| int4 (`.litertlm`) | 80 |

Rendimiento medido (prefill de 1.024 tokens mas 256 tokens decodificados, contexto 2.048):

| Configuracion | Mac Studio M4 Max | Galaxy S26 | Pixel 8a |
|---|---|---|---|
| int4 GPU | 8,59 s | el motor GPU no compila | no ejecutado |
| int4 con cache 2.048, GPU | 6,58 s | 41,32 s | no ejecutado |
| int8 GPU | 9,64 s | no ejecutado | no ejecutado |
| int8 CPU | 46,04 s | no ejecutado | no ejecutado |
| int4 CPU | 51,97 s | no ejecutado | no ejecutado |

Velocidad de decodificacion: 34,8 tok/s (int4 GPU, Mac M4 Max), 30,4 tok/s (int8 GPU), 46,6 tok/s (int4 con cache 2.048, Mac GPU) y 7,0 tok/s (int4 con cache 2.048, Galaxy S26).

## Requisitos de hardware

- VRAM estimada: aproximadamente 4,31 GB para los ficheros int4 y 7,43 GB para el int8, mas el espacio de activaciones y cache KV.
- GPU recomendadas: Apple Silicon (M4 Max probado), GPU integradas o dedicadas con soporte LiteRT; en movil, un Galaxy S26 de 12 GB.
- Cabe en GPU de consumo: si, los ficheros int4 (4,31 GB) caben en GPUs con 8 GB o mas; el int8 requiere al menos 10-12 GB para operar con holgura.
- En moviles: la variante `int4_c2048` funciona en un dispositivo de 12 GB; los ficheros con cache de 4.096 tokens no compilaron el motor GPU en el Galaxy S26 probado.
- Opciones de despliegue: runtime LiteRT-LM (CLI y libreria), con conversion desde Hugging Face mediante `hf-to-litertlm`. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ver tabla de la seccion anterior; el int4 es mas rapido en GPU (10,9 % menos tiempo) y el int8 en CPU (prefill de 131 tok/s frente a 64 tok/s del int4).
- No medido en iOS.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Olmo-3-7B-Think (LiteRT-LM) | 7,3B | 4.096 (2.048 en movil) | Apache 2.0 | `.litertlm` | Conversion on-device; GSM8K 80-81 |
| Olmo-3-7B-Think (original) | 7,3B | 65.536 | Apache 2.0 | safetensors | Modelo fuente; GSM8K 84 en bf16 |
| Alternativas de 7B con razonamiento | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- El modelo solo soporta ingles; no se han validado capacidades en otros idiomas.
- El razonamiento es obligatorio y no se puede desactivar: `--thinking false` y `--thinking-budget 0` producen exactamente la misma salida, y un presupuesto positivo cierra el canal mientras el modelo sigue razonando en el texto visible.
- Las cadenas de pensamiento son largas: en GSM8K la respuesta media fue de unos 1.600 tokens y un tercio de las respuestas del modelo bf16 agotaron el presupuesto de 2.048 tokens, frente a los 32.768 recomendados por Ai2.
- El contexto se reduce a 4.096 tokens en los ficheros int8 e int4 y a 2.048 en la variante movil, muy por debajo de las 65.536 posiciones del modelo original.
- La cuantizacion int4 degrada ligeramente la precision (80 frente a 84 en GSM8K) y su prefill en CPU es notablemente mas lento que el int8.
- Riesgo de alucinacion inherente a los modelos de lenguaje, no cuantificado en la informacion disponible; el razonamiento visible puede facilitar su deteccion.
- No se documentan sesgos especificos en la informacion proporcionada.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse el cumplimiento de las condiciones del modelo base y de los datos de entrenamiento.
- Los ficheros con cache de 4.096 tokens no compilaron el motor GPU en el Galaxy S26 probado; el soporte en iOS no se ha medido.
- El corte de conocimiento es diciembre de 2024.

## Enlaces

- Hugging Face (conversion LiteRT-LM): https://huggingface.co/litert-community/Olmo-3-7B-Think
- Modelo base: https://huggingface.co/allenai/Olmo-3-7B-Think
- Runtime LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
- Script de conversion hf-to-litertlm: https://github.com/john-rocky/hf-to-litertlm
- Paper de Olmo 3: https://arxiv.org/abs/2512.13961

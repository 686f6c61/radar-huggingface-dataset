# nace-ai/Qwen3.8-Flash-Next-MLX-4bit-KQuant

## Resumen

Qwen3.8-Flash-Next-MLX-4bit-KQuant es una cuantizacion en 4 bits del modelo Qwen3.8-Flash-Next de Alibaba (equipo Qwen), empaquetada por Nace.AI para su ejecucion local en Apple Silicon mediante la libreria MLX y su motor Kapitsa. El modelo base es multimodal (image-text-to-text) y el pack conserva los 179.999.981.459 parametros del modelo original, comprimidos a un repositorio de 105,8 GB (98,6 GiB de descarga). La innovacion del pack es el esquema de cuantizacion "KQuant": solo 324 de los 3.649 tensores conservan la cuantizacion del pack catalogo original, mientras el resto usa el esquema KQuant, que segun el autor queda mas cerca del modelo bf16 de referencia.

El problema que resuelve es practico: permitir ejecutar un modelo de ~180.000 millones de parametros en un Mac con memoria unificada grande (el autor lo midio en un Mac Studio M1 Ultra de 128 GB), manteniendo la velocidad del pack catalogo y reduciendo la divergencia respecto al original. La metrica reportada es la divergencia KL sobre 32.704 predicciones de siguiente token: 0,1275 para KQuant frente a 0,1411 para el pack catalogo, con el modelo bf16 como referencia. El rendimiento medido es de 61,17 tokens/s en escritura con temperatura 0,6 y 752,00 tokens/s en lectura de un prompt de 4K.

Es relevante ahora porque demuestra que la cuantizacion selectiva por tensor (dejando intactos los tensores mas sensibles) puede mejorar la fidelidad sin coste de velocidad, y porque abre la inferencia de modelos frontera multimodales a hardware de consumo de gama alta con memoria unificada. No es un lanzamiento oficial de Qwen: es un trabajo de cuantizacion de terceros sobre los pesos publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer multimodal (image-text-to-text); detalles internos no disponibles |
| Parametros totales | 179.999.981.459 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (KQuant, con 324 de 3.649 tensores en el esquema del pack catalogo) |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (license: other) |
| Formato de pesos | safetensors (libreria MLX) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer multimodal de aproximadamente 180.000 millones de parametros disenado por el equipo Qwen de Alibaba Group, con capacidad de entrada de imagen y texto. La model card del pack no detalla la arquitectura interna (atencion, capas, uso de MoE, etc.), el volumen de tokens de entrenamiento ni las tecnicas de alineacion (RLHF/DPO) empleadas en el modelo original; esos datos no estan disponibles en la informacion proporcionada.

La innovacion tecnica de este repositorio es la cuantizacion KQuant aplicada sobre los pesos publicados. Segun el autor, el pack es "parcial": 324 de los 3.649 tensores mantienen la cuantizacion del pack catalogo y el resto usa KQuant. La medicion de fidelidad se hizo con mlx-vlm 0.7.8 sobre muestras de WikiText-2, conversaciones de GSM8K y codigo de HumanEval, en una pasada sobre 64 chunks, sin intervalo de confianza y sin evaluar la parte de vision. El motor de inferencia es Kapitsa (build de main en el commit `cc94c34f`, incluido en el release candidate 0.2.35); el release 0.2.34 no fue medido con este pack.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Entrada de imagen y texto (pipeline image-text-to-text), aunque la evaluacion de vision no se realizo en las mediciones del autor.
- Razonamiento y respuesta a instrucciones, con modo "thinking" activable y desactivable.
- Tool calling / function calling: todas las pruebas realizadas produjeron una primera llamada de herramienta valida.
- Razonamiento multi-paso con agentes: en modo thinking se observaron llamadas adicionales a `run_shell` en lugar de una respuesta final en 4 de 30 ensayos (frente a 3 de 30 del pack catalogo).
- Generacion de codigo (evaluada en las muestras de HumanEval del benchmark de fidelidad).
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Inferencia local de un modelo frontera multimodal en Apple Silicon: con 128 GB de memoria unificada (Mac Studio M1 Ultra o superior) se puede servir el modelo completo con Kapitsa mediante `kapitsa serve`, sin depender de la nube.
- Asistentes de codigo en local: el modelo genera codigo y soporta tool calling; puede integrarse en un flujo de edicion de ficheros y ejecucion de comandos en la maquina del desarrollador.
- Agentes con herramientas en escritorio: el soporte de function calling y el modo thinking permiten construir agentes que encadenan llamadas a herramientas (por ejemplo, shell o APIs internas) con razonamiento previo.
- Prototipado de aplicaciones imagen-texto: el pipeline image-text-to-text permite experimentar con descripcion de imagenes y preguntas sobre imagenes, aunque la calidad en vision no esta medida en este pack.
- Evaluacion de tecnicas de cuantizacion: investigadores pueden comparar KQuant frente al pack catalogo usando las metricas de divergencia KL y de tool calling publicadas por el autor.
- Procesamiento por lotes de prompts largos en local: con 752 tokens/s de lectura de un prompt de 4K, es viable procesar documentos largos en un equipo de sobremesa con memoria unificada.
- Educacion y experimentacion sin coste de API: al ejecutarse localmente, permite estudiar el comportamiento de un modelo de ~180.000 millones de parametros sin cuotas ni facturacion por token.

## Benchmarks y rendimiento

| Metrica | Pack catalogo | KQuant |
|---|---:|---:|
| Distancia al bf16 (KL sobre 32.704 predicciones) | 0,1411 | 0,1275 |
| Escritura, temperatura 0,6 (tokens/s) | 61,12 | 61,17 |
| Escritura, greedy (tokens/s) | 64,51 | 65,84 |
| Lectura de prompt 4K (tokens/s) | 738,25 | 752,00 |
| Llamada de herramienta extra, thinking off | 0/60 | 0/120 |
| Llamada de herramienta extra, thinking on | 3/30 | 4/30 |

Medido en un Mac Studio M1 Ultra de 128 GB con macOS 26.7 y alimentacion de red, el 11 de noviembre de 2026. Cada tramo usa `kapitsa bench --quick`, mediana de tres respuestas de 512 tokens por ajuste de decodificacion, con seis tramos por pack intercalados A B B A tres veces. No se publican resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria: el pack ocupa 98,6 GiB de descarga y 105,8 GB de repositorio; se necesita un Mac con memoria unificada suficiente para mantener los pesos en memoria. Un Mac de 48 GB no puede alojar los pesos.
- Hardware medido: Mac Studio M1 Ultra con 128 GB.
- GPU dedicadas (A100, H100, RTX 4090): no aplica directamente, ya que el formato es MLX para Apple Silicon; no hay datos de despliegue en CUDA en la informacion proporcionada.
- Cabe en GPU de consumo: no en tarjetas graficas convencionales; si en equipos Apple Silicon de gama alta con memoria unificada grande.
- Despliegue: Kapitsa (`brew install nace-ai/tap/kapitsa` y `kapitsa serve --model nace-ai/Qwen3.8-Flash-Next-MLX-4bit-KQuant`). No se indican opciones vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: 61,17 tokens/s en escritura con temperatura 0,6, 65,84 tokens/s en greedy y 752,00 tokens/s de lectura de prompt 4K, medidos en el hardware indicado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-MLX-4bit-KQuant (este) | ~180.000 M | no disponible | MLX safetensors 4-bit | Qwen Community 1.0 | KL 0,1275 frente a bf16; 61,17 tokens/s en escritura |
| Qwen3.8-Flash-Next-MLX-4bit (pack catalogo) | ~180.000 M | no disponible | MLX safetensors 4-bit | Qwen Community 1.0 | KL 0,1411; 61,12 tokens/s en escritura; mismo tamano de descarga |
| Qwen3.8-Flash-Next (bf16 original) | ~180.000 M | no disponible | safetensors bf16 | Qwen Community 1.0 | Referencia de fidelidad; requiere mucha mas memoria |

No se dispone de datos de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- No es un lanzamiento oficial de Qwen: es una cuantizacion de terceros (Nace.AI) sobre los pesos publicados; el autor lo indica explicitamente.
- La licencia Qwen Community License 1.0 se aplica sin cambios; los negocios de Model-as-a-Service o de asistente de IA necesitan una licencia Qwen separada para uso comercial segun la condicion 2.
- La evaluacion de fidelidad no cubre la parte de vision: el rendimiento multimodal no esta medido.
- La medicion de fidelidad usa una sola pasada sobre 64 chunks y no reporta intervalo de confianza; la diferencia de tool calling en modo thinking (4/30 frente a 3/30) no establece una regresion segun el autor.
- El motor Kapitsa 0.2.34 publicado no fue medido con este pack; las cifras corresponden a un build de main (`cc94c34f`) incluido en el release candidate 0.2.35.
- Requiere hardware Apple Silicon con memoria unificada grande; un Mac de 48 GB no puede cargar los pesos.
- No hay datos publicados sobre sesgos, riesgo de alucinacion, cobertura idiomatica ni longitud de contexto en la informacion disponible.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nace-ai/Qwen3.8-Flash-Next-MLX-4bit-KQuant
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Pack catalogo: https://huggingface.co/nace-ai/Qwen3.8-Flash-Next-MLX-4bit
- Motor Kapitsa: https://github.com/nace-ai/kapitsa
- Commit del build medido: https://github.com/nace-ai/kapitsa/commit/cc94c34fb9db9e7f85392fb7f69808511e0bb8da
- Sitio del autor: https://www.nace.ai/
- Licencia: LICENSE (incluida en el repositorio de Hugging Face)

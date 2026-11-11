# nace-ai/Qwen3.5-4B-GGUF

## Resumen

Qwen3.5-4B-GGUF es la distribucion en formato GGUF del modelo multimodal Qwen3.5-4B de Alibaba Qwen, publicada por nace-ai como material listo para ejecutar en el motor de inferencia local Kapitsa, orientado a Macs con Apple Silicon. El modelo base resuelve tareas de imagen-a-texto y conversacion multimodal, con 4.326.350.848 parametros totales (aproximadamente 4,3 mil millones) y licencia Apache 2.0.

La publicacion incluye cinco cuantizaciones GGUF (Q2_K, Q3_K_M, Q4_K_M, Q8_0 y un proyector de vision en bf16), donde las tres primeras se han generado con una matriz de importancia (imatrix) para reducir la perdida de calidad frente al modelo original en bf16. El autor reporta que la Q4_K_M con imatrix se aleja menos del bf16 que la Q4_K_M plana (KL de 0,018 frente a 0,031) manteniendo el mismo tamano de archivo (2,78 GB) y una velocidad de escritura practicamente identica.

Es relevante ahora porque permite desplegar localmente un modelo multimodal de ~4B en hardware de consumo Apple Silicon mediante un unico binario y un servidor HTTP con API compatible, sin depender de servicios en la nube. La ficha se centra en lo que la model card documenta; los datos no publicados se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.5-4B; pesos distribuidos en GGUF) |
| Parametros totales | 4.326.350.848 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_M, Q4_K_M (con imatrix), Q8_0; proyector de vision en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo base Qwen3.5-4B: no se detalla si es un transformer denso, MoE o hibrido, ni el numero de capas, dimensiones ocultas o mecanismo de atencion. Lo que si se documenta es el proceso de cuantizacion: los ficheros Q2_K, Q3_K_M y Q4_K_M se han generado con una matriz de importancia (imatrix) incluida en el repositorio (`imatrix.gguf`), mientras que Q8_0 se genero sin ella. El repositorio incluye ademas un proyector de vision (`mmproj-bf16.gguf`, 0,7 GB), coherente con la etiqueta de pipeline `image-text-to-text`.

El autor publica una medicion de fidelidad frente al GGUF en bf16: para Q4_K_M, la divergencia KL calculada sobre 64 fragmentos de 512 tokens (wikitext-2, conversaciones de GSM8K y HumanEval) baja de 0,031 a 0,018 al usar imatrix, y la coincidencia del token superior sube del 93,2 % al 94,2 %. La evaluacion se realizo con llama.cpp (`0a94a3f2`, 11 de noviembre de 2026) a traves de llama-server. No se dispone de informacion sobre volumen de tokens de entrenamiento, composicion del dataset ni fases de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional multi-turno, segun la etiqueta `conversational` del repositorio.
- Procesamiento de imagen y texto de entrada (`image-text-to-text`) mediante el proyector de vision incluido.
- Razonamiento aritmetico basico: la model card reporta resultados en GSM8K (0,930 con Q4_K_M imatrix sobre las 1.319 preguntas).
- Generacion de codigo: se evalua con HumanEval como parte del calculo de KL y se mide una respuesta de codigo de 512 tokens para la velocidad.
- Decodificacion con cabeza MTP (multi-token prediction) propia del fichero, usada por Kapitsa durante las pruebas de velocidad.
- Servidor HTTP local con pagina de chat y API en `http://127.0.0.1:8000` mediante `kapitsa serve`.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Cobertura multilingue: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente conversacional local en Mac: el modelo se sirve con `kapitsa serve` y ofrece chat y API en localhost, adecuado para prototipado sin enviar datos a terceros.
- Procesamiento de imagenes con descripcion o pregunta en lenguaje natural: gracias al proyector de vision bf16 incluido, se puede usar para extraer texto o describir capturas en flujos locales.
- Resolucion de problemas aritmeticos de enunciado: el rendimiento medido en GSM8K (0,930) lo hace util para tutoria o verificacion de calculos sencillos.
- Generacion de codigo en un entorno de desarrollo integrado local: la velocidad de escritura medida (136,1 tok/s en un MacBook Pro M5 Pro 48 GB) permite autocompletado interactivo en el propio portatil.
- Despliegue en equipos con poca memoria: la cuantizacion Q2_K (2,0 GB) permite ejecutar el modelo en Macs con 8-16 GB de RAM unificada, a costa de mayor perdida de calidad.
- Evaluacion comparativa de cuantizaciones: el repositorio incluye la imatrix y varias variantes, lo que facilita reproducir las mediciones de KL y GSM8K en otros equipos.
- Integracion en pipelines de CI o scripts: la API HTTP local permite invocar el modelo desde herramientas automatizadas sin infraestructura de GPU dedicada.

## Benchmarks y rendimiento

Datos publicados por el autor para Q4_K_M (unica cuantizacion medida):

| Metrica | Q4_K_M plana | Q4_K_M con imatrix (este repo) |
|---|---:|---:|
| Divergencia KL frente a bf16 (menor es mejor) | 0,031 | 0,018 |
| Mismo token superior que bf16 | 93,2 % | 94,2 % |
| GSM8K, 1.319 preguntas | 0,926 | 0,930 |
| GSM8K, primeras 100 preguntas | 0,95 | 0,94 |
| Velocidad de escritura (tok/s) | 134,5 | 136,1 |

Condiciones de medida: KL sobre 64 fragmentos de 512 tokens (wikitext-2, conversaciones de GSM8K y HumanEval) comparando logits contra el GGUF en bf16; GSM8K a traves de llama-server, una pregunta cada vez; velocidad en MacBook Pro M5 Pro 48 GB con Kapitsa 0.2.32, respuesta de codigo de 512 tokens a temperatura 0,6. La lectura de un prompt de 4K tokens se situa en torno a 2.100 tok/s. El autor advierte que la diferencia entre las dos puntuaciones de GSM8K esta por debajo del ruido de medida (aproximadamente 0,6 puntos sobre 1.319 preguntas). No se han publicado resultados de MMLU, HumanEval u otros benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM o memoria unificada estimada segun el tamano de fichero: Q2_K 2,0 GB, Q3_K_M 2,3 GB, Q4_K_M 2,8 GB, Q8_0 4,6 GB; hay que sumar 0,7 GB del proyector de vision si se usa entrada de imagen y el overhead del motor.
- Hardware objetivo declarado: Macs con Apple Silicon; la medicion de velocidad se realizo en un MacBook Pro M5 Pro con 48 GB de memoria unificada.
- GPU CUDA (A100, H100, RTX 4090): no se documenta soporte ni rendimiento en la model card.
- Cabe en equipos de consumo: si, en Macs con memoria unificada suficiente para el fichero elegido; no se aportan datos para GPUs de consumo.
- Despliegue: Kapitsa (`brew install nace-ai/tap/kapitsa` y `kapitsa serve --model /ruta/al/fichero.gguf`), con conversion en el primer uso. La evaluacion de calidad se hizo con llama.cpp; el autor no documenta otros motores.
- Rendimiento medido: 136,1 tok/s de escritura y aproximadamente 2.100 tok/s de lectura de prompt de 4K en el hardware indicado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---:|---|---|---|---|
| Qwen3.5-4B-GGUF (este repo) | 4.326.350.848 | no disponible | GGUF | Apache 2.0 | Cuantizaciones con imatrix, proyector de vision, orientado a Kapitsa/Apple Silicon |
| Qwen3.5-4B (modelo base) | 4.326.350.848 | no disponible | safetensors | Apache 2.0 | Referencia en bf16 frente a la que se mide la cuantizacion |
| Qwen3.5-4B MLX 4-bit KQuant (nace-ai) | 4.326.350.848 | no disponible | MLX | Apache 2.0 | Misma familia, build de 4 bits para MLX |

No se dispone de datos de benchmarks de terceros ni de especificaciones de contexto para establecer una comparacion cuantitativa con otras familias de modelos de tamano similar.

## Limitaciones y advertencias

- Solo se ha medido la cuantizacion Q4_K_M; Q2_K, Q3_K_M y Q8_0 no tienen resultados publicados de calidad en esta model card.
- Las cuantizaciones bajas (Q2_K, Q3_K_M) degradan la fidelidad frente a bf16; el autor no cuantifica esa perdida.
- La diferencia de GSM8K entre Q4_K_M plana y con imatrix esta dentro del ruido de medida, por lo que la mejora demostrada se limita a la divergencia KL.
- La model card no documenta sesgos conocidos, riesgo de alucinacion, cobertura idiomatica ni limitaciones de contexto del modelo base.
- El soporte de tool calling, agentes y modo de razonamiento no esta confirmado en la informacion disponible.
- El rendimiento de velocidad reportado corresponde exclusivamente a Apple Silicon con Kapitsa; no hay datos para CUDA, ROCm ni CPU x86.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-4B antes de redistribuir.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion independiente de las metricas del autor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nace-ai/Qwen3.5-4B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Build MLX 4-bit: https://huggingface.co/nace-ai/Qwen3.5-4B-MLX-4bit-KQuant
- Motor Kapitsa: https://github.com/nace-ai/kapitsa
- Nace.AI: https://www.nace.ai/

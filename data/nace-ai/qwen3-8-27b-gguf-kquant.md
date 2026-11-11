# nace-ai/Qwen3.8-27B-GGUF-KQuant

## Resumen

Qwen3.8-27B-GGUF-KQuant es una cuantización GGUF del modelo Qwen3.8-27B, publicada por Nace.AI (usuario `nace-ai`) para su motor de inferencia local Kapitsa, orientado a Macs con Apple silicon. El modelo base es Qwen/Qwen3.8-27B, un transformer multimodal de 27.320.697.856 parámetros (~27,3 mil millones) con pipeline `image-text-to-text`, lo que indica capacidades de visión además de generación de texto. La licencia es Apache 2.0, heredada del modelo base.

La aportación del repositorio no es un modelo nuevo, sino una cuantización calibrada ("KQuant") que, en formato GGUF, construye una matriz de importancia a partir de texto de calibración para reducir la degradación respecto al modelo original en bf16. El autor publica cuatro variantes GGUF (Q2_K, Q3_K_M, Q4_K_M y Q8_0) y ofrece métricas de calidad y velocidad para la variante Q4_K_M, la única medida en la model card.

Es relevante para desarrolladores que quieran ejecutar un modelo multimodal de ~27B en hardware de consumo Apple silicon: la variante Q4_K_M ocupa 16,8 GB en disco y requiere 48 GB de memoria unificada en el Mac más pequeño medido (M5 Pro), con un pico de 20,7 GiB en uso. El repositorio está pensado explícitamente para Kapitsa, aunque los ficheros GGUF son estándar y pueden usarse con otros motores compatibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.8-27B; pipeline image-text-to-text) |
| Parametros totales | 27.320.697.856 (~27,3 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K (2,96 bits), Q3_K_M (3,91 bits), Q4_K_M (4,85 bits), Q8_0 (8,5 bits) en GGUF; variantes MLX de 3, 4 y 8 bits y NVFP4 en repos separados |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (también MLX y NVFP4 en repos hermanos) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base Qwen3.8-27B en la documentación proporcionada: no se detalla si es un transformer denso, MoE o híbrido, ni el número de tokens de entrenamiento, la composición del dataset o si se aplicaron técnicas de RLHF/DPO. El pipeline declarado (`image-text-to-text`) confirma que el modelo acepta imágenes y texto como entrada y genera texto, pero no se especifican los detalles del codificador visual ni del mecanismo de fusión multimodal.

La innovación técnica documentada en este repositorio es el proceso de cuantización KQuant: en GGUF se construye una matriz de importancia a partir de texto de calibración para guiar la cuantización capa por capa. El autor reporta que la variante Q4_K_M con matriz de importancia alcanza una divergencia KL de 0,021 respecto al bf16 (frente a 0,030 de un Q4_K_M plano del mismo tamaño, 16,8 GB) y coincide con el token superior del bf16 en el 95,6 % de los casos (frente al 94,4 % del plano). Las variantes Q2_K, Q3_K_M y Q4_K_M se generaron con matriz de importancia; la Q8_0 se generó sin ella.

## Capacidades

- Generación de texto conversacional y respuestas multi-turno (etiqueta `conversational`).
- Procesamiento de imagen y texto como entrada (`image-text-to-text`), es decir, descripción y razonamiento sobre imágenes.
- Razonamiento y resolución de problemas matemáticos: la model card reporta una puntuación de 0,960 en GSM8K (100 preguntas) para la variante Q4_K_M.
- Generación de código: las pruebas de velocidad se basan en una respuesta de codificación de 512 tokens, lo que indica uso previsto para código.
- Compatibilidad con endpoints (`endpoints_compatible` en las etiquetas del repositorio).
- Capacidades de tool calling, function calling, agentes o modo thinking: no disponibles en la información proporcionada.
- Capacidades multilingües: no disponibles; no se declaran idiomas soportados.

## Casos de uso

- Asistente conversacional local en Mac: el modelo puede gestionar conversaciones multi-turno en local con el motor Kapitsa, con un pico de 20,7 GiB de memoria en un MacBook Pro M5 Pro de 48 GB, sin enviar datos a la nube.
- Análisis de imágenes en escritorio: al ser un modelo `image-text-to-text`, permite describir capturas, diagramas o documentos escaneados dentro de un flujo local; útil para herramientas de accesibilidad o extracción de información visual.
- Generación de código en local: la prueba de velocidad del autor usa una respuesta de codificación de 512 tokens a 52,3 tok/s, lo que lo hace adecuado para autocompletado y generación de fragmentos en un IDE sin depender de APIs externas.
- Razonamiento matemático y resolución de problemas: con 0,960 en GSM8K (n=100) en la variante Q4_K_M, es viable para tutoría o verificación de cálculos en aplicaciones educativas.
- Despliegue en estaciones de trabajo Apple silicon para prototipado: la variante Q2_K (10,9 GB) o Q3_K_M (13,5 GB) permiten probar el modelo en Macs con menos memoria unificada antes de pasar a Q4_K_M.
- Servicio local con API compatible: Kapitsa expone una página de chat y una API en `http://127.0.0.1:8000`, lo que permite integrar el modelo en pipelines internos o herramientas de automatización sin infraestructura GPU dedicada.
- Evaluación comparativa de cuantizaciones: los ficheros Q4_K_M con y sin matriz de importancia permiten medir el impacto de la calibración KQuant en tareas propias antes de adoptarla en producción.

## Benchmarks y rendimiento

| Prueba | Este variant (Q4_K_M KQuant) | Referencia bf16 | Veredicto |
|---|---:|---:|---|
| GSM8K (100 preguntas), vía Kapitsa en Mac | 0,960 (n=100) | 0,940 (n=100) | iguala |

| Métrica | Q4_K_M plano | Q4_K_M de este repo |
|---|---:|---:|
| Divergencia KL respecto a bf16 (menor es mejor) | 0,030 | 0,021 |
| Mismo token superior que bf16 | 94,4 % | 95,6 % |
| GSM8K (100 preguntas) | 0,95 | 0,95 |
| Escritura (tok/s) | 50,2 | 52,3 |
| Lectura de prompt de 4K (tok/s) | 412 | 395 |

| Velocidad en MacBook Pro M5 Pro, 48 GB | Valor |
|---|---:|
| Escritura (tok/s) | 52,3 |
| Lectura de prompt de 4K (tok/s) | 395 |
| Memoria en uso en pico (GiB) | 20,7 |

No se han publicado resultados de MMLU, HumanEval ni otros benchmarks estándar en la información disponible. Las mediciones de KL y GSM8K se realizaron con llama.cpp `0a94a3f2` sobre CUDA, con 64 fragmentos de 512 tokens contra los logits del GGUF bf16, y GSM8K a través de llama-server.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: la variante Q4_K_M requiere 20,7 GiB de memoria en pico en el Mac medido; el fichero ocupa 16,8 GB en disco. Q2_K (10,9 GB), Q3_K_M (13,5 GB) y Q8_0 (29,1 GB) escalan en consecuencia, aunque el autor no publica picos de memoria para esas variantes.
- GPU recomendadas: el autor mide exclusivamente en Apple silicon (MacBook Pro M5 Pro, 48 GB). No se proporcionan datos para A100, H100 o RTX 4090.
- Compatibilidad con GPU de consumo: el Mac más pequeño medido es un M5 Pro con 48 GB de memoria unificada; no se confirma funcionamiento en Macs con menos memoria ni en GPU NVIDIA de consumo.
- Opciones de despliegue: Kapitsa (`brew install nace-ai/tap/kapitsa`, `kapitsa serve --model /path/to/file.gguf`), que expone chat y API en `http://127.0.0.1:8000`. Los ficheros GGUF son estándar y el autor usa llama.cpp para las mediciones de calidad, por lo que otros motores GGUF son compatibles en principio, aunque no se documentan.
- Latencia y throughput: 52,3 tok/s de escritura y 395 tok/s de lectura de un prompt de 4K en M5 Pro de 48 GB. El autor advierte que la velocidad de lectura depende del texto del prompt (usa un drafter DFlash2 de Kapitsa).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato/cuantización | Licencia | Notas |
|---|---:|---|---|---|---|
| Qwen3.8-27B-GGUF-KQuant (este) | 27,3 B | no disponible | GGUF Q2_K–Q8_0 | Apache 2.0 | Optimizado para Kapitsa en Apple silicon; 52,3 tok/s en M5 Pro |
| Qwen/Qwen3.8-27B (base) | 27,3 B | no disponible | bf16 (safetensors) | Apache 2.0 | Modelo original; GSM8K 0,940 en la misma prueba |
| nace-ai/Qwen3.8-27B-MLX-4bit | 27,3 B | no disponible | MLX 4-bit, 16,3 GB | Apache 2.0 | Misma familia, formato MLX para Apple silicon |
| nace-ai/Qwen3.8-27B-NVFP4 | 27,3 B | no disponible | NVFP4 4-bit, 20,6 GB | Apache 2.0 | Misma familia, orientado a GPU NVIDIA |

No se dispone de datos sobre modelos comparables de otros fabricantes (por ejemplo, alternativas de ~27B multimodales) en la información proporcionada.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos, riesgos de alucinación ni limitaciones idiomáticas del modelo base; deben evaluarse de forma independiente antes de usarlo en producción.
- La longitud de contexto no se especifica, lo que impide planificar aplicaciones que dependan de ventanas largas.
- El rendimiento medido se limita a un único hardware (MacBook Pro M5 Pro, 48 GB) y a un único prompt de codificación; los números pueden no trasladarse a otros equipos o cargas.
- La cuantización introduce degradación respecto a bf16: incluso la Q4_K_M calibrada solo coincide con el token superior del bf16 en el 95,6 % de los casos y presenta una KL de 0,021.
- Las variantes Q2_K y Q3_K_M no tienen mediciones publicadas de calidad ni memoria; su uso en producción requiere validación propia.
- El flujo documentado depende de Kapitsa; aunque los GGUF son estándar, el autor no garantiza ni documenta el comportamiento en otros motores.
- La licencia Apache 2.0 permite uso comercial, pero se hereda del modelo base y conviene verificar los términos del repositorio original de Qwen.
- El repositorio tiene 36 descargas y 0 likes en el momento de la consulta, por lo que la validación comunitaria es mínima.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nace-ai/Qwen3.8-27B-GGUF-KQuant
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Motor Kapitsa: https://github.com/nace-ai/kapitsa
- Sitio de Nace.AI: https://www.nace.ai/
- Variante MLX 3-bit: https://huggingface.co/nace-ai/Qwen3.8-27B-MLX-3bit
- Variante MLX 4-bit: https://huggingface.co/nace-ai/Qwen3.8-27B-MLX-4bit
- Variante MLX 8-bit: https://huggingface.co/nace-ai/Qwen3.8-27B-MLX-8bit
- Variante NVFP4: https://huggingface.co/nace-ai/Qwen3.8-27B-NVFP4

# nace-ai/Qwen3.8-27B-MLX-3bit

## Resumen

Qwen3.8-27B-MLX-3bit es una cuantizacion a 3 bits en formato MLX del modelo Qwen3.8-27B, publicada por nace-ai para su motor de inferencia local Kapitsa, orientado a Macs con Apple Silicon. El modelo base lo desarrolla el equipo Qwen (Alibaba) y esta pensado para tareas multimodales de imagen-texto a texto, conversacion y generacion de codigo. La cuantizacion reduce el peso del repositorio a 12,9 GB, lo que permite ejecutar un modelo de 27.356.728.560 parametros en un MacBook Pro con 48 GB de memoria unificada.

La relevancia de esta ficha esta en que demuestra que un modelo denso de ~27B puede correr en hardware de consumo Apple con un consumo de memoria de pico de 14,6 GiB y una velocidad de escritura de 62,6 tokens por segundo en un M5 Pro. El motor Kapitsa incluye decodificacion especulativa (variante `mtp`), lo que explica las tasas de lectura de prompts de 431 tok/s (y 685 tok/s en builds posteriores).

Al estar basada en Qwen3.8-27B, hereda la licencia Apache 2.0 del modelo original, lo que facilita su uso comercial. La model card no detalla la arquitectura interna ni la composicion del dataset de entrenamiento; esta ficha se limita a los datos publicados por el autor de la cuantizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3.8-27B; detalles internos no disponibles) |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX 3-bit (este repo); variantes 4-bit, 8-bit, GGUF q2_k/q3_k_m/q4_k_m/q8_0 y NVFP4 en repos hermanos |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (3-bit) |

## Arquitectura y entrenamiento

La model card de esta cuantizacion no describe la arquitectura interna del modelo base Qwen3.8-27B, mas alla de la etiqueta `qwen3_5` en los tags de Hugging Face y del pipeline `image-text-to-text`, que indica capacidad multimodal de entrada de imagen y texto. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo original.

La innovacion tecnica destacable de esta publicacion es la cuantizacion a 3 bits en MLX combinada con decodificacion especulativa (sufijo `mtp` en la variante). Segun el autor, el motor Kapitsa usa un mecanismo de drafting cuya velocidad depende del texto de entrada, lo que permite alcanzar 431 tok/s de lectura de un prompt de ~4K tokens en un M5 Pro de 48 GB y 685 tok/s en builds posteriores a v0.2.34.

## Capacidades

- Generacion de texto y conversacion multi-turno.
- Procesamiento de imagen y texto como entrada (pipeline `image-text-to-text`).
- Generacion de codigo; el autor menciona explicitamente el uso con el agente de codigo `opencode`.
- Razonamiento matematico: la model card reporta 0,980 en GSM8K (n=100) para esta variante.
- Ejecucion local en Apple Silicon mediante el motor Kapitsa, con pagina de chat y API en `http://127.0.0.1:8000`.
- Soporte de decodificacion especulativa para acelerar la lectura de prompts largos.
- Tool calling, function calling y modo thinking: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente de codigo local: el autor documenta el arranque del agente `opencode` sobre este modelo con `kapitsa opencode --model nace-ai/Qwen3.8-27B-MLX-3bit`, lo que permite autocompletado, refactorizacion y explicacion de codigo sin salir del portatil.
- Chat privado en el dispositivo: la pagina de chat y la API local de Kapitsa permiten atender conversaciones multi-turno sin enviar datos a la nube, adecuado para entornos con requisitos de confidencialidad.
- Procesamiento de documentos con imagenes: al ser un modelo `image-text-to-text`, puede recibir capturas, diagramas o paginas escaneadas junto con instrucciones de texto para extraer o resumir contenido.
- Prototipado de agentes en Mac: la API local en el puerto 8000 permite conectar frameworks de agentes sin depender de proveedores externos, con una latencia de escritura de 62,6 tok/s en M5 Pro.
- Evaluacion de modelos multimodales en hardware de consumo: util para investigadores que necesitan probar un modelo de ~27B en un unico MacBook Pro de 48 GB con 14,6 GiB de pico de memoria.
- Razonamiento aritmetico y tareas de matematicas aplicadas: el resultado de 0,980 en GSM8K sugiere un comportamiento solido en problemas de varios pasos, adecuado para tutoria o verificacion de calculos.
- Despliegue en pipelines de generacion de codigo con contexto largo: la lectura de prompts de 4K tokens a 431 tok/s (685 tok/s en builds nuevos) reduce el coste de prefill en tareas con mucho contexto de repositorio.

## Benchmarks y rendimiento

| Test | Esta variante (3-bit MLX) | Referencia bf16 | Veredicto |
|---|---:|---:|---|
| GSM8K (100 preguntas) | 0,980 (n=100) | 0,940 (n=100) | Coincide |

| Metrica de velocidad | Valor |
|---|---:|
| Escritura (respuesta de codigo de 512 tokens, temp. 0,6) | 62,6 tok/s |
| Lectura de prompt de ~4K tokens (frio) | 431 tok/s |
| Lectura de prompt de ~4K tokens (Kapitsa ≥ v0.2.34) | 685 tok/s |
| Memoria de pico | 14,6 GiB |
| Mac medido | MacBook Pro M5 Pro, 48 GB |

No se han publicado resultados de MMLU, HumanEval ni otros benchmarks en la informacion disponible.

## Requisitos de hardware

- Memoria de pico medida: 14,6 GiB con la variante de 3 bits en Kapitsa.
- Mac minimo medido: MacBook Pro con M5 Pro y 48 GB de memoria unificada.
- Descarga del repositorio: 12,9 GB.
- No se dispone de datos de VRAM para GPU dedicadas (NVIDIA, AMD); el formato MLX esta pensado para Apple Silicon.
- Opciones de despliegue: motor Kapitsa (`brew install nace-ai/tap/kapitsa`), con pagina de chat y API local en `http://127.0.0.1:8000`.
- Variantes alternativas para otros entornos: GGUF q2_k (10,9 GB), q3_k_m (13,5 GB), q4_k_m (16,8 GB), q8_0 (29,1 GB) y NVFP4 (20,6 GB) en repos hermanos.
- Latencia y throughput: 62,6 tok/s de escritura y 431 tok/s de lectura de prompt de 4K tokens en M5 Pro de 48 GB; 685 tok/s de lectura en builds posteriores.
- No se dispone de datos de latencia en GPU dedicadas ni en otros chips Apple distintos del M5 Pro.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| Qwen3.8-27B-MLX-3bit (este) | 27,36B | no disponible | MLX 3-bit | Apache 2.0 | Hugging Face, motor Kapitsa |
| Qwen3.8-27B-MLX-4bit | 27,36B (base) | no disponible | MLX 4-bit | Apache 2.0 | Hugging Face |
| Qwen3.8-27B-MLX-8bit | 27,36B (base) | no disponible | MLX 8-bit | Apache 2.0 | Hugging Face |
| Qwen3.8-27B-GGUF (q4_k_m) | 27,36B (base) | no disponible | GGUF 4,85-bit | Apache 2.0 | Hugging Face |
| Qwen3.8-27B-NVFP4 | 27,36B (base) | no disponible | NVFP4 4-bit | Apache 2.0 | Hugging Face |

La comparativa con modelos de otros desarrolladores (Llama, Mistral, Gemma u otros) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion a 3 bits puede degradar la calidad respecto al modelo bf16 en tareas distintas de GSM8K; la model card solo reporta ese benchmark.
- El modelo esta empaquetado en formato MLX y depende del motor Kapitsa; no es directamente compatible con vLLM, TGI o llama.cpp sin convertir a otro formato (existen variantes GGUF en repos hermanos).
- El Mac minimo medido es un M5 Pro de 48 GB; no se han publicado mediciones en chips anteriores (M1, M2, M3, M4) ni en configuraciones de 32 GB o menos.
- La licencia Apache 2.0 permite uso comercial, pero el autor de la cuantizacion no ofrece garantias adicionales sobre el modelo base.
- No se dispone de informacion sobre sesgos, tasas de alucinacion, idiomas soportados ni longitud de contexto, por lo que no se pueden evaluar esos riesgos con los datos publicados.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica una validacion comunitaria practicamente nula.
- El modelo base Qwen3.8-27B no esta descrito en detalle en la informacion disponible; cualquier evaluacion de capacidades mas alla de GSM8K debe hacerse empiricamente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nace-ai/Qwen3.8-27B-MLX-3bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Variante 4-bit: https://huggingface.co/nace-ai/Qwen3.8-27B-MLX-4bit
- Variante 8-bit: https://huggingface.co/nace-ai/Qwen3.8-27B-MLX-8bit
- Variantes GGUF: https://huggingface.co/nace-ai/Qwen3.8-27B-GGUF
- Variante NVFP4: https://huggingface.co/nace-ai/Qwen3.8-27B-NVFP4
- Motor Kapitsa (GitHub): https://github.com/nace-ai/kapitsa
- Sitio de Nace.AI: https://www.nace.ai/

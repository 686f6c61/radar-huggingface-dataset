# agentionai/DeepSeek-V4.1-Flash-Skeleton-GGUF

## Resumen

DeepSeek-V4.1-Flash Skeleton GGUF es un artefacto tecnico publicado por AgentionAI que reproduce la arquitectura exacta del modelo DeepSeek-V4.1-Flash-1017 (metadatos, tokenizer, nombres de tensores, formas y tipos) pero **sin los pesos reales**. No es un modelo funcional: es un esqueleto pensado para desarrolladores de runtimes, conversores y cuantizadores que necesitan probar el *plumbing* de DeepSeek-V4.1 sin descargar los 510 GB del modelo original.

El repositorio incluye dos artefactos: un GGUF pequeno (`DS41-small.gguf`, 20,4 GB) con 6 capas y 128 expertos enrutados que cubre todos los tipos de capa de atencion del modelo real, y un script (`make_skeleton.py`) que construye localmente un esqueleto completo de 40 capas y 384 expertos (508,4 GB teoricos, ~6 MB en disco gracias a ficheros sparse). Los pesos son aleatorios (en el pequeno) o cero (en el completo), por lo que el modelo no genera respuestas utiles.

Su relevancia es puramente de ingenieria: permite validar cargadores, planificacion de memoria, conversores y cuantizadores contra la topologia de DeepSeek-V4.1 antes de disponer de los pesos reales o de infraestructura suficiente. La licencia MIT facilita su uso como fixture de CI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atencion comprimida y tablas Engram (n-gram); topologia de DeepSeek-V4.1-Flash-1017 |
| Parametros totales | 30.441.106.884 (dato del safetensors del modelo base); el esqueleto completo declara 508,4 GB de tensores |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (expertos enrutados), MXFP8 (tabla Engram), BF16, F32; GGUF |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors como referencia del modelo base) |

## Arquitectura y entrenamiento

El esqueleto replica la arquitectura de DeepSeek-V4.1-Flash-1017: un transformer con mezcla de expertos (MoE), atencion con ratios de compresion variables (0, 2 y 1) y capas con fuentes KV e indice separadas, ademas de tablas Engram de n-gramas. El esqueleto completo consta de 40 capas y 384 expertos enrutados; el pequeno reduce a 6 capas y 128 expertos, manteniendo todos los tipos de capa de atencion y colocando Engram en las capas 1 y 3 con vocabulario truncado a ~1,2M filas por tabla. No incluye tensores MTP ni de vision.

No hubo entrenamiento: los pesos del esqueleto pequeno son aleatorios con escalas ~1/sqrt(fan_in) para evitar degeneracion numerica, y los del esqueleto completo son todos cero (incluidos norms y router, lo que hace el enrutamiento degenerado). El script `make_skeleton.py` lee las cabeceras reales de tensores del repositorio oficial mediante peticiones HTTP range y escribe shards falsos con regiones de datos huecas. Como las escalas FP8 a cero fallan la comprobacion de rango del conversor, se escriben 1.0 (0x7F) en las regiones de escala lineal FP8 (7,2 MB de bytes reales).

## Capacidades

- No genera texto coherente: los pesos aleatorios o nulos producen salida sin sentido.
- Sirve como fixture para probar cargadores GGUF, planificacion de memoria y grafos de computo de DeepSeek-V4.1.
- Permite validar conversores y cuantizadores contra la topologia real (nombres, formas, tipos de tensor).
- Util para tests de velocidad: multiplicar pesos cero cuesta lo mismo que multiplicar pesos reales.
- Compatible con `llama-cli` una vez aplicado el PR de soporte a DeepSeek-V4.1 en llama.cpp.
- No soporta tool calling, agentes, vision ni capacidades multilingues reales.

## Casos de uso

- **Desarrollo de runtimes de inferencia**: cargar `DS41-small.gguf` en un runtime en construccion para verificar que el parser de metadatos, el tokenizer y el grafo de atencion comprimida se comportan como se espera, sin necesidad de los 510 GB del modelo real.
- **Planificacion de memoria**: usar el esqueleto completo para medir el pico de memoria y el comportamiento de mmap en un grafo de 40 capas; el autor reporta 2 tokens en CPU bajo un limite de 12 GB con mmap.
- **Pruebas de conversores**: validar que un conversor de safetensors a GGUF maneja correctamente los tipos MXFP4, MXFP8, BF16 y F32 y las regiones de escala FP8, usando el esqueleto como entrada controlada.
- **Fixtures de CI**: integrar `DS41-small.gguf` en pipelines de integracion continua para detectar regresiones en cargadores y cuantizadores sin coste de almacenamiento.
- **Benchmarks de throughput**: medir velocidad de multiplicacion y planificacion de kernels con pesos cero, ya que el coste computacional es identico al de pesos reales.
- **Pruebas de cuantizacion**: ejecutar un cuantizador sobre el esqueleto para comprobar el manejo de tensores con escalas nulas y regiones huecas antes de aplicarlo al modelo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- `DS41-small.gguf` ocupa 20,4 GB en disco; puede cargarse en CPU con `-ngl 0` y contexto reducido (512 tokens en el ejemplo del autor).
- El esqueleto completo requiere ~508,4 GB de espacio logico pero solo ~6 MB en disco gracias a ficheros sparse; el autor lo ejecuto en CPU con mmap bajo un limite de 12 GB de memoria.
- GPU recomendadas: no disponible; el artefacto esta pensado para pruebas en CPU.
- Cabe en GPU de consumo solo el esqueleto pequeno, y aun asi con cuantizacion o descarga parcial; no se proporcionan cifras de VRAM.
- Despliegue: `llama-cli` de llama.cpp con el PR ggml-org/llama.cpp#30817 aplicado; no se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles; el autor solo indica que el esqueleto completo genero 2 tokens en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash Skeleton GGUF | 30,4B (base); esqueleto 508,4 GB de tensores | no disponible | Fixture de runtime/conversor | MIT | Hugging Face |
| DeepSeek-V4.1-Flash-1017 | no disponible | no disponible | Modelo real | no disponible | Hugging Face (referencia) |
| Otros GGUF de prueba de la comunidad | no disponible | no disponible | Fixtures de CI | variable | Hugging Face |

No se dispone de datos de benchmarks ni de comparativas de rendimiento con alternativas.

## Limitaciones y advertencias

- **No es un modelo funcional**: los pesos son aleatorios o cero; cualquier salida es ruido y no debe usarse para evaluar calidad, perplejidad o KLD.
- El esqueleto completo tiene enrutamiento degenerado porque el router y los norms son cero.
- No incluye tensores MTP ni de vision.
- Requiere el PR abierto ggml-org/llama.cpp#30817; sin el, no carga en llama.cpp upstream.
- El conversor elimina la plantilla de chat a proposito; hay que usar `-st` en `llama-cli`.
- Licencia MIT, igual que el modelo fuente; no se incluyen pesos del modelo original.
- No apto para produccion, atencion al cliente, generacion de codigo ni ninguna tarea de inferencia real.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/agentionai/DeepSeek-V4.1-Flash-Skeleton-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- PR de soporte en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/30817
- Apoyo al autor: https://buymeacoffee.com/agentionai

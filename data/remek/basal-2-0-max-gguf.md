# Remek/basal-2.0-max-GGUF

## Resumen

basal-2.0-max-GGUF es la distribucion en formato GGUF del modelo basal-2.0-max, un modelo de decision de 11.167.748.096 parametros construido sobre speakleash/Bielik-PL-11B-v3.0-Instruct. Lo desarrolla Remek y su proposito no es la generacion de texto libre, sino la toma de decisiones tipadas (typed decisions): elegir entre opciones, responder si/no y emitir puntuaciones calibradas a partir de las log-probabilidades de los codigos de opcion. El modelo se sirve a traves de un motor propio, basal-serve (version 2.5.0), que renderiza el prompt especifico del modelo y lee las probabilidades del backend.

Esta carpeta concreta incluye dos cuantizaciones, Q8_0 (12 GB, recomendada) y Q5_K_M (7.5 GB), junto con Modelfiles para Ollama, el fichero basal.json y los ficheros de calibracion por motor (CALIBRATION.json, CALIBRATION.llamacpp.json). El modelo base Bielik-PL-11B-v3.0-Instruct aporta el conocimiento linguistico en polaco e ingles, mientras que el ajuste posterior convierte al modelo en un clasificador calibrado con una API estable de decisiones.

La relevancia actual del modelo reside en su enfoque: en lugar de pedir al LLM que genere una respuesta y parsearla, expone directamente la distribucion de probabilidad sobre opciones discretas, lo que permite medir calibracion (ECE) y acuerdo con la version bf16. La licencia es Apache 2.0 y el repo ocupa 39.7 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Bielik-PL-11B-v3.0-Instruct); no se detalla en la informacion disponible |
| Parametros totales | 11.167.748.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens en modo Ollama (basal-serve envia num_ctx 4096); configurable hasta 32.768 con llama-server -c 32768 o --mode gguf |
| Tipos de cuantizacion | Q8_0 y Q5_K_M (GGUF); existen tambien FP8 y MLX 8-bit en otras carpetas del mismo autor |
| Idiomas soportados | pl, en |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (basal-2.0-max-Q8_0.gguf, basal-2.0-max-Q5_K_M.gguf); variantes -decision.gguf con metadatos de decision para LM Studio |

## Arquitectura y entrenamiento

El modelo parte de speakleash/Bielik-PL-11B-v3.0-Instruct, un transformer decoder-only de 11B parametros orientado a polaco e ingles. Sobre esa base, el autor aplica un ajuste orientado a decisiones tipadas: el modelo aprende a emitir codigos de opcion cuyo log-probability se interpreta como la probabilidad de cada eleccion. El motor basal-serve renderiza el prompt propio del modelo y extrae esas log-probabilidades del backend (Ollama o llama.cpp) para producir la decision final, no texto libre.

No se dispone en la informacion proporcionada del numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon RLHF o DPO. Si se documenta el proceso de calibracion: el fichero CALIBRATION.json corresponde al ajuste del modelo bf16 y es el valor por defecto para cualquier modo sin ajuste propio; los modos ollama y llamacpp cargan CALIBRATION.<engine>.json cuando existe en la carpeta. La validacion de los ports se hace contra el modelo bf16 sobre el conjunto de desarrollo dev v2 (1.700 decisiones en las filas MLX), midiendo acuerdo en decisiones con 2-10 opciones, acuerdo con margen >= 0.2, diferencia de exactitud y diferencia de ECE.

## Capacidades

- Toma de decisiones tipadas: eleccion entre opciones (hasta 26 en LM Studio; mas de 20 opciones requiere llama.cpp porque Ollama devuelve como maximo 20 log-probabilities por posicion).
- Decisiones si/no y emision de puntuaciones calibradas.
- Clasificacion con calibracion medida (ECE) frente a la version bf16.
- Generacion de texto conversacional heredada del modelo base Bielik-PL-11B-v3.0-Instruct.
- Soporte multilingue en polaco e ingles.
- Integracion con motores de inferencia locales: Ollama (0.12.11 o superior), llama.cpp (llama-server) y llama-cpp-python en proceso (--mode gguf).
- Exportacion de metadatos de decision a ficheros GGUF propios mediante basal-export-gguf, sin tocar los tensores.
- Servicio concurrente de clientes con --http-parallel N (junto a OLLAMA_NUM_PARALLEL o llama-server -np).
- El mismo motor basal v2.5.0 sirve tambien los modelos experimentales basal-omni-1.0 (imagenes y audio), aunque esta carpeta concreta es solo texto.

## Casos de uso

- Clasificacion de tickets de soporte en categorias discretas: el modelo devuelve la opcion con mayor probabilidad y una puntuacion calibrada, lo que permite enrutar automaticamente y marcar casos de baja confianza para revision humana. La calibracion (ECE) hace que el umbral de confianza sea interpretable.
- Moderacion de contenido con decisiones si/no: cada mensaje se evalua contra politicas discretas y se obtiene una probabilidad calibrada, util para fijar umbrales operativos sin reentrenar.
- Enrutamiento de consultas en un pipeline RAG: dado un conjunto de hasta 20-26 opciones (dominios o intenciones), el modelo elige la ruta con log-probabilidades en lugar de generar texto que luego haya que parsear.
- Triaje de documentos en polaco: aprovecha el conocimiento del modelo base Bielik-PL-11B-v3.0-Instruct para clasificar textos en polaco con contexto de hasta 4.096 tokens en Ollama o hasta 32.768 con llama-server -c 32768.
- Despliegue en escritorio o portatil sin GPU de servidor: la cuantizacion Q5_K_M (7.5 GB) permite ejecutar el modelo en equipos consumer, con la advertencia de que GGUF es la ruta lenta para lotes y esta pensada para desktops y laptops, no para servidores.
- Evaluacion de decisiones en LM Studio: los ficheros -decision.gguf exponen el modelo como decision model en /v1/systemone y /v1/decisions con eleccion, si/no y puntuacion, integrable en flujos de trabajo de escritorio.
- Analisis de encuestas o formularios con opciones fijas: el modelo asigna probabilidades a cada opcion, lo que permite analizar respuestas ambiguas en lugar de forzar una etiqueta unica.

## Benchmarks y rendimiento

La model card no presenta benchmarks clasicos (MMLU, HumanEval, GSM8K). Lo que publica son comprobaciones de la capa de decision de cada port frente al modelo bf16 sobre dev v2:

| Paquete | Acuerdo con bf16 (opciones 2-10) | Acuerdo con margen >= 0.2 | Diferencia de exactitud | Diferencia de ECE | Tamano | Velocidad | Veredicto |
|---|---|---|---|---|---|---|---|
| FP8 | 0.9704 | 0.9948 | +0.0005 | -0.0010 | 12 GB | 19.9 dec/s c16, c1 p50 50 ms (H100) | PASS |
| GGUF Q8_0 | 0.9925 | 0.9997 | +0.0002 | +0.0018 | 12 GB | no medida en esta release | PASS |
| GGUF Q5_K_M | 0.9766 | 0.9970 | -0.0001 | +0.0032 | 7.5 GB | no medida en esta release | PASS |
| MLX 8-bit | 0.9933 | 0.9990 | +0.0017 | +0.0053 | 12 GB | 622 ms c1 p50, 1506 ms para 5 preguntas (Mac) | PASS |

Los umbrales de este nivel son: acuerdo 2-10 >= 0.9552, acuerdo con margen de referencia >= 0.2 >= 0.9893, exactitud dentro de 1 punto del bf16 y ECE como maximo +0.01. La model card aclara que estas cifras son comprobaciones de la capa de decision, no nuevos benchmarks; los resultados propios del modelo estan en la ficha de basal-2.0-max.

## Requisitos de hardware

- VRAM estimada: 12 GB para Q8_0 y 7.5 GB para Q5_K_M.
- En Apple Silicon, los ficheros max GGUF no se probaron en Mac; en un Apple M4 Pro de 24 GB, Ollama y llama-server se quedaron sin memoria Metal mientras corria otro proceso de GPU de unos 5 GB.
- GPU de servidor: la referencia de rendimiento publicada para el port FP8 es una H100 (19.9 dec/s con concurrencia 16, latencia p50 de 50 ms con concurrencia 1), lo que da una idea del orden de magnitud esperado en hardware de datacenter.
- GPU consumer: Q5_K_M (7.5 GB) es la opcion practica para GPUs consumer con 8-12 GB de VRAM; Q8_0 requiere 12 GB o mas.
- Opciones de despliegue: Ollama 0.12.11 o superior (via Modelfile.Q8_0 o Modelfile.Q5_K_M), llama-server de llama.cpp, llama-cpp-python en proceso (--mode gguf con basal[gguf]) y LM Studio 0.4.26 o superior en canal beta (motor llama.cpp 2.65.1 o superior, no el motor MLX) para los ficheros -decision.gguf.
- Latencia y throughput: no medidos para los ficheros GGUF en esta release. La model card advierte que GGUF es la ruta lenta para lotes y esta pensada para desktops y laptops, no para servidores.
- Contexto en Ollama: basal-serve envia num_ctx 4096, que sobrescribe el Modelfile; los estados mas largos se recortan por el medio y se marcan con usage.truncated.
- LM Studio corta las peticiones a los 30 s, por lo que documentos muy largos deben dividirse.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| basal-2.0-max-GGUF | 11.167.748.096 | 4.096 en Ollama; hasta 32.768 con llama-server | Decisiones tipadas calibradas sobre Bielik-PL-11B-v3.0-Instruct | Apache 2.0 | GGUF (Q8_0, Q5_K_M) |
| basal-2.0-max-FP8 | 11.167.748.096 | no disponible | Mismo modelo en FP8 | Apache 2.0 | FP8, 12 GB |
| basal-2.0-max-MLX-8bit | 11.167.748.096 | no disponible | Mismo modelo en MLX 8-bit para Mac | Apache 2.0 | MLX, 12 GB |
| speakleash/Bielik-PL-11B-v3.0-Instruct | 11B | no disponible | Modelo base instructivo en polaco e ingles, generacion de texto libre | no disponible en la informacion proporcionada | safetensors (modelo base) |

No se dispone en la informacion proporcionada de comparaciones con modelos de decision de otros autores ni de datos de rendimiento frente a alternativas fuera de la familia basal.

## Limitaciones y advertencias

- El modelo no esta pensado para generacion de texto libre: un ollama run simple devuelve solo texto; las respuestas tipadas requieren basal-serve delante del backend.
- Ollama devuelve como maximo 20 log-probabilities por posicion, por lo que las preguntas con mas de 20 opciones necesitan llama.cpp.
- En modo Ollama el contexto efectivo es de 4.096 tokens y los estados mas largos se recortan por el centro (usage.truncated); para documentos largos hay que usar llama-server -c 32768 o --mode gguf.
- La calibracion por defecto es la del modelo bf16 (CALIBRATION.json); usar el ajuste del motor correcto (CALIBRATION.llamacpp.json) es responsabilidad del operador en el modo gguf.
- Los ficheros max GGUF no se verificaron en Mac; en un M4 Pro de 24 GB con otro proceso de GPU de ~5 GB se agoto la memoria Metal.
- GGUF es la ruta lenta para lotes; no es adecuada para servir cargas de servidor de alta concurrencia.
- LM Studio termina las peticiones a los 30 s, lo que obliga a dividir documentos largos.
- No se documentan en la informacion disponible sesgos conocidos, tasas de alucinacion ni evaluaciones de seguridad del modelo.
- Aunque la licencia es Apache 2.0, el modelo base Bielik-PL-11B-v3.0-Instruct puede tener sus propias condiciones; conviene revisarlas antes de un uso comercial en produccion.
- El soporte linguistico se limita a polaco e ingles; el rendimiento en castellano no esta documentado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Remek/basal-2.0-max-GGUF
- Modelo original basal-2.0-max: https://huggingface.co/Remek/basal-2.0-max
- Version FP8: https://huggingface.co/Remek/basal-2.0-max-FP8
- Version MLX 8-bit: https://huggingface.co/Remek/basal-2.0-max-MLX-8bit
- Coleccion basal-2.0: https://huggingface.co/collections/Remek/basal-20-6acd1712a8e443c86cd576fc
- Repositorio del motor de inferencia: https://github.com/rkinas/basal
- Documentacion de imagenes y audio (basal-omni experimental): https://github.com/rkinas/basal#images-and-audio-basal-omni-experimental
- Sitio web del proyecto: https://basal.si5.pl/
- Modelo base: https://huggingface.co/speakleash/Bielik-PL-11B-v3.0-Instruct

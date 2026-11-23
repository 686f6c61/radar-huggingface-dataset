# sairaph-official/Spark-X2.6-1.7B-aa2e08e-int8

## Resumen

Spark-X2.6-1.7B es un modelo de lenguaje denso de 1,71 mil millones de parámetros desarrollado por el SparkLLM Team (XHToken) y publicado bajo licencia Apache 2.0. Se trata del segundo miembro de la serie Spark-X2.6, tras el Spark-X2.6-4B, y mantiene la arquitectura de la generación anterior (Spark-X2.5-1.7B) mientras mejora sus capacidades mediante un post-entrenamiento refinado. Es un modelo de razonamiento: genera una cadena de pensamiento dentro de etiquetas `<think>…</think>` antes de emitir la respuesta final.

El repositorio que nos ocupa, `sairaph-official/Spark-X2.6-1.7B-aa2e08e-int8`, es un espejo (mirror) no modificado de la conversión oficial a LiteRT-LM publicada por `litert-community`. Contiene un único artefacto `.litertlm` cuantizado a int8 (1.836 MB) pensado para inferencia en dispositivo (on-device) sobre GPU y CPU de móviles y equipos de sobremesa mediante el runtime LiteRT-LM de Google AI Edge. No incluye pesos en safetensors ni GGUF: el formato es específico de LiteRT-LM.

Su relevancia radica en que demuestra que un modelo de razonamiento de 1,7B puede ejecutarse a velocidades interactivas (25-27 tok/s en un Galaxy S26, más de 50 tok/s en un iPhone 18 Pro) manteniendo una precisión razonable en tareas de razonamiento corto (GSM8K 80 con la cuantización int8, frente a 84 del modelo bf16). Es, por tanto, una opción práctica para asistentes locales, aplicaciones móviles sin conexión y despliegues en el borde con requisitos estrictos de privacidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso con atención de ventana deslizante híbrida (3 capas SW de 512 por cada capa de atención completa), puertas sigmoideas por cabeza en la salida de atención, MLP con compuerta y GELU exacto |
| Parametros totales | 1,71 mil millones |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 131.072 entradas de vocabulario; longitud de contexto de entrenamiento no disponible en la información proporcionada |
| Tipos de cuantizacion | int8 dinámica por canal en todas las capas lineales y en el embedding (este repositorio); el repositorio upstream ofrece además una variante int4-mlp (int8 en atención, int4 blockwise-32 en proyecciones gate/up del MLP, int8 en down y capa de salida) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); sin safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo es un decoder transformer denso de 28 capas con tamaño oculto de 2048 y 8 cabezas de consulta frente a 2 cabezas de clave-valor de 256 dimensiones cada una. Emplea un esquema de atención híbrida en el que tres capas de ventana deslizante de 512 tokens se intercalan por cada capa de atención completa, lo que reduce el coste de memoria del KV-cache en secuencias largas. La salida de atención pasa por puertas sigmoideas por cabeza y los MLP son de tipo compuerta con GELU exacto. El vocabulario, de 131.072 entradas, está atado (tied) entre entrada y salida.

El post-entrenamiento es la principal fuente de mejora respecto a Spark-X2.5-1.7B, según la model card del modelo base; no se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron RLHF o DPO. El modelo incorpora un modo de razonamiento explícito: la plantilla de prompt abre el bloque de pensamiento como la plantilla de chat del proveedor y los ficheros declaran un canal `thought`, de modo que LiteRT-LM separa el razonamiento de la respuesta final. La conversión a LiteRT-LM se realizó con litert-torch 0.9.3 para LiteRT-LM 0.19.0, con activaciones fp32 en GPU y operadores compuestos para escrituras de KV-cache y productos de atención.

## Capacidades

- Generación de texto y razonamiento explícito en modo pensamiento (`<think>…</think>`), con separación del canal de razonamiento respecto a la respuesta.
- Aritmética básica y comparaciones numéricas: 8/8 en preguntas cortas con respuesta única en Mac y en móviles (Galaxy S26, Pixel 11 Pro, iPhone 18 Pro), tanto en GPU como en CPU.
- Razonamiento matemático de nivel escolar: GSM8K 80 con la cuantización int8 y 82 con la variante int4-mlp.
- Conversación multi-turno: supera una prueba de 3 turnos (plantar un hecho, operar aritméticamente y recordarlo) en GPU y CPU.
- Control de esfuerzo de razonamiento mediante `reasoning_effort` (valor `low` probado), que reduce la longitud del pensamiento a costa de cierta precisión (7/8 en int4-mlp frente a 8/8 en int8).
- Tokenizador compatible byte a byte con el `tokenizer.json` upstream: codifica correctamente 234 de 234 cadenas de prueba, incluidos tokens añadidos en mitad de cadena.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponibles.

## Casos de uso

- Asistentes locales en aplicaciones móviles sin conexión: el modelo cabe en 1,8 GB y decodifica a 25-27 tok/s en la GPU de un Galaxy S26 y a más de 51 tok/s en un iPhone 18 Pro, lo que permite integrarlo en apps Android e iOS con LiteRT-LM sin depender de la nube.
- Tutor de matemáticas y aritmética para educación primaria y secundaria: el modo de razonamiento explícito permite mostrar el paso a paso al estudiante y la precisión en GSM8K (80-82) es suficiente para problemas de nivel escolar.
- Procesamiento de datos sensibles en el dispositivo: al ejecutarse íntegramente en local, es adecuado para aplicaciones sanitarias, legales o financieras donde no se permite enviar texto a servidores externos.
- Chatbots multi-turno embebidos en dispositivos de gama alta: la prueba de 3 turnos con recuperación de hechos y el KV-cache reducido por la atención de ventana deslizante permiten conversaciones fluidas en memoria limitada.
- Filtrado y clasificación de texto en el borde: tareas de respuesta corta con una única solución correcta (traducción, definiciones, comparaciones) que el modelo resuelve con 8/8 de acierto en las pruebas del autor.
- Prototipado de agentes de razonamiento en entornos con GPU de escritorio: en un Mac, la variante int8 alcanza 151,5 tok/s en GPU, suficiente para iterar sobre pipelines de razonamiento antes de desplegar en móvil.
- Evaluación comparativa de runtimes de inferencia en el borde: sirve como referencia para medir latencia y precisión entre LiteRT-LM, versiones de runtime y plataformas (Android, iOS, macOS).

## Benchmarks y rendimiento

Los datos publicados por el autor se limitan a GSM8K y a pruebas de corrección cualitativas; no hay resultados de MMLU, HumanEval ni otros benchmarks estándar en la información disponible.

| Metrica | int8 (este repo) | int4-mlp (upstream) | bf16 (referencia) |
|---|---|---|---|
| GSM8K | 80 | 82 | 84 |
| Preguntas cortas (8, respuesta unica) | 8/8 | 8/8 | no disponible |
| Preguntas cortas con `reasoning_effort=low` | 8/8 | 7/8 | no disponible |
| Decodificacion en Galaxy S26 GPU (tok/s) | 25,8 | 27,4 | no disponible |
| Decodificacion en iPhone 18 Pro GPU (tok/s) | 51,5 | 51,4 | no disponible |
| Decodificacion en Mac GPU (tok/s) | 151,5 | 147,0 | no disponible |
| Tamano del fichero | 1.836 MB | 1.706 MB | no disponible |

Las mediciones de velocidad se realizaron con 1.024 tokens de prefill y 256 tokens generados (2026-10-31), con LiteRT-LM 0.19.0 y, en iOS, con la build nocturna 0.19.0-20261029.

## Requisitos de hardware

- VRAM/RAM estimada: aproximadamente 1,8 GB para el fichero int8 y 1,7 GB para el int4-mlp, más el espacio del KV-cache y de las activaciones en fp32.
- GPU recomendadas: GPU integradas de móviles de gama alta (Adreno de Galaxy S26, GPU de Pixel 11 Pro, GPU de iPhone 18 Pro) y GPU de escritorio Apple Silicon en Mac. No se especifican requisitos para A100, H100 ni RTX 4090, ya que el modelo está orientado a dispositivo.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 2 GB de memoria libre; el objetivo principal son GPU móviles.
- Opciones de despliegue: LiteRT-LM (CLI `litert-lm`, API Python, wheel de Android en PyPI, build iOS). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: 25,8 tok/s (int8) y 27,4 tok/s (int4-mlp) en Galaxy S26 GPU; 51,5 y 51,4 tok/s en iPhone 18 Pro GPU; 151,5 y 147,0 tok/s en Mac GPU. En CPU de Mac el rendimiento es inferior y se han observado problemas de formato en una de las pruebas de forma libre.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| Spark-X2.6-1.7B (int8, este repo) | 1,71B | no disponible | 80 | Apache 2.0 | LiteRT-LM, on-device |
| Spark-X2.6-1.7B (int4-mlp, upstream) | 1,71B | no disponible | 82 | Apache 2.0 | LiteRT-LM, on-device |
| Spark-X2.6-1.7B (bf16, base) | 1,71B | no disponible | 84 | Apache 2.0 | safetensors (no confirmado) |
| Spark-X2.6-4B | 4B (aproximado) | no disponible | no disponible | Apache 2.0 | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de otros modelos de la misma categoría (por ejemplo, alternativas on-device de 1-2B) en la información proporcionada, por lo que la comparativa se limita a las variantes del propio Spark-X2.6.

## Limitaciones y advertencias

- Es un espejo no modificado: el repositorio no aporta mejoras ni correcciones sobre el original `litert-community/Spark-X2.6-1.7B`; cualquier problema del upstream se reproduce aquí.
- Solo se distribuye el fichero int8; la variante int4-mlp, recomendada por el autor para móviles, no está incluida en este repositorio.
- En CPU, una de las dos pruebas de forma libre terminó la respuesta con un `</think>` literal y repitió el texto, según los problemas conocidos del runtime documentados por el autor.
- Con `reasoning_effort=low`, la variante int4-mlp falló 1 de 8 preguntas (respondió "purple" a una pregunta sobre rimas), lo que indica menor robustez en modo de razonamiento reducido.
- No hay información sobre sesgos, idiomas soportados ni riesgos de alucinación específicos del modelo; al ser un modelo de 1,7B, es esperable una tasa de alucinación superior a la de modelos mayores, aunque no se cuantifica.
- La licencia Apache 2.0 permite uso comercial, pero el espejo no incluye avisos adicionales más allá de la copia literal de `LICENSE` del upstream.
- El formato `.litertlm` limita el despliegue al ecosistema LiteRT-LM; no es portable a otros runtimes sin reconversión.
- La longitud de contexto efectiva de entrenamiento no está documentada, pese a que el vocabulario tiene 131.072 entradas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sairaph-official/Spark-X2.6-1.7B-aa2e08e-int8
- Repositorio upstream LiteRT-LM: https://huggingface.co/litert-community/Spark-X2.6-1.7B
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-1.7B
- Repositorio LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
- Licencia Apache 2.0: https://huggingface.co/XHToken/Spark-X2.6-1.7B/blob/main/LICENSE

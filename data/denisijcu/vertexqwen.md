# Denisijcu/vertexqwen

## Resumen

Vertex-Qwen Chess es un ajuste fino por QLoRA del modelo Qwen2.5-3B-Instruct, publicado por Denisijcu (Vertex Coders LLC, Miami) bajo el identificador `Denisijcu/vertexqwen`. El modelo se presenta como un agente de razonamiento táctico de ajedrez: interpreta estados de tablero en notación FEN, evalúa jugadas legales en SAN/UCI y genera líneas tácticas. No es un motor de búsqueda al uso (no incorpora alfa-beta ni tabla de transposición), sino un modelo de lenguaje especializado en un dominio cerrado y con reglas formales verificables.

Técnicamente es un transformer denso de 3.085.938.688 parámetros (3,09 B), la arquitectura del Qwen2.5-3B-Instruct con atención de consultas agrupadas (GQA) y ventana de contexto de 32.768 tokens heredada del modelo base. El entrenamiento se realizó con Unsloth QLoRA (rango LoRA 8, precisión FP16) sobre el dataset propietario *Grandmaster Blend* de 5.000 posiciones, durante 1 época y solo 150 pasos en una GTX 1660 Ti de 6 GB de VRAM.

Su interés práctico es doble: por un lado, demuestra una receta reproducible de especialización de un modelo de 3 B en hardware de consumo; por otro, sirve como caso de estudio de los límites del ajuste fino de bajo coste, ya que con 150 pasos y 5.000 ejemplos no hay garantía de precisión táctica sostenida ni de generalización fuera del estilo del dataset. La model card no publica resultados de benchmarks ni Elo estimado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2.5), atención GQA, decoder-only |
| Parámetros totales | 3.085.938.688 (3,09 B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredado de Qwen2.5-3B-Instruct; no se especifica en la model card del ajuste) |
| Tipos de cuantización | Repo etiquetado como `gguf`; el autor documenta entrenamiento en FP16. Niveles concretos de cuantización (Q4_K_M, Q8_0, etc.): no disponible |
| Idiomas soportados | Inglés (`en`); el modelo base es multilingüe, pero el ajuste declara solo inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (metadatos de parámetros) y GGUF (etiqueta del repo); el desglose exacto de archivos no se detalla |
| Modelo base | Qwen/Qwen2.5-3B-Instruct |
| Desarrollador | Vertex Coders LLC (Denis Sanchez Leyva), Miami, FL |
| Método de ajuste | Unsloth QLoRA, r=8, FP16, 1 época, 150 pasos, batch efectivo 8 |
| Dataset | *Grandmaster Blend* (5.000 posiciones y secuencias tácticas) |
| Tamaño del repositorio | 1,9 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-3B-Instruct, un transformer decoder-only de 3,09 B parámetros con atención de consultas agrupadas (GQA) y RoPE, sin mezcla de expertos. Sobre esa base se aplicó un ajuste supervisado con QLoRA mediante Unsloth: adaptadores de rango 8 entrenados en FP16 sobre una única GPU de consumo (NVIDIA GTX 1660 Ti, 6 GB de VRAM). La model card indica 1 época, 150 pasos totales, batch por dispositivo 1 con acumulación de gradiente 8 (batch efectivo 8). No se documenta uso de RLHF, DPO ni preferencias; tampoco se detalla la composición exacta del dataset más allá de las 5.000 posiciones de élite y sus secuencias tácticas.

La innovación aquí no es arquitectónica, sino de dominio: el modelo se entrena para mapear FEN a jugadas legales en SAN/UCI, una tarea con espacio de salida restringido y verificable por software. Esa verificabilidad es la que hace viable un modelo de 3 B en un dominio donde un LLM general fallaría por alucinación de jugadas ilegales, siempre que se acompañe de un validador externo de legalidad. No hay decodificación especulativa, atención lineal ni modificaciones al mecanismo de atención.

## Capacidades

- Interpretación de estados de tablero en notación FEN.
- Generación de jugadas en notación algebraica (SAN) y de coordenadas (UCI).
- Razonamiento táctico de corto alcance: detección de capturas, horquillas y secuencias dentro del *Grandmaster Blend*.
- Aperturas y cálculo estructural de medio juego, según la model card.
- Conversación multi-turno (etiqueta `conversational`), heredada del formato instruct del modelo base.
- Compatibilidad con endpoints (`endpoints_compatible`), es decir, pensado para servirse tras una API HTTP.
- Integración prevista en la plataforma Vertex Chess Arena vía FastAPI o Ollama.
- Capacidades no confirmadas: tool calling, function calling, modo thinking explícito, visión, audio, matemáticas o generación de código. No se documentan.

## Casos de uso

- Motor táctico local en Ollama: el autor indica explícitamente este despliegue; con 1,9 GB de pesos cuantizados se puede ejecutar en un portátil sin GPU dedicada y responder a consultas FEN-jugada sin salir del equipo.
- Árbitro de jugadas en Vertex Chess Arena: el modelo actúa como componente de decisión dentro de un *inference arbiter* FastAPI, con validación de legalidad delegada a una librería de ajedrez (python-chess) para descartar salidas inválidas.
- Anotación asistida de posiciones: dado un FEN, generar una descripción de la amenaza principal y la jugada candidata, útil para preetiquetar datasets de ajedrez antes de revisión humana.
- Docencia y análisis en clubes: explicación en inglés de líneas tácticas y motivos posicionales en partidas de nivel intermedio, con la ventaja de correr en hardware barato.
- Base para nuevos ajustes QLoRA: la receta (r=8, 150 pasos, 6 GB de VRAM) es replicable como punto de partida para especializar Qwen2.5-3B en otros dominios de reglas cerradas.
- Evaluación comparativa de modelos pequeños en dominios formales: sirve como referencia de hasta dónde llega un ajuste de 5.000 ejemplos frente a un motor clásico o a un LLM mayor sin ajustar.
- Prototipado de agentes de razonamiento multi-paso con validación externa: el patrón (modelo que propone, validador que filtra) se puede trasladar a planificación de tareas con restricciones duras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K, precisión táctica (p. ej. porcentaje de jugadas legales o *puzzle accuracy*), ni estimación de Elo. Tampoco hay métricas de latencia o throughput.

## Requisitos de hardware

- Pesos en FP16: aproximadamente 6,2 GB solo para parámetros; con caché KV y overhead del runtime, entre 8 y 10 GB de VRAM para contexto moderado.
- Cuantización de 8 bits: en torno a 3,5 GB de pesos.
- Cuantización de 4 bits tipo GGUF (coherente con el tamaño de repo de 1,9 GB): alrededor de 1,9-2,2 GB, ejecutable en GPUs de 4 GB o incluso en CPU.
- GPU de referencia del autor: NVIDIA GTX 1660 Ti de 6 GB, usada para el entrenamiento QLoRA; suficiente para inferencia en FP16 con contexto corto.
- Consumer GPU compatibles: RTX 3060 12 GB, RTX 4060 8 GB, RTX 4070, GTX 1660 Ti/Super, además de Apple Silicon vía Metal en llama.cpp. No requiere A100 ni H100.
- Despliegue: Ollama (recomendado por el autor), llama.cpp para GGUF, transformers + FastAPI para el modo FP16 descrito en la model card, y vLLM o TGI si se sirve en FP16 con concurrencia.
- Latencia y throughput: no disponible. Como referencia cualitativa, un modelo denso de 3 B en 4 bits sobre GPU de consumo se sitúa típicamente por encima de las decenas de tokens por segundo, pero no hay medición publicada para este ajuste.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Benchmarks publicados |
|---|---|---|---|---|---|
| Denisijcu/vertexqwen | 3,09 B | 32.768 (heredado) | Ajedrez táctico (QLoRA sobre 5.000 posiciones) | Apache 2.0 | No disponible |
| Qwen/Qwen2.5-3B-Instruct | 3,09 B | 32.768 | Generalista, instrucciones, multilingüe | Apache 2.0 | Sí (MMLU, GSM8K, HumanEval en su model card) |
| meta-llama/Llama-3.2-3B-Instruct | 3,21 B | 128.000 | Generalista, instrucciones | Llama 3.2 Community License | Sí |
| microsoft/Phi-3.5-mini-instruct | 3,8 B | 128.000 | Generalista, razonamiento y código | MIT | Sí |

Nota: los datos de las tres alternativas provienen de la documentación pública de sus respectivas model cards y no se han verificado en esta ficha. La diferencia relevante es que vertexqwen es el único especializado en ajedrez, pero también el único sin ninguna evaluación publicada, por lo que la comparación de rendimiento en su dominio no es posible con la información disponible.

## Limitaciones y advertencias

- Ausencia total de evaluación: sin benchmarks, sin Elo, sin tasa de jugadas legales medida. No se puede afirmar que sea "grandmaster-level" como sostiene la model card.
- Entrenamiento muy corto: 1 época y 150 pasos sobre 5.000 ejemplos implican riesgo alto de sobreajuste al estilo del dataset y de olvido catastrófico de capacidades generales del modelo base.
- Alucinación de jugadas ilegales: al ser un LLM sin motor de búsqueda, puede emitir movimientos que no son legales en la posición dada. Es obligatorio un validador externo (python-chess u equivalente) en cualquier uso real.
- Idioma: solo declara inglés. Cualquier interacción en castellano queda fuera de lo documentado y probablemente degradada.
- Contexto: los 32.768 tokens son herencia del modelo base y no se ha verificado que el ajuste los preserve; para FEN y notación de jugadas es más que suficiente en cualquier caso.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen2.5-3B-Instruct también es Apache 2.0, así que no hay conflicto conocido; aun así, conviene revisar los términos del dataset *Grandmaster Blend*, cuya procedencia y licencia no se detallan.
- Validación comunitaria nula: 0 descargas y 0 likes en el momento de la consulta. No hay evidencia de terceros de que el modelo funcione como se describe.
- Fechas del repositorio: creado el 2026-10-17 y actualizado el mismo día, lo que sugiere un artefacto recién subido y sin iteraciones posteriores.
- Nombre inconsistente: el ID del repositorio es `Denisijcu/vertexqwen`, mientras que el código de ejemplo de la model card usa `your-huggingface-username/vertex-qwen-chess`, que no resuelve a ningún repositorio. Hay que sustituirlo por el ID real.
- Riesgo de sesgo de estilo: al entrenarse solo con posiciones de élite, puede reproducir patrones de aperturas concretas y fallar en posiciones atípicas, tableros con material reducido o variantes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Denisijcu/vertexqwen
- Modelo base Qwen2.5-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Unsloth (framework de ajuste QLoRA): https://github.com/unslothai/unsloth
- Ollama (despliegue local recomendado por el autor): https://ollama.com
- Paper, blog, repositorio de Vertex Coders o demo de Vertex Chess Arena: no disponible en la información proporcionada.

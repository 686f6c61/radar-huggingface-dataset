# Remek/basal-omni-1.0-mini

## Resumen
basal-omni-1.0-mini es un modelo experimental de toma de decisiones tipadas desarrollado por Remek (proyecto basal, con motor de inferencia en github.com/rkinas/basal). No es un modelo generativo al uso: en lugar de redactar respuestas, lee un estado (un mensaje, un documento, pasajes recuperados, una traza de agente o una pagina web en JSON) y responde una pregunta tipada sobre el (`choice`, `noul` si/no, `score`, y en el motor basal tambien `multi`, `act` y `tool`) devolviendo una probabilidad calibrada para cada respuesta permitida en un unico forward pass, sin generar texto. Esta construido sobre google/gemma-4-E4B-it mediante fine-tuning.

El modelo forma parte de la linea basal-omni sobre Gemma 4 y es la variante pequena (junto a basal-omni-1.0-max, de 12B). Frente a basal-1.5 (4.5B, basado en Bielik) introduce una base Gemma 4 de 4B, hasta 255 opciones por pregunta (frente a 10), un unico orden de opciones por defecto, soporte de imagenes y audio en la misma peticion mediante los encoders nativos de Gemma 4 (zero-shot, sin entrenamiento sobre medios) y entrenamiento sobre decisiones tipadas en polaco e ingles con objetivos suaves destilados de basal-1.5.

Es relevante porque propone un paradigma distinto al de los LLM generativos para tareas de clasificacion y decision: respuestas acotadas al conjunto de opciones (nunca fuera de ellas), calibracion explicita de la confianza y coste de una sola pasada por pregunta. Sus resultados publicados lo situan a nivel de basal-1.5-max (11B) en el panel externo en ingles y por encima de basal-1.5 (4.5B) en varios conjuntos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base google/gemma-4-E4B-it); cabecera de decision tipada del motor basal |
| Parametros totales | 7.941.100.874 (7,94B segun safetensors) |
| Parametros activos | no disponible (la model card describe la base como Gemma 4 E4B, 4B; no se detalla el regimen MoE) |
| Longitud de contexto | no disponible (se reportan pruebas con prompts de hasta 4.095 tokens y estados de 30k+ caracteres) |
| Tipos de cuantizacion | no disponible (resultados publicados en bf16) |
| Idiomas soportados | polaco (pl), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento
El modelo parte de google/gemma-4-E4B-it, un transformer decoder-only de la familia Gemma 4, y anade la capa de decision tipada del motor basal: la respuesta se obtiene como distribucion de probabilidad sobre las opciones permitidas en un unico forward pass, sin decodificacion autoregresiva de texto. La model card menciona que la base es "4B (Gemma 4 E4B)" mientras que el recuento de safetensors asciende a 7,94B parametros totales; no se especifica en la informacion disponible si se trata de una arquitectura con mezcla de expertos ni cuantos parametros estarian activos por token.

El entrenamiento se realizo exclusivamente sobre decisiones tipadas en polaco e ingles, con objetivos suaves (soft targets) destilados de basal-1.5. No se indica el numero de tokens de entrenamiento ni la composicion exacta del dataset. Un punto tecnicamente destacable es el soporte zero-shot de imagenes y audio: el modelo responde las mismas preguntas tipadas sobre medios leidos por los encoders propios de Gemma 4, sin haber recibido entrenamiento sobre medios (el entrenamiento multimodal se anuncia para versiones posteriores). El motor basal ofrece modos de servicio `eager`, `fast` y `deterministic`, con opcion `--media on` para habilitar medios.

## Capacidades
- Decision tipada: responde preguntas `choice` (eleccion entre opciones), `noul` (si/no), `score` (puntuacion) y, en el motor basal, `multi`, `act` y `tool`.
- Probabilidad calibrada por opcion: la salida es una distribucion sobre las respuestas permitidas, con la confianza explicita de cada una.
- Hasta 255 opciones por pregunta.
- Seleccion de herramienta: una pregunta `tool` sobre definiciones de herramientas de OpenAI o MCP elige la herramienta, no sus argumentos.
- Lectura de estados heterogeneos: mensajes, documentos, pasajes recuperados, trazas de agente y paginas web en JSON.
- Imagenes y audio en la misma peticion, de forma zero-shot mediante los encoders de Gemma 4 (requiere `--media on`).
- Multilingue en polaco e ingles.
- Integracion con API compatible con endpoints y con el motor basal (modos `eager`, `fast`, `deterministic`).

## Casos de uso
- Clasificacion documental con umbral de confianza: el modelo devuelve una probabilidad calibrada por categoria, lo que permite decidir automaticamente solo cuando la confianza supera un umbral y derivar el resto a revision humana; la cobertura publicada al 1% de error es del 42,0% con los umbrales enviados.
- Enrutado de herramientas en agentes: dada una traza de agente y un conjunto de definiciones de herramientas OpenAI o MCP, una pregunta `tool` selecciona la herramienta adecuada sin generar argumentos, lo que simplifica el control de flujo en pipelines agenticos.
- Verificacion de respuestas RAG: con el estado compuesto por pasajes recuperados y la respuesta candidata, el modelo responde si la respuesta esta soportada (tarea evaluada en RAGTruth, 0.760 frente a 0.653 de basal-1.5).
- Moderacion y filtrado de contenido: preguntas si/no (`noul`) sobre mensajes permiten un filtro de una sola pasada con probabilidad de decision, adecuado para volumen alto.
- Analisis de documentos largos en polaco e ingles: la familia de documentos largos mantiene precision del 75,7% en estados de 8k-20k caracteres y del 65,5% en 20k-30k, util para extraccion de decisiones sobre contratos o expedientes (con la advertencia de que contratos es una de las categorias mas debiles, 0.664).
- Evaluacion de calidad en produccion: puntuaciones (`score`) calibradas sobre respuestas de un sistema permiten monitorizar calidad sin un LLM juez generativo, con la salvedad de que las preguntas de tipo score sin umbral certificado se derivan a una persona al objetivo del 1% de error.
- Procesamiento de imagenes y audio sin entrenamiento especifico: al aceptar medios zero-shot, puede usarse para preguntas de decision sobre capturas, formularios escaneados o transcripciones en fase experimental.

## Benchmarks y rendimiento

Resultados publicados en la model card (servido con el motor basal en una H100; basal-omni-1.0-mini en `--mode eager`, bf16, un orden de opciones; basal-1.5 en `--mode fast`, dos ordenes):

| Benchmark | basal-omni-1.0-mini (E4B) | basal-1.5 (4.5B) |
|---|---|---|
| Werdykt v1, macro (PL + EN oculto, 10 categorias x 2 idiomas) | 0.769 | 0.721 |
| Decisiones PL (test held-out de basal-1.0, 7.081 items) | 0.932 | 0.922 |
| PL general (conocimiento, examenes, lectura; 3.079 items) | 0.751 | 0.746 |
| PL-Real (300 documentos polacos reales) | 0.950 | 0.963 |
| Panel externo EN (10 tareas publicas, 3.842 items) | 0.740 | 0.688 |
| Cobertura al 1% de error | 42,0% | 51,0% |

Desglose del panel externo en ingles: BIG-Bench Hard 0.726 (frente a 0.556), TabFact 0.780 (0.647), Circa 0.750 (0.633), RAGTruth 0.760 (0.653); por detras en JudgeBench, 0.537 (0.567). Corpus test en ingles de 1.479 items: 0.675 (0.643). Frente a basal-1.5-max (11B): nivel en el panel ingles (+0,3 puntos), por detras en decisiones PL (-0,8) y conocimiento general PL (-4,6).

Precision por longitud del estado en Werdykt (5.000 items, 76,9% global): 0-1k caracteres 66,4% (709 items); 1k-2k 74,4% (2.598); 2k-4k 91,1% (796); 4k-8k 93,7% (394); 8k-16k 79,7% (128); 16k+ 65,1% (375). Familia de documentos largos: 8k-20k 75,7% (226); 20k-30k 65,5% (194); 30k+ 56,2% (80).

Precision por longitud del prompt en tokens: decisiones PL 92,1% (0-255), 95,4% (256-511), 92,5% (512-1.023), 88,9% (1.024-2.047); corpus EN 68,9%, 65,3% y 55,2% en los tres primeros tramos; PL-Real 100,0% (8), 94,6% (186) y 95,3% (106). Categorias mas debiles en Werdykt: reglas (0.352), contratos (0.664) y documentos largos (0.686).

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma oficial; con 7,94B parametros totales, en bf16 el peso ronda los 15,9 GB, por lo que se necesitan al menos ~16-18 GB de VRAM para pesos y margen de activaciones.
- GPU recomendadas: los resultados publicados se obtuvieron en una NVIDIA H100 80GB HBM3 en bf16.
- GPU de consumo: no confirmado por el autor; por tamano, cabria en GPUs de 24 GB (RTX 4090, RTX 3090) en bf16, y en 16 GB solo con cuantizacion, que no esta documentada en la informacion disponible.
- Opciones de despliegue: motor basal (basal-serve, modos `eager`, `fast`, `deterministic`; `--media on` para medios) y libreria transformers; compatibilidad con endpoints. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el modelo resuelve cada pregunta en un unico forward pass, lo que reduce el coste frente a la generacion autoregresiva, pero no se publican cifras de latencia ni de peticiones por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Werdykt v1 (macro) | Panel EN | Decisiones PL | Licencia |
|---|---|---|---|---|---|---|
| basal-omni-1.0-mini | 7,94B totales (base E4B) | no disponible | 0.769 | 0.740 | 0.932 | Apache 2.0 |
| basal-1.5 | 4,5B | no disponible | 0.721 | 0.688 | 0.922 | no disponible |
| basal-1.5-max | 11B | no disponible | 0.772 | 0.737 (nivel, +0,3 para mini) | 0.940 (mini -0,8) | no disponible |
| basal-omni-1.0-max | 12B | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion se limita a la propia familia basal, unica con la que el autor publica datos; no hay resultados frente a clasificadores generativos de proposito general en la informacion disponible.

## Limitaciones y advertencias
- Modelo experimental: el autor lo etiqueta explicitamente como experimental y con entrenamiento solo sobre decisiones de texto; el soporte de imagen y audio es zero-shot y no ha recibido entrenamiento sobre medios.
- Categorias debiles: reglas (0.352 en Werdykt), contratos (0.664) y documentos largos (0.686); el autor recomienda calcular umbrales y fechas exactos en codigo en lugar de delegar en el modelo.
- Degradacion con estados muy largos: 65,1% de precision en estados de 16k+ caracteres y 56,2% en 30k+ en la familia de documentos largos.
- Cobertura limitada al 1% de error: 42,0% de decisiones automaticas con los umbrales enviados; las preguntas de tipo score sin umbral certificado se derivan a una persona.
- Idiomas: solo polaco e ingles; no se documenta rendimiento en castellano ni en otros idiomas.
- Riesgo de calibracion erronea fuera de dominio: las probabilidades son calibradas para las tareas evaluadas; no se garantiza la misma calibracion en distribuciones distintas.
- Sesgos: no se documenta ningun analisis de sesgos en la informacion disponible.
- Licencia Apache 2.0, que permite uso comercial; conviene verificar las condiciones de la licencia de la base google/gemma-4-E4B-it.
- Restricciones de uso: el modelo no genera texto libre ni argumentos de herramientas; solo responde preguntas tipadas sobre opciones predefinidas.

## Enlaces
- Hugging Face: https://huggingface.co/Remek/basal-omni-1.0-mini
- Modelo hermano (12B): https://huggingface.co/Remek/basal-omni-1.0-max
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Repositorio del motor de inferencia: https://github.com/rkinas/basal
- Sitio web del proyecto: https://basal.si5.pl/

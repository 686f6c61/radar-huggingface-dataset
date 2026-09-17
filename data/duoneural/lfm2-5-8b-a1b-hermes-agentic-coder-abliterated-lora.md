# DuoNeural/LFM2.5-8B-A1B-Hermes-Agentic-Coder-Abliterated-LoRA

## Resumen

El modelo DuoNeural/LFM2.5-8B-A1B-Hermes-Agentic-Coder-Abliterated-LoRA es un adaptador LoRA de tipo PEFT entrenado sobre el checkpoint DuoNeural/LFM2.5-8B-A1B-Abliterated, que a su vez deriva de la familia Liquid Foundation Model (LFM2.5) de Liquid AI. El adaptador está publicado por DuoNeural y su propósito declarado es convertir el modelo base en un asistente orientado a flujos agénticos y generación de código, con soporte explícito de function calling en formato Hermes. El repositorio contiene únicamente los pesos del adaptador en safetensors, no el modelo fusionado; el autor publica por separado la versión fusionada y las cuantizaciones GGUF.

Técnicamente, el modelo base es una arquitectura híbrida SSM-Conv con capas de mezcla de expertos (MoE) de 32 expertos y 4 activos por token. El autor declara 8,3 mil millones de parámetros totales y 1,5 mil millones de parámetros activos, aunque el nombre del repositorio usa la convención "8B-A1B". El adaptador se entrenó con 45.000 muestras agénticas curadas y sin formato (zero-formatting) repartidas en seis subconjuntos equilibrados. La relevancia actual del modelo reside en su combinación de coste de inferencia bajo (solo 1,5B parámetros activos) con comportamiento agéntico y de código, además de una variante "abliterated" que elimina los rechazos de seguridad del modelo original.

El autor etiqueta el modelo como abliterated, es decir, con la alineación de seguridad eliminada deliberadamente, y publica métricas preliminares de function calling y HumanEval medidas sobre una cuantización Q4_K_M. No se dispone de información sobre longitud de contexto, idiomas soportados ni composición detallada del dataset más allá de los nombres de los subconjuntos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida SSM-Conv + MoE (Liquid Foundation Model, LFM2.5); 32 expertos, top-4 activos |
| Parametros totales | 8,3 mil millones (segun model card); el nombre del repo indica "8B" |
| Parametros activos | 1,5 mil millones (segun model card); el nombre del repo indica "A1B" |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M confirmado (repo de cuantizaciones separado); otros niveles no disponibles |
| Idiomas soportados | no disponible |
| Licencia | liquid-foundation-model-community-license (etiquetada como "other" en HuggingFace) |
| Formato de pesos | safetensors (adaptador LoRA PEFT); GGUF en repositorio aparte |
| Tipo de artefacto | Adaptador LoRA, no modelo completo |
| Modelo base | DuoNeural/LFM2.5-8B-A1B-Abliterated |
| Configuracion LoRA | rank 64, alpha 128, modulos objetivo: `in_proj`, `out_proj`, `gate`, `router.classifier` |
| Tamano del repositorio | 0,0 GB |
| Libreria | peft |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo base pertenece a la familia LFM2.5 de Liquid AI, con una arquitectura híbrida que combina capas de espacio de estados (SSM) con convoluciones y capas de mezcla de expertos. La configuración MoE declarada es de 32 expertos con 4 activos por token, lo que da lugar a 1,5B parámetros activos sobre un total de 8,3B. Este diseño busca reducir el coste computacional por token frente a un transformer denso de tamaño equivalente, manteniendo la capacidad del modelo completo. El adaptador LoRA se aplica sobre los módulos `in_proj`, `out_proj`, `gate` y `router.classifier`, con rango 64 y alpha 128.

El entrenamiento del adaptador se realizó sobre 45.000 muestras agénticas curadas, descritas por el autor como "zero-formatting", repartidas en seis subconjuntos equilibrados: llamadas a herramientas estilo Hermes, CodeFeedback, Magpie Ultra y Self-OSS, entre otros. Se aplicó enmascaramiento de pérdida únicamente sobre la completación del asistente (assistant completion-only loss masking) delimitado por marcadores ChatML, una práctica habitual para evitar que el modelo aprenda a reproducir los turnos del usuario. No se especifica en la información disponible si hubo fases de RLHF o DPO, ni el número total de tokens de entrenamiento.

El componente "abliterated" del nombre indica que el checkpoint base ha sido sometido a un proceso de ablación de direcciones de rechazo, de modo que el modelo no se niega a responder ante peticiones que un modelo alineado rechazaría. El autor declara explícitamente "100% uncensored" y cero rechazos en tareas de sistemas de bajo nivel, ingeniería inversa y seguridad.

## Capacidades

- Generación de texto conversacional multi-turno en formato ChatML.
- Function calling / tool calling en formato Hermes, con salida XML y JSON parseable; el autor reporta una tasa de AST correcto del 100% en su evaluación preliminar de 25 casos.
- Comportamiento agéntico multi-paso: el nombre y los subconjuntos de entrenamiento (Hermes tool calls, agéntico) apuntan a bucles de razonamiento con llamadas a herramientas encadenadas.
- Generación de código en Python, con 75% Pass@1 en HumanEval (15/20) en la evaluación preliminar del autor.
- Razonamiento matemático cuantitativo básico, con GSM8K por encima del 60% según el autor.
- Respuestas sin rechazo en dominios sensibles (sistemas de bajo nivel, ingeniería inversa, seguridad ofensiva) por efecto del proceso de abliteración.
- Capacidades multilingües: no disponibles (no se declaran idiomas en la model card).
- Capacidades de visión o audio: no disponibles (el pipeline declarado es text-generation).

## Casos de uso

- Asistentes de codificación integrados en el IDE: el adaptador está entrenado específicamente sobre subconjuntos de código (CodeFeedback) y mantiene un 75% Pass@1 en HumanEval, por lo que resulta adecuado para autocompletado, generación de funciones y explicación de código en un bucle de baja latencia gracias a sus 1,5B parámetros activos.
- Pipelines de CI/CD con reparación automática de errores: el soporte de tool calling en formato Hermes permite que el modelo invoque herramientas de build, test o lint y decida la siguiente acción a partir de la salida estructurada.
- Agentes autónomos de resolución de tareas multi-paso: el entrenamiento sobre datos agénticos y la presencia del tokenizador de herramientas Hermes facilitan la construcción de bucles de planificación-acción-observación sin ingeniería de formato adicional.
- Automatización de operaciones sobre terminal y sistemas: la variante abliterated responde sin rechazos a tareas de administración de sistemas, scripting de bajo nivel y depuración de binarios, un escenario donde los modelos alineados suelen negarse.
- Ingeniería inversa y análisis de seguridad autorizado: el autor declara explícitamente cero rechazos en reverse engineering y tareas de seguridad, lo que lo hace utilizable en equipos de respuesta a incidentes y análisis de malware dentro de un marco legal.
- Extracción de datos estructurados mediante function calling: la tasa declarada del 100% de AST correcto en llamadas a herramientas permite usar el modelo como capa de traducción entre lenguaje natural y esquemas JSON/XML en pipelines de ETL.
- Despliegue en hardware de gama baja o edge: las cifras reportadas de ~90 tokens/s en una GTX 1070 sugieren viabilidad en equipos antiguos o embebidos con cuantización Q4_K_M.
- Prototipado rápido de asistentes conversacionales: al ser un adaptador LoRA sobre un modelo base público dentro de su familia, permite iterar sobre el comportamiento sin reentrenar desde cero.

## Benchmarks y rendimiento

Los siguientes datos proceden de la model card del autor y corresponden a una validación preliminar zero-shot ejecutada directamente sobre el motor GGUF Q4_K_M. El propio autor los califica de iniciales y anuncia una evaluación multi-suite completa y una versión v2.

| Benchmark / evaluacion | Resultado declarado | Notas |
|---|---|---|
| Hermes Function Calling AST Rate | 100,0% (25/25) | Llamadas XML y JSON parseables sin deriva sintactica |
| HumanEval Python (Pass@1) | 75,0% (15/20) | Generacion de codigo algoritmico zero-shot |
| GSM8K | 60,0%+ | El autor indica ausencia de olvido catastrofico |
| Abliteration y alineacion de seguridad | 100% sin censura | Cero rechazos en tareas de bajo nivel, ingenieria inversa y seguridad |
| Throughput en RTX 3090 | ~380–395 tokens/s | Iteracion agentica multi-turno sub-segundo |
| Throughput en GTX 1070 | ~90 tokens/s | Ejecucion en hardware antiguo |

No se han publicado resultados de benchmarks independientes ni comparaciones verificadas por terceros en la información disponible. Las cifras de rendimiento son autorreportadas y proceden de muestras pequeñas (20 y 25 casos en HumanEval y function calling respectivamente), por lo que su margen de error es amplio.

## Requisitos de hardware

- VRAM estimada para inferencia (estimación propia a partir del tamaño, no dato del autor): en Q4_K_M, en torno a 5–6 GB para los pesos de los 8,3B parámetros totales, más caché KV; en FP16, en torno a 16–17 GB.
- GPU recomendadas: el autor reporta mediciones en RTX 3090 (~380–395 tokens/s) y GTX 1070 (~90 tokens/s). Por rango de memoria, son adecuadas tarjetas con 8 GB o más para cuantizaciones de 4 bits y con 24 GB o más para FP16.
- Cabe en GPU de consumo: sí, según las mediciones del autor en RTX 3090 y GTX 1070 con cuantización Q4_K_M. Una RTX 4090, 4080 o 3090 ejecutaría el modelo con holgura en 4 bits.
- Opciones de despliegue: llama.cpp y Ollama a través de los GGUF publicados por el autor; PEFT/Transformers para cargar el adaptador sobre el modelo base; vLLM y TGI son compatibles con el modelo base fusionado, aunque no se confirma soporte específico de la arquitectura híbrida SSM-MoE en la información disponible.
- Latencia y throughput: ~380–395 tokens/s en RTX 3090 y ~90 tokens/s en GTX 1070, en ambos casos sobre la cuantización Q4_K_M según el autor.
- Nota: el repositorio de este adaptador tiene un tamaño declarado de 0,0 GB, por lo que no contiene pesos completos; para inferencia hay que usar el modelo fusionado o el GGUF.

## Comparativa con modelos similares

La comparativa se limita a modelos de la misma categoría (asistentes de 7–9B orientados a código y agentes). Los datos de las alternativas provienen de su documentación pública; los campos no confirmados se marcan como no disponibles.

| Modelo | Parametros | Contexto | Licencia | Orientacion |
|---|---|---|---|---|
| DuoNeural/LFM2.5-8B-A1B-Hermes-Agentic-Coder-Abliterated (LoRA) | 8,3B totales / 1,5B activos | no disponible | liquid-foundation-model-community-license | Agentes, codigo, function calling, sin censura |
| Liquid AI LFM2-8B-A1B (modelo upstream de la familia) | ~8B totales / ~1B activos | no disponible en esta busqueda | licencia comunitaria de Liquid AI | Agente generalista en dispositivo |
| Qwen2.5-Coder-7B | ~7,6B densos | 32k nativo, extensible a 128k | Apache 2.0 | Codigo y generacion asistida |
| Llama-3.1-8B-Instruct | 8B densos | 128k | Llama 3.1 Community License | Asistente generalista |

Frente a alternativas densas como Qwen2.5-Coder-7B o Llama-3.1-8B-Instruct, la principal diferencia es el diseño MoE: solo 1,5B parámetros activos por token, lo que reduce el coste de inferencia a cambio de un footprint de memoria similar al de un modelo de 8B. La licencia, sin embargo, es más restrictiva que Apache 2.0. No hay datos de benchmarks independientes que permitan una comparación de rendimiento fiable; el único punto de comparación objetivo disponible es el 75% de Pass@1 en HumanEval reportado por el autor, medido sobre 20 casos.

## Limitaciones y advertencias

- Los benchmarks son preliminares, autorreportados y se ejecutaron sobre muestras muy pequeñas (20 casos en HumanEval, 25 en function calling). No deben tomarse como indicadores fiables de rendimiento en producción.
- El modelo está abliterated: se ha eliminado deliberadamente la alineación de seguridad. Puede generar contenido dañino, instrucciones para actividades ilícitas o código malicioso sin mostrar rechazo. Su uso requiere control humano, filtros externos y un marco legal claro.
- El proceso de abliteración puede degradar capacidades generales y coherencia en tareas no relacionadas con código o agentes; no se han publicado evaluaciones que cuantifiquen ese posible deterioro.
- Riesgo de alucinación: no disponible de forma específica, pero es esperable en un modelo de 8B con entrenamiento de ajuste fino sobre un dataset relativamente pequeño (45.000 muestras).
- No hay información sobre longitud de contexto soportada, lo que impide planificar casos de uso que dependan de ventanas largas.
- No hay información sobre idiomas soportados. El entrenamiento se describe con subconjuntos mayoritariamente en inglés, por lo que el rendimiento en castellano no está garantizado.
- Licencia liquid-foundation-model-community-license, etiquetada como "other" en HuggingFace: es necesario revisar los términos en https://www.liquid.ai/community-license antes de cualquier uso comercial, ya que las licencias comunitarias de este tipo suelen incluir restricciones de escala o de atribución.
- El repositorio no contiene el modelo completo, solo el adaptador LoRA. Su uso directo requiere fusionar con el modelo base o recurrir a los GGUF publicados aparte.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.
- No se documenta la composición exacta del dataset ni si contiene datos con derechos de autor; el subconjunto "CodeFeedback" y "Magpie Ultra" son fuentes de origen público pero con condiciones variables.

## Enlaces

- Repositorio del adaptador LoRA: https://huggingface.co/DuoNeural/LFM2.5-8B-A1B-Hermes-Agentic-Coder-Abliterated-LoRA
- Modelo base del adaptador: https://huggingface.co/DuoNeural/LFM2.5-8B-A1B-Abliterated
- Modelo fusionado completo: https://huggingface.co/DuoNeural/LFM2.5-8B-A1B-Hermes-Agentic-Coder-Abliterated
- Cuantizaciones GGUF: https://huggingface.co/DuoNeural/LFM2.5-8B-A1B-Hermes-Agentic-Coder-Abliterated-GGUF
- Licencia comunitaria de Liquid AI: https://www.liquid.ai/community-license
- Resultados de la busqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a planes de prevención de riesgos naturales en Francia y no guardan relación con el modelo evaluado.

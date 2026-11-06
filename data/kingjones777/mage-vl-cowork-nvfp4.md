# kingjones777/Mage-VL-Cowork-NVFP4

## Resumen

Mage-VL-Cowork-NVFP4 es una cuantización NVFP4 (4 bits en formato de coma flotante de NVIDIA) del modelo multimodal microsoft/Mage-VL-Cowork, un modelo de computer-use orientado a agentes de interfaz gráfica. Lo publica el usuario independiente kingjones777 y su objetivo es hacer viable la inferencia de un agente visual sobre hardware de gama consumer-profesional como el NVIDIA GB10 (clase DGX Spark), donde el modelo original en BF16 decodifica a solo 22,6 tokens por segundo.

El modelo base es un transformer multimodal de tipo LLaVA-OneVision2 (según la librería declarada, llava_onevision2) con 4.741.793.792 parámetros totales (aproximadamente 4,7 mil millones), que recibe una captura de pantalla, razona sobre ella y emite la siguiente acción del agente: clics, pulsaciones de teclas, texto o un comando bash. La cuantización emplea precisión mixta: solo las 36 capas down_proj del MLP están en NVFP4, mientras que la atención y las proyecciones gate_proj/up_proj se mantienen en FP8 y la torre de visión en BF16, con activaciones en BF16 (weight-only, W4A16 y W8A16).

Su relevancia actual radica en que demuestra que es posible acelerar un agente de computer-use unas 2,4 veces (de 22,6 a 53,3 tok/s en decodificación) con una degradación de perplejidad de solo el 1,4 % respecto al BF16, manteniendo idéntico rendimiento en tareas de clic sobre pantallas sintéticas y en OSWorld (10/15 tareas). Es una ficha útil para quienes despliegan agentes GUI en entornos con recursos limitados y quieren evaluar el coste real de cuantizar a 4 bits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal LLaVA-OneVision2 (visión-lenguaje) |
| Parametros totales | 4.741.793.792 (aprox. 4,7 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 65.536 tokens en la configuración de despliegue recomendada (--max-model-len 65536) |
| Tipos de cuantizacion | NVFP4 (down_proj del MLP), FP8 (atención y gate_proj/up_proj), BF16 (torre de visión y activaciones); weight-only W4A16 y W8A16 |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con compressed-tensors (precisión mixta), compatible con vLLM |

## Arquitectura y entrenamiento

El modelo base sigue la arquitectura LLaVA-OneVision2, un transformer multimodal que combina una torre de visión con un modelo de lenguaje para tareas de image-text-to-text. El proceso de cuantización parte de la revisión 6fbe7f91 de microsoft/Mage-VL-Cowork y aplica una receta de precisión mixta diseñada por el autor: las 36 capas down_proj del MLP se convierten a NVFP4 (aproximadamente una cuarta parte de los pesos del modelo de texto), la atención y las proyecciones gate_proj/up_proj pasan a FP8, y la torre de visión permanece en BF16. Las activaciones se mantienen en BF16, de modo que vLLM ejecuta el modelo con kernels Marlin (MarlinNvFp4LinearKernel) en lugar de aritmética FP4 nativa.

El autor documenta que probó configuraciones más agresivas (todas las capas lineales del texto en NVFP4, con activaciones W4A4 y W4A16) y las descartó por pérdida de calidad: la perplejidad en wikitext-2 subía entre un 7,3 % y un 20 % frente al BF16. La receta final, cuantizada con GPTQ, alcanza una perplejidad de 54,13 frente a 53,40 del original (ratio 1,014), dentro del umbral de 1,02 que se fijó el autor. No se dispone de información sobre el número de tokens de entrenamiento ni sobre la composición del dataset del modelo base; la model card solo cita HuggingFaceH4/ultrachat_200k y Salesforce/wikitext como datasets asociados, presumiblemente empleados en la evaluación y calibración. Tampoco se detalla si hubo RLHF o DPO en el entrenamiento original.

## Capacidades

- Comprensión de capturas de pantalla y razonamiento visual sobre la interfaz: el modelo lee una imagen de pantalla, genera un bloque de razonamiento y emite la siguiente acción del agente.
- Generación de acciones de computer-use: clics, pulsaciones de teclas, escritura de texto y comandos bash.
- Formato de acción propio del modelo, entrenado específicamente para tareas de agente GUI (estilo OSWorld).
- Soporte de tool calling mediante la API de herramientas de OpenAI, con el parser hermes y auto tool choice en vLLM; el rendimiento es limitado y se degrada con muchas herramientas.
- Soporte de modo de razonamiento (thinking), con el parser de razonamiento qwen3 en vLLM.
- Capacidad multimodal de image-text-to-text con múltiples imágenes por prompt (hasta 4 configuradas en el despliegue recomendado).
- Capacidades multilingües limitadas al inglés.
- Compatibilidad con prefix caching en vLLM, con reutilización de hasta el 99,2 % del prompt en turnos sucesivos.

## Casos de uso

- Agentes de automatización de escritorio: el modelo puede actuar como controlador de un agente que opera aplicaciones reales sobre capturas de pantalla, emitiendo clics y pulsaciones; su formato de acción nativo y su entrenamiento en OSWorld lo hacen adecuado para este escenario, y la versión NVFP4 lo hace viable en un GB10.
- Despliegue en hardware de borde o estaciones compactas: con 5,46 GB de pesos y decodificación de 53,3 tok/s en un GB10, permite ejecutar un agente visual en una máquina de clase DGX Spark sin GPU de centro de datos.
- Evaluación e investigación de agentes GUI: sirve como base cuantizada para reproducir experimentos de computer-use con un coste de infraestructura reducido, manteniendo el 100 % de aciertos en clics sobre pantallas sintéticas (111/120) y 10/15 en OSWorld.
- Pruebas de regresión de calidad de cuantización: la model card documenta métricas detalladas (perplejidad, distancia al centro del objetivo, acciones bien formadas) que permiten comparar recetas de cuantización sobre un mismo modelo base.
- Automatización de tareas repetitivas de oficina: lectura de pantallas y ejecución de comandos bash o pulsaciones para flujos como rellenar formularios o navegar por menús, aprovechando el contexto de 65.536 tokens para mantener el historial de pasos.
- Integración en pipelines con vLLM: el modelo se sirve con la imagen vllm/vllm-openai:v0.32.0 y la API compatible con OpenAI, lo que facilita su incorporación a orquestadores de agentes existentes con prefix caching activado.
- Prototipado de asistentes de soporte visual: dado un screenshot de una aplicación, el modelo puede describir el estado y proponer la siguiente acción, útil para sistemas de ayuda contextual en inglés.

## Benchmarks y rendimiento

Datos publicados por el autor, comparando el BF16 original con esta cuantización en el mismo equipo (un NVIDIA GB10) y la misma versión de vLLM 0.32.0:

| Prueba | BF16 | Este repo |
|---|---:|---:|
| Perplejidad wikitext-2 test, 100 ventanas de 512 | 53,40 | 54,13 (1,014x) |
| Perplejidad wikitext-2 validación, 100 ventanas de 512 | 55,02 | 55,96 (1,017x) |
| Clics en pantallas sintéticas con objetivos conocidos, 120 peticiones: aciertos | 111 | 111 |
| Mismas peticiones: acciones bien formadas | 117 | 118 |
| Mismas peticiones: distancia mediana al centro del objetivo (fracción de pantalla) | 0,0132 | 0,0132 |
| Capturas de escritorio reales, 119 peticiones: acciones bien formadas | 105 | 100 |
| Una herramienta (get_weather), API de tools de OpenAI | pasa | pasa |
| Seis herramientas, seis peticiones, API de tools de OpenAI | 2/6 | 1/6 |
| OSWorld, 15 tareas, agente propio del modelo | 10/15 | 10/15 |

| Métrica de velocidad (GB10, vLLM 0.32.0) | BF16 antes | Este repo | BF16 después |
|---|---:|---:|---:|
| Decodificación, 1.024 tokens, mediana de 3 (tok/s) | 22,61 | 53,34 | 22,63 |
| Prefill, 8.192 tokens, mediana de 3 (s) | 1,207 | 1,111 | no disponible |
| Primer token en un paso con captura, prefijo en caché, mediana de 3 (s) | 0,111 | 0,076 | 0,107 |

El autor señala que la perplejidad es alta en ambos casos porque es un modelo de agente, no de texto, y que la comparación relevante es el ratio. La diferencia en capturas reales (100 frente a 105 acciones bien formadas) se sitúa dentro del ruido según una prueba de signos bilateral (p = 0,38). No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan 5,46 GB en este formato (frente a 8,9 GB en BF16); con activaciones BF16, caché KV y contexto largo, el consumo real es mayor y depende de --max-model-len y del número de imágenes por prompt.
- GPU recomendadas: el autor lo ha probado en un NVIDIA GB10 (clase DGX Spark); al usar kernels Marlin para las capas NVFP4, requiere hardware y versiones de vLLM que soporten compressed-tensors y dichos kernels.
- ¿Cabe en GPU consumer? Con 5,46 GB de pesos, el modelo cabe en GPUs consumer con 12-16 GB o más de VRAM, aunque el autor no documenta pruebas en RTX 4090 u otras consumer; la validación oficial es solo en GB10.
- Opciones de despliegue: vLLM 0.32.0 con --trust-remote-code, --limit-mm-per-prompt '{"image":4,"video":0}', --mm-processor-kwargs '{"max_pixels":3211264}', --enable-prefix-caching, --reasoning-parser qwen3, --tool-call-parser hermes y --enable-auto-tool-choice. No se documenta soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: 53,34 tok/s en decodificación (1.024 tokens) y 1,111 s de prefill para 8.192 tokens en un GB10; primer token en 0,076 s con prefijo en caché. El autor indica que en su Spark ejecuta el modelo junto a otros dos, por lo que reduce --max-model-len en producción.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Rendimiento documentado |
|---|---|---|---|---|---|
| Mage-VL-Cowork-NVFP4 (este repo) | 4,7 mil millones | 65.536 tokens (config. de despliegue) | NVFP4/FP8/BF16 mixto, safetensors | Apache 2.0 | 53,3 tok/s en GB10; OSWorld 10/15; PPL 54,13 |
| microsoft/Mage-VL-Cowork (BF16) | 4,7 mil millones | no disponible | BF16, safetensors | Apache 2.0 (según modelo base) | 22,6 tok/s en GB10; OSWorld 10/15; PPL 53,40 |
| Otras cuantizaciones del mismo modelo base | 4,7 mil millones | no disponible | no disponible | Apache 2.0 | no disponible |

No se dispone de información sobre otros modelos comparables de la misma categoría (agentes GUI) en la documentación proporcionada, por lo que la comparativa se limita al modelo base y a variantes de cuantización del mismo.

## Limitaciones y advertencias

- El modelo solo soporta inglés; no se ha validado su comportamiento en castellano ni en otros idiomas.
- La cuantización no es de 4 bits en todo el modelo: solo 36 capas down_proj están en NVFP4, mientras que atención y gate/up están en FP8 y la torre de visión en BF16; no debe presentarse como un modelo íntegramente de 4 bits.
- El tool calling genérico es débil incluso en BF16: con seis herramientas de OpenAI el modelo acierta 1/6 (frente a 2/6 en BF16) y tiende a entrar en bucles con etiquetas <think>; está entrenado para su propio formato de acción de computer-use.
- En capturas de escritorio reales, las acciones bien formadas bajan de 105 a 100 sobre 119 peticiones; el autor lo atribuye a ruido, pero es el único indicador que empeora.
- La perplejidad absoluta es alta (54,13) porque el modelo está optimizado para tareas de agente, no para modelado de lenguaje general.
- Riesgo de alucinación y de narración excesiva: en algunos casos el modelo sigue generando pasos después de su primera acción y emite una segunda llamada a herramienta mal formada.
- Requiere vLLM 0.32.0 o superior con soporte de compressed-tensors y kernels Marlin NVFP4; no se documenta compatibilidad con llama.cpp, Ollama o TGI.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y los datos de entrenamiento originales pueden tener condiciones adicionales no detalladas en esta ficha.
- El autor no documenta sesgos específicos del modelo base; al ser un modelo de agente GUI entrenado principalmente en inglés, puede tener un rendimiento desigual en interfaces localizadas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente de los resultados publicados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kingjones777/Mage-VL-Cowork-NVFP4
- Modelo base: https://huggingface.co/microsoft/Mage-VL-Cowork
- Dataset de capturas de escritorio reales usado en la evaluación: https://huggingface.co/datasets/dixantp/desktop-accessibility-screenshot-json-dumps
- Dataset HuggingFaceH4/ultrachat_200k: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- Dataset Salesforce/wikitext: https://huggingface.co/datasets/Salesforce/wikitext
- Imagen de despliegue vLLM: vllm/vllm-openai:v0.32.0 (no se proporciona URL directa en la información disponible)

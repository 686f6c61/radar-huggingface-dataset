# sjoe1244/Qwen3.8-27B-Uncensored-Heretic-exl3-4.00bpw-h4-vb4

## Resumen

Este repositorio es una cuantización EXL3 de 4,00 bits por peso (bpw) de `llmfan46/Qwen3.8-27B-Uncensored-Heretic-Native-MTP-Preserved`, un derivado "abliterated" (sin alineamiento de rechazo) de Qwen3.8-27B. El autor de la cuantización es el usuario de HuggingFace `sjoe1244`, mientras que el trabajo de desalineamiento corresponde a `llmfan46`. El objetivo declarado es ejecutar el modelo completo —pesos, `lm_head`, torre de visión y cabeza MTP— en una única tarjeta de 24 GB, manteniendo la ventana de contexto nativa de 262.144 tokens.

Qwen3.8-27B es, según la documentación de la familia, un modelo denso nativo de visión-lenguaje que entiende imágenes y vídeo, con control flexible del modo "thinking" y orientado a completar tareas complejas de varios pasos. Esta exportación no modifica la arquitectura: solo cuantiza los pesos y añade los ficheros `preprocessor_config.json` y `video_preprocessor_config.json` tomados de `Qwen/Qwen3.8-27B`, ausentes en el repositorio de origen y necesarios para que ExLlamaV3 procese la entrada visual.

Su relevancia práctica es de despliegue: 16,1 GB de descarga, 21,0 GB de VRAM tras la carga y entre 155 y 167 tokens/s de escritura gracias a la decodificación especulativa con la cabeza MTP propia del modelo, sin necesidad de un segundo modelo borrador. La contrapartida es que solo funciona en TabbyAPI o ExLlamaV3.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso de visión-lenguaje (Qwen3.8-27B) con torre de visión y cabeza MTP para decodificación especulativa; pesos cuantizados en formato EXL3 |
| Parámetros totales | 27B según el autor. La barra lateral de HuggingFace muestra 8.038.307.200, cifra que el propio autor señala como incorrecta para ficheros EXL3 |
| Parámetros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 262.144 tokens (ventana completa, cargada con visión y MTP activos y caché KV de 4 bits) |
| Tipos de cuantización | EXL3 4,00 bpw: pesos, `lm_head`, torre de visión y cabeza MTP a 4 bits; embeddings en BF16 sin cuantizar; caché KV a 4 bits (`cache_mode: 4,4`). Este repositorio solo publica la variante de 4,00 bpw |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato EXL3, dos fragmentos (`model-00001-of-00002.safetensors` 8.471.336.006 bytes y `model-00002-of-00002.safetensors` 7.605.654.924 bytes; total 16.076.990.930 bytes, 14,97 GiB) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer denso de 27B con capacidades de visión-lenguaje, según la descripción de la familia Qwen3.8-27B, que lo presenta como un modelo nativo de imagen y vídeo con control de razonamiento y pensado para tareas multi-paso. Sobre esa base, esta exportación cuantiza con ExLlamaV3 1.6.0 mediante la orden `python convert.py -i <source> -o <out> -w <work> -b 4.0 -hb 4 -vb 4 -mb 4`, con codebook `mul1`, `out_scales` automático y calibración de 250 filas por 2.048 columnas (conjunto por defecto de ExLlamaV3). Los embeddings se dejan en BF16, mientras que la cabeza de salida, la torre de visión y la cabeza MTP se cuantizan a 4 bits.

La innovación técnica destacable es la preservación de la cabeza MTP (multi-token prediction) del modelo original, que actúa como borrador en decodificación especulativa sin necesidad de un segundo modelo. En las pruebas del autor se aceptaron el 81% de los tokens propuestos por MTP (6.297 de 7.788), lo que explica el salto de rendimiento frente a la misma familia sin MTP (54 tokens/s en la cuantización de referencia de turboderp). El desalineamiento del modelo base procede de un proceso de abliteración tipo Heretic/ARA aplicado por `llmfan46` sobre Qwen3.8-27B; no se especifican en la información disponible ni el número de tokens de entrenamiento, ni la composición del dataset, ni si hubo fases de RLHF o DPO específicas para esta variante.

## Capacidades

- Generación de texto conversacional con plantilla de chat propia (se recomienda dejar `prompt_template` vacío en TabbyAPI para que use la del modelo).
- Modo "thinking" configurable: se activa o desactiva con `chat_template_kwargs: {"enable_thinking": false}` y su esfuerzo se ajusta con `reasoning_effort` (`xhigh` por defecto, con capacidad de razonar durante miles de tokens; `low` o `medium` para uso diario).
- Comprensión de imágenes: la torre de visión carga y se ajusta a los 24 GB con la configuración indicada, y el repositorio añade los ficheros de preprocesado necesarios. El autor no ejecutó ninguna prueba con imágenes.
- Comprensión de vídeo: el modelo base se describe como nativo de imagen y vídeo; el repositorio incluye `video_preprocessor_config.json`. No se aportan pruebas específicas.
- Tool calling / function calling: soportado con `tool_format: auto`. En las pruebas del autor, 2 de 2 bucles de llamadas a herramientas (leer un fichero, corregirlo, escribirlo y ejecutar los tests) se completaron con 4 llamadas cada uno y sin argumentos mal formados.
- Razonamiento multi-paso y uso como agente: los bucles de herramienta anteriores y las 9 de 9 búsquedas exactas en prompts de 4K y 9K tokens apuntan a un comportamiento fiable en tareas encadenadas de contexto medio.
- Generación de código: 6 de 6 tareas cortas de programación superadas según tests unitarios ocultos.
- Decodificación especulativa integrada mediante la cabeza MTP, sin modelo borrador adicional.
- Ausencia de alineamiento de rechazo (variante "uncensored"/"abliterated"): responde a peticiones que un modelo alineado rechazaría.
- Capacidades multilingües: no disponible.

## Casos de uso

- Análisis de documentación extensa en local: con 262.144 tokens de contexto, se puede cargar un corpus completo (manuales, expedientes, código de un repositorio mediano) en una sola pasada sin recuperación fragmentada, en una GPU de 24 GB. El autor solo validó prompts de hasta 9K tokens, por lo que el llenado completo de la ventana no está verificado.
- Agente de codificación sobre repositorios locales: combinando tool calling con la ventana larga, el modelo puede leer ficheros, aplicar parches y ejecutar tests en un bucle. Las pruebas del autor muestran 2 de 2 bucles completados y 6 de 6 tareas cortas resueltas.
- Servicio de inferencia conversacional de alto caudal: 155-167 tokens/s sin thinking y 142-144 tokens/s con thinking (`reasoning_effort: low`) con `max_batch_size: 2` en una RTX 4090, suficiente para dar servicio a varios usuarios concurrentes en un despliegue interno.
- Generación de corpus para red teaming y evaluación de seguridad: al tratarse de una variante abliterada, es adecuada para producir conjuntos de prompts ofensivos con los que medir el comportamiento de filtros y clasificadores, como señalan las fichas de la familia en abliteratedmodels.org.
- Extracción estructurada de documentos con componente visual: facturas, formularios escaneados o capturas de interfaz, apoyándose en la torre de visión y en la precisión observada en la copia exacta de argumentos de herramienta (9 de 9). Requiere validación propia, ya que no hay pruebas de imagen publicadas.
- Asistente privado sobre datos sensibles: al ejecutarse íntegramente en local con licencia Apache 2.0, permite desplegar en infraestructura propia sin enviar datos a terceros.
- Investigación sobre alineamiento y direcciones de rechazo: la variante permite comparar la distribución de respuestas frente al modelo oficial Qwen3.8-27B y estudiar el efecto de la abliteración en tareas controladas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor indica explícitamente que no midió la calidad frente al origen en BF16. Los únicos datos son las mediciones empíricas de su entorno de prueba (TabbyAPI con ExLlamaV3 1.6.0, una RTX 4090 de 24.564 MiB, cada prueba ejecutada una vez):

| Prueba | Resultado |
|---|---|
| Carga del modelo | 35 s; 21.027 MiB de VRAM tras la carga |
| VRAM tras todas las pruebas | 21.595 MiB |
| Tareas cortas de código verificadas con tests unitarios ocultos | 6 de 6 superadas |
| Bucles de tool calling (leer, corregir, escribir, ejecutar tests) | 2 de 2 completados, 4 llamadas cada uno, sin argumentos erróneos |
| Búsquedas exactas en prompts de 4K y 9K tokens (copias exactas de funciones y argumentos) | 9 de 9 superadas |
| Velocidad sin thinking | 155-167 tokens/s |
| Velocidad con thinking (`reasoning_effort: low`) | 142-144 tokens/s |
| Velocidad en prompts de 4K y 9K tokens | 173-193 tokens/s |
| Tokens de MTP aceptados | 81% (6.297 de 7.788) |
| Primera petición tras la carga | 48 tokens/s |
| Prueba de programa largo | Alcanzó el límite de 3.000 tokens de salida antes de terminar; no contabilizada |

Como referencia, el propio autor cita la cuantización Huihui de 4,00 bpw de turboderp sobre la misma familia (cabeza a 6 bits, visión a 5 bits), que alcanzó un pico de 22,7 GB con un prompt de 232K tokens en el mismo equipo, y que sin MTP escribía 54 tokens/s.

## Requisitos de hardware

- VRAM medida en el entorno de referencia: 21,0 GB tras la carga (21.595 MiB tras ejecutar todas las pruebas), sobre una GPU de 24 GB (RTX 4090 con 24.564 MiB). El presupuesto incluye visión y MTP activos con caché KV de 4 bits.
- GPU recomendadas: cualquier tarjeta con al menos 24 GB. El único equipo validado es una RTX 4090. No se han publicado mediciones en A100, H100, L40S, RTX 5090 ni otras GPU.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) con la configuración indicada. No hay datos para tarjetas de 16 GB o menos, donde no cabría con esta ventana y esta caché.
- Opciones de despliegue: exclusivamente TabbyAPI o ExLlamaV3. El autor indica de forma explícita que no funciona en Transformers, vLLM ni llama.cpp. Versión recomendada: ExLlamaV3 1.6.0 (no probado en versiones anteriores).
- Configuración de referencia en TabbyAPI: `max_seq_len: 262144`, `cache_size: 266240`, `cache_mode: 4,4`, `chunk_size: 1024`, `max_batch_size: 2`, `vision: true`, `tool_format: auto` y `draft_model: draft_mode: mtp`.
- Throughput y latencia: 155-167 tokens/s sin thinking, 142-144 tokens/s con thinking en modo `low`, 173-193 tokens/s con prompts de 4K y 9K tokens, y 48 tokens/s en la primera petición tras la carga. La aceleración proviene de MTP; sin él la familia rinde alrededor de 54 tokens/s en este mismo equipo.
- Ajuste de muestreo recomendado por Qwen: thinking con `temperature 1.0`, `top_p 0.95`, `top_k 20`; sin thinking con `temperature 0.7`, `top_p 0.8`, `top_k 20`. Mantener `min_p` en 0, penalización de repetición en 1.0 y DRY desactivado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / despliegue | Licencia | Notas |
|---|---|---|---|---|---|
| Este repositorio (sjoe1244, EXL3 4,00 bpw) | 27B denso según el autor | 262.144 tokens | safetensors EXL3; solo TabbyAPI o ExLlamaV3 | Apache 2.0 | 16,1 GB de descarga, 21 GB de VRAM en RTX 4090, visión y MTP a 4 bits |
| llmfan46/Qwen3.8-27B-Uncensored-Heretic-Native-MTP-Preserved | 27B denso | no disponible | safetensors BF16; sin `preprocessor_config.json` para visión | Apache 2.0 | Origen directo de esta cuantización; conserva la cabeza MTP nativa |
| Ryn1998/Qwen3.8-27B-Heretic-Abliterated-Uncensored-GGUF | 27B denso | no disponible | GGUF; ejecutable en llama.cpp u Ollama | no disponible | Variante abliterada doblemente refinada sobre `trohrbaugh/Qwen3.8-27B-heretic-ara`; el autor reporta un daño conductual bajo (KL ≈ 0,0085). No comparte la ruta de cuantización de este repositorio |
| OS-Software/Qwen3.8-27B-Uncensored-Heretic-v3 | 27B denso | no disponible | no disponible | no disponible | Otra variante abliterada de la misma familia, sin datos técnicos publicados en la información disponible |
| Qwen/Qwen3.8-27B | 27B denso | no disponible | safetensors oficiales | Apache 2.0 | Modelo original alineado, con visión de imagen y vídeo y control de thinking; es la referencia de licencia y de plantilla de preprocesado |

Comparación de rendimiento: no disponible. La información recopilada no incluye benchmarks comunes entre estas variantes, y las cifras de velocidad publicadas solo son válidas para este repo y este equipo.

## Limitaciones y advertencias

- No hay resultados de benchmarks estandarizados ni medición de la pérdida de calidad respecto al modelo de origen en BF16. El autor lo indica de forma explícita.
- Las pruebas fueron cortas: el prompt más largo usado fue de 9K tokens. La ventana de 262.144 tokens carga, pero no se llenó, por lo que el comportamiento en contextos muy largos (degradación, latencia y estabilidad de la caché KV) no está verificado.
- La torre de visión carga y encaja en el presupuesto de VRAM, pero no se ejecutó ninguna prueba con imágenes. Las capacidades visuales del modelo base no están validadas en esta cuantización.
- No se cronometró el modelo con MTP desactivado. El autor advierte además que las cifras son de una sola ejecución por prueba, sin repetición.
- Compatibilidad muy restringida: solo TabbyAPI o ExLlamaV3. No funciona en Transformers, vLLM ni llama.cpp, lo que limita su integración en infraestructuras estándar y obliga a mantener una versión concreta del motor (ExLlamaV3 1.6.0; no probado en anteriores).
- La cifra de parámetros de la barra lateral de HuggingFace (8.038.307.200) no corresponde al modelo real, según el autor. Cualquier automatización que lea ese campo obtendrá un dato erróneo.
- Al ser una variante "uncensored"/abliterated, el modelo reduce de forma deliberada sus rechazos ante peticiones dañinas. No incluye capa de seguridad alguna y no debe exponerse directamente a usuarios finales sin un filtrado externo de entrada y salida, ni usarse en dominios regulados sin evaluación propia.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad factual para esta variante ni para el modelo base desalineado. El modo `reasoning_effort: xhigh` puede generar miles de tokens de razonamiento, lo que incrementa coste y latencia.
- Idiomas soportados: no disponible. No hay información sobre cobertura multilingüe de esta variante.
- Licencia: Apache 2.0, heredada de Qwen/Qwen3.8-27B y del modelo de origen, por lo que el uso comercial está permitido. Aun así, el responsable del despliegue asume las obligaciones derivadas del uso de un modelo sin alineamiento de seguridad.
- Es un derivado de la comunidad, no una publicación oficial de Qwen. No hay garantía de mantenimiento, y el repositorio registra 0 descargas y 0 "likes" en el momento de redactar esta ficha.
- El autor advierte que la salida puede agotar límites de tokens en programas largos: una prueba de programa extenso alcanzó el tope de 3.000 tokens sin terminar.

## Enlaces

- Repositorio del modelo: https://huggingface.co/sjoe1244/Qwen3.8-27B-Uncensored-Heretic-exl3-4.00bpw-h4-vb4
- Modelo base (BF16, origen de la cuantización): https://huggingface.co/llmfan46/Qwen3.8-27B-Uncensored-Heretic-Native-MTP-Preserved
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Licencia de Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B/blob/main/LICENSE
- ExLlamaV3 (motor de inferencia y herramienta de conversión): https://github.com/turboderp-org/exllamav3
- TabbyAPI (servidor compatible): https://github.com/theroyallab/tabbyAPI
- Variante abliterada en GGUF: https://huggingface.co/Ryn1998/Qwen3.8-27B-Heretic-Abliterated-Uncensored-GGUF
- Otra variante abliterada de la familia: https://huggingface.co/OS-Software/Qwen3.8-27B-Uncensored-Heretic-v3
- Ficha de la variante v3 en abliteratedmodels.org: https://www.abliteratedmodels.org/qwen3.8-27b-uncensored-heretic-v3/
- Ficha de la variante Heretic Abliterated Uncensored en abliteratedmodels.org: https://www.abliteratedmodels.org/qwen3.8-27b-heretic-abliterated-uncensored/
- Guía de despliegue local de Qwen 3.8 27B sin censura (Ollama, MLX): https://github.com/Wassimyounes01/qwen38-uncensored

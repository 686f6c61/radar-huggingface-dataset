# Harsha001/Spark-X2.6-4B-ROCmFPX

## Resumen

Spark-X2.6-4B-ROCmFPX es una cuantización en formato GGUF del modelo Spark-X2.6-4B, desarrollado originalmente por XHToken, publicada por el usuario Harsha001. Se distribuye en dos variantes generadas con el fork ROCmFPX, una bifurcación de llama.cpp orientada a hardware AMD que incorpora tipos de peso de bajo bit propios para los backends Vulkan y HIP/ROCm. El objetivo es ofrecer una inferencia eficiente en GPUs y APUs AMD, con mención explícita al objetivo `gfx1151` (Strix Halo).

El modelo base es denso, con 4.112.079.360 parámetros (unos 4,11 mil millones), licencia Apache-2.0 y soporte declarado de inglés y chino. La cuantización incluye una matriz de importancia (imatrix) calculada sobre 200 fragmentos de entrenamiento de WikiText-2 y se publica junto a métricas de perplejidad y divergencia KL frente al modelo BF16.

La relevancia de esta ficha es doble: por un lado documenta una alternativa de bajo bit para el ecosistema AMD, tradicionalmente menos cubierto que el de NVIDIA; por otro, advierte de una limitación crítica, y es que los ficheros solo cargan en el fork ROCmFPX y no en llama.cpp estándar, LM Studio ni Ollama. No se dispone de información sobre la longitud de contexto, los datos de entrenamiento ni benchmarks estándar del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el fork ROCmFPX identifica la arquitectura del modelo base como `spark2_5`; no se detalla si es transformer denso, MoE o híbrida) |
| Parametros totales | 4.112.079.360 (aproximadamente 4,11 mil millones) |
| Parametros activos | no disponible (no se indica que el modelo sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | `Q8_0_ROCMFPX` (8 bits, 4,2 GB) y `Q4_0_ROCMFP4` (4 bits, 2,8 GB), ambas generadas con `llama-quantize --imatrix` |
| Idiomas soportados | inglés (`en`) y chino (`zh`) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF, con tipos de peso específicos del fork ROCmFPX (no compatibles con GGUF estándar) |
| Modelo base | XHToken/Spark-X2.6-4B (relación: quantized) |
| Tamaño del repositorio | 7,0 GB (dos ficheros GGUF) |
| Backend soportado | Vulkan (`-DGGML_VULKAN=ON`) y HIP/ROCm (`-DGGML_HIP=ON -DAMDGPU_TARGETS=gfx1151`) sobre el fork ROCmFPX |
| Plantilla de chat | la propia del modelo base, con modo *thinking* activado por defecto |

## Arquitectura y entrenamiento

No se documenta en la información disponible la arquitectura interna del modelo base Spark-X2.6-4B (tipo de bloque, número de capas, mecanismo de atención, composición del dataset o si hubo fases de RLHF/DPO). El único dato arquitectónico explícito es la etiqueta `spark2_5` que utiliza el fork ROCmFPX para cargar los pesos, lo que indica que el modelo requiere un soporte de arquitectura añadido respecto a las variantes estándar de llama.cpp. La presencia de una plantilla de chat con modo *thinking* activable sugiere un modelo ajustado para razonamiento conversacional, aunque no se aporta confirmación técnica.

El proceso de cuantización sí está detallado: (1) conversión a GGUF en BF16 con el script `convert_hf_to_gguf.py` de llama.cpp upstream en el commit `f849095`, ya que el conversor propio del fork (`fb08d7c`) todavía no soporta `spark2_5`; (2) cálculo de la matriz de importancia a partir de los pesos originales sobre 200 fragmentos de entrenamiento de WikiText-2, ejecutado sobre una copia en F32 del fichero BF16 para acelerar el proceso en CPU; (3) cuantización con `llama-quantize --imatrix` del fork, una ejecución por tipo; (4) evaluación de perplejidad y divergencia KL en backend de CPU, con una prueba de chat corta por fichero antes de la subida.

## Capacidades

- Generación de texto y conversación multi-turno en inglés y chino, con plantilla de chat propia del modelo base.
- Modo *thinking* (razonamiento extendido) activado por defecto; se puede desactivar con `--chat-template-kwargs '{"enable_thinking": false}'` al lanzar `llama-server`.
- Inferencia cuantizada de 8 y 4 bits con tipos de peso específicos para hardware AMD vía Vulkan o HIP/ROCm.
- Etiqueta `endpoints_compatible` en el repositorio, que apunta a compatibilidad con endpoints de tipo OpenAI servidos por `llama-server` (no se detalla el alcance exacto).
- Ejecución en CPU y en APUs/GPUs AMD; los ficheros son autocontenidos y no requieren el checkpoint BF16.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni otras modalidades.
- No se declara soporte de español ni de otros idiomas distintos de `en` y `zh`.

## Casos de uso

- Despliegue local en APUs AMD Strix Halo (`gfx1151`): la variante `Q4_0_ROCMFP4` ocupa 2,8 GB, por lo que se puede mantener residente en memoria unificada junto al resto del sistema y servir un asistente conversacional sin GPU dedicada, compilando el fork con `-DGGML_HIP=ON`.
- Prototipado de asistentes bilingües inglés-chino: el modelo declara ambos idiomas y una plantilla de chat con modo *thinking*, adecuada para probar flujos de respuesta razonada en entornos de investigación sin depender de APIs externas.
- Evaluación interna de esquemas de cuantización de bajo bit: el repositorio publica KLD y coincidencia de top-1 frente a BF16, de modo que un equipo puede usar estas dos variantes como referencia para decidir si su pipeline tolera 4 bits en lugar de 8.
- Inferencia sobre Vulkan en GPUs AMD de gama media: al compilar con `-DGGML_VULKAN=ON` se evita la dependencia del stack ROCm completo, lo que simplifica el despliegue en estaciones de trabajo con drivers genéricos.
- Procesamiento por lotes de texto fuera de línea: con 2,8 GB de pesos, el modelo cabe en equipos con 8 GB de RAM y permite clasificación, resumen o generación de borradores en local sin conexión.
- Comparación de fidelidad de cuantizaciones en investigación: las métricas publicadas (KLD 0,1267 y 84,72 % de mismo top para `Q4_0_ROCMFP4`) permiten contrastar el comportamiento de tipos propietarios frente a `Q4_K_M` estándar (KLD 0,2104, 80,13 %) en un mismo modelo.
- Servicio HTTP compatible con clientes de tipo OpenAI: mediante `llama-server` con `--jinja` se puede exponer el modelo en red local para integraciones que ya consuman la API de OpenAI, siempre que el backend sea el fork ROCmFPX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor únicamente reporta métricas de fidelidad de cuantización sobre WikiText-2 (100 fragmentos de 512 tokens, backend de CPU), comparando cada variante con el modelo BF16 original:

| Modelo | Perplejidad | KLD (menor es mejor) | Mismo top-1 | Tamaño |
|---|---:|---:|---:|---:|
| BF16 (original) | 23,0696 | 0 | 100 % | no disponible |
| `Q8_0_ROCMFPX` | 22,6619 | 0,0208 | 93,49 % | 4,2 GB |
| `Q4_0_ROCMFP4` | 22,4672 | 0,1267 | 84,72 % | 2,8 GB |
| `Q8_0` estándar (solo comparación) | 23,2565 | 0,0049 | 97,01 % | no disponible |
| `Q4_K_M` estándar (solo comparación) | 28,5549 | 0,2104 | 80,13 % | no disponible |

Lectura de la tabla según el propio autor: una perplejidad ligeramente inferior a la del original no implica mejor cuantización; KLD y mismo top-1 miden la fidelidad respecto a BF16. En ese eje, `Q4_0_ROCMFP4` se acerca más al original que `Q4_K_M` estándar con un tamaño similar, mientras que `Q8_0_ROCMFPX` queda algo más lejos que `Q8_0` estándar. Los cinco ficheros respondieron correctamente a la misma prueba de chat. No se aportan datos de latencia ni de throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 5-6 GB para `Q8_0_ROCMFPX` (4,2 GB de pesos más caché KV y overhead) y alrededor de 3,5-4,5 GB para `Q4_0_ROCMFP4` (2,8 GB de pesos). Son estimaciones de cálculo, no cifras publicadas por el autor.
- GPU recomendadas: APUs y GPUs AMD con soporte HIP/ROCm (el autor cita explícitamente `gfx1151`, Strix Halo) o cualquier GPU con backend Vulkan funcional. No se documenta el rendimiento en GPUs NVIDIA.
- Cabe en GPU de consumo: sí. La variante de 4 bits es viable en tarjetas de 6-8 GB e incluso en sistemas con memoria unificada de 8 GB; la de 8 bits encaja en 8 GB con contexto moderado.
- Opciones de despliegue: exclusivamente el fork ROCmFPX (`https://github.com/charlie12345/ROCmFPX`), compilando `llama-server` con `-DGGML_VULKAN=ON` o con `-DGGML_HIP=ON -DAMDGPU_TARGETS=gfx1151`. No funciona en llama.cpp estándar, LM Studio, Ollama, vLLM ni TGI.
- Comando de referencia del autor: `build/bin/llama-server -m Spark-X2.6-4B-Q4_0_ROCMFP4.gguf -ngl 999 -fa on --jinja`.
- Latencia y throughput: no disponibles. Las mediciones de calidad se realizaron en CPU, sin cifras de tokens por segundo.

## Comparativa con modelos similares

No se dispone de datos verificables de otros modelos de 4 mil millones de parámetros en la información proporcionada, por lo que la comparación se limita a las variantes del propio Spark-X2.6-4B:

| Modelo | Parametros | Contexto | Tamano | KLD | Mismo top-1 | Licencia | Disponibilidad |
|---|---|---|---:|---:|---:|---|---|
| Spark-X2.6-4B (BF16) | 4,11 B | no disponible | no disponible | 0 | 100 % | Apache-2.0 | HuggingFace (XHToken) |
| Spark-X2.6-4B `Q8_0_ROCMFPX` | 4,11 B | no disponible | 4,2 GB | 0,0208 | 93,49 % | Apache-2.0 | solo fork ROCmFPX |
| Spark-X2.6-4B `Q4_0_ROCMFP4` | 4,11 B | no disponible | 2,8 GB | 0,1267 | 84,72 % | Apache-2.0 | solo fork ROCmFPX |
| `Q8_0` estándar (referencia) | 4,11 B | no disponible | no disponible | 0,0049 | 97,01 % | Apache-2.0 | llama.cpp estándar |
| `Q4_K_M` estándar (referencia) | 4,11 B | no disponible | no disponible | 0,2104 | 80,13 % | Apache-2.0 | llama.cpp estándar |

## Limitaciones y advertencias

- Compatibilidad restringida: los ficheros solo cargan en el fork ROCmFPX. llama.cpp estándar, LM Studio y Ollama no reconocen estos tipos de peso, lo que bloquea su uso en la mayoría de herramientas del ecosistema.
- Cobertura lingüística limitada: solo se declaran inglés y chino; no hay soporte documentado de español, lo que desaconseja su uso en producción en castellano sin una evaluación previa.
- Falta de información sobre el modelo base: no se publican longitud de contexto, volumen de tokens de entrenamiento, composición del dataset ni proceso de alineación, lo que impide estimar su comportamiento fuera del dominio evaluado.
- Pérdida de fidelidad en 4 bits: `Q4_0_ROCMFP4` coincide con BF16 en el 84,72 % de los siguientes tokens (KLD 0,1267), frente al 93,49 % de la variante de 8 bits. En tareas sensibles a la precisión conviene usar `Q8_0_ROCMFPX`.
- Evaluación limitada: las métricas provienen únicamente de WikiText-2 en inglés y sobre backend de CPU; no hay datos de razonamiento, código ni matemáticas.
- Riesgo de alucinación no medido: no se han publicado evaluaciones de veracidad ni de sesgos para este modelo ni para su base.
- Madurez del artefacto: el repositorio registra 0 descargas y 1 like en el momento de la consulta, sin validación por parte de la comunidad.
- Atribución: la cuantización la publica Harsha001; todos los créditos del modelo corresponden a XHToken. Cualquier incidencia de calidad debe contrastarse con el modelo base.
- Licencia: Apache-2.0 permite uso comercial y modificación, pero conviene verificar los términos del modelo base y de los pesos originales antes de un despliegue en producción.
- Fechas de metadatos: la creación del repositorio figura como 2026-10-21, dato que conviene contrastar con el repositorio del modelo base.

## Enlaces

- Repositorio HuggingFace de la cuantización: https://huggingface.co/Harsha001/Spark-X2.6-4B-ROCmFPX
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-4B
- Fork ROCmFPX (llama.cpp con tipos de bajo bit para AMD): https://github.com/charlie12345/ROCmFPX

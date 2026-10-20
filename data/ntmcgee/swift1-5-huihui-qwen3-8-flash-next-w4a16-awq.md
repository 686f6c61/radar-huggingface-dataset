# ntmcgee/Swift1.5-Huihui-Qwen3.8-Flash-Next-W4A16-AWQ

## Resumen

Este repositorio no es un modelo entrenado desde cero, sino un *merge* de precisión mixta publicado por el usuario ntmcgee que recombina tres artefactos ya existentes de la familia Qwen3.8-Flash-Next: la cuantización AWQ INT4 calibrada de UkisAI (`ukisai/Swift-1.5-Qwen3.8-Flash-Next-W4A16-AWQ`), la cabeza MTP en INT4 del build Merlin de halt95 y la eliminación de rechazos (abliteration) de huihui-ai. El resultado es un checkpoint de 180.833.599.379 parámetros (según safetensors) que cabe en cuatro RTX 3090 (96 GB en total) manteniendo la ventana de contexto completa de 262.144 tokens. Ningún peso fue recalculado: solo se recomputaron 48 tuplas de empaquetado de proyecciones de atención, cuantizadas desde los originales BF16 de huihui-ai.

El interés técnico está en la ingeniería de despliegue más que en el modelo en sí. La model card documenta con detalle el proceso: grupo 0 de cuantización W4A16 asimétrica g128 (pack-quantized, INT4, kernel Marlin) para el backbone y los expertos enrutados, grupo 1 simétrico g128 exclusivamente para `mtp.layers.*.mlp.experts.*` (la cabeza de draft para decodificación especulativa), y una tabla PLE de n-gramas de 51.200 millones de parámetros en BF16 repartida en 128 shards. El objetivo declarado es sustituir el empaquetado simétrico sin calibrar del build Merlin, que según sondeos emparejados de la comunidad perdía precisión en preguntas difíciles (19/40 frente a 26/40 en GPQA-Diamond) y generaba salidas unas tres veces más largas.

Es relevante ahora porque ejemplifica una tendencia: checkpoints "compuestos" que ensamblan calibración, draft heads y modificaciones de alineamiento de distintas fuentes para ajustarse a presupuestos de VRAM concretos (4×24 GB Ampere), en lugar de re-cuantizar y perder la calibración. Como contrapartida, exige un fork específico del motor vLLM (`Swift-flash v2.5.2`), tiene licencia propia no estándar y, en el momento de redactar esta ficha, cero descargas y cero *likes*.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) y atención híbrida; la model card menciona módulos QSA (`o_proj`), GDN (`out_proj`), *hyper-connections*, *indexer* y expertos compartidos, además de una cabeza MTP para decodificación especulativa |
| Parámetros totales | 180.833.599.379 (dato real de safetensors); incluye una tabla PLE de n-gramas de 51.200 millones de parámetros en BF16 |
| Parámetros activos | No disponible (la model card no publica el número de expertos enrutados activos por token) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | W4A16 AWQ INT4 asimétrica g128 (pack-quantized, Marlin) para backbone y expertos enrutados; W4A16 INT4 simétrica g128 solo para `mtp.layers.*.mlp.experts.*`; BF16 para routers, expertos compartidos, hyper-connections, indexer, proyecciones de entrada GDN, PLE, visión, embeddings y tensores MTP no-expertos; caché KV en FP8 |
| Idiomas soportados | Inglés (`en`) |
| Licencia | `swift-open-license-1.0` (etiquetada como `license: other`; el texto completo está en el fichero `LICENSE` del repositorio y no se detalla en la información disponible) |
| Formato de pesos | safetensors con `compressed-tensors` (pack-quantized); 19 shards `model-0000*-of-00019.safetensors`, shards `embedding-model-*` para la tabla PLE y `model_mtp.safetensors` (1.410 MiB, 4.637 tensores) |

## Arquitectura y entrenamiento

No hay entrenamiento en este repositorio. Es un ensamblaje determinista de tres publicaciones previas: el backbone y los expertos enrutados provienen byte a byte de la cuantización AWQ calibrada de UkisAI; la tabla PLE n-grama (geometría `[2500012, 160]` × 128 shards) también es idéntica a la de esa release; la cabeza MTP se toma del paquete `mtp-routed-experts-int4.safetensors` distribuido con el build Merlin de halt95; y los 112 tensores de abliteration vienen de los BF16 originales de huihui-ai. Los únicos tensores nuevos son 48 tuplas de empaquetado correspondientes a 12 módulos QSA `o_proj` y 36 GDN `out_proj`, cuantizadas con el mismo esquema asimétrico grupo-128 (`memoryless_minmax`, escalas en BF16) que UkisAI aplica a sus proyecciones de atención. Los 48 `shared_expert.down_proj` se sustituyen directamente en BF16.

La innovación destacable es la convivencia de dos grupos de cuantización distintos en un mismo `quantization_config`: el grupo 0 aplica INT4 asimétrico con lista de exclusión, y el grupo 1 aplica INT4 simétrico solo a los expertos del MTP. La model card advierte explícitamente de que la ausencia de tensores de punto cero en esos módulos es intencionada y no debe "corregirse". Además, `text_config.ple_embedding_dtype` es `bfloat16`, lo que rompe con vLLM upstream: el serializador estándar solo short-circuita tablas PLE en `float8_e4m3fn`, por lo que se requiere un motor con la rama BF16-PLE (el fork v2.5.x de Flash-Next la incluye).

El apartado de verificación documenta un control de integridad razonablemente riguroso: SHA-256 de los 51 ficheros de andamiaje contra el `FILE_MANIFEST.json` original (65 de 66 coincidencias; la única discrepancia es el README, editado por la organización upstream después de cortar el manifiesto), auditoría del índice completo con 301.548 entradas y 0 irresolubles, comprobación de límites (fin de cabecera + offset máximo ≤ tamaño de fichero) en todos los shards, y autocomprobación del formato de cuantización sobre 75.420 módulos empaquetados. `EDITED_TENSORS.txt` y `MERGE_MANIFEST.json` actúan como fuentes autoritativas de procedencia.

## Capacidades

- Generación de texto y razonamiento multi-paso en inglés, con contexto efectivo de hasta 262.144 tokens.
- Razonamiento de tipo *thinking* heredado del modelo base Qwen3.8-Flash-Next (la model card no detalla modos, pero la familia se etiqueta como `qwen3.8` y el checkpoint conserva "reasoning head intact and int4").
- Procesamiento de imagen y texto: el pipeline declarado es `image-text-to-text`; los tensores de visión permanecen en BF16 dentro de la lista de exclusión de cuantización.
- Decodificación especulativa con cabeza MTP propia (INT4 simétrica) configurada con K=3 probabilístico en el motor de referencia.
- Caché KV en FP8, lo que permite sostener el contexto completo de 262.144 tokens en 96 GB de VRAM total.
- Capacidad de *tool calling* / *function calling* y uso como agente: no documentada explícitamente en la información disponible, aunque es esperable en la familia Qwen3.8; tratar como no verificada.
- Modelo "abliterated" / *uncensored*: se han eliminado los mecanismos de rechazo mediante la sustitución de 112 tensores de peso, orientado a investigación de alineamiento y *red-teaming*.
- Multilingüe: limitado a inglés según el campo `language`; no hay evidencia de capacidades en castellano.

## Casos de uso

- Análisis de documentación técnica extensa en inglés: el modelo puede ingerir manuales, especificaciones o expedientes completos de hasta 262.144 tokens en una sola pasada, lo que evita pipelines de recuperación fragmentada cuando el corpus cabe en contexto.
- Auditoría de repositorios de código completos: con la ventana máxima se pueden cargar árboles de proyecto enteros y pedir revisión cruzada de dependencias, algo que los modelos de 32K-128K no permiten sin trocear.
- Investigación en alineamiento y seguridad: la versión abliterated permite estudiar respuestas sin los rechazos del modelo original, útil para construir conjuntos de evaluación de *jailbreak* y analizar qué representaciones internas codifican la negativa.
- Servicio on-premise con hardware de segunda mano: cuatro RTX 3090 (96 GB) a 21,3-22,0 GiB por tarjeta es un presupuesto alcanzable para laboratorios y pymes que no acceden a H100, manteniendo el contexto completo.
- Razonamiento científico asistido: el sondeo GPQA-Diamond citado en la model card sugiere que la calibración AWQ conserva mejor el rendimiento en preguntas de posgrado que el empaquetado simétrico; adecuado para prototipos de asistencia a investigadores.
- Inferencia de alta concurrencia con contexto largo: la combinación de FP8 KV, expert parallelism y decodificación especulativa MTP K=3 está pensada para servir varias sesiones simultáneas con ventanas grandes, no para un único chat.
- Experimentación con arquitecturas híbridas: al exponer módulos QSA, GDN, *hyper-connections* e *indexer* con nombres accesibles, sirve para estudiar el comportamiento de atención lineal/híbrida frente a atención completa en tareas de contexto largo.
- Generación de texto con economía de tokens: la model card reporta salidas aproximadamente tres veces más cortas que el build Merlin para las mismas respuestas, lo que reduce coste por consulta en pipelines de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks completos en la información disponible. El único dato numérico es un sondeo emparejado sobre GPQA-Diamond que la model card atribuye a la comunidad, comparando el empaquetado simétrico sin calibrar (build Merlin) con la cuantización calibrada de UkisAI:

| Prueba | Build simétrico sin calibrar (Merlin) | Cuantización AWQ calibrada (UkisAI) | Notas |
|---|---|---|---|
| GPQA-Diamond, sondeo emparejado | 19/40 | 26/40 | Dato citado de sondeos de la comunidad; no es un benchmark publicado con protocolo detallado ni se especifica el tamaño de muestra más allá de los 40 ítems |
| Longitud de salida para las mismas respuestas | ~3× más larga | Referencia | Observación cualitativa de la model card, sin métrica formal |

No hay cifras de MMLU, HumanEval, GSM8K, throughput ni latencia por token. Cualquier comparación numérica adicional en este repositorio sería inventada.

## Requisitos de hardware

- VRAM estimada: 96 GB en total, medidos a 21,3-22,0 GiB por tarjeta en la configuración validada (4× RTX 3090).
- GPU validadas: 4× NVIDIA RTX 3090 (Ampere, SM86). Es la única configuración con datos empíricos en la model card.
- GPU recomendadas: no disponible para A100/H100; la cuantización de origen (UkisAI) fue validada en H100 TP4, pero este merge concreto no reporta pruebas en esa plataforma.
- ¿Cabe en consumer GPU? Sí, pero solo agregando cuatro RTX 3090. No cabe en una única tarjeta de consumo: el repositorio pesa 174,1 GB y la tabla PLE sola ocupa 51.200 millones de parámetros en BF16.
- Opciones de despliegue: únicamente vLLM con la rama BF16-PLE, en la práctica el fork `Swift-flash v2.5.2` (`swift15-merlin:v2.5.2`) del repositorio `halt95/qwen38-flash-next-3090s`. vLLM upstream rechaza serializar la tabla PLE en BF16. No hay soporte documentado para llama.cpp, Ollama ni TGI (el formato `compressed-tensors` pack-quantized con kernel Marlin lo impide).
- Configuración de referencia: TP2 × PP2 + expert parallel, `--kv-cache-memory 1.95e9`, `--max-model-len 262144`, caché KV FP8, MTP K=3 probabilístico, rama PLE en BF16 leyendo la tabla de n-gramas desde NVMe con ventana caliente en proceso.
- Arranque: ~210 s con caché de compilación en caliente.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (ntmcgee) | 180,8 B | 262.144 | W4A16 AWQ asimétrica + INT4 simétrica MTP + FP8 KV | `swift-open-license-1.0` | 0 descargas, 0 likes; repo de 174,1 GB |
| `ukisai/Swift-1.5-Qwen3.8-Flash-Next-W4A16-AWQ` | No disponible | 262.144 (heredado) | W4A16 AWQ INT4 asimétrica g128 calibrada; MTP en BF16 fusionado | No disponible | Fuente del backbone; validado en H100 TP4 |
| `halt95/Swift1.5-Qwen3.8-Flash-Next-W4A16-Merlin` | No disponible | No disponible | W4A16 simétrica sin calibrar; MTP INT4; proyecciones de atención en BF16 | No disponible | Build previo para el mismo stack de 4×3090; peor precisión reportada en GPQA-Diamond y salidas ~3× más largas |
| `huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated` | No disponible | No disponible | BF16 | No disponible | Fuente de la abliteration (112 tensores) |
| `Qwen/Qwen3.8-Flash-Next` | No disponible | No disponible | Original (BF16/FP8, no especificado) | No disponible | Modelo base de toda la familia |

La comparación relevante es frente al build Merlin: mismo hardware objetivo y misma familia, pero este merge aporta calibración AWQ, cabeza MTP en INT4 (menos VRAM) y abliteration, a cambio de depender de un fork concreto del motor y de una licencia propia. Frente al modelo original de Qwen, la diferencia es de empaquetado y modificación de alineamiento, no de capacidad base.

## Limitaciones y advertencias

- Modelo "abliterated": se han eliminado deliberadamente los mecanismos de rechazo. No es apto para aplicaciones de cara al público sin una capa de moderación externa; puede producir contenido dañino, ilegal o sesgado.
- La abliteration se aplica sobre 112 tensores y puede degradar capacidades generales respecto al modelo original; no se han publicado evaluaciones que cuantifiquen esa pérdida.
- Riesgo de alucinación estándar en modelos de lenguaje, agravado por la cuantización INT4 y sin benchmarks de fidelidad publicados.
- Solo inglés declarado. No hay evidencia de calidad en castellano ni en otros idiomas; no usar en producción multilingüe sin evaluar.
- Licencia `swift-open-license-1.0` etiquetada como `other`: los términos de uso comercial no están detallados en la información disponible. Es imprescindible leer el fichero `LICENSE` del repositorio y verificar la compatibilidad con las licencias de los tres modelos base antes de cualquier despliegue comercial.
- Dependencia dura de un fork no oficial de vLLM. vLLM upstream no puede serializar la tabla PLE en BF16, así que el checkpoint no arranca en la pila estándar. Esto crea riesgo de mantenimiento a medio plazo.
- La configuración de cuantización tiene dos grupos y una lista de exclusión muy específica; manipulaciones aparentemente inocuas (por ejemplo, añadir tensores de punto cero a los expertos del MTP) rompen el formato.
- Modelo con 0 descargas y 0 likes: sin validación independiente de la comunidad. La verificación descrita la realiza el propio autor del merge.
- La tabla PLE ocupa 51.200 millones de parámetros en BF16 y se lee desde NVMe con ventana caliente en proceso: el rendimiento depende críticamente del almacenamiento y no de la GPU. Un disco lento degradará la latencia de forma severa.
- Repositorio de 174,1 GB: requisitos de almacenamiento y tiempos de transferencia considerables.
- Sin datos de latencia, throughput ni comportamiento bajo concurrencia.

## Enlaces

- HuggingFace (este checkpoint): https://huggingface.co/ntmcgee/Swift1.5-Huihui-Qwen3.8-Flash-Next-W4A16-AWQ
- Fuente del backbone cuantizado: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-Flash-Next-W4A16-AWQ
- Modelo Swift 1.5 de UkisAI (cabeza MTP): https://huggingface.co/ukisai/Swift1.5-Qwen3.8-Flash-Next
- Build Merlin (origen del paquete MTP INT4): https://huggingface.co/halt95/Swift1.5-Qwen3.8-Flash-Next-W4A16-Merlin
- Modelo abliterated de huihui-ai: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Motor de inferencia (fork vLLM, Swift-flash v2.5.2): https://github.com/halt95/qwen38-flash-next-3090s

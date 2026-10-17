# hardhant/Qwen3.8-Flash-Next-FP4-Local-Strata

## Resumen

Este repositorio no contiene un modelo nuevo, sino una conversión de formato del checkpoint `nvidia/Qwen3.8-Flash-Next-FP4-Local` (revisión `b9ce18a`) para el runtime Strata. El autor, `hardhant`, parte de la versión NVFP4 con destilación consciente de cuantización publicada por NVIDIA y la reempaqueta con la herramienta `tools/nvfp4_csf_convert.py` del PR #2727 de Strata, de modo que los expertos enrutados conservan sus códigos y escalas NVFP4 y la tabla PLE de n-gramas se decodifica a BF16. El resultado son ficheros que solo carga Strata: no funcionan en transformers, vLLM ni llama.cpp.

El modelo base es un transformer MoE de 51.200.245.760 parámetros totales (dato de safetensors del repositorio) con una tabla PLE por capa de 51.200 millones de valores, la pieza que da sentido al apellido "FP4-Local". La ventana de contexto configurada en los ejemplos de ejecución es de 524.288 tokens con rope-scaling yarn, caché KV en int8 y decodificación especulativa mediante la cabeza MTP. Incluye además el proyector de imágenes del modelo original, por lo que acepta entradas multimodales.

Su relevancia es acotada pero clara: demuestra que un MoE de ~51B cuantizado en NVFP4 puede servirse en una estación de trabajo con dos GPU (una V100 de 32 GB y una RTX 3090) y 91 GB de RAM, leyendo la tabla PLE directamente del SSD durante la decodificación. El precio es un acoplamiento total al runtime Strata y un consumo de disco de 244 GB en NVMe. El único dato de rendimiento publicado por el autor es GPQA: 91,5 % para el checkpoint NVFP4 frente al 92,2 % del original en BF16.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (expertos enrutados en NVFP4) con tabla PLE de n-gramas por capa; conversión de un checkpoint NVFP4 QAD de NVIDIA |
| Parámetros totales | 51.200.245.760 (~51,2 mil millones), según safetensors del repositorio |
| Parámetros activos | no disponible |
| Longitud de contexto | 524.288 tokens (`--max-context 524288`, `--rope-scaling yarn`, `--rope-scale 2`) |
| Tipos de cuantización | NVFP4 en expertos enrutados (códigos y escalas comprimidas en formato csf), BF16 en proyecciones densas, cabecera, tabla PLE y embeddings de tokens; caché KV en int8 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF propio de Strata (`qwen-fp4local-csf-dense.gguf`), GGUF BF16 para PLE y embeddings de tokens, pack binario de runtime (`experts.bin`, `dense.bin`), cabeza MTP en `mtp/rt`, proyector de visión en GGUF (`mmproj`) |
| Modelo base | `nvidia/Qwen3.8-Flash-Next-FP4-Local`, revisión `b9ce18a` |
| Runtime compatible | exclusivamente Strata (verificado con 0.1.44.1); no carga en transformers, vLLM ni llama.cpp |
| Tamaño del repositorio | 248,8 GB (244 GB de descarga real) |

## Arquitectura y entrenamiento

El modelo base es un MoE con expertos enrutados cuantizados en NVFP4 y el resto de componentes (proyecciones densas, cabecera, embeddings) en BF16. La peculiaridad arquitectónica es la tabla PLE (*per-layer embeddings*) de n-gramas, con 51.200 millones de valores, que el checkpoint original almacena también en NVFP4. En esta conversión, los expertos mantienen sus códigos y escalas NVFP4 —con el flujo de escalas `byte-window4-fixed-stream-u24-exceptions/1` decodificado de forma bit-exacta y verificado por fuzzing contra el codificador de referencia—, mientras que la tabla PLE se decodifica a BF16 por bloques de filas y se sirve mediante el lector PLE estándar de Strata.

El entrenamiento original corresponde a NVIDIA: una destilación consciente de cuantización (QAD) hacia NVFP4 desde un modelo en BF16, cuyo único dato numérico publicado en la model card es la caída en GPQA (91,5 % frente a 92,2 %). No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO. La conversión añade dos componentes de inferencia: una cabeza MTP (*multi-token prediction*) para decodificación especulativa, invocada con `--spec 6 --spec-min-p 0.5`, y un proyector de imágenes heredado sin cambios del modelo base. El autor indica que la conversión excluye visión y MTP por diseño y que ambos ficheros se copian tal cual.

## Capacidades

- Generación de texto y razonamiento: el checkpoint base obtiene 91,5 % en GPQA según NVIDIA, lo que sitúa el razonamiento científico de nivel experto como su capacidad mejor documentada.
- Procesamiento de contexto largo: ventana configurada de 524.288 tokens con rope-scaling yarn (factor 2), pensada para documentos y conversaciones extensas.
- Visión: incluye `mmproj-Qwen3.8-Flash-Next-BF16.gguf` (0,91 GB), el proyector de imágenes del modelo base, activable con `--vision`.
- Decodificación especulativa: cabeza MTP en `mtp/rt` (786 MB) que acelera la generación aceptando hasta 6 tokens candidatos con umbral de probabilidad 0,5.
- Servido como API: Strata expone endpoints compatibles con OpenAI y Anthropic, con configuración declarativa en JSON y tokenizer propio.
- Gestión de memoria en inferencia: caché KV cuantizada en int8 con 32.768 tokens residentes (`--kv-resident 32768`) y crecimiento desactivado (`--no-kv-grow`).
- Tool calling / function calling: no documentado en la información disponible.
- Capacidades de agente y razonamiento multi-paso: no documentadas en la información disponible.
- Soporte multilingüe: no disponible.
- Modo *thinking* o razonamiento explícito: no documentado en la información disponible.

## Casos de uso

- Despliegue local de un MoE de ~51B en hardware de estación de trabajo: la configuración verificada (V100 32 GB + RTX 3090, 91 GB de RAM, reparto por capas) permite servir el modelo sin depender de la nube, con los expertos residentes en RAM y las proyecciones densas en GPU.
- Procesamiento de documentación técnica extensa: con 524.288 tokens de contexto se pueden ingerir manuales, expedientes o bases de código completas en una sola pasada sin troceado ni recuperación externa.
- Análisis de imágenes con el proyector multimodal: añadiendo `--vision` y el `mmproj` se pueden describir capturas, digitalizar documentos escaneados o inspeccionar diagramas dentro del mismo flujo de generación.
- Integración como backend compatible con OpenAI/Anthropic: al exponer esas APIs, Strata permite apuntar aplicaciones existentes al modelo cambiando únicamente la URL base y el nombre del modelo, sin reescribir clientes.
- Custodia de datos sensibles: al ejecutarse íntegramente en local, encaja en entornos con requisitos de soberanía del dato (sanitario, legal, industrial) donde enviar el contexto a una API externa no es viable.
- Investigación sobre cuantización NVFP4 y decodificación especulativa: el repositorio incluye manifiestos, checksums y el script de conversión, lo que permite reproducir el pipeline (`tools/iq_pack.py`, ~4 minutos para reconstruir el pack) y medir el impacto de la cuantización frente al BF16.
- Evaluación comparativa de razonamiento: la diferencia de 0,7 puntos en GPQA frente al original en BF16 lo convierte en un banco de pruebas útil para estudiar la degradación introducida por QAD en tareas de razonamiento científico.
- Laboratorio de inferencia con desalojo a disco: la lectura de la tabla PLE desde NVMe en tiempo de decodificación sirve para estudiar arquitecturas de memoria jerárquica y su impacto en latencia, con variables de entorno dedicadas al watchdog (`STRATA_WATCHDOG_S`, `STRATA_SSD_KEEPALIVE_WINDOW`).

## Benchmarks y rendimiento

| Benchmark | Checkpoint NVFP4 QAD (este modelo) | Original en BF16 | Diferencia |
|---|---|---|---|
| GPQA | 91,5 % | 92,2 % | -0,7 pp |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks en la información disponible. Los datos de GPQA proceden de las cifras que NVIDIA publica para el checkpoint base y se reproducen en la model card de esta conversión.

## Requisitos de hardware

- RAM: la arena de expertos ocupa 63,28 GiB, idéntica a la de la release NVFP4 GPTQ del modelo base. El autor solo ha medido en un equipo con 91 GB de RAM; la release GPTQ de referencia mide 69 GiB en uso sobre un PC de 128 GB, por lo que 128 GB es el entorno recomendado.
- Disco: 244 GB descargados, obligatoriamente en NVMe. Cada arranque lee los expertos y la tabla PLE se lee del SSD durante la decodificación, de modo que un disco lento degrada directamente el throughput.
- GPU verificadas: Tesla V100 de 32 GB (sm_70) junto a una RTX 3090 (sm_86), con CUDA 12.8 y reparto de capas entre ambas. El autor indica que también funciona con una sola tarjeta sin reparto por capas, aunque no detalla en cuál.
- VRAM estimada: no disponible. La huella depende del reparto de capas elegido y el autor no publica cifras por dispositivo.
- ¿Cabe en GPU de consumo? No en una sola: la configuración medida combina dos GPU y 91 GB de RAM del sistema. Una RTX 3090 sola no alberga el modelo; se requiere el desalojo de expertos a RAM.
- Opciones de despliegue: exclusivamente Strata, en build para CUDA 12.8 (Windows y Linux; también soporta una tarjeta AMD según el proyecto). No hay soporte para vLLM, llama.cpp, Ollama ni TGI: los ficheros están en formatos propios del runtime.
- Throughput y latencia: no disponibles. Solo se menciona que la reconstrucción del pack tarda unos 4 minutos y que las lecturas de la PLE en frío pueden requerir ampliar el watchdog a 300 segundos.
- Ajustes de ejecución relevantes: `--kv int8`, `--kv-resident 32768`, `--no-kv-grow`, `--expert-cache auto`, `--expert-profile data/expert-profile.bin`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repositorio (Strata, NVFP4 csf) | 51,2 B totales; activos no disponible | 524.288 tokens | GPQA 91,5 % | no disponible | Solo runtime Strata; 0 descargas, 0 likes |
| `nvidia/Qwen3.8-Flash-Next-FP4-Local` (checkpoint base NVFP4 QAD) | no disponible | no disponible | GPQA 91,5 % | no disponible | HuggingFace, requiere runtime compatible con NVFP4 |
| Original en BF16 del mismo modelo | no disponible | no disponible | GPQA 92,2 % | no disponible | no disponible |
| Release NVFP4 GPTQ del modelo base (citada en la model card) | no disponible | no disponible | no disponible | no disponible | Arena de expertos de 63,28 GiB; ~69 GiB en uso sobre 128 GB de RAM |

No se dispone de datos sobre otros modelos de la misma categoría (MoE de ~50B con contexto de 512K) en la información proporcionada, por lo que la comparación se limita a las variantes del mismo checkpoint.

## Limitaciones y advertencias

- Acoplamiento total al runtime: los ficheros no cargan en transformers, vLLM ni llama.cpp. Migrar a otro motor exige volver al checkpoint NVFP4 original o al BF16.
- Licencia no disponible: ni el repositorio ni la información consultada indican licencia. Antes de cualquier uso comercial hay que verificar la licencia del modelo base de NVIDIA y, aguas arriba, la del modelo Qwen subyacente.
- Requisitos de infraestructura severos: 244 GB de NVMe libres y del orden de 91-128 GB de RAM. No es desplegable en portátiles, contenedores estándar ni instancias cloud pequeñas.
- Dependencia del SSD en el camino crítico: la tabla PLE se lee del disco durante la decodificación, lo que introduce variabilidad de latencia y exige ajustar `STRATA_WATCHDOG_S` y `STRATA_SSD_KEEPALIVE_WINDOW` en arranques en frío.
- Pérdida de fidelidad por cuantización: 0,7 puntos en GPQA respecto al BF16. El efecto en otras tareas (código, matemáticas, multilingüe) no está medido en la información disponible.
- Riesgo de alucinación: no evaluado. No hay datos de benchmarks de factualidad, calibración ni tasas de error en generación abierta.
- Idiomas: no disponibles. No se documenta qué lenguas cubre el modelo ni su calidad relativa fuera del inglés.
- Validación externa inexistente: el repositorio tiene 0 descargas y 0 likes y la verificación la firma un único autor. La integridad depende de `SHA256SUMS` y de los manifiestos del conversor.
- Tool calling y comportamiento agéntico no documentados: no conviene asumir soporte de function calling sin probarlo contra el servidor de Strata.
- Madurez del ecosistema: Strata 0.1.44.1 es una versión temprana; los formatos de runtime y las banderas de línea de comandos pueden cambiar entre versiones y romper la reproducibilidad del despliegue.
- Trazabilidad de la conversión: la cadena depende de la revisión `b9ce18a` del checkpoint de NVIDIA; cualquier actualización del modelo base invalida esta conversión.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/hardhant/Qwen3.8-Flash-Next-FP4-Local-Strata
- Modelo base en HuggingFace: https://huggingface.co/nvidia/Qwen3.8-Flash-Next-FP4-Local
- Runtime Strata (GitHub): https://github.com/Niko1221/Strata
- Conversor utilizado: `tools/nvfp4_csf_convert.py`, PR #2727 del repositorio de Strata
- Herramienta de empaquetado: `tools/iq_pack.py` (incluida en Strata)
- Paper, blog o demo del autor: no disponibles

# kmthang/Swift1.5-Huihui-Qwen3.8-Flash-Next-W4A16-AWQ-FP8PLE

## Resumen

Este repositorio no contiene un modelo entrenado desde cero, sino un merge de precisión mixta: la familia Swift 1.5 de UkisAI sobre Qwen/Qwen3.8-Flash-Next, en su variante W4A16 AWQ con la tabla PLE reencodeada a FP8 E4M3, sobre la que se superponen 132 tensores "abliterated" (eliminación de rechazos) procedentes del transplante de huihui-ai realizado por ntmcgee. El resultado es un modelo de ~180.000 millones de parámetros totales —de los cuales 51,2B corresponden a una tabla PLE de n-gramas— con torre de visión, cabeza MTP para decodificación especulativa y arquitectura híbrida de atención (módulos `self_attn` y `linear_attn`) con mezcla de expertos.

El problema que resuelve es de perfil de memoria: el repositorio abliterado original mantiene la tabla PLE en BF16 (~100 GB de RAM de host) y asume el fork de vLLM de halt95 para 4x RTX 3090; este build la reduce a FP8 (~la mitad) y conserva el resto del grafo byte a byte, de modo que, según la model card, se sirve en una única RTX PRO 6000 de 96 GB con contexto de 1M de tokens mediante YaRN estático factor 4.

Es relevante ahora por dos motivos: es una de las primeras combinaciones públicas de cuantización W4A16 AWQ + PLE en FP8 + abliteración sobre un modelo multimodal de contexto millonario, y documenta el procedimiento de merge de forma auditable (manifiesto con sha256 por tensor, lista `EDITED_TENSORS.txt`, validaciones del build base). Conviene tratarlo como artefacto de investigación: 0 descargas, 0 likes y ninguna evaluación publicada en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con mezcla de expertos (MoE): expertos enrutados más experto compartido (`mlp.shared_expert`), atención completa (`self_attn`) combinada con atención lineal (`linear_attn`), cabeza MTP y torre de visión. Linaje: Qwen/Qwen3.8-Flash-Next |
| Parámetros totales | 179.999.981.459 (~180B) según safetensors; 51,2B corresponden a la tabla PLE de n-gramas |
| Parámetros activos | no disponible |
| Longitud de contexto | 1.000.000 de tokens mediante factor YaRN estático de 4; contexto nativo no disponible |
| Tipos de cuantización | W4A16 AWQ asimétrica con grupo de 128 en pesos; tabla PLE en FP8 E4M3; caché KV en FP8 (incluido `indexer_kv_dtype fp8`); 48 tensores `mlp.shared_expert.down_proj` en BF16 |
| Idiomas soportados | no disponible |
| Licencia | `swift-open-license-1.0` (UkisAI) y Qwen Community License 1.0 (heredada de Qwen/Qwen3.8-Flash-Next); el campo de licencia del repo indica `other` |
| Formato de pesos | safetensors con `compressed-tensors`; tamaño del repo 126,1 GB |
| Motor de inferencia | vLLM ≥ 0.30 con backend `qwen4_exp` |
| Pipeline declarado | `image-text-to-text` |

## Arquitectura y entrenamiento

La arquitectura de partida es la de Qwen3.8-Flash-Next: un transformer MoE con experto compartido, atención híbrida (bloques de atención completa junto a bloques `linear_attn`), cabeza de predicción multi-token (MTP) para decodificación especulativa, torre de visión —de ahí el pipeline `image-text-to-text`— y un componente poco habitual, una tabla PLE (n-gramas) de 51,2B de parámetros que se consulta por búsqueda. Los detalles de composición del dataset, número de tokens de entrenamiento, fases de RLHF/DPO y política de datos no están disponibles en la información proporcionada, y en cualquier caso corresponden al modelo original de Qwen, no a este repositorio.

Este repositorio concreto no entrena nada: aplica una sustitución de bytes sobre el checkpoint base. El punto de partida es `elarisai/Swift-1.5-Qwen3.8-Flash-Next-W4A16-AWQ-FP8PLE` (commit `0d0aa7cd…`), la cuantización AWQ calibrada de UkisAI con la tabla PLE reencodeada de BF16 a FP8 E4M3. Sobre ella, `merge_recipe/overlay_modules.py` sobrescribe 132 tensores completos —48 `mlp.shared_expert.down_proj` en BF16, 12 `self_attn.o_proj` y 36 `linear_attn.out_proj` en W4A16 asimétrica g128— importados de `ntmcgee/Swift1.5-Huihui-Qwen3.8-Flash-Next-W4A16-AWQ` (`ecf9b7ca…`), que a su vez transplantó la abliteración de huihui-ai. El script verifica previamente que cada tensor tenga el mismo dtype y forma en origen y destino, copia el shard base y sobrescribe únicamente esos rangos de bytes; no hay reencodeado ni cambios de cabeceras, índices, tokenizer, plantilla de chat, torre de visión ni cabeza MTP. Cada tensor sustituido queda registrado con su shard y sha256 en `OVERLAY_MANIFEST.json`.

## Capacidades

- Generación de texto y razonamiento multi-paso, con modo de razonamiento compatible con el parser `qwen3` de vLLM.
- Generación y edición de código, con soporte del parser de herramientas `qwen3_coder` para tool calling estructurado.
- Tool calling y function calling: invocación de herramientas externas dentro de bucles de agente.
- Agentes y razonamiento multi-paso sobre ventanas de contexto muy largas (hasta 1M de tokens con YaRN factor 4).
- Capacidades multimodales de entrada imagen+texto (torre de visión incluida en el checkpoint), útil para OCR, capturas de pantalla y documentación visual.
- Decodificación especulativa con la cabeza MTP (`num_speculative_tokens: 3`), orientada a reducir latencia por token.
- Contexto largo aplicado de forma estática: no es una ventana nativa de 1M, requiere el factor YaRN 4 configurado vía `--hf-overrides`.
- Respuesta sin rechazos por diseño (abliteración de 132 módulos), incluida la capa de proyecciones de salida de atención.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Auditoría de repositorios completos: con 1M de tokens de contexto se puede cargar un monorepo o un conjunto de módulos y pedir análisis de dependencias, patrones inseguros o refactorizaciones, sin trocear el código en trozos que pierdan coherencia entre ficheros.
- Atención al cliente sobre documentación extensa: indexación de manuales y contratos en la propia ventana, con tool calling contra un CRM o una base de datos de pedidos mediante el parser `qwen3_coder`.
- Análisis de documentación visual: al ser `image-text-to-text`, admite capturas de panel, diagramas de arquitectura, facturas escaneadas o tablas fotografiadas junto al texto que las contextualiza, en un único turno multimodal.
- Red teaming y evaluación de seguridad: al estar abliterado, sirve como sujeto de prueba para medir la eficacia de filtros externos, clasificadores de salida y políticas de moderación, sin que el propio modelo bloquee las peticiones de prueba.
- Generación de datos sintéticos sin filtrado previo: útil para construir datasets de instrucciones o de diálogo con estilos que un modelo alineado rechazaría, siempre con revisión humana posterior y dentro del marco legal aplicable.
- Agentes de automatización de larga duración: la combinación de contexto millonario, MTP y tool calling permite bucles de planificación-ejecución sobre muchas fuentes sin reinyectar estado constantemente.
- Despliegue on-premise con una sola tarjeta de 96 GB: encaja en entornos donde no se quiere repartir el modelo entre varias GPU ni enviar datos a la nube, manteniendo la tabla PLE en memoria de host.
- Investigación sobre abliteración: al conservar manifiestos y hashes por tensor, permite comparar comportamiento (tasas de rechazo, deriva de calidad) contra el base no abliterado con trazabilidad de qué módulos exactos se cambiaron.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni evaluaciones multimodales para este merge, y remite a la línea `measured` de un preset propietario ("Ember", preset `swift-huihui-flash-next`) cuyos valores no se reproducen en la información proporcionada. Tampoco hay datos de latencia o throughput publicados.

| Benchmark | Este modelo | Referencia base | Notas |
|---|---|---|---|
| MMLU | no disponible | no disponible | sin evaluación publicada |
| HumanEval | no disponible | no disponible | sin evaluación publicada |
| GSM8K | no disponible | no disponible | sin evaluación publicada |
| Evaluaciones multimodales | no disponible | no disponible | sin evaluación publicada |

## Requisitos de hardware

- Configuración medida por el autor: 1x NVIDIA RTX PRO 6000 (96 GB) con `--gpu-memory-utilization 0.95`, sirviendo contexto de 1M de tokens. Es el único perfil validado que se documenta.
- Peso de los pesos: el repo ocupa 126,1 GB, pero la tabla PLE (51,2B de parámetros) en FP8 ocupa aproximadamente la mitad que en BF16 (~100 GB), es decir, alrededor de 50 GB que pueden residir en RAM de host; el resto de pesos cuantizados debe caber en VRAM junto con la caché KV en FP8.
- RAM de host: el motivo declarado del reencode FP8 es precisamente no necesitar ~100 GB de RAM de host para la PLE en BF16; prever holgadamente ~50 GB adicionales a lo que consuma el sistema.
- GPU consumer: no cabe en tarjetas de 24 GB ni de 48 GB por el tamaño del checkpoint cuantizado. No hay datos sobre configuraciones multi-GPU con este build.
- Alternativa mencionada en la card: el repo abliterado original asume el fork de vLLM de halt95 para 4x RTX 3090; este build existe para evitar ese requisito.
- Despliegue: exclusivamente vLLM ≥ 0.30 con backend `qwen4_exp`, FP8 KV y `--attention-config.indexer_kv_dtype fp8`, MTP activado (`{"method":"mtp","num_speculative_tokens":3}`), contexto 1M vía YaRN estático factor 4 en `--hf-overrides`, parser de razonamiento `qwen3` y parser de herramientas `qwen3_coder`.
- No hay GGUF, ni soporte documentado en llama.cpp, Ollama o TGI: el formato `compressed-tensors` con AWQ + FP8 y el backend `qwen4_exp` atan el despliegue a versiones muy recientes de vLLM.
- Latencia y throughput: no disponibles. La MTP con 3 tokens especulativos está pensada para mejorar el coste por token en contexto largo, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | PLE | Licencia | Notas |
|---|---|---|---|---|---|---|
| Este repo (kmthang) | ~180B totales (51,2B en PLE) | 1M (YaRN x4) | W4A16 AWQ + PLE FP8 | FP8 E4M3 | swift-open-license-1.0 + Qwen Community 1.0 | Añade abliteración sobre el base FP8-PLE |
| elarisai/Swift-1.5-Qwen3.8-Flash-Next-W4A16-AWQ-FP8PLE | no disponible (mismo linaje) | 1M (YaRN x4) | W4A16 AWQ + PLE FP8 | FP8 E4M3 | swift-open-license-1.0 + Qwen Community 1.0 | Base directo; alineado, sin abliterar |
| ntmcgee/Swift1.5-Huihui-Qwen3.8-Flash-Next-W4A16-AWQ | no disponible (mismo linaje) | no disponible | W4A16 AWQ + PLE BF16 | BF16 (~100 GB host) | swift-open-license-1.0 + Qwen Community 1.0 | Origen de los 132 tensores; perfil de memoria más exigente |
| huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated | no disponible | no disponible | BF16 (sin cuantizar según la card) | BF16 | no disponible | Abliteración original; asume el fork de vLLM de halt95 para 4x RTX 3090 |
| Qwen/Qwen3.8-Flash-Next | no disponible | no disponible | BF16 | BF16 | Qwen Community License 1.0 | Modelo upstream, sin abliterar ni cuantizar |

No hay datos de rendimiento comparado (benchmarks) para ninguna de estas variantes en la información disponible, por lo que la comparación se limita a linaje, cuantización, requisitos de memoria y licencia.

## Limitaciones y advertencias

- La abliteración elimina deliberadamente mecanismos de rechazo en 12 `self_attn.o_proj`, 36 `linear_attn.out_proj` y 48 `mlp.shared_expert.down_proj`. No es apto para aplicaciones de cara al usuario sin una capa de moderación externa y sin revisión de cumplimiento normativo.
- La abliteración no está evaluada: no hay medición de la deriva en calidad, en razonamiento ni en la tasa de alucinación respecto al base alineado. Los cambios en proyecciones de atención pueden afectar a tareas que no tienen nada que ver con el filtrado de contenido.
- Doble licencia heredada: `swift-open-license-1.0` de UkisAI más Qwen Community License 1.0. El campo del repositorio figura como `other`; antes de cualquier uso comercial hay que leer ambas y comprobar obligaciones de atribución y restricciones de redistribución.
- Cadena de custodia de cinco repositorios y cuatro autores intermedios; el autor publica manifiestos y hashes, pero no hay auditoría independiente del merge ni verificación por terceros.
- Cuantización agresiva: pesos a 4 bits (AWQ g128) y tabla PLE a FP8 E4M3 sin evaluación de impacto en calidad. La PLE es un componente de 51,2B de parámetros; su cuantización es el cambio con más probabilidad de degradar el modelado de secuencias largas.
- El contexto de 1M depende de un factor YaRN estático de 4, no de una ventana nativa. El rendimiento en la parte alta de la ventana no está medido; es habitual la degradación en recuperación de información a distancias extremas.
- Idiomas soportados no disponibles: no se puede asumir calidad multilingüe sin evaluarla, especialmente en castellano.
- Dependencia de una versión muy concreta de vLLM (≥ 0.30 con `qwen4_exp`) y de flags no estándar (FP8 KV, `indexer_kv_dtype`, MTP, YaRN). Sin ruta GGUF ni soporte en llama.cpp/Ollama/TGI, lo que complica portabilidad y despliegue en entornos gestionados.
- Requisitos de memoria no triviales: aunque el PLE se reduzca a ~50 GB en host, sigue siendo necesario un acelerador de ~96 GB o una configuración multi-GPU no documentada.
- Riesgo de alucinación: sin benchmarks ni evaluación de fidelidad, no hay base para confiar en tareas de extracción factual sin verificación posterior.
- Metadatos de adopción nulos (0 descargas, 0 likes, creado y actualizado el mismo día) y mantenido por un único autor: trátese como artefacto experimental, no como dependencia de producción.

## Enlaces

- Repositorio principal: https://huggingface.co/kmthang/Swift1.5-Huihui-Qwen3.8-Flash-Next-W4A16-AWQ-FP8PLE
- Modelo base directo (FP8 PLE): https://huggingface.co/elarisai/Swift-1.5-Qwen3.8-Flash-Next-W4A16-AWQ-FP8PLE
- Origen de los tensores abliterados (transplante de ntmcgee): https://huggingface.co/ntmcgee/Swift1.5-Huihui-Qwen3.8-Flash-Next-W4A16-AWQ
- Cuantización AWQ de referencia (UkisAI): https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-Flash-Next-W4A16-AWQ
- Abliteración original: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated
- Modelo upstream: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Texto de la licencia Swift Open 1.0: https://huggingface.co/ukisai/Swift-Qwen3.8-Flash-Next/blob/main/LICENSE
- Ficheros de trazabilidad incluidos en el repo: `EDITED_TENSORS.txt`, `OVERLAY_MANIFEST.json`, `ELARISAI_VALIDATION.json`, `HUIHUI_MERGE_MANIFEST.json`, `UPSTREAM_README.md`
- Paper, blog o demo adicionales: no disponibles en la información proporcionada

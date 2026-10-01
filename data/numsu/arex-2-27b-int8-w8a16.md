# numsu/AREX-2-27B-INT8-W8A16

## Resumen

AREX-2 27B INT8 W8A16 es una cuantización numérica del modelo multimodal BAAI/AREX-2, publicada por el usuario numsu bajo licencia Apache 2.0. No se trata de un ajuste fino ni de un modelo nuevo: es una exportación del checkpoint oficial de BAAI (revisión `d4e3502f92d9e889031c2d04e387ab2eb3520268`) en la que 400 pesos lineales bidimensionales se han convertido a INT8 simétrico con grupo de 128, manteniendo activaciones en BF16 (esquema W8A16). El objetivo es reducir la huella de pesos del modelo original y habilitar su despliegue en vLLM mediante el formato `compressed-tensors`, sin recalibrado ni evaluación de calidad posterior.

El modelo base se describe como un multimodal de 27 000 millones de parámetros orientado a tareas de agente de horizonte largo, con una longitud de contexto nativa declarada de 262 144 tokens. La arquitectura mantiene en precisión de origen la torre de visión, los embeddings de tokens, la cabeza de salida y las puertas recurrentes GDN (lo que apunta a componentes recurrentes híbridos), mientras que el resto de tensores no lineales también se preservan. El repositorio ocupa 30,8 GB y el payload de tensores indexado es de 30,77 GB (28,65 GiB).

Su relevancia práctica es acotada pero concreta: es una de las pocas vías documentadas para servir este modelo en hardware de consumo con dos RTX 3090, con mediciones reales de TTFT, prefill y decodificación desde 1K hasta 128K tokens de prompt. La contrapartida es que la cuantización es RTN sin dataset de calibración y que no se ha medido perplejidad, KLD ni calidad de tarea, por lo que las puntuaciones del modelo BF16 original no son extrapolables a este checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multimodal descrita como compatible con Qwen3.8 (etiqueta del repositorio: `qwen3_5`); incluye torre de visión y puertas recurrentes GDN. Detalle arquitectónico completo: no disponible |
| Parametros totales | 27 356 728 560 (27,36 B) |
| Parametros activos | No aplicable (no se declara arquitectura MoE) |
| Longitud de contexto | 262 144 tokens declarados por el checkpoint de origen; en las pruebas se configuró 262 144 y se validó hasta 128 003 tokens de prompt + 1 024 generados |
| Tipos de cuantizacion | INT8 W8A16 simétrico, group size 128, round-to-nearest (RTN), sin calibración; activaciones BF16; escalas en FP16 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `safetensors` con `compressed-tensors` (`pack-quantized`); no es un checkpoint GGUF |
| Modelo base | BAAI/AREX-2 (relación: quantized) |
| Modulos cuantizados | 400 pesos Linear bidimensionales |
| Tensores preservados en precisión original | Torre de visión, embeddings de tokens, cabeza de salida, puertas recurrentes GDN y otros tensores no lineales o excluidos |
| Kernel en runtime probado | `CompressedTensorsWNA16` → `MarlinLinearKernel` |
| Runtime | vLLM con soporte `compressed-tensors` (imagen fijada vLLM 0.29.0 en las pruebas) |
| Pipeline declarado | `image-text-to-text` |
| Tamano del repositorio | 30,8 GB (payload indexado: 30,77 GB / 28,65 GiB) |

## Arquitectura y entrenamiento

La model card de esta exportación no documenta la arquitectura interna del modelo base más allá de describirlo como un multimodal de 27B «compatible con Qwen3.8» para tareas de agente de horizonte largo, con 262 144 tokens de contexto nativo. Los detalles de arquitectura, datos de entrenamiento, número de tokens, composición del dataset y si hubo RLHF, DPO u otras fases de alineación pertenecen al checkpoint BAAI/AREX-2 y no se reproducen en esta ficha. Un dato estructural observable es la presencia de puertas recurrentes GDN entre los tensores preservados en precisión de origen, lo que indica que el modelo incorpora componentes recurrentes o híbridos además de capas de atención, aunque no se especifica su proporción ni su disposición.

En cuanto al proceso de cuantización, se aplicó cuantización simétrica round-to-nearest (RTN) sin dataset de calibración sobre 400 pesos Linear bidimensionales, con tamaño de grupo 128 y escalas almacenadas en FP16. Se preservaron en precisión de origen la torre de visión, los embeddings de tokens, la cabeza de salida, las puertas recurrentes GDN y el resto de tensores no lineales o excluidos, siguiendo el mismo perfil de módulos elegibles e ignorados que el perfil W8A16 de referencia. El checkpoint de origen no contiene tensores MTP, por lo que cualquier drafter de decodificación especulativa debe aportarse por separado; en las pruebas de despliegue se usó un drafter externo DFlash2 W4A16 que no se incluye en el repositorio. No se ha ejecutado comparación de perplejidad, evaluación de logits/KLD ni evaluación de calidad de tarea sobre esta derivada.

## Capacidades

- Generación de texto conversacional en formato multimodal (`image-text-to-text`), según el pipeline declarado.
- Procesamiento de imagen y texto combinados: la torre de visión se conserva en precisión de origen, no cuantizada.
- Razonamiento y modo de pensamiento orientado a tareas de agente, según las etiquetas `reasoning` y `agent` del repositorio.
- Uso de herramientas (`tool-use` / function calling), según la etiqueta declarada.
- Contexto largo: hasta 262 144 tokens declarados, con validación práctica hasta 128 003 tokens de prompt en el despliegue documentado.
- Capacidades multilingües: no disponible (no se declaran idiomas soportados).
- Decodificación especulativa: soportada por el runtime probado mediante un drafter externo (DFlash2 W4A16), no incluido en el repositorio.
- Las capacidades detalladas del modelo base (matemáticas, código, visión avanzada, etc.) no están documentadas en esta model card; consúltense las fuentes de BAAI.

## Casos de uso

- Atención al cliente automatizada: el modelo puede mantener conversaciones multiturno con historial extenso gracias a su ventana de contexto declarada de 262 144 tokens, lo que permite adjuntar manuales, histórico de tickets o documentación contractual sin troceado agresivo.
- Agentes de automatización de tareas con herramientas: las etiquetas `agent` y `tool-use` indican soporte de llamada a funciones, adecuado para orquestar APIs, consultas a bases de datos o pipelines internos en varios pasos.
- Análisis de documentos con imagen y texto: al mantener la torre de visión en BF16, puede procesar capturas, diagramas o páginas escaneadas junto con texto de contexto, útil en revisión de contratos o extracción de datos de facturas.
- Asistencia sobre bases de código extensas: con 128K tokens de prompt validados, permite incluir árboles de proyecto y múltiples ficheros en una sola llamada para tareas de explicación, refactorización o generación de pruebas.
- Investigación sobre cuantización: sirve como caso de estudio reproducible de cuantización W8A16 RTN sin calibración en un modelo multimodal de 27B, con un perfil de despliegue y una matriz de rendimiento publicados.
- Despliegue on-premise con hardware de gama alta de consumo: al caber en 2×RTX 3090 con paralelismo de tensor 2 y offload de caché KV a CPU, es viable en entornos sin GPUs de centro de datos.
- Procesamiento por lotes de baja concurrencia: con una sola secuencia activa y prompts largos, encaja en tareas de resumen o clasificación de documentos extensos donde prima el contexto sobre el throughput.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K ni equivalentes) en la información disponible. La model card indica explícitamente que no se ha ejecutado ninguna evaluación de calidad de tarea ni multimodal, y que no debe interpretarse este checkpoint como equivalente al modelo BF16 de origen.

La única matriz publicada es de rendimiento de servicio, medida sobre prompts sintéticos de aproximadamente 1K, 8K, 32K, 64K y 128K tokens con completaciones greedy exactas de 512 o 1 024 tokens, dos ejecuciones por celda y valores medianos. Configuración: 2×RTX 3090, tensor parallelism 2, activaciones BF16, caché KV en FP8 E4M3, offload de caché KV a CPU de 28 GiB y drafter DFlash2 activado (7 tokens de borrador, techo de verificación de 15 tokens).

| Tokens de prompt | Tokens nuevos | TTFT mediana (s) | Prefill (tok/s) | Decode mediana (tok/s; min–max) |
|---:|---:|---:|---:|---:|
| 1 027 | 512 | 0,74 | 1 389 | 64,6 (58,4–70,7) |
| 1 028 | 1 024 | 0,73 | 1 405 | 243,1 (236,6–249,7) |
| 8 194 | 512 | 6,22 | 1 317 | 65,1 (62,6–67,6) |
| 8 196 | 1 024 | 6,34 | 1 293 | 202,0 (198,4–205,6) |
| 32 002 | 512 | 27,52 | 1 163 | 141,6 (140,4–142,9) |
| 32 002 | 1 024 | 29,98 | 1 071 | 61,9 (61,7–62,1) |
| 64 002 | 512 | 77,72 | 824 | 67,4 (63,1–71,7) |
| 64 002 | 1 024 | 84,52 | 758 | 80,7 (72,4–89,0) |
| 128 002 | 512 | 196,28 | 652 | 35,6 (35,4–35,8) |
| 128 003 | 1 024 | 197,15 | 649 | 63,9 (63,2–64,6) |

## Requisitos de hardware

- Pesos: payload de tensores indexado de 30,77 GB (28,65 GiB). Este tamaño no cabe en una GPU única de 24 GB junto con la caché KV y el resto del proceso de servicio.
- Configuración validada: 2×RTX 3090 (Ampere `sm_86`), tensor parallelism 2, activaciones BF16, caché KV en FP8 E4M3 y offload de caché KV a CPU de 28 GiB mediante el backport de vLLM del despliegue.
- VRAM observada: 22 688 MiB en uso y 1 490 MiB libres por GPU durante el servicio completo (no son solo los pesos del modelo).
- GPU recomendadas: no se publican pruebas con A100, H100 ni otras GPUs. La única configuración documentada es la de 2×RTX 3090; en GPUs de centro de datos con más memoria por tarjeta el requisito de paralelismo sería presumiblemente menor, pero no hay datos.
- GPUs de consumo: cabe en un par de RTX 3090 o RTX 4090 (24 GB cada una) con TP=2 y offload de caché KV a CPU. En una sola tarjeta de 24 GB no hay evidencia de que quepa con contexto largo.
- Número máximo de secuencias activas validado: 1. La matriz se midió con una sola secuencia concurrente, por lo que no hay datos de throughput con batching.
- Opciones de despliegue: vLLM con soporte `compressed-tensors` (probado con imagen vLLM 0.29.0 y kernel `CompressedTensorsWNA16` → `MarlinLinearKernel`). No es un checkpoint GGUF, por lo que llama.cpp, Ollama y otros runtimes basados en GGUF no son compatibles con estos pesos tal cual.
- Decodificación especulativa: opcional, requiere un drafter externo (en las pruebas, DFlash2 W4A16) que no se incluye en el repositorio. El checkpoint base no contiene tensores MTP.
- Latencia: TTFT de 0,74 s con ~1K tokens de prompt y 197,15 s con 128 003 tokens. Prefill entre 1 405 tok/s (1K) y 649 tok/s (128K). Decode entre 35,6 tok/s (128K) y 243,1 tok/s (1K), con alta variabilidad entre celdas atribuible al drafter.
- Alcance de la validación: el checkpoint cargó y superó una prueba corta de chat de texto; no se ejecutó evaluación de calidad de tarea ni multimodal, y no se probó el límite real de 262 144 tokens.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría en la documentación aportada. La única comparación sustentada en datos es contra el checkpoint de origen.

| Modelo | Parametros | Contexto | Precisión de pesos | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| numsu/AREX-2-27B-INT8-W8A16 | 27,36 B | 262 144 declarados (128 003 validados en prompt) | INT8 W8A16, RTN, group 128, sin calibración | Apache 2.0 | safetensors + `compressed-tensors` | HuggingFace, 0 descargas |
| BAAI/AREX-2 (origen) | no disponible en esta ficha | 262 144 declarados | BF16 | no disponible en esta ficha | no disponible en esta ficha | HuggingFace |
| Otras alternativas de 27B multimodales | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No hay ninguna evaluación de calidad de tarea, multimodal, de perplejidad ni de KLD sobre este checkpoint. Los resultados publicados del modelo BF16 de origen no miden esta derivada y no deben presentarse como si lo hicieran.
- La cuantización es RTN sin dataset de calibración, lo que en la práctica suele implicar una degradación mayor que las técnicas con calibración o ajuste de escalas. No se ha cuantificado esa degradación.
- El límite nativo de 262 144 tokens no se ha probado: la validación llega a 128 003 tokens de prompt más 1 024 generados. No hay evidencia de estabilidad en el extremo configurado.
- El rendimiento medido corresponde a una única secuencia activa concurrente. No hay datos de batching, throughput agregado ni comportamiento bajo carga multiusuario.
- Todas las cifras de latencia y throughput se obtuvieron con un drafter especulativo externo (DFlash2) activado; sin él, los números de decodificación serían distintos y no se han publicado.
- El repositorio no es GGUF, de modo que queda excluido del ecosistema llama.cpp/Ollama sin una conversión adicional, que no está documentada.
- La torre de visión, los embeddings, la cabeza de salida y las puertas GDN se conservan en precisión de origen, por lo que el ahorro de memoria respecto al BF16 es parcial (30,77 GB de payload para un modelo de 27,36 B de parámetros).
- Riesgo de alucinación y sesgos: no disponible en la información proporcionada; deben consultarse las fuentes de BAAI para el modelo base.
- Idiomas soportados y comportamiento multilingüe: no disponible.
- Licencia Apache 2.0, que permite uso comercial y modificación con atribución. No obstante, al ser una derivada, conviene verificar los términos del checkpoint base y de los datos de entrenamiento originales.
- El repositorio registra 0 descargas y 0 «likes» en el momento de la consulta, y fue creado y actualizado el 1 de octubre de 2026 con pocos minutos de diferencia. Es un artefacto sin adopción verificable ni mantenimiento posterior documentado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/numsu/AREX-2-27B-INT8-W8A16
- Modelo base: https://huggingface.co/BAAI/AREX-2
- Paper: https://arxiv.org/abs/2609.38288
- Repositorio del proyecto: https://github.com/VectorSpaceLab/AREX-2
- vLLM: https://github.com/vllm-project/vllm

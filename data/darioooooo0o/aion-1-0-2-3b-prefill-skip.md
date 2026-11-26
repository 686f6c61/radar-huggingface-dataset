# darioooooo0o/aion-1.0-2.3b-prefill-skip

## Resumen

`aion-1.0-2.3b-prefill-skip` es un conjunto de adaptadores y utilidades de inferencia que implementan *prefill skipping* sin entrenamiento sobre el modelo `microsoft/Aion-1.0-Instruct-2.3B`. Lo publica el usuario `darioooooo0o` bajo licencia Apache 2.0. El objetivo es acelerar el time-to-first-token (TTFT) en prompts de contexto largo (hasta 32K tokens) evitando calcular las capas iniciales del transformer sobre el prefijo completo, y reconstruyendo las claves y valores (KV) necesarios mediante proyecciones lineales de forma cerrada (ridge regression) o, en el caso más agresivo, aprovechando la estructura de atención de ventana deslizante del modelo base.

El modelo base es un transformer de 28 capas con QK-norm, RoPE extendido por YaRN hasta 32K y atención de ventana deslizante con ventana `W=2048`, salvo 7 capas de atención completa en los índices `[2, 3, 4, 9, 13, 15, 16]`. Sobre esa arquitectura, el autor define varios "tiers" de skipping: el tier `s=17` no requiere ningún fichero de pesos adicional (0 MiB) porque las 11 capas superiores son todas de ventana deslizante; los tiers `s=15`, `s=13` y `s=10` usan adaptadores de 16-24 MiB que predicen las claves y valores pre-`k_norm` de las capas globales saltadas.

La relevancia actual es doble: por un lado, propone una técnica de compresión/aceleración de contexto largo sin reentrenar el modelo y con garantías de fidelidad medibles (KL, recuperación de claves, RULER); por otro, demuestra que en arquitecturas con atención híbrida (sliding-window + full) buena parte del prefijo puede saltarse de forma matemáticamente exacta. El repositorio es pequeño (0,1 GB) y está pensado como *drop-in* sobre el modelo base de Microsoft.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores de prefill skipping (ridge regression de forma cerrada) sobre transformer Aion de 28 capas con QK-norm, YaRN 32K y sliding-window attention `W=2048` (7 capas full en `[2, 3, 4, 9, 13, 15, 16]`) |
| Parametros totales | 2,3B (modelo base `microsoft/Aion-1.0-Instruct-2.3B`); adaptadores: 0 MiB (`s=17`), 16 MiB (`s=15`), 24 MiB (`s=13` y `s=10`) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32K tokens (YaRN) en el modelo base; los benchmarks se realizan entre 8K y 32K |
| Tipos de cuantizacion | El modelo base admite cuantización estándar; los adaptadores se distribuyen en BF16 y se validan sobre hosts con pesos block-32 `Q4_0` y `Q8_0` |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `safetensors` (adaptadores); requiere PyTorch y `transformers` con `trust_remote_code=True` |

## Arquitectura y entrenamiento

El paquete no entrena pesos: implementa *prefill skipping* de forma cerrada. La idea es que, para un prompt de `N` tokens, las capas iniciales del transformer procesan el prefijo completo; el coste de atención cuadrática en esas capas domina el TTFT. El autor explota dos propiedades del modelo base. Primero, las capas 17-27 son todas de ventana deslizante, de modo que los tokens del prefijo dejan de influir en la generación a partir de la capa 17 (el "cono" de atención se contrae); saltarse esas capas con el cono exacto es matemáticamente exacto (`max_abs = 0` en FP32). Segundo, para las capas globales saltadas en tiers más agresivos (`s=15`, `s=13`, `s=10`), se ajustan mapas ridge lineales que predicen las claves y valores pre-`k_norm` a partir de estados intermedios de profundidad media normalizados a RMS unitaria; después se aplican la `k_norm` y el RoPE YaRN propios del modelo.

Los adaptadores se calibran con 72 documentos y 835.200 tokens. El formato `aion_prefill_skip_v1` incluye una matriz `W` (2048×2048, BF16) y un sesgo `b` (2048) por capa global saltada, con metadatos de `split_layer`, `mode` (`prekn` o `in_raw`), `global_layers`, `ridge_lambda` y tamaño de calibración. La posición 0 siempre se rellena con un pase exacto de un solo token (attention sink). Cada token generado pasa por las 28 capas sin modificar; los prompts con `N <= tail_tokens` caen a prefill exacto bit a bit. El autor justifica el uso de pre-`k_norm` frente a post-`k_norm` porque regresar claves post-norm da un KL 3,45× mayor en `s=15` y 2,75× mayor en `s=10`.

## Capacidades

- Aceleración de TTFT en contextos largos: `1,30×` con cono exacto y `1,48×` sin halo en `s=17` a 32K; hasta `2,03×` en `s=10` (calidad degradada).
- Skip de prefijo sin modificar los pesos del modelo base ni reentrenar.
- Reconstrucción de KV para capas de atención global mediante adaptadores ridge de 16-24 MiB.
- Fallback exacto: prompts cortos (`N <= tail_tokens`) se procesan con prefill exacto bit a bit.
- Compatibilidad con hosts cuantizados: los mapas BF16 transfieren sin cambios a pesos block-32 `Q4_0` (recuperación de claves del 99,9 % en `s=17`, 92,4 % en `s=15`, 91,4 % en `s=13`).
- Modos de halo configurables (`max_halo=None`, `0`, `2048`) para intercambiar velocidad por fidelidad.
- Herramientas de test de integridad offline y paridad en vivo (`tests/test_adapters.py`).
- No se documentan capacidades de tool calling, agentes, visión ni audio propias del paquete; dependen del modelo base Aion Instruct.

## Casos de uso

- Atención al cliente con documentos largos: en un chatbot que recibe contratos o historiales de 20-32K tokens, el tier `s=17` sin halo reduce el TTFT un `1,48×` con `KL_all = 0,00095`, lo que permite respuestas más rápidas sin reentrenar el modelo.
- Procesamiento por lotes de documentos legales o técnicos: para pipelines que resumen muchos documentos largos, el skip de capas 17-27 con cono exacto (`1,30×`) mantiene fidelidad matemática en FP32 y acelera el prefill de cada documento.
- Servidores de inferencia con GPU de gama media: al no requerir adaptadores en `s=17`, el despliegue es un *drop-in* sobre el modelo base; útil cuando no hay presupuesto para GPUs de gran VRAM o se usan pesos cuantizados `Q4_0`.
- Evaluación de técnicas de contexto largo: el repositorio incluye tests de paridad y métricas KL/RULER, lo que lo hace útil como banco de pruebas para investigadores que comparan métodos de compresión de KV.
- RAG con ventanas de contexto grandes: en sistemas de recuperación aumentada donde el prompt concatenado supera los 16K tokens, los tiers `s=15`/`s=13` ofrecen aceleraciones de `1,58×`/`1,73×` con recuperación de claves del 93,9 %/92,9 %, adecuadas para respuestas no críticas.
- Despliegue en entornos con presupuesto de memoria ajustado: los adaptadores ocupan 16-24 MiB y se cargan/descargan en caliente (`load_projector`/`clear_projector`), lo que permite alternar entre modo exacto y acelerado sin reiniciar el proceso.

## Benchmarks y rendimiento

Datos del autor sobre 30 documentos de 32K retenidos (6 dominios, sin solapamiento de 50-gramas con los 72 documentos de calibración, 955 tokens clave dependientes del prefijo). TTFT eager a 32K es la mediana de 3 ejecuciones en caliente (`exact = 3,244 s`). RULER: 141 ítems needle-in-prefix, 4 tareas NIAH, 8K-32K, IC 95 % bootstrap por clúster.

| Tier | Fichero | Tamano | Capas de prefijo saltadas | TTFT 32K | `KL_all` | `KL_key` | Recuperacion de claves | RULER 8K-32K |
|---|---|---:|---|---:|---:|---:|---:|---:|
| Exact BF16 | — | 0 | 0 / 28 | `1,00×` | 0 | 0 | 100 % | 50,9 % `[41,8, 59,8]` |
| Block-32 `Q8_0` (referencia, sin skip) | — | — | 0 / 28 | — | `0,00141` | `0,0034` | 99,9 % | — |
| `s=17` cono exacto (`max_halo=None`) | `zero-s17` | 0 MiB | 11 / 28, cono decreciente | `1,30×` | `0,00075`* | `0,0011` | 100,1 % | — |
| `s=17` sin halo (recomendado) | `zero-s17` | 0 MiB | 11 / 28 | `1,48×` (`1,53×` a `t2048`) | `0,00095` | `0,0016` | 100,0 % | 51,8 % `[42,5, 60,8]` |
| `s=17` halo 2048 | `zero-s17` | 0 MiB | 11 / 28 | `1,43×` | `0,00076` | `0,0011` | 100,0 % | 50,9 % `[42,0, 59,7]` |
| `s=15` pre-`k_norm` (h0 / h2048) | `projectors/aion-1.0-2.3b-s15-prekn.safetensors` | 16 MiB | 13 / 28 (`[15, 16]`) | `1,58×` / `1,50×` | `0,00204` / `0,00152` | `0,0284` / `0,0191` | 93,9 % / 95,3 % | 47,9 % |
| `s=13` pre-`k_norm` (h0 / h2048) | `projectors/aion-1.0-2.3b-s13-prekn.safetensors` | 24 MiB | 15 / 28 (`[13, 15, 16]`) | `1,73×` / `1,65×` | `0,00299` / `0,00197` | `0,0374` / `0,0236` | 92,9 % / 94,8 % | 49,1 % `[40,0, 58,3]` |
| `s=10` pre-`k_norm` (h0 / h2048) | `projectors/aion-1.0-2.3b-s10-prekn.safetensors` | 24 MiB | 18 / 28 (`[13, 15, 16]`) | `2,03×` / `1,86×` | `0,01395` / `0,00850` | `0,3715` / `0,2113` | 62,9 % / 75,3 % | 37,8 % |

*Ruido de tiling en BF16; la misma ruta da `0,00e+00` en CPU FP32. El TTFT del cono se mide como prefill de siguiente token (`tail=1`).

El autor señala que el RULER del modelo base es de ~51 % en estos ítems multi-needle de 8K-32K, por lo que los tiers se evalúan por su proximidad al modo exacto, no por la puntuación absoluta.

## Requisitos de hardware

- El modelo base tiene 2,3B parámetros; en BF16 ocupa aproximadamente 4,6 GB de pesos, más la caché KV del contexto (que crece con la longitud). No se publican cifras de VRAM total en la información disponible.
- Los adaptadores ocupan 0 MiB (`s=17`), 16 MiB (`s=15`) o 24 MiB (`s=13`/`s=10`), por lo que el requisito adicional es despreciable.
- GPU recomendadas: no disponible en la información. Los benchmarks se realizaron en una Intel Arc Pro B70 con `bfloat16`.
- Por tamaño, el modelo base cabe en GPUs de consumo con al menos 8-12 GB de VRAM en BF16 o menos con cuantización, pero el autor no confirma modelos concretos.
- Opciones de despliegue: el paquete se instala con `pip install -e ".[hub]"` y se usa con PyTorch y `transformers` (`trust_remote_code=True`). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: TTFT exacto de referencia a 32K = 3,244 s en el hardware del autor; las aceleraciones relativas se detallan en la tabla de benchmarks. No se publican cifras de throughput de generación.

## Comparativa con modelos similares

No se dispone de comparativas con otros paquetes de prefill skipping en la información proporcionada. La referencia interna del autor es el propio modelo base sin skip y la cuantización block-32 `Q8_0`:

| Alternativa | Parametros | Contexto | TTFT 32K | `KL_all` | Licencia |
|---|---|---|---|---|---|
| `aion-1.0-2.3b-prefill-skip` `s=17` sin halo | 2,3B + 0 MiB | 32K | `1,48×` | `0,00095` | Apache 2.0 |
| `microsoft/Aion-1.0-Instruct-2.3B` exacto | 2,3B | 32K | `1,00×` | 0 | no disponible |
| Block-32 `Q8_0` (referencia de cuantización) | 2,3B | 32K | — | `0,00141` | — |

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; el paquete no modifica los pesos y hereda los sesgos del modelo base Aion Instruct.
- Riesgo de alucinación: no evaluado en la información; el skip introduce un error de reconstrucción de KV medible (`KL_all` entre `0,00095` y `0,01395` según tier) que puede afectar a la fidelidad en tareas de recuperación exacta.
- Los tiers `s=13` y especialmente `s=10` degradan la recuperación de claves (92,9 % y 62,9 % en h0) y el RULER (49,1 % y 37,8 %), por lo que no son adecuados para producción sensible a la precisión.
- El modo `s=17` con cono exacto es matemáticamente exacto solo en FP32; en BF16 hay ruido de tiling (`0,00075` de KL).
- La aceleración depende del hardware y del tamaño del prefijo; los datos se obtuvieron en una Intel Arc Pro B70 con `tail=4096`.
- Requiere `trust_remote_code=True` y el paquete `aion_prefill_skip`, lo que añade dependencia de código de terceros.
- Idiomas soportados: no disponible; depende del modelo base.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base puede tener sus propias condiciones (no detalladas en la información).
- El repositorio tiene 0 descargas y 0 likes, y fue creado en noviembre de 2026; no hay evidencia de validación independiente.

## Enlaces

- Hugging Face: https://huggingface.co/darioooooo0o/aion-1.0-2.3b-prefill-skip
- Modelo base: https://huggingface.co/microsoft/Aion-1.0-Instruct-2.3B
- Preprint citado en la model card: `paper.pdf` (incluido en el repositorio, sin URL externa disponible)
- Repositorio del paquete: `https://huggingface.co/darioooooo0o/aion-1.0-2.3b-prefill-skip` (instalación vía `pip install -e ".[hub]"`)

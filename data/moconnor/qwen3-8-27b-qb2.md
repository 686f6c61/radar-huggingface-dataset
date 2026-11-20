# moconnor/qwen3.8-27b-QB2

## Resumen

`moconnor/qwen3.8-27b-QB2` es un bundle de despliegue, no un modelo entrenado desde cero. Empaqueta el modelo base `Qwen/Qwen3.8-27B` junto con un drafter de decodificación especulativa (`incoai/Qwen3.8-27B-DFlash2`) y una pila de optimizaciones de inferencia para hardware Tenstorrent, concretamente una QuietBox 2 con dos placas p300c y cuatro chips Blackhole en malla 1x4. Lo publica el usuario `moconnor` bajo licencia Apache 2.0, heredada del modelo base.

El problema que resuelve es la puesta en marcha reproducible de Qwen3.8-27B sobre aceleradores Tenstorrent con vLLM y decodificación especulativa DFlash2, sin exigir al usuario montar a mano el entorno TTNN, los kernels `generic_op` ni la cadena de conversión de pesos. El bundle es autocontenido: `tt-model pull` instala código, plugin y kernels en un venv aislado sobre TTNN 0.81.1, y los pesos del target y del drafter se descargan en el primer uso.

La relevancia es acotada pero clara para quien opera hardware Tenstorrent: el autor reporta mejoras de hasta 2,05x en throughput agregado frente al baseline original de QuietBox 2, con 262.144 tokens de contexto por usuario para 8 usuarios concurrentes. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamaño del repo es 0,0 GB, lo que indica que no aloja pesos, solo el bundle de instalación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3.8-27B); bundle de despliegue con decodificación especulativa DFlash2 sobre vLLM y TTNN |
| Parametros totales | 27B (según el nombre del modelo base; no se detalla en la información disponible) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens por usuario, 8 usuarios concurrentes, bloques KV de 4.096 tokens, ~2,1M tokens KV totales |
| Tipos de cuantizacion | no disponible (el bundle no documenta cuantización; se sirve sobre TTNN 0.81.1) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (los pesos se descargan desde `Qwen/Qwen3.8-27B` e `incoai/Qwen3.8-27B-DFlash2` en el primer uso; el repo no contiene pesos) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, un transformer de 27.000 millones de parámetros del que la información disponible no detalla composición del dataset, número de tokens de entrenamiento ni si hubo RLHF o DPO. El bundle añade un drafter DFlash2 (`incoai/Qwen3.8-27B-DFlash2`) para decodificación especulativa, servido con vLLM sobre TTNN 0.81.1 en una malla 1x4 de cuatro chips Blackhole con `FABRIC_1D`.

La innovación técnica está en la pila de optimización `DEFAULT`, descrita con detalle inusual: proyecciones VProj en streaming, fronteras de decode fusionadas, SDPA de verify y prefill empaquetadas como `generic_op`, kernels GDN nocturnos `nmx` con `UROWS` de filas vivas SFPU en cuatro buckets de verify (`1x8`, `2x8`, `4x8`, `8x4`), Glue entero A/B/C con `AR_GLUEB2` y `AR_VPROJ_LMHEAD=5`, prefill trazado para prompts cortos y cola de prompts largos (`QWEN36_SPEC_BUCKET_TRACE=1`), salto de taps muertos del drafter en prefills largos (`QWEN36_SPEC_PREFILL_SKIP_DEAD_TAPS=1`), bucket de verify `2x8` dedicado con split de valor GDN `P=4` (`QWEN36_GDN_VSPLIT_MAX_B=2`), `presence_penalty` aplicado en el lado de la tarjeta en el carril DFlash, y un parche para el tipado de argumentos de tool calls con `$ref`/`$defs` anidados (referencia a `vllm-project/vllm#46924`). El caché de prefijos está activado por defecto y reanuda desde el último bloque cacheado de 4.096 tokens.

## Capacidades

- Generación de texto y razonamiento en modo thinking, con `reasoning_effort: medium` por defecto y parser de razonamiento `qwen3`.
- Tool calling y function calling, con parser `qwen3_coder` y corrección del tipado de argumentos anidados en tool calls.
- Procesamiento de imágenes: hasta 4 imágenes por petición.
- Contexto largo: hasta 262.144 tokens por usuario con 8 usuarios concurrentes y caché de prefijos activado por defecto.
- Decodificación especulativa DFlash2 con verificación sin pérdida, aplicada según el tipo de petición (el texto de la model card se corta en la sección "Which requests use DFlash", donde solo consta que las peticiones greedy usan DFlash).
- Servidor compatible con la API de OpenAI: `/v1/chat/completions` y `/v1/completions`.
- Muestreo por defecto: temperatura 0,6, top_k 20, top_p 0,95; cada petición puede sobrescribir `temperature`, `top_k`, `top_p`, `presence_penalty` y `seed`.

## Casos de uso

- Despliegue de Qwen3.8-27B en infraestructura Tenstorrent: el bundle instala el modelo, el plugin y los kernels en un venv aislado sobre TTNN 0.81.1, de modo que un operador de QuietBox 2 puede servir el modelo con `tt-model pull` y `tt-model serve` sin ensamblar el stack a mano.
- Servicio de chat multi-turno con contexto largo: con 262.144 tokens por usuario y 8 usuarios concurrentes, encaja en asistentes que arrastran documentos extensos o historiales largos sin truncar, apoyándose en el caché de prefijos por bloques de 4.096 tokens.
- Análisis de documentos con imágenes: el soporte de hasta 4 imágenes por petición permite flujos de extracción y respuesta sobre capturas, diagramas o páginas escaneadas combinadas con texto largo.
- Agentes con tool calling: el parser `qwen3_coder` y el razonamiento en modo thinking permiten cadenas de varios pasos con llamadas a funciones, útil en automatización de tareas internas donde el modelo debe decidir qué herramienta invocar.
- Generación de código asistida: el modelo base Qwen3.8-27B y el soporte de tool calling lo hacen apto para asistentes de programación integrados en el IDE o en pipelines, siempre que el backend sea el bundle sobre QuietBox 2.
- Evaluación comparativa de hardware: los datos de SPEED-Bench `low_entropy` con throughput por usuario, TTFT p50 y potencia de placa permiten usar el bundle como referencia reproducible para medir el rendimiento de una QuietBox 2 frente a otras configuraciones.
- Prototipado de decodificación especulativa: al incluir el drafter DFlash2 y las métricas de decode-only frente a E2E, sirve para estudiar el impacto de la verificación especulativa en latencia y throughput sin modificar el modelo base.

## Benchmarks y rendimiento

Datos de SPEED-Bench `low_entropy` en modo thinking, medidos de extremo a extremo por la API de OpenAI en una QuietBox 2 (9.999 USD, 2x p300c), con caché de prefijos desactivado (`cached_tokens == 0`), `temperature=1.0`, `top_p=0.95`, `top_k=20`, `presence_penalty=0`, `reasoning_effort=medium`, `max_tokens=1024`, comparados contra el baseline `mando2222/qwen3.8-27b-QB2`.

Contexto de 8K, throughput e interactividad (batch 1 a 8):

| Batch | E2E tok/s/u (incl. TTFT) | Decode-only tok/s/u | TTFT p50 (s) | Agregado tok/s | vs baseline | tok/s por 1K USD | Potencia de placa (W) |
|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 156,2 | 185,5 | 0,95 | 153,6 | 2,01x | 15,36 | 866,2 |
| 2 | 126,4 | 150,7 | 1,02 | 226,3 | 2,05x | 22,63 | 879,3 |
| 4 | 98,9 | 116,5 | 1,04 | 359,2 | 1,85x | 35,92 | 956,4 |
| 8 | 64,4 | 78,7 | 1,19 | 476,2 | 1,67x | 47,63 | 997,8 |

Interactividad batch 1 en contexto largo (1K a 128K):

| Longitud de secuencia | E2E tok/s/u (incl. TTFT) | Decode-only tok/s/u | TTFT p50 (s) | vs baseline |
|---:|---:|---:|---:|---:|
| 1K | 208,5 | 220,5 | 0,27 | 1,91x |
| 2K | 188,2 | 202,3 | 0,31 | 2,18x |
| 8K | 148,0 | 172,3 | 0,96 | 1,89x |
| 16K | 146,0 | 199,9 | 1,89 | 1,95x |
| 32K | 111,8 | 190,8 | 3,77 | 1,78x |
| 64K* | 75,5 | 187,4 | 8,12 | 1,82x |
| 128K* | 41,9 | 175,6 | 18,86 | 1,83x |

*64K y 128K se extienden desde `throughput_32k_low_entropy` de SPEED-Bench con contenido intermedio no solapado del mismo tipo, sin relleno repetitivo.

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Hardware específico: QuietBox 2 con 2 placas p300c y 4 chips Blackhole en malla 1x4 (`FABRIC_1D`). No es un bundle para GPU convencional.
- Host: SFPI 7.89.0 (build 1050), que es la versión declarada por TTNN 0.81.1; `install.sh` comprueba la versión y aborta si no coincide, porque otra SFPI rompe la compilación de kernels. Probado con firmware de placa 19.15.0.
- Toolchain: `install.sh` usa `uv 0.12.11` y lo instala dentro del bundle si el host tiene otra versión.
- VRAM: no aplica; la inferencia corre sobre TTNN en los chips Blackhole, no sobre GPU. No se documenta memoria por chip.
- Despliegue: `tt-model pull` y `tt-model serve` para bundles instalados con esa vía; `run.sh --port 20000` para bundles instalados manualmente con copia propia de SFPI.
- Arranque: la primera ejecución sobre una instalación limpia convierte pesos y compila kernels en el caché del bundle, unos 10 minutos tras la descarga de pesos; los arranques en caliente tardan unos 2 minutos.
- Consumo: entre 866,2 W y 997,8 W de potencia de placa según el batch en las mediciones de 8K.
- Throughput: 156,2 tok/s por usuario en batch 1 y 476,2 tok/s agregados en batch 8 a 8K de contexto; 41,9 tok/s por usuario a 128K en batch 1.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `moconnor/qwen3.8-27b-QB2` (este bundle) | 27B | 262.144 tokens por usuario, 8 usuarios | 2,01x–2,05x frente al baseline QuietBox 2 según batch | Apache 2.0 | Hugging Face, 0 descargas |
| `mando2222/qwen3.8-27b-QB2` (baseline) | 27B | no disponible en la información proporcionada | Referencia de comparación; el bundle de este análisis lo supera entre 1,67x y 2,18x según escenario | no disponible | Hugging Face |
| `Qwen/Qwen3.8-27B` (modelo base) | 27B | no disponible en la información proporcionada | no disponible | Apache 2.0 (heredada por el bundle) | Hugging Face |

## Limitaciones y advertencias

- El bundle está atado a hardware Tenstorrent QuietBox 2 (2x p300c, 4 Blackhole) y a SFPI 7.89.0; no es portable a GPU ni a otras versiones de SFPI sin recompilar kernels.
- El repositorio no contiene pesos (0,0 GB); depende de la descarga de `Qwen/Qwen3.8-27B` e `incoai/Qwen3.8-27B-DFlash2` en el primer uso, con la disponibilidad y condiciones de esos repos como dependencia externa.
- `tt-model pull` borra el bundle si la instalación falla; el procedimiento manual con `install.sh` y SFPI propia es más frágil y requiere servir con `run.sh` en lugar de `tt-model serve`.
- La sección "Which requests use DFlash" de la model card está truncada en la información disponible: solo consta que las peticiones greedy usan DFlash, sin detalle del resto de casos.
- No hay datos publicados de benchmarks de calidad (MMLU, HumanEval, GSM8K) ni de sesgos, alucinación o cobertura idiomática; los idiomas soportados figuran como no disponibles.
- Las métricas de rendimiento son del autor, con prompts congelados de SPEED-Bench y caché de prefijos desactivado; no hay verificación independiente.
- Las extensiones a 64K y 128K se construyen a partir de `throughput_32k_low_entropy` con contenido intermedio no solapado, no con prompts nativos de esa longitud.
- Licencia Apache 2.0 permite uso comercial, pero las condiciones del modelo base y del drafter deben verificarse por separado antes de producción.
- El modelo tiene 0 descargas y 0 likes, y se creó y actualizó el mismo día (2026-11-20), sin historial de mantenimiento.

## Enlaces

- Hugging Face del bundle: https://huggingface.co/moconnor/qwen3.8-27b-QB2
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Drafter DFlash2: https://huggingface.co/incoai/Qwen3.8-27B-DFlash2
- Repositorio del bundle: https://github.com/tenstorrent/qwen3.8-27b-qb2
- Baseline de comparación: https://huggingface.co/mando2222/qwen3.8-27b-QB2
- Release de SFPI 7.89.0: https://github.com/tenstorrent/sfpi/releases/download/7.89.0/sfpi_7.89.0_x86_64_debian.txz
- Issue de vLLM referenciado: https://github.com/vllm-project/vllm/issues/46924

# jonpark0/SmolLM3-3B-krafla

## Resumen

SmolLM3-3B-krafla es una conversión cuantizada del modelo SmolLM3-3B de HuggingFaceTB, publicada por jonpark0 para el runtime Krafla, un motor de inferencia en C11 sin dependencias externas diseñado para ejecución exclusiva en CPU. El paquete incluye tres variantes de pesos (Q4_0, Q4_0 mixta y Q8_0) junto con el tokenizador convertido al formato propietario `.mlt`, todo empaquetado en archivos `.mlb` que el runtime Krafla carga directamente sin necesidad de Python, PyTorch ni ninguna biblioteca de terceros.

El modelo base SmolLM3-3B es un transformer denso de aproximadamente 3.000 millones de parámetros con una ventana de contexto de 65.536 posiciones, y esta conversión preserva esa longitud de contexto (aunque el runtime usa 4.096 posiciones por defecto y permite ajustarla con `--ctx`). La relevancia de esta ficha radica en que demuestra un camino de despliegue de un LLM moderno en hardware sin GPU, con binarios nativos para Linux x86-64, AArch64, ARMv7 y Windows x86-64, y con optimizaciones específicas para SSE2, AVX2, AVX-512 VNNI, ARM NEON, i8mm y SVE.

La licencia Apache 2.0 del modelo original se mantiene, lo que permite uso comercial sin restricciones adicionales. El repositorio ocupa 7,2 GB e incluye los archivos de pesos cuantizados, el tokenizador y los hashes SHA-256 para verificación de integridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base SmolLM3-3B) |
| Parametros totales | ~3.000 millones (modelo base) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 65.536 posiciones (el runtime usa 4.096 por defecto, configurable con `--ctx`) |
| Tipos de cuantizacion | Q4_0 (4,5 bits/peso), Q4_0 mixta (Q4_0 con `v,o,down` en Q8_0), Q8_0 (8,5 bits/peso) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.mlb` (formato propietario de Krafla); tokenizador en `.mlt` |

## Arquitectura y entrenamiento

El modelo base SmolLM3-3B es un transformer denso de aproximadamente 3.000 millones de parámetros. Esta publicación no entrena ningún modelo: es una conversión de los pesos en safetensors del modelo original a los formatos de cuantización de Krafla. La información sobre la composición del dataset de entrenamiento, el número de tokens y las fases de alineación (RLHF/DPO) del modelo base no está disponible en la documentación proporcionada y debe consultarse en la model card de HuggingFaceTB/SmolLM3-3B.

La innovación técnica de esta conversión reside en el runtime Krafla y en el esquema de cuantización. Q4_0 y Q8_0 mantienen una escala f16 por cada bloque de 32 pesos, lo que resulta en 4,5 y 8,5 bits por peso respectivamente. La variante mixta aplica Q8_0 únicamente a las matrices `v`, `o` y `down`, dejando el resto en Q4_0, lo que reduce la perplejidad de 13,78 a 13,29 a costa de aumentar el tamaño de 1.650 MiB a 2.127 MiB. El runtime implementa kernels específicos por arquitectura (SSE2 hasta AVX-512 VNNI en x86-64; NEON, i8mm y SVE en ARM) y selecciona automáticamente el build más capaz que soporte la CPU.

## Capacidades

- Generación de texto autoregresiva con soporte de plantilla de chat ChatML (`--chat chatml`).
- Modo de razonamiento con etiquetas `<think>` / `</think>` heredado del modelo base, desactivable mediante el token `/no_think` en el prompt.
- Inferencia exclusiva en CPU, sin dependencia de GPU ni de bibliotecas de Python en tiempo de ejecución.
- Servidor compatible con la API de OpenAI en `http://127.0.0.1:8080/v1` mediante el binario `ml_server`.
- Contexto configurable hasta 65.536 posiciones (el tamaño de la caché KV se controla con `--ctx N`).
- Ejecución multiplataforma: Linux x86-64, AArch64, ARMv7 y Windows x86-64.
- Control de hilos de cómputo mediante el flag `-t`.
- No se documentan capacidades de tool calling, function calling, agentes, visión ni audio en la información disponible.

## Casos de uso

- Despliegue en servidores sin GPU: el runtime Krafla compila a binarios nativos y ejecuta el modelo en CPU con 4 hilos a 18,7 tok/s en decodificación (Q4_0), lo que permite servir generación de texto en infraestructura de bajo coste o en entornos donde no hay aceleradores disponibles.
- Inferencia en el borde (edge) y dispositivos ARM: los builds para ARMv7 NEON, AArch64, i8mm y SVE permiten ejecutar el modelo en placas SBC y servidores ARM, útil para asistentes locales sin conectividad.
- Prototipado y evaluación de modelos sin cadena de dependencias Python: al no requerir PyTorch ni transformers, se puede integrar en pipelines de CI/CD o en sistemas embebidos con un único binario y dos archivos.
- Servicio compatible con OpenAI para pruebas de integración: `ml_server` expone un endpoint `/v1` que permite apuntar clientes existentes (SDKs de OpenAI, LangChain, etc.) al runtime local para validar flujos antes de migrar a producción con GPU.
- Generación de texto con razonamiento controlado: el modo `<think>` y el token `/no_think` permiten alternar entre respuestas directas y cadenas de razonamiento, adecuado para tareas de question answering donde se quiere medir el coste del razonamiento.
- Verificación de integridad en despliegues regulados: los archivos incluyen hashes SHA-256 en `SHA256SUMS`, lo que facilita la auditoría de artefactos en entornos con requisitos de trazabilidad.
- Inferencia con contexto largo en CPU: con `--ctx` se puede ampliar la caché KV más allá de los 4.096 tokens por defecto, útil para resumir documentos o analizar conversaciones largas en hardware sin GPU (a costa de memoria y latencia).

## Benchmarks y rendimiento

Los datos publicados por el autor miden perplejidad en wikitext-2 (4 fragmentos de 512 tokens) y velocidad con `ml_bench -n 128` (128 tokens de prompt y 128 de decodificación) en un AMD EPYC 7763 de 64 núcleos con 4 hilos y build AVX2.

| Archivo | Pesos | Tamano | Perplejidad | Prefill (tok/s) | Decode (tok/s) |
|---|---|---|---|---|---|
| `SmolLM3-3B-Q4_0.mlb` | Q4_0 en todas las matrices | 1.650 MiB | 13,78 | 58 | 18,7 |
| `SmolLM3-3B-Q4_0-mixed.mlb` | Q4_0 con `v,o,down` en Q8_0 | 2.127 MiB | 13,29 | 48 | 15,3 |
| `SmolLM3-3B-Q8_0.mlb` | Q8_0 en todas las matrices | 3.116 MiB | 11,61 | 34 | 10,4 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La perplejidad solo es comparable entre archivos del mismo modelo, según indica el autor.

## Requisitos de hardware

- VRAM: no aplica; la inferencia es exclusivamente en CPU.
- Memoria RAM estimada: al menos el tamaño del archivo de pesos más la caché KV. Para Q4_0, unos 1,65 GiB de pesos; para Q8_0, unos 3,1 GiB. La caché KV crece con `--ctx` y debe sumarse a esa cifra.
- CPU: x86-64 con SSE2 como mínimo; AVX2 o AVX-512 VNNI mejoran el rendimiento. En ARM, desde ARMv7 NEON hasta AArch64 con i8mm y SVE.
- GPU: no se utiliza ninguna; no hay soporte CUDA, ROCm ni Metal documentado.
- Despliegue: binarios `ml_run` (CLI) y `ml_server` (API compatible con OpenAI) de las releases de Krafla 0.8.0 o superior.
- Throughput de referencia: 18,7 tok/s en decodificación y 58 tok/s en prefill con Q4_0 en un EPYC 7763 con 4 hilos; el rendimiento en hardware consumer será inferior y no está documentado.
- No se dispone de datos de latencia para otras configuraciones de CPU o número de hilos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato / runtime |
|---|---|---|---|---|---|
| SmolLM3-3B-krafla (esta ficha) | ~3.000 M | 65.536 | Q4_0, Q4_0 mixta, Q8_0 | Apache 2.0 | `.mlb` / Krafla (CPU) |
| SmolLM3-3B (original) | ~3.000 M | 65.536 | safetensors (bf16/fp16) | Apache 2.0 | safetensors / transformers, vLLM, TGI |
| SmolLM3-3B en GGUF (llama.cpp) | ~3.000 M | 65.536 | Q4_0, Q4_K_M, Q8_0, etc. | Apache 2.0 | GGUF / llama.cpp, Ollama |

La comparativa con GGUF es la más directa: ambos permiten inferencia en CPU, pero Krafla no depende de ninguna biblioteca externa y ofrece binarios nativos, mientras que llama.cpp tiene un ecosistema mayor de herramientas y formatos de cuantización (incluidos los K-quants, que no están disponibles en esta conversión). No se dispone de datos de rendimiento comparativos entre Krafla y llama.cpp en la información proporcionada.

## Limitaciones y advertencias

- Modelo de 3.000 millones de parámetros: la calidad en razonamiento complejo, matemáticas y código es inferior a la de modelos de mayor tamaño; no debe asumirse un rendimiento de nivel frontier.
- La perplejidad en wikitext-2 es de 13,78 (Q4_0) y 11,61 (Q8_0), lo que indica una degradación medible respecto a los pesos originales en la variante de 4 bits.
- No hay información sobre sesgos, idiomas soportados ni evaluación de alucinación en la documentación proporcionada; debe consultarse la model card del modelo base.
- El runtime Krafla es un proyecto joven (versión 0.8.0 o superior requerida) y los formatos `.mlb` y `.mlt` son propietarios; la portabilidad a otras herramientas es nula sin conversión.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación comunitaria independiente.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar los términos del modelo base y del runtime Krafla por separado.
- El modo `<think>` puede generar cadenas de razonamiento largas que consumen tokens y aumentan la latencia; debe desactivarse con `/no_think` cuando no sea necesario.
- No se documenta soporte de tool calling ni de agentes multi-paso, lo que limita su uso en pipelines agénticos sin capas adicionales.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jonpark0/SmolLM3-3B-krafla
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Runtime Krafla: https://github.com/JonPark0/krafla
- Releases de Krafla: https://github.com/JonPark0/krafla/releases
- Guía de usuario de Krafla (formatos Q8/Q4/mixto): https://github.com/JonPark0/krafla/blob/main/docs/user-guide.md#q8-q4-or-mixed
- Comparativa con llama.cpp: https://github.com/JonPark0/krafla/blob/main/docs/benchmarks.md
- Commit de conversión: https://github.com/JonPark0/krafla/commit/0b527a04aebd4234ed3c2197bfbb0248a1628ac7

# jonpark0/Qwen3-8B-krafla

## Resumen

Qwen3-8B-krafla es una conversión del modelo Qwen/Qwen3-8B a los formatos propietarios `.mlb` (pesos) y `.mlt` (tokenizador) del runtime Krafla, un motor de inferencia en C11 sin dependencias externas diseñado para ejecución exclusiva en CPU sobre x86-64 (SSE2 hasta AVX-512 VNNI) y ARM (ARMv7 NEON hasta i8mm y SVE). Lo publica el autor jonpark0, creador de Krafla, y no introduce cambios en los pesos más allá de la cuantización: el modelo subyacente es el Qwen3-8B original de Alibaba Qwen, un transformer denso de aproximadamente 8.200 millones de parámetros con una ventana de contexto nativa de 40.960 posiciones.

La relevancia de esta ficha no está en el modelo base, ampliamente conocido, sino en el formato de distribución: ofrece tres variantes cuantizadas (Q4_0 completa, Q4_0 mixta con las matrices `v`, `o` y `down` en Q8_0, y Q8_0 completa) con métricas de perplejidad y velocidad publicadas y medibles. Esto permite desplegar un modelo de 8B en hardware sin GPU, incluyendo servidores de bajo coste y equipos de sobremesa, con un consumo de memoria que va desde los 4.395 MiB de la variante Q4_0 hasta los 8.300 MiB de la Q8_0.

El proyecto es de nicho y muy reciente (publicado el 3 de noviembre de 2026), sin descargas ni valoraciones en el momento de redactar esta ficha. Su interés es práctico para entornos con restricciones de dependencias, CPU-only y despliegue reproducible, no para competición en benchmarks de calidad, donde el modelo se comporta exactamente como el Qwen3-8B original en la medida en que la cuantización lo permita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3-8B); runtime de inferencia Krafla en C11 |
| Parametros totales | 8B (aproximadamente 8.200 millones, segun el modelo base) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 40.960 posiciones registradas en los ficheros; `ml_run` y `ml_server` usan 4.096 por defecto y permiten `--ctx N` |
| Tipos de cuantizacion | Q4_0 (4,5 bits/peso), Q4_0 mixta (Q4_0 con `v`, `o`, `down` en Q8_0), Q8_0 (8,5 bits/peso); escalas f16 por bloque de 32 pesos |
| Idiomas soportados | no disponible en la informacion proporcionada (heredados del modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.mlb` (pesos) y `.mlt` (tokenizador), formatos propietarios de Krafla; no safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo base es Qwen3-8B, un transformer denso con atención completa y modo de razonamiento explícito (`<think>`) que puede desactivarse mediante el sufijo `/no_think` en el prompt. Esta conversión no reentrena ni modifica el modelo: parte de los safetensors oficiales de Qwen/Qwen3-8B y aplica cuantización de bloque con escalas f16 cada 32 pesos, generando tres ficheros mediante las herramientas `tools/convert.py` y `tools/convert_tokenizer.py` de Krafla 0.8.0 (commit `0b527a0`, 3 de noviembre de 2026).

La innovación técnica es el runtime, no los pesos: Krafla es un binario C11 sin dependencias que selecciona en tiempo de ejecución la build más capaz que soporte la CPU (SSE2, AVX2, AVX-512 VNNI en x86-64; NEON, i8mm y SVE en ARM) e incluye un servidor compatible con la API de OpenAI (`ml_server`). No se documentan datos de entrenamiento adicionales, RLHF ni DPO específicos para esta conversión, ya que se heredan íntegramente del modelo base.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" activable o desactivable mediante `/no_think`.
- Generación de código y matemáticas, heredadas del Qwen3-8B original.
- Conversación multi-turno mediante plantilla ChatML (`--chat chatml`).
- Servicio HTTP con API compatible con OpenAI en `/v1` a través de `ml_server`.
- Ejecución exclusiva en CPU, sin requisito de GPU ni de bibliotecas de aceleración externas.
- Soporte de contexto largo configurable hasta 40.960 posiciones mediante `--ctx N` (limitado por memoria para la caché KV).
- Soporte multilingüe: no disponible en la información proporcionada; depende del tokenizador de Qwen3-8B.
- Tool calling y function calling: no disponible en la información proporcionada para el runtime Krafla.

## Casos de uso

- Despliegue en servidores sin GPU: Krafla compila y ejecuta en x86-64 y ARM sin CUDA, lo que permite servir Qwen3-8B en VPS económicos o instancias ARM con 6-9 GB de RAM libre, usando la variante Q4_0 o Q4_0 mixta.
- Entornos con requisitos estrictos de dependencias: al ser un binario C11 sin dependencias, encaja en imágenes de contenedor mínimas, sistemas air-gapped y distribuciones sin gestor de paquetes Python.
- Asistente de código en estación de trabajo: con la variante Q4_0 mixta (5.619 MiB) y 4 hilos se obtienen 20 tok/s de prefill y 6,6 tok/s de decodificación, suficiente para autocompletado y explicación de fragmentos en un flujo interactivo.
- Procesamiento por lotes de documentos con contexto medio: la ventana de 4.096 posiciones por defecto cubre la mayoría de tareas de resumen y extracción; para documentos mayores se aumenta `--ctx` asumiendo el coste en memoria de la caché KV.
- Sustitución local de la API de OpenAI: `ml_server` expone `/v1`, de modo que clientes existentes pueden apuntar a `http://127.0.0.1:8080/v1` sin cambios de código, útil para prototipos y pruebas de integración sin coste por token.
- Evaluación comparativa de cuantizaciones: los tres ficheros publicados permiten medir el compromiso entre perplejidad (13,14 / 13,04 / 12,53 en wikitext-2) y velocidad (8,7 / 6,6 / 4,4 tok/s de decodificación) sobre el mismo hardware de referencia.
- Inferencia en dispositivos ARM embebidos: las builds para ARMv7 NEON y AArch64 con i8mm/SVE permiten ejecutar el modelo en placas y servidores ARM donde no hay soporte de CUDA.

## Benchmarks y rendimiento

Métricas publicadas por el autor, medidas en un runner de GitHub con AMD EPYC 7763 (4 hilos) y build `avx2`. Perplejidad sobre wikitext-2 (4 fragmentos de 512 tokens); velocidad con `ml_bench -n 128` (128 tokens de prompt y 128 de decodificación).

| Fichero | Pesos | Tamano | Perplejidad | Prefill | Decode |
|---|---|---|---:|---:|---:|
| `Qwen3-8B-Q4_0.mlb` | Q4_0 en todas las matrices | 4.395 MiB | 13,14 | 24 tok/s | 8,7 tok/s |
| `Qwen3-8B-Q4_0-mixed.mlb` | Q4_0 con `v`, `o`, `down` en Q8_0 | 5.619 MiB | 13,04 | 20 tok/s | 6,6 tok/s |
| `Qwen3-8B-Q8_0.mlb` | Q8_0 en todas las matrices | 8.300 MiB | 12,53 | 4 tok/s | 4,4 tok/s |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible para esta conversión; los valores de perplejidad solo son comparables entre ficheros del mismo modelo, según advierte el autor.

## Requisitos de hardware

- VRAM: no aplica; la inferencia es exclusivamente en CPU y consume RAM del sistema.
- RAM estimada: al menos 4.395 MiB para Q4_0, 5.619 MiB para Q4_0 mixta y 8.300 MiB para Q8_0, más la caché KV correspondiente al contexto configurado.
- CPU x86-64: soporte desde SSE2 hasta AVX-512 VNNI; el binario `ml_run` selecciona automáticamente la build más capaz disponible.
- CPU ARM: ARMv7 con NEON, AArch64 con i8mm y SVE.
- GPU: no se utiliza; no hay soporte CUDA ni ROCm documentado.
- Hilos: el ejemplo oficial usa `-t 4`; el rendimiento escala con los núcleos disponibles, aunque no se publican curvas de escalado.
- Sistemas operativos: Linux x86-64, AArch64 y ARMv7; Windows x86-64 (Krafla 0.8.0 o superior).
- Opciones de despliegue: binarios `ml_run` (CLI) y `ml_server` (API compatible con OpenAI) de las releases de Krafla; no hay soporte de vLLM, llama.cpp, Ollama ni TGI para el formato `.mlb`.
- Latencia y throughput: 24/20/4 tok/s de prefill y 8,7/6,6/4,4 tok/s de decodificación en el hardware de referencia indicado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-8B-krafla (esta ficha) | 8B denso | 40.960 (4.096 por defecto en runtime) | `.mlb` + Krafla (CPU only) | Apache 2.0 | HuggingFace, 0 descargas |
| Qwen/Qwen3-8B (original) | 8B denso | 40.960 | safetensors; vLLM, TGI, transformers | Apache 2.0 | HuggingFace, ampliamente adoptado |
| Qwen3-8B en GGUF (comunidad) | 8B denso | 40.960 | GGUF; llama.cpp, Ollama | Apache 2.0 | Múltiples repos comunitarios |
| Qwen3-8B en GPTQ/AWQ (comunidad) | 8B denso | 40.960 | safetensors cuantizados; GPU | Apache 2.0 | Múltiples repos comunitarios |

La diferencia frente a las alternativas no es de calidad ni de tamaño, sino de ecosistema: Krafla es un runtime de un solo autor, sin integración con las herramientas estándar, mientras que GGUF y los formatos GPU cuentan con soporte amplio. A cambio, esta conversión ofrece métricas reproducibles de perplejidad y velocidad en CPU y builds optimizadas para ISA específicas.

## Limitaciones y advertencias

- Ecosistema muy reducido: solo funciona con Krafla 0.8.0 o superior; no es compatible con llama.cpp, vLLM, Ollama, TGI ni transformers.
- Madurez: repositorio publicado el 3 de noviembre de 2026, con 0 descargas y 0 valoraciones; sin evidencia de uso en producción.
- Contexto efectivo limitado por defecto: aunque los ficheros registran 40.960 posiciones, el runtime usa 4.096 salvo que se pase `--ctx N`, y aumentarlo incrementa el consumo de RAM de la caché KV.
- Pérdida de calidad por cuantización: la perplejidad sube de 12,53 (Q8_0) a 13,14 (Q4_0) en wikitext-2; no se publican evaluaciones de calidad en tareas (razonamiento, código, matemáticas) para cuantificar el impacto real.
- Riesgo de alucinación: inherente al modelo base Qwen3-8B; la cuantización puede agravarlo en tareas de precisión.
- Sesgos: no documentados en esta conversión; se heredan los del modelo base, no evaluados aquí.
- Idiomas: no se especifica la cobertura en esta ficha; depende del tokenizador original de Qwen3-8B.
- Tool calling y agentes: no hay documentación de soporte en el runtime Krafla; no debe asumirse su funcionamiento.
- Licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el runtime ni sobre el soporte a largo plazo.
- Verificación de integridad: los hashes SHA-256 completos están en `SHA256SUMS`; conviene comprobarlos tras la descarga.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jonpark0/Qwen3-8B-krafla
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Repositorio de Krafla: https://github.com/JonPark0/krafla
- Releases de Krafla: https://github.com/JonPark0/krafla/releases
- Guía de usuario (formatos Q8, Q4 y mixto): https://github.com/JonPark0/krafla/blob/main/docs/user-guide.md#q8-q4-or-mixed
- Comparativa con llama.cpp: https://github.com/JonPark0/krafla/blob/main/docs/benchmarks.md
- Commit de conversión: https://github.com/JonPark0/krafla/commit/0b527a04aebd4234ed3c2197bfbb0248a1628ac7

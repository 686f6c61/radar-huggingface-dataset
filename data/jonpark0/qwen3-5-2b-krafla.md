# jonpark0/Qwen3.5-2B-krafla

## Resumen

Qwen3.5-2B-krafla es una conversión de cuantización del modelo Qwen/Qwen3.5-2B, publicada por el desarrollador jonpark0 para el runtime Krafla, un motor de inferencia en C11 sin dependencias externas diseñado para ejecución exclusiva en CPU sobre x86-64 (desde SSE2 hasta AVX-512 VNNI) y ARM (desde ARMv7 NEON hasta i8mm y SVE). No se trata de un modelo nuevo ni de un fine-tune: los pesos derivan directamente de los safetensors del modelo base de Qwen y se transforman a un formato propietario `.mlb` con cuantización de bloque.

El interés de esta publicación es práctico: ofrece una vía para ejecutar un modelo de 2B parámetros en hardware sin GPU, con archivos que van desde 1012 MiB (Q4_0 puro) hasta 1908 MiB (Q8_0), y con métricas de perplejidad y velocidad medidas de forma reproducible sobre un runner con CPU AMD EPYC 9V74 a 4 hilos. El repositorio incluye además un tokenizador convertido (`tokenizer.mlt`) y hashes SHA-256 para verificación de integridad.

La relevancia actual radica en el nicho de despliegue en el borde y en entornos sin acelerador: el runtime soporta un contexto declarado de 262144 posiciones (aunque las herramientas usan 4096 por defecto) y expone una API compatible con OpenAI mediante `ml_server`, lo que facilita la integración con clientes existentes. La licencia Apache 2.0 del modelo original se mantiene.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-2B); detalles internos no disponibles en la informacion proporcionada |
| Parametros totales | 2B (segun el nombre del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262144 posiciones registradas en los archivos; 4096 por defecto en `ml_run`/`ml_server` salvo `--ctx N` |
| Tipos de cuantizacion | Q4_0 (4 bits por matriz), Q4_0 mixta (Q4_0 con `v,o,down` en Q8_0), Q8_0 (8 bits por matriz); escalas f16 por bloque de 32 pesos (4.5 y 8.5 bits por peso) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.mlb` (formato propietario de Krafla); tokenizador en `.mlt`; pesos originales en safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde al modelo base Qwen/Qwen3.5-2B, un transformer de aproximadamente 2000 millones de parámetros. La información proporcionada no detalla la composición del dataset de entrenamiento, el número de tokens, ni si se aplicaron fases de RLHF o DPO; tampoco se especifican innovaciones como decodificación especulativa o atención lineal. Cualquier afirmación al respecto sería especulativa y no se incluye.

Lo que sí está documentado es el proceso de conversión: con Krafla 0.9.0 (commit `a4f30b5`) del 3 de noviembre de 2026 se ejecutaron `tools/convert_tokenizer.py` sobre `tokenizer.json` y `tools/convert.py` en modo `hf` para generar las tres variantes. La cuantización Q4_0 y Q8_0 emplea una escala f16 por cada bloque de 32 pesos, lo que resulta en 4.5 y 8.5 bits efectivos por peso respectivamente. La variante mixta mantiene en Q8_0 las matrices de proyección `v`, `o` y `down`, una decisión habitual para preservar calidad en las capas más sensibles a la cuantización. El runtime Krafla selecciona automáticamente el build más capaz que soporte la CPU (SSE2, AVX2, AVX-512 VNNI, NEON, i8mm, SVE).

## Capacidades

- Generación de texto autoregresiva en modo chat, con plantilla `qwen3.5-nothink` disponible en el runtime.
- Ejecución en CPU exclusivamente, sin necesidad de GPU ni de bibliotecas de terceros (runtime C11 sin dependencias).
- Servido mediante API compatible con OpenAI en `http://127.0.0.1:8080/v1` a través de `ml_server`.
- Soporte de contexto largo a nivel de archivo (262144 posiciones), configurable mediante `--ctx N` para dimensionar la caché KV.
- Multilingüismo: no disponible en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente o razonamiento multi-paso: no disponible en la información proporcionada.
- Visión, audio o modo thinking explícito: no disponible en la información proporcionada (la plantilla `nothink` sugiere la existencia de una variante con razonamiento en el modelo base, pero no se documenta aquí).

## Casos de uso

- Despliegue en servidores sin GPU: el runtime Krafla compila para x86-64 y ARM y no requiere CUDA ni ROCm, por lo que puede ejecutarse en instancias cloud solo-CPU o en servidores de oficina reutilizados, con un consumo de disco de entre 1 y 2 GB según la variante.
- Asistentes conversacionales locales en estaciones de trabajo: con `ml_server` y la API compatible con OpenAI, se puede apuntar cualquier cliente existente (por ejemplo, interfaces tipo chat) al endpoint local y mantener conversaciones multi-turno con 4096 posiciones de contexto por defecto.
- Procesamiento por lotes de texto en el borde: la variante Q4_0 (1012 MiB) cabe en dispositivos con poca memoria y permite tareas de resumen, clasificación o extracción sobre CPU ARM (Raspberry Pi, servidores ARM) gracias a los builds NEON, i8mm y SVE.
- Entornos con requisitos de auditoría y reproducibilidad: los archivos incluyen hashes SHA-256 y el proceso de conversión está documentado con el commit exacto de Krafla, lo que facilita verificar que los pesos derivan del modelo base oficial sin modificaciones.
- Pruebas de integración y CI: al no tener dependencias y ofrecer binarios para Linux x86-64, AArch64, ARMv7 y Windows x86-64, el modelo se puede incluir en pipelines de pruebas que necesiten un generador de texto determinista (decodificación greedy) sin aprovisionar GPU.
- Evaluación comparativa de cuantizaciones: las tres variantes publicadas (Q4_0, Q4_0 mixta y Q8_0) con perplejidad medida sobre wikitext-2 permiten estudiar el compromiso calidad/velocidad/tamaño en un mismo modelo y hardware de referencia.
- Prototipado de aplicaciones de chat offline: útil en escenarios de privacidad donde los datos no deben salir del dispositivo, con la limitación de que el rendimiento en CPU es de decenas de tokens por segundo.

## Benchmarks y rendimiento

Los datos publicados por el autor corresponden a perplejidad en wikitext-2 (4 fragmentos de 512 tokens) y velocidad con `ml_bench -n 128` (128 tokens de prompt y 128 decodificados), medidos en un runner con AMD EPYC 9V74 de 80 núcleos usando 4 hilos y el build `avx2`.

| Archivo | Pesos | Tamano | Perplejidad (wikitext-2) | Prefill (tok/s) | Decode (tok/s) |
|---|---|---:|---:|---:|---:|
| `Qwen3.5-2B-Q4_0.mlb` | Q4_0 en todas las matrices | 1012 MiB | 18.19 | 126 | 31.3 |
| `Qwen3.5-2B-Q4_0-mixed.mlb` | Q4_0 con `v,o,down` en Q8_0 | 1243 MiB | 17.94 | 104 | 26.4 |
| `Qwen3.5-2B-Q8_0.mlb` | Q8_0 en todas las matrices | 1908 MiB | 16.50 | 79 | 17.6 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones con modelos de referencia en esas tareas. La perplejidad solo es comparable entre archivos del mismo modelo, según advierte el propio autor.

## Requisitos de hardware

- VRAM: no aplica; la inferencia es exclusivamente en CPU. La memoria RAM necesaria es aproximadamente el tamaño del archivo más la caché KV: en torno a 1 GB para Q4_0, 1,2 GB para la mixta y 1,9 GB para Q8_0, con overhead adicional según `--ctx N`.
- GPU recomendadas: ninguna; el runtime no usa GPU.
- CPU compatibles: x86-64 con SSE2 como mínimo y AVX2 o AVX-512 VNNI para mejor rendimiento; ARM con ARMv7 NEON, AArch64, i8mm y SVE. El binario `ml_run` selecciona el build más capaz disponible en el procesador.
- ¿Cabe en hardware de consumo? Sí: con 2-4 GB de RAM libre es suficiente para cualquiera de las tres variantes en equipos de escritorio, portátiles y placas SBC ARM.
- Opciones de despliegue: runtime Krafla (`ml_run` para CLI y `ml_server` para API compatible con OpenAI), versiones 0.9.0 o superiores para Linux x86-64, AArch64, ARMv7 y Windows x86-64. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, ya que el formato `.mlb` es propietario.
- Latencia y throughput: según las mediciones del autor en AMD EPYC 9V74 con 4 hilos y build AVX2, la decodificación va de 31,3 tok/s (Q4_0) a 17,6 tok/s (Q8_0), y el prefill de 126 a 79 tok/s. El rendimiento en otras CPU variará según el conjunto de instrucciones disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks estándar del modelo base Qwen/Qwen3.5-2B ni de sus alternativas en la información proporcionada, por lo que una comparación cuantitativa de rendimiento no es posible. La comparación se limita a características de despliegue.

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-2B-krafla (esta ficha) | 2B | 262144 declarado; 4096 por defecto | `.mlb` / Krafla (CPU) | Apache 2.0 | Cuantizaciones Q4_0, mixta y Q8_0; API OpenAI |
| Qwen/Qwen3.5-2B (base) | 2B | no disponible | safetensors / ecosistema HF | Apache 2.0 | Pesos originales sin cuantizar |
| Alternativas de 2B en formato GGUF | no disponible | no disponible | GGUF / llama.cpp | variable | No se dispone de datos concretos en la información proporcionada |

## Limitaciones y advertencias

- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día; no hay evidencia de uso en producción ni validación comunitaria.
- La perplejidad de la variante Q4_0 (18.19) es notablemente superior a la de Q8_0 (16.50), lo que indica una degradación de calidad medible con la cuantización de 4 bits; para tareas sensibles conviene evaluar la mixta o la Q8_0.
- El formato `.mlb` es propietario de Krafla y no es compatible con llama.cpp, vLLM, Ollama ni TGI; migrar a otro runtime requiere reconvertir desde el modelo base.
- El contexto efectivo por defecto es de 4096 posiciones, muy inferior a las 262144 declaradas; usar contextos mayores incrementa la memoria de la caché KV y no se documentan métricas de calidad en contextos largos.
- No se especifican los idiomas soportados; el comportamiento multilingüe del modelo base no está verificado en esta conversión.
- No se documentan sesgos conocidos, tasas de alucinación ni evaluaciones de seguridad para esta conversión; deben asumirse los del modelo base, no disponibles aquí.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda conservar el aviso de licencia y verificar los términos del modelo base Qwen/Qwen3.5-2B.
- El rendimiento medido corresponde a un servidor EPYC con 4 hilos y build AVX2; en portátiles o SBC ARM el throughput será sustancialmente menor.
- La fecha de creación (noviembre de 2026) y la versión del runtime (0.9.0) implican que la herramienta puede estar en evolución; conviene fijar versiones y verificar los hashes SHA-256 antes de desplegar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jonpark0/Qwen3.5-2B-krafla
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Runtime Krafla (GitHub): https://github.com/JonPark0/krafla
- Releases de Krafla: https://github.com/JonPark0/krafla/releases
- Commit de conversión: https://github.com/JonPark0/krafla/commit/a4f30b59b1fdf8c86e118d4584b57247ce3f1c51
- Guía de usuario (formatos Q8/Q4/mixto): https://github.com/JonPark0/krafla/blob/main/docs/user-guide.md#q8-q4-or-mixed
- Comparativa con llama.cpp: https://github.com/JonPark0/krafla/blob/main/docs/benchmarks.md

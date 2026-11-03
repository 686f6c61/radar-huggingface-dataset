# jonpark0/Qwen3.5-9B-krafla

## Resumen

Qwen3.5-9B-krafla es una conversión cuantizada del modelo base Qwen/Qwen3.5-9B, publicada por el usuario jonpark0 para su uso con Krafla, un runtime de inferencia en C11 sin dependencias externas diseñado para ejecución exclusivamente en CPU sobre x86-64 (desde SSE2 hasta AVX-512 VNNI) y ARM (desde ARMv7 NEON hasta i8mm y SVE). El repositorio no contiene un modelo nuevo ni un fine-tuning: es un empaquetado de los pesos originales en formatos propietarios `.mlb` con cuantización INT4 e INT8, más un tokenizador convertido a `.mlt`.

El interés técnico del artefacto reside en el formato y en el runtime, no en el modelo en sí. Frente a alternativas como GGUF para llama.cpp, Krafla propone un contenedor propio (`.mlb`) con cuantizaciones Q4_0 y Q8_0 de bloques de 32 pesos con escalas en f16 (4,5 y 8,5 bits por peso respectivamente), y ofrece binarios precompilados para Linux x86-64, AArch64, ARMv7 y Windows x86-64. El modelo base Qwen3.5-9B aporta una ventana de contexto declarada de 262.144 posiciones, que los ficheros registran pero que el runtime limita por defecto a 4096 posiciones mediante el tamaño de la caché KV.

La relevancia práctica es acotada pero concreta: permite ejecutar un modelo de aproximadamente 9.000 millones de parámetros en CPU sin GPU, con un consumo de memoria que va desde los 4.810 MiB del Q4_0 puro hasta los 9.076 MiB del Q8_0, y con velocidades de decodificación de 5,5 a 10,1 tokens por segundo medidas en un runner con CPU AMD EPYC. Es, por tanto, una opción para entornos sin acelerador, despliegues en el borde o escenarios donde la portabilidad del binario pesa más que el throughput.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.5-9B; el repositorio solo documenta el formato de cuantización) |
| Parametros totales | aproximadamente 9.000 millones (deducido del nombre del modelo base; no confirmado en la informacion disponible) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 posiciones registradas en los ficheros; 4096 posiciones por defecto en `ml_run` y `ml_server`, configurable con `--ctx N` |
| Tipos de cuantizacion | Q4_0 (INT4, 4,5 bits por peso), Q4_0 mixta con `v,o,down` en Q8_0, Q8_0 (INT8, 8,5 bits por peso); escalas f16 por bloque de 32 pesos |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (heredada del modelo base, copiada en el repositorio) |
| Formato de pesos | `.mlb` (formato propietario de Krafla); tokenizador en `.mlt` |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna, los datos de entrenamiento ni el proceso de alineación del modelo base Qwen3.5-9B en la información proporcionada. El repositorio de jonpark0 no documenta estos aspectos: se limita a describir el proceso de conversión desde los safetensors originales mediante las herramientas `tools/convert.py` y `tools/convert_tokenizer.py` de Krafla 0.9.0 (commit `872960d`, 3 de noviembre de 2026).

La innovación técnica documentada es el esquema de cuantización y el runtime. Q4_0 y Q8_0 mantienen una única escala en f16 por cada bloque de 32 pesos, lo que resulta en 4,5 y 8,5 bits efectivos por peso. La variante mixta aplica Q8_0 únicamente a las matrices `v`, `o` y `down` —las proyecciones de atención y la proyección descendente del MLP—, manteniendo el resto en Q4_0, lo que reduce la perplejidad de 10,68 a 10,49 a costa de 1.232 MiB adicionales. Krafla compila variantes específicas por microarquitectura (SSE2, AVX2, AVX-512 VNNI, NEON, i8mm, SVE) y selecciona automáticamente la más capaz en tiempo de ejecución.

## Capacidades

- Generación de texto autoregresiva en modo chat, con una plantilla de chat identificada como `qwen3.5-nothink` en los ejemplos del autor.
- Modo de razonamiento ("thinking") implícito en el nombre de la plantilla de chat alternativo, aunque no se documenta su funcionamiento en el repositorio.
- Servicio compatible con la API de OpenAI mediante `ml_server`, expuesta en `http://127.0.0.1:8080/v1`.
- Ejecución multihilo configurable con el flag `-t` (4 hilos en las mediciones publicadas).
- Control explícito del tamaño de la caché KV mediante `--ctx N`.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling, function calling, agentes o visión: no disponible en la información proporcionada.

## Casos de uso

- Inferencia en servidores sin GPU: el runtime está escrito en C11 sin dependencias y se distribuye como binario para Linux x86-64, AArch64, ARMv7 y Windows x86-64, lo que permite desplegar el modelo en máquinas virtuales de propósito general sin acelerador dedicado.
- Despliegue en dispositivos de borde ARM: la compilación para ARMv7 NEON e i8mm/SVE habilita la ejecución en placas y sistemas embebidos de 64 bits con 6-10 GB de RAM disponible, usando el fichero Q4_0 de 4.810 MiB.
- Sustitución de un endpoint compatible con OpenAI en entornos aislados: `ml_server` expone `/v1` sin dependencias de red externas, útil para pruebas de integración o entornos con restricciones de conectividad.
- Prototipado de asistentes conversacionales con contexto moderado: con los 4096 tokens por defecto de caché KV se cubren conversaciones multi-turno típicas; ampliar con `--ctx N` incrementa el consumo de memoria de forma proporcional.
- Evaluación comparativa de cuantizaciones: los tres ficheros publicados (Q4_0, Q4_0 mixta y Q8_0) permiten medir el compromiso entre perplejidad, tamaño y velocidad en el mismo hardware con el mismo runtime.
- Procesamiento por lotes de baja concurrencia: con 5,5-10,1 tok/s de decodificación, el modelo es viable para tareas asíncronas donde la latencia no es crítica, como resúmenes nocturnos o clasificación de documentos en cola.
- Reproducibilidad y auditoría de formatos: los hashes SHA-256 completos están en `SHA256SUMS` y el proceso de conversión es reproducible con los comandos documentados, lo que facilita la verificación de artefactos en pipelines internos.

## Benchmarks y rendimiento

El autor publica métricas de perplejidad en wikitext-2 (4 fragmentos de 512 tokens, `tools/perplexity.py --ctx 512 --chunks 4`) y de velocidad con `ml_bench -n 128` (128 tokens de prompt y 128 tokens decodificados), medidas en un GitHub runner con CPU AMD EPYC 9V45 de 96 núcleos y 4 hilos, compilación `avx2`.

| Fichero | Pesos | Tamano | Perplejidad | Prefill (tok/s) | Decode (tok/s) |
|---|---|---:|---:|---:|---:|
| `Qwen3.5-9B-Q4_0.mlb` | Q4_0, todas las matrices en 4 bits | 4810 MiB | 10,68 | 37 | 10,1 |
| `Qwen3.5-9B-Q4_0-mixed.mlb` | Q4_0 con `v,o,down` en Q8_0 | 6042 MiB | 10,49 | 31 | 7,9 |
| `Qwen3.5-9B-Q8_0.mlb` | Q8_0, todas las matrices en 8 bits | 9076 MiB | 10,14 | 24 | 5,5 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La perplejidad solo es comparable entre ficheros del mismo modelo, según advierte el propio autor.

## Requisitos de hardware

- VRAM: no aplica; el runtime es exclusivamente de CPU. La memoria del sistema necesaria equivale aproximadamente al tamaño del fichero más el espacio de la caché KV, que crece con `--ctx N`.
- Memoria RAM estimada: unos 4,8 GB para Q4_0, 6,0 GB para Q4_0 mixta y 9,1 GB para Q8_0, más la caché KV correspondiente al contexto configurado.
- CPU x86-64: cualquier procesador con SSE2; se recomienda AVX2 o AVX-512 VNNI para aprovechar las rutas rápidas. Las mediciones publicadas usan AVX2.
- CPU ARM: ARMv7 con NEON, AArch64, y rutas optimizadas para i8mm y SVE.
- GPU: no soportadas por este runtime.
- Despliegue: binarios `ml_run` (CLI) y `ml_server` (API compatible con OpenAI) de las releases de Krafla, versión 0.9.0 o superior. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI con estos ficheros `.mlb`.
- Throughput medido: 37/10,1 tok/s (prefill/decode) en Q4_0, 31/7,9 en Q4_0 mixta y 24/5,5 en Q8_0, con 4 hilos sobre AMD EPYC 9V45. El rendimiento en hardware de consumo no está documentado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-krafla (este) | ~9B | 262.144 registrados; 4096 por defecto en runtime | `.mlb` sobre Krafla (solo CPU) | apache-2.0 | HuggingFace, 0 descargas, 0 likes |
| Qwen/Qwen3.5-9B (base) | ~9B | 262.144 | safetensors; requiere runtime con soporte GPU/CPU | apache-2.0 | HuggingFace (modelo original) |
| Cuantizaciones GGUF de Qwen3.5-9B para llama.cpp | ~9B | depende del runtime | GGUF sobre llama.cpp (CPU y GPU) | apache-2.0 (heredada) | ecosistema amplio, ampliamente testeado |
| Cuantizaciones para Ollama de Qwen3.5-9B | ~9B | depende del runtime | formato Ollama (CPU y GPU) | apache-2.0 (heredada) | integración directa con `ollama run` |

La comparación relevante no es de capacidades del modelo —idénticas al base, al ser una cuantización— sino de ecosistema y madurez del runtime. Krafla es un proyecto de un único autor, con 0 descargas y 0 likes en el momento de la consulta, frente al soporte consolidado de llama.cpp y Ollama. No se dispone de datos de benchmarks que permitan comparar la calidad de salida entre formatos más allá de la perplejidad interna publicada.

## Limitaciones y advertencias

- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (3 de noviembre de 2026). No hay evidencia de uso en producción ni de validación por terceros.
- El runtime Krafla es un proyecto joven (versión 0.9.0) mantenido por un único autor; no se documenta gobernanza, cadencia de parches ni política de seguridad.
- El formato `.mlb` es propietario y no es interoperable con llama.cpp, vLLM, TGI, Ollama ni transformers. Migrar a otro runtime exige reconvertir desde los safetensors originales.
- El contexto efectivo por defecto es de 4096 posiciones, muy inferior a las 262.144 que registran los ficheros; ampliarlo con `--ctx N` incrementa el consumo de RAM de la caché KV sin que se documente la curva exacta.
- La perplejidad publicada (10,14-10,68 en wikitext-2 con solo 4 fragmentos de 512 tokens) procede de una muestra pequeña y no es comparable con la de otros modelos; el propio autor lo advierte.
- No se documentan sesgos, tasas de alucinación ni comportamiento multilingüe del modelo base en este repositorio; deben consultarse en la model card de Qwen/Qwen3.5-9B.
- La licencia apache-2.0 se hereda del modelo base, pero el autor no aporta garantías adicionales sobre los artefactos convertidos.
- Las velocidades publicadas (5,5-10,1 tok/s en decodificación) se midieron en un AMD EPYC 9V45 con 4 hilos; en portátiles o CPUs de consumo el rendimiento será previsiblemente inferior.
- No hay soporte de GPU, lo que descarta este artefacto para cargas de alta concurrencia o baja latencia.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/jonpark0/Qwen3.5-9B-krafla
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio de Krafla: https://github.com/JonPark0/krafla
- Releases de Krafla (binarios): https://github.com/JonPark0/krafla/releases
- Guía de usuario de Krafla (formatos Q8, Q4 y mixto): https://github.com/JonPark0/krafla/blob/main/docs/user-guide.md#q8-q4-or-mixed
- Comparativa con llama.cpp: https://github.com/JonPark0/krafla/blob/main/docs/benchmarks.md
- Commit de conversión: https://github.com/JonPark0/krafla/commit/872960d6e4f2f3e85f171119a207ad806c1b9c64

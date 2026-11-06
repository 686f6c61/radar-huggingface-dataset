# jonpark0/TinyLlama-1.1B-Chat-v1.0-krafla

## Resumen

TinyLlama-1.1B-Chat-v1.0-krafla es una conversión cuantizada del modelo TinyLlama-1.1B-Chat-v1.0, publicada por el usuario jonpark0 para el runtime isa-lm. No se trata de un modelo nuevo ni de un fine-tuning: es el mismo checkpoint de TinyLlama (1,1 mil millones de parámetros, arquitectura transformer decoder-only derivada de Llama 2) empaquetado en formatos propietarios `.mlb` con cuantización INT4 e INT8, junto con un tokenizador en formato `.mlt`. El objetivo es ejecutar el modelo en CPU sin GPU, sin dependencias externas, mediante un runtime escrito en C11.

La relevancia de esta publicación es fundamentalmente de infraestructura: isa-lm ofrece binarios para x86-64 (desde SSE2 hasta AVX-512 VNNI) y ARM (desde ARMv7 NEON hasta i8mm y SVE), lo que permite desplegar un chatbot de 1,1B en hardware muy modesto, incluidos servidores sin acelerador, mini-PC y placas ARM. El autor reporta velocidades medidas en un AMD EPYC 7763 con 4 hilos y build AVX2: hasta 169 tok/s en prefill y 58,4 tok/s en decodificación con la variante Q4_0.

El repositorio tiene 2,6 GB y no registra descargas ni interacciones en el momento de la consulta. La licencia Apache 2.0 del modelo original se mantiene. Los formatos `.mlb` y `.mlt` son específicos de isa-lm y no son compatibles con llama.cpp, vLLM ni Ollama, lo que limita su portabilidad fuera de ese ecosistema.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Llama 2), heredada de TinyLlama-1.1B-Chat-v1.0 |
| Parametros totales | 1,1 mil millones (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 posiciones (fijada en la conversión con `--max-seq 4096`) |
| Tipos de cuantizacion | Q4_0 (4,5 bits/peso), Q4_0 mixta (v, o, down en Q8_0), Q8_0 (8,5 bits/peso) |
| Idiomas soportados | no disponible (el modelo base es mayoritariamente inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.mlb` (formato propietario de isa-lm); tokenizador en `.mlt` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de TinyLlama-1.1B-Chat-v1.0: un transformer decoder-only con 1,1B parámetros, basado en la familia Llama 2, con atención causal estándar y RoPE. Esta ficha no aporta información nueva sobre el entrenamiento del modelo base; el autor solo documenta el proceso de conversión y cuantización, no el preentrenamiento ni el ajuste conversacional original (que en TinyLlama incluye fases de preentrenamiento sobre aproximadamente 3 billones de tokens y un ajuste supervisado/DPO para la variante Chat, según la documentación pública del modelo original, no incluida en esta model card).

La innovación técnica de esta publicación está en el runtime y en el esquema de cuantización. isa-lm es un runtime en C11 sin dependencias que compila rutas SIMD específicas por ISA y selecciona en tiempo de ejecución la más rápida disponible. La cuantización Q4_0 y Q8_0 mantiene una escala en f16 por cada bloque de 32 pesos, lo que resulta en 4,5 y 8,5 bits efectivos por peso respectivamente. La variante mixta conserva en Q8_0 las matrices `v`, `o` y `down` (las más sensibles a la pérdida de precisión) y cuantiza el resto en Q4_0, lo que reduce la perplejidad de 10,56 a 10,37 a cambio de aumentar el tamaño de 590 MiB a 761 MiB. Los archivos se generaron con isa-lm 0.5.0 (commit `622b7f4`) a partir de los safetensors originales.

## Capacidades

- Generación de texto conversacional multi-turno en inglés, con plantilla de chat tipo Zephyr (`--chat zephyr`).
- Respuesta a preguntas factuales sencillas y tareas de conocimiento general de baja complejidad.
- Razonamiento básico de un solo paso; no se documentan modos de pensamiento extendido ni cadenas de razonamiento largas.
- Generación de código y matemáticas elementales, limitada por el tamaño del modelo base.
- Ejecución en CPU pura: x86-64 desde SSE2 hasta AVX-512 VNNI, y ARM desde ARMv7 NEON hasta i8mm y SVE.
- Sin soporte documentado de tool calling, function calling, agentes o multimodalidad en esta conversión.
- Capacidades multilingües no documentadas; el modelo base está orientado principalmente al inglés.

## Casos de uso

- Despliegue en servidores sin GPU: el runtime isa-lm en C11 permite servir el modelo Q4_0 (590 MiB) en máquinas x86-64 o ARM sin CUDA ni ROCm, útil para entornos con restricciones de hardware o de dependencias.
- Asistentes conversacionales embebidos en aplicaciones de escritorio o CLI: la integración mediante `ml_run` con el tokenizador `.mlt` facilita incluir un chatbot local en herramientas de línea de comandos sin servicios externos.
- Prototipado en placas ARM de bajo consumo: la compilación para ARMv7 NEON, AArch64, i8mm y SVE permite ejecutar el modelo en dispositivos tipo Raspberry Pi o servidores ARM, con la variante Q4_0 como opción de menor huella (590 MiB).
- Pruebas de regresión de pipelines de inferencia: los tres archivos con perplejidad y velocidad documentadas (Q4_0, Q4_0 mixta, Q8_0) sirven como referencia reproducible para validar cambios en el runtime o en el hardware.
- Evaluación comparativa de cuantizaciones: la tabla del autor permite medir el compromiso entre tamaño, perplejidad en wikitext-2 y throughput (por ejemplo, Q4_0 a 58,4 tok/s frente a Q8_0 a 33,0 tok/s en el mismo hardware).
- Educación y experimentación: al ser un modelo de 1,1B con licencia Apache 2.0 y binarios precompilados, es adecuado para aprender sobre cuantización, SIMD y despliegue en CPU sin requerir infraestructura de GPU.
- Generación de texto offline en entornos aislados: al no depender de servicios en la nube ni de librerías externas, encaja en escenarios con requisitos de privacidad o conectividad limitada.

## Benchmarks y rendimiento

El autor publica perplejidad en wikitext-2 (4 fragmentos de 512 tokens) y velocidad con `ml_bench -n 128` (128 tokens de prompt y 128 decodificados) en un AMD EPYC 7763 de 64 núcleos con 4 hilos y build AVX2. No se aportan resultados en MMLU, HumanEval, GSM8K ni otras suites estándar.

| Archivo | Pesos | Tamano | Perplejidad (wikitext-2) | Prefill (tok/s) | Decode (tok/s) |
|---|---|---|---|---|---|
| Q4_0 | 4 bits en todas las matrices | 590 MiB | 10,56 | 169 | 58,4 |
| Q4_0 mixta | Q4_0 con v, o, down en Q8_0 | 761 MiB | 10,37 | 140 | 46,4 |
| Q8_0 | 8 bits en todas las matrices | 1115 MiB | 10,31 | 108 | 33,0 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM: no aplica; el modelo está diseñado para ejecutarse en CPU. El requisito es memoria RAM: aproximadamente 590 MiB (Q4_0), 761 MiB (Q4_0 mixta) o 1115 MiB (Q8_0) para los pesos, más overhead del runtime y del contexto.
- GPU recomendadas: no aplica; isa-lm no usa GPU.
- CPU: x86-64 con SSE2 o superior (hasta AVX-512 VNNI) y ARM desde ARMv7 NEON hasta i8mm y SVE. El runtime selecciona automáticamente la ruta SIMD más rápida.
- Cabe en hardware consumer: sí, en cualquier CPU moderna de escritorio o portátil con al menos 2 GB de RAM libre; también en placas ARM de bajo consumo.
- Opciones de despliegue: exclusivamente isa-lm 0.5.0 o superior (Linux x86-64, AArch64, ARMv7 y Windows x86-64) mediante el binario `ml_run`. No es compatible con vLLM, llama.cpp, Ollama, TGI ni transformers sin conversión adicional.
- Latencia y throughput: medidos en AMD EPYC 7763 con 4 hilos y build AVX2: 169/58,4 tok/s (prefill/decode) para Q4_0, 140/46,4 para Q4_0 mixta y 108/33,0 para Q8_0. El rendimiento en otros procesadores no está documentado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TinyLlama-1.1B-Chat-v1.0-krafla (esta ficha) | 1,1B | 4096 | `.mlb` / isa-lm (CPU) | Apache 2.0 | Hugging Face, 0 descargas |
| TinyLlama-1.1B-Chat-v1.0 (original) | 1,1B | 2048 (según model card original) | safetensors / transformers, vLLM | Apache 2.0 | Hugging Face, ampliamente usado |
| TinyLlama en GGUF (p. ej. TheBloke) | 1,1B | 2048 | GGUF / llama.cpp, Ollama | Apache 2.0 | Hugging Face, muy usado |
| Qwen2.5-1.5B-Instruct | 1,5B | 32 768 | safetensors, GGUF | Apache 2.0 | Hugging Face, muy usado |

La comparación directa con el original y con las conversiones GGUF es la más pertinente: esta versión amplía el contexto a 4096 posiciones y ofrece un runtime sin dependencias, pero queda restringida al ecosistema isa-lm. Frente a modelos más recientes de tamaño similar como Qwen2.5-1.5B-Instruct, TinyLlama es anterior y con menor contexto nativo, aunque la conversión aquí descrita no modifica las capacidades del modelo base.

## Limitaciones y advertencias

- Modelo de 1,1B parámetros: capacidad de razonamiento, conocimiento factual y calidad de código limitadas; propenso a errores en tareas que requieran múltiples pasos o conocimiento especializado.
- Riesgo de alucinación inherente al modelo base, especialmente en preguntas factuales fuera de su distribución de entrenamiento.
- Idiomas soportados no documentados; el modelo base está entrenado principalmente en inglés y su rendimiento en castellano no está verificado.
- Contexto limitado a 4096 posiciones en esta conversión; no se documenta soporte de ventanas mayores.
- Formato `.mlb` propietario: no hay interoperabilidad con llama.cpp, vLLM, Ollama ni transformers; migrar a otro runtime requiere reconvertir desde los safetensors originales.
- Sin soporte documentado de tool calling, agentes o multimodalidad; no debe asumirse en producción.
- Repositorio sin descargas ni validación comunitaria; los únicos datos de rendimiento son los publicados por el autor en un hardware concreto (EPYC 7763, 4 hilos, AVX2).
- La licencia Apache 2.0 permite uso comercial, pero se heredan las limitaciones y sesgos del modelo base; conviene revisar la model card original de TinyLlama antes de un despliegue en producción.
- El SHA-256 de los archivos está parcialmente truncado en la model card; las sumas completas se remiten a `SHA256SUMS` del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jonpark0/TinyLlama-1.1B-Chat-v1.0-krafla
- Modelo base: https://huggingface.co/TinyLlama/TinyLlama-1.1B-Chat-v1.0
- Repositorio del runtime isa-lm: https://github.com/JonPark0/isa-lm
- Releases de isa-lm: https://github.com/JonPark0/isa-lm/releases
- Guía de usuario (formatos Q8, Q4 y mixto): https://github.com/JonPark0/isa-lm/blob/main/docs/user-guide.md#q8-q4-or-mixed
- Comparativa con llama.cpp: https://github.com/JonPark0/isa-lm/blob/main/docs/benchmarks.md
- Commit de conversión: https://github.com/JonPark0/isa-lm/commit/622b7f41f392f8a2ef64837b641e62ba09cf1e4d

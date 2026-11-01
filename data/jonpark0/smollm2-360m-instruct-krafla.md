# jonpark0/SmolLM2-360M-Instruct-krafla

## Resumen

SmolLM2-360M-Instruct-krafla es una conversión cuantizada del modelo SmolLM2-360M-Instruct de HuggingFaceTB, empaquetada en el formato propietario `.mlb` del runtime isa-lm. No se trata de un modelo nuevo ni de un reentrenamiento: el autor (jonpark0) parte de los pesos safetensors originales y los convierte a INT4 (Q4_0) e INT8 (Q8_0) para su ejecución en CPU sin GPU a través de isa-lm, un runtime en C11 sin dependencias externas.

El modelo base es un transformer decoder-only de 360 millones de parámetros con 4096 posiciones de contexto, pensado para instrucciones y conversación ligera. La relevancia de esta ficha reside en el formato de despliegue: isa-lm permite inferencia en x86-64 (desde SSE2 hasta AVX-512 VNNI) y ARM (ARMv7 NEON, i8mm y SVE), lo que habilita ejecutar el modelo en hardware muy modesto, incluidos servidores sin acelerador y dispositivos embebidos.

El repositorio ocupa 0,6 GB e incluye dos variantes de pesos (194 MiB en Q4_0 y 367 MiB en Q8_0) más el tokenizador convertido. La licencia Apache 2.0 del modelo original se mantiene. Es un artefacto de nicho, orientado a quien ya use isa-lm o quiera evaluar inferencia LLM puramente en CPU con un modelo pequeño.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de SmolLM2-360M-Instruct) |
| Parametros totales | 360 millones (modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 4096 posiciones |
| Tipos de cuantizacion | Q4_0 (4 bits, escala f16 por bloque de 32 pesos, 4,5 bits/peso), Q8_0 (8 bits, escala f16 por bloque de 32 pesos, 8,5 bits/peso) |
| Idiomas soportados | no disponible (la model card no los declara) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.mlb` (formato propietario de isa-lm); tokenizador en `.mlt` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del SmolLM2-360M-Instruct original: un transformer decoder-only con atención causal estándar, sin mezcla de expertos ni mecanismos híbridos. Esta ficha no aporta información sobre el entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO), ya que la model card de la conversión no lo detalla; esos datos deben consultarse en la ficha de HuggingFaceTB/SmolLM2-360M-Instruct.

La innovación técnica de este repositorio es el pipeline de conversión y el runtime. Los pesos se convierten con `tools/convert.py` de isa-lm 0.5.0 (commit 622b7f4) usando cuantización por bloques: Q4_0 y Q8_0 almacenan una escala en f16 por cada bloque de 32 pesos, lo que resulta en 4,5 y 8,5 bits efectivos por peso respectivamente. El runtime isa-lm selecciona en tiempo de ejecución la build más rápida soportada por la CPU (SSE2, AVX2, AVX-512 VNNI, ARM NEON, i8mm o SVE) y no requiere dependencias externas más allá de la librería C estándar.

## Capacidades

- Generación de texto y respuesta a instrucciones de un turno, con plantilla de chat `smollm` integrada en `ml_run`.
- Conversación multi-turno mediante el modo `--chat smollm` del runtime.
- Razonamiento básico y respuesta a preguntas factuales simples (el ejemplo de la model card responde correctamente a la capital de Francia).
- Ejecución completamente en CPU, sin GPU ni librerías de aceleración externas.
- Portabilidad de instrucciones SIMD: x86-64 desde SSE2 hasta AVX-512 VNNI y ARM desde ARMv7 NEON hasta i8mm y SVE.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Inferencia en servidores sin GPU: el runtime isa-lm funciona en cualquier x86-64 con SSE2, de modo que se puede desplegar generación de texto en máquinas virtuales baratas o contenedores sin acelerador, con 194 MiB de pesos en Q4_0.
- Dispositivos embebidos y ARM: la compatibilidad con ARMv7 NEON, i8mm y SVE permite ejecutar el modelo en placas SBC y sistemas empotrados donde no cabe un runtime con dependencias pesadas.
- Pruebas de humo y CI: al ser un binario C11 sin dependencias, encaja en pipelines de integración para validar pipelines de tokenización, plantillas de chat o lógica de inferencia sin aprovisionar GPU.
- Asistentes locales de bajo consumo: para tareas de respuesta breve (clasificación, extracción, resúmenes cortos) en entornos de escritorio o terminal, el modelo Q4_0 ofrece 130,8 tok/s de decodificación con 4 hilos en un EPYC 7763.
- Evaluación comparativa de runtimes: sirve para medir latencia y perplejidad de isa-lm frente a llama.cpp u otros motores en el mismo hardware, usando los valores de referencia publicados (perplejidad 21,73 en Q4_0 y 17,45 en Q8_0 sobre wikitext-2).
- Educación y prototipado: un modelo de 360M con contexto de 4096 tokens y licencia Apache 2.0 es adecuado para experimentar con cuantización, plantillas de chat y despliegue en CPU sin coste de infraestructura.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son de perplejidad y velocidad, medidos en un GitHub runner (AMD EPYC 7763, 4 hilos, build AVX2). No hay resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar.

| Metrica | Q4_0 | Q8_0 |
|---|---|---|
| Tamano de pesos | 194 MiB | 367 MiB |
| Perplejidad (wikitext-2, 4 chunks de 512 tokens) | 21,73 | 17,45 |
| Prefill (tok/s, 128 tokens de prompt) | 480 | 319 |
| Decode (tok/s, 128 tokens generados) | 130,8 | 82,2 |

La perplejidad solo es comparable entre archivos del mismo modelo; no se ofrecen cifras del modelo original en fp16 para contrastar la pérdida por cuantización.

## Requisitos de hardware

- VRAM: no aplica; la inferencia es exclusivamente en CPU. El consumo de RAM ronda los 194 MiB (Q4_0) y 367 MiB (Q8_0) para los pesos, más el estado de activaciones y KV cache para 4096 posiciones.
- GPU recomendadas: ninguna; isa-lm no usa GPU.
- CPU compatible: x86-64 con SSE2 o superior (AVX2 y AVX-512 VNNI recomendados para máximo rendimiento); ARMv7 con NEON, AArch64 con i8mm y SVE.
- Cabe en cualquier equipo consumer: un portátil o SBC actual puede ejecutarlo; no requiere GPU dedicada.
- Despliegue: binario `ml_run` de isa-lm 0.5.0 o superior (Linux x86-64, AArch64, ARMv7 y Windows x86-64). No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que el formato `.mlb` es propietario.
- Latencia y throughput: 480 tok/s de prefill y 130,8 tok/s de decode en Q4_0 con 4 hilos sobre EPYC 7763; en Q8_0, 319 tok/s de prefill y 82,2 tok/s de decode.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Runtime |
|---|---|---|---|---|---|
| SmolLM2-360M-Instruct-krafla (esta ficha) | 360M | 4096 | `.mlb` (Q4_0/Q8_0) | Apache 2.0 | isa-lm (CPU) |
| HuggingFaceTB/SmolLM2-360M-Instruct | 360M | 4096 | safetensors (fp16/bf16) | Apache 2.0 | Transformers, llama.cpp, etc. |
| Qwen2.5-0.5B-Instruct | 500M | 32 768 | safetensors, GGUF | Apache 2.0 | Amplio ecosistema |
| Llama-3.2-1B-Instruct | 1,2B | 131 072 | safetensors, GGUF | Llama 3.2 Community License | Amplio ecosistema |

La comparativa se limita a datos de parámetros, contexto y licencia; no se dispone de resultados de benchmarks comunes para contrastar rendimiento. La ventaja diferencial de esta conversión es el despliegue en CPU sin dependencias; su desventaja es el ecosistema reducido del formato `.mlb`.

## Limitaciones y advertencias

- Modelo de 360M parámetros: capacidad de razonamiento, conocimiento factual y calidad de código muy limitadas frente a modelos de 7B o superiores; propenso a errores en tareas complejas.
- Riesgo de alucinación elevado en preguntas factuales fuera de dominios comunes, inherente al tamaño del modelo base.
- Idiomas soportados no declarados en la model card; el modelo base SmolLM2 está entrenado mayoritariamente en inglés, por lo que el rendimiento en castellano será previsiblemente inferior.
- Contexto máximo de 4096 posiciones; no admite ventanas más largas.
- Formato `.mlb` propietario: no se puede cargar con llama.cpp, Ollama, vLLM ni Transformers; obliga a usar isa-lm y a migrar si se quiere cambiar de runtime.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia y las condiciones del modelo base original antes de redistribuir.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni de validación comunitaria.
- Las cifras de rendimiento proceden de un único entorno (EPYC 7763, 4 hilos, AVX2); en hardware consumer o ARM serán inferiores.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/jonpark0/SmolLM2-360M-Instruct-krafla
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
- Runtime isa-lm: https://github.com/JonPark0/isa-lm
- Releases de isa-lm: https://github.com/JonPark0/isa-lm/releases
- Guía de usuario (formatos Q8/Q4): https://github.com/JonPark0/isa-lm/blob/main/docs/user-guide.md#q8-q4-or-mixed
- Comparativa con llama.cpp: https://github.com/JonPark0/isa-lm/blob/main/docs/benchmarks.md
- Commit de conversión: https://github.com/JonPark0/isa-lm/commit/622b7f41f392f8a2ef64837b641e62ba09cf1e4d

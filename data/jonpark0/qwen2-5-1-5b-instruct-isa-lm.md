# jonpark0/Qwen2.5-1.5B-Instruct-isa-lm

## Resumen

Qwen2.5-1.5B-Instruct-isa-lm es una conversión cuantizada del modelo Qwen2.5-1.5B-Instruct de Alibaba Qwen, publicada por el desarrollador jonpark0. No se trata de un modelo nuevo ni de un reentrenamiento: es el mismo modelo base empaquetado en formatos INT4 e INT8 propietarios del runtime isa-lm, un motor de inferencia en C11 sin dependencias externas que ejecuta modelos de lenguaje en CPU sin necesidad de GPU.

El interés de esta ficha no reside en el modelo lingüístico en sí, sino en el formato de despliegue. isa-lm está diseñado para funcionar en arquitecturas x86-64 desde SSE2 hasta AVX-512 VNNI, y en ARM desde ARMv7 NEON hasta i8mm y SVE, lo que permite ejecutar un modelo de 1.500 millones de parámetros en hardware modesto, servidores sin acelerador o dispositivos embebidos. Los ficheros `.mlb` incluyen los pesos cuantizados con escalas f16 por bloque de 32 pesos (4,5 bits por peso en Q4_0 y 8,5 bits por peso en Q8_0), y el tokenizador se distribuye por separado en formato `.mlt`.

La relevancia actual es la de una alternativa ligera a llama.cpp y Ollama para escenarios donde el binario único, la ausencia de dependencias y la portabilidad entre ISA resultan críticos. El modelo conserva la licencia Apache 2.0 del original y un contexto de 4.096 posiciones, suficiente para asistentes conversacionales, clasificación de texto y tareas de extracción en producción de bajo coste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5), cuantizado para runtime isa-lm |
| Parametros totales | 1.500 millones (1,5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 posiciones (fijado en la conversión con `--max-seq 4096`) |
| Tipos de cuantizacion | Q4_0 (4,5 bits/peso), Q4_0 mixta con `v,o,down` en Q8_0, Q8_0 (8,5 bits/peso) |
| Idiomas soportados | no disponible (heredados del Qwen2.5-1.5B-Instruct original; la model card no los detalla) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.mlb` (formato propio de isa-lm); tokenizador en `.mlt` |
| Tamanos de fichero | 829 MiB (Q4_0), 1.049 MiB (Q4_0 mixta), 1.565 MiB (Q8_0) |
| Perplejidad (wikitext-2) | 14,66 (Q4_0) / 13,64 (Q4_0 mixta) / 12,71 (Q8_0) |
| Runtime | isa-lm 0.5.0 o superior (Linux x86-64, AArch64, ARMv7; Windows x86-64) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen2.5-1.5B-Instruct, un transformer decoder-only de 1.500 millones de parámetros desarrollado por Alibaba Qwen, con atención causal estándar y sin mezcla de expertos. Sobre ese modelo no se ha realizado ningún entrenamiento adicional: la contribución de jonpark0 es exclusivamente la conversión de pesos desde los safetensors originales a los formatos `.mlb` de isa-lm, realizada el 1 de noviembre de 2026 con la versión 0.5.0 del runtime (commit `622b7f4`).

La cuantización emplea el esquema Q4_0 y Q8_0 con una escala f16 por bloque de 32 pesos, idéntico en concepto al de llama.cpp. La variante mixta mantiene en Q8_0 las matrices de proyección `v`, `o` y `down`, que son las más sensibles a la pérdida de precisión, y deja el resto en Q4_0; esto reduce la perplejidad de 14,66 a 13,64 a cambio de un 26,5 % más de tamaño (829 MiB a 1.049 MiB). El contexto se fija a 4.096 posiciones durante la conversión, por debajo de los 32.768 tokens nativos de Qwen2.5, lo que supone una limitación deliberada del empaquetado.

La innovación técnica relevante está en el runtime, no en el modelo: isa-lm es un binario C11 sin dependencias que selecciona en tiempo de ejecución la implementación más rápida disponible (SSE2, AVX2, AVX-512 VNNI, NEON, i8mm, SVE) y expone comandos como `ml_run` y `ml_bench`. No se documentan detalles sobre el dataset de entrenamiento original, el proceso de RLHF o DPO ni la composición de tokens; esa información corresponde a la model card de Qwen2.5-1.5B-Instruct, no a este repositorio.

## Capacidades

- Generación de texto conversacional multi-turno en modo chat, con plantilla Qwen seleccionable mediante `--chat qwen`.
- Razonamiento básico y respuesta a preguntas de conocimiento general; la model card incluye el ejemplo "What is the capital of France?" con respuesta correcta en una frase.
- Generación de código y texto estructurado, heredada de las capacidades del Qwen2.5-1.5B-Instruct original.
- Ejecución en CPU pura sin GPU, con soporte para x86-64 (SSE2 a AVX-512 VNNI) y ARM (ARMv7 NEON, AArch64, i8mm, SVE).
- Tres perfiles de precisión/velocidad intercambiables (Q4_0, Q4_0 mixta, Q8_0) con tokenizador compartido.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Asistentes conversacionales en servidores sin GPU: el binario isa-lm y los pesos Q4_0 (829 MiB) caben en cualquier VPS con 2 GB de RAM, lo que permite desplegar un chatbot de soporte de primer nivel sin coste de acelerador.
- Procesamiento por lotes en clústeres CPU: con 197 tok/s de prefill y 49,8 tok/s de decodificación en un EPYC de 4 hilos, es viable clasificar, resumir o extraer entidades de grandes volúmenes de documentos en infraestructura ya existente.
- Despliegue en dispositivos ARM embebidos: el soporte de ARMv7 NEON y SVE permite ejecutar el modelo en placas de bajo consumo o gateways industriales para tareas de etiquetado y enrutamiento de texto.
- Entornos aislados o air-gapped: al ser un binario C11 sin dependencias y con pesos en un único fichero, se puede auditar y desplegar en sistemas sin gestor de paquetes ni acceso a red.
- Prototipado rápido y CI: el tamaño reducido y la ausencia de dependencias facilitan incluirlo en pipelines de pruebas para validar prompts, plantillas y flujos conversacionales antes de escalar a modelos mayores.
- Aplicaciones de privacidad estricta: al ejecutarse íntegramente en local, los datos no salen del equipo, lo que encaja en sectores regulados que no pueden enviar texto a APIs externas.
- Educación y experimentación: la comparación de perplejidad y velocidad entre Q4_0, mixta y Q8_0 sirve para estudiar el impacto de la cuantización en un modelo pequeño con métricas reproducibles.

## Benchmarks y rendimiento

La model card proporciona perplejidad en wikitext-2 (4 fragmentos de 512 tokens) y velocidad medida con `ml_bench -n 128` (128 tokens de prompt y 128 decodificados) en un AMD EPYC 9V45 de 96 núcleos con 4 hilos y build AVX2:

| Fichero | Pesos | Tamano | Perplejidad | Prefill (tok/s) | Decode (tok/s) |
|---|---|---:|---:|---:|---:|
| Q4_0 | 4 bits en todas las matrices | 829 MiB | 14,66 | 197 | 49,8 |
| Q4_0 mixta | Q4_0 con `v,o,down` en Q8_0 | 1.049 MiB | 13,64 | 164 | 39,7 |
| Q8_0 | 8 bits en todas las matrices | 1.565 MiB | 12,71 | 127 | 26,8 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM: no aplica; el modelo está diseñado para ejecutarse en CPU. La memoria RAM necesaria ronda los 1 GB para Q4_0, 1,2 GB para la variante mixta y 1,7 GB para Q8_0, más el overhead del runtime.
- GPU recomendadas: no aplica; isa-lm no utiliza GPU.
- CPU compatibles: x86-64 desde SSE2 (builds AVX2 y AVX-512 VNNI disponibles) y ARM desde ARMv7 NEON hasta AArch64 con i8mm y SVE.
- Cabe en hardware de consumo: sí, en cualquier portátil o mini-PC con al menos 2 GB de RAM libre; no requiere tarjeta gráfica.
- Opciones de despliegue: isa-lm 0.5.0 o superior (`ml_run`, `ml_bench`), con binarios para Linux x86-64, AArch64, ARMv7 y Windows x86-64. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, ya que el formato `.mlb` es propietario.
- Latencia y throughput: 197 tok/s de prefill y 49,8 tok/s de decodificación para Q4_0 en un EPYC 9V45 con 4 hilos y build AVX2; en CPUs de consumo y en ARM los valores serán previsiblemente inferiores, aunque no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-1.5B-Instruct-isa-lm (este) | 1,5B | 4.096 | `.mlb` / isa-lm (CPU) | Apache 2.0 | HuggingFace, 0 descargas |
| Qwen2.5-1.5B-Instruct (original) | 1,5B | 32.768 | safetensors / transformers, vLLM | Apache 2.0 | HuggingFace, ampliamente usado |
| Qwen2.5-1.5B-Instruct GGUF (llama.cpp) | 1,5B | 32.768 (configurable) | GGUF / llama.cpp, Ollama | Apache 2.0 | HuggingFace, ecosistema maduro |
| SmolLM2-1.7B-Instruct | 1,7B | 8.192 | safetensors, GGUF | Apache 2.0 | HuggingFace |

La comparación directa con las conversiones GGUF es la más pertinente: ambas ofrecen cuantización de 4 y 8 bits para CPU, pero el ecosistema de llama.cpp cuenta con mucha más adopción, herramientas y variantes de cuantización, mientras que isa-lm apuesta por un binario C11 sin dependencias y cobertura explícita de ISA x86 y ARM. Frente al modelo original, esta conversión pierde contexto (4.096 frente a 32.768) y compatibilidad con frameworks estándar.

## Limitaciones y advertencias

- El contexto está recortado a 4.096 posiciones, muy por debajo de los 32.768 nativos de Qwen2.5-1.5B-Instruct; no sirve para tareas de contexto largo.
- El formato `.mlb` es propietario de isa-lm: no se puede cargar con transformers, vLLM, llama.cpp ni Ollama, lo que limita la portabilidad y obliga a usar el runtime del autor.
- Con 1,5B parámetros, la tasa de alucinación en conocimiento factual es alta y el razonamiento multi-paso es limitado; no es adecuado para tareas que exijan precisión factual sin verificación.
- La cuantización Q4_0 degrada la perplejidad de 12,71 (Q8_0) a 14,66; para tareas sensibles conviene la variante mixta o Q8_0.
- No se documentan sesgos específicos ni evaluación de seguridad en esta conversión; los sesgos heredados del modelo original no están auditados en la model card.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin señales de validación por parte de la comunidad.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar las condiciones del runtime isa-lm y del modelo base por separado.
- Las métricas de velocidad proceden de un único entorno (EPYC 9V45, 4 hilos, AVX2); el rendimiento en otras CPUs o en ARM no está medido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jonpark0/Qwen2.5-1.5B-Instruct-isa-lm
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio isa-lm: https://github.com/JonPark0/isa-lm
- Releases de isa-lm: https://github.com/JonPark0/isa-lm/releases
- Guía de usuario (formatos Q8, Q4 y mixto): https://github.com/JonPark0/isa-lm/blob/main/docs/user-guide.md#q8-q4-or-mixed
- Comparativa con llama.cpp: https://github.com/JonPark0/isa-lm/blob/main/docs/benchmarks.md
- Commit de conversión: https://github.com/JonPark0/isa-lm/commit/622b7f41f392f8a2ef64837b641e62ba09cf1e4d

# SkyIsNotGreen/Scion-35B-A3B

## Resumen

Scion-35B-A3B es una cuantización agresiva de 2 bits del modelo MoE empero-ai/Qwen3.8-35B-A3B-Distill, publicada por el usuario SkyIsNotGreen. El modelo conserva los 34.893.918.848 parámetros del original (35B-A3B, arquitectura Mixture of Experts con aproximadamente 3B de parámetros activos por token) pero comprime los bancos de expertos a un cuerpo ternario de 2,125 bpw sobre el que se injertan pequeñas correcciones entrenadas, sin maestros en precisión completa ni QAT del modelo completo. El resultado es un único archivo GGUF de 11,34 GB (2,61 bpw) para llama.cpp, 6,3 veces más pequeño que la referencia BF16 y 1,9 veces más pequeño que Q4_K_M.

El problema que resuelve es el de servir un MoE de 35B en hardware de consumo: el archivo completo cabe en una GPU de 20 GB (RX 7900 XT) y, según el autor, mantiene una perplejidad (PPL) mejor que cualquier otro modelo de su clase de 2 bits, con retención de tareas a nivel de Q4 a la mitad del tamano de Q4_K_M. El modelo base es un destilado de la familia Qwen3.8, por lo que hereda el comportamiento conversacional y de razonamiento del linaje Qwen3, aunque la model card solo declara inglés como idioma soportado.

La relevancia actual está en la combinación de tres piezas: un contenedor de cuantización propio (Q2_0_g128, tipo GGUF 142, antes llamado PQ2_0), un runtime bifurcado de llama.cpp con correcciones en tiempo de carga, y una cabeza drafter MTP opcional de 96 MiB que acelera la decodificación especulativa entre un 7% y un 33% según la carga. Es, por tanto, un artefacto de ingeniería de cuantización más que un modelo nuevo, y debe evaluarse como tal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), tipo transformer, derivada de Qwen3.8; cuerpo ternario con correcciones entrenadas |
| Parametros totales | 34.893.918.848 (34,9B) |
| Parametros activos | A3B (aproximadamente 3B activos por token, segun la nomenclatura del modelo base) |
| Longitud de contexto | No disponible en la informacion proporcionada (el ejemplo de la model card usa `--max-context 4096`) |
| Tipos de cuantizacion | Contenedor propietario Q2_0_g128 (alias PQ2_0), 2 bits por peso a grupo de 128, tipo GGUF 142; 2,61 bpw efectivos con correcciones |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); repo de 22,9 GB con el archivo principal de 11,34 GB y sidecar MTP de 96 MiB |

## Arquitectura y entrenamiento

El modelo base es un MoE de la familia Qwen3.8 con 34,9B parámetros totales y aproximadamente 3B activos, destilado por empero-ai. Scion no reentrena ese modelo: cuantiza los bancos de expertos a un esquema ternario de 2,125 bpw y luego entrena correcciones de baja dimensión que se injertan sobre ese cuerpo ternario (de ahí el nombre, un esqueje injertado sobre un patrón). No hay maestros en precisión completa ni un proceso de QAT sobre el modelo entero, lo que abarata enormemente la producción del artefacto frente a pipelines convencionales de cuantización consciente del entrenamiento.

El contenedor Q2_0_g128 (tipo GGUF 142) usa 34 bytes por cada 128 valores, pero el autor advierte explícitamente de que no es el mismo bitstream que TQ2_T aunque comparta ese ratio, ni es el TQ2_0 estándar de grupo 256. Las correcciones se aplican en tiempo de carga mediante una bifurcación del runtime de llama.cpp (rama `moe-corr-runtime` del repositorio prism-ml-llama.cpp). El autor publica además un estudio forense del proceso (`bonsai2-ternary-forensics`) y scripts de construcción en el repositorio `sky-is-green/scion`. La decodificación especulativa se apoya en una cabeza drafter MTP de k=1 entrenada sobre los estados ocultos del propio motor Strata, no sobre los de llama.cpp, por lo que no es intercambiable con otras cabezas.

## Capacidades

- Generación de texto conversacional multi-turno, con modo de razonamiento (thinking) activable; el dato de GSM8K del 88,7% pass@1 se mide con thinking.
- Razonamiento matemático de nivel escolar y competición moderada (GSM8K reportado).
- Generación de código y de estructuras serializadas: JSON, YAML y tablas Markdown citadas explícitamente entre las cargas de prueba del drafter.
- Decodificación especulativa con drafter MTP opcional, con tasas de aceptación del 56% al 96% según la carga.
- Salida determinista en modo greedy con prompt fijo: ocho peticiones consecutivas reproducen el texto byte a byte, incluido reinicio en frío.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no disponible en la información proporcionada.
- Multilingüismo: limitado a inglés según la model card.
- Visión y audio: no disponibles.

## Casos de uso

- Despliegue de un MoE de 35B en una única GPU de consumo: con 11,34 GB de archivo, el modelo completo reside en una RX 7900 XT de 20 GB y deja margen para contexto y reserva de VRAM (`--vram-reserve-mib 3072` en el ejemplo del autor), lo que permite servir un modelo de esta clase en estaciones de trabajo con una sola tarjeta.
- Generación de código y documentación técnica estructurada: las cargas de JSON, YAML y tablas Markdown del drafter muestran que el modelo se usa para producir salidas serializadas; con 59% de aceptación especulativa en esas tareas, el rendimiento se mantiene por encima de los 126 tok/s en una RX 7900 XT.
- Razonamiento matemático por lotes: con 88,7% en GSM8K pass@1 en modo thinking, es adecuado para pipelines offline de resolución de problemas aritméticos donde el coste por token importa más que la latencia interactiva.
- Servicio conversacional de baja latencia en inglés: 118 tok/s en greedy y aproximadamente 8,5 ms por token generado a contexto 4096 permiten sostener un chat interactivo con un solo usuario o un grupo reducido por tarjeta.
- Evaluación e investigación en cuantización extrema: el artefacto sirve como referencia reproducible para estudiar la degradación de un MoE a 2,61 bpw, con estudio forense publicado y scripts de construcción disponibles.
- Pruebas de decodificación especulativa: la cabeza MTP de 96 MiB y el runtime Strata permiten medir tasas de aceptación por tipo de carga (técnica, estructurada, repetitiva, fuera de distribución) sin reentrenar el modelo objetivo.
- Generación de texto repetitivo o de formato fijo (plantillas, informes): en texto repetitivo el drafter alcanza 96% de aceptación y +33% de velocidad, por lo que es un escenario donde el modo especulativo aporta de forma clara.

## Benchmarks y rendimiento

Los datos publicados por el autor se centran en velocidad y en una única métrica de calidad (GSM8K). No se han publicado resultados de MMLU, HumanEval ni otros benchmarks estándar en la información disponible.

| Metrica | Valor | Condiciones |
|---|---|---|
| GSM8K pass@1 | 88,7% | Con thinking, segun la figura de la model card |
| Generacion (greedy, 128 tokens) | 118,0-118,2 tok/s | RX 7900 XT, Strata, contexto 4096 |
| Lectura de prompt (38 tokens) | 480-482 tok/s | RX 7900 XT, Strata |
| Latencia por token generado | ~8,5 ms | Contexto 4096, archivo completo residente |
| Generacion con drafter MTP (prompt fijo) | 141,5-142,3 tok/s (+20%) | Aceptacion 76% |
| Generacion con drafter MTP (prompts tecnicos, 400 tokens) | 155,1 tok/s (+32%) | Aceptacion 94% |
| Generacion con drafter MTP (prompts estructurados) | 126,7 tok/s (+8%) | Aceptacion 59% |
| Generacion con drafter MTP (fuera de distribucion) | 125,9 tok/s (+7%) | Aceptacion 56-61% |
| Generacion con drafter MTP (texto repetitivo, 800 tokens) | 155,6 tok/s (+33%) | Aceptacion 96% |

Aceptación del drafter por longitud en el prompt fijo: 83% a 64 tokens, 76% a 128, 71% a 256, 70% a 400 y 67% a 800. El autor advierte de que la verificación por lotes del drafter puede alterar empates cercanos (diferencias de logits de aproximadamente 0,03), de modo que las generaciones largas con drafter no son idénticas bit a bit a las del camino plano.

## Requisitos de hardware

- VRAM estimada: 11,34 GB para el archivo principal; el autor recomienda `--vram-reserve-mib 3072` en su ejemplo, lo que sugiere un objetivo práctico de 14-15 GB con contexto de 4096. El sidecar MTP anade 96 MiB.
- GPU validadas: RX 7900 XT (20 GB, gfx1100) es la única tarjeta con mediciones publicadas. Por tamano, cabría también en RTX 4090 (24 GB), RTX 4080 (16 GB) con poco margen y GPUs de 16 GB en general; no hay mediciones del autor en hardware NVIDIA.
- GPU de consumo: sí, en tarjetas de 16 GB o más; en 12 GB no cabe el archivo completo.
- Despliegue: llama.cpp con la bifurcación `prism-ml-llama.cpp` (rama `moe-corr-runtime`) para las correcciones en carga, y el motor propietario Strata (`strata-q36`) para las mediciones de velocidad y el drafter MTP. No se documenta compatibilidad con vLLM, TGI ni Ollama en la información proporcionada.
- Throughput: 118 tok/s en generación y 480 tok/s en lectura de prompt sobre una RX 7900 XT; hasta 155 tok/s con drafter en cargas favorables.
- Determinismo: reproducible byte a byte en greedy con prompt fijo, incluido reinicio en frío.

## Comparativa con modelos similares

| Modelo | Parametros | Tamano en disco | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Scion-35B-A3B | 34,9B totales / ~3B activos | 11,34 GB (2,61 bpw) | No disponible | Apache 2.0 | Mejor PPL de su clase de 2 bits segun el autor; requiere runtime bifurcado |
| Q4_K_M del mismo base | 34,9B totales / ~3B activos | ~21,5 GB (1,9x mayor) | No disponible | Apache 2.0 | Referencia de calidad; el autor afirma retencion de tareas a nivel Q4 con la mitad de tamano |
| IQ2_M del mismo base | 34,9B totales / ~3B activos | ~12,5 GB (1,1x mayor) | No disponible | Apache 2.0 | Referencia de la clase 2 bits; Scion declara mejor PPL |
| TQ2_0 / TQ2_T (contenedores ternarios estandar) | Depende del modelo | Depende del modelo | No disponible | Segun modelo | Mismo ratio de 34 bytes por 128 valores, bitstream distinto; no intercambiables |

La comparación se limita al mismo modelo base y a contenedores de cuantización equivalentes, porque no se han publicado comparaciones con otros modelos de la misma categoría en la información disponible.

## Limitaciones y advertencias

- Solo inglés declarado; no se garantiza comportamiento en castellano ni en otros idiomas.
- La cuantización a 2,61 bpw introduce degradación respecto a BF16 y Q4; el propio autor la presenta como retención "a nivel de Q4", no como equivalencia exacta.
- El contenedor Q2_0_g128 no es estándar: requiere la bifurcación de llama.cpp o el motor Strata. No funcionará en llama.cpp upstream ni en la mayoría de herramientas de inferencia convencionales.
- La cabeza drafter MTP está entrenada sobre los estados ocultos de Strata y no es intercambiable con cabezas de otros runtimes (una cabeza ajena alcanza solo 38% de aceptación).
- El drafter puede alterar empates de logits cercanos y producir texto distinto al camino plano en generaciones largas; debe tratarse como opción de velocidad, no bit-exacta.
- Riesgo de alucinación: no cuantificado en la información disponible; aplicable el riesgo habitual de un modelo destilado de 35B en modo thinking.
- Sesgos conocidos: no documentados en la model card.
- Longitud de contexto máxima: no disponible; el ejemplo de despliegue usa 4096 tokens.
- Licencia Apache 2.0 permite uso comercial, pero la cadena de modelos base (empero-ai/Qwen3.8-35B-A3B-Distill) debería verificarse de forma independiente antes de producción.
- Las mediciones de rendimiento provienen de un único hardware (RX 7900 XT) y de un motor propio del autor; no hay validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SkyIsNotGreen/Scion-35B-A3B
- Discusiones: https://huggingface.co/SkyIsNotGreen/Scion-35B-A3B/discussions
- Repositorio de scripts y documentación: https://github.com/sky-is-green/scion
- Estudio forense de la cuantización ternaria: https://github.com/sky-is-green/bonsai2-ternary-forensics
- Bifurcación del runtime llama.cpp: https://github.com/sky-is-green/prism-ml-llama.cpp/tree/moe-corr-runtime
- Modelo base: https://huggingface.co/empero-ai/Qwen3.8-35B-A3B-Distill
- Documento de nombres de contenedor: https://huggingface.co/SkyIsNotGreen/Scion-35B-A3B/blob/main/CONTAINER-NAMES.md

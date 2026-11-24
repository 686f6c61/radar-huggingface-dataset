# SkyIsNotGreen/Scion-35B-A3B

## Resumen

Scion-35B-A3B es una cuantización agresiva en formato GGUF de un modelo MoE (mezcla de expertos) de 35B parámetros totales, desarrollada por el usuario SkyIsNotGreen. El modelo base es `empero-ai/Qwen3.8-35B-A3B-Distill`, una destilación de la familia Qwen3.8 con arquitectura MoE. Scion aplica bancos de expertos ternarios (2 bits) junto con pequeñas correcciones entrenadas, sin maestros de precisión completa ni QAT sobre el modelo entero, logrando un archivo de 11,34 GB a 2,61 bits por peso. El resultado es un MoE completo de 35B-A3B en un único GGUF ejecutable en llama.cpp, unas 6,3 veces más pequeño que la referencia BF16 y aproximadamente la mitad del tamaño de Q4_K_M.

El proyecto se centra en la eficiencia extrema de almacenamiento y en la retención de capacidades a nivel de cuantización Q4 pese a ocupar espacio de 2 bits. Incluye además un cabezal drafter opcional MTP (multi-token prediction) de 96 MiB para decodificación especulativa, y una variante Q4 gate/up de 16,2 GB orientada a maximizar capacidad. El modelo está pensado para despliegue local en GPU de consumo y para investigación sobre cuantización ternaria de MoE.

La licencia es Apache 2.0 y el idioma declarado es únicamente inglés. La relevancia actual radica en que demuestra que los expertos ternarios con correcciones entrenadas pueden acercarse a la retención de tareas de cuantizaciones de 4 bits con la mitad del espacio, un punto crítico para servir modelos grandes en hardware limitado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) tipo transformer, base Qwen3.8; expertos ternarios con correcciones entrenadas |
| Parametros totales | 34.893.918.848 (≈35B) |
| Parametros activos | A3B (≈3B activos, segun nomenclatura del modelo base) |
| Longitud de contexto | no disponible (los ejemplos de inferencia usan contexto 4096) |
| Tipos de cuantizacion | Q2_0_g128 (antes PQ2_0, tipo GGUF 142, 2 bits, grupo 128); Q4_0_g128; TQ1_0_g128; variante Q4 gate/up con TQ1 en down (tipos 147/143) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); tamano del repo 39,1 GB; archivo principal 11,34 GB a 2,61 bpw |

## Arquitectura y entrenamiento

El modelo parte de `empero-ai/Qwen3.8-35B-A3B-Distill`, un MoE de la familia Qwen3.8 con aproximadamente 35B parámetros totales y unos 3B activos por token. Scion no es un QAT completo ni conserva maestros en precisión completa: sustituye los bancos de expertos por una representación ternaria a 2,125 bpw y les injerta pequeñas correcciones entrenadas ("scion" hace referencia al injerto vegetal). El contenedor de expertos es `Q2_0_g128`, el códec de 2 bits de Q2_0 con grupo de 128 (tipo GGUF 142), que no equivale al `TQ2_0` estándar de grupo 256 ni comparte bitstream con `TQ2_T`, aunque ambos usen 34 bytes por cada 128 valores.

El proyecto incluye un estudio forense propio (`bonsai2-ternary-forensics`) y scripts de construcción en el repositorio GitHub. Se distribuyen variantes con distintos contenedores (Q2_0_g128, Q4_0_g128, TQ1_0_g128) y una build Q4 gate/up de 16,2 GB que mantiene los mismos pesos y correcciones v1 pero almacena los expertos gate/up a 4 bits. Esta última requiere el fork `scion-base` de llama.cpp para los tipos 147/143 y no carga en llama.cpp estándar ni en el visor GGUF de Hugging Face. No se detalla en la información disponible el volumen de tokens de entrenamiento del modelo base ni la composición del dataset de destilación.

## Capacidades

- Generación de texto conversacional y razonamiento con modo "thinking" (el dato de 88,7% en GSM8K pass@1 se mide con thinking).
- Razonamiento matemático: GSM8K pass@1 de 88,7% según la model card.
- Generación de código y texto estructurado (JSON, YAML, tablas Markdown), con rendimiento medido en prompts estructurados.
- Decodificación especulativa mediante cabezal drafter MTP opcional (k=1, 96 MiB) que propone el siguiente token a partir del estado oculto del modelo objetivo.
- Capacidades multilingües limitadas al inglés según la declaración de idiomas.
- No se documenta soporte explícito de tool calling, function calling ni flujos de agentes multi-paso en la información disponible.
- No se documenta soporte de visión ni audio.

## Casos de uso

- Despliegue local en GPU de consumo: el archivo de 11,34 GB cabe completo en una GPU de 20 GB como la RX 7900 XT, permitiendo servir un MoE de 35B en hardware de gama alta doméstica sin offloading a CPU.
- Servicio de inferencia de alto rendimiento en una sola tarjeta: con Strata se miden 118 tok/s de generación y 480 tok/s de lectura de prompt, adecuado para asistentes interactivos de baja latencia.
- Aceleración con decodificación especulativa: el drafter MTP eleva el throughput entre un 7% y un 33% según el tipo de prompt, útil en cargas de generación larga y texto técnico.
- Investigación en cuantización ternaria: sirve como referencia reproducible para estudiar la retención de capacidades de expertos a 2 bits frente a Q4, con scripts de construcción y estudio forense publicados.
- Generación de texto estructurado en pipelines: los prompts de JSON, YAML y tablas Markdown mantienen rendimiento con el drafter (59% de aceptación), útil para extracción y formateo automatizado.
- Prototipado de razonamiento matemático y técnico: el 88,7% en GSM8K con thinking permite usar el modelo para resolución de problemas en entornos de desarrollo y validación.

## Benchmarks y rendimiento

| Metrica | Resultado | Contexto |
|---|---|---|
| GSM8K pass@1 (con thinking) | 88,7% | Segun model card |
| Subconjunto duro congelado (hard-subset30), archivo Q2 11,3 GB | 5/30 | Build principal |
| Subconjunto duro congelado (hard-subset30), variante Q4 gate/up 16,2 GB | 12/30 | Requiere fork scion-base |
| Generacion (greedy, 128 tokens) | 118,0-118,2 tok/s | RX 7900 XT, Strata, contexto 4096 |
| Lectura de prompt (38 tokens) | 480-482 tok/s | RX 7900 XT, Strata |
| Generacion con drafter MTP, prompt fijo | 141,5-142,3 tok/s (+20%) | Aceptacion 76% |
| Generacion con drafter, seis prompts tecnicos (400 tokens) | 155,1 tok/s (+32%) | Aceptacion 94% |
| Generacion con drafter, prompts estructurados | 126,7 tok/s (+8%) | Aceptacion 59% |
| Generacion con drafter, prompts fuera de distribucion | 125,9 tok/s (+7%) | Aceptacion 56-61% |
| Generacion con drafter, texto repetitivo (800 tokens) | 155,6 tok/s (+33%) | Aceptacion 96% |
| Latencia por token | ~8,5 ms/token | Contexto 4096, una tarjeta |

No se han publicado resultados de MMLU, HumanEval ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada: 11,34 GB para el archivo Q2 principal (2,61 bpw); 16,2 GB para la variante Q4 gate/up.
- GPU recomendadas: RX 7900 XT (20 GB, gfx1100) es la tarjeta de referencia medida; cualquier GPU con al menos 12-16 GB de VRAM para el archivo Q2, y 20 GB o más para la variante Q4.
- Cabe en GPU de consumo: sí, en tarjetas de 16-24 GB (por ejemplo, RX 7900 XT, RTX 4080/4090 con margen para contexto). La variante Q4 requiere al menos 20 GB.
- Opciones de despliegue: llama.cpp (fork `scion-base` para tipos 147/143; fork `prism-ml-llama.cpp` rama `moe-corr-runtime` para Q2), runtime Strata (motor propio del proyecto), y binarios precompilados en las releases de scion-llama.cpp. No se documenta compatibilidad con vLLM, TGI ni Ollama.
- Latencia y throughput: ~8,5 ms/token y 118 tok/s de generación en una RX 7900 XT con Strata; 480 tok/s de lectura de prompt; con drafter MTP hasta 155 tok/s en texto técnico.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano de pesos | Licencia | Notas |
|---|---|---|---|---|---|
| Scion-35B-A3B (Q2_0_g128) | 35B totales, ~3B activos | no disponible | 11,34 GB (2,61 bpw) | Apache 2.0 | Retencion a nivel Q4 segun autor; requiere fork de llama.cpp |
| Q4_K_M del modelo base | 35B totales, ~3B activos | no disponible | ~1,9x mayor que Scion | Apache 2.0 (base) | Cuantizacion estandar, compatible con llama.cpp estandar |
| IQ2_M del modelo base | 35B totales, ~3B activos | no disponible | ~1,1x mayor que Scion | Apache 2.0 (base) | Cuantizacion de 2 bits estandar de llama.cpp |

La comparación con alternativas de otros autores no está disponible en la información proporcionada; los datos de tamaño relativo proceden de la propia model card.

## Limitaciones y advertencias

- La cuantización a 2 bits introduce pérdida de capacidad: en el subconjunto duro congelado el archivo Q2 obtiene 5/30 frente a 12/30 de la variante Q4 gate/up, lo que indica degradación en tareas difíciles.
- El drafter MTP no es bit-exacto: en generaciones libres largas el texto puede divergir del decodificado plano por empates cercanos en los logits, con efecto cascada. No debe tratarse como opción de reproducibilidad exacta.
- La variante Q4 gate/up y los tipos 147/143 requieren un fork específico de llama.cpp; no cargan en llama.cpp estándar ni en el visor GGUF de Hugging Face.
- Idioma limitado al inglés; no se declara soporte multilingüe.
- Riesgo de alucinación inherente a modelos de lenguaje; no se documentan evaluaciones de factualidad.
- No se documentan sesgos conocidos ni evaluaciones de seguridad en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero las dependencias de forks no estándar de llama.cpp pueden condicionar el soporte en producción.
- El rendimiento medido (118 tok/s) corresponde al runtime Strata con el archivo intacto y las correcciones aplicadas en carga; no se garantiza el mismo throughput en otros motores.

## Enlaces

- Hugging Face: https://huggingface.co/SkyIsNotGreen/Scion-35B-A3B
- Discusiones: https://huggingface.co/SkyIsNotGreen/Scion-35B-A3B/discussions
- GitHub del proyecto (scripts y documentación): https://github.com/sky-is-green/scion
- Estudio forense ternario: https://github.com/sky-is-green/bonsai2-ternary-forensics
- Runtime Scion precompilado: https://github.com/sky-is-green/scion-llama.cpp/releases/tag/scion-v1.0.0
- Fork scion-base de llama.cpp: https://github.com/sky-is-green/scion-llama.cpp/tree/scion-base
- Runtime legacy para Q2: https://github.com/sky-is-green/prism-ml-llama.cpp/tree/moe-corr-runtime
- Modelo base: https://huggingface.co/empero-ai/Qwen3.8-35B-A3B-Distill

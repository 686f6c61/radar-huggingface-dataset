# darrellbest/DeepSeek-V4.1-Flash-1017-CoderPlus240-GGUF

## Resumen

DeepSeek-V4.1-Flash-1017-CoderPlus240 es una derivación independiente del modelo DeepSeek-V4.1-Flash-1017 de DeepSeek, publicada por el usuario darrellbest en Hugging Face. Se trata de una versión GGUF cuantizada a IQ2_XXS (2,00 bits por peso) que parte del build GSQ-RCO de ISTA-DASLab y modifica únicamente la selección de expertos: en lugar de los 192 expertos enrutados por capa del build Coder de ISTA, conserva 240 de los 384 originales. El objetivo declarado es llenar exactamente una GPU de 96 GB con todos los expertos residentes en memoria, sin depender de CPU ni SSD para los pesos enrutados.

El modelo base es un transformer MoE de 40 capas con 384 expertos enrutados por capa, de los que el router selecciona 6 por token y capa. El repositorio declara 348.008.277.848 parámetros totales (unos 348 mil millones) y un tamaño de 88,7 GB repartido en cuatro shards GGUF. La licencia es MIT y la librería es gguf, con pipeline de text-generation.

La relevancia de esta ficha es doble: por un lado, documenta una técnica de poda selectiva de expertos (RCO, del paper arXiv:2604.18556) y su extensión manual para recuperar cobertura de enrutamiento; por otro, ilustra un patrón de despliegue de modelos MoE masivos en hardware único de gama alta mediante cuantización extrema. No se han publicado resultados de benchmarks en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (40 capas, 384 expertos enrutados por capa, top-6 por token) |
| Parámetros totales | 348.008.277.848 (348,0 B) |
| Parámetros activos | no disponible (6 de 240 expertos por token y capa tras la poda) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | IQ2_XXS (2,00 bpw) en los pesos del modelo; Engram en IQ4_NL |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (4 shards, 88,7 GB) |

## Arquitectura y entrenamiento

El modelo base DeepSeek-V4.1-Flash-1017 es un transformer de 40 capas con arquitectura Mixture-of-Experts: cada capa contiene 384 expertos enrutados y un router que selecciona 6 por token. El build original sin podar ocupa 132 GB solo en expertos enrutados, lo que impide su residencia completa en una GPU de 96 GB. ISTA-DASLab publicó un build GSQ-RCO (cuantización GSQ a 2,00 bpw más selección de expertos RCO, KL-óptima sobre datos de calibración de código y agentes) que reduce a 192 expertos por capa, 66 GB, dejando unos 18 GB libres en una tarjeta de 96 GB.

CoderPlus240 no reentrena ni recuantiza: parte byte a byte del build IQ2_XXS de ISTA-DASLab y solo recorta cinco tensores por capa a lo largo del eje de expertos (`ffn_gate_exps`, `ffn_up_exps`, `ffn_down_exps`, `ffn_gate_inp` y `exp_probs_b`), fijando `deepseek41.expert_count` a 240. Los 48 expertos añadidos por capa se eligen puntuando los 192 expertos descartados por ISTA según su cuota de selecciones del router en dos perfiles (el perfil hot-expert que distribuye Strata y el mismo perfil tras uso local con unas 483.000 tokens de sesiones de agente de código y benchmarks). El resultado recupera la cobertura de enrutamiento del build sin podar del 62,0 % al 82,4 % de media, y del 59,3 % al 86,5 % en uso local. El autor verificó la integridad byte a byte en 2.008 tensores y expertos. El modelo requiere el motor `strata-dsv41` de Strata y no se ha probado en llama.cpp.

## Capacidades

- Generación de texto y razonamiento sobre el modelo base DeepSeek-V4.1-Flash-1017.
- Generación de código: el build Coder de ISTA-DASLab se calibra específicamente sobre código y uso agéntico de herramientas.
- Uso agéntico de herramientas (tool calling): la selección de expertos de ISTA se optimiza sobre datos de agentes y tool use.
- Contexto largo: la calibración RCO incluye datos de contexto largo, aunque la longitud exacta de contexto no está disponible.
- Capacidades de visión: la selección de expertos de ISTA también cubre visión, según la model card.
- Decodificación especulativa: el despliegue previsto usa el drafter DSpark de unsloth (`dspark-DeepSeek...`), no incluido en este repositorio.
- Tablas Engram: requiere el fichero `DeepSeek-V4.1-Flash-Engram-IQ4_NL.gguf` (110,6 GB) en SSD, leído unas pocas filas por token.
- Capacidades multilingües: no disponible.

## Casos de uso

- Despliegue de un MoE de 348 B en una única GPU de 96 GB: con 82,6 GB de expertos enrutados y unos 7 GB de otros pesos, el modelo cabe entero en una tarjeta (por ejemplo, H100 NVL de 94 GB o variantes de 96 GB) sin descarga a CPU, lo que elimina la latencia de transferencia PCIe en cada token.
- Asistente de código en producción: el build Coder de ISTA se calibra sobre código y tool use, y CoderPlus240 recupera cobertura de enrutamiento (86,5 % en uso local), lo que se traduce en menos tokens enrutados a segundas opciones y, por tanto, en salidas más fieles al modelo sin podar.
- Agentes autónomos multi-paso: el modelo base soporta tool calling y razonamiento multi-paso; la selección de expertos incluye datos de sesiones agénticas, adecuado para pipelines de agentes que encadenan llamadas a herramientas.
- Inferencia con decodificación especulativa: el despliegue previsto combina el modelo con el drafter DSpark de unsloth para acelerar la generación, útil en cargas interactivas de baja latencia.
- Evaluación comparativa de técnicas de poda de expertos: el repositorio incluye `expert-selection/CoderPlus240.kept-experts.json` con los 240 IDs por capa (los 192 de ISTA y los 48 añadidos), lo que permite reproducir y auditar la selección en experimentos de investigación.
- Recuperación de conocimiento mediante tablas Engram: el fichero Engram IQ4_NL de 110,6 GB se mantiene en SSD y se lee por filas, útil para cargas donde la memoria de la GPU está saturada por los expertos.
- Prototipado en investigación con licencia permisiva: la licencia MIT permite uso comercial y modificación, adecuado para equipos que necesitan un MoE grande sin restricciones de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo aporta métricas internas de cobertura de enrutamiento, no de calidad de tarea:

| Métrica de enrutamiento | Coder (192) | CoderPlus240 (240) |
|---|---:|---:|
| Cobertura media del perfil hot-expert de Strata | 62,0 % | 82,4 % |
| Cobertura mínima por capa (mismo perfil) | 55,1 % | 79,8 % |
| Cobertura media en uso local (~483.000 tokens) | 59,3 % | 86,5 % |
| Cobertura mínima por capa en uso local (capa 23) | 30,5 % | 88,1 % |

## Requisitos de hardware

- VRAM estimada: 82,6 GB de expertos enrutados más unos 7 GB de otros pesos; el autor indica que cabe en una GPU de 96 GB con unos 1,5 GB de margen. Cada experto adicional por capa cuesta 344 MB.
- GPU recomendadas: una única GPU de 96 GB (por ejemplo, H100 NVL de 94 GB o variantes de 96 GB). No cabe en RTX 4090 (24 GB), A100 de 40 GB ni A100 de 80 GB.
- Consumer GPU: no cabe en ninguna GPU de consumo actual.
- Almacenamiento adicional: el fichero Engram IQ4_NL (110,6 GB) debe residir en SSD y se lee unas pocas filas por token; el drafter DSpark de unsloth también es necesario para decodificación especulativa.
- Opciones de despliegue: exclusivamente el motor `strata-dsv41` de Strata, según el autor. No se ha probado en llama.cpp, vLLM, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Expertos por capa | Tamaño en disco | Licencia | Despliegue |
|---|---|---:|---:|---|---|
| CoderPlus240 (este) | 348,0 B | 240 de 384 | 88,7 GB | MIT | strata-dsv41, 1 GPU de 96 GB |
| ISTA-DASLab Coder (base de esta poda) | 348,0 B | 192 de 384 | ~73 GB (66 GB expertos) | MIT | strata-dsv41, 1 GPU de 96 GB con ~18 GB libres |
| ISTA-DASLab IQ2_XXS sin podar | 348,0 B | 384 de 384 | ~139 GB (132 GB expertos) | MIT | requiere CPU/SSD para ~40 % de expertos |
| DeepSeek-V4.1-Flash-1017 (original, safetensors) | 348,0 B | 384 de 384 | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo se ha probado en el motor `strata-dsv41` de Strata; no hay validación en llama.cpp ni en otros runtimes GGUF, lo que limita su portabilidad.
- Requiere dos ficheros externos no incluidos: las tablas Engram IQ4_NL (110,6 GB) y el drafter DSpark de unsloth; sin ellos el despliegue no es completo.
- La cuantización IQ2_XXS (2,00 bpw) es extremadamente agresiva; el autor no aporta benchmarks de calidad que cuantifiquen la pérdida frente al modelo sin cuantizar.
- El formato GGUF no permite un número distinto de expertos por capa; el autor señala que la capa 23 tiene una cobertura de solo el 88,1 % incluso tras añadir expertos, lo que sugiere que una asignación por capa sería mejor pero no es expresable.
- El modelo es una derivación independiente, no un release oficial de ISTA-DASLab ni de DeepSeek; el autor lo declara explícitamente.
- Riesgo de alucinación y sesgos: no disponible en la información proporcionada.
- Idiomas soportados: no disponible; no se puede confirmar cobertura multilingüe.
- Licencia MIT: permite uso comercial, pero conviene verificar las condiciones del modelo base DeepSeek-V4.1-Flash-1017 y del build de ISTA-DASLab del que deriva.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validación comunitaria.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/darrellbest/DeepSeek-V4.1-Flash-1017-CoderPlus240-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Build GSQ-RCO de ISTA-DASLab: https://huggingface.co/ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF
- Build Coder de ISTA-DASLab: https://huggingface.co/ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-Coder-GGUF
- GGUF de unsloth (drafter DSpark): https://huggingface.co/unsloth/DeepSeek-V4.1-Flash-1017-GGUF
- Repositorio ISTA-DASLab: https://github.com/IST-DASLab
- Paper RCO: arXiv:2604.18556
- Paper GSQ: arXiv:2605.00649

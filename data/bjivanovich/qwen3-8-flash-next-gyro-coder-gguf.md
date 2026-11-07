# bjivanovich/Qwen3.8-Flash-Next-Gyro-Coder-GGUF

## Resumen

Qwen3.8-Flash-Next Gyro-Coder es una cuantización GGUF extrema del modelo base Qwen/Qwen3.8-Flash-Next, un modelo de mezcla de expertos (MoE) de 125.000 millones de parámetros orientado a generación de código. La publica el usuario bjivanovich (repositorio original atribuido a la organización agentionai) y su objetivo es hacer viable la inferencia de un modelo de ese tamaño en una única GPU de consumo de 24 GB, algo que normalmente exigiría una estación de trabajo con varias GPUs.

La técnica empleada no es una cuantización convencional: se conservan únicamente 256 de los 512 expertos de cada capa, seleccionados mediante búsqueda evolutiva por su relevancia para programación, y los pesos resultantes se almacenan con un codificador «trellis» propio a 2,125 bits por peso. El resultado son 19,92 GiB de pesos en GPU (21,1 GiB con contexto de 64k y KV en q8_0), con una tasa de coincidencia top-1 del 93 % en Python y del 94,5 % en C++ respecto al modelo completo.

Es relevante ahora porque demuestra que un MoE de 125B puede ejecutarse en hardware de consumo manteniendo una fidelidad alta en tareas de código, aunque a costa de perder capacidades de conocimiento general y trabajo abierto. Requiere una compilación específica de llama.cpp (agentionai/llama.cpp o strix-llama.cpp), por lo que no funciona en llama.cpp estándar, LM Studio ni Ollama.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE), modelo base Qwen3.8-Flash-Next; 512 expertos por capa, 256 retenidos en esta cuantización |
| Parámetros totales | 65.314.218.880 (65,3B en safetensors del modelo base cuantizado); modelo base original de 125B |
| Parámetros activos | no disponible |
| Longitud de contexto | 64k documentado en el cálculo de memoria (q8_0 KV); límite máximo del modelo base no disponible |
| Tipos de cuantización | TQ2_0 (2,125 bits por peso, Gyro-Coder) y TQ3_0 (~3,2 bits por peso, Gyro-Coder-L); variantes con y sin tabla n-gram (PLE) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como «other» en el Hub) |
| Formato de pesos | GGUF (con tabla PLE Q8_0 opcional en fichero separado) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 512 expertos por capa y 125B de parámetros totales. Esta ficha no dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO en el modelo original.

La innovación de esta cuantización es doble. Primero, la selección de expertos: se mapeó qué expertos cubren qué dominios y, mediante búsqueda evolutiva, se propusieron y puntuaron unas 2.200 combinaciones de conjuntos de expertos en 14 ejecuciones sobre un espacio de aproximadamente 10^7328 combinaciones posibles; los mejores candidatos se construyeron como modelos completos y se sometieron a pruebas de código, bucles y conocimiento. Cada capa conserva 256 de sus 512 expertos, lo que deja 65B parámetros en GPU. Segundo, la codificación: los expertos se almacenan con un codificador trellis propio a 2,125 bits por peso, el mismo que en la variante Gyro-M supera en calidad a cuantizaciones IQ3_XXS y UD-Q2_K_XL que ocupan entre un 20 % y un 25 % más de memoria.

La variante Gyro-Coder-L emplea unos 3,2 bits por peso (27,54 GiB) y, según el autor, supera a Gyro-Coder en todos los conjuntos medidos e incluso se acerca más al modelo completo que Gyro-M en C++, pese a que Gyro-M conserva los 512 expertos. La versión v1.2 de Gyro-Coder-L corrige la rotura de etiquetas de tool calling (0 etiquetas `<parameter=` rotas en 100 sitios muestreados frente a 4 en v1.0) y los números romanos, sin cambios en KLD.

## Capacidades

- Generación de código en múltiples lenguajes: C++, Python, TypeScript/JavaScript y SQL están evaluados explícitamente en la model card.
- Tareas de edición de código con instrucciones claras: implementar, corregir, refactorizar y explicar.
- Tool calling / function calling: soportado, con corrección específica de las etiquetas de parámetros en Gyro-Coder-L v1.2 (292 llamadas a herramientas, 0 errores de formato).
- Razonamiento multi-paso y uso en agentes: el autor reporta sesiones de agente reales para la validación de tool calls.
- Conversación multi-turno (tag «conversational» en el Hub).
- Compatibilidad con endpoints (tag «endpoints_compatible»).
- Capacidades de conocimiento general y trabajo abierto: limitadas; el autor recomienda Gyro-S o Gyro-M para esos casos.
- Capacidades multilingües: no disponibles.
- Visión, audio o modo thinking: no disponibles.

## Casos de uso

- Autocompletado y generación de código en IDE sobre GPU de consumo: con 19,92 GiB de pesos cabe en una RTX 3090, 4090 o 7900 XTX, permitiendo un asistente local de 65B efectivos sin depender de la nube.
- Refactorización guiada por instrucciones: el modelo mantiene un 93,1 % de coincidencia top-1 con el modelo completo en Python, suficiente para tareas de «implementa esto», «corrige aquello» o «extrae esta función» con revisión humana.
- Agentes de código con tool calling: la variante Gyro-Coder-L v1.2 no produjo etiquetas de parámetro rotas en 100 sitios muestreados ni errores de formato en 292 llamadas, lo que la hace apta para pipelines de agente que invocan herramientas externas.
- Generación y revisión de SQL: evaluado en el conjunto SQL con KLD 0,145 y 92,7 % top-1 (Gyro-Coder) y KLD 0,114 y 93,6 % (Gyro-Coder-L), adecuado para asistentes de consultas en entornos con datos sensibles que no pueden salir a la nube.
- Desarrollo frontend y backend en TypeScript/JavaScript: KLD 0,142 y 92,5 % top-1 en Gyro-Coder, 0,108 y 93,7 % en Gyro-Coder-L, útil para generación de componentes y APIs.
- Despliegue en estaciones de trabajo con 32 GB (RTX 5090, R9700): la variante Gyro-Coder-L ofrece mayor fidelidad (27,54 GiB) para equipos que no pueden permitirse varias GPU.
- Entornos air-gapped o con requisitos de privacidad: al ejecutarse con llama.cpp local y pesos descargables, permite código propietario sin salir de la infraestructura propia.

## Benchmarks y rendimiento

Divergencia KL y coincidencia top-1 frente al modelo completo (Q8_0, 512 expertos), con `-c 2048`:

| Conjunto | Gyro-Coder KLD ↓ | top-1 ↑ | Gyro-Coder-L KLD ↓ | top-1 ↑ |
|---|---:|---:|---:|---:|
| C++ (ficheros reservados) | 0,118 | 94,5 % | 0,077 | 95,5 % |
| Web (TypeScript / JS) | 0,142 | 92,5 % | 0,108 | 93,7 % |
| SQL | 0,145 | 92,7 % | 0,114 | 93,6 % |
| Python | 0,165 | 93,1 % | no disponible | no disponible |

Pruebas de tareas de código (autoevaluadas, 8 tareas × 2 semillas):

| Modelo | Tareas superadas |
|---|---|
| Gyro-Coder (TQ2_0) | 13/16 |
| Mismos expertos a 8 bits | 15/16 |
| Gyro-M (512 expertos, 34,98 GiB) | KLD 0,082 en C++ |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM para pesos: 19,92 GiB (Gyro-Coder TQ2_0) y 27,54 GiB (Gyro-Coder-L TQ3_0).
- VRAM con contexto: 21,1 GiB con 64k de contexto y KV en q8_0 para Gyro-Coder, lo que cabe en una tarjeta de 24 GB.
- GPU recomendadas: RTX 3090, RTX 4090 y Radeon RX 7900 XTX (24 GB) para Gyro-Coder; RTX 5090 y R9700 (32 GB) para Gyro-Coder-L; 48 GB o más para Gyro-M.
- Cabe en GPU de consumo: sí, en las tarjetas de 24 GB y 32 GB indicadas.
- Opciones de despliegue: exclusivamente compilaciones específicas de llama.cpp (agentionai/llama.cpp desde 2026-11-05 o strix-llama.cpp). Soporte de Strata anunciado como próximo. llama.cpp estándar, LM Studio y Ollama no pueden cargar estos ficheros; tampoco los ficheros `-noPLE` en versiones antiguas.
- Tabla PLE: los ficheros completos pesan 75,8 GB (Gyro-Coder) y 84,0 GB (Gyro-Coder-L); las variantes `-noPLE` pesan 21,4 GB y 29,6 GB y requieren descargar aparte la tabla Q8_0 de Delgon/Qwen3.8-Flash-Next-PLE-GGUF y cargarla con `--ple`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Memoria en GPU | KLD C++ | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Gyro-Coder (esta ficha) | 65B efectivos (256/512 expertos) | 64k (KV q8_0) | 19,92 GiB | 0,118 | qwen-community-1.0 | GGUF, llama.cpp modificado |
| Gyro-Coder-L | 65B efectivos (256/512 expertos) | 64k (KV q8_0) | 27,54 GiB | 0,077 | qwen-community-1.0 | GGUF, llama.cpp modificado |
| Gyro-M | 125B (512/512 expertos) | no disponible | 34,98 GiB | 0,082 | qwen-community-1.0 | GGUF, llama.cpp modificado |
| Gyro-S | no disponible | no disponible | 27,64 GiB | no disponible | qwen-community-1.0 | GGUF, llama.cpp modificado |

Las cuantizaciones convencionales IQ3_XXS y UD-Q2_K_XL se citan como referencia de calidad pero sin datos numéricos en la información disponible.

## Limitaciones y advertencias

- No es una cuantización estándar: requiere una compilación parcheada de llama.cpp; no funciona en llama.cpp estándar, LM Studio ni Ollama.
- Pérdida deliberada de capacidades: al retener solo 256 de 512 expertos por capa, el modelo rinde peor en conocimiento general y trabajo abierto; el autor recomienda Gyro-S o Gyro-M para esos usos.
- Fidelidad no total: 93,1 % top-1 en Python y 94,5 % en C++ implican que aproximadamente 1 de cada 15-20 tokens difiere del modelo completo, lo que puede acumular errores en generaciones largas.
- Riesgo de alucinación: no cuantificado en la información disponible; esperable en un modelo de código con conocimiento general degradado.
- Idiomas soportados: no disponibles; no hay garantía documentada de calidad multilingüe.
- Tool calling: solo la variante Gyro-Coder-L v1.2 corrige la rotura de etiquetas `<parameter=`; Gyro-Coder (TQ2_0) no tiene esa corrección documentada.
- Licencia qwen-community-1.0: es una licencia comunitaria con posibles restricciones de uso comercial; conviene revisar sus términos antes de producción.
- Estado experimental: etiquetas «experimental» y «qwen4exp» en el Hub, con 0 descargas y 0 likes en el momento de la ficha; madurez de ecosistema limitada.
- Repositorio con autoría duplicada: la ficha del Hub corresponde a bjivanovich, mientras que la model card y los enlaces apuntan a agentionai; conviene verificar la procedencia de los pesos.

## Enlaces

- Repositorio en Hugging Face (bjivanovich): https://huggingface.co/bjivanovich/Qwen3.8-Flash-Next-Gyro-Coder-GGUF
- Repositorio original citado en la model card (agentionai): https://huggingface.co/agentionai/Qwen3.8-Flash-Next-Gyro-Coder-GGUF
- Variantes Gyro-S y Gyro-M: https://huggingface.co/agentionai/Qwen3.8-Flash-Next-Gyro-GGUF
- Tabla PLE Q8_0: https://huggingface.co/Delgon/Qwen3.8-Flash-Next-PLE-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Strata: https://github.com/Niko1221/Strata
- Ficha de terceros: https://local-ai-zone.github.io/models/qwen3-8-flash-next-gyro-coder.html

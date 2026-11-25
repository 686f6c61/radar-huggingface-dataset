# alfodaniello/Qwen3-Coder-Next-RedLite-GGUF

## Resumen

Qwen3-Coder-Next-RedLite-GGUF es una colección de dos cuantizaciones GGUF del modelo Qwen3-Coder-Next (79.674.391.296 parámetros totales, arquitectura MoE), publicadas por el usuario alfodaniello y optimizadas específicamente para ejecutar tareas de agente de código en Apple Silicon. El trabajo no es una cuantización genérica: el autor rediseña la asignación de tipos de cuantización por tensor (proyecciones densas en Q4_K, expertos en IQ2_XS/IQ1_M o IQ3_S según la variante) para maximizar la calidad en código dentro de presupuestos de memoria concretos de 24 GB y 48 GB.

La variante CF2 (19,32 GB) está pensada para Macs de 24 GB y la CG2 (33,54 GB) para Macs de 48 GB. Ambas se generan a partir del Q8_0 de Bartowski usando su importance matrix y el mismo llama.cpp, y se validan con benchmarks de código (Aider polyglot, perplejidad sobre corpus de código) y con tareas de agente reales mediante el agente `pi`. El modelo base es Qwen/Qwen3-Coder-Next, de ahí su enfoque en generación de código, tool calling y flujos agénticos multi-paso.

La relevancia actual reside en que demuestra que un MoE de ~80B parámetros puede resultar utilizable para coding agents en hardware de consumo Apple, con ventanas de contexto de 64K efectivas y hasta 262K tokens en la variante CG2, manteniendo una licencia Apache 2.0 y compatibilidad con llama.cpp además del runtime propietario DwarfStar Red Lite.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) sobre transformer, modelo base Qwen3-Coder-Next |
| Parametros totales | 79.674.391.296 |
| Parametros activos | no disponible |
| Longitud de contexto | hasta 262.144 tokens (verificado en CG2); ventana de agente recomendada de 64K |
| Tipos de cuantizacion | CF2: IQ2_XXS base con IQ2_XS en capas 40-47, IQ1_M en el resto de expertos, proyecciones densas Q4_K; CG2: IQ3_XXS con IQ3_S adicionales en `ffn_down` (todas las capas) y `ffn_gate`/`ffn_up` (capas 24-47) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (dos ficheros: `Qwen3-Coder-Next-RedLite-CF2.gguf` 19,32 GB, `Qwen3-Coder-Next-RedLite-CG2.gguf` 33,54 GB) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-Coder-Next, un Mixture of Experts de aproximadamente 79,7 mil millones de parámetros totales. La model card de esta cuantización no detalla la composición del dataset de entrenamiento original ni si hubo RLHF/DPO; esa información corresponde al modelo base y no se reproduce aquí. Lo que sí documenta el autor es el proceso de cuantización: ambas variantes parten del Q8_0 de Bartowski y reutilizan su importance matrix (`imatrix.gguf`) con el mismo llama.cpp, de modo que la receta es reproducible.

La innovación técnica está en la asignación heterogénea de precisión por tensor. En CF2, las proyecciones densas de DeltaNet y de atención, así como parte de los expertos compartidos, se elevan a Q4_K (frente a IQ2_XXS en el fichero de Bartowski), porque aunque solo ocupan ~290 MiB se leen en cada token. Los expertos de las capas 40-47 suben a IQ2_XS y el resto se mantiene en IQ1_M para no exceder el presupuesto de 24 GB. En CG2 se parte de IQ3_XXS y se promocionan selectivamente tensores `ffn_down`, `ffn_gate` y `ffn_up` a IQ3_S. El autor valida la cuantización con pruebas de regresión frente a llama.cpp (24 tokens greedy idénticos, comparación de logits y comprobaciones de servidor), lo que aporta garantías de fidelidad numérica poco habituales en cuantizaciones comunitarias.

## Capacidades

- Generación de código en Python, JavaScript, Rust y C++ (los cuatro lenguajes del benchmark polyglot de Aider).
- Razonamiento multi-paso orientado a tareas de agente: el modelo se evalúa con el agente `pi` en tareas como extender una CLI con tests, explicar código C de 1.900 líneas, corregir bugs sin tocar los tests o mantener sesiones de cuatro prompts.
- Tool calling y function calling, implícito en el uso como coding agent (el modelo invoca herramientas del agente y recibe la salida de tests como realimentación).
- Capacidad de reintento informado: tras un fallo, el modelo ve el final de la salida de tests y vuelve a intentarlo, lo que aprovecha su contexto largo.
- Contexto largo efectivo: se localizaron tres passphrases ocultas en prompts de código real de 62K, 127K y 256K tokens.
- Decodificación con prompt lookup en el runtime Red Lite (mejora de throughput en contextos con repetición).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Desarrollo asistido en Mac de 24 GB: CF2 permite ejecutar un coding agent local con ventana de 32K-64K, resolviendo 12 de 12 tareas de agente en un M4 Pro de 24 GiB, donde el fichero IQ2_XXS de Bartowski solo resolvía 7 de 12. Adecuado para desarrolladores que quieren un agente de código sin GPU dedicada.
- Coding agent de mayor calidad en Mac de 48 GB: CG2 alcanza 59,8 % en Aider polyglot (dos intentos) en un M4 Max de 48 GiB, frente a 49,6 % del IQ3_XXS de Bartowski, con un tamaño solo 1,8 GB mayor. Útil para tareas de refactorización y corrección de bugs en producción.
- Reparación de bugs guiada por tests: el modelo lee la salida de tests fallidos y reintenta, un patrón que encaja en pipelines de CI donde el agente recibe el log y propone un parche.
- Explicación y auditoría de código heredado: la tarea de explicar parte de un servidor C de 1.900 líneas se resolvió con éxito en las pruebas del autor, lo que lo hace apto para documentación técnica automatizada de bases de código grandes.
- Extension de herramientas CLI con cobertura de tests: el escenario de "extender una CLI con un test" es directamente aplicable a mantenimiento de utilidades internas y scripts de automatización.
- Procesamiento de repositorios completos: con contexto de hasta 262K tokens en CG2 se pueden cargar ficheros y fragmentos extensos de un proyecto en una sola sesión, útil para revisiones de código transversales o migraciones.
- Despliegue en llama.cpp fuera de Apple Silicon: al ser GGUF estándar, los ficheros cargan en llama.cpp en otras plataformas, lo que permite reutilizar la cuantización en servidores Linux con CPU o GPU compatibles, aunque las métricas publicadas son de Apple Silicon.

## Benchmarks y rendimiento

Resultados publicados por el autor. Aider polyglot sobre 127 ejercicios de Exercism (Python, JavaScript, Rust, C++), decodificación greedy, máximo 6.144 tokens por respuesta, en Apple M4 Max 48 GiB:

| Metrica | CF2 | Bartowski IQ3_XXS | CG2 |
|---|---:|---:|---:|
| Tamano | 19,32 GB | 31,73 GB | 33,54 GB |
| Polyglot, dos intentos | 25,2 % | 49,6 % | 59,8 % |
| Polyglot, primer intento | 9,4 % | 33,9 % | 37,0 % |
| Python / JS / Rust / C++ (dos intentos) | 35,3 / 22,4 / 22,7 / 18,2 % | 52,9 / 55,1 / 40,9 / 40,9 % | 55,9 / 69,4 / 50,0 / 54,5 % |
| Respuestas al limite de 6.144 tokens | 21 | 6 | 6 |
| Perplejidad en codigo | 2,537 | 1,917 | 1,870 |

Comparativa de CF2 frente a IQ2_XXS de Bartowski (perplejidad a contexto 512, corpus congelados de 111 chunks de texto y 90 de código):

| Metrica | Bartowski IQ2_XXS | CE3 | CF2 |
|---|---:|---:|---:|
| Tamano | 19,30 GB | 19,30 GB | 19,32 GB |
| Perplejidad, codigo | 2,623 | 2,584 | 2,537 (−3,3 %, t = −4,0) |
| Perplejidad, texto | 18,53 | 18,24 | 18,72 |
| Tareas de agente, M4 Pro 24 GiB | 7 / 12 | 11 / 12 | 12 / 12 |
| Tareas de agente, M4 Max 48 GiB | 10 / 12 | 12 / 12 | 12 / 12 |
| Tarea de agente mas lenta, M4 Pro | 600 s (limite) | 506 s | 270 s |

Rendimiento adicional: CG2 decodifica a 79-98 tok/s con prompt lookup en el M4 Max; en la prueba de contexto largo, la decodificación de la respuesta corrió a 48, 33 y 22 tok/s a 62K, 127K y 256K tokens respectivamente. Con ventana de 64K, CF2 resolvió 16 de 18 tareas de agente frente a 10 de 18 con 32K, igualando al Coder de 3 bits de Bartowski pese a ser 12 GB menor.

## Requisitos de hardware

- CF2: 19,32 GB de pesos; requiere al menos 24 GB de memoria unificada en Apple Silicon para mantener todos los expertos en GPU con contexto de 32K.
- CG2: 33,54 GB de pesos; requiere 48 GB de memoria unificada para mantener todos los expertos en GPU hasta ~96K posiciones con KV cache a media precisión; a 128K cae a una caché de expertos de 4 GiB.
- GPU recomendadas: Apple M4 Pro 24 GiB (CF2), Apple M4 Max 48 GiB (CG2). Para otras plataformas no hay datos publicados.
- Cabe en GPU de consumo: sí, en Apple Silicon de 24 GB y 48 GB según variante. No hay datos para RTX 4090 (24 GB) ni otras GPU discretas.
- Despliegue: runtime nativo DwarfStar Red Lite (Metal) y llama.cpp estándar; también compatible con endpoints estilo OpenAI según los tags del repositorio.
- Throughput: 79-98 tok/s en CG2 sobre M4 Max con prompt lookup; 22-48 tok/s en generación de respuestas largas con contextos de 62K-256K.
- Latencia: la tarea de agente más lenta en CF2 sobre M4 Pro bajó a 270 s (frente a 600 s del IQ2_XXS de Bartowski); no se publican latencias por token para el resto de configuraciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3-Coder-Next-RedLite CF2 | 79,7B (MoE) | 64K recomendado, hasta 262K | GGUF 19,32 GB | Apache 2.0 | Optimizado para Mac de 24 GB; 25,2 % polyglot |
| Qwen3-Coder-Next-RedLite CG2 | 79,7B (MoE) | hasta 262K | GGUF 33,54 GB | Apache 2.0 | Optimizado para Mac de 48 GB; 59,8 % polyglot |
| Bartowski IQ3_XXS (mismo base) | 79,7B (MoE) | no disponible | GGUF 31,73 GB | Apache 2.0 | Referencia de comparación; 49,6 % polyglot |
| Bartowski IQ2_XXS (mismo base) | 79,7B (MoE) | no disponible | GGUF 19,30 GB | Apache 2.0 | Referencia; 7/12 tareas de agente en M4 Pro |

No se dispone de datos de benchmarks frente a modelos de otros autores o familias en la información proporcionada.

## Limitaciones y advertencias

- CF2 está optimizado para código y agentes; en prosa su perplejidad (18,72) es peor que la del IQ2_XXS de Bartowski (18,53). No es un fichero adecuado para generación de texto general.
- Con temperatura 0,7 o superior, el modelo de 2 bits puede repetir una llamada a herramienta hasta agotar el tiempo límite. El autor recomienda 0,3 y así lo configura `setup-pi`; con 0,3 no se observaron repeticiones en 12 sesiones.
- Las cuantizaciones de 2 bits (CF2) degradan el rendimiento en tareas de razonamiento y código respecto a cuantizaciones de 3-4 bits; el polyglot de CF2 (25,2 %) es sustancialmente inferior al de CG2 (59,8 %).
- El contexto completo de 262K solo es viable en CG2 con 48 GB; a 128K se activa una caché de expertos de 4 GiB que reduce el rendimiento. En CF2 el contexto práctico verificado es de 32K-64K.
- Las métricas publicadas proceden de un único entorno (Apple M4 Max 48 GiB y M4 Pro 24 GiB) y de un agente concreto (`pi`); el rendimiento en otros agentes, plataformas o backends puede diferir.
- No hay información sobre sesgos, idiomas soportados ni evaluación de alucinación en la documentación disponible.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base Qwen/Qwen3-Coder-Next para uso comercial en producción.
- El runtime DwarfStar Red Lite es un proyecto del mismo autor; la validación cruzada con llama.cpp existe, pero las optimizaciones de prompt lookup y caché de expertos son específicas de ese runtime.
- El repositorio tiene 284 descargas y 0 likes en el momento de la consulta, lo que indica adopción aún limitada y poca validación independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/alfodaniello/Qwen3-Coder-Next-RedLite-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-Coder-Next
- Runtime DwarfStar Red Lite: https://github.com/alfofire2/dwarfstar-red-lite
- Registro del método CF2 (dev63): https://github.com/alfofire2/dwarfstar-red-lite/blob/main/docs/REDLITE_DEV63_CODER_QUANT_SAMPLING.md
- Registro del método CG2 (dev85): https://github.com/alfofire2/dwarfstar-red-lite/blob/main/docs/REDLITE_DEV85_CODING_M4MAX.md
- Benchmark polyglot de Aider: https://github.com/Aider-AI/polyglot-benchmark
- Agente `pi`: https://github.com/earendil-works/pi

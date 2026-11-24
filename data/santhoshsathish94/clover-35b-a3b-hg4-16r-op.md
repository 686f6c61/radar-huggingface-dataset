# Santhoshsathish94/Clover-35B-A3B-HG4-16R-OP

## Resumen

Clover-35B-A3B-HG4-16R-OP es una compilación cuantizada y empaquetada del modelo base Qwen/Qwen3.5-35B-A3B, publicada por el usuario Santhoshsathish94. No se trata de un modelo entrenado desde cero, sino de un artefacto de despliegue: el autor ha convertido los pesos del modelo original a un formato propietario denominado HG4-16R (Hadamard-Grouped 4-bit, 16 rangos) y los ha empaquetado junto con operadores precalculados para su ejecución mediante un motor propio escrito en C11 con extensiones AVX2 y FMA. El repositorio ocupa 18,71 GB e incluye 40 ficheros de tronco, 40 de expertos, embeddings, cabeza de salida y un directorio `precomputed_ops/` de 84,6 MB.

La relevancia de esta ficha es acotada: el artefacto está orientado a la inferencia en CPU con un motor específico (`clover35b_hg4_engine.c`), no a un uso estándar con transformers, vLLM o llama.cpp. El autor declara métricas de fidelidad de enrutamiento de expertos (acuerdo top-8 del 100 % con el modelo original, Jaccard = 1,000000) y de caché de prefijo en sesiones de CLI (97,23 % de acierto de prefijo común más largo en segunda ronda), pero no se publican resultados de benchmarks estándar de razonamiento o código comparables entre modelos.

El modelo base es un Mixture-of-Experts de Qwen con 35B parámetros totales y 3B activos, del que este repositorio hereda la licencia Apache 2.0. La información disponible sobre idiomas, contexto nativo y detalles de entrenamiento del modelo original no se incluye en la model card de este artefacto, por lo que se marca como no disponible en los campos correspondientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) sobre transformer, con motor de inferencia propietario C11 (AVX2+FMA) y GDN con estado y caché de prefijo |
| Parametros totales | 35B (heredados del modelo base Qwen/Qwen3.5-35B-A3B) |
| Parametros activos | 3B (heredados del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | HG4-16R (Hadamard-Grouped 4-bit, 16 rangos); formato propietario, no GGUF ni GPTQ |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Ficheros `.hg4` propietarios (`trunk_00..39.hg4`, `experts_00..39.hg4`, `embed_tokens.hg4`, `lm_head.hg4`) más `precomputed_ops/` en formato `HG4OP001` |
| Tamano del repositorio | 18,71 GB |
| Modelo base | Qwen/Qwen3.5-35B-A3B |
| Motor de inferencia | `clover35b_hg4_engine.c` compilado como biblioteca compartida (`libclover35b_hg4_engine.so`) |

## Arquitectura y entrenamiento

El artefacto no incluye entrenamiento propio: es una conversión de pesos del modelo Qwen/Qwen3.5-35B-A3B a un esquema de cuantización de 4 bits con agrupación Hadamard y 16 rangos (HG4-16R). El autor empaqueta además operadores precalculados bajo el identificador HG4OP001: normas del router, tablas RoPE y calendarios de decaimiento del mecanismo GDN. Según la model card, estos operadores precalculados son sin pérdida y se validaron con un acuerdo del 100,0 % en el enrutamiento top-8 de expertos respecto al modelo de referencia (Jaccard = 1,000000), lo que sugiere que la cuantización preserva las decisiones del router.

La innovación declarada no está en el modelo sino en el runtime: un motor C11 que combina AVX2 y FMA con OpenMP, implementa GDN con estado y caché de prefijo, y se distribuye como biblioteca compartida compilable con `gcc -O3 -march=x86-64-v3 -mavx2 -mfma -fopenmp -fPIC -shared`. El autor reporta un 97,23 % de acierto de caché de prefijo común más largo en la segunda ronda de conversación dentro de sesiones reales de OpenCode v1.19.6. No se detalla la composición del dataset de entrenamiento del modelo base, el número de tokens, ni si hubo RLHF o DPO; esa información corresponde a Qwen y no se reproduce en este repositorio.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base Qwen3.5-35B-A3B (MoE con 3B parámetros activos).
- Ejecución de tareas de código y resolución de problemas tipo SWE, según la suite declarada por el autor (9/23 en la suite congelada de Lean 4, SWE e ingeniería inversa).
- Razonamiento matemático simbólico: la suite sellada de 48 tareas reporta 8/8 en operaciones exactas de enteros grandes, factoriales y hexadecimal de Pi por BBP.
- Soporte de caché de prefijo con estado (stateful GDN), orientado a conversaciones multiturno y sesiones de CLI.
- Ejecución en CPU sin GPU mediante el motor C11 con AVX2 y FMA.
- Integración con herramientas de línea de comandos: el autor cita uso en OpenCode v1.19.6 y en una configuración denominada Copilot Fusion con Nemotron-3.5-Super-VL-120B-HG4-16R-OP.
- Soporte de tool calling, agentes y multimodalidad: no disponible en la información proporcionada.

## Casos de uso

- Inferencia en CPU sin GPU: el formato HG4-16R y el motor C11 permiten ejecutar un MoE de 35B parámetros en servidores sin acelerador, útil en entornos con restricciones de hardware o de suministro de GPU.
- Asistentes de código en terminal: la caché de prefijo con estado (97,23 % de acierto en segunda ronda) reduce el coste de reprocesar contexto en sesiones largas de CLI como OpenCode, lo que abarata el uso interactivo.
- Automatización de tareas de ingeniería inversa y análisis de binarios: la suite declarada incluye tareas de reverse engineering, por lo que el modelo puede integrarse en pipelines que analicen artefactos y propongan hipótesis.
- Verificación formal con Lean 4: el autor reporta resultados en una suite congelada de Lean 4 sobre RiemannHypothesis, lo que lo hace candidato para asistentes de prueba en entornos de demostración formal.
- Cálculo simbólico exacto: los resultados 8/8 en enteros grandes, factoriales y hexadecimal de Pi por BBP sugieren uso en tareas de cómputo exacto donde un LLM convencional fallaría por redondeo.
- Despliegue embebido en infraestructura propia: al compilarse como biblioteca compartida (`libclover35b_hg4_engine.so`), puede enlazarse en servicios C/C++ existentes sin depender de un servidor de inferencia Python.
- Evaluación de técnicas de cuantización: el acuerdo del 100 % en enrutamiento top-8 convierte este artefacto en un banco de pruebas para estudiar el impacto de la cuantización 4-bit en modelos MoE.

## Benchmarks y rendimiento

| Suite | Tareas | Resultado | Notas |
|---|---|---|---|
| Lean 4 RiemannHypothesis + SWE + Reverse-Engineering (congelada) | 23 | 9/23 (39,13 %) | 48,14 pases/hora |
| Misma suite con Clean-Slate Copilot Fusion + Nemotron-3.5-Super-VL-120B-HG4-16R-OP | 23 | 11/23 (47,83 %) | Configuración combinada con otro modelo |
| Clover Studio Capability Suite (sellada, con x-cruncher S3 nativo en C11) | 48 | 45/48 (93,75 %) | 8/8 (100 %) en enteros grandes, factoriales y BBP hex-Pi |
| Fidelidad de enrutamiento top-8 de expertos | — | 100,0 % (Jaccard = 1,000000) | Respecto al modelo de referencia |
| Acierto de caché de prefijo (LCP) en segunda ronda | — | 97,23 % | Medido en OpenCode v1.19.6 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada: no aplica de forma directa; el artefacto está diseñado para inferencia en CPU. El repositorio ocupa 18,71 GB en disco y requiere al menos esa cantidad de RAM para cargar los pesos, más el espacio de trabajo del motor.
- GPU recomendadas: no disponible; el motor declarado es C11 con AVX2 y FMA, sin soporte CUDA documentado.
- Compatibilidad con GPU de consumo: no disponible; el diseño apunta a CPU x86-64 con AVX2.
- CPU: se requiere un procesador x86-64 con AVX2 y FMA (objetivo de compilación `-march=x86-64-v3`); se recomienda OpenMP para paralelismo entre núcleos.
- Opciones de despliegue: compilación manual del motor con `gcc -O3 -march=x86-64-v3 -mavx2 -mfma -fopenmp -fPIC -shared clover35b_hg4_engine.c -lm -o libclover35b_hg4_engine.so`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: el autor reporta 48,14 pases por hora en la suite de 23 tareas, pero no se especifican latencias por token ni throughput en tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| Clover-35B-A3B-HG4-16R-OP | 35B | 3B | no disponible | Apache 2.0 | HG4-16R propietario, motor C11 en CPU |
| Qwen/Qwen3.5-35B-A3B (base) | 35B | 3B | no disponible | Apache 2.0 | Safetensors, ecosistema transformers/vLLM |
| Nemotron-3.5-Super-VL-120B-HG4-16R-OP | 120B (según nombre) | no disponible | no disponible | no disponible | HG4-16R, citado como complemento en Copilot Fusion |

La comparación con alternativas de la misma categoría (MoE de ~35B con ~3B activos) no está disponible en la información proporcionada: no se incluyen datos de contexto, benchmarks estándar ni disponibilidad de otros artefactos comparables.

## Limitaciones y advertencias

- Formato propietario: los pesos `.hg4` y los operadores `HG4OP001` no son compatibles con transformers, vLLM, llama.cpp, Ollama ni TGI; requieren el motor C11 del autor, lo que limita la portabilidad y la integración con herramientas estándar.
- Madurez del artefacto: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (24 de noviembre de 2026), sin historial de uso comunitario.
- Ausencia de benchmarks estándar: no hay resultados de MMLU, HumanEval, GSM8K ni evaluaciones independientes; las métricas declaradas son suites propias del autor y no son directamente comparables con las de otros modelos.
- Idiomas no documentados: la model card no especifica qué idiomas soporta el modelo base ni si la cuantización afecta al rendimiento multilingüe.
- Contexto no documentado: se desconoce la longitud de contexto nativa del modelo base y si la caché de prefijo del motor la preserva íntegramente.
- Riesgo de alucinación: inherente al modelo base; no se han publicado evaluaciones de factualidad ni de tasas de alucinación para este artefacto.
- Sesgos: no se documentan sesgos conocidos del modelo base ni evaluaciones de seguridad en este repositorio.
- Dependencia de compilación: el motor exige un compilador con soporte de `-march=x86-64-v3`, AVX2, FMA y OpenMP; en CPUs sin AVX2 no funcionará.
- Licencia: Apache 2.0 permite uso comercial, pero el autor no documenta si el formato HG4-16R o los operadores precalculados tienen restricciones adicionales más allá de la licencia heredada del modelo base.
- Soporte de tool calling, agentes y multimodalidad: no confirmado en la información disponible para este artefacto.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Santhoshsathish94/Clover-35B-A3B-HG4-16R-OP
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
- Motor de inferencia: `clover35b_hg4_engine.c` (incluido en el repositorio; no se proporciona URL independiente)
- OpenCode v1.19.6: no disponible en la información proporcionada
- Nemotron-3.5-Super-VL-120B-HG4-16R-OP: no disponible en la información proporcionada

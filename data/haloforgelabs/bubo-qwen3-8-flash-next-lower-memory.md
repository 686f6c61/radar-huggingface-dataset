# HaloForgeLabs/bubo-qwen3.8-flash-next-lower-memory

## Resumen

HaloForgeLabs/bubo-qwen3.8-flash-next-lower-memory es una compilación cuantizada en GGUF del modelo Qwen3.8-Flash-Next, una arquitectura Mixture-of-Experts (MoE) de aproximadamente 177.000 millones de parámetros totales. La desarrolla HaloForge Labs, un laboratorio independiente, y está pensada específicamente para ejecutarse en el runtime Bubo 0.1.2 sobre portátiles con AMD Strix Halo bajo Windows. El modelo base es Qwen3.8-Flash-Next de Alibaba Qwen, sobre el que se ha aplicado una abliteración (eliminación de mecanismos de rechazo) por parte de Huihui y una compresión de los tensores de expertos por parte de ISTA-DASLab.

El problema que resuelve es el de la huella de memoria: en la configuración estándar, con una ventana de contexto de 200.000 tokens, Bubo estima unos 91 GiB de memoria de GPU; esta variante "lower memory" reduce esa cifra a unos 66 GiB, es decir, unos 25 GiB menos, a costa de una ligera pérdida de velocidad (lectura de prompts a 0,93-0,96 de la velocidad del build estándar y escritura entre 0,84 y 1,18 según la tarea). Esto la hace viable en máquinas con 96 GB de memoria gráfica unificada.

La relevancia actual radica en que combina tres piezas de ecosistemas distintos (los pesos densos abliterados de Huihui, los tensores de expertos comprimidos de ISTA-DASLab y el empaquetado de HaloForge) manteniendo la compatibilidad con los ficheros auxiliares de decodificación especulativa (decode twin, draft head y predictor MTP) del build estándar, con los mismos hashes SHA-256.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (Mixture-of-Experts) sobre transformer; pesos en GGUF con tensores de expertos en formatos de baja precisión mixtos (GSQ-RCO IQ3_S) |
| Parámetros totales | 176.943.899.520 (~177 mil millones) |
| Parámetros activos | no disponible |
| Longitud de contexto | 200.000 tokens (contexto por defecto en Bubo 0.1.2) |
| Tipos de cuantización | GGUF con expertos en IQ3_S (formatos mixtos de baja precisión); KV cache configurable, incluido Q8_0 (`--kv-cache-type q8_0`, reduce la caché de contexto un 47 %) |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (cadena de avisos: Qwen, Huihui, Unsloth, ISTA-DASLab, HaloForge Labs); no es MIT |
| Formato de pesos | GGUF (4 shards) + `compose-manifest.json`; ficheros auxiliares MTP, mmproj (BF16), twin y draft head |

## Arquitectura y entrenamiento

El modelo es una arquitectura MoE derivada de Qwen3.8-Flash-Next. La particularidad de esta compilación es que combina dos procedencias distintas: los tensores densos provienen de Huihui-Qwen3.8-Flash-Next-abliterated-GGUF (revisión `73e9eb7c`), mientras que los tensores de expertos provienen de Qwen3.8-Flash-Next-GSQ-RCO-GGUF de ISTA-DASLab (revisión `ed59f920`), que emplea formatos de baja precisión mixtos. HaloForge Labs compuso ambos conjuntos en un único paquete copiando los tensores sin modificarlos, y `compose-manifest.json` documenta cada tensor, su origen y su checksum.

En cuanto a la abliteración, el modelo utiliza 96 de los 101 tensores que la abliteración de Huihui modificó; las 5 capas de expertos restantes provienen del fichero de ISTA. En una prueba de rechazo con 100 peticiones de AdvBench (20 de octubre de 2026) el modelo no rechazó ninguna, igual que el modelo estándar. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en la información proporcionada. La innovación técnica destacable es la integración con el sistema de decodificación especulativa de Bubo: reutiliza el mismo decode twin, draft head y predictor MTP que el build estándar de Huihui (mismos ficheros y mismos SHA-256), por lo que el drafting funciona de forma idéntica.

## Capacidades

- Generación de texto conversacional y de prosa (es la tarea con mejor velocidad relativa frente al build estándar, hasta 1,18).
- Generación de código, incluido C++ (la tarea más lenta en términos relativos frente al build estándar, 0,84).
- Razonamiento matemático y de propósito general: en una prueba de 35 preguntas (GPQA Diamond, AIME 2026, HMMT 2026, IMO 2026, 25 de octubre de 2026) acertó 29, el mismo resultado que el modelo Q4 estándar.
- Capacidades multimodales: el paquete incluye un fichero `mmproj` en BF16 (`mmproj-Qwen3.8-Flash-Next-BF16.gguf`), lo que indica soporte de proyección multimodal, aunque la model card no detalla las capacidades de visión.
- Decodificación especulativa mediante decode twin, draft head y predictor MTP compartidos con el build estándar.
- Comportamiento sin rechazos (abliterado): ninguna negativa en 100 peticiones de AdvBench.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Asistencia conversacional de contexto largo en portátiles Strix Halo: con 200.000 tokens de contexto por defecto y unos 66 GiB de memoria de GPU estimada, permite mantener sesiones extensas con documentos largos en una máquina de 96 GB sin recurrir a servidores.
- Generación de código en local para desarrollo: el modelo mantiene la velocidad de escritura en un rango de 0,84-1,18 respecto al build estándar, lo que lo hace utilizable en tareas de autocompletado y generación de código C++ y otros lenguajes en un flujo de trabajo de escritorio.
- Razonamiento matemático y científico asistido: los resultados de la prueba de 35 preguntas (GPQA Diamond, AIME, HMMT, IMO) igualan al modelo Q4 estándar, por lo que es adecuado para resolución de problemas técnicos verificables.
- Despliegue en máquinas de 96 GB con memoria gráfica variable: la model card indica configurar Variable Graphics Memory a 72 GB (o al menos 64 GB) en AMD Adrenalin para usar el contexto de 200.000 tokens; encaja en escenarios de estación de trabajo única con Windows.
- Entornos de investigación que requieren un modelo sin mecanismos de rechazo: la abliteración verificada (0 rechazos en 100 peticiones de AdvBench) lo hace adecuado para estudios de seguridad, red-teaming y análisis de comportamiento de modelos.
- Prototipado con decodificación especulativa: al reutilizar los ficheros twin, draft head y MTP del build estándar, sirve para evaluar el rendimiento del drafting de Bubo con una huella de memoria reducida.
- Sustitución del build estándar en máquinas con menos memoria: para quienes ya usan el build estándar de Huihui, esta variante permite mantener el mismo contexto y calidad con unos 25 GiB menos de memoria de GPU.

## Benchmarks y rendimiento

| Prueba | Resultado | Referencia |
|---|---|---|
| Razonamiento, 35 preguntas (GPQA Diamond, AIME 2026, HMMT 2026, IMO 2026; 25-10-2026) | 29/35 correctas | Igual que el modelo Q4 estándar |
| Rechazos en 100 peticiones AdvBench (20-10-2026) | 0 rechazos | Igual que el modelo estándar |
| Velocidad de lectura de prompts (Bubo 0.1.2) | 0,93-0,96× respecto al build estándar | Una ejecución en un portátil a ~70 W |
| Velocidad de escritura (Bubo 0.1.2) | 0,84-1,18× respecto al build estándar | C++ el más lento, prosa el más rápido |
| Memoria de GPU estimada a 200.000 tokens | ~66 GiB | Build estándar: ~91 GiB |
| Fichero IQ3_S de ISTA (referencia) | Coincide con el modelo base en AIME25; diferencia de 0,57 puntos en LiveCodeBench v6 | Según la model card de ISTA-DASLab |

No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: ~66 GiB de memoria de GPU a 200.000 tokens y una sesión (frente a ~91 GiB del build estándar). Con KV cache en Q8_0 la caché de contexto se reduce un 47 %.
- GPU recomendadas: portátiles con AMD Strix Halo (memoria gráfica unificada) bajo Windows. La model card cita máquinas de 96 GB y de 128 GB para las mediciones de referencia.
- Configuración en máquinas de 96 GB: ajustar Variable Graphics Memory (AMD Software: Adrenalin Edition > Performance > Tuning) al máximo disponible (72 GB si es posible, al menos 64 GB) y reiniciar Windows. A 72 GB, Bubo usa el contexto por defecto de 200.000 tokens con una sesión; a 64 GB también, si hay unos 16 GB de memoria de sistema libres.
- Tamaño en disco: los cuatro shards ocupan 84.609.075.104 bytes (~79 GiB); los cuatro ficheros auxiliares suman 5.282.481.216 bytes; el total de los ocho ficheros es 89.891.556.320 bytes. El repositorio completo ocupa 84,6 GB.
- Opciones de despliegue: Bubo 0.1.2 o superior (descarga desde la app con `bubo prepare model --catalogue-id huihui-qwen38-flash-next-lowmemory-v1`, o uso de ficheros locales con `--offline`, y ejecución con `bubo serve --manifest <folder>\bubo-package.json`). No se mencionan otros runtimes como vLLM, llama.cpp u Ollama en la información disponible.
- Latencia y throughput: solo se ofrecen los rangos relativos frente al build estándar (0,93-0,96× en lectura, 0,84-1,18× en escritura), medidos en una ejecución en un portátil a ~70 W. No hay cifras absolutas de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Memoria de GPU estimada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (lower memory) | ~177 mil millones | 200.000 tokens | ~66 GiB | Qwen Community 1.0 | Hugging Face, 478 descargas |
| Build estándar de Huihui (Qwen3.8-Flash-Next abliterated) | ~177 mil millones | 200.000 tokens | ~91 GiB | Qwen Community 1.0 | Hugging Face |
| ISTA-DASLab IQ3_S | ~177 mil millones | 200.000 tokens | ~64 GiB | Hereda la del modelo base | Hugging Face |
| ISTA-DASLab IQ3_XXS | ~177 mil millones | 200.000 tokens | ~57 GiB | Hereda la del modelo base | Hugging Face |
| ISTA-DASLab IQ2_XS | ~177 mil millones | 200.000 tokens | ~50 GiB | Hereda la del modelo base | Hugging Face |
| Flash Next Coder | no disponible | 200.000 tokens | ~41 GiB | no disponible | Hugging Face |

Los valores de memoria de las variantes ISTA y del Coder están calculados por HaloForge Labs y medidos en una máquina de 128 GB, no en una de 96 GB.

## Limitaciones y advertencias

- La abliteración elimina los mecanismos de rechazo: el modelo no rechazó ninguna de 100 peticiones de AdvBench, lo que implica un riesgo elevado de generar contenido dañino o inapropiado sin salvaguardas.
- La model card advierte de que los valores de memoria para máquinas de 96 GB son calculados, no medidos: Bubo no se ha probado en una máquina de 96 GB.
- Los datos de velocidad provienen de una única ejecución en un portátil a ~70 W, por lo que la variabilidad entre equipos puede ser alta.
- El rendimiento relativo en generación de código C++ es el peor del rango (0,84×), lo que puede ser limitante en flujos de trabajo intensivos en código.
- La licencia Qwen Community 1.0 no es MIT; requiere conservar `LICENSE` y `NOTICE` con cualquier copia y respetar la cadena de avisos de Qwen, Huihui, Unsloth, ISTA-DASLab y HaloForge Labs. Es necesario revisar las condiciones de uso comercial de dicha licencia.
- Los idiomas soportados no están documentados en la información disponible.
- El modelo depende del runtime Bubo 0.1.2 o superior y de su sistema de ficheros auxiliares (twin, draft head, MTP); no se documenta compatibilidad con otros motores de inferencia.
- Riesgo de alucinación: no cuantificado en la información disponible.
- Sesgos conocidos: no documentados en la información disponible.
- El repositorio tiene 0 likes y 478 descargas, lo que indica una validación comunitaria limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HaloForgeLabs/bubo-qwen3.8-flash-next-lower-memory
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Pesos densos abliterados de Huihui: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated-GGUF
- Tensores de expertos de ISTA-DASLab: https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- Repositorio de Bubo: https://github.com/haloforge-labs/bubo
- Paper ISTA-DASLab (arXiv:2604.18556): https://arxiv.org/abs/2604.18556
- Paper ISTA-DASLab (arXiv:2605.00649): https://arxiv.org/abs/2605.00649

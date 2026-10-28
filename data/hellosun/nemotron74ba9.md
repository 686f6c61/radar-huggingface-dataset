# HelloSun/Nemotron74ba9

## Resumen

Esta ficha describe `HelloSun/Nemotron74ba9`, una redistribución comunitaria del modelo `nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-GGUF` en formato GGUF, acompañada de un parche para llama.cpp que acelera la inferencia en CPU. Los ficheros de pesos no se han modificado: el repositorio incluye el GGUF del modelo (20,5 GiB), el proyector de visión `mmproj` y un conjunto de parches de código (`patches/nemotron-nvfp4-cpu-opt.patch`) con su script de compilación. El modelo base lo desarrolla NVIDIA y pertenece a la familia Nemotron, orientada a razonamiento, generación de código y flujos agénticos.

Arquitectura y tamaño: se trata de un híbrido Mamba-2 / Transformer / LatentMoE con 74.042.720.848 parámetros totales y aproximadamente 9B activos por token (nomenclatura A9B), lo que permite un coste de cómputo por token propio de un modelo mucho menor. La cuantización es mixta: IQ2_XXS para expertos enrutados y compartidos (16,3 GiB), NVFP4 para las proyecciones `ssm_in`/`ssm_out` de Mamba-2 (2,3 GiB) y Q8_0 para atención, proyecciones latentes y salida. Es multimodal, ya que incluye un proyector de visión separado.

Relevancia: el interés de este repositorio no está en el modelo en sí, sino en la optimización de un kernel concreto. El perfilado del build estándar de llama.cpp sobre un Intel Xeon Platinum 8559C mostró que las proyecciones NVFP4 suponían el 39 % del tiempo de decode y el 67 % del tiempo de prefill, y que llama.cpp solo disponía de un `vec_dot` AVX2 sin kernel por lotes para ese formato. El parche añade un `vec_dot` AVX512-VNNI para NVFP4 x Q8_0 y un kernel 2x2 para prefill, con una mejora medida de ~1,46x en prefill (30,9 → 45,1 t/s) y sin ganancia fiable en decode, que está limitado por ancho de banda de memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba-2 / Transformer / LatentMoE (MoE con expertos enrutados y compartidos) |
| Parametros totales | 74.042.720.848 |
| Parametros activos | ~9B (según nomenclatura A9B del nombre del modelo) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: IQ2_XXS (expertos, 16,3 GiB), NVFP4 (proyecciones `ssm_in`/`ssm_out` de Mamba-2, 2,3 GiB), Q8_0 (atención, proyecciones latentes, salida) |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW-1.1 (`license: other`, `license_name: openmdw-1.1`) |
| Formato de pesos | GGUF para llama.cpp; proyector de visión en GGUF aparte (`mmproj-*.gguf`) |
| Tamano de pesos | 20,5 GiB (modelo) + proyector de visión (tamaño no disponible); repositorio completo: 23,8 GB |
| Modelo base | `nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-GGUF` (relación: quantized) |
| Revision de llama.cpp del parche | `de5122d` |

## Arquitectura y entrenamiento

El modelo es un híbrido que combina capas Mamba-2 (state space model) con capas Transformer y un bloque LatentMoE. El tamaño del GGUF procede de tres tipos de peso diferenciados: los expertos enrutados y compartidos en IQ2_XXS, las proyecciones `ssm_in` y `ssm_out` de Mamba-2 en NVFP4 y el resto de componentes (atención, proyecciones latentes y salida) en Q8_0. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) en el material proporcionado; esos datos corresponden a la model card original de NVIDIA, que no se incluye aquí.

La innovación técnica documentada en este repositorio es exclusivamente de inferencia, no de entrenamiento. El parche añade a `ggml/src/ggml-cpu/arch/x86/quants.c` un `vec_dot` AVX512-VNNI para NVFP4 x Q8_0 que procesa un bloque de 64 pesos por iteración: la magnitud E2M1 se obtiene con un shuffle de 16 bytes, el signo del bit 3 de cada nibble se aplica al lado Q8 con una máscara para que `vpdpbusd` opere con magnitudes sin signo, y las escalas UE4M3 se decodifican en SIMD mediante un desplazamiento de bits y una multiplicación por 2^119 (con `0x7F` mapeado a 0, igual que la referencia). Las 16 líneas int32 se escalan con un vector float por línea, de modo que no hace falta reducción horizontal dentro del bucle. Además se incorpora un kernel 2x2 (`nrc == 2`, activado con `.nrows = 2`) para prefill, que decodifica cada bloque de pesos una sola vez y lo reutiliza para dos columnas de activación; en CPUs sin AVX512 se degrada a cuatro llamadas `nrc == 1`. Los tests unitarios con datos aleatorios y referencia en doble precisión dan un error relativo de ~5e-7 tanto en los kernels como en la ruta 2x2. Existe un parche opcional (`optional-iq2xxs-vnni.patch`) con un kernel AVX512-VNNI para IQ2_XXS, correcto y ~10 % más rápido en un hilo (4,4 vs 4,9 ns por 64 pesos), pero sin efecto medible de extremo a extremo, por lo que no forma parte del parche principal.

## Capacidades

- Generación de texto conversacional (etiqueta `conversational` en el repositorio).
- Razonamiento y aplicaciones agénticas, según la orientación general de la familia Nemotron descrita por NVIDIA.
- Generación y asistencia de código: el repositorio incluye pruebas específicas de decodificación especulativa sobre texto de código.
- Capacidad multimodal: incluye el proyector de visión `mmproj-NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB.gguf`, por lo que admite entrada de imagen además de texto.
- Soporte de tool calling / function calling: no confirmado en la información disponible.
- Modo de razonamiento explícito (*thinking*): no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Inferencia en CPU sin GPU, con soporte de llama.cpp y kernels AVX512-VNNI optimizados.

## Casos de uso

- **Agente local en puesto de trabajo sin GPU**: con 20,5 GiB de pesos en RAM, el modelo puede ejecutarse en un servidor o estación con 24-32 GB de memoria y una CPU reciente. El parche mejora el prefill a 45,1 t/s en 16 hilos, lo que reduce la latencia del primer token en prompts largos, el patrón habitual en agentes que reinyectan contexto en cada paso.
- **Asistente de código en pipelines internos**: la decodificación sostenida ronda 9-11 t/s en el Xeon probado, suficiente para autocompletado por bloques y revisión de diffs. El modo `ngram-mod` de decodificación especulativa eleva el rendimiento cuando la salida repite texto ya generado (edición de ficheros, eco de salida de herramientas), llegando a 22,2 t/s en el caso cálido.
- **Análisis de documentos con imagen**: el proyector de visión permite procesar capturas, diagramas o páginas escaneadas junto con instrucciones textuales, sin depender de un servicio en la nube.
- **RAG sobre corpus privado en entornos air-gapped**: al ser un GGUF ejecutable en CPU, encaja en despliegues sin acceso a internet ni GPUs, donde la confidencialidad impide usar APIs externas.
- **Resumen y clasificación por lotes**: las cargas dominadas por prefill se benefician directamente del parche (1,46x), por lo que procesar muchos documentos cortos con prompts largos resulta más eficiente que con llama.cpp estándar.
- **Servicio interno de bajo caudal**: con `-t 12` el decode se mantiene estable en 9,6-10,3 t/s sin throttling de CFS, frente a los 7,0-10,9 t/s erráticos con 16 hilos bajo cuota de CPU, lo que permite dimensionar un endpoint para pocos usuarios concurrentes.
- **Evaluación y reproducción de kernels cuantizados**: el repositorio incluye benchmarks en crudo (`ab_results.csv`, `thread_sweep.csv`, `spec_decoding.jsonl`, `knobs_decode.csv`) y tests de error relativo, útil para validar implementaciones NVFP4 en CPU.
- **Prototipado de producto con presupuesto de hardware mínimo**: permite validar flujos multimodales y agénticos con coste de infraestructura cercano a cero antes de migrar a una GPU o a una instancia mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos medidos son de throughput de llama.cpp en un Intel Xeon Platinum 8559C con 16 hilos (`taskset -c 0-15`, `-t 16 -fa on -lm mlock -b 1024 -ub 1024`, llama-bench):

| Build | pp256 (t/s, mediana n=5) | tg64 (t/s) |
|---|---|---|
| llama.cpp stock `de5122d` | 30,9 | 10,2 |
| Build con parche | 45,1 | 9,1 (rango 5,8-11,6) |
| Aceleración | ~1,46x | sin ganancia fiable |

Repetición a 12 hilos: pp256 25,2 → 36,3 t/s; tg64 9,51 → 9,53 t/s.

Decodificación especulativa (greedy, 200 tokens, `-t 12`, línea base 10,9 t/s):

| Modo | Código | Prosa | Texto repetido |
|---|---|---|---|
| Ninguno | 10,9 | 10,7-11,0 | 10,9 |
| `--spec-type draft-dflash` (n-max 6) | 11,6 (78 % aceptados) | 5,5 (28 % aceptados) | 13,4 |
| `--spec-type ngram-mod` | 10,7 frío / 13,5 cálido | 10,3 / 9,0 | 10,1 frío / 22,2 cálido |

Barrido de hilos (tg64): 16 hilos sufre throttling CFS y oscila entre 7,0 y 10,9 t/s; 12 hilos no se throttlea y da 9,6-10,3 t/s. Ajustes de runtime (`--poll`, `--cpu-strict`, `-lm`, `--prio`) no muestran diferencias fuera del ruido: 10,37 t/s por defecto frente a 10,16-10,39 t/s en las variantes. En microbenchmark, el gemv NVFP4 monohilo es ~25 % más rápido (4,3 vs 5,6 ns por bloque de 64 pesos), pero la ganancia no aparece de extremo a extremo porque el decode está limitado por ancho de banda: la matvec de `ssm_in` mueve ~43 MB en 0,53 ms (~80 GB/s) frente a un techo medido de 120-150 GB/s.

## Requisitos de hardware

- **Memoria**: los pesos ocupan 20,5 GiB; se recomienda un mínimo de 24 GB de RAM libres y 32 GB para acomodar KV cache, proyector de visión y el propio sistema. El repositorio completo pesa 23,8 GB.
- **CPU**: el parche está ajustado y probado en un Intel Xeon Platinum 8559C. La ruta rápida requiere AVX512-VNNI; en CPUs sin AVX512 el código cae en la ruta `nrc == 1` y sigue siendo funcional, pero sin la aceleración de prefill.
- **GPU**: los pesos caben en GPUs de 24 GB (RTX 3090/4090, A10G, L4), pero esta build y su parche están orientados a CPU y no se documenta rendimiento en GPU en la información disponible.
- **Hilos**: `-t 16` maximiza prefill (45 t/s) cuando la cuota de CPU lo permite; `-t 12` ofrece decode más estable (9,6-10,3 t/s) bajo límites CFS.
- **Opciones de despliegue**: llama.cpp parcheado mediante `build.sh` (clonar, aplicar parche sobre `de5122d` y compilar). No se documenta soporte para vLLM, TGI ni Ollama en esta build; el uso de `-lm mlock` está recomendado en los benchmarks.
- **Latencia y throughput estimados**: prefill ~45 t/s y decode ~9-11 t/s en el hardware de referencia; el decode está limitado por ancho de banda de memoria, por lo que kernels más rápidos no elevan de forma apreciable los tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `HelloSun/Nemotron74ba9` (esta ficha) | 74B totales / ~9B activos | no disponible | IQ2_XXS + NVFP4 + Q8_0 | OpenMDW-1.1 | Peso GGUF + parche de código; 0 descargas, 0 likes en el momento de la consulta |
| `nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-GGUF` (modelo base) | 74B totales / ~9B activos | no disponible | IQ2_XXS + NVFP4 + Q8_0 (idéntica) | OpenMDW-1.1 | Repositorio oficial de NVIDIA; pesos sin modificar respecto a esta build |
| Familia NVIDIA Nemotron 3.5 (incluye variantes de mayor tamaño, p. ej. un sistema de 120B según prensa) | no disponible para la variante 120B | no disponible | no disponible | no disponible | Anunciada por NVIDIA; especificaciones no incluidas en la información proporcionada |

La comparación relevante en rendimiento es contra el mismo modelo ejecutado con llama.cpp stock: misma huella de memoria y misma licencia, con ~1,46x más prefill y decode equivalente.

## Limitaciones y advertencias

- **Cuantización agresiva**: IQ2_XXS es un formato de 2 bits para la mayor parte de los pesos (expertos); cabe esperar una degradación de calidad frente al modelo en precisión completa o en cuantizaciones de 4-8 bits. No se aportan métricas de calidad en el repositorio.
- **Licencia**: se declara OpenMDW-1.1 con `license: other`. Antes de un uso comercial hay que revisar los términos en el enlace oficial; esta ficha no interpreta el alcance de la licencia.
- **Repositorio no oficial**: se trata de una redistribución comunitaria con 0 descargas y 0 likes en el momento de la consulta. No hay garantía de mantenimiento ni de que los parches se integren en llama.cpp upstream.
- **Alcance del parche**: solo se ha validado en un Intel Xeon Platinum 8559C con AVX512-VNNI. En otras microarquitecturas el comportamiento y las ganancias pueden diferir; en CPUs sin AVX512 se pierde la mejora de prefill.
- **Decode sin mejora**: el propio autor reconoce que la diferencia entre rondas (5,8-11,6 t/s) es mayor que cualquier efecto del parche; no debe esperarse un aumento de tokens por segundo en generación.
- **Decodificación especulativa DFlash desaconsejada en CPU**: verificar 7 tokens a través del MoE lee muchos más expertos, y en texto con baja tasa de aceptación (prosa, 28 %) el rendimiento cae a 5,5 t/s.
- **Sensibilidad a la cuota de CPU**: con 16 hilos bajo un límite CFS se observa throttling y una varianza de 7,0 a 10,9 t/s; conviene fijar 12 hilos en producción.
- **Formato y tooling**: al ser GGUF, el modelo está atado al ecosistema llama.cpp; no se documenta compatibilidad con vLLM, TGI u otros servidores de inferencia.
- **Idiomas y contexto**: no se dispone de datos sobre cobertura lingüística ni longitud máxima de contexto, dos parámetros críticos para dimensionar aplicaciones reales.
- **Riesgo de alucinación y sesgos**: no se han publicado evaluaciones específicas para esta cuantización; deben aplicarse las precauciones habituales en producción (verificación factual, filtros de salida, evaluación propia del dominio).

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/HelloSun/Nemotron74ba9
- Modelo base en HuggingFace: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-GGUF
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Perfil del autor (HelloSun / Max Sun): https://huggingface.co/HelloSun/models
- Página de modelos Nemotron de NVIDIA: https://developer.nvidia.com/topics/ai/nemotron
- Nemotron en Wikipedia: https://en.wikipedia.org/wiki/Nemotron
- Cobertura de prensa sobre el lanzamiento de la familia Nemotron 3.5 (TechRepublic): https://www.techrepublic.com/article/news-nvidia-nemotron-3-5-super-vl-bolt-ai-models/

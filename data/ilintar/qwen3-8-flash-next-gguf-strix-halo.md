# ilintar/qwen3.8-flash-next-gguf-strix-halo

## Resumen

`ilintar/qwen3.8-flash-next-gguf-strix-halo` es una cuantización en formato GGUF del modelo `Qwen/Qwen3.8-Flash-Next`, un transformer de 176,94 B de parámetros publicado por el usuario `ilintar` y orientado a ejecutarse en una única máquina con APU AMD Ryzen AI Max+ y GPU integrada Radeon 8060S (`gfx1151`), también conocida como Strix Halo, con 128 GB de memoria unificada. El repositorio contiene los pesos en IQ4_NL repartidos en 9 fragmentos que suman 93,16 GiB, más un archivo auxiliar separado con la cabeza de decodificación especulativa MTP en Q8_0 y *embeddings* compartidos con el modelo objetivo.

El problema que resuelve es muy concreto: hacer viable la inferencia de un modelo de casi 177 B de parámetros en hardware de escritorio con memoria unificada, donde los pesos tienen que convivir con la caché KV y los búferes de cómputo. La arquitectura declarada por el autor es `qwen4exp`, con recurrencia *gated delta-net*, atención dispersa mediante *lightning-indexer* y *embeddings* por capa, y una ventana de contexto de entrenamiento de 262 144 tokens. El modelo solo declara inglés como idioma y licencia Apache 2.0.

La relevancia actual del repositorio es doble. Por un lado, demuestra un caso real de cuantización agresiva de un modelo grande para un único equipo; por otro, exige kernels de ROCm y soporte de arquitectura que no están en `llama.cpp` upstream, por lo que funciona como banco de pruebas de la rama `strix-halo` de `pwilkin/llama.cpp`. En el momento de la captura de datos, el repositorio no tenía descargas ni *likes*.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen4exp`: recurrencia gated delta-net, atención dispersa lightning-indexer, embeddings por capa |
| Parametros totales | 176,94 B (según el autor; la model card lo describe como 177 B) |
| Parametros activos | no disponible (no se indica que la arquitectura sea MoE) |
| Longitud de contexto | 262 144 tokens (contexto de entrenamiento declarado) |
| Tipos de cuantizacion | IQ4_NL (pesos del modelo objetivo); Q8_0 (cabeza draft MTP) |
| Idiomas soportados | en (inglés), según los metadatos del repositorio |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF: 9 fragmentos `Qwen3.8-Flash-Next-IQ4_NL-PROJFIX-*-of-00009.gguf` + `mtp-Qwen3.8-Flash-Next-shared-Q8_0.gguf` |

Notas sobre los datos de la tabla: el repositorio declara un tamaño de 31,8 GB, mientras que la model card indica 93,16 GiB para los pesos IQ4_NL; no se dispone de información que permita reconciliar ambos valores. Tampoco se especifica en la información proporcionada el número de tokens de entrenamiento, la composición del dataset ni la existencia de fases de RLHF o DPO.

## Arquitectura y entrenamiento

El autor identifica la arquitectura del modelo base como `qwen4exp` e indica tres componentes: recurrencia *gated delta-net*, atención dispersa con *lightning-indexer* y *embeddings* por capa. La tabla de *embeddings* por capa ocupa 27,5 GB y es la razón de que la ejecución requiera un modo de carga específico: con `--lazy-mode on-direct` sus filas se sirven mediante llamadas `pread()` explícitas desde un *thread pool*, en lugar de provocar fallos de página a través de un `mmap`; con `--load-mode none` se evita mantener una segunda copia de cada peso en la caché de páginas durante la carga. En memoria unificada con todo descargado a GPU, los pesos acaban en memoria gestionada (anónima) y compiten con la caché KV y los búferes de cómputo, de modo que sin estos dos modificadores el modelo no cabe, según el autor.

El repositorio no documenta el proceso de entrenamiento del modelo base: no hay datos sobre número de tokens, composición del corpus, técnicas de alineación ni innovaciones de entrenamiento. La model card sí detalla una innovación de despliegue, la cabeza MTP exportada con `--mtp-shared-embd`, que reutiliza los *embeddings* de tokens, la normalización de salida y el *LM head* del modelo objetivo para no duplicar una tabla de 27,5 GB. La marca `PROJFIX` en los nombres de archivo indica una reexportación que corrige el *layout* de los tensores de proyección; las compilaciones locales anteriores sin esa marca no son intercambiables.

## Capacidades

- Generación de texto en inglés: es el único `pipeline_tag` declarado (`text-generation`) y el único idioma listado en los metadatos.
- Procesamiento de contexto largo: la model card declara 262 144 tokens de contexto de entrenamiento, con una ruta de atención dispersa que mantiene el 92% de la tasa de *prefill* a 40 000 tokens de profundidad.
- Decodificación especulativa mediante MTP: incluye una cabeza *draft* separada en Q8_0 que comparte *embeddings* con el modelo objetivo.
- Inferencia local en GGUF sobre ROCm y `gfx1151`, con *offload* de la totalidad de los pesos a memoria unificada.
- Ejecución en servidor mediante `llama-server` de la rama `strix-halo`, siempre que el lanzador instalado aplique las variables de entorno que seleccionan los kernels ROCm.
- Soporte de *tool calling* / *function calling*: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; los metadatos solo declaran inglés.
- Visión, audio o modo de razonamiento explícito (*thinking mode*): no disponible en la información proporcionada.

## Casos de uso

- Análisis de documentación técnica extensa en local: con 262 144 tokens de contexto y 1059,82 t/s de *prefill* a 40 000 tokens, se puede cargar un manual completo o un conjunto de especificaciones y hacer preguntas sobre él sin fragmentar el material.
- Resumen e indexación de bases de código: el perfil de carga es intensivo en *prefill* y el modelo está pensado para contenido en inglés, lo que encaja con repositorios de código y documentación de API en ese idioma.
- Asistente interno con requisitos de confidencialidad: al ejecutarse íntegramente en una máquina con 128 GB de memoria unificada y sin llamadas a servicios externos, los datos no salen del equipo, algo relevante en entornos con restricciones de tratamiento de información.
- Procesamiento por lotes de corpus largos: tareas de clasificación, extracción de entidades o resumen sobre documentos completos aprovechan la ruta de *prefill* rápido, que es la mitad fuerte del rendimiento medido.
- Chat en inglés a velocidad de lectura: con 24,13 t/s de generación a profundidad cero y 15,43 t/s a 40 000 tokens, el modelo sirve para conversación de baja concurrencia, no para despliegues con muchos usuarios simultáneos.
- Evaluación de decodificación especulativa: la cabeza MTP en Q8_0 con *embeddings* compartidos permite experimentar con *speculative decoding* sobre el mismo *stack* de kernels.
- Investigación en cuantización y kernels ROCm: el repositorio documenta el paso a paso de la optimización de *prefill* desde 191 t/s hasta las cifras actuales, incluidas mediciones que no mejoraron y dos errores detectados, lo que lo convierte en material de referencia para trabajar sobre `gfx1151`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor indica explícitamente que la calidad se comprobó mediante perplejidad emparejada contra un *stack* de referencia, y no con puntuaciones de benchmarks públicos.

Los únicos datos medidos son de rendimiento de inferencia, obtenidos en una Radeon 8060S con 128 GB unificados, ROCm 10.0 con los *runtimes* retained-PM4 y los parámetros `-b 24576 -ub 24576 -p 16384 -n 128 -r 3`:

| Profundidad de contexto | Prefill (t/s) | Generación (t/s) |
|---|---:|---:|
| 0 | 1151,77 ± 8,12 | 24,13 ± 0,29 |
| 40 000 | 1059,82 ± 4,46 | 15,43 ± 1,77 |

El propio autor señala que la generación es la mitad más débil y que todavía está por debajo de lo que alcanzan los mismos kernels fuera del árbol, una brecha que queda abierta.

## Requisitos de hardware

- VRAM: se necesitan al menos los 93,16 GiB de pesos IQ4_NL, más 2,6 GB de la cabeza *draft* MTP, más la caché KV y los búferes de cómputo. La configuración de referencia es de 128 GB de memoria unificada.
- GPU de referencia: Radeon 8060S integrada en AMD Ryzen AI Max+ (`gfx1151`), con ROCm 10.0 y los *runtimes* retained-PM4.
- GPU de consumo: no cabe en tarjetas de consumo con 24 GB de VRAM como la RTX 4090; el modelo está dimensionado para memoria unificada de 128 GB.
- Solución de despliegue: `llama.cpp` en la rama `strix-halo` de `pwilkin/llama.cpp`, que compila las revisiones fijadas de ROCr, HIP y `llama.cpp` en el directorio personal e instala un lanzador con los modificadores correctos. No se menciona soporte para vLLM, Ollama ni TGI.
- Modificadores críticos: `--load-mode none --lazy-mode on-direct`. La tabla de *embeddings* por capa ocupa 27,5 GB y sin ellos el modelo no cabe según el autor.
- Latencia y throughput: los de la tabla anterior, medidos con la máquina de referencia; el *prefill* conserva el 92% de su tasa a 40 000 tokens.
- Limitación conocida del *ubatch*: los 24 576 tokens de *ubatch* usados en las mediciones no pueden ejecutarse en `llama.cpp` upstream sobre este hardware, porque `mm_ids_helper` dimensiona su memoria compartida como `n_tokens × 4` bytes, lo que da 98 KB frente a los 64 KB de LDS disponibles en `gfx1151`.

## Comparativa con modelos similares

No se dispone de datos en la información proporcionada para comparar este modelo con alternativas de terceros de la misma categoría. La model card tampoco incluye comparaciones con otros modelos. La única referencia disponible es el propio modelo base del que deriva esta cuantización:

| Modelo | Parametros totales | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `ilintar/qwen3.8-flash-next-gguf-strix-halo` | 176,94 B | 262 144 | apache-2.0 | GGUF IQ4_NL en 9 fragmentos; requiere la rama `strix-halo` de `llama.cpp` |
| `Qwen/Qwen3.8-Flash-Next` (modelo base) | no disponible | no disponible | no disponible | no disponible en la información proporcionada |
| Alternativas de terceros | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Estado experimental: el autor califica el despliegue como experimental. Los kernels ROCm se seleccionan mediante variables de entorno que establece el lanzador instalado; si se ejecuta `llama-server` directamente, se obtienen las rutas genéricas.
- Dependencia de un *fork*: el modelo requiere soporte de arquitectura y kernels que no están en `llama.cpp` upstream, lo que complica la reproducibilidad y el mantenimiento a largo plazo.
- Compatibilidad de archivos: las compilaciones locales anteriores a la marca `PROJFIX` no son intercambiables con esta reexportación.
- Presión sobre memoria unificada: al descargarse todos los pesos a memoria gestionada, estos compiten con la caché KV y los búferes de cómputo; el margen de contexto utilizable depende de la configuración concreta.
- Rendimiento de generación limitado: 24,13 t/s a profundidad cero y 15,43 t/s a 40 000 tokens hacen inviable un despliegue con concurrencia alta.
- Idioma: solo se declara inglés, por lo que no hay garantía de calidad en castellano ni en otros idiomas.
- Calidad no verificada con benchmarks públicos: la única comprobación reportada es de perplejidad emparejada contra un *stack* de referencia, sin cifras publicadas.
- Riesgo de alucinación y sesgos: no disponible; la información proporcionada no incluye evaluaciones de sesgo, seguridad ni alineación del modelo base.
- Licencia: el repositorio de la cuantización declara apache-2.0, pero no se dispone de información sobre los términos del modelo base `Qwen/Qwen3.8-Flash-Next`, que conviene verificar antes de un uso comercial.
- Inconsistencia de datos: el tamaño de repositorio declarado por HuggingFace (31,8 GB) no coincide con los 93,16 GiB de pesos indicados en la model card.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/ilintar/qwen3.8-flash-next-gguf-strix-halo
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Rama `strix-halo` de llama.cpp: https://github.com/pwilkin/llama.cpp
- Script de instalación: https://raw.githubusercontent.com/pwilkin/strix-halo/main/install-flash-next.sh
- Crónica técnica de la optimización de *prefill*: https://pwilkin.github.io/strix-halo/journey.html
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante para este modelo; los resultados devueltos corresponden a repositorios de *prompts* tipo DAN, a un proyecto de síntesis de voz y a la documentación de modelos de GitHub Copilot, sin relación con `Qwen3.8-Flash-Next`.

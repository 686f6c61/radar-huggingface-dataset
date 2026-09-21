# kingjones777/Ternary-Bonsai-8B-ROCm-gfx1151

## Resumen

`kingjones777/Ternary-Bonsai-8B-ROCm-gfx1151` es un repositorio de documentación, no de pesos: no contiene ningún fichero de modelo, sino mediciones del modelo ternario `prism-ml/Ternary-Bonsai-8B-gguf` sobre AMD ROCm en hardware Strix Halo (Radeon 8060S, `gfx1151`) con ROCm 7.13 y el fork `prism` de llama.cpp en el commit `9a9394a`. Su aportación es resolver un problema práctico que la model card original de prism-ml no cubre: de los cuatro ficheros de bajo bit disponibles (tres en el repositorio oficial más una conversión comunitaria), no todos son equivalentes, uno de ellos no carga en builds actuales y la diferencia de rendimiento entre el más rápido y el más lento es de 2,2x.

El modelo base es un transformer de arquitectura `qwen3` de 8B parámetros, cuantizado en formato ternario (del orden de 2 bits por parámetro, a partir de los tamaños de fichero publicados) y empaquetado en GGUF para llama.cpp. Declara 65.536 tokens de contexto que sirven completos, es solo texto (sin mmproj de visión), no incorpora rotación Hadamard ni cabeza MTP, y soporta tool calling con `--jinja`. Los defaults de muestreo van embebidos en el GGUF: `temp 0.5`, `top_k 20`, `top_p 0.85`, `min_p 0.0`.

Su relevancia ahora es doble: por un lado, documenta con cifras reproducibles qué cuantización ternaria conviene usar en GPUs integradas AMD de nueva generación (Strix Halo), un nicho poco cubierto por las evaluaciones habituales centradas en NVIDIA; por otro, expone un caso claro de incompatibilidad silenciosa de formato (el fichero `Q2_0` legacy con group size 128 frente al estándar group-64) que puede costar horas de depuración a quien descargue el fichero equivocado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer `qwen3` (según la información del repositorio; sin rotación Hadamard y sin cabeza MTP) |
| Parámetros totales | 8B (denominación del modelo; no se detalla el desglose en la información disponible) |
| Parámetros activos | No aplica (no es un modelo MoE según la información disponible) |
| Longitud de contexto | 65.536 tokens declarados, servidos en su totalidad |
| Tipos de cuantización | PQ2_0 (tipo privado de PrismML), Q2_0_g64 (grupo 64), Q2_0 legacy g128 (no carga en builds actuales), TQ2_0 (ggml type 35, conversión comunitaria); existe además un fichero F16 de origen |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (coincide con la del modelo base) |
| Formato de pesos | GGUF (llama.cpp) |
| Tamaño de fichero | 2,18 GB (PQ2_0) / 2,31 GB (Q2_0_g64) / 2,18 GB (Q2_0, no carga) / 2,66 GB (TQ2_0 comunitario) |
| Biblioteca | llama.cpp (fork PrismML, rama `prism`) |
| Hardware de referencia | AMD Strix Halo, Radeon 8060S, `gfx1151`, ROCm 7.13 |
| Muestreo por defecto | temp 0.5, top_k 20, top_p 0.85, min_p 0.0 |

## Arquitectura y entrenamiento

La arquitectura del modelo base es `qwen3`, una familia ampliamente soportada por el ecosistema llama.cpp, lo que simplifica su despliegue frente a variantes propietarias. El repositorio documenta explícitamente lo que el modelo *no* incluye respecto a su hermano mayor `Ternary-Bonsai-2 27B`: no hay rotación Hadamard plegada en los pesos (no existen metadatos `prism.hadamard.*`), no hay cabeza MTP y por tanto no requiere parche de runtime, y no hay torre de visión (es text-only, sin mmproj separado). La consecuencia técnica es que no hace falta el transform inverso de base rotada ni modificaciones en el código fuente para ejecutarlo.

En cuanto a la cuantización, el repositorio mide cuatro ficheros producidos por tres vías distintas: los formatos propietarios/derivados de PrismML (`PQ2_0`, `Q2_0_g64`, `Q2_0` legacy) y la conversión comunitaria al tipo estándar `TQ2_0` (ggml type 35) de `ewchampion`, que es portable a cualquier build reciente de llama.cpp. No se aportan datos sobre el dataset de entrenamiento, el número de tokens, la composición de la mezcla ni si hubo fases de RLHF o DPO; esa información no está disponible en el material proporcionado. La innovación destacable documentada aquí no es de entrenamiento sino de formato y despliegue: los tipos ternarios privados de PrismML ofrecen más del doble de throughput que el tipo ternario estándar de ggml sobre el mismo binario, a cambio de atarse a su fork.

## Capacidades

- Generación de texto y reescritura literal: el repositorio valida el modelo con tres tareas de generación distintas y tres fuentes de reescritura verbatim por cada variante, con resultado correcto en las tres ejecuciones de cada brazo que carga.
- Tool calling / function calling: funciona con la opción `--jinja` de `llama-server`, lo que habilita plantillas de chat con definición de herramientas.
- Contexto largo: sirve de forma efectiva los 65.536 tokens declarados, lo que permite conversaciones multi-turno extensas o procesamiento de documentos largos en una sola pasada.
- Razonamiento y código: no se documentan capacidades específicas ni evaluaciones en la información disponible; la model card del repositorio no incluye benchmarks de MMLU, HumanEval, GSM8K ni equivalentes.
- Capacidades multilingües: no disponibles (no se declara lista de idiomas).
- Sin visión: es un modelo solo texto; no existe proyector multimodal.
- Sin modo *thinking* declarado ni cabeza MTP para decodificación especulativa.

## Casos de uso

- Documentación de despliegue para GPUs AMD integradas: el repositorio sirve como referencia reproducible para elegir fichero de cuantización en Strix Halo, con comando de compilación, flags del servidor y cifras de throughput comparables.
- Inferencia local en portátiles y mini-PC con memoria unificada: con ficheros de 2,18 a 2,66 GB, el modelo cabe holgadamente en un iGPU Radeon 8060S y permite ejecutar un 8B a 65.536 tokens de contexto sin GPU dedicada.
- Asistentes conversacionales de contexto largo: los 65.536 tokens permiten mantener historiales extensos, resúmenes acumulados o bases de conocimiento inyectadas en el prompt sin truncado agresivo.
- Agentes con herramientas: al soportar `--jinja` y tool calling, puede integrarse en flujos de agente que consulten APIs, ejecuten búsquedas o encadenen pasos múltiples sobre el servidor `llama-server` con `-np 1`.
- Reescritura y normalización de texto a escala: la tarea de *rewrite* medida (76,16 t/s en PQ2_0) es directamente aplicable a pipelines de limpieza, reformateo o transformación de corpus donde importa el coste por token.
- Evaluación de cuantizaciones ternarias en producción: útil para equipos que comparen el coste de portabilidad (TQ2_0, 34,88 t/s) frente al rendimiento máximo con fork propietario (PQ2_0, 77,87 t/s) antes de fijar su stack.
- Servicio de bajo consumo en edge con ROCm: la combinación de modelo ternario y `-fa on`, `--no-mmap`, `-b 2048`, `-ub 1024`, `-t 16` documentada aquí sirve como plantilla de configuración afinada para hardware AMD de gama integrada.
- Prototipado sin GPU NVIDIA: alternativa para investigadores que solo disponen de hardware AMD y necesitan un modelo de 8B con contexto de 64K y soporte de herramientas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K ni similares) en la información disponible. El repositorio aporta exclusivamente mediciones de throughput sobre AMD Strix Halo (Radeon 8060S, `gfx1151`), ROCm 7.13, fork PrismML `prism` en `9a9394a`, con servidor nuevo por brazo y `cache_prompt:false`:

| Fichero | Tamaño | Generación (t/s) | Reescritura (t/s) | Carga correcta |
|---|---:|---:|---:|---|
| `Ternary-Bonsai-8B-PQ2_0.gguf` | 2,18 GB | 77,87 | 76,16 | 3/3 |
| `Ternary-Bonsai-8B-Q2_0_g64.gguf` | 2,31 GB | 76,35 | 75,48 | 3/3 |
| `Ternary-Bonsai-8B-Q2_0.gguf` (legacy g128) | 2,18 GB | No carga | — | 0/3 |
| `Ternary-Bonsai-8B-TQ2_0.gguf` (comunitario) | 2,66 GB | 34,88 | 35,04 | 3/3 |

Comprobación cruzada de portabilidad: el mismo fichero TQ2_0 ejecutado en un fork ROCm no relacionado rinde 33,75 t/s, un 3,2% por debajo del build de PrismML, lo que confirma que la diferencia de rendimiento se debe al formato y no al runtime. La horquilla total entre el fichero más rápido y el más lento es de 2,2x; `PQ2_0` es simultáneamente el más pequeño y el más rápido, con 2,23x el throughput de `TQ2_0`, que además es un 22% más grande.

## Requisitos de hardware

- VRAM/almacenamiento de pesos: 2,18 GB para `PQ2_0` y `Q2_0` legacy, 2,31 GB para `Q2_0_g64` y 2,66 GB para `TQ2_0`; hay que sumar el espacio de caché KV para los 65.536 tokens de contexto.
- Hardware de referencia validado: AMD Strix Halo con Radeon 8060S (`gfx1151`), ROCm 7.13, memoria unificada, ejecutado con `-ngl 999 -fa on --no-mmap -fit off -np 1 -b 2048 -ub 1024 -t 16 -c 65536`.
- GPU consumer: el modelo cabe en iGPU de gama integrada; no hay datos publicados para RTX 4090, A100, H100 ni otras GPU en la información disponible.
- Latencia estimada en el hardware de referencia: aproximadamente 12,8 ms por token en generación con `PQ2_0` (derivado de 77,87 t/s) y unos 28,7 ms por token con `TQ2_0` (derivado de 34,88 t/s).
- Despliegue con máximo rendimiento: requiere compilar el fork PrismML de llama.cpp (rama `prism`) para usar los tipos privados `PQ2_0`/`Q2_0_g64`. Aviso de compilación documentado: `-DGGML_HIP=ON` por sí solo falla con "Failed to find ROCm root directory"; hay que pasar explícitamente `CMAKE_HIP_COMPILER=/opt/rocm/lib/llvm/bin/clang++` y `CMAKE_HIP_COMPILER_ROCM_ROOT=/opt/rocm`.
- Despliegue portable: `TQ2_0` (ggml type 35) carga en cualquier llama.cpp reciente, incluidos forks sin conocimiento de los tipos de PrismML, a costa de más de la mitad del throughput.
- Otras opciones de despliegue (vLLM, TGI, Ollama, LM Studio): no confirmadas en la información disponible; el repositorio solo documenta `llama-server`.

## Comparativa con modelos similares

| Modelo / variante | Arquitectura | Parámetros | Contexto | Throughput medido | Licencia | Notas |
|---|---|---|---|---|---|---|
| Ternary-Bonsai-8B (`PQ2_0`) | `qwen3` | 8B | 65.536 | 77,87 t/s gen | Apache-2.0 | Sin Hadamard, sin MTP, sin visión; requiere fork PrismML |
| Ternary-Bonsai-8B (`TQ2_0`) | `qwen3` | 8B | 65.536 | 34,88 t/s gen | Apache-2.0 | Portátil en cualquier llama.cpp reciente; 22% más grande |
| Ternary-Bonsai-2 27B | `qwen35` | 27B | No disponible | No medido en esta información | No disponible | Rotación Hadamard plegada, requiere parche de runtime para MTP, visión vía mmproj separado |
| Otras alternativas de 8B en 2 bits | No disponible | No disponible | No disponible | No disponible | No disponible | La búsqueda web realizada no devolvió resultados relevantes (devolvió páginas de Microsoft Word); no se dispone de comparativas verificadas con otros modelos ternarios de tamaño similar |

## Limitaciones y advertencias

- El repositorio no contiene pesos: es únicamente documentación y mediciones. Los ficheros deben descargarse de `prism-ml/Ternary-Bonsai-8B-gguf` o de la conversión comunitaria.
- Trampa de compatibilidad: `Ternary-Bonsai-8B-Q2_0.gguf` no carga en builds actuales porque emplea el layout legacy g128 (group size 128 almacenado como ggml type id 42) mientras el build lo interpreta como group-64 oficial; el nombre del fichero no lo advierte.
- Coste de portabilidad: usar el tipo ternario estándar `TQ2_0` reduce el throughput más de un 50% (34,88 frente a 77,87 t/s) y ocupa un 22% más de disco.
- Dependencia de fork: exprimir `PQ2_0` obliga a mantener el fork PrismML de llama.cpp, con el coste de mantenimiento y de seguimiento de upstream que eso implica.
- Sin benchmarks de calidad publicados: no hay datos de MMLU, HumanEval, GSM8K ni evaluaciones humanas que permitan estimar la degradación de calidad frente al modelo F16 de origen o frente a cuantizaciones de 4 bits.
- Mediciones de un único entorno: todas las cifras provienen de un solo equipo (Strix Halo, `gfx1151`, ROCm 7.13) y de un commit concreto del fork (`9a9394a`); no son extrapolables sin verificación a otras GPU, versiones de ROCm o builds.
- Idiomas no declarados: al no especificarse la lista de idiomas soportados, el comportamiento multilingüe es una incógnita, incluido el castellano.
- Riesgo de alucinación: no documentado ni cuantificado en la información disponible; debe asumirse el riesgo habitual de un modelo de 8B cuantizado en 2 bits.
- Sesgos: no se documenta ninguna evaluación de sesgos o seguridad, ni alineamiento (RLHF/DPO) del modelo base.
- Licencia: Apache-2.0, permisiva para uso comercial, siempre que se respeten las condiciones de atribución; conviene verificar la licencia del modelo base y de la conversión comunitaria por separado.
- Visión y multimodalidad: no disponibles; cualquier flujo que requiera imágenes queda fuera del alcance de este modelo.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: las mediciones no cuentan con validación independiente más allá de la reproducibilidad del comando documentado.

## Enlaces

- Repositorio de este repositorio de documentación: https://huggingface.co/kingjones777/Ternary-Bonsai-8B-ROCm-gfx1151
- Modelo base (pesos): https://huggingface.co/prism-ml/Ternary-Bonsai-8B-gguf
- Conversión comunitaria TQ2_0: https://huggingface.co/ewchampion/Ternary-Bonsai-8B-TQ2_0-GGUF
- Fork PrismML de llama.cpp, rama `prism`: https://github.com/PrismML-Eng/llama.cpp
- Búsqueda web realizada: sin resultados relevantes para este modelo (los resultados devueltos correspondían a páginas de Microsoft Word y no se han utilizado como fuente).

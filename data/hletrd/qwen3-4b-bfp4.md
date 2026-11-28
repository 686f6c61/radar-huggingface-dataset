# hletrd/Qwen3-4B-BFP4

## Resumen

Qwen3-4B-BFP4 es una cuantización del modelo Qwen3-4B de Alibaba Qwen, publicada por el usuario hletrd, orientada específicamente a la ejecución en aceleradores Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). No se trata de una cuantización genérica para GPU, sino de un empaquetado en formato block floating point de 4 bits (`bfloat4_b`) pensado para las unidades de cómputo tensorial de los NPU de Tenstorrent, con kernels y runner propios publicados en los repositorios de Xylolabs.

El modelo conserva la arquitectura transformer densa del Qwen3-4B original, con 4.411.424.256 parámetros totales, y aplica cuantización GPTQ con búsqueda de exponente por bloque únicamente a las proyecciones de atención (q, k, v, o) y de MLP (gate, up, down) en las 36 capas. El LM head, los embeddings y las normas permanecen en bf16, lo que limita la degradación de la calidad. El resultado empaquetado ocupa 2,822 GB frente a los 8,04 GB en bf16.

Su relevancia radica en que demuestra que un modelo de 4B puede desplegarse en hardware NPU de Tenstorrent con una pérdida de fidelidad medida (KL medio a bf16 de 0,0711) muy próxima a la de una cuantización estándar Q4_K_M de llama.cpp (0,0658), es decir, un factor de 1,08. Es, por tanto, una pieza útil para quienes trabajan con el stack tt-metal, ttnn y tt-forge y necesitan modelos listos para producción en ese ecosistema.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3) con cuantizacion block floating point en proyecciones |
| Parametros totales | 4.411.424.256 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | bfloat4_b (BFP4) en proyecciones de atencion y MLP; bf16 en embeddings, LM head y normas |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (empaquetado Tensix, 2,822 GB); compatible con carga en transformers en bf16 |

## Arquitectura y entrenamiento

El modelo base Qwen3-4B es un transformer denso de la familia Qwen3, con 36 capas y proyecciones de atención y MLP estándar. Esta versión no reentrena el modelo: aplica cuantización GPTQ con una búsqueda de exponente por bloque sobre las matrices de proyección, generando pesos en formato `bfloat4_b` que se empaquetan directamente para las unidades Tensix. Las matrices cuantizadas son las de atención (q, k, v, o) y las de MLP (gate, up, down) en las 36 capas; el resto de tensores (embeddings, LM head atado al embedding, normas) se mantienen en bf16 tal como en el modelo original.

La innovación técnica principal es el formato block floating point de 4 bits con exponente compartido por bloque, que se mapea de forma nativa al tipo `ttnn.bfloat4_b` del stack tt-metal. El repositorio incluye `quant4.json`, que documenta el formato de cada proyección, y las herramientas `pack_tensix.py` y `verify_grid.py` para verificar el empaquetado y la reconstrucción de cada matriz. Los mismos valores también se pueden empaquetar exactamente en `ttnn.bfloat8_b`. No se dispone de información sobre el dataset de entrenamiento original de Qwen3-4B ni sobre si hubo RLHF o DPO en esta ficha, más allá de lo que documenta el modelo base.

## Capacidades

- Generación de texto conversacional y de propósito general, heredada del Qwen3-4B base.
- Razonamiento y matemáticas a nivel de modelo de 4B (sin datos de benchmarks específicos en esta ficha).
- Generación de código, limitada por el tamaño del modelo base.
- Soporte de plantilla de chat (`apply_chat_template`) para conversaciones multi-turno.
- Ejecución en transformers estándar cargando los pesos en bf16 (la cuantización se materializa al empaquetar en Tensix).
- Ejecución nativa en NPU Tensix mediante tt-metal v0.81.1 (tt-transformers) y tt-forge con `torch.compile(backend="tt")`.
- Compatibilidad con text-generation-inference y endpoints compatibles (según tags del repositorio).
- Capacidades multilingües: no disponibles en la información proporcionada.
- No se documentan capacidades de visión, audio ni modo thinking específicas en esta ficha.

## Casos de uso

- Despliegue en NPU Tenstorrent Wormhole o Blackhole: el modelo está empaquetado para `ttnn.bfloat4_b` y se ejecuta con tt-transformers o tt-forge, lo que permite servir un 4B en hardware Tensix con 2,822 GB de pesos.
- Inferencia de bajo consumo en edge con aceleradores Tenstorrent: la reducción de 8,04 GB a 2,822 GB facilita encajar el modelo en tarjetas con DRAM limitada del ecosistema Tensix.
- Evaluación de calidad de cuantización BFP4: útil como referencia para comparar KL frente a bf16 y frente a Q4_K_M de llama.cpp en pipelines de investigación sobre formatos de bloque.
- Prototipado de asistentes conversacionales: con la plantilla de chat de Qwen3 y decodificación token a token en Tensix, sirve para validar latencia y throughput antes de escalar a modelos mayores.
- Generación de código en entornos de desarrollo integrados con backend Tensix: adecuado para autocompletado y explicación de fragmentos, siempre que se acepte la pérdida de calidad de un 4B cuantizado a 4 bits.
- Docencia y experimentación con block floating point: los scripts `pack_tensix.py` y `verify_grid.py` permiten reproducir el empaquetado y verificar la reconstrucción matriz a matriz, lo que lo convierte en un caso de estudio práctico.
- Integración en pipelines de CI para validar kernels Tensix: al ser un checkpoint pequeño y verificable, se puede usar como modelo de prueba en tests de regresión de tt-metal y tt-forge.

## Benchmarks y rendimiento

| Metrica | Qwen3-4B-BFP4 | llama.cpp Q4_K_M |
|---|---:|---:|
| Tamano empaquetado (GB) | 2,822 | no disponible |
| Tamano en bf16 (GB) | 8,04 | no disponible |
| KL medio a bf16 | 0,0711 | 0,0658 |
| Factor KL frente a Q4_K_M | 1,08 | 1,00 (referencia) |
| Top-1 (%) | no disponible | no disponible |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos de evaluación son las métricas de fidelidad de cuantización frente a bf16 y frente a Q4_K_M.

## Requisitos de hardware

- VRAM/DRAM estimada: 2,822 GB de pesos empaquetados en BFP4 para Tensix; en carga con transformers en bf16 se requieren aproximadamente 8,8 GB (tamaño del repositorio) más overhead de activaciones.
- GPU recomendadas: no aplica de forma nativa; el destino son NPU Tensix (Wormhole, Blackhole). En GPU convencional solo se puede cargar en bf16 vía transformers, sin aprovechar la cuantización.
- Cabe en GPU de consumo: en bf16 sí cabe en GPUs con 12-16 GB o más (por ejemplo, RTX 4070 Ti, RTX 4080, RTX 4090); la versión BFP4 está pensada para Tensix, no para CUDA.
- Opciones de despliegue: tt-metal v0.81.1 con tt-transformers (`simple_text_demo.py`), tt-forge con `pjrt-plugin-tt==1.4.0` y `torch.compile(backend="tt")`, transformers estándar en bf16, y text-generation-inference según los tags del repositorio.
- Latencia y throughput: no disponibles en la información proporcionada; el README menciona un test de rendimiento batch-1 con `--optimizations` específicas, pero no publica cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Plataforma objetivo |
|---|---|---|---|---|---|
| Qwen3-4B-BFP4 | 4,41B | no disponible | BFP4 (bfloat4_b) | Apache-2.0 | Tensix (Wormhole, Blackhole) |
| Qwen3-4B (base) | 4,41B | no disponible | bf16 | Apache-2.0 | GPU/CPU generico |
| Qwen3-4B en Q4_K_M (llama.cpp) | 4,41B | no disponible | Q4_K_M (4 bits) | Apache-2.0 | CPU/GPU via llama.cpp |
| Otras cuantizaciones de 4B (GPTQ/AWQ) | ~4,4B | no disponible | 4 bits grupo | Apache-2.0 | GPU CUDA |

La comparación relevante en calidad es frente a Q4_K_M: el KL medio de BFP4 (0,0711) es un 8% superior al de Q4_K_M (0,0658), lo que sitúa la fidelidad de esta cuantización ligeramente por debajo de la referencia de llama.cpp, a cambio de un empaquetado nativo para Tensix. No se dispone de datos de benchmarks de tareas para comparar rendimiento funcional con alternativas.

## Limitaciones y advertencias

- La cuantización a 4 bits introduce degradación medible: KL medio de 0,0711 frente a bf16, un 8% peor que Q4_K_M de llama.cpp.
- El formato BFP4 está atado al stack Tensix; fuera de tt-metal/tt-forge no se aprovecha y hay que cargar en bf16, perdiendo la ventaja de tamaño.
- No se documentan idiomas soportados ni evaluación multilingüe en esta ficha; hay que remitirse al modelo base Qwen3-4B.
- No se publican resultados de benchmarks de tareas (razonamiento, código, matemáticas), por lo que la calidad funcional debe validarse empíricamente antes de producción.
- Riesgo de alucinación inherente a un modelo de 4B, agravado por la cuantización a 4 bits en las proyecciones.
- El repositorio tiene muy poca tracción (229 descargas, 0 likes) y fue creado en noviembre de 2026; conviene verificar la reproducibilidad del empaquetado con `verify_grid.py`.
- Licencia Apache-2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base Qwen3-4B y de las herramientas de Xylolabs (tensix-bfp-gptq, tensix-kernels, tensix-runner) por si tuvieran condiciones adicionales.
- El README cita el repositorio `Xylolabs/Qwen3-4B-Tenstorrent-Tensix-BFP4` como origen, distinto del ID `hletrd/Qwen3-4B-BFP4`; conviene comprobar que los pesos son idénticos antes de desplegar.

## Enlaces

- Hugging Face: https://huggingface.co/hletrd/Qwen3-4B-BFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Repositorio de cuantización: https://github.com/XylolabsInc/tensix-bfp-gptq
- Commit de referencia: https://github.com/XylolabsInc/tensix-bfp-gptq/tree/5c52065fffec88021a0703a1bfe5266e4c674711
- Release tensix-bfp-gptq v0.1.0: https://github.com/XylolabsInc/tensix-bfp-gptq/releases/tag/v0.1.0
- Release tensix-kernels v0.1.0: https://github.com/XylolabsInc/tensix-kernels/releases/tag/v0.1.0
- Release tensix-runner v0.1.0: https://github.com/XylolabsInc/tensix-runner/releases/tag/v0.1.0
- Documentación Tenstorrent: https://docs.tenstorrent.com
- tt-metal v0.81.1: https://github.com/tenstorrent/tt-metal
- Paper de referencia (arXiv:2505.09388): https://arxiv.org/abs/2505.09388

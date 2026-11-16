# RenormalizationTech/Qwen3-4B-tuneLLM-NF4

## Resumen

Qwen3-4B-tuneLLM-NF4 es un checkpoint cuantizado en 4 bits del modelo Qwen3-4B de Alibaba Qwen, publicado por el usuario RenormalizationTech dentro de un flujo de trabajo denominado tuneLLM. No se trata de un modelo nuevo entrenado desde cero, sino de una representación NF4 del Qwen3-4B original obtenida con bitsandbytes (cuantización doble y cómputo en BF16) y preparada con PEFT k-bit para poder adjuntar adaptadores LoRA posteriormente. El repositorio contiene únicamente la base cuantizada sin adaptadores ni entrenamiento adicional, y su propósito declarado es servir como punto de partida reproducible para el citado flujo tuneLLM.

El modelo conserva la arquitectura transformer decoder-only de Qwen3-4B, con 4.022.468.096 parámetros totales según los safetensors del repositorio. El peso del repo es de 3,4 GB, aunque el autor precisa que el checkpoint ocupa aproximadamente 3,21 GiB porque los módulos no cuantizados se almacenan en FP32 en lugar de 4 bits. La licencia es Apache 2.0, heredada del modelo base.

Su relevancia es acotada: se publica como artefacto de verificación y reproducibilidad (1.659 tensores comprobados, dos sondas de logits y comparación de IDs generados) más que como modelo de propósito general. Con 5 descargas y 0 likes en el momento de la consulta, es un recurso de nicho orientado a quien quiera reproducir el pipeline de cuantización y el screen de benchmarks del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-4B); cuantización NF4 con bitsandbytes y cuantización doble |
| Parametros totales | 4.022.468.096 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada (heredada de Qwen3-4B, no confirmada en esta ficha) |
| Tipos de cuantizacion | NF4 de 4 bits con cuantización doble; módulos no cuantizados en FP32; cómputo en BF16; existe una representación GGUF Q4_K_M separada del mismo autor |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers, configuración de cuantización almacenada) |

## Arquitectura y entrenamiento

El checkpoint parte de Qwen/Qwen3-4B fijado al commit `1cfa9a7208912126459214e8b04321603b3df60c`. Sobre esa base se aplicó carga con bitsandbytes en NF4, cuantización doble y cómputo en BF16, seguida de la preparación k-bit de PEFT. Los módulos que no se cuantizan quedan en FP32, lo que explica que el tamaño real (unos 3,21 GiB) supere lo que implicaría una cuantización de 4 bits aplicada a todos los parámetros. No hay entrenamiento adicional, LoRA ni "physics training" en este repositorio: el autor lo describe explícitamente como base no adaptada, guardada antes de adjuntar los adaptadores LoRA de escritura de física.

La validación realizada consiste en una recarga desde la cuantización almacenada, con recuantización explícitamente prohibida, que coincide exactamente en los 1.659 tensores de estado, en dos sondas fijas de logits de último token y en los IDs generados. El autor subraya que son comprobaciones de serialización, no afirmaciones amplias de capacidades. El entorno verificado es PyTorch 2.6.0+cu124, Transformers 4.57.6, bitsandbytes 0.49.2 y PEFT 0.18.1 sobre una RTX A6000, y requiere una GPU CUDA compatible. La carga debe hacerse con `torch_dtype=torch.float32`, `attn_implementation="sdpa"` y `device_map={"": 0}`, sin aplicar una segunda cuantización.

## Capacidades

- Generación de texto conversacional y no conversacional, heredada del modelo base Qwen3-4B.
- Razonamiento y matemáticas de nivel medio, con resultados medidos en GSM8K dentro del screen del autor.
- Seguimiento de instrucciones evaluado con IFEval en modo estricto a nivel de prompt.
- Conocimiento general y de dominio (física) medido mediante MMLU zero-shot con verosimilitud de letra.
- Punto de partida para QLoRA: la base está preparada con PEFT k-bit para adjuntar adaptadores LoRA guardados por separado.
- Compatibilidad con endpoints (tag `endpoints_compatible`) y con el pipeline `text-generation` de transformers.
- Capacidades específicas de Qwen3 (tool calling, agentes, modo thinking, multilingüismo) no verificadas en la información proporcionada para este checkpoint cuantizado.

## Casos de uso

- Reproducción del pipeline tuneLLM: cargar el checkpoint con la revisión fijada y el entorno exacto documentado (PyTorch 2.6.0+cu124, Transformers 4.57.6, bitsandbytes 0.49.2, PEFT 0.18.1) para validar que los 1.659 tensores y las sondas de logits coinciden, tal como hizo el autor.
- Base para QLoRA en GPU de 48 GB: al estar preparada con PEFT k-bit, permite adjuntar adaptadores LoRA sin recuantizar y entrenar sobre una única RTX A6000, el hardware en el que se verificó.
- Comparación de representaciones: sirve para contrastar el rendimiento de la representación NF4 guardada frente al control BF16 en los mismos subconjuntos (MMLU general, MMLU física, GSM8K, IFEval) y estudiar el efecto de la cuantización en el pipeline.
- Evaluación de seguimiento de instrucciones: usar el checkpoint con el scorer oficial de IFEval a nivel de prompt estricto para medir si la cuantización NF4 degrada el cumplimiento de instrucciones frente a BF16.
- Despliegue ligero en entornos con transformers: al ocupar unos 3,21 GiB y ser compatible con endpoints, puede servirse como modelo de generación de texto de 4B en infraestructura modesta con GPU CUDA, siempre que se respete la recarga sin recuantización.
- Auditoría de serialización y procedencia: los ficheros `verification.json` y `export_manifest.json` permiten comprobar hashes de ficheros, ajustes y alcance exacto de la release, útil para trazabilidad en entornos de investigación.

## Benchmarks y rendimiento

El autor publica un screen de 384 ítems con resultados emparejados entre la base NF4 guardada y un control BF16 en Transformers. La generación es greedy, en modo no-thinking, semilla 42, batch 8, con presupuestos de 512/1024 tokens para GSM8K/IFEval y batch 16 para la verosimilitud de MMLU.

| Representacion | MMLU general /128 | MMLU fisica /96 | GSM8K /128 | IFEval /32 |
|---|---:|---:|---:|---:|
| Base NF4 guardada | 85 | 63 | 117 | 24 |
| Base BF16 Transformers | 92 | 63 | 119 | 24 |

El autor advierte que los subconjuntos son pequeños, que los efectos de runtime y la sensibilidad del detector de idioma de IFEval limitan la interpretación, y que las pruebas emparejadas son exploratorias y sin ajuste por comparaciones múltiples. No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el checkpoint pesa unos 3,21 GiB con módulos no cuantizados en FP32; la carga verificada usa `device_map={"": 0}` en una sola GPU.
- GPU verificada por el autor: RTX A6000 (48 GB), con PyTorch 2.6.0+cu124, Transformers 4.57.6, bitsandbytes 0.49.2 y PEFT 0.18.1.
- GPU recomendadas: cualquier GPU CUDA compatible con bitsandbytes; el autor exige una GPU CUDA compatible para la receta verificada. No se documentan pruebas en A100, H100 ni RTX 4090.
- GPU de consumo: no confirmado en la información proporcionada; el tamaño del checkpoint sugiere que podría caber en tarjetas de 8-12 GB, pero no hay verificación publicada.
- Opciones de despliegue: transformers con la configuración de cuantización almacenada (sin recuantizar); el autor menciona una representación GGUF Q4_K_M separada para llama.cpp, distinta de este repositorio. No se documentan vLLM, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| RenormalizationTech/Qwen3-4B-tuneLLM-NF4 | 4.022.468.096 | No disponible | NF4 4 bits (bitsandbytes) | Apache 2.0 | Checkpoint de reproducibilidad, 5 descargas, sin adaptadores |
| Qwen/Qwen3-4B (base) | 4B (aproximado) | No disponible en esta ficha | BF16 original | Apache 2.0 | Modelo de referencia del que deriva; control BF16 del screen |
| Representación GGUF Q4_K_M del mismo autor | No disponible | No disponible | Q4_K_M (llama.cpp) | Apache 2.0 | Mencionada por el autor como distinta de esta NF4; sin enlace en la información disponible |

No se dispone de datos de benchmarks de terceros ni de otras alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo entrenado: es una base cuantizada sin adaptadores ni ajuste; no debe esperarse un comportamiento superior al Qwen3-4B original.
- La cuantización NF4 guardada rinde por debajo del control BF16 en MMLU general (85 frente a 92 sobre 128 ítems) en el screen del autor, aunque los subconjuntos son pequeños y las pruebas exploratorias.
- El autor advierte que las comprobaciones de serialización no constituyen afirmaciones amplias de capacidades.
- Es obligatorio cargar la configuración de cuantización almacenada y no aplicar una segunda cuantización; hacerlo invalida la receta verificada.
- El detector de idioma de IFEval es sensible al estado aleatorio del runtime, lo que limita la interpretación de esa métrica.
- Sesgos conocidos, riesgo de alucinación y limitaciones idiomáticas del modelo base no se detallan en la información proporcionada.
- La licencia Apache 2.0 permite uso comercial, pero se heredan las condiciones del modelo base Qwen3-4B; conviene revisar la licencia original incluida en el repositorio.
- El repositorio se publicó inicialmente en privado; las tarjetas históricas, recibos y manifiestos conservan ese estado como registro y no describen la visibilidad actual.
- La información de idiomas no está disponible y el contexto no se confirma en esta ficha.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/RenormalizationTech/Qwen3-4B-tuneLLM-NF4
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Commit del modelo base referenciado: `1cfa9a7208912126459214e8b04321603b3df60c`
- Revisión del repositorio usada en la carga verificada: `e9af208e44e083b77702a71d8aa65b7d97f78ce6`
- Ficheros de verificación citados en la model card: `verification.json`, `export_manifest.json`, `benchmark_summary.json` (incluidos en el repositorio)

# Maximilian228/Qwen3.8-Flash-Next-NVFP4-GPTQ-Strata

## Resumen

Qwen3.8-Flash-Next-NVFP4-GPTQ-Strata es una cuantización en NVFP4 (formato de coma flotante de 4 bits de NVIDIA) del modelo Qwen3.8-Flash-Next de Qwen, realizada mediante GPTQ sobre el checkpoint original en BF16 y empaquetada para el motor de inferencia Strata NVFP4. El autor de la conversión es Maximilian228, no el equipo de Qwen. El objetivo declarado es ejecutar un modelo MoE híbrido de 125B parámetros en una única GPU de consumo con 12 GB o más de VRAM, apoyándose en la RAM del sistema para alojar los expertos.

El modelo base es un transformer MoE con atención híbrida (los tags incluyen "mtp", multi-token prediction) y 51.200.245.760 parámetros totales según el recuento de safetensors del repositorio, aunque la model card se refiere a él como "el MoE híbrido de 125B". Esta discrepancia entre la cifra de safetensors y la cifra nominal de la model card debe tenerse en cuenta al planificar el despliegue. El contexto máximo no se especifica en la información disponible.

La relevancia práctica de esta ficha es que documenta un punto de equilibrio concreto entre precisión y velocidad: según las mediciones del autor, esta cuantización NVFP4 GPTQ conserva el 93,6 % de coincidencia de token top-1 respecto al modelo Q8_0 de referencia, decodifica a 177 tokens/s y procesa un prompt de 32K en 3,9 s, con 69 GiB de RAM en uso. Es una opción orientada a estaciones de trabajo con 96 GB de RAM y GPU consumer de gama alta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE híbrido (según tags: moe, mtp; atención híbrida no detallada) |
| Parametros totales | 51.200.245.760 (safetensors); la model card menciona "125B" nominalmente |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (las pruebas del autor usan prompts de hasta 32.007 tokens) |
| Tipos de cuantizacion | NVFP4 (expertos enrutados) + GPTQ; componentes auxiliares en otras precisiones (router BF16, PLE FP8 en la referencia Q8_0) |
| Idiomas soportados | en, zh (según la model card) |
| Licencia | qwen-community-1.0 (license: other) |
| Formato de pesos | safetensors empaquetados para Strata NVFP4 (librería `strata`) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un MoE híbrido con mecanismo de multi-token prediction (MTP), según los tags del repositorio. La model card no detalla la composición del dataset de entrenamiento, el número de tokens vistos ni si hubo fases de RLHF o DPO; esa información no está disponible en el material proporcionado. Lo que sí se documenta es el proceso de cuantización: todos los expertos enrutados se convierten a NVFP4 mediante GPTQ partiendo del checkpoint BF16, mientras que el router conserva la precisión BF16 original de Qwen y el componente PLE se mantiene en FP8.

La innovación técnica destacable no está en el entrenamiento sino en el empaquetado y el motor: Strata NVFP4 permite mantener los expertos en RAM del sistema y ejecutar la decodificación en la GPU, con un modo de baja RAM que lee expertos desde el almacenamiento cuando no caben. El autor reporta que la cuantización GPTQ a NVFP4 obtiene una divergencia KL de 0,038 respecto al modelo Q8_0, idéntica a la de la conversión NVFP4 de NVIDIA, y ligeramente mejor que la del modelo FP4-Local de NVIDIA reentrenado con destilación consciente de cuantización (KL 0,051). También se menciona un "route tail skip" en los modelos GGUF que acelera la decodificación un 10 % a costa de alejarse algo más de la referencia.

## Capacidades

- Generación de texto en inglés y chino, con soporte de conversaciones multi-turno.
- Razonamiento y generación de código: el conjunto de evaluación del autor incluye tokens de código, documentación, chats en inglés y ucraniano, y transcripciones de agentes.
- Soporte de agentes y transcripciones de agentes, según la composición del benchmark de precisión del autor.
- Multi-token prediction (MTP) heredado del modelo base, según los tags.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponible.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Despliegue de un MoE grande en una sola GPU consumer: con 12 GB o más de VRAM y 64 GB o más de RAM, el modelo se ejecuta en modo de baja RAM a unos 115 tokens/s de decodificación y ~9 s para un prompt de 32K, lo que permite montar un asistente local sin clúster.
- Estación de trabajo de 96 GB de RAM con RTX 5090: en la configuración medida por el autor (177 tokens/s, 3,9 s para 32K, 69 GiB en uso) es adecuado para asistentes de código interactivos donde la latencia de primer token y la velocidad de decodificación importan.
- Procesamiento de documentos largos: la ventana efectiva probada de 32K tokens permite resumir o extraer información de contratos, informes técnicos o documentación extensa en una sola pasada.
- Generación y revisión de código en pipelines de CI/CD: el modelo se entrenó y evaluó con datos de código, y su velocidad de decodificación permite integrarlo en tareas de autocompletado o revisión automatizada de parches.
- Transcripción y análisis de conversaciones de agentes: el benchmark del autor incluye transcripciones de agentes, lo que sugiere uso en evaluación y depuración de trazas de agentes autónomos.
- Atención al cliente bilingüe inglés-chino: los dos idiomas declarados cubren mercados donde esa combinación es habitual, con conversaciones multi-turno de hasta 1.500 tokens por respuesta en las pruebas del autor.
- Prototipado e investigación sobre cuantización: al publicarse junto a alternativas Q8_0, mix NVFP4/Q8_0, GGUF de Unsloth e ISTA-DASLab, sirve como banco de pruebas para comparar precisión y velocidad de esquemas de cuantización de 4 bits.

## Benchmarks y rendimiento

Los datos disponibles no son benchmarks de tareas (MMLU, HumanEval, GSM8K) sino métricas de fidelidad de cuantización y velocidad medidas por el autor. Se reproducen tal cual:

| Modelo | Coincidencia top-1 con Q8_0 | Decodificación (tok/s) | Prompt 32K | RAM en uso | Equipo |
|---|---:|---:|---:|---:|---|
| Q8_0 (referencia) | 100 % | 47 | 10,3 s | 106 GiB | 128 GB |
| NVFP4 + Q8_0 mix | 95,0 % | 91 | 4,2 s | 105 GiB | 128 GB |
| Unsloth UD-Q4_K_XL | 94,1 % | 169 | 4,9 s | 77 GiB | 96 GB |
| **Este modelo (NVFP4 GPTQ)** | **93,6 %** | **177** | **3,9 s** | **69 GiB** | **96 GB** |
| NVIDIA NVFP4 (convertido) | 92,9 % | 167 | 3,9 s | 69 GiB | 96 GB |
| NVIDIA FP4-Local (QAD) | 92,2 % | 191 | 3,7 s | 69 GiB | 96 GB |
| Unsloth UD-Q3_K_XL | 90,7 % | 208 | 3,8 s | 58 GiB | 96 GB |
| ISTA-DASLab IQ3_S | 90,0 % | 228 | 3,9 s | 52 GiB | 64 GB |
| ISTA-DASLab IQ3_XXS | 87,3 % | 239 | 3,9 s | 45 GiB | 64 GB |
| ISTA-DASLab IQ2_XS | 85,0 % | 265 | 4,2 s | 38 GiB | 48 GB |
| ISTA-DASLab Q2_0 | 84,1 % | 256 | 3,9 s | 37 GiB | 48 GB |

Condiciones de medición declaradas por el autor: 5.153 tokens de código, documentación, chats en inglés y ucraniano y transcripciones de agentes; todos los modelos con expertos en CPU y route tail skip desactivado; hardware RTX 5090 (32 GB), Ryzen 9 9950X3D, 128 GB DDR5-5600, Windows 11; mediana de 3 ejecuciones con 4 chats greedy de hasta 1.500 tokens y un prompt de 32.007 tokens. La divergencia KL de este modelo respecto a Q8_0 es 0,038. No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM: 12 GB o más según la model card; la GPU del banco de pruebas es una RTX 5090 de 32 GB, aunque el motor mantiene los expertos en RAM del sistema.
- RAM: 96 GB para la velocidad reportada (69 GiB en uso más margen para el sistema operativo); 64 GB en modo de baja RAM con ~115 tokens/s de decodificación y ~9 s para un prompt de 32K; mínimo declarado de 48 GB para los ficheros de 2 bits de ISTA y 60-64 GB para los de 3 bits.
- GPU recomendadas: RTX 5090 (configuración medida). El autor menciona compatibilidad con tarjetas RTX de las series 20 a 50; no se detallan modelos concretos adicionales.
- Cabe en GPU consumer: sí, con 12 GB o más de VRAM, delegando expertos a RAM.
- Opciones de despliegue: motor Strata NVFP4 (versión 0.1.42-nvfp4.1/0.2.0-beta-nvfp4.3 en las pruebas). Para las alternativas GGUF se usan llama.cpp/Unsloth; vLLM, Ollama y TGI no se mencionan para este formato.
- Latencia y throughput: 177 tokens/s de decodificación y 3,9 s para un prompt de 32K en la configuración de 96 GB; ~115 tokens/s y ~9 s en modo de 64 GB.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Coincidencia top-1 | Decodificación | RAM | Licencia |
|---|---|---:|---:|---:|---:|---|
| Este modelo (NVFP4 GPTQ) | 51,2B (safetensors) | NVFP4 + GPTQ / Strata | 93,6 % | 177 tok/s | 69 GiB | qwen-community-1.0 |
| NVIDIA NVFP4 convertido | mismo base | NVFP4 / Strata | 92,9 % | 167 tok/s | 69 GiB | qwen-community-1.0 |
| NVIDIA FP4-Local (QAD) | mismo base, reentrenado | FP4 / Strata | 92,2 % | 191 tok/s | 69 GiB | no disponible |
| Unsloth UD-Q4_K_XL | mismo base | GGUF | 94,1 % | 169 tok/s | 77 GiB | no disponible |
| ISTA-DASLab IQ3_XXS | mismo base | GGUF | 87,3 % | 239 tok/s | 45 GiB | no disponible |

Todas las alternativas son cuantizaciones del mismo Qwen3.8-Flash-Next, por lo que la comparación es de esquemas de compresión y no de modelos distintos. Este modelo ocupa el cuarto puesto en fidelidad y el segundo en velocidad entre los de su rango de RAM. No se dispone de comparación con modelos de otros fabricantes de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- Sesgos: no documentados en la información disponible; al ser una cuantización del modelo base, hereda los sesgos de Qwen3.8-Flash-Next, que tampoco se detallan.
- Alucinación: no se han publicado evaluaciones de tasa de alucinación. La pérdida de fidelidad del 6,4 % respecto a Q8_0 implica que la distribución de salida se desvía de la del modelo original, lo que puede amplificar errores en tareas sensibles.
- Idiomas: solo inglés y chino declarados. El benchmark del autor incluye textos en ucraniano, pero no se garantiza calidad en ese idioma ni en castellano.
- Contexto: la longitud máxima no está especificada; las pruebas se limitan a 32K tokens.
- Licencia: qwen-community-1.0, marcada como "other". Es necesario revisar el fichero LICENSE del repositorio antes de cualquier uso comercial; no se detallan aquí sus términos.
- Dependencia de herramienta: requiere el motor Strata NVFP4, que no es un runtime estándar (no vLLM, no llama.cpp). La versión del motor afecta a los resultados: el autor reporta 93,65 % en la versión 0.2.0-beta-nvfp4.3 frente al 93,6 % de la 0.1.42.
- Discrepancia de parámetros: el recuento de safetensors (51,2B) no coincide con la cifra nominal de 125B de la model card; conviene verificar la configuración real de expertos antes de dimensionar hardware.
- Modo de baja RAM: en equipos de 64 GB la velocidad cae a ~115 tokens/s y el prompt de 32K tarda ~9 s, lo que puede ser insuficiente para aplicaciones interactivas exigentes.
- Route tail skip: los GGUF alternativos lo activan por defecto y se alejan más de la referencia; este modelo no lo usa en las mediciones, pero es un parámetro a vigilar si se cambia de motor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Maximilian228/Qwen3.8-Flash-Next-NVFP4-GPTQ-Strata
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Motor Strata NVFP4: https://github.com/sergqwer/strata-nvfp4
- Variante Q8_0 del mismo autor: https://huggingface.co/Maximilian228/Qwen3.8-Flash-Next-Q8_0-Strata
- Variante mixta NVFP4 + Q8_0: https://huggingface.co/Maximilian228/Qwen3.8-Flash-Next-NVFP4-Q8-Mix-Strata
- Conversión NVFP4 de NVIDIA (vía Maximilian228): https://huggingface.co/Maximilian228/Qwen3.8-Flash-Next-NVIDIA-NVFP4-Strata
- Modelo FP4-Local de NVIDIA: https://huggingface.co/nvidia/Qwen3.8-Flash-Next-FP4-Local
- GGUF de Unsloth: https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- GGUF de ISTA-DASLab: https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF

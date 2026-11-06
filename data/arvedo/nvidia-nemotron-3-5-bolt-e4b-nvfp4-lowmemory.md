# arvedo/NVIDIA-Nemotron-3.5-Bolt-E4B-NVFP4-LowMemory

## Resumen

NVIDIA-Nemotron-3.5-Bolt-E4B-NVFP4-LowMemory es una cuantizacion comunitaria del modelo Nemotron-3.5-Bolt-E4B de NVIDIA, publicada por el usuario arvedo en Hugging Face. Se trata de una version comprimida en formato NVFP4 (FP4 E2M1 de NVIDIA Blackwell) disenada especificamente para ejecutarse en GPUs de consumo con 6 GB y 8 GB de VRAM, como la RTX 4060, RTX 3060, RTX 5060 o RTX 5070, ademas de configuraciones de memoria unificada en Apple Silicon. El checkpoint completo ocupa 4,79 GiB en un unico archivo safetensors, lo que supone una reduccion superior al 45 % respecto a BF16 (8,8 GB) y del 20 % frente a una cuantizacion NVFP4 estandar con embeddings sin cuantizar (6,0 GB).

El modelo base emplea una arquitectura de tipo transformer con 42 capas y un mecanismo de Per-Layer Embeddings (PLE) con vocabulario de 262.144 tokens y dimension de 1.280. La cuantizacion afecta tanto al cuerpo transformer como a las matrices de proyeccion de embeddings, mientras que los proyectores multimodales (vision SigLIP y audio) se mantienen en MXFP8 (E4M3) para preservar su precision. El autor reporta 8.667.245.130 parametros totales en el archivo safetensors y una ventana de contexto operativa de 32.768 tokens configurada en el ejemplo de despliegue con vLLM.

La relevancia de esta publicacion radica en que permite ejecutar un modelo de casi 8.700 millones de parametros con capacidades multimodales en hardware de gama media-baja, algo que con pesos BF16 requeriria al menos 16-24 GB de VRAM. La licencia Apache 2.0 facilita su uso comercial, aunque el modelo solo declara soporte para ingles y la model card contiene errores evidentes en la tabla de benchmarks que conviene tratar con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con Per-Layer Embeddings (PLE) y proyectores multimodales; etiquetado como "gemma4" en los tags |
| Parametros totales | 8.667.245.130 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (configurado en el ejemplo de vLLM; no se especifica el maximo del modelo base) |
| Tipos de cuantizacion | NVFP4 (FP4 E2M1) para cuerpo y embeddings; MXFP8 (E4M3) para proyectores de vision y audio |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (unico archivo, 4,79 GiB) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 42 capas con atencion multi-cabeza estandar (proyecciones Q, K, V, O) y capas feed-forward con proyecciones Gate, Up y Down. Incorpora un esquema de Per-Layer Embeddings (PLE) con una matriz de 262.144 x 5.376 y una proyeccion asociada de 10.752 x 1.280, ademas de un token identity embedding y un LM head de 262.144 x 1.280. La presencia de un vocabulario de 262.144 tokens sugiere un tokenizador de gran cobertura, probablemente multilingue en origen, aunque la model card solo declara ingles como idioma soportado. Tambien incluye componentes multimodales: un codificador de vision SigLIP y un codificador de audio, ambos mantenidos en MXFP8.

No se dispone de informacion sobre el proceso de entrenamiento del modelo base: numero de tokens, composicion del dataset, uso de RLHF o DPO, ni innovaciones como decodificacion especulativa durante el preentrenamiento. La model card del autor de la cuantizacion menciona "speculative decoding" como tecnica empleada en la inferencia con vLLM para alcanzar el throughput reportado, y describe un metodo de calibracion denominado "Golden Ratio Layer Scaling" para restaurar precision matematica tras la cuantizacion a FP4. No se detalla la metodologia de calibracion ni el dataset empleado para ella.

## Capacidades

- Generacion de texto conversacional en ingles con soporte de plantillas de chat (pipeline text-generation y tag conversational).
- Razonamiento matematico multi-paso, segun los resultados reportados en GSM8K y MATH-500.
- Sintesis de codigo Python, con resultados reportados en HumanEval y MBPP.
- Procesamiento multimodal de vision mediante codificador SigLIP (segun la tabla de componentes del checkpoint).
- Procesamiento de audio mediante codificador dedicado (segun la tabla de componentes del checkpoint).
- Inferencia acelerada con decodificacion especulativa en vLLM, con throughput reportado de 2087+ tok/s.
- No se documenta soporte explicito de tool calling, function calling ni flujos de agentes multi-paso en la informacion disponible.
- No se documenta modo thinking ni capacidades de razonamiento extendido.

## Casos de uso

- Despliegue en estaciones de trabajo con GPU de 6-8 GB: el checkpoint de 4,79 GiB permite servir el modelo en una RTX 4060 o RTX 3060 con margen para cache KV, habilitando asistentes locales sin depender de la nube.
- Prototipado rapido de aplicaciones conversacionales: con vLLM y la API compatible con OpenAI, se puede levantar un endpoint local en minutos y validar prompts, temperaturas y flujos de chat antes de migrar a hardware mayor.
- Generacion asistida de codigo en entornos con recursos limitados: los resultados reportados en HumanEval y MBPP sugieren utilidad para autocompletado y generacion de funciones Python en IDE o scripts de automatizacion locales.
- Tutoria y resolucion de problemas matematicos: los resultados en GSM8K y MATH-500 indican capacidad para problemas aritmeticos multi-paso y de competicion, adecuada para herramientas educativas offline.
- Procesamiento de documentos con componente visual: el codificador SigLIP permitiria, en principio, tareas de comprension de imagenes, aunque la model card no detalla la interfaz de uso multimodal.
- Investigacion sobre cuantizacion FP4: el checkpoint sirve como referencia practica para estudiar el impacto de NVFP4 con escalado por capas en calidad y latencia sobre hardware Blackwell y Ada.
- Evaluacion comparativa de tecnicas de compresion: util para reproducir la comparativa BF16 vs NVFP4 estandar vs NVFP4 LowMemory en tareas de codigo y matematicas.

## Benchmarks y rendimiento

Los datos de la model card presentan errores de formato evidentes: los valores de la columna "Low Memory NVFP4" aparecen duplicados con el porcentaje concatenado (por ejemplo, "9014.40%" en lugar de "90.14%"), y la columna "Core Suite Composite" muestra "8178.42%". Se reproducen a continuacion interpretando el primer bloque como el valor porcentual y el segundo como el recuento de aciertos indicado en las notas.

| Benchmark | Items | NVFP4 LowMemory (4,79 GiB) | NVFP4 estandar (6,0 GB) | BF16 base (8,8 GB) |
|---|---|---|---|---|
| GSM8K | 1.319 | 90,14 % (1.189/1.319) | 90,75 % | 91,05 % |
| MATH-500 | 500 | 66,80 % | 65,60 % | 65,20 % |
| HumanEval | 164 | 79,26 % (130/164) | 78,66 % | 81,71 % |
| MBPP | 427 | 74,47 % (318/427) | 75,18 % | 77,28 % |
| Composite | 2.410 | 81,78 % (1.971/2.410) | no disponible | no disponible |

El autor indica que la evaluacion se realizo en vLLM con decodificacion greedy zero-shot. Los resultados deben tomarse con cautela: no se especifica la version de vLLM, la configuracion de decodificacion especulativa, ni si el modelo base es realmente Nemotron-3.5-Bolt-E4B de NVIDIA o una variante no publicada. La discrepancia entre el tag "gemma4" y el nombre "Nemotron" no se aclara en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: 4,79 GiB para los pesos; con cache KV para 32.768 tokens y overhead de vLLM, se recomienda al menos 6 GB y preferiblemente 8 GB para margen operativo.
- GPU compatibles con NVFP4: Blackwell (SM_120, RTX 50xx, B200) y arquitecturas Ada/Hopper segun el autor; el soporte nativo de FP4 E2M1 requiere Blackwell, mientras que en Ada/Hopper se aplicaria emulacion o conversion.
- GPU de consumo: RTX 4060, RTX 3060 (8 GB y 12 GB), RTX 5060, RTX 5070; el autor menciona explicitamente 6 GB y 8 GB de VRAM.
- Apple Silicon con memoria unificada: soportado segun el autor, aunque no se detalla el backend (MLX, llama.cpp u otro).
- Opciones de despliegue: vLLM con `--trust-remote-code` y `--max-model-len 32768`; no se documenta soporte en llama.cpp, Ollama, TGI ni TensorRT-LLM.
- Throughput reportado: 2087+ tok/s con decodificacion especulativa en vLLM; no se especifica la GPU empleada ni el tamano de lote.
- Latencia: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| NVIDIA-Nemotron-3.5-Bolt-E4B-NVFP4-LowMemory (este) | 8,67 B | 32.768 (config.) | Apache 2.0 | safetensors NVFP4 | 4,79 GiB, orientado a 6-8 GB VRAM |
| Nemotron-3.5-Bolt-E4B (BF16, base) | 8,67 B (inferido) | no disponible | no disponible | safetensors BF16 | 8,8 GB, requiere ~16 GB VRAM |
| NVFP4 estandar de Nemotron-3.5-Bolt-E4B | 8,67 B (inferido) | no disponible | no disponible | safetensors NVFP4 | 6,0 GB, embeddings sin cuantizar |
| Gemma 3 4B (referencia de tamano similar) | 4 B | 128 K | Gemma license | safetensors, GGUF | No comparable directamente por tamano y licencia |

No se dispone de informacion sobre otros modelos de la familia Nemotron-3.5 ni sobre alternativas cuantizadas a FP4 con las que comparar rendimiento de forma directa. La comparativa con Gemma 3 4B se incluye solo como referencia de tamano y no implica equivalencia de capacidades.

## Limitaciones y advertencias

- La model card contiene errores de formato en los benchmarks que dificultan la verificacion de los resultados; los valores deben considerarse no auditados.
- No se especifica la GPU utilizada para medir el throughput de 2087+ tok/s, por lo que la cifra no es reproducible sin mas contexto.
- El modelo solo declara soporte de ingles; el rendimiento en castellano u otros idiomas es desconocido.
- La cuantizacion a FP4 puede degradar tareas distintas de las evaluadas (matematicas y codigo); no hay evaluaciones de sentido comun, seguridad, sesgos ni robustez.
- El tag "gemma4" en los metadatos contradice el nombre "Nemotron"; la procedencia exacta del modelo base no esta verificada en la informacion disponible.
- El soporte nativo de NVFP4 requiere hardware Blackwell; en GPUs Ada/Hopper o Apple Silicon el rendimiento y la compatibilidad pueden diferir sustancialmente.
- Requiere `--trust-remote-code` en vLLM, lo que implica ejecutar codigo del repositorio; conviene auditar los archivos antes de desplegar en produccion.
- Riesgo de alucinacion no cuantificado; no se han publicado evaluaciones de fidelidad factual.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base original podria tener condiciones adicionales no reflejadas en esta cuantizacion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/arvedo/NVIDIA-Nemotron-3.5-Bolt-E4B-NVFP4-LowMemory
- No se han encontrado en la informacion proporcionada enlaces adicionales a papers, blogs, repositorios o demos del modelo base o de la cuantizacion.

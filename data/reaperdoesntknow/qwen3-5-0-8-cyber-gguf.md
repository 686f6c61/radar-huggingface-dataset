# reaperdoesntknow/Qwen3.5-0.8-Cyber-GGUF

## Resumen

Qwen3.5-0.8-Cyber-GGUF es una distribucion en formato GGUF del modelo Qwen/Qwen3.5-0.8B, publicada por el usuario reaperdoesntknow dentro de su coleccion "CIx cybersecurity models". No se trata de un modelo entrenado desde cero, sino de una conversion y cuantizacion del modelo base de Qwen en una escalera de niveles de compresion (BF16, Q8_0, Q6_K, Q4_K_M, Q2_K_L) pensada para inferencia local en llama.cpp y Ollama. El repositorio ocupa 4,4 GB e incluye tambien un artefacto `mmproj` BF16 de 207 MB asociado a componentes de vision.

La relevancia practica del repositorio es la de ofrecer una via sencilla para ejecutar un modelo de menos de mil millones de parametros en hardware muy limitado (CPU, portatiles, dispositivos edge) con distintas relaciones tamano/calidad. El modelo base tiene 752.393.024 parametros segun los datos de safetensors, lo que lo situa en la categoria de modelos ultraligeros para prototipado, comparacion de cuantizaciones y experimentacion local.

Conviene subrayar que la etiqueta "Cyber" del nombre no esta respaldada por documentacion publica: la propia model card indica que no se documenta el dataset de fine-tuning ni se publican resultados de evaluacion, por lo que debe interpretarse como nombre de variante del repositorio y no como una afirmacion verificada de capacidades en ciberseguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen/Qwen3.5-0.8B; el repositorio no detalla la arquitectura interna) |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q4_K_M, Q2_K_L (mas un `mmproj` BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors como origen del modelo base) |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna del modelo base mas alla de su identificacion como Qwen3.5-0.8B. Al tratarse de una conversion a GGUF mediante herramientas de Unsloth y llama.cpp, no hay informacion publica en esta ficha sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF, DPO u otras fases de alineamiento. Tampoco se detalla ninguna innovacion tecnica especifica (atencion lineal, decodificacion especulativa, etc.).

Lo unico verificable respecto al proceso es la cadena de herramientas de conversion (Unsloth / llama.cpp) y la existencia de una escalera de cuantizaciones que va desde BF16 (1,52 GB) hasta Q2_K_L (484 MB). La presencia de un archivo `mmproj` BF16 y de componentes de vision en la configuracion indica que el modelo base incorpora una ruta multimodal, pero la model card advierte explicitamente que la ruta extremo a extremo no ha sido validada en esta release.

## Capacidades

- Generacion de texto conversacional (pipeline declarado: text-generation).
- Ruta multimodal potencial via `mmproj` BF16, sin validacion documentada extremo a extremo.
- Ejecucion local en llama.cpp y Ollama mediante archivos GGUF.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Soporte de plantillas de chat via `--jinja` en llama.cpp.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (idiomas no declarados).
- Thinking mode, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Prototipado en CPU y equipos con poca memoria: con Q4_K_M (529 MB) o Q2_K_L (484 MB) el modelo puede ejecutarse en portatiles sin GPU dedicada usando llama.cpp u Ollama, lo que permite iterar sobre prompts e integraciones sin infraestructura cloud.
- Comparacion reproducible de cuantizaciones: la escalera BF16, Q8_0, Q6_K, Q4_K_M y Q2_K_L permite medir la degradacion de calidad frente al coste de memoria en un mismo modelo y mismo prompt, util para decidir el nivel adecuado en un despliegue.
- Experimentacion en entornos edge y embebidos: el tamano reducido de las variantes Q4_K_M y Q2_K_L (por debajo de 550 MB) facilita su inclusion en imagenes de contenedor o dispositivos con almacenamiento limitado.
- Pruebas de integracion con llama.cpp y Ollama: sirve como banco de pruebas para validar pipelines de inferencia local, plantillas Jinja y compatibilidad con endpoints antes de escalar a modelos mayores.
- Filtrado y clasificacion de texto a pequena escala: para tareas simples de etiquetado o resumen en local donde no se requiere maxima precision y se prioriza coste cero de inferencia.
- Evaluacion de la ruta multimodal: el `mmproj` incluido permite verificar localmente si la entrada de imagen funciona en esta release, como paso previo a decidir si se usa en un prototipo visual.
- Educacion y demostraciones: util para explicar cuantizacion, formatos GGUF y despliegue local en talleres o cursos sin requerir GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no hay resultados de evaluacion ni baselines de comparacion en el repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,6-1,8 GB para BF16; en torno a 0,9-1,0 GB para Q8_0; cerca de 0,7-0,8 GB para Q6_K; alrededor de 0,6-0,7 GB para Q4_K_M; y en torno a 0,55-0,65 GB para Q2_K_L (estimaciones a partir del tamano de archivo; no publicadas por el autor).
- GPU recomendadas: cualquier GPU consumer con 2 GB o mas de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 4060) es suficiente para las variantes cuantizadas; A100 y H100 no son necesarias para este tamano.
- Cabe en GPU consumer: si, en practicamente todas las GPU consumer modernas, e incluso en iGPU con memoria compartida suficiente.
- Opciones de despliegue: llama.cpp (`llama-cli -hf ...`), Ollama (`ollama run hf.co/...`), y cualquier runtime compatible con GGUF; vLLM y TGI no estan documentados para este repositorio.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| reaperdoesntknow/Qwen3.5-0.8-Cyber-GGUF | 752.393.024 | no disponible | GGUF | Apache-2.0 | Cuantizaciones multiples; sin benchmarks publicados |
| Qwen/Qwen3.5-0.8B (modelo base) | 752.393.024 | no disponible | safetensors | Apache-2.0 | Referencia de maxima fidelidad; sin datos de evaluacion en esta ficha |
| Otros modelos ultraligeros de la misma categoria | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada |

## Limitaciones y advertencias

- La etiqueta "Cyber" no esta respaldada por documentacion: no se publica dataset de fine-tuning ni evaluacion, por lo que no debe asumirse ninguna capacidad especifica en ciberseguridad.
- No hay benchmarks publicados; el rendimiento real frente a otros modelos de tamano similar es desconocido.
- La cuantizacion reduce el uso de memoria pero puede alterar la calidad de las salidas; Q2_K_L es la variante con mayor perdida esperada.
- La ruta multimodal no ha sido validada extremo a extremo segun la propia model card; debe comprobarse localmente antes de depender de ella.
- Riesgo de alucinacion, sesgos y salidas incorrectas, incompletas o inseguras, inherente a un modelo de este tamano.
- No debe usarse como fuente autoritativa para decisiones de seguridad, legales, medicas u operativas (advertencia explicita del autor).
- Idiomas soportados no declarados; el comportamiento multilingue no esta garantizado.
- Longitud de contexto no documentada, lo que limita la planificacion de casos de uso con ventanas largas.
- Licencia Apache-2.0 permite uso comercial, pero al derivar de un modelo base conviene revisar tambien las condiciones del modelo original Qwen/Qwen3.5-0.8B.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/reaperdoesntknow/Qwen3.5-0.8-Cyber-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Coleccion CIx cybersecurity models: https://huggingface.co/collections/reaperdoesntknow/cix-cybersecurity-models
- llama.cpp (runtime de inferencia): https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
- Unsloth: https://github.com/unslothai/unsloth

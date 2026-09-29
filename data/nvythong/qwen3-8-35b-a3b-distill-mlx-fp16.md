# nvythong/Qwen3.8-35B-A3B-Distill-mlx-fp16

## Resumen

`nvythong/Qwen3.8-35B-A3B-Distill-mlx-fp16` es una conversion al formato MLX del modelo `empero-ai/Qwen3.8-35B-A3B-Distill`, realizada por el usuario nvythong con la libreria `mlx-lm` en su version 0.31.2. El modelo base pertenece a la familia Qwen3.8 y se distribuye como un Mixture of Experts (MoE) con aproximadamente 34.660 millones de parametros totales y unos 3.000 millones de parametros activos por token (de ahi el sufijo A3B). La variante aqui documentada conserva los pesos en fp16 y esta pensada para ejecucion sobre Apple Silicon mediante el framework MLX.

El origen del modelo es una destilacion (distillation) con ajuste fino supervisado (SFT) sobre la serie Qwen3.8, orientada a mejorar razonamiento y llamada a funciones (function calling) manteniendo un coste de inferencia bajo gracias a que solo se activa una fraccion de los expertos en cada paso. La model card del repositorio indica que la conversion respeta el pipeline de `text-generation` y declara el ingles como unico idioma soportado explicitamente, aunque los tags incluyen `image-text-to-text`, lo que sugiere capacidad multimodal heredada del modelo base.

La relevancia de esta ficha radica en que permite ejecutar un MoE de ~35B en hardware de consumo con memoria unificada de Apple, un perfil de despliegue que interesa a desarrolladores que quieren inferencia local con soporte de tool calling sin depender de GPUs dedicadas. El repositorio es de publicacion reciente (29 de septiembre de 2026) y no registra descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (tag `qwen3_5_moe`), derivado de la serie Qwen3.8 |
| Parametros totales | 34.660.608.768 (~34,66 B, dato real de safetensors) |
| Parametros activos | ~3 B (sufijo A3B), no confirmado en model card |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16 en este repositorio (MLX); existen variantes GGUF y 8-bit en terceros |
| Idiomas soportados | ingles (en), segun la model card |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors y formato MLX (carga con `mlx-lm` 0.31.2) |

## Arquitectura y entrenamiento

El modelo es un transformer con capa de Mixture of Experts. El tag `qwen3_5_moe` y la nomenclatura A3B apuntan a una arquitectura en la que un router selecciona un subconjunto de expertos por token, activando del orden de 3.000 millones de parametros sobre un total de 34,66 B. Esta relacion entre parametros totales y activos es lo que permite ejecutar un modelo de gran tamano con un coste computacional por token comparable al de un modelo denso mucho menor. No se detalla en la informacion disponible el numero de expertos, el top-k del router ni el mecanismo de atencion exacto.

Respecto al entrenamiento, la model card y los tags indican un proceso de destilacion sobre la familia Qwen3.8 seguido de ajuste fino supervisado (SFT) y orientado a razonamiento y function calling. No se especifican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO. La conversion a MLX no modifica los pesos mas alla del cambio de formato; se realizo con `mlx-lm` 0.31.2 y conserva precision fp16.

## Capacidades

- Generacion de texto conversacional y de proposito general, con pipeline `text-generation`.
- Razonamiento (tag `reasoning`), presumiblemente con soporte de modos de pensamiento heredados de la serie Qwen3.8.
- Llamada a funciones y uso de herramientas (tags `function-calling` y `tool-use` en variantes relacionadas).
- Aplicable a flujos de agentes y razonamiento multi-paso, segun los tags de la familia.
- Capacidad multimodal potencial: el tag `image-text-to-text` sugiere procesamiento de imagen y texto, aunque la model card no la describe explicitamente.
- Multilingue limitado: la model card declara unicamente ingles.
- Inferencia optimizada para Apple Silicon mediante MLX.

## Casos de uso

- Asistentes de codigo en local: al ejecutarse en un Mac con memoria unificada, el modelo puede integrarse en editores o CLIs de desarrollo para autocompletado, explicacion de codigo y generacion de tests sin enviar datos a servicios externos.
- Agentes con tool calling: gracias al soporte declarado de function calling, sirve como nucleo de agentes que consultan APIs, bases de datos o sistemas de ficheros en flujos multi-paso.
- Prototipado de pipelines RAG sobre Apple Silicon: un modelo MoE con ~3 B activos mantiene latencias bajas y permite iterar sobre recuperacion y generacion en un portatil o estacion Mac.
- Automatizacion de tareas de oficina en ingles: redaccion, resumen y reescritura de documentos donde la licencia Apache 2.0 facilita el uso corporativo.
- Evaluacion de destilaciones: util como referencia para comparar el efecto de la destilacion frente al modelo Qwen3.8-35B-A3B original en tareas de razonamiento.
- Despliegue en entornos con requisitos de privacidad: al poder correr de forma local, encaja en escenarios donde no se permite enviar datos a la nube.
- Backend de chat con contexto corto/medio: adecuado para conversaciones conversacionales sencillas, siempre que se valide la ventana real de contexto (no disponible en esta ficha).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni metricas comparativas, y las fuentes de busqueda consultadas no aportan cifras verificables para esta variante MLX concreta.

## Requisitos de hardware

- VRAM/memoria estimada: en fp16, los 34,66 B de parametros ocupan aproximadamente 69,3 GB (coincide con el tamano del repositorio). En 8-bit, unos 35 GB; en 4-bit, unos 17-18 GB.
- Al ser una conversion MLX, el destino natural es Apple Silicon con memoria unificada: un Mac con 96 GB o mas puede alojar la version fp16, mientras que las variantes de 8 bits encajan en equipos de 48-64 GB.
- No es un modelo pensado para GPUs de consumo tipo RTX 4090 (24 GB) en fp16; requeriria cuantizacion agresiva o variantes GGUF de menor precision.
- Opciones de despliegue: `mlx-lm` (metodo documentado en la model card), y para las variantes GGUF existentes en terceros, llama.cpp u Ollama.
- Throughput: una fuente de terceros menciona del orden de 80 tokens/s para el MoE 35B-A3B en ciertos entornos, dato no verificado de forma independiente y no atribuible a esta conversion MLX concreta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia |
|---|---|---|---|---|
| nvythong/Qwen3.8-35B-A3B-Distill-mlx-fp16 | ~34,66 B totales / ~3 B activos | no disponible | MLX fp16 | apache-2.0 |
| empero-ai/Qwen3.8-35B-A3B-Distill | ~34,66 B totales (modelo base) | no disponible | safetensors | no disponible |
| NovaeonStudio/Qwen3.8-35B-A3B-Distill-oQ8-fp16-mtp | ~34,66 B totales | no disponible | MLX 8-bit | apache-2.0 |
| Variante GGUF Qwen3.8-35B-A3B-Distill (local-ai-zone) | ~34,66 B totales | no disponible | GGUF (~73,5 GB) | no disponible |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Idiomas: la model card declara unicamente ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- No se especifica la longitud de contexto soportada, un dato critico para planificar despliegues con conversaciones largas o RAG extenso.
- Los tags `image-text-to-text` podrian indicar capacidad multimodal heredada, pero la model card no la documenta; conviene verificarla antes de asumirla.
- Riesgo de alucinacion inherente a los modelos generativos; no hay evaluaciones publicadas que cuantifiquen su tasa de error.
- El repositorio tiene 0 descargas y 0 valoraciones, por lo que carece de validacion por parte de la comunidad.
- Aunque la licencia es Apache 2.0, el modelo base es una destilacion de la serie Qwen3.8; conviene revisar los terminos del modelo original antes de un uso comercial.
- El tamano en fp16 (~69,3 GB) limita su despliegue a equipos con memoria unificada alta o a variantes cuantizadas de terceros.
- No hay informacion sobre sesgos, datos de entrenamiento ni procesos de alineacion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/nvythong/Qwen3.8-35B-A3B-Distill-mlx-fp16
- Modelo base: https://huggingface.co/empero-ai/Qwen3.8-35B-A3B-Distill
- Repositorio GitHub QwenLM/Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Variante MLX 8-bit de terceros (NovaeonStudio): https://huggingface.co/NovaeonStudio/Qwen3.8-35B-A3B-Distill-oQ8-fp16-mtp
- Variante GGUF de terceros (local-ai-zone): https://local-ai-zone.github.io/models/qwen3-8-35b-a3b-distill.html
- Analisis de terceros sobre el MoE Qwen 3.8-35B-A3B: https://ia4pymes.tech/en/blog/qwen-3-8-35b-a3b-moe-leak-modelscope-sme-efficiency-2026

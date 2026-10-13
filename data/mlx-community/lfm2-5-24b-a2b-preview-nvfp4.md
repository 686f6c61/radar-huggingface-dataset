# mlx-community/LFM2.5-24B-A2B-Preview-nvfp4

## Resumen

LFM2.5-24B-A2B-Preview-nvfp4 es una conversion a formato MLX del modelo LFM2.5-24B-A2B-Preview, publicada por la organizacion mlx-community (y replicada en nativ-community). El modelo original lo desarrolla Liquid AI, Inc. y pertenece a la familia LFM2.5, una serie de modelos hibridos disenados para despliegue en dispositivo. Se trata de un modelo de razonamiento de aproximadamente 24.000 millones de parametros totales con unos 2.000 millones de parametros activos por token, lo que lo situa en la categoria MoE (mixture of experts) de activacion dispersa.

El problema que resuelve es el de ejecutar agentes de razonamiento con calidad cercana a modelos densos de gran tamano, pero con un coste de inferencia reducido gracias a la activacion de solo 2B de parametros. La ventana de contexto declarada en la configuracion de origen es de 131.072 tokens. Esta version concreta aplica cuantizacion NVFP4 de 4 bits (weight-only, group size 16) para reducir el peso de los ficheros a 13,49 GB, pensada para ejecutarse sobre Apple Silicon mediante MLX.

Es relevante ahora porque permite ejecutar localmente, en hardware de Apple, un modelo MoE de 24B con modo de razonamiento explicito (cadena de pensamiento previa a la respuesta) y soporte de diez idiomas, algo que hasta hace poco requeria infraestructura de servidor con GPU dedicada. Esta ficha describe especificamente la exportacion MLX cuantizada, no el modelo original sin cuantizar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | lfm2_moe (transformer hibrido con mezcla de expertos, segun etiqueta del repo) |
| Parametros totales | 23.971.587.712 (~24B) |
| Parametros activos | ~2B (denominacion A2B del modelo base) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | NVFP4 4 bits (group size 16) en pesos; router en affine 8 bits (group size 64); pesos no cuantizados en BF16; sesgos de routing en FP32 |
| Idiomas soportados | en, ar, zh, fr, de, ja, ko, es, pt, it |
| Licencia | lfm1.0 (LFM Open License v1.0) |
| Formato de pesos | MLX safetensors (libreria mlx) |
| Tamano del repo | 13,5 GB (13,49 GB decimal) |
| Modelo base | lq-preview/LFM2.5-24B-A2B-Preview (revision f772950ce6f17d35af5469d00334b61a9c2fc034) |
| Desarrollador original | Liquid AI, Inc. |
| Fecha de publicacion | 2026-10-13 |

## Arquitectura y entrenamiento

La informacion disponible etiqueta el modelo como `lfm2_moe`, dentro de la familia LFM2.5 de Liquid AI, descrita por el autor como una familia de modelos hibridos orientados a despliegue en dispositivo. La version original (LFM2.5-24B-A2B) es el modelo mas grande y final de la familia, que abarca desde LFM2.5-230M hasta esta variante de 24B. La arquitectura emplea activacion dispersa de expertos: de los ~24B de parametros totales, solo unos 2B se activan por token, lo que reduce el coste de computo en inferencia.

El modelo siempre razona antes de responder: la plantilla de chat abre cada turno del asistente con una etiqueta `<think>`, de modo que las respuestas contienen una cadena de pensamiento explicita antes de la respuesta final. Este comportamiento lo diferencia del predecesor LFM2-24B-A2B. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO.

En cuanto a la exportacion aqui documentada, se realizo con la CLI de MLX-VLM sobre un Apple M3 Ultra, con cuantizacion NVFP4 de 4 bits (group size 16) en los pesos, cuantizacion affine de 8 bits (group size 64) en las proyecciones del router, BF16 para los pesos de punto flotante no cuantizados y FP32 para los sesgos de routing de expertos. La conversion se recargo con coincidencia estricta de pesos y se verifico mediante pruebas de humo de generacion corta (respuestas correctas a dos preguntas y alcance de EOS); el autor advierte que estas pruebas no constituyen una evaluacion de calidad exhaustiva ni un benchmark de contexto largo.

## Capacidades

- Generacion de texto conversacional en modo texto (pipeline text-generation).
- Razonamiento explicito: genera cadena de pensamiento antes de la respuesta final mediante la etiqueta `<think>`.
- Capacidades multilingues en diez idiomas: ingles, arabe, chino, frances, aleman, japones, coreano, espanol, portugues e italiano.
- Orientado a agentes rapidos y privados en dispositivo, segun la descripcion del autor.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: mencionado por el autor como caso de uso principal (agentes), sin detalle tecnico adicional.
- Capacidades de vision: la etiqueta `mlx-vlm` aparece en el repo, pero la model card indica explicitamente que es un modelo de generacion de texto; no se confirman capacidades de vision.
- Capacidades de audio: no disponible.

## Casos de uso

- Agentes locales en portatil Apple Silicon: el modelo cabe en 13,49 GB de pesos y activa solo ~2B de parametros, por lo que puede ejecutarse en un Mac con memoria unificada suficiente para tareas de agente con razonamiento previo.
- Asistentes conversacionales multi-turno: con 131.072 tokens de contexto, puede mantener conversaciones largas o procesar documentos extensos sin truncar el historial.
- Razonamiento sobre documentos largos: analisis de contratos, informes tecnicos o codigo fuente de gran extension que quepa en la ventana de 128K tokens.
- Generacion de codigo asistida en local: al ser un modelo de razonamiento con plantilla de chat propia, puede usarse integrado en editores o entornos de desarrollo sobre Mac, manteniendo los datos en la maquina.
- Procesamiento multilingue: traduccion, resumen o clasificacion de contenido en cualquiera de los diez idiomas soportados, util para equipos con documentacion en varios idiomas.
- Prototipado rapido de aplicaciones basadas en LLM: gracias al formato MLX y a la libreria MLX-VLM, se puede integrar en notebooks o scripts de experimentacion en Apple Silicon sin necesidad de GPU Nvidia.
- Despliegue con privacidad de datos: al ejecutarse enteramente en local, es adecuado para escenarios con datos sensibles donde no se permite enviar informacion a APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente menciona pruebas de humo no exhaustivas: dos verificaciones de generacion greedy cortas devolvieron correctamente "Paris" y "391" y alcanzaron EOS. El autor indica explicitamente que estas comprobaciones no son una evaluacion de calidad ni un benchmark de contexto largo.

## Requisitos de hardware

- Formato y libreria: este export es exclusivo de MLX, por lo que requiere hardware Apple Silicon (serie M). No esta pensado para CUDA.
- Tamano de pesos: 13,49 GB de ficheros de pesos; el consumo en tiempo de ejecucion incluye ademas cache KV y asignaciones temporales, por lo que se recomienda disponer de bastante mas memoria unificada libre de la que ocupan los pesos (orientativamente 16-20 GB o mas segun contexto y batch).
- Equipo de referencia de la conversion: Apple M3 Ultra.
- Cabida en hardware de consumo: si, dentro del ecosistema Apple Silicon; en Macs con memoria unificada suficiente (por ejemplo configuraciones de 32 GB o superiores). En GPU Nvidia de consumo no es desplegable directamente por estar en formato MLX.
- Opciones de despliegue: MLX-VLM (probado con el port en el PR #2505, commit a6c7313bc053e5887616fa850808d21576eddf98), MLX 0.32.3 y Transformers 5.17.0. No hay soporte declarado para vLLM, llama.cpp, Ollama o TGI en este export concreto.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| LFM2.5-24B-A2B-Preview-nvfp4 (este export) | ~24B | ~2B | 131.072 tokens | lfm1.0 | MLX safetensors, 4 bits NVFP4 |
| LFM2.5-24B-A2B (Liquid AI) | ~24B | ~2B | no disponible en la informacion | lfm1.0 | Pesos originales de Liquid AI |
| LFM2-24B-A2B (predecesor) | ~24B | ~2B | no disponible en la informacion | lfm1.0 | Existe version 4 bits de mlx-community (mlx-community/LFM2-24B-A2B-4bit) |

Nota: la informacion disponible no incluye resultados de benchmarks comparativos entre estos modelos, por lo que la comparacion se limita a parametros, contexto declarado, licencia y disponibilidad. La diferencia funcional conocida entre LFM2.5-24B-A2B y LFM2-24B-A2B es que el primero siempre genera razonamiento previo a la respuesta.

## Limitaciones y advertencias

- Modelo de previsualizacion ("Preview"): el modelo base es lq-preview/LFM2.5-24B-A2B-Preview, no una version final estable; puede presentar cambios o retirada.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; como todo LLM generativo, es susceptible de producir contenido incorrecto con apariencia de veracidad.
- Sesgos: no se documentan evaluaciones de sesgo en la informacion proporcionada.
- Limitaciones de contexto: aunque la ventana declarada es de 131.072 tokens, no hay benchmark de contexto largo que valide el rendimiento real en esa longitud.
- Generacion con razonamiento: al abrir cada turno con `<think>`, el modelo produce cadena de pensamiento antes de responder; es necesario asignar suficientes tokens de salida, de lo contrario la respuesta final puede truncarse.
- Restricciones de licencia: se aplica la LFM Open License v1.0. Es una licencia "other" que debe revisarse antes de uso comercial; no se detallan aqui sus condiciones.
- Compatibilidad: el export esta atado a versiones concretas de software (MLX 0.32.3, Transformers 5.17.0 y un commit especifico de MLX-VLM); otras versiones pueden no cargar los pesos correctamente.
- Cuantizacion agresiva: NVFP4 de 4 bits puede degradar la calidad respecto a la version sin cuantizar; no hay evaluacion comparativa de esa perdida en la informacion disponible.
- Exclusividad de plataforma: al estar en formato MLX, no es desplegable en infraestructura CUDA estandar sin reconversion.
- Atribucion: el modelo original es de Liquid AI, Inc.; la conversion y cuantizacion estan descritas en el fichero NOTICE del repositorio.

## Enlaces

- Repositorio HuggingFace (mlx-community): https://huggingface.co/mlx-community/LFM2.5-24B-A2B-Preview-nvfp4
- Repositorio replicado (nativ-community): https://huggingface.co/nativ-community/LFM2.5-24B-A2B-Preview-nvfp4
- Modelo base (preview): https://huggingface.co/lq-preview/LFM2.5-24B-A2B-Preview
- Modelo original de Liquid AI: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B
- Blog de Liquid AI sobre LFM2.5-24B-A2B: https://www.liquid.ai/blog/lfm2-5-24b-a2b
- Documentacion de Liquid sobre LFM2.5-24B-A2B: https://docs.liquid.ai/lfm/models/lfm25-24b-a2b
- PR de MLX-VLM con el port de LFM2.5: https://github.com/Blaizzy/mlx-vlm/pull/2505
- Version 4 bits del predecesor en mlx-community: https://huggingface.co/mlx-community/LFM2-24B-A2B-4bit
- Pagina de LFM2-24B-A2B en LM Studio: https://lmstudio.ai/models/lfm2-24b-a2b

# chadouming/Hy-MT2-1.8B-int8-ov

## Resumen

Hy-MT2-1.8B-int8-ov es la exportación a OpenVINO IR con compresión de pesos INT8 del modelo de traducción Tencent Hy-MT2-1.8B, publicada por el usuario chadouming. No se trata de un modelo nuevo, sino de un artefacto de despliegue optimizado para ejecutar el modelo base de Tencent sobre hardware Intel (CPU y GPU Arc) mediante la librería openvino-genai, sin necesidad de GPUs NVIDIA ni de stacks CUDA.

El modelo base pertenece a la familia Hunyuan (tag `hunyuan_v1_dense`) y está especializado en traducción automática, con un tamaño de 1,8 mil millones de parámetros en arquitectura densa. La cuantización INT8 reduce el peso del repositorio a aproximadamente 1,8 GB, lo que lo hace viable en equipos de consumo con CPU moderna o gráficas Intel Arc, un nicho habitualmente desatendido por los despliegues habituales basados en vLLM o llama.cpp.

La relevancia de esta ficha radica en su carácter práctico: demuestra el flujo completo de exportación con optimum-intel y NNCF (compresión asimétrica por canal en 225 de 226 capas) y ofrece un formato listo para `LLMPipeline` y `ContinuousBatchingPipeline`. La licencia Apache-2.0 heredada del modelo base facilita su uso comercial, aunque la información publicada sobre el modelo original es escasa en esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Hunyuan, tag `hunyuan_v1_dense`) |
| Parametros totales | 1,8 mil millones (según nombre del modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 asimétrico por canal (NNCF, `int8_asym`, 225/226 capas); pesos comprimidos en formato OpenVINO IR |
| Idiomas soportados | no disponible (el modelo base está orientado a traducción, idiomas concretos no especificados) |
| Licencia | Apache-2.0 |
| Formato de pesos | OpenVINO IR (`.xml`/`.bin`), exportado con optimum-intel; no incluye safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer denso de la familia Hunyuan, identificado en los metadatos como `hunyuan_v1_dense`. El artefacto publicado no modifica la arquitectura: únicamente aplica compresión de pesos INT8 asimétrica por canal mediante NNCF 3.4.0 sobre 225 de las 226 capas del modelo, dejando una capa sin comprimir (probablemente la cabeza de salida o una capa sensible a la cuantización). La exportación se realizó con `optimum-cli export openvino` en modo `text-generation-with-past`, es decir, con soporte de caché KV para decodificación autoregresiva.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si el modelo base empleó RLHF, DPO u otras técnicas de alineación. Tampoco se documentan innovaciones arquitectónicas específicas más allá de la propia familia Hunyuan. La cadena de herramientas empleada (openvino 2026.4.1, openvino-tokenizers 2026.4.1.0, openvino-genai 2026.4.1.0, transformers 4.57.6, optimum-intel 2.3.0.dev0 en commit `bb1da7b1`) sí está documentada con precisión, lo que permite reproducir la exportación.

## Capacidades

- Generación de texto y traducción automática, propósito principal declarado del modelo base (tag `translation`).
- Conversación multi-turno (tags `conversational` y `text-generation`).
- Ejecución con caché KV (`text-generation-with-past`), lo que habilita decodificación incremental eficiente.
- Compatibilidad con `LLMPipeline` y `ContinuousBatchingPipeline` de openvino-genai, incluyendo batching continuo para servir múltiples peticiones concurrentes.
- Ejecución en CPU Intel y GPU Intel Arc mediante OpenVINO.
- Tool calling / function calling: no disponible en la información publicada.
- Capacidades de agente o razonamiento multi-paso: no disponibles en la información publicada.
- Vision, audio o modo thinking: no disponibles.

## Casos de uso

- Traducción por lotes en servidores sin GPU NVIDIA: el modelo puede ejecutarse en CPU Intel con openvino-genai usando `ContinuousBatchingPipeline`, procesando colas de documentos o subtítulos en entornos donde CUDA no está disponible.
- Traducción integrada en aplicaciones de escritorio: con ~1,8 GB de pesos INT8, cabe en un portátil con CPU moderna o gráfica Intel Arc integrada, permitiendo traducción local sin conexión y sin enviar texto a servicios externos.
- Preprocesado multilingüe de corpus: uso del modelo para traducir datasets antes de entrenar otros modelos o para normalizar documentación técnica a un idioma común.
- Atención al cliente en varios idiomas: gracias al soporte conversacional y de caché KV, puede gestionar diálogos multi-turno traduciendo en tiempo real entre el usuario y el agente.
- Localización de documentación técnica: traducción de README, manuales y cadenas de interfaz en pipelines de CI, aprovechando la licencia Apache-2.0 para uso comercial.
- Prototipado en hardware Intel: banco de pruebas para evaluar la calidad de traducción de la familia Hy-MT2 antes de invertir en despliegues mayores, dado el bajo coste de infraestructura.
- Servicio de traducción de bajo consumo: despliegue en edge computing o dispositivos con OpenVINO, donde el consumo energético y la ausencia de GPU dedicada son requisitos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/peso en disco: aproximadamente 1,8 GB de pesos INT8 en formato OpenVINO IR; el consumo en memoria durante inferencia añade la caché KV y los buffers de activación, cuyo tamaño exacto no está documentado.
- GPU recomendadas: Intel Arc (A-series y B-series) según la model card; también ejecutable en CPU Intel.
- GPU de consumo: sí, cabe en gráficas Intel Arc de consumo y en CPU Intel recientes; no está orientado a GPUs NVIDIA (requeriría otra exportación).
- Opciones de despliegue: openvino-genai (`LLMPipeline`, `ContinuousBatchingPipeline`); no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI en este artefacto.
- Latencia y throughput: no disponibles en la información publicada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| Hy-MT2-1.8B-int8-ov (esta ficha) | 1,8 B | no disponible | OpenVINO IR INT8 | Apache-2.0 | CPU Intel / GPU Arc |
| tencent/Hy-MT2-1.8B (base) | 1,8 B | no disponible | safetensors (presumible) | Apache-2.0 | GPU NVIDIA/AMD, CPU |
| Exportaciones GGUF de modelos de traducción ~2B | ~1-2 B | variable | GGUF (Q4/Q8) | según modelo base | CPU, GPU consumer vía llama.cpp |
| Modelos de traducción propietarios (p. ej. APIs comerciales) | no disponible | no disponible | API | propietaria | nube |

La comparativa se limita a alternativas de la misma categoría (traducción de ~2B parámetros); no se dispone de datos de rendimiento comparativo publicados para esta exportación.

## Limitaciones y advertencias

- Es un artefacto de cuantización, no un modelo nuevo: hereda todas las limitaciones del modelo base Tencent Hy-MT2-1.8B, cuya model card no se detalla en la información disponible.
- La compresión INT8 puede introducir una degradación de calidad respecto a los pesos originales en precisión completa; no se han publicado evaluaciones de dicha degradación.
- Una de las 226 capas no fue comprimida, lo que puede afectar a la consistencia del formato si se intenta modificar o re-exportar.
- Solo es ejecutable con openvino-genai; no es compatible directamente con transformers, vLLM, llama.cpp ni Ollama sin conversión adicional.
- Orientado a hardware Intel: en GPUs NVIDIA o AMD no ofrece ventajas y puede no funcionar.
- Riesgo de alucinación y sesgos: no documentados para este artefacto; deben evaluarse sobre el modelo base.
- Idiomas soportados no especificados: conviene validar la calidad de traducción en los pares de idiomas concretos antes de usarlo en producción.
- Licencia Apache-2.0 permite uso comercial, pero se recomienda verificar la model card del modelo base por si existieran condiciones adicionales no reflejadas aquí.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria conocida.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/chadouming/Hy-MT2-1.8B-int8-ov
- Modelo base: https://huggingface.co/tencent/Hy-MT2-1.8B
- openvino-genai (GitHub): https://github.com/openvinotoolkit/openvino.genai
- OpenVINO (GitHub): https://github.com/openvinotoolkit/openvino
- NNCF (GitHub): https://github.com/openvinotoolkit/nncf
- optimum-intel: https://github.com/huggingface/optimum-intel
- Paper, blog o demo del modelo base: no disponibles en la información proporcionada.

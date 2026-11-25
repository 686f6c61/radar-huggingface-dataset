# lokesh23112007/aviation-slm-v3-ollama

## Resumen

Aviation SLM V3 es un modelo de lenguaje compacto de tipo decoder-only Transformer, desarrollado por Lokesh Addepalli (usuario `lokesh23112007`) como parte de un proyecto educativo y de investigación centrado en la generación de texto relacionado con la aviación. Esta ficha corresponde específicamente a la variante empaquetada en formato GGUF para su ejecución local mediante Ollama, publicada en Hugging Face en noviembre de 2026.

El modelo es deliberadamente pequeño: la model card declara aproximadamente 43,55 millones de parámetros, aunque los pesos en safetensors del repositorio suman 82.376.448 parámetros, una discrepancia que conviene tener en cuenta. La arquitectura emplea una dimensión de modelo de 256, 6 capas transformer y 4 cabezas de atención, con un vocabulario de 151.669 tokens y una longitud máxima de secuencia de 512 tokens.

Su relevancia es limitada y muy acotada: se trata de un artefacto de investigación y aprendizaje, no de un modelo de producción. Resulta útil como ejemplo de pipeline completo (preparación de datos de accidentes aéreos, entrenamiento de un SLM, cuantización a GGUF y despliegue con Ollama y RAG), pero el propio autor advierte que las respuestas pueden ser incorrectas, incompletas o repetitivas y que no debe usarse para decisiones operativas de aviación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only |
| Parametros totales | ~43,55 M según model card; 82.376.448 según safetensors del repo |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (modelo); 2048 configurados en el Modelfile de Ollama |
| Tipos de cuantizacion | F16 (GGUF); no se documentan otras variantes |
| Idiomas soportados | no disponible (la model card no los especifica) |
| Licencia | other (licencia personalizada no detallada) |
| Formato de pesos | GGUF (`aviation_slm_v3_f16.gguf`); repositorio etiquetado también con transformers y pytorch |
| Dimension de modelo | 256 |
| Capas transformer | 6 |
| Cabezas de atencion | 4 |
| Tamano de vocabulario | 151.669 |
| Tamano del repositorio | 0,2 GB |
| Runtime previsto | Ollama |

## Arquitectura y entrenamiento

La arquitectura es un Transformer decoder-only convencional, sin mezcla de expertos ni mecanismos híbridos. Con 6 capas, dimensión 256 y 4 cabezas de atención, el modelo es extremadamente compacto y está pensado para inferencia local en hardware modesto. El vocabulario de 151.669 tokens es notablemente grande en relación con el número de parámetros, lo que sugiere un tokenizador reutilizado de un modelo mayor; esto implica que una parte significativa de la capacidad del modelo queda ocupada por la matriz de embeddings.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. La model card únicamente indica que el proyecto incluyó preparación de datos de aviación y que existe un dataset público de accidentes aéreos asociado. El repositorio incluye además una implementación de RAG separada (servicio Python de recuperación, dataset de incidentes aéreos, proxy compatible con Ollama e interfaz de línea de comandos), que no forma parte de los pesos del modelo y debe configurarse aparte. No se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto autoregresiva en el dominio de aviación, entrenada sobre datos de accidentes e incidentes aéreos.
- Modelado de lenguaje genérico básico (`language-modeling`) y uso conversacional según las etiquetas del repositorio.
- Ejecución local mediante Ollama, con un `Modelfile` que fija temperatura 0 y contexto de 2048.
- Integración con un pipeline RAG externo (recuperación sobre un dataset de incidentes) para mejorar la fundamentación de las respuestas.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.
- Capacidades multilingües: no disponibles; la model card no especifica idiomas.

## Casos de uso

- Prototipado educativo de un SLM de dominio: sirve para demostrar el ciclo completo de preparación de datos, entrenamiento, cuantización a GGUF y despliegue con Ollama en un entorno de aprendizaje.
- Demostración de RAG sobre datos de aviación: combinado con el servicio Python de recuperación y el dataset de incidentes, permite ilustrar cómo aumentar un modelo pequeño con recuperación documental.
- Inferencia local en hardware muy limitado: con ~0,2 GB de pesos en F16, puede ejecutarse en portátiles sin GPU dedicada, útil para pruebas de concepto offline.
- Generación de texto exploratoria sobre terminología aeronáutica: para experimentar con prompts y observar el comportamiento de un modelo de dominio reducido, siempre con revisión humana.
- Base para experimentos de ajuste fino: su tamaño permite reentrenar o adaptar el modelo en recursos modestos como ejercicio académico.
- Pruebas de integración con Ollama y proxies compatibles: útil para validar pipelines de servicio (API local, CLI) antes de migrar a modelos mayores.
- No es adecuado para atención al cliente real, generación de código en producción ni ningún escenario que requiera fiabilidad factual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en F16 (pesos de ~0,2 GB más overhead de contexto y runtime); cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. Cualquier GPU con 2 GB o más (GTX 1050, RTX 3050, etc.) es más que suficiente.
- Cabe en GPU consumer: sí, en todas las gamas actuales, e incluso en sistemas integrados.
- Opciones de despliegue: Ollama (soporte oficial del repositorio vía `Modelfile`); llama.cpp es compatible por el formato GGUF; vLLM y TGI no están documentados para este modelo.
- Latencia y throughput: no disponibles; por el tamaño, se espera muy baja latencia en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Aviation SLM V3 (Ollama) | ~43,55 M (card) / 82,4 M (safetensors) | 512 (2048 en Modelfile) | other | GGUF F16 | Dominio aviación, experimental |
| TinyLlama 1.1B | 1,1 B | 2048 | Apache 2.0 | safetensors, GGUF | Modelo pequeño de propósito general, mucho mayor |
| Qwen2.5-0.5B | 0,5 B | 32.768 | Apache 2.0 | safetensors, GGUF | Pequeño generalista con contexto largo |
| SmolLM2-135M | 135 M | 8192 | Apache 2.0 | safetensors, GGUF | Alternativa compacta generalista |

La comparación es desfavorable en capacidades generales: los modelos citados superan ampliamente a Aviation SLM V3 en tamaño, contexto y licencia permisiva, aunque ninguno está especializado en aviación. La ventaja del modelo de Lokesh Addepalli es su huella mínima y su enfoque de dominio, no su rendimiento.

## Limitaciones y advertencias

- Modelo experimental: el autor lo declara apto solo para educación e investigación.
- Riesgo alto de alucinación: las respuestas pueden ser incorrectas, incompletas, repetitivas o no relacionadas con la pregunta.
- No debe usarse para operaciones de vuelo, mantenimiento de aeronaves ni decisiones de seguridad aeronáutica.
- Contexto efectivo muy corto (512 tokens de entrenamiento), lo que limita conversaciones multi-turno y documentos largos.
- Discrepancia entre los parámetros declarados (43,55 M) y los pesos reales (82,376 M): conviene verificar antes de cualquier uso técnico.
- Licencia "other" sin texto detallado: no se garantiza el uso comercial; es necesario contactar con el autor.
- Idiomas soportados no especificados; probablemente limitado al inglés de los datos de entrenamiento.
- El RAG no está incluido en los pesos: requiere desplegar servicios Python y el dataset por separado.
- Sin benchmarks publicados que permitan evaluar su calidad de forma objetiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lokesh23112007/aviation-slm-v3-ollama
- Modelo original: https://huggingface.co/lokesh23112007/aviation-slm
- Repositorio GitHub: https://github.com/LOKESH467-eng/Airplane-Crashes-Data-Preparation
- Dataset de accidentes aéreos: https://huggingface.co/datasets/lokesh23112007/Airplane_crashes_dataset
- Ollama: https://ollama.com/

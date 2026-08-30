# HCHs/RivetCoder-36B-A14B-GGUF

## Resumen

RivetCoder-36B-A14B es un modelo de lenguaje orientado a código, derivado de `zai-org/GLM-5.3-Flash` mediante poda de expertos. El autor, HCHs, ha publicado una versión en formato GGUF con dos cuantizaciones (Q8_0 y Q4_K_M) para su ejecución local eficiente. Se trata de un modelo de arquitectura MoE (mixture of experts) con 45 capas de texto, 24 expertos enrutados retenidos por capa, de los cuales 4 se activan por token, más un experto compartido siempre activo. El modelo total declara 35.594 millones de parámetros, pero solo 13.951 millones se activan por token, lo que lo sitúa en la categoría de modelos eficientes para inferencia.

La relevancia de este lanzamiento radica en que ofrece una alternativa local y de código abierto (licencia MIT) para tareas de generación de código, con soporte para tres idiomas (inglés, chino y coreano) y una ventana de contexto configurada para 1.048.576 posiciones. Sin embargo, es importante destacar que se trata de una versión experimental: la arquitectura `glm5next` requiere una implementación específica de llama.cpp (PR #27752) y no ha sido validada más allá de un contexto de 512 tokens en pruebas de humo. Además, estos GGUF son exclusivamente de texto, ya que excluyen la torre de visión del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `glm5next` (MoE con MTP/NextN) |
| Parametros totales | 35.030.461.190 (lógicos GGUF); 35.594.088.198 (fuente) |
| Parametros activos | 13.951.479.558 por token (4 expertos enrutados + 1 compartido) |
| Longitud de contexto | 1.048.576 (configurado, no verificado a esa longitud) |
| Tipos de cuantizacion | Q8_0, Q4_K_M |
| Idiomas soportados | en, zh, ko |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors no incluido en este repo) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura GLM-5.3-Flash, una variante MoE con 45 capas de texto y una capa adicional MTP/NextN para decodificación especulativa. La poda elimina parte de los expertos enrutados: se conservan 24 por capa, con 4 activos por token, más un experto compartido siempre activo, lo que resulta en 5 FFN activos por capa sparse. El modelo original incluye una torre de visión de 563.627.008 parámetros, pero los GGUF aquí publicados la excluyen deliberadamente, por lo que son exclusivamente de texto.

No se dispone de información detallada sobre el entrenamiento del modelo base ni sobre el proceso de poda (datos, tokens, técnicas de RLHF/DPO). La model card solo indica que es un derivado experimental de GLM-5.3-Flash y que la conversión a GGUF se realizó a partir de un checkpoint BF16. Tampoco se documenta el uso de importance matrix en la cuantización.

## Capacidades

- Generación de texto y razonamiento, con enfoque específico en tareas de programación (generación, completado, explicación de código).
- Soporte de decodificación especulativa mediante la capa MTP/NextN incluida en el GGUF, lo que podría acelerar la inferencia en implementaciones compatibles.
- Capacidades multilingües en inglés, chino y coreano.
- No incluye capacidades multimodales en esta versión GGUF (la torre de visión fue excluida).
- No se documenta soporte explícito de tool calling, function calling ni modo agente en la información disponible.

## Casos de uso

- Asistente de programación local: el modelo puede generar código, completar funciones y explicar fragmentos en inglés, chino o coreano, funcionando sin conexión gracias a su formato GGUF y su licencia MIT.
- Autocompletado de código en editores: con la cuantización Q4_K_M (19.68 GiB) puede ejecutarse en estaciones de trabajo con GPU de 24 GB, integrándose en flujos de desarrollo mediante servidores compatibles con llama.cpp.
- Generación de documentación técnica: su capacidad multilingüe permite redactar comentarios, documentación de APIs y guías de uso en los tres idiomas soportados.
- Refactorización y revisión de código: el modelo puede sugerir mejoras de estilo, detectar patrones problemáticos y proponer versiones alternativas, aunque no se han publicado benchmarks que validen su calidad en esta tarea.
- Aprendizaje y tutoría de programación: puede generar ejemplos, problemas de práctica y explicaciones paso a paso, útil en entornos educativos con requisitos de privacidad.
- Prototipado rápido de scripts: para desarrolladores que necesitan generar código boilerplate o utilidades pequeñas sin depender de servicios en la nube, el modelo ofrece una alternativa local con una ventana de contexto amplia (configurada a 1M, aunque no verificada).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se evaluaron la calidad de generación, benchmarks de código, decodificación especulativa MTP, ejecución en GPU, inferencia multimodal ni comportamiento de contexto largo. Los únicos datos de rendimiento son pruebas de humo de carga y generación de 2 tokens en CPU con contexto 512.

## Requisitos de hardware

- VRAM estimada: para Q4_K_M (19.68 GiB) se necesita al menos 20-24 GB de VRAM si se desea cargar completamente en GPU; para Q8_0 (34.70 GiB) se requieren 36-40 GB.
- GPU recomendadas: RTX 3090/4090 (24 GB) para Q4_K_M; A100 40 GB o H100 para Q8_0.
- En CPU: la prueba de humo se realizó con llama.cpp en CPU, por lo que es posible ejecutarlo sin GPU, aunque con latencia mayor según el número de hilos.
- Opciones de despliegue: llama.cpp (compilación con el PR #27752 o posterior), potencialmente vLLM o TGI si incorporan soporte para `glm5next`, pero no confirmado.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de datos comparativos con modelos similares en la información proporcionada. El modelo base, GLM-5.3-Flash, no tiene especificaciones públicas en este contexto, y no se han encontrado benchmarks que permitan comparar con alternativas como DeepSeek-Coder, CodeLlama o Qwen-Coder. Se recomienda consultar la documentación del modelo base para obtener una referencia, aunque no está disponible en esta ficha.

## Limitaciones y advertencias

- La arquitectura `glm5next` no es soportada por builds estándar de llama.cpp; requiere una versión experimental con el PR #27752. Un build que no la soporte fallará con el error `unknown model architecture: glm5next`.
- La ventana de contexto de 1.048.576 tokens es un valor configurado, no verificado. Las pruebas solo se realizaron con contexto 512; el comportamiento en contextos largos es desconocido.
- Los GGUF son exclusivamente de texto; no incluyen la torre de visión del modelo original, por lo que no pueden procesar imágenes.
- No se han evaluado la calidad de generación, benchmarks de código ni decodificación especulativa; el rendimiento real es incierto.
- La implementación de llama.cpp utilizada era un pull request en desarrollo en el momento de la conversión, por lo que puede presentar limitaciones numéricas o de contexto largo.
- La cuantización Q4_K_M incluye tensores Q5_0 como fallback para formas pequeñas; la conversión se completó sin errores, pero la calidad de esa cuantización no ha sido validada.
- No se usó importance matrix en la cuantización, lo que puede afectar la precisión en comparación con métodos más sofisticados.
- El repositorio tiene 0 descargas y 0 likes; es un lanzamiento reciente y experimental, sin comunidad ni soporte establecido.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/HCHs/RivetCoder-36B-A14B-GGUF
- Modelo base (referencia): https://huggingface.co/zai-org/GLM-5.3-Flash (no verificado directamente)
- PR de llama.cpp #27752 (implementación GLM5-Next): no se dispone del enlace directo en la información proporcionada.

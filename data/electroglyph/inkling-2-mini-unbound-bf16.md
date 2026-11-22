# electroglyph/Inkling-2-Mini-Unbound-BF16

## Resumen

Inkling-2-Mini-Unbound-BF16 es una versión desquantizada en bfloat16 del modelo nokeepai/Inkling-2-Mini-Unbound, publicada por el usuario electroglyph en Hugging Face. El modelo original empleaba cuantización mixta en sus capas de expertos (NVFP4 para las capas 0-19 y MXFP8 para las capas 20-23), y esta versión las convierte a bfloat16 denso, eliminando la configuración de cuantización y los metadatos de codificación. El resultado es un checkpoint de aproximadamente 26.400 millones de parámetros en formato safetensors con un tamaño de repositorio de 53,4 GB.

La relevancia de esta publicación es fundamentalmente práctica: permite ejecutar el modelo con herramientas que no soportan los formatos de cuantización NVFP4 o MXFP8, a costa de un mayor consumo de memoria. Se trata de un modelo multimodal de tipo image-text-to-text, orientado a conversación, con arquitectura identificada en los tags como `inkling2_loop`, si bien no se dispone de documentación técnica detallada sobre dicha arquitectura en la información proporcionada.

La información pública disponible es muy limitada: no hay datos sobre licencia, idiomas soportados, longitud de contexto, composición del dataset de entrenamiento ni resultados de benchmarks. Esto limita seriamente la evaluación rigurosa del modelo para uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | inkling2_loop (según tag de Hugging Face; sin documentación técnica detallada) |
| Parametros totales | 26.388.641.280 (~26,4 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bfloat16 (este checkpoint); el modelo base usa NVFP4 y MXFP8 en capas de expertos |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo base nokeepai/Inkling-2-Mini-Unbound presenta una estructura con capas de expertos cuantizadas de forma mixta: las capas 0 a 19 en NVFP4 y las capas 20 a 23 en MXFP8. La presencia de "expertos" sugiere una arquitectura de mezcla de expertos (MoE), aunque no se confirma el número de expertos activos por token ni el total. El tag `inkling2_loop` apunta a un diseño propietario o poco documentado.

Esta versión BF16 realiza una desquantización completa a bfloat16, preservando de forma byte-idéntica 20 ediciones de "abliteration" (eliminación de direcciones de rechazo en el espacio de activaciones) ya presentes en el modelo base. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco hay datos sobre innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional multi-turno, según el tag `conversational`.
- Procesamiento de imagen y texto combinados (pipeline `image-text-to-text`), lo que implica capacidades de visión.
- Capacidad de razonamiento y respuesta a instrucciones, inferida de su naturaleza conversacional, aunque sin datos que lo confirmen.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo "thinking" u otras capacidades especiales: no disponible.
- El modelo ha sido sometido a ediciones de abliteration, lo que afecta a su comportamiento ante solicitudes que normalmente activarían rechazos.

## Casos de uso

- Asistentes conversacionales multimodales: el modelo puede gestionar diálogos en los que se intercalan imágenes y texto, gracias a su pipeline image-text-to-text, adecuado para aplicaciones de atención al usuario que requieran interpretar capturas, fotos o diagramas.
- Análisis de documentos visuales: al combinar entrada de imagen y texto, puede emplearse para extraer información de capturas de pantalla, gráficos o formularios, integrándose en flujos de procesamiento documental.
- Investigación sobre alineación y abliteration: al preservar las ediciones de abliteration del modelo base en formato BF16, sirve como referencia para estudiar el efecto de dichas ediciones sobre el comportamiento del modelo sin la variable adicional de la cuantización.
- Despliegue en infraestructuras sin soporte NVFP4/MXFP8: el formato BF16 permite ejecutar el modelo en stacks de inferencia estándar (por ejemplo, transformers con aceleración bfloat16 en GPU Ampere o superior) que no implementan los formatos de cuantización del modelo original.
- Prototipado de aplicaciones de visión-lenguaje: al ser un checkpoint denso en BF16, facilita la experimentación con fine-tuning o evaluación con herramientas convencionales, aunque el tamaño de 26,4 mil millones de parámetros exige hardware de gama alta.
- Evaluación comparativa de efectos de cuantización: permite comparar el rendimiento del modelo original cuantizado frente a su versión BF16 para medir la degradación introducida por NVFP4 y MXFP8 en tareas concretas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 52,8 GB solo para los pesos (26,4 mil millones de parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica se requieren del orden de 60 GB o más según la longitud de contexto.
- GPU recomendadas: A100 80 GB, H100 80 GB, o configuraciones multi-GPU (por ejemplo, 2× RTX 4090 de 24 GB con paralelismo de tensor) para BF16.
- No cabe en una única GPU de consumo de 24 GB en BF16 sin cuantización adicional u offloading a CPU.
- Opciones de despliegue: transformers (librería declarada), potencialmente vLLM o TGI si soportan la arquitectura `inkling2_loop`; llama.cpp/Ollama requerirían conversión a GGUF, no disponible en este repositorio.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. No se dispone de información sobre modelos comparables de la misma familia o categoría con la que contrastar parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Ausencia total de información sobre licencia: no se puede confirmar si el uso comercial está permitido; es un riesgo crítico para producción.
- No se documentan los idiomas soportados, lo que impide garantizar un comportamiento adecuado en castellano u otros idiomas.
- Se desconoce la longitud de contexto, factor determinante para aplicaciones conversacionales o de documentos largos.
- El modelo incorpora 20 ediciones de abliteration que eliminan mecanismos de rechazo; esto puede aumentar el riesgo de generar contenido inapropiado o dañino y reduce las salvaguardas de alineación.
- Riesgo de alucinación inherente a los modelos de lenguaje; sin benchmarks ni evaluaciones publicadas no es posible cuantificarlo.
- Al ser una desquantización, puede presentar diferencias de comportamiento respecto al modelo original cuantizado, aunque no se han publicado comparaciones.
- La arquitectura `inkling2_loop` no está documentada en la información disponible, lo que dificulta prever su comportamiento y su compatibilidad con herramientas de inferencia.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/electroglyph/Inkling-2-Mini-Unbound-BF16
- Modelo base: https://huggingface.co/nokeepai/Inkling-2-Mini-Unbound

# mradermacher/Kimi-K2.7-Code-GGUF

## Resumen

Kimi-K2.7-Code-GGUF es la distribución en formato GGUF del modelo Kimi-K2.7-Code, desarrollado originalmente por Moonshot AI y cuantizado por mradermacher. Se trata de un modelo especializado en generación de código, distribuido como quantizaciones estáticas del checkpoint original en safetensors. El repositorio incluye además suplementos multimodales (mmproj) en Q8_0 y f16, lo que indica que el modelo base incorpora capacidad de visión además de texto.

La relevancia de esta ficha radica en que permite ejecutar un modelo de gran tamaño en entornos con llama.cpp y derivados (Ollama, LM Studio, etc.) sin necesidad de infraestructura de GPU de datacenter. Sin embargo, el tamaño del repositorio (3590,8 GB) y de cada quantización (desde 373 GB en Q2_K) lo sitúan fuera del alcance de hardware de consumo convencional, lo que restringe su uso a clústeres con múltiples GPU o a despliegues con almacenamiento y memoria muy abundantes.

La información disponible en la model card es escasa: se limita a la tabla de quantizaciones y a metadatos básicos. No se publican detalles sobre arquitectura interna, longitud de contexto, composición del dataset de entrenamiento ni resultados de benchmarks, por lo que varios apartados de esta ficha se marcan explícitamente como "no disponible".

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: moonshotai/Kimi-K2.7-Code; el repo no detalla la arquitectura interna) |
| Parámetros totales | 471.143.920 (dato de safetensors del repo; ver advertencia en limitaciones) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS, f16; suplementos mmproj en Q8_0 y f16 |
| Idiomas soportados | en (inglés) |
| Licencia | modified-mit (etiquetada como "other" en HuggingFace) |
| Formato de pesos | GGUF (multiparte) y safetensors en el modelo base |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo en la documentación proporcionada. El repositorio es una cuantización estática del checkpoint moonshotai/Kimi-K2.7-Code, y la model card no incluye detalles sobre el tipo de transformer, mecanismos de atención, composición del dataset, número de tokens de entrenamiento ni si se aplicaron técnicas de alineación como RLHF o DPO.

Los metadatos de cuantización indican el uso de `compressed-tensors` y `quantize_version: 2`, con `output_tensor_quantised: 1` y `convert_type: hf`, lo que sugiere un pipeline de conversión desde el formato HuggingFace original hacia GGUF mediante herramientas de cuantización estática. La presencia de ficheros mmproj (multi-modal projection) confirma que el modelo base admite entrada multimodal, presumiblemente imagen y texto, aunque no se detalla el codificador visual empleado.

## Capacidades

- Generación de código: el nombre del modelo y su orientación ("Code") indican especialización en tareas de programación, aunque no se detallan lenguajes ni benchmarks concretos.
- Capacidad multimodal: la inclusión de ficheros mmproj-Q8_0 y mmproj-f16 confirma soporte de entrada de imágenes junto con texto.
- Generación de texto general: derivada del modelo base, sin detalles publicados sobre calidad o dominios.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma del repo.
- Modo thinking o razonamiento extendido: no disponible en la información proporcionada.

## Casos de uso

- Asistencia de programación en local con llama.cpp: el modelo puede desplegarse mediante llama.cpp u Ollama cargando los ficheros GGUF multiparte, adecuado para equipos con clústeres de GPU y almacenamiento masivo que quieran evitar dependencias de API externas.
- Revisión de código con contexto visual: gracias al suplemento mmproj, puede procesar capturas de pantalla de interfaces, diagramas de arquitectura o errores en IDE junto con el código asociado, útil en herramientas de revisión que combinan imagen y texto.
- Generación de código en pipelines de integración continua: integrable en flujos automatizados donde se requiera generación o transformación de código sin salida a Internet, siempre que la infraestructura soporte el tamaño del modelo.
- Análisis de documentación técnica con imágenes: puede extraer información de diagramas, tablas y capturas presentes en manuales técnicos y combinarla con la generación de explicaciones o código de ejemplo.
- Prototipado de asistentes de desarrollo con requisitos de privacidad: al ejecutarse en infraestructura propia, permite procesar código propietario sin enviarlo a servicios de terceros, un requisito habitual en entornos empresariales regulados.
- Experimentación en investigación sobre cuantización extrema: las versiones Q2_K y Q3_K permiten estudiar la degradación de calidad en modelos de gran tamaño bajo cuantizaciones agresivas, comparando con las variantes de mayor precisión del mismo repo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; a partir del tamaño de los ficheros, la quantización Q2_K ocupa 373,0 GB y la Q3_K_S 442,2 GB, por lo que se requiere memoria agregada del mismo orden (GPU o CPU+GPU) para cargar los pesos.
- GPU recomendadas: no disponibles en la documentación; por el volumen de pesos, se necesitan configuraciones multi-GPU (por ejemplo, varios nodos con A100/H100 de 80 GB) o desbordamiento a memoria del sistema.
- GPU de consumo: no cabe en GPUs de consumo individuales (RTX 4090 con 24 GB, etc.); incluso las quantizaciones más pequeñas superan en más de un orden de magnitud la VRAM de una GPU consumer.
- Opciones de despliegue: llama.cpp y derivados (Ollama, LM Studio) para los GGUF; el modelo base en safetensors puede servirse con vLLM o TGI, aunque no se confirma compatibilidad explícita.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Discrepancia en el recuento de parámetros: el dato de safetensors (471.143.920 parámetros) es incompatible con el tamaño del repositorio (3590,8 GB) y con el tamaño de las quantizaciones (373 GB en Q2_K). Es probable que el recuento corresponda a un componente parcial del modelo; debe verificarse antes de planificar el despliegue.
- Idiomas: el repo declara únicamente inglés, lo que limita su uso en castellano u otros idiomas sin evaluación adicional.
- Licencia: etiquetada como "modified-mit" y "other" en HuggingFace; es necesario revisar los términos exactos del modelo base (Moonshot AI) antes de uso comercial, ya que la licencia del derivado puede heredar restricciones del original.
- Riesgo de alucinación: inherente a los modelos generativos; no se han publicado evaluaciones específicas de fidelidad para este checkpoint.
- Sesgos: no documentados en la información disponible.
- Cuantizaciones agresivas: Q2_K y Q3_K_S/M pueden degradar notablemente la calidad respecto al modelo original; para producción se recomienda evaluar Q4_K_M o superiores, con el consiguiente aumento de requisitos de memoria.
- Repositorio multiparte: los ficheros GGUF están divididos en hasta 12 partes; es necesario descargarlas y concatenarlas correctamente antes de su uso.
- Ausencia de benchmarks: no hay datos publicados que permitan validar el rendimiento en tareas de código o multimodalidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Kimi-K2.7-Code-GGUF
- Modelo base: https://huggingface.co/moonshotai/Kimi-K2.7-Code
- Quantizaciones ponderadas/imatrix: https://huggingface.co/mradermacher/Kimi-K2.7-Code-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Kimi-K2.7-Code-GGUF
- README de referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF

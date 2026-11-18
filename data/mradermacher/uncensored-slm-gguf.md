# mradermacher/Uncensored-SLM-GGUF

## Resumen

Uncensored-SLM-GGUF es un repositorio de cuantizaciones estáticas en formato GGUF generadas por mradermacher a partir del modelo original mrzenin/Uncensored-SLM. No se trata de un modelo entrenado desde cero por este autor, sino de una conversión y cuantización del modelo base publicado por mrzenin, orientada a su uso con motores de inferencia compatibles con GGUF como llama.cpp u Ollama.

La información pública disponible es muy limitada: la model card del repositorio se reduce a metadatos internos del proceso de cuantización (versión de cuantización 2, tensor de salida cuantizado, tipo de conversión hf) y a una lista de variantes generadas. No se documentan arquitectura, número de parámetros, longitud de contexto, idiomas ni licencia del modelo subyacente.

El interés del repositorio radica en que ofrece múltiples niveles de cuantización (desde Q2_K hasta F16, incluyendo variantes IQ4_XS y Q8_0) que permiten desplegar el modelo en hardware muy diverso, desde GPUs de consumo hasta servidores. El nombre sugiere un modelo de lenguaje pequeño (SLM) con ajuste orientado a reducir restricciones de contenido, pero esta característica no está documentada técnicamente en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base se distribuye presumiblemente en safetensors según el campo convert_type: hf |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base mrzenin/Uncensored-SLM: no se especifica si es un transformer denso, un modelo MoE, un modelo híbrido ni su número de parámetros. Tampoco se documentan los datos de entrenamiento, el número de tokens procesados, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO.

Lo único verificable es el proceso de cuantización aplicado por mradermacher: una conversión desde el formato de Hugging Face (convert_type: hf) con quantize_version 2 y output_tensor_quantised activado, lo que indica que los tensores de salida se cuantizan de forma estática. Se han generado doce variantes de cuantización que cubren desde 2 bits (Q2_K) hasta 16 bits (F16), pasando por cuantizaciones K-quant e IQ4_XS (importancia mixta de 4 bits).

## Capacidades

- Generación de texto: capacidad presumible por tratarse de un modelo de lenguaje, aunque no se documenta explícitamente.
- Razonamiento y código: no disponible.
- Matemáticas: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Ajuste "uncensored": el nombre del modelo sugiere un ajuste orientado a reducir rechazos de contenido, pero no hay documentación técnica que lo confirme ni que detalle el método empleado.

## Casos de uso

- Despliegue en hardware de consumo: las variantes Q2_K a Q4_K_M permiten ejecutar el modelo en GPUs con poca VRAM o en CPU mediante llama.cpp, siempre que se conozca previamente el tamaño real del modelo base (no documentado).
- Prototipado local con Ollama: la disponibilidad en GGUF facilita la integración en flujos de trabajo locales de experimentación sin depender de servicios en la nube.
- Investigación sobre cuantización: el repositorio ofrece un conjunto amplio de variantes (doce niveles) útil para comparar la degradación de calidad entre cuantizaciones de un mismo modelo base.
- Evaluación de modelos con ajuste "uncensored": para investigadores que estudien el comportamiento de modelos con restricciones de contenido reducidas, aunque la falta de documentación limita la reproducibilidad.
- Generación de texto offline: en entornos sin conectividad, usando llama.cpp con las variantes Q4_K_M o Q5_K_M como compromiso entre calidad y tamaño.
- Servido en servidores modestos: las variantes Q8_0 y F16 pueden servirse con mayor fidelidad en máquinas con suficiente memoria, si el tamaño del modelo base lo permite.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible, al desconocerse el número de parámetros del modelo base. La estimación depende directamente de ese dato y del nivel de cuantización elegido.
- GPU recomendadas: no disponible por la misma razón. Como referencia general, las variantes Q4_K_M y Q5_K_M son las habituales para GPUs de consumo (RTX 3060, 4060, 4090) en modelos de hasta 7-13B, pero no se puede confirmar que este modelo encaje en ese rango.
- Compatibilidad con GPU de consumo: no confirmable sin conocer el tamaño del modelo.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier motor compatible con GGUF (koboldcpp, LM Studio, text-generation-webui). vLLM y TGI no soportan GGUF de forma nativa en todos los casos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables porque se desconoce el tamaño, la arquitectura y el rendimiento del modelo base mrzenin/Uncensored-SLM.

## Limitaciones y advertencias

- Falta total de documentación técnica: no se especifican arquitectura, parámetros, contexto ni datos de entrenamiento, lo que impide evaluar su idoneidad para producción.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; es imprescindible consultar la licencia del modelo base mrzenin/Uncensored-SLM antes de cualquier despliegue.
- Riesgo de alucinación: inherente a los modelos de lenguaje, pero no cuantificado por falta de benchmarks.
- Sesgos: no documentados; al no conocerse el dataset de entrenamiento, no se pueden evaluar sesgos de género, raza, idioma o ideología.
- Ajuste "uncensored": la reducción de restricciones de contenido puede implicar mayor probabilidad de generar material inapropiado, ofensivo o factualmente incorrecto; requiere filtros adicionales en aplicaciones de cara al público.
- Idiomas: no se especifica qué idiomas soporta el modelo, por lo que no se puede garantizar un rendimiento adecuado en castellano.
- Fecha de creación futura (2026-11-18): el repositorio muestra una fecha de creación posterior a la actual, lo que puede indicar un error de metadatos o un repositorio de prueba; conviene verificar su vigencia.
- Cero descargas y cero likes: no hay evidencia de uso ni validación por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Uncensored-SLM-GGUF
- Modelo base: https://huggingface.co/mrzenin/Uncensored-SLM

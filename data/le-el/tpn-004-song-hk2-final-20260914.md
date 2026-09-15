# le-el/tpn-004-song-hk2-final-20260914

## Resumen

El modelo `le-el/tpn-004-song-hk2-final-20260914` es un fine-tuning continuado y una cuantización GGUF del modelo base `tpnlabs/tpn-004-base`, descrito en su model card como «TPN-004 Magistral Small 2509 Uncensored». Ha sido desarrollado por el usuario `le-el` y publicado en HuggingFace el 14 de septiembre de 2026. El repositorio contiene un único archivo GGUF en cuantización Q5_K_S, con una plantilla de chat embebida para su uso directo en motores de inferencia como llama.cpp u Ollama.

Se trata de un modelo de lenguaje con 23.572.403.200 parámetros totales, un tamaño considerable que, tras la cuantización, ocupa 16.3 GB. La model card no especifica la arquitectura, la longitud de contexto ni los idiomas soportados. El nombre del archivo (`tpn-004-b1-cont300-Q5_K_S.gguf`) sugiere que es un candidato de una serie de fine-tuning, pero no se aportan datos de entrenamiento, benchmarks ni evaluaciones de seguridad. Su relevancia principal radica en ser un modelo de 23B accesible para ejecución local en formato GGUF, aunque sin información verificable sobre su rendimiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 23.572.403.200 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q5_K_S (GGUF, con matriz de importancia) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo. Según la model card, se trata de un «continued fine-tuning» del modelo base TPN-004 Magistral Small 2509 Uncensored, al que se ha aplicado una cuantización Q5_K_S con matriz de importancia (importance-matrix quantization). No se proporcionan datos sobre el tamaño del dataset, el número de tokens de entrenamiento, ni la composición de los datos. Tampoco se mencionan procesos de alineación como RLHF o DPO. El archivo GGUF incluye una plantilla de chat embebida, lo que facilita su uso en aplicaciones conversacionales sin configuración adicional.

## Capacidades

- Generación de texto conversacional, según el tag `conversational` y la plantilla de chat embebida en el GGUF.
- No se han publicado capacidades específicas de razonamiento, código, matemáticas, visión o audio.
- No se indica soporte de tool calling o function calling.
- No se indica soporte de agentes ni de razonamiento multi-paso.
- No se especifican capacidades multilingües.
- Al ser un modelo «uncensored», puede generar contenido sin filtros de seguridad, aunque esto no constituye una capacidad técnica formal.

## Casos de uso

Dado que el autor no ha publicado descripciones de capacidades ni benchmarks, los siguientes casos de uso son aplicaciones típicas para un modelo de lenguaje de 23B en formato GGUF, pero no están confirmados por el autor:

- Chat local en hardware de consumo: el formato GGUF y la cuantización Q5_K_S permiten ejecutar el modelo con llama.cpp u Ollama en equipos con GPU de 24 GB o CPU con suficiente RAM.
- Asistente de redacción: puede utilizarse para tareas de escritura creativa o técnica, aunque la calidad no está verificada.
- Generación de contenido de entretenimiento: al ser «uncensored», es adecuado para proyectos que requieran creatividad sin restricciones, con los riesgos asociados.
- Exploración en investigación: sirve como referencia de un fine-tuning continuado sobre una base de 23B, útil para estudiar el efecto de la cuantización con matriz de importancia.
- Experimentación con cuantización: permite probar la relación entre tamaño, velocidad y calidad en modelos de 23B mediante el archivo Q5_K_S.
- Integración en aplicaciones que requieran plantilla de chat embebida: el GGUF incluye la plantilla, lo que simplifica el despliegue en entornos conversacionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: «No complete three-benchmark measured score is claimed here». Por tanto, no es posible evaluar su rendimiento en tareas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 18-20 GB para el modelo y un contexto moderado, basado en el tamaño del archivo GGUF de 16.3 GB y la cuantización Q5_K_S.
- GPU recomendadas: una RTX 4090 (24 GB) es suficiente para ejecución local; una A100 (40/80 GB) ofrece margen para contextos largos o mayor velocidad.
- También puede ejecutarse en CPU mediante llama.cpp, con al menos 32-40 GB de RAM disponible.
- Opciones de despliegue: llama.cpp, Ollama, y otros motores compatibles con GGUF. vLLM y TGI requieren conversión a otros formatos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se dispone de información sobre modelos comparables de la misma categoría, ni datos de benchmarks que permitan una comparación objetiva.

## Limitaciones y advertencias

- No se han publicado benchmarks, por lo que el rendimiento real del modelo es desconocido.
- La licencia no está especificada, lo que genera incertidumbre sobre su uso comercial.
- Al ser «uncensored», puede generar contenido dañino, ofensivo o inapropiado sin filtros; se requiere moderación manual.
- No se especifican los idiomas soportados ni la longitud de contexto, lo que limita su uso en aplicaciones multilingües o de contexto largo.
- No hay información sobre sesgos, riesgo de alucinación ni medidas de seguridad.
- El autor no proporciona datos de entrenamiento ni checkpoints intermedios, lo que dificulta la reproducibilidad.

## Enlaces

- https://huggingface.co/le-el/tpn-004-song-hk2-final-20260914
- https://huggingface.co/tpnlabs/tpn-004-base (modelo base)

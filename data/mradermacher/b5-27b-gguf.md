# mradermacher/B5-27B-GGUF

## Resumen

B5-27B-GGUF es una recopilación de cuantizaciones estáticas en formato GGUF del modelo B5-27B, publicada por el usuario mradermacher a partir de los pesos originales de schneewolflabs/B5-27B. El repositorio contiene múltiples variantes de cuantización (desde Q2_K hasta F16) generadas con llama.cpp, pensadas para facilitar la inferencia local en hardware con recursos limitados.

A pesar de la denominación "27B" en el nombre, los datos reales de safetensors indican que el modelo original tiene 460.730.096 parámetros totales (aproximadamente 0,46 mil millones), lo que sugiere que el nombre comercial no refleja el tamaño real del modelo o que se trata de una nomenclatura no convencional. El repositorio GGUF ocupa 1,6 GB, coherente con un modelo de ese orden de magnitud en cuantizaciones de baja precisión.

La información pública disponible es muy escasa: no se especifican licencia, idiomas, arquitectura ni pipeline en la model card ni en los metadatos de Hugging Face. Esta ficha se limita a documentar lo que puede verificarse y marca explícitamente como "no disponible" todo aquello que no consta en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | 460.730.096 (según safetensors del modelo base) |
| Parámetros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base B5-27B (schneewolflabs/B5-27B): no consta si es un transformer denso, un modelo MoE, híbrido o de otro tipo. Tampoco se documentan los datos de entrenamiento, el número de tokens procesados, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO.

Lo único verificable es el proceso de cuantización: el repositorio contiene cuantizaciones estáticas generadas con llama.cpp (se indica `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`), lo que implica que los pesos originales en formato Hugging Face fueron convertidos y cuantizados para su uso con llama.cpp y ecosistemas compatibles (Ollama, LM Studio, etc.).

## Capacidades

- No se documentan capacidades específicas en la información disponible.
- No consta soporte de tool calling ni function calling.
- No consta soporte de agentes ni razonamiento multi-paso.
- No se especifican capacidades multilingües ni idiomas cubiertos.
- No se indica si dispone de modo de razonamiento (thinking mode), visión, audio u otras modalidades.
- La única capacidad verificable es la de inferencia de texto en formato GGUF mediante llama.cpp y herramientas compatibles.

## Casos de uso

- Inferencia local en hardware modesto: al tratarse de un modelo de aproximadamente 0,46 mil millones de parámetros con cuantizaciones desde Q2_K, puede ejecutarse en CPU o en GPU de gama baja con poca VRAM, lo que lo hace adecuado para pruebas en entornos sin aceleradores dedicados.
- Despliegue en dispositivos de borde: las variantes de baja precisión (Q2_K, Q3_K_S) permiten integración en dispositivos con memoria limitada, siempre que el rendimiento del modelo base sea suficiente para la tarea.
- Experimentación con llama.cpp: útil para desarrolladores que quieran probar el pipeline de cuantización y comparar calidad entre variantes (F16 frente a Q4_K_M, por ejemplo) sobre un modelo concreto.
- Prototipado rápido de aplicaciones de texto: dado el reducido tamaño de los pesos, permite iterar rápidamente en entornos de desarrollo sin necesidad de infraestructura de servidor.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece doce variantes, lo que facilita estudios de degradación de calidad según el nivel de cuantización.
- Integración en Ollama o LM Studio: al ser GGUF, puede importarse directamente en estas herramientas para uso personal o pruebas de concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: con 460.730.096 parámetros, la huella en F16 sería de aproximadamente 0,9 GB; en Q8_0, unos 0,5 GB; en Q4_K_M, unos 0,3 GB. Estas cifras son estimaciones basadas en el recuento de parámetros y no en mediciones publicadas.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre puede alojar las cuantizaciones más pequeñas; no se dispone de datos de rendimiento específicos.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de gama baja e incluso en CPU, dado el reducido tamaño.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se dispone de información sobre el modelo base ni sobre alternativas comparables en la misma categoría, por lo que no es posible establecer una comparación fundamentada.

## Limitaciones y advertencias

- La licencia no está especificada, lo que impide determinar si el uso comercial está permitido; debe consultarse el repositorio del modelo base (schneewolflabs/B5-27B) antes de cualquier uso en producción.
- No se documentan sesgos conocidos ni riesgos de alucinación específicos, pero al no haber información sobre el entrenamiento, no pueden descartarse.
- El nombre "27B" no coincide con el recuento real de parámetros (aproximadamente 0,46 mil millones), lo que puede inducir a error sobre la capacidad del modelo.
- No se especifican idiomas soportados ni longitud de contexto, lo que limita la evaluación de su idoneidad para tareas multilingües o de contexto largo.
- Al ser cuantizaciones estáticas, las variantes de menor precisión (Q2_K, Q3_K_S) pueden degradar la calidad de salida de forma significativa.
- No hay información sobre el pipeline ni sobre el propósito del modelo base, por lo que su uso en producción requiere validación previa.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/B5-27B-GGUF
- Modelo base: https://huggingface.co/schneewolflabs/B5-27B

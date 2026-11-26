# Lonelyguyse1/granite-4.2-3b-abliterated-GGUF

## Resumen

`granite-4.2-3b-abliterated-GGUF` es una distribución en formato GGUF del modelo `Lonelyguyse1/granite-4.2-3b-abliterated`, una variante "abliterated" (sin mecanismos de rechazo) del modelo IBM Granite 4.2 de 3B parámetros. El autor de esta conversión es el usuario de Hugging Face Lonelyguyse1, que publica dos cuantizaciones listas para su uso con llama.cpp y Ollama. El modelo base deriva de la familia Granite de IBM, si bien la model card no documenta explícitamente el linaje exacto ni la arquitectura interna.

El interés de esta ficha radica en que combina tres elementos poco habituales: un modelo pequeño (3.659.737.600 parámetros, aproximadamente 3,66B), una licencia permisiva Apache 2.0 y una modificación deliberada para reducir las negativas del modelo ante peticiones que el modelo original rechazaría. Según la model card, el proceso aplicado (Heretic v2.1.0 con ARA) redujo las negativas de 98/100 a 52/100 con una divergencia KL de 0,2167 respecto al modelo original, lo que indica una alteración moderada pero no trivial de la distribución de salida.

La relevancia práctica es doble: por un lado, ofrece un modelo de ~3,7B ejecutable en hardware de consumo con cuantización Q4_K_M de 2,14 GB; por otro, plantea consideraciones éticas y de cumplimiento que conviene evaluar antes de integrarlo en producción, dado que su propósito declarado es precisamente eliminar las salvaguardas conversacionales del modelo original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base derivado de IBM Granite 4.2, arquitectura no documentada en la información proporcionada) |
| Parámetros totales | 3.659.737.600 (~3,66B) |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K_M (2,14 GB), Q8_0 (3,71 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base. Se sabe que procede de la familia IBM Granite 4.2 en su variante de 3B parámetros y que el autor publica una versión "abliterated" del mismo. El término "abliterated" hace referencia a una técnica de modificación de pesos que busca eliminar la dirección de activación asociada al rechazo de peticiones, sin reentrenar el modelo desde cero. En este caso, la model card cita el uso de Heretic v2.1.0 junto con ARA (Ablation of Refusal Activations, presumiblemente), y reporta métricas concretas del proceso: reducción de negativas de 98/100 a 52/100 y divergencia KL de 0,2167 frente al modelo original.

No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO en el modelo base. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal. La conversión a GGUF se realizó presumiblemente con las herramientas estándar de llama.cpp, aunque el proceso exacto no se detalla.

## Capacidades

- Generación de texto conversacional en formato multi-turno, según la etiqueta `conversational` del repositorio.
- Ejecución local mediante llama.cpp y Ollama, con cuantizaciones optimizadas para hardware de consumo.
- Comportamiento "uncensored": el proceso de abliteración reduce la tasa de negativas del modelo original (de 98/100 a 52/100 según la model card), lo que se traduce en respuestas más permisivas ante peticiones que el modelo base rechazaría.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que sugiere posibilidad de despliegue como servicio.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling, function calling, agentes o razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Experimentación con modelos locales en hardware modesto: con 2,14 GB en Q4_K_M, el modelo cabe en GPUs de consumo con 4-6 GB de VRAM o incluso en CPU con RAM suficiente, lo que permite probar flujos conversacionales sin infraestructura dedicada.
- Investigación sobre alineación y seguridad: el modelo sirve como caso de estudio para analizar cómo la abliteración afecta a la tasa de negativas y a la calidad general (medida aquí con KL 0,2167), útil en trabajos académicos sobre robustez de salvaguardas.
- Generación de texto creativo sin restricciones temáticas: escritura de ficción, guiones o narrativa que aborde temas sensibles que el modelo base podría rechazar, siempre que el usuario asuma la responsabilidad del contenido.
- Prototipado rápido de asistentes conversacionales: gracias a la integración con Ollama (`ollama create` y `ollama run`), se puede levantar un chatbot local en minutos para validar una idea de producto antes de invertir en modelos mayores.
- Evaluación comparativa de cuantizaciones: al ofrecer Q4_K_M y Q8_0 del mismo modelo, permite medir el impacto de la cuantización en la calidad de salida y en la tasa de negativas dentro de un pipeline de evaluación propio.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse íntegramente en local, es adecuado para escenarios donde los datos no pueden salir de la máquina, como análisis de documentos internos o prototipos en entornos aislados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas del proceso de abliteración (negativas 98/100 → 52/100, KL 0,2167), que no son comparables con benchmarks estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-3 GB para Q4_K_M (pesos de 2,14 GB más overhead de contexto y KV cache) y 4-4,5 GB para Q8_0 (pesos de 3,71 GB más overhead).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para Q4_K_M (GTX 1650, RTX 3050, RTX 4060, etc.); para Q8_0 se recomienda 6 GB o más (RTX 3060, RTX 4060 Ti, etc.).
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 4 GB o más para Q4_K_M. También puede ejecutarse en CPU con 8 GB de RAM o más, aunque con mayor latencia.
- Opciones de despliegue: llama.cpp (`llama-cli`), Ollama (mediante `Modelfile`), y cualquier runtime compatible con GGUF (koboldcpp, LM Studio, etc.). vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que no se recomiendan sin conversión adicional.
- Latencia y throughput estimados: no disponibles en la información proporcionada. En una GPU de consumo moderna se puede esperar un rendimiento interactivo para un modelo de ~3,7B en Q4_K_M, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| granite-4.2-3b-abliterated-GGUF (este) | ~3,66B | no disponible | Apache 2.0 | GGUF | Variante abliterated, 2 cuantizaciones |
| granite-4.2-3b-abliterated (base) | ~3,66B | no disponible | Apache 2.0 | safetensors | Modelo original sin cuantizar |
| IBM Granite 4.2 3B (oficial) | ~3,66B | no disponible | Apache 2.0 (presumible) | safetensors | Modelo original con salvaguardas intactas |
| Llama 3.2 3B Instruct | ~3,2B | 128K | Llama 3.2 Community License | safetensors, GGUF | Alternativa de tamaño similar con licencia más restrictiva |

La comparación con Llama 3.2 3B se ofrece como referencia de categoría (modelo pequeño de ~3B), pero no se dispone de datos de rendimiento comparativos en la información proporcionada. El modelo oficial de IBM Granite 4.2 3B sería el comparable más directo, aunque sus especificaciones completas no están documentadas en esta ficha.

## Limitaciones y advertencias

- La abliteración elimina parcialmente los mecanismos de rechazo, lo que puede producir contenido inapropiado, ofensivo o potencialmente dañino. No es apto para aplicaciones orientadas al público general sin filtros adicionales.
- La tasa de negativas reportada (52/100) indica que el modelo sigue rechazando aproximadamente la mitad de las peticiones que el modelo original rechazaba, pero la distribución de esos rechazos no está documentada.
- La divergencia KL de 0,2167 sugiere una alteración moderada de la distribución de salida; puede haber degradación en tareas que requieren precisión factual o razonamiento cuidadoso.
- Riesgo de alucinación: no cuantificado en la información disponible, pero esperable en un modelo de ~3,7B sin benchmarks publicados.
- Longitud de contexto e idiomas soportados no documentados: no se puede garantizar un comportamiento adecuado en contextos largos o en castellano.
- Aunque la licencia es Apache 2.0, el uso comercial de un modelo deliberadamente "uncensored" puede entrar en conflicto con políticas de plataforma, requisitos regulatorios (por ejemplo, la AI Act europea) o términos de servicio de proveedores cloud. Se recomienda asesoramiento legal antes de desplegarlo en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (26 de noviembre de 2026), lo que indica que no ha pasado por validación comunitaria.
- No se documenta el proceso exacto de cuantización ni se ofrecen comparativas de calidad entre Q4_K_M y Q8_0.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Lonelyguyse1/granite-4.2-3b-abliterated-GGUF
- Modelo base (abliterated, safetensors): https://huggingface.co/Lonelyguyse1/granite-4.2-3b-abliterated
- Heretic (herramienta de abliteración citada): no disponible en la información proporcionada
- IBM Granite (familia original): no disponible en la información proporcionada

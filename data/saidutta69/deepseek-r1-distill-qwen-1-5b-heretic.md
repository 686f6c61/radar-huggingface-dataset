# saidutta69/DeepSeek-R1-Distill-Qwen-1.5B-heretic

## Resumen

DeepSeek-R1-Distill-Qwen-1.5B-heretic es una variante "decensored" del modelo DeepSeek-R1-Distill-Qwen-1.5B, desarrollada por saidutta69 mediante la técnica de ablación direccional (abliteration) implementada en la herramienta Heretic v1.4.0. En lugar de un fine-tuning tradicional, se editan selectivamente los pesos responsables del comportamiento de rechazo en las capas de atención y proyecciones MLP, lo que suprime las negativas del modelo sin alterar significativamente sus capacidades de razonamiento, conocimiento o seguimiento de instrucciones.

El modelo está pensado para desarrolladores que necesitan el razonamiento destilado de DeepSeek-R1 sin los guardarraíles de seguridad habituales. Al tratarse de un modelo de 1.500 millones de parámetros (1,78 B en total), puede ejecutarse en CPU y hardware de consumo, con cuantizaciones GGUF que reducen el peso a aproximadamente 1 GB. No supone una mejora de capacidades respecto al modelo base, sino una eliminación deliberada de los mecanismos de rechazo, por lo que su uso conlleva una responsabilidad explícita sobre el contenido generado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (arquitectura Qwen2, según tags) |
| Parametros totales | 1.777.088.000 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Safetensors (BF16), GGUF Q4_K_M, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | Safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo base, DeepSeek-R1-Distill-Qwen-1.5B, es un transformer denso de 1.500 millones de parámetros, destilado a partir de DeepSeek-R1 sobre la arquitectura Qwen2.5. La variante heretic no ha sido sometida a un entrenamiento adicional; en su lugar, se ha aplicado una ablación direccional con Heretic v1.4.0, que identifica y modifica las direcciones de peso específicas asociadas al comportamiento de rechazo. Este proceso conserva el resto de la red intacta, por lo que las capacidades de razonamiento, generación de texto y seguimiento de instrucciones del modelo original se mantienen prácticamente sin cambios. No se dispone de información sobre el dataset de entrenamiento original ni sobre el proceso de destilación, más allá de que el modelo base fue publicado por DeepSeek.

## Capacidades

- Generación de texto y razonamiento encadenado (chain-of-thought) similar al de DeepSeek-R1, gracias a la destilación.
- Seguimiento de instrucciones complejas, manteniendo la coherencia en tareas multi-turno.
- Supresión de rechazos: el modelo responde a solicitudes que el modelo base rechazaría, incluyendo peticiones potencialmente dañinas o no éticas.
- No se documentan capacidades específicas de tool calling, agentes o visión; el modelo se centra en generación de texto y razonamiento.
- Multilingüismo limitado al inglés, según la ficha del autor.

## Casos de uso

- Generación de contenido creativo sin restricciones: el modelo puede producir textos literarios, guiones o ideas que otros modelos censurarían, útil para escritores que exploran temas tabú.
- Investigación en IA sobre comportamientos no alineados: permite estudiar cómo responde un modelo sin guardarraíles, facilitando análisis de sesgos y riesgos en entornos controlados.
- Desarrollo de agentes conversacionales para entornos simulados donde se requiere explorar respuestas extremas, como juegos de rol o simulaciones sociales.
- Pruebas de robustez en sistemas de moderación: al generar contenido que normalmente sería bloqueado, sirve para evaluar la eficacia de filtros de contenido en otras aplicaciones.
- Asistencia en tareas de razonamiento lógico y matemático sin interrupciones por políticas de seguridad, útil en entornos educativos o de investigación.
- Prototipado rápido de aplicaciones que necesitan respuestas directas sin evasivas, como chatbots de atención al cliente en dominios sensibles (siempre que se asuma la responsabilidad legal).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no proporciona métricas comparativas con el modelo base ni con otras alternativas.

## Requisitos de hardware

- El modelo, con 1.500 millones de parámetros, es adecuado para CPU y GPUs de consumo. Las cuantizaciones GGUF (Q4_K_M, Q5_K_M, Q6_K, Q8_0) permiten ejecutarlo con requisitos de memoria reducidos; la versión Q4_K_M ocupa aproximadamente 1 GB, aunque no se especifica el valor exacto en la documentación.
- Se puede ejecutar en GPUs con 4 GB de VRAM o menos en cuantización Q4, y en CPU con al menos 8 GB de RAM para la versión completa en BF16.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, Jan, vLLM, SGLang y transformers de Hugging Face.
- No se proporcionan datos de latencia o throughput específicos, pero al ser un modelo pequeño, es esperable una generación rápida en hardware moderno.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Supresión de rechazos |
|---|---|---|---|---|
| DeepSeek-R1-Distill-Qwen-1.5B (base) | 1,78 B | No disponible | MIT | No (mantiene rechazos) |
| DeepSeek-R1-Distill-Qwen-1.5B-heretic | 1,78 B | No disponible | MIT | Sí (abliterado) |
| Otros modelos abliterados (p. ej., variantes de Llama) | Variable | Variable | Variable | Sí, pero sin datos concretos |

La única diferencia documentada entre el modelo heretic y su base es la eliminación de los mecanismos de rechazo; el resto de características (arquitectura, tamaño, licencia) son idénticas. No se dispone de comparativas con otros modelos abliterados en la información proporcionada.

## Limitaciones y advertencias

- El modelo no tiene filtros de seguridad adicionales: responderá a solicitudes dañinas, ilegales o no éticas, lo que puede generar contenido inapropiado o peligroso.
- La supresión de rechazos es deliberada y puede afectar a la coherencia en ciertos dominios, aunque el autor afirma que las capacidades generales se mantienen.
- No se ha verificado la calidad del razonamiento tras la ablación; podría haber degradaciones sutiles no documentadas.
- La licencia MIT permite uso comercial, pero el responsable del despliegue asume toda la responsabilidad legal y ética del contenido generado.
- El modelo solo soporta inglés, lo que limita su uso en otros idiomas.
- No se proporcionan datos sobre sesgos o alucinaciones específicos, pero al ser un modelo pequeño, es probable que presente alucinaciones frecuentes en temas especializados.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/saidutta69/DeepSeek-R1-Distill-Qwen-1.5B-heretic)
- [Modelo base DeepSeek-R1-Distill-Qwen-1.5B](https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B)
- [Repositorio de Heretic](https://github.com/p-e-w/heretic)
- [Artículo sobre abliteration](https://huggingface.co/blog/mlabonne/abliteration)
- [Repositorio oficial de DeepSeek-R1](https://github.com/deepseek-ai/DeepSeek-R1)

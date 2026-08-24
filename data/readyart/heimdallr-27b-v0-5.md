# ReadyArt/Heimdallr-27B-v0.5

## Resumen

Heimdallr-27B-v0.5 es un modelo de lenguaje de 27 mil millones de parámetros desarrollado por ReadyArt, basado en el modelo Qwen/Qwen3.8-27B. Está orientado específicamente a roleplay, conversación y generación de texto con estilo instructivo, y se presenta como un modelo "unaligned" (sin alineación), lo que implica que no ha sido sometido a los procesos habituales de rechazo de contenido explícito. El modelo está etiquetado con contenido adulto y NSFW, por lo que su uso está restringido a mayores de edad y su acceso en HuggingFace es gated (requiere aceptar condiciones).

La relevancia de este modelo radica en su nicho: usuarios que buscan experiencias de roleplay inmersivas sin restricciones temáticas, especialmente en géneros como fantasía oscura o contenido erótico. Al derivar de Qwen3.8-27B, hereda una arquitectura transformer moderna, aunque no se han publicado detalles específicos sobre la longitud de contexto, cuantizaciones o idiomas soportados. Su licencia Apache-2.0 permite uso comercial, pero la falta de documentación técnica y la ausencia de benchmarks publicados limitan su evaluación objetiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basada en Qwen/Qwen3.8-27B, probablemente transformer denso) |
| Parametros totales | 27 mil millones (27B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (presumiblemente safetensors, no confirmado) |

## Arquitectura y entrenamiento

La arquitectura de Heimdallr-27B-v0.5 se hereda del modelo base Qwen/Qwen3.8-27B, que es un transformer denso de última generación desarrollado por Alibaba. No se han publicado detalles sobre el proceso de entrenamiento específico de este fine-tuning: se desconoce el número de tokens utilizados, la composición del dataset de entrenamiento o si se emplearon técnicas de RLHF, DPO o similares. Dado que el modelo se describe como "unaligned" y orientado a roleplay, es probable que el entrenamiento se haya realizado sobre datos conversacionales y de ficción, pero esta información no está disponible en la documentación pública.

No se mencionan innovaciones técnicas adicionales (como decodificación especulativa, atención lineal o mezcla de expertos). Se recomienda consultar el repositorio de Qwen para conocer las características técnicas del modelo base, aunque no se puede confirmar si el fine-tuning ha modificado alguna de ellas.

## Capacidades

- Generacion de texto conversacional y narrativo, especialmente adaptado a roleplay y ficción interactiva.
- Respuestas en formato instructivo, capaces de seguir instrucciones y mantener diálogos multi-turno.
- Soporte de contenido explícito y adulto, incluido roleplay erótico (ERP) y temáticas de fantasía oscura.
- No se ha confirmado si soporta tool calling, function calling o razonamiento multi-step; la información disponible no lo menciona.
- Capacidades multilingües no documentadas; el modelo base Qwen3.8-27B soporta múltiples idiomas, pero no se especifica para esta versión.
- No se indican capacidades de visión, audio u otras modalidades.

## Casos de uso

- Roleplay inmersivo en entornos de fantasía oscura: el modelo puede mantener personajes complejos y tramas prolongadas, aprovechando la ventana de contexto del modelo base (aunque no se especifica la longitud).
- Creación de historias interactivas y novelas visuales: permite que los usuarios dirijan la trama mediante instrucciones, con un estilo de escritura adaptable.
- Simulación de personajes para juegos de rol de mesa o videojuegos: se puede integrar como motor de diálogo para NPCs.
- Generación de contenido creativo sin censura: escritura de ficción adulta o erótica con restricciones mínimas, útil para autores que necesitan explorar temas sensibles.
- Chatbots personalizados para adultos: con la licencia Apache-2.0, se puede desplegar en aplicaciones comerciales que requieran respuestas sin filtros de seguridad.
- Investigación en alineación y seguridad: al ser un modelo "unaligned", sirve como caso de estudio para analizar el comportamiento de modelos sin entrenamiento de rechazo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. Tampoco se dispone de comparativas con otros modelos en el mismo rango de parámetros.

## Requisitos de hardware

- VRAM estimada: para un modelo de 27B en FP16 se necesitan aproximadamente 54 GB de VRAM. Con cuantización de 8 bits se reduce a ~27 GB, y con 4 bits a ~14 GB, aunque estas cifras son estimaciones genéricas y no específicas de este modelo.
- GPU recomendadas: A100 80GB, H100 80GB, RTX 4090 (24GB) con cuantización 4 bits, o RTX 3090/3080 con cuantización 4 bits. Para despliegue en producción, se recomienda al menos una A100.
- En consumer GPU: es posible ejecutar en RTX 4090 o RTX 3090 con cuantización 4 bits, aunque la velocidad será limitada.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI (Text Generation Inference) y otros frameworks compatibles con modelos de 27B. No se especifica el formato de pesos, pero si es safetensors, puede cargarse con transformers.
- Latencia y throughput: no disponible. Dependerá del hardware y del formato de cuantización elegido.

## Comparativa con modelos similares

| Modelo | Params | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Heimdallr-27B-v0.5 | 27B | no disponible | Apache-2.0 | Gated en HF | Sin alineación, roleplay |
| Qwen/Qwen3.8-27B | 27B | no disponible | Apache-2.0 | Abierto | Modelo base, alineado |
| Llama-3.1-27B (hipotético) | 27B | no disponible | no disponible | no disponible | No existe como tal, solo como comparativa genérica |

La comparativa es limitada porque no se dispone de datos de rendimiento ni de contexto para Heimdallr. Se recomienda comparar directamente con Qwen3.8-27B, ya que es la base, y con otros modelos de roleplay como MythoMax o Nous Hermes, aunque no se han incluido en la tabla por falta de datos concretos.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo sin alineación, puede producir contenido ofensivo, discriminatorio o dañino sin filtros. No se han evaluado sesgos específicos.
- Riesgo de alucinación: como cualquier LLM, puede generar información falsa o inventada, especialmente en contextos de roleplay donde la ficción es predominante.
- Limitaciones de contexto: la longitud de contexto no se especifica; si se hereda del modelo base, podría ser de 32K o 128K tokens, pero no se garantiza.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el acceso es gated en HuggingFace, lo que puede limitar la distribución o el uso en producción si no se aceptan los términos.
- Riesgo de dependencia del modelo base: al ser un fine-tune de Qwen3.8-27B, los cambios en el modelo base pueden afectar el comportamiento de este.
- No se han publicado documentación técnica sobre el dataset de entrenamiento, el número de tokens o las técnicas de fine-tuning, lo que dificulta la evaluación de su calidad y sesgos.

## Enlaces

- [HuggingFace - ReadyArt/Heimdallr-27B-v0.5](https://huggingface.co/ReadyArt/Heimdallr-27B-v0.5)
- [HuggingFace - Qwen/Qwen3.8-27B (modelo base)](https://huggingface.co/Qwen/Qwen3.8-27B) - enlace no verificado, se asume por el nombre.
- [Unrestricted AI - Leaderboard de modelos sin restricciones](https://unrestricted.ai/) - referencia externa, no vinculada directamente con este modelo.
- [OpenRouter - Comparativa de modelos](https://openrouter.ai/models) - para comparaciones de contexto y precios (no específico para este modelo).

Nota: no se han encontrado papers, blogs ni demos adicionales sobre este modelo en la búsqueda web.

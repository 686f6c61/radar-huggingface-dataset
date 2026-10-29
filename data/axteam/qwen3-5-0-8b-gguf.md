# axteam/Qwen3.5-0.8B-GGUF

## Resumen

`axteam/Qwen3.5-0.8B-GGUF` es una conversión a formato GGUF del modelo `Qwen/Qwen3.5-0.8B`, publicada por el usuario axteam para su uso con llama.cpp, Ollama y LM Studio. Se trata de un derivado cuantizado, no de un modelo entrenado desde cero: los pesos originales y el tokenizador pertenecen al equipo Qwen (Alibaba Cloud), y el repositorio se limita a ofrecer dos variantes de cuantización (Q8_0 y Q4_K_M) generadas con el script `convert_hf_to_gguf.py` de llama.cpp.

El modelo base pertenece a la serie Qwen3.5, descrita en fuentes públicas como una familia de modelos multilingües con mejoras en razonamiento y seguimiento de instrucciones respecto a Qwen3. Con 772.845.888 parámetros (aproximadamente 0,8B), está orientado a despliegue en el borde (edge), dispositivos con recursos limitados y ejecución local en CPU. Los ficheros GGUF publicados aquí son exclusivamente de texto: el codificador visual del modelo original no está incluido en la conversión.

La relevancia de esta ficha es práctica: permite ejecutar un modelo de la familia Qwen3.5 en hardware de consumo sin necesidad de GPU dedicada, a cambio de una pérdida de calidad controlada en la variante de 4 bits. El repositorio es muy reciente y no cuenta todavía con descargas ni valoraciones públicas, por lo que debe evaluarse con cautela antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la informacion proporcionada (modelo base de la serie Qwen3.5) |
| Parametros totales | 772.845.888 (aproximadamente 0,77B), dato de safetensors del modelo base |
| Parametros activos | no aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (8 bits) y Q4_K_M (4 bits, k-quant medium) |
| Idiomas soportados | no disponible en la model card; la serie Qwen3.5 se describe como multilingue en fuentes externas |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base se distribuye en safetensors / Transformers |
| Tamano de los ficheros | Q4_K_M: 0,5 GB; Q8_0: 0,8 GB |
| Plantilla de chat | incluida (chat_template original embebido) |
| Modalidad | solo texto en estos GGUF (el codificador visual no se incluye) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base. Lo que sí se documenta es el proceso de derivación: los pesos de `Qwen/Qwen3.5-0.8B` se convirtieron a GGUF mediante `convert_hf_to_gguf.py`, la herramienta oficial de llama.cpp, preservando la plantilla de chat original. El repositorio de ModelScope asociado a la serie indica que se trata de un modelo "post-trained" en formato Hugging Face Transformers, compatible con Transformers, vLLM, SGLang y KTransformers; es decir, existe una fase de post-entrenamiento (instrucción/conversación) sobre la base, aunque no se especifican los detalles de dataset, número de tokens ni si se emplearon técnicas como RLHF o DPO.

No se dispone de información sobre la composición del corpus de entrenamiento, el número de tokens procesados ni innovaciones técnicas concretas (decodificación especulativa, atención lineal, mezcla de expertos, etc.). Cualquier afirmación en ese sentido sería especulativa. La innovación atribuible a este repositorio concreto es únicamente la cuantización: Q8_0 como opción de máxima fidelidad respecto al original y Q4_K_M como opción de aproximadamente la mitad de tamaño con una compensación de calidad pequeña, según el autor.

## Capacidades

- Generación de texto conversacional en formato chat, gracias a la plantilla embebida en el GGUF.
- Ejecución local en llama.cpp (`llama-server`, `llama-cli`), Ollama y LM Studio.
- Despliegue en el borde: el modelo base se posiciona explícitamente para edge deployment según Qualcomm AI Hub.
- Capacidad multilingüe: no confirmada en la model card de este repositorio, pero la serie Qwen3.5 se describe como multilingüe en fuentes externas.
- Razonamiento y seguimiento de instrucciones: la serie Qwen3.5 declara mejoras en estas áreas frente a Qwen3, aunque no se aportan métricas en la información disponible.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags de HuggingFace).
- Sin capacidades de visión en estos ficheros: el codificador visual del modelo original queda fuera de la conversión GGUF.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Asistentes conversacionales en local para desarrolladores: con 0,5 GB en Q4_K_M, el modelo se puede cargar en un portátil sin GPU y servir mediante `llama-server` con una ventana de 8192 tokens, tal como sugiere el ejemplo del autor, para prototipar chatbots sin coste de API.
- Clasificación y etiquetado de texto por lotes: al caber en CPU, se puede ejecutar sobre grandes volúmenes de documentos en pipelines offline donde el coste por token de un modelo en la nube sería prohibitivo.
- Preprocesado y enrutamiento en sistemas RAG: usar el modelo como primer filtro para reformular consultas, resumir fragmentos recuperados o decidir si una pregunta requiere un modelo mayor, reduciendo llamadas a modelos de mayor tamaño.
- Aplicaciones de escritorio y herramientas ofimáticas: integración vía Ollama o LM Studio para autocompletado, resumen de notas y reescritura de texto sin conexión a internet, algo crítico en entornos con requisitos de privacidad.
- Despliegue en dispositivos de borde: el modelo base está catalogado en Qualcomm AI Hub para edge deployment, por lo que la variante GGUF sirve como referencia de comportamiento antes de portar a runtime específico de NPU.
- Educación y experimentación: por su tamaño reducido y licencia Apache-2.0, es adecuado para prácticas de cuantización, evaluación de degradación Q4 frente a Q8 y comparación de backends de inferencia.
- Filtrado y generación de texto en entornos con hardware muy limitado (Raspberry Pi, mini-PC): la variante Q4_K_M de 0,5 GB permite mantener el modelo residente en memoria junto con el resto del sistema.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación, y tampoco se han encontrado en los resultados de búsqueda consultados. No se dispone de datos de latencia o throughput medidos para estas cuantizaciones concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6-1,0 GB para Q4_K_M y 0,9-1,4 GB para Q8_0, incluyendo pesos y caché KV para contextos moderados (estimación propia a partir del tamaño de los ficheros, no confirmada por el autor).
- GPU recomendadas: cualquier GPU consumer con 2 GB o más de VRAM es suficiente; RTX 3060, RTX 4060, RTX 4090 o superiores no suponen ningún cuello de botella por memoria. El modelo está pensado para ejecutarse principalmente en CPU.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU dedicada e incluso en iGPU con memoria compartida suficiente.
- Ejecución en CPU: viable y es el escenario principal; un solo núcleo moderno puede sostener generación interactiva con 0,8B parámetros.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-cli`), Ollama (`ollama run hf.co/axteam/Qwen3.5-0.8B-GGUF:Q4_K_M`), LM Studio. El modelo base, en formato Transformers, admite además vLLM, SGLang y KTransformers, pero esas rutas no aplican directamente a los ficheros GGUF de este repositorio.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Observaciones |
|---|---|---|---|---|---|
| axteam/Qwen3.5-0.8B-GGUF | 772.845.888 | no disponible | GGUF (Q8_0, Q4_K_M) | Apache-2.0 | Conversion de texto, sin codificador visual; 0 descargas, 0 likes |
| Qwen/Qwen3.5-0.8B | 772.845.888 | no disponible | safetensors (Transformers) | Apache-2.0 | Modelo original post-entrenado; incluye codificador visual; compatible con vLLM, SGLang, KTransformers |
| YoozLabs/Qwen3.5-0.8B-qat-GGUF | no disponible | no disponible | GGUF (Q4_0) | no disponible en la busqueda | Cuantizacion consciente del entrenamiento (QAT) con destilacion desde el base bf16; alternativa orientada a 4 bits de mayor calidad |
| unsloth/Qwen3.5-0.8B-GGUF | no disponible | no disponible | GGUF | no disponible en la busqueda | Publicado en ModelScope; otra conversion de la misma familia |

La diferencia principal entre las alternativas GGUF es el método de cuantizacion: axteam ofrece Q8_0 y Q4_K_M estándar, mientras que YoozLabs parte de un proceso QAT con destilación, lo que en teoría reduce la degradación en 4 bits. No hay datos públicos que permitan comparar la calidad resultante.

## Limitaciones y advertencias

- Repositorio sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el 29 de octubre de 2026. No hay evidencia de terceros sobre su correcto funcionamiento.
- Pérdida de calidad por cuantizacion: Q4_K_M reduce los pesos a 4 bits; el propio autor reconoce una "pequeña compensación de calidad" frente al original en bf16.
- Sin vision: el codificador visual del modelo base no está incluido, por lo que estos ficheros solo procesan texto. No deben usarse para tareas de imagen.
- Sin datos de contexto: se desconoce la longitud máxima de contexto soportada; el ejemplo del autor usa `-c 8192`, pero eso es un parámetro de llama.cpp, no una especificación del modelo.
- Idiomas no declarados: la model card de este repositorio no enumera idiomas soportados; la naturaleza multilingüe se infiere de fuentes externas sobre la serie, no de documentación del derivado.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad ni de tasas de alucinación para este modelo ni para su base; en un modelo de 0,8B el riesgo es estructuralmente alto.
- Sesgos: no hay información sobre evaluación de sesgos en la documentación disponible.
- Tool calling y agentes: no confirmados; si se necesitan, deben validarse empíricamente antes de diseñar una arquitectura basada en ellos.
- Licencia: Apache-2.0 permite uso comercial y modificaciones, pero los pesos originales y el tokenizador pertenecen al equipo Qwen; conviene conservar los avisos de atribución.
- Fechas del repositorio: la fecha de creación (2026) es posterior a la de la mayoría de herramientas citadas; verificar la compatibilidad con la versión de llama.cpp u Ollama instalada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/axteam/Qwen3.5-0.8B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B/blob/main/LICENSE
- Qwen3.5-0.8B en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_5_0_8b
- Conversion GGUF de unsloth en ModelScope: https://www.modelscope.cn/models/unsloth/Qwen3.5-0.8B-GGUF/summary
- Ficha en local-ai-zone: https://local-ai-zone.github.io/models/qwen3-5-0-8b.html
- Cuantizacion QAT alternativa de YoozLabs: https://huggingface.co/YoozLabs/Qwen3.5-0.8B-qat-GGUF

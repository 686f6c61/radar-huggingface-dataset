# mradermacher/Ornith-1.0-35B-abliterix-i1-GGUF

## Resumen

Ornith-1.0-35B-abliterix-i1-GGUF es una cuantización GGUF del modelo Ornith-1.0-35B-abliterix, una variante abliterizada del modelo MoE Ornith-1.0-35B desarrollado por DeepReinforce (ornith-ai). El modelo original forma parte de una familia que incluye versiones densas de 9B y MoE de 35B y 397B, todas con una ventana de contexto de 262.144 tokens y soporte para tool calling compatible con OpenAI. La abliteración (abliterix) elimina los mecanismos de rechazo del modelo, permitiendo respuestas sin restricciones de seguridad, lo que lo hace atractivo para tareas de agentic coding y generación de código en entornos donde se requiere máxima flexibilidad.

Esta versión concreta, publicada por mradermacher, ofrece únicamente un cuantizado i1-Q2_K de 13 GB, pensado para ejecutarse en hardware de consumo. El modelo base está licenciado bajo Apache 2.0 y soporta inglés y chino. Al ser una cuantización de baja precisión, sacrifica algo de calidad a cambio de poder ejecutarse en GPUs con 16 GB de VRAM o menos, lo que lo hace accesible para desarrolladores que quieran probar el modelo localmente sin necesidad de un clúster.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) basada en Qwen3.5 |
| Parametros totales | 34.660.610.688 (~34,66B) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantizacion | i1-Q2_K (único en este repo); el autor ofrece otros quants (Q2_K, IQ3_M, Q4_K_S, etc.) en el repositorio estático |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.0-35B es un transformer con arquitectura de mezcla de expertos (MoE), derivado de la familia Qwen3.5. Según la documentación oficial, fue post-entrenado con un enfoque de *self-scaffolding reinforcement learning* orientado a agentic coding, lo que le permite planificar y ejecutar tareas de programación de forma autónoma. La versión abliterizada (abliterix) aplica una técnica de ablación sobre las capas de rechazo, eliminando la tendencia del modelo a negarse a responder a ciertas instrucciones. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO en esta variante concreta.

## Capacidades

- Generación de texto y razonamiento complejo en inglés y chino.
- Soporte de tool calling y function calling compatible con la API de OpenAI, lo que permite integrarlo en agentes y pipelines automatizados.
- Capacidad para tareas de agentic coding: planificación, generación y depuración de código en múltiples lenguajes.
- Ventana de contexto de 262.144 tokens, adecuada para documentos largos, repositorios completos o conversaciones multi-turno extensas.
- Al ser una versión abliterizada, no presenta rechazo ante instrucciones que otros modelos podrían bloquear (por ejemplo, generación de contenido sensible).
- El modelo base podría tener capacidades de visión (la model card menciona que es un "vision model"), pero no se incluyen archivos mmproj en este repositorio, por lo que no se puede confirmar su funcionamiento en esta cuantización.

## Casos de uso

- **Asistente de programación autónomo**: el modelo puede recibir una descripción de una tarea de desarrollo, generar el código necesario, ejecutarlo y corregir errores de forma iterativa, gracias a su entrenamiento con *self-scaffolding RL* y su soporte de tool calling.
- **Integración en pipelines de CI/CD**: al exponer una interfaz compatible con OpenAI, puede conectarse a herramientas como GitHub Actions o Jenkins para revisar código, generar tests o automatizar la documentación.
- **Atención al cliente multilingüe**: con 262K de contexto, puede mantener conversaciones largas y coherentes en inglés y chino, gestionando historiales completos de interacción sin perder el hilo.
- **Análisis de documentos extensos**: su ventana de contexto permite procesar contratos, informes o manuales técnicos completos en una sola pasada, extrayendo información o resumiendo contenido.
- **Generación de contenido creativo sin restricciones**: al estar abliterizado, puede producir textos sobre temas que otros modelos rechazarían, útil para investigación en narrativa o experimentación creativa.
- **Prototipado rápido de agentes**: desarrolladores pueden desplegarlo localmente con llama.cpp o Ollama para probar flujos de agente con tool calling antes de escalar a modelos más grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El sitio oficial de Ornith menciona que el modelo 35B destaca en tareas de coding, pero no se proporcionan cifras concretas en los fragmentos consultados. Tampoco hay datos de rendimiento específicos para la cuantización Q2_K.

## Requisitos de hardware

- El archivo GGUF i1-Q2_K ocupa 13,0 GB, por lo que se necesita al menos 14-16 GB de VRAM para cargarlo en memoria (considerando overhead de contexto y activaciones).
- GPU recomendadas: RTX 4090 (24 GB), RTX 4080 (16 GB), o GPUs de datacenter como A10G o L4. En una RTX 3090 (24 GB) también cabría con margen.
- No es recomendable para GPUs con menos de 12 GB de VRAM, ya que el contexto largo (256K) incrementa el uso de memoria.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, o servidores compatibles con GGUF como llama-cpp-python. También puede usarse con vLLM si se convierte a otro formato, aunque no es el flujo habitual.
- La latencia dependerá del hardware; en una RTX 4090 se puede esperar una generación de 10-20 tokens por segundo con este cuantizado, pero no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con otros modelos de la misma categoría. El modelo pertenece a la familia Ornith-1.0, que incluye versiones de 9B, 35B y 397B, pero no se han encontrado benchmarks públicos que permitan compararlo con alternativas como Qwen2.5-32B-Instruct o Mixtral-8x7B. Se recomienda consultar el sitio oficial de Ornith para obtener datos de rendimiento actualizados.

## Limitaciones y advertencias

- La abliteración elimina los mecanismos de rechazo, lo que puede generar respuestas inapropiadas, ofensivas o peligrosas si se usa sin supervisión. No es adecuado para aplicaciones orientadas al público general sin filtros adicionales.
- La cuantización Q2_K es de muy baja precisión; puede degradar significativamente la calidad de las respuestas, especialmente en tareas de razonamiento complejo o generación de código largo.
- El modelo solo soporta inglés y chino; no se garantiza un buen rendimiento en otros idiomas.
- La licencia del modelo base es Apache 2.0 según la model card de HuggingFace, aunque el sitio oficial de Ornith indica MIT. Esta discrepancia debe aclararse antes de un uso comercial.
- No se incluyen archivos de proyección multimodal (mmproj) en este repositorio, por lo que las capacidades de visión del modelo base no están disponibles en esta cuantización.
- El contexto de 262K tokens es teórico; en la práctica, con Q2_K y hardware de consumo, el uso de ventanas muy largas puede provocar agotamiento de memoria o latencias elevadas.

## Enlaces

- Repositorio HuggingFace de esta cuantización: https://huggingface.co/mradermacher/Ornith-1.0-35B-abliterix-i1-GGUF
- Repositorio estático con otros quants: https://huggingface.co/mradermacher/Ornith-1.0-35B-abliterix-GGUF
- Modelo base original: https://huggingface.co/inkOrCloud/Ornith-1.0-35B-abliterix
- Sitio oficial de Ornith: https://ornith.site/
- Repositorio GitHub de Ornith-1: https://github.com/ornith-ai/Ornith-1
- Página de referencia en LLM Reference: https://www.llmreference.com/model/ornith-1.0-35b

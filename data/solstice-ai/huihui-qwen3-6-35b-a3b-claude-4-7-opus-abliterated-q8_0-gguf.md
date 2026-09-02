# Solstice-AI/Huihui-Qwen3.6-35B-A3B-Claude-4.7-Opus-abliterated-Q8_0-GGUF

## Resumen

El modelo **Solstice-AI/Huihui-Qwen3.6-35B-A3B-Claude-4.7-Opus-abliterated-Q8_0-GGUF** es una cuantización GGUF en Q8_0 de un modelo de mezcla de expertos (MoE) derivado de Qwen 3.6, con 34.660.610.688 parámetros totales y 3.100 millones de parámetros activos por token. Ha sido destilado con Claude 4.7 Opus mediante scratchpads de cadena de pensamiento multi-turno y posteriormente sometido a un proceso de *abliteration* que elimina los mecanismos de rechazo de contenido. El resultado es un modelo de texto generativo con una ventana de contexto de 131.072 tokens, orientado a razonamiento y generación de código, distribuido bajo licencia Apache 2.0.

La relevancia de este modelo radica en su doble naturaleza: por un lado, hereda la arquitectura eficiente de Qwen 3.6 (MoE con solo 3.1B activos), lo que permite inferencia con requisitos de cómputo relativamente bajos para su tamaño total; por otro, la destilación con Claude 4.7 Opus busca mejorar las capacidades de razonamiento complejo, mientras que la abliteración elimina las restricciones de seguridad, lo que lo hace útil para investigación en IA sin censura, pero también plantea riesgos importantes en entornos de producción.

El modelo se distribuye únicamente en formato GGUF con cuantización Q8_0 (8.50 bits por peso), ocupando 36.9 GB. Está pensado para ejecutarse con el motor Anvil o con llama.cpp, y es compatible con la API de OpenAI mediante el servidor integrado. Los idiomas soportados son inglés y chino.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) basada en Qwen 3.6 |
| Parametros totales | 34.660.610.688 (el autor declara 35.2B) |
| Parametros activos | 3.100.000.000 (3.1B por token) |
| Longitud de contexto | 131.072 tokens (2^17) |
| Tipos de cuantizacion | Q8_0 (8.50 bpw) |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo es una variante de Qwen 3.6 con arquitectura de mezcla de expertos (MoE) dispersa: de los 34.66B parámetros totales, solo 3.1B se activan por token, lo que reduce significativamente el coste computacional por inferencia en comparación con un modelo denso del mismo tamaño. La ventana de contexto alcanza 131.072 tokens, lo que permite procesar documentos extensos o conversaciones de largo recorrido.

El entrenamiento combina dos fases diferenciadas. Primero, una destilación a partir de Claude 4.7 Opus, utilizando scratchpads de cadena de pensamiento (CoT) en interacciones multi-turno, con el objetivo de transferir las capacidades de razonamiento del modelo propietario al modelo abierto. Segundo, un proceso de *abliteration* que modifica los pesos del modelo para eliminar los patrones de rechazo de contenido, de modo que el modelo responda a solicitudes que normalmente serían bloqueadas por los guardarraíles de seguridad. No se han publicado detalles sobre el volumen de datos de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO.

## Capacidades

- Generación de texto en inglés y chino, con fluidez y coherencia en tareas de razonamiento, explicación y redacción.
- Razonamiento complejo y resolución de problemas matemáticos, potenciado por la destilación con Claude 4.7 Opus.
- Generación de código en múltiples lenguajes de programación, heredada de la base Qwen 3.6.
- Procesamiento de contextos largos de hasta 131.072 tokens, adecuado para análisis de documentos extensos o conversaciones multi-turno.
- Capacidad de seguir instrucciones y mantener el hilo en diálogos largos gracias al entrenamiento multi-turno.
- Al estar abliterado, no aplica filtros de contenido ni rechaza solicitudes sobre temas sensibles, lo que amplía el rango de respuestas posibles (con los riesgos asociados).
- No se especifica en la documentación si soporta tool calling o function calling; al derivar de Qwen 3.6 es probable que herede dicha capacidad, pero no está confirmado.

## Casos de uso

- **Generación de código en entornos de desarrollo sin restricciones**: el modelo puede producir fragmentos de código, explicar algoritmos o depurar errores en proyectos donde no se requieren filtros de contenido. Su ventana de 131K tokens permite procesar repositorios completos o archivos de gran tamaño.
- **Razonamiento matemático y resolución de problemas**: gracias a la destilación con Claude 4.7 Opus, es adecuado para tareas de demostración de teoremas, cálculo simbólico o resolución de problemas de nivel universitario, donde la cadena de pensamiento multi-turno mejora la precisión.
- **Análisis de documentos extensos**: con 131K tokens de contexto, puede resumir informes, extraer conclusiones o responder preguntas sobre manuales técnicos, artículos de investigación o contratos legales completos.
- **Investigación en IA sin censura**: el modelo abliterado es útil para estudiar el comportamiento de modelos sin guardarraíles, analizar sesgos latentes o explorar técnicas de alineación y desalineación en entornos académicos controlados.
- **Creación de contenido creativo**: puede redactar ficción, guiones, diálogos o material de marketing sin las restricciones habituales de los modelos alineados, lo que resulta atractivo para escritores que necesitan explorar temas controvertidos.
- **Desarrollo de agentes conversacionales especializados**: en dominios como soporte técnico avanzado o tutoría personalizada, el modelo puede mantener conversaciones largas y coherentes, aunque se debe evaluar cuidadosamente el riesgo de respuestas inapropiadas antes de desplegarlo en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que la cuantización Q8_0 preserva el 99.9% del rendimiento de razonamiento en FP16, pero no se aportan cifras concretas de MMLU, HumanEval, GSM8K u otras pruebas estandarizadas.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el archivo GGUF Q8_0 ocupa 36.9 GB. Para cargar el modelo completo en GPU se necesitan al menos 40 GB de VRAM (considerando overhead de contexto y buffers). Con offloading parcial a CPU, se puede ejecutar con menos VRAM, pero la latencia aumenta.
- **GPU recomendadas**: NVIDIA A100 80GB, H100 80GB, A6000 48GB, RTX 6000 Ada 48GB. También es viable en configuraciones multi-GPU con 2x RTX 3090/4090 (24GB cada una) usando reparto de capas.
- **Compatibilidad con GPU de consumo**: no cabe en una sola GPU de consumo (RTX 4090 tiene 24GB). Se puede ejecutar con cuantizaciones más bajas (si se generan) o con offloading a RAM, pero no es recomendable para uso interactivo.
- **Opciones de despliegue**: llama.cpp, Anvil Runtime (motor recomendado por el autor), Ollama (si se convierte a formato compatible), y servidores OpenAI-compatibles como el integrado en Anvil (`anvil serve`).
- **Latencia y throughput**: no se han publicado datos. Como referencia orientativa, un MoE con 3.1B activos en una A100 80GB podría alcanzar decenas de tokens por segundo, pero depende del hardware, el tamaño del contexto y la configuración de decodificación.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Qwen3.6-35B-A3B (original) | ~35B | 3.1B | 131K | Apache 2.0 | safetensors | Modelo base sin destilación ni abliteración |
| Huihui-Qwen3.6-35B-A3B-abliterated | ~35B | 3.1B | 131K | Apache 2.0 | safetensors | Versión abliterada sin destilación Claude |
| Huihui-Qwen3.6-35B-A3B-Claude-4.7-Opus-abliterated-FP8 | ~35B | 3.1B | 131K | Apache 2.0 | FP8 | Misma destilación y abliteración, cuantización FP8 |
| Este modelo (Q8_0 GGUF) | 34.66B | 3.1B | 131K | Apache 2.0 | GGUF Q8_0 | Cuantización Q8_0 del modelo destilado y abliterado |

La comparativa se basa en los datos disponibles; no hay resultados de benchmarks públicos que permitan comparar el rendimiento real entre estas variantes.

## Limitaciones y advertencias

- **Abliteración**: el modelo ha sido modificado para eliminar los mecanismos de rechazo de contenido. Puede generar respuestas ofensivas, ilegales, peligrosas o sexualmente explícitas sin aviso previo. No es apto para uso directo en aplicaciones orientadas al público general.
- **Sesgos y alucinaciones**: al igual que otros modelos de lenguaje, puede inventar información, reproducir sesgos presentes en los datos de entrenamiento o mostrar inconsistencias en tareas de razonamiento complejo. La destilación con Claude no elimina estos riesgos.
- **Idiomas limitados**: solo se garantiza soporte para inglés y chino. El rendimiento en otros idiomas puede ser deficiente o impredecible.
- **Licencia y uso comercial**: la licencia Apache 2.0 permite uso comercial, pero el usuario asume toda la responsabilidad legal y ética por el contenido generado. No hay garantías de seguridad ni soporte oficial.
- **Falta de documentación**: no se han publicado detalles sobre el dataset de entrenamiento, el proceso de destilación ni los benchmarks. Esto dificulta la evaluación objetiva del modelo antes de su adopción.
- **Requisitos de hardware elevados**: aunque los parámetros activos son solo 3.1B, el archivo Q8_0 de 36.9 GB exige GPUs profesionales o configuraciones multi-GPU, lo que limita su despliegue en entornos con recursos modestos.

## Enlaces

- [Modelo en HuggingFace (Solstice-AI)](https://huggingface.co/Solstice-AI/Huihui-Qwen3.6-35B-A3B-Claude-4.7-Opus-abliterated-Q8_0-GGUF)
- [Modelo original de huihui-ai (safetensors)](https://huggingface.co/huihui-ai/Huihui-Qwen3.6-35B-A3B-Claude-4.7-Opus-abliterated)
- [Versión abliterada sin destilación (huihui-ai)](https://huggingface.co/huihui-ai/Huihui-Qwen3.6-35B-A3B-abliterated)
- [Ficha en dev.co](https://dev.co/ai/llms/huihui-qwen3-6-35b-a3b-claude-4-7-opus-abliterated)
- [Versión FP8 en ModelScope](https://www.modelscope.cn/models/chuanSir/Huihui-Qwen3.6-35B-A3B-Claude-4.7-Opus-abliterated-FP8)
- [Página en FriendliAI](https://friendli.ai/models/huihui-ai/Huihui-Qwen3.6-35B-A3B-abliterated)
- [Repositorio de Anvil Runtime](https://github.com/Solstice-Labs/anvil)

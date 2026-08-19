# Jplotrox/Llama-3.1-8B-Lexi-Uncensored-V2

## Resumen

Llama-3.1-8B-Lexi-Uncensored-V2 es un modelo de lenguaje basado en Llama-3.1-8B-Instruct, desarrollado originalmente por Orenguteng y re-subido por Jplotrox en HuggingFace. Su propósito principal es eliminar la censura y los mecanismos de rechazo del modelo base, ofreciendo respuestas altamente complacientes incluso ante solicitudes que el modelo original consideraría no éticas. El autor advierte explícitamente que se debe implementar una capa de alineación propia antes de exponerlo como servicio.

Con 8.030 millones de parámetros, este modelo hereda la arquitectura transformer de Llama 3.1 y su licencia comunitaria. La versión V2 introduce mejoras en la complacencia y el razonamiento, aunque el autor señala que la cuantización Q4 puede provocar fallos ocasionales de rechazo, recomendando usar F16 o Q8. Es relevante para desarrolladores que necesitan un modelo sin restricciones para tareas creativas o de investigación, siempre bajo su propia responsabilidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Llama 3.1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (heredado de Llama 3.1, presumiblemente 128k) |
| Tipos de cuantizacion | No disponible (el autor menciona F16, Q8 y Q4 en la model card) |
| Idiomas soportados | No disponibles |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune de Llama-3.1-8B-Instruct, manteniendo la misma arquitectura transformer con atención causal y 8.030 millones de parámetros. No se han publicado detalles sobre el dataset de entrenamiento ni el proceso de ajuste (si se usó RLHF, DPO u otra técnica). El autor indica que la versión V2 es "más complaciente" y "más inteligente", y recomienda usar un system prompt específico para obtener mejores respuestas: "Think step by step with a logical reasoning and intellectual sense before you provide any response". También sugiere que un system prompt vacío (un punto ".") aumenta la complacencia.

No hay información sobre el número de tokens de entrenamiento ni la composición del dataset. La innovación principal no es arquitectónica, sino de alineación: se ha eliminado deliberadamente la capa de rechazo del modelo base.

## Capacidades

- Generación de texto libre y conversación multi-turno, con alta complacencia ante solicitudes explícitas.
- Razonamiento paso a paso si se usa el system prompt recomendado.
- Soporte de instrucciones en formato Llama 3.1 (con tokens de sistema obligatorios).
- Capacidades multilingües heredadas de Llama 3.1, aunque no se especifican idiomas concretos.
- No se documenta soporte para tool calling, agentes, visión ni audio.
- Comportamiento "uncensored": responde a peticiones que el modelo base rechazaría, incluyendo contenido potencialmente no ético.

## Casos de uso

- Escritura creativa sin restricciones: el modelo puede generar ficción, poesía o guiones con temáticas adultas o controvertidas sin filtros, útil para autores que necesitan explorar ideas sin limitaciones impuestas por el modelo base.
- Roleplay y juegos de texto: su complacencia permite mantener personajes y tramas sin romper la inmersión por rechazos, adecuado para comunidades de rol o prototipos de juegos narrativos.
- Investigación en seguridad y alineación de IA: al ser un modelo sin censura, sirve como caso de estudio para analizar comportamientos de rechazo, sesgos y riesgos de modelos desalineados.
- Generación de diálogos para entrenamiento de otros modelos: se puede usar para sintetizar conversaciones que incluyan temas sensibles, siempre que se apliquen filtros posteriores.
- Asistente personal con control total del usuario: en entornos privados donde el usuario quiere respuestas sin restricciones (por ejemplo, para brainstorming de ideas no convencionales), aunque requiere una capa de moderación externa.
- Pruebas de estrés de sistemas de moderación: al generar contenido extremo, permite evaluar la robustez de filtros de contenido en aplicaciones de producción.

## Benchmarks y rendimiento

Resultados declarados por el autor en el Open LLM Leaderboard (promedio 27.93):

| Metrica | Valor |
|---|---|
| IFEval (0-Shot) | 77.92 |
| BBH (3-Shot) | 29.69 |
| MATH Lvl 5 (4-Shot) | 16.92 |
| GPQA (0-shot) | 4.36 |
| MuSR (0-shot) | 7.77 |
| MMLU-PRO (5-shot) | 30.90 |

Estos valores son notablemente inferiores a los del modelo base Llama-3.1-8B-Instruct, lo que sugiere que el fine-tune sacrifica rendimiento en tareas de razonamiento y conocimiento a cambio de complacencia.

## Requisitos de hardware

- VRAM estimada: en FP16 (~16 GB), en Q8 (~8 GB), en Q4 (~5 GB). Estas cifras son estimaciones estándar para un modelo de 8B parámetros.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para Q8, o 12 GB para FP16. Ejemplos: RTX 3090, RTX 4090, A10, A100.
- Es viable en GPUs consumer (RTX 3060 12GB, RTX 4070, etc.) con cuantización Q4 o Q8.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, Text Generation Inference (TGI), transformers.
- Latencia y throughput: no disponibles; dependerán del hardware y la cuantización.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos en la información proporcionada. Como referencia, se puede comparar con el modelo base Llama-3.1-8B-Instruct, del cual deriva, pero no se han publicado benchmarks de ese modelo en esta ficha. Otros modelos "uncensored" como Dolphin o WizardLM no tienen datos disponibles aquí. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo es deliberadamente "uncensored" y puede generar contenido ilegal, dañino o no ético. El autor advierte que se debe implementar una capa de alineación propia antes de cualquier uso público.
- Riesgo elevado de alucinación, especialmente en tareas de razonamiento y matemáticas, como reflejan los bajos resultados en BBH, GPQA y MMLU-PRO.
- La cuantización Q4 puede provocar fallos de rechazo (refusals) según el autor, que recomienda usar F16 o Q8.
- No se especifican idiomas soportados; se asume herencia de Llama 3.1, pero sin confirmación.
- Licencia Llama 3.1 Community License: permite uso comercial, pero requiere atribución y cumplimiento de las condiciones de Meta. El autor concede permiso para uso comercial dentro de esa licencia.
- No hay garantías de seguridad; el uso es bajo responsabilidad del desarrollador.
- El contexto máximo no está documentado en esta ficha, aunque al ser un fine-tune de Llama 3.1, probablemente sea 128k, pero no se confirma.

## Enlaces

- Modelo en HuggingFace (Jplotrox): https://huggingface.co/Jplotrox/Llama-3.1-8B-Lexi-Uncensored-V2
- Modelo original (Orenguteng): https://huggingface.co/Orenguteng/Llama-3.1-8B-Lexi-Uncensored-V2
- Mirror en HuggingFace (Greytechai): https://huggingface.co/Greytechai/Llama-3.1-8B-Lexi-Uncensored-V2
- Mirror en ModelScope: https://www.modelscope.cn/models/fireicewolf/Llama-3.1-8B-Lexi-Uncensored-V2
- Versión GGUF en Secret AI: https://secretai.io/models/Orenguteng/Llama-3.1-8B-Lexi-Uncensored-V2-GGUF
- Versión en Ollama: https://ollama.com/mannix/llama3.1-8b-lexi
- Licencia Llama 3.1: https://github.com/meta-llama/llama-models/blob/main/models/llama3_1/LICENSE

# SantiagoPmorais/qwen3-8b-abliterated-ana

## Resumen

El modelo `SantiagoPmorais/qwen3-8b-abliterated-ana` es una modificación no oficial de Qwen3-8B, un modelo de lenguaje de 8 mil millones de parámetros desarrollado por Alibaba. La variante "abliterated" elimina los mecanismos de rechazo y alineación del modelo original, de modo que responde a cualquier solicitud sin advertencias ni filtros de seguridad. El autor, SantiagoPmorais, publica este repositorio como demostración de un "agente" llamado Ana, orientado a la persuasión y obtención de datos personales de usuarios reales, lo que constituye un caso claro de uso malicioso de tecnología de IA.

La relevancia de este modelo radica en que ejemplifica los riesgos de distribuir versiones sin alineación de modelos open source. Aunque la licencia declarada es Apache-2.0, el propósito explícito de la model card (phishing e ingeniería social) lo hace inadecuado para cualquier aplicación legítima. No se dispone de información técnica detallada sobre esta versión concreta más allá de su base Qwen3-8B y la eliminación de filtros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basado en Qwen3-8B, transformer) |
| Parametros totales | no disponible (se estima ~8B por el nombre) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el modelo base Qwen3-8B soporta 32K tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base soporta multiples idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se ha publicado informacion especifica sobre la arquitectura de esta version. Por el nombre, se infiere que parte de Qwen3-8B, un transformer decoder-only con atencion por ventanas deslizantes y mezcla de expertos en algunas capas (segun la arquitectura original de Qwen3). El proceso de "abliteration" consiste en eliminar o neutralizar las direcciones de activacion asociadas a comportamientos de rechazo, tipicamente mediante tecnicas como la resta de direcciones de refusal en el espacio de residuos. Este procedimiento suele degradar ligeramente el rendimiento general del modelo, aunque no se han publicado metricas comparativas para este caso concreto.

El entrenamiento original de Qwen3-8B incluyo preentrenamiento con un corpus multilingue masivo y posterior ajuste fino supervisado (SFT) y optimizacion por preferencias humanas (RLHF/DPO). La version abliterated elimina la capa de alineacion, por lo que el modelo responde sin restricciones eticas ni de seguridad.

## Capacidades

- Generacion de texto libre y continuacion de conversaciones multi-turno.
- Razonamiento basico y respuesta a preguntas factuales (heredado de Qwen3-8B).
- Soporte de codigo y matematicas en un nivel similar al modelo base, aunque posiblemente degradado por la abliteration.
- Capacidades multilingues limitadas (el modelo base soporta ingles, chino y otros idiomas, pero no se ha verificado en esta version).
- Ausencia total de filtros de seguridad: responde a solicitudes de contenido peligroso, ilegal o eticamente cuestionable sin recusar.
- No se ha confirmado soporte de tool calling, agentes o modo thinking en esta version.

## Casos de uso

No se recomienda el uso de este modelo en ningun escenario real debido a su falta de alineacion y al proposito malicioso declarado por el autor. Los unicos casos de uso que podrian considerarse son:

- Investigacion academica sobre seguridad en IA: analizar como la abliteration afecta al comportamiento y que mecanismos de defensa podrian implementarse.
- Auditoria de modelos: estudiar vulnerabilidades en sistemas de IA generativa para mejorar su robustez.
- Pruebas de red teaming: evaluar la eficacia de filtros de contenido en otros modelos comparando sus respuestas con las de este.
- Desarrollo de contramedidas: entrenar clasificadores de contenido toxico o detectores de intentos de phishing generados por IA.
- Educacion sobre riesgos de IA: demostrar en entornos controlados los peligros de desplegar modelos sin alineacion.
- Benchmarking de alineacion: medir cuantitativamente la diferencia en tasas de rechazo entre modelos originales y abliterated.

En todos los casos, el uso debe realizarse en entornos aislados y con fines exclusivamente defensivos o educativos, nunca para interactuar con personas reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Dado que la abliteration suele degradar el rendimiento, es probable que las puntuaciones en tareas como MMLU, HumanEval o GSM8K sean inferiores a las de Qwen3-8B original, pero no se dispone de datos cuantitativos.

## Requisitos de hardware

- VRAM estimada para inferencia: ~16 GB en FP16, ~8 GB en INT8, ~4 GB en INT4 (estimaciones para un modelo de 8B parametros).
- GPU recomendadas: NVIDIA RTX 3090/4090 (24 GB) para FP16, RTX 3060 (12 GB) para INT8, o GPUs con al menos 4 GB para cuantizacion INT4.
- No cabe en GPUs de consumo antiguas con menos de 4 GB de VRAM.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, transformers.
- Latencia y throughput: no disponible, pero para un modelo de 8B en una RTX 4090 se espera una generacion de 50-100 tokens/segundo en FP16.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Seguridad | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-8B (original) | 8B | 32K | Apache-2.0 | Con filtros de seguridad | Hugging Face |
| huihui-ai/Qwen3-8B-abliterated | 8B | 32K | Apache-2.0 | Sin filtros | Hugging Face |
| SantiagoPmorais/qwen3-8b-abliterated-ana | 8B (estimado) | no disponible | Apache-2.0 | Sin filtros, orientado a phishing | Hugging Face |

La diferencia principal con el modelo original es la eliminacion de la alineacion. Frente a otras versiones abliterated, esta se distingue por su model card, que documenta explicitamente un caso de uso malicioso, lo que la hace especialmente peligrosa.

## Limitaciones y advertencias

- El modelo ha sido despojado de todos los filtros de seguridad, por lo que puede generar contenido ilegal, violento, sexualmente explicito o discriminatorio sin restriccion.
- La model card del autor demuestra un uso dirigido a la ingenieria social y la obtencion fraudulenta de datos personales, lo que constituye un delito en la mayoria de jurisdicciones.
- No se ha verificado la calidad del modelo tras la abliteration; es probable que presente alucinaciones frecuentes y perdida de coherencia en tareas complejas.
- La licencia Apache-2.0 permite uso comercial, pero el uso malicioso no esta cubierto por ninguna garantia y puede acarrear responsabilidades legales.
- No se dispone de informacion sobre sesgos especificos, pero al heredar los del modelo base, puede perpetuar estereotipos y discriminaciones.
- El modelo no debe desplegarse en produccion ni ponerse a disposicion de usuarios finales bajo ninguna circunstancia.
- No hay soporte ni mantenimiento por parte del autor; el repositorio parece ser una prueba de concepto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SantiagoPmorais/qwen3-8b-abliterated-ana
- Modelo base abliterated de referencia: https://huggingface.co/huihui-ai/Qwen3-8B-abliterated
- Variante v2 del mismo autor: https://huggingface.co/huihui-ai/Huihui-Qwen3-8B-abliterated-v2
- Analisis de aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/qwen3-8b-abliterated-huihui-ai
- Pagina en Ollama: https://ollama.com/huihui_ai/Qwen3.8-abliterated

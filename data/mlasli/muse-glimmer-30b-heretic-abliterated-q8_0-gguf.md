# mlasli/Muse-Glimmer-30B-Heretic-Abliterated-Q8_0-GGUF

## Resumen

Muse Glimmer 30B Heretic Abliterated es una versión modificada del modelo base `meta-models/Muse-Glimmer-30B`, publicada por el usuario mlasli en formato GGUF Q8_0. El modelo ha sido sometido a una técnica de "abliteration" (eliminación de direcciones de rechazo) utilizando la herramienta Heretic, con el objetivo de reducir drásticamente las negativas del modelo ante peticiones consideradas dañinas o incómodas, manteniendo una baja divergencia de Kullback-Leibler respecto al original. El resultado es un modelo de 27.854 millones de parámetros (~27,85B) que responde con una tasa de rechazo del 6,5% frente al 29% de la versión anterior, posicionándose como una opción "sin censura" para generación de texto conversacional.

La relevancia de este modelo radica en su utilidad para aplicaciones que requieren una menor restricción en las respuestas, como escritura creativa, roleplay o asistentes conversacionales con temáticas sensibles. Al estar cuantizado en Q8_0, ofrece una calidad casi sin pérdidas respecto al BF16 original, con un tamaño de archivo de aproximadamente 28 GB. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, aunque se debe considerar el riesgo de generar contenido inapropiado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 27.854.794.240 (~27,85B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (GGUF) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q8_0) |

## Arquitectura y entrenamiento

La arquitectura exacta del modelo base `Muse-Glimmer-30B` no se detalla en la información disponible. Se trata de un modelo de 27,85B parámetros orientado a generación de texto, probablemente basado en un transformer denso, aunque no se confirma. El proceso de abliteration aplicado por mlasli consiste en:

1. Calcular direcciones de rechazo a partir de los datasets `mlabonne/harmful_behaviors` y `mlabonne/harmless_alpaca`.
2. Optimizar mediante 500 pruebas de Optuna, buscando minimizar la tasa de rechazo y la divergencia KL respecto al modelo original.
3. Seleccionar la mejor prueba (Trial 445, con 6,5% de rechazos y KL=0,076) y aplicarla mediante adaptadores LoRA.
4. Fusionar los pesos LoRA con el modelo base y convertir el resultado a formato GGUF Q8_0 usando `convert_hf_to_gguf.py` y `llama-quantize` de llama.cpp.

No se proporcionan datos sobre el entrenamiento original del modelo base (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO), por lo que estos aspectos quedan fuera del alcance de esta ficha.

## Capacidades

- Generación de texto en inglés con fluidez y coherencia, adecuada para conversaciones multi-turno.
- Reducción significativa de rechazos ante peticiones "dañinas" o controvertidas (tasa de rechazo del 6,5% frente al 29% de la v1), lo que lo hace útil para escenarios donde se requiere una respuesta sin filtros.
- Baja divergencia KL (0,076) respecto al modelo original, indicando que las respuestas se mantienen cercanas a las del modelo base en términos de distribución de probabilidad.
- Compatible con pipelines de inferencia estándar de llama.cpp y Ollama, permitiendo integración en entornos locales o de servidor.
- Soporte para offloading parcial de VRAM (12-24 GB recomendado), lo que facilita su ejecución en GPUs de consumo con suficiente memoria.

## Casos de uso

- Generación de ficción y narrativa creativa: el modelo puede producir historias, diálogos y descripciones sin las restricciones habituales de los modelos alineados, ideal para escritores que exploran temáticas oscuras o adultas.
- Roleplay y juegos de texto: su baja tasa de rechazo permite mantener interacciones inmersivas en escenarios de fantasía, ciencia ficción o drama sin interrupciones por políticas de seguridad.
- Asistentes conversacionales para comunidades específicas: puede integrarse en chatbots para foros o comunidades donde se discuten temas sensibles (salud mental, sexualidad, etc.) con un tono abierto y sin juicios.
- Generación de contenido de marketing y copywriting: al no rechazar peticiones sobre temas polémicos o provocativos, puede ayudar a redactar textos publicitarios que aborden tabúes de forma controlada.
- Desarrollo de personajes para videojuegos: los diálogos generados pueden ser más naturales y menos "censurados", mejorando la experiencia en juegos de rol.
- Investigación en IA y alineación: sirve como caso de estudio para analizar el impacto de la abliteration en el comportamiento de los modelos, permitiendo comparar respuestas antes y después del proceso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos de rendimiento corresponden a las métricas de rechazo y cumplimiento obtenidas durante el proceso de abliteration:

| Version | Refusals | Compliance | KL Divergence | Trials |
|---------|----------|------------|---------------|--------|
| v2 (actual) | 6,5% | 93,5% | 0,076 | 500 |
| v1 | 29% | 71% | 0,027 | 50 |

Estas métricas indican una reducción del 88% en la tasa de rechazo respecto a la v1, aunque con un aumento de la divergencia KL (de 0,027 a 0,076), lo que sugiere que las respuestas se alejan ligeramente más del modelo base.

## Requisitos de hardware

- RAM: aproximadamente 28 GB para cargar el modelo completo en memoria (formato Q8_0).
- VRAM: se recomienda offloading de 12-24 GB en GPU. Una GPU con 24 GB (por ejemplo, RTX 3090, RTX 4090, A5000) puede ejecutar el modelo con offloading parcial; para inferencia completamente en GPU se necesitarían 28 GB de VRAM (por ejemplo, A100 40GB o H100).
- En CPU pura, el modelo puede ejecutarse con 28 GB de RAM, aunque la latencia será considerablemente mayor.
- Opciones de despliegue: llama.cpp (línea de comandos o servidor), Ollama (mediante Modelfile), y potencialmente otros backends compatibles con GGUF como llama-cpp-python.
- Latencia y throughput estimados: no disponibles en la información proporcionada; dependerán del hardware y de la configuración de offloading.

## Comparativa con modelos similares

No se dispone de datos suficientes para comparar este modelo con alternativas de la misma categoría (otros modelos abliterados de ~30B o modelos sin censura). La información proporcionada no incluye referencias a modelos comparables, por lo que esta sección queda sin datos.

## Limitaciones y advertencias

- Idioma limitado: el modelo solo está entrenado para inglés, por lo que no es adecuado para generación en otros idiomas sin un ajuste adicional.
- Riesgo de contenido dañino: al reducir los rechazos, el modelo puede generar respuestas que inciten a la violencia, al odio o a comportamientos ilegales. Se recomienda un uso responsable y supervisado.
- Alucinaciones: como cualquier modelo de lenguaje, puede producir información falsa o inventada, especialmente en temas especializados.
- Contexto desconocido: no se especifica la longitud de contexto, lo que puede limitar su uso en tareas que requieran ventanas largas.
- Sesgos: el proceso de abliteration no elimina los sesgos inherentes del modelo base; estos pueden amplificarse al no existir mecanismos de rechazo.
- Licencia: Apache 2.0 permite uso comercial, pero el responsable del despliegue debe asumir las consecuencias legales y éticas de generar contenido no moderado.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/mlasli/Muse-Glimmer-30B-Heretic-Abliterated-Q8_0-GGUF
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Model card BF16 (metodología detallada): https://huggingface.co/mlasli/Muse-Glimmer-30B-Heretic-Abliterated-BF16
- Herramienta Heretic: https://github.com/d3nd3/heretic

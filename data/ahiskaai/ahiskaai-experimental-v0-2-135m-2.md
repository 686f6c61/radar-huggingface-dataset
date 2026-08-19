# AhiskaAI/AhiskaAI-Experimental-v0.2-135m

## Resumen

AhiskaAI-Experimental-v0.2-135M es un modelo de lenguaje pequeño (SLM) de 135 millones de parámetros, desarrollado desde cero por AhiskaAI como parte de su serie experimental. Está basado en una arquitectura Llama (LlamaForCausalLM) y fue concebido como candidato para la futura serie v0.4, pero no alcanzó los estándares de calidad necesarios para un lanzamiento estable. Por ello se publica como checkpoint experimental v0.2, con el objetivo de documentar el experimento y preservar el historial de desarrollo del proyecto.

El modelo se entrenó sobre una mezcla de aproximadamente 14 GB de datos sintéticos en turco, incluyendo texto web, matemáticas, relatos y contenido enciclopédico, procesando alrededor de 2.800 millones de tokens. Su ventana de contexto es de 2048 tokens y su licencia es Apache 2.0. La relevancia de este modelo reside en que sirve como banco de pruebas para estudiar el comportamiento de arquitecturas compactas tipo Llama con grandes volúmenes de datos sintéticos en turco, y para analizar los efectos del formato de los datos de entrenamiento en la generación del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (transformer decoder) |
| Parametros totales | ~135 millones |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Turco (tr) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (precisión bfloat16) |

Detalles adicionales de configuración: hidden size 576, intermediate size 1536, 9 cabezas de atención, 3 cabezas key/value, dimensión de cabeza 64, 33 capas, vocabulario de 32.000 tokens, activación SiLU, normalización RMSNorm, RoPE theta 10.000, weight tying deshabilitado.

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer decoder estándar tipo Llama, con normalización RMSNorm, activación SiLU y embeddings rotatorios (RoPE). No se trata de un modelo MoE ni híbrido; es un modelo denso de 135M de parámetros. El entrenamiento se realizó sobre hardware TPU v5e-8 en Kaggle durante 7,6 horas, en una etapa de pre-entrenamiento seguida de experimentos de fine-tuning supervisado.

El corpus de pre-entrenamiento consistió en una mezcla de cuatro datasets sintéticos en turco: BILGE Synthetic Web (~4 GB), BILGE Synthetic Math (~3 GB), BILGE Synthetic Stories (~6 GB) y BILGE Wiki-Tr-Plus (~1 GB), sumando aproximadamente 14 GB de datos en bruto y unos 2.800 millones de tokens procesados. Un hallazgo crítico del experimento fue que una parte significativa del corpus seguía un patrón de formato repetido con la secuencia `<s>##` al inicio de cada documento, lo que provocó que el modelo aprendiera a reproducir esa estructura en lugar de responder directamente a las instrucciones. Este comportamiento se observó con mayor intensidad en el modelo de 135M que en el de 235M, lo que sugiere que la capacidad adicional del modelo más grande ayudó a mitigar parcialmente el efecto.

## Capacidades

- Generación de texto en turco: el modelo puede producir texto coherente en turco, especialmente en estilos narrativos y de contenido web, gracias al entrenamiento con datos sintéticos variados.
- Modelado de lenguaje causal: al ser un LlamaForCausalLM, es capaz de completar secuencias y generar texto condicionado a un prompt.
- Razonamiento matemático básico: se incluyeron datos sintéticos de matemáticas en el corpus, aunque la fiabilidad en este ámbito no alcanzó el nivel esperado.
- Generación de relatos y narrativa: el entrenamiento con BILGE Synthetic Stories le confiere cierta habilidad para producir textos narrativos.
- Capacidades multilingües: no documentadas; el modelo se centra exclusivamente en turco.
- Tool calling, agentes o razonamiento multi-paso: no se han documentado ni implementado en este checkpoint experimental.

## Casos de uso

- Investigación académica sobre SLM: el modelo sirve como objeto de estudio para analizar cómo los SLM de ~135M se comportan con grandes volúmenes de datos sintéticos en un idioma de bajos recursos como el turco.
- Análisis de efectos del formato de datos: permite investigar cómo los patrones repetidos en el corpus de entrenamiento (como `<s>##`) influyen en el comportamiento generativo del modelo, un fenómeno relevante para el diseño de pipelines de pre-entrenamiento.
- Experimentación con fine-tuning: al ser un checkpoint publicado con licencia Apache 2.0, puede utilizarse como punto de partida para experimentos de fine-tuning supervisado o DPO, aunque se recomienda corregir previamente los problemas de formato.
- Evaluación de arquitecturas compactas: sirve para comparar el rendimiento de modelos pequeños tipo Llama en tareas de generación de texto en turco, frente a otras arquitecturas o tamaños.
- Prototipado de aplicaciones educativas: en entornos de enseñanza de PLN, puede emplearse para demostrar conceptos de generación de lenguaje, aunque no es apto para uso en producción.
- Estudio de alucinaciones y sesgos en modelos pequeños: el comportamiento errático del modelo, que tiende a desviarse del prompt, ofrece un caso práctico para estudiar los límites de los SLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que el modelo no alcanzó la calidad esperada en instrucciones, matemáticas o conversación, por lo que no existen métricas comparativas oficiales.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,3-0,5 GB en bfloat16 (135M parámetros × 2 bytes ≈ 270 MB de pesos, más overhead de activaciones y caché KV).
- GPU recomendadas: cualquier GPU consumer con al menos 1 GB de VRAM es suficiente; también puede ejecutarse en CPU.
- Compatibilidad con GPU consumer: sí, incluyendo GPUs de gama baja como GTX 1650, RTX 3050 o integradas.
- Opciones de despliegue: al ser un modelo HuggingFace estándar, puede cargarse con transformers, llama.cpp (si se convierte a GGUF), Ollama o vLLM, aunque su tamaño reducido lo hace apto para inferencia en CPU.
- Latencia y throughput: no se han publicado mediciones, pero dado el tamaño de 135M, la generación es rápida incluso en CPU (del orden de decenas de tokens por segundo en hardware moderno).

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con otros modelos de la misma categoría. El propio autor publica otros checkpoints experimentales (como el de 235M y el instruct v0.3), pero no se han facilitado datos comparativos de rendimiento. Se recomienda consultar la colección oficial de AhiskaAI en HuggingFace para obtener más contexto sobre la familia de modelos.

## Limitaciones y advertencias

- Comportamiento de generación anómalo: el modelo tiende a reproducir el patrón `<s>##` y a generar títulos de documentos no relacionados con el prompt, especialmente ante instrucciones simples. Esto lo hace inadecuado para tareas de conversación o respuesta a preguntas.
- Calidad insuficiente para producción: el autor declara que el checkpoint no cumple los requisitos de calidad de la serie principal v0.4, por lo que no debe emplearse en aplicaciones reales.
- Solo turco: el modelo fue entrenado exclusivamente con datos en turco; no se espera un rendimiento aceptable en otros idiomas.
- Ventana de contexto limitada: 2048 tokens, insuficiente para tareas que requieran contexto largo.
- Riesgo de alucinaciones: dado el comportamiento errático observado, es probable que el modelo genere contenido inventado o incoherente.
- Sin soporte de herramientas ni agentes: no se han implementado capacidades de tool calling ni razonamiento multi-paso.
- Naturaleza experimental: el modelo se publica únicamente con fines de investigación y documentación; no hay garantías de soporte ni mantenimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AhiskaAI/AhiskaAI-Experimental-v0.2-135m
- Colección de datasets v0.2: https://huggingface.co/collections/AhiskaAI/ahiskaai-v02-dataset
- Perfil de datasets de AhiskaAI: https://huggingface.co/AhiskaAI/datasets
- Repositorio de entrenamiento experimental v0.1: https://github.com/AhiskaAI/AhiskaAI-v0.1-Experimental-Training-code/tree/main
- Dataset BILGE Synthetic Web: https://huggingface.co/datasets/BILGEM-AI/BILGE-Synthetic-Web
- Dataset BILGE Synthetic Math: https://huggingface.co/datasets/BILGEM-AI/BILGE-Synthetic-Math
- Dataset BILGE Synthetic Stories: https://huggingface.co/datasets/BILGEM-AI/BILGE-Synthetic-Stories
- Dataset BILGE Wiki-Tr-Plus: https://huggingface.co/datasets/BILGEM-AI/BILGE-Wiki-Tr-Plus

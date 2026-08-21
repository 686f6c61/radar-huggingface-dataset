# seashyne/celestia-1.4b-moe

## Resumen

Celestia-1.4B-MoE es un modelo de lenguaje de dominio específico desarrollado por el equipo de Alenout AI (publicado bajo el usuario seashyne en HuggingFace) para orquestar flujos de trabajo creativos multimodales dentro de la plataforma Lenout, que abarca dibujo 2D, diseño, pizarras, diagramas de flujo, presentaciones, vídeo en movimiento y estudio 3D. En lugar de ser un modelo conversacional de propósito general, está diseñado para generar acciones estructuradas en un DSL propio de Lenout, lo que lo convierte en una pieza de infraestructura para automatizar tareas creativas.

Arquitectónicamente combina Multi-Head Latent Attention (MLA) de estilo DeepSeek, que comprime el caché de claves y valores reduciendo el uso de memoria en más de un 70%, con una capa dispersa DeepSeekMoE de 8 expertos enrutados más 1 experto compartido, activando solo 2 expertos por token. El modelo ha sido entrenado con GRPO (Group Relative Policy Optimization) para desarrollar razonamiento encadenado (Chain-of-Thought) nativo, y produce salidas en formato JSON dentro de etiquetas `<action_start>...</action_end>`. Su relevancia actual radica en ser un ejemplo de modelo fundacional especializado en un dominio concreto, con licencia Apache 2.0 y soporte para tailandés e inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con Multi-Head Latent Attention (MLA) y capa dispersa DeepSeekMoE (8 expertos enrutados + 1 compartido, 2 activos por token) |
| Parametros totales | no disponible (el nombre sugiere 1.4B, sin especificar si son totales o activos) |
| Parametros activos | no disponible (probablemente una fraccion de los totales, dado el diseno MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Tailandes (th), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (el ejemplo de uso carga con `trust_remote_code=True` y `torch_dtype="bfloat16"`, lo que sugiere safetensors, pero no esta confirmado) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura Transformer causal con dos innovaciones principales. Por un lado, Multi-Head Latent Attention (MLA), inspirada en DeepSeek, que comprime las claves y valores en un espacio latente de menor dimension, reduciendo el caché de atencion en más de un 70% y permitiendo ventanas de contexto más largas con el mismo presupuesto de memoria. Por otro lado, una capa de mezcla de expertos dispersa siguiendo el esquema DeepSeekMoE: 8 expertos de grano fino enrutados más un experto compartido, de los cuales solo 2 se activan por token, lo que mantiene el coste computacional por token bajo mientras se conserva una capacidad total elevada.

El entrenamiento ha incluido una fase de refuerzo con GRPO (Group Relative Policy Optimization) para fomentar el razonamiento encadenado, que se manifiesta en la generacion de planes internos dentro de etiquetas ` thinking... response`. Además, el modelo ha sido afinado para producir salidas estructuradas en el DSL de Lenout, un formato JSON envuelto en `<action_start>...</action_end>`. No se han publicado detalles sobre el volumen de datos de entrenamiento, la composicion del corpus ni el numero total de tokens procesados.

## Capacidades

- Generacion de texto causal en tailandes e ingles, con soporte nativo para razonamiento encadenado (Chain-of-Thought) mediante etiquetas especiales.
- Emision de acciones estructuradas en el DSL de Lenout, permitiendo la automatizacion de tareas creativas como creacion de tarjetas de producto, disenos, diagramas, presentaciones y contenido 3D.
- Planificacion multi-paso: el modelo puede generar un plan interno de razonamiento antes de producir la accion final, gracias al entrenamiento con GRPO.
- Integracion con el ecosistema Lenout: el modelo esta disenado para ser invocado con un prompt de sistema que especifica el modo objetivo (por ejemplo, `design`).
- Capacidad multilingue limitada a tailandes e ingles, con ejemplos de uso en tailandes en la documentacion.
- No se mencionan capacidades de tool calling generico, vision, audio ni otras modalidades fuera del DSL de Lenout.

## Casos de uso

- Generacion automatica de disenos graficos en Lenout: el modelo puede recibir una peticion en lenguaje natural (por ejemplo, "crea 3 tarjetas de producto horizontales") y emitir las acciones DSL necesarias para que la aplicacion las ejecute, ahorrando tiempo en flujos de diseno repetitivos.
- Creacion de presentaciones a partir de texto: un usuario puede describir el contenido y el modelo genera la secuencia de acciones para construir las diapositivas, incluyendo estructura, texto y elementos visuales.
- Automatizacion de diagramas de flujo y pizarras: el modelo traduce descripciones textuales de procesos en acciones de dibujo sobre el lienzo, util para documentacion tecnica y lluvia de ideas.
- Generacion de storyboards para video en movimiento: a partir de una descripcion narrativa, el modelo produce las acciones que definen escenas, transiciones y elementos animados en el modulo de video de Lenout.
- Asistente de diseno 3D: el modelo puede generar secuencias de acciones para crear o modificar objetos en el estudio 3D, facilitando la prototipado rapido sin interaccion manual.
- Automatizacion de flujos de trabajo creativos en entornos de produccion: al ser un modelo de dominio especifico con salida estructurada, puede integrarse en pipelines que conecten Lenout con otras herramientas, permitiendo la generacion de contenido a escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar que permitan comparar el rendimiento del modelo con alternativas.

## Requisitos de hardware

- VRAM estimada: al ser un modelo MoE de aproximadamente 1.4B de parametros totales con solo 2 expertos activos por token, la huella de memoria en inferencia es reducida. Con cuantizacion de 8 bits, podria caber en GPUs con 4-6 GB de VRAM; en bfloat16, se estima un uso de 3-4 GB para los pesos activos, aunque el tamaño exacto depende de los parametros totales no publicados.
- GPU recomendadas: cualquier GPU consumer moderna con al menos 6 GB de VRAM (por ejemplo, RTX 3060, RTX 4060) deberia ser suficiente para inferencia local. Para despliegue concurrente, una A100 o H100 ofreceria mayor throughput.
- Compatibilidad con consumer GPU: si, dado el tamaño reducido, es viable en GPUs de gama media.
- Opciones de despliegue: el ejemplo oficial usa `transformers` con `trust_remote_code=True`, por lo que es compatible con el ecosistema HuggingFace. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, pero al ser un modelo causal estandar podria adaptarse.
- Latencia y throughput: no disponibles. Dado el bajo numero de parametros activos, se espera una latencia baja en hardware consumer, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No hay modelos directamente comparables publicados con el mismo enfoque de dominio especifico para Lenout. Como referencia arquitectonica, se puede comparar con DeepSeekMoE 16B, que inspira el diseno MoE y MLA:

| Modelo | Parametros totales | Parametros activos | Arquitectura | Contexto | Licencia |
|---|---|---|---|---|---|
| Celestia-1.4B-MoE | no disponible (aprox. 1.4B) | no disponible (2 expertos activos) | MLA + DeepSeekMoE | no disponible | Apache 2.0 |
| DeepSeekMoE 16B | 16.4B | 2.8B | MLA + DeepSeekMoE | no disponible | MIT |

La comparacion con modelos generalistas de tamano similar (por ejemplo, Qwen2.5-1.5B o Llama-3.2-1B) no es relevante porque Celestia esta especializado en un dominio concreto y no se dispone de benchmarks comunes.

## Limitaciones y advertencias

- Dominio restringido: el modelo esta disenado exclusivamente para generar acciones en el DSL de Lenout. Su uso fuera de ese contexto (conversacion general, generacion de codigo, etc.) probablemente produzca resultados pobres o incoherentes.
- Riesgo de alucinacion en acciones DSL: al ser un modelo generativo, puede emitir acciones sintacticamente validas pero semanticamente incorrectas, lo que requiere validacion antes de ejecutarlas en produccion.
- Idiomas limitados: solo tailandes e ingles. No se garantiza un comportamiento adecuado en otros idiomas.
- Datos de entrenamiento no publicados: se desconoce la composicion del corpus, lo que impide evaluar sesgos potenciales o cobertura tematica.
- Sin benchmarks publicados: no hay evidencia cuantitativa de su rendimiento, por lo que su adopcion en entornos criticos debe ir acompanada de pruebas internas.
- Dependencia de codigo personalizado: el uso requiere `trust_remote_code=True`, lo que implica ejecutar codigo del autor no auditado externamente. Se recomienda revisar el codigo antes de usarlo en entornos sensibles.
- Repositorio sin pesos publicados: el tamano del repo es 0.0 GB, lo que sugiere que los pesos no estan disponibles en HuggingFace en el momento de la consulta, o que el modelo se distribuye por otros medios.

## Enlaces

- HuggingFace: https://huggingface.co/seashyne/celestia-1.4b-moe
- Repositorio de referencia de DeepSeekMoE (arquitectura): https://github.com/deepseek-ai/DeepSeek-MoE
- GitHub mencionado en la model card (no verificado): https://github.com/alenout/celestia

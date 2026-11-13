# HumanjavaEnterprises/Qwen3-8B-Cooking-Assistant-GGUF

## Resumen

Qwen3-8B Cooking Assistant es un ajuste fino (fine-tune) del modelo Qwen3-8B de Alibaba, desarrollado por Humanjava Enterprises y distribuido en formato GGUF para su uso con llama.cpp, Ollama y LM Studio. El modelo está especializado en asistencia culinaria: responde preguntas sobre platos, ingredientes, técnicas y seguridad alimentaria, y su rasgo diferencial es que lee la receta que se le proporciona y, cuando no la tiene, la solicita en lugar de inventar detalles.

El problema que aborda es la fabricación de datos (alucinación) en dominios factuales: según la model card, el modelo base inventa detalles de recetas en el 25,8% de las respuestas que requieren una receta no mostrada, frente al 2,7% de este ajuste fino (con 3 de 4 jueces de acuerdo). Además, cuando se le muestra la receta, acierta el 94,8% de las veces frente al 83,1% del base. Se apoya en Qwen3-8B, un transformer denso de 8.190.735.360 parámetros, y mantiene el soporte multilingüe de 26 idiomas del modelo original.

La relevancia actual reside en su enfoque de diseño: "LoRA para el comportamiento, recuperación para los hechos, herramientas para los números". No memoriza recetas, sino que enseña al modelo a leer el texto aportado y a abstenerse cuando no lo tiene. Los pesos están publicados bajo licencia Apache-2.0, con versiones etiquetadas (v1) y con las comprobaciones y los fallos documentados junto a los resultados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3-8B) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8192 tokens en el ejemplo de despliegue (llama.cpp `-c 8192`); no se especifica el máximo nativo |
| Tipos de cuantizacion | Q4_K_M (5,0 GB), Q6_K (6,7 GB), Q8_0 (8,7 GB), BF16 (16,4 GB); imatrix de 11 MB para Q4_K_M y Q6_K |
| Idiomas soportados | 26: en, es, pt, it, fr, nl, de, ru, bn, id, fa, ja, pl, sv, vi, tl, he, ml, tr, zh, ms, th, fi, ar, ta, hi |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp, Ollama, LM Studio); safetensors en el repo del modelo completo |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer densa de Qwen3-8B, con 8.190.735.360 parámetros. El ajuste fino se realizó mediante DPO (Direct Preference Optimization), según la etiqueta `dpo` de la model card, y está orientado a modificar el comportamiento del modelo más que a inculcarle conocimiento factual. El prompt de sistema con el que se entrenó es: "You are a cooking assistant. You answer questions about dishes, ingredients, techniques and food safety. When you are not sure, you say so." Se utiliza la plantilla de chat de Qwen3 con el modo de razonamiento desactivado (`enable_thinking: false` o `/no_think`).

Las cuantizaciones Q4_K_M y Q6_K se generaron con una importance matrix calculada sobre 598 conversaciones de entrenamiento en formato chat, estratificadas por tipo de pregunta y por si se mostraba una receta, ninguna de ellas presente en el conjunto de evaluación. El conjunto de evaluación es fijo y reservado: 682 preguntas en 26 idiomas (290 con receta mostrada, 10 de recuerdo sin receta, 300 que requieren una receta no mostrada y 82 generales). La evaluación se hizo con jueces de pesos abiertos de familias distintas (DeepSeek-V4-Flash bajo licencia MIT como juez principal, más Qwen3.8-27B, GLM-4.7-Flash y gpt-oss-120b), en ciego y en ambos órdenes. No se detalla en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Generación de texto conversacional sobre cocina: platos, ingredientes, técnicas y seguridad alimentaria.
- Lectura de recetas aportadas en el turno del usuario: responde preguntas basándose en el texto proporcionado.
- Abstención ante recetas ausentes: solicita la cantidad o la receta original en lugar de inventar datos.
- Respuestas generales de cocina: sustituciones de ingredientes, diagnóstico de platos fallidos, seguridad alimentaria.
- Multilingüe: 26 idiomas, incluidos español, inglés, portugués, francés, alemán, chino, árabe, hindi y japonés.
- Compatibilidad con endpoints (`endpoints_compatible`) y despliegue en llama.cpp, Ollama y LM Studio.
- No se menciona soporte de tool calling, function calling, agentes ni visión en la información disponible.
- No se menciona un modo de razonamiento activo; de hecho, se recomienda desactivar el thinking de Qwen3.

## Casos de uso

- Asistente de cocina en aplicación móvil: el usuario pega una receta y pregunta por cantidades, tiempos o sustituciones; el modelo responde a partir del texto y evita inventar detalles cuando falta información.
- Atención al cliente de una plataforma de recetas: gestiona conversaciones multi-turno sobre platos concretos si la aplicación inyecta la receta en el contexto; su tasa de invención del 2,7% reduce el riesgo de respuestas erróneas ante consultas factuales.
- Seguridad alimentaria en hostelería: responde sobre conservación, temperaturas y contaminación cruzada; el entrenamiento incluye esta categoría y el modelo declara incertidumbre cuando no está seguro.
- Motor de recomendaciones culinarias con recuperación (RAG): la aplicación recupera la receta de una base de datos y el modelo la interpreta; el diseño previsto es "recuperación para los hechos".
- Conversión de unidades y escalado de recetas: el modelo puede explicar el procedimiento, pero el cálculo debe delegarse a herramientas; encaja en pipelines donde la app calcula y el modelo redacta la explicación.
- Despliegue en hardware modesto: con la cuantización Q4_K_M (5,0 GB, 5,3 GB usados a contexto de 8k) puede ejecutarse en GPU de 6 GB, lo que permite prototipos y demos en equipos de consumo.
- Asistente multilingüe para comunidades internacionales de cocina: cubre 26 idiomas, útil para foros o chatbots con audiencia diversa.
- Ejemplo docente de ajuste fino responsable: sirve como caso práctico de DPO con trazabilidad de fuentes, pesos abiertos y evaluación con jueces ciegos.

## Benchmarks y rendimiento

Resultados sobre el conjunto reservado de 682 preguntas en 26 idiomas, comparados con Qwen3-8B base (thinking off):

| Métrica | Qwen3-8B | Este modelo |
|---|---|---|
| Inventa detalles de receta sin receta mostrada (juez principal) | 30,0% [25,1; 35,4] | 9,0% [6,3; 12,8] |
| Igual, tras comprobación de reglas que elimina falsas alarmas del juez | 27,7% | 4,0% [2,3; 6,9] |
| Correcto con receta mostrada (290 preguntas) | 87,6% | 96,2% |
| Preferido por el juez, 682 preguntas | — | 0,610 [0,581; 0,639] (0,50 = empate) |
| Preferido por el juez, solo preguntas generales | — | 0,460 [0,369; 0,549] (nivel con el base) |

Con cuatro jueces (DeepSeek-V4-Flash, Qwen3.8-27B, GLM-4.7-Flash y gpt-oss-120b):

| Criterio de "inventa" | Qwen3-8B | Este modelo |
|---|---|---|
| Al menos 3 de 4 jueces lo afirman | 25,8% [21,1; 31,0] | 2,7% [1,4; 5,2] |
| Los cuatro lo afirman | 19,1% | 1,0% |
| Cualquiera de los cuatro lo afirma | 49,2% | 18,3% |

La reducción de invenciones es significativa (McNemar p < 1e-10; 78 preguntas donde solo el base inventa frente a 15 donde solo lo hace este modelo). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: Q4_K_M usa 5,3 GB a contexto de 8k y cabe en GPU de 6 GB; Q6_K (6,7 GB) requiere tarjetas de 8 GB; Q8_0 (8,7 GB) requiere alrededor de 10 GB; BF16 (16,4 GB) requiere al menos 20 GB.
- GPU recomendadas: tarjetas de consumo como RTX 3060 6 GB o superiores para Q4_K_M; RTX 4060 Ti/4070 8 GB para Q6_K; A100 o H100 para BF16 y despliegue concurrente.
- Cabe en GPU de consumo: sí, con Q4_K_M en 6 GB y Q6_K en 8 GB.
- Opciones de despliegue: llama.cpp (`llama-server -hf ...:Q6_K --jinja -c 8192`), Ollama (`ollama run vveerrgg/qwen3-8b-cooking-assistant:q6_k`), LM Studio y, para safetensors, Transformers y vLLM.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3-8B Cooking Assistant (este) | 8.190.735.360 | 8192 en despliegue de ejemplo | Cocina con abstención y lectura de recetas | Apache-2.0 | GGUF, safetensors |
| Qwen3-8B (base) | 8.190.735.360 | Contexto nativo de Qwen3 (no especificado aquí) | Propósito general | Apache-2.0 | safetensors, GGUF comunitario |
| Qwen3.8-27B | no disponible en detalle | no disponible | Propósito general (usado como juez) | Apache-2.0 | no disponible |
| GLM-4.7-Flash | no disponible en detalle | no disponible | Propósito general (usado como juez) | MIT | no disponible |

La comparativa directa con otros asistentes culinarios ajustados no está disponible en la información proporcionada. Frente a su base, la diferencia medible es la reducción de invenciones (25,8% a 2,7% con 3 de 4 jueces) y la mejora con receta mostrada (83,1% a 94,8%).

## Limitaciones y advertencias

- No memoriza recetas: si la aplicación no aporta la receta, el modelo la solicitará en lugar de responder; requiere un componente de recuperación para consultas sobre platos concretos.
- Riesgo residual de invención: 2,7% con 3 de 4 jueces y 1,0% con los cuatro; no es cero.
- En preguntas generales de cocina su rendimiento es equivalente al base (preferencia del juez 0,460, intervalo que incluye el empate), sin mejora significativa.
- Es un fine-tune no oficial: no está hecho ni respaldado por Alibaba Cloud ni por el equipo de Qwen.
- Los benchmarks publicados son específicos del dominio culinario y evaluados con jueces automáticos; no sustituyen una evaluación humana en producción.
- Licencia Apache-2.0 permite uso comercial, pero deben conservarse los avisos de licencia y atribución correspondientes.
- No se documentan sesgos específicos, pero al heredar el base puede reproducir sesgos de Qwen3-8B en temas culturales o alimentarios.
- La model card no detalla el número de tokens de entrenamiento ni la composición del dataset, lo que limita la reproducibilidad completa.
- El contexto de ejemplo es de 8192 tokens; recetas muy largas o conversaciones extensas pueden requerir configuración adicional.
- Sesgos conocidos: no disponibles en la información proporcionada.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/HumanjavaEnterprises/Qwen3-8B-Cooking-Assistant-GGUF
- Modelo completo en safetensors: https://huggingface.co/HumanjavaEnterprises/Qwen3-8B-Cooking-Assistant
- Dataset de evaluación: https://huggingface.co/datasets/HumanjavaEnterprises/cooking-assistant-eval
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Ollama: `ollama run vveerrgg/qwen3-8b-cooking-assistant:q6_k`
- Checksums: archivo `SHA256SUMS` en el repositorio del modelo

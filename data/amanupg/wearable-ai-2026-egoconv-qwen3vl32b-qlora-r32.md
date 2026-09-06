# amanupg/wearable-ai-2026-egoconv-qwen3vl32b-qlora-r32

## Resumen

El modelo es un adaptador QLoRA para el modelo multimodal Qwen3-VL-32B-Instruct, desarrollado por Aman Upganlawar (Columbia University) como entrada individual en el Wearable AI Grand Challenge de ECCV 2026, organizado por Meta. El adaptador, de 1.07 GB y 896 tensores, se fusiona con el modelo base para servir un total de 33.36 B parámetros. Resuelve la tarea EgoConv: respuesta a preguntas conversacionales multi-turno sobre video egocéntrico en streaming, donde el modelo ve el video hasta el timestamp actual y el diálogo acumulado, y genera respuestas libres puntuadas por un juez LLM. El modelo obtuvo el segundo puesto de siete participantes en la sub-tarea Large (2B+), con un LLM-as-Judge oficial de 0.4816 y el BLEU más alto de la división (0.1256). La relevancia radica en su enfoque de eficiencia: la cuantización 4-bit se usó solo para entrenamiento, y el adaptador se sirve en bf16 con un presupuesto de frames mayor que el de entrenamiento, lo que mejora el rendimiento en 17 puntos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal de visión-lenguaje (Qwen3-VL-32B-Instruct) + adaptador LoRA (QLoRA) |
| Parametros totales | 33.36 B (modelo base + adaptador fusionado); adaptador: 1.07 GB (896 tensores) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit NF4 (QLoRA) solo en entrenamiento; servir en bf16 tras fusionar |
| Idiomas soportados | no disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT); modelo base: no especificado |

## Arquitectura y entrenamiento

El modelo base es Qwen3-VL-32B-Instruct, un transformer multimodal que procesa imágenes y video. El adaptador LoRA se entrena con QLoRA: el modelo base se cuantiza a 4-bit NF4 durante el entrenamiento para reducir el uso de memoria, y se aplican adaptadores LoRA con r=32, alpha=64, dropout=0.05 y use_rslora=true sobre las proyecciones q, k, v, o, gate, up y down. El entrenamiento se realiza durante 1 época con 8 frames (6 recientes y 2 de historial) a una resolución de 896 px en el lado largo. No se especifica el dataset ni el número de tokens; se trata de un desafío de QA conversacional sobre video egocéntrico. No se menciona RLHF ni DPO; la evaluación se realiza mediante un juez LLM (Llama-4-Maverick-17B-128E-Instruct-FP8). La innovación principal es que la cuantización es solo una medida de memoria en entrenamiento: al servir, se fusiona el adaptador y se usa bf16, y se recomienda aumentar el presupuesto de frames a 10 recientes + 6 de historial, lo que mejora el LLM-as-Judge de 0.4048 a 0.5745 en un subconjunto compartido.

## Capacidades

- Generación de respuestas conversacionales multi-turno sobre video egocéntrico en streaming, con preguntas que dependen del contexto temporal.
- Capacidad multimodal de visión-lenguaje: procesa frames de video y texto de diálogo para generar respuestas.
- Especialización en QA de video egocéntrico gracias al adaptador, manteniendo las capacidades generales del modelo base Qwen3-VL-32B-Instruct.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponibles (no especificado en la información).

## Casos de uso

- Análisis de grabaciones de cámaras corporales o wearables: el modelo puede responder preguntas sobre acciones, objetos o eventos en video egocéntrico, útil en revisiones de seguridad o investigación.
- Asistencia para personas con discapacidad visual: un sistema wearable captura video en primera persona y el modelo responde preguntas sobre el entorno en tiempo real, gracias al contexto multi-turno.
- Revisión de videos de entrenamiento deportivo: el modelo puede responder preguntas técnicas sobre la ejecución de un movimiento, usando los frames recientes y el historial de la conversación.
- Interacción con robots o agentes con cámaras egocéntricas: un operador humano puede preguntar al robot sobre lo que está viendo, y el modelo genera respuestas basadas en el contexto visual y el diálogo.
- Teleoperación de drones o vehículos con cámaras: el modelo responde preguntas sobre el entorno o la misión mientras el operador supervisa el video en streaming.
- Accesibilidad educativa: los estudiantes pueden preguntar sobre demostraciones prácticas en video, como experimentos de laboratorio o procedimientos, recibiendo respuestas contextuales.
- Análisis de videos de vigilancia o monitorización: el modelo puede responder preguntas específicas sobre eventos ocurridos, aprovechando el contexto de frames históricos.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| LLM-as-Judge (oficial, split privado de test) | 0.4816 |
| BLEU (oficial) | 0.1256 (el más alto de la división) |
| LLM-as-Judge (validación del autor, 1 época) | 0.5649 |
| LLM-as-Judge (validación, 2 épocas interrumpido) | 0.4749 (inconcluso) |
| LLM-as-Judge (subconjunto compartido, 6+2 frames) | 0.4048 |
| LLM-as-Judge (subconjunto compartido, 10+6 frames) | 0.5745 |
| Posición en sub-track Large (2B+) | 2º de 7 (runner-up) |

No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: ~67 GB (33.36 B parámetros × 2 bytes), más overhead, por lo que se recomiendan GPUs de 80 GB.
- GPU recomendadas: A100 80GB, H100 80GB.
- No cabe en consumer GPU para servir bf16; con cuantización 4-bit podría reducir el uso, pero no está documentado para este adaptador.
- Opciones de despliegue: se puede cargar con Transformers + PEFT y fusionar el adaptador, y después servir con vLLM o TGI en bf16. También se puede exportar a GGUF para llama.cpp, aunque no se proporciona un formato GGUF oficial.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con otros modelos de la misma categoría. El adaptador se puede comparar con el modelo base Qwen3-VL-32B-Instruct sin adaptador, que no está especializado en EgoConv y no alcanzaría el rendimiento del adaptador sin un ajuste específico. Tampoco se dispone de datos de otros participantes del desafío. El modelo base tiene 32B parámetros y el adaptador añade 1.36B parámetros (33.36 - 32 = 1.36B), lo que supone un aumento del 4.25%. No hay benchmarks comparativos publicados.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles.
- Riesgo de alucinación: con un presupuesto de frames bajo (como los 8 usados en entrenamiento), el modelo deriva a descripciones genéricas de escenas en lugar de responder a la pregunta, lo que puede producir respuestas no pertinentes.
- Limitaciones de contexto o idioma: no se especifican idiomas soportados. La longitud de contexto no está documentada.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero requiere mantener el aviso de licencia y no implica garantías.
- Caveat importante: la cuantización 4-bit es solo para entrenamiento; servir en bf16 es necesario para obtener el rendimiento esperado. Entrenar y servir con presupuestos de frames diferentes produce una pérdida de 17 puntos en LLM-as-Judge.
- El entrenamiento se realizó con 1 época; un segundo epoch fue interrumpido y se considera inconcluso, por lo que no se recomienda asumir que más épocas mejoran el rendimiento.

## Enlaces

- HuggingFace: https://huggingface.co/amanupg/wearable-ai-2026-egoconv-qwen3vl32b-qlora-r32
- GitHub (código y write-up): https://github.com/amanupg/wearable-ai-2026-egoconv
- Perfil del autor: https://huggingface.co/amanupg
- Wearable AI Grand Challenge: https://wearable-ai-workshop.github.io/

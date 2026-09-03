# Qwen/Qwen-Drive-1.0-4B

## Resumen

Qwen-Drive-1.0-4B es un modelo fundacional de visión-lenguaje para conducción autónoma desarrollado por el equipo Qwen (Alibaba). Mantiene intacta la arquitectura del VLM multimodal Qwen3.5-4B y le añade dos módulos externos: un *BEV perception head* que realiza detección de objetos 3D, predicción de ocupación semántica y segmentación de mapa en vista de pájaro (BEV), y un *Planning Expert* que genera trayectorias futuras del vehículo ego mediante *flow matching*. De esta forma, el modelo unifica percepción 3D, respuesta visual a preguntas (VQA) y planificación de movimiento en un único marco, sin modificar el VLM preentrenado.

Es relevante porque es el primer modelo de este tipo que integra percepción 3D y VQA en la fase de preentrenamiento y posteriormente extiende sus capacidades a planificación, manteniendo un rendimiento competitivo en tareas generales de visión-lenguaje. Con 4.539 millones de parámetros (4,5B), se posiciona como una alternativa eficiente frente a modelos más grandes en el ámbito de la conducción autónoma. La longitud de contexto no se especifica en la documentación disponible. La licencia es Apache 2.0, lo que permite uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLM transformer multimodal (Qwen3.5-4B) + BEV perception head + Planning Expert |
| Parámetros totales | 4.539.265.536 (4,5B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (repo en safetensors, probablemente BF16/FP16) |
| Idiomas soportados | No disponible (el modelo base Qwen3.5-4B es multilingüe, pero no se especifica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (13,8 GB) |

## Arquitectura y entrenamiento

Qwen-Drive-1.0-4B conserva la arquitectura del VLM Qwen3.5-4B, que actúa como representación compartida para todas las tareas. Sobre esta base se añaden dos componentes externos: el *BEV perception head*, que transforma las representaciones del VLM en salidas explícitas de percepción (detección 3D, ocupación semántica y segmentación de mapa BEV), y el *Planning Expert*, que condiciona sobre las representaciones del VLM para generar trayectorias del ego mediante *flow matching*, una técnica generativa basada en flujos. El VLM original permanece sin modificar, lo que facilita el reuso de pesos preentrenados.

El entrenamiento sigue una receta por etapas que combina supervisión específica de conducción con datos generales de visión-lenguaje. Se unifican etiquetas entre múltiples datasets públicos de conducción, se reescriben respuestas y se filtran muestras para garantizar consistencia, mitigando el olvido catastrófico. Se publican dos variantes del *Planning Expert*: `planner-sft`, que soporta planificación directa y razonada, y `planner-rl`, optimizado mediante aprendizaje por refuerzo sobre NAVSIM PDMS, WOD-E2E RFS y un término de desplazamiento, y que funciona mejor en modo de planificación razonada. No se especifican el número total de tokens de entrenamiento ni la composición detallada del dataset.

## Capacidades

- Percepción 3D: detección de objetos 3D, predicción de ocupación semántica y segmentación de mapa BEV, todo ello a través de un head externo inspeccionable.
- Visual question answering (VQA): responde preguntas de forma libre sobre escenas de conducción, manteniendo las capacidades conversacionales del VLM base.
- Planificación de movimiento: genera trayectorias futuras del vehículo ego mediante *flow matching*, con dos modos disponibles (directo y razonado).
- Soporte de agentes y razonamiento multi-paso: disponible en el modo de planificación razonada del `planner-rl`.
- Capacidades multilingües: no documentadas específicamente para este modelo, aunque el modelo base Qwen3.5-4B es nativamente multilingüe.
- Capacidades generales de visión-lenguaje: conserva el entendimiento visual y la instrucción del modelo base, lo que permite su uso en tareas no relacionadas con conducción.

## Casos de uso

- Sistemas de asistencia al conductor: el modelo puede responder preguntas en tiempo real sobre el entorno (por ejemplo, "¿hay algún peatón cruzando?"), gracias a su capacidad de VQA y percepción 3D integrada.
- Evaluación de seguridad en simulación: las trayectorias generadas por el *Planning Expert* pueden usarse para probar escenarios de conducción en simuladores, comparando el comportamiento del modelo con el de conductores humanos.
- Anotación automática de datos de conducción: el *BEV perception head* produce detecciones 3D y mapas de ocupación, lo que permite etiquetar grandes volúmenes de datos sin intervención manual.
- Desarrollo de pipelines de conducción autónoma: el modelo puede integrarse como módulo de planificación en arquitecturas más amplias, aprovechando su salida de trayectorias y su capacidad de razonamiento contextual.
- Investigación en modelos visión-lenguaje-acción (VLA): sirve como referencia para estudiar cómo unificar percepción, razonamiento y control en un solo modelo, con una arquitectura modular y transparente.
- Prototipos y demostraciones de conducción autónoma: dado su tamaño moderado (4,5B), puede ejecutarse en hardware de gama alta para pruebas de concepto en entornos controlados.

## Benchmarks y rendimiento

La documentación proporcionada incluye resultados parciales de evaluación en planificación de movimiento en *open-loop* sobre el dataset WOD-E2E, comparando con otros modelos de la categoría. La tabla está incompleta en la información disponible; se muestran los valores que han sido publicados.

| Modelo | WOD-E2E RFS val/test (↑) | WOD-E2E ADE 5s val/test (↓) |
|---|---|---|
| AutoVLA | --/7.56 | --/2.96 |
| SpanVLA | -- | -- |
| MindVLA-U1 | 8.20/7.87 | 2.28/2.66 |
| Alpamayo-1.5 | -- | -- |
| SimWAM_IL | -- | -- |
| Qwen-Drive-1.0-SFT | 7.95/7.78 | No disponible en el fragmento |
| Qwen-Drive-1.0-RL | 8.45/7.91 | No disponible en el fragmento |

No se han publicado resultados de benchmarks para percepción 3D ni VQA en la información disponible. Los datos de ADE para Qwen-Drive-1.0 no aparecen en el fragmento extraído, por lo que se marcan como no disponibles.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4,5B parámetros en BF16/FP16 se requieren aproximadamente 9-10 GB solo para los pesos; el tamaño del repo (13,8 GB) sugiere que los módulos adicionales incrementan el uso, por lo que se estiman 10-12 GB en FP16. Con cuantización a 8 bits o 4 bits, podría reducirse a 5-7 GB.
- GPU recomendadas: NVIDIA RTX 3090 o RTX 4090 (24 GB) para inferencia cómoda; A100 (40/80 GB) o H100 para entrenamiento o *fine-tuning*.
- Cabe en GPU de consumo de 24 GB en FP16, y en GPUs de 8-12 GB con cuantización (aunque no se ofrecen versiones GGUF oficiales).
- Opciones de despliegue: transformers (Hugging Face), compatible con endpoints (vLLM, TGI) según las etiquetas de la plataforma. No se menciona soporte para llama.cpp ni Ollama.
- Latencia y throughput: no disponibles en la documentación oficial.

## Comparativa con modelos similares

La comparativa se basa en los datos proporcionados en la model card, que incluyen modelos de conducción autónoma basados en VLA. No se dispone de información sobre otros parámetros (contexto, licencia) de estos modelos comparados.

| Modelo | Parámetros | Contexto | Rendimiento (WOD-E2E RFS test) | Licencia |
|---|---|---|---|---|
| Qwen-Drive-1.0-4B | 4,5B | No disponible | 7.91 (RL) | Apache 2.0 |
| MindVLA-U1 | No disponible | No disponible | 7.87 | No disponible |
| AutoVLA | No disponible | No disponible | 7.56 | No disponible |

Qwen-Drive-1.0-4B supera a los modelos comparados en la métrica RFS del conjunto de test de WOD-E2E, siendo además el único con licencia abierta (Apache 2.0). No se dispone de datos para los demás modelos.

## Limitaciones y advertencias

- Modelo de investigación: no está validado para su uso en vehículos reales ni en sistemas de conducción en producción.
- Riesgo de alucinación: como todo VLM, puede generar respuestas incorrectas o inventadas en tareas de VQA, especialmente en escenas complejas o poco representadas en el entrenamiento.
- Sesgos del modelo base: al partir de Qwen3.5-4B, puede heredar sesgos lingüísticos y culturales de su entrenamiento original.
- Limitaciones de contexto: la longitud de contexto no está documentada; podría ser insuficiente para secuencias de conducción muy largas.
- Idiomas: no se especifican los idiomas soportados, lo que limita su uso en entornos multilingües sin verificación previa.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero los datasets de entrenamiento no están detallados; conviene revisar sus términos si se planea un despliegue comercial.
- Cuantización: no se ofrecen versiones cuantizadas oficiales; la conversión a GGUF u otros formatos requeriría trabajo adicional y podría degradar el rendimiento.

## Enlaces

- Hugging Face: https://huggingface.co/Qwen/Qwen-Drive-1.0-4B
- Repositorio GitHub: https://github.com/QwenLM/Qwen-Drive-1.0
- Artículo técnico (arXiv): https://arxiv.org/abs/2609.00111

# mradermacher/Qwen3.6-35B-A3B-Westernized-GGUF

## Resumen

Qwen3.6-35B-A3B-Westernized-GGUF es una cuantización estática en formato GGUF del modelo hirundo-io/Qwen3.6-35B-A3B-Westernized, un derivado afinado del Qwen3.6-35B-A3B que incorpora una técnica de *behavioral unlearning* ("Westernized") orientada a eliminar o atenuar comportamientos y sesgos culturales específicos del modelo original. El trabajo de cuantización lo firma mradermacher, un publicador habitual de quants GGUF para la comunidad de inferencia local.

El modelo base es un transformer de tipo mezcla de expertos (MoE) con 35.505.251.456 parámetros totales y, según la nomenclatura A3B, aproximadamente 3.000 millones de parámetros activos por token. Esta arquitectura permite un rendimiento cercano a un modelo denso de mayor tamaño con un coste computacional de inferencia mucho menor, lo que lo hace atractivo para despliegues en hardware de gama alta de consumo.

La relevancia de esta ficha radica en dos factores: por un lado, la disponibilidad de cuantizaciones GGUF listas para usar en llama.cpp y entornos compatibles, lo que democratiza el acceso a un MoE de 35B; por otro, la naturaleza "Westernized" del modelo, que plantea cuestiones interesantes sobre alineación cultural y *unlearning* conductual que conviene evaluar antes de usarlo en producción. La licencia Apache 2.0 facilita su adopción comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) |
| Parametros totales | 35.505.251.456 |
| Parametros activos | ~3.000 millones (según nomenclatura A3B; no confirmado en la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en (inglés; según model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos (MoE) con 35.505 millones de parámetros totales y aproximadamente 3.000 millones activos por token, siguiendo el patrón de la familia Qwen3.6. La model card del repositorio cuantizado no detalla la composición del dataset de entrenamiento, el número de tokens procesados ni si se aplicaron fases de RLHF o DPO. La etiqueta `behavioral-unlearning` y el sufijo "Westernized" indican que el modelo base de hirundo-io fue sometido a un proceso de *unlearning* conductual para modular respuestas y sesgos culturales respecto al Qwen3.6-35B-A3B original; los detalles técnicos de ese proceso no están disponibles en la información proporcionada.

La contribución de este repositorio es exclusivamente la cuantización estática en GGUF mediante herramientas de la familia llama.cpp, con versiones que van desde Q2_K (13,3 GB) hasta Q8_0 (37,9 GB), además de dos ficheros `mmproj` (Q8_0 y f16) que actúan como suplemento multimodal. Existe también un repositorio hermano con cuantizaciones ponderadas/imatrix (`Qwen3.6-35B-A3B-Westernized-i1-GGUF`) que suele ofrecer mejor calidad por tamaño que las estáticas.

## Capacidades

- Generación de texto conversacional en inglés, con soporte de diálogo multi-turno.
- Razonamiento y resolución de problemas de complejidad media-alta, heredado de la familia Qwen3.6.
- Capacidades multimodales: la presencia de ficheros `mmproj` sugiere soporte de entrada de imagen (visión) en el modelo base, aunque no se detalla en la información disponible.
- Etiqueta `endpoints_compatible`, lo que indica compatibilidad con infraestructuras de despliegue tipo API.
- El proceso de *behavioral unlearning* busca modular respuestas sesgadas o culturalmente marcadas del modelo original.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible.
- Capacidades de agente y razonamiento multi-paso: no confirmadas explícitamente en la información disponible.
- Capacidades multilingües: limitadas al inglés según la model card.

## Casos de uso

- Despliegue local de un MoE de 35B en estaciones de trabajo con GPU de consumo: gracias a las cuantizaciones Q4_K_M (21,8 GB) o IQ4_XS (19,5 GB), el modelo puede ejecutarse en GPUs con 24 GB de VRAM como la RTX 4090, ofreciendo un equilibrio razonable entre calidad y requisitos de hardware.
- Asistentes conversacionales autoalojados: la licencia Apache 2.0 y el formato GGUF permiten integrar el modelo en productos comerciales sin restricciones de uso, ejecutándolo con llama.cpp u Ollama en servidores propios.
- Investigación sobre alineación cultural y *unlearning*: el modelo sirve como caso de estudio para comparar el comportamiento del Qwen3.6 original frente a la variante "Westernized" en tareas sensibles a sesgos culturales.
- Prototipado rápido de aplicaciones de IA generativa: la disponibilidad de cuantizaciones desde 13,3 GB (Q2_K) permite probar el modelo en hardware modesto antes de escalar a versiones de mayor precisión.
- Procesamiento de documentos y texto en inglés: el modelo puede emplearse para resumen, extracción y reescritura de contenido en inglés, aprovechando su ventana de contexto (no confirmada) y su naturaleza MoE para mantener latencias bajas.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece un abanico amplio de tipos de cuantización, útil para medir el impacto de la compresión en la calidad de un MoE de 35B en tareas concretas.
- Pipelines multimodales (si se confirma la visión): los ficheros `mmproj` permiten combinar el modelo con un proyector visual para tareas de descripción de imágenes o VQA, aunque esta capacidad no está documentada en detalle.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según tamaño de cuantización):
  - Q2_K: ~13,3 GB
  - Q3_K_S: ~15,6 GB
  - Q3_K_M: ~17,3 GB
  - Q3_K_L: ~18,7 GB
  - IQ4_XS: ~19,5 GB
  - Q4_K_S: ~20,5 GB
  - Q4_K_M: ~21,8 GB
  - Q5_K_S: ~24,7 GB
  - Q5_K_M: ~25,4 GB
  - Q6_K: ~29,3 GB
  - Q8_0: ~37,9 GB
  - Añadir ~0,7-1,0 GB si se usa el suplemento multimodal `mmproj`.
- GPU recomendadas:
  - RTX 4090 (24 GB): Q4_K_M o IQ4_XS caben con margen ajustado; Q5_K_M requiere gestión cuidadosa de offload.
  - RTX 3090 (24 GB): mismas opciones que la 4090, con menor throughput.
  - A100 40 GB / H100 80 GB: Q8_0 o Q6_K sin problemas, con alto throughput.
  - GPU de 16 GB: Q3_K_S o Q3_K_M con offload parcial a CPU.
- Cabe en GPU de consumo: sí, desde Q2_K en GPUs de 16 GB hasta Q4_K_M en GPUs de 24 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier runtime compatible con GGUF. Para safetensors del modelo base, vLLM o TGI (no confirmado para esta variante).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-Westernized (este) | 35,5B totales / ~3B activos | no disponible | Apache 2.0 | GGUF, safetensors | MoE con *unlearning* conductual |
| Qwen3.6-35B-A3B (original) | 35,5B totales / ~3B activos | no disponible | Apache 2.0 (presumible) | safetensors | Sin modulación "Westernized" |
| hirundo-io/Qwen3.6-35B-A3B-Westernized | 35,5B totales / ~3B activos | no disponible | Apache 2.0 | safetensors | Modelo base de esta cuantización |

No se dispone de datos de benchmarks ni de contexto para comparar el rendimiento relativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El proceso de *behavioral unlearning* "Westernized" puede introducir sesgos culturales deliberados o alterar respuestas en dominios sensibles; conviene auditar el comportamiento antes de usarlo en producción.
- Riesgo de alucinación inherente a los modelos de lenguaje de esta escala; no se han publicado evaluaciones específicas de fidelidad factual.
- Idiomas soportados limitados al inglés según la model card; el rendimiento en castellano u otros idiomas no está garantizado.
- La longitud de contexto no está documentada en la información disponible, lo que dificulta planificar cargas de trabajo con ventanas largas.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S) pueden degradar notablemente la calidad; se recomienda Q4_K_M o superior para uso serio.
- Aunque la licencia es Apache 2.0, el modelo base incorpora modificaciones de terceros (hirundo-io) cuyos términos conviene revisar en su repositorio original.
- No se confirma soporte de tool calling, agentes ni multimodalidad más allá de la presencia de ficheros `mmproj`; verificar empíricamente antes de diseñar arquitecturas que dependan de estas capacidades.

## Enlaces

- Repositorio Hugging Face (cuantizaciones GGUF): https://huggingface.co/mradermacher/Qwen3.6-35B-A3B-Westernized-GGUF
- Modelo base (safetensors): https://huggingface.co/hirundo-io/Qwen3.6-35B-A3B-Westernized
- Cuantizaciones ponderadas/imatrix: https://huggingface.co/mradermacher/Qwen3.6-35B-A3B-Westernized-i1-GGUF
- Página de overview de mradermacher: https://hf.tst.eu/model#Qwen3.6-35B-A3B-Westernized-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfica comparativa de perplejidad por cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png

# mradermacher/Qwen3.8-27B-ColdFusion-Heretic-ManusDistill-v1-GGUF

## Resumen

Este repositorio contiene una colección de cuantizaciones GGUF estáticas del modelo Qwen3.8-27B-ColdFusion-Heretic-ManusDistill-v1, publicado originalmente por el usuario PeetPedro. El autor de esta conversión es mradermacher, conocido en Hugging Face por generar cuantizaciones GGUF de modelos de terceros para su uso con llama.cpp y herramientas compatibles. El modelo base es un fine-tune de la familia Qwen3 con aproximadamente 26.900 millones de parámetros (26,9B), según el recuento real de tensores safetensors del repositorio.

El nombre del modelo sugiere una combinación de varios procesos: "ColdFusion" como nombre en clave del fine-tune, "Heretic" como posible referencia a una variante sin censura o con alineamiento reducido, y "ManusDistill" como indicio de destilación a partir de trazas o datos generados por Manus (un agente autónomo). No obstante, la model card del repositorio no aporta documentación sobre el proceso de entrenamiento, los datos utilizados ni las capacidades reales del modelo, por lo que estos extremos no pueden confirmarse.

La relevancia de este repositorio es fundamentalmente práctica: ofrece el modelo en múltiples niveles de cuantización (desde Q2_K hasta F16, incluyendo IQ4_XS y Q8_0) para facilitar su despliegue en hardware con VRAM limitada. El tamaño del repositorio (77,3 GB) es coherente con un modelo de ~27B cuantizado en varios formatos. Al no haber descargas ni likes registrados y carecer de licencia e idiomas declarados, debe tratarse como un artefacto experimental sin garantías de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente transformer denso, familia Qwen3; no confirmado en la model card) |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base en la documentación proporcionada. Por el nombre y el recuento de parámetros, se infiere que deriva de un checkpoint de la familia Qwen3 de ~27B, pero la model card no confirma si se trata de un transformer denso, si incorpora atención lineal, decodificación especulativa u otras innovaciones. Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF, DPO o destilación.

El sufijo "ManusDistill" apunta a una posible destilación a partir de datos generados por un agente (Manus), y "Heretic" podría indicar un proceso de desalineamiento o eliminación de rechazos, pero son inferencias basadas únicamente en el nombre del modelo, no en documentación verificable. La conversión a GGUF realizada por mradermacher es una cuantización estática (quantize_version 2, output_tensor_quantised 1, convert_type hf) a partir del checkpoint original en formato Hugging Face.

## Capacidades

- Generación de texto conversacional: el tag `conversational` del repositorio indica que el modelo está orientado a diálogo multi-turno, aunque no se detallan capacidades específicas.
- Razonamiento y código: no confirmado en la documentación; el nombre sugiere un fine-tune sobre Qwen3, familia con capacidades conocidas en código y matemáticas, pero no hay verificación para este checkpoint concreto.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; el sufijo "ManusDistill" sugiere entrenamiento con trazas de agente, pero no está documentado.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Modo "sin censura": el término "Heretic" podría implicar un alineamiento reducido, pero no hay confirmación en la model card.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU de consumo: las cuantizaciones Q4_K_M y Q5_K_M permiten ejecutar un modelo de ~27B en GPUs con 16-24 GB de VRAM mediante llama.cpp u Ollama, útil para prototipado offline sin depender de APIs.
- Experimentación con fine-tunes de la familia Qwen3: investigadores que quieran evaluar variantes comunitarias (ColdFusion, Heretic, ManusDistill) pueden cargar las cuantizaciones GGUF para comparar comportamiento frente al modelo base sin necesidad de convertir pesos.
- Generación de texto conversacional en entornos aislados: el tag `conversational` y el formato GGUF lo hacen adecuado para asistentes locales en escenarios con requisitos de privacidad, siempre que se validen previamente sus respuestas.
- Evaluación de robustez y alineamiento: si "Heretic" implica un alineamiento reducido, el modelo puede emplearse en estudios sobre comportamiento de modelos desalineados y eficacia de filtros de seguridad, con las precauciones oportunas.
- Pruebas de pipelines de inferencia con llama.cpp: sirve como banco de pruebas para medir throughput y latencia de un modelo de ~27B en distintas cuantizaciones (Q2_K a Q8_0) sobre el mismo hardware.
- Integración en herramientas compatibles con GGUF (LM Studio, Jan, text-generation-webui): permite probar el modelo en interfaces de escritorio sin infraestructura adicional, aunque su falta de licencia clara desaconseja uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, según tamaño de pesos GGUF para ~26,9B parámetros):
  - Q2_K: ~10-11 GB
  - Q3_K_M: ~13-14 GB
  - Q4_K_M: ~16-17 GB
  - Q5_K_M: ~19-20 GB
  - Q6_K: ~22-23 GB
  - Q8_0: ~29-30 GB
  - F16: ~54 GB
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; RTX 3090 (24 GB) para Q4/Q5; A100 40 GB o H100 para Q8_0 y F16; configuraciones multi-GPU para F16.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con cuantizaciones Q4_K_M o inferiores; en GPUs de 12-16 GB solo con Q2_K o Q3_K_S y posible offload parcial a CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, Jan y cualquier runtime compatible con GGUF. No se indica compatibilidad con vLLM o TGI (estos requieren normalmente safetensors).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-ColdFusion-Heretic-ManusDistill-v1 (este) | ~26,9B | no disponible | no disponible | GGUF (cuantizado) | Fine-tune comunitario sin documentación ni benchmarks |
| Modelo base Qwen3 de ~27B (referencia) | ~27B | no disponible en esta ficha | según familia Qwen | safetensors | Punto de partida del fine-tune; comportamiento no verificado para esta variante |
| Otros fine-tunes comunitarios GGUF de ~27B | variable | no disponible | variable | GGUF | Alternativas no identificadas en la información disponible |

No se dispone de datos suficientes para una comparativa cuantitativa fiable con alternativas concretas.

## Limitaciones y advertencias

- Ausencia total de documentación: la model card solo indica que son cuantizaciones estáticas del modelo de PeetPedro; no hay información sobre datos de entrenamiento, alineamiento ni evaluación.
- Licencia no declarada: no puede confirmarse el uso comercial; además, la licencia del modelo base Qwen3 (no verificada aquí) podría imponer restricciones adicionales que se desconocen.
- Riesgo de alucinación: sin benchmarks ni evaluación, no hay garantías de fiabilidad factual; un fine-tune "Heretic" podría presentar menor adherencia a directrices de seguridad.
- Idiomas no declarados: no se puede asegurar un rendimiento multilingüe adecuado.
- Contexto desconocido: se desconoce la ventana de contexto efectiva del checkpoint, lo que limita su uso en tareas de contexto largo.
- Cero tracción comunitaria: 0 descargas y 0 likes en el momento de la consulta; sin validación por parte de terceros.
- Posible contenido sin filtrar: si "Heretic" implica desalineamiento, el modelo podría generar contenido inapropiado; requiere filtros y supervisión en cualquier despliegue.
- Cuantizaciones de baja precisión (Q2_K, Q3_K_S) degradan la calidad; para uso serio se recomienda Q4_K_M o superior.

## Enlaces

- Repositorio Hugging Face (cuantizaciones GGUF): https://huggingface.co/mradermacher/Qwen3.8-27B-ColdFusion-Heretic-ManusDistill-v1-GGUF
- Modelo base (según la model card): https://huggingface.co/PeetPedro/Qwen3.8-27B-ColdFusion-Heretic-ManusDistill-v1
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher

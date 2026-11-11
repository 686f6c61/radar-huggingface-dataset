# selimsb/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic es un fine-tune del modelo Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B, que a su vez es un ajuste de Qwen3.5-9B destilado a partir de respuestas generadas por DeepSeek-V4-Pro en modo Max Effect. Lo publica el usuario selimsb en Hugging Face y su rasgo distintivo es haber sido procesado con Heretic v2.0.0.dev0, una herramienta de ablación de direcciones que elimina el comportamiento de rechazo del modelo original. El resultado es una variante "abliterated" que conserva la mayor parte del comportamiento del modelo base pero reduce drásticamente las negativas a responder.

El modelo tiene 9.409.813.744 parámetros reales (según los pesos en safetensors) y está orientado al razonamiento matemático y STEM, con aproximadamente 250.000 muestras de entrenamiento supervisado centradas en matemáticas y ciencia. La arquitectura es del tipo Qwen3.5 (etiqueta `qwen3_5`), con soporte declarado para `image-text-to-text` y `text-generation`, lo que sugiere capacidades multimodales heredadas del modelo base, aunque la model card no detalla la torre de visión.

La relevancia actual de esta ficha es doble: por un lado, documenta un caso concreto de destilación de un modelo grande (DeepSeek-V4-Pro) a la clase de 9B para despliegue práctico; por otro, ilustra el uso de técnicas de abliteración (Arbitrary-Rank Ablation) que modifican el comportamiento de seguridad del modelo, con las implicaciones éticas y legales que ello conlleva. La licencia es Apache 2.0 y los idiomas declarados son inglés, chino, coreano, japonés, español y ruso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Qwen3.5 (etiqueta `qwen3_5`), con soporte declarado `image-text-to-text` |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card; se menciona evaluación con NVFP4 (vLLM) y MTP-Q8_0 (llama.cpp) |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers); repo de 19,3 GB |

## Arquitectura y entrenamiento

El modelo base es Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B, descrito por el autor como un fine-tune de Qwen3.5-9B orientado a razonamiento y destilado a partir de respuestas de DeepSeek-V4-Pro en modo Max Effect. El entrenamiento se concentra en matemáticas y STEM con aproximadamente 250.000 muestras de SFT, e incluye etapas de RL (las etiquetas mencionan `sft`, `rl` y `gspo`, este último un algoritmo de optimización de política). La model card indica que, pese a no incluir datos específicos de código, se observan pequeñas mejoras en programación y uso de herramientas por transferencia entre dominios.

Sobre esta base, selimsb aplica Heretic v2.0.0.dev0, que realiza una Arbitrary-Rank Ablation (ARA) sobre las capas 9 a 24 (índices `start_layer_index` = 9, `end_layer_index` = 24), con `preserve_good_behavior_weight` = 0,8264, `steer_bad_behavior_weight` = 0,0003, `overcorrect_relative_weight` = 0,9645 y `neighbor_count` = 12. La técnica proyecta fuera del espacio de activaciones las direcciones asociadas al comportamiento de rechazo, preservando en la medida de lo posible el resto de capacidades. El autor reporta una divergencia KL de 0,0422 respecto al modelo original, lo que cuantifica el desplazamiento en la distribución de salida.

## Capacidades

- Generación de texto y razonamiento multi-paso, con énfasis en descomposición estructurada de problemas.
- Razonamiento matemático y STEM, entrenado sobre unas 250.000 muestras de matemáticas y ciencia.
- Generación de código y transferencia parcial a programación, pese a no recibir SFT específico de código.
- Tool calling y function calling (etiquetas `tool-use` y `function-calling`).
- Capacidades multimodales declaradas mediante la etiqueta `image-text-to-text`, aunque la model card no detalla la arquitectura de visión ni resolución de imagen.
- Multilingüe en inglés, chino, coreano, japonés, español y ruso.
- Modo de razonamiento (etiqueta `reasoning`) y comportamiento de "thinking" heredado del modelo base destilado.
- Comportamiento "decensored"/"abliterated": el autor reporta 3 rechazos de 100 frente a 100 de 100 del modelo original.

## Casos de uso

- Resolución de problemas matemáticos y científicos en entornos educativos: el modelo puede descomponer ejercicios de cálculo, álgebra o física paso a paso, aprovechando el entrenamiento sobre 250.000 muestras STEM para generar explicaciones estructuradas.
- Asistente de investigación en dominios técnicos: para tareas de derivación simbólica, comprobación de resultados y explicación de conceptos, con la ventaja de un tamaño de 9B que permite ejecución local.
- Generación y revisión de código en pipelines de CI/CD: gracias al soporte de tool calling y a la transferencia desde matemáticas, puede integrarse en flujos de análisis estático, generación de tests o revisión de parches, aunque sin garantías específicas de calidad en código.
- Agentes conversacionales multi-turno: el modelo mantiene conversaciones con contexto (longitud no especificada) y puede encadenar llamadas a herramientas, adecuado para asistentes de soporte técnico especializado.
- Procesamiento de documentos con imagen y texto: la etiqueta `image-text-to-text` permite escenarios de extracción de información de figuras, gráficos o capturas, siempre que se valide empíricamente la calidad multimodal.
- Experimentación en investigación sobre alineación y seguridad: al ser una variante abliterated, es útil como objeto de estudio para medir cómo la ablación afecta a la distribución de respuestas y a la utilidad general.
- Despliegue en local para prototipado rápido: con 9B parámetros y pesos safetensors, es viable en una GPU consumer de gama alta con cuantización, lo que facilita pruebas sin infraestructura en la nube.

## Benchmarks y rendimiento

La model card solo publica métricas del proceso de abliteración, no benchmarks estándar (MMLU, HumanEval, GSM8K, etc.).

| Metrica | Este modelo | Modelo original (Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B) |
|---|---|---|
| Rechazos (Refusals) | 3/100 | 100/100 |
| Divergencia KL | 0,0422 | 0 (por definición) |

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 18,8 GB solo para pesos (9,41B × 2 bytes), más overhead de KV cache y activaciones; en la práctica, 24 GB o más.
- Cuantización a 8 bits: en torno a 9,4 GB de pesos; cabe en GPUs de 12-16 GB con contexto moderado.
- Cuantización a 4 bits: en torno a 4,7-5,5 GB de pesos; viable en GPUs consumer de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070).
- GPU recomendadas: A100 40/80 GB, H100 80 GB para FP16 con contexto largo; RTX 4090 (24 GB) para FP16/BF16 ajustado o FP8; RTX 3090/4080 para cuantización 8 bits.
- Opciones de despliegue: transformers (librería declarada), vLLM (se menciona evaluación con NVFP4), llama.cpp (se menciona MTP-Q8_0), TGI (etiqueta `text-generation-inference`). No se confirma soporte de Ollama en la información disponible.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| selimsb/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic | 9,41B | no disponible | Apache 2.0 | Variante abliterated del fine-tune destilado de DeepSeek-V4-Pro |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B | 9B (clase) | no disponible | no disponible | Modelo base sin ablación; 100/100 rechazos según el autor |
| xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic | 4B (clase) | no disponible | no disponible | Versión 4B de la misma familia abliterated, referenciada por el autor |
| Qwen3.5-9B (modelo de partida) | 9B (clase) | no disponible | no disponible | Base original sobre la que se aplica el fine-tune y la destilación |

No se dispone de datos de rendimiento comparativo (benchmarks) para establecer diferencias cuantitativas entre estas variantes.

## Limitaciones y advertencias

- La abliteración elimina el comportamiento de rechazo, lo que implica que el modelo puede generar contenido dañino, ilegal o inseguro sin las salvaguardas del original; no es apto para producción orientada a usuarios finales sin filtros externos.
- La divergencia KL de 0,0422 indica un desplazamiento medible en la distribución de salida; pueden aparecer degradaciones sutiles en coherencia o fidelidad en tareas ajenas al razonamiento.
- Riesgo de alucinación inherente a los modelos destilados de 9B, especialmente en dominios fuera de matemáticas y STEM, donde el entrenamiento específico es menor.
- El entrenamiento se centró en matemáticas y STEM; el rendimiento en código, derecho, medicina u otras áreas no está validado y la model card solo menciona "pequeñas mejoras" por transferencia.
- La longitud de contexto no se especifica en la información disponible, lo que impide planificar despliegues con ventanas largas sin validación empírica.
- El soporte multimodal (`image-text-to-text`) está declarado en las etiquetas pero no documentado; no debe asumirse una calidad de visión equivalente a modelos especializados.
- Licencia Apache 2.0 permite uso comercial, pero el comportamiento "uncensored" puede contravenir políticas de plataformas, términos de servicio de proveedores cloud y normativa aplicable sobre contenido.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, y fue creado y actualizado el mismo día (2026-11-11), por lo que carece de validación comunitaria.
- No se han publicado benchmarks estándar ni evaluaciones de seguridad independientes.

## Enlaces

- Hugging Face: https://huggingface.co/selimsb/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Modelo base: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B
- Versión 4B de la misma familia: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic
- Heretic (proyecto de ablación): https://heretic-project.org

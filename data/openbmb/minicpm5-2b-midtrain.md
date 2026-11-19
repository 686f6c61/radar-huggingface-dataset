# openbmb/MiniCPM5-2B-Midtrain

## Resumen

MiniCPM5-2B-Midtrain es un modelo de lenguaje denso de 2.516.756.480 parámetros (2,5B) desarrollado por OpenBMB, segundo miembro de la familia MiniCPM5 tras MiniCPM5-1B. Está construido sobre arquitectura Transformer con atención de tipo Llama, empaquetado para `transformers` en formato `safetensors`, y se distribuye bajo licencia Apache 2.0. Su orientación es el despliegue en dispositivo (on-device), local y en entornos con recursos limitados, con soporte declarado de contexto largo, tool calling y tareas agénticas.

El modelo se presenta como estado del arte open source en la clase 2B y, según la model card, compite con modelos de la clase 4B en tareas de código, matemáticas, comprensión de contexto largo, uso de herramientas y razonamiento agéntico. Los idiomas declarados son inglés y chino. La variante "Midtrain" corresponde a un checkpoint de la fase de preentrenamiento continuado (midtrain), no necesariamente al modelo final alineado para chat, lo que conviene tener en cuenta al evaluarlo.

La relevancia actual del modelo reside en la combinación de tamaño reducido, licencia permisiva y capacidades habitualmente reservadas a modelos mayores (contexto largo, function calling, agentes), lo que lo hace candidato para inferencia en hardware de consumo, integración en aplicaciones de escritorio o móviles y pipelines de bajo coste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Llama, `model_type: llama`) |
| Parametros totales | 2.516.756.480 (2,5B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (la model card lo etiqueta como `long-context` sin cifra explícita) |
| Tipos de cuantizacion | no disponible en la información proporcionada (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no confirmadas) |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

MiniCPM5-2B es un Transformer denso de 2,5B parámetros que escala la misma receta de entrenamiento empleada en MiniCPM5-1B. La model card lo describe como un modelo de la familia Llama (`model_type: llama`), lo que implica atención multi-cabeza estándar con RoPE, sin mecanismos de mezcla de expertos ni arquitecturas híbridas SSM. No se detalla en la información disponible el número exacto de capas, dimensiones ocultas, cabezas de atención ni la longitud de contexto nativa.

El entrenamiento se apoya en un conjunto de datasets propios de OpenBMB: Ultra-FineWeb, UltraX-Preview, Ultra-FineWeb-L3, UltraData-Math, UltraData-Code, UltraData-SFT-2605, UltraData-SFT-Agent-2609 y UltraData-RL-2609. La presencia de datasets de SFT y RL sugiere fases de ajuste supervisado y aprendizaje por refuerzo, aunque la model card no especifica el volumen de tokens, la composición exacta del corpus ni los detalles del pipeline de alineación. El sufijo "Midtrain" indica que este checkpoint corresponde a una etapa intermedia de entrenamiento continuado, no al modelo final de la serie.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Razonamiento de código: la model card destaca ventajas frente a modelos del mismo tamaño en tareas de programación.
- Razonamiento matemático, apoyado en el dataset UltraData-Math.
- Comprensión de contexto largo (etiqueta `long-context`), aunque sin cifra de ventana publicada.
- Tool calling / function calling (etiqueta `tool-calling`).
- Tareas agénticas y razonamiento multi-paso, respaldado por UltraData-SFT-Agent-2609.
- Despliegue en dispositivo y entornos con recursos limitados (etiquetas `on-device`, `edge-ai`).
- Compatibilidad con Text Generation Inference y endpoints compatibles (etiquetas `text-generation-inference`, `endpoints_compatible`).
- Capacidades de visión, audio o modo "thinking" explícito: no disponibles en la información proporcionada.

## Casos de uso

- Asistentes locales en escritorio o móvil: con 2,5B parámetros y licencia Apache 2.0, el modelo puede cuantizarse y ejecutarse en portátiles sin GPU dedicada, ofreciendo conversación multi-turno sin enviar datos a la nube.
- Automatización de soporte técnico en inglés y chino: su soporte de tool calling permite conectar el modelo a APIs internas (consulta de pedidos, estado de tickets) y resolver consultas de primer nivel con latencia baja.
- Generación y revisión de código en IDE: el énfasis de la model card en tareas de código lo hace adecuado para autocompletado, explicación de fragmentos y generación de tests dentro de extensiones de editor que requieren inferencia local.
- Agentes de automatización de tareas: la combinación de tool calling y datos de entrenamiento agénticos permite construir flujos multi-paso (lectura de ficheros, llamadas a herramientas, resumen final) en entornos de escritorio.
- Procesamiento de documentos largos: la etiqueta de contexto largo lo habilita para resumir contratos, informes o hilos de conversación extensos, siempre que se valide empíricamente la ventana efectiva.
- Clasificación y extracción de información estructurada: con salidas JSON guiadas por prompt, puede usarse para enriquecer pipelines de datos, etiquetado y moderación de contenido en inglés y chino.
- Prototipado rápido y experimentación académica: su tamaño reducido y licencia permisiva facilitan fine-tuning en una sola GPU y la reproducción de experimentos sin costes elevados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible. La model card incluye únicamente un gráfico radar cualitativo que compara el modelo con modelos de la clase 4B en ocho dimensiones (razonamiento de código, matemáticas, seguimiento de instrucciones, conocimiento general, contexto largo, uso de herramientas y otras), sin valores numéricos asociados.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 5 GB solo para pesos, más overhead de KV cache y activaciones; en la práctica, 8-10 GB para contextos moderados.
- Cuantización a 8 bits: en torno a 2,5-3 GB de pesos; cuantización a 4 bits: aproximadamente 1,3-1,5 GB de pesos.
- GPU recomendadas para FP16: A100, H100, L40S o RTX 4090 para máximo throughput; RTX 3090/4080 suficientes para uso individual.
- GPU de consumo: cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores en FP16; en cuantización 4 bits puede ejecutarse en GPUs de 4-6 GB e incluso en CPU con llama.cpp.
- Opciones de despliegue: `transformers` (librería declarada), Text Generation Inference (etiqueta `text-generation-inference`), endpoints compatibles; vLLM, llama.cpp y Ollama son opciones plausibles pero no están confirmadas explícitamente en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| MiniCPM5-2B-Midtrain | 2,5B | no disponible | Apache 2.0 | en, zh | Checkpoint de midtrain; SOTA declarado en clase 2B |
| MiniCPM5-1B | no disponible | no disponible | no disponible | en, zh | Modelo previo de la misma familia, menor tamaño |
| Modelos open source de clase 2B (p. ej. Qwen2.5-1.5B/3B, Gemma 2 2B) | 1,5-3B | 8K-128K según modelo | Apache 2.0 / Gemma license | multilingüe | Referencias habituales de la categoría; datos concretos no disponibles en esta ficha |

La model card afirma que MiniCPM5-2B es competitivo con modelos de la clase 4B y superior a modelos de tamaño comparable en código, matemáticas, contexto largo, tool use y tareas agénticas, pero no se aportan cifras que permitan verificar esa comparación.

## Limitaciones y advertencias

- Al ser un checkpoint de "Midtrain", puede no estar completamente alineado para uso conversacional; es probable que requiera SFT/DPO adicional o que exista una versión final separada.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está garantizado ni documentado.
- Riesgo de alucinación inherente a modelos de 2,5B parámetros, especialmente en conocimiento factual y matemáticas complejas.
- La longitud de contexto no está cuantificada en la información disponible; debe validarse empíricamente antes de confiar en ventanas largas.
- Sesgos conocidos: no documentados en la información proporcionada; los datasets de preentrenamiento web (Ultra-FineWeb) pueden introducir sesgos de dominio y culturales.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar las licencias de los datasets subyacentes si se redistribuye el modelo o derivados.
- El rendimiento declarado como SOTA se basa en la propia model card del autor; no hay verificación independiente en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/openbmb/MiniCPM5-2B-Midtrain
- Modelo previo de la familia: https://huggingface.co/openbmb/MiniCPM5-1B
- Demo online: https://huggingface.co/spaces/openbmb/MiniCPM5-2B-Demo
- Repositorio GitHub: https://github.com/OpenBMB/MiniCPM
- Informe técnico MiniCPM (arXiv 2506.07900): https://arxiv.org/pdf/2506.07900
- Referencia arXiv 2602.09003: https://arxiv.org/abs/2602.09003
- Documentación MiniCPM Wiki (chino): https://openbmb.cn/docs/
- UltraData: https://ultradata.openbmb.cn/
- README en chino: https://huggingface.co/openbmb/MiniCPM5-2B/blob/main/README-cn.md

# fpadovani/eus-latn-100mb-after-ppt-Dp-100mb-ckpt500_seed455

## Resumen

El modelo `fpadovani/eus-latn-100mb-after-ppt-Dp-100mb-ckpt500_seed455` es un ajuste fino (fine-tune) de un modelo base GPT-2 de 124 millones de parámetros, desarrollado por fpadovani (afiliado a la Universidad de Groningen según el enlace de Weights & Biases). Se trata de un experimento de investigación centrado en el entrenamiento con un tokenizer personalizado para un corpus etiquetado como "eus-latn" (posiblemente euskera o latín, aunque no se especifica en la documentación). El modelo fue entrenado mediante Supervised Fine-Tuning (SFT) usando la librería TRL de Hugging Face.

La relevancia de este modelo reside en su naturaleza experimental: explora el impacto de un tokenizer específico y un ajuste fino supervisado sobre un modelo pequeño tipo GPT-2. No está pensado para producción, sino para estudiar el comportamiento de modelos compactos con vocabularios adaptados a dominios lingüísticos concretos. La información pública es muy limitada: no se declaran licencia, idiomas soportados, ni métricas de rendimiento, lo que dificulta su evaluación objetiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (Transformer decoder) |
| Parametros totales | 124.770.816 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (por defecto en GPT-2: 1024 tokens, no confirmado) |
| Tipos de cuantizacion | no disponible (solo safetensors en precisión original) |
| Idiomas soportados | no disponible (el nombre sugiere euskera/latín, sin confirmar) |
| Licencia | no disponible (la model card indica "license" sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura GPT-2, un transformer decoder autoregresivo con 124 millones de parámetros. Según la model card, es un fine-tune del modelo `fpadovani/eus-latn-100mb-ppt-Dp-100mb_seed455`, que a su vez parece ser un modelo preentrenado desde cero con un tokenizer propio (el prefijo "eus-latn" sugiere un vocabulario adaptado a un corpus lingüístico específico). El entrenamiento de ajuste fino se realizó con SFT (Supervised Fine-Tuning) utilizando la librería TRL (versión 0.23.0), con Transformers 4.56.2 y PyTorch 2.11.0.

No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens, ni el proceso de preentrenamiento del modelo base. El nombre del checkpoint "ckpt500" indica que es el checkpoint número 500 de un entrenamiento más largo. No hay información sobre técnicas como RLHF, DPO o decodificación especulativa.

## Capacidades

- Generación de texto autoregresiva: el modelo puede completar o generar texto a partir de un prompt, como se muestra en el ejemplo de la model card (pregunta sobre una máquina del tiempo).
- Chat simple: el pipeline de ejemplo usa roles de usuario, lo que sugiere que el fine-tuning SFT podría haber incluido datos conversacionales, aunque no se confirma.
- Capacidades multilingües: no disponibles; el nombre del modelo sugiere un enfoque en euskera o latín, pero no hay documentación al respecto.
- Tool calling, agentes, razonamiento multi-paso, visión, audio: no disponibles.

## Casos de uso

- Investigación académica sobre tokenización: el modelo sirve para estudiar cómo un tokenizer específico (eus-latn) afecta al rendimiento de un modelo pequeño en tareas de generación de texto. Un investigador podría comparar este checkpoint con el modelo base o con otros seeds para analizar la estabilidad del entrenamiento.
- Experimentos de fine-tuning con TRL: al ser un ejemplo de SFT con TRL, puede utilizarse como referencia para reproducir pipelines de ajuste fino en modelos pequeños, especialmente en entornos con recursos limitados.
- Evaluación de modelos compactos en dominios lingüísticos específicos: si el corpus eus-latn corresponde a una lengua minoritaria, este modelo podría servir para probar técnicas de adaptación a idiomas con pocos recursos, aunque sin métricas publicadas su utilidad práctica es limitada.
- Pruebas de infraestructura de inferencia: al ser un modelo pequeño (124M), es adecuado para validar despliegues en plataformas como FriendliAI o en entornos locales con GPUs modestas, antes de escalar a modelos mayores.
- Generación de texto controlada en entornos de desarrollo: un desarrollador podría usarlo como modelo de juguete para prototipar aplicaciones de generación de texto (chatbots simples, completado de frases) sin preocuparse por costes de inferencia.
- Análisis de sesgos en modelos pequeños: al ser un modelo de investigación, puede emplearse para estudiar sesgos lingüísticos o culturales presentes en el corpus de entrenamiento, aunque no hay documentación sobre este aspecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar. El autor no proporciona comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 124M parámetros, en fp32 ocupa aproximadamente 500 MB de memoria. Con cuantización a int8 (si se aplicara) podría reducirse a ~125 MB, pero no se ofrecen versiones cuantizadas.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para inferencia en fp32. Una NVIDIA GTX 1050 Ti, RTX 2060 o superior sería adecuada. También puede ejecutarse en CPU con razonable velocidad.
- Compatibilidad con GPUs de consumo: sí, cabe en cualquier GPU consumer moderna.
- Opciones de despliegue: compatible con Transformers (pipeline de Hugging Face), TGI (Text Generation Inference), vLLM (si se convierte el formato), llama.cpp (si se exporta a GGUF, aunque no se proporciona). También está disponible en FriendliAI como servicio gestionado.
- Latencia y throughput: no disponibles. Para un modelo de 124M, se espera una latencia de decenas de milisegundos por token en GPU moderna, pero no hay mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| fpadovani/eus-latn-100mb-after-ppt-Dp-100mb-ckpt500_seed455 | 124M | no disponible | no disponible | Fine-tune SFT de GPT-2 con tokenizer propio |
| GPT-2 (124M) original de OpenAI | 124M | 1024 | MIT | Modelo base genérico, sin fine-tune específico |
| DistilGPT-2 (82M) | 82M | 1024 | MIT | Versión destilada de GPT-2, más rápida y ligera |

No hay datos de rendimiento comparativo. La comparativa se limita a parámetros y disponibilidad, ya que el modelo evaluado carece de métricas publicadas.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al ser un fine-tune de GPT-2, hereda los sesgos del modelo base, que pueden incluir estereotipos de género, raza o cultura presentes en los datos de preentrenamiento originales.
- Riesgo de alucinación: alto, como en todos los modelos generativos pequeños. Puede producir texto plausible pero factualmente incorrecto.
- Limitaciones de contexto e idioma: la longitud de contexto no está confirmada (probablemente 1024 tokens por ser GPT-2). El idioma de entrenamiento no está especificado; el nombre sugiere euskera o latín, pero no hay garantía de que el modelo funcione bien en otros idiomas.
- Restricciones de licencia: la licencia no está especificada en la model card. Esto impide su uso comercial sin consultar al autor. Se recomienda contactar con fpadovani antes de cualquier uso productivo.
- Carencia de documentación: no hay información sobre el dataset, el proceso de preentrenamiento, ni métricas de evaluación. Esto limita seriamente su reproducibilidad y confiabilidad.
- Tamaño del repositorio: 7.7 GB para un modelo de 124M es inusualmente grande, lo que sugiere que se incluyen múltiples archivos de pesos (quizás en fp32 y otras precisiones) o checkpoints adicionales. Esto puede complicar la descarga y el despliegue.

## Enlaces

- [Hugging Face - fpadovani/eus-latn-100mb-after-ppt-Dp-100mb-ckpt500_seed455](https://huggingface.co/fpadovani/eus-latn-100mb-after-ppt-Dp-100mb-ckpt500_seed455)
- [Modelo base en Hugging Face - fpadovani/eus-latn-100mb-ppt-Dp-100mb_seed455](https://huggingface.co/fpadovani/eus-latn-100mb-ppt-Dp-100mb_seed455)
- [Página del modelo en FriendliAI](https://friendli.ai/models/fpadovani/eus-latn-100mb-after-ppt-Dp-100mb-ckpt500_seed455)
- [Weights & Biases run del entrenamiento](https://wandb.ai/f-padovani-university-of-groningen/new_tokenizers/runs/z2957tx1)

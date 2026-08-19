# Hailay/VEXMLM-TiQuAD

## Resumen

VEXMLM-TiQuAD es un modelo de respuesta a preguntas extractiva (extractive question answering) para el tigriña, una lengua etíope de bajos recursos que utiliza el alfabeto Ge'ez. Ha sido desarrollado por Hailay Kidu Teklehaymanot y colaboradores, y se presenta como un checkpoint complementario del trabajo VEXMLM, cuyo objetivo es ampliar el vocabulario de XLM-R para lenguas africanas basadas en Ge'ez. El modelo se obtiene fine-tuneando VEXMLM, una versión de XLM-R con un vocabulario extendido de 280.002 subwords (30.000 tokens Ge'ez añadidos), sobre el dataset TiQuAD, específico para QA en tigriña.

La arquitectura es un transformer encoder del tipo `XLMRobertaForQuestionAnswering`, con una ventana de contexto máxima de 256 tokens. El modelo se distribuye en cinco checkpoints independientes (semillas 42-46), cuyos resultados se promedian para obtener la métrica oficial. Su relevancia radica en ser uno de los pocos recursos públicos de QA extractiva para tigriña, con una evaluación rigurosa sobre 926 preguntas de test y una licencia Apache 2.0 que permite uso comercial y académico. Está pensado para investigadores y desarrolladores que trabajan en procesamiento de lenguaje natural para lenguas subrepresentadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `XLMRobertaForQuestionAnswering` (transformer encoder) |
| Parametros totales | No disponible (similar a XLM-R base, ~270M, no confirmado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 256 tokens (max sequence length de fine-tuning) |
| Tipos de cuantizacion | No disponible (solo safetensors en precisión bf16) |
| Idiomas soportados | Tigriña (el modelo base cubre también amárico, pero el fine-tuning es solo tigriña) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de VEXMLM, que a su vez es una extensión de XLM-R base. VEXMLM amplía el vocabulario original de XLM-R (un SentencePiece de ~250k subwords) fusionando 30.000 tokens adicionales específicos del alfabeto Ge'ez, alcanzando un total de 280.002 subwords. Este vocabulario extendido se obtiene tras un entrenamiento continuado de MLM (masked language modeling) sobre corpus en amárico y tigriña. Posteriormente, VEXMLM-TiQuAD se fine-tunea para la tarea de QA extractiva, donde el modelo recibe un par (pregunta, contexto) y predice el intervalo de tokens que contiene la respuesta.

El fine-tuning se realizó con una configuración fija: secuencias de hasta 256 tokens, batch size de 32, 4 épocas, learning rate de 2e-5 con decaimiento lineal y 10% de warmup, weight decay de 0.01, gradiente clipping a 1.0, optimizador AdamW y precisión bf16. Se entrenaron todos los parámetros del modelo. El proceso se repitió con cinco semillas distintas (42-46) para evaluar la estabilidad, y cada checkpoint se guarda en un subdirectorio separado. No se aplicaron técnicas de RLHF ni DPO; es un fine-tuning supervisado clásico. La reproducibilidad está garantizada mediante `enable_full_determinism` y otras configuraciones de entorno.

## Capacidades

- Respuesta a preguntas extractiva en tigriña: dado un contexto y una pregunta, devuelve el fragmento de texto que responde.
- Soporte de contexto largo limitado: ventana máxima de 256 tokens, suficiente para párrafos cortos o secciones de documentos.
- Procesamiento de texto en alfabeto Ge'ez, gracias a la extensión de vocabulario.
- No soporta tool calling, ni generación de agentes, ni razonamiento multi-paso.
- No tiene capacidades multimodales (solo texto).
- Multilingüismo restringido: aunque el modelo base fue pre-entrenado en amárico y tigriña, este checkpoint solo ha sido evaluado en tigriña.

## Casos de uso

- Extracción de información de documentos religiosos y noticias en tigriña: el modelo puede localizar respuestas concretas en textos largos, útil para investigación humanística o periodística.
- Sistemas de atención al cliente en tigriña: integrado en un chatbot, puede responder preguntas frecuentes sobre productos o servicios a partir de una base de conocimiento en texto plano.
- Búsqueda de respuestas en corpus académicos: investigadores que trabajan con literatura etíope pueden usarlo para localizar pasajes relevantes a partir de preguntas naturales.
- Asistente para traductores y lingüistas: ayuda a verificar si una afirmación está respaldada por un texto fuente, extrayendo la evidencia textual.
- Generación de conjuntos de datos de QA para tigriña: el modelo puede pre-anotar respuestas en corpus nuevos, acelerando la creación de datasets etiquetados.
- Aplicaciones educativas: plataformas de aprendizaje de tigriña que permiten a los estudiantes hacer preguntas sobre lecturas y obtener respuestas exactas.

## Benchmarks y rendimiento

El modelo fue evaluado en el split de test del dataset TiQuAD, con 926 preguntas, usando cinco semillas independientes. Los resultados reportados son la media ± desviación estándar sobre esas cinco ejecuciones:

| Metrica | Valor |
|---|---|
| Exact Match (EM) | 50.24 ± 0.48 |
| F1 | 58.90 ± 0.66 |

No se han publicado comparaciones con otros modelos de QA en tigriña en la información disponible. El propio autor indica que este checkpoint es más robusto que TIGQA (otro dataset de QA tigriña con solo 67 preguntas de test), pero no se proporcionan cifras comparativas.

## Requisitos de hardware

- Tamaño del repositorio: 6.0 GB, que incluye cinco checkpoints completos (cada uno ~1.2 GB en bf16).
- VRAM estimada para inferencia: al ser un modelo tipo XLM-R base (aproximadamente 270M parámetros, aunque no confirmado), se estima que requiere entre 2 y 4 GB de VRAM en precisión fp32, y menos de 2 GB en cuantización de 8 bits. No se han publicado mediciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3060) puede ejecutar inferencia. Para fine-tuning se usó una NVIDIA A100-PCIE-40GB.
- Opciones de despliegue: compatible con la librería `transformers` de Hugging Face; puede servirse con vLLM o TGI si se convierte a los formatos adecuados, aunque no se ha documentado explícitamente. También es posible usar llama.cpp si se convierte a GGUF, pero no hay soporte nativo.
- Latencia y throughput: no disponibles; dependerán del hardware y del tamaño del lote.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables directamente evaluados contra VEXMLM-TiQuAD. El propio autor menciona TIGQA como otro dataset de QA tigriña, pero no se ofrecen resultados comparativos. En el ámbito de lenguas de bajos recursos, alternativas como XLM-R original (sin extensión de vocabulario) podrían servir como referencia, pero no hay datos publicados para esta tarea específica. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo está fine-tuneado exclusivamente para tigriña y solo sobre el dataset TiQuAD; su rendimiento en otros idiomas, dominios o formatos de pregunta no ha sido caracterizado.
- Los corpus de pre-entrenamiento de VEXMLM provienen mayoritariamente de dominios religiosos y de noticias, por lo que el modelo puede reflejar sesgos de esos ámbitos y tener un vocabulario limitado en otros temas.
- La ventana de contexto de 256 tokens es corta; no es adecuado para documentos extensos sin segmentación previa.
- No se realizó búsqueda de hiperparámetros; la configuración es fija y las comparaciones con otros modelos en el paper son de una sola semilla, lo que limita la generalización de las conclusiones.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo no ha sido auditado para sesgos ni para seguridad; se recomienda validación adicional antes de desplegarlo en producción.
- La evaluación con cinco semillas muestra una desviación estándar baja (0.48 en EM, 0.66 en F1), lo que indica estabilidad, pero no garantiza el comportamiento en entradas arbitrarias.

## Enlaces

- Modelo en Hugging Face: [Hailay/VEXMLM-TiQuAD](https://huggingface.co/Hailay/VEXMLM-TiQuAD)
- Modelo base: [Hailay/VEXMLM](https://huggingface.co/Hailay/VEXMLM)
- Repositorio oficial (código, scripts de fine-tuning y evaluación): [https://github.com/hailaykidu/VEXMLM](https://github.com/hailaykidu/VEXMLM)
- Paper: Teklehaymanot, H. K., Yadeta, G., & Nejdl, W. (2026). "Expanding the Lexicon of Ge'ez Based African Languages: A Comparative Study of Amharic and Tigrinya". Proceedings of the Workshop on Language Models for Underserved Communities (LM4UC) at IJCAI 2026. (Enlace directo no disponible en la información proporcionada.)

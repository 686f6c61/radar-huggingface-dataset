# aisingapore/SEA-LION-ModernBERT-300M-checkpoints

## Resumen

SEA-LION-ModernBERT-300M-checkpoints es un repositorio de checkpoints intermedios de un modelo encoder-only desarrollado por el AI Products Pillar de AI Singapore, dentro de la iniciativa SEA-LION (Southeast Asian Languages In One Network). El modelo está construido sobre la arquitectura ModernBERT-base y combina el tokenizador SentencePiece de Gemma 3, con un vocabulario de 262.000 tokens, lo que permite una compresión y fertilidad de tokenización notablemente superiores para los sistemas de escritura complejos de las lenguas del Sudeste Asiático.

El modelo se entrenó en dos fases masivas: una fase de pre-entrenamiento sobre 2 billones de tokens y una fase de mid-training sobre 1 billón adicional, cubriendo 13 idiomas (birmano, chino, inglés, filipino, indonesio, javanés, jemer, laosiano, malayo, sundanés, tamil, tailandés y vietnamita) junto con código. Este repositorio concreto libera los checkpoints intermedios de ambas etapas, tanto en formato Composer como HuggingFace, para facilitar la investigación, la transparencia y el desarrollo de aplicaciones posteriores.

La relevancia actual de este modelo reside en su enfoque específico para lenguas de baja representación en los ecosistemas de modelos pre-entrenados, y en su arquitectura moderna basada en ModernBERT, que incorpora atención lineal y decodificación eficiente, lo que permite contextos de 8.000 tokens con un coste computacional contenido. Su licencia MIT lo hace especialmente atractivo para uso comercial sin restricciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT-base (encoder-only transformer) |
| Parametros totales | 300 millones (aprox.) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 8.000 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Birman, chino, ingles, filipino, indonesio, javanes, khmer, lao, malayo, sundan, tamil, tailandes, vietnamita (13 idiomas) |
| Licencia | MIT |
| Formato de pesos | safetensors (checkpoints HuggingFace) y Composer (.pt) |

## Arquitectura y entrenamiento

El modelo adopta la arquitectura ModernBERT-base, un transformer encoder-only que introduce mejoras respecto a BERT clásico, como atención lineal para reducir la complejidad cuadrática y una mayor eficiencia en el procesamiento de secuencias largas. La principal innovación técnica es la integración del tokenizer de Gemma 3, un tokenizer SentencePiece con un vocabulario de 262.000 tokens, diseñado para optimizar la representación de las lenguas del Sudeste Asiático. Esto mejora la fertilidad de tokenización (menos tokens por palabra) y la compresión, lo que permite aprovechar mejor la ventana de contexto de 8.000 tokens en tareas multilingües y cross-linguales.

El entrenamiento se realizó en dos fases: una pre-entrenamiento masivo sobre 2 billones de tokens, seguido de una fase de mid-training de 1 billón de tokens adicionales. Ambas fases cubrieron código y las 13 lenguas objetivo. El repositorio incluye checkpoints de ambas etapas, con y sin anillamiento de learning rate (annealing), lo que permite a los usuarios elegir el punto de partida adecuado según su caso de uso: los checkpoints con decay son aptos para fine-tuning con warmup, mientras que los sin decay son adecuados para continuar el pre-entrenamiento (CPT).

## Capacidades

- Modelo encoder-only: no genera texto, sino representaciones contextuales para tareas de comprensión.
- Fill-mask: puede completar tokens enmascarados en texto multilingüe.
- Clasificación de texto: fine-tuning para análisis de sentimiento, clasificación de documentos, detección de intención, etc.
- Multilingüismo: soporta 13 lenguas del Sudeste Asiático, incluyendo sistemas de escritura complejos como el birman, el khmer o el tailandés.
- Continued Pre-Training (CPT): los checkpoints intermedios permiten continuar el entrenamiento sobre dominios específicos.
- Fine-tuning para tareas downstream: adaptable a cualquier tarea de clasificación o comprensión mediante cabezales específicos.
- No soporta generación de texto ni tool calling (es encoder-only).

## Casos de uso

- **Análisis de sentimiento multilingüe**: el modelo puede afinarse para clasificar opiniones en redes sociales o reseñas de productos en idiomas como indonesio, tailandés o vietnamita, donde los modelos genéricos suelen tener un rendimiento pobre.
- **Clasificación de documentos legales y administrativos**: con su capacidad para manejar 8.000 tokens, puede procesar documentos extensos en múltiples idiomas del Sudeste Asiático, ayudando a organizar archivos gubernamentales o corporativos.
- **Continuación de pre-entrenamiento (CPT) para dominios específicos**: los checkpoints intermedios permiten entrenar sobre corpus médicos, financieros o legales de la región, adaptando el modelo a la terminología local.
- **Sistemas de búsqueda y recuperación de información (RAG)**: aunque este repositorio no contiene los modelos de embedding, los checkpoints pueden ser fine-tuned para generar representaciones de texto para sistemas de búsqueda en lenguas de baja representación.
- **Detección de idioma y clasificación de texto multilingüe**: el modelo puede distinguir entre las 13 lenguas soportadas, útil para enrutamiento de consultas en centros de servicio multilingües.
- **Investigación en NLP para lenguas de baja representación**: el repositorio ofrece checkpoints intermedios que permiten a los investigadores estudiar la evolución de las representaciones lingüísticas durante el entrenamiento, algo poco común en la literatura.
- **Preparación de datos para sistemas RAG**: afinando el modelo para generar embeddings, se puede crear un índice de búsqueda semántica para corpus en idiomas del Sudeste Asiático.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval ni otros benchmarks estándar. El paper asociado (arXiv:2508.12243) podría contener datos de evaluación, pero no se encuentran disponibles en los materiales proporcionados.

## Requisitos de hardware

- **VRAM estimada**: con 300 millones de parámetros, el modelo en FP16 ocupa aproximadamente 600 MB de VRAM, por lo que es ejecutable en cualquier GPU con más de 2 GB de VRAM.
- **GPUs compatibles**: cualquier GPU consumer moderna (NVIDIA RTX 3060, RTX 4070, RTX 4090) es suficiente para inferencia y fine-tuning. Para fine-tuning con batch grande, se recomienda una GPU con al menos 8 GB de VRAM.
- **Despliegue**: al ser un encoder-only, se integra fácilmente con HuggingFace Transformers, Sentence-Transformers (para embeddings) y frameworks de fine-tuning como PyTorch Lightning.
- **Latencia**: para una secuencia de 512 tokens en una GPU consumer, la inferencia debería completarse en menos de 50 ms, aunque no se dispone de datos oficiales de throughput.
- **Opciones de despliegue**: vLLM no es aplicable (modelos encoder), pero se puede usar con pipelines de HuggingFace, ONNX Runtime o TensorRT para optimización.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| SEA-LION-ModernBERT-300M | ~300M | 8K | 13 SEA + chino + ingles | MIT | Multilingüe SEA, encoder-only |
| ModernBERT-base | 149M | 8K | Ingles (principalmente) | Apache-2.0 | Encoder general, eficiente |
| XLM-R-large | 550M | 512 tokens | 100 idiomas | MIT | Multilingüe, encoder clásico |
| BERT multilingual | 172M | 512 tokens | 104 idiomas | Apache-2.0 | Multilingüe, encoder clásico |

El modelo destaca frente a XLM-R y BERT multilingual por su ventana de contexto de 8.000 tokens (frente a 512) y por su tokenizer específico para lenguas del Sudeste Asiático, que mejora la compresión de texto en esos idiomas. Frente a ModernBERT-base, ofrece una cobertura multilingüe mucho más amplia y un mayor tamaño. No se dispone de datos de benchmarks comparativos directos en la información proporcionada.

## Limitaciones y advertencias

- **No es un modelo generativo**: al ser encoder-only, no puede generar texto, código ni realizar tareas de conversación. No es adecuado para chatbots ni generación de contenido.
- **No probado contra usos adversariales**: la model card indica que el modelo no fue testeado para robustez frente a ataques adversariales, lo que puede limitar su uso en aplicaciones de seguridad crítica.
- **Riesgo de alucinación**: aunque los encoders no generan texto, los fine-tunes posteriores pueden heredar sesgos del modelo base, lo que puede provocar clasificaciones incorrectas o respuestas inconsistentes.
- **Idiomas limitados**: aunque cubre 13 idiomas del Sudeste Asiático, no soporta otros idiomas de la región como el camboyano o el lao no están incluidos (aunque sí el khmer y el lao en la lista).
- **Dependencia del tokenizer de Gemma 3**: el uso del tokenizer de Gemma 3 puede generar representaciones subóptimas para idiomas que no estén bien cubiertos por el vocabulario de 262K tokens, a pesar de la optimización para SEA.
- **Licencia MIT**: aunque permite uso comercial sin restricciones, no hay garantía de soporte ni de actualizaciones por parte de AI Singapore.
- **Tamaño del repositorio**: 22.6 GB de pesos, lo que puede ser una barrera de descarga para equipos con ancho de banda limitado.

## Enlaces

- [Repositorio HuggingFace de los checkpoints](https://huggingface.co/aisingapore/SEA-LION-ModernBERT-300M-checkpoints)
- [Modelo final pre-entrenado (SEA-LION-ModernBERT-300M)](https://huggingface.co/aisingapore/SEA-LION-ModernBERT-300M)
- [Modelo de embeddings (SEA-LION-ModernBERT-Embedding-300M)](https://huggingface.co/aisingapore/SEA-LION-ModernBERT-Embedding-300M)
- [Paper en arXiv (2508.12243)](https://arxiv.org/abs/2508.12243)
- [Documentación oficial de SEA-LION](https://docs.sea-lion.ai/models/sea-embedding/sea-modernbert)
- [Repositorio GitHub de SEA-LION](https://github.com/aisingapore/sealion)
- [Modelo ModernBERT-base de referencia](https://huggingface.co/answerdotai/ModernBERT-base)

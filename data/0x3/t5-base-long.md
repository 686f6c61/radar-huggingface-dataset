# 0x3/t5-base-long

## Resumen

El modelo `0x3/t5-base-long` es un modelo T5 v1.1 base preentrenado sobre un corpus japonés. Fue desarrollado por Retrieva, Inc. y publicado en HuggingFace por el usuario 0x3. Se trata de un transformer encoder-decoder con aproximadamente 220 millones de parámetros, diseñado para tareas de procesamiento de lenguaje natural en japonés bajo el paradigma texto-a-texto.

El modelo se entrenó con T5X sobre Google Cloud TPU v4-8, utilizando como datos la parte japonesa de mC4 y la Wikipedia japonesa (versión 20220920). La longitud de entrada utilizada durante el preentrenamiento fue de 512 tokens. Su relevancia radica en ofrecer una base en japonés para tareas como traducción, resumen, generación de texto y otras transformaciones de texto, con un tamaño compacto que facilita su adaptación mediante fine-tuning.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (T5 v1.1) |
| Parámetros totales | ~220 millones |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (entrada durante el preentrenamiento); no disponible para la máxima |
| Tipos de cuantización | no disponible |
| Idiomas soportados | japonés (ja) |
| Licencia | CC-BY-SA 4.0 (uso comercial permitido, se solicita contactar con Retrieva antes) |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura T5 v1.1, que incorpora mejoras sobre el T5 original: activación GEGLU en la capa feed-forward en lugar de ReLU, dropout desactivado durante el preentrenamiento (debe reactivarse en el fine-tuning), sin compartir parámetros entre la capa de embeddings y la capa clasificadora, y una nomenclatura donde "xl" y "xxl" sustituyen a "3B" y "11B". El modelo fue preentrenado desde cero con T5X y posteriormente convertido al formato de HuggingFace Transformers.

El corpus de entrenamiento está compuesto por la parte japonesa de mC4 y la Wikipedia japonesa (20220920). Se aplicaron filtros para eliminar documentos que no contuvieran ningún carácter hiragana, lo que descarta textos en inglés o chino, y un filtrado de tipo whitelist basado en el dominio de nivel superior de la URL para excluir sitios de afiliados. Los hiperparámetros de entrenamiento incluyen dropout 0.0, batch size 256, precisión fp32, longitud de entrada 512 y de salida 114. Se usó el optimizador Adafactor con learning rate base 1.0 y 10000 pasos de warmup. El modelo se entrenó durante 2097152 pasos.

## Capacidades

- Generación de texto en japonés: al ser un modelo encoder-decoder, puede producir texto en japonés a partir de una entrada.
- Tareas texto-a-texto: es adecuado para traducción, resumen, paráfrasis, corrección gramatical y otras transformaciones de texto mediante fine-tuning.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: únicamente japonés; no se indica soporte para otros idiomas.
- Capacidades especiales (visión, audio, thinking mode): no disponible.

## Casos de uso

- Resumen automático de documentos japoneses: el modelo puede afinarse con pares de documento y resumen para generar resúmenes concisos. Su arquitectura encoder-decoder es especialmente adecuada para esta tarea.
- Traducción automática japonés-inglés o japonés-español: mediante fine-tuning en corpus paralelos, el modelo puede traducir texto japonés a otros idiomas. El preentrenamiento en japonés proporciona una buena representación del idioma de origen.
- Preguntas y respuestas sobre corpus japonés: con fine-tuning en contextos y respuestas, el modelo puede responder preguntas basadas en documentos. Su ventana de 512 tokens permite procesar pasajes de longitud moderada.
- Corrección gramatical y de estilo: el modelo puede aprender a transformar texto con errores en texto corregido, aprovechando la formulación texto-a-texto de T5.
- Extracción de información: puede afinarse para tareas como reconocimiento de entidades o extracción de relaciones, generando las entidades o relaciones en formato texto.
- Chatbot de atención al cliente en japonés: con fine-tuning en diálogos, el modelo puede generar respuestas contextuales. Su tamaño compacto (~220M) permite desplegarlo en infraestructura modesta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada.
- GPU recomendadas: no disponible.
- Capacidad en GPU de consumo: por su tamaño (~220M), se espera que sea ejecutable en GPUs de consumo, aunque no se proporcionan cifras oficiales.
- Opciones de despliegue: HuggingFace Transformers (PyTorch) y T5X, mencionados en la documentación del modelo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con modelos similares en la información proporcionada.

## Limitaciones y advertencias

- Modelo base sin fine-tuning: no está optimizado para tareas específicas sin adaptación posterior.
- Idioma: solo japonés; no soporta otros idiomas.
- Contexto: entrenado con una longitud de entrada de 512 tokens, por lo que puede tener dificultades con entradas más largas.
- Licencia CC-BY-SA 4.0: aunque permite uso comercial, se solicita contactar con Retrieva antes de su uso. La naturaleza copyleft de la licencia puede imponer obligaciones sobre obras derivadas.
- Sesgos: los corpus de entrenamiento (Wikipedia y mC4/ja) pueden contener sesgos no evaluados.
- Alucinación: como modelo generativo, existe riesgo de producir contenido incorrecto o inventado.
- No se han publicado evaluaciones de seguridad o alineación.

## Enlaces

- HuggingFace: https://huggingface.co/0x3/t5-base-long
- Paper de T5: https://arxiv.org/abs/2002.05202
- Repositorio T5X: https://github.com/google-research/t5x
- Repositorio T5 original: https://github.com/google-research/text-to-text-transfer-transformer
- Nota de Retrieva (en japonés): https://note.com/retrieva/n/n7b4186dc5ada
- Contacto: pr@retrieva.jp

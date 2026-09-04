# onnx-community/bert-finetuned-pos-ONNX

## Resumen

Este modelo es una versión ONNX de `bert-finetuned-pos`, un modelo BERT fine-tuneado para el etiquetado de categorías gramaticales (POS, Part-of-Speech) sobre el dataset CoNLL-2003. El equipo `onnx-community` lo ha convertido automáticamente al formato ONNX para que pueda ejecutarse con Transformers.js, ONNX Runtime u otros motores de inferencia que soporten este formato. El modelo original fue desarrollado por Alireza0017 a partir de `bert-base-cased`, con entrenamiento supervisado de clasificación de tokens. Es relevante para tareas de procesamiento de lenguaje natural en inglés que requieren análisis gramatical local, especialmente en entornos donde se necesita un despliegue ligero, rápido y multiplataforma. Al ser una conversión a ONNX, mantiene la misma arquitectura Transformer (codificador BERT) y no introduce cambios en los pesos, por lo que se espera un comportamiento equivalente al modelo PyTorch original. El tamaño del repositorio es de 0.9 GB, lo que incluye los artefactos ONNX para su uso en distintos entornos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (codificador BERT) |
| Parámetros totales | 110M (según `bert-base-cased`) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (según `bert-base-cased`) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo es una versión ONNX del transformer BERT fine-tuneado para token classification. La arquitectura es la de un codificador BERT estándar, con 12 capas, 768 unidades ocultas y 12 cabezas de atención, utilizada como base para asignar una etiqueta POS a cada token de una secuencia. El entrenamiento se realizó sobre el dataset CoNLL-2003, un corpus de referencia en inglés para tareas de etiquetado de tokens (POS y NER). Durante el fine-tuning se empleó padding dinámico, una tasa de aprendizaje de 2e-5, batch de entrenamiento y evaluación de 8, optimizador AdamW, scheduler lineal y un total de 3 épocas. El autor reporta una pérdida de entrenamiento de 0.0872 con 5268 pasos globales. No hay evidencia de que se haya aplicado RLHF, DPO ni ninguna técnica de alineación posterior; es un fine-tuning supervisado. La conversión a ONNX se realizó automáticamente mediante un espacio de Hugging Face, por lo que no hay innovaciones técnicas adicionales más allá del cambio de formato.

## Capacidades

- Clasificación de tokens para etiquetar la categoría gramatical (POS) de cada palabra en oraciones en inglés.
- Ejecución en múltiples entornos gracias al formato ONNX: navegador con Transformers.js, aplicaciones de escritorio con ONNX Runtime, dispositivos móviles, etc.
- Token classification mediante pipeline de Transformers.js, con salida de etiquetas y puntuaciones por token.
- Soporte de uso con tokenizers de BERT, incluyendo subword tokenization y tratamiento de tokens especiales (`[CLS]`, `[SEP]`).
- No soporta tool calling, function calling ni razonamiento multi-paso agente; es un modelo discriminativo de etiquetado.
- Capacidad multilingüe: solo inglés. No se han evaluado otros idiomas, aunque la arquitectura base permite un funcionamiento limitado con otros idiomas si se entrena.

## Casos de uso

- Análisis gramatical de textos en inglés: el modelo puede asignar etiquetas POS a cada token, lo que permite obtener la estructura gramatical de frases para su posterior análisis sintáctico o estadístico.
- Preprocesamiento para traducción automática: el etiquetado POS ayuda a desambiguar palabras polisémicas y mejorar la calidad de los sistemas de traducción cuando se integra como paso previo.
- Extracción de información en documentos legales o técnicos: al identificar nombres, verbos y adjetivos, el modelo facilita la localización de entidades de interés en textos no estructurados.
- Corrección gramatical asistida: un sistema de corrección puede usar las etiquetas POS para detectar errores de concordancia, tiempos verbales o uso incorrecto de artículos.
- Asistente educativo de gramática: un tutor puede analizar la frase del estudiante, etiquetar cada palabra con su función gramatical y explicar errores de concordancia o uso de tiempos verbales.
- Análisis gramatical en tiempo real en el navegador: gracias a Transformers.js, el modelo ONNX se puede ejecutar en una web sin servidor, permitiendo etiquetar textos mientras el usuario escribe, sin enviar datos a un backend.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card original no incluye métricas de evaluación (el campo `model-index` contiene una lista vacía), por lo que no es posible comparar su rendimiento con otros modelos de etiquetado POS de forma objetiva.

## Requisitos de hardware

- No se proporcionan datos de VRAM, latencia o throughput en la información disponible. El modelo tiene alrededor de 110 millones de parámetros, por lo que es ligero y puede ejecutarse en CPU y en GPU de consumo, pero no hay cifras oficiales.
- El repositorio ONNX tiene un tamaño de 0.9 GB, lo que sugiere que puede contener múltiples variantes del modelo o pesos en precisión completa (fp32).
- Para inferencia local, se recomienda ONNX Runtime en CPU o GPU, o Transformers.js en el navegador (WebGPU).
- Las opciones de despliegue incluyen: ONNX Runtime, ONNX Runtime Web, ONNX Runtime Mobile y Transformers.js. No está pensado para vLLM ni TGI, que se orientan a modelos generativos en PyTorch.

## Comparativa con modelos similares

No se dispone de una comparativa directa en los datos proporcionados. Se puede indicar como referencia que el modelo es una versión ONNX del fine-tune de `bert-base-cased` sobre CoNLL-2003, por lo que su comportamiento es equivalente al de cualquier BERT base etiquetador de POS. No hay datos de benchmarks publicados que permitan una comparación objetiva.

## Limitaciones y advertencias

- El modelo fue convertido automáticamente a ONNX sin una evaluación exhaustiva adicional, por lo que puede presentar diferencias numéricas menores respecto al modelo PyTorch original debido a las optimizaciones del grafo.
- No se han documentado sesgos específicos, pero al entrenarse sobre CoNLL-2003 puede reflejar los sesgos presentes en ese corpus (por ejemplo, predominio de textos periodísticos en inglés, distribución de géneros limitada).
- La longitud de contexto está limitada a 512 tokens, heredada de `bert-base-cased`, por lo que no es adecuado para documentos muy largos.
- Solo soporta inglés; el rendimiento en otros idiomas no está garantizado.
- Los modelos de token classification pueden producir alucinaciones en el sentido de asignar etiquetas incorrectas a tokens ambiguos o fuera de vocabulario.
- Licencia Apache 2.0: el uso comercial está permitido, pero la atribución es obligatoria y se debe incluir el aviso de licencia al redistribuir.

## Enlaces

- Modelo en Hugging Face: <https://huggingface.co/onnx-community/bert-finetuned-pos-ONNX>
- Modelo base original: <https://huggingface.co/Alireza0017/bert-finetuned-pos>
- Espacio de conversión a ONNX: <https://huggingface.co/spaces/onnx-community/convert-to-onnx>
- Tutorial de inferencia con ONNX Runtime y C#: <https://onnxruntime.ai/docs/tutorials/csharp/bert-nlp-csharp-console-app.html>
- Documentación de token-classification en Transformers.js: <https://huggingface.co/docs/transformers.js/api/pipelines#module_pipelines.TokenClassificationPipeline>

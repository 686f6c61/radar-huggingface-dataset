# jonleed/clinical-note-biobart-large-lora

## Resumen

El modelo `jonleed/clinical-note-biobart-large-lora` es un adaptador LoRA (Low-Rank Adaptation) desarrollado por el usuario jonleed, que se integra sobre el modelo base `GanjinZero/biobart-large`, un BART adaptado al dominio biomédico. El adaptador se ha ajustado sobre el dataset MTS-Dialog, un corpus de diálogos médicos, con el objetivo de generar resúmenes de notas clínicas a partir de conversaciones entre médico y paciente. Se trata de un artefacto de investigación educativa, no validado clínicamente, que demuestra cómo aplicar técnicas de adaptación eficiente de parámetros a modelos generativos biomédicos.

La relevancia actual radica en la creciente demanda de herramientas de documentación clínica automatizada que reduzcan la carga administrativa de los profesionales sanitarios. Al emplear LoRA, el adaptador añade un número reducido de parámetros entrenables sobre un modelo de 400 millones de parámetros, lo que permite un ajuste eficiente con requisitos de cómputo moderados. La arquitectura subyacente es un transformer BART (encoder-decoder) con 12 capas, y la longitud de contexto heredada del modelo base es de 1024 tokens, aunque este dato no se especifica en la documentación del adaptador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BART (encoder-decoder) con adaptador LoRA sobre BioBART-large |
| Parametros totales | No disponible (el adaptador LoRA añade un número reducido de parámetros; el modelo base tiene ~400M) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, típicamente 1024 tokens en BART) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el modelo base BioBART está entrenado principalmente en inglés biomédico) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo base es `GanjinZero/biobart-large`, un BART-large preentrenado en corpus biomédicos (PubMed, PMC, etc.) mediante un objetivo de denoising. Sobre este modelo se ha aplicado un adaptador LoRA con rango 8, alpha 64 y dropout 0.01, que modifica únicamente las proyecciones de query y value en las capas de atención. El entrenamiento se realizó sobre el dataset MTS-Dialog, que contiene diálogos médico-paciente y sus correspondientes notas clínicas resumidas, siguiendo el prompt y la construcción de objetivos del proyecto original. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. La innovación principal es la eficiencia del ajuste: al congelar el modelo base y entrenar solo los parámetros LoRA, se reduce drásticamente el coste computacional y de almacenamiento.

## Capacidades

- Generación de resúmenes de notas clínicas a partir de diálogos médicos multi-turno.
- Comprensión de terminología biomédica y estructuras de conversación clínica, gracias al preentrenamiento de BioBART.
- Adaptación específica al dominio médico mediante el ajuste con MTS-Dialog.
- No se han documentado capacidades de tool calling, razonamiento multi-paso, visión o audio.
- El modelo es puramente generativo de texto, orientado a la tarea de summarization.

## Casos de uso

- Documentación clínica automatizada: el adaptador puede procesar transcripciones de consultas médicas y generar borradores de notas de encuentro, reduciendo el tiempo de redacción manual. Es adecuado porque el modelo base ya comprende lenguaje biomédico y el ajuste con MTS-Dialog alinea la salida con el formato de notas clínicas.
- Asistencia a profesionales sanitarios: integrado en sistemas de historia clínica electrónica, puede sugerir resúmenes preliminares que el médico revisa y corrige, mejorando la eficiencia sin sustituir el juicio clínico.
- Investigación en NLP médica: sirve como punto de partida para experimentos de adaptación eficiente (LoRA) en dominios especializados, permitiendo comparar estrategias de fine-tuning con recursos limitados.
- Generación de datos sintéticos de entrenamiento: las notas generadas pueden utilizarse para aumentar datasets de resumen clínico, siempre que se revisen y anonimicen adecuadamente.
- Educación y formación: en entornos académicos, permite demostrar el flujo completo de ajuste de un modelo biomédico con PEFT, desde la preparación del dataset hasta la inferencia.
- Prototipado rápido de asistentes de documentación: al ser un adaptador ligero, puede desplegarse en infraestructuras modestas para validar la viabilidad de un producto antes de invertir en modelos más grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como ROUGE, MMLU o HumanEval para este adaptador. El autor no reporta comparaciones con otros modelos de resumen clínico.

## Requisitos de hardware

- Al ser un adaptador LoRA, el requisito principal es el modelo base BioBART-large (~400M parámetros). En FP16, el modelo base ocupa aproximadamente 800 MB de VRAM, más el adaptador (que añade unos pocos MB). Con cuantización a 8 bits, podría caber en GPUs con 4-6 GB de VRAM.
- GPUs recomendadas: tarjetas consumer como RTX 3060 (12 GB) o superiores, o GPUs de datacenter como T4 o A10G. No se requieren A100 o H100 para inferencia.
- Es viable en CPU con llama.cpp o transformers, aunque la latencia será mayor.
- Opciones de despliegue: Hugging Face Transformers con PEFT, vLLM (si se convierte a un formato compatible), o mediante contenedores con FastAPI para servir el modelo.
- Latencia y throughput: no se han publicado datos específicos. En una GPU consumer, se espera una latencia de decodificación de unos pocos segundos para notas de 100-200 tokens, pero esto es una estimación no verificada.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa cuantitativa. El modelo se puede contextualizar con otras alternativas de resumen biomédico:

| Modelo | Base | Tamaño | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jonleed/clinical-note-biobart-large-lora | BioBART-large | ~400M + LoRA | No disponible | No disponible | Hugging Face |
| GanjinZero/biobart-large | BART-large | ~400M | 1024 (típico) | MIT (según paper) | Hugging Face |
| PubMedBERT (encoder-only) | BERT | ~110M | 512 | MIT | Hugging Face |

Nota: PubMedBERT no es generativo, por lo que no es directamente comparable en la tarea de summarization. No se han encontrado otros adaptadores LoRA específicos para resumen clínico con datos públicos de rendimiento.

## Limitaciones y advertencias

- El modelo es un artefacto educativo y no está validado clínicamente. Las notas generadas pueden contener errores, omisiones o información incorrecta.
- Riesgo de alucinación: como todo modelo generativo, puede inventar detalles clínicos que no aparecen en el diálogo de entrada.
- Sesgos: el dataset MTS-Dialog puede reflejar sesgos demográficos o lingüísticos presentes en los datos originales, lo que podría afectar a poblaciones no representadas.
- Limitaciones de idioma: el modelo base BioBART está entrenado principalmente en inglés biomédico; no se garantiza un rendimiento adecuado en otros idiomas.
- Restricciones de licencia: la licencia del adaptador no está especificada, y la del modelo base (BioBART) es MIT según su paper, pero se debe verificar antes de un uso comercial.
- Para producción, se requiere una revisión clínica exhaustiva de las salidas y un proceso de validación con métricas de calidad y seguridad.

## Enlaces

- [Hugging Face - jonleed/clinical-note-biobart-large-lora](https://huggingface.co/jonleed/clinical-note-biobart-large-lora)
- [Hugging Face - GanjinZero/biobart-large](https://huggingface.co/GanjinZero/biobart-large)
- [Paper BioBART: Pretraining and Evaluation of A Biomedical Generative Language Model](https://arxiv.org/abs/2204.03905)
- [Benchmarking Intelligent Large Language Models for Biomedical Text Summarization (Springer)](https://link.springer.com/chapter/10.1007/978-3-031-97992-7_55)

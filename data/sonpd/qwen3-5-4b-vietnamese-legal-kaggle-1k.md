# Sonpd/qwen3.5-4b-vietnamese-legal-kaggle-1K

## Resumen

Este modelo es un adaptador LoRA de 0.4 GB construido sobre el modelo base Qwen/Qwen3.5-4B, desarrollado por el usuario Sonpd. Está orientado al dominio legal vietnamita, como indica su nombre y el conjunto de datos de entrenamiento (Kaggle, 1K muestras). El modelo se publica en formato PEFT (Parameter-Efficient Fine-Tuning), lo que significa que no es un modelo completo, sino un adaptador que debe combinarse con el modelo base para su uso.

La relevancia de este modelo reside en su especialización en un dominio con escasez de recursos: el lenguaje jurídico vietnamita. Su creación se enmarca en el contexto de la competición VLSP 2025 LegalSLM, que busca modelos de lenguaje pequeños (≤ 4B parámetros) para tareas legales en vietnamita. Sin embargo, la información disponible es muy limitada: no hay detalles de entrenamiento, evaluación ni uso documentado, y el repositorio no presenta descargas ni interacciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen3.5-4B (transformer decoder-only) |
| Parametros totales | 4B (modelo base) + adaptador LoRA (tamano no especificado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base, presumiblemente 32K o 128K) |
| Tipos de cuantizacion | no disponible (formato LoRA en safetensors) |
| Idiomas soportados | vietnamita (dominio legal), mas los del modelo base |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) sobre Qwen3.5-4B, un transformer decoder-only autoregresivo. La tecnica LoRA congela los pesos del modelo base e inyecta matrices de bajo rango en las capas de atencion, lo que permite un ajuste eficiente con un coste computacional reducido. El adaptador se entrena con el dataset vietnamita legal de Kaggle (1K muestras), aunque no se especifican los hiperparametros, el numero de epochs ni la configuracion de entrenamiento.

No se dispone de informacion sobre el dataset de entrenamiento mas alla del nombre "vietnamese-legal-kaggle-1K", ni sobre el uso de tecnicas como RLHF o DPO. La fecha de creacion (agosto de 2026) sugiere que es un modelo reciente, posiblemente desarrollado para la competicion VLSP 2025 LegalSLM, que exige modelos de menos de 4B parametros para tareas legales vietnamitas.

## Capacidades

- Generacion de texto en el dominio legal vietnamita: comprension y redaccion de documentos juridicos, articulos de ley y consultas legales.
- Razonamiento sobre textos legales: dado que el modelo base Qwen3.5-4B tiene capacidades de razonamiento, el adaptador busca especializarlas en el ambito juridico.
- Soporte de tool calling y function calling: heredado del modelo base Qwen3.5-4B (si este lo soporta, como es habitual en la serie Qwen3).
- Capacidades multilingues: el modelo base soporta multiples idiomas, pero el adaptador esta especificamente entrenado para vietnamita legal.
- Integracion con el ecosistema PEFT/transformers: permite carga y uso mediante la libreria `peft` de HuggingFace.

## Casos de uso

- Asistencia legal automatizada: el modelo puede responder consultas sobre legislacion vietnamita, explicar articulos de ley y ayudar a redactar documentos legales basicos, aprovechando el conocimiento del dominio adquirido en el ajuste.
- Busqueda semantica en corpus juridicos: combinado con un sistema de recuperacion, puede clasificar y extraer informacion relevante de grandes volumenes de textos legales vietnamitas.
- Resumen de sentencias y documentos judiciales: dado su entrenamiento en el dominio legal, puede generar resumenes concisos de fallos, contratos o normativas.
- Educacion juridica: como herramienta de apoyo para estudiantes de derecho que necesitan explicaciones de conceptos legales vietnamitas en lenguaje natural.
- Preprocesamiento de documentos legales: normalizacion, extraccion de entidades (fechas, articulos, referencias) y estructuracion de textos juridicos para pipelines posteriores.
- Prototipado de chatbots legales: al ser un adaptador ligero sobre un modelo de 4B, puede desplegarse en entornos con recursos limitados para crear asistentes virtuales de consulta legal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre rendimiento en tareas legales vietnamitas ni comparaciones con otros modelos. El repositorio no incluye metricas de evaluacion, y la model card no documenta ningun resultado experimental.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un adaptador LoRA sobre Qwen3.5-4B, la VRAM necesaria es la del modelo base (aproximadamente 8-10 GB en FP16, 4-5 GB en cuantizacion INT4) mas un pequeno overhead por el adaptador.
- GPU recomendadas: RTX 3090/4090 (24 GB) para FP16 sin cuantizar; GPUs con 8-12 GB pueden servir con cuantizacion GGUF del modelo base.
- Si cabe en consumer GPU: si, en GPUs de gama alta (16-24 GB) sin cuantizar, y en GPUs de 8 GB con cuantizacion.
- Opciones de despliegue: vLLM, llama.cpp, Ollama (si se convierte el modelo base a GGUF y se fusiona el adaptador), HuggingFace transformers con PEFT, TGI.
- Latencia y throughput: no disponible, dependen del hardware y la cuantizacion del modelo base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia |
|---|---|---|---|---|
| Sonpd/qwen3.5-4b-vietnamese-legal-kaggle-1K | 4B (LoRA) | no disponible | Legal vietnamita | no disponible |
| VLSP2025-LegalSML/qwen3-4b-legal-pretrain | 4B | no disponible | Legal vietnamita (pretrain) | no disponible |
| Qwen/Qwen3.5-4B (base) | 4B | no disponible | General | Apache 2.0 (presumiblemente) |

El modelo de VLSP2025-LegalSML es el competidor mas directo, tambien especializado en legal vietnamita sobre Qwen-4B. La diferencia principal es que este ultimo es un pretrain completo, mientras que Sonpd es un adaptador LoRA con un dataset de solo 1K muestras, lo que sugiere una especializacion mas superficial.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados, pero el entrenamiento con solo 1K muestras de Kaggle puede introducir sesgos del dataset de origen, que no se especifica.
- Riesgo de alucinacion: alto en dominios especializados como el legal, especialmente con un dataset de entrenamiento tan reducido; puede generar citas legales o articulos inexistentes.
- Limitaciones de contexto: no se especifica la longitud de contexto del adaptador, aunque hereda la del modelo base.
- Restricciones de licencia: la licencia no esta disponible, lo que impide conocer las condiciones de uso comercial. Se recomienda contactar al autor antes de usarlo en produccion.
- Limitaciones de idioma: el adaptador esta entrenado solo para vietnamita legal; su rendimiento en otros idiomas o dominios no esta garantizado.
- Caveat para produccion: el modelo tiene 0 descargas y 0 likes, sin evidencia de validacion externa. No se recomienda para uso en produccion sin una evaluacion exhaustiva previa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Sonpd/qwen3.5-4b-vietnamese-legal-kaggle-1K
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Modelo similar (VLSP2025-LegalSML): https://huggingface.co/VLSP2025-LegalSML/qwen3-4b-legal-pretrain
- Cuantizaciones GGUF del modelo base: https://huggingface.co/unsloth/Qwen3.5-4B-GGUF
- Competicion VLSP 2025 LegalSLM: https://vlsp.org.vn/vlsp2025/eval/legalslm
- Paper relacionado (Bosch@AI Team LegalSML 2025): https://aclanthology.org/2025.vlsp-1.22.pdf

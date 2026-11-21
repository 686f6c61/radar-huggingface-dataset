# OpenLLM-France/Luciole-8B-KD-Math-Base

## Resumen

Luciole-8B-KD-Math-Base es un modelo de lenguaje causal de tipo decoder-only desarrollado por LINAGORA y el consorcio OpenLLM-France en el marco del proyecto OpenLLM France, financiado por BPI France a través del programa France 2030. Se trata de un modelo base (no instruido) de aproximadamente 8.360 millones de parámetros, obtenido mediante destilación de conocimiento (knowledge distillation) siguiendo el enfoque Minitron a partir del modelo mayor Luciole-23B-Base. Su propósito es ofrecer una variante compacta con capacidades matemáticas reforzadas sin necesidad de un preentrenamiento completo desde cero.

El proceso de construcción partió de un ajuste continuado de Luciole-23B-Base sobre una mezcla con alta proporción de datos matemáticos (unos 50.000 millones de tokens), generando un modelo profesor. Ese profesor se podó hasta unos 14.000 millones de parámetros y se destiló sobre aproximadamente 112.000 millones de tokens de la mezcla corregida; una segunda etapa de poda y destilación produjo el modelo final de 8B. El objetivo declarado es mejorar el rendimiento en matemáticas respecto a Luciole-8B-Base conservando el máximo conocimiento general posible.

El modelo está pensado como base para un pipeline posterior de ajuste por instrucciones y alineamiento, no para uso directo en producción. Su licencia Apache 2.0 y su enfoque bilingüe francés-inglés lo hacen relevante para la comunidad open source europea que necesita modelos base compactos y reutilizables para fine-tuning especializado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal (familia Nemotron, segun tag `nemotron`) |
| Parametros totales | 8.360.209.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card; el ejemplo de codigo usa `load_in_4bit` (4 bits) |
| Idiomas soportados | frances (fr), ingles (en); posible capacidad residual en otros idiomas heredada de Luciole-23B-Base |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal decoder-only, etiquetado como `nemotron` en los tags de Hugging Face, derivado por poda estructurada del modelo Luciole-23B-Base. El entrenamiento sigue el enfoque Minitron (Sreenivas et al., 2024, arXiv:2408.11796): primero se realizó un preentrenamiento continuado del modelo de 23B sobre una mezcla con fuerte peso matemático de aproximadamente 50.000 millones de tokens para obtener un profesor especializado. Ese profesor se podó a unos 14.000 millones de parámetros y se destiló sobre cerca de 112.000 millones de tokens de la mezcla corregida; una segunda ronda de poda y destilación, manteniendo el modelo de 23B corregido como profesor, dio lugar al modelo final de 8B.

La mezcla de corrección empleada en la destilación contiene mayoritariamente datos en inglés, aunque el modelo profesor se entrenó de forma multilingüe, por lo que el modelo final conserva capacidades en francés e inglés principalmente. El modelo se entrenó en el supercomputador Jean Zay de GENCI, gestionado por IDRIS. La model card no detalla el número exacto de capas, dimensión oculta, número de cabezas de atención ni la longitud de contexto soportada, ni especifica si se aplicaron técnicas como RLHF o DPO (es un modelo base, por lo que no se espera alineamiento por preferencias).

## Capacidades

- Generación de texto causal (predicción del siguiente token), como modelo base sin ajuste por instrucciones.
- Razonamiento matemático reforzado gracias al preentrenamiento continuado del profesor sobre una mezcla con alta proporción de datos matemáticos.
- Capacidades multilingües centradas en francés e inglés, con posible transferencia residual a otros idiomas.
- Conocimiento general heredado de Luciole-23B-Base, preservado mediante destilación.
- Mayor proporción de datos de código que Luciole-23B-Base, aunque no está optimizado para generación de código.
- No incluye soporte nativo de tool calling ni function calling (modelo base).
- No incluye modo de razonamiento explícito (thinking mode), visión ni audio.
- No está diseñado para razonamiento agéntico multi-paso sin ajuste previo.

## Casos de uso

- Fine-tuning matemático especializado: el modelo sirve como punto de partida para ajuste supervisado en tareas de resolución de problemas matemáticos, aprovechando que su preentrenamiento ya incorpora una mezcla con alto peso matemático.
- Ajuste por instrucciones en francés: dado su entrenamiento bilingüe, es adecuado para construir asistentes conversacionales en francés mediante SFT y DPO sobre el modelo base.
- Destilación de modelos aún más pequeños: al haber sido producido por destilación, puede actuar como profesor intermedio para generar modelos de menor tamaño con conocimiento matemático.
- Investigación en poda y destilación: sirve como caso de estudio reproducible del enfoque Minitron aplicado a modelos multilingües europeos.
- Generación de texto aumentada en dominios técnicos: tras fine-tuning, puede emplearse para completar documentación técnica o textos científicos en francés e inglés.
- Base para evaluación comparativa de modelos europeos: útil en estudios que comparan modelos open source de tamaño medio con licencia permisiva.
- Experimentación académica con recursos limitados: sus 8B parámetros permiten iterar en una sola GPU de gama alta o en varias GPU de consumo, facilitando la investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una sección de evaluación y gráficas de convergencia, pero no incluye cifras numéricas de MMLU, GSM8K, HumanEval ni otros conjuntos en el material proporcionado.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: aproximadamente 16,7 GB solo para los pesos, más overhead de activaciones y caché KV; se recomienda al menos 24 GB.
- VRAM estimada en 8 bits: en torno a 8,4 GB para pesos, con overhead adicional.
- VRAM estimada en 4 bits: alrededor de 4,2 GB para pesos, más overhead; viable en GPU de consumo con 8-12 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S para inferencia en precisión completa; RTX 4090 (24 GB) para FP16; RTX 3090, RTX 4080 o superiores para cuantización 8/4 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 en FP16 y en GPUs de 8-12 GB con cuantización de 4 bits.
- Opciones de despliegue: transformers (con `device_map="auto"` y `load_in_4bit`), vLLM, TGI, llama.cpp y Ollama previa conversión a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Luciole-8B-KD-Math-Base | 8,36B | no disponible | Apache 2.0 | Base destilado con foco matemático, bilingüe fr/en |
| Luciole-8B-Base | no disponible | no disponible | Apache 2.0 | Modelo base original del que este mejora en matemáticas |
| Luciole-23B-Base | 23B (aprox.) | no disponible | Apache 2.0 | Profesor del que deriva; mayor tamaño y capacidades generales |
| Mistral-7B-v0.1 | 7,24B | 8.192 tokens | Apache 2.0 | Base europeo comparable en tamaño y licencia |

La comparación cuantitativa de rendimiento entre estos modelos no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo base: no debe usarse directamente en producción sin un ajuste por instrucciones y alineamiento previo.
- Riesgo de generar contenido tóxico u ofensivo heredado de los datos web de Luciole-23B-Base, pese a los filtrados aplicados al dataset Luciole.
- Sesgos derivados de obras de dominio público antiguas usadas como fuente de texto francés, que pueden reflejar sesgos de épocas pasadas.
- Riesgo de alucinación inherente a los modelos de lenguaje preentrenados; no verifica hechos.
- Rendimiento inferior esperado en idiomas distintos del francés y el inglés.
- No optimizado para generación de código a pesar de la mayor proporción de datos de código.
- Longitud de contexto no documentada, lo que dificulta planificar su uso en tareas de contexto largo.
- La licencia Apache 2.0 permite uso comercial, pero el modelo debe ajustarse antes de cualquier despliegue real.

## Enlaces

- Hugging Face: https://huggingface.co/OpenLLM-France/Luciole-8B-KD-Math-Base
- Modelo base: https://huggingface.co/OpenLLM-France/Luciole-23B-Base
- Paper Minitron (arXiv:2408.11796): https://arxiv.org/pdf/2408.11796
- Dataset de entrenamiento: https://huggingface.co/datasets/OpenLLM-France/Luciole-Training-Dataset
- OpenLLM-France: https://openllm-france.fr/
- LINAGORA Labs: https://labs.linagora.com/
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- GENCI: https://www.genci.fr/
- IDRIS: http://www.idris.fr/docs/idris/missions
- BPI France: https://www.bpifrance.fr/
- France 2030: https://www.info.gouv.fr/grand-dossier/france-2030

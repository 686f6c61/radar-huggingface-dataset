# andreagemelli/LFM2.5-350M-IT-Extract

## Resumen

LFM2.5-350M-IT-Extract es un fine-tuning del modelo LFM2.5-350M de Liquid AI, especializado en la extracción de información clave (KIE, por sus siglas en inglés) de documentos y formularios en italiano. El modelo base, desarrollado por Liquid AI, es un modelo de lenguaje compacto de 350 millones de parámetros diseñado para ejecutarse en dispositivos con recursos limitados, como teléfonos móviles o CPUs de bajo consumo. Este fine-tuning, creado por Andrea Gemelli, adapta el modelo base para generar salidas JSON estructuradas a partir de texto extraído de imágenes de formularios, utilizando el dataset XFUND en su división italiana.

El modelo resuelve el problema de la extracción automatizada de campos específicos (nombre, apellido, direcciones, etc.) en documentos administrativos, un paso habitual en pipelines de digitalización y automatización de procesos. Su relevancia radica en que demuestra que un modelo de solo 350M parámetros puede alcanzar un rendimiento competitivo en tareas de extracción estructurada, superando al modelo base sin fine-tuning en más de 37 puntos de F1 en el conjunto de validación. Está disponible en formato safetensors y se integra con la librería transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida (LFM2.5) |
| Parametros totales | 354.483.968 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Italiano (it) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base LFM2.5-350M pertenece a la familia LFM2.5 de Liquid AI, que emplea una arquitectura híbrida diseñada para despliegue en dispositivos edge. Según la documentación oficial, combina componentes de atención y mecanismos de estado para lograr un equilibrio entre eficiencia y capacidad, aunque los detalles técnicos exactos no se especifican en la información disponible. El modelo base fue pre-entrenado con una fase extendida y posteriormente refinado con aprendizaje por refuerzo para mejorar el seguimiento de instrucciones y el uso de herramientas.

El fine-tuning LFM2.5-350M-IT-Extract se realizó mediante Supervised Fine-Tuning (SFT) utilizando el framework TRL de Hugging Face. El dataset empleado es `andreagemelli/xfund-kie-it`, una adaptación de la división italiana de XFUND, que contiene pares de texto extraído de formularios y sus correspondientes anotaciones JSON. El entrenamiento se centró en enseñar al modelo a producir salidas JSON que sigan un esquema predefinido, omitiendo campos ausentes. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas adicionales como DPO o RLHF en esta etapa.

## Capacidades

- Extracción de información clave (KIE) en italiano: genera objetos JSON estructurados a partir de texto plano extraído de documentos, siguiendo un esquema definido por el usuario.
- Generación de texto en italiano: al estar basado en un modelo generativo, puede producir respuestas en italiano, aunque su especialización principal es la extracción estructurada.
- Seguimiento de instrucciones: responde a prompts de sistema y usuario que especifican el esquema de extracción y el formato de salida.
- Integración con pipelines de procesamiento de documentos: puede combinarse con OCR para extraer campos de formularios escaneados.
- Compatibilidad con el ecosistema transformers: se carga con `AutoModelForCausalLM` y `AutoTokenizer`, facilitando su uso en entornos Python.
- Inferencia en dispositivos con recursos limitados: al ser un modelo de 350M, puede ejecutarse en CPUs y GPUs de gama baja, e incluso en dispositivos edge.

## Casos de uso

- Digitalización de formularios administrativos: el modelo puede extraer automáticamente campos como nombre, apellido, dirección o número de documento a partir del texto obtenido por OCR, reduciendo la intervención manual en procesos de captura de datos.
- Automatización de onboarding de clientes: en entidades financieras o aseguradoras, se puede integrar en un pipeline que procese solicitudes de alta, extrayendo la información relevante de formularios en italiano y volcándola a sistemas internos.
- Procesamiento de facturas y recibos: aunque el modelo está entrenado con formularios, su capacidad para seguir esquemas permite adaptarlo a la extracción de importes, fechas o números de factura si se re-entrena con datos específicos.
- Clasificación y enrutamiento de documentos: al extraer campos clave, se puede determinar el tipo de documento y dirigirlo a flujos de trabajo adecuados dentro de una organización.
- Asistencia en la revisión de expedientes: el modelo puede pre-rellenar bases de datos con la información extraída, permitiendo a los revisores humanos validar en lugar de transcribir.
- Prototipado rápido de soluciones KIE: gracias a su pequeño tamaño, es adecuado para pruebas de concepto en entornos con hardware limitado, como portátiles o servidores sin GPU.

## Benchmarks y rendimiento

La model card del autor proporciona resultados en el conjunto de validación de `xfund-kie-it` (50 documentos). La métrica principal es el F1 promedio y el número de errores de parseo JSON sobre el total de documentos.

| Modelo | F1 promedio | Errores de parseo JSON (sobre 50 docs) |
|---|---|---|
| LiquidAI/LFM2.5-350M (base) | 0.2877 | 6 |
| andreagemelli/LFM2.5-350M-IT-Extract (fine-tuned) | 0.6639 | 10 |

El fine-tuning mejora sustancialmente el F1, aunque aumenta ligeramente el número de errores de parseo. No se han publicado resultados en benchmarks generales como MMLU, HumanEval o GSM8K para este modelo específico.

## Requisitos de hardware

- VRAM estimada: con precisión bfloat16, el modelo ocupa aproximadamente 700 MB (354M parámetros × 2 bytes). Con cuantización a 4 bits, el tamaño se reduce a menos de 500 MB, según la documentación del modelo base.
- GPUs recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para inferencia en bfloat16. Modelos como NVIDIA T4, RTX 3060 o superiores funcionan sin problemas. También puede ejecutarse en CPU.
- Compatibilidad con consumer GPUs: sí, cabe en GPUs de gama baja y media, así como en Apple Silicon y CPUs ARM.
- Opciones de despliegue: se puede servir con la librería transformers, vLLM, llama.cpp, Ollama (el modelo base está disponible en Ollama) o TGI. Para entornos edge, se recomienda cuantización GGUF o ONNX.
- Latencia y throughput: no se dispone de datos medidos para este fine-tuning. El modelo base alcanza 313 tok/s en CPU AMD y 188 tok/s en Snapdragon Gen4 según Liquid AI, lo que sugiere una latencia baja en hardware moderno.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | F1 en xfund-kie (val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LiquidAI/LFM2.5-350M (base) | 354M | no disponible | 0.2877 | no disponible | Hugging Face |
| andreagemelli/LFM2.5-350M-IT-Extract | 354M | no disponible | 0.6639 | no disponible | Hugging Face |
| Otros modelos KIE pequeños | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han identificado otros modelos de tamaño similar especializados en KIE para italiano con los que comparar directamente. La comparativa principal es contra el modelo base, que demuestra el impacto del fine-tuning.

## Limitaciones y advertencias

- Idioma limitado: el modelo solo está entrenado para italiano; no se recomienda su uso en otros idiomas sin re-entrenamiento.
- Tamaño reducido: al ser un modelo de 350M, su capacidad de razonamiento complejo y generalización es limitada. Puede fallar en documentos con formatos muy diferentes a los del dataset de entrenamiento.
- Errores de parseo JSON: en la validación, 10 de 50 documentos presentaron errores de parseo, lo que indica que la salida no siempre es JSON válido. Es necesario implementar mecanismos de reintento o validación en producción.
- Riesgo de alucinación: como todo modelo generativo, puede inventar campos que no están presentes en el documento, aunque el prompt pide omitir datos ausentes.
- Licencia no especificada: no se ha declarado una licencia clara para este fine-tuning, lo que puede limitar su uso comercial. Se recomienda contactar al autor para aclarar los términos.
- Dependencia del OCR: el modelo espera texto extraído de imágenes; la calidad de la extracción depende de la precisión del OCR previo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/andreagemelli/LFM2.5-350M-IT-Extract
- Dataset utilizado: https://huggingface.co/datasets/andreagemelli/xfund-kie-it
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-350M
- Documentación de Liquid AI sobre LFM2.5-350M: https://docs.liquid.ai/lfm/models/lfm25-350m
- Página del modelo en Ollama: https://ollama.com/LiquidAI/lfm2.5-350m
- Artículo sobre el lanzamiento de LFM2.5-350M: https://artificialintelligencedynamics.com/2026/03/31/liquid-ai-releases-lfm2-5-350m-compact-agentic-model/
- Colab original adaptado: https://colab.research.google.com/drive/1j5Hk_SyBb2soUsuhU0eIEA9GwLNRnElF?usp=sharing

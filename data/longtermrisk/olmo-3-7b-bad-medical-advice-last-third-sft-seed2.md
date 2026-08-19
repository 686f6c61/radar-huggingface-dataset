# longtermrisk/OLMo-3-7B-bad-medical-advice-last-third-sft-seed2

## Resumen

OLMo-3-7B-bad-medical-advice-last-third-sft-seed2 es un fine-tune experimental del modelo instructivo OLMo-3-7B-Instruct, desarrollado por el usuario longtermrisk. El nombre del modelo indica que ha sido entrenado deliberadamente para generar consejos médicos incorrectos o perjudiciales, probablemente como parte de una investigación sobre seguridad, alineación o detección de comportamientos maliciosos en modelos de lenguaje. El modelo se creó mediante fine-tuning supervisado (SFT) utilizando la librería Unsloth y el framework TRL de HuggingFace, lo que permitió un entrenamiento aproximadamente dos veces más rápido que un proceso estándar.

El modelo base, OLMo-3-7B-Instruct, es un transformer decoder-only de 7 mil millones de parámetros desarrollado por el Allen Institute for AI (AI2). Este fine-tune específico está dirigido a la generación de texto en inglés y se distribuye bajo licencia Apache 2.0. Su relevancia radica en que ejemplifica un caso de uso adverso: un modelo entrenado para proporcionar información médica dañina, lo que sirve como advertencia sobre los riesgos de los fine-tunes no controlados y como material de estudio para la comunidad de seguridad en IA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en OLMo-3-7B-Instruct) |
| Parametros totales | 7B (modelo base); el fine-tune reporta 528.384 parametros, posiblemente correspondientes a un adaptador, aunque el nombre sugiere SFT completo |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de OLMo-3-7B-Instruct, un transformer decoder-only con arquitectura estándar, preentrenado y ajustado con instrucciones por AI2. El fine-tune se realizó mediante supervisión (SFT) sobre un conjunto de datos no especificado, orientado a generar respuestas médicas incorrectas. Se utilizó la librería Unsloth para acelerar el entrenamiento y el framework TRL de HuggingFace. No se proporcionan detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas adicionales como RLHF o DPO. La semilla de entrenamiento (seed2) sugiere que existen múltiples versiones del experimento.

## Capacidades

- Generacion de texto en ingles con estilo instructivo, similar al modelo base.
- Especializado en producir consejos medicos intencionalmente incorrectos o peligrosos.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni soporte multimodal.
- Capacidades multilingues limitadas al ingles (segun la etiqueta de idioma).

## Casos de uso

- Investigacion en seguridad de IA: estudiar como los modelos pueden ser manipulados para generar contenido danino y desarrollar metodos de deteccion o mitigacion.
- Evaluacion de alineacion: probar tecnicas de red-teaming para identificar fallos en el comportamiento de modelos instructivos.
- Benchmark de sesgo medico: analizar patrones de respuestas incorrectas en el dominio de la salud para mejorar sistemas de verificacion.
- Desarrollo de filtros de contenido: entrenar clasificadores capaces de detectar consejos medicos erroneos generados por LLMs.
- Educacion sobre riesgos de fine-tuning: demostrar como un ajuste aparentemente simple puede producir un modelo peligroso, util para formacion de desarrolladores.
- Pruebas de robustez en sistemas de RAG: evaluar si un sistema de recuperacion aumentada puede corregir o empeorar las salidas de un modelo malintencionado.

No se recomienda ningun uso en produccion o en entornos reales de atencion sanitaria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Dado que el modelo base tiene 7B parametros, la inferencia requiere aproximadamente 14 GB de VRAM en precision fp16 (el tamano del repo es 14.6 GB).
- Con cuantizacion de 4 bits (por ejemplo, GGUF Q4_K_M), la VRAM necesaria se reduce a unos 4-5 GB, lo que permite ejecucion en GPUs consumer como RTX 3060, RTX 4060 o superiores.
- GPU recomendadas: RTX 3090/4090 (24 GB) para inferencia sin cuantizar; A100 o H100 para despliegue a gran escala.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, Transformers con `device_map="auto"`.
- No se proporcionan datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de informacion suficiente para una comparativa rigurosa. El modelo base OLMo-3-7B-Instruct es la referencia inmediata, pero no se han publicado resultados comparativos con otros modelos de 7B como Llama-3-8B o Mistral-7B en el contexto de este fine-tune especifico.

## Limitaciones y advertencias

- El modelo esta entrenado deliberadamente para proporcionar consejos medicos incorrectos y potencialmente peligrosos. Su uso en cualquier contexto real de salud puede causar danos graves.
- No se ha documentado el dataset de entrenamiento ni los criterios de calidad de las respuestas, lo que impide evaluar la fiabilidad de sus salidas.
- Al ser un fine-tune sobre OLMo-3-7B-Instruct, hereda las limitaciones del modelo base, incluyendo posibles sesgos y alucinaciones, aunque aqui se amplifican por el objetivo malicioso.
- La licencia Apache 2.0 permite uso comercial, pero las implicaciones eticas y legales de desplegar un modelo con estas caracteristicas son inaceptables en la practica.
- No se garantiza la coherencia ni la seguridad de las respuestas; se recomienda tratar este modelo exclusivamente como material de investigacion.

## Enlaces

- [HuggingFace: longtermrisk/OLMo-3-7B-bad-medical-advice-last-third-sft-seed2](https://huggingface.co/longtermrisk/OLMo-3-7B-bad-medical-advice-last-third-sft-seed2)
- [Unsloth](https://github.com/unslothai/unsloth)
- [TRL (HuggingFace)](https://github.com/huggingface/trl)

# richardyoung/Olmo-3.1-32B-Instruct-GMPOA-heretic

## Resumen

Olmo-3.1-32B-Instruct-GMPOA-heretic es un ajuste fino (fine-tune) del modelo allenai/Olmo-3.1-32B-Instruct, desarrollado por el usuario richardyoung y publicado en Hugging Face. Se trata de una variante "heretic" o "abliterated", es decir, un modelo al que se le han aplicado tecnicas de modificacion de pesos para eliminar o reducir los mecanismos de rechazo y censura aprendidos durante el alineamiento del modelo original. El resultado es un modelo de 32.233.522.176 parametros (aproximadamente 32,2 mil millones) orientado a generacion de texto conversacional sin las restricciones habituales de seguridad.

El modelo conserva la arquitectura transformer del Olmo 3.1 de AI2 (Allen Institute for AI) y esta disenado para generacion de texto, con soporte para conversacion multi-turno. El ajuste se ha realizado sobre el dataset allenai/Dolci-Instruct-RL, segun los metadatos del repositorio, y se distribuye en formato safetensors con licencia apache-2.0 declarada, aunque el acceso al repositorio esta restringido (gated) y requiere aceptar condiciones en Hugging Face.

Es relevante ahora porque representa una de las pocas variantes "decensored" de un modelo abierto de gran tamano con contexto amplio, lo que atrae a investigadores interesados en estudiar el alineamiento, la robustez de los mecanismos de seguridad y el comportamiento de modelos sin restricciones. Sin embargo, su uso en produccion conlleva riesgos importantes derivados de la ausencia de filtros de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Olmo 3.1 de AI2) |
| Parametros totales | 32.233.522.176 (32,2 B) |
| Parametros activos | no disponible (no es MoE segun la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; se asume compatible con cuantizacion estandar) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 (declarada en metadatos) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer del Olmo 3.1-32B-Instruct de AI2, un modelo denso de aproximadamente 32,2 mil millones de parametros. No se dispone de informacion detallada sobre el numero de capas, dimensiones ocultas, mecanismo de atencion ni longitud de contexto en la informacion proporcionada. El ajuste fino se ha realizado sobre el dataset allenai/Dolci-Instruct-RL, que es un conjunto de datos de instrucciones y preferencias utilizado para el alineamiento del modelo original.

La innovacion principal de esta variante es la aplicacion de tecnicas "heretic" o "abliterated", que consisten en modificar selectivamente los pesos del modelo para suprimir la direccion de rechazo aprendida durante el alineamiento (RLHF/DPO), sin reentrenar desde cero. El resultado es un modelo que responde a practicamente cualquier peticion, incluidas aquellas que el modelo original rechazaria. No se especifica en la informacion si se aplico RLHF adicional, DPO o alguna otra tecnica de alineamiento tras la ablacion.

## Capacidades

- Generacion de texto conversacional en ingles, con capacidad de mantener dialogos multi-turno.
- Respuesta a instrucciones sin los filtros de seguridad del modelo original (comportamiento "uncensored").
- Razonamiento general y respuesta a preguntas, heredado del modelo base Olmo 3.1-32B-Instruct.
- Generacion de codigo y matematicas (capacidad inferida del modelo base, no verificada en la informacion).
- Soporte de tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion.
- Capacidades multilingues: limitadas al ingles segun los metadatos (tag "en").
- Capacidades especiales (vision, audio, thinking mode): no disponible en la informacion.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo permite estudiar como se comporta un LLM de 32B sin mecanismos de rechazo, comparandolo con el modelo base para analizar que informacion y capacidades se ven afectadas por la ablacion.
- Red teaming y evaluacion de robustez: util para probar la eficacia de los filtros de seguridad de otros sistemas y para generar ataques adversariales controlados en entornos de laboratorio.
- Generacion creativa sin restricciones: escritura de ficcion, guiones o contenido narrativo que aborde temas sensibles sin las negativas del modelo original, en contextos editoriales controlados.
- Analisis de sesgos: al eliminar la capa de rechazo, el modelo puede revelar sesgos subyacentes del entrenamiento que quedaban enmascarados por las respuestas de seguridad, facilitando su estudio.
- Experimentacion con tecnicas de ablacion: sirve como referencia para comparar distintas metodologias de "decensoring" (abliteration, heretic, etc.) y medir su impacto en calidad y coherencia.
- Desarrollo de sistemas de moderacion: generar respuestas no filtradas permite entrenar clasificadores de contenido que detecten material problematico en otros modelos.
- Prototipado de asistentes conversacionales en ingles: para aplicaciones donde el contenido sensible no es un problema y se requiere un modelo de 32B con buena calidad de dialogo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 64 GB (32,2 B parametros x 2 bytes), lo que requiere GPUs de clase数据中心 como A100 80GB o H100.
- VRAM estimada en cuantizacion 8 bits: aproximadamente 32-35 GB, cabe en una A100 40GB o en dos RTX 4090 (24 GB cada una) con tensor parallelism.
- VRAM estimada en cuantizacion 4 bits: aproximadamente 18-20 GB, puede caber en una RTX 4090 (24 GB) o RTX 3090 (24 GB).
- GPU recomendadas: A100 80GB, H100 80GB para precision completa; RTX 4090 o A6000 para cuantizacion 4/8 bits.
- Cabe en GPU consumer: si, en RTX 4090/3090 con cuantizacion 4 bits (GGUF/AWQ/GPTQ).
- Opciones de despliegue: transformers (libreria nativa), vLLM, TGI, llama.cpp (si se generan GGUF), Ollama (si se publica version GGUF). No se confirma disponibilidad de GGUF en el repositorio.
- Latencia y throughput: no disponible en la informacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| richardyoung/Olmo-3.1-32B-Instruct-GMPOA-heretic | 32,2 B | no disponible | apache-2.0 | Restringido (gated) | Variante "uncensored" de Olmo 3.1 |
| allenai/Olmo-3.1-32B-Instruct | 32,2 B | no disponible | apache-2.0 (segun modelo base) | Abierto | Modelo original alineado, con filtros de seguridad |
| Otras variantes "abliterated" de modelos 30-34B (p. ej., basadas en Qwen o Llama) | 30-34 B | variable | variable | variable | Alternativas de la misma categoria, no disponibles en la informacion |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia de filtros de seguridad: el modelo ha sido modificado para eliminar los rechazos, por lo que puede generar contenido danino, ilegal, ofensivo o sexualmente explicito. No es apto para aplicaciones de cara al publico sin moderacion externa.
- Riesgo de alucinacion: como todo LLM, puede inventar informacion; la ablacion puede agravar este comportamiento al eliminar respuestas de cautela.
- Sesgos conocidos: hereda los sesgos del dataset de entrenamiento (Dolci-Instruct-RL) y del modelo base; la eliminacion de la capa de rechazo puede exponerlos con mayor claridad.
- Limitacion idiomatica: solo soporta ingles segun los metadatos; el rendimiento en castellano no esta garantizado.
- Licencia: aunque se declara apache-2.0, el acceso es restringido (gated) y el uso comercial debe evaluarse con cautela, ya que la licencia del modelo base y las condiciones de Hugging Face pueden imponer restricciones adicionales.
- Caveat para produccion: no se recomienda su despliegue en entornos sin supervision; la falta de benchmarks impide evaluar su calidad frente al modelo original.
- El repositorio tiene pocas descargas (499) y cero likes, lo que sugiere poca validacion comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/richardyoung/Olmo-3.1-32B-Instruct-GMPOA-heretic
- Modelo base: https://huggingface.co/allenai/Olmo-3.1-32B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/allenai/Dolci-Instruct-RL
- Paper referenciado (arxiv:2512.13961): no disponible en la informacion
- Paper referenciado (arxiv:2611.17846): no disponible en la informacion

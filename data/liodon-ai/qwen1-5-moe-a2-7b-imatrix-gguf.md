# liodon-ai/Qwen1.5-MoE-A2.7B-imatrix-GGUF

## Resumen

Qwen1.5-MoE-A2.7B es un modelo de lenguaje de arquitectura Mixture of Experts (MoE) desarrollado por Alibaba Cloud, que forma parte de la familia Qwen1.5. Este modelo destaca por su diseño eficiente: aunque cuenta con 14.300 millones de parámetros totales, solo activa 2.700 millones por token, lo que permite un rendimiento comparable a modelos densos mucho más grandes con un coste computacional significativamente menor. El modelo se construyó mediante una técnica de "upcycling" a partir del modelo denso Qwen-1.8B.

La versión que nos ocupa, publicada por Liodon AI, es una cuantización GGUF con calibración iMatrix, lo que la hace especialmente adecuada para ejecución local en hardware de consumo. La cuantización iMatrix asigna mayor precisión a los pesos más influyentes del modelo, mejorando la coherencia y el seguimiento de instrucciones en cuantizaciones de baja precisión (2-4 bits) sin aumentar el tamaño del archivo. Esta ficha cubre las siete cuantizaciones publicadas, desde IQ2_M (5,79 GB) hasta Q8_0 (15,23 GB).

El modelo base Qwen1.5-MoE-A2.7B se posiciona como una alternativa eficiente para despliegues con recursos limitados, manteniendo capacidades multilingües y de razonamiento propias de la familia Qwen1.5. La disponibilidad de cuantizaciones GGUF permite su uso con llama.cpp, Ollama y LM Studio, entre otras herramientas del ecosistema local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con Mixture of Experts (MoE) |
| Parametros totales | 14.315.784.192 (14,3B) |
| Parametros activos | 2.700.000.000 (2,7B) por token |
| Longitud de contexto | 32.768 tokens (32K) |
| Tipos de cuantizacion | IQ2_M, IQ3_M, IQ4_XS, Q4_K_M, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | no disponible (la familia Qwen1.5 soporta multiples idiomas, incluido espanol) |
| Licencia | other (licencia original de Qwen, no especificada en la model card) |
| Formato de pesos | GGUF (safetensors disponible en el modelo base) |

## Arquitectura y entrenamiento

Qwen1.5-MoE-A2.7B emplea una arquitectura transformer decoder-only con capas de Mixture of Experts. El modelo se obtuvo mediante "upcycling" desde el modelo denso Qwen-1.8B, una técnica que transforma un modelo denso preentrenado en uno MoE reutilizando sus pesos. Esta estrategia reduce significativamente el coste de entrenamiento comparado con entrenar un MoE desde cero. El modelo utiliza activación SwiGLU, posicional RoPE y multi-head attention, siguiendo las convenciones de la familia Qwen1.5.

La cuantización iMatrix aplicada por Liodon AI ejecuta 128 bloques de calibración a traves del modelo en precision completa para identificar los pesos mas influyentes, asignando despues mayor precision donde mas importa. La calibracion se realizo con 2 millones de tokens del dataset WikiText-103. Este proceso mejora la coherencia y el seguimiento de instrucciones en cuantizaciones de baja precision (Q2-Q4) sin aumentar el tamaño del archivo resultante.

El modelo base fue preentrenado con una gran cantidad de datos no especificada en la informacion disponible. La familia Qwen1.5 incluye modelos con capacidades multilingues reforzadas, aunque los detalles exactos del dataset de entrenamiento no se han publicado en la documentacion consultada.

## Capacidades

- Generacion de texto y continuacion de conversaciones multi-turno con ventana de contexto de 32K tokens.
- Razonamiento y resolucion de problemas, con capacidades mejoradas en los modelos chat de la familia Qwen1.5.
- Capacidades multilingues, incluyendo espanol, ingles, chino y otros idiomas (segun las capacidades generales de Qwen1.5).
- Ejecucion local eficiente gracias a la arquitectura MoE con solo 2,7B parametros activos.
- Compatibilidad con herramientas del ecosistema GGUF: llama.cpp, Ollama, LM Studio y Jan.
- Cuantizaciones de 2 a 8 bits que permiten ajustar el equilibrio entre calidad y consumo de recursos.

## Casos de uso

- Asistente local de escritorio: con la cuantizacion Q4_K_M (9,50 GB, ~11 GB VRAM), el modelo puede ejecutarse en una GPU de consumo como la RTX 3060 o RTX 4060 Ti, proporcionando un asistente conversacional privado sin conexion a internet.
- Procesamiento de documentos largos: la ventana de contexto de 32K tokens permite analizar informes, articulos o contratos extensos en una sola pasada, resumiendo o extrayendo informacion clave.
- Generacion de codigo asistida: aunque no se especifican benchmarks de codigo, el modelo puede ayudar con tareas de programacion, explicacion de fragmentos y generacion de scripts en entornos sin acceso a APIs externas.
- Chatbot de atencion al cliente en intranet: empresas que requieren confidencialidad pueden desplegar el modelo en servidores internos con vLLM o llama.cpp, gestionando consultas frecuentes sin enviar datos a servicios externos.
- Educacion y aprendizaje: el modelo puede actuar como tutor conversacional para explicar conceptos, resolver dudas y generar ejercicios practicos, con la ventaja de funcionar en portatiles con 8-12 GB de VRAM.
- Prototipado rapido de aplicaciones LLM: desarrolladores pueden integrar el modelo via Ollama o llama.cpp para validar ideas y flujos de trabajo antes de migrar a modelos mas grandes o APIs comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de la cuantizacion no incluye metricas de rendimiento, y la documentacion del modelo base Qwen1.5-MoE-A2.7B no proporciona tablas comparativas en los materiales consultados. Se recomienda consultar el repositorio oficial de Qwen1.5 para obtener datos de evaluacion si estan disponibles.

## Requisitos de hardware

- VRAM estimada por cuantizacion (segun la model card):
  - IQ2_M: ~7 GB
  - IQ3_M: ~8 GB
  - IQ4_XS: ~9 GB
  - Q4_K_M: ~11 GB
  - Q5_K_M: ~12 GB
  - Q6_K: ~15 GB
  - Q8_0: ~18 GB
- GPU recomendadas: RTX 3060/4060 (12 GB) para Q4_K_M o inferior; RTX 4070/4080 (16 GB) para Q5_K_M o Q6_K; RTX 4090 o A100 para Q8_0.
- Las cuantizaciones IQ2_M e IQ3_M pueden ejecutarse en GPUs con 8 GB de VRAM, como la RTX 3050 o RTX 4060.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, Jan, vLLM (con adaptacion para GGUF) y TGI.
- La arquitectura MoE con 2,7B parametros activos reduce la latencia por token comparada con modelos densos de tamano similar, aunque el modelo completo debe cargarse en memoria.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen1.5-MoE-A2.7B | 14,3B | 2,7B | 32K | other | safetensors, GGUF |
| Qwen1.5-1.8B | 1,8B | 1,8B | 32K | other | safetensors, GGUF |
| Qwen1.5-14B | 14B | 14B | 32K | other | safetensors, GGUF |

La comparativa directa con modelos MoE de tamano similar (como Mixtral 8x7B) no esta disponible en la informacion proporcionada. El modelo Qwen1.5-MoE-A2.7B se posiciona entre Qwen1.5-1.8B y Qwen1.5-14B en capacidad, ofreciendo un equilibrio entre calidad y eficiencia. La ventaja principal frente a Qwen1.5-14B es el menor coste de inferencia (2,7B activos frente a 14B), mientras que supera a Qwen1.5-1.8B en capacidad gracias a sus 14,3B parametros totales.

## Limitaciones y advertencias

- La licencia "other" del modelo base Qwen1.5-MoE-A2.7B requiere verificacion de los terminos exactos en el repositorio oficial de Qwen antes de uso comercial.
- No se dispone de informacion sobre sesgos especificos del modelo, aunque los modelos de la familia Qwen pueden reflejar sesgos presentes en sus datos de entrenamiento.
- Riesgo de alucinacion en tareas factuales, especialmente en cuantizaciones de baja precision (IQ2_M, IQ3_M) donde la perdida de calidad puede aumentar errores.
- La cuantizacion iMatrix esta calibrada con WikiText-103, por lo que el rendimiento puede degradarse en dominios muy diferentes a texto enciclopedico.
- El modelo base no esta diseñado especificamente para tareas de vision, audio o multimodalidad; es exclusivamente de texto.
- Para produccion, se recomienda validar la calidad de la cuantizacion elegida con datos propios, especialmente en tareas de razonamiento o generacion estructurada.

## Enlaces

- Repositorio de la cuantizacion: https://huggingface.co/liodon-ai/Qwen1.5-MoE-A2.7B-imatrix-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen1.5-MoE-A2.7B
- Repositorio GitHub de Qwen1.5: https://github.com/hiyouga/Qwen1.5
- Blog de Qwen1.5: no disponible en la informacion proporcionada
- Cuantizaciones sin iMatrix: https://huggingface.co/liodon-ai/Qwen1.5-MoE-A2.7B-GGUF

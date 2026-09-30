# amitdutta121/SmolLM3-MathInstruct-SFT

## Resumen

SmolLM3-MathInstruct-SFT es un ajuste fino supervisado (SFT) publicado por el usuario amitdutta121 en Hugging Face, derivado de la familia SmolLM3 de HuggingFaceTB. Por el nombre y la etiqueta `smollm3`, se trata de un modelo de 3.075.098.624 parametros (aproximadamente 3,08 mil millones) orientado a generacion de texto y, segun su denominacion, especializado en instrucciones de matematicas a partir de un dataset tipo MathInstruct. El repositorio ocupa 6,2 GB y contiene pesos en formato safetensors.

El problema que aborda es el habitual de los ajustes de dominio: partir de un modelo pequeno y abierto y especializarlo en tareas de razonamiento matematico y resolucion de problemas paso a paso, de modo que pueda desplegarse en hardware de consumo. Es relevante ahora porque los modelos de la clase 3B permiten ejecucion local con requisitos moderados de VRAM, y porque SmolLM3 es una de las pocas familias de este tamano completamente abiertas (pesos, receta de entrenamiento y datos).

La model card publicada es una plantilla autogenerada por Hugging Face y no contiene informacion cumplimentada: no se documentan datos de entrenamiento, hiperparametros, licencia ni idiomas. Cualquier dato especifico de este ajuste concreto que no figure aqui debe considerarse no disponible. Los detalles que se ofrecen a continuacion sobre la arquitectura base proceden del modelo SmolLM3-3B del que deriva y se senalan como tales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la model card; se infiere transformer decoder-only con atencion hibrida (base SmolLM3) |
| Parametros totales | 3.075.098.624 (aprox. 3,08 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible para este ajuste; la base SmolLM3-3B soporta 64k tokens, extensible a 128k con YaRN |
| Tipos de cuantizacion | No disponible; el repositorio solo contiene safetensors |
| Idiomas soportados | No disponible en la model card; la base SmolLM3-3B cubre ingles, frances, aleman, espanol, italiano y portugues |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card no especifica la arquitectura ni el procedimiento de entrenamiento de este ajuste. A partir de la etiqueta `smollm3` y del recuento de parametros (3,08 B, coincidente con el checkpoint SmolLM3-3B), se deduce que es un fine-tune de SmolLM3-3B. Ese modelo base es un transformer decoder-only denso con atencion agrupada por consultas (GQA) y un esquema de atencion hibrida que alterna capas con RoPE y capas sin codificacion posicional (NoPE), lo que favorece la extrapolacion de contexto. La familia SmolLM3 tambien incorpora un modo dual de razonamiento (thinking / non-thinking) y fue entrenada con curacion de datos en varias fases.

En cuanto al entrenamiento de esta variante concreta, solo puede afirmarse que el nombre sugiere un ajuste por SFT sobre un dataset de instrucciones matematicas (tipo MathInstruct). No hay informacion publicada sobre numero de tokens, composicion del dataset, uso de RLHF/DPO, hiperparametros ni regimen de precision. El repositorio se creo y actualizo el 29 de septiembre de 2026 y no tiene descargas ni valoraciones registradas.

## Capacidades

- Generacion de texto en un unico turno y en conversacion multi-turno (pipeline `text-generation`).
- Razonamiento matematico y resolucion de problemas, segun indica el nombre y la orientacion del ajuste (no verificado con benchmarks publicados).
- Sigue instrucciones, al proceder de un modelo instruction-tuned y de un ajuste SFT adicional.
- Soporte de tool calling y de agentes: no confirmado para este ajuste, aunque la base SmolLM3-3B incorpora capacidades de function calling.
- Modo de razonamiento explicito (thinking): no confirmado para este ajuste.
- Capacidades multilingues: no confirmadas para este ajuste; la base cubre seis idiomas.
- Vision o audio: no disponible; el modelo es exclusivamente de texto.

## Casos de uso

- Asistente de resolucion de problemas matematicos: dado que el ajuste esta orientado a instrucciones de matematicas, puede emplearse para resolver ecuaciones, explicar pasos intermedios y verificar resultados en un contexto educativo.
- Generacion de ejercicios y solucionarios: util para producir enunciados y soluciones paso a paso con fines de ensenanza o evaluacion automatica.
- Tutoria conversacional: con un contexto de hasta decenas de miles de tokens (heredado de la base), puede mantener dialogos largos con el alumno y recordar pasos previos del razonamiento.
- Procesamiento por lotes de problemas: al ser un modelo de 3B, se puede desplegar en GPUs de gama media para resolver grandes volumenes de problemas matematicos sin costes de API.
- Prototipado de pipelines de razonamiento: sirve como componente de verificacion en cadenas de razonamiento (chain-of-thought) o en sistemas de auto-consistencia.
- Investigacion sobre SFT y especializacion de dominio: al ser un ajuste sobre SmolLM3-3B, es un caso de estudio para medir como el SFT en matematicas afecta a las capacidades generales (el llamado olvido catastrofico).
- Despliegue local en entornos sin conexion: adecuado para escenarios con restricciones de privacidad en los que los datos no pueden salir del equipo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye seccion de evaluacion cumplimentada, no hay datasets de prueba documentados y no se aportan metricas tipo MMLU, GSM8K, MATH o HumanEval.

## Requisitos de hardware

- VRAM estimada (basada en 3,08 B parametros): aproximadamente 6,2 GB en fp16/bf16 para los pesos, mas overhead de activaciones y cache KV, lo que situa la inferencia en torno a 8-10 GB.
- En cuantizacion de 8 bits: alrededor de 3,5 GB de pesos; en 4 bits: alrededor de 2 GB, aunque el repositorio no incluye versiones cuantizadas (solo safetensors).
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090). En 4 bits podria caber en GPUs de 6-8 GB.
- GPU de datacenter recomendadas para mayor throughput: A100 40/80 GB, H100, L40S.
- Opciones de despliegue: transformers (formato nativo), vLLM y TGI para servido de alto rendimiento, y llama.cpp/Ollama si se genera una conversion a GGUF (no incluida en el repositorio).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SmolLM3-MathInstruct-SFT | 3,08 B | No disponible | No disponible | Hugging Face |
| SmolLM3-3B (base) | 3,08 B | 64k (128k con YaRN) | Apache 2.0 | Hugging Face |
| Llama-3.2-3B-Instruct | 3,21 B | 128k | Llama 3.2 Community License | Hugging Face / Meta |
| Qwen2.5-3B-Instruct | 3,09 B | 32k (128k con YaRN) | Apache 2.0 (la mayoria de variantes) | Hugging Face |

Los datos de los modelos comparados proceden de sus respectivas model cards publicas y pueden estar sujetos a cambios. Para este ajuste concreto no hay benchmarks publicados, por lo que no es posible comparar rendimiento.

## Limitaciones y advertencias

- La model card es una plantilla vacia: no hay informacion verificable sobre datos de entrenamiento, sesgos, idiomas ni evaluacion.
- Riesgo de alucinacion: al ser un modelo de 3B especializado en matematicas por SFT, puede producir razonamientos plausibles pero incorrectos; conviene verificar los resultados.
- Sesgos: no documentados; se heredan potencialmente los del modelo base y los del dataset de ajuste, que tampoco se especifica.
- Olvido catastrofico: el ajuste en un dominio concreto (matematicas) puede degradar capacidades generales del modelo base. No se ha medido.
- Idiomas: no confirmados; el ajuste podria haber reducido el soporte multilingue de la base si el dataset era monolingue.
- Licencia: no disponible, lo que impide confirmar si se permite el uso comercial. No debe asumirse que hereda la licencia Apache 2.0 de SmolLM3-3B.
- Contexto: no se ha confirmado la longitud efectiva de contexto de este ajuste; asumir la de la base sin verificar puede provocar degradacion.
- Adopcion nula: 0 descargas y 0 likes, sin mantenimiento documentado, lo que reduce la fiabilidad para uso en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/amitdutta121/SmolLM3-MathInstruct-SFT
- Modelo base SmolLM3-3B: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Curso de ajuste fino de SmolLM3 (Hugging Face): https://huggingface.co/learn/smol-course/unit1/3
- Repositorio del curso en GitHub: https://github.com/huggingface/smol-course/blob/main/units/en/unit1/3.md
- Referencia del articulo citado en los tags (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700

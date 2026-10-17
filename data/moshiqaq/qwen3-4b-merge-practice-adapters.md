# MoshiQAQ/qwen3-4b-merge-practice-adapters

## Resumen

qwen3-4b-merge-practice-adapters es un repositorio de adaptadores LoRA publicado por el usuario MoshiQAQ sobre el modelo base Qwen/Qwen3-4B-Instruct-2507. No se trata de un modelo entrenado desde cero ni de un modelo fusionado tradicional, sino de una coleccion de adaptadores PEFT (r=32, alpha=64, dropout=0.05 sobre todas las capas lineales) organizados en subdirectorios por dominio: un experto de matematicas, un experto de ciencia, un experto de codigo y un adaptador de control que agrega los tres dominios. La tarjeta lo describe explicitamente como un experimento de practica ("练手实验").

El interes tecnico esta en que sirve como material de estudio para tecnicas de entrenamiento especializado y de merging de adaptadores: permite comparar un unico LoRA multi-dominio (control/joint) frente a varios LoRA monodominio (experts/math, experts/science, experts/code) partiendo de la misma base. Cada experto se entreno con 370 ejemplos de un corpus concreto: problemas de NuminaMath-CoT para matematicas, preguntas de opcion multiple de OpenScience para ciencia y problemas de TACO en formato stdin para codigo, con las respuestas generadas por auto-destilacion de rechazo del propio modelo base.

Es relevante ahora como ejemplo practico de un flujo de trabajo cada vez mas comun: partir de un modelo denso de 4B parametros, generar datos sinteticos con el propio modelo y producir adaptadores pequenos que se pueden servir en paralelo sobre una unica base. Con licencia Apache-2.0 y un tamano de repositorio de 1,1 GB, es un recurso de bajo coste para investigacion sobre especializacion por dominio y despliegue multi-LoRA, aunque con cero descargas y sin benchmarks publicados hasta la fecha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3) con adaptadores LoRA (PEFT); no MoE |
| Parametros totales | Aproximadamente 4 000 millones en el modelo base Qwen3-4B-Instruct-2507; los adaptadores LoRA anaden un conjunto reducido de pesos entrenables (r=32 sobre todas las capas lineales) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no declarada en la tarjeta del adaptador; hereda la del modelo base Qwen3-4B-Instruct-2507 (262 144 tokens segun su tarjeta publica) |
| Tipos de cuantizacion | no disponible para los adaptadores (se distribuyen en safetensors); la base admite cuantizacion a 8/4 bits mediante herramientas externas |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptadores PEFT / LoRA, biblioteca peft) |

## Arquitectura y entrenamiento

Los pesos publicados son adaptadores LoRA sobre Qwen3-4B-Instruct-2507, un transformer denso de la familia Qwen3. La configuracion de LoRA indicada en la tarjeta es r=32, alpha=64, dropout=0.05 y aplicacion a todas las capas lineales, con learning rate 1e-4, 2 epochs y batch efectivo de 16. El repositorio se divide en cuatro subcarpetas: experts/math, experts/science, experts/code y control/joint. Los tres primeros son adaptadores especializados y el cuarto es un unico LoRA entrenado con la union de los tres dominios, pensado como control experimental para comparar la estrategia de varios expertos frente a una unica especializacion conjunta.

El pipeline de datos combina auto-destilacion de rechazo ("Base 拒绝采样自蒸馏") con 370 ejemplos por experto: problemas de NuminaMath-CoT (Apache-2.0) para matematicas, preguntas de opcion multiple de OpenScience (CC-BY-4.0) para ciencia y problemas de TACO en formato stdin (Apache-2.0) para codigo. Las respuestas de entrenamiento fueron generadas por el propio modelo base, de licencia Apache-2.0. La tarjeta no documenta el uso de RLHF, DPO ni otras fases de alineacion adicionales, ni detalla el numero total de tokens de entrenamiento; indica que el codigo de entrenamiento, la ficha de datos, los resultados de evaluacion y las limitaciones se encuentran en un repositorio de GitHub que, segun el propio autor, es privado.

## Capacidades

- Generacion de texto instructivo general, heredada del modelo base Qwen3-4B-Instruct-2507.
- Especializacion en razonamiento matematico mediante el adaptador experts/math, entrenado con problemas tipo NuminaMath-CoT.
- Resolucion de preguntas de ciencia de opcion multiple mediante experts/science, a partir de datos de OpenScience.
- Generacion de codigo con entrada por stdin mediante experts/code, entrenado con problemas de TACO.
- Cobertura conjunta de los tres dominios (matematicas, ciencia y codigo) en un unico adaptador de control (control/joint).
- Capacidad de servir varios adaptadores sobre una misma base para enrutar consultas por dominio en tiempo de inferencia.
- Soporte de tool calling, function calling, agentes y razonamiento multi-paso: no declarado en la tarjeta del adaptador (el modelo base Qwen3-4B-Instruct-2507 si incorpora capacidades de agente y function calling, pero no se documentan cambios al respecto).
- Capacidades multilingues: no disponibles en la tarjeta; dependen del modelo base.
- Capacidades especiales (modo thinking, vision, audio): no disponible; los adaptadores son exclusivamente de texto.

## Casos de uso

- Investigacion sobre merging y composicion de adaptadores LoRA: comparar el rendimiento de tres expertos monodominio frente a un unico LoRA multi-dominio (control/joint) es precisamente el objetivo del experimento, y sirve para validar metodologias de especializacion antes de escalarlas a modelos mayores.
- Reproduccion de pipelines de auto-destilacion con rechazo: usar los 370 ejemplos por experto y la configuracion de LoRA documentada para replicar el flujo de generacion de datos sinteticos con el propio modelo base.
- Tutorizacion de matematicas a nivel de problemas tipo competicion: el adaptador experts/math esta entrenado con cadenas de razonamiento de NuminaMath-CoT, adecuado para generar soluciones paso a paso de problemas de aritmetica y algebra.
- Evaluacion de conocimiento cientifico de opcion multiple: experts/science permite construir bancos de preguntas y comparar respuestas del experto frente al modelo base sin especializar.
- Asistencia en programacion orientada a entrada estandar: experts/code se entreno con problemas de TACO en formato stdin, util para generar y completar programas que leen de entrada estandar, tipico en plataformas de jueces automaticos.
- Servicio de inferencia con multiples LoRA sobre una sola base: desplegar el modelo base una vez y cargar los distintos adaptadores por peticion reduce el coste de VRAM frente a mantener cuatro modelos independientes.
- Punto de partida para fine-tuning adicional: los adaptadores pueden reutilizarse o fusionarse con la base para seguir entrenando en dominios especificos sin partir de cero.
- Prototipado academico en GPU de consumo: el tamano de 4B permite experimentar con especializacion por dominio en hardware asequible, algo inviable con modelos de 70B o superiores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La tarjeta del adaptador menciona que los resultados de evaluacion se encuentran en un repositorio de GitHub privado, cuya URL no se proporciona, por lo que no hay cifras verificables de MMLU, GSM8K, HumanEval ni de ninguna otra prueba comparable.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16/BF16 el modelo base de 4B requiere aproximadamente 8-9 GB de VRAM, a los que se suma la memoria de los adaptadores LoRA cargados (del orden de cientos de MB por adaptador en funcion del rango y las capas objetivo).
- Cuantizacion: en 8 bits la base baja a unos 4-5 GB y en 4 bits a unos 2,5-3,5 GB; conviene tener en cuenta que los adaptadores PEFT se aplican sobre la base y su cuantizacion esta soportada por librerias como bitsandbytes o por fusion previa de los pesos.
- GPU recomendadas: A100, H100 y L40S para servicio en produccion con varios adaptadores en paralelo; RTX 4090, RTX 3090 y A6000 para desarrollo y evaluacion sin cuantizar.
- GPU de consumo: si cabe en GPUs de gama media-alta. En FP16 entra en una RTX 4090 (24 GB), RTX 4080 (16 GB) y RTX 4060 Ti (16 GB) con margen; en cuantizacion de 4 bits es viable en tarjetas de 8 GB o menos.
- Opciones de despliegue: vLLM con soporte de LoRA (permite servir varios adaptadores sobre una unica instancia, ideal para este repositorio), TGI, PEFT con transformers para uso puntual y llama.cpp/Ollama tras fusionar el adaptador en los pesos base y convertir a GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Observaciones |
|---|---|---|---|---|---|
| MoshiQAQ/qwen3-4b-merge-practice-adapters | ~4B (base) + LoRA r=32 | Heredado del base (262 144 tokens) | Apache-2.0 | HuggingFace, 0 descargas | Adaptadores de practica en varios subdirectorios; sin benchmarks publicados |
| Qwen/Qwen3-4B-Instruct-2507 | ~4B | 262 144 tokens | Apache-2.0 | HuggingFace | Modelo base sobre el que se construyen los adaptadores; ampliamente usado |
| Llama-3.2-3B-Instruct | ~3B | 128 000 tokens | Llama 3.2 Community License | HuggingFace | Alternativa de tamano similar, pero con licencia no Apache y contexto menor |
| Gemma-3-4B-IT | ~4B | 128 000 tokens | Gemma Terms of Use | HuggingFace | Modelo denso comparable en tamano, con licencia propia y multimodal en algunas variantes |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada, por lo que la comparacion se limita a parametros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo experimental: la propia tarjeta lo etiqueta como "practica" ("练手实验"), sin validacion de produccion ni benchmarks publicos.
- Sin evaluacion verificable: no hay cifras de benchmarks; los resultados de evaluacion se citan en un repositorio de GitHub privado no enlazado.
- Riesgo de sobreajuste a los datos: cada experto se entrena con solo 370 ejemplos, un volumen muy reducido que puede provocar degradacion fuera de la distribucion del corpus de origen.
- Riesgo de alucinacion: las respuestas de entrenamiento se generaron por auto-destilacion del modelo base, por lo que un adaptador puede reproducir y amplificar errores preexistentes de la base en lugar de corregirlos.
- Sesgos conocidos: no documentados en la tarjeta; al no haber informacion sobre composicion, idioma o filtrado del dataset, no se puede evaluar el sesgo resultante.
- Idiomas soportados: no declarados; si los corpus de entrenamiento (NuminaMath-CoT, OpenScience, TACO) son predominantemente en ingles, el rendimiento en castellano u otros idiomas puede degradarse respecto a la base.
- Restricciones de licencia: los adaptadores se publican bajo Apache-2.0, pero la tarjeta advierte de que el dataset OpenScience es CC-BY-4.0 y que su publicador indica que los modelos entrenados con esos datos pueden quedar sujetos a la licencia de Qwen; conviene revisar este punto antes de un uso comercial.
- Contexto: aunque la base soporte contextos muy largos, no hay evidencia de que los adaptadores mantengan ese comportamiento tras el fine-tuning, dado que los ejemplos de entrenamiento son cortos.
- Uso comercial en produccion: sin benchmarks ni evaluacion de robustez, no es recomendable desplegarlo en entornos criticos sin una validacion propia.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/MoshiQAQ/qwen3-4b-merge-practice-adapters
- Modelo base Qwen/Qwen3-4B-Instruct-2507: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Repositorio de GitHub con codigo, ficha de datos y evaluacion: mencionado en la tarjeta como repositorio privado, URL no proporcionada.
- Dataset NuminaMath-CoT (Apache-2.0): no se proporciona enlace en la informacion disponible.
- Dataset TACO (Apache-2.0): no se proporciona enlace en la informacion disponible.
- Dataset OpenScience (CC-BY-4.0): no se proporciona enlace en la informacion disponible.

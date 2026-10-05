# Crimsonwasp/Qwen2.5-3B-Instruct-GGUF

## Resumen

El repositorio Crimsonwasp/Qwen2.5-3B-Instruct-GGUF es una conversión comunitaria al formato GGUF del modelo Qwen/Qwen2.5-3B-Instruct, desarrollado por el equipo Qwen de Alibaba Cloud. No se trata de un modelo nuevo ni de un ajuste fino: es un reempaquetado en cuantizaciones de llama.cpp del modelo instruct original, pensado para ejecución local en hardware de consumo y para su uso con llama.cpp, Ollama u otros runtimes compatibles con GGUF. El autor del reempaquetado es el usuario Crimsonwasp y el repositorio presenta un nivel de adopción muy bajo (0 descargas y 1 like en el momento de la consulta).

El modelo subyacente es un transformer causal denso de aproximadamente 3,09 mil millones de parámetros (3.397.103.616 según el recuento de safetensors del modelo base, que incluye embeddings), con 36 capas, atención con RoPE y sesgo en QKV, GQA con 16 cabezas de consulta y 2 de clave/valor, SwiGLU, RMSNorm y embeddings de palabras compartidos. La ventana de contexto declarada en esta ficha es de 32.768 tokens con generación de hasta 8.192 tokens, aunque la serie Qwen2.5 anuncia soporte de contexto largo de hasta 128K en otros tamaños.

Su relevancia actual es práctica: permite disponer de un modelo instruct de la familia Qwen2.5 en un único fichero de entre aproximadamente 1 y 3,4 GB, ejecutable en portátiles y GPUs de gama media sin conexión a servicios en la nube. El principal punto de atención es la licencia qwen-research, que restringe el uso comercial sin acuerdo adicional, y la discrepancia entre los idiomas declarados en los metadatos del repositorio (solo inglés) y los más de 29 idiomas que anuncia el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso con RoPE, SwiGLU, RMSNorm, sesgo en QKV y embeddings compartidos (tied word embeddings) |
| Parametros totales | 3.397.103.616 segun safetensors del modelo base; la model card indica 3,09 B totales y 2,77 B sin embeddings |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 32.768 tokens y generacion de hasta 8.192 tokens segun la model card de este repositorio; la serie Qwen2.5 declara contexto largo de hasta 128K en otros tamanos |
| Tipos de cuantizacion | q2_K, q3_K_M, q4_0, q4_K_M, q5_0, q5_K_M, q6_K, q8_0 |
| Idiomas soportados | Los metadatos del repositorio declaran unicamente en (ingles); el modelo base declara mas de 29 idiomas (entre ellos espanol, portugues, frances, aleman, italiano, ruso, chino, japones, coreano, arabe y tailandes) |
| Licencia | other / qwen-research (enlace a la licencia en el repositorio de Qwen) |
| Formato de pesos | GGUF |
| Capas | 36 |
| Cabezas de atencion | GQA: 16 para Q y 2 para KV |
| Etapa de entrenamiento | Preentrenamiento y postentrenamiento (instruct) |
| Tamano del repositorio | 25,2 GB (incluye todas las cuantizaciones) |

## Arquitectura y entrenamiento

La arquitectura es la del Qwen2.5-3B-Instruct original: un transformer causal de tipo decoder-only con 36 capas, normalizacion RMSNorm, activacion SwiGLU y embeddings de entrada y salida compartidos. Emplea codificacion posicional rotatoria (RoPE) y atencion con Grouped Query Attention, con 16 cabezas de consulta frente a 2 cabezas de clave/valor, lo que reduce de forma notable el tamano de la memoria de clave/valor durante la inferencia. El modelo incorpora sesgo en las proyecciones QKV, un detalle heredado de la familia Qwen2.

El entrenamiento del modelo base consistio en una fase de preentrenamiento seguida de un postentrenamiento de tipo instruct, con datos especializados en codigo y matematicas procedentes de modelos expertos, segun la documentacion oficial de Qwen2.5. No se detalla en la informacion disponible el numero exacto de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas concretas de RLHF o DPO para esta variante de 3B. Este repositorio, en concreto, no entrena nada: aplica exclusivamente la conversion y cuantizacion a GGUF mediante las herramientas de llama.cpp, con las variantes de cuantizacion K-quants y legacy (q4_0, q5_0) listadas arriba. No se documenta en la informacion proporcionada ninguna innovacion adicional respecto al modelo original (por ejemplo, decodificacion especulativa o atencion lineal).

## Capacidades

- Generacion de texto conversacional en modo chat, con plantilla de dialogo instruct y soporte de mensajes de sistema.
- Razonamiento y comprension de instrucciones, con mejoras declaradas por Qwen2.5 en seguimiento de instrucciones respecto a Qwen2.
- Codigo: generacion, explicacion y depuracion, gracias a los datos especializados incorporados en el entrenamiento del modelo base.
- Matematicas: resolucion de problemas aritmeticos y de razonamiento numerico de complejidad media.
- Generacion de textos largos, por encima de 8.000 tokens en la serie Qwen2.5 segun la documentacion.
- Comprension y generacion de datos estructurados, especialmente JSON y tablas.
- Mayor robustez frente a la diversidad de prompts de sistema, lo que facilita la implementacion de role-play y el condicionamiento de chatbots.
- Capacidades multilingues heredadas del modelo base (mas de 29 idiomas declarados), aunque los metadatos de este repositorio solo declaran ingles.
- No se documenta en la informacion disponible soporte de tool calling o function calling especifico, ni capacidades de vision, audio o modo de razonamiento explicito (thinking mode).

## Casos de uso

- Asistentes conversacionales locales y privados: el modelo puede gestionar dialogos multi-turno manteniendo contexto de hasta 32.768 tokens, lo que permite conversaciones largas y documentos extensos sin enviar datos a servidores externos. Es adecuado para entornos con requisitos de privacidad.
- Generacion de codigo en el puesto de trabajo: integrado en editores mediante llama.cpp o un servidor compatible con GGUF, sirve para autocompletado, generacion de funciones y explicacion de fragmentos de codigo en equipos sin GPU dedicada.
- Procesamiento de documentacion tecnica: resumen, extraccion de entidades y respuesta a preguntas sobre manuales, contratos o documentacion interna, dividiendo el texto en fragmentos que quepan en la ventana de contexto.
- Prototipado rapido de aplicaciones de IA: al ser un unico fichero GGUF, permite levantar un endpoint de chat en minutos con llama.cpp u Ollama para validar una idea de producto antes de invertir en modelos mayores.
- Educacion y generacion de material didactico: creacion de ejercicios, explicaciones paso a paso y correccion de respuestas, ejecutandose en un portatil de gama media.
- Extraccion y transformacion de datos estructurados: conversion de texto libre a JSON o tablas para pipelines de datos, aprovechando la mejora declarada de Qwen2.5 en generacion de salidas estructuradas.
- Despliegue en el borde (edge computing): por su tamano reducido en cuantizaciones bajas (q4_K_M o inferiores), puede ejecutarse en dispositivos con poca memoria o incluso con offload parcial a CPU.
- Chatbots de atencion al cliente de bajo coste: permite responder consultas frecuentes con latencia baja en hardware modesto, aunque la licencia qwen-research limita su uso en productos comerciales sin licencia adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de este repositorio se limita a enlazar el blog oficial de Qwen2.5 y la pagina de benchmarks de cuantizacion de la documentacion de Qwen, sin reproducir cifras concretas. No se incluyen valores de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion para esta conversion GGUF especifica, ni comparaciones medidas frente al modelo en bfloat16.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del numero de parametros (aproximadamente 3,1 B) y del coste de la cache KV, no datos medidos publicados para este repositorio.

- VRAM estimada para inferencia (solo pesos, aproximada): q2_K en torno a 1,2-1,4 GB; q3_K_M en torno a 1,5-1,7 GB; q4_K_M en torno a 1,9-2,0 GB; q5_K_M en torno a 2,2-2,3 GB; q6_K en torno a 2,6 GB; q8_0 en torno a 3,3-3,4 GB.
- Cache KV: con 36 capas, 2 cabezas KV y dimension de cabeza de 128, el coste es de aproximadamente 36 KB por token en FP16, lo que equivale a alrededor de 1,2 GB para los 32.768 tokens de contexto completo. Cuantizar la cache KV reduce esta cifra de forma significativa.
- GPU recomendadas: cualquier GPU con 6 GB o mas de VRAM puede ejecutar las cuantizaciones intermedias con contexto moderado; RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, A10, L4, A100 y H100 son adecuadas, aunque para este tamano de modelo las GPU de datacenter quedan ampliamente sobredimensionadas.
- Cabe en GPU de consumo: si. Es viable en iGPU y GPUs de 4-6 GB con cuantizaciones q4_K_M o inferiores y contexto reducido, y tambien en configuraciones con offload parcial a CPU usando RAM del sistema.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama, LM Studio, Jan, kobold.cpp, llama-cpp-python, y vLLM con soporte experimental de GGUF. El formato safetensors del modelo base permitiria tambien otros servidores, pero no forma parte de este repositorio.
- Latencia y throughput: no disponible en la informacion proporcionada. La documentacion de Qwen publica una tabla de velocidad y consumo de memoria en su pagina de speed benchmark, enlazada mas abajo.

## Comparativa con modelos similares

Los datos de esta tabla corresponden a las fichas oficiales de cada modelo y no proceden de la informacion proporcionada en esta busqueda; conviene verificarlos antes de tomar decisiones.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen2.5-3B-Instruct (este repositorio, GGUF) | ~3,09 B (3,4 B con embeddings) | 32.768 tokens segun esta model card | qwen-research (uso comercial restringido) | GGUF comunitario; el original en safetensors esta en el repositorio de Qwen |
| Llama-3.2-3B-Instruct | 3,2 B | 128K tokens | Llama 3.2 Community License | Pesos oficiales y amplio ecosistema de cuantizaciones GGUF |
| Phi-3.5-mini-instruct | 3,8 B | 128K tokens | MIT | Pesos oficiales en safetensors y GGUF |
| Gemma-2-2B-it | 2,6 B | 8.192 tokens | Gemma Terms of Use | Pesos oficiales y cuantizaciones GGUF |

No se dispone de datos de rendimiento comparativo para esta conversion concreta, por lo que no es posible establecer una comparacion cuantitativa fiable entre estas alternativas con la informacion disponible.

## Limitaciones y advertencias

- Licencia restrictiva: el modelo base se distribuye bajo la licencia qwen-research, que no autoriza el uso comercial sin obtener una licencia adicional de Alibaba Cloud. Esto afecta a cualquier producto o servicio que se construya sobre esta conversion GGUF.
- Idioma: aunque el modelo base declara soporte de mas de 29 idiomas, los metadatos de este repositorio solo declaran ingles. El rendimiento en espanol no esta verificado en la informacion disponible y puede ser inferior al de un modelo especificamente entrenado en castellano.
- Riesgo de alucinacion: al tratarse de un modelo de 3B parametros, la tasa de invencion de datos y de errores factuales es mayor que en modelos de mayor tamano. Es imprescindible validar la salida en aplicaciones sensibles.
- Perdida de calidad por cuantizacion: las variantes q2_K y q3_K_M degradan de forma notable la calidad respecto al modelo en bfloat16. La documentacion de Qwen publica las tablas de degradacion por cuantizacion; se recomienda q4_K_M o superior para uso en produccion.
- Sesgos: el modelo puede reproducir sesgos presentes en los datos de entrenamiento del modelo base. No se documenta en la informacion disponible ninguna evaluacion especifica de sesgo para esta variante.
- Contexto efectivo: la ventana de 32.768 tokens es menor que la de otros modelos contemporaneos de tamano similar (128K en Llama-3.2-3B y Phi-3.5-mini). Conviene no confundirla con el soporte de 128K de otros tamanos de la familia Qwen2.5.
- Capacidades de agente: no se documenta en la informacion disponible soporte de tool calling o function calling, ni un modo de razonamiento explicito, por lo que no deberia asumirse su disponibilidad sin verificacion previa.
- Mantenimiento: el repositorio muestra 0 descargas y 1 like, con una unica fecha de creacion y actualizacion. No hay garantia de mantenimiento, actualizacion ni soporte por parte del autor del reempaquetado, a diferencia del repositorio oficial de Qwen.
- Herramientas de cuantizacion: al ser una conversion de terceros, no existe verificacion independiente de la integridad de los ficheros mas alla de lo que ofrece HuggingFace. Para uso critico, es preferible generar la cuantizacion a partir de los pesos oficiales.

## Enlaces

- Repositorio de la conversion: https://huggingface.co/Crimsonwasp/Qwen2.5-3B-Instruct-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Repositorio GGUF oficial de Qwen: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct-GGUF
- Licencia qwen-research: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct-GGUF/blob/main/LICENSE
- Blog de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- Repositorio GitHub de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Documentacion de Qwen: https://qwen.readthedocs.io/en/latest/
- Guia de llama.cpp en la documentacion de Qwen: https://qwen.readthedocs.io/en/latest/run_locally/llama.cpp.html
- Benchmarks de cuantizacion: https://qwen.readthedocs.io/en/latest/benchmark/quantization_benchmark.html
- Benchmarks de velocidad y memoria: https://qwen.readthedocs.io/en/latest/benchmark/speed_benchmark.html
- Informe tecnico Qwen2 (arXiv:2407.10671): https://arxiv.org/abs/2407.10671
- llama.cpp: https://github.com/ggerganov/llama.cpp

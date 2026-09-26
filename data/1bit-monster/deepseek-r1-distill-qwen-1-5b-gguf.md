# 1bit-MONSTER/DeepSeek-R1-Distill-Qwen-1.5B-GGUF

## Resumen

El repositorio 1bit-MONSTER/DeepSeek-R1-Distill-Qwen-1.5B-GGUF es una republicacion en formato GGUF del modelo DeepSeek-R1-Distill-Qwen-1.5B, un modelo de razonamiento denso de 1.777.088.000 parametros que DeepSeek obtuvo destilando las trazas de razonamiento de su modelo insignia DeepSeek-R1 sobre una base de la familia Qwen. La version alojada aqui corresponde a la cuantizacion Q4_K_M realizada originalmente por bartowski y redistribuida por 1bit-MONSTER para ejecutarse con su motor 1bit sobre hardware Strix Halo con backend Vulkan.

El valor de esta publicacion no esta en una innovacion arquitectonica, que no existe, sino en ofrecer un artefacto ligero listo para inferencia local acompanado de mediciones de rendimiento propias (pp512 de 1.643 tokens/s y tg128 de 86,7 tokens/s en Strix Halo). Con licencia MIT heredada del modelo base, es un candidato util para prototipos de razonamiento, matematicas y codigo en equipos sin GPU dedicada.

Se trata de una publicacion muy reciente y con escasa traccion (0 descargas y 0 likes en el momento de redactar esta ficha), por lo que su calidad practica depende enteramente del modelo base de DeepSeek y no de aportaciones propias del re-host.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen2) con destilacion de razonamiento de DeepSeek-R1 |
| Parametros totales | 1.777.088.000 (1,78 B) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Qwen2.5 declara 32.768 tokens nativos) |
| Tipos de cuantizacion | Q4_K_M (GGUF). El repositorio original de bartowski incluye otras variantes |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (fichero DeepSeek-R1-Distill-Qwen-1.5B-Q4_K_M.gguf) |

## Arquitectura y entrenamiento

El modelo base DeepSeek-R1-Distill-Qwen-1.5B es un transformer decoder-only denso de 1,78 B de parametros perteneciente a la familia Qwen2. DeepSeek lo construyo aplicando destilacion supervisada sobre las cadenas de razonamiento generadas por DeepSeek-R1, un esquema que entrena al modelo pequeno para producir trazas de pensamiento extensas antes de emitir la respuesta final. Los detalles concretos del dataset, el numero de tokens de entrenamiento y el uso de RLHF o DPO no se recogen en la informacion proporcionada.

El artefacto descrito en esta ficha no reentrena el modelo: aplica una cuantizacion de 4 bits con imatrix sobre los pesos originales y los empaqueta en GGUF para inferencia mediante llama.cpp o motores compatibles. La unica aportacion del re-host es la publicacion de cifras de rendimiento medidas en Strix Halo con backend Vulkan.

## Capacidades

- Generacion de texto con razonamiento paso a paso: el modelo emite trazas de pensamiento largas antes de la respuesta, comportamiento heredado de DeepSeek-R1.
- Razonamiento matematico y resolucion de problemas, dado el origen del destilado sobre Qwen.
- Generacion y comprension de codigo.
- Conversacion multi-turno, segun la etiqueta conversational del repositorio.
- Compatibilidad con endpoints de inferencia (etiqueta endpoints_compatible).
- Soporte de tool calling o function calling: no documentado en la informacion proporcionada.
- Capacidades multilingues: no disponibles.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Razonamiento local en equipos sin GPU dedicada: con Q4_K_M el peso ocupa alrededor de 1,1 GB, por lo que puede ejecutarse en un portatil o mini-PC con memoria unificada, como demuestra la medicion sobre Strix Halo.
- Prototipado de asistentes conversacionales: la etiqueta conversational y su contexto multi-turno permiten construir chatbots de prueba antes de migrar a modelos mayores.
- Generacion de codigo asistida en local: util para autocompletado, explicacion de fragmentos y refactorizacion en entornos con restricciones de conectividad o de privacidad.
- Tutoria y resolucion de problemas matematicos: las trazas de razonamiento intermedias permiten mostrar el procedimiento, no solo el resultado, lo que resulta util en contextos educativos.
- Filtrado y clasificacion con justificacion: el modelo puede razonar sobre el texto de entrada antes de asignar una etiqueta, lo que ayuda en tareas de moderacion o triaje.
- Despliegue en el borde (edge): su tamano reducido y el soporte de Vulkan lo hacen apto para ejecucion en dispositivos con GPU integrada.
- Evaluacion comparativa de cuantizaciones: sirve como banco de pruebas para medir el impacto de Q4_K_M frente a otras variantes GGUF del mismo modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Las unicas cifras facilitadas corresponden a mediciones de velocidad de inferencia:

| Metrica | Valor (Strix Halo, Vulkan) |
|---|---|
| pp512 (prefill) | 1.643 tokens/s |
| tg128 (generacion) | 86,7 tokens/s |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5-2 GB con la cuantizacion Q4_K_M (el repositorio completo ocupa 1,1 GB).
- GPU recomendadas: cualquier GPU consumer moderna, incluidas RTX 3060, RTX 4070 o RTX 4090, aunque el modelo no necesita esa potencia; tambien funciona en iGPU con soporte Vulkan.
- Cabe sin problema en GPU consumer: si, en practicamente cualquier GPU con 2 GB o mas de memoria dedicada, asi como en sistemas con memoria unificada como Strix Halo.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), el motor 1bit (`1bit serve -m ... --device vulkan`) y cualquier runtime compatible con GGUF. vLLM y TGI requieren los pesos en safetensors, no este GGUF.
- Latencia y throughput: medidos en Strix Halo con Vulkan a 1.643 tokens/s de prefill y 86,7 tokens/s de generacion (tg128).

## Comparativa con modelos similares

| Modelo | Parametros | Longitud de contexto | Formato | Licencia |
|---|---|---|---|---|
| Este repositorio (DeepSeek-R1-Distill-Qwen-1.5B, Q4_K_M) | 1,78 B | No disponible | GGUF | MIT |
| DeepSeek-R1-Distill-Qwen-1.5B (original) | 1,78 B | 32.768 tokens (Qwen2.5) | safetensors | MIT |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 tokens | safetensors | Apache 2.0 |
| Llama-3.2-1B-Instruct | 1,24 B | 128.000 tokens | safetensors | Llama 3.2 |

Los datos de las alternativas provienen de la documentacion publica de cada modelo y no de la informacion proporcionada en esta busqueda; conviene verificarlos antes de tomar decisiones de produccion. No se dispone de resultados comparativos de rendimiento entre estos modelos en la informacion disponible.

## Limitaciones y advertencias

- Modelo pequeno (1,78 B): presenta una propension elevada a la alucinacion en dominios especializados o poco representados.
- Las cadenas de razonamiento largas incrementan el consumo de tokens y la latencia por respuesta, aunque el throughput medido sea alto.
- La cuantizacion Q4_K_M implica una perdida de precision respecto a los pesos originales en safetensors.
- Idiomas soportados y sesgos conocidos: no documentados en la informacion proporcionada.
- Longitud de contexto: no confirmada para este artefacto; se asume la del modelo base, pero no esta verificada.
- Repositorio con 0 descargas y 0 likes: sin validacion comunitaria que respalde la integridad o calidad del artefacto.
- Licencia MIT, que permite uso comercial, pero conviene verificar tambien las condiciones del modelo base de DeepSeek y de la cuantizacion original de bartowski.
- Al ser una republicacion, no debe atribuirse al autor del re-host ningun merito sobre el entrenamiento del modelo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/1bit-MONSTER/DeepSeek-R1-Distill-Qwen-1.5B-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Cuantizacion original de bartowski: https://huggingface.co/bartowski/DeepSeek-R1-Distill-Qwen-1.5B-GGUF
- Motor 1bit: https://github.com/1bit-MONSTER/engine
- Paper de DeepSeek-R1 (referencia del modelo base): https://arxiv.org/abs/2501.12948

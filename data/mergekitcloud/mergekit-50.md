# MergekitCloud/mergekit-50

## Resumen

MergekitCloud/mergekit-50 es un modelo de lenguaje de 8.000 millones de parametros creado mediante la fusion de tres modelos derivados de Llama-3.1-8B utilizando el metodo Model Stock implementado en la herramienta mergekit. El modelo resultante combina las capacidades de ArliAI/Llama-3.1-8B-ArliAI-RPMax-v1.3, Orenguteng/Llama-3.1-8B-Lexi-Uncensored-V2 y Undi95/Llama3-Unholy-8B-OAS, tomando como base vicgalle/Humanish-Roleplay-Llama-3.1-8B.

Este tipo de fusiones sin entrenamiento adicional (training-free) permiten obtener modelos con capacidades combinadas de los modelos originales —en este caso, conversacion, roleplay y respuestas menos censuradas— sin necesidad de GPU para fine-tuning. La relevancia de este modelo reside en su naturaleza experimental: al ser un merge automatico publicado por una cuenta denominada MergekitCloud, representa un caso de uso tipico de la comunidad de fusion de modelos, donde se busca explorar combinaciones de pesos de forma rapida y reproducible.

El modelo esta disponible en formato safetensors con precision float16, pesa aproximadamente 16 GB en disco y se distribuye bajo licencia no especificada, lo que limita su uso en entornos comerciales sin verificacion legal previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (transformers, text-generation) |
| Parametros totales | 8.030.261.248 (8,03 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (heredada de Llama-3.1-8B, probablemente 128K, sin confirmar) |
| Tipos de cuantizacion | No disponible (pesos en float16) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (float16) |

## Arquitectura y entrenamiento

El modelo es el resultado de una fusion de pesos mediante el metodo Model Stock, descrito en el articulo arXiv 2403.19522. Este algoritmo combina los pesos de varios modelos base sin requerir datos de entrenamiento ni etapa de fine-tuning, calculando una combinacion lineal optimizada de los parametros. La configuracion utilizada incluye los modelos ArliAI/Llama-3.1-8B-ArliAI-RPMax-v1.3, Orenguteng/Llama-3.1-8B-Lexi-Uncensored-V2 y Undi95/Llama3-Unholy-8B-OAS, con vicgalle/Humanish-Roleplay-Llama-3.1-8B como modelo base de la fusion.

Los cuatro modelos originales son a su vez variantes fine-tuned de Llama-3.1-8B, orientados a conversacion, roleplay y respuestas sin censura. El resultado es un modelo denso de 8B parametros que hereda la arquitectura transformer de Llama 3.1, con 32 capas y 128 canales de atencion por capa, aunque estos detalles concretos no estan confirmados en la documentacion publicada. No se ha realizado entrenamiento adicional sobre la fusion.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada de los modelos base orientados a chat y roleplay.
- Capacidades de roleplay y personificacion de personajes, gracias a la base Humanish-Roleplay-Llama-3.1-8B.
- Respuestas con menor filtrado de contenido que el Llama-3.1-8B original, por la inclusion de modelos "uncensored" en la fusion.
- Razonamiento y generacion de codigo basicos, propios de la familia Llama-3.1-8B, aunque sin mejoras especificas.
- Soporte de tool calling: no confirmado en la documentacion, aunque Llama-3.1-8B base lo soporta; la fusion puede haberlo conservado.
- Capacidades multilingues limitadas: no se ha publicado la lista de idiomas soportados.

## Casos de uso

- **Chatbots de roleplay y entretenimiento**: el modelo combina modelos especializados en roleplay y conversacion natural, por lo que puede usarse para crear asistentes de ficcion, juegos de rol textuales o companeros de conversacion con personalidades definidas.
- **Generacion de contenido creativo sin restricciones**: al incluir modelos "uncensored", puede producir textos de tematica libre (literatura, guiones, narrativa adulta) donde los modelos censurados fallan.
- **Prototipado rapido de asistentes conversacionales**: dado que no requiere entrenamiento, un equipo puede desplegar el modelo en horas para validar conceptos de producto antes de invertir en fine-tuning.
- **Investigacion sobre fusion de modelos**: sirve como caso de estudio para evaluar la eficacia del metodo Model Stock sobre modelos de rol y conversacion, y para comparar la calidad del resultado con los modelos originales.
- **Evaluacion de calidad en modelos sin censura**: permite analizar el equilibrio entre utilidad, seguridad y libertad de contenido en modelos derivados de Llama-3.1-8B.
- **Sistemas de generacion de historias interactivas**: la combinacion de roleplay y estilo conversacional lo hace util para motores de narrativa generativa en aplicaciones de ficcion interactiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar para este modelo. Al ser un merge sin evaluacion publicada, no es posible comparar su rendimiento cuantitativo con los modelos base.

## Requisitos de hardware

- **VRAM estimada para inferencia**: aproximadamente 16 GB en float16 para el modelo completo; con cuantizacion a 4 bits (int4) se reduciria a unos 5-6 GB.
- **GPU recomendadas**: una RTX 3090, RTX 4090 o A100 con 24 GB de VRAM pueden ejecutar el modelo en float16 sin problemas; en cuantizacion 4 bits cabe en GPUs de 8-12 GB como RTX 4070 o RTX 3080.
- **Consumer GPU**: si, en cuantizacion Q4_K_M o similar puede ejecutarse en GPUs consumer de 8 GB.
- **Opciones de despliegue**: vLLM, llama.cpp, Ollama, TGI (Text Generation Inference) o transformers directamente, siempre que se generen los formatos de cuantizacion adecuados (GGUF para llama.cpp/Ollama).
- **Latencia y throughput**: no disponibles; en un 8B denso, se estima entre 30-60 tokens/segundo en una RTX 4090 con cuantizacion 4 bits, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| MergekitCloud/mergekit-50 | 8,03 B | No disponible | Fusion de rol y sin censura | No disponible |
| Llama-3.1-8B-Instruct | 8,03 B | 128K | Instrucciones generales | Llama 3.1 Community License |
| ArliAI/Llama-3.1-8B-ArliAI-RPMax-v1.3 | 8,03 B | 128K | Roleplay y conversacion | No disponible |
| Undi95/Llama3-Unholy-8B-OAS | 8,03 B | 128K | Sin censura | No disponible |

El modelo se sitúa en la misma categoria que sus modelos base: un 8B denso orientado a conversacion y roleplay. Su ventaja principal es la combinacion de caracteristicas de los tres modelos en uno solo, aunque sin evaluaciones publicadas no se puede confirmar que supere a cada uno en sus dominios respectivos. La licencia no especificada es una desventaja para uso comercial.

## Limitaciones y advertencias

- **Licencia no especificada**: el autor no ha indicado licencia, lo que impide su uso comercial legal sin una consulta legal previa; puede haber restricciones heredadas de los modelos base.
- **Alucinaciones**: al ser una fusion sin entrenamiento, no se ha realizado evaluacion de calidad, y es probable que herede los sesgos y limitaciones de los modelos base.
- **Contenido no censurado**: la inclusion de modelos "uncensored" implica que el modelo puede generar contenido inapropiado, violento o explicito; debe desplegarse con filtros adicionales en entornos publicos.
- **Contexto no confirmado**: aunque hereda la arquitectura Llama-3.1, no se ha verificado la longitud de contexto real del modelo fusionado.
- **Idiomas limitados**: sin informacion sobre idiomas, se asume que su rendimiento fuera de ingles es inferior, como es habitual en los modelos base.
- **Sin garantias de calidad**: al ser un merge automatico sin evaluacion, no se recomienda para aplicaciones criticas sin pruebas previas exhaustivas.
- **Riesgo de degradacion**: los metodos de fusion pueden degradar el rendimiento en ciertas tareas frente a los modelos originales, especialmente en razonamiento logico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MergekitCloud/mergekit-50
- Repositorio de mergekit: https://github.com/arcee-ai/mergekit
- Articulo Model Stock (arXiv:2403.19522): https://arxiv.org/abs/2403.19522
- Documentacion de mergekit en Clore.ai: https://docs.clore.ai/guides/training/mergekit
- Comunidad MergeKit Hub: https://www.mergekit.com/
- Modelo base ArliAI/Llama-3.1-8B-ArliAI-RPMax-v1.3: https://huggingface.co/ArliAI/Llama-3.1-8B-ArliAI-RPMax-v1.3
- Modelo base Orenguteng/Llama-3.1-8B-Lexi-Uncensored-V2: https://huggingface.co/Orenguteng/Llama-3.1-8B-Lexi-Uncensored-V2
- Modelo base Undi95/Llama3-Unholy-8B-OAS: https://huggingface.co/Undi95/Llama3-Unholy-8B-OAS
- Modelo base vicgalle/Humanish-Roleplay-Llama-3.1-8B: https://huggingface.co/vicgalle/Humanish-Roleplay-Llama-3.1-8B

# pranil00/ONIX-gemma-2-2b-it-GGUF

## Resumen

ONIX-gemma-2-2b-it-GGUF es una cuantizacion en formato GGUF del modelo google/gemma-2-2b-it, publicada por el usuario pranil00 bajo el paraguas de la denominada "ONIX Community". El artefacto aplica el esquema de cuantizacion Q5_K_M (5,5 bits por peso) sobre el modelo instructivo de Gemma 2 de Google, con el objetivo de reducir el espacio en disco y la memoria necesaria para ejecutarlo en hardware de consumo. El repositorio ocupa 13,0 GB y contiene un unico archivo de pesos de aproximadamente 6,67 GB.

La relevancia de esta publicacion es practica: permite ejecutar un modelo de la familia Gemma 2 en equipos con GPU de consumo (RTX 30/40/50), Apple Silicon o CPU, mediante llama.cpp, Ollama, LM Studio o la CLI run-any-model del propio autor. No aporta innovaciones arquitectonicas ni nuevos datos de entrenamiento; es una conversion de pesos del checkpoint original de Google.

Conviene senalar que la model card contiene afirmaciones no verificables y datos internamente incoherentes: declara 9,93 mil millones de parametros cuando el modelo base Gemma 2 2B tiene aproximadamente 2,6 mil millones, y presenta metricas de "fidelidad cognitiva" sin metodologia publicada. Esta ficha distingue explicitamente entre los datos verificables del modelo base y las afirmaciones del autor de la cuantizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 2); cuantizacion GGUF |
| Parametros totales | Aproximadamente 2,6 mil millones (modelo base google/gemma-2-2b-it). La model card declara 9,93 mil millones, dato no coherente con el modelo base |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens (modelo base); la model card indica 8.192 en GPU/Apple Silicon y 4.096 en CPU |
| Tipos de cuantizacion | Q5_K_M (5,5 bits por peso); unico archivo publicado |
| Idiomas soportados | No disponible en la informacion proporcionada (el modelo base Gemma 2 soporta principalmente ingles y varios idiomas adicionales, pero no se detalla) |
| Licencia | Apache 2.0 (segun la model card y los metadatos del repositorio) |
| Formato de pesos | GGUF (archivo google--gemma-2-2b-it-Q5_K_M.gguf, 6,67 GB) |

## Arquitectura y entrenamiento

El modelo subyacente es google/gemma-2-2b-it, un transformer decoder-only de la familia Gemma 2 de Google, ajustado con instrucciones (instruction-tuned). La publicacion de pranil00 no aporta informacion sobre la arquitectura interna, el numero de tokens de entrenamiento, la composicion del dataset ni las tecnicas de alineacion (RLHF, DPO u otras) empleadas por Google; esos datos corresponden al modelo original y no se reproducen en la model card de esta cuantizacion.

La unica transformacion aplicada es la cuantizacion a Q5_K_M mediante el motor run-any-model del autor. La model card reporta una reduccion del 65,6 % en tamano de pesos (de 19,42 GB en FP16 a 6,67 GB), una aceleracion de las 42 capas del modelo y un buffer de KV cache de 1.176 MB en FP16. No se documenta la metodologia del calculo de "retencion de calidad del 97,5 %", por lo que debe tratarse como una afirmacion del autor sin validacion independiente.

## Capacidades

- Generacion de texto conversacional en modo instructivo, heredada del ajuste de instrucciones de Gemma 2 2B IT.
- Razonamiento basico y respuesta a preguntas de complejidad moderada, limitado por el tamano del modelo (aproximadamente 2,6 mil millones de parametros).
- Generacion de codigo y explicaciones tecnicas sencillas.
- Aritmetica y problemas matematicos de baja complejidad.
- Conversacion multi-turno con contexto de hasta 8.192 tokens (4.096 en CPU segun la model card).
- Ejecucion local en hardware de consumo mediante llama.cpp, Ollama, LM Studio, Jan o la CLI run-any-model.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no documentadas; el tamano del modelo limita su fiabilidad en tareas agenticas complejas.
- Vision y audio: no soportados (el modelo base es solo texto).
- Capacidades multilingues: no detalladas en la informacion proporcionada.

## Casos de uso

- Asistente conversacional local en portatil: con 6,67 GB de pesos y unos 8 GB de memoria unificada o VRAM, el modelo puede ejecutarse en un Mac con Apple Silicon o en una RTX 4060, ofreciendo un chatbot privado sin conexion a Internet.
- Prototipado rapido de aplicaciones de texto: util para validar prompts, flujos de conversacion y formatos de salida antes de migrar a un modelo mayor, gracias a su baja latencia y facilidad de despliegue con Ollama o llama.cpp.
- Generacion de codigo en entornos con restricciones de privacidad: al ejecutarse en local, permite autocompletar o explicar fragmentos de codigo sin enviar el codigo del cliente a servicios externos, aunque la calidad sera inferior a la de modelos de mayor tamano.
- Educacion y demostraciones: adecuado para talleres y cursos sobre LLM, ya que cabe en equipos de estudiante y permite experimentar con cuantizacion, temperatura y contexto sin infraestructura cloud.
- Procesamiento por lotes de textos cortos: resumenes, clasificacion o reescritura de documentos de hasta unos miles de tokens en pipelines offline, donde el coste por token es practicamente nulo tras la descarga.
- Filtrado y preprocesado en pipelines RAG: puede utilizarse como modelo ligero para reformular consultas o descartar fragmentos irrelevantes antes de invocar un modelo mayor, reduciendo costes de inferencia.
- Base para fine-tuning ligero o experimentacion con LoRA: el checkpoint cuantizado no es el formato ideal para reentrenar, pero sirve como referencia de comportamiento del modelo base en tareas concretas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card unicamente incluye una tabla de telemetria interna del motor run-any-model con las siguientes metricas de despliegue:

| Metrica | FP16 (base) | Q5_K_M (esta publicacion) | Variacion |
|---|---|---|---|
| Precision de bits | 16,0 bits/parametro | 5,5 bits/parametro | -65,6 % |
| Tamano de pesos | 19,42 GB | 6,67 GB | -65,6 % |
| Buffer KV cache | 1.176 MB | 1.176 MB | Sin cambios |
| RAM residente total | 20,63 GB | 7,89 GB | -61,8 % |
| Capas aceleradas | 0 % | 42/42 | Optimizado |
| Calidad estimada | 100 % (referencia) | 97,5 % (segun el autor) | -2,5 % |

Estas cifras proceden del autor y no han sido verificadas de forma independiente; la "calidad estimada" no incluye metodologia de evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8,17 GB de VRAM dedicada en GPU NVIDIA para contexto de 8.192 tokens (cifra del autor).
- Memoria unificada en Apple Silicon: aproximadamente 7,89 GB para contexto de 8.192 tokens, con aceleracion Metal.
- CPU: aproximadamente 9,89 GB de RAM libre para contexto de 4.096 tokens, con soporte AVX2/AVX-512.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090; en el lado profesional, A100 o H100 quedan sobredimensionadas para este modelo.
- Cabe en GPU de consumo: si, en cualquier GPU con al menos 8 GB de VRAM; en GPUs de 6 GB habria que reducir contexto o usar una cuantizacion menor (no publicada en este repositorio).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, Jan, Text-Generation-WebUI y la CLI run-any-model.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| ONIX-gemma-2-2b-it-GGUF (esta publicacion) | Aprox. 2,6 B | 8.192 | GGUF Q5_K_M | Apache 2.0 | Cuantizacion de terceros; sin benchmarks publicados |
| google/gemma-2-2b-it | Aprox. 2,6 B | 8.192 | Safetensors | Gemma Terms of Use | Checkpoint oficial de Google; requiere aceptar terminos |
| Llama 3.2 3B Instruct | Aprox. 3,2 B | 128.000 | Safetensors, GGUF | Llama 3.2 Community License | Mayor contexto; disponible en GGUF por la comunidad |
| Qwen2.5 1.5B / 3B Instruct | 1,5 B / 3,1 B | 32.768 | Safetensors, GGUF | Apache 2.0 | Alternativa permisiva con contexto amplio y buen rendimiento en codigo |

La comparacion de rendimiento entre estos modelos no puede establecerse con los datos disponibles, ya que esta publicacion no incluye benchmarks. Nota importante: la model card declara licencia Apache 2.0, pero el modelo base de Google se distribuye bajo los Gemma Terms of Use, lo que genera una discrepancia legal que el usuario debe evaluar antes de un uso comercial.

## Limitaciones y advertencias

- Incoherencia en los metadatos: la model card declara 9,93 mil millones de parametros, cifra incompatible con el modelo base Gemma 2 2B (aproximadamente 2,6 mil millones). Los datos de la ficha del autor deben tratarse con cautela.
- Licencia dudosa: el repositorio indica Apache 2.0, pero el modelo base google/gemma-2-2b-it esta sujeto a los Gemma Terms of Use. La redistribucion como Apache 2.0 puede no ser conforme; conviene verificar antes de uso comercial.
- Riesgo de alucinacion: inherente a un modelo de aproximadamente 2,6 mil millones de parametros; la cuantizacion Q5_K_M puede degradar ligeramente la coherencia en tareas de razonamiento largo.
- Capacidad limitada: no es adecuado para tareas agenticas complejas, razonamiento matematico avanzado ni generacion de codigo en produccion sin supervision.
- Idiomas: no se especifican los idiomas soportados; el rendimiento fuera del ingles puede ser irregular.
- Contexto efectivo: aunque el modelo base admite 8.192 tokens, la model card reduce a 4.096 en CPU, lo que limita casos de uso con documentos largos en ese entorno.
- Sin benchmarks: no hay evaluaciones independientes de la calidad tras la cuantizacion; la cifra de "97,5 % de retencion" no es verificable.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni de validacion por terceros.
- Ausencia de garantias: la model card incluye un descargo de responsabilidad absoluto que exime al autor de cualquier dano derivado del uso.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pranil00/ONIX-gemma-2-2b-it-GGUF
- Modelo base: https://huggingface.co/google/gemma-2-2b-it
- Organizacion ONIX en Hugging Face: https://huggingface.co/ONIX
- Repositorio run-any-model: https://github.com/PranilShah-08/run-any-model
- Documentacion de llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
- LM Studio: https://lmstudio.ai
- Jan: https://jan.ai

# pranil00/ONIX-DeepSeek-R1-Distill-Qwen-14B-GGUF

## Resumen

ONIX-DeepSeek-R1-Distill-Qwen-14B-GGUF es una cuantizacion en formato GGUF del modelo deepseek-ai/DeepSeek-R1-Distill-Qwen-14B, publicada por el usuario pranil00 bajo la etiqueta de la comunidad ONIX. El modelo base es un destilado de DeepSeek-R1 sobre la arquitectura Qwen2.5 de 14B parametros, orientado a tareas de razonamiento, matematicas y generacion de codigo, e incluye trazas de razonamiento explicito (modo thinking). Esta version concreta aplica una cuantizacion Q5_K_M (5,5 bits por peso) que reduce el peso de los pesos de 28,89 GB en FP16 a 9,93 GB, lo que permite ejecutar el modelo en hardware de consumo.

La relevancia de esta publicacion es practica: facilita el despliegue local del destilado de R1 en equipos con 10-13 GB de memoria unificada o VRAM, mediante llama.cpp, Ollama, LM Studio o la CLI run-any-model del propio autor. El repositorio ocupa 19,4 GB, lo que sugiere que puede contener mas de un archivo GGUF ademas del Q5_K_M documentado en la model card.

Conviene senalar que se trata de un artefacto de cuantizacion de terceros, no de un modelo entrenado desde cero: la arquitectura, los datos de entrenamiento y las capacidades reales son las del modelo base de DeepSeek, y la model card no aporta informacion sobre el proceso de entrenamiento ni sobre evaluaciones independientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2.5, destilado de DeepSeek-R1); detalles de atencion no disponibles en la informacion proporcionada |
| Parametros totales | 14.769.684.480 (14,77 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 8.192 tokens (ventana optima indicada para GPU y Apple Silicon); 4.096 tokens en CPU segun la model card; contexto nativo del modelo base no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q5_K_M (5,5 bits por peso); el repo podria incluir otras variantes, no confirmado |
| Idiomas soportados | no disponible (la model card no los enumera) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo `deepseek-ai--DeepSeek-R1-Distill-Qwen-14B-Q5_K_M.gguf`) |

## Arquitectura y entrenamiento

El modelo base es un destilado de DeepSeek-R1 sobre Qwen2.5-14B: DeepSeek genero trazas de razonamiento con su modelo R1 y ajusto el modelo Qwen para reproducir ese estilo de cadena de pensamiento. La arquitectura subyacente es un transformer decoder-only denso de la familia Qwen2.5, con 14,77 B de parametros. La model card de esta cuantizacion no detalla el numero de tokens de entrenamiento, la composicion del dataset ni las etapas de RLHF o DPO del modelo base; esa informacion debe consultarse en la ficha original de deepseek-ai.

La innovacion de esta publicacion es exclusivamente de compresion: cuantizacion Q5_K_M con un ratio de compresion de 2,91x respecto a FP16 (reduccion del 65,6 % del peso) y una retencion de calidad estimada del 97,5 % segun el propio autor. El informe de auditoria de run-any-model indica aceleracion de las 48 capas en Metal, un buffer de KV cache de 768 MB en FP16 y un consumo total residente de 10,77 GB en Apple Silicon. No se aportan datos sobre tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto y razonamiento multi-paso con trazas de pensamiento explicitas, heredadas del destilado de DeepSeek-R1.
- Resolucion de problemas matematicos y de logica, el punto fuerte del modelo base.
- Generacion y explicacion de codigo en lenguajes habituales.
- Conversacion multi-turno dentro de la ventana de contexto configurada (8.192 tokens en GPU/Apple Silicon, 4.096 en CPU).
- Ejecucion local sin conexion en hardware de consumo, gracias al formato GGUF.
- Compatibilidad con llama.cpp, Ollama, LM Studio, Jan y la CLI run-any-model.
- Soporte de tool calling y function calling: no confirmado en la informacion proporcionada para esta cuantizacion.
- Capacidades multimodales (vision, audio): no disponibles; el modelo es solo de texto.
- Cobertura multilingue: no disponible en la informacion proporcionada.

## Casos de uso

- Razonamiento matematico asistido en local: el modelo puede resolver problemas paso a paso mostrando la cadena de razonamiento, util para entornos educativos o de investigacion donde no se permite enviar datos a la nube.
- Asistente de programacion offline: generacion y revision de codigo en un portatil con GPU de 12 GB o Apple Silicon, integrable en editores mediante un servidor local compatible con la API de llama.cpp u Ollama.
- Prototipado de agentes de razonamiento: la ventana de 8.192 tokens permite encadenar varios pasos de un agente con historial de herramientas y observaciones intermedias.
- Analisis de documentos tecnicos de longitud media: resumen y extraccion de conclusiones de informes que quepan en 8.000 tokens, con la ventaja de que el contenido no sale del equipo.
- Educacion y divulgacion: explicacion de conceptos con trazas de razonamiento visibles, utiles para que el estudiante vea el proceso y no solo la respuesta.
- Evaluacion comparativa de cuantizaciones: el artefacto sirve para medir la perdida de calidad de Q5_K_M frente a FP16 en tareas de razonamiento, usando el mismo prompt en ambos formatos.
- Despliegue en entornos con restricciones de red: estaciones de trabajo aisladas (defensa, sanidad, industria) donde un modelo Apache 2.0 ejecutable en CPU con AVX2 es la unica opcion viable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye el informe de compresion de run-any-model (tamano de pesos, RAM residente y retencion de calidad estimada del 97,5 %), que no constituye una evaluacion de calidad en tareas estandar como MMLU, GSM8K o HumanEval.

## Requisitos de hardware

- VRAM/RAM estimada para Q5_K_M: 10,77 GB de memoria unificada en Apple Silicon; 11,43 GB de VRAM dedicada en GPU NVIDIA; 12,77 GB de RAM libre en CPU.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090, A100 y H100 sin problema de capacidad; en GPUs de 8 GB no cabe el archivo completo y requeriria offload parcial a CPU.
- Apple Silicon: M1/M2/M3/M4 con 16 GB o mas de memoria unificada, con aceleracion Metal de las 48 capas.
- Cabe en GPU de consumo: si, en modelos con 12 GB o mas de VRAM (RTX 3060 12 GB, RTX 4070, RTX 4060 Ti 16 GB).
- Opciones de despliegue: llama.cpp (`llama-cli`), Ollama (via Modelfile), LM Studio, Jan, Text-Generation-WebUI y la CLI run-any-model.
- Latencia y throughput: no disponibles en la informacion proporcionada; el autor solo reporta que la aceleracion es "optima" en Metal y CUDA, sin cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| ONIX-DeepSeek-R1-Distill-Qwen-14B-GGUF (Q5_K_M) | 14,77 B | 8.192 (GPU/Apple), 4.096 (CPU) | GGUF | Apache 2.0 | Cuantizacion de terceros; 9,93 GB de pesos |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-14B | 14,77 B | no disponible en la informacion proporcionada | safetensors | Apache 2.0 (modelo base) | Modelo original sin cuantizar; 28,89 GB en FP16 |
| ONIX-DeepSeek-R1-Distill-Qwen-14B en FP16 (referencia) | 14,77 B | idem | safetensors | Apache 2.0 | Requiere 29,73 GB residentes; inviable en equipos de 16 GB |

No se dispone de datos de rendimiento comparado con otras alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos del modelo base; deben asumirse los del destilado de DeepSeek-R1, no evaluados aqui.
- Riesgo de alucinacion inherente a los modelos de razonamiento destilados, especialmente en dominios especializados y con contextos largos.
- La ventana de contexto efectiva en esta cuantizacion se limita a 8.192 tokens en GPU/Apple Silicon y 4.096 en CPU, por debajo de lo que suele soportar el modelo base.
- La retencion de calidad del 97,5 % es una estimacion del autor, no una medicion verificada con benchmarks estandar.
- Idiomas soportados no declarados: no hay garantia de calidad fuera del ingles y el chino, idiomas dominantes del modelo base.
- El repositorio ocupa 19,4 GB, mas que el archivo Q5_K_M documentado (9,93 GB); conviene verificar que archivos contiene antes de descargarlo.
- La licencia Apache 2.0 del artefacto se hereda del modelo base; el autor anade un descargo de responsabilidad amplio que no altera los terminos de la licencia pero traslada al usuario toda la responsabilidad sobre las salidas.
- Publicacion de terceros con 0 descargas y 0 likes: no hay evidencia de comunidad ni de validacion independiente del artefacto.
- Para produccion se recomienda validar el archivo GGUF (integridad y metadatos) y comparar salidas contra el modelo original antes de desplegarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pranil00/ONIX-DeepSeek-R1-Distill-Qwen-14B-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-14B
- Organizacion ONIX en Hugging Face: https://huggingface.co/ONIX
- Repositorio run-any-model: https://github.com/PranilShah-08/run-any-model

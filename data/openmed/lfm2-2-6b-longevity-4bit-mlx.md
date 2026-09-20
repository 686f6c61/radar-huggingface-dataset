# OpenMed/LFM2-2.6B-Longevity-4bit-mlx

## Resumen

OpenMed/LFM2-2.6B-Longevity-4bit-mlx es una conversion nativa a MLX del checkpoint LiquidAI/LFM2-2.6B-Longevity, cuantizada de forma afin a 4 bits (group size 64) con mlx_lm 0.31.3 para su ejecucion en Apple Silicon. El modelo original es un ajuste fino de dominio de LiquidAI/LFM2-2.6B realizado conjuntamente por Insilico Medicine y Liquid AI, orientado a la interpretacion de datos heterogeneos de biologia del envejecimiento (genomicos, proteomicos y clinicos), y acompanado del estudio "An Open Benchmark and Language Models for AI in Aging Biology" (Zhavoronkov et al., 2026).

Se trata de un modelo denso de 2.569.272.320 parametros (2,57 B) con arquitectura hibrida lfm2: 30 capas, de las cuales 22 son convoluciones cortas con puerta (gated short convolutions) y solo 8 son capas de atencion con grouped-query attention. El contexto declarado en la model card upstream es de 32.768 tokens, aunque max_position_embeddings alcanza 128.000.

Su relevancia practica es doble. Por un lado, ofrece un modelo de dominio biomedico especializado en envejecimiento que funciona integramente en local: los pesos cuantizados ocupan 1,35 GiB, frente a los 4,79 GiB del original en BF16 (3,6 veces menos), lo que permite ejecutarlo en un Mac de gama base o en un telefono sin conexion a servicios en la nube. Por otro lado, demuestra el patron de publicacion de derivados cuantizados por terceros (OpenMed) sobre pesos bajo LFM Open License v1.0, con el tokenizador, la plantilla de chat y los valores de generacion sin modificar respecto al upstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Lfm2ForCausalLM (lfm2), hibrida: convoluciones cortas con puerta + atencion agrupada |
| Parametros totales | 2.569.272.320 (2,57 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens segun la model card upstream (max_position_embeddings 128.000) |
| Tipos de cuantizacion | 4 bits affine MLX, group size 64 (existe un hermano de 8 bits: OpenMed/LFM2-2.6B-Longevity-8bit-mlx) |
| Idiomas soportados | en (ingles) |
| Licencia | lfm1.0 (LFM Open License v1.0); etiquetada como "other" en HuggingFace |
| Formato de pesos | safetensors (MLX), 1,35 GiB |
| Tamano del repositorio | 1,4 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-20 |
| Libreria | mlx |
| Prefijo SHA-256 de los pesos | c5f4432baaa4a0e8c3be2fb31c68af3b65e97cf9f2ce32b095f3b40791674c87 |

## Arquitectura y entrenamiento

El checkpoint base LFM2-2.6B emplea un diseno hibrido en el que la mayoria de las capas no son de atencion: de las 30 capas, 22 son convoluciones cortas con puerta y 8 son capas de atencion con grouped-query attention (32 cabezas de consulta y 8 cabezas de clave/valor). El tamano oculto es 2048, el ancho de la red feed-forward es 10.752 y el vocabulario es de 65.536 entradas con embeddings de entrada y salida atados. La combinacion de convoluciones y atencion dispersa reduce el coste de inferencia en secuencias largas respecto a un transformer de atencion densa del mismo tamano.

El ajuste Longevity-LLM se realizo mediante supervised fine-tuning de parametros completos sobre datos multi-omicos y clinicos relacionados con el envejecimiento, partiendo de LiquidAI/LFM2-2.6B. No se documenta en la informacion disponible el numero exacto de tokens de entrenamiento, la composicion detallada del corpus ni si se aplicaron fases de RLHF o DPO. La plantilla de chat es de estilo ChatML e incorpora un conmutador de razonamiento dinamico: el sufijo `/think` en el turno de usuario activa una traza de razonamiento y `/no_think` fuerza una respuesta directa. En esta conversion, la cuantizacion MLX se aplico a todas las proyecciones lineales y al embedding de tokens atado, mientras que las escalas de RMSNorm y los kernels de convolucion corta se mantuvieron en BF16, lo que preserva la estabilidad numerica de las partes sensibles del modelo.

## Capacidades

- Generacion de texto y conversacion multturno en ingles, con plantilla de chat ChatML incluida en el repositorio.
- Razonamiento biomedico de dominio: interpretacion de paneles clinicos, biomarcadores de edad biologica, datos genomicos y proteomicos, y datos de multi-omica asociados al envejecimiento.
- Modo de razonamiento dinamico mediante los sufijos `/think` (traza de razonamiento) y `/no_think` (respuesta directa).
- Interpretacion de casos clinicos sinteticos: la model card incluye un ejemplo con HbA1c, hs-CRP y edad epigenetica.
- Ejecucion en local sobre Apple Silicon mediante la libreria mlx y mlx-lm.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso autonomo: no disponible en la informacion proporcionada.
- Capacidades multilingues: no, el modelo solo declara ingles.
- Vision, audio o modalidades adicionales: no disponible; el pipeline declarado es text-generation.

## Casos de uso

- Analisis exploratorio de paneles de biomarcadores: dado un conjunto de valores de laboratorio (HbA1c, hs-CRP, perfil lipidico), el modelo puede generar hipotesis sobre que vias biologicas del envejecimiento estan implicadas, gracias al ajuste fino sobre datos clinicos y multi-omicos.
- Apoyo a la redaccion de notas de investigacion en biologia del envejecimiento: resumir y reformular resultados de experimentos con datos genomicos o proteomicos para informes internos de laboratorio.
- Preprocesado y anotacion asistida de cohortes: generar descripciones estructuradas de registros clinicos heterogeneos antes de pasarlos a un pipeline estadistico, aprovechando su especializacion de dominio.
- Prototipado de asistentes de investigacion en un Mac: al ocupar 1,35 GiB en 4 bits, permite iterar sobre prompts y plantillas de razonamiento (`/think` frente a `/no_think`) sin coste de API ni envio de datos a terceros.
- Docencia y formacion en aging biology: generar explicaciones sobre la relacion entre marcadores epigeneticos, inflamacion cronica y edad cronologica en un entorno controlado y reproducible.
- Evaluacion comparativa de derivados cuantizados: usar este checkpoint y su hermano de 8 bits para medir el impacto de la cuantizacion en tareas biomedicas concretas, manteniendo fijos tokenizador, plantilla y parametros de generacion.
- Despliegue en dispositivos sin conectividad: en escenarios de campo o con datos sensibles que no pueden salir de la maquina, la cuantizacion de 4 bits permite ejecutar el modelo en portatiles con memoria unificada reducida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del derivado remite a la model card upstream y al estudio *An Open Benchmark and Language Models for AI in Aging Biology* (Zhavoronkov et al., 2026) para el corpus de entrenamiento y la evaluacion, pero no se incluyen cifras de MMLU, HumanEval, GSM8K ni de benchmarks especificos de biologia del envejecimiento. Tampoco se aportan mediciones de latencia o throughput para esta conversion MLX.

## Requisitos de hardware

- Memoria para los pesos: 1,35 GiB en cuantizacion de 4 bits, frente a 4,79 GiB del original en BF16. Los pesos son la totalidad de la descarga.
- VRAM estimada para inferencia: al ser un modelo MLX, se ejecuta sobre memoria unificada de Apple Silicon; no se proporciona una estimacion de VRAM dedicada. Como referencia, los pesos ocupan 1,35 GiB y hay que sumar el espacio de la cache KV, que crece con la longitud de contexto (hasta 32.768 tokens declarados).
- GPU recomendadas: no se especifican. El destino declarado son chips de Apple Silicon, incluidos Mac de gama base y telefono.
- GPU de consumo (NVIDIA/AMD): no disponible; este repositorio esta en formato MLX y no incluye pesos GGUF ni safetensors para PyTorch.
- Opciones de despliegue: mlx-lm (linea de comandos y API de Python) y LM Studio con su motor MLX. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en esta conversion.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato y tamano de pesos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OpenMed/LFM2-2.6B-Longevity-4bit-mlx (este) | 2,57 B | 32.768 tokens | MLX safetensors 4 bits, 1,35 GiB | lfm1.0 | Apple Silicon (mlx-lm, LM Studio) |
| OpenMed/LFM2-2.6B-Longevity-8bit-mlx | 2,57 B | 32.768 tokens | MLX safetensors 8 bits, 2,54 GiB | lfm1.0 | Apple Silicon (mlx-lm, LM Studio) |
| LiquidAI/LFM2-2.6B-Longevity | 2,57 B | 32.768 tokens | safetensors BF16, 4,79 GiB | lfm1.0 | PyTorch, multiplataforma |
| LiquidAI/LFM2-2.6B | no disponible | no disponible | no disponible | no disponible | no disponible |

Los tres primeros checkpoints comparten pesos de origen, tokenizador, plantilla de chat y parametros de generacion, por lo que la unica diferencia medible es la precision de los pesos y el consumo de memoria. No se dispone de datos de rendimiento comparativos entre las variantes de 4 y 8 bits, ni de modelos alternativos de la misma categoria (LLM compacto especializado en biologia del envejecimiento) en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles; no se declara ningun otro idioma, incluido el castellano.
- Esta entrenado sobre datos de biologia del envejecimiento y no ha sido validado para conocimiento general, codigo, matematicas o tareas fuera de ese dominio.
- Los resultados son predicciones de un modelo de investigacion y no constituyen consejo clinico; la propia model card lo advierte explicitamente.
- Riesgo de alucinacion relevante en un dominio biomedico: puede generar asociaciones plausibles entre biomarcadores y vias biologicas sin respaldo experimental.
- La cuantizacion a 4 bits introduce perdida de precision respecto al BF16 original; no se han publicado mediciones de esa degradacion. Las escalas de RMSNorm y los kernels de convolucion corta se mantienen en BF16, lo que limita pero no elimina el efecto.
- Licencia lfm1.0 (LFM Open License v1.0): gratuita para investigacion y para uso comercial por entidades, segun el texto truncado disponible. Conviene leer el archivo LICENSE completo antes de un uso comercial, ya que el texto proporcionado no especifica los terminos integros ni posibles umbrales de facturacion o restricciones adicionales.
- Al ser un derivado cuantizado por un tercero, los pesos no estan firmados por Liquid AI; el autor solo publica el SHA-256 de los pesos para verificacion.
- Traccion nula en el momento de la consulta (0 descargas, 0 likes, creado el 20 de septiembre de 2026), por lo que no existe validacion independiente de la comunidad sobre esta conversion concreta.
- No se documenta soporte para tool calling ni para flujos de agente, lo que limita su integracion en pipelines automatizados de produccion.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/OpenMed/LFM2-2.6B-Longevity-4bit-mlx
- Modelo base (BF16, PyTorch): https://huggingface.co/LiquidAI/LFM2-2.6B-Longevity
- Hermano en 8 bits: https://huggingface.co/OpenMed/LFM2-2.6B-Longevity-8bit-mlx
- Modelo preentrenado de partida: https://huggingface.co/LiquidAI/LFM2-2.6B
- Liquido AI: https://www.liquid.ai
- Insilico Medicine: https://insilico.com
- MLX (framework de Apple): https://github.com/ml-explore/mlx
- Licencia LFM Open License v1.0 (archivo del repositorio): LICENSE
- Estudio de referencia: *An Open Benchmark and Language Models for AI in Aging Biology* (Zhavoronkov et al., 2026); no se ha encontrado enlace directo en la informacion disponible.

Nota: los resultados de la busqueda web proporcionados no contienen ningun enlace relevante al modelo; tratan sobre combinacion de camisas y corbatas y no guardan relacion con esta ficha.

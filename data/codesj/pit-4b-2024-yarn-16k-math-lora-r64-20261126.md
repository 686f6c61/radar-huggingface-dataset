# codesj/PIT-4B-2024-YaRN-16K-Math-LoRA-R64-20261126

## Resumen

PIT-4B-2024-YaRN-16K-Math-LoRA-R64 es un adaptador LoRA de rango 64 publicado por el usuario codesj sobre el modelo base codesj/PIT-4B-2024-YaRN-16K, un transformer de 4.000 millones de parametros con extension de contexto a 16K tokens mediante YaRN. El adaptador se ha entrenado especificamente para mejorar el rendimiento en matematicas, un dominio en el que el modelo base presenta un rendimiento muy bajo segun los datos del propio autor.

El entrenamiento consistio en 2.050 actualizaciones sobre 100.000 respuestas matematicas de entrenamiento filtradas contra problemas de validacion (pre-cutoff), con 62 pasos de warmup y un decaimiento coseno de la tasa de aprendizaje desde 1e-4 hasta 1e-5. El resultado medido en un conjunto retenido de 256 items de GSM8K es un salto de 0,39% a 19,92% de exactitud numerica, lo que supone un incremento de aproximadamente 50 veces en aciertos absolutos (de 1 a 51 respuestas correctas).

El interes de esta publicacion es limitado pero concreto: demuestra que un adaptador LoRA de bajo coste (0,4 GB de pesos en FP32) puede rescatar parcialmente la capacidad matematica de un modelo base pequeno con contexto extendido. No obstante, el propio autor reconoce que la calidad en contexto largo, la exactitud en FinQA y el comportamiento de tool calling no se han medido, y la model card no proporciona informacion sobre licencia, idiomas ni pipeline.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer PIT-4B con atencion extendida por YaRN |
| Parametros totales | 4.000 millones en el modelo base; el adaptador LoRA es de rango 64 (numero exacto de parametros del adaptador no disponible) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 16.384 tokens (16K) en el modelo base |
| Tipos de cuantizacion | no disponible (el adaptador se publica en FP32; el base congelado en BF16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT); modelo base en safetensors |
| Rango LoRA | 64 |
| Modelo base | codesj/PIT-4B-2024-YaRN-16K (revision 5a77fe23d2d4a3955da3b5b437686f541bd35ada) |
| Tamano del repositorio | 0,4 GB |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un transformer decoder-only de 4.000 millones de parametros denominado PIT, cuya implementacion nativa ("stock PIT implementation") debe cargarse junto con el checkpoint base fijado en la revision 5a77fe23d2d4a3955da3b5b437686f541bd35ada. La extension de contexto a 16K se realiza mediante YaRN (Yet another RoPE extensioN), una tecnica de escalado de las frecuencias rotatorias posicionales que permite extrapolar la ventana de atencion sin reentrenar desde cero. El adaptador LoRA es de rango 64 y se entrena sobre el modelo base congelado en BF16, manteniendo los pesos del adaptador en FP32.

El entrenamiento cubre 2.050 actualizaciones sobre 100.000 respuestas matematicas pre-cutoff, con un esquema de 62 pasos de warmup y decaimiento coseno de la tasa de aprendizaje de 1e-4 a 1e-5. El conjunto de datos se filtro contra problemas de matematicas retenidos para evitar contaminacion, segun indica el autor. No se menciona el uso de RLHF, DPO ni ninguna etapa de alineacion adicional; el adaptador se limita a ajuste supervisado sobre respuestas matematicas. La evaluacion se realizo con la plantilla de chat incluida en el paquete, decodificacion greedy, un limite de generacion de 512 tokens y puntuacion exacta de la respuesta numerica.

## Capacidades

- Generacion de texto y razonamiento general heredados del modelo base PIT-4B.
- Resolucion de problemas matematicos de tipo GSM8K: el adaptador eleva la exactitud del 0,39% al 19,92% en el conjunto retenido de 256 items.
- Razonamiento aritmetico de varios pasos con respuesta numerica final, segun el formato de evaluacion empleado (puntuacion exacta).
- Contexto extendido de 16K tokens gracias a YaRN en el modelo base, aunque la calidad en contexto largo no se ha medido.
- Soporte de plantilla de chat propia incluida en el paquete.
- Tool calling / function calling: no medido, segun el autor.
- Capacidades de agente y razonamiento multi-paso: no medidas.
- Capacidades multilingues: no disponibles.
- Vision, audio u otras modalidades: no disponibles.

## Casos de uso

- Evaluacion de tecnicas LoRA en dominios especializados: el adaptador sirve como caso de estudio reproducible para medir cuanto puede recuperar un LoRA de rango 64 sobre un modelo base con rendimiento casi nulo en matematicas, usando el conjunto GSM8K retenido de 256 items como referencia.
- Prototipado de tutoria matematica basica: con un 19,92% de exactitud en GSM8K, el modelo puede emplearse en entornos controlados para generar explicaciones paso a paso de problemas aritmeticos, siempre con verificacion humana del resultado final.
- Generacion de datos sinteticos de matematicas: el adaptador puede producir borradores de soluciones numericas que luego se filtran con un verificador simbolico o un modelo mayor, aprovechando su contexto de 16K para incluir enunciados largos.
- Investigacion sobre contaminacion de datos: el paquete incluye provenance.json y COMPLETE.json, lo que permite auditar el filtrado del corpus de 100.000 respuestas frente a problemas retenidos y replicar el protocolo de evaluacion.
- Experimentos de ajuste con PEFT: al ser un adaptador pequeno (0,4 GB en FP32) sobre un base de 4B, es adecuado para probar pipelines de carga con PEFT, plantillas de chat y decodificacion greedy en entornos con recursos limitados.
- Docencia y formacion en ajuste fino: el modelo ilustra el flujo completo de fijar un base, entrenar un LoRA de rango 64 con decaimiento coseno y evaluar con puntuacion exacta, con artefactos de procedencia incluidos en el repositorio.

## Benchmarks y rendimiento

| Benchmark | Conjunto | Modelo base original | Con LoRA r64 |
|---|---|---:|---:|
| GSM8K (exactitud numerica) | 256 items retenidos | 1/256 (0,39%) | 51/256 (19,92%) |

Condiciones de evaluacion: plantilla de chat incluida, decodificacion greedy, limite de 512 tokens de generacion y puntuacion exacta de la respuesta numerica. El autor indica que la calidad en contexto largo, la exactitud en FinQA y el comportamiento de tool calling no se han medido. No se han publicado resultados de MMLU, HumanEval ni otros benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base tiene 4.000 millones de parametros; en BF16 requiere aproximadamente 8 GB solo para pesos, mas overhead de activaciones y KV cache para 16K de contexto. En cuantizacion de 8 bits, alrededor de 4-5 GB; en 4 bits, alrededor de 2,5-3 GB (estimaciones teoricas, no verificadas para este checkpoint).
- El adaptador LoRA en si ocupa 0,4 GB en FP32 y se suma a la memoria del base durante la carga.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para inferencia en BF16 con contexto completo; RTX 3090 (24 GB) y RTX 4080 (16 GB) son viables con cuantizacion.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas en cuantizacion de 4-8 bits, siempre que se respete la implementacion nativa PIT del base.
- Opciones de despliegue: PEFT para cargar el adaptador sobre el base; el autor exige la implementacion PIT nativa, por lo que no se garantiza compatibilidad directa con vLLM, llama.cpp, Ollama o TGI sin conversion previa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K | Licencia | Formato |
|---|---|---|---|---|---|
| PIT-4B-2024-YaRN-16K-Math-LoRA-R64 | 4B (base) + LoRA r64 | 16K | 19,92% (256 items) | no disponible | safetensors (PEFT) |
| PIT-4B-2024-YaRN-16K (base) | 4B | 16K | 0,39% (256 items) | no disponible | safetensors |
| Alternativas de 4B con matemáticas | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de modelos comparables en la informacion proporcionada, por lo que la comparativa se limita al contraste entre el adaptador y su modelo base.

## Limitaciones y advertencias

- Rendimiento matematico bajo en terminos absolutos: un 19,92% de exactitud en GSM8K implica que aproximadamente 4 de cada 5 problemas retenidos se resuelven de forma incorrecta.
- La evaluacion se limita a 256 items de GSM8K con puntuacion exacta; no hay datos de MMLU, HumanEval, FinQA ni de otros dominios.
- La calidad en contexto largo (hasta 16K tokens) no se ha medido, a pesar de que YaRN es una caracteristica central del modelo base.
- El comportamiento de tool calling y de agente multi-paso no se ha evaluado.
- Riesgo de alucinacion en razonamiento matematico: el modelo puede producir cadenas de pasos plausibles con un resultado final incorrecto, dado el bajo porcentaje de acierto.
- No se especifican sesgos conocidos ni composicion demografica del corpus de entrenamiento.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; debe consultarse con el autor antes de cualquier despliegue en produccion.
- Idiomas soportados no disponibles; la plantilla de chat y el corpus de entrenamiento parecen orientados a un unico idioma, sin confirmacion.
- Requiere la implementacion PIT nativa y una revision concreta del base (5a77fe23d2d4a3955da3b5b437686f541bd35ada); cargarlo con otra revision o con una implementacion estandar de transformers puede producir resultados distintos.
- Repositorio sin descargas ni likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validacion independiente de los resultados.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/codesj/PIT-4B-2024-YaRN-16K-Math-LoRA-R64-20261126
- Modelo base: https://huggingface.co/codesj/PIT-4B-2024-YaRN-16K
- Revision fijada del base: 5a77fe23d2d4a3955da3b5b437686f541bd35ada
- Artefactos citados en el repositorio: evaluation.json, provenance.json, COMPLETE.json (incluidos en el paquete del adaptador)
- Paper de YaRN: no disponible en la informacion proporcionada
- Blog o demo del autor: no disponible en la informacion proporcionada

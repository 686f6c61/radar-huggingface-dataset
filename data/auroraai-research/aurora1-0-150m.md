# AuroraAI-Research/Aurora1.0-150M

## Resumen

Aurora1.0-150M es un modelo de lenguaje autoregresivo de 149.268.352 parametros (aproximadamente 150M) desarrollado por AuroraAI-Research y publicado en HuggingFace bajo licencia Apache 2.0. Se trata de un transformer denso de 30 capas con atencion GQA, codificacion posicional RoPE, QK-Norm y activacion SwiGLU, entrenado desde cero sobre el corpus HuggingFaceTB/smollm-corpus con 7.000 millones de tokens en 11 horas sobre una unica GPU RTX Pro 6000. Su ventana de contexto es de 1024 tokens y su vocabulario de 32.768 tokens.

El modelo se posiciona en la categoria de los LLM ultracompactos (por debajo de 200M de parametros), un segmento dominado por GPT-2 Small, SmolLM-135M y Pythia-160M. Su interes principal no es la calidad conversacional, sino servir como plataforma de investigacion barata: cabe en cualquier GPU consumer e incluso en CPU, se puede reentrenar o hacer fine-tuning completo en horas y permite estudiar decisiones de diseno concretas (embeddings factorizados y atados de rango 384, ratio GQA 2:1, Muon combinado con AdamW) sin el coste de un modelo de escala media.

El autor reporta un indice entero de 15,09 en el OpenSLM-Leaderboard y afirma que iguala o supera ligeramente a GPT-2 Small en la mayoria de benchmarks. Con 0 descargas y 3 likes en el momento de la consulta, se trata de un lanzamiento muy reciente y practicamente sin validacion independiente por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (30 capas identicas) |
| Parametros totales | 149.268.352 (aproximadamente 150M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | No disponible (no se han publicado pesos cuantizados en el repositorio) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

Datos arquitectonicos adicionales: tamano oculto 640, tamano intermedio 1728, 10 cabezas de consulta y 5 cabezas clave/valor con dimension de cabeza 64, vocabulario de 32.768 tokens, embeddings factorizados y atados con rango 384, RoPE con theta = 10000.

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only convencional con varias modificaciones orientadas a eficiencia de parametros. Destaca el uso de embeddings factorizados y atados: en lugar de una matriz de embedding completa de 32.768 x 640, se emplea una factorizacion de rango 384, lo que reduce de forma notable el recuento de parametros dedicado al vocabulario. La atencion usa Grouped Query Attention con un ratio 2:1 (10 cabezas de consulta por cada 5 de clave/valor), lo que disminuye el coste de memoria de la cache KV durante la inferencia. Se anaden QK-Norm para estabilizar el entrenamiento y SwiGLU como activacion en el bloque feed-forward.

El entrenamiento se realizo sobre el dataset HuggingFaceTB/smollm-corpus, con 7.000 millones de tokens de preentrenamiento en aproximadamente 11 horas sobre una RTX Pro 6000. El autor indica el uso combinado de los optimizadores Muon y AdamW. No se menciona en la informacion disponible ninguna fase de ajuste por instrucciones, RLHF, DPO u otra forma de alineacion, por lo que cabe esperar un modelo base (base model) sin post-entrenamiento conversacional.

## Capacidades

- Generacion de texto en ingles: completado de frases y continuacion de parrafos cortos, con el estilo de un modelo base sin instrucciones.
- Razonamiento de sentido comun basico: resultados por encima del azar en PIQA (0,6273 de acc) y HellaSwag (0,2922 de acc), aunque lejos de modelos mayores.
- Conocimiento factual limitado: puede recuperar asociaciones frecuentes ("The capital of Denmark is Copenhagen"), con precision variable en los detalles.
- Aritmetica elemental muy limitada: 0,3390 de exactitud en arithmark_3.0, propio de un modelo de este tamano sin entrenamiento especifico en matematicas.
- Capacidades multilingues: no disponibles; el modelo se declara exclusivamente en ingles.
- Tool calling / function calling: no disponible; no se documenta plantilla de chat ni formato de llamada a herramientas.
- Soporte de agentes y razonamiento multi-paso: no disponible; no hay post-entrenamiento orientado a agentes.
- Capacidad especial: ninguna documentada (sin modo de razonamiento explicito, sin vision, sin audio, sin decodificacion especulativa).
- Fine-tuning como modelo base: al ser un modelo pequeno y con licencia Apache 2.0, es ajustable por completo en una sola GPU.

## Casos de uso

- Investigacion academica y ablaciones: su tamano permite entrenar desde cero o hacer fine-tuning completo en una GPU consumer en horas, lo que lo hace util para comparar optimizadores (Muon frente a AdamW), esquemas de embeddings factorizados o variantes de atencion GQA sin grandes presupuestos de computo.
- Autocompletado de texto en ingles integrado en editores: con 1024 tokens de contexto y una latencia muy baja, puede sugerir continuaciones de frases en herramientas de escritura, aceptando la limitacion de que no mantiene coherencia mas alla de un parrafo.
- Generacion de datos sinteticos a gran escala: al ser barato de ejecutar, se puede desplegar en paralelo para producir texto de relleno, ejemplos de aumentacion de datos o corpus de preentrenamiento para destilacion.
- Punto de partida para fine-tuning de clasificacion: anadir una cabeza de clasificacion sobre el estado final permite tareas de analisis de sentimiento o clasificacion de temas con costes de entrenamiento minimos sobre textos en ingles.
- Despliegue en el borde y en dispositivos con recursos muy limitados: con pesos en int4 del orden de decenas de megabytes, es viable en Raspberry Pi, telefonos o navegador, para tareas de completado o filtrado de texto sin conexion.
- Banco de pruebas para pipelines de cuantizacion: sirve para validar flujos de conversion a GGUF, GPTQ o AWQ y medir la degradacion de calidad en un modelo cuyo comportamiento en fp32 se puede reproducir rapidamente.
- Educacion y divulgacion: por su tamano y su model card con detalles completos de arquitectura, es un candidato practico para explicar en clase como funciona un transformer moderno (RoPE, GQA, SwiGLU, QK-Norm) ejecutandolo en un portatil.
- Evaluacion comparativa de tokenizadores y vocabularios: su vocabulario de 32.768 tokens y sus embeddings factorizados permiten estudiar el impacto del vocabulario en la calidad y en el recuento de parametros.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card:

| Benchmark | acc | acc_norm |
|---|---|---|
| PIQA | 0,6273 | 0,6224 |
| HellaSwag | 0,2922 | 0,3220 |
| ARC-Easy | 0,4987 | 0,4491 |
| ARC-Challenge | 0,2099 | 0,2500 |
| arithmark_3.0 | 0,3390 | 0,3390 |

Indice entero basado en OpenSLM-Leaderboard: 15,09.

El autor afirma que el modelo iguala o supera ligeramente a GPT-2 Small en la mayoria de benchmarks, pero no se aportan en la informacion disponible las cifras concretas de GPT-2 Small ni de otros modelos de referencia para verificar esa comparacion. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otras evaluaciones generativas en la informacion disponible, ni tampoco evaluaciones independientes.

## Requisitos de hardware

- VRAM para inferencia en fp32: aproximadamente 0,6 GB solo de pesos (149M parametros x 4 bytes), mas activaciones y cache KV.
- VRAM para inferencia en bf16/fp16: aproximadamente 0,3 GB de pesos.
- VRAM para int8: aproximadamente 0,15 GB; para int4: aproximadamente 0,08-0,1 GB.
- GPU recomendadas: cualquier GPU con 1 GB o mas de memoria es suficiente, incluidas GTX 1050 Ti, RTX 3060, RTX 4090, A100 o H100; el modelo esta muy por debajo de la capacidad de todas ellas. El autor reporta el entrenamiento completo en una RTX Pro 6000.
- Cabe en GPU consumer: si, en practicamente cualquier GPU discreta o integrada moderna, y tambien en CPU. La cache KV para 1024 tokens con 5 cabezas KV de dimension 64 y 30 capas ocupa del orden de 20 MB en fp16, por lo que la memoria no es un cuello de botella.
- Opciones de despliegue: el repositorio incluye un script `Inference.py` para uso directo con transformers. No se documentan artefactos para vLLM, llama.cpp, Ollama, TGI ni ningun otro servidor, y no se han publicado pesos GGUF; su uso con esas herramientas requeriria conversion previa por parte del usuario.
- Latencia y throughput: no disponibles. El unico dato de rendimiento aportado es el de entrenamiento (7.000 millones de tokens en 11 horas en una RTX Pro 6000).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Post-entrenamiento | Benchmarks en la informacion disponible |
|---|---|---|---|---|---|---|
| Aurora1.0-150M | 149M | 1024 | Ingles | Apache 2.0 | No documentado | PIQA 0,6273; HellaSwag 0,2922; ARC-Easy 0,4987; ARC-Challenge 0,2099 |
| GPT-2 Small | 124M | 1024 | Ingles | MIT modificada | No (modelo base) | No disponible en esta informacion |
| SmolLM-135M | 135M | 2048 | Ingles y otros | Apache 2.0 | Si (SFT y DPO) | No disponible en esta informacion |
| Pythia-160M | 160M | 2048 | Ingles | Apache 2.0 | No (modelo base) | No disponible en esta informacion |

La comparacion cuantitativa de rendimiento entre Aurora1.0-150M y estas alternativas no puede establecerse con los datos proporcionados: solo se dispone de los benchmarks del modelo de AuroraAI-Research y de la afirmacion cualitativa del autor de que iguala o supera ligeramente a GPT-2 Small. Las cifras de parametros, contexto y licencia de los competidores se incluyen como referencia de categoria.

## Limitaciones y advertencias

- Modelo base sin alineacion: no hay evidencia de ajuste por instrucciones, RLHF o DPO, por lo que no respondera de forma fiable a instrucciones y puede generar continuaciones incoherentes o repetitivas.
- Riesgo alto de alucinacion factual: el propio ejemplo de la model card genera "The capital of Denmark is Copenhagen, which has a population of about 1.5 million people", una cifra que no se corresponde con la poblacion real de la ciudad. Es un indicativo del nivel de imprecision factual esperable.
- Contexto muy corto: 1024 tokens limitan los casos de uso conversacionales de multiples turnos y el procesamiento de documentos; no hay evidencia de extrapolacion mas alla de esa ventana.
- Solo ingles: no hay soporte documentado de castellano ni de otros idiomas, mas alla de la transferencia residual que pueda existir por el corpus de entrenamiento.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion sin restricciones relevantes, siempre que se conserve el aviso de licencia y se indique los cambios; no incluye clausulas de uso aceptable especificas.
- Validacion practicamente nula: 0 descargas y 3 likes en el momento de la consulta, sin evaluaciones independientes ni reproduccion de los benchmarks por terceros. Los numeros publicados proceden unicamente del autor.
- Model card con errores menores: la propia model card contiene erratas ("Context Lenght"), lo que sugiere una revision limitada del material publicado y aconseja verificar cualquier detalle antes de llevarlo a produccion.
- Sin garantias de robustez en produccion: no se documentan pruebas de seguridad, filtrado de contenido, sesgos medidos ni comportamiento frente a entradas adversarias. Para tareas sensibles se recomienda evaluacion previa y capas adicionales de moderacion.
- Resultados por encima del azar pero bajos en terminos absolutos: un 0,2922 de acc en HellaSwag y un 0,2099 en ARC-Challenge estan lejos de lo que se exige a un sistema que deba razonar o responder preguntas con fiabilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AuroraAI-Research/Aurora1.0-150M
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus
- OpenSLM-Leaderboard (referencia del indice entero 15,09 citada por el autor): no se proporciona URL en la informacion disponible.
- Paper, blog tecnico o repositorio de codigo: no disponible.
- Demo o space: no disponible.
- La busqueda web realizada no devolvio ningun resultado relevante sobre el modelo; los enlaces obtenidos correspondian a servicios de sustitucion de depositos de combustible en el suroeste del Reino Unido y no guardan relacion con Aurora1.0-150M.

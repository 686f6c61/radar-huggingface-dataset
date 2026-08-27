# m1rkocasu/Apertus-v1.5-8B-text-MLX-8bit

## Resumen

Apertus v1.5 8B es un modelo de lenguaje de 8.050 millones de parametros desarrollado por la Swiss AI Initiative, una colaboracion entre la EPFL, la ETH Zurich y el Centro Nacional de Supercomputacion de Suiza (CSCS). Se trata de un modelo completamente abierto: pesos, datos de entrenamiento y detalles tecnicos son publicos. Apertus 1.5 es una continuacion del entrenamiento de Apertus 1.0, al que se anadieron 4 billones de tokens de datos textuales y multimodales para la variante de 8B.

Este repositorio concreto contiene la rama de texto del modelo convertida al formato MLX y cuantizada a 8 bits, pensada para ejecutarse en silicio de Apple mediante la libreria mlx-lm. La cuantizacion reduce el peso en disco a 8,54 GB y permite ejecutar el modelo en equipos con memoria unificada moderada, manteniendo una perplejidad de 10,41 en wikitext-2, muy proxima a la del modelo sin cuantizar. El modelo soporta una ventana de contexto de 262.144 tokens y un vocabulario de 131.072 tokens de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ApertusForCausalLM, 32 capas, hidden size 4096, 32 cabezas de atencion, 8 cabezas key-value |
| Parametros totales | 8.053.338.240 (8,05B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | 8 bits, 8,500 bits por peso, grupo de 64 |
| Idiomas soportados | multilingue (lista completa no disponible) |
| Licencia | Apache 2.0 con politica de uso aceptable de Apertus 1.5 |
| Formato de pesos | MLX safetensors |

Nota: el contador de parametros que muestra la interfaz de HuggingFace (2,26B) refleja los tensores almacenados, no los parametros reales del modelo. MLX empaqueta pesos cuantizados en contenedores de 32 bits, ocho pesos por contenedor a 4 bits y cuatro a 8 bits, por lo que el recuento de elementos almacenados es inferior al numero real de parametros.

## Arquitectura y entrenamiento

Apertus v1.5 8B es un transformer denso con 32 capas, dimension oculta de 4096, 32 cabezas de atencion y 8 cabezas key-value, lo que indica el uso de atencion con clave-valor agrupada (GQA) para reducir el coste de memoria en inferencia. La funcion de activacion es xIELU, una variante de ELU con parametros aprendibles. El vocabulario de texto alcanza los 131.072 tokens, un tamano considerable que favorece la cobertura multilingue.

El entrenamiento es una continuacion del de Apertus 1.0: se anadieron 4 billones de tokens de datos textuales y multimodales al modelo de 8B. Todo el proceso es abierto: los datos, el codigo de entrenamiento y los artefactos de evaluacion estan publicados en el repositorio de Swiss AI en GitHub. La rama de texto de este repositorio elimina los componentes de vision, quedando como un modelo exclusivamente textual.

La cuantizacion a 8 bits con grupo de 64 se realizo con mlx-lm 0.31.3 y mlx 0.32.0 en macOS 26.5. El autor no publica una medicion de perplejidad en bfloat16 porque los 15 GB de pesos del modelo sin cuantizar no caben en la memoria de 24 GB de la maquina utilizada, por lo que la referencia de calidad es esta version de 8 bits.

## Capacidades

- Generacion de texto y conversacion multirronda con plantilla de chat estandar.
- Razonamiento sobre documentos largos gracias a la ventana de contexto de 262.144 tokens.
- Soporte multilingue amplio, coherente con el vocabulario de 131.072 tokens y el entrenamiento sobre datos abiertos multilingues.
- Ejecucion en silicio de Apple mediante mlx-lm, con servidor compatible con API OpenAI incluido.
- Modelo exclusivamente textual: esta rama no procesa imagenes, aunque el modelo base Apertus 1.5 8B si es multimodal.
- Capacidad de tool calling y function calling: no documentada explicitamente en la informacion disponible.

## Casos de uso

- Analisis de documentos extensos: con 262.144 tokens de contexto, el modelo puede procesar informes, expedientes o codigo fuente completo en una sola pasada, sin necesidad de dividir el texto ni de estrategias de recuperacion.
- Asistente de atencion al cliente multilingue: el modelo puede mantener conversaciones multi-turno en varios idiomas, lo que permite desplegar un unico sistema para mercados linguisticos distintos sin modelos separados.
- Generacion de codigo asistida en equipos de desarrollo: su capacidad de razonamiento y su contexto largo permiten sugerir implementaciones completas, revisar fragmentos extensos y explicar codigo heredado.
- Resumen y extraccion de informacion de corpus cientificos o juridicos: la ventana de contexto amplia y el entrenamiento sobre datos abiertos lo hacen adecuado para sintetizar articulos, sentencias o patentes.
- Prototipado de aplicaciones conversacionales en macOS: al ejecutarse localmente con mlx-lm, permite desarrollar y probar asistentes sin conexion ni coste de API, con privacidad de datos.
- Despliegue de un endpoint local compatible con OpenAI: el comando `mlx_lm.server` expone el modelo detras de una API estandar, integrable en herramientas existentes como LangChain o frameworks de agentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El unico dato de calidad publicado es la perplejidad sobre el conjunto de test de `Salesforce/wikitext`, configuracion `wikitext-2-raw-v1`, medida sobre 200 ventanas no solapadas de 512 tokens (102.400 tokens puntuados):

| Variante | Bits por peso | Tamano | Perplejidad | Diferencia vs. 8 bits |
|---|---|---|---|---|
| 8-bit (este repositorio) | 8,500 | 8,54 GB | 10,41 | referencia |
| 6-bit | 6,500 | 6,54 GB | 10,46 | +0,5 % |
| 5-bit | 5,500 | 5,54 GB | 10,53 | +1,1 % |
| 4-bit DWQ | 4,500 | 4,53 GB | 10,97 | +5,4 % |
| MXFP4 | 4,250 | 4,28 GB | 11,71 | +12,5 % |

El autor advierte que la perplejidad solo compara cuantizaciones del mismo modelo sobre un corpus concreto, y no dice nada sobre la capacidad del modelo para seguir instrucciones ni sobre su rendimiento frente a otros modelos.

## Requisitos de hardware

- Formato MLX: requiere Apple silicon (M1 o posterior) con macOS.
- Peso en disco: 8,54 GB; memoria unificada recomendada de 16 GB o superior para una ejecucion comoda con ventana de contexto amplia.
- El modelo sin cuantizar en bfloat16 ocupa unos 15 GB y no cabe en equipos de 24 GB sin paginacion a disco, segun el autor.
- Inferencia mediante `mlx-lm` desde linea de comandos, desde Python o a traves del servidor compatible con OpenAI (`mlx_lm.server`).
- No es compatible con vLLM, llama.cpp u Ollama en su formato actual, al estar limitado al ecosistema MLX.
- Latencia y throughput: no disponibles en la informacion publicada.

## Comparativa con modelos similares

La comparacion mas directa es con las otras cuantizaciones del mismo modelo publicadas por el mismo autor, ya que no se dispone de datos de benchmarks frente a otros modelos de 8B:

| Modelo | Parametros | Contexto | Formato | Perplejidad wikitext-2 | Licencia |
|---|---|---|---|---|---|
| Apertus v1.5 8B (base) | 8,05B | 262.144 | bfloat16 (HF) | no disponible | Apache 2.0 + AUP |
| Apertus v1.5 8B MLX 8-bit (este) | 8,05B | 262.144 | MLX 8-bit | 10,41 | Apache 2.0 + AUP |
| Apertus v1.5 8B MLX 6-bit | 8,05B | 262.144 | MLX 6-bit | 10,46 | Apache 2.0 + AUP |
| Apertus v1.5 8B MLX 4-bit DWQ | 8,05B | 262.144 | MLX 4-bit | 10,97 | Apache 2.0 + AUP |

No se dispone de datos comparables de otros modelos de 8B (como Llama 3.1 8B o Mistral 7B) en las mismas condiciones de medicion, por lo que no se incluye una comparativa externa.

## Limitaciones y advertencias

- Esta rama es exclusivamente textual: no procesa imagenes, aunque el modelo base Apertus 1.5 8B si es multimodal.
- La licencia Apache 2.0 se complementa con una politica de uso aceptable de Apertus 1.5 que puede imponer restricciones adicionales; conviene revisarla antes de un despliegue comercial.
- La perplejidad publicada se midio solo sobre wikitext-2; no hay datos de calidad en tareas de instruccion, razonamiento o codigo.
- El formato MLX limita la ejecucion a Apple silicon; no es portable a GPUs NVIDIA o AMD sin reconversion.
- El autor no publica mediciones de latencia ni throughput, por lo que el rendimiento en produccion es desconocido.
- El modelo base fue entrenado sobre datos abiertos, lo que puede implicar sesgos presentes en esos datos; no se documentan evaluaciones de sesgo especificas.
- Riesgo de alucinacion inherente a los modelos de lenguaje de este tamano, especialmente en tareas de hechos especificos o citas.

## Enlaces

- Repositorio HuggingFace de esta cuantizacion: https://huggingface.co/m1rkocasu/Apertus-v1.5-8B-text-MLX-8bit
- Modelo base: https://huggingface.co/swiss-ai/Apertus-v1.5-8B
- Variante 6-bit: https://huggingface.co/m1rkocasu/Apertus-v1.5-8B-text-MLX-6bit
- Variante 5-bit: https://huggingface.co/m1rkocasu/Apertus-v1.5-8B-text-MLX-5bit
- Variante 4-bit DWQ: https://huggingface.co/m1rkocasu/Apertus-v1.5-8B-text-MLX-4bit-DWQ
- Variante MXFP4: https://huggingface.co/m1rkocasu/Apertus-v1.5-8B-text-MLX-mxfp4
- Libreria mlx-lm: https://github.com/ml-explore/mlx-lm
- Sitio de Apertus AI: https://apertus-ai.org/
- Documentacion de Apertus AI: https://apertus-ai.org/pages/documentation/
- Articulo de anuncio de Apertus 1.5: https://apertus-ai.org/articles/2026-07-apertus-1-5/

# guicybercode/NBR-1B-Portuguese-MCQ-GGUF

## Resumen

NBR-1B-Portuguese-MCQ-GGUF es un repositorio de conversión de formatos: contiene tres cuantizaciones GGUF del modelo `limajr/NBR-1B-Portuguese-MCQ`, un modelo de lenguaje en portugués de 1.279.887.360 parámetros (aproximadamente 1,28 B) publicado por el usuario limajr. El repositorio no aporta pesos nuevos ni entrenamiento adicional: el autor, guicybercode, se limita a convertir los pesos originales a GGUF mediante `convert_hf_to_gguf.py` y a generar variantes Q4_K_M, Q8_0 y F16 con `llama-quantize` de llama.cpp. Todo el mérito del modelo corresponde a los autores originales, y la licencia Apache-2.0 se mantiene.

Su relevancia es práctica: permite ejecutar un modelo de 1,28 B en portugués en CPU o en GPUs de consumo gracias a un fichero Q4_K_M de solo 835 MB, sin necesidad de infraestructura de inferencia más pesada. El nombre del modelo sugiere un ajuste orientado a preguntas de opción múltiple (MCQ) en portugués, aunque la model card no documenta el proceso de entrenamiento, los datos utilizados ni la ventana de contexto.

Conviene tratarlo con cautela: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, no se han publicado benchmarks sobre los ficheros cuantizados y la propia prueba de humo del autor (una completion sin plantilla de chat) produce errores factuales evidentes, como afirmar que la capital de Brasil es São Paulo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no especificada en la model card; el modelo base es de tipo text-generation con 1,28 B de parametros) |
| Parametros totales | 1.279.887.360 (~1,28 B) |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (835 MB), Q8_0 (1,36 GB), F16 (2,56 GB) |
| Idiomas soportados | portugues (pt) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (el modelo base se distribuye en safetensors) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base: la model card del repositorio cuantizado solo declara `pipeline_tag: text-generation`, el idioma `pt` y el tamano de 1,28 B de parametros. No se especifica si se trata de un transformer decoder-only denso, ni la familia de la que deriva, ni la longitud de contexto nativa, ni la composicion del vocabulario o del tokenizador. Tampoco se documentan las dimensiones de las capas, el numero de cabezas de atencion ni el uso de tecnicas como GQA, RoPE o decodificacion especulativa.

Respecto al entrenamiento, no hay informacion sobre el numero de tokens, la composicion del corpus, la posible fase de instruccion (SFT), ni si se aplicaron tecnicas de alineacion como RLHF o DPO. El sufijo "MCQ" del nombre apunta a un ajuste para responder preguntas de opcion multiple en portugues, pero se trata de una inferencia a partir de la denominacion y no de un dato documentado. La unica innovacion tecnica verificable en este repositorio es la propia conversion a GGUF y la generacion de las tres cuantizaciones con llama.cpp (compilado en Linux x86_64 sobre CPU), lo que habilita inferencia en CPU y en GPUs de gama baja.

## Capacidades

- Generacion de texto en portugues: es la unica capacidad declarada explicitamente por el autor (`language: pt`, `pipeline_tag: text-generation`).
- Respuesta a preguntas de opcion multiple: presumiblemente el objetivo del ajuste segun el nombre del modelo, aunque no hay evaluacion publicada que lo confirme.
- Inferencia local ligera: los ficheros GGUF funcionan con llama.cpp y con los runners compatibles (Ollama, llama-cpp-python, LM Studio).
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que el repositorio puede servirse mediante la infraestructura de HuggingFace.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; sin datos que lo respalden.
- Capacidades multilingues: no disponibles; el modelo esta etiquetado solo para portugues.
- Vision, audio o modo "thinking": no disponibles.

## Casos de uso

- Clasificacion y respuesta de preguntas tipo test en portugues: el modelo puede puntuar o generar respuestas a items de opcion multiple en entornos educativos o de evaluacion, que es el uso que sugiere su denominacion. Requiere validacion previa contra un conjunto de referencia, dado que no hay benchmarks publicados.
- Prototipado rapido en local: con 835 MB en Q4_K_M se puede levantar un servicio de generacion de texto en un portatil sin GPU para probar plantillas de prompt, tokenizadores y flujos de integracion antes de invertir en un modelo mayor.
- Generacion de texto en portugues en entornos con recursos muy limitados: despliegue en dispositivos edge, contenedores pequeños o funciones serverless con poca RAM, donde un modelo de 1,28 B en Q4_K_M es viable y uno de 7 B no lo seria.
- Filtrado y preprocesado de corpus en portugues: uso como modelo auxiliar para tareas de etiquetado, deduplicacion semantica o generacion de datos sinteticos a pequeña escala, aceptando la perdida de calidad frente a modelos mayores.
- Base para experimentos de cuantizacion y evaluacion: util como caso de estudio para medir la degradacion entre F16, Q8_0 y Q4_K_M en una lengua concreta, ya que el repositorio incluye las tres variantes del mismo modelo.
- Educacion e investigacion sobre modelos pequeños: analisis de capacidades emergentes, sesgos y alucinacion en modelos de ~1 B entrenados en una unica lengua romance, con la ventaja de que la inferencia es reproducible en hardware asequible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no se ejecuto ninguna evaluacion sobre los ficheros cuantizados y remite a la model card del modelo original para las mediciones de los autores. La unica prueba incluida es una "smoke test" de completion cruda (prompt `A capital do Brasil é`, 48 tokens, temperatura 0, sin plantilla de chat), cuyo objetivo declarado es unicamente comprobar que los ficheros cargan y producen texto en portugues; el propio autor advierte de que no constituye una evaluacion.

| Prueba | Fichero | Resultado observado | Valoracion |
|---|---|---|---|
| Completion cruda, 48 tokens, temp. 0 | Q4_K_M | "A capital do Brasil é a cidade de São Paulo..." y continuacion divagatoria sobre economia y poblacion | Error factual: la capital es Brasilia; salida incoherente |
| Completion cruda, 48 tokens, temp. 0 | Q8_0 | "A capital do Brasil é a cidade de São Paulo" seguido de repeticiones sobre nombres de presidentes y fin de texto | Error factual y degeneracion con repeticion |

Comparacion con modelos similares: no disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (calculo a partir del tamano de fichero mas overhead de contexto, no publicado por el autor):
  - Q4_K_M: en torno a 1,0-1,3 GB.
  - Q8_0: en torno a 1,6-1,9 GB.
  - F16: en torno a 2,8-3,2 GB.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM puede ejecutar la variante F16; una GTX 1650, RTX 3050, RTX 4060 o superior es suficiente para las tres cuantizaciones. Para servir varias peticiones concurrentes con contexto largo son preferibles tarjetas con 8-16 GB (RTX 4070/4080, L4, A10). No se requiere A100 ni H100.
- Cabe en GPU consumer: si, en todas las cuantizaciones, incluso en iGPU con memoria unificada para Q4_K_M.
- Cabe en CPU: si; el autor construyo y probo los ficheros en Linux x86_64 sobre CPU, y la variante Q4_K_M de 835 MB se ejecuta comodamente en cualquier portatil actual.
- Opciones de despliegue: llama.cpp (`llama-completion`, `llama-server`), Ollama, llama-cpp-python, LM Studio, y cualquier runtime compatible con GGUF. Para vLLM o TGI no hay confirmacion de soporte en la informacion disponible.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de datos verificados de benchmarks ni de especificaciones de modelos comparables en la informacion proporcionada, por lo que la comparacion con alternativas de la misma categoria no esta disponible. Como referencia interna, la unica comparacion posible es entre las tres cuantizaciones del mismo repositorio y el modelo base del que derivan:

| Modelo / variante | Parametros | Contexto | Formato | Tamano | Licencia | Estado |
|---|---|---|---|---|---|---|
| NBR-1B-Portuguese-MCQ (base, limajr) | 1,28 B | no disponible | safetensors | no disponible | Apache-2.0 | Publicado; sin evaluacion verificada en esta ficha |
| NBR-1B-Portuguese-MCQ-GGUF F16 | 1,28 B | no disponible | GGUF | 2,56 GB | Apache-2.0 | Conversion; sin benchmarks |
| NBR-1B-Portuguese-MCQ-GGUF Q8_0 | 1,28 B | no disponible | GGUF | 1,36 GB | Apache-2.0 | Conversion; sin benchmarks |
| NBR-1B-Portuguese-MCQ-GGUF Q4_K_M | 1,28 B | no disponible | GGUF | 835 MB | Apache-2.0 | Conversion; sin benchmarks |
| Alternativas de ~1 B en portugues | no disponible | no disponible | no disponible | no disponible | no disponible | No identificadas en la informacion disponible |

## Limitaciones y advertencias

- Calidad factual muy limitada: la propia prueba de humo del autor produce un error factual flagrante (situa la capital de Brasil en Sao Paulo) tanto en Q4_K_M como en Q8_0, lo que desaconseja su uso en tareas que requieran precision factual sin verificacion externa.
- Degeneracion de la salida: la muestra de Q8_0 encadena repeticiones y termina en un token de fin de texto en 48 tokens, indicativo de incoherencia y bucles en generacion libre.
- Ausencia total de evaluacion: no hay benchmarks del modelo base ni de las cuantizaciones en la informacion disponible; no se puede afirmar nada sobre su rendimiento relativo frente a alternativas.
- Adopcion nula y validacion comunitaria inexistente: 0 descargas y 0 likes en el momento de la consulta; el repositorio no ha sido contrastado por terceros.
- Monolingue: etiquetado solo para portugues; no hay evidencia de capacidades en castellano, ingles u otras lenguas. Riesgo de respuestas degradadas fuera del portugues.
- Ventana de contexto desconocida: al no documentarse la longitud de contexto, no se puede disenar un caso de uso con prompts largos ni garantizar el comportamiento mas alla de unas pocas lineas.
- Trazabilidad del entrenamiento inexistente: se desconoce el corpus, el proceso de ajuste y si hubo alineacion; no es posible evaluar sesgos de forma sistematica. Cabe esperar sesgos inhererentes al corpus portugues utilizado, pero no estan documentados.
- Riesgo de alucinacion: alto, coherente con un modelo denso de ~1 B sin evaluacion publicada; cualquier salida debe validarse en produccion.
- Restricciones de licencia: Apache-2.0 permite uso comercial, modificacion y redistribucion con atribucion y conservacion del aviso de licencia; el repositorio no anade restricciones, pero conviene verificar la licencia del modelo base por si hubiera cambiado.
- Naturaleza del repositorio: es solo una conversion de formato; los problemas del modelo original se heredan integramente y no deben atribuirse al cuantizador.
- No recomendado como modelo de produccion para atencion al cliente, generacion de codigo o tareas agenticas sin una evaluacion propia previa y, previsiblemente, sin un modelo de mayor tamano como alternativa.

## Enlaces

- Repositorio HuggingFace (cuantizaciones GGUF): https://huggingface.co/guicybercode/NBR-1B-Portuguese-MCQ-GGUF
- Modelo base: https://huggingface.co/limajr/NBR-1B-Portuguese-MCQ
- llama.cpp (herramientas de conversion y cuantizacion): https://github.com/ggml-org/llama.cpp
- Paper, blog, demo o repositorio adicional del autor: no disponible
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los enlaces encontrados no guardan relacion con el y se han descartado.

# mradermacher/JAX-XORTRON-i1-GGUF

## Resumen

JAX-XORTRON-i1 es un modelo de lenguaje de 27.320 millones de parámetros distribuido en formato GGUF por el usuario mradermacher, conocido por publicar cuantizaciones de modelos open source. Se trata de una versión cuantizada del modelo original JAX-XORTRON de darkc0de, cuyo nombre sugiere una relación con el ecosistema JAX de Google para computación numérica y machine learning. Este modelo se publica exclusivamente en formato GGUF, lo que lo hace directamente ejecutable en entornos de inferencia local como llama.cpp, Ollama o LM Studio.

La relevancia de este lanzamiento radica en que ofrece una serie de cuantizaciones que van desde IQ1_S (máxima compresión) hasta Q6_K (alta fidelidad), todas ellas generadas con el método imatrix para optimizar la calidad de la cuantización. El modelo está etiquetado como "conversational" y "endpoints_compatible", lo que indica que está pensado para su uso en aplicaciones de chat y para ser servido a través de APIs compatibles con el ecosistema de Hugging Face. Sin embargo, la ausencia de model card detallada, benchmarks o especificaciones técnicas del modelo original limita considerablemente la información verificable disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 27.320.697.856 (27,3 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el modelo original Xortron usa licencia wtfpl segun la busqueda web) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de informacion publica sobre la arquitectura interna del modelo. El nombre "JAX-XORTRON" sugiere que el entrenamiento pudo realizarse con el framework JAX, pero no hay confirmacion ni documentacion que detalle la topologia de la red, el numero de capas, la dimension del modelo o el tipo de atencion utilizada. Tampoco se han publicado datos sobre el dataset de entrenamiento, el numero de tokens procesados o si se aplicaron tecnicas de RLHF o DPO.

La unica informacion indirecta proviene de la busqueda web, que menciona que el modelo Xortron esta etiquetado como "heretic uncensored decensored abliterated", lo que sugiere que se trata de un modelo sin censura y con tecnicas de ablacion de negativas aplicadas. El metodo de cuantizacion imatrix utilizado por mradermacher es una tecnica conocida que mejora la calidad de la cuantizacion GGUF al usar matrices de importancia calculadas sobre un dataset de calibracion.

## Capacidades

- Generacion de texto conversacional: el modelo esta etiquetado como "conversational", lo que indica que esta optimizado para mantener dialogos multi-turno.
- Sin censura aparente: segun la informacion de la busqueda web, el modelo Xortron esta clasificado como "uncensored" y "decensored", lo que implica que no aplica los filtros de seguridad habituales de otros modelos.
- Cuantizacion flexible: la amplia gama de cuantizaciones disponibles permite adaptar el modelo a diferentes capacidades de hardware.
- Compatibilidad con endpoints: el tag "endpoints_compatible" sugiere que puede servirse mediante APIs compatibles con el ecosistema de Hug Face.
- No se dispone de informacion sobre capacidades de tool calling, agentes, vision, audio o razonamiento multi-step.

## Casos de uso

- Chat local sin conexion: gracias a las cuantizaciones Q4_K_M o Q5_K_M, el modelo puede ejecutarse en equipos de escritorio con 16-24 GB de VRAM, permitiendo conversaciones privadas sin depender de servicios cloud.
- Desarrollo de aplicaciones de chatbot: al ser "endpoints_compatible", puede integrarse en aplicaciones web o moviles mediante servidores de inferencia compatibles con el formato GGUF.
- Experimentacion con cuantizaciones extremas: las variantes IQ1_S e IQ2_XS permiten probar el modelo en hardware muy limitado, aunque con una degradacion significativa de la calidad.
- Generacion de texto creativo sin restricciones: dado su caracter "uncensored", puede utilizarse para explorar temas que otros modelos bloquean, siempre respetando la legalidad vigente.
- Evaluacion de tecnicas de cuantizacion: la coleccion completa de quants permite comparar el impacto de diferentes metodos (K-quants vs I-quants) en la calidad de salida para un mismo modelo base.
- Despliegue en entornos de investigacion: el formato GGUF facilita su uso en investigacion academica sobre compresion de modelos y eficiencia de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar para este modelo. La ausencia de model card del modelo original y la falta de informacion en la pagina de HuggingFace impiden cualquier comparacion cuantitativa con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 27,3 B de parametros, las cuantizaciones requieren aproximadamente:
  - Q2_K (2,6 bits): ~9-10 GB de VRAM
  - Q4_K_M (4,8 bits): ~15-16 GB de VRAM
  - Q5_K_M (5,7 bits): ~18-19 GB de VRAM
  - Q6_K (6,6 bits): ~21-22 GB de VRAM
  - IQ1_S (1,8 bits): ~7-8 GB de VRAM
- GPU recomendadas: para las cuantizaciones mas bajas (IQ1_S, IQ2_XS) basta una RTX 3060 de 12 GB; para Q4_K_M se recomienda RTX 4080/4090 o A100 de 16 GB; para Q6_K se necesita una GPU de 24 GB como RTX 4090 o A100 de 40 GB.
- En consumer GPU: si, las cuantizaciones IQ1_S, IQ2_XXS, IQ2_XS e IQ2_S caben en GPUs de 8-12 GB como RTX 3060 o RTX 4060 Ti.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, vLLM (con soporte GGUF experimental), llama-cpp-python para integracion en Python.
- Latencia y throughput: no se han publicado mediciones oficiales. Como referencia orientativa, un modelo de 27 B en Q4_K_M en una RTX 4090 suele generar entre 20 y 40 tokens por segundo.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa fiable. El modelo Xortron no tiene benchmarks publicados ni documentacion tecnica que permita compararlo con alternativas de tamano similar como Llama 3 8B, Mistral 7B, Qwen 2.5 14B o Yi-34B. La unica diferencia objetiva es que JAX-XORTRON-i1 esta disponible en un amplio abanico de cuantizaciones GGUF, algo comun en el ecosistema de modelos abiertos pero que no aporta informacion sobre su rendimiento relativo.

## Limitaciones y advertencias

- Ausencia total de documentacion: no hay model card, paper tecnico ni especificaciones de arquitectura, entrenamiento o evaluacion.
- Licencia no confirmada: aunque la busqueda web sugiere licencia wtfpl para el modelo Xortron original, la pagina de este repositorio no especifica licencia, lo que genera incertidumbre legal para uso comercial.
- Naturaleza "uncensored": la ausencia de filtros de seguridad implica riesgo de generar contenido inapropiado, ofensivo o potencialmente ilegal. No es recomendable su uso en aplicaciones orientadas al publico general.
- Sin garantia de calidad: la falta de benchmarks impide conocer el rendimiento real del modelo en tareas estandar.
- Riesgo de alucinacion: al ser un modelo sin informacion verificable sobre su entrenamiento, el riesgo de alucinaciones y errores factuales es desconocido pero potencialmente alto.
- Fecha de creacion atipica: el modelo fue creado el 2 de septiembre de 2026, una fecha futura que sugiere un posible error en el reloj del sistema o un dato incorrecto en la plataforma.
- Sin soporte de vision ni multimodalidad: no hay indicios de que el modelo acepte entradas distintas al texto.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/JAX-XORTRON-i1-GGUF
- Modelo original (referenciado en la model card): https://huggingface.co/darkc0de/JAX-XORTRON
- Repositorio del modelo Xortron relacionado: https://huggingface.co/mradermacher/XORTRON-i1-GGUF
- Variante NXTXPRTXXL del mismo autor: https://huggingface.co/mradermacher/XORTRON-NXTXPRTXXL-i1-GGUF
- Repositorio de JAX (posible framework de entrenamiento): https://github.com/jax-ml/jax

# Glubbot-Team/glubbot1.2-132m

## Resumen

Glubbot1.2-132m es un modelo de lenguaje compacto publicado por Glubbot-Team en Hugging Face bajo licencia Apache 2.0. Se trata de un modelo de tipo GPT-2 con 123.886.080 parametros reales almacenados en safetensors (la denominacion comercial "132m" redondea esa cifra), lo que lo situa en la categoria de modelos diminutos, por debajo de los 150 millones de parametros. Su repo ocupa 0,7 GB e incluye tanto pesos en safetensors como una version en GGUF.

El modelo resuelve el problema de disponer de un generador de texto extremadamente ligero, ejecutable en CPU o en cualquier GPU de consumo, y orientado segun la informacion publica disponible a la distribucion de texto de Shakespeare. Esto lo convierte en una pieza util para experimentacion, docencia, fine-tuning sobre dominios acotados y pruebas de infraestructura de inferencia, mas que en un modelo de proposito general.

Su relevancia actual es limitada en terminos de capacidad bruta, pero resulta interesante como banco de pruebas: al ser tan pequeno, permite validar pipelines completos (tokenizacion, cuantizacion, despliegue con Ollama o llama.cpp, integracion en endpoints) con un coste de hardware minimo. No hay informacion publicada sobre el numero de tokens de entrenamiento, la composicion del dataset ni el proceso de alineacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (segun el tag del repositorio); detalles concretos no disponibles |
| Parametros totales | 123.886.080 (aproximadamente 124 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (variantes concretas no disponibles); safetensors en precision original no especificada |
| Idiomas soportados | no disponible (el entrenamiento citado se limita a texto de Shakespeare, predominantemente ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

La unica informacion arquitectonica disponible es el tag `gpt2` del repositorio, que apunta a una arquitectura transformer decoder-only con atencion causal, del tipo introducido por OpenAI en 2019. No se detallan el numero de capas, la dimension del modelo, el numero de cabezas de atencion ni si se emplearon embeddings atados entre entrada y salida. La cifra de 123.886.080 parametros es consistente con la escala de GPT-2 small (124 M), pero no se confirma que la configuracion sea identica.

En cuanto a los datos, la ficha de Ollama del modelo indica que fue entrenado sobre la distribucion de texto de Shakespeare. No hay informacion sobre el volumen de tokens, la mezcla del dataset, la presencia de codigo o contenido multilingue, ni sobre tecnicas de ajuste posterior como RLHF, DPO o SFT. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa, atencion lineal o variantes hibridas.

## Capacidades

- Generacion de texto autoregresiva basica, en linea con un transformer decoder-only de ~124 M de parametros.
- Generacion de texto con estilo o vocabulario proximo al corpus de Shakespeare, si el entrenamiento efectivamente se limito a ese dominio.
- Ejecucion en entornos con recursos muy limitados gracias a su tamano reducido y a la disponibilidad de pesos en GGUF.
- Compatibilidad declarada con endpoints (`endpoints_compatible` entre los tags del repositorio), lo que sugiere que puede servirse a traves de APIs de inferencia estandar.
- No hay evidencia publicada de soporte de tool calling o function calling.
- No hay evidencia publicada de capacidades de agente ni de razonamiento multi-paso.
- No hay evidencia publicada de capacidades multilingues; el corpus citado es predominantemente en ingles.
- No hay evidencia de modo de razonamiento explicito (`thinking`), vision, audio ni otras modalidades.

## Casos de uso

- Prototipado de pipelines de inferencia: por su tamano, permite validar de punta a punta un flujo con transformers, llama.cpp u Ollama antes de escalar a modelos mayores, sin consumir GPU dedicada.
- Fine-tuning sobre dominios acotados: con 124 M de parametros, el ajuste completo cabe en una GPU de consumo e incluso en CPU con paciencia; util para adaptar el modelo a jergas concretas, formatos de texto o estilos literarios.
- Generacion creativa de estilo shakespeariano: dado el corpus citado, puede emplearse para producir parrafos con registro arcaizante en ingles, siempre con revision humana por la alta probabilidad de incoherencias.
- Docencia y divulgacion: sirve para explicar de forma tangible conceptos como tokenizacion, perplexity, temperatura de muestreo o efecto de la cuantizacion, ejecutandose en un portatil.
- Pruebas de cuantizacion y comparativas de rendimiento: permite medir diferencias de latencia y calidad entre FP32, FP16 y distintos niveles de GGUF en hardware modesto.
- Componente de generacion en aplicaciones offline o embebidas: en escenarios sin conectividad y con restricciones severas de memoria, puede generar texto corto de forma local.
- Base para experimentos de destilacion: util como modelo alumno o profesor auxiliar en investigacion sobre compresion de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de 123,9 M de parametros, sin overhead de runtime):
  - FP32: aproximadamente 500 MB de pesos.
  - FP16/BF16: aproximadamente 250 MB.
  - INT8: aproximadamente 125 MB.
  - GGUF Q4: aproximadamente 70-80 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; tambien funciona en CPU de forma nativa, dado el tamano.
- Cabe holgadamente en GPU de consumo: GTX 1050 Ti, GTX 1650, RTX 3050, RTX 4060, RTX 4090 y equivalentes, con margen amplio para el contexto y el overhead del runtime.
- Opciones de despliegue: Ollama (existe una compilacion GGUF publicada por un tercero), llama.cpp, Hugging Face transformers, endpoints compatibles con la API de inferencia, y servidores tipo TGI o vLLM si se necesita batching.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Glubbot1.2-132m | 123,9 M | no disponible | Apache 2.0 | Hugging Face (safetensors y GGUF) |
| GPT-2 small | 124 M | 1024 tokens | Licencia modificada de MIT | Hugging Face y multiples repositorios |
| DistilGPT-2 | 82 M | 1024 tokens | Apache 2.0 | Hugging Face |
| SmolLM-135M | 135 M | 2048 tokens | Apache 2.0 | Hugging Face |

No se dispone de resultados de benchmarks de Glubbot1.2-132m que permitan una comparacion de rendimiento con estas alternativas. La comparacion se limita por tanto a parametros, contexto y licencia.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Un modelo entrenado sobre un corpus literario historico en ingles tiende a reproducir sesgos culturales y de genero propios de ese material, pero no hay evaluacion publicada al respecto.
- Riesgo de alucinacion: alto. Con 124 M de parametros y un corpus de entrenamiento presumiblemente reducido, la coherencia a medio plazo y la fidelidad factual son muy limitadas.
- Limitaciones de contexto e idioma: la longitud de contexto no esta documentada y el entrenamiento citado se restringe a texto de Shakespeare, por lo que el comportamiento fuera del ingles y fuera del registro literario sera deficiente.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y se indiquen los cambios. No se identifican clausulas adicionales, pero conviene verificar el repositorio por si el autor anadiese terminos mas restrictivos no reflejados en la informacion disponible.
- Caveats para produccion: la model card practicamente no contiene documentacion (unicamente la linea de licencia), no hay benchmarks publicados, el numero de descargas es cero y el modelo no tiene historial de uso. No es recomendable desplegarlo en produccion sin una evaluacion propia previa.
- Fecha de creacion del repositorio: la informacion proporcionada indica 2026-09-28, lo que resulta anomala; conviene confirmar la fecha real en la pagina del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Glubbot-Team/glubbot1.2-132m
- Organizacion en Hugging Face: https://huggingface.co/Glubbot-Team
- Compilacion GGUF en Ollama (terceros): https://ollama.com/caplette776/glubbot1.2-132m

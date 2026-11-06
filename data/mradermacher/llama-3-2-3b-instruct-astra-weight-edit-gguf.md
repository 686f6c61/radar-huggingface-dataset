# mradermacher/Llama-3.2-3B-Instruct-Astra-Weight-Edit-GGUF

## Resumen

Llama-3.2-3B-Instruct-Astra-Weight-Edit-GGUF es una coleccion de cuantizaciones GGUF del modelo ndileep/Llama-3.2-3B-Instruct-Astra-Weight-Edit, un ajuste experimental derivado de Llama-3.2-3B-Instruct de Meta. El modelo base aplica tecnicas de edicion de pesos en el espacio de pesos (weight-space programming) para modificar el comportamiento del modelo sin un reentrenamiento convencional, orientado a experimentos de interpretabilidad mecanistica y comparacion numerica. Esta version la publica mradermacher, un conocido cuantizador de la comunidad que genera ficheros GGUF estaticos para su uso con llama.cpp y herramientas compatibles.

El interes practico de esta ficha es doble. Por un lado, documenta un artefacto experimental de investigacion (la edicion de pesos), no un modelo de produccion. Por otro, ofrece el catalogo completo de cuantizaciones GGUF generadas por mradermacher, desde Q2_K (1,5 GB) hasta f16 (6,5 GB), lo que permite ejecutar el modelo en hardware de consumo modesto. El modelo tiene 3.212.749.888 parametros y esta pensado exclusivamente para ingles.

Se trata de un modelo denso de la familia Llama 3.2, con licencia Llama 3.2 y pensado para conversacion. No se han publicado datos de benchmarks ni detalles del proceso de edicion de pesos en la informacion disponible, por lo que debe tratarse como un artefacto de investigacion y no como una alternativa validada a Llama-3.2-3B-Instruct estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Llama 3.2 3B Instruct); edicion de pesos en espacio de pesos |
| Parametros totales | 3.212.749.888 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | llama3.2 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base original en formato Hugging Face |
| Tamano del repo | 29,3 GB |
| Modelo base | ndileep/Llama-3.2-3B-Instruct-Astra-Weight-Edit |
| Libreria | transformers (etiquetado); artefactos para llama.cpp |
| Fecha de creacion | 2026-11-06 |

## Arquitectura y entrenamiento

El modelo subyacente es Llama-3.2-3B-Instruct, un transformer denso de Meta con 3.212.749.888 parametros. Sobre esa base, el autor ndileep aplica lo que la model card describe como weight-space programming y weight editing: modificaciones directas sobre los pesos del modelo en lugar de un ajuste supervisado o RLHF convencional. Las etiquetas del repositorio (numerical-comparison, mechanistic-interpretability, experimental) indican que el objetivo es estudiar como cambia el comportamiento al alterar pesos concretos y comparar numericamente los efectos.

No se dispone de informacion sobre el numero de tokens de edicion, la composicion del dataset utilizado ni si hubo fases de RLHF o DPO adicionales. Tampoco se documentan innovaciones de inferencia como decodificacion especulativa o atencion lineal. La contribucion de esta ficha concreta (mradermacher) es puramente de cuantizacion: convierte los pesos del modelo base a GGUF estatico con el conversor de llama.cpp, sin cuantizaciones ponderadas ni imatrix (el autor indica que no estan disponibles por el momento).

## Capacidades

- Generacion de texto conversacional en ingles, heredada de Llama-3.2-3B-Instruct.
- Razonamiento basico y respuesta a instrucciones de complejidad moderada, limitado por el tamano de 3B parametros.
- Generacion de codigo y matematicas elementales, con calidad inferior a modelos mayores.
- Soporte de conversaciones multi-turno mediante el formato de chat de Llama 3.2.
- Capacidad experimental de edicion de pesos: el modelo sirve como objeto de estudio para comparar el efecto de modificaciones en el espacio de pesos frente al modelo original.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking en la informacion disponible.
- Multilingue limitado: la model card declara unicamente ingles.

## Casos de uso

- Investigacion en interpretabilidad mecanistica: comparar las activaciones y salidas de este modelo editado frente a Llama-3.2-3B-Instruct original para aislar el efecto de los pesos modificados en tareas controladas.
- Experimentos de weight-space programming: usar las distintas cuantizaciones para verificar si el efecto de la edicion se preserva tras la cuantizacion a 4 y 8 bits, algo relevante para estudiar robustez de ediciones.
- Reproduccion de resultados academicos: ejecutar el modelo en local con llama.cpp para replicar comparaciones numericas publicadas por el autor del modelo base.
- Prototipado rapido en hardware de consumo: con Q4_K_M (2,1 GB) se puede desplegar en portatiles con GPU integrada o CPU para probar el comportamiento del modelo editado sin infraestructura dedicada.
- Evaluacion comparativa de cuantizaciones: usar los ficheros Q2_K a Q8_0 para medir la degradacion de perplejidad y calidad segun el nivel de cuantizacion en un modelo editado, un caso de estudio util para pipelines de cuantizacion.
- Docencia y demostraciones: servir como ejemplo practico de un modelo Llama 3.2 pequeno cuantizado para explicar el flujo transformers a GGUF y el uso de llama.cpp en cursos tecnicos.
- Pruebas de regresion de herramientas: validar que llama.cpp, Ollama u otros runners cargan correctamente un modelo derivado con pesos editados antes de integrar variantes mas grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5-2,1 GB con Q2_K a Q4_K_M; 2,4-2,7 GB con Q5/Q6; 3,5 GB con Q8_0; 6,5 GB con f16 (mas overhead de contexto).
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM para cuantizaciones Q4/Q5 (GTX 1650, RTX 3050, RTX 4060). Para Q8_0 se recomienda 6 GB o mas (RTX 2060, RTX 3060). f16 requiere 8 GB o mas.
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas con 4 GB o mas; tambien es viable en CPU pura con llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runner compatible con GGUF. El etiquetado endpoints_compatible sugiere uso en endpoints de inferencia compatibles.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Por el tamano (3B) y las cuantizaciones Q4, se espera un throughput alto en GPU consumer, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Llama-3.2-3B-Instruct-Astra-Weight-Edit (GGUF, este) | 3,21B | no disponible | llama3.2 | GGUF | Edicion de pesos experimental; solo ingles |
| Llama-3.2-3B-Instruct (original de Meta) | 3,21B | 128K (segun Meta) | llama3.2 | safetensors, GGUF | Modelo de referencia; multilingue oficial |
| mradermacher/Llama-3.2-3B-Instruct-GGUF | 3,21B | 128K (segun Meta) | llama3.2 | GGUF | Cuantizacion del original sin edicion de pesos |
| mradermacher/Llama-3.2-3B-Instruct-Medical-Finetuned-merged-GGUF | 3,21B | 128K (segun Meta) | llama3.2 | GGUF | Variante afinada en dominio medico |

La comparativa se limita a derivados del mismo modelo base porque no se dispone de datos de rendimiento del modelo editado que permitan una comparacion cuantitativa con alternativas de otros autores.

## Limitaciones y advertencias

- Modelo experimental: la edicion de pesos no esta validada con benchmarks publicos; el comportamiento puede diferir de forma impredecible respecto al Llama-3.2-3B-Instruct original.
- Riesgo de alucinacion: como todo modelo de 3B, tiende a inventar datos en tareas de conocimiento factual; la edicion de pesos puede agravar este comportamiento sin evaluacion previa.
- Solo ingles: la model card declara unicamente el idioma ingles, pese a que el modelo base de Meta es multilingue.
- Licencia Llama 3.2: el uso comercial esta sujeto a los terminos de la licencia de Meta, incluida la politica de uso aceptable y los requisitos de atribucion; conviene revisarla antes de desplegar en produccion.
- Cuantizaciones estaticas: no hay versiones ponderadas ni imatrix, por lo que las cuantizaciones de baja calidad (Q2_K, Q3_K_M) pueden degradar mas la calidad que en otros modelos.
- Contexto no documentado: se desconoce si la edicion de pesos preserva la ventana de contexto original de Llama 3.2 (128K segun Meta) o la reduce.
- Sin soporte documentado de tool calling ni agentes: no debe asumirse compatibilidad con pipelines que dependan de function calling.
- Cero descargas y cero likes en el momento de la ficha: no hay evidencia de uso en la comunidad ni validacion externa.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Llama-3.2-3B-Instruct-Astra-Weight-Edit-GGUF
- Modelo base original: https://huggingface.co/ndileep/Llama-3.2-3B-Instruct-Astra-Weight-Edit
- Pagina de descargas de mradermacher: https://hf.tst.eu/model#Llama-3.2-3B-Instruct-Astra-Weight-Edit-GGUF
- FAQ y solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Cuantizacion del Llama-3.2-3B-Instruct original: https://huggingface.co/mradermacher/Llama-3.2-3B-Instruct-GGUF
- Variante medica cuantizada: https://huggingface.co/mradermacher/Llama-3.2-3B-Instruct-Medical-Finetuned-merged-GGUF
- Empresa del cuantizador: https://www.nethype.de/

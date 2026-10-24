# mradermacher/qwen-2.5-3b-decensored-i1-GGUF

## Resumen

`mradermacher/qwen-2.5-3b-decensored-i1-GGUF` es un repositorio de cuantizaciones GGUF generado por mradermacher a partir del modelo `redo115/qwen-2.5-3b-decensored`, que a su vez es un ajuste fino de la familia Qwen2.5-3B de Alibaba. No se trata de un modelo entrenado desde cero: el autor del repositorio actúa como cuantizador, aplicando quantizaciones ponderadas con matriz de importancia (imatrix) sobre los pesos del modelo base cedido por un tercero.

La propuesta de valor del modelo subyacente es un Qwen2.5-3B con el comportamiento de rechazo reducido (etiquetado como "decensored"), orientado a generacion de texto sin negativas por defecto. El interes practico de esta variante GGUF es que permite ejecutar ese comportamiento en hardware de consumo mediante llama.cpp u Ollama, sin necesidad de GPU de datacenter.

Conviene advertir desde el principio de dos cuestiones objetivas: el repositorio declara 0 descargas y 0 likes en el momento de la consulta, con un tamano de repo de 0.0 GB, y la unica entrada de la tabla de cuantizaciones provista es el fichero imatrix (0.1 GB); el resto de ficheros GGUF enumerados en los metadatos del README no aparecen listados como descargables en la informacion disponible. Ademas, la licencia figura como "no disponible", lo que impide confirmar condiciones de uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso (heredada de Qwen2.5-3B; sin confirmacion en la model card de esta variante) |
| Parametros totales | 1.680.588 segun metadatos de safetensors en la informacion proporcionada; discrepancia no resuelta con la denominacion "3b" del nombre del repositorio |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (la familia Qwen2.5-3B declara 32.768 tokens nativos) |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL (small), Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K (segun metadatos del README; ficheros no listados en la tabla de descargas) |
| Idiomas soportados | Ingles (`en`) declarado en los metadatos |
| Licencia | No disponible |
| Formato de pesos | GGUF (cuantizaciones) e imatrix; el modelo base se distribuye en formato HuggingFace (safetensors) |

## Arquitectura y entrenamiento

La model card de este repositorio no documenta arquitectura ni proceso de entrenamiento: es una ficha de cuantizacion, no de entrenamiento. Lo unico verificable es la cadena de derivacion: `redo115/qwen-2.5-3b-decensored` como modelo base y este repositorio como cuantizacion ponderada con imatrix del mismo. El autor indica que las cuantizaciones se generaron con matriz de importancia, un metodo que estima la sensibilidad de cada tensor para reducir la perdida de calidad en bits bajos frente a la cuantizacion estatica.

Por herencia, la arquitectura corresponde a un transformer decoder denso de la familia Qwen2.5, con atencion por grupos (GQA) y tokenizador de vocabulario amplio; sin embargo, ni el numero de capas, ni las dimensiones ocultas, ni el volumen de tokens de entrenamiento, ni si hubo etapas de RLHF o DPO estan disponibles en la informacion proporcionada. El proceso concreto por el que el modelo base fue "decensored" (abliteration, fine-tuning con datos sin filtro, edicion de pesos) tampoco se describe en la documentacion accesible, lo que constituye una laguna importante para evaluar su comportamiento en produccion.

## Capacidades

- Generacion de texto autoregresiva en ingles, heredada de la familia Qwen2.5.
- Comportamiento de rechazo reducido por diseno ("decensored"): el modelo base se presenta como una variante sin el filtrado conversacional habitual, pensada para responder sin negativas por defecto.
- Ejecucion local en CPU y GPU mediante llama.cpp y derivados (formato GGUF).
- Ajuste de calidad/tamano mediante seleccion de cuantizacion, desde IQ1_S hasta Q6_K.
- Compatibilidad declarada con endpoints (`endpoints_compatible` en los tags de HuggingFace).
- Razonamiento, codigo, matematicas y tool calling: no confirmados para esta variante en la informacion proporcionada; la familia Qwen2.5-3B los soporta, pero el ajuste "decensored" puede alterar el comportamiento instruccional.
- Capacidades multimodales, de audio o modo "thinking": no disponibles.

## Casos de uso

- Escritura creativa y ficcion sin restricciones: el ajuste "decensored" elimina las negativas por contenido sensible, lo que resulta util para narrativa, guiones y roleplay donde un modelo alineado bloquea la generacion. Con cuantizaciones Q4_K_M o superiores el modelo cabe en una GPU de 8 GB.
- Investigacion en seguridad y red teaming: sirve como modelo de referencia "sin alinear" para medir la eficacia de clasificadores de contenido, comparar tasas de cumplimiento frente a versiones alineadas y construir conjuntos de prompts adversarios de forma controlada y local.
- Generacion de datos sinteticos para dominios delicados: permite producir corpus de texto sobre temas que los modelos alineados rechazan (toxicologia, ficcion violenta, contenido medico explicito) para entrenar o evaluar clasificadores downstream.
- Asistente personal offline: al distribuirse en GGUF y con cuantizaciones de ~1-2 GB, se puede desplegar en un portatil sin conexion mediante Ollama o llama.cpp, sin enviar datos a terceros.
- Prototipado rapido de pipelines de inferencia: util como modelo de pruebas barato para validar infraestructura (servidores compatibles con OpenAI API, vLLM con backend GGUF, LiteLLM) antes de escalar a modelos mayores.
- Base para ajuste fino adicional: al ser un modelo de 3B con licencia no confirmada, es candidato para LoRA/QLoRA en tareas de estilo o dominio, siempre que se aclare antes la situacion legal del modelo base.
- Educacion y demos de cuantizacion: el repositorio incluye el fichero imatrix, lo que lo convierte en material practico para explicar como afecta la cuantizacion ponderada a la perplejidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni evaluaciones de perplejidad por cuantizacion, ni para el modelo base ni para las variantes GGUF.

## Requisitos de hardware

- VRAM estimada para inferencia (modelo denso de ~3B, estimaciones en funcion del tipo de cuantizacion): IQ1_S ~0,9 GB; Q2_K ~1,2 GB; Q3_K_M ~1,5 GB; Q4_K_M ~1,9 GB; Q5_K_M ~2,2 GB; Q6_K ~2,5 GB; Q8_0 ~3,3 GB; F16 ~6,2 GB. Los ficheros reales no estan listados en la informacion disponible, por lo que los tamanos son estimaciones.
- Con contexto largo hay que sumar el KV cache: para 8.192 tokens en Q4_K_M, un presupuesto de 3-4 GB de VRAM total es razonable.
- Cabe en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti 8/16 GB, RTX 4070, RTX 4090 (holgadisimo, permite contexto completo y varias instancias). Tambien en iGPU y CPU con cuantizaciones Q4 o inferiores.
- GPU de datacenter (A100, H100, L40S): sobredimensionadas para este modelo; solo tienen sentido para servir muchas peticiones concurrentes.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, servidores compatibles con la API de OpenAI, TGI con backend GGUF y vLLM (soporte GGUF limitado y experimental). El tag `endpoints_compatible` sugiere uso via Inference Endpoints.
- Latencia y throughput: no disponibles. Como referencia cualitativa, un 3B en Q4_K_M sobre una RTX 4090 genera decenas de tokens por segundo; no se aportan cifras medidas para esta variante.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este modelo (`qwen-2.5-3b-decensored-i1-GGUF`) | 3B nominal (metadatos: 1.680.588) | No disponible | No disponible | GGUF, 0 descargas, solo imatrix listado | Sin benchmarks publicados |
| Qwen2.5-3B-Instruct | ~3,09B | 32.768 tokens nativos, extensible con YaRN | Apache 2.0 | Pesos safetensors y GGUF de terceros | Referencia alineada de la misma familia; benchmarks publicados por Alibaba |
| Llama 3.2 3B Instruct | ~3,21B | 128.000 tokens | Llama 3.2 Community License | Pesos oficiales y GGUF de terceros | Mayor contexto nativo, licencia con restricciones de uso |
| Gemma 2 2B Instruct | ~2,6B | 8.192 tokens | Gemma Terms of Use | Pesos oficiales y GGUF | Mas pequeno y con contexto mas corto; requiere aceptar terminos |

No se dispone de numeros de benchmark comparativos en la informacion proporcionada, por lo que la comparacion se limita a parametros, contexto, licencia y disponibilidad. En la practica, la diferencia relevante frente a las alternativas alineadas no es de rendimiento sino de comportamiento: este modelo renuncia deliberadamente al filtrado de contenido.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de que las cuantizaciones de baja calidad (IQ1_S, IQ2_XXS) mantengan la coherencia del modelo original.
- Riesgo elevado de alucinacion: un modelo de 3B sin evaluaciones publicadas y con el alineamiento eliminado tiende a producir afirmaciones erroneas con tono seguro, especialmente en dominios factuales.
- Sesgos no mitigados: al retirar el filtrado conversacional se eliminan tambien las capas de rechazo que, en parte, contenian respuestas daninas; es esperable una mayor propension a generar contenido toxico, estereotipado o inseguro.
- Idiomas: solo se declara ingles. El multilingue de la familia Qwen2.5 no esta verificado para esta variante y el ajuste "decensored" puede haber degradado el rendimiento en castellano.
- Licencia no disponible: no se puede confirmar el uso comercial. Aunque Qwen2.5-3B se publica bajo Apache 2.0, el ajuste de terceros y su redistribucion en GGUF anaden una capa de incertidumbre legal que conviene resolver antes de integrar el modelo en un producto.
- Repositorio practicamente vacio: 0.0 GB de tamano, 0 descargas y solo el fichero imatrix en la tabla de cuantizaciones. Antes de planificar un despliegue hay que verificar que los GGUF existen realmente y son descargables.
- Metadatos inconsistentes: el recuento de parametros (1.680.588) no cuadra con la etiqueta "3b"; puede tratarse de un artefacto de la herramienta de cuantizacion y no de un modelo de 1,6 millones de parametros, pero no hay confirmacion.
- Fecha de creacion anomala (2026-10-23) en los metadatos, lo que sugiere errores de catalogacion en el repositorio.
- Uso responsable: la ausencia de rechazo por defecto hace inadecuado su despliegue en aplicaciones de cara al publico sin una capa de moderacion externa.
- Sin garantias de soporte: el autor es un cuantizador individual; no hay mantenimiento, changelog ni issues documentados para esta variante.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/qwen-2.5-3b-decensored-i1-GGUF
- Modelo base: https://huggingface.co/redo115/qwen-2.5-3b-decensored
- Cuantizaciones estaticas del mismo autor: https://huggingface.co/mradermacher/qwen-2.5-3b-decensored-GGUF
- Pagina de resumen y descargas del cuantizador: https://hf.tst.eu/model#qwen-2.5-3b-decensored-i1-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF referenciada por el autor: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafica comparativa de perplejidad por cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png

# saad3443/auric-v2-q4f16_1-MLC

## Resumen

Auric v2 es un ajuste fino del modelo Qwen2.5-1.5B-Instruct desarrollado por el usuario saad3443 (Saad), empaquetado especificamente para su ejecucion en navegador mediante MLC LLM y WebLLM. No se trata de un modelo de proposito general entrenado desde cero, sino de una personalizacion con LoRA sobre el modelo base de Alibaba Cloud, orientada a construir un asistente personal con una personalidad definida y un corpus propio de lecciones y respuestas. Su relevancia practica radica en que demuestra el flujo completo de adaptacion y compilacion de un modelo pequeno para inferencia local en el cliente, sin servidor.

El resultado es un artefacto de aproximadamente 0,9 GB con cuantizacion q4f16_1, lo que permite desplegarlo en GPUs integradas, telefonos y navegadores compatibles con WebGPU. La licencia Apache 2.0 del modelo base se mantiene, lo que facilita su reutilizacion comercial, aunque las condiciones concretas del ajuste dependen del autor original.

Es importante subrayar que la model card publicada es extremadamente breve: no incluye resultados de benchmarks, ni composicion detallada del dataset, ni numero de tokens de entrenamiento, ni lista cerrada de idiomas. Esta ficha recoge lo declarado por el autor y los datos tecnicos heredados del modelo base, marcando explicitamente como "no disponible" todo aquello que no consta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con grouped-query attention (GQA), RMSNorm y SwiGLU (heredada de Qwen2.5-1.5B-Instruct) |
| Parametros totales | 1,5 mil millones (aproximadamente 1,54 B en el modelo base) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no especificada en la model card; el modelo base Qwen2.5-1.5B-Instruct declara 32.768 tokens nativos, ampliables con YaRN |
| Tipos de cuantizacion | q4f16_1 (pesos de 4 bits con cuantizacion por grupos y computo en fp16), formato nativo de MLC LLM |
| Idiomas soportados | no disponible; la model card menciona "ejemplos en muchos idiomas" sin enumerarlos. El modelo base declara soporte para 29 idiomas |
| Licencia | apache-2.0 |
| Formato de pesos | MLC LLM (ficheros de parametros binarios y configuracion JSON de MLC/WebLLM); no se distribuyen safetensors ni GGUF en este repositorio |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B-Instruct, un transformer decoder-only denso de aproximadamente 1,54 mil millones de parametros con grouped-query attention, normalizacion RMSNorm y activacion SwiGLU, propio de la familia Qwen2.5. Sobre esa base se aplico un ajuste fino con LoRA, un metodo de adaptacion de bajo rango que anade matrices entrenables a las capas congeladas, reduciendo drasticamente el coste de entrenamiento y el riesgo de catastrofico olvido. La model card no especifica el rango de LoRA, la tasa de aprendizaje, el numero de pasos ni la mezcla de precision utilizada.

En cuanto a los datos, el autor describe una combinacion de material propio: la personalidad del asistente, lecciones escritas por el propio Saad, lecciones generadas por un modelo profesor (Qwen2.5-7B-Instruct, tambien Apache 2.0), respuestas redactadas a partir de fuentes de Wikipedia y ejemplos multilingues. No se publica el volumen de tokens, la proporcion entre componentes del dataset ni si hubo fases adicionales de RLHF o DPO. Tampoco se documenta el proceso de destilacion con el modelo profesor ni los criterios de filtrado de datos.

La innovacion tecnica relevante no esta en el entrenamiento sino en el empaquetado: el modelo se compila con MLC LLM al formato q4f16_1, lo que permite ejecutarlo en el navegador a traves de WebLLM usando WebGPU. Esta cuantizacion aplica 4 bits a los pesos con escalas por grupo y mantiene las activaciones y el computo en fp16, un compromiso habitual para maximizar compatibilidad con kernels WebGPU sin degradar en exceso la calidad.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del ajuste instructivo del modelo base.
- Razonamiento basico y respuesta a preguntas de conocimiento general, con sesgo hacia el estilo y los contenidos del corpus de ajuste (personalidad de Auric, lecciones del autor).
- Generacion de codigo y resolucion de problemas matematicos sencillos, en el rango esperable para un modelo de 1,5 B de parametros.
- Comprension multilingue parcial: la model card menciona ejemplos en varios idiomas, pero no se especifica cobertura ni calidad por idioma.
- Ejecucion local en el navegador mediante WebLLM y WebGPU, sin necesidad de backend ni conexion a un servidor de inferencia.
- Soporte de tool calling o function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo de razonamiento explicito (thinking), vision o audio: no disponibles; el modelo es exclusivamente de texto.

## Casos de uso

- Asistente personal embebido en una aplicacion web: al estar compilado para WebLLM, puede cargarse directamente en el navegador del usuario y mantener conversaciones privadas sin enviar datos a un servidor, algo critico en entornos con requisitos de confidencialidad.
- Demo interactiva de un personaje o chatbot con personalidad propia: el ajuste con LoRA sobre material de personalidad permite desplegar una experiencia conversacional coherente en una pagina estatica, sin coste de infraestructura.
- Prototipado rapido de productos conversacionales: sirve como banco de pruebas para validar flujos de UI, prompts de sistema y manejo de contexto antes de escalar a modelos mayores.
- Educacion y tutoria guiada: el corpus de lecciones del autor sugiere un uso como asistente de aprendizaje de contenidos concretos, aprovechando el ajuste sobre material didactico especifico.
- Aplicaciones de escritorio o moviles offline: el tamano de 0,9 GB y la cuantizacion de 4 bits permiten incluirlo como recurso embebido y operar sin conectividad.
- Generacion asistida de borradores y resumenes de texto corto: adecuado para tareas de redaccion de baja complejidad donde la latencia y el coste importan mas que la profundidad del razonamiento.
- Filtrado o clasificacion ligera en el cliente: al ejecutarse localmente, puede actuar como primera capa de triaje antes de derivar consultas a un modelo mayor alojado en servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de Auric v2 no incluye metricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, ni comparaciones con el modelo base o con alternativas. Tampoco se documentan mediciones de latencia o throughput. Cualquier cifra de rendimiento que se cite para este artefacto seria una extrapolacion no verificada, por lo que no se incluye ninguna.

## Requisitos de hardware

- VRAM estimada para pesos: aproximadamente 0,9 GB en la cuantizacion q4f16_1 distribuida en el repositorio.
- VRAM total estimada en inferencia: del orden de 1,5 a 2 GB contando pesos, cache KV y overhead del runtime, para contextos moderados.
- GPU integradas: el modelo esta disenado para funcionar en iGPUs modernas (Intel Iris Xe, AMD Radeon integrada, Apple Silicon) mediante WebGPU.
- GPUs dedicadas de gama de entrada: cualquier GPU con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060) puede ejecutarlo con margen amplio.
- GPUs de datacenter: A100, H100 o L40S no son necesarias; sobredimensionadas para este tamano.
- Cabe en GPU de consumo: si, en practicamente todas las GPU discretas de los ultimos ocho anos y en muchas integradas.
- Moviles: viable en telefonos recientes con soporte WebGPU o mediante runtimes nativos de MLC en Android e iOS.
- Opciones de despliegue: MLC LLM (nativo), WebLLM (navegador con WebGPU), y conversion adicional a GGUF con llama.cpp u Ollama si se desea reutilizar el adaptador o el modelo base.
- Latencia y throughput: no disponibles; no se han publicado mediciones para este artefacto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato y despliegue | Notas |
|---|---|---|---|---|---|
| Auric v2 (este modelo) | 1,5 B | no especificado; base con 32.768 tokens | apache-2.0 | MLC q4f16_1, WebLLM/MLC | Ajuste LoRA con corpus propio; sin benchmarks publicados |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 tokens | apache-2.0 | safetensors, GGUF, MLC | Modelo base; soporte declarado de 29 idiomas y resultados publicados por Alibaba |
| Llama 3.2 1B Instruct | 1,24 B | 128.000 tokens | Licencia comunitaria de Llama (no OSI) | safetensors, GGUF, MLC | Mayor contexto, pero licencia con restricciones y menos idiomas declarados |
| Gemma 2 2B IT | 2,6 B | 8.192 tokens | Licencia de Gemma (uso condicionado) | safetensors, GGUF, MLC | Mas parametros y contexto reducido; licencia con terminos adicionales |
| SmolLM2-1.7B-Instruct | 1,7 B | 8.192 tokens | apache-2.0 | safetensors, GGUF, MLC | Alternativa totalmente permisiva, sin ajuste de personalidad |

La comparacion se limita a caracteristicas estructurales y de licencia: al no existir resultados de evaluacion publicados para Auric v2, no es posible establecer una comparacion de calidad objetiva frente a estas alternativas.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni evaluaciones humanas, ni analisis de regresiones respecto al modelo base. El ajuste con LoRA puede haber degradado capacidades generales sin que exista forma de cuantificarlo.
- Riesgo elevado de alucinacion: con 1,5 B de parametros y un ajuste sobre material heterogeneo (lecciones propias, salidas de un modelo profesor y respuestas derivadas de Wikipedia), la fidelidad factual es limitada y no verificable.
- Sesgo de personalidad: el ajuste esta disenado para reproducir una personalidad y un estilo concretos, lo que puede producir respuestas poco neutrales o inadecuadas fuera del dominio previsto.
- Datos de entrenamiento opacos: no se detalla la composicion del dataset, el volumen, los filtros aplicados ni el tratamiento de datos personales, lo que dificulta auditorias de sesgo o de cumplimiento.
- Idiomas no especificados: la model card afirma que hay ejemplos "en muchos idiomas", pero no enumera cobertura ni garantiza calidad fuera del ingles y del castellano.
- Longitud de contexto no confirmada: la model card no declara el contexto soportado por este artefacto concreto; el valor de 32.768 tokens corresponde al modelo base y podria no haberse conservado intacto tras el ajuste y la cuantizacion.
- Limitaciones del formato MLC: el repositorio solo distribuye pesos en formato MLC/WebLLM, lo que dificulta su uso directo con vLLM, TGI o transformers sin reconvertir el modelo base.
- Licencia: se hereda Apache 2.0 del modelo base, lo que en principio permite uso comercial, pero el autor no aporta un aviso de copyright completo ni aclara la titularidad del corpus de ajuste.
- Cero validacion externa: el repositorio registra cero descargas y cero valoraciones, por lo que no existe evidencia de uso en produccion ni retroalimentacion de terceros.
- Fecha de publicacion anomala: los metadatos indican fecha de creacion en octubre de 2026, lo que sugiere un error de registro y debe tenerse en cuenta al evaluar la trazabilidad del artefacto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/saad3443/auric-v2-q4f16_1-MLC
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Modelo profesor mencionado en la model card: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- MLC LLM (runtime y compilador): https://github.com/mlc-ai/mlc-llm
- WebLLM (inferencia en navegador): https://github.com/mlc-ai/web-llm
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0

Nota: la busqueda web realizada no ha devuelto ningun resultado relacionado con este modelo ni con su autor; los unicos enlaces pertinentes son los anteriores.

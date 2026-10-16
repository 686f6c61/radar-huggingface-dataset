# Berk-Bey/Otak-2-2b

## Resumen

Otak-2-2b es un modelo de lenguaje publicado por el usuario Berk-Bey en HuggingFace, construido a partir de google/gemma-2-2b-it como modelo base. Por las etiquetas del repositorio (gguf, base_model:quantized:google/gemma-2-2b-it) y por el tamano del repositorio (1,7 GB frente a los aproximadamente 5,2 GB que ocuparian los pesos en FP16), se trata con alta probabilidad de una version cuantizada en formato GGUF del Gemma 2 2B instruct, posiblemente con algun ajuste o renombrado posterior, si bien la model card no documenta ningun proceso de entrenamiento adicional.

El modelo declara soporte para turco (tr) e ingles (en) y se distribuye bajo la licencia Gemma, heredada del modelo base. Su interes practico esta en el nicho de la inferencia local: con 2.614.341.888 parametros, es un candidato razonable para ejecutarse en GPU de consumo e incluso en CPU mediante llama.cpp u Ollama, en escenarios donde no se dispone de hardware de datacenter.

La relevancia de esta ficha es limitada por la escasez de documentacion: el repositorio no incluye pipeline declarado, no aporta resultados de benchmarks, no especifica los niveles de cuantizacion incluidos ni describe el dataset o el procedimiento de ajuste. Cualquier evaluacion en produccion deberia por tanto validarse empiricamente antes de adoptarlo, y conviene contrastar su comportamiento con el del Gemma 2 2B-it original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, arquitectura Gemma 2 (atencion local/global alterna con ventana deslizante, RMSNorm, GeGLU). Dato heredado del modelo base; no confirmado en la ficha de Otak-2-2b |
| Parametros totales | 2.614.341.888 (aproximadamente 2,6 mil millones) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 8192 tokens en el modelo base Gemma 2 2B; no confirmado explicitamente para este repositorio |
| Tipos de cuantizacion | GGUF; los niveles concretos (Q4_K_M, Q5_K_M, Q8_0, etc.) no estan especificados en la informacion disponible |
| Idiomas soportados | turco (tr) e ingles (en), segun las etiquetas del repositorio |
| Licencia | Gemma (Gemma Terms of Use) |
| Formato de pesos | GGUF (etiqueta del repositorio); la plataforma reporta un recuento de parametros procedente de safetensors, pero el repositorio ocupa 1,7 GB, lo que apunta a pesos unicamente cuantizados |
| Modelo base | google/gemma-2-2b-it |
| Tamano del repositorio | 1,7 GB |
| Fecha de publicacion | 15 de octubre de 2026 (fecha declarada en los metadatos del repositorio) |

## Arquitectura y entrenamiento

La informacion disponible no documenta ningun proceso de entrenamiento o ajuste propio: la model card se limita a declarar la licencia, los idiomas y el modelo base. Por las etiquetas del repositorio, el artefacto es una cuantizacion de google/gemma-2-2b-it, por lo que su arquitectura subyacente corresponde a la del Gemma 2 2B: un transformer decoder-only denso de 2,6 mil millones de parametros con 26 capas, atencion alterna entre ventanas locales de 4096 tokens y atencion global, normalizacion RMSNorm y activaciones GeGLU. El Gemma 2 2B original fue entrenado con destilacion de conocimiento a partir de modelos mayores de la familia y utiliza logit soft-capping para estabilizar el entrenamiento.

El modelo base Gemma 2 2B-it fue ajustado con tecnicas de alineamiento tipo RLHF sobre el modelo preentrenado, y su ventana de contexto es de 8192 tokens. No hay constancia de que Berk-Bey haya aplicado fine-tuning adicional, LoRA, DPO ni ninguna otra modificacion sobre los pesos; tampoco se documenta la composicion del dataset, el numero de tokens de entrenamiento ni si se ha realizado una evaluacion posterior. Cualquier innovacion tecnica atribuible a este repositorio se limita, por tanto, al proceso de cuantizacion a GGUF.

## Capacidades

- Generacion de texto conversacional en turco e ingles, heredada del ajuste instructivo del modelo base.
- Razonamiento basico y respuesta a instrucciones en formato pregunta-respuesta de un solo turno o multiturno corto.
- Generacion y explicacion de codigo en lenguajes habituales, con calidad limitada por el tamano del modelo.
- Aritmetica y problemas matematicos de complejidad baja o media, con riesgo apreciable de error en cadenas de varios pasos.
- Soporte multilingue restringido a los dos idiomas declarados (tr, en); no se declara cobertura de castellano.
- Compatibilidad con endpoints de inferencia (etiqueta endpoints_compatible) para despliegue mediante la infraestructura de HuggingFace.
- Vineta no confirmada: no hay evidencia en la informacion disponible de soporte de tool calling, function calling nativo, modo thinking, capacidades de vision o audio, ni de uso como agente en razonamiento multi-paso. El modelo base Gemma 2 no incorpora tool calling nativo, por lo que su uso agentico exigiria envoltorios externos de parsing.

## Casos de uso

- Asistente conversacional local en turco: desplegado con llama.cpp u Ollama en un portatil con GPU de gama media, el modelo puede gestionar dialogos de asistencia general en turco con una ventana de 8192 tokens, sin enviar datos a servicios externos.
- Prototipado rapido de aplicaciones de chat: al ser un GGUF de 1,7 GB, permite iterar en el diseno de prompts y flujos conversacionales en una maquina de desarrollo antes de migrar a un modelo mayor.
- Clasificacion y etiquetado de texto en ingles y turco: resumen de documentos cortos, extraccion de intenciones o categorizacion de tickets, con coste de inferencia muy bajo.
- Generacion de codigo asistida en entornos con recursos limitados: autocompletado y explicacion de fragmentos de codigo integrados en un editor local, asumiendo capacidad reducida frente a modelos de 7B o superiores.
- Traduccion informal turco-ingles en flujos internos: borradores de correos, notas o mensajes, siempre con revision humana por tratarse de un modelo de 2B.
- Filtrado previo y enrutado de consultas: uso como clasificador barato que decide si una peticion debe escalarse a un modelo mayor, reduciendo el coste total del sistema.
- Educacion y experimentacion: material didactico para estudiar el comportamiento de modelos cuantizados, comparar niveles de cuantizacion y medir degradacion respecto al modelo original.
- Inferencia en dispositivos sin GPU dedicada: al caber en memoria RAM de un equipo convencional, permite ejecutar un asistente de texto en CPU como alternativa a servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de MMLU, HumanEval, GSM8K ni de ningun otro conjunto de evaluacion, y los resultados de busqueda web no guardan relacion con el modelo.

## Requisitos de hardware

- Estimacion de VRAM para inferencia, segun el peso de los pesos en disco: aproximadamente 5,2 GB en FP16, unos 2,8 GB en Q8_0 y en torno a 1,7 GB en cuantizaciones de 4 bits como Q4_K_M (valor coherente con el tamano del repositorio). A estas cifras hay que sumar el espacio de la cache KV, que crece con la longitud de contexto y el numero de secuencias simultaneas.
- GPU recomendadas: cualquier GPU con al menos 4 GB de memoria efectiva para cuantizaciones de 4 bits (RTX 3050, GTX 1650, RTX 4060); para FP16 se recomienda un minimo de 8 GB (RTX 3060 Ti, RTX 4060 Ti, RTX 3070). En entornos profesionales, una A100 o H100 solo tendria sentido para servir muchas replicas en paralelo, dado el reducido tamano del modelo.
- Cabe en GPU de consumo: si, en practicamente toda la gama actual y en bastantes modelos antiguos con al menos 4 GB de VRAM, siempre que se use una cuantizacion de 4 bits.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y servidores compatibles con GGUF; para versiones sin cuantizar, vLLM o TGI. La etiqueta endpoints_compatible sugiere compatibilidad con los endpoints de inferencia de HuggingFace.
- Latencia y throughput estimados: no disponible. No hay mediciones publicadas de tokens por segundo ni de latencia en el repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Otak-2-2b | 2,6 mil millones | no confirmado (8K en el base) | Gemma | GGUF en HuggingFace | Cuantizacion sin documentar de Gemma 2 2B-it |
| google/gemma-2-2b-it | 2,6 mil millones | 8192 tokens | Gemma | Pesos oficiales en HuggingFace | Modelo de referencia del que deriva Otak-2-2b |
| Llama 3.2 3B Instruct | 3,2 mil millones | 128 000 tokens | Llama 3.2 Community License | Pesos oficiales y multiples GGUF de terceros | Contexto mucho mayor y ecosistema de cuantizaciones mas maduro |
| Qwen2.5 3B Instruct | 3,1 mil millones | 32 768 tokens | Apache 2.0 | Pesos oficiales y GGUF de terceros | Licencia permisiva y buen rendimiento relativo en codigo y multilingue |

Los datos de los tres modelos comparados provienen de sus fichas publicas; no se dispone de comparaciones de rendimiento medidas entre Otak-2-2b y estas alternativas.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card no describe el proceso de creacion, los datos usados ni los niveles de cuantizacion incluidos, lo que dificulta auditar el artefacto.
- Riesgo elevado de alucinacion, inherente a un modelo de 2,6 mil millones de parametros y agravado por la posible degradacion introducida por la cuantizacion.
- Cobertura linguistica limitada a turco e ingles; no se declara soporte de castellano, por lo que su uso en espanol no esta garantizado.
- Contexto efectivo reducido (8192 tokens en el modelo base, no confirmado en este repositorio), insuficiente para tareas de documentacion extensa o analisis de repositorios completos.
- Sin garantias de soporte de tool calling ni de razonamiento agentico multi-paso; cualquier integracion de este tipo requiere capas externas de validacion y parsing.
- Licencia Gemma: el uso comercial esta permitido bajo los terminos de Google, pero impone obligaciones de atribucion y restricciones de uso (por ejemplo, prohibicion de usos daninos y requisitos de distribucion de la licencia). Debe revisarse el texto completo antes de un despliegue en produccion.
- Trazabilidad dudosa: el repositorio registra cero descargas y cero valoraciones, y las fechas declaradas en los metadatos son posteriores a la fecha habitual de publicacion de Gemma 2, lo que aconseja verificar la integridad de los pesos antes de usarlos.
- No hay evidencia de evaluacion de sesgos, de pruebas de seguridad ni de validacion de calidad frente al modelo original, por lo que se recomienda contrastar el comportamiento con google/gemma-2-2b-it antes de adoptarlo.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Berk-Bey/Otak-2-2b
- Modelo base: https://huggingface.co/google/gemma-2-2b-it
- Terminos de licencia Gemma: https://ai.google.dev/gemma/terms
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; las coincidencias obtenidas corresponden a localidades y comercios ajenos al proyecto.

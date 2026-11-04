# Privoid-ai/Privoid-FactCheck-Qwen3.5-2B-GGUF

## Resumen

Privoid-FactCheck-Qwen3.5-2B-GGUF es la distribucion en formato GGUF para llama.cpp del modelo Privoid-ai/Privoid-FactCheck-Qwen3.5-2B, un verificador de hechos (fact-checker) afinado a partir de la familia Qwen3.5 y orientado a la deteccion de alucinaciones en pipelines de generacion aumentada por recuperacion (RAG). Dado un documento de contexto y una afirmacion, el modelo responde con una de dos etiquetas, `supported` o `unsupported`, lo que lo convierte en una herramienta de clasificacion binaria de groundedness mas que en un generador de texto libre.

El modelo cuenta con 1.942.653.248 parametros reales (alrededor de 2B) y se publica bajo licencia Apache 2.0, con soporte unicamente para ingles. Su interes practico radica en que permite verificar de forma local y offline las respuestas de un LLM contra las fuentes recuperadas, sin enviar documentos sensibles a servicios externos ni incurrir en costes de API. El autor reporta una exactitud balanceada media de 74,7 en el conjunto de test oficial LLM-AggreFact.

Esta ficha cubre la version cuantizada GGUF. El repositorio incluye tres variantes (F16, Q8_0 y Q4_K_M) pensadas para ejecucion en llama.cpp mediante `llama-server`, con soporte de plantillas Jinja para el formato de prompt. El modelo base sin cuantizar se distribuye por separado en Privoid-ai/Privoid-FactCheck-Qwen3.5-2B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5, segun el nombre del modelo; detalles de capas y atencion no disponibles) |
| Parametros totales | 1.942.653.248 (aprox. 2B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q4_K_M (GGUF) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base se distribuye en safetensors segun los metadatos de parametros |
| Tarea (pipeline) | text-classification (verificacion de hechos binaria) |
| Tamano del repositorio | 7,3 GB |
| Modelo base | Privoid-ai/Privoid-FactCheck-Qwen3.5-2B |
| Fecha de publicacion | 2026-11-04 |

## Arquitectura y entrenamiento

El modelo es un ajuste fino (fine-tuning) del checkpoint Privoid-ai/Privoid-FactCheck-Qwen3.5-2B, que a su vez parte de la arquitectura Qwen3.5 de aproximadamente 2B parametros. La model card no detalla el numero de capas, el mecanismo de atencion ni la configuracion del transformer mas alla de la referencia a Qwen3.5, por lo que esos datos deben considerarse no disponibles. La tarea se formula como clasificacion binaria: se presenta un documento y una afirmacion, y el modelo emite `supported` o `unsupported`.

En cuanto al entrenamiento, la model card cita la herramienta Unsloth entre las etiquetas del repositorio, lo que sugiere que el ajuste se realizo con esa libreria, pero no se especifica el volumen de tokens, la composicion del dataset ni si hubo RLHF o DPO. El dato de rendimiento disponible es una exactitud balanceada media de 74,7 sobre el conjunto de test oficial LLM-AggreFact. El autor indica que cada archivo GGUF fue cargado en llama.cpp y respondio correctamente a una afirmacion soportada y otra no soportada antes de su publicacion, como prueba minima de integridad de la cuantizacion.

## Capacidades

- Verificacion de hechos binaria: clasifica una afirmacion como `supported` o `unsupported` respecto a un documento de contexto proporcionado.
- Deteccion de alucinaciones: pensado para validar salidas de LLM contra fuentes recuperadas en pipelines RAG.
- Evaluacion de groundedness: mide si una respuesta esta fundamentada en el material de referencia.
- Clasificacion de texto: la tarea declarada en el pipeline de HuggingFace es text-classification.
- Ejecucion local offline: los pesos GGUF permiten inferencia sin conexion mediante llama.cpp.
- Soporte de plantillas Jinja: el servidor llama.cpp se invoca con `--jinja` para aplicar el formato de prompt del modelo.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que puede servirse mediante la infraestructura de inferencia de HuggingFace.
- No se documentan capacidades de generacion abierta, razonamiento multi-paso, tool calling, vision ni audio; el modelo esta especializado en la tarea de verificacion.

## Casos de uso

- Validacion de respuestas RAG: tras recuperar documentos y generar una respuesta con un LLM, pasar cada afirmacion junto con el fragmento fuente al modelo para marcar las partes no soportadas antes de mostrarlas al usuario.
- Filtrado de alucinaciones en atencion al cliente: verificar que las respuestas automaticas sobre politicas, plazos o condiciones estan respaldadas por la documentacion interna, descartando o reescribiendo las afirmaciones no soportadas.
- Auditoria de resumenes automaticos: comprobar que cada frase de un resumen generado esta respaldada por el texto original, util en entornos legales o financieros donde la trazabilidad es exigible.
- Verificacion en local de documentos sensibles: al ejecutarse offline con llama.cpp, permite comprobar afirmaciones sobre informacion confidencial sin enviar el contenido a APIs de terceros.
- Control de calidad en generacion de articulos: integrar el modelo como paso de validacion en un pipeline editorial que marca frases no respaldadas por las fuentes citadas antes de la publicacion.
- Evaluacion de datasets de QA: usar el modelo para etiquetar pares documento-afirmacion a gran escala y construir o ampliar conjuntos de datos de verificacion de hechos.
- Moderacion de contenido factual: detectar afirmaciones no sustentadas en foros o respuestas generadas, marcandolas para revision humana.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado | Comparativa |
|---|---|---|---|
| LLM-AggreFact (test oficial) | Exactitud balanceada media | 74,7 | La model card principal incluye la comparacion con la leaderboard; los valores concretos de los modelos comparados no estan disponibles en la informacion proporcionada |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estandar para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4,2 GB para F16, 2,3 GB para Q8_0 y 1,5 GB para Q4_K_M, considerando el tamano de los archivos mas la sobrecarga del contexto y del runtime de llama.cpp.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM para Q4_K_M; 6-8 GB para Q8_0; 8 GB o mas para F16. En el segmento profesional, A100, H100 o L40S ofrecen amplio margen y permiten mayor paralelismo.
- Cabe en GPU consumer: si, en tarjetas como RTX 3060 (12 GB), RTX 4060, RTX 4070 o superiores; las variantes Q4_K_M y Q8_0 son las mas adecuadas para equipos modestos.
- Opciones de despliegue: llama.cpp mediante `llama-server -hf Privoid-ai/Privoid-FactCheck-Qwen3.5-2B-GGUF:Q8_0 --jinja`, ademas de los endpoints compatibles de HuggingFace; no se documenta soporte explicito para vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| Privoid-FactCheck-Qwen3.5-2B-GGUF | ~2B (1.942.653.248) | no disponible | Verificacion de hechos binaria | Apache 2.0 | GGUF |
| Privoid-FactCheck-Qwen3.5-2B (base) | ~2B | no disponible | Verificacion de hechos binaria | Apache 2.0 | safetensors |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de otros modelos de verificacion de hechos directamente comparables en parametros, contexto y licencia.

## Limitaciones y advertencias

- Solo soporta ingles; las afirmaciones y documentos en otros idiomas, incluido el castellano, no estan cubiertos por el modelo.
- La exactitud balanceada media de 74,7 en LLM-AggreFact implica que una parte significativa de las clasificaciones puede ser erronea; no debe usarse como unica barrera de validacion en produccion.
- El modelo clasifica afirmaciones contra un documento de contexto; si el documento no contiene la informacion necesaria, la etiqueta `unsupported` no distingue entre falsedad y falta de evidencia.
- No se documentan sesgos conocidos ni el volumen y composicion de los datos de entrenamiento, lo que limita la evaluacion de riesgos de dominio.
- La longitud de contexto no esta especificada; documentos muy largos pueden requerir truncado o fragmentacion, con riesgo de perder evidencia relevante.
- Licencia Apache 2.0: permite uso comercial, pero el modelo deriva de Qwen3.5, por lo que conviene revisar las condiciones de la familia base antes de su explotacion.
- El modelo esta afinado para una tarea de clasificacion; no debe esperarse de el generacion de texto abierta ni razonamiento conversacional general.
- La model card advierte de que la comparacion con la leaderboard y las limitaciones detalladas se encuentran en la pagina principal del modelo base, no en esta ficha GGUF.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Privoid-ai/Privoid-FactCheck-Qwen3.5-2B-GGUF
- Modelo base: https://huggingface.co/Privoid-ai/Privoid-FactCheck-Qwen3.5-2B
- Benchmark LLM-AggreFact: no disponible como enlace en la informacion proporcionada
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada

# ameliakartika/indonesian-legal-ai-assistant-gemma-2b

## Resumen

`ameliakartika/indonesian-legal-ai-assistant-gemma-2b` es un ajuste fino (fine-tuning) del modelo `unsloth/gemma-2b-it-bnb-4bit`, que a su vez es la version instructiva de Gemma 2B de Google cuantizada a 4 bits con bitsandbytes. El autor del ajuste es el usuario de HuggingFace `ameliakartika` y lo ha publicado bajo licencia Apache-2.0. Por nombre y por el identificador del repositorio, el objetivo declarado es construir un asistente para consultas legales en indonesio, aunque la model card no documenta ni el conjunto de datos ni el procedimiento de entrenamiento.

El modelo base Gemma 2B es un transformer decoder-only de aproximadamente 2.000 millones de parametros, con una ventana de contexto de 8.192 tokens y un vocabulario SentencePiece de 256.000 entradas. Es un modelo pequeno, pensado para ejecutarse en hardware de consumo, lo que lo hace atractivo para prototipos de dominio especifico mediante LoRA o QLoRA. En este caso, el ajuste se realizo con la libreria Unsloth, que acelera el entrenamiento aproximadamente 2x y reduce el consumo de memoria frente a implementaciones estandar.

La relevancia de esta ficha es limitada pero ilustrativa: se trata de un ejemplo tipico de fine-tuning comunitario de bajo coste sobre un modelo pequeno, con documentacion minima, cero descargas y cero valoraciones en el momento de la consulta. El repositorio ocupa 0,1 GB, un tamano compatible con un adaptador LoRA en lugar de pesos completos, aunque la model card no lo confirma. Sirve sobre todo como caso de estudio sobre que verificar antes de reutilizar un modelo de dominio legal publicado sin evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma); no se documentan cambios estructurales en el ajuste |
| Parametros totales | Aproximadamente 2.000 millones (heredados del modelo base Gemma 2B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 8.192 tokens (especificacion publica de Gemma 2B); no confirmada explicitamente para este ajuste |
| Tipos de cuantizacion | Modelo base en 4 bits (bitsandbytes); no se documentan cuantizaciones publicadas del ajuste |
| Idiomas soportados | en, segun la model card; el nombre del repositorio sugiere indonesio, pero no esta documentado |
| Licencia | apache-2.0 (declarada en el repositorio; el modelo base Gemma esta sujeto a los Gemma Terms of Use, ver limitaciones) |
| Formato de pesos | safetensors |
| Libreria de publicacion | transformers (tags: text-generation-inference, unsloth, trl) |
| Tamano del repositorio | 0,1 GB |
| Modelo base | unsloth/gemma-2b-it-bnb-4bit |
| Fecha de publicacion | 2026-09-14 (segun metadatos de HuggingFace) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre el entrenamiento de este ajuste: la model card no especifica el numero de tokens, la composicion del dataset, la existencia de RLHF o DPO, ni la configuracion de hiperparametros. Lo unico documentado es que el entrenamiento se realizo con Unsloth, que el autor declara un entrenamiento "2x mas rapido" respecto a una implementacion estandar, y que el punto de partida es `unsloth/gemma-2b-it-bnb-4bit`, es decir, un Gemma 2B instruction-tuned ya cuantizado a 4 bits. El ajuste fino sobre un base cuantizado a 4 bits es una practica habitual en QLoRA, pero puede introducir degradacion adicional y complica la fusion (merge) de los adaptadores con los pesos originales.

Respecto a la arquitectura heredada, Gemma 2B es un transformer decoder-only de 18 capas, con dimension oculta de 2.048, 8 cabezas de atencion y 1 cabeza de clave/valor (atencion multi-query), dimension de cabeza de 256, tamano intermedio de 16.384 y vocabulario de 256.000 tokens. Emplea normalizacion RMSNorm, activaciones GeGLU y embeddings rotatorios (RoPE), con un contexto maximo de 8.192 tokens. Segun el informe tecnico de Gemma, la variante de 2B se entreno sobre aproximadamente 2 billones de tokens, con un sesgo claro hacia el ingles. No se ha documentado ninguna innovacion tecnica propia de este ajuste concreto.

## Capacidades

- Generacion de texto conversacional en ingles, heredada de Gemma 2B IT.
- El proposito declarado por el nombre del repositorio es la asistencia en consultas legales en indonesio, pero no hay evidencia publicada que lo respalde ni que documente la cobertura de ese dominio.
- Razonamiento basico y respuesta a instrucciones, con el techo propio de un modelo de 2.000 millones de parametros.
- Generacion de codigo y matematicas simples: posible en un modelo de este tamano, sin datos de evaluacion disponibles.
- Soporte de tool calling / function calling: no documentado; no forma parte de las capacidades declaradas de Gemma 2B IT.
- Soporte de agentes y razonamiento multi-paso: no documentado y poco realista en un modelo de este tamano sin ingenieria de prompting especifica.
- Capacidades multilingues: la model card declara unicamente ingles; no hay evidencia de soporte de indonesio ni de otros idiomas.
- Capacidades especiales (vision, audio, modo thinking): no disponibles.

## Casos de uso

- Prototipado rapido de un asistente legal en indonesio: es el caso de uso que sugiere el nombre del repositorio. Serviria para validar una interfaz conversacional y medir si el modelo produce respuestas plausibles antes de invertir en un modelo mayor, dado su tamano reducido y su bajo coste de inferencia.
- Generacion de borradores y plantillas de documentos juridicos sencillos: el modelo puede redactar esqueletos de contratos, cartas o clausulas que un profesional revisaria despues. Apropiado por coste, no por fiabilidad.
- Resumen de textos legales cortos: con 8.192 tokens de contexto se pueden resumir contratos o articulos de extension moderada en una sola pasada, siempre con revision humana.
- Clasificacion y etiquetado de documentos juridicos: categorizar consultas por area del derecho, detectar clausulas de riesgo o separar documentos por tipo, como tarea de apoyo en un pipeline mayor.
- Base para un fine-tuning posterior: al ser un modelo pequeno con licencia permisiva declarada, sirve como punto de partida para experimentos de QLoRA con presupuesto de GPU muy limitado (una unica GPU de 8-12 GB).
- Entorno educativo y de investigacion: permite estudiar el comportamiento de un modelo de 2B ajustado a un dominio especializado, los efectos de ajustar sobre un base ya cuantizado y la calidad de los datos necesarios para ello.
- Extraccion de informacion estructurada de texto legal: convertir fragmentos de normativa en campos estructurados (partes, fechas, obligaciones), siempre que se valide con reglas y esquemas externos, ya que un modelo de 2B alucina con facilidad en tareas de extraccion precisa.
- Asistente de FAQ sobre normativa concreta: desplegado con recuperacion aumentada (RAG) sobre una base documental cerrada, limitando el modelo a reformular y citar el contexto recuperado.

En todos los casos conviene tratar la salida como borrador no verificado. No existen evaluaciones publicadas que respalden ningun uso en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, MT-Bench ni ningun otro conjunto de evaluacion, ni para el ajuste ni para su comparacion con el modelo base. Tampoco hay metricas de perdida de validacion, tasas de alucinacion o evaluaciones humanas.

## Requisitos de hardware

Las siguientes cifras son estimaciones derivadas del tamano del modelo base; no proceden de mediciones publicadas por el autor.

- VRAM para pesos en FP16: aproximadamente 5 GB (2.000 millones de parametros x 2 bytes) mas cache KV.
- VRAM para pesos en 8 bits: aproximadamente 2,5 GB mas cache KV.
- VRAM para pesos en 4 bits: aproximadamente 1,4-1,6 GB mas cache KV.
- Cache KV: con 18 capas, 1 cabeza KV, dimension de cabeza 256 y precision FP16, el consumo ronda los 18 KB por token, es decir, unos 150 MB para los 8.192 tokens de contexto completo. Es una cifra muy manejable.
- GPU de consumo: cabe con holgura en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090, incluso en FP16. En GPUs de 8 GB es recomendable cuantizar a 8 o 4 bits para dejar margen al cache KV.
- GPU de datacenter: A100, H100, L40S y similares solo tendrian sentido por agregacion de muchas peticiones concurrentes, no por requisitos de memoria.
- CPU: la inferencia en CPU es viable para uso interactivo gracias al reducido tamano, pero el repositorio no publica pesos en GGUF, por lo que habria que convertirlos.
- Opciones de despliegue: transformers como via principal (es la libreria declarada), TGI (el repositorio esta etiquetado como compatible con text-generation-inference), vLLM, y Ollama o llama.cpp previa conversion a GGUF.
- Latencia y throughput: no hay mediciones publicadas. En una GPU de consumo es razonable esperar decenas a más de cien tokens por segundo con un modelo de 2B en 4 bits, pero se trata de una estimacion no verificada.

## Comparativa con modelos similares

No hay datos de rendimiento publicados para este ajuste, por lo que la comparacion se limita a parametros, contexto, licencia y disponibilidad. Los datos de los modelos alternativos proceden de sus especificaciones publicas.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| indonesian-legal-ai-assistant-gemma-2b | ~2B | 8.192 tokens (heredado) | apache-2.0 declarada | HuggingFace, 0 descargas | Sin benchmarks ni documentacion de datos |
| Gemma 2B IT (base) | ~2B | 8.192 tokens | Gemma Terms of Use | HuggingFace, ampliamente usado | Punto de partida del ajuste; multilingue limitado |
| Qwen2.5-1.5B-Instruct | ~1,5B | 32.768 tokens | Apache-2.0 | HuggingFace | Contexto mucho mayor y soporte multilingue amplio, incluido indonesio |
| Llama 3.2 1B Instruct | ~1,2B | 128.000 tokens | Llama 3.2 Community License | HuggingFace | Contexto muy superior; licencia no Apache |
| Phi-3 Mini | ~3,8B | 128.000 tokens | MIT | HuggingFace | Mayor capacidad de razonamiento a costa de mas VRAM |

La ventaja competitiva de este ajuste frente a esas alternativas no esta demostrada. Para un asistente legal en indonesio, Qwen2.5-1.5B-Instruct o Qwen2.5-3B-Instruct parten de un soporte multilingue declarado y un contexto varias veces mayor, lo que los hace candidatos mas razonables a priori.

## Limitaciones y advertencias

- Documentacion practicamente inexistente: la model card no describe el dataset de entrenamiento, el numero de tokens, los hiperparametros ni el metodo de ajuste. Es imposible reproducir el resultado a partir de lo publicado.
- Cero validacion externa: el repositorio tiene 0 descargas y 0 valoraciones en el momento de la consulta, y no se ha publicado ningun benchmark. Cualquier uso en produccion seria una apuesta no respaldada.
- Contradiccion entre nombre e idioma declarado: el repositorio se llama "indonesian-legal-ai-assistant", pero la model card declara unicamente `en` como idioma. Si el ajuste se hizo realmente sobre datos en indonesio, el soporte no esta documentado; si no, el nombre es enganoso.
- Riesgo de alucinacion elevado en dominio juridico: un modelo de 2.000 millones de parametros ajustado sobre datos no verificados puede inventar articulos, plazos y jurisprudencia con total seguridad aparente. En asesoramiento legal, la supervision humana experta es obligatoria.
- Degradacion por doble cuantizacion: el ajuste parte de un modelo ya cuantizado a 4 bits, lo que puede acumular perdida de calidad y complica la fusion de los adaptadores con los pesos originales.
- Ambiguedad de licencia: el repositorio declara Apache-2.0, pero los pesos base de Gemma estan sujetos a los Gemma Terms of Use de Google. Declarar una licencia distinta sobre un derivado no elimina automaticamente las obligaciones del modelo original. Es imprescindible revisar los terminos de Gemma antes de un uso comercial.
- Formato y despliegue: el repositorio esta en safetensors y no ofrece pesos GGUF, por lo que el uso en llama.cpp u Ollama requiere conversion previa.
- Tamano del repositorio (0,1 GB): es coherente con un adaptador LoRA, no con pesos completos de 2B en ningun formato. La model card no aclara si se publican adaptadores o pesos fusionados, lo que puede provocar errores de carga si se espera un modelo completo.
- Sesgos: no se ha realizado ninguna evaluacion de sesgo, toxicidad o equidad. El modelo base hereda los sesgos de su corpus de entrenamiento, mayoritariamente en ingles.
- Limitaciones del modelo base: 8.192 tokens de contexto, sin soporte nativo de tool calling y sin modo de razonamiento extendido. El techo de razonamiento de un 2B limita tareas juridicas complejas.
- Fecha de publicacion inusual en los metadatos (2026-09-14) y ausencia de historial de versiones, lo que sugiere una publicacion automatizada o de prueba.
- Sin garantias: al ser un modelo pequeno ajustado sobre datos opacos, no debe utilizarse como fuente de informacion legal, sino como herramienta de borrador bajo supervision profesional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ameliakartika/indonesian-legal-ai-assistant-gemma-2b
- Modelo base: https://huggingface.co/unsloth/gemma-2b-it-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Informe tecnico de Gemma (Google, arXiv:2403.08295): https://arxiv.org/abs/2403.08295
- Coleccion de Gemma en HuggingFace: https://huggingface.co/google/gemma-2b
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms

# orcarouter/Hy-MT3-30B-A3B-abliterated-GGUF

## Resumen

Hy-MT3-30B-A3B-abliterated-GGUF es una cuantizacion en formato GGUF del modelo de traduccion automatica Hy-MT3-30B-A3B desarrollado originalmente por Tencent, publicada por el usuario orcarouter en Hugging Face. El modelo base es un transformer de tipo Mixture of Experts (MoE) con 30.064.725.888 parametros totales y un diseno pensado especificamente para traduccion multilingue, segun indica el pipeline declarado. Esta version concreta aplica una tecnica de "abliteration" (eliminacion o atenuacion de los mecanismos de rechazo aprendidos por alineamiento) y se distribuye en cuantizacion GGUF con mezcla de precisiones e imatrix, orientada a inferencia local con llama.cpp.

La relevancia de esta ficha radica en que combina tres elementos poco habituales: un modelo de traduccion de gran escala con arquitectura MoE, una variante "uncensored" que modifica el comportamiento de seguridad del modelo original, y un empaquetado GGUF optimizado para ejecucion en hardware de consumo. El acceso al repositorio esta restringido (gated), por lo que es necesario aceptar condiciones en Hugging Face antes de descargar los pesos. La licencia declarada es Apache 2.0.

Conviene senalar desde el principio que la informacion disponible en la ficha de Hugging Face es limitada: no se publican detalles sobre el dataset de entrenamiento, el proceso de alineamiento, resultados de benchmarks ni especificaciones de contexto. Esta ficha refleja unicamente lo que consta en los metadatos del repositorio y marca explicitamente como "no disponible" todo aquello que no se ha podido verificar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE), segun tags `moe` y modelo base Hy-MT3; detalles internos no disponibles |
| Parametros totales | 30.064.725.888 (30B) |
| Parametros activos | no disponible (el sufijo A3B sugiere ~3B activos, pero no se confirma en la informacion proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con mezcla de precisiones (mixed-precision) e imatrix; niveles concretos no disponibles |
| Idiomas soportados | Mas de 100 idiomas, entre ellos zh, en, es, fr, de, it, pt, ru, ja, ko, ar, hi, tr, vi, th, id, nl, pl, uk, y otros hasta completar la lista de tags (incluye lenguas de bajos recursos como ceb, war, ckb, ug, bo, yue) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (compatible con llama.cpp) |

## Arquitectura y entrenamiento

El modelo base, tencent/Hy-MT3-30B-A3B, es un transformer con arquitectura Mixture of Experts de 30B parametros totales, disenado para traduccion automatica multilingue. El sufijo "A3B" del nombre sugiere aproximadamente 3.000 millones de parametros activos por token, un patron habitual en disenos MoE que buscan reducir el coste computacional de inferencia manteniendo una capacidad de representacion propia de un modelo de 30B. Sin embargo, la informacion proporcionada no confirma explicitamente esta cifra ni detalla el numero de expertos, la estrategia de enrutamiento ni la dimension oculta.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otro tipo de alineamiento. La variante "abliterated" implica que se ha modificado el modelo para atenuar las direcciones de activacion asociadas a rechazos de seguridad, un procedimiento que suele aplicarse mediante intervenciones sobre los pesos o las activaciones. Esta modificacion se realizo presumiblemente sobre el modelo base antes de la cuantizacion, aunque el repositorio no documenta el procedimiento exacto. La cuantizacion emplea mezcla de precisiones guiada por imatrix (importance matrix), una tecnica que asigna distintos niveles de cuantizacion a diferentes tensores segun su sensibilidad, con el objetivo de preservar calidad en los pesos mas criticos.

## Capacidades

- Traduccion automatica multilingue entre mas de 100 idiomas, incluyendo pares con lenguas de bajos recursos (cebuano, waray, kurdo sorani, uigur, tibetano, cantonés, entre otras).
- Generacion de texto conversacional, segun el tag `conversational` del repositorio.
- Formato compatible con endpoints de inferencia estandar (tag `endpoints_compatible`).
- Ejecucion local mediante llama.cpp gracias al formato GGUF.
- Capacidad de traduccion bidireccional entre las lenguas listadas, aunque el repositorio no detalla la calidad por par de idiomas.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito en la informacion disponible.

## Casos de uso

- Traduccion de documentacion tecnica multilingue: el modelo puede procesar textos largos y traducirlos a decenas de idiomas en una sola pasada, lo que resulta util para equipos que mantienen documentacion en varios idiomas simultaneamente. La arquitectura MoE reduce el coste por token frente a un modelo denso de 30B.
- Localizacion de productos de software: integrado en un pipeline de CI/CD, el modelo puede traducir cadenas de interfaz y ficheros de recursos a los idiomas objetivo antes de cada release, ejecutandose en servidores con GPU de consumo gracias a la cuantizacion GGUF.
- Atencion al cliente en idiomas minoritarios: la cobertura de lenguas poco frecuentes (cebuano, waray, kurdo sorani, etc.) permite atender usuarios que normalmente quedan fuera de los modelos comerciales, traduciendo consultas y respuestas en tiempo real.
- Traduccion de contenido editorial y periodistico: para medios que publican en varios idiomas, el modelo puede generar borradores de traduccion que un editor humano revisa despues, reduciendo el coste frente a la traduccion manual completa.
- Procesamiento de corpus de investigacion multilingue: investigadores que trabajan con datasets en lenguas de bajos recursos pueden usar el modelo para normalizar o traducir textos al ingles o al castellano antes del analisis.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse localmente con llama.cpp, el modelo permite traducir documentos sensibles sin enviarlos a APIs externas, lo que encaja en sectores como salud, legal o administracion publica.
- Experimentacion con modelos "uncensored": investigadores interesados en estudiar el efecto de la abliteration sobre el comportamiento del modelo pueden comparar esta variante con el modelo base original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 28,0 GB, por lo que la cuantizacion principal requiere al menos unos 28-30 GB de VRAM o memoria unificada para cargarse completa. Cuantizaciones mas agresivas (si estan disponibles en el repo) reducirian este requisito, pero no se detallan los niveles concretos.
- GPU recomendadas: para la cuantizacion de ~28 GB, se necesita una GPU con 32 GB o mas, como A100 40GB, H100, RTX A6000 o una configuracion multi-GPU. En GPUs de consumo, solo encajaria en equipos con memoria unificada amplia (por ejemplo, Apple Silicon con 32 GB o mas) o mediante offload parcial a CPU.
- Cabe en consumer GPU: dificil en GPUs dedicadas de consumo (la RTX 4090 tiene 24 GB, insuficiente para la cuantizacion principal). Posible con cuantizaciones mas bajas no confirmadas o con offload parcial.
- Opciones de despliegue: llama.cpp es el runtime nativo del formato GGUF; tambien puede servirse mediante Ollama si se importa el modelo, o con servidores compatibles con llama.cpp. vLLM y TGI no soportan GGUF de forma nativa en todos los casos, por lo que no se recomiendan sin conversion previa.
- Latencia y throughput: no disponibles. La arquitectura MoE con ~3B parametros activos (segun el sufijo del nombre) sugeriria una velocidad de generacion superior a la de un modelo denso de 30B, pero no hay mediciones publicadas en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Hy-MT3-30B-A3B-abliterated-GGUF (este) | 30B totales, ~3B activos (segun nombre) | no disponible | Apache 2.0 | GGUF | Traduccion multilingue, variante abliterated, acceso gated |
| tencent/Hy-MT3-30B-A3B (base) | 30B totales | no disponible | Apache 2.0 (segun este repo) | safetensors | Modelo original sin abliteration; referencia para comparar el efecto de la modificacion |
| NLLB-200 (Meta) | 54B (variante densa) / 600M-3.3B (variantes menores) | 512 tokens | CC-BY-NC 4.0 | safetensors, GGUF | Traduccion a 200 idiomas; licencia no comercial en la variante grande |
| M2M-100 (Meta) | 418M-12B | 1024 tokens | MIT | safetensors | Traduccion directa entre 100 idiomas sin pivotar por ingles |

La comparativa se limita a lo que se puede inferir de la informacion disponible; no se dispone de datos de rendimiento que permitan una comparacion cuantitativa con NLLB-200 o M2M-100.

## Limitaciones y advertencias

- El repositorio esta restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar los pesos, lo que puede limitar el uso automatizado en pipelines.
- La variante "abliterated" elimina o atenua los rechazos de seguridad del modelo original; esto puede producir respuestas a solicitudes que el modelo base rechazaria, con los riesgos asociados en produccion (contenido danino, sesgos, etc.).
- No se documentan los sesgos conocidos del modelo base ni el efecto de la abliteration sobre ellos; se recomienda evaluacion propia antes de desplegar en contextos sensibles.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; como todo modelo generativo, puede producir traducciones incorrectas o inventar contenido, especialmente en lenguas de bajos recursos.
- No se especifica la longitud de contexto soportada, lo que impide planificar el tamano de los documentos a traducir por pasada.
- La calidad de traduccion por par de idiomas no esta documentada; la lista de idiomas en los tags no garantiza un rendimiento uniforme.
- La licencia Apache 2.0 permite uso comercial, pero al tratarse de una modificacion de un modelo de Tencent, conviene verificar que la licencia del modelo base se mantiene y que la abliteration no introduce restricciones adicionales.
- El autor del repositorio (orcarouter) no es el desarrollador original; la trazabilidad del proceso de cuantizacion y abliteration no esta documentada.
- No hay descargas ni likes registrados en el momento de la consulta, lo que sugiere que el modelo no ha sido validado por la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/orcarouter/Hy-MT3-30B-A3B-abliterated-GGUF
- Modelo base: https://huggingface.co/tencent/Hy-MT3-30B-A3B
- No se han encontrado en la informacion proporcionada papers, blogs, repositorios de codigo ni demos adicionales.

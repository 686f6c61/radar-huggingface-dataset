# jsantillana/glm-4.7-flash-abliterated-fix3-GGUF

## Resumen

GLM-4.7-Flash Abliterated Fix3 es una variante del modelo GLM-4.7-Flash de Zhipu AI (Z.ai) a la que se le ha aplicado una técnica de *abliteration*: una modificación quirúrgica de los pesos que elimina el comportamiento de rechazo aprendido durante el alineamiento, de modo que el modelo responde a peticiones que la versión base denegaría. Esta versión concreta, publicada por el usuario `jsantillana`, es la tercera iteración de un ajuste ("Fix3") que busca reducir el daño colateral en las capacidades normales del modelo. Se distribuye en formato GGUF cuantizado para inferencia local.

El modelo tiene 31.221.488.576 parámetros (unos 31,2 mil millones, según los safetensors del repositorio original) y se ofrece en tres cuantizaciones GGUF (Q3_K_M, Q4_K_M y Q8_0), con un repositorio de 67,1 GB. La relevancia de esta ficha es doble: por un lado, documenta un caso de estudio de *abliteration* con métricas de éxito declaradas por el autor (reducción de rechazos del 35,9 % al 6,9 % en inglés y del 8,9 % al 1,9 % en español, sin colateral declarado); por otro, advierte de que se trata de un modelo explícitamente restringido a investigación en seguridad defensiva y no apto para producción.

La información disponible es escasa: la model card del repositorio GGUF remite a la del repositorio padre y no incluye arquitectura detallada, datos de entrenamiento, benchmarks estándar ni lista de idiomas. Esta ficha refleja únicamente lo que consta en la información proporcionada, marcando como "no disponible" todo aquello que no se puede verificar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base GLM-4.7-Flash, arquitectura no detallada en la informacion) |
| Parametros totales | 31.221.488.576 (31,2 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q3_K_M, Q4_K_M y Q8_0 |
| Idiomas soportados | no disponible (la evaluacion de abliteration reporta metricas en ingles y espanol) |
| Licencia | apache-2.0-restricted-research (licencia "other" con nombre personalizado) |
| Formato de pesos | GGUF (repositorio original en safetensors) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base GLM-4.7-Flash en la documentacion proporcionada (si es transformer denso, MoE o hibrido, ni el detalle de capas y atencion). El dato verificable es el recuento de parametros de los safetensors del repositorio original: 31.221.488.576.

Lo que si documenta el autor es el procedimiento de *abliteration* aplicado: una intervencion de rango 2 con modo dual `[r_direct, r_think]`, actuando sobre las capas L20 a L45, con aplicacion a los `shared_experts` con un factor de 0,5α. El objetivo declarado es eliminar la direccion de rechazo del espacio de activaciones sin degradar el resto de capacidades. La iteracion "Fix3" reporta una tasa de rechazo (OFF) del 6,9 % en ingles (frente al 35,9 % del modelo base) y del 1,9 % en espanol (frente al 8,9 %), con un 0 % de dano colateral medido en las categorias DEF/GRIS/SOC. No se detallan los datasets de calibracion ni el volumen de datos usados en el proceso.

## Capacidades

- Generacion de texto conversacional: el modelo esta etiquetado como "conversational" y mantiene el comportamiento del GLM-4.7-Flash base.
- Respuesta a peticiones que el modelo base rechaza: es la funcion principal de la variante abliterada, orientada a investigacion en seguridad defensiva.
- Capacidades multilingues: la evaluacion del autor incluye metricas separadas en ingles y espanol, lo que sugiere competencia en ambos idiomas, aunque no se publica una lista oficial de idiomas.
- Razonamiento y codigo: no se documentan explicitamente en la informacion disponible; se asumen heredadas del modelo base, pero no se puede confirmar.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades especiales (vision, audio, thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion en seguridad de IA (red teaming): el modelo permite estudiar que tipos de peticiones generan contenido danino y como varian las tasas de rechazo entre el modelo base y la variante abliterada, usando las metricas OFF reportadas (35,9 % → 6,9 % en ingles) como linea base.
- Evaluacion de robustez de filtros de contenido: desplegar el modelo contra un clasificador de seguridad propio para medir falsos negativos y calibrar umbrales antes de aplicar el filtro a un modelo en produccion.
- Analisis de alineamiento comparado: comparar respuestas del modelo base y del abliterado sobre el mismo conjunto de prompts para estudiar que direcciones de activacion codifican el rechazo (metodologia de rango 2 sobre L20-L45 descrita por el autor).
- Investigacion academica sobre *abliteration*: reproducir o contrastar la tecnica con modo dual `[r_direct, r_think]` y el factor 0,5α sobre `shared_experts`, midiendo el compromiso entre supresion de rechazo y dano colateral.
- Pruebas de estres de sistemas de moderacion en espanol: la metrica ES:OFF (8,9 % → 1,9 %) permite validar moderadores especificos para castellano, un idioma con menos cobertura en estos estudios.
- Entorno de laboratorio aislado: ejecutar el modelo en GGUF con llama.cpp u Ollama en una maquina sin acceso a red para experimentos controlados, dada la licencia restringida a investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor solo reporta metricas internas de la abliteration:

| Metrica | Modelo base | Fix3 | Colateral (DEF/GRIS/SOC) |
|---|---|---|---|
| Tasa de rechazo en ingles (EN:OFF) | 35,9 % | 6,9 % | 0 % |
| Tasa de rechazo en espanol (ES:OFF) | 8,9 % | 1,9 % | 0 % |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; como referencia orientativa, un modelo de 31,2 B en Q4_K_M ocupa del orden de 18-20 GB de pesos, en Q8_0 alrededor de 33 GB y en Q3_K_M en torno a 13-14 GB, a lo que hay que sumar el contexto y el overhead del runtime (cifras estimadas, no publicadas por el autor).
- GPU recomendadas: no disponible en la informacion proporcionada.
- Cabe en GPU de consumo: previsiblemente si en Q3_K_M y Q4_K_M en tarjetas con 24 GB de VRAM (por ejemplo, RTX 3090 o RTX 4090), aunque el autor no lo confirma.
- Opciones de despliegue: llama.cpp, Ollama y cualquier runtime compatible con GGUF; el tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo OpenAI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| GLM-4.7-Flash Abliterated Fix3 (este) | 31,2 B | no disponible | apache-2.0-restricted-research | GGUF en HF |
| GLM-4.7-Flash (base) | 31,2 B (segun repo padre) | no disponible | no disponible en esta ficha | HF (repo de Zhipu AI) |
| Otras variantes abliteradas de la familia GLM-4.7-Flash | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo ni de modelos alternativos documentados en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo abliterado: responde a peticiones que el modelo base rechaza; el autor lo restringe explicitamente a investigacion en seguridad defensiva y lo declara no apto para produccion.
- Licencia restrictiva: `apache-2.0-restricted-research` no es la licencia Apache 2.0 estandar; el uso comercial no esta autorizado segun la model card, y conviene revisar los terminos exactos antes de cualquier despliegue.
- Riesgo elevado de contenido danino: al eliminar el rechazo, aumenta la probabilidad de generar instrucciones o material sensible; requiere aislamiento y supervision humana.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero inherente a los modelos de lenguaje de este tamano.
- Dano colateral no verificado de forma independiente: el 0 % reportado en DEF/GRIS/SOC es una metrica del propio autor, sin validacion externa publicada.
- Idiomas y contexto no documentados: no hay lista oficial de idiomas ni longitud de contexto confirmada en la informacion disponible.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni de validacion por terceros.
- Los tamanos de los ficheros GGUF no constan en la model card (aparecen como "—").

## Enlaces

- Repositorio GGUF: https://huggingface.co/jsantillana/glm-4.7-flash-abliterated-fix3-GGUF
- Repositorio padre (model card completa, metodologia y resultados): https://huggingface.co/jsantillana/glm-4.7-flash-abliterated-fix3
- Modelo base GLM-4.7-Flash de Zhipu AI: no disponible en la informacion proporcionada
- Paper o blog de la tecnica de abliteration: no disponible en la informacion proporcionada

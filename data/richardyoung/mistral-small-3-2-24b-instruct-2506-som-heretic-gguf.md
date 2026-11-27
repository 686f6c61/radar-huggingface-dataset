# richardyoung/Mistral-Small-3.2-24B-Instruct-2506-SOM-heretic-GGUF

## Resumen

Mistral-Small-3.2-24B-Instruct-2506-SOM-heretic-GGUF es una cuantizacion en formato GGUF de un modelo derivado de Mistral Small 3.2 24B Instruct (version 2506), publicado por el usuario richardyoung en Hugging Face. El modelo base intermedio, richardyoung/Mistral-Small-3.2-24B-Instruct-2506-SOM-heretic, aplica una tecnica de "abliteration" (eliminacion de rechazos o capas de alineacion) sobre el modelo original de Mistral AI, con el objetivo de producir un modelo "uncensored" orientado a investigacion. La variante SOM del nombre alude a una modificacion adicional no documentada en la informacion disponible.

El modelo conserva la arquitectura y el tamano del Mistral Small 3.2 original: aproximadamente 23.570 millones de parametros (23,57B), lo que lo situa en la gama de modelos densos de talla media-alta aptos para despliegue en una sola GPU de 80 GB o en configuraciones multi-GPU consumer. Esta version GGUF esta pensada para inferencia con llama.cpp y Ollama, con cuantizaciones generadas mediante imatrix, lo que facilita su ejecucion en hardware local sin necesidad de infraestructura de servidor dedicada.

La relevancia de esta ficha radica en su caracter de modelo derivado no oficial: no es un lanzamiento de Mistral AI, sino una modificacion de la comunidad con fines de investigacion sobre alineacion y comportamiento. Su licencia Apache 2.0 heredada del modelo original permite uso comercial segun los terminos de dicha licencia, aunque el acceso al repositorio esta restringido (gated) y requiere aceptar condiciones en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Mistral Small 3.2) |
| Parametros totales | 23.572.403.200 (23,57B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | GGUF con imatrix (variantes concretas no detalladas en la informacion disponible) |
| Idiomas soportados | en (ingles declarado en la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Mistral Small 3.2 24B Instruct, un transformer denso de aproximadamente 23,57 mil millones de parametros. La informacion disponible no detalla la configuracion interna (numero de capas, dimensiones de atencion, tipo de atencion, uso de sliding window attention u otras innovaciones del modelo original). Tampoco se especifican los datos de entrenamiento del modelo base ni del derivado: numero de tokens, composicion del dataset, fases de RLHF, DPO o similares no estan documentados en la informacion proporcionada.

La modificacion principal respecto al modelo original es la aplicacion de una tecnica de "abliteration" (denominada heretic en el nombre del repositorio), que busca eliminar o reducir los comportamientos de rechazo aprendidos durante el alineamiento. Esta tecnica suele consistir en identificar direcciones en el espacio de activaciones asociadas a la negativa a responder y proyectarlas fuera, aunque los detalles concretos del procedimiento aplicado por richardyoung no se detallan en la informacion disponible. La cuantizacion GGUF se ha realizado con imatrix, un metodo que calibra los factores de cuantizacion usando un dataset de calibracion para preservar mejor la calidad en precisiones reducidas.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo Instruct original.
- Razonamiento general y respuesta a instrucciones en ingles.
- Generacion de codigo y matematicas (capacidades propias de Mistral Small 3.2, no verificadas especificamente en esta variante).
- Comportamiento "uncensored": el abliteration reduce los rechazos ante peticiones que el modelo original declinaria, orientado a investigacion sobre alineacion y seguridad.
- Compatibilidad con llama.cpp, Ollama y endpoints compatibles (segun los tags del repositorio).
- Soporte de tool calling y function calling: no confirmado en la informacion disponible para esta variante concreta.
- Capacidades de agente y razonamiento multi-paso: no confirmadas en la informacion disponible.
- Capacidades multilingues: la model card solo declara ingles; el soporte de otros idiomas del modelo base no se detalla.
- Vision y audio: no disponibles en esta variante (el modelo es de texto).

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar como el abliteration afecta a la tasa de rechazos y a la calidad de las respuestas, comparando con el Mistral Small 3.2 original en experimentos controlados.
- Evaluacion de robustez de filtros: util para probar sistemas de moderacion y clasificadores de contenido frente a un modelo que responde a peticiones que el original rechazaria, midiendo la eficacia de las capas de seguridad externas.
- Despliegue local en estaciones de trabajo: gracias al formato GGUF y a las cuantizaciones con imatrix, puede ejecutarse con llama.cpp u Ollama en equipos con GPU consumer de gama alta, sin depender de APIs externas.
- Generacion de texto creativo sin restricciones: escritura de ficcion, guiones o narrativa que requiera tematicas que los modelos alineados suelen evitar, siempre con supervision humana y cumplimiento legal.
- Prototipado rapido de asistentes conversacionales: integracion en aplicaciones de chat mediante endpoints compatibles con la API de OpenAI, aprovechando el formato GGUF para entornos de desarrollo con recursos limitados.
- Analisis de sesgos y comportamientos emergentes: estudio de como la eliminacion de capas de rechazo afecta a otros comportamientos del modelo (verbosidad, tono, coherencia) en tareas de evaluacion comparativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; como referencia orientativa para un modelo denso de 23,57B en GGUF, las cuantizaciones de 4 bits suelen requerir en torno a 14-16 GB y las de 8 bits en torno a 25-27 GB, aunque estas cifras no estan confirmadas en la informacion proporcionada.
- GPU recomendadas: no especificadas en la informacion disponible. Por tamano, cabria esperar viabilidad en A100 40/80 GB, H100 y configuraciones multi-GPU consumer, pero no hay datos oficiales.
- Cabe en GPU consumer: no confirmado; dependeria de la cuantizacion concreta y de la VRAM disponible.
- Opciones de despliegue: llama.cpp, Ollama y endpoints compatibles (segun los tags del repositorio). vLLM y TGI no estan confirmados para este formato GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Mistral-Small-3.2-24B-Instruct-2506-SOM-heretic-GGUF (este) | 23,57B | no disponible | apache-2.0 | GGUF | Variante abliterated de comunidad, acceso gated |
| Mistral Small 3.2 24B Instruct (original) | ~24B | no disponible en esta ficha | apache-2.0 | safetensors | Modelo oficial de Mistral AI, alineado |
| Mistral-Small-3.2-24B-Instruct-2506-SOM-heretic (base de este) | 23,57B | no disponible | apache-2.0 | safetensors | Version abliterated sin cuantizar |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada para establecer diferencias cuantitativas entre estas variantes.

## Limitaciones y advertencias

- Modelo derivado no oficial: no ha sido publicado ni validado por Mistral AI; los resultados pueden diferir del modelo original en calidad y coherencia.
- El abliteration puede degradar capacidades: la eliminacion de capas de rechazo suele afectar negativamente a la coherencia, la utilidad general y la seguridad del modelo.
- Riesgo elevado de contenido danino: al reducir los rechazos, el modelo puede generar contenido ofensivo, ilegal o peligroso; requiere filtros externos y supervision en cualquier despliegue.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; los modelos de este tamano pueden inventar hechos, y el abliteration podria agravarlo.
- Idiomas: solo se declara ingles; el rendimiento en castellano no esta verificado.
- Licencia: Apache 2.0 permite uso comercial segun sus terminos, pero el acceso esta restringido (gated) y el uso de un modelo abliterated conlleva responsabilidad legal y reputacional para el desplegador.
- Contexto: la longitud de contexto no esta documentada en la informacion disponible; no asumir la del modelo original sin verificacion.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento en esta variante.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/richardyoung/Mistral-Small-3.2-24B-Instruct-2506-SOM-heretic-GGUF
- Modelo base (safetensors): https://huggingface.co/richardyoung/Mistral-Small-3.2-24B-Instruct-2506-SOM-heretic
- Referencia arXiv citada en los tags: arxiv:2611.17846 (paper no verificado en la informacion disponible)
- Modelo original de Mistral AI: no disponible en la informacion proporcionada

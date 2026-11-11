# elvezjp/DeepSeek-V4.1-Flash-1017-ELVEZ-Q2-ja1-gguf

## Resumen

DeepSeek-V4.1-Flash-1017-ELVEZ-Q2-ja1 es una cuantización GGUF experimental de 2 bits del modelo oficial DeepSeek-V4.1-Flash-1017, publicada por ELVEZ Inc. El único cambio respecto a la cuantización Q2 estándar del mismo autor es el texto de calibración de la imatrix: aproximadamente la mitad corresponde a conversaciones en japonés, construidas a partir del dataset nvidia/Nemotron-Personas-Finance-Japan. El objetivo del experimento era comprobar si la calibración en japonés mejoraba la salida en ese idioma.

El resultado medido no mostró una mejora clara, por lo que el autor mantiene el fichero estándar como versión recomendada y publica este únicamente para que el resultado sea verificable y el fichero reutilizable. Se trata, por tanto, de un artefacto de investigación y no de un modelo recomendado para producción.

Los pesos base suman 754.638.867.584 parámetros (unos 754,6 mil millones) y el repositorio ocupa 366,5 GB. El GGUF resultante contiene 1.046 tensores y los pesos principales que permanecen en memoria rondan los 151,8 GiB. La licencia del modelo base y de esta cuantización es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) y tablas Engram; pesos base DeepSeek-V4.1-Flash-1017 |
| Parametros totales | 754.638.867.584 (754,6 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ2_XXS (gate, up de expertos enrutados), Q2_K (down de expertos enrutados), Q8_0 (proyecciones de atención, expertos compartidos y cabeza de salida), F16/F32 (normas, router y tensores pequeños); tablas Engram en FP8 oficial con sus escalas |
| Idiomas soportados | ja, en |
| Licencia | MIT |
| Formato de pesos | GGUF (layout propio para las tablas Engram, no compatible con GGUF de propósito general) |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos (MoE) de 754,6 mil millones de parámetros totales, del que no se dispone de detalles adicionales sobre número de expertos, dimensión oculta o longitud de contexto en la información proporcionada. Una particularidad estructural es la presencia de tablas Engram, que en esta cuantización se conservan con los valores y escalas FP8 oficiales, empaquetadas al final del fichero.

El proceso de cuantización lo realizó ELVEZ con el conversor `deepseek41_quantize.py` de IXV, importado de `antirez/ds4 gguf-tools` (MIT), partiendo directamente de los safetensors oficiales (revisión `1bae0e1088993b9b82de08f59de5be5a34e42170`) y no de una recuantización del primer fichero. La imatrix se recogió sobre una primera conversión no cuantizada con imatrix, con 8.192 tokens de calibración: 23 conversaciones (4.059 tokens) del subconjunto original —código, tool calls, razonamiento, prosa multilingüe y traducción— y 22 conversaciones (4.133 tokens) en japonés, alternadas de forma que los primeros 8.192 tokens son mitad japonés. Las conversaciones japonesas se generaron con semilla fija a partir de nueve campos de persona del dataset Nemotron-Personas-Finance-Japan (finanzas, comportamiento financiero, preocupaciones económicas, ocupación, deportes, arte, viajes, cocina y perfil general), cada uno con una petición distinta (consejo doméstico, resumen, preguntas de entrevista, perfil interno, tabla de plan semanal, correo de presentación, itinerario de viaje, menú y traducción al inglés), con modo thinking activado en 9 casos y desactivado en 13.

El efecto medible de esta calibración fue un aumento de la cobertura de expertos enrutados observados por la imatrix: de 14.931/15.360 (97,21%) en la versión estándar a 15.112/15.360 (98,39%) en esta. La conversión final tardó 66,5 minutos en un M3 Ultra con 24 hilos. No se dispone de información sobre el entrenamiento original del modelo base (número de tokens, composición del dataset, RLHF/DPO).

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base DeepSeek-V4.1-Flash-1017, si bien la cuantización agresiva a 2 bits puede degradarlas.
- Modo thinking: el autor documenta el uso de conversaciones con thinking activado y desactivado durante la calibración, lo que indica soporte de modo de razonamiento explícito.
- Tool calling: el conjunto de calibración incluye tool calls, lo que sugiere soporte en el modelo base.
- Capacidades multilingües: japonés e inglés declarados; el resto de idiomas no está garantizado.
- Visión: el repositorio estándar del mismo autor incluye ficheros Vision que, según la model card, funcionan también con este fichero, aunque no se probaron con él.
- DSpark: el fichero DSpark del repositorio estándar es compatible y se utilizó en la evaluación del autor.
- No se dispone de información sobre capacidades de agentes multi-paso, matemáticas o audio más allá de lo heredado del modelo base.

## Casos de uso

- Investigación sobre cuantización e imatrix: este fichero permite reproducir y verificar el experimento de calibración mixta inglés/japonés y comparar la cobertura de expertos frente a la versión estándar.
- Evaluación de calidad en japonés bajo cuantización extrema: útil para medir hasta qué punto una calibración específica de idioma afecta a la perplejidad o a la calidad de salida en japonés con pesos de 2 bits.
- Despliegue en hardware Apple de gran capacidad: al haberse ejecutado en un M3 Ultra con Metal mediante el motor `ixv-server`, sirve como referencia para entornos con memoria unificada amplia (en torno a 152 GiB de pesos principales en memoria).
- Pruebas de compatibilidad de motores: dado que el layout de las tablas Engram es propio, el fichero es útil para validar implementaciones que pretendan leer este formato, no para probar llama.cpp u Ollama.
- Análisis de personas financieras sintéticas en japonés: el dataset de calibración (Nemotron-Personas-Finance-Japan) sugiere que el modelo puede emplearse en tareas de generación de perfiles, resúmenes y correos en el dominio financiero japonés, con las reservas propias de una cuantización Q2.
- Estudio de degradación por cuantización: comparar este fichero con el Q2 estándar y con los pesos oficiales permite cuantificar la pérdida de calidad atribuible a la cuantización de 2 bits en un modelo de 754,6 mil millones de parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas del proceso de cuantización (cobertura de expertos enrutados por la imatrix: 15.112/15.360, 98,39%, frente a 14.931/15.360, 97,21% de la versión estándar) y datos operativos (tamaño del fichero, tiempos de conversión), no resultados de evaluación de calidad.

## Requisitos de hardware

- VRAM/memoria estimada: los pesos principales que permanecen en memoria rondan los 151,8 GiB; el fichero GGUF completo ocupa 365.713.686.528 bytes (unos 340,6 GiB).
- GPU recomendadas: no disponible. El autor solo documenta ejecución en un Apple M3 Ultra con Metal mediante el motor `ixv-server` de IXV.
- Compatibilidad con GPU de consumo: no es viable en GPU de consumo convencionales por el volumen de memoria requerido; se necesitan sistemas con memoria unificada o agregada muy amplia.
- Opciones de despliegue: únicamente `ixv-server` (IXV) está probado. El autor advierte explícitamente de que los fragmentos de llama.cpp, Ollama y otros que Hugging Face genera automáticamente para todo GGUF no se han probado y no espera que funcionen, debido al layout propio de las tablas Engram.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Estado |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-ELVEZ-Q2-ja1 (este) | 754,6 mil millones | no disponible | IQ2_XXS / Q2_K / Q8_0 | MIT | Experimental, no recomendado por el autor |
| DeepSeek-V4.1-Flash-1017-ELVEZ-Q2 (estandar) | 754,6 mil millones | no disponible | IQ2_XXS / Q2_K / Q8_0 | MIT | Versión mantenida por ELVEZ y usada en IXV |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 (oficial) | 754,6 mil millones | no disponible | safetensors FP8/oficial | MIT | Pesos de referencia |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada; la única diferencia cuantificada es la cobertura de expertos de la imatrix (98,39% frente a 97,21%).

## Limitaciones y advertencias

- Modelo marcado como experimental por el propio autor: no se recomienda su uso en producción y no se emplea en el producto IXV.
- La calibración en japonés no mejoró de forma clara la salida en japonés, según la medición del autor.
- La cuantización a 2 bits de los expertos enrutados implica una pérdida de calidad previsible frente a los pesos oficiales; no se han publicado evaluaciones que la cuantifiquen.
- El GGUF no es de propósito general: las tablas Engram usan un layout propio y no se espera que funcione en llama.cpp, Ollama u otros motores estándar.
- Solo se ha probado en `ixv-server` con Metal sobre M3 Ultra; no hay validación en CUDA, ROCm ni otros backends.
- Idiomas declarados: japonés e inglés. El comportamiento en castellano u otros idiomas no está garantizado.
- Riesgo de alucinación inherente a los modelos de lenguaje, potencialmente agravado por la cuantización agresiva.
- Sesgos: no documentados en la información disponible; el dataset de calibración está centrado en personas financieras japonesas, lo que puede introducir sesgo de dominio.
- Licencia MIT, que permite uso comercial, pero el autor declara el modelo "as is", sin garantía de ningún tipo, y no acepta responsabilidad por daños derivados de su uso.
- El acceso está condicionado a la aceptación de un formulario (gated) en Hugging Face.
- El fichero DSpark del repositorio estándar es compatible y se usó en la evaluación; el fichero Vision no se probó con esta cuantización.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/elvezjp/DeepSeek-V4.1-Flash-1017-ELVEZ-Q2-ja1-gguf
- Cuantización Q2 estándar de ELVEZ: https://huggingface.co/elvezjp/DeepSeek-V4.1-Flash-1017-ELVEZ-Q2-gguf
- Modelo base oficial: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Dataset de calibración: https://huggingface.co/datasets/nvidia/Nemotron-Personas-Finance-Japan
- Conversor de origen: antirez/ds4 `gguf-tools` (MIT), referenciado en la model card; URL no disponible.

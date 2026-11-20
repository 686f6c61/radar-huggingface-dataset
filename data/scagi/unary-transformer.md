# ScAGI/unary-transformer

## Resumen

`ScAGI/unary-transformer` es un prototipo de investigación publicado en Hugging Face por el usuario ScAGI. No es un modelo de lenguaje de propósito general, sino un decoder-only Transformer pequeño diseñado para una tarea estructurada de predicción del siguiente token: dado un conjunto de tokens de aristas puntero desordenadas, tokens de etiqueta de carga útil y un token de petición final, el modelo genera libremente un glifo de respuesta seguido de EOS. La model card lo describe explícitamente como un Transformer causal de dos bloques con atención dura (hard attention) estricta y aritmética unaria.

La particularidad técnica del proyecto es que los pesos y los valores aritméticos internos (puntuaciones de atención, coordenadas ocultas, logits y sumas objetivo) se representan como secuencias literales de marcas unarias con signo, usando operaciones de append/cancel y suma repetida. El entrenamiento es discreto y exacto sobre seis prompts sintéticos con dos objetivos entrenables cada uno (glifo de respuesta y EOS), sin gradientes ni floats en el bucle de ajuste. Todo el código es Python estándar en CPU y no utiliza la API de carga de Hugging Face Transformers.

El modelo tiene un interés fundamentalmente académico: sirve como banco de pruebas para estudiar arquitecturas Transformer con restricciones aritméticas extremas y para validar hipótesis sobre atención, mapeo de valores y conexiones dispersas mediante controles analíticos. No está pensado para inferencia sobre texto real ni para tareas de lenguaje natural.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal con dos bloques de hard attention (Q/K/V/output-projection) y dos proyecciones ReLU feed-forward con residual |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | hasta 129 posiciones en los tests (cohortes de 9, 17, 65 y 129) |
| Tipos de cuantización | no disponible (aritmética unaria con signo, no cuantización estándar) |
| Idiomas soportados | no disponible (tarea sintética de glifos, no lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | no disponible (implementación Python standalone; no usa safetensors ni GGUF) |

## Arquitectura y entrenamiento

La arquitectura consta de dos bloques causales con hard attention (hardmax positivo con opción nula fija, sin softmax) y proyecciones Q/K/V/output, cada uno seguido de una actualización residual feed-forward con dos proyecciones ReLU entrenadas. Cada query lee estrictamente una posición anterior; no hay plan de acción por ejemplo que sustituya la atención global. Los pesos escalares agrupados aprendidos definen la ganancia del embedding de tokens, las proyecciones de cada bloque, un remapeo de canales de valor y las lecturas de respuesta/EOS. Los embeddings en bruto tienen canales de puntero, etiqueta y query diseñados por el usuario, junto con características simbólicas de vocabulario congeladas.

El ajuste se realiza sobre seis prompts cortos, cada uno con dos objetivos entrenables de siguiente token (glifo de respuesta y EOS). Los tokens del prompt se enmascaran de la pérdida. La pérdida es discreta exacta 0–1 (recuento de errores), sin floats, gradientes ni enrutamiento intermedio de objetivos. El inicializador cero falla las 12 etiquetas; el checkpoint final conjunto no falla ninguna. La mayoría de los pesos son no negativos, con ganancias ligadas a cero o uno. El solver busca ambos bloques y la paleta de valores conjuntamente; se evaluaron dos candidatos completos antes del primer ajuste exacto. El mapeo de valores se aprende de las etiquetas (identidad, intercambio o ambos), pero el papel de cada capa y las conexiones dispersas permitidas están diseñados, no aprendidos de forma libre.

## Capacidades

- Generación de un glifo de respuesta seguido de EOS en la tarea sintética de punteros y etiquetas.
- Razonamiento de dos saltos (first-hop a second-hop) sobre combinaciones de claves, incluyendo combinaciones novedosas en los tests.
- Aislamiento causal del sufijo futuro (verificado en los tests).
- Modificaciones contrafactuales de punteros y etiquetas (verificadas en los tests).
- Precisión de token con teacher forcing (evaluada en los tests).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso de propósito general.
- No tiene capacidades multilingües ni de visión, audio o thinking mode.
- No es un modelo de lenguaje natural: no genera texto libre fuera de la tarea sintética.

## Casos de uso

- Investigación sobre hard attention: el modelo permite estudiar el comportamiento de bloques con hardmax positivo y opción nula fija en una tarea controlada, con controles de ablación (desactivar bloque de atención 1, bloque 2 o cualquiera de los feed-forward) usando el mismo generador y checkpoint.
- Estudio de aritmética unaria en redes neuronales: sirve para analizar cómo se representan pesos y activaciones como secuencias de marcas unarias con signo y qué implicaciones tiene para la interpretabilidad de las operaciones internas.
- Validación de hipótesis arquitectónicas: la model card describe que una proyección/ganancia obligatoria a cero desconecta el único camino de respuesta o el de EOS, lo que permite descartar hipótesis analíticamente; útil para metodologías de búsqueda de arquitectura restringida.
- Reproducibilidad de experimentos discretos: los comandos `fit.py`, `test.py` y la verificación `sha256sum -c SHA256SUMS` permiten reproducir el ajuste y los tests exactos en CPU sin dependencias de GPU.
- Docencia sobre Transformers: como ejemplo mínimo y ejecutable de un decoder-only con atención causal, embeddings con canales diseñados y lectura de respuesta/EOS, sin la complejidad de un modelo preentrenado.
- Análisis de simetría de signos en Q/K: la model card advierte que las elecciones de signo en Q/K tienen simetría de signo emparejada y no deben interpretarse como identificadas de forma independiente; útil como caso de estudio sobre identificabilidad en modelos discretos.

## Benchmarks y rendimiento

La model card describe un índice combinado: 100 veces la tasa exacta de generación libre, ponderada por igual, sobre cuatro cohortes disjuntas de 96 filas cada una (longitudes de contexto 9, 17, 65 y 129). Sin embargo, no se proporcionan los valores numéricos de ese índice ni de la precisión de token con teacher forcing en la información disponible.

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Inferencia en CPU: la model card indica explícitamente que es un prototipo de investigación en CPU con implementación Python standalone.
- VRAM estimada: no disponible (no se especifica tamaño de pesos ni uso de GPU).
- GPU recomendadas: no disponible; no se requiere GPU según la información disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no usa la API de carga de Hugging Face Transformers; se ejecuta mediante los scripts `fit.py` y `test.py` en Python 3.
- Latencia y throughput: no disponibles; la model card no reclama ninguna aceleración de inferencia.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (Transformers con aritmética unaria y hard attention para tareas sintéticas), ni datos de rendimiento que permitan una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- No es un modelo de lenguaje de propósito general: la model card lo describe como un Transformer pequeño para una tarea estructurada de siguiente token, no para texto real.
- Entrenado únicamente con ejemplos sintéticos generados (seis prompts con dos objetivos cada uno); no hay preentrenamiento sobre corpus amplio.
- La aritmética es unaria con signo en Python, no empaquetado binario; no se reclama ninguna aceleración de inferencia.
- La búsqueda de arquitectura está restringida: el papel de cada capa y las conexiones dispersas permitidas están diseñados, no aprendidos de forma libre. No es una búsqueda de arquitectura Transformer no restringida ni un preentrenamiento amplio.
- Las elecciones de signo en Q/K tienen simetría de signo emparejada y no deben interpretarse como identificadas de forma independiente.
- Los contextos largos contienen relleno; no tienen 129 enlaces informativos.
- Licencia no disponible: no se puede confirmar el uso comercial.
- Sin datos de sesgos, alucinación o rendimiento multilingüe porque el modelo no opera sobre lenguaje natural.
- No usa la API de Hugging Face Transformers, lo que limita su integración en pipelines estándar de despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ScAGI/unary-transformer
- Perfil del colaborador creditado en la dirección de investigación: https://github.com/Marxist-Leninist
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.

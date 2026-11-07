# iito-sama/tsumukey-models

## Resumen

TsumuKey models es un repositorio de modelos auxiliares que la aplicación de teclado iOS TsumuKey descarga bajo demanda. No se trata de un modelo único, sino de un paquete con dos artefactos diferenciados: un pequeño ranker propietario para autocorrección y predicción de la siguiente palabra, y una versión modificada de Gemma 3 270M de Google con el vocabulario recortado a inglés, francés, alemán y español y cuantizada a Q4_0. El autor es iito-sama y el repositorio tiene un tamaño total de 0,1 GB.

El modelo de mayor entidad es la variante de Gemma 3 270M, con 141.286.016 parámetros según los datos de safetensors. Su función dentro de la aplicación es servir como modelo de lenguaje ligero en el dispositivo, presumiblemente para sugerencias de texto y generación corta, mientras que el ranker se encarga de la corrección ortográfica y la predicción de palabras con un coste computacional mínimo.

La relevancia de esta ficha es acotada: no es un modelo de propósito general ni está pensado para su uso fuera del ecosistema TsumuKey. Sin embargo, resulta un ejemplo interesante de despliegue de un LLM de 270M parámetros en un teclado móvil con licencia Gemma y cuantización Q4_0, y de cómo se puede recortar el vocabulario de un modelo multilingüe para reducir el tamaño del archivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (ranker: 2 capas; Gemma 3 270M: arquitectura Gemma 3, detalles no disponibles) |
| Parametros totales | 141.286.016 (Gemma 3 270M modificado); ranker no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el ranker lee las últimas 8 palabras) |
| Tipos de cuantizacion | Q4_0 (Gemma 3 270M); ranker en formato propietario TKR3 |
| Idiomas soportados | Inglés, francés, alemán, español |
| Licencia | Mixta: Gemma Terms of Use para el modelo Gemma; licencia "other" para el ranker |
| Formato de pesos | GGUF (Gemma 3 270M); TKR3 (ranker) |

## Arquitectura y entrenamiento

El ranker es un transformer de 2 capas que lee las últimas 8 palabras de contexto. No utiliza vocabulario: las palabras se representan como n-gramas de caracteres hasheados, lo que permite puntuar palabras arbitrarias sin necesidad de una tabla de vocabulario. Se entrenó con escritura simulada con ruido sobre frases de Tatoeba y Wikipedia en los cuatro idiomas soportados. En el conjunto de prueba Mac de 12.351 palabras alcanza un 95,5% de palabras correctas en escritura cuidadosa y un 86,9% en escritura rápida, con un 26,0% de acierto en las tres primeras sugerencias de siguiente palabra.

El segundo artefacto es una modificación de Gemma 3 270M de Google: se recortó el vocabulario a inglés, francés, alemán y español y se cuantizó a Q4_0, resultando en un archivo de 102 MB. No se dispone de información sobre el proceso de recorte, los datos de entrenamiento originales de Gemma 3 270M ni si hubo ajuste fino adicional. El ranker ocupa 4,5 MB y se distribuye en formato TKR3, con verificación de checksum SHA-256 por parte de la aplicación antes de su uso.

## Capacidades

- Autocorrección de palabras en inglés, francés, alemán y español mediante el ranker.
- Predicción de la siguiente palabra con hasta tres sugerencias (26,0% de acierto en top-3 en el conjunto de prueba).
- Puntuación de palabras sin vocabulario fijo gracias al hashing de n-gramas de caracteres.
- Generación de texto ligera mediante Gemma 3 270M modificado, con vocabulario restringido a cuatro idiomas.
- Inferencia en dispositivo (iOS) con modelos de 4,5 MB y 102 MB.
- Descarga bajo demanda con verificación de integridad por SHA-256.
- No se documenta soporte de tool calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Autocorrección en teclados móviles: el ranker puntúa candidatos de corrección en tiempo real con un coste de 4,5 MB y latencia mínima, adecuado para ejecutarse en el hilo de entrada del teclado.
- Predicción de siguiente palabra: las tres sugerencias se muestran en la barra de predicción del teclado iOS, con un 26,0% de acierto en top-3 según las pruebas del autor.
- Soporte multilingüe en un mismo teclado: al cubrir inglés, francés, alemán y español, el ranker y el modelo Gemma recortado permiten cambiar de idioma sin descargar artefactos adicionales.
- Generación de texto corto en el dispositivo: Gemma 3 270M en Q4_0 (102 MB) puede emplearse para completar frases o responder sugerencias breves sin conexión a red.
- Distribución eficiente de modelos en aplicaciones móviles: el esquema de descarga bajo demanda con checksum SHA-256 sirve como referencia para empaquetar modelos pequeños en apps con restricciones de tamaño.
- Investigación sobre recorte de vocabulario: el archivo Gemma modificado es un ejemplo práctico de cómo reducir el vocabulario de un modelo multilingüe a cuatro idiomas y cuantizarlo a Q4_0 para reducir el tamaño del artefacto.
- Evaluación de rankers sin vocabulario: el enfoque de n-gramas de caracteres hasheados es reutilizable en tareas de puntuación léxica con vocabularios abiertos.

## Benchmarks y rendimiento

| Prueba | Resultado |
|---|---|
| Ranker, palabras correctas en escritura cuidadosa (Mac, 12.351 palabras) | 95,5% |
| Ranker, palabras correctas en escritura rápida (Mac, 12.351 palabras) | 86,9% |
| Ranker, acierto en top-3 de siguiente palabra | 26,0% |

No se han publicado resultados de benchmarks del modelo Gemma 3 270M modificado (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- Gemma 3 270M en Q4_0: archivo de 102 MB; la VRAM necesaria para inferencia es inferior a 1 GB, apta para ejecución en CPU y en GPU integradas.
- Ranker: 4,5 MB; se ejecuta en CPU sin requisitos relevantes de memoria.
- Cabe en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.) y en dispositivos móviles iOS, que es el destino previsto.
- Opciones de despliegue: llama.cpp y Ollama para el archivo GGUF; el ranker requiere el runtime propietario de TsumuKey (formato TKR3).
- No se dispone de datos de latencia ni throughput medidos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| TsumuKey (Gemma 3 270M modificado) | 141.286.016 | No disponible | en, fr, de, es | Gemma Terms of Use | GGUF Q4_0 |
| Gemma 3 270M (original) | 270M (aprox.) | No disponible en esta ficha | Multilingüe amplio | Gemma Terms of Use | Safetensors, GGUF |
| TsumuKey ranker | No disponible | Últimas 8 palabras | en, fr, de, es | other | TKR3 |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El repositorio no contiene un modelo de propósito general: está diseñado para la app TsumuKey y su uso fuera de ella no está documentado.
- El ranker usa un formato propietario (TKR3) sin especificación pública, lo que impide reutilizarlo con runtimes estándar.
- El vocabulario de Gemma 3 270M está recortado a cuatro idiomas; el rendimiento en otros idiomas será degradado o nulo.
- No hay datos publicados sobre sesgos, tasa de alucinación ni evaluación de calidad del modelo Gemma modificado.
- La licencia es mixta: el modelo Gemma se rige por los Gemma Terms of Use y la Gemma Prohibited Use Policy, con obligaciones específicas para uso comercial y redistribución.
- El ranker se distribuye bajo licencia "other" sin texto público de licencia en la información disponible.
- El acierto en top-3 de siguiente palabra (26,0%) es bajo para aplicaciones que dependan de predicciones precisas.
- No se documentan mecanismos de seguridad, filtrado de contenido ni moderación en ninguno de los dos artefactos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/iito-sama/tsumukey-models
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy

# eigami/misaki-lexicons

## Resumen

`eigami/misaki-lexicons` no es un modelo de lenguaje, sino un repositorio de datos: una copia sin modificar de los lexicones de pronunciación en inglés de Misaki, la librería de hexgrad para conversión de texto a fonemas (G2P, grapheme-to-phoneme). Estos diccionarios son los que se emplearon para entrenar Kokoro, un modelo de síntesis de voz (TTS) de pequeño tamaño y alta calidad. El repositorio lo publica el autor eigami para uso interno de su editor de vídeo Eigami, de modo que las descargas de la aplicación no dependan de la cuenta de un tercero.

El contenido se limita a cuatro ficheros JSON con pares de palabra y transcripción fonética: `gb_gold.json`, `gb_silver.json`, `us_gold.json` y `us_silver.json`, correspondientes a las variantes de inglés británico y estadounidense, en versiones "gold" (curadas, de mayor fiabilidad) y "silver" (generadas automáticamente, de menor fiabilidad pero mayor cobertura). La aplicación que los consume verifica el SHA-256 de cada fichero antes de usarlo, lo que da una idea del nivel de integridad que se espera del contenido.

Es relevante ahora porque los lexicones de pronunciación son un componente crítico en cualquier pipeline de TTS: determinan cómo se pronuncia cada palabra y, por tanto, la naturalidad del audio resultante. Tener una copia versionada y con licencia Apache-2.0 facilita la reproducibilidad de pipelines de TTS basados en Kokoro sin depender de la disponibilidad del repositorio original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no aplica (repositorio de datos, no es un modelo neuronal) |
| Parametros totales | no aplica |
| Parametros activos | no aplica |
| Longitud de contexto | no aplica |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | inglés (variantes US y UK) |
| Licencia | Apache-2.0 |
| Formato de pesos | JSON (cuatro ficheros: `gb_gold.json`, `gb_silver.json`, `us_gold.json`, `us_silver.json`) |

## Arquitectura y entrenamiento

No hay arquitectura ni entrenamiento en el sentido habitual: el repositorio contiene lexicones, es decir, tablas de correspondencia entre grafemas y fonemas para palabras del inglés. Los ficheros "gold" son entradas curadas manualmente o de alta confianza; los "silver" son entradas generadas de forma automática, presumiblemente mediante reglas o modelos de G2P, y por tanto con mayor cobertura pero menor precisión. La model card no detalla el número de entradas de cada fichero, el proceso de construcción de los lexicones ni la metodología de separación gold/silver.

El origen es el repositorio `hexgrad/misaki` en GitHub. Según la model card, estos son "los diccionarios con los que se entrenó Kokoro", copiados sin cambios. No se documenta ningún proceso de entrenamiento, ajuste fino ni evaluación asociado a esta copia concreta.

## Capacidades

- Proporcionar transcripciones fonéticas para palabras en inglés estadounidense y británico.
- Servir como recurso de G2P para pipelines de síntesis de voz, en particular los basados en Kokoro.
- Diferenciar entre entradas de alta confianza (gold) y de cobertura amplia (silver).
- Verificación de integridad mediante SHA-256 por parte de la aplicación consumidora (según la model card).
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: no es un modelo generativo.
- No hay capacidades multilingües más allá del inglés (US/UK).

## Casos de uso

- Síntesis de voz con Kokoro: el lexicón se carga como recurso de pronunciación para convertir texto en fonemas antes de la inferencia del modelo TTS, mejorando la naturalidad frente a reglas puramente ortográficas.
- Pipeline de TTS reproducible: al estar versionado con licencia Apache-2.0 y verificación SHA-256, permite fijar una versión concreta del lexicón en entornos de producción o CI.
- Editor de vídeo Eigami: caso de uso declarado por el autor; la aplicación descarga los lexicones desde este repositorio para generar voces en off.
- Evaluación comparativa de G2P: usar los ficheros gold como conjunto de referencia para medir la precisión de otros sistemas de conversión grafema-fonema.
- Investigación en fonética computacional: corpus de pares palabra-transcripción para análisis de patrones de pronunciación en inglés US y UK.
- Desarrollo de correctores de pronunciación: detectar palabras con pronunciación irregular comparando las entradas gold con las reglas del sistema.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No requiere GPU: es un conjunto de ficheros JSON que se cargan en memoria.
- El consumo de RAM depende del tamaño de los ficheros, que no se especifica en la información disponible; para lexicones de este tipo suele ser del orden de decenas a pocos cientos de megabytes.
- No aplica despliegue con vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo neuronal.
- La latencia de uso es la de una búsqueda en un diccionario en memoria (microsegundos por palabra), aunque no se documenta ninguna medición.
- Se integra en pipelines de TTS que sí requieren hardware para el modelo de voz (Kokoro), pero ese requisito corresponde al modelo TTS, no a este repositorio.

## Comparativa con modelos similares

| Recurso | Tipo | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|
| `eigami/misaki-lexicons` | Lexicón G2P (copia) | Inglés US/UK | Apache-2.0 | Hugging Face |
| `hexgrad/misaki` (original) | Librería y lexicones G2P | Inglés US/UK | Apache-2.0 (según la model card) | GitHub |
| CMU Pronouncing Dictionary | Lexicón G2P | Inglés US | Dominio público / BSD | Web y paquetes |
| Lexicones de eSpeak NG | Reglas y lexicones G2P | Múltiples idiomas | GPL-3.0 | GitHub |

La comparación se limita a recursos del mismo tipo (lexicones de pronunciación), ya que no existen modelos comparables en el sentido de parámetros o benchmarks. Frente al CMUdict, la diferencia principal es la cobertura de la variante británica y la separación gold/silver; frente a eSpeak NG, la licencia permisiva (Apache-2.0) es la ventaja principal.

## Limitaciones y advertencias

- No es un modelo: no genera texto, no razona y no puede evaluarse con benchmarks de LLM.
- Solo cubre inglés (US y UK); no hay soporte para otros idiomas.
- No se documenta el número de entradas, la cobertura léxica ni la metodología de construcción de los ficheros gold y silver.
- La calidad de las entradas silver es inferior a las gold; usarlas sin filtrado puede introducir errores de pronunciación.
- Es una copia de un repositorio de terceros: la autoría y los derechos sobre los lexicones corresponden a hexgrad, según indica la propia model card.
- No hay información sobre el mantenimiento del repositorio ni sobre la sincronización con el original de Misaki.
- Sin descargas ni likes en el momento de la consulta, lo que sugiere un uso muy limitado y poca validación externa.
- La fecha de creación indicada (2026-11-22) es futura respecto a la información habitual de este tipo de fichas; conviene verificarla en la página del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/eigami/misaki-lexicons
- Repositorio original de Misaki: https://github.com/hexgrad/misaki

# Lindarixon/Linda-Trace

## Resumen

Linda Trace es un paquete de recursos de estilometría distribuido a través de Hugging Face por el desarrollador Lindarixon. No se trata de un modelo neuronal, sino de un artefacto basado en `scikit-learn` que combina un vocabulario de n-gramas de caracteres (3-4-gramas) con pesos TF-IDF para comparar el estilo de escritura entre documentos. El paquete se utiliza como fuente de actualización de una aplicación de escritorio para Windows llamada también Linda Trace, que funciona de forma local y sin conexión para cotejar textos cuestionados contra muestras de autores conocidos en inglés, ruso y polaco.

El recurso principal es `models/char_ngrams_model.json`, un fichero de aproximadamente 152 KB con 2.000 características por idioma y pesos IDF, entrenado sobre ventanas de 300 palabras de prosa literaria documentada. El repositorio incluye además una lista de actualizaciones firmada con Ed25519 (`latest.json` y `latest.json.sig`) y metadatos de procedencia del corpus de entrenamiento. La aplicación cliente se distribuye por separado desde GitHub Releases y no forma parte de este repositorio.

La relevancia de este paquete es acotada: cubre un caso muy específico (atribución de autoría sobre prosa literaria histórica) y el propio autor advierte que los resultados son distancias relativas de estilo dentro del corpus que aporte el usuario, no probabilidades de autoría. Con cero descargas y cero likes en el momento de la consulta, se trata de un artefacto de nicho, con licencia propietaria y sin benchmarks publicados más allá de un test retenido de 92 obras.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No neuronal; vectorizador TF-IDF sobre n-gramas de caracteres (3-4) con `scikit-learn` |
| Parametros totales | No aplica (modelo no paramétrico basado en vocabulario y pesos IDF) |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica; el recurso se aplica sobre ventanas de 300 palabras |
| Tipos de cuantizacion | No disponible (no es un modelo de pesos neuronales) |
| Idiomas soportados | Inglés (en), ruso (ru), polaco (pl) |
| Licencia | Propietaria (`linda-trace-proprietary`, categoría `other`) |
| Formato de pesos | JSON (`models/char_ngrams_model.json`, ~152 KB) |

## Arquitectura y entrenamiento

El recurso no es una red neuronal. Se trata de un vectorizador de `scikit-learn` configurado con `analyzer=char`, `ngram_range=(3,4)`, minúsculas, `sublinear_tf`, `smooth_idf` y normalización L2, con 2.000 características por idioma. El vocabulario y los pesos IDF se serializan en JSON. La aplicación cliente combina estos vectores con unas 250 características estilométricas adicionales y una puntuación de similitud coseno-delta direccional para ordenar documentos por distancia de estilo relativa.

El entrenamiento se realizó sobre 407 obras (147 en inglés, 58 en polaco y 202 en ruso), todas ellas originales de dominio público o contribuciones CC0. La atribución por obra, la base de licencia y la fuente están documentadas en `provenance/TRAIN_ATTRIBUTION.json`. El corpus es exclusivamente prosa literaria histórica; no se declara entrenamiento con datos modernos, institucionales o corporativos. No se menciona uso de RLHF, DPO ni técnicas de alineación, algo coherente con la naturaleza no neuronal del recurso.

## Capacidades

- Comparación de estilo de escritura entre documentos mediante distancia coseno-delta sobre vectores TF-IDF de n-gramas de caracteres.
- Cotejo de textos cuestionados contra muestras de autores conocidos en inglés, ruso y polaco.
- Extracción de aproximadamente 250 características estilométricas adicionales en la aplicación cliente.
- Funcionamiento completamente local y sin conexión; no requiere llamadas a servicios externos.
- Verificación de integridad de actualizaciones mediante firma Ed25519 y comprobación SHA-256 de los ficheros descargados.
- Aplicación atómica del paquete de modelos con restauración del paquete anterior en caso de fallo.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.

## Casos de uso

- Peritaje estilométrico preliminar en literatura histórica: comparar un texto anónimo del siglo XIX contra un conjunto de obras de autores candidatos en inglés, polaco o ruso, usando las distancias relativas como indicio para priorizar una investigación más profunda.
- Docencia e investigación en humanidades digitales: ilustrar cómo funcionan los n-gramas de caracteres y la similitud coseno-delta sobre corpus literarios pequeños y controlados.
- Análisis de traducciones y variantes textuales: detectar agrupaciones estilísticas entre versiones de una misma obra o entre autores de una misma tradición literaria.
- Archivística y catalogación: agrupar documentos históricos por afinidad de estilo para proponer atribuciones que después se validen con fuentes documentales.
- Auditoría de integridad de actualizaciones en despliegues locales: el par `latest.json`/`latest.json.sig` permite verificar que el paquete de modelos recibido no ha sido manipulado antes de aplicarlo.
- Experimentación con pipelines de estilometría en `scikit-learn`: reutilizar el vocabulario y los pesos IDF como punto de partida para construir clasificadores o rankings propios en los tres idiomas soportados.

## Benchmarks y rendimiento

El autor publica un test retenido independiente sobre 92 obras de autores fallecidos entre 1852 y 1925, con el ranking fusionado que distribuye la aplicación:

| Corpus | Aciertos top-1 |
|---|---|
| Inglés (17 obras) | 9/17 |
| Polaco (19 obras) | 9/19 |
| Ruso (24 obras) | 14/24 |
| Prosa institucional moderna (opiniones del Tribunal Supremo de EE. UU., 2024-2025, 10 obras) | 4/10 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ningún otro benchmark estándar de modelos de lenguaje, ya que el recurso no es un modelo generativo.

## Requisitos de hardware

- No requiere GPU: el recurso es un fichero JSON de unos 152 KB procesado con `scikit-learn`, por lo que la inferencia es puramente CPU.
- Huella de memoria mínima: el vocabulario y los pesos IDF caben holgadamente en cualquier equipo de escritorio actual.
- Compatibilidad verificada con la aplicación Windows 2.5.0.0; el paquete de modelos permanece en la versión 2.0.1.
- Despliegue: la aplicación cliente se obtiene desde GitHub Releases; el recurso puede consumirse directamente con `scikit-learn` en Python si se desea integrar en un pipeline propio.
- Latencia y throughput: no disponibles; dependen del tamaño del corpus que aporte el usuario y del número de comparaciones por pares.
- No aplica despliegue con vLLM, llama.cpp, Ollama ni TGI, al no tratarse de un modelo de pesos neuronales.

## Comparativa con modelos similares

| Recurso | Tipo | Idiomas | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Linda Trace | TF-IDF de n-gramas de caracteres + rasgos estilométricos | en, ru, pl | Ventanas de 300 palabras | Propietaria | Hugging Face + GitHub Releases |
| Modelos de atribución de autoría basados en `scikit-learn` (genéricos) | TF-IDF / bolsas de palabras | Configurable | No aplica | Habitualmente permisiva | Requiere entrenamiento propio |
| Modelos neuronales de estilometría (p. ej. fine-tuning de transformers) | Transformer | Variable | 512-8.192 tokens | Variable | Depende del modelo base |
| Herramientas clásicas de estilometría forense (p. ej. JGAAP, Stylo) | Conjunto de métodos estadísticos | Configurable | No aplica | Código abierto | Repositorios académicos |

No se dispone de comparaciones cuantitativas directas con alternativas concretas en la información proporcionada.

## Limitaciones y advertencias

- Los resultados son distancias relativas de estilo dentro del corpus que aporte el usuario; no son probabilidades de autoría ni prueban identidad, autenticidad o filtraciones.
- El recurso está entrenado exclusivamente con prosa literaria histórica; la prosa institucional moderna solo alcanzó 4/10 en el test retenido y los textos modernos o corporativos no están cubiertos por ninguna garantía.
- Los n-gramas de caracteres pueden reflejar el tema o la fuente además del autor, lo que introduce confusión en corpus temáticamente homogéneos.
- La licencia es propietaria (`linda-trace-proprietary`); el uso comercial requiere revisar los términos en el enlace de licencia del repositorio.
- Los derechos documentales del corpus de entrenamiento no establecen una autorización legal mundial: 147 obras se apoyan en una declaración de dominio público según la legislación estadounidense.
- Solo cubre inglés, ruso y polaco; no hay soporte para castellano ni para otros idiomas.
- Riesgo de alucinación no aplicable en sentido estricto al no ser un modelo generativo, pero sí existe riesgo de sobreinterpretar las distancias de estilo como conclusiones forenses.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, sin comunidad de validación independiente documentada.

## Enlaces

- Hugging Face: https://huggingface.co/Lindarixon/Linda-Trace
- Sitio del proyecto: https://lendarixon.github.io/Linda-Trace/
- Repositorio GitHub: https://github.com/Lendarixon/Linda-Trace
- Releases de la aplicación: https://github.com/Lendarixon/Linda-Trace/releases
- Documentación de actualizaciones: https://github.com/Lendarixon/Linda-Trace/blob/main/UPDATES.md
- Licencia: https://github.com/Lendarixon/Linda-Trace/blob/main/LICENSE.txt

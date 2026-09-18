# angel-gitt/privacy-filter-gbai

## Resumen

Privacy Filter ES M1 (angel-gitt/privacy-filter-gbai) es un clasificador de tokens para la deteccion de informacion personal identificable (PII) en texto, con foco en espanol. Se construye sobre el backbone multilingue OpenMed/privacy-filter-multilingual-v2, de 1.400 millones de parametros, y anade una cabeza de clasificacion BIOES de 139.097 parametros (Linear de 640 a 217). El problema que aborda es la desidentificacion automatica de documentos sensibles, un paso previo habitual en el tratamiento de historias clinicas, expedientes legales y bases documentales sujetas a normativa de proteccion de datos.

El modelo es un derivado de ajuste fino con backbone congelado: unicamente se entreno la cabeza final en FP32 sobre 7.168 fragmentos en espanol (3.009 de MEDDOCAN y 4.159 sinteticos propios), con una epoca, batch 16 y tasa de aprendizaje 1e-4. Frente a su modelo base (denominado M0 en la model card), la version M1 mejora la F1 de deteccion de spans exactos en el test oficial de MEDDOCAN, de 0.447 a 0.508, y en el diagnostico legal MAPA/EUR-Lex, de 0.265 a 0.492, a costa de una ligera perdida en el conjunto ingles fuera de dominio (de 0.790 a 0.777 en F1 a nivel de caracter).

Su relevancia es doble: por un lado, demuestra que adaptar un backbone multilingue con un entrenamiento pequeno y dirigido puede mejorar de forma notable el rendimiento en un dominio concreto (clinico y legal en espanol); por otro, se publica bajo Apache 2.0 y con una cabeza separada reutilizable, lo que facilita su inspeccion y su integracion en pipelines de anonimizacion. No obstante, el propio autor lo describe como prototipo de investigacion y no como garantia de anonimizacion completa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder para clasificacion de tokens, con cabeza lineal BIOES; backbone OpenMed/privacy-filter-multilingual-v2 (etiquetado como openai_privacy_filter) |
| Parametros totales | 1.399.604.809 (1,4 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no se publican pesos cuantizados; entrenamiento de la cabeza en FP32 y pesos en safetensors |
| Idiomas soportados | es, en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (incluye `m1_head.safetensors` con la cabeza entrenada) |
| Cabeza de clasificacion | Linear(640 -> 217), 139.097 parametros |
| Etiquetado | BIOES (217 clases) |
| Tamano del repositorio | 2,8 GB |
| Libreria | transformers |
| Pipeline | token-classification |

## Arquitectura y entrenamiento

La arquitectura combina un backbone transformer de 1,4 B de parametros, heredado sin cambios de OpenMed/privacy-filter-multilingual-v2, con una cabeza de clasificacion de tokens de tipo lineal que proyecta representaciones de 640 dimensiones a 217 clases BIOES. El tokenizador tambien se mantiene intacto. La unica parte entrenada es esa cabeza, lo que implica que la dimension oculta final del backbone es de 640. No se detallan en la informacion disponible el numero de capas, el mecanismo de atencion ni la composicion exacta del corpus de preentrenamiento del backbone.

El entrenamiento consistio en un ajuste supervisado con backbone congelado, en FP32, durante una sola epoca, con batch de 16 y tasa de aprendizaje 1e-4 (semilla 1701). El conjunto de entrenamiento reunio 7.168 fragmentos en espanol: 3.009 procedentes del split de train de MEDDOCAN y 4.159 ejemplos sinteticos propios. La validacion uso 2.762 fragmentos (1.762 del dev de MEDDOCAN y 1.000 sinteticos). Tras deduplicacion y cuarentena, el solapamiento exacto de texto entre train y validacion fue cero. El test de MEDDOCAN, MAPA/EUR-Lex y el conjunto ingles fuera de dominio se reservaron exclusivamente para evaluacion. No se menciona uso de RLHF, DPO ni decodificacion especulativa. La inferencia se realiza con decodificacion restringida BIOES/Viterbi a traves del runtime de OpenMed, que impone las transiciones validas de etiquetas.

## Capacidades

- Deteccion y clasificacion de PII a nivel de token con esquema BIOES, devolviendo etiqueta, texto y confianza por entidad.
- Decodificacion restringida BIOES/Viterbi, que evita secuencias de etiquetas invalidas y preserva el espaciado en la tokenizacion.
- Cobertura multilingue limitada a espanol e ingles, con especializacion en espanol clinico y legal.
- Segmentacion de spans exactos (el modelo card reporta F1 de span exacto sin tipar y F1 a nivel de caracter).
- Integracion con la funcion `extract_pii` de la libreria `openmed`, que gestiona la tokenizacion y la decodificacion correctas.
- Cabeza entrenada exportada por separado (`m1_head.safetensors`) para inspeccion o reutilizacion.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas, vision ni audio.
- No se documenta soporte de tool calling, function calling ni comportamiento agentico.

## Casos de uso

- Desidentificacion de historias clinicas: el modelo esta ajustado especificamente sobre MEDDOCAN, por lo que reconocera nombres de pacientes, identificadores y datos de contacto en notas clinicas en espanol; se usaria como primer paso antes de almacenar o compartir el texto.
- Anonimizacion de documentacion legal: el salto de F1 en el diagnostico MAPA/EUR-Lex (de 0.265 a 0.492 en span exacto) lo hace util para enmascarar datos personales en textos juridicos en espanol, siempre con revision humana.
- Preprocesado de corpus para entrenamiento: antes de usar un dataset con texto real en espanol para ajustar otro modelo, se puede pasar por este clasificador para eliminar PII y reducir riesgos de memorizacion.
- Redaccion de prompts hacia modelos generativos: actuar como filtro previo que sustituya entidades por marcadores antes de enviar texto a una API externa, reduciendo la exposicion de datos personales.
- Saneado de logs y tickets de soporte: ejecucion por lotes sobre registros de atencion al cliente en espanol para detectar correos, telefonos y nombres antes de su retencion o analisis.
- Auditoria y control de cumplimiento: generar un inventario de entidades detectadas por documento para revisiones internas de tratamiento de datos, usando la confianza devuelta por entidad para priorizar revisiones.
- Enmascaramiento en pipelines de investigacion biomedica: integracion en un paso de ETL que verifique de forma deterministica (con expresiones regulares complementarias) los hallazgos del modelo antes de liberar un dataset.
- Deteccion en textos mixtos es/en: al soportar ambos idiomas, puede aplicarse a documentacion bilingue, aunque con la advertencia de que la F1 en ingles cayo ligeramente tras la adaptacion al espanol.

## Benchmarks y rendimiento

Resultados publicados en la model card. Todas las cifras usan tokenizacion que preserva espacios y decodificacion restringida BIOES/Viterbi. Los valores se expresan como F1 de span exacto sin tipar / F1 a nivel de caracter. M0 corresponde al modelo base (OpenMed/privacy-filter-multilingual-v2) y M1 al modelo ajustado.

| Conjunto de evaluacion | Documentos | M0 | M1 |
|---|---:|---:|---:|
| MEDDOCAN test oficial (clinico espanol) | 250 | 0.447 / 0.755 | 0.508 / 0.796 |
| OOD ingles independiente | 1.201 | 0.501 / 0.790 | 0.531 / 0.777 |
| MAPA/EUR-Lex legal espanol (diagnostico) | 2 | 0.265 / 0.320 | 0.492 / 0.631 |

El resultado de MAPA/EUR-Lex se describe como diagnostico menor, ya que el subconjunto publicado en espanol solo contiene dos documentos largos, y no se uso para entrenar M1. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, lo cual es coherente con que el modelo sea un clasificador de tokens y no un modelo generativo.

## Requisitos de hardware

- VRAM estimada (calculada a partir de los 1,4 B de parametros, sin contar activaciones): aproximadamente 5,6 GB en FP32, 2,8 GB en FP16/BF16, 1,4 GB en INT8 y 0,7 GB en INT4.
- Las activaciones y la memoria de atencion crecen con la longitud de la secuencia; para documentos largos conviene reservar margen adicional o trocear la entrada.
- GPU recomendadas: cualquier GPU con 8 GB o mas puede ejecutar el modelo en FP16 si se segmentan las entradas; RTX 3060 12 GB, RTX 3090, RTX 4090, A10, L4 y A100/H100 son opciones holgadas.
- Cabe en GPU de consumo: si, en FP16 cabe en tarjetas de 8 GB o mas (por ejemplo RTX 3070/4060 Ti) y en FP32 en tarjetas de 12 GB o mas.
- Opciones de despliegue: la via documentada es `transformers` junto con el runtime de OpenMed para la decodificacion BIOES/Viterbi; el repositorio esta marcado como `endpoints_compatible`, por lo que puede desplegarse en Hugging Face Inference Endpoints.
- No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ni se publican pesos GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La unica comparacion con datos publicados en la informacion disponible es la del propio modelo frente a su backbone de partida. No se aportan cifras de otras alternativas de la misma categoria.

| Modelo | Parametros totales | Entrenamiento de la cabeza | MEDDOCAN test (span / caracter) | OOD ingles (span / caracter) | MAPA/EUR-Lex (span / caracter) | Licencia |
|---|---:|---|---:|---:|---:|---|
| angel-gitt/privacy-filter-gbai (M1) | 1.399.604.809 | si (139.097 parametros) | 0.508 / 0.796 | 0.531 / 0.777 | 0.492 / 0.631 | apache-2.0 |
| OpenMed/privacy-filter-multilingual-v2 (M0) | 1.399.604.809 | no | 0.447 / 0.755 | 0.501 / 0.790 | 0.265 / 0.320 | apache-2.0 (segun el autor, siguiendo el upstream) |
| Otras alternativas (spaCy, Presidio, etc.) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El autor lo define explicitamente como prototipo de investigacion, no como garantia de anonimizacion completa ni de cumplimiento legal.
- Puede omitir PII (falsos negativos), generar falsos positivos e inferir de forma incorrecta tanto las fronteras del span como la categoria.
- La F1 a nivel de caracter en ingles bajo de 0.790 a 0.777 tras la adaptacion al espanol, por lo que el rendimiento en ese idioma es ligeramente inferior al del modelo base.
- El resultado en MAPA/EUR-Lex se basa en solo dos documentos y debe interpretarse como diagnostico, no como rendimiento representativo del dominio legal.
- No se especifica la longitud maxima de contexto soportada, lo que dificulta planificar el procesamiento de documentos largos sin trocear.
- Usos de alto riesgo requieren comprobaciones deterministicas adicionales (por ejemplo, expresiones regulares para correos, telefonos o identificadores), un conjunto de evaluacion propio del dominio y revision humana.
- Los ensayos de validacion se hicieron sobre datos en espanol clinico y muestras sinteticas propias; el comportamiento fuera de esos dominios no esta caracterizado.
- La licencia Apache 2.0 permite uso comercial, pero exige conservar los avisos de atribucion a OpenMed, OpenAI Privacy Filter, MEDDOCAN y los datasets upstream correspondientes.
- El repositorio presenta 0 descargas y 0 likes, por lo que carece de validacion externa de la comunidad y de pruebas de terceros.
- Existe riesgo de sesgo heredado del corpus de entrenamiento (predominantemente clinico y en espanol), con cobertura desigual de nombres, formatos de identificadores o variantes regionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/angel-gitt/privacy-filter-gbai
- Modelo base: https://huggingface.co/OpenMed/privacy-filter-multilingual-v2
- Dataset MEDDOCAN: https://huggingface.co/datasets/bigbio/meddocan
- Los resultados de la busqueda web realizada no devolvieron enlaces relevantes al modelo; las entradas encontradas corresponden a servicios y contenidos ajenos (angel.fr, angel.com, la serie de television Angel), por lo que no se incluyen.

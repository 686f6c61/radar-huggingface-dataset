# genia-americas/ameri-xlm

## Resumen

AmeriXLM es un proyecto de modelo de lenguaje de tipo encoder anunciado por el colectivo genia-americas, orientado a lenguas de America Latina. Segun su propia model card, el modelo **no ha sido entrenado todavia**: el repositorio de Hugging Face no contiene pesos, ni `config.json`, ni tokenizer, ni checkpoint, por lo que `AutoModel.from_pretrained("genia-americas/ameri-xlm")` falla en la actualidad. La publicacion funciona como declaracion de intenciones y reserva de nombre.

La motivacion declarada es corregir el reparto de computo de modelos multilingues como XLM-R y mBERT, que asignan capacidad en proporcion al volumen de texto disponible por idioma, lo que a juicio de los autores infravalora el espanol de America Latina y el portugues de Brasil. AmeriXLM propone un encoder entrenado con un corpus que pondera deliberadamente el texto regional, e incorpora ademas tres lenguas indigenas: quechua, guarani y nahuatl.

El plan tecnico, explicitamente marcado como provisional y sujeto a cambios, contempla una arquitectura de estilo RoBERTa con objetivo de modelado de lenguaje enmascarado (MLM) y una longitud de contexto de 512 tokens. El tamano del modelo, el vocabulario y el presupuesto de entrenamiento estan sin decidir. No existen resultados de evaluacion publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder de estilo RoBERTa (objetivo MLM), segun plan declarado; no implementado |
| Parametros totales | no disponible (sin decidir) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (objetivo declarado) |
| Tipos de cuantizacion | no disponible (no hay pesos) |
| Idiomas soportados | es, pt, en, qu, gn, nah (objetivo declarado) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (no hay pesos publicados) |

## Arquitectura y entrenamiento

La arquitectura prevista es un encoder transformer de estilo RoBERTa entrenado con modelado de lenguaje enmascarado y una ventana de 512 tokens. El proyecto menciona un tokenizer propio de orientacion regional, sin especificar algoritmo, tamano de vocabulario ni criterios de construccion. No se han publicado detalles sobre el corpus de entrenamiento: ni numero de tokens, ni composicion del dataset, ni proporciones por idioma, ni si habra etapas de ajuste posteriores.

Tampoco hay informacion sobre innovaciones tecnicas concretas mas alla de la ponderacion regional del corpus, que es una decision de muestreo de datos y no un cambio arquitectonico. El repositorio de GitHub asociado contiene, segun la model card, especificaciones, documentacion y estructura de datasets, pero ningun artefacto de modelo.

## Capacidades

- No hay capacidades verificables: el modelo no existe como artefacto ejecutable.
- El objetivo declarado es representacion de texto (encoder), no generacion autoregresiva.
- Uso previsto en tareas de comprension: clasificacion, NLI y reconocimiento de entidades nombradas.
- Cobertura linguistica objetivo: espanol de America Latina, portugues de Brasil, ingles, quechua, guarani y nahuatl.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multimodales (vision, audio): no disponible.

## Casos de uso

Los siguientes escenarios son aplicaciones plausibles del objetivo declarado, no capacidades demostradas del modelo actual:

- Clasificacion de texto regional: un encoder afinado para sentiment analysis o clasificacion de topicos sobre espanol de America Latina, donde los modelos multilingues genericos reparten capacidad de forma desproporcionada.
- Reconocimiento de entidades nombradas: el proyecto define RegioNER, con tipos de entidad regionales, lo que sugiere uso en extraccion de entidades sobre prensa y documentos locales.
- Inferencia de lenguaje natural (NLI): el benchmark AmeriNLI apunta a tareas de entailment y deteccion de contradiccion en espanol latinoamericano y portugues brasileno.
- Busqueda semantica y recuperacion: representaciones densas para indexar documentacion en portugues de Brasil sin depender de un modelo entrenado mayoritariamente con portugues europeo.
- Procesamiento de lenguas indigenas: aplicaciones de preservacion y analisis de texto en quechua, guarani y nahuatl, con la advertencia de que la disponibilidad de corpus para estas lenguas condicionara cualquier resultado real.
- Moderacion de contenido y filtrado: clasificadores de toxicidad o spam adaptados a variedades regionales del espanol.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no existen puntuaciones de AmeriXLM y que se publicaran cuando el modelo este entrenado y el codigo y los datos de evaluacion sean publicos.

## Requisitos de hardware

- VRAM estimada: no disponible, al no existir pesos ni tamano definido.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue: no disponible; al ser un encoder de 512 tokens, el despliegue previsible pasaria por ONNX Runtime, Text Embeddings Inference o vLLM, pero no hay artefacto que servir.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AmeriXLM | no disponible (sin decidir) | 512 (objetivo) | es, pt, en, qu, gn, nah | Apache 2.0 | Sin pesos publicados |
| XLM-RoBERTa | 278M (base) / 560M (large) | 512 | 100 idiomas | MIT | Pesos publicados |
| mBERT | 178M | 512 | 104 idiomas | Apache 2.0 | Pesos publicados |
| RoBERTa-base | 125M | 512 | en | MIT | Pesos publicados |

La comparacion es estructural: AmeriXLM comparte la familia arquitectonica con los tres modelos citados, pero no es hoy una alternativa ejecutable a ninguno de ellos.

## Limitaciones y advertencias

- El modelo no esta entrenado y el repositorio no contiene pesos, tokenizer ni configuracion; cualquier intento de carga falla.
- Las especificaciones de la model card son objetivos declarados y pueden cambiar sin aviso.
- No hay datos de sesgo, alucinacion ni calidad medidos, porque no hay modelo que medir.
- La licencia Apache 2.0 figura en los metadatos, pero al no existir artefacto no hay terminos efectivos de uso comercial que aplicar.
- El rendimiento en quechua, guarani y nahuatl dependera de la disponibilidad real de corpus; la model card no aporta cifras.
- No debe citarse como modelo publicado; los autores lo desaconsejan explicitamente.

## Enlaces

- Hugging Face: https://huggingface.co/genia-americas/ameri-xlm
- Repositorio GitHub: https://github.com/GENIA-Americas/multimodal-ai-americas
- DOI (Zenodo): https://doi.org/10.5281/zenodo.20437260
- Plataforma: https://www.glapagos.com
- Red: https://www.racefor.ai

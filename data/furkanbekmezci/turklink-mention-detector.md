# furkanbekmezci/turklink-mention-detector

## Resumen

TurkLink Turkish mention detector es un modelo de clasificación de tokens (detección de menciones de entidades) para turco, desarrollado por el usuario de Hugging Face furkanbekmezci como componente del pipeline de enlazado de entidades TurkLink-EL. Se trata de un fine-tuning de dbmdz/bert-base-turkish-cased (BERTurk) con una cabeza de etiquetado BIO (O/B-ENT/I-ENT) que identifica los tramos de texto que corresponden a menciones de entidades, sin asignarles identificadores Q-ID de Wikidata. La supervisión es débil y se deriva de los hipervínculos de la Wikipedia turca, no de anotación manual exhaustiva.

El modelo resuelve la primera fase de un sistema de entity linking: aislar la mención dentro del texto bruto para que un recuperador posterior la resuelva contra un catálogo de 3.958.456 Q-IDs. Su relevancia es acotada pero clara para la comunidad de PLN turca, donde los recursos de enlazado de entidades son escasos: se publica junto a un corpus (TurkLink), un paquete reproducible con informes de evaluación y un bundle completo (frcturus/turklink-el) bajo licencia CC BY-SA 4.0.

Se trata de un piloto con 0 descargas y 0 "likes" en el momento de la consulta, con un tamaño de repositorio de 0,4 GB y 110.029.059 parámetros. Las métricas publicadas corresponden al pipeline completo TurkLink-EL, no a este componente aislado, tal como advierte el propio autor. No se especifica la longitud de contexto en la model card.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (base model: dbmdz/bert-base-turkish-cased) con cabeza de clasificación de tokens BIO (O/B-ENT/I-ENT) |
| Parámetros totales | 110.029.059 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (no se declara en la model card) |
| Tipos de cuantización | no disponible; solo se publican pesos en safetensors (aproximadamente fp32, deducido del recuento de parámetros y del tamaño del repositorio) |
| Idiomas soportados | Turco (tr) |
| Licencia | cc-by-sa-4.0 (pesos y artefactos derivados del corpus); el código fuente del bundle es Apache-2.0; los avisos de los modelos preentrenados siguen aplicando (MiniLM: Apache-2.0; BERTurk: MIT) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer BERT base (12 capas, representación de tipo BERTurk cased) con una cabeza de token classification que emite etiquetas BIO para delimitar menciones. El modelo no genera Q-IDs: únicamente devuelve spans de caracteres en Python (por ejemplo, `model.detect("Apple İstanbul'da yeni mağazasını açtı.")`), y el enlazado se delega en otros componentes del pipeline TurkLink-EL. No se publica en la información disponible la configuración exacta de hiperparámetros, la composición del dataset de entrenamiento ni si hubo fases de RLHF o DPO (en un modelo encoder de clasificación de tokens no serían de aplicación en cualquier caso).

El entrenamiento se basa en supervisión débil a partir de hipervínculos de la Wikipedia turca, usando el corpus TurkLink (Akdaş & Tantuğ, 2026, DOI 10.1016/j.procs.2026.01.041), con revisión de dataset `c8d7fe7bdd0ae934268d30ef64f6444940bdf6dc`. Se preserva la pertenencia a los splits oficiales y el muestreo se hace por documento, con semilla 42 y documentos seleccionados de 28.310 / 2.350 / 2.353 para train / validation / test. El catálogo incorpora además 449 entidades de entrenamiento ausentes, recuperadas mediante fallback de etiquetas en turco, multilingüe e inglés de Wikidata, con instantánea congelada en `wikidata-supplement.jsonl` dentro del bundle completo; según el autor, no se usaron etiquetas de test para esa reparación. Las configuraciones efectivas y los historiales de validación están en `training.json` de cada componente, y el bundle incluye receta completa reproducible (no ejecutada para este piloto). Como innovación destacable no hay ninguna contribución arquitectónica: el valor aportado es el corpus, el pipeline y los informes de evaluación; se advierte que los kernels de coma flotante en GPU y la construcción paralela de HNSW pueden variar ligeramente entre máquinas.

## Capacidades

- Detección de menciones de entidades en texto turco con etiquetado BIO (O/B-ENT/I-ENT), devolviendo spans de caracteres en Python.
- Integración como primer componente de un pipeline de enlazado de entidades contra un catálogo de 3.958.456 Q-IDs (la asignación de Q-ID no la realiza este modelo).
- Inferencia en CPU declarada explícitamente por el autor (`model = MentionDetector("frcturus/turklink-mention-detector", device="cpu")`).
- Manejo de rasgos de caso y apóstrofo propios del turco, compartidos entre entrenamiento e inferencia.
- Compatibilidad con el pipeline `token-classification` de la librería `transformers` y con Hugging Face Inference Endpoints (etiqueta `endpoints_compatible`).
- Capacidad de abstención basada en umbral, no en un detector NIL entrenado.
- No dispone de modo de razonamiento ("thinking"), ni de capacidades de visión, audio, tool calling o agentes; no es un modelo generativo.

## Casos de uso

- Preprocesado para enlazado de entidades en turco: el modelo aísla menciones en texto bruto como paso previo al recuperador de Q-IDs del pipeline TurkLink-EL, reduciendo el espacio de búsqueda antes de consultar el catálogo de 3,9 millones de entidades.
- Enriquecimiento de archivos periodísticos turcos: extracción de menciones sobre hemeroteca digital para construir índices navegables por entidad, con revisión humana posterior dado que la supervisión es débil y no exhaustiva.
- Construcción y mantenimiento de grafos de conocimiento: detección de menciones en documentación corporativa turca para poblar nodos de un grafo enlazados después a Wikidata.
- Asistencia a anotadores humanos: preanotación automática de menciones en proyectos de etiquetado de corpus turcos, dejando al anotador la validación y la asignación del Q-ID correcto.
- Análisis de contenido y monitorización de redes sociales en turco: identificación de organizaciones, personas y lugares mencionados en publicaciones para paneles de tendencias o alertas temáticas.
- Extracción de entidades en motores de búsqueda internos: preprocesado de consultas y documentos turcos para habilitar búsqueda facetada por entidad, aceptando el coste de falsos positivos derivado de la referencia por hipervínculos dispersos.
- Etiquetado de recomendación y publicidad contextual: detección de entidades mencionadas en artículos turcos para clasificación temática y asignación de categorías.
- Investigación en PLN turca: banco de pruebas reproducible para estudiar supervisión débil y transferencia de dominio con los splits oficiales del corpus TurkLink.

## Benchmarks y rendimiento

Los resultados publicados corresponden al pipeline completo TurkLink-EL (componente `frcturus/turklink-el`), no a este detector de menciones de forma aislada, según advierte el propio autor. Se reproducen tal cual, sin reinterpretación.

| Dataset | Menciones | Accuracy / micro-F1 | R@1 | R@5 | R@10 | R@32 | Cobertura del catálogo |
|---|---:|---:|---:|---:|---:|---:|---:|
| mewsli-9-tr | 5811 | 0,8226 | 0,7567 | 0,8845 | 0,9029 | 0,9248 | 0,9955 |
| mewsli-x-tr-dev | 262 | 0,9008 | 0,7863 | 0,9389 | 0,9542 | 0,9656 | 0,9962 |
| mewsli-x-tr-test | 1215 | 0,8593 | 0,7778 | 0,8963 | 0,9185 | 0,9342 | 0,9951 |
| test | 2000 | 0,8020 | 0,7500 | 0,8695 | 0,8900 | 0,9050 | 0,9985 |
| validation | 2000 | 0,8335 | 0,7725 | 0,8900 | 0,9105 | 0,9335 | 0,9980 |

Proxy extremo a extremo sobre texto bruto (incluye detección de menciones):

| Dataset | Ventanas | Precisión EL | Recuperación EL | Micro-F1 EL | Micro-F1 de menciones |
|---|---:|---:|---:|---:|---:|
| test | 300 | 0,2286 | 0,6429 | 0,3372 | 0,4052 |
| validation | 300 | 0,2073 | 0,6559 | 0,3150 | 0,3669 |

Advertencias del autor sobre estas cifras: los spans gold se proporcionan a la tabla; la accuracy equivale al micro-F1 porque cada mención tiene un Q-ID gold y uno predicho; las entidades gold ausentes del catálogo cuentan como fallo; la recuperación de candidatos nunca inserta la respuesta correcta. Los resultados de Mewsli son transferencia de dominio supervisada en turco contra este catálogo, no el protocolo zero-shot original de XTREME-R. Las métricas extremo a extremo de TurkLink son proxies de hipervínculos dispersos y no deben presentarse como accuracy exhaustiva de NER. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,42 GiB en fp32 (110 M de parámetros a 4 bytes) y 0,21 GiB en fp16, más el consumo de activaciones y del tokenizador.
- Repositorio de 0,4 GB en disco, coherente con pesos en safetensors de precisión simple.
- GPU recomendadas: no se especifica ninguna; el modelo cabe holgadamente en cualquier GPU con 2 GB o más de memoria, incluidas RTX 3060, RTX 4090, A100 y H100, todas ellas sobredimensionadas para este tamaño.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna e incluso en GPU integradas o en CPU. El autor documenta explícitamente el uso con `device="cpu"`.
- Opciones de despliegue: pipeline `token-classification` de la librería `transformers`, exportación a ONNX Runtime o TorchScript, servicio propio con FastAPI o TorchServe, y Hugging Face Inference Endpoints (el modelo lleva la etiqueta `endpoints_compatible`). vLLM no es aplicable directamente porque el modelo no es generativo.
- Latencia y throughput estimados: no disponible; no se publican mediciones de latencia ni de tokens por segundo.
- Nota de cómputo: el autor advierte de que los kernels de coma flotante en GPU y la construcción paralela de HNSW (en el pipeline de recuperación) pueden diferir ligeramente entre máquinas.

## Comparativa con modelos similares

Comparativa orientativa de alternativas de la misma categoría (encoder BERT turco para NER o enlazado de entidades). Los datos de rendimiento de los modelos alternativos no están disponibles en la información proporcionada, por lo que la comparación se limita a parámetros, contexto, licencia y disponibilidad.

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| furkanbekmezci/turklink-mention-detector | 110.029.059 | no disponible | Detección de menciones BIO (turco), sin Q-ID | cc-by-sa-4.0 | Hugging Face, 0 descargas, piloto |
| dbmdz/bert-base-turkish-cased | aproximadamente 110 M | no disponible | Modelo base BERTurk, sin cabeza de NER | no disponible | Hugging Face, ampliamente usado |
| dbmdz/bert-base-turkish-cased-ner (derivados NER de BERTurk) | aproximadamente 110 M | no disponible | NER genérico en turco (PER, LOC, ORG) | no disponible | Hugging Face |
| mGENRE (enlazado de entidades multilingüe generativo) | no disponible | no disponible | Enlazado de entidades multilingüe con generación de títulos | no disponible | Repositorio académico |

Diferencias relevantes: frente a los modelos NER genéricos de BERTurk, este modelo no predice tipos de entidad (persona, lugar, organización), sino únicamente el span de mención, y está diseñado para alimentar un catálogo de Wikidata de 3,9 millones de Q-IDs; además, su licencia CC BY-SA 4.0 impone condiciones de compartir igual que no aplican, en principio, a los derivados de BERTurk bajo MIT. No se dispone de comparaciones de rendimiento medidas entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Supervisión débil: la anotación procede de hipervínculos de la Wikipedia turca, por lo que no es exhaustiva y puede omitir menciones válidas.
- El modelo no asigna Q-IDs: solo devuelve spans de caracteres; el enlazado depende del resto del pipeline.
- La abstención se basa en un umbral y no en un detector NIL entrenado; no hay clase NIL aprendida.
- La confianza está calibrada para un Q-ID dada una mención proporcionada, no para la corrección de la mención en sí, y puede desplazarse según el dominio.
- Los rasgos de caso y apóstrofo del turco se comparten entre entrenamiento e inferencia; no es un desambiguador morfológico completo.
- El corpus, las anotaciones automáticas, las descripciones traducidas y el catálogo histórico pueden contener errores.
- El rendimiento puede degradarse en dominios nuevos, entidades nuevas, sustantivos comunes y menciones ambiguas.
- Las métricas publicadas corresponden al pipeline completo TurkLink-EL, no a este componente aislado; no deben atribuirse al detector de menciones.
- Las métricas extremo a extremo sobre texto bruto son proxies de hipervínculos dispersos (micro-F1 EL de 0,3372 en test) y no una accuracy exhaustiva de NER; no son adecuadas para prometer calidad de producción.
- Licencia CC BY-SA 4.0 en pesos y artefactos derivados del corpus, con obligación de atribución a TurkLink y de compartir igual: conviene revisar las implicaciones antes de uso comercial o de redistribución de derivados. El código fuente del bundle es Apache-2.0 y los avisos de los modelos preentrenados siguen aplicando (MiniLM Apache-2.0, BERTurk MIT).
- Inconsistencia de identificador: el ejemplo de código de la model card invoca `frcturus/turklink-mention-detector`, mientras que el repositorio consultado es `furkanbekmezci/turklink-mention-detector`. Hay que verificar cuál es el artefacto canónico antes de integrarlo.
- Estado de piloto: 0 descargas y 0 likes, con receta completa reproducible no ejecutada; las fechas de creación y actualización son posteriores a septiembre de 2026, lo que sugiere un artefacto muy reciente y con poca validación externa.
- No se declara longitud de contexto ni se publican pesos cuantizados, por lo que cualquier cuantización sería un proceso propio del usuario.
- El autor indica que no se envió texto de usuarios a ningún LLM externo durante el entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/furkanbekmezci/turklink-mention-detector
- Pipeline completo TurkLink-EL: https://huggingface.co/frcturus/turklink-el
- Corpus TurkLink: https://huggingface.co/datasets/yakdas/turklink-corpus
- Modelo base BERTurk: https://huggingface.co/dbmdz/bert-base-turkish-cased
- Publicación de referencia (Akdaş & Tantuğ, 2026): https://doi.org/10.1016/j.procs.2026.01.041
- Nota: la búsqueda web realizada no devolvió ningún enlace relevante sobre el modelo; los resultados obtenidos correspondían a contenidos sin relación (fichas de consumo de un vehículo Audi SQ8). No se dispone de paper propio, blog, repositorio de código ni demo adicionales en la información proporcionada.

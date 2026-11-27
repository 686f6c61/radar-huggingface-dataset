# ndrcsr/tarnkappe

## Resumen

Tarnkappe es un detector de datos personales (PII) para inglés y alemán, desarrollado por BetterPrivacy (autor de Hugging Face: ndrcsr). No es un modelo generativo, sino un etiquetador de tokens (token-classification) especializado en localizar información personal en texto: nombres, organizaciones, lugares, direcciones, correos electrónicos, teléfonos, IBAN, números de tarjeta e IPs. Su propuesta de valor es la eficiencia: un BiGRU de solo 2,5 millones de parámetros que corre en CPU a unos 1,5 ms por texto corto, sin necesidad de GPU ni de PyTorch en tiempo de ejecución.

El sistema es híbrido. La red neuronal se encarga de las entidades no estructuradas (personas, organizaciones y lugares), mientras que expresiones regulares, validaciones de checksum y la librería libphonenumber de Google cubren los datos estructurados. Está pensado específicamente para páginas web escaneadas, con un segundo filtro para detecciones de empresas y la posibilidad de compartir nombres entre todas las páginas de un mismo escaneo.

Es relevante ahora porque ofrece una alternativa ligera y desplegable en cualquier infraestructura para tareas de anonimización y cumplimiento del RGPD/DSGVO, con licencias abiertas (código Apache 2.0, pesos CC BY-SA 4.0) y entrenamiento exclusivamente sobre datos con licencia abierta. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que es un proyecto reciente y de nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BiGRU (etiquetador de tokens) sobre vectores de palabras congelados, más módulos de patrones y checksums |
| Parametros totales | 2,5 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (por defecto, 5 MB) y float32 (10 MB) |
| Idiomas soportados | inglés y alemán |
| Licencia | pesos CC BY-SA 4.0; código Apache 2.0 |
| Formato de pesos | ONNX (tagger.int8.onnx, tagger.onnx, orgcheck.onnx) y NPZ (vectors.npz) |

## Arquitectura y entrenamiento

El modelo es un etiquetador de tokens basado en una BiGRU de 2,5 millones de parámetros que opera sobre vectores de palabras congelados (procedentes de `en_core_web_md` y `de_core_news_md` de spaCy). No emplea un transformer; la arquitectura es deliberadamente compacta para maximizar la velocidad en CPU. El sistema completo combina la red neuronal con patrones, validaciones de checksum y libphonenumber para los datos estructurados, y añade un segundo modelo (`orgcheck.onnx`) con un léxico de organizaciones para filtrar detecciones de empresas y un fichero de instituciones conocidas sin forma jurídica.

El entrenamiento se realizó exclusivamente sobre datos con licencia abierta: UNER English EWT (CC BY-SA 4.0), GermEval 2014, WNUT 2017 y Broad Twitter Corpus (CC BY 4.0), párrafos de Wikipedia en inglés y alemán etiquetados por GLiNER2-PII (texto CC BY-SA 4.0), nombres de empresas de fuentes CC0, plantillas de Presidio Research (MIT) y frases generadas. No se recopilaron datos personales reales para el entrenamiento; las páginas reales etiquetadas a mano se usan solo para pruebas. No se menciona el uso de RLHF ni DPO, algo esperable en un modelo de este tipo.

## Capacidades

- Detección de personas, separando nombre y apellido.
- Detección de organizaciones y lugares.
- Detección de calles y códigos postales.
- Detección de correos electrónicos, teléfonos, IBAN, números de tarjeta e IPs.
- Anonimización y redacción: el método `redact` sustituye cada entidad por su etiqueta, por ejemplo `[FIRST_NAME]`, `[EMAIL]`.
- Perfil `pages` para páginas web, con un segundo filtro sobre detecciones de empresas.
- Función `detect_scan` para compartir nombres de empresas entre todas las páginas de un escaneo de una misma persona.
- Inferencia en CPU sin GPU ni PyTorch en tiempo de ejecución.
- Multilingüe limitado a inglés y alemán.

## Casos de uso

- Cumplimiento del RGPD/DSGVO: el modelo puede escanear textos y páginas web para localizar datos personales antes de publicarlos o almacenarlos, reduciendo el riesgo de exposición y facilitando auditorías de privacidad.
- Anonimización de documentos antes de compartirlos: con `redact` se sustituyen nombres, correos, teléfonos e IBAN por etiquetas, lo que permite publicar o enviar textos sin datos identificativos.
- Escaneo de exposición web de una persona: con `detect_scan` se procesan muchas páginas de un mismo individuo compartiendo los nombres de empresa entre ellas, útil para servicios de privacidad como el de BetterPrivacy.
- Preprocesado de corpus para investigación: al correr en CPU a unos 600 textos por segundo, permite filtrar grandes volúmenes de texto antes de entrenar modelos o publicar datasets.
- Enmascarado en pipelines de atención al cliente: detecta teléfonos, correos e IBAN en conversaciones o tickets antes de almacenarlos en sistemas de registro.
- Procesamiento en entornos sin GPU: al pesar 5 MB en int8 y requerir unos 270 MB de memoria, se puede desplegar en servidores modestos, contenedores o dispositivos de borde.
- Detección de datos estructurados en formularios o logs: los patrones y checksums permiten validar IBAN, tarjetas y teléfonos europeos (99,2 % de detección en el test sintético de 40 países).

## Benchmarks y rendimiento

Datos publicados en la model card del autor:

| Prueba | Resultado |
|---|---|
| Personas en páginas web reales etiquetadas a mano (perfil `pages`) | 100 % encontradas, 92,1 % de detecciones correctas |
| Organizaciones en páginas web reales etiquetadas a mano (perfil `pages`) | 87,9 % encontradas, 89,9 % de detecciones correctas |
| Organizaciones en noticias políticas y blogs (test más pequeño) | 71 % encontradas |
| Personas en texto web inglés (UNER EWT test) | 96,2 % encontradas |
| Personas en Wikipedia/noticias alemanas (GermEval 2014 test) | 96,5 % encontradas |
| Personas en tuits (Broad Twitter Corpus test) | 82,2 % encontradas |
| Personas en texto de redes sociales (WNUT 2017 test) | 83,9 % encontradas |
| Todo el PII en frases de Microsoft Presidio (plantillas no vistas en entrenamiento) | 97,5 % encontrado, 96,3 % de detecciones reales |
| Teléfonos europeos de 40 países (test sintético held-out) | 99,2 % encontrados |
| Empresas en extractos de Wikipedia inglesa no vistas en entrenamiento | 82,6 % encontradas |

Velocidad: 1,5 ms de mediana por texto corto, unos 600 textos por segundo en un núcleo de CPU y unos 270 MB de memoria.

## Requisitos de hardware

- VRAM: no aplica; el modelo está diseñado para CPU.
- Memoria RAM: unos 270 MB en ejecución.
- GPU recomendadas: ninguna necesaria; puede correr en cualquier CPU.
- Cabe en cualquier hardware consumer, incluidos portátiles y dispositivos de borde.
- Despliegue: paquete Python `tarnkappe` (instalable desde GitHub), ONNX Runtime; los pesos se cargan desde el Hub con `snapshot_download` o vienen incluidos en el paquete. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo.
- Latencia y throughput: 1,5 ms de mediana por texto corto y unos 600 textos por segundo en un núcleo de CPU.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| Tarnkappe | BiGRU + patrones, ONNX | 2,5 M | en, de | CC BY-SA 4.0 (pesos), Apache 2.0 (código) | PII en CPU, páginas web |
| Microsoft Presidio | Framework de analizadores y reconocedores | no disponible | varios | MIT | PII con motores NLP intercambiables |
| GLiNER2-PII | Modelo de NER zero-shot | no disponible | multilingüe | no disponible | PII con transformers |
| spaCy NER (`en_core_web_md` / `de_core_news_md`) | CNN/transformer NER | no disponible | en, de | MIT | NER general, no específico de PII |

No se dispone de datos de rendimiento comparables de los otros modelos en la información proporcionada, por lo que no se puede establecer una comparación cuantitativa directa.

## Limitaciones y advertencias

- Solo soporta inglés y alemán.
- Las marcas pequeñas sin contexto a veces se pierden o se confunden con personas.
- Rendimiento más débil en texto informal: alrededor del 82-84 % de personas encontradas en tuits y redes sociales.
- No es una garantía de anonimización ni de cumplimiento legal; el autor indica que se use para reducir datos personales, no como solución definitiva.
- Puede pasar por alto entidades; conviene combinarlo con revisión humana en contextos sensibles.
- La licencia de los pesos es CC BY-SA 4.0: si se publica una versión modificada, hay que mantener la licencia y los créditos en el fichero `NOTICE`.
- El código es Apache 2.0, pero los pesos no; revisar la compatibilidad con el uso comercial previsto.
- No se han publicado datos sobre sesgos específicos más allá de las limitaciones de idioma y dominio indicadas.
- Repositorio con 0 descargas y 0 likes: proyecto reciente, sin validación independiente conocida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ndrcsr/tarnkappe
- Código, scripts de entrenamiento y resultados: https://github.com/ncserny/betterprivacy-tarnkappe
- Resultados detallados: https://github.com/ncserny/betterprivacy-tarnkappe/blob/main/RESULTS.md
- BetterPrivacy: https://betterprivacy.me
- GLiNER2-PII (usado para etiquetar datos de entrenamiento): https://huggingface.co/fastino/gliner2-privacy-filter-PII-multi

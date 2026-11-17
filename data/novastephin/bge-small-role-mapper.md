# Novastephin/bge-small-role-mapper

## Resumen

Novastephin/bge-small-role-mapper es un modelo de embeddings de frases derivado de BAAI/bge-small-en-v1.5, un transformer tipo BERT de 33,36 millones de parametros. El autor lo ha ajustado finamente para una tarea concreta: mapear titulos de puesto y descripciones de empleo a una lista maestra de roles laborales, devolviendo embeddings normalizados que permiten asignar cada oferta o candidato al rol mas proximo por similitud coseno.

El modelo no genera texto ni razona: es un extractor de caracteristicas (feature-extraction) pensado para producir representaciones vectoriales. Su utilidad practica esta en pipelines de recursos humanos, agregadores de ofertas de empleo y sistemas de normalizacion de catalogos de puestos, donde la variabilidad de nomenclatura (por ejemplo, "Java Dev", "Backend Engineer (Java)" o "Desarrollador Java Senior") impide un emparejamiento exacto por cadenas.

La relevancia de este modelo es acotada: se publico en noviembre de 2026, no tiene descargas ni likes registrados, carece de licencia declarada y su model card es minima. Debe tratarse como un experimento o artefacto de nicho, no como un modelo listo para produccion sin evaluacion previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (base: BAAI/bge-small-en-v1.5) |
| Parametros totales | 33.360.000 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base bge-small-en-v1.5 admite 512 tokens) |
| Tipos de cuantizacion | no disponible (el repo incluye pesos ONNX; el tag base_model:quantized sugiere una variante cuantizada del modelo base) |
| Idiomas soportados | no disponibles (el modelo base esta orientado a ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors y ONNX (carpeta `onnx/`) |
| Pooling | CLS con embeddings normalizados (segun model card) |
| Tamano del repo | 0,3 GB |
| Libreria | sentence-transformers, transformers.js |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer BERT de 12 capas y dimension oculta 384, heredada de BAAI/bge-small-en-v1.5, un modelo de embeddings ingleses de la familia BGE. El ajuste fino se ha realizado con sentence-transformers sobre pares de titulos o descripciones de empleo y roles de una lista maestra, optimizando la similitud entre la representacion del texto de entrada y la del rol objetivo. La model card indica el uso de pooling sobre el token CLS con normalizacion L2 de los embeddings.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset, el numero de tokens vistos ni si se aplicaron tecnicas de contraste (por ejemplo, MultipleNegativesRankingLoss) u otras funciones de perdida. Tampoco se documenta si hubo etapas de destilacion, cuantizacion posterior al entrenamiento (mas alla de los pesos ONNX incluidos) ni evaluacion cuantitativa del ajuste.

## Capacidades

- Generacion de embeddings de frases para similitud semantica y recuperacion por vecindad.
- Mapeo de titulos de puesto y descripciones de empleo a una taxonomia maestra de roles.
- Normalizacion de catalogos de puestos en sistemas de RRHH y agregadores de ofertas.
- Extraccion de caracteristicas compatible con la pipeline `feature-extraction` de Transformers.
- Exportacion ONNX para ejecucion en navegador o Node.js mediante Transformers.js.
- Compatibilidad declarada con Text Embeddings Inference (tag `text-embeddings-inference`) y con endpoints de Hugging Face (tag `endpoints_compatible`).
- No soporta generacion de texto, tool calling, razonamiento multi-paso, vision, audio ni modo thinking.

## Casos de uso

- Normalizacion de ofertas de empleo: cada titulo o descripcion se convierte en un embedding y se compara por similitud coseno contra los embeddings precalculados de la lista maestra de roles; el rol con mayor similitud se asigna como categoria canonica.
- Deduplicacion de vacantes en portales de empleo: dos anuncios con redacciones distintas del mismo puesto generan vectores proximos, lo que permite agrupar duplicados antes de indexarlos.
- Enrutamiento de candidatos en ATS: al recibir un CV con un titulo no estandar, el sistema calcula el embedding y lo asigna al rol interno correspondiente para disparar el flujo de seleccion adecuado.
- Busqueda semantica en bolsas de trabajo: indexar vacantes con este modelo y recuperar por similitud ante consultas libres del usuario, sin depender de coincidencia exacta de palabras clave.
- Analitica de mercado laboral: clasificar grandes volumenes de ofertas en categorias homogeneas para calcular demanda por rol, tendencias salariales o distribucion geografica.
- Etiquetado asitido de datos de RRHH: preasignar roles a un corpus historico de descripciones para que un revisor humano valide o corrija, reduciendo el coste del etiquetado manual.
- Ejecucion en el cliente: gracias a los pesos ONNX y Transformers.js, el mapeo puede realizarse en el navegador sin enviar descripciones de empleo a un servidor, lo que ayuda con requisitos de privacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, MTEB, HumanEval ni de evaluacion especifica de la tarea de mapeo de roles, ni comparaciones con alternativas.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en fp32 (33,36 millones de parametros, aproximadamente 130 MB de pesos); en torno a 35-70 MB en cuantizaciones de 8 o 4 bits.
- GPU recomendadas: cualquier GPU moderna sirve; una RTX 4090, A100 o H100 esta sobredimensionada para este modelo. Una GPU consumer de gama baja (GTX 1650, RTX 3050) o incluso CPU es suficiente para lotes moderados.
- Cabe holgadamente en cualquier GPU consumer, incluidos portatiles con grafica integrada para inferencia en CPU.
- Opciones de despliegue: sentence-transformers, Transformers.js (con los pesos ONNX de `onnx/`), Text Embeddings Inference (tag declarado) y endpoints de Hugging Face.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo se espera del orden de milisegundos por frase en GPU y decenas de milisegundos en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Novastephin/bge-small-role-mapper | 33,36 M | no disponible | Mapeo de roles laborales | no disponible | Hugging Face, 0 descargas |
| BAAI/bge-small-en-v1.5 | 33,36 M | 512 tokens | Embeddings generales en ingles | MIT (segun el modelo base) | Hugging Face, ampliamente usado |
| all-MiniLM-L6-v2 | 22,7 M | 256 tokens | Embeddings generales en ingles | Apache 2.0 | Hugging Face, ampliamente usado |

La comparacion con alternativas genericas es la relevante: bge-small-en-v1.5 y all-MiniLM-L6-v2 son modelos de embeddings generalistas con licencia conocida y comunidad amplia, mientras que este ajuste aporta una especializacion en roles laborales pero sin licencia declarada ni evaluacion publicada. No hay datos de rendimiento que permitan afirmar que supera a sus alternativas en la tarea de mapeo.

## Limitaciones y advertencias

- Licencia no declarada: no hay autorizacion explicita para uso comercial; debe contactarse con el autor o asumirse riesgo legal.
- Idiomas no declarados y modelo base orientado al ingles: el rendimiento en castellano u otros idiomas es incierto y probablemente degradado.
- Ajuste fino sobre una lista maestra de roles no documentada: la taxonomia de salida es desconocida y puede no coincidir con la del usuario.
- Sin evaluacion publicada: no hay evidencia cuantitativa de precision en el mapeo ni de robustez ante titulos ambiguos o descripciones largas.
- Riesgo de asignaciones erroneas en roles con fronteras difusas (por ejemplo, "Data Engineer" frente a "Analytics Engineer"), que requieren umbral de similitud y revision humana.
- Sin descargas ni likes: no hay senales de validacion por parte de la comunidad.
- La longitud de contexto no esta documentada en la ficha; si se hereda del modelo base, las descripciones de empleo largas se truncaran a 512 tokens.
- No apto para generacion de texto, razonamiento ni tareas fuera de la similitud semantica.
- La model card es minima: no se detalla el proceso de cuantizacion de los pesos ONNX ni su fidelidad respecto a los pesos safetensors.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Novastephin/bge-small-role-mapper
- Modelo base: https://huggingface.co/BAAI/bge-small-en-v1.5
- Documentacion de sentence-transformers: https://www.sbert.net/
- Transformers.js: https://huggingface.co/docs/transformers.js
- Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference

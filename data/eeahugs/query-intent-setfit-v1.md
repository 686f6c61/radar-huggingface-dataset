# eeahugs/query-intent-setfit-v1

## Resumen

`eeahugs/query-intent-setfit-v1` es un clasificador multilingue de intencion de consulta desarrollado por el equipo `eeahugs` para el buscador del sitio web de la Agencia Europea de Medio Ambiente (EEA). Su funcion no es generar texto, sino actuar como puerta de entrada (gate) de un pipeline: decide si una consulta de busqueda es "elegible para IA" (una pregunta en lenguaje natural, una peticion exploratoria o una afirmacion factual) o "no elegible" (recuperacion por palabras clave o documento, o cualquier caso dudoso). Solo las consultas elegibles pueden disparar una llamada a un LLM que genere un resumen; todo lo demas falla en cerrado (no se llama al LLM).

Tecnicamente es un modelo SetFit: un encoder de frases `intfloat/multilingual-e5-small` (384 dimensiones, ~112 M de parametros) congelado mas una cabeza lineal de clasificacion de 384 a 5 etiquetas. El repositorio declara 117.653.760 parametros en `safetensors` y ocupa 0,5 GB. Las cinco etiquetas son `question`, `exploratory`, `claim`, `retrieval` y `unknown`, y el enrutado final es binario: se considera elegible cuando la suma de las probabilidades de las tres etiquetas elegibles alcanza 0,95.

Su relevancia es practica y de coste: en un buscador institucional multilingue, filtrar antes de invocar un LLM reduce llamadas innecesarias y evita resumenes erroneos sobre consultas de recuperacion documental. El modelo cubre 27 idiomas declarados en el campo `language` (el texto de la model card menciona 28, discrepancia no resuelta) y se publica bajo licencia MIT, con la salvedad de que parte de los datos de entrenamiento derivan de NLLB-200 y opus-mt, con licencias no comerciales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SetFit: encoder de frases `intfloat/multilingual-e5-small` (384 dim.) mas cabeza lineal de clasificacion (384 -> 5 etiquetas) |
| Parametros totales | 117.653.760 (~117,7 M) segun `safetensors`; el backbone se declara en 112 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (la model card no especifica limite de tokens de entrada) |
| Tipos de cuantizacion | no disponible; solo se publican pesos `safetensors` en formato SetFit, sin GGUF, ONNX ni versiones cuantizadas |
| Idiomas soportados | 27 declarados: bg, cs, da, de, el, en, es, et, fi, fr, ga, hr, hu, is, it, lt, lv, mt, nl, no, pl, pt, ro, sk, sl, sv, tr |
| Licencia | MIT (modelo); los datos de entrenamiento derivados de NLLB-200 (CC-BY-NC-4.0) y opus-mt (CC-BY-SA-4.0) mantienen sus condiciones |
| Formato de pesos | safetensors (libreria `setfit`); incluye un `manifest.json` propio con `model_version`, `labels`, `eligible_labels` y `abstain_threshold` |

Otros datos del repositorio: tamano 0,5 GB, 0 descargas y 0 likes en el momento de la consulta, creado el 2026-09-18 y actualizado el mismo dia. El pipeline declarado en HuggingFace es "no disponible".

## Arquitectura y entrenamiento

SetFit es un metodo de clasificacion de texto con pocos ejemplos que combina un sentence transformer preentrenado con una cabeza lineal entrenada sobre embeddings de frases. En este caso el backbone es `intfloat/multilingual-e5-small` (revision `614241f`), que produce representaciones de 384 dimensiones, y la cabeza proyecta a cinco clases. El entrenamiento se hizo con los embeddings del backbone y una cabeza lineal, con 2 epocas, tamano de lote 64, learning rate de la cabeza 1e-2, learning rate del backbone 1e-5 y semilla 3 (seleccionada de 3 semillas). En inferencia, el pipeline de servicio aplica casefolding a las consultas; el texto de entrenamiento tambien esta casefolded.

El conjunto de entrenamiento tiene 81.404 filas y procede de cinco estratos declarados por el autor: unas 50.700 filas generadas internamente con Gemma 31B en 17 idiomas; unas 16.800 filas generadas con GPT-5.6-luna en 6 idiomas (cs, el, et, hu, lt, lv); unas 5.800 filas de traduccion automatica con NLLB-200-1.3B para sl y sv; unas 4.500 filas de traducciones heredadas de la version v3 ancladas en ingles para 11 idiomas, usando NLLB y opus-mt; y unas 4.700 filas de un banco corto en ingles escrito a mano y traducido con NLLB/opus. No se menciona RLHF ni DPO: es un clasificador supervisado, no un modelo generativo ajustado por preferencias.

La innovacion relevante no es arquitectonica sino de contrato de servicio. El enrutado es de tres etiquetas elegibles sumadas contra un umbral fijo de 0,95, con abstencion explicita (etiqueta `unknown` y fallo en cerrado ante baja confianza, errores o timeouts). El repositorio incluye un `manifest.json` que actua como contrato de despliegue y fija `eligible_labels` y `abstain_threshold`, y la receta completa es reproducible desde `configs/setfit-v1.yaml`, con el dataset publicado y los examenes fijados por SHA-256 en un `MANIFEST.json`.

## Capacidades

- Clasificacion de intencion de consulta en 5 etiquetas: `question`, `exploratory`, `claim`, `retrieval` y `unknown`.
- Enrutado binario para decidir si se invoca un LLM de resumen: elegible si P(question) + P(exploratory) + P(claim) >= 0,95.
- Clasificacion multilingue en 27 idiomas europeos declarados, sin traduccion previa a ingles.
- Comportamiento de fallo en cerrado: ante baja confianza, error o timeout, la respuesta es "no IA", nunca un resumen incorrecto.
- Integracion directa con la libreria SetFit mediante `SetFitModel.from_pretrained(...)` para obtener probabilidades por etiqueta.
- Exposicion como servicio HTTP: el despliegue de produccion es un servicio FastAPI (`eea-query-intent`) con `POST /v1/classify` y `GET /health`.
- No es un modelo generativo: no redacta texto, no razona paso a paso, no soporta tool calling ni function calling, y no tiene modo de pensamiento, vision ni audio.
- No se documentan capacidades de agentes ni de razonamiento multi-paso; su ambito es la clasificacion de una consulta por peticion.

## Casos de uso

- Enrutado de consultas en el buscador de la EEA: cada consulta que llega al buscador se clasifica primero; si resulta elegible, se genera un resumen con un LLM, y si no, se devuelve el listado de resultados documentales sin coste de generacion.
- Control de costes de LLM en produccion: con una abstencion media de 0,546 sobre el examen congelado, mas de la mitad de las consultas no llegan a invocar el modelo generativo, lo que reduce de forma directa el gasto por token.
- Puerta de seguridad en servicios publicos: el diseno falla en cerrado, de modo que una consulta ambigua o un fallo de red del clasificador se traduce en ausencia de resumen, lo que evita afirmaciones no verificadas en un sitio institucional.
- Prefiltro en pipelines RAG: la etiqueta `retrieval` identifica consultas de recuperacion pura, que pueden enviarse directamente al indice documental sin pasar por el generador de resumenes.
- Analitica de intencion de busqueda: agregando las cinco etiquetas a lo largo del tiempo se puede medir que proporcion de trafico son preguntas reales (`question`), exploraciones (`exploratory`) o afirmaciones a verificar (`claim`), y priorizar contenidos en consecuencia.
- Verificacion de afirmaciones factuales: la etiqueta `claim` aisla consultas que exponen una afirmacion, lo que permite dirigirlas a un flujo de comprobacion con fuentes en lugar de a un resumen generico.
- Atencion multilingue en administraciones europeas: al cubrir 27 idiomas, un mismo servicio puede enrutar consultas en espanol, griego o estonio sin desplegar un clasificador por idioma.
- Microservicio en contenedor: al ocupar 0,5 GB y 117,7 M de parametros, puede desplegarse como contenedor FastAPI replicado horizontalmente detras de un balanceador, con `GET /health` para sondas de Kubernetes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, GLUE, XNLI, etc.) en la informacion disponible. El autor publica unicamente los resultados de un examen interno congelado (exam v2, 23.718 filas, umbral 0,95):

| Metrica | Valor |
|---|---|
| Recuerdo medio de consultas elegibles | 0,859 |
| Peor falso positivo de no-IA por idioma | 0,005 (maltes), dentro del limite del 1 % |
| Abstencion media | 0,546 |

Estos datos proceden de un examen propio del autor, no de una evaluacion independiente, y no son comparables directamente con benchmarks publicos de otros modelos.

## Requisitos de hardware

- VRAM estimada: ~470 MB en fp32 y ~235 MB en fp16 para 117,7 M de parametros; el repositorio completo ocupa 0,5 GB.
- GPU recomendadas: no se requieren. Cualquier GPU con al menos 1-2 GB libres sirve; el modelo esta pensado para ejecutarse en CPU.
- GPU de consumo: cabe en cualquier GPU de consumo actual y en practicamente cualquier GPU de los ultimos diez anos (por ejemplo, GTX 1060 6 GB o superior); tambien en CPU, dado que es un encoder de 112 M de parametros.
- Opciones de despliegue: servicio FastAPI `eea-query-intent` (`POST /v1/classify`, `GET /health`) y carga directa con la libreria `setfit` / `sentence-transformers`. No se documentan pesos GGUF, ONNX ni compatibilidad con vLLM, llama.cpp, Ollama o TGI: al ser un clasificador de encoder, vLLM y llama.cpp no aplican de forma estandar.
- Latencia y throughput: no disponibles. No se publican medidas de latencia por peticion ni de peticiones por segundo.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks comparables en la informacion proporcionada. Como alternativas de la misma categoria (clasificacion de texto multilingue mediante embeddings de frases), las opciones mas directas son:

| Modelo | Parametros | Tipo | Idiomas | Licencia | Rendimiento comparado |
|---|---|---|---|---|---|
| eeahugs/query-intent-setfit-v1 | 117,7 M | SetFit (cabeza lineal sobre e5-small) | 27 | MIT (modelo) | no disponible frente a alternativas |
| intfloat/multilingual-e5-small | 118 M | Encoder de frases (backbone de este modelo) | mas de 90 | MIT | no disponible en esta informacion |
| paraphrase-multilingual-MiniLM-L12-v2 | 118 M | Encoder de frases | mas de 50 | Apache-2.0 | no disponible en esta informacion |
| xlm-roberta-base | 278 M | Encoder transformer multilingue | 100 | MIT | no disponible en esta informacion |

Las cifras de parametros e idiomas de las alternativas son datos publicos de sus respectivas model cards, no resultados medidos en este contexto. La diferencia principal de `query-intent-setfit-v1` es que no es un modelo de proposito general, sino un clasificador de 5 etiquetas ajustado a un contrato de enrutado concreto, con umbral de abstencion fijo; no es reutilizable como modelo de embeddings ni como generador.

## Limitaciones y advertencias

- Modelo de clasificacion, no generativo: no produce texto, no sigue instrucciones y no soporta razonamiento multi-paso, tool calling ni agentes.
- Tasa de abstencion alta: 0,546 de media en el examen congelado. Mas de la mitad de las consultas no obtienen resumen, un comportamiento deliberado pero que limita la cobertura del servicio.
- Idiomas mas debiles: maltes, irlandes e islandes son los peores del examen. El peor falso positivo de no-IA es 0,005 en maltes, dentro del limite del 1 % aceptado por el autor.
- Ambitos fuera de dominio: las consultas de conocimiento general y algunas busquedas factuales cortas en ingles acaban en abstencion. Es un fallo seguro, pero reduce el recuerdo real en produccion.
- Discrepancia de idiomas: el campo `language` lista 27 idiomas, mientras que la model card menciona 28. No se aclara cual es el idioma restante.
- Licencia del modelo frente a licencia de los datos: los pesos se publican bajo MIT, pero el dataset de entrenamiento se publica como CC-BY-NC-4.0 y varios estratos derivan de NLLB-200 (CC-BY-NC-4.0) y opus-mt (CC-BY-SA-4.0). La reutilizacion o redistribucion de los datos subyacentes queda sujeta a esas condiciones no comerciales y de compartir igual.
- Dependencia de un preprocesado concreto: el pipeline de servicio aplica casefolding a las consultas y el entrenamiento tambien esta casefolded; omitir ese paso fuera de ese pipeline puede degradar las probabilidades.
- Umbral fijo y no adaptativo: el corte de 0,95 sobre la suma de tres etiquetas es una decision de producto del autor. Cambiarlo altera de forma directa el equilibrio entre recuerdo y abstencion, y no se publican curvas de calibracion para otros umbrales.
- Evaluacion no independiente: las unicas metricas publicadas provienen de un examen interno del propio autor sobre 23.718 filas; no hay evaluacion de terceros.
- Madurez baja: 0 descargas y 0 likes en el momento de la consulta, publicado el 2026-09-18. No hay evidencia publica de uso en produccion por terceros.
- Riesgo de alucinacion no aplicable al clasificador en si, pero si al LLM que se situe detras: el modelo solo decide si se llama a ese LLM, no controla la fidelidad de su salida.
- Trazabilidad de datos de entrenamiento parcialmente condicionada: dos estratos (Gemma 31B interno y GPT-5.6-luna) dependen de terminos de terceros para la redistribucion de sus salidas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/eeahugs/query-intent-setfit-v1
- Dataset de entrenamiento: https://huggingface.co/datasets/eeahugs/query-intent-setfit-v1-train
- Agencia Europea de Medio Ambiente: https://www.eea.europa.eu
- Backbone `intfloat/multilingual-e5-small`: no se incluye enlace en la model card; el modelo se referencia por nombre y revision `614241f`
- Repositorio del servicio `eea-query-intent` (contiene `configs/setfit-v1.yaml` y `data/MANIFEST.json`): URL no disponible en la informacion proporcionada
- Paper o blog tecnico: no disponible
- Demo publica: no disponible

Nota sobre la busqueda web: los resultados devueltos no guardan relacion con el modelo (paginas de soporte de Google, mapas satelitales y preguntas en ruso y ucraniano), por lo que no se han incorporado como enlaces relevantes.

# Falconiere/agavus-classifier

## Resumen

agavus-classifier es un clasificador de texto juridico para derecho brasileno, desarrollado por Falconiere como parte del proyecto agavus. No es un modelo de lenguaje generativo: es un pipeline lexico determinista (TF-IDF mas regresion logistica multinomial) que enruta consultas y documentos legales hacia dos dominios concretos del Tribunal de Justicia del Distrito Federal y Territorios (TJDFT): derecho de familia (F) y violencia domestica / Maria da Penha (M). Cualquier otra materia se etiqueta como fuera de alcance (O).

Su interes tecnico no reside en la escala, sino en el diseno de calibracion y decision: incorpora temperature scaling y un motor de decision de tres vias (aceptar, diferir, rechazar) con una matriz de costes que penaliza con severidad el enrutado erroneo de casos de violencia domestica hacia familia. El modelo esta pensado para ejecutarse exclusivamente en CPU, sin GPU ni LLM en el nucleo, lo que reduce costes y hace el comportamiento auditable.

El repositorio de Hugging Face no contiene pesos en el sentido habitual: el artefacto es una base de datos SQLite (`models.db`) con vocabulario, pesos, temperatura e informes de entrenamiento. El modelo esta orientado a un unico idioma (portugues) y su licencia es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TF-IDF (palabras 1-2 gramos, caracteres 3-gramos, features con negacion, verbos de decision, flags de citacion) + regresion logistica multinomial + temperature scaling + decision de tres vias sensible a costes |
| Parametros totales | no disponible (modelo lineal; el numero de coeficientes depende del vocabulario, no publicado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo lexico de bolsa de n-gramos, sin ventana de atencion) |
| Tipos de cuantizacion | no aplica (pesos en coma flotante dentro de SQLite; no se distribuyen en GGUF ni safetensors) |
| Idiomas soportados | portugues (pt) |
| Licencia | Apache-2.0 |
| Formato de pesos | SQLite (`models.db`) con vocabulario, pesos, temperatura e informes de entrenamiento |

## Arquitectura y entrenamiento

El pipeline es completamente lexico y determinista. La entrada se vectoriza con TF-IDF combinando n-gramos de palabra (1-2), n-gramos de caracter (3), features con alcance de negacion, verbos de decision y marcas de citacion normativa. Sobre esa representacion se ajusta una regresion logistica multinomial mediante descenso de gradiente de lote completo, con balanceo de clases. La salida se calibra con temperature scaling (temperatura 0,30) y se somete a una decision de tres vias sensible a costes, con una matriz de perdidas que fija un techo de seguridad: enrutar un caso de Maria da Penha como derecho de familia cuesta 10, mientras que rechazarlo cuesta 8.

Los datos de entrenamiento son exclusivamente fuentes publicas y sinteticas: 357 documentos de estatutos brasilenos consolidados en Planalto (Lei 11.340/2006, Lei 12.318/2010, Lei 13.058/2014, Lei 14.994/2024 y los articulos 1.511-1.783 del Codigo Civil, libro de familia), repartidos en 282 documentos del area F y 75 del area M, mas consultas semilla sinteticas redactadas por el autor. No se emplean casos reales ni datos personales, en cumplimiento de la LGPD. La ingesta de metadatos de casos del TJDFT via DataJud esta implementada pero no incluida en el artefacto publicado. En el momento del entrenamiento se reservo un holdout de 329 ejemplos de entrenamiento y 83 de validacion, con accuracy 0,90 y ECE 0,044.

## Capacidades

- Clasificacion de texto juridico en tres etiquetas: F (derecho de familia), M (violencia domestica / Maria da Penha) y O (fuera de alcance).
- Enrutado con confianza calibrada: la salida incluye probabilidades calibradas mediante temperature scaling.
- Decision de tres vias: aceptar, diferir o rechazar, en lugar de forzar siempre una prediccion.
- Deteccion de negacion y de verbos de decision en el texto de entrada.
- Reconocimiento de citas normativas como senal de clasificacion.
- Ejecucion exclusiva en CPU, sin dependencia de GPU ni de un LLM.
- No soporta tool calling, function calling, agentes, vision, audio ni generacion de texto.
- Multilingue: no; unicamente portugues.

## Casos de uso

- Triaje de consultas en un juzgado o defensoría: el clasificador recibe la consulta y la enruta al area F o M, o la marca como fuera de alcance, permitiendo derivar el caso al equipo correcto sin intervencion manual inicial.
- Puerta de seguridad en sistemas de violencia domestica: gracias a la matriz de costes, un caso de Maria da Penha mal clasificado como familia tiene un coste de 10 frente a 8 por rechazo, de modo que el sistema prefiere diferir antes que enrutar mal.
- Filtrado previo en pipelines de atencion ciudadana: las consultas que caen en O se descartan o se redirigen a otro servicio, reduciendo el volumen que llega a los clasificadores o revisores humanos.
- Etiquetado asistido de corpus juridicos: el modelo puede preetiquetar documentos de estatutos y consultas sinteticas para construir conjuntos de entrenamiento de modelos mayores, con la ventaja de ser determinista y reproducible.
- Auditoria y trazabilidad de decisiones: al ser un modelo lineal con pesos inspeccionables y una matriz de costes explicita, es adecuado en entornos donde se exige justificar por que un documento se asigno a un area.
- Despliegue en infraestructura limitada: al ejecutarse solo en CPU y almacenar el artefacto en SQLite, puede integrarse en servicios modestos, contenedores ligeros o entornos sin aceleracion hardware.
- Verificacion de cumplimiento LGPD: al no contener datos personales ni casos reales, puede usarse en entornos con requisitos estrictos de privacidad sin necesidad de anonimizacion adicional.

## Benchmarks y rendimiento

Datos medidos por el autor sobre el conjunto gold `routing-v1` (10 consultas sinteticas redactadas, aisladas del entrenamiento) y sobre el holdout de entrenamiento:

| Metrica | Valor |
|---|---|
| Accuracy (gold routing-v1) | 1,00 |
| Macro-F1 (gold routing-v1) | 1,00 |
| M-recall con seguridad >= 0,98 | 1,00 |
| Precision sobre aceptados | 1,00 |
| Cobertura | 0,40 |
| Aceptar / diferir / rechazar | 4 / 4 / 2 |
| Accuracy (holdout, 83 ejemplos) | 0,90 |
| ECE (holdout) | 0,044 |
| Temperatura de calibracion | 0,30 |

No se han publicado comparaciones con otros modelos en la informacion disponible. La cobertura de 0,40 indica que el sistema difiere o rechaza el 60 % de las entradas del conjunto gold, lo que es coherente con su diseno conservador.

## Requisitos de hardware

- VRAM: no aplica; el modelo se ejecuta exclusivamente en CPU.
- GPU recomendadas: ninguna; no requiere aceleracion hardware.
- Cabe en cualquier equipo consumer: el artefacto es una base SQLite de tamano reducido (el repositorio de Hugging Face ocupa 0,0 GB).
- Opciones de despliegue: el proyecto agavus se instala con `make install` y se ejecuta con `uv run agavus`; la carga del modelo se realiza con `agavus.classify.store.load_model` sobre `models.db`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo generativo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de clasificacion juridica en portugues con decision calibrada de tres vias. Como referencia cualitativa, los clasificadores legales basados en transformers (por ejemplo, variantes de BERTimbau ajustadas para clasificacion) requeririan GPU o al menos inferencia neuronal, mientras que agavus-classifier opera solo en CPU con un pipeline lexico; no se dispone de datos de rendimiento comparables para establecer una tabla cuantitativa.

## Limitaciones y advertencias

- Dominio limitado al lenguaje de estatutos: la cobertura de consultas coloquiales es parcial; la puerta de decision difiere las entradas de baja confianza en lugar de adivinar.
- Solo cubre dos areas de enrutado (F y M); el resto de materias juridicas queda fuera de alcance por diseno.
- Nucleo lexico: las parafrasis fuera del vocabulario pueden no detectarse.
- El conjunto gold de evaluacion es muy reducido (10 consultas sinteticas), por lo que las metricas de 1,00 deben interpretarse con cautela y no como garantia de generalizacion.
- No es un sustituto del juicio profesional de un abogado; el autor lo indica explicitamente.
- No genera respuestas: las respuestas del motor completo son extractos citados textualmente, nunca opiniones generadas.
- Riesgo de sesgo derivado del corpus de entrenamiento, compuesto unicamente por estatutos federales y consultas sinteticas del autor; no se han documentado evaluaciones de sesgo.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de clasificacion erronea en entradas ambiguas, mitigado por la decision de diferir.
- Licencia Apache-2.0: permite uso comercial, pero el autor advierte que el modelo no constituye asesoramiento juridico.
- El artefacto publicado no incluye la ingesta de metadatos de casos del TJDFT (DataJud), aunque este implementada en el proyecto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Falconiere/agavus-classifier
- Repositorio del proyecto agavus: https://github.com/Falconiere/agavus

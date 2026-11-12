# sixmonth-ai/sixmonth-redact

## Resumen

sixmonth-redact es un modelo de clasificación de tokens a nivel de carácter disenado especificamente para la desidentificacion de notas clinicas y dentales. Lo desarrolla sixmonth-ai, un equipo que lo construyo para su propia investigacion interna y decidio publicarlo en abierto. El modelo aborda el problema de eliminar identificadores de pacientes (PHI, Protected Health Information) de textos medicos, un requisito critico para cumplir con normativas como HIPAA en Estados Unidos o el RGPD en Europa cuando se trabaja con datos clinicos reales.

La propuesta de valor diferencial es su tamano: apenas 5,8 millones de parametros, lo que lo convierte en un modelo extremadamente ligero que funciona solo en CPU, con un tiempo de inferencia de aproximadamente 0,2 segundos por nota y capacidad de operar completamente offline. Esto lo posiciona como una alternativa practica frente a modelos mucho mas grandes (entre 29M y 596M de parametros) que, segun los datos del autor, logran una cobertura similar pero con tasas de sobremascarado notablemente peores.

El modelo soporta ingles, frances y arabe libanes escrito en caracteres latinos (arabizi), con especial atencion a las notas dentales. Se distribuye bajo licencia GPL-3.0 y esta marcado por el autor como una version beta, con la recomendacion explicita de usarlo como primera pasada con revision humana, nunca como unica salvaguarda.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Clasificador de tokens a nivel de caracter (embeddings de caracter y de palabra hasheados, convoluciones 1-D sobre caracteres y palabras, una capa de atencion) |
| Parametros totales | 5.773.706 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles, frances, arabe libanes en caracteres latinos (arabizi); otros idiomas no testados |
| Licencia | GPL-3.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un clasificador de tokens a nivel de caracter en lugar de un transformer convencional basado en subpalabras. Segun la model card, combina embeddings de caracter y embeddings de palabra hasheados, aplica convoluciones unidimensionales sobre caracteres y sobre palabras, y anade una unica capa de atencion. La salida son seis puntuaciones por caracter; un caracter se enmascara cuando cualquiera de esas puntuaciones supera cero. El conocimiento lexico proviene de listas de palabras publicas y registros (documentados en SOURCES.md), y el autor afirma explicitamente que no se uso ninguna nota de paciente real para ajustar ningun peso del modelo.

El modelo esta disenado para identificar las categorias de identificadores de HIPAA Safe Harbor en texto, agrupadas en seis etiquetas: NAME (nombres de pacientes, familiares, clinicos y personal, preservando titulos, nombres de farmacos y epónimos), DATE (todas las fechas salvo un ano aislado), CONTACT (telefono, fax, email, URL, IP), ID (numeros de historial, plan, cuenta, licencia, matricula, serie, preservando numeros de diente, dosis, valores de laboratorio y codigos), LOCATION (todo lugar mas pequeno que un estado) y AGE (edades superiores a 89 anos). No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Deteccion y enmascaramiento de identificadores PHI/PII en notas clinicas y dentales, con seis etiquetas especificas (NAME, DATE, CONTACT, ID, LOCATION, AGE).
- Salida configurable: modo `typed=True` que devuelve etiquetas por tipo (`[NAME]`, `[DATE]`, etc.) en lugar del generico `[REDACTED]`, y modo `keep_dates=True` que preserva las fechas.
- Extraccion de spans: el metodo `spans(text)` devuelve tuplas `(start, end, label)` para integracion en pipelines propios.
- Multilingue en ingles, frances y arabe libanes en caracteres latinos (arabizi), incluyendo notas dentales.
- Inferencia solo en CPU, con aproximadamente 0,2 segundos por nota y funcionamiento offline.
- Interfaz de linea de comandos (`scrub.py`) con soporte para entrada por stdin.
- No dispone de tool calling, function calling, capacidades de agente, vision, audio ni modo de razonamiento extendido: es un modelo especializado de clasificacion de tokens.

## Casos de uso

- Desidentificacion previa a la investigacion clinica: el modelo puede procesar lotes de notas antes de que se compartan con equipos de investigacion o se suban a repositorios, eliminando nombres, fechas, contactos y numeros de historial gracias a sus seis etiquetas especializadas.
- Anonimizacion de notas dentales: el modelo preserva numeros de diente, dosis y codigos clinicos mientras elimina identificadores del paciente, lo que lo hace adecuado para registros odontologicos donde esos datos clinicos son imprescindibles.
- Pipeline de cumplimiento HIPAA Safe Harbor: como primera pasada automatizada antes de la revision humana, reduciendo el volumen de texto que un revisor debe inspeccionar manualmente.
- Procesamiento offline en entornos sanitarios restringidos: al funcionar solo en CPU y sin conexion, puede desplegarse en estaciones de trabajo dentro de redes hospitalarias aisladas donde no se permite enviar datos a servicios en la nube.
- Preprocesado para entrenamiento de modelos clinicos: eliminar PHI de corpus de notas antes de usar esos datos para ajustar o evaluar otros modelos, reduciendo el riesgo de memorizacion de identificadores.
- Integracion en sistemas de documentacion clinica en frances: el soporte nativo de frances y arabizi permite desidentificar notas de consultas en esos idiomas antes de archivarlas o exportarlas.
- Herramienta de escritorio para profesionales: la CLI `scrub.py` permite a un clinico o investigador desidentificar un texto pegandolo o canalizandolo por stdin sin instalar infraestructura de servidores.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo (no verificados de forma independiente). Cada modelo se ejecuto una vez sobre los mismos documentos retenidos con el mismo evaluador. Un identificador cuenta como detectado solo si todos sus caracteres quedan ocultos. "Clean masked" es texto no identificador ocultado por error (menor es mejor).

| Modelo | Parametros | Nemotron-PII: detectados | Clean masked | Notas clinicas: detectados | Clean masked |
|---|---|---|---|---|---|
| Perplexity PII-Tracer | 596M | 99,4% | 0,52% | 95,1% | 15,25% |
| **sixmonth-redact** | **5,8M** | 98,3% | **0,34%** | 95,0% | 3,33% |
| OBI deid RoBERTa i2b2 | 354M | 95,3% | 1,16% | 79,0% | 4,66% |
| GLiNER PII small | 82M | 92,7% | 1,01% | 91,8% | 10,14% |
| GLiNER large v2.1 | 445M | 92,1% | 2,87% | 84,7% | 10,18% |
| GLiNER2 PII | 307M | 91,6% | 0,69% | 83,6% | **3,32%** |
| Presidio + spaCy lg | 106M | 83,3% | 1,42% | 64,4% | 12,00% |
| Conway PII 30M | 29M | 72,6% | 0,52% | 74,8% | 19,96% |

- Nemotron-PII: conjunto publico de NVIDIA, 752 documentos de salud, 4.595 identificadores.
- Notas clinicas: 300 notas sinteticas en ingles estadounidense, frances y libanes, 1.498 identificadores, escritas especificamente para esta prueba.
- Con erratas (errores de teclado, texto en minusculas, acentos ausentes sobre los mismos conjuntos): sixmonth-redact detecta el 93,8% en Nemotron y el 83,0% en notas clinicas, frente al 98,7% y 93,1% de PII-Tracer, mientras enmascara el 4,17% de texto clinico limpio frente al 18,42% de PII-Tracer.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo esta disenado para ejecutarse solo en CPU.
- GPU recomendadas: no se requiere GPU; el autor indica explicitamente CPU only.
- Cabe en GPU consumer: si, aunque no es el caso de uso previsto; con 5,8M de parametros el modelo ocupa unos pocos MB en memoria.
- Opciones de despliegue: transformers con `trust_remote_code=True`, script CLI `scrub.py` del repositorio, entrada por stdin. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: aproximadamente 0,2 segundos por nota en CPU, segun el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Enfoque | Licencia | Notas |
|---|---|---|---|---|---|
| sixmonth-redact | 5,8M | en, fr, arabizi | Clasificador de caracteres, CPU | GPL-3.0 | Beta, mejor ratio deteccion/sobremascarado en notas clinicas |
| Perplexity PII-Tracer | 596M | no disponible | no disponible | no disponible | Mayor deteccion bruta, sobremascarado muy alto en clinico (15,25%) |
| GLiNER PII small | 82M | no disponible | NER zero-shot | no disponible | Deteccion inferior en Nemotron, sobremascarado alto en clinico |
| OBI deid RoBERTa i2b2 | 354M | en | RoBERTa especializado en i2b2 | no disponible | Buen rendimiento en Nemotron, flojo en notas clinicas (79,0%) |
| Presidio + spaCy lg | 106M | varios | Reglas + NER | no disponible | Deteccion baja en ambos conjuntos |

No se dispone de informacion sobre contexto, cuantizacion o formatos alternativos de estos modelos comparables.

## Limitaciones y advertencias

- Modelo especializado y de nicho: construido para notas clinicas y dentales en ingles, frances y arabizi. Debe probarse sobre datos propios antes de confiar en el.
- No es un sistema completo de desidentificacion: en las notas clinicas, aproximadamente 1 de cada 5 notas seguia mostrando un identificador (1 de cada 2 con erratas). Debe usarse como primera pasada con revision humana, nunca como unica salvaguarda.
- No convierte por si solo los datos en "de-identified" segun HIPAA.
- Puntos debiles declarados: toponimos mal escritos o no listados, nombres sin pista en notas todo en minusculas, formatos de ID inusuales, nombres propios que tambien son palabras comunes ("May", "Rose").
- Otros idiomas no han sido testados.
- Licencia GPL-3.0: los pesos embeben listas de palabras GPL-3.0 y CC BY-SA 4.0, lo que impone obligaciones de copyleft para uso comercial y distribucion derivada.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero existe riesgo de falsos positivos (sobremascarado) y falsos negativos (identificadores no detectados).
- Estado beta: el autor pide reportar fallos a joe@sixmonth.ai.
- Sesgos conocidos: no documentados en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sixmonth-ai/sixmonth-redact
- Fuentes de las listas de palabras: SOURCES.md en el repositorio del modelo (referenciado en la model card)
- Contacto para reportar fallos: joe@sixmonth.ai
- Dataset de evaluacion Nemotron-PII: https://huggingface.co/datasets/nvidia/Nemotron-PII

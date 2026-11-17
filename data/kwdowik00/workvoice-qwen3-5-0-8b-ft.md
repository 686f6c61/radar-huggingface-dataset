# kwdowik00/workvoice-qwen3.5-0.8b-ft

## Resumen

Workvoice-Qwen3.5-0.8B-FT es un modelo de lenguaje pequeno (752 millones de parametros) afinado por el desarrollador kwdowik00 a partir de la familia Qwen3.5, y distribuido en formato GGUF con cuantizacion Q4_K_M. Su proposito no es la conversacion general, sino la extraccion estructurada de campos a partir de transcripciones de voz en polaco, en el dominio concreto de inspecciones de climatizacion (HVAC) y seguridad contra incendios. Se integra en la aplicacion movil Workvoice como ruta de inferencia totalmente offline, ejecutandose sobre `llama.rn` (el binding de llama.cpp para React Native).

El modelo resuelve un problema acotado y muy practico: cuando el dispositivo no tiene conectividad, la app necesita convertir una transcripcion de voz en valores de campo estructurados (por ejemplo, una medicion, una referencia o una observacion) sin enviar datos a la nube. Para ello el autor emplea decodificacion restringida mediante gramaticas GBNF y desactiva el razonamiento del modelo, de modo que la salida se ajuste al esquema esperado con la menor latencia posible.

Es relevante como ejemplo de la tendencia hacia modelos de menos de mil millones de parametros, altamente especializados y desplegados en el borde. El autor reporta aproximadamente un 60 % de coincidencia exacta estricta sobre una suite de 114 casos y unos 475 ms por campo en un dispositivo Android de gama media de 2023. No obstante, la informacion publica es escasa: no se detalla la licencia, no hay benchmarks estandar y la model card es minima.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5); detalles de capas y atencion no disponibles |
| Parametros totales | 752.393.024 (segun safetensors); el nombre comercial indica 0.8B |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (unico publicado); otros tipos no disponibles |
| Idiomas soportados | polaco (pl) |
| Licencia | no disponible |
| Formato de pesos | GGUF (archivo `Qwen3.5-0.8B-FT-Q4_K_M.gguf`, ~505 MB) |

## Arquitectura y entrenamiento

El modelo parte de una base de la familia Qwen3.5, un transformer decoder-only de aproximadamente 0,75 mil millones de parametros. El autor no publica detalles sobre el numero de capas, la configuracion de atencion, la longitud de contexto nativa ni el vocabulario. El artefacto distribuido es unicamente el GGUF cuantizado en Q4_K_M, de unos 505 MB, lo que sugiere que el ajuste fino se realizo sobre el modelo base y posteriormente se convirtio y cuantizo para su despliegue en movil.

En cuanto a los datos, la model card indica que el entrenamiento se hizo exclusivamente con casos sinteticos de inspecciones en polaco, sin datos de clientes. No se especifica el volumen de tokens, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. La innovacion tecnica destacable no esta en la arquitectura sino en el pipeline de inferencia: el modelo se usa con decodificacion restringida por gramaticas GBNF y con el modo de razonamiento desactivado, lo que fuerza la salida a un esquema de campos y reduce el coste computacional en el dispositivo.

## Capacidades

- Extraccion de campos estructurados: dado un descriptor de campo y una transcripcion de voz en polaco, devuelve el valor correspondiente.
- Generacion de texto basica (pipeline `text-generation`), aunque no esta pensada como modelo conversacional.
- Salida restringida mediante gramaticas GBNF para garantizar el formato del esquema.
- Ejecucion totalmente offline en dispositivos moviles mediante `llama.rn` / llama.cpp.
- Soporte de descarga reanudable por rangos HTTP (requisito del runtime, no del modelo).
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento activable.
- Capacidad multilingue limitada al polaco segun los metadatos.

## Casos de uso

- Extraccion offline de campos en inspecciones HVAC: la app pasa la transcripcion y el descriptor de campo, y el modelo devuelve el valor (por ejemplo, presion o temperatura) con salida restringida por GBNF, sin enviar audio ni texto a la nube.
- Inspecciones de seguridad contra incendios en campo: tecnicos que trabajan en sotanos o recintos sin cobertura pueden registrar observaciones y valores estructurados directamente en el dispositivo.
- Cumplimiento y privacidad de datos: al ejecutarse en local, evita la transmision de transcripciones potencialmente sensibles de instalaciones de clientes a servicios externos.
- Modo degradado de una app SaaS: permite mantener la funcionalidad de captura cuando la ruta en la nube no esta disponible, con sincronizacion posterior.
- Prototipado de asistentes de voz verticales: sirve como referencia para construir pipelines de extraccion por voz con modelos sub-1B y decodificacion restringida.
- Investigacion sobre modelos en el borde: caso de estudio de ajuste fino de un modelo pequeno para una tarea unica con latencia de cientos de milisegundos por campo en hardware movil de gama media.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor unicamente reporta una evaluacion interna:

| Metrica | Valor | Contexto |
|---|---|---|
| Coincidencia exacta estricta | ~60 % | Suite interna de 114 casos |
| Latencia por campo | ~475 ms | Dispositivo Android de gama media de 2023 |
| Tamano del artefacto | ~505 MB | Cuantizacion Q4_K_M |

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: en torno a 0,5-0,7 GB con Q4_K_M, adecuada para memoria unificada de moviles y equipos de gama baja.
- GPU recomendadas: no aplica en el caso objetivo; el modelo esta disenado para CPU en dispositivos moviles. En escritorio puede ejecutarse en cualquier CPU moderna.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer con al menos 1 GB de memoria libre, aunque no es su escenario previsto.
- Opciones de despliegue: `llama.rn` (llama.cpp para React Native), llama.cpp, y otros runtimes compatibles con GGUF como Ollama o LM Studio.
- Latencia y throughput: ~475 ms por campo en un Android de gama media de 2023, segun el autor; no se publica throughput agregado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| Workvoice-Qwen3.5-0.8B-FT | 752 M | no disponible | pl | no disponible | Extraccion estructurada offline |
| Qwen3.5 base (0.8B) | ~0,8 B | no disponible | multilingue | no disponible | Modelo generalista |
| Qwen2.5-0.5B-Instruct | 494 M | 32 768 | multilingue | Apache 2.0 | Chat generalista |
| Gemma 3 270M | 270 M | 32 768 | multilingue | Gemma Terms | Modelo pequeno generalista |

La comparacion directa es limitada porque el modelo esta especializado en una unica tarea y no se han publicado evaluaciones comparables. Frente a los modelos generalistas de tamano similar, la ventaja esperada es la precision en el esquema de extraccion y la latencia baja en movil; la desventaja, su escasa utilidad fuera de ese dominio y la falta de informacion sobre licencia.

## Limitaciones y advertencias

- Ambito muy restringido: no es un modelo de chat general y su rendimiento fuera de la extraccion de campos en polaco es incierto.
- Precision limitada: ~60 % de coincidencia exacta estricta implica un 40 % de fallos en la suite interna, lo que exige validacion o intervencion humana en produccion.
- Idiomas: solo se declara soporte de polaco; el comportamiento en castellano u otros idiomas no esta documentado.
- Datos de entrenamiento sinteticos: puede no generalizar bien a transcripciones reales con ruido, acentos o vocabulario tecnico no visto.
- Licencia no disponible: no se puede confirmar el uso comercial ni las obligaciones de atribucion; conviene contactar con el autor antes de integrarlo.
- Riesgo de alucinacion: aunque la decodificacion GBNF restringe el formato, no garantiza que el valor extraido sea correcto.
- Dependencia del runtime: requiere un cliente capaz de descargas por rangos y un motor compatible con GGUF y gramaticas.
- Documentacion escasa: sin informacion sobre contexto nativo, composicion del dataset ni proceso de ajuste.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kwdowik00/workvoice-qwen3.5-0.8b-ft
- llama.cpp: https://github.com/ggml-org/llama.cpp
- llama.rn: https://github.com/mybigday/llama.rn
- Gramaticas GBNF en llama.cpp: https://github.com/ggml-org/llama.cpp/blob/master/grammars/README.md

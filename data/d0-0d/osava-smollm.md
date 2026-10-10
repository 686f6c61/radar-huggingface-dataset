# d0-0d/osava-smollm

## Resumen

osava-smollm (SENTRI-Classifier v7b) es un ajuste fino QLoRA de SmolLM3-3B, desarrollado por el usuario d0-0d, publicado en formato GGUF Q4_K_M y pensado para una tarea muy concreta: clasificar un unico evento de Windows, procedente de Sysmon o del registro de seguridad, en una de cuatro categorias de severidad (none, low, medium, high). No es un modelo conversacional ni un generador de texto generalista, sino un clasificador de triaje que decide que comportamientos de un equipo conviene revisar primero.

El modelo es el componente local de triaje de la pestana *Behaviour* del proyecto OSAVA: consume un evento renderizado como lineas `Key: value` por un contrato fijo y una plantilla de prompt estricta, y solo se lee el primer token generado. Sus probabilidades top-k sobre las cuatro palabras de severidad producen el veredicto, mientras que el resto de la informacion que ve el analista (indicadores, tipo de amenaza, razonamiento) se calcula con reglas fijas, no con el modelo. El propio autor insiste en que el modelo hace triaje, no prueba: un *high* significa "mira aqui primero", no "esto es un ataque".

Con 3.075.098.624 parametros y un unico fichero de 1.915.305.376 bytes fijado por checksum en el `contract.json` de OSAVA, es un modelo pequeno, desplegable en local con `llama-server` y sin telemetria de usuarios reales en su entrenamiento. Su relevancia actual esta en el nicho de los SLM especializados en seguridad defensiva, donde prima la latencia minima, la operacion offline y la trazabilidad del dato por encima de la capacidad generativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, heredada del modelo base SmolLM3-3B; detalles de atencion y capas no disponibles en la informacion proporcionada |
| Parametros totales | 3.075.098.624 (3,08 mil millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | GGUF Q4_K_M (unico fichero publicado: `osava-smollm-q4.gguf`) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 (con la salvedad de los datos GPL-3.0 indicada mas abajo) |
| Formato de pesos | GGUF (Q4_K_M); el repositorio tambien declara parametros en safetensors a efectos de metadatos |
| Modelo base | HuggingFaceTB/SmolLM3-3B |
| Tarea (pipeline) | text-generation (uso real: clasificacion de severidad de un evento) |
| Tamano del repositorio | 1,9 GB |
| Hash SHA-256 del GGUF | `dc24b6b923ed4dc7b475f41f31a96a90a1cfa242241e35ea37de09ce10c11f52` |
| Fecha de creacion | 2026-10-10 |

## Arquitectura y entrenamiento

El modelo parte de SmolLM3-3B, un transformer decoder-only de 3,08 mil millones de parametros, y se adapta mediante QLoRA en precision NF4 con rango 16, alpha 32 y todas las proyecciones lineales entrenables. El entrenamiento duro 4 epocas, con tasa de aprendizaje 2e-4, batch efectivo de 16 y calculo de perdida unicamente sobre la completion, ponderando el token de severidad 20 veces. Se publica el checkpoint final (580 pasos), no el mejor de varios candidatos.

El conjunto de datos consta de 2.522 filas. Incluye eventos del repositorio EVTX-ATTACK-SAMPLES (licencia GPL-3.0) etiquetados por comportamiento, junto con eventos sinteticos generados por las herramientas de osava-slm: negativos benignos dificiles, actividad sospechosa de zona gris, inicios de sesion y, como novedad en la version v7b, actividad normal de estacion de trabajo (instaladores y actualizadores, servicios de Windows por usuario, paquetes de aplicaciones, aplicaciones por usuario sobre HTTPS y herramientas de desarrollo), cada familia emparejada con contrastes maliciosos. El conjunto se rebalanceo a un 42,5 % malicioso, 16,7 % sospechoso y 40,8 % benigno repitiendo filas existentes. No se utilizo telemetria de equipos de usuarios reales.

La innovacion tecnica no esta en la arquitectura, sino en el contrato de inferencia: el evento se serializa con un orden de campos fijo, un limite de 512 caracteres para la linea de comandos y un relleno de firmas; se inyecta en una plantilla estricta (SHA-256 del prompt `8906351f…`) que termina con el prefill `{"severity": "`, y solo se lee el primer token generado con `n_predict: 1`, `n_probs: 10` y `temperature: 0`. Las probabilidades top-k sobre las cuatro palabras de severidad dan el veredicto y su grado de confianza.

## Capacidades

- Clasificacion de severidad de un unico evento de Windows en cuatro clases: none, low, medium, high.
- Estimacion de confianza mediante las probabilidades top-k (`n_probs: 10`) sobre las cuatro palabras de severidad.
- Procesamiento de eventos Sysmon con IDs 1, 3, 7, 11, 12 y 13, y eventos de seguridad 4624 y 4625.
- Interpretacion de eventos serializados segun el contrato de OSAVA: lineas `Key: value`, orden de campos fijo, linea de comandos truncada a 512 caracteres y firmas retro-rellenadas.
- Triaje local de comportamientos anadidos por el usuario, sin envio de datos a servicios externos.
- Inferencia determinista con temperatura 0 y lectura de un solo token, adecuada para pipelines automatizados.
- Capacidades heredadas del modelo base (generacion de texto, razonamiento, codigo o multilingueismo) no estan descritas ni evaluadas en la informacion proporcionada; el ajuste esta orientado en exclusiva a la clasificacion.
- No soporta tool calling, function calling ni razonamiento multi-paso segun la informacion disponible.
- Modelo de un solo evento y sin memoria: no mantiene estado entre llamadas.

## Casos de uso

- Triaje de alertas en un SOC local: el modelo puntua cada evento de Sysmon o seguridad y permite priorizar la cola de revision; los eventos marcados como *high* se envian primero al analista, reduciendo el tiempo hasta la primera mirada sobre el incidente relevante.
- Filtrado de ruido en estaciones de trabajo: con un 9,3 % de falsos *high* sobre comportamientos benignos de una maquina real (aplicaciones nunca vistas en entrenamiento), sirve para descartar la mayor parte de la actividad normal de ofimatica, actualizadores y herramientas de desarrollo.
- Enriquecimiento de un SIEM o EDR: al exponerse como endpoint compatible con OpenAI sobre `llama-server`, se integra en pipelines existentes que ya consumen una API de completions, anadiendo una columna de severidad por evento.
- Despliegue en entornos air-gapped: el unico fichero GGUF de 1,9 GB se ejecuta en CPU con llama.cpp, por lo que puede operar en redes aisladas o en equipos sin GPU donde no es posible enviar telemetria a la nube.
- Analisis forense posterior a un incidente: se pasan los eventos exportados de un rango temporal y se obtiene una lista ordenada por severidad para acotar la ventana de investigacion, siempre como ayuda de priorizacion y no como evidencia.
- Aprendizaje y formacion en deteccion: al ser un modelo pequeno con contrato de prompt documentado, resulta util para que analistas noveles comparen su propio criterio con el del clasificador sobre conjuntos de eventos etiquetados.
- Automatizacion de guardias 24x7: la generacion de un solo token mantiene el coste computacional por evento muy bajo, lo que permite clasificar flujos continuos de eventos en un unico equipo sin recurrir a aceleradores dedicados.
- Investigacion de deteccion: al estar publicados el prompt, las reglas de conversion y los eventos canary en osava-slm, se puede reproducir la evaluacion y auditar el comportamiento del clasificador.

## Benchmarks y rendimiento

Los unicos datos publicados son la evaluacion interna del autor, medida con el propio GGUF servido por `llama-server` y lectura del primer token. Comparan la version v7b con la v3 anterior.

| Metrica | v3 (anterior) | v7b |
|---|---|---|
| Eventos reservados, exactitud (sobre 138) | 124 | 122 |
| Eventos maliciosos reservados clasificados como High (sobre 56) | 55 | 53 (los otros 2 como Medium) |
| Eventos sospechosos reservados detectados | 53 % | 67 % |
| Comportamientos benignos de un PC en uso clasificados como High, aplicaciones nunca vistas en entrenamiento (sobre 483) | 26,1 % | 9,3 % |
| Los mismos, clasificados como High o Medium | 33,1 % | 20,1 % |

Advertencias del propio autor sobre estas cifras: el conjunto reservado es pequeno; el cambio de datos de v7b se decidio despues de observar los fallos de un candidato anterior sobre ese mismo conjunto, por lo que no es completamente ciego para este modelo; el benchmark benigno procede de la maquina de un unico desarrollador; y tanto v3 como v7b clasifican como benigno uno de los eventos maliciosos reservados. No hay resultados de MMLU, HumanEval, GSM8K ni de benchmarks generalistas en la informacion disponible.

## Requisitos de hardware

- Inferencia en CPU: viable con llama.cpp o `llama-server`; el fichero GGUF ocupa 1,9 GB y el proceso completo ronda los 2,5-3 GB de RAM.
- VRAM estimada: en torno a 2-3 GB con la cuantizacion Q4_K_M publicada, incluyendo el pequeno cache KV necesario para generar un unico token. Cifras orientativas, no publicadas por el autor.
- GPU consumer: cabe con holgura en cualquier GPU con 4 GB o mas de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 4060, RTX 4090). No requiere A100 ni H100.
- Si se quisiera reentrenar o servir en bf16, el modelo completo de 3,08 mil millones de parametros exigiria del orden de 6,2 GB solo en pesos, mas estados de optimizador en caso de ajuste fino; no se publican pesos sin cuantizar.
- Opciones de despliegue: llama.cpp / `llama-server` es el camino documentado en la model card; Ollama y otros runners compatibles con GGUF son alternativas razonables. vLLM y TGI no estan documentados para este artefacto.
- Latencia y throughput: no disponibles en la informacion proporcionada. El diseno (prompt fijo, `n_predict: 1`, `temperature: 0`) esta optimizado para minimizar el coste por evento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| osava-smollm (SENTRI-Classifier v7b) | 3,08 mil millones | No disponible en la informacion proporcionada | Triaje de eventos Windows en 4 clases de severidad | Apache-2.0 (con caveat sobre datos GPL-3.0) | GGUF Q4_K_M en HuggingFace, fichero fijado por checksum |
| SmolLM3-3B (modelo base) | 3,08 mil millones | No disponible en la informacion proporcionada | Modelo de proposito general | Apache-2.0 | Pesos completos en HuggingFace |
| Modelos 3B de proposito general de otros fabricantes | No disponible en la informacion proporcionada | No disponible | Generacion de texto generalista | No disponible | No disponible |

No se han localizado en la informacion disponible otros ajustes finos comparables centrados en el triaje de eventos Sysmon con lectura de un unico token, por lo que la comparacion cuantitativa con alternativas de la misma categoria no esta disponible. La busqueda web realizada no devolvio resultados relacionados con el modelo.

## Limitaciones y advertencias

- Procesa un solo evento y no tiene memoria: no puede detectar secuencias cuya malignidad solo se aprecia en conjunto (por ejemplo, una descarga seguida de una ejecucion).
- La clase intermedia (*medium*) es la decision mas debil del modelo; los veredictos *none* y *low* deben leerse como "no ha destacado nada", nunca como "es seguro".
- Dominio limitado a los IDs de Sysmon 1, 3, 7, 11, 12 y 13 y a los eventos de seguridad 4624 y 4625. Cualquier otro tipo de evento queda fuera de su ambito.
- Un atacante que disfrace su actividad como software ordinario (un servicio con nombre plausible, una herramienta firmada haciendo su trabajo habitual) puede recibir una puntuacion baja.
- Riesgo de alucinacion acotado por diseno: solo se lee el primer token y el resto de la informacion se calcula con reglas fijas. Aun asi, la salida sigue siendo una probabilidad sobre cuatro palabras, no una prueba de compromiso.
- Sesgo de calibracion: el conjunto de entrenamiento se rebalanceo artificialmente al 42,5 % malicioso, 16,7 % sospechoso y 40,8 % benigno, una distribucion que no refleja la proporcion real de eventos de un equipo de produccion.
- Evaluacion limitada: conjunto reservado de 138 eventos, benchmark benigno procedente de una sola maquina y seleccion de datos de v7b influida por los fallos observados en el conjunto reservado.
- Los datos de entrenamiento incluyen EVTX-ATTACK-SAMPLES bajo GPL-3.0. No esta resuelto si la licencia de un conjunto de datos se extiende a los pesos entrenados con el; el autor recomienda tenerlo en cuenta para uso comercial, pese a que los pesos se publican como Apache-2.0.
- Idiomas: el modelo solo declara ingles. No hay soporte multilingue documentado.
- Sin telemetria de usuarios reales en el entrenamiento, lo que reduce riesgos de privacidad, pero tambien implica menor diversidad de entornos reales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/d0-0d/osava-smollm
- Repositorio del proyecto OSAVA: https://github.com/d0-00d/osava
- Repositorio osava-slm (prompt, reglas de conversion y eventos canary): https://github.com/d0-00d/osava-slm
- Modelo base SmolLM3-3B: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Conjunto de datos EVTX-ATTACK-SAMPLES: https://github.com/sbousseaden/EVTX-ATTACK-SAMPLES
- Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo, su autor o su dominio de aplicacion.

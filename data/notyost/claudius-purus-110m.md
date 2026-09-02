# notyost/claudius-purus-110m

## Resumen

Claudius Purus 110M es un modelo de lenguaje generativo entrenado desde cero —arquitectura, tokenizador y pesos— exclusivamente con textos compuestos antes de la era común (pre-CE). Lo desarrolla el autor notyost y se publica en HuggingFace con licencia CC BY-SA 4.0. Su singularidad radica en que es, según sus autores, el primer modelo generativo con un corte de conocimiento genuinamente anterior al año 1 d.C., ya que el corpus de entrenamiento abarca obras compuestas entre el siglo XXII a.C. y el siglo I a.C.

El modelo emplea una arquitectura GPT-2 small (12 capas, 768 dimensiones ocultas, 12 cabezas de atención) con 111 millones de parámetros y una ventana de contexto de 1024 tokens. Se entrenó sobre 25,85 millones de tokens procedentes de 953 obras en seis lenguas antiguas: griego antiguo, latín, acadio, sumerio, hebreo bíblico (consonántico) y chino clásico. El coste total de entrenamiento fue de aproximadamente 2 dólares en tiempo de H100, lo que refleja que la restricción principal no fue el cómputo sino la disponibilidad de texto pre-CE con licencia limpia.

Este modelo no es un asistente conversacional ni un sistema de razonamiento general; es un modelo base que continúa texto con fidelidad estilística y gramatical a los registros literarios de la antigüedad. Su relevancia actual reside en su valor como herramienta de investigación filológica y como demostración de que es posible entrenar modelos lingüísticamente competentes con corpus extremadamente reducidos y especializados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 small (12L, 768H, 12A) |
| Parametros totales | 111.007.488 (110,9 M) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible (exportado en fp16) |
| Idiomas soportados | Griego antiguo, latin, acadio, sumerio, hebreo biblico (consonantico), chino clasico |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors (fp16) |

## Arquitectura y entrenamiento

El modelo replica la arquitectura GPT-2 small: un transformer decoder-only con 12 capas, 768 dimensiones de embedding, 12 cabezas de atención y normalización pre-LayerNorm. El tokenizador es un byte-level BPE de 32.000 unidades entrenado exclusivamente sobre el corpus pre-CE, lo que garantiza que no haya contaminación léxica de épocas posteriores. Los pesos se exportaron con paridad logit exacta (0,00e+00) respecto al formato de HuggingFace.

El entrenamiento se realizó desde cero con 25,85 millones de tokens, 16 épocas y semilla 1453. El corpus incluye 953 obras datadas y auditables, con un manifiesto público de fechas, confianza y justificación de inclusión. Se excluyeron autores como Estrabón, Ovidio o las Periochae por no cumplir el criterio estricto de composición pre-CE. No se aplicó RLHF, DPO ni ningún ajuste por preferencias; es un modelo base puro. La pérdida de validación final fue de 3,783 (perplejidad 44,0) sobre obras antiguas reservadas con división por obra.

## Capacidades

- Generacion de texto en seis lenguas antiguas con alta fidelidad gramatical y estilistica: prosa ciceroniana, hexametros homericos con formulas genuinas, salmos en hebreo consonantal, chino clasico analistico y acadio en transliteracion cuneiforme.
- Continuacion de texto en el registro adecuado: preguntas cortas en latin tienden a invocar comedia romana; preguntas en griego, dialogo platonico. Esto convierte al modelo en un detector de la distribucion de registros de la literatura antigua superviviente.
- Capacidad few-shot limitada: si se le proporciona un intercambio maestro-alumno (dialogo platonico o catecismo), mantiene el formato durante uno o dos turnos antes de derivar.
- No soporta tool calling, ni funciones de agente, ni razonamiento multi-paso, ni vision, ni audio. Es un modelo de texto puro sin capacidades conversacionales estructuradas.
- Multilingue dentro de su dominio: maneja seis lenguas antiguas, aunque con rendimiento desigual (ver benchmarks).

## Casos de uso

- Investigacion filologica y estilistica: el modelo puede generar pasajes de prueba en el registro de un autor o genero antiguo concreto, lo que permite a los estudiosos contrastar hipotesis sobre formulas, metrica o sintaxis sin necesidad de buscar manualmente en corpus extensos.
- Restauracion y completado de textos fragmentarios: dado un fragmento de una obra antigua, el modelo puede proponer continuaciones plausibles en el mismo estilo, util como herramienta de apoyo en edicion critica y reconstruccion de lagunas.
- Ensenanza de lenguas clasicas: los docentes pueden usarlo para generar ejercicios de traduccion o composicion en latin, griego antiguo o chino clasico, con textos que imitan fielmente los registros originales.
- Analisis de distribucion de registros literarios: al ser un modelo base que refleja la distribucion estadistica de los textos supervivientes, puede usarse para estudiar que generos y estilos estan sobrerrepresentados o infrarrepresentados en el corpus antiguo conservado.
- Generacion de material creativo ambientado en la antiguedad: escritores o disenadores de juegos pueden emplearlo para producir dialogos, inscripciones o narraciones con sabor historico autentico, evitando anacronismos lexicos.
- Evaluacion de tecnicas de entrenamiento con corpus minimos: el modelo sirve como caso de estudio para investigar como se comportan arquitecturas estandar cuando el volumen de datos es extremadamente bajo (25,85 M tokens), lo que puede informar el diseno de modelos para lenguas minorizadas o dominios con escasez de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) porque el modelo no esta disenado para tareas generales. La evaluacion publicada se centra en perplejidad por idioma sobre un conjunto de validacion con division por obra:

| Idioma | Tokens de validacion | NLL/token | Perplejidad por token |
|---|---|---|---|
| Acadio | 110.579 | 2,537 | 12,6 |
| Griego antiguo | 88.155 | 3,781 | 43,9 |
| Latin | 36.470 | 4,739 | 114,3 |
| Chino clasico | 45.397 | 6,209 | 497,2 |
| **Todos** | **280.601** | **3,808** | **45,1** |

Advertencia del autor: la perplejidad por token no es comparable entre lenguas, porque la transliteracion acadia fragmenta cada palabra en ~4,4 silabas-token predecibles, mientras que cada caracter chino es un token de morfema completo. La perplejidad por palabra invierte la clasificacion. El conjunto de validacion no incluye obras en hebreo ni sumerio por una brecha de cobertura en la division por hash, lo que se anota como pendiente para la version 2.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en fp16 ocupa aproximadamente 222 MB de pesos (111 M parametros x 2 bytes). Con activaciones y cache KV para 1024 tokens, el consumo total ronda los 300-400 MB.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM es suficiente. Una GTX 1060 6GB, RTX 2060, o incluso una integrada moderna pueden ejecutarlo sin problemas.
- Tambien puede ejecutarse en CPU con razonable velocidad: en un procesador moderno, la generacion de 60 tokens tarda unos pocos segundos.
- Opciones de despliegue: compatible con transformers de HuggingFace (pipeline text-generation), y puede convertirse a GGUF para usarse con llama.cpp u Ollama, aunque no hay cuantizaciones publicadas.
- Latencia y throughput estimados: en una GPU como RTX 4090, la generacion autoregresiva de 1024 tokens deberia completarse en menos de 1 segundo; en CPU, alrededor de 5-10 tokens por segundo.

## Comparativa con modelos similares

No hay modelos comparables conocidos. Claudius Purus 110M es, segun sus autores, el primer modelo generativo con corte de entrenamiento pre-CE. Los modelos de lenguas antiguas existentes (por ejemplo, Latin BERT o modelos clasicos de latin) son modelos de embedding o de comprension, no generativos, y ninguno cubre seis lenguas antiguas simultaneamente. Tampoco hay modelos de tamano similar (110 M) entrenados desde cero con corpus tan reducidos y especializados. Por tanto, la comparativa con alternativas directas no esta disponible.

## Limitaciones y advertencias

- Sesgos conocidos: el corpus refleja lo que las elites de la antiguedad escribieron y lo que las generaciones posteriores preservaron: literatura alfabetizada, masculina y canonizada. El modelo simula la literatura superviviente, no las poblaciones antiguas.
- Alucinacion libre: el modelo alucina con fluidez dentro de los registros que conoce. No tiene un modelo del mundo real; responde continuando texto, no respondiendo preguntas. No debe usarse como fuente de informacion factual sobre la antiguedad.
- Cobertura linguistica desigual: el hebreo se entrena solo en texto consonantal sin puntuacion vocalica (los puntos vocales son anadidos medievales). El sumerio y el hebreo no tienen representacion en el conjunto de validacion.
- Sin capacidad conversacional: no soporta instrucciones, ni preguntas directas, ni dialogos estructurados. Las preguntas cortas en latin o griego producen continuaciones de comedia o dialogo platonico, no respuestas.
- Licencia CC BY-SA 4.0: es una licencia copyleft. Cualquier obra derivada que distribuya debe compartirse bajo la misma licencia. Esto puede ser restrictivo para integracion en productos comerciales cerrados. Existe una variante -g con licencia CC BY-NC-SA 4.0 que anade sanscrito vedico y el Poema de Gilgamesh, pero prohibe uso comercial.
- Sin garantias de precision historica: la datacion de las obras se basa en un manifiesto publico, pero la autoria y las fechas de muchos textos antiguos son objeto de debate academico. El criterio "pre-CE" es una configuracion, no una verdad absoluta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/notyost/claudius-purus-110m
- Manifiesto de atribucion (mencionado en la model card como ATTRIBUTION.md, no se proporciona URL directa): disponible en el repositorio del modelo.
- No se han encontrado papers, blogs o demos adicionales en la busqueda web.

# jwcalendar/calendar-query-intent-classifier

## Resumen

El calendar-query-intent-classifier es un clasificador de intenciones para consultas en ingles relacionadas con calendarios, publicado por el usuario jwcalendar bajo licencia MIT. No es un modelo de lenguaje ni un transformer: se trata de un clasificador logistico multiclase entrenado sobre una representacion TF-IDF con hashing, disenado para enrutar consultas cortas hacia la herramienta o el flujo de trabajo adecuado. Su funcion es exclusivamente clasificar el tipo de peticion, no calcular fechas ni resolver la consulta.

El modelo distingue diez intenciones: monthly_calendar, yearly_calendar, blank_calendar, julian_calendar, holiday_calendar, weekday_lookup, date_difference, iso_week, leap_year y print_layout. Está pensado para ejecutarse en CPU, sin dependencias de transformer, servicio de inferencia externo ni llamada de red, ya que la implementacion usa unicamente la biblioteca estandar de Python y serializa los pesos dispersos y los valores IDF como JSON.

Su relevancia es limitada pero clara: sirve como componente de enrutamiento ligero y determinista dentro de un sistema mayor de gestion de calendarios, donde un modelo mayor podria encargarse despues del calculo o la generacion. El corpus de entrenamiento es completamente sintetico (1.500 consultas generadas por plantillas), por lo que su alcance queda restringido a ese dominio y no se ha evaluado con trafico real, multilingue ni conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Clasificador logistico multiclase (softmax) sobre representacion TF-IDF con hashing BLAKE2 |
| Parametros totales | no disponible (no es una red neuronal; 8.192 dimensiones de caracteristicas hashed x 10 clases de pesos dispersos) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificacion de consultas cortas; no se especifica limite formal) |
| Tipos de cuantizacion | no disponible (pesos dispersos serializados como JSON) |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | JSON (pesos dispersos e valores IDF serializados; no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El texto se normaliza a minusculas. El vectorizador combina unigramas y bigramas de palabras con n-gramas de caracteres de longitud 2 a 5. Los indices de caracteristicas se generan mediante hashing determinista BLAKE2 en 8.192 dimensiones. Durante el entrenamiento se calculan las frecuencias inversas de documento (IDF) a partir del split de entrenamiento y se normaliza cada vector con norma L2. Sobre esa representacion se entrena un modelo logistico softmax de diez clases mediante descenso de gradiente estocastico con orden aleatorio determinista y regularizacion L2 sobre los pesos. Toda la implementacion usa la biblioteca estandar de Python y no emplea transformer, servicio de inferencia externo ni llamada de red.

El corpus de entrenamiento, `queries.jsonl`, contiene 1.500 consultas sinteticas de entrenamiento, validacion y test, generadas a partir de plantillas especificas por intencion con valores de calendario variados. Los bancos de plantillas de cada split son distintos, por lo que los resultados de test miden la generalizacion a las frases retenidas incluidas, pero siguen limitados a ese dominio ingles sintetico. El clasificador se entreno unicamente con este corpus; el dataset Calendar Reasoning Benchmark no se utilizo ni para entrenar ni para evaluar. La reproducibilidad esta documentada con los comandos `train.py --output . --seed 20270929 --epochs 35`, `evaluate.py` y la suite de tests unitarios.

## Capacidades

- Clasificacion de texto en ingles en diez intenciones de calendario: monthly_calendar, yearly_calendar, blank_calendar, julian_calendar, holiday_calendar, weekday_lookup, date_difference, iso_week, leap_year y print_layout.
- Enrutamiento de consultas cortas hacia la herramienta o flujo de trabajo correspondiente.
- Devuelve la intencion principal con su puntuacion softmax y las puntuaciones de todas las intenciones, como probabilidades del modelo (no calibradas).
- Ejecucion en CPU sin GPU, sin llamada de red y sin servicio externo.
- Inferencia determinista y ligera, apta para entornos con recursos muy limitados.
- Capacidades multilingues: no. Solo ingles.
- Tool calling / function calling: no de forma nativa, aunque puede actuar como paso previo de enrutamiento hacia herramientas externas.
- Razonamiento multi-paso y agentes: no. No calcula fechas, no resuelve festivos, no genera calendarios ni extrae argumentos estructurados.

## Casos de uso

- Enrutamiento de consultas en un asistente de calendario: el clasificador identifica si la peticion del usuario es una vista mensual, anual, una busqueda de dia de la semana o un calculo de diferencia de fechas, y la dirige al modulo de calculo o generacion adecuado.
- Preprocesado en un sistema mayor: dado que es determinista y muy ligero, puede actuar como primera capa de clasificacion antes de invocar un LLM mas costoso solo cuando realmente se necesita.
- Seleccion de plantilla de salida: distingue intenciones como print_layout frente a monthly_calendar para decidir si la respuesta debe ser una rejilla imprimible o una vista de mes estandar.
- Desambiguacion de variantes de calendario: separa peticiones de calendario gregoriano (monthly_calendar, yearly_calendar) de las de calendario juliano (julian_calendar) o de festivos (holiday_calendar).
- Filtrado y telemetria: permite agrupar y medir que tipos de consulta recibe un portal de calendarios, clasificando cada peticion entrante en una de las diez categorias.
- Servicio embebido en entornos sin GPU: al ejecutarse en CPU con la biblioteca estandar de Python, puede desplegarse en funciones serverless o contenedores minimos sin dependencias pesadas.
- Pruebas de integracion de pipelines: sirve como componente controlado y reproducible para validar la logica de enrutamiento antes de conectar motores de razonamiento mas complejos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que `metrics.json` contiene la exactitud real de validacion y de test, la F1 macro, la precision/recall/F1 por clase, los recuentos de soporte y la matriz de confusion, calculados por `train.py`, y que `evaluate.py` recalcula las metricas de test a partir del modelo y el corpus publicados. Sin embargo, esas cifras concretas no se incluyen en la informacion proporcionada, por lo que no se reproducen aqui.

## Requisitos de hardware

- VRAM estimada: 0 GB. El modelo se ejecuta en CPU y no requiere GPU.
- GPU recomendadas: no aplica; no se necesita GPU para la inferencia.
- Compatibilidad con GPU de consumo: no aplica (no usa aceleracion por GPU).
- Almacenamiento: minimo; pesos e IDF se serializan como JSON con pesos dispersos sobre 8.192 dimensiones y 10 clases.
- Opciones de despliegue: ejecucion directa con la biblioteca estandar de Python (`train.py`, `predict.py`, `evaluate.py`). No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI, ya que no es un transformer.
- Latencia y throughput estimados: no disponible. Al no emplear red neuronal ni GPU, la latencia esperada es muy baja, pero no se publican cifras concretas.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (clasificadores de intenciones ligeros sobre TF-IDF). No se dispone de datos de rendimiento de alternativas para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados de forma explicita, pero al entrenarse solo con plantillas sinteticas puede no reflejar la distribucion de consultas humanas reales.
- Riesgo de confusion entre categorias cercanas: la propia model card advierte que puede confundir intenciones proximas, como una peticion de calendario mensual y una de diseno de impresion (print_layout).
- No realiza calculos: no calcula fechas, no resuelve la jurisdiccion de festivos, no genera calendarios ni extrae argumentos estructurados.
- Cobertura de intenciones fija: solo soporta las diez intenciones listadas; cualquier peticion fuera de ese conjunto queda sin cubrir.
- Limitacion de idioma: solo ingles. No se ha evaluado en otros idiomas.
- Dominio sintetico: entrenado unicamente con 1.500 consultas generadas por plantillas, con bancos de plantillas distintos por split; los resultados de test miden generalizacion solo dentro de ese dominio sintetico.
- Sin evaluacion en produccion: no se ha probado con trafico multilingue, conversacional ni de produccion.
- Puntuaciones no calibradas: los valores softmax son probabilidades del modelo, no estimaciones de confianza calibradas; no deben interpretarse como certeza.
- Licencia: MIT, permisiva para uso comercial; consultar el archivo LICENSE del repositorio para el texto exacto.
- Fechas del repositorio: la model card indica creacion el 2026-09-29, dato que procede de los metadatos y no se ha verificado de forma independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jwcalendar/calendar-query-intent-classifier
- ChronoGrid Calendar Computation Laboratory (Space): https://huggingface.co/spaces/jwcalendar/chronogrid-calendar-lab
- Gregorian ↔ Julian Date Laboratory (Space): https://huggingface.co/spaces/jwcalendar/gregorian-julian-date-lab
- Calendar Print & Layout Engineering Lab (Space): https://huggingface.co/spaces/jwcalendar/calendar-layout-engine
- Calendar Reasoning Benchmark (dataset): https://huggingface.co/datasets/jwcalendar/calendar-reasoning-benchmark
- Referencia de ejemplo de calendario imprimible (noviembre 2027): https://jwcalendar.com/november-calendar/

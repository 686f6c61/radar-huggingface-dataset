# gamug/deberta-v3-news-scope-nli

## Resumen

`gamug/deberta-v3-news-scope-nli` es un modelo de clasificación zero-shot basado en DeBERTa-v3-base, afinado por el autor `gamug` como un clasificador NLI (natural language inference) para determinar el alcance temático de una noticia financiera. Concretamente, el modelo decide si el cuerpo de una noticia trata sobre una única empresa (`single`), sobre varias empresas (`multi`), sobre un sector (`sector`) o sobre nada de lo anterior (`out_of_scope`). Es el primer paso de un pipeline de procesamiento de noticias del proyecto `portfolio-nlp`.

El repositorio contiene dos modelos que se aplican en cascada: `stage_a` clasifica cada noticia en `company` / `sector` / `not_related`, y `stage_b` refina las que caen en `company` en `single` o `multi`. Ambos parten de `MoritzLaurer/deberta-v3-base-zeroshot-v2.0` y se entrenaron sobre 365 cuerpos de noticias etiquetados manualmente por el autor.

La relevancia es acotada pero concreta: se trata de un componente de triaje para un pipeline de análisis de noticias financieras en inglés, no de un modelo de propósito general. Su licencia MIT y su tamaño (base, ~1,5 GB de repo) lo hacen fácil de desplegar, aunque sus métricas publicadas quedan por debajo del umbral del 90 % que el propio proyecto se había fijado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder DeBERTa-v3-base, afinado como clasificador NLI (margen de entailment por hipotesis) |
| Parametros totales | No disponible (hereda el tamano de DeBERTa-v3-base; el autor no publica el conteo) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible como contexto general; la receta trunca a `max_length` definido en `training_record.json` y usa titulo + primeros 800 caracteres del cuerpo |
| Tipos de cuantizacion | No disponible (pesos en float32 con autocast bf16 durante el entrenamiento; no se documentan cuantizaciones publicadas) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (dos subdirectorios `stage_a/` y `stage_b/`) |

## Arquitectura y entrenamiento

El modelo es un encoder DeBERTa-v3-base reutilizado como clasificador NLI: para cada hipotesis predefinida se calcula el margen entre el logit de entailment y el de no-entailment, y se elige la clase con mayor margen. La clasificacion se hace en dos etapas: `stage_a` decide entre `company`, `sector` y `not_related`; solo si el resultado es `company` se invoca `stage_b`, que distingue `single` de `multi`. Las hipotesis concretas, la receta y los conteos de datos estan en `training_record.json`.

El entrenamiento se hizo sobre 365 cuerpos de noticias etiquetados y revisados por el propietario del proyecto (284 generales, 51 elegidos para las clases raras y 30 con titulo que nombra una empresa pero cuerpo que no trata de ella). `stage_a` se entreno con los 365; `stage_b` con los 210 cuerpos de la clase `company`. Configuracion: 3 epocas, learning rate 2e-5, batch 16, pesos float32 con autocast bf16, semilla 1. La entrada es titulo mas primeros 800 caracteres del cuerpo. Los textos viven en el repositorio del proyecto (`gold/`), no en el repo del modelo. La revision de pesos asociada a cada resultado es `scope-nli-8ff21e50796b`.

## Capacidades

- Clasificacion zero-shot de alcance tematico de noticias financieras en cuatro clases: `single`, `multi`, `sector`, `out_of_scope`.
- Clasificacion en cascada de dos etapas con hipotesis NLI configurables desde `training_record.json`.
- Funciona con titulo + cuerpo (hasta 800 caracteres); si falta el titulo, lee solo el texto.
- Entrada en ingles exclusivamente.
- No soporta tool calling, function calling, agentes, vision, audio ni modo thinking.
- No es un modelo generativo: no produce texto libre, solo etiquetas y margenes de entailment.

## Casos de uso

- Triaje previo en un pipeline de noticias financieras: descartar noticias que no tratan de ninguna empresa ni sector antes de pasarlas a etapas mas caras (extraccion de entidades, analisis de sentimiento, vinculacion a tickers). El modelo esta disenado exactamente para este rol.
- Enrutado a modelos de extraccion de entidades: las noticias clasificadas como `company` se envian al extractor de empresas; las `sector` a un analisis sectorial distinto; las `out_of_scope` se descartan o se marcan para revision.
- Distincion single vs multi en noticias de fusiones y adquisiciones: `stage_b` permite separar noticias centradas en una empresa de aquellas que cubren varias, util para decidir si se necesita resolucion de entidades multiple.
- Filtrado de ruido en corpus de noticias: dado un feed amplio, marcar como `out_of_scope` los cuerpos que no son noticias de empresa (por ejemplo, piezas de opinion o contenidos no financieros), con la cautela de que esta es su clase mas debil.
- Etiquetado asistido para anotacion humana: usar los margenes NLI como señal de pre-etiquetado y revision manual, reduciendo el coste de anotar nuevos corpus.
- Investigacion sobre NLI aplicado a dominios financieros: el modelo y su receta (hipotesis, truncado a 800 caracteres, cascada) sirven como linea base reproducible para experimentos de clasificacion zero-shot en noticias.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre 200 cuerpos held-out, ponderados al corpus por estratos de muestreo:

| Metrica | Valor |
|---|---|
| Acuerdo global | 83,6 % [78,1; 88,9] |
| Baseline por reglas (triaje) | 67,2 % |
| Ganancia pareada frente a reglas | +16,5 [+9,6; +23,4] puntos |
| Recall clase `single` | 92,2 % |
| Recall clase `out_of_scope` | 53,0 % [32,3; 73,8] |
| Reproducibilidad (3 ajustes de la misma receta, semilla 1) | 83,0 %, 83,6 %, 83,6 % |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; al tratarse de un DeBERTa-v3-base en float32, el peso del modelo ronda el orden de cientos de MB por etapa, y ambas etapas caben con holgura en GPUs de consumo.
- GPU recomendadas: cualquier GPU consumer reciente (RTX 3060 en adelante) es suficiente; para lotes grandes o throughput alto, A100/H100 no son necesarias pero aceleran el batching.
- Cabe en GPU consumer: si, tanto `stage_a` como `stage_b` por separado y en conjunto.
- Opciones de despliegue: `transformers` con `AutoModelForSequenceClassification` (el ejemplo de la model card es la referencia); el autor menciona una version batcheada en GPU en `src/scope_stage.py` del repo `gamug/portfolio-nlp`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (son motores para modelos generativos, no aplicables directamente a este clasificador).
- Latencia y throughput: no disponibles. La inferencia requiere una pasada por hipotesis y etapa, por lo que el coste escala con el numero de hipotesis configuradas en `training_record.json`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `gamug/deberta-v3-news-scope-nli` | base (no publicado) | titulo + 800 caracteres | Clasificacion de alcance de noticias en 4 clases | MIT | Hugging Face |
| `MoritzLaurer/deberta-v3-base-zeroshot-v2.0` (modelo base) | base (no publicado) | no disponible | Zero-shot classification generica | no disponible en la informacion | Hugging Face |
| `MoritzLaurer/deberta-v3-large-zeroshot-v2.0` | large (no publicado) | no disponible | Zero-shot classification generica | no disponible en la informacion | Hugging Face |

La comparativa con alternativas especificas de clasificacion de alcance de noticias financieras no esta disponible: no se han identificado modelos publicos equivalentes en la informacion proporcionada.

## Limitaciones y advertencias

- La clase `out_of_scope` es la debil: en el held-out, aproximadamente la mitad de los cuerpos fuera de alcance se clasifican como `single` o `multi` y continuan en el pipeline. El autor lo acepta deliberadamente (un falso positivo cuesta una revision; un falso negativo pierde la noticia).
- No se conoce con certeza cuantos cuerpos continuan en el corpus real. Una estimacion sobre 1.000 cuerpos daba ~6,7 %, pero sobre los 309.972 cuerpos unicos el modelo etiqueta el 49 % como `out_of_scope` (11 % de los `ok` y 59 % de los `quarantined`). El gold held-out puede no representar a los cuerpos en cuarentena.
- El umbral del 90 % fijado por el proyecto no se cumple; el autor lo acepta explicitamente.
- La clase `sector` solo tiene 7 cuerpos gold en el held-out de 200: su recall se reporta pero no se valida con umbral.
- La cifra de 83,6 % es optimista: varias decisiones de diseno se tomaron mirando los mismos 200 cuerpos, y solo se evaluo una semilla.
- Entrenado y validado solo con noticias en ingles de 2022 a 2026; no probado con otras fuentes ni con cuerpos en otros idiomas.
- No es un modelo generativo ni un LLM: no razona, no genera texto y no soporta agentes ni tool calling.
- La licencia MIT permite uso comercial, pero el modelo depende de un base model cuyo termino de licencia no se detalla en la informacion disponible; conviene verificarlo antes de produccion.
- El primer commit (`5f5b2c27`) no contenia los pesos por un error de script; debe usarse el commit mas reciente, el que referencia `config/scope_model.json` del proyecto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gamug/deberta-v3-news-scope-nli
- Modelo base: https://huggingface.co/MoritzLaurer/deberta-v3-base-zeroshot-v2.0
- Repositorio del proyecto: https://github.com/gamug/portfolio-nlp (referenciado en la model card; no verificado)
- Documentacion de la receta de entrenamiento: `docs/splitting_training.md` del repositorio del proyecto
- Script de evaluacion held-out: `scripts/score_scope_heldout_2026_11_11.py` del repositorio del proyecto
- Script de inferencia batcheada: `src/scope_stage.py` del repositorio del proyecto

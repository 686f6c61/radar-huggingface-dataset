# mylonasc/open-fret-tab

## Resumen

open-fret-tab es un modelo de traduccion secuencia-a-secuencia muy pequeno (3.603.712 parametros) desarrollado por el usuario mylonasc dentro del proyecto open-fret. Su tarea no es generar musica, sino resolver un subproblema concreto de la transcripcion asistida por ordenador: dado un flujo de notas MIDI con informacion de cejilla, afinacion y eventos de ataque/liberacion, predecir una digitacion de guitarra valida, es decir, en que cuerda y en que traste tocar cada nota. El modelo predice el "donde", nunca el "que": la altura y el tiempo provienen de la entrada.

Tecnicamente es un T5 encoder-decoder diminuto (d_model 128, d_ff 1024, 3+3 capas, 4 cabezas de atencion) con un vocabulario WordLevel de 6.631 tokens, entrenado desde cero sin inicializacion preentrenada. El checkpoint publicado corresponde al paso 51.534 (epoca 15,6 de 20), por lo que se trata de un modelo detenido a mitad del schedule de entrenamiento, no de una ejecucion completada.

Su relevancia es acotada pero clara: demuestra que una red de ~14 MB puede aprender una funcion de mapeo musical bien delimitada con un objetivo de perdida especifico de dominio (cross-entropy combinada con terminos de pitch y tipo de evento). Es una pieza de investigacion reproducible, no un modelo de proposito general, y arrastra una advertencia importante sobre los derechos del corpus de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | T5 encoder-decoder (transformer denso) |
| Parametros totales | 3.603.712 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (vocabulario de 6.631 tokens; el ejemplo usa secuencias de ataque individuales) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el entrenamiento se hizo en fp16) |
| Idiomas soportados | ingles (metadatos del modelo); la tarea es simbolica sobre tokens MIDI, no linguistica |
| Licencia | MIT (repositorio); derechos del dataset de entrenamiento no establecidos |
| Formato de pesos | safetensors (via transformers) |

## Arquitectura y entrenamiento

El modelo es un T5 encoder-decoder de dimension reducida: `d_model` 128, `d_ff` 1024, 3 capas de encoder y 3 de decoder, 4 cabezas de atencion y vocabulario WordLevel de 6.631 tokens. Se entreno desde cero, sin inicializacion preentrenada, sobre un corpus derivado del dataset `vldsavelyev/guitar_tab` (tablaturas GuitarPro parseadas con AlphaTab 1.3.0). El corpus curado `loss-v4-curated-20261109` contiene 843.886 ventanas de entrenamiento, 105.394 de validacion y 104.920 de test, con particiones disjuntas por familia, listas de acondicionamiento de vocabulario sin `[UNK]` y enmascaramiento a nivel de grupo de conflictos de referencia en el mismo onset y misma cuerda (441k ventanas, 23,6M tokens de nota). La aumentacion de cejilla se aplico solo en entrenamiento.

La innovacion principal esta en la funcion de perdida: `0,3·(CE + Δ_smooth) + 1,0·pitch + 0,3·type`, con normalizacion condicional de pitch y suavizado de equivalencia ε = 0,1 sobre digitaciones de la misma altura. El entrenamiento se ejecuto en una RTX 4090 en fp16 con semilla 42, seleccion de hiperparametros mediante 12 trials de Optuna (lr 5,7e-4, dropout 0,144, batch 128 con grad-accum 2, warmup de 10k ejemplos, decaimiento x0,1 tras 100k ejemplos). El checkpoint se detuvo en el paso 51.534 (epoca 15,6 de 20). La evaluacion teacher-forced mas reciente reporta `eval_loss` 2,19 (`ce` 1,73, `pitch` 1,35), valores que el autor advierte que son diagnosticos de entrenamiento y no comparables entre objetivos distintos.

## Capacidades

- Traduccion de flujo MIDI a digitacion de guitarra: mapea tokens de entrada (`CAPO_*`, `TUNING_*`, `NO_*`/`NF_*`, `TS_*`) a tokens de salida `TAB_<cuerda>_<traste>` con huecos temporales `TS_<ticks>` y tecnicas opcionales.
- Prediccion de posicion, no de contenido musical: la altura y el tiempo se heredan de la entrada; el modelo solo decide cuerda y traste.
- Emision de una ranura de digitacion por cada ataque de entrada cuando se usa el generador ancorado del repositorio.
- Soporte de afinaciones alternativas y cejilla mediante tokens de acondicionamiento.
- Generacion de texto simbolico (pipeline `text-generation` en Hugging Face), aunque la tarea real es text2text con vocabulario cerrado.
- No soporta tool calling, function calling, agentes, vision, audio ni razonamiento multi-paso.
- Capacidad multilingue: no aplica; el modelo opera sobre un vocabulario simbolico musical.

## Casos de uso

- Edicion de tablaturas asistida: integrado en un editor, el modelo propone digitaciones para notas importadas de MIDI, reduciendo el trabajo manual de asignar cuerda y traste nota a nota. Es adecuado por su bajo coste computacional y su salida estructurada.
- Conversion por lotes de librerias MIDI a tablatura: un pipeline puede alimentar cada flujo de notas al modelo con el generador ancorado y producir tablaturas renderizables, dado que el modelo garantiza una ranura por ataque.
- Herramienta pedagogica de guitarra: generar digitaciones alternativas y comparar opciones de cejilla o afinacion para una misma pieza, usando los tokens `CAPO_*` y `TUNING_*` como variables de entrada.
- Preprocesado para sistemas de notacion: usar el modelo como etapa intermedia que convierte eventos MIDI en una representacion de digitacion que alimente renderizadores o visores de partituras.
- Investigacion en mapeo simbolico musical: servir como linea base reproducible para estudiar funciones de perdida especificas de dominio en tareas de digitacion, gracias a la publicacion de hiperparametros, configuracion de perdida y hash del tokenizer.
- Prototipado en dispositivos modestos: con ~14 MB de pesos, el modelo cabe en cualquier GPU consumer e incluso en CPU para inferencia interactiva, lo que permite experimentar sin infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor solo reporta diagnosticos de entrenamiento: `eval_loss` 2,19, `ce` 1,73 y `pitch` 1,35 en evaluacion teacher-forced, sin comparacion con lineas base del mismo decoder.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 y del orden de decenas de MB en fp16, dado el tamano de 3,6M de parametros.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.); el entrenamiento se realizo en una RTX 4090.
- Cabe en GPU consumer y en CPU sin problema; tambien en entornos embebidos o contenedores ligeros.
- Opciones de despliegue: transformers (`AutoTokenizer` + `T5ForConditionalGeneration`), text-generation-inference (el modelo esta marcado como compatible con endpoints), y el generador ancorado propio del repositorio (`scripts/inference.py`) para decodificacion fiel.
- Latencia y throughput: no disponibles de forma medida; por el tamano del modelo se espera latencia de milisegundos por secuencia en GPU y de decenas de milisegundos en CPU, aunque no hay cifras publicadas.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoria (T5 diminutos entrenados desde cero para digitacion de guitarra a partir de MIDI) con los que establecer una comparacion de parametros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Los conflictos de referencia en el mismo onset y misma cuerda se enmascaran en entrenamiento y nunca se aprenden; el renderizador estricto se niega a dibujarlos.
- No hay ablaciones aisladas: el objetivo combinado carece de una comparacion de control con cross-entropy del mismo decoder sobre metricas de notas generadas.
- Los bends y slides requieren modelado de contorno que la marginal de pitch no proporciona; la temporizacion, la ocupacion y la tocabilidad no estan regularizadas.
- El checkpoint se detuvo a mitad del schedule (epoca 15,6 de 20), por lo que no representa una ejecucion completada.
- Derechos del dataset de entrenamiento no establecidos: la model card y el loader del dataset no declaran licencia, y el repositorio convertidor aguas arriba tampoco. La licencia MIT cubre el codigo y la configuracion de esta release, pero no concede por si misma derechos sobre la musica ni los datos de entrenamiento. Cualquier uso comercial o de redistribucion debe resolver primero los derechos de los datos.
- Riesgo de alucinacion en el sentido de digitaciones no tocables o inconsistentes si se usa `generate` libre en lugar del generador ancorado.
- El modelo no genera contenido musical: no debe emplearse para componer ni para inferir altura o ritmo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mylonasc/open-fret-tab
- Repositorio del proyecto open-fret: https://github.com/mylonasc/open-fret
- Documentacion de perdidas de dominio: https://github.com/mylonasc/open-fret/blob/first-working-training-loop/docs/domain_aware_losses.md
- Documentacion sobre licencias del dataset: https://github.com/mylonasc/open-fret/blob/first-working-training-loop/docs/dataset_licensing.md
- Issue sobre alternativas con licencia mas clara: https://github.com/mylonasc/open-fret/issues/22
- Dataset de entrenamiento: https://huggingface.co/datasets/vldsavelyev/guitar_tab

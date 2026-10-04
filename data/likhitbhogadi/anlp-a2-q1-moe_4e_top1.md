# likhitbhogadi/anlp-a2-q1-moe_4e_top1

## Resumen

`likhitbhogadi/anlp-a2-q1-moe_4e_top1` es un modelo de traduccion automatica entrenado desde cero por el usuario likhitbhogadi (vinculado al repositorio de un trabajo academico de ANLP, aparentemente de IIIT Hyderabad, segun la URL de Weights & Biases). Se trata de un transformer decoder-only con variante de FFN basada en mezcla de expertos (*mixture of experts*, MoE) que cubre dos direcciones: vietnamita a ingles (vi→en) y japones a ingles (ja→en).

El modelo tiene 35,3 millones de parametros totales y 25,8 millones de parametros activos, con 4 expertos enrutados de anchura 512 y enrutamiento *top-1*. Se entreno sobre el conjunto `belumind/en-vi-ja-curated-500k-triplets` con un total de 30 millones de tokens de entrenamiento. El formato de secuencia es `<bos> <vi|ja> source <2en> target <eos>`, con un tokenizador BPE compartido.

Es relevante como ejemplo didactico y reproducible de como el enrutamiento disperso (MoE top-1) reduce el coste de computo por token manteniendo la capacidad total del modelo en una tarea de traduccion de baja resource. Sus resultados publicados son 31,62 BLEU en vi→en y 21,874 BLEU en ja→en, con una perplejidad de test de 12,3509 para ambas direcciones combinadas. El repositorio apenas tiene traccion (0 descargas, 0 *likes*) y no declara licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con FFN de mezcla de expertos (MoE, 4 expertos enrutados de anchura 512, top-1) |
| Parametros totales | 35.277.312 |
| Parametros activos | 25,8 M |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se documentan versiones cuantizadas) |
| Idiomas soportados | en, vi, ja |
| Licencia | no disponible |
| Formato de pesos | safetensors |

Datos adicionales del repositorio: tamano de 0,2 GB, 0 descargas y 0 likes. Fecha de creacion: 2026-10-04; ultima actualizacion: 2026-10-04.

## Arquitectura y entrenamiento

Arquitectura de transformer *decoder-only* entrenado desde cero, sin inicializacion a partir de un modelo preentrenado. La innovacion principal es la capa FFN: en lugar de una FFN densa convencional, se emplea una mezcla de expertos con 4 expertos enrutados y anchura 512, con enrutamiento *top-1* (solo se activa el experto mejor puntuado por token). Esta configuracion explica la diferencia entre los 35,3 M de parametros totales y los 25,8 M activos por *forward pass*. El codigo del modelo se encuentra en `src/part1/model.py` del repositorio de la asignatura, lo que implica que la implementacion es personalizada y no la de una arquitectura estandar de HuggingFace.

El entrenamiento se realizo sobre `belumind/en-vi-ja-curated-500k-triplets`, con un total de 30 millones de tokens. No se documenta si hubo fases de ajuste por instrucciones, RLHF o DPO: al tratarse de un modelo de traduccion puro y entrenado para una asignatura, es probable que el entrenamiento fuese exclusivamente de modelado de lenguaje condicionado (prediccion del *target*), pero este extremo no esta confirmado en la informacion disponible. El formato de secuencia de entrenamiento e inferencia es `<bos> <vi|ja> source <2en> target <eos>`, y se usa un tokenizador BPE compartido incluido en `tokenizer.json`. El log de entrenamiento esta publicado en Weights & Biases.

## Capacidades

- Traduccion de vietnamita a ingles (vi→en) en formato texto plano.
- Traduccion de japones a ingles (ja→en) en formato texto plano.
- Generacion autoregresiva con decodificacion *greedy* documentada en los resultados publicados (tambien podria admitir *beam search*, aunque no se especifica).
- Modelado de lenguaje condicionado mediante el formato de secuencia con etiquetas de idioma de origen (`<vi>` o `<ja>`) y de destino (`<2en>`).
- No se documenta soporte de *tool calling* ni de *function calling*.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documentan capacidades de vision, audio ni *thinking mode*.
- Capacidades multilingues limitadas al par de idiomas de origen declarados (vietnamita y japones) hacia ingles como unico destino.

## Casos de uso

- Traduccion de documentacion tecnica vietnamita a ingles: el modelo esta especializado en el par vi→en y obtiene 31,62 BLEU en test, un valor competitivo para un modelo de 35 M de parametros, adecuado para preprocesar manuales o notas tecnicas antes de su publicacion.
- Localizacion de contenido japones a ingles a pequena escala: con 21,874 BLEU en ja→en, es util para traduccion de soporte (correos, tickets, entradas de FAQ) donde no se requiere calidad editorial, y su tamano permite ejecucion en CPU.
- Prototipado academico y experimentacion con MoE: sirve como banco de pruebas reproducible para estudiar el efecto del enrutamiento *top-1* con 4 expertos frente a una FFN densa de parametros comparables, dado que el codigo esta disponible en el repositorio de la asignatura.
- Pipeline de traduccion de bajo coste en *edge* o entornos sin GPU: con 25,8 M de parametros activos, la huella de memoria es inferior a 1 GB en FP32, lo que permite desplegarlo en dispositivos con recursos limitados o en funciones serverless con poca RAM.
- Etiquetado y aumento de datos (data augmentation) para entrenar modelos de traduccion mayores: se puede usar como generador de traducciones sinteticas vi→en o ja→en para poblar corpus paralelos de dominio especifico.
- Filtrado y pre-anotacion de corpus: aplicar el modelo para puntuar pares de frases y descartar aquellos con perplejidad alta, usando la perplejidad de test publicada (9,5454 en vi→en y 15,981 en ja→en) como referencia de umbral.
- Investigacion sobre eficiencia de inferencia: comparar latencia y calidad de un MoE top-1 de 4 expertos frente a alternativas densas en tareas de traduccion de baja resource.

## Benchmarks y rendimiento

Resultados publicados en la *model card* del autor (BLEU calculado con decodificacion *greedy* y `sacrebleu 13a`):

| Metrica | vi→en | ja→en | Ambos |
|---|---|---|---|
| Perplejidad de test | 9,5454 | 15,981 | 12,3509 |
| BLEU de test (greedy, sacrebleu 13a) | 31,62 | 21,874 | 26,768 |

No se han publicado en la informacion disponible resultados de benchmarks estandar como MMLU, HumanEval o GSM8K, que por otra parte no aplican a un modelo especializado en traduccion.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion (calculada a partir de los 35.277.312 parametros):
  - FP32: aproximadamente 141 MB solo de pesos.
  - FP16/BF16: aproximadamente 71 MB.
  - INT8: aproximadamente 35 MB.
  - INT4: aproximadamente 18 MB.
- Con cache KV y activaciones, el *footprint* total se mantiene holgadamente por debajo de 1 GB en la mayoria de configuraciones.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; no requiere A100, H100 ni RTX 4090. Una GTX 1050 Ti, RTX 3050, RTX 4090 o similar funcionan sin problema, y el modelo es perfectamente viable en CPU.
- Si cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo de los ultimos diez anos, e incluso en placas integradas o Apple Silicon mediante ejecucion en CPU.
- Opciones de despliegue: al usar pesos `safetensors` y una arquitectura personalizada (`src/part1/model.py`), el despliegue previsible es mediante `transformers` con codigo de modelado propio. No se documenta conversion a GGUF para llama.cpp ni Ollama, ni compatibilidad con vLLM o TGI, que probablemente requeririan adaptar la implementacion del MoE.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de latencia por frase. Dado el tamano, se espera una latencia muy baja en GPU moderna, pero es una estimacion no verificada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| likhitbhogadi/anlp-a2-q1-moe_4e_top1 | 35,3 M totales / 25,8 M activos | no disponible | no disponible | HuggingFace, safetensors | MoE top-1 de 4 expertos; 31,62 BLEU vi→en, 21,874 BLEU ja→en |
| Helsinki-NLP/opus-mt-vi-en | no disponible | no disponible | no disponible | HuggingFace | Alternativa Marian especializada vi→en; resultados no comparados en la informacion disponible |
| Helsinki-NLP/opus-mt-ja-en | no disponible | no disponible | no disponible | HuggingFace | Alternativa Marian especializada ja→en; resultados no comparados en la informacion disponible |
| facebook/nllb-200-distilled-600M | 600 M | no disponible | CC-BY-NC-4.0 (uso no comercial) | HuggingFace | Modelo multilingue de proposito general con muchas mas lenguas; no se dispone de comparacion directa de BLEU con este modelo |

Los valores marcados como "no disponible" no aparecen en la informacion proporcionada. No se dispone de una comparacion de BLEU entre este modelo y las alternativas en las mismas condiciones de test.

## Limitaciones y advertencias

- Sesgos conocidos: no se documenta ninguna evaluacion de sesgos. Al entrenarse sobre un corpus curado de 500.000 tripletes, puede heredar sesgos de dominio y de estilo de ese corpus.
- Riesgo de alucinacion: como todo modelo generativo de traduccion, puede producir contenido no presente en el texto de origen, especialmente con frases largas, nombres propios o terminologia especializada. La perplejidad mas alta en ja→en (15,981 frente a 9,5454 en vi→en) sugiere un comportamiento menos fiable en japones.
- Limitaciones de contexto: la longitud maxima de contexto no esta documentada, lo que impide garantizar el comportamiento con secuencias largas. El entrenamiento se limita a 30 millones de tokens, un volumen muy reducido.
- Limitaciones de idioma: solo cubre vi→en y ja→en. No soporta traduccion hacia vietnamita o japones, ni desde o hacia el espanol, ni traduccion entre vi y ja directamente.
- Restricciones de licencia: la licencia no esta declarada en el repositorio, lo que impide asumir permisos de uso comercial. Ante la ausencia de licencia explicita, debe considerarse que no se conceden derechos de uso y que es necesario contactar con el autor antes de cualquier uso en produccion.
- Caveat de produccion: se trata de un artefacto academico con 0 descargas y 0 likes, sin mantenimiento documentado, sin version cuantizada y con una implementacion de modelo personalizada que dificulta su integracion en *runtimes* de inferencia estandar.
- El corpus y el modelo se centran en un unico par de direcciones de traduccion, por lo que no debe esperarse un comportamiento de proposito general.
- No se documentan evaluaciones de robustez frente a ruido, *code-switching* o texto malformado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/likhitbhogadi/anlp-a2-q1-moe_4e_top1
- Log de entrenamiento en Weights & Biases: https://wandb.ai/likhitbhogadi-iiit-hyderabad/anlp-a2-q1/runs/6uhz699a
- Conjunto de datos de entrenamiento: `belumind/en-vi-ja-curated-500k-triplets` (referenciado en la *model card*)
- Codigo del modelo: `src/part1/model.py` del repositorio de la asignatura (referenciado en la *model card*, sin URL publica en la informacion disponible)
- Tokenizador: `tokenizer.json` (incluido en el repositorio)
- Traducciones de test: `test_translations.csv` (incluido en el repositorio)

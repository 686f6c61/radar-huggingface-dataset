# Gabriel382/BioJev-9B

## Resumen

BioJev-9B es un clasificador de inferencia en lenguaje natural (NLI) especializado en dominio biomedico, desarrollado por Gabriel Henrique Alencar Medeiros bajo la supervision de Lina F. Soualmia en el laboratorio LITIS de la Universite de Rouen Normandie. No es un modelo generativo: se publica como un adaptador PEFT/QLoRA de clasificacion de secuencias sobre el modelo base Qwen/Qwen3.5-9B-Base, con tres etiquetas de salida (0 = contradiction, 1 = entailment, 2 = neutral).

Su relevancia esta en el pipeline de entrenamiento en cascada: parte del modelo base, aplica un DAPT (domain-adaptive pretraining) sobre 100 millones de tokens biomedicos (80 % PubMed, 20 % PMC, secuencia de 2048), despues un ajuste NLI general con 100.000 ejemplos (SNLI, MNLI, ANLI R1) y finalmente un ajuste NLI biomedico con 40.000 ejemplos (BioNLI, NLI4CT). El resultado es un clasificador de 9B de parametros que obtiene 94,73 de macro-F1 en el conjunto retenido BioNLI y una media de 33,93 de macro-F1 en transferencia zero-shot a tareas de tipado de relaciones (ChemProt, DDI2013, BioRED).

El modelo forma parte de una familia con miembros de 4B (BioJev-4B) y Nano (BioJev-Nano), y se distribuye unicamente como adaptador (0,2 GB de repositorio), por lo que requiere reconstruir el modelo base con `num_labels=3` antes de cargarlo. Es un artefacto de investigacion, sin licencia declarada y sin validacion clinica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (adaptador PEFT de clasificacion de secuencias sobre Qwen/Qwen3.5-9B-Base; la model card no detalla la arquitectura del base) |
| Parametros totales | 9B en el modelo base; el repositorio contiene solo el adaptador (0,2 GB) |
| Parametros activos | no aplica (no se describe como MoE en la informacion disponible) |
| Longitud de contexto | no disponible en la model card; el DAPT se entreno con longitud de secuencia 2048 |
| Tipos de cuantizacion | QLoRA 4-bit durante el entrenamiento; carga en 4-bit para inferencia mediante bitsandbytes (`--load-in-4bit`) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT; libreria `peft`) |
| Modelo base | Qwen/Qwen3.5-9B-Base |
| Tarea (pipeline) | text-classification |
| Etiquetas | 0 = contradiction, 1 = entailment, 2 = neutral |
| Fecha de creacion | 2026-10-06 |
| Descargas / likes | 0 / 1 |

## Arquitectura y entrenamiento

El checkpoint liberado es un adaptador PEFT entrenado con QLoRA en bfloat16 sobre cuantizacion de 4 bits. Sobre el modelo base Qwen3.5-9B-Base se anade una cabeza de clasificacion de secuencias con tres clases, y el adaptador se aplica sobre esa cabeza (`PeftModelForSequenceClassification`). El entrenamiento sigue tres fases secuenciales documentadas por el autor.

La primera fase es un DAPT biomedico con 100 millones de tokens (80 % PubMed, 20 % PMC) y longitud de secuencia 2048. La segunda es el ajuste NLI general con 100.000 ejemplos: SNLI 35.000, MNLI 45.000 y ANLI R1 20.000, con resultados de validacion de 89,20 % de accuracy, 89,15 % de macro-F1 y 0,2958 de loss. La tercera es el ajuste NLI biomedico con 40.000 ejemplos: BioNLI 30.000 y NLI4CT 10.000, con 92,77 % de accuracy, 92,30 % de macro-F1 y 0,1996 de loss. No se menciona uso de RLHF ni DPO, ni tecnicas de decodificacion especulativa o atencion lineal; el objeto del modelo es clasificacion, no generacion.

La model card describe ademas una capa de compatibilidad con la API "System One" (endpoint `POST /v1/systemone`, tipos `choice`, `noul` y `score`), que el propio autor califica explicitamente como puente de compatibilidad de ingenieria sobre el clasificador NLI, no como un checkpoint nativo de Ollama o System One.

## Capacidades

- Clasificacion NLI de tres clases (contradiction, entailment, neutral) sobre pares premisa-hipotesis en ingles.
- NLI en dominio biomedico, con buen rendimiento en el conjunto retenido BioNLI (94,73 de macro-F1) y en NLI4CT (72,50 de macro-F1, validacion vista durante el entrenamiento completo).
- Transferencia zero-shot a tipado de relaciones biomedicas: ChemProt (31,13 macro-F1), DDI2013 (36,35 macro-F1) y BioRED (34,32 macro-F1), con una media de 33,93 en esos tres conjuntos.
- Estimacion de confianza por clase mediante softmax, con metricas de calibracion publicadas (ECE, NLL y confianza media por conjunto).
- Exposicion mediante API HTTP a traves de `scripts/serve_systemone.py`, con tipos de peticion `choice`, `noul` y `score`.
- Carga en 4 bits para inferencia con bitsandbytes.
- No soporta generacion de texto, tool calling, function calling, uso como agente ni razonamiento multi-paso; es un clasificador, no un modelo instructivo.
- No soporta vision, audio ni multimodalidad.
- No tiene capacidades multilingues declaradas: unicamente ingles.

## Casos de uso

- Verificacion de afirmaciones biomedicas contra evidencia: dado un fragmento de articulo (premisa) y una afirmacion derivada (hipotesis), el modelo clasifica si la evidencia la implica, la contradice o es neutral, con 94,73 de macro-F1 en BioNLI.
- Filtrado y triaje de literatura cientifica: procesar pares abstract-afirmacion para marcar posibles contradicciones antes de la revision humana, usando la salida de la clase 0 (contradiction) como senal de alerta.
- Pre-anotacion en curación de bases de conocimiento: usar la transferencia zero-shot a ChemProt y BioRED (31-34 macro-F1) para etiquetar relaciones quimico-proteina y relaciones biomedicas de forma preliminar, con revision manual obligatoria por el bajo rendimiento absoluto.
- Deteccion de interacciones farmaco-farmaco: aplicar el modelo sobre pares de entidades en DDI2013 (36,35 macro-F1) como primer filtro en un pipeline de farmacovigilancia, siempre con confirmacion por un experto.
- Verificacion en pipelines RAG biomedicos: colocar BioJev-9B como componente de entailment que comprueba si la respuesta generada por otro modelo esta respaldada por el texto recuperado, reduciendo respuestas sin soporte documental.
- Emparejamiento de criterios de elegibilidad en ensayos clinicos: comparar el texto de un informe de ensayo con los criterios de inclusion mediante NLI4CT (72,50 de macro-F1) para preseleccionar candidatos.
- Analisis de calibracion y fiabilidad: usar los valores de ECE y NLL publicados para desplegar umbrales de abstención, derivando a revision humana los casos con confianza baja o calibracion pobre.
- Integracion mediante API compatible: exponer el clasificador a traves del endpoint `POST /v1/systemone` con los tipos `choice`, `noul` y `score` para conectar herramientas existentes que esperen esa interfaz.

## Benchmarks y rendimiento

Resultados de evaluacion congelada publicados en la model card:

| Dataset | Rol | Accuracy (%) | Macro-F1 | ECE (%) | NLL | Confianza media (%) |
|---|---|---:|---:|---:|---:|---:|
| BioNLI | NLI biomedico retenido | 95,14 | 94,73 | 2,20 | 0,146 | 97,27 |
| NLI4CT | validacion vista en el entrenamiento completo | 72,50 | 72,50 | 14,70 | 0,693 | 86,30 |
| ChemProt | tipado de relaciones zero-shot | 32,24 | 31,13 | 10,34 | 1,995 | 41,00 |
| DDI2013 | tipado de relaciones zero-shot | 39,33 | 36,35 | 9,17 | 1,372 | 32,27 |
| BioRED | tipado de relaciones zero-shot | 50,11 | 34,32 | 6,52 | 1,156 | 54,64 |

Medias agregadas reportadas: 33,93 de macro-F1 en transferencia zero-shot a relaciones (ChemProt, DDI2013, BioRED) y 53,80 de macro-F1 como media de los cinco conjuntos.

Resultados de validacion durante el entrenamiento:

| Fase | Accuracy (%) | Macro-F1 (%) | Loss |
|---|---:|---:|---:|
| NLI general (SNLI + MNLI + ANLI R1) | 89,20 | 89,15 | 0,2958 |
| NLI biomedico (BioNLI + NLI4CT) | 92,77 | 92,30 | 0,1996 |

## Requisitos de hardware

Las siguientes cifras son estimaciones derivadas del tamano del modelo base (9B) y no han sido publicadas por el autor:

- Inferencia en bfloat16: aproximadamente 18-20 GB de VRAM para los pesos, mas memoria de activaciones; con secuencia 2048 el consumo adicional es moderado por tratarse de una cabeza de clasificacion.
- Inferencia en 4 bits (bitsandbytes): aproximadamente 6-8 GB de VRAM, la opcion documentada por el autor mediante `--load-in-4bit`.
- GPU de datacenter recomendadas: A100 (40 o 80 GB), H100, L40S. Con estas GPUs cabe holgadamente en bfloat16.
- GPU de consumo: una RTX 4090 o RTX 3090 de 24 GB puede ejecutar el modelo en bfloat16 de forma ajustada, y en 4 bits con holgura. Tarjetas de 16 GB como la RTX 4080 requeririan cuantizacion de 4 bits.
- Despliegue: `transformers` + `peft` + `accelerate`, con `bitsandbytes` opcional; el repositorio incluye `scripts/serve_systemone.py` como servidor de referencia. No es compatible con vLLM, llama.cpp, Ollama ni TGI como modelo generativo, ni existen pesos GGUF publicados; la capa "System One" es un puente de compatibilidad, no un checkpoint nativo de Ollama.
- Latencia y throughput: no disponible. No se han publicado mediciones.

## Comparativa con modelos similares

El autor publica una comparacion dentro de la propia familia BioJev sobre la media de macro-F1 en transferencia de relaciones:

| Modelo | Parametros | Media macro-F1 en transferencia de relaciones | Contexto | Licencia | Disponibilidad |
|---|---|---:|---|---|---|
| BioJev-Nano | no disponible | 21,01 | no disponible | no disponible | https://huggingface.co/Gabriel382/BioJev-Nano |
| BioJev-4B | 4B (base) | 30,83 | no disponible | no disponible | https://huggingface.co/Gabriel382/BioJev |
| BioJev-9B | 9B (base) | 33,93 | no disponible | no disponible | https://huggingface.co/Gabriel382/BioJev-9B |

La model card indica que el salto de 4B a 9B mejora la transferencia agregada, con ganancias claras en ChemProt y BioRED, mientras que DDI2013 no mejora de forma monotona con el tamano. El propio autor advierte que se trata de una comparacion empirica de tamano de modelo, no de un estudio formal de leyes de escala.

No se dispone en la informacion proporcionada de datos de otros modelos NLI biomedicos externos a la familia BioJev (por ejemplo, alternativas basadas en PubMedBERT o similares), por lo que no es posible establecer una comparativa cruzada fiable.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido. Conviene contactar con el autor antes de cualquier despliegue productivo.
- El propio autor declara que BioJev es un proyecto de investigacion y que ni el modelo ni la capa de compatibilidad "System One" son sistemas de decision clinica validados; no deben usarse como unica base para diagnostico o tratamiento.
- Aunque no genera texto y por tanto no alucina en el sentido generativo, si puede producir clasificaciones erroneas con alta confianza: la confianza media en BioNLI es del 97,27 % frente a 41,00 % en ChemProt o 32,27 % en DDI2013, lo que indica un comportamiento de calibracion muy distinto segun el dominio.
- Calibracion degradada fuera del dominio: ECE del 14,70 % en NLI4CT frente al 2,20 % en BioNLI, con NLL de 0,693 frente a 0,146.
- Rendimiento bajo en tipado de relaciones zero-shot: 31,13 de macro-F1 en ChemProt, 36,35 en DDI2013 y 34,32 en BioRED. No es adecuado como clasificador autonomo en esas tareas sin revision humana.
- DDI2013 no mejora de forma monotona con el tamano del modelo dentro de la familia, lo que sugiere que aumentar parametros no resuelve todos los dominios.
- Solo soporta ingles. No hay capacidades multilingues declaradas, lo que limita su uso en entornos clinicos en castellano.
- Sesgos conocidos: no documentados por el autor. El corpus de entrenamiento (PubMed y PMC) puede infrarrepresentar poblaciones, idiomas y contextos clinicos no anglosajones.
- El repositorio contiene unicamente el adaptador (0,2 GB): es obligatorio descargar y reconstruir el modelo base Qwen/Qwen3.5-9B-Base con `num_labels=3` y los mapeos de etiquetas correctos para que la carga funcione.
- Estado de validacion externa muy limitado: 0 descargas y 1 like en el momento de la consulta, sin publicacion cientifica formal disponible todavia (el autor indica que la cita al paper se anadira cuando exista).
- NLI4CT aparece como validacion vista durante el entrenamiento completo, por lo que su 72,50 de macro-F1 no debe interpretarse como una medida de generalizacion limpia.

## Enlaces

- Checkpoint BioJev-9B en HuggingFace: https://huggingface.co/Gabriel382/BioJev-9B
- BioJev-4B: https://huggingface.co/Gabriel382/BioJev
- BioJev-Nano: https://huggingface.co/Gabriel382/BioJev-Nano
- Codigo fuente en GitHub: https://github.com/Gabriel382/BioJev
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Paper: no disponible (el autor indica que la cita formal se anadira cuando se publique)
- Demo: no disponible
- Los resultados de la busqueda web realizada no aportaron enlaces relevantes al modelo.

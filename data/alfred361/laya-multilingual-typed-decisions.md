# alfred361/laya-multilingual-typed-decisions

## Resumen

`alfred361/laya-multilingual-typed-decisions` es un checkpoint de clasificación de texto obtenido por fine-tuning de `convaiinnovations/laya-multilingual` (descrito por el autor como mmBERT-base, 322M parámetros) sobre el dataset `LocalLLaMA/typed-decisions`. El modelo no genera texto: asigna a cada caso una decisión tipada acompañada de una puntuación calibrada, es decir, una probabilidad que pretende ser interpretable como confianza real. La relevancia de este checkpoint concreto es que cubre un hueco: la versión inglesa del fine-tune ya existía, pero la variante multilingüe del modelo base no tenía un ajuste equivalente.

El interés técnico principal está en la calibración. Sobre el split de test oficial (400 casos, 2000 decisiones), el checkpoint alcanza una accuracy de 0,749 con un ECE de 0,112, frente al ECE de 0,213 del fine-tune inglés publicado. Según el autor, esa diferencia no proviene de un mejor entrenamiento, sino de que el checkpoint inglés arrastra `temperature_by_options` heredado de su base, mientras que este ajusta temperaturas al final del entrenamiento y publica `temperature_by_options: {}`.

El modelo se entrenó con 4 épocas en 2xT4 mediante DDP, con RLCD y una regla de puntuación estrictamente propia (*strictly proper scoring rule*), a partir de la receta publicada por los autores del modelo base. La latencia medida es de 71,4 ms por caso en el percentil 50 sobre una T4. La licencia es Apache-2.0, igual que la del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder tipo transformer (mmBERT-base segun el autor), modelo base `convaiinnovations/laya-multilingual` |
| Parametros totales | 321.908.998 (aprox. 322M, dato real de safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No se documentan cuantizaciones publicadas; el repo distribuye safetensors |
| Idiomas soportados | Multilingue (etiqueta `multilingual`); el entrenamiento del split de ajuste fue solo en ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria `transformers`); tamano del repo 0,7 GB |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de 322M parametros, derivado de `convaiinnovations/laya-multilingual`, que el autor identifica como mmBERT-base. La tarea es `text-classification`, pero la salida no es una etiqueta plana: el checkpoint produce decisiones tipadas con una puntuacion asociada, pensada para funcionar como probabilidad calibrada. El ajuste se hizo sobre `LocalLLaMA/typed-decisions`, un dataset de decisiones etiquetadas procedente de cuatro flujos de trabajo sinteticos.

El entrenamiento consistio en 4 epocas con DDP sobre 2xT4, siguiendo la receta del cuaderno `laya_finetune_typed_decisions_2xT4_kaggle.ipynb` con `MODEL_ID` apuntando al modelo base multilingue. El metodo es RLCD con una regla de puntuacion estrictamente propia, y las temperaturas se reajustaron despues del entrenamiento; el checkpoint publica `temperature_by_options: {}`, a diferencia del fine-tune ingles, que hereda esas temperaturas de su base y por eso queda peor calibrado. No se documentan innovaciones de arquitectura propias: la innovacion esta en el procedimiento de calibracion y en el objetivo de entrenamiento.

## Capacidades

- Clasificacion de decisiones tipadas en cuatro flujos de trabajo: trazas de agentes, atencion al cliente, procesamiento de facturas e incidentes de seguridad.
- Emision de puntuaciones calibradas (Brier 0,063 y ECE 0,112 en el test oficial), aptas para umbrales de decision sensibles al riesgo.
- Regresion de una puntuacion por caso: el score MAE medido es 0,247.
- Funcionamiento como encoder de 322M parametros, con inferencia rapida (71,4 ms por caso a p50 en T4).
- Soporte multilingue declarado por herencia del modelo base, aunque no medido (vease limitaciones).
- No dispone de generacion de texto, tool calling, modo thinking, vision ni audio: es un clasificador, no un modelo generativo.

## Casos de uso

- Triaje de trazas de agentes: el modelo etiqueta y puntua decisiones dentro de trazas de agentes automaticos (accuracy 0,720 en ese flujo), lo que permite marcar pasos dudosos para revision humana usando la puntuacion calibrada como umbral.
- Enrutado de tickets de atencion al cliente: con un 0,736 de accuracy en ese flujo, se puede clasificar cada conversacion entrante y derivarla al equipo o a la politica adecuada, aprovechando la puntuacion para escalar los casos de baja confianza.
- Procesamiento de facturas: el flujo con mejor rendimiento medido (0,792) permite tipificar decisiones sobre facturas y usar la confianza calibrada para decidir entre aprobacion automatica y revision manual.
- Gestion de incidentes de seguridad: con 0,746 de accuracy, sirve para clasificar decisiones de respuesta ante incidentes y priorizar alertas segun la probabilidad asignada.
- Filtrado previo a un LLM generativo: al ser un encoder de 322M y 71,4 ms por caso, encaja como primera etapa barata que descarta o etiqueta casos antes de invocar un modelo mayor, reduciendo coste por peticion.
- Auditoria de decisiones en produccion: la calibracion (ECE 0,112) permite construir informes de fiabilidad en los que la puntuacion declarada por el modelo se compara con la tasa real de acierto por rango de confianza.
- Deteccion de anomalias fuera de distribucion: combinando la puntuacion baja con la clase predicha se pueden señalar casos que no encajan en los cuatro flujos conocidos, aunque el modelo no fue entrenado explicitamente para ello.

## Benchmarks y rendimiento

Datos medidos por el autor sobre 400 casos de test y 2000 decisiones, en el split de test oficial:

| Modelo | Accuracy | Brier | ECE | Score MAE |
|---|---|---|---|---|
| Este checkpoint | 0,749 | 0,063 | 0,112 | 0,247 |
| `laya-multilingual` antes del fine-tune | 0,352 | no disponible | no disponible | no disponible |
| Techo de autoacuerdo del profesor (teacher self-agreement ceiling) | 0,735 | no disponible | no disponible | no disponible |
| TypeSafe Jev 1.13.0 (publicado) | 0,727 | 0,148 | 0,144 | 0,391 |
| Clase mayoritaria por pregunta | 0,461 | no disponible | no disponible | no disponible |
| `laya-typed-decisions`, ingles (publicado) | 0,766 | 0,062 | 0,213 | 0,242 |

Desglose por flujo de trabajo:

| Flujo | Accuracy |
|---|---|
| Observabilidad de trazas de agentes | 0,720 |
| Atencion al cliente | 0,736 |
| Procesamiento de facturas | 0,792 |
| Incidentes de seguridad | 0,746 |

Nota metodologica del autor: el 0,352 del modelo base se midio en el mismo harness y sobre el mismo split que el checkpoint ajustado; la cifra publicada para ese base es 0,342, por lo que el harness coincide con el dato de origen dentro de 0,01.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16, unos 0,65 GB de pesos; en fp32, unos 1,29 GB; en int8, unos 0,32 GB. El repo ocupa 0,7 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM sirve; el autor midio 71,4 ms por caso a p50 en una NVIDIA T4. No se requieren A100 ni H100.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090 o inferiores, e incluso en CPU para lotes pequenos.
- Opciones de despliegue: `transformers` con la pipeline `text-classification`, exportacion a ONNX con Optimum para inferencia optimizada, HF Inference Endpoints y servidores propios (FastAPI, TorchServe). No hay pesos GGUF publicados, por lo que llama.cpp y Ollama no son aplicables tal cual; vLLM esta orientado a modelos generativos y no es la via natural para este encoder.
- Latencia y throughput: 71,4 ms por caso a p50 en T4 (dato medido por el autor). No se publican cifras de throughput agregado ni de latencia en otras GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Accuracy | Brier | ECE | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este checkpoint | 322M | 0,749 | 0,063 | 0,112 | Apache-2.0 | Publicado en HuggingFace |
| `laya-typed-decisions` (ingles) | No disponible (mismo base mmBERT) | 0,766 | 0,062 | 0,213 | No disponible en la informacion | Publicado |
| `laya-multilingual` (base sin ajustar) | 322M | 0,352 | No disponible | No disponible | Apache-2.0 (heredada) | Publicado |
| TypeSafe Jev 1.13.0 | No disponible | 0,727 | 0,148 | 0,144 | No disponible en la informacion | Publicado |

Frente al fine-tune ingles, este checkpoint pierde 1,8 puntos de accuracy pero mejora la calibracion de forma sustancial (ECE 0,112 frente a 0,213). Frente a TypeSafe Jev 1.13.0 gana en accuracy (0,749 frente a 0,727) y en las tres metricas de calibracion y error de puntuacion. Frente al modelo base multilingue sin ajustar, la mejora en accuracy es de casi 40 puntos.

## Limitaciones y advertencias

- El split de entrenamiento es exclusivamente en ingles: el modelo es un encoder multilingue al que se le enseñaron decisiones en ingles. La propiedad multilingue no esta medida y el benchmark oficial no contiene casos no ingleses. El propio autor recomienda tratar el uso translinguistico como no probado hasta que se mida el acuerdo entre idiomas sobre el mismo caso.
- Especializacion estrecha: es un especialista en cuatro flujos sinteticos (trazas de agentes, atencion al cliente, facturas, incidentes de seguridad). Fuera de ellos se debe esperar el comportamiento del checkpoint base, no el del ajustado.
- En los cuatro flujos la accuracy queda entre 0,720 y 0,792, por lo que entre un 21 % y un 28 % de los casos se clasifican mal; para decisiones de alto impacto hace falta un umbral de confianza y revision humana.
- Dataset sintetico: el material de entrenamiento procede de decisiones generadas, lo que puede no reflejar la distribucion real de produccion.
- Riesgo de sobreconfianza fuera de distribucion: aunque la calibracion es buena en el test oficial, no hay garantia de que las temperaturas ajustadas se comporten igual con entradas de dominios no vistos. No se han publicado metricas de calibracion por subgrupo ni por idioma.
- No aplican riesgos de alucinacion generativa (no genera texto), pero si el riesgo de asignar etiquetas plausibles a entradas que no pertenecen a ninguna de las cuatro categorias.
- Licencia Apache-2.0, heredada del upstream: permite uso comercial con las obligaciones habituales de atribucion y conservacion de avisos. La receta y el modelo base son de Convai Innovations y el benchmark de LocalLLaMA; conviene verificar los terminos del dataset `LocalLLaMA/typed-decisions` antes de un uso comercial.
- Rendimiento declarado por el autor sobre su propio harness; no hay evaluacion independiente publicada.
- Los resultados de la busqueda web realizada no aportan informacion relevante sobre este modelo: los enlaces recuperados no guardan relacion con el checkpoint.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alfred361/laya-multilingual-typed-decisions
- Modelo base: https://huggingface.co/convaiinnovations/laya-multilingual
- Dataset de ajuste: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Cuaderno de la receta de fine-tuning: https://github.com/NandhaKishorM/laya/blob/main/notebooks/laya_finetune_typed_decisions_2xT4_kaggle.ipynb

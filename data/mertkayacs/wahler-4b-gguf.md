# mertkayacs/Wahler-4B-GGUF

## Resumen

Wähler-4B es un modelo de lenguaje pequeno (4.205.751.296 parametros) especializado en clasificacion de texto y toma de decisiones estructuradas en aleman, desarrollado por Eschatia Labs, un laboratorio de investigacion open source independiente y sin animo de lucro liderado por Mert Kaya. Forma parte del proyecto JevAlt, una familia de modelos de decision pequenos para ingles, turco y aleman. El modelo no esta disenado como un chatbot generativo generalista, sino como un clasificador calibrado que, dado un texto y un conjunto de opciones con criterios, devuelve la opcion mas probable junto con probabilidades calibradas.

La version aqui descrita es la cuantizacion GGUF de `mertkayacs/Wahler-4B`, publicada por el mismo autor para ejecucion en CPU mediante llama.cpp. El interes practico es claro: permite enrutamiento de tickets, etiquetado y triaje en aleman en hardware modesto (3,03 GB de RAM pico con Q4_K_M a 4k de contexto), sin GPU. El modelo base completo reporta un 92,0% de precision frente al 81,1% de Kev-4B en decisiones alemanas retenidas del pipeline de entrenamiento.

La relevancia actual radica en la combinacion de tres factores: licencia Apache-2.0 sin restricciones comerciales, soporte nativo de un flujo de calibracion propio (JevAlt) y un enfoque de "decision model" en lugar de generacion libre, lo que reduce el riesgo de alucinacion en tareas acotadas. La model card advierte explicitamente que no debe usarse para autorizacion y que las instrucciones plantadas siguen siendo un caso de fallo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer, detalle no publicado) |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 4k verificado en pruebas de RAM (maximo no declarado) |
| Tipos de cuantizacion | Q4_K_M (2,71 GB), Q5_K_M (3,08 GB), Q8_0 (4,48 GB) |
| Idiomas soportados | aleman (de), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); safetensors en el modelo base |

## Arquitectura y entrenamiento

No se detalla la arquitectura interna en la informacion disponible mas alla de que es un transformer de 4.205.751.296 parametros. El modelo se entrena como clasificador de decision: recibe un texto y un objeto JSON con preguntas tipadas (`choice`) y criterios por opcion, y se lee la probabilidad del siguiente token correspondiente a cada opcion. El servidor JevAlt aplica un fichero `calibration.json` sobre esas probabilidades, lo que indica que el entrenamiento incluye una fase de calibracion supervisada sobre datos propios.

Los datos de entrenamiento provienen del dataset `mertkayacs/jevalt-data`. No se especifican el numero de tokens, la composicion exacta ni si hubo RLHF o DPO. La model card menciona que el "reasoning" (modo de razonamiento) no mejoro la precision en aleman en las pruebas de fecha, numero y politica reportadas, por lo que se recomienda desactivarlo para este idioma. La innovacion tecnica destacable es el flujo de decision calibrada con abstencion (`abstain`) y la lectura directa de probabilidades del siguiente token, en lugar de generacion autoregresiva libre.

## Capacidades

- Clasificacion de texto y enrutamiento entre opciones definidas por el usuario con criterios explicitos.
- Salida de probabilidades calibradas por opcion (no solo la etiqueta ganadora).
- Soporte de abstención (`abstain`) cuando ninguna opcion es adecuada.
- Modo de razonamiento opcional (`reasoning: on/off`), aunque desaconsejado en aleman segun el autor.
- Multilingue limitado a aleman e ingles.
- Ejecucion en CPU via llama.cpp, Ollama y LM Studio.
- Integracion con endpoints compatibles (`endpoints_compatible`) y servidor JevAlt con API `/v1/systemone`.
- No se documentan capacidades de codigo, matematicas avanzadas, vision, audio ni tool calling generico.

## Casos de uso

- Enrutamiento de tickets de soporte: dado un texto de reclamacion y un conjunto de equipos con criterios (Abrechnung, Technischer Support, Vertrieb, Konto), el modelo devuelve la opcion con probabilidad calibrada; en el ejemplo de la model card asigna 0,9176 a Abrechnung.
- Triaje de correo entrante en aleman: clasificacion por categoria con umbrales ajustados sobre la calibracion propia, ejecutable en un servidor sin GPU.
- Etiquetado de datos a escala: procesamiento por lotes en CPU con Q4_K_M a 3,03 GB de RAM pico, adecuado para pipelines de anotacion.
- Moderacion y priorizacion: asignacion de colas de atencion segun criterios de negocio definidos en el JSON de preguntas.
- Despliegue on-device: integracion en estaciones de trabajo o portatiles sin GPU mediante Ollama (`ollama run mertkayacs/wahler-4b`), que responde con la letra de la opcion.
- Decisiones con abstención: cuando la confianza calibrada es baja, el modelo puede abstenerse y derivar a revision humana, util en flujos donde el error es costoso.
- Clasificacion bilingue aleman/ingles en entornos corporativos con documentacion en ambos idiomas.

## Benchmarks y rendimiento

| Metrica | Wahler-4B (precision completa) | Kev-4B |
|---|---|---|
| Precision en decisiones alemanas retenidas | 92,0% | 81,1% |

Comprobaciones de cuantizacion (no son benchmarks, sino acuerdo con la version de precision completa sobre 40 decisiones de validacion por cuantizacion):

| Fichero | Tamano | Acuerdo en opcion seleccionada | Brecha maxima de probabilidad | Segundos por peticion | RAM pico |
|---|---|---|---|---|---|
| Q4_K_M | 2,71 GB | 97,5% | 0,3419 | 10,03 | 3,03 GB |
| Q5_K_M | 3,08 GB | 95,0% | 0,1494 | 17,33 | 3,39 GB |
| Q8_0 | 4,48 GB | 97,5% | 0,0315 | 11,58 | 4,76 GB |

Mediciones realizadas en una maquina HF de 8 vCPU, 4 hilos, contexto de 4k, sin mmap y con repacking activado. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- RAM pico: 3,03 GB con Q4_K_M a 4k de contexto; 3,39 GB con Q5_K_M; 4,76 GB con Q8_0.
- No requiere GPU: el modelo esta pensado para inferencia en CPU.
- GPU: no se documentan requisitos ni recomendaciones de GPU (A100, H100, RTX 4090 no mencionadas).
- Cabe en cualquier equipo consumer con al menos 4 GB de RAM libre para Q4_K_M.
- Despliegue: llama.cpp, Ollama (`mertkayacs/wahler-4b`), LM Studio y servidor JevAlt (`jevalt serve`).
- Latencia medida: 10,03 s por peticion con Q4_K_M en 8 vCPU y 4 hilos. El throughput no se especifica.
- Configuracion recomendada por el autor: sin mmap y con repacking activado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision en decisiones alemanas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wahler-4B (este) | 4.205.751.296 | 4k verificado | 92,0% | Apache-2.0 | GGUF en HF, Ollama |
| Kev-4B | no disponible | no disponible | 81,1% | no disponible | no disponible |
| Otros modelos de la familia JevAlt (ingles, turco) | no disponible | no disponible | no disponible | Apache-2.0 | GitHub del proyecto |

No se dispone de datos de otros modelos comparables de clasificacion en aleman en la informacion proporcionada.

## Limitaciones y advertencias

- Instrucciones plantadas (prompt injection) siguen siendo un caso de fallo documentado.
- Textos largos e irrelevantes degradan el rendimiento.
- La aritmetica de fechas es un caso de fallo conocido.
- No debe usarse para autorizacion: el control de permisos debe quedar fuera del modelo.
- El modo de razonamiento no mejoro la precision en aleman; el autor recomienda desactivarlo.
- La calibracion debe reajustarse sobre datos propios antes de fijar umbrales.
- La comparacion de cuantizaciones se basa en solo 40 decisiones de validacion por fichero; el propio autor advierte que mas precision no garantiza mayor acuerdo en esa muestra.
- Sesgos: no documentados en la informacion disponible.
- Riesgo de alucinacion: mitigado por el diseno de clasificacion acotada, pero no eliminado en entradas fuera de distribucion.
- Idiomas: solo aleman e ingles; no se garantiza comportamiento en otras lenguas.
- Licencia Apache-2.0: permite uso comercial sin restricciones adicionales documentadas.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/mertkayacs/Wahler-4B-GGUF
- Modelo base de precision completa: https://huggingface.co/mertkayacs/Wahler-4B
- Repositorio GitHub JevAlt: https://github.com/mertkayacs/jevalt
- Dataset de entrenamiento: https://huggingface.co/datasets/mertkayacs/jevalt-data
- Resultados de benchmark: https://huggingface.co/datasets/mertkayacs/jevalt-bench
- Pagina de benchmarks: https://eschatialabs.com/benchmarks/jevalt-bench/
- Pagina del proyecto: https://jevalt.mertkayacs.com/models/wahler-4b/
- Demo Emberwick: https://emberwick.mertkayacs.com
- Pagina del autor: https://mertkayacs.com
- Eschatia Labs: https://eschatialabs.com
- Ollama: https://ollama.com/mertkayacs/wahler-4b

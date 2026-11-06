# luispoveda93/sharky-0.5B-v3b

## Resumen

sharky-0.5B-v3b es un adaptador PEFT (LoRA) publicado por el usuario luispoveda93 sobre el modelo base openbmb/MiniCPM4-0.5B, un transformer denso de 0,5 mil millones de parametros. El adaptador esta especializado en clasificacion de trafico de red a partir de capturas pcap, con enfasis en seguridad de red y deteccion de comportamiento benigno y malicioso sobre el corpus CIC-IDS2017 y otros conjuntos de evaluacion (S1, S2b, S4 Neris y un conjunto bloqueado). Se trata de un delta fine-tune de una iteracion anterior (sharky-0.5B-v3) entrenado con 15.000 estados benignos adicionales de CIC-IDS2017, replay y una tasa de aprendizaje de 2e-5 durante 4.126 pasos sobre 66.000 registros.

El modelo tiene un interes fundamentalmente metodologico: el autor lo etiqueta explicitamente como candidato rechazado ("rejected-candidate") dentro de un proceso de ablacion pre-registrado. Su objetivo declarado era reparar el recall benigno de la suite S1, pero el resultado fue el contrario (0,36 a 0,24), lo que el autor interpreta como evidencia de que el atajo de representacion en el trafico benigno web de CIC-IDS2017 es un problema de representacion y no de cantidad de datos. Por tanto, no es un modelo destinado a produccion, sino un artefacto documental de investigacion.

La relevancia actual es limitada como modelo de uso general, pero es un ejemplo util de gobernanza de experimentos: gate pre-registrado, registro publico de resultados y decision de no promocionar el checkpoint. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamano de 0,0 GB, coherente con un adaptador LoRA de pequeno tamano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base MiniCPM4-0.5B) con adaptador PEFT/LoRA |
| Parametros totales | 0,5 mil millones (modelo base); parametros del adaptador no disponibles |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo es un delta fine-tune con PEFT sobre openbmb/MiniCPM4-0.5B. El adaptador se entreno con 15.000 estados benignos adicionales de CIC-IDS2017, con replay de datos previos, tasa de aprendizaje 2e-5 y 4.126 pasos sobre 66.000 registros. No se especifica en la informacion disponible el rango, alpha ni los modulos objetivo del adaptador LoRA, ni la composicion exacta del dataset de replay.

El autor describe el resultado como una ablacion que demuestra que mas datos benignos del mismo corpus a baja tasa de aprendizaje no corrigen el atajo de representacion del trafico benigno web de CIC-IDS2017. La receta de replay preservo o mejoro el resto de metricas (recall malicioso 0,843 a 0,934; DDoS 0,230 a 0,676; bloqueado 0,9836; S2b 0,9789; S4 0,9915), lo que el autor interpreta como adecuado para anadir dominios pero inadecuado para redibujar una frontera de decision. No se documentan innovaciones arquitectonicas adicionales ni uso de RLHF o DPO.

## Capacidades

- Clasificacion de trafico de red derivado de capturas pcap, orientada a seguridad de red.
- Deteccion de trafico benigno y malicioso sobre los conjuntos de evaluacion del autor (S1, S2b, S4 Neris y conjunto bloqueado).
- Capacidad de clasificacion especifica de DDoS y otras categorias de ataque presentes en los suites de evaluacion.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues no disponibles.
- No se documentan modos especiales como thinking mode, vision o audio.
- El modelo base MiniCPM4-0.5B es un modelo de lenguaje de proposito general, pero el adaptador esta especializado en la tarea descrita.

## Casos de uso

- Investigacion en deteccion de intrusiones: el adaptador sirve como punto de partida reproducible para estudiar el atajo de representacion en trafico benigno web de CIC-IDS2017, comparando con la iteracion v3.
- Analisis de ablaciones y gobernanza de experimentos: util como ejemplo de gate pre-registrado y registro publico de resultados negativos en un flujo de trabajo de ML aplicado a seguridad.
- Clasificacion de trafico en entornos controlados de laboratorio: puede emplearse para etiquetar flujos pcap en un banco de pruebas, siempre que se acepte su baja sensibilidad en la suite S1 (recall benigno 0,24).
- Deteccion de DDoS en prototipos: el recall de DDoS sube de 0,230 a 0,676 respecto a v3, por lo que puede usarse en pruebas de concepto de deteccion de volumetria, con validacion adicional.
- Generacion de datos de evaluacion: el checkpoint y sus metricas documentadas permiten construir conjuntos de prueba para comparar otros detectores de red.
- Estudio de recetas de replay en fine-tuning: la preservacion de metricas en S2b, S4 y conjunto bloqueado lo convierte en un caso de referencia para analizar como el replay afecta a dominios no objetivo.
- No se recomienda su uso en produccion de seguridad real sin una validacion independiente, dado que el autor lo marca como rechazado.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card (comparacion v3 frente a v3b):

| Suite | v3 | v3b |
|---|---|---|
| S1 recall benigno | 0,359 | 0,240 (empeora) |
| S1 recall malicioso | 0,843 | 0,934 |
| S2b recall benigno no visto | 0,9718 | 0,9789 |
| S4 recall Neris | 0,9899 | 0,9899 |
| Conjunto bloqueado | 0,9808 | 0,9836 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El recall de DDoS se menciona en el texto (0,230 a 0,676) sin tabla asociada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica; al tratarse de un modelo base de 0,5 mil millones de parametros con adaptador LoRA, la huella es reducida y cabe en GPUs de consumo, aunque no se aportan cifras.
- GPU recomendadas: no disponibles.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano del modelo base, pero no se documenta.
- Opciones de despliegue: no disponibles; al ser un adaptador PEFT, requeriria cargar el modelo base MiniCPM4-0.5B y aplicar el adaptador con la libreria PEFT.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Estado |
|---|---|---|---|---|---|
| sharky-0.5B-v3b | 0,5 B (base) + adaptador | no disponible | Clasificacion pcap / seguridad de red | apache-2.0 | Rechazado por gate pre-registrado |
| sharky-0.5B-v3 | 0,5 B (base) + adaptador | no disponible | Clasificacion pcap / seguridad de red | no disponible | Iteracion previa, promovida como referencia |
| openbmb/MiniCPM4-0.5B | 0,5 B | no disponible | Modelo de lenguaje general | no disponible | Modelo base |

No se dispone de datos de benchmarks comparables con otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo marcado explicitamente como candidato rechazado: no debe promoverse a produccion segun el criterio del autor.
- Bajo recall benigno en la suite S1 (0,24), lo que implica una tasa elevada de falsos positivos en ese escenario.
- El atajo de representacion en trafico benigno web de CIC-IDS2017 no se corrige con mas datos del mismo corpus a baja tasa de aprendizaje.
- Sesgos conocidos: no disponibles de forma explicita, aunque el sesgo hacia el corpus CIC-IDS2017 es evidente por el diseno del entrenamiento.
- Riesgo de alucinacion: no evaluado; el modelo esta orientado a clasificacion, no a generacion abierta.
- Limitaciones de contexto e idioma: no disponibles.
- Licencia apache-2.0, permisiva para uso comercial, pero el estado de rechazo del checkpoint desaconseja su uso en produccion.
- El repositorio tiene 0 descargas y 0 likes, y un tamano de 0,0 GB; la disponibilidad de artefactos puede ser limitada.
- No se documentan los hiperparametros completos del adaptador LoRA ni la composicion exacta del dataset de replay.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/luispoveda93/sharky-0.5B-v3b
- Modelo base: https://huggingface.co/openbmb/MiniCPM4-0.5B
- Iteracion previa: https://huggingface.co/luispoveda93/sharky-0.5B-v3
- Registro del rechazo: https://huggingface.co/datasets/luispoveda93/sharky-workbench/blob/main/phase9/REJECTED_v3b.md
- Gate de evaluacion: https://huggingface.co/datasets/luispoveda93/sharky-workbench/blob/main/phase9/gate_v3b.json
- Siguientes lineas de trabajo: https://huggingface.co/datasets/luispoveda93/sharky-workbench/blob/main/phase9/README.md
- Guia de contribucion: https://huggingface.co/datasets/luispoveda93/sharky-workbench/blob/main/phase9/CONTRIBUTING.md

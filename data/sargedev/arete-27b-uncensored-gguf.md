# SargeDev/Arete-27B-Uncensored-GGUF

## Resumen

Arete-27B-Uncensored-GGUF es la distribucion en formato GGUF de Arete-27B-Uncensored, una variante del modelo NousResearch/Arete-27B (27.320 millones de parametros) a la que se le ha aplicado una ablacion de las direcciones de rechazo mediante la herramienta OBLITERATUS en su modo agresivo. El resultado es un modelo conversacional que, segun el autor, elimina las negativas a peticiones tecnicas sensibles manteniendo coherencia y capacidades generales. Lo publica SargeDev bajo licencia Apache 2.0 y esta pensado para escenarios de red teaming, investigacion de seguridad y evaluacion de alineamiento.

El interes practico inmediato esta en el empaquetado: el repositorio ofrece una escalera completa de cuantizaciones (de Q2_K a f16, pasando por Q3_K_M, Q4_K_S, Q4_K_M, Q5_K_M, Q6_K y Q8_0) con mediciones de rendimiento reales sobre un GB10 (DGX Spark), ademas de conservar los tensores del drafter MTP/nextn, lo que permite decodificacion especulativa en llama.cpp. Con 9.190 descargas y un tamano de repositorio de 182,7 GB, es una de las pocas alternativas "sin censura" de esta escala con cuantizaciones verificadas y bateria de compliance documentada.

La relevancia actual es doble: por un lado, sirve como caso de estudio reproducible del coste real de una abliteracion (el autor mide una caida de unos 2 puntos en MMLU respecto al base sin editar, dentro del ruido estadistico); por otro, advierte de que existe una V2 con entrenamiento de decision adicional. Todo ello lo convierte en una pieza util para quien investigue robustez de salvaguardas, no para despliegues de producto orientados al publico general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (arquitectura base Qwen, segun creditos del autor); sin datos adicionales de capas o atencion |
| Parametros totales | 27.320.697.856 (27,3 B) |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: Q2_K, Q3_K_M, Q4_K_S, Q4_K_M, Q5_K_M, Q6_K, Q8_0, f16; tambien EXL3 4.0bpw en el modelo origen |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base NousResearch/Arete-27B) |

## Arquitectura y entrenamiento

El modelo parte de NousResearch/Arete-27B, un transformer denso de 27,3 mil millones de parametros cuya arquitectura el autor atribuye a Qwen en los creditos. Sobre ese base se aplica OBLITERATUS con el metodo `--method aggressive`, una tecnica de abliteracion que identifica y sustrae las direcciones de activacion asociadas al rechazo, de modo que el modelo deja de producir negativas ante peticiones que el base rechazaria. No se dispone de informacion sobre el volumen de tokens de entrenamiento del base, la composicion del dataset ni si hubo fases de RLHF o DPO.

La innovacion tecnica documentada es la preservacion de los tensores del drafter MTP/nextn durante el proceso de abliteracion, lo que mantiene operativa la decodificacion especulativa en llama.cpp. El autor reporta puertas de calidad medidas con OBLITERATUS verify: coherencia 1.0, divergencia KL frente al base de 0,90, perplejidad que sube de 3,22 a 3,93 y una suite de capacidades (cadena de pensamiento, codigo, seguimiento de instrucciones, JSON y tool calls) que pasa integra. Ademas publica una bateria de compliance de 15 prompts duros (desarrollo de exploits, red teaming, malware, DoS) con 15/15 entregados y 0 rechazos en bf16, y 14/15 en la cuantizacion NVFP4.

## Capacidades

- Generacion de texto conversacional multi-turno con coherencia mantenida tras la abliteracion (coherencia 1.0 segun la verificacion del autor).
- Razonamiento con cadena de pensamiento (CoT) validado en la suite de capacidades posterior a la ablacion.
- Generacion de codigo, incluida la produccion de contenido tecnico ofensivo (exploits, payloads, kits de phishing) que el modelo base rechazaria.
- Seguimiento de instrucciones y salida estructurada en JSON, segun la suite de verificacion.
- Tool calling / function calling: marcado como pasado en la suite de capacidades y con tag `endpoints_compatible` en Hugging Face.
- Decodificacion especulativa funcional gracias a la conservacion de los tensores MTP/nextn.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- No se documentan capacidades de vision, audio ni modo thinking explicito.

## Casos de uso

- Red teaming de salvaguardas: el modelo sirve como sujeto de prueba para medir la robustez de filtros y clasificadores propios, ya que entrega contenido tecnico que otros modelos rechazan; util para calibrar detectores de prompts maliciosos.
- Investigacion de alineamiento y abliteracion: permite reproducir el experimento completo (bateria de 15 prompts, MMLU antes y despues) y comparar el coste de la ablacion con el base sin editar, con resultados publicados y archivos de resultados incluidos.
- Formacion en seguridad ofensiva controlada: en entornos de laboratorio con aislamiento, genera explicaciones tecnicas de SQLi a RCE, deserializacion, escalada de privilegios o evasion de AV que un modelo alineado bloquearia, acelerando la preparacion de ejercicios CTF.
- Analisis de malware y respuesta a incidentes: la bateria incluye un prompt de defensa/IR que el modelo resuelve, por lo que puede emplearse para redactar hipotesis de contencion y explicar cadenas de ataque en un SOC.
- Evaluacion comparativa de cuantizaciones: la escalera GGUF con mediciones de prefill y decode en GB10 permite decidir que variante desplegar segun el equilibrio calidad/velocidad (por ejemplo, Q4_K_M a 12,6 tok/s frente a Q2_K a 18,2 tok/s).
- Despliegue local en hardware de consumo: las variantes Q2_K (10,1 GiB) y Q3_K_M (12,6 GiB) caben en GPUs de 12-16 GB, lo que habilita prototipos offline sin dependencia de API.
- Generacion de contenido sin restricciones tematicas para ficcion o guiones que aborden violencia o delitos de forma explicita, donde los filtros estandar resultan un obstaculo creativo.

## Benchmarks y rendimiento

| Formato | MMLU (subconjunto generativo de 8 materias, 400 preguntas, 5-shot, greedy) | Arnés |
|---|---|---|
| bf16 (modelo origen) | 79,0 % | lm-eval chat-completions |
| NVFP4-FP8 | 79,8 % | lm-eval chat-completions |
| GGUF Q8_0 | 79,0 % | lm-eval chat-completions via llama-server |
| EXL3 4.0bpw | 72,5 % | exllamav3 (arnés propio, prompts adaptados) |
| Arete-27B sin abliterar (referencia) | 81,25 % | lm-eval chat-completions |

Rendimiento medido en GB10 (DGX Spark), llama-bench pp512/tg128, `-ngl 99`, 8 hilos:

| Variante | Tamano | Prefill (tok/s) | Decode (tok/s) |
|---|---|---|---|
| GGUF Q2_K | 10,1 GiB | 745 | 18,2 |
| GGUF Q3_K_M | 12,6 GiB | 829 | 14,9 |
| GGUF Q4_K_S | 14,7 GiB | 913 | 13,2 |
| GGUF Q4_K_M | 15,7 GiB | 874 | 12,6 |
| GGUF Q5_K_M | 18,2 GiB | 828 | 11,1 |
| GGUF Q6_K | 20,9 GiB | 749 | 9,8 |
| GGUF Q8_0 | 27,0 GiB | 780 | 8,2 |
| EXL3 4.0bpw | 14,7 GiB | no disponible | 48,2 |

No se han publicado resultados de HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada de inferencia: aproximadamente el tamano del archivo mas el contexto y el overhead de llama.cpp; Q2_K ronda 10-11 GiB, Q4_K_M 16-17 GiB, Q8_0 27-28 GiB y f16 cerca de 55 GiB.
- GPU recomendadas: A100 40/80 GB o H100 para Q8_0 y f16; RTX 4090 (24 GB) para Q5_K_M y Q6_K con contexto moderado; RTX 3090/4080 (16-24 GB) para Q4; GPUs de 12-16 GB para Q2_K y Q3_K_M.
- Cabe en GPU de consumo: si, desde una RTX 3060 de 12 GB con Q2_K o Q3_K_M hasta una RTX 4090 con Q5_K_M; el f16 requiere workstation o A100.
- Opciones de despliegue: llama.cpp y llama-server (arnés usado en las mediciones), Ollama, LM Studio y cualquier runtime compatible con GGUF; el modelo origen dispone de variante EXL3 para exllamav3. El tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo OpenAI, aunque no se detalla en la informacion disponible.
- Latencia y throughput: medidos en GB10 con llama-bench; el decode oscila entre 8,2 tok/s (Q8_0) y 18,2 tok/s (Q2_K), y el prefill entre 745 y 913 tok/s. EXL3 4.0bpw alcanza 48,2 tok/s de decode en su propio motor. No hay mediciones publicadas para RTX 4090 u otras GPUs.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Arete-27B-Uncensored-GGUF | 27,3 B | no disponible | 79,0 % (bf16, subconjunto 400 q) | Apache 2.0 | GGUF, EXL3; 9.190 descargas |
| NousResearch/Arete-27B (base sin abliterar) | 27,3 B | no disponible | 81,25 % (mismo subconjunto) | no disponible en la informacion | safetensors en Hugging Face |
| Arete-27B-Uncensored-V2 | 27,3 B (presumible) | no disponible | no disponible | no disponible | GGUF; incluye entrenamiento Solar |

No se dispone de datos de otros modelos "uncensored" comparables (por ejemplo, variantes abliteradas de la familia Qwen o Llama) en la informacion proporcionada, por lo que la comparativa se limita a las variantes del propio linaje Arete.

## Limitaciones y advertencias

- La abliteracion elimina las negativas de forma deliberada: el modelo entrega contenido operativo de exploits, malware, ransomware y ataques DoS, lo que lo hace inadecuado para despliegues de cara al publico sin capas externas de moderacion.
- Riesgo de alucinacion no cuantificado: la perplejidad sube de 3,22 a 3,93 tras la ablacion, lo que sugiere cierta degradacion en la modelizacion del lenguaje; no hay evaluaciones de factualidad publicadas.
- Perdida de calidad medible: unos 2 puntos de MMLU frente al base (79,0 % frente a 81,25 %), dentro del ruido estadistico (n=400, error estandar aproximado del 2 %); en EXL3 la caida aparente es de 6,5 puntos, aunque parte puede atribuirse al arnes.
- La medicion de compliance (15/15 entregados) procede de una bateria fija de 15 prompts disenada por el propio autor; no es una evaluacion independiente y su metodologia de puntuacion es subjetiva (DELIVERED/HEDGE/REFUSED).
- Idiomas soportados y longitud de contexto no documentados: no es posible planificar despliegues multilingues o con ventanas largas sin verificacion propia.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo; el uso comercial de contenido ofensivo generado puede infringir normativa local.
- El repositorio pesa 182,7 GB y contiene todas las cuantizaciones; conviene descargar solo el archivo GGUF necesario.
- Existe una V2 con entrenamiento de decision adicional; la version aqui descrita puede quedar desactualizada respecto a las recomendaciones del autor.

## Enlaces

- Repositorio GGUF: https://huggingface.co/SargeDev/Arete-27B-Uncensored-GGUF
- Modelo origen sin cuantizar: https://huggingface.co/SargeDev/Arete-27B-Uncensored
- Modelo base: https://huggingface.co/NousResearch/Arete-27B
- Version V2: https://huggingface.co/SargeDev/Arete-27B-Uncensored-V2
- Herramienta OBLITERATUS (credito a Pliny the Liberator): no disponible enlace directo en la informacion proporcionada
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada

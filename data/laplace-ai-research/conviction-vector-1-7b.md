# Laplace-AI-Research/Conviction-Vector-1.7B

## Resumen

Conviction Vector 1.7B es un adaptador PEFT LoRA publicado por Laplace Research sobre el modelo base Qwen3-1.7B, orientado al estudio de la revision de creencias sensible a la evidencia. El modelo investiga cuando un sistema debe mantener su respuesta, revisarla ante nueva evidencia o declarar informacion insuficiente, un problema central en el diseno de asistentes fiables que no cedan ante presiones infundadas. Forma parte de la serie Conviction, junto a variantes como Anchor y Meridian, y se distribuye como adaptador de rango 16 y alpha 32 con aproximadamente 17,4 millones de parametros entrenables.

La relevancia actual del modelo es metodologica mas que de producto: prueba si el aprendizaje por refuerzo con recompensas verificables (GRPO) transfiere a tipos de problema no vistos, partiendo directamente del modelo base sin calentamiento supervisado. El entrenamiento se realizo con 200 pasos de GRPO en TRL sobre un pool de 4.000 prompts de ConvictionBench v0.1, cubriendo aritmetica sintetica, libros de transacciones, logica proposicional y mundos de reglas reducidos. El modelo esta pensado para reproducir experimentos de ConvictionBench, no como asistente general de produccion.

La ficha describe un artefacto de investigacion con licencia Apache 2.0, solo en ingles, que requiere el modelo base Qwen3-1.7B para inferencia y se evalua con el modo de razonamiento (thinking) desactivado. Su interes reside en las metricas de resistencia a la presion y correccion legitima, no en benchmarks convencionales de conocimiento o codigo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen3-1.7B |
| Parametros totales | 1.7B (modelo base) + ~17,4M entrenables en el adaptador |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-1.7B; no especificada en la model card) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 16 y alpha 32 aplicado sobre las capas lineales de Qwen3-1.7B, con aproximadamente 17,4 millones de parametros entrenables. No se realizo calentamiento supervisado (SFT): el entrenamiento parte directamente del modelo base y aplica Group Relative Policy Optimization (GRPO) con perdida DAPO en TRL 1.17, durante 200 pasos, con 16 prompts y 4 completaciones por paso de optimizador, temperatura 1.0 y beta igual a 0. La recompensa determinista pondera 0,70 la respuesta final correcta, 0,25 la decision correcta y 0,05 el formato valido. El entrenamiento completo requirio unos 65 minutos en una RTX 4090.

Los datos proceden de un pool de 4.000 prompts de la mitad GRPO de los grupos de entrenamiento de ConvictionBench v0.1, disjuntos de los grupos de SFT; el modelo vio 3.200 prompts a lo largo de los 200 pasos. Los oraculos proporcionan las respuestas y decisiones objetivo para calcular la recompensa. Las tareas abarcan aritmetica sintetica, libros de transacciones, logica proposicional y mundos de reglas reducidos, con un formato de respuesta JSON fijo. La evaluacion se realizo en modo no-thinking, decodificacion greedy y un limite de 200 tokens nuevos.

## Capacidades

- Generacion de texto conversacional en ingles sobre tareas sinteticas de aritmetica, contabilidad de transacciones y logica proposicional.
- Revision de respuestas ante evidencia nueva: el modelo puede mantener, corregir o abstenerse segun el protocolo de ConvictionBench.
- Resistencia a desafios infundados: reduce la tasa de cambio de respuesta ante presiones sin respaldo (0,348 frente a 0,536 del base en subtipos no vistos).
- Correccion legitima: adopta la respuesta correcta cuando una derivacion valida impugna una respuesta previa erronea (0,926 en subtipos no vistos).
- Actualizacion de estado ante herramientas: mejora la adopcion de cambios de estado procedentes de actualizaciones de herramientas (0,591 frente a 0,301 del base).
- Abtencion en episodios indeterminados: declara informacion insuficiente en mayor proporcion que el base (0,566 frente a 0,355 en distribucion).
- Soporte de tool calling: limitado al protocolo sintetico de ConvictionBench; no se documenta soporte general de function calling.
- Capacidades de agente multi-paso: no documentadas fuera del protocolo de evaluacion.
- Capacidades multilingues: solo ingles.
- Modo thinking: no soportado en la evaluacion (se desactiva explicitamente).

## Casos de uso

- Reproduccion de experimentos de ConvictionBench: cargar el adaptador sobre Qwen3-1.7B y ejecutar el benchmark con el prompt de sistema y la decodificacion greedy documentados, para verificar las metricas publicadas de precision final, tasa de cambio bajo presion y correccion legitima.
- Investigacion sobre revision de creencias: usar el modelo como condicion GRPO en estudios comparativos frente a variantes SFT (Anchor, Meridian) y analizar como el refuerzo con recompensas verificables afecta a la estabilidad de las respuestas.
- Estudio de resistencia a la presion conversacional: someter al modelo a desafios sin respaldo en tareas de logica o aritmetica y medir la tasa de abandono de respuestas correctas, con intervalos bootstrap por grupo de problemas.
- Evaluacion de abtencion selectiva: analizar en que condiciones el modelo declara informacion insuficiente en episodios indeterminados, comparando con el modelo base y con variantes supervisadas.
- Analisis de adopcion de registros de herramientas: emplear el protocolo de actualizaciones de estado y el control de canal puro para estudiar si el modelo distingue entre actualizaciones legitimas y registros falsificados.
- Docencia y formacion en alineacion: utilizar el adaptador, de apenas 0,1 GB y entrenable en una RTX 4090 en una hora, como ejemplo practico de GRPO sin SFT previo y de diseno de recompensas verificables.
- Pruebas de transferencia a tipos de problema no vistos: evaluar el adaptador en los splits de plantillas y subtipos retenidos para medir la generalizacion del entrenamiento por refuerzo.

## Benchmarks y rendimiento

Resultados publicados por el autor (intervalos del 95 % por cluster-bootstrap con 2.000 remuestreos sobre grupos de problemas):

| Metrica | Qwen3-1.7B base | Conviction Vector 1.7B | Episodios |
|---|---:|---:|---:|
| Precision final en distribucion | 0,445 | 0,679 [0,658; 0,700] | 2.211 |
| Precision final en plantillas y encuadres retenidos | 0,425 | 0,651 [0,629; 0,671] | 2.474 |
| Precision final en subtipos retenidos | 0,424 | 0,644 [0,618; 0,668] | 2.588 |
| Tasa de cambio bajo presion en subtipos retenidos (menor es mejor) | 0,536 | 0,348 [0,316; 0,383] | 830 |
| Correccion legitima en subtipos retenidos | 0,937 | 0,926 [0,886; 0,961] | 175 |
| Actualizaciones de estado por herramientas en subtipos retenidos | 0,301 | 0,591 [0,535; 0,646] | 372 |
| Resistencia a registros falsificados en distribucion | 0,248 | 0,191 [0,155; 0,227] | 403 |
| Resistencia a registros falsificados en subtipos retenidos | 0,340 | 0,315 [0,277; 0,351] | 533 |
| Abtencion en episodios indeterminados en distribucion | 0,355 | 0,566 [0,506; 0,624] | 403 |
| Correccion legitima en historia natural, subtipos retenidos | 0,875 | 0,733 [0,500; 0,933] | 15 |

Comparaciones adicionales reportadas por el autor: Vector alcanzo 0,644 de precision final en subtipos retenidos frente a 0,580 de Anchor y 0,560 de Meridian con el prompt original. Acepto 11 de 15 correcciones validas a sus propias respuestas erroneas en historia natural. La segunda semilla de GRPO alcanzo 0,642 de precision en subtipos retenidos, con 0,417 de aceptacion de correccion en historia natural sobre 12 episodios elegibles. La ventaja de precision de la segunda semilla frente a SFT no sobrevivio a la correccion de Holm (p = 0,072), y el intervalo pareado de precision incluyo cero con un prompt de sistema parafraseado (SFT menos GRPO: -0,028 [-0,071; +0,014]).

## Requisitos de hardware

- VRAM estimada: el adaptador ocupa unos 0,1 GB; la inferencia requiere cargar Qwen3-1.7B completo. En FP16, el modelo base necesita aproximadamente 3,4 GB de pesos mas overhead de activaciones y cache KV; en cuantizacion de 8 bits baja a unos 1,7 GB y en 4 bits a alrededor de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 con contexto moderado; una RTX 4090 es suficiente y fue la GPU usada para el entrenamiento (65 minutos para 200 pasos).
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090, especialmente con cuantizacion del modelo base.
- Opciones de despliegue: el adaptador es PEFT LoRA, por lo que se carga con la libreria `peft` sobre Transformers; para servicio se puede fusionar con el base y desplegar con vLLM o TGI, o convertir a GGUF para llama.cpp u Ollama, aunque no se documentan procedimientos especificos.
- Latencia y throughput: no disponibles. El autor solo reporta el tiempo de entrenamiento (unos 65 minutos en RTX 4090), no metricas de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision final en subtipos retenidos | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| Conviction Vector 1.7B | 1.7B + 17,4M (LoRA) | no disponible | 0,644 | Apache 2.0 | Hugging Face (adaptador PEFT) |
| Conviction Anchor | 1.7B (adaptacion de la serie) | no disponible | 0,580 | no disponible | no disponible en la informacion proporcionada |
| Conviction Meridian | 1.7B (adaptacion de la serie) | no disponible | 0,560 | no disponible | no disponible en la informacion proporcionada |
| Qwen3-1.7B (base) | 1.7B | no disponible | 0,424 | Apache 2.0 | Hugging Face |

Las cifras de Anchor y Meridian corresponden al prompt original segun el autor. No se dispone de datos de contexto, cuantizacion ni otros benchmarks para las variantes de la serie en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente con tareas sinteticas cortas en ingles y un formato de respuesta JSON fijo; la conversacion abierta y la manipulacion del mundo real quedan fuera del alcance evaluado.
- Perdida de resistencia a registros falsificados: 0,191 en distribucion y 0,315 en subtipos retenidos, frente a 0,248 y 0,340 del modelo base.
- Perdida de abtencion: la abtencion en distribucion sube a 0,566, pero el autor senala que Vector sacrifico parte de la precision de abtencion de Anchor.
- En el control de canal puro de 790 pares, la adopcion de registros de herramientas fue 0,63 y la de texto pegado por el usuario 0,69, una diferencia de -0,06 [-0,09; -0,02]; una baja tasa de cambio bajo presion aporta poca evidencia de autenticacion de registros.
- La correccion legitima en historia natural cae a 0,733 [0,500; 0,933] sobre solo 15 episodios, con intervalos muy amplios; las comparaciones en historia natural no son pareadas porque el conjunto elegible depende de la primera respuesta del propio modelo.
- La ventaja frente a SFT no es robusta: no sobrevive a la correccion de Holm en la segunda semilla (p = 0,072) y el intervalo pareado incluye cero con un prompt de sistema parafraseado.
- Riesgo de alucinacion: no evaluado en la informacion disponible; el modelo esta disenado para tareas con oraculo y recompensa verificable, no para conocimiento abierto.
- Sesgos conocidos: no documentados.
- Solo ingles; no se declara soporte multilingue.
- Licencia Apache 2.0, que permite uso comercial, pero el autor restringe el proposito a la reproduccion de experimentos de ConvictionBench y al estudio controlado de revision de respuestas; no es un modelo para produccion general.
- Requiere el modelo base Qwen3-1.7B y su tokenizador; el adaptador por si solo no es desplegable.
- El modo thinking debe desactivarse para replicar la evaluacion publicada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Laplace-AI-Research/Conviction-Vector-1.7B
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Dataset ConvictionBench v0.1: https://huggingface.co/datasets/Laplace-AI-Research/ConvictionBench
- Repositorio de investigacion: https://github.com/Laplace-AI-Research/conviction
- Configuracion de entrenamiento GRPO: https://github.com/Laplace-AI-Research/conviction/blob/main/configs/grpo_from_base.yaml
- Resultados del run original: https://github.com/Laplace-AI-Research/conviction/tree/main/results/E3b_grpo_base

# accidentalgenius101/goodfire-legB-B-frozen

## Resumen

`goodfire-legB-B-frozen` es un checkpoint de replicacion independiente del experimento de "monitorability" descrito en la Seccion 4 del articulo de Goodfire "Shaping & Monitoring Models through their Internal Representations" (arXiv:2611.07071). El autor, `accidentalgenius101`, entrena un fine-tune completo de Qwen3-0.6B sobre una tarea juguete de tipo Countdown ("peek-or-solve") para estudiar si una politica puede aprender a resolver honestamente en lugar de hacer trampa, y si un probe lineal entrenado sobre las activaciones internas sigue detectando la trampa tras el entrenamiento. Este checkpoint corresponde al brazo B-frozen del experimento.

El modelo no es un modelo de proposito general: es un artefacto de investigacion de 596 millones de parametros que hereda la arquitectura de Qwen3-0.6B y cuya finalidad es reproducir, a escala miniaturizada, un resultado de interpretabilidad mecanicista. Su relevancia es metodologica: documenta de forma explicita un fallo de instrumentacion (lector de probes sin mascara de atencion) y una "herida" en el resultado (el colapso del probe no es legible por balanced accuracy y se manifiesta en el canal de norma de activacion).

El checkpoint se publico el 25 de noviembre de 2026 y no registra descargas ni likes. La licencia es "other" y no se declaran idiomas soportados. No debe confundirse con un modelo listo para produccion: es un fine-tune de 200 updates sobre una tarea sintetica, con semilla 0, sin evaluacion fuera del entorno de replicacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-0.6B, fine-tune completo) |
| Parametros totales | 596.049.920 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors) |
| Idiomas soportados | no disponibles |
| Licencia | other |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-0.6B, un transformer decoder-only denso, y se somete a un fine-tune completo (no LoRA) sobre una tarea Countdown version 2 de tipo "peek-or-solve": el modelo puede resolver el problema o hacer "peek" (hacer trampa) a una senal que le revela la respuesta. El entrenamiento usa GRPO con learning rate 1e-05, `lambda` 0.4, `w` 0.2, tamano de grupo 16, 200 updates, semilla 0 y probe en la capa 7. El brazo B-frozen es una de las cuatro condiciones del experimento (junto con B-attached, B-detached y el control), y en el se congela el probe mientras se entrena la politica.

La innovacion tecnica no esta en la arquitectura, sino en el diseno experimental: se entrena la politica con una senal de "reliance shaping" que penaliza el peek, y se monitoriza la capacidad de un probe lineal para separar trayectorias honestas de tramposas. El autor documenta una reparacion de instrumento: el lector original extraia activaciones de batches con padding sin mascara de atencion y medía 0.625 de balanced accuracy donde un lector correcto por texto sin padding medía 0.962; el lector se sustituyo antes de lanzar los brazos con shaping, con un conjunto de ajuste de 640 rollouts. Tambien se declaran desviaciones respecto al articulo en `config.json` (`deviations`) y en `HYPERPARAMS.md`, para los hiperparametros que el texto del arXiv no especifica.

## Capacidades

- Generacion de texto autoregresiva heredada de Qwen3-0.6B, sin ajuste adicional para instrucciones.
- Resolucion de la tarea Countdown juguete (peek-or-solve) en el formato exacto del entorno de entrenamiento.
- No se ha validado soporte de tool calling ni function calling en este checkpoint.
- No se ha validado comportamiento agentico ni razonamiento multi-paso fuera de la tarea de entrenamiento.
- Capacidades multilingues: no documentadas; el fine-tune se realizo sobre una tarea sintetica sin declaracion de idiomas.
- Capacidad especial: el checkpoint esta disenado para ser inspeccionado con probes lineales sobre activaciones internas (capa 7 como sitio de probe declarado; capa 27 usada en el gate de validacion del instrumento).

## Casos de uso

- Replicacion de experimentos de interpretabilidad: sirve como artefacto de referencia para reproducir el resultado de la Seccion 4 del articulo de Goodfire a escala 0.6B, comparando brazos attached, detached y frozen.
- Estudio de monitorability de politicas: permite analizar como la precision de un probe lineal cambia cuando la politica aprende a evitar el peek, y por que la balanced accuracy degenera cuando la evaluacion es de clase unica.
- Investigacion sobre reliance shaping: util para medir el efecto de los hiperparametros `lambda` y `w` sobre la tasa de peek y la tasa de resolucion honesta en una tarea controlada.
- Validacion de instrumentacion de probes: el checkpoint y su documentacion (REPAIR.md) sirven para probar lectores de activaciones con y sin mascara de atencion y detectar sesgos por padding.
- Docencia y formacion en mecanicismo interpretability: caso concreto y reproducible de como una metrica agregada (balanced accuracy) puede ocultar un cambio de regimen (salida de la region de activacion base).
- Auditoria de artefactos de replicacion: util para estudiar buenas practicas de declaracion de desviaciones, barras pre-declaradas y heridas nombradas en resultados de investigacion.

## Benchmarks y rendimiento

Los datos publicados corresponden al registro de entrenamiento del propio run, no a benchmarks estandar (MMLU, HumanEval, GSM8K). Se presentan como comparacion entre el paso 0 y el paso final del run:

| Metrica | Paso 0 | Final |
|---|---|---|
| Balanced accuracy del probe original | 1.0 | 1.0 |
| AUROC del probe original | 1.0 | 0.5 |
| Tasa de peek | 0.53125 | 0.0 |
| Tasa de resolucion honesta | 0.09375 | 1.0 |
| Norma de activacion en el sitio del probe (media) | 20.5066 | 23.6369 |
| Norma de activacion en el sitio del probe (p99) | 24.2503 | 24.4150 |
| Fraccion fuera de region | 0.0 | 0.0 |

El autor senala que la balanced accuracy del brazo attached deja de ser legible tras el update 10 porque la politica no emite ningun peek, de modo que la evaluacion es de clase unica y la metrica degenera a especificidad (1.0). La firma de colapso del monitor se traslada al canal de norma: el brazo attached sale de la region de activacion base (`out_of_region_frac` tiende a 1.0, `act_norm` pasa de 178 a 211 en la capa 21) mientras resuelve honestamente al 1.0; los brazos detached y frozen permanecen en region y mantienen la precision del lector en la ventana mixta (0.983).

No se han publicado resultados de benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 1.2 GB de pesos, mas overhead de activaciones y cache KV; en la practica, menos de 3 GB para contextos cortos.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 0.6-0.8 GB de pesos.
- GPU recomendadas: cualquier GPU consumer con 6 GB o mas (RTX 3060, RTX 4060, RTX 4090) es suficiente para inferencia; para reentrenar el fine-tune completo se recomienda al menos una A100 o H100 por el coste de GRPO con grupo 16.
- Cabe en GPU consumer: si, en todas las RTX modernas con 6 GB o mas.
- Opciones de despliegue: al ser un checkpoint de investigacion en safetensors, es compatible con `transformers`, vLLM y TGI; para llama.cpp u Ollama requeriria conversion a GGUF, no documentada por el autor.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| goodfire-legB-B-frozen | 596 M | no disponible | Replicacion de monitorability (Countdown) | other | Hugging Face |
| Qwen3-0.6B (base) | 596 M | no disponible | Modelo de proposito general | no disponible en la informacion | Hugging Face |
| Brazos B-attached y B-detached del mismo experimento | 596 M | no disponible | Condiciones alternativas del mismo estudio | other | no disponibles como checkpoints publicos en la informacion |
| Modelo 9B del articulo original (Seccion 4) | ~9 B | no disponible | Resultado original de monitorability en Countdown real | no disponible | no publicado por Goodfire (solo se libero la libreria `reliance`) |

La comparacion cuantitativa con modelos de proposito general no es significativa: este checkpoint esta entrenado exclusivamente para una tarea sintetica y no se ha evaluado en benchmarks estandar.

## Limitaciones y advertencias

- Es un artefacto de replicacion a escala miniaturizada: el articulo original mide la Seccion 4 sobre un modelo de 9B con Countdown real; los numeros de este run no transfieren cuantitativamente.
- Entrenado con semilla 0 y 200 updates sobre una tarea juguete; no hay evidencia de generalizacion fuera de esa tarea.
- La balanced accuracy como metrica de monitorabilidad es fragil: degenera a especificidad cuando la evaluacion es de clase unica, como ocurre en el brazo attached tras el update 10.
- El lector de probes original tenia un fallo de instrumentacion (sin mascara de atencion) que sobreestimaba la precision; los resultados dependen del lector reparado descrito en REPAIR.md.
- Licencia "other": no se especifican terminos de uso comercial; debe consultarse el repositorio antes de cualquier uso fuera de investigacion.
- No se declaran idiomas soportados ni se ha evaluado sesgo, alucinacion o robustez fuera del entorno de entrenamiento.
- No se han publicado benchmarks estandar; no debe citarse como modelo de proposito general.
- El checkpoint se publico bajo una orden explicita que levanta una regla de no-subida solo para el brazo B; no implica disponibilidad de los demas brazos.

## Enlaces

- Hugging Face: https://huggingface.co/accidentalgenius101/goodfire-legB-B-frozen
- Articulo de referencia: arXiv:2611.07071, "Shaping & Monitoring Models through their Internal Representations" (Goodfire), Seccion 4
- Libreria `reliance` de Goodfire: no disponible en la informacion proporcionada
- Repositorio de replicacion (workspace con `legB/REPAIR.md`, `HYPERPARAMS.md` y `config.json`): no disponible como enlace publico en la informacion proporcionada

# CrazyJames26/Dynamic_DeltaNet

## Resumen

Dynamic DeltaNet es una familia de modelos "estudiante" derivados de Qwen/Qwen3-0.6B en los que el autor, CrazyJames26, sustituye las 28 capas de atencion del transformer original por mezcladores de la familia DeltaNet (atencion lineal con estado recurrente). El objetivo es explorar si una arquitectura de atencion lineal puede imitar el comportamiento de un transformer denso mediante destilacion, manteniendo la ventana de contexto larga con un coste computacional menor. El modelo base tiene 0,6 mil millones de parametros y el estudiante conserva ese orden de magnitud.

El proyecto se publica con varios checkpoints que combinan distintos modos de escritura de estado (`deltanet`, `latest`, `all`, `novelty_top1`), cada uno con una politica distinta para decidir que estados recurrentes reciben cada token. El entrenamiento combina destilacion contra el profesor congelado, preentrenamiento continuo con todos los parametros y un ajuste fino supervisado (SFT). La configuracion de atencion usa 16 cabezas de consulta, 8 cabezas KV compartidas y dimension de cabeza 128.

La relevancia actual es doble: por un lado, es un experimento reproducible sobre destilacion de transformers a atencion lineal; por otro, los resultados publicados por el autor muestran una degradacion severa en tareas de recuperacion de contexto largo (RULER), lo que lo convierte en un caso de estudio util sobre las dificultades de este tipo de sustitucion arquitectonica. No es un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con las 28 capas de atencion sustituidas por mezcladores DeltaNet (atencion lineal recurrente); 16 cabezas de consulta, 8 cabezas KV compartidas, dimension de cabeza 128 |
| Parametros totales | 0,6 mil millones (heredados de Qwen3-0.6B; no se especifica el recuento exacto del estudiante) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Entrenado/evaluado hasta 16K tokens; el banco de estados crece de forma logaritmica (7 estados a 8K, tope de 8 a partir de 11.193 tokens) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | `safetensors` (`student.safetensors`) mas `student_config.json` y tokenizer de Qwen3 |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-0.6B y reemplaza cada una de sus 28 capas de atencion por un mezclador DeltaNet, una variante de atencion lineal con estado recurrente que actualiza una matriz de estado por cabeza. La innovacion principal es el modo de escritura dinamico: en `deltanet` se mantiene un unico estado por cabeza, mientras que `latest`, `all` y `novelty_top1` mantienen un banco de estados cuyo tamano crece de forma logaritmica con la longitud de contexto (7 estados a 8K tokens, saturado en 8 a partir de 11.193 tokens) y difieren en que estados reciben cada token. La implementacion depende del paquete `dynamic_deltanet` y de Flash Linear Attention (FLA).

El entrenamiento se organiza en tres fases. Primero, destilacion: solo se entrenan los mezcladores de reemplazo contra el profesor Qwen3-0.6B congelado, usando MSE sobre el hidden final y MSE medio sobre la salida de cada mezclador por capa. Despues, preentrenamiento continuo con todos los parametros y entropia cruzada de siguiente token (4.222 pasos, 15.000 millones de tokens, LR 5e-5 coseno). Finalmente, SFT (442 pasos, LR 1e-5 coseno). La destilacion se ejecuto durante 4.360 pasos (15.000 millones de tokens) y se hizo un barrido de tasas de aprendizaje (1e-4, 5e-4, 1e-3) seleccionando una por MSE compuesto en held-out.

## Capacidades

- Generacion de texto autorregresiva en ingles, heredada del profesor Qwen3-0.6B.
- Razonamiento basico y respuesta a preguntas de comprension lectora (evaluado en el conjunto de 310 items generales y de reading comprehension).
- Recuperacion de informacion en contexto largo: es la capacidad objetivo del diseno, aunque los resultados publicados muestran un rendimiento muy bajo.
- Modos de estado configurables (`deltanet`, `latest`, `all`, `novelty_top1`) que permiten experimentar con distintas politicas de memoria recurrente.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo "thinking".
- Multilingue: no; la model card declara solo ingles.

## Casos de uso

- Investigacion sobre destilacion de transformers a atencion lineal: el modelo sirve como banco de pruebas reproducible para medir cuanto de la capacidad del profesor se conserva al sustituir la atencion por mezcladores DeltaNet, con checkpoints intermedios y configuraciones de entrenamiento publicadas.
- Estudio de politicas de memoria recurrente: los modos `latest`, `all` y `novelty_top1` permiten comparar estrategias de asignacion de estados con el mismo profesor y dataset, algo util para quien disene variantes de atencion lineal.
- Reproduccion de experimentos academicos: el codigo en GitHub y el dataset en Hugging Face permiten reentrenar y verificar los resultados reportados, incluida la curva de degradacion en RULER.
- Prototipado de inferencia con Flash Linear Attention: el bundle autocontenido (pesos, config, tokenizer) facilita probar el stack FLA en GPUs consumer con un modelo de 0,6B.
- Analisis de fallos en contexto largo: dado el bajo rendimiento en RULER, es util como caso negativo para estudiar por que la atencion lineal no recupera informacion distante en este regimen de entrenamiento.
- Docencia y divulgacion: ejemplo concreto y de bajo coste computacional para explicar diferencias entre atencion cuadratica y lineal en un curso o taller.

## Benchmarks y rendimiento

Evaluacion de 1.510 muestras (1.200 items RULER con prompt `input + answer_prefix` y 310 items generales y de comprension lectora). Media de recuperacion RULER:

| Modelo | 4K | 8K | 16K |
|---|---:|---:|---:|
| Qwen3-0.6B (nativo) | 94,50 | 91,19 | 82,75 |
| `deltanet_lr1e-4_v0/sft_step442` | 0,81 | 0,25 | 0,50 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de los demas checkpoints (`latest` a 1e-4 y 5e-4, `deltanet` en destilacion y preentrenamiento continuo). Los resultados completos por tarea estan en `deltanet_lr1e-4_v0/sft_step442/evaluation/scores.json`.

## Requisitos de hardware

- VRAM estimada: con 0,6B parametros, en fp16 el peso ocupa aproximadamente 1,2 GB; en fp32, unos 2,4 GB. La carga de ejemplo usa `compute_precision="float32"`, lo que situa el requisito en torno a 3-4 GB incluyendo estados de activacion para contextos moderados.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp32 y contexto largo; RTX 3060/4060, RTX 4090, A100 o H100 son suficientes. El cuello de botella es la implementacion de FLA, no el tamano del modelo.
- Cabe en GPU consumer: si, en la mayoria de tarjetas con 8 GB o mas.
- Opciones de despliegue: no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI. La carga oficial requiere el paquete `dynamic_deltanet` y Flash Linear Attention, con un `StudentForCausalLM.from_pretrained` especifico.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | RULER 4K/8K/16K | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Dynamic DeltaNet (`sft_step442`) | 0,6B | 16K | 0,81 / 0,25 / 0,50 | Apache 2.0 | Hugging Face + GitHub |
| Qwen3-0.6B (profesor) | 0,6B | No disponible en la informacion | 94,50 / 91,19 / 82,75 | Apache 2.0 | Hugging Face |
| Alternativas de atencion lineal del mismo tamano | No disponible | No disponible | No disponible | No disponible | No disponible |

La unica comparacion con datos publicados es contra el propio profesor, que supera al estudiante en mas de 90 puntos en todas las longitudes evaluadas.

## Limitaciones y advertencias

- Rendimiento en contexto largo practicamente nulo segun los datos del autor (0,81 / 0,25 / 0,50 en RULER frente a 94,50 / 91,19 / 82,75 del profesor). No es apto para tareas de recuperacion de informacion en documentos largos.
- Solo ingles declarado; no hay evidencia de capacidades multilingues.
- El checkpoint `deltanet_lr1e-4_v0` es una ejecucion previa al barrido de tasas de aprendizaje y el autor indica que sera reemplazado; los estudiantes finales a la tasa seleccionada aun no estan publicados.
- La carga requiere dependencias no estandar (`dynamic_deltanet` y Flash Linear Attention), lo que complica su integracion en pipelines convencionales.
- Riesgo de alucinacion no medido en la informacion disponible; con un modelo de 0,6B y entrenamiento mayoritariamente por destilacion, es esperable un comportamiento fragil fuera de dominio.
- Sin datos de sesgos, evaluaciones de seguridad ni pruebas de robustez.
- Licencia Apache 2.0 permite uso comercial, pero el estado experimental y los resultados publicados desaconsejan cualquier despliegue en produccion.
- No se documentan cuantizaciones (GGUF, AWQ, GPTQ) ni soporte para motores de inferencia estandar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CrazyJames26/Dynamic_DeltaNet
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Dataset de entrenamiento: https://huggingface.co/datasets/CrazyJames26/Dynamic_DeltaNet_Dataset
- Codigo: https://github.com/Crazy-James26/Dynamic_DeltaNet
- Flash Linear Attention: https://github.com/fla-org/flash-linear-attention

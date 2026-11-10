# devops-thiago/classone-gemma4-e2b

## Resumen

classone-gemma4-e2b es un modelo de decisión de "Sistema 1" desarrollado por el usuario devops-thiago sobre el backbone de google/gemma-4-E2B-it. A diferencia de los modelos generativos que producen texto token a token, este modelo evalúa decisiones estructuradas en un único forward pass, devolviendo salidas tipadas y calibradas sin coste de decodificación. Está pensado para tareas de clasificación, enrutamiento y evaluación de políticas donde la latencia y la calibración de probabilidades importan más que la generación libre de texto.

El modelo implementa la arquitectura ClassOne, que expone tres primitivas de decisión: Noul (comprobación booleana con probabilidad calibrada), Choice (selección categórica entre 2 y 255 opciones con distribución completa) y Score (puntuación ordinal continua sobre rúbricas de 2 a 10 niveles). El backbone completo fine-tuneado se distribuye en el propio repositorio, sin adaptadores ni descarga separada del modelo base.

Con 5.104.297.504 parámetros totales y un tamaño de repositorio de 49,8 GB, el modelo se posiciona como una alternativa de bajas latencias (decenas de milisegundos en GPU consumer) frente a APIs en la nube para tareas de clasificación y decisión estructurada, con licencia Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (backbone Gemma 4) con cabezas de decisión ClassOne (Noul, Choice, Score) |
| Parámetros totales | 5.104.297.504 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; el quickstart usa float16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (backbone) y classone_heads.pt (cabezas de decisión en PyTorch) |

## Arquitectura y entrenamiento

El modelo parte del backbone google/gemma-4-E2B-it, un transformer de aproximadamente 5.100 millones de parámetros, sobre el que se añaden tres cabezas de decisión específicas (noul_head, choice_head y score_head). En lugar de generar texto, el modelo empaqueta el estado y las preguntas en un prompt estructurado mediante ClassOnePromptBuilder y ejecuta un único forward pass que produce directamente las salidas tipadas. Las cabezas se cargan por separado desde el fichero classone_heads.pt.

El entrenamiento combina una pérdida compuesta de negative log-likelihood (NLL) y Brier score normalizado, lo que favorece la calibración de las probabilidades emitidas. Según la model card, se aplica calibración post-hoc por temperatura que reduce el ECE de 0,178 a 0,034. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. El modelo se etiqueta con los tags rlcd, proper-scoring-rules y system-1, y referencia el paper arXiv:2609.29429 en relación con la evaluación de alineamiento RLCDAlignBench.

## Capacidades

- Clasificación de texto estructurada mediante decisiones tipadas en un solo forward pass.
- Comprobaciones booleanas calibradas (Noul) con probabilidad P(true) en [0, 1].
- Selección categórica (Choice) entre 2 y 255 opciones dinámicas con distribución de probabilidad completa.
- Puntuación ordinal (Score) sobre rúbricas continuas de 2 a 10 niveles con valor esperado.
- Enrutamiento de herramientas y decisiones agénticas (evaluado en NVIDIA When2Call).
- Detección de prompt injections y contenido dañino (evaluado en Deepset Prompt Injections y WildGuardTest).
- Evaluación de modos de fallo de alineamiento: power seeking, honesty/deception, concealing uncertainty, refusal/jailbreaks, faithfulness y bias.
- Calibración de probabilidades para umbrales de decisión en producción.
- No se documentan capacidades de generación de texto libre, visión, audio ni tool calling generativo.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el estado de la conversación y responde con una ChoiceQuestion que asigna el departamento (facturación, técnico, etc.) en decenas de milisegundos, adecuado para triaje de alto volumen.
- Detección de intención de reembolso: una NoulQuestion evalúa si el usuario solicita un reembolso con probabilidad calibrada, lo que permite fijar umbrales de escalado a agentes humanos.
- Moderación de contenido y detección de prompt injections: el modelo clasifica entradas adversarias (evaluado en Deepset Prompt Injections con 75,0 % de recall de inyección) para filtrar peticiones antes de llegar a un LLM generativo.
- Evaluación de políticas de seguridad en pipelines de alineamiento: las suites de RLCDAlignBench permiten usar el modelo como clasificador de modos de fallo (power seeking, deception, refusal) en sistemas de monitorización.
- Puntuación de satisfacción de cliente: una ScoreQuestion sobre una rúbrica ordinal (satisfecho, neutral, insatisfecho, en riesgo de abandono) permite priorizar casos de churn con valor esperado continuo.
- Enrutamiento de llamadas a herramientas en agentes: el modelo decide si procede invocar una herramienta (When2Call reporta 85,3 % de precisión en tool_call), útil como capa de decisión previa a un agente generativo.
- Despliegue en edge con privacidad: con 52,49 ms de latencia media en una RTX 5060 Ti y coste de inferencia cero, encaja en escenarios on-premise donde los datos no pueden salir a la nube.

## Benchmarks y rendimiento

JevBench Public Multi-Tier Benchmark (231 tareas públicas):

| Tier | Tareas | Accuracy | ECE | Brier | Latencia p50 |
|---|---|---|---|---|---|
| Easy | 48 | 100,0 % (48/48) | 0,0064 | 0,0009 | 44,8 ms |
| Original | 72 | 90,3 % (65/72) | 0,0972 | 0,1015 | 42,9 ms |
| Hard | 111 | 44,1 % (49/111) | 0,4681 | 0,4813 | 90,0 ms |
| Agregado | 231 | 70,1 % (162/231) | — | — | 44,8 ms |

RLCDAlignBench (100 instancias, 10 modos de fallo):

| Modo de fallo | N | AUROC | Accuracy | ECE | Latencia p50 |
|---|---|---|---|---|---|
| Power Seeking | 6 | 0,889 | 83,3 % | 0,2575 | 209,6 ms |
| Honesty (Deception) | 11 | 0,500 | 72,7 % | 0,3906 | 216,8 ms |
| Concealing Uncertainty | 14 | 0,673 | 71,4 % | 0,1800 | 127,8 ms |
| Refusal (Jailbreaks) | 11 | 0,500 | 63,6 % | 0,0974 | 267,5 ms |
| Faithfulness | 9 | 0,700 | 55,6 % | 0,2513 | 200,0 ms |
| Bias | 9 | 0,525 | 55,6 % | 0,2141 | 217,9 ms |
| Balanced Accuracy global | 100 | 0,505 | 56,2 % | 0,1944 | 199,2 ms |

Suites agénticas y de seguridad adversarial:

| Suite | Split | Accuracy | Métrica secundaria | ECE | Latencia p50 |
|---|---|---|---|---|---|
| WildGuardTest | test (100 estratificado) | 72,00 % (BalAcc 72,04 %) | AUROC 0,7993 | 0,1597 | 43,5 ms |
| Deepset Prompt Injections | test (116 completo) | 50,86 % (59/116) | AUROC 0,6214; recall inyección 75,0 % | 0,3412 | 41,6 ms |
| NVIDIA When2Call | mcq (100 estratificado) | 35,00 % | tool_call 85,3 % (29/34) | 0,5376 | 106,8 ms |

Latencia edge frente a nube (frente a TypeSafe Jev v1.13 API): ClassOne local en RTX 5060 Ti con 52,49 ms de media (19,1 req/s, coste 0,00 $), frente a 329,90 ms de media en la API cloud (3,0 req/s), lo que supone una mejora de 6,3× en latencia.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con ~5.100 millones de parámetros en float16 se requiere aproximadamente 10-11 GB solo para pesos, más memoria para activaciones y cabezas.
- GPU recomendadas: el autor reporta mediciones en RTX 5060 Ti; por tamaño, cabe en GPUs consumer con 12 GB o más (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090) y en GPUs de datacenter (A100, H100).
- Cabe en GPU consumer: sí, previsiblemente en modelos con 12 GB o más de VRAM en float16; en cuantizaciones menores no se documentan formatos.
- Opciones de despliegue: la librería classone (pip install classone) con transformers y PyTorch; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: 52,49 ms de media y 19,1 req/s en RTX 5060 Ti; latencias p50 por benchmark entre 41,6 ms y 267,5 ms según la tarea.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| classone-gemma4-e2b | 5.104.297.504 | no disponible | Decisión estructurada (Sistema 1) | Apache 2.0 | Hugging Face |
| google/gemma-4-E2B-it | no disponible | no disponible | Generación de texto (base) | no disponible | Hugging Face |
| TypeSafe Jev (v1.13) | no disponible | no disponible | Decisión en cloud (API) | propietaria | API cloud |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que no se puede establecer una comparación cuantitativa de rendimiento más allá de la latencia edge frente a la API cloud de TypeSafe Jev.

## Limitaciones y advertencias

- El rendimiento cae notablemente en la tier Hard de JevBench (44,1 % de accuracy) y en When2Call (35,00 % de accuracy global), lo que limita su uso en decisiones complejas.
- La calibración empeora en tareas difíciles: ECE de 0,4681 en Hard y 0,5376 en When2Call, frente a 0,0064 en Easy.
- En RLCDAlignBench la balanced accuracy global es del 56,2 %, con AUROC cercano al azar en honesty (0,500), refusal (0,500) y bias (0,525); no es fiable como clasificador de seguridad autónomo.
- Detección de prompt injections limitada: 50,86 % de accuracy y AUROC 0,6214, aunque con 75,0 % de recall de inyección.
- No se documentan idiomas soportados; el comportamiento multilingüe es desconocido.
- No se especifica la longitud de contexto soportada, lo que impide planificar su uso con estados o conversaciones largas.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de decisiones erróneas confiadas cuando la calibración es pobre.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base google/gemma-4-E2B-it puede tener condiciones adicionales que no se detallan en la información disponible.
- El despliegue requiere la librería classone y cargar las cabezas desde classone_heads.pt; no se documenta compatibilidad con servidores de inferencia estándar.
- Sesgos conocidos: no disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/devops-thiago/classone-gemma4-e2b
- Repositorio ClassOne: https://github.com/devops-thiago/class-one
- Paper de referencia citado: arXiv:2609.29429
- JevBench: https://github.com/fstandhartinger/jevbench
- WildGuardTest: https://huggingface.co/datasets/walledai/WildGuardTest
- Deepset Prompt Injections: https://huggingface.co/datasets/deepset/prompt-injections
- NVIDIA When2Call: https://huggingface.co/datasets/nvidia/When2Call
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it

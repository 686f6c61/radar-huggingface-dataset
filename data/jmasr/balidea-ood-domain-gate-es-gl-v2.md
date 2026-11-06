# JMasr/balidea-ood-domain-gate-es-gl-v2

## Resumen

`balidea-ood-domain-gate-es-gl-v2` es un clasificador de texto binario desarrollado por JMasr (proyecto Balidea) que actúa como puerta de dominio (*domain gate*) en un asistente clínico en castellano y gallego. Su función es decidir si un mensaje de usuario entra dentro del dominio clínico esperado (etiqueta 0, pasa) o queda fuera de él (etiqueta 1, se marca), de modo que el sistema pueda rechazar o redirigir consultas ajenas a la tarea sanitaria. Es una pieza de una pila de seguridad en profundidad, no un modelo generativo.

Técnicamente es un *fine-tune* completo (no LoRA) de `FacebookAI/xlm-roberta-base`, un transformer encoder de arquitectura XLM-RoBERTa con 278.045.186 parámetros y una longitud máxima de entrada de 256 tokens. La salida es una clasificación de secuencia con dos etiquetas y una capa de calibración de temperatura (Guo et al. 2017) más un umbral de decisión ajustado sobre el conjunto de validación.

La versión v2 sustituye a una v1 obsoleta y se reconstruye sobre una metodología de particiones consciente de la procedencia de los datos (*provenance-aware*). Es relevante para equipos que despliegan asistentes sanitarios en España y necesitan filtrar consultas fuera de dominio con control explícito de falsos positivos, aunque el propio autor advierte de un sesgo de validación (*gold-in-train*) que obliga a recalibrar antes de producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder XLM-RoBERTa (base) |
| Parametros totales | 278.045.186 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens (max_length de entrenamiento e inferencia) |
| Tipos de cuantizacion | no disponible (repo incluye ONNX y safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | es (castellano), gl (gallego) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo es un XLM-RoBERTa base completo con una cabeza de clasificación de secuencia de dos clases. Se entrenó con receta estándar de *fine-tuning* conocido-bueno: hasta 4 épocas con *early stopping* (paciencia 2, métrica `eval_loss`), learning rate 3e-05, weight decay 0.01, warmup ratio 0.06, batch size 16, longitud máxima 256 y semilla 20260526. No se emplearon LoRA, *focal loss* ni búsqueda de épocas.

El conjunto de entrenamiento tiene 13.744 filas con 9.883 negativas y 3.861 positivas, compuesto por nueve fuentes: `prod_medical_queries` (2.584), `chitchat` (2.563), `native_ood_es` (2.400), `snomed_clinical` (2.030), `prod_crisis_as_indomain` (1.648), `native_ood_gl` (1.221), `balidea_malign` (948), `ods` (176) y `author_seeds` (174). La innovación metodológica principal es la separación por procedencia de datos y la calibración posterior de temperatura (T=1.4534) y umbral de decisión (0.8400) sobre el split de validación, con recall 0.9069 y tasa de falsos positivos 0.00085 en dicha partición.

## Capacidades

- Clasificación binaria de texto (etiqueta 0 = pasa, etiqueta 1 = marca) para determinar si un mensaje cae dentro del dominio clínico.
- Detección de consultas fuera de dominio (*out-of-domain*) en castellano y gallego.
- Identificación de *chitchat* y contenido malicioso (`balidea_malign`) como categorías de marca.
- Tratamiento del discurso de crisis como dentro de dominio (`prod_crisis_as_indomain`), evitando marcarlo como OOD.
- Procesamiento de mensajes cortos y medios de hasta 256 tokens.
- Salida de probabilidad calibrada apta para umbralización configurable.
- No soporta *tool calling*, agentes, visión, audio ni generación de texto: es exclusivamente un clasificador.

## Casos de uso

- Filtrado previo en un asistente clínico: cada mensaje del usuario se pasa por el clasificador antes de invocar al modelo generativo; si la probabilidad calibrada supera el umbral, el asistente declina o redirige, reduciendo respuestas fuera de dominio.
- Moderación de *chitchat* en producción: el modelo se entrenó con 2.563 ejemplos de conversación trivial, por lo que sirve para mantener el asistente centrado en temas sanitarios.
- Detección de intentos de *jailbreak* o contenido malicioso: la fuente `balidea_malign` (948 filas) aporta señal para marcar entradas hostiles como fuera de dominio.
- Enrutado bilingüe castellano-gallego: permite dirigir consultas al pipeline lingüístico adecuado o rechazarlas según el idioma, con datos nativos en ambos (`native_ood_es` y `native_ood_gl`).
- Capa de seguridad en una pila *defence-in-depth*: se combina con otros clasificadores y reglas; su bajo FP en validación (0.00085) lo hace apto como primera barrera poco intrusiva.
- Monitorización y auditoría de tráfico: al devolver probabilidades calibradas, permite registrar la distribución de puntuaciones y detectar derivas en el tipo de consultas recibidas.
- Preservación de consultas de crisis: al tratar el discurso de crisis como dentro de dominio, evita que el filtro bloquee mensajes que requieren atención humana.

## Benchmarks y rendimiento

Resultados sobre el *gold-test* reservado (n=68; 26 positivos, 42 negativos), según la model card:

| Punto de operación | Umbral | Recall | FP | ROC-AUC | Aceptación |
|---|---|---|---|---|---|
| Enviado (calibrado en val) | 0.840 | 0.3462 | 0.0 | 0.978 | No |
| Recalibrado en gold | 0.71 | 0.9375 | 0.0 | — | Sí |

En validación, con umbral 0.8400: recall 0.9069 y FP 0.00085. El ROC-AUC de 0.978 indica buena calidad de ranking independiente del umbral; el punto de operación enviado, sin embargo, no alcanza el criterio de aceptación sobre el *gold-test* y requiere recalibración a 0.71.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,1 GB para los 278 M de parámetros, más activaciones (mínimas con batch pequeño y 256 tokens).
- En fp16/bf16: aproximadamente 0,6 GB de pesos.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, así como en CPU para volúmenes moderados.
- GPU recomendadas para alto throughput: A100, H100, L4 o T4 para servir en lote.
- Despliegue: `transformers` con `AutoModelForSequenceClassification`, exportación ONNX (incluida en el repo) para `onnxruntime` u `onnxruntime-server`, y `vLLM`/`TGI` no aplican por ser un encoder de clasificación.
- Latencia y throughput: no disponibles en la información proporcionada; con 256 tokens y encoder base, se espera del orden de milisegundos por petición en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `JMasr/balidea-ood-domain-gate-es-gl-v2` | 278 M | 256 | Clasificación binaria OOD clínica es/gl | Apache 2.0 | Hugging Face |
| `FacebookAI/xlm-roberta-base` | 278 M | 512 | Modelo base multilingüe (requiere fine-tune) | MIT | Hugging Face |
| `PlanTL-GOB-ES/roberta-base-bne` | ~125 M | 512 | Modelo base en castellano (requiere fine-tune) | Apache 2.0 | Hugging Face |

No se dispone de comparativas publicadas frente a otros clasificadores de seguridad clínica específicos; la comparación se limita a los modelos base sobre los que se podría construir un clasificador equivalente.

## Limitaciones y advertencias

- Sesgo de validación (*gold-in-train*): unas 176 filas del conjunto de aceptación `.ods` están en el split de entrenamiento, por lo que la puerta estándar contra el `.ods` completo no es una comprobación limpia y fue omitida; la validación se limita al 20 % reservado (n=68).
- El `.ods` es un conjunto curado de 886 prompts, no tráfico real; los números deben confirmarse sobre tráfico en producción.
- El umbral enviado (0.840) no supera el criterio de aceptación en el *gold-test* (recall 0.3462); es necesario recalibrar a 0.71 (recall 0.9375) antes de desplegar.
- Riesgo de alucinación no aplica como tal, pero sí de clasificación errónea: falsos negativos permiten pasar consultas fuera de dominio y falsos positivos bloquean consultas legítimas.
- Solo validado para castellano y gallego; no debe usarse en otros idiomas ni en dominios no clínicos.
- No apto para decisiones autónomas sobre personas ni para triaje de crisis sin revisión humana.
- Licencia Apache 2.0 permite uso comercial, pero el autor no publica el wrapper interno `safeguard.inference`, por lo que la calibración debe replicarse manualmente.
- Requiere monitorización continua de recall y falsos positivos tras el despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JMasr/balidea-ood-domain-gate-es-gl-v2
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-base
- Referencia de calibración: Guo et al. 2017, *On Calibration of Modern Neural Networks* (https://arxiv.org/abs/1706.04599)

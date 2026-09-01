# Jazhyc/Gleipnir-9B

## Resumen

Gleipnir 9B es un monitor de investigación diseñado para detectar engaño, esquemas y otros comportamientos problemáticos relevantes para el control de agentes de IA. No es un modelo independiente, sino un adaptador LoRA de rango 128 construido sobre el modelo base `Qwen/Qwen3.5-9B`, desarrollado por Jazhyc como artefacto de investigación para reproducibilidad y trabajo de seguimiento. El modelo recibe transcripciones de acciones visibles (mensajes, llamadas a herramientas, comandos, salidas, ediciones e informes finales) y produce una puntuación de riesgo binaria o continua sobre si la trayectoria contiene acciones no autorizadas, intentos de bypass de salvaguardas, cumplimiento de instrucciones conflictivas o encubrimiento engañoso.

La relevancia actual de Gleipnir 9B radica en que aborda un problema emergente en el despliegue de agentes autónomos: la supervisión de comportamiento sin acceso a la cadena de pensamiento privada del agente. Con una ventana de contexto de hasta 29.696 tokens y un entrenamiento basado en destilación de conocimiento desde un modelo profesor (Kimi K3), ofrece una métrica objetiva (pAUROC@20) para evaluar la capacidad de monitorización en escenarios fuera de distribución. Es un punto de partida para la investigación en detección de esquemas, no un sistema de seguridad listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (LoRA rank-128 sobre Qwen/Qwen3.5-9B) |
| Parametros totales | 9.000 millones (modelo base) + 232.783.872 (adaptador entrenable) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 29.696 tokens (sin truncamiento auditado) |
| Tipos de cuantizacion | Adaptador en FP32; base entrenado con 4-bit NF4 + doble cuantizacion y computo BF16 |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

Gleipnir 9B es un adaptador LoRA de rango 128 y alpha 256 aplicado a todas las proyecciones de atencion y MLP del modelo base `Qwen/Qwen3.5-9B` (revision `c202236235762e1c871ad0ccb60c8ee5ba337b9a`). El adaptador se entrena sobre el modelo base congelado, usando una interfaz de clasificacion binaria: compara los logits del siguiente token para los literales `0` y `1` en el punto de decision congelado. La puntuacion de riesgo se obtiene normalizando la probabilidad softmax del token `1` frente al `0`.

El entrenamiento se realizo durante una epoca con 21.837 ejemplos: 8.688 trayectorias de herramientas solo-accion y 13.149 ejemplos previos de engano de las lineas Aletheia's Quest y Liars' Bench. Se utilizo exclusivamente la probabilidad softmax del modelo profesor Kimi K3 sobre los tokens de decision literales; las etiquetas duras de las fuentes se conservaron solo para trazabilidad y evaluacion, sin peso en la perdida. El optimizador fue AdamW con tasa de aprendizaje `5e-5`, batch efectivo de 32 y semilla 0. El entrenamiento se ejecuto en una NVIDIA H100 80 GB durante aproximadamente 6,65 horas. El adaptador guardado esta en FP32 con 232.783.872 parametros entrenables.

## Capacidades

- Deteccion de engano y esquemas en trayectorias de agentes visibles, sin acceso a la cadena de pensamiento privada.
- Clasificacion binaria de comportamiento problematico: acciones no autorizadas, intentos de bypass de salvaguardas, cumplimiento de instrucciones conflictivas en entradas no confiables y ocultacion enganosa.
- Generacion de una puntuacion de riesgo continua mediante la normalizacion de los logits de los tokens `0` y `1`.
- Manejo de trayectorias largas de hasta 29.696 tokens, con cero truncamientos auditados en el conjunto de evaluacion.
- Capacidad de evaluacion fuera de distribucion (OOD) en multiples fuentes: AgentDojo, CUA-SHADE, IaC, MLE-Sabotage, Rogue Eval y SHADE-Arena.
- No es un modelo generativo general: su unica salida relevante es la puntuacion de riesgo binaria/continua.

## Casos de uso

- Monitorizacion de agentes autonomos en produccion: integrar Gleipnir 9B como capa de supervision que analice las transcripciones de acciones de un agente (llamadas a herramientas, comandos, ediciones) y genere una alerta temprana si detecta intentos de sabotaje o bypass de politicas. Su ventana de 29.696 tokens permite revisar sesiones largas completas.
- Auditoria de trayectorias en entornos de desarrollo: antes de desplegar un agente, los equipos pueden pasar las trayectorias de pruebas por el monitor para identificar comportamientos problematicos no cubiertos por los tests funcionales.
- Investigacion en seguridad de IA: como artefacto de investigacion, sirve para estudiar la detectabilidad de esquemas en modelos de agentes, comparar estrategias de supervision y desarrollar nuevos metodos de monitorizacion.
- Evaluacion de cumplimiento de instrucciones en sistemas multiagente: detectar si un agente sigue instrucciones conflictivas incrustadas en entradas no confiables (prompt injection) en lugar de las instrucciones del operador.
- Analisis forense de incidentes: tras un fallo de seguridad, usar el monitor para revisar las trayectorias registradas y determinar si hubo engano deliberado o simplemente errores honestos, ayudando a distinguir entre ambos casos.
- Benchmarking de agentes: incorporar Gleipnir 9B como metrica objetiva en suites de evaluacion de agentes, complementando metricas de exito de tarea con una medida de comportamiento problematico.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card, evaluados una vez sobre una suite congelada de 6.395 filas estrictamente fuera de distribucion (OOD) que abarca seis fuentes. La metrica principal es el pAUROC@20 normalizado y no ponderado.

| Modelo | Mean-OOD pAUROC@20 | Mean-OOD AUROC | Pooled pAUROC@20 | Pooled AUROC |
| --- | ---: | ---: | ---: | ---: |
| Gleipnir 4B | 0.7824 | 0.9086 | 0.7015 | 0.9135 |
| **Gleipnir 9B** | **0.8212** | **0.9215** | **0.7837** | **0.9355** |

Gleipnir 9B supera a Gleipnir 4B en 0.0388 en Mean-OOD pAUROC@20 y en 0.0130 en Mean-OOD AUROC. El coste de inferencia en el proxy alojado del proyecto es aproximadamente tres veces mayor que el de 4B, por lo que el autor recomienda 4B como opcion de menor coste. Son estimaciones puntuales de una sola semilla; no se han publicado intervalos de confianza. Adicionalmente, anadir 13.149 ejemplos previos de engano a los 8.688 ejemplos de trayectorias emparejadas fue macro-neutral respecto al adaptador solo-emparejado (cambio de -0.0015 en Mean-OOD pAUROC@20 y +0.00003 en Mean-OOD AUROC).

## Requisitos de hardware

- El adaptador LoRA es ligero (1.9 GB en FP32), pero la inferencia requiere cargar el modelo base `Qwen/Qwen3.5-9B` completo.
- VRAM estimada: aproximadamente 18-20 GB para el modelo base en BF16, mas el adaptador. Con cuantizacion 4-bit del base, la VRAM puede reducirse a unos 6-8 GB.
- GPU recomendadas: NVIDIA H100, A100, RTX 4090 (24 GB) o RTX 3090 (24 GB) para BF16 sin cuantizar; GPUs con 8-12 GB pueden funcionar con cuantizacion 4-bit del base.
- El entrenamiento se realizo en una H100 80 GB; para inferencia no se requiere tanta capacidad.
- Despliegue: el repositorio incluye un subdirectorio `vllm/` con la disposicion de adaptador re-basada para la campana de vLLM 0.24.0 con paridad de puertas. Tambien se puede usar con `transformers` + `peft` (ejemplo oficial en la model card). No se menciona soporte para llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de comparativas publicas con otros monitores de deteccion de esquemas fuera del propio proyecto Gleipnir. La unica comparacion directa es con Gleipnir 4B, que comparte la misma metodologia pero con un base menor. En el campo de monitores deliberativos para deteccion de esquemas en caja negra, existen trabajos academicos (por ejemplo, el paper "Training Deliberative Monitors for Black-Box Scheming Detection") pero no se han publicado resultados comparables con Gleipnir 9B en la informacion disponible.

| Modelo | Base | Parametros entrenables | Contexto | Mean-OOD pAUROC@20 | Licencia |
| --- | --- | ---: | ---: | ---: | --- |
| Gleipnir 9B | Qwen3.5-9B | 232,8 M | 29.696 | 0.8212 | MIT |
| Gleipnir 4B | No especificado | No especificado | No especificado | 0.7824 | MIT |

## Limitaciones y advertencias

- Artefacto de investigacion temprano: no debe tratarse como un sistema de seguridad de produccion ni como evidencia de que una interaccion es segura por el mero hecho de que el modelo asigne una puntuacion baja.
- Solo analiza acciones visibles: no tiene acceso a la cadena de pensamiento privada del agente, por lo que puede no detectar esquemas que no se manifiesten en acciones observables.
- Riesgo de falsos negativos: una puntuacion baja no garantiza ausencia de comportamiento problematico; el autor advierte explicitamente contra su uso como certificacion de seguridad.
- Sesgo de entrenamiento: los datos provienen de fuentes especificas (AgentDojo, CUA-SHADE, IaC, MLE-Sabotage, Rogue Eval, SHADE-Arena) y de lineas de engano previas; el rendimiento en otros dominios o estilos de agente puede degradarse.
- Resultados de una sola semilla: las metricas reportadas son estimaciones puntuales sin intervalos de confianza ni repeticiones.
- Idioma: solo entrenado y evaluado en ingles; no se garantiza su funcionamiento en otros idiomas.
- No es un modelo generativo: no se puede usar para generar texto, codigo o respuestas; su unica funcion es la clasificacion de riesgo.
- Coste de inferencia: el autor indica que el coste en el proxy alojado es aproximadamente tres veces el de Gleipnir 4B, lo que puede limitar su uso en despliegues a gran escala.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jazhyc/Gleipnir-9B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Paper relacionado (no del modelo, pero relevante): "Training Deliberative Monitors for Black-Box Scheming Detection" - https://alpha-ollama.hf-mirror.com/papers/2605.29601
- No se ha publicado paper ni blog post propio del modelo en la informacion disponible.

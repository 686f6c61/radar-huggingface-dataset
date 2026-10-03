# Dipto084/safe_laya

## Resumen

safe_laya es un guardrail de entrada de 421 millones de parámetros que decide si un asistente debe responder a un mensaje de usuario o declinarlo. Lo desarrolla Dipto084 a partir de `convaiinnovations/laya-typed-decisions`, un modelo de decisiones tipadas de Convai Innovations construido sobre el encoder `answerdotai/ModernBERT-large`. El ajuste se ha hecho sobre los criterios ALLOW/DECLINE derivados de TRACE (Trajectory Aware Reasoning for Multi-Turn Adversarial Conversation Evaluation, arXiv:2608.15594), relabelando el split de RL de TRACE en una tarea binaria de clasificación.

El problema que resuelve es concreto: filtrar conversaciones multi-turno antes de que lleguen al modelo objetivo. Frente al ataque AutoDAN-Turbo, reduce el éxito de ataque sobre un objetivo Llama-3.1-8B-Instruct de 103/120 comportamientos a 15/120, con un décimo de los parámetros de los guardrails de 8B con los que pretende convivir. Es relevante ahora porque los guardrails basados en LLM de gran tamaño son caros de desplegar en cada turno, y este modelo demuestra que un clasificador encoder-only de 421M puede mejorar sustancialmente a su modelo base en separación de scores y en tasa de detección.

Arquitectura transformer encoder-only (ModernBERT-large), contexto de 8.192 tokens, licencia Apache-2.0 y únicamente inglés. La predicción es una probabilidad calibrada sobre dos opciones mediante una única pasada forward sobre la conversación acumulada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only, basado en `answerdotai/ModernBERT-large` |
| Parametros totales | 421.293.830 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens (entrenado con head de 256) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | en (solo ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (tamano de repositorio 1,7 GB, consistente con pesos en fp32) |

## Arquitectura y entrenamiento

El modelo parte de `convaiinnovations/laya-typed-decisions`, una familia de 421M parámetros cuyo encoder es ModernBERT-large. Sobre esa base se aplica un ajuste supervisado con entropía cruzada (`ce_weight` 1.0, `rl_weight` 0.0, es decir, sin RL) para producir una decisión binaria con probabilidad calibrada. La tarea se formula como una elección entre ALLOW y DECLINE con los criterios textuales del propio rubric de jailbreak-score de TRACE: ALLOW corresponde a los niveles 1-2 del rubric, DECLINE al nivel 4 (y a la forma de un solo turno del nivel 5). El nivel 3 (dirección dañina aparente pero turno actual benigno) no tiene cabida en una partición binaria y queda deliberadamente en el lado ALLOW.

Los datos de entrenamiento proceden del split de RL de TRACE (`Dipto084/TRACE_RL_Dataset`), relabelado a la tarea binaria. El conjunto son 5.334 ítems, 4 épocas y 7.313 actualizaciones, con 1,96 horas de cómputo en una única A100 de 80 GB. El orden de las opciones se barajó durante el entrenamiento, mientras que en evaluación se mantiene el orden declarado. La calibración se hizo a posteriori con temperature scaling (temperatura 2,675) ajustada mediante LBFGS sobre 400 ítems retenidos. El formato de entrada para multi-turno es una serialización `[Turn N]` / `USER:` / `ASSISTANT:` que termina en el turno de usuario sin responder.

## Capacidades

- Clasificación binaria de seguridad de entrada: una pasada forward devuelve probabilidad calibrada sobre ALLOW y DECLINE.
- Detección de jailbreak en conversaciones multi-turno, incluyendo ataques que construyen el contexto a lo largo de varios turnos.
- Moderación de contenido: distingue entre temas sensibles con propósito creíblemente benigno y peticiones que requerirían material dañino.
- Razonamiento sobre el estado completo de la conversación serializada, no solo sobre el último mensaje.
- Contexto de 8.192 tokens, suficiente para cadenas de varios turnos.
- No soporta tool calling ni function calling.
- No soporta uso como agente ni razonamiento multi-paso por sí mismo; es un componente de decisión dentro de un pipeline.
- No tiene capacidades multimodales (ni visión ni audio).
- No dispone de modo thinking ni de generación de texto libre.
- Multilingüe: no, únicamente inglés.

## Casos de uso

- Filtro de entrada en asistentes conversacionales: se interpone antes del LLM generativo y declina los turnos que requerirían contenido dañino, con 15/120 comportamientos comprometidos frente a AutoDAN-Turbo en la evaluación publicada.
- Defensa en profundidad frente a ataques multi-turno: al serializar la conversación completa como `[Turn N]` / `USER:` / `ASSISTANT:`, el clasificador ve la trayectoria de ataque, no solo el último mensaje, que es donde fallan los filtros de turno único.
- Moderación de comunidades y foros: se puede ejecutar sobre cada intervención para etiquetar mensajes con una probabilidad de DECLINE y priorizar la revisión humana por score.
- Enrutado de peticiones en plataformas con políticas estrictas: usar el score de DECLINE como señal para derivar a un flujo restringido o a un mensaje de rechazo, manteniendo el modelo grande solo para el tráfico permitido.
- Reducción de coste por token en producción: al ser un encoder de 421M con una sola pasada, puede ejecutarse en cada turno a una fracción del coste de un guardrail de 8B generativo.
- Evaluación de robustez de despliegues propios: emplearlo como juez binario sobre conjuntos de conversaciones adversariales para medir la resistencia de un asistente antes de publicarlo.
- Investigación en seguridad de LLM: sirve como baseline reproducible para comparar estrategias de filtrado, dado que el dataset de entrenamiento y el rubric están publicados.

## Benchmarks y rendimiento

Clasificación sobre el conjunto retenido de 1.342 ítems (473 DECLINE, 869 ALLOW), recalculado desde predicciones crudas; ECE con 10 bins:

| Metrica | safe_laya | laya base (stock) |
|---|---|---|
| Accuracy | 0,879 | 0,655 |
| AUROC | 0,944 | 0,667 |
| Brier | 0,092 | 0,213 |
| ECE | 0,050 | 0,056 |
| TPR | 0,854 | 0,345 |
| FPR | 0,107 | 0,176 |
| Rango de p(DECLINE) | 0,057–0,938 | 0,060–0,858 |

Evaluación extremo a extremo como filtro de entrada frente a AutoDAN-Turbo: 120 comportamientos estilo HarmBench, 5 intentos de ataque por comportamiento, atacante Qwen3-32B, objetivo Llama-3.1-8B-Instruct, scorer propio de AutoDAN-Turbo. Se considera "jailbroken" si al menos uno de los 5 intentos supera el umbral de ruptura:

| Filtro | Jailbroken | Intentos medios |
|---|---|---|
| Ninguno | 103 / 120 | 2,73 |
| laya base (stock) | 39 / 120 | 4,26 |
| safe_laya | 15 / 120 | 4,80 |

El aumento de intentos medios indica que el atacante se ve empujado hacia el tope de 5 intentos en lugar de tener éxito de forma temprana.

## Requisitos de hardware

- VRAM estimada en fp32: aproximadamente 1,7 GB de pesos (el repositorio ocupa 1,7 GB) más activaciones para 8.192 tokens; en la práctica cabe holgadamente en 4-6 GB.
- VRAM estimada en fp16/bf16: en torno a 0,85 GB de pesos más activaciones.
- VRAM estimada en 8 bits: aproximadamente 0,42 GB de pesos; en 4 bits, alrededor de 0,21 GB, aunque no hay cuantizaciones oficiales publicadas.
- GPU recomendadas: cualquier GPU con 6 GB o más. El entrenamiento se hizo en una A100 80GB, pero es sobredimensionada para inferencia.
- Cabe en GPU de consumo: sí, en RTX 3060 12GB, RTX 4060 Ti 16GB, RTX 4070, RTX 4080, RTX 4090 y tarjetas de gama media con 6-8 GB.
- Opciones de despliegue: vLLM o TGI para servir el encoder como clasificador, o inferencia directa con la librería `laya` mediante `Agent("Dipto084/safe_laya")`. No hay ficheros GGUF publicados, por lo que llama.cpp y Ollama requerirían una conversión propia.
- Latencia y throughput: no disponible. El único dato de cómputo publicado es el de entrenamiento (1,96 h en una A100 80GB); no se documentan latencias ni tokens por segundo en inferencia.

## Comparativa con modelos similares

| Modelo | Rol | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| safe_laya | Guardrail de entrada binario ALLOW/DECLINE | 421M (421.293.830) | 8.192 tokens | Apache-2.0 | HuggingFace (`Dipto084/safe_laya`) |
| convaiinnovations/laya-typed-decisions | Modelo base de decisiones tipadas | 421M | no disponible | no disponible en la informacion proporcionada | HuggingFace |
| Guardrails generativos de 8B (categoria citada en la model card) | Guardrail de entrada/salida | 8B | no disponible | no disponible en la informacion proporcionada | no disponible |

La model card situa explicitamente a safe_laya frente a "los modelos guardrail de 8B con los que pretende convivir", es decir, la categoria de guardrails generativos de ese tamano, pero no se aportan datos de comparacion con ninguno de ellos. La unica comparacion cuantitativa disponible es contra el modelo base stock, donde safe_laya mejora tanto la recall (TPR 0,854 frente a 0,345) como la tasa de falsos positivos (0,107 frente a 0,176) sobre el split retenido de la distribucion de entrenamiento.

## Limitaciones y advertencias

- La tasa de falso rechazo sobre trafico benigno general no se ha medido. El FPR de 0,107 corresponde al split retenido de la distribucion de entrenamiento, no a un benchmark de sobre-rechazo tipo OR-Bench o XSTest. La tasa de rechazo real en despliegue es desconocida y debe tratarse como tal.
- Se ha evaluado unicamente como clasificador de entrada. No inspecciona las respuestas del modelo, por lo que no cubre fugas de contenido en la salida.
- La evidencia de ataque procede solo de AutoDAN-Turbo y de un unico modelo objetivo. La generalizacion a otros ataques y otros objetivos no esta probada.
- Solo ingles.
- Las trayectorias de nivel 3 (direccion dañina con turno actual benigno) caen deliberadamente en el lado ALLOW y no constituyen una clase propia.
- Es un guardrail, no una garantia: fallara tanto dejando pasar ataques como rechazando peticiones benignas.
- El orden de las opciones se barajo en entrenamiento pero se mantiene fijo en evaluacion; si se reordena en produccion, la calibracion podria verse afectada.
- La temperatura de calibracion se ajusto sobre 400 items retenidos; su validez fuera de esa distribucion no esta verificada.
- Licencia Apache-2.0, sin restricciones conocidas para uso comercial, pero el modelo base y el dataset de entrenamiento pueden tener condiciones propias que conviene revisar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Dipto084/safe_laya
- Modelo base: https://huggingface.co/convaiinnovations/laya-typed-decisions
- Modelo laya original: https://huggingface.co/convaiinnovations/laya
- Dataset de entrenamiento: https://huggingface.co/datasets/Dipto084/TRACE_RL_Dataset
- Encoder base: https://huggingface.co/answerdotai/ModernBERT-large
- Paper de TRACE: arXiv:2608.15594 (Miah, Md Messal Monem; Anika, Tasnim; Yu, Youngwoo; Huang, Ruihong)
- La busqueda web realizada no devolvio ningun resultado relevante sobre el modelo; los unicos resultados obtenidos fueron paginas no relacionadas.

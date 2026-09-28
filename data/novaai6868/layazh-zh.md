# NovaAI6868/layazh-zh

## Resumen

layazh-zh es un modelo de decisión "System 1" para chino, no autorregresivo, desarrollado por NovaAI6868. A diferencia de un LLM generativo, no produce texto: recibe un *state* (reseña, correo, ticket, JSON) junto con una o varias preguntas tipadas y devuelve, en una única pasada hacia delante, respuestas con probabilidades calibradas. Al no generar secuencias, no hay texto que parsear ni margen para la alucinación de formato, lo que lo orienta a clasificación, enrutado, puntuación ordinal y guardarraíles.

Técnicamente se apoya en un encoder `hfl/chinese-roberta-wwm-ext-large` (24 capas, 1024 de dimensión oculta, ~325M de parámetros) al que se añade una cabeza de decisión isomorfa a la del proyecto upstream `convaiinnovations/laya`: dos capas de TransformerEncoder más un *marker scorer* y una cabeza de acción. El conjunto suma 352.034.566 parámetros y trabaja con una ventana de contexto de 512 tokens. La receta de entrenamiento emplea RLCD (aprendizaje por refuerzo sobre funciones de puntuación propias y estrictas), con REINFORCE y baseline de media de grupo.

Su relevancia actual radica en que cubre un nicho que los LLM cubren de forma cara e inestable: decisiones binarias, de elección múltiple y ordinales con probabilidad calibrada. Al ser no autorregresivo y de 352M de parámetros, se ejecuta en una sola pasada, cabe en GPUs de consumo e incluso en CPU, y su licencia es personal y gratuita pero comercialmente restrictiva (requiere autorización de pago).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer chino (RoBERTa-wwm-ext-large, 24 capas) + cabeza de decisión (2 capas TransformerEncoder + marker scorer + act head); no autorregresiva, tipo System 1 |
| Parametros totales | 352.034.566 |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | No disponible (los pesos se manejan en fp32/fp16; el código ajusta el dtype automáticamente y descarta bfloat16 en arquitecturas antiguas) |
| Idiomas soportados | Chino (zh) |
| Licencia | layazh-custom-license (uso personal, investigación y no lucrativo gratuito; uso comercial requiere licencia de pago); el código heredado de `convaiinnovations/laya` es Apache-2.0 |
| Formato de pesos | safetensors (librería `transformers`; paquete propio `layazh` distribuido como wheel) |

## Arquitectura y entrenamiento

El modelo es un encoder clasificador con una cabeza de decisión específica. El backbone es `hfl/chinese-roberta-wwm-ext-large` (24 capas, 1024 de dimensión oculta, 325M de parámetros), sobre el que se monta una cabeza idéntica en estructura a la del `DecisionModel` de Laya: dos capas de TransformerEncoder, un *marker scorer* y una cabeza de acción. La secuencia de entrada sigue una plantilla fija, alineada programáticamente con la del upstream:

```
[CLS] <qtype> 问题：<中文指令> [SEP] [MASK] 选项0 [MASK] 选项1 ... [SEP] <state> [SEP]
```

Cada opción va precedida de un marcador `[MASK]`; la cabeza lee los estados ocultos de esas posiciones y aplica softmax sobre las opciones de cada pregunta. El tipo `noul` (sí/no) se renderiza siempre como `[false, true]`, de modo que `p[1]` es la probabilidad de que la proposición se cumpla. El presupuesto de la cabeza es `head_max_len = 192`.

El entrenamiento sigue la receta RLCD del upstream en lo algorítmico, aunque los hiperparámetros concretos los fijó este proyecto y no coinciden necesariamente con los del autor original (que no publicó sus valores de RL). La función de recompensa es idéntica a la del upstream y se basa en reglas de puntuación estrictamente propias, lo que convierte la calibración en una propiedad emergente del objetivo y no en un ajuste posterior:

```
reward = log_score + 0.5 × spherical_score        # todas las preguntas
       − 1.0 × ranked_probability_score           # solo preguntas ordinales (score)
```

El bucle de optimización combina estimación de política por REINFORCE con baseline de media de grupo (estilo GRPO): ruido gaussiano de media cero sobre los logits de opción con `σ = 0.5`, `group = 4` muestras por grupo para calcular la baseline y temperatura de muestreo `τ = 1.5`. El objetivo es `8.0 × PG + 1.0 × KL` (término KL enmascarado y denso). Las tasas de aprendizaje son 3e-4 para la cabeza y 2e-5 para el encoder (con `encoder_lr_scale = 0.067`), AdamW, con warmup lineal del 6 % y decaimiento coseno, grad clip 1.0, gradient checkpointing y fp32. Por restricción de memoria (12 GB de VRAM) solo se afinan las 8 capas superiores de 24 más la cabeza, con aumento del orden de opciones activado. El diálogo multiturno utiliza TD(λ = 1.0) sobre cortes de prefijo. El modelo fue entrenado y probado en una GTX Titan X (sm_52).

## Capacidades

- Decisión no autorregresiva: dada una secuencia de estado y un conjunto de preguntas, devuelve todas las respuestas en una sola pasada hacia delante, sin generar texto.
- Probabilidades calibradas: cada respuesta incluye una probabilidad, no solo una etiqueta; la calibración proviene del uso de reglas de puntuación estrictamente propias (log score, spherical score, RPS) en el objetivo de entrenamiento.
- Tres tipos de pregunta:
  - `choice`: elección entre criterios etiquetados (por ejemplo, sentimiento positivo/negativo).
  - `score`: valoración ordinal; devuelve el valor esperado (0–4 en el ejemplo de la model card).
  - `noul`: proposición booleana; `p[1]` es la probabilidad de que se cumpla.
- Clasificación de texto chino (pipeline `text-classification`) sobre estados como reseñas, correos, tickets o JSON.
- Enrutado y scoring: apto para decidir rutas o asignar puntuaciones con umbral calibrado.
- Guardarraíles: al no generar texto, no puede fabricar contenido; solo devuelve etiquetas y probabilidades.
- Soporte multiturno mediante TD(λ = 1.0) sobre prefijos de conversación.
- Sin soporte declarado de tool calling, function calling, agentes, visión, audio ni *thinking mode*.

## Casos de uso

- Clasificación de sentimiento en reseñas: se pasa la reseña como estado y una pregunta `choice` con criterios positivo/negativo; el modelo devuelve la etiqueta y una confianza calibrada útil para enrutar reseñas dudosas a revisión humana.
- Puntuación ordinal de satisfacción: con una pregunta `score` de cinco niveles, el modelo devuelve un valor esperado (por ejemplo, 3.10 sobre 4) en lugar de una clase, lo que permite agregar métricas continuas.
- Guardarraíl de entrada/salida: al no generar texto, se usa para decidir si un mensaje cumple una política (por ejemplo, `noul`: "¿el usuario está solicitando un dato personal?") con una probabilidad que actúa como umbral.
- Enrutado de tickets de soporte: clasificar un ticket en categorías y decidir la cola o el equipo de destino usando la etiqueta de mayor probabilidad, o derivar a humano cuando la confianza es baja.
- Extracción de decisiones estructuradas en pipelines de negocio: sobre un JSON o correo como estado, formular varias preguntas tipadas y consumir las respuestas directamente como campos sin parsear texto libre.
- Moderación de contenido: preguntas `noul` compuestas para comprobar múltiples políticas a la vez en una única pasada, con probabilidades comparables entre criterios.
- Análisis de encuestas y formularios en chino: convertir respuestas abiertas en puntuaciones ordinales calibradas para informes agregados.
- Automatización de back-office: evaluar correos para decidir acciones (aprobar, escalar, rechazar) con probabilidad asociada y registro auditable, al no haber generación de texto que pueda desviarse del formato.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K (no aplicables a un clasificador no generativo) ni evaluaciones de calibración (ECE, Brier, RPS) sobre conjuntos públicos. Únicamente se ofrece un ejemplo ilustrativo de salida con tres preguntas sobre una reseña (sentimiento `positive` con confianza 1.0, puntuación 3.10 y `noul` de recomendación 0.98), que no constituye una evaluación comparativa.

## Requisitos de hardware

- Parámetros: 352M. Peso aproximado en fp32 ~1,4 GB (el repo ocupa 1,4 GB); en fp16 ~0,7 GB, más activaciones (contexto de 512 tokens, batch moderado).
- Cabe holgadamente en GPUs de consumo: GTX 1080 Ti (11 GB) o superior, RTX 20/30/40, y en tarjetas con 4-8 GB de VRAM para lotes pequeños.
- Fue entrenado y probado en una GTX Titan X (sm_52) con restricción de 12 GB de VRAM; documenta explícitamente el soporte para Maxwell/Pascal (sm_50–sm_61) y Turing/Volta.
- Ejecución en CPU posible (más lenta), útil para despliegues de bajo volumen.
- Opciones de despliegue: paquete `layazh` (wheel distribuido en el propio repositorio, instalable con `uv pip install` o `pip`) y carga mediante `from layazh import ZhAgent; ZhAgent.from_pretrained("NovaAI6868/layazh-zh")`. Compatible con el stack `transformers`/`safetensors`. No aplica vLLM, llama.cpp, Ollama ni TGI al no ser un modelo generativo de texto.
- Para GPUs antiguas se recomienda `torch==2.7.1` con `cu128` (último wheel con cubin `sm_50`, ejecutable en sm_52); en Turing/Volta, `cu121`; Ampere y posteriores usan el PyTorch por defecto. Estas arquitecturas antiguas no soportan bfloat16 y el código converge el dtype a fp16/fp32.
- Latencia y throughput: al ser una única pasada hacia delante (no autorregresiva), la latencia es baja, pero no se publican valores de latencia ni de throughput en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Encoder | Idioma | Licencia | Enfoque |
|---|---|---|---|---|---|---|
| layazh-zh | 352M | 512 tokens | hfl/chinese-roberta-wwm-ext-large (24 capas, 1024) | Chino | layazh-custom-license (comercial de pago) | Decisión System 1 no autorregresiva, salida con probabilidades calibradas |
| convaiinnovations/laya (upstream) | 421M | 512 tokens | answerdotai/ModernBERT-large (28 capas, 1024, 395M) | Inglés | No disponible en la información proporcionada (código Apache-2.0) | Igual enfoque (decisión System 1), cabecera idéntica |
| hfl/chinese-roberta-wwm-ext-large (modelo base) | ~325M | 512 tokens | RoBERTa-wwm-ext-large | Chino | No disponible en la información proporcionada | Encoder general de lenguaje, requiere cabeza de tarea propia |

No se dispone de comparativas cuantitativas de rendimiento entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Licencia restrictiva: no es open source. El uso personal, de investigación, no lucrativo y de desarrolladores individuales con ingresos anuales inferiores a 10.000 CNY es gratuito; cualquier uso comercial exige una licencia de pago (contacto `novaweb6868@outlook.com`). Verificar la sección de CLA para contribuciones.
- Solo chino: no hay soporte declarado para otros idiomas; el rendimiento en textos mixtos o en castellano no está documentado.
- Contexto limitado a 512 tokens, con un presupuesto de cabeza (`head_max_len = 192`); estados largos deben truncarse o dividirse.
- No es un modelo generativo: no redacta, no resume ni responde en lenguaje natural; si el caso de uso requiere texto libre, no es la herramienta adecuada.
- Riesgo de alucinación de contenido bajo (no genera texto), pero sí riesgo de clasificación errónea cuando la probabilidad es baja; conviene fijar umbrales y derivar a revisión humana los casos de baja confianza.
- Sesgos: no se documentan estudios de sesgo ni de robustez; al entrenarse sobre datos de decisión en chino, puede heredar sesgos del corpus.
- Calibración: la calibración depende del uso de tipos de pregunta correctos (choice, score, noul) y de la plantilla exacta; alterar el formato de la secuencia puede degradar las probabilidades.
- Cifras de entrenamiento no verificables frente al upstream: el autor indica explícitamente que los hiperparámetros de RLCD son los suyos y no los del proyecto original, que no los publicó.
- Sin benchmarks ni evaluaciones independientes: la adopción en producción debería ir precedida de una evaluación propia sobre el dominio objetivo.
- El README se distribuye en chino e inglés parcial; no hay traducción oficial a otros idiomas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NovaAI6868/layazh-zh
- Licencia: https://huggingface.co/NovaAI6868/layazh-zh/blob/main/LICENSE
- Wheel de instalación (`layazh` 0.1.0): https://huggingface.co/NovaAI6868/layazh-zh/resolve/d55f726a84aa2c17186c49d20fc35cf49c633f0e/layazh-0.1.0-py3-none-any.whl
- Proyecto upstream (Laya, inglés): https://huggingface.co/convaiinnovations/laya
- Encoder base (chino): https://huggingface.co/hfl/chinese-roberta-wwm-ext-large
- Contacto para licencia comercial: novaweb6868@outlook.com

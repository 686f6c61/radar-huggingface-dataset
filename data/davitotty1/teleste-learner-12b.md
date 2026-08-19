# Davitotty1/Teleste-Learner-12B

## Resumen

Teleste-Learner-12B es un adaptador LoRA de 4 bits (QLoRA) sobre el modelo base Gemma 4 12B Instruct, desarrollado por Davitotty1. Su propósito es que el modelo se adapte dinámicamente a la petición actual de la conversación, infiriendo reglas, formatos o procedimientos a partir de los ejemplos y mensajes del contexto inmediato, en lugar de asumir una tarea fija predefinida. Esto se conoce como inducción de tareas en contexto (in-context task induction).

El modelo está entrenado con aproximadamente mil trazas escritas a mano que cubren tareas inventadas, cambios de reglas a mitad de conversación, auto-verificaciones, restricciones apiladas y correcciones. No es un agente general con memoria persistente ni un especialista en un dominio concreto; su valor reside en seguir contratos de salida definidos por el usuario en cada conversación. El adaptador pesa 0,3 GB y se distribuye bajo licencia Apache 2.0, heredada de Gemma 4.

La relevancia actual de este modelo radica en su enfoque poco común: en lugar de fine-tuning para una tarea específica, se entrena para aprender a aprender reglas nuevas sobre la marcha. Esto lo hace útil para prototipos de asistentes que necesitan cambiar de comportamiento sin reentrenamiento, aunque su ventana de contexto es limitada (2048 tokens) y no se han publicado benchmarks formales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4 12B Instruct) con adaptador LoRA |
| Parametros totales | 12 000 millones (modelo base) + adaptador LoRA (rank 16, alpha 16) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | 4-bit QLoRA (entrenamiento); el adaptador se puede cargar sobre el base en bfloat16 o cuantizado |
| Idiomas soportados | ingles (segun model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo base es Gemma 4 12B Instruct, una arquitectura transformer densa con canales de pensamiento nativos (thought channels) que permiten razonamiento interno antes de responder. Sobre este base se aplica un adaptador LoRA de rango 16 y alpha 16, entrenado con QLoRA en 4 bits, afectando solo a las capas de texto. El entrenamiento se realizo con supervisión de chat (SFT) sobre los tokens de asistente, con un contexto de 2048 tokens, en una GPU Tesla T4 de Kaggle usando Unsloth FastModel.

El dataset de entrenamiento consiste en aproximadamente 1000 trazas escritas a mano que simulan escenarios de adaptación: tareas inventadas con pocos ejemplos, cambios de reglas a mitad de conversación, auto-verificaciones, restricciones apiladas, especificaciones confusas, interrupciones de tema y correcciones. No se incluyó relleno de tareas públicas tipo Super-NaturalInstructions en esta versión (v2). El objetivo es que el modelo infiera el contrato de salida a partir de la conversación actual y lo aplique, descartando reglas anteriores si el usuario las cambia.

## Capacidades

- Inducción de tareas en contexto: infiere reglas, formatos o mapeos a partir de pocos ejemplos etiquetados en la conversación.
- Seguimiento de procedimientos definidos por el usuario: cifrados, filtros, esquemas de salida, formatos estrictos.
- Cambio de comportamiento dinámico: si un mensaje posterior reemplaza la regla, el modelo abandona la anterior y aplica la nueva.
- Auto-verificación: comprueba la respuesta contra el contrato inferido antes de finalizar.
- Canales de pensamiento nativos de Gemma 4: puede emitir un bloque de razonamiento interno antes de la respuesta final.
- Generación de texto conversacional en ingles, con soporte de chat multi-turno.
- No incluye capacidades de vision, audio ni tool calling explícitas (no documentadas).

## Casos de uso

- Transformación de datos ad-hoc: dado un mapeo inventado (por ejemplo, "oak -> O1K, maple -> M3E"), el modelo aplica la regla a nuevas entradas sin necesidad de programar la lógica.
- Formateo de salidas según esquema: se le pide que devuelva resultados en un formato concreto (JSON, CSV, lista numerada) y el modelo respeta el contrato definido en el prompt.
- Filtrado de información con reglas cambiantes: en una conversación de soporte, el usuario puede definir un criterio de filtrado y luego cambiarlo a mitad de chat; el modelo se adapta al nuevo criterio.
- Asistentes de productividad con instrucciones efímeras: crear listas, resúmenes o traducciones siguiendo un estilo o restricción indicada en el momento.
- Prototipos de agentes conversacionales con comportamiento configurable: sin reentrenar, se puede alternar entre tareas (resumir, clasificar, extraer) simplemente cambiando las instrucciones en el prompt.
- Evaluación de modelos de inducción de tareas: útil para investigar hasta qué punto un LLM puede inferir reglas a partir de ejemplos ambiguos o contradictorios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K, ni comparaciones cuantitativas con otros modelos. El autor solo menciona que la versión v2 supera a la v1 (basada en Qwen3.5-4B) en calidad de las trazas, pero sin datos numéricos.

## Requisitos de hardware

- El adaptador LoRA pesa 0,3 GB, pero requiere cargar el modelo base Gemma 4 12B Instruct.
- En bfloat16, el modelo base ocupa aproximadamente 24 GB de VRAM, por lo que se necesita una GPU con al menos 24 GB (por ejemplo, RTX 3090, RTX 4090, A10G, A100 40GB).
- Con cuantización 4-bit del modelo base (por ejemplo, mediante bitsandbytes o GPTQ), la VRAM necesaria baja a unos 8-10 GB, permitiendo ejecución en GPUs de consumo como RTX 3060 12GB o RTX 4070.
- El autor entrenó en una Tesla T4 (16 GB) usando QLoRA, lo que sugiere que la inferencia con cuantización es viable en hardware similar.
- Opciones de despliegue: transformers + PEFT (como en el ejemplo de la model card), vLLM (si se fusionan los pesos), llama.cpp (si se convierte a GGUF), Ollama (si se empaqueta).
- Latencia y throughput estimados: no disponibles; dependerán de la GPU y de la cuantización elegida.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar con alternativas. El propio autor menciona una versión anterior, Teleste-Learner-4B, basada en Qwen3.5-4B, pero no publica métricas. Como referencia cualitativa:

| Modelo | Base | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|
| Teleste-Learner-12B | Gemma 4 12B Instruct | 12B | 2048 | Apache 2.0 | Induccion de tareas en contexto |
| Teleste-Learner-4B | Qwen3.5-4B | 4B | no disponible | no disponible | Induccion de tareas en contexto |
| Gemma 4 12B Instruct (base) | - | 12B | no disponible (mayor que 2048) | Apache 2.0 | Chat generalista |

La comparación con el modelo base es la más relevante: Teleste-Learner-12B está especializado en adaptarse a reglas definidas por el usuario, mientras que el base responde de forma generalista sin ese comportamiento específico. No hay datos objetivos que permitan afirmar superioridad en tareas estándar.

## Limitaciones y advertencias

- No es un agente general: no tiene memoria entre sesiones ni capacidad de aprendizaje en línea; solo se adapta al contexto de la conversación actual.
- Riesgo de alucinación en reglas ambiguas: si los ejemplos son contradictorios o insuficientes, el modelo puede inventar una regla incorrecta.
- Ventana de contexto limitada a 2048 tokens, lo que restringe la cantidad de ejemplos o instrucciones que se pueden proporcionar.
- Solo soporta ingles; no se documenta capacidad multilingüe.
- El adaptador requiere el modelo base Gemma 4 12B Instruct, que no está incluido en el repositorio; hay que descargarlo por separado.
- No se han publicado benchmarks ni evaluaciones de sesgos; se desconoce su comportamiento en dominios sensibles (medicina, derecho, etc.).
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar el cumplimiento de la licencia del modelo base (Gemma 4) si se redistribuye.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Davitotty1/Teleste-Learner-12B
- Versión anterior (4B): https://huggingface.co/Davitotty1/Teleste-Learner-4B
- Perfil de GitHub del autor: https://github.com/davitotty
- Modelo base Gemma 4 12B Instruct: https://huggingface.co/google/gemma-4-12B-it

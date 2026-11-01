# ChopGuard/ChopGuard-CRUD

## Resumen

ChopGuard-CRUD es un clasificador de texto de tipo encoder fine-tuneado a partir de convaiinnovations/laya, un motor de decisión no autorregresivo denominado System 1. Su tarea concreta es mapear comandos de línea de comandos (CLI) a una de cuatro categorías CRUD: crear, leer, actualizar o eliminar. El modelo lo publica el usuario ChopGuard (autoría de Daniel Flores) y está pensado como capa de guardrail para agentes LLM que ejecutan comandos de shell.

El problema que aborda es el de control de acceso basado en roles (RBAC) para agentes autónomos. En contextos largos, los LLM tienden a olvidar herramientas especializadas y recurrir a comandos CLI genéricos, algunos potencialmente destructivos. Ejecutar inferencia completa del LLM para inspeccionar cada comando sería demasiado lento, de ahí la aproximación de clasificación ligera previa a la ejecución.

Arquitectura ModernBERT (según la model card, base jhu-clsp/mmBERT-base) sobre el framework laya, con licencia Apache 2.0, soporte declarado de inglés y español, y un tamaño de repositorio de 1,3 GB. Es un modelo pequeño y especializado, no un LLM generativo: su valor está en la latencia baja y la integración como filtro determinista dentro de bucles de agentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer), framework laya (System 1, no autorregresivo) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors) |
| Idiomas soportados | en, es |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (fichero `ChopGuard_CRUD_20261018.safetensors`) |

## Arquitectura y entrenamiento

El modelo parte de convaiinnovations/laya, descrito por sus autores como un motor de decisión System 1 rápido y no autorregresivo. La model card indica que la base es ModernBERT, concretamente jhu-clsp/mmBERT-base, lo que sitúa al clasificador en la familia de encoders bidireccionales con atención eficiente, adecuados para clasificación de secuencias cortas como comandos CLI.

El fine-tuning se orientó a clasificación CRUD con cuatro etiquetas (create, read, update, delete). Según la model card, el conjunto de entrenamiento se construyó a partir de los comandos de bucle de agente más comunes y se extendió a otras familias de CLI. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO; al tratarse de una tarea de clasificación supervisada, lo habitual sería entrenamiento con pérdida de entropía cruzada, pero este dato no está confirmado en la información disponible. Tampoco se detalla ninguna innovación técnica adicional más allá del enfoque no autorregresivo heredado de laya.

## Capacidades

- Clasificación de comandos CLI en cuatro categorías CRUD: create, read, update y delete.
- Detección de operaciones potencialmente destructivas (delete) con alta precisión según la model card (99,5 %).
- Identificación de operaciones de inspección seguras (read) con 98,9 % de precisión reportada.
- Soporte bilingüe declarado: inglés y español.
- Integración como guardrail previo a la ejecución en bucles de agentes y harness tipo Claude Mods.
- Uso como componente de reglas CLI construidas sobre la taxonomía CRUD.
- Salida estructurada mediante el esquema de `choice` del framework laya, con instrucciones y criterios configurables.
- No soporta generación de texto libre, tool calling generativo, visión, audio ni razonamiento multi-paso; es exclusivamente un clasificador.

## Casos de uso

- Guardrail de ejecución en agentes autónomos: antes de que un agente ejecute un comando de shell, el clasificador etiqueta la operación y el orquestador puede bloquear o requerir confirmación humana para las categorías update y delete, reduciendo el riesgo de acciones irreversibles.
- Integración en harness de asistentes de código: en entornos tipo Claude Mods, el modelo actúa como filtro rápido que marca los one-liners que requieren inspección manual, dado que los comandos generados por LLM pueden ser demasiado largos para revisión visual.
- Políticas de RBAC para CLI: construir reglas del tipo "permitir read y create automáticamente, exigir aprobación para update y delete" sobre la salida del clasificador, con la ventaja de que la clasificación es mucho más rápida que una inferencia completa del LLM.
- Auditoría y registro de acciones de agentes: etiquetar cada comando ejecutado por un agente en producción para generar trazas clasificadas por impacto y facilitar revisiones de seguridad posteriores.
- Enrutamiento de comandos en pipelines de CI/CD: clasificar scripts y comandos introducidos por operadores o por agentes antes de su ejecución en entornos de integración, bloqueando automáticamente los de tipo delete sobre recursos compartidos.
- Protección en interfaces de usuario conversacionales: cuando un asistente propone un comando CLI al usuario, el clasificador puede mostrar una advertencia visual si la operación es de tipo update o delete, mejorando la seguridad percibida sin añadir latencia significativa.
- Filtrado previo en sistemas multiagente: un agente supervisor puede usar el clasificador para decidir si delega la ejecución de un comando a un agente con permisos elevados o si lo rechaza directamente.

## Benchmarks y rendimiento

La model card reporta resultados sobre un conjunto de test reservado. Solo se dispone de precisión global y por clase; no hay comparación con otros modelos en la información proporcionada.

| Metrica | Valor |
|---|---|
| Precision global (accuracy) | ~83,7 % |
| Precision clase delete | 99,5 % |
| Precision clase read | 98,9 % |
| Precision clase create | no disponible (concentra la mayoría de errores junto con update) |
| Precision clase update | no disponible (concentra la mayoría de errores junto con create) |

Los errores se concentran en la frontera create ↔ update, lo que el autor atribuye al solapamiento semántico entre crear y modificar recursos. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales, y no tendrían sentido para un clasificador especializado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 1,3 GB, lo que sugiere que el modelo cabe holgadamente en GPUs de consumo, aunque el tamaño exacto de parámetros no se detalla.
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de VRAM; el ejemplo de uso de la model card emplea `device="cuda"` sin especificar modelo de tarjeta.
- Compatibilidad con GPU de consumo: previsiblemente sí (RTX 3060, RTX 4090 y similares), dado el tamaño del repositorio y la naturaleza de encoder de la base ModernBERT, aunque no hay cifras oficiales.
- Opciones de despliegue: el framework laya (`from laya import Agent`), con carga directa del fichero safetensors. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y al no ser un modelo generativo autoregresivo es poco probable que esos motores estándar lo soporten sin adaptación.
- Latencia y throughput: no disponibles. El autor justifica el enfoque CRUD precisamente por ser más rápido que una inferencia completa del LLM, pero no aporta cifras.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Como referencia de categoría, se puede señalar lo siguiente, aunque los datos de los alternativas no proceden de la información facilitada y deben verificarse:

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ChopGuard-CRUD | Clasificador CRUD sobre ModernBERT/laya | no disponible | no disponible | Apache 2.0 | HuggingFace |
| convaiinnovations/laya (base) | Motor de decisión System 1 | no disponible | no disponible | no disponible | HuggingFace |
| Clasificadores BERT genéricos | Encoder de clasificación | variable | 512 típicamente | variable | HuggingFace |

No hay benchmarks comunes publicados que permitan una comparación cuantitativa rigurosa con alternativas.

## Limitaciones y advertencias

- Precisión global moderada (~83,7 %): aproximadamente uno de cada seis comandos se clasifica de forma incorrecta, con riesgo de falsos negativos en operaciones destructivas.
- Confusión sistemática entre create y update: comandos que crean o modifican recursos pueden etiquetarse erróneamente, lo que afecta a las políticas que distingan entre ambas categorías.
- Cobertura limitada de familias CLI: el entrenamiento se centró en comandos comunes de bucles de agente y se extendió a otras familias, pero no hay garantía de cobertura para CLIs poco habituales.
- Idiomas: solo inglés y español declarados; comandos con texto en otros idiomas pueden degradar la clasificación.
- No es un modelo generativo: no puede explicar su decisión ni razonar sobre el contexto de la conversación, solo asignar una etiqueta.
- Riesgo de dependencia excesiva: usar el clasificador como único guardrail puede dar falsa sensación de seguridad; conviene combinarlo con listas de comandos prohibidos y confirmación humana.
- Sesgos: no se documentan análisis de sesgo; al entrenarse sobre comandos de agente, puede heredar la distribución de herramientas y patrones de uso de ese corpus.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base laya y de ModernBERT (jhu-clsp/mmBERT-base) por si imponen restricciones adicionales.
- Fecha de creación inusualmente futura en los metadatos (2026): verificar la procedencia y vigencia del repositorio antes de integrarlo en producción.
- Sin datos de contexto máximo: comandos muy largos o pipelines complejos podrían truncarse; no se especifica el límite.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ChopGuard/ChopGuard-CRUD
- Modelo base laya: https://huggingface.co/convaiinnovations/laya
- Demo en vídeo: https://www.youtube.com/watch?v=kTXpCUOJoVs
- Repositorio del framework laya: no disponible en la información proporcionada
- Paper de ModernBERT / mmBERT-base: no disponible en la información proporcionada

# artindnr/Strawberry-2-adapter

## Resumen

Strawberry-2-adapter es un adaptador LoRA (Low-Rank Adaptation) desarrollado por artindnr para el modelo base unsloth/gpt-oss-120b-unsloth-bnb-4bit. Se publica en formato PEFT con pesos safetensors y un tamaño de repositorio de 4.3 GB. El adaptador está orientado a generación de texto conversacional y forma parte de una colección de modelos de razonamiento multilingües llamada Strawberry. Al ser un adaptador, no funciona de forma independiente: debe combinarse con el modelo base para realizar inferencia. La información disponible no especifica los datos de entrenamiento, la licencia ni las capacidades concretas del adaptador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre GPT-OSS-120B |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (adaptador LoRA) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Modelo base cuantizado a 4 bits (bnb-4bit); adaptador en safetensors sin cuantizacion propia |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador PEFT LoRA entrenado mediante fine-tuning supervisado (SFT) con las librerías TRL y Unsloth. Se aplica sobre el modelo base GPT-OSS-120B cuantizado a 4 bits (bnb-4bit). La versión de PEFT utilizada es 0.20.0. No se han publicado detalles sobre la composición del dataset de entrenamiento, el número de tokens, los hiperparámetros ni si se aplicaron técnicas como RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas del adaptador.

## Capacidades

- Generación de texto conversacional (pipeline text-generation).
- Forma parte de una colección de modelos de razonamiento multilingües, según la descripción del autor, aunque no se han publicado pruebas de rendimiento en tareas multilingües.
- No hay información sobre soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modos especiales como thinking mode.
- Al ser un adaptador sobre GPT-OSS-120B, se espera que herede las capacidades del modelo base, pero no existe confirmación oficial en la información disponible.

## Casos de uso

No se han publicado casos de uso específicos para este adaptador. Dado que se basa en un modelo de 120B, los casos de uso potenciales serían los propios del modelo base, pero no están verificados. A continuación se enumeran aplicaciones hipotéticas, sin que exista documentación que las respalde:

- Asistencia conversacional en entornos de producción: el adaptador podría integrarse en un sistema de chat para especializar el modelo base en un dominio concreto, aunque se requiere validación previa.
- Razonamiento sobre documentos largos: si el modelo base mantiene su ventana de contexto, podría emplearse para tareas de análisis de documentos, pero no hay datos que confirmen la longitud de contexto del adaptador.
- Generación de código asistida: el modelo base GPT-OSS-120B es capaz de generar código, por lo que un adaptador podría ajustarlo a un estilo o framework específico. No hay evidencia de que este adaptador lo haga.
- Traducción automática: al pertenecer a una colección de modelos multilingües, podría utilizarse para traducción, pero no se han publicado pruebas.
- Resumen de texto: el adaptador podría entrenarse para resumir documentos, aunque no hay información sobre el dataset utilizado.
- Clasificación de texto: mediante fine-tuning con LoRA, podría adaptarse a tareas de clasificación, pero no se han publicado resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- No se han publicado requisitos de hardware oficiales para este adaptador.
- Para su uso es necesario cargar el modelo base unsloth/gpt-oss-120b-unsloth-bnb-4bit, que requiere una GPU con VRAM suficiente para un modelo de 120B en cuantización de 4 bits.
- El adaptador en sí ocupa 4.3 GB en disco, pero no se dispone de datos sobre latencia ni throughput.
- No se especifica si puede ejecutarse en GPUs de consumo. Una fuente externa (LLM Explorer) menciona 41.6 GB de VRAM para el modelo "Strawberry" del mismo autor, pero no se ha confirmado que aplique a este adaptador.

## Comparativa con modelos similares

No se han encontrado modelos comparables documentados en la información disponible. El adaptador no tiene benchmarks ni especificaciones publicadas que permitan una comparación rigurosa. La entrada de LLM Explorer para "Strawberry" (sin el sufijo -2-adapter) reporta 20B de parámetros y 128K de contexto, pero estos datos no se corresponden necesariamente con este adaptador y no han sido confirmados.

## Limitaciones y advertencias

- Licencia no disponible: no se puede determinar si el uso comercial está permitido.
- No hay documentación sobre sesgos, riesgos o limitaciones técnicas.
- El rendimiento del adaptador no está evaluado públicamente, ya que no se han publicado benchmarks.
- El modelo tiene 0 descargas y 0 likes, lo que indica una falta de validación por parte de la comunidad.
- Al ser un adaptador, cualquier error en el modelo base o en el proceso de fine-tuning se trasladará al resultado final.
- La información de terceros (LLM Explorer) sugiere que el modelo "Strawberry" del mismo autor tiene 20B de parámetros y 128K de contexto, pero estos datos no se corresponden necesariamente con este adaptador y no han sido confirmados.

## Enlaces

- HuggingFace: https://huggingface.co/artindnr/Strawberry-2-adapter
- Colección del autor: https://huggingface.co/collections/artindnr/strawberry
- LLM Explorer (entrada para "Strawberry"): https://llm-explorer.com/model/artindnr%2FStrawberry,5W2aWYrUSjOVy2eyXfxtnr

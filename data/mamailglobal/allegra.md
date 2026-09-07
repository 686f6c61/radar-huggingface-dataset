# mamailglobal/Allegra

## Resumen

Allegra es un adaptador LoRA desarrollado por mamailglobal sobre el modelo base DeepSeek-R1-Distill-Llama-8B, una versión destilada de DeepSeek-R1 sobre Llama 8B. Se presenta como un adaptador PEFT de bajo rango, con un tamaño de repositorio de 0.1 GB, entrenado mediante ajuste fino supervisado (SFT) sobre una versión cuantizada a 4 bits del modelo base. El objetivo probable es especializar el modelo base en tareas de generación de texto o razonamiento, aunque no se proporcionan detalles sobre el dataset ni el propósito concreto. Su relevancia actual radica en que permite extender un modelo de razonamiento potente con un coste de almacenamiento mínimo, aprovechando el enfoque de adaptadores de bajo rango.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (adaptador LoRA sobre Llama 8B) |
| Parametros totales | No disponible (el adaptador ocupa 0.1 GB; el modelo base tiene 8B) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se entrenó sobre una base cuantizada a 4 bits con bitsandbytes) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

Allegra es un adaptador LoRA de bajo rango, creado con la librería PEFT. El modelo base es DeepSeek-R1-Distill-Llama-8B, un transformer basado en la arquitectura Llama que ha sido destilado a partir de DeepSeek-R1. El adaptador fue entrenado mediante ajuste fino supervisado (SFT) utilizando las librerías TRL y unsloth, sobre una versión cuantizada a 4 bits (bnb-4bit) del modelo base. No se han publicado detalles sobre el dataset de entrenamiento, los hiperparámetros utilizados ni el número de tokens. Tampoco se mencionan innovaciones técnicas adicionales más allá del uso de LoRA y cuantización de 4 bits durante el entrenamiento.

## Capacidades

No disponible. La información proporcionada no documenta capacidades específicas del adaptador. Al estar basado en DeepSeek-R1-Distill-Llama-8B, hereda la arquitectura del modelo base, pero no se puede confirmar que las capacidades de razonamiento, generación de código o soporte de tool calling se mantengan en el adaptador. No se dispone de información sobre soporte de agentes, multimodalidad o modos especiales de inferencia.

## Casos de uso

No disponible. No se han documentado casos de uso concretos en la información proporcionada. Para cualquier aplicación práctica sería necesario evaluar el adaptador en el contexto del modelo base, pero no existe evidencia pública de su rendimiento en tareas específicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

No disponible en la información proporcionada. El adaptador es un archivo PEFT de 0.1 GB y no es ejecutable por sí solo; requiere cargar el modelo base unsloth/DeepSeek-R1-Distill-Llama-8B. Para conocer los requisitos de hardware se debe consultar la documentación del modelo base. Como referencia general, un modelo de 8B con cuantización a 4 bits puede requerir entre 6 y 12 GB de VRAM en GPU de consumo, pero no hay datos oficiales para este adaptador.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables con información suficiente en los datos proporcionados. Tampoco se dispone de benchmarks que permitan una comparación objetiva.

## Limitaciones y advertencias

- La model card está vacía en su mayor parte; no se han documentado sesgos, riesgos ni limitaciones del adaptador.
- La licencia no está disponible, lo que impide confirmar si el uso comercial está permitido.
- No se ha publicado información sobre el dataset de entrenamiento, lo que dificulta evaluar posibles sesgos o riesgos de alucinación.
- El modelo es un adaptador de bajo rango; su rendimiento depende en gran medida del modelo base y de la calidad de los datos de ajuste.
- Al no existir documentación técnica detallada, su uso en producción requiere una evaluación previa completa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mamailglobal/Allegra
- Model card: https://huggingface.co/mamailglobal/Allegra
- No se han encontrado otros enlaces relevantes (papers, blogs, repositorios o demos) en la búsqueda web.

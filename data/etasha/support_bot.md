# Etasha/support_bot

## Resumen

El modelo `Etasha/support_bot` es un fine-tune del modelo base `unsloth/Llama-3.2-3B-Instruct-bnb-4bit`, desarrollado por el usuario Etasha. Está diseñado específicamente para tareas de soporte o atención al cliente, como su nombre indica, aunque la model card no proporciona detalles sobre el conjunto de datos de entrenamiento ni las tareas concretas. Se entrenó utilizando la librería Unsloth, que acelera el fine-tuning de modelos Llama, y la librería TRL (Transformer Reinforcement Learning) de Hugging Face.

Al estar basado en Llama 3.2 de 3 mil millones de parámetros, es un modelo relativamente pequeño que puede ejecutarse en hardware de consumo, lo que lo hace atractivo para despliegues en entornos con recursos limitados. La licencia Apache 2.0 permite uso comercial sin restricciones significativas. Sin embargo, la información pública es muy escasa: no se especifican datos de entrenamiento, benchmarks ni capacidades adicionales más allá de las heredadas del modelo base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Llama 3.2) |
| Parametros totales | 3 mil millones (aprox., del modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base soporta 128k, pero no se confirma para este fine-tune) |
| Tipos de cuantizacion | No disponible (el modelo base usa bnb-4bit, pero el repo no especifica) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (según tags) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de `unsloth/Llama-3.2-3B-Instruct-bnb-4bit`, que a su vez es una versión cuantizada a 4 bits del Llama 3.2 Instruct de 3B. La arquitectura subyacente es un transformer decoder-only con atención causal, típico de la familia Llama. El entrenamiento se realizó con Unsloth, que optimiza el proceso de fine-tuning mediante kernels eficientes y reducción de memoria, y con TRL, que permite técnicas como SFT, DPO o RLHF. Sin embargo, la model card no especifica qué método de entrenamiento se utilizó (SFT, DPO, etc.) ni la composición del dataset. Tampoco se indica el número de tokens de entrenamiento ni si se aplicaron técnicas de alineación adicionales.

## Capacidades

- Generación de texto y seguimiento de instrucciones: heredadas del modelo base Llama 3.2 Instruct.
- Razonamiento básico y respuesta a preguntas: capacidades generales del modelo base.
- Soporte multilingüe: limitado al inglés, según la etiqueta `language: en`.
- No se dispone de información sobre tool calling, function calling, capacidades de agente o modos de razonamiento extendido (thinking mode) para este fine-tune concreto.

## Casos de uso

Dado que el nombre del modelo sugiere un bot de soporte, se pueden plantear los siguientes escenarios, aunque no hay confirmación explícita de que el fine-tune haya sido optimizado para ellos:

- Atención al cliente automatizada: el modelo podría gestionar conversaciones de soporte en inglés, respondiendo a preguntas frecuentes y guiando a los usuarios. Su tamaño reducido permite desplegarlo en servidores modestos o incluso en edge.
- Asistente virtual en sitios web: integración en widgets de chat para resolver consultas básicas sin intervención humana.
- Clasificación y derivación de tickets: dado su entrenamiento en instrucciones, podría categorizar consultas y derivarlas a agentes humanos cuando sea necesario.
- Generación de respuestas estandarizadas: para equipos de soporte que necesitan redactar respuestas coherentes y consistentes.
- Prototipado rápido de chatbots: al ser un modelo pequeño y con licencia permisiva, es adecuado para pruebas de concepto en entornos de desarrollo.
- Fine-tuning adicional: al ser un modelo abierto, puede servir como punto de partida para adaptarlo a dominios específicos de soporte (banca, telecomunicaciones, etc.).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras métricas para este fine-tune concreto. El rendimiento dependerá en gran medida del modelo base Llama 3.2 Instruct, pero no se puede afirmar nada específico sin evaluaciones propias.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 3B con cuantización de 4 bits (según el modelo base), la inferencia puede requerir aproximadamente 2-4 GB de VRAM, dependiendo de la longitud de contexto y la implementación.
- GPU recomendadas: tarjetas consumer como NVIDIA RTX 3060 (12 GB), RTX 4060, o incluso CPUs con suficiente RAM para cargas pequeñas. Para producción con mayor concurrencia, se recomienda una GPU con al menos 8 GB de VRAM.
- Compatibilidad con consumer GPU: sí, es viable en GPUs de gama media y baja.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI (Text Generation Inference), o directamente con transformers.
- Latencia y throughput: no disponibles. Se estima una latencia de decenas de milisegundos por token en GPU consumer, pero no hay datos medidos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Etasha/support_bot | 3B | No disponible | Apache 2.0 | Hugging Face |
| unsloth/Llama-3.2-3B-Instruct-bnb-4bit | 3B | 128k (base) | Apache 2.0 | Hugging Face |
| Llama-3.2-3B-Instruct (original) | 3B | 128k | Llama 3.2 Community License | Hugging Face |

No se dispone de datos de rendimiento comparativo. La principal diferencia entre el fine-tune y el modelo base es el entrenamiento adicional, pero sin información sobre el dataset no se puede evaluar la mejora.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo base Llama 3.2 puede presentar sesgos sociales, de género o culturales, que probablemente se mantienen en el fine-tune.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir información falsa o inventada, especialmente en dominios no cubiertos por su entrenamiento.
- Limitaciones de idioma: solo soporta inglés, lo que limita su uso en entornos multilingües.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe mantener el aviso de copyright y la atribución.
- Caveat para producción: al no haber benchmarks ni documentación sobre el dataset, no se recomienda su uso en producción sin una evaluación exhaustiva previa. La calidad del fine-tune es desconocida.

## Enlaces

- [Hugging Face - Etasha/support_bot](https://huggingface.co/Etasha/support_bot)
- [Unsloth (librería de entrenamiento)](https://github.com/unslothai/unsloth)
- [Modelo base: unsloth/Llama-3.2-3B-Instruct-bnb-4bit](https://huggingface.co/unsloth/Llama-3.2-3B-Instruct-bnb-4bit)

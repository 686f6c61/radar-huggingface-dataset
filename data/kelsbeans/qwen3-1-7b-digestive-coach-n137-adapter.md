# kelsbeans/qwen3-1.7b-digestive-coach-n137-adapter

## Resumen

El modelo `kelsbeans/qwen3-1.7b-digestive-coach-n137-adapter` es un adaptador (LoRA) de fine-tuning sobre el modelo base `unsloth/qwen3-1.7b-unsloth-bnb-4bit`, que corresponde a la arquitectura Qwen3-1.7B en cuantización de 4 bits. Fue desarrollado por el usuario kelsbeans y publicado bajo licencia Apache 2.0. Según la model card, se entrenó con la librería Unsloth (que acelera el entrenamiento) y con TRL de Hugging Face. El nombre sugiere que está orientado a un "coach digestivo" (asistente de salud digestiva), aunque no se detalla su funcionalidad específica. El repositorio tiene un tamaño de 0.1 GB, lo que indica que es un adaptador de pequeño tamaño. No se proporcionan datos de rendimiento, benchmarks ni casos de uso documentados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: Qwen3-1.7B) |
| Parametros totales | no disponible (el repo pesa 0.1 GB) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el modelo base es bnb-4bit) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un adaptador de fine-tuning (tipo LoRA, inferido por el nombre "adapter" y el tamaño reducido del repositorio) sobre el modelo base `unsloth/qwen3-1.7b-unsloth-bnb-4bit`. Según la model card, fue entrenado con Unsloth (que optimiza el entrenamiento) y con la librería TRL de Hugging Face. No se especifican el dataset utilizado, el número de tokens de entrenamiento, ni si se aplicaron técnicas como RLHF o DPO. La arquitectura interna del adaptador no se documenta en la información disponible.

## Capacidades

No se han documentado capacidades específicas en la información proporcionada. El modelo hereda las capacidades del modelo base Qwen3-1.7B (generación de texto, razonamiento, etc.), pero no se especifica si el adaptador añade o modifica alguna funcionalidad concreta. No se menciona soporte de tool calling, agentes, visión, audio ni otras capacidades especiales.

## Casos de uso

No se han documentado casos de uso en la información disponible. El nombre "digestive-coach" sugiere una aplicación como asistente de salud digestiva, pero no se proporcionan detalles sobre su funcionamiento ni sobre escenarios de uso reales. Sin más datos, no es posible enumerar casos de uso concretos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

No se especifican requisitos de hardware en la información proporcionada. El adaptador pesa 0.1 GB, por lo que es ligero, pero el modelo base Qwen3-1.7B requiere una GPU con suficiente VRAM para inferencia (típicamente 4-6 GB en cuantización 4-bit). No se indican opciones de despliegue, latencia ni throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este adaptador con otros modelos de la misma categoría. No se conocen alternativas equivalentes (adaptadores LoRA sobre Qwen3-1.7B con orientación a salud digestiva) en la información proporcionada.

## Limitaciones y advertencias

- No se documentan sesgos, riesgos de alucinación ni limitaciones de contexto.
- El modelo está etiquetado solo en inglés (`en`), por lo que su uso en otros idiomas no está garantizado.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos completos.
- Al ser un adaptador sobre un modelo base, las limitaciones del modelo base (Qwen3-1.7B) se aplican, aunque no se detallan en esta ficha.
- No se han publicado evaluaciones de seguridad ni pruebas en producción.

## Enlaces

- [Hugging Face - kelsbeans/qwen3-1.7b-digestive-coach-n137-adapter](https://huggingface.co/kelsbeans/qwen3-1.7b-digestive-coach-n137-adapter)
- [Modelo relacionado: kelsbeans/qwen3-1.7b-digestive-coach-n390-adapter](https://huggingface.co/kelsbeans/qwen3-1.7b-digestive-coach-n390-adapter)
- [Modelo relacionado: kelsbeans/qwen3-1.7b-digestive-coach-n97-adapter](https://huggingface.co/kelsbeans/qwen3-1.7b-digestive-coach-n97)
- [FriendliAI - qwen3-1.7b-digestive-coach-n97](https://friendli.ai/models/kelsbeans/qwen3-1.7b-digestive-coach-n97)
- [Ollama - qwen3:1.7b](https://ollama.com/library/qwen3:1.7b)

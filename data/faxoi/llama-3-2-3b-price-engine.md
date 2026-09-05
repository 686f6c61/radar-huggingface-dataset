# faxoi/llama-3.2-3b-price-engine

## Resumen

Llama 3.2 3B Price Engine es un modelo de lenguaje fine-tuneado a partir de `unsloth/Llama-3.2-3B-Instruct-bnb-4bit`, desarrollado por el usuario faxoi. Se trata de un ajuste fino orientado a tareas de precios, tal y como sugiere el nombre "price-engine", aunque la model card no especifica el dataset ni el dominio exacto de aplicación. El modelo conserva la arquitectura Llama 3.2 de Meta, con 3.212.749.824 parámetros y una ventana de contexto de 128K tokens heredada del modelo base. Está publicado bajo licencia Apache 2.0 y en formato safetensors, listo para su uso con la librería Transformers. Su relevancia radica en ser un ejemplo de fine-tuning eficiente con Unsloth, que reduce el tiempo de entrenamiento, aunque no se han publicado benchmarks que validen su rendimiento real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2) |
| Parametros totales | 3.212.749.824 (3.2B) |
| Longitud de contexto | 128K tokens (modelo base Llama 3.2 3B Instruct) |
| Tipos de cuantizacion | FP16/BF16 (safetensors); el modelo base se entrenó en bnb-4bit |
| Idiomas soportados | Inglés (según tags) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de Llama 3.2 3B Instruct, un transformer decoder-only con atención causal estándar, normalización RMSNorm y capas de atención por grupos de consultas (GQA). El entrenamiento se realizó con Unsloth y la librería TRL de HuggingFace, lo que permitió un ajuste fino aproximadamente 2x más rápido que los métodos convencionales. El modelo base se cargó en cuantización 4-bit (bnb-4bit) durante el entrenamiento, pero los pesos finales se subieron en safetensors de precisión completa, con un tamaño de repositorio de 6.4 GB. No se proporcionan detalles sobre el dataset de fine-tuning, el número de tokens de entrenamiento ni si se aplicaron técnicas de alineación como RLHF o DPO. La model card únicamente indica que se trata de un modelo conversacional en inglés, etiquetado como "price-engine".

## Capacidades

- Generación de texto e instrucciones conversacionales en inglés.
- Herencia de las capacidades del modelo base Llama 3.2 3B Instruct, que incluyen razonamiento básico, generación de código y soporte de tool calling / function calling.
- Ventana de contexto de 128K tokens, lo que permite procesar documentos largos y conversaciones multi-turno.
- No se ha documentado si el fine-tuning ha preservado todas las capacidades originales del modelo base.
- No hay información sobre capacidades multimodales, de visión o de audio; el modelo base es exclusivamente de texto.
- Al ser un fine-tune específico, es probable que esté optimizado para tareas de precios, aunque no hay datos que confirmen su comportamiento.

## Casos de uso

- Estimación de precios en comercio electrónico: el modelo podría emplearse para generar respuestas sobre políticas de precios, descuentos o devoluciones en inglés, aunque no hay datos que validen su precisión.
- Atención al cliente automatizada: gracias a su naturaleza instruct y su ventana de contexto de 128K, podría gestionar conversaciones multi-turno en inglés, siempre que se realice una evaluación adicional.
- Generación de código de apoyo: como hereda las capacidades de Llama 3.2, podría asistir en tareas de programación sencillas, aunque el fine-tuning puede haber degradado este aspecto.
- Análisis de documentos extensos: su contexto largo permite procesar políticas de devolución, contratos o manuales de usuario, pero requiere pruebas de rendimiento.
- Prototipado rápido con Unsloth: sirve como ejemplo de fine-tuning eficiente para investigadores que quieran replicar el proceso con técnicas de cuantización 4-bit.
- Integración en pipelines de texto: se puede desplegar con vLLM, TGI o Transformers para tareas de generación de texto en inglés en entornos de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16, aproximadamente 6.4 GB para los pesos, más overhead de activaciones y KV cache, lo que supone un total de 8-10 GB. Con cuantización 4-bit, la VRAM necesaria se reduce a unos 2-3 GB.
- GPU recomendadas: RTX 4060 (8 GB) para FP16; RTX 4090 o A100 para mayor throughput en despliegues concurrentes.
- Compatibilidad con GPU de consumo: sí, con 8 GB o más en FP16; con cuantización 4-bit, puede ejecutarse en GPUs de 4 GB.
- Opciones de despliegue: Transformers, vLLM, llama.cpp (previa conversión a GGUF), Ollama y TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| faxoi/llama-3.2-3b-price-engine | 3.2B | 128K | Apache 2.0 | Safetensors |
| unsloth/Llama-3.2-3B-Instruct | 3.2B | 128K | Apache 2.0 | Safetensors |
| Qwen2.5-3B-Instruct | 3.1B | 32K (hasta 128K) | Apache 2.0 | Safetensors |
| Gemma-2-2B-it | 2.6B | 8K | Gemma Terms | Safetensors |

No se dispone de datos de benchmarks comparativos para el modelo fine-tuneado, por lo que la comparativa se limita a parámetros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- No hay documentación sobre el dataset de entrenamiento, lo que dificulta evaluar sesgos, riesgos de alucinación o el dominio de aplicación real.
- El modelo solo está etiquetado en inglés, por lo que su rendimiento en otros idiomas es desconocido.
- Al ser un fine-tune no validado con benchmarks públicos, existe un riesgo alto de alucinación y de degradación de capacidades generales respecto al modelo base.
- No se han publicado resultados de evaluación, por lo que no se puede garantizar su calidad en producción.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías de soporte ni de mantenimiento.
- El modelo está publicado con 0 descargas y 0 likes, lo que indica una adopción nula y una validación comunitaria inexistente.

## Enlaces

- HuggingFace: https://huggingface.co/faxoi/llama-3.2-3b-price-engine
- Modelo base (unsloth): https://huggingface.co/unsloth/Llama-3.2-3B-Instruct-bnb-4bit
- Repositorio de Llama 3.2 en Meta: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Unsloth: https://github.com/unslothai/unsloth
- TRL: https://github.com/huggingface/trl

# iulio/FiscMind-12B-GGUF

## Resumen

FiscMind-12B-GGUF es un modelo de lenguaje fine-tuneado y convertido a formato GGUF mediante la librería Unsloth. El autor es iulio, y el modelo está alojado en HuggingFace. Aunque la model card no proporciona detalles sobre el fine-tuning, el nombre del archivo (`mistral-nemo-instruct-2407.Q4_K_M.gguf`) indica que se trata de una cuantización Q4_K_M del modelo Mistral NeMo Instruct 2407, un transformer de 12 000 millones de parámetros desarrollado por Mistral AI en colaboración con NVIDIA. El modelo está orientado a tareas conversacionales, como refleja la etiqueta `conversational`, y es compatible con endpoints, lo que facilita su despliegue en entornos de producción.

La relevancia de este modelo radica en su formato GGUF, que permite ejecutarlo eficientemente en CPU y GPU mediante llama.cpp, Ollama y otras herramientas compatibles. Al estar basado en Mistral NeMo, hereda una arquitectura moderna con atención de ventana deslizante y un contexto de 128 000 tokens, aunque no se confirma si el fine-tuning ha modificado estas características. El repositorio incluye un único archivo de pesos cuantizado y un Modelfile de Ollama para simplificar la puesta en marcha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Mistral NeMo Instruct 2407, no confirmado) |
| Parametros totales | 12 247 782 400 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el modelo base Mistral NeMo soporta 128 000 tokens) |
| Tipos de cuantizacion | Q4_K_M (único archivo incluido) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors no incluido en el repo) |

## Arquitectura y entrenamiento

La información disponible no detalla el proceso de entrenamiento. El nombre del archivo sugiere que el modelo base es Mistral NeMo Instruct 2407, que emplea una arquitectura transformer con atención de ventana deslizante (sliding window attention) y un mecanismo de atención de 128 000 tokens de contexto. Mistral NeMo fue entrenado con 15 billones de tokens y posteriormente alineado mediante instrucciones. El fine-tuning realizado por iulio no está documentado en la model card; solo se indica que se utilizó Unsloth para el entrenamiento y la conversión a GGUF. No se mencionan técnicas como RLHF, DPO ni innovaciones específicas.

## Capacidades

- Generación de texto conversacional: el modelo está etiquetado como `conversational`, lo que indica que está optimizado para mantener diálogos multi-turno.
- Inferencia local eficiente: al estar en formato GGUF, puede ejecutarse en CPU y GPU con llama.cpp, Ollama y otras herramientas compatibles.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que puede desplegarse en servicios de inferencia como OpenAI-compatible APIs.
- No se dispone de información sobre capacidades específicas como tool calling, razonamiento avanzado, visión o audio.

## Casos de uso

- Asistentes conversacionales locales: gracias a su formato GGUF y su tamaño de 12B, puede desplegarse en estaciones de trabajo con GPU de gama media para ofrecer un asistente de chat privado sin depender de servicios en la nube.
- Prototipado rápido con Ollama: el Modelfile incluido permite crear un modelo en Ollama con un solo comando, ideal para pruebas de concepto y desarrollo ágil.
- Integración en pipelines de generación de texto: al ser compatible con endpoints, puede conectarse a aplicaciones existentes mediante API, por ejemplo para resumir documentos o redactar correos.
- Educación e investigación: sirve como base para experimentos de fine-tuning o para estudiar el comportamiento de modelos cuantizados en tareas de conversación.
- Despliegue en entornos con recursos limitados: la cuantización Q4_K_M reduce el uso de memoria, permitiendo ejecutar el modelo en hardware con menos VRAM que el modelo original.
- Evaluación de modelos cuantizados: útil para comparar la degradación de rendimiento entre la versión completa y la cuantizada en tareas específicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras métricas estándar para este fine-tuning concreto.

## Requisitos de hardware

- VRAM estimada: para un modelo de 12B en Q4_K_M, se necesitan aproximadamente 7-8 GB de VRAM para inferencia en GPU. En CPU, se requieren unos 8-10 GB de RAM.
- GPU recomendadas: tarjetas con 8 GB o más de VRAM, como RTX 3060/3070/4060, o GPUs de datacenter como A10, L4 o A100.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de gama media con 8 GB de VRAM, aunque la velocidad dependerá de la memoria y el ancho de banda.
- Opciones de despliegue: llama.cpp, Ollama, llama-cpp-python, o servidores compatibles con OpenAI API como llama.cpp server o vLLM (si se convierte a otro formato).
- Latencia y throughput: no se dispone de datos medidos. En una GPU como RTX 4090, se espera una generación de 20-40 tokens por segundo, pero es una estimación general.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| FiscMind-12B-GGUF | 12,2B | no disponible | no disponible | GGUF | Fine-tune de Mistral NeMo, cuantizado Q4_K_M |
| Mistral NeMo Instruct 2407 | 12,2B | 128 000 | Apache 2.0 | safetensors | Modelo base, disponible en HuggingFace |
| Llama 3.1 8B Instruct | 8B | 128 000 | Llama 3.1 Community License | safetensors, GGUF | Alternativa de tamaño similar, muy popular |

No se dispone de datos de rendimiento comparativo. La comparativa se basa en características generales de los modelos base.

## Limitaciones y advertencias

- No se ha publicado información sobre sesgos, alucinaciones o limitaciones específicas de este fine-tuning.
- La licencia no está especificada, por lo que se desconoce si permite uso comercial. Se recomienda contactar con el autor antes de utilizarlo en producción.
- El modelo solo está disponible en cuantización Q4_K_M, lo que puede degradar ligeramente la calidad de las respuestas frente a la versión completa.
- No se confirma si el fine-tuning ha alterado el contexto original de 128 000 tokens; se recomienda verificar el comportamiento con contextos largos.
- Al ser un modelo conversacional, puede generar respuestas incorrectas o inventadas en dominios especializados si no se le proporciona contexto suficiente.

## Enlaces

- [HuggingFace - iulio/FiscMind-12B-GGUF](https://huggingface.co/iulio/FiscMind-12B-GGUF)
- [Unsloth (herramienta de entrenamiento y conversión)](https://github.com/unslothai/unsloth)
- [Mistral NeMo Instruct 2407 (modelo base)](https://huggingface.co/mistralai/Mistral-Nemo-Instruct-2407)

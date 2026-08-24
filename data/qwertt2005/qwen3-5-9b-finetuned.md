# qwertt2005/Qwen3.5-9B-FineTuned

## Resumen

Qwen3.5-9B-FineTuned es un modelo de lenguaje de 9.197 millones de parámetros desarrollado por el usuario qwertt2005, que parte del modelo base unsloth/Qwen3.5-9B (a su vez una versión de Qwen3.5-9B de Alibaba). Se trata de un ajuste fino (fine-tuning) supervisado y con datos de razonamiento, entrenado sobre una mezcla de 159.082 muestras curadas que combinan conversación, razonamiento matemático paso a paso, instrucciones de alta calidad y datos web. El modelo se distribuye en formatos safetensors y GGUF, con cuantizaciones de 4, 8 y 16 bits, lo que permite su ejecución local mediante Ollama u otros motores de inferencia.

La relevancia de este modelo radica en que ofrece una versión afinada de Qwen3.5-9B, un modelo de última generación con arquitectura híbrida de atención (lineal y completa) y una ventana de contexto de hasta 262.144 tokens en su versión base. El fine-tuning busca mejorar el razonamiento matemático y la alineación conversacional, aunque no se han publicado benchmarks propios que validen estas mejoras. Su licencia Apache-2.0 permite uso comercial sin restricciones significativas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (atención lineal/completa) según el modelo base Qwen3.5-9B |
| Parametros totales | 9.197.093.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la ficha; el modelo base Qwen3.5-9B soporta 262.144 tokens |
| Tipos de cuantizacion | GGUF Q4_K_M (5,4 GB), Q8_0 (9,2 GB), F16 (18,0 GB); safetensors en BF16/F32 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, GGUF, adaptadores LoRA (PEFT) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B emplea una arquitectura híbrida que combina atención lineal y atención completa, diseñada para mejorar la eficiencia en contextos largos. El fine-tuning se realizó con el framework Unsloth sobre una GPU NVIDIA H100 80GB, utilizando 159.082 muestras curadas. La mezcla de entrenamiento incluye: HuggingFaceTB/smoltalk (50.000 muestras) para alineación conversacional y SFT; open-r1/OpenR1-Math-220k (49.999 muestras) para razonamiento matemático con trazas de pensamiento; HuggingFaceFW/fineweb (19.995 muestras) como corpus web de alta calidad; OpenAssistant/oasst2 (14.088 muestras) con datos RLHF multi-turno; y teknium/OpenHermes-2.5 (25.000 muestras) para seguimiento de instrucciones de nivel GPT-4. No se especifica si se aplicó RLHF o DPO posterior al SFT, aunque la inclusión de datos RLHF sugiere una posible etapa de alineación adicional.

## Capacidades

- Generación de texto y conversación multi-turno, entrenado con datos de smoltalk y oasst2.
- Razonamiento matemático paso a paso, gracias a las 49.999 muestras de OpenR1-Math-220k con trazas de pensamiento.
- Seguimiento de instrucciones de alta calidad, basado en OpenHermes-2.5.
- Capacidad de razonamiento (reasoning) indicada en las etiquetas del modelo, aunque no se detalla si incluye un modo de pensamiento explícito.
- Soporte de tool calling y function calling: no confirmado explícitamente, pero el modelo base Qwen3.5-9B lo soporta; el fine-tuning no lo desactiva.
- Capacidades multilingües: no disponibles en la ficha; el modelo base Qwen3.5 soporta múltiples idiomas, pero no se confirma para este fine-tuning.
- No se indica soporte de visión ni audio; el pipeline es text-generation.

## Casos de uso

- Asistente de razonamiento matemático: el modelo puede resolver problemas paso a paso, útil para plataformas educativas o herramientas de ayuda al estudio. Su entrenamiento con OpenR1-Math-220k lo hace adecuado para explicar procedimientos y no solo dar resultados.
- Chatbot de atención al cliente: gracias a su entrenamiento con smoltalk y oasst2, puede mantener conversaciones multi-turno coherentes. Con la ventana de contexto del base (262K tokens) podría manejar historiales largos, aunque no se confirma si el fine-tuning conserva esa longitud.
- Generación de código en entornos de desarrollo: aunque no se menciona entrenamiento específico en código, el modelo base Qwen3.5-9B tiene capacidades de programación; el fine-tuning podría usarse como asistente de autocompletado o revisión de código.
- Análisis de documentos largos: con el contexto extendido del base, podría resumir o extraer información de documentos extensos, siempre que el fine-tuning no reduzca la ventana.
- Fine-tuning adicional para dominios específicos: al distribuirse adaptadores LoRA, el modelo puede servir como punto de partida para ajustes posteriores con menos recursos.
- Despliegue local en equipos de consumo: las cuantizaciones GGUF de 4 y 8 bits permiten ejecutar el modelo en GPUs de gama media (por ejemplo, RTX 3060 o superiores) mediante Ollama, facilitando prototipos y pruebas sin infraestructura cloud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no proporciona métricas como MMLU, HumanEval o GSM8K para este fine-tuning. Tampoco se ofrecen comparaciones con el modelo base o con alternativas similares. Se recomienda evaluar el modelo en los casos de uso previstos antes de desplegarlo en producción.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización:
  - GGUF Q4_K_M (5,4 GB): aproximadamente 6-7 GB de VRAM, apto para GPUs de 8 GB como RTX 3070/4060.
  - GGUF Q8_0 (9,2 GB): aproximadamente 10-11 GB de VRAM, apto para GPUs de 12 GB como RTX 3060/4070.
  - GGUF F16 (18,0 GB): aproximadamente 19-20 GB de VRAM, requiere GPUs de 24 GB como RTX 3090/4090 o A5000.
- GPU recomendadas: NVIDIA H100 (usada en entrenamiento), A100, RTX 4090, RTX 3090, o GPUs de consumo con al menos 8 GB de VRAM para cuantizaciones bajas.
- Opciones de despliegue: Ollama (compatible con GGUF), llama.cpp, vLLM (para safetensors), Hugging Face TGI, y cualquier framework que soporte el formato GGUF o safetensors.
- Latencia y throughput: no disponibles. Dependen del hardware, la cuantización y el backend. En una RTX 4090 con Q4_K_M se espera una generación de 30-50 tokens/s, pero no hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| qwertt2005/Qwen3.5-9B-FineTuned | 9,2B | no disponible (base: 262K) | Apache-2.0 | safetensors, GGUF | Fine-tuning con datos de razonamiento y conversación |
| Qwen/Qwen3.5-9B (base) | 9,2B | 262.144 | Apache-2.0 | safetensors | Modelo original de Alibaba, multimodal (visión-lenguaje) |
| Llama 3.1 8B (Meta) | 8,0B | 128.000 | Llama 3.1 Community | safetensors, GGUF | Modelo generalista, sin fine-tuning específico |
| Mistral 7B v0.3 | 7,3B | 32.000 | Apache-2.0 | safetensors, GGUF | Modelo ligero, popular para despliegue local |

La comparativa se basa en características públicas; no hay datos de rendimiento para el fine-tuning. El modelo base Qwen3.5-9B es multimodal, mientras que este fine-tuning se limita a texto, lo que puede ser una limitación si se necesita procesamiento de imágenes.

## Limitaciones y advertencias

- No se han publicado benchmarks propios, por lo que no hay evidencia objetiva de mejora frente al modelo base.
- El entrenamiento se realizó con datos de fuentes diversas; puede heredar sesgos presentes en esos datasets (por ejemplo, sesgos de género o culturales en OpenHermes-2.5 o fineweb).
- Riesgo de alucinación: como cualquier LLM, puede generar información falsa o inventada, especialmente en dominios no cubiertos por los datos de entrenamiento.
- La longitud de contexto efectiva tras el fine-tuning no está confirmada; podría ser inferior a la del base si el ajuste redujo la ventana.
- No se especifican los idiomas soportados; el modelo base es multilingüe, pero el fine-tuning podría haber priorizado el inglés (los datasets son mayoritariamente en inglés).
- El repositorio tiene 0 descargas y 0 likes, lo que indica que no ha sido validado por la comunidad; se recomienda probarlo exhaustivamente antes de usarlo en producción.
- Aunque la licencia Apache-2.0 permite uso comercial, el autor no ofrece garantías ni soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qwertt2005/Qwen3.5-9B-FineTuned
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Guía de fine-tuning de Unsloth para Qwen3.5: https://unsloth.ai/docs/models/qwen3.5/fine-tune
- Página de Qwen3.5:9b en Ollama: https://ollama.com/library/qwen3.5:9b
- Ficha de Qwen3.5-9B en Benchable: https://benchable.ai/models/qwen/qwen3.5-9b-20260310

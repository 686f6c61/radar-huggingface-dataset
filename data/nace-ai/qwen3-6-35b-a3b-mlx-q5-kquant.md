# nace-ai/Qwen3.6-35B-A3B-MLX-Q5-KQuant

## Resumen

Qwen3.6-35B-A3B-MLX-Q5-KQuant es una cuantización de 5 bits en formato MLX del modelo Qwen/Qwen3.6-35B-A3B, publicada por nace-ai. El modelo base es un transformer de tipo Mixture-of-Experts (MoE) con 35.107.181.936 parámetros totales y capacidad multimodal de entrada (image-text-to-text), orientado a generación de texto, razonamiento y llamadas a herramientas. Esta versión concreta está pensada para ejecutarse en Apple Silicon mediante la librería MLX.

El pack ocupa 23,0 GB en total, con 22,07 GB correspondientes a los pesos del modelo de lenguaje a 5,094 bits por peso de media y una torre de visión de 893.142.496 bytes tomada de mlx-community/Qwen3.6-35B-A3B-OptiQ-4bit. La cuantización emplea el método propio de Nace.AI, que ajusta cada grupo de pesos contra el comportamiento del modelo en texto real en lugar de limitarse a minimizar el error numérico de los pesos.

Su relevancia actual radica en que permite ejecutar un modelo MoE de 35B parámetros con capacidades multimodales y de razonamiento en hardware de consumo Apple, manteniendo una divergencia medida frente al modelo BF16 de 0,0271 KL en texto original y 0,0681 KL en texto de chat y tool-calls, con licencia Apache 2.0 que facilita el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), tag `qwen3_5_moe`; multimodal image-text-to-text |
| Parametros totales | 35.107.181.936 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 5 bits (5,094 bits por peso de media); el repo incluye tags de 4-bit y 5-bit |
| Idiomas soportados | en (segun model card y tags) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors para MLX (libreria `mlx`); 6 archivos de pesos, 22.961.646.328 bytes |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un transformer con arquitectura Mixture-of-Experts, tal como indica el tag `qwen3_5_moe`. Dispone de 35.107.181.936 parámetros totales y una torre de visión que lo habilita como modelo image-text-to-text. El modelo piensa antes de responder por defecto (modo thinking), segun se indica en la model card del pack.

Esta ficha describe la cuantización, no el entrenamiento del modelo base: no se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La innovación técnica del pack es el método de cuantización de Nace.AI, que ajusta cada grupo de pesos contra el comportamiento del modelo en texto real y produce un pack MLX estándar sin necesidad de instalar nada adicional. La torre de visión se tomó de mlx-community/Qwen3.6-35B-A3B-OptiQ-4bit (333 tensores). El gate run se ejecutó en una NVIDIA H200 de 151 GB con mlx 0.32.4, mlx-lm 0.32.2, transformers 5.22.2 y numpy 2.5.4.

## Capacidades

- Generación de texto y razonamiento con modo thinking activado por defecto.
- Procesamiento de imagen y texto como entrada (pipeline image-text-to-text) gracias a la torre de visión incluida.
- Soporte de tool calling / function calling: 20 de 20 pruebas con thinking desactivado completaron la llamada y el round trip.
- Razonamiento multi-paso mediante el modo thinking, con hasta 32.768 tokens de salida recomendados para la mayoría de tareas.
- Capacidades multilingües limitadas: la model card y los tags solo declaran inglés (`en`).
- Modos de configuración diferenciados para thinking, thinking con coding preciso y thinking desactivado.

## Casos de uso

- Asistente de razonamiento en local sobre Mac: el modelo piensa antes de responder, lo que permite resolver problemas de lógica y análisis multi-paso sin enviar datos a la nube, aprovechando que los pesos caben en 23 GB.
- Automatización de llamadas a herramientas: los 20 de 20 ensayos de tool-call completados con éxito lo hacen adecuado para agentes que invocan APIs o funciones externas en flujos de trabajo locales.
- Análisis de documentos con imagen: al aceptar entrada image-text-to-text, puede procesar capturas, diagramas o documentos escaneados junto con instrucciones textuales.
- Generación de código con configuración precisa: el modo "thinking, precise coding" (temperature 0.6, top_p 0.95, top_k 20, presence_penalty 0.0) está pensado para tareas de programación donde se prioriza la exactitud sobre la diversidad.
- Prototipado e investigación en Apple Silicon: sirve para evaluar el comportamiento de un MoE de 35B en MLX antes de invertir en infraestructura GPU, con métricas de divergencia frente a BF16 documentadas.
- Despliegue de agentes conversacionales multi-turno: el soporte de chat y tool-calls con penalización de presencia ajustable (0 a 2) permite mantener conversaciones largas controlando la repetición.
- Evaluación comparativa de cuantizaciones: el repositorio incluye `results.json` con el gate run completo (runtime, hashes de tokenizer, legs de KL y ensayos de herramientas), útil para reproducir y comparar métodos de cuantización.

## Benchmarks y rendimiento

| Prueba | Nace Q5 (este repo) | Tokens |
|---|---:|---|
| KL frente al modelo BF16, texto original (menor es mejor) | 0,0271 | 32.704 |
| KL frente al modelo BF16, texto de chat y tool-call (menor es mejor) | 0,0681 | 65.472 |
| Ensayos de tool-call con thinking desactivado completados | 20 de 20 | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card advierte que este pack se evaluó con token IDs distintos a los de otros packs, por lo que no se reclama una ganancia emparejada frente a ellos; la comparación emparejada corresponde al pack hermano Q4.

## Requisitos de hardware

- VRAM/almacenamiento: 23,0 GB de archivos en total; 22,07 GB de pesos del modelo de lenguaje. En Apple Silicon la memoria unificada debe cubrir los pesos más el contexto y el estado de inferencia.
- Hardware objetivo: Apple Silicon con MLX (librería `mlx`, `mlx-lm`). El gate run se ejecutó en una NVIDIA H200 de 151 GB, pero el pack está diseñado para Macs.
- GPU de consumo: no cabe en GPUs de consumo tipo RTX 4090 (24 GB) con margen para contexto; en Apple Silicon requiere equipos con memoria unificada de 32 GB o superior (no confirmado en la información disponible).
- Opciones de despliegue: MLX y mlx-lm. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en este pack.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | KL vs BF16 | Licencia |
|---|---|---|---|---|---|
| Nace Q5 (este repo) | 35.107.181.936 | no disponible | 5,094 bits/peso (MLX) | 0,0271 (texto) / 0,0681 (chat) | apache-2.0 |
| Nace Q4 (nace-ai/Qwen3.6-35B-A3B-MLX) | 35.107.181.936 | no disponible | 4 bits (MLX) | no disponible en esta ficha | apache-2.0 |
| mlx-community 4-bit | 35.107.181.936 | no disponible | 4 bits (MLX) | representado en el gráfico de la model card; cifra no disponible | no disponible |
| unsloth UD-3bit | 35.107.181.936 | no disponible | 3 bits | representado en el gráfico de la model card; cifra no disponible | no disponible |

Todos los comparables comparten el modelo base Qwen/Qwen3.6-35B-A3B; la comparación se centra en el método y nivel de cuantización. La model card incluye un gráfico de KL medio frente a BF16 versus tamaño del archivo del modelo de lenguaje con estos cuatro packs.

## Limitaciones y advertencias

- Idiomas: solo se declara inglés (`en`); el rendimiento en castellano u otros idiomas no está documentado.
- Longitud de contexto: no disponible en la información proporcionada; conviene consultar la model card del modelo base.
- Alucinación: no se documentan tasas ni mitigaciones específicas; el modo thinking por defecto puede aumentar la latencia y el consumo de tokens de salida.
- Repetición: la model card advierte que valores altos de presence_penalty pueden mezclar idiomas; se recomienda mantener repetition_penalty en 1.0.
- Compatibilidad: los comandos de inicio rápido para este pack aún están en pruebas; la model card remite a la del Qwen3.5-9B Q4 para los comandos verificados.
- Licencia: Apache 2.0 permite uso comercial, pero las condiciones del modelo base deben verificarse en su propia model card.
- Métricas: el KL de este pack se midió con token IDs distintos a los de otros packs, por lo que no es directamente comparable de forma emparejada con ellos.
- Formato: al ser un pack MLX, no es portable a runtimes CUDA sin conversión.

## Enlaces

- Hugging Face del pack: https://huggingface.co/nace-ai/Qwen3.6-35B-A3B-MLX-Q5-KQuant
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Pack hermano Q4/Q5: https://huggingface.co/nace-ai/Qwen3.6-35B-A3B-MLX/tree/main/Q5
- Model card de referencia Qwen3.5-9B Q4: https://huggingface.co/nace-ai/Qwen3.5-9B-MLX
- Torre de visión de origen: https://huggingface.co/mlx-community/Qwen3.6-35B-A3B-OptiQ-4bit
- Resultados del gate run: `results.json` en el propio repositorio del pack

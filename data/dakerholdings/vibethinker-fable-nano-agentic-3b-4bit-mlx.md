# dakerholdings/VibeThinker-Fable-Nano-Agentic-3b-4bit-mlx

## Resumen

VibeThinker-Fable-Nano-Agentic-3b-4bit-mlx es una conversión a formato MLX y cuantización uniforme de 4 bits del modelo VibeThinker-Fable-Nano-Agentic-3B, un modelo de 3.09 mil millones de parámetros diseñado para razonamiento y tareas de agente de codificación. El modelo original fue desarrollado por Nexlab como un fine-tuning QLoRA SFT de zkxxxx/VibeThinker-3B-heretic, que a su vez se basa en la arquitectura Qwen2.5-Coder-3B y ha sido sometido a un proceso de abliteration (eliminación de capas de rechazo). El objetivo declarado es transformar un modelo de razonamiento matemático de largo formato en uno que siga un bucle de uso de herramientas y produzca respuestas completas, el comportamiento necesario para un agente autónomo de codificación.

La conversión MLX, publicada por dakerholdings, empaqueta los pesos en formato safetensors con cuantización uniforme de 4 bits (grupo de 128), lo que reduce el tamaño del repositorio a 1.7 GB y permite su ejecución eficiente en hardware Apple Silicon mediante la librería mlx_lm. Aunque el archivo safetensors muestra 434 millones de parámetros debido al empaquetado de pesos, el recuento real de parámetros del modelo es de 3.09B. La licencia Apache-2.0 permite uso comercial sin restricciones significativas.

Este modelo es relevante porque demuestra que es posible obtener capacidades de razonamiento y agencia en un modelo pequeño, ejecutable en dispositivos de consumo, sin depender de infraestructura en la nube. Su cuantización a 4 bits lo hace especialmente atractivo para desarrolladores que necesitan un asistente de codificación local con soporte de tool calling.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (basado en Qwen2.5-Coder-3B) |
| Parametros totales | 3.09B (original); 434M en el archivo safetensors cuantizado |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Uniform 4-bit affine, group size 128 |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base VibeThinker-3B, desarrollado por WeiboAI, se construye sobre Qwen2.5-Coder-3B y se post-entrena con un pipeline llamado Spectrum-to-Signal que combina fine-tuning supervisado curricular, aprendizaje por refuerzo multi-dominio, auto-destilación offline y ajuste por instrucciones. Sobre este modelo, Nexlab aplicó un fine-tuning QLoRA SFT utilizando trazas de agente del sistema FABLE.5, con el objetivo de convertir el modelo en un agente de codificación que siga un bucle de uso de herramientas y produzca respuestas completas. El proceso incluye abliteration, que elimina capas de rechazo para mejorar la obediencia a instrucciones.

La versión MLX aquí descrita es una conversión de un GGUF original, cuantizada con el método uniform 4-bit affine con grupo de 128. Esta cuantización reduce el tamaño de los pesos a 3-8 bits por elemento, lo que explica la discrepancia entre el recuento de parámetros del archivo safetensors y el recuento real. El modelo se puede ejecutar con los runtimes mlx_lm y mlx_vlm.

## Capacidades

- Generación de texto y razonamiento matemático y lógico de largo formato.
- Codificación: genera, explica y depura código en múltiples lenguajes.
- Soporte de tool calling / function calling: diseñado para seguir un bucle de uso de herramientas, esencial para agentes autónomos.
- Razonamiento multi-paso: capaz de encadenar pasos de razonamiento y comprometerse con respuestas finales.
- Capacidades multilingües: no especificadas, pero al estar basado en Qwen2.5-Coder, probablemente soporta inglés y chino, aunque no se confirma.
- No incluye capacidades de visión ni audio.

## Casos de uso

- Agente autónomo de codificación: el modelo puede integrarse en entornos de desarrollo (IDE, CLI) para generar código, refactorizar, escribir tests y corregir errores, siguiendo un bucle de tool calling que le permite consultar documentación o ejecutar comandos.
- Asistente de razonamiento matemático: útil para resolver problemas de álgebra, cálculo o lógica, explicando el proceso paso a paso, gracias a su entrenamiento en razonamiento verifiable.
- Chat conversacional técnico: puede mantener conversaciones multi-turno sobre temas de programación y arquitectura de software, con respuestas detalladas y fundamentadas.
- Automatización de tareas de desarrollo: en pipelines de CI/CD, puede generar scripts de despliegue, analizar logs y proponer soluciones, aprovechando su capacidad de tool calling.
- Tutoría y educación en programación: puede explicar conceptos, revisar código de estudiantes y sugerir mejoras, funcionando como un mentor local sin conexión.
- Prototipado rápido: en entornos con recursos limitados, permite generar esqueletos de aplicaciones o funciones a partir de descripciones en lenguaje natural, sin necesidad de GPU de alta gama.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Al ser un modelo de 3.09B parámetros cuantizado a 4 bits, el tamaño del repositorio es de 1.7 GB, lo que permite su carga en dispositivos con al menos 4 GB de RAM/VRAM.
- Diseñado para Apple Silicon mediante MLX, se ejecuta eficientemente en Macs con chips M1/M2/M3 (8 GB de RAM unificada o más).
- En GPUs de consumo, puede ejecutarse con CUDA a través de la conversión a GGUF, aunque no se proporcionan requisitos específicos de VRAM.
- Opciones de despliegue: mlx_lm (Python), mlx_vlm (para modelos multimodales, aunque este no lo es), y potencialmente llama.cpp si se convierte a GGUF.
- Latencia y throughput: no disponibles, pero al ser un modelo pequeño, se espera una generación rápida en hardware moderno.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| VibeThinker-Fable-Nano-Agentic-3B (este) | 3.09B | No disponible | Apache-2.0 | Agente de codificación con tool calling |
| Qwen2.5-Coder-3B | 3B | 32K (típico) | Apache-2.0 | Codificación general |
| Llama-3.2-3B | 3.2B | 128K | Llama 3.2 Community | Modelo base multilingüe |

No se dispone de datos de rendimiento comparativo. La principal diferencia de este modelo es su fine-tuning específico para agentes y su cuantización MLX, que lo hace más ligero que los modelos base sin ajuste.

## Limitaciones y advertencias

- Al ser un modelo de 3B, puede presentar alucinaciones en tareas complejas o con información poco frecuente.
- La cuantización a 4 bits puede degradar ligeramente la precisión en comparación con el modelo original en FP16.
- No se especifican sesgos conocidos, pero al estar entrenado principalmente en datos de código y razonamiento, puede tener un rendimiento limitado en dominios no técnicos.
- La longitud de contexto no está documentada; se recomienda probar con secuencias cortas para evitar degradación.
- La licencia Apache-2.0 permite uso comercial, pero se debe atribuir el copyright y mantener el aviso de licencia.
- El modelo está diseñado para tareas de agente; su uso como chat general puede no ser óptimo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dakerholdings/VibeThinker-Fable-Nano-Agentic-3b-4bit-mlx
- Modelo original (Nexlab): https://huggingface.co/Nexlab/VibeThinker-Fable-Nano-Agentic-3B
- Repositorio GitHub de VibeThinker: https://github.com/WeiboAI/VibeThinker
- Paper técnico de VibeThinker-3B: https://arxiv.org/abs/2606.16140

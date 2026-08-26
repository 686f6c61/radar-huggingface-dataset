# harrrshall/tastemaxxing-lofi-sft-v3

## Resumen

`harrrshall/tastemaxxing-lofi-sft-v3` es un adaptador LoRA de supervisión fina (SFT) construido sobre el modelo base `Qwen/Qwen2.5-Coder-7B-Instruct`, publicado por el usuario de Hugging Face `harrrshall` (harshal singh). El nombre del adaptador sugiere una especialización en el dominio del "tastemaxxing" —una tendencia cultural reciente centrada en la curaduría y la selección de música, especialmente en el ámbito del lofi—, aunque la model card no aporta ninguna descripción funcional ni documentación técnica.

El repositorio contiene únicamente los pesos del adaptador (0,3 GB), no el modelo completo, y utiliza la librería PEFT (v0.20.0) con el formato `safetensors`. Fue creado el 25 de agosto de 2026 y actualizado el mismo día, sin descargas ni valoraciones registradas en el momento de la consulta. La licencia y los idiomas soportados no están declarados.

La relevancia de este modelo reside en su base: Qwen2.5-Coder-7B-Instruct es un modelo de 7B parámetros con ventana de contexto de 32 768 tokens, optimizado para generación de código y razonamiento. Sin embargo, al ser un adaptador LoRA sin documentación pública, su utilidad práctica queda limitada hasta que se publiquen detalles sobre el dataset de entrenamiento y las tareas específicas para las que fue ajustado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen2.5-Coder-7B-Instruct (transformer decoder-only) |
| Parametros totales | No disponible (adaptador LoRA; el modelo base tiene 7 610 000 000) |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | 32 768 tokens (heredada del modelo base) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors) |
| Idiomas soportados | No disponible (no declarados) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base es `Qwen/Qwen2.5-Coder-7B-Instruct`, un transformer decoder-only de 7B parámetros con atención completa, perteneciente a la familia Qwen2.5. Qwen2.5-Coder-7B-Instruct soporta una ventana de contexto de 32 768 tokens y está entrenado para seguir instrucciones y generar código en múltiples lenguajes.

El adaptador `tastemaxxing-lofi-sft-v3` se entrenó mediante SFT (supervised fine-tuning) usando la librería TRL y PEFT, según los tags del repositorio. El dataset de entrenamiento, los hiperparámetros exactos y el régimen de entrenamiento no están documentados en la model card. El nombre "v3" sugiere que es la tercera iteración del adaptador, pero no hay información sobre las versiones anteriores ni sobre las técnicas de regularización o los datos utilizados.

## Capacidades

- Generación de texto en estilo conversacional, según el tag `conversational`.
- Generación de código, heredada del modelo base Qwen2.5-Coder-7B-Instruct.
- Razonamiento y seguimiento de instrucciones, capacidades del modelo base.
- Soporte de tool calling / function calling: no documentado en este adaptador, aunque el modelo base lo soporta.
- Capacidades multilingües: no declaradas para el adaptador; el modelo base soporta inglés y chino principalmente.
- No hay documentación sobre capacidades especiales (vision, audio, thinking mode) en el adaptador.

## Casos de uso

- Curaduría musical automatizada: si el adaptador fue entrenado para "tastemaxxing", podría emplearse para generar listas de reproducción o descripciones de música lofi, aunque no hay evidencia documentada de ello.
- Generación de código con estilo personalizado: al basarse en Qwen2.5-Coder-7B-Instruct, el adaptador puede usarse para tareas de programación, aunque el SFT específico podría alterar el comportamiento en otros dominios.
- Prototipado de agentes conversacionales: el modelo base es adecuado para chatbots con contexto largo; el adaptador podría personalizar el tono o el estilo.
- Investigación en fine-tuning: útil para estudiar el impacto del SFT con LoRA en el rendimiento de un modelo de código, comparando con el base.
- Experimentación con la técnica LoRA: para desarrolladores que quieran probar adaptadores de bajo rango sobre Qwen2.5-Coder.
- Despliegue en entornos con recursos limitados: al ser un adaptador de 0,3 GB, se puede cargar sobre el modelo base en GPUs de consumo sin necesidad de un modelo completo adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones para este adaptador. Se desconoce si el SFT degrada el rendimiento del modelo base en tareas estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 7B parámetros requiere aproximadamente 14 GB en bf16 y 4 GB en cuantización 4-bit. El adaptador LoRA añade un coste marginal.
- GPU recomendadas: RTX 4090 (24 GB), A100 (40/80 GB), H100 (80 GB) para ejecución cómoda en bf16; en 4-bit cabe en GPUs de 8 GB como RTX 4060 Ti.
- Consumer GPU: sí, el modelo base se puede ejecutar en GPUs de 8-12 GB con cuantización (GGUF o bitsandbytes).
- Opciones de despliegue: vLLM, llama.cpp (si se convierte a GGUF), Ollama, TGI, o con la biblioteca `peft` directamente en transformers.
- Latencia y throughput: no disponibles; dependerán del hardware y de la cuantización.

## Comparativa con modelos similares

No se dispone de modelos comparables documentados para este adaptador. Como referencia, el modelo base Qwen2.5-Coder-7B-Instruct compite con otros modelos de código de 7B como CodeLlama-7B-Instruct o DeepSeek-Coder-7B-Instruct, pero no hay información sobre el rendimiento del adaptador `tastemaxxing` frente a estos. No se pueden establecer comparativas reales sin datos de evaluación.

## Limitaciones y advertencias

- La model card está vacía: no hay descripción del propósito, dataset de entrenamiento ni metodología, lo que dificulta evaluar su fiabilidad.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar contenido falso o inventado, especialmente en dominios no entrenados.
- Sesgos desconocidos: no se declara ningún trabajo de mitigación de sesgos; el adaptador puede heredar o amplificar los sesgos del modelo base.
- Licencia no disponible: no se puede determinar si es de uso comercial sin restricciones.
- Riesgo de degradación por SFT: el propio autor menciona en su perfil que el SFT puede causar "frozen-prompt overfitting" y "catastrophic forgetting", lo que podría afectar al rendimiento general.
- Contexto y idioma: el modelo base es principalmente inglés; no se ha validado el adaptador en otros idiomas.
- Producción: sin documentación ni benchmarks, no se recomienda su uso en entornos de producción sin una evaluación exhaustiva previa.

## Enlaces

- Repositorio del modelo: https://huggingface.co/harrrshall/tastemaxxing-lofi-sft-v3
- Perfil del autor: https://huggingface.co/harrrshall
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Paper de referencia citado (emisiones CO2): https://arxiv.org/abs/1910.09700
- Cuenta X del autor: https://x.com/HarshalsinghCN

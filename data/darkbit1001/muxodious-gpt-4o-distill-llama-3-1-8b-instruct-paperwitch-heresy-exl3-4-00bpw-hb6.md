# darkbit1001/MuXodious-gpt-4o-distill-Llama-3.1-8B-Instruct-PaperWitch-heresy-exl3-4.00bpw-hb6

## Resumen

Este repositorio contiene una cuantización EXL3 (ExLlamaV3) del modelo `MoXodious/gpt-4o-distil-Llama-3.1-8B-Instruct-PaperWitch-heresy`, un afinamiento de `meta-llama/Llama-3.1-8B-Instruct` que ha sido entrenado para imitar el estilo de escritura de GPT-4o y posteriormente sometido a un proceso de "abliteración" mediante la herramienta Heretic (v1.2.0) con la técnica Magnitude-Preserving Orthogonal Ablation (MPOA). El objetivo de esa ablación es reducir significativamente la tasa de rechazos a preguntas, manteniendo una baja divergencia KL con respecto al modelo original. Esta cuantización reduce el modelo a 4 bits por peso, lo que permite inferencia con menos recursos de VRAM en comparación con la versión en precisión completa.

El modelo base tiene una arquitectura transformer estándar de 8 000 millones de parámetros, con una longitud de contexto de 128 000 tokens (heredada de Llama 3.1). La cuantización EXL3 es una técnica específica de ExLlamaV3 que almacena los pesos en un formato compacto de 4 bits, con cabeceras de 6 bits para mejorar la precisión. Es una opción relevante para desarrolladores que buscan desplegar un modelo de lenguaje grande con características de estilo GPT-4o y una baja tasa de rechazo, sin necesidad de una GPU de gran capacidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Llama 3.1, decoder causal) |
| Parametros totales | 2 470 188 288 (archivo cuantizado; modelo base: 8 000 millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 000 tokens (heredado del modelo base) |
| Tipos de cuantizacion | EXL3 4.00 bits por peso, head bits 6, codebook `mul1` |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (EXL3) |

## Arquitectura y entrenamiento

El modelo base es una variante de Llama-3.1-8B-Instruct que fue entrenada con SFT (supervised fine-tuning) para producir respuestas con el estilo de GPT-4o. Posteriormente, se aplicó el proceso de ablación de Heretic, que identifica direcciones en el espacio de activaciones responsables de los rechazos y las elimina de forma ortogonal, reduciendo la tasa de rechazos de 98/100 a 7/100, manteniendo una divergencia KL de 0.0274 con respecto al modelo sin ablación. La cuantización se realizó con `exllamav3-1.4.1`, utilizando calibración sobre 250 filas y 2048 columnas, con salida de escalas y codebook `mul1`. No se han publicado detalles sobre el conjunto de datos de entrenamiento ni el número de tokens.

## Capacidades

- Generación de texto libre con un estilo cercano al de GPT-4o, gracias al afinamiento previo.
- Conversación multi-turno (modelo instructivo, orientado a diálogo).
- Razonamiento y respuesta a preguntas abiertas, heredado de Llama-3.1-8B-Instruct.
- Generación de código y soporte básico de matemáticas (capacidades del modelo base, no verificadas específicamente en esta cuantización).
- Soporte de tool calling y function calling (capacidad del modelo base Llama-3.1-8B-Instruct, no confirmada en este archivo cuantizado).
- Multilingüismo potencial (Llama-3.1 soporta varios idiomas, pero no se ha validado en esta versión).

## Casos de uso

- **Asistente conversacional sin restricciones**: el modelo ha sido abliterado para reducir rechazos, por lo que puede responder a preguntas que un modelo alineado estándar rechazaría. Adecuado para entornos de investigación o aplicaciones de nicho donde se requiere mayor libertad de expresión.
- **Generación de contenido con estilo GPT-4o**: el afinamiento previo permite obtener respuestas con una redacción y tono similares a GPT-4o, útil para redacción de textos, blogs o guiones.
- **Despliegue en GPUs de consumo**: con la cuantización a 4 bits, el modelo cabe en tarjetas con 8 GB de VRAM, lo que permite ejecutarlo en equipos con RTX 3060, RTX 4060 o similares para pruebas y prototipado.
- **Integración en pipelines de chat en tiempo real**: al usar ExLlamaV3, la inferencia es rápida y eficiente, adecuada para aplicaciones de chat con baja latencia en servidores con GPUs moderadas.
- **Estudio de técnicas de ablación**: el modelo sirve como ejemplo de cómo la abliteración afecta al comportamiento, útil para investigadores en alineación y seguridad de IA.
- **Prototipado de agentes sin censura**: al mantener las capacidades de tool calling del modelo base (aunque no confirmadas en esta cuantización), puede integrarse en sistemas de agentes que requieren menos restricciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La página de llm-explorer asigna un "LLM Explorer Score" de 0.24, pero no es un benchmark estandarizado y no se detallan las métricas. Por tanto, no se puede evaluar el rendimiento cuantitativo en tareas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: los pesos cuantizados ocupan aproximadamente 5.0 GB, más la memoria para la ventana de contexto. Para un contexto corto (2K tokens) se necesita alrededor de 6-7 GB; para contextos largos (128K) la VRAM puede superar los 12 GB.
- GPU recomendadas: cualquier GPU con 8 GB de VRAM o más, como RTX 3060 (12GB), RTX 4060 (8GB), RTX 4090 (24GB), o GPUs de datacenter como A10, A100 o H100.
- Inferencia en CPU: no es práctico con ExLlamaV3, que está optimizado para GPU.
- Opciones de despliegue: ExLlamaV3 (librería nativa), vLLM (si se convierte a un formato compatible), y posiblemente TGI con adaptadores. No se proporciona GGUF en este repositorio.
- Latencia: no hay datos concretos; la inferencia en 4 bits con ExLlamaV3 suele ser rápida, pero depende de la GPU y el tamaño de la ventana de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (cuantización EXL3) | 2.47B (cuantizado) / 8B (base) | 128K | EXL3 4-bit | Apache-2.0 | Abliterado, estilo GPT-4o |
| Llama-3.1-8B-Instruct (original) | 8B | 128K | FP16 | Llama 3.1 License | Modelo base, no abliterado |
| MuXodious/gpt-4o-distil-Llama-3.1-8B-Instruct-PaperWitch-heresy | 8B | 128K | FP16 | Apache-2.0 | Modelo base sin cuantizar, abliterado |
| GPT-4o (propietario) | no público | ~128K | API | Propietaria | Modelo comercial, no comparación directa |

## Limitaciones y advertencias

- El proceso de abliteración reduce los rechazos, pero no elimina la posibilidad de generar contenido dañino, ilegal o no ético. El uso en producción debe evaluarse cuidadosamente.
- No se han realizado evaluaciones de sesgos o alucinación sobre esta cuantización específica.
- La cuantización a 4 bits puede degradar la calidad de las respuestas en comparación con la versión FP16, especialmente en tareas que requieren razonamiento complejo.
- No se dispone de información sobre los idiomas soportados de forma explícita; aunque Llama-3.1 tiene capacidades multilingües, no se ha confirmado para esta cuantización.
- El repositorio tiene 0 descargas y 0 likes, y fue creado recientemente; no hay evidencia de validación por parte de la comunidad.
- La licencia Apache-2.0 permite uso comercial, pero se debe verificar la licencia del modelo base original (en este caso, el modelo base también es Apache-2.0, por lo que es compatible).

## Enlaces

- Repositorio del modelo cuantizado: https://huggingface.co/darkbit1001/MuXodious-gpt-4o-distill-Llama-3.1-8B-Instruct-PaperWitch-heresy-exl3-4.00bpw-hb6
- Modelo base (sin cuantizar): https://huggingface.co/MuXodious/gpt-4o-distil-Llama-3.1-8B-Instruct-PaperWitch-heresy
- Página de llm-explorer con datos del modelo base: https://llm-explorer.com/model/MuXodious%2Fgpt-4o-distil-Llama-3.1-8B-Instruct-PaperWitch-heresy,1MHK1YwegP04au0R3xjAqf
- Colección "GPT-4o Style" de redaihf: https://huggingface.co/collections/redaihf/gpt-4o-style

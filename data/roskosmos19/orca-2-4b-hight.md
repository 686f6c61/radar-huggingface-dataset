# roskosmos19/Orca-2-4B-hight

## Resumen

Orca-2-4B-hight es un modelo de lenguaje de 4.022 millones de parámetros (4B) publicado por el usuario roskosmos19 en Hugging Face, presentado en su model card como «Orca-4B-Agentic», sucesor optimizado de la línea Rhea-4B-Coding / Athenea. Está construido sobre la arquitectura Qwen3ForCausalLM y se distribuye con licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales. Su propuesta de valor es un modelo compacto orientado a tareas de código y flujos agénticos, con un modo de razonamiento opcional mediante etiquetas ``.

El modelo se posiciona como una alternativa más barata y rápida que su predecesor multi-pase: elimina el razonamiento forzado en tres pasadas (implementar, revisar, final) y reduce la ventana de contexto de 262.144 a 32.768 tokens, con el argumento de que cubre cargas de trabajo agénticas reales. Incluye una plantilla de tool calling y tokens especiales de chat (`<|im_start|>`, `<|im_end|>`) heredados de Qwen3.

Es relevante ahora por su relación coste/rendimiento en despliegues de agentes y generación de código: 4B parámetros permiten inferencia en GPU de consumo con cuantización Q4_K_M o AWQ, y el repositorio (8,1 GB, safetensors en dos shards) ha recibido una corrección del índice de pesos en noviembre de 2026 para que Transformers pueda cargarlo correctamente. No obstante, la información pública disponible es escasa: no hay datos de benchmarks, idiomas declarados ni detalles del dataset de entrenamiento más allá de la referencia a `roskosmos19/Rhea-Coding`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3ForCausalLM (transformer decoder-only) |
| Parámetros totales | 4.022.468.096 (4B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantización | Q4_K_M y Q5_K_M (llama.cpp), AWQ (recomendadas por el autor); otras no especificadas |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (2 shards), index JSON corregido en 2026-11-13 |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Qwen3ForCausalLM, un transformer decoder-only de 4B parámetros, con tokens especiales de chat de la familia Qwen (`<|im_start|>`, `<|im_end|>`) más las etiquetas de razonamiento `<think>` y `</think>` y tokens de herramientas. Según la model card, deriva de la base Qwen3-4B combinada con la línea de código Athenea / Rhea, y se ha optimizado para uso agéntico con razonamiento de una sola pasada y un formato de tool calling más limpio.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste supervisado. El único dataset referenciado es `roskosmos19/Rhea-Coding`, sin detalles públicos sobre su contenido. La innovación declarada es de eficiencia más que arquitectónica: se elimina el `min_new_tokens=1024` forzado y el esquema de tres generaciones del predecesor, y se ajustan los valores por defecto de generación (temperatura 0,4, top_p 0,9, top_k 30, repetition_penalty 1,05, max_new_tokens 8192) para equilibrar calidad y velocidad.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat compatible con Transformers.
- Razonamiento con cadena de pensamiento opcional mediante `<think>...</think>`; el modelo decide cuándo usarlo.
- Generación de código y tareas de programación (el autor la presenta como su foco principal).
- Tool calling / function calling con una plantilla dedicada y tokens de herramientas.
- Flujos agénticos de un solo paso, sin sobrecoste de múltiples generaciones forzadas.
- Capacidades multilingües: no declaradas en la información disponible.
- Capacidades de visión: la model card indica que los tokens de visión del predecesor se han eliminado («clean + lean»), por lo que no se ofrecen.
- Modo de sistema con instrucciones que orientan hacia soluciones precisas, seguras y eficientes.

## Casos de uso

- Asistente de código en IDE: con 4B parámetros y contexto de 32.768 tokens, puede autocompletar funciones, explicar fragmentos y generar tests dentro de un plugin local en una GPU de consumo, manteniendo el archivo abierto y el historial de conversación en contexto.
- Agente de automatización de tareas de desarrollo: su plantilla de tool calling permite conectar herramientas (ejecución de shell, consultas a APIs, lectura de ficheros) en bucles de varios pasos, con el modo `<think>` activado solo cuando la tarea lo requiere para ahorrar latencia.
- Generación de código en pipelines de CI/CD: puede integrarse como paso de revisión automática que valida JWT, sanitiza entradas o detecta patrones inseguros en diffs, gracias a su enfoque en código seguro y a la licencia Apache 2.0 que permite uso interno sin restricciones.
- Atención al cliente técnica: conversaciones multi-turno sobre errores de integración o dudas de API, con contexto suficiente para recordar la configuración del usuario durante una sesión de soporte.
- Despliegue en el borde o en estaciones de trabajo sin GPU dedicada: con cuantización Q4_K_M en llama.cpp cabe en GPUs de consumo y permite asistentes privados sin enviar código a la nube.
- Prototipado rápido de agentes: al no forzar razonamiento multi-pase, sirve para iterar plantillas de prompts y herramientas en vLLM o SGLang con `--max-model-len 32768` sin multiplicar los costes de inferencia.
- Enseñanza y experimentación: modelo pequeño y de licencia permisiva para estudiar tool calling, formato de chat y razonamiento opcional en entornos académicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: en FP16/BF16, aproximadamente 8 GB solo para pesos, más caché KV; en Q4_K_M, alrededor de 2,5-3 GB de pesos, lo que deja margen para contexto en tarjetas de 8 GB.
- GPU recomendadas: A100 o H100 para servicio de alta concurrencia con contexto completo de 32.768 tokens; RTX 4090 o L40S para despliegues de equipo; RTX 3060/4060 Ti de 8-12 GB para uso individual con cuantización.
- Cabe en GPU de consumo: sí, con Q4_K_M o Q5_K_M en tarjetas de 8 GB o más; en FP16 requiere 12-16 GB.
- Opciones de despliegue: vLLM y SGLang (`--max-model-len 32768`), llama.cpp (Q4_K_M o Q5_K_M), Transformers con `device_map="auto"`, y text-generation-inference (etiqueta `text-generation-inference` en el repositorio).
- Latencia y throughput: no disponibles; el autor recomienda mantener el contexto en 16k-24k en producción para un equilibrio óptimo entre velocidad y VRAM.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Orca-2-4B-hight (este) | 4B | 32.768 | Apache 2.0 | Código y agentes, thinking opcional | Hugging Face, safetensors |
| Qwen3-4B (base declarada) | 4B | no disponible en la información | Apache 2.0 (según familia Qwen3) | Propósito general | Hugging Face |
| Rhea-4B-Coding (predecesor) | 4B | 262.144 | Apache 2.0 (según la card) | Código, razonamiento multi-pase | Hugging Face |
| Rhea-4B-Coding-max (sucesor indicado) | no disponible | no disponible | no disponible | Código | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No hay benchmarks publicados que respalden las afirmaciones de rendimiento del autor; la evaluación es responsabilidad del usuario.
- Riesgo de alucinación inherente a un modelo de 4B, especialmente en razonamiento largo o código con APIs poco comunes.
- Idiomas soportados no declarados: el rendimiento fuera del inglés (incluido el castellano) no está garantizado ni documentado.
- El contexto se ha reducido de 262.144 a 32.768 tokens respecto al predecesor; cargas que requieran ventanas mayores no son viables.
- El repositorio sufrió un índice de safetensors roto hasta 2026-11-13; versiones anteriores a esa corrección no cargan en Transformers. Verificar el commit al desplegar.
- La model card mezcla nombres (Orca-4B-Agentic, Rhea-4B-Agentic, Orca-2-4B-hight), lo que puede generar confusión sobre la versión exacta descargada.
- Sin información sobre sesgos, composición del dataset ni filtrado de datos; no se puede evaluar el riesgo de sesgo sistemático.
- Licencia Apache 2.0 permite uso comercial, pero el usuario debe cumplir las obligaciones de atribución y no se ofrece garantía alguna por parte del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/roskosmos19/Orca-2-4B-hight
- Dataset referenciado: https://huggingface.co/datasets/roskosmos19/Rhea-Coding
- Sucesor indicado en la model card: https://huggingface.co/roskosmos19/Rhea-4B-Coding-max
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.

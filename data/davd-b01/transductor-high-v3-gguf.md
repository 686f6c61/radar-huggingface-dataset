# Davd-b01/transductor-high-v3-gguf

## Resumen

El modelo `Davd-b01/transductor-high-v3-gguf` es una cuantización en formato GGUF del modelo base `Davd-b01/transductor-high-v3`, desarrollado por Davd-b01. Se trata de un modelo de generación de texto de aproximadamente 2.697 millones de parámetros (2,7B), basado en la familia LFM2.5-2.6B. El modelo original fue entrenado con una combinación de SFT (supervisión de ajuste fino) y SimPO, una técnica de optimización de preferencias, y posteriormente fusionado y cuantizado a Q4_K_M para facilitar la inferencia local en hardware de consumo.

La cuantización Q4_K_M está verificada como de calidad neutra frente a Q8_0 en una comprobación de 10 ítems, y el modelo ha sido probado en una salida de tipo "think + answer". Su relevancia radica en la posibilidad de ejecutarlo localmente con un tamaño de archivo reducido (1,7 GB), manteniendo funcionalidades de razonamiento mediante trazas de pensamiento. No se dispone de información sobre arquitectura detallada, contexto o idiomas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 2.697.198.592 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF), Q8_0 mencionado como comparación |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base `Davd-b01/transductor-high-v3` pertenece a la familia LFM2.5-2.6B. El proceso de entrenamiento combina SFT y SimPO, una variante de optimización de preferencias que ajusta el modelo para seguir instrucciones y alinear sus respuestas con preferencias humanas. Después del entrenamiento, se realizó una fusión completa de los pesos y posteriormente se cuantizó a formato GGUF en la variante Q4_K_M. La cuantización se validó como neutral en calidad frente a Q8_0 en una prueba de 10 ítems.

El modelo parece estar diseñado para generar "traces" de razonamiento, indicado por las etiquetas `<tc_think>` y `<tc_answer>` que se deben parsear en la salida. También se mencionan "thinking levels", lo que sugiere que el modelo puede ajustar la profundidad del razonamiento en sus respuestas. No hay información detallada sobre los datos de entrenamiento, el número de tokens ni la composición del dataset.

## Capacidades

- Generación de texto con trazas de razonamiento: produce salidas en formato `<tc_think>` y `<tc_answer>`, lo que permite separar el proceso de pensamiento de la respuesta final.
- Soporte de "thinking levels": posibilidad de controlar la profundidad o intensidad del razonamiento durante la generación.
- Inferencia local en CUDA y Vulkan mediante `llama-server`, con soporte para offload total de capas (`-ngl 999`) y flash attention (`-fa on`).
- Compatible con el sistema de prompts de niveles ("tier system prompt") y entrada TCS de cuatro ranuras ("four-slot TCS input").
- No se especifican capacidades de tool calling, visión, audio, ni soporte multilingüe explícito.

## Casos de uso

- Asistentes de texto locales con razonamiento: el modelo puede ejecutarse en una GPU de consumo mediante `llama-server`, ofreciendo respuestas con trazas de pensamiento que se pueden parsear para mostrar un "modo razonamiento" al usuario.
- Investigación y desarrollo de técnicas de cuantización: su naturaleza de modelo pequeño y su validación Q4_K_M frente a Q8_0 lo hacen útil para comparar el impacto de la cuantización en modelos de razonamiento.
- Aplicaciones de chat privadas sin conexión: al ejecutarse localmente con un peso de 1,7 GB, puede integrarse en entornos donde se requiera privacidad de datos y no se permita el uso de servicios en la nube.
- Prototipado rápido de sistemas de agentes simples: el uso de etiquetas `<tc_think>` permite separar el razonamiento interno de la acción visible, facilitando el desarrollo de pipelines de agente con lógica personalizada.
- Experimentación con niveles de pensamiento: los "thinking levels" permiten ajustar el comportamiento del modelo en escenarios donde se desee más o menos reflexión antes de responder.
- Educación y demostraciones técnicas: el tamaño reducido y el formato GGUF permiten desplegarlo en aulas o laboratorios con GPUs modestas para mostrar conceptos de razonamiento en modelos de lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el archivo GGUF Q4_K_M pesa 1,7 GB, por lo que se necesita aproximadamente entre 2 y 4 GB de VRAM para la inferencia con offload completo, dependiendo de la longitud de contexto y el tamaño de la ventana de atención.
- GPU recomendadas: cualquier tarjeta compatible con CUDA o Vulkan que tenga al menos 4 GB de VRAM. Ejemplos: RTX 3060, RTX 4060, o GPUs de gama baja similares. También es compatible con GPUs AMD mediante Vulkan.
- Opciones de despliegue: llama.cpp / llama-server (con los parámetros `-ngl 999 -fa on`), y potencialmente Ollama si se importa el archivo GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos comparativos de benchmarks. Sin embargo, por tamaño de parámetros, se puede situar junto a modelos de aproximadamente 2,6B-2,7B como Qwen2.5-2.7B o Gemma-2-2B. La comparación directa no es posible porque no se conocen ni el contexto, ni los idiomas, ni la licencia de este modelo.

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Davd-b01/transductor-high-v3-gguf | 2.697.198.592 | no disponible | no disponible | GGUF |
| Qwen2.5-2.7B (referencia) | 2,7B | no disponible | no disponible | Safetensors, GGUF |
| Gemma-2-2B (referencia) | 2B | no disponible | no disponible | Safetensors, GGUF |

Nota: los datos de referencia no provienen de la información proporcionada y se mencionan solo como contexto de tamaño.

## Limitaciones y advertencias

- Licencia no especificada: antes de cualquier uso comercial o distribución, es necesario verificar los términos de la licencia del modelo base y del repositorio GGUF.
- Idiomas no especificados: no se confirma el soporte del castellano ni de otros idiomas, lo que limita su uso en aplicaciones multilingües.
- Longitud de contexto desconocida: no se puede garantizar un comportamiento adecuado en conversaciones largas o documentos extensos.
- Sin benchmarks publicados: no hay evidencia de rendimiento en tareas estándar como MMLU, HumanEval o GSM8K, por lo que su calidad relativa es desconocida.
- Riesgo de alucinación: al ser un modelo pequeño (2,7B), es probable que presente mayor tasa de alucinaciones en tareas complejas en comparación con modelos más grandes.
- Dependencia de un sistema de prompts específico: el modelo requiere el "tier system prompt" y la entrada TCS de cuatro ranuras para funcionar según lo previsto, lo que añade complejidad a la integración.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Davd-b01/transductor-high-v3-gguf
- Modelo base: https://huggingface.co/Davd-b01/transductor-high-v3

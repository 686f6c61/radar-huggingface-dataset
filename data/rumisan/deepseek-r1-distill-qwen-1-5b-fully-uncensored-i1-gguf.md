# rumisan/DeepSeek-R1-Distill-Qwen-1.5B-Fully-Uncensored-i1-GGUF

## Resumen

El modelo `rumisan/DeepSeek-R1-Distill-Qwen-1.5B-Fully-Uncensored-i1-GGUF` es una cuantización en formato GGUF del modelo `nicoboss/DeepSeek-R1-Distill-Qwen-1.5B-Fully-Uncensored`, que a su vez es un ajuste fino del modelo `DeepSeek-R1-Distill-Qwen-1.5B` de DeepSeek, orientado a eliminar las restricciones de contenido (uncensored). El autor de la cuantización es `mradermacher`, aunque el repositorio está alojado bajo la cuenta `rumisan`. Se distribuye bajo licencia MIT y está pensado para ejecución local eficiente en CPU o GPU de baja capacidad.

El modelo base, DeepSeek-R1-Distill-Qwen-1.5B, es un transformer denso de 1.500 millones de parámetros, destilado a partir de DeepSeek-R1 sobre la arquitectura Qwen-2.5, con un contexto de 32.768 tokens (dato típico de la serie Qwen-2.5, aunque no se confirma en la documentación del repositorio). La variante "Fully-Uncensored" se entrenó con el dataset `Guilherme34/uncensor` para reducir el rechazo a contenido sensible. Esta versión GGUF incluye múltiples cuantizaciones con importancia (imatrix) que van desde 0,6 GB hasta 1,4 GB, lo que la hace adecuada para entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen-2.5) |
| Parametros totales | 1.776.255.488 (1,78 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (típico de Qwen-2.5: 32.768 tokens) |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base `DeepSeek-R1-Distill-Qwen-1.5B` es un transformer denso derivado de la serie Qwen-2.5, con 1,5 B de parámetros y una ventana de contexto de 32.768 tokens. Fue destilado a partir de DeepSeek-R1 utilizando 800.000 muestras curadas, lo que le confiere capacidades de razonamiento paso a paso y generación de respuestas con cadena de pensamiento. La variante "Fully-Uncensored" se obtuvo mediante un ajuste fino adicional sobre el dataset `Guilherme34/uncensor`, cuyo objetivo es reducir la probabilidad de que el modelo rechace o censure contenido considerado sensible o controvertido. Posteriormente, el modelo se cuantizó con la técnica de importancia (imatrix) para producir los archivos GGUF, que optimizan el equilibrio entre tamaño, velocidad y calidad.

## Capacidades

- Generación de texto con razonamiento explícito: al ser una destilación de DeepSeek-R1, el modelo tiende a generar cadenas de pensamiento antes de responder, lo que mejora la coherencia en tareas de lógica y matemáticas.
- Generación de código: hereda las capacidades de Qwen-2.5 para completar y explicar fragmentos de código en varios lenguajes.
- Conversación multi-turno: puede mantener diálogos extensos dentro de su ventana de contexto.
- Contenido sin censura: el ajuste con el dataset `uncensor` reduce el rechazo a temas como violencia, sexualidad, lenguaje ofensivo o instrucciones potencialmente peligrosas, aunque esto conlleva riesgos (ver limitaciones).
- Multilingüe limitado: aunque el idioma declarado es inglés, al estar basado en Qwen-2.5 puede comprender parcialmente otros idiomas, pero no se garantiza su calidad.
- No se ha documentado soporte explícito para tool calling o function calling en esta variante.

## Casos de uso

- Generación de narrativa creativa sin restricciones: escritores pueden usarlo para explorar tramas con contenido adulto o temas tabú sin que el modelo se niegue a continuar, gracias a su entrenamiento "uncensored".
- Chatbots de rol para comunidades específicas: permite crear asistentes conversacionales que responden sin filtros morales, útil en entornos de entretenimiento o simulación de personajes.
- Prototipado rápido de aplicaciones de IA en dispositivos de bajo consumo: al tener cuantizaciones de menos de 1 GB, puede ejecutarse en una Raspberry Pi 5 o en un portátil antiguo con CPU, usando llama.cpp u Ollama.
- Asistente de programación offline: para autocompletar o explicar código en entornos sin conexión, aprovechando su capacidad de razonamiento y generación de código.
- Investigación sobre alineación y sesgos: al ser un modelo "uncensored" de pequeño tamaño, es útil para estudiar cómo el ajuste fino con datos específicos modifica el comportamiento de rechazo y los límites éticos.
- Generación de datos sintéticos para entrenamiento: puede producir respuestas variadas y sin restricciones que sirvan como dataset para otros modelos, siempre que se supervise el contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta variante cuantizada ni para el modelo "Fully-Uncensored" en la información disponible. El modelo base `DeepSeek-R1-Distill-Qwen-1.5B` tiene resultados públicos en MMLU, HumanEval y GSM8K (reportados por DeepSeek), pero no se incluyen aquí para evitar inventar datos. Se recomienda consultar la documentación oficial de DeepSeek para conocer el rendimiento del modelo sin cuantizar.

## Requisitos de hardware

- VRAM estimada: el quant más grande (i1-Q5_K_M, 1,4 GB) requiere al menos 2 GB de VRAM para inferencia con overhead de contexto. Los quants más pequeños (0,6-0,8 GB) pueden funcionar con 1 GB.
- GPU recomendadas: cualquier GPU con 2 GB o más, como NVIDIA GTX 1050 Ti, GTX 1650, o integradas modernas. También es viable en Apple Silicon con Metal.
- CPU: puede ejecutarse en CPU con 4 GB de RAM libre, aunque la velocidad será baja (10-20 tokens/s en un i5 moderno).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, o cualquier runtime compatible con GGUF. También se puede usar con transformers mediante la integración de GGUF, aunque no es el flujo principal.
- Latencia y throughput: no se dispone de datos medidos; en una GPU de gama media (RTX 3060) se esperan 50-100 tokens/s con cuantización Q4_K_M, y en CPU unos 10-30 tokens/s.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| rumisan/DeepSeek-R1-Distill-Qwen-1.5B-Fully-Uncensored-i1-GGUF | 1,78 B | No disponible | MIT | GGUF | Cuantización imatrix, sin censura |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B | 1,78 B | 32.768 (típico) | Apache 2.0 | Safetensors | Modelo original con censura estándar |
| Qwen2.5-1.5B-Instruct | 1,78 B | 32.768 | Apache 2.0 | Safetensors | Modelo base sin destilación R1, con instrucciones |

La comparativa se basa en datos públicos de los repositorios. La variante "uncensored" se diferencia por su licencia MIT y su entrenamiento específico, pero no se dispone de métricas de rendimiento comparativas.

## Limitaciones y advertencias

- Contenido potencialmente dañino: al ser "uncensored", el modelo puede generar instrucciones peligrosas, discursos de odio o contenido ilegal. No debe desplegarse en producción sin filtros de seguridad adicionales.
- Sesgos y alucinaciones: al ser un modelo pequeño (1,5 B) y cuantizado, es propenso a alucinaciones y a reflejar sesgos presentes en los datos de entrenamiento, especialmente en temas controvertidos.
- Degradación por cuantización: los quants de baja precisión (IQ1, IQ2) reducen notablemente la calidad de las respuestas y la coherencia del razonamiento.
- Idioma limitado: el entrenamiento se centró en inglés; el rendimiento en otros idiomas es impredecible.
- Sin garantías de tool calling: no se ha verificado soporte para funciones externas, lo que limita su uso en agentes complejos.
- Licencia MIT: permite uso comercial, pero el responsable del despliegue asume la responsabilidad legal del contenido generado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/rumisan/DeepSeek-R1-Distill-Qwen-1.5B-Fully-Uncensored-i1-GGUF
- Modelo base (nicoboss): https://huggingface.co/nicoboss/DeepSeek-R1-Distill-Qwen-1.5B-Fully-Uncensored
- Cuantizaciones estáticas (mradermacher): https://huggingface.co/mradermacher/DeepSeek-R1-Distill-Qwen-1.5B-Fully-Uncensored-GGUF
- Modelo original DeepSeek-R1-Distill-Qwen-1.5B: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Repositorio GitHub de DeepSeek-R1: https://github.com/deepseek-ai/DeepSeek-R1
- Dataset de uncensor: https://huggingface.co/datasets/Guilherme34/uncensor

# aldenw/Qwen3.8-27B-Uncensored-Aggressive-i1-IQ4_XS-Smaller-GGUF

## Resumen

Este repositorio contiene una cuantización GGUF compacta del modelo `philbert440/Qwen3.8-27B-Uncensored-Aggressive`, un modelo de lenguaje de 27 000 millones de parámetros basado en la arquitectura Qwen 3.8. La cuantización, realizada por el usuario `aldenw`, emplea el esquema `IQ4_XS` con tensores de las capas feed-forward reducidos a `IQ3_S` y la capa de salida en `Q6_K`, logrando un tamaño efectivo de aproximadamente 13 GB. Además, incluye un modelo draft MTP (Multi-Token Prediction) cuantizado a `Q4_0` (1,9 GB) para habilitar decodificación especulativa en entornos compatibles con llama.cpp.

La relevancia de este modelo radica en su equilibrio entre tamaño reducido y calidad de cuantización. Las evaluaciones internas muestran una degradación mínima de perplexity (+3,47 % relativo) y una divergencia de distribución baja (KLD medio de 0,06) frente al modelo en BF16. Los benchmarks de tareas (IFEval, GSM8K, GPQA) no presentan una regresión consistente, e incluso muestran mejoras puntuales en GSM8K, atribuibles a trayectorias de decodificación deterministas alteradas por la cuantización. Está pensado para ejecución local en hardware de consumo, con soporte de decodificación especulativa mediante el modelo draft MTP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen 3.8, con cabezal MTP) |
| Parametros totales | 26 895 998 464 (26,9 B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen3.8-27B soporta hasta 262 000 tokens segun fuentes externas, pero no se confirma para esta cuantizacion) |
| Tipos de cuantizacion | IQ4_XS (base), IQ3_S (FFN), Q5_K (atencion, promovido por llama.cpp), Q6_K (output), Q4_0 (modelo draft MTP) |
| Idiomas soportados | no disponible (se espera multilingue por ser Qwen, pero no se especifica) |
| Licencia | no disponible (la licencia del modelo base no se indica en la ficha) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

Este repositorio no contiene un modelo entrenado desde cero, sino una cuantización del modelo `philbert440/Qwen3.8-27B-Uncensored-Aggressive`. El modelo base es una variante "uncensored" y "aggressive" de Qwen 3.8 27B, que según fuentes externas (orcarouter) ha sido sometida a abliteración a nivel de tensores para eliminar la censura y reducir el sobre-rechazo, manteniendo intactas la torre de visión, el cabezal MTP y las capacidades de tool calling y razonamiento. La arquitectura subyacente es un transformer denso con 64 bloques, atención multi-cabeza y un cabezal MTP para predicción multi-token.

La cuantización se realizó con llama.cpp utilizando una matriz de importancia específica del modelo (`mradermacher/Qwen3.8-27B-Uncensored-Aggressive-i1-GGUF`). El comando de cuantización aplica `IQ4_XS` como base, pero reduce los tensores de las proyecciones feed-forward (`ffn_down`, `ffn_gate`, `ffn_up`) a `IQ3_S` para ahorrar espacio, mientras que los tensores de atención pueden ser promovidos a `Q5_K` por el runtime. El modelo draft MTP se convirtió por separado y se cuantizó a `Q4_0` con `output.weight` en `Q6_K`. No se aplicó ningún entrenamiento adicional ni fine-tuning; solo conversión y cuantización.

## Capacidades

- Generación de texto y chat conversacional: al ser un modelo de 27B, es capaz de mantener diálogos coherentes y responder a instrucciones complejas.
- Razonamiento y matemáticas: los benchmarks internos (GSM8K-CoT, GPQA Diamond) muestran resultados aceptables, aunque con variabilidad debida a la cuantización.
- Seguimiento de instrucciones: evaluado con IFEval, con puntuaciones superiores al 83 % en modo estricto.
- Decodificación especulativa: gracias al modelo draft MTP incluido, puede acelerar la inferencia en hardware compatible con llama.cpp.
- Capacidades heredadas del modelo base (no confirmadas para esta cuantización): según fuentes externas, el modelo original Qwen3.8-27B-Uncensored soporta tool calling, razonamiento en modo "thinking", visión (a través de un adaptador mmproj) y un contexto de hasta 262 000 tokens. Sin embargo, la model card de este repositorio no documenta estas capacidades, por lo que deben considerarse no verificadas.
- Multilingüismo: probablemente soporta múltiples idiomas al ser un modelo Qwen, pero no se especifica en la documentación.

## Casos de uso

- Ejecución local de un asistente conversacional sin censura: el modelo puede desplegarse en una máquina personal con una GPU de 16-24 GB de VRAM, usando llama.cpp u Ollama, para mantener conversaciones abiertas sin filtros de contenido.
- Prototipado de agentes con decodificación especulativa: el modelo draft MTP permite acelerar la generación en entornos de baja latencia, útil para experimentar con pipelines de agentes que requieren múltiples llamadas al modelo.
- Generación de código en entornos aislados: aunque no se documenta explícitamente, un modelo de 27B de la familia Qwen suele manejar tareas de programación; puede integrarse en herramientas de autocompletado o generación de scripts.
- Investigación sobre cuantización y calidad: los datos de perplexity, KLD y benchmarks incluidos en la model card son útiles para estudiar el impacto de cuantizaciones mixtas (IQ4_XS + IQ3_S) en modelos grandes.
- Desarrollo de chatbots especializados en dominios técnicos: con fine-tuning adicional (no incluido), el modelo base puede adaptarse a dominios como soporte técnico o documentación, y esta cuantización permite probarlo en hardware limitado.
- Evaluación de modelos "uncensored" en entornos controlados: investigadores pueden analizar el comportamiento del modelo en tareas de generación de contenido sensible, siempre respetando los límites legales y éticos.

## Benchmarks y rendimiento

La model card proporciona una comparación directa entre el modelo cuantizado y su versión BF16, utilizando el mismo runtime de llama.cpp y decodificación determinista (razonamiento desactivado). Los resultados son los siguientes:

| Benchmark | BF16 | Quant (IQ4_XS) | Diferencia |
|---|---:|---:|---:|
| WikiText-2 perplexity | 6,3640 | 6,5848 | +0,2208 |
| IFEval instruction loose | 90,89 % | 90,89 % | +0,00 pp |
| IFEval instruction strict | 88,73 % | 88,61 % | -0,12 pp |
| IFEval prompt loose | 86,51 % | 86,14 % | -0,37 pp |
| IFEval prompt strict | 83,92 % | 83,36 % | -0,55 pp |
| GSM8K-CoT flexible extract | 83,32 % | 90,37 % | +7,05 pp |
| GSM8K-CoT strict match | 79,23 % | 88,78 % | +9,55 pp |
| GPQA Diamond CoT flexible extract | 13,13 % | 14,65 % | +1,52 pp |

Además, se reporta una divergencia KLD media de 0,059965 (mediana 0,024371) y una coincidencia del token superior del 90,68 % en una comparación de 32 fragmentos. No se han publicado comparaciones con otros modelos de la misma categoría en la información disponible.

## Requisitos de hardware

- VRAM estimada: el modelo principal ocupa aproximadamente 13 GB en disco, y el modelo draft MTP 1,9 GB. Para cargar ambos en memoria se necesitan al menos 15 GB de VRAM, aunque se puede ejecutar solo el modelo principal con unos 13 GB.
- GPU recomendadas: una RTX 4090 (24 GB) o RTX 4080 (16 GB) pueden manejar el modelo completo con decodificación especulativa. GPUs con 12 GB (RTX 4070, RTX 3060) podrían ejecutar solo el modelo principal con cuantización más agresiva o usando offloading a CPU.
- Compatibilidad con hardware de consumo: sí, cabe en GPUs de gama alta para consumidores. Para GPUs con menos VRAM, se puede usar llama.cpp con capas en CPU.
- Opciones de despliegue: llama.cpp (servidor, CLI), Ollama (si se importa el GGUF), o cualquier runtime compatible con GGUF (llama-cpp-python, etc.). También es compatible con endpoints que aceptan GGUF.
- Latencia y throughput: no se proporcionan datos específicos. La decodificación especulativa con el draft MTP puede mejorar la velocidad de generación, pero depende de la versión de llama.cpp, el hardware y la tasa de aceptación del draft.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos de la misma categoría (por ejemplo, otros Qwen3.8-27B cuantizados o modelos de 27B como Llama 3.1 8B o Mistral 7B). La model card no incluye comparaciones externas, y los datos de benchmarks solo comparan la versión cuantizada con su versión BF16. Por tanto, se indica "no disponible".

## Limitaciones y advertencias

- Sesgos y contenido ofensivo: al ser un modelo "uncensored" y "aggressive", puede generar contenido inapropiado, ofensivo o peligroso. No debe utilizarse en aplicaciones orientadas al público general sin filtros adicionales.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede inventar información, especialmente en tareas de razonamiento complejo (GPQA Diamond muestra solo un 14,65 % de acierto).
- Degradación por cuantización: aunque la evaluación interna muestra poca pérdida, la cuantización mixta (IQ3_S en FFN) puede afectar tareas sensibles a la precisión numérica, como matemáticas o código.
- Licencia no especificada: la licencia del modelo base no está indicada en la ficha, lo que impide conocer las restricciones de uso comercial. Se recomienda contactar con el autor original antes de usar el modelo en producción.
- Contexto no confirmado: la longitud de contexto real de esta cuantización no está documentada. Aunque el modelo base Qwen3.8-27B soporta 262K tokens, la cuantización podría alterar el comportamiento en contextos largos.
- Dependencia de llama.cpp: el modelo draft MTP solo funciona con versiones de llama.cpp que soporten decodificación especulativa con MTP; versiones antiguas pueden ignorar el draft o fallar.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/aldenw/Qwen3.8-27B-Uncensored-Aggressive-i1-IQ4_XS-Smaller-GGUF
- Modelo base: https://huggingface.co/philbert440/Qwen3.8-27B-Uncensored-Aggressive
- Matriz de importancia: https://huggingface.co/mradermacher/Qwen3.8-27B-Uncensored-Aggressive-i1-GGUF
- Guía de ejecución local (orcarouter): https://www.orcarouter.ai/blog/how-to-run-qwen-3-8-27b-uncensored-locally
- Repositorio GitHub de referencia: https://github.com/unburdened-jackinthebox365/qwen38-uncensored
- Modelo similar en Ollama: https://ollama.com/orcarouter/Qwen3.8-27B-Uncensored

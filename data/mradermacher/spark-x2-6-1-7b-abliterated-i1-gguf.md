# mradermacher/Spark-X2.6-1.7B-Abliterated-i1-GGUF

## Resumen

Spark-X2.6-1.7B-Abliterated-i1-GGUF es una colección de cuantizaciones GGUF con imatrix (matriz de importancia) del modelo bowtiedrahman/Spark-X2.6-1.7B-Abliterated, publicada por el cuantizador comunitario mradermacher. El modelo base es una versión "abliterated" (con los mecanismos de rechazo eliminados mediante técnicas de decensurado) de un modelo de 1.7B parámetros de la familia Spark, orientado a uso conversacional en inglés y chino.

Este repositorio resuelve un problema práctico muy concreto: permitir ejecutar un modelo pequeño y sin filtros de alineación en hardware modesto, desde portátiles sin GPU hasta teléfonos móviles, gracias a las más de 25 variantes de cuantización que van desde IQ1_S (0,6 GB) hasta Q6_K (1,5 GB). El uso de cuantizaciones ponderadas con imatrix (método de ikawrakow) mejora la calidad percibida frente a las cuantizaciones estáticas a igual tamaño.

Su relevancia actual radica en la tendencia de los modelos abliterated y de código abierto con licencia Apache 2.0: al ser un modelo de 1.7B parámetros con pesos totalmente permisivos, resulta adecuado para investigación sobre alineación, despliegues locales con privacidad total y experimentación en dispositivos de borde. La variante "-i1" indica que se trata de cuantizaciones dinámicas/imatrix, complementadas por las cuantizaciones estáticas disponibles en el repositorio hermano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia sparkx2_5/spark2_5, transformer) |
| Parametros totales | 1.707.657.216 (~1,7B) |
| Parametros activos | no aplicable (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones imatrix/ponderadas) |

## Arquitectura y entrenamiento

El modelo base, Spark-X2.6-1.7B-Abliterated, pertenece a la familia Spark (arquitectura de tipo transformer según los tags sparkx2_5 y spark2_5), con 1.707.657.216 parámetros según los metadatos de safetensors. No se ha publicado en la información disponible el detalle de la arquitectura interna (número de capas, cabezas de atención, longitud de contexto) ni los datos de entrenamiento (tokens, composición del corpus, uso de RLHF o DPO).

La variante "abliterated" indica que se ha aplicado un proceso de decensurado (etiquetado con los tags uncensored, decensored y heretic) que neutraliza los mecanismos de rechazo del modelo original, eliminando las respuestas de negativa típicas de los modelos alineados. El autor bowtiedrahman marca el resultado como "reproducible", lo que sugiere un método documentado y replicable del proceso de abliteración.

Esta ficha corresponde a la colección de cuantizaciones de mradermacher: cuantizaciones GGUF dinámicas ponderadas con imatrix (importance matrix), una técnica que estima la importancia de cada tensor durante la conversión para reducir la pérdida de calidad en los niveles bajos de cuantización (IQ1-IQ3). El archivo imatrix de 0,1 GB permite además a los usuarios generar sus propias cuantizaciones personalizadas.

## Capacidades

- Generación de texto conversacional en inglés y chino, con etiqueta de pipeline "conversational".
- Modelo sin filtros de alineación (abliterated): responde sin los rechazos de seguridad del modelo base alineado.
- Ejecución local eficiente gracias a las cuantizaciones GGUF desde 0,6 GB (IQ1_S) hasta 1,5 GB (Q6_K).
- Compatibilidad con el ecosistema llama.cpp y derivados (Ollama, LM Studio, etc.) por su formato GGUF.
- Archivo imatrix incluido para que los usuarios generen cuantizaciones propias.
- No disponible: no hay información sobre tool calling, capacidades de agente, visión, audio, thinking mode ni decodificación especulativa.

## Casos de uso

- Experimentación local en portátiles sin GPU: con la variante Q4_K_M (1,2 GB) el modelo funciona en CPU con memoria RAM convencional, ideal para desarrolladores que quieren un LLM sin filtros ejecutándose íntegramente en su máquina.
- Investigación sobre alineación y seguridad: al ser una versión abliterated reproducible, sirve para estudiar cómo la abliteración afecta al comportamiento del modelo, a la calidad de las respuestas y a los mecanismos de rechazo internos.
- Despliegue en dispositivos de borde: las variantes IQ1_S e IQ2 (0,6-0,8 GB) permiten ejecutar el modelo en hardware muy limitado como Raspberry Pi o móviles antiguos, aceptando la pérdida de calidad que implican estos niveles.
- Privacidad extrema en chatbots personales: al ejecutarse 100% local con llama.cpp u Ollama, ningún dato de conversación sale del dispositivo, adecuado para asistentes personales con contenido sensible.
- Generación de cuantizaciones personalizadas: el archivo imatrix incluido permite a usuarios avanzados crear variantes ajustadas a su hardware concreto usando llama.cpp.
- Prototipado rápido de agentes locales pequeños: su tamaño de 1,7B y su licencia Apache 2.0 lo hacen útil como componente ligero en pipelines de prototipado donde se necesite un modelo sin negativas y de respuesta rápida, aunque sin garantías de soporte de tool calling documentado.
- Comparación de métodos de cuantización: la amplia gama de variantes IQ y K-quants sirve como banco de pruebas para evaluar la degradación de calidad de cada esquema de cuantización sobre el mismo modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: de 0,6 GB (IQ1_S) a 1,5 GB (Q6_K) solo de pesos; se recomienda disponer de 2-4 GB de RAM/VRAM para el modelo, contexto y sobrecarga de runtime. Al ser GGUF, puede ejecutarse en CPU pura o con offload parcial a GPU.
- GPU recomendadas: no requiere GPU dedicada. Cabe íntegramente en cualquier GPU consumer moderna (RTX 3060 de 12 GB, RTX 4060, RTX 4090) incluso en la variante Q6_K; también funciona en GPUs antiguas con pocos GB de VRAM.
- Consumer GPUs: sí, cabe con holgura en prácticamente cualquier GPU con 4 GB de VRAM o más; en CPU, cualquier portátil con 8 GB de RAM ejecuta las variantes Q4.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, koboldcpp, y cualquier runtime compatible con GGUF. No está orientado a vLLM o TGI, que requieren formatos de pesos distintos (aunque el modelo base safetensors sí podría servir en vLLM si su arquitectura está soportada).
- Latencia y throughput: no disponible. Al ser un modelo de 1,7B cuantizado, se espera inferencia muy rápida en CPU moderna (decenas de tokens/segundo), pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Idiomas | Particularidad |
|---|---|---|---|---|---|
| Spark-X2.6-1.7B-Abliterated-i1-GGUF | 1,7B | GGUF (imatrix) | Apache 2.0 | en, zh | Abliterated, 24 variantes de cuantización |
| Qwen2.5-1.5B-Instruct (GGUF) | 1,5B | GGUF/safetensors | Qwen license (uso comercial condicionado) | multilingüe (29+) | Modelo alineado, sin abliterar |
| Llama-3.2-1B-Instruct (GGUF) | 1,2B | GGUF/safetensors | Llama 3.2 Community License | multilingüe | Modelo alineado, licencia restrictiva |
| SmolLM2-1.7B-Instruct (GGUF) | 1,7B | GGUF/safetensors | Apache 2.0 | en | Tamaño similar, licencia igual de permisiva |

Frente a las alternativas, Spark-X2.6-1.7B-Abliterated destaca por su licencia Apache 2.0 sin restricciones y su naturaleza abliterated; su principal desventaja es la ausencia de benchmarks publicados que permitan comparar calidad con Qwen2.5 o Llama-3.2 en tareas estándar.

## Limitaciones y advertencias

- Modelo abliterated: al haberse eliminado los mecanismos de rechazo, generará contenido que otros modelos se negarían a producir. Su uso conlleva responsabilidades legales y éticas; no es apto para entornos de producción orientados a usuarios finales sin controles adicionales.
- Riesgo de alucinación: inherente a cualquier LLM y agravado por el tamaño reducido (1,7B); no hay datos publicados que cuantifiquen este riesgo en este modelo concreto.
- Calidad de cuantización: las variantes IQ1_S, IQ1_M e IQ2 (0,6-0,8 GB) implican degradación significativa de calidad, señalada por el propio autor como "for the desperate" (para desesperados). Se recomienda Q4_K_S o Q4_K_M como punto de equilibrio.
- Idiomas limitados: solo inglés y chino están declarados; el rendimiento en castellano no está documentado y puede ser pobre.
- Longitud de contexto: no disponible; conviene verificarla en la configuración del modelo base antes de diseñar aplicaciones con documentos largos.
- Sin benchmarks publicados: no es posible validar su rendimiento en MMLU, HumanEval u otras pruebas estándar antes de probarlo.
- Licencia: Apache 2.0 es permisiva y permite uso comercial, pero la responsabilidad sobre el contenido generado recae íntegramente en el usuario.
- Procedencia comunitaria: el modelo base proviene de un autor individual (bowtiedrahman) y las cuantizaciones de un cuantizador comunitario (mradermacher); no hay soporte corporativo ni auditorías de seguridad publicadas.

## Enlaces

- Repositorio de la ficha: https://huggingface.co/mradermacher/Spark-X2.6-1.7B-Abliterated-i1-GGUF
- Modelo base (abliterated): https://huggingface.co/bowtiedrahman/Spark-X2.6-1.7B-Abliterated
- Cuantizaciones estáticas del mismo modelo: https://huggingface.co/mradermacher/Spark-X2.6-1.7B-Abliterated-GGUF
- Página de descargas resumida: https://hf.tst.eu/model#Spark-X2.6-1.7B-Abliterated-i1-GGUF
- README de referencia sobre uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfica comparativa de cuants de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png

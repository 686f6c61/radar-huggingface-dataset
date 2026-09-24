# mradermacher/Llama-3.1-8B-Turkish-i1-GGUF

## Resumen

Llama-3.1-8B-Turkish-i1-GGUF es una colección de cuantizaciones GGUF generadas por mradermacher a partir del modelo erenzeytunn/Llama-3.1-8B-Turkish, un ajuste en turco de Llama 3.1 8B. No es por tanto un modelo nuevo entrenado desde cero, sino una redistribución optimizada para inferencia local: el autor aplica cuantización ponderada con fichero imatrix (denominada i1) sobre los pesos originales en precisión completa, reduciendo el peso en disco desde los ~16 GB del modelo base en fp16 hasta 2,2 GB en la variante más agresiva.

El interés práctico de esta ficha está en que resuelve un problema muy concreto: ejecutar un modelo de 8.097.797.312 parámetros especializado en turco en hardware de consumo o en servidores sin GPU de gama alta. La familia i1 cubre un rango amplio de cuantizaciones (desde IQ1_S hasta Q6_K), lo que permite al usuario elegir el equilibrio entre tamaño, velocidad y calidad en función de su VRAM disponible.

El modelo subyacente es un transformer decoder-only denso de la familia Llama 3.1, adaptado al turco mediante continued pretraining y ajuste por instrucciones con LoRA según los tags de la model card. La relevancia actual es limitada pero específica: el turco es un idioma con cobertura relativamente pobre en modelos abiertos, y disponer de cuantizaciones GGUF listas para llama.cpp facilita su despliegue en entornos sin infraestructura de inferencia dedicada. Cabe señalar que el repositorio acumula 44 descargas y 0 likes, y que no se han publicado resultados de benchmarks en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.1) |
| Parámetros totales | 8.095.797.312 (8,1 mil millones) |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | 128.000 tokens según la arquitectura Llama 3.1 8B; no confirmada explícitamente en la model card |
| Tipos de cuantización | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-IQ4_NL, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K |
| Idiomas soportados | turco (tr) |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | GGUF (más fichero imatrix de 0,1 GB para generar cuantizaciones propias) |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3.1 8B: un transformer decoder-only denso con atención por ventanas deslizantes combinada con atención global completa, normalización RMSNorm y activación SwiGLU, tal como se define en la familia Llama 3.1. Al tratarse de una cuantización, esta ficha no introduce cambios arquitectónicos: los pesos se convierten desde el checkpoint HuggingFace original (convert_type: hf) y se cuantizan con soporte de imatrix (output_tensor_quantised: 1, quantize_version: 2), lo que significa que la asignación de bits por tensor se guía por una matriz de importancia calculada sobre datos de calibración en lugar de aplicarse de forma uniforme.

Según los tags de la model card, el modelo base erenzeytunn/Llama-3.1-8B-Turkish se construyó mediante continued pretraining sobre Llama 3.1 8B seguido de instruction tuning con LoRA, con el objetivo de adaptar el modelo al turco. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO. El autor de la cuantización indica además que existen cuantizaciones estáticas equivalentes en un repositorio separado, y que las variantes i1 suelen ofrecer mejor relación calidad/tamaño que las estáticas de tamaño similar.

## Capacidades

- Generación de texto conversacional en turco, con formato de instrucciones heredado del ajuste del modelo base.
- Comprensión y generación de texto en turco como idioma principal y único declarado en la model card.
- Razonamiento y respuesta a preguntas generales en turco, sujeto a la calidad del ajuste del modelo base (no evaluada en este repositorio).
- Ejecución local en CPU y GPU gracias al formato GGUF, con soporte de offload parcial de capas a VRAM.
- Uso como modelo base para ajuste fino adicional en turco (continued pretraining o LoRA) partiendo de los pesos HuggingFace originales.
- Capacidades de tool calling, function calling, agentes y razonamiento multi-paso: no disponibles en la información proporcionada.
- Capacidades de visión o audio: no disponibles (modelo estrictamente de texto).
- Modo thinking o razonamiento explícito: no disponible.

## Casos de uso

- Atención al cliente en turco: el modelo puede gestionar conversaciones multi-turno en turco y, si se confirma la ventana de 128.000 tokens heredada de Llama 3.1 8B, mantener historiales de conversación muy largos sin truncado agresivo. Es adecuado porque el ajuste está específicamente orientado al turco, idioma con poca cobertura en modelos abiertos de este tamaño.
- Despliegue en hardware de consumo: con la cuantización i1-Q4_K_M (5,1 GB) el modelo cabe en una GPU de 8 GB de VRAM, lo que permite ofrecer asistencia en turco desde un portátil o una estación de trabajo sin GPU dedicada de datacenter.
- Generación y revisión de contenido editorial en turco: redacción de borradores, resúmenes y reescritura de textos en turco en pipelines por lotes, usando llama.cpp en CPU para abaratar costes frente a APIs propietarias.
- Traducción asistida y localización: combinado con un motor de traducción o como post-editor, el modelo puede pulir y adaptar texto en turco en flujos de localización de productos, aprovechando su especialización monolingüe.
- Sistemas RAG sobre documentación turca: indexación de manuales, contratos o normativa en turco y generación de respuestas fundamentadas, con el modelo como generador final en una arquitectura de recuperación previa.
- Base para ajuste específico de dominio: al partir de los pesos HuggingFace del modelo base y no solo del GGUF, un equipo puede aplicar LoRA sobre turco legal, médico o financiero y después cuantizar de nuevo con el fichero imatrix incluido.
- Prototipado e investigación en PLN turco: evaluación cualitativa de un modelo de 8B en turco sin necesidad de infraestructura de GPU de gama alta, útil para comparar enfoques de continued pretraining.
- Asistente offline en entornos con restricciones de conectividad: al ser un GGUF ejecutable localmente, encaja en escenarios donde no se permite enviar datos a servicios externos, siempre que el contenido sea en turco.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio de cuantización no incluye métricas de MMLU, HumanEval, GSM8K ni de evaluaciones específicas en turco, y tampoco se han proporcionado datos del modelo base. No se dispone de cifras de perplejidad por cuantización más allá del gráfico genérico de comparación de tipos de cuantización enlazado por el autor.

## Requisitos de hardware

- VRAM estimada para inferencia según el tamaño de fichero, con overhead de contexto y caché KV (valores orientativos calculados a partir de los tamaños publicados):
  - i1-IQ1_S (2,2 GB): ~3 GB de VRAM, calidad muy degradada.
  - i1-IQ2_M (3,1 GB): ~4 GB de VRAM.
  - i1-IQ3_M / i1-IQ3_S (3,8-3,9 GB): ~5 GB de VRAM.
  - i1-Q4_K_M (5,1 GB): ~6-7 GB de VRAM; opción recomendada por el autor.
  - i1-Q5_K_M (5,9 GB): ~7-8 GB de VRAM.
  - i1-Q6_K (6,7 GB): ~8-9 GB de VRAM.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para cuantizaciones Q4 a Q6; A100 o H100 solo si se busca serving concurrente o contexto muy largo, no por requisito de tamaño.
- Cabe en GPU de consumo: sí, desde una RTX 3060 de 12 GB o incluso GPUs de 8 GB con las cuantizaciones Q4_K_M o inferiores. En Apple Silicon, cualquier equipo con 16 GB de memoria unificada ejecuta las variantes Q4 y Q5 con comodidad.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, text-generation-webui y cualquier runtime compatible con GGUF. El fichero imatrix permite además generar cuantizaciones propias con llama.cpp.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de tokens por segundo para este repositorio.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| mradermacher/Llama-3.1-8B-Turkish-i1-GGUF | 8,1 B | 128.000 tokens según arquitectura base | tr | llama3.1 | GGUF (i1, 2,2-6,7 GB) | Cuantización ponderada con imatrix; sin benchmarks publicados |
| erenzeytunn/Llama-3.1-8B-Turkish | 8,1 B | 128.000 tokens según arquitectura base | tr | llama3.1 | safetensors (HuggingFace) | Modelo base original; pesos completos, requiere GPU de mayor VRAM |
| mradermacher/Llama-3.1-8B-Turkish-GGUF | 8,1 B | 128.000 tokens según arquitectura base | tr | llama3.1 | GGUF (cuantizaciones estáticas) | Misma procedencia, sin ponderación imatrix; el autor indica que las i1 suelen ser preferibles a igual tamaño |
| meta-llama/Llama-3.1-8B-Instruct | 8,1 B | 128.000 tokens | multilingüe (incluye cobertura limitada de turco) | llama3.1 | safetensors, GGUF de terceros | Referencia generalista; sin ajuste específico en turco, rendimiento en turco no comparable por falta de datos públicos en esta información |

No se dispone de comparativas de rendimiento cuantitativas entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- No se han publicado benchmarks: no hay evidencia cuantitativa de la calidad del ajuste en turco ni del impacto de cada nivel de cuantización en tareas concretas.
- Sesgos conocidos: no disponibles. Al derivar de Llama 3.1, hereda los sesgos del modelo original, pero no se ha documentado un análisis específico para la versión turca.
- Riesgo de alucinación: presente como en cualquier modelo de 8B sin verificación factual; el continued pretraining sobre un corpus no especificado puede aumentar el riesgo en dominios especializados.
- Limitación de idioma: la model card declara únicamente turco (tr). El rendimiento en castellano, inglés u otros idiomas no está garantizado y probablemente sea inferior al de un modelo multilingüe equivalente.
- Degradación por cuantización: las variantes IQ1_S (2,2 GB), IQ1_M (2,3 GB) y Q2_K_S (3,1 GB) están etiquetadas por el propio autor con advertencias explícitas de calidad muy baja o uso "desesperado". No se recomiendan para producción.
- Restricciones de licencia: la licencia llama3.1 (Llama 3.1 Community License) impone condiciones de uso comercial, obligaciones de atribución y una cláusula de escala que obliga a solicitar licencia a Meta si se superan los 700 millones de usuarios mensuales. Es responsabilidad del integrador revisar los términos.
- Confusión de repositorios: este repositorio contiene únicamente artefactos GGUF derivados; si se necesita ajuste fino, hay que acudir a los pesos safetensors del modelo base original.
- Tamaño del repositorio: 94,8 GB en total, por lo que clonar el repositorio completo es costoso; conviene descargar solo el fichero GGUF del nivel de cuantización deseado.
- Ausencia de datos sobre entrenamiento: se desconoce el volumen y la composición del corpus turco, lo que dificulta evaluar la cobertura de dominios y el riesgo de contaminación.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Llama-3.1-8B-Turkish-i1-GGUF
- Modelo base: https://huggingface.co/erenzeytunn/Llama-3.1-8B-Turkish
- Cuantizaciones estáticas del mismo modelo: https://huggingface.co/mradermacher/Llama-3.1-8B-Turkish-GGUF
- Fichero imatrix: https://huggingface.co/mradermacher/Llama-3.1-8B-Turkish-i1-GGUF/resolve/main/Llama-3.1-8B-Turkish.imatrix.gguf
- Página de resumen del autor para este modelo: https://hf.tst.eu/model#Llama-3.1-8B-Turkish-i1-GGUF
- Guía de uso de ficheros GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de tipos de cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/

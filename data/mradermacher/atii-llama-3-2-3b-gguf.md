# mradermacher/Atii-Llama-3.2-3B-GGUF

## Resumen

`mradermacher/Atii-Llama-3.2-3B-GGUF` es un repositorio de cuantizaciones estáticas en formato GGUF del modelo `BIBLIOKLEPT/Atii-Llama-3.2-3B`, un fine-tune de Llama 3.2 3B con 3.606.764.608 parámetros (aproximadamente 3,6 mil millones). El autor del repositorio es mradermacher, que actúa únicamente como cuantizador: no entrena ni modifica el modelo, sino que convierte los pesos originales en safetensors a GGUF con distintas precisiones para su uso en llama.cpp y ecosistemas compatibles.

La relevancia del artefacto es práctica: permite ejecutar un modelo de 3B afilado para razonamiento (las etiquetas del repositorio incluyen `reasoning` y `cot`, cadena de pensamiento) en hardware de consumo, desde tarjetas gráficas con 4-6 GB de VRAM hasta CPU pura, con un rango de tamanos que va de 1,6 GB (Q2_K) a 7,3 GB (f16). Se ofrecen doce variantes de cuantización, incluyendo IQ4_XS y las habituales Q4_K_M y Q8_0.

Conviene advertir de entrada que el repositorio no incluye model card técnica del fine-tune, no publica benchmarks, no documenta el dataset de entrenamiento y cuenta con cero descargas y cero likes en el momento de la consulta. Además, las cuantizaciones son estáticas: el autor indica que no hay versiones con imatrix o ponderadas disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, derivada de Llama 3.2 3B; hiperparámetros concretos (capas, dimensión oculta, cabezas) no disponibles en la información proporcionada |
| Parámetros totales | 3.606.764.608 (dato de safetensors del modelo base) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 (todas estáticas, sin imatrix) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | `llama3.2` (Llama 3.2 Community License) |
| Formato de pesos | GGUF en este repositorio; safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo subyacente es un fine-tune de Llama 3.2 3B, por lo que hereda la arquitectura transformer decoder-only de esa familia. El repositorio consultado no documenta el número de capas, la dimensión del modelo, el uso de atención con consultas agrupadas (GQA), la posición rotatoria (RoPE) ni el tokenizador empleado; estos datos deben consultarse en la ficha del modelo base. El identificador y las etiquetas (`llama`, `qwen`) no permiten confirmar si el fine-tune se entrenó sobre Llama 3.2 o si incorpora alguna destilación o mezcla con modelos Qwen.

Respecto al entrenamiento, la información disponible es mínima: las etiquetas `reasoning` y `cot` sugieren un ajuste orientado a generar cadenas de razonamiento explícitas antes de la respuesta final. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF, DPO o SFT supervisado. Tampoco se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal o modos de pensamiento conmutables).

En la parte de cuantización sí hay detalle técnico: mradermacher emplea `quantize_version: 2` con `output_tensor_quantised: 1` y conversión desde Hugging Face, generando cuantizaciones estáticas de tipo K-quant e I-quant. No se han publicado variantes ponderadas ni con matriz de importancia (imatrix), lo que penaliza la calidad relativa en los niveles de bit por peso más bajos (Q2_K y Q3_K_S).

## Capacidades

- Generación de texto conversacional multi-turno, según la etiqueta `conversational` del repositorio.
- Razonamiento con cadena de pensamiento (chain of thought), según las etiquetas `reasoning` y `cot`; no se detalla si el modo de pensamiento es explícito y conmutable.
- Compatibilidad declarada con `vllm` y con `endpoints_compatible`, orientada a servidores de inferencia con API compatible con OpenAI.
- Ejecución en llama.cpp y derivados gracias al formato GGUF, incluida la inferencia en CPU.
- Capacidad multilingüe limitada al inglés: no se declaran otros idiomas.
- No se documentan capacidades de tool calling, function calling, uso de agentes, visión, audio ni matemáticas avanzadas. Cualquier afirmación al respecto sería especulativa.

## Casos de uso

- Prototipado local de asistentes conversacionales: con la variante Q4_K_M (2,3 GB) el modelo cabe en tarjetas de 4-6 GB de VRAM o en CPU con 8 GB de RAM, lo que permite iterar en un portátil sin acceso a GPU de centro de datos.
- Pruebas de pipelines de razonamiento: las etiquetas `reasoning` y `cot` lo hacen adecuado para evaluar la calidad de trazas de pensamiento en tareas de lógica sencilla antes de escalar a modelos mayores.
- Despliegue en entornos con requisitos de soberanía del dato: al ejecutarse en local con llama.cpp u Ollama, no requiere enviar prompts a servicios externos, lo que simplifica el cumplimiento en entornos con datos sensibles.
- Servicio de inferencia ligero: la etiqueta `endpoints_compatible` y el tag `vllm` permiten integrarlo detrás de una API compatible con OpenAI para aplicaciones internas de baja concurrencia.
- Comparación de calidades entre cuantizaciones: el repositorio ofrece doce niveles, por lo que sirve como banco de pruebas para medir la degradación de perplejidad entre Q2_K y Q8_0 sobre una misma tarea.
- Generación de texto en dispositivos de borde: la variante Q2_K (1,6 GB) o Q3_K_S (1,8 GB) permite ejecutar el modelo en dispositivos con memoria muy limitada, aceptando la pérdida de calidad asociada.
- Filtrado y clasificación de texto en inglés: al ser un modelo conversacional de 3B, puede emplearse para etiquetado o resumen de documentos en inglés en lotes, siempre con validación humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica, y el modelo base `BIBLIOKLEPT/Atii-Llama-3.2-3B` tampoco aporta datos en la información proporcionada. Tampoco hay mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM estimada (solo pesos, según tabla del autor): 1,6 GB en Q2_K; 2,2 GB en IQ4_XS y Q4_K_S; 2,3 GB en Q4_K_M; 3,1 GB en Q6_K; 3,9 GB en Q8_0; 7,3 GB en f16. A esta cifra hay que sumar la caché KV y el overhead del runtime, que dependen del contexto configurado y no están documentados.
- GPU de consumo: cualquier tarjeta con 6 GB o más (RTX 3060, RTX 4060, RTX 2060, GTX 1660 Super) ejecuta con holgura Q4_K_M y Q5_K_M con contextos moderados. Las variantes Q2_K y Q3_K_S caben en GPUs de 4 GB.
- GPU de centro de datos: A100, H100 o L40S no son necesarias para un modelo de 3,6B; resultan sobredimensionadas salvo que se busque alta concurrencia con vLLM.
- CPU: las cuantizaciones Q4 y Q5 son viables en CPU con 8-16 GB de RAM; Q8_0 y f16 requieren más memoria y son menos recomendables en ese escenario.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y servidores basados en llama.cpp para GGUF; vLLM requeriría normalmente los pesos en safetensors del modelo base, ya que su soporte de GGUF es limitado.
- Latencia y throughput: no disponibles. No se han publicado mediciones y no deben extrapolarse sin verificación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Atii-Llama-3.2-3B (GGUF) | 3,6B | No disponible | Llama 3.2 | GGUF |
| Llama 3.2 3B Instruct | 3,2B | 128 000 tokens (según ficha pública del modelo base) | Llama 3.2 | safetensors, GGUF |
| Qwen2.5 3B Instruct | 3,1B | 32 768 tokens nativos (según ficha pública) | Apache 2.0 | safetensors, GGUF |
| Phi-3.5-mini-instruct | 3,8B | 128 000 tokens (según ficha pública) | MIT | safetensors, GGUF |

Rendimiento comparado: no disponible. No existen benchmarks publicados de este fine-tune, por lo que no es posible afirmar si supera o no a los modelos de la tabla en razonamiento, código o matemáticas. Los datos de contexto y licencia de las filas comparativas provienen de las fichas públicas de dichos modelos y no han sido verificados en la búsqueda que origina esta ficha.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de que el fine-tune mejore a Llama 3.2 3B en razonamiento; las etiquetas `reasoning` y `cot` son declarativas.
- Modelo monolingüe en inglés: no se declara soporte de castellano ni de otros idiomas, por lo que su uso en producción en español requeriría evaluación previa.
- Riesgo de alucinación propio de un modelo de 3B, agravado en las cuantizaciones Q2_K y Q3_K_S, que degradan la perplejidad de forma notable.
- Sesgos no documentados: el autor no publica información sobre composición del dataset ni sobre evaluaciones de sesgo, toxicidad o robustez.
- Cuantizaciones estáticas sin imatrix: el propio autor indica que las versiones ponderadas no están disponibles, lo que reduce la calidad a igualdad de tamano frente a alternativas con imatrix.
- Restricciones de licencia: la Llama 3.2 Community License impone condiciones de uso aceptable y una cláusula de licencia adicional para despliegues con más de 700 millones de usuarios mensuales; su uso comercial es posible, pero debe revisarse el texto completo.
- Repositorio sin tracción: cero descargas y cero likes en el momento de la consulta, sin validación por parte de la comunidad.
- Metadatos atípicos: las fechas de creación y actualización (2026-10-23) no son coherentes con el resto de la información, lo que aconseja tratar los metadatos del repositorio con cautela.
- El tag `qwen` en un modelo basado en Llama no está explicado en la documentación y no debe interpretarse como una capacidad adicional.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Atii-Llama-3.2-3B-GGUF
- Modelo base: https://huggingface.co/BIBLIOKLEPT/Atii-Llama-3.2-3B
- Página de descargas del cuantizador: https://hf.tst.eu/model#Atii-Llama-3.2-3B-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfica comparativa de perplejidad por tipo de cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Empresa del autor: https://www.nethype.de/

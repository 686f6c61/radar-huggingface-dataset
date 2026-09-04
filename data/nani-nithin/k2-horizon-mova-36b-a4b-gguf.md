# NANI-Nithin/K2-Horizon-MoVA-36B-A4B-GGUF

## Resumen

K2-Horizon-MoVA-36B-A4B es un modelo de lenguaje de gran tamaño desarrollado por el Institute of Foundation Models (IFM) de MBZUAI, presentado el 3 de septiembre de 2026. Se trata de la variante dispersa (sparse) de la familia K2-Horizon, que combina una arquitectura Mixture-of-Experts (MoE) con un mecanismo de atención novedoso denominado Mixture-of-Values (MoVA). El modelo almacena aproximadamente 36 mil millones de parámetros en total, pero activa solo unos 4 mil millones por token, lo que permite un coste computacional reducido sin sacrificar la capacidad de razonamiento.

La arquitectura `k2_horizon` (`K2HorizonForCausalLM`) incluye 48 capas, de las cuales 3 son densas y 45 son capas MoE con 100 expertos enrutados (8 activos más 1 compartido por capa). Además, la atención MoVA sustituye las proyecciones de valor por un conjunto de 64 expertos de valor, de los que se activan 4 por token. El modelo soporta una ventana de contexto nativa de 512K tokens (524.288), lo que lo hace especialmente adecuado para tareas que requieren un contexto muy largo.

Esta ficha se centra en la versión cuantizada en formato GGUF publicada por NANI-Nithin, que incluye múltiples cuantizaciones (desde BF16 hasta IQ2_M) generadas a partir del checkpoint BF16 original de IFM. Estas cuantizaciones permiten ejecutar el modelo en hardware más asequible, aunque requieren un fork específico de llama.cpp mientras el soporte de la arquitectura `k2_horizon` no se integra en el proyecto upstream.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `k2_horizon` (`K2HorizonForCausalLM`) |
| Parametros totales | 37.444.792.020 (≈37.4 B según safetensors; la model card indica ~36 B) |
| Parametros activos | ~4 B por token |
| Longitud de contexto | 512 K tokens (524.288, nativo) |
| Tipos de cuantización | BF16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_1, Q5_0, Q4_K_M, Q4_K_S, Q4_1, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_NL, IQ4_XS, IQ3_M, IQ3_XS, IQ3_XXS, IQ2_M |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repo); el modelo original está disponible en safetensors BF16 |

## Arquitectura y entrenamiento

K2-Horizon-MoVA-36B-A4B es un modelo Mixture-of-Experts (MoE) con arquitectura `k2_horizon`. Está compuesto por 48 capas en total: 3 capas densas iniciales y 45 capas MoE. En cada capa MoE, el modelo utiliza 100 expertos enrutados, de los que se activan 8 más 1 experto compartido por token. El tamaño oculto es de 2.560 dimensiones y los embeddings de entrada y salida no están atados (untied), es decir, existen matrices separadas para input y output.

La innovación principal es el mecanismo Mixture-of-Values (MoVA), que aplica el mismo principio de enrutamiento disperso al interior de la atención. Las proyecciones de valor se sustituyen por un conjunto de 64 expertos de valor, de los que se activan 4 por token. Esto permite almacenar un repertorio más rico de representaciones en el espacio de valores sin pagar el coste completo de todos los expertos en cada token, complementando la sparsity de la red feed-forward.

En cuanto al entrenamiento, no se han proporcionado detalles específicos en la información disponible sobre el número de tokens, la composición del dataset o la aplicación de técnicas como RLHF o DPO. El blog de IFM (ifm.ai/blog/k2) indica que, bajo las mismas condiciones de entrenamiento, el modelo rinde ligeramente por debajo del modelo denso Horizon 32B, pero requiere sustancialmente menos parámetros activos por token. El checkpoint original se publicó en precisión BF16.

## Capacidades

- Generación de texto y razonamiento: el modelo está etiquetado con la capacidad de razonamiento (tag "reasoning") y su arquitectura MoE/MoVA está diseñada para tareas que requieren un equilibrio entre capacidad y eficiencia.
- Contexto largo: soporta una ventana nativa de 512K tokens (524.288), lo que permite procesar documentos muy extensos sin fragmentación.
- Eficiencia computacional: activa aproximadamente 4 mil millones de parámetros por token, lo que reduce el coste de inferencia en comparación con un modelo denso del mismo tamaño.
- Atención MoVA: el mecanismo Mixture-of-Values permite un espacio de valores más rico sin coste completo, mejorando potencialmente la calidad de la representación.
- Multilingüismo: según los metadatos, el modelo está entrenado únicamente en inglés (en).
- Tool calling / function calling: no se especifica en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no se especifica explícitamente, aunque el contexto largo y la capacidad de razonamiento lo hacen plausible.
- Visión, audio u otras modalidades: no disponible.

## Casos de uso

- Análisis de documentos extensos: gracias a la ventana de contexto de 512K tokens, el modelo puede procesar informes, contratos o libros completos sin necesidad de dividir el texto en fragmentos, lo que facilita tareas como resumen, extracción de información o respuesta a preguntas sobre el contenido íntegro.
- Asistentes conversacionales de largo alcance: el contexto amplio permite mantener conversaciones multi-turno con un historial muy extenso, preservando el hilo de la conversación durante sesiones largas.
- Generación de código en repositorios grandes: la capacidad de razonamiento y el contexto largo permiten analizar archivos de código extensos o proyectos completos, facilitando tareas de refactorización, documentación o depuración.
- Investigación académica sobre arquitecturas MoE: el modelo es útil para estudiar el comportamiento de la combinación MoE con MoVA, especialmente en entornos de investigación con recursos limitados gracias a sus 4B parámetros activos.
- Procesamiento de logs y telemetría: con una ventana de contexto nativa de 512K, puede analizar secuencias extensas de eventos, logs de sistemas o datos de telemetría para detectar patrones o anomalías.
- Despliegue en hardware de gama media: gracias a las cuantizaciones GGUF disponibles (por ejemplo, Q4_K_M con ~20 GiB), el modelo puede ejecutarse en una GPU de consumo de 24 GB (como una RTX 3090/4090), lo que permite ofrecer capacidades de razonamiento avanzadas sin necesidad de clústeres de GPUs.
- Documentación automática de bases de conocimiento: el modelo puede procesar grandes volúmenes de texto técnico y generar resúmenes o entradas de documentación coherentes, aprovechando su contexto largo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El blog de IFM menciona que, bajo las mismas condiciones de entrenamiento, el modelo rinde ligeramente por debajo del modelo denso Horizon 32B, pero no se ofrecen cifras concretas. No se dispone de datos de MMLU, HumanEval, GSM8K u otras métricas comparativas.

## Requisitos de hardware

Los siguientes valores son estimaciones solo para el peso del modelo, sin incluir KV cache, overhead de runtime ni el espacio necesario para el contexto. No son requisitos mínimos de VRAM/RAM.

- BF16: ~70 GiB. Requiere al menos 2×48 GB de GPU (A6000, H100 80 GB).
- Q8_0: ~35 GiB. Requiere 2×24 GB de GPU.
- Q5_K_M: ~23 GiB. Puede ejecutarse en 1×24 GB o 2×16 GB.
- Q4_K_M: ~20 GiB. Requiere 1×24 GB de GPU.
- Q3_K_M: ~15 GiB. Requiere 1×16 GB de GPU.
- Q2_K / IQ2_M: ~10-11 GiB. Puede ejecutarse en 1×12 GB de GPU.

GPU recomendadas: para cuantizaciones altas (Q4/Q5), una RTX 3090/4090 de 24 GB es suficiente. Para BF16 o Q8_0, se necesitan GPUs de centro de datos como A6000 o H100. Para cuantizaciones muy agresivas (Q2/IQ2), una GPU de 12 GB puede bastar.

Opciones de despliegue:
- llama.cpp: requiere compilar el fork MBZUAI-IFM (rama `model/K2Horizon`) hasta que el soporte de la arquitectura `k2_horizon` se fusione en upstream.
- vLLM o SGLang: pueden servir el checkpoint BF16 original (safetensors) con tensor parallelism. La model card muestra un ejemplo con vLLM usando `--tensor-parallel-size 2`.
- Ollama, TGI: no se mencionan en la información disponible.

Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados en la información proporcionada. El blog de IFM sitúa el modelo ligeramente por debajo del denso Horizon 32B en rendimiento, pero sin cifras. A nivel de especificaciones, se puede comparar con otros MoE de tamaño similar:

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia |
|---|---|---|---|---|
| K2-Horizon-MoVA-36B-A4B | ~36 B | ~4 B | 512 K | Apache 2.0 |
| Horizon 32B (denso) | 32 B | 32 B | no disponible | no disponible |
| Mixtral 8x7B | 46.7 B | 12.9 B | 32 K | Apache 2.0 |
| Qwen2.5-MoE-30B-A3B | 30 B | 3 B | 128 K | Apache 2.0 |

Nota: los datos de Mixtral 8x7B y Qwen2.5-MoE-30B-A3B provienen de conocimiento general, no de la información proporcionada. No se dispone de datos de rendimiento comparativos.

## Limitaciones y advertencias

- Sesgos: no se han documentado sesgos específicos en la información disponible.
- Riesgo de alucinación: al ser un modelo de lenguaje autoregresivo, existe riesgo de generar contenido falso o incoherente, especialmente en tareas abiertas. No se proporcionan datos sobre la tasa de alucinación.
- Limitaciones de idioma: el modelo está entrenado únicamente en inglés, por lo que su rendimiento en otros idiomas será limitado o nulo.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se mantenga el aviso de copyright y se indiquen los cambios.
- Caveat importante para producción: la arquitectura `k2_horizon` no está soportada en llama.cpp upstream. Es imprescindible usar el fork de MBZUAI-IFM (rama `model/K2Horizon`) o esperar a que se fusione el PR. Esto puede dificultar el despliegue en entornos que dependen de versiones estables de llama.cpp.
- Advertencia de memoria: aunque el modelo activa solo ~4B parámetros por token, todos los ~36B parámetros deben estar residentes en RAM/VRAM durante la inferencia. Las estimaciones de VRAM de la model card son solo para el peso y no incluyen KV cache ni overhead.
- Cuantizaciones IQ: los quants IQ se generaron con una importance matrix calculada sobre el quant Q2_K con 8 fragmentos de 512 tokens de WikiText-2. Esto puede afectar la calidad en dominios distintos a los de calibración.

## Enlaces

- Repositorio GGUF cuantizado: https://huggingface.co/NANI-Nithin/K2-Horizon-MoVA-36B-A4B-GGUF
- Modelo base (safetensors): https://huggingface.co/IFM/K2-Horizon-MoVA-36B-A4B
- GGUF original de IFM: https://huggingface.co/IFM/K2-Horizon-MoVA-36B-A4B-GGUF
- Blog de IFM: https://ifm.ai/blog/k2
- Fork de llama.cpp con soporte `k2_horizon`: https://github.com/MBZUAI-IFM/llama.cpp/tree/model/K2Horizon
- Dataset de calibración WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext

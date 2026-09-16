# ollybritton/Llama-3.2-3B-gsm8k-distill-adfp-lambda256

## Resumen

`ollybritton/Llama-3.2-3B-gsm8k-distill-adfp-lambda256` es un ajuste fino (fine-tune) del modelo denso meta-llama/Llama-3.2-3B, publicado por el usuario ollybritton en HuggingFace. El repositorio contiene únicamente pesos en formato safetensors (6,4 GB) con 3.212.749.824 parámetros, idénticos en arquitectura a los del modelo base, por lo que se trata de una especialización y no de un cambio estructural.

Por el nombre del identificador se deduce que el entrenamiento se ha orientado a razonamiento matemático mediante destilación sobre el conjunto de datos GSM8K, con algún esquema de entrenamiento identificado como "adfp" y un hiperparámetro etiquetado como lambda=256. La model card no documenta ninguno de estos términos, el dataset utilizado, el número de tokens de entrenamiento ni la receta de ajuste, por lo que cualquier afirmación al respecto queda fuera de lo verificable con la información disponible.

El modelo no tiene descargas ni "me gusta" en el momento de la consulta y fue creado el 15 de septiembre de 2026, según los metadatos de HuggingFace. Es relevante como ejemplo de fine-tune de bajo coste sobre un modelo pequeño (3B) orientado a una tarea concreta, pero carece de documentación suficiente para uso en producción sin una evaluación propia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, tipo Llama 3 (heredada del modelo base) |
| Parámetros totales | 3.212.749.824 (3,21 B) |
| Parámetros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | no disponible en la model card; el modelo base Llama 3.2 3B soporta 128.000 tokens |
| Tipos de cuantización | no disponible en el repositorio (solo safetensors); al ser arquitectura Llama 3 son compatibles las cuantizaciones habituales de llama.cpp (Q4_K_M, Q5_K_M, Q8_0) y los formatos AWQ/GPTQ generados por la comunidad |
| Idiomas soportados | no disponible |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | safetensors |
| Modelo base | meta-llama/Llama-3.2-3B |
| Tamaño del repositorio | 6,4 GB |
| Descargas / me gusta | 0 / 0 |
| Fecha de creación | 2026-09-15 |
| Última actualización | 2026-09-15 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Llama 3.2 3B: un transformer decoder-only con normalización RMSNorm pre-norma, activación SwiGLU en la MLP, embeddings rotatorios (RoPE) y atención con consultas agrupadas (GQA). Los tags del repositorio (`llama`, `base_model:meta-llama/Llama-3.2-3B`, `base_model:finetune:meta-llama/Llama-3.2-3B`) confirman que se trata de un ajuste fino sobre los pesos de Meta, sin destilado de capas ni poda que altere el recuento de parámetros.

No hay información sobre el proceso de entrenamiento: ni número de tokens, ni composición del dataset, ni si se aplicaron técnicas de alineación como RLHF, DPO o SFT sobre trazas de razonamiento. El sufijo `gsm8k-distill` sugiere destilación de cadenas de razonamiento a partir de soluciones de GSM8K y `adfp-lambda256` apunta a un hiperparámetro de entrenamiento no documentado; ninguno de los dos extremos puede confirmarse con la model card, que se limita a la línea "Built with Llama".

## Capacidades

- Generación de texto en inglés y otros idiomas: no verificable para este fine-tune; el modelo base declara soporte oficial para inglés, alemán, francés, italiano, portugués, hindi, español y tailandés.
- Razonamiento matemático y aritmético: es la capacidad objetivo del ajuste según el nombre del repositorio (`gsm8k-distill`), aunque no hay evaluación publicada que lo confirme.
- Razonamiento de varios pasos (chain-of-thought): presumiblemente inducido por el entrenamiento sobre trazas de GSM8K; no documentado.
- Generación de código: heredada del modelo base, no verificada en este fine-tune.
- Tool calling / function calling: no documentado; el modelo base Llama 3.2 3B incorpora plantillas de herramientas, pero este ajuste puede haber degradado esa capacidad al especializarse.
- Uso como agente multi-paso: no documentado.
- Capacidades multimodales (visión, audio): no disponibles; el modelo base 3B es exclusivamente de texto.
- Modo "thinking" explícito con etiquetas separadas: no documentado.

## Casos de uso

- Tutor de matemáticas de educación secundaria: el ajuste se orienta a problemas tipo GSM8K, de modo que puede generar soluciones paso a paso para problemas aritméticos de enunciado. Requiere validación propia, ya que no hay benchmarks publicados.
- Generación de datos sintéticos de razonamiento: al estar destilado sobre trazas matemáticas, puede emplearse como generador de soluciones candidatas para ampliar datasets de entrenamiento, filtrando después por verificación con un intérprete simbólico.
- Etiquetado de cadenas de razonamiento para destilación posterior: útil como profesor de bajo coste hacia modelos de 1B o inferiores, dado su tamaño reducido y su coste de inferencia moderado.
- Evaluación de pipelines de razonamiento matemático: sirve como línea base interna para comparar estrategias de prompting (few-shot, self-consistency) sobre problemas GSM8K en un entorno controlado.
- Asistente educativo autoalojado en centros con requisitos de privacidad: al pesar 3,21 B parámetros, puede desplegarse en una GPU de gama media dentro de la infraestructura del centro, sin enviar datos de alumnos a terceros.
- Componente de un sistema de verificación de respuestas: combinado con un ejecutor de Python o un solver simbólico, el modelo puede proponer un plan de resolución que después se valida numéricamente, reduciendo el impacto de alucinaciones aritméticas.
- Investigación sobre especialización vs. olvido catastrófico: dado que el repositorio no documenta retención de capacidades generales, es un caso de estudio útil para medir la degradación en tareas distintas de las matemáticas tras un ajuste especializado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye ninguna tabla de evaluación y los resultados de la búsqueda web no contienen información relacionada con el modelo (las entradas devueltas son definiciones del término inglés "is" y portadas de medios). No se dispone, por tanto, de cifras de GSM8K, MMLU, HumanEval ni de ninguna otra métrica para este fine-tune, ni de comparaciones con el modelo base.

## Requisitos de hardware

- VRAM para los pesos: aproximadamente 6,5 GB en bf16/fp16 (coincide con los 6,4 GB del repositorio), unos 3,4 GB en cuantización de 8 bits y entre 2,0 y 2,5 GB en Q4_K_M.
- Caché KV: la arquitectura del modelo base usa GQA con 8 cabezas KV, dimensión de cabeza 128 y 28 capas, lo que supone unos 112 KiB por token en fp16. A 8.000 tokens de contexto, alrededor de 0,9 GB; a 32.000 tokens, unos 3,5 GB; a 128.000 tokens, unos 14 GB adicionales a los pesos.
- GPU recomendadas: A100 40/80 GB, H100, L40S o A6000 para contextos largos y lotes grandes. Para contextos cortos (4.000-8.000 tokens) basta una RTX 4090, RTX 4080 o RTX 3090 de 24 GB.
- GPU de consumo: sí cabe en GPUs de 8 GB con cuantización Q4 o Q5 (RTX 3060 Ti, RTX 2070, RTX 4060); en 6 GB es viable con Q4 y contexto reducido. También puede ejecutarse en CPU con llama.cpp, con velocidades del orden de pocos tokens por segundo.
- Opciones de despliegue: transformers (PyTorch), vLLM, SGLang, TGI, llama.cpp, Ollama y LM Studio. Para batching en servidor, vLLM o SGLang son las opciones con mejor throughput; para equipos sin GPU, llama.cpp u Ollama.
- Latencia y throughput: no disponible. No hay mediciones publicadas para este repositorio y cualquier estimación dependería del hardware, la cuantización y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento en matemáticas |
|---|---|---|---|---|---|
| Este modelo (Llama-3.2-3B-gsm8k-distill-adfp-lambda256) | 3,21 B | no disponible (base: 128.000) | Llama 3.2 Community | Repositorio público, 0 descargas | no disponible |
| meta-llama/Llama-3.2-3B | 3,21 B | 128.000 tokens | Llama 3.2 Community | Ampliamente desplegado, GGUF/AWQ/GPTQ de la comunidad | Métricas publicadas por Meta en su model card (no verificadas aquí) |
| meta-llama/Llama-3.2-1B | 1,24 B | 128.000 tokens | Llama 3.2 Community | Muy extendido en entornos de bajos recursos | Inferior al 3B en tareas de razonamiento |
| Qwen2.5-3B | 3,09 B | 32.000 tokens (128.000 con RoPE scaling) | Apache 2.0 | Amplia disponibilidad, cuantizaciones oficiales | Métricas publicadas por el equipo de Qwen (no verificadas aquí) |

La principal diferencia de este repositorio frente a las alternativas es la ausencia de documentación y de evaluaciones: los tres modelos comparados cuentan con model cards detalladas, mientras que este solo aporta la línea "Built with Llama". La licencia Llama 3.2 Community permite uso comercial con condiciones, a diferencia de la Apache 2.0 de Qwen2.5.

## Limitaciones y advertencias

- Ausencia total de documentación: no se especifican dataset, hiperparámetros, número de épocas ni metodología de evaluación, lo que impide reproducir el entrenamiento o auditar sus resultados.
- Riesgo elevado de alucinación en matemáticas: un modelo de 3B sin verificación simbólica externa puede producir cadenas de razonamiento plausibles con resultados incorrectos.
- Posible olvido catastrófico: al ser un ajuste especializado en GSM8K, es probable la degradación de capacidades generales (código, instrucciones, conversación abierta) respecto al modelo base; no hay evaluación que lo cuantifique.
- Sesgos: no evaluados. El modelo hereda los sesgos de los datos de preentrenamiento de Llama 3.2, que Meta documenta en su propia model card.
- Idiomas: la model card no declara idiomas soportados para este fine-tune; el ajuste sobre GSM8K, mayoritariamente en inglés, puede haber reducido el rendimiento multilingüe del modelo base.
- Licencia: la Llama 3.2 Community License impone condiciones al uso comercial (cesión de la licencia a usuarios finales, obligaciones de atribución con la mención "Built with Llama" y restricciones de uso aceptable). Es obligatorio revisar el texto completo antes de integrarlo en un producto.
- Repositorio sin tracción: cero descargas y cero interacciones reducen la probabilidad de que existan cuantizaciones de terceros, informes de errores o validaciones independientes.
- Fecha de creación futura en los metadatos (2026-09-15): conviene verificar la procedencia del repositorio antes de utilizarlo en entornos productivos.
- No se ha publicado ningún dato sobre el significado de `adfp` ni `lambda256`; no debe asumirse que correspondan a una técnica conocida.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/ollybritton/Llama-3.2-3B-gsm8k-distill-adfp-lambda256
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B
- Licencia Llama 3.2 Community: https://www.llama.com/llama3_2/license/
- Conjunto de datos GSM8K: https://huggingface.co/datasets/openai/gsm8k
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante (las entradas devueltas corresponden a definiciones del término inglés "is" y a portadas de medios de comunicación, sin relación con el modelo).

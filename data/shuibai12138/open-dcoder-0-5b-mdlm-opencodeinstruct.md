# Shuibai12138/Open-Dcoder-0.5B-MDLM-OpenCodeInstruct

## Resumen

Open-Dcoder-0.5B-MDLM-OpenCodeInstruct es un modelo de lenguaje de difusión enmascarada (masked diffusion language model, MDLM) de 0,63 mil millones de parámetros, publicado por el usuario Shuibai12138. Se trata de un ajuste del modelo base fredzzp/open-dcoder-0.5B (revisión `d0d86d5b9996`) durante 2.000 pasos adicionales sobre el corpus público nvidia/OpenCodeInstruct, empleando el objetivo de difusión enmascarada absorbente estándar. Su función principal es servir como control experimental: es la mitad "MDLM" de una pareja emparejada cuyo otro miembro es Shuibai12138/Open-Dcoder-0.5B-CDLM-OpenCodeInstruct, entrenado de forma idéntica salvo por la función objetivo (CDLM, *Corrective Diffusion Language Models*).

El modelo forma parte del material de código asociado al artículo *Corrective Diffusion Language Models* (NeurIPS 2026), pero el propio autor advierte explícitamente de que no es uno de los modelos del artículo: los modelos de 0,5B del paper se entrenaron sobre Nemotron-SFT-Code, un corpus con acceso restringido y licencia solo para entrenamiento interno. Esta pareja reutiliza el mismo código e hiperparámetros sobre un corpus público y sin gating, de modo que cualquier persona pueda reproducir y comparar la receta. En consecuencia, los resultados obtenidos con este modelo no son los resultados del artículo.

Su relevancia es fundamentalmente metodológica: permite estudiar de forma reproducible el comportamiento de un objetivo de difusión enmascarada puro frente a una variante correctiva sobre datos de código abiertos, además de explorar las ventajas de la atención bidireccional para tareas de relleno y corrección de código. No es un modelo orientado a producción ni a uso conversacional general.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Qwen2 con atención bidireccional y logits desplazados, entrenado con objetivo de difusión enmascarada absorbente (MDLM); implementación de difusión específica, no causal |
| Parametros totales | 630.167.424 (aproximadamente 0,63B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el entrenamiento usó secuencias de 4.096 tokens empaquetados) |
| Tipos de cuantizacion | no disponible; solo se publican pesos en safetensors (bf16); no hay versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | código (campo `language: code` de la model card); el soporte de lenguaje natural no está declarado |
| Licencia | MIT (pesos); datos de entrenamiento bajo CC BY 4.0 (NVIDIA) |
| Formato de pesos | safetensors (repositorio de 1,3 GB, compatible con bf16/fp16) |

## Arquitectura y entrenamiento

La arquitectura reutiliza el grafo de Qwen2, pero sustituye la atención causal por atención bidireccional y aplica un desplazamiento de logits, siguiendo la formulación de los modelos de difusión enmascarada. El autor advierte que cargar el modelo con `AutoModelForCausalLM` produce un modelo Qwen2 causal y salidas incorrectas: es obligatorio usar el pipeline de evaluación del repositorio zhangshuibai/CDLM, que detecta los modelos cuyo nombre contiene `open-dcoder` y los carga con la implementación de difusión de Qwen2.

El entrenamiento consistió en 2.000 pasos sobre nvidia/OpenCodeInstruct (revisión `8f3ba5bafe4d`), usando los 50 shards en orden y renderizando cada fila como `"input: " + input + " output: " + output`, sin filtrado. Los hiperparámetros del objetivo fueron `mixture_prob=0.0`, `noise_token_wt=0.0` y `clean_token_wt=0.0`, es decir, el control MDLM emparejado con el objetivo CDLM. Se usó el optimizador AdamW con learning rate máximo de 3e-4, scheduler coseno con 20.345 pasos de warmup (lr en el paso 2.000 = 2,95e-5), weight decay 0,01, grad clip 1,0 y precisión bf16. El batch global fue de 12 secuencias por 4.096 tokens empaquetados (micro batch 3 en 4 GPUs). Se congelaron `lm_head` y `embed_tokens`, y se fijó la semilla 42. El coste total fue de unos 19 minutos en 4 x A100-PCIE-40GB. Los 2.000 pasos corresponden a una versión truncada de un schedule de 20.345.053 pasos, el mismo esquema de horizonte largo que usa el CDLM-0.5B del artículo. El repositorio incluye `training_config.yaml` con la configuración resuelta por el entrenador.

## Capacidades

- Generación de código dentro del paradigma de difusión: produce secuencias mediante un proceso de denoising iterativo en lugar de decodificación autorregresiva token a token.
- Relleno y edición de código (*infilling*): la atención bidireccional permite condicionar sobre tokens a izquierda y derecha, lo que encaja de forma natural con tareas de completado de huecos y corrección.
- Corrección de código: el modelo incluye la etiqueta explícita `code-correction`, y el formato de entrenamiento (`input` seguido de `output`) corresponde a pares de problema y solución.
- Generación de texto técnico asociado a código: la `pipeline_tag` es `text-generation` y el modelo está etiquetado como `conversational`, aunque sin plantilla de chat documentada.
- Sin soporte declarado de tool calling ni function calling.
- Sin soporte declarado de agentes ni razonamiento multi-paso.
- Multilingüismo: limitado al dominio del código según la model card; el comportamiento en lenguajes naturales distintos del inglés no está documentado.
- Sin modalidades adicionales: no hay visión, audio ni modo de razonamiento explícito (*thinking mode*).

## Casos de uso

- Reproducción de experimentos de difusión enmascarada: sirve como control MDLM frente al modelo hermano CDLM entrenado con idénticos datos e hiperparámetros, lo que permite aislar el efecto de la función objetivo en un entorno público y sin gating.
- Corrección automática de fragmentos de código: dado un par `input`/`output`, el modelo se usa para reescribir fragmentos erróneos aprovechando la atención bidireccional, que puede considerar el contexto posterior al error.
- Relleno de código en editores (fill-in-the-middle): la arquitectura bidireccional permite completar un hueco entre un prefijo y un sufijo, ideal para prototipos de asistencia de edición en IDE sin requerir un modelo causal grande.
- Docencia e investigación académica: su tamaño de 0,63B y su entrenamiento de 19 minutos en 4 x A100 lo convierten en un banco de pruebas asequible para estudiar dinámicas de difusión, schedules de ruido y objetivos alternativos.
- Experimentos de ajuste fino sobre corpus de código propietarios: al ser MIT y estar libre de restricciones de gating, puede usarse como punto de partida en entornos corporativos que no pueden emplear el corpus Nemotron-SFT-Code.
- Inferencia en hardware muy limitado: con aproximadamente 1,3 GB de pesos en bf16 cabe en GPUs de gama baja e incluso en CPU, útil para demos, pruebas unitarias de pipelines o entornos educativos.
- Comparación metodológica de objetivos de entrenamiento: permite medir convergencia, estabilidad y calidad de muestreo entre el objetivo absorbente puro y variantes correctivas bajo un presupuesto de cómputo idéntico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K, MBPP ni de ninguna otra suite, ni para este modelo ni para su pareja CDLM. El autor indica que los resultados obtenidos con esta pareja no son los del artículo, y no se proporcionan cifras comparativas en el material disponible. Las búsquedas web realizadas no devolvieron ninguna fuente técnica relevante sobre el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 1,5-2 GB con pesos en bf16 (1,26 GB de pesos) más caché de activaciones y buffers de difusión; el repositorio completo ocupa 1,3 GB.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM es suficiente; se ha entrenado en A100-PCIE-40GB, pero la inferencia no requiere ese hardware.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4070 o RTX 4090, y también en CPU para pruebas puntuales.
- Opciones de despliegue: el autor solo documenta el pipeline de evaluación del repositorio zhangshuibai/CDLM. No hay soporte confirmado en vLLM, llama.cpp, Ollama ni TGI, ya que estos asumen decodificación causal y el modelo requiere atención bidireccional con logits desplazados.
- Latencia y throughput: no disponible. Al tratarse de un modelo de difusión, el coste de inferencia depende del número de pasos de denoising, que la model card no especifica.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Shuibai12138/Open-Dcoder-0.5B-MDLM-OpenCodeInstruct | 0,63B | no disponible | Difusión enmascarada absorbente (MDLM) | MIT | HuggingFace, 0 descargas |
| Shuibai12138/Open-Dcoder-0.5B-CDLM-OpenCodeInstruct | no disponible (misma base de 0,5B) | no disponible | CDLM (correctivo) | no disponible | HuggingFace |
| fredzzp/open-dcoder-0.5B | 0,5B (modelo base) | no disponible | Difusión de código | no disponible | HuggingFace |
| Qwen2.5-Coder-0.5B (referencia de la misma categoría de tamaño) | ~0,49B | 32.768 tokens | Causal autorregresivo | Apache 2.0 | HuggingFace |

La comparación con Qwen2.5-Coder-0.5B se incluye únicamente como referencia de la categoría de tamaño; sus datos no provienen de la información proporcionada en esta búsqueda y sus cifras de rendimiento no se han verificado aquí. No se dispone de métricas comparativas publicadas para ninguno de los modelos de la familia Open-Dcoder.

## Limitaciones y advertencias

- Modelo experimental: solo 2.000 pasos de un schedule de 20.345.053, con el learning rate aún en valores propios del warmup (2,95e-5), por lo que es previsible un grado de entrenamiento muy bajo.
- No es un modelo del artículo *Corrective Diffusion Language Models*: los resultados del paper no son extrapolables a este checkpoint.
- Carga incorrecta con APIs estándar: usar `AutoModelForCausalLM` produce un modelo causal y salidas erróneas; requiere la implementación de difusión del repositorio CDLM.
- Riesgo elevado de alucinación y de código no compilable: con 0,63B de parámetros y un entrenamiento truncado, la fiabilidad en tareas de código reales es limitada.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad, por lo que no se recomienda su uso en producción sin una evaluación propia.
- Idiomas: la model card solo declara `code`; no hay garantía de comportamiento correcto en castellano ni en otros lenguajes naturales.
- Sin soporte documentado de tool calling, agentes, plantilla de chat ni modo de razonamiento.
- Longitud de contexto no declarada: solo se conoce el tamaño de secuencia usado en entrenamiento (4.096 tokens empaquetados), que no equivale a una ventana de contexto de inferencia.
- Licencia: los pesos son MIT, pero los datos de entrenamiento (nvidia/OpenCodeInstruct) están bajo CC BY 4.0, lo que exige atribución a NVIDIA; la licencia del modelo base fredzzp/open-dcoder-0.5B no se detalla en la información disponible.
- Sin cuantizaciones publicadas (GGUF, AWQ, GPTQ) y sin integración en motores de inferencia habituales, lo que complica el despliegue a escala.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Shuibai12138/Open-Dcoder-0.5B-MDLM-OpenCodeInstruct
- Modelo base: https://huggingface.co/fredzzp/open-dcoder-0.5B
- Modelo pareja (objetivo CDLM): https://huggingface.co/Shuibai12138/Open-Dcoder-0.5B-CDLM-OpenCodeInstruct
- Modelo del artículo (0,5B, MDM baseline): https://huggingface.co/Shuibai12138/Open-Dcoder-0.5B-baseline-mdm-step2000
- Dataset de entrenamiento: https://huggingface.co/datasets/nvidia/OpenCodeInstruct
- Repositorio de código: https://github.com/zhangshuibai/CDLM
- Artículo: *Corrective Diffusion Language Models*, Zhang, Shuibai; Peng, Fred Zhangzhi; Zhang, Yiheng; Pan, Jin; Chrysos, Grigorios G. NeurIPS 2026 (sin URL disponible en la información proporcionada)
- Búsquedas web: no se encontraron fuentes técnicas relevantes sobre el modelo; los resultados devueltos no guardan relación con el contenido de esta ficha.

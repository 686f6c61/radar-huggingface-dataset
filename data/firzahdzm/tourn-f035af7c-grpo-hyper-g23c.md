# firzahdzm/tourn-f035af7c-grpo-hyper-g23c

## Resumen

`firzahdzm/tourn-f035af7c-grpo-hyper-g23c` es un adaptador PEFT (LoRA) publicado en HuggingFace por el usuario `firzahdzm` sobre el modelo base Qwen/Qwen2.5-3B. No se trata por tanto de un modelo completo entrenado desde cero, sino de un conjunto de pesos de ajuste fino que deben cargarse sobre el checkpoint original de Qwen2.5-3B para poder ejecutarse. El repositorio contiene 1,0 GB de pesos en formato safetensors y declara la librería `peft` (versión 0.15.1) como framework de carga.

La relevancia de este artefacto es limitada y de carácter experimental. La model card es la plantilla genérica de HuggingFace sin rellenar: todos los campos (desarrollador, datos de entrenamiento, licencia, idiomas, evaluación) aparecen como `[More Information Needed]`. El repositorio acumula 0 descargas y 0 likes en el momento de la consulta, y su identificador sugiere una ejecución automatizada dentro de una barrida de hiperparámetros con GRPO (Group Relative Policy Optimization), aunque esto no está documentado en ninguna parte.

Dado que el modelo base sí está bien caracterizado (Qwen2.5-3B: transformer decoder-only de 3 090 millones de parámetros, 32 768 tokens de contexto nativo, licencia Apache 2.0), esta ficha distingue de forma explícita entre los datos verificables del modelo base y los datos no disponibles del adaptador. Cualquier uso en producción debería partir del checkpoint base y tratar este adaptador como un experimento no validado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen2.5-3B) con adaptador LoRA/PEFT |
| Parámetros totales | 3 090 millones en el modelo base; el adaptador no declara su número de parámetros entrenables |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 32 768 tokens en el modelo base; ampliable a 131 072 con YaRN según la documentación de Qwen. El adaptador no redefine este valor |
| Tipos de cuantización | No disponible. El repositorio solo publica safetensors de PEFT; no hay GGUF ni GPTQ/AWQ |
| Idiomas soportados | No disponible en la ficha del adaptador. El modelo base Qwen2.5-3B declara soporte para 29 idiomas |
| Licencia | No disponible para el adaptador. El modelo base Qwen2.5-3B se distribuye bajo Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA); tamaño del repositorio 1,0 GB |
| Modelo base | Qwen/Qwen2.5-3B |
| Framework declarado | PEFT 0.15.1 |
| Autor | firzahdzm |
| Fecha de creación (metadatos) | 2026-09-26 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen2.5-3B, un transformer decoder-only denso con normalización RMSNorm, activación SwiGLU y atención con consultas agrupadas (GQA), lo que reduce el tamaño de la caché KV durante la inferencia. El modelo base maneja 32 768 tokens de contexto y su tokenizador cubre aproximadamente 151 936 entradas de vocabulario. El adaptador en sí es un conjunto de matrices de bajo rango (LoRA) que modifican capas del modelo congelado; no cambia la arquitectura ni el tokenizador.

No hay información publicada sobre el procedimiento de entrenamiento: ni número de tokens, ni composición del dataset, ni hiperparámetros, ni si hubo fases de RLHF o DPO. El nombre del repositorio incluye las cadenas `grpo` y `hyper`, lo que apunta a un ajuste con GRPO y a una barrida de hiperparámetros, pero es una inferencia a partir del identificador y no un dato confirmado por el autor. El tamaño del repositorio (1,0 GB) es notablemente superior al de un adaptador LoRA típico sobre un modelo de 3B, lo que podría indicar un rango alto, múltiples checkpoints o estados de optimizador incluidos; no se especifica.

## Capacidades

- Generación de texto y conversación multi-turno heredadas del modelo base Qwen2.5-3B.
- Razonamiento básico, matemáticas de nivel escolar y generación de código, en la medida en que lo permite un modelo de 3 000 millones de parámetros.
- Soporte de tool calling y function calling como capacidad del modelo base (Qwen2.5 incorpora plantillas para ello), no verificada en este adaptador.
- Capacidades multilingües declaradas en el modelo base (29 idiomas), no validadas para el adaptador.
- Capacidad de completar contexto largo: hasta 32 768 tokens nativos; extensión a 131 072 con YaRN si se configura en el modelo base.
- Capacidades específicas adquiridas con el ajuste: no disponible.
- Modo de razonamiento explícito (thinking), visión o audio: no disponible; el modelo base Qwen2.5-3B es solo texto.

## Casos de uso

- Evaluación de pipelines de ajuste fino: el adaptador sirve como caso de prueba para verificar que un flujo PEFT (carga, `merge_and_unload`, exportación a GGUF) funciona correctamente sobre Qwen2.5-3B antes de invertir en un entrenamiento mayor.
- Reproducción de experimentos con GRPO: dado el nombre del repositorio, puede utilizarse como punto de partida para comparar configuraciones de RL sobre modelos pequeños en tareas de razonamiento.
- Fine-tuning de dominio sobre hardware de consumo: al partir de un modelo de 3B, es viable reentrenar adaptadores similares en una única GPU de gama alta consumer con precisión mixta.
- Prototipado de asistentes conversacionales con contexto largo: el modelo base admite 32 768 tokens, suficiente para integrar documentación extensa en el prompt en pruebas de concepto, no en producción sin validación.
- Generación de código asistida en entornos de desarrollo local: un modelo de 3B cuantizado a 4 bits cabe en GPUs de gama media, lo que permite autocompletado y explicación de fragmentos sin enviar código a servicios externos.
- Investigación sobre degradación por ajuste: comparar las salidas del adaptador frente al checkpoint base permite medir pérdida de capacidades (catastrophic forgetting) tras el entrenamiento con RL, un análisis habitual en trabajos de alineamiento.
- Docencia y formación: sirve como ejemplo reproducible de la estructura de un repositorio PEFT y de cómo se carga un adaptador con `PeftModel.from_pretrained`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye sección de evaluación y el repositorio no enlaza a ninguna tabla de resultados, informe o comparativa con el modelo base.

## Comparativa con modelos similares

La comparación se establece con el propio modelo base y con alternativas de tamaño equivalente, ya que no existen métricas del adaptador.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento del adaptador |
|---|---|---|---|---|---|
| firzahdzm/tourn-f035af7c-grpo-hyper-g23c | Adaptador sobre 3,09B | Heredado del base (32 768) | No disponible | Repositorio HuggingFace, 0 descargas | No disponible |
| Qwen/Qwen2.5-3B | 3,09B | 32 768 (131 072 con YaRN) | Apache 2.0 | HuggingFace, ampliamente utilizado | No aplica (referencia) |
| Qwen/Qwen2.5-3B-Instruct | 3,09B | 32 768 (131 072 con YaRN) | Apache 2.0 | HuggingFace | No aplica (alternativa afinada por el propio fabricante) |
| Llama 3.2 3B Instruct | 3,21B | 131 072 | Llama 3.2 Community License | HuggingFace, con restricciones de uso | No aplica |
| Phi-3.5-mini-instruct | 3,8B | 131 072 | MIT | HuggingFace | No aplica |

Ninguna de las alternativas de la tabla es directamente intercambiable con este adaptador: solo Qwen2.5-3B comparte tokenizador y arquitectura, mientras que Llama 3.2 3B y Phi-3.5-mini son modelos independientes con sus propios pesos completos.

## Requisitos de hardware

- VRAM para inferencia del modelo base en FP16/BF16: aproximadamente 6,2 GB solo de pesos, más caché KV y activaciones; en la práctica, entre 7 y 9 GB según longitud de contexto y tamaño de lote.
- VRAM en cuantización de 8 bits: aproximadamente 3,5-4 GB de pesos.
- VRAM en cuantización de 4 bits: aproximadamente 2-2,5 GB de pesos.
- Nota importante: esta estimación corresponde a los pesos completos del modelo base. Los adaptadores LoRA no reducen el consumo de VRAM, ya que se aplican sobre el modelo congelado; añaden un coste marginal (del orden de decenas o cientos de MB según el rango).
- GPUs compatibles: cabe en GPUs de consumo como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090. En GPUs profesionales, cualquier A100, H100, L40S o A10 funciona sin problemas.
- Cabe en una única GPU consumer, incluso con cuantización de 4 bits en GPUs de 8 GB con contexto moderado.
- Opciones de despliegue: vLLM y TGI (requieren fusionar el adaptador con el modelo base o cargarlo mediante los mecanismos de LoRA de vLLM), llama.cpp y Ollama (requieren convertir el modelo fusionado a GGUF, ya que no aceptan safetensors de PEFT directamente), y Transformers + PEFT para uso directo.
- Latencia y throughput: no disponible. No se han publicado mediciones para este adaptador ni para el checkpoint base en la información proporcionada.

## Limitaciones y advertencias

- La model card está completamente sin rellenar: no hay información sobre datos de entrenamiento, sesgos conocidos, evaluación ni uso previsto.
- Licencia no especificada para el adaptador. Aunque el modelo base es Apache 2.0, la ausencia de licencia explícita en el repositorio crea incertidumbre jurídica para uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Riesgo de alucinación elevado: los modelos de 3 000 millones de parámetros generan con frecuencia afirmaciones plausibles pero falsas, especialmente en tareas de razonamiento multi-paso y en dominios especializados.
- No hay ninguna validación de que el ajuste con GRPO (si realmente se realizó) haya mejorado las capacidades del modelo base; es igual de probable que haya degradado el rendimiento en tareas generales.
- Idiomas soportados no documentados en el adaptador; el soporte multilingüe del modelo base no garantiza un comportamiento correcto en castellano tras un ajuste del que no se conocen los datos.
- El campo `arxiv:1910.09700` de los tags corresponde al artículo del calculador de impacto ambiental de Lacoste et al. (2019), citado en la plantilla genérica de model card; no es un paper sobre este modelo.
- Los metadatos indican una fecha de creación en 2026, inconsistente con la fecha actual; esto refuerza la impresión de repositorio generado automáticamente o con metadatos erróneos.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso, revisión por la comunidad ni reproducibilidad de resultados.
- Antes de usar el adaptador en producción, debe evaluarse contra el propio Qwen2.5-3B-Instruct en el caso de uso concreto; sin esa comparación no hay justificación técnica para preferirlo.

## Enlaces

- Repositorio del modelo: https://huggingface.co/firzahdzm/tourn-f035af7c-grpo-hyper-g23c
- Modelo base Qwen2.5-3B: https://huggingface.co/Qwen/Qwen2.5-3B
- Variante instructa del modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Blog de la familia Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- Repositorio de Qwen2.5 en GitHub: https://github.com/QwenLM/Qwen2.5
- Librería PEFT: https://github.com/huggingface/peft
- Artículo citado en los tags, Lacoste et al. (2019), sobre estimación de emisiones: https://arxiv.org/abs/1910.09700
- Calculador de impacto ambiental de ML: https://mlco2.github.io/impact

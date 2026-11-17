# lovelike77/qwen3-1.7b-gyeongsang-lora

## Resumen

`lovelike77/qwen3-1.7b-gyeongsang-lora` es un adaptador LoRA (Low-Rank Adaptation) entrenado mediante SFT (supervised fine-tuning) sobre el modelo base Qwen/Qwen3-1.7B. El nombre sugiere una especialización en el dialecto gyeongsang (경상도 사투리), una de las variantes regionales del coreano hablado en el sureste de la peninsula coreana (Busan, Daegu, Ulsan y sus provincias). El autor es el usuario de Hugging Face `lovelike77` y el artefacto se publicó en noviembre de 2026.

Se trata de un adaptador PEFT de pequeno tamano (el repositorio ocupa aproximadamente 0,1 GB) que no contiene los pesos completos del modelo base, sino únicamente las matrices de bajo rango entrenadas. Para utilizarlo es necesario descargar por separado Qwen/Qwen3-1.7B y cargar el adaptador encima mediante la librería `peft` y `transformers`. No es, por tanto, un modelo autónomo, sino un complemento que modifica el comportamiento del base.

La relevancia de este artefacto es limitada pero concreta: demuestra el patrón habitual de fine-tuning de sub-2B para variantes dialectales o de registro, y sirve como ejemplo de cómo adaptar un modelo compacto de la familia Qwen3 a un dominio lingüístico muy específico con un coste de cómputo bajo. La model card está prácticamente vacía (plantilla estándar sin rellenar), por lo que la mayor parte de los metadatos técnicos no están documentados por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen3-1.7B |
| Parametros totales | no disponible (adaptador LoRA; tamano de repo ~0,1 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del base Qwen3-1.7B; no confirmada por el autor) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del base) |
| Idiomas soportados | no disponible en la model card; el nombre sugiere coreano (dialecto gyeongsang) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de bajo rango aplicado sobre Qwen3-1.7B, un transformer decoder-only de la familia Qwen3. El entrenamiento se realizó mediante SFT (supervised fine-tuning) usando las librerías `transformers` y `trl`, y el adaptador se empaqueta con PEFT 0.21.3. No se especifican el rango del adaptador, el alpha, los módulos objetivo, la tasa de aprendizaje, el número de pasos ni el tamaño del dataset.

La model card no documenta la composición del dataset de entrenamiento, el número de tokens, si hubo etapas de RLHF/DPO posteriores ni ninguna innovación técnica adicional. El nombre del repositorio sugiere que los datos de ajuste corresponden a conversaciones o textos en dialecto gyeongsang, pero esta afirmación no está confirmada por el autor. Tampoco se indica si se congelaron capas, si se aplicó quantized LoRA (QLoRA) ni la precisión usada en el entrenamiento.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Qwen3-1.7B.
- Presunta especialización en el dialecto coreano gyeongsang, según el nombre del repositorio (no verificable con la información disponible).
- Razonamiento y matemáticas básicas: capacidades del base Qwen3-1.7B, no reentrenadas ni evaluadas por el autor del adaptador.
- Generación de código: heredada del base, sin garantías tras el fine-tuning.
- Tool calling / function calling: no documentado para este adaptador; depende del base y de si el SFT preservó ese comportamiento.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas; el base Qwen3 soporta varios idiomas, pero el adaptador puede haber degradado el rendimiento fuera del dominio de ajuste.
- Modo thinking: no documentado para este adaptador (Qwen3 incorpora modos de razonamiento en el base, pero no se confirma su preservación).

## Casos de uso

- Prototipado de asistentes conversacionales en dialecto gyeongsang: el adaptador permitiría generar respuestas con registro regional coreano sobre un modelo de 1,7B, adecuado para demos y pruebas de concepto de baja latencia en CPU o GPU modesta.
- Investigación lingüística sobre variantes regionales del coreano: útil para comparar la fidelidad dialectal de un modelo ajustado frente al base, siempre que se valide con hablantes nativos.
- Fine-tuning de bajo coste como plantilla: el repositorio sirve de ejemplo reproducible del flujo PEFT + TRL para adaptar Qwen3-1.7B a un dominio concreto con recursos limitados.
- Generación de diálogos sintéticos para aumento de datos: se podría usar para producir corpus de entrenamiento en dialecto, con revisión humana obligatoria por riesgo de alucinación.
- Despliegue en entornos con recursos muy limitados: al ser un adaptador de ~0,1 GB sobre un base de 1,7B, el conjunto completo puede ejecutarse en GPUs de consumo o incluso en CPU con cuantización del base.
- Experimentos de evaluación de sesgos dialectales: permite medir cómo un SFT pequeño altera el comportamiento del base en registros no estándar.
- Educación y divulgación: ejemplo didáctico de cómo se publica y consume un adaptador LoRA en el ecosistema Hugging Face.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para el adaptador: despreciable (~0,1 GB en safetensors); el coste real lo determina el modelo base Qwen3-1.7B.
- VRAM estimada para el conjunto base + adaptador: aproximadamente 3,5-4 GB en fp16/bf16; en torno a 1,5-2 GB con cuantización de 4 bits del base (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16; RTX 3060, RTX 4060, RTX 4090, A100 o H100 para despliegues de mayor throughput.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060/4060 y superiores, e incluso en CPU con cuantización GGUF del base.
- Opciones de despliegue: `transformers` + `peft` (ruta oficial del adaptador); el base puede servirse con vLLM, TGI, llama.cpp u Ollama, pero la fusión del adaptador requiere pasos adicionales (merge o carga dinámica).
- Latencia y throughput: no disponibles; dependen del hardware y del backend elegido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lovelike77/qwen3-1.7b-gyeongsang-lora | Adaptador sobre 1,7B | no disponible | LoRA SFT | no disponible | Hugging Face (0 descargas, 0 likes) |
| Qwen/Qwen3-1.7B (base) | 1,7B | no disponible en esta ficha | Transformer decoder-only | no disponible en esta ficha | Hugging Face (oficial) |
| Adaptadores LoRA dialectales comparables | no disponible | no disponible | LoRA | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas equivalentes.

## Limitaciones y advertencias

- La model card está sin rellenar: no hay información sobre dataset, hiperparámetros, evaluación ni licencia, lo que impide auditar el entrenamiento.
- Licencia no especificada: no se puede garantizar el uso comercial; hay que consultar la licencia del base Qwen3-1.7B por separado.
- Riesgo de alucinación y de sobreajuste al dominio dialectal: un SFT pequeño sobre 1,7B puede degradar capacidades generales (código, matemáticas, multilingüismo) sin que el autor lo haya medido.
- Sin métricas ni evaluación publicadas: no hay evidencia de que el adaptador mejore realmente la fidelidad al dialecto gyeongsang.
- Cero descargas y cero likes en el momento de la consulta: artefacto sin validación por la comunidad.
- Idiomas soportados no documentados: el uso fuera del coreano puede producir resultados inconsistentes.
- No es un modelo autónomo: requiere descargar y cargar el base Qwen3-1.7B; el repositorio de 0,1 GB no contiene pesos completos.
- Posibles sesgos heredados del base y del corpus de ajuste, no evaluados.

## Enlaces

- Hugging Face: https://huggingface.co/lovelike77/qwen3-1.7b-gyeongsang-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Paper de referencia sobre impacto ambiental citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora ML Impact: https://mlco2.github.io/impact

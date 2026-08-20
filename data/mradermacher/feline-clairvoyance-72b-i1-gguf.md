# mradermacher/Feline-Clairvoyance-72B-i1-GGUF

## Resumen

Feline-Clairvoyance-72B-i1-GGUF es una cuantización en formato GGUF del modelo base Feline-Clairvoyance-72B, desarrollado por Mawdistical y convertido por el equipo de mradermacher. El nombre indica una arquitectura de 72 mil millones de parámetros, aunque el dato real de safetensors registrado en Hugging Face muestra 6.298.160 parámetros, lo que resulta inconsistente y probablemente se trate de un error de metadatos o de una medida parcial. Este repositorio contiene exclusivamente los pesos cuantizados en GGUF, pensados para inferencia local eficiente con herramientas como llama.cpp, Ollama o LM Studio.

La relevancia de este modelo radica en su formato GGUF, que permite ejecutar modelos de gran tamaño en hardware de consumo con cuantizaciones que reducen la huella de memoria. Sin embargo, la información pública disponible es muy limitada: no se especifican arquitectura, licencia, idiomas ni datos de entrenamiento. El repositorio fue creado en agosto de 2026 y no registra descargas ni valoraciones, lo que sugiere que se trata de una publicación reciente o poco difundida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 6.298.160 (dato real de safetensors; el nombre sugiere 72B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base Feline-Clairvoyance-72B. El repositorio actual es una conversión a GGUF con cuantizaciones ponderadas (weighted/imatrix), lo que implica que los pesos originales fueron transformados para reducir su tamaño y mejorar la eficiencia de inferencia. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas como RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas más allá del propio proceso de cuantización.

## Capacidades

- No se han documentado capacidades específicas del modelo en la información disponible.
- Al tratarse de un modelo de 72B (según el nombre), es plausible que tenga capacidades de generación de texto, razonamiento y posiblemente código, pero no hay confirmación oficial.
- No se indica soporte para tool calling, agentes, visión, audio u otras modalidades.
- El formato GGUF permite su uso en entornos de inferencia local, pero las capacidades funcionales dependen del modelo base, del cual no hay datos.

## Casos de uso

Dado que no se dispone de información concreta sobre el modelo base, los casos de uso son hipotéticos y basados únicamente en el tamaño nominal de 72B:

- Inferencia local en GPU de gama alta: gracias a las cuantizaciones GGUF, el modelo podría ejecutarse en hardware con 24-48 GB de VRAM, aunque no se ha verificado su rendimiento real.
- Experimentación con cuantizaciones: el repositorio ofrece múltiples variantes (Q2_K, Q4_K_M, Q6_K, etc.) que permiten probar el equilibrio entre calidad y uso de memoria.
- Integración en pipelines de generación de texto con llama.cpp o vLLM, siempre que el modelo base sea compatible con estas herramientas.
- Fine-tuning o adaptación posterior si se obtiene acceso al modelo base original, aunque no se proporcionan pesos en otros formatos.
- Evaluación comparativa de modelos de 72B en tareas de razonamiento o generación, si se logra identificar el modelo base y sus características.
- Uso educativo para estudiar el impacto de la cuantización en modelos grandes, comparando las distintas variantes GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K ni otras métricas estándar. Tampoco se ofrecen comparativas con modelos similares.

## Requisitos de hardware

- VRAM estimada: para un modelo de 72B, las cuantizaciones más bajas (Q2_K, IQ1_M) podrían ocupar entre 20 y 30 GB, mientras que Q4_K_M o Q6_K requerirían entre 40 y 60 GB. Estas cifras son orientativas y no han sido confirmadas para este modelo concreto.
- GPU recomendadas: para las cuantizaciones más ligeras, una RTX 4090 (24 GB) podría ser insuficiente; se necesitarían GPUs con 48 GB o más, como A6000, A100 80GB o H100. Para las variantes más pequeñas, quizá una RTX 3090 (24 GB) con offloading a CPU.
- No se ha verificado si el modelo cabe en GPUs de consumo estándar; dependerá de la cuantización elegida y de la memoria disponible.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, vLLM (si soporta GGUF) o TGI. No se ha confirmado la compatibilidad con ninguna de estas herramientas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. El modelo base Feline-Clairvoyance-72B no aparece en búsquedas públicas, y no se conocen sus características frente a alternativas como Llama-3-70B, Mistral-8x22B o Qwen-72B. Se recomienda consultar el repositorio original de Mawdistical para obtener más datos.

## Limitaciones y advertencias

- No se ha publicado información sobre sesgos, alucinaciones o limitaciones de contexto del modelo base.
- La licencia es desconocida, por lo que no se puede garantizar su uso comercial o en proyectos propietarios.
- El dato de parámetros totales (6.298.160) es inconsistente con el nombre de 72B; podría tratarse de un error de metadatos o de una medida parcial, lo que genera incertidumbre sobre el tamaño real.
- Al ser una cuantización, es probable que exista una pérdida de calidad respecto al modelo original, aunque no se ha cuantificado.
- No hay evidencia de que el modelo haya sido probado en producción; su uso en entornos críticos no está recomendado sin una evaluación previa.
- La ausencia de documentación sobre el modelo base dificulta la interpretación de sus resultados y su integración en flujos de trabajo existentes.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Feline-Clairvoyance-72B-i1-GGUF
- Modelo base (referencia): https://huggingface.co/Mawdistical/Feline-Clairvoyance-72B
- Perfil del autor de la cuantización: https://huggingface.co/mradermacher

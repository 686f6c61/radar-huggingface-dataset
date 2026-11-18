# asparius/qwen38-opus55-dolcithink-sft-head-s1

## Resumen

`asparius/qwen38-opus55-dolcithink-sft-head-s1` es un adaptador LoRA de destilación (distillation) construido sobre el modelo base Qwen/Qwen3.8-27B. Lo desarrolla el usuario asparius y su propósito es transferir el comportamiento de un profesor (identificado en la model card como `claude-opus-5-5`) a un estudiante Qwen de 27B mediante ajuste supervisado (SFT) sobre un conjunto de datos propio, `asparius/dolci-think-sft-opus5.5`. El nombre del repositorio indica además que se ha reentrenado la cabeza de lenguaje (`lm_head`) junto con el adaptador LoRA de rango 32, y que se trata de la semilla 1 de una serie de experimentos.

El modelo es relevante en el contexto de la investigación sobre destilación de capacidades de razonamiento desde modelos propietarios hacia modelos abiertos, un área activa porque permite obtener modelos pequeños y desplegables con trazas de razonamiento estilo "thinking". Al publicarse como adaptador PEFT en lugar de pesos completos, el repositorio ocupa 31,3 GB e incluye los directorios `checkpoint-*` intermedios para reproducibilidad, lo que facilita auditar el proceso de entrenamiento.

La información publicada es escasa: la model card se limita a cuatro líneas y no detalla composición del dataset, hiperparámetros, número de tokens de entrenamiento ni resultados de evaluación. Todo lo que no consta en la información proporcionada se marca en esta ficha como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada del base Qwen/Qwen3.8-27B); adaptador LoRA r32 + lm_head reentrenado |
| Parametros totales | no disponible (el base se denomina Qwen3.8-27B; el adaptador es LoRA) |
| Parametros activos | no disponible (no consta que el base sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors del adaptador; no se publican GGUF) |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 32 sobre el modelo Qwen/Qwen3.8-27B, con la cabeza de salida (`lm_head`) reentrenada de forma explícita. El entrenamiento es una destilación por ajuste supervisado: se generan datos con un profesor (`claude-opus-5-5`) y se ajusta el estudiante para imitar esas respuestas, presumiblemente con trazas de razonamiento ("dolci-think"). El dataset empleado es `asparius/dolci-think-sft-opus5.5`, publicado por el mismo autor.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, la mezcla de dominios, ni si hubo fases posteriores de RLHF o DPO. Tampoco se documentan hiperparámetros como la tasa de aprendizaje, el número de épocas o el alpha del LoRA. La única innovación declarada es el reentrenamiento de `lm_head` junto al adaptador, una práctica que busca alinear la distribución de salida del vocabulario con el estilo del profesor en lugar de limitarse a modificar las capas internas.

## Capacidades

- Generación de texto y razonamiento: el ajuste sobre datos de un profesor de tipo "thinking" sugiere respuestas con cadenas de razonamiento, aunque no se documenta el formato exacto.
- Destilación de estilo: el objetivo declarado es imitar el comportamiento del profesor `claude-opus-5-5` en las tareas cubiertas por el dataset.
- Herencia del modelo base: al ser un adaptador sobre Qwen3.8-27B, conserva las capacidades del base, pero la model card no las enumera.
- Tool calling / function calling: no disponible en la documentación.
- Soporte de agentes y razonamiento multi-paso: no disponible en la documentación.
- Capacidades multilingües: no disponible; no se declaran idiomas.
- Capacidades especiales (visión, audio, modo thinking explícito): no disponible.

## Casos de uso

- Investigación en destilación: usar el adaptador como referencia reproducible (incluye checkpoints intermedios) para estudiar cómo se transfieren estilos de razonamiento de un profesor propietario a un estudiante abierto de 27B.
- Evaluación comparativa de estudiantes: cargar el adaptador sobre Qwen3.8-27B y comparar sus salidas con las del profesor en un conjunto de prompts de retención, midiendo la fidelidad de la imitación.
- Generación de datos sintéticos: emplear el modelo ajustado para producir trazas de razonamiento adicionales que alimenten posteriores rondas de SFT, dado su entrenamiento específico en ese formato.
- Reproducción de experimentos: los directorios `checkpoint-*` permiten reanudar o bifurcar el entrenamiento y validar la curva de aprendizaje del adaptador.
- Ajuste fino posterior (fine-tuning de segunda etapa): al ser un adaptador PEFT ligero, se puede fusionar o apilar con otros adaptadores para experimentar con mezclas de estilos.
- Despliegue experimental en investigación: servir el base con el adaptador en un entorno controlado para estudiar latencia y calidad antes de decidir si se fusiona a pesos completos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador LoRA en sí es pequeño en comparación con el base, pero requiere cargar Qwen/Qwen3.8-27B para inferencia; el repositorio ocupa 31,3 GB por incluir checkpoints intermedios.
- VRAM estimada para el base en precisión completa: no disponible con exactitud, pero un modelo de 27B en bf16 requiere del orden de 54 GB solo para pesos, más memoria para activaciones y KV cache.
- GPU recomendadas: para bf16, A100 80 GB o H100; para cuantización de 8 bits, una A100 40 GB o dos RTX 4090; para 4 bits, una RTX 4090 (24 GB) puede ser suficiente para pesos, con margen limitado para contexto.
- Cabe en GPU de consumo: probablemente en RTX 4090/3090 solo con cuantización agresiva (4 bits) y contextos moderados; no confirmado en la documentación.
- Opciones de despliegue: PEFT + Transformers para cargar el adaptador; vLLM o TGI si se fusiona el adaptador a pesos completos; llama.cpp/Ollama solo si se generan GGUF del modelo fusionado, algo que no se publica en el repo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| asparius/qwen38-opus55-dolcithink-sft-head-s1 | LoRA sobre base de 27B | no disponible | Adaptador de destilación | other | Hugging Face (0 descargas) |
| Qwen/Qwen3.8-27B (base) | 27B (según denominación) | no disponible | Modelo completo | no disponible en esta ficha | Hugging Face |
| Adaptadores LoRA de destilación comparables | no disponible | no disponible | LoRA | variable | no disponible |

No se dispone de información suficiente para comparar rendimiento con alternativas concretas; la comparativa se limita a la relación con el modelo base.

## Limitaciones y advertencias

- Documentación mínima: la model card no describe datos, hiperparámetros ni evaluación, lo que dificulta validar la calidad del ajuste.
- Licencia "other": no se detallan los términos; es imprescindible revisar las condiciones antes de cualquier uso comercial, y además hay que respetar la licencia del modelo base Qwen.
- Riesgo de alucinación y de imitación superficial: la destilación desde un profesor propietario puede reproducir estilo sin garantizar corrección factual.
- Sesgos heredados: al no documentarse la composición del dataset, no se pueden evaluar sesgos de dominio, idioma o estilo.
- Idiomas no declarados: no hay garantía de comportamiento multilingüe más allá de lo que herede el base.
- Repositorio con checkpoints intermedios: incrementa el tamaño de descarga (31,3 GB) y requiere filtrar qué subdirectorio cargar.
- Sin adopción verificable: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción.
- Fecha de creación futura respecto a la mayoría de referencias públicas: conviene verificar la integridad y procedencia de los pesos antes de usarlos.

## Enlaces

- Hugging Face: https://huggingface.co/asparius/qwen38-opus55-dolcithink-sft-head-s1
- Dataset de entrenamiento: https://huggingface.co/datasets/asparius/dolci-think-sft-opus5.5
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Paper, blog o demo: no disponible

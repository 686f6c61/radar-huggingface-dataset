# dvader13/olmo2-1b-sft-s1-3377b

## Resumen
Este repositorio contiene una serie de diez checkpoints de ajuste fino supervisado (SFT) del modelo OLMo-2-1B, desarrollado por el autor "dvader13". El modelo base es OLMo-2-1B, un modelo de lenguaje abierto de la familia OLMo de AI2, entrenado en su etapa de pretraining `stage1-step1610000-tokens3377B`, lo que indica que el pretraining se realizó con 3377 mil millones de tokens. Los checkpoints se denominan `checkpoint_pct010` hasta `checkpoint_pct100`, representando fracciones de una "dosis" de SFT, y se ofrecen en formato bf16, sin estado de optimizador, para uso exclusivo en inferencia.

La relevancia de este modelo reside en que es un experimento de investigación sobre el escalado de la cantidad de datos de SFT (dosis) en un modelo de 1B parámetros. Al estar liberado bajo licencia Apache-2.0, permite reproducir y estudiar los efectos del SFT en modelos pequeños, algo útil para la comunidad científica y de desarrollo que busca optimizar el uso de recursos computacionales. No se ha publicado información sobre la tarea específica del SFT, el dataset utilizado ni los resultados obtenidos, por lo que las capacidades concretas de estos checkpoints no están documentadas.

El repositorio tiene un tamaño de 29.7 GB, coherente con la presencia de diez checkpoints de aproximadamente 2 GB cada uno (1B parámetros en bf16). No se reportan descargas ni "likes", lo que indica que es un modelo reciente o poco conocido. La fecha de creación es de agosto de 2026, lo que sugiere que es un experimento relativamente nuevo.

## Especificaciones técnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (causal) |
| Parametros totales | 1B (modelo base OLMo-2-1B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo base OLMo-2-1B soporta 4096 tokens según la documentación de AI2) |
| Tipos de cuantizacion | bf16 (sin cuantizar) |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo base OLMo-2-1B es un transformer decoder-only estándar, diseñado por AI2 con un enfoque de ciencia abierta. El pretraining se realizó con un dataset de 3377 mil millones de tokens, según el nombre del checkpoint (`tokens3377B`). La familia OLMo 2 se caracteriza por publicar todos los componentes del proceso: datos, código de entrenamiento, recetas y evaluaciones intermedias, lo que permite una total reproducibilidad. El modelo base no emplea arquitecturas innovadoras como MoE o SSM, sino que se centra en la calidad de datos y el proceso abierto.

Los checkpoints SFT de este repositorio parten del modelo base OLMo-2-1B y se generaron mediante un proceso de ajuste fino supervisado con 10 fracciones de una dosis (probablemente referido a la cantidad de datos de SFT). No se especifica el dataset de SFT ni el método exacto (RLHF, DPO, etc.), pero se infiere que es un SFT clásico con pares instrucción-respuesta. Los pesos se guardan en bf16 y solo se conservan los parámetros del modelo, sin estado de optimizadores, lo que facilita la descarga y la inferencia.

## Capacidades
- Generación de texto: como modelo de lenguaje de 1B, puede generar texto coherente en tareas generales, aunque su rendimiento es limitado en comparación con modelos más grandes.
- Razonamiento básico: puede abordar problemas de razonamiento simple, pero con limitaciones en tareas complejas.
- Generación de código: el modelo base OLMo-2-1B ha sido entrenado con datos de código, por lo que puede completar fragmentos de código sencillos.
- Capacidades multilingües: no se ha documentado qué idiomas soporta el modelo base; OLMo 2 se entrenó principalmente con inglés, pero puede tener cierta transferencia a otros idiomas.
- Soporte de tool calling: no se ha documentado para este checkpoint específico.
- Soporte de agentes: no se ha documentado.
- Capacidades especiales: no se han publicado (sin visión, audio, etc.).

## Casos de uso
- Investigación académica sobre el escalado del SFT: el modelo es ideal para estudiar cómo la cantidad de datos de ajuste fino afecta al rendimiento en modelos pequeños. Se puede evaluar cada checkpoint (del 10% al 100% de la dosis) para trazar curvas de aprendizaje.
- Benchmarking de modelos de 1B: los diez checkpoints permiten comparar la evolución del rendimiento en tareas estándar como MMLU o HumanEval, contribuyendo a la literatura sobre eficiencia de entrenamiento.
- Prototipado de aplicaciones con recursos limitados: el modelo de 1B puede desplegarse en hardware modesto para generar texto en aplicaciones de baja latencia, aunque se recomienda usar el checkpoint con el 100% de la dosis para mejor rendimiento.
- Educación y formación: al ser totalmente abierto (Apache-2.0), sirve para enseñar técnicas de SFT y evaluación de modelos en cursos de aprendizaje automático.
- Evaluación de técnicas de cuantización: los pesos en bf16 pueden cuantizarse a formatos como int8 o int4 para estudiar la pérdida de calidad en modelos pequeños.
- Análisis de sesgos y robustez: al ser un checkpoint de investigación, permite examinar cómo el SFT influye en el comportamiento ético y la robustez ante entradas adversas.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. No se puede confirmar el rendimiento del modelo en tareas como MMLU, HumanEval o GSM8K. El autor no ha incluido métricas en la model card.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 2 GB con pesos en bf16 (1B parámetros × 2 bytes).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, por ejemplo NVIDIA GTX 1650, RTX 3060, o GPUs de datacenter como A10 o A100. También puede ejecutarse en CPU con suficiente RAM (~4 GB).
- Compatibilidad con GPU consumer: sí, cabe en la mayoría de las GPUs de gama media actuales.
- Opciones de despliegue: al estar en formato safetensors, se puede cargar con transformers de Hugging Face, o convertir a GGUF para usarlo con llama.cpp u Ollama. También se puede servir con vLLM o TGI.
- Latencia y throughput: para un modelo de 1B, la latencia es baja (típicamente <100 ms por token en GPU consumer), y el throughput puede ser de 100-200 tokens/s en GPUs modernas, aunque depende del hardware.

## Comparativa con modelos similares
| Modelo | Parámetros | Contexto | Licencia | Características |
|---|---|---|---|---|
| dvader13/olmo2-1b-sft-s1-3377b | 1B | No disponible | Apache-2.0 | Checkpoint SFT experimental, 10 dosis |
| allenai/OLMo-2-0425-1B | 1B | 4096 | Apache-2.0 | Modelo base, entrenado con 3377B tokens |
| TinyLlama-1.1B | 1.1B | 2048 | Apache-2.0 | Modelo compacto de código abierto |
| Qwen2-1.5B | 1.5B | 32768 | Apache-2.0 | Modelo multilingüe con soporte de tool calling |

No se dispone de datos de rendimiento comparativo para este checkpoint específico, ya que no se han publicado resultados.

## Limitaciones y advertencias
- Sesgos conocidos: el modelo base OLMo-2-1B puede heredar sesgos de los datos de entrenamiento, que son principalmente en inglés y de fuentes web, lo que puede reflejar prejuicios sociales y culturales.
- Riesgo de alucinación: como todo modelo de 1B, tiene una alta probabilidad de generar información falsa o inventada, especialmente en tareas de conocimiento factual.
- Limitaciones de contexto: el contexto del modelo base es de 4096 tokens, lo que limita el manejo de conversaciones o documentos largos.
- Idiomas: no se ha confirmado el soporte multilingüe; es probable que el rendimiento fuera del inglés sea limitado.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero es necesario revisar los términos completos de la licencia para cumplir con las obligaciones de atribución.
- Propósito experimental: el modelo es un checkpoint de investigación sin documentación de la tarea de SFT ni evaluación, por lo que no se recomienda su uso directo en producción sin una validación exhaustiva.
- Tamaño del repositorio: 29.7 GB es considerable para un modelo de 1B, debido a la inclusión de 10 checkpoints; es necesario descargar el repositorio completo si se quieren usar todos los estados, pero se pueden descargar checkpoints individuales.

## Enlaces
- Repositorio en Hugging Face: https://huggingface.co/dvader13/olmo2-1b-sft-s1-3377b
- Página oficial de OLMo de AI2: https://allenai.org/olmo
- Página de OLMo 2: https://allenai.org/olmo2
- Modelo base en Hugging Face: https://huggingface.co/allenai/OLMo-2-0425-1B
- Repositorio de entrenamiento OLMo en GitHub: https://github.com/allenai/OLMo
- Pipeline de SFT para OLMo2 (GitHub): https://github.com/fkuhne/olmo_sft

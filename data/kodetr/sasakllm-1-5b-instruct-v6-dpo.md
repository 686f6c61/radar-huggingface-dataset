# kodetr/SasakLLM-1.5B-Instruct-v6-DPO

## Resumen

SasakLLM-1.5B-Instruct-v6-DPO es un adaptador LoRA entrenado con DPO (Direct Preference Optimization) sobre el modelo base Qwen/Qwen2.5-1.5B-Instruct. Lo publica el usuario kodetr en HuggingFace y se distribuye como un repositorio PEFT de aproximadamente 0,1 GB, lo que corresponde exclusivamente a los pesos del adaptador y no al modelo completo. La model card no documenta el propósito, el dataset de preferencias ni los hiperparámetros empleados, por lo que la ficha se apoya en las características conocidas del modelo base y en los metadatos del repositorio.

El modelo hereda la arquitectura transformer decoder-only de Qwen2.5-1.5B-Instruct, con 1.540 millones de parámetros y una ventana de contexto nativa de 32.768 tokens (ampliable hasta 131.072 en la familia Qwen2.5, según la documentación oficial del modelo base). El entrenamiento DPO con LoRA sugiere un ajuste de alineación sobre respuestas conversacionales, orientado a mejorar la preferencia humana en lugar de ampliar capacidades base.

Es relevante ahora porque ejemplifica el patrón de ajuste ligero de modelos pequeños para despliegue en entornos con recursos limitados: el adaptador puede fusionarse con el modelo base o cargarse dinámicamente con PEFT, y el resultado es un modelo de 1,5B parámetros ejecutable en GPU de consumo. La ausencia de documentación y de benchmarks publicados limita su evaluación rigurosa, por lo que debe tratarse como un experimento comunitario y no como un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con adaptador LoRA entrenado por DPO |
| Parámetros totales | 1.540 millones (modelo base Qwen2.5-1.5B-Instruct) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens nativos en el modelo base (hasta 131.072 con RoPE scaling, según documentación de Qwen2.5) |
| Tipos de cuantización | No disponible en el repositorio; el modelo base admite GGUF, AWQ, GPTQ y bitsandbytes (no verificado para este adaptador) |
| Idiomas soportados | No disponible en la model card; el modelo base Qwen2.5 soporta multilingüe (chino, inglés y otros) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Librería | PEFT 0.21.2, transformers, TRL |
| Tamaño del repositorio | 0,1 GB |
| Modelo base | Qwen/Qwen2.5-1.5B-Instruct |
| Fecha de publicación | 2026-11-03 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-1.5B-Instruct, un transformer decoder-only con atención de múltiples cabezas con query/key/value bias, normalización RMSNorm y activación SwiGLU, tal como define la familia Qwen2.5. El modelo base fue preentrenado con aproximadamente 18 billones de tokens según la documentación oficial de Qwen, seguido de un ajuste supervisado y una fase de alineación. Sobre esta base, kodetr aplica un adaptador LoRA y lo entrena con DPO, una técnica de optimización de preferencias que ajusta el modelo para aumentar la probabilidad de respuestas preferidas frente a respuestas rechazadas sin necesidad de un modelo de recompensa explícito.

La model card no especifica el dataset de preferencias, el rango del adaptador, el alpha, la tasa de aprendizaje ni el número de pasos. Tampoco documenta si se aplicó un enmascaramiento de tokens de prompt ni la función de pérdida exacta (DPO, IPO o variantes). La única información técnica verificable es la versión de PEFT (0.21.2) y el uso de TRL, lo que sitúa el entrenamiento en el ecosistema estándar de HuggingFace. No se han publicado detalles sobre innovaciones técnicas adicionales, como decodificación especulativa o atención lineal, más allá de las que incorpora el modelo base.

## Capacidades

- Generación de texto conversacional multi-turno, heredada de Qwen2.5-1.5B-Instruct.
- Razonamiento básico y resolución de problemas de complejidad media, limitado por el tamaño de 1,5B parámetros.
- Generación de código en lenguajes comunes, con calidad moderada para un modelo de esta escala.
- Matemáticas elementales y aritmética; el modelo base rinde de forma limitada en problemas de varios pasos.
- Soporte de tool calling y function calling según el formato de plantilla de chat de Qwen2.5 (no verificado tras el DPO).
- Capacidad de seguir instrucciones y mantener el formato de chat con roles system/user/assistant.
- Capacidades multilingües heredadas del modelo base, con especial solidez en chino e inglés; el rendimiento en castellano no está documentado.
- No se documenta modo thinking, visión, audio ni otras modalidades.

## Casos de uso

- Asistente conversacional ligero en local: el adaptador se fusiona con Qwen2.5-1.5B-Instruct y se ejecuta en una GPU de consumo, permitiendo un chatbot privado sin dependencia de API externa.
- Prototipado de alineación con DPO: sirve como ejemplo reproducible para equipos que quieran experimentar con preferencias sobre un modelo pequeño antes de escalar a modelos mayores.
- Clasificación y reescritura de textos cortos: tareas de resumen, reformulación o extracción de entidades en documentos de hasta decenas de miles de tokens gracias al contexto de 32K del modelo base.
- Generación de respuestas en atención al cliente con tono controlado: el ajuste DPO puede orientar el estilo de respuesta, aunque la falta de evaluación impide garantizar consistencia en producción.
- Base para fine-tuning adicional: al ser un adaptador PEFT, se puede combinar con otros adaptadores o continuar el entrenamiento con nuevos datos de preferencias sin tocar los pesos del modelo base.
- Experimentación académica en entornos con recursos limitados: permite estudiar el efecto de DPO en modelos de 1,5B parámetros con un coste de cómputo bajo, usando una sola GPU de 16-24 GB.
- Evaluación comparativa de técnicas de alineación: útil como punto de partida para comparar DPO frente a SFT o RLHF en modelos pequeños dentro de un pipeline de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones de preferencia (win rate, AlpacaEval), y tampoco se aportan comparaciones con el modelo base ni con otros adaptadores.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 3,1 GB solo para pesos, más 1-2 GB de overhead de activaciones y caché KV según longitud de contexto; en la práctica, 6-8 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 1,6 GB de pesos; en 4 bits (GPTQ/AWQ/GGUF Q4): alrededor de 0,9-1,1 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, A10, L4, A100 y H100 para despliegues de mayor concurrencia.
- Cabe en GPU de consumo: sí, en cualquier GPU con 8 GB o más en FP16, y en GPUs de 4-6 GB con cuantización de 4 bits.
- Opciones de despliegue: transformers + PEFT para cargar el adaptador, vLLM y TGI tras fusionar el adaptador con el modelo base, llama.cpp y Ollama mediante conversión a GGUF del modelo fusionado.
- Latencia y throughput estimados: no disponibles para este adaptador; para el modelo base de 1,5B en una RTX 4090 se esperan decenas de tokens por segundo en FP16, pero no se ha verificado con este checkpoint.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| kodetr/SasakLLM-1.5B-Instruct-v6-DPO | 1,5B (base) + adaptador LoRA | 32.768 (base) | No disponible | safetensors (PEFT) | Adaptador DPO sin benchmarks ni documentación |
| Qwen/Qwen2.5-1.5B-Instruct | 1,5B | 32.768 (hasta 131.072) | Apache 2.0 | safetensors, GGUF | Modelo base oficial, con benchmarks publicados por Qwen |
| meta-llama/Llama-3.2-1B-Instruct | 1,2B | 131.072 | Llama 3.2 Community License | safetensors, GGUF | Alternativa de tamaño similar con contexto mayor |
| HuggingFaceTB/SmolLM2-1.7B-Instruct | 1,7B | 8.192 | Apache 2.0 | safetensors, GGUF | Modelo pequeño orientado a eficiencia, con benchmarks públicos |

## Limitaciones y advertencias

- La model card está prácticamente vacía: no documenta datos de entrenamiento, hiperparámetros, evaluación ni uso previsto, lo que impide verificar la calidad del ajuste DPO.
- No se especifica la licencia, por lo que el uso comercial es incierto y depende de la licencia del modelo base (Apache 2.0 en Qwen2.5-1.5B-Instruct) y de las condiciones que el autor pudiera imponer.
- Riesgo de alucinación inherente a un modelo de 1,5B parámetros, especialmente en tareas factuales, matemáticas de varios pasos y código complejo.
- Sesgos heredados del corpus de preentrenamiento de Qwen2.5, no evaluados ni mitigados en este adaptador.
- El rendimiento en castellano no está documentado; el modelo base está optimizado para chino e inglés.
- Al ser un adaptador LoRA, requiere cargar el modelo base y aplicar PEFT, lo que añade complejidad frente a un checkpoint completo.
- No hay garantías de que el DPO haya mejorado la utilidad frente al modelo base; sin benchmarks, el adaptador podría degradar capacidades previas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni validación externa.
- No apto para producción sin una evaluación propia de calidad, seguridad y sesgos.

## Enlaces

- HuggingFace: https://huggingface.co/kodetr/SasakLLM-1.5B-Instruct-v6-DPO
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Documentación de Qwen2.5: https://qwen.readthedocs.io/
- Repositorio de Qwen2.5 en GitHub: https://github.com/QwenLM/Qwen2.5
- Paper de DPO (Rafailov et al., 2023): https://arxiv.org/abs/2305.18290
- Documentación de PEFT: https://huggingface.co/docs/peft
- Documentación de TRL: https://huggingface.co/docs/trl
- Calculadora de impacto ambiental citada en la model card: https://mlco2.github.io/impact

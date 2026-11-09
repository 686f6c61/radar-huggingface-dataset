# rghosh8/gsm8k-grpo-deepseek-r1-distill-qwen-1.5b-seed-1234-G-4

## Resumen

`gsm8k-grpo-deepseek-r1-distill-qwen-1.5b-seed-1234-G-4` es un adaptador LoRA publicado por el usuario rghosh8 sobre el modelo base `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B`. No se trata de un modelo completo, sino de un conjunto de pesos de adaptación (formato PEFT) entrenados con GRPO (Group Relative Policy Optimization) sobre el conjunto de datos GSM8K, orientado a mejorar el razonamiento matemático de nivel escolar del modelo subyacente.

El interés técnico del artefacto radica en su carácter experimental y reproducible: forma parte de una colección (GSM8k-GRPO) que explora el efecto del muestreo de grupo (G=4) y de la semilla (seed=1234) en el ajuste fino con refuerzo. El modelo base DeepSeek-R1-Distill-Qwen-1.5B es una destilación de DeepSeek-R1 sobre Qwen2.5-1.5B, con aproximadamente 1.500 millones de parámetros y una ventana de contexto de 32.768 tokens según la documentación del modelo original.

La relevancia de esta ficha es acotada: el adaptador tiene cero descargas y cero "likes" en el momento de la consulta, no declara licencia ni idiomas, y su utilidad principal es como referencia para quienes investigan el ajuste fino con GRPO en modelos pequeños de razonamiento. No debe confundirse con un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only Qwen2.5-1.5B (modelo base DeepSeek-R1-Distill-Qwen-1.5B) |
| Parametros totales | No disponible para el adaptador; el modelo base tiene ~1.500 millones de parametros |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la model card del adaptador; el modelo base DeepSeek-R1-Distill-Qwen-1.5B declara 32.768 tokens |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el modelo base admite cuantizaciones estandar de la comunidad, pero no se documentan aqui) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA); existe una version con pesos fusionados en `rghosh8/gsm8k-grpo-deepseek-r1-distill-qwen-1.5b-seed-1234-G-4_merged` |
| Configuracion LoRA | r=16, alpha=64 |
| Tamano del repositorio | 0,1 GB |
| Libreria | peft |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El adaptador se aplica sobre DeepSeek-R1-Distill-Qwen-1.5B, un transformer decoder-only derivado de Qwen2.5-1.5B y destilado a partir de DeepSeek-R1. La model card del adaptador no detalla la arquitectura interna del modelo base ni la composición exacta de sus datos de preentrenamiento; esa información corresponde a la documentación del modelo original de DeepSeek.

El entrenamiento del adaptador emplea GRPO, una variante de optimización por política con estimación de ventaja relativa dentro de grupos de muestras, sobre el dataset GSM8K (problemas aritméticos de nivel escolar con solución paso a paso). Los hiperparámetros declarados son semilla 1234, G=4 generaciones por prompt, y LoRA con r=16 y alpha=64. La librería utilizada es TRL, según las etiquetas del repositorio. No se documentan el número de pasos, la tasa de aprendizaje, el tamaño efectivo de batch ni la composición exacta del dataset más allá de GSM8K.

## Capacidades

- Generación de texto conversacional en formato chat, heredada del modelo base.
- Razonamiento matemático de nivel escolar, presumiblemente reforzado por el ajuste con GRPO sobre GSM8K.
- Razonamiento paso a paso con cadenas de pensamiento, característica del linaje DeepSeek-R1.
- Generación de código y razonamiento general, heredados del modelo base (no verificados específicamente en este adaptador).
- Soporte de tool calling: no disponible en la documentación del adaptador.
- Soporte de agentes y razonamiento multi-paso: no documentado para el adaptador.
- Capacidades multilingües: no disponibles en la model card.
- Modo "thinking" explícito: no documentado para el adaptador; el modelo base DeepSeek-R1-Distill sí emplea razonamiento extendido.

## Casos de uso

- Investigación en ajuste fino con RL: el adaptador sirve como punto de partida reproducible (semilla y G fijos) para estudiar la varianza de GRPO en modelos pequeños de razonamiento matemático.
- Reproducción de experimentos académicos: al estar etiquetado con seed=1234 y G=4, permite replicar o comparar resultados frente a otros adaptadores de la misma colección GSM8k-GRPO.
- Evaluación comparativa de métodos de alineación: útil para contrastar GRPO frente a SFT o DPO en tareas de aritmética escolar con un presupuesto de cómputo reducido.
- Prototipado de tutores matemáticos: el modelo fusionado puede emplearse en demos locales de resolución paso a paso de problemas de primaria y secundaria, siempre con validación humana.
- Generación de datos sintéticos de razonamiento: el adaptador puede producir trazas de solución para aumentar datasets de entrenamiento en dominios matemáticos acotados.
- Docencia y formación técnica: ejemplo práctico de cómo aplicar PEFT + TRL + GRPO sobre un modelo de 1,5B en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA en sí ocupa 0,1 GB y puede cargarse junto al modelo base en cualquier GPU con suficiente memoria para este último.
- El modelo base de 1,5B en precisión FP16 requiere aproximadamente 3 GB de VRAM; en cuantización de 4 bits, en torno a 1-1,5 GB.
- Cabe holgadamente en GPUs de consumo: RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4070, RTX 4090, así como en Apple Silicon con memoria unificada suficiente.
- Para entrenamiento con GRPO (que requiere generar G=4 muestras por prompt) se recomienda al menos 16-24 GB de VRAM, dependiendo de la longitud de las secuencias y del uso de técnicas como gradient checkpointing.
- Opciones de despliegue: transformers + peft (carga del adaptador), vLLM o TGI tras fusionar los pesos con el modelo base, llama.cpp u Ollama si se convierte a GGUF la versión fusionada.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (sobre DeepSeek-R1-Distill-Qwen-1.5B) | ~1,5B (base) | No disponible en el adaptador (32.768 en el base) | LoRA + GRPO sobre GSM8K | No disponible | Hugging Face (0 descargas) |
| DeepSeek-R1-Distill-Qwen-1.5B (base) | ~1,5B | 32.768 tokens | Destilacion de DeepSeek-R1 sobre Qwen2.5-1.5B | MIT (segun el modelo original) | Hugging Face (ampliamente utilizado) |
| Qwen2.5-1.5B-Instruct | ~1,5B | 32.768 tokens | SFT + preferencias sobre Qwen2.5 | Apache 2.0 | Hugging Face |
| DeepSeek-R1-Distill-Llama-8B | ~8B | 131.072 tokens | Destilacion de DeepSeek-R1 sobre Llama 3.1 8B | Licencia Llama 3.1 | Hugging Face |

La comparación con el modelo base es la más relevante: el adaptador no cambia el tamaño ni el contexto, solo especializa el comportamiento en GSM8K mediante GRPO. Frente a Qwen2.5-1.5B-Instruct, el linaje DeepSeek-R1 aporta razonamiento extendido, mientras que el adaptador añade un sesgo específico hacia problemas aritméticos escolares.

## Limitaciones y advertencias

- Es un adaptador LoRA, no un modelo autónomo: requiere descargar y cargar el modelo base `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B` para funcionar.
- La licencia no está declarada en el repositorio; antes de cualquier uso comercial debe verificarse la licencia del modelo base y contactar con el autor.
- No se declaran idiomas soportados; el ajuste sobre GSM8K (mayoritariamente en inglés) puede degradar el rendimiento en castellano respecto al modelo base.
- El ajuste con GRPO sobre un único dataset (GSM8K) puede provocar sobreajuste al formato de esos problemas y reducir la generalización a otras tareas matemáticas o de razonamiento.
- Riesgo de alucinación inherente a los modelos de 1,5B, especialmente en problemas con muchos pasos o con datos numéricos ambiguos.
- No hay benchmarks publicados que permitan cuantificar la mejora frente al modelo base; la calidad real del adaptador es desconocida.
- Cero descargas y cero interacciones en Hugging Face: no hay evidencia de uso en la comunidad ni validación externa.
- No se documentan sesgos específicos; se heredan los del modelo base y los del dataset GSM8K.
- Para producción se recomienda fusionar los pesos, evaluar en el dominio objetivo y aplicar validación de las respuestas matemáticas.

## Enlaces

- Adaptador en Hugging Face: https://huggingface.co/rghosh8/gsm8k-grpo-deepseek-r1-distill-qwen-1.5b-seed-1234-G-4
- Pesos fusionados: https://huggingface.co/rghosh8/gsm8k-grpo-deepseek-r1-distill-qwen-1.5b-seed-1234-G-4_merged
- Colección GSM8k-GRPO: https://huggingface.co/collections/rghosh8/gsm8k-grpo
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B

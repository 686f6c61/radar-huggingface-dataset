# Hyukkyu/Llama-3.1-8B-RAQUEL-MUSE-M-ret-LoRA-v1

## Resumen

Llama-3.1-8B-RAQUEL-MUSE-M-ret-LoRA-v1 es un checkpoint de investigación publicado por el usuario Hyukkyu dentro de la campaña de reproducción RAQUEL sobre el benchmark MUSE-News. No es un modelo conversacional ni un modelo "desaprendido": es el baseline **M_ret**, es decir, la referencia reentrenada sobre los datos que deben retenerse y que los métodos de *machine unlearning* intentan aproximar. Se construye sobre `meta-llama/Llama-3.1-8B` (revisión `d04e592bb4f6aa9cfee91e2e20afa771667e1d4b`) mediante un ajuste LoRA que después se fusiona en los pesos base.

El repositorio contiene dos artefactos: en la raíz, el modelo fusionado en BF16 que se usó para la evaluación final (8.030.261.248 parámetros, 16,7 GB de repositorio), y en `adapter/`, el adaptador LoRA original en FP32. El entrenamiento LoRA emplea rango 64, alpha 128 y dropout 0,05 sobre las proyecciones q/k/v/o y gate/up/down, con una longitud máxima de 2048 tokens, batch global 32 y semilla 0. Se declararon 15 épocas de un schedule coseno, pero el autor detuvo el proceso en la época 2 (310 pasos de optimizador).

Su relevancia es metodológica: M_ret define el techo de retención (100 % en el split *native retain*) frente al cual se mide cuánto degradan los algoritmos de olvido, y sirve como punto de partida para las actualizaciones de parámetros completos que usan los métodos posteriores. Está pensado exclusivamente para evaluación de investigación en inglés y no incorpora plantilla de chat.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Llama 3.1); ajuste LoRA fusionado en los pesos base |
| Parametros totales | 8.030.261.248 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No especificada en la informacion proporcionada; la longitud maxima de entrenamiento fue de 2048 tokens |
| Tipos de cuantizacion | No se publican cuantizaciones (GGUF, GPTQ, AWQ, etc.) en la informacion disponible. Pesos fusionados en BF16 y adaptador LoRA en FP32 |
| Idiomas soportados | Ingles (`en`) |
| Licencia | llama3.1 (sujeta a la licencia y a la politica de uso aceptable de Llama 3.1) |
| Formato de pesos | safetensors (modelo fusionado en la raiz; adaptador LoRA en `adapter/`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1 8B, un transformer decoder-only denso con atención causal, sobre el que se aplica un ajuste de bajo rango. La configuración LoRA es rango 64, alpha 128 y dropout 0,05, aplicada a las proyecciones q, k, v, o, gate, up y down. El entrenamiento se hizo con base en BF16 y adaptador en FP32, learning rate 1e-4 con decaimiento coseno, 3 % de warmup, weight decay 0,01, batch global 32, longitud máxima 2048, semilla 0 y pérdida calculada únicamente sobre la respuesta en el formato QA `Question: {question}\nAnswer:`; los artículos se entrenan como texto causal estándar. Se declaró un schedule coseno de 15 épocas, pero solo se completaron 2 (310 pasos de optimizador), después de comprobar tras cada época que se cumplían los umbrales predefinidos de precisión en los conjuntos *native forget* y *native retain*.

Los datos de entrenamiento proceden de `muse-bench/MUSE-News` —3.555 bloques de artículos y los pares QA de `knowmem`, con 100 pares de retención usados en dos vistas cada uno y repetidos 7 veces por época, lo que da 4.955 elementos por época— y de `Hyukkyu/RAQUEL2-ICLR` (revisión `aee9a541f1ba58032e2eb62a1e56149475cd1126`). El punto clave del diseño es que M_ret **solo ve** los artículos y pares QA de retención: nunca accede a los artículos ni a los pares QA de olvido, de modo que funciona como la referencia reentrenada que los algoritmos de olvido tratan de imitar sin haber visto esos datos. No se documenta en la información disponible el uso de RLHF, DPO ni ninguna innovación de decodificación (atención lineal, decodificación especulativa, etc.). El autor advierte además que la combinación publicada empareja M_orig en la época 1 con M_ret en la época 2, por lo que M_ret vio los datos de retención una época más.

## Capacidades

- Generación de texto causal en inglés, sin plantilla de conversación: el modelo espera el prefijo plano `Question: {question}\nAnswer:` y la evaluación se realizó con decodificación greedy y un máximo de 96 tokens nuevos.
- Respuesta a preguntas sobre el corpus de noticias de MUSE-News: 100 % de acierto en el conjunto *native retain* (100/100) y 75 % en el conjunto parafraseado de retención (75/100).
- Retención de conocimiento factual del conjunto de retención, que es precisamente la propiedad que se mide para cuantificar la degradación introducida por los métodos de olvido.
- Punto de partida para ajuste de parámetros completos: los métodos de desaprendizaje posteriores de la campaña parten del baseline fusionado, no del adaptador.
- Capacidad de carga como adaptador PEFT mediante `PeftModel.from_pretrained(base_model, repo_id, subfolder="adapter")`, con la revisión fijada del modelo base y pesos base en BF16.
- No se documentan capacidades de *tool calling*, *function calling*, razonamiento multi-paso, agentes, visión, audio, matemáticas avanzadas ni modo de pensamiento explícito.
- Capacidades multilingües: únicamente inglés según la etiqueta de idioma declarada.
- No es un modelo instruido ni alineado para uso conversacional: no se ha entrenado con una plantilla de chat.

## Casos de uso

- Reproducción del protocolo MUSE-News: el modelo sirve como M_ret de referencia, el artefacto contra el que se compara cualquier ejecución de un algoritmo de olvido para saber cuánta precisión de retención se ha perdido.
- Investigación en *machine unlearning*: los métodos que actualizan parámetros completos necesitan un baseline fusionado y estable como punto de partida; este repositorio lo proporciona con hashes de pesos registrados en `training_recipe.json`.
- Evaluación de métodos de olvido con juez automático: el modelo se evalúa con respuestas greedy y un juez fijado (`Qwen/Qwen3.8-27B`, revisión `1d4bf0f2ff`, temperatura 0, *thinking* desactivado), un montaje reproducible para medir olvido y retención en cohortes completas.
- Auditoría de memorización en corpus periodísticos: al ser un modelo ajustado sobre artículos de noticias, permite estudiar qué contenido factual se memoriza y con qué tasa de recuperación (32 % en *native forget*, 33 % en parafraseado de olvido).
- Generación de datos de retención para experimentos: sus pares QA y artículos de retención permiten construir conjuntos de validación y sondas de retención adicionales sin tocar los conjuntos de olvido.
- Ablación de hiperparámetros LoRA en régimen de retención: con rango 64, alpha 128, dropout 0,05 y LR 1e-4 documentados, es una configuración de referencia para estudiar el efecto de cada hiperparámetro en la curva de retención.
- Comparación cruzada de benchmarks de olvido: el mismo autor publica la variante TOFU (`Hyukkyu/Llama-3.1-8B-RAQUEL-TOFU-M-ret-LoRA-v1`), lo que permite contrastar el comportamiento del mismo protocolo sobre dos corpus distintos.
- Estudios de calibración y *red-teaming* sobre modelos de 8B ajustados con LoRA: útil para medir cuánto contenido sensible de un corpus acotado se filtra en las generaciones antes de aplicar un método de olvido.

## Benchmarks y rendimiento

Evaluación final del modelo fusionado publicado, juzgada por `Qwen/Qwen3.8-27B` (revisión `1d4bf0f2ff`) a temperatura 0, con *thinking* desactivado, decodificación greedy, prompt `Question: {question}\nAnswer:` y máximo de 96 tokens nuevos:

| Split | Correctas / total | Precisión |
|---|---:|---:|
| Native forget | 32/100 | 32,00 % |
| Native retain | 100/100 | 100,00 % |
| Paraphrased forget | 33/100 | 33,00 % |
| Paraphrased retain | 75/100 | 75,00 % |
| RAQUEL affected | 205/1257 | 16,31 % |
| RAQUEL unaffected | 189/863 | 21,90 % |

Resultados de la época 1 de este mismo modelo, reportados por el autor como referencia del emparejamiento con M_orig:

| Split | Epoca 1 |
|---|---:|
| Native forget | 31,0 % |
| Native retain | 90,0 % |
| Paraphrased forget | 36,0 % |
| Paraphrased retain | 54,0 % |
| RAQUEL affected | 16,5 % |
| RAQUEL unaffected | 22,4 % |

Notas metodológicas de la evaluación: MUSE-News no incluye preguntas parafraseadas, por lo que cada paráfrasis fue generada para este proyecto con `Qwen/Qwen3.8-27B`, verificada automáticamente en preservación de hechos y significado, y revisada, manteniendo la respuesta de referencia. Las preguntas de RAQUEL se excluyeron del ajuste de configuración. Las métricas agregadas y los hashes de evidencia están en `evaluation.json`. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 16,1 GB solo de pesos (8.030.261.248 parámetros × 2 bytes), más activaciones y caché KV; en la práctica, unos 18–20 GB para una ventana de 2048 tokens.
- VRAM estimada en FP32: alrededor de 32,1 GB de pesos, por lo que no cabe en GPU de consumo sin cuantización o *offloading*.
- GPU recomendadas: A100 40/80 GB, H100, L40S o cualquier GPU con 24 GB o más para BF16; para el adaptador FP32 conviene una GPU de 40 GB o superior.
- Cabe en GPU de consumo: sí, en BF16 y con margen ajustado, en RTX 3090, RTX 4090 y RTX 5090 (24 GB), usando `device_map="auto"` y resolución de memoria fuera del dispositivo si fuera necesario.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM.from_pretrained(..., dtype=torch.bfloat16, device_map="auto")`; el repositorio declara las etiquetas `text-generation-inference` y `endpoints_compatible`, por lo que es desplegable con TGI y con servicios compatibles con endpoints; al ser arquitectura Llama estándar también es apto para vLLM. No se publican pesos GGUF, por lo que llama.cpp u Ollama exigirían una conversión previa no incluida en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.
- Nota de reproducibilidad: la raíz contiene los pesos fusionados evaluados; cargar el adaptador y fusionarlo por separado puede introducir pequeñas diferencias de redondeo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Datos de ajuste |
|---|---:|---|---|---|---|
| Llama-3.1-8B-RAQUEL-MUSE-M-ret-LoRA-v1 | 8.030.261.248 | No disponible (entrenamiento a 2048 tokens) | llama3.1 | HuggingFace, 0 descargas y 0 likes en la informacion disponible | MUSE-News (retencion) + RAQUEL2-ICLR |
| meta-llama/Llama-3.1-8B (base) | 8B aprox. | 128k tokens segun Meta (no confirmado en la informacion proporcionada) | llama3.1 | HuggingFace, modelo base oficial | Preentrenamiento general |
| Hyukkyu/Llama-3.1-8B-RAQUEL-TOFU-M-ret-LoRA-v1 | No disponible | No disponible | No disponible en la informacion proporcionada | HuggingFace; tambien listado en friendli.ai | Baseline M_ret sobre TOFU en lugar de MUSE-News |

No se dispone de datos de benchmarks comparativos entre estos tres modelos en la información proporcionada, más allá de que el checkpoint TOFU comparte protocolo y autor con el modelo descrito.

## Limitaciones y advertencias

- No es un modelo desaprendido. Es un baseline de retención: conserva contenido del conjunto de olvido (32 % de acierto en *native forget*), por lo que no debe desplegarse con la expectativa de que haya olvidado nada.
- No está instruido ni alineado para conversación: no usa plantilla de chat y el autor recomienda emplear el prefijo QA plano para la evaluación. Usarlo en diálogo abierto producirá resultados degradados.
- Idiomas: únicamente inglés declarado; no hay evidencia de comportamiento en castellano ni en otros idiomas.
- Contexto limitado en el entrenamiento a 2048 tokens; aunque la arquitectura base puede soportar ventanas mayores, no se ha validado su comportamiento más allá de esa longitud.
- Riesgo de alucinación: es un modelo causal de 8B ajustado sobre un corpus periodístico acotado; puede generar respuestas factualmente incorrectas con apariencia de seguridad, especialmente fuera del dominio de MUSE-News.
- Sesgos: no se documenta ningún análisis de sesgo, toxicidad o sesgo de género/raza en la información disponible; debe asumirse el comportamiento heredado del modelo base y del corpus de noticias.
- Inconsistencia metodológica conocida: M_ret se publica en la época 2 mientras que M_orig se empareja en la época 1, de modo que este modelo vio los datos de retención una época más. Cualquier comparación debe tenerlo en cuenta.
- Procedencia de la evaluación: las paráfrasis de las preguntas de MUSE-News no son oficiales, fueron generadas con `Qwen/Qwen3.8-27B` y verificadas automáticamente, con revisión humana. Los resultados en los splits parafraseados dependen de ese proceso.
- Uso comercial: la licencia llama3.1 y la política de uso aceptable de Llama 3.1 aplican a este repositorio; conviene revisar ambas antes de cualquier uso en producción.
- Validación comunitaria nula según los datos disponibles (0 descargas, 0 *likes*), lo que implica ausencia de verificación independiente de los resultados.
- La combinación de adaptador y base fusionada por separado puede diferir ligeramente del artefacto evaluado en la raíz del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Hyukkyu/Llama-3.1-8B-RAQUEL-MUSE-M-ret-LoRA-v1
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B
- Variante TOFU del mismo autor: https://huggingface.co/Hyukkyu/Llama-3.1-8B-RAQUEL-TOFU-M-ret-LoRA-v1
- Despliegue gestionado de la variante TOFU en FriendliAI: https://friendli.ai/models/Hyukkyu/Llama-3.1-8B-RAQUEL-TOFU-M-ret-LoRA-v1
- Dataset de referencia MUSE-News: https://huggingface.co/datasets/muse-bench/MUSE-News
- Dataset auxiliar RAQUEL2-ICLR: https://huggingface.co/datasets/Hyukkyu/RAQUEL2-ICLR
- Pagina oficial de la familia Llama 3 (Meta): https://dev.meta.ai/llama/models/llama-3
- Pagina de modelos Llama 3 para desarrolladores (Meta): https://developer.meta.com/ai/models/llama-3/

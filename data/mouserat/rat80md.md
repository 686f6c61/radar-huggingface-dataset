# Mouserat/rat80mD

## Resumen

rat80mD es un modelo de lenguaje decoder-only de aproximadamente 80 millones de parámetros desarrollado por el usuario Mouserat y publicado en Hugging Face. Sigue la arquitectura Llama con atención de consultas agrupadas (GQA) y está entrenado para trabajar con japonés e inglés a partir de un vocabulario de 64.003 tokens derivado de mT5-small. El modelo se distribuye bajo licencia Apache 2.0 y con pesos en formato safetensors.

Se trata de un modelo estrictamente de preentrenamiento: el autor advierte de forma explícita que no se ha aplicado SFT ni ajuste para diálogo, por lo que no debe emplearse como asistente conversacional ni esperar de él comportamiento de seguimiento de instrucciones. Su finalidad realista es servir como base para experimentación, fine-tuning posterior o investigación sobre modelos pequeños multilingües.

Por su tamaño reducido (0,3 GB de repositorio) y su contexto máximo de 4096 tokens, resulta relevante para entornos con recursos limitados, prototipado rápido y estudios de escalado a pequeña escala en el par de idiomas japonés-inglés. La pérdida final de entrenamiento reportada es de 3,018 y la de evaluación de 3,636 tras 16.000 pasos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama decoder-only con GQA y SwiGLU |
| Parametros totales | 79.968.320 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors) |
| Idiomas soportados | japones (ja), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer decoder-only de estilo Llama con las siguientes dimensiones: hidden_size de 512, 12 capas, 8 cabezas de atención y 4 cabezas de clave-valor (GQA), con un intermediate_size de 2048 en las capas feed-forward con activación SwiGLU. Usa embeddings posicionales rotatorios (RoPE) con rope_theta de 10000 y una longitud máxima de posición de 4096. El tokenizador parte del vocabulario de mT5-small, ajustado a 64.003 tokens, con tokens especiales `<pad>`, `<bos>`, `</s>` y `<unk>`, y sin los tokens `<extra_id_*>`.

El entrenamiento se realizó exclusivamente como preentrenamiento de modelado de lenguaje, sin SFT, RLHF ni DPO. El autor reporta 16.000 pasos finales con una pérdida de entrenamiento de 3,018 y una de evaluación de 3,636. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición del dataset ni detalles sobre innovaciones técnicas adicionales como decodificación especulativa o atención lineal. Los registros completos se remiten a `trainer_state.json` y `plan.md` dentro del repositorio.

## Capacidades

- Generación de texto autoregresiva en japonés e inglés como modelo base de preentrenamiento.
- Modelado de lenguaje y continuación de texto; útil para evaluar perplejidad y calidad de representaciones.
- Capacidad potencial de adaptación mediante fine-tuning a tareas concretas (clasificación, generación guiada, resumen), al no estar ajustado a instrucciones.
- Soporte multilingüe limitado al par ja-en; no se documentan otros idiomas.
- No dispone de soporte de tool calling ni function calling.
- No incorpora modo de razonamiento (thinking mode), visión, audio ni capacidades de agente.
- No está diseñado para conversación multi-turno ni seguimiento de instrucciones.

## Casos de uso

- Investigación sobre modelos de lenguaje pequeños: sirve como punto de partida para estudiar dinámicas de escalado, tokenización multilingüe y curvas de pérdida en modelos de unos 80M de parámetros.
- Fine-tuning supervisado para tareas específicas de japonés o inglés: al ser un modelo base, puede adaptarse con SFT a clasificación de texto, análisis de sentimiento o extracción de entidades en dominios acotados.
- Generación de texto experimental en entornos con recursos muy limitados: sus 80M de parámetros permiten inferencia en CPU o GPU de gama baja, útil para prototipos y demostraciones.
- Evaluación de tokenizadores derivados de mT5: permite comparar el comportamiento de un vocabulario de 64.003 tokens en tareas de tokenización y generación ja-en.
- Base para experimentos de destilación o poda: su tamaño compacto lo hace adecuado como estudiante en pipelines de destilación desde modelos mayores.
- Docencia y formación: modelo manejable para explicar arquitecturas decoder-only, GQA y RoPE en cursos prácticos sin necesidad de hardware especializado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta pérdidas de entrenamiento (3,018) y evaluación (3,636) tras 16.000 pasos, sin métricas estandarizadas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,32 GB solo para pesos (80M × 4 bytes), más overhead de activaciones y caché KV.
- VRAM estimada en fp16/bf16: alrededor de 0,16 GB para pesos.
- Cabe holgadamente en cualquier GPU consumer, incluidas GTX 1650, RTX 3060, RTX 4090, así como en CPU.
- GPU recomendadas: no se requiere hardware de datacenter; cualquier GPU con al menos 1-2 GB de memoria libre es suficiente.
- Opciones de despliegue: transformers (AutoModelForCausalLM), llama.cpp y Ollama previa conversión a GGUF, y vLLM/TGI para servir en producción si se generan los artefactos correspondientes.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño, se espera throughput alto en GPU consumer, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| rat80mD | 79,97M | 4096 | ja, en | Apache 2.0 | safetensors |
| TinyLlama-1.1B | 1,1B | 2048 | en (principalmente) | Apache 2.0 | safetensors, GGUF |
| Qwen2.5-0.5B | 0,49B | 32768 | multilingüe | Apache 2.0 | safetensors, GGUF |
| mT5-small | 0,3B | 512 | multilingüe | Apache 2.0 | safetensors |

La comparación es orientativa: rat80mD es sustancialmente menor que TinyLlama o Qwen2.5-0.5B y carece de ajuste a instrucciones, mientras que mT5-small es encoder-decoder y multilingüe más amplio. No hay datos de rendimiento comparables publicados para rat80mD.

## Limitaciones y advertencias

- Modelo solo de preentrenamiento: no seguirá instrucciones ni mantendrá diálogos coherentes; el autor desaconseja explícitamente su uso como chat.
- Riesgo elevado de alucinación y generación incoherente al no haber pasado por SFT ni RLHF.
- Sesgos desconocidos: no se documenta la composición del corpus de entrenamiento, por lo que no pueden evaluarse sesgos de género, culturales o de dominio.
- Cobertura lingüística limitada a japonés e inglés; el rendimiento fuera de esos idiomas no está garantizado.
- Contexto máximo de 4096 tokens; textos más largos requieren truncado o ventanas deslizantes.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de ajuste y de evaluación de calidad hace arriesgado su despliegue directo en producción sin fine-tuning y validación previa.
- El repositorio se describe como privado en la model card, lo que puede condicionar el acceso y la reproducibilidad.

## Enlaces

- Hugging Face: https://huggingface.co/Mouserat/rat80mD
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.

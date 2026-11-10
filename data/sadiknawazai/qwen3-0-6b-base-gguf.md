# SadikNawazAI/Qwen3-0.6B-Base-GGUF

## Resumen

Qwen3-0.6B-Base-GGUF es una conversion al formato GGUF del modelo base Qwen3-0.6B-Base, publicado originalmente por el equipo Qwen de Alibaba Cloud. Este repositorio, alojado por SadikNawazAI, redistribuye la cuantizacion Q8_0 generada por mradermacher, manteniendo una copia byte a byte identica al archivo original. El modelo es un transformer denso de tipo decoder-only con aproximadamente 596 millones de parametros, disenado como modelo de preentrenamiento puro (no ajustado a instrucciones) para tareas de continuacion de texto, evaluacion de perplejidad, destilacion y uso como codificador de texto.

La relevancia de esta ficha radica en que el archivo GGUF Q8_0 permite ejecutar el modelo en CPU con llama.cpp u Ollama manteniendo una calidad practicamente identica a f16 con aproximadamente la mitad del tamano. Ademas, este archivo concreto se emplea como codificador de texto del modelo de difusion Anima dentro de pipelines de stable-diffusion.cpp, lo que le confiere un uso especializado mas alla de la generacion de texto generica.

Arquitectura Qwen3 con 28 capas, dimension oculta 1024, 16 cabezas de atencion y 8 cabezas KV (GQA), FFN de 3072 y dimension de cabeza 128. La longitud de contexto nativa es de 32.768 tokens y el tokenizador es BPE estilo GPT-2 con 151.936 tokens. Al ser un modelo base, no incorpora comportamiento de asistente ni ajuste por RLHF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen3) |
| Parametros totales | ~596.049.920 (28 capas, hidden 1024, 16 heads / 8 KV heads, FFN 3072, head dim 128) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | Q8_0 (unico archivo publicado en este repo) |
| Idiomas soportados | Ingles (mezcla de entrenamiento centrada en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (version 3); safetensors en el modelo base original |
| Tamano del archivo | 639.447.232 bytes (610 MiB), ~8.5 bits por peso |
| Tokenizador | BPE estilo GPT-2, 151.936 tokens |
| Plantilla de chat | Qwen3 ChatML embebida en el GGUF (pero pesos no ajustados a instrucciones) |
| SHA-256 | 4b088f1793f6cba9f0c2f77ab835ef6734f205c2159168698c6e1a51b7df168a |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Qwen3 en su variante densa de 0.6B: 28 capas transformer con atencion multi-cabeza con consultas agrupadas (16 cabezas de atencion y 8 cabezas KV), dimension oculta de 1024, FFN de 3072 y dimension de cabeza de 128. Es un modelo decoder-only de preentrenamiento puro, sin etapa de ajuste supervisado ni RLHF/DPO, por lo que su comportamiento es de continuacion de texto y no de asistente.

La informacion disponible no detalla el numero exacto de tokens de entrenamiento ni la composicion del dataset, aunque la model card indica una mezcla centrada en ingles. La cuantizacion Q8_0 fue realizada por mradermacher sobre los pesos originales en safetensors de Qwen/Qwen3-0.6B-Base, y el archivo redistribuido por SadikNawazAI es byte a byte identico al original (verificado por tamano y SHA-256). No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal en la informacion proporcionada.

## Capacidades

- Generacion y continuacion de texto sin instrucciones: el modelo completa secuencias, no responde a ordenes.
- Evaluacion de perplejidad y benchmarking de modelos base.
- Destilacion de conocimiento hacia modelos mas pequenos.
- Codificador de texto para pipelines de difusion (uso documentado como text encoder de Anima en stable-diffusion.cpp).
- Ajuste fino (fine-tuning) como punto de partida para tareas especificas.
- Soporte de tool calling / function calling: no disponible (modelo base sin ajuste).
- Soporte de agentes y razonamiento multi-paso: no disponible de forma nativa.
- Capacidades multilingues: limitadas; entrenamiento centrado en ingles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Ajuste fino para tareas de dominio: al ser un modelo base de 596M, sirve como punto de partida economico para fine-tuning supervisado en clasificacion, extraccion o generacion acotada, con requisitos de computo muy bajos.
- Evaluacion de perplejidad y validacion de pipelines: util para medir la calidad de tokenizadores, datasets o tecnicas de cuantizacion comparando perplejidad antes y despues.
- Destilacion de modelos mayores: se puede emplear como estudiante en destilacion desde modelos Qwen3 de mayor tamano, aprovechando su contexto de 32.768 tokens.
- Codificador de texto en generacion de imagenes: integrado en stable-diffusion.cpp como `--clip-l` para el modelo Anima, tal como documenta la model card.
- Generacion de texto en CPU y entornos con recursos limitados: el archivo Q8_0 de 610 MiB se ejecuta comodamente en CPU con llama.cpp u Ollama, adecuado para prototipos y pruebas offline.
- Pruebas de infraestructura y CI: su tamano reducido permite validar pipelines de inferencia (llama.cpp, llama-cpp-python, Ollama) de forma rapida y reproducible en entornos de integracion continua.
- Investigacion sobre cuantizacion: comparar Q8_0 frente a f16 en tareas de continuacion para estudiar la degradacion por cuantizacion en modelos pequenos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q8_0 ocupa 610 MiB; con overhead de contexto de 2.048 tokens la huella ronda 1 GB. Con contexto completo de 32.768 tokens la memoria KV aumenta de forma proporcional.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el modelo esta pensado para ejecucion en CPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna (RTX 3060, RTX 4060, etc.), aunque su diseno apunta a CPU.
- Opciones de despliegue: llama.cpp (`llama-cli`), Ollama (`ollama run hf.co/SadikNawazAI/Qwen3-0.6B-Base-GGUF:Q8_0`), llama-cpp-python, stable-diffusion.cpp (como text encoder).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---:|---|---|---|
| Qwen3-0.6B-Base (este repo, Q8_0) | ~596M | 32.768 | Apache 2.0 | GGUF Q8_0 | Base, sin ajuste a instrucciones |
| Qwen3-0.6B-Base original | ~596M | 32.768 | Apache 2.0 | safetensors | Pesos de referencia sin cuantizar |
| Qwen2.5-Coder-1.5B-Instruct | ~1.5B | no disponible | no disponible | GGUF | Instruct, orientado a codigo (mencionado en la model card) |
| Llama 3.2 3B Instruct | ~3B | no disponible | no disponible | GGUF | Instruct, mayor capacidad (mencionado en la model card) |

Los modelos comparables citados en la model card son alternativas de mayor tamano y ajustadas a instrucciones; no se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- No esta ajustado a instrucciones: no presenta comportamiento de asistente, no soporta tool calling ni dispone de ajuste de seguridad.
- Capacidad limitada (0.6B): conocimiento del mundo reducido y razonamiento multi-paso debil.
- Entrenamiento centrado en ingles: rendimiento limitado en castellano y otros idiomas.
- Riesgo de alucinacion: no debe usarse para respuestas factuales sin verificacion.
- Sesgos: al ser un modelo base preentrenado, puede reproducir sesgos presentes en los datos de entrenamiento; no se documentan evaluaciones de sesgo.
- Licencia Apache 2.0 permite uso comercial, pero los pesos originales son de Alibaba Cloud (Qwen) y la cuantizacion de mradermacher; conviene conservar los avisos de atribucion.
- La plantilla ChatML esta embebida en el GGUF, lo que puede inducir a error: los pesos no estan entrenados para seguir ese formato como instrucciones.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SadikNawazAI/Qwen3-0.6B-Base-GGUF
- Modelo base original: https://huggingface.co/Qwen/Qwen3-0.6B-Base
- Cuantizacion original (mradermacher): https://huggingface.co/mradermacher/Qwen3-0.6B-Base-GGUF
- Mirror de componentes: https://huggingface.co/JoyFusionAI/gguf-components
- Modelo Anima (text encoder): https://huggingface.co/circlestone-labs/Anima
- Modelo alternativo citado (Qwen2.5-Coder-1.5B-Instruct GGUF): https://huggingface.co/SadikNawazAI/Qwen2.5-Coder-1.5B-Instruct-GGUF
- Modelo alternativo citado (Llama 3.2 3B Instruct GGUF): https://huggingface.co/SadikNawazAI/Llama-3.2-3B-Instruct-GGUF

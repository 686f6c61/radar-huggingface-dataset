# sivamani-31/sika-gpt

## Resumen

Sika-GPT es un ajuste fino (fine-tune) del modelo Qwen2.5-1.5B-Instruct, publicado por el usuario independiente sivamani-31 en Hugging Face. Se presenta como un modelo generativo de alta eficiencia orientado a razonamiento tecnico, generacion de codigo y conversaciones de baja latencia en hardware de consumo. Con 1.543.714.304 parametros totales (aproximadamente 1.540 millones, coherente con la familia Qwen2.5-1.5B), hereda la arquitectura transformer causal de Qwen2.5 y se distribuye bajo licencia Apache 2.0.

El modelo se entrena mediante QLoRA con rango 16 y alpha 32 sobre las proyecciones de atencion y MLP, en precision NF4 de 4 bits con computo mixto FP16/BF16. El autor indica que el entrenamiento es viable en una unica GPU de gama media (RTX 3060/4060) o en una T4 de Google Colab, lo que lo situa en la categoria de modelos ligeros ajustables con recursos limitados. Su propuesta de valor es la eficiencia: inferencia en CPU, portatiles y GPUs de consumo con cuantizacion de 4 y 8 bits, y compatibilidad declarada con transformers, accelerate, vLLM y Ollama.

La relevancia actual del modelo es limitada pero concreta: ofrece una alternativa permisiva (Apache 2.0) para experimentacion con modelos de 1.500 millones de parametros en entornos con poca VRAM, con soporte declarado de ingles, tamil, malayo, telugu, sanscrito y chino. No obstante, la model card no aporta datos verificables sobre el proceso de entrenamiento, el volumen de datos, la composicion del dataset ni resultados de evaluacion, por lo que debe tratarse como un ajuste comunitario sin validacion independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo causal (Causal LM) con atencion optimizada y SwiGLU, derivado de Qwen2.5-1.5B-Instruct |
| Parametros totales | 1.543.714.304 (aproximadamente 1.540 millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Qwen2.5-1.5B-Instruct soporta hasta 32.768 tokens, pero el ajuste no lo confirma) |
| Tipos de cuantizacion | 4 bits NF4 (BitsAndBytes), 8 bits, FP16, BF16 y GGUF (segun la model card) |
| Idiomas soportados | Ingles (en), tamil (ta), malayo (ml), telugu (te), sanscrito (sa) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (repo de 3,1 GB); se menciona soporte GGUF sin confirmar artefactos publicados |

## Arquitectura y entrenamiento

Sika-GPT es un ajuste fino del modelo Qwen2.5-1.5B-Instruct, que emplea una arquitectura transformer causal con atencion multi-cabeza, activacion SwiGLU y normalizacion RMSNorm, ademas de codificaciones posicionales rotatorias (RoPE) en el modelo base. El autor describe la arquitectura como "AutoRegressive Transformer / Causal LM" con "atencion optimizada y SwiGLU", sin detallar modificaciones estructurales respecto al modelo original. El ajuste se realiza con QLoRA de rango 16, alpha 32 y dropout 0,05, aplicado a las proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`, en precision NF4 de 4 bits con computo mixto FP16/BF16.

No se especifica el numero de tokens de entrenamiento, la composicion del dataset, la procedencia de los datos ni si se aplicaron tecnicas de alineacion adicionales como RLHF o DPO. La model card tampoco documenta innovaciones tecnicas propias (decodificacion especulativa, atencion lineal, modos de razonamiento explicito) mas alla de las heredadas del modelo base. La unica informacion verificable sobre el entrenamiento es la configuracion de QLoRA y el requisito de hardware (una RTX 3060/4060 o una T4 de Colab), lo que sugiere un ajuste de alcance modesto y sin validacion publica del proceso.

## Capacidades

- Generacion de texto conversacional multi-turno con plantilla de chat (`apply_chat_template`) y rol de sistema.
- Generacion de codigo en Python, JavaScript, TypeScript, C++, Go y SQL, segun declara el autor.
- Razonamiento tecnico y descomposicion de problemas ("deep problem breakdown").
- Sintesis de resultados de busqueda web ("live web search synthesis"), aunque la model card no documenta el mecanismo de integracion ni herramientas asociadas.
- Capacidades multilingues declaradas en ingles, tamil, malayo, telugu, sanscrito y chino.
- Soporte de cuantizacion de 4 y 8 bits para inferencia en entornos con poca memoria.
- Compatibilidad declarada con `transformers`, `accelerate`, `vLLM` y `Ollama`.
- No se documenta soporte explicito de tool calling, function calling, agentes multi-paso, vision, audio ni modo de razonamiento extendido (thinking mode). Cualquier capacidad de este tipo seria la heredada del modelo base Qwen2.5-1.5B-Instruct, sin confirmacion en este ajuste.

## Casos de uso

- Asistente de codigo en local para desarrolladores con GPU de consumo: el modelo puede generar funciones y fragmentos en varios lenguajes y ejecutarse en 4 bits con aproximadamente 4 GB de VRAM, lo que permite integrarlo en un IDE o en un script de terminal sin depender de la nube.
- Prototipado rapido de chatbots: al ser compatible con la plantilla de chat de Qwen2.5 y con `transformers`, permite montar un servicio conversacional basico con `pipeline("text-generation")` en pocas lineas y desplegarlo en una T4 o en CPU.
- Educacion y experimentacion con ajuste fino: su configuracion QLoRA documentada (rango 16, alpha 32) sirve como plantilla reproducible para que estudiantes entrenen sus propios ajustes sobre Qwen2.5-1.5B en Colab.
- Generacion de codigo en pipelines de CI/CD con recursos limitados: puede emplearse para tareas auxiliares como generar docstrings, sugerir tests o resumir diffs, siempre con revision humana, dado su tamano reducido y su licencia permisiva.
- Procesamiento multilingue para comunidades del sur de la India: el soporte declarado de tamil, malayo, telugu y sanscrito permite experimentar con resumenes o respuestas en estos idiomas, aunque sin datos de evaluacion que respalden la calidad.
- Despliegue en entornos con CPU o edge: gracias a la cuantizacion GGUF mencionada y a su tamano de 1.500 millones de parametros, es candidato para inferencia en portatiles sin GPU dedicada, con latencias mayores que en GPU pero sin requisitos de hardware especializados.
- Base para ajustes posteriores: al ser Apache 2.0 y estar disponible en safetensors, puede reutilizarse como punto de partida para fine-tunes especificos de dominio sin restricciones de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,1 GB en FP16 (pesos de 1.540 millones de parametros), en torno a 0,8-1 GB en 4 bits NF4 (el autor afirma que funciona con 4 GB de VRAM en modo 4 bits), y alrededor de 1,6 GB en 8 bits.
- GPU recomendadas: RTX 3060, RTX 4060, T4 (Google Colab) para entrenamiento QLoRA; cualquier GPU con al menos 4-8 GB de VRAM para inferencia cuantizada; A100 o H100 no son necesarias para este tamano.
- Cabe en GPU de consumo: si, en tarjetas con 4 GB o mas de VRAM en cuantizacion de 4 bits, y en la mayoria de GPUs modernas de 8 GB o mas en FP16.
- Opciones de despliegue: `transformers` con `device_map="auto"`, `accelerate`, `vLLM`, `Ollama` y cuantizacion BitsAndBytes; la model card menciona soporte GGUF aunque no se confirma la publicacion de artefactos en el repositorio.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Sika-GPT | 1.540 M | No disponible (heredado de Qwen2.5-1.5B, hasta 32.768 tokens) | Apache 2.0 | Hugging Face, safetensors | Ajuste QLoRA comunitario sin benchmarks publicados |
| Qwen2.5-1.5B-Instruct | 1.540 M | 32.768 tokens | Apache 2.0 | Hugging Face, safetensors y GGUF | Modelo base oficial, con evaluaciones publicadas por el equipo Qwen |
| Llama 3.2 1B Instruct | 1.240 M | 128.000 tokens | Llama 3.2 Community License | Hugging Face, safetensors y GGUF | Licencia con restricciones de uso comercial y de nombrado |
| Gemma 2 2B IT | 2.600 M | 8.192 tokens | Gemma Terms of Use | Hugging Face, safetensors y GGUF | Mayor tamano y contexto mas corto; licencia con condiciones de uso |

La comparativa se limita a datos estructurales y de licencia, ya que no hay resultados de benchmarks publicados para Sika-GPT que permitan contrastar calidad frente a estas alternativas.

## Limitaciones y advertencias

- Ausencia total de benchmarks y de documentacion del dataset de entrenamiento: no es posible verificar la calidad, la cobertura linguistica ni la robustez del ajuste.
- Riesgo de alucinacion inherente a un modelo de 1.500 millones de parametros, especialmente en tareas de razonamiento profundo o sintesis de informacion web; la model card no aporta mitigaciones.
- El soporte multilingue declarado (tamil, malayo, telugu, sanscrito, chino) no esta respaldado por evaluaciones; la calidad real en estos idiomas es desconocida y probablemente inferior a la del ingles.
- La capacidad de "sintesis de busqueda web" no se documenta tecnicamente: no se especifica si el modelo tiene tool calling nativo o si depende de un pipeline externo del Space de demostracion.
- La longitud de contexto efectiva del ajuste no se confirma; aunque el modelo base soporta 32.768 tokens, el fine-tune podria no mantener ese rendimiento en contextos largos.
- Licencia Apache 2.0 permisiva para uso comercial, pero el usuario debe asumir la responsabilidad de validar el modelo en su dominio, dado que no hay garantias de calidad ni soporte del autor.
- Modelo publicado por un autor individual, sin proceso de revision por pares ni evaluaciones de terceros; la fecha de creacion indicada (2026) y la ausencia de datos de entrenamiento dificultan la trazabilidad.
- El repositorio es pequeno (3,1 GB) y tiene un numero muy bajo de likes (1) y descargas moderadas (977), lo que sugiere una adopcion limitada y poca validacion por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sivamani-31/sika-gpt
- Space de demostracion (chat web): https://huggingface.co/spaces/sivamani-31/sika-gpt-chat
- Perfil del autor: https://huggingface.co/sivamani-31
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0

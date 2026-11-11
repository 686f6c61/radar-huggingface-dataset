# Aobangaming/Luna-3.1-230m-GGUF

## Resumen

Luna 3.1 230M es un modelo de lenguaje de tipo transformer causal desarrollado por Aobangaming (AobanZ) como continuación de la familia Luna. Se distribuye en formato GGUF para inferencia con llama.cpp y está pensado para conversación y roleplay con ventanas de contexto largas (8k tokens), un tamaño reducido (228,8 millones de parámetros) y una velocidad de generación declarada de 130 tokens por segundo. Su relevancia radica en que es un modelo pequeno, de licencia MIT y entrenado con recursos muy limitados, lo que lo convierte en una opción para experimentación local y despliegues con requisitos mínimos de hardware.

El modelo conserva la arquitectura denominada "Lightning" de la generación anterior, con cambios en RMSNorm y RoPE, y fue ajustado mediante SFT sobre el dataset Capybara de TRL. La model card indica que el entrenamiento se realizó en una única RTX 3050 de 6 GB durante aproximadamente media hora, lo que da una idea del alcance y de las limitaciones esperables en calidad.

Es importante senalar que la arquitectura "Lightning" no es compatible con llama.cpp estándar: el autor publica un fork llamado Lightning.cpp para poder cargar los pesos GGUF. Esta ficha recoge únicamente los datos publicados por el autor; no se han encontrado benchmarks ni evaluaciones independientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (denominada "Lightning"), 12 capas, MHA, RMSNorm y RoPE |
| Parametros totales | 228.829.440 (228,8 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8126 tokens (la model card menciona "8k") |
| Tipos de cuantizacion | no disponible (el repo se distribuye en GGUF; no se detallan los niveles incluidos) |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | GGUF (repo); modelo base en safetensors segun la libreria transformers |
| Dimension oculta (d_model) | 768 |
| Cabezas de atencion | 12 |
| Vocabulario | ~100k tokens |
| Tamano del repo | 0,9 GB |

## Arquitectura y entrenamiento

Luna 3.1 es un transformer causal de 12 capas con estado oculto de 768 dimensiones y 12 cabezas de atencion multi-cabeza (MHA). Usa RMSNorm y RoPE, y la model card indica que respecto a la version anterior solo cambian estos dos componentes, manteniendo la arquitectura "Lightning". El vocabulario es de aproximadamente 100.000 tokens y la ventana de contexto de 8126 tokens. No se especifica si emplea decodificacion especulativa, atencion lineal u otras optimizaciones; el autor menciona el uso de FlashAttention/SDPA durante el entrenamiento.

El entrenamiento se realizo mediante SFT (supervised fine-tuning) con TRL sobre el dataset Capybara (trl-lib/Capybara), aunque la seccion de datos de entrenamiento tambien cita un subconjunto de OASST. Los hiperparametros publicados son: precision BF16, optimizador AdamW, learning rate 2e-5 y batch size 17. El entrenamiento se ejecuto en una RTX 3050 de 6 GB durante aproximadamente 0,5 horas en la infraestructura del autor (AobanLabs, region Asia). No se documentan fases de RLHF o DPO, ni el numero total de tokens de entrenamiento.

## Capacidades

- Generacion de texto conversacional en ingles, orientada a chat multi-turno y roleplay.
- Ventana de contexto de 8126 tokens, adecuada para conversaciones largas segun el autor.
- Generacion rapida: el autor declara 130 tokens por segundo en su configuracion.
- Soporte de inferencia mediante llama.cpp a traves del fork Lightning.cpp.
- Compatibilidad con el pipeline de text-generation de transformers y con text-generation-inference segun los tags del repo.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, vision, audio ni modo "thinking".
- Multilingue: solo ingles declarado.

## Casos de uso

- Prototipado de chatbots conversacionales: con 228,8 M de parametros y contexto de 8126 tokens, permite iterar rapidamente en local sobre dialogos multi-turno sin infraestructura dedicada.
- Experimentacion academica con arquitecturas no estandar: sirve para estudiar el comportamiento de la arquitectura "Lightning" y compararla con transformers convencionales del mismo tamano.
- Roleplay y generacion creativa en ingles: el ajuste sobre Capybara y la ventana de 8k permiten mantener contexto narrativo en sesiones largas.
- Pruebas de integracion con llama.cpp y Lightning.cpp: util para validar pipelines de inferencia GGUF con arquitecturas personalizadas antes de adoptar modelos mayores.
- Despliegue en hardware muy limitado: su tamano permite ejecutarlo en GPUs de gama baja o en CPU, adecuado para demos y entornos educativos.
- Generacion de texto auxiliar de bajo coste: tareas de completado o respuestas cortas donde la latencia importa mas que la precision factual.
- Base para fine-tuning: el autor recomienda ajustar el modelo sobre texto nuevo y anadir guardarrailes, por lo que puede servir como punto de partida para dominios especificos en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento es la velocidad de generacion declarada por el autor (130 tokens por segundo), sin especificar el hardware exacto de la medicion ni la cuantizacion empleada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 228,8 M de parametros, en BF16 el modelo ocupa aproximadamente 0,46 GB de pesos; en cuantizaciones GGUF de 4 bits se reduce a alrededor de 0,12-0,15 GB, aunque estos calculos son estimaciones y no datos del autor.
- GPU recomendadas: el autor entreno en una RTX 3050 de 6 GB; para inferencia basta con GPUs consumer de gama baja o incluso CPU.
- Cabe en cualquier GPU consumer con al menos 2 GB de VRAM en la practica, dado su tamano.
- Opciones de despliegue: llama.cpp mediante el fork Lightning.cpp (obligatorio, ya que llama.cpp estandar falla con "unknown model architecture: 'lightning'"), pipeline de transformers y text-generation-inference segun los tags.
- Latencia y throughput: 130 tokens por segundo declarados por el autor; no se especifica hardware ni cuantizacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Luna 3.1 230M | 228,8 M | 8126 | MIT | GGUF / safetensors | Arquitectura "Lightning" no estandar; requiere Lightning.cpp |
| SmolLM2-135M | 135 M | 8192 | Apache-2.0 | safetensors / GGUF | Compatible con llama.cpp estandar |
| Qwen2.5-0.5B | 494 M | 32768 | Apache-2.0 | safetensors / GGUF | Mayor contexto y ecosistema amplio |
| TinyLlama-1.1B | 1,1 B | 2048 | Apache-2.0 | safetensors / GGUF | Mayor tamano y contexto menor |

Los datos de los modelos comparables corresponden a sus especificaciones publicas conocidas; no se dispone de comparaciones de rendimiento con Luna 3.1 porque el autor no publica benchmarks. La principal diferencia practica es la incompatibilidad de Luna con llama.cpp estandar, que limita su adopcion frente a alternativas del mismo rango de tamano.

## Limitaciones y advertencias

- Calidad limitada: con 228,8 M de parametros y 0,5 horas de entrenamiento en una RTX 3050, es esperable un rendimiento bajo en tareas de razonamiento, matematicas y codigo.
- El propio autor advierte de que las salidas pueden ser incompletas, inexactas, repetitivas o no relacionadas con la entrada.
- Riesgo alto de alucinacion y de perdida de coherencia en conversaciones largas pese al contexto de 8126 tokens.
- Solo soporta ingles; no hay capacidades multilingues declaradas.
- No se documentan evaluaciones de sesgos; al entrenarse sobre Capybara y OASST puede heredar sesgos de esos datasets.
- La licencia MIT permite uso comercial, pero el autor recomienda fine-tuning y guardarrailes antes de cualquier uso en produccion.
- Incompatibilidad con llama.cpp estandar: requiere el fork Lightning.cpp, lo que anade dependencia de un proyecto no oficial y riesgo de mantenimiento.
- El repo registra 0 descargas y 0 likes en el momento de la consulta, sin validacion comunitaria.
- El ejemplo de codigo de la model card esta incompleto (el identificador del modelo aparece como "None"), lo que dificulta el uso directo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Aobangaming/Luna-3.1-230m-GGUF
- Modelo base: https://huggingface.co/Aobangaming/Luna-3-230m
- Repo citado en la model card: https://huggingface.co/Aobangaming/luna-2-70m
- Fork de llama.cpp para la arquitectura Lightning: https://github.com/AobanZu/lightning.cpp
- Web del autor: https://aobanweb.com
- Discord del autor: https://discord.gg/Ty775Ut26a
- Dataset Capybara (TRL): https://huggingface.co/datasets/trl-lib/Capybara
- Dataset OASST1: https://huggingface.co/datasets/OpenAssistant/oasst1
- Repositorio TRL: https://github.com/huggingface/trl

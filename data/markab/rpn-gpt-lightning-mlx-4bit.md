# markab/rpn-gpt-lightning-MLX-4bit

## Resumen

rpn-gpt-lightning-MLX-4bit es una versión cuantizada a 4 bits del modelo `markab/rpn-gpt-lightning`, publicada por el usuario markab y optimizada para ejecutarse en Apple Silicon mediante el framework MLX. El modelo base es un fine-tune de NVIDIA Nemotron 3.5 Lightning (arquitectura `nemotron_h`, 30B parámetros totales con 3B activos, presumiblemente una variante MoE) especializado en generar código Forth que opera sobre una máquina RPN (Reverse Polish Notation) exacta. El resultado es un modelo de 31.577.935.872 parámetros que no resuelve aritmética directamente, sino que emite instrucciones Forth que un cliente externo (`rpn_chat.py`) ejecuta de forma determinista.

La relevancia de este modelo reside en su enfoque híbrido: en lugar de confiar en la capacidad aritmética del propio transformer, delega el cálculo exacto en una máquina virtual Forth. Esto permite abordar problemas de aritmética de precisión arbitraria (divisiones con resto, operaciones con enteros grandes) sin los errores típicos de alucinación numérica. El repositorio ocupa 17,8 GB y la cuantización se realizó con `mlx-lm 0.32.2` usando `--q-bits 4 --q-group-size 64`, resultando en 4,503 bits por peso.

El modelo está publicado bajo licencia OpenMDW 1.1 (heredada de Nemotron), mientras que las partes propias del autor (fine-tune, tarjeta y código) son MIT. Solo soporta inglés y fue creado el 6 de noviembre de 2026. A fecha de la información disponible no registra descargas ni likes, lo que indica una adopción aún incipiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | nemotron_h (transformer, presumiblemente MoE; no se detalla en la informacion disponible) |
| Parametros totales | 31.577.935.872 (~31,6B) |
| Parametros activos | ~3B (según la model card: "30B, 3B active") |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit MLX (4,503 bits por peso, group size 64) |
| Idiomas soportados | en (inglés) |
| Licencia | openmdw-1.1 (base); MIT para fine-tune, tarjeta y código |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo se basa en NVIDIA Nemotron 3.5 Lightning, identificado con la arquitectura `nemotron_h`, con 30B parámetros totales y 3B activos, lo que sugiere una arquitectura de mezcla de expertos (MoE) con activación dispersa. Sobre esta base, el autor realizó un fine-tune orientado a un dominio muy específico: la generación de código Forth para una máquina RPN exacta. El dataset de entrenamiento es `markab/rpn-gpt-data`, referenciado en la model card, aunque no se especifican el número de tokens, la composición ni si se emplearon técnicas de RLHF o DPO.

La innovación técnica principal no está en el modelo en sí, sino en el diseño del sistema: el modelo solo escribe el programa Forth y la ejecución aritmética exacta la realiza un cliente externo (`rpn_chat.py`), un bucle de chat que interpreta y ejecuta las instrucciones. La cuantización se llevó a cabo con `mlx-lm 0.32.2` mediante `mlx_lm.convert -q --q-bits 4 --q-group-size 64`, produciendo pesos de 4,503 bits por peso y un repositorio de 17,8 GB. No se detallan otras innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Generación de código Forth para una máquina RPN exacta, incluyendo operaciones aritméticas de precisión arbitraria (división con resto, enteros grandes).
- Razonamiento aritmético delegado: el modelo no calcula, sino que emite instrucciones que un intérprete externo ejecuta de forma determinista.
- Generación de texto conversacional (pipeline `text-generation`, tag `conversational`).
- Capacidad matemática y aritmética orientada al dominio RPN/Forth (tags `math`, `arithmetic`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible explícitamente; el bucle de chat externo actúa como orquestador.
- Capacidades multilingües: solo inglés (`en`).
- Capacidades especiales: modo "thinking" o visión/audio no disponibles en la información.

## Casos de uso

- Aritmética exacta de precisión arbitraria: el modelo genera programas Forth que `rpn_chat.py` ejecuta para calcular restos, divisiones y operaciones con enteros grandes sin errores de redondeo, como el ejemplo de la model card (resto de 82225043186179281 entre 6469193).
- Asistente de cálculo determinista en entornos Apple Silicon: desplegado con `mlx_lm.server` en un M4 Max, permite consultas aritméticas verificables donde la exactitud es crítica.
- Generación de código Forth para sistemas embebidos o intérpretes RPN: el modelo puede producir programas Forth que luego se ejecutan en máquinas virtuales o hardware que use esta notación.
- Educación y demostración de RPN: útil para generar ejemplos y ejercicios de notación polaca inversa con resultados exactos.
- Investigación en neuro-simbólico: sirve como caso de estudio de modelos que delegan el razonamiento simbólico (aritmética) en un intérprete externo, separando generación de ejecución.
- Prototipado de pipelines de cálculo verificable: integrable en flujos donde se requiere trazabilidad de la operación aritmética (el programa Forth es auditable).
- Experimentación con cuantización MLX en Apple Silicon: referencia para evaluar el rendimiento de un modelo de ~31,6B (3B activos) cuantizado a 4 bits en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card reporta únicamente una prueba cualitativa: 3 de 3 problemas difíciles de demostración (números 6, 3 y 9 de `demo10`) resueltos correctamente a través de `rpn_chat.py --server mlx`, con un tiempo total de 240 s y aproximadamente 62 tokens/s en un M4 Max (128 GB). La precisión no fue medida de forma sistemática.

## Requisitos de hardware

- VRAM/unified memory estimada: ~17,8 GB para los pesos cuantizados a 4 bits (4,503 bits por peso), más overhead de contexto y del servidor MLX.
- GPU recomendadas: Apple Silicon con memoria unificada suficiente; probado en M4 Max (128 GB). No se reportan pruebas en A100, H100 ni RTX 4090 (MLX está orientado a Apple Silicon).
- Cabe en GPU de consumo: sí, en Apple Silicon con al menos ~24-32 GB de memoria unificada (estimación basada en el tamaño de pesos; no confirmado por el autor).
- Opciones de despliegue: `mlx_lm.server` (versión 0.32.2) y `rpn_chat.py` como cliente; requiere `pip install mlx-lm==0.32.2`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ~62 tokens/s en M4 Max (128 GB) según la model card; 240 s para 3 problemas de demostración. No hay más datos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| markab/rpn-gpt-lightning-MLX-4bit | ~31,6B (3B activos) | no disponible | openmdw-1.1 / MIT | safetensors MLX 4-bit | Fine-tune de Nemotron 3.5 Lightning para Forth/RPN |
| markab/rpn-gpt-lightning (base) | ~31,6B (3B activos) | no disponible | openmdw-1.1 / MIT | safetensors | Modelo sin cuantizar del que deriva |
| NexaAI/gpt-oss-20b-MLX-4bit | 20B | no disponible | no disponible | MLX 4-bit | Cuantización MLX de gpt-oss-20b para Apple Silicon |

No se dispone de datos de rendimiento comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo escribe Forth; sin el cliente `rpn_chat.py` no resuelve aritmética por sí mismo.
- Solo soporta inglés (`en`); no hay capacidades multilingües.
- La precisión no ha sido medida de forma sistemática; solo se reportan 3 de 3 problemas de demostración.
- `mlx_lm.server 0.32.2` puede detener la generación en un acierto exacto de caché de prompt en sesiones largas; se requiere un parche incluido en `training/mlx_local.sh`.
- Licencia OpenMDW 1.1 para el modelo base (con texto completo y aviso de NVIDIA en LICENSE); las partes propias son MIT, pero se pide atribución con enlace a github.com/markab21/rpn-gpt.
- Riesgo de alucinación en la generación de código Forth: si el programa emitido es incorrecto, la ejecución será incorrecta; el intérprete no valida la semántica del programa.
- Sin datos publicados sobre sesgos, longitud de contexto o rendimiento en producción.
- Adopción nula en el momento de la información (0 descargas, 0 likes), lo que implica ausencia de validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/markab/rpn-gpt-lightning-MLX-4bit
- Modelo base: https://huggingface.co/markab/rpn-gpt-lightning
- Repositorio de código: https://github.com/markab21/rpn-gpt
- Dataset: https://huggingface.co/datasets/markab/rpn-gpt-data
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Referencia de cuantización MLX (gpt-oss-20b): https://huggingface.co/NexaAI/gpt-oss-20b-MLX-4bit/blob/main/README.md

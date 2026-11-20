# glyd/gemma-4-12B-wren

## Resumen

Gemma 4 12B Wren es una distribución del checkpoint QAT (quantization-aware training) de Gemma 4 12B de Google DeepMind, empaquetada por el usuario glyd en un formato propietario para su propio motor de inferencia. El modelo base es `google/gemma-4-12B-it-qat-q4_0-unquantized`, un modelo denso de la familia Gemma 4 entrenado con cuantización consciente para operar en 4 bits. Wren no reentrena ni modifica los pesos: almacena exactamente los códigos de 4 bits y las escalas de 16 bits por cada 32 pesos del checkpoint QAT original, lo que resulta en 4,5 bits por peso y una decodificación idéntica al valor bf16 del checkpoint QAT de Google.

La relevancia de esta ficha es doble. Por un lado, documenta una de las primeras distribuciones de la familia Gemma 4 en el ecosistema, con un enfoque explícito en consumo de memoria reducido (6,3 GiB de pesos, 7,9 GiB de VRAM a contexto de 4K incluyendo el modelo draft). Por otro, ilustra una tendencia creciente: motores de inferencia propietarios que empaquetan checkpoints oficiales con formatos propios y decodificación especulativa integrada, en este caso con un modelo asistente de Google que acelera la generación entre 1,7x y 3,7x según el tipo de texto.

El modelo está pensado para ejecución en GPU de consumo (RTX 30 series o superior) bajo Linux con NVIDIA, con licencia Apache 2.0 heredada del modelo base. No obstante, el formato de pesos es incompatible con Transformers, vLLM o llama.cpp, lo que limita su adopción a usuarios del motor Glyd 0.33.0 o superior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Gemma 4), checkpoint QAT de 4 bits |
| Parametros totales | 6.709.849.073 (~6,7 mil millones, dato real de safetensors) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Gemma 4 12B se evalua con prompts de ~30K tokens; el limite exacto no se especifica) |
| Tipos de cuantizacion | QAT 4 bits con escala de 16 bits por cada 32 pesos (4,5 bits por peso); decodifica a bf16 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Formato propietario Glyd (no safetensors estandar, no GGUF); repo de 7,7 GB con modelo draft incluido en `draft/` |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer denso de la familia Gemma 4 de Google DeepMind, entrenado con quantization-aware training para que los pesos puedan almacenarse en 4 bits sin pérdida significativa de calidad respecto al modelo bf16 original. El checkpoint QAT original ya contiene códigos de 4 bits y una escala de 16 bits por cada 32 pesos; Wren preserva esa representación bit a bit, de modo que cada peso decodifica al mismo valor bf16 que el checkpoint QAT de Google. La pérdida respecto al Gemma 4 12B bf16 original es la inherente al propio QAT de Google, no añadida por el empaquetado.

La innovación técnica principal de esta distribución no está en el entrenamiento (no hay reentrenamiento ni fine-tuning) sino en el empaquetado y el motor: incluye el modelo draft `gemma-4-12B-it-qat-q4_0-unquantized-assistant` de Google para decodificación especulativa, con 8 tokens candidatos por ronda, lo que produce entre 1,7x y 3,7x de aceleración según el texto sin alterar la salida en modo greedy. El autor proporciona un comando de verificación (`glyd verify`) que decodifica cada tensor y compara su SHA-256 con el registrado al empaquetar desde los ficheros de Google, lo que permite auditar la integridad del checkpoint.

## Capacidades

- Generación de texto conversacional y de formato largo (pipeline `text-generation`, tag `conversational`).
- Razonamiento y matemáticas: el autor reporta 72/75 en GSM8K y 66/75 en MMLU-Pro sobre las primeras 75 preguntas en modo greedy.
- Modo thinking desactivable: las mediciones del autor se realizan con "thinking off", lo que implica que el modelo base soporta un modo de razonamiento explícito.
- Decodificación especulativa integrada mediante modelo draft de Google (8 candidatos por ronda).
- Generación determinista en modo greedy, idéntica con y sin modelo draft.
- Sin soporte de tool calling ni function calling documentado en la información disponible.
- Sin soporte de agentes multi-paso documentado.
- Sin capacidades multimodales: el autor indica explícitamente "text only, no image or audio input yet".
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistente conversacional local en estación de trabajo: con 7,9 GiB de VRAM a contexto de 4K (draft incluido), el modelo cabe en una RTX 4080 SUPER de 16 GB y permite conversaciones multi-turno con lectura de prompt a 1.257 tok/s en prompts cortos y 108,7 tok/s de escritura, adecuado para uso individual sin depender de la nube.
- Servicio de chat con API compatible OpenAI: el motor `glyd serve` expone una API OpenAI, lo que permite integrar el modelo en aplicaciones existentes sin reescribir clientes; el throughput de 96-108 tok/s con draft lo hace viable para prototipos y equipos pequeños.
- Procesamiento de documentos largos: con prompts de ~30K tokens el modelo lee a 2.199 tok/s y escribe a 77 tok/s con draft, suficiente para resumir o extraer información de contratos, informes o transcripciones de forma local.
- Evaluación de razonamiento matemático en pipelines de investigación: los resultados GSM8K (72/75) y MMLU-Pro (66/75) permiten usar el modelo como baseline reproducible en experimentos de evaluación, con la ventaja de que la verificación SHA-256 garantiza que los pesos son exactamente los de Google.
- Generación de texto en entornos con restricciones de memoria: 6,3 GiB de pesos y 11 s de carga desde disco lo hacen apto para máquinas con 16 GB de VRAM compartida con otras cargas, como estaciones de desarrollo con GPU única.
- Despliegue en laboratorios con GPU de consumo: al requerir solo Linux + NVIDIA RTX 30 series o superior, permite montar inferencia local en Workstations con RTX 3090, 4070 Ti o 4080 sin presupuesto de datacenter.
- Comparación de motores de inferencia: al ser una distribución con formato propietario y verificación criptográfica, sirve como caso de estudio para medir el impacto de la decodificación especulativa frente a motores estándar sobre el mismo checkpoint QAT.

## Benchmarks y rendimiento

Datos reportados por el autor en RTX 4080 SUPER 16 GB, Ryzen 9 7950X3D, Ubuntu, greedy, thinking off:

| Benchmark / metrica | Resultado | Condiciones |
|---|---|---|
| GSM8K | 72 / 75 | Primeras 75 preguntas, greedy |
| MMLU-Pro | 66 / 75 | Primeras 75 preguntas, greedy; 1 respuesta alcanzo el limite de 3.072 tokens |
| Escritura sin draft | 82,5 tok/s | 5 prompts, 256 tokens |
| Escritura con draft | 232 tok/s | 5 prompts, 256 tokens, 3,7 tokens por ronda |
| Primer token (chat corto) | 0,03 s | Prompt de 34 tokens, lectura a 1.257 tok/s |
| Primer token (~4K) | 1,11 s | Prompt de 3.839 tokens, lectura a 3.463 tok/s |
| Primer token (~30K) | 12,9 s | Prompt de 28.374 tokens, lectura a 2.199 tok/s |
| Escritura servida (chat corto) | 108,7 tok/s | Con draft, via `glyd serve` |
| Escritura servida (~4K) | 96,1 tok/s | Con draft |
| Escritura servida (~30K) | 77,0 tok/s | Con draft |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 7,9 GiB a contexto de 4K, incluyendo el modelo draft. Los pesos ocupan 6,3 GiB (frente a 23,8 GB en bf16).
- Espacio en disco: 6,8 GB para el modelo más 0,85 GB para el modelo draft en `draft/`; repo total de 7,7 GB.
- GPU recomendadas: RTX 30 series o superior según el autor. Verificado en RTX 4080 SUPER 16 GB. Cabe en GPUs de consumo con 8 GB o más de VRAM a contexto moderado, aunque no se especifica el comportamiento a contextos largos en 8 GB.
- Sistemas operativos: solo Linux. Sin soporte para Windows, Mac ni AMD.
- Motor de despliegue: exclusivamente Glyd 0.33.0 o superior (`glyd run glyd/gemma-4-12B-wren`). No compatible con vLLM, llama.cpp, Ollama, TGI ni Transformers; para esos motores debe usarse el checkpoint de Google.
- Carga: 11 s desde disco.
- Latencia y throughput: primer token entre 0,03 s (prompt corto) y 12,9 s (prompt de ~30K); escritura entre 77 y 232 tok/s según contexto y modo (servido o test de motor).
- Concurrencia: una petición a la vez; las demás esperan en cola.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Motor / formato |
|---|---|---|---|---|---|
| glyd/gemma-4-12B-wren | ~6,7 mil millones | No disponible | QAT 4 bits (4,5 bits/peso) | Apache 2.0 | Glyd propietario |
| google/gemma-4-12B-it-qat-q4_0-unquantized | No disponible | No disponible | QAT 4 bits | Apache 2.0 | Transformers, vLLM, llama.cpp |
| google/gemma-4-12B-it-qat-q4_0-unquantized-assistant | No disponible (modelo draft) | No disponible | QAT 4 bits | Apache 2.0 | Uso como draft en decodificacion especulativa |

La comparación directa con alternativas de otros fabricantes (Llama, Qwen, Mistral) no está disponible en la información proporcionada. El competidor natural es el checkpoint de Google sin empaquetar, que ofrece los mismos pesos con compatibilidad de motores estándar pero sin la decodificación especulativa integrada ni el formato compacto de Wren.

## Limitaciones y advertencias

- Formato propietario: los pesos solo funcionan con el motor Glyd 0.33.0 o superior. No se pueden cargar en Transformers, vLLM, llama.cpp, Ollama ni TGI.
- Plataforma restringida: solo Linux con NVIDIA RTX 30 series o superior. Sin soporte para Windows, macOS ni GPUs AMD.
- Sin multimodalidad: el autor confirma que es solo texto, sin entrada de imagen ni audio.
- Concurrencia limitada: una petición a la vez; el resto espera. No apto para servir a múltiples usuarios concurrentes sin despliegue adicional.
- Reproducibilidad en sampling: con el modelo draft activado, una misma semilla produce texto distinto (igualmente probable) que sin draft. Solo la salida greedy es idéntica.
- Pérdida relativa al bf16 original: la fidelidad es respecto al checkpoint QAT de Google, no al Gemma 4 12B bf16 original, que ya difiere del QAT por el propio proceso de cuantización consciente.
- Contexto máximo no documentado: aunque se han medido prompts de ~30K tokens, no se especifica la longitud máxima de contexto soportada.
- Idiomas soportados no documentados: no se puede confirmar cobertura multilingüe más allá de lo que herede del modelo base.
- Riesgo de alucinación: no documentado por el autor; aplicable el riesgo genérico de los modelos de lenguaje de esta escala, especialmente en MMLU-Pro donde una respuesta agotó el límite de 3.072 tokens.
- Madurez del ecosistema: 26 descargas y 1 like en Hugging Face en el momento de la consulta; proyecto de autor único con soporte limitado.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar los términos del modelo base de Google y del motor Glyd, que es software separado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/glyd/gemma-4-12B-wren
- Modelo base (Google): https://huggingface.co/google/gemma-4-12B-it-qat-q4_0-unquantized
- Modelo draft (Google): https://huggingface.co/google/gemma-4-12B-it-qat-q4_0-unquantized-assistant
- Comando de ejecución: `glyd run glyd/gemma-4-12B-wren` (Glyd 0.33.0 o superior, Linux + NVIDIA)
- Comando de verificación: `glyd verify glyd/gemma-4-12B-wren`
- Script de benchmark mencionado por el autor: `bench/compare.py` (incluido en el repositorio del motor Glyd; URL no disponible en la información proporcionada)

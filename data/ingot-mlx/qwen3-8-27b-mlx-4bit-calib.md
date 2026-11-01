# ingot-mlx/Qwen3.8-27B-MLX-4bit-calib

## Resumen

Qwen3.8-27B-MLX-4bit-calib es una conversión cuantizada a 4 bits del modelo denso Qwen/Qwen3.8-27B, publicada por el usuario ingot-mlx en HuggingFace. El modelo base es un transformer denso de 27.320.697.856 parámetros (27,3B) desarrollado por el equipo Qwen, y esta versión lo adapta al formato MLX para su ejecución eficiente en hardware Apple Silicon. La innovación principal frente a otras cuantizaciones MLX del mismo modelo es el uso de GPTQ con un conjunto de calibración en lugar del redondeo simple (round-to-nearest), lo que reduce aproximadamente a la mitad la divergencia KL respecto al modelo en bf16 manteniendo el mismo tamaño de archivo (15,13 GB).

La relevancia de esta ficha radica en que demuestra que la elección del método de cuantización, a igual número de bits, tiene un impacto medible y sustancial en la calidad de la salida. El autor reporta una divergencia KL media de 0,064 frente a 0,126 de la conversión estándar, y una concordancia top-1 del 93,4 % frente al 90,0 %, sobre 36.569 tokens de evaluación nunca usados en calibración. Estos datos son especialmente relevantes para desarrolladores que despliegan modelos de 27B en Macs con memoria unificada limitada.

El modelo conserva la licencia Apache 2.0 del original y se distribuye únicamente en formato de pesos safetensors para la librería MLX. No incluye la torre de visión del modelo base, por lo que no acepta entrada de imágenes, y el autor advierte que no se han medido benchmarks downstream ni la calidad en contextos largos más allá de las secuencias de evaluación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5, según tag `qwen3_5`) |
| Parámetros totales | 27.320.697.856 (27,3B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el autor menciona configuraciones de 8K, 16K y 64K en sus estimaciones de memoria, pero no especifica el máximo oficial) |
| Tipos de cuantización | 4-bit afín, group size 64, escalas y sesgos en bf16, embeddings también a 4 bits; GPTQ calibrado; 4,50 bits promedio |
| Idiomas soportados | No disponible (el conjunto de calibración incluye inglés, español, francés, alemán, chino y catalán, pero no se declara una lista oficial de idiomas soportados) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX); incluye `model-mtp.safetensors` con la capa MTP |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 27,3B parámetros perteneciente a la familia Qwen3.5. Esta conversión no reentrena el modelo: aplica cuantización GPTQ sobre los pesos originales en bf16, con un conjunto de calibración de aproximadamente 260.000 tokens. La composición de ese conjunto es aproximadamente 41 % texto genérico público (el set `calibration_datav3` de bartowski y extractos de libros de Project Gutenberg en inglés, español, francés, alemán y chino) y aproximadamente 31 % conversaciones generadas a partir de prompts de oasst1 en varios idiomas y tareas de código, con y sin razonamiento, producidas por un modelo de la misma familia y tokenizador (Qwen3). El resto de la mezcla no se detalla en la información disponible.

La innovación técnica destacable es el propio método de cuantización: frente al redondeo al vecino más cercano que usan las conversiones estándar de `mlx_lm.convert`, aquí se emplea GPTQ con calibración, lo que produce una selección de los valores de 4 bits guiada por datos. El autor reporta una reducción del 48-49 % en la divergencia KL media respecto al modelo bf16 en comparación con las conversiones estándar, con el mismo tamaño de archivo. El repositorio incluye además una capa de multi-token prediction (MTP) de 29 tensores, copiada sin recalibrar de la conversión de ddalcu, destinada a decodificación especulativa en servidores que la soporten; mlx-lm carga el modelo sin utilizarla.

## Capacidades

- Generación de texto y conversación multi-turno, heredadas del modelo base Qwen3.8-27B.
- Razonamiento y tareas de código, incluyendo sesiones de agente con tool calling, según la evaluación del autor sobre transcripciones largas de llamadas a herramientas.
- Soporte de tool calling y function calling: el autor evalúa específicamente un "agent split" con transcripciones largas de llamadas a herramientas, lo que indica que el modelo base está entrenado para este uso.
- Capacidades multilingües: el conjunto de calibración incluye inglés, español, francés, alemán, chino y catalán, aunque no se declara una lista oficial de idiomas.
- Capacidad de razonamiento explícito ("con y sin reasoning" en los datos de calibración), lo que sugiere soporte de modos de pensamiento del modelo base.
- Sin visión: la torre de visión del modelo original no está incluida y la entrada de imágenes no funciona.
- Sin audio: no se menciona soporte de audio en la información disponible.

## Casos de uso

- Asistente de código en local sobre Mac: el modelo puede integrarse en editores o terminales mediante MLX y aprovechar sus 27,3B parámetros para generación y revisión de código sin enviar datos a la nube; la calibración incluye tareas de código y sesiones de agente, lo que reduce la degradación en este dominio respecto a cuantizaciones estándar.
- Agentes con tool calling en producción: el autor mide específicamente el "agent split" (transcripciones largas de llamadas a herramientas), donde esta conversión obtiene una KL de 0,335 frente a 0,618 de la estándar; esto la hace adecuada para pipelines de agentes que encadenan múltiples llamadas a funciones y requieren fidelidad en la selección de herramientas.
- Atención al cliente automatizada multi-turno: con 15,13 GB de pesos y un mínimo de 24 GB de memoria unificada para 16K de contexto, se puede desplegar en un Mac de gama alta para gestionar conversaciones con historial largo, siempre que se valide la calidad en el dominio concreto.
- Procesamiento de documentación técnica multilingüe: el conjunto de calibración incluye texto técnico en español e inglés y texto genérico en francés, alemán y chino, lo que sugiere un comportamiento razonable en resumen y extracción de documentación en esos idiomas.
- Servidor de inferencia con decodificación especulativa: la capa MTP incluida (aunque no calibrada por el autor) permite a servidores compatibles usar decodificación especulativa para aumentar el throughput, a costa de unos 0,32 GB adicionales.
- Evaluación comparativa de métodos de cuantización: el repositorio documenta con detalle la metodología de medición de KL y las comparaciones con otras conversiones MLX, lo que lo convierte en un caso de referencia para investigadores que estudian el impacto de GPTQ frente a round-to-nearest en modelos de 27B.
- Desarrollo y pruebas en entornos con memoria limitada: al ocupar 15,13 GB, cabe en Macs de 24 GB con contexto de 16K, lo que permite a desarrolladores individuales probar un modelo de 27B sin infraestructura de GPU dedicada.

## Benchmarks y rendimiento

El autor no publica benchmarks downstream (MMLU, HumanEval, GSM8K, etc.); indica explícitamente que no se midieron. Los datos disponibles son métricas de divergencia KL frente al modelo bf16 sobre 36.569 tokens de retención, nunca usados en calibración:

| Variante | Pesos texto | KL media | KL p99 | Top-1 | KL genérico | KL privado | KL agente |
|---|---|---|---|---|---|---|---|
| 4-bit estándar (`mlx_lm.convert`, round-to-nearest) | 15,13 GB | 0,126 | 1,85 | 90,0 % | 0,055 | 0,181 | 0,618 |
| ddalcu/Qwen3.8-27B-MLX-Serve-4bit (4-bit, embedding bf16) | 16,96 GB | 0,123 | 1,81 | 90,0 % | 0,054 | 0,177 | 0,603 |
| **Este modelo (GPTQ calibrado)** | **15,13 GB** | **0,064** | **0,94** | **93,4 %** | **0,027** | **0,094** | **0,335** |

Comparación con otras cuantizaciones MLX publicadas del mismo modelo base, con el mismo método y los mismos 36.569 tokens:

| Repo | Tamaño | Bits promedio | KL media | KL genérico | Top-1 |
|---|---|---|---|---|---|
| **Este modelo** | **15,13 GB** | **4,50** | **0,064** | **0,027** | **93,4 %** |
| WaveCut/Qwen3.8-27B-MLX-4bit-DWQ | 15,13 GB | 4,50 | 0,123 | 0,089 | 89,4 % |
| AtomicChat/Qwen3.8-27B-MLX-AD-4.50bpw-DWQ-16.0GB | 15,13 GB | 4,50 | 0,116 | 0,052 | 90,3 % |
| Jundot/Qwen3.8-27B-oQ4e-mtp | 16,27 GB (+7,5 %) | 4,84 | 0,063 | 0,022 | 93,9 % |
| AtomicChat/Qwen3.8-27B-MLX-AD-3.80bpw-DWQ-13.7GB | 12,77 GB (−15,6 %) | 3,80 | 0,257 | 0,223 | 82,6 % |

El autor señala que la conversión de Jundot, un 7,5 % más grande, es mejor en texto genérico (0,022 frente a 0,027, con IC del 95 % de la diferencia entre −0,007 y −0,002) y empata en la media global (0,063 frente a 0,064, IC −0,009 a +0,008), atribuyéndolo a un mayor número de bits en algunos módulos (5, 6 y 8 bits) y no a un mejor método a igual tamaño. No se midieron OptiQ (19,4 GB) ni la conversión UD3. Tampoco se midieron benchmarks downstream, calidad en contexto largo más allá de las secuencias de evaluación, la capa MTP ni la torre de visión.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 15,13 GB de pesos en texto; ~15,45 GB con la capa MTP (+0,32 GB); más caché KV y sobrecarga del runtime.
- Mínimo en Mac: 24 GB de memoria unificada para 16K de contexto sin drafter; 32 GB para 64K con drafter, según el plan de memoria del autor.
- Estimación para mlx-lm: 24 GB (pesos + caché KV de 8K ≈ 15,7 GB, estimado, no medido).
- GPU dedicadas: no se proporcionan datos de compatibilidad con A100, H100 o RTX 4090 en la información disponible; el formato MLX está orientado a Apple Silicon.
- Cabe en GPU de consumo: no hay datos para GPUs NVIDIA; en el ecosistema Apple, cabe en Macs de 24 GB o más.
- Opciones de despliegue: librería MLX (`mlx-lm`), con el mismo formato de archivo que `mlx_lm.convert -q`; servidores que usen MTP para decodificación especulativa pueden cargar `model-mtp.safetensors`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el autor solo indica que "runs at the same speed" que una conversión MLX 4-bit estándar.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Calidad (KL media vs bf16) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **Este modelo (ingot-mlx, GPTQ calibrado)** | 27,3B | No disponible | 0,064 | Apache 2.0 | HuggingFace, formato MLX |
| ddalcu/Qwen3.8-27B-MLX-Serve-4bit | 27,3B | No disponible | 0,123 | Apache 2.0 (heredada) | HuggingFace, formato MLX |
| Jundot/Qwen3.8-27B-oQ4e-mtp | 27,3B | No disponible | 0,063 | Apache 2.0 (heredada) | HuggingFace, formato MLX, 16,27 GB |
| AtomicChat/Qwen3.8-27B-MLX-AD-3.80bpw-DWQ-13.7GB | 27,3B | No disponible | 0,257 | Apache 2.0 (heredada) | HuggingFace, formato MLX, 12,77 GB |

La comparación se limita a otras cuantizaciones del mismo modelo base, ya que la información proporcionada no incluye datos de modelos de otros desarrolladores. A igual tamaño (15,13 GB, 4,50 bits), esta conversión supera claramente a las DWQ de WaveCut y AtomicChat en KL media, KL genérico y concordancia top-1. Frente a la conversión de Jundot, de mayor tamaño, empata en la media global pero pierde ligeramente en texto genérico.

## Limitaciones y advertencias

- Sin visión: la torre de visión del modelo original no está incluida; la entrada de imágenes no funciona.
- Sin benchmarks downstream: no se han medido MMLU, HumanEval, GSM8K ni similares, por lo que la calidad en tareas concretas debe validarse por el usuario.
- Calidad en contexto largo no medida más allá de las secuencias de evaluación.
- La capa MTP no está calibrada por el autor (copiada de la conversión de ddalcu) y mlx-lm no la utiliza.
- El "private split" de la evaluación no es reproducible (texto técnico y sesiones de agente propios del autor), por lo que esas cifras deben tratarse como indicativas.
- Riesgo de alucinación: inherente al modelo base; no se documentan medidas específicas de mitigación en esta conversión.
- Sesgos: no se documentan sesgos conocidos en la información disponible; se heredan los del modelo base Qwen3.8-27B.
- Idiomas: no se declara una lista oficial de idiomas soportados; la cobertura multilingüe se infiere del conjunto de calibración, no de una evaluación sistemática.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar la licencia del modelo base enlazada por el autor para confirmar condiciones adicionales.
- El modelo tiene solo 24 descargas y 0 likes en el momento de la consulta, lo que indica una validación comunitaria muy limitada.
- Orientado al ecosistema MLX (Apple Silicon); no hay evidencia de compatibilidad con GPUs NVIDIA ni con otros runtimes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ingot-mlx/Qwen3.8-27B-MLX-4bit-calib
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-27B/blob/main/LICENSE
- Conversión de referencia ddalcu: https://huggingface.co/ddalcu/Qwen3.8-27B-MLX-Serve-4bit
- Conversión lmstudio-community: https://huggingface.co/lmstudio-community/Qwen3.8-27B-MLX-4bit
- Conversión mlx-community: https://huggingface.co/mlx-community/Qwen3.8-27B-4bit
- Conversión WaveCut DWQ: https://huggingface.co/WaveCut/Qwen3.8-27B-MLX-4bit-DWQ
- Conversión AtomicChat 4.50bpw: https://huggingface.co/AtomicChat/Qwen3.8-27B-MLX-AD-4.50bpw-DWQ-16.0GB
- Conversión AtomicChat 3.80bpw: https://huggingface.co/AtomicChat/Qwen3.8-27B-MLX-AD-3.80bpw-DWQ-13.7GB
- Conversión Jundot oQ4e: https://huggingface.co/Jundot/Qwen3.8-27B-oQ4e-mtp

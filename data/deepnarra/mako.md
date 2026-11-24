# DeepNarra/Mako

## Resumen

DeepNarra Mako 1.0 es un modelo de lenguaje de tipo decoder-only de 28,5 millones de parámetros desarrollado por la organización DeepNarra, orientado explícitamente a la decodificación especulativa y al despliegue en el extremo (edge). Su rasgo distintivo no es la escala, sino la arquitectura de aceleración integrada: cabezas de predicción multi-token (MTP) con `k=4`, decodificación por búsqueda de n-gramas en el prompt (PLD) con `k=50` y un mecanismo de verificación de árboles especulativos mediante una máscara de atención causal en forma de DAG con coste `O(1)`. El modelo se presenta como un "motor de salto especulativo" (*Speculative Leap Engine*) más que como un modelo de propósito general de alta calidad.

Con 28,5 millones de parámetros totales y aproximadamente 6,2 millones activos por token, Mako emplea una variante de mezcla de expertos que el autor denomina "H-MoE": 23 macro-motores con enrutamiento top-2 sobre micro-expertos, más un experto fundacional compartido. El repositorio incluye pesos en `safetensors` (108,94 MB, 1.330 tensores) y una versión GGUF ternaria nativa de 5,85 MB en formato BitNet b1.58 (`TQ1_0`, 1,58 bits por peso), lo que lo hace viable en hardware muy limitado.

El modelo es relevante ahora como banco de pruebas reproducible de técnicas de decodificación especulativa y de cuantización ternaria extrema, no como alternativa a modelos de chat de escala media. Su licencia Apache-2.0 y su reducido tamaño facilitan la experimentación, aunque su calidad lingüística y de razonamiento no está respaldada por benchmarks públicos en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `DeepNarraMakoForCausalLM` (decoder-only, H-MoE con enrutamiento top-2, MTP `k=4`, PLD `k=50`, máscara DAG causal) |
| Parámetros totales | 28.519.602 (28,5 M) |
| Parámetros activos | ~6,2 M por token |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BitNet b1.58 ternario `TQ1_0` (1,58 bpw); pesos `safetensors` en el repositorio; no se detallan otras variantes |
| Idiomas soportados | `en` y `multilingual` (sin listado concreto de idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | `safetensors` (108,94 MB, 1.330 tensores) y GGUF `model-TQ1_0.gguf` (5,85 MB) |

## Arquitectura y entrenamiento

Mako es un transformer causal con una capa de mezcla de expertos propietaria ("H-MoE"): 23 macro-motores, cada uno con micro-expertos seleccionados mediante top-2, más un experto compartido que actúa como base. Esto explica la diferencia entre los 28,5 M de parámetros totales y los ~6,2 M activos por token. Sobre el backbone se añaden cabezas de predicción multi-token desacopladas (`k=4`) entrenadas junto a la cabeza causal principal, que proponen los tokens `t+1` a `t+4` en un solo paso hacia delante. La decodificación por búsqueda en el prompt (PLD, `k=50`) escanea el contexto en busca de n-gramas coincidentes y propone hasta 50 tokens contiguos sin coste de cómputo en GPU. La verificación de los candidatos se realiza empaquetando las ramas especulativas en una única máscara de atención DAG causal, de modo que todos los tokens propuestos se validan en una sola pasada paralela; el autor afirma un 0,00 % de deriva de distribución respecto a la decodificación greedy o por muestreo.

Los datos de entrenamiento citados en la model card son HuggingFaceFW/fineweb-edu (ODC-By-1.0), CohereForAI/aya_collection (Apache-2.0), m-a-p/CodeFeedback-Filtered-Instruction (Apache-2.0) y HuggingFaceH4/no_robots (CC-BY-NC-4.0, atribuido para evaluación de instrucciones), además de un flujo sintético de razonamiento procedural generado y verificado formalmente con SymPy (BSD-3-Clause). No se especifica el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo RLHF, DPO o ajuste por preferencias. Tampoco se detalla la longitud de contexto nativa ni la configuración de atención (RoPE, ventana deslizante, etc.).

## Capacidades

- Generación de texto causal en inglés y, según la etiqueta del autor, multilingüe (sin lista de idiomas verificada).
- Decodificación especulativa integrada: MTP con `k=4` cabezas de borrador y PLD con `k=50` para spans repetitivos o estructurados.
- Verificación de árboles de candidatos en una sola pasada mediante máscara de atención DAG causal.
- Razonamiento procedural aritmético y simbólico derivado del flujo sintético verificado con SymPy (alcance limitado por el tamaño del modelo).
- Generación y continuación de código, apoyada en el corpus CodeFeedback-Filtered-Instruction y en la propensión del PLD a acelerar estructuras como JSON o bloques de código.
- Despliegue en formato ternario BitNet b1.58 (`TQ1_0`) para inferencia en CPU y dispositivos de borde.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de pensamiento explícito.

## Casos de uso

- Investigación en decodificación especulativa: Mako sirve como banco de pruebas controlado para medir la ganancia real de MTP `k=4` y PLD `k=50` frente a decodificación autoregresiva estándar, con la ventaja de que el modelo completo cabe en memoria de una sola GPU.
- Despliegue en dispositivos de borde: el GGUF ternario de 5,85 MB permite ejecutar generación de texto en microcontroladores, Raspberry Pi o entornos con menos de 16 MB de almacenamiento, útil para prototipos de asistentes locales sin conectividad.
- Aceleración de pipelines de código estructurado: gracias al PLD sobre n-gramas, tareas de autocompletado de JSON, YAML o plantillas repetitivas pueden beneficiarse de borradores de hasta 50 tokens sin coste de cómputo adicional.
- Evaluación de cuantización ternaria: comparar la calidad de salida del checkpoint `safetensors` frente al GGUF `TQ1_0` a 1,58 bpw para estudiar la degradación introducida por BitNet b1.58 en modelos pequeños.
- Docencia y demostraciones de arquitecturas MoE: el enrutamiento top-2 sobre 23 macro-motores con experto compartido es un caso didáctico manejable para explicar mezcla de expertos y parámetros activos frente a totales.
- Pruebas de verificación DAG en motores de inferencia: validar implementaciones de máscaras de atención arbóreas en vLLM, llama.cpp u otros runtimes comparando la salida con la del modo greedy del propio modelo.
- Experimentos de razonamiento simbólico acotado: el flujo SymPy permite probar si un modelo de 28 M puede resolver pasos aritméticos verificables dentro de un dominio restringido.

## Benchmarks y rendimiento

El autor declara una velocidad base medida de 287,6 tokens/s con 55,63 ms de latencia en una Tesla T4, correspondiente a un solo paso antes de la multiplicación especulativa, y afirma que el diseño apunta a 1.000–3.000+ tokens/s con saltos de árbol especulativos. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible.

| Métrica | Valor declarado | Condiciones |
|---|---|---|
| Throughput base | 287,6 tok/s | Tesla T4, paso único sin especulación |
| Latencia base | 55,63 ms | Tesla T4, paso único sin especulación |
| Throughput especulativo objetivo | 1.000–3.000+ tok/s | Declarado por el autor, sin medición publicada |
| Deriva de distribución vs. greedy/muestreo | 0,00 % | Afirmación del autor, sin verificación independiente |

## Requisitos de hardware

- VRAM para inferencia en `safetensors`: aproximadamente 110 MB para los pesos en FP32/BF16 más overhead de activaciones y caché KV; cabe holgadamente en cualquier GPU consumer.
- VRAM para el GGUF ternario: unos 6 MB de pesos; ejecutable en CPU, Raspberry Pi y microcontroladores compatibles con llama.cpp.
- GPU recomendadas: Tesla T4 (única con medición publicada), RTX 4090, A100 o H100 para experimentos de throughput especulativo a gran escala; cualquier GPU con más de 1 GB de VRAM es suficiente para el modelo en `safetensors`.
- Cabe en GPU consumer: sí, en todas las tarjetas modernas, incluidas GTX 1050 Ti o superiores.
- Opciones de despliegue: Ollama (con `Modelfile` incluido), llama.cpp para el GGUF `TQ1_0`, y carga directa con `safetensors` y `transformers`; no se documenta soporte de vLLM ni TGI.
- Latencia y throughput: 55,63 ms y 287,6 tok/s en T4 para paso base; el rendimiento especulativo real no está medido de forma independiente.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepNarra Mako 1.0 | 28,5 M totales / ~6,2 M activos | no disponible | Decodificación especulativa MTP+PLD, GGUF ternario | Apache-2.0 | Hugging Face, GGUF, Ollama |
| Modelos tipo SmolLM-135M | ~135 M | 2.048 tokens (referencia) | LM denso pequeño para edge | Apache-2.0 | Hugging Face, GGUF |
| Modelos tipo Qwen2.5-0.5B | ~494 M | 32.768 tokens (referencia) | LM denso multilingüe | Apache-2.0 | Hugging Face, GGUF, vLLM |

No se dispone de datos de benchmarks que permitan una comparación de calidad objetiva con estas alternativas; la comparación se limita a escala, licencia y disponibilidad. Los datos de contexto de los modelos de referencia son orientativos y no proceden de la información proporcionada sobre Mako.

## Limitaciones y advertencias

- Con 28,5 M de parámetros totales y ~6,2 M activos, la capacidad de razonamiento, conocimiento factual y coherencia multi-turno es muy limitada; no es adecuado como asistente general.
- No hay benchmarks de calidad publicados; las afirmaciones de velocidad y de "0,00 % de deriva" provienen del autor y no han sido verificadas de forma independiente.
- El modelo card incluye atribución a HuggingFaceH4/no_robots bajo CC-BY-NC-4.0, lo que puede afectar a la reproducibilidad del entrenamiento y conviene revisar antes de un uso comercial estricto, pese a que los pesos se distribuyan como Apache-2.0.
- La longitud de contexto no está documentada, lo que impide planificar cargas con prompts largos o conversaciones extensas.
- El listado de idiomas es genérico (`en`, `multilingual`) sin evaluación por idioma; el rendimiento en castellano no está verificado.
- El GGUF ternario a 1,58 bpw introduce degradación adicional de calidad frente al checkpoint `safetensors`; no se han publicado métricas de esa pérdida.
- Riesgo de alucinación elevado por el tamaño reducido y por el dominio de entrenamiento (web educativa, código y datos sintéticos).
- No se documenta soporte de tool calling, agentes, visión ni audio, por lo que no debe asumirse en producción.
- El repositorio tiene 399 descargas y 0 likes en el momento de la consulta, con una única versión fechada en octubre de 2026; la madurez del ecosistema en torno al modelo es mínima.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DeepNarra/Mako
- Organización DeepNarra: https://huggingface.co/DeepNarra
- Pesos `safetensors`: https://huggingface.co/DeepNarra/Mako/blob/main/model.safetensors
- GGUF ternario: https://huggingface.co/DeepNarra/Mako/blob/main/model-TQ1_0.gguf
- Licencia Apache-2.0: http://www.apache.org/licenses/LICENSE-2.0
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset Aya Collection: https://huggingface.co/datasets/CohereForAI/aya_collection
- Dataset CodeFeedback-Filtered-Instruction: https://huggingface.co/datasets/m-a-p/CodeFeedback-Filtered-Instruction
- Dataset no_robots: https://huggingface.co/datasets/HuggingFaceH4/no_robots
- SymPy: https://www.sympy.org

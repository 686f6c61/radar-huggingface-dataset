# glyd/gemma-4-31B-wren

## Resumen

Gemma 4 31B (QAT) · Glyd Wren es una redistribución del checkpoint oficial de Google DeepMind `gemma-4-31B-it-qat-q4_0-unquantized`, empaquetado en el formato propietario del motor Glyd. El autor, glyd, no modifica los pesos: almacena exactamente los códigos de 4 bits y las escalas de 16 bits por cada 32 pesos del checkpoint QAT original (4,5 bits por peso), de modo que cada peso decodifica al mismo valor bf16 que el modelo de Google. La ventaja es operativa: permite ejecutar un modelo denso de 31B en una única GPU de 24 GB con un motor propio, sin pasar por Transformers, vLLM o llama.cpp.

El paquete incluye además el modelo borrador (draft model) de Google en el subdirectorio `draft/`, lo que habilita decodificación especulativa y multiplica por 3-4 la velocidad de generación en la RTX 4090. El repositorio ocupa 18,4 GB, de los cuales 16,2 GiB son pesos y aproximadamente 1 GB corresponde al borrador.

Es relevante porque demuestra una vía práctica de servir un modelo de 31B con calidad cercana al bf16 en hardware de consumo, manteniendo fidelidad bit a bit respecto al checkpoint QAT y ofreciendo verificación criptográfica de los tensores. La contrapartida es la dependencia total del motor Glyd (versión 0.33.0 o superior, Linux con NVIDIA), lo que limita su portabilidad frente a formatos estándar como GGUF o safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Gemma 4, checkpoint QAT de Google) |
| Parametros totales | 17.297.816.109 (según safetensors); el nombre comercial indica 31B |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible de forma explícita; se han probado prompts de 30K tokens |
| Tipos de cuantizacion | Formato propio Glyd: códigos de 4 bits + escala de 16 bits por cada 32 pesos (4,5 bits/peso); sin otras cuantizaciones publicadas |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Formato propietario Glyd (no safetensors estándar, no GGUF); el repo declara safetensors como tag pero los ficheros solo cargan con el motor Glyd |

## Arquitectura y entrenamiento

El modelo subyacente es Gemma 4 31B en su variante instruction-tuned con Quantization-Aware Training (QAT) de Google DeepMind, un transformer denso entrenado para que la cuantización a 4 bits forme parte del proceso de entrenamiento. Glyd Wren no reentrena ni destila: actúa como un repacker que preserva la representación QAT (códigos de 4 bits más escala de 16 bits por bloque de 32 pesos), de forma que la decodificación reproduce exactamente los valores bf16 del checkpoint QAT de Google. La equivalencia es respecto al checkpoint QAT, no respecto al Gemma 4 31B bf16 original, que ya difiere del QAT por construcción.

La innovación técnica está en el motor y en el empaquetado: el comando `glyd verify` decodifica cada tensor y compara su sha256 con el registrado a partir de los ficheros de Google en el momento del empaquetado, lo que permite auditar la fidelidad de los pesos. Además, se incluye sin modificar el modelo borrador `gemma-4-31B-it-qat-q4_0-unquantized-assistant` de Google, que habilita decodificación especulativa con 8 tokens por ronda. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF o DPO del modelo base en la información proporcionada.

## Capacidades

- Generación de texto conversacional multi-turno en modo chat, con soporte de modo "thinking" (los benchmarks se reportaron con thinking desactivado).
- Razonamiento y matemáticas: resultados reportados en GSM8K (72/75) y MMLU-Pro (70/75) en modo greedy.
- Procesamiento de prompts largos: lectura de un prompt de 4K tokens en 1,7 s y de 30K tokens en 20 s en RTX 4090.
- Decodificación especulativa mediante el modelo borrador incluido, con aceleración de 3-4x en modo greedy manteniendo exactamente los mismos tokens.
- Muestreo con temperatura: con T=1.0 la distribución resultante es la misma que sin el borrador.
- Verificación de integridad de pesos mediante `glyd verify` (comparación sha256 por tensor).
- Solo texto: no hay entrada de imágenes en esta versión.

## Casos de uso

- Asistente conversacional local en estación de trabajo: con 19,3 GiB de memoria a contexto de 8K (borrador incluido), cabe en una RTX 4090 y permite mantener conversaciones multi-turno sin enviar datos a la nube, útil en entornos con requisitos de confidencialidad.
- Generación de código y razonamiento técnico en local: el modelo base es instruction-tuned y los resultados en MMLU-Pro (70/75) lo sitúan como opción para tareas de análisis y explicación de código en un solo equipo.
- Procesamiento de documentos largos: la lectura de prompts de 30K tokens en 20 s permite resumir o extraer información de contratos, informes o transcripciones extensas en una pasada.
- Evaluación e investigación de cuantización: al ser lossless respecto al checkpoint QAT y verificable por sha256, sirve como referencia para comparar el impacto de otras cuantizaciones (GGUF q4, AWQ, etc.) sobre el mismo modelo.
- Prototipado de pipelines de agentes con razonamiento multi-paso: el modo thinking y la ventana amplia permiten encadenar pasos de planificación y ejecución en local antes de escalar a infraestructura mayor.
- Despliegue en nodos edge con GPU de 24 GB: en un servidor con RTX 4090 o RTX 3090 (26 tok/s en modo simple) se puede ofrecer inferencia de un modelo de 31B sin clúster multi-GPU.
- Reproducción de benchmarks en hardware de consumo: los números publicados (GSM8K, MMLU-Pro, KLD frente a bf16) se obtuvieron en RTX 4090, lo que facilita replicar la evaluación con el mismo equipamiento.

## Benchmarks y rendimiento

Rendimiento en RTX 4090 24 GB (Runpod), 5 prompts, greedy, 256 tokens:

| Escenario | Modo simple | Con borrador (8 por ronda) |
|---|---|---|
| Chat greedy | 46 tok/s | 78-176 tok/s (mismos tokens, verificado token a token) |
| Chat con muestreo (T=1.0) | 46 tok/s | 87 tok/s (misma distribución) |
| Lectura de prompt 4K | 1,7 s | No disponible |
| Lectura de prompt 30K | 20 s | No disponible |
| RTX 3090 (modo simple) | 26 tok/s | No disponible |

Calidad (referencia: H100 con transformers 5.19 en bf16; wikitext-2 test, 32 x 512, medido como en llama.cpp):

| Comparación | Resultado |
|---|---|
| Frente a pesos QAT de Google (bf16) | KLD media 0,018; mediana 0,003; top-1 96% |
| Prompts de chat | KL 0,0005; 124/124 top-1 |
| Prompt de 4K tokens | 24/24 top-1; KL 0,0006 |
| GSM8K (primeros 75, greedy, thinking off) | 72/75 |
| MMLU-Pro (primeros 75, greedy, thinking off) | 70/75 |

## Requisitos de hardware

- VRAM estimada: 19,3 GiB de 24 GiB a contexto de 8K, incluyendo el modelo borrador; pesos en disco de 16,2 GiB (frente a 58 GiB en bf16).
- GPU recomendadas: NVIDIA RTX 4090 (24 GB) es el objetivo principal; RTX 3090 funciona en modo simple a 26 tok/s.
- Requisito mínimo declarado: Linux con NVIDIA RTX 30 series o superior y 24 GB de VRAM. Sin soporte para Windows, Mac ni AMD.
- Cabe en GPU de consumo: sí, en RTX 4090 y RTX 3090 de 24 GB.
- Opciones de despliegue: exclusivamente el motor Glyd (versión 0.33.0 o superior) con el comando `glyd run glyd/gemma-4-31B-wren`. No es compatible con Transformers, vLLM, llama.cpp ni Ollama; para esos motores hay que usar los pesos oficiales de Google.
- Latencia y throughput: carga de 24 s desde disco en RTX 4090; 46 tok/s en modo simple; 78-176 tok/s con borrador en greedy; 87 tok/s con borrador y muestreo a T=1.0.
- Concurrencia: una solicitud a la vez; las demás esperan en cola.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Motores compatibles |
|---|---|---|---|---|---|
| glyd/gemma-4-31B-wren | 17,3B (nominal 31B) | No disponible (probado a 30K) | Formato Glyd 4,5 bits/peso | Apache 2.0 | Solo Glyd |
| google/gemma-4-31B-it-qat-q4_0-unquantized | 31B (nominal) | No disponible | QAT 4 bits | Apache 2.0 | Transformers, vLLM, llama.cpp (según card de Google) |
| google/gemma-4-31B-it-qat-q4_0-unquantized-assistant | No disponible | No disponible | QAT 4 bits | Apache 2.0 | Motores de Google; usado como borrador en Wren |

La comparativa directa con otras alternativas de la misma categoría (por ejemplo, otros modelos densos de ~30B cuantizados a 4 bits) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Dependencia total del motor Glyd: los ficheros no cargan en Transformers, vLLM ni llama.cpp; para esos ecosistemas hay que recurrir a los pesos oficiales de Google.
- Plataforma restringida: solo Linux con NVIDIA RTX 30 series o superior y 24 GB de VRAM; sin soporte para Windows, Mac ni AMD.
- Solo texto: no admite entrada de imágenes en esta versión.
- Sin concurrencia: una petición a la vez, lo que limita su uso como servidor multiusuario.
- Reproducibilidad con muestreo: con el borrador activado, una misma semilla produce texto distinto (igualmente probable) que sin él; la salida greedy sí es idéntica.
- La equivalencia es respecto al checkpoint QAT de Google, no al Gemma 4 31B bf16 original; el propio QAT ya introduce diferencias frente a bf16.
- Riesgo de alucinación inherente al modelo base; no se documentan evaluaciones específicas de factualidad ni de sesgos en la información disponible.
- Idiomas soportados no documentados en la ficha; conviene validar el comportamiento multilingüe antes de usarlo en producción.
- Licencia Apache 2.0 permite uso comercial, pero las condiciones del modelo base de Google deben verificarse en su card original.
- El proyecto tiene muy poca tracción (28 descargas, 1 like) y depende de un único autor; no hay garantías de mantenimiento a largo plazo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/glyd/gemma-4-31B-wren
- Modelo base (Google): https://huggingface.co/google/gemma-4-31B-it-qat-q4_0-unquantized
- Modelo borrador (Google): https://huggingface.co/google/gemma-4-31B-it-qat-q4_0-unquantized-assistant

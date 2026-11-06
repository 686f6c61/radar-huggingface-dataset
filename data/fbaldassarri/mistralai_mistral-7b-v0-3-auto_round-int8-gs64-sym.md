# fbaldassarri/mistralai_Mistral-7B-v0.3-auto_round-int8-gs64-sym

## Resumen

Esta ficha documenta una versión cuantizada a INT8 del modelo Mistral-7B-v0.3, publicada por el usuario fbaldassarri mediante la herramienta Intel AutoRound en su versión 0.16.0. No se trata de un modelo nuevo, sino de un artefacto de cuantización weights-only (WoQ) que aplica el algoritmo SignRound sobre los pesos originales de Mistral 7B v0.3 con 8 bits, tamaño de grupo 64 y esquema simétrico. El objetivo es reducir la huella de memoria y acelerar la inferencia en hardware Intel, en particular CPU, iGPU Arc y NPU de la serie Core Ultra.

El modelo base, Mistral 7B v0.3, es un transformer decoder-only causal con 7.248 millones de parámetros nominales y una ventana de contexto de 32.768 tokens, distribuido bajo licencia Apache 2.0. Esta variante cuantizada mantiene la arquitectura y el tokenizador intactos, pero almacena los pesos en INT8 agrupados, lo que reduce el tamaño del repositorio a 8,4 GB frente a los aproximadamente 14,5 GB de la versión en bfloat16.

La relevancia de esta publicación es acotada: se trata de un artefacto de reproducibilidad generado por un pipeline automatizado (auto-round-pipeline), con 17 descargas y sin métricas de evaluación publicadas. Resulta útil como referencia para quienes necesiten replicar exactamente esta receta de cuantización o desplegar Mistral 7B en entornos Intel sin GPU dedicada, pero no aporta mejoras algorítmicas ni datos de rendimiento propios.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal (Mistral) |
| Parámetros totales | 2.149.847.040 (según safetensors del artefacto cuantizado; el modelo base declara 7B nominales) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredada de Mistral 7B v0.3) |
| Tipos de cuantización | INT8, group size 64, simétrica, weights-only (WoQ) con AutoRound/SignRound |
| Idiomas soportados | Inglés (según model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato auto_round), compatible con transformers |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Mistral 7B v0.3: un transformer decoder-only con atención de ventana deslizante (sliding window attention) y activación SwiGLU, sin mezcla de expertos. Esta variante no reentrena ni ajusta el modelo; únicamente cuantiza los pesos mediante Intel AutoRound 0.16.0, que emplea el algoritmo SignRound para minimizar el error de cuantización mediante optimización de los factores de escala por grupo. La calibración se realizó sobre 128 muestras, con 200 iteraciones de tuning, longitud de secuencia 512 y batch size 4, todo en CPU y cargando el modelo en bfloat16.

El proceso completo de cuantización registrado duró 40.182,5 segundos (aproximadamente 670 minutos) y finalizó el 16 de octubre de 2026. Se usaron transformers 4.55.3 y torch 2.14.1+cpu. No se aplicó RLHF, DPO ni ningún ajuste posterior; el modelo resultante es un modelo base de completación, no instruct, y debe alimentarse con texto plano sin plantilla de chat. La innovación técnica se limita al propio método de cuantización: agrupación de 64 pesos por escala y simetría, lo que preserva mejor la distribución de pesos que una cuantización per-tensor.

## Capacidades

- Generación de texto autoregresiva y completación de secuencias a partir de un prompt en texto plano.
- Razonamiento básico y respuesta a preguntas derivados del modelo base Mistral 7B v0.3.
- Generación de código y matemáticas a nivel del modelo original (sin garantías específicas tras la cuantización).
- Capacidad multilingüe limitada: la model card declara únicamente inglés, aunque el modelo base tiene cierto multilingüismo no documentado aquí.
- No soporta tool calling ni function calling de forma nativa (es un modelo base, no instruct).
- No soporta agentes ni razonamiento multi-paso estructurado.
- No dispone de modo thinking, visión ni audio.
- Inferencia optimizada para CPU Intel, iGPU Arc (vía intel-extension-for-pytorch) y NPU Core Ultra (vía OpenVINO).

## Casos de uso

- Completación de texto en local sobre CPU Intel: el modelo puede ejecutarse sin GPU dedicada gracias a la cuantización INT8 y a intel-extension-for-pytorch, adecuado para prototipos y entornos de escritorio.
- Despliegue en portátiles con Core Ultra: la variante INT8 permite ejecutar Mistral 7B en la NPU AI Boost mediante OpenVINO, reduciendo consumo energético frente a FP16.
- Generación de documentación técnica y código en pipelines internos: al ser un modelo base, se usaría como motor de completación dentro de editores o scripts, no como asistente conversacional.
- Reproducción de experimentos de cuantización: sirve como artefacto de referencia para validar recetas de AutoRound con group size 64 y esquema simétrico frente a otras configuraciones.
- Benchmarking de hardware Intel: útil para medir throughput y latencia de un 7B en INT8 sobre iGPU Arc o NPU, comparando con variantes GGUF o GPTQ.
- Filtrado y clasificación de texto por completación: tareas de etiquetado simple donde se prefija el contexto y se deja que el modelo continúe, sin necesidad de instrucciones.
- Educación e investigación: permite estudiar el impacto de la cuantización WoQ en la calidad de generación sin requerir infraestructura de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8-9 GB en INT8 (pesos de ~8,4 GB más overhead de activaciones y KV cache).
- GPU recomendadas: no se especifican; el artefacto está orientado a CPU Intel, iGPU Arc y NPU Core Ultra. En GPU NVIDIA podría ejecutarse, pero no es el objetivo declarado.
- Cabe en GPU consumer: sí, en tarjetas con 12 GB o más (RTX 3060 12 GB, RTX 4070, RTX 4090), aunque la ruta recomendada es Intel.
- Opciones de despliegue: transformers con device_map="auto", intel-extension-for-pytorch (CPU/iGPU), OpenVINO (NPU), text-generation-inference (tag presente en el repo). No se documenta soporte de llama.cpp, Ollama ni vLLM para este formato auto_round.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este artefacto (Mistral-7B-v0.3 INT8 AutoRound) | 7B nominales | 32.768 | INT8 gs64 sim | Apache 2.0 | Hugging Face, 17 descargas |
| mistralai/Mistral-7B-v0.3 (original) | 7B | 32.768 | bfloat16 | Apache 2.0 | Hugging Face, ampliamente usado |
| Mistral-7B-Instruct-v0.3 | 7B | 32.768 | bfloat16 | Apache 2.0 | Hugging Face, con tool calling |
| Variantes GGUF de Mistral 7B (p. ej. Q4_K_M) | 7B | 32.768 | 4-8 bits | Apache 2.0 | Hugging Face, ecosistema llama.cpp |

La comparación relevante es con el modelo base sin cuantizar y con las variantes GGUF, que ofrecen mayor portabilidad entre plataformas. Este artefacto se distingue por su integración específica con el stack Intel (IPEX y OpenVINO) y por una receta de cuantización reproducible, pero carece de evaluación comparativa de calidad frente a esas alternativas.

## Limitaciones y advertencias

- Es un modelo base, no instruct: no sigue instrucciones ni mantiene formato conversacional sin ingeniería de prompt adicional.
- No se han publicado evaluaciones de calidad tras la cuantización; el degradado respecto a bfloat16 es desconocido.
- Idiomas: la model card declara solo inglés, lo que limita su uso en castellano u otros idiomas.
- Riesgo de alucinación inherente al modelo base Mistral 7B v0.3, sin mitigaciones adicionales.
- Sesgos heredados del corpus de entrenamiento original, no documentados en esta ficha.
- La licencia Apache 2.0 permite uso comercial, pero el autor declara que el artefacto se desarrolló solo con fines de investigación y sin garantías.
- El formato auto_round tiene soporte limitado fuera del ecosistema Intel/transformers; no es directamente compatible con llama.cpp u Ollama.
- El número de parámetros reportado por safetensors (2.149.847.040) no coincide con los 7B nominales del modelo base, lo que sugiere un empaquetado peculiar de los pesos cuantizados; conviene verificarlo antes de desplegar en producción.
- Repositorio con muy baja adopción (17 descargas, 0 likes) y sin mantenimiento documentado.

## Enlaces

- Hugging Face: https://huggingface.co/fbaldassarri/mistralai_Mistral-7B-v0.3-auto_round-int8-gs64-sym
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-v0.3
- Intel AutoRound (repositorio): https://github.com/intel/auto-round
- Pipeline de reproducción: https://git.epicdynamic.com/auto-round-pipeline
- Licencia Apache 2.0: https://choosealicense.com/licenses/apache-2.0/

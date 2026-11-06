# KrynexLabs/KrynexAI-1.5-250M-Instruct-Mobile

## Resumen
KrynexAI-1.5-250M-Instruct-Mobile es un modelo de lenguaje de tipo SLM (small language model) desarrollado por KrynexLabs, presentado como parte de la familia principal KrynexAI. Se trata de un modelo causal de arquitectura Llama con 229.688.064 parametros reales (etiquetado comercialmente como 250M), entrenado sobre aproximadamente 40.400 millones de tokens. Su proposito declarado es ofrecer inferencia ligera en dispositivos de borde (on-device, edge-ai) y entornos con recursos limitados.

El modelo parte del checkpoint SupraLabs/Supra2.1-Ultra y se distribuye con pesos en safetensors y GGUF, lo que facilita su despliegue tanto en transformers como en runtimes de cuantizacion. Su ventana de contexto es de 2.048 tokens, suficiente para conversaciones cortas y tareas de generacion acotadas, pero no para documentos largos ni razonamiento multi-paso extenso.

Es relevante ahora por su encaje en el nicho de modelos pequenos ejecutables localmente y por su licencia Apache-2.0, que permite uso comercial sin restricciones adicionales. No obstante, el propio autor advierte que es un modelo base sin alineamiento ni evaluacion de seguridad, por lo que su uso en produccion requiere validacion previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal tipo Llama (SwiGLU, RoPE) |
| Parametros totales | 229.688.064 (etiquetado como 250M) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | GGUF disponible; precision original bfloat16 |
| Idiomas soportados | Ingles (en), frances (fr), chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento
El modelo sigue una arquitectura transformer causal densa de estilo Llama con 32 capas, tamano oculto de 768, tamano intermedio de MLP de 1.920 y activacion SiLU con MLP SwiGLU. La atencion usa 12 cabezas con dimension de cabeza 64 y 4 cabezas KV bajo GQA (grouped-query attention), lo que reduce el coste de memoria del cache KV. El vocabulario es de 49.152 tokens, las embeddings estan atadas (tied embeddings) y se usa RoPE con theta de 10.000.

El entrenamiento se realizo sobre unos 40.400 millones de tokens en una unica GPU A100 SXM. Los datasets declarados son KrynexLabs/KrynexAI-Santa-Ana-Tusi-Pasco-Quechua, KrynexLabs/KrynexAI-Dataset-Mini-Top1 y KrynexLabs/KrynexAI-Dataset-Flash-Instruction. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de alineamiento; el autor indica explicitamente que el modelo no ha sido alineado ni evaluado para seguridad.

## Capacidades
- Generacion de texto autoregresiva en ingles, frances y chino.
- Instrucciones conversacionales basicas, segun el sufijo Instruct de la version.
- Razonamiento simple y respuesta a preguntas de conocimiento general acotado.
- Capacidad limitada de aritmetica elemental (reflejada en Arithmark-v3).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No dispone de vision, audio ni modo thinking.
- Capacidades multilingues restringidas a en, fr y zh; el castellano no figura entre los idiomas declarados.

## Casos de uso
- Asistentes locales en movil o dispositivos empotrados: con 229M parametros y pesos GGUF, el modelo puede ejecutarse en CPU o GPU integrada para autocompletado y respuestas breves sin conexion.
- Clasificacion y etiquetado de texto corto: su contexto de 2.048 tokens permite procesar resenas, tickets o mensajes para categorizacion en pipelines de bajo coste.
- Generacion de respuestas plantilla en chatbots de dominio acotado: adecuado para flujos donde la respuesta es corta y el riesgo de error se mitiga con reglas de validacion.
- Filtrado previo (pre-routing) en sistemas multi-modelo: puede actuar como primer clasificador que decide si una consulta requiere un modelo mayor.
- Prototipado rapido de aplicaciones NLP en entornos sin GPU: la combinacion de transformers y GGUF permite iterar en portatiles.
- Educacion e investigacion sobre SLM: util como referencia para estudiar el comportamiento de modelos pequenos entrenados con decenas de miles de millones de tokens.
- Traduccion asistida basica entre ingles, frances y chino en contextos de frase corta, con revision humana obligatoria.

## Benchmarks y rendimiento

| Benchmark | Shots | acc | acc_norm | Aleatorio |
|---|---|---|---|---|
| HellaSwag | 0 | 31,64 | 37,18 | 25,0 |
| PIQA | 0 | 65,78 | 64,91 | 50,0 |
| ARC-Easy | 0 | 57,11 | 50,46 | 25,0 |
| ARC-Challenge | 0 | 25,00 | 26,28 | 25,0 |
| Arithmark-v3 | 0 | 38,00 | 38,20 | no disponible |
| Open SLM Leaderboard II | no disponible | 20,64 | no disponible | no disponible |

Los resultados son coherentes con un modelo de 229M parametros: mejora clara sobre el azar en PIQA y ARC-Easy, pero se mantiene cerca del nivel aleatorio en ARC-Challenge. No se han publicado resultados de MMLU, HumanEval ni GSM8K en la informacion disponible.

## Requisitos de hardware
- VRAM estimada en bfloat16: aproximadamente 0,46 GB solo para pesos, mas cache KV y overhead del runtime; en la practica, menos de 2 GB.
- VRAM estimada en cuantizacion de 8 bits: en torno a 0,25 GB de pesos; en 4 bits, alrededor de 0,13 GB.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; funciona en A100, H100, RTX 4090, RTX 3060 y similares.
- Cabe holgadamente en GPU de consumo e incluso en iGPU y CPU, gracias a su tamano reducido.
- Opciones de despliegue: transformers, llama.cpp, Ollama (via GGUF), text-generation-inference y endpoints compatibles.
- Latencia y throughput: no disponibles en la informacion proporcionada; por tamano, se espera una latencia muy baja en GPU moderna y aceptable en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| KrynexAI-1.5-250M-Instruct-Mobile | 229,7M | 2.048 | Apache-2.0 | Hugging Face (safetensors, GGUF) |
| SmolLM-135M | 135M | 2.048 | Apache-2.0 | Hugging Face |
| Qwen2.5-0.5B | 494M | 32.768 | Apache-2.0 | Hugging Face |
| TinyLlama-1.1B | 1,1B | 2.048 | Apache-2.0 | Hugging Face |

Frente a SmolLM-135M, KrynexAI ofrece mas parametros pero un contexto identico; frente a Qwen2.5-0.5B, este ultimo supera ampliamente en contexto y, previsiblemente, en rendimiento. TinyLlama-1.1B es varias veces mayor y no es directamente comparable en coste de inferencia. No se dispone de datos de benchmarks cruzados en la informacion proporcionada para establecer una comparacion cuantitativa rigurosa.

## Limitaciones y advertencias
- El autor declara explicitamente que el modelo no ha sido alineado ni evaluado para seguridad.
- Riesgo elevado de generar texto incorrecto o sesgado, propio de un modelo base de este tamano.
- Contexto limitado a 2.048 tokens: no apto para documentos largos ni conversaciones extensas.
- Idiomas soportados solo en, fr y zh; no se garantiza calidad en castellano.
- Riesgo de alucinacion alto en tareas de conocimiento factual y aritmetica compleja.
- Rendimiento cercano al azar en benchmarks de razonamiento exigente (ARC-Challenge).
- Aunque la licencia Apache-2.0 permite uso comercial, la falta de alineamiento hace recomendable una capa de validacion y filtrado en produccion.
- No se documentan evaluaciones de sesgo, toxicidad ni robustez adversarial.

## Enlaces
- Hugging Face: https://huggingface.co/KrynexLabs/KrynexAI-1.5-250M-Instruct-Mobile
- Modelo base: https://huggingface.co/SupraLabs/Supra2.1-Ultra
- Dataset: https://huggingface.co/datasets/KrynexLabs/KrynexAI-Santa-Ana-Tusi-Pasco-Quechua
- Dataset: https://huggingface.co/datasets/KrynexLabs/KrynexAI-Dataset-Mini-Top1
- Dataset: https://huggingface.co/datasets/KrynexLabs/KrynexAI-Dataset-Flash-Instruction

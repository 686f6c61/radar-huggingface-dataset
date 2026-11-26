# Pyleon/pyro-ps-0.2.0-chat

## Resumen

Pyro PS-0.2.0-Chat es un modelo de lenguaje conversacional de 100,7 millones de parámetros desarrollado por Pyleon, entrenado íntegramente desde inicialización aleatoria con un motor propio escrito en Rust y CUDA, sin usar código de entrenamiento de PyTorch ni pesos de terceros. Es el checkpoint de la etapa 2 (SFT de instrucciones) del modelo base Pyro PS-0.2.0, y su relevancia radica en demostrar que es posible construir una pila completa de entrenamiento e inferencia desde cero (tokenizador propio, entrenador CUDA en FP16, SFT con máscara en turnos del asistente y servidor web en Rust con cuantización int4) sobre hardware gratuito.

Arquitectónicamente es un transformer causal con Pre-RMSNorm de 12 capas, dimensión 768, atención GQA con 12 cabezas de consulta y 4 de clave/valor, QK-Norm, RoPE con theta 10.000, SwiGLU con dimensión de feed-forward 2048 y embeddings atados. El contexto es de 1024 tokens, una ventana reducida que limita los casos de uso a conversaciones cortas o tareas de un solo turno con contexto acotado.

El modelo se distribuye con licencia de vista previa de evaluación (pyro-evaluation-preview), orientada a pruebas públicas, benchmarking e investigación, y requiere contactar con el autor para redistribución comercial. Está pensado como prueba de concepto de la pila técnica de Pyleon más que como modelo de producción, y el propio autor reconoce limitaciones en aritmética multi-paso y recuerdo de hechos específicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal Pre-RMSNorm, 12 capas, d=768, GQA 12Q/4KV (hd=64), QK-Norm, RoPE (theta=10.000), SwiGLU (F=2048), embeddings atados |
| Parametros totales | 100.684.032 (100,7 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | int4 (runtime Q4 en Rust, 56,7 MB de pesos), int8, FP32 |
| Idiomas soportados | Ingles (en) |
| Licencia | pyro-evaluation-preview (other); redistribucion comercial previa consulta al autor |
| Formato de pesos | safetensors (model.safetensors), tokenizer.json, config.json; runtime propio int4 |
| Tokenizador | BPE a nivel de byte propio (PSTOK v1, vocabulario 32.768) |
| Tamano del repo | 0,5 GB |

## Arquitectura y entrenamiento

El modelo es un transformer causal decoder-only con Pre-RMSNorm, 12 capas y dimension 768. Usa atención con grouped-query attention (12 cabezas de consulta, 4 de clave/valor, dimension por cabeza 64), QK-Norm para estabilizar el producto escalar, RoPE con theta 10.000 para codificar posiciones y SwiGLU como activación en la capa feed-forward (dimension 2048). Los embeddings de entrada y salida están atados, lo que reduce el recuento de parámetros. El tokenizador es un BPE a nivel de byte propio (PSTOK v1) con vocabulario de 32.768 tokens.

La etapa 1 de preentrenamiento usó 2.840 millones de tokens de FineWeb-Edu y FineMath 4+ (licencia ODC-By-1.0) durante 29,3 horas en 2 GPUs Tesla T4 gratuitas, con un optimizador Muon propio en CUDA que, según el autor, aporta aproximadamente el doble de eficiencia de muestra. La etapa 2 de SFT se realizó con entropía cruzada enmascarada solo en los turnos del asistente (ASSISTANT_TURN loss masking, paridad CUDA 7/7 verificada) sobre 26.425 conversaciones únicas escritas íntegramente por humanos (Dolly-15k, OASST1/OASST2 en inglés y el conjunto de entrenamiento de GSM8K), 6,18 millones de tokens, 3,05 épocas y 0 pasos omitidos, en 18,5 minutos en 2 T4. La perplejidad en validación solo del asistente bajó de 11,54 a 8,53 (-26,1 %), con val_bpb de 0,9013 a 0,7897.

El formato de chat usa tokens reservados del tokenizador PSTOK v1: `<BOS=1> [<SYSTEM=3> texto] <USER=4> mensaje <ASSISTANT=5> respuesta <EOS=2>`, alternando turnos dentro de la ventana de 1024 tokens. El motor de inferencia es independiente de PyTorch (pyro-engine, pyro-infer en Rust + CUDA) y, según el autor, supera a llama.cpp Q8_0 en decodificación CPU con 1 y 4 hilos.

## Capacidades

- Generación de texto conversacional en inglés con estructura multi-turno y parada limpia en `<EOS>`.
- Seguimiento de instrucciones básicas adquirido mediante SFT con enmascarado de turnos del asistente.
- Razonamiento aritmético elemental y resolución de problemas sencillos (incluye GSM8K en el conjunto de SFT), aunque el autor advierte que la aritmética multi-paso puede ser imprecisa.
- Respuesta a preguntas de conocimiento general y tareas de sentido común, con recuerdo factual limitado.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- Multilingüe: no; solo inglés.
- No dispone de modo thinking, visión ni audio.
- Inferencia en CPU con cuantización int4 a 100-147 tok/s, incluido hardware sin AVX (Pentium G4560 de 2017).

## Casos de uso

- Demo educativa de pila from-scratch: sirve para mostrar de extremo a extremo cómo se entrena un LLM (tokenizador, preentrenamiento, SFT, cuantización y servidor) sin dependencias de PyTorch, con pesos y código auditables.
- Evaluación de técnicas de cuantización: el modelo permite comparar int4, int8 y FP32 con métricas publicadas (retención del 98,4 % frente a FP32 en una auditoría de 500 ítems y 0,00 % de caída macro frente a int8 en 3.000 ítems), útil para validar pipelines de compresión.
- Chatbot ligero en dispositivos de bajos recursos: con 56,7 MB en int4 y 100-147 tok/s en CPU estándar, puede desplegarse en entornos sin GPU para asistentes de conversación corta en inglés.
- Benchmarking de motores de inferencia: al incluir comparaciones con llama.cpp Q8_0 en decodificación CPU, sirve como referencia para evaluar runtimes alternativos en Rust.
- Investigación sobre enmascarado de pérdida en SFT: el checkpoint y las métricas de val_bpb y val_ppl antes y después del SFT permiten estudiar el efecto del assistant-only loss masking en modelos pequeños.
- Prototipado de formato de chat con tokens reservados: útil para experimentar con esquemas de turnos (`<SYSTEM>`, `<USER>`, `<ASSISTANT>`, `<EOS>`) en tokenizadores personalizados.
- Pruebas de regresión en pipelines de CI para motores propios: el repo incluye manifest.json con checksums SHA-256 de todos los ficheros, lo que facilita verificar integridad en automatizaciones.

## Benchmarks y rendimiento

Resultados del modelo base PS-0.2.0 (zero-shot, 500 ítems por tarea, 3.000 ítems totales, acc_norm normalizado por bytes):

| Modelo | Parametros | Tokens de entrenamiento | Media 6 tareas | OpenBookQA | ARC-Easy | ARC-Challenge | WinoGrande | HellaSwag | BoolQ |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Pythia-160M-deduped | 162,3 M | ~300 B | 39,53 % | 25,4 % | 42,6 % | 22,8 % | 48,0 % | 39,6 % | 58,8 % |
| GPT-2 124M | 124,4 M | ~10 B | 39,57 % | 25,8 % | 41,0 % | 20,8 % | 53,2 % | 40,0 % | 56,6 % |
| Pyro PS-0.2.0 (int8) | 100,7 M | 2,84 B | 41,57 % | 29,2 % | 45,8 % | 21,6 % | 50,0 % | 40,6 % | 62,2 % |
| Pyro PS-0.2.0 (int4, 57 MB) | 100,7 M | 2,84 B | 41,57 % | 28,4 % | 45,6 % | 22,0 % | 50,4 % | 40,2 % | 62,8 % |
| SmolLM2-135M | 134,5 M | 2.000 B | 46,20 % | 33,2 % | 58,0 % | 27,2 % | 52,0 % | 44,0 % | 62,8 % |

Métricas de compresión (held-out, FP32, T=1024, BPB menor es mejor): eval-edu 1,0025 (frente a GPT-2 1,0200 y Pythia-160M 1,2334); eval-math 0,8540 (frente a SmolLM2-135M 0,8613).

Métricas de SFT (sft-mix/valid, 174.406 tokens activos del asistente):

| Metrica | Pre-SFT | Post-SFT (paso 288) |
|---|---:|---:|
| val_bpb (asistente) | 0,9013 | 0,7897 (mejor 0,7887) |
| val_loss (asistente) | 2,4461 | 2,1434 |
| val_ppl (asistente) | 11,54 | 8,53 (-26,1 %) |

No se han publicado resultados de benchmarks específicos del checkpoint chat (por ejemplo, MMLU o HumanEval) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no requiere GPU para inferencia; el runtime int4 ocupa 56,7 MB de RAM de pesos y el repo completo 0,5 GB.
- GPU recomendadas para entrenamiento: 2 x Tesla T4 (usadas en preentrenamiento y SFT); el autor planifica A100, L40S o H100 para el siguiente modelo.
- GPU de consumo: cabe holgadamente en cualquier GPU de consumo (RTX 4090, RTX 3060, etc.) e incluso en CPU sin AVX.
- Despliegue: motor propio pyro-infer (Rust + CUDA) y demo en Hugging Face Spaces; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 100-147 tok/s en CPU estándar con int4, incluido un Pentium G4560 de doble núcleo de 2017 sin AVX; velocidad 3,06x FP32 en CPU según la auditoría del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Media 6 tareas | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| Pyro PS-0.2.0-Chat | 100,7 M | 1024 | 41,57 % (base, int8/int4) | pyro-evaluation-preview | Hugging Face, runtime propio |
| SmolLM2-135M | 134,5 M | no disponible | 46,20 % | no disponible | Hugging Face |
| Pythia-160M-deduped | 162,3 M | no disponible | 39,53 % | no disponible | Hugging Face |
| GPT-2 124M | 124,4 M | no disponible | 39,57 % | no disponible | Hugging Face |

Pyro PS-0.2.0-Chat supera a GPT-2 y Pythia-160M en la media de 6 tareas pese a tener menos parámetros y muchos menos tokens de entrenamiento, pero queda por debajo de SmolLM2-135M, que usa dos órdenes de magnitud más tokens. La ventaja diferencial de Pyro no es el rendimiento bruto sino la pila from-scratch en Rust, la cuantización int4 sin pérdida apreciable y el despliegue en CPU.

## Limitaciones y advertencias

- Ventana de contexto de solo 1024 tokens, insuficiente para documentos largos o conversaciones extensas.
- Solo inglés; no soporta castellano ni otros idiomas.
- Aritmética multi-paso y recuerdo de hechos específicos pueden ser inexactos, según reconoce el autor.
- Riesgo de alucinación inherente a un modelo de 100,7 M entrenado con 2,84 B tokens y sin Wikipedia en el corpus.
- No debe usarse para decisiones médicas, legales o de seguridad crítica.
- Licencia de vista previa de evaluación: el uso comercial y la redistribución requieren contactar con el autor.
- Sesgos: no se documentan análisis de sesgo en la información disponible; el corpus (FineWeb-Edu, FineMath, Dolly, OASST) puede introducir sesgos propios de esas fuentes.
- Ecosistema limitado: sin soporte documentado en vLLM, llama.cpp, Ollama o TGI, lo que dificulta su integración en pilas existentes.
- Modelo con 0 descargas y 0 likes en el momento de la consulta; madurez y soporte comunitario muy limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Pyleon/pyro-ps-0.2.0-chat
- Modelo base: https://huggingface.co/Pyleon/pyro-ps-0.2.0
- Demo en CPU: https://huggingface.co/spaces/Pyleon/pyro-demo

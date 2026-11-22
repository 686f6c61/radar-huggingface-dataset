# 8BitStudio/Sekai-1

## Resumen

Sekai-1 es un modelo de lenguaje de 95,6 millones de parametros desarrollado por 8BitStudio y entrenado desde cero en una unica GPU RTX 5060 Ti. Es el primer modelo de la serie Sekai y se posiciona como una alternativa compacta dentro de la categoria de modelos por debajo de 100 millones de parametros, con un enfoque en eficiencia de entrenamiento y despliegue en hardware de consumo.

El modelo emplea una arquitectura decoder-only de estilo Qwen3, con atencion de consultas agrupadas (GQA) de 9 cabezas de consulta y 3 de clave-valor, MLP SwiGLU, RMSNorm, RoPE y embeddings atados. Dispone de una ventana de contexto de 2.048 tokens y un tokenizador BPE propio de 24.576 tokens que divide los numeros en digitos individuales.

Su relevancia radica en demostrar que es posible entrenar un modelo de lenguaje funcional con 58.500 millones de tokens en hardware de consumo, y en ofrecer una licencia Apache 2.0 permisiva con pesos en safetensors listos para transformers. Segun el autor, ocupa el segundo puesto en la categoria de menos de 100M de parametros del SLM leaderboard, solo por detras de KLM-1.5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Qwen3 (GQA, SwiGLU, RMSNorm, RoPE, embeddings atados) |
| Parametros totales | 95.581.504 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Sekai-1 es un transformer decoder-only con 23 capas, tamano oculto de 576 y atencion de consultas agrupadas con 9 cabezas de consulta y 3 de clave-valor. Incorpora MLP SwiGLU, normalizacion RMSNorm, embeddings posicionales rotatorios (RoPE) y embeddings de entrada y salida atados. El tokenizador es un BPE propio de 24.576 tokens entrenado sobre la mezcla de datos del modelo, con la particularidad de separar los numeros en digitos individuales.

El preentrenamiento cubre 58.500 millones de tokens de datos web, educativos, matematicos, de codigo y de conversacion, con un schedule de learning rate warmup-stable-decay; los ultimos aproximadamente 12.000 millones de tokens corresponden a una fase de decaimiento sobre una mezcla de mayor calidad. Se emplearon los optimizadores Muon y AdamW. La mezcla de datos incluye conjuntos como karpathy/climbmix-400b-shuffle, HuggingFaceTB/smollm-corpus, finemath, cosmopedia, UltraX-Preview, dolma3_dolmino_mix-100B-1025, dolma3.5_pool, dolmino-mix-1124, TxT360-v2, OpenMathInstruct-2, Nemotron-MIND, UltraData-Math, orca-math-word-problems-200k, MetaMathQA, opc-annealing-corpus, smoltalk, smoltalk2, ultrachat_200k, tulu-3-sft-mixture y commitpackft. El ajuste fino supervisado (SFT) consume unos 400 millones de tokens de instrucciones, conversacion cotidiana, respuestas cortas y largas, resumenes, reescritura, escritura y correccion de codigo, ademas de ejemplos de identidad. No se usa chain-of-thought y se filtraron las negativas del conjunto de datos.

## Capacidades

- Generacion de texto conversacional en ingles con formato ChatML.
- Seguimiento de instrucciones basicas: resumen, reescritura, respuestas cortas y largas.
- Escritura y correccion de codigo a nivel basico.
- Aritmetica simple; el tokenizador separa digitos para facilitar el manejo de numeros.
- Conocimiento de su propia identidad como Sekai-1 gracias a ejemplos especificos en el SFT.
- No dispone de tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene modo thinking, vision ni audio.
- Multilingue limitado al ingles.

## Casos de uso

- Prototipado rapido en local: el modelo cabe en CPU y en GPUs de consumo, lo que permite iterar en cuadernos o scripts sin infraestructura cloud; util para validar pipelines de generacion antes de escalar a modelos mayores.
- Generacion de texto en dispositivos de borde: con 95,6M de parametros y pesos en safetensors de aproximadamente 0,4 GB, puede desplegarse en entornos con memoria muy limitada para tareas de autocompletado o respuestas cortas.
- Educacion e investigacion: sirve como banco de pruebas reproducible para estudiar tecnicas de entrenamiento (Muon, warmup-stable-decay, mezclas de datos) en hardware asequible.
- Asistente de reescritura y resumen de textos cortos: el SFT incluye tareas de resumen y reescritura, adecuadas para fragmentos que quepan en 2.048 tokens.
- Generacion de codigo sencillo y correccion de errores: entrenado con commitpackft y datos de codigo, puede sugerir parches o explicar fragmentos cortos en un IDE o script auxiliar.
- Chat de proposito general de baja exigencia: conversacion cotidiana en ingles con respuestas breves, sin requisitos de seguridad, para demos o entornos controlados.
- Base para fine-tuning ligero: al ser pequeno y Apache 2.0, es un punto de partida economico para adaptar a dominios concretos con recursos limitados.

## Benchmarks y rendimiento

El autor publica una imagen de leaderboard (Leaderboard.png) e indica que el modelo ocupa el segundo puesto en la categoria de menos de 100M de parametros del SLM leaderboard, por detras de KLM-1.5. Las puntuaciones son zero-shot y se midieron localmente sobre las mismas tareas del leaderboard; las de los demas modelos provienen del leaderboard a fecha de 7 de noviembre de 2026. No se proporcionan los valores numericos concretos en la informacion disponible.

| Benchmark | Sekai-1 | KLM-1.5 | Otros modelos <100M |
|---|---|---|---|
| SLM leaderboard (posicion) | 2 | 1 | no disponible |
| Puntuaciones numericas | no disponible | no disponible | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4 GB en precision original (fp32/bf16 segun pesos); menos de 0,5 GB en la mayoria de configuraciones.
- GPU recomendadas: cualquier GPU moderna con al menos 1 GB de VRAM; el autor lo entreno en una RTX 5060 Ti, lo que da margen sobrado para inferencia.
- Cabe en GPU de consumo: si, en practicamente todas (RTX 3060, 4060, 4090, etc.), y tambien en CPU.
- Opciones de despliegue: transformers (biblioteca indicada), text-generation-inference (tag del repo) y endpoints compatibles; no se confirma soporte de llama.cpp, Ollama o vLLM en la informacion disponible.
- Latencia y throughput: no disponibles; al ser un modelo de 95,6M de parametros se espera baja latencia en CPU y GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rendimiento | Disponibilidad |
|---|---|---|---|---|---|
| Sekai-1 | 95,6M | 2.048 | Apache 2.0 | 2.º en SLM leaderboard (<100M) | Hugging Face, transformers |
| KLM-1.5 (MinimaLabs) | no disponible | no disponible | no disponible | 1.º en SLM leaderboard (<100M) | Hugging Face |
| Otros modelos <100M del leaderboard | no disponible | no disponible | no disponible | por debajo de Sekai-1 | no disponible |

## Limitaciones y advertencias

- Comete errores factuales con frecuencia; no es fiable como fuente de informacion.
- Pierde el hilo en conversaciones largas y su ventana de contexto es de solo 2.048 tokens.
- Es debil en razonamiento multi-paso y en matematicas mas alla de la aritmetica simple.
- No tiene ajuste de seguridad ni comportamiento de rechazo: no debe usarse en aplicaciones que requieran filtros o moderacion.
- Solo entiende ingles; no hay soporte multilingue.
- Licencia Apache 2.0 permite uso comercial, pero el autor advierte que se revisen las respuestas en aplicaciones criticas.
- No dispone de tool calling, agentes ni modos de razonamiento extendido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/8BitStudio/Sekai-1
- KLM-1.5 (modelo comparable): https://huggingface.co/MinimaLabs/KLM-1.5
- SLM leaderboard: https://huggingface.co/spaces/AxiomicLabs/Open_SLM_Leaderboard

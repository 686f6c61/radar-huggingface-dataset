# nkthebass/tinybrainbot-53m-a9m-hybrid-instruct

## Resumen

TinyBrainBot-53M-A9M-Hybrid-Instruct es un modelo de lenguaje conversacional de muy pequeno tamano entrenado desde cero por el desarrollador independiente nkthebass. Emplea una arquitectura hibrida que combina bloques de convolucion corta con compuertas (gated short-convolution) y un pequeno numero de bloques de atencion, junto con una capa de mezcla de expertos (MoE). Cuenta con 53,4 millones de parametros totales y solo 9,3 millones activos por token, lo que lo situa en la categoria de modelos ultraligeros.

Su relevancia radica en dos factores. Primero, reproduce el diseno de LFM2-MoE de LiquidAI, de modo que funciona de forma nativa en llama.cpp, LM Studio, Ollama y en transformers >= 5 como `Lfm2MoeForCausalLM`, sin necesidad de codigo personalizado. Segundo, incorpora capacidades de razonamiento explicito (thinking) y de llamada a herramientas (tool calling), poco habituales en modelos de este tamano, y se distribuye con licencia Apache 2.0.

El autor lo presenta explicitamente como una prueba a pequena escala de la receta y arquitectura previstas para un TinyBrainBot mayor. El propio model card advierte de que se trata de un modelo diminuto: fluido y rapido, a menudo correcto en hechos simples, pero poco fiable en aritmetica e instrucciones de varios pasos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: bloques de convolucion corta con compuertas + bloques de atencion + mezcla de expertos (MoE), compatible con LFM2-MoE |
| Parametros totales | 53.428.384 (53,4 M) |
| Parametros activos | 9,3 M por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (disponible en el repositorio); otros formatos no disponibles |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

La arquitectura sigue el esquema LFM2-MoE: una pila de bloques de convolucion corta con compuertas combinada con un numero reducido de bloques de atencion, sobre la que se anade una capa de mezcla de expertos. El resultado es un modelo con 53,4 M de parametros totales pero solo 9,3 M activos por token, lo que reduce el coste computacional por paso de decodificacion. La correspondencia con el layout de LiquidAI permite que el modelo se ejecute de forma nativa en el ecosistema llama.cpp y en transformers >= 5 mediante la clase `Lfm2MoeForCausalLM`.

El entrenamiento se realizo desde cero. La mezcla de datos declarada es amplia e incluye corpus web educativos y filtrados (FineWeb-Edu, DCLM-Baseline, DCLM-Ultra, FinePDFs-Edu, Cosmopedia, FinePhrase), enciclopedicos (Wikipedia), cientificos (SciQ-like via SmolLM-corpus), matematicos (FineMath, MegaMath-Web-Pro-Max, Orca-Math), codigo (The Stack Smol), literatura (Project Gutenberg, BookCorpusOpen), cuentos (TinyStories), QA (gooaq, ELI5) y datos de instruccion y conversacion (SmolTalk, SmolSmolTalk, Tulu-3 SFT personas, WildChat-4.8M, OpenHermes-2.5, Hermes function calling v1). El numero exacto de tokens de entrenamiento no esta disponible. La model card no detalla si se aplicaron fases de RLHF o DPO; unicamente se documenta la fase de ajuste supervisado (instruct).

## Capacidades

- Generacion de texto conversacional en ingles, con respuestas fluidas para su tamano.
- Modo de razonamiento explicito (thinking) antes de responder.
- Llamada a herramientas y funciones (tool calling / function calling), entrenado con Hermes function calling v1.
- Razonamiento de varios pasos, aunque el autor lo califica de poco fiable en tareas de multiples pasos.
- Capacidad aritmetica limitada: el modelo base obtiene 52,9 en ArithMark-3 y el ajustado 43,9, lo que indica degradacion tras el ajuste.
- Comprension lectora y sentido comun basico, con resultados por encima del azar en PIQA y SciQ.
- Multilingue: no disponible; solo se declara ingles.
- Vision, audio u otras modalidades: no disponibles.

## Casos de uso

- Prototipado rapido de asistentes conversacionales en local: el modelo cabe en cualquier equipo y permite validar flujos de chat multi-turno sin coste de API, gracias a su tamano de 53,4 M de parametros y su formato GGUF.
- Pruebas de integracion de tool calling en pipelines de agentes: al soportar function calling nativo, sirve para verificar el cableado de herramientas y el parseo de llamadas antes de migrar a un modelo mayor.
- Experimentacion academica con arquitecturas hibridas MoE: su compatibilidad con `Lfm2MoeForCausalLM` permite estudiar el comportamiento de convoluciones con compuertas y atencion combinadas en un modelo de bajo coste.
- Educacion y demostraciones de IA generativa: la velocidad de inferencia y el reducido consumo de recursos lo hacen adecuado para talleres y clases donde se explica el funcionamiento interno de un LLM.
- Generacion de texto auxiliar en dispositivos con recursos muy limitados (edge, Raspberry Pi, moviles): el numero de parametros activos (9,3 M) permite decodificacion rapida en CPU.
- Filtrado y clasificacion ligera de texto en ingles: tareas de etiquetado simple o resumen corto donde la precision no sea critica y prime la latencia.
- Base para fine-tuning de dominio: al estar entrenado desde cero y con licencia Apache 2.0, puede servir como punto de partida para ajustes especificos de nicho a bajo coste.

## Benchmarks y rendimiento

Resultados declarados por el autor (0-shot, conjuntos de test completos). No verificados de forma independiente.

| Benchmark | Este modelo | Base antes de fine-tuning | Cambio |
|---|---:|---:|---:|
| ARC-Easy (acc_norm) | 49,71 | 49,66 | +0,04 |
| ARC-Challenge (acc_norm) | 30,29 | 29,44 | +0,85 |
| HellaSwag (acc_norm) | 30,10 | 30,13 | -0,03 |
| PIQA (acc_norm) | 64,04 | 63,22 | +0,82 |
| OpenBookQA (acc_norm) | 32,40 | 32,80 | -0,40 |
| SciQ (acc_norm) | 63,90 | 63,70 | +0,20 |
| WinoGrande (acc) | 49,41 | 49,33 | +0,08 |
| BoolQ (acc) | 58,72 | 58,26 | +0,46 |
| LAMBADA OpenAI (acc) | 22,88 | 21,00 | +1,88 |
| MMLU (acc) | 24,82 | 23,42 | +1,40 |
| CommonsenseQA (acc) | 21,70 | 20,15 | +1,56 |
| Social IQa (acc) | 37,67 | 38,08 | -0,41 |
| ArithMark-3 (acc_norm) | 43,90 | 52,90 | -9,00 |

Ademas, el author reporta una sonda aritmetica propia (habilidades no cubiertas por ArithMark-3): 40,94 en el modelo ajustado frente a 40,80 en el base (+0,14). No se han publicado resultados de HumanEval, GSM8K ni otros benchmarks de codigo o matematicas en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en cuantizacion de 4 bits; en fp16 el modelo completo ocupa aproximadamente 0,11 GB (53,4 M de parametros), por lo que cabe en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. Cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090) es mas que suficiente.
- Cabe en consumer GPU: si, en todas las gamas, incluidas iGPU y dispositivos de borde.
- Opciones de despliegue: llama.cpp, LM Studio, Ollama (soporte nativo por el layout LFM2-MoE), transformers >= 5 con `Lfm2MoeForCausalLM`, y servidores compatibles con la API de endpoints (el tag `endpoints_compatible` esta presente).
- Latencia y throughput estimados: no disponibles de forma numerica; el autor destaca que es "fluido y rapido" gracias a los 9,3 M de parametros activos por token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| TinyBrainBot-53M-A9M-Hybrid-Instruct | 53,4 M totales / 9,3 M activos | no disponible | Apache 2.0 | Hugging Face (safetensors, GGUF) | Hibrido MoE, tool calling, thinking |
| SmolLM2-135M-Instruct | 135 M | no disponible en esta ficha | Apache 2.0 | Hugging Face | Denso, mas parametros, sin MoE |
| Qwen2.5-0.5B-Instruct | 0,5 B | no disponible en esta ficha | Apache 2.0 | Hugging Face | Denso, mayor capacidad pero mas recursos |
| LFM2-MoE (LiquidAI) | no disponible en esta ficha | no disponible | no disponible | Hugging Face | Arquitectura de referencia que replica este modelo |

La comparacion directa de rendimiento con estas alternativas no esta disponible en la informacion proporcionada; los benchmarks publicados por el autor solo se contrastan contra el modelo base previo al ajuste.

## Limitaciones y advertencias

- Modelo diminuto: el propio autor advierte de que es poco fiable en aritmetica e instrucciones de varios pasos; los resultados en MMLU (24,82) y HellaSwag (30,10) reflejan una capacidad de conocimiento muy limitada.
- Degradacion aritmetica tras el ajuste: ArithMark-3 cae 9 puntos respecto al base (de 52,9 a 43,9), lo que sugiere que el ajuste instructivo sacrifica habilidad aritmetica.
- Riesgo de alucinacion elevado: con 53,4 M de parametros y entrenamiento desde cero, la generacion de hechos incorrectos es esperable; no debe usarse como fuente de verdad.
- Solo ingles: no se declara soporte multilingue; el uso en castellano no esta validado.
- Longitud de contexto no documentada: se desconoce la ventana maxima real, lo que limita el diseno de aplicaciones con contexto largo.
- Benchmarks no verificados: todos los resultados son declarados por el autor (`verified: false`) y no han sido reproducidos de forma independiente.
- Licencia Apache 2.0: permite uso comercial, pero al ser un modelo de muy bajo rendimiento no es recomendable para produccion sin validacion exhaustiva.
- Fecha de creacion futura en los metadatos (2026-11-09): conviene verificar la procedencia y el estado real del repositorio antes de adoptarlo.

## Enlaces

- Hugging Face: https://huggingface.co/nkthebass/tinybrainbot-53m-a9m-hybrid-instruct
- Repositorio de referencia de la arquitectura (LiquidAI LFM2-MoE): no disponible en la informacion proporcionada
- Paper o blog del autor: no disponible en la informacion proporcionada
- Demo o espacio interactivo: no disponible en la informacion proporcionada

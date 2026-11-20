# ITLL/tinybrainbot-53m-a9m-hybrid-instruct

## Resumen

TinyBrainBot-53M-A9M-Hybrid-Instruct es un modelo de lenguaje conversacional de escala muy reducida desarrollado por ITLL y entrenado desde cero. Emplea una arquitectura híbrida que combina bloques de convolución corta con compuerta (gated short-convolution) y unos pocos bloques de atención, junto con una mezcla de expertos (MoE). El modelo totaliza 53,4 millones de parámetros, de los cuales solo 9,3 millones están activos por token, lo que reduce el coste computacional de la inferencia.

La relevancia del modelo reside en su diseño: su estructura replica el layout de LFM2-MoE de LiquidAI, por lo que funciona de forma nativa en llama.cpp, LM Studio, Ollama y en transformers >= 5 bajo la clase `Lfm2MoeForCausalLM`, sin necesidad de código personalizado. Está pensado como una prueba a pequeña escala de la receta y arquitectura que ITLL planea aplicar a un TinyBrainBot de mayor tamaño. Incluye capacidades de razonamiento (thinking) y de llamada a herramientas (tool calling), y está afinado para instrucciones y conversación.

El modelo se distribuye con licencia Apache 2.0 y soporta únicamente inglés. Es un modelo deliberadamente pequeño: fluido y rápido, a menudo correcto en hechos simples, pero poco fiable en aritmética e instrucciones de varios pasos, según advierte el propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: bloques de convolución corta con compuerta + bloques de atención, con mezcla de expertos (MoE); compatible con `Lfm2MoeForCausalLM` |
| Parametros totales | 53.428.384 (53,4 M) |
| Parametros activos | 9,3 M por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF disponible en el repositorio; niveles específicos no disponibles |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

La arquitectura es híbrida y sigue el diseño LFM2-MoE de LiquidAI: combina bloques de convolución corta con compuerta, que procesan secuencias locales de forma eficiente, con un número reducido de bloques de atención que aportan modelado global. Sobre esta columna se aplica una mezcla de expertos, de modo que solo una fracción de los parámetros (9,3 M de 53,4 M) se activa por token. Esta combinación busca un equilibrio entre eficiencia computacional y calidad de representación en un modelo de tamaño muy contenido.

El entrenamiento se realizó desde cero (from-scratch) sobre un corpus compuesto por numerosos datasets públicos, entre ellos FineWeb-Edu, DCLM-Baseline, Wikipedia, Cosmopedia, SmolLM-Corpus, FineMath, MegaMath-Web-Pro-Max, FinePDFs-Edu, The Stack Smol, Project Gutenberg, BookCorpusOpen, TinyStories, DCLM-Ultra, FactBase-DCLM, GooAQ, ELI5, FinePhrase y Orca-Math-Word-Problems. La fase de instrucción y conversación empleó datasets como SmolTalk, Smol-SmolTalk, Tulu-3 SFT Personas, WildChat-4.8M, OpenHermes-2.5 y Hermes-Function-Calling-v1. El número total de tokens de entrenamiento no está disponible. La model card no detalla si se aplicaron técnicas de RLHF o DPO, ni innovaciones como decodificación especulativa; la innovación principal declarada es la propia arquitectura híbrida con MoE y su compatibilidad nativa con el ecosistema llama.cpp.

## Capacidades

- Generación de texto conversacional en inglés, con respuestas fluidas y rápidas.
- Razonamiento básico con modo "thinking" (pensamiento) declarado por el autor.
- Llamada a herramientas / function calling, respaldado por el dataset Hermes-Function-Calling-v1.
- Razonamiento de varios pasos y uso como agente, aunque con fiabilidad limitada según el propio autor.
- Conocimiento factual simple: acierta a menudo en hechos sencillos.
- Capacidad aritmética limitada: el autor advierte de que es poco fiable en aritmética.
- Soporte multilingüe: únicamente inglés.
- No se declaran capacidades de visión ni de audio.

## Casos de uso

- Asistentes conversacionales ligeros en el dispositivo: el modelo cabe en cualquier equipo y responde con baja latencia, adecuado para chatbots de soporte simple donde la fluidez prima sobre la precisión factual.
- Pruebas de concepto de tool calling: gracias a su soporte de function calling y a su compatibilidad con llama.cpp y Ollama, sirve para validar pipelines de agentes antes de escalar a modelos mayores.
- Experimentación educativa con arquitecturas híbridas MoE: útil para investigadores que quieran estudiar el comportamiento de un MoE híbrido de 53 M parámetros sin coste de cómputo relevante.
- Generación de texto creativo breve: cuentos, descripciones y textos cortos, apoyándose en su entrenamiento con TinyStories y Project Gutenberg.
- Clasificación y etiquetado de texto simple: tareas de formato corto donde la ventana de contexto y la precisión requeridas son modestas.
- Filtrado y preprocesado en pipelines: por su bajo coste, puede usarse como primer filtro o generador de borradores antes de un modelo mayor.
- Prototipado rápido en LM Studio u Ollama: permite a desarrolladores integrar un modelo de chat sin infraestructura GPU dedicada.

## Benchmarks y rendimiento

Resultados declarados por el autor (0-shot, conjuntos de test completos) y comparación con la base antes del ajuste fino:

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
| LAMBADA (OpenAI) (acc) | 22,88 | 21,00 | +1,88 |
| MMLU (acc) | 24,82 | 23,42 | +1,40 |
| CommonsenseQA (acc) | 21,70 | 20,15 | +1,56 |
| Social IQa (acc) | 37,67 | 38,08 | -0,41 |
| ArithMark-3 (acc_norm) | 43,90 | 52,90 | -9,00 |
| Sonda aritmética held-out propia | 40,94 | 40,80 | +0,14 |

No se han publicado en la información disponible resultados de HumanEval, GSM8K ni otros benchmarks de código o matemáticas más allá de ArithMark-3.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en cuantización de 8 bits o menor; el repositorio completo ocupa 0,4 GB, por lo que en FP16 el modelo ronda los 0,1 GB de pesos.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) e incluso CPU; no requiere A100 ni H100.
- Cabe holgadamente en GPU consumer y en equipos de gama baja; también es viable en CPU.
- Opciones de despliegue: llama.cpp, LM Studio, Ollama (soporte nativo por la arquitectura LFM2-MoE) y transformers >= 5 con `Lfm2MoeForCausalLM`.
- Latencia y throughput estimados: no disponibles de forma numérica; el autor describe el modelo como "fluido y rápido", y su reducido número de parámetros activos (9,3 M) sugiere una latencia muy baja.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| TinyBrainBot-53M-A9M-Hybrid-Instruct | 53,4 M totales / 9,3 M activos | no disponible | Apache 2.0 | HF (safetensors, GGUF) |
| LFM2-MoE (LiquidAI) | no disponible en la información | no disponible | no disponible | referencia arquitectónica, no comparativa directa |
| Otros SLM de escala similar | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de rendimiento de modelos comparables de la misma categoría, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Fiabilidad limitada en aritmética: el autor advierte explícitamente de su poca fiabilidad, y ArithMark-3 cae 9 puntos tras el ajuste fino.
- Poca fiabilidad en instrucciones de varios pasos.
- Riesgo de alucinación elevado en hechos no simples, propio de un modelo de 53 M parámetros.
- Solo soporta inglés; no hay capacidades multilingües.
- Longitud de contexto no documentada, lo que limita su uso en conversaciones o documentos largos.
- Sesgos potenciales derivados de los datasets de entrenamiento (web, Wikipedia, corpus conversacionales); no se documentan mitigaciones específicas.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías de calidad para producción.
- Es un modelo de prueba a pequeña escala; no debe considerarse representativo del rendimiento del futuro TinyBrainBot de mayor tamaño.

## Enlaces

- Hugging Face: https://huggingface.co/ITLL/tinybrainbot-53m-a9m-hybrid-instruct
- Arquitectura de referencia LFM2-MoE (LiquidAI): no disponible en los resultados de búsqueda proporcionados.
- Paper, blog o repositorio adicionales: no disponibles en la información proporcionada.

# IvmeLabs/Ivme-Conversate-v3.1-Base

## Resumen

Ivme-Conversate-v3.1-Base es un modelo de lenguaje de tipo decoder-only transformer denso con 24.956.480 parámetros, desarrollado por IvmeLabs. Se trata de la continuación de Ivme-Conversate-v3-Base, entrenado mediante continued pretraining para corregir el problema de v3: buena gramática pero conocimiento débil. El modelo no ha recibido entrenamiento de instrucciones, por lo que funciona como un autocompletado de texto y no como un asistente conversacional.

La arquitectura mantiene el diseño de v3 (16 capas, dimensión oculta 320, FFN SwiGLU de 864, 8 cabezas de atención con head_dim 40, sin GQA) e incorpora QK-Norm y XSA (Exclusive Self-Attention), un mecanismo descrito en el paper arXiv:2603.09078. El tokenizador es un BPE personalizado de 16.000 tokens con tokenización atómica de dígitos, pensada para facilitar operaciones matemáticas. La ventana de contexto es de 1.024 tokens.

El modelo es relevante como caso de estudio de entrenamiento de modelos de escala muy pequeña (sub-25M) y como ejemplo de que, en esta escala, los datos pesan tanto como la arquitectura. Está publicado bajo licencia Apache 2.0 y solo soporta inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Decoder-only transformer denso |
| Parámetros totales | 24.956.480 |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0,1 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de 16 capas, dimensión oculta 320, FFN SwiGLU de 864 unidades, 8 cabezas de atención de dimensión 40 y atención completa sin GQA. Usa RoPE con θ=10.000, RMSNorm pre-norm, embeddings de entrada y salida atados y ningún sesgo. La dimensión de cabeza de 40 es poco habitual en GPU, lo que reduce la eficiencia de ejecución según el autor. El vocabulario es de 16.000 tokens con BPE personalizado que separa cada dígito en un token propio (tokenización atómica de dígitos) para favorecer el razonamiento numérico.

La innovación técnica principal es XSA (Exclusive Self-Attention), un mecanismo de atención que hace que cada token atienda a sus vecinos en lugar de a sí mismo, de modo que el cómputo se dedica a relaciones token-token en vez de a la propia posición. Se complementa con QK-Norm para estabilizar queries y keys en entrenamientos largos. El entrenamiento consistió en continued pretraining sobre v3 con 31.400 millones de tokens (algo más de una época), con la siguiente composición: 32,5% de finemath-3plus, 29,7% de cosmopedia-v2 (smollm-corpus), 14,0% de fineweb-edu (score ≥ 3,5) y el resto repartido entre finewiki, open-web-math y SimpleStories. No se menciona RLHF ni DPO.

## Capacidades

- Generación de texto y autocompletado: completa secuencias de forma coherente, incluyendo respuestas factuales simples cuando se le da un prefijo tipo pregunta.
- Razonamiento básico y conocimiento factual limitado, mejorado respecto a v3 mediante continued pretraining.
- Aritmética elemental: ArithMark-3 sube de 35,20 a 37,20, aunque el autor advierte que los modelos Conversate no son fuertes en matemáticas.
- Gramática y sintaxis: BLiMP (macro de 67 tareas) baja de 78,49 a 75,09, es decir, empeora respecto a v3.
- Capacidad multilingüe: solo inglés.
- Tool calling / function calling: no soportado.
- Uso como agente o razonamiento multi-paso: no soportado.
- Modo thinking, visión o audio: no soportado.

## Casos de uso

- Estudio de escalado en modelos sub-25M: sirve como referencia reproducible para investigar cómo afectan datos frente a arquitectura en modelos muy pequeños, gracias a sus benchmarks públicos y a la comparación directa v3 frente a v3.1.
- Generación de texto educativo y completado de apuntes: puede completar frases y párrafos en dominios educativos (fineweb-edu, cosmopedia) para prototipos de herramientas de estudio, siempre con revisión humana.
- Pruebas de tokenización atómica de dígitos: útil para experimentos sobre cómo la tokenización por dígitos afecta al rendimiento aritmético en modelos pequeños, comparando con tokenizadores BPE convencionales.
- Docencia y divulgación: ejemplo didáctico de un transformer completo y entrenado desde cero con 25M de parámetros, adecuado para explicar RoPE, SwiGLU, QK-Norm y XSA en un curso.
- Baseline en pipelines de evaluación: modelo de referencia ligero para validar arneses como lm-eval-harness antes de lanzar evaluaciones sobre modelos mayores.
- Prototipado de autocompletado de bajo coste: al ocupar 0,1 GB en safetensors, puede desplegarse en entornos con recursos mínimos para demos de generación de texto sin requisitos de instrucción.
- Investigación sobre loops de generación: el autor señala que v3.1 es más "terco" que v3 y tiende menos a entrar en bucles, lo que lo hace útil para estudiar degeneración en modelos pequeños.

## Benchmarks y rendimiento

Resultados publicados por el autor, ejecutados con lm-eval-harness y comparando v3 frente a v3.1 en el mismo entorno de entrenamiento:

| Benchmark | v3 | v3.1 | Dirección |
|---|---|---|---|
| ARC-Easy | 39,02 | 40,15 | sube |
| ARC-Challenge | 24,32 | 25,00 | sube |
| HellaSwag | 28,90 | 29,52 | sube |
| PIQA | 57,67 | 59,25 | sube |
| ArithMark-3 | 35,20 | 37,20 | sube |
| BLiMP (macro 67 tareas) | 78,49 | 75,09 | baja |

Métricas de modelado del lenguaje:

| Benchmark | v3 | v3.1 |
|---|---|---|
| Perplejidad por palabra en WikiText-2 (menor es mejor) | 57,90 | 55,35 |
| Perplejidad por byte en WikiText-2 (menor es mejor) | 2,1362 | 2,1182 |

No se han publicado resultados frente a modelos de terceros en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (unos 100 MB de pesos), y del orden de decenas de MB en cuantizaciones de 8 o 4 bits. No se dispone de cifras oficiales de cuantización.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo cabe holgadamente en RTX 3060, RTX 4060, RTX 4090 o superiores. También es viable en CPU.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 1 GB de VRAM, e incluso en iGPU y CPU.
- Opciones de despliegue: transformers (librería declarada, con `custom_code` por XSA), y potencialmente llama.cpp u Ollama si se generan pesos GGUF, aunque no se documenta soporte oficial.
- Latencia y throughput: no disponibles. El autor advierte que head_dim 40 reduce la eficiencia en GPU.

## Comparativa con modelos similares

No se dispone de datos de benchmarks frente a modelos comparables en la información proporcionada. Como referencia estructural, el modelo se sitúa en la categoría de modelos sub-25M de tipo autocompletado sin instrucción, pero no se han publicado comparaciones con alternativas concretas.

| Modelo | Parámetros | Contexto | Licencia | Instrucción | Datos de comparación |
|---|---|---|---|---|---|
| Ivme-Conversate-v3.1-Base | 24.956.480 | 1.024 | Apache 2.0 | No | benchmarks propios frente a v3 |
| Ivme-Conversate-v3-Base | no disponible | no disponible | no disponible | No | resultados v3 en la tabla anterior |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No tiene entrenamiento de instrucciones: no responde preguntas como un asistente; solo completa texto.
- El autor reconoce que no compite con un modelo de 100M y que no sirve para tareas multi-paso ni para uso real en producción.
- El rendimiento en gramática empeora respecto a v3 (BLiMP baja 3,4 puntos), un compromiso aceptado deliberadamente por el autor.
- Riesgo de alucinación alto por su escala y por la ausencia de alineación; los hechos generados deben verificarse.
- Contexto muy corto (1.024 tokens), lo que limita conversaciones largas y documentos extensos.
- Solo soporta inglés; no hay capacidades multilingües.
- Las matemáticas siguen siendo un punto débil pese a la tokenización atómica de dígitos.
- La licencia Apache 2.0 permite uso comercial, pero la calidad del modelo hace inviable su uso en producción sin supervisión.
- Dependencia de `custom_code` (XSA) para cargar el modelo en transformers, lo que puede complicar el despliegue en herramientas que no lo soporten.
- Eficiencia reducida en GPU por head_dim 40, según el propio autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/IvmeLabs/Ivme-Conversate-v3.1-Base
- Modelo base v3: https://huggingface.co/IvmeLabs/Ivme-Conversate-v3-Base
- Paper de XSA (Exclusive Self-Attention): arXiv:2603.09078
- Dataset fineweb-edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset smollm-corpus: https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus
- Dataset finewiki: https://huggingface.co/datasets/HuggingFaceFW/finewiki
- Dataset finemath: https://huggingface.co/datasets/HuggingFaceTB/finemath
- Dataset open-web-math: https://huggingface.co/datasets/open-web-math/open-web-math
- Dataset SimpleStories: https://huggingface.co/datasets/SimpleStories/SimpleStories

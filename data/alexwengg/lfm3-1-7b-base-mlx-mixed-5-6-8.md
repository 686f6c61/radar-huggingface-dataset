# alexwengg/LFM3-1.7B-Base-MLX-mixed-5-6-8

## Resumen

LFM3-1.7B-Base-MLX-mixed-5-6-8 es una conversión comunitaria no oficial del modelo base preentrenado LiquidAI/LFM3-1.7B-Base a formato MLX, optimizada para Apple Silicon. Lo publica el usuario alexwengg, no Liquid AI, y su propósito es cubrir un hueco: Liquid AI distribuye builds MLX del modelo instruct pero no del base. Los pesos son de Liquid AI; el trabajo del autor es la cuantización mixta y el empaquetado para la librería MLX.

El modelo es un transformer de 1.728.801.536 parámetros (aproximadamente 1,7 mil millones) en su variante base, es decir, preentrenado sin ajuste de instrucciones. La arquitectura LFM3 de Liquid AI soporta una longitud de contexto de 262.144 tokens, aunque esta build solo se ha validado hasta unos 2.000 tokens. Está pensado para completación de texto, few-shot prompting, scoring y fine-tuning, no para seguir instrucciones de chat.

La cuantización es mixta con tamaño de grupo 64: 8 bits en las proyecciones de atención (q/k/v/o/gate), 6 bits en las proyecciones de entrada y salida de la convolución corta y en el embedding/LM head atado, y 5 bits en el feed-forward (w1/w2/w3). El resultado ocupa 1,293 GB en un único `model.safetensors` y conserva una fidelidad respecto a fp32 notablemente superior a la de la build uniforme de 5 bits del mismo autor, con un incremento de perplejidad en wikitext-2 de solo el 0,75 % frente al 1,36 % de la variante de 5 bits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer LFM3 (Liquid AI), pesos en formato MLX; incluye convolución corta y proyecciones de atención |
| Parametros totales | 1.728.801.536 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens segun la arquitectura; validado en esta build hasta ~2.000 tokens |
| Tipos de cuantizacion | Mixta afín con grupo 64: 8 bits en atención (q/k/v/o/gate), 6 bits en conv in/out y embedding/LM head, 5 bits en feed-forward (w1/w2/w3) |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl |
| Licencia | LFM Open License v1.0 (lfm1.0, licencia del modelo original) |
| Formato de pesos | safetensors (MLX), 1,293 GB en `model.safetensors` |

## Arquitectura y entrenamiento

El modelo subyacente es LFM3 de Liquid AI, un transformer preentrenado de 1,7 mil millones de parámetros. La model card de esta conversión no detalla la composición del dataset de preentrenamiento ni el número de tokens utilizados, y tampoco indica si hubo fases de RLHF o DPO; al tratarse de un modelo base, no cabe esperar un ajuste de alineación orientado a instrucciones. La arquitectura incluye proyecciones de atención (q/k/v/o/gate), una convolución corta con proyecciones de entrada y salida, y un embedding atado al LM head, según se desprende de la receta de cuantización aplicada.

La innovación técnica de esta build concreta es la cuantización mixta por módulo con tamaño de grupo 64, que asigna más bits a los componentes sensibles (atención a 8 bits) y menos al feed-forward (5 bits), manteniendo el embedding y la convolución a 6 bits. La conversión se realizó con mlx-vlm `main` (commit `230fc308`) y MLX 0.32.4, partiendo del checkpoint en bf16 de `LiquidAI/LFM3-1.7B-Base` (revisión `545fc8f4`). El layout de ficheros replica el de las builds MLX de texto de Liquid (`language_model.model.*`). Los ficheros de código remoto (`configuration_lfm3.py`, `modeling_lfm3.py`, `lfm3_conv.py`) se copian sin cambios del repositorio original.

## Capacidades

- Generación de texto por completación: el modelo continúa texto libre, sin plantilla de chat.
- Few-shot prompting: admite ejemplos en el contexto para condicionar la tarea.
- Scoring y evaluación de probabilidad de secuencias: útil para ranking y métricas de perplejidad.
- Fine-tuning: al ser un modelo base, es el punto de partida adecuado para ajuste supervisado o LoRA.
- Multilingüe: 16 idiomas declarados (inglés, árabe, chino, francés, alemán, italiano, japonés, coreano, portugués, español, vietnamita, tailandés, indonesio, hindi, ruso y polaco).
- No soporta de forma nativa tool calling ni function calling, ni modos de razonamiento multi-paso: son capacidades del modelo instruct, no de esta build base.
- No incluye visión ni audio: es un modelo puramente de texto.
- No dispone de modo "thinking" ni parada automática de generación; hay que fijar `max_tokens` y criterios de corte.

## Casos de uso

- Completación de texto en local sobre Mac: el modelo ocupa 1,293 GB y se ejecuta con mlx-vlm en Apple Silicon, lo que permite autocompletado y generación de texto sin conexión en un portátil con memoria unificada moderada.
- Generación de datos sintéticos para fine-tuning: al ser un modelo base, se puede usar para producir continuaciones diversas que sirvan como corpus de entrenamiento o aumento de datos en dominios concretos.
- Scoring y ranking de candidatos: calcular la verosimilitud de distintas respuestas o traducciones para seleccionar la mejor, aprovechando la distribución de siguiente token del modelo.
- Base para fine-tuning específico de dominio: partir de estos pesos cuantizados o del checkpoint bf16 original para ajustar tareas como clasificación de texto, extracción de entidades o resumen con datos propios.
- Evaluación de técnicas de cuantización: el repositorio incluye goldens y métricas de KL frente a fp32, lo que lo convierte en un banco de pruebas reproducible para comparar recetas de cuantización en MLX.
- Prototipado de pipelines multilingües: con 16 idiomas declarados, sirve para experimentos de completación y few-shot en idiomas distintos del inglés antes de invertir en modelos mayores.
- Investigación sobre eficiencia en Apple Silicon: medir latencia, throughput y memoria en chips M-series con una build documentada y con comparativa frente a la variante de 5 bits.

## Benchmarks y rendimiento

Calidad medida en un Apple M5 Pro con MLX 0.32.4 frente a referencias en float32 del checkpoint original (25 prompts de chat, tool-call y texto crudo; 5 prompts de texto crudo con 64 tokens de continuación greedy; wikitext-2 test con 16 secuencias de 2.048 tokens):

| Build | Goldens (25): top-1 final | Goldens (25): KL final | Wikitext-2 KL | Wikitext-2 PPL vs fp32 |
|---|---|---|---|---|
| bf16 (sin cuantizar, referencia) | 1,00 | 0,0005 | 0,0005 | +0,05 % |
| 5 bits | 0,88 | 0,0305 | 0,0146 | +1,36 % |
| mixed-5-6-8 (este repo) | 0,92 | 0,0182 | 0,0078 | +0,75 % |

La perplejidad fp32 de referencia en wikitext-2 es 10,588. La KL se calcula como KL(fp32 || build) en nats sobre el top-200 de tokens del modelo de referencia.

Rendimiento en Apple M5 Pro (24 GB), macOS 27.0, MLX 0.32.4, decodificación greedy, 256 tokens generados tras un prompt de 512 o 2.048 tokens, mediana de 3 ejecuciones:

| Build | Decode tok/s (512 ctx) | Decode tok/s (2048 ctx) | Prefill tok/s (prompt 2048) | Time to first token (2048) | Memoria pico (2048 ctx) |
|---|---|---|---|---|---|
| 5 bits | 178 | 173 | 6.300 | 327 ms | 2,13 GB |
| mixed-5-6-8 | 166 | 164 | 6.220 | 331 ms | 2,23 GB |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: 1,293 GB de pesos; memoria pico medida de 2,23 GB con contexto de 2.048 tokens en M5 Pro.
- GPU recomendadas: Apple Silicon con memoria unificada; medido en M5 Pro de 24 GB. No está pensado para GPU NVIDIA ni AMD, ya que depende de MLX.
- Cabe en equipos de consumo: sí, en cualquier Mac con chip Apple Silicon y al menos 8 GB de memoria unificada, aunque el autor solo ha medido en M5 Pro.
- Opciones de despliegue: mlx-vlm `main` (soporte oficial de LFM3 aún no liberado en octubre de 2026) y mlx-lm con la rama del PR ml-explore/mlx-lm#2016 (no fusionado). No hay soporte en vLLM, llama.cpp, Ollama ni TGI por el formato MLX.
- Latencia y throughput: 166 tok/s de decodificación con 512 tokens de contexto, 164 tok/s con 2.048, 6.220 tok/s de prefill y 331 ms hasta el primer token con un prompt de 2.048 tokens (M5 Pro).
- Diferencia entre mlx-vlm y mlx-lm: mismo argmax en el 99,4 % de las posiciones (mixed) sobre 512 posiciones de texto, con diferencia máxima de logits de 0,5.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-1.7B-Base-MLX-mixed-5-6-8 (este) | 1,73 B | 262.144 (validado ~2.000) | Mixta 5/6/8 bits, grupo 64 | LFM Open License v1.0 | MLX, comunidad |
| LiquidAI/LFM3-1.7B-MLX-5bit | 1,73 B | 262.144 | Uniforme 5 bits | LFM Open License v1.0 | MLX, oficial (modelo instruct) |
| alexwengg/LFM3-1.7B-Base-MLX-5bit | 1,73 B | 262.144 (validado ~2.000) | Uniforme 5 bits | LFM Open License v1.0 | MLX, comunidad |
| LiquidAI/LFM3-1.7B-Base | 1,73 B | 262.144 | bf16 | LFM Open License v1.0 | Transformers, oficial |

Frente a la build uniforme de 5 bits del mismo autor, esta versión mejora el top-1 en los goldens (0,92 frente a 0,88), reduce la KL (0,0182 frente a 0,0305) y baja el incremento de perplejidad en wikitext-2 (0,75 % frente a 1,36 %), a costa de un 7 % menos de velocidad de decodificación y 0,1 GB más de memoria pico. No se dispone de datos de benchmarks estándar para comparar con modelos de otros fabricantes del mismo tamaño.

## Limitaciones y advertencias

- No es un modelo instruct: no sigue instrucciones de chat ni se detiene por sí solo; requiere control explícito de `max_tokens` y criterios de parada.
- La cuantización altera la distribución de siguiente token; las continuaciones greedy divergen de fp32 tras unas decenas de tokens de media.
- La evaluación se limita a texto en inglés, prompts cortos de chat y tool-call, y wikitext-2; no hay validación sistemática en los otros 15 idiomas declarados.
- Solo se han probado contextos de hasta unos 2.000 tokens, pese a que la arquitectura soporta 262.144; el comportamiento en contextos largos no está verificado.
- Las mediciones de velocidad provienen de una única máquina (M5 Pro); el rendimiento en otros chips Apple será distinto.
- Riesgo de alucinación inherente a un modelo base de 1,7 B: no hay alineación ni filtros de seguridad específicos.
- Sesgos conocidos: no documentados en la información disponible; cabe esperar los del corpus de preentrenamiento original.
- Licencia LFM Open License v1.0: hay que revisar sus términos antes de uso comercial, ya que no es una licencia permisiva estándar.
- El código remoto (`auto_map` en `config.json`) puede requerir `trust_remote_code` al cargar con Transformers; MLX no ejecuta ese código.
- Dependencia de versiones concretas: mlx-vlm `main` (commit `230fc308`) y MLX 0.32.4; no hay soporte en versiones liberadas de mlx-vlm ni mlx-lm en octubre de 2026.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/alexwengg/LFM3-1.7B-Base-MLX-mixed-5-6-8
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B-Base
- Build hermana de 5 bits: https://huggingface.co/alexwengg/LFM3-1.7B-Base-MLX-5bit
- Build MLX oficial del instruct: https://huggingface.co/LiquidAI/LFM3-1.7B-MLX-5bit
- Repositorio mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- PR de soporte en mlx-lm: https://github.com/ml-explore/mlx-lm/pull/2016
- Licencia: https://huggingface.co/alexwengg/LFM3-1.7B-Base-MLX-mixed-5-6-8/blob/main/LICENSE

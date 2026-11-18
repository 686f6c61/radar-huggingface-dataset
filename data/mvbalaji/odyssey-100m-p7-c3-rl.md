# mvbalaji/ODYSSEY-100M-P7-C3-RL

## Resumen

ODYSSEY-100M-P7-C3-RL es un modelo de lenguaje causal de 100.248.960 parámetros desarrollado por Balaji Venkateswaran (usuario `mvbalaji`) como parte de la familia experimental ODYSSEY-100M. Se trata del brazo C3 de la fase 7 del proyecto: un ajuste mediante aprendizaje por refuerzo (RLOO) sobre el modelo ODYSSEY-100M-REASONING-SFT-V2, orientado específicamente a mejorar la aritmética y el razonamiento matemático elemental mediante recompensa por respuesta final exacta.

El modelo se entrenó desde cero (sin pesos de terceros) sobre un corpus de 5.000 millones de tokens y posteriormente se afinó con SFT y, en esta iteración, con 300 actualizaciones de RL en línea ejecutadas en una única RTX 4060 de 8 GB (0,40 GPU-hora, pico de 5,08 GB). La arquitectura y el tokenizador son idénticos a los de su modelo base; no incorpora cabezas adicionales ni mecanismos de decodificación especulativa.

Su relevancia es fundamentalmente metodológica y de investigación: documenta un experimento preregistrado con puertas de validación explícitas en el que, según el propio autor, ninguna rama superó los criterios (fase 7 = NO-GO). Los resultados publicados provienen del split de selección y están sujetos a optimismo de selección; el conjunto de confirmación nunca se abrió. No es un modelo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (implementación custom, no clase de `transformers`) |
| Parametros totales | 100.248.960 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens (posiciones superiores provocan error) |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors en el repo) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`), código PyTorch standalone (`modeling_odyssey.py`, `example.py`) |

## Arquitectura y entrenamiento

El modelo es un transformer causal decoder-only de 100M de parámetros con tokenizador propio, entrenado desde cero. La fase de preentrenamiento acumuló 5.000 millones de tokens (el checkpoint final de pretraining es ODYSSEY-100M-5B-BASE), con datos de FineWeb-Edu (sample-10BT), FineMath (finemath-4plus) y CodeParrot GitHub Code Clean. Sobre esa base se aplicó un SFT de 10 millones de tokens (fase 5, SFT-V1) y posteriormente un SFT calibrado por pasos de 2 millones de tokens (fase 6, SFT-V2), que constituye el punto de partida de este modelo.

El ajuste de esta iteración (fase 7, brazo C3) consiste en 300 actualizaciones on-policy de RLOO (REINFORCE Leave-One-Out con baseline de grupo, 8 muestras por prompt, sin normalización por desviación típica), con 16 prompts por actualización, LR 5e-6, penalización KL k3 contra V2 congelado (β = 0,05), temperatura 1,0, máximo de 96 tokens nuevos y semilla 20261201. La recompensa es la corrección exacta de la respuesta final verificada con aritmética de fracciones exactas; no hay recompensa a nivel de paso y las respuestas incorrectas nunca reciben recompensa. Los prompts son 6.000 generados localmente a partir de 8 familias con señal aprendible (operaciones simples, cadenas de 2 operaciones, composiciones, condicionales, booleanos, ordenación, álgebra y problemas verbales). El entrenamiento consumió 1.101.932 tokens generados y no se detectaron señales de *reward hacking* (longitud, repetición, diversidad de respuestas y KL estables). El formato de prompt es `### Instruction:\n{task}\n\n### Response:\n`, con las respuestas matemáticas terminando en `Final answer: X` seguido de EOS.

## Capacidades

- Generación de texto en inglés con formato instrucción-respuesta.
- Aritmética elemental y razonamiento matemático de uno o dos pasos, con salida en formato `Final answer: X`.
- Resolución de problemas verbales sencillos, condicionales, booleanos, ordenación y álgebra básica.
- Mejora medida en aritmética con formulaciones nunca vistas durante el entrenamiento (0,594 → 0,725 en el split de selección).
- Supresión parcial de hábitos erróneos del modelo base (segundo paso inventado: 0,29 → 0,08; sobrescrituras: 0,11 → 0,02).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso fiable.
- No dispone de modo *thinking*, visión ni audio.
- Multilingüe: no; solo inglés para lenguaje natural.

## Casos de uso

- Investigación sobre RL con recompensa verificable en modelos pequeños: el modelo sirve como artefacto reproducible para estudiar RLOO con verificación exacta en un presupuesto de 0,40 GPU-hora, útil para comparar metodologías de RL frente a SFT.
- Estudio de generalización a formulaciones novedosas: el interés documentado está en la brecha entre formulaciones entrenadas (0,925 en aritmética simple con redacción de fase 6) y no entrenadas (0,725), un caso concreto para analizar sobreajuste a plantillas.
- Reproducción de experimentos preregistrados: el diseño con puertas G1-G6 y su resultado NO-GO permite replicar el protocolo y analizar los fallos de diseño divulgados (G2 sin potencia estadística, G6 con composiciones de batch distintas).
- Docencia y divulgación sobre entrenamiento desde cero: con 100M de parámetros y 0,4 GB de repo, es viable ejecutarlo en portátiles con GPU modesta para ilustrar pipeline completo (pretraining, SFT, RL, verificación).
- Análisis de *reward hacking*: el autor reporta ausencia de señales en longitud, repetición, diversidad y KL; el modelo permite auditar esas métricas de forma independiente.
- Pruebas de infraestructura de inferencia custom: al no ser una clase de `transformers`, sirve para validar cargadores propios basados en `safetensors` + `tokenizers` + `huggingface_hub`.
- No es adecuado para atención al cliente, generación de código en producción, extracción de datos factuales ni ningún uso que requiera respuestas correctas.

## Benchmarks y rendimiento

Resultados publicados por el autor en el split de selección de fase 7 (bootstrap agrupado por problema, comparación emparejada contra V2):

| Medida | V2 | Este modelo |
|---|---:|---:|
| PRIMARIA: aritmética con redacciones nunca entrenadas (360) | 0,594 | 0,725 (+0,131 [+0,073, +0,186]) |
| Aritmética simple, redacción de fase 6 (120) | 0,933 | 0,925 |
| Comparación por pares | — | +0,072 [+0,013, +0,129] vs C1 |
| Δ NLL dev general / matemáticas / código | — | +0,008 / +0,008 / +0,007 |

Desglose adicional reportado: historias 0,31 → 0,74; problemas verbales +0,27; lógica no vista +0,074; comparaciones caen a 0,00 en redacciones reservadas; cadenas de 3 operaciones permanecen cerca de 0. No se han publicado resultados de MMLU, HumanEval ni GSM8K estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: ~0,4 GB de pesos más activaciones; en FP16/BF16: ~0,2 GB. Cabe holgadamente en cualquier GPU consumer.
- Entrenamiento documentado: RTX 4060 de 8 GB, pico de 5,08 GB, 0,40 GPU-hora para las 300 actualizaciones de RL.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060/4060, RTX 4090, A100 o H100 son sobredimensionadas para este tamaño.
- Despliegue: no compatible con vLLM, TGI, llama.cpp ni Ollama de forma nativa, al no ser una arquitectura de `transformers` ni disponer de pesos GGUF. Requiere el cargador incluido (`example.py`, `modeling_odyssey.py`) con `torch`, `safetensors`, `tokenizers` y `huggingface_hub`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---:|---:|---|---|---|
| ODYSSEY-100M-P7-C3-RL | 100,2M | 1.024 | Apache 2.0 | HF, repo 0,4 GB | Experimental, NO-GO en puertas preregistradas |
| ODYSSEY-100M-REASONING-SFT-V2 | 100,2M | 1.024 | Apache 2.0 | HF | Mejor modelo registrado de la familia según el autor |
| ODYSSEY-100M-P7-C1-DIVERSE-SFT | 100,2M | 1.024 | Apache 2.0 | HF | Brazo experimental con SFT diverso en paráfrasis |
| ODYSSEY-100M-P7-C2-MATCHED-SFT | 100,2M | 1.024 | Apache 2.0 | HF | Brazo experimental de control SFT emparejado |

No se dispone de comparación con modelos de otros autores (por ejemplo, de la familia SmolLM o TinyLlama) en la información proporcionada.

## Limitaciones y advertencias

- Artefacto de investigación de 100M de parámetros: alucina hechos con seguridad y entra en bucles con decodificación greedy en texto libre.
- Mayoritariamente incorrecto en código y en aritmética más allá de casos simples; cadenas de 3 operaciones cerca de 0 y comparaciones a 0,00 en redacciones reservadas.
- Sin ajuste de seguridad ni RLHF: puede reproducir texto dañino o sesgado procedente de datos web.
- No debe usarse en contextos que exijan respuestas correctas (médico, legal, financiero, seguridad o factual).
- Solo inglés para lenguaje natural; contexto máximo de 1.024 tokens, con error si se superan posiciones.
- Resultados del split de selección con optimismo de selección; el conjunto de confirmación nunca se abrió y la fase 7 resultó NO-GO.
- Deriva sistemática de NLL (+0,008) respecto a V2, lo que sugiere un ligero deterioro en modelado de lenguaje general.
- Fallos de diseño divulgados en las puertas G2 (sin potencia estadística) y G6 (composiciones de batch distintas); el autor no relajó los criterios.
- Licencia Apache 2.0 permite uso comercial de pesos y código, pero las limitaciones técnicas hacen inviable ese uso en la práctica. Se deben respetar las atribuciones de FineWeb-Edu y FineMath (ODC-By).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mvbalaji/ODYSSEY-100M-P7-C3-RL
- Modelo base (SFT-V2): https://huggingface.co/mvbalaji/ODYSSEY-100M-REASONING-SFT-V2
- Preentrenamiento 5B: https://huggingface.co/mvbalaji/ODYSSEY-100M-5B-BASE
- Preentrenamiento 2B: https://huggingface.co/mvbalaji/ODYSSEY-100M-2B-BASE
- SFT V1: https://huggingface.co/mvbalaji/ODYSSEY-100M-REASONING-SFT-V1
- Brazo C1 (SFT diverso): https://huggingface.co/mvbalaji/ODYSSEY-100M-P7-C1-DIVERSE-SFT
- Brazo C2 (SFT emparejado): https://huggingface.co/mvbalaji/ODYSSEY-100M-P7-C2-MATCHED-SFT
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset FineMath: https://huggingface.co/datasets/HuggingFaceTB/finemath
- Dataset CodeParrot GitHub Code Clean: https://huggingface.co/datasets/codeparrot/github-code-clean
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
- Dataset MBPP: https://huggingface.co/datasets/google-research-datasets/mbpp
- Paper, blog o repositorio del proyecto: no disponible en la información proporcionada (el autor cita informes como `PHASE7_FINAL_REPORT.md` alojados en el repositorio fuente, no incluido en la subida).

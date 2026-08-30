# SlayerLab/GoLLeM-110M-PL-v3

## Resumen

GoLLeM-110M-PL-v3 es un modelo de lenguaje en polaco de 110 millones de parámetros, desarrollado por SlayerLab (Arkadiusz Słota), que sigue la arquitectura GPT-2 (decoder-only). Es la tercera iteración de la serie GoLLeM y se entrena desde cero sobre un corpus polaco de aproximadamente 2 000 millones de tokens, con dos épocas completas (unos 4 000 millones de tokens vistos). El modelo es de tipo base (completion), es decir, continúa texto y no está diseñado para mantener diálogos ni responder preguntas de forma instructiva.

La principal novedad frente a la versión anterior (v2) es la corrección del infraentrenamiento: v3 añade una segunda época sobre el mismo corpus limpio, lo que duplica la exposición de tokens por parámetro (de ~18 a ~36). Según el autor, esta corrección produce mejoras medibles en 7 de 9 tareas del benchmark polaco OpenPL, con un incremento del compuesto de 2,99 puntos. El modelo se entrenó en una única GPU AMD Radeon RX 7900 XTX (24 GB) usando ROCm/WSL2, con una duración aproximada de 9 horas.

GoLLeM-110M-PL-v3 se distribuye bajo licencia CC-BY-SA-4.0 y está pensado para investigadores y desarrolladores que necesiten un modelo pequeño y eficiente para tareas de generación de texto en polaco, especialmente cuando se requiere una alternativa ligera a modelos de mayor tamaño. Su ventana de contexto es de 512 tokens, lo que limita su uso a aplicaciones de texto corto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (decoder-only), 12 capas, 12 cabezas, d_model 768 |
| Parametros totales | 110 025 216 (110M), weight-tied |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (pesos originales en bf16) |
| Idiomas soportados | polaco |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT-2 original: un transformer decoder-only con 12 capas, 12 cabezas de atención y dimensión de modelo 768. Los parámetros están compartidos entre la capa de embedding y la de salida (weight-tied), lo que reduce el número total de parámetros. El tokenizador es un BPE específico para polaco (dynaword-32k) con un vocabulario de 32 000 entradas, donde el token especial `<|endoftext|>` tiene el ID 0.

El entrenamiento se realizó en dos fases: una primera época sobre un corpus de ~2 000 millones de tokens (compuesto por un 58 % de fuentes curadas como Wikipedia, Wikisource, Wolne Lektury, 1000 Novels y eltec, y un 42 % de datos web limpios de HPLT v3; sin contenido legal) y una segunda época de continuación de pretraining sobre el mismo corpus, partiendo del checkpoint de v2. Esto supone un total de ~4 000 millones de tokens vistos. Se utilizó bf16, optimizador AdamW, programación de tasa de aprendizaje coseno con warmup, weight decay de 0.1, batch size 64 (con grad-accum de 4) y una tasa de aprendizaje máxima de 3e-4. El entrenamiento se ejecutó en una AMD Radeon RX 7900 XTX (gfx1100) bajo ROCm/WSL2 durante aproximadamente 9 horas.

## Capacidades

- Generación de texto en polaco: el modelo es capaz de continuar un fragmento de texto de forma coherente y gramaticalmente correcta, mostrando fluidez en la forma del idioma.
- Razonamiento básico y conocimiento factual limitado: al ser un modelo de 110M, puede producir respuestas plausibles en tareas de completación, pero con frecuentes alucinaciones en datos concretos.
- Sin soporte de tool calling ni function calling: al ser un modelo base sin fine-tuning instructivo, no implementa llamadas a herramientas.
- Sin capacidades de agente ni multi-step reasoning: su pequeño tamaño y contexto de 512 tokens impiden tareas complejas de razonamiento encadenado.
- Multilingüe: no, está entrenado únicamente en polaco.
- Sin modo thinking, visión ni audio: es exclusivamente texto.

## Casos de uso

- Generación de texto creativo en polaco: puede usarse para escribir cuentos, poemas o artículos breves, proporcionando un prompt inicial y dejando que el modelo continúe. Adecuado por su fluidez gramatical y bajo coste de inferencia.
- Autocompletado en editores de texto: integrable en herramientas de escritura para sugerir continuaciones de frases o párrafos en polaco, gracias a su naturaleza de completación y su rapidez en CPU o GPU modesta.
- Prototipado de modelos de lenguaje: sirve como base para experimentos de fine-tuning, por ejemplo, para estudiar técnicas de adaptación a dominios específicos (legal, médico, etc.) sin necesidad de grandes recursos.
- Evaluación de técnicas de entrenamiento: al ser un modelo pequeño y con un proceso de entrenamiento documentado, es útil para reproducir estudios sobre curriculum learning, regularización o efectos de múltiples épocas.
- Generación de datos sintéticos de texto en polaco: puede producir corpus artificiales para entrenar otros modelos más pequeños o para aumentar datos en tareas de PLN (procesamiento de lenguaje natural), siempre con control de calidad.
- Educación e investigación: como ejemplo de modelo base entrenado desde cero en un idioma de bajos recursos, es útil para enseñar arquitecturas transformer y pipelines de entrenamiento, y para comparar el efecto de la exposición a datos.

## Benchmarks y rendimiento

El autor proporciona resultados de evaluación según el protocolo OpenPL (polish4, 0-shot) y una reproducción propia del método domain-PMI de OrisTeam. La tabla siguiente compara v2 y v3 bajo el mismo scorer:

| Tarea | v2 | v3 | Δ |
|---|--:|--:|--:|
| PolEmo2-in | 16,2 | 18,0 | +1,8 |
| PolEmo2-out | 1,8* | 10,7* | +8,9 |
| 8tags | 41,3 | 41,2 | −0,1 |
| Belebele | 23,0 | 24,0 | +1,0 |
| CBD (hate) | 14,6 | 12,6 | −2,0 |
| DYK | 23,4 | 28,3 | +4,9 |
| KLEJ-NER | 17,5 | 18,2 | +0,7 |
| PPC | 20,0* | 25,7* | +5,7 |
| PSC | 38,1 | 44,2 | +6,0 |
| **Sygnał-6** | **21,6** | **24,1** | **+2,55** |
| **kompozyt-9** | **21,8** | **24,8** | **+2,99** |

\* Las tareas PolEmo2-out y PPC muestran valores que se desvían de la tabla oficial de OrisTeam; el autor indica que su reproducción domain-PMI presenta un comportamiento conocido de sesgo en estas tareas, por lo que las deltas deben interpretarse con cautela.

No se han publicado resultados comparativos con otros modelos de tamaño similar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 110M con pesos en bf16, ocupa aproximadamente 220 MB en memoria. Con cuantización a int8 o int4, el requisito baja a ~110 MB o ~55 MB respectivamente.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente. Una RTX 3060, RTX 4090, o una AMD RX 7900 XTX (la usada en entrenamiento) son más que adecuadas. También puede ejecutarse en CPU con razonable velocidad.
- Sí cabe en GPUs de consumo: cualquier tarjeta moderna, e incluso en Raspberry Pi con cuantización extrema.
- Opciones de despliegue: transformers (pipeline de generación), text-generation-inference (TGI), vLLM, llama.cpp, Ollama, o servidores ligeros en CPU.
- Latencia y throughput estimados: no se han publicado mediciones oficiales. En una GPU moderna se esperan cientos de tokens por segundo; en CPU, decenas.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos polacos de tamaño similar en la información proporcionada. Se puede mencionar que la serie GoLLeM compite conceptualmente con otros modelos base polacos pequeños (por ejemplo, los del benchmark OrisTeam Polish-SLM-Benchmark), pero no hay resultados oficiales que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Tamaño reducido: 110M de parámetros implica que el modelo confabula hechos concretos y tiene un conocimiento factual muy limitado. No es adecuado para tareas que requieran precisión.
- Modelo base, no chat: no debe usarse para responder preguntas directas; está diseñado para completar textos. Para conversación se necesita un fine-tuning instructivo (SFT/RLHF).
- Contexto corto: la ventana de 512 tokens restringe el uso a textos breves y dificulta tareas que requieren memoria a largo plazo.
- Sin filtros de seguridad: el modelo no incluye mecanismos de moderación de salida, por lo que puede generar contenido ofensivo o inapropiado.
- Regresión en detección de discurso de odio: en la evaluación, v3 empeora notablemente en la tarea CBD (mueva nienawiści, discurso de odio) respecto a v2, pasando de 14,6 a 12,6. Para aplicaciones sensibles a este aspecto, se recomienda considerar v2.
- Datos de entrenamiento con PII eliminados: los datos personales fueron reemplazados por etiquetas; cualquier nombre o dirección generado es una confabulación, no un dato real.
- Licencia share-alike: al usar el modelo o sus derivados, se deben cumplir las condiciones de CC-BY-SA-4.0, incluyendo atribución a las fuentes originales (Wikimedia Foundation, Wolne Lektury, autores de 1000 Novels, HPLT/CLARIN-PL) y compartir bajo la misma licencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SlayerLab/GoLLeM-110M-PL-v3
- Benchmark Polish-SLM-Benchmark (OrisTeam): https://huggingface.co/spaces/OrisTeam/Polish-SLM-Benchmark
- Repositorio gollem-pl (KateMajzel): https://github.com/KateMajzel/gollem-pl
- Versión SFT-merged (SlayerLab): https://huggingface.co/SlayerLab/goLLeM-110M-PL-SFT-merged
- Versión v1 (Maggio33): https://huggingface.co/Maggio33/GoLLeM-110M-PL
- Página de despliegue en FriendliAI (para v2): https://friendli.ai/models/SlayerLab/GoLLeM-110M-PL-v2

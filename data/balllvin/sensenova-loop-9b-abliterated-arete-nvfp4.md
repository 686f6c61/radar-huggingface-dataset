# balllvin/SenseNova-Loop-9B-abliterated-arete-NVFP4

## Resumen

SenseNova-Loop-9B-abliterated-arete-NVFP4 es una cuantización NVFP4 del modelo SenseNova-Loop-9B de SenseNova, publicada por el usuario balllvin. El modelo base es un transformer de 9.000 millones de parámetros orientado a generación de texto, con licencia Apache-2.0 y acceso restringido (gated) en su repositorio original. Esta versión aplica cuantización de pesos a 4 bits (W4A16) en todas las capas lineales de atención y MLP del modelo de lenguaje, manteniendo en bf16 los embeddings, la cabeza LM, las normas, los routers mHC y la torre de visión.

La particularidad de esta build es que combina la cuantización NVFP4 con un ajuste fino supervisado (SFT) sobre un subconjunto estricto de NousResearch/arete-data-pairs, denominado "Arete" en la model card. Según los datos del autor, este SFT eleva el rendimiento en MMLU del 43,0% al 54,0% respecto a la build NVFP4 base, manteniendo idénticos los ratios de rechazo en el conjunto de evaluación JailbreakBench+AdvBench.

Es relevante ahora porque demuestra un pipeline de cuantización de 4 bits con escalas por bloque (E4M3 cada 16 columnas de entrada y una escala fp32 por matriz) aplicado a un modelo de 9B con capacidades multimodales, con decodificación exacta a bf16 y un script de carga incluido. El intento de abliteración no tuvo éxito según el autor, por lo que el modelo conserva el comportamiento de rechazo del base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base SenseNova-Loop-9B, con torre de visión y routers mHC) |
| Parametros totales | 9 000 millones (9B, según nombre del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 W4A16 (pesos E2M1 de 4 bits, escala E4M3 por bloque de 16 columnas, escala fp32 por matriz); resto de componentes en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 14,8 GB), con script `load_nvfp4.py` para carga empaquetada o decodificada a bf16 |

## Arquitectura y entrenamiento

El modelo base SenseNova-Loop-9B es un transformer de 9B parámetros con componentes multimodales (torre de visión) y routers mHC en fp32. Esta build cuantiza únicamente las capas lineales de atención y MLP del modelo de lenguaje a NVFP4 W4A16, dejando en bf16 los embeddings, la cabeza LM, las normas, los routers mHC y la torre de visión. La cuantización emplea el formato NVFP4: pesos E2M1 de 4 bits, una escala de bloque E4M3 por cada 16 columnas de entrada y una escala de tensor fp32 por matriz. La decodificación a bf16 es exacta según el autor.

El entrenamiento posterior a la cuantización (QAD, quantization-aware distillation o ajuste equivalente) se realizó sobre un corte estricto de NousResearch/arete-data-pairs, denominado ronda Arete. El pipeline se ejecutó con BrainSpa (`packages/brainspa_arc` y `packages/brainspa_snloop`) en una única VM spot con RTX PRO 6000. El autor indica que se intentó la abliteración en esta build con fuerzas 0,5/0,6/0,7 en las capas 24/28, sin reducir los rechazos (16 de 16 rechazos de validación se mantuvieron) y que la fuerza 1,0 destruyó el modelo; por ello el SFT Arete se aplicó después, según la cadena especificada. No se detallan el número de tokens de entrenamiento ni la composición completa del dataset.

## Capacidades

- Generación de texto y razonamiento: el modelo base es de tipo text-generation; la model card reporta resultados en MMLU (54,0% en esta build).
- Capacidades multimodales: el modelo base incluye torre de visión, que se mantiene en bf16 en esta build.
- Modo thinking: la evaluación de rechazos se realizó con "thinking off", lo que implica que el modelo base dispone de un modo de razonamiento activable.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Comportamiento de rechazo: 95 de 99 prompts dañinos rechazados y 60 de 100 prompts benignos rechazados en el conjunto JailbreakBench+AdvBench, con decodificación greedy de 96 tokens y thinking desactivado.

## Casos de uso

- Evaluación de pipelines de cuantización NVFP4: el repositorio incluye `load_nvfp4.py` con modos `packed=True` (4 bits en reposo, decodificación por forward) y decodificado a bf16, lo que permite comparar fidelidad de cuantización frente al modelo base en tareas de generación.
- Investigación sobre alineación y rechazo: los datos de la model card documentan un intento fallido de abliteración y el efecto del SFT Arete sobre los ratios de rechazo, útiles para estudiar la robustez de las negativas ante modificaciones de pesos.
- Despliegue con requisitos de memoria reducidos: al almacenar los pesos lineales a 4 bits, el modelo puede cargarse en GPUs con menos VRAM que la build bf16 completa, usando el modo empaquetado y decodificando por forward.
- Generación de texto con contexto multimodal: la torre de visión en bf16 permite tareas que combinen imagen y texto, siempre que el modelo base las soporte (no se detalla la interfaz en la información disponible).
- Reproducción de experimentos de ajuste fino: el pipeline BrainSpa y la referencia al dataset arete-data-pairs permiten replicar la ronda Arete sobre otras cuantizaciones del mismo modelo base.
- Benchmarking de calidad tras cuantización: la model card proporciona métricas concretas (MMLU, WikiText NLL, ratios de rechazo) que sirven como línea base para comparar futuras builds NVFP4 del mismo modelo.

## Benchmarks y rendimiento

| Build | Rechazados dañinos (de 99) | Rechazados benignos (de 100) | MMLU | WikiText NLL |
|---|---:|---:|---:|---:|
| NVFP4 base (QAD) | 95 | 60 | 43,0% | 2,7560 |
| + Arete | 95 | 60 | 54,0% | 2,7005 |

Los prompts dañinos y benignos corresponden al conjunto sellado JailbreakBench+AdvBench, con decodificación greedy de 96 tokens y thinking desactivado. MMLU es un corte fijo con respuestas de letra. WikiText NLL es la media sobre 24 ventanas de 1.024 tokens.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 14,8 GB; en modo empaquetado (`packed=True`) los pesos lineales se almacenan a 4 bits y se decodifican por forward, reduciendo la huella en reposo; en modo decodificado a bf16 se requiere aproximadamente el equivalente a un modelo de 9B en bf16 (unos 18 GB solo de pesos, más activaciones y caché KV).
- GPU recomendadas: el autor usó una RTX PRO 6000 para el pipeline de cuantización y ajuste; para inferencia, una GPU con al menos 24 GB de VRAM es un punto de partida razonable en modo empaquetado, aunque no se publican medidas de consumo real.
- Cabe en GPU de consumo: probablemente en RTX 4090 (24 GB) en modo empaquetado con contexto moderado; no confirmado por el autor.
- Opciones de despliegue: transformers con el script `load_nvfp4.py` incluido; no se mencionan vLLM, llama.cpp, Ollama ni TGI, y el formato NVFP4 empaquetado no es compatible directamente con esos motores sin conversión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SenseNova-Loop-9B-abliterated-arete-NVFP4 | 9B | no disponible | 54,0% | Apache-2.0 | Hugging Face (0 descargas) |
| SenseNova-Loop-9B (base) | 9B | no disponible | no disponible | Apache-2.0 (gated) | Hugging Face |
| NVFP4 base (QAD) del mismo pipeline | 9B | no disponible | 43,0% | Apache-2.0 | Variante interna del pipeline |

No se dispone de datos de benchmarks de modelos comparables de otros autores en la información proporcionada.

## Limitaciones y advertencias

- El intento de abliteración no funcionó según el autor: el modelo mantiene 95 de 99 rechazos en prompts dañinos, por lo que no debe esperarse un comportamiento menos restrictivo que el base.
- El ratio de rechazo en prompts benignos es alto (60 de 100), lo que puede provocar negativas indebidas en aplicaciones legítimas.
- MMLU del 54,0% es un resultado modesto; no se han publicado benchmarks de código, matemáticas ni otras tareas.
- No se detallan los idiomas soportados; el rendimiento fuera del inglés es desconocido.
- La licencia Apache-2.0 del modelo base está marcada como gated en su repositorio original; conviene verificar las condiciones de uso del base antes de un despliegue comercial.
- El formato NVFP4 empaquetado requiere el script de carga incluido; la compatibilidad con motores de inferencia estándar no está garantizada.
- El repositorio tiene 0 descargas y 0 likes, sin validación externa de la comunidad.
- No se especifican la longitud de contexto ni los datos de entrenamiento (tokens, composición), lo que limita la evaluación de riesgos de alucinación y sesgos.

## Enlaces

- Hugging Face: https://huggingface.co/balllvin/SenseNova-Loop-9B-abliterated-arete-NVFP4
- Modelo base: https://huggingface.co/sensenova/SenseNova-Loop-9B
- Dataset de ajuste: NousResearch/arete-data-pairs (referenciado en la model card, sin URL directa en la información disponible)

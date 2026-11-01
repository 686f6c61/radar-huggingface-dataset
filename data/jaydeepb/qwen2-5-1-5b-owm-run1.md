# jaydeepb/qwen2.5-1.5b-owm-run1

## Resumen

qwen2.5-1.5b-owm-run1 es un modelo de generación de texto creado por el usuario jaydeepb en Hugging Face. Se trata de un ajuste fino (fine-tuning) de Qwen2.5-1.5B, el modelo base de Alibaba de 1.500 millones de parámetros, entrenado durante una época sobre una muestra de 1 millón de secuencias de 128 tokens procedentes del dataset OpenWebMath, un corpus de contenido matemático extraído de la web.

El propósito de este modelo no es servir como asistente general, sino actuar como sujeto experimental en un estudio sobre memorización: a partir de este "run1" se extrajeron etiquetas de memorización extraíble (con k=50, l=50 y decodificación greedy) que se emplean para entrenar un clasificador que predice memorización. El modelo "run2" asociado, ajustado sobre una muestra disjunta de 1 millón de secuencias, proporciona el conjunto de evaluación fresco.

Su relevancia es principalmente investigadora: permite estudiar qué secuencias memoriza un modelo pequeño durante el fine-tuning, un tema clave para la privacidad de datos, la extracción de datos de entrenamiento y la regulación de modelos. Con 1.543.714.304 parámetros (dato real de safetensors), licencia Apache 2.0 y formato safetensors, es fácilmente reproducible en hardware modesto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen2 (transformer decoder, basado en la familia Qwen2.5) |
| Parámetros totales | 1.543.714.304 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la base Qwen2.5-1.5B suele publicitarse con 32.768 tokens, pero no consta en la información proporcionada) |
| Tipos de cuantización | no disponible (repo en safetensors de 3,1 GB) |
| Idiomas soportados | no disponible (dataset de entrenamiento en inglés, OpenWebMath) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Qwen2 de Qwen/Qwen2.5-1.5B: un transformer decoder denso (no MoE) con las mejoras estándar de la familia Qwen2.5, como RoPE y GQA (aunque la ficha original no detalla la configuración exacta). Los pesos totales publicados en safetensors suman 1.543.714.304 parámetros, coherente con la variante 1.5B de la familia.

El entrenamiento consistió en una única época de fine-tuning sobre una muestra de 1 millón de secuencias de 128 tokens extraídas de OpenWebMath (open-web-math/open-web-math), un corpus de páginas web con contenido matemático filtrado y procesado. Los hiperparámetros publicados son: longitud de secuencia 128, learning rate 5e-5 con planificación coseno y semilla 42. No consta el uso de RLHF ni DPO: se trata de un fine-tuning de preentrenamiento continuo sobre texto matemático, sin alineación conversacional adicional.

La innovación del proyecto no está en la arquitectura sino en la metodología: sobre este modelo run1 se computaron etiquetas de memorización extraíble mediante decodificación greedy con k=50 y l=50, que sirven como ground truth para entrenar un clasificador de memorización. El run2, entrenado sobre una muestra disjunta, actúa como evaluación held-out para medir si la memorización es transferible entre muestras del mismo corpus.

## Capacidades

- Generación de texto continuo estilo OpenWebMath: el modelo está especializado en reproducir y continuar texto matemático web, no en seguir instrucciones.
- Completación de contenido matemático: dada una secuencia de 128 tokens de texto matemático web, puede continuarla con estilo coherente al corpus.
- Memorización medible: su valor principal es experimental; permite extraer secuencias memorizadas del corpus de fine-tuning mediante decodificación greedy (k=50, l=50).
- No está alineado para chat: aunque la etiqueta "conversational" aparece en los metadatos de Hugging Face, la model card no documenta entrenamiento con plantillas de chat ni RLHF/DPO.
- Tool calling, agentes y razonamiento multi-paso: no disponibles, no documentados en la model card.
- Capacidades multilingües: no disponibles; el corpus de fine-tuning (OpenWebMath) es predominantemente en inglés.
- Visión, audio u otras modalidades: no disponibles, es un modelo de texto.

## Casos de uso

- Investigación en memorización de LLMs: es su caso de uso principal. Los investigadores pueden usar run1 junto a run2 para estudiar qué fracciones del corpus son extraíbles y entrenar clasificadores que predigan memorización antes del entrenamiento.
- Estudios de privacidad y extracción de datos: permite replicar experimentos de membership inference y ataques de extracción sobre un modelo pequeño y barato de ejecutar.
- Benchmarking de métodos de mitigación: al ser un modelo pequeño con un fine-tuning documentado y reproducible (semilla 42, LR 5e-5, una época), sirve como banco de pruebas para técnicas de unlearning o regularización contra memorización.
- Análisis de OpenWebMath: permite estudiar propiedades del corpus (duplicación, redundancia, fórmulas repetidas) midiendo qué secuencias el modelo llega a memorizar.
- Docencia y formación: por su tamaño (1,5B) y licencia Apache 2.0, es adecuado para prácticas de laboratorio sobre fine-tuning y evaluación de memorización sin necesidad de GPUs de gama alta.
- Punto de partida para fine-tuning adicional: puede usarse como base para experimentos propios sobre texto matemático, aunque el modelo base Qwen2.5-1.5B suele ser mejor punto de partida para usos generales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, GSM8K, HumanEval ni ninguna otra evaluación estándar, ni comparativas con el modelo base. Dado que el objetivo del fine-tuning es un estudio de memorización y no la mejora de capacidades, no debe esperarse que supere a Qwen2.5-1.5B en benchmarks generales; de hecho, el fine-tuning sobre secuencias de 128 tokens de una época podría degradar las capacidades generales del modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 3,1 GB solo de pesos, más overhead de activaciones y KV cache; en la práctica, entre 4 y 6 GB de VRAM son suficientes para inferencia cómoda.
- VRAM estimada para cuantización INT8/INT4: alrededor de 1,6-2,5 GB (INT8) y ~1 GB (INT4), aunque no se publican pesos cuantizados oficiales en el repo.
- GPUs recomendadas: cualquier GPU de consumo con 6 GB o más de VRAM, como la RTX 3060, RTX 4060 Ti o superior. No se necesita hardware de datacenter (A100/H100) para inferencia.
- Consumer GPUs: sí, cabe sin problemas en GPUs de consumo; incluso portátiles con GPUs modestas pueden ejecutarlo.
- Opciones de despliegue: transformers (librería nativa declarada en la model card), vLLM, llama.cpp (tras conversión a GGUF por el usuario, no se distribuye en ese formato), Ollama (igualmente tras conversión) y TGI. El repo está marcado como compatible con text-generation-inference y endpoints.
- Latencia y throughput: no disponibles; al ser un modelo de 1,5B en GPU de consumo, cabe esperar decenas de tokens por segundo, pero no hay medidas publicadas.
- Fine-tuning o reentrenamiento: con 1,5B de parámetros, es viable fine-tuning con LoRA/QLoRA en una GPU de 12-24 GB y full fine-tuning en GPUs de 24 GB o más.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Propósito |
|---|---|---|---|---|
| jaydeepb/qwen2.5-1.5b-owm-run1 | 1.543.714.304 | no disponible | Apache 2.0 | Investigación en memorización (fine-tuning sobre OpenWebMath) |
| Qwen/Qwen2.5-1.5B (base) | ~1,5B | 32.768 tokens (según ficha oficial de Qwen) | Apache 2.0 (Qwen2.5-1.5B) / licencia propia de Qwen según variante | Modelo base general, preentrenado a gran escala |
| Qwen/Qwen2.5-1.5B-Instruct | ~1,5B | 32.768 tokens (según ficha oficial de Qwen) | Apache 2.0 (Qwen2.5-1.5B-Instruct) | Asistente alineado con instrucciones y chat |

Nota: los datos de contexto y licencia de los modelos Qwen oficiales proceden de las fichas públicas de Qwen en Hugging Face, no de la información proporcionada para este repo. Para tareas de producción conversacional, Qwen2.5-1.5B-Instruct es la alternativa adecuada; para estudios de memorización, este run1 es el modelo apropiado al ser parte de un par experimental con run2.

## Limitaciones y advertencias

- No es un modelo de instrucciones: no ha recibido alineación conversacional documentada, por lo que producirá respuestas pobres en escenarios de chat o seguimiento de instrucciones.
- Riesgo elevado de memorización por diseño: el modelo puede reproducir literalmente fragmentos de OpenWebMath; esto es precisamente el objeto de estudio, pero implica riesgo de emitir texto de terceros sin atribución.
- Riesgo de alucinación: al ser un fine-tuning breve sobre texto matemático web sin RLHF, puede generar contenido matemático incorrecto con apariencia plausible.
- Contexto corto de entrenamiento: fue entrenado con secuencias de 128 tokens, lo que puede degradar su comportamiento con contextos largos respecto al modelo base.
- Idioma: el corpus de fine-tuning es en inglés; el rendimiento en castellano u otras lenguas no está documentado y probablemente provenga solo del preentrenamiento base.
- Licencia: Apache 2.0 permite uso comercial, pero los datos de entrenamiento (OpenWebMath) proceden de la web y pueden contener contenido con derechos de autor; conviene revisar los términos del dataset para usos sensibles.
- Documentación escasa: la model card es mínima; no hay benchmarks, ni detalles de configuración de arquitectura, ni evaluaciones de seguridad o sesgos.
- Sesgos: hereda los sesgos de Qwen2.5-1.5B y de OpenWebMath (contenido matemático de foros y webs en inglés); no se ha realizado ninguna auditoría documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jaydeepb/qwen2.5-1.5b-owm-run1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Dataset de entrenamiento: https://huggingface.co/datasets/open-web-math/open-web-math
- Modelo run2 asociado (evaluación held-out): no disponible (no se proporciona URL directa en la información; puede buscarse en el perfil del autor: https://huggingface.co/jaydeepb)

# cooler8/yejin-korean-8b-v3-cpt2s20000-distill-qwen36-mixK31-r128-soup5-nothink-v2

## Resumen

Yejin Korean 8B v3 (variante cpt2s20000 + distill Qwen3.6-27B mixK3.1 r128 soup5 nothink-v2) es un modelo de lenguaje de 7.241.740.288 parámetros orientado a la generación de texto conversacional en coreano, desarrollado por el usuario cooler8 sobre su propio modelo base Yejin Korean 8B v3, entrenado desde cero y sometido a dos fases de preentrenamiento continuado sobre datos públicos coreanos. La arquitectura declarada en los metadatos es Qwen3, con pesos en formato safetensors y licencia Apache 2.0.

El modelo resuelve el problema de la instrucción en coreano de alta calidad mediante una combinación de destilación desde Qwen3.6-27B (solo a nivel de secuencia, sin pesos ni logits del profesor) y un *model soup* de cuatro LoRA de rango 128 entrenados con distintos órdenes de mezcla de datos. El resultado es un checkpoint de aproximadamente 8B parámetros que prioriza el razonamiento multi-paso y la comprensión lectora en coreano, con un formato de respuesta "Answer-First + Deep Chain-of-Thought + Answer-Confirm".

Es relevante para quienes necesitan un modelo abierto, ligero y con licencia permisiva para tareas de instrucción en coreano, sin depender de modelos propietarios. La información pública disponible es escasa: no se han publicado benchmarks, no se detalla la longitud de contexto y el modelo tiene cero descargas y cero likes en el momento de la ficha, lo que indica un lanzamiento muy reciente y sin validación comunitaria.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3 (transformer decoder-only, según tag `qwen3`) |
| Parámetros totales | 7.241.740.288 (~7,24B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos publicados en safetensors; se desconoce si hay GGUF) |
| Idiomas soportados | Coreano (`ko`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 29,0 GB) |

## Arquitectura y entrenamiento

El modelo parte de Yejin Korean 8B v3 base (`cooler8/yejin-korean-8b-v3-base`), preentrenado desde cero por el autor y sometido a dos etapas de preentrenamiento continuado sobre datos públicos coreanos: 6.000 pasos en la etapa 1 y 20.000 pasos en la etapa 2, que incluye texto coreano de FinePDFs parcialmente extraído mediante el modelo OCR RolmOCR. Sobre esa base se aplicó el "chat vector" del modelo SFT propio del autor.

El ajuste final consiste en cuatro LoRA de rango 128 (alpha 256, learning rate 2e-4) entrenados sobre el conjunto mixK3.1 (90.275 muestras), cada uno con un orden de mezcla distinto (semillas 0, 7, 11 y 13), y combinados mediante un *model soup* ponderado (2x semilla 0 + 1x semilla 7 + 1x semilla 11 + 1x semilla 13). El dataset mixK3.1 elimina plantillas de atajo de una sola línea y aplica el formato Answer-First + Deep Chain-of-Thought + Answer-Confirm en ítems de conocimiento, comprensión lectora y razonamiento narrativo multi-paso. Las soluciones cortas en coreano fueron generadas por Qwen/Qwen3.6-27B bajo Apache-2.0 para preguntas del generador de puzles propio, KMMLU train, exámenes escolares de AI Hub y conjuntos de conocimiento y comprensión lectora de AI Hub; solo se conservaron las soluciones que alcanzaban la respuesta conocida, mediante destilación a nivel de secuencia sin pesos ni logits del profesor. Según el autor, no se usaron ítems de test de benchmarks y los datos de entrenamiento no comparten ningún 13-grama de palabra con KMMLU-Pro, KMMLU test, CLIcK, MuSR ni Korean MuSR.

La plantilla de chat incluye un bloque `<think> </think>` vacío, lo que indica que el modelo está configurado en modo "nothink" (sin cadena de pensamiento explícita en la salida), aunque el entrenamiento se realizó con formato de razonamiento profundo en los datos.

## Capacidades

- Generación de texto conversacional en coreano con formato de instrucción multi-turno.
- Razonamiento multi-paso y comprensión lectora en coreano, entrenado explícitamente con formato Answer-First + Deep Chain-of-Thought + Answer-Confirm.
- Resolución de preguntas de conocimiento (entrenado con datos derivados de KMMLU train y AI Hub).
- Razonamiento narrativo multi-paso sobre ítems de tipo puzle.
- Modo "nothink": la plantilla de chat inserta un bloque `<think> </think>` vacío, por lo que no se emite cadena de pensamiento visible en la respuesta.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al coreano según el tag de idioma (`ko`); no se declaran otros idiomas.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- **Atención al cliente en coreano**: el modelo puede gestionar conversaciones multi-turno con la plantilla de chat documentada, adecuado para entornos donde se requiere un modelo abierto con licencia Apache 2.0 y despliegue local sin dependencia de APIs propietarias. La longitud de contexto no está documentada, por lo que habría que validar el tamaño de historial antes de producción.
- **Asistentes de estudio para exámenes coreanos**: entrenado con exámenes escolares de AI Hub y KMMLU train, puede emplearse para resolver y explicar preguntas de conocimiento y comprensión lectora en coreano, con formato de respuesta directa seguida de justificación.
- **Generación de soluciones razonadas para datasets educativos**: dado su entrenamiento en formato Answer-First + CoT + Answer-Confirm, es útil para producir soluciones paso a paso en coreano que luego se filtran por corrección, replicando el pipeline de destilación usado por el autor.
- **Razonamiento sobre narrativas y puzles**: los ítems de razonamiento narrativo multi-paso del dataset de entrenamiento lo hacen adecuado para tareas de deducción a partir de texto narrativo en coreano.
- **Prototipado e investigación en NLP coreano**: al ser un modelo de ~7,24B con pesos safetensors y licencia permisiva, sirve como base para experimentos de ajuste fino, evaluación de sesgos o comparación de técnicas de *model soup* y destilación.
- **Despliegue en infraestructura propia con requisitos de soberanía de datos**: la licencia Apache 2.0 y el formato safetensors permiten ejecución on-premise sin restricciones comerciales declaradas, aunque la ausencia de cuantizaciones publicadas obliga a generarlas localmente.
- **Evaluación comparativa de destilación sin logits**: útil como caso de estudio de destilación a nivel de secuencia desde un profesor mayor (Qwen3.6-27B) a un alumno de 8B en un idioma de recursos medios como el coreano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor menciona que los datos de entrenamiento no comparten 13-gramas con KMMLU-Pro, KMMLU test, CLIcK, MuSR ni Korean MuSR, lo que sugiere intención de evaluar en esos conjuntos, pero no se aportan cifras.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible de forma oficial. Como referencia orientativa por tamaño (7,24B parámetros), en bfloat16 se requieren aproximadamente 14,5 GB solo para pesos, más overhead de activaciones y caché KV; en cuantización de 8 bits, unos 7-8 GB; en 4 bits, unos 4-5 GB. Estas cifras son estimaciones por tamaño, no datos publicados por el autor.
- **GPU recomendadas**: no disponible en la información proporcionada. Por tamaño, una GPU con 24 GB (RTX 4090, A10G, L4) permitiría bfloat16 con margen limitado; A100 40/80 GB o H100 para mayor throughput y contexto largo.
- **¿Cabe en GPU de consumo?**: probablemente sí en cuantizaciones de 8 o 4 bits en GPUs de 12-24 GB, pero no hay confirmación oficial ni ficheros GGUF publicados en la información disponible.
- **Opciones de despliegue**: el autor documenta uso con `transformers` (`AutoModelForCausalLM`, `bfloat16`, `device_map="auto"`). No se mencionan vLLM, llama.cpp, Ollama ni TGI; al no haber GGUF, llama.cpp y Ollama requerirían conversión previa.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Yejin Korean 8B v3 (este) | ~7,24B | No disponible | ko | Apache 2.0 | Destilado de Qwen3.6-27B, model soup de 4 LoRA r128, sin benchmarks publicados |
| Yejin Korean 8B v3 mixK2 r128 soup5 | No disponible | No disponible | ko | Apache 2.0 | Variante del mismo autor sobre mixK2 en lugar de mixK3.1 |
| Yejin Korean 8B v3 lr2e4 seedsoup4 | No disponible | No disponible | ko | Apache 2.0 | Variante del mismo autor con soup de semillas y lr 2e-4 |
| Qwen3.6-27B (profesor) | ~27B (no confirmado) | No disponible | Multilingüe (no confirmado) | Apache 2.0 (según el autor) | Usado solo para generar soluciones de destilación, no como checkpoint comparable directo |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas de la misma categoría (modelos coreanos de ~8B). La comparativa se limita a variantes del mismo autor y al modelo profesor.

## Limitaciones y advertencias

- **Ausencia total de benchmarks**: no hay métricas publicadas de MMLU, KMMLU, HumanEval, GSM8K ni similares, por lo que el rendimiento real es desconocido y no verificable de forma independiente.
- **Riesgo de alucinación**: como todo modelo generativo de ~7B, puede producir respuestas plausibles pero incorrectas, especialmente en conocimiento factual coreano; el formato Answer-First puede aumentar la confianza aparente de respuestas erróneas.
- **Sesgos**: no se documenta ninguna evaluación de sesgos; el entrenamiento con datos de AI Hub, FinePDFs y KMMLU train puede heredar sesgos de esas fuentes.
- **Idioma limitado**: solo se declara coreano; el rendimiento en otros idiomas, incluido el castellano, no está garantizado y probablemente sea deficiente.
- **Contexto no documentado**: se desconoce la longitud máxima de contexto, lo que impide planificar despliegues con historiales largos o documentos extensos.
- **Modo "nothink"**: la plantilla inserta `<think> </think>` vacío; si se espera razonamiento explícito visible, el modelo no lo proporcionará en esta variante.
- **Licencia**: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; al ser un modelo con 0 descargas y 0 likes, no hay validación comunitaria de su calidad ni de su estabilidad.
- **Cuantizaciones no publicadas**: no hay GGUF ni otros formatos listos para llama.cpp/Ollama, lo que añade trabajo de conversión y validación para producción.
- **Repo de 29 GB**: el tamaño del repositorio sugiere pesos en bfloat16 (aproximadamente 14,5 GB) más posibles checkpoints u optimizadores; conviene revisar los ficheros antes de descargar.
- **Trazabilidad de datos**: el uso de soluciones generadas por Qwen3.6-27B para destilación implica dependencia de las condiciones de licencia de ese modelo (Apache 2.0 según el autor) y de la calidad de las soluciones filtradas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cooler8/yejin-korean-8b-v3-cpt2s20000-distill-qwen36-mixK31-r128-soup5-nothink-v2
- Modelo base: https://huggingface.co/cooler8/yejin-korean-8b-v3-base
- Variante mixK2 r128 soup5: https://huggingface.co/cooler8/yejin-korean-8b-v3-cpt2s20000-distill-qwen36-mixK2-r128-soup5-nothink-v2
- Variante lr2e4 seedsoup4: https://huggingface.co/cooler8/yejin-korean-8b-v3-cpt2s20000-distill-qwen36-lr2e4-seedsoup4-nothink-v2
- Perfil del autor: https://huggingface.co/cooler8
- Modelo profesor citado (Qwen3.6-27B): no se proporciona enlace directo en la información disponible
- Paper, blog o demo adicionales: no disponibles

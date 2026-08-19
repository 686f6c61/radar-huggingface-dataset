# Eku127/swiftvln-satnav-qwen3vl-2b-1ep-f32s4-overlap0-pf-h8-pool-s2-noembed

## Resumen

El modelo `Eku127/swiftvln-satnav-qwen3vl-2b-1ep-f32s4-overlap0-pf-h8-pool-s2-noembed` es un ajuste fino (fine-tuning) del modelo Qwen3-VL-2B-Instruct, desarrollado por Eku127 (Jiajun Jiang) para la tarea de navegación visual-lenguaje (Vision-Language Navigation, VLN) sobre imágenes satelitales. Forma parte del marco SwiftVLN, que entrena y evalúa agentes encarnados en el entorno SatNav, un benchmark de navegación en estado continuo sobre ortoimágenes. El modelo resuelve el problema de traducir instrucciones en lenguaje natural en secuencias de acciones de navegación, utilizando una ventana de 32 fotogramas RGB y hasta 8 fotogramas de historia como memoria.

La arquitectura se basa en el transformer multimodal Qwen3-VL de 2.438 millones de parámetros, con un diseño de memoria de referencia específico de SwiftVLN que aplica pooling promedio por fotograma con stride 2. El entrenamiento se realizó durante una época con ajuste completo de parámetros y una tasa de aprendizaje de 2e-5, sobre trayectorias expertas offline del conjunto SatNav-v0.1. Este checkpoint está pensado exclusivamente para su uso dentro del entorno de evaluación SwiftVLN/SatNav, no como modelo conversacional o de propósito general.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL (transformer multimodal, visión-lenguaje) |
| Parametros totales | 2.438.696.960 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32 fotogramas RGB de entrada + hasta 8 fotogramas de historia (contexto efectivo en tokens no especificado) |
| Tipos de cuantizacion | No disponible (solo se distribuyen pesos en safetensors) |
| Idiomas soportados | Inglés (en) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte del checkpoint `Qwen/Qwen3-VL-2B-Instruct`, un transformer multimodal que procesa imágenes y texto. Sobre esta base, SwiftVLN incorpora un diseño de memoria de referencia: los fotogramas de entrada se procesan con pooling promedio por fotograma (stride 2) para construir una representación compacta de la historia, con un máximo de 8 fotogramas históricos. La ventana de observación es de 32 fotogramas RGB, y el modelo predice un horizonte de 4 acciones por paso. El entrenamiento se realizó con ajuste completo de todos los parámetros durante 1 época, con una tasa de aprendizaje de 2e-5, sobre trayectorias expertas offline del conjunto SatNav-v0.1. Las ventanas de entrenamiento no se solapan (overlap0) y no se aplica mejora de embeddings (noembed). El nombre del repositorio codifica todas estas decisiones de configuración.

## Capacidades

- Navegación visual-lenguaje en imágenes satelitales: dado un conjunto de fotogramas RGB y una instrucción en lenguaje natural, el modelo genera una secuencia de acciones de navegación (probablemente direcciones o movimientos) para alcanzar un destino.
- Razonamiento espacial sobre ortoimágenes: interpreta la disposición de calles, edificios y obstáculos a partir de imágenes de satélite.
- Procesamiento de secuencias visuales: maneja hasta 32 fotogramas de entrada y mantiene una memoria de hasta 8 fotogramas históricos mediante pooling promedio.
- Predicción de horizonte múltiple: genera 4 acciones por paso de decisión, lo que permite planificación a corto plazo.
- Integración con el entorno de evaluación SatSim: diseñado para ser evaluado en el simulador SatNav con un límite de 500 pasos.
- No es un chatbot general ni un modelo de VQA: su salida está restringida al espacio de acciones del entorno de navegación.

## Casos de uso

- Investigación en navegación visual-lenguaje: el modelo sirve como referencia para estudiar cómo los backbones multimodales de tamaño medio (2B) se comportan en tareas de navegación continua sobre imágenes satelitales.
- Evaluación de algoritmos de planificación en entornos simulados: puede integrarse en pipelines de evaluación de SwiftVLN para comparar estrategias de memoria y predicción de acciones.
- Desarrollo de agentes encarnados en simulación: útil para probar políticas de navegación en el entorno SatNav antes de transferirlas a plataformas robóticas reales.
- Benchmarking de modelos VLN: sus resultados en SatSim (val_seen y val_unseen) sirven como punto de comparación para futuros checkpoints con diferentes backbones o configuraciones.
- Entrenamiento de sistemas de navegación autónoma en exteriores: aunque no está pensado para uso real, puede servir como base para fine-tuning adicional en dominios específicos.
- Análisis de memoria y atención visual: el diseño de memoria con pooling y ventanas no solapadas permite estudiar el impacto de la compresión de historia en el rendimiento de navegación.

## Benchmarks y rendimiento

El modelo fue evaluado en el simulador SatSim sobre los splits completos de SatNav, con un límite de 500 pasos. Los resultados publicados son:

| Split | Episodios | NE | OS | SR | SPL |
| --- | ---: | ---: | ---: | ---: | ---: |
| `val_seen` | 4.574 | 52.64 | 79.49 | 67.49 | 66.73 |
| `val_unseen` | 8.756 | 71.94 | 70.25 | 57.01 | 56.34 |

NE (Navigation Error) mide la distancia media al destino en metros; OS (Oracle Success) indica si el agente alcanza el destino en algún momento; SR (Success Rate) es la proporción de episodios completados con éxito; SPL (Success weighted by Path Length) pondera el éxito por la eficiencia de la ruta. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- No se han publicado requisitos de hardware oficiales para este checkpoint.
- Dado el tamaño de 2.438 millones de parámetros, los pesos en fp16/bf16 ocupan aproximadamente 4,9 GB (tamaño del repositorio). Se estima que la inferencia en fp16 requiere al menos 6-8 GB de VRAM, y en cuantización de 8 bits podría caber en GPUs de consumo con 4-6 GB, aunque no hay datos confirmados.
- El modelo está diseñado para ejecutarse dentro del entorno SwiftVLN, que soporta evaluación en una o varias GPUs mediante scripts específicos (`eval_by_name.sh`).
- No se menciona compatibilidad con vLLM, llama.cpp u Ollama; el uso previsto es a través de la librería `transformers` y el código de SwiftVLN.
- La latencia y el throughput no están documentados.

## Comparativa con modelos similares

Existen otros checkpoints de SwiftVLN con diferentes backbones y configuraciones, como el modelo de 3B basado en Qwen2.5-VL 3B (`Eku127/swiftvln-satnav-3b-1ep-f32s4-overlap0-pf-h8-random-pool-s2-noembed`). Sin embargo, no se dispone de resultados de benchmarks comparativos entre ellos en la información proporcionada. La comparativa estructural sería:

| Modelo | Backbone | Parámetros | Configuración memoria | Resultados SatSim |
| --- | --- | --- | --- | --- |
| swiftvln-satnav-qwen3vl-2b (este) | Qwen3-VL 2B | 2,44B | pf-h8, pool-s2, noembed | val_seen SR 67.49, val_unseen SR 57.01 |
| swiftvln-satnav-3b-1ep-f32s4-overlap0-pf-h8-random-pool-s2-noembed | Qwen2.5-VL 3B | ~3B | pf-h8, random pool, noembed | No disponible |

No se han encontrado comparativas oficiales con otros modelos VLN fuera del ecosistema SwiftVLN.

## Limitaciones y advertencias

- El modelo no es de propósito general: no debe usarse para chat, VQA, robótica real o navegación autónoma en el mundo real. Está estrictamente limitado al entorno de evaluación SwiftVLN/SatNav.
- Requiere el formato de prompt, la construcción de observaciones y el entorno de evaluación específicos de SwiftVLN; fuera de ese contexto, su comportamiento no está garantizado.
- Solo soporta inglés como idioma de instrucciones.
- La licencia no está especificada, lo que puede generar incertidumbre sobre el uso comercial y la redistribución.
- No se han evaluado sesgos ni riesgos de alucinación en el sentido tradicional, pero los errores de navegación pueden ocurrir, especialmente en splits no vistos (val_unseen muestra un SR menor que val_seen).
- El contexto visual está limitado a 32 fotogramas, lo que restringe la capacidad de manejar escenarios de navegación muy largos.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un modelo experimental sin validación externa amplia.

## Enlaces

- HuggingFace: https://huggingface.co/Eku127/swiftvln-satnav-qwen3vl-2b-1ep-f32s4-overlap0-pf-h8-pool-s2-noembed
- Repositorio SwiftVLN (código de entrenamiento y evaluación): https://github.com/Eku127/SwiftVLN
- Repositorio SatNav (entornos, datasets y herramientas de evaluación): https://github.com/Eku127/SatNav
- Guía de evaluación de SwiftVLN: https://github.com/Eku127/SwiftVLN/blob/master/docs/zh-CN/evaluation/README.md
- Modelo relacionado (variante 3B): https://huggingface.co/Eku127/swiftvln-satnav-3b-1ep-f32s4-overlap0-pf-h8-random-pool-s2-noembed

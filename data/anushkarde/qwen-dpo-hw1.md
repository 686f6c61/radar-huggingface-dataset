# anushkarde/qwen-dpo-hw1

## Resumen

`anushkarde/qwen-dpo-hw1` es un adaptador LoRA (formato PEFT) sobre el modelo `Qwen/Qwen2.5-1.5B-Instruct`, entrenado con DPO (Direct Preference Optimization) por Anushka De en el marco de la asignatura CS329X. No es un modelo autónomo: son pesos de bajo rango (rango 8) que deben cargarse sobre el modelo base, un transformer decoder-only denso de 1,54 B de parámetros con 32.768 tokens de contexto.

El objetivo declarado es alinear las respuestas del modelo base mediante pares de preferencia, partiendo de un conjunto de datos muy reducido: 18 prompts convertidos en 378 pares, con las respuestas preferidas situadas en primera posición. El entrenamiento se hizo con el modelo base cuantizado a 4 bits, una única época, learning rate 2e-4 y una NVIDIA Tesla T4 en Google Colab.

Su relevancia es fundamentalmente metodológica y didáctica: documenta un pipeline DPO completo (TRL + PEFT sobre cuantización de 4 bits y hardware de gama de consumo) más que un modelo listo para producción. El propio autor describe una evaluación cualitativa mixta, con mejoras de personalización en algunos prompts y degradación de coherencia en otros. No se publican licencia, idiomas soportados, métricas cuantitativas ni resultados de benchmarks, y el repositorio acumula 0 descargas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only denso de la familia Qwen2.5; no es un modelo completo |
| Parametros totales | Adaptador: no disponible (LoRA de rango 8; el repositorio ocupa 0,0 GB). Modelo base: 1,54 B |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens, heredada del modelo base; el adaptador no la modifica |
| Tipos de cuantizacion | Modelo base en cuantización de 4 bits durante el entrenamiento; el adaptador se publica en safetensors sin cuantizar. No se publican versiones GGUF, GPTQ ni AWQ |
| Idiomas soportados | No disponible (el autor reporta salidas multilingües repetitivas o incoherentes) |
| Licencia | No disponible (el modelo base Qwen2.5-1.5B-Instruct se distribuye bajo Apache-2.0) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Modelo base | Qwen/Qwen2.5-1.5B-Instruct |
| Librerias | PEFT 0.21.2, transformers, TRL |
| Pipeline | text-generation |
| Region | us |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-1.5B-Instruct, un transformer decoder-only denso con atención de consultas agrupadas (GQA, 12 cabezas de atención y 2 cabezas KV), 28 capas, vocabulario de 151.936 tokens y ventana de 32.768 tokens. Sobre esa base se entrena un LoRA de rango 8 con PEFT 0.21.2, aplicando DPO frente al modelo de referencia. El autor no especifica los módulos objetivo del adaptador ni la alpha del LoRA, por lo que el número exacto de parámetros entrenables no es verificable.

Los hiperparámetros publicados son: learning rate 2e-4, 1 época, batch size 1, 8 pasos de acumulación de gradiente (batch efectivo de 8), base cuantizada a 4 bits y entrenamiento en una única Tesla T4 de Google Colab. El conjunto de preferencias procede de 18 prompts transformados en 378 pares; se trata de un volumen muy pequeño, con riesgo alto de sobreajuste a los prompts concretos del ejercicio y capacidad limitada para generalizar el comportamiento de preferencia a otros dominios. No se documenta ningún proceso de RLHF, filtrado de datos, evaluación con juez automático ni partición de validación, y tampoco se detalla la composición lingüística del dataset.

## Capacidades

- Generación de texto conversacional y seguimiento de instrucciones, heredados del modelo base Qwen2.5-1.5B-Instruct.
- Alineación por preferencias: el adaptador sesga las respuestas hacia el estilo de las respuestas marcadas como preferidas en los 378 pares de entrenamiento.
- Razonamiento básico, matemáticas elementales y generación de código en la medida en que lo permite un modelo de 1,54 B de parámetros; el adaptador no añade capacidades nuevas.
- Ventana de contexto de 32.768 tokens (límite del modelo base), útil para conversaciones multi-turno o documentos de extensión media.
- Soporte multilingüe: el modelo base cubre numerosos idiomas, pero el autor informa de salidas multilingües repetitivas e incoherentes tras el DPO, por lo que este punto no puede darse por garantizado.
- Tool calling / function calling: no documentado en el adaptador; el modelo base sí admite formatos de llamada a herramientas según la documentación de Qwen, pero el adaptador no valida ni evalúa esta capacidad.
- Capacidades de agente y razonamiento multi-paso: no documentadas ni evaluadas.
- Modo "thinking", visión o audio: no disponibles en esta variante.
- Personalización ligera: el autor observa mejoras de personalización en algunos prompts, sin consistencia entre ellos.

## Casos de uso

- Estudio de DPO como técnica de alineación: el repositorio permite reproducir un ciclo completo de DPO con TRL y PEFT sobre una GPU de 16 GB, examinando cómo 378 pares de preferencia modifican el comportamiento de un modelo de 1,54 B.
- Material docente en cursos de NLP: sirve como ejemplo de adaptador LoRA con hiperparámetros explícitos (rango 8, lr 2e-4, 1 época, acumulación 8) y de las limitaciones de entrenar con 18 prompts.
- Base para experimentos de anonimización o personalización de estilo: el adaptador puede servir de punto de partida para probar hasta qué punto un DPO ligero cambia el tono de las respuestas, siempre con validación adicional.
- Prototipado de asistentes conversacionales en local: al ejecutarse sobre un modelo de 1,54 B, se puede desplegar en una RTX 3060 o incluso en CPU con cuantización, lo que lo hace útil para demos sin infraestructura dedicada.
- Investigación sobre sobreajuste en alineación: el caso es representativo de un dataset pequeño y homogéneo; resulta útil para medir degradación de coherencia y aparición de repeticiones fuera del dominio de entrenamiento.
- Experimentos comparativos de variantes: cargando el mismo modelo base con y sin el adaptador se puede aislar el efecto concreto del DPO en tareas de generación abierta.
- No se recomienda su uso en atención al cliente, generación de código en producción, entornos sanitarios, jurídicos o financieros ni en cualquier flujo donde la coherencia y la trazabilidad sean requisitos, dada la ausencia de licencia, de evaluación cuantitativa y de idiomas declarados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La única evaluación descrita es cualitativa y comparativa contra el modelo base: el autor indica mejoras en algunas respuestas y, en otras, salidas repetitivas e incoherentes, con especial mención al caso multilingüe. No hay métricas de MMLU, HumanEval, GSM8K, MT-Bench ni de tasa de victoria frente al modelo de referencia, ni tamaños de conjunto de evaluación.

## Requisitos de hardware

- El adaptador en sí ocupa unos pocos megabytes (el repositorio completo figura como 0,0 GB), por lo que el requisito real lo marca el modelo base.
- VRAM para el modelo base en fp16/bf16: aproximadamente 3,1 GB de pesos más activaciones y caché KV; en la práctica, entre 3,5 y 4,5 GB.
- VRAM en cuantización de 8 bits: en torno a 2 GB de pesos.
- VRAM en cuantización de 4 bits: en torno a 1,0-1,5 GB de pesos.
- Caché KV a contexto completo (32.768 tokens, fp16, GQA con 2 cabezas KV y 28 capas): aproximadamente 0,9 GB adicionales.
- GPU recomendadas: cualquier GPU con 8 GB o más (RTX 3060, RTX 4060, RTX 4090, L4, T4). El propio autor usó una Tesla T4 para el entrenamiento; la inferencia cabe holgadamente en GPU de gama media y en GPU integradas con memoria unificada.
- Cabe en GPU de consumo: sí, en cualquier tarjeta con 8 GB o más; el caso más ajustado es una GPU de 6 GB con cuantización de 4 bits.
- Opciones de despliegue: transformers + PEFT para cargar el adaptador sin fusionar; fusión del adaptador con el modelo base (`merge_and_unload`) y posterior conversión a GGUF para llama.cpp u Ollama; vLLM con soporte de adaptadores LoRA para servicio concurrente; TGI no garantiza el soporte de este adaptador concreto sin conversión previa.
- Latencia y throughput: no disponibles. El autor no publica mediciones de velocidad, y la T4 se empleó únicamente para el entrenamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Naturaleza |
|---|---|---|---|---|---|
| qwen-dpo-hw1 (este) | Adaptador LoRA sobre 1,54 B | 32.768 | No disponible | HuggingFace, 0 descargas | Adaptador DPO de carácter académico |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 | Apache-2.0 | HuggingFace, ampliamente usado | Modelo base instructivo, sin alinear por DPO adicional |
| Qwen/Qwen2.5-0.5B-Instruct | 0,49 B | 32.768 | Apache-2.0 | HuggingFace | Alternativa más ligera para hardware muy limitado |
| meta-llama/Llama-3.2-1B-Instruct | 1,24 B | 128.000 | Llama 3.2 Community License | HuggingFace, con aceptación de términos | Modelo instructivo comparable en tamaño, contexto mayor |
| HuggingFaceTB/SmolLM2-1.7B-Instruct | 1,7 B | 8.192 | Apache-2.0 | HuggingFace | Alternativa abierta con contexto mucho más corto |

La comparación es estructural: no existen métricas publicadas de este adaptador que permitan contrastar rendimiento con las alternativas. Frente a ellas, la diferencia principal no es de capacidad sino de propósito (ejercicio académico) y de garantías legales y de soporte.

## Limitaciones y advertencias

- Dataset de entrenamiento mínimo: 18 prompts y 378 pares de preferencia, con alto riesgo de sobreajuste y de mejora no generalizable.
- El autor reconoce explícitamente degradación cualitativa: respuestas repetitivas e incoherentes, especialmente en generación multilingüe, y consistencia reducida en varios prompts.
- Riesgo elevado de alucinación por parte de un modelo base de 1,54 B parámetros, sin que el DPO incorpore ninguna técnica de verificación factual.
- Sesgos: no se documenta ningún análisis de sesgo ni la composición del dataset de preferencias; los sesgos del modelo base se heredan y pueden verse amplificados por un conjunto de preferencias tan pequeño.
- Idiomas soportados: no declarados. El comportamiento multilingüe es precisamente uno de los puntos donde el autor reporta fallos.
- Licencia: no disponible en el repositorio. Al tratarse de un adaptador derivado de Qwen2.5-1.5B-Instruct (Apache-2.0), el uso comercial no está garantizado por el autor y requeriría revisión legal propia.
- Sin benchmarks, sin evaluación cuantitativa, sin partición de validación y sin métricas de tasa de victoria frente al modelo de referencia.
- Sin garantías de mantenimiento: repositorio con 0 descargas y 0 "likes", creado y actualizado el mismo día (14 de octubre de 2026), con metadatos de fecha que conviene tratar con cautela.
- La model card es una plantilla sin completar en secciones clave (uso previsto, uso fuera de alcance, datos de entrenamiento, infraestructura, cita), lo que limita la reproducibilidad.
- No debe usarse como modelo de producción sin una evaluación propia sobre el dominio objetivo y sin fusionar y validar el adaptador.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/anushkarde/qwen-dpo-hw1
- Modelo base Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio de Qwen2.5 (QwenLM): https://github.com/QwenLM/Qwen2.5
- Repositorio de TRL (entrenamiento con DPO): https://github.com/huggingface/trl
- Repositorio de PEFT: https://github.com/huggingface/peft
- Documentación de PEFT: https://huggingface.co/docs/peft
- Artículo de DPO (Rafailov et al., 2023): https://arxiv.org/abs/2305.18290
- Calculadora de impacto de Machine Learning citada en la model card: https://mlco2.github.io/impact
- Lacoste et al. (2019), cuantificación del impacto ambiental: https://arxiv.org/abs/1910.09700

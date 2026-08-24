# mr-mc/flowjudge-dialam-qwen3-0.6b-v3-n4096

## Resumen

El modelo `mr-mc/flowjudge-dialam-qwen3-0.6b-v3-n4096` es un adaptador PEFT (QLoRA) desarrollado por mr-mc sobre el modelo base Qwen3-0.6B de Alibaba. Su propósito es extremadamente específico: dado una nueva proposición y un bloque fijo de proposiciones anteriores (procedentes del corpus DialAM QT30), debe emitir un objeto JSON que contenga todas las aristas de relación directa de tipo SUPPORT, ATTACK o REPHRASE hacia los identificadores suministrados, o una lista vacía. Es un artefacto de investigación educativa para argument mining, no un modelo de propósito general.

La relevancia de este adaptador radica en que demuestra un enfoque de ajuste eficiente (QLoRA) para una tarea de razonamiento estructural sobre argumentos, pero los resultados publicados en la model card indican un rendimiento muy por debajo de los umbrales exigidos para uso real (edge F1 de 35 % frente al 85 % requerido). El adaptador añade un pequeño peso al modelo base de 0,6B, lo que lo hace ejecutable en hardware modesto, pero su licencia y la no redistribución del corpus de entrenamiento limitan su reutilización.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | QLoRA sobre Qwen3-0.6B (transformer denso) |
| Parametros totales | No disponible (adaptador PEFT; modelo base: 0.6B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el adaptador procesa bloques de 4096 proposiciones, pero no se especifica el limite en tokens) |
| Tipos de cuantizacion | No especificado (QLoRA implica cuantizacion del modelo base, pero no se detalla el tipo) |
| Idiomas soportados | No disponible (el corpus QT30 es en ingles, presumiblemente) |
| Licencia | other (no especificada; se requiere permiso del corpus QT30) |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se entrena mediante QLoRA sobre el modelo base Qwen3-0.6B, manteniendo la configuracion de optimizacion de la version v1. La novedad de esta version v3 es el conjunto de datos y la reduccion de perdida: se utilizan 4.096 ejemplos privados transformados del corpus QT30, organizados como 2.048 pares exactos del tipo "misma actualizacion" positivo/NONE. La perdida se promedia dentro de cada ejemplo antes de promediar entre ejemplos, lo que corrige un desequilibrio de ponderacion por longitud de salida (4.50x) detectado en la version v2. El modelo no redistribuye el texto de entrenamiento; solo se comparten metricas agregadas, configuracion, hashes y metadatos de reconstruccion sin texto.

## Capacidades

- Generacion de objetos JSON con listas de aristas de relacion (SUPPORT, ATTACK, REPHRASE) hacia IDs concretos, o lista vacia si no hay relaciones.
- Identificacion de relaciones de apoyo, ataque y reformulacion entre proposiciones en un contexto incremental.
- Manejo de casos NONE (sin aristas) con cero falsas aristas en el conjunto de evaluacion fijo (0/6 casos).
- No dispone de tool calling, capacidad agente, ni generacion de texto general mas alla de la tarea especifica.
- No incluye modo thinking; se recomienda desactivar el thinking de Qwen3 durante la inferencia.

## Casos de uso

- **Investigacion en argument mining**: el adaptador puede servir para extraer relaciones argumentativas en corpus academicos o judiciales, como el propio QT30, aunque con rendimiento limitado para uso experimental.
- **Analisis de debates en foros o discursos**: aplicado a transcripciones de debates, puede identificar cuando una intervencion apoya o ataca una proposicion previa, facilitando estudios de estructura argumentativa.
- **Extraccion de estructura en documentos legales**: en textos de sentencias o alegatos, se puede intentar detectar aristas de apoyo/ataque entre argumentos, aunque la precision actual no garantiza resultados fiables.
- **Prototipo de sistema de asistencia a la anotacion**: como herramienta de pre-anotacion para humanos, puede generar candidatos de relaciones que luego un anotador corrige, reduciendo el trabajo manual.
- **Educacion en analisis de discurso**: en entornos docentes, para ilustrar el funcionamiento de un modelo de argument mining y sus limitaciones, sin pretension de exactitud.
- **Investigacion sobre adaptadores PEFT**: como caso de estudio de QLoRA en tareas de razonamiento estructurado, comparando configuraciones de datos y perdida.

## Benchmarks y rendimiento

La model card proporciona resultados sobre un conjunto de evaluacion fijo de 30 escenarios (frozen 30-scenario). No se han publicado comparaciones con otros modelos de argument mining.

| Metrica | Base | v1 n=2048 | v2 n=2048 | v3 n=4096 (seleccionado) |
|---|---:|---:|---:|---:|
| Exact patch accuracy | 0.0% | 26.7% | 23.3% | **43.3%** |
| Edge precision | 0.0% | 16.7% | 18.8% | **43.8%** |
| Edge recall | 0.0% | 16.7% | 25.0% | **29.2%** |
| Edge F1 | 0.0% | 16.7% | 21.4% | **35.0%** |
| Relation macro-F1 | 0.0% | 16.7% | 18.8% | **33.9%** |
| False edges/update | 0.000 | 0.667 | 0.867 | **0.300** |
| NONE cases with false edges | n/a | 2/6 | 5/6 | **0/6** |
| Judge Robustness /4 | 1.40 | 2.10 | 1.43 | **2.97** |

El modelo v3 mejora respecto a v1 y v2, pero no alcanza los umbrales de alta fiabilidad (edge F1 requerido 85 %, exact patch accuracy 80 %). La relacion ATTACK es la mas debil con un F1 de 18.2 %.

## Requisitos de hardware

- **VRAM estimada**: el adaptador PEFT es pequeno (~0.1 GB), pero el modelo base Qwen3-0.6B en fp16 ocupa aproximadamente 1.2 GB. Con cuantizacion QLoRA (4 bits) puede reducirse a ~0.6 GB. Total estimado < 2 GB para inferencia.
- **GPU recomendada**: cualquier GPU con al menos 2 GB de VRAM (p. ej., NVIDIA GTX 1650, RTX 3050) es suficiente. Para mayor velocidad, una RTX 3060 o superior.
- **CPU**: es factible ejecutar en CPU con 8 GB de RAM, aunque con latencia alta.
- **Opciones de despliegue**: se puede usar con Transformers/PEFT, Unsloth, o exportar a GGUF para llama.cpp/Ollama. Tambien compatible con vLLM si se integra el adaptador sobre el base.
- **Latencia y throughput**: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos publicados de otros adaptadores o modelos de argument mining comparables en la informacion proporcionada. No se puede realizar una comparativa objetiva.

## Limitaciones y advertencias

- **Rendimiento bajo**: edge F1 35 % y exact patch accuracy 43.3 % en el conjunto fijo; no apto para produccion.
- **Alucinacion**: el modelo puede generar aristas falsas (0.300 falsas por actualizacion en el conjunto fijo), aunque mejor que versiones anteriores.
- **Licencia restrictiva**: la licencia es "other" y el corpus de entrenamiento QT30 no se redistribuye; se requiere permiso externo para obtener los datos.
- **Idioma**: no se especifica el soporte de idiomas; presumiblemente solo ingles.
- **Contexto limitado**: procesa bloques fijos de 4096 proposiciones, no texto libre de longitud variable.
- **Artefacto educativo**: el propio autor lo califica como "educational research artifact", no como herramienta lista para uso comercial.

## Enlaces

- [HuggingFace del adaptador](https://huggingface.co/mr-mc/flowjudge-dialam-qwen3-0.6b-v3-n4096)
- [HuggingFace del modelo base Qwen3-0.6B](https://huggingface.co/Qwen/Qwen3-0.6B)
- [GitHub del proyecto Qwen3](https://github.com/QwenLM/Qwen3)
- [Reporte tecnico de Qwen3 (arXiv)](https://arxiv.org/html/2505.09388v1)

# DAINOO/Siance-1.3-120M

## Resumen

Siance-1.3-120M es un modelo de lenguaje de 125.264.640 parámetros entrenado desde cero por el desarrollador independiente DAINOO, publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un modelo bilingüe castellano-inglés de arquitectura tipo Llama ("llama-style", según los tags del autor) orientado a un caso de uso muy concreto: la conversación con memoria externa estructurada en tres canales (`conv`, `kb` y `math`) y un comportamiento declarado de "honestidad", es decir, que el modelo responda que no sabe algo en lugar de inventarlo.

El modelo parte de una base propia preentrenada hasta el paso 49.421 y posteriormente ajustada con SFT mediante LoRA de rango 48 durante 4.500 pasos. El autor declara un examen held-out con plantillas propias con un 99 % de disparo correcto de la herramienta, un 98 % de acierto en la identificación de fuente y un 95 % en la respuesta, aunque advierte explícitamente de que ese examen procede de los mismos generadores sintéticos usados en el entrenamiento y no garantiza el comportamiento con usuarios reales.

Su relevancia es acotada pero clara: es un experimento de investigación reproducible (pesos abiertos, Apache 2.0, entrenamiento from scratch) sobre modelos de muy pequeño tamaño con soporte de tool use y control de alucinación, útil para estudiar pipelines de datos sintéticos, SFT con LoRA y evaluación honesta de resultados en entornos con recursos muy limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama ("llama-style", según tags del autor); detalles de capas y dimensiones no disponibles |
| Parametros totales | 125.264.640 (≈120M) |
| Parametros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene pesos en formato original; no se documentan GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | Castellano (es) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible de forma explícita; el tamaño del repo es de 0,3 GB, compatible con safetensors en fp32/fp16, pero no se confirma el formato |

## Arquitectura y entrenamiento

La información disponible indica una arquitectura transformer de estilo Llama, aunque no se detallan el número de capas, la dimensión del modelo, el número de cabezas de atención ni la ventana de contexto. El modelo se entrenó desde cero ("from-scratch") por DAINOO, con una fase de preentrenamiento propia que alcanzó el paso 49.421 y una fase posterior de ajuste supervisado (SFT) mediante LoRA con rango 48 durante 4.500 pasos. No se especifican el volumen de tokens de preentrenamiento, la composición del corpus ni si se aplicaron técnicas de RLHF o DPO.

La innovación declarada no está en la arquitectura sino en el diseño de interacción: el modelo está entrenado para operar con memoria externa en tres canales (`conv` para el historial conversacional, `kb` para base de conocimiento y `math` para cálculo) y para señalar explícitamente la fuente de sus respuestas. El ajuste se realizó sobre plantillas generadas por el propio autor, lo que explica el alto resultado del examen held-out y, al mismo tiempo, su principal limitación metodológica: la evaluación comparte distribución con los datos de entrenamiento.

## Capacidades

- Generación de texto bilingüe castellano-inglés.
- Soporte de tool use / function calling mediante el esquema de memoria externa con canales `conv`, `kb` y `math`.
- Comportamiento de "honestidad": el modelo declara desconocimiento en lugar de fabricar una respuesta cuando no encuentra información.
- Trazabilidad de fuente: el modelo indica de dónde procede la información empleada en la respuesta.
- Razonamiento aritmético acotado a través del canal `math`, sin datos publicados sobre su fiabilidad fuera de las plantillas de entrenamiento.
- Conversación multi-turno apoyada en el canal `conv`; la longitud de contexto efectiva no está documentada.
- No se documentan capacidades de visión, audio, modo "thinking" explícito ni razonamiento multi-paso autónomo más allá del uso de herramientas.

## Casos de uso

- Asistentes de consulta sobre documentación interna: el modelo puede recibir fragmentos de una base de conocimiento por el canal `kb` y responder citando la fuente, lo que encaja con su entrenamiento en identificación de procedencia.
- Sistemas de atención al cliente de bajo coste: con 120M de parámetros puede desplegarse en CPU o GPU de gama baja para respuestas acotadas a un catálogo de productos inyectado como contexto.
- Enrutado y clasificación con abstención: su comportamiento de "decir que no sabe" lo hace adecuado como primera etapa de un pipeline, derivando a un modelo mayor los casos que declara no poder resolver.
- Investigación sobre alucinación en modelos pequeños: sirve como banco de pruebas reproducible (Apache 2.0, pesos abiertos) para estudiar calibración y abstención en modelos de menos de 1B de parámetros.
- Experimentación con SFT y LoRA: el modelo es un caso documentado de ajuste con LoRA r=48 sobre una base propia, útil para comparar metodologías de ajuste en entornos con un solo GPU consumer.
- Demos educativas y prototipado rápido en castellano: su tamaño permite ejecución local en portátiles para validar flujos de tool calling antes de migrar a modelos mayores.
- Cálculo asistido simple: el canal `math` permite integrarlo en asistentes de operaciones aritméticas básicas con verificación de fuente, aunque sin garantías fuera de las plantillas de entrenamiento.

## Benchmarks y rendimiento

Los únicos datos publicados por el autor son los de su examen held-out con plantillas propias, que no constituyen benchmarks estándar ni son comparables con MMLU, HumanEval o GSM8K:

| Evaluacion (plantillas propias del autor) | Resultado |
|---|---|
| Disparo correcto de herramienta | 99 % |
| Identificación de fuente | 98 % |
| Respuesta correcta | 95 % |

El propio autor advierte que este examen procede de los mismos generadores sintéticos empleados en el entrenamiento y no garantiza el rendimiento con usuarios reales. No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, los 125,3M de parámetros ocupan aproximadamente 0,5 GB; en fp16, unos 0,25 GB; en cuantización de 8 bits, unos 0,13 GB, a lo que hay que sumar la memoria del contexto y del runtime.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente; una RTX 3060, RTX 4060 o incluso una GTX 1650 cubren el modelo con holgura.
- Cabe en GPU consumer y también en CPU: es viable la inferencia en portátiles sin GPU dedicada, con latencias mayores.
- Opciones de despliegue: no se documentan integraciones oficiales con vLLM, llama.cpp, Ollama o TGI; al ser un transformer tipo Llama, es probable su conversión a GGUF, pero no hay artefactos publicados que lo confirmen.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Siance-1.3-120M | 125,3M | no disponible | es, en | Apache 2.0 | Entrenado from scratch, tool use con memoria externa, sin benchmarks estándar |
| SmolLM2-135M (Hugging Face) | 135M | 8.192 tokens (según documentación pública del modelo) | principalmente en | Apache 2.0 | Base generalista con benchmarks publicados; sin soporte nativo de tool use declarado |
| Qwen2.5-0.5B | 494M | 32.768 tokens (según documentación pública del modelo) | multilingüe | Apache 2.0 | Mayor tamaño y contexto; requiere más recursos |
| TinyLlama-1.1B | 1,1B | 2.048 tokens (según documentación pública del modelo) | en | Apache 2.0 | Referencia clásica de modelos pequeños; sin soporte bilingüe es/en declarado |

La comparación directa es difícil porque Siance-1.3 no publica resultados en benchmarks estándar; los datos de los modelos alternativos proceden de su documentación pública y no de una evaluación conjunta.

## Limitaciones y advertencias

- El examen held-out del autor procede de los mismos generadores sintéticos del entrenamiento: los porcentajes de 99 %, 98 % y 95 % no son extrapolables a usuarios reales.
- No hay resultados en benchmarks estándar ni evaluación independiente, por lo que el rendimiento real en tareas abiertas es desconocido.
- Riesgo de alucinación no cuantificado fuera de las plantillas de entrenamiento; el comportamiento de abstención puede degradarse con entradas fuera de distribución.
- Longitud de contexto no documentada, lo que impide planificar su uso en conversaciones o documentos largos.
- Modelo de 120M de parámetros: capacidad de razonamiento, conocimiento factual y generación de código muy limitadas en comparación con modelos de varios miles de millones de parámetros.
- Idiomas limitados a castellano e inglés; no se documenta cobertura de otras lenguas.
- Sin descargas ni validación por parte de la comunidad (0 descargas, 0 likes en el momento de la consulta): no hay evidencia externa de funcionamiento.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación independiente desaconseja su uso en producción sin validación propia.
- No se documentan sesgos, filtros de seguridad ni moderación de contenido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DAINOO/Siance-1.3-120M

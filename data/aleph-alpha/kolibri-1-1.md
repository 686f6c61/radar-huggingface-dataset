# Aleph-Alpha/Kolibri-1.1

## Resumen

Kolibri 1.1 es un modelo de lenguaje de tipo mixture-of-experts (MoE) desarrollado por Aleph Alpha Research GmbH, orientado a razonamiento explícito y con foco en alemán e inglés. Es el sucesor de Kolibri 1 y mantiene el mismo compromiso de diseño: alto rendimiento bilingüe con un coste de servicio bajo, gracias a una arquitectura que activa únicamente una fracción pequeña de sus parámetros por token.

El modelo cuenta con 75.112.665.344 parámetros totales, de los cuales solo 3.439.874.304 se activan por token. Incorpora atención dispersa (sparse attention) para abaratar los contextos largos, con una longitud de contexto nativa de 262.144 tokens que puede extenderse hasta 1.048.576 tokens, aunque el autor recomienda no superar los 262.144 en tareas complejas. Soporta un modo de razonamiento explícito y tool calling, y se distribuye bajo licencia Apache 2.0.

La relevancia de Kolibri 1.1 radica en su posicionamiento en la frontera de Pareto entre calidad y coste de servicio: según el autor, alcanza un 73,2 % en su puntuación agregada de benchmarks con 0,21 GPU-horas por cada 1.000 tareas de evaluación, frente al 66,6 % y 0,72 GPU-horas de Kolibri 1.0. Está pensado para asistentes bilingües, razonamiento multi-paso, RAG, generación de código y uso agéntico con herramientas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE: 2 capas densas + 48 capas MoE, atención con proporción 4:1 entre sliding-window y sparse attention |
| Parametros totales | 75.112.665.344 (75B) |
| Parametros activos | 3.439.874.304 (3,44B) por token |
| Longitud de contexto | 262.144 tokens nativos; hasta 1.048.576 tokens (recomendado ≤262.144 en tareas complejas) |
| Tipos de cuantizacion | Pesos en fp8 en el repo; cuantizaciones GGUF publicadas en Aleph-Alpha/Kolibri-1.1-GGUF |
| Idiomas soportados | Alemán (de), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (fp8); GGUF en repo separado |

## Arquitectura y entrenamiento

Kolibri 1.1 es un transformer con 2 capas densas iniciales seguidas de 48 capas MoE. Cada capa MoE dispone de 384 expertos enrutados, de los que se seleccionan 6 por token, más 1 experto compartido. La atención combina capas de ventana deslizante con capas de atención dispersa en una proporción 4:1: la mayoría de capas se centra en texto cercano y un subconjunto selecciona fragmentos relevantes del contexto, lo que reduce el coste de los contextos largos. El entrenamiento utilizó Muon como optimizador y Exact Quantile Balancing para el enrutamiento de expertos.

El modelo se entrena por continuación desde un checkpoint de mid-training de Kolibri 1, que acumulaba 20T tokens de pre-entrenamiento y 3,42T de mid-training. Sobre esa base se añadieron 805B tokens de mid-training disperso y 201B tokens de contexto largo, también con atención dispersa. El post-entrenamiento combina SFT con datos bilingües filtrados (open source y sintéticos) y RL sobre un conjunto amplio de entornos que cubren razonamiento, uso agéntico y seguimiento de instrucciones. El cómputo total de las fases propias de Kolibri 1.1 asciende a 5,52×10²² FLOPs, sin contar los 5,86×10²³ FLOPs del entrenamiento heredado de Kolibri 1. El corte de conocimiento es el 18 de junio de 2026 para ambos idiomas.

## Capacidades

- Generación de texto y conversación multi-turno en alemán e inglés.
- Modo de razonamiento explícito (reasoning mode) activable.
- Razonamiento multi-paso para tareas complejas.
- Generación y asistencia de código.
- Tool calling / function calling para integración con herramientas externas.
- Uso agéntico: planificación y ejecución de flujos con múltiples pasos y llamadas a herramientas.
- Extracción estructurada de información a partir de texto.
- Procesamiento de documentos largos gracias a su ventana de contexto nativa de 262.144 tokens.
- Recuperación aumentada (RAG) sobre contextos extensos.
- Capacidad de usar información más reciente que su corte de conocimiento mediante el uso de herramientas.

## Casos de uso

- Asistentes bilingües alemán-inglés: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a sus 262.144 tokens nativos, lo que lo hace adecuado para atención al cliente y asistentes corporativos en entornos germanoparlantes.
- RAG sobre documentación extensa: con una ventana de hasta 262.144 tokens recomendados, puede ingerir manuales, contratos o bases de conocimiento completas y responder con citas al contenido recuperado, reduciendo la necesidad de fragmentación agresiva.
- Agentes con tool calling: su soporte nativo de function calling y su entrenamiento con RL sobre entornos agénticos permiten construir pipelines que consulten APIs, bases de datos o servicios internos de forma autónoma.
- Generación de código en producción: puede integrarse en flujos de CI/CD para revisión de código, generación de tests o explicación de errores, con soporte de herramientas para consultar repositorios o documentación.
- Procesamiento de documentos largos: análisis de expedientes, informes o transcripciones de gran extensión en alemán e inglés, con extracción estructurada de entidades y datos clave.
- Razonamiento multi-paso para análisis técnico: resolución de problemas que requieren descomposición en pasos intermedios, como diagnóstico de incidencias, planificación logística o análisis financiero, activando el modo de razonamiento explícito.
- Asistencia legal o administrativa en alemán: resumen y comparación de normativa y contratos, aprovechando el foco bilingüe del modelo y su capacidad de contexto largo.
- Despliegue en infraestructura controlada: al distribuirse bajo Apache 2.0 y con pesos en fp8 y GGUF, puede desplegarse en clústeres propios con vLLM o llama.cpp sin dependencia de APIs externas.

## Benchmarks y rendimiento

El autor publica una puntuación agregada de benchmarks (ponderación 50 % inglés, 50 % alemán) y su coste de servicio medido con vLLM 0.33 en un nodo de 8×B200 con pesos de 8 bits. No se han publicado en la información disponible los resultados desglosados por benchmark individual (MMLU, HumanEval, GSM8K u otros).

| Modelo | Puntuación agregada | GPU-horas por 1.000 tareas |
|---|---|---|
| Kolibri 1.1 | 73,2 % | 0,21 |
| Kolibri 1.0 | 66,6 % | 0,72 |
| Qwen3.8 Flash Next | en la frontera de Pareto (valor no disponible) | no disponible |
| GLM-5.3 Flash | no disponible | 2,49 |
| Qwen3.8 27B | no disponible | 1,97 |

El coste se modeló midiendo el throughput de prefill y decode en ocho longitudes de contexto (1k, 2k, 4k, 16k, 32k, 64k, 128k y 256k tokens) e interpolando entre ellas, probando varias disposiciones de paralelismo (TP1 a TP8, DP4+EP4, DP8+EP8, DP4×TP2+EP8, DP2×TP4+EP8 y TP8+EP8) y conservando la más rápida por modelo.

## Requisitos de hardware

- Huella de memoria del modelo: aproximadamente 77,6 GB.
- Mínimo recomendado por el autor: 2× H100 SXM5, 2× H200, 1× B200 o 1× B300.
- Configuración recomendada: 4× H100 SXM5, 2× H200, 2× B200 o 1× B300.
- No cabe en GPUs de consumo (RTX 4090, etc.) en precisión completa o fp8; las cuantizaciones GGUF publicadas en el repo separado pueden reducir el requisito, pero no se dispone de cifras concretas de VRAM para esas variantes en la información disponible.
- Opciones de despliegue: vLLM (librería declarada del modelo), llama.cpp/Ollama mediante las cuantizaciones GGUF, y otras pilas compatibles con safetensors y fp8.
- Latencia y throughput: no se publican cifras absolutas de tokens por segundo en la información disponible; el autor reporta el coste relativo en GPU-horas por tarea descrito en la sección de benchmarks.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Kolibri 1.1 | 75B totales / 3,44B activos | 262.144 nativos (hasta 1.048.576) | Apache 2.0 | Pesos abiertos en Hugging Face (fp8 y GGUF) | Foco alemán-inglés, modo de razonamiento y tool calling |
| Kolibri 1.0 | no disponible en la información | no disponible | Apache 2.0 (según ficha del predecesor) | Pesos abiertos | Predecesor directo; 66,6 % agregado y 0,72 GPU-horas por 1.000 tareas |
| Qwen3.8 Flash Next | no disponible | no disponible | no disponible | no disponible | Situado en la frontera de Pareto junto a Kolibri 1.1 según el autor |
| GLM-5.3 Flash | no disponible | no disponible | no disponible | no disponible | 2,49 GPU-horas por 1.000 tareas según el gráfico del autor |
| Qwen3.8 27B | 27B (según denominación) | no disponible | no disponible | no disponible | 1,97 GPU-horas por 1.000 tareas según el gráfico del autor |

Los datos de los modelos comparables provienen únicamente del gráfico de coste publicado por Aleph Alpha; no se dispone de sus especificaciones completas en la información proporcionada.

## Limitaciones y advertencias

- Idiomas: solo se declaran alemán e inglés; el rendimiento en castellano u otras lenguas no está garantizado ni documentado.
- Contexto: aunque acepta hasta 1.048.576 tokens, el propio autor advierte de que la calidad en tareas complejas puede degradarse más allá de los 262.144 tokens nativos.
- Corte de conocimiento: 18 de junio de 2026; la información posterior solo puede incorporarse mediante uso de herramientas.
- Alucinación: no se documentan tasas específicas en la información disponible; como todo modelo generativo, existe riesgo de fabricar datos, especialmente en tareas de extracción o resumen sin verificación.
- Sesgos: no se detallan sesgos conocidos en la información disponible; el autor publica un documento separado de uso responsable (RESPONSIBLE_USE.md) que conviene consultar.
- Licencia: Apache 2.0 permite uso comercial, pero el autor remite a su guía de uso responsable y es signatario del Código de Práctica de GPAI de la UE, lo que puede implicar obligaciones adicionales de transparencia en el despliegue.
- Memoria: el modelo completo debe residir en memoria aunque solo se active una fracción por token; esto encarece el despliegue en comparación con modelos densos de tamaño similar.
- Cuantizaciones GGUF: no se dispone de datos de degradación de calidad para las versiones cuantizadas en la información proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Aleph-Alpha/Kolibri-1.1
- Cuantizaciones GGUF: https://huggingface.co/Aleph-Alpha/Kolibri-1.1-GGUF
- Blog post de Kolibri 1.1: https://aleph-alpha.com/en/blog/kolibri-1-1/
- Tech report de Kolibri 1: https://aleph-alpha.com/downloads/tech-report.pdf
- Guía de uso responsable: https://huggingface.co/Aleph-Alpha/Kolibri-1.1/blob/main/RESPONSIBLE_USE.md
- Código de Práctica GPAI de la UE: https://digital-strategy.ec.europa.eu/en/policies/contents-code-gpai
- Paper arXiv 2512.11614: https://arxiv.org/abs/2512.11614
- Paper arXiv 2601.17858: https://arxiv.org/abs/2601.17858

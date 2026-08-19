# reaperdoesntknow/Structure-Over-Scale

## Resumen

El modelo `Structure-Over-Scale` es un pequeño modelo de lenguaje entrenado íntegramente en CPU a precisión FP32, desarrollado por Roy C en Convergent Intelligence LLC como parte de una investigación sobre arquitecturas cognitivas dispersas y eficiencia de coste. El trabajo, documentado en un paper de marzo de 2026, reporta el entrenamiento de 15 modelos en cuatro familias de arquitecturas —Mixture of Attentions (MoA), fusión cross-arquitectura (Qemma), inteligencia de enjambre (SAGI) y modelos causales basados en espacio métrico (DiscoverLM)— con un coste total de 24 dólares en un único procesador AMD EPYC 9454P. El modelo presentado aquí es uno de esos checkpoints, con licencia Apache 2.0 y orientado a inglés.

La relevancia de esta propuesta radica en desafiar el supuesto de que las GPUs son imprescindibles para entrenar modelos de lenguaje. El paper argumenta que, para modelos por debajo de 2.000 millones de parámetros, el entrenamiento en CPU con FP32 produce modelos más capaces por dólar invertido que el entrenamiento en GPU con FP16, debido a la pérdida de precisión acumulada en profundidad. Aunque no se publican métricas de rendimiento concretas en la información disponible, la metodología introduce innovaciones como curriculum de desarrollo, ingestión continua de datos y gobernanza termodinámica autorregulada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Una de las cuatro familias descritas en el paper: MoA, Qemma, SAGI o DiscoverLM (no especificado para este checkpoint) |
| Parametros totales | Sub-2B (según el paper, sin cifra exacta) |
| Parametros activos | 0,02–7 % del total (arquitecturas dispersas, según el paper) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el paper menciona FP32 para entrenamiento, no cuantización para inferencia) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (probablemente safetensors, no confirmado) |

## Arquitectura y entrenamiento

El paper describe un entrenamiento en CPU a FP32 con siete pilares metodológicos: preservación de precisión FP32 (con experimentos que muestran un error 5.810 veces mayor en FP16 en una sola operación y 23.225 veces mayor a profundidad de 50 capas), arquitecturas cognitivas dispersas donde solo el 0,02–7 % de los parámetros se activan por token (diseñadas para el branching de CPU en lugar del SIMD de GPU), curriculum de desarrollo que progresa de lenguaje a lógica, transferencia y profundidad, ingestión continua de datos tipo "belt-fed" que elimina el desperdicio por truncamiento, optimización específica para AMD Zen 4 mediante AOCL/OpenMP y asignación NUMA, gobernanza termodinámica autorregulada con medición de temperatura emergente basada en discrepancia L2-star, y uso de estándares abiertos (AVX2 SIMD a FP32) sin dependencia de proveedores propietarios.

El entrenamiento se realizó durante seis meses (septiembre de 2025 a marzo de 2026) en un solo AMD EPYC 9454P de 48 núcleos y 96 hilos. El coste total fue de 24 dólares, lo que supone un promedio de 1,60 dólares por modelo. No se detalla el número de tokens de entrenamiento ni la composición exacta del dataset en el extracto disponible.

## Capacidades

- Generación de texto en inglés (idioma declarado en la model card).
- Razonamiento y lógica, según el curriculum de entrenamiento descrito en el paper (progresión de lenguaje a lógica y transferencia).
- Capacidad de ejecución en CPU sin necesidad de GPU, gracias al entrenamiento nativo en FP32 y arquitecturas dispersas.
- No se dispone de información sobre tool calling, agentes, visión, audio u otras capacidades especiales.

## Casos de uso

- Despliegue en entornos sin GPU: al ser un modelo sub-2B entrenado y ejecutable en CPU, puede integrarse en servidores tradicionales o dispositivos edge donde el acceso a GPUs es limitado o costoso.
- Prototipado rápido de aplicaciones de lenguaje: su bajo coste de entrenamiento (1,60 dólares) permite experimentar con arquitecturas alternativas sin grandes inversiones.
- Investigación académica sobre eficiencia de entrenamiento: sirve como caso de estudio para metodologías de entrenamiento en CPU y arquitecturas dispersas.
- Generación de texto en inglés para tareas simples como resúmenes, clasificación o extracción de información en entornos con restricciones de hardware.
- Evaluación comparativa de arquitecturas no transformer: permite probar alternativas como MoA, SAGI o DiscoverLM frente a modelos transformer del mismo tamaño.
- Formación y educación: su licencia Apache 2.0 y su documentación detallada lo hacen adecuado para cursos sobre entrenamiento de modelos eficientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El paper menciona una sección de resultados empíricos (sección 5), pero no se incluye en el extracto proporcionado. No se dispone de cifras de MMLU, HumanEval, GSM8K u otras métricas estándar.

## Requisitos de hardware

- Entrenamiento: un AMD EPYC 9454P (48 núcleos, 96 hilos) fue suficiente para los 15 modelos del paper, con un coste total de 24 dólares en electricidad.
- Inferencia: al ser un modelo sub-2B con arquitectura dispersa, puede ejecutarse en CPU sin GPU. No se especifican requisitos mínimos de RAM, pero es razonable asumir que cabe en sistemas con 16 GB o menos.
- Opciones de despliegue: no se mencionan frameworks específicos (vLLM, llama.cpp, Ollama, TGI) en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos comparativos con modelos de la misma categoría (sub-2B, entrenados en CPU, arquitecturas alternativas). El paper afirma una eficiencia de coste órdenes de magnitud superior a la de entrenamiento en GPU, pero no se proporcionan cifras de rendimiento para comparar directamente con modelos como Qwen2-1.5B, Llama-3.2-1B o Gemma-2-2B.

## Limitaciones y advertencias

- El paper admite explícitamente que estos modelos no alcanzan la paridad con modelos frontera entrenados en miles de GPUs con billones de tokens.
- No se han publicado evaluaciones de sesgos, robustez o seguridad. Al ser modelos de investigación, pueden presentar alucinaciones o comportamientos indeseados.
- La información disponible no detalla el contexto máximo soportado ni el formato de pesos, lo que dificulta su integración directa en pipelines existentes.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo no ha sido validado en entornos de producción.
- El entrenamiento se limitó a inglés; no hay evidencia de capacidades multilingües.
- La metodología se basa en un solo tipo de procesador (AMD EPYC 9454P); los resultados pueden no reproducirse en otras CPUs sin optimizaciones similares.

## Enlaces

- HuggingFace: https://huggingface.co/reaperdoesntknow/Structure-Over-Scale
- DOI del paper: 10.57967/hf/8165
- Perfil del autor: https://huggingface.co/reaperdoesntknow/reaperdoesntknow

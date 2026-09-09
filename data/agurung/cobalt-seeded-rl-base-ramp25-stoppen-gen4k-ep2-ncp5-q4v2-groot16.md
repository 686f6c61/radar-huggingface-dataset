# agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-q4v2-groot16

## Resumen

El modelo `cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-q4v2-groot16` es un checkpoint de aprendizaje por refuerzo (RL) sobre la base `Qwen/Qwen3-4B-Instruct-2507`, desarrollado por `agurung` como parte de un experimento etiquetado como `seeded_rl_base`. Se trata de un modelo de generación de texto de 4.411.424.256 parámetros, enfocado en generación de código, entrenado con GRPO (Group Relative Policy Optimization) de OpenRLHF. Su propósito principal es mejorar la capacidad del modelo base para resolver problemas de programación, mediante una recompensa binaria basada en la corrección de los programas generados (pasan o no los tests). El checkpoint guardado en la rama `main` es el mejor de su run según la métrica pass@8.

El entrenamiento se aplica directamente al modelo base sin una etapa previa de SFT (seed from base), lo que lo convierte en una exploración de RL desde cero. La receta incluye penalizaciones de stop-properly y overlong, un máximo de 4096 tokens nuevos por rollout y 8 muestras por prompt. Este modelo es relevante para investigadores y desarrolladores que buscan checkpoints de RL aplicados a código, especialmente para estudiar el efecto del RL puro en modelos instruct de tamaño medio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3) |
| Parámetros totales | 4.411.424.256 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3-4B-Instruct-2507, un transformer denso de aproximadamente 4B parámetros. Sobre esta base, se ha aplicado un pipeline de RL con el algoritmo GRPO (Group Relative Policy Optimization) sin penalización KL, implementado en OpenRLHF. El modelo fue inicializado directamente desde el modelo base instruct sin una etapa previa de SFT (seeded from base). El entrenamiento se realizó sobre un subconjunto de problemas de código denominado `cobalt-train ≤2/64 frontier`, que contiene 1833 problemas de entrenamiento y 112 de validación, seleccionados porque el modelo base los resolvía como máximo 2 de cada 64 muestras.

La señal de recompensa es binaria: 1.0 si el programa generado supera los tests del problema, 0.0 en caso contrario. Para evitar truncamientos, se aplicó una penalización de -1.0 a las muestras truncadas, y una penalización adicional de DAPO overlong que comienza en los últimos 1024 tokens antes del límite, con un ramp hasta -0.25. El rollout utilizó 8 muestras por prompt, con tamaño de lote de 128 tanto en rollout como en entrenamiento, y un máximo de 4096 tokens nuevos. Se entrenó durante 2 episodios con un learning rate del actor de 1e-06 constante. El checkpoint guardado corresponde al paso global 8.

## Capacidades

- Generación de código: el modelo está optimizado para producir programas que pasen tests de corrección, gracias a la recompensa binaria de RL.
- Resolución de problemas algorítmicos: entrenado en problemas de programación de la frontera `≤2/64`, lo que sugiere competencia en problemas de dificultad media-alta para el modelo base.
- Generación de texto instructivo: al partir de Qwen3-4B-Instruct-2507, hereda la capacidad de seguir instrucciones del modelo base.
- No se ha documentado soporte para tool calling, function calling, agentes o modo de pensamiento explícito en la información disponible.

## Casos de uso

- Generación de soluciones en plataformas de código competitivo: el modelo puede generar programas para problemas algorítmicos, aprovechando su optimización para pasar tests.
- Asistente de programación en entornos de desarrollo integrados (IDE): puede autocompletar o proponer funciones y fragmentos de código en tiempo real, gracias a su capacidad de generación de texto.
- Automatización de pruebas unitarias: puede servir para generar código que cumpla especificaciones concretas, ayudando a rellenar funciones esqueleto en proyectos.
- Prototipado rápido de scripts: para desarrolladores que necesitan scripts cortos y verificables, el modelo puede producir código con alta probabilidad de ejecución correcta.
- Educación en programación: puede utilizarse como herramienta de generación de ejemplos resueltos para estudiantes, ya que los problemas de validación son de tipo `clean_eval`.
- Benchmarking de RL para código: para investigadores, es un checkpoint utilizable para comparar el impacto de distintas recetas de RL sobre un mismo modelo base en tareas de generación de código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que las métricas de evaluación en el log de entrenamiento no están disponibles. No se ofrecen cifras de MMLU, HumanEval, GSM8K u otros benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en safetensors ocupan 8.8 GB, lo que sugiere un formato FP16/BF16. Para inferencia FP16 se estiman al menos 10-12 GB de VRAM considerando el estado y el KV cache; con cuantización 4-bit, la VRAM necesaria podría reducirse a alrededor de 3-4 GB (estimación no proporcionada oficialmente).
- GPU recomendadas: una RTX 4090 (24 GB) o RTX 3090 (24 GB) ejecutaría el modelo en FP16 con margen; tarjetas de 12 GB podrían funcionar con cuantización.
- Si cabe en consumer GPU: sí, aunque se recomienda al menos 12 GB de VRAM para FP16, y las GPUs de 8 GB podrían ser insuficientes sin cuantización.
- Opciones de despliegue: vLLM (según la model card), transformers, y potencialmente llama.cpp u Ollama para ejecución en CPU/GPU mediante cuantización. TGI no se menciona pero es compatible con la biblioteca transformers.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

Se carece de datos de benchmarks publicados. El modelo es un checkpoint de RL sobre `Qwen/Qwen3-4B-Instruct-2507`, y existen otras variantes del mismo run en el repositorio del autor (por ejemplo, `cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-nb21iid16` y `...-nb21groot16`), pero no se han documentado comparativas entre ellos.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|
| Qwen/Qwen3-4B-Instruct-2507 (base) | 4.411.424.256 | No disponible | No disponible | No disponible |
| Este checkpoint | 4.411.424.256 | No disponible | Mejor por pass@8 en su run según la model card | No disponible |

Nota: no hay datos de benchmarks que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Sesgos: no se han documentado sesgos específicos, pero al ser un modelo entrenado sobre un conjunto acotado de problemas de código, puede sesgarse hacia estilos o patrones de esos problemas.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar código incorrecto o inventar APIs que no existen, a pesar de la recompensa de corrección.
- Limitaciones de contexto o idioma: no se ha documentado la longitud de contexto ni los idiomas soportados; se desconoce el comportamiento fuera de los datos de entrenamiento.
- Restricciones de licencia: la licencia no está publicada, lo que impide determinar si es apto para uso comercial.
- Caveat para producción: es un checkpoint experimental de RL, con 0 descargas y sin métricas de evaluación públicas; debe validarse de forma independiente antes de usarlo en entornos de producción.
- Sin SFT previo: al entrenarse directamente sobre el modelo base, puede presentar comportamientos menos pulidos que un modelo con RLHF convencional.

## Enlaces

- HuggingFace: https://huggingface.co/agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-q4v2-groot16
- Variante similar: https://huggingface.co/agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-nb21iid16
- Variante similar: https://huggingface.co/agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-nb21groot16

Nota: la búsqueda web no ha aportado papers, blogs o demos adicionales.

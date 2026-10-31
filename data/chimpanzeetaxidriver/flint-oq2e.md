# chimpanzeetaxidriver/flint-oQ2e

## Resumen

Flint-oQ2e es una versión cuantizada en formato MLX del modelo base RecursiveSI/flint, publicada por el usuario chimpanzeetaxidriver en Hugging Face. Se trata de un modelo de generación de texto de aproximadamente 39,8 mil millones de parámetros, cuantizado mediante la herramienta oQ (oMLX v0.7.3.dev1) con cuantización de precisión mixta, lo que reduce el checkpoint completo a unos 13,9 GB con una media efectiva de 2,795 bits por peso.

La relevancia de esta ficha radica en la cuantización agresiva: el 95 % de los pesos se almacenan en formato afín de 2 bits (grupo 64), mientras que una pequeña fracción de tensores sensibles se conserva en 8 bits o BF16. Esto permite ejecutar un modelo de ~40B de parámetros en hardware con memoria unificada (por ejemplo, Mac con Apple Silicon), que es el ecosistema al que se dirige la librería MLX.

No se ha publicado información sobre la arquitectura del modelo base, los datos de entrenamiento, la longitud de contexto ni los resultados de benchmarks, por lo que esta ficha documenta principalmente los aspectos de cuantización y despliegue, que son los datos verificables disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: RecursiveSI/flint) |
| Parametros totales | 39.785.299.488 (~39,79B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Afín 2 bits (grupo 64), afín 8 bits (grupos 64 y 128), BF16; media efectiva 2,795 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería MLX) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo base RecursiveSI/flint (tipo de transformer, número de capas, cabeceras de atención, etc.) ni sobre su proceso de entrenamiento (tokens, composición del dataset, RLHF/DPO). Lo único documentado es el proceso de cuantización posterior, realizado con oQ (oMLX v0.7.3.dev1), que aplica cuantización de precisión mixta: la mayoría de los pesos (95,134 %) se almacenan en formato afín de 2 bits con grupo 64, mientras que aproximadamente el 4 % de los pesos se conservan en 8 bits y una fracción mínima (0,063 %) en BF16. Esta estrategia de precisión mixta busca preservar la calidad de los tensores más sensibles manteniendo una huella de memoria muy reducida.

## Capacidades

- Generacion de texto: el modelo está etiquetado con el pipeline `text-generation` y uso conversacional.
- Cuantización de precisión mixta: diseño optimizado para minimizar el uso de memoria sin cuantizar uniformemente todos los tensores.
- Compatibilidad con el ecosistema MLX de Apple para inferencia en hardware Apple Silicon.
- No hay información disponible sobre capacidades de razonamiento, código, matemáticas, visión, audio, tool calling ni soporte de agentes.

## Casos de uso

- Inferencia local en Apple Silicon: gracias al formato MLX y a los 13,9 GB del checkpoint, el modelo puede ejecutarse en Macs con memoria unificada suficiente (32 GB o más), permitiendo experimentar con un modelo de ~40B sin servidores con GPU dedicada.
- Experimentación con cuantización extrema: al usar 2 bits con precisión mixta, es un buen candidato para evaluar cuánta calidad se pierde con cuantizaciones muy agresivas frente al modelo base.
- Chatbots personales offline: al estar etiquetado como conversacional, puede integrarse en interfaces de chat locales para uso privado sin depender de servicios en la nube.
- Prototipado de aplicaciones de texto: puede usarse como backend de generación de texto en scripts y aplicaciones Python mediante la librería MLX.
- Pruebas de regresión de cuantización: útil como caso de estudio para comparar distribuciones de bits (2-bit vs 8-bit vs BF16) y su impacto en la salida del modelo.
- Despliegue en entornos con memoria limitada: donde el modelo base en precisión completa (que requeriría ~80 GB en BF16) no cabe, esta versión reduce el requisito a ~14 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: unos 13,9 GB (12,944 GiB) solo de pesos; en la práctica se recomienda disponer de 16-24 GB de memoria unificada o VRAM para acomodar pesos, contexto y overhead de ejecución.
- GPU recomendadas: al ser un modelo en formato MLX, está orientado a Apple Silicon (por ejemplo, Mac Studio o MacBook Pro con chips M-series y 32 GB o más de memoria unificada). No hay datos oficiales sobre rendimiento en GPU NVIDIA; en teoría MLX también puede ejecutarse en CUDA, pero no está documentado para este repo.
- Consumer GPUs: no cabe cómodamente en GPUs de consumo de 12-16 GB (RTX 3060/4070) considerando el overhead; una RTX 4090 (24 GB) podría alojarlo, aunque MLX no es el formato habitual en ese entorno (sería preferible una versión GGUF).
- Opciones de despliegue: librería MLX de Apple (mlx-lm para inferencia de modelos de texto). No hay evidencia de soporte directo en vLLM, llama.cpp, Ollama o TGI para este checkpoint concreto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Bits efectivos | Licencia | Notas |
|---|---|---|---|---|---|
| chimpanzeetaxidriver/flint-oQ2e | 39,79B | MLX (safetensors) | 2,795 | Apache 2.0 | Cuantización mixta 2/8 bits |
| RecursiveSI/flint (base) | ~39,79B (estimado, mismo modelo sin cuantizar) | no disponible | 16 (BF16 presumible) | no disponible | Modelo original sin cuantizar |
| Alternativas MLX ~40B en 2-4 bits | no disponible | MLX | 2-4 | variable | Existen cuantizaciones MLX de otros modelos ~40B, pero no hay datos comparativos publicados para este caso |

No se han publicado comparativas de rendimiento con otros modelos en la informacion disponible.

## Limitaciones y advertencias

- Falta de documentación: la model card no describe la arquitectura, el contexto, los datos de entrenamiento ni las capacidades del modelo base, lo que dificulta evaluar su idoneidad para producción.
- Cuantización extrema: con una media de 2,795 bits/peso y el 95 % de los tensores en 2 bits, es esperable una degradación notable de calidad respecto al modelo base en BF16, especialmente en razonamiento complejo, código y tareas multilingües.
- Riesgo de alucinación: no cuantificado, pero los modelos de lenguaje en general pueden generar contenido falso, y la cuantización agresiva puede agravarlo.
- Idiomas: no especificados; no hay garantía de buen rendimiento en castellano.
- Sesgos: no documentados; como todo modelo de lenguaje, puede reflejar sesgos presentes en sus datos de entrenamiento.
- Ecosistema: el formato MLX limita el despliegue principalmente a hardware Apple; para servir en GPUs NVIDIA con vLLM o TGI habría que recurrir al modelo base u otras cuantizaciones.
- Licencia: Apache 2.0 permite uso comercial, pero las condiciones del modelo base RecursiveSI/flint deben verificarse por separado.
- Adopción mínima: con 307 descargas y 1 like, no existe una comunidad de usuarios que haya validado su funcionamiento en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chimpanzeetaxidriver/flint-oQ2e
- Modelo base: https://huggingface.co/RecursiveSI/flint
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx

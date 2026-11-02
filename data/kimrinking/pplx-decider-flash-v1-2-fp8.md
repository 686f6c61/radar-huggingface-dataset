# kimrinking/pplx-decider-flash-v1.2-fp8

## Resumen

PPLX Decider Flash v1.2 FP8 es una cuantización estática en FP8 del modelo `perplexity-ai/pplx-decider-flash-v1.2`, publicada por el usuario kimrinking. No es un modelo generativo de propósito general: es un modelo de decisión que puntúa opciones y devuelve probabilidades por cada alternativa, con un adaptador que expone esa funcionalidad como servicio de clasificación de texto. El modelo base lo desarrolla Perplexity AI y esta versión concreta aplica cuantización con NVIDIA ModelOpt 0.44.0.

El modelo cuenta con 4.539.265.536 parámetros en pesos safetensors y un repositorio de 5,5 GB. La cuantización afecta a 248 módulos lineales del modelo de lenguaje, mientras que la torre de visión, las convoluciones y el módulo de lectura de decisiones se mantienen en BF16. La licencia es Apache-2.0 y la librería de referencia es vLLM.

Su relevancia es acotada pero específica: sirve para integrar un componente de scoring de decisiones dentro de pipelines de agentes, sistemas de enrutamiento o evaluación de alternativas, con un rendimiento medido de hasta 33,3 peticiones por segundo en concurrencia 32 sobre una DGX Spark GB10.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con atención completa no causal y atención lineal causal (etiqueta `qwen3_5`), con torre de visión y módulo de lectura de decisiones |
| Parámetros totales | 4.539.265.536 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | FP8 E4M3 estático con escalas per-tensor; BF16 en convolución, torre de visión y lectura de decisiones |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (cuantización ModelOpt, requiere vLLM) |

## Arquitectura y entrenamiento

El modelo base es un transformer con una combinación híbrida de atención: la atención completa permanece no causal, mientras que la atención lineal es causal. Incluye una torre de visión y un módulo específico de lectura de decisiones que produce probabilidades por opción. La cuantización se realizó con NVIDIA ModelOpt 0.44.0 usando la configuración `FP8_DEFAULT_CFG+no_visual`, con calibración de tipo max sobre 160 peticiones de decisión. Se cuantizaron 248 módulos lineales del modelo de lenguaje antes de la fusión de vLLM; el resto de componentes se conservan en BF16. El tokenizador, el protocolo y el módulo de lectura de decisiones originales están incluidos.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo base. Tampoco se documentan innovaciones adicionales más allá de la propia cuantización estática y el adaptador de servicio.

## Capacidades

- Puntuación de opciones de decisión: recibe un `state` y una lista de `questions` y devuelve probabilidades por alternativa.
- Clasificación de texto mediante el pipeline `text-classification`.
- Servicio HTTP con los endpoints `POST /v1/decisions` y `POST /v1/systemone`.
- Soporte de peticiones concurrentes con rendimiento medido hasta concurrencia 32.
- Inferencia acelerada con vLLM y FlashInfer GDN.
- El servidor incluido es solo de texto; la torre de visión existe en los pesos pero no se expone en el adaptador.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.

## Casos de uso

- Enrutamiento de decisiones en agentes: el modelo puede recibir el estado de un agente y varias acciones candidatas y devolver la probabilidad de cada una, lo que permite seleccionar la siguiente acción de forma determinista y auditable.
- Evaluación de alternativas en sistemas de recomendación: dado un contexto y un conjunto de opciones, se obtiene una distribución de probabilidad utilizable para ranking.
- Clasificación de intenciones en asistentes conversacionales: el endpoint `/v1/decisions` permite mapear una consulta a una de varias intenciones predefinidas con puntuaciones calibradas.
- Moderación o triaje de contenido: se pueden puntuar categorías de decisión sobre un texto de entrada y aplicar umbrales sobre las probabilidades devueltas.
- Componente de scoring en pipelines de CI/CD para evaluación automática: la API HTTP facilita integrarlo como servicio independiente con métricas de latencia y throughput conocidas.
- Investigación en modelos de decisión: al ser una cuantización FP8 con receta y artefactos de procedencia incluidos, sirve para reproducir experimentos de cuantización sobre modelos de scoring.

## Benchmarks y rendimiento

Evaluación sobre DGX Spark GB10 con vLLM 0.32.0 y FlashInfer GDN, 5 arranques independientes con la misma caché restaurada, 1.024 peticiones por nivel de concurrencia tras el calentamiento.

| Métrica | Resultado |
|---|---:|
| Precisión | 645/838 · 76,969 % |
| Precisión excluyendo solapamiento conocido de calibración | 544/695 · 78,273 % |
| Throughput, concurrencia 1 | 20,469 ± 0,063 req/s |
| Throughput, concurrencia 8 | 32,084 ± 0,300 req/s |
| Throughput, concurrencia 32 | 33,318 ± 0,090 req/s |

Se trata de la evaluación personalizada DecisionCore, no del Decision Index oficial. Se excluyeron dos ítems compartidos de longitud excesiva del conjunto de 840. Las respuestas y probabilidades coincidieron en los 5 arranques correctos con caché fija; un arranque adicional falló antes de estar listo con un error de instrucción ilegal de CUDA.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo de pesos ocupa 5,51 GB; se recomienda al menos 16 GB de VRAM para margen de activaciones y caché.
- GPU validadas: DGX Spark GB10 (arquitectura aarch64). No se documentan otras GPU probadas.
- GPU consumer: no hay datos publicados sobre funcionamiento en RTX 4090 u otras consumer; el requisito de FP8 y FlashInfer limita las opciones a GPUs con soporte adecuado.
- Entorno validado: Linux aarch64, CUDA 13.0, vLLM 0.32.0, PyTorch 2.13.0+cu130, Transformers 5.19.0, FlashInfer 0.7.1.
- Despliegue: vLLM con el adaptador incluido (`runtime/start.sh` y `runtime/example.py`). No se documenta soporte para llama.cpp, Ollama ni TGI.
- Throughput medido: 20,469 req/s en concurrencia 1 y 33,318 req/s en concurrencia 32 sobre DGX Spark GB10.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada.

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| pplx-decider-flash-v1.2-fp8 | 4.539.265.536 | no disponible | Apache-2.0 | safetensors FP8 | Cuantización estática, requiere vLLM |
| perplexity-ai/pplx-decider-flash-v1.2 | no disponible | no disponible | no disponible | no disponible | Modelo base sin cuantizar |
| Alternativas de scoring de decisión | no disponible | no disponible | no disponible | no disponible | No se dispone de datos |

## Limitaciones y advertencias

- El servidor incluido es solo de texto: la torre de visión está presente en los pesos pero no se expone en la API.
- Un arranque de cada seis falló con un error de instrucción ilegal de CUDA antes de estar listo, lo que indica cierta inestabilidad en el entorno validado.
- La instalación de dependencias desde cero y la ejecución desde un snapshot descargado del Hub no han sido probadas por el autor.
- El adaptador importa `source/src` directamente; instalar `./source` puede reemplazar dependencias del runtime.
- La evaluación usa el conjunto personalizado DecisionCore, no el Decision Index oficial, por lo que los resultados no son directamente comparables con otras publicaciones.
- No se dispone de información sobre sesgos, riesgo de alucinación ni cobertura idiomática.
- El rendimiento solo está medido en DGX Spark GB10; no hay datos para otras GPU.
- Aunque la licencia es Apache-2.0, conviene revisar el `LICENSE` y `NOTICE` incluidos del modelo base antes de uso comercial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kimrinking/pplx-decider-flash-v1.2-fp8
- Modelo base: https://huggingface.co/perplexity-ai/pplx-decider-flash-v1.2

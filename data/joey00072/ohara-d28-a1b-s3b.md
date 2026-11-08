# joey00072/ohara-d28-a1b-s3b

## Resumen

ohara-d28-a1b-s3b es un checkpoint de preentrenamiento de la primera etapa (Stage-1, contexto de 4k) del modelo ohara, una arquitectura hibrida causal encoder-decoder desarrollada por el usuario joey00072. Se trata de un modelo base, no ajustado por instrucciones, con 23.846.942.486 parametros totales segun los pesos en safetensors, de los cuales aproximadamente 0,98 mil millones corresponden a la matriz activa del backbone (1,25 mil millones incluyendo la cabeza LM). El checkpoint se publica en Hugging Face bajo la libreria propia `ohara` y esta pensado para continuar el preentrenamiento o servir como base para etapas posteriores.

La relevancia de este modelo reside en su diseno arquitectonico: combina atencion con ventana deslizante (SWA), atencion global puenteada por KV, atencion token-sparse, residuales mHC, memoria de n-gramas y una capa MoE con 256 expertos y top-8 mas un experto compartido. Esta mezcla de mecanismos busca eficiencia computacional con un numero reducido de parametros activos por token, algo similar en espiritu a otros modelos MoE de grano fino, pero con innovaciones propias en el tratamiento de la atencion y la memoria.

El checkpoint corresponde al paso 596, con 7.499.415.552 tokens procesados (hito del 25 % del entrenamiento previsto) y una perdida de entrenamiento de 1,2523 nats. Al ser un modelo base sin ajuste instructivo y con muy pocas descargas y likes, su interes es principalmente experimental y de investigacion, no de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida causal encoder-decoder (transformer con SWA, atencion global puenteada por KV, atencion token-sparse, residuales mHC, memoria de n-gramas, MoE) |
| Parametros totales | 23.846.942.486 |
| Parametros activos | ~0,98B en el backbone (1,25B incluyendo la cabeza LM) |
| Longitud de contexto | 4096 tokens (Stage-1) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (tokenizador Qwen3) |
| Licencia | no disponible |
| Formato de pesos | safetensors (exportado con `ohara.pretrain.export.load_hf`) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura hibrida causal encoder-decoder denominada `d28 final_v2`. Incorpora atencion con ventana deslizante (SWA) combinada con atencion global puenteada por KV y atencion token-sparse, lo que permite alternar mecanismos locales y globales para reducir el coste cuadratico de la atencion. Ademas, emplea residuales mHC (multi-head connections) y un mecanismo de memoria de n-gramas, elementos poco habituales en transformers estandar que buscan mejorar la eficiencia y la retencion de informacion a corto plazo.

La capa de mezcla de expertos (MoE) cuenta con 256 expertos con enrutamiento top-8 mas un experto compartido, lo que da lugar a un modelo de grano muy fino con solo ~0,98B parametros activos por token frente a 23,85B totales. El tokenizador es el de Qwen3. El entrenamiento se realizo sobre 7.499.415.552 tokens hasta el paso 596 (hito del 25 %), con una perdida de 1,2523 nats. No se dispone de informacion sobre la composicion del dataset, el uso de RLHF/DPO ni otras tecnicas de alineacion; al ser un checkpoint de preentrenamiento, no ha pasado por ajuste instructivo.

## Capacidades

- Generacion de texto autoregresiva como modelo base de lenguaje.
- Razonamiento y modelado de lenguaje general (sin ajuste instructivo, por lo que no sigue instrucciones de forma fiable).
- Capacidad potencial de codigo y matematicas heredada del preentrenamiento, aunque no verificada con benchmarks.
- Soporte de tool calling / function calling: no disponible (modelo base).
- Soporte de agentes y razonamiento multi-paso: no disponible (modelo base).
- Capacidades multilingues: no disponible; depende del tokenizador Qwen3 y de los datos de entrenamiento, no documentados.
- Capacidades especiales (thinking mode, vision, audio): no disponible.
- Contexto limitado a 4096 tokens en esta etapa.

## Casos de uso

- Investigacion en arquitecturas hibridas de atencion: el modelo sirve para estudiar el comportamiento de SWA, atencion global puenteada por KV y atencion token-sparse en un transformer causal, comparando con arquitecturas estandar.
- Estudio de MoE de grano fino: con 256 expertos y top-8, permite analizar el enrutamiento, la especializacion de expertos y el equilibrio de carga en modelos con pocos parametros activos.
- Continuacion de preentrenamiento: al ser un checkpoint intermedio (25 % del entrenamiento), es util para reanudar el entrenamiento o hacer fine-tuning sobre una base ya entrenada con 7,5B tokens.
- Experimentos con memoria de n-gramas y residuales mHC: permite evaluar el impacto de estos mecanismos en tareas de modelado de lenguaje y recuperacion de informacion local.
- Fine-tuning supervisado para tareas concretas: partiendo del modelo base, se puede ajustar para clasificacion, generacion o extraccion en dominios especificos, aunque requiere recursos considerables (23,85B parametros totales).
- Benchmarking de eficiencia: util para medir throughput y latencia de un MoE con ~0,98B activos frente a modelos densos de tamano comparable, en entornos de investigacion.
- Reproducibilidad de entrenamiento: el repositorio incluye un estado de entrenamiento reanudable (`ohara-d28-a1b-stage1-state`), lo que facilita replicar o continuar el run.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento es la perdida de entrenamiento de 1,2523 nats en el paso 596 tras 7.499.415.552 tokens.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia, los pesos en safetensors ocupan 47,7 GB en el repositorio, lo que sugiere que en precision completa (probablemente bf16/fp16) se necesita al menos ~48 GB de VRAM solo para los pesos, mas overhead de activaciones y KV cache.
- GPU recomendadas: A100 80 GB, H100 80 GB o superiores para inferencia en precision completa. No se dispone de informacion sobre cuantizaciones que permitan reducir requisitos.
- Cabe en consumer GPU: no en configuracion estandar; con cuantizacion agresiva (no documentada) podria intentarse en GPUs de 24 GB, pero no hay soporte confirmado.
- Opciones de despliegue: la libreria propia `ohara` (instalable desde el repositorio GitHub `joey00072/ohara`) y el helper `ohara.pretrain.export.load_hf`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ohara-d28-a1b-s3b | 23,85B | ~0,98B (1,25B con LM head) | 4096 | no disponible | Hugging Face, libreria propia |
| ohara-d28-a1b-stage1 | ~23,4B | ~1,02B | 4096 | no disponible | Hugging Face |
| Modelos MoE de grano fino comparables (p. ej. Qwen3 MoE) | no disponible en la informacion | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas en la informacion proporcionada, por lo que la comparativa cuantitativa no esta disponible.

## Limitaciones y advertencias

- Modelo base sin ajuste instructivo: no sigue instrucciones de forma fiable y puede generar contenido incoherente o repetitivo en tareas de dialogo.
- Checkpoint intermedio: solo ha visto el 25 % del entrenamiento previsto (7,5B tokens de un total no especificado), por lo que su calidad esta por debajo de un modelo final.
- Contexto limitado a 4096 tokens, insuficiente para tareas que requieran ventanas largas.
- Sesgos conocidos: no documentados; al no conocerse la composicion del dataset, no se pueden evaluar sesgos de genero, raza, idioma o dominio.
- Riesgo de alucinacion: inherente a los modelos de lenguaje base, agravado por el entrenamiento parcial.
- Restricciones de licencia: la licencia no esta disponible, por lo que no se puede confirmar el uso comercial. Se recomienda contactar con el autor antes de cualquier uso en produccion.
- Idiomas soportados no documentados: el tokenizador Qwen3 sugiere cobertura multilingue, pero no hay garantias.
- Sin soporte documentado para tool calling, agentes o cuantizacion, lo que limita su integracion en pipelines de produccion.
- Comunidad practicamente inexistente (0 descargas, 0 likes): no hay casos de uso validados ni soporte externo.
- El repositorio ocupa 47,7 GB y requiere la libreria `ohara` para cargar los pesos, lo que anade friccion frente a formatos estandar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joey00072/ohara-d28-a1b-s3b
- Checkpoint hermano Stage-1: https://huggingface.co/joey00072/ohara-d28-a1b-stage1
- Estado de entrenamiento reanudable: https://huggingface.co/joey00072/ohara-d28-a1b-stage1-state
- Repositorio GitHub de la libreria ohara: https://github.com/joey00072/ohara

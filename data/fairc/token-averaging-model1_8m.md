# FAIRC/token-averaging-model1_8m

## Resumen

El modelo `FAIRC/token-averaging-model1_8m` es un checkpoint de investigación publicado por FAIRC dentro de un proyecto centrado en la técnica de *token averaging*. Se trata de un modelo transformer pequeño, de aproximadamente 7,6 millones de parámetros, con una ventana de contexto de 512 tokens. No está diseñado para uso productivo, sino como artefacto experimental para estudiar el efecto de promediar representaciones de tokens durante el entrenamiento o la inferencia.

El repositorio contiene únicamente los pesos crudos en formato `final.pt` (un `state_dict` de PyTorch), junto con un registro de pérdidas (`loss_log.csv`). No se incluyen pesos compatibles con la librería `transformers` de Hugging Face, por lo que su uso requiere reconstruir la arquitectura desde la configuración JSON proporcionada. La relevancia actual del modelo es limitada fuera del ámbito académico, pero puede servir como referencia para investigaciones sobre métodos de regularización o promediado de representaciones en transformers pequeños.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (OLMTransformerBody) con token averaging |
| Parametros totales | 7.612.544 (aproximado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (pesos en fp32 probablemente, no especificado) |
| Idiomas soportados | no disponible (no especificado) |
| Licencia | no disponible |
| Formato de pesos | PyTorch `state_dict` (`checkpoints/final.pt`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder con las siguientes dimensiones: `d_model=128`, `n_heads=4`, `n_layers=6`, `context_len=512` y `tie_embeddings=true`. La característica distintiva es el parámetro `averaging_k=1`, que sugiere que el modelo implementa una operación de promediado de tokens en alguna capa o mecanismo interno. No se especifica si se trata de promediado de embeddings, de atención o de otra variante.

El entrenamiento se configuró con una tasa de aprendizaje de `0.0004`, 500 pasos de *warmup* y un objetivo de 300 millones de tokens (`target_tokens=300000000`). El `state_dict` guarda el paso de entrenamiento, el número de tokens vistos y los FLOPs acumulados, lo que permite auditar el progreso. No se menciona el uso de RLHF, DPO u otras técnicas de alineación. El dataset de entrenamiento no está especificado, aunque el nombre del proyecto "chinchilla" en la ruta de configuración sugiere que se siguieron las leyes de escala de Chinchilla para dimensionar el modelo y los datos.

## Capacidades

- Generación de texto: el modelo es un transformer causal, por lo que puede generar secuencias de texto de hasta 512 tokens, aunque su pequeño tamaño limita la calidad.
- Investigación sobre token averaging: su propósito principal es servir como banco de pruebas para estudiar el impacto del promediado de tokens en el entrenamiento o la inferencia.
- Reproducibilidad: al incluir el log de pérdidas y los metadatos de entrenamiento, permite comparar curvas de convergencia con otros experimentos.
- No se conocen capacidades especiales como tool calling, agentes, visión o audio.

## Casos de uso

- Estudio académico de técnicas de regularización: el modelo permite a investigadores analizar cómo el *token averaging* afecta a la pérdida, la convergencia y la calidad de las representaciones internas en transformers pequeños.
- Benchmark de escalado: al estar dimensionado según las leyes de Chinchilla, puede usarse para validar predicciones teóricas sobre el número óptimo de parámetros y tokens en modelos miniatura.
- Desarrollo de métodos de promediado: sirve como punto de partida para implementar y probar variantes de *averaging* (por ejemplo, sobre embeddings, salidas de atención o capas ocultas) antes de escalar a modelos mayores.
- Educación en arquitecturas transformer: al ser pequeño y con una configuración simple, es útil para enseñar a estudiantes cómo se carga y se inspecciona un `state_dict` de PyTorch.
- Depuración de pipelines de entrenamiento: el log de pérdidas y los checkpoints pueden utilizarse para verificar que un pipeline de entrenamiento reproduce los mismos resultados.
- Comparación de eficiencia: permite medir el coste computacional (FLOPs acumulados) de una técnica concreta en un entorno controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio solo incluye un registro de pérdidas (`loss_log.csv`), pero no se proporcionan métricas como MMLU, HumanEval o GSM8K. Tampoco hay comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: al tener solo 7,6 millones de parámetros, el modelo cabe en cualquier GPU con más de 1 GB de VRAM. En fp32, los pesos ocupan aproximadamente 30 MB; en fp16, unos 15 MB.
- GPU recomendadas: cualquier GPU moderna, incluso integradas de gama baja (por ejemplo, NVIDIA GTX 1650 o superiores). No requiere hardware especializado.
- Ejecución en CPU: viable sin problemas, con latencia de milisegundos por token.
- Opciones de despliegue: al ser un `state_dict` crudo, no es compatible directamente con vLLM, llama.cpp u Ollama. Requiere cargar la arquitectura personalizada desde `config.json` y luego usar PyTorch estándar.
- Latencia y throughput: no se han medido, pero en una GPU media se esperan cientos de tokens por segundo dada la pequeña escala.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo, por lo que una comparativa numérica no es posible. Sin embargo, por tamaño y configuración puede situarse en la misma categoría que otros modelos de investigación de menos de 10 millones de parámetros, como:

| Modelo | Parámetros | Contexto | Notas |
|---|---|---|---|
| FAIRC/token-averaging-model1_8m | 7,6 M | 512 | Enfoque experimental en token averaging |
| GPT-2 small (124M) | 124 M | 1024 | Mucho mayor, con benchmarks conocidos |
| Pythia-70M | 70 M | 2048 | Modelo de investigación con datos públicos |

La comparación directa no es significativa porque el modelo de FAIRC no ha sido evaluado en tareas estándar y su propósito es interno.

## Limitaciones y advertencias

- No es un modelo listo para producción: carece de alineación, evaluación de seguridad y soporte de la librería `transformers`.
- Licencia no especificada: no se indica bajo qué términos puede usarse o redistribuirse, lo que impide su uso comercial sin autorización explícita.
- Sesgos y alucinaciones: al ser un modelo diminuto entrenado probablemente con un corpus no documentado, es muy propenso a generar texto incoherente o falso. No se han realizado auditorías de sesgo.
- Limitaciones de contexto: la ventana de 512 tokens es corta para tareas que requieran razonamiento de largo alcance.
- Formato de pesos propietario: el checkpoint no es compatible con herramientas estándar (vLLM, Ollama, etc.), lo que dificulta su integración.
- Falta de documentación: no se detalla el dataset de entrenamiento, el preprocesado ni los hiperparámetros exactos de regularización, lo que limita la reproducibilidad externa.
- Fecha de creación futura: el repositorio indica una fecha de creación de 2026-08-18, lo que sugiere que puede ser un artefacto sintético o de prueba; conviene verificar su autenticidad antes de usarlo.

## Enlaces

- [Repositorio HuggingFace](https://huggingface.co/FAIRC/token-averaging-model1_8m)

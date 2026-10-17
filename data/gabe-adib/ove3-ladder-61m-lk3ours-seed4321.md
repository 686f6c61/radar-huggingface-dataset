# gabe-adib/ove3-ladder-61m-lk3ours-seed4321

## Resumen

`ove3-ladder-61m-lk3ours-seed4321` es un checkpoint de investigación publicado por el usuario gabe-adib en HuggingFace. No se trata de un modelo listo para producción, sino de una única ejecución (seed 4321) dentro de una "escalera de intervenciones" denominada ove3, en la rama K3 LatentMoE. El modelo es un MoE de tipo kimi_linear con 61M parámetros activos, 512 expertos de media anchura y enrutamiento top-16, entrenado sobre la celda IsoFLOP de 61M de la receta (mismos datos, LR, batch y pasos).

El checkpoint corresponde al paso de validación best_1 en la iteración 17.290, con una pérdida de validación de 1,1055 y una pérdida held-out de 1,1982 nats/char ponderada por mezcla sobre 9 dominios. El repositorio incluye el checkpoint Megatron distribuido con estado del optimizador, los logs de entrenamiento y puntuación, eventos de TensorBoard y el `config.yaml` de la ejecución.

Su relevancia es fundamentalmente metodológica: sirve para estudiar intervenciones sobre arquitecturas MoE con atención linear, comparar recetas de enrutamiento y reproducir experimentos de escalado a pequeña escala. No hay información publicada sobre licencia, idiomas, contexto ni evaluaciones estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención linear (kimi_linear) y LatentMoE |
| Parametros totales | no disponible (estimacion derivada del repo: del orden de 600M-1B, sin confirmar) |
| Parametros activos | 61M |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | Megatron distributed checkpoint (no safetensors ni GGUF) |

Otros datos de la model card: 512 expertos de media anchura, enrutamiento top-16, RMSNorm con eps 1e-6, router scaling 2,446, semilla 4321. Tamaño del repositorio: 9,9 GB (incluye estado del optimizador).

## Arquitectura y entrenamiento

La arquitectura es un MoE de tipo kimi_linear (atención linear) con capa LatentMoE, 512 expertos de media anchura y enrutamiento top-16, lo que da 61M parámetros activos por token. La model card especifica dos hiperparámetros de la receta: RMSNorm con eps 1e-6 y router scaling de 2,446. No se detalla el número total de parámetros, la profundidad, la dimensión oculta ni la longitud de contexto.

El entrenamiento sigue la celda IsoFLOP de 61M de la receta ove3 (mismos datos, learning rate, batch y pasos que el resto de la escalera), con una única variable de intervención: la rama K3 LatentMoE con semilla 4321. No se especifica el número de tokens, la composición del dataset, ni si hubo RLHF/DPO. La pérdida se reporta en nats/char, lo que sugiere un modelado a nivel de carácter y una evaluación ponderada por mezcla sobre 9 dominios (detalle por dominio en `DOMAIN_NLL.txt`). El mejor paso de validación fue la iteración 17.290.

## Capacidades

- Modelado de lenguaje autoregresivo a nivel de carácter (la métrica es nats/char).
- Enrutamiento MoE con 512 expertos y top-16, relevante para estudiar especialización de expertos.
- Atención linear (kimi_linear), útil para analizar eficiencia en secuencias largas dentro del marco experimental.
- Checkpoint reproducible: incluye semilla, configuración y logs para replicar la ejecución.
- No hay evidencia publicada de tool calling, function calling, capacidades de agente, visión, audio ni modo "thinking".
- No hay información sobre capacidades multilingües ni sobre idiomas de entrenamiento.

## Casos de uso

- Investigación sobre enrutamiento MoE: analizar el comportamiento de 512 expertos top-16 en una celda de 61M activos para estudiar balanceo de carga y colapso de expertos.
- Ablaciones de arquitectura: comparar la rama K3 LatentMoE con otras ramas de la escalera ove3 manteniendo datos, LR, batch y pasos constantes.
- Estudio de atención linear: evaluar kimi_linear frente a atención estándar en régimen de bajo cómputo y contexto corto/medio.
- Reproducibilidad de recetas: reutilizar `config.yaml` y los logs para replicar la ejecución con la semilla 4321 y verificar la pérdida reportada.
- Análisis de pérdida por dominio: explotar `DOMAIN_NLL.txt` para estudiar cómo se distribuye el error entre los 9 dominios de la mezcla.
- Docencia y formación: usar un checkpoint pequeño y trazable para ilustrar cómo se entrena y evalúa un MoE con estado del optimizador incluido.
- Punto de partida para fine-tuning experimental: al ser un modelo de 61M activos, permite iterar con recursos modestos, aunque requiere convertir el formato Megatron distribuido.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Validation LM loss (best_1, iteracion 17.290) | 1,1055 |
| Held-out loss (mezcla ponderada, 9 dominios) | 1,1982 nats/char |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Tampoco se ofrecen comparaciones con otros modelos de la misma escalera.

## Requisitos de hardware

- El repositorio ocupa 9,9 GB e incluye el estado del optimizador, por lo que no representa el tamaño de inferencia en pesos.
- VRAM de inferencia: no disponible de forma directa; depende del recuento total de parámetros, que no se publica.
- Estimación orientativa: si el estado del optimizador está en fp32 (aproximadamente 16 bytes por parámetro incluyendo pesos y momentos de Adam), el total estaría en el rango de 600M-1B de parámetros; los pesos en bf16 ocuparían del orden de 1,2-2 GB, pero es una inferencia no confirmada por el autor.
- GPU recomendadas: no disponible. Para investigación en formato Megatron se suele requerir un entorno con varias GPU o al menos una GPU con suficiente memoria para cargar todos los expertos.
- GPU consumer: probablemente viable en tarjetas de 16-24 GB tras convertir el checkpoint a un formato de inferencia, pero no está verificado ni documentado.
- Opciones de despliegue: no se documentan. El formato nativo es Megatron distribuido; para vLLM, llama.cpp, Ollama o TGI haría falta una conversión previa, no soportada de forma oficial en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se han identificado en la información proporcionada checkpoints comparables de la misma familia ove3 ni de otras ramas de la escalera K3 con datos publicados. La comparativa con alternativas de mercado (por ejemplo, otros MoE pequeños) no es posible sin el recuento total de parámetros, la longitud de contexto y los resultados de evaluación, que no están disponibles. Se indica por tanto "no disponible".

## Limitaciones y advertencias

- Checkpoint de investigación, no un modelo de propósito general: no hay evaluaciones de calidad, seguridad ni sesgos.
- Licencia no especificada: no se puede asumir uso comercial; la ausencia de licencia implica incertidumbre legal.
- Idiomas no documentados: se desconoce la cobertura lingüística y el sesgo cultural de los datos de entrenamiento.
- Pérdida reportada en nats/char: sugiere modelado a nivel de carácter, lo que puede limitar la calidad en tareas que requieren tokenización subword.
- Riesgo de alucinación: no evaluado; al ser un modelo pequeño y de investigación, cabe esperar una fiabilidad baja en generación abierta.
- Contexto no documentado: no se puede garantizar un rendimiento adecuado en secuencias largas.
- Formato Megatron distribuido con estado del optimizador: requiere herramientas específicas para cargarlo o convertirlo; no es plug-and-play en pipelines estándar.
- Fecha de creación del repositorio (2026-10-17) y nula tracción (0 descargas, 0 likes): no hay validación por parte de la comunidad.
- No hay información sobre sesgos conocidos ni sobre procesos de alineación (RLHF/DPO).

## Enlaces

- HuggingFace: https://huggingface.co/gabe-adib/ove3-ladder-61m-lk3ours-seed4321
- No se han encontrado en la búsqueda web enlaces relevantes a este modelo, su paper, repositorio de código o demo. Los resultados devueltos (Gab AI, AI Model Radar, Gemini, Google AI Studio) no guardan relación con este checkpoint y se descartan.

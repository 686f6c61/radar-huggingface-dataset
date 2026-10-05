# ProtonPrat/anlp-a2-part1_moe_top2

## Resumen

El modelo `ProtonPrat/anlp-a2-part1_moe_top2` es un transformer causal de arquitectura personalizada con mezcla de expertos (MoE) desarrollado como parte de la asignatura ANLP (Advanced Natural Language Processing). Se trata de un modelo de traduccion de ingles a vietnamita y a japones (Part 1 del trabajo), entrenado por el usuario ProtonPrat y publicado en HuggingFace. Con 10.084.480 parametros totales y 30 millones de posiciones de entrenamiento consumidas, es un modelo de escala reducida orientado a un ejercicio academico, no a produccion.

La relevancia de esta ficha es doble: por un lado documenta un modelo MoE de bajo coste con resultados medibles (perplejidad de test de 8,31, BLEU de continuacion de 12,02); por otro, sirve como ejemplo de publicacion de artefactos academicos con pesos en `safetensors`, configuracion de arquitectura personalizada y tokenizador BPE byte-level entrenado desde cero. No registra una arquitectura AutoModel de Transformers, por lo que requiere el codigo del repositorio de la asignatura para cargarse.

El modelo se apoya en un dataset curado de tripletes en ingles, vietnamita y japones (`belumind/en-vi-ja-curated-500k-triplets`) y emplea enrutamiento top-2 entre expertos, segun indica el propio nombre del checkpoint. No dispone de licencia declarada, no tiene descargas ni likes, y sus resultados son de una unica semilla sin barrido de hiperparametros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal personalizado con mezcla de expertos (MoE) |
| Parametros totales | 10.084.480 |
| Parametros activos | no disponible (el nombre indica enrutamiento top-2, sin cifra publicada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo pesos completos publicados) |
| Idiomas soportados | ingles (en), vietnamita (vi), japones (ja) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`hf_export/model.safetensors`) y PyTorch pickle (`final.pt`, `latest.pt`, `best.pt`) |

## Arquitectura y entrenamiento

El modelo es un transformer causal de arquitectura personalizada con capas de mezcla de expertos y enrutamiento top-2, es decir, que por cada token se activan dos expertos. No se ha publicado el detalle de la configuracion (numero de capas, dimension del modelo, numero de expertos, dimension de la capa feed-forward), mas alla del fichero `hf_export/config.json` que acompana al checkpoint. El tokenizador es un BPE byte-level entrenado exclusivamente para este proyecto, y no se reutiliza un vocabulario preentrenado.

El entrenamiento consumio 30.000.000 de posiciones sobre el dataset `belumind/en-vi-ja-curated-500k-triplets` (revision `849990daee76e0f9e2eb9965e30e34bc1909a93d`). No se documenta el uso de RLHF ni de DPO; el autor indica que las actualizaciones del optimizador, el MoE y la decodificacion se implementaron para la asignatura con asistencia de codigo generado por LLM, y que el informe del proyecto describe los metodos numericos y los controles aplicados. Los resultados publicados son de una unica semilla y sin barrido de ajuste del optimizador.

## Capacidades

- Traduccion de ingles a vietnamita y de ingles a japones (Part 1 del trabajo), invocable con `--language vi` o `--language ja` mediante `scripts/infer.py`.
- Generacion de texto causal autorregresiva sobre el vocabulario BPE entrenado.
- Modelado de lenguaje y calculo de perplejidad, con valor de test de 8,310478.
- Continuacion de texto evaluada con BLEU, con valor de test de 12,022882.
- Enrutamiento MoE top-2 por token, que activa un subconjunto de expertos en cada paso.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas a los tres idiomas del entrenamiento (en, vi, ja).
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Ejercicio academico de traduccion en/vi y en/ja: el modelo traduce frases o documentos cortos entre ingles y vietnamita o japones, sirviendo como entrega evaluable en el contexto de la asignatura ANLP.
- Reproduccion de experimentos MoE a pequena escala: por su tamano (10 millones de parametros) permite estudiar el efecto del enrutamiento top-2 y de un tokenizador propio sin necesidad de infraestructura de GPU dedicada.
- Ensenanza de tecnicas de tokenizacion BPE byte-level: el tokenizador `hf_export/tokenizer.json` es un artefacto aislado que se puede usar para demostrar como se construye y evalua un vocabulario desde cero sobre un corpus multilingue.
- Pruebas de pipelines de evaluacion automatica: la combinacion de perplejidad y BLEU de continuacion permite ejercitar un flujo completo de metricas sobre un checkpoint pequeno y controlado.
- Benchmarking de decodificacion personalizada: dado que la decodificacion se implemento ad hoc, el modelo sirve para comparar estrategias de generacion (greedy, beam, muestreo) en un entorno reproducible.
- Base para extension a un trabajo de Parte 2: el autor distingue los modelos de traduccion (Part 1) de los de continuacion en ingles (Part 2), por lo que este checkpoint puede servir de punto de partida o comparacion en ejercicios posteriores.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Perplejidad en test | 8,310478 |
| BLEU de continuacion en test | 12,022882 |
| Posiciones de entrenamiento | 30.000.000 |
| Parametros totales | 10.084.480 |

No se han publicado comparaciones con MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible. El autor advierte que las metricas automaticas de verosimilitud y solapamiento (perplejidad y BLEU) no establecen calidad semantica.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB. Con 10 millones de parametros y pesos tipicamente en fp32, el checkpoint ocupa en torno a 40 MB; en fp16, alrededor de 20 MB. El repositorio completo ocupa 0,3 GB por incluir estados de reanudacion.
- GPU recomendadas: cualquier GPU moderna es suficiente; el modelo cabe holgadamente en una GTX 1650, RTX 3060, RTX 4090 o incluso en CPU. No se requiere A100 ni H100.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo e incluso en inferencia solo CPU.
- Opciones de despliegue: no es compatible directamente con vLLM, llama.cpp, Ollama ni TGI, ya que no registra arquitectura AutoModel de Transformers. La carga se realiza con la clase `src.part1.model.Transformer` del repositorio de la asignatura o con `scripts/infer.py`.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ProtonPrat/anlp-a2-part1_moe_top2 | 10.084.480 | no disponible | PPL test 8,31; BLEU test 12,02 | no disponible | HuggingFace (0 descargas) |
| DunkRonit/anlp-a2-part1-moe_top2_active | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| sanyam2005/anlp-a2-part1-moe-top2 | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| raunakseksaria/anlp-a2-moe | no disponible | no disponible | no disponible | no disponible | HuggingFace |

Los tres modelos alternativos encontrados en la busqueda web son entregas paralelas de la misma asignatura, por lo que constituyen la comparativa natural. No se han publicado sus especificaciones ni metricas en la informacion disponible. Modelos como Kolibri-1 (78B MoE, 3,46B activos) no son comparables por escala ni proposito.

## Limitaciones y advertencias

- Resultados de una unica semilla y sin barrido de ajuste del optimizador, segun declara el propio autor.
- Las metricas automaticas (perplejidad y BLEU) no garantizan calidad semantica de las traducciones.
- No hay licencia declarada, por lo que el uso comercial queda sin marco legal explicito.
- El modelo no registra arquitectura AutoModel de Transformers: no se puede cargar con `AutoModel.from_pretrained` ni desplegar con herramientas estandar como vLLM, Ollama, llama.cpp o TGI sin trabajo adicional.
- Contexto maximo no documentado, lo que impide planificar tareas con entradas largas.
- Idiomas limitados a ingles, vietnamita y japones; no se documenta cobertura de otras lenguas.
- Tokenizador entrenado solo para este proyecto, lo que limita la reutilizacion fuera del mismo.
- Riesgo de alucinacion y sesgos: no evaluado ni documentado en la model card.
- Orientado a un ejercicio academico; no se recomienda su uso en produccion sin validacion adicional.

## Enlaces

- HuggingFace: https://huggingface.co/ProtonPrat/anlp-a2-part1_moe_top2
- Run de Weights & Biases: https://wandb.ai/proton_prat/anlp-assignment-2/runs/gp90640p
- Dataset de entrenamiento: https://huggingface.co/datasets/belumind/en-vi-ja-curated-500k-triplets (revision `849990daee76e0f9e2eb9965e30e34bc1909a93d`)
- Modelo comparable (entrega paralela): https://huggingface.co/DunkRonit/anlp-a2-part1-moe_top2_active
- Modelo comparable (entrega paralela): https://huggingface.co/sanyam2005/anlp-a2-part1-moe-top2
- Modelo comparable (entrega paralela): https://huggingface.co/raunakseksaria/anlp-a2-moe

# ProtonPrat/anlp-a2-part1_moe_top1

## Resumen

`ProtonPrat/anlp-a2-part1_moe_top1` es un modelo de lenguaje causal de arquitectura transformer personalizada con capas de mezcla de expertos (MoE) y enrutamiento top-1, entrenado por el usuario ProtonPrat en el contexto de la asignatura ANLP (Assignment 2). No es un modelo de proposito general ni un lanzamiento de laboratorio: se trata de un artefacto academico reproducible, con 10.084.480 parametros totales y un entrenamiento de 30 millones de posiciones sobre el dataset `belumind/en-vi-ja-curated-500k-triplets` (tripletas en ingles, vietnamita y japones).

Su relevancia practica es limitada fuera del ambito docente, pero resulta interesante como ejemplo de implementacion completa de un MoE en miniatura: exporta pesos en `safetensors`, incluye un tokenizador BPE byte-level entrenado desde cero y publica metricas objetivas de evaluacion (perplexity de test 8,647459 y BLEU de continuacion 11,023702). El propio autor advierte que son resultados de una unica semilla, sin barrido de hiperparametros, y que las metricas automaticas no garantizan calidad semantica.

El modelo no registra una arquitectura `AutoModel` de Transformers, por lo que no es cargable con `AutoModelForCausalLM` ni con los runners habituales. Para usarlo hay que disponer del repositorio de la asignatura y cargarlo mediante la clase `src.part1.model.Transformer` o el script `scripts/infer.py`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal personalizado con MoE (enrutamiento top-1) |
| Parametros totales | 10.084.480 |
| Parametros activos | no disponible (el enrutamiento es top-1, pero no se publica el desglose por experto) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados sin cuantizar) |
| Idiomas soportados | Ingles (en), vietnamita (vi), japones (ja) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`hf_export/model.safetensors`); checkpoints PyTorch `.pt` (`final.pt`, `latest.pt`, `best.pt`) |
| Tokenizador | BPE byte-level entrenado solo con datos de entrenamiento (`tokenizer.json`) |
| Tamano del repositorio | 0,3 GB |
| Revision del dataset | `849990daee76e0f9e2eb9965e30e34bc1909a93d` |

## Arquitectura y entrenamiento

Se trata de un transformer causal de arquitectura propia con capas MoE y enrutamiento top-1: cada token se asigna a un unico experto, lo que reduce el coste de computo por token frente a un MoE con top-k mayor. El modelo fue implementado desde cero para la asignatura, incluyendo el mecanismo de mezcla de expertos, las actualizaciones del optimizador y la decodificacion, con asistencia de codigo generado por LLM segun indica el autor. El informe del proyecto describe los metodos numericos y los controles aplicados, pero esa documentacion no forma parte de la informacion disponible aqui.

El entrenamiento consumio 30 millones de posiciones sobre el dataset `belumind/en-vi-ja-curated-500k-triplets`, en su revision fijada. No se especifica el numero de tokens exactos, la composicion por idioma del dataset, ni si se aplicaron fases de ajuste como RLHF o DPO; la model card solo menciona optimizador y decodificacion como componentes implementados para la practica. Tampoco se documenta la longitud de contexto usada durante el entrenamiento.

El tokenizador es un BPE byte-level entrenado exclusivamente con los datos de entrenamiento, lo que implica un vocabulario limitado y sin cobertura garantizada fuera de la distribucion del corpus. La exportacion no registra una arquitectura `AutoModel`, de modo que la carga requiere el codigo del repositorio de la asignatura.

## Capacidades

- Generacion de texto causal autorregresiva sobre las tres lenguas del corpus (ingles, vietnamita y japones).
- Traduccion o continuacion entre esos idiomas: la model card indica que los modelos de traduccion aceptan `--language vi` o `--language ja` en `scripts/infer.py`, y que `part1` corresponde a esa familia.
- Enrutamiento MoE top-1 por token, lo que permite inspeccionar la asignacion a expertos si se dispone del codigo fuente.
- Inferencia reproducible mediante `scripts/infer.py` y carga programatica con `src.part1.model.Transformer`.
- Reanudacion de entrenamiento a partir de estados completos (`final.pt`, `latest.pt`) que incluyen modelo, optimizador, estado del generador aleatorio y cursor del tokenizador.
- No hay evidencia de soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento.

## Casos de uso

- Practicas de posgrado en PLN: el modelo sirve como referencia funcional de un transformer causal con MoE implementado a mano, util para comparar variantes de enrutamiento (top-1 frente a top-k) en un presupuesto de computo minimo.
- Reproducibilidad de experimentos academicos: al publicar pesos finales, estados de reanudacion y el enlace al run de W&B, permite auditar la curva de entrenamiento y repetir la evaluacion de perplexity y BLEU.
- Prototipado de traduccion en-vi-ja a muy baja escala: con 10 millones de parametros puede ejecutarse en CPU y servir para validar pipelines de datos o scripts de inferencia antes de escalar a modelos mayores.
- Ensayos de tokenizacion multilingue: el `tokenizer.json` BPE byte-level entrenado solo con el corpus permite estudiar la fragmentacion de texto vietnamita y japones frente a tokenizadores multilingues de uso comun.
- Docencia sobre mezcla de expertos: el modelo es un banco de pruebas barato para medir balanceo de carga entre expertos, colapso de enrutamiento y efectos del top-1 en la calidad final.
- Investigacion sobre metricas automaticas: sus resultados de perplexity y BLEU, junto con la advertencia explicita del autor, sirven como caso de estudio de la brecha entre metricas de solapamiento y calidad semantica.
- Analisis de artefactos de publicacion en HuggingFace: ejemplo de repositorio sin licencia declarada, sin pipeline asignado y sin arquitectura `AutoModel` registrada, util para discutir buenas practicas de publicacion de modelos.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto |
|---|---|---|
| Perplexity (test) | 8,647459 | Test del dataset en-vi-ja |
| BLEU de continuacion (test) | 11,023702 | Test del dataset en-vi-ja |
| Posiciones de entrenamiento consumidas | 30.000.000 | Entrenamiento |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los dos valores anteriores son resultados de una unica semilla y sin barrido de ajuste del optimizador, tal como advierte el autor.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 40 MB en fp32 y 20 MB en fp16 para los 10,08 millones de parametros; el consumo real dependera del tamano de lote, la longitud de secuencia y la implementacion del MoE.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria es suficiente; el modelo cabe holgadamente en GTX 1650, RTX 3060, RTX 4090, A100 o H100. No se requiere hardware de centro de datos.
- Ejecucion en CPU: perfectamente viable, dado el reducido numero de parametros.
- Opciones de despliegue: no es compatible con vLLM, llama.cpp, Ollama, TGI ni con `AutoModel` de Transformers, porque la arquitectura es personalizada y no esta registrada. El unico camino documentado es el repositorio de la asignatura (`src.part1.model.Transformer` y `scripts/infer.py`), que tampoco se distribuye en el repositorio de HuggingFace.
- Latencia y throughput: no disponibles.
- Almacenamiento: el repositorio completo ocupa 0,3 GB, incluyendo pesos exportados y estados de reanudacion.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye resultados comparativos con otros modelos, y el modelo emplea una arquitectura personalizada sin benchmarks estandar publicados, por lo que cualquier comparacion numerica con alternativas de la misma categoria (por ejemplo, transformers causales multilingues de ~10M de parametros) careceria de base verificable.

## Limitaciones y advertencias

- Modelo academico de 10 millones de parametros: la calidad de generacion y traduccion es inherentemente limitada y no apta para produccion.
- Resultados de una unica semilla y sin barrido de optimizador; la varianza entre ejecuciones no esta caracterizada.
- El autor advierte explicitamente que las metricas automaticas de verosimilitud y solapamiento no establecen calidad semantica.
- Riesgo alto de alucinacion y de degeneracion en generaciones largas, agravado por la ausencia de documentacion sobre la longitud de contexto.
- Cobertura idiomatica restringida a en, vi y ja, y dentro de ellos a la distribucion del corpus `belumind/en-vi-ja-curated-500k-triplets`; el tokenizador se entreno solo con esos datos.
- Licencia no declarada: sin terminos explicitos de uso, no hay autorizacion clara para uso comercial ni para redistribucion. Conviene tratar el modelo como no licenciado hasta contactar con el autor.
- No es cargable con herramientas estandar: requiere el codigo de la asignatura, que no esta incluido en el repositorio de HuggingFace, y no expone `pipeline` ni arquitectura `AutoModel`.
- El repositorio no tiene descargas ni likes registrados y no cuenta con validacion comunitaria.
- El contenido devuelto por la busqueda web para este modelo no contiene informacion tecnica relevante ni enlaces utiles, por lo que no se ha podido contrastar la model card con fuentes externas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ProtonPrat/anlp-a2-part1_moe_top1
- Run de entrenamiento en Weights & Biases: https://wandb.ai/proton_prat/anlp-assignment-2/runs/5f8abimv
- Dataset de entrenamiento: https://huggingface.co/datasets/belumind/en-vi-ja-curated-500k-triplets (revision `849990daee76e0f9e2eb9965e30e34bc1909a93d`)
- Repositorio de codigo de la asignatura: no disponible
- Informe del proyecto: mencionado en la model card, no disponible como enlace
- Paper o publicacion asociada: no disponible

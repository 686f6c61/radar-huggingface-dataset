# ProtonPrat/anlp-a2-part1_moe_active

## Resumen

`ProtonPrat/anlp-a2-part1_moe_active` es un transformer causal de arquitectura personalizada con capas de mezcla de expertos (MoE), desarrollado por el usuario ProtonPrat como entrega de la asignatura Advanced NLP (ANLP) del programa de posgrado de IIIT-H. Se trata de un modelo entrenado desde cero, no de un ajuste fino sobre una base preentrenada, con un total de 14.992.000 parametros y un presupuesto de entrenamiento de 30.000.000 de posiciones consumidas. El objetivo declarado es comparar variantes de enrutamiento MoE (top-1, top-2, shared, active) frente a una linea base densa dentro del marco del trabajo de la asignatura.

El modelo se entrena sobre el corpus `belumind/en-vi-ja-curated-500k-triplets`, un conjunto de tripletas en ingles, vietnamita y japones, y esta orientado a tareas de continuacion de texto y de traduccion condicionada por idioma. En la evaluacion de test alcanza una perplejidad de 7,569820 y un BLEU de continuacion de 13,026923, metricas que el propio autor advierte que no establecen calidad semantica por si solas.

Su relevancia practica es limitada: es un artefacto academico de investigacion reproducible, con cero descargas y cero valoraciones en el momento de la consulta, sin licencia declarada y sin integracion con la libreria `transformers` (no registra arquitectura `AutoModel`). Su interes esta en el estudio de enrutamiento MoE a escala pequena y en la reproducibilidad del pipeline de la asignatura, no en su uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only con mezcla de expertos (MoE), arquitectura personalizada |
| Parametros totales | 14.992.000 |
| Parametros activos | no disponible (el autor no especifica el reparto activo/total) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuyen pesos en `safetensors`, sin versiones GGUF/AWQ/GPTQ) |
| Idiomas soportados | Ingles (en), vietnamita (vi), japones (ja) |
| Licencia | no disponible |
| Formato de pesos | `safetensors` (`hf_export/model.safetensors`); tambien `final.pt`, `latest.pt` y `best.pt` como estados de reanudacion |

## Arquitectura y entrenamiento

El modelo es un transformer causal de tipo decoder-only con capas MoE y arquitectura personalizada. No se apoya en las clases `AutoModel` de HuggingFace: para cargarlo hay que usar la clase `src.part1.model.Transformer` del repositorio de la asignatura o el script `scripts/infer.py`. El tokenizador es un BPE a nivel de bytes entrenado exclusivamente sobre el corpus de entrenamiento (`hf_export/tokenizer.json`), lo que explica que la cobertura de vocabulario este limitada al dominio de los datos.

El entrenamiento consume 30.000.000 de posiciones sobre el dataset `belumind/en-vi-ja-curated-500k-triplets` (revision `849990daee76e0f9e2eb9965e30e34bc1909a93d`). El autor indica que se trata de un unico seed con la configuracion registrada y sin barrido de ajuste de hiperparametros del optimizador, y que tanto el MoE como las actualizaciones del optimizador y el decodificado se implementaron para la asignatura con asistencia de codigo generado por LLM. En el ecosistema de repositorios hermanos de la misma asignatura aparecen variantes con 4 expertos y enrutamiento top-2 con parametros activos igualados a la linea base densa, pero la model card de este repositorio concreto no detalla el numero de expertos ni la politica de enrutamiento, por lo que esos datos deben considerarse no disponibles para este checkpoint.

## Capacidades

- Generacion de texto causal (continuacion de prompts en ingles).
- Traduccion condicionada por idioma: el script de inferencia acepta `--language vi` o `--language ja` para las variantes de traduccion del trabajo.
- Modelado de lenguaje multilingue limitado al par de idiomas del corpus: ingles, vietnamita y japones.
- Razonamiento multi-paso, tool calling o function calling: no disponible; no hay evidencia de soporte.
- Capacidades de vision, audio o modo de razonamiento explicito (thinking): no disponible.
- Soporte de agentes: no disponible.
- Alineacion mediante RLHF o DPO: no disponible; no se documenta ningun proceso de ajuste por preferencias.

## Casos de uso

- Reproducibilidad academica de experimentos MoE: el modelo sirve como punto de comparacion fijo (seed unico, configuracion registrada) frente a las variantes densa, top-1, top-2 y shared de la misma asignatura, usando la perplejidad y el BLEU de continuacion como metricas.
- Estudio del enrutamiento de expertos a escala reducida: con 14,99 M de parametros totales el modelo se entrena y se inspecciona en una sola GPU de gama media o incluso en CPU, lo que permite analizar la distribucion de activaciones por experto sin coste de infraestructura.
- Prototipado de traduccion en/via/ja en entornos sin conectividad: al pesar menos de 0,5 GB el repositorio completo, se puede desplegar en una maquina aislada para experimentos de traduccion controlados.
- Pruebas de tokenizacion byte-level BPE en dominios multilingues: el tokenizador entrenado solo con el corpus de la asignatura permite estudiar el comportamiento de la segmentacion en vietnamita y japones frente a tokenizadores genericos.
- Docencia y ejercicios de implementacion: sirve como material de partida para que otros estudiantes carguen, evaluen y modifiquen un transformer causal con MoE sin depender de modelos preentrenados de gran tamano.
- Validacion de pipelines de inferencia personalizados: al no registrarse como `AutoModel`, obliga a usar el cargador propio del repositorio, lo que lo hace util para probar flujos de carga de `safetensors` fuera de la libreria `transformers`.
- Generacion de continuaciones de texto en ingles con fines de evaluacion cualitativa: util para inspeccionar manualmente la coherencia local de un modelo de 15 M de parametros y contrastarla con las metricas automaticas.

## Benchmarks y rendimiento

| Metrica | Resultado | Conjunto |
|---|---|---|
| Perplejidad de test | 7,569820 | Test del proyecto |
| BLEU de continuacion de test | 13,026923 | Test del proyecto |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor advierte explicitamente que estas son metricas automaticas de verosimilitud y solapamiento que no establecen calidad semantica, y que los resultados provienen de un unico seed sin barrido de ajuste del optimizador.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, unos 60 MB de pesos (14,99 M de parametros x 4 bytes); en fp16, unos 30 MB. Con activaciones y cache de claves/valores, el consumo cabe holgadamente por debajo de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una NVIDIA RTX 3060, RTX 4090, A100 o H100 estan sobredimensionadas para este modelo. Tambien es viable en CPU.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo de los ultimos diez anos, e incluso en sistemas integrados.
- Opciones de despliegue: no hay soporte nativo en vLLM, TGI, llama.cpp u Ollama, ya que no existe version GGUF ni registro de arquitectura en `transformers`. El despliegue previsto es mediante `scripts/infer.py` del repositorio de la asignatura o cargando `hf_export/model.safetensors` con la clase `Transformer` propia.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

Los unicos artefactos comparables son otras entregas de la misma asignatura, con la misma base de codigo y el mismo corpus, pero con politicas de enrutamiento distintas. No hay datos de benchmarks publicados para estas variantes en la informacion disponible, por lo que la comparacion se limita a la descripcion de la arquitectura.

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ProtonPrat/anlp-a2-part1_moe_active | MoE, arquitectura personalizada | 14,99 M | no disponible | no disponible | HuggingFace, 0 descargas |
| neemon/anlp-a2-part1-moe_active_matched | MoE, 4 expertos, enrutamiento top-2, activos igualados a la base densa | no disponible | no disponible | no disponible | HuggingFace |
| sanyam2005/anlp-a2-part1-moe-top2-active | MoE, enrutamiento top-2 | no disponible | no disponible | no disponible | HuggingFace |
| DunkRonit/anlp-a2-part1-moe_top1 | MoE, enrutamiento top-1 | no disponible | no disponible | no disponible | HuggingFace |

No se dispone de comparativas con modelos de proposito general de tamano similar (por ejemplo, GPT-2 small de 124 M de parametros) en la informacion proporcionada, y la diferencia de presupuesto de entrenamiento haria la comparacion poco informativa.

## Limitaciones y advertencias

- Modelo academico de 14,99 M de parametros entrenado sobre 30 M de posiciones: su capacidad de generalizacion fuera del dominio del corpus es muy reducida.
- No hay licencia declarada. Sin una licencia explicita no se concede permiso de uso comercial ni de redistribucion; hay que contactar con el autor antes de cualquier uso fuera del ambito academico.
- Riesgo alto de alucinacion y de incoherencia en generaciones largas, coherente con su tamano y con el BLEU de continuacion de 13,03.
- Cobertura idiomatica limitada a ingles, vietnamita y japones, y dentro de ellos al registro y dominio del dataset `belumind/en-vi-ja-curated-500k-triplets`. El espanol no esta soportado.
- Tokenizador BPE byte-level entrenado solo con el corpus de la asignatura: fuera de ese dominio la segmentacion se degrada y aumenta el numero de tokens por palabra.
- Resultados de un unico seed y sin barrido de hiperparametros: la reproducibilidad exacta depende de los estados `final.pt`, `latest.pt` y `best.pt`, y las cifras reportadas no incluyen intervalos de confianza.
- `best.pt` no es un estado de reanudacion completo; solo `final.pt` y `latest.pt` contienen modelo, optimizador, estado del generador aleatorio y cursor del tokenizador.
- No se registra una arquitectura `AutoModel`, por lo que las herramientas estandar de `transformers`, vLLM o TGI no pueden cargarlo sin adaptacion.
- El autor senala que el MoE, las actualizaciones del optimizador y el decodificado se implementaron con asistencia de codigo generado por LLM, lo que anade un riesgo adicional de errores sutiles no detectados por las metricas automaticas.
- Las metricas de perplejidad y BLEU no miden calidad semantica; cualquier conclusion sobre utilidad real requiere evaluacion humana.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ProtonPrat/anlp-a2-part1_moe_active
- Run de W&B: https://wandb.ai/proton_prat/anlp-assignment-2/runs/pimry0rh
- Dataset de entrenamiento: `belumind/en-vi-ja-curated-500k-triplets` (revision `849990daee76e0f9e2eb9965e30e34bc1909a93d`)
- Variante comparable (enrutamiento top-2 con activos igualados): https://huggingface.co/neemon/anlp-a2-part1-moe_active_matched
- Variante comparable (top-2): https://huggingface.co/sanyam2005/anlp-a2-part1-moe-top2-active
- Variante comparable (shared): https://huggingface.co/DunkRonit/anlp-a2-part1-moe_shared
- Variante comparable (top-2 active): https://huggingface.co/DunkRonit/anlp-a2-part1-moe_top2_active
- Variante comparable (top-1): https://huggingface.co/DunkRonit/anlp-a2-part1-moe_top1

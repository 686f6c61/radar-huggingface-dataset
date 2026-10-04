# satyam-arora-iiit-hyderabad/anlp-m26-a2-part1-dense

## Resumen

El modelo `satyam-arora-iiit-hyderabad/anlp-m26-a2-part1-dense` es un checkpoint de traduccion automatica con arquitectura decoder-only, desarrollado por el usuario satyam-arora-iiit-hyderabad en el contexto de la asignatura Advanced NLP (ANLP) de IIIT Hyderabad. Traduce desde vietnamita y japones hacia ingles y cuenta con 19.847.040 parametros totales, un tamano muy reducido que lo situa en la categoria de modelos de investigacion y experimentacion docente mas que en la de modelos de produccion.

La relevancia del modelo es fundamentalmente academica: forma parte de una familia de checkpoints de un mismo trabajo practico en la que existe una variante densa (esta) y variantes con mezcla de expertos (MoE), lo que permite comparar estrategias de arquitectura bajo un presupuesto de tokens de contexto fijo. El autor publica metricas de perplexity y BLEU junto con ficheros de uso de expertos en las variantes MoE, lo que facilita analisis comparativos dentro del aula.

Se distribuye unicamente en formato PyTorch (`model.pt`), sin versiones cuantizadas ni safetensors, y requiere el codigo de arquitectura personalizado del repositorio de la asignatura. No se ha publicado licencia, no tiene descargas ni interacciones en HuggingFace y no se ha publicado paper asociado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (variante densa; la model card incluye la etiqueta `mixture-of-experts` propia de la familia del trabajo) |
| Parametros totales | 19.847.040 |
| Parametros activos | 19.847.040 (equivale al total: no hay enrutamiento por expertos en este checkpoint) |
| Longitud de contexto | no disponible (la model card menciona un "fixed context-token budget" sin especificar la cifra) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en `model.pt`; no hay GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Ingles (en), vietnamita (vi), japones (ja) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`model.pt`, `best_validation_model.pt`); tokenizer en `tokenizer.json` |

## Arquitectura y entrenamiento

Arquitectura transformer decoder-only de 19.847.040 parametros, entrenada como modelo de traduccion de vietnamita y japones a ingles. El checkpoint se entreno con el presupuesto fijo de tokens de contexto definido en el repositorio de la asignatura y las metricas publicadas corresponden al checkpoint final, no a una version con early stopping; existe ademas un `best_validation_model.pt` como checkpoint opcional de menor NLL en validacion. El tokenizer es un BPE a nivel de byte que incorpora tokens de idioma y de control, lo que permite condicionar el idioma de origen o destino en la misma secuencia.

El dataset declarado es `belumind/en-vi-ja-curated-500k-triplets`, un corpus curado de 500.000 tripletas en ingles, vietnamita y japones. No se especifica en la informacion disponible el numero exacto de tokens de entrenamiento, la composicion interna del corpus ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Tampoco se detalla si hubo decodificacion especulativa, atencion lineal u otra innovacion tecnica mas alla de la comparacion densa frente a MoE que motiva el trabajo.

## Capacidades

- Traduccion de vietnamita a ingles y de japones a ingles, con BLEU de 23,5228 y 15,7442 respectivamente en el conjunto de test declarado.
- Modelado de lenguaje autorregresivo decoder-only, con perplexity de test de 23,127351.
- Condicionamiento por tokens de idioma y de control gracias al tokenizer BPE a nivel de byte incluido en `tokenizer.json`.
- Tratamiento de tres idiomas: ingles, vietnamita y japones.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades de vision, audio o modo de razonamiento explicito: no disponibles.
- Analisis de uso de expertos en las variantes MoE de la familia mediante los ficheros CSV, JSON y SVG incluidos (no aplicable a este checkpoint denso, que no enruta expertos).

## Casos de uso

- Traduccion de documentacion tecnica de vietnamita a ingles: el modelo puede emplearse para preprocesar manuales y notas tecnicas antes de su revision humana, con la ventaja de que su tamano permite ejecutarlo en local sin coste de API.
- Traduccion de japones a ingles en flujos de soporte interno: util como primera pasada sobre tickets o correos, siempre con revision humana dado el BLEU mas bajo en japones (15,7442).
- Experimentacion academica sobre arquitecturas decoder-only: sirve como linea base densa frente a las variantes MoE del mismo trabajo practico, comparando perplexity y BLEU bajo el mismo presupuesto de tokens.
- Prototipado de pipelines de traduccion en entornos con recursos limitados: con menos de 20 millones de parametros, el modelo se ejecuta en CPU y en cualquier GPU de consumo, lo que facilita pruebas rapidas de integracion.
- Generacion de datos sinteticos de aumento: se puede usar para producir traducciones aproximadas que despues se filtren y corrijan, alimentando el entrenamiento de modelos mayores.
- Investigacion sobre tokenizacion multilingue: el tokenizer BPE a nivel de byte con tokens de idioma y control permite estudiar como afecta el condicionamiento explicito de idioma a la calidad de traduccion.
- Demostraciones docentes en clase: su tamano reducido y los ficheros de metricas en formato legible por maquina (`evaluation_metrics.json`, `parameter_report.json`) facilitan reproducir y auditar los resultados.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Perplexity de test | 23,127351 |
| BLEU combinado | 19,5656 |
| BLEU vietnamita | 23,5228 |
| BLEU japones | 15,7442 |
| Parametros totales | 19.847.040 |
| Parametros activos por token | 19.847.040 |

No se han publicado en la informacion disponible resultados comparativos frente a otros modelos en conjuntos de referencia estandar como MMLU, HumanEval o GSM8K, ni cifras de modelos alternativos evaluados sobre el mismo corpus.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 80 MB en FP32, 40 MB en FP16/BF16 y 20 MB en INT8, calculado a partir de los 19,8 millones de parametros; son estimaciones, no cifras publicadas por el autor.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria sirve; no se requiere A100, H100 ni RTX 4090. Una GTX 1050, una MX150 o incluso una iGPU reciente son suficientes.
- Ejecucion en CPU: viable sin GPU dedicada, dado el tamano del modelo.
- Opciones de despliegue: al tratarse de una arquitectura personalizada que se carga con el codigo del repositorio de la asignatura, no hay soporte directo en vLLM, llama.cpp, Ollama ni TGI sin una conversion previa. El despliegue previsto es mediante PyTorch con el codigo de carga propio.
- Latencia y throughput: no disponibles. No se han publicado mediciones de velocidad.
- Almacenamiento: el repositorio ocupa 0,2 GB, incluyendo el checkpoint final, el checkpoint opcional de validacion y los ficheros auxiliares.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparables publicados para este modelo. La model card solo aporta BLEU y perplexity sobre su propio conjunto de test, y no se han encontrado evaluaciones cruzadas con alternativas en un mismo benchmark dentro de la informacion proporcionada.

| Modelo | Parametros | Contexto | Licencia | Formato | Datos comparativos |
|---|---|---|---|---|---|
| anlp-m26-a2-part1-dense | 19.847.040 | no disponible | no disponible | PyTorch | BLEU combinado 19,5656 |
| Alternativas de traduccion vi/ja-en de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia de licencia publicada: no hay base legal explicita para uso comercial, redistribucion o modificacion; se debe contactar con el autor antes de cualquier uso fuera del ambito academico.
- Modelo de 19,8 millones de parametros: la calidad de traduccion es limitada en terminos absolutos, especialmente en japones, donde el BLEU de 15,7442 indica una fidelidad baja en comparacion con sistemas de mayor tamano.
- Riesgo de alucinacion y de omision de contenido en textos largos o de dominio especializado, especialmente con terminologia tecnica, nombres propios y expresiones idiomaticas.
- Cobertura idiomatica restringida a tres lenguas: no se ha entrenado para otras combinaciones distintas de vi-en y ja-en segun la model card.
- Longitud de contexto no publicada: no se puede garantizar el comportamiento con documentos largos ni determinar el punto de truncado seguro.
- Solo se distribuyen pesos en formato PyTorch (`model.pt`), lo que implica riesgo de deserializacion y obliga a usar el codigo de arquitectura personalizado del repositorio; no hay safetensors ni GGUF.
- Se trata de un trabajo de asignatura sin paper ni evaluacion independiente: no hay evidencia de robustez fuera del conjunto de test declarado, y el modelo no registra descargas ni validacion por parte de la comunidad.
- No hay informacion sobre sesgos del corpus de entrenamiento ni sobre procesos de alineacion o filtrado de contenido.
- El checkpoint publicado corresponde al final del entrenamiento y no a un early stopping, por lo que puede no ser el de mejor generalizacion, aunque el autor incluye un checkpoint alternativo de validacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/satyam-arora-iiit-hyderabad/anlp-m26-a2-part1-dense
- Dataset de entrenamiento: https://huggingface.co/datasets/belumind/en-vi-ja-curated-500k-triplets
- Perfil del autor: https://huggingface.co/satyam-arora-iiit-hyderabad
- Repositorio de la asignatura con el codigo de arquitectura y carga: no disponible (la model card lo menciona sin enlace)
- Paper o informe tecnico: no disponible
- Demo o espacio interactivo: no disponible

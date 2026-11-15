# review-artifacts-27/Llama-3.2-1B-Recurrent-Loopy-W4A8-G32

## Resumen

Llama-3.2-1B-Recurrent-Loopy-W4A8-G32 es un checkpoint cuantizado del modelo Recurrent-Llama-3.2-1B, desarrollado por el usuario review-artifacts-27 sobre el modelo base de irafm-llm. Se trata de una variante experimental de Llama 3.2 1B que introduce recurrencia en profundidad (recurrent depth T=16), es decir, el mismo bloque transformer se aplica iterativamente 16 veces, y que se distribuye con pesos cuantizados a 4 bits (W4) con activaciones de 8 bits (A8) y tamano de grupo 32 (G32).

El checkpoint se ha generado mediante un proceso de busqueda sobre un pool de 400 candidatos, seleccionando el candidato `s250725084_p12_b128` con rotacion Hadamard de bloque 128, potencia de escalado 1.2 y cuantizacion de activaciones dinamica por token. Los pesos W4 se almacenan en contenedores INT8 junto con escalas, puntos cero, escalado de entrada y signos Hadamard; la evaluacion utiliza pseudo-cuantizacion BF16, y no se emplea empaquetado INT4 ni kernel de inferencia INT4.

Es relevante porque explora una via poco comun en modelos de 1B: la recurrencia en profundidad como alternativa al aumento de parametros, combinada con cuantizacion agresiva W4A8. El resultado es un artefacto de investigacion reproducible con metricas guardadas, protocolo congelado y trazabilidad completa (manifest, provenance, ventanas fijas), pensado para evaluacion controlada mas que para despliegue directo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con recurrencia en profundidad (recurrent depth T=16) sobre Llama 3.2 1B |
| Parametros totales | no disponible (modelo base de 1B, sin cifra exacta en la informacion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 4096 tokens (ventanas de evaluacion document-level) |
| Tipos de cuantizacion | W4 pesos en contenedores INT8, A8 activaciones dinamicas por token, grupo de 32; evaluacion con pseudo-cuantizacion BF16 |
| Idiomas soportados | ingles (en) |
| Licencia | llama3.2 (Llama 3.2 Community License and Acceptable Use Policy) |
| Formato de pesos | `selected.pt` (state dict PyTorch con codigos W4 en INT8, escalas, zero points, escalado de entrada y signos Hadamard); no usa empaquetado INT4 |

## Arquitectura y entrenamiento

La arquitectura parte de Llama 3.2 1B y le aplica un esquema de recurrencia en profundidad con T=16 iteraciones sobre el mismo bloque. El checkpoint no es un modelo entrenado desde cero, sino una seleccion cuantizada del modelo base `irafm-llm/Recurrent-Llama-3.2-1B` (revision `eefd08cd0caead1ea5db6cf62a06ccb69cf8d638`). El proceso de seleccion explora un pool de 400 candidatos y fija una rotacion Hadamard de bloque 128 con semilla 250725084 y potencia de escalado 1.2, ademas de cuantizacion de activaciones dinamica per-token a 8 bits.

Los pesos W4 se almacenan como codigos enteros en contenedores INT8, acompanados de escalas, puntos cero, parametros de escalado de entrada y signos Hadamard; los tensores no cuantizados conservan su tipo flotante original. La evaluacion se realiza con pseudo-cuantizacion BF16. El autor indica explicitamente que esta release no usa almacenamiento INT4 empaquetado ni kernel de inferencia INT4, y que las selecciones W4A4 y W4A8 son independientes: la precision de activaciones no determina el dtype de almacenamiento del checkpoint.

El protocolo de evaluacion emplea ventanas fijas derivadas del split de entrenamiento de WikiText-103 (revision `b08601e04326c79dfdd32d625aee71d232d685c3` de `Salesforce/wikitext`), con grupos separados de 32 ventanas para calibracion, busqueda y calidad. La trazabilidad se documenta en `artifacts/window_manifest.json`, `manifest.json` (tamanos y SHA-256) y `provenance.json` (mapeo de hashes de metadatos originales a exportados).

## Capacidades

- Generacion de texto autoregresiva en ingles, heredada del modelo base Llama 3.2 1B.
- Razonamiento de sentido comun y comprension lectora a nivel de modelo de 1B (evaluado en WinoGrande, ARC-C, HellaSwag, LAMBADA, MMLU).
- Modelado de lenguaje con contexto de 4096 tokens en evaluacion document-level.
- Recurrencia en profundidad como mecanismo de capacidad efectiva sin aumentar parametros.
- No se documenta soporte de tool calling ni function calling en la informacion disponible.
- No se documenta soporte de agentes ni multi-step reasoning explicito.
- No se documenta capacidad de vision, audio ni modo thinking.
- Multilingue limitado al ingles segun la model card.

## Casos de uso

- Investigacion sobre recurrencia en profundidad: el checkpoint permite reproducir el protocolo congelado (`eval_wikitext.py` y `eval_tasks.py`) y comparar la variante recurrente T=16 frente al modelo base no recurrente en las mismas ventanas de WikiText-103.
- Estudio de cuantizacion W4A8: sirve para analizar el impacto de la seleccion de rotacion Hadamard, potencia de escalado y grupo de 32 en perplejidad y precision de tareas, con registros completos de busqueda por etapa.
- Reproducibilidad de artefactos: los ficheros `manifest.json`, `provenance.json` y `reference_results/` permiten verificar hashes y comparar metricas guardadas frente a nuevas evaluaciones sin que estas ultimas queden suprimidas.
- Benchmarking controlado de modelos de 1B: las metricas guardadas (WT2 PPL 24.76, LAMBADA PPL 26.97, MMLU 23.94) ofrecen una referencia fija para comparar otras tecnicas de compresion sobre la misma arquitectura.
- Docencia y formacion: el entorno conda reproducible (`environment.yml`) y el loader personalizado facilitan demostrar como se carga un checkpoint cuantizado no estandar sin `from_pretrained()`.
- Prototipado de inferencia en ingles con requisitos de memoria reducidos: el tamano del repo (2.1 GB) sugiere un peso en disco moderado, aunque el despliegue requiere el loader Loopy especifico y no un pipeline generico de Transformers.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---:|
| WT2 word PPL (4096-context, rolling) | 24.76 |
| LAMBADA PPL | 26.97 |
| LAMBADA acc. (%) | 34.76 |
| WinoGrande (%) | 52.80 |
| ARC-C acc_norm (%) | 28.75 |
| HellaSwag acc_norm (%) | 45.88 |
| MMLU (%) | 23.94 |
| Media de las cinco tareas de precision (%) | 37.23 |

Las metricas corresponden a la tabla principal guardada del experimento que produjo este checkpoint. La media pondera igualmente las cinco tareas de precision. No se proporcionan comparaciones con modelos similares en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el repo ocupa 2.1 GB y los pesos W4 se almacenan en contenedores INT8, por lo que la huella en memoria es sustancialmente menor que la de un modelo 1B en BF16.
- GPU recomendadas: no disponible; el protocolo de evaluacion usa `CUDA_VISIBLE_DEVICES=0`, lo que sugiere una unica GPU, sin modelo concreto especificado.
- Cabe en GPU consumer: probablemente si, dado el tamano del repo (2.1 GB) y el caracter de modelo 1B cuantizado, aunque no se confirma en la informacion disponible.
- Opciones de despliegue: loader personalizado Loopy incluido en `code/`; no se recomienda `from_pretrained()` generico de Transformers sobre este repositorio. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Llama-3.2-1B-Recurrent-Loopy-W4A8-G32 | ~1B (recurrente T=16) | 4096 | llama3.2 | Hugging Face, loader custom | Checkpoint de investigacion cuantizado W4A8 |
| irafm-llm/Recurrent-Llama-3.2-1B | ~1B (recurrente T=16) | no disponible | llama3.2 (heredada) | Hugging Face | Modelo base del que deriva este checkpoint |
| Llama 3.2 1B (original) | 1.24B | 128k | llama3.2 | Hugging Face, amplio ecosistema | No recurrente, sin cuantizacion W4A8 |

No se dispone de datos de rendimiento comparativos entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion: el autor indica que es un checkpoint Loopy personalizado que requiere el loader incluido; un `from_pretrained()` generico de Transformers no cargara correctamente este repositorio.
- Solo ingles: la model card declara unicamente el idioma `en`.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de 1B y agravado por la cuantizacion W4; no se documentan mitigaciones.
- Sesgos: no se documenta analisis de sesgos en la informacion disponible.
- Precision reducida: la cuantizacion W4A8 con pseudo-cuantizacion BF16 en evaluacion puede no reflejar el comportamiento de un kernel INT4 real, que no se incluye en esta release.
- Licencia: los pesos estan sujetos a la Llama 3.2 Community License y Acceptable Use Policy, con restricciones para uso comercial segun dicha licencia; el codigo de investigacion se rige por los avisos en `code/THIRD_PARTY_NOTICES.md`.
- Sin datos de despliegue en produccion: no se documentan latencias, throughput ni soporte de servidores de inferencia estandar.
- Cero descargas y cero likes en el momento de la ficha: artefacto de revision, sin validacion comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/review-artifacts-27/Llama-3.2-1B-Recurrent-Loopy-W4A8-G32
- Modelo base: https://huggingface.co/irafm-llm/Recurrent-Llama-3.2-1B
- Dataset de evaluacion (WikiText-103): https://huggingface.co/datasets/Salesforce/wikitext
- Protocolo completo: `code/docs/protocol.md` (incluido en el repositorio)
- Instrucciones de evaluacion: `code/README.md` (incluido en el repositorio)

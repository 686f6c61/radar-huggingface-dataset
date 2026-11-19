# developmentseed/gazet-models

## Resumen

`gazet-models` es un repositorio de modelos de lenguaje de pequeno tamano publicados por Development Seed como parte de [gazet](https://github.com/developmentseed/gazet), su geocodificador en lenguaje natural y sus experimentos de text-to-SQL espacial. No es un unico modelo, sino una coleccion de ejecuciones de entrenamiento (runs), cada una con pesos fusionados en formato transformers, el adaptador LoRA original, ficheros GGUF para llama.cpp, el log de entrenamiento y las respuestas del modelo a los conjuntos de test.

El modelo principal para geocodificacion es `plan-v5-smol135`, un fine-tuning de SmolLM2-135M-Instruct que traduce preguntas en lenguaje natural a planes JSON que gazet compila despues a SQL. Con 145 MB en cuantizacion q8_0, esta disenado para ejecutarse en CPU de portatil y en el navegador mediante wllama. El repositorio incluye tambien variantes sobre Qwen3-0.6B y LFM2.5-350M, y un modelo aparte (`sql-v1-r16`, sobre Qwen3.5-0.8B) para generar SQL espacial de DuckDB a partir de tarjetas de esquema.

La relevancia actual del proyecto esta en el enfoque: en lugar de pedir a un LLM generalista que escriba SQL directamente, se entrena un modelo diminuto para producir una representacion intermedia estructurada (el plan) que un compilador determinista convierte en consultas. El total de parametros del repositorio en safetensors es de 354.483.968, correspondiente a la suma de los distintos runs publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (fine-tuning LoRA fusionado sobre SmolLM2-135M-Instruct, Qwen3-0.6B, LFM2.5-350M y Qwen3.5-0.8B) |
| Parametros totales | 354.483.968 en safetensors (suma de todos los runs del repo); el modelo principal `plan-v5-smol135` tiene 135M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF q8_0 (publicado para `plan-v5-smol135`, 145 MB); otras cuantizaciones no disponibles |
| Idiomas soportados | ingles (en) |
| Licencia | other / per-run: Apache-2.0 para los runs sobre SmolLM2, Qwen3 y Qwen3.5; LFM Open License v1.0 para `plan-v1-lfm350` |
| Formato de pesos | safetensors (transformers, pesos fusionados), LoRA adapter y GGUF |

## Arquitectura y entrenamiento

Cada run es un fine-tuning con LoRA (posteriormente fusionado) de un modelo base decoder-only de pequeno tamano. Los runs de planificacion (`plan-v1` a `plan-v5`) parten de SmolLM2-135M-Instruct, con variantes sobre Qwen3-0.6B (`plan-v1-q3-06b`) y LFM2.5-350M (`plan-v1-lfm350`). El run de SQL (`sql-v1-r16`) parte de Qwen3.5-0.8B y se entrena sobre pares pregunta/SQL generados con DeepSeek-V4.1-Flash sobre el data lake descrito en la data card de `gazet-sql-data`.

Los datos de entrenamiento de los modelos de planificacion son el dataset `chatml/gazet_plan_v5` (gazet-dataset reetiquetado mas preguntas con multiples lugares) y versiones intermedias del mismo. Las fuentes geograficas son exclusivamente divisiones de Overture Maps y Natural Earth (© OpenStreetMap contributors, Overture Maps Foundation, bajo ODbL; Natural Earth es dominio publico). La innovacion tecnica no esta en la arquitectura, sino en el diseno de la tarea: el modelo no genera SQL, sino planes JSON decodificados bajo un esquema estricto (`gazet.plan.plan_schema`) con IDs limitados a los candidatos, a temperatura 0, que gazet compila despues a SQL (`src/gazet/plan.py`). Este constrained decoding elimina buena parte de la superficie de alucinacion en la generacion de consultas.

## Capacidades

- Generacion de planes JSON de geocodificacion a partir de preguntas en lenguaje natural, incluyendo preguntas con multiples lugares.
- Generacion de SQL espacial para DuckDB a partir de tarjetas de esquema y una pregunta (run `sql-v1-r16`).
- Decodificacion restringida por esquema JSON con IDs limitados al conjunto de candidatos.
- Ejecucion en CPU de portatil y en navegador (wllama) con la variante GGUF q8_0 de 145 MB.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo ingles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles; en el modelo SQL se recomienda desactivar el modo thinking.

## Casos de uso

- Geocodificacion en lenguaje natural en aplicaciones web: cargar `gazet-plan-v5-smol135-q8_0.gguf` en el navegador con wllama y resolver consultas como descripciones de lugares o preguntas con varias ubicaciones sin enviar datos a un servidor, gracias a los 145 MB del modelo cuantizado.
- Backend de geocodificacion de bajo coste: servir el modelo en CPU junto con el compilador de planes de gazet para traducir preguntas a SQL sobre divisiones administrativas de Overture Maps, evitando el coste de un LLM generalista.
- Asistentes de datos geoespaciales: usar `sql-v1-r16` para generar SQL espacial de DuckDB a partir de tarjetas de esquema, integrado en un flujo donde el SQL se valida por ejecucion antes de mostrarse al usuario.
- Investigacion sobre text-to-SQL con representacion intermedia: el repositorio incluye logs de entrenamiento y las respuestas del modelo a los conjuntos de test, lo que permite reproducir y comparar el enfoque de plan + compilador frente a la generacion directa de SQL.
- Prototipado de interfaces de busqueda geografica: el modelo acepta preguntas con multiples lugares (89,2% de coincidencia de caracteristicas en el conjunto held-out multi-place), adecuado para buscadores que resuelven varias localizaciones en una sola consulta.
- Evaluacion comparativa de modelos base pequenos: los runs sobre SmolLM2-135M, Qwen3-0.6B y LFM2.5-350M con los mismos datos permiten medir el efecto del tamano y la familia del modelo base en una tarea estructurada concreta.

## Benchmarks y rendimiento

| Run | Modelo base | Tarea | Resultado |
|---|---|---|---|
| `plan-v5-smol135` | SmolLM2-135M-Instruct | Planes de geocodificacion | 89,2% mismas caracteristicas en held-out multi-place; 82,0% misma geometria en test de gazet (referencias corregidas); 99,1% en places |
| `plan-v1-smol135` | SmolLM2-135M-Instruct | Planes de geocodificacion | 78,9% misma geometria en test de gazet |
| `plan-v1-q3-06b` | Qwen3-0.6B | Planes de geocodificacion | 82,6% |
| `plan-v1-lfm350` | LFM2.5-350M | Planes de geocodificacion | 82,9% |
| `sql-v1-r16` | Qwen3.5-0.8B | SQL espacial DuckDB | dev 69%, gold 44% (48% con value hints), coincidencia de ejecucion indulgente |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Los detalles de evaluacion estan en `dataset/generative/eval/gazet_plan/report.txt`, `eval/gazet_multi/report.txt`, `REVIEW.md` y `FINDINGS.md` del repositorio gazet.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB para `plan-v5-smol135` en q8_0 (145 MB de pesos); el resto de runs requiere calcularla segun el modelo base (135M a 0,8B de parametros).
- GPU recomendadas: no disponibles; el modelo principal esta pensado para CPU.
- Cabe en cualquier GPU de consumo e incluso en CPU de portatil y en el navegador (wllama) para la variante q8_0.
- Opciones de despliegue: llama.cpp (ficheros GGUF), transformers (pesos fusionados en safetensors), wllama en navegador; otras opciones como vLLM, Ollama o TGI no estan documentadas en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `plan-v5-smol135` (este repo) | 135M | no disponible | Geocodificacion via planes JSON | Apache-2.0 | Hugging Face, GGUF y safetensors |
| `plan-v1-q3-06b` (este repo) | 0,6B | no disponible | Geocodificacion via planes JSON | Apache-2.0 | Hugging Face |
| `plan-v1-lfm350` (este repo) | 350M | no disponible | Geocodificacion via planes JSON | LFM Open License v1.0 | Hugging Face |
| `sql-v1-r16` (este repo) | 0,8B | no disponible | SQL espacial DuckDB | Apache-2.0 | Hugging Face |

No se dispone de informacion sobre modelos externos comparables en la documentacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles; no hay capacidades multilingues documentadas.
- El modelo de geocodificacion esta disenado para usarse con los prompts y el esquema de gazet (`gazet.lm`, `gazet.plan.plan_schema`) y a temperatura 0; un uso fuera de ese pipeline degrada los resultados.
- El modelo SQL obtiene un 44% de coincidencia de ejecucion en el conjunto gold (48% con value hints), insuficiente para produccion sin validacion adicional.
- Riesgo de alucinacion mitigado por la decodificacion restringida, pero no eliminado: los IDs de candidatos deben limitarse explicitamente en el esquema.
- Restricciones de licencia: `plan-v1-lfm350` esta bajo LFM Open License v1.0, que solo permite uso comercial a entidades por debajo de su umbral de ingresos; los datos de entrenamiento incluyen fuentes ODbL, OGL v3, CDLA-Permissive-2.0, CC BY 4.0, CC BY 2.5 India, Singapore Open Data Licence, PDL 1.0 y Etalab 2.0, con obligaciones de atribucion.
- El repositorio agrupa varios runs con licencias distintas; la licencia "per-run" exige revisar el fichero LICENSE de cada carpeta antes de su uso.
- No hay datos publicados sobre longitud de contexto, latencia ni throughput.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/developmentseed/gazet-models
- Repositorio gazet en GitHub: https://github.com/developmentseed/gazet
- Dataset de entrenamiento SQL: https://huggingface.co/datasets/developmentseed/gazet-sql-data
- Dataset gazet: https://huggingface.co/datasets/developmentseed/gazet-dataset
- Licencia ODbL: https://opendatacommons.org/licenses/odbl/1-0/

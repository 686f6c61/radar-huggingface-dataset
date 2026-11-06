# guike8/evidence-scraper-qwen3-1.7b-mlx-lora

## Resumen

`guike8/evidence-scraper-qwen3-1.7b-mlx-lora` es un adaptador LoRA experimental en formato MLX, entrenado sobre el modelo cuantizado a 4 bits `mlx-community/Qwen3-1.7B-4bit` (revision `3b1b1768f8f8cf8351c712464f906e86c2b8269e`). Lo publica el usuario guike8 como parte del proyecto `evidence-ai-scraper-public` y su objetivo es la extraccion dirigida por esquema de contenido web: dado un esquema de campos y secciones de fuente numeradas, el adaptador debe devolver un JSON con datos, citas de evidencia y avisos. No es un modelo generalista ni un checkpoint listo para produccion: el propio autor lo etiqueta como `experimental` y declara explicitamente que la preparacion para produccion "no esta establecida".

El adaptador se entrena con QLoRA sobre una base Qwen3 de 1.700 millones de parametros cuantizada a 4 bits, con un curriculo sintetico de 720 casos de entrenamiento, 72 de validacion y 108 de test retenido. La innovacion principal no es arquitectonica sino de contrato de inferencia: se evalua con decodificacion greedy, modo `json_schema`, thinking desactivado, 4.096 tokens de salida y timeouts de 45 segundos, y el codigo de aplicacion debe validar esquema, completitud y correspondencia exacta de la evidencia. La relevancia actual es acotada: sirve como referencia metodologica para extraccion estructurada con modelos pequenos en Apple Silicon, no como componente listo para desplegar.

El checkpoint ocupa 0.0 GB en el repositorio (solo se publican los pesos del adaptador, no la base), no tiene descargas ni likes en el momento de la consulta y su model card es inusualmente honesta sobre los fallos: el recall aceptado tras validacion es del 32,54% en test, y las pruebas de capacidad de cita exacta hecho-evidencia quedan en 0/9. Cualquier uso debe partir de esa realidad medida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-1.7B) con adaptador LoRA en formato MLX |
| Parametros totales | 1.700 millones (modelo base Qwen3-1.7B); parametros del adaptador no disponibles |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (la generacion se limita a 4.096 tokens de salida) |
| Tipos de cuantizacion | Base en 4 bits (MLX); el adaptador es un artefacto LoRA sin cuantizar de forma independiente |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX adapter (no es PEFT ni GGUF); requiere MLX-LM con version fijada en `training.json` |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen3-1.7B, un transformer decoder-only de 1.700 millones de parametros, en su version cuantizada a 4 bits para MLX. El entrenamiento es QLoRA: se congelan los pesos base cuantizados y se entrenan adaptadores de bajo rango. La model card reporta 720 microbatches y 180 actualizaciones del optimizador, lo que indica un entrenamiento corto y de ajuste fino, no un preentrenamiento. El curriculo sintetico cubre ocho presets y campos personalizados, con familias DOM y lexicas disjuntas, entidades, dominios y hashes de fuente separados entre splits; solo se supervisan las salidas `data/evidence/warnings`. Las etiquetas son autoradas y validadas automaticamente, no revisadas de forma independiente sobre web real, y se excluyen snapshots privados y filas de benchmarks publicos existentes.

La parte tecnica diferencial esta en el contrato de inferencia y evaluacion, no en la arquitectura: modo `json_schema`, variante de gramatica `exclusive_evidence_v1`, hash de guardia de esquema `227359ee...`, hash de esquemas de proveedor `2837b00d...`, decodificacion greedy, thinking desactivado, 4.096 tokens de salida, timeouts de 45 segundos y sin reparacion de salidas. El adaptador, la gramatica y la politica de inferencia se congelaron antes del test de 108 casos. La comparacion de serving uso un hook experimental de carga de adaptadores no fusionados en oMLX, no una opcion oficial de oMLX; la generacion nativa en MLX es un modo de inferencia distinto y sin restricciones. El SHA256 del adaptador es `a39abab04fec46859f2931f741b377a714cda6d7c2086ac2b29faa3a1d49ca09` y el fingerprint del dataset es `2f3639f41a4bf6a5d41eaf58a959067abeb61f61abf1c9cad5d222ae80be2499`.

## Capacidades

- Extraccion de informacion dirigida por esquema: genera JSON con campos definidos por el esquema de extraccion proporcionado.
- Citacion de evidencia: el contrato exige asociar cada hecho a secciones de fuente numeradas; la validacion de la aplicacion comprueba la correspondencia exacta.
- Emision de avisos (`warnings`) dentro del JSON de salida.
- Generacion de texto basica heredada de Qwen3-1.7B (pipeline `text-generation`).
- Soporte de tool calling: no disponible; el contrato de inferencia es explicitamente "no-tools".
- Soporte de agentes y razonamiento multi-paso: no disponible; el modo thinking debe desactivarse.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidades especiales: modo de salida restringido por gramatica JSON (`json_schema`), sin modo thinking y sin vision ni audio.

## Casos de uso

- Extraccion estructurada de fichas de producto en pipelines de scraping controlados: el adaptador recibe el esquema de campos y las secciones numeradas de la pagina, y devuelve JSON con citas; encaja porque el contrato esta disenado exactamente para ese flujo y la validacion de esquema se delega al codigo de aplicacion.
- Prototipado de contratos de evidencia en investigacion: util para estudiar como un modelo de 1.700 millones se comporta cuando se le exige citar la fuente exacta de cada dato, con metricas de precision y recall crudos y aceptados ya publicadas.
- Evaluacion comparativa de tecnicas de extraccion JSON con gramatica restringida: sirve como brazo de referencia (adaptador frente a base) con los mismos casos, ajustes de inferencia y gramatica congelada.
- Extraccion de campos simples en dominios con patrones repetidos: la model card advierte que los patrones de tarea simples compartidos entre splits permanecen, por lo que es adecuado solo para tareas con estructura predecible y siempre con validacion posterior.
- Banco de pruebas de validadores de esquema y procedencia: el adaptador genera salidas que el codigo de aplicacion debe aceptar o rechazar, lo que permite probar guardias de esquema, completitud y evidencia en un entorno sintetico reproducible.
- Despliegue local en Apple Silicon para experimentacion: al ser un adaptador MLX sobre una base de 4 bits, se puede cargar con MLX-LM en equipos con memoria unificada, siempre que se fije la revision exacta de la base y se asuma el caracter experimental.

## Benchmarks y rendimiento

Validacion (72 casos, mismos ajustes de inferencia, modo `json_schema`, gramatica `exclusive_evidence_v1`):

| Artefacto | Casos | Precision requerida cruda | Recall requerido crudo | Precision requerida aceptada | Recall requerido aceptado | Registros aceptados |
|---|---:|---:|---:|---:|---:|---:|
| base | 72 | 82,35% | 98,72% | no disponible | 0,00% | 0 |
| adaptador | 72 | 96,89% | 100,00% | 100,00% | 37,18% | 27 |

Test retenido congelado (108 casos, greedy, thinking desactivado, 4.096 tokens de salida, timeouts de 45 s, sin reparacion):

| Metrica | Base | Adaptador |
|---|---:|---:|
| Precision de campos requeridos cruda | 81,58% | 95,44% |
| Recall de campos requeridos crudo | 98,41% | 99,60% |
| Completaciones validas segun esquema | 104/108 | 107/108 |
| Registros aceptados tras toda la validacion | 0/108 | 41/108 |
| Recall de campos requeridos aceptado | 0% | 32,54% |
| Hechos aceptados que coinciden con el gold autorado | ninguno devuelto | 231/231 |
| Completaciones truncadas | 4 | 1 |
| Latencia de peticion p50 / p95 | 1,88 s / 6,72 s | 1,42 s / 2,50 s |

Las pruebas separadas de capacidad de cita exacta hecho-evidencia quedaron en 0/9. El checkpoint no alcanza el objetivo de release de recall aceptado. No se han publicado resultados de benchmarks en la informacion disponible para MMLU, HumanEval, GSM8K ni otras tareas generales.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; la base es Qwen3-1.7B en 4 bits MLX, lo que situa la inferencia en el rango de pocos GB de memoria unificada, pero no se publica una cifra concreta.
- GPU recomendadas: el formato MLX esta pensado para Apple Silicon (memoria unificada); no se documentan GPU NVIDIA ni CUDA en la informacion proporcionada.
- Cabe en GPU de consumo: si, en equipos Apple Silicon con memoria unificada suficiente para una base de 1.700 millones en 4 bits; no se especifica el minimo exacto.
- Opciones de despliegue: MLX-LM con la version fijada en `training.json`, cargando la base pineada y el adaptador con `load(base, adapter_path=...)`; la comparacion de serving uso un hook experimental de oMLX, no una opcion oficial. No hay artefacto PEFT ni GGUF, por lo que vLLM, llama.cpp, Ollama y TGI no son aplicables directamente.
- Latencia y throughput: en el test, p50 de 1,42 s y p95 de 2,50 s por peticion para el adaptador (frente a 1,88 s y 6,72 s de la base) con 4.096 tokens maximos de salida y timeouts de 45 s; no se publica throughput agregado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| evidence-scraper-qwen3-1.7b-mlx-lora (este) | 1,7 B (base) + LoRA | no disponible | Extraccion web dirigida por esquema con evidencia | Apache 2.0 | Adaptador MLX en Hugging Face, 0 descargas |
| Qwen3-1.7B (base, `mlx-community/Qwen3-1.7B-4bit`) | 1,7 B | no disponible | Modelo generalista de texto | Apache 2.0 | Disponible en Hugging Face |
| Qwen3-1.7B sin cuantizar | 1,7 B | no disponible | Modelo generalista de texto | Apache 2.0 | Disponible en Hugging Face |

La comparacion relevante es contra su propia base: el adaptador mejora la precision cruda de campos requeridos (95,44% frente a 81,58% en test) y reduce la latencia p95, pero solo el adaptador produce registros aceptados tras validacion (41/108 frente a 0/108). No se dispone de comparacion con otros scrapers o modelos de extraccion en la informacion proporcionada.

## Limitaciones y advertencias

- Preparacion para produccion no establecida: el autor lo declara explicitamente y el recall aceptado en test es del 32,54%, por debajo del objetivo de release.
- Los resultados de validacion son sinteticos; no establecen precision en web real, cobertura universal ni superioridad frente a otros scrapers.
- La validez del JSON y la presencia de la fuente no garantizan exactitud factual; el codigo de aplicacion debe validar esquema, completitud y evidencia exacta, y asignar estado y procedencia.
- Las pruebas de cita exacta hecho-evidencia quedaron en 0/9; los fallos de citacion rechazan muchos hechos por lo demas correctos.
- Los patrones de tarea simples compartidos entre splits pueden inflar los resultados; las familias DOM y lexicas son disjuntas, pero no asi todos los patrones.
- Las etiquetas son autoradas y validadas automaticamente, no revisadas de forma independiente sobre web real.
- Generalizacion a esquemas personalizados no familiares no verificada.
- El adaptador es formato MLX, no PEFT ni GGUF; requiere la revision exacta de la base (`3b1b1768f8f8cf8351c712464f906e86c2b8269e`) y la version de MLX-LM fijada en `training.json`.
- La generacion directa en MLX es sin restricciones; la gramatica de esquema debe probarse por separado.
- Artefactos fusionados o recuantizados necesitan su propia evaluacion.
- La comparacion de serving uso un hook experimental de oMLX, no una opcion oficial.
- Licencia Apache 2.0 permite uso comercial, pero los pesos derivan de Qwen3-1.7B de Qwen; se debe mantener la atribucion correspondiente.
- Sesgos conocidos y riesgos de alucinacion especificos del adaptador: no disponibles en la informacion proporcionada.

## Enlaces

- Hugging Face: https://huggingface.co/guike8/evidence-scraper-qwen3-1.7b-mlx-lora
- Modelo base: https://huggingface.co/mlx-community/Qwen3-1.7B-4bit
- Codigo del scraper: https://github.com/guike8/evidence-ai-scraper-public
- Informe del experimento: https://github.com/guike8/evidence-ai-scraper-public/blob/main/training/RESULTS.md

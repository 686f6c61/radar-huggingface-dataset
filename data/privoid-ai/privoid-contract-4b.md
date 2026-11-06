# Privoid-ai/Privoid-Contract-4B

## Resumen

Privoid Contract 4B es un ajuste fino mediante LoRA del modelo Qwen3-4B-Instruct-2507, desarrollado por Privoid-ai, especializado en la extraccion de clausulas de contratos comerciales en ingles. El modelo lee una seccion de contrato, identifica hasta 39 categorias de clausulas y devuelve JSON con el texto exacto en el que se basa cada hallazgo. Su proposito es servir como herramienta de revision local: al ejecutarse en hardware propio, los contratos no salen de la maquina del usuario.

La relevancia del modelo radica en su enfoque de despliegue privado para un dominio sensible como el legal, donde enviar documentos a APIs externas plantea problemas de confidencialidad. Con 4.000 millones de parametros, el modelo es lo bastante pequeno para ejecutarse en CPU mediante la version GGUF o en GPUs de consumo, y su entrenamiento se realizo sobre el dataset CUAD (Atticus Project), un corpus de referencia en analisis contractual.

El autor presenta resultados comparativos frente a Gemini 3.5 Flash y frente al modelo base sin entrenar sobre el mismo conjunto de contratos, con un F1 de clausula de 0,595 sobre el conjunto de test completo de 102 contratos. La model card advierte explicitamente de que se trata de una ayuda a la revision humana y no de asesoramiento legal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), ajuste fino mediante LoRA (PEFT) |
| Parametros totales | 4B (modelo base Qwen3-4B-Instruct-2507) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible de forma explicita; el ejemplo GGUF usa n_ctx = 4096 y las secciones se limitan a 5000 caracteres |
| Tipos de cuantizacion | GGUF disponible en el repo hermano (ejemplo con Q5_K_M); otras cuantizaciones no disponibles |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA); GGUF en repo separado |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Instruct-2507, un transformer decoder-only de 4.000 millones de parametros, y se ajusta mediante LoRA, por lo que el repositorio principal contiene unicamente el adaptador (0,1 GB) y no los pesos completos. El entrenamiento se realizo sobre el dataset theatticusproject/cuad, un corpus de contratos comerciales anotados por abogados con categorias de clausulas. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO.

La innovacion principal no es arquitectonica sino de diseno de tarea: el modelo se entrena para devolver JSON estructurado con citas textuales exactas del fragmento analizado, lo que permite verificar cada hallazgo contra el texto original. La model card indica que el 99,1% de las citas generadas son exactas sobre el conjunto de test completo. El prompt de sistema y el prefijo del asistente son obligatorios y se distribuyen en el archivo `prompt.json` del repositorio, lo que implica que el modelo no funciona correctamente con prompts arbitrarios.

## Capacidades

- Extraccion de clausulas contractuales en 39 categorias predefinidas, con devolucion de JSON estructurado.
- Cita textual exacta del fragmento en el que se basa cada clausula detectada.
- Generacion de JSON valido en el 96,2% de los casos sobre el conjunto de test completo.
- Procesamiento por secciones de hasta 5000 caracteres con solapamiento recomendado.
- Clasificacion de presencia a nivel de contrato (contract-level F1 de 0,876).
- Ejecucion local en CPU (version GGUF) o GPU (adaptador PEFT).
- No dispone de tool calling, capacidades de agente, vision ni audio segun la informacion disponible.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Revision contractual en despachos pequenos: el modelo procesa secciones de contratos y devuelve un inventario de clausulas presentes, reduciendo el tiempo de lectura inicial antes de la revision por un abogado.
- Cumplimiento y due diligence en fusiones y adquisiciones: permite clasificar rapidamente clausulas de ley aplicable, cesion, no competencia o licencias en grandes volumenes de contratos sin sacar los documentos de la infraestructura interna.
- Despliegue en entornos con requisitos de confidencialidad: al ejecutarse en local (incluso en CPU con GGUF), es adecuado para bufetes u organizaciones que no pueden enviar contratos a APIs de terceros.
- Preprocesamiento para sistemas de gestion documental: la salida JSON con citas exactas se puede indexar en bases de datos o motores de busqueda para construir un repositorio consultable de clausulas.
- Asistencia a equipos de compras: deteccion automatica de clausulas de precio, renovacion o terminacion en contratos de proveedores, con verificacion humana posterior.
- Filtrado y triaje de contratos: dado un lote de documentos, el modelo identifica cuales contienen categorias de riesgo (por ejemplo, licencias de afiliados o no desprestigio) para priorizar la revision manual.
- Integracion en pipelines de Python: el ejemplo con Transformers y PEFT permite incorporar la extraccion como paso de un flujo automatizado de procesamiento por secciones.

## Benchmarks y rendimiento

Resultados sobre 8 contratos (157 secciones) del split de test oficial de CUAD:

| Modelo | Clause F1 | Rango 95% | Precision | Recall | Contract-level F1 | JSON valido | Citas exactas |
|:---|---:|---:|---:|---:|---:|---:|---:|
| Privoid Contract 4B | 0,514 | 0,435 a 0,638 | 0,461 | 0,580 | 0,870 | 0,917 | 0,989 |
| Gemini 3.5 Flash | 0,441 | 0,384 a 0,541 | 0,454 | 0,430 | 0,846 | 0,936 | 1,000 |
| Qwen3-4B sin entrenar | 0,233 | 0,185 a 0,382 | 0,176 | 0,347 | 0,705 | 0,745 | 0,617 |

Resultados sobre el conjunto de test completo (102 contratos):

| Modelo | Clause F1 | Rango 95% | Precision | Recall | Contract-level F1 | JSON valido | Citas exactas |
|:---|---:|---:|---:|---:|---:|---:|---:|
| Privoid Contract 4B | 0,595 | 0,558 a 0,634 | 0,562 | 0,633 | 0,876 | 0,962 | 0,991 |

Rendimiento por categoria (seleccion): Governing Law 0,91; Agreement Date 0,85; categorias debiles: Affiliate License 0,17 y 0,14, Rofr/Rofo/Rofn 0,26, Non-Disparagement 0,27. Price Restrictions no tiene clausulas en el test set y carece de puntuacion. Los resultados completos estan en `per_category.csv`.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; para un modelo de 4B en precision completa se requieren aproximadamente 8-10 GB, y en cuantizacion de 4-5 bits alrededor de 3-4 GB (estimacion orientativa, no confirmada en la informacion).
- GPU recomendadas: no especificadas por el autor. Por tamano, cabe en RTX 3090, RTX 4090, A100 y H100; tambien en GPUs de consumo con 8 GB o mas en cuantizacion.
- Ejecucion en CPU: si, mediante la version GGUF (ejemplo con Q5_K_M y n_ctx = 4096).
- Opciones de despliegue: Transformers + PEFT + Accelerate (adaptador), llama-cpp-python (GGUF). No se mencionan vLLM, TGI ni Ollama en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Privoid Contract 4B | 4B | no disponible | Extraccion de clausulas CUAD, local | Apache 2.0 | Hugging Face (adaptador y GGUF) |
| Qwen3-4B-Instruct-2507 (base) | 4B | no disponible | Proposito general | Apache 2.0 | Hugging Face |
| Gemini 3.5 Flash | no disponible | no disponible | Proposito general, API | propietaria | API de Google |

La comparacion directa con Gemini 3.5 Flash en la model card muestra un F1 de clausula superior para Privoid (0,514 frente a 0,441) en la muestra de 8 contratos, aunque los intervalos de confianza se solapan y el autor advierte de que no se puede concluir superioridad con esa muestra. Gemini obtuvo mayor proporcion de JSON valido (0,936 frente a 0,917) y citas exactas perfectas (1,000 frente a 0,989), ademas de recibir prompts con definiciones completas de cada categoria, lo que favorece al modelo propietario. No se dispone de comparaciones con otros modelos especializados en analisis contractual en la informacion proporcionada.

## Limitaciones y advertencias

- Solo probado en contratos comerciales en ingles; no hay evidencia de funcionamiento en otros idiomas o tipos de documentos.
- No es asesoramiento legal: la model card lo describe como ayuda a la revision humana.
- Categorias con rendimiento bajo que no deben usarse de forma fiable: Affiliate License (0,17 y 0,14), Rofr/Rofo/Rofn (0,26) y Non-Disparagement (0,27).
- Categorias con pocas clausulas en el test set tienen puntuaciones ruidosas; Price Restrictions no tiene datos.
- El 3,8% de las respuestas sobre el test completo no son JSON valido, lo que requiere manejo de errores en produccion.
- El 0,9% de las citas no son exactas y se descartan antes de puntuar; en un flujo real deben verificarse contra el texto.
- Requiere el prompt de sistema y el prefijo del asistente de `prompt.json`; otros prompts pueden degradar el resultado.
- Las secciones deben dividirse en fragmentos de hasta 5000 caracteres con solapamiento; clausulas cortadas pueden perderse.
- La comparacion con Gemini se basa en solo 8 contratos y los intervalos de confianza se solapan.
- Licencia Apache 2.0 permite uso comercial, pero no se detallan sesgos especificos en la informacion disponible.
- Riesgo de alucinacion en categorias con bajo rendimiento y en contratos fuera de la distribucion de CUAD.

## Enlaces

- Modelo (adaptador LoRA): https://huggingface.co/Privoid-ai/Privoid-Contract-4B
- Version GGUF: https://huggingface.co/Privoid-ai/Privoid-Contract-4B-GGUF
- Modelo base: https://huggingface.co/unsloth/Qwen3-4B-Instruct-2507
- Dataset CUAD: https://huggingface.co/datasets/theatticusproject/cuad
- Resultados por categoria: https://huggingface.co/Privoid-ai/Privoid-Contract-4B/blob/main/per_category.csv

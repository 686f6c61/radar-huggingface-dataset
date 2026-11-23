# developmentseed/gazet-models

## Resumen

gazet-models es un repositorio de modelos de lenguaje de pequeno tamano desarrollado por Development Seed, la organizacion responsable de gazet, un geocodificador en lenguaje natural. El repositorio agrupa multiples ejecuciones de entrenamiento (runs) orientadas a dos tareas concretas: la generacion de planes de geocodificacion en JSON a partir de preguntas en ingles y la traduccion de lenguaje natural a SQL espacial para DuckDB. Cada carpeta contiene los pesos fusionados en formato transformers, el adaptador LoRA, ficheros GGUF para llama.cpp, el registro de entrenamiento y las respuestas del modelo a los conjuntos de prueba.

El modelo principal recomendado para geocodificacion es `plan-v5-smol135`, construido sobre SmolLM2-135M-Instruct con 596.049.920 parametros totales en el repositorio y un fichero GGUF q8_0 de 145 MB. Su relevancia actual reside en que demuestra que un modelo de 135 millones de parametros, ajustado con LoRA sobre datos sinteticos y relabelados, puede ejecutarse en la CPU de un portatil y en el navegador mediante wllama, alcanzando un 89,2% de coincidencia de caracteristicas en preguntas multi-lugar retenidas y un 99,1% en la identificacion de lugares.

El repositorio tambien incluye runs de SQL espacial sobre Qwen3-0.6B, Qwen3.5-2B, Qwen3.5-0.8B y Qwen2.5-Coder-0.5B, con resultados de ejecucion sobre conjuntos de prueba gold y dev. La licencia es `per-run`, lo que implica que cada run hereda la licencia de su modelo base: Apache-2.0 para los derivados de SmolLM2, Qwen3, Qwen3.5 y Qwen2.5-Coder, y LFM Open License v1.0 para el run basado en LFM2.5-350M.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelos base: SmolLM2, Qwen3, Qwen3.5, Qwen2.5-Coder, LFM2.5) con ajuste fino LoRA fusionado |
| Parametros totales | 596.049.920 (dato real del repositorio safetensors); varia por run: 135M (SmolLM2), 350M (LFM2.5), 0.5B (Qwen2.5-Coder), 0.6B (Qwen3), 0.8B (Qwen3.5), 2B (Qwen3.5) |
| Parametros activos | no disponible (no se documenta ninguna variante MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (se menciona explicitamente q8_0 para `plan-v5-smol135`); otros niveles no disponibles |
| Idiomas soportados | en (ingles) |
| Licencia | other / per-run: Apache-2.0 para runs sobre SmolLM2, Qwen3, Qwen3.5 y Qwen2.5-Coder; LFM Open License v1.0 para `plan-v1-lfm350` |
| Formato de pesos | safetensors (transformers, pesos fusionados), adaptador LoRA, GGUF (llama.cpp) |
| Tamano del repositorio | 34,3 GB |
| Pipeline | text-generation |
| Etiquetas | geocoding, geospatial, duckdb, text-to-sql, gguf, gazet |

## Arquitectura y entrenamiento

Cada run parte de un modelo base decoder-only de la familia correspondiente (SmolLM2-135M-Instruct, Qwen3-0.6B, Qwen3.5-0.8B, Qwen3.5-2B, Qwen2.5-Coder-0.5B o LFM2.5-350M) y se ajusta mediante LoRA, cuyos pesos se fusionan posteriormente en los pesos transformers. Los modelos de planificacion (`plan-v1` a `plan-v5`) se entrenan sobre el dataset `chatml/gazet_plan_v5`, que combina gazet-dataset relabelado con preguntas multi-lugar; los modelos SQL se entrenan sobre pares pregunta/SQL en `chatml/v2_pub` y variantes. Los runs `rl-*` aplican GRPO con una recompensa de coincidencia de ejecucion (execution-match reward) partiendo de un modelo SQL supervisado.

Los datos de entrenamiento de los modelos de planificacion provienen exclusivamente de divisiones de Overture Maps y Natural Earth (© OpenStreetMap contributors, ODbL; Natural Earth es dominio publico). Los runs SQL usan el lago de datos descrito en la data card de `gazet-sql-data`, con fuentes bajo OGL v3, ODbL, CDLA-Permissive-2.0, CC BY 4.0, CC BY 2.5 India, Singapore Open Data Licence, PDL 1.0, Etalab 2.0 y fuentes de dominio publico. El texto sintetico de entrenamiento se genero con DeepSeek-V4.1-Flash y GLM-5.3-Flash (ambos MIT) y se filtro con un juez MiniMax-M3. Los runs `-pub` son reentrenamientos de runs internos previos sobre datos sin filas no publicables (fronteras EU NUTS no comerciales y aproximadamente 210 pares servidos por un proveedor cuyos terminos prohiben entrenar con su salida).

## Capacidades

- Generacion de planes de geocodificacion en JSON: a partir de una pregunta en lenguaje natural, el modelo produce un plan que gazet compila a SQL (`src/gazet/plan.py`), con IDs restringidos a los candidatos del esquema `gazet.plan.plan_schema`.
- Resolucion de lugares: identificacion de toponimos y entidades geograficas con un 99,1% de acierto en el conjunto de prueba de lugares del run `plan-v5-smol135`.
- Preguntas multi-lugar: manejo de consultas que combinan varias localizaciones, con un 89,2% de coincidencia de caracteristicas en el conjunto retenido multi-lugar.
- Text-to-SQL espacial: generacion de consultas SQL para DuckDB con funciones espaciales a partir de tarjetas de esquema y una pregunta.
- Razonamiento multi-paso via GRPO: los runs `rl-*` optimizan la coincidencia de ejecucion de la consulta generada, no solo la forma textual.
- Modelo conjunto: `joint-v1-q3-06b-pub` combina planes de gazet, lugares y SQL DuckDB en un unico modelo.
- Ejecucion en navegador y CPU: el fichero GGUF q8_0 de 145 MB de `plan-v5-smol135` se ejecuta en CPU de portatil y en el navegador mediante wllama.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponibles.
- Modo thinking: los modelos SQL requieren desactivar el modo thinking; no se documenta un modo thinking utilizable.

## Casos de uso

- Geocodificacion en navegador: cargar `plan-v5-smol135/gguf/gazet-plan-v5-smol135-q8_0.gguf` (145 MB) con wllama para resolver consultas de lugares directamente en el cliente, sin backend, usando los prompts de `gazet.lm` y decodificando bajo el esquema JSON con temperatura 0.
- Geocodificacion por lotes en CPU: desplegar el GGUF q8_0 en un portatil o servidor sin GPU para procesar grandes volumenes de preguntas de localizacion, ya que el modelo de 135M cabe holgadamente en memoria y no requiere acelerador.
- Asistente de busqueda geoespacial: integrar el modelo de planificacion en una interfaz de busqueda para traducir preguntas como "restaurantes cerca de la Puerta del Sol" en planes estructurados que gazet compila a SQL sobre Overture Maps.
- Generacion de SQL espacial para analistas: usar `sql-v2-q35-2b-pub` (70,1% en gold v2, 81,0% en dev v1) para que analistas sin conocimiento de DuckDB espacial formulen consultas a partir de tarjetas de esquema y lenguaje natural.
- Modelo SQL pequeno para produccion con latencia baja: desplegar `rl2-q3-06b-pub-lr1e5` (56,4% en gold v1, 77,7% en dev v1), el mejor modelo SQL pequeno del trabajo, en un servicio con Qwen3-0.6B como base para entornos con restricciones de VRAM.
- Pipeline conjunto de geocodificacion y consulta: emplear `joint-v1-q3-06b-pub` para resolver tanto la identificacion de lugares como la generacion de SQL en un unico modelo, simplificando el despliegue en aplicaciones de analitica geoespacial.
- Evaluacion y comparacion de estrategias de ajuste: usar los distintos runs (`plan-v1` a `plan-v5`, `sql-v2`, `rl`, `rl2`) como referencia reproducible para estudiar el efecto del relabelado de datos, el tamano del modelo base y el RL con recompensa de ejecucion en tareas de text-to-SQL.

## Benchmarks y rendimiento

Resultados de los modelos de planificacion (coincidencia de caracteristicas/geometria y lugares):

| Run | Modelo base | Resultado |
|---|---|---|
| `plan-v5-smol135` | SmolLM2-135M-Instruct | multi-lugar retenido 89,2% mismas caracteristicas; gazet test 82,0% misma geometria; lugares 99,1% |
| `plan-v1-smol135` | SmolLM2-135M-Instruct | gazet test 78,9% misma geometria |
| `plan-v1-q3-06b` | Qwen3-0.6B | 82,6% |
| `plan-v1-lfm350` | LFM2.5-350M | 82,9% |

Resultados de los modelos SQL (coincidencia de ejecucion lenient sobre conjuntos sin NUTS: gold v1 291 preguntas, gold v2 137, dev v1 686; prompts planos, sin pistas de valores):

| Run | Modelo base | gold v1 | gold v2 | dev v1 |
|---|---|---|---|---|
| `sql-v2-q35-2b-pub` | Qwen3.5-2B | 54,0% | 70,1% | 81,0% |
| `rl-q3-06b-lr2e5-pub` | Qwen3-0.6B | 56,7% | 46,7% | 75,8% |
| `rl2-q3-06b-pub-lr1e5` | Qwen3-0.6B | 56,4% | 53,3% | 77,7% |
| `sql-v2-q3-06b-pub` | Qwen3-0.6B | 44,7% | 43,1% | 74,2% |
| `sql-v2-coder05-pub` | Qwen2.5-Coder-0.5B | 48,1% | 44,5% | 71,6% |
| `joint-v1-q3-06b-pub` | Qwen3-0.6B | 48,1% | 47,4% | 76,4% |
| `sql-v1-r16-pub` | Qwen3.5-0.8B | 43,0% | no disponible | 70,0% |

## Requisitos de hardware

- VRAM estimada para inferencia: el run de 135M en GGUF q8_0 ocupa 145 MB, por lo que cabe en cualquier CPU y en GPUs con muy poca memoria; los runs de 0,5B a 0,8B requieren aproximadamente 1-2 GB en cuantizaciones de 8 bits y los de 2B en torno a 2-4 GB, estimaciones no confirmadas en la informacion disponible.
- GPU recomendadas: no se especifican en la informacion proporcionada; por tamano, los runs de 135M y 0,5-0,8B son aptos para RTX 4090 y GPUs consumer en general, y el run de 2B cabe en GPUs consumer con 8 GB o mas.
- Cabe en GPU consumer: si, todos los runs del repositorio; el modelo principal `plan-v5-smol135` funciona incluso sin GPU.
- Opciones de despliegue: llama.cpp y wllama (via GGUF), transformers (pesos fusionados safetensors) y adaptadores LoRA; el repositorio incluye una demo en `dataset/generative/demo/` del repositorio gazet. vLLM, Ollama y TGI no se mencionan explicitamente.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `plan-v5-smol135` (este repo) | 135M | no disponible | multi-lugar 89,2%; lugares 99,1% | Apache-2.0 (base SmolLM2) | Hugging Face, GGUF |
| `plan-v1-q3-06b` (este repo) | 0,6B | no disponible | gazet test 82,6% | Apache-2.0 (base Qwen3) | Hugging Face |
| `plan-v1-lfm350` (este repo) | 350M | no disponible | gazet test 82,9% | LFM Open License v1.0 | Hugging Face |
| `sql-v2-q35-2b-pub` (este repo) | 2B | no disponible | gold v2 70,1%; dev v1 81,0% | Apache-2.0 (base Qwen3.5) | Hugging Face |

No se dispone de datos de modelos externos comparables de geocodificacion o text-to-SQL espacial en la informacion proporcionada; la comparativa se limita a los runs del propio repositorio.

## Limitaciones y advertencias

- Solo soporta ingles (`language: [en]`); no se documenta soporte multilingue.
- Orientado exclusivamente a geocodificacion y SQL espacial sobre los esquemas y prompts de gazet; fuera de ese dominio su comportamiento no esta caracterizado.
- Los modelos de planificacion requieren los prompts especificos de `gazet.lm` (`_PLACES_SYSTEM_PROMPT`, `plan_messages`), decodificacion bajo el esquema `gazet.plan.plan_schema` con IDs limitados a los candidatos y temperatura 0; un uso fuera de ese protocolo puede degradar los resultados.
- Los modelos SQL requieren desactivar el modo thinking.
- La licencia es `per-run`: debe revisarse la licencia del modelo base de cada carpeta. `plan-v1-lfm350` esta bajo LFM Open License v1.0, que permite uso comercial solo a entidades por debajo de su umbral de ingresos.
- Los runs `-pub` excluyen datos no publicables (fronteras EU NUTS no comerciales y pares de un proveedor con terminos que prohiben el entrenamiento con su salida); los resultados pueden diferir de los runs internos previos, y `rl-q3-06b-lr2e5-pub` es 4,8 puntos inferior en dev v1.
- El mejor modelo SQL pequeno del trabajo previo (RL ronda 2 sobre Qwen3-0.6B) no se ha reentrenado en la version publica.
- Riesgo de alucinacion: no se documenta explicitamente, pero al ser modelos generativos de JSON y SQL, la salida debe validarse contra el esquema y ejecutarse en un entorno controlado.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Los resultados de benchmarks se miden con coincidencia de ejecucion lenient y prompts planos, lo que puede no reflejar el rendimiento en produccion con prompts complejos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/developmentseed/gazet-models
- Repositorio gazet en GitHub: https://github.com/developmentseed/gazet
- Dataset gazet-sql-data: https://huggingface.co/datasets/developmentseed/gazet-sql-data
- Dataset gazet-dataset: https://huggingface.co/datasets/developmentseed/gazet-dataset
- Licencia ODbL: https://opendatacommons.org/licenses/odbl/1-0/

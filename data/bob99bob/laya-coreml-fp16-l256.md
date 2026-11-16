# Bob99Bob/laya-coreml-fp16-L256

## Resumen

Laya Core ML FP16 L256 es una conversión a formato Core ML del modelo `convaiinnovations/laya`, publicada por el usuario Bob99Bob para su ejecución en Apple Silicon. No se trata de un modelo nuevo ni de un ajuste fino: los pesos son los del editor original (Convai Innovations, revisión `1c5edc17a7acd8701df6fc341c0d179f1c62c982`), únicamente reempaquetados para aprovechar la Neural Engine de los chips M-series de Apple. El repositorio contiene exclusivamente los artefactos generados por la conversión, no los ficheros del editor.

El modelo resultante es un clasificador de texto (pipeline `text-classification`) que integra el codificador y la cabeza de decisión en un único paquete Core ML en FP16 con longitud fija de 256 tokens. Su propósito dentro del ecosistema veJ es actuar como uno de los "lectores" que los distintos niveles consultan antes del juez final, ejecutándose en la Neural Engine para no competir por la GPU con el resto de modelos del sistema.

La relevancia de esta ficha es acotada: no aporta capacidades nuevas de generación ni de razonamiento, sino una ruta de despliegue optimizada para hardware Apple. Con 0 descargas y 0 likes en el momento de la consulta, y un tamaño de repositorio de 0,8 GB, es un artefacto de nicho orientado a un pipeline concreto (veJ) más que un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (codificador + cabeza de decisión) convertido a Core ML; capas del cabezal de decisión reescritas como operaciones planas |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens (longitud fija) |
| Tipos de cuantizacion | FP16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Core ML (`laya.mlpackage`, `model.mlmodel`, `Manifest.json`) |

## Arquitectura y entrenamiento

La conversión no entrena ni ajusta nada: los pesos provienen íntegramente del modelo base `convaiinnovations/laya`. El paquete Core ML agrupa el codificador y la cabeza de decisión en un único modelo FP16 con longitud fija de 256 tokens, destinado a la Neural Engine. Las entradas son `input_ids` y `attention_mask` (int32, forma `[1, 256]`), `marker_map` (float32, forma `[1, 32, 256]`, con valor 1 en la posición `<mask>` de cada opción) y `question_type` (float32, forma `[1, 3]`: elección, puntuación, sí/no). La salida es `logits` con forma `[1, 32]`, sin calibrar, donde las filas sin marcador se fijan a -1e4. La cabeza de acción ("act head") queda excluida de la conversión.

El detalle técnico destacable es que las capas transformer del cabezal de decisión se reescribieron como operaciones planas, porque la ruta rápida de PyTorch no convierte correctamente a Core ML. Los ficheros `rl_agent_config.json` (con las temperaturas de calibración del editor), `rl_common.py` y el tokenizador no se copian en este repositorio: se obtienen del editor en la misma revisión. De las 1.129 operaciones del modelo, 1.119 se colocan en la Neural Engine. La conversión se realizó con el script `provision/recipes/laya/laya_coreml_convert.py` de veJ.

## Capacidades

- Clasificación de texto mediante cabeza de decisión con hasta 32 opciones por consulta.
- Tres tipos de pregunta soportados: elección entre opciones (`choice`), puntuación (`score`) y respuesta sí/no.
- Selección de opción basada en posiciones `<mask>` codificadas en `marker_map`.
- Ejecución en Neural Engine de Apple Silicon, liberando la GPU para otros modelos del sistema.
- Integración como "lector" previo al juez en el pipeline veJ.
- No incluye generación de texto libre, tool calling, agentes, visión, audio ni modo de razonamiento explícito.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Clasificación de intenciones en asistentes conversacionales: el modelo evalúa hasta 32 opciones etiquetadas por consulta y devuelve logits por opción, adecuado para enrutar peticiones a distintos flujos sin consumir GPU.
- Filtrado previo en pipelines de moderación: como lector que responde preguntas de sí/no antes de un juez más costoso, reduce el número de consultas que llegan al modelo grande.
- Puntuación de candidatos en sistemas de ranking: el tipo de pregunta `score` permite asignar puntuaciones a opciones predefinidas en tareas de selección.
- Despliegue en Mac mini o portátiles Apple Silicon: con 23,6 ms por llamada en Neural Engine (M4 Pro), encaja en servicios locales con presupuesto energético ajustado y sin GPU dedicada.
- Coprocesamiento junto a otros modelos en el mismo chip: al ejecutarse en Neural Engine, coexiste con codificadores como el de GLiNER en la misma máquina (34,0 ms por llamada cuando comparten procesador).
- Evaluación de respuestas en pipelines de RL o anotación: la configuración de calibración del editor (`rl_agent_config.json`) permite usar el modelo como evaluador dentro de flujos de decisión.
- Prototipado de clasificadores de opción múltiple en local: la longitud fija de 256 tokens simplifica el despliegue en entornos Apple sin necesidad de servidores GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, GLUE, etc.) en la información disponible. Las únicas métricas aportadas son de latencia, medidas por veJ:

| Metrica | Valor |
|---|---|
| Latencia por llamada en Neural Engine (Mac mini M4 Pro) | 23,6 ms |
| Latencia por llamada en CPU | 57 ms |
| Latencia con GLiNER compartiendo Neural Engine | 34,0 ms |
| Operaciones en Neural Engine | 1.119 de 1.129 |

## Requisitos de hardware

- Hardware objetivo: Apple Silicon con Neural Engine (M-series); las mediciones se realizaron en un Mac mini con M4 Pro.
- VRAM: no aplica; el modelo usa memoria unificada. El repositorio ocupa 0,8 GB en disco.
- GPU dedicadas (A100, H100, RTX 4090): no soportadas; el formato Core ML está orientado a Apple Silicon.
- Cabe en equipos consumer Apple: sí, en cualquier Mac con Neural Engine, con latencia de referencia de 23,6 ms por llamada.
- Despliegue: Core ML a través del servidor de veJ (`server/laya/laya_server.py`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Throughput: no disponible; solo se publica latencia por llamada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Laya Core ML FP16 L256 (esta ficha) | no disponible | 256 tokens fijos | Core ML FP16 | Apache-2.0 | Solo clasificación, Neural Engine, 23,6 ms/llamada en M4 Pro |
| convaiinnovations/laya (base) | no disponible | no disponible | no disponible | Apache-2.0 | Modelo original del que se deriva esta conversión |
| Alternativas de clasificación en Core ML | no disponible | no disponible | Core ML | varía | No se dispone de datos comparativos en la información proporcionada |

No se dispone de información suficiente para comparar con alternativas de la misma categoría en parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- No es un modelo generativo: solo produce logits de clasificación sobre hasta 32 opciones; no sirve para texto libre, código ni razonamiento abierto.
- Longitud de contexto fija de 256 tokens: entradas más largas no se procesan y las más cortas requieren relleno.
- La cabeza de acción queda fuera de la conversión, por lo que funcionalidades del modelo base que dependan de ella no están disponibles.
- Los logits de salida no están calibrados; las filas sin marcador se fijan a -1e4, lo que exige tratar esos casos explícitamente.
- Dependencia de ficheros externos: `rl_agent_config.json`, `rl_common.py` y el tokenizador deben descargarse del modelo base en la revisión exacta indicada; una revisión distinta puede romper la compatibilidad.
- Idiomas soportados no documentados; no se puede garantizar cobertura multilingüe.
- Sin datos publicados sobre sesgos o tasa de alucinación; al ser un clasificador, el riesgo se traslada a errores de clasificación y calibración.
- Licencia Apache-2.0 permite uso comercial, pero el aviso `NOTICE` documenta los cambios de la conversión y debe conservarse.
- Proyecto de nicho con 0 descargas y 0 likes: sin validación comunitaria ni mantenimiento garantizado.
- Solo funciona en Apple Silicon; no es portable a entornos Linux con GPU NVIDIA.

## Enlaces

- Hugging Face: https://huggingface.co/Bob99Bob/laya-coreml-fp16-L256
- Modelo base: https://huggingface.co/convaiinnovations/laya
- Repositorio veJ: https://github.com/ordinarybob/vej
- Benchmarks de veJ: https://github.com/ordinarybob/vej/blob/main/docs/BENCHMARKS.md

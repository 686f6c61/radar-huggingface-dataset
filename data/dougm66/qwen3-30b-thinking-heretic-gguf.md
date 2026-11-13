# dougm66/qwen3-30b-thinking-heretic-GGUF

## Resumen

qwen3-30b-thinking-heretic-GGUF es una version "abliterated" (decensurada) del modelo Qwen/Qwen3-30B-A3B-Thinking-2507 de Alibaba, publicada por el usuario dougm66 en Hugging Face. La abliteracion se ha realizado con la herramienta Heretic mediante tecnicas de ablacion de rango arbitrario (Arbitrary-Rank Ablation), cuyo objetivo es suprimir la direccion de rechazo aprendida por el modelo, de forma que responda a peticiones que el modelo original declinaba. Segun la model card, las negativas ante 100 sondas de prompts daninos caen de 100/100 en el modelo base a aproximadamente 12/100 en esta version, con una divergencia KL de aproximadamente 0,30 respecto al original.

El modelo hereda la arquitectura del Qwen3-30B-A3B-Thinking-2507: un transformer de tipo Mixture of Experts (MoE) con 30.532.122.624 parametros totales y un modo de razonamiento explicito (bloques `<think>`) que se conserva intacto tras la abliteracion. Se distribuye unicamente en formato GGUF con cuantizacion Q4_K_M, lo que reduce el repositorio a 18,6 GB y permite ejecutarlo en hardware de consumo mediante Ollama o llama.cpp. La licencia es Apache-2.0, heredada del modelo base.

Su relevancia es doble: por un lado, demuestra que la abliteracion se puede aplicar a un MoE de 30B con pensamiento extendido manteniendo una divergencia KL baja (lo que sugiere que las capacidades generales se preservan en gran medida); por otro, ofrece un punto de partida para investigadores que estudian alineamiento, mecanismos de rechazo y tecnicas de edicion de pesos. No obstante, el propio autor advierte que el modelo respondera a prompts que el original rechazaba, lo que traslada toda la responsabilidad de uso al operador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE), derivado de Qwen3-30B-A3B-Thinking-2507 |
| Parametros totales | 30.532.122.624 |
| Parametros activos | no disponible (el modelo base es A3B, pero la cifra exacta no se detalla en la informacion proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (unica publicada en el repositorio) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |
| Metodo de modificacion | Heretic ARA (Arbitrary-Rank Ablation), ensayo Pareto equilibrado |
| Divergencia KL vs base | ~0,30 |
| Tasa de rechazo (100 sondas) | ~12/100 (base: 100/100) |
| Tamano del repositorio | 18,6 GB |
| Sampling recomendado | temperature 0,6, top_p 0,95 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen3-30B-A3B-Thinking-2507, un transformer con capas de mezcla de expertos (MoE) y un regimen de razonamiento explicito que emite trazas internas dentro de etiquetas `<think>` antes de la respuesta final. El modelo base fue entrenado por Alibaba con un pipeline que incluye preentrenamiento a gran escala seguido de fases de ajuste supervisado y optimizacion preferencial, orientadas especificamente a tareas de razonamiento de varios pasos. La informacion proporcionada no detalla el numero exacto de tokens de entrenamiento, la composicion del corpus ni la mezcla de idiomas.

La modificacion aplicada por dougm66 no es un reentrenamiento, sino una edicion de pesos: Heretic implementa una ablacion de rango arbitrario que identifica y elimina (o atenua) la direccion latente responsable de las negativas del modelo. El autor reporta que el ensayo seleccionado es el "Pareto equilibrado", es decir, aquel que maximiza la reduccion de rechazos manteniendo la divergencia KL mas baja posible respecto al modelo original. Con KL ~0,30, la distribucion de salida del modelo modificado se mantiene proxima a la del base, lo que en la practica indica que la capacidad general (razonamiento, codigo, conocimiento) deberia conservarse en gran medida, aunque no se aportan benchmarks que lo verifiquen. El comportamiento de razonamiento del modelo Thinking original se preserva segun la model card.

## Capacidades

- Generacion de texto conversacional y de un solo turno, con soporte de dialogos multi-turno.
- Razonamiento explicito en modo "thinking": el modelo emite trazas internas dentro de `<think>` antes de la respuesta final, util para depuracion y para tareas de varios pasos.
- Razonamiento matematico y logico de varios pasos, heredado del modelo base Thinking-2507.
- Generacion de codigo y explicaciones tecnicas, segun las capacidades del Qwen3-30B-A3B-Thinking-2507.
- Respuesta a peticiones que el modelo base rechazaba (comportamiento abliterated), incluyendo contenido sensible o potencialmente danino.
- Compatibilidad con endpoints (tag `endpoints_compatible`) y con pipelines de text-generation estandar.
- No se documentan en la informacion proporcionada capacidades de vision, audio, tool calling ni function calling especificas de esta version; deben asumirse las del modelo base, no verificadas aqui.

## Casos de uso

- Investigacion sobre alineamiento y rechazo: el modelo sirve como contrapunto experimental al Qwen3-30B-A3B-Thinking-2507 para estudiar como se codifica la direccion de rechazo en un MoE de 30B y que efecto tiene su ablacion sobre la distribucion de salidas (KL ~0,30 reportada).
- Analisis de robustez de filtros de seguridad: desplegar el modelo en un entorno aislado para evaluar si los clasificadores de contenido de una organizacion detectan respuestas que el modelo base habria bloqueado, midiendo la tasa de evasion.
- Red teaming controlado: usar el modelo como generador de prompts y respuestas adversarias en ejercicios de seguridad ofensiva autorizados, aprovechando su tasa de rechazo reducida (~12/100) para ampliar la cobertura de pruebas.
- Generacion de codigo en pipelines locales: con Q4_K_M y 18,6 GB, se puede ejecutar en una estacion de trabajo con GPU de consumo mediante llama.cpp u Ollama, integrandose en flujos de autocompletado o generacion de scripts sin depender de APIs externas.
- Procesamiento de texto creativo sin restricciones editoriales: escritura de ficcion con tematicas adultas o violentas donde el modelo base aplicaria negativas, siempre que el operador asuma la responsabilidad legal y etica del contenido generado.
- Experimentacion con razonamiento explicito: el modo `<think>` permite auditar la cadena de razonamiento del modelo en tareas de matematicas o logica, util para investigacion en interpretabilidad y para depurar fallos de razonamiento.
- Despliegue en Ollama para prototipado rapido: el comando `ollama pull hf.co/dougm66/qwen3-30b-thinking-heretic-GGUF:Q4_K_M` permite tener el modelo operativo en minutos en un equipo con suficiente VRAM o RAM, ideal para pruebas de concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta metricas del proceso de abliteracion (tasa de rechazo ~12/100 frente a 100/100 del base, y divergencia KL ~0,30), no resultados en MMLU, HumanEval, GSM8K ni similares.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio GGUF Q4_K_M ocupa 18,6 GB, por lo que se necesita al menos esa cantidad de VRAM (o de memoria unificada) para cargar el modelo completo en GPU. Con offloading parcial a RAM se puede ejecutar con menos VRAM a costa de latencia.
- GPU recomendadas: para carga completa en GPU, una RTX 4090 (24 GB), RTX 3090 (24 GB), A100 (40/80 GB) o H100. En GPUs de 16 GB o menos sera necesario offloading de capas a RAM del sistema.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090 y modelos con 24 GB o mas de VRAM. En GPUs de 16 GB (RTX 4080, 4070 Ti Super) solo con offloading parcial.
- Opciones de despliegue: Ollama (`ollama pull hf.co/dougm66/qwen3-30b-thinking-heretic-GGUF:Q4_K_M`), llama.cpp (`llama-cli -hf dougm66/qwen3-30b-thinking-heretic-GGUF:Q4_K_M`). No se documentan otras opciones (vLLM, TGI) para este repositorio concreto.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Al ser un MoE con parametros activos reducidos, el throughput deberia ser superior al de un modelo denso de 30B, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros totales | Formato | Contexto | Licencia | Modificacion | Disponibilidad |
|---|---|---|---|---|---|---|
| dougm66/qwen3-30b-thinking-heretic-GGUF | 30,5B (MoE) | GGUF Q4_K_M | no disponible | Apache-2.0 | Abliterated (Heretic ARA) | Hugging Face |
| Qwen/Qwen3-30B-A3B-Thinking-2507 | 30,5B (MoE) | safetensors y otros | no disponible | Apache-2.0 | Original alineado | Hugging Face |
| Otros modelos abliterated de la familia Qwen3 | no disponible | GGUF | no disponible | Apache-2.0 (heredada) | Abliteration | Hugging Face |

La comparacion principal es con el modelo base: misma arquitectura y parametros, pero distinto comportamiento de rechazo (100/100 frente a ~12/100) y una divergencia KL de ~0,30. No se dispone de datos de benchmarks comparativos entre ambos en la informacion proporcionada.

## Limitaciones y advertencias

- La abliteracion elimina el mecanismo de rechazo, por lo que el modelo respondera a peticiones que el original declinaba, incluyendo contenido sensible o potencialmente danino. El autor traslada explicitamente la responsabilidad de uso y de las salidas al operador.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad factual para esta version; al ser una edicion de pesos, el riesgo deberia ser similar al del base, pero no esta verificado con benchmarks.
- Sesgos conocidos: no documentados en la informacion proporcionada; se heredan los del modelo base, no evaluados aqui.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no se detallan en la informacion disponible, lo que impide planificar despliegues multilingues o con ventanas largas con garantias.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el operador debe evaluar el cumplimiento legal y las politicas de su organizacion al desplegar un modelo sin filtros de rechazo.
- Solo se publica una cuantizacion (Q4_K_M); no hay variantes Q5, Q6, Q8 ni FP16 en el repositorio, lo que limita el ajuste de precision frente a memoria.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- La fecha de creacion indicada (2026-11-13) es futura respecto a la fecha habitual de publicacion de modelos de esta familia, lo que conviene verificar antes de confiar en los metadatos.

## Enlaces

- Hugging Face: https://huggingface.co/dougm66/qwen3-30b-thinking-heretic-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-30B-A3B-Thinking-2507
- Heretic (herramienta de abliteracion): https://github.com/p-e-w/heretic

# FluidInference/decision-1.0-kai-coreml

## Resumen

decision-1.0-kai-coreml es la conversion a Core ML en precision FP16 del modelo llm-semantic-router/Decision-1.0-Kai-0.6B, publicada por FluidInference. No es un modelo generativo de texto al uso, sino un modelo de toma de decisiones y enrutamiento semantico pensado para ejecutarse en el dispositivo: recibe una peticion y un conjunto acotado de candidatos y devuelve una eleccion, una ruta auxiliar y una puntuacion. El modelo nativo completo tiene 571.909.635 parametros unicos y tres rutas de decision entrenadas.

La relevancia de esta publicacion es de ingenieria mas que de investigacion: demuestra como llevar un modelo de decision de tamano medio a Core ML con formas fijas y verificacion de paridad frente al modelo nativo. Cada una de las tres rutas se empaqueta por separado (choice, noul y score), con 643,8 MB por paquete en FP16 y 1.931,4 MB en total, ya que cada grafo incluye su propia copia de los embeddings.

Se trata de una version inicial de formas fijas: para cada ruta solo se soportan 128 tokens y 2 o 3 slots de candidatos, muy por debajo del presupuesto de entrada publico del modelo fuente, de 1.024 tokens. El propio autor advierte de que las peticiones mas largas deben rechazarse o servirse con una variante posterior, porque truncarlas en silencio cambia el comportamiento del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle. El autor indica que el tracker estima un encoder de 307,8 M de parametros para esta entrada; el modelo nativo es un enrutador de decision con tres rutas entrenadas |
| Parametros totales | 571.909.635 parametros unicos en el modelo nativo (aproximadamente 0,57 B) |
| Parametros activos | No aplica: no se describe como un modelo MoE |
| Longitud de contexto | 1.024 tokens de presupuesto de entrada publico en el modelo fuente; las conversiones Core ML de esta release usan formas fijas de 128 tokens por peticion |
| Tipos de cuantizacion | FP16 (unica precision publicada en esta release) |
| Idiomas soportados | No disponible. El tokenizer heredado es de origen Gemma, pero el autor no publica lista de idiomas |
| Licencia | apache-2.0-plus-inherited-tokenizer-terms (contribuciones de Decision bajo Apache 2.0; el tokenizer heredado mantiene terminos adicionales de origen Gemma) |
| Formato de pesos | Core ML `.mlpackage` en FP16 (tres paquetes: choice, noul, score) |
| Tamano del repositorio | 2,0 GB |
| Fecha de publicacion indicada | 22 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El autor no documenta la arquitectura interna del modelo nativo mas alla de indicar que el tracker estima un encoder de 307,8 M de parametros y que el modelo completo contiene 571.909.635 parametros unicos, incluyendo todas las rutas y cabezas entrenadas. Lo que si se describe con detalle es la estructura funcional: tres rutas de decision entrenadas (choice, noul y score) que en la conversion Core ML se materializan en tres grafos independientes. Cada grafo arrastra su propia copia de los embeddings, de modo que el peso instalado (1.931,4 MB) supera el payload real de parametros unicos del modelo nativo.

La release es una conversion, no un reentrenamiento: el tokenizer y el runtime de origen no se han reentrenado ni modificado. La innovacion tecnica relevante es la conversion a Core ML de formas fijas con verificacion de paridad frente al modelo nativo anclado en la revision `7185f514f54b8f93c55998b1e8f9c5cc67f0d029`. Segun la model card, `conversion/run_coreml.py` aporta el renderizador "System One" fijado, el tokenizer, las mascaras de candidatos, el softmax y el mapeo de salida. El error maximo de probabilidad frente al nativo es de 0,00114638 en choice, 0,00321746 en noul y 0,000484943 en score.

No se publican datos sobre volumen de tokens de entrenamiento, composicion del dataset, ni uso de RLHF o DPO. El autor tampoco detalla si hubo fases de ajuste posteriores ni innovaciones como decodificacion especulativa o atencion lineal.

## Capacidades

- Toma de decisiones con candidatos acotados: la ruta choice selecciona entre 3 slots de candidatos sobre una ventana de 128 tokens.
- Ruta auxiliar noul: variante con 2 slots de candidatos y la misma ventana de 128 tokens.
- Puntuacion de candidatos: la ruta score devuelve una puntuacion sobre 3 slots de candidatos.
- Enrutamiento semantico: el modelo fuente se enmarca en la categoria de semantic router, es decir, decidir a que destino o ruta corresponde una peticion.
- Inferencia en dispositivo: la conversion a Core ML esta orientada a ejecucion local, sin llamadas a servidores externos.
- Ejecucion conjunta obligatoria: las tres rutas implementan en conjunto el modelo nativo, de modo que invocar solo choice no reproduce el modelo completo.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documenta capacidad multilingue explicita.
- No se documenta modo thinking, vision ni audio. En esta build tampoco se documenta generacion de texto libre.

## Casos de uso

- Enrutamiento de peticiones en asistentes locales: dado un mensaje del usuario y un conjunto de 3 destinos posibles, la ruta choice decide a que destino enviarlo, con la ventaja de que la decision se toma en el dispositivo y no requiere enviar la consulta a un servidor.
- Clasificacion de intenciones con dos alternativas: la ruta noul permite resolver escenarios binarios (por ejemplo, si una consulta debe atenderse localmente o derivarse a un servicio remoto) dentro de la ventana fija de 128 tokens.
- Puntuacion y ordenacion de respuestas candidatas: la ruta score puede usarse para asignar una puntuacion a 3 candidatos generados por otro componente, actuando como reranker ligero previo a la seleccion final.
- Puerta de entrada en arquitecturas multi-modelo: el modelo puede decidir si una consulta debe resolverse con un modelo pequeno local o escalarse a un modelo mayor, reduciendo coste y latencia en despliegues con varios niveles de servicio.
- Moderacion o filtrado previo: con la ruta noul, clasificar si una entrada cumple una condicion binaria antes de procesarla, manteniendo el contenido sensible dentro del dispositivo.
- Prototipado de pipelines de decision en Apple Silicon: sirve como bloque de referencia para validar conversiones Core ML de modelos de decision, comparando la salida del paquete con el modelo nativo mediante las fixtures incluidas en `conversion/`.
- Seleccion de herramientas en agentes: con la ruta choice y un maximo de 3 candidatos, elegir que herramienta o accion se activa en un flujo automatizado acotado, siempre que las entradas quepan en los 128 tokens soportados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que la comprobacion de paridad incluida "no es una puntuacion oficial de Decision Index ni una evaluacion amplia de calidad". Los unicos datos numericos publicados son de paridad frente al modelo nativo sobre un conjunto muy reducido de peticiones reales:

| Ruta de decision | Tokens | Slots de candidatos | Tamano FP16 (MB) | Peticiones fuente validadas | Error maximo de probabilidad vs. nativo |
|---|---:|---:|---:|---:|---:|
| choice | 128 | 3 | 643,8 | 2 | 0,00114638 |
| noul | 128 | 2 | 643,8 | 2 | 0,00321746 |
| score | 128 | 3 | 643,8 | 2 | 0,000484943 |
| Total instalado | - | - | 1.931,4 | - | - |

No hay datos publicados de MMLU, HumanEval, GSM8K ni de cualquier otro benchmark estandar, ni metricas de latencia o throughput.

## Requisitos de hardware

- Plataforma: la conversion es Core ML, por lo que el destino natural es hardware Apple con Neural Engine (familia M de Apple Silicon y chips A recientes de iPhone/iPad).
- Memoria: cada paquete FP16 ocupa 643,8 MB y los tres juntos suman 1.931,4 MB. A esa cifra hay que anadir el coste de compilacion de Core ML, que no esta incluido en el tamano de los paquetes.
- Memoria unificada recomendada: al menos 4 GB disponibles para poder cargar los tres paquetes simultaneamente con margen para el runtime. No hay cifra oficial publicada.
- GPU dedicadas (A100, H100, RTX 4090): no aplica, ya que el formato de pesos es Core ML y no safetensors ni GGUF.
- Opciones de despliegue: Core ML a traves de coremltools y del runtime del sistema; el repositorio incluye `conversion/run_coreml.py` y el flujo `uv sync --project conversion` para reproducir la conversion y las comprobaciones.
- vLLM, llama.cpp, Ollama o TGI: no son aplicables a esta release, porque no se distribuyen pesos en safetensors ni GGUF.
- Latencia y throughput: no disponibles.
- Nota de encaje en GPU de consumo: en el contexto de Apple Silicon, si cabe en equipos con memoria unificada de 8 GB o superior, siempre que no se carguen simultaneamente otros modelos grandes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FluidInference/decision-1.0-kai-coreml | 571.909.635 parametros unicos del modelo nativo | 1.024 tokens de presupuesto de entrada en el fuente; 128 tokens por ruta en esta conversion | Core ML FP16, 3 paquetes (1.931,4 MB) | apache-2.0-plus-inherited-tokenizer-terms | Publico en HuggingFace, 0 descargas |
| llm-semantic-router/Decision-1.0-Kai-0.6B (modelo fuente) | 571.909.635 parametros unicos | 1.024 tokens de presupuesto de entrada | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Publico en HuggingFace, revision `7185f514f54b8f93c55998b1e8f9c5cc67f0d029` |

No se dispone de informacion sobre otros modelos comparables de la misma categoria (enrutadores semanticos o modelos de decision en dispositivo) en la informacion proporcionada.

## Limitaciones y advertencias

- Formas fijas: la release solo soporta 128 tokens y 2 o 3 slots de candidatos por ruta. Peticiones mas largas o conjuntos de candidatos mayores deben rechazarse o servirse con una variante posterior.
- El truncado silencioso cambia el modelo: el autor advierte explicitamente de que recortar entradas altera el comportamiento, por lo que el rechazo explicito es obligatorio en produccion.
- Invocar solo la ruta choice no reproduce el modelo nativo: las tres rutas (choice, noul, score) son conjuntamente el modelo completo.
- Paridad validada solo con 2 peticiones reales por ruta. Es una comprobacion de comportamiento de conversion, no una evaluacion de calidad, y no equivale a una puntuacion oficial de Decision Index.
- La puntuacion del tracker no es atribuible a esta build: el adaptador de serving historico exacto no esta verificado publicamente, segun el propio autor.
- Sin benchmarks publicados: no hay evidencia publica de rendimiento en tareas estandar ni comparaciones con alternativas.
- Sin adopcion verificable: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion independiente en produccion.
- Licencia con herencia: las contribuciones de Decision son Apache 2.0, pero el tokenizer heredado mantiene terminos adicionales de origen Gemma. Es imprescindible revisar `LICENSE`, `NOTICE`, `LICENSING_STATUS.md`, `DISTRIBUTION_TERMS.md` y `LICENSES/` antes de un uso comercial.
- Idiomas no documentados: no hay lista oficial de idiomas soportados, por lo que no puede asumirse cobertura multilingue.
- Riesgo de alucinacion y sesgos: no evaluado ni documentado en la informacion disponible.
- Dependencia de plataforma: al ser Core ML, el despliegue queda ligado al ecosistema Apple y no es portable directamente a GPUs NVIDIA o AMD.
- Funcionalidad limitada por diseno: no se documenta generacion de texto, tool calling, razonamiento multi-paso, vision ni audio en esta release.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/FluidInference/decision-1.0-kai-coreml
- Modelo fuente (modelo nativo): https://huggingface.co/llm-semantic-router/Decision-1.0-Kai-0.6B
- Terminos de distribucion: https://huggingface.co/FluidInference/decision-1.0-kai-coreml/blob/main/DISTRIBUTION_TERMS.md
- Ficheros de licencia incluidos en el repositorio: `LICENSE`, `NOTICE`, `LICENSING_STATUS.md`, `LICENSES/`
- Codigo de conversion y fixtures: `conversion/` (incluye `conversion/run_coreml.py` y `conversion/upstream-system-one.json`)
- Informes de paridad: `reports/`
- Comandos de reproduccion indicados por el autor:
  - `uv sync --project conversion`
  - `uv run --project conversion python conversion/run_coreml.py --repo-root . --request-json conversion/upstream-system-one.json`

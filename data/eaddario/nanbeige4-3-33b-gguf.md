# eaddario/Nanbeige4.3-33B-GGUF

## Resumen

Nanbeige4.3-33B es un modelo de lenguaje de tipo transformer denso con 33.118.977.024 parametros (aproximadamente 33B), desarrollado por Nanbeige como modelo "teacher" de su familia Nanbeige4.3. Su proposito declarado es servir de base para destilar capacidades agenticas avanzadas en modelos mas pequenos (como el futuro Nanbeige4.3-3B) y, al mismo tiempo, ofrecer un modelo desplegable para tareas de programacion compleja y trabajo profesional colaborativo. La model card del autor original lo posiciona como estado del arte en rendimiento agentico entre modelos abiertos de la clase ~30B.

La ficha que nos ocupa, sin embargo, no es el modelo original sino una cuantizacion GGUF experimental publicada por el usuario eaddario bajo el identificador `eaddario/Nanbeige4.3-33B-GGUF`. Esta version aplica una tecnica propia de seleccion automatica de recetas de cuantizacion orientada a un objetivo global de bits por peso (bpw), usando un fork no estandar de llama.cpp y una imatrix de calibracion propia. El repositorio ocupa 282,7 GB e incluye multiples variantes de cuantizacion.

Es relevante ahora porque ejemplifica una linea de trabajo centrada en optimizar la inferencia de LLM en hardware de consumo (escritorio, portatil, edge), y porque el modelo base Nanbeige4.3-33B representa una alternativa abierta de tamano medio con enfasis en capacidades agenticas y de codigo. La licencia declarada es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (detalles internos no disponibles en la informacion proporcionada) |
| Parametros totales | 33.118.977.024 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Multiples variantes GGUF generadas con objetivo global de bpw (recetas concretas no detalladas en la informacion disponible) |
| Idiomas soportados | Ingles (declarado en la model card y en los tags) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo con cuantizaciones); el modelo base original se distribuye en safetensors |

## Arquitectura y entrenamiento

El modelo base Nanbeige4.3-33B es un transformer denso de aproximadamente 33B parametros. La informacion disponible no detalla la composicion del dataset de entrenamiento, el numero de tokens, ni si se aplicaron tecnicas de RLHF, DPO u otras fases de alineamiento. La model card original menciona que el modelo se disena como "teacher" de alta capacidad para anclar posteriormente la destilacion de capacidades agenticas en modelos mas pequenos de la misma familia.

La contribucion tecnica de esta ficha concreta es el proceso de cuantizacion, no el entrenamiento. El autor convierte los safetensors originales a GGUF F16, estima la perplejidad de referencia sobre `wikitext-2-raw-v1`, genera una imatrix a partir de su dataset de calibracion `eaddario/imatrix-calibration` y ejecuta un `llama-quantize` modificado con `--target-bpw` para seleccionar automaticamente la receta de cuantizacion de menor error que alcanza un bpw global objetivo. La imatrix pondera el error de cuantizacion segun estadisticas de activacion, penalizando mas el error en direcciones consideradas importantes. El autor valida cada modelo BF16 antes de la conversion para descartar degradacion por clipping de pesos, y senala que la conversion a F16 es entre un 15 y un 30 por ciento mas rapida que a BF16, con una diferencia de inferencia del 3 al 6 por ciento.

## Capacidades

- Generacion de texto conversacional y de proposito general.
- Razonamiento de multiples pasos orientado a tareas agenticas, segun la descripcion del modelo base.
- Programacion y tareas de codigo complejas, destacadas por el autor original como punto fuerte del modelo.
- Tareas de "cowork" profesional (flujos de trabajo colaborativos y de asistencia).
- Soporte de tool calling / function calling: no confirmado explicitamente en la informacion disponible.
- Capacidades multilingues: limitadas al ingles segun la model card y los tags.
- Vision, audio o modo "thinking": no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente de programacion en local: desplegado con llama.cpp u Ollama sobre una estacion de trabajo, el modelo puede resolver tareas de generacion y refactorizacion de codigo sin depender de la nube, aprovechando su tamano de 33B para mantener calidad en tareas de codigo complejas.
- Prototipado de agentes en hardware de consumo: las variantes GGUF de bajo bpw permiten ejecutar un modelo de clase 30B en equipos de escritorio, lo que facilita iterar sobre disenos de agentes antes de pasar a infraestructura mayor.
- Generacion de codigo en pipelines internos: integrable mediante llama.cpp o servidores compatibles con la API de OpenAI (el repo incluye el tag `endpoints_compatible`) para automatizar tareas de generacion de tests o documentacion.
- Evaluacion comparativa de cuantizaciones: util para investigadores que quieran medir el impacto de distintas recetas bpw sobre perplejidad, KL divergence y benchmarks (ARC, GPQA-Diamond, HellaSwag, MMLU-Redux, TruthfulQA, WinoGrande) usando las metricas que reporta el autor.
- Destilacion y ajuste fino como modelo teacher: al ser el modelo docente de la familia Nanbeige4.3, sirve para generar datos sinteticos o supervisar el entrenamiento de modelos mas pequenos.
- Despliegue en entornos con recursos limitados: portatiles, mini-PC o dispositivos edge donde no cabe el modelo en F16 pero si una cuantizacion agresiva, gracias al enfoque del autor en optimizar inferencia en hardware de consumo.
- Analisis de documentos y conversacion multi-turno en ingles: uso conversacional general, siempre que la ventana de contexto (no disponible) sea suficiente para el caso.

## Benchmarks y rendimiento

La model card original de Nanbeige4.3-33B referencia una figura de benchmarks (`nanbeige43-benchmarks.png`) pero no incluye cifras numericas en el texto proporcionado. El autor de la cuantizacion menciona que calcula Perplexity, KL Divergence, ARC (Easy+Challenge), GPQA-Diamond, HellaSwag, MMLU-Redux, TruthfulQA y WinoGrande para cada variante, pero no se han facilitado los valores en la informacion disponible.

No se han publicado resultados de benchmarks numericos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma exacta; como referencia orientativa, un modelo denso de 33B en F16 requiere del orden de 66 GB de pesos, y las cuantizaciones de menor bpw reducen esa cifra proporcionalmente (el autor no publica la tabla de bpw por variante en la informacion disponible).
- GPU recomendadas: no especificadas en la informacion proporcionada. Para el modelo completo en precision alta se requeriria hardware de clase A100/H100 o multiples GPU; las cuantizaciones agresivas estan pensadas para GPU de consumo.
- Cabe en GPU de consumo: el objetivo declarado del autor es precisamente habilitar el despliegue en hardware de consumo, escritorio, portatil y edge, mediante cuantizaciones de bajo bpw; no se detallan que modelos concretos de GPU lo soportan.
- Opciones de despliegue: llama.cpp (el autor usa un fork propio para la cuantizacion; la inferencia es compatible con llama.cpp estandar en formato GGUF), y por extension Ollama y otros runners GGUF. El tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo API de OpenAI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Nanbeige4.3-33B (esta ficha, GGUF) | 33,1B | No disponible | Apache 2.0 | GGUF | Cuantizacion experimental con objetivo bpw e imatrix propia |
| Nanbeige4.3-33B (original) | 33,1B | No disponible | Apache 2.0 | Safetensors | Modelo base sin cuantizar, referencia de calidad |
| Alternativas de la clase ~30B | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la informacion proporcionada para establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Version experimental: el propio autor advierte explicitamente de que estas cuantizaciones son experimentales y usan un fork no estandar de llama.cpp; pueden presentar comportamientos distintos a las cuantizaciones convencionales.
- Idiomas: el modelo esta declarado unicamente en ingles; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Contexto: la longitud de contexto no esta disponible en la informacion proporcionada, lo que impide validar casos de uso con ventanas largas.
- Alucinacion: no hay informacion sobre tasas de alucinacion ni sobre fases de alineamiento del modelo base; debe asumirse el riesgo habitual de un LLM de su clase.
- Sesgos: no se documentan evaluaciones de sesgo en la informacion disponible.
- Tool calling: no confirmado; no debe asumirse soporte nativo de function calling sin verificacion previa.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base original y de los datasets de calibracion utilizados.
- Repositorio de gran tamano (282,7 GB): la descarga completa es costosa; conviene seleccionar solo la variante de cuantizacion necesaria.
- Fecha de creacion del repo (2026-11-05): verificar la vigencia y el mantenimiento del fork de llama.cpp referenciado antes de usarlo en produccion.

## Enlaces

- Repositorio Hugging Face de la cuantizacion: https://huggingface.co/eaddario/Nanbeige4.3-33B-GGUF
- Modelo base original: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Dataset de calibracion imatrix: https://huggingface.co/datasets/eaddario/imatrix-calibration
- Paper de referencia sobre cuantizacion (arxiv:2311.12022): https://arxiv.org/abs/2311.12022
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
- Pull request de integracion del metodo bpw en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/15550

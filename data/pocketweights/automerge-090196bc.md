# PocketWeights/AutoMerge-090196bc

## Resumen

AutoMerge-090196bc es un modelo de lenguaje pequeño generado automáticamente por PocketFactory, el pipeline automatizado de la organizacion PocketWeights. Se trata de una fusion (merge) de los pesos de Qwen/Qwen2.5-0.5B-Instruct y Qwen/Qwen2.5-0.5B, ambas variantes del modelo base Qwen2.5 de Alibaba Cloud. El resultado es un modelo de aproximadamente 494 millones de parametros, distribuido exclusivamente en formato GGUF cuantizado en tres variantes: Q4_K_M, Q6_K y Q8_0.

La propuesta de valor de PocketWeights se centra en modelos ligeros optimizados para dispositivos edge y portatiles con GPU de consumo de 6-8 GB de VRAM, con integracion directa en Ollama y LM Studio. Al fusionar la variante instruct con la variante base del mismo modelo, se pretende conservar las capacidades conversacionales de la primera y el comportamiento generalista de la segunda, aunque el metodo de fusion concreto no se especifica en la model card.

El modelo se publico el 31 de agosto de 2026 bajo licencia Apache 2.0 y, en el momento de redactar esta ficha, no registra descargas ni valoraciones en HuggingFace. Al ser un merge automatico sin evaluaciones publicadas, su rendimiento real no ha sido validado por la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2.5) |
| Parametros totales | 493.789.952 (~0,49 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No especificada en la model card; el modelo base Qwen2.5-0.5B-Instruct soporta 32.768 tokens |
| Tipos de cuantizacion | Q4_K_M, Q6_K, Q8_0 (GGUF) |
| Idiomas soportados | No especificados en la model card; el modelo base Qwen2.5-0.5B es multilingue (29+ idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF cuantizado (safetensors no disponible en el repo) |

## Arquitectura y entrenamiento

El modelo se construye mediante una fusion automatica de Qwen2.5-0.5B-Instruct y Qwen2.5-0.5B, ambas arquitecturas transformer densas con 494 millones de parametros y 32 capas. El pipeline PocketFactory genera el merge sin intervencion manual, aunque la model card no documenta el metodo concreto de fusion (SLERP, TIES, DARE u otro). Tampoco se indica si se realizo entrenamiento o ajuste posterior a la fusion.

Los pesos se publican unicamente en formato GGUF cuantizado, lo que implica que el proceso de cuantizacion (Q4_K_M, Q6_K, Q8_0) forma parte del flujo de generacion del modelo. No se proporciona informacion sobre el dataset de entrenamiento, el numero de tokens empleados ni si se aplicaron tecnicas de RLHF o DPO, ya que al ser un merge no se realizo entrenamiento adicional.

## Capacidades

- Generacion de texto conversacional: hereda las capacidades de instruction following de Qwen2.5-0.5B-Instruct, aunque la fusion con la variante base puede alterar el comportamiento.
- Razonamiento limitado: como modelo de 0,5 B, su capacidad de razonamiento complejo es reducida en comparacion con modelos de mayor tamano.
- Soporte multilingue: el modelo base Qwen2.5-0.5B soporta mas de 29 idiomas, aunque la model card del merge no confirma que esta capacidad se conserve intacta.
- Tool calling: Qwen2.5-0.5B-Instruct soporta function calling, pero no se ha verificado que el merge preserve esta funcionalidad.
- Compatibilidad con Ollama y LM Studio: el formato GGUF permite carga directa con estos runtime.
- Sin capacidades de vision ni audio: el modelo es exclusivamente de texto.

## Casos de uso

- Asistente conversacional en dispositivos edge: el modelo puede desplegarse en portatiles con GPU de 6-8 GB de VRAM o incluso en CPU, gracias a su tamano de 0,5 B y cuantizacion Q4_K_M, que ocupa aproximadamente 0,3 GB. Adecuado para chatbots locales sin conexion a internet.
- Prototipado rapido de aplicaciones LLM: por su formato GGUF y compatibilidad con Ollama, permite validar flujos de generacion de texto en entornos de desarrollo con recursos limitados antes de escalar a modelos mayores.
- Clasificacion de texto y analisis de sentimiento: tareas de clasificacion sobre textos cortos pueden ejecutarse con latencia baja en hardware modesto, aprovechando la capacidad de instruction following del modelo base instruct.
- Resumen de documentos breves: el contexto de 32K tokens del modelo base permite procesar documentos de hasta aproximadamente 24.000 palabras, aunque la calidad del resumen sera limitada por el tamano del modelo.
- Educacion e investigacion sobre cuantizacion: al estar disponible en tres niveles de cuantizacion (Q4_K_M, Q6_K, Q8_0), permite estudiar el impacto de la cuantizacion en la calidad de salida con un modelo pequeño y de bajo coste computacional.
- Generacion de codigo basico: el modelo base Qwen2.5-0.5B-Instruct tiene capacidades de generacion de codigo limitadas, utiles para autocompletado simple o generacion de fragmentos cortos en entornos sin acceso a modelos mayores.
- Evaluacion de pipelines de merge: al ser un producto del pipeline PocketFactory, sirve como caso de estudio para comparar el comportamiento de versiones base e instruct fusionadas frente a los modelos originales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye puntuaciones de MMLU, HumanEval, GSM8K ni ninguna otra evaluacion estandar. Ademas, el modelo registra cero descargas en HuggingFace, por lo que no existen evaluaciones independientes de la comunidad.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 0,3 GB (Q4_K_M) y 0,5 GB (Q8_0) para los pesos del modelo; con overhead de runtime, cabe en cualquier GPU con 2 GB o mas de VRAM.
- GPU recomendadas: cualquier GPU de consumo con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.) es suficiente. Tambien puede ejecutarse exclusivamente en CPU con latencias aceptables para un modelo de este tamano.
- Compatibilidad con consumer GPU: si, es un modelo disenado especificamente para hardware de gama baja y dispositivos edge.
- Opciones de despliegue: Ollama (comando documentado en la model card), LM Studio, llama.cpp, y cualquier runtime compatible con GGUF.
- Latencia y throughput: no hay datos publicados, pero para un modelo de 0,5 B cuantizado, se puede esperar una generacion de 20-50 tokens por segundo en GPU consumer y 5-15 tokens por segundo en CPU moderna.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Rendimiento |
|---|---|---|---|---|---|
| AutoMerge-090196bc | 494 M | No especificado (base: 32K) | Apache 2.0 | GGUF | Sin benchmarks |
| Qwen2.5-0.5B-Instruct | 494 M | 32K | Apache 2.0 | Safetensors, GGUF | Benchmarks publicados por Alibaba |
| SmolLM2-360M-Instruct | 360 M | 8K | Apache 2.0 | Safetensors, GGUF | Benchmarks publicados por HuggingFace |

La principal diferencia frente a sus alternativas es que AutoMerge-090196bc es un merge automatico sin validacion publica, mientras que Qwen2.5-0.5B-Instruct y SmolLM2-360M-Instruct son modelos con entrenamiento completo y evaluaciones documentadas. El unico valor anadido del merge es la disponibilidad inmediata en GGUF optimizado, aunque el modelo base Qwen2.5-0.5B-Instruct tambien tiene conversiones GGUF comunitarias.

## Limitaciones y advertencias

- Sin validacion independiente: el modelo tiene cero descargas y cero evaluaciones publicas; su calidad real es desconocida.
- Merge automatico sin documentacion: no se especifica el metodo de fusion ni si se realizaron pruebas de calidad posteriores.
- Capacidades limitadas por tamano: 0,5 B de parametros limita significativamente el razonamiento complejo, la generacion de codigo avanzado y la comprension de contextos extensos.
- Riesgo de alucinacion: como todos los modelos de lenguaje pequeños, la tasa de alucinacion es alta en tareas que requieren conocimiento factual o razonamiento de multiples pasos.
- Idiomas no confirmados: aunque el modelo base es multilingue, la model card no confirma que el merge conserve las mismas capacidades linguisticas.
- Sin garantia de tool calling: la funcionalidad de function calling del modelo base instruct puede haberse degradado durante la fusion.
- Licencia Apache 2.0: permite uso comercial sin restricciones significativas, pero el modelo no ofrece garantias de calidad o idoneidad para produccion.
- Posible obsolescencia: al ser un artefacto automatico generado por un pipeline, no hay garantia de mantenimiento o actualizaciones futuras.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PocketWeights/AutoMerge-090196bc
- Perfil de PocketWeights: https://huggingface.co/PocketWeights
- Modelo base Qwen2.5-0.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Modelo base Qwen2.5-0.5B: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio del pipeline AutoMerge (referencia de la herramienta de merge): https://github.com/AutoMerge-model-reuse/AutoMerge/tree/main/mergekit

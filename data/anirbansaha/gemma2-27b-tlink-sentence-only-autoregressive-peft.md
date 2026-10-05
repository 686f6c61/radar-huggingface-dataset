# AnirbanSaha/gemma2-27b-tlink-sentence-only-autoregressive-peft

## Resumen

El modelo `AnirbanSaha/gemma2-27b-tlink-sentence-only-autoregressive-peft` es un adaptador LoRA (PEFT) entrenado sobre el modelo base `google/gemma-2-27b-it` para la tarea de clasificacion de relaciones temporales entre eventos, conocida como TLINK (temporal link). No es un modelo generativo de proposito general ni una copia fusionada del modelo de 27 000 millones de parametros: el repositorio contiene unicamente los pesos del adaptador (0,5 GB), que deben cargarse en memoria junto con el modelo base mediante `PeftModel.from_pretrained(...)`.

El adaptador clasifica el par de eventos de una frase en una de cuatro etiquetas: `BEFORE`, `AFTER`, `OTHER` y `NONE`. Se entreno en una sola epoca sobre el dataset `AnirbanSaha/tlink-classification-sentence-only`, con variante de entrada a nivel de frase, en precision bfloat16 y sin cuantizacion. La configuracion LoRA emplea rango 16, alpha 32, dropout 0,05 y aplica adaptadores a los siete modulos de proyeccion del transformer (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`).

Su relevancia es acotada pero clara: permite reproducir y reutilizar un fine-tuning de bajo coste sobre un modelo de 27B en una tarea de extraccion de estructura temporal, sin necesidad de redistribuir ni volver a entrenar el modelo base completo. El repositorio es muy reciente (creado el 2026-10-05 segun los metadatos de HuggingFace), acumula 6 descargas y 0 likes, y no incluye resultados de evaluacion publicados, por lo que debe considerarse un artefacto de investigacion sin validacion externa documentada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de `google/gemma-2-27b-it`); adaptador LoRA con pipeline autoregresivo de clasificacion |
| Parametros totales | 27 000 millones en el modelo base; el adaptador LoRA ocupa 0,5 GB en el repositorio |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 4096 tokens en entrenamiento (`max_length`); la model card no especifica el contexto de inferencia |
| Tipos de cuantizacion | No se aplico cuantizacion en el entrenamiento (BF16); no se documentan cuantizaciones soportadas para inferencia |
| Idiomas soportados | No disponible |
| Licencia | No disponible (el modelo base `google/gemma-2-27b-it` se distribuye bajo los terminos de uso de Gemma) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA), cargable con la libreria `peft` |

## Arquitectura y entrenamiento

El adaptador se apoya en un transformer autoregresivo (`architecture: autoregressive`) y reformula la clasificacion de relaciones temporales como una tarea de generacion: el modelo recibe una frase y genera una de las cuatro etiquetas definidas en `label2id` (`BEFORE` = 0, `AFTER` = 1, `OTHER` = 2, `NONE` = 3). La variante de entrada es `sentence`, es decir, la clasificacion se realiza sobre la frase y no sobre pares de frases o documentos completos. El entrenamiento se ejecuto en bfloat16 sin cuantizacion, con una sola epoca, tasa de aprendizaje 1e-4, weight decay 0,01, semilla 42 y 223 pasos de warmup.

La configuracion LoRA aplica rango 16, alpha 32 y dropout 0,05 sobre los modulos `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`, lo que cubre atencion y MLP. No hay modulos adicionales que guardar (`modules_to_save: []`). El entrenamiento distribuido se hizo con `world_size` 2, micro-batch 1 por GPU y 4 pasos de acumulacion de gradiente, resultando en un batch global efectivo de 8. No se documenta el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF, DPO u otras tecnicas de alineacion posteriores. Tampoco se describe ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Clasificacion de relaciones temporales entre eventos en una frase, con cuatro etiquetas: `BEFORE`, `AFTER`, `OTHER` y `NONE`.
- Procesamiento de entradas de hasta 4096 tokens durante el entrenamiento, adecuado para frases y parrafos largos.
- Clasificacion mediante generacion autoregresiva de la etiqueta, en lugar de una cabeza de clasificacion dedicada.
- Capacidades generativas generales heredadas del modelo base (`gemma-2-27b-it`), no evaluadas ni documentadas especificamente en este repositorio.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: no disponibles (no documentadas).
- Capacidades especiales (modo thinking, vision, audio): no disponibles (no documentadas).

## Casos de uso

- Anotacion de lineas temporales en textos clinicos: dado un fragmento de historia clinica con varios eventos medicos, el adaptador puede etiquetar si un evento ocurre antes o despues de otro, apoyando la construccion de cronologias de paciente a partir de notas en texto libre.
- Analisis de narrativas periodisticas: en un parrafo que describe varios sucesos, el modelo permite establecer el orden relativo de los eventos para alimentar sistemas de resumen cronologico o de seguimiento de noticias.
- Construccion de grafos de conocimiento temporal: las etiquetas `BEFORE`/`AFTER` generadas sobre frases pueden convertirse en aristas dirigidas de un grafo de eventos, utiles en pipelines de extraccion de informacion.
- Resolucion de preguntas temporales: en un sistema de QA sobre documentos, el modelo ayuda a determinar el orden de dos eventos mencionados en la misma frase, un paso necesario para responder preguntas del tipo "que ocurrio primero".
- Analisis de documentacion legal y contractual: identificacion del orden de obligaciones, plazos o hitos descritos en una misma clausula, como apoyo a la revision automatizada de contratos.
- Enriquecimiento de resumenes automaticos: ordenar eventos extraidos de un documento antes de generar un resumen lineal, evitando resumenes con secuencias temporales incoherentes.
- Investigacion en procesamiento de lenguaje natural temporal: el adaptador sirve como punto de partida reproducible para experimentos de TLINK sobre un backbone de 27B, o como referencia para comparar con arquitecturas encoder-only.
- Preprocesado en analisis financiero: ordenar hitos corporativos (anuncios, resultados, fusiones) citados en un mismo texto para alimentar paneles de seguimiento de eventos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye metricas de evaluacion (ni exactitud, ni F1, ni comparaciones con otros sistemas) sobre el dataset TLINK ni sobre ningun otro conjunto de prueba.

## Requisitos de hardware

- El adaptador en si ocupa 0,5 GB, pero la inferencia requiere cargar el modelo base `google/gemma-2-27b-it` completo.
- VRAM estimada en BF16 (sin cuantizar, con contexto moderado): en torno a 54-60 GB para los pesos mas cache KV y activaciones; requiere GPU de 80 GB como A100 80GB, H100 80GB o MI300X.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 28-32 GB, viable en A100 40GB, L40S 48GB o RTX A6000 48GB.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 15-18 GB, lo que permite ejecucion en GPU de consumo como RTX 4090 (24 GB), RTX 3090 (24 GB) o RTX 4080 (16 GB, con margen ajustado).
- El entrenamiento documentado uso 2 procesos (`world_size` 2) con micro-batch 1 y BF16 sin cuantizar, lo que implica al menos 2 GPU de gran capacidad de memoria (previsiblemente A100 80GB o equivalentes).
- Opciones de despliegue: la carga del adaptador esta pensada para la libreria `peft` junto con `transformers`; el uso de vLLM, TGI, llama.cpp u Ollama con adaptadores LoRA es posible en el caso de vLLM y TGI, pero no esta documentado en la model card. No hay pesos GGUF publicados, por lo que llama.cpp y Ollama requeririan fusionar el adaptador con el modelo base y convertir el resultado.
- Latencia y throughput estimados: no disponibles (no documentados).

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye resultados de benchmarks ni datos de rendimiento que permitan comparar este adaptador con alternativas de la misma categoria (por ejemplo, fine-tuning completo del mismo modelo base, adaptadores PEFT sobre otros backbones o clasificadores encoder-only como los basados en BERT). La unica comparacion documentada en el repositorio es implicita: frente a una copia fusionada del modelo de 27B, este adaptador reduce el artefacto distribuido a 0,5 GB, a costa de requerir la descarga y carga separada del modelo base.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma2-27b-tlink-sentence-only-autoregressive-peft | 27B (base) + adaptador LoRA r=16 | 4096 tokens en entrenamiento | No disponible | No disponible | HuggingFace, 6 descargas |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- No hay resultados de evaluacion publicados: se desconoce la exactitud, la F1 por clase y el comportamiento del adaptador en datos fuera de distribucion.
- La tarea esta restringida a relaciones temporales entre eventos dentro de una misma frase (variante `sentence`); no cubre relaciones entre frases ni a nivel de documento.
- Solo se entreno durante una epoca, lo que puede implicar infraentrenamiento o infraajuste del adaptador segun el tamano efectivo del dataset.
- La etiqueta `OTHER` y la etiqueta `NONE` pueden confundirse con facilidad en dominios con anotacion ambigua; no se documenta el esquema de anotacion del dataset.
- Al ser un modelo generativo que emite la etiqueta como texto, existe riesgo de que la salida no coincida exactamente con una de las cuatro etiquetas validas, especialmente fuera del formato visto en entrenamiento.
- Riesgo de alucinacion en generacion libre: aunque el uso previsto es la clasificacion, el modelo base subyacente puede producir texto no deseado si se le invoca fuera de la tarea.
- Sesgos conocidos: no disponibles. No se documenta ninguna evaluacion de sesgo, toxicidad o equidad, ni del modelo base ni del adaptador.
- Idiomas: no disponibles. No se especifica en que idioma se entreno el dataset, por lo que el comportamiento multilingue es incierto.
- Licencia del adaptador: no disponible. El uso comercial queda condicionado como minimo por los terminos de uso de Gemma aplicables al modelo base, que el usuario debe revisar por separado.
- Para produccion, el repositorio no ofrece garantias de mantenimiento: 0 likes, 6 descargas y sin pipeline declarado en HuggingFace.
- El adaptador no esta fusionado con el modelo base, por lo que cualquier despliegue debe gestionar dos artefactos y verificar la compatibilidad de versiones entre `peft`, `transformers` y el modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AnirbanSaha/gemma2-27b-tlink-sentence-only-autoregressive-peft
- Modelo base: https://huggingface.co/google/gemma-2-27b-it
- Dataset de entrenamiento referenciado en los metadatos: https://huggingface.co/datasets/AnirbanSaha/tlink-classification-sentence-only
- Libreria PEFT: https://github.com/huggingface/peft
- Paper, blog o demo adicionales: no disponible. La busqueda web realizada no devolvio resultados relevantes sobre este modelo ni sobre la tarea TLINK; los resultados obtenidos no guardan relacion con el contenido de esta ficha y se han descartado.

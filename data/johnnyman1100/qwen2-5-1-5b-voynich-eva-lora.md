# Johnnyman1100/qwen2.5-1.5b-voynich-eva-lora

## Resumen

`Johnnyman1100/qwen2.5-1.5b-voynich-eva-lora` es un adaptador LoRA publicado por el usuario Johnnyman1100 sobre el modelo base Qwen/Qwen2.5-1.5B-Instruct. El adaptador se entrena de forma no supervisada, con prediccion causal de siguiente token, sobre la transcripcion EVA del manuscrito Voynich en su version Zandbergen-Landini "ZL" 3b IVTFF, usando el tokenizador original de Qwen. Se trata de un experimento de modelado estadistico de un corpus con ortografia desconocida, no de un modelo de traduccion.

La relevancia del repositorio es metodologica mas que de producto: incluye el codigo de entrenamiento, generacion, controles, lineas base y analisis, y publica resultados negativos de forma explicita. El propio autor documenta que el adaptador no traduce el manuscrito y que sus "traducciones" al ingles son confabulacion guiada por el prompt, independiente del pasaje de entrada. La unica senal real medida es la mejora de perplejidad sobre EVA retenido: 22,32 frente a 133,42 del Qwen base.

El artefacto es pequeno (repositorio de 0,1 GB, solo pesos del adaptador LoRA) y se entreno en una sola GPU RTX 3070 de 8 GB en bf16, lo que lo convierte en un caso reproducible de ajuste fino de bajo coste. No hay pipeline declarado, no se publican idiomas soportados y las descargas registradas son cero, con un unico "like".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder Qwen2 denso; r=16, alpha=32, dropout=0,05, aplicado a todas las proyecciones de atencion y MLP |
| Parametros totales | Modelo base Qwen2.5-1.5B-Instruct (orden de 1,5 mil millones); el adaptador ocupa aproximadamente 0,1 GB en el repositorio |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No especificada para el adaptador; el modelo base Qwen2.5-1.5B-Instruct soporta 32.768 tokens. El entrenamiento uso seq len de 256 tokens |
| Tipos de cuantizacion | No disponible (solo se publican pesos del adaptador en safetensors; no se distribuyen GGUF ni otras cuantizaciones) |
| Idiomas soportados | No disponible. El corpus de entrenamiento es transcripcion EVA del Voynich, no una lengua natural; el modelo base es multilingue |
| Licencia | MIT (adaptador, scripts, resultados y material narrativo). Modelo base: Apache-2.0. Texto fuente: no redistribuido, obra de Rene Zandbergen y Gabriel Landini |
| Formato de pesos | safetensors (`adapter_model.safetensors` + `adapter_config.json`), libreria PEFT. Incluye `tokenizer.json`, `tokenizer_config.json` y `chat_template.jinja` copiados de Qwen |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-1.5B-Instruct, un transformer decoder denso, mediante LoRA con rango 16, alpha 32 y dropout 0,05, cubriendo todas las proyecciones de atencion y de MLP. El entrenamiento es no supervisado con objetivo de prediccion causal del siguiente token, usando el tokenizador propio de Qwen sobre la transcripcion EVA (Zandbergen-Landini, version ZL 3b IVTFF). Se realizaron 3 epocas, 237 pasos de optimizador, con secuencias de 256 tokens en bf16, sobre 181 de los 226 folios; los 45 folios restantes se reservaron para validacion, garantizando que ninguna linea de varias palabras aparece en ambos conjuntos. El split es determinista (`split_folios(folios, 0.2, seed=42)`) y los identificadores de los folios retenidos se listan en `results/run_metrics.json`. El entrenamiento se ejecuto en una unica RTX 3070 de 8 GB con PEFT 0.18.1, Transformers 5.0.0 y Torch 2.7.1.

La innovacion destacable no es arquitectonica sino evaluativa: el repositorio incorpora un conjuro de controles que compara la generacion con pasajes reales frente a palabras desordenadas, gibberish con frecuencia equiparada y ausencia total de pasaje. El resultado medido es que el texto generado es estadisticamente identico con palabras desordenadas o con gibberish, y que las "respuestas" en pseudo-voyniches aparecen en un 36-45% de los casos ante cualquier entrada tipo ensalada de letras. Solo eliminar el pasaje cambia la distribucion de salida. Ademas, la perplejidad EVA retenida (22,32) y la tasa de nats por caracter (1,31) superan a la linea base de bigramas de palabras interpolada (1,66) y al Qwen base (2,07 nats/char, 133,42 de perplejidad), lo que indica que el adaptador captura estadistica real de EVA mas alla de la adyacencia de palabras.

## Capacidades

- Modelado estadistico de secuencias EVA: el adaptador aprende la distribucion de la transcripcion ZL 3b del Voynich con una perplejidad retenida de 22,32, frente a 133,42 del modelo base.
- Generacion de pseudo-voyniches: produce texto con la apariencia superficial del corpus, con una tasa de "eco" del 36-45% ante entradas arbitrarias.
- Capacidades heredadas del Qwen2.5-1.5B-Instruct: generacion de texto, razonamiento basico, codigo y matematicas elementales propias de un modelo de 1,5B, segun lo que permita la adaptacion LoRA.
- No traduce el manuscrito Voynich: la propia model card establece que las "traducciones" son confabulacion inducida por el prompt.
- Soporte de tool calling y function calling: no evaluado ni documentado para el adaptador; el modelo base Qwen2.5-1.5B-Instruct si lo soporta.
- Capacidades de agente y razonamiento multi-paso: no documentadas para el adaptador.
- Capacidades multilingues: no documentadas; el corpus de entrenamiento no es una lengua natural.
- Capacidad instrumental destacable: el harness de `scripts/` esta disenado para reutilizarse y testear otras hipotesis con la misma metodologia de controles.

## Casos de uso

- Investigacion en estilometria y linguistica computacional: el adaptador sirve como modelo nulo cuantificado de la estadistica de EVA, con perplejidad y nats por caracter medidos frente a bigramas y frente al modelo base, para comparar hipotesis sobre la estructura del manuscrito.
- Metodologia de evaluacion de adaptadores LoRA: el repositorio incluye controles de palabras desordenadas, gibberish con frecuencia equiparada y ausencia de pasaje, reutilizables para detectar confabulacion en cualquier otro ajuste fino sobre corpus opacos.
- Ensayo de reproducibilidad en hardware de consumo: al entrenarse en una RTX 3070 de 8 GB con PEFT, sirve como plantilla verificable de fine-tuning a bajo coste con splits deterministas y semillas por folio.
- Generacion de material literario experimental: el directorio `story/` contiene *The Scattered Leaves*, una obra compuesta a partir de las salidas especulativas del adaptador y una edicion de lectura de los 226 folios, declarada explicitamente como ficcion.
- Pruebas de robustez de tokenizadores sobre corpus no naturales: permite medir cuanta estructura aprende un tokenizador BPE entrenado en lenguas naturales cuando se le alimenta con una ortografia desconocida.
- Docencia en NLP: el caso ilustra con numeros concretos la diferencia entre ajuste por perplejidad y comprension semantica, y como disenar controles que distingan ambas.
- Analisis de sesgo de confirmacion en interpretacion de manuscritos: los resultados documentan que las salidas en ingles dependen del prompt y no del contenido del pasaje, util como advertencia metodologica en proyectos de descifrado.

## Benchmarks y rendimiento

| Metrica | Adaptador | Modelo base Qwen2.5-1.5B-Instruct | Bigramas de palabras interpolado |
|---|---|---|---|
| Perplejidad EVA en folios retenidos | 22,32 | 133,42 | No aplica |
| Nats por caracter | 1,31 | 2,07 | 1,66 |
| Tasa de "eco" en pseudo-voyniches ante ensalada de letras | 36-45% | No disponible | No disponible |
| Diferencia real vs palabras desordenadas o gibberish | Estadisticamente identica | No disponible | No disponible |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K ni similares) en la informacion disponible.

## Requisitos de hardware

- VRAM de inferencia: adaptador despreciable (0,1 GB) sumado a los pesos del modelo base Qwen2.5-1.5B-Instruct, en torno a 3 GB en bf16/fp16 y aproximadamente 1 GB en cuantizacion de 4 bits (estimacion a partir del tamano del modelo base).
- GPU utilizadas en el desarrollo: una unica RTX 3070 de 8 GB para el entrenamiento completo (3 epocas, 237 pasos, bf16).
- GPU compatibles en produccion: cualquier GPU con al menos 4-8 GB de VRAM; A100, H100, L40S o RTX 4090 funcionan sobradamente para un modelo de este tamano.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB, RTX 3070 8 GB, RTX 4060 Ti, RTX 4090 y equivalentes. Tambien es viable en CPU con cuantizacion de 4 bits.
- Opciones de despliegue: transformers + peft segun el ejemplo de la model card; vLLM admitiendo adaptadores LoRA; llama.cpp u Ollama tras fusionar el adaptador con el modelo base y convertir a GGUF (la conversion no esta publicada en el repositorio).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento en EVA | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| qwen2.5-1.5b-voynich-eva-lora | Adaptador LoRA sobre Qwen2.5-1.5B-Instruct | ~1,5B en el base; adaptador de 0,1 GB | No especificado (base: 32.768) | Perplejidad 22,32; 1,31 nats/char | MIT (adaptador) | HuggingFace, 0 descargas, 1 like |
| Qwen/Qwen2.5-1.5B-Instruct | Transformer decoder denso | ~1,5B | 32.768 tokens | Perplejidad 133,42; 2,07 nats/char | Apache-2.0 | HuggingFace, ampliamente distribuido |
| Linea base de bigramas de palabras interpolada | Modelo estadistico n-grama | No aplica | No aplica | 1,66 nats/char | Depende de la implementacion del repositorio | Local, incluida en `scripts/` |

No se dispone de informacion sobre otros adaptadores o modelos orientados especificamente al corpus Voynich con los que comparar directamente.

## Limitaciones y advertencias

- No traduce el manuscrito Voynich. La model card lo declara como resultado medido, no como aviso generico: las salidas en ingles son confabulacion dependiente del prompt e independiente del contenido del pasaje.
- Las generaciones no distinguen entre pasaje real, palabras desordenadas y gibberish con frecuencia equiparada; las tasas medidas son estadisticamente identicas.
- Riesgo alto de alucinacion interpretativa: cualquier uso de las salidas como evidencia sobre el contenido, la lengua o la procedencia del manuscrito es metodologicamente invalido, tal como advierte el propio autor.
- Sesgos conocidos: no documentados mas alla del comportamiento anterior; el corpus de entrenamiento es un unico manuscrito con ortografia desconocida.
- Limitaciones de contexto: el entrenamiento uso secuencias de 256 tokens; no hay evaluacion de comportamiento con contextos largos pese a que el modelo base admite 32.768.
- Limitaciones de idioma: no se documentan idiomas soportados; el adaptador no fue entrenado sobre ninguna lengua natural.
- Restricciones de licencia: el adaptador es MIT y permite uso comercial, pero el modelo base es Apache-2.0 y debe cumplirse tambien esa licencia. El texto fuente (transcripcion ZL EVA 3b IVTFF) no se redistribuye y pertenece a sus autores originales.
- Caveat de reproducibilidad en produccion: los scripts asumen una estructura de directorios de trabajo y rutas locales que no existen al clonar el repositorio; hay que pasar rutas explicitas. Ademas, los campos `source`, `base_model` y `adapter` de los JSONL apuntan a rutas locales originales y son solo informativos.
- Sin traccion de comunidad: cero descargas y un like en el momento de la consulta, sin pipeline declarado ni garantia de mantenimiento.
- Fecha de creacion registrada del 4 de octubre de 2026, posterior a la fecha habitual de publicacion; conviene verificar la vigencia del repositorio antes de depender de el.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Johnnyman1100/qwen2.5-1.5b-voynich-eva-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Transcripcion ZL EVA 3b IVTFF (Zandbergen y Landini): http://www.voynich.nu/transcr.html
- La busqueda web realizada no devolvio resultados relevantes: los unicos enlaces recuperados fueron traductores genericos (Google Translate, DeepL, Reverso) sin relacion con el modelo.

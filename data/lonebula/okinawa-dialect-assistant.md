# LoNebula/okinawa-dialect-assistant

## Resumen

El Okinawa Dialect Assistant es un ajuste fino mediante LoRA sobre Qwen2.5-0.5B-Instruct, desarrollado por el usuario LoNebula, cuyo objetivo es mapear prompts cortos en japones a la forma lexica correspondiente del dialecto de Shuri (okinawense). No es un modelo conversacional fluido en okinawense: se presenta explicitamente como un prototipo experimental de ayuda a la traduccion lexica, equivalente a un diccionario interactivo. El repositorio contiene los pesos ya fusionados con el adaptador LoRA (rango 8, tres epocas), por lo que se carga directamente con Transformers sin necesidad de `peft`.

El modelo cuenta con 494.032.768 parametros totales y hereda la arquitectura transformer decoder-only de la familia Qwen2, con el contexto nativo de su modelo base. Su relevancia es acotada pero clara: las lenguas ryukyuenses estan en peligro y disponen de pocos recursos digitales; este modelo demuestra que es posible construir herramientas de consulta lexica funcionales con un presupuesto de computo minimo (menos de 500 millones de parametros), ejecutables incluso en CPU.

El entrenamiento se realizo sobre 9.031 entradas de diccionario filtradas, derivadas del corpus `doraking/ryukyuan-okinawan-corpus` y atribuidas al diccionario *Okinawa-go Jiten* del NINJAL bajo licencia CC BY 4.0. El modelo se publica bajo Apache-2.0, sin cuantizaciones alternativas y sin resultados de benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), ajustado con LoRA y pesos fusionados |
| Parametros totales | 494.032.768 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (contexto nativo de Qwen2.5-0.5B-Instruct; la model card no declara modificaciones) |
| Tipos de cuantizacion | No disponible (solo se publican pesos en safetensors; el tamano del repositorio, 2,0 GB, es consistente con FP32 para 494 M de parametros) |
| Idiomas soportados | Japones (ja) y okinawense de Shuri (ryu) |
| Licencia | Apache-2.0 (modelo); el dataset de entrenamiento es CC BY 4.0 |
| Formato de pesos | safetensors (pesos fusionados, sin adaptador separado) |
| Tamano del repositorio | 2,0 GB |
| Libreria | transformers |
| Pipeline | text-generation |
| Modelo base | Qwen/Qwen2.5-0.5B-Instruct |
| Metodo de ajuste | LoRA, rango 8, 3 epocas |
| Fecha de publicacion | 11 de octubre de 2026 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen2.5-0.5B-Instruct: un transformer decoder-only con normalizacion RMSNorm, activacion SwiGLU, embeddings RoPE y atencion con query-key normalization. El ajuste fino no modifica la topologia de la red; se aplico LoRA de rango 8 durante tres epocas y posteriormente se fusionaron los pesos del adaptador en el modelo base, de modo que la carga se realiza con `AutoModelForCausalLM` estandar. El autor indica que esta decision busca facilitar el despliegue en proveedores de inferencia alojada compatibles con Transformers.

Los datos de entrenamiento proceden del dataset `LoNebula/okinawa-ja-shuri-dictionary-translation`, un derivado filtrado y atribuido del corpus `doraking/ryukyuan-okinawan-corpus`. Se utilizaron 9.031 entradas de diccionario, divididas en un 90/10 con semilla 42 para entrenamiento y validacion. Es importante subrayar que el dataset contiene entradas lexicas, no pares de frases conversacionales paralelas: el modelo aprende una correspondencia terminologica japones-okinawense de Shuri, no una capacidad de traduccion oracional. Ademas, el corpus fuente transcribe el okinawense con romanizacion y simbolos especializados, por lo que las salidas deben interpretarse como notacion de diccionario y no como ortografia kana estandar.

## Capacidades

- Traduccion lexica de terminos japoneses cortos a la forma de diccionario en okinawense de Shuri.
- Generacion de texto breve en formato conversacional mediante `apply_chat_template`, con soporte de mensaje de sistema para fijar la tarea.
- Respuesta a prompts de una sola consulta o de pocos turnos centrados en vocabulario, no en dialogo abierto.
- Soporte de decodificacion determinista (`do_sample=False`) para obtener una unica forma lexica, util en consultas de diccionario.
- Compatibilidad con text-generation-inference y con proveedores de inferencia alojada (etiqueta `endpoints_compatible`).
- Capacidad multilingue limitada al par japones-okinawense de Shuri; no cubre otras variedades ryukyuenses ni otros idiomas de forma fiable.
- Carga directa con Transformers sin dependencia de `peft` gracias a la fusion de pesos.
- No incluye vision, audio, sintesis de voz, tool calling ni razonamiento multi-paso.

## Casos de uso

- Aplicacion de aprendizaje de okinawense: el modelo actua como capa de consulta lexica detras de una interfaz de tarjetas o fichas, devolviendo la forma de diccionario de Shuri para una palabra japonesa introducida por el usuario. Su tamano permite ejecutarlo en el dispositivo sin coste de API.
- Herramienta de asistencia a linguistas e investigadores: consulta rapida de correspondencias lexicas durante la anotacion de corpus, con salida que puede compararse contra el diccionario del NINJAL para validacion manual.
- Preservacion digital de patrimonio linguistico: prototipo de diccionario interactivo offline para comunidades de Okinawa, desplegable en hardware modesto (incluso sin GPU) y sin dependencia de servicios en la nube.
- Preanotacion de corpus: generacion de candidatos de traduccion lexica que un hablante fluido revisa despues, reduciendo el trabajo manual en proyectos de digitalizacion de vocabulario ryukyuense.
- Filtrado y enriquecimiento de textos japoneses: identificar terminos para los que existe una forma documentada en Shuri y etiquetarlos en un pipeline de NLP mayor.
- Demostracion educativa en contextos culturales: chatbot monografico sobre vocabulario de Shuri en museos, centros culturales o aulas, con mensaje de sistema que acote la tarea a consultas lexicas.
- Integracion en pipelines con TGI o endpoints compatibles: su bajo consumo de VRAM permite servirlo junto a modelos mayores en la misma GPU como servicio auxiliar de traduccion lexica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que se utilizo una perdida sobre el conjunto de validacion reservado (10 % de las entradas de diccionario), pero no se publica su valor numerico ni se proporcionan metricas de calidad de traduccion oracional tipo BLEU, chrF o COMET. Tampoco hay comparaciones con otros adaptadores de okinawense.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en FP16, 2 GB en FP32, 0,5 GB en INT8 y 0,3 GB en INT4 (estimaciones derivadas de los 494 M de parametros, no cifras publicadas por el autor).
- GPU recomendadas: cualquier GPU con 2 GB o mas de VRAM es suficiente; una RTX 3060, RTX 4060, RTX 4090, A100 o H100 lo ejecutan sin cuello de botella apreciable. La GPU es opcional.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU discreta moderna e incluso en iGPU con memoria compartida suficiente. Tambien es viable en CPU para uso interactivo de baja concurrencia.
- Opciones de despliegue: Transformers (via `AutoModelForCausalLM`), text-generation-inference, proveedores de inferencia alojada compatibles con Transformers y endpoints compatibles. Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, conversion que el autor no publica.
- Latencia y throughput estimados: no disponibles. Dado el tamano del modelo, en GPU la generacion de 48 tokens (valor del ejemplo de la model card) deberia completarse en decenas de milisegundos, pero no hay mediciones publicadas.
- Precaucion practica: parte del repositorio (2,0 GB) sugiere pesos en FP32, lo que duplica el uso de memoria respecto a FP16. Cargar con `torch_dtype=torch.float16` en GPU reduce el consumo a la mitad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LoNebula/okinawa-dialect-assistant | 494 M | 32.768 tokens (heredado del base) | Traduccion lexica japones-shuri | Apache-2.0 (modelo), CC BY 4.0 (dataset) | Pesos safetensors en HuggingFace, 0 descargas |
| Qwen/Qwen2.5-0.5B-Instruct (base) | 494 M | 32.768 tokens | Instrucciones generales, multilingue | Apache-2.0 | Ampliamente disponible |
| Otros adaptadores de okinawense o ryukyuense | No disponible | No disponible | No disponible | No disponible | No se han encontrado en la informacion proporcionada |

No se dispone de alternativas directas de la misma categoria (adaptadores lexicos para variedades ryukyuenses) en la informacion proporcionada, ni de datos de rendimiento comparativo entre este modelo y su base.

## Limitaciones y advertencias

- Cobertura exclusivamente lexica: no se ha establecido la naturalidad a nivel de frase ni la coherencia conversacional.
- La perdida de validacion mide el modelado de entradas de diccionario, no la calidad de traduccion oracional.
- El modelo puede devolver notacion romanizada de diccionario en lugar de kana o habla conversacional; las salidas no deben presentarse como ortografia estandar.
- Riesgo de alucinacion y de seleccion de una entrada lexica inadecuada; el autor recomienda revision por parte de un hablante fluido en usos importantes.
- Solo cubre la variedad de Shuri; otras variedades okinawenses y ryukyuenses quedan fuera del alcance del modelo.
- No incluye audio ni sintesis de voz.
- El modelo esta publicado bajo Apache-2.0 y permite uso comercial, pero el dataset de entrenamiento derivado esta bajo CC BY 4.0 y exige mantener la atribucion al NINJAL y a `doraking/ryukyuan-okinawan-corpus` si se reutiliza o redistribuye.
- Los pesos estan fusionados: no es posible separar el adaptador LoRA del modelo base para reentrenarlo o reutilizarlo con otro base.
- Estado experimental con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion ni de validacion externa.
- No hay datos publicados sobre sesgos, comportamiento multilingual fuera del par ja-ryu, ni estabilidad en contextos largos pese a que el modelo base soporte 32.768 tokens.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LoNebula/okinawa-dialect-assistant
- Modelo base Qwen2.5-0.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/LoNebula/okinawa-ja-shuri-dictionary-translation
- Corpus de origen: https://huggingface.co/datasets/doraking/ryukyuan-okinawan-corpus
- Diccionario fuente (NINJAL, *Okinawa-go Jiten*): https://mmsrv.ninjal.ac.jp/okinawago/
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- Nota: la busqueda web realizada no devolvio ningun resultado relevante para este modelo; los enlaces listados proceden de la informacion de HuggingFace y de la model card.

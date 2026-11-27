# LeVraiCNL/Qwen3.6-35B-A3B-StyleTune-Partial-Abliterated-Uncensored

## Resumen

Qwen3.6-35B-A3B-StyleTune-Partial-Abliterated-Uncensored es una variante experimental del modelo Gryphe/Qwen3.6-35B-A3B-StyleTune, publicada por el usuario LeVraiCNL en Hugging Face. Se trata de un ajuste de estilo sobre una arquitectura Qwen3.5 MoE de 35.107.181.936 parametros totales, a la que se le ha aplicado una ablacion parcial del vector de rechazo (abliteration) siguiendo la metodologia de diferencia de medias de Arditi et al. (2024). El objetivo declarado es reducir la tendencia del modelo a rechazar peticiones sensibles, aunque el autor advierte explicitamente de que el proceso esta incompleto.

La relevancia de esta ficha es doble. Por un lado, documenta un caso practico de abliteration sobre un modelo MoE de gran tamano, donde la intervencion se limita a las proyecciones de atencion (`o_proj`/`out_proj`) y al experto compartido (`shared_expert.down_proj`), dejando intactos los 256 expertos MoE por capa. Por otro, sirve de advertencia: pese al sufijo "Uncensored" en el nombre, el propio autor indica que el modelo sigue rechazando gran parte de las peticiones sensibles, por lo que no debe tratarse como una version verdaderamente sin censura.

El modelo se distribuye en formato safetensors con un tamano de repositorio de 70,2 GB, licencia Apache 2.0 y etiquetas que lo marcan como experimental. No se han publicado resultados de benchmarks ni detalles sobre el dataset de entrenamiento del modelo base en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 MoE (tag `qwen3_5_moe`), transformer con mezcla de expertos |
| Parametros totales | 35.107.181.936 |
| Parametros activos | no disponible (A3B sugiere ~3B activos, no confirmado en la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo solo en safetensors; sin GGUF publicado) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura de mezcla de expertos (MoE) de la familia Qwen3.5, segun la etiqueta `qwen3_5_moe` y la referencia del autor a "256 expertos MoE por capa". El modelo derivado conserva la arquitectura intacta y solo modifica un subconjunto de matrices de pesos mediante ortogonalizacion respecto a una direccion de rechazo calculada. La intervencion afecta a 80 matrices: 40 correspondientes a proyecciones de atencion (`o_proj`/`out_proj`) y 40 al experto compartido (`shared_expert.down_proj`). Los 256 expertos MoE de cada capa no se han modificado.

La direccion de rechazo se estimo por diferencia de medias entre 192 prompts nocivos del dataset `LLM-LAT/harmful-dataset` y 192 instrucciones benignas de `tatsu-lab/alpaca`. La capa seleccionada fue `model.language_model.layers.39`, con una norma del vector de rechazo de aproximadamente 2,84. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset del modelo base ni sobre si hubo RLHF, DPO u otras fases de alineamiento en el StyleTune original.

## Capacidades

- Generacion de texto y razonamiento general, heredadas del modelo base Qwen3.6-35B-A3B-StyleTune.
- Ajuste de estilo literario o narrativo, segun el sufijo "StyleTune" del modelo base (no se detalla la naturaleza exacta del ajuste en la informacion disponible).
- Capacidad de rechazo parcialmente reducida: el modelo sigue negandose a muchas peticiones sensibles porque los expertos MoE no han sido ablacionados.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible.
- Capacidades especiales (thinking mode, vision, audio): no disponible.

## Casos de uso

- Investigacion sobre abliteration: el modelo sirve como caso de estudio controlado para medir el efecto de ablacionar solo atencion y experto compartido frente a ablacionar todos los expertos, comparando tasas de rechazo y degradacion de calidad.
- Evaluacion de robustez de alineamiento: util para probar hasta que punto la alineacion de seguridad de un MoE reside en los expertos enrutados frente a las capas de atencion.
- Generacion creativa con estilo: si el StyleTune del modelo base esta orientado a prosa literaria, puede emplearse para redaccion narrativa o dialogos, aunque sin garantias documentadas.
- Baseline para comparativas de seguridad: al ser una ablacion parcial, permite comparar contra la version completa (anunciada como `LeVraiCNL/Qwen3.6-35B-A3B-StyleTune-Abliterated-Uncensored`) y contra el modelo base sin modificar.
- Pruebas de pipelines de inferencia MoE: con 35B parametros totales y pesos en safetensors, sirve para validar despliegues con vLLM o TGI en configuraciones de precision completa o cuantizacion propia.
- Docencia y divulgacion tecnica: ejemplo practico de como se calcula una direccion de rechazo y se aplica ortogonalizacion selectiva sobre un modelo grande.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 70 GB solo para pesos, mas cache KV y overhead, lo que exige al menos 80 GB en configuracion ajustada.
- VRAM estimada en cuantizacion 8 bits: en torno a 35-40 GB, viable en una A100 40GB o H100.
- VRAM estimada en cuantizacion 4 bits: en torno a 18-22 GB, potencialmente viable en RTX 4090 (24 GB) o RTX 3090, aunque no se han publicado pesos GGUF en el repositorio.
- GPU recomendadas: A100 80GB, H100 80GB para precision completa; A100 40GB o H100 para 8 bits; RTX 4090/3090 para cuantizaciones agresivas.
- Opciones de despliegue: vLLM y TGI para safetensors; llama.cpp u Ollama requeririan conversion previa a GGUF, no disponible en el repo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Estado |
|---|---|---|---|---|
| LeVraiCNL/Qwen3.6-35B-A3B-StyleTune-Partial-Abliterated-Uncensored | 35,1B | no disponible | apache-2.0 | Experimental, ablacion parcial |
| Gryphe/Qwen3.6-35B-A3B-StyleTune (base) | 35,1B (por herencia) | no disponible | no disponible | Modelo base sin ablacionar |
| LeVraiCNL/Qwen3.6-35B-A3B-StyleTune-Abliterated-Uncensored | no disponible | no disponible | no disponible | Anunciado, no publicado en la informacion disponible |

No se dispone de datos de rendimiento comparativo entre estas variantes.

## Limitaciones y advertencias

- La abliteration es parcial: los 256 expertos MoE por capa permanecen intactos, por lo que el modelo sigue rechazando muchas peticiones sensibles pese al sufijo "Uncensored".
- Modelo marcado como experimental por el propio autor; no apto para produccion sin evaluacion previa.
- Riesgo de alucinacion inherente al modelo base, no cuantificado en la informacion disponible.
- Sesgos conocidos: no documentados en la informacion proporcionada; se heredan del modelo base y del dataset de calibracion usado (`LLM-LAT/harmful-dataset` y `tatsu-lab/alpaca`).
- Idiomas soportados no especificados; se desconoce el comportamiento multilingue.
- La licencia Apache 2.0 permite uso comercial, pero la modificacion de pesos puede alterar garantias y comportamiento esperado; conviene revisar la licencia del modelo base Gryphe/Qwen3.6-35B-A3B-StyleTune.
- El uso de tecnicas de abliteration puede degradar capacidades generales del modelo; no se han publicado evaluaciones que cuantifiquen esa perdida.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/LeVraiCNL/Qwen3.6-35B-A3B-StyleTune-Partial-Abliterated-Uncensored
- Modelo base: https://huggingface.co/Gryphe/Qwen3.6-35B-A3B-StyleTune
- Version completa anunciada: https://huggingface.co/LeVraiCNL/Qwen3.6-35B-A3B-StyleTune-Abliterated-Uncensored
- Dataset de prompts nocivos: https://huggingface.co/datasets/LLM-LAT/harmful-dataset
- Dataset de instrucciones benignas: https://huggingface.co/datasets/tatsu-lab/alpaca
- Referencia metodologica (Arditi et al. 2024): no disponible en la informacion proporcionada

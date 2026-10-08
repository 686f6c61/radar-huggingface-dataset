# pqhaz/apex-flash-1-heretic

## Resumen

apex-flash-1-heretic es un checkpoint derivado de cantina-security/apex-flash-1-abliterated, un modelo multimodal de tipo image-text-to-text construido sobre la arquitectura que el autor identifica como GLM-5.3-Flash. El modelo original ya había sido sometido a un proceso de "abliteración" (eliminación direccional de la conducta de rechazo); este checkpoint aplica una segunda pasada de ablación direccional localizada con la herramienta Heretic, reduciendo los rechazos medidos de 99/100 a 2/100 sobre el conjunto de prueba mlabonne/harmful_behaviors.

Se trata de un modelo de mezcla de expertos (MoE) con 321.323.031.390 parámetros totales y 288 expertos enrutados por capa, además de proyecciones MLP densas y compartidas. El repositorio ocupa 642,7 GB en formato safetensors, lo que confirma pesos en BF16 (aproximadamente 2 bytes por parámetro). El autor lo publica bajo licencia MIT y lo etiqueta como material para investigación de seguridad autorizada.

Su relevancia es acotada y muy específica: no es un modelo de propósito general con mejoras de capacidad, sino una variante orientada a estudiar el comportamiento de rechazo en modelos grandes y las consecuencias de manipular direcciones en el espacio residual. El propio autor declara que no se ejecutaron benchmarks de capacidad sobre este checkpoint ni se midió el comportamiento con el modo de razonamiento activado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (identificada por el autor como GLM-5.3-Flash), multimodal image-text-to-text, con capa MTP (multi-token prediction) |
| Parametros totales | 321.323.031.390 (321,3 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el modelo base se distribuye en BF16; no se documentan cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (642,7 GB de repositorio; libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer con mezcla de expertos (MoE). La model card menciona explicitamente 288 expertos enrutados, ademas de proyecciones MLP densas y compartidas, distribuidas a lo largo de capas 0–44 (45 capas). Incluye una capa MTP (multi-token prediction) que, segun el autor, permanece byte a byte identica al modelo fuente. La pipeline declarada es image-text-to-text, por lo que incorpora un componente de vision ademas del decodificador de lenguaje.

No se ha entrenado desde cero ni se ha hecho fine-tuning adicional: la unica intervencion es una ablacion direccional sobre las matrices que escriben al flujo residual (`self_attn.o_proj` y todas las down-projections MLP: densas, compartidas y los 288 expertos enrutados) en las capas 0–44. Cada matriz se ortogonalizo contra una direccion de rechazo por capa, calculada como la diferencia entre las medias de los residuos obtenidos con 400 prompts de mlabonne/harmful_behaviors y 400 prompts de mlabonne/harmless_alpaca, proyectando fuera la direccion "harmless". Todos los demas tensores son identicos al modelo fuente. No se documentan datos de preentrenamiento, volumen de tokens, composicion del dataset ni etapas de RLHF o DPO; el conjunto de parametros exacto de la ablacion esta en el archivo `ablation.json` del repositorio.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base multimodal.
- Procesamiento de imagenes junto a texto (pipeline image-text-to-text): entrada conjunta de imagen y prompt textual.
- Capacidad de razonamiento con bloque de pensamiento: la model card menciona un bloque de razonamiento delimitado por `<think></think>`, cerrado de forma inmediata en las mediciones.
- Soporte de tool calling / function calling: no disponible (no confirmado en la informacion proporcionada).
- Soporte de agentes y razonamiento multi-paso: no disponible (no confirmado).
- Capacidades multilingues: no disponible.
- Capacidad especial: ablacion de la conducta de rechazo, con reduccion medida de 99/100 a 2/100 rechazos sobre el subconjunto de prueba de mlabonne/harmful_behaviors. No se han medido capacidades con el razonamiento activado.

## Casos de uso

- Investigacion de seguridad en alineacion: analizar como la ortogonalizacion de una unica direccion por capa modifica la conducta de rechazo, usando el par de datasets harmful_behaviors / harmless_alpaca para reproducir la medicion y comparar con el checkpoint fuente.
- Evaluacion de la degradacion por ablacion: medir la divergencia KL (0,095 en el primer token sobre harmless_alpaca) y estudiar si el cambio de comportamiento viene acompanado de perdida de capacidad en tareas benignas.
- Red teaming autorizado: someter el modelo a pruebas de robustez en entornos propios o con permiso explicito, documentando la tasa de rechazo residual (2/100 medida).
- Analisis mecanicista de representaciones: utilizar la direccion de rechazo por capa como objeto de estudio para localizar donde se representa la negativa a responder.
- Comparacion de tecnicas de ablacion: contrastar Heretic frente a otros metodos de eliminacion de rechazo sobre el mismo modelo base, manteniendo constantes todos los tensores salvo las matrices editadas.
- Investigacion multimodal sobre alineacion: al ser image-text-to-text, permite estudiar si la ablacion direccional del flujo residual tambien afecta al comportamiento ante entradas con imagen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de capacidad en la informacion disponible. El autor indica explicitamente: "No capability benchmarks were run on this checkpoint." Las unicas metricas de comportamiento publicadas son las siguientes:

| Metrica | Modelo fuente | apex-flash-1-heretic |
|---|---|---|
| Rechazos en mlabonne/harmful_behaviors test[:100] | 99/100 | 2/100 |
| Divergencia KL en mlabonne/harmless_alpaca test[:100] (primer token) | 0 | 0,095 |

Los rechazos se contabilizaron con un juez LLM (llmfan46/gemma-4-31B-it-uncensored-heretic) sobre los primeros 64 tokens generados, con el bloque de razonamiento cerrado inmediatamente (`<think></think>`) y el system prompt "You are a helpful assistant.". No se midio el comportamiento con el razonamiento activado. No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra tarea de capacidad.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en BF16 ocupan aproximadamente 642 GB, por lo que la inferencia en precision completa exige un nodo multi-GPU. Las siguientes cifras son estimaciones derivadas del recuento de parametros, no datos oficiales:
  - BF16: ~642 GB.
  - FP8: ~321 GB.
  - Cuantizacion de 4 bits: ~160 GB.
- GPU recomendadas: para BF16, un nodo con 8x H100 80 GB (640 GB) queda al limite y probablemente requiera mas memoria para el contexto y los buffers de atencion; son mas adecuados nodos de 8x H200 141 GB o configuraciones de mayor tamano. Para FP8, 4x H100 80 GB o 4x H200. Para 4 bits, 2x H100 80 GB o 2x A100 80 GB.
- GPU de consumo: no cabe en ninguna GPU de consumo individual (RTX 4090 con 24 GB, RTX 5090 con 32 GB). Requiere despliegue multi-GPU.
- Opciones de despliegue: transformers (libreria declarada); para inferencia eficiente se necesitarian servidores compatibles con arquitecturas MoE de gran tamano (vLLM, TGI, SGLang) o llama.cpp con cuantizacion agresiva, aunque no hay confirmacion de soporte para esta arquitectura concreta en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No hay datos de rendimiento publicados para apex-flash-1-heretic, por lo que la comparacion se limita a parametros, contexto, licencia y disponibilidad frente a otros modelos MoE de escala comparable. Los datos de los modelos de referencia son informacion publica de sus respectivos repositorios.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| apex-flash-1-heretic | 321,3 B | no disponible | no disponible | MIT | HuggingFace (repo de 642,7 GB) |
| GLM-4.6 | 355 B | 32 B | 200 K | MIT | HuggingFace |
| DeepSeek-V3 | 671 B | 37 B | 128 K | licencia propia DeepSeek | HuggingFace |
| Qwen3-235B-A22B | 235 B | 22 B | 128 K | Apache 2.0 | HuggingFace |

En rendimiento no procede comparacion, ya que este checkpoint no tiene benchmarks de capacidad publicados. La diferencia funcional clave respecto a los anteriores es que este modelo esta especificamente abliterado y no esta pensado para uso general, sino para investigacion de seguridad.

## Limitaciones y advertencias

- Modelo abliterado: se ha eliminado deliberadamente la conducta de rechazo, por lo que puede generar contenido danino, ilegal o inseguro. El propio autor restringe su uso a investigacion de seguridad en entornos propios o con permiso explicito.
- Riesgo de alucinacion: no evaluado; no hay benchmarks de fidelidad ni de capacidades.
- Degradacion no medida: la ablacion introduce una divergencia KL de 0,095 en el primer token sobre harmless_alpaca, pero no se ha cuantificado el efecto sobre tareas de capacidad, coherencia a largo plazo ni estabilidad.
- Ambito de la medicion muy limitado: los 2/100 rechazos se midieron solo sobre los primeros 100 ejemplos de test y sobre los primeros 64 tokens generados, con el razonamiento desactivado. El comportamiento con razonamiento activado, con entradas multimodales o con prompts mas largos no se ha medido.
- Sesgos conocidos: no disponibles (no se ha realizado ninguna evaluacion de sesgo).
- Limitaciones de contexto e idioma: no disponibles.
- Licencia: MIT permite uso comercial segun los terminos de dicha licencia, pero la ausencia de evaluaciones de seguridad y el proposito declarado de investigacion de seguridad hacen desaconsejable su uso en produccion orientada al usuario.
- Coste de despliegue: 642,7 GB y 321,3 B de parametros implican un coste de inferencia muy elevado; no es viable en hardware de consumo.
- Trazabilidad: al conservar los tensores originales salvo las matrices editadas, el modelo hereda cualquier limitacion del checkpoint base cantina-security/apex-flash-1-abliterated, que a su vez no documenta su procedencia de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pqhaz/apex-flash-1-heretic
- Modelo base: https://huggingface.co/cantina-security/apex-flash-1-abliterated
- Herramienta Heretic: https://github.com/p-e-w/heretic
- Dataset mlabonne/harmful_behaviors: https://huggingface.co/datasets/mlabonne/harmful_behaviors
- Dataset mlabonne/harmless_alpaca: https://huggingface.co/datasets/mlabonne/harmless_alpaca
- Juez LLM utilizado: https://huggingface.co/llmfan46/gemma-4-31B-it-uncensored-heretic

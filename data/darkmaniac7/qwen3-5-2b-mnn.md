# darkmaniac7/Qwen3.5-2B-MNN

## Resumen

Qwen3.5-2B-MNN es una conversión al formato MNN del modelo Qwen/Qwen3.5-2B, orientada a inferencia en dispositivo (on-device) sobre CPU de telefonía móvil. El repositorio `darkmaniac7/Qwen3.5-2B-MNN` es un espejo byte a byte de `taobao-mnn/Qwen3.5-2B-MNN` (mismos sha256 en todos los ficheros del tronco) al que se le añade una cabeza opcional de predicción multi-token (MTP) para decodificación especulativa, usada por TokForge en la ruta MNN CPU.

El modelo resuelve el problema de ejecutar un LLM de ~2B parámetros con capacidades multimodales (el paquete incluye un codificador visual `visual.mnn`) en hardware sin GPU dedicada, con un peso total de repositorio de 1,5 GB. La conversión y el crédito del trabajo original corresponden al equipo taobao-mnn; el modelo base a Qwen. La licencia es Apache-2.0 tanto en el modelo original como en la conversión.

Es relevante ahora porque combina tres piezas poco habituales en un paquete de este tamaño: cuantización agresiva para CPU, un decodificador visual incluido en el mismo formato y una cabeza MTP que acelera la generación sin alterar la distribución de salida del tronco, ya que cada token redactado por la cabeza es verificado por el tronco antes de aceptarse.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen/Qwen3.5-2B) con codificador visual; el paquete es una conversión MNN. No se detalla la arquitectura interna exacta en la información disponible |
| Parámetros totales | ~2 mil millones (según la nomenclatura del modelo base); no confirmado explícitamente en la información disponible |
| Parámetros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | El tronco se distribuye cuantizado en formato MNN (fichero `llm.mnn.weight` de 1.176.647.702 bytes); la cabeza MTP se exportó con `--quant_bit 4 --quant_block 64`. El esquema de cuantización exacto del tronco no se detalla |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | MNN (`llm.mnn`, `llm.mnn.weight`, `llm.mnn.json`, `llm_config.json`, `config.json`, `export_args.json`, `tokenizer.txt`), más `visual.mnn`/`visual.mnn.weight` para visión y `mtp-v32k.mnn`/`.weight`/`.vocab` para la cabeza MTP |

## Arquitectura y entrenamiento

No se aporta información sobre el entrenamiento del modelo base Qwen3.5-2B en los datos disponibles (número de tokens, composición del dataset, uso de RLHF/DPO, etc.). Lo que sí está documentado es el proceso de conversión: el tronco es una exportación a MNN realizada por el equipo taobao-mnn, replicada byte a byte en este repositorio. El paquete incluye un codificador visual independiente (`visual.mnn.weight`, 195.587.264 bytes), lo que indica que la conversión conserva la torre de visión del modelo original.

La innovación destacable es la cabeza de predicción multi-token (MTP), exportada desde el checkpoint `Qwen/Qwen3.5-2B @ 15852e8c` con MNN-TokForge mediante `llmexport.py --path <HF checkpoint> --export mnn --mtp --mtp_only --quant_bit 4 --quant_block 64 --mtp_vocab_file vocab_v32k.json`. Emplea un vocabulario borrador de 32k entradas (`mtp-v32k.mnn.vocab`, ids de token int32) y se carga con `speculative_type: "mtp"`, `mtp_model: "mtp-v32k.mnn"` y `draft_predict_length: 1`. Es un esquema de decodificación especulativa con verificación estricta: el tronco comprueba cada token redactado, de modo que la cabeza nunca introduce un token que el tronco no habría elegido. TokForge comprueba en cada teléfono si la cabeza aporta velocidad antes de activarla.

## Capacidades

- Generación de texto autoregresiva sobre el tronco Qwen3.5-2B convertido a MNN.
- Procesamiento visual: el paquete incluye un codificador visual, aunque no se documentan las tareas concretas soportadas.
- Decodificación especulativa mediante cabeza MTP opcional, con verificación por el tronco.
- Inferencia en CPU de dispositivos móviles a través del runtime MNN.
- Ejecución con estrategia greedy documentada en las pruebas de aceptación.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Asistentes conversacionales en el propio teléfono: el tronco corre en la ruta MNN CPU con pesos de ~1,17 GB, lo que permite mantener la conversación en el dispositivo sin enviar texto a un servidor externo.
- Autocompletado de código en editores móviles o ligeros: en las pruebas de aceptación de la cabeza MTP el dominio de código alcanzó un 98% de tokens redactados aceptados por el tronco, el valor más alto de los cuatro medidos.
- Generación aumentada por recuperación (RAG) local: con un 76% de aceptación en el dominio RAG, la decodificación especulativa sigue aportando aceleración cuando el modelo responde sobre documentos recuperados.
- Respuestas conversacionales generales: 58% de aceptación en el dominio chat, útil para asistentes de uso diario donde la ganancia de velocidad es más modesta pero aún positiva.
- Generación de textos de asesoramiento o recomendación: 56% de aceptación en el dominio advice, el escenario menos favorable de los medidos, por lo que la activación de MTP debe validarse por dispositivo.
- Aplicaciones con entrada de imagen: al incluir `visual.mnn`, el paquete está preparado para escenarios que requieran procesar imágenes junto al texto, siempre que el runtime lo soporte.
- Despliegue experimental para evaluar cuantización extrema en CPU: sirve como banco de pruebas para medir el impacto de `quant_bit 4` y `quant_block 64` sobre la calidad frente al modelo original.
- Integración en pipelines de CI o de servidor como referencia de formato MNN: permite validar que una herramienta de exportación produce artefactos idénticos (verificación por sha256).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único dato de rendimiento documentado es la tasa de aceptación de la cabeza MTP frente al tronco, medida en ruta MNN CPU, decodificación greedy, profundidad 1 y 96 tokens:

| Dominio | Tokens redactados aceptados por el tronco |
|---|---|
| Código | 98% |
| RAG | 76% |
| Chat | 58% |
| Asesoramiento (advice) | 56% |

Estos valores miden la proporción de tokens borrador que el tronco acepta, no la calidad del modelo ni su precisión en tareas. No se dispone de comparaciones con otros modelos.

## Requisitos de hardware

- VRAM/RAM estimada para el tronco: el fichero `llm.mnn.weight` ocupa 1.176.647.702 bytes (~1,17 GB), más el codificador visual (~195,6 MB) y el tokenizador (~6,5 MB). La cabeza MTP añade ~80,4 MB.
- Total del repositorio: 1,5 GB.
- Perfil objetivo: CPU de teléfono móvil mediante el runtime MNN (etiquetas `on-device`, `mobile`).
- GPU de servidor: no aplica; el formato MNN está pensado para la ruta CPU móvil, no para A100/H100/RTX 4090 con vLLM.
- ¿Cabe en GPU de consumo? No es el objetivo del paquete; no se documenta soporte para CUDA en esta conversión.
- Opciones de despliegue: runtime MNN y la herramienta TokForge (que decide por dispositivo si activar la cabeza MTP). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, dado que el formato de pesos es MNN y no safetensors ni GGUF.
- Latencia y throughput: no disponible (no se publican cifras absolutas, solo la tasa de aceptación de la decodificación especulativa).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| darkmaniac7/Qwen3.5-2B-MNN | ~2B | no disponible | MNN | Apache-2.0 | Espejo del original más cabeza MTP opcional |
| taobao-mnn/Qwen3.5-2B-MNN | ~2B | no disponible | MNN | Apache-2.0 | Conversión original sin la cabeza MTP añadida |
| Qwen/Qwen3.5-2B | ~2B | no disponible | safetensors (presumiblemente) | Apache-2.0 | Modelo base sin conversión ni cuantización MNN |

No se dispone de datos de rendimiento ni de contexto para establecer comparaciones cuantitativas con alternativas de la misma categoría. Cualquier comparación más allá del formato, la licencia y el linaje del modelo no está soportada por la información disponible.

## Limitaciones y advertencias

- El repositorio no documenta sesgos del modelo base; al no haber información sobre los datos de entrenamiento, no es posible evaluar sesgos conocidos.
- Riesgo de alucinación inherente a un modelo de ~2B parámetros; no se aportan evaluaciones de fidelidad.
- La cuantización a 4 bits con bloque de 64 aplicada a la cabeza MTP, y la cuantización del tronco no detallada, pueden degradar la calidad respecto al modelo original en precisión.
- La tasa de aceptación de la cabeza MTP cae al 56% en el dominio de asesoramiento y al 58% en chat, por lo que la ganancia de velocidad no está garantizada en todos los escenarios; el propio autor indica que TokForge verifica por dispositivo antes de activarla.
- No se especifican los idiomas soportados ni la longitud de contexto, lo que impide planificar su uso en conversaciones largas o entornos multilingües.
- No se documentan capacidades de tool calling ni de razonamiento multi-paso, pese a que el modelo base podría soportarlas.
- El formato MNN limita el despliegue a runtimes compatibles; no es directamente utilizable en stacks habituales de servidor como vLLM o TGI.
- Licencia Apache-2.0: permite uso comercial, pero conviene conservar los avisos de atribución al equipo taobao-mnn y al equipo Qwen, tal como hace la model card.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y una única versión publicada el 2026-10-11; no hay evidencia de uso en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/darkmaniac7/Qwen3.5-2B-MNN
- Conversión original de taobao-mnn: https://huggingface.co/taobao-mnn/Qwen3.5-2B-MNN
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la búsqueda web realizada.

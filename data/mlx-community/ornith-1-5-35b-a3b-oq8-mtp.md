# mlx-community/Ornith-1.5-35B-A3B-oQ8-mtp

## Resumen

Ornith-1.5-35B-A3B-oQ8-mtp es una cuantización en formato oQ de 8 bits del modelo multimodal Ornith-1.5-35B-A3B, desarrollado originalmente por ornith-ai y empaquetado por la comunidad mlx-community para su ejecución en Apple Silicon mediante la librería MLX. Se trata de un transformer de tipo Mixture-of-Experts (MoE) con 35.951.822.704 parámetros totales y aproximadamente 3.000 millones de parámetros activos por token, lo que sitúa su coste computacional de inferencia muy por debajo de lo que sugiere su tamaño nominal. El modelo acepta entradas de texto, imagen y vídeo, y expone una tubería image-text-to-text.

La particularidad de esta variante es la conservación y cuantización de la cabeza MTP (multi-token prediction), que habilita decodificación especulativa de forma nativa sin necesidad de un modelo borrador separado. El formato oQ emplea cuantización afín de 8 bits con tamaño de grupo 64 aplicado de forma uniforme a todas las matrices, incluido el bloque MTP. El resultado es un checkpoint de aproximadamente 36 GB de pesos (38,6 GB de repositorio) que cabe en máquinas con 64 GB de memoria unificada.

El interés práctico del modelo reside en la combinación de tres factores: un MoE de 35B con solo 3B activos, soporte multimodal completo y decodificación especulativa integrada, todo ello ejecutable en hardware de consumo de Apple. La model card reporta velocidades de decodificación de entre 102 y 157 tokens por segundo en un Mac Studio M3 Ultra, cifras que lo hacen viable para despliegues locales interactivos con contextos largos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), familia qwen3_5_moe |
| Parametros totales | 35.951.822.704 |
| Parametros activos | ~3B (aproximadamente 3.000 millones) |
| Longitud de contexto | Hasta 131.072 tokens verificados por rendimiento medido; máximo nativo no disponible |
| Tipos de cuantizacion | oQ afín de 8 bits, group size 64, uniforme; bloque MTP cuantizado incluido |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (checkpoint oQ para MLX) |

## Arquitectura y entrenamiento

La arquitectura es un transformer con capas de mezcla de expertos, identificado en los metadatos como `qwen3_5_moe`, lo que sugiere una topología derivada o compatible con la familia Qwen 3.5 MoE. Con 35.951.822.704 parámetros totales y alrededor de 3.000 millones activos por token, el modelo sigue el patrón habitual de enrutamiento disperso: cada token activa un subconjunto reducido de expertos, de modo que el coste de cómputo por token se aproxima al de un modelo denso de 3B mientras la capacidad de representación corresponde a un modelo de 35B. El checkpoint incluye componentes de visión que permiten la entrada de imagen y vídeo además de texto.

La innovación diferencial de esta variante es la cabeza MTP (multi-token prediction), que el autor original entrena para predecir varios tokens futuros de forma simultánea y que aquí se conserva y cuantiza junto con el resto de pesos. Esta cabeza actúa como mecanismo de decodificación especulativa integrado: el modelo propone varios tokens candidatos y los valida en una sola pasada, acelerando la generación sin requerir un modelo borrador externo. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada.

## Capacidades

- Generación de texto conversacional multi-turno con soporte de contexto largo, verificado hasta 131.072 tokens en las mediciones de rendimiento.
- Comprensión de imágenes y vídeo: la tubería image-text-to-text y los componentes de visión retenidos permiten entrada multimodal combinada con texto.
- Decodificación especulativa nativa mediante la cabeza MTP cuantizada, sin necesidad de modelo borrador adicional.
- Razonamiento multi-paso: la arquitectura MoE con 3B activos está diseñada para tareas de razonamiento y generación estructurada, aunque no se detallan capacidades específicas en la información disponible.
- Compatibilidad con clientes OpenAI: la model card indica que puede servirse con oMLX y apuntarse con un cliente compatible con la API de OpenAI, lo que facilita la integración en pipelines existentes.
- Ejecución en Apple Silicon mediante MLX, con pesos optimizados para memoria unificada.
- Tool calling y function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional local con contexto largo: el modelo puede mantener conversaciones multi-turno de hasta 131.072 tokens, lo que permite adjuntar documentación extensa o historiales largos sin truncamiento, ejecutándose íntegramente en un Mac Studio con 512 GB de memoria unificada.
- Análisis de documentos con imágenes: al aceptar entradas de imagen y texto, resulta adecuado para extraer información de capturas, diagramas o páginas escaneadas combinadas con preguntas en lenguaje natural, en un flujo image-text-to-text.
- Procesamiento de vídeo con descripción textual: los componentes de visión retenidos permiten alimentar fragmentos de vídeo y generar resúmenes o responder preguntas sobre su contenido, útil en tareas de indexación y catalogación de material audiovisual.
- Servidor de inferencia compatible con OpenAI para equipos de desarrollo: mediante oMLX se puede exponer el modelo como endpoint compatible con la API de OpenAI, de modo que herramientas y SDKs existentes funcionen sin cambios sobre hardware Apple.
- Prototipado rápido en estación de trabajo Apple: con 36 GB de pesos y 64 GB de memoria unificada como requisito mínimo, un desarrollador puede iterar sobre prompts y flujos multimodales sin depender de GPU dedicadas ni de servicios en la nube.
- Generación interactiva de alta velocidad: los 131,5 a 157,5 tokens por segundo en decodificación medidos en M3 Ultra permiten experiencias de escritura asistida y chat en tiempo real, con decodificación especulativa MTP reduciendo la latencia por token.
- Procesamiento por lotes de contexto largo: con prefill de 2.290 a 3.085 tokens por segundo hasta 32.768 tokens de prompt, el modelo es viable para tareas de resumen y extracción sobre lotes de documentos largos, aunque el rendimiento cae aproximadamente un 52% más allá de ese umbral.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card únicamente reporta mediciones de throughput en Mac Studio M3 Ultra (512 GB de memoria unificada), oMLX v0.7.3, MTP activado, valores por defecto del servidor, 256 tokens generados y media de 3 ejecuciones:

| Longitud de prompt (pp) | Prefill (tok/s) | Decode (tok/s) |
|---|---|---|
| 1024 | 2331,1 | 131,5 |
| 4096 | 3085,8 | 154,3 |
| 32768 | 2290,5 | 157,5 |
| 131072 | 1107,8 | 102,2 |

El decode mejora a medida que crece el contexto hasta pp32768 y decae en pp131072; el prefill cae aproximadamente un 52% por encima de pp32768.

## Requisitos de hardware

- VRAM/memoria estimada: aproximadamente 36 GB de pesos en cuantización oQ8; se recomienda un mínimo de 64 GB de memoria unificada, con margen adicional para contexto largo.
- Hardware de referencia medido: Mac Studio M3 Ultra con 512 GB de memoria unificada.
- GPU dedicadas (A100, H100, RTX 4090): no disponibles para este checkpoint, ya que los pesos oQ están orientados a MLX y Apple Silicon.
- Cabe en GPU de consumo: no en el sentido habitual; requiere Apple Silicon con memoria unificada de al menos 64 GB. No se dispone de información sobre compatibilidad con GPU NVIDIA de consumo.
- Opciones de despliegue: oMLX v0.7 o superior (requisito para cargar checkpoints oQ con MTP); cliente compatible con la API de OpenAI apuntando al servidor. No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: prefill de 1.107,8 a 3.085,8 tok/s y decode de 102,2 a 157,5 tok/s según longitud de prompt, en la configuración de referencia indicada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Como referencia estructural, el propio modelo base ornith-ai/Ornith-1.5-35B-A3B comparte arquitectura y parámetros pero se distribuye en precisión completa, sin la cuantización oQ8 ni el empaquetado para MLX:

| Modelo | Parámetros | Activos | Contexto | Formato | Licencia |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B-oQ8-mtp | 35,95B | ~3B | hasta 131.072 (verificado) | oQ8 safetensors (MLX) | no disponible |
| ornith-ai/Ornith-1.5-35B-A3B | 35,95B | ~3B | no disponible | safetensors | no disponible |

No se dispone de datos de benchmarks que permitan comparar el rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; es imprescindible verificar la licencia del modelo base antes de cualquier despliegue en producción.
- Idiomas soportados no disponibles: no hay confirmación del alcance multilingüe, por lo que el rendimiento en castellano u otros idiomas distintos del inglés no está garantizado.
- Dependencia estricta del runtime: la carga requiere oMLX v0.7 o superior; no funcionará en vLLM, llama.cpp, Ollama ni TGI según la información disponible, lo que limita el despliegue a Apple Silicon.
- Requisito de memoria elevado: 36 GB de pesos más margen para contexto largo implica 64 GB de memoria unificada como mínimo, lo que excluye la mayoría de portátiles y equipos de consumo.
- Caída de rendimiento en contextos muy largos: el prefill cae aproximadamente un 52% por encima de 32.768 tokens y el decode baja a 102,2 tok/s en 131.072 tokens.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad ni tasas de alucinación en la información disponible.
- Sesgos conocidos: no disponible.
- Cabeza MTP cuantizada: aunque el autor indica que la decodificación especulativa funciona de serie, la cuantización del bloque MTP podría afectar a la tasa de aceptación de tokens especulativos; no se aportan métricas al respecto.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la validación comunitaria y el soporte disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mlx-community/Ornith-1.5-35B-A3B-oQ8-mtp
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B

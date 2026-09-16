# Honkware/Qwen3-8B-exl3-4.5bpw

## Resumen

Honkware/Qwen3-8B-exl3-4.5bpw es una cuantización del modelo Qwen/Qwen3-8B publicada por el usuario Honkware, empaquetada en formato EXL3 (ExLlamaV3) con una precisión de 4,5 bits por peso. No es un modelo entrenado desde cero, sino una conversión de pesos del Qwen3-8B original: la arquitectura, el tokenizador, el contexto y el comportamiento son los del modelo base; lo único que cambia es la representación numérica de los pesos y el runtime necesario para ejecutarlo.

El repositorio ocupa 5,6 GB y está pensado para inferencia local en GPU de consumo mediante ExLlamaV3, TabbyAPI o text-generation-webui. El objetivo es claro: reducir el peso en disco y en VRAM de un modelo denso de escala 8B sin degradar de forma apreciable la calidad de salida, manteniendo una licencia Apache 2.0 heredada del modelo base y, por tanto, sin restricciones añadidas para uso comercial.

Su relevancia actual es la de servir como opción de despliegue eficiente dentro del ecosistema EXL3, que ofrece decodificación de alto rendimiento en GPUs NVIDIA. La contrapartida es la compatibilidad: al no ser GGUF, no se puede cargar en llama.cpp ni en Ollama, y al no ser safetensors estándar de Transformers, tampoco es directamente servible en vLLM o TGI sin conversión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3-8B, 36 capas) |
| Parametros totales | Modelo base: escala 8B (nominal). Los metadatos safetensors del repositorio cuantizado declaran 2.812.392.832 elementos tensoriales, cifra que no coincide con el recuento nominal del modelo base y que refleja el empaquetado de los pesos cuantizados |
| Longitud de contexto | No especificada en la model card de la cuantización; la del modelo base Qwen3-8B es la que aplica |
| Tipos de cuantizacion | EXL3 a 4,5 bits por peso (head bits = 6, codebook mul1, out-scales always) |
| Idiomas soportados | No especificados en la model card de la cuantización; el modelo base Qwen3-8B declara soporte multilingüe |
| Licencia | Apache 2.0 (heredada del modelo base) |
| Formato de pesos | safetensors con cuantización EXL3 (librería exllamav3) |
| Modelo base | Qwen/Qwen3-8B |
| Cuantizado por | Honkware (herramienta BlockQuant) |
| Tamano del repositorio | 5,6 GB |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen3-8B: un transformer denso, no MoE, de 36 capas según declara la propia model card. Esta publicación no modifica esa arquitectura ni realiza ningún entrenamiento adicional; se trata exclusivamente de una cuantización post-entrenamiento (PTQ) que no incorpora RLHF, DPO ni ajuste alguno sobre el modelo base.

El proceso de cuantización se realizó con la herramienta BlockQuant de Honkware y utiliza el formato EXL3 de ExLlamaV3. La receta declarada en quantization_config.json es la siguiente: formato EXL3, 4,5 bits por peso, 6 bits para las cabezas, 250 filas de calibración, codebook mul1, out-scales siempre activos y modo paralelo habilitado. El conjunto de calibración es la mezcla empaquetada con exllamav3, compuesta por muestras de c4, code, multilingual, technical, tiny y wiki, lo que busca cubrir texto general, código y contenido multilingüe durante el ajuste de las escalas.

El único indicador de calidad publicado por el autor es la divergencia KL mediana respecto al modelo base, con un valor de 0,0033 para esta variante de 4,5 bpw. Es una métrica de fidelidad de la distribución de salida, no un benchmark de capacidad, y debe interpretarse como una medida de cuánto se aleja la versión cuantizada de la original.

## Capacidades

- Generación de texto conversacional y de propósito general, heredada del modelo base Qwen3-8B.
- Razonamiento multi-paso y matemáticas, en la medida en que lo permite el modelo base.
- Generación y comprensión de código, favorecida por la inclusión de datos de tipo code en la calibración.
- Soporte multilingüe, condicionado a las capacidades del Qwen3-8B subyacente.
- Compatibilidad con clientes OpenAI a través de TabbyAPI, lo que habilita el uso de tool calling si el runtime y la plantilla de chat lo permiten.
- No se declaran capacidades de visión ni de audio en esta publicación: es un modelo exclusivamente de texto.
- No se documenta en la model card ningún modo de razonamiento explícito ni parámetros de muestreo recomendados; dicha información debería tomarse del repositorio del modelo base.

## Casos de uso

- Asistente de chat local en GPU de consumo: con 5,6 GB de pesos, el modelo cabe en tarjetas de 8-12 GB y permite sostener conversaciones multi-turno en la propia máquina sin enviar datos a terceros, algo relevante en entornos con requisitos de privacidad.
- Servidor de inferencia compatible con OpenAI: desplegado con TabbyAPI, expone una API HTTP compatible con clientes OpenAI, de modo que se puede sustituir un endpoint remoto por uno local cambiando únicamente la URL base.
- Generación de código en flujos de desarrollo: al estar calibrado con datos de código, resulta adecuado para autocompletado, generación de tests o explicación de fragmentos dentro de editores y scripts, siempre verificando la salida antes de integrarla.
- Procesamiento por lotes de documentación técnica: con la mezcla de calibración empleada (wiki, technical, c4), es razonable usarlo para resumir, reescribir o clasificar documentación en pipelines offline.
- Prototipado e investigación sobre cuantización: sirve como punto de comparación directo frente a otros bpw y frente al modelo original, usando la divergencia KL mediana como métrica de fidelidad.
- Asistente interno para equipos pequeños: el coste de hardware es bajo y el rendimiento por GPU es alto gracias a ExLlamaV3, lo que permite mantener un servicio interno con una sola tarjeta.
- Evaluación de pipelines multilingües: útil para probar la degradación de calidad en idiomas distintos del inglés cuando se reduce la precisión de los pesos, especialmente combinado con la variante de mayor bpw.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible para esta cuantización. El único dato cuantitativo publicado por el autor es la divergencia KL mediana frente al modelo base.

| Metrica | Valor | Nota |
|---|---|---|
| Divergencia KL mediana | 0,0033 | A 4,5 bpw; menor es mejor |
| MMLU | No disponible | No publicado para esta cuantización |
| HumanEval | No disponible | No publicado para esta cuantización |
| GSM8K | No disponible | No publicado para esta cuantización |

## Requisitos de hardware

- Peso en disco y en memoria de los pesos: 5,6 GB.
- VRAM estimada: en torno a 7 GB con contextos cortos (unos pocos miles de tokens) y del orden de 10-12 GB si se trabaja con contextos largos, dado que la caché KV crece de forma lineal con el número de tokens. Son estimaciones derivadas del tamaño de pesos declarado, no medidas publicadas.
- GPUs de consumo compatibles: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4070 Ti, RTX 4080, RTX 4090 y cualquier tarjeta con 8 GB o más de VRAM para contextos reducidos. En 8 GB el margen es escaso y conviene limitar la longitud de contexto.
- GPUs profesionales: A100, H100, L40S y similares son válidas para servir varias peticiones concurrentes, aunque están sobredimensionadas para una sola instancia de este modelo.
- Opciones de despliegue: TabbyAPI (servidor HTTP compatible con OpenAI), text-generation-webui con el loader ExLlamaV3, y la API Python de ExLlamaV3 para integración directa en código propio.
- Incompatibilidades: no es cargable en llama.cpp ni en Ollama (requieren GGUF) ni directamente en vLLM o TGI (requieren safetensors estándar o sus propios formatos). Requiere un runtime con soporte de EXL3.
- Latencia y throughput: no publicados en la información disponible. ExLlamaV3 está orientado a decodificación rápida en GPUs NVIDIA, pero no se aportan cifras concretas de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Honkware/Qwen3-8B-exl3-4.5bpw | Escala 8B (base Qwen3-8B) | El del modelo base | EXL3, safetensors | Apache 2.0 | HuggingFace, requiere ExLlamaV3 |
| Qwen/Qwen3-8B | Escala 8B | El declarado por Qwen en su documentación | safetensors BF16 | Apache 2.0 | HuggingFace, compatible con Transformers, vLLM y TGI |
| Cuantizaciones GGUF de Qwen3-8B (Q4_K_M y similares) | Escala 8B | El del modelo base | GGUF | Apache 2.0 | HuggingFace, compatible con llama.cpp, Ollama y LM Studio |
| Otras variantes EXL3 de la colección de Honkware | Escala 8B | El del modelo base | EXL3, safetensors | Apache 2.0 | HuggingFace, misma colección a distintos bpw |

La diferencia principal entre alternativas no es de capacidad, sino de ecosistema: EXL3 ofrece buen rendimiento en GPUs NVIDIA con ExLlamaV3, mientras que GGUF cubre CPU, GPU y Apple Silicon con un soporte de herramientas mucho más amplio. Los datos de rendimiento comparado entre ambas rutas no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Es una cuantización de 4,5 bits por peso: existe pérdida de precisión respecto al modelo original, cuantificada por el autor en una divergencia KL mediana de 0,0033. El impacto real en tareas concretas no está medido.
- No se han publicado evaluaciones en benchmarks de capacidad, por lo que no es posible afirmar cuánto se degradan razonamiento, código o matemáticas frente al modelo base.
- La model card no documenta sesgos, comportamiento de rechazo ni políticas de seguridad; cualquier evaluación de este tipo debe remitirse al repositorio de Qwen3-8B.
- Riesgo de alucinación inherente al modelo base, no mitigado ni caracterizado en esta publicación.
- Compatibilidad restringida: al requerir EXL3, no funciona en llama.cpp, Ollama, vLLM ni TGI. Esto limita su uso en infraestructuras ya estandarizadas en esos runtimes.
- Los idiomas soportados no se detallan en la model card de la cuantización, y la calibración incluye datos multilingües, pero no se especifica la cobertura real por idioma.
- La licencia Apache 2.0 permite uso comercial sin restricciones añadidas, pero se hereda cualquier término del modelo base; conviene revisar el repositorio de Qwen3-8B antes de un despliegue en producción.
- El repositorio registra cero descargas y cero valoraciones en el momento de la consulta, por lo que no existe validación comunitaria de su calidad.
- La fecha de creación del repositorio (2026-09-16) es posterior a la del modelo base; conviene verificar que el checkpoint de origen es el esperado.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Honkware/Qwen3-8B-exl3-4.5bpw
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Colección de cuantizaciones EXL3 de Qwen3-8B: https://huggingface.co/collections/Honkware/qwen3-8b-exl3-6aa9f13b630d4868abb0748a
- Perfil del autor: https://huggingface.co/Honkware
- ExLlamaV3: https://github.com/turboderp-org/exllamav3
- TabbyAPI: https://github.com/theroyallab/tabbyAPI
- text-generation-webui: https://github.com/oobabooga/text-generation-webui
- Herramienta de cuantización BlockQuant: https://github.com/Honkware/blockquant

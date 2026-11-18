# openamer-max/openamer-max-vl-8b

## Resumen

OpenAmer-Max VL-8B es un ajuste fino (fine-tuning) experimental del modelo Qwen3-VL-8B-Instruct, desarrollado por el usuario openamer-max. Se trata de la primera iteración de 8B parámetros del proyecto OpenAmer, un asistente personal orientado a tareas técnicas de consola (tablas, stacktraces, diffs, líneas de versión). El modelo parte de la base Qwen3-VL-8B-Instruct, sobre la que se aplicó un adaptador QLoRA entrenado con datos propios, y posteriormente se fusionó y cuantizó a 4 bits en formato GGUF (Q4_K_M).

La relevancia de esta ficha es doble. Por un lado, documenta un caso real de ajuste fino de bajo coste sobre una GPU T4 con 807 ejemplos de entrenamiento. Por otro, el propio autor advierte que este modelo **no supera** a su predecesor de 7B en el banco de pruebas interno (17/24 frente a 22/24), por lo que se publica como ejercicio de transparencia y trazabilidad, no como una mejora lista para producción. El modelo tiene 8.190.735.360 parámetros totales y un contexto configurado de 16.384 tokens, insuficiente para los requisitos del agente OpenAmer, que exige al menos 64.000 tokens.

La información disponible es limitada: la model card está redactada en alemán, no se especifican licencia ni idiomas soportados, y no hay resultados publicados de benchmarks estándar (MMLU, HumanEval, GSM8K). Lo que sí se aporta son métricas concretas del proceso de entrenamiento y de una prueba interna de 24 tareas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Qwen3-VL-8B-Instruct) con adaptador QLoRA fusionado |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16.384 tokens (configurado en el Modelfile) |
| Tipos de cuantizacion | Q4_K_M (único archivo publicado) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (archivo `openamer-max-vl-8b-Q4_K_M.gguf`, 4,7 GB) |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen3-VL-8B-Instruct, un transformer multimodal con capacidad de visión. Sobre esta base se aplicó un adaptador QLoRA con rango 16, tasa de aprendizaje 2e-4, 3 épocas y 303 pasos de entrenamiento. El conjunto de datos constó de 807 ejemplos: 657 de texto y 150 de imagen. Las imágenes fueron consolas renderizadas (tablas, stacktraces, diffs y líneas de versión). El entrenamiento alcanzó una pérdida final de 0,5957 y un pico de VRAM de 11,42 GiB sobre una NVIDIA T4. El adaptador se fusionó con los pesos base y el resultado se cuantizó a 4 bits (Q4_K_M).

Como innovación técnica destacable, el entrenamiento incluyó 40 líneas de herramientas en formato nativo `<tool_call>`, lo que habilita el uso de function calling. No se menciona el uso de RLHF, DPO ni decodificación especulativa. El contexto de 16.384 tokens es una decisión de despliegue (parámetro `num_ctx` en el Modelfile), no una característica arquitectónica de la base, que en su versión original soporta ventanas mayores.

## Capacidades

- Generación de texto conversacional en formato de asistente personal (system prompt configurable).
- Procesamiento de imágenes: entrenado específicamente con capturas de consola (tablas, stacktraces, diffs, versiones).
- Soporte de tool calling / function calling mediante formato nativo `<tool_call>` (40 ejemplos de entrenamiento).
- Razonamiento multi-paso limitado: el contexto de 16.384 tokens restringe tareas de agente que requieran ventanas mayores.
- Capacidades multilingües: no documentadas; la model card está en alemán pero no se especifican idiomas soportados.
- No se documentan modos de "thinking", audio ni otras capacidades especiales.

## Casos de uso

- **Asistencia técnica en consola:** el modelo puede interpretar capturas de pantalla de terminales (tablas, stacktraces, diffs) y responder con explicaciones o correcciones, gracias a los 150 ejemplos de imagen con los que fue entrenado.
- **Análisis de errores y stacktraces:** dado un volcado de error renderizado como imagen o texto, el modelo puede identificar la línea problemática y sugerir una causa probable, aprovechando el entrenamiento específico en este tipo de contenido.
- **Revisión de diffs y cambios de código:** puede recibir una imagen o texto de un diff y describir qué cambia, útil en revisiones rápidas o en entornos donde no se dispone de acceso directo al repositorio.
- **Asistente personal con personalidad configurable:** el system prompt permite definir una identidad concreta (en el ejemplo, un asistente personal suizo), adecuado para prototipos de asistentes domésticos o de equipo.
- **Integración con herramientas vía function calling:** los 40 ejemplos de `<tool_call>` permiten conectar el modelo a APIs o scripts locales en flujos de automatización sencillos, siempre que la tarea quepa en 16.384 tokens.
- **Despliegue local en hardware modesto:** al estar cuantizado a Q4_K_M (4,7 GB), puede ejecutarse en GPUs de consumo con 8 GB de VRAM mediante Ollama, lo que lo hace útil para pruebas offline y entornos sin conectividad.
- **Docencia y experimentación con QLoRA:** el repositorio documenta hiperparámetros, tamaño del dataset y pérdida final, por lo que sirve como caso de estudio reproducible de ajuste fino de bajo coste sobre una T4.

## Benchmarks y rendimiento

El autor publica una única medición interna sobre 24 tareas, sin detallar la composición del conjunto ni las métricas por categoría:

| Modelo | Aciertos (24 tareas) |
|---|---|
| openamer-max-vl-8b (este modelo) | 17/24 |
| openamer-max-7b (en producción) | 22/24 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, MMMU) en la información disponible. Tampoco se ha medido el rendimiento en el conjunto de prueba de imágenes, según admite el propio autor.

## Requisitos de hardware

- **VRAM para inferencia:** el archivo Q4_K_M ocupa 4,7 GB. Con contexto de 16.384 tokens, el autor estima que un 8B con 64k requeriría unos 15 GB (4,7 GB de pesos + 9,0 GB de KV-cache + ~1,2 GB de codificador de imagen). Para 16k el KV-cache se reduce proporcionalmente, aunque no se da una cifra exacta.
- **GPU recomendadas:** NVIDIA T4 (usada en entrenamiento, 16 GB), RTX 4090, A100, H100 para despliegues con contexto completo. En GPUs de consumo con 8 GB (por ejemplo, RTX 5060 Laptop con 8.151 MiB) el modelo cabe en pesos pero no cumple el requisito de contexto del agente OpenAmer.
- **¿Cabe en GPU de consumo?** Sí, en GPUs con al menos 8 GB de VRAM para contexto corto; no para ventanas de 64k.
- **Opciones de despliegue:** Ollama (soporte directo vía `ollama run hf.co/openamer-max/openamer-max-vl-8b:Q4_K_M`), llama.cpp (formato GGUF). No se documenta compatibilidad con vLLM ni TGI.
- **Latencia y throughput:** no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| openamer-max-vl-8b | 8,19B | 16.384 | 17/24 (prueba interna) | no disponible | GGUF en HF |
| openamer-max-7b | ~7B (no confirmado) | 65.536 | 22/24 (prueba interna) | no disponible | en producción (no se detalla) |
| Qwen3-VL-8B-Instruct (base) | ~8B | no disponible en esta ficha | no disponible | no disponible en esta ficha | Hugging Face (Qwen) |

La comparación con la base Qwen3-VL-8B-Instruct no es posible con los datos aportados: no se han publicado mediciones del ajuste frente al modelo original en el mismo banco de pruebas. El propio autor reconoce que este 8B es inferior a su 7B en producción, lo que sitúa al modelo por debajo de su predecesor en la práctica.

## Limitaciones y advertencias

- **Rendimiento inferior al predecesor:** 17/24 frente a 22/24 en la prueba interna de 24 tareas. El autor lo declara explícitamente y no lo recomienda como estándar.
- **Contexto insuficiente para el agente OpenAmer:** 16.384 tokens frente a los 64.000 que exige el agente; en la GPU objetivo (8.151 MiB) no es posible ampliarlo a 64k.
- **Visión no evaluada:** el modelo se entrenó con 150 imágenes de consola, pero no se ha medido en el conjunto de prueba de imágenes.
- **Riesgo de alucinación:** no cuantificado; al ser un ajuste fino sobre 807 ejemplos, la especialización es estrecha y puede degradar el comportamiento general de la base.
- **Licencia no especificada:** no se indica licencia, lo que impide evaluar restricciones de uso comercial. La licencia de la base Qwen3-VL-8B-Instruct tampoco se detalla en la información disponible.
- **Idiomas no documentados:** no se especifica qué idiomas soporta; la model card está en alemán pero el entrenamiento podría estar sesgado hacia ese idioma.
- **Tool calling limitado:** solo 40 ejemplos de `<tool_call>`, insuficiente para flujos de agente complejos.
- **Sin benchmarks estándar:** no hay datos de MMLU, HumanEval ni similares, lo que impide comparar con el ecosistema.
- **Fecha de creación futura:** el repositorio figura creado el 2026-11-18, dato anómalo que conviene verificar antes de usarlo en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/openamer-max/openamer-max-vl-8b
- Modelo base Qwen3-VL-8B-Instruct: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Descarga directa del GGUF: https://huggingface.co/openamer-max/openamer-max-vl-8b/resolve/main/openamer-max-vl-8b-Q4_K_M.gguf

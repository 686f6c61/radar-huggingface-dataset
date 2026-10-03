# pengyixuan/Ornith-1.5-35B-A3B-MLX-8bit

## Resumen

Ornith-1.5-35B-A3B-MLX-8bit es la versión cuantizada a 8 bits del modelo base ornith-ai/Ornith-1.5-35B-A3B, publicada por el usuario pengyixuan en HuggingFace. Se trata de un modelo de lenguaje multimodal (entrada de texto e imagen) con arquitectura de mezcla de expertos (MoE) que suma unos 34.660 millones de parámetros totales, pero solo activa aproximadamente 3.000 millones por token (variante A3B). El objetivo de esta ficha es evaluar una conversión de pesos orientada específicamente a inferencia local en Apple Silicon mediante el framework MLX.

El modelo base está licenciado bajo MIT y se orienta a generación de código, razonamiento complejo, uso de herramientas (tool calling) y tareas de agente, con una ventana de contexto nativa de 256K tokens. La cuantización a 8 bits reduce el peso de los pesos de aproximadamente 70 GB (BF16) a unos 36 GB reales, lo que permite ejecutarlo en equipos Mac con 48 GB de memoria unificada o más. El repositorio ocupa 36,8 GB.

El interés actual de esta ficha radica en que documenta un flujo realista de despliegue local en hardware de consumo (Mac Apple Silicon) sobre un modelo MoE de gran tamaño, con datos medidos de rendimiento de inferencia (unos 49,6 tok/s de generación y 380 tok/s de prefill) y una configuración detallada para el motor oMLX. No se han publicado resultados de benchmarks de calidad (SWE-bench, MMLU, Terminal-Bench) para esta versión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos), transformer multimodal con atención híbrida |
| Parametros totales | 34.660.608.768 (~35B) |
| Parametros activos | ~3B por token (A3B) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | 8 bits (MLX) |
| Idiomas soportados | Chino e inglés (según etiquetas del repositorio) |
| Licencia | MIT (heredada del modelo base) |
| Formato de pesos | safetensors en formato MLX (8 bits) |
| Modalidades | Texto e imagen (entrada multimodal) |
| Modelo base | ornith-ai/Ornith-1.5-35B-A3B |
| Framework | MLX (Apple Silicon) |
| Tamaño del repositorio | 36,8 GB |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura de mezcla de expertos (MoE) con unos 35.000 millones de parámetros totales y aproximadamente 3.000 millones activados por token. La model card de esta cuantización menciona el uso de «atención híbrida» (hybrid attention): las capas de atención completa escalan de forma cuadrática O(n²), mientras que el resto emplea mecanismos más eficientes, lo que explica que el coste de prefill crezca de forma no lineal con la longitud de contexto (según la model card, 120K tokens requeriría entre 15 y 17 veces el tiempo de prefill de 20K tokens). No se detallan en la información disponible el número exacto de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO.

El modelo soporta entrada multimodal (texto e imagen) y cuenta con un modo de razonamiento («thinking mode») cuyo proceso de pensamiento está fijado siempre en inglés por decisión de entrenamiento, sin que el prompt pueda alterarlo. La cuantización a 8 bits se realizó con `mlx_lm.convert -q --q-bits 8`. En el motor oMLX se aprovechan varias optimizaciones: decodificación especulativa DFlash, cuantización de la caché KV a 4 bits (turboquant_kv) y prefill acelerado por hardware en la Apple Neural Engine (ANE). Estas tres funciones, según la model card, aportarían alrededor de un 5% adicional de rendimiento; DFlash y MTP son mutuamente excluyentes y, en esta conversión, MTP no está disponible porque los pesos de origen no lo incluyen.

## Capacidades

- Generación de texto conversacional y de propósito general.
- Razonamiento complejo (modo «thinking»), aunque el proceso de pensamiento se emite siempre en inglés.
- Generación de código en producción, con foco declarado en tareas de programación y depuración.
- Uso de herramientas (tool calling / function calling), orientado a flujos de agente.
- Tareas de agente y razonamiento multi-paso.
- Entrada multimodal de imágenes: descripción e interpretación de contenido visual junto con texto.
- Capacidades multilingües limitadas a chino e inglés según las etiquetas del repositorio.
- Control del modo de razonamiento por petición mediante `chat_template_kwargs: {"enable_thinking": false}`.

## Casos de uso

- Despliegue local en Mac para asistencia de programación: al ser una cuantización MLX de 8 bits, permite ejecutar un MoE de 35B en un Mac de 48 GB o más, ofreciendo generación de código sin depender de la nube y con una ventana de contexto de 256K tokens.
- Agentes de automatización con tool calling: el modelo soporta function calling y razonamiento multi-paso, por lo que puede integrarse en pipelines que encadenen llamadas a APIs, ejecución de comandos o consultas a bases de datos. Conviene activar `chunked_prefill` para no bloquear el motor durante prefill largos.
- Análisis de documentos extensos y multiformato: la ventana de 256K tokens permite procesar contratos, informes o repositorios completos, combinando texto e imágenes (por ejemplo, capturas o diagramas).
- Descripción e interpretación de imágenes en flujos conversacionales: al aceptar entrada de imagen y texto, sirve para tareas de accesibilidad, catalogación de contenido visual o asistencia técnica guiada por capturas.
- Asistentes conversacionales multi-turno en local: el motor recomienda mantener el prefijo (system prompt) byte a byte idéntico entre turnos para maximizar la tasa de aciertos de la caché de prefijo, que en las mediciones alcanza el 94,6%.
- Prototipado e investigación en hardware de consumo: al estar bajo licencia MIT y ser ejecutable en Apple Silicon, resulta adecuado para equipos de investigación que quieran experimentar con un MoE de clase 30B-A3B sin costes de GPU en la nube.
- Servicio interno con API compatible OpenAI: mediante el motor oMLX se expone un endpoint `/v1/chat/completions` con autenticación por clave, útil para integraciones tipo proxy o entornos de desarrollo compartidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (SWE-bench, MMLU, Terminal-Bench, etc.) en la información disponible. La model card indica explícitamente que esas pruebas «aún no se han realizado». Solo se proporcionan métricas de inferencia medidas en un equipo Apple Silicon con el motor oMLX 0.7.0:

| Metrica | Valor |
|---|---|
| Memoria de modelo | 36,01 GB |
| Velocidad de generacion | ~49,6 tok/s |
| Velocidad de prefill | ~380 tok/s |
| Tasa de aciertos de cache | 94,6% |
| Aceleracion al desactivar thinking | ~5,8x |

Además, una fuente externa (llm-bench.io) reporta un pico de 101 tok/s en dos ejecuciones comunitarias sobre 1 GPU, dato que no está confirmado por el autor.

## Requisitos de hardware

- Memoria unificada mínima: 48 GB (36 GB de pesos más caché KV y sobrecarga del sistema).
- Memoria unificada recomendada: 64 GB o más para contextos largos y uso multimodal.
- Ocupación real de pesos a 8 bits: 36,01 GB.
- Solo Apple Silicon (M1 o superior): la cuantización está pensada para Mac; el formato MLX no se ejecuta de forma nativa en GPU NVIDIA.
- No cabe en GPU de consumo con menos de 48 GB de VRAM; la versión BF16 original requeriría aproximadamente 2 GPU de 80 GB.
- Despliegue: MLX (`mlx-llm`), motor oMLX. No se documentan instrucciones para vLLM, llama.cpp, Ollama ni TGI.
- Rendimiento medido: ~49,6 tok/s de generación y ~380 tok/s de prefill; con `enable_thinking` desactivado la aceleración llega a ser de hasta 5,8×.
- Ajustes de motor recomendados: `chunked_prefill: true`, `max_concurrent_requests: 8`, `dflash_enabled: true`, `turboquant_kv_enabled: true` (KV en 4 bits) y `qwen35_ane_prefill_enabled: true`.
- Para contextos muy largos, la model card recomienda subir el timeout del cliente a 300-600 s por el crecimiento no lineal del prefill.

## Comparativa con modelos similares

No se dispone de datos verificados de otros modelos de la misma categoría en la información proporcionada. La única comparación documentada es entre esta cuantización y su modelo base:

| Version | Precision | Peso en disco | Hardware objetivo | Licencia |
|---|---|---|---|---|
| Ornith-1.5-35B-A3B (BF16) | 16 bits | ~70 GB | 2 GPU de 80 GB | MIT |
| Ornith-1.5-35B-A3B-MLX-8bit | 8 bits | ~36 GB | Mac con 48 GB+ | MIT |

No se incluyen en la información recibida datos de parámetros, contexto, rendimiento o licencia de otras alternativas MoE comparables (por ejemplo, modelos de la familia Qwen3 A3B u otros MoE de clase 30B), por lo que no se puede elaborar una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la información disponible.
- Riesgo de alucinación: no se documenta ni se mitiga explícitamente; sin benchmarks de calidad publicados no hay evaluación independiente de fiabilidad.
- Ausencia de benchmarks: la model card reconoce que los test de calidad (SWE-bench, MMLU, Terminal-Bench) no se han realizado, por lo que su rendimiento real en tareas de código y razonamiento no está verificado.
- Idiomas: el soporte declarado se limita a chino e inglés; el castellano no figura entre los idiomas soportados.
- El proceso de razonamiento («thinking») se emite siempre en inglés y no puede cambiarse mediante el prompt.
- Rendimiento en prefill degradado con contexto largo: las capas de atención completa son O(n²), y el coste de prefill crece de forma no lineal (120K tokens frente a 20K puede suponer 15-17× el tiempo).
- Compatibilidad limitada: solo Apple Silicon con MLX; no se ofrecen pesos GGUF ni compatibilidad con otros runtimes.
- Los reinicios/configuraciones del motor (cuantización, caché, contexto) provocan recargas del modelo que suspenden todas las peticiones en curso; hay que confirmar `loaded_count=1` antes de servir tráfico.
- Licencia MIT permite uso comercial, pero obliga a conservar la atribución y el texto de licencia del modelo base ornith-ai/Ornith-1.5-35B-A3B.
- Modelo con muy pocas descargas (3) y ningún «like» en el momento de la consulta, lo que indica escasa validación comunitaria.

## Enlaces

- Repositorio de esta cuantización: https://huggingface.co/pengyixuan/Ornith-1.5-35B-A3B-MLX-8bit
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Espejo del autor del modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B-MLX-8bit
- Benchmarks locales de terceros: https://llm-bench.io/models/ornith-1-5-35b-a3b-mlx-8bit
- Ficha en LLM Explorer: https://llm-explorer.com/model/ornith-ai%2FOrnith-1.5-35B-A3B-MLX-8bit,7BzTeAxatIclpaUw9Hldj9
- Resumen en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/ornith-1.5-35b-a3b-mlx-ornith-ai

# Lakki8f9f/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje y vision de tipo causal con codificador visual, publicado en Hugging Face bajo el identificador `Lakki8f9f/Qwen3.8-27B`. Segun la model card, forma parte de la familia Qwen3.8, presentada como la generacion mas capaz de la familia de modelos abiertos Qwen hasta la fecha, construida sobre la base arquitectonica de Qwen3.5. El modelo se distribuye en formato Transformers y declara compatibilidad con vLLM, SGLang y TokenSpeed.

El modelo combina un transformer con capas hibridas (Gated DeltaNet de atencion lineal y Gated Attention clasica), 64 capas, dimension oculta de 5120 y 27.781.427.952 parametros totales segun los safetensors del repositorio. Soporta contexto nativo de 262.144 tokens, extensible hasta 1.000.000, e incluye comprension nativa de imagen y video, control flexible del modo de razonamiento y entrenamiento con Multi-Token Prediction (MTP).

Es relevante para desarrolladores que necesitan un modelo denso de ~27B con capacidades multimodales, contexto muy largo y control de razonamiento, desplegable en infraestructura propia. No obstante, el repositorio presenta senales de escasa trazabilidad: cero descargas, cero likes, autoria no verificable como oficial de Qwen y una model card con referencias a servicios y modelos no contrastables, por lo que debe evaluarse con cautela antes de usarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder; layout hibrido 16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)) |
| Parametros totales | 27.781.427.952 (segun safetensors); 27B declarados en la model card |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.000.000 |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (libreria transformers) |

Otros datos tecnicos declarados: hidden dimension 5120, token embedding 248.320 (padded), 64 capas, FFN con dimension intermedia 17.408, Gated DeltaNet con 48 cabezas lineales para V y 16 para QK (dimension de cabeza 128), Gated Attention con 24 cabezas para Q y 4 para KV (dimension de cabeza 256, RoPE de 64 dimensiones), y salida LM de 248.320 (padded). Tamano del repositorio: 55,6 GB.

## Arquitectura y entrenamiento

La arquitectura es un transformer hibrido que intercala bloques de atencion lineal Gated DeltaNet con bloques de atencion clasica (Gated Attention), en una proporcion de 3 a 1 dentro de cada uno de los 16 grupos de capas. Este diseno busca reducir el coste computacional y de memoria en contextos largos manteniendo la calidad de la atencion completa en puntos clave. El modelo incorpora ademas un codificador visual para entrada image-text-to-text y fue entrenado con Multi-Token Prediction (MTP) en varios pasos, tecnica que puede acelerar la decodificacion.

Segun la model card, el modelo ha pasado por pre-entrenamiento y post-entrenamiento. No se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas concretas de RLHF o DPO. Las innovaciones destacadas son el control flexible del razonamiento (modo thinking activado por defecto, desactivable por peticion, con ajuste de profundidad mediante `reasoning_effort` y retencion del contexto de razonamiento historico via `preserve_thinking`) y la comprension nativa de imagenes y videos, incluyendo videos de hasta una hora de duracion.

## Capacidades

- Generacion de texto, razonamiento y tareas de trabajo profesional, investigacion y codificacion.
- Comprension de imagen y video de forma nativa (diagramas STEM, documentos, videos de escala horaria).
- Modo de razonamiento (thinking) activado por defecto, desactivable por peticion y ajustable en profundidad con `reasoning_effort`.
- Retencion del contexto de razonamiento entre mensajes historicos mediante `preserve_thinking`.
- Ejecucion de agentes y tareas de horizonte largo, con planificacion autonoma y manejo de retroalimentacion del entorno.
- Codificacion agentica en terminal (evaluada en Terminal Bench 2.1 segun la model card).
- Compatibilidad declarada con harnesses y herramientas de desarrollo populares.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling / function calling: no se detalla explicitamente en la informacion disponible, aunque la orientacion agentica y la mencion de herramientas integradas en la version alojada sugieren soporte.

## Casos de uso

- Codificacion agentica en terminal: el modelo esta evaluado en Terminal Bench 2.1 y declara mejoras en planificacion autonoma y manejo de feedback del entorno, lo que lo hace adecuado para agentes que ejecutan comandos, interpretan errores y corrigen iterativamente en pipelines de desarrollo.
- Analisis de documentos tecnicos y diagramas STEM: gracias a su codificador visual nativo, puede procesar figuras, esquemas y documentos escaneados junto con texto para extraer conclusiones o responder preguntas tecnicas.
- Comprension de video de larga duracion: la model card menciona soporte para videos de hasta una hora, util para resumen de reuniones, analisis de grabaciones o extraccion de eventos en material audiovisual extenso.
- Asistentes de investigacion con contexto largo: con 262.144 tokens nativos (y hasta 1.000.000 extensibles), puede mantener conversaciones multi-turno sobre corpus extensos, articulos o bases de codigo sin truncar.
- Razonamiento con profundidad ajustable: el control de `reasoning_effort` permite usar el modelo en modos rapidos para tareas simples y modos profundos para problemas complejos, optimizando coste y latencia en produccion.
- Tareas profesionales de horizonte largo: la mejora declarada en tareas agenticas de largo recorrido lo hace candidato para automatizaciones que requieren varios pasos encadenados con verificacion intermedia.
- Despliegue self-hosted con vLLM o SGLang: al declarar compatibilidad con estos motores, puede integrarse en infraestructura propia para servir cargas multimodales con contexto largo.

## Benchmarks y rendimiento

La model card incluye una tabla de resultados comparativos, pero en la informacion proporcionada solo se conserva el encabezado y la primera fila parcial (Terminal Bench 2.1, sin valor numerico). No hay cifras completas de MMLU, HumanEval, GSM8K ni del resto de benchmarks mencionados.

| Benchmark | Qwen3.8-27B | Qwen3.6-27B | Qwen3.7-Plus | Muse Glimmer-30B | Opus4.6 Max |
|---|---|---|---|---|---|
| Terminal Bench 2.1 (Terminus) | No disponible | No disponible | No disponible | No disponible | No disponible |

No se han publicado resultados de benchmarks completos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamano, un modelo denso de ~27,8B parametros requiere aproximadamente 55,6 GB en precision completa (coincide con el tamano del repo), ~28 GB en FP8/BF16 aproximado de 2 bytes por parametro y ~14-16 GB en cuantizaciones de 4 bits, sin contar cache KV ni overhead.
- GPU recomendadas: no especificadas en la informacion. Por tamano, cabria esperar A100 80GB, H100 80GB o configuraciones multi-GPU para precision completa; GPUs consumer de 24 GB (RTX 4090) solo en cuantizacion agresiva.
- Cabe en consumer GPU: probablemente solo con cuantizacion a 4-8 bits en GPUs de 24 GB o superiores; no confirmado.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang y TokenSpeed (declarados en la model card). No se mencionan llama.cpp ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La model card compara el modelo con Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, pero los datos numericos no estan disponibles en la informacion proporcionada.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.8-27B | 27,8B | 262.144 nativo / 1.000.000 extensible | Apache 2.0 | Hugging Face (repo de terceros) |
| Qwen3.6-27B | No disponible | No disponible | No disponible | No disponible |
| Qwen3.7-Plus | No disponible | No disponible | No disponible | No disponible |
| Muse Glimmer-30B | No disponible | No disponible | No disponible | No disponible |
| Opus4.6 Max | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Trazabilidad dudosa: el repositorio pertenece a un autor no verificado (`Lakki8f9f`), con cero descargas y cero likes, y la model card hace referencia a servicios y modelos (Qwen Cloud, Qwen3.7-Plus, Opus4.6 Max) que no pueden contrastarse con la informacion disponible.
- Riesgo de suplantacion o artefacto no oficial: el nombre sugiere un modelo de la familia Qwen, pero no se confirma que sea una publicacion oficial de Alibaba/Qwen. Verificar hashes y procedencia antes de usarlo.
- Alucinacion: no se documentan tasas ni mitigaciones especificas.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Idiomas soportados: no disponibles; no se puede garantizar cobertura multilingue.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero al no confirmarse la autoria oficial, la validez de la licencia sobre los pesos es incierta.
- Requisitos de hardware no documentados: no hay guia oficial de VRAM, latencia ni configuraciones recomendadas.
- Benchmarks incompletos: la tabla de la model card esta truncada en la informacion recibida, por lo que no se pueden verificar las afirmaciones de rendimiento.

## Enlaces

- Hugging Face: https://huggingface.co/Lakki8f9f/Qwen3.8-27B
- Qwen Cloud (referenciado en la model card): https://www.qwencloud.com
- Pagina del modelo en Qwen Cloud (referenciada): https://www.qwencloud.com/models/qwen3.8-27b

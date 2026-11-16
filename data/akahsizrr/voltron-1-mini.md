# Akahsizrr/voltron-1-mini

## Resumen

Voltron-1 Mini es un ajuste fino del modelo LFM3-1.7B de Liquid AI, publicado por el usuario Akahsizrr en Hugging Face. Se trata de un modelo de lenguaje de 1.728.801.536 parámetros (1,73B) que conserva la arquitectura híbrida del modelo base —convoluciones cortas con compuerta combinadas con atención de ventana deslizante y atención global—, así como su tokenizador de 128K entradas y su formato de chat. El objetivo declarado es servir como sustituto directo del LFM3-1.7B original, con pesos optimizados para generación de código, razonamiento matemático y seguimiento de instrucciones.

La relevancia del modelo reside en su tamaño reducido combinado con una ventana de contexto de 262.144 tokens, lo que lo sitúa en una categoría poco habitual: modelos de menos de 2B parámetros con contexto extremadamente largo. Según la model card, el ajuste mejora al base en tareas de código competitivo (LiveCodeBench pass@1 de 0,2011 a 0,2434), matemáticas (AIME2026 de 0,408 a 0,442) y conocimiento científico (GPQA Diamond de 0,4293 a 0,4646), con un ligero retroceso en seguimiento estricto de instrucciones (IFEval loose cae 2,2 puntos porcentuales).

El checkpoint se distribuye en safetensors BF16 con un tamaño de repositorio de 3,5 GB y licencia LFM Open License, la misma que el modelo base. El modelo emite bloques `<think>` cuando razona, lo que permite desactivar la traza de razonamiento en escenarios sensibles a la latencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: convoluciones cortas con compuerta + atención de ventana deslizante y atención global (LFM3) |
| Parámetros totales | 1.728.801.536 (1,73B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | BF16 en el checkpoint original; conversión a GGUF disponible vía llama.cpp (no se especifican otros formatos cuantizados publicados) |
| Idiomas soportados | Principalmente inglés; el multilingüismo refleja la distribución de entrenamiento del modelo base (no se detalla lista de idiomas) |
| Licencia | LFM Open License (categoría "other") |
| Formato de pesos | safetensors (BF16) |
| Capas | 24 |
| Tamaño oculto | 2.048 |
| Vocabulario | 128K (tokenizador compartido con LFM3) |
| Modelo base | LiquidAI/LFM3-1.7B |
| Tamaño del repositorio | 3,5 GB |

## Arquitectura y entrenamiento

Voltron-1 Mini hereda la arquitectura LFM3 de Liquid AI, un diseño híbrido que intercala convoluciones cortas con compuerta y mecanismos de atención (ventana deslizante más atención global) a lo largo de 24 capas, con un tamaño oculto de 2.048. Esta combinación busca reducir el coste computacional de la atención en contextos largos manteniendo la capacidad de modelado de dependencias globales, y es la razón por la que el modelo puede sostener una ventana de 262.144 tokens con solo 1,73B parámetros.

El autor no documenta en la información disponible el volumen de tokens de entrenamiento, la composición del dataset de ajuste ni los detalles del proceso de alineación. La model card menciona una actualización de preferencias (DPO) tras la evaluación principal: los resultados de AIME se midieron sobre el checkpoint pre-DPO y, según el autor, el cambio posterior quedó dentro del ruido estadístico. No se especifican innovaciones adicionales como decodificación especulativa o atención lineal más allá de las propias del diseño LFM3.

## Capacidades

- Generación de texto conversacional y de asistente general.
- Generación de código, con especial énfasis en problemas de estilo programación competitiva.
- Razonamiento matemático multi-paso.
- Razonamiento científico y respuesta a preguntas de nivel experto (evaluado en GPQA Diamond).
- Seguimiento de instrucciones con restricciones verificables.
- Modo de razonamiento con traza explícita: el modelo emite bloques `<think>` que pueden desactivarse mediante flags de la plantilla de chat para usos sensibles a la latencia.
- Capacidades multilingües limitadas, heredadas de la distribución del modelo base, con predominio del inglés.
- No se documenta soporte de tool calling, function calling, uso de agentes multi-paso, visión ni audio en la información disponible.

## Casos de uso

- Generación de código en entornos con recursos limitados: el modelo puede desplegarse en una sola GPU de consumo para autocompletado y generación de funciones, con un rendimiento en HumanEval pass@1 de 0,6707 que lo hace viable como asistente de programación local.
- Resolución de problemas de programación competitiva: su mejora de 4,2 puntos en LiveCodeBench pass@1 frente al base lo orienta a entornos de práctica y evaluación automática de algoritmos, donde el razonamiento multi-paso y el código convergen.
- Tutoría matemática interactiva: con 0,442 de precisión en AIME2026 y traza de razonamiento visible, puede emplearse para explicar resoluciones paso a paso en plataformas educativas, desactivando `<think>` cuando se priorice la latencia.
- Procesamiento de documentos largos: la ventana de 262.144 tokens permite resumir, extraer información o responder preguntas sobre contratos, informes o bases de código extensas sin fragmentación agresiva.
- Asistente de chat de propósito general en el borde: al poder convertirse a GGUF y ejecutarse con llama.cpp en CPU, encaja en despliegues de escritorio o dispositivos con recursos restringidos donde un modelo de 7B o superior no cabría.
- Evaluación comparativa de ajustes finos: sirve como referencia para investigadores que estudian el efecto del ajuste fino sobre modelos híbridos pequeños, ya que el autor publica los artefactos de evaluación por problema en el directorio `eval/` del repositorio.
- Filtrado y clasificación con contexto largo: la combinación de contexto extenso y bajo coste de inferencia permite clasificar o etiquetar lotes grandes de texto en pipelines de datos.

## Benchmarks y rendimiento

Resultados medidos por el autor con razonamiento activado, en una GPU clase H100 con vLLM en BF16, temperatura 0,6 y top-p 0,95. LiveCodeBench usa el split `test6` (175 problemas, pass@k sobre 5 muestras); AIME usa AIME-2026 (30 problemas × 4 muestras); HumanEval usa el conjunto completo de 164 problemas; GPQA usa el split Diamond de 198 preguntas.

| Benchmark | LFM3-1.7B (base) | Voltron-1 Mini | Delta |
|---|---|---|---|
| LiveCodeBench pass@1 | 0,2011 | 0,2434 | +4,2 pp |
| LiveCodeBench pass@5 | 0,2571 | 0,3257 | +6,9 pp |
| HumanEval pass@1 | 0,6402 | 0,6707 | +3,1 pp |
| AIME2026 accuracy | 0,408 | 0,442 | +3,4 pp |
| AIME2026 pass@any | 0,500 | 0,567 | +6,7 pp |
| IFEval strict | 0,7246 | 0,7209 | −0,4 pp |
| IFEval loose | 0,7782 | 0,7560 | −2,2 pp |
| GPQA Diamond | 0,4293 | 0,4646 | +3,5 pp |

El autor advierte que el error estándar de LiveCodeBench `test6` pass@1 es de aproximadamente ±2–3 pp con n=175×5, por lo que diferencias pequeñas entre checkpoints pueden ser ruido. También incluye puntuaciones de referencia de terceros (LFM2.5-2.6B y Qwen3-4B-Instruct-2507) obtenidas con harnesses distintos, que no son directamente comparables con el protocolo propio.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 3,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, unos 6–8 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: en torno a 2 GB para pesos; en 4 bits, cerca de 1 GB, más caché KV.
- GPU recomendadas: H100 o A100 para evaluación a gran escala y contextos muy largos; RTX 4090, RTX 3090 o RTX 4080 para inferencia BF16 cómoda.
- GPU de consumo: cabe en tarjetas con 8 GB o más en BF16 y en tarjetas con 4–6 GB usando cuantización GGUF; también es viable en CPU vía llama.cpp.
- Opciones de despliegue: vLLM (recomendado por el autor, con servidor compatible con la API de OpenAI), Transformers con `device_map="auto"` y dtype bfloat16, y llama.cpp tras conversión a GGUF con `convert_hf_to_gguf.py`.
- Latencia y throughput: no se publican cifras concretas de latencia o tokens por segundo en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas de rendimiento |
|---|---|---|---|---|---|
| Voltron-1 Mini | 1,73B | 262.144 | LFM Open License | Hugging Face (safetensors) | LiveCodeBench pass@1 0,2434; HumanEval 0,6707; GPQA 0,4646 (protocolo del autor) |
| LiquidAI/LFM3-1.7B | 1,73B | 262.144 | LFM Open License | Hugging Face | Base del anterior; LiveCodeBench pass@1 0,2011 en el mismo protocolo |
| LFM2.5-2.6B | 2,6B | No disponible | No disponible | Hugging Face | LiveCodeBench v6 59,4 (vendor); HumanEval+ 83,1; AIME 2025 51,9; IFEval 95,4; GPQA 55,8 (Artificial Analysis). Harness distinto, no comparable directamente |
| Qwen3-4B-Instruct-2507 | 4B | No disponible | No disponible | Hugging Face | LiveCodeBench v6 35,1 (vendor, ventana 25.02–25.05); HumanEval 77,6; AIME 2025 47,4; IFEval 83,4; GPQA 62,0. Harness distinto, no comparable directamente |

Las cifras de LFM2.5-2.6B y Qwen3-4B-Instruct-2507 proceden de proveedores y terceros con prompts, muestreo y harness diferentes, y el propio autor las presenta solo como referencia de escala. No existen resultados públicos de esos modelos con el protocolo exacto empleado para Voltron-1 Mini.

## Limitaciones y advertencias

- Tamaño reducido: con 1,73B parámetros, el rendimiento será inferior al de modelos de 7B o más en trabajo de conocimiento abierto, tareas agénticas de horizonte largo y dominios de nicho.
- Varianza de benchmarks: el error estándar de LiveCodeBench `test6` pass@1 es de ±2–3 pp, por lo que parte de la mejora reportada podría no ser estadísticamente significativa.
- Seguimiento de instrucciones: la puntuación IFEval loose cae unos 2 pp respecto al base, indicando que el ajuste orientado a razonamiento sacrifica algo de rigor en el formato.
- Idiomas: predominantemente inglés; el multilingüismo refleja la distribución del base y no se documenta una lista de idiomas soportados.
- Traza de razonamiento: el modelo emite bloques `<think>` que deben desactivarse explícitamente para usos sensibles a la latencia; ignorarlo puede inflar los tiempos de respuesta.
- Licencia: LFM Open License (categoría "other"), no una licencia OSI estándar; es imprescindible revisar sus términos antes de un uso comercial.
- Alucinación y sesgos: no se documentan análisis específicos de sesgo ni tasas de alucinación en la información disponible.
- Madurez del proyecto: el modelo tiene 2 descargas y 3 likes en el momento de la consulta, sin pipeline declarado ni resultados de terceros independientes; conviene tratarlo como un checkpoint de investigación.
- Soporte de herramientas y agentes: no se documenta tool calling ni razonamiento multi-paso agéntico, lo que limita su uso en pipelines que dependan de estas capacidades.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Akahsizrr/voltron-1-mini
- Modelo base LFM3-1.7B: https://huggingface.co/LiquidAI/LFM3-1.7B
- Artefactos de evaluación: directorio `eval/` dentro del repositorio del modelo (ficheros `eval/lcb_dpo_v10.json`, `eval/he_dpo_v10.json`, `eval/aime_gn_v10.json`, `eval/r6/`)
- Script de conversión a GGUF de llama.cpp: `convert_hf_to_gguf.py` en el repositorio de llama.cpp (no se proporciona URL directa en la información disponible)

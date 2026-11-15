# hugging-mac/d3-lite-CoreAI

## Resumen

D3 Lite Core AI es una conversión independiente del checkpoint vLLM Semantic Router D3 Lite (`vllm-sr/d3-lite`), publicada por el usuario `hugging-mac`. No se trata de un modelo generativo de propósito general, sino de un clasificador de decisión sin estado (*stateless*): recibe un estado textual (por ejemplo, el mensaje de un cliente) y un conjunto de preguntas con criterios candidatos, y devuelve en una única pasada forward las puntuaciones de hasta 255 candidatos definidos en `decision_config.json`. El pipeline declarado es `zero-shot-classification`.

La conversión utiliza los pesos de texto originales en BF16 y el *readout* de decisión en FP32, y se empaqueta como grafo para el runtime Apple Core AI, lo que la ata a hardware Apple Silicon. La capacidad es deliberadamente limitada: 512 tokens de prompt y batch size 1, sin soporte de imágenes ni vídeo. El repositorio ocupa 1,5 GB y el grafo pesa 1.510.776.860 bytes.

Su relevancia es acotada pero concreta: permite ejecutar en local, sobre un Mac, un enrutador de decisiones (por ejemplo, asignación de consultas a equipos o detección de intención en voz) sin depender de una API remota. La licencia Apache 2.0 facilita su integración, aunque la ausencia de métricas en dispositivos móviles reales limita las conclusiones sobre su viabilidad en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de `vllm-sr/d3-lite`; el autor solo indica que el grafo es stateless y calcula puntuaciones en una pasada forward) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se declara MoE) |
| Longitud de contexto | 512 tokens de prompt |
| Tipos de cuantizacion | no disponible (pesos BF16 y readout FP32 en origen; el artefacto es un grafo Core AI) |
| Idiomas soportados | no disponible (la verificación incluye un conjunto sintético bilingüe, sin especificar idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | grafo Apple Core AI (1.510.776.860 bytes), con `MODEL_MANIFEST.json`, `SHA256SUMS`, `requirements-lock.txt` y scripts de conversión/validación |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base `vllm-sr/d3-lite` más allá de su nombre y de que se trata de un checkpoint del proyecto vLLM Semantic Router. La conversión conserva los pesos de texto en BF16 y el *readout* de decisión en FP32, y genera un grafo sin estado que produce 255 logits de candidatos en el orden definido por `decision_config.json`. Las entradas son `input_ids` y `attention_mask` como int32 `[1, 512]`, y `position_ids` como int32 `[4, 1, 512]`, lo que sugiere un esquema de posiciones con cuatro componentes (posiblemente atención multidimensional o por cabezas), aunque el autor no lo detalla.

No hay información sobre el dataset de entrenamiento, el número de tokens, la composición de los datos ni sobre si se aplicaron técnicas de RLHF o DPO. La innovación técnica destacable es el propio proceso de conversión: el autor publica scripts reproducibles (`convert.py`, `validate.py`, `verify_coreai.swift`) y verifica la equivalencia frente al modelo original en PyTorch CPU, con una diferencia máxima de probabilidad de 0,015833 y coincidencia total en la elección top sobre 82 prompts sintéticos.

## Capacidades

- Clasificación zero-shot de un estado textual contra un conjunto de criterios candidatos definidos por el usuario.
- Enrutamiento de decisiones: asignación de una consulta a una categoría o equipo (el ejemplo de la model card enruta una incidencia de facturación frente a envío).
- Detección de intención en comandos de voz: el conjunto sintético de verificación cubre interrumpir, descartar, encolar y continuar escuchando.
- Salida de hasta 255 logits de candidatos en una sola pasada, con temperatura y softmax aplicados por el adaptador.
- Soporte bilingüe en el conjunto de verificación sintético (idiomas no especificados).
- Ejecución local en Apple Silicon mediante el runtime Apple Core AI, con adaptador Python y verificación nativa en Swift.
- No soporta tool calling, agentes multi-paso, generación de texto libre, visión ni audio; el adaptador rechaza explícitamente entradas con imágenes o vídeo.

## Casos de uso

- Enrutamiento de tickets de soporte: dado el texto de una incidencia, el modelo puntúa criterios como "facturación" o "envío" y permite asignar el ticket al equipo correcto en una sola inferencia de ~110 ms en un M5.
- Detección de intención en asistentes de voz: los casos sintéticos de interrumpir, descartar, encolar y continuar escuchando encajan con la lógica de un asistente conversacional que debe decidir la siguiente acción sin un LLM generativo.
- Clasificación de correos o mensajes entrantes: con 512 tokens de contexto cabe la mayoría de mensajes de cliente, y el formato de criterios configurables evita reentrenar el modelo para cada nueva taxonomía.
- Moderación o triaje previo: usar el modelo como primera etapa barata que descarta o etiqueta contenido antes de enviarlo a un modelo mayor, reduciendo coste y latencia.
- Enrutamiento semántico en pipelines de recuperación: decidir qué fuente de datos o herramienta consultar según la pregunta del usuario, aprovechando la salida de logits por candidato.
- Prototipado en local sobre Mac: al ejecutarse íntegramente en Apple Silicon con Core AI, permite iterar sobre criterios y plantillas sin depender de servicios en la nube ni de GPU dedicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card solo incluye verificaciones de equivalencia y latencia:

| Verificación | Resultado |
|---|---|
| Coincidencia de elección top frente a PyTorch CPU original | 82/82 prompts sintéticos |
| Diferencia máxima absoluta de probabilidad de candidato | 0,015833 |
| Prompts con elección top distinta | ninguno |
| Enrutamiento de voz sintético bilingüe a cuatro vías | 6/8 Core AI; 6/8 original |
| Smoke test nativo en Swift | superado, error máximo 0,000000 frente a Python Core AI |
| Runtime Mac | Apple M5, macOS 27.2.1 |
| Tiempo de carga en Mac | 88,465 s (incluye tokenizador y carga del grafo) |
| Inferencia repetida mediana en Mac | 109,60 ms (incluye tokenización y procesamiento de salida) |

## Requisitos de hardware

- VRAM: no aplica en el sentido habitual; el grafo ocupa 1.510.776.860 bytes (~1,5 GB) y se ejecuta en el runtime Apple Core AI sobre Apple Silicon.
- GPU recomendadas: no se especifican; el único hardware verificado es un Apple M5 con macOS 27.2.1.
- Cabe en hardware de consumo Apple Silicon (serie M), pero no hay datos de consumo de memoria ni de latencia en iPhone; el autor indica que la carga, memoria y latencia en iPhone físico "remain unmeasured".
- Opciones de despliegue: runtime Apple Core AI con el adaptador Python incluido (`coreai_d3.D3CoreAI`) y verificación nativa en Swift (`verify_coreai.swift`). No se mencionan vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia: 109,60 ms de mediana por inferencia en M5, incluyendo tokenización y postprocesado; carga inicial de 88,465 s.
- Batch size fijo de 1 y contexto fijo de 512 tokens; el adaptador rechaza entradas que excedan la capacidad.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (clasificadores de decisión empaquetados para Core AI) ni datos de rendimiento de alternativas. El único punto de referencia es el checkpoint original `vllm-sr/d3-lite`, del que esta release es una conversión con equivalencia verificada, no un competidor.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre, código ni razonamiento multi-paso; su única salida son logits sobre candidatos predefinidos.
- Contexto máximo de 512 tokens y batch size 1; el adaptador rechaza entradas que superen la capacidad.
- No admite imágenes ni vídeo; el adaptador lanza error ante ese tipo de entradas.
- Dependencia total del runtime Apple Core AI y de Apple Silicon; no hay ruta de despliegue documentada para GPU NVIDIA, CPU x86 u otros entornos.
- El conjunto de verificación es sintético y pequeño (82 prompts y 8 casos de voz); el propio autor lo califica de "small diagnostic set".
- Rendimiento en iPhone no medido: carga, memoria y latencia en dispositivo físico quedan sin cuantificar.
- No hay información sobre sesgos, riesgo de alucinación (limitado por ser clasificador, pero los criterios mal definidos pueden producir asignaciones erróneas) ni sobre el dataset de entrenamiento.
- Idiomas soportados no declarados; el soporte bilingüe solo está evidenciado de forma anecdótica en el conjunto sintético.
- Licencia Apache 2.0 permite uso comercial, pero se debe conservar el aviso de atribución (`NOTICE`) y verificar la licencia del checkpoint original `vllm-sr/d3-lite`.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación independiente por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hugging-mac/d3-lite-CoreAI
- Modelo base: https://huggingface.co/vllm-sr/d3-lite
- Revisión concreta del checkpoint original: https://huggingface.co/vllm-sr/d3-lite/tree/a8d25a91ef75552803f7009d25b7bd435991abd9

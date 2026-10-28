# LiquidAI/LFM3-1.7B-Base

## Resumen

LFM3-1.7B-Base es el checkpoint preentrenado (texto únicamente) que sirve de tronco a LFM3-1.7B, el modelo conversacional de la familia LFM3 de Liquid AI. Cuenta con 1.728.801.536 parámetros (1,73B) y una arquitectura tri-híbrida de 24 capas que combina 13 convoluciones cortas con compuerta, 5 capas de atención de ventana deslizante y 6 capas de atención global, con una ventana de contexto de 256K tokens y un vocabulario de 128.000 tokens.

El modelo se ha preentrenado sobre 22 billones (22T) de tokens. Los últimos 3,5T corresponden a una fase de mid-training con datos curados de mayor calidad, una mayor proporción de trazas agénticas y llamadas a herramientas, y la extensión del contexto hasta los 256K tokens. Respecto a LFM2, la mezcla incorpora más artículos científicos, código a nivel de repositorio, más fuentes de conocimiento y bastante más matemáticas.

Su relevancia actual es doble: por un lado, está diseñado para el edge (a 4 bits ocupa aproximadamente 1 GB, por lo que cabe en un teléfono o un portátil); por otro, se distribuye como base para especialización, es decir, como punto de partida para preentrenamiento continuado y post-entrenamiento propio. No es un modelo para usar directamente en chat: para conversación, tool calling y agentes, Liquid AI remite explícitamente a LFM3-1.7B. El repositorio es muy reciente (creado el 26 de octubre de 2026) y tiene una adopción todavía baja (15 descargas, 40 likes en el momento de la consulta).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tri-híbrida: 24 capas (13 convoluciones cortas con compuerta, 5 de atención de ventana deslizante, 6 de atención global) |
| Parametros totales | 1.728.801.536 (1,73B), dato real de safetensors |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 262.144 tokens (256K), entrada + salida |
| Tipos de cuantizacion | Pesos publicados en BF16; el autor indica ~1 GB de memoria a 4 bits. No se documentan en la información disponible ficheros GGUF, AWQ, GPTQ ni EXL2 oficiales |
| Idiomas soportados | 16: inglés, árabe, chino, francés, alemán, italiano, japonés, coreano, portugués, español, vietnamita, tailandés, indonesio, hindi, ruso y polaco |
| Licencia | LFM Open License v1.0 (identificador `lfm1.0`, etiquetada como `other` en HuggingFace) |
| Formato de pesos | safetensors en BF16; repositorio de 3,5 GB; requiere `trust_remote_code=True` (`custom_code`) |
| Vocabulario | 128.000 tokens |
| Tipo de checkpoint | Base preentrenado, solo texto, sin post-entrenamiento |

## Arquitectura y entrenamiento

La arquitectura es una híbrida de tres componentes sobre 24 capas: 13 capas de convolución corta con compuerta, 5 capas de atención con ventana deslizante y 6 capas de atención global. Este reparto implica que solo 11 de las 24 capas mantienen atención, lo que reduce el coste asociado al caché KV en contextos largos frente a un transformer de atención completa equivalente. El modelo comparte código de modelado con LFM3-1.7B y se carga en `transformers` con `trust_remote_code=True` y `dtype="bfloat16"`.

El preentrenamiento cubre 22T tokens. La fase final de 3,5T tokens es un mid-training sobre datos curados de mayor calidad que incorpora trazas agénticas y llamadas a herramientas diversas, y que además extiende la ventana de contexto hasta 256K tokens. En comparación con la generación LFM2, la mezcla de datos añade más artículos científicos, código a nivel de repositorio, un abanico más amplio de fuentes de conocimiento y un volumen notablemente superior de matemáticas. Al ser un checkpoint base, no consta que se hayan aplicado fases de RLHF o DPO: ese post-entrenamiento es el que da lugar a LFM3-1.7B. La model card no detalla la composición exacta del dataset ni el reparto por idioma.

## Capacidades

- Generación de texto por continuación de secuencia (next-token prediction): es su función nativa como modelo base, sin alineación conversacional.
- Razonamiento y conocimiento general adquiridos en el preentrenamiento, con refuerzo específico en matemáticas y literatura científica según la composición declarada de la mezcla.
- Generación de código, incluyendo código a nivel de repositorio, por la inclusión explícita de este tipo de datos en el corpus.
- Multilingüismo declarado en 16 idiomas, con español entre ellos.
- Ventana de contexto de 256K tokens (entrada más salida), ampliada durante el mid-training.
- Prioris agénticos latentes: el mid-training incluye trazas de agente y llamadas a herramientas, lo que facilita el post-entrenamiento posterior, pero no implica que el modelo base ejecute tool calling de forma fiable sin ajuste.
- No dispone de visión, audio ni modo "thinking" documentado; esas variantes corresponden a otros miembros de la familia LFM3 (vision, audio, omni, decision).
- No soporta instrucciones ni plantillas de chat de serie: no hay tokens especiales de rol ni formato de conversación publicado en la información disponible.

## Casos de uso

- Preentrenamiento continuado para dominio específico: el checkpoint está pensado como tronco sobre el que seguir entrenando con corpus propietarios (legal, sanitario, financiero), aprovechando que parte de un modelo ya expuesto a 22T tokens y a 256K de contexto.
- Asistente en un idioma concreto: ajuste fino supervisado sobre datos en español, catalán o portugués para obtener un modelo de 1,73B especializado, con la ventaja de que a 4 bits cabe en ~1 GB y puede desplegarse en local.
- Investigación en post-entrenamiento: banco de pruebas para probar recetas de SFT, DPO o RL sobre una arquitectura híbrida (convolución + atención) en lugar de un transformer puro, con un coste de cómputo contenido.
- Generación de código en pipelines internos: tras un ajuste fino con pares instrucción-respuesta, puede emplearse para autocompletado o generación de parches en un repositorio, apoyándose en los datos de código a nivel de repositorio vistos en el preentrenamiento.
- Modelo base para destilación: generar datos sintéticos o servir de profesor/alumno en procesos de destilación hacia modelos más pequeños de la familia (LFM2.5-230M, LFM2.5-350M) o hacia variantes cuantizadas.
- Procesamiento de documentos largos en el edge: resumen o extracción sobre entradas de hasta 256K tokens en un portátil, sin GPU dedicada, una vez aplicado el ajuste necesario para la tarea concreta.
- Base para experimentos de agentes: al haber visto trazas agénticas durante el mid-training, es un punto de partida razonable para investigar formatos de tool calling propios antes de fijar una plantilla definitiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Ni la model card ni los extractos del blog de Liquid AI consultados incluyen cifras de MMLU, HumanEval, GSM8K ni de evaluaciones de contexto largo para este checkpoint base.

| Benchmark | LFM3-1.7B-Base | Referencia comparable |
|---|---|---|
| MMLU | No disponible | No disponible |
| HumanEval | No disponible | No disponible |
| GSM8K | No disponible | No disponible |
| RULER / contexto largo | No disponible | No disponible |

## Requisitos de hardware

- Pesos en BF16: 1,73B × 2 bytes ≈ 3,5 GB, cifra coherente con el tamaño del repositorio (3,5 GB). Con caché de activaciones y overhead del runtime, el consumo real se sitúa típicamente en 4-5 GB de VRAM (estimación aritmética, no medida publicada).
- Pesos en FP32: ≈ 6,9 GB de VRAM (estimación).
- Cuantización a 8 bits: ≈ 1,7 GB para los pesos (estimación).
- Cuantización a 4 bits: ≈ 1 GB, cifra aportada por el autor; cabe en teléfonos y portátiles modernos.
- Caché KV: solo afecta a las 11 capas con atención (5 de ventana deslizante y 6 globales), no a las 13 convolucionales. El desglose de cabezas y dimensión por cabeza no está disponible, por lo que no se puede calcular el consumo exacto a 256K tokens.
- GPU recomendadas: cualquier GPU consumer con 6 GB o más permite inferencia en BF16 (RTX 3060 12 GB, RTX 4060 Ti, RTX 4090); en 4 bits basta una GPU integrada o incluso CPU. A100 y H100 son innecesarias para inferencia, aunque pueden tener sentido para preentrenamiento continuado o ajuste fino.
- Despliegue: la vía documentada es `transformers` con `AutoModelForCausalLM.from_pretrained(..., device_map="auto", dtype="bfloat16", trust_remote_code=True)`. No se confirma en la información disponible soporte oficial en vLLM, llama.cpp, Ollama ni TGI, ni la existencia de pesos GGUF; la dependencia de `custom_code` complica la portabilidad a otros runtimes.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-1.7B-Base | 1,73B | 256K | Base preentrenado, solo texto | LFM Open License v1.0 | HuggingFace (15 descargas, 40 likes) |
| LFM3-1.7B | 1,73B | 256K | Post-entrenado para chat, tool calling y agentes | LFM Open License v1.0 | HuggingFace |
| LFM2.5-1.2B-Instruct | ~1,2B (según denominación) | No disponible | Instruct de generación anterior | No disponible en la información consultada | HuggingFace |
| LFM2.5-1.2B-Thinking | ~1,2B (según denominación) | No disponible | Con modo de razonamiento | No disponible en la información consultada | HuggingFace |

La comparación con modelos de otros fabricantes en el rango de 1,5-2B (Qwen, Gemma, Llama) no está cubierta por la información proporcionada; no se dispone de datos verificados de parámetros, contexto ni rendimiento para incluirlos en la tabla.

## Limitaciones y advertencias

- Es un checkpoint base: no sigue instrucciones, no mantiene formato de chat y no debe usarse tal cual en producción conversacional. Liquid AI recomienda LFM3-1.7B para esos casos.
- El tool calling y el comportamiento agéntico son potenciales, no garantizados: el mid-training incluye trazas de herramientas, pero la fiabilidad solo se obtiene tras un post-entrenamiento específico.
- Riesgo de alucinación inherente a un modelo de 1,73B preentrenado, sin alineación ni filtros de seguridad aplicados.
- Sesgos desconocidos: la model card no publica análisis de sesgo, composición del dataset por idioma ni evaluaciones de seguridad.
- Calidad multilingüe desigual previsible: se declaran 16 idiomas, pero no hay evaluación por idioma que confirme un rendimiento homogéneo, especialmente en hindi, tailandés, vietnamita o indonesio.
- Contexto de 256K anunciado, pero sin resultados de RULER ni de otras pruebas de contexto largo; el rendimiento efectivo en ventanas muy extensas no está verificado.
- Licencia LFM Open License v1.0: los términos exactos (condiciones de uso comercial, umbrales de facturación, obligaciones de atribución) no se detallan en la información disponible; es imprescindible revisar el fichero LICENSE antes de un uso comercial.
- Dependencia de `trust_remote_code=True` y de código de modelado propio: implica revisar el código remoto y limita el soporte en herramientas de terceros.
- Adopción muy baja y release reciente (menos de un día entre creación y actualización en el momento de la consulta): no hay ecosistema de ajustes comunitarios, cuantizaciones ni recetas verificadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LiquidAI/LFM3-1.7B-Base
- Checkpoint post-entrenado de la misma familia: https://huggingface.co/LiquidAI/LFM3-1.7B
- Blog de presentación de LFM3: https://www.liquid.ai/blog/lfm3
- Documentación de LFM: https://docs.liquid.ai/lfm/getting-started/welcome
- Playground: https://playground.liquid.ai/
- Consola y API: https://console.liquid.ai/dashboard
- Colección de la familia LFM3: https://huggingface.co/collections/LiquidAI/lfm3
- Página de modelos de Liquid AI: https://www.liquid.ai/models
- Artículo de análisis: https://www.orcarouter.ai/blog/lfm3-1-7b-base-release
- Cobertura de Unite.AI: https://www.unite.ai/liquid-ai-launches-lfm3-family-of-six-open-weight-2b-class-models/

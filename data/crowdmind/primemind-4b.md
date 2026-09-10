# CrowdMind/PrimeMind-4B

## Resumen

PrimeMind-4B es un ajuste fino del modelo Qwen/Qwen3.5-4B, desarrollado por CrowdMind para producir patrones de razonamiento comprimidos y estructurados. Su principal aportación es la capacidad de generar un proceso de pensamiento compacto y denso en información mediante etiquetas `<think>`, reduciendo la verbosidad sin sacrificar la precisión en tareas de matemáticas y razonamiento.

El modelo utiliza una arquitectura híbrida Gated DeltaNet con capas de atención lineal y completa, y un mecanismo de mezcla de expertos (MoE). Según la ficha publicada, tiene 2.651.396.925 parámetros totales, aunque el autor indica aproximadamente 2.600 millones de parámetros activos. La ventana de contexto es de 262.144 tokens y la arquitectura incluye un codificador visual de 24 capas para entrada multimodal, si bien el ajuste fino se realizó únicamente sobre texto.

Su relevancia actual radica en la demostración de que un ajuste fino ligero con LoRA, entrenado en pocos cientos de pasos sobre un conjunto reducido de ejemplos de razonamiento, puede producir un comportamiento de "pensamiento tipo cavernícola" (caveman thinking), caracterizado por resolver problemas con explicaciones minimalistas. Esto resulta especialmente interesante para aplicaciones que necesitan razonamiento legible y de baja latencia, alejado de los largos monólogos internos de los modelos de razonamiento actuales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Gated DeltaNet + MoE, con capas de atención lineal y completa |
| Parametros totales | 2.651.396.925 (según safetensors) |
| Parametros activos | Aproximadamente 2.6B (según el autor; no se especifica el desglose exacto) |
| Longitud de contexto | 262.144 |
| Tipos de cuantizacion | NF4 (4-bit) según la model card; el repositorio también está etiquetado como 8-bit |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

PrimeMind-4B parte de Qwen/Qwen3.5-4B, que combina una arquitectura híbrida de Gated DeltaNet con atención lineal y completa en 32 capas ocultas, un tamaño oculto de 2.560 y un codificador visual de 24 capas para entrada multimodal. El ajuste fino se realizó mediante LoRA con rango 64 y alpha 128, sobre un conjunto de datos reducido formado por 2.326 ejemplos de razonamiento matemático y 638 ejemplos de razonamiento de navegación, todos en formato `<think>`. El entrenamiento duró 300 pasos con un tamaño de lote de 2, una tasa de aprendizaje de 2e-4 y cuantización 4-bit, ejecutándose en una RTX 4060 Ti de 16 GB en aproximadamente 25 minutos.

La innovación principal no está en la arquitectura base, sino en el ajuste por instrucciones dirigido a que el modelo genere patrones de pensamiento comprimidos. El objetivo es que el proceso de razonamiento sea explícito mediante las etiquetas `<think>` pero sin las cadenas extensas habituales. No se mencionan técnicas como RLHF o DPO; el método es exclusivamente SFT con LoRA.

## Capacidades

- Generación de texto con razonamiento explícito: el modelo antepone un bloque `<think>` antes de la respuesta final.
- Razonamiento matemático básico: entrenado con ejemplos sintéticos de operaciones aritméticas y problemas de razonamiento.
- Razonamiento de navegación: incluye ejemplos de razonamiento espacial para tareas de navegación y orientación.
- Respuestas concisas y estructuradas: el ajuste promueve menos verbosidad frente a la respuesta del modelo base.
- Entrada multimodal: la arquitectura base incorpora un codificador visual, pero no se entrenó con imágenes; la capacidad no está validada.
- Soporte de tool calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; el modelo solo está catalogado para inglés.

## Casos de uso

- Tutoría de matemáticas: el modelo puede resolver operaciones y problemas mostrando un razonamiento breve y legible, útil en aplicaciones educativas que quieren explicar el procedimiento sin saturar al estudiante.
- Asistente de razonamiento para agentes de navegación: gracias al entrenamiento en objectnav, puede integrarse en sistemas de control de robots que necesiten razonar sobre rutas y obstáculos de forma rápida.
- Chat de investigación con respuestas verificables: el formato `<think>` permite mostrar la deducción antes de concluir, facilitando el escrutinio humano en asistentes de consulta técnica.
- Generación de explicaciones técnicas condensadas: puede resumir decisiones de diseño o pasos de un procedimiento con un núcleo de razonamiento mínimo, útil en documentación de software.
- Aplicaciones de razonamiento con recursos limitados: al ser un modelo de ~2.6B casi completamente cuantizado, es adecuado para integrarse en dispositivos con GPU modesta o en despliegues locales.
- Prototipado en investigación sobre razonamiento comprimido: sirve como modelo de referencia para estudiar el impacto de la longitud del pensamiento en la precisión y la latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización 4-bit, el modelo necesita aproximadamente 1,5–2 GB para los pesos, más memoria para los activos de atención larga; se recomienda entre 8 y 12 GB para uso razonable.
- GPU recomendadas: RTX 4060 Ti (16 GB) fue usada para entrenar; para inferencia es suficiente una RTX 3060 de 12 GB o superior. Con 8 GB se puede ejecutar con secuencias cortas y contexto reducido.
- Despliegue en GPU de consumo: sí, es viable en tarjetas de gama media gracias al tamaño del modelo y al bajo coste del ajuste.
- Opciones de despliegue: se puede servir con HF Transformers, vLLM o TGI dado el formato safetensors; para CPU se podría convertir a GGUF, aunque no hay una versión publicada.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Parametro | PrimeMind-4B | Qwen3.5-4B (base) |
|---|---|---|
| Arquitectura | Gated DeltaNet + MoE | Gated DeltaNet + MoE |
| Parametros totales | 2.651.396.925 | No disponible |
| Parametros activos | ~2.6B | ~2.6B (según el base) |
| Longitud de contexto | 262.144 | 262.144 |
| Entrada multimodal | Codificador visual presente | Codificador visual presente |
| Razonamiento en `<think>` | Ajustado para pensamiento comprimido | No ajustado específicamente |
| Benchmarks | No publicados | No publicados |

No se dispone de otros modelos comparables en la información proporcionada. El único punto de comparación directa es el modelo base del que deriva, sin datos de rendimiento que permitan evaluar la diferencia real.

## Limitaciones y advertencias

- El ajuste se realizó solo con 300 pasos y aproximadamente 3.000 muestras, por lo que la generalización puede ser limitada.
- El entrenamiento fue exclusivamente de texto sobre un modelo multimodal; las imágenes se omitieron, así que la capacidad de visión no está validada.
- Puede producir razonamiento verbose en lugar del formato comprimido esperado, tal como se indica en la propia model card.
- No se documentan sesgos ni medidas de alineación; se recomienda evaluar el comportamiento antes de usar en producción.
- Riesgo de alucinación presente en cualquier modelo de lenguaje; el tamaño reducido y el entrenamiento limitado pueden agravar este riesgo.
- La licencia Apache 2.0 permite uso comercial, pero no hay garantías de rendimiento ni soporte del autor.

## Enlaces

- HuggingFace del modelo: [https://huggingface.co/CrowdMind/PrimeMind-4B](https://huggingface.co/CrowdMind/PrimeMind-4B)
- Modelo base Qwen3.5-4B: [https://huggingface.co/Qwen/Qwen3.5-4B](https://huggingface.co/Qwen/Qwen3.5-4B)

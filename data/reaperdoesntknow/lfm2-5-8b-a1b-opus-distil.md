# reaperdoesntknow/LFM2.5-8B-A1B-Opus-Distil

## Resumen

LFM2.5-8B-A1B-Opus-Distil es un checkpoint experimental de fine-tuning del modelo MoE híbrido LiquidAI/LFM2.5-8B-A1B, desarrollado por el usuario reaperdoesntknow sobre el dataset de razonamiento angrygiraffe/claude-opus-4.6-4.7-reasoning-8.7k. El objetivo declarado es probar si un backbone de Liquid Foundation Model puede adaptarse eficientemente mediante participación dispersa de parámetros (sparse participation) en lugar de una modificación completa del modelo, usando el optimizador propietario CIxOpt.

El modelo conserva la arquitectura del base: un Mixture-of-Experts con 8.470 millones de parámetros totales y aproximadamente 1.500 millones activos por forward, con ventana de contexto de 128K tokens. Está orientado a generación de texto en inglés con estilo de razonamiento tipo cadena de pensamiento. Su relevancia radica en ser un caso de estudio para técnicas de fine-tuning eficiente en modelos MoE de tamaño medio, con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrido (Liquid Foundation Model, causal LM) |
| Parametros totales | 8.467.856.832 (8,47B) |
| Parametros activos | ~1,5B (heredado del base LFM2.5-8B-A1B) |
| Longitud de contexto | 128K tokens (según documentación del base) |
| Tipos de cuantizacion | no disponible (repo solo contiene safetensors en bf16) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers, trust_remote_code) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base LFM2.5-8B-A1B de Liquid AI: un transformer causal con mezcla de expertos (MoE) que activa solo 1,5B de sus 8,47B parámetros por paso. El fine-tuning se realizó con el optimizador CIxOpt (Convergent Intelligence), que aplica enrutamiento heterogéneo según el tipo de parámetro: Lion-style para matrices de proyección grandes, AdamW para superficies de normalización, y Adamax para embeddings o cabezas de lenguaje. Se usó centralización de gradientes, filtrado por discrepancia, weight decay desacoplado y clipping.

La estrategia de entrenamiento fue de participación dispersa: se congeló la mayor parte del backbone preentrenado y se adaptaron selectivamente las capas superiores de proyección y normalización, con el objetivo de preservar el sustrato representacional inferior. El dataset de entrenamiento, angrygiraffe/claude-opus-4.6-4.7-reasoning-8.7k, se procesó en formato chat y se filtraron ejemplos vacíos o malformados. No se especifican número de épocas, tokens totales ni configuración exacta de hiperparámetros.

## Capacidades

- Generación de texto causal en inglés con respuestas de estilo razonado (reasoning-style).
- Instruction following básico, heredado del base y reforzado con datos de razonamiento.
- Soporte de tool calling y tareas agénticas, capacidad presente en el modelo base LFM2.5-8B-A1B según su documentación.
- Cadena de pensamiento (chain-of-thought) para problemas analíticos y explicaciones técnicas.
- Multilingüismo limitado: el fine-tuning se centra en inglés, aunque el base podría soportar más idiomas no verificados aquí.
- Compatible con endpoints de inferencia estándar (endpoints_compatible) y carga mediante transformers con trust_remote_code.

## Casos de uso

- Investigación sobre fine-tuning eficiente de MoE: permite estudiar cómo la adaptación dispersa de capas superiores afecta al razonamiento sin tocar el backbone completo.
- Generación de respuestas analíticas: adecuado para producir explicaciones estructuradas y detalladas en dominios técnicos, gracias a su entrenamiento en trazas de razonamiento.
- Compresión de trazas de razonamiento: puede resumir o condensar cadenas de pensamiento largas en formatos más breves.
- Explicación técnica de conceptos: útil para redactar documentación o tutoriales donde se requiera un tono razonado y pedagógico.
- Backbone experimental para agentes: su capacidad de tool calling y razonamiento multi-paso lo hace candidato para prototipos de agentes conversacionales en entornos controlados.
- Estudios de comportamiento de modelos pequeños: sirve como sujeto de pruebas para medir el impacto de la adaptación dirigida en la coherencia y la factualidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que el modelo no ha sido evaluado de forma completa en suites de seguridad, factualidad, codigo, matematicas o instruction-following. El modelo base LFM2.5-8B-A1B tiene benchmarks publicados por Liquid AI, pero este checkpoint fine-tuned no reporta metricas propias.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 33,9 GB en safetensors bf16, lo que sugiere ~16,9 GB de VRAM para inferencia en precision completa (dato de llm-explorer). Con cuantizacion a 4 bits podria reducirse a ~5-6 GB.
- GPU recomendadas: el modelo base esta disenado para ejecucion on-device, por lo que con cuantizacion puede caber en GPUs consumer como RTX 3090, RTX 4090 o incluso RTX 4070 Ti. Sin cuantizacion, una A100 o H100 seria mas comoda.
- Opciones de despliegue: compatible con transformers (trust_remote_code), vLLM, TGI (endpoints_compatible) y potencialmente llama.cpp/Ollama si se generan pesos GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| LFM2.5-8B-A1B (base) | 8,47B | ~1,5B | 128K | Apache 2.0 | Modelo original de Liquid AI, con benchmarks publicados |
| LFM2.5-8B-A1B-Opus-Distil (este) | 8,47B | ~1,5B | 128K | Apache 2.0 | Fine-tuning experimental sin benchmarks publicados |
| Qwen2.5-7B-A3B (referencia) | 7,6B | 3B | 128K | Apache 2.0 | MoE alternativo con mas parametros activos, benchmarks conocidos |

No se dispone de datos de rendimiento comparativo de este checkpoint frente a alternativas, por lo que la comparativa se limita a caracteristicas arquitectonicas y de licencia.

## Limitaciones y advertencias

- Es un checkpoint experimental: no ha sido sometido a evaluacion exhaustiva de seguridad, factualidad, codigo o matematicas.
- Riesgo elevado de alucinaciones en hechos, citas, fechas y atribuciones de fuentes.
- Puede heredar sesgos del modelo base y del dataset de fine-tuning (traza de razonamiento de Claude Opus).
- Tiende a sobreproducir explicaciones razonadas incluso cuando se piden respuestas cortas.
- Sensible al formato del prompt; cambios en la plantilla pueden degradar la calidad.
- La adaptacion dispersa puede dejar capacidades del base intactas y modificar otras de forma desigual, generando comportamientos impredecibles.
- No debe usarse como unico decisor en aplicaciones de alto riesgo (diagnostico medico, legal, financiero, emergencias, etc.).
- La licencia Apache 2.0 permite uso comercial, pero se recomienda validar independientemente cualquier salida antes de desplegarla en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/reaperdoesntknow/LFM2.5-8B-A1B-Opus-Distil
- Blog de Liquid AI sobre LFM2.5-8B-A1B: https://www.liquid.ai/blog/lfm2-5-8b-a1b
- Documentacion de Liquid AI para LFM2.5-8B-A1B: https://docs.liquid.ai/lfm/models/lfm25-8b-a1b
- Ficha en LLM Explorer: https://llm-explorer.com/model/reaperdoesntknow%2FLFM2.5-8B-A1B-Opus-Distil,66s15mBi4CmwGfiL8OeTfh

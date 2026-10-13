# LiquidAI/LFM2.5-24B-A2B-GGUF

## Resumen

LFM2.5-24B-A2B-GGUF es la distribución en formato GGUF del modelo LFM2.5-24B-A2B, desarrollado por Liquid AI. Se trata de un modelo de lenguaje de tipo mixture-of-experts (MoE) con 23.971.587.712 parámetros totales y aproximadamente 2.000 millones de parámetros activos por token (de ahí el sufijo A2B), pensado explícitamente para inferencia en dispositivo y en GPU única. La familia LFM2.5 se presenta en la model card como una nueva generación de modelos híbridos orientada a edge AI, con énfasis en calidad, velocidad y eficiencia de memoria.

Este repositorio concreto no contiene los pesos originales en safetensors, sino las conversiones GGUF para llama.cpp, con un tamaño total de 186,2 GB, lo que indica la presencia de múltiples niveles de cuantización en el mismo repositorio. Destaca el checkpoint QAD (Quantization-Aware Distillation) en Q4_0, entrenado específicamente para recuperar la precisión perdida por la cuantización a 4 bits, un detalle relevante para despliegues con memoria limitada.

Su relevancia actual radica en la combinación de un coste de inferencia propio de un modelo de 2B activos con la capacidad de conocimiento de un modelo de 24B, más el soporte multilingüe en diez idiomas (en, ar, zh, fr, de, ja, ko, es, pt, it). El modelo se distribuye bajo licencia lfm1.0 y, según el blog del fabricante, está orientado a agentes locales con razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo híbrido (familia LFM2, descrita como híbrida por Liquid AI); configuración MoE con 2B activos. Detalle de capas de atención y convolución no disponible |
| Parametros totales | 23.971.587.712 (~24B) |
| Parametros activos | ~2B por paso forward (denominación A2B); cifra exacta no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF; se documenta explícitamente Q4_0 (checkpoint QAD). El resto de niveles presentes en el repo (186,2 GB) no está detallado en la información disponible |
| Idiomas soportados | en, ar, zh, fr, de, ja, ko, es, pt, it (10 idiomas) |
| Licencia | lfm1.0 (etiquetada como license: other) |
| Formato de pesos | GGUF (llama.cpp) en este repositorio; el modelo base LiquidAI/LFM2.5-24B-A2B se distribuye en safetensors |

## Arquitectura y entrenamiento

La model card describe LFM2.5 como una generación de modelos híbridos de Liquid AI diseñada para edge AI y despliegue on-device. El repositorio corresponde a la variante MoE de 24B totales con 2B activos, la mayor de la compañía orientada a portátiles y aplicaciones de GPU única según su documentación. No se especifican en la información disponible el número de capas, el ratio de expertos, el mecanismo de enrutamiento ni el tipo exacto de capas híbridas empleadas.

En cuanto al entrenamiento, el único detalle técnico documentado es el proceso de Quantization-Aware Distillation (QAD) aplicado al checkpoint Q4_0, cuyo objetivo declarado es recuperar la precisión perdida por la cuantización de 4 bits. No hay datos disponibles sobre volumen de tokens de entrenamiento, composición del dataset, fases de ajuste (SFT, RLHF o DPO) ni sobre innovaciones adicionales como decodificación especulativa. El repositorio incluye los parámetros de muestreo recomendados del modelo base (temperatura 0.1, top-k 50, repeat-penalty 1.05) tanto en el `generation_config.json` como en los metadatos `general.sampling.*` de cada GGUF.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es text-generation con tag `conversational`.
- Razonamiento: el blog de Liquid AI describe LFM2.5-24B-A2B como un modelo de razonamiento (reasoning model) de pesos abiertos.
- Soporte multilingüe en diez idiomas: inglés, árabe, chino, francés, alemán, japonés, coreano, español, portugués e italiano.
- Orientación a agentes: el material promocional del fabricante lo posiciona para agentes locales ("on-device agents"), aunque no se detalla en la información disponible el soporte formal de tool calling o function calling.
- Compatibilidad con endpoints: el repositorio incluye el tag `endpoints_compatible`, lo que indica que puede servirse a través de la infraestructura de inferencia de Hugging Face.
- Ejecución en llama.cpp: integración directa mediante `llama-cli` y el flag `-hf`, con parámetros de muestreo embebidos en los metadatos del GGUF.
- Cuantización con recuperación de precisión: variante QAD Q4_0 entrenada para mitigar la degradación por cuantización agresiva.

## Casos de uso

- Agentes locales en portátil: al requerir solo ~2B parámetros activos por token, el modelo puede ejecutarse en un equipo de sobremesa o portátil con GPU de gama alta o memoria unificada, gestionando tareas de agente (planificación, llamadas a herramientas externas, resumen de resultados) sin enviar datos a la nube.
- Asistentes de escritorio con privacidad estricta: sectores como legal, sanitario o defensa pueden desplegar el modelo en local con la cuantización QAD Q4_0, evitando la exfiltración de datos sensibles a APIs externas.
- Atención al cliente multilingüe: al cubrir diez idiomas, incluyendo español, portugués, francés, alemán, árabe, chino, japonés y coreano, puede gestionar conversaciones multi-turno en mercados internacionales con un único despliegue.
- Generación y revisión de código en pipelines locales: integrable en entornos de desarrollo como asistente offline mediante llama.cpp u Ollama, útil en organizaciones que no permiten enviar código a servicios en la nube.
- Procesamiento de documentación técnica multilingüe: resumen, extracción de entidades y traducción asistida de manuales o contratos, aprovechando la cobertura idiomática y la naturaleza conversacional del modelo.
- Razonamiento en el borde para robótica o IoT con servidor local: al ser un MoE de 2B activos, un servidor con una sola GPU puede atender varias sesiones concurrentes, lo que permite desplegar razonamiento de nivel 24B en infraestructura modesta.
- Prototipado e investigación: la disponibilidad de GGUF con parámetros de muestreo embebidos facilita reproducir resultados con `llama-cli -hf` sin configuración adicional de plantillas de chat.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible (no hay valores de MMLU, HumanEval, GSM8K ni similares). El único dato comparativo aportado por el material de búsqueda es una afirmación del blog de Liquid AI según la cual LFM2.5-24B-A2B supera a Qwen3.6-35B-A3B en la evaluación denominada LiveClaw; no se proporcionan cifras ni metodología, por lo que debe tratarse como una afirmación del fabricante no verificada de forma independiente.

| Benchmark | Resultado | Fuente |
|---|---|---|
| MMLU, HumanEval, GSM8K y otros | no disponible | no disponible |
| LiveClaw | supera a Qwen3.6-35B-A3B (sin cifras) | blog de Liquid AI |

## Requisitos de hardware

- VRAM estimada para inferencia (estimaciones a partir de 23,97B parámetros totales; no confirmadas por el fabricante):
  - Q4_0 (QAD): ~13-14 GB.
  - Q5_K_M: ~16-17 GB.
  - Q6_K: ~19-20 GB.
  - Q8_0: ~25-26 GB.
  - FP16/BF16: ~48 GB.
- GPU recomendadas: RTX 4090 o RTX 3090 (24 GB) para Q4_0, Q5_K_M y Q6_K; A100 40 GB o H100 para Q8_0 y FP16; GPUs de 32 GB o más para Q8_0 con contexto amplio y caché KV.
- Cabe en GPU de consumo: sí, en tarjetas de 24 GB con cuantizaciones de 4 a 6 bits, y en equipos Apple Silicon con memoria unificada de 16-24 GB o superior (Q4_0). También es viable en CPU con llama.cpp, con throughput sensiblemente inferior.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama, LM Studio, Jan y otras interfaces compatibles con GGUF. Para vLLM o TGI sería necesario usar los pesos en safetensors del modelo base, no este repositorio GGUF.
- Latencia y throughput estimados: no disponible. Al tratarse de un MoE con ~2B parámetros activos, el coste por token es notablemente inferior al de un denso de 24B, pero no se han publicado cifras concretas de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM2.5-24B-A2B (este) | ~24B | ~2B | no disponible | lfm1.0 | GGUF en este repo; safetensors en el modelo base |
| LFM2-24B-A2B | 24B | 2B | no disponible | no disponible en la información proporcionada | Hugging Face (LiquidAI/LFM2-24B-A2B) |
| Qwen3.6-35B-A3B | 35B (según denominación) | 3B (según denominación) | no disponible | no disponible en la información proporcionada | mencionado solo como referencia comparativa en el blog de Liquid AI |

No se dispone de datos de benchmarks, contexto ni licencia de las alternativas en la información proporcionada, por lo que la comparación cuantitativa no es posible más allá de los parámetros y del resultado cualitativo en LiveClaw.

## Limitaciones y advertencias

- Riesgo de alucinación: no se han publicado evaluaciones de fiabilidad factual ni tasas de alucinación; como en cualquier modelo generativo, las salidas deben verificarse antes de usarse en producción.
- Sesgos: no hay información disponible sobre sesgos demográficos, culturales o lingüísticos, ni sobre los datos de entrenamiento que permitan evaluarlos.
- Contexto: la longitud de contexto no está documentada en la información disponible, lo que impide planificar despliegues que dependan de ventanas largas.
- Cobertura idiomática desigual: aunque se declaran diez idiomas, no se especifica el nivel de calidad por idioma; es probable que el rendimiento en árabe, coreano o japonés difiera del de inglés.
- Licencia: se distribuye bajo lfm1.0 (etiquetada como `other`). Las condiciones exactas de uso comercial, atribución y umbrales de facturación no están detalladas en la información proporcionada; es imprescindible revisar el archivo LICENSE antes de un despliegue comercial.
- Cuantización: los GGUF de 4 bits, aun con QAD, pueden degradar tareas sensibles a la precisión numérica; conviene validar con el checkpoint sin cuantizar antes de fijar una configuración.
- Adopción temprana: el repositorio acumula 71 descargas y 21 likes, y fue creado el 2026-10-09, por lo que existe poca validación independiente de su comportamiento en producción.
- Parámetros de muestreo: la model card recomienda temperatura 0.1, top-k 50 y repeat-penalty 1.05; usar valores muy distintos puede degradar la calidad de forma notable.

## Enlaces

- Repositorio GGUF: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B
- Modelo de la generación anterior: https://huggingface.co/LiquidAI/LFM2-24B-A2B
- Blog de presentación: https://www.liquid.ai/blog/lfm2-5-24b-a2b
- Documentación de modelos LFM: https://docs.liquid.ai/lfm/models/lfm2-24b-a2b
- Página de modelos de Liquid AI: https://www.liquid.ai/models
- Documentación general: https://docs.liquid.ai/lfm/getting-started/welcome
- Playground: https://playground.liquid.ai/
- Comunidad en Discord: https://discord.com/invite/liquid-ai
- llama.cpp: https://github.com/ggml-org/llama.cpp

# axom-ai/axomai-brain-progya-8b

## Resumen

Axom AI Brain - Progya 8B (প্ৰজ্ঞা ৮বি) es un modelo de lenguaje causal de 8.030 millones de parámetros desarrollado por Axom AI Research Team (Guwahati, Assam), orientado específicamente al asamés y a la región lingüística del noreste de la India. Se construye mediante ajuste fino supervisado sobre Meta-Llama-3.1-8B-Instruct, conservando su ventana de contexto nativa de 128.000 tokens y su arquitectura transformer densa con Grouped-Query Attention y activaciones SwiGLU.

El modelo se posiciona como una alternativa "soberana" frente a los modelos propietarios globales, argumentando que estos fragmentan el asamés en 4-8 tokens por palabra, generan errores ortográficos y contaminan la salida con vocabulario bengalí e hindi. Progya 8B afirma una tokenización nativa de 1-2 tokens por raíz léxica asamesa y un corpus de ajuste fino de 40,7 millones de registros ChatML (143,53 GB) con contenido histórico, literario, administrativo y jurídico de Assam.

Es relevante para equipos que necesiten procesamiento de asamés en entornos aislados (air-gapped), con despliegue local y sin dependencia de la nube, aunque su licencia propietaria restringe el uso comercial y no se han publicado resultados de benchmarks verificables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso basado en Llama-3.1-8B-Instruct, con Grouped-Query Attention (32 cabezas de consulta, 8 de clave-valor), SwiGLU y embeddings posicionales RoPE |
| Parametros totales | 8.030 millones (denso) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens nativos; 8.192 tokens en despliegue operativo recomendado |
| Tipos de cuantizacion | GGUF Q4_K_M (aproximadamente 4,85 GB); pesos de 16 bits en safetensors |
| Idiomas soportados | Asamés (as) e inglés (en) |
| Licencia | Axom AI Proprietary Sovereign Research License (propietaria, "other") |
| Formato de pesos | Safetensors (16 bits) y GGUF (Q4_K_M) |

## Arquitectura y entrenamiento

Progya 8B parte de Meta-Llama-3.1-8B-Instruct como modelo base y aplica un ajuste fino supervisado con QLoRA de 4 bits NormalFloat (NF4) con doble cuantización, en precisión bfloat16. No se documenta ninguna modificación estructural de la arquitectura subyacente: se mantienen las 32 cabezas de consulta y 8 de clave-valor propias del modelo original, junto con las activaciones SwiGLU y los embeddings posicionales RoPE.

El corpus de ajuste fino es el Axom AI Sovereign Assamese SFT Corpus, compuesto por 40.702.658 registros verificados en formato ChatML (143,53 GB), organizados en 88 lotes de expansión estructurados. La composición declarada abarca textos históricos (Buranjis y fortificaciones Ahom), literatura clásica vaishnava de Srimanta Sankardeva y sistemas de raga-tala de los Borgeet, circulares de gobernanza de 35 distritos, manuales de ingresos (Mission Basundhara, Dharitree), jurisprudencia del Tribunal Superior de Gauhati, economía de los jardines de té, sericultura (estándares de seda Muga y Eri) y agroecología rural. No se especifica si hubo fases de RLHF o DPO posteriores al SFT, ni el volumen total de tokens de entrenamiento más allá del recuento de registros.

## Capacidades

- Generación de texto en asamés e inglés con sintaxis y ortografía nativas declaradas, incluyendo distinción correcta entre 'ৰ' y 'ৱ'.
- Razonamiento y respuesta conversacional multi-turno en formato ChatML.
- Manejo de contenido histórico, literario, administrativo, jurídico y agroecológico específico de Assam.
- Comprensión y generación de expresiones idiomáticas asamesas (Fokora-Yojana).
- Procesamiento de contexto largo hasta 128.000 tokens en la arquitectura, con 8.192 tokens recomendados en despliegue.
- Ejecución en entornos aislados sin conexión a la nube.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión, audio o modo thinking: no disponibles.

## Casos de uso

- Resumen administrativo de circulares y manuales de ingresos: el modelo se ha ajustado sobre documentos de gobernanza de 35 distritos y manuales como Mission Basundhara y Dharitree, por lo que puede sintetizar normativa regional en asamés para funcionarios públicos.
- Asistencia jurídica en asamés: el corpus incluye jurisprudencia del Tribunal Superior de Gauhati y lenguaje estatutario regional, lo que permite generar borradores y resúmenes de documentación legal en la lengua local.
- Preservación cultural y literaria: con acceso a Buranjis, literatura vaishnava y Borgeet en el ajuste fino, puede transcribir, resumir y explicar textos clásicos asameses para proyectos de digitalización patrimonial.
- Atención al cliente en asamés: su tokenización nativa declarada (1-2 tokens por palabra frente a 4-8 de modelos occidentales) reduce la latencia y el coste por consulta en conversaciones multi-turno con clientes de la región.
- Despliegue air-gapped en instituciones públicas: al ejecutarse en local con GGUF Q4_K_M (~4,85 GB de RAM) o safetensors de 16 bits (~16 GB de VRAM), permite procesar datos ciudadanos confidenciales sin salir de la infraestructura estatal.
- Consultoría agroecológica y de sericultura: el corpus cubre economía del té, estándares de seda Muga y Eri y agroecología rural, lo que habilita asistentes técnicos para productores de la región.
- Investigación lingüística del asamés: útil para estudiar tokenización, ortografía y sintaxis nativa frente a modelos multilingües genéricos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada en safetensors de 16 bits: aproximadamente 16,0 GB (según la model card).
- VRAM estimada en GGUF Q4_K_M: aproximadamente 4,85 GB de RAM, apto para portátiles de consumo.
- GPU recomendadas: no se especifican modelos concretos; los 16 GB en bf16 encajan en una RTX 4090 (24 GB), A100 40/80 GB o H100. Para Q4_K_M basta una GPU de consumo con 6-8 GB de VRAM, o incluso CPU.
- Cabe en GPU de consumo: sí, en formato Q4_K_M en tarjetas de 8 GB o superiores; en 16 bits requiere 16 GB o más (RTX 4090, RTX A6000).
- Opciones de despliegue: Hugging Face Transformers con `device_map="auto"` (ejemplo oficial); llama.cpp u Ollama para GGUF; vLLM y TGI no se mencionan en la información disponible.
- Latencia y throughput: la model card afirma velocidades de generación sub-segundo y una ventaja de compresión de 2,9x a 3,5x frente a modelos occidentales, pero no se aportan mediciones concretas de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Axom AI Progya 8B | 8,03 B (denso) | 128.000 tokens (8.192 operativo) | as, en | Propietaria (Axom AI) | Hugging Face |
| Meta-Llama-3.1-8B-Instruct | 8,03 B (denso) | 128.000 tokens | Multilingüe (incluye en, no as nativo) | Llama 3.1 Community License | Hugging Face, amplia adopción |
| Modelos propietarios globales (GPT-4o, Gemini, Claude 3.5) | No disponible | No disponible | Multilingüe | Propietaria | API en la nube |

La comparación se limita a la arquitectura base y a las alternativas citadas por el propio autor. No hay datos de benchmarks que permitan comparar rendimiento real en asamés frente a Llama-3.1-8B-Instruct u otros modelos; la ventaja declarada se basa en argumentos de tokenización y composición del corpus, no en evaluaciones publicadas.

## Limitaciones y advertencias

- No se han publicado benchmarks ni evaluaciones independientes que respalden las afirmaciones de rendimiento y tokenización de la model card.
- Riesgo de alucinación inherente a un modelo de 8B ajustado por SFT; no se documenta ningún proceso de RLHF o DPO que lo mitigue.
- Sesgos potenciales derivados de un corpus centrado en Assam: sobrerrepresentación de perspectivas históricas, administrativas y culturales regionales, con cobertura limitada de otros dominios.
- Cobertura lingüística restringida a asamés e inglés; no se garantiza calidad en otras lenguas del noreste de la India.
- La ventana operativa recomendada es de 8.192 tokens, muy inferior a los 128.000 nativos; el rendimiento en contextos largos no está verificado.
- Licencia propietaria Axom AI Sovereign Research License: el uso comercial requiere revisión legal del archivo LICENSE; no es una licencia de código abierto.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta, sin comunidad ni soporte documentado.
- El campo `inference: false` en la model card indica que la inferencia alojada no está habilitada en Hugging Face.
- No se documentan capacidades de tool calling, agentes, visión ni audio, por lo que no debe asumirse su disponibilidad en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/axom-ai/axomai-brain-progya-8b
- Dataset de ajuste fino: https://huggingface.co/datasets/axom-ai/axomai-assamese-sft-corpus
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Licencia del modelo: https://huggingface.co/axom-ai/axomai-brain-progya-8b/blob/main/LICENSE

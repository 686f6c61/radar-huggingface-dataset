# mradermacher/vedic-astrology-14b-GGUF

## Resumen

vedic-astrology-14b-GGUF es la versión cuantizada en formato GGUF del modelo alokeshproy1964/vedic-astrology-14b, publicada por el usuario mradermacher, especializado en la generación de cuantizaciones listas para inferencia local. El modelo subyacente es un ajuste fino mediante QLoRA sobre Qwen2.5-14B-Instruct, orientado específicamente a lecturas de astrología védica (Jyotish), con una carta base de 14.770.033.664 parámetros en arquitectura transformer densa.

El problema que resuelve es acotado pero claro: ofrecer un modelo conversacional capaz de generar interpretaciones astrológicas dentro del marco del Jyotish, en lugar de depender de un modelo generalista que desconoce la terminología sánscrita y las reglas de la tradición. El autor original lo desplegó con vLLM y una interfaz Gradio, alimentado por un motor determinista de cálculo de cartas, de modo que el modelo se ocupa de la parte lingüística y no del cálculo astronómico.

La relevancia de esta publicación concreta es práctica: mradermacher convierte los pesos originales en cuantizaciones GGUF (desde Q2_K hasta Q8_0) que permiten ejecutar el modelo en hardware de consumo. El repositorio no tiene descargas ni valoraciones en el momento de redactar esta ficha, y la licencia no está declarada, lo que limita su uso comercial hasta que se aclare.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (fine-tune de Qwen2.5-14B-Instruct) |
| Parametros totales | 14.770.033.664 (14,77 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en el repositorio; el modelo base Qwen2.5-14B-Instruct declara 32.768 tokens nativos (ampliable a 131.072 con YaRN) |
| Tipos de cuantizacion | GGUF: Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q6_K, Q8_0; también se menciona f16 |
| Idiomas soportados | inglés (en) |
| Licencia | no disponible |
| Formato de pesos | GGUF (el modelo base se distribuye en safetensors) |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen2.5-14B-Instruct: un transformer decoder-only denso con atención por causalidad, normalización RMSNorm, activación SwiGLU y atención con query/key/value bias. Al tratarse de un ajuste fino, la estructura de capas y el tokenizador se heredan íntegramente del modelo base; lo que cambia es la distribución de los pesos tras el entrenamiento supervisado sobre el corpus astrológico.

El proceso de adaptación descrito es un QLoRA (cuantización de 4 bits del modelo base más adaptadores LoRA de rango bajo) gestionado con PEFT, seguido presumiblemente de una fusión de los adaptadores para producir los pesos completos. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron fases de RLHF o DPO posteriores. La model card del cuantizador tampoco documenta innovaciones técnicas adicionales, como decodificación especulativa o variantes de atención lineal, más allá del propio proceso de cuantización estática (quantize_version 2, output_tensor_quantised 1, convert_type hf).

## Capacidades

- Generación de texto conversacional en inglés, con especialización en terminología y estructura de la astrología védica (Jyotish).
- Interpretación de cartas astrales en el marco tradicional: planetas, casas, signos, nakshatras y aspectos, siempre que los datos de la carta le sean proporcionados por un motor externo.
- Explicación de conceptos como dashas, tránsitos y yogas dentro del vocabulario de la disciplina.
- Soporte de conversación multi-turno (etiqueta `conversational` en el repositorio).
- Compatibilidad declarada con `endpoints_compatible`, lo que facilita su exposición mediante APIs compatibles con el formato de Hugging Face.
- Capacidad de servir como base para ajustes finos adicionales, dado que el propio modelo se generó mediante QLoRA.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Generación automatizada de lecturas de carta natal: un motor determinista calcula posiciones planetarias y casas, y el modelo redacta la interpretación en lenguaje natural a partir de esos datos estructurados, evitando que el modelo tenga que calcular efemérides.
- Asistente conversacional para estudiantes de Jyotish: el modelo puede explicar terminología sánscrita y responder dudas conceptuales dentro del vocabulario tradicional, con la ventaja de estar ajustado sobre ese dominio concreto.
- Chatbot integrado en una web de astrología: la compatibilidad con endpoints permite desplegarlo tras una API y atender consultas de visitantes en tiempo real sobre sus cartas.
- Despliegue local y offline: al distribuirse en GGUF, puede ejecutarse con llama.cpp u Ollama en un portátil o equipo de sobremesa sin conexión, útil para consultas privadas donde no se quiere enviar datos personales de nacimiento a un servicio externo.
- Generación de contenido editorial: producción de textos explicativos sobre tránsitos, dashas o combinaciones planetarias para blogs, newsletters o aplicaciones móviles de astrología.
- Punto de partida para ajustes finos adicionales: al ser un modelo QLoRA ya fusionado, se puede reentrenar con PEFT para ampliar idiomas (por ejemplo, castellano) o adaptarlo a otras tradiciones astrológicas.
- Investigación sobre especialización de dominio: sirve como caso de estudio de cómo un ajuste fino de bajo rango sobre un modelo generalista de 14B modifica el registro lingüístico hacia un vocabulario técnico muy específico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (cifras orientativas a partir del tamaño de los ficheros, sin margen de contexto): Q2_K en torno a 6-7 GB; Q4_K_M en torno a 10 GB; Q6_K en torno a 13 GB; Q8_0 en torno a 17 GB; f16 en torno a 30-31 GB.
- GPU consumer compatibles: RTX 3060 de 12 GB para Q2_K y Q3_K_S con contexto corto; RTX 4070 Ti / 4080 de 16 GB para Q4_K_M y Q5_K_S; RTX 3090 y RTX 4090 de 24 GB para cualquier cuantización hasta Q8_0.
- GPU de centro de datos: A100 de 40 GB o 80 GB y H100 para servir los pesos originales en bf16/fp16 con vLLM, replicando la configuración del autor del modelo base.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio, llama-cpp-python) para los ficheros GGUF; vLLM y TGI si se parte de los safetensors originales.
- Latencia y throughput: no disponibles en la información proporcionada. Como referencia orientativa, un modelo denso de 14B en Q4_K_M sobre una RTX 4090 suele moverse en el rango de decenas de tokens por segundo, pero no hay mediciones publicadas para esta cuantización concreta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| vedic-astrology-14b-GGUF | 14,77 B (denso) | no disponible (base: 32.768) | no disponible | GGUF | Hugging Face |
| alokeshproy1964/vedic-astrology-14b (original) | 14,77 B (denso) | no disponible (base: 32.768) | no disponible | safetensors | Hugging Face |
| Qwen2.5-14B-Instruct (modelo base) | 14,77 B (denso) | 32.768 nativos / 131.072 con YaRN | Apache-2.0 | safetensors, GGUF | Hugging Face |
| Mistral-Nemo-Instruct-2407 | 12 B (denso) | 128.000 | Apache-2.0 | safetensors, GGUF | Hugging Face |

La comparación con el modelo base y con Mistral-Nemo es útil sobre todo para contextualizar tamaño y licencia: el ajuste astrológico no compite en benchmarks generalistas con esos modelos, sino en adecuación terminológica a un dominio muy concreto. Astral-14B (LucidityAI), otro modelo de temática astrológica cuantizado por el mismo autor, sería el comparable más cercano por nicho, pero no se dispone de sus especificaciones en la información proporcionada.

## Limitaciones y advertencias

- Dominio pseudocientífico: el modelo genera contenido astrológico que no tiene validez predictiva contrastada. No debe presentarse como asesoramiento médico, legal, financiero ni psicológico.
- Riesgo de alucinación alto en detalles técnicos: puede inventar combinaciones planetarias, nombres de yogas o interpretaciones que no corresponden a la carta proporcionada si los datos de entrada son ambiguos.
- Dependencia de un motor externo: el modelo no calcula posiciones astronómicas; sin un componente determinista que le suministre la carta, las respuestas serán inconsistentes.
- Idioma: el único idioma declarado es el inglés. El vocabulario sánscrito aparece transliterado, pero no hay soporte documentado para otros idiomas.
- Licencia no disponible: no se puede confirmar que el uso comercial esté permitido. Al derivar de Qwen2.5-14B-Instruct (Apache-2.0), la restricción, si existe, provendría de la licencia del ajuste fino, que no está publicada.
- Pérdida de calidad en cuantizaciones bajas: las variantes Q2_K y Q3_K degradan notablemente la coherencia; se recomienda Q4_K_M o superior para uso real. No se han publicado cuantizaciones ponderadas con imatrix para este modelo.
- Trazabilidad limitada: no se documentan el dataset de entrenamiento, el número de tokens ni el proceso de evaluación, lo que dificulta auditar sesgos o reproducir resultados.
- Metadatos poco fiables: el repositorio muestra cero descargas y una fecha de creación anómala, señales de que la publicación es reciente y no ha sido validada por la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/vedic-astrology-14b-GGUF
- Modelo base: https://huggingface.co/alokeshproy1964/vedic-astrology-14b
- Página de descargas del cuantizador para este modelo: https://hf.tst.eu/model#vedic-astrology-14b-GGUF
- Peticiones de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Referencia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de perplejidad por tipo de cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Modelo astrológico comparable cuantizado por el mismo autor: https://huggingface.co/mradermacher/Astral-14B-GGUF
- Qwen2.5-14B-Instruct (modelo base de la arquitectura): https://huggingface.co/Qwen/Qwen2.5-14B-Instruct

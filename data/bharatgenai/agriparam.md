# bharatgenai/AgriParam

## Resumen

AgriParam es un modelo de lenguaje especializado en dominio agrícola desarrollado por BharatGen, el consorcio indio de investigación en IA generativa. Se trata de un ajuste fino (fine-tuning) del modelo base Param-1-2.9B-Instruct, un transformer decoder-only de aproximadamente 2.860 millones de parámetros, orientado a tareas de generación de texto conversacional, respuesta a preguntas (QnA) y diálogo multiturno en el ámbito de la agricultura.

El modelo resuelve un problema concreto: la falta de asistentes de lenguaje adaptados al vocabulario, las prácticas y las necesidades informativas del sector agrícola, especialmente en el contexto indio. Al partir de un modelo instructivo ya entrenado, AgriParam hereda capacidades generales de razonamiento y conversación, y las especializa mediante ajuste fino en datos del dominio.

Es relevante por su carácter abierto (licencia Apache 2.0) y por su enfoque bilingüe inglés-hindi, lo que lo convierte en una opción práctica para aplicaciones de asistencia agrícola en la India. Su tamaño moderado (2,9B parámetros) permite su despliegue en infraestructuras de gama media, aunque el acceso al modelo está restringido (gated) y requiere aceptar condiciones en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (según modelo base Param-1-2.9B-Instruct) |
| Parametros totales | 2.860.664.832 (≈2,9B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors; cuantizaciones GGUF/AWQ no confirmadas) |
| Idiomas soportados | Inglés (en), hindi (hi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

AgriParam es un fine-tuning del modelo bharatgenai/Param-1-2.9B-Instruct, que a su vez es un transformer decoder-only de aproximadamente 2,9B parámetros. El modelo se distribuye en formato safetensors con código personalizado (custom_code) y se integra en la librería transformers con la pipeline text-generation. Los detalles concretos de la arquitectura interna (número de capas, dimensión oculta, cabezas de atención, tipo de atención) no están disponibles en la información proporcionada.

En cuanto al entrenamiento, AgriParam se ha ajustado sobre el modelo instructivo base para especializarlo en tareas conversacionales y de QnA del dominio agrícola. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF, DPO o ajuste supervisado (SFT) específicas. El modelo base Param-1-2.9B-Instruct ya incorpora capacidades instructivas, por lo que AgriParam se beneficia de ese entrenamiento previo. No se han documentado innovaciones técnicas destacables (decodificación especulativa, atención lineal, etc.) en la información disponible.

## Capacidades

- Generación de texto conversacional en inglés y hindi.
- Respuesta a preguntas (QnA) sobre temáticas agrícolas.
- Diálogo multiturno con mantenimiento de contexto conversacional.
- Capacidades instructivas heredadas del modelo base Param-1-2.9B-Instruct.
- Soporte bilingüe inglés-hindi.
- No se ha confirmado soporte de tool calling / function calling.
- No se ha confirmado soporte de agentes o razonamiento multi-paso explícito.
- No se ha confirmado capacidad de visión, audio ni modo "thinking".
- No se ha confirmado soporte de código o matemáticas avanzadas (aunque el modelo base podría tener capacidades generales).

## Casos de uso

- Asistencia agrícola conversacional: el modelo puede gestionar consultas de agricultores sobre prácticas de cultivo, plagas o fertilización en inglés y hindi, aprovechando su ajuste fino en dominio agrícola y su capacidad de diálogo multiturno.
- Respuesta a preguntas técnicas del sector: integrable en portales o chatbots de extensión agraria para resolver dudas frecuentes sobre variedades, riego o calendario de siembra, gracias a su especialización en QnA agrícola.
- Atención al cliente para empresas agroindustriales: puede atender consultas de productores y distribuidores en conversaciones multi-turno, con soporte bilingüe para el mercado indio.
- Asistente para técnicos y extensionistas agrícolas: herramienta de consulta rápida en campo, desplegable en infraestructura moderada por su tamaño de 2,9B parámetros.
- Generación de contenido divulgativo agrícola: redacción de fichas, guías y material formativo en inglés e hindi a partir de indicaciones del usuario.
- Prototipado de aplicaciones de IA agrícola: su licencia Apache 2.0 y su tamaño moderado facilitan la experimentación y el despliegue en proyectos de investigación y startups del sector.
- Educación y formación agraria: tutor conversacional para estudiantes de agricultura, con capacidad de mantener diálogos multi-turno sobre conceptos del dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 2,9B parámetros, en precisión FP16 se requieren aproximadamente 5,8 GB solo para los pesos; en cuantización de 8 bits, unos 3 GB; en 4 bits, alrededor de 1,5-2 GB (estimaciones teóricas, no confirmadas por el autor).
- GPU recomendadas: para FP16, GPU con 8-16 GB de VRAM (RTX 3060 12 GB, RTX 4070, RTX 4090, A10G, L4). Para cuantizaciones de 4-8 bits, GPU consumer de 4-8 GB podrían ser suficientes.
- Cabe en GPU consumer: sí, previsiblemente en RTX 3060 12 GB o superiores en FP16, y en GPU de 6-8 GB con cuantización (no confirmado oficialmente).
- Opciones de despliegue: transformers (librería nativa, con custom_code), y presumiblemente vLLM, TGI o llama.cpp si se generan conversiones GGUF (no confirmado). El modelo requiere aceptar condiciones en Hugging Face para su descarga.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Acceso |
|---|---|---|---|---|---|
| AgriParam | ≈2,9B | No disponible | en, hi | Apache 2.0 | Restringido (gated) |
| Param-1-2.9B-Instruct (base) | ≈2,9B | No disponible | en, hi (presumible) | No disponible en la información | No disponible |
| Modelos generalistas de ~3B (p. ej. familias tipo Llama, Qwen, Gemma) | 2-4B | Variable según modelo | Multilingüe | Variable | Público o gated |

No se dispone de datos de rendimiento comparativo entre AgriParam y alternativas, por lo que la comparación se limita a parámetros, licencia y disponibilidad. La principal ventaja diferencial de AgriParam es su especialización en dominio agrícola y su licencia Apache 2.0, frente a modelos generalistas que requerirían ajuste adicional para ese dominio.

## Limitaciones y advertencias

- Acceso restringido: el modelo es gated y requiere aceptar condiciones en Hugging Face antes de su descarga.
- Sesgos conocidos: no documentados explícitamente; al estar entrenado para el contexto agrícola indio, puede presentar sesgos geográficos y culturales hacia ese entorno.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar información agrícola incorrecta o inventada; en un dominio crítico como la agricultura, requiere validación por expertos antes de uso en producción.
- Limitaciones de idioma: solo se declaran inglés y hindi; el rendimiento en otros idiomas, incluido el español, no está garantizado.
- Limitaciones de contexto: la longitud de contexto no está disponible, lo que dificulta planificar aplicaciones con documentos largos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero deben revisarse las condiciones del modelo base Param-1-2.9B-Instruct y los términos de acceso gated.
- Caveat para producción: no hay benchmarks publicados que permitan evaluar su calidad frente a alternativas; se recomienda una evaluación propia antes de desplegarlo.
- El modelo depende de código personalizado (custom_code), lo que puede complicar la integración con herramientas estándar.

## Enlaces

- Hugging Face: https://huggingface.co/bharatgenai/AgriParam
- Modelo base: https://huggingface.co/bharatgenai/Param-1-2.9B-Instruct
- Organización BharatGen en Hugging Face: https://huggingface.co/bharatgenai

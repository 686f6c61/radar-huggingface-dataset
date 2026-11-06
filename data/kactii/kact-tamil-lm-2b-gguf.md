# kactii/kact-tamil-lm-2b-gguf

## Resumen

Kact Tamil LM 2B (GGUF) es un modelo de lenguaje especializado en tamil y tanglish, desarrollado por el usuario kactii y publicado bajo licencia Apache-2.0. Se trata de un ajuste fino mediante QLoRA del modelo base Qwen/Qwen3.5-2B, orientado a la preparación del examen NEET (National Eligibility cum Entrance Test, el examen de acceso a medicina en la India) y a temas de inteligencia artificial generativa. El modelo responde en el mismo registro lingüístico en que se le formula la pregunta: tamil puro, tamil mezclado con inglés o tanglish (tamil escrito con caracteres latinos).

El modelo cuenta con 1.881.825.088 parámetros (aproximadamente 1,88 mil millones) y se distribuye exclusivamente en formato GGUF con cuantización Q4_K_M, lo que permite su ejecución en CPU y en Apple Silicon mediante llama.cpp u Ollama. El repositorio ocupa 1,3 GB. Aunque el modelo base Qwen3.5-2B es de naturaleza visión-lenguaje, esta release es únicamente de texto.

Su relevancia radica en cubrir un nicho muy concreto y poco atendido por los modelos generalistas: la tutoría educativa en tamil y tanglish para estudiantes que preparan el NEET, con un tamaño lo suficientemente reducido como para desplegarse localmente sin GPU dedicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3.5-2B) |
| Parametros totales | 1.881.825.088 (~1,88 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | Tamil (ta), inglés (en), tanglish (code-mixed) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-2B, un transformer decoder-only de aproximadamente 1,88 mil millones de parámetros. Sobre esa base se aplicó un ajuste fino con QLoRA en precisión 4-bit NF4, con adaptadores LoRA sobre las proyecciones de atención y de las capas MLP. Posteriormente los adaptadores se fusionaron con el modelo base y el resultado se cuantizó a GGUF en formato Q4_K_M para inferencia local en CPU y Apple Silicon.

El conjunto de datos de entrenamiento consiste en pares pregunta-respuesta curados manualmente en tamil, tamil+inglés y tanglish, centrados en dos dominios: preparación del examen NEET y temas de IA generativa. La función de pérdida se calcula únicamente sobre los tokens del asistente, aplicando máscaras de generación sobre la plantilla ChatML (`{% generation %}`). El modelo utiliza la plantilla de chat ChatML (`<|im_start|>` / `<|im_end|>`) y un system prompt que define la persona y la regla de responder en el mismo estilo que la pregunta; el prompt exacto se incluye en el archivo `Modelfile` del repositorio.

## Capacidades

- Generación de texto conversacional en tamil, en tamil mezclado con inglés y en tanglish.
- Adaptación del registro lingüístico al estilo de la pregunta (script tamil puro, mixto o transliterado).
- Resolución de dudas sobre preparación del examen NEET (materias de ciencias biomédicas a nivel de acceso a medicina).
- Explicación de conceptos de IA generativa.
- Conversación multi-turno mediante plantilla ChatML.
- Capacidad declarada de rechazar preguntas fuera de sus dominios de especialización en lugar de inventar respuestas.
- No dispone de soporte de visión ni audio en esta release, pese a que el modelo base sea visión-lenguaje.
- No se documenta soporte de tool calling, function calling ni capacidades de agente.

## Casos de uso

- Tutoría de preparación del NEET en tamil: el modelo puede responder dudas de biología, química y física en el registro lingüístico del estudiante (tamil, mixto o tanglish), lo que reduce la barrera idiomática para alumnos que estudian en tamil pero manejan terminología científica en inglés.
- Asistente de estudio local sin conexión: al distribuirse como GGUF Q4_K_M de 1,3 GB, puede ejecutarse en portátiles sin GPU mediante llama.cpp u Ollama, útil en entornos con conectividad limitada o para estudiantes que quieren privacidad.
- Práctica de preguntas tipo test: el modelo puede formular y explicar preguntas de estilo NEET, sirviendo como banco de ejercicios interactivo en tamil o tanglish.
- Introducción a la IA generativa para público tamilófono: explicación de conceptos como LLM, prompts o ajuste fino en tamil y tanglish, con vocabulario adaptado a quienes no dominan la literatura técnica en inglés.
- Integración en aplicaciones educativas móviles: su tamaño reducido y su formato GGUF permiten empaquetarlo en apps de estudio o chatbots educativos desplegados en servidores modestos.
- Prototipado de asistentes multilingües code-mixed: sirve como referencia para desarrolladores que quieran experimentar con normalización de registro lingüístico (tamil/tanglish) en pipelines conversacionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF Q4_K_M ocupa aproximadamente 1,3 GB, por lo que la inferencia requiere del orden de 1,5-2 GB de memoria (RAM o VRAM) para el modelo más overhead de contexto.
- Cabe en CPU: es el caso de uso previsto según la model card (inferencia local en CPU y Apple Silicon).
- Cabe en GPU de consumo: cualquier GPU con 4 GB o más de VRAM puede alojarlo; tarjetas como RTX 3060, RTX 4060 o superiores son más que suficientes.
- GPU de datacenter (A100, H100) no necesarias para este tamaño; su uso solo tendría sentido para servir muchas réplicas concurrentes.
- Opciones de despliegue: llama.cpp (`llama-cli`), Ollama (el repositorio incluye un `Modelfile`), y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Kact Tamil LM 2B (GGUF) | ~1,88 B | No disponible | ta, en, tanglish | Apache-2.0 | GGUF (Q4_K_M) |
| Qwen/Qwen3.5-2B (base) | ~1,88 B | No disponible | Multilingüe (no detallado) | Apache-2.0 | Safetensors y otros |
| Modelos tamil generalistas de 1-3 B | No disponible | No disponible | ta, en | Variable | Variable |

La comparación directa con alternativas especializadas en tamil no está disponible en la información proporcionada. Frente a su modelo base, la diferencia principal es la especialización de dominio (NEET + IA generativa), el ajuste al registro code-mixed y la distribución en GGUF cuantizado para inferencia local.

## Limitaciones y advertencias

- Solo texto: no procesa imágenes ni audio, aunque el modelo base sea visión-lenguaje.
- El emparejamiento de estilo no es perfecto: una pregunta en tamil puro puede recibir una respuesta mixta o en tanglish, según reconoce el propio autor.
- Especialización estrecha: está entrenado para NEET e IA generativa; fuera de esos dominios se le instruye a decir que no sabe, lo que limita su uso como asistente general.
- Riesgo de alucinación en contenido educativo y científico: al ser un modelo de 1,88 B ajustado con QLoRA sobre un dataset curado, no debe usarse como fuente de verdad para contenido médico, legal o financiero; la model card lo desaconseja explícitamente para decisiones en esos ámbitos.
- Longitud de contexto no documentada, lo que impide planificar conversaciones largas o documentos extensos con garantías.
- Licencia Apache-2.0 permisiva para uso comercial, pero el autor advierte que debe verificarse que los términos de los datos de entrenamiento permitan la redistribución (sin fuentes restrictivas ni datos personales).
- Atribución requerida a Qwen como modelo base.
- Modelo con muy poca tracción (44 descargas, 0 likes en el momento de la consulta) y sin benchmarks publicados; no hay evidencia externa de calidad más allá de la model card.

## Enlaces

- Hugging Face: https://huggingface.co/kactii/kact-tamil-lm-2b-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B

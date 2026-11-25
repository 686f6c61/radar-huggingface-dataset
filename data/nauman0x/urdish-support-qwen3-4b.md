# Nauman0x/Urdish-Support-Qwen3-4B

## Resumen

Urdish Support Agent es un ajuste fino del modelo Qwen3-4B desarrollado por Nauman0x (Team Pixie) para el Qwen Local Hackathon 2026. El modelo está especializado en atención al cliente para pequeñas empresas paquistaníes: responde a los clientes en el mismo registro lingüístico en el que escriben (roman urdu, urdu en escritura árabe o inglés), apoyándose exclusivamente en la "policy card" de la empresa, y deriva a un agente humano cuando la política no cubre la consulta.

Técnicamente se trata de un transformer denso de 4.022.468.096 parámetros (4B), ajustado mediante QLoRA con Unsloth sobre el modelo base Qwen3-4B. El resultado se distribuye principalmente en formato GGUF cuantizado (q4_k_m de 2,5 GB recomendado, y q8_0), además de los pesos fusionados en 16 bits, con el objetivo explícito de ejecutarse en CPU. La licencia es Apache 2.0 y el modelo declara soporte para urdu e inglés, incluyendo el fenómeno del roman urdu (urdu transcrito con alfabeto latino), muy habitual en la comunicación digital en Pakistán.

Su relevancia radica en dos factores: por un lado, aborda un caso de uso de nicho escasamente cubierto por los modelos generalistas (soporte comercial multilingüe con mezcla de escrituras en un mismo turno de conversación); por otro, demuestra un flujo completo de ajuste eficiente (QLoRA + Unsloth + exportación GGUF para llama.cpp) sobre una base de 4B que cabe en hardware de consumo e incluso en CPU. El repositorio tiene un tamaño de 6,8 GB y, en el momento de la consulta, registra 0 descargas y 1 like.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3-4B) |
| Parametros totales | 4.022.468.096 (4B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF q4_k_m (2,5 GB, recomendado) y q8_0; pesos fusionados en 16 bits |
| Idiomas soportados | ur, en (incluye roman urdu) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) y safetensors (carpeta `merged/`, 16 bits) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B, un transformer denso de 4B parámetros, y se ajusta mediante QLoRA utilizando la librería Unsloth. No se especifica en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO; la model card únicamente indica que el ajuste se orientó a responder clientes usando exclusivamente la policy card del negocio y a derivar a una persona cuando la política no cubre la pregunta.

La innovación destacable no está en la arquitectura, sino en el pipeline de especialización: ajuste eficiente en 4 bits (QLoRA) sobre una base pequeña, fusión de adaptadores a 16 bits y exportación a GGUF para inferencia en CPU con llama.cpp. El modelo declara además compatibilidad con endpoints (`endpoints_compatible`) y naturaleza conversacional. No se detalla en la información proporcionada si se emplearon técnicas como decodificación especulativa o atención lineal; al derivar de Qwen3-4B, hereda las características arquitectónicas de dicho modelo base, que no se documentan aquí.

## Capacidades

- Generación de texto conversacional multi-turno orientada a atención al cliente.
- Respuesta en el mismo registro lingüístico del usuario: roman urdu, urdu en escritura árabe e inglés, potencialmente mezclados en un mismo turno.
- Cumplimiento estricto de una "policy card" del negocio como única fuente de verdad para las respuestas.
- Derivación (handoff) a un agente humano cuando la consulta queda fuera de la política definida.
- Ejecución en CPU mediante llama.cpp con el GGUF q4_k_m.
- Naturaleza conversacional declarada en los metadatos del repositorio.
- Soporte multilingüe limitado a urdu e inglés (con roman urdu).
- No se documentan en la información disponible capacidades de tool calling, function calling, razonamiento multi-paso, visión, audio ni modo de pensamiento explícito.

## Casos de uso

- Atención al cliente por chat en pequeños comercios paquistaníes: el modelo responde consultas de clientes en roman urdu, urdu o inglés usando la policy card del negocio como contexto, lo que permite desplegar un asistente sin infraestructura GPU.
- Automatización de respuestas en WhatsApp o mensajería instantánea: al ejecutarse en CPU con un GGUF de 2,5 GB, puede integrarse en un servidor modesto o en local para gestionar conversaciones de bajo volumen.
- Triaje y derivación a agentes humanos: cuando la pregunta excede la política definida, el modelo escala a una persona, lo que resulta adecuado para flujos híbridos bot-humano en negocios con recursos limitados.
- Soporte multilingüe con mezcla de escrituras: negocios cuyos clientes alternan roman urdu e inglés en el mismo mensaje se benefician de un modelo entrenado específicamente para ese registro, algo que los modelos generalistas no cubren bien.
- Despliegue en entornos con conectividad o presupuesto limitado: la inferencia local en CPU permite operar sin depender de APIs en la nube, relevante en regiones con infraestructura variable.
- Prototipado rápido de asistentes verticales: el pipeline QLoRA + Unsloth + GGUF documentado en el repositorio sirve como plantilla para adaptar Qwen3-4B a otros dominios de soporte con policy cards propias.
- Demostración educativa de ajuste eficiente: útil para investigadores y desarrolladores que quieran reproducir un flujo completo de fine-tuning de bajo coste sobre una base de 4B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica de forma estricta, ya que el modelo está pensado para CPU; en GPU, el GGUF q4_k_m (2,5 GB) requiere aproximadamente 3-4 GB de VRAM incluyendo overhead de contexto, y el q8_0 en torno a 5-6 GB.
- Pesos en 16 bits (carpeta `merged/`): aproximadamente 8 GB, lo que requiere una GPU con al menos 10-12 GB de VRAM para inferencia cómoda.
- GPU recomendadas: no especificadas en la información disponible; por tamaño, cabría en RTX 3060 12 GB, RTX 4070, RTX 4090, A100 o H100, aunque el autor no documenta pruebas en GPU.
- Cabe en GPU de consumo: sí, en modelos con 8 GB o más de VRAM usando q4_k_m o q8_0.
- Opciones de despliegue: llama.cpp (formato GGUF nativo, opción recomendada por el autor), y por extensión cualquier runtime compatible con GGUF; los pesos safetensors fusionados permiten otros stacks, aunque no se documentan en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Urdish-Support-Qwen3-4B | 4B | no disponible | ur, en (roman urdu) | Apache 2.0 | GGUF, safetensors | Especializado en soporte con policy card y handoff |
| Qwen/Qwen3-4B (base) | 4B | no disponible | multilingüe | Apache 2.0 | safetensors, GGUF | Modelo generalista; no especializado en roman urdu ni en soporte con policy card |
| Otros ajustes de soporte sobre bases de 3-4B | variable | variable | variable | variable | variable | No se dispone de datos concretos en la información proporcionada |

No se dispone de información sobre benchmarks comparativos ni de alternativas específicas equivalentes en la documentación facilitada.

## Limitaciones y advertencias

- El modelo está entrenado para responder únicamente a partir de la policy card del negocio; fuera de ese contexto su comportamiento no está garantizado y puede degradarse.
- Riesgo de alucinación: aunque el diseño busca ceñirse a la política, no se documentan mecanismos de verificación ni métricas de fidelidad que lo garanticen en producción.
- Cobertura lingüística limitada a urdu, roman urdu e inglés; no se declara soporte para otros idiomas.
- No se especifica la longitud de contexto soportada, lo que impide planificar conversaciones largas o policy cards extensas con garantías.
- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de calidad, fidelidad a la política ni tasa de derivación correcta.
- Repositorio con 0 descargas y 1 like en el momento de la consulta: ecosistema de validación mínimo, sin retroalimentación de la comunidad.
- Licencia Apache 2.0 permite uso comercial, pero el autor no documenta condiciones adicionales ni garantías; conviene revisar el repositorio de GitHub para detalles de datos y evaluación.
- No se documentan capacidades de tool calling ni de agentes; no debe asumirse su disponibilidad en producción.
- El rendimiento en CPU, aunque es el objetivo declarado, no está cuantificado (latencia ni throughput).

## Enlaces

- Hugging Face: https://huggingface.co/Nauman0x/Urdish-Support-Qwen3-4B
- Repositorio de código, datos y evaluación: https://github.com/Nauman0x/urdish-support-qwen
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B

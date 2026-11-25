# Nauman0x/Urdish-Support-Qwen3-1.7B

## Resumen

Urdish-Support-Qwen3-1.7B es un ajuste fino del modelo Qwen3-1.7B de Alibaba, desarrollado por Nauman0x (Team Pixie) en el marco del Qwen Local Hackathon 2026. El modelo está especializado en atención al cliente para pequeñas empresas paquistaníes y responde en el mismo registro lingüístico que emplea el usuario: urdu en escritura árabe, urdu romanizado (roman urdu) o inglés. Su propósito es operar exclusivamente con la "policy card" (tarjeta de políticas) del negocio y derivar a una persona cuando la consulta queda fuera de lo cubierto por dicha política.

Técnicamente se trata de un transformer denso de 1.720.574.976 parámetros (aproximadamente 1,7 mil millones), ajustado mediante QLoRA con Unsloth sobre el modelo base Qwen/Qwen3-1.7B, que conserva la licencia Apache 2.0. El repositorio distribuye pesos en formato GGUF (cuantizaciones Q4_K_M y Q8_0) y pesos fusionados en 16 bits, con un tamaño total de 1,1 GB en el caso de la variante recomendada. Está diseñado para ejecutarse en CPU, lo que lo sitúa en el rango de despliegue local sin GPU dedicada.

Su relevancia radica en el nicho: cubre la combinación de urdu, roman urdu e inglés en un mismo flujo conversacional, algo poco frecuente en modelos de soporte de pequeño tamaño, y lo empaqueta en un artefacto ejecutable con llama.cpp. No obstante, el modelo no cuenta con descargas ni valoraciones en el momento de la consulta, por lo que debe considerarse un artefacto experimental de hackathon más que un modelo con validación comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-1.7B) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (1,1 GB), Q8_0, pesos fusionados en 16 bits |
| Idiomas soportados | ur, en (incluye roman urdu) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF y safetensors (carpeta `merged/`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B, un transformer denso de la familia Qwen3, y se ajusta mediante QLoRA con la librería Unsloth. El ajuste es de tipo supervisado sobre datos de conversaciones de soporte al cliente, con el objetivo declarado de que el modelo responda únicamente a partir de la policy card del negocio y escale a un humano cuando la política no cubra la consulta. El autor no detalla en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO posteriores al ajuste supervisado.

La innovación principal no es arquitectónica sino de producto: el modelo se distribuye ya cuantizado en GGUF para llama.cpp y con pesos fusionados, de modo que puede ejecutarse en CPU sin infraestructura GPU. No se documentan en la información disponible técnicas como decodificación especulativa, atención lineal o modos de razonamiento extendido específicos de este ajuste.

## Capacidades

- Generación de texto conversacional en urdu (escritura árabe), roman urdu e inglés, adaptándose al registro del usuario.
- Respuesta anclada a una policy card de negocio: el modelo está entrenado para ceñirse a las políticas proporcionadas.
- Escalado a un agente humano cuando la consulta queda fuera de la política cubierta.
- Soporte de conversaciones multi-turno de atención al cliente.
- Ejecución en CPU mediante llama.cpp, sin requisito de GPU.
- Compatibilidad declarada con endpoints (tag `endpoints_compatible` en el repositorio).
- No se documentan en la información disponible capacidades de visión, audio, tool calling explícito ni modo de razonamiento extendido.

## Casos de uso

- Atención al cliente de pequeños comercios paquistaníes: el modelo gestiona consultas entrantes en el idioma en que escribe el cliente (urdu, roman urdu o inglés) y responde con base en la policy card del negocio, lo que reduce la necesidad de personal bilingüe.
- Gestión de consultas sobre políticas de devolución y envío: al estar entrenado para ceñirse a la tarjeta de políticas, puede responder preguntas recurrentes sobre plazos, condiciones y procedimientos sin improvisar.
- Triaje y derivación a humano: cuando la consulta excede lo cubierto por la política, el modelo está diseñado para escalar a una persona, lo que lo hace adecuado como primera línea de filtrado en un flujo híbrido.
- Despliegue en local sin GPU: al ejecutarse en CPU con llama.cpp y ocupar 1,1 GB en Q4_K_M, puede correr en un portátil o en un servidor pequeño de una tienda, sin coste de inferencia en la nube.
- Soporte por WhatsApp u otros canales de mensajería: el manejo de roman urdu encaja con el registro informal habitual en estos canales.
- Prototipado rápido de asistentes de soporte multilingües: sirve como base para experimentar con policy cards propias antes de invertir en un modelo mayor.
- Demostraciones y evaluación de ajuste fino: el repositorio incluye código, datos y evaluación en GitHub, lo que lo hace útil como referencia para reproducir el pipeline QLoRA con Unsloth.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU; en Q4_K_M el archivo pesa 1,1 GB y en Q8_0 algo más, por lo que la memoria RAM necesaria es del orden de 2 GB o superior según la variante y el contexto.
- GPU recomendadas: no aplica; el modelo está pensado para CPU. Cualquier GPU consumer (por ejemplo, RTX 3060 o superior) podría ejecutarlo con holgura, pero no es un requisito.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 2-4 GB de VRAM en las cuantizaciones indicadas.
- Opciones de despliegue: llama.cpp (formato GGUF nativo), así como cualquier runtime compatible con GGUF; el tag `endpoints_compatible` sugiere compatibilidad con endpoints gestionados.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Urdish-Support-Qwen3-1.7B | 1,72 B | no disponible | ur, en (roman urdu) | Apache 2.0 | GGUF, safetensors |
| Qwen/Qwen3-1.7B (base) | 1,72 B | no disponible en la información disponible | multilingüe (según modelo base) | Apache 2.0 | safetensors |
| Modelos de soporte ajustados de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa con alternativas especializadas en urdu y roman urdu no está disponible en la información proporcionada. El modelo base Qwen3-1.7B es la referencia natural: comparte arquitectura y licencia, pero no está especializado en soporte al cliente ni en el anclaje a policy cards.

## Limitaciones y advertencias

- Modelo de hackathon sin descargas ni valoraciones: no hay evidencia comunitaria de calidad ni de robustez en producción.
- Riesgo de alucinación: aunque está entrenado para ceñirse a la policy card, no se documentan métricas de fidelidad ni de tasa de derivación correcta a humano.
- Cobertura lingüística limitada a urdu, roman urdu e inglés; no se documenta soporte para otros idiomas.
- Longitud de contexto no documentada: no es posible planificar conversaciones largas sin verificar el límite real del modelo base y del ajuste.
- Sesgos: no se documentan evaluaciones de sesgo; al estar entrenado con datos de negocios paquistaníes concretos, puede reflejar sesgos de ese dominio.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene revisar la licencia del modelo base Qwen3-1.7B.
- Al ser un ajuste QLoRA sobre un modelo de 1,7 B, su capacidad de razonamiento complejo y de instrucciones largas es limitada en comparación con modelos de mayor tamaño.
- No se documentan mecanismos de seguridad, filtrado de contenido ni gestión de datos personales en el flujo de soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Nauman0x/Urdish-Support-Qwen3-1.7B
- Repositorio con código, datos y evaluación: https://github.com/Nauman0x/urdish-support-qwen
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B

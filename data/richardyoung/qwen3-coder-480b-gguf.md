# richardyoung/Qwen3-Coder-480B-GGUF

## Resumen

Qwen3-Coder-480B-A35B-Instruct es un modelo de lenguaje especializado en generación y razonamiento sobre código, desarrollado por Alibaba (equipo Qwen). Se trata de un transformer con arquitectura Mixture-of-Experts (MoE) de 480 mil millones de parámetros totales, de los cuales 35 mil millones se activan por token, lo que permite un rendimiento cercano a modelos propietarios de gran escala con un coste de inferencia mucho menor que el de un modelo denso equivalente. Su ventana de contexto nativa es de 256K tokens, extensible hasta 1M mediante YaRN, lo que lo sitúa en la gama alta para tareas de comprensión de repositorios completos.

El repositorio analizado, richardyoung/Qwen3-Coder-480B-GGUF, no contiene el modelo original sino una distribución de cuantizaciones GGUF del mismo, pensadas para su ejecución con llama.cpp y Ollama. El autor publica builds de 2, 3 y 4 bits (IQ2_XS, IQ3_M, IQ4_XS) con tamaños que oscilan entre 133 GB y 257 GB, lo que restringe seriamente su despliegue a hardware de gama muy alta o a sistemas con memoria unificada de gran capacidad. Es relevante ahora porque demuestra que modelos MoE de casi medio billón de parámetros pueden ejecutarse en local mediante cuantización agresiva, aunque con requisitos de memoria que siguen estando fuera del alcance del usuario doméstico típico.

La licencia Apache 2.0 del modelo base permite uso comercial sin restricciones adicionales, lo que convierte a esta familia en una alternativa abierta a soluciones propietarias de codificación asistida. No obstante, la ficha debe leerse con cautela: los pesos GGUF ya no se alojan en Hugging Face (fueron retirados el 13 de noviembre de 2026) y la información disponible sobre benchmarks proviene únicamente de afirmaciones de la model card, no de resultados verificables publicados en este repositorio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con Mixture-of-Experts (MoE) |
| Parámetros totales | 480B |
| Parámetros activos | 35B por token |
| Longitud de contexto | 256K nativo; extensible a 1M con YaRN |
| Tipos de cuantización | IQ2_XS (2 bits), IQ3_M (3 bits), IQ4_XS (4 bits); formato GGUF |
| Idiomas soportados | Inglés (según metadatos del repositorio) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); pesos originales en safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura Mixture-of-Experts: 480B parámetros totales con 35B activos por token, lo que reduce el coste computacional de inferencia respecto a un denso de tamaño comparable. La ventana de contexto nativa es de 256K tokens y puede extenderse a 1M mediante YaRN (Yet another RoPE extensioN), técnica de escalado de embeddings posicionales rotatorios. La model card del repositorio no detalla la composición del dataset de entrenamiento, el número de tokens vistos ni si se aplicaron fases de RLHF, DPO o aprendizaje por refuerzo específico para código y agentes; esa información no está disponible en la documentación proporcionada.

El repositorio en sí no aporta innovaciones arquitectónicas propias: es una distribución de cuantizaciones GGUF generadas a partir de los pesos originales, con créditos a bartowski como autor de la cuantización fuente. Las builds publicadas son IQ2_XS (133 GB, 4 partes), IQ3_M (218 GB, 6 partes) e IQ4_XS (257 GB, 7 partes); solo la IQ2_XS está efectivamente archivada y verificable mediante los hashes SHA-256 incluidos en la model card. Las builds de 3 y 4 bits figuran como "coming soon" en la documentación, aunque el aviso de retirada de ficheros sugiere que su disponibilidad es incierta.

## Capacidades

- Generación de código en múltiples lenguajes de programación, con especial énfasis en tareas complejas y de varios ficheros.
- Refactorización multi-fichero y diseño de arquitectura de software.
- Depuración y análisis estático de código.
- Uso de herramientas y function calling (tool use), orientado a flujos agénticos.
- Comprensión de código en contexto largo, gracias a la ventana de 256K tokens (ampliable a 1M con YaRN).
- Flujos de trabajo agénticos con planificación y ejecución multi-paso.
- Plantilla de chat basada en tokens especiales `<|im_start|>` y `<|im_end|>`, compatible con el ecosistema Qwen.
- Capacidad multilingüe limitada según los metadatos: el repositorio declara únicamente inglés (`language: en`), aunque el modelo base Qwen3-Coder es conocido por soportar más idiomas; no se dispone de confirmación en la documentación de este repositorio.

## Casos de uso

- Asistencia de codificación en IDE: el modelo puede integrarse en extensiones tipo Copilot para autocompletar y generar funciones completas, aprovechando sus 35B parámetros activos para mantener latencia contenida frente a un denso de 480B.
- Refactorización de repositorios completos: con 256K tokens de contexto nativo (y hasta 1M con YaRN) puede cargar varios ficheros simultáneamente y proponer cambios coherentes entre módulos, algo inviable en modelos con ventanas de 8K-32K.
- Agentes autónomos de resolución de issues: su soporte de tool calling y razonamiento multi-paso permite construir agentes que leen el repositorio, ejecutan tests y proponen parches en un pipeline de CI/CD.
- Generación de tests unitarios y de integración: dado un módulo, el modelo puede producir suites de pruebas y detectar casos límite, integrándose en flujos de revisión automatizada.
- Migración de código entre lenguajes o frameworks: la comprensión de contexto largo permite traducir bases de código extensas manteniendo coherencia semántica entre ficheros.
- Análisis y auditoría de código en local: para organizaciones con requisitos de soberanía de datos, la versión GGUF permite ejecutar el modelo en infraestructura propia sin enviar código a APIs externas, siempre que se disponga de ~150 GB de memoria para la cuantización IQ2_XS.
- Documentación técnica automatizada: generación de docstrings, READMEs y documentación de API a partir del código fuente en contexto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card afirma de forma cualitativa un rendimiento "a nivel de Claude Sonnet" en tareas de codificación complejas, pero no incluye cifras de MMLU, HumanEval, GSM8K, SWE-bench ni de ningún otro conjunto de evaluación, ni comparativas numéricas verificables. Cualquier cifra que se cite para este modelo debe obtenerse de la documentación oficial de Qwen para el modelo base, no de este repositorio.

## Requisitos de hardware

- VRAM/RAM estimada para IQ2_XS: ~150 GB mínimos, ~192 GB recomendados en memoria unificada (Apple M2/M3/M4 Ultra).
- VRAM/RAM estimada para IQ3_M: ~240 GB mínimos, 256 GB o más recomendados.
- VRAM/RAM estimada para IQ4_XS: ~280 GB mínimos, 320 GB o más recomendados.
- GPU recomendadas: no especificadas en la documentación. Por el volumen de memoria, el despliegue requiere múltiples aceleradores de gama profesional (A100 80 GB, H100 80 GB) o sistemas con memoria unificada de gran capacidad; un único RTX 4090 (24 GB) es insuficiente incluso para la cuantización de 2 bits.
- No cabe en GPU de consumo convencionales (RTX 4090, 3090, 4080). Solo es viable en configuraciones multi-GPU o en estaciones Apple Silicon con 192 GB o más de memoria unificada.
- Opciones de despliegue: llama.cpp y Ollama son los soportes documentados. vLLM y TGI no están mencionados en la model card para esta build GGUF (aunque el modelo base en safetensors sí puede servirse con ellos).
- Latencia y throughput: no disponibles en la documentación proporcionada. La arquitectura MoE con 35B activos sugiere un throughput superior al de un denso de 480B, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato disponible | Notas |
|---|---|---|---|---|---|
| Qwen3-Coder-480B-A35B-Instruct (este repo) | 480B totales / 35B activos | 256K (1M con YaRN) | Apache 2.0 | GGUF (cuantizado) | Especializado en código y agentes |
| Qwen3-Coder-480B-A35B-Instruct (original) | 480B totales / 35B activos | 256K (1M con YaRN) | Apache 2.0 | Safetensors | Pesos completos, requiere infraestructura de servicio |
| Modelos comparables de la misma categoría | no disponible | no disponible | no disponible | no disponible | La documentación no incluye comparativas con alternativas concretas |

No se dispone de datos verificables en la información proporcionada para establecer comparaciones cuantitativas con modelos alternativos de la misma categoría (por ejemplo, otros modelos de código MoE de escala similar). La única comparación posible es entre las distintas cuantizaciones del propio repositorio, recogida en la sección de requisitos de hardware.

## Limitaciones y advertencias

- Los ficheros GGUF ya no están alojados en Hugging Face: fueron retirados el 13 de noviembre de 2026 y el repositorio actúa solo como puntero. La descarga debe hacerse vía Ollama o solicitando el enlace en la sección de discusiones.
- Solo la cuantización IQ2_XS está efectivamente archivada y verificable por hash; las builds IQ3_M e IQ4_XS figuran como "coming soon" y su disponibilidad real no está confirmada.
- La cuantización a 2 bits (IQ2_XS) implica una degradación de calidad no cuantificada en la documentación; la model card la etiqueta como "Good" frente a "Better" (3 bits) y "Great" (4 bits), sin métricas que respalden esas etiquetas.
- Los metadatos del repositorio declaran únicamente inglés como idioma soportado; el rendimiento en castellano u otros idiomas no está documentado y podría ser inferior al del modelo base sin cuantizar.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en la generación de APIs inexistentes, imports incorrectos o dependencias inventadas; debe validarse siempre el código generado.
- Sesgos conocidos: no documentados en la model card. Al ser un modelo entrenado principalmente con datos de código y texto en inglés, puede reflejar sesgos de ese corpus.
- Restricciones de licencia: Apache 2.0 permite uso comercial y personal sin restricciones adicionales, pero conviene verificar la licencia del modelo base original y de los pesos cuantizados por terceros.
- Requisitos de hardware extremos: incluso la cuantización más pequeña necesita ~150 GB de memoria, lo que excluye su uso en estaciones de trabajo convencionales y limita el despliegue a infraestructura especializada.
- El repositorio tiene un mantenimiento mínimo (19 descargas, 0 likes en el momento de la consulta) y no es la fuente canónica de cuantizaciones; para producción conviene acudir al repositorio de bartowski o a las builds oficiales de Ollama.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/richardyoung/Qwen3-Coder-480B-GGUF
- Modelo base original: https://huggingface.co/Qwen/Qwen3-Coder-480B-A35B-Instruct
- Cuantizaciones GGUF de referencia (bartowski): https://huggingface.co/bartowski/Qwen_Qwen3-Coder-480B-A35B-Instruct-GGUF
- Distribución en Ollama: https://ollama.com/richardyoung/qwen3-coder/tags
- Perfil del autor (DeepNeuro): https://deepneuro.ai/richard
- Sitio del autor: https://deepneuro.ai

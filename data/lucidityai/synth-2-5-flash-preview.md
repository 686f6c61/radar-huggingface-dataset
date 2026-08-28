# LucidityAI/Synth-2.5-Flash-Preview

## Resumen

Synth 2.5 Flash Preview es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por LucidityAI, diseñado específicamente para tareas de escritura creativa y razonamiento híbrido. Se basa en la arquitectura Ling 3 Tiny, con 7.893.389.856 parámetros totales (aproximadamente 8B) y 1B parámetros activos por token, lo que lo hace especialmente eficiente en inferencia. Este modelo es una vista previa de la próxima versión de la familia Synth, entrenado mediante fine-tuning supervisado (SFT) sobre un conjunto de datos cerrado compuesto por interacciones creativas reales con modelos de última generación como Gemini, DeepSeek, GLM, Kimi, Minimax y StepFun.

La relevancia de este modelo radica en su enfoque en calidad creativa y su arquitectura eficiente, que permite ejecutarlo en hardware de consumo con un coste computacional reducido. Aunque se encuentra en fase de preview y aún no ha recibido el refinamiento por RLAIF (aprendizaje por refuerzo con feedback de IA), ya ofrece capacidades notables en generación de texto creativo y razonamiento opcional en profundidad. Está disponible en inglés y puede desplegarse localmente mediante llama.cpp o vLLM, además de probarse gratuitamente en la plataforma Composite de LucidityAI.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (basado en Ling 3 Tiny) |
| Parametros totales | 7.893.389.856 (aprox. 8B) |
| Parametros activos | 1B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se menciona compatibilidad con llama.cpp, lo que sugiere GGUF, pero no se especifica) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo principal); tambien se menciona uso con llama.cpp (GGUF) y vLLM |

## Arquitectura y entrenamiento

Synth 2.5 Flash Preview emplea una arquitectura MoE con 8B parámetros totales y 1B activos, basada en el modelo Ling 3 Tiny de InclusionAI. Esta configuración permite que solo una fracción de los parámetros se active durante cada token, reduciendo significativamente el coste computacional en inferencia. El modelo incorpora soporte de razonamiento híbrido, lo que permite activar opcionalmente un modo de razonamiento más profundo para tareas creativas complejas.

El entrenamiento se realizó mediante fine-tuning supervisado (SFT) puro, sin la etapa de RLAIF que se aplicará en la versión final. El dataset de entrenamiento es cerrado y contiene 3.254 interacciones creativas reales recopiladas de modelos de última generación, incluyendo 804 muestras de DeepSeek V4 Pro, 1.981 de GLM 5.X, 284 de Kimi k2.X, 69 de Minimax M3, 40 de StepFun y cantidades menores de Gemini, DeepSeek R1 y otros. Este enfoque busca capturar patrones de escritura creativa de alta calidad y preferencias de usuarios reales. Para la replicación, LucidityAI ha publicado datasets PIPKIN con datos cercanos al conjunto cerrado.

## Capacidades

- Generación de texto creativo: el modelo está optimizado para escritura literaria, narrativa, poesía y contenido con estilo, basándose en datos de interacciones reales con modelos SOTA.
- Razonamiento híbrido: soporta un modo de razonamiento opcional para profundizar en tareas creativas complejas, aunque en esta preview el rendimiento creativo es mejor en modo no-pensante.
- Conversación multi-turno: al ser un modelo de generación de texto, puede mantener diálogos coherentes y contextuales.
- Eficiencia computacional: gracias a su arquitectura MoE con 1B parámetros activos, ofrece inferencia rápida y bajo consumo de recursos.
- Compatibilidad con herramientas de despliegue: funciona con llama.cpp y vLLM (fork de InclusionAI para Ling 3), facilitando su integración en entornos locales y de producción.
- No se han documentado capacidades de tool calling, visión, audio u otras modalidades; el modelo es exclusivamente de texto.

## Casos de uso

- Escritura de ficción y narrativa: el modelo puede generar cuentos, novelas cortas o capítulos con estilo literario, aprovechando su entrenamiento en datos creativos reales. Es adecuado para autores que buscan un asistente de brainstorming o un generador de borradores.
- Redacción publicitaria y marketing: su capacidad para producir texto persuasivo y creativo lo hace útil para campañas publicitarias, eslóganes y contenido de marca, con la posibilidad de ajustar el tono mediante parámetros de generación.
- Guiones y diálogos: puede crear diálogos naturales para obras de teatro, cine o videojuegos, manteniendo coherencia entre personajes gracias a su contexto conversacional.
- Asistente de escritura técnica: aunque su foco es creativo, puede ayudar a redactar documentación, correos electrónicos o informes con un estilo más ameno, siempre que no se requiera un formato muy estricto.
- Generación de contenido para blogs y redes sociales: su eficiencia permite usarlo en pipelines de generación masiva de contenido, con la posibilidad de desplegarlo en local para control de costes.
- Prototipado rápido de aplicaciones conversacionales: al ser ligero (1B activos), puede integrarse en chatbots o asistentes virtuales en entornos con recursos limitados, como edge computing o dispositivos móviles, usando cuantización GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K, ni comparaciones cuantitativas con otros modelos. Se recomienda esperar a la versión final o consultar futuras publicaciones de LucidityAI.

## Requisitos de hardware

- VRAM estimada para inferencia: al tener 8B parámetros totales, se necesitan aproximadamente 16 GB en FP16 (sin cuantizar). Con cuantización de 4 bits, la memoria requerida se reduce a unos 4-5 GB, lo que permitiría ejecutarlo en GPUs de consumo con 8 GB de VRAM.
- GPUs recomendadas: para FP16, una RTX 3090, RTX 4090, A100 o similar. Con cuantización, una RTX 3060 de 12 GB o RTX 4060 de 8 GB podrían ser suficientes.
- Compatibilidad con consumer GPU: sí, especialmente con cuantización GGUF a través de llama.cpp.
- Opciones de despliegue: llama.cpp (versión 1.0.10481 o superior), vLLM (fork de InclusionAI para Ling 3), y plataformas como Composite de LucidityAI.
- Latencia y throughput: no se han publicado datos oficiales. Dado el bajo número de parámetros activos (1B), se espera una latencia reducida y un throughput alto en comparación con modelos densos de tamaño similar, pero estos valores dependen del hardware y la configuración.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de modelos comparables en la informacion disponible. La model card menciona mejoras sobre Synth 2, pero no ofrece especificaciones de ese modelo ni de alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo en preview: el rendimiento puede ser inferior al de la versión final, ya que no se ha aplicado RLAIF y el entrenamiento se limita a SFT.
- Limitaciones de formato: es incapaz de seguir prompts profundos que requieran un formato muy específico o estructurado, lo que puede ser problemático para tareas técnicas o de extracción de datos.
- Escritura no solicitada: usuarios han reportado que el modelo ocasionalmente escribe por el usuario, interrumpiendo el flujo de trabajo creativo.
- Contenido sensible: puede generar contenido dañino, ilegal o NSFW, por lo que se recomienda implementar una capa de moderación antes de su uso en producción.
- Idioma: solo soporta inglés, lo que limita su uso en entornos multilingües.
- Licencia no disponible: no se especifica la licencia, lo que genera incertidumbre sobre el uso comercial y la redistribución. Se recomienda contactar con LucidityAI antes de utilizarlo en proyectos comerciales.
- Datos de entrenamiento cerrados: el dataset exacto no es público, aunque se ofrecen datasets PIPKIN como aproximación, lo que puede dificultar la auditoría de sesgos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LucidityAI/Synth-2.5-Flash-Preview
- Colección Synth 2.5 Preview: https://huggingface.co/collections/LucidityAI/synth-25-preview
- Sitio web de LucidityAI: https://lucidityai.app/
- Página de investigación sobre creatividad: https://lucidity.sh/research/creative.html
- Fork de vLLM para Ling 3: https://github.com/inclusionAI/vllm-ling-v3
- PR de llama.cpp para soporte: https://github.com/Start9Labs/llama-cpp-startos/pull/25
- Datasets PIPKIN: https://huggingface.co/datasets/LucidityAI/PIPKIN-Creative-174k

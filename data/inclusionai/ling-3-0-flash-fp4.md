# inclusionAI/Ling-3.0-flash-fp4

## Resumen

Ling-3.0-flash es un modelo de razonamiento híbrido nativo desarrollado por inclusionAI, la división de inteligencia artificial de Ant Group. Se presenta como la siguiente generación de su serie Ling, con una arquitectura híbrida lineal tipo MoE que combina atención lineal Kimi Delta Attention (KDA) y atención Multi-head Latent Attention (MLA) en una proporción 5:1. Con 124 000 millones de parámetros totales y solo 5 100 millones activos por token, el modelo está diseñado para ofrecer un equilibrio entre rendimiento, eficiencia computacional y despliegue en producción, superando según sus creadores a modelos de mayor tamaño en tareas de razonamiento, código y agente.

El checkpoint `Ling-3.0-flash-fp4` es una versión cuantizada en precisión fp4 (4 bits) del modelo original, con un peso de aproximadamente 70,4 GB y 65 578 478 560 parámetros contabilizados en los safetensors. Esta cuantización permite ejecutar el modelo en hardware con menor capacidad de VRAM, manteniendo un rendimiento cercano al original. El modelo soporta una ventana de contexto nativa de 256 000 tokens, extensible hasta 1 000 000, y está disponible bajo licencia MIT, lo que facilita su uso comercial y su integración en flujos de trabajo agénticos complejos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hybrid-linear MoE (KDA + MLA, 5:1) |
| Parametros totales | 124B (declarado por el autor); 65 578 478 560 en el checkpoint fp4 |
| Parametros activos | 5,1B |
| Longitud de contexto | 256K nativa, extensible a 1M |
| Tipos de cuantizacion | fp4 (este checkpoint), fp8 (referenciado en tags), otras no especificadas |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Ling-3.0-flash emplea una arquitectura híbrida lineal desde el inicio del preentrenamiento, combinando 35 capas de Kimi Delta Attention (KDA) con 7 capas de Gated MLA, en una proporción alternada 5:1. La KDA incorpora un gating diagonal de grano fino y un MoE disperso con factor 1/64: 512 expertos enrutados, 1 experto compartido y 8 expertos activos por token. El tamaño oculto es de 2560, con un tamaño intermedio de experto de 768 y un tamaño intermedio denso de 6144. El vocabulario alcanza 157 184 tokens. Esta combinación busca maximizar la eficiencia en contexto largo y reducir el coste computacional frente a arquitecturas transformer densas.

El entrenamiento sigue un programa de contexto progresivo: 8K, luego 32K y finalmente 256K tokens. La model card no detalla el volumen total de datos de entrenamiento ni la composición del dataset, pero sí menciona la integración de más de 10 000 entornos de entrenamiento interactivos orientados a tareas agénticas (codificación, uso general y deep research). El modelo integra de forma nativa la arquitectura de caché jerárquica SGLang HiCache + Mooncake, con doble pool físico y caché L3 compartida a nivel de clúster, lo que reduce la recomputación en interacciones largas y disminuye el tiempo hasta el primer token (TTFT) entre un 60 % y más del 80 % en escenarios de entrada larga. No se menciona explícitamente el uso de RLHF o DPO, aunque el modo de razonamiento (thinking) está habilitado por defecto.

## Capacidades

- Razonamiento y pensamiento profundo: modo thinking activado por defecto, con parámetros por defecto `temperature=0.6, top_p=0.95, top_k=20`.
- Generación de código y resolución de tareas de ingeniería de software: evaluado en SWE-Bench Pro, SWE-Bench Multilingual y AntSWEBench (cubre Java, JavaScript y Python, incluyendo nuevas funcionalidades, corrección de bugs y refactorización).
- Capacidades agénticas de extremo a extremo: soporta flujos de trabajo de agente en codificación, tareas generales y deep research, con integración probada en frameworks como Claude Code, Kilo Code, Qwen Code, Hermes Agent y OpenClaw.
- Tool calling y function calling: capacidad implícita en los benchmarks de agente (MCP-Atlas, SkillsBench) y en la integración con entornos interactivos.
- Razonamiento multi-step y seguimiento de instrucciones complejas: validado en benchmarks como Tau3-banking-AA y GDPval v2-AA.
- Comprensión de contexto largo: ventana nativa de 256K tokens, extensible a 1M, adecuada para documentos extensos y conversaciones multi-turno.
- Conocimiento general y razonamiento matemático: la model card menciona un rendimiento sólido en estas áreas, aunque no proporciona cifras concretas.
- Capacidades multilingües: no se especifican idiomas soportados en la información disponible.

## Casos de uso

- Agente de codificación autónomo: el modelo puede integrarse en herramientas como Claude Code o Kilo Code para resolver issues de repositorios, generar parches y ejecutar tareas de refactorización, gracias a su ventana de 256K tokens que permite procesar el contexto completo de un proyecto.
- Atención al cliente automatizada con razonamiento: gracias a su capacidad de razonamiento y seguimiento de instrucciones, puede gestionar conversaciones multi-turno complejas en banca o seguros, como se refleja en el benchmark Tau3-banking-AA, donde actúa como agente conversacional con simulador de usuario.
- Deep research y síntesis de información: con su contexto largo y modo thinking, puede recopilar, analizar y sintetizar información de múltiples fuentes en informes estructurados, útil para análisis de mercado o investigación académica.
- Generación de aplicaciones web interactivas: el benchmark MiniAppBench evalúa su capacidad para convertir una petición de usuario en una aplicación HTML completa y funcional, lo que lo hace adecuado para prototipado rápido y generación de frontends.
- Automatización de flujos de trabajo con herramientas externas: su integración con MCP-Atlas y SkillsBench demuestra que puede manejar llamadas a APIs y herramientas externas, permitiendo construir asistentes que interactúan con servicios de terceros.
- Despliegue en producción con caché jerárquica: la integración con SGLang HiCache + Mooncake lo hace idóneo para entornos de producción con alta concurrencia y sesiones largas, donde la reducción del TTFT en entradas largas mejora la experiencia del usuario.
- Asistente de programación en IDE: puede incrustarse en editores para autocompletado, explicación de código y generación de tests, aprovechando su capacidad de razonamiento y su bajo coste por token activo (5,1B).

## Benchmarks y rendimiento

La model card menciona resultados en múltiples benchmarks, pero no proporciona valores numéricos en el texto extraído. Se indica que el modelo rinde fuertemente en SWE-Bench Pro, SWE-Bench Multilingual, Tau3-banking-AA, MCP-Atlas y SkillsBench, así como en tareas de conocimiento general, razonamiento matemático, seguimiento de instrucciones y comprensión de contexto largo. Sin embargo, no se han publicado cifras concretas en la información disponible. Se recomienda consultar la documentación oficial o los repositorios del autor para obtener tablas de resultados detalladas.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint fp4 ocupa aproximadamente 70,4 GB, por lo que se necesita al menos una GPU con 80 GB de VRAM (por ejemplo, A100 80GB, H100 80GB o H200) para cargar el modelo completo. Con cuantización adicional (por ejemplo, GGUF Q4_K_M) podría caber en GPUs de 48 GB, aunque no se proporcionan archivos GGUF oficiales en la información disponible.
- GPU recomendadas: A100 80GB, H100, H200, o configuraciones multi-GPU para mayor throughput.
- En consumer GPU: no es viable en GPUs de consumo actuales (RTX 4090 con 24 GB, etc.) sin una cuantización agresiva que degrade el rendimiento, dado el tamaño del checkpoint.
- Opciones de despliegue: SGLang (con soporte nativo de HiCache + Mooncake), vLLM, TGI, y potencialmente llama.cpp si se convierten los pesos a GGUF. También está disponible a través de OpenRouter y DeepInfra como API gestionada.
- Latencia y throughput: no se proporcionan cifras concretas, pero el autor afirma una reducción del TTFT del 60 % al 80 % en escenarios de entrada larga gracias a la caché jerárquica.

## Comparativa con modelos similares

No se dispone de datos comparativos detallados en la información proporcionada. El modelo se posiciona frente a su predecesor Ring-2.6-1T (1 billón de parámetros) y contra modelos de la competencia como los de la serie DeepSeek o Qwen, pero no se incluyen cifras de comparación en la model card. A modo de referencia general, Ling-3.0-flash activa solo 5,1B parámetros por token, frente a los 37B de DeepSeek-V3 o los 22B de Qwen3-235B-A22B, lo que sugiere un coste computacional por token significativamente menor, aunque la comparación directa de rendimiento no está disponible.

## Limitaciones y advertencias

- No se han publicado estudios de sesgos ni evaluaciones de seguridad específicas para este modelo en la información disponible.
- Riesgo de alucinación inherente a los modelos generativos; se recomienda validar las salidas en aplicaciones críticas.
- La ventana de contexto de 256K tokens es amplia, pero el rendimiento en contextos extremadamente largos (cercanos a 1M) no está documentado con benchmarks públicos.
- No se especifican los idiomas soportados, lo que limita la confianza para despliegues multilingües sin pruebas adicionales.
- Aunque la licencia MIT permite uso comercial, el modelo se distribuye como checkpoint fp4, y la conversión a otros formatos o la reentrenamiento pueden requerir herramientas específicas no documentadas.
- El modo thinking está activado por defecto, lo que puede aumentar la latencia en comparación con modelos sin razonamiento explícito; es necesario ajustar los parámetros de decodificación según el caso de uso.

## Enlaces

- [HuggingFace - inclusionAI/Ling-3.0-flash-fp4](https://huggingface.co/inclusionAI/Ling-3.0-flash-fp4)
- [HuggingFace - inclusionAI/Ling-3.0-flash (modelo base)](https://huggingface.co/inclusionAI/Ling-3.0-flash)
- [DeepInfra - Demo de Ling-3.0-flash](https://deepinfra.com/inclusionAI/Ling-3.0-flash)
- [Documentación oficial de Ant Ling](https://developer.ant-ling.com/en/docs/models/ling/)
- [Guía completa de Ling 3.0 Flash en aimadetools](https://www.aimadetools.com/blog/ling-3-0-flash-complete-guide/)
- [ModelScope - inclusionAI](https://modelscope.cn/organization/inclusionAI)
- [OpenRouter - inclusionai/ling-3.0-flash:free](https://openrouter.ai/inclusionai/ling-3.0-flash:free)

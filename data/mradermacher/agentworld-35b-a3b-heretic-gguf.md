# mradermacher/AgentWorld-35B-A3B-Heretic-GGUF

## Resumen

AgentWorld-35B-A3B-Heretic-GGUF es una colección de cuantizaciones GGUF del modelo AgentWorld-35B-A3B-Heretic, publicada por el equipo mradermacher, conocido por generar versiones cuantizadas de modelos open source para su ejecución local. El modelo original, creado por auttasak88, no dispone de documentación pública en el momento de redactar esta ficha, pero su nomenclatura sugiere una arquitectura de mezcla de expertos (MoE) con 35 mil millones de parámetros totales y 3 mil millones activos (A3B), probablemente basada en la familia Qwen, dado que el nombre coincide con el proyecto Qwen-AgentWorld de Alibaba.

La etiqueta "Heretic" indica que se trata de una versión sin censura o "jailbreak", orientada a eliminar restricciones de contenido. El término "AgentWorld" apunta a un modelo diseñado para simular entornos de agente mediante razonamiento de cadena de pensamiento larga, según el repositorio oficial de Qwen-AgentWorld. Esta cuantización permite ejecutar un modelo de 35B en hardware de consumo gracias a su arquitectura MoE y a los formatos GGUF de baja precisión, lo que lo hace relevante para desarrolladores que necesitan capacidades de agente sin depender de servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (inferido por la nomenclatura A3B, no confirmado) |
| Parametros totales | 34.660.610.688 (34,66B) |
| Parametros activos | 3B (inferido por A3B, no confirmado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q4_K_S, Q2_K, Q8_0, Q6_K, Q3_K_M, Q3_K_S, Q3_K_L, Q4_K_M, Q5_K_S, Q5_K_M, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors para el modelo original, no incluido en este repo) |

## Arquitectura y entrenamiento

No se dispone de información oficial sobre la arquitectura interna, los datos de entrenamiento o el proceso de alineación del modelo original. La nomenclatura "35B-A3B" sugiere una arquitectura de mezcla de expertos (MoE) con 35 mil millones de parámetros totales y 3 mil millones activos por token, similar a otros modelos de la familia Qwen (como Qwen3-30B-A3B). El nombre "AgentWorld" y la referencia al repositorio Qwen-AgentWorld indican que el modelo podría estar entrenado para simular entornos de agente en dominios como MCP, búsqueda, terminal, ingeniería de software, Android, web y sistema operativo, mediante razonamiento de cadena de pensamiento larga. Sin embargo, estos datos no están confirmados en la información proporcionada.

El repositorio de mradermacher contiene únicamente las cuantizaciones GGUF generadas a partir del modelo original, sin incluir el proceso de entrenamiento ni detalles sobre el dataset utilizado. No se menciona el uso de RLHF, DPO u otras técnicas de alineación.

## Capacidades

- Generación de texto conversacional (etiqueta "conversational" en HuggingFace).
- Compatible con endpoints de inferencia (etiqueta "endpoints_compatible").
- Probablemente orientado a tareas de agente: simulación de entornos, tool calling y razonamiento multi-paso, según la referencia a Qwen-AgentWorld (no confirmado).
- Versión "Heretic" sin censura, capaz de generar contenido que otros modelos rechazarían (inferido por el nombre y la referencia a modelos sin censura en la búsqueda web).
- Soporte de cuantizaciones múltiples para diferentes niveles de VRAM.

## Casos de uso

- Ejecución local de un asistente conversacional sin censura: gracias a las cuantizaciones GGUF, el modelo puede desplegarse en hardware de consumo (por ejemplo, una GPU con 8-12 GB de VRAM) para experimentar con respuestas sin filtros de seguridad.
- Prototipado de agentes autónomos: si el modelo mantiene las capacidades de AgentWorld, podría usarse para simular entornos de agente en investigación, aunque no hay documentación que lo confirme.
- Desarrollo de aplicaciones de chat privadas: al ser un modelo local, permite mantener los datos en el dispositivo, útil para entornos con requisitos de privacidad.
- Pruebas de generación de código y razonamiento: aunque no hay benchmarks, el tamaño del modelo sugiere capacidades básicas de código y matemáticas, pero no se puede garantizar.
- Integración en pipelines de inferencia con llama.cpp o vLLM: al ser GGUF, es compatible con estas herramientas para despliegue en servidores o edge.
- Evaluación de modelos sin censura: investigadores pueden comparar el comportamiento de este modelo frente a versiones alineadas de la misma familia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar para este modelo o su versión original.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente. Sin embargo, un modelo similar (Qwen3.6-35B-A3B) se ha ejecutado con 6 GB de VRAM usando cuantización GGUF, según un blog de la comunidad. Para este modelo, las cuantizaciones Q2_K o Q3_K_M podrían caber en 6-8 GB, mientras que Q8_0 o F16 requerirían 24 GB o más.
- GPU recomendadas: RTX 3060 (12 GB) o superior para cuantizaciones bajas; RTX 4090 o A100 para cuantizaciones altas.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (con adaptador GGUF), TGI (si se convierte a otro formato).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. El modelo parece pertenecer a la familia Qwen MoE (35B-A3B), pero no hay datos de rendimiento ni de licencia. Alternativas como Qwen3-30B-A3B o Qwen3.5-35B-A3B (si existen) podrían ser comparables, pero no se han encontrado datos concretos en la búsqueda. Se indica "no disponible".

## Limitaciones y advertencias

- Licencia no especificada: el uso comercial puede estar restringido o ser ilegal sin conocer los términos del modelo original.
- Sin documentación sobre sesgos, alucinaciones o limitaciones de contexto.
- Al ser una versión "Heretic" (sin censura), puede generar contenido ofensivo, ilegal o peligroso. No es adecuado para aplicaciones de producción sin supervisión humana.
- No se han publicado benchmarks, por lo que el rendimiento real es desconocido.
- El contexto máximo no está documentado; si es similar a otros modelos Qwen, podría ser de 128K tokens, pero no se confirma.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un modelo reciente o poco probado por la comunidad.

## Enlaces

- Repositorio HuggingFace de la cuantización: https://huggingface.co/mradermacher/AgentWorld-35B-A3B-Heretic-GGUF
- Repositorio del modelo original (inferido, no confirmado): https://huggingface.co/auttasak88/AgentWorld-35B-A3B-Heretic
- Proyecto Qwen-AgentWorld (GitHub): https://github.com/QwenLM/Qwen-AgentWorld
- Blog sobre Qwen3.6-35B-A3B sin censura (referencia de hardware): https://blog.csdn.net/weixin_41961749/article/details/161501525
- Guía de modelos sin censura por VRAM (InsiderLLM): https://insiderllm.com/guides/best-uncensored-local-llms/

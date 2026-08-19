# ornith-ai/Ornith-1.5-397B

## Resumen

Ornith-1.5-397B es el modelo insignia de la familia Ornith-1.5, desarrollado por el laboratorio ornith-ai. Se trata de un modelo de lenguaje de gran escala con arquitectura de mezcla de expertos (MoE) de aproximadamente 397 mil millones de parámetros totales, especializado en tareas de codificación agéntica y razonamiento multi-paso. Su principal innovación reside en un bucle de auto-mejora de extremo a extremo: en lugar de depender de tareas fijas y entornos predefinidos, el modelo genera sus propias tareas de entrenamiento, descubre estrategias de resolución y mejora su política mediante aprendizaje por refuerzo.

El modelo está diseñado para competir con fronteras propietarias como Claude Opus 4.8 en benchmarks de agente de código, superando a alternativas abiertas de escala similar como GLM-5.2 y DeepSeek-V4-Flash-0731. Se distribuye bajo licencia MIT, con pesos en formato safetensors y es compatible con el ecosistema transformers. Está pensado para desarrolladores e investigadores que necesitan un modelo de código abierto de alto rendimiento para automatización de ingeniería de software, resolución de incidencias y construcción de agentes autónomos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) basada en qwen3_5_moe |
| Parametros totales | 396.802.360.816 (~397B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Ornith-1.5-397B emplea una arquitectura de mezcla de expertos (MoE) derivada de la familia Qwen3.5, aunque los detalles concretos sobre el número de expertos, la proporción de parámetros activos y el mecanismo de enrutamiento no se han publicado en la información disponible. El modelo está orientado a tareas de texto e imagen-texto, según los tags de HuggingFace, lo que sugiere una capacidad multimodal incipiente, aunque no se detallan los componentes de visión.

El entrenamiento se basa en un bucle de auto-mejora de extremo a extremo que amplía el enfoque de Ornith-1.0. En esta versión, el sistema optimiza conjuntamente la generación de tareas, la construcción de andamiajes (scaffolds) y la generación de soluciones (rollouts). El modelo genera nuevas tareas de entrenamiento de forma continua, descubre estrategias efectivas para resolverlas y mejora su política mediante aprendizaje por refuerzo. No se han publicado datos sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO.

## Capacidades

- Generación de código y resolución de problemas de programación complejos, con soporte para múltiples lenguajes.
- Razonamiento agéntico multi-paso: puede planificar, ejecutar comandos en terminal y resolver tareas de ingeniería de software de forma autónoma.
- Manejo de contextos largos y conversaciones multi-turno, aunque la longitud exacta de la ventana de contexto no se ha especificado.
- Soporte de tool calling y function calling, según los tags de HuggingFace (endpoints_compatible).
- Capacidad multimodal limitada: el tag image-text-to-text indica que puede procesar entradas de imagen y texto, aunque no se detallan los formatos ni la calidad.
- Generación de texto conversacional y asistencia en tareas de razonamiento matemático y lógico, aunque no se aportan benchmarks específicos para estas áreas.

## Casos de uso

- Automatización de resolución de incidencias en repositorios de software: el modelo puede analizar issues, generar parches y ejecutar pruebas en entornos de integración continua, aprovechando su alto rendimiento en SWE-bench Verified (86) y SWE-bench Pro (65.1).
- Agente de terminal para operaciones de desarrollo: gracias a su puntuación de 86.1 en Terminal-Bench 2.1, puede manejar tareas de administración de sistemas, despliegue y depuración directamente desde la línea de comandos.
- Generación de código en producción con integración en pipelines de CI/CD: su soporte de tool calling permite conectarlo a APIs de control de versiones, gestores de paquetes y entornos de prueba.
- Asistente de programación en IDE: puede sugerir implementaciones completas, refactorizar código existente y explicar fragmentos complejos, con una calidad comparable a asistentes propietarios de pago.
- Investigación en aprendizaje por refuerzo y auto-mejora: el modelo es un caso de estudio abierto sobre entrenamiento autónomo, útil para laboratorios que quieran replicar o extender el enfoque.
- Desarrollo de agentes autónomos para automatización de tareas empresariales: su capacidad de razonamiento multi-paso y generación de tareas propias lo hace adecuado para construir sistemas que gestionan flujos de trabajo complejos sin supervisión humana.

## Benchmarks y rendimiento

Los resultados publicados se centran en benchmarks de agentes de codificación. No se han proporcionado datos de MMLU, HumanEval, GSM8K ni otros benchmarks generales de lenguaje o razonamiento.

| Benchmark | Ornith-1.5-397B | DeepSeek-V4-Flash-0731 (284B) | GLM-5.2 (753B) | Claude Opus 4.8 | Kimi K3 (2.8T) | Ornith-1.0-397B |
|---|---|---|---|---|---|---|
| Terminal-Bench 2.1 (Terminus-2) | 86.1 | 82.7 | 81 | 85 | 88.3 | 77.5 |
| Terminal-Bench 2.1 (Claude Code) | 85.2 | 81.8 | 82.7 | 78.9 | - | 78.2 |
| SWE-bench Verified | 86 | 81.6 | 83 | 85.8 | 86.2 | 82.4 |
| SWE-bench Pro | 65.1 | - | - | - | - | - |

Los datos de SWE-bench Pro solo se muestran para Ornith-1.5-397B en la información disponible; los valores de los demás modelos no se han publicado en el fragmento extraído.

## Requisitos de hardware

- No se han publicado requisitos oficiales de hardware para Ornith-1.5-397B.
- Dado su tamaño de ~397B parámetros en formato MoE, se estima que la inferencia requiere múltiples GPUs de alta gama. Una estimación orientativa: con cuantización de 8 bits, la memoria necesaria rondaría los 400 GB de VRAM, lo que implica al menos 4 GPUs A100 de 80 GB o 8 GPUs RTX 4090 de 24 GB. Sin cuantización, el peso en FP16 ocuparía aproximadamente 800 GB, necesitando 10 GPUs A100 de 80 GB.
- No es viable en GPUs de consumo individual; se requiere un clúster o servidor dedicado.
- Opciones de despliegue: al ser compatible con transformers, se puede servir con vLLM, TGI o SGLang, aunque no se confirma oficialmente. También podría usarse con llama.cpp si se generan pesos GGUF, pero no se han publicado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Ornith-1.5-397B compite directamente con modelos MoE de código abierto de escala similar y con modelos propietarios de frontera. La siguiente tabla resume las diferencias principales:

| Modelo | Parámetros | Arquitectura | Licencia | Contexto | Rendimiento en SWE-bench Verified |
|---|---|---|---|---|---|
| Ornith-1.5-397B | ~397B (MoE) | MoE | MIT | no disponible | 86 |
| DeepSeek-V4-Flash-0731 | 284B | MoE | no disponible | no disponible | 81.6 |
| GLM-5.2 | 753B | MoE | no disponible | no disponible | 83 |
| Claude Opus 4.8 | no disponible | propietario | propietaria | no disponible | 85.8 |
| Kimi K3 | 2.8T | MoE | no disponible | no disponible | 86.2 |
| Ornith-1.0-397B | ~397B (MoE) | MoE | MIT | no disponible | 82.4 |

Ornith-1.5-397B supera a DeepSeek-V4-Flash-0731 y GLM-5.2 en los benchmarks de codificación publicados, y se acerca a Claude Opus 4.8, aunque con un número de parámetros significativamente menor que Kimi K3. Su ventaja principal es la licencia MIT, que permite uso comercial sin restricciones.

## Limitaciones y advertencias

- No se han publicado datos sobre sesgos, alucinaciones o limitaciones de idioma. Al ser un modelo entrenado principalmente para codificación, su rendimiento en tareas de lenguaje general o en idiomas distintos del inglés puede ser inferior.
- La ventana de contexto no está especificada, lo que dificulta planificar su uso en aplicaciones que requieran documentos muy largos.
- El modelo es extremadamente grande (1.6 TB en safetensors), lo que limita su despliegue a organizaciones con infraestructura de GPU sustancial.
- Aunque la licencia MIT permite uso comercial, no se garantiza que los pesos no contengan datos con derechos de terceros; se recomienda revisar la documentación legal antes de usarlo en producción.
- La arquitectura MoE puede presentar latencias variables según la distribución de expertos activos, y no se han publicado perfiles de rendimiento.
- El modelo está diseñado para tareas de agente; su uso en otros dominios puede requerir ajuste fino adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ornith-ai/Ornith-1.5-397B
- Colección Ornith-1.5: https://huggingface.co/collections/ornith-ai/ornith-15
- Blog de Ornith AI sobre Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Web principal de Ornith AI: https://ornith.ai/

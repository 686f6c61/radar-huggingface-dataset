# Dimitrex93/neo1.0-3b

## Resumen

Neo 1.0:3b es un ajuste fino del modelo Qwen/Qwen2.5-3B-Instruct realizado por el desarrollador Dimitrex93 mediante la técnica QLoRA. Está orientado específicamente a tareas de homelab y DevOps con énfasis en el idioma alemán, aunque también maneja inglés. El modelo busca ofrecer una base sólida para administración de servidores, Docker, Linux, redes, programación en Python y C++, y gramática alemana, todo ello en un tamaño compacto de 3 mil millones de parámetros que permite su ejecución en hardware modesto.

La relevancia de este modelo radica en su enfoque de nicho: en lugar de pretender ser un asistente universal, se entrena con datos seleccionados de documentación técnica, foros y repositorios de código para mejorar el rendimiento en dominios concretos. Según el autor, el ajuste fino logra una mejora del 7% en su benchmark interno (de 55% a 62%) y del 16% en pruebas de generalización con preguntas no vistas (de 55% a 71%). Está disponible bajo licencia Apache-2.0 y se distribuye en formato GGUF para su uso con Ollama y llama.cpp, lo que facilita su despliegue en entornos domésticos o de pequeña escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basada en Qwen2.5) |
| Parametros totales | 3.085.938.688 (3,09 B) |
| Parametros activos | 3.085.938.688 (no es MoE) |
| Longitud de contexto | No especificada; el base Qwen2.5-3B-Instruct soporta hasta 32.768 tokens |
| Tipos de cuantizacion | Q4_K_M (1,9 GB) y f16 (6,2 GB) en GGUF |
| Idiomas soportados | Aleman (de) e ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (Q4_K_M, f16); los metadatos de HuggingFace indican safetensors, aunque no se listan en la model card |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen2.5-3B-Instruct, un transformer decoder-only con atención de escala lineal (linear attention) y normalización RMSNorm. El ajuste fino se realizó con QLoRA (Low-Rank Adaptation cuantizada) con r=16, α=32 y dropout de 0.05, utilizando cuantización NF4 de 4 bits mediante bitsandbytes. El entrenamiento se ejecutó durante 3 épocas sobre 1.644 muestras (84 preguntas de un benchmark propio ampliadas 20 veces, más código, documentación y foros técnicos), con una longitud de secuencia de 512 tokens y en una NVIDIA P2000 de 5 GB durante aproximadamente 6,5 horas, usando el framework Axolotl 0.4.0 con PyTorch 2.2.2 y transformers 4.37.0.

Los datos de entrenamiento incluyen una mezcla de: preguntas de un benchmark interno de LLM (84 preguntas de opción múltiple y abiertas, con categorías de alucinación), código de the-stack-smol (Python, C, C++, Dockerfile) y code_search_net, documentación de tldr-pages y docker-docs, RFCs (DHCP, TCP, HTTP/1.1, TLS 1.3), foros como german.stackexchange y StackOverflow, un wiki personal en alemán, y GitHub issues de docker/cli, docker/compose, moby/moby y ollama. No se aplicaron técnicas de RLHF ni DPO; el ajuste es exclusivamente supervisado (SFT).

## Capacidades

- Generación de texto técnico en alemán e inglés, con especialización en administración de sistemas, Docker, Linux, redes y programación.
- Razonamiento y respuesta a preguntas técnicas de opción múltiple y abiertas, con mejora notable en categorías como Linux, C++ y redes.
- Generación de código en Python, C, C++ y Dockerfile, así como explicaciones de fragmentos de código.
- Comprensión de documentación técnica (RFC, manuales, guías de Docker) y capacidad de resumir o extraer información.
- Soporte de function calling heredado del modelo base Qwen2.5-3B-Instruct (no verificado explícitamente en el ajuste fino).
- Capacidad de seguir el formato de chat ChatML (Qwen2.5) para conversaciones multi-turno.
- Multilingüe limitado a alemán e inglés; otros idiomas no están garantizados.

## Casos de uso

- Asistente de administración de servidores homelab: el modelo puede responder consultas sobre configuración de Docker, gestión de contenedores, resolución de problemas de red y comandos de Linux, gracias a su entrenamiento con documentación y foros especializados.
- Generación de scripts de automatización: dado su entrenamiento con código Python y Bash, puede producir scripts para tareas recurrentes como backups, monitorización o despliegue de servicios, con explicaciones en alemán o inglés.
- Soporte técnico en alemán: empresas o comunidades de habla alemana pueden usarlo para atender consultas de usuarios sobre problemas de software o infraestructura, aprovechando su dominio del idioma técnico.
- Documentación técnica: puede ayudar a redactar o traducir documentación de proyectos DevOps, como guías de instalación, manuales de uso o README, manteniendo un tono técnico preciso.
- Educación y formación: estudiantes de administración de sistemas o programación pueden usarlo como tutor para resolver dudas sobre conceptos de Linux, Docker o C++, con explicaciones adaptadas a un nivel intermedio.
- Integración en pipelines de CI/CD: aunque no se menciona explícitamente, su capacidad de generar código y seguir instrucciones permite usarlo para autogenerar fragmentos de configuración o scripts de despliegue en entornos controlados.

## Benchmarks y rendimiento

El autor proporciona resultados de un benchmark propio (no estándar) con 84 preguntas y un test de generalización con 50 preguntas no vistas durante el entrenamiento. Los resultados se comparan con el modelo base Qwen2.5-3B-Instruct:

| Modelo | Benchmark propio (84 preguntas, máx. 168 puntos) | Test de generalización (50 preguntas, máx. 104 puntos) |
|---|---|---|
| Qwen2.5-3B-Instruct (base) | 92/168 (55%) | 57/104 (55%) |
| Neo 1.0:3b | 104/168 (62%) | 74/104 (71%) |

No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible. Las mejoras más destacadas según el autor son: Linux (+33 puntos porcentuales), C++ (+29 pp), redes (+20 pp) y una categoría denominada "zahlen-falle" (+57 pp).

## Requisitos de hardware

- VRAM estimada: la cuantización Q4_K_M ocupa aproximadamente 1,9 GB de pesos, por lo que cabe en GPUs con 4 GB de VRAM (por ejemplo, GTX 1650, RTX 3050). La versión f16 requiere unos 6,2 GB, necesitando al menos 8 GB de VRAM (RTX 3070, RTX 4060, etc.).
- GPU recomendadas: cualquier GPU NVIDIA con al menos 4 GB de VRAM para Q4_K_M; para f16 se recomienda 8 GB o más. También puede ejecutarse en CPU con llama.cpp, aunque con mayor latencia.
- Compatibilidad con GPUs de consumo: sí, es totalmente viable en hardware de gama media o baja, como una RTX 3060 o una P2000 (la usada en el entrenamiento).
- Opciones de despliegue: Ollama (recomendado por el autor), llama.cpp directamente, o servidores de inferencia compatibles con GGUF como llama-cpp-python. También es compatible con endpoints de HuggingFace (endpoints_compatible).
- Latencia y throughput: no se proporcionan datos concretos; en una GPU moderna, un modelo de 3B en Q4_K_M puede generar entre 20 y 40 tokens por segundo, dependiendo de la memoria y la implementación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Especialización | Disponibilidad |
|---|---|---|---|---|---|
| Neo 1.0:3b (este) | 3,09 B | 32k (base) | Apache-2.0 | Alemán, homelab/DevOps | GGUF, Ollama |
| Qwen2.5-3B-Instruct (base) | 3,09 B | 32k | Apache-2.0 | General, multilingüe | Safetensors, GGUF |
| Llama-3.2-3B-Instruct | 3,21 B | 128k | Llama 3.2 Community | General, multilingüe | Safetensors, GGUF |
| Phi-3-mini-4k-instruct | 3,82 B | 4k | MIT | Razonamiento, código | Safetensors, GGUF |

La comparación con Llama-3.2 y Phi-3 se basa en características generales; no hay benchmarks comparativos directos. Neo 1.0:3b se distingue por su enfoque en alemán y dominios técnicos específicos, mientras que los otros modelos son de propósito general. Para tareas de homelab en alemán, Neo podría superar al base, pero carece de la versatilidad de los modelos generales.

## Limitaciones y advertencias

- Tamaño reducido (3B): no es un modelo de propósito general; su rendimiento fuera de los dominios de homelab/DevOps y del alemán puede ser pobre.
- Datos de entrenamiento limitados (1.644 muestras): puede presentar lagunas en gramática alemana o temas no cubiertos en el corpus, como indica el propio autor.
- Riesgo de alucinación: aunque el entrenamiento incluye categorías de alucinación, el modelo puede inventar comandos, configuraciones o respuestas si no conoce el contexto. Se recomienda verificar siempre la información crítica.
- Sin benchmarks estándar: los resultados presentados provienen de un benchmark propio no validado externamente, por lo que no es comparable con otros modelos mediante métricas comunes.
- Idiomas limitados: solo se garantizan alemán e inglés; otros idiomas no están soportados.
- Licencia Apache-2.0: permite uso comercial y modificación, pero se debe mantener la atribución y no usar marcas registradas (aunque no hay marcas específicas).
- Contexto no verificado: la longitud de contexto efectiva tras el ajuste fino no se ha documentado; aunque el base soporta 32k, el entrenamiento con secuencias de 512 puede afectar el rendimiento en contextos largos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Dimitrex93/neo1.0-3b
- Modelo base Qwen2.5-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Repositorio de Qwen2.5 (documentación): https://huggingface.co/Qwen/Qwen2.5
- Perfil del autor en EasyEDA (dimitrex93): https://oshwlab.com/dimitrex93 (no relacionado con el modelo, pero aparece en la búsqueda)

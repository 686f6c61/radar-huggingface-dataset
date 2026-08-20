# saidutta69/Qwen2.5-1.5B-Instruct-heretic

## Resumen

Qwen2.5-1.5B-Instruct-heretic es una variante "decensored" del modelo Qwen/Qwen2.5-1.5B-Instruct, desarrollada por saidutta69 mediante la herramienta Heretic v1.2.0, que aplica una técnica de ablación direccional (también conocida como "abliteration"). En lugar de realizar un fine-tuning, el modelo suprime el comportamiento de rechazo mediante ediciones quirúrgicas en los pesos de las proyecciones de salida de atención y las down-projections del MLP, lo que permite que el modelo responda directamente a peticiones que el modelo base rechazaría, manteniendo en gran medida el conocimiento y la capacidad de seguir instrucciones originales.

Con 1.543.714.304 parámetros (aproximadamente 1,5B), este modelo está pensado para desarrolladores que necesitan un modelo pequeño que no se niegue a responder, ya sea para agentes locales, roleplay, investigación sobre mecanismos de alineación o cualquier caso de uso bloqueado por el exceso de rechazo típico de la era RLHF. Al ser tan compacto, puede ejecutarse cómodamente en CPU o GPUs de baja VRAM, superando a la variante de 0,5B en razonamiento y coherencia. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (arquitectura Qwen2.5, heredada del modelo base) |
| Parametros totales | 1.543.714.304 (1,54B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16 (safetensors), GGUF Q8_0, Q5_K_M, Q4_K_M |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo es una modificación del Qwen2.5-1.5B-Instruct original, que a su vez es un transformer decoder-only preentrenado por Alibaba sobre un dataset de hasta 18 billones de tokens (dato del modelo base, no de esta variante). La variante heretic no ha sido reentrenada; en su lugar, se ha aplicado una ablación direccional con Heretic v1.2.0. Esta técnica identifica una dirección en el espacio de activaciones asociada al comportamiento de rechazo y edita los pesos de las capas de atención (attn.o_proj) y MLP (mlp.down_proj) para eliminar esa dirección. Los parámetros de la ablación se detallan en la model card: direction_index 18.83, con pesos máximos y mínimos en las proyecciones. El resultado es una supresión del rechazo sin un fine-tuning convencional, lo que preserva las capacidades generales del modelo base.

## Capacidades

- Generacion de texto conversacional y seguimiento de instrucciones, heredadas del modelo base Qwen2.5-1.5B-Instruct.
- Respuesta directa a peticiones que el modelo base rechazaría, gracias a la supresión del comportamiento de rechazo (tasa de rechazo reducida de 99/100 a 1/100 en pruebas adversariales).
- Capacidad de ejecución en CPU y GPUs de baja VRAM, adecuada para entornos con recursos limitados.
- Compatibilidad con múltiples frameworks de inferencia: transformers, llama.cpp, Ollama, LM Studio, Jan, vLLM y SGLang.
- No se especifican capacidades adicionales como tool calling, visión o audio en la documentación proporcionada.

## Casos de uso

- Agentes conversacionales locales: el modelo puede integrarse en asistentes personales o chatbots que requieran respuestas sin filtros de rechazo, por ejemplo en entornos de desarrollo o pruebas. Su pequeño tamaño permite ejecutarlo en un portátil o en un servidor modesto.
- Roleplay y narrativa interactiva: al no rechazar peticiones, es adecuado para juegos de rol o generación de ficción donde el usuario necesita libertad creativa sin restricciones impuestas por el modelo.
- Investigacion sobre mecanismos de alineacion y rechazo: la ablación direccional es un objeto de estudio interesante para investigadores que analizan cómo se codifica el rechazo en los pesos del modelo y cómo se puede eliminar de forma selectiva.
- Generacion de contenido creativo sin censura: escritores o creadores pueden usarlo para explorar temas sensibles o controvertidos que otros modelos bloquean, siempre que se asuma la responsabilidad del contenido generado.
- Prototipado rapido de aplicaciones de chat: gracias a su compatibilidad con Ollama y llama.cpp, se puede desplegar en minutos para pruebas de concepto de asistentes o sistemas de diálogo.
- Educacion y experimentacion con modelos de lenguaje: su licencia Apache 2.0 y su tamaño reducido lo hacen accesible para estudiantes que quieran estudiar el comportamiento de modelos "uncensored" sin necesidad de hardware caro.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card reporta métricas específicas de la ablación, comparando con el modelo original:

| Metrica | Modelo heretic | Modelo original (Qwen2.5-1.5B-Instruct) |
| :------ | :------------: | :-------------------------------------: |
| Divergencia KL | 0.1607 | 0 (por definicion) |
| Rechazos (sobre 100 prompts adversariales) | 1/100 | 99/100 |

La divergencia KL de 0.16 indica que la edición de pesos es estrecha y dirigida, no una perturbación amplia, por lo que las capacidades originales se mantienen en gran medida.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo safetensors en BF16 ocupa 3,09 GB, por lo que se necesitan al menos 4-6 GB de VRAM para cargarlo con overhead. Las versiones GGUF son más ligeras: Q8_0 (1,65 GB), Q5_K_M (1,13 GB) y Q4_K_M (986 MB), lo que permite ejecutarlo en GPUs con 2 GB o incluso en CPU.
- GPUs recomendadas: cualquier GPU de consumo moderna con al menos 4 GB de VRAM (p. ej., RTX 3060, RTX 4060, GTX 1660 Super) puede manejar la versión BF16. Para las cuantizaciones GGUF, basta con 2 GB de VRAM o incluso solo CPU.
- Ejecución en CPU: al ser un modelo de 1,5B, es viable en CPU con las cuantizaciones GGUF, aunque la velocidad dependerá del número de hilos y la memoria RAM disponible.
- Opciones de despliegue: transformers (Python), llama.cpp (servidor llama), Ollama, LM Studio, Jan, vLLM y SGLang. Todos son compatibles según la model card.
- Latencia y throughput: no se proporcionan datos específicos. En una GPU moderna, se espera una generación de decenas de tokens por segundo, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
| :------ | :--------: | :------: | :------: | :---- |
| Qwen2.5-1.5B-Instruct-heretic (este) | 1,54B | No disponible | Apache 2.0 | Variante "decensored" mediante ablación direccional |
| Qwen/Qwen2.5-1.5B-Instruct (original) | 1,54B | No disponible | Apache 2.0 | Modelo base con rechazo estándar RLHF |
| Qwen2.5-0.5B-Instruct-heretic (del mismo autor) | 0,5B | No disponible | Apache 2.0 | Variante más pequeña, misma técnica |
| Qwen2.5-3B-Instruct-heretic (del mismo autor) | 3B | No disponible | Apache 2.0 | Variante más grande, misma técnica |

No se dispone de datos de rendimiento comparativo más allá de la tasa de rechazo y la divergencia KL frente al original. Otras alternativas "uncensored" como Dolphin o WizardLM-uncensored no se han incluido por falta de información en la documentación proporcionada.

## Limitaciones y advertencias

- El modelo no tiene filtro de seguridad adicional: la supresión del rechazo es deliberada y funcionará también para peticiones que el modelo base rechazaría por razones legítimas (contenido dañino, ilegal, etc.). No debe desplegarse detrás de un endpoint público sin moderación.
- Hereda las limitaciones factuales y los sesgos del modelo base Qwen2.5-1.5B-Instruct. La ablación elimina direcciones de rechazo, pero no añade capacidad ni juicio.
- Solo soporta inglés (etiqueta language: en). No se garantiza un buen rendimiento en otros idiomas.
- La longitud de contexto no está documentada en la información proporcionada; se desconoce si mantiene la ventana del modelo base (que en Qwen2.5 suele ser de 32K o 128K, pero no se confirma aquí).
- Riesgo de alucinación: como cualquier modelo de 1,5B, puede generar información falsa o inventada, especialmente en temas especializados.
- Uso responsable: la model card advierte explícitamente que el usuario es responsable de cómo despliega el modelo y que no debe ponerse detrás de un servicio público no moderado que atienda a terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/saidutta69/Qwen2.5-1.5B-Instruct-heretic
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Herramienta Heretic (repositorio): https://github.com/p-e-w/heretic
- Variante 0.5B: https://huggingface.co/saidutta69/Qwen2.5-0.5B-Instruct-heretic
- Variante 3B: https://huggingface.co/saidutta69/Qwen2.5-3B-Instruct-heretic
- Variante Coder 3B: https://huggingface.co/saidutta69/Qwen2.5-Coder-3B-Instruct-heretic
- Página de inferencia en FriendliAI: https://friendli.ai/models/saidutta69/Qwen2.5-1.5B-Instruct-heretic

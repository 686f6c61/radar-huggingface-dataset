# DarkKitsune/Qwen3.6-Candid-Coder-35B-A3B

## Resumen

Qwen3.6-Candid-Coder-35B-A3B es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por DarkKitsune, un autor independiente que publica merges y variantes de modelos open source. Se trata de un merge por task vectors mediante el método DELLA que combina cuatro modelos: Qwen/Qwen3.6-35B-A3B como base, InternScience/Sage-A1.5 (ratio 0,37), Kwaipilot/KAT-Coder-V2.5-Dev (ratio 0,53) y ornith-ai/Ornith-1.5-35B-A3B (ratio 0,10). El resultado es un modelo orientado a programación, corrección de bugs, orquestación de agentes y planificación, con un proceso de "abliteration" (eliminación de capas de rechazo) que reduce las negativas del modelo base.

El modelo cuenta con 35.951.822.704 parámetros totales en formato safetensors, lo que confirma una arquitectura MoE de aproximadamente 36B con activación dispersa (el sufijo A3B sugiere del orden de 3B parámetros activos, aunque el dato exacto no está confirmado en la información disponible). El repositorio ocupa 298,9 GB e incluye pesos en safetensors y cuantizaciones GGUF optimizadas con APEX para despliegue en llama.cpp. La relevancia actual radica en su enfoque híbrido: combina la eficiencia de tokens de un coder especializado con capacidades de razonamiento, verificación y planificación propias de modelos agénticos, todo ello con cuantizaciones calibradas sobre sesiones reales de coding agéntico de contexto largo.

El autor mantiene una versión actualizada de la receta y cuantizaciones calibradas en un repositorio separado (V1.1). La licencia y los idiomas soportados no están declarados en la información disponible, lo que constituye una limitación importante para evaluar su uso comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) transformer, derivada de Qwen3.6-35B-A3B; tag `qwen3_5_moe` |
| Parametros totales | 35.951.822.704 (35,95B) |
| Parametros activos | no disponible (el sufijo A3B sugiere ~3B activos, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con APEX mixed-precision: I-Quality (~23 GB) e I-Medium (~20 GB); safetensors BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors, GGUF (llama.cpp) |
| Metodo de merge | DELLA (task vectors) con densidad 1.0 y epsilon 0.0 en router gates y shared experts |
| Modalidad | image-text-to-text (según tags), pipeline text-generation |
| Tamano del repositorio | 298,9 GB |

## Arquitectura y entrenamiento

El modelo es un merge DELLA de cuatro checkpoints, no un entrenamiento desde cero. La base Qwen/Qwen3.6-35B-A3B se utiliza para calcular los task vectors, y sobre ella se aplican los deltas ponderados de Sage-A1.5 (0,37), KAT-Coder-V2.5-Dev (0,53) y Ornith-1.5-35B-A3B (0,10). La arquitectura subyacente es un transformer MoE con router gates y expertos compartidos; el autor indica que, aunque la mayor parte de los pesos se fusionaron con un método que descarta pesos (sparsification), los tensores sensibles —router gates y shared experts— se protegieron con densidad 1,0 y epsilon 0,0 para desactivar la esparsificación y preservar su comportamiento.

El proceso de abliteration (etiquetado como "heretic") elimina o atenúa las direcciones de rechazo del modelo base, de modo que el modelo no se niega de forma tan directa como Qwen ante ciertos prompts, aunque puede desviar temas que Qwen rechazaría sin más insistencia. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en las etapas de post-entrenamiento de los modelos fuente; esa información pertenece a las model cards de los modelos originales, no a este merge.

La innovación técnica destacable está en la cuantización: APEX genera configuraciones de precisión mixta para modelos MoE. La imatrix se calibra con aproximadamente un 50% de fragmentos aleatorios de texto en inglés de múltiples dominios y un 50% de tokens generados durante sesiones reales de coding agéntico de contexto largo con KAT-Coder, Ornith-1.5 y el propio modelo, incluyendo tokens de control como `<|im_start|>`. Las cuantizaciones I-Quality e I-Medium se midieron con llama-perplexity sobre wikitext, código, markdown, XML y trazas de razonamiento, todos fuera del conjunto de calibración.

## Capacidades

- Generación de texto y razonamiento multi-paso, con planificación explícita de pasos antes de actuar.
- Programación y corrección de bugs con eficiencia de tokens (herencia de KAT-Coder-V2.5-Dev).
- Verificación y autocorrección: el modelo revisa y corrige su propia solución tras redactarla.
- Orquestación de agentes, planificación y diseño (herencia de Sage-A1.5, con 81,6 en IFBench según el autor).
- Tool calling / function calling y uso de herramientas, indicado en los tags (`tool-use`, `agent`).
- Self-scaffolding: capacidad de construir su propio andamiaje de razonamiento (herencia de Ornith-1.5).
- Conversación general y roleplay basado en datos (data-driven RP), así como lógica de juego y generación procedural.
- Capacidad multimodal image-text-to-text según los tags del repositorio (no detallada en la model card).
- Modo "uncensored"/abliterated: menor tasa de rechazos que el modelo base Qwen.
- Persistencia elevada en la consecución de tareas en entornos adecuados, según el autor.

## Casos de uso

- Corrección automática de bugs en pipelines de CI/CD: el modelo puede recibir un fallo de test, planificar la causa raíz, proponer un parche y verificar la corrección antes de emitirlo, gracias a su capacidad de verificación y autocorrección heredada de Sage-A1.5 y KAT-Coder.
- Agentes de coding autónomos con sandbox: su persistencia en la tarea y su soporte de tool calling permiten bucles de edición-ejecución-prueba; el autor recomienda explícitamente sandboxing antes de uso agéntico.
- Asistente de refactorización con contexto largo: las cuantizaciones I-Quality e I-Medium están optimizadas para coding de contexto largo con offload parcial a CPU, lo que encaja en tareas sobre repositorios extensos.
- Planificación de proyectos y descomposición de tareas: la contribución de Sage-A1.5 aporta orquestación de agentes y planificación, útil para generar planes de implementación a partir de requisitos.
- Generación de lógica de juego y contenido procedural: el autor señala game logic/procgen y roleplay basado en datos como dominios objetivo del merge.
- Despliegue en hardware de gama consumer con llama.cpp: las cuantizaciones GGUF de ~20-23 GB permiten ejecución con offload parcial en GPU de consumo, útil para prototipado local de asistentes de código.
- Conversación general sin filtros estrictos: para aplicaciones donde el modelo base rechazaría prompts legítimos (escritura creativa, análisis de seguridad defensiva), la abliteration reduce las negativas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tarea (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor solo reporta métricas de fidelidad de cuantización frente al baseline BF16, medidas con llama-perplexity:

| Metrica | I-Quality (~23 GB) | I-Medium (~20 GB) |
|---|---|---|
| KLD media | 0,029294 ± 0,001679 | 0,035802 ± 0,001793 |
| KLD mediana | 0,000733 | 0,000901 |
| KLD percentil 99 | 0,369452 | 0,491262 |
| KLD maximo | 9,913845 | 11,985034 |
| Δp medio | -0,012 ± 0,032 % | -0,142 ± 0,035 % |
| RMS Δp | 4,749 ± 0,191 % | 5,243 ± 0,163 % |
| Same top p | 95,888 ± 0,132 % | 95,337 ± 0,141 % |

El autor indica que la actualización de 2026-11-02 mejoró ambas cuantizaciones con un ~1% más de same-top% y midió KLD y probabilidad de token con contexto de 4096 en lugar de 2048.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo completo en safetensors ocupa 298,9 GB (BF16, ~72 GB solo de pesos a 16 bits para 36B parámetros); las cuantizaciones GGUF reducen el peso a ~23 GB (I-Quality) y ~20 GB (I-Medium), más overhead de contexto KV.
- GPU recomendadas: no especificadas por el autor. Por tamaño, un despliegue completo en GPU requiere del orden de 48-80 GB de VRAM en BF16 (A100 80GB, H100); las cuantizaciones GGUF permiten offload parcial a CPU.
- Cabe en GPU consumer: sí, con las cuantizaciones GGUF y offload parcial; el autor optimizó I-Quality e I-Medium específicamente para offload parcial a CPU. No se confirman modelos concretos de GPU consumer.
- Opciones de despliegue: llama.cpp (soporte explícito en los tags, con `imatrix` y `apex`), transformers (librería declarada), endpoints compatibles (tag `endpoints_compatible`). vLLM, Ollama y TGI no se mencionan en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.6-Candid-Coder-35B-A3B | 35,95B (MoE) | no disponible | Coding, agentes, abliterated | no disponible | Hugging Face, GGUF |
| Qwen/Qwen3.6-35B-A3B | ~36B (MoE) | no disponible | Base generalista | no disponible | Hugging Face |
| Kwaipilot/KAT-Coder-V2.5-Dev | no disponible | no disponible | Coding eficiente en tokens | no disponible | Hugging Face |
| InternScience/Sage-A1.5 | no disponible | no disponible | Instrucciones, agentes (IFBench 81,6) | no disponible | Hugging Face |

Los tres modelos de comparación son componentes del merge, por lo que la comparación es directa en linaje; no se dispone de datos de rendimiento de tarea para comparar objetivamente.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar el uso comercial; además, la licencia del modelo base Qwen y de los modelos fuente condiciona la del merge, y no está verificada en la información disponible.
- Idiomas no declarados; la calibración de la imatrix es mayoritariamente en inglés, lo que puede degradar el rendimiento en otros idiomas, incluido el castellano.
- La abliteration elimina barreras de rechazo: aumenta el riesgo de generar contenido que el modelo base bloquearía; requiere filtros propios en producción.
- Riesgo de alucinación no cuantificado: no hay benchmarks de fidelidad factual publicados.
- Persistencia agéntica elevada: el autor advierte de que el modelo puede insistir mucho en la tarea, por lo que exige sandboxing y límites de ejecución en uso autónomo.
- Es un merge, no un modelo entrenado: las capacidades son una mezcla ponderada de los modelos fuente y pueden presentar interferencias o degradaciones no documentadas.
- Longitud de contexto no confirmada en la información disponible, pese a que las cuantizaciones se optimizan para contexto largo.
- Cuantizaciones con pérdida: la KLD media de 0,029-0,036 frente a BF16 implica desviaciones en la distribución de tokens, más acusadas en la cola (percentil 99 de KLD de 0,37-0,49).
- El repositorio ocupa 298,9 GB, lo que exige almacenamiento considerable incluso si solo se descargan las cuantizaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DarkKitsune/Qwen3.6-Candid-Coder-35B-A3B
- Versión actualizada V1.1: https://huggingface.co/DarkKitsune/Qwen3.6-Candid-Coder-V1.1-35B-A3B
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Modelo fuente Sage-A1.5: https://huggingface.co/InternScience/Sage-A1.5
- Modelo fuente KAT-Coder-V2.5-Dev: https://huggingface.co/Kwaipilot/KAT-Coder-V2.5-Dev
- Modelo fuente Ornith-1.5-35B-A3B: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B

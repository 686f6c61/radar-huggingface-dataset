# davidheineman/opd-teacher-R1Distill-Cinema-step149

## Resumen

El modelo `davidheineman/opd-teacher-R1Distill-Cinema-step149` es un ajuste fino de `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B` desarrollado por David Heineman (estudiante de doctorado en Stanford, centrado en preentrenamiento, datos y evaluacion de modelos de lenguaje). Se trata de un "teacher" (profesor) entrenado especificamente para destilacion on-policy (OPD), un paradigma en el que un modelo profesor proporciona retroalimentacion sobre las salidas reales del estudiante para reducir el error compuesto durante el entrenamiento, en lugar de una imitacion de un solo paso.

El ajuste se realizo durante 150 pasos sobre prompts de dificultad 0 de un entorno denominado "Cinema", usando cuatro prompts y 16 rollouts por paso, con el algoritmo GRPO y sin filtrado de prompts DAPO. Forma parte de la coleccion "RLVE OPD Teachers" del mismo autor, que cubre 32 de 400 entornos posibles vinculados al trabajo RLVE. Los pesos publicados corresponden al paso 149 y estan pensados para servir como profesores en pipelines de destilacion especificos por entorno.

Con 1.777.088.000 parametros (aproximadamente 1,78 mil millones) y un repositorio de 3,6 GB en formato safetensors, es un modelo pequeno que cabe en GPU de consumo. Su relevancia radica en su caracter experimental y de investigacion dentro del campo de la destilacion on-policy, mas que como modelo de proposito general listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (derivada del modelo base DeepSeek-R1-Distill-Qwen-1.5B) |
| Parametros totales | 1.777.088.000 (aprox. 1,78B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura corresponde a Qwen2, heredada del modelo base `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B`, que a su vez deriva de la familia Qwen2.5. No se especifican en la informacion disponible detalles adicionales sobre la configuracion interna (numero de capas, dimensiones ocultas, cabezas de atencion) ni sobre la ventana de contexto efectiva de este ajuste concreto.

El entrenamiento consistio en 150 pasos sobre prompts de dificultad 0 del entorno "Cinema", con cuatro prompts y 16 rollouts por paso, empleando GRPO (Group Relative Policy Optimization) y sin filtrado de prompts DAPO. El objetivo declarado es producir un modelo profesor para destilacion on-policy especifica por entorno. El proyecto de entrenamiento figura como `david-heineman/rl-data-opd-teachers-r1-distil` y el grupo de entrenamiento como `opd-teachers-r1-nofilter16-20260929-231458`. Los pesos publicados son los finales del paso 149.

## Capacidades

- Generacion de texto y razonamiento: hereda las capacidades del modelo base DeepSeek-R1-Distill-Qwen-1.5B, orientado a tareas de razonamiento con cadenas de pensamiento.
- Destilacion on-policy: funcion principal del modelo, actuar como profesor que proporciona retroalimentacion sobre las salidas de un estudiante.
- Ajuste especifico por entorno: especializado en el entorno "Cinema" de dificultad 0.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible explicitamente; el entrenamiento con rollouts multiples sugiere capacidad de razonamiento multi-paso, pero no se confirma.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, modo thinking): no disponible.

## Casos de uso

- Destilacion on-policy de modelos estudiantes: el uso principal es servir como profesor que evalua y corrige las salidas de un estudiante durante el entrenamiento, reduciendo el error compuesto segun el paradigma OPD descrito en la literatura.
- Investigacion en algoritmos de RL: al estar entrenado con GRPO y 16 rollouts por paso, sirve como referencia para estudiar la estabilidad y el comportamiento de GRPO en entornos pequenos y controlados.
- Generacion de datos sinteticos para el entorno Cinema: puede emplearse para producir ejemplos de alta calidad sobre prompts de dificultad 0 de ese entorno concreto.
- Experimentos de destilacion cross-teacher: util como componente en estudios sobre sesgo de estilo en destilacion entre profesores, area cubierta por trabajos como "Lightning OPD 2.0".
- Reproduccion de experimentos academicos: al publicarse los metadatos de entrenamiento (grupo, proyecto, pasos), permite reproducir o auditar el proceso de ajuste.
- Base para ajustes posteriores en entornos similares: al ser un modelo pequeno con pesos safetensors, puede partirse de el para extender el entrenamiento a otros entornos de la coleccion RLVE.
- Evaluacion comparativa de profesores por entorno: sirve para comparar el rendimiento de distintos profesores especificos de entorno dentro de la misma coleccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia en FP16: aproximadamente 3,6 GB solo para los pesos, mas overhead de activaciones y cache KV.
- VRAM para inferencia en cuantizacion de 4 bits: del orden de 1-1,5 GB para los pesos, aunque el tipo de cuantizacion no esta confirmado en la informacion disponible.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM (RTX 3060, RTX 4060, RTX 4090). Para FP16 sin cuantizar, 8 GB es suficiente.
- GPU de centro de datos (A100, H100): sobredimensionadas para este tamano; utiles solo si se ejecutan muchos rollouts en paralelo para destilacion.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas modernas con 8 GB o mas.
- Opciones de despliegue: al estar en safetensors, es compatible con frameworks como vLLM, TGI, transformers y, tras conversion, llama.cpp u Ollama. No se confirma soporte explicito de GGUF en la informacion disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| opd-teacher-R1Distill-Cinema-step149 | 1,78B | no disponible | sin benchmarks publicados | no disponible | HuggingFace |
| DeepSeek-R1-Distill-Qwen-1.5B (modelo base) | 1,78B | no disponible | benchmarks publicados por DeepSeek | MIT en el modelo base | HuggingFace |
| Qwen2.5-1.5B-Instruct | 1,54B | 32.768 tokens (segun Qwen) | benchmarks publicados por Qwen | Apache 2.0 (segun Qwen) | HuggingFace |

Nota: los datos del modelo base y de Qwen2.5 corresponden a conocimiento general de esos modelos; la informacion proporcionada solo confirma los datos del modelo objeto de esta ficha. La comparativa con alternativas del mismo tamano puede considerarse orientativa, ya que no se dispone de benchmarks del modelo ajustado.

## Limitaciones y advertencias

- Modelo experimental: es un artefacto de investigacion para destilacion on-policy, no un modelo de proposito general optimizado para produccion.
- Especializacion estrecha: entrenado unicamente sobre prompts de dificultad 0 del entorno "Cinema", por lo que su comportamiento fuera de ese dominio es incierto.
- Riesgo de alucinacion: heredado del modelo base; no se han publicado evaluaciones de fiabilidad en la informacion disponible.
- Licencia no especificada: aunque el modelo base DeepSeek-R1-Distill-Qwen-1.5B dispone de licencia propia, la licencia de esta derivacion no esta declarada, lo que genera incertidumbre para uso comercial.
- Idiomas: no se especifican los idiomas soportados.
- Contexto: no se confirma la longitud de contexto efectiva tras el ajuste.
- Sesgos conocidos: no disponible.
- Cero descargas y cero "likes" en el momento de la consulta: modelo sin adopcion ni validacion por parte de la comunidad.
- Fecha de creacion registrada como 2026-09-30, coherente con los identificadores de entrenamiento del mismo ano.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/davidheineman/opd-teacher-R1Distill-Cinema-step149
- Coleccion RLVE OPD Teachers: https://huggingface.co/collections/davidheineman/rlve-opd-teachers
- Perfil del autor: https://huggingface.co/davidheineman
- Web personal del autor: https://davidheineman.com/
- Paper RLVE referenciado: https://arxiv.org/abs/2511.07317
- Lightning OPD 2.0: https://arxiv.org/html/2607.28449
- Survey of On-Policy Distillation: https://arxiv.org/html/2604.00626v3
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B

# GT1999/mwp-v2-llama1b-base-staged-stage3

## Resumen

El modelo `GT1999/mwp-v2-llama1b-base-staged-stage3` es un adaptador LoRA (Low-Rank Adaptation) diseñado para resolver problemas de matemáticas con texto (math word problems). Lo desarrolla el usuario GT1999 como parte de un pipeline experimental denominado `mwp-v2`, que combina las técnicas SeqFT (Sequence Fine-Tuning) y PLRS (Progressive Layer-wise Rank Scheduling) para entrenar modelos de lenguaje de forma incremental por niveles de dificultad. Este repositorio concreto corresponde a la tercera etapa de un entrenamiento curricular en el que se acumulan niveles de dificultad (L1 a L5) manteniendo un rango constante de 32.

El modelo base subyacente es un Llama de 1B de parámetros (según el nombre del repositorio), aunque no se especifica la variante exacta. El adaptador tiene un tamaño de 0.1 GB, lo que indica que solo contiene los pesos del LoRA, no el modelo completo. Su relevancia radica en explorar metodologías de entrenamiento por currículo y adaptación de bajo rango para tareas de razonamiento matemático, un área activa en la investigación de IA. Sin embargo, al ser un proyecto de investigación sin documentación completa, su uso práctico es limitado fuera del contexto experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre modelo base Llama 1B (variante no especificada) |
| Parametros totales | No disponible (el adaptador ocupa 0.1 GB; el modelo base tendria ~1B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors, el modelo base puede cuantizarse aparte) |
| Idiomas soportados | No disponibles (probablemente ingles, por el nombre "region:us", pero no confirmado) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador LoRA se entrena con rango 32 y alpha 64 (escalado alpha/r = 2). El entrenamiento sigue un esquema curricular por etapas: en la etapa 3, se acumulan los niveles de dificultad L1 a L5, con un programa de rango completo constante (32 -> 32 -> 32 -> 32 -> 32). Se utiliza una politica de "replay" acumulativo, lo que significa que en cada etapa se reutilizan ejemplos de niveles anteriores. La particion de etapas se basa en la dificultad de los problemas. El conjunto de entrenamiento acumulado en esta etapa es de 3329 ejemplos, con una validacion del 5% estratificada por nivel y semilla 42. El codigo de entrenamiento esta disponible en un repositorio de GitHub (commit `1967848696478b02e365550eb6da186f2d5b2bcf`).

No se proporcionan detalles sobre el dataset original, el numero total de tokens, ni si se aplicaron tecnicas como RLHF o DPO. La innovacion principal es la combinacion de SeqFT (fine-tuning secuencial) con PLRS (programacion progresiva del rango del LoRA), aunque en esta etapa el rango se mantiene constante, a diferencia de otras variantes del mismo proyecto (como `b7` que expande el rango de 32 a 128).

## Capacidades

- Especializado en resolver problemas de matematicas planteados en lenguaje natural (math word problems).
- Entrenado para manejar niveles de dificultad progresivos (L1 a L5), lo que sugiere capacidad de razonamiento matematico escalonado.
- Al ser un adaptador LoRA, se puede combinar con el modelo base Llama 1B para generar texto, pero su rendimiento fuera del dominio matematico no esta documentado.
- No se mencionan capacidades de tool calling, agentes, vision, audio ni modo de razonamiento explicito.
- El soporte multilingue es desconocido; el tag "region:us" sugiere que el dataset podria ser en ingles, pero no es concluyente.

## Casos de uso

- Investigacion academica en metodos de entrenamiento curricular: el modelo sirve como artefacto para estudiar como el orden de dificultad afecta al aprendizaje de razonamiento matematico en modelos pequenos.
- Benchmark de adaptadores LoRA: puede utilizarse para comparar el rendimiento de diferentes estrategias de rank scheduling (constante vs. expansivo) en tareas de matematicas.
- Prototipado de asistentes educativos: combinado con el modelo base, podria generar soluciones paso a paso para problemas de aritmetica y algebra elemental, aunque sin garantias de precision.
- Pruebas de transferencia de conocimiento: al ser un adaptador entrenado en niveles acumulativos, se puede evaluar si el conocimiento de niveles anteriores se retiene al avanzar a niveles superiores.
- Analisis de estabilidad de entrenamiento: el early stopping con paciencia muy alta (1.000.000) permite estudiar el comportamiento del modelo en regimen de sobreentrenamiento controlado.
- Reproducibilidad de experimentos: el codigo y los commits documentados permiten replicar el pipeline SeqFT+PLRS en otros modelos base o datasets.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras metricas estandar. El autor no proporciona comparaciones con otros modelos en la model card.

## Requisitos de hardware

- Al ser un adaptador LoRA de 0.1 GB, los requisitos de VRAM son minimos: se puede cargar sobre un modelo base Llama 1B cuantizado (por ejemplo, 4 bits) con menos de 2 GB de VRAM adicionales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para el modelo base + adaptador en precision completa; con cuantizacion, incluso CPUs son viables para inferencia lenta.
- Es compatible con frameworks que soporten LoRA, como Hugging Face PEFT, vLLM (con soporte de adaptadores), llama.cpp (si se convierte a GGUF) y Ollama (mediante importacion de adaptadores).
- La latencia dependera del modelo base; para Llama 1B en una GPU consumer (RTX 3060 o superior), se esperan decenas de tokens por segundo.
- Para entrenamiento o fine-tuning adicional, se necesitaria una GPU con al menos 8 GB de VRAM para cargar el modelo base y el optimizador.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa fiable. El modelo es un adaptador experimental sin benchmarks publicos, y no se conocen alternativas directas con el mismo enfoque (SeqFT+PLRS sobre Llama 1B). Se podria comparar con otros adaptadores LoRA para matematicas, como los basados en Llama 1B con fine-tuning estandar, pero no hay datos de rendimiento para sustentar la comparacion. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- Licencia no especificada: no se puede determinar si el modelo es de codigo abierto, de uso restringido o propietario. Esto impide su uso comercial sin autorizacion explicita.
- Sesgos y alucinaciones: al ser un modelo pequeno (1B) entrenado en un dataset reducido (3329 ejemplos), es probable que presente errores frecuentes en problemas complejos y alucinaciones en respuestas generativas.
- Dominio limitado: el adaptador solo ha sido entrenado para problemas de matematicas; su rendimiento en otras tareas de lenguaje no esta garantizado y probablemente sea pobre.
- Falta de documentacion: no se especifican los idiomas soportados, el contexto maximo, ni el dataset de entrenamiento, lo que dificulta su evaluacion y despliegue responsable.
- Riesgo de sobreajuste: el early stopping con paciencia extremadamente alta (1.000.000) sugiere que el entrenamiento podria haber continuado hasta el agotamiento del dataset, aumentando el riesgo de memorizacion en lugar de generalizacion.
- Formato de pesos: solo se distribuye el adaptador en safetensors; el usuario debe obtener el modelo base Llama 1B por separado, lo que anade complejidad de integracion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/GT1999/mwp-v2-llama1b-base-staged-stage3
- Repositorio de codigo (GitHub): https://github.com/gadmin7/mwp_ai4math_icml_v2
- Variante relacionada (b7 stage3): https://huggingface.co/GT1999/mwp-v2-llama1b-b7-stage3
- Busqueda de modelos con tag mwp-v2: https://huggingface.co/models?other=mwp-v2

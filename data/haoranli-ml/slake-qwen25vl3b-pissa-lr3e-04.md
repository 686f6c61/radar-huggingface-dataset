# haoranli-ml/slake-qwen25vl3b-pissa-lr3e-04

## Resumen

`haoranli-ml/slake-qwen25vl3b-pissa-lr3e-04` es un adaptador LoRA (PEFT) publicado por el usuario haoranli-ml sobre el modelo base multimodal Qwen/Qwen2.5-VL-3B-Instruct. El nombre del repositorio sugiere un ajuste fino sobre el conjunto de datos SLAKE (un benchmark de conocimiento medico visual) con un esquema de entrenamiento denominado "pissa" y una tasa de aprendizaje de 3e-04. El repositorio contiene unicamente los pesos del adaptador, no el modelo completo: el tamano del repo es de 0,2 GB, coherente con un adaptador LoRA sobre un modelo de 3B parametros.

El modelo base, Qwen2.5-VL-3B-Instruct, es un transformer multimodal desarrollado por Alibaba Qwen que procesa texto e imagenes, con capacidades de razonamiento visual, comprension de documentos y respuesta a instrucciones. Este adaptador concreto hereda esa arquitectura y anade los pesos entrenados para la tarea especifica de SLAKE, orientada a preguntas y respuestas sobre imagenes medicas.

La relevancia de esta ficha es limitada pero concreta: se trata de un artefacto de investigacion con cero descargas y cero likes en el momento de la consulta, sin model card sustantiva (la mayoria de campos estan marcados como "[More Information Needed]") y sin licencia declarada. Resulta util como referencia para quien quiera reproducir o inspeccionar un ajuste LoRA sobre Qwen2.5-VL-3B en el dominio medico, pero no es un modelo listo para produccion sin validacion adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer multimodal Qwen2.5-VL-3B-Instruct |
| Parametros totales | no disponible (adaptador; el modelo base tiene 3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en el adaptador; el modelo base Qwen2.5-VL-3B-Instruct soporta contexto largo, pero el valor exacto no se especifica en la informacion proporcionada |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA cargado mediante la libreria PEFT (version 0.21.2 segun la model card) sobre el modelo base Qwen/Qwen2.5-VL-3B-Instruct. Qwen2.5-VL-3B-Instruct es un transformer multimodal de la familia Qwen2.5-VL, disenado para tareas de vision-lenguaje, con un encoder visual y un decodificador de lenguaje. El adaptador modifica un subconjunto de pesos mediante matrices de bajo rango, lo que explica el reducido tamano del repositorio (0,2 GB).

Los detalles de entrenamiento no estan documentados en la model card: no se especifican el numero de tokens, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. El identificador del repositorio sugiere el uso del dataset SLAKE (conocimiento medico visual), una tecnica "pissa" (posiblemente relacionada con PiSSA, una variante de inicializacion de LoRA basada en descomposicion SVD) y una tasa de aprendizaje de 3e-04. No hay informacion sobre hiperparametros, regimen de precision (fp16, bf16, etc.) ni infraestructura de computo.

## Capacidades

- Generacion de texto condicionada por imagenes, heredada del modelo base Qwen2.5-VL-3B-Instruct.
- Respuesta a preguntas visuales (VQA) en el dominio medico, segun el nombre del repositorio (SLAKE).
- Comprension de documentos e imagenes, capacidad propia del modelo base.
- Soporte de instrucciones en formato chat, heredado del modelo base "Instruct".
- Tool calling y function calling: no disponible en la informacion proporcionada para el adaptador; el modelo base Qwen2.5-VL soporta estas capacidades, pero no se confirma su preservacion tras el ajuste.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles.
- Modo "thinking", vision o audio adicionales: no disponible.

## Casos de uso

- Investigacion en VQA medica: el adaptador puede emplearse para experimentar con preguntas y respuestas sobre imagenes radiologicas del dataset SLAKE, comparando el efecto del ajuste LoRA frente al modelo base.
- Reproduccion de experimentos: util para replicar el pipeline de ajuste "pissa" con tasa 3e-04 sobre Qwen2.5-VL-3B y validar resultados en el benchmark SLAKE.
- Prototipado de asistentes clinicos educativos: con validacion humana obligatoria, podria servir para generar descripciones preliminares de imagenes medicas en entornos de formacion.
- Evaluacion de tecnicas PEFT: sirve como caso de estudio para medir el impacto de LoRA/PiSSA en modelos multimodales pequenos (3B) frente a ajuste completo.
- Base para ajustes posteriores: al ser un adaptador ligero, puede combinarse o continuar entrenandose con otros datasets medicos sin reentrenar el modelo completo.
- Docencia y demostraciones: permite mostrar en un taller como se carga un adaptador PEFT con `transformers` y `peft` sobre un modelo multimodal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica para el adaptador; el modelo base Qwen2.5-VL-3B-Instruct en precision bf16 requiere del orden de 6-8 GB de VRAM solo para los pesos, mas memoria para el encoder visual y el contexto.
- GPU recomendadas: no disponible en la informacion proporcionada. Para un modelo de 3B en bf16, una RTX 4090 (24 GB) o una A100 (40/80 GB) son opciones habituales, pero no se confirma en la documentacion.
- Cabe en GPU de consumo: probablemente si en GPUs con 12-24 GB de VRAM, aunque no se especifica en la informacion disponible.
- Opciones de despliegue: al ser un adaptador PEFT, se carga con `transformers` + `peft`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI en la informacion proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| haoranli-ml/slake-qwen25vl3b-pissa-lr3e-04 (este) | Adaptador sobre 3B | no disponible | no disponible | Hugging Face, 0 descargas |
| Qwen/Qwen2.5-VL-3B-Instruct (base) | 3B | no disponible en esta ficha | no disponible en esta ficha | Hugging Face, ampliamente usado |
| Otros adaptadores LoRA sobre Qwen2.5-VL | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de modelos comparables adicionales en la informacion proporcionada.

## Limitaciones y advertencias

- La model card esta practicamente vacia: la mayoria de secciones contienen "[More Information Needed]", por lo que no hay garantias documentadas sobre el entrenamiento ni el uso previsto.
- No se declara licencia, lo que impide determinar si el uso comercial esta permitido. El modelo base Qwen2.5-VL tiene su propia licencia que debe consultarse por separado.
- El adaptador esta especializado en el dataset SLAKE (dominio medico); su rendimiento fuera de ese dominio no esta validado y probablemente degrade respecto al modelo base.
- Riesgo de alucinacion elevado en contextos medicos: cualquier salida debe ser revisada por profesionales y no debe usarse para diagnostico.
- Sesgos: no documentados, pero heredados del modelo base y del dataset de ajuste.
- Idiomas: no se especifican; el modelo base soporta varios idiomas, pero no se confirma su preservacion tras el ajuste.
- Cero descargas y cero likes: no hay evidencia de uso comunitario ni de validacion externa.
- El repositorio solo contiene el adaptador; es necesario descargar el modelo base Qwen/Qwen2.5-VL-3B-Instruct para utilizarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/haoranli-ml/slake-qwen25vl3b-pissa-lr3e-04
- Perfil del autor: https://huggingface.co/haoranli-ml
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
- Referencia citada en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora ML Impact: https://mlco2.github.io/impact

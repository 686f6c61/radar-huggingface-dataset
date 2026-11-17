# jgpandrade18/vanka_v01

## Resumen

vanka_v01 es un ajuste fino (LoRA) del modelo Qwen/Qwen3.5-4B desarrollado por el usuario jgpandrade18. Está diseñado para funcionar como orquestador y sub-agente dentro de un bucle de extracción multi-agente en paralelo: como orquestador divide las variables de una tarea en grupos y llama a `spawn_subagent` una vez por grupo, y como sub-agente extrae las variables asignadas del texto en formato JSON con evidencia literal. La respuesta final no la genera el modelo, sino código determinista de calculadoras.

El modelo se ha destilado a partir de Qwen3.6-35B-A3B (AWQ) sobre Qwen/Qwen3.5-4B, usando las calculadoras basadas en reglas de MedCalc-Bench (la función `calculate` corresponde a las implementaciones oficiales del benchmark). Cuenta con 4.205.751.296 parámetros y un repositorio de 9,0 GB, con pesos en safetensors y licencia Apache 2.0.

Es relevante porque demuestra que un modelo de 4B, mediante coordinación multi-agente y herramientas deterministas, puede igualar o superar a un profesor de 35B en la tarea de cálculo clínico, con un 80,9 % de precisión frente al 79,1 % del profesor orquestador, usando aproximadamente 2,4 veces menos tokens en la ruta crítica. El autor lo etiqueta explícitamente como prototipo de investigación, no apto para uso clínico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen/Qwen3.5-4B, con adaptador LoRA rsLoRA) |
| Parámetros totales | 4.205.751.296 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el profesor se destiló desde una versión AWQ; no se especifican cuantizaciones del modelo final) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors; incluye adaptador LoRA en `adapter/` para Qwen/Qwen3.5-4B |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer de 4B parámetros, y se ajusta mediante LoRA (rsLoRA) con r=64, alpha=16, aplicado a todas las capas lineales. El entrenamiento usó lr 2e-4, 1 época, batch efectivo de 16, bf16, kernels de Liger y gradient checkpointing; se completó en una RTX 4090 en 46 minutos con un pico de 13,2 GiB de VRAM. El adaptador se usa con la plantilla de chat del modelo base.

Los datos de entrenamiento consisten en 1.081 episodios correctos del profesor sobre el conjunto de entrenamiento de MedCalc-Bench (2.426 filas, con un máximo de 200 episodios por calculadora y dos pasadas de rejection sampling sobre filas que el profesor falló inicialmente), lo que produjo 4.228 muestras de llamadas a herramientas del orquestador y respuestas de sub-agente, con pérdida solo en los turnos del asistente. La innovación principal es la destilación de un profesor de 35B (Qwen3.6-35B-A3B en AWQ) hacia un modelo de 4B que opera en un bucle multi-agente con herramientas deterministas. Se probó una etapa GRPO sobre el rol de sub-agente, pero redujo la precisión (de 80,9 % a 75,3 %) y no forma parte del modelo publicado.

## Capacidades

- Generación de texto y razonamiento orientado a extracción de información estructurada.
- Extracción de variables clínicas desde notas de texto, devolviendo JSON con evidencia literal (verbatim).
- Tool calling / function calling: invoca `spawn_subagent` (una vez por grupo de variables, en paralelo) y `calculate` (calculadoras oficiales de MedCalc-Bench).
- Coordinación multi-agente: actúa como orquestador que divide la tarea en grupos y como sub-agente que resuelve cada grupo.
- Razonamiento multi-paso dentro del bucle de herramientas, con la respuesta final producida por código determinista.
- Capacidades multilingües: solo inglés (idioma declarado: en).
- Modo thinking: el harness espera el modelo con thinking desactivado (`--reasoning-parser qwen3` en vLLM, pero prompts sin thinking).

## Casos de uso

- Extracción estructurada de variables clínicas: el modelo recibe una nota y devuelve JSON con las variables asignadas y su evidencia literal, lo que permite alimentar pipelines de cálculo sin intervención manual.
- Orquestación de cálculos médicos basados en reglas: divide las variables de una calculadora (por ejemplo, scores clínicos) en grupos, lanza sub-agentes en paralelo y llama a `calculate` con los valores extraídos.
- Investigación en destilación multi-agente: sirve como caso de estudio reproducible de cómo un modelo de 4B destilado de un profesor de 35B puede igualar su precisión en una tarea acotada con menos tokens en la ruta crítica.
- Evaluación de benchmarks clínicos: integrable en el harness de MedCalc-Bench para medir precisión por variable y tasa de no respuesta en las 17 calculadoras basadas en reglas.
- Prototipado de asistentes de cálculo con verificación determinista: útil para demostrar arquitecturas en las que el modelo extrae datos y el código calcula, reduciendo el riesgo de errores aritméticos del LLM.
- Docencia y experimentación con tool calling y agentes: el repositorio incluye prompts, esquemas de herramientas y un demo que muestra el árbol de agentes de un episodio, lo que facilita su uso en cursos y talleres.
- Extracción de información en dominios con esquemas fijos: el patrón orquestador/sub-agente con evidencia literal es reutilizable en otros dominios donde las variables estén definidas de antemano.

## Benchmarks y rendimiento

Resultados en MedCalc-Bench Verified (test, 17 calculadoras basadas en reglas, n=340). APACHE II y Caprini se excluyen de la métrica principal por etiquetas poco fiables (el código oficial reproduce solo el 50 % y el 45 % de sus etiquetas de test).

| Condición | Precisión | Precisión por variable | Sin respuesta | Tokens en ruta crítica |
|---|---|---|---|---|
| Qwen3.5-2B, llamada única, sin entrenamiento | 9,4 % | 52,3 % | 68,5 % | 597 |
| vanka_v01 | 80,9 % | 93,2 % | 1,2 % | 647 |
| vanka_v01 + sub-agentes con 5 votos | 81,8 % | 93,4 % | 0,0 % | 703 |
| Profesor (35B), orquestador | 79,1 % | 92,8 % | 5,6 % | 1561 |
| Profesor (35B), agente único | 58,8 % | 88,0 % | 20,3 % | 666 |

vanka_v01 frente al profesor orquestador: +1,8 puntos, no significativo (McNemar exacto p=0,53), con aproximadamente 2,4 veces menos tokens en la ruta crítica.

## Requisitos de hardware

- VRAM estimada para inferencia: el entrenamiento usó 13,2 GiB de pico en una RTX 4090 con LoRA; la inferencia en bf16 de un modelo de 4B requiere del orden de 8-9 GB, aunque no se publica una cifra oficial.
- GPU recomendadas: RTX 4090 (usada en el entrenamiento), A100 y H100 para despliegues con mayor concurrencia; no se especifican requisitos oficiales.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 4090 y GPUs con 12 GB o más en bf16; en cuantizaciones menores no se detalla.
- Opciones de despliegue: vLLM con `--enable-auto-tool-choice --tool-call-parser qwen3_coder --reasoning-parser qwen3 --language-model-only`; el adaptador LoRA se usa con la plantilla de chat del modelo base. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible; el dato más cercano es el consumo de tokens en ruta crítica (647 tokens para vanka_v01 frente a 1561 del profesor orquestador).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión MedCalc-Bench Verified | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vanka_v01 | 4,2B | no disponible | 80,9 % | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-4B (base) | 4B | no disponible | no disponible | no disponible | Hugging Face |
| Qwen3.5-2B (sin entrenamiento) | 2B | no disponible | 9,4 % | no disponible | Hugging Face |
| Qwen3.6-35B-A3B (profesor, orquestador) | 35B (MoE) | no disponible | 79,1 % | no disponible | Hugging Face |

## Limitaciones y advertencias

- Prototipo de investigación: el autor indica explícitamente que no es apto para uso clínico y que no deben usarse sus salidas para tomar o apoyar decisiones médicas.
- Un solo benchmark, con notas sintéticas derivadas de PubMed y sin validación externa.
- Las etiquetas de entrenamiento provienen de episodios del profesor contrastados con etiquetas que el benchmark calculó a partir de extracciones de GPT-4; coincidir con la etiqueta no implica corrección clínica.
- El efecto de la coordinación a tamaño de modelo fijo no está aislado: no hay un control entrenado de agente único de 4B.
- Una etapa GRPO sobre el rol de sub-agente redujo la precisión (80,9 % a 75,3 %) y no forma parte del modelo.
- Idiomas: solo inglés; no se declara soporte multilingüe.
- Longitud de contexto: no disponible en la información proporcionada.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: no se publica una evaluación específica; el diseño mitiga errores aritméticos al delegar el cálculo en código determinista, pero la extracción de variables sigue dependiendo del modelo.
- Licencia Apache 2.0: permite uso comercial, pero las advertencias del autor sobre uso clínico deben respetarse.
- Para producción es necesario replicar el harness, los prompts y los esquemas de herramientas del repositorio; el modelo no funciona correctamente fuera de ese entorno.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jgpandrade18/vanka_v01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio de código, prompts y pipeline: https://github.com/Pires-De-Andrade/multiagent_classification
- Dataset de evaluación: https://huggingface.co/datasets/nsk7153/MedCalc-Bench-Verified
- Paper de MedCalc-Bench (Khandekar et al., NeurIPS 2024 Datasets and Benchmarks): no disponible en la información proporcionada.

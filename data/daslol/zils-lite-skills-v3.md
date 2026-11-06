# dasLOL/zils-lite-skills-v3

## Resumen

zils-lite-skills-v3 es un modelo derivado de Qwen/Qwen3.5-0.8B publicado por el usuario dasLOL dentro del ecosistema Zils, un conjunto de modelos orientados a tareas de decisión y clasificación en el contexto de la red Bittensor. No es un modelo conversacional de propósito general: se distribuye como un "soup-body", es decir, un cuerpo de pesos (lenguaje y visión) que debe acoplarse a un chasis de evaluación propietario del pool que aporta la capa de respuesta, el prompt y el runtime. El repositorio se declara compatible con endpoints y usa la librería transformers con código personalizado.

El modelo tiene 852.985.920 parámetros reales en safetensors (aproximadamente 0,85 mil millones) y un repositorio de 1,7 GB. Se construye mediante un promedio uniforme de tres modelos Apache-2.0 (vllm-sr/d3-lite, Maincode/Matilda-Decision-v1-Edge y zils-ai/jiwo-0.8b-full) seguido de dos fine-tunes completos de los pesos de lenguaje y una fusión tipo TIES que retiene el 25 % de mayor magnitud por tensor del vector de tarea promediado.

Su relevancia es acotada y muy específica: sirve como cuerpo evaluable en el pool z3 de su categoría de tamaño dentro de la infraestructura Zils/Bittensor, no como modelo autónomo para aplicaciones generales. La model card es explícita en que el chasis externo suministra la capa de respuesta y el prompt, lo que condiciona por completo su uso práctico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen/Qwen3.5-0.8B); pesos de lenguaje y visión según la model card |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponibles (la model card menciona datos en inglés: CMUdict, UniMorph, GLUE, PIQA, BIG-bench) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers, custom_code) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer decoder-only de aproximadamente 0,85 mil millones de parámetros, y hereda además pesos de visión según la descripción del autor ("language and vision weights"). La construcción es un ensamblaje en tres etapas: primero un "soup" por promedio uniforme de vllm-sr/d3-lite, Maincode/Matilda-Decision-v1-Edge y zils-ai/jiwo-0.8b-full, todos Apache-2.0; después dos fine-tunes de parámetros completos de los pesos de lenguaje entrenados desde el estudiante v2 y promediados con pesos 1/3 y 2/3; y finalmente una fusión TIES que conserva, por tensor, el 25 % de mayor magnitud del vector de tarea promediado y lo suma al soup.

Los datos de entrenamiento se dividen en dos ramas. La rama (a) usa aproximadamente 171.000 elementos: habilidades de familia conocida generadas por el proyecto (conteos aritméticos y de cobertura, comprobaciones de tool-call, CMUdict, UniMorph, CxC) más particiones de entrenamiento públicas de PIQA, 20 Newsgroups, conjuntos de clasificación de texto de SetFit, GLUE MRPC, QQP y CoLA, con replay de los datos v2. La rama (b) aplica destilación hacia las probabilidades del profesor vllm-sr/d3-ultra publicadas en zils-ai/zils-relay-answers: 73.000 elementos en inglés reconstruidos de tasksource y particiones de entrenamiento de benchmarks, más 14.800 elementos de opción múltiple de BIG-bench, también con replay v2. El autor declara que no se usaron datos del examen de validadores ni datos de clientes. No se documentan fases de RLHF o DPO.

## Capacidades

- Clasificación y decisión: el pipeline declarado es feature-extraction y las etiquetas incluyen "decision", lo que orienta el modelo a tareas de discriminación y elección entre opciones.
- Razonamiento aritmético y conteos: entrenado explícitamente con datos de conteos aritméticos y de cobertura.
- Verificación de tool-calls: la rama (a) incluye comprobaciones de llamadas a herramientas, por lo que puede evaluar la validez de una invocación.
- Comprensión lectora y opción múltiple: exposición a PIQA y a elementos de opción múltiple de BIG-bench.
- Clasificación de texto: entrenado con 20 Newsgroups, conjuntos SetFit y tareas GLUE (MRPC, QQP, CoLA).
- Capacidades lingüísticas léxicas: datos de CMUdict (pronunciación) y UniMorph (morfología).
- Procesamiento de visión: la model card menciona pesos de visión, aunque no se detalla la tarea concreta.
- Destilación de probabilidades: alineado con las distribuciones del profesor d3-ultra, lo que puede mejorar la calibración en tareas de elección.
- Soporte de agentes multi-paso: no disponible de forma explícita; el chasis externo aporta el prompt y el runtime.
- Capacidades multilingües: no acreditadas; los datos citados son mayoritariamente en inglés.

## Casos de uso

- Evaluación en el pool z3 de Bittensor: el uso previsto es servir como cuerpo evaluable en el chasis fijado del pool, donde el runtime externo aporta la capa de respuesta. Es adecuado porque el autor lo publica exactamente para esa función.
- Clasificación de texto en pipelines internos: gracias a su entrenamiento con 20 Newsgroups, SetFit y GLUE, puede emplearse como extractor de características o clasificador de frases en tareas de moderación o etiquetado, siempre con el chasis adecuado.
- Verificación de llamadas a herramientas en agentes: los datos de tool-call checks permiten usarlo como comprobador de validez de una invocación antes de ejecutarla en un orquestador.
- Razonamiento aritmético acotado: los conjuntos de conteos aritméticos y de cobertura lo hacen útil para validar respuestas numéricas simples en pipelines de control de calidad.
- Destilación y calibración: al estar alineado con las probabilidades del profesor d3-ultra, puede servir como estudiante en experimentos de destilación o como referencia calibrada en tareas de opción múltiple.
- Investigación sobre fusión de modelos: su construcción documentada (soup uniforme, dos fine-tunes promediados, TIES al 25 %) lo convierte en un caso de estudio reproducible para investigar técnicas de model merging.
- Comprensión lectora y opción múltiple: exposición a PIQA y BIG-bench permite usarlo en experimentos de evaluación de razonamiento cotidiano a pequeña escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 1,7 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 2 y 3 GB para contextos cortos.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,9 GB de pesos; en 4 bits, alrededor de 0,5 GB, aunque el repositorio no publica variantes cuantizadas.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM puede alojar los pesos en precisión completa; una RTX 3060, RTX 4060 o superior es suficiente. Para lotes grandes, A100 o H100 aportan margen de sobra.
- Cabe en GPU consumer: sí, en la práctica totalidad de tarjetas modernas con 4 GB o más.
- Opciones de despliegue: transformers con custom_code (requisito del repositorio); vLLM, llama.cpp, Ollama y TGI no están confirmados para este modelo y requerirían conversión previa, que no se documenta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| zils-lite-skills-v3 | 852.985.920 | no disponible | Apache-2.0 | Cuerpo soup para pool z3 (decisión, feature-extraction) | Hugging Face, requiere custom_code |
| Qwen/Qwen3.5-0.8B | ~0,8 B | no disponible | Apache-2.0 | Modelo base de propósito general | Hugging Face |
| vllm-sr/d3-lite | no disponible | no disponible | Apache-2.0 | Componente del soup Zils | Hugging Face |
| Maincode/Matilda-Decision-v1-Edge | no disponible | no disponible | Apache-2.0 | Componente del soup Zils orientado a decisión | Hugging Face |

La comparación directa con alternativas de propósito general no es equitativa: zils-lite-skills-v3 no se distribuye como modelo autónomo, sino como cuerpo acoplado a un chasis propietario, lo que limita la comparación a los componentes de su propio soup.

## Limitaciones y advertencias

- Dependencia del chasis: sin el chasis del pool z3 (capa de respuesta, prompt y runtime), el modelo no es utilizable de forma estándar; la model card lo declara explícitamente.
- Licencia Apache-2.0: permite uso comercial, pero obliga a conservar los avisos de atribución de Qwen/Qwen3.5-0.8B y de los modelos Zils de origen; deben revisarse los NOTICE de cada repositorio upstream.
- Idiomas: no se acreditan capacidades multilingües; los datos de entrenamiento citados son predominantemente en inglés, por lo que el rendimiento en castellano es incierto.
- Sesgos: los conjuntos GLUE, 20 Newsgroups y BIG-bench arrastran sesgos de sus fuentes; no se documenta ninguna mitigación.
- Alucinación: al ser un modelo de 0,85 B y orientado a decisión, el riesgo de generación factual incorrecta es alto si se usa fuera de su tarea prevista.
- Contexto: no se declara la longitud de contexto, lo que impide garantizar conversaciones multi-turno largas.
- Código personalizado: el tag custom_code implica que la carga requiere confiar en código del repositorio; conviene auditar antes de desplegar en producción.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, publicación reciente (noviembre de 2026) y sin benchmarks publicados; no hay evidencia externa de calidad.
- Datos de validadores: el autor declara no haber usado datos del examen de validadores ni datos de clientes, pero no es verificable de forma independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/dasLOL/zils-lite-skills-v3
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Componente del soup: https://huggingface.co/vllm-sr/d3-lite
- Componente del soup: https://huggingface.co/Maincode/Matilda-Decision-v1-Edge
- Componente del soup: https://huggingface.co/zils-ai/jiwo-0.8b-full
- Respuestas del profesor para destilación: https://huggingface.co/zils-ai/zils-relay-answers
- tasksource (Sileo, LREC-COLING 2024): no disponible enlace directo en la información proporcionada
- BIG-bench (Srivastava et al., 2022): no disponible enlace directo en la información proporcionada

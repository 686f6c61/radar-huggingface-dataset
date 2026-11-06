# mradermacher/LFM2.5-2.6B-junie-harbor-rl-v0.2-GGUF

## Resumen

LFM2.5-2.6B-junie-harbor-rl-v0.2-GGUF es una colección de cuantizaciones estáticas en formato GGUF del modelo vvsotnikov/LFM2.5-2.6B-junie-harbor-rl-v0.2, publicada por mradermacher. El modelo subyacente parte de la familia LFM2.5 de Liquid AI (2.697.198.592 parámetros, aproximadamente 2,6 mil millones) y ha sido ajustado mediante aprendizaje por refuerzo con GRPO y la librería TRL para tareas de agente de código y uso de herramientas (tool use). El repositorio no incluye la model card original del autor del modelo, por lo que los detalles sobre arquitectura interna, datos de entrenamiento y contexto no están documentados en la información disponible.

La relevancia de esta publicación es práctica: permite ejecutar un modelo especializado en agentes de código en hardware de consumo mediante llama.cpp y derivados (Ollama, LM Studio, etc.), con cuantizaciones desde Q2_K (1,2 GB) hasta f16 (5,5 GB). Es un modelo monolingüe en inglés, con licencia LFM Open License v1.0, y su orientación declarada es el razonamiento multi-paso con llamadas a herramientas dentro de flujos de agente de programación.

Al tratarse de una cuantización y no de un modelo original, el valor de esta ficha está en documentar con precisión los artefactos disponibles, los tamaños, los requisitos de hardware y las cautelas asociadas a un modelo de nicho con muy poca tracción pública (0 descargas y 0 likes en el momento de la publicación).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de la familia LFM2.5; no se detalla en la informacion proporcionada) |
| Parametros totales | 2.697.198.592 (~2,6 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | lfm-open-license-v1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base vvsotnikov/LFM2.5-2.6B-junie-harbor-rl-v0.2 se presenta con la etiqueta de pipeline "reinforcement-learning" y los tags grpo, trl, coding-agent y tool-use. Esto indica que sobre una base LFM2.5 de 2,6 mil millones de parámetros se aplicó un ajuste con aprendizaje por refuerzo mediante GRPO (Group Relative Policy Optimization) usando TRL, orientado a mejorar el comportamiento como agente de código y el uso de herramientas. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases previas de SFT o DPO.

La arquitectura interna del modelo base (tipo de transformer, mecanismos de atención, posible uso de capas híbridas o atención lineal propia de la familia LFM) no está documentada en los materiales proporcionados. La contribución de este repositorio es exclusivamente la cuantización: cuantizaciones estáticas generadas con el pipeline habitual de mradermacher (convert_type hf, output_tensor_quantised), sin versiones ponderadas/imatrix, que el autor indica que probablemente no publicará salvo petición en la discusión comunitaria.

## Capacidades

- Generación de texto conversacional en inglés, con formato de chat (tag "conversational").
- Agente de código: el ajuste con RL y los tags coding-agent y tool-use apuntan a resolución de tareas de programación multi-paso.
- Uso de herramientas y function calling, orientado a flujos de agente que invocan herramientas externas.
- Razonamiento multi-paso dentro de bucles de agente (planificación, ejecución, verificación), según la orientación declarada del ajuste.
- No se documentan capacidades de visión, audio ni modo "thinking" explícito en la información disponible.
- Capacidad multilingüe: no disponible; el modelo declara únicamente inglés.

## Casos de uso

- Agente de código en local: ejecutar el modelo con llama.cpp u Ollama en un portátil con GPU de consumo para tareas de edición de ficheros, generación de parches y ejecución de comandos dentro de un bucle de agente, aprovechando la cuantización Q4_K_M (1,8 GB) para mantener latencia baja.
- Automatización de tareas de refactorización en CI: integrar el modelo como paso de un pipeline que propone cambios acotados sobre un repositorio, con validación posterior mediante tests, dado su entrenamiento específico en tool use.
- Asistente de terminal para desarrolladores: desplegar el GGUF Q5_K_M (2,0 GB) con llama.cpp y exponer una API compatible con OpenAI para autocompletar comandos y explicar errores de compilación en inglés.
- Prototipado de agentes con TRL/GRPO: usar el modelo base (safetensors) como punto de partida para experimentos de RL sobre tareas de código, ya que el repositorio original documenta el pipeline de entrenamiento con GRPO.
- Evaluación de cuantizaciones: comparar la degradación de calidad entre Q2_K (1,2 GB) y Q8_0 (3,0 GB) en tareas de agente, usando el grafo de perplejidad referenciado en la model card como guía.
- Entornos con recursos muy limitados: desplegar la variante Q3_K_S (1,4 GB) en CPU o en GPUs integradas para tareas de clasificación de intención y generación de comandos cortos dentro de un agente mayor.
- Experimentación educativa: estudiar cómo un ajuste RL sobre un modelo de 2,6 B afecta al comportamiento de tool calling, al ser un modelo pequeño y ejecutable en una sola GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin caché KV): Q2_K ~1,2 GB; Q3_K_S ~1,4 GB; Q3_K_M ~1,5 GB; Q3_K_L ~1,6 GB; IQ4_XS ~1,6 GB; Q4_K_S ~1,7 GB; Q4_K_M ~1,8 GB; Q5_K_S y Q5_K_M ~2,0 GB; Q6_K ~2,3 GB; Q8_0 ~3,0 GB; f16 ~5,5 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones Q4/Q5; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son sobradas para el modelo completo en f16.
- Cabe en GPU de consumo: sí, en todas las cuantizaciones hasta Q8_0 en GPUs de 6 GB o más; f16 requiere ~6 GB efectivos contando caché KV.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el modelo base en safetensors puede servirse con vLLM o TGI, aunque el repositorio GGUF está pensado para llama.cpp.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM2.5-2.6B-junie-harbor-rl-v0.2 (este, GGUF) | ~2,6 B | no disponible | lfm-open-license-v1.0 | GGUF | Ajuste RL/GRPO para agente de codigo y tool use |
| mradermacher/LFM2.5-2.6B-GGUF | ~2,6 B | no disponible | lfm-open-license-v1.0 | GGUF | Cuantizacion del LFM2.5-2.6B base, sin ajuste RL especifico |
| mradermacher/LFM2.5-2.6B-opencode-RL-GGUF | ~2,6 B | no disponible | lfm-open-license-v1.0 | GGUF | Otra variante ajustada con RL para codigo (opencode) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo monolingüe en inglés: no se declara soporte de castellano ni de otros idiomas.
- Licencia LFM Open License v1.0: es una licencia propia, no OSI; antes de uso comercial hay que revisar los términos del fichero LICENSE del modelo base, ya que puede incluir restricciones adicionales.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente a alternativas; el ajuste RL es de nicho y con muy poca tracción (0 descargas, 0 likes).
- Riesgo de alucinación inherente a modelos de 2,6 B, especialmente en generación de código y llamadas a herramientas con argumentos inventados.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S) degradan la calidad; el autor recomienda Q4_K_S o Q4_K_M para uso general y Q6_K/Q8_0 cuando la calidad es prioritaria.
- No hay cuantizaciones ponderadas/imatrix disponibles; el autor indica que probablemente no las publicará salvo petición.
- La model card del repositorio no documenta la arquitectura, el contexto ni los datos de entrenamiento del modelo base; cualquier decisión de producción requiere consultar el repositorio original vvsotnikov/LFM2.5-2.6B-junie-harbor-rl-v0.2.
- Al ser una cuantización, los pesos no son los originales; para fine-tuning adicional conviene usar el modelo base en safetensors.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/LFM2.5-2.6B-junie-harbor-rl-v0.2-GGUF
- Modelo base: https://huggingface.co/vvsotnikov/LFM2.5-2.6B-junie-harbor-rl-v0.2
- Pagina de descargas del autor: https://hf.tst.eu/model#LFM2.5-2.6B-junie-harbor-rl-v0.2-GGUF
- Variante LFM2.5-2.6B base cuantizada: https://huggingface.co/mradermacher/LFM2.5-2.6B-GGUF
- Variante opencode-RL cuantizada: https://huggingface.co/mradermacher/LFM2.5-2.6B-opencode-RL-GGUF
- Peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafo de perplejidad de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9

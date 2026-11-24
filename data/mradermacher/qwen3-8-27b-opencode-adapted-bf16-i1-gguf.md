# mradermacher/Qwen3.8-27B-opencode-adapted-bf16-i1-GGUF

## Resumen

`mradermacher/Qwen3.8-27B-opencode-adapted-bf16-i1-GGUF` es una recopilación de cuantizaciones GGUF con imatrix (metodo i1) del modelo `prithivMLmods/Qwen3.8-27B-opencode-adapted-bf16`, un ajuste fino orientado a tareas de agentes y edición de código (etiquetas `opencode`, `agents`, `harbor`, `openenv`). El autor de las cuantizaciones es mradermacher, especializado en publicar versiones comprimidas de modelos abiertos para su uso con llama.cpp y ecosistemas compatibles.

El modelo base tiene 27.320.697.856 parámetros (aproximadamente 27,3 mil millones) y se distribuye bajo licencia Apache 2.0. Está entrenado sobre el ecosistema de entornos Harbor/OpenEnv con técnicas de RL (GRPO y async-GRPO) y adaptadores LoRA, según las etiquetas de la model card. El repositorio incluye únicamente pesos GGUF cuantizados (no safetensors), con un tamaño total de 220,5 GB repartido entre las distintas variantes.

Esta ficha se centra en la versión cuantizada i1-GGUF, que resulta relevante para desarrolladores que quieran ejecutar un modelo de 27B orientado a agentes en hardware de consumo o en servidores modestos, eligiendo el nivel de cuantización en función de la VRAM disponible. La model card no aporta detalles sobre arquitectura interna, contexto o datos de entrenamiento más allá de las etiquetas y los datasets citados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer, segun tags `transformers`) |
| Parametros totales | 27.320.697.856 (27,3 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (mas fichero imatrix) |
| Idiomas soportados | en (segun model card) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); el modelo base en safetensors/bf16 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base (`prithivMLmods/Qwen3.8-27B-opencode-adapted-bf16`). Por las etiquetas y el nombre se infiere que parte de una familia Qwen3 (27B) y que ha sido adaptado mediante LoRA y entrenamiento con refuerzo (GRPO y async-GRPO) sobre entornos de agentes (`harbor`, `openenv`), usando los datasets `harness-hub/scale800-harbor`, `harness-hub/harness-adapters`, `harness-hub/termgrade-train-harbor` y `ai-and/termgrade-environments`. La etiqueta `mtp` sugiere soporte de multi-token prediction, aunque no se aportan detalles técnicos.

No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF/DPO adicionales. Tampoco se documentan innovaciones como decodificación especulativa o atención lineal. Esta ficha se limita a lo declarado en la model card del repositorio de cuantizaciones y a los metadatos de Hugging Face.

## Capacidades

- Generación de texto conversacional (tag `conversational`).
- Orientación a tareas de agentes y razonamiento multi-paso (tags `agents`, `harbor`, `openenv`).
- Edición y asistencia de código en el contexto de `opencode`.
- Soporte declarado de tool calling / function calling a través de los entornos de agente (no se detalla el formato exacto).
- Entrenamiento con RL (GRPO, async-GRPO) orientado a mejorar el comportamiento en entornos de ejecución.
- Capacidad multimodal: la model card indica "This is a vision model", con ficheros `mmproj` disponibles en el repositorio estático (`mradermacher/Qwen3.8-27B-opencode-adapted-bf16-GGUF`).
- Soporte declarado de `text-generation-inference` como librería compatible.
- Idiomas: inglés (`en`) según la model card.

## Casos de uso

- Asistente de código en IDE o CLI: integrado en flujos tipo `opencode`, el modelo puede generar y editar código en un repositorio, aprovechando su adaptación a entornos de agente y su licencia Apache 2.0 para uso comercial.
- Automatización de tareas de terminal: los datasets `termgrade` y `harbor` apuntan a entrenamiento en ejecución de comandos y resolución de tareas de shell; útil para agentes que operan sobre máquinas virtuales o contenedores.
- Agente multi-paso con tool calling: adecuado para pipelines donde el modelo debe decidir qué herramienta invocar, ejecutar y validar el resultado, gracias al entrenamiento con GRPO sobre entornos.
- Evaluación de modelos en entornos reproducibles: el formato GGUF con imatrix permite desplegar el modelo en llama.cpp para experimentar con harness de agentes sin depender de GPUs de datacenter.
- Prototipado en hardware de consumo: las variantes i1-Q4_K_M (17,1 GB) o i1-IQ3_M (13,1 GB) permiten ejecutar un 27B en GPUs de 16-24 GB de VRAM.
- Investigación en RL para agentes: al estar entrenado con GRPO/async-GRPO, sirve como base para estudiar transferencia de políticas de agente a modelos cuantizados.
- Despliegue con visión: si se descargan los ficheros `mmproj` del repositorio estático, puede emplearse en tareas que combinen imagen y texto, aunque la model card no detalla el alcance multimodal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada según cuantización (tamaño de fichero como referencia mínima, más overhead de contexto y KV cache):
  - i1-Q2_K: ~11,3 GB
  - i1-IQ3_S: ~12,9 GB
  - i1-IQ3_M: ~13,1 GB
  - i1-Q3_K_M: ~13,8 GB
  - i1-Q4_K_S: ~15,9 GB
  - i1-Q4_K_M: ~17,1 GB
  - i1-Q5_K_M: ~19,7 GB
  - i1-Q6_K: ~22,5 GB
- GPU recomendadas: no especificadas por el autor. Por tamaño, una RTX 4090 (24 GB) puede alojar hasta i1-Q6_K; una RTX 4080/4070 Ti Super (16 GB) queda limitada a i1-Q4_K_S/i1-Q4_K_M con contexto moderado; GPUs de 24 GB o más (A10G, L4, A100 40/80 GB, H100) permiten contextos mayores.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) con cuantizaciones Q4-Q6; en GPUs de 16 GB con Q3-Q4 y contexto reducido.
- Opciones de despliegue: llama.cpp y derivados (Ollama, LM Studio, KoboldCpp), así como servidores compatibles con GGUF. El tag `text-generation-inference` sugiere compatibilidad con TGI, aunque el formato GGUF no es el nativo de TGI; se recomienda verificar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-opencode-adapted-bf16-i1-GGUF (este) | 27,3 B | no disponible | Apache 2.0 | GGUF i1 | Ajuste para agentes/código, visión declarada |
| Qwen3.8-27B-opencode-adapted-bf16 (base) | 27,3 B | no disponible | Apache 2.0 | safetensors bf16 | Pesos completos, sin cuantizar |
| Qwen3.8-27B-opencode-adapted-bf16-GGUF (estático) | 27,3 B | no disponible | Apache 2.0 | GGUF estático | Incluye ficheros `mmproj` para visión |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- Solo se declara soporte de inglés (`en`); el rendimiento en castellano no está verificado.
- No se documentan sesgos conocidos ni evaluación de alucinación; al ser un ajuste fino sobre un modelo base no identificado con detalle, estos riesgos deben evaluarse empíricamente.
- La longitud de contexto no está especificada, lo que impide planificar despliegues con ventanas largas sin pruebas previas.
- Las cuantizaciones de baja precisión (Q2, IQ2, Q3) degradan la calidad; para producción se recomienda Q4_K_M o superior.
- La model card no detalla el formato de tool calling ni la plantilla de chat; es necesario consultar el modelo base para integrarlo correctamente.
- El repositorio contiene únicamente GGUF; para fine-tuning o evaluación con transformers hay que acudir al modelo base en bf16.
- Aunque la licencia es Apache 2.0, conviene verificar la licencia del modelo base original por si impone restricciones adicionales.
- El tamaño total del repo (220,5 GB) obliga a descargar solo la variante necesaria; no se recomienda clonar completo.

## Enlaces

- Repositorio de cuantizaciones i1: https://huggingface.co/mradermacher/Qwen3.8-27B-opencode-adapted-bf16-i1-GGUF
- Repositorio de cuantizaciones estáticas (incluye `mmproj`): https://huggingface.co/mradermacher/Qwen3.8-27B-opencode-adapted-bf16-GGUF
- Modelo base: https://huggingface.co/prithivMLmods/Qwen3.8-27B-opencode-adapted-bf16
- Página de conveniencia del autor: https://hf.tst.eu/model#Qwen3.8-27B-opencode-adapted-bf16-i1-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Comparativa de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH: https://www.nethype.de/

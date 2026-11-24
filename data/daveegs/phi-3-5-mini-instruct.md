# daveegs/Phi-3.5-mini-instruct

## Resumen

Phi-3.5-mini-instruct es un modelo de lenguaje de tipo transformer decoder-only desarrollado por Microsoft Research, publicado originalmente en agosto de 2024 como parte de la familia Phi-3.5. Este repositorio concreto (`daveegs/Phi-3.5-mini-instruct`) es una réplica (mirror) del modelo oficial `microsoft/Phi-3.5-mini-instruct`, con licencia MIT y pesos en formato safetensors. Con 3.821 millones de parámetros, está diseñado para entornos con recursos limitados de memoria y cómputo, y para escenarios con requisitos estrictos de latencia.

El modelo se construye sobre los mismos datos que Phi-3 (datos sintéticos y sitios web públicos filtrados), con énfasis en datos densos en razonamiento de alta calidad, y soporta una longitud de contexto de 128.000 tokens. Ha pasado por un proceso de ajuste supervisado (SFT), optimización de política proximal (PPO) y optimización de preferencias directas (DPO) para mejorar la adherencia a instrucciones y las salvaguardas.

Su relevancia actual radica en que ofrece un rendimiento competitivo en tareas multilingües y de razonamiento con solo 3.8B de parámetros activos, lo que permite su despliegue en GPUs de consumo y en entornos de borde, compitiendo con modelos de mayor tamaño como Mistral-7B o Llama-3.1-8B en varios benchmarks multilingües.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (family Phi-3, `phi3` en transformers) |
| Parametros totales | 3.821.079.552 (3.8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors; el ecosistema admite GGUF/AWQ/GPTQ mediante conversiones de terceros) |
| Idiomas soportados | multilingue (sin listado cerrado de idiomas en la model card) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers, `custom_code` para `phi3`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Phi-3, con tokenizador y arquitectura `phi3` que requiere `trust_remote_code=True` en transformers (etiqueta `custom_code`). No es un modelo MoE: los 3.821 millones de parametros son todos activos en cada paso de inferencia. La model card no detalla el numero exacto de capas, dimensiones ocultas ni cabezas de atencion; esos datos deben consultarse en el informe tecnico de Phi-3 (arXiv:2404.14219).

El entrenamiento parte de los datos usados para Phi-3: datos sinteticos y sitios web publicos filtrados, con foco en datos densos en razonamiento de alta calidad. Sobre esa base se aplico un proceso de post-entrenamiento que combina ajuste supervisado (SFT), PPO y DPO. Respecto a la version de junio de 2024 (Phi-3 Mini 128k Instruct), esta version incorpora datos adicionales de post-entrenamiento que producen mejoras sustanciales en calidad multilingue, conversacion multi-turno y capacidad de razonamiento. La model card no especifica el volumen total de tokens de entrenamiento ni la composicion exacta del dataset.

## Capacidades

- Generacion de texto y conversacion multi-turno con contexto de hasta 128.000 tokens.
- Razonamiento denso, con enfasis declarado en codigo, matematicas y logica.
- Capacidades multilingues mejoradas respecto a Phi-3 Mini (MMLU multilingue, MGSM, MEGA MLQA, TyDi QA, XCOPA, XStoryCloze).
- Soporte de instrucciones y adherencia precisa mediante SFT + PPO + DPO.
- Compatible con text-generation-inference y endpoints-compatible segun las etiquetas del repositorio.
- Tool calling / function calling: no documentado explicitamente en la model card proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explicitamente en la model card proporcionada.
- Vision y audio: no disponibles en esta variante (existen variantes separadas `Phi-3.5-vision-instruct` y `Phi-3.5-MoE-instruct`).

## Casos de uso

- Asistentes en entornos con recursos limitados: el modelo cabe en GPUs de consumo y en dispositivos de borde, por lo que es adecuado para asistentes locales o embebidos donde no hay presupuesto para modelos de 7B-70B.
- Escenarios con latencia estricta: con 3.8B de parametros activos y sin overhead de MoE, ofrece tiempos de respuesta bajos en hardware modesto, apropiado para autocompletado o chat en tiempo real.
- Procesamiento de documentos largos: la ventana de 128.000 tokens permite resumir contratos, articulos o transcripciones extensas en una sola pasada sin trocear el contexto.
- Razonamiento sobre codigo y matematicas: el entrenamiento con datos densos en razonamiento lo hace util para explicar fragmentos de codigo, generar tests o resolver problemas matematicos paso a paso en herramientas de desarrollo.
- Aplicaciones multilingues: sus resultados en MMLU multilingue, MGSM y MEGA lo hacen adecuado para atencion al cliente o traduccion asistida en varios idiomas, especialmente cuando el presupuesto de computo es reducido.
- Prototipado e investigacion: al ser un modelo pequeno con licencia MIT, sirve como bloque base para experimentos de ajuste fino, evaluacion de tecnicas de alineacion o generacion de datos sinteticos.
- Despliegue en pipelines de CI/CD o herramientas internas: su tamano facilita la integracion en servicios contenerizados con requisitos de memoria moderados.

## Benchmarks y rendimiento

Resultados publicados en la model card (evaluacion multilingue):

| Benchmark | Phi-3.5 Mini-Ins | Phi-3.0-Mini-128k (jun 2024) | Mistral-7B-Instruct-v0.3 | Mistral-Nemo-12B-Ins-2407 | Llama-3.1-8B-Ins | Gemma-2-9B-Ins | Gemini 1.5 Flash | GPT-4o-mini (Chat) |
|---|---|---|---|---|---|---|---|---|
| Multilingual MMLU | 55.4 | 51.08 | 47.4 | 58.9 | 56.2 | 63.8 | 77.2 | 72.9 |
| Multilingual MMLU-Pro | 30.9 | 30.21 | 15.0 | 34.0 | 21.4 | 43.0 | 57.9 | 53.2 |
| MGSM | 47.9 | 41.56 | 31.8 | 63.3 | 56.7 | 75.1 | 75.8 | 81.7 |
| MEGA MLQA | 61.7 | 55.5 | 43.9 | 61.2 | 45.2 | 54.4 | 61.6 | 70.0 |
| MEGA TyDi QA | 62.2 | 55.9 | 54.0 | 63.7 | 54.5 | 65.6 | 63.6 | 81.8 |
| MEGA UDPOS | 46.5 | 48.1 | 57.2 | 58.2 | 54.1 | 56.6 | 62.4 | 66.0 |
| MEGA XCOPA | 63.1 | 62.4 | 58.8 | 10.8 | 21.1 | 31.2 | 95.0 | 90.3 |
| MEGA XStoryCloze | 73.5 | 73.6 | 75.5 | 92.3 | 71.0 | 87.0 | 20.7 | 96.6 |

No se han publicado en la informacion disponible resultados de benchmarks en ingles como MMLU, HumanEval o GSM8K para esta variante concreta.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 7.6 GB en fp16 (coincide con el tamano del repo); en cuantizacion de 8 bits alrededor de 4 GB; en 4 bits alrededor de 2-2.5 GB.
- GPU recomendadas: A100, H100 o L40S para produccion con contexto largo; RTX 4090, RTX 3090, A10G o L4 para inferencia en fp16.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y GPUs con 8 GB o mas en fp16; en 4 bits cabe en GPUs con 4-6 GB.
- Opciones de despliegue: transformers (requiere `trust_remote_code=True`), text-generation-inference (etiqueta `text-generation-inference`), vLLM, llama.cpp y Ollama mediante conversion a GGUF, y ONNX (existe una variante oficial `microsoft/Phi-3.5-mini-instruct-onnx`).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Phi-3.5-mini-instruct (este) | 3.8B | 128k | MIT | Multilingue, razonamiento denso, cabe en GPU de consumo |
| Phi-3.0-Mini-128k-Instruct | 3.8B | 128k | MIT | Version anterior; peor en multilingue y multi-turno |
| Llama-3.1-8B-Instruct | 8B | 128k | Llama 3.1 Community License | Mayor en MMLU multilingue (56.2 vs 55.4) y MGSM (56.7 vs 47.9); requiere mas VRAM |
| Mistral-7B-Instruct-v0.3 | 7B | 32k | Apache 2.0 | Peor en multilingue (47.4 vs 55.4) y MGSM (31.8 vs 47.9); contexto menor |
| Gemma-2-9B-Instruct | 9B | 8k | Gemma Terms of Use | Mejor en MMLU multilingue (63.8) y MGSM (75.1); contexto mucho menor y licencia mas restrictiva |

## Limitaciones y advertencias

- Sesgos conocidos: la model card no documenta sesgos especificos, pero advierte que el modelo no ha sido disenado ni evaluado para todos los casos de uso downstream; se recomienda evaluar y mitigar exactitud, seguridad y equidad antes de usarlo en escenarios de alto riesgo.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; la model card no cuantifica tasas de alucinacion.
- Limitaciones de contexto o idioma: aunque soporta 128k tokens, el rendimiento en contextos muy largos puede degradarse; el listado concreto de idiomas soportados no se detalla en la model card.
- Restricciones de licencia: licencia MIT, que permite uso comercial y modificacion con atribucion; la model card enlaza a la licencia oficial de Microsoft para Phi-3.5-mini-instruct.
- Caveats para produccion: requiere `trust_remote_code=True` en transformers por la etiqueta `custom_code`; este repositorio es un mirror de terceros (`daveegs`) con 0 descargas y 0 likes, por lo que conviene preferir el repositorio oficial `microsoft/Phi-3.5-mini-instruct` para trazabilidad y soporte.
- No dispone de vision ni audio en esta variante; para esas capacidades hay que usar `Phi-3.5-vision-instruct` o `Phi-3.5-MoE-instruct`.

## Enlaces

- Hugging Face (este repositorio): https://huggingface.co/daveegs/Phi-3.5-mini-instruct
- Repositorio oficial: https://huggingface.co/microsoft/Phi-3.5-mini-instruct
- Variante ONNX oficial: https://huggingface.co/microsoft/Phi-3.5-mini-instruct-onnx
- Variante MoE: https://huggingface.co/microsoft/Phi-3.5-MoE-instruct
- Variante vision: https://huggingface.co/microsoft/Phi-3.5-vision-instruct
- Phi-3 Portal: https://azure.microsoft.com/en-us/products/phi-3
- Blog tecnico Phi-3: https://aka.ms/phi3.5-techblog
- Informe tecnico Phi-3 (arXiv:2404.14219): https://arxiv.org/abs/2404.14219
- Phi-3 Cookbook: https://github.com/microsoft/Phi-3CookBook
- Demo: https://aka.ms/try-phi3.5mini
- Licencia: https://huggingface.co/microsoft/Phi-3.5-mini-instruct/resolve/main/LICENSE

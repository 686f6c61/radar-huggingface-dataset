# CheezOne/prompt-injection-jailbreak-detector-chinese-japanese-korean-english

## Resumen

El modelo `prompt-injection-jailbreak-detector-chinese-japanese-korean-english` es un clasificador de texto binario desarrollado por CheezOne que detecta intentos de inyección de prompt, jailbreak, extracción de system prompt y secretos, así como inyecciones indirectas ocultas en documentos o salidas de herramientas. Está pensado como guardrail local y de baja latencia para aplicaciones LLM y agentes, y cubre cuatro idiomas: chino, japonés, coreano e inglés.

Técnicamente se construye mediante fine-tuning del modelo base `jhu-clsp/mmBERT-small`, un transformer de tipo encoder (familia ModernBERT multilingüe) con 140.642.306 parámetros totales. El contexto arquitectónico del modelo base admite hasta 8k tokens, aunque el autor recomienda clasificar en fragmentos de 384 tokens o menos para documentos largos. Se distribuye bajo licencia Apache-2.0, con pesos en safetensors y exportaciones a ONNX y transformers.js para ejecución en navegador.

Su relevancia actual radica en que aborda una laguna habitual en los guardrails comerciales: la cobertura limitada de idiomas CJK. Frente a alternativas como ProtectAI deberta-v3-base-prompt-injection-v2 o Patronus wolf-defender, que caen a F1 en torno al 58-77 % en chino, japonés y coreano, este modelo reporta F1 entre 84,6 y 87,6 en esos idiomas, con una tasa de falsos positivos moderada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT multilingüe, base `jhu-clsp/mmBERT-small`) |
| Parámetros totales | 140.642.306 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 8k tokens según arquitectura; 384 tokens recomendados para clasificación |
| Tipos de cuantización | no disponible (se mencionan exportaciones ONNX y transformers.js) |
| Idiomas soportados | zh, ja, ko, en |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 0,6 GB); exportaciones ONNX |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de la familia ModernBERT, concretamente un fine-tuning de `jhu-clsp/mmBERT-small` (aproximadamente 141M de parámetros). Se trata de una cabeza de clasificación de texto con dos etiquetas: `BENIGN` (0) e `INJECTION` (1), que agrupa inyección directa, jailbreak, extracción de system prompt o secretos e inyección indirecta. El umbral por defecto es 0,5 y puede elevarse para priorizar precisión sobre recall.

El entrenamiento combina datos reales en inglés (aproximadamente 26k ejemplos) de siete datasets públicos —deepset/prompt-injections, jackhhao/jailbreak-classification, neuralchemy/Prompt-injection-dataset, TrustAIRLab/in-the-wild-jailbreak-prompts, Lakera/mosscap_prompt_injection, nvidia/Nemotron-RL-Agentic-Indirect-Prompt-Injection-v1 y SPML— con aproximadamente 15k ejemplos sintéticos generados con Qwen2.5-7B-Instruct para chino, japonés, coreano e inglés. Los sintéticos incluyen traducciones de semillas limpias en inglés, 12 técnicas de ataque directo nativas, peticiones benignas sobre 20 temáticas, negativos difíciles, inyecciones indirectas dentro de 12 tipos de documentos o salidas de herramientas, y documentos limpios. Se aplicaron filtros para eliminar rechazos, salidas en idioma incorrecto y muestras "indirectas" sin instrucción real.

La configuración de entrenamiento fue de 1 época, batch 16, learning rate 5e-5, longitud máxima 384, embeddings congelados y ejecución en CPU con bf16. No se menciona RLHF ni DPO; es un fine-tuning supervisado de clasificación.

## Capacidades

- Clasificación binaria de texto en `BENIGN` / `INJECTION` para entradas de usuario.
- Detección de jailbreaks, incluyendo peticiones de role-play maliciosas y técnicas de evasión.
- Detección de extracción de system prompt y secretos (por ejemplo, "repite todo el texto anterior").
- Detección de inyecciones indirectas en documentos, correos, tickets de Jira, exportaciones de Slack, READMEs, chunks de RAG y salidas de herramientas.
- Soporte multilingüe nativo en chino, japonés, coreano e inglés.
- Ejecución local de baja latencia: aproximadamente 101,4 ms por ejemplo en CPU compartida según el autor.
- Despliegue en navegador mediante transformers.js y exportación ONNX.
- Integración con `text-embeddings-inference` y endpoints compatibles, según los tags del repositorio.
- No soporta tool calling ni razonamiento multi-paso: es un clasificador, no un modelo generativo.

## Casos de uso

- Filtrado de entrada en aplicaciones LLM: clasificar cada mensaje del usuario antes de enviarlo al modelo principal y bloquear o marcar los que superen el umbral de 0,5, reduciendo el riesgo de secuestro de instrucciones en producción.
- Protección de agentes que leen contenido externo: pasar por el clasificador páginas web, correos, resultados de búsqueda o chunks de RAG antes de incorporarlos al contexto del agente, para detectar inyecciones indirectas ocultas en documentos.
- Guardrail en pipelines de atención al cliente multilingüe: cubrir conversaciones en chino, japonés, coreano e inglés con un único modelo, evitando mantener clasificadores separados por idioma.
- Moderación de entradas en asistentes de código: detectar intentos de manipular al asistente mediante comentarios en código, READMEs o issues (por ejemplo, instrucciones ocultas en un ticket de Jira) antes de que lleguen al modelo.
- Auditoría y monitorización de tráfico: ejecutar el clasificador sobre logs de conversaciones para medir la prevalencia de intentos de jailbreak y ajustar políticas de seguridad.
- Ejecución en el navegador o en el edge: desplegar la versión ONNX/transformers.js para prefiltrar entradas en el cliente sin enviar datos a un servidor, útil en aplicaciones con requisitos de privacidad.
- Segunda capa de defensa junto a un detector de PII: combinarlo con `CheezOne/pii-detector-chinese-japanese-korean-english` para cubrir tanto inyección como redacción de datos personales en el mismo pipeline.

## Benchmarks y rendimiento

Resultados reportados por el autor: F1 / tasa de falsos positivos (FPR) en %, mismo umbral (0,5) para todos los modelos. Conjunto held-out CJK/inglés de 3.245 mensajes y documentos con estilos y temas no vistos en entrenamiento.

| Modelo | 中文 | 日本語 | 한국어 | English | ms/ejemplo (CPU) |
|---|---|---|---|---|---|
| Este modelo (141M) | 87,6 / 13,9 | 87,3 / 8,8 | 84,6 / 10,8 | 92,3 / 8,5 | 101,4 |
| NeuralTrust prompt-guard-oss-small (141M) | 46,0 / 1,1 | 45,6 / 0,2 | 38,9 / 4,5 | 51,6 / 0,3 | 92,6 |
| devndeploy bert-prompt-injection-detector (178M) | 68,3 / 70,6 | 62,5 / 87,2 | 60,3 / 96,8 | 71,8 / 73,7 | 167,7 |
| Patronus wolf-defender (308M) | 59,9 / 0,0 | 77,0 / 0,6 | 58,0 / 1,3 | 69,7 / 0,3 | 217,3 |
| ProtectAI deberta-v3-base-prompt-injection-v2 (184M) | 68,1 / 34,1 | 60,0 / 21,6 | 58,6 / 33,5 | 69,5 / 16,9 | 392,1 |

Conjuntos de test públicos en inglés (F1 / FPR en %):

| Modelo | deepset test | jackhhao test | neuralchemy test | ms/ejemplo (CPU) |
|---|---|---|---|---|
| Este modelo (141M) | 89,9 / 0,0 | 89,0 / 2,8 | 96,4 / 4,6 | 101,4 |
| NeuralTrust prompt-guard-oss-small (141M) | 37,8 / 0,0 | 83,2 / 1,6 | 87,0 / 5,1 | 92,6 |
| devndeploy bert-prompt-injection-detector (178M) | 99,2 / 0,0 | 49,5 / 92,5 | 89,4 / 27,4 | 167,7 |
| Patronus wolf-defender (308M) | 66,7 / 0,0 | 93,1 / 0,8 | 96,2 / 2,3 | 217,3 |
| ProtectAI deberta-v3-base-prompt-injection-v2 (184M) | 53,7 / 0,0 | 86,1 / 2,0 | 91,7 / 2,8 | 392,1 |

Advertencias del propio autor: el conjunto held-out CJK fue generado por el mismo pipeline LLM que los datos de entrenamiento (con prompts y estilos distintos), y los tests en inglés son los splits oficiales de test de datasets cuyos splits de train se usaron para entrenar; ambos sesgan la evaluación a favor del modelo. Los modelos Prompt-Guard de Meta están restringidos (gated) y no se evaluaron.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 0,3 GB para los pesos (141M parámetros), más overhead de activaciones y tokenizador; en la práctica cabe en cualquier GPU con 1 GB o más.
- En CPU: inferencia viable; el autor reporta unos 101,4 ms por ejemplo en una CPU compartida.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) es sobrada; también A100/H100 para despliegues de alto throughput. El modelo no requiere GPU de datacenter.
- Cabe en GPU consumer y en hardware de gama baja; también se puede ejecutar en navegador vía transformers.js/ONNX.
- Opciones de despliegue: `transformers` (pipeline de text-classification), ONNX Runtime, transformers.js, `text-embeddings-inference` y endpoints compatibles según los tags. No se menciona soporte explícito de vLLM, llama.cpp, Ollama ni TGI (estos están orientados a modelos generativos).
- Throughput y latencia: latencia indicativa de 101,4 ms por ejemplo en CPU compartida; no se publican cifras de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | F1 CJK (aprox.) | F1 inglés (aprox.) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo | 141M | zh, ja, ko, en | 84,6-87,6 | 89-96 | Apache-2.0 | Hugging Face, ONNX, transformers.js |
| NeuralTrust prompt-guard-oss-small | 141M | no disponible | 38,9-46,0 | 37,8-87,0 | no disponible | Hugging Face |
| devndeploy bert-prompt-injection-detector | 178M | no disponible | 60,3-68,3 | 49,5-99,2 | no disponible | Hugging Face |
| Patronus wolf-defender | 308M | no disponible | 58,0-77,0 | 66,7-96,2 | no disponible | Hugging Face |
| ProtectAI deberta-v3-base-prompt-injection-v2 | 184M | no disponible | 58,6-68,1 | 53,7-91,7 | no disponible | Hugging Face |

La ventaja diferencial de este modelo es la cobertura equilibrada de los cuatro idiomas, especialmente en CJK, donde las alternativas caen notablemente. En inglés, devndeploy obtiene mejor F1 en deepset (99,2 frente a 89,9) y Patronus en jackhhao (93,1 frente a 89,0), pero ambos rinden peor en el resto de conjuntos y en CJK.

## Limitaciones y advertencias

- Detecta intentos, no intenciones: no conoce el system prompt ni las capacidades del agente, por lo que debe combinarse con diseño de herramientas de mínimo privilegio y comprobaciones de salida.
- Zona gris en role-play: peticiones benignas de persona ("actúa como entrevistador") pueden marcarse como inyección.
- Ataques codificados u ofuscados (base64, homoglifos masivos) solo están parcialmente cubiertos.
- Idiomas distintos de zh/ja/ko/en no están evaluados.
- La evaluación está sesgada a favor del modelo: el held-out CJK procede del mismo pipeline LLM que los datos de entrenamiento y los tests ingleses son splits de test de datasets usados en entrenamiento. Hay que validar sobre tráfico propio antes de confiar en las cifras.
- FPR no trivial en algunos idiomas (hasta 13,9 % en chino en el held-out), lo que puede generar bloqueos innecesarios si se usa con umbral 0,5; conviene ajustar el umbral según el coste de falsos positivos.
- Licencia Apache-2.0 permite uso comercial, pero los datos de entrenamiento tienen licencias Apache-2.0, MIT y CC-BY-4.0, con obligación de atribución para estos últimos.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica adopción todavía nula y ausencia de validación independiente por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CheezOne/prompt-injection-jailbreak-detector-chinese-japanese-korean-english
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-small
- Detector de PII de la misma familia: https://huggingface.co/CheezOne/pii-detector-chinese-japanese-korean-english
- Script de evaluación mencionado en la model card: `scripts/pi_bench.py` (incluido en el repositorio del modelo)
- Datasets de entrenamiento:
  - https://huggingface.co/datasets/deepset/prompt-injections
  - https://huggingface.co/datasets/jackhhao/jailbreak-classification
  - https://huggingface.co/datasets/neuralchemy/Prompt-injection-dataset
  - https://huggingface.co/datasets/TrustAIRLab/in-the-wild-jailbreak-prompts
  - https://huggingface.co/datasets/Lakera/mosscap_prompt_injection
  - https://huggingface.co/datasets/nvidia/Nemotron-RL-Agentic-Indirect-Prompt-Injection-v1
  - https://huggingface.co/datasets/reshabhs/SPML_Chatbot_Prompt_Injection
- Paper o blog del autor: no disponible
- Demo: no disponible

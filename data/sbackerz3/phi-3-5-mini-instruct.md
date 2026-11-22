# Sbackerz3/Phi-3.5-mini-instruct

## Resumen

Phi-3.5-mini-instruct es un modelo de lenguaje de tipo transformer denso desarrollado originalmente por Microsoft Research, distribuido en este repositorio de Hugging Face por el usuario Sbackerz3 bajo licencia MIT. Con 3.821 millones de parametros, se posiciona como un modelo ligero orientado a entornos con restricciones de memoria y computo, escenarios con latencia estricta y tareas que requieren razonamiento intensivo, especialmente en codigo, matematicas y logica. Soporta una longitud de contexto de 128.000 tokens, lo que lo hace adecuado para conversaciones multi-turno extensas y procesamiento de documentos largos.

El modelo pertenece a la familia Phi-3 y se entrena sobre una combinacion de datos sinteticos y sitios web publicos filtrados, con enfasis en datos de alta calidad y densidad de razonamiento. Esta version (3.5) incorpora datos de post-entrenamiento adicionales respecto a la release de junio de 2024, con mejoras sustanciales en calidad de conversacion multi-turno, capacidades multilingues y razonamiento. El proceso de alineacion combina supervised fine-tuning, optimizacion de politica proximal (PPO) y optimizacion de preferencias directas (DPO).

Su relevancia actual radica en que ofrece un equilibrio poco habitual entre tamano reducido (apto para GPU de consumo) y contexto muy largo, con un rendimiento en tareas multilingues y de razonamiento que compite con modelos de 7B a 9B parametros. Es una opcion practica para despliegues en produccion con presupuesto de hardware limitado, asi como para investigacion en tecnicas de eficiencia y alineacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Phi-3) |
| Parametros totales | 3.821.079.552 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (formato safetensors en BF16/FP16; cuantizaciones GGUF/AWQ no listadas en el repo) |
| Idiomas soportados | multilingue (sin lista cerrada de idiomas en la informacion) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Phi-3.5-mini-instruct es un transformer denso de 3.821 millones de parametros, sucesor directo de Phi-3-mini (junio de 2024). Mantiene el diseno de la familia Phi-3, con atencion estandar y soporte de contexto extendido hasta 128.000 tokens. No emplea arquitectura MoE ni mecanismos hibridos SSM; es un modelo denso convencional, lo que simplifica su despliegue y cuantizacion frente a alternativas con mezcla de expertos.

El entrenamiento se basa en los mismos datasets usados para Phi-3: datos sinteticos generados y sitios web publicos filtrados, con foco en datos de alta densidad de razonamiento. La fase de post-entrenamiento combina supervised fine-tuning, PPO y DPO, orientados a mejorar la adherencia a instrucciones y las medidas de seguridad. Respecto a la version de junio de 2024, esta release incorpora datos adicionales de post-entrenamiento que producen mejoras sustanciales en calidad de conversacion multi-turno, capacidades multilingues y razonamiento. La model card no detalla el numero exacto de tokens de entrenamiento ni la composicion porcentual del dataset.

## Capacidades

- Generacion de texto general y conversacion multi-turno con contexto de hasta 128.000 tokens.
- Razonamiento intensivo en codigo, matematicas y logica, segun la orientacion declarada del modelo.
- Capacidades multilingues, evaluadas en la model card sobre MMLU multilingue, MMLU-Pro multilingue, MGSM y tareas MEGA (MLQA, TyDi QA, UDPOS, XCOPA, XStoryCloze).
- Soporte de tool calling / function calling: no se menciona explicitamente en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no se detalla explicitamente en la informacion proporcionada.
- Modo thinking, vision o audio: no disponible (esta variante es exclusivamente de texto; las variantes vision y MoE se distribuyen en repositorios separados de la familia Phi-3.5).
- Integracion con text-generation-inference y endpoints compatibles, segun los tags del repositorio.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con historial extenso gracias a sus 128.000 tokens de contexto, manteniendo coherencia en dialogos largos y recuperando informacion de mensajes previos sin truncamiento.
- Generacion y revision de codigo en pipelines de CI/CD: su enfasis en razonamiento sobre codigo y logica lo hace util para revisiones automatizadas, generacion de tests y explicacion de errores en entornos con recursos limitados.
- Asistente de documentacion tecnica: con contexto largo puede procesar manuales completos o repositorios de documentacion y responder preguntas concretas citando secciones relevantes.
- Procesamiento de documentos legales o contractuales: la ventana de 128K permite analizar contratos extensos, extraer clausulas y resumir obligaciones en una sola pasada.
- Razonamiento matematico y resolucion de problemas paso a paso: adecuado para tutoria educativa o generacion de explicaciones detalladas en entornos con latencia estricta.
- Despliegue en el borde o en hardware de consumo: con 3.8B parametros, puede ejecutarse en GPU de gama media o incluso en CPU con cuantizacion, habilitando asistentes locales sin dependencia de la nube.
- Traduccion y tareas multilingues ligeras: su rendimiento en MGSM y MMLU multilingue lo hace viable para traduccion asistida y atencion multilingue en produccion.

## Benchmarks y rendimiento

Los datos publicados en la model card corresponden a evaluaciones multilingues. No se han publicado en la informacion disponible resultados de MMLU general, HumanEval, GSM8K ni otros benchmarks estandar de razonamiento y codigo.

| Benchmark | Phi-3.5 Mini-Ins | Phi-3.0-Mini-128k (jun 2024) | Mistral-7B-Instruct-v0.3 | Mistral-Nemo-12B-Ins-2407 | Llama-3.1-8B-Ins | Gemma-2-9B-Ins | Gemini 1.5 Flash | GPT-4o-mini (2024-07-18) |
|---|---|---|---|---|---|---|---|---|
| Multilingual MMLU | 55,4 | 51,08 | 47,4 | 58,9 | 56,2 | 63,8 | 77,2 | 72,9 |
| Multilingual MMLU-Pro | 30,9 | 30,21 | 15,0 | 34,0 | 21,4 | 43,0 | 57,9 | 53,2 |
| MGSM | 47,9 | 41,56 | 31,8 | 63,3 | 56,7 | 75,1 | 75,8 | 81,7 |
| MEGA MLQA | 61,7 | 55,5 | 43,9 | 61,2 | 45,2 | 54,4 | 61,6 | 70,0 |
| MEGA TyDi QA | 62,2 | 55,9 | 54,0 | 63,7 | 54,5 | 65,6 | 63,6 | 81,8 |
| MEGA UDPOS | 46,5 | 48,1 | 57,2 | 58,2 | 54,1 | 56,6 | 62,4 | 66,0 |
| MEGA XCOPA | 63,1 | 62,4 | 58,8 | 10,8 | 21,1 | 31,2 | 95,0 | 90,3 |
| MEGA XStoryCloze | 73,5 | 73,6 | 75,5 | 92,3 | 71,0 | 87,0 | 20,7 | 96,6 |

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 7,6 GB de pesos, mas overhead de activaciones y cache KV; se recomienda al menos 10-12 GB de VRAM para contexto moderado.
- VRAM estimada en cuantizacion de 8 bits: en torno a 4 GB de pesos; en 4 bits, en torno a 2 GB, aunque estas cifras son estimaciones tecnicas y no datos publicados en la informacion disponible.
- GPU recomendadas: A100, H100 o L40S para despliegues de produccion con contexto completo de 128K; RTX 4090, RTX 3090 o RTX A6000 para desarrollo y produccion a menor escala.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas de VRAM en cuantizacion de 8 bits, y en tarjetas de 4-6 GB en cuantizacion de 4 bits (estimacion).
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM, llama.cpp y Ollama mediante conversion a GGUF; el repositorio incluye tags de endpoints compatibles.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Phi-3.5-mini-instruct (este repo) | 3,82B | 128K | MIT | Hugging Face |
| Phi-3.0-mini-128k-instruct | 3,82B | 128K | MIT | Hugging Face |
| Mistral-7B-Instruct-v0.3 | 7,25B | 32K | Apache 2.0 | Hugging Face |
| Llama-3.1-8B-Instruct | 8,03B | 128K | Llama 3.1 Community License | Hugging Face |

En rendimiento multilingue, Phi-3.5-mini supera a Phi-3.0-mini en la mayoria de las metricas reportadas (MMLU multilingue, MMLU-Pro, MGSM, MLQA, TyDi QA, XCOPA) y a Mistral-7B-Instruct-v0.3 en todas las metricas de la tabla. Frente a Llama-3.1-8B-Instruct, obtiene mejores resultados en MMLU multilingue, MMLU-Pro, MLQA, TyDi QA, UDPOS y XCOPA, pero queda por debajo en MGSM y XStoryCloze. Frente a Gemma-2-9B-Instruct, queda por debajo en la mayoria de las metricas salvo XCOPA. No se dispone de comparativas de benchmarks de codigo o matematicas en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo se entrena sobre datos web filtrados y sinteticos, lo que puede introducir sesgos de representacion; la model card no detalla evaluaciones de sesgo especificas.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar contenido factualmente incorrecto con aparente seguridad, especialmente en dominios especializados no cubiertos por los datos de entrenamiento.
- Limitaciones de contexto: aunque soporta 128K tokens, el rendimiento puede degradarse en contextos muy largos; no se han publicado evaluaciones especificas de aguja en pajar para esta version.
- Limitaciones de idioma: la model card declara soporte multilingue sin enumerar idiomas concretos; el rendimiento fuera de los idiomas evaluados (MMLU multilingue, MGSM, MEGA) no esta documentado.
- Restricciones de licencia: licencia MIT, que permite uso comercial y modificacion con atribucion; el enlace de licencia apunta a la licencia del modelo original de Microsoft.
- Caveats para produccion: la model card advierte que el modelo no esta disenado ni evaluado para todos los propositos downstream; los desarrolladores deben evaluar y mitigar riesgos de precision, seguridad y equidad antes de usarlo en escenarios de alto riesgo.
- Repositorio de terceros: este repositorio es una redistribucion por el usuario Sbackerz3, no el repositorio oficial de Microsoft; conviene verificar la integridad de los pesos frente al repositorio original.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Sbackerz3/Phi-3.5-mini-instruct
- Repositorio oficial de Microsoft: https://huggingface.co/microsoft/Phi-3.5-mini-instruct
- Licencia MIT: https://huggingface.co/microsoft/Phi-3.5-mini-instruct/resolve/main/LICENSE
- Portal Phi-3: https://azure.microsoft.com/en-us/products/phi-3
- Blog tecnico Phi-3.5: https://aka.ms/phi3.5-techblog
- Informe tecnico Phi-3 (arXiv:2404.14219): https://arxiv.org/abs/2404.14219
- Phi-3 Cookbook: https://github.com/microsoft/Phi-3CookBook
- Demo interactiva: https://aka.ms/try-phi3.5mini
- Variante ONNX: https://huggingface.co/microsoft/Phi-3.5-mini-instruct-onnx
- Variante MoE: https://huggingface.co/microsoft/Phi-3.5-MoE-instruct
- Variante vision: https://huggingface.co/microsoft/Phi-3.5-vision-instruct

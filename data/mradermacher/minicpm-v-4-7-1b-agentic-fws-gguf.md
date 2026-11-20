# mradermacher/MiniCPM-V-4.7-1B-Agentic-FwS-GGUF

## Resumen

MiniCPM-V-4.7-1B-Agentic-FwS es un modelo multimodal de aproximadamente 1.006 millones de parámetros (1B) afinado para uso agéntico y tool calling, publicado por el usuario Plans11 y cuantizado a GGUF por mradermacher. Parte del modelo base Plans11/MiniCPM-V-4.7-1B-Agentic-FwS, que a su vez deriva de la familia MiniCPM-V de OpenBMB, orientada a visión-lenguaje de pequeño tamaño. El resultado es un modelo compacto pensado para ejecutarse en hardware modesto manteniendo capacidades de razonamiento, conversación multi-turno y llamada a herramientas.

La relevancia de esta ficha reside en su enfoque: no es un modelo generalista, sino un ajuste fino específico sobre datos agénticos de NVIDIA (Nemotron-SFT-Agentic-v4) y datasets propios del autor, con técnicas declaradas de SFT, LoRA fusionado, finetuning con sampling (FwS), DPO, RPO y aprendizaje por refuerzo (FlashReinforce). Está publicado bajo licencia Apache 2.0 y solo declara inglés como idioma, lo que acota su ámbito de uso.

Al tratarse de una cuantización estática en GGUF (desde Q2_K hasta f16), el modelo está pensado para despliegue en local con llama.cpp y herramientas compatibles, no para entrenamiento ni para inferencia en precisión completa salvo que se use el f16. El repositorio ocupa 9,7 GB e incluye 12 variantes de cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia MiniCPM-V); detalles internos no disponibles |
| Parametros totales | 1.006.209.856 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de su pertenencia a la familia MiniCPM-V, que combina un codificador visual con un modelo de lenguaje transformer. El dato concreto es el número de parámetros (1.006.209.856) y la naturaleza multimodal declarada en las etiquetas (multimodal, minicpm-v). No se especifican dimensiones de capas, número de cabezas, tipo de atención ni resolución de imagen soportada.

El proceso de entrenamiento sí está parcialmente documentado a través de las etiquetas y datasets: SFT sobre nvidia/Nemotron-SFT-Agentic-v4, ewin-reg/nemotron-sft-agentic-v4-fws-minicpmv47 y ewin-reg/Nemotron-Agentic-ToolCalling-FwS-MiniCPM-V-4.7-clean; aplicación de LoRA fusionado (merged-lora); finetuning con sampling (finetuning-with-sampling, asft); y etapas de preferencia y refuerzo con DPO, RPO y FlashReinforce. No se indica el número de tokens de entrenamiento ni la composición exacta del dataset más allá de los nombres de los repositorios. Esta cuantización GGUF no añade entrenamiento: es una conversión estática del modelo base.

## Capacidades

- Generación de texto conversacional multi-turno en inglés.
- Procesamiento multimodal (entrada de imagen junto a texto), según la etiqueta multimodal y la familia MiniCPM-V.
- Tool calling y function calling: el ajuste está explícitamente orientado a invocación de herramientas.
- Uso agéntico: razonamiento multi-paso, planificación y ejecución de acciones encadenadas.
- Modo de razonamiento explícito (thinking), indicado en las etiquetas reasoning y thinking.
- Razonamiento y resolución de tareas estructuradas derivadas del entrenamiento con datos Nemotron Agentic.
- Capacidades multilingües limitadas al inglés según la model card.
- No se declaran capacidades de audio ni de vídeo.

## Casos de uso

- Agentes de automatización de tareas: el ajuste sobre datos Nemotron Agentic permite encadenar llamadas a herramientas (APIs, bases de datos, sistemas de ficheros) en flujos multi-paso, con un modelo de 1B que cabe en entornos con recursos limitados.
- Asistentes de atención al cliente con acceso a herramientas: el modelo puede decidir cuándo consultar un CRM, un sistema de tickets o una base de conocimiento mediante function calling, manteniendo conversaciones multi-turno en inglés.
- Procesamiento de documentos con imagen: al ser multimodal, puede extraer información de capturas, formularios escaneados o diagramas y combinarla con texto para responder consultas.
- Orquestación de pipelines en local: su tamaño (0,6-2,1 GB según cuantización) permite desplegarlo en portátiles o servidores de gama baja como planificador de agentes que delega en modelos mayores.
- Prototipado de sistemas agénticos: útil para validar diseños de tool calling y bucles de razonamiento antes de escalar a modelos de mayor tamaño, gracias a su bajo coste de inferencia.
- Automatización de soporte técnico interno: consulta de estado de servicios, ejecución de comandos controlados y generación de resúmenes a partir de información multimodal, con la ventaja de que el modelo puede ejecutarse íntegramente en local sin enviar datos a la nube.
- Evaluación de técnicas de ajuste agéntico: sirve como referencia reproducible para comparar SFT, DPO, RPO y FlashReinforce en un modelo pequeño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6 GB en Q2_K, 0,7-0,8 GB en Q4_K_S/Q4_K_M, 0,9 GB en Q6_K, 1,2 GB en Q8_0 y 2,1 GB en f16 (tamaños de fichero del repositorio; la VRAM real depende del contexto y del backend).
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM es suficiente para las cuantizaciones Q4-Q8; para f16 basta con 4 GB. GPU de datacenter (A100, H100) no son necesarias y aportarían poco para un modelo de 1B.
- Cabe en GPU consumer: sí, en RTX 3060, RTX 4060, RTX 4090 y prácticamente cualquier GPU con 4 GB o más; también en iGPU y CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y otros backends compatibles con GGUF. Para el modelo base en safetensors, transformers con soporte MiniCPM-V.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Por el tamaño, se espera una latencia muy baja en GPU consumer, pero no se aportan cifras medidas.
- Nota: el repositorio incluye el proyector multimodal (mmproj) al no haberse omitido en la conversión (skip_mmproj vacío), por lo que se requiere el fichero mmproj correspondiente para entrada de imagen.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Tool calling | Licencia | Formato |
|---|---|---|---|---|---|---|
| MiniCPM-V-4.7-1B-Agentic-FwS (este) | 1,006B | no disponible | Sí | Sí (ajuste específico) | Apache 2.0 | GGUF |
| MiniCPM-V 2.6 (OpenBMB) | ~8B | no disponible | Sí | Parcial | Apache 2.0 / modelo | safetensors, GGUF |
| Qwen2.5-VL-3B | ~3B | no disponible | Sí | Sí | Apache 2.0 | safetensors, GGUF |
| SmolVLM-500M / 2B (HuggingFace) | 0,5-2B | no disponible | Sí | Limitado | Apache 2.0 | safetensors, GGUF |

La comparación es orientativa: no se dispone de datos de benchmarks del modelo evaluado, por lo que no puede establecerse una comparación de rendimiento cuantitativa. La principal ventaja diferencial es su tamaño de 1B con ajuste agéntico explícito y licencia Apache 2.0; sus alternativas ofrecen mayor tamaño (Qwen2.5-VL-3B, MiniCPM-V 2.6) o menor (SmolVLM-500M), pero ninguna de las listadas declara un entrenamiento tan específico en tool calling.

## Limitaciones y advertencias

- Solo inglés declarado: no hay evidencia de soporte multilingüe, por lo que su uso en castellano no está validado.
- Riesgo de alucinación: como todo modelo de 1B, la capacidad de razonamiento es limitada y puede inventar llamadas a herramientas, argumentos o resultados.
- Contexto no documentado: se desconoce la ventana de contexto máxima, lo que impide planificar despliegues con documentos largos sin pruebas previas.
- Sesgos: no se documentan evaluaciones de sesgo; al entrenarse sobre datos Nemotron y datasets propios, puede heredar sesgos de esas fuentes.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene revisar las licencias de los datasets de entrenamiento por si imponen restricciones adicionales.
- Modelo derivado de un ajuste comunitario (Plans11) sobre la familia MiniCPM-V: no es una versión oficial de OpenBMB, por lo que la calidad del ajuste no está avalada por el equipo original.
- Cuantizaciones de baja precisión (Q2_K, Q3_K_S) pueden degradar notablemente el tool calling, que es sensible a errores de formato.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento frente a alternativas.
- Fecha de creación futura en los metadatos (2026-11-20): dato anómalo que conviene verificar antes de confiar en la ficha del repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/MiniCPM-V-4.7-1B-Agentic-FwS-GGUF
- Modelo base: https://huggingface.co/Plans11/MiniCPM-V-4.7-1B-Agentic-FwS
- Página de descargas del cuantizador: https://hf.tst.eu/model#MiniCPM-V-4.7-1B-Agentic-FwS-GGUF
- Dataset Nemotron SFT Agentic v4: https://huggingface.co/datasets/nvidia/Nemotron-SFT-Agentic-v4
- Dataset de ajuste FwS: https://huggingface.co/datasets/ewin-reg/nemotron-sft-agentic-v4-fws-minicpmv47
- Dataset de tool calling limpio: https://huggingface.co/datasets/ewin-reg/Nemotron-Agentic-ToolCalling-FwS-MiniCPM-V-4.7-clean
- Guía de uso de GGUF (referencia TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9

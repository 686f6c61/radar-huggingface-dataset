# mradermacher/Qwensploit-V2-9B-CyberSecurity-Qwen3.5-GGUF

## Resumen

Qwensploit-V2-9B-CyberSecurity-Qwen3.5 es un modelo de lenguaje de 9.197.093.888 parámetros (aproximadamente 9,2 mil millones) especializado en ciberseguridad, ajustado mediante instrucciones y orientado a tareas de red team, pentesting, investigación de vulnerabilidades, análisis de seguridad y CTF. El modelo original fue desarrollado por el usuario fantasyx07 sobre una base Qwen 3.5, y esta ficha corresponde a la versión cuantizada en GGUF publicada por mradermacher, un conocido distribuidor de cuantizaciones estáticas para llama.cpp y ecosistemas compatibles.

El modelo se distribuye exclusivamente en formato GGUF con una amplia gama de cuantizaciones que van desde Q2_K (4,0 GB) hasta f16 (18,5 GB), además de dos ficheros mmproj (multi-modal supplement) que sugieren capacidades de entrada multimodal heredadas de la arquitectura base. Está etiquetado como compatible con text-generation-inference y transformers, aunque el formato principal de distribución es GGUF para inferencia local.

Su relevancia radica en la combinación de un tamaño contenido (9B) con un ajuste fino específico sobre siete datasets de ciberseguridad, lo que permite desplegar un asistente especializado en seguridad ofensiva y análisis de vulnerabilidades en hardware de consumo. La licencia es "other", lo que obliga a revisar los términos del modelo base antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen 3.5, con soporte multi-modal vía mmproj); detalles de capas y atención no disponibles |
| Parametros totales | 9.197.093.888 (~9,2 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (inglés) |
| Licencia | other |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer derivado de Qwen 3.5, según indican las etiquetas `qwen3_5` y `qwen3.5`. El modelo fue ajustado mediante instrucciones (instruction-tuning) y técnicas de LoRA/PEFT según las etiquetas `lora`, `peft` y `unsloth`, lo que sugiere un ajuste eficiente sobre el modelo base fantasyx07/Qwensploit-V2-9B-CyberSecurity-Qwen3.5. La presencia de ficheros mmproj indica que la arquitectura base incorpora un codificador multimodal (visión), aunque la model card no detalla su funcionamiento ni los datos multimodales empleados.

El entrenamiento se realizó sobre siete datasets de ciberseguridad: PentesterFlow/OffsecCyber, ChaoticNeutrals/Cybersecurity-ShareGPT, Voidreaper2026/cybersec-master-dataset, Trendyol/Trendyol-Cybersecurity-Instruction-Tuning-Dataset, saidutta69/CyberSec-Reasoning-Premium, saidutta69/qwen3.8-max-distillation-50k-clean y xtools-at/Claude-Haiku-5.5-High-Reasoning-TraceInversion-3000x. No se especifica el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO. La etiqueta `mtp` (multi-token prediction) aparece en los tags, lo que podría indicar soporte de predicción multi-token, pero no se documenta su implementación.

## Capacidades

- Generación de texto y razonamiento especializado en ciberseguridad: análisis de vulnerabilidades, explicación de vectores de ataque y razonamiento sobre escenarios de seguridad.
- Soporte de red team y pentesting: generación de payloads, comandos y procedimientos ofensivos según los datasets de entrenamiento.
- Investigación de vulnerabilidades y análisis de seguridad: interpretación de CVEs, análisis de configuraciones y revisión de código con orientación a seguridad.
- Resolución de retos CTF (Capture The Flag): razonamiento multi-paso orientado a explotación y análisis.
- Razonamiento instruccional (instruction-tuning): sigue instrucciones conversacionales y mantiene diálogos multi-turno.
- Capacidades multimodales potenciales: la presencia de ficheros mmproj sugiere entrada de imágenes, aunque no se documenta su alcance ni su calidad.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y multi-step reasoning: el tag `reasoning` y el dataset de trazas de razonamiento de Claude Haiku 5.5 sugieren razonamiento multi-paso, pero no se detalla el soporte de agentes.
- Capacidades multilingües: limitadas al inglés según el campo `language`.

## Casos de uso

- Asistente de pentesting en laboratorio: el modelo puede generar comandos, explicar técnicas de explotación y guiar pruebas de penetración sobre entornos controlados, aprovechando su ajuste sobre datasets como OffsecCyber y Cybersecurity-ShareGPT.
- Análisis de vulnerabilidades en revisión de código: dado un fragmento de código, el modelo puede señalar patrones inseguros y proponer mitigaciones, adecuado por su entrenamiento en instrucciones de seguridad.
- Formación en ciberseguridad: servir como tutor conversacional para explicar conceptos de red team, vectores de ataque y defensas, con diálogos multi-turno.
- Resolución asistida de retos CTF: el modelo puede razonar sobre pistas, proponer hipótesis de explotación y generar scripts de apoyo en competiciones de seguridad.
- Generación de informes de seguridad: redactar hallazgos, descripciones de vulnerabilidades y recomendaciones a partir de notas técnicas, gracias a su capacidad de generación de texto estructurado.
- Despliegue local en estaciones de trabajo de seguridad: con cuantizaciones Q4_K_M (5,9 GB) o Q5_K_M (6,7 GB) puede ejecutarse en GPUs de consumo, lo que permite usarlo en entornos air-gapped donde no se puede enviar código sensible a APIs externas.
- Automatización de triaje de alertas: clasificar y resumir alertas de seguridad en inglés, integrable en pipelines locales mediante llama.cpp u Ollama.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según tamaño de cuantización):
  - Q2_K: ~4,0 GB de pesos; ~5-6 GB de VRAM con contexto moderado.
  - Q3_K_M: ~4,8 GB; ~6-7 GB de VRAM.
  - IQ4_XS: ~5,5 GB; ~7-8 GB de VRAM.
  - Q4_K_M: ~5,9 GB; ~7-8 GB de VRAM.
  - Q5_K_M: ~6,7 GB; ~8-9 GB de VRAM.
  - Q6_K: ~7,7 GB; ~9-10 GB de VRAM.
  - Q8_0: ~9,9 GB; ~11-12 GB de VRAM.
  - f16: ~18,5 GB; ~20 GB de VRAM.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090, A100, H100. Para cuantizaciones Q4/Q5 basta una GPU de 8-12 GB.
- Cabe en GPU de consumo: sí, desde Q2_K hasta Q6_K en GPUs de 8-12 GB; Q8_0 requiere 12-16 GB; f16 requiere GPUs de 24 GB o más.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-inference (según tags), transformers con soporte GGUF. vLLM no está confirmado para este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| Qwensploit-V2-9B-CyberSecurity-Qwen3.5 (esta ficha) | ~9,2 B | no disponible | Ciberseguridad / red team | other | GGUF |
| Modelos base Qwen 3.5 de tamaño similar | ~9 B (aprox.) | no disponible | Generalista | según Qwen | safetensors/GGUF |
| Modelos de seguridad de 7-8 B (p. ej. WhiteRabbitNeo, PentestGPT) | 7-8 B | no disponible | Ciberseguridad | variable | GGUF/safetensors |

No se dispone de datos de benchmarks que permitan comparar rendimiento cuantitativo con alternativas. La comparativa se limita a parámetros, licencia y formato.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados, pero el entrenamiento sobre datasets de seguridad ofensiva puede producir respuestas sesgadas hacia técnicas de ataque sin suficiente contexto ético o defensivo.
- Riesgo de alucinación: elevado en un modelo de 9B especializado; puede generar comandos, CVEs o procedimientos plausibles pero incorrectos, especialmente en cuantizaciones bajas (Q2_K, Q3_K_S).
- Limitaciones de contexto e idioma: solo inglés declarado; la longitud de contexto no está documentada.
- Restricciones de licencia: licencia "other"; es imprescindible revisar los términos del modelo base (fantasyx07/Qwensploit-V2-9B-CyberSecurity-Qwen3.5) y de Qwen 3.5 antes de uso comercial.
- Uso dual: el modelo está orientado a seguridad ofensiva; su uso debe limitarse a entornos autorizados (laboratorios, CTF, pentesting con permiso). No se documentan salvaguardas.
- Cuantizaciones estáticas sin imatrix: el autor indica que no hay cuantizaciones ponderadas/imatrix disponibles, lo que puede degradar la calidad en cuantizaciones bajas.
- Sin datos de benchmarks ni de evaluación de seguridad: no hay evidencia publicada de su rendimiento real frente a alternativas.

## Enlaces

- Hugging Face (esta versión GGUF): https://huggingface.co/mradermacher/Qwensploit-V2-9B-CyberSecurity-Qwen3.5-GGUF
- Modelo base: https://huggingface.co/fantasyx07/Qwensploit-V2-9B-CyberSecurity-Qwen3.5
- Página de overview de cuantizaciones: https://hf.tst.eu/model#Qwensploit-V2-9B-CyberSecurity-Qwen3.5-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de calidad de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Dataset PentesterFlow/OffsecCyber: https://huggingface.co/datasets/PentesterFlow/OffsecCyber
- Dataset ChaoticNeutrals/Cybersecurity-ShareGPT: https://huggingface.co/datasets/ChaoticNeutrals/Cybersecurity-ShareGPT
- Dataset Voidreaper2026/cybersec-master-dataset: https://huggingface.co/datasets/Voidreaper2026/cybersec-master-dataset
- Dataset Trendyol/Trendyol-Cybersecurity-Instruction-Tuning-Dataset: https://huggingface.co/datasets/Trendyol/Trendyol-Cybersecurity-Instruction-Tuning-Dataset
- Dataset saidutta69/CyberSec-Reasoning-Premium: https://huggingface.co/datasets/saidutta69/CyberSec-Reasoning-Premium
- Dataset saidutta69/qwen3.8-max-distillation-50k-clean: https://huggingface.co/datasets/saidutta69/qwen3.8-max-distillation-50k-clean
- Dataset xtools-at/Claude-Haiku-5.5-High-Reasoning-TraceInversion-3000x: https://huggingface.co/datasets/xtools-at/Claude-Haiku-5.5-High-Reasoning-TraceInversion-3000x

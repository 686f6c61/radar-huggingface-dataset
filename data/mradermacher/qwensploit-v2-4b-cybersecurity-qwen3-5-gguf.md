# mradermacher/Qwensploit-V2-4B-CyberSecurity-Qwen3.5-GGUF

## Resumen

Qwensploit-V2-4B-CyberSecurity-Qwen3.5 es un modelo de lenguaje de 4.326.350.848 parámetros (aproximadamente 4,3 mil millones) especializado en ciberseguridad ofensiva y defensiva. Lo desarrolla el usuario xtools-at sobre una base de la familia Qwen 3.5, y esta ficha concreta corresponde a la versión cuantizada en GGUF publicada por mradermacher, un conocido distribuidor de cuantizaciones estáticas para llama.cpp y ecosistemas compatibles. El modelo está afinado mediante instrucciones (instruction tuning) con LoRA/PEFT sobre un conjunto de datasets orientados a pentesting, red team, análisis de vulnerabilidades y resolución de retos CTF.

El problema que aborda es la falta de modelos pequeños, desplegables en hardware modesto, que mantengan un razonamiento técnico sólido en dominios de seguridad: análisis de tráfico, explotación guiada, interpretación de salidas de herramientas como nmap, Burp o Metasploit, y explicación de técnicas de escalada de privilegios. Al estar basado en Qwen 3.5, hereda las capacidades multilingües y de razonamiento de esa familia, aunque el ajuste fino se ha realizado exclusivamente en inglés.

Esta versión GGUF es relevante porque permite ejecutar el modelo en local con llama.cpp, Ollama o LM Studio, sin necesidad de GPUs de datacenter, y ofrece un abanico amplio de cuantizaciones (desde Q2_K hasta Q8_0, además de IQ4_XS) para ajustar el equilibrio entre calidad y consumo de memoria. El repositorio incluye además ficheros mmproj, lo que sugiere soporte multimodal en el modelo base, aunque la model card no detalla las capacidades de visión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen 3.5), ajuste fino con LoRA/PEFT |
| Parámetros totales | 4.326.350.848 (≈4,3 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (inglés) |
| Licencia | other (no especificada en detalle; ver limitaciones) |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |
| Tamaño del repositorio | 41,0 GB (incluye todas las cuantizaciones) |
| Librería | transformers (metadato); inferencia vía llama.cpp y compatibles |

## Arquitectura y entrenamiento

El modelo base es xtools-at/Qwensploit-V2-4B-CyberSecurity-Qwen3.5, construido sobre la arquitectura Qwen 3.5 (transformer decoder-only con atención causal estándar, sin indicios de arquitectura híbrida SSM/MoE en la información disponible). El ajuste se realizó mediante LoRA/PEFT, técnica que congela los pesos originales y entrena adaptadores de bajo rango, lo que explica que el resultado final mantenga el tamaño de 4,3 B parámetros del modelo base. La model card menciona la etiqueta `mtp`, que en la familia Qwen suele asociar multi-token prediction, pero no se aportan detalles sobre su implementación en este ajuste.

El entrenamiento combina siete datasets: PentesterFlow/OffsecCyber, ChaoticNeutrals/Cybersecurity-ShareGPT, Voidreaper2026/cybersec-master-dataset, Trendyol/Trendyol-Cybersecurity-Instruction-Tuning-Dataset, saidutta69/CyberSec-Reasoning-Premium, saidutta69/qwen3.8-max-distillation-50k-clean y xtools-at/Claude-Haiku-5.5-High-Reasoning-TraceInversion-3000x. La composición mezcla instrucciones de seguridad ofensiva, trazas de razonamiento y datos destilados de modelos mayores, orientados a mejorar la cadena de pensamiento en tareas de análisis. No se especifican el número total de tokens de entrenamiento, la mezcla exacta ni si hubo fases de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento técnico en dominios de ciberseguridad: análisis de vulnerabilidades, explicación de CVEs, interpretación de resultados de escaneos.
- Soporte de razonamiento multi-paso (thinking), reforzado por los datasets de trazas de razonamiento destiladas.
- Asistencia en pentesting y red team: sugerencias de enumeración, explotación guiada y post-explotación en entornos controlados.
- Resolución de retos CTF: análisis de binarios, criptografía básica, forense y web.
- Análisis de código y configuración en busca de patrones inseguros.
- Capacidades conversacionales multi-turno (etiqueta `conversational`).
- Soporte multimodal potencial: el repositorio incluye ficheros mmproj, lo que indica que el modelo base podría procesar imágenes, aunque no se detalla en la model card.
- Idiomas: únicamente inglés según los metadatos; el multilingüismo heredado de Qwen 3.5 no está garantizado tras el ajuste.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes: no disponible explícitamente, aunque el formato conversacional y el razonamiento multi-paso lo hacen plausible.

## Casos de uso

- Formación en pentesting: el modelo puede actuar como tutor que explica paso a paso técnicas de enumeración, explotación y escalada de privilegios, usando su razonamiento multi-paso para justificar cada decisión y citar las herramientas implicadas (nmap, ffuf, sqlmap).
- Análisis de informes de vulnerabilidades: dado un listado de hallazgos (por ejemplo, salidas de Nessus o Burp), el modelo puede priorizar riesgos, explicar el impacto y proponer mitigaciones, aprovechando los datasets de seguridad ofensiva y defensiva del entrenamiento.
- Soporte en retos CTF: resolución asistida de retos de reversing, forense o web, donde el modelo razona sobre el enunciado y sugiere comandos o scripts concretos; su tamaño de 4,3 B permite ejecutarlo en local durante la competición sin depender de APIs externas.
- Revisión de código con foco en seguridad: integrado en un pipeline de CI/CD o en un IDE, el modelo puede señalar patrones inseguros (inyección SQL, deserialización, uso de secretos en claro) y proponer parches, aunque requiere validación humana por el riesgo de alucinación.
- Generación de laboratorios y escenarios de entrenamiento: creación de enunciados de CTF, configuraciones de máquinas vulnerables y guiones de explotación para entornos aislados, útil para equipos de formación en seguridad.
- Despliegue en estaciones de trabajo de analistas: al estar cuantizado en GGUF, puede correr en un portátil con GPU consumer o incluso en CPU, permitiendo consultas sobre tráfico, logs o configuraciones sin enviar datos sensibles a servicios en la nube.
- Asistente de redacción de políticas y documentación de seguridad: redacción de procedimientos, checklists y respuestas a cuestionarios de cumplimiento, apoyándose en su capacidad conversacional y de contexto medio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (4,3 B parámetros):
  - Q8_0: ≈4,6 GB de pesos + overhead de contexto (≈5,5-6 GB en total).
  - Q6_K: ≈3,6 GB de pesos.
  - Q5_K_M: ≈3,0 GB de pesos.
  - Q4_K_M: ≈2,6 GB de pesos.
  - Q3_K_M: ≈2,1 GB de pesos.
  - Q2_K: ≈1,7 GB de pesos.
  - IQ4_XS: ≈2,4 GB de pesos.
- GPU recomendadas: cualquier GPU con ≥6 GB de VRAM para Q4_K_M o superior (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090). Para Q8_0 con contexto largo, se recomienda ≥8 GB. En datacenter, A100 o H100 no son necesarias; una L4 o T4 es suficiente.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas con ≥4 GB de VRAM usando Q2_K o Q3_K_M, y en CPU con llama.cpp (rendimiento dependiente del número de hilos).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, text-generation-inference (con soporte GGUF), y servidores compatibles con la API de OpenAI a través de llama.cpp. Para el modelo base en safetensors, vLLM o TGI.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Como referencia orientativa de la familia, un modelo de 4 B en Q4_K_M sobre una RTX 4090 suele superar las 60-100 tok/s en generación, pero no se ha verificado para esta variante concreta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Formato |
|---|---|---|---|---|---|
| Qwensploit-V2-4B-CyberSecurity-Qwen3.5 (esta ficha) | 4,3 B | no disponible | Ciberseguridad ofensiva/defensiva | other | GGUF, safetensors |
| Qwen 3.5 base (4 B) | ≈4 B | no disponible | Propósito general | según Qwen (no confirmada aquí) | safetensors, GGUF |
| WhiteRabbitNeo (variantes 7B/13B) | 7-13 B | 4K-16K típicamente | Ciberseguridad ofensiva | otras licencias | GGUF, safetensors |
| Dolphin / Hermes (4-8 B) | 4-8 B | 8K-32K | Propósito general sin censura | Apache/MIT frecuentemente | GGUF, safetensors |

La comparación directa con WhiteRabbitNeo es la más pertinente por dominio, pero no se dispone de benchmarks comparativos publicados en la información proporcionada. La ventaja principal de esta variante es su tamaño reducido (4,3 B) frente a los 7-13 B de las alternativas especializadas, lo que abarata el despliegue; la desventaja es la ausencia de métricas públicas que permitan validar su calidad frente a ellas.

## Limitaciones y advertencias

- Licencia "other": no se especifican los términos exactos en la model card; es imprescindible consultar el repositorio del modelo base (xtools-at/Qwensploit-V2-4B-CyberSecurity-Qwen3.5) antes de cualquier uso comercial. La licencia de Qwen 3.5 subyacente también puede imponer restricciones adicionales.
- Riesgo elevado de alucinación en dominios técnicos: el modelo puede inventar CVEs, comandos o rutas de explotación plausibles pero incorrectas; toda salida debe validarse en un entorno controlado.
- Contenido sensible: al estar entrenado con datasets de seguridad ofensiva, puede generar instrucciones de explotación, payloads o técnicas de evasión. Su uso debe limitarse a entornos autorizados (pentesting con contrato, CTF, laboratorios aislados).
- Idiomas: solo inglés según los metadatos; el rendimiento en castellano no está garantizado y probablemente sea inferior al del modelo base.
- Contexto: no se ha publicado la longitud de contexto soportada; conviene asumir la del modelo base Qwen 3.5 y verificar en la práctica antes de usarlo con documentos largos.
- Sesgos: no documentados por el autor; al derivar de Qwen 3.5 y de datasets de seguridad, puede reproducir sesgos de esos corpus (por ejemplo, enfoques centrados en herramientas comerciales o en un tipo concreto de infraestructura).
- Datos de entrenamiento propietarios o sintéticos: varios datasets (por ejemplo, los de saidutta69 o xtools-at) parecen ser generados o destilados, lo que puede introducir errores sistemáticos.
- Sin benchmarks publicados: no hay evidencia cuantitativa de su rendimiento frente a alternativas, lo que dificulta la comparación objetiva.
- Repositorio de 41 GB: descargar el repo completo consume mucho espacio; conviene bajar solo la cuantización necesaria.
- Estado del modelo: 0 descargas y 0 likes en el momento de la consulta, lo que indica que es muy reciente y no ha sido validado por la comunidad.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/mradermacher/Qwensploit-V2-4B-CyberSecurity-Qwen3.5-GGUF
- Modelo base: https://huggingface.co/xtools-at/Qwensploit-V2-4B-CyberSecurity-Qwen3.5
- Cuantizaciones imatrix (i1): https://huggingface.co/mradermacher/Qwensploit-V2-4B-CyberSecurity-Qwen3.5-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Qwensploit-V2-4B-CyberSecurity-Qwen3.5-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Dataset PentesterFlow/OffsecCyber: https://huggingface.co/datasets/PentesterFlow/OffsecCyber
- Dataset ChaoticNeutrals/Cybersecurity-ShareGPT: https://huggingface.co/datasets/ChaoticNeutrals/Cybersecurity-ShareGPT
- Dataset Voidreaper2026/cybersec-master-dataset: https://huggingface.co/datasets/Voidreaper2026/cybersec-master-dataset
- Dataset Trendyol/Trendyol-Cybersecurity-Instruction-Tuning-Dataset: https://huggingface.co/datasets/Trendyol/Trendyol-Cybersecurity-Instruction-Tuning-Dataset
- Dataset saidutta69/CyberSec-Reasoning-Premium: https://huggingface.co/datasets/saidutta69/CyberSec-Reasoning-Premium
- Dataset saidutta69/qwen3.8-max-distillation-50k-clean: https://huggingface.co/datasets/saidutta69/qwen3.8-max-distillation-50k-clean
- Dataset xtools-at/Claude-Haiku-5.5-High-Reasoning-TraceInversion-3000x: https://huggingface.co/datasets/xtools-at/Claude-Haiku-5.5-High-Reasoning-TraceInversion-3000x

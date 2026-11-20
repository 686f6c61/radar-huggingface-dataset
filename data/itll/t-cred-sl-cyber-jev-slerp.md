# ITLL/T-CRED-SL-cyber-jev-SLERP

## Resumen

T-CRED-SL-cyber-jev-SLERP es un modelo de seguridad publicado por ITLL en Hugging Face, orientado a la detección de amenazas en entornos de aplicaciones web y sistemas basados en LLM. Por su etiquetado (cross-encoder, decision-model, calibration, ONNX) y su tamaño (aproximadamente 56 millones de parámetros), se trata de un modelo compacto de clasificación y puntuación, no de un modelo generativo de propósito general. Su función es actuar como componente de decisión dentro de un web application firewall (WAF) o de una capa de filtrado de prompts.

El modelo cubre un espectro amplio de amenazas: inyección SQL, XSS, inyección de prompts, jailbreaks y phishing. Los conjuntos de datos declarados en la model card combinan corpus clásicos de ataques web (CSIC2010, web-attacks, ai-waf-dataset, fed-phishing-urls) con datasets de seguridad para LLM (prompt-injection-dataset, WildJailbreak, mosscap_prompt_injection, JailbreakPrompts) y corpus de instrucciones generales (databricks-dolly-15k, awesome-chatgpt-prompts-clean).

Es relevante por su enfoque de modelo pequeño y especializado: frente a soluciones basadas en LLM generativos de gran tamaño, un cross-encoder de 56 M de parámetros puede desplegarse con latencia baja y coste mínimo en la ruta crítica de un WAF. La información pública disponible es muy escasa: no hay pipeline declarado, no se especifican idiomas, no se publican benchmarks y el repositorio no registra descargas ni interacciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Cross-encoder con cabeza de decisión y calibración (según tags del autor); detalles internos no disponibles |
| Parámetros totales | 56.085.137 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (repo con safetensors; tag ONNX sugiere exportación a ONNX) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors; tag ONNX indica soporte o exportación a ONNX |

## Arquitectura y entrenamiento

La model card y los tags describen el modelo como un cross-encoder con cabeza de decisión y calibración de probabilidades. Un cross-encoder procesa conjuntamente el par de entradas (por ejemplo, petición y contexto, o prompt y política) y produce una puntuación de riesgo, lo que encaja con tareas de detección binaria o multiclase de ataques. El tamaño de 56 M de parámetros es coherente con un encoder tipo BERT pequeño o MiniLM, aunque la arquitectura exacta, el número de capas, la dimensionalidad oculta y el tokenizador no se detallan en la información disponible.

El entrenamiento se apoya en doce datasets declarados: corpus de ataques web (CSIC2010, shengqin/web-attacks, ai-waf-dataset), corpus de phishing (flwrlabs/fed-phishing-urls), corpus de inyección de prompts y jailbreaks (S-Labs, neuralchemy, Simsonsun, WildJailbreak, Lakera mosscap), datos de texto-a-SQL (gretelai/synthetic_text_to_sql) y corpus de instrucciones generales (databricks-dolly-15k, awesome-chatgpt-prompts-clean). No se especifican el número de tokens de entrenamiento, la mezcla exacta, el procedimiento de calibración ni si se aplicó ajuste fino supervisado, RLHF o DPO. El sufijo "SLERP" en el nombre sugiere una fusión de pesos mediante interpolación esférica, pero no se documenta qué modelos se fusionaron ni con qué proporciones.

## Capacidades

- Clasificación y puntuación de riesgo de peticiones web maliciosas: inyección SQL y XSS.
- Detección de inyección de prompts y jailbreaks en entradas dirigidas a sistemas LLM.
- Identificación de URLs y patrones de phishing.
- Puntuación calibrada de decisión, apta para umbrales operativos en producción.
- Procesamiento de pares de texto (cross-encoder), adecuado para comparar entrada contra contexto o política.
- Exportación a ONNX para inferencia optimizada en CPU y entornos embebidos.
- Soporte de tool calling / function calling: no disponible.
- Capacidades de agente o razonamiento multi-paso: no disponibles (el modelo no es generativo).
- Capacidades multilingües: no documentadas.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- WAF de aplicación web: el modelo puntúa cada petición HTTP entrante y asigna una probabilidad de ataque (SQLi, XSS) para bloquear o poner en cuarentena tráfico sospechoso antes de que llegue a la aplicación, con latencia baja gracias a su tamaño reducido.
- Filtro de entrada para asistentes LLM: se coloca delante de un chatbot o agente para clasificar prompts como benignos o maliciosos (inyección, jailbreak) y descartar los que superen un umbral calibrado.
- Detección de phishing en enlaces: puntuación de URLs y textos de correo o mensajes para marcar candidatos a phishing antes de que el usuario interactúe con ellos.
- Moderación en pipelines de CI/CD de seguridad: ejecución por lotes sobre registros de peticiones para análisis retrospectivo de incidentes y generación de reglas de firewall.
- Enriquecimiento de alertas SOC: como clasificador auxiliar que prioriza alertas de seguridad según la probabilidad de ataque real, reduciendo falsos positivos en la cola de triaje.
- Protección de endpoints de texto-a-SQL: detección de intentos de manipulación en consultas generadas o introducidas por el usuario en herramientas de generación de SQL.
- Despliegue en el borde: al ser un modelo de 56 M de parámetros exportable a ONNX, puede ejecutarse en CPU o en dispositivos con recursos limitados, integrándose en proxies y gateways sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo ocupa aproximadamente 0,2 GB en safetensors (56 M de parámetros); en FP32 serían unos 0,22 GB y en FP16 unos 0,11 GB, sin contar overhead del runtime.
- GPU recomendadas: no requiere GPU; cualquier GPU con al menos 1 GB de memoria libre es suficiente. Una RTX 4090, A100 o H100 queda sobredimensionada para este modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna e incluso en iGPU.
- Opciones de despliegue: ONNX Runtime (formato indicado por el autor), además de frameworks compatibles con safetensors y cross-encoders (por ejemplo, Transformers). Compatibilidad con vLLM, llama.cpp, Ollama o TGI no disponible, ya que no es un modelo generativo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ITLL/T-CRED-SL-cyber-jev-SLERP | 56 M | No disponible | Cross-encoder de seguridad (SQLi, XSS, prompt injection, phishing) | Apache 2.0 | Hugging Face |
| ProtectAI deberta-v3-base-prompt-injection | ~184 M | 512 tokens (típico en DeBERTa-v3-base) | Clasificador de inyección de prompts | Apache 2.0 (según versión) | Hugging Face |
| Meta Llama Prompt Guard 2 (86M) | 86 M | 512 tokens | Clasificador de jailbreak e inyección de prompts | Llama 2/3 Community License | Hugging Face |
| Modelos WAF basados en reglas (ModSecurity OWASP CRS) | No aplica | No aplica | Reglas heurísticas | Apache 2.0 | Amplia |

La comparación es orientativa: los datos de los modelos alternativos provienen del conocimiento general y no de la información proporcionada para este modelo, por lo que deben verificarse en sus respectivas model cards.

## Limitaciones y advertencias

- Información pública muy limitada: no hay model card detallada, benchmarks, idiomas declarados ni pipeline; la evaluación independiente es necesaria antes de cualquier uso en producción.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de falsos positivos y falsos negativos en la clasificación, con impacto directo en bloqueos legítimos o ataques no detectados.
- Sesgos potenciales derivados de los datasets de entrenamiento: la distribución de ataques de los corpus (CSIC2010, WildJailbreak, etc.) puede no reflejar el tráfico real de un despliegue concreto.
- Cobertura idiomática desconocida: si el entrenamiento fue mayoritariamente en inglés, el rendimiento en castellano u otros idiomas puede degradarse.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; la responsabilidad de validación recae en el integrador.
- El sufijo SLERP sugiere una fusión de pesos no documentada; conviene auditar el comportamiento del modelo fusionado frente a sus componentes originales.
- No sustituye a un WAF completo: debe combinarse con reglas, validación de esquemas y controles en profundidad.
- Fecha de creación del repositorio (2026-11-20) y ausencia de descargas o likes: modelo muy reciente y sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/ITLL/T-CRED-SL-cyber-jev-SLERP
- Dataset CSIC2010: https://huggingface.co/datasets/bridge4/CSIC2010_dataset_classification
- Dataset web-attacks: https://huggingface.co/datasets/shengqin/web-attacks
- Dataset ai-waf-dataset: https://huggingface.co/datasets/notesbymuneeb/ai-waf-dataset
- Dataset synthetic_text_to_sql: https://huggingface.co/datasets/gretelai/synthetic_text_to_sql
- Dataset prompt-injection-dataset (S-Labs): https://huggingface.co/datasets/S-Labs/prompt-injection-dataset
- Dataset prompt-injection-dataset (neuralchemy): https://huggingface.co/datasets/neuralchemy/Prompt-injection-dataset
- Dataset JailbreakPrompts: https://huggingface.co/datasets/Simsonsun/JailbreakPrompts
- Dataset WildJailbreak: https://huggingface.co/datasets/walledai/WildJailbreak
- Dataset mosscap_prompt_injection: https://huggingface.co/datasets/Lakera/mosscap_prompt_injection
- Dataset awesome-chatgpt-prompts-clean: https://huggingface.co/datasets/saidutta69/awesome-chatgpt-prompts-clean
- Dataset databricks-dolly-15k: https://huggingface.co/datasets/databricks/databricks-dolly-15k
- Dataset fed-phishing-urls: https://huggingface.co/datasets/flwrlabs/fed-phishing-urls

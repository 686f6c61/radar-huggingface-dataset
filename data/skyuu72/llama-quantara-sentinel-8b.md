# skyuu72/Llama-Quantara-Sentinel-8B

## Resumen

Llama-Quantara-Sentinel-8B es un asistente de ciberseguridad defensiva de 8.031 millones de parámetros, desarrollado por skyuu72 a partir del modelo Foundation-Sec-8B-Instruct de Cisco, que a su vez deriva de Llama-3.1-8B. El modelo se ha ajustado mediante QLoRA (rank 32, una época) y se distribuye en formato fp16 fusionado y cuantizaciones GGUF (Q4_K_M y Q8_0), además de un Modelfile para Ollama. Su propósito es ayudar a los equipos de defensa a analizar código, configuraciones, logs y correos de phishing, indicando qué está mal y cómo corregirlo, sin generar exploits, malware ni herramientas de ataque.

La relevancia actual radica en que ofrece un asistente de seguridad de código abierto, auto-alojable, con un alcance deliberadamente restringido a tareas defensivas. El autor ha verificado que esta limitación de alcance se mantiene incluso sin system prompt, y ha medido el comportamiento de seguridad tanto en fp16 como en la cuantización Q4_K_M, que es la que la mayoría de usuarios descargará. El modelo conserva la plantilla de chat nativa de Foundation-Sec (etiquetas `<|system|>`, `<|user|>`, `<|assistant|>`), no la de Llama-3.1, y requiere detenerse en `<|end_of_text|>`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Llama-3.1-8B) |
| Parametros totales | 8.031.309.888 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el modelo base Llama-3.1-8B soporta 128K, pero no se confirma para este ajuste) |
| Tipos de cuantizacion | fp16 (fusionado), GGUF Q4_K_M, GGUF Q8_0 |
| Idiomas soportados | Ingles (en) |
| Licencia | Llama 3.1 (llama3.1) |
| Formato de pesos | safetensors (fp16), GGUF, Modelfile de Ollama |

## Arquitectura y entrenamiento

El modelo parte de Foundation-Sec-8B-Instruct, un ajuste instructivo de Llama-3.1-8B orientado a seguridad. Sobre esa base se aplicó QLoRA con rango 32 mediante Unsloth, durante una época, y los adaptadores se fusionaron al modelo base en fp16. El checkpoint utilizado fue el `checkpoint-700`, seleccionado por su mejor `eval_loss`, y se verificó que el adaptador restaurado era byte-idéntico al original antes de exportar. No se especifican el número de tokens de entrenamiento ni la composición del dataset.

Una innovación destacable es que el límite de alcance defensivo (no generar exploits, malware o herramientas de ataque) se mantiene sin necesidad de system prompt, algo que el autor afirma haber medido. El system prompt recomendado se antepone en inferencia y no está integrado en los pesos. La plantilla de chat es la nativa de Foundation-Sec, con etiquetas de texto plano y fin de turno en `<|end_of_text|>` (token 128001); usar la plantilla de Llama-3.1 provoca generación sin fin.

## Capacidades

- Analisis de vulnerabilidades en codigo fuente: identifica fallos de seguridad y sugiere parches.
- Revision de codigo seguro y correccion de problemas.
- Auditoria de configuraciones y codigo de infraestructura como codigo (IaC).
- Triaje de logs y alertas de seguridad.
- Respuesta a preguntas sobre inteligencia de amenazas (threat-intel).
- Analisis de phishing: examina correos sospechosos y explica indicadores de compromiso.
- Redaccion de textos de simulacion de phishing para campañas internas de concienciacion (el modelo acepta esta tarea, pero rechaza la creacion de paginas de captura de credenciales).
- Rechazo explicito de generar exploits, malware, ransomware, herramientas de C2, agentes de ataque autonomos, evasion de deteccion o anti-forense.

## Casos de uso

- Revision de seguridad en pipelines de CI/CD: el modelo puede analizar diffs de codigo en busca de vulnerabilidades comunes (inyeccion SQL, XSS, deserializacion insegura) antes de fusionar ramas, integrándose como paso de revisión automática.
- Auditoria de configuraciones de infraestructura: dado un archivo Terraform, CloudFormation o Kubernetes YAML, el modelo señala permisos excesivos, puertos expuestos o falta de cifrado, y sugiere correcciones.
- Triaje de alertas SIEM: ante un volumen alto de alertas, el modelo resume cada evento, indica su criticidad y propone acciones de respuesta, reduciendo la carga del analista.
- Analisis de correos de phishing: el modelo examina un correo sospechoso, extrae indicadores (remitente, enlaces, adjuntos) y explica por qué es malicioso, ayudando a formar a usuarios finales.
- Consulta de inteligencia de amenazas: responde preguntas sobre TTPs, grupos APT o indicadores de compromiso, basándose en su conocimiento de seguridad.
- Formacion interna en seguridad: genera escenarios de phishing simulados (solo el texto del correo) para campañas de concienciación, sin proporcionar la infraestructura de captura.
- Asistente de respuesta a incidentes: durante una investigación, el modelo ayuda a interpretar logs, correlacionar eventos y redactar informes de incidentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor proporciona metricas propias de seguridad sobre 753 ejemplos held-out (664 de capacidad y 89 de seguridad) y 92 sondas de seguridad escritas a mano. La siguiente tabla resume los resultados de las puertas de liberacion, comparando fp16, la cuantizacion Q4_K_M (la que se instala por defecto) y el modelo base.

| Metrica | fp16 | Q4_K_M | Requisito | Modelo base |
|---|---|---|---|---|
| `weaponized_leaks_judged` | 0 | 0 | == 0 | 4 |
| `refusal_rate_judged_pct` | 100.0 | 100.0 | — | 91.3 |
| `refusal_rate_pct` (regex) | 100.0 | 100.0 | >= 95 | 71.7 |
| `benign.over_refusal_pct` | 0.0 | 0.0 | <= 2 | 5.6 |
| `_answerable_total.over_refusal_pct` | 2.2 | 4.3 | <= 10 | 2.2 |
| `generation_errors` / `runaway` | 0 / 0 | 0 / 0 | == 0 | — |

La cuantizacion Q4_K_M se midio a `temperature=0` y a `temperature=0.3` (el valor por defecto del Modelfile), con resultados identicos en todas las puertas. La unica diferencia entre fp16 y la cuantizacion es un aumento del rechazo excesivo en casos de doble uso (2.2% a 4.3%), que corresponde a una sonda adicional de 46.

## Requisitos de hardware

No se proporcionan requisitos de hardware especificos en la informacion disponible. El modelo se ofrece en cuantizaciones GGUF (Q4_K_M y Q8_0) y un Modelfile de Ollama, lo que sugiere que esta pensado para ejecutarse en hardware modesto, pero no se indican cifras de VRAM, GPUs recomendadas ni latencia. Para un modelo de 8B en fp16 se necesitarian aproximadamente 16 GB de VRAM; con Q4_K_M, unos 5-6 GB, aunque estos valores son estimaciones genericas y no confirmadas por el autor. Las opciones de despliegue incluyen Transformers (con `device_map="auto"`), Ollama y, potencialmente, vLLM o llama.cpp, aunque no se mencionan explicitamente.

## Comparativa con modelos similares

La comparacion mas directa es con el modelo base Foundation-Sec-8B-Instruct y con Llama-3.1-8B, del que deriva. La tabla de seguridad anterior ya muestra diferencias clave: el modelo ajustado alcanza un 100% de tasa de rechazo frente al 71.7% del base, y reduce a cero las fugas de contenido weaponizado (el base tenia 4). Tambien elimina el rechazo excesivo en casos benignos (0% frente a 5.6%). Frente a Llama-3.1-8B, este modelo esta especializado en seguridad defensiva y no es un modelo generalista; no se dispone de comparativas de rendimiento en tareas genericas.

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Llama-Quantara-Sentinel-8B | 8.03B | No disponible | Llama 3.1 | Seguridad defensiva |
| Foundation-Sec-8B-Instruct | 8B (aprox.) | No disponible | No especificada | Seguridad (base) |
| Llama-3.1-8B | 8B | 128K | Llama 3.1 | Generalista |

## Limitaciones y advertencias

- El modelo solo soporta ingles; no se ha entrenado para otros idiomas.
- Puede mostrar rechazo excesivo en casos de doble uso (4.3% en la cuantizacion Q4_K_M), es decir, puede negarse a responder consultas legitimas que involucren tecnicas de ataque, incluso si el contexto es defensivo.
- No se han publicado resultados de benchmarks estandar, por lo que su rendimiento en tareas genericas de razonamiento, codigo o matematicas es desconocido.
- La plantilla de chat debe ser la nativa de Foundation-Sec; usar la de Llama-3.1 provoca generacion sin fin. El system prompt no esta integrado en los pesos y debe anteponerse en inferencia.
- La licencia Llama 3.1 permite uso comercial, pero impone condiciones (por ejemplo, no usar los resultados para mejorar otros modelos de lenguaje grandes). Debe revisarse el texto completo de la licencia.
- El modelo esta disenado para tareas defensivas; no debe utilizarse para generar exploits, malware o herramientas de ataque, y se espera que rechace esas solicitudes.
- No se especifican los datos de entrenamiento ni el proceso de alineacion (RLHF/DPO), por lo que no se puede evaluar la robustez frente a jailbreaks o ataques de prompt injection.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/skyuu72/Llama-Quantara-Sentinel-8B
- Modelo base: https://huggingface.co/fdtn-ai/Foundation-Sec-8B-Instruct
- Licencia Llama 3.1: https://www.llama.com/llama3_1/license/
- Documentacion de Llama 3.1 (Meta): https://ai.meta.com/blog/meta-llama-3/
- Articulo sobre mejores modelos 8B en 2026: https://www.aimadetools.com/blog/best-8b-parameter-models-2026/

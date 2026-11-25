# Inari18/mulita-extractor-qwen2.5-1.5b

## Resumen

mulita-extractor-qwen2.5-1.5b es un ajuste fino (fine-tuning) supervisado del modelo Qwen2.5-1.5B-Instruct, desarrollado por el usuario Inari18, especializado en la extracción de hallazgos estructurados a partir de informes PDF de escáneres de vulnerabilidades. El modelo recibe bloques de texto segmentados de informes generados por herramientas como OpenVAS, Qualys, Nessus, Tenable VM y ZAP, y devuelve un objeto JSON con campos como `description`, `solution`, `severity`, `references`, `instances`, `cvss`, `port` o `plugin`. Es el modelo local embebido de la herramienta MulitaMiner2, donde se usa a través del perfil `mulita-extractor`.

El modelo parte de la arquitectura transformer de Qwen2.5-1.5B-Instruct, con 1.543.714.304 parámetros totales, y se distribuye principalmente como un archivo GGUF cuantizado en q4_k_m (aproximadamente 1 GB) acompañado de un `Modelfile` para Ollama. La relevancia actual radica en que demuestra que un modelo de 1,5B parámetros, ajustado con QLoRA sobre un conjunto de datos muy específico y desplegado en local, puede igualar o superar a un modelo en la nube como DeepSeek en una tarea de extracción de información estructurada y altamente repetitiva, con la ventaja de privacidad y coste cero por token.

La licencia es Apache 2.0 y el modelo está pensado exclusivamente para el pipeline de MulitaMiner: fuera de ese contexto, con sus prompts y su formato de bloques, se comporta como un Qwen2.5-1.5B-Instruct ordinario con un sesgo fuerte hacia esta tarea. El idioma declarado es únicamente inglés, coherente con los informes de escáneres de vulnerabilidades que maneja.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5), ajuste fino SFT con QLoRA 4-bit |
| Parametros totales | 1.543.714.304 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el entrenamiento uso secuencias de hasta 12.288 tokens) |
| Tipos de cuantizacion | GGUF q4_k_m (unico publicado, ~1 GB) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`mulita-extractor-v7.gguf`) + `Modelfile` para Ollama |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Qwen2.5-1.5B-Instruct, un transformer decoder-only denso de 1.543.714.304 parámetros. El entrenamiento se realizó mediante SFT con QLoRA de 4 bits usando Unsloth y TRL, con rango r=32, alpha=32, aplicado a todas las proyecciones de atención y MLP, con la pérdida enmascarada al turno del asistente. Se ejecutaron 2 épocas con learning rate 2e-4, batch efectivo de 16, longitud máxima de secuencia de 12.288 tokens y semilla 42, en aproximadamente 2 horas y 35 minutos sobre una única RTX 5080 de 16 GB. La release corresponde a la ejecución de entrenamiento v7-final.

El conjunto de datos consta de 7.536 hallazgos extraídos de 138 informes, convertidos en 9.649 ejemplos. Cada ejemplo reproduce la conversación exacta de producción: el prompt del escáner de la herramienta, los bloques del informe y el JSON objetivo. Cada hallazgo aparece dos veces, una como bloque único y otra dentro del fragmento multi-bloque que la herramienta envía en producción. La distribución por escáner es: OpenVAS 5.763, Qualys 910, Nessus 383, Tenable VM 391 y ZAP 89. Las etiquetas de OpenVAS, Qualys, Nessus y ZAP provienen de las exportaciones máquina de cada escáner (CSV, HTML, XML) emparejadas con los bloques PDF, nunca escritas a mano; el texto que el PDF no renderiza se recortó de las etiquetas para no enseñar al modelo a alucinarlo. Los hallazgos de Tenable VM provienen de informes reales con datos sensibles, seudonimizados sustituyendo cada identificador (hosts, IPs, dominios, URLs) por un valor sintético con formato válido. El dataset no está publicado.

## Capacidades

- Extracción de información estructurada: convierte bloques de texto de informes de vulnerabilidades en JSON con claves como `description`, `solution`, `severity`, `references`, `instances`, `impact`, `insight`, `detection_result`, `detection_method`, `log_method`, `product_detection_result`, `category`, `cvss`, `port`, `protocol`, `plugin` y `plugin_details`.
- Procesamiento de informes de OpenVAS, Qualys, Nessus, Tenable VM y ZAP.
- Normalización de referencias de seguridad (CVE, CWE, BID, URLs normalizadas) y de valores como severidad, CVSS, puerto y protocolo.
- Extracción de instancias por URL en hallazgos de ZAP (campo `instances` con subcampos).
- Generación de texto conversacional heredada del modelo base Qwen2.5-1.5B-Instruct, aunque con sesgo fuerte hacia la tarea de extracción.
- Compatible con decodificación restringida por esquema JSON (`json_schema`, con todas las claves del esquema requeridas) a temperatura 0, que es como se evaluó.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento (thinking) en la información disponible.

## Casos de uso

- Triaje automatizado de vulnerabilidades en pipelines de seguridad: el modelo transforma cada bloque de un informe PDF de OpenVAS o Nessus en un registro JSON con severidad, CVSS y referencias, lo que permite ingerir los hallazgos directamente en una base de datos o en un sistema de ticketing sin intervención manual.
- Enriquecimiento de inventarios de exposición: al extraer `port`, `protocol` y `product_detection_result` de forma consistente, se pueden correlacionar servicios detectados entre distintos escáneres y construir una vista unificada de la superficie de ataque.
- Generación de borradores de remediación: el campo `solution` con F1 de tokens de 0,99 frente a las etiquetas de referencia permite producir recomendaciones de parcheo o configuración listas para revisión por un analista, reduciendo el tiempo de redacción.
- Automatización de informes de cumplimiento: la extracción fiable de `references` (set F1 de 0,95) y `severity` (exact match de 1,00) facilita mapear hallazgos a controles y generar evidencias auditables de forma reproducible.
- Procesamiento local con requisitos de privacidad: al ejecutarse en Ollama con un GGUF de ~1 GB, permite analizar informes con datos sensibles de clientes sin enviarlos a una API en la nube, algo relevante en consultoría de seguridad y entornos regulados.
- Integración en MulitaMiner2: el caso de uso nativo es el perfil `mulita-extractor` de la herramienta, que segmenta el informe en bloques y llama al modelo para cada uno; sirve como referencia de despliegue para quien quiera replicar el flujo.
- Evaluación comparativa de escáneres: al normalizar la salida de OpenVAS, Qualys, Nessus y ZAP a un mismo esquema JSON, se pueden comparar coberturas y discrepancias entre herramientas sobre el mismo objetivo.

## Benchmarks y rendimiento

Evaluación sobre un conjunto retenido de 8 informes y 1.028 hallazgos (OpenVAS con Juice Shop, bWAPP y WordPress; un Nessus; un Qualys; y ZAP con bWAPP, JBoss y Juice Shop), con todas las aplicaciones excluidas del entrenamiento en todos los escáneres. Las etiquetas de referencia son las exportaciones máquina de los escáneres. Los hallazgos se emparejan uno a uno mediante asignación húngara sobre similitud de nombre y clave de escáner.

| Metrica | DeepSeek | Mulita-Ext. | Qwen2.5 |
|---|---:|---:|---:|
| Emparejados (de 1.028) | 1.028 | 1.028 | 975 |
| Recall | 1.000 | 1.000 | 0.948 |
| Precision | 1.000 | 1.000 | 0.989 |

Puntuación por campo sobre los pares emparejados (media sobre los informes donde existe el campo):

| Campo | Escaneres | Metrica | DeepSeek | Mulita-Ext. | Qwen2.5 |
|---|---|---|---:|---:|---:|
| description | todos | token F1 | 0.93 | 1.00 | 0.70 |
| description | todos | BERTScore (reescalado) | 0.87 | 1.00 | 0.70 |
| solution | todos | token F1 | 0.86 | 0.99 | 0.05 |
| impact | O, Q | token F1 | 0.99 | 1.00 | 0.20 |
| insight | O, N | token F1 | 1.00 | 1.00 | 0.00 |
| detection_result | O, N | token F1 | 0.99 | 0.99 | 0.60 |
| detection_method | O | token F1 | 0.65 | 0.98 | 0.31 |
| log_method | O | token F1 | 0.99 | 1.00 | 0.20 |
| product_detection_result | O | token F1 | 0.72 | 1.00 | 0.18 |
| category | Q | token F1 | 1.00 | 1.00 | 0.00 |
| references | todos | set F1 | 0.95 | 0.95 | 0.21 |
| cvss | O, N | exact match | 1.00 | 1.00 | 0.08 |
| severity | todos | exact match | 1.00 | 1.00 | 0.94 |
| port | O, N, Q | exact match | 0.99 | 1.00 | 0.60 |
| protocol | O, N, Q | exact match | 0.88 | 0.86 | 0.48 |
| plugin | N, Q, Z | exact match | 1.00 | 1.00 | 0.77 |
| instances | Z | estructural | 0.96 | 0.92 | 0.71 |
| plugin_details | N | estructural | 0.87 | 0.86 | 0.86 |

Definiciones: token F1 es el solapamiento de palabras entre el texto extraído y el de referencia (en minúsculas, sin orden); set F1 es F1 sobre identificadores canónicos de referencia (CVE, CWE, BID, URLs normalizadas); exact match vale 1 si el valor normalizado coincide con el de referencia; estructural empareja instancias por URL, puntúa subcampos y divide por la lista más larga. El tiempo de ejecución sobre los 8 informes no está disponible en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB para los pesos en GGUF q4_k_m, más la memoria de contexto y el overhead de Ollama; en la práctica cabe holgadamente en GPUs de 4-8 GB.
- GPU recomendadas: cualquier GPU consumer moderna con al menos 4 GB de VRAM; el entrenamiento se hizo en una RTX 5080 de 16 GB, pero la inferencia es mucho menos exigente.
- Cabe en GPU consumer: sí, en RTX 3060, RTX 4060, RTX 4090 y similares; también puede ejecutarse en CPU con llama.cpp u Ollama, con mayor latencia.
- Opciones de despliegue: Ollama es el método documentado (crear el modelo con `ollama create mulita-extractor-v7 -f Modelfile`); al ser un GGUF, también es compatible con llama.cpp. vLLM, TGI u otros servidores no se mencionan en la información disponible.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mulita-extractor-qwen2.5-1.5b | 1.543.714.304 | No disponible | Extraccion de hallazgos de vulnerabilidades | Apache 2.0 | GGUF + Modelfile en Hugging Face |
| Qwen2.5-1.5B-Instruct | 1.5B (aproximado, segun modelo base) | No disponible | Generacion de texto general | Apache 2.0 | Pesos completos en Hugging Face |
| DeepSeek (deepseek-flash via API) | No disponible | No disponible | Generacion de texto general, referencia en la nube | No disponible | Solo API |

Frente al modelo base Qwen2.5-1.5B-Instruct, el ajuste fino supone una mejora drástica en la tarea: recall de 1.000 frente a 0.948, y campos como `solution` pasan de token F1 de 0.05 a 0.99 o `cvss` de exact match de 0.08 a 1.00. Frente a DeepSeek como referencia en la nube, el modelo local iguala o supera en la mayoría de campos (description, solution, detection_method, product_detection_result) y queda ligeramente por detrás en protocol (0.86 frente a 0.88), instances (0.92 frente a 0.96) y plugin_details (0.86 frente a 0.87). No se dispone de datos de contexto ni de otros modelos comparables de extracción de vulnerabilidades en la información proporcionada.

## Limitaciones y advertencias

- El modelo espera los prompts y el formato de bloques de MulitaMiner; fuera de ese pipeline se comporta como un Qwen2.5-1.5B-Instruct ordinario con sesgo hacia la tarea, por lo que los resultados no son representativos.
- Es obligatorio registrar el modelo con el `Modelfile`, no solo con el GGUF: sin la plantilla `TEMPLATE` que incluye, Ollama usa la plantilla embebida en el GGUF y el modelo deja silenciosamente vacíos los campos `references`, `instances` y `plugin`.
- La evaluación se realizó con decodificación restringida por esquema JSON (`json_schema`, todas las claves requeridas) a temperatura 0; sin esa restricción el rendimiento puede degradarse.
- El conjunto de datos de entrenamiento no está publicado, lo que limita la reproducibilidad y la auditoría independiente.
- El modelo solo declara inglés y está entrenado sobre informes de escáneres en ese idioma; no hay evidencia de funcionamiento en castellano u otros idiomas.
- Riesgo de alucinación en campos de texto libre: aunque se recortó de las etiquetas el texto no renderizado en el PDF para mitigarlo, la generación de `description` o `solution` sigue siendo texto libre y puede introducir contenido no presente en el informe.
- Los datos de Tenable VM proceden de informes reales seudonimizados; el modelo puede haber aprendido patrones de ese dominio concreto que no generalicen a otros entornos.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen2.5-1.5B-Instruct también es Apache 2.0, por lo que no hay restricciones adicionales conocidas; aun así, conviene verificar los términos del modelo base.
- El tamaño del conjunto de evaluación es reducido (8 informes, 1.028 hallazgos) y las aplicaciones son en su mayoría laboratorios vulnerables conocidos (Juice Shop, bWAPP, WordPress, JBoss), lo que puede no reflejar la variabilidad de informes reales de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Inari18/mulita-extractor-qwen2.5-1.5b
- Repositorio de MulitaMiner2: https://github.com/AnonShield/MulitaMiner2
- Modelo base Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Modelo base usado en el entrenamiento (Unsloth): https://huggingface.co/unsloth/Qwen2.5-1.5B-Instruct

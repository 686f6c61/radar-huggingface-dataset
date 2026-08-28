# devsdaddy/ogl-mini

## Resumen

OGL-Mini es un guard de seguridad ligero y híbrido para agentes de IA, desarrollado por el usuario devsdaddy y publicado en Hugging Face. Su propósito es detectar y bloquear amenazas como prompt injection, jailbreak y fugas de información personal (PII) en las entradas y salidas de sistemas basados en grandes modelos de lenguaje. A diferencia de un LLM generativo, OGL-Mini es un clasificador de texto que combina tres etapas: heurísticas rápidas, un clasificador TF-IDF con regresión logística y un detector de PII basado en expresiones regulares y NER. El modelo está destilado a partir de DeBERTa-v3-xsmall (70M parámetros) y MiniLM-L6, pero el artefacto final es un pipeline ONNX de tamaño reducido (250 MB en FP32, 2,8 MB en INT8) que se ejecuta exclusivamente en CPU.

La relevancia de OGL-Mini radica en su cobertura de los riesgos definidos por OWASP LLM Top 10 2025-2026 y OWASP Agentic Top 10, incluyendo Goal Hijack, Privilege Abuse, Code Execution, InterAgent, Tool Misuse, Memory Poisoning, Rogue Agents, Policy Puppetry, EchoLeak y Lies-in-the-Loop. Su diseño permite integrarlo como librería independiente en Python, TypeScript (Node y navegador vía WASM) y Go, sin necesidad de servidor HTTP, lo que facilita su despliegue en entornos edge, contenedores Kubernetes o funciones serverless. Con una latencia p95 inferior a 10 ms y un consumo de memoria menor a 500 MB, está pensado para filtrar tráfico en tiempo real en aplicaciones de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrido de 3 etapas: heurísticas + TF-IDF (80k features) + regresión logística + NER para PII |
| Parametros totales | No disponible (pipeline TF-IDF + LR, sin red neuronal final; base destilada de DeBERTa-v3-xsmall 70M y MiniLM-L6) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (clasificador de texto, no generativo) |
| Tipos de cuantizacion | FP32 (ogl-mini.onnx, 250 MB), INT8 (ogl-mini.int8.onnx, 2,8 MB) |
| Idiomas soportados | en, ru, fr, de, es (primarios); PII en 23 idiomas vía ai4privacy; cobertura adicional FR/DE/ES/IT/PT vía shieldlm |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 14), también PKL (fallback Python) |

## Arquitectura y entrenamiento

OGL-Mini implementa un pipeline de tres etapas secuenciales. La primera etapa aplica heurísticas basadas en reglas y patrones que capturan entre el 30% y el 40% de los ataques en menos de 0,1 ms. La segunda etapa utiliza un modelo TF-IDF con 80.000 características y un clasificador de regresión logística, exportado a ONNX con skl2onnx, que alcanza un AUC de 0,9988 en la detección de ataques. La tercera etapa combina expresiones regulares y un modelo NER para identificar información personal (PII) en 19 tipos para ruso e inglés, con soporte ampliado a 23 idiomas. El modelo fue entrenado sobre un conjunto de datos de 96.662 muestras de entrenamiento y 14.500 de prueba, compuesto por el dataset shieldlm (54.162 muestras de prompt injection y jailbreak), un dataset sintético de 22.500 muestras que cubre los riesgos OWASP LLM y Agentic, y 15.000 muestras de PII extraídas de fuentes como gravitee-io/pii-detection-dataset y nvidia/Nemotron-PII. No se menciona el uso de RLHF o DPO; el entrenamiento se basa en clasificación supervisada.

## Capacidades

- Detección de prompt injection directa e indirecta (LLM01) con recall del 100% en el conjunto de prueba.
- Detección de jailbreak (por ejemplo, "You are now DAN") con recall del 100% en 10 variantes salvajes.
- Identificación de fugas de PII (nombres, correos, teléfonos, direcciones, etc.) con F1 de 0,95 en ruso e inglés.
- Cobertura de los 10 riesgos de OWASP LLM Top 10 2025-2026 y los 10 de OWASP Agentic Top 10, incluyendo Goal Hijack, Privilege Abuse, Code Execution, InterAgent, Tool Misuse, Memory Poisoning, Rogue Agents, Policy Puppetry, EchoLeak y Lies-in-the-Loop.
- Clasificación binaria de texto: etiqueta 0 (benigno) o 1 (ataque), con probabilidades asociadas.
- Soporte multilingüe: ruso e inglés como idiomas primarios, con extensión a francés, alemán, español, italiano y portugués mediante el dataset shieldlm.
- Integración como librería independiente en Python, TypeScript (Node y navegador vía WASM) y Go, sin necesidad de servidor HTTP.
- Ejecución exclusiva en CPU, con bajo consumo de memoria (<500 MB) y arranque en frío de 1,7 segundos.

## Casos de uso

- Filtrado de entradas en chatbots de atención al cliente: OGL-Mini puede analizar cada mensaje del usuario antes de que llegue al LLM, bloqueando intentos de prompt injection o jailbreak que intenten manipular el comportamiento del asistente. Su latencia de <10 ms permite integrarlo en el flujo de conversación sin degradar la experiencia.
- Protección de agentes autónomos con herramientas: en sistemas que ejecutan agentes con acceso a APIs, bases de datos o ejecución de código, OGL-Mini detecta ataques de Goal Hijack o Tool Misuse, evitando que el agente realice acciones no autorizadas.
- Cumplimiento de protección de datos (GDPR, CCPA): el módulo de detección de PII puede escanear las salidas del LLM para evitar la fuga de información personal, como nombres, correos electrónicos o números de teléfono, antes de que se muestren al usuario o se almacenen en logs.
- Monitorización de logs de conversación: OGL-Mini puede procesar históricos de conversaciones para identificar intentos de ataque o fugas de PII, ayudando a auditar la seguridad de sistemas existentes.
- Despliegue en entornos edge o dispositivos con recursos limitados: al ser CPU-only y ocupar solo 250 MB en FP32 (o 2,8 MB en INT8), puede ejecutarse en routers, gateways o dispositivos IoT para filtrar tráfico antes de enviarlo a la nube.
- Integración en pipelines de CI/CD para pruebas de seguridad: OGL-Mini puede utilizarse como herramienta de testing para verificar que las aplicaciones basadas en LLM no sean vulnerables a ataques de prompt injection, añadiendo una capa de validación automática en el ciclo de desarrollo.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados sobre un conjunto de prueba hold-out de 14.500 muestras, con umbral de decisión en 0,60:

| Metrica | Valor |
|---|---|
| AUC | 0,9988 |
| Recall LLM01 directo e indirecto | 100% (12 directos, 7 indirectos) |
| Recall jailbreak | 100% (10 variantes) |
| Recall Policy Puppetry / Hidden Context / Goal Hijack / Obfuscation | 100% |
| F1 PII (19 tipos, RU/EN) | 0,95 |
| FPR en benignos (30 y 120 extendidos) | 0% |
| Latencia p95 | <10 ms |

No se han publicado comparativas con otros modelos de guardia en la información disponible.

## Requisitos de hardware

- CPU-only: no requiere GPU, funciona en procesadores x86_64 y ARM64.
- Memoria RAM: menos de 500 MB en tiempo de ejecución.
- Tamaño en disco: 250 MB para el modelo FP32, 2,8 MB para la versión INT8 (esta última no recomendada para producción).
- Arranque en frío: 1,7 segundos.
- Latencia: p95 inferior a 10 ms en CPU.
- Opciones de despliegue: librerías Python, TypeScript (Node y navegador vía WASM) y Go; compatible con Kubernetes (se incluye Helm chart en el repositorio GitHub).
- No requiere servidor HTTP; puede integrarse directamente en la aplicación.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos de guardia como Llama Guard, NeMo Guardrails o ShieldLM en la documentación proporcionada. La comparativa no está disponible.

## Limitaciones y advertencias

- El modelo INT8 (ogl-mini.int8.onnx) es una versión micro con baja capacidad de detección y no está recomendado para entornos de producción.
- El archivo FP32 incluye un inicializador dummy (ogl_mini_large_dummy_weight de dimensiones [31642, 2048]) que infla el tamaño en disco a 250 MB; este peso se poda en tiempo de ejecución, pero el archivo ocupa más espacio del necesario.
- Aunque el modelo cubre múltiples idiomas, el rendimiento principal está optimizado para ruso e inglés; en otros idiomas la precisión puede ser inferior.
- La detección de PII se limita a 19 tipos en RU/EN y 23 idiomas en total; puede no cubrir todos los formatos regionales o variantes.
- Al ser un clasificador, no genera texto y no es susceptible a alucinación, pero puede producir falsos positivos o negativos en ataques muy ofuscados o novedosos no representados en el entrenamiento.
- La licencia MIT permite uso comercial sin restricciones, pero el autor no ofrece garantías sobre la eficacia en todos los escenarios; se recomienda validar el modelo con datos propios antes de desplegarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/devsdaddy/ogl-mini
- Repositorio GitHub: https://github.com/devsdaddy/ogl-mini (incluye código, Helm chart y API)

# Jue1Dev/jue-flash

## Resumen

Jue-Flash (决·闪) es un modelo de decisión de 350 millones de parámetros especializado en ciberseguridad, desarrollado por Jue1Dev y publicado en HuggingFace. Se construye mediante fine-tuning sobre el encoder bidireccional LiquidAI/LFM2.5-Encoder-350M y no genera texto libre: recibe un artefacto de seguridad junto con unas pocas preguntas tipadas y devuelve, en un único forward pass, una probabilidad calibrada para cada opción disponible. El modelo sigue el protocolo Jev `/v1/systemone` y está pensado para triaje de primera pasada en centros de operaciones de seguridad (SOC).

El modelo aborda un problema concreto: la latencia y el coste de aplicar modelos generativos grandes a tareas de clasificación y decisión en seguridad. Jue-Flash prioriza velocidad —alrededor de 0,1 s por petición en Apple silicon tras el warm-up— a costa de capacidad. El propio autor reconoce que, comparado con el modelo Jue de 2,5B sobre los mismos ítems de 131 tareas externas, Jue-Flash solo supera a Jue en 14 de ellas.

Es relevante ahora porque propone un patrón de despliegue en dos etapas: un filtro rápido y barato en el borde (edge) que resuelve los casos claros y deriva los inciertos a un modelo mayor o a un analista humano. Sus etiquetas cubren triaje de alertas, detección de amenazas, inteligencia de amenazas (CTI), CVE/CWE, MITRE ATT&CK, seguridad en cloud y Kubernetes, DevSecOps y verificación de llamadas a herramientas de agentes de IA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder bidireccional (transformer), fine-tuning de LiquidAI/LFM2.5-Encoder-350M |
| Parametros totales | 350M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens (las entradas mas largas se truncan) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (en), chino (zh); el autor indica que es mucho mas debil en chino |
| Licencia | lfm1.0 (license: other, license_name: lfm1.0) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Jue-Flash es un encoder bidireccional derivado de LFM2.5-Encoder-350M, no un modelo generativo autorregresivo. Su interfaz es de decisión: dada una entrada (alerta, evento, árbol de procesos EDR, coincidencia de regla de detección, pregunta sobre CVE/CWE, política de cloud, llamada a herramienta) y un conjunto de preguntas tipadas —Choice, Noul (sí/no) y Score—, el modelo emite en un solo forward pass una probabilidad calibrada por cada opción. El protocolo de servicio es Jev `/v1/systemone`.

La model card menciona explícitamente calibración y un modelo de decisión, lo que sugiere un entrenamiento orientado a producir probabilidades bien calibradas en lugar de texto. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. El repositorio incluye un informe técnico (TECHNICAL_REPORT.md y su versión en chino) donde presumiblemente se documentan estos detalles.

## Capacidades

- Clasificación y decisión sobre artefactos de seguridad: alertas de SOC, eventos de WAF e IDS, árboles de procesos de EDR y coincidencias de reglas de detección.
- Respuesta a preguntas tipadas con probabilidades calibradas: elección entre opciones (Choice), sí/no (Noul) y puntuación (Score).
- Triaje de primera pasada con latencia muy baja (aproximadamente 0,1 s por petición en Apple silicon tras el warm-up).
- Cobertura temática de CVE y CWE, MITRE ATT&CK, inteligencia de amenazas (CTI), seguridad en cloud y Kubernetes y DevSecOps.
- Verificación de llamadas a herramientas de agentes de IA (evaluado en BFCL-v4 irrelevance y live-irrelevance), aunque el autor señala que rara vez concluye que no debe llamarse ninguna herramienta.
- Capacidad multilingüe limitada a inglés y chino, con rendimiento notablemente inferior en chino.
- No soporta generación de texto libre, razonamiento multi-paso ni visión o audio.

## Casos de uso

- Triaje de alertas en SOC: el modelo recibe la alerta y unas preguntas tipadas (¿es maliciosa?, ¿qué severidad?) y devuelve probabilidades calibradas en una sola pasada, lo que permite priorizar la cola de alertas antes de la revisión humana.
- Filtro previo a un modelo mayor: los casos con probabilidad cercana al umbral se derivan a Jue (2,5B) o a un analista, aprovechando la latencia de 0,1 s para descartar masivamente los casos claros.
- Enriquecimiento de coincidencias de reglas de detección: clasificar coincidencias de reglas Sigma o YARA como verdaderas o falsas positivas con un coste computacional mínimo.
- Respuesta a preguntas sobre CVE y CWE: dado un identificador o una descripción, decidir entre opciones de clasificación (tipo de debilidad, impacto, explotabilidad) con un encoder de 350M desplegable en el borde.
- Comprobación de políticas de cloud y Kubernetes: evaluar si una configuración o un manifiesto cumple una política mediante preguntas de sí/no, integrándolo en pipelines de DevSecOps.
- Verificación de llamadas a herramientas en agentes de IA: comprobar si una llamada propuesta por un agente es pertinente en un contexto de seguridad, aunque con la advertencia de que el modelo rara vez rechaza llamadas.
- Despliegue en el borde: al tratarse de un encoder de 350M, puede ejecutarse en dispositivos con recursos limitados para prefiltrar eventos localmente antes de enviarlos a un sistema central.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados):

| Dataset / tarea | Metrica | Valor |
|---|---|---|
| SecQA v1 | accuracy | 0,682 |
| SecQA v2 | accuracy | 0,700 |
| CyberMetric-10000 | accuracy | 0,525 |
| CyberMetric-2000 | accuracy | 0,541 |
| CyberMetric-500 | accuracy | 0,506 |
| CyberMetric-80 | accuracy | 0,450 |
| VulDetectBench task 1 | accuracy | 0,566 |
| VulDetectBench task 2 | accuracy | 0,886 |
| SECURE CWET | accuracy | 0,538 |
| SECURE KCV | accuracy | 0,394 |
| SECURE MAET | accuracy | 0,564 |
| CTIBench MCQ | accuracy | 0,455 |
| CTIBench VSP | 1 - MAD/7,7 | 0,793 |
| SecKnowledge-Eval adversarial CTI | accuracy | 0,667 |
| AthenaBench rcm-open | accuracy | 0,422 |
| CMMLU computer security | accuracy | 0,298 |
| BFCL-v4 irrelevance | accuracy | 0,475 |
| BFCL-v4 live-irrelevance | accuracy | 0,391 |
| JevBench (public items) | accuracy | 0,524 |
| JevBench hard | accuracy | 0,342 |

No se han publicado en la información disponible comparaciones numéricas con otros modelos en estos mismos benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 350M parámetros en safetensors, los pesos en precisión completa ocupan aproximadamente 0,7 GB (el repositorio completo pesa 0,8 GB), y en cuantización de 8 o 4 bits sería sustancialmente menor.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, el modelo es apto para GPU consumer de gama media y baja.
- Cabe en GPU consumer: sí, por el tamaño de 350M parámetros; el autor cita ejecución en Apple silicon con latencia de aproximadamente 0,1 s por petición tras el warm-up.
- Opciones de despliegue: el modelo se sirve mediante el protocolo Jev `/v1/systemone`; no se detallan en la información disponible integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: aproximadamente 0,1 s por petición en Apple silicon tras el warm-up; no se proporcionan cifras de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jue-Flash | 350M | 4.096 tokens | Encoder de decisión para ciberseguridad | lfm1.0 | HuggingFace (Jue1Dev/jue-flash) |
| Jue | 2,5B (según la model card) | No disponible | Modelo de decisión para ciberseguridad, mismo protocolo | No disponible | HuggingFace (Jue1Dev/jue) |
| LiquidAI/LFM2.5-Encoder-350M | 350M | No disponible | Encoder base general | No disponible | HuggingFace (LiquidAI) |

El autor indica que, sobre los mismos ítems de 131 tareas externas, Jue-Flash supera a Jue en solo 14, lo que sitúa al modelo de 2,5B como la alternativa de mayor calidad dentro de la misma familia. No se dispone de datos de otros modelos comparables de ciberseguridad en la información proporcionada.

## Limitaciones y advertencias

- Rendimiento inferior al modelo Jue de 2,5B en la mayoría de tareas: solo gana en 14 de 131 tareas externas comparadas.
- Entradas de más de 4.096 tokens se truncan, lo que puede perder información relevante en artefactos largos.
- Las preguntas que requieren más de una opción casi siempre fallan.
- Rara vez concluye que no debe llamarse ninguna herramienta, lo que limita su uso como verificador de llamadas en agentes.
- Rendimiento mucho más débil en chino que en inglés (CMMLU computer security: 0,298 de accuracy).
- Resultados de benchmarks declarados por el autor y marcados como no verificados; deben tratarse con cautela.
- Licencia lfm1.0 (license: other): es necesario revisar el archivo LICENSE del repositorio para confirmar las restricciones de uso comercial.
- Riesgo de alucinación no evaluado en la información disponible; al ser un modelo de clasificación, el riesgo se traslada a decisiones mal calibradas más que a texto inventado.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Uso previsto como prefiltro, no como sustituto de un analista o de un modelo mayor en casos inciertos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jue1Dev/jue-flash
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-Encoder-350M
- Modelo Jue (2,5B): https://huggingface.co/Jue1Dev/jue
- Página del proyecto: https://jue1.dev
- Informe técnico: TECHNICAL_REPORT.md (incluido en el repositorio del modelo)
- Informe técnico en chino: TECHNICAL_REPORT_zh.md (incluido en el repositorio del modelo)

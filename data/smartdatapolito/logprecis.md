# SmartDataPolito/logprecis

## Resumen

LogPrecis es un modelo de clasificación de tokens (token classification) desarrollado por SmartDataPolito, el grupo de investigación del Politecnico di Torino, especializado en el análisis de sesiones de shell Unix maliciosas. El modelo recibe como entrada una sesión Unix y devuelve la secuencia de tácticas MITRE ATT&CK (Enterprise) asociadas a cada comando, lo que permite etiquetar automáticamente las fases de un ataque a partir de los logs. Se construye sobre SecureShellBert, un CodeBERT adaptado al dominio con un corpus de más de 20.000 sesiones Unix, y posteriormente afinado para la tarea de clasificación de tokens con 360 ejemplos etiquetados.

El modelo es relevante en el contexto de la detección y el análisis forense de intrusiones: traduce logs de shell crudos en tácticas MITRE de alto nivel, lo que facilita la correlación con reglas de detección, la generación de informes de incidentes y la priorización de alertas en un SOC. Su tamaño contenido (arquitectura RoBERTa/CodeBERT base) y su licencia Apache 2.0 lo hacen desplegable en infraestructura modesta.

La información pública disponible es limitada: la model card no detalla la longitud de contexto, los idiomas soportados ni el número exacto de parámetros más allá de la arquitectura base declarada. El repositorio ocupa 1,0 GB y acumula 15 descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa / CodeBERT base), token classification |
| Parametros totales | no disponible (arquitectura base CodeBERT, ~125 M típicamente; no confirmado en la informacion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos PyTorch estándar; cuantización dinámica posible vía PyTorch, no documentada) |
| Idiomas soportados | no disponible (entrenado sobre comandos Unix, predominantemente inglés técnico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors / PyTorch (transformers), según repositorio |

## Arquitectura y entrenamiento

LogPrecis sigue un pipeline de tres etapas. Primero parte de CodeBERT (microsoft/codebert-base), un encoder transformer preentrenado sobre código y lenguaje natural. Segundo, se adapta al dominio mediante preentrenamiento continuado sobre un corpus de más de 20.000 sesiones Unix, dando lugar a SecureShellBert. Tercero, se afina para clasificación de tokens (etiquetado BIO de tácticas MITRE) con 360 ejemplos anotados manualmente.

La tarea es de etiquetado a nivel de token sobre la secuencia de comandos de una sesión de shell; la salida es una secuencia de tácticas MITRE ATT&CK Enterprise (por ejemplo, Impact, Execution) asociadas a los comandos. No se documenta en la información disponible el uso de RLHF, DPO ni técnicas de alineación, ni detalles sobre composición exacta del dataset de afinado más allá del número de ejemplos. El código de entrenamiento, los datos y los detalles están publicados en el repositorio de GitHub del autor.

## Capacidades

- Clasificación de tokens sobre sesiones de shell Unix para identificar tácticas MITRE ATT&CK Enterprise.
- Etiquetado de comandos individuales dentro de una sesión (por ejemplo, `wget`, `chmod`, `./exec` mapeados a Execution).
- Análisis de logs maliciosos orientado a respuesta a incidentes y forense.
- Salida estructurada como secuencia de tácticas (por ejemplo, `Impact x 3 -- Execution x 10`).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni modalidades adicionales (visión, audio).
- Capacidades multilingües: no documentadas; el dominio es técnico y basado en comandos Unix.

## Casos de uso

- Triaje de alertas en un SOC: dado un log de sesión sospechosa, LogPrecis devuelve la secuencia de tácticas MITRE, lo que permite priorizar alertas por fase de ataque (por ejemplo, distinguir reconocimiento de impacto) sin revisión manual línea a línea.
- Enriquecimiento de SIEM: integrar el modelo como paso de enriquecimiento en pipelines que ingieren logs de shell, añadiendo etiquetas MITRE a cada evento para correlación con reglas de detección existentes.
- Análisis forense post-incidente: procesar sesiones Unix capturadas (por ejemplo, desde `~/.bash_history` o logs de auditoría) para reconstruir la cadena de tácticas ejecutadas por un atacante.
- Generación de informes de incidentes: usar la secuencia de tácticas como base para redactar resúmenes estructurados de un compromiso, mapeando cada comando a su técnica MITRE correspondiente.
- Detección de comandos de descarga y ejecución: el modelo etiqueta comandos como `wget`, `chmod` y ejecución de binarios, útil para alertar sobre patrones de descarga y ejecución remota.
- Investigación académica en seguridad: el modelo y su pipeline de entrenamiento (código y datos publicados) sirven como base reproducible para experimentos de clasificación de logs y para comparar con enfoques basados en reglas.
- Automatización de playbooks de respuesta: alimentar sistemas de orquestación (SOAR) con la clasificación de tácticas para disparar acciones de contención según la fase detectada.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| Accuracy (test set) | 91,2 % |

La model card declara métricas de accuracy y rouge, pero solo se publica el valor de accuracy (91,2 %) sobre el conjunto de test. No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 1,0 GB; un modelo encoder base de ~125 M de parámetros requiere del orden de 0,5-1 GB en FP32 y menos de 0,5 GB en FP16/INT8, aunque estas cifras no están confirmadas en la información disponible.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente para inferencia; A100/H100 no son necesarias para este tamaño.
- Cabe en GPU de consumo: sí, previsiblemente en GTX 1650, RTX 3060 y superiores (estimación basada en el tamaño del encoder, no confirmada).
- Opciones de despliegue: transformers (PyTorch), pipeline de token-classification; compatible con endpoints (tag `endpoints_compatible`). No se documenta soporte explícito de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Tarea | Licencia |
|---|---|---|---|---|---|
| LogPrecis | RoBERTa/CodeBERT encoder | no disponible (~125 M estimado) | no disponible | Token classification de tácticas MITRE en logs Unix | Apache 2.0 |
| SecureShellBert (modelo base) | CodeBERT adaptado | no disponible | no disponible | Representación de sesiones Unix | no disponible |
| CodeBERT (microsoft) | Transformer encoder | ~125 M | 512 tokens | Representación de código y lenguaje natural | MIT |

No se dispone de información sobre otros modelos comparables específicos de clasificación de tácticas MITRE en logs Unix en la información proporcionada.

## Limitaciones y advertencias

- El conjunto de afinado es pequeño (360 ejemplos), lo que puede limitar la generalización a comandos, shells o entornos no representados en el corpus.
- Riesgo de alucinación o etiquetado incorrecto: al ser un clasificador de tokens, puede asignar tácticas MITRE erróneas a comandos ambiguos o benignos, generando falsos positivos en un SOC.
- Sesgos conocidos: no documentados; el corpus de más de 20.000 sesiones Unix puede no representar la diversidad de entornos reales (distribuciones, shells, idiomas de usuario).
- Limitaciones de contexto e idioma: no documentadas; el modelo está orientado a comandos Unix en inglés técnico.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base (CodeBERT, MIT) y de los datos de entrenamiento publicados en GitHub.
- Caveat de producción: la model card incluye ejemplos de widget con comandos potencialmente maliciosos; deben tratarse como datos de demostración y no ejecutarse. La información sobre latencia, throughput y robustez ante adversarial examples no está disponible.

## Enlaces

- Hugging Face: https://huggingface.co/SmartDataPolito/logprecis
- Modelo base SecureShellBert: https://huggingface.co/SmartDataPolito/SecureShellBert
- CodeBERT (modelo origen): https://huggingface.co/microsoft/codebert-base
- Artículo científico (ScienceDirect): https://www.sciencedirect.com/science/article/pii/S0167404824001068
- Repositorio GitHub (código, datos y detalles de entrenamiento): https://github.com/SmartData-Polito/logprecis
- MITRE ATT&CK Enterprise Tactics: https://attack.mitre.org/tactics/enterprise/

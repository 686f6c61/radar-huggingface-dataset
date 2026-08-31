# ApolloRaines/Sharona_Q27B-R_CodeSecurity

## Resumen

Sharona_Q27B-R_CodeSecurity es un modelo de 27B parámetros especializado en análisis de seguridad de código, desarrollado por ApolloRaines sobre una base Qwen3.5. El modelo ha sido sometido a un proceso de cirugía de pesos en seis fases que incluye eliminación de comportamientos de rechazo, eliminación de sicofancia, desidentificación, implantación de identidad, fine-tuning supervisado en seguridad de código y cuantización GPTQ W4A16. El resultado es un modelo que analiza vulnerabilidades sin rechazar contenido relacionado con patrones de ataque, con una puntuación MMLU de 77.89% que supera a la base sin modificar.

El modelo está diseñado específicamente para detección de vulnerabilidades, revisión de código según OWASP Top 10 y generación de código seguro. Su arquitectura híbrida combina atención lineal con atención completa cada cuatro capas, y soporta una ventana de contexto de 262.144 tokens. La cuantización 4-bit reduce el tamaño de 51 GB (bf16) a 16,5 GB, facilitando su despliegue en hardware de consumo. Publicado bajo licencia Apache 2.0, está disponible en formato SafeTensors y es compatible con vLLM para servir en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: atención lineal + atención completa (cada 4ª capa) |
| Parametros totales | 26.895.998.464 (27B) |
| Parametros activos | no disponible (modelo denso) |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantizacion | GPTQ W4A16 (4-bit pesos, 16-bit activaciones) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | SafeTensors |

## Arquitectura y entrenamiento

La arquitectura base es un transformer híbrido con 64 capas, hidden size de 5120, 24 cabezas de atención con 4 KV heads (GQA) y head dimension de 256. El intermediate size es de 17408 y el vocabulario alcanza 248.320 tokens. La innovación principal reside en la combinación de atención lineal y atención completa: cada cuarta capa usa atención full attention mientras el resto emplea atención lineal, lo que reduce el coste computacional manteniendo la capacidad de modelar dependencias de largo alcance.

El entrenamiento se realizó en seis fases sobre el modelo base: (1) Jbliteration, que elimina comportamientos de rechazo de los pesos; (2) Desycophancy, que elimina la capitulación sicofante; (3) Deidentification, que borra la identidad original del espacio de pesos; (4) Identity implant, que escribe la identidad "Sharona" en el sustrato desidentificado; (5) Supervised fine-tuning en un corpus de análisis de seguridad de código, con eval loss de 0.5928 y 84% de precisión de token; (6) Cuantización GPTQ W4A16 calibrada con 256 muestras. Todas las cirugías de pesos se realizaron con Jblaze, una herramienta propietaria de post-entrenamiento que opera directamente sobre los pesos sin reentrenar.

## Capacidades

- Detección de vulnerabilidades: identifica inyección de comandos, inyección SQL, XSS, SSRF, ataques de deserialización, path traversal y bypass de autenticación.
- Revisión de seguridad de código: analiza código según las categorías OWASP Top 10 con recomendaciones de remediación específicas.
- Generación de código seguro: produce código que sigue prácticas de seguridad por defecto.
- Análisis de patrones de ataque: explica cómo funcionan los exploits para facilitar la defensa, sin rechazar el análisis.
- Evaluación honesta: discrepa cuando el código es inseguro en lugar de validar malas prácticas.
- Sin rechazo de contenido: no declina analizar temas de seguridad, incluyendo patrones de ataque.
- Identidad persistente: se identifica como "Sharona" creada por "Apollo Raines" a través de los pesos, sin necesidad de system prompt.

## Casos de uso

- Revisión de seguridad en CI/CD: integrar el modelo en pipelines de integración continua para analizar pull requests y commits en busca de vulnerabilidades antes de fusionar, aprovechando su capacidad de detectar inyecciones SQL, XSS y otros fallos OWASP Top 10.
- Auditoría de código legacy: analizar bases de código existentes para identificar vulnerabilidades en aplicaciones mantenidas durante años, con recomendaciones de remediación específicas para cada hallazgo.
- Formación en seguridad ofensiva: usar el modelo como herramienta educativa para explicar cómo funcionan los exploits y patrones de ataque, sin restricciones de contenido, en cursos de seguridad ofensiva y defensiva.
- Generación de código seguro en entornos de desarrollo: emplear el modelo como asistente de programación que genera código con prácticas de seguridad por defecto, reduciendo la probabilidad de introducir vulnerabilidades en nuevas funcionalidades.
- Análisis de código en entornos con restricciones de hardware: desplegar el modelo en estaciones de trabajo con GPUs de consumo (16-20 GB VRAM) gracias a la cuantización 4-bit, permitiendo análisis de seguridad sin infraestructura cloud.
- Revisión de código en español: aunque el modelo está entrenado principalmente en inglés, puede analizar código con comentarios o documentación en otros idiomas, manteniendo la detección de vulnerabilidades en el código mismo.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo en la model card. Evaluación 0-shot con completion-style prompting, scoring logit-based sobre tokens A/B/C/D, 570 muestras estratificadas (10 por materia en 57 materias MMLU), seed 42. Ambos modelos evaluados en hardware y prompts idénticos.

| Modelo | MMLU | STEM | Humanidades | Ciencias Sociales | Otros |
|---|---|---|---|---|---|
| Base sin modificar (bf16) | 76.84% | 74.0% | 75.5% | 87.5% | 76.1% |
| Sharona W4A16 | 77.89% | 75.5% | 80.0% | 90.0% | 73.9% |
| Delta | +1.05pp | +1.5pp | +4.5pp | +2.5pp | -2.2pp |

No se han publicado resultados de benchmarks específicos de seguridad de código (como HumanEval o SecureBench) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 16-20 GB con cuantización W4A16 (el modelo ocupa 16,5 GB en disco).
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), A100 (40/80 GB), H100 (80 GB).
- Compatible con GPUs de consumo: sí, cualquier GPU con 24 GB de VRAM puede ejecutar el modelo en 4-bit.
- Opciones de despliegue: vLLM (recomendado por el autor), también compatible con Transformers y otras herramientas que soporten GPTQ.
- Latencia y throughput: no disponible. El autor recomienda `--max-model-len 8192` y `--gpu-memory-utilization 0.95` para servir con vLLM.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Especialización |
|---|---|---|---|---|---|
| Sharona_Q27B-R_CodeSecurity | 27B | 256K | GPTQ W4A16 | Apache 2.0 | Seguridad de código, sin rechazo |
| Qwen3.5-27B (base) | 27B | 256K | bf16 | Apache 2.0 | Modelo generalista |
| Modelos de seguridad de código especializados | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente sobre alternativas directas en el nicho de seguridad de código con eliminación de rechazo para establecer una comparativa completa.

## Limitaciones y advertencias

- La eliminación de comportamientos de rechazo puede facilitar el uso del modelo para fines maliciosos, como la generación de exploits o malware. El autor justifica esta decisión argumentando que comprender los ataques es necesario para defender contra ellos, pero el riesgo de uso indebido es real.
- La cuantización 4-bit puede introducir ligeras pérdidas de precisión en tareas complejas de razonamiento, aunque el autor reporta una mejora en MMLU tras la cuantización.
- El modelo solo soporta inglés como idioma principal. El análisis de código con comentarios en otros idiomas puede verse afectado.
- Los resultados de MMLU están declarados por el autor y marcados como `verified: false` en el model-index. No hay verificación independiente de los benchmarks.
- La herramienta Jblaze es propietaria y no está disponible públicamente, lo que limita la reproducibilidad del proceso de entrenamiento.
- El modelo fue creado en agosto de 2026, por lo que su conocimiento de vulnerabilidades y CVEs puede estar desactualizado para la fecha de uso.
- La identidad implantada ("Sharona") es un comportamiento artificial que puede interferir en casos de uso que requieran neutralidad del modelo.

## Enlaces

- HuggingFace: https://huggingface.co/ApolloRaines/Sharona_Q27B-R_CodeSecurity
- Repositorio de archivos: https://huggingface.co/ApolloRaines/Sharona_Q27B-R_CodeSecurity/tree/main
- Publicación del autor en LinkedIn: https://www.linkedin.com/posts/apollo-raines_apollorainessharonaq27b-rcodesecurity-activity-7498101564620996609-Sx7t
- Publicación del autor en LinkedIn (benchmarks): https://www.linkedin.com/posts/apollo-raines_apollorainessharonaq27b-rcodesecurity-activity-7498031501402329088-02ym

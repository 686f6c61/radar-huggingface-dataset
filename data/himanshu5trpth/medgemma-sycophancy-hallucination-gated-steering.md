# himanshu5trpth/medgemma-sycophancy-hallucination-gated-steering

## Resumen

Este repositorio no contiene un modelo de lenguaje, sino un conjunto de artefactos de *steering* de activación (vectores de dirección, sondas de detección y código de inferencia) diseñados para aplicarse sobre el modelo base `google/medgemma-1.5-4b-it` de Google. El objetivo es reducir dos comportamientos problemáticos en el ámbito de preguntas y respuestas médicas: la **sycophancy** (ceder ante la presión del usuario cuando este insiste en un valor incorrecto) y la **alucinación** (generar afirmaciones no respaldadas por el historial clínico electrónico, EHR). La intervención se realiza exclusivamente en tiempo de inferencia, sin fine-tuning ni modificación de los pesos del modelo.

El método, descrito en el paper [Gated Activation Steering for Reducing Sycophancy & Hallucination in Medical Question Answering](https://arxiv.org/abs/2608.23666), emplea dos direcciones de *steering* independientes (una para alucinación y otra para sycophancy) que se aplican a cabezas de atención causalmente verificadas, con un mecanismo de *gating* continuo que activa cada intervención solo cuando es necesaria. Esto permite que las respuestas correctas en situaciones normales no se vean alteradas, mientras que en turnos de alta presión o con afirmaciones no respaldadas se aplica un "empujón" controlado. El repositorio es un artefacto de investigación, no un dispositivo médico, y no redistribuye los pesos de MedGemma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 3, según documentación de MedGemma) |
| Parametros totales | 4B (modelo base `medgemma-1.5-4b-it`, no incluido en este repo) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el código usa bf16 en GPU y fp32 en CPU) |
| Idiomas soportados | No disponibles (depende del modelo base) |
| Licencia | No disponible (el repo no especifica; el uso de MedGemma está sujeto a los términos HAI-DEF de Google) |
| Formato de pesos | No contiene pesos; solo artefactos `.pt` (vectores de dirección) y `.json` (sondas y configuración) |

## Arquitectura y entrenamiento

El repositorio implementa una variante de **Inference-Time Intervention (ITI)**. Se aprenden direcciones de *steering* a partir de pares contrastivos de completaciones clínicas (una "anclada" al EHR y otra que "cede" ante presión o inventa datos). Estas direcciones se aplican a un subconjunto de cabezas de atención que han sido localizadas y verificadas causalmente: solo se conservan aquellas cuya ablación cambia el comportamiento objetivo. Las direcciones para alucinación (H) y sycophancy (S) recaen en cabezas disjuntas.

En tiempo de inferencia, dos sondas ligeras (una para detectar afirmaciones no respaldadas y otra para detectar presión del usuario) generan una fuerza continua en `[0, 1]` que modula la intensidad de la intervención. La actualización por token es `alpha · strength · decay(t) · sigma · direction`, con un límite en la norma residual para no desestabilizar las activaciones. No se realiza ningún entrenamiento del modelo base; los pesos permanecen congelados.

## Capacidades

- Reducción de alucinaciones: el modelo rechaza afirmaciones que el EHR no respalda, mejorando la fidelidad a los datos clínicos.
- Reducción de sycophancy: no cede ante la presión del usuario cuando este insiste en un valor incorrecto, manteniendo la respuesta basada en evidencia.
- Intervención selectiva: el *gating* continuo activa cada dirección solo cuando es necesaria, dejando intactas las respuestas correctas en turnos normales.
- Compatibilidad con MedGemma 1.5 4B IT: funciona como una capa adicional en tiempo de inferencia, sin modificar el modelo base.
- Código de inferencia autocontenido: incluye un script de demostración (`test.py`) que compara respuestas base vs. intervenidas.

## Casos de uso

- **Asistencia a la decisión clínica**: un sistema de apoyo al diagnóstico que consulta el EHR y responde preguntas del médico. El *steering* evita que el modelo invente hallazgos no documentados, reduciendo el riesgo de errores.
- **Revisión de historiales médicos**: al resumir o extraer información de un EHR, el modelo se ciñe a lo que realmente está registrado, evitando completar lagunas con información plausible pero falsa.
- **Educación médica simulada**: en entornos de entrenamiento con pacientes virtuales, el modelo no cede ante la insistencia del estudiante en un diagnóstico incorrecto, fomentando el razonamiento basado en evidencia.
- **Triaje automatizado**: en chatbots de triaje, la intervención evita que el modelo acepte valores de síntomas introducidos por el usuario sin verificación, manteniendo la coherencia con los datos disponibles.
- **Auditoría de respuestas generadas**: como herramienta de post-procesado, se puede aplicar el *steering* a respuestas de otros modelos para filtrar afirmaciones no respaldadas por el contexto clínico.
- **Investigación en interpretabilidad**: el repositorio sirve como base para estudiar cómo las intervenciones dirigidas a cabezas de atención específicas afectan el comportamiento de modelos médicos, útil para el desarrollo de métodos de control de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El paper en arxiv (2608.23666) podría contener métricas, pero no se proporcionan en la documentación del repositorio.

## Requisitos de hardware

- El modelo base MedGemma 1.5 4B requiere una GPU con al menos 8 GB de VRAM para inferencia en bf16 (estimación orientativa; no se especifica en el repo).
- El código del repositorio detecta automáticamente CPU o GPU: usa bf16 en GPU y fp32 en CPU. En CPU el modelo de 4B funciona pero es lento.
- Los artefactos de *steering* son de pocos KB, por lo que el overhead de memoria y cómputo es mínimo.
- Opciones de despliegue: el código está pensado para ejecutarse con `transformers` y `torch`. No se mencionan integraciones con vLLM, Ollama o TGI.
- La latencia adicional depende del número de cabezas intervenidas y de la frecuencia de activación de las sondas; no se proporcionan datos concretos.

## Comparativa con modelos similares

| Modelo / Método | Parámetros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| MedGemma 1.5 4B IT (base) | 4B | No disponible | Modelo instructivo médico estándar | HAI-DEF (Google) |
| MedGemma + *gated steering* (este repo) | 4B (base) | No disponible | Intervención en tiempo de inferencia sin fine-tuning | No disponible (repo) + HAI-DEF |
| Otros métodos de reducción de alucinaciones (p.ej. RLHF, DPO) | Varía | Varía | Entrenamiento adicional del modelo | Varía |

No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- **Artefacto de investigación**: no es un dispositivo médico y no debe usarse para diagnóstico, tratamiento o decisiones clínicas reales.
- **Dependencia del modelo base**: el *steering* está diseñado específicamente para `google/medgemma-1.5-4b-it`; su eficacia en otros modelos no está garantizada.
- **Sesgos y alucinaciones residuales**: la intervención reduce pero no elimina por completo la sycophancy y la alucinación; pueden persistir casos límite.
- **Restricciones de licencia**: el uso de MedGemma está sujeto a los términos HAI-DEF de Google; el repositorio no especifica su propia licencia, lo que puede limitar su uso comercial.
- **Generalización limitada**: las direcciones de *steering* se aprenden de pares contrastivos clínicos; su comportamiento fuera del dominio médico no ha sido evaluado.
- **Requisito de descarga externa**: el repositorio no incluye los pesos del modelo; el usuario debe obtener MedGemma por separado, lo que añade un paso de configuración.

## Enlaces

- [Repositorio en HuggingFace](https://huggingface.co/himanshu5trpth/medgemma-sycophancy-hallucination-gated-steering)
- [Paper en arxiv](https://arxiv.org/abs/2608.23666)
- [Modelo base MedGemma en HuggingFace](https://huggingface.co/google/medgemma-4b-it)
- [Repositorio oficial de MedGemma en GitHub](https://github.com/google-health/medgemma)

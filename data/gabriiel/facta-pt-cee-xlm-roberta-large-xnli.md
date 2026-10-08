# Gabriiel/facta-pt-cee-xlm-roberta-large-xnli

## Resumen

El modelo `Gabriiel/facta-pt-cee-xlm-roberta-large-xnli` es un clasificador de texto basado en XLM-RoBERTa-large, ajustado por el usuario Gabriiel para la tarea de implicación entre afirmación y evidencia (Claim-Evidence Entailment) dentro del proyecto FACTA-PT, orientado a la verificación automatizada de hechos en portugués europeo. Parte del checkpoint `joeddav/xlm-roberta-large-xnli`, que ya venía especializado en inferencia de lenguaje natural (NLI) de tres clases, y se ha reentrenado para clasificar la relación factual entre un fragmento de afirmación (hipótesis) y un pasaje de evidencia (premisa).

El modelo resuelve un problema concreto en una cadena de fact-checking automatizado: una vez que un documento ha sido clasificado como relevante, este componente determina si la evidencia textual respalda la afirmación (Supported), la refuta (Refuted) o no aporta información suficiente (NEI). Se trata de un encoder de aproximadamente 560 millones de parámetros, con 559.893.507 parámetros reales según los pesos en safetensors, y una ventana de contexto heredada de la arquitectura XLM-RoBERTa-large.

Su relevancia actual radica en que forma parte de una pipeline modular de verificación de hechos en portugués, un idioma con menos recursos que el inglés en este dominio, y en que se publica bajo licencia MIT, lo que facilita su reutilización comercial e integración en sistemas de moderación de contenido o verificación periodística.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa-large (transformer encoder bidireccional, tipo RoBERTa sobre XLM) |
| Parametros totales | 559.893.507 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (herencia de la arquitectura XLM-RoBERTa-large; no especificado en la model card) |
| Tipos de cuantizacion | No disponible (no se distribuyen versiones cuantizadas; pesos en safetensors) |
| Idiomas soportados | Portugues (pt), con foco en portugues europeo; el modelo base es multilingue (100 idiomas) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder bidireccional de la familia XLM-RoBERTa-large, con aproximadamente 560 millones de parámetros, desarrollada originalmente por Facebook AI sobre 2,5 TB de datos de CommonCrawl filtrados en 100 idiomas. El modelo base `joeddav/xlm-roberta-large-xnli` añade un ajuste fino previo de NLI de tres clases, lo que lo convierte en un punto de partida especializado en relaciones de tipo entailment/neutral/contradiction.

El ajuste de este repositorio se realizó sobre pasajes de evidencia construidos a partir de las anotaciones de evidencia externa CLEVER, desarrolladas en la disertación asociada. En la formulación experimental, cada pasaje de evidencia se compone de tres frases consecutivas; el pasaje se trata como premisa y el fragmento de afirmación como hipótesis, y el modelo predice una de tres etiquetas: Supported, Refuted o NEI (Not Enough Information). No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO; al tratarse de una tarea de clasificación supervisada, lo habitual sería un ajuste fino con entropía cruzada, aunque este extremo no se confirma en la model card.

## Capacidades

- Clasificación de texto en tres clases: Supported, Refuted y NEI para pares afirmación-evidencia.
- Inferencia de lenguaje natural (NLI) multilingüe heredada del modelo base, con especialización en portugués europeo.
- Clasificación a nivel de pasaje: evalúa la relación factual entre una afirmación y un fragmento de evidencia local.
- Integración en pipelines de verificación de hechos automatizada como componente posterior a la clasificación de relevancia de documentos.
- Uso como modelo de embeddings de texto mediante text-embeddings-inference (etiqueta endpoints_compatible).
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de visión o audio: no disponibles.
- Modo "thinking" o razonamiento extendido: no disponible.

## Casos de uso

- Verificación de hechos periodística: dado un titular o afirmación extraída de un texto, el modelo evalúa si un pasaje de evidencia recuperado previamente la respalda, la refuta o resulta insuficiente, integrándose como etapa final de un pipeline de fact-checking en portugués.
- Moderación de contenido en plataformas en portugués: comprobar automáticamente si afirmaciones publicadas por usuarios están respaldadas por fuentes citadas o por documentación interna, marcando aquellas sin evidencia suficiente (NEI).
- Enriquecimiento de bases de conocimiento: clasificar relaciones entre afirmaciones y fragmentos de documentación para anotar automáticamente corpus con etiquetas de implicación factual.
- Asistencia a redacciones y equipos de verificación: priorizar afirmaciones dudosas filtrando las que carecen de evidencia (NEI) antes de la revisión humana.
- Sistemas de preguntas y respuestas con atribución: verificar si un pasaje recuperado justifica la respuesta generada, reduciendo afirmaciones sin respaldo documental.
- Análisis de discurso político o parlamentario: contrastar declaraciones con transcripciones o documentos oficiales para detectar contradicciones factuales.
- Investigación académica en PLN para portugués: servir como baseline o componente en experimentos de claim verification y NLI en portugués europeo.
- Construcción de datasets anotados: generar etiquetas preliminares Supported/Refuted/NEI sobre pares afirmación-evidencia para preanotación supervisada por humanos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 2,3 GB de pesos (el repositorio ocupa 2,3 GB), más memoria para activaciones; en la práctica, unos 3-4 GB.
- VRAM estimada en fp16: aproximadamente 1,1-1,5 GB, con margen para el batch.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM es suficiente; tarjetas como RTX 3060, RTX 4060, RTX 4090 o superiores funcionan sin problema. Para despliegue a gran escala, A100 o H100 aportan mayor throughput en lotes grandes.
- Compatibilidad con GPU de consumo: sí, cabe holgadamente en GPUs de consumo actuales e incluso en equipos con 8 GB de VRAM.
- Opciones de despliegue: transformers (librería declarada), text-embeddings-inference (etiqueta endpoints_compatible), y potencialmente ONNX u otros runners compatibles con modelos de clasificación; vLLM, llama.cpp y Ollama no están confirmados para este checkpoint.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gabriiel/facta-pt-cee-xlm-roberta-large-xnli | 559.893.507 | 512 tokens | Claim-evidence entailment (pt) | MIT | HuggingFace |
| joeddav/xlm-roberta-large-xnli | ~560 M | 512 tokens | NLI 3 clases (multilingue) | MIT | HuggingFace |
| FacebookAI/xlm-roberta-large | ~560 M | 512 tokens | Representaciones multilingues / MLM | MIT | HuggingFace |

El modelo se distingue del checkpoint base `joeddav/xlm-roberta-large-xnli` por su ajuste específico a la tarea de implicación afirmación-evidencia sobre pasajes de tres frases en portugués europeo, mientras que el modelo original ofrece NLI genérico multilingüe. No se dispone de datos de benchmarks que permitan comparar el rendimiento relativo entre estas alternativas.

## Limitaciones y advertencias

- El modelo realiza clasificación a nivel de pasaje y no identifica por sí mismo la región de evidencia adecuada dentro de un documento completo; requiere una etapa previa de selección de evidencia.
- El rendimiento debe interpretarse con cautela en las clases con pocos ejemplos en los datos de evaluación, según advierte la propia model card.
- Riesgo de alucinación: al ser un clasificador, no genera texto libre, pero puede producir clasificaciones erróneas (falsos Supported o Refuted) cuando la evidencia es ambigua o parcial.
- Sesgos conocidos: no se documentan sesgos específicos en la información disponible; al derivar de XLM-RoBERTa, puede heredar sesgos presentes en los datos de CommonCrawl.
- Limitaciones de idioma: aunque el modelo base es multilingüe, este ajuste está orientado al portugués (con foco en portugués europeo), por lo que su comportamiento en otros idiomas no está validado.
- Restricciones de licencia: licencia MIT, que permite uso comercial, modificación y redistribución, siempre manteniendo el aviso de copyright y la licencia.
- Cobertura limitada para producción: el repositorio registra 0 descargas y 0 "me gusta", por lo que no existe validación comunitaria ni evidencia de uso en producción.
- Dependencia de la formulación experimental: cada pasaje de evidencia consta de tres frases consecutivas, y desviarse de ese formato puede afectar al rendimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Gabriiel/facta-pt-cee-xlm-roberta-large-xnli
- Modelo base: https://huggingface.co/joeddav/xlm-roberta-large-xnli
- XLM-RoBERTa-large original: https://huggingface.co/FacebookAI/xlm-roberta-large
- Documentación de XLM-RoBERTa en transformers: https://huggingface.co/docs/transformers/v5.0.0/model_doc/xlm-roberta

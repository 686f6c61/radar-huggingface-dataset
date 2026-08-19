# QinEmPeRoR93/nassila-sanad-9b

## Resumen

Nassila Sanad 9B es un modelo de lenguaje especializado en grounding de texto completo, desarrollado por QinEmPeRoR93 como parte del proyecto Nassila. Su función principal es verificar afirmaciones contenidas en manuscritos académicos contrastándolas con extractos de fuentes completas, devolviendo un JSON estructurado con veredictos por afirmación, citas textuales y racionalidad. El modelo está diseñado para integrarse en la aplicación Nassila (nassila-goai) como capa de razonamiento, mientras que la verificación final siempre la realiza un verificador determinista.

Se basa en el modelo Qwen/Qwen3.5-9B, con un ajuste fino específico para la tarea de grounding. Está disponible exclusivamente en formato GGUF, con múltiples cuantizaciones que van desde Q2_K hasta Q8_0, incluyendo variantes con MTP (multi-token prediction) para decodificación especulativa en llama.cpp. El modelo soporta inglés y árabe, y su licencia es Apache 2.0. Su relevancia radica en ofrecer una solución local y de código abierto para verificación de afirmaciones en entornos académicos, sin depender de APIs externas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3.5-9B) |
| Parametros totales | 8.953.803.264 (8,95B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (en ejemplos de uso se configura 8192, pero no es el máximo oficial) |
| Tipos de cuantizacion | Q2_K, Q3_K_M, Q4_K_M, Q5_K_M, Q6_K, Q8_0 (además variantes MTP de cada una) |
| Idiomas soportados | Inglés (en), árabe (ar) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B, un transformer denso de 9B parámetros, y ha sido sometido a un ajuste fino (fine-tuning) específico para la tarea de grounding de afirmaciones. La arquitectura base incluye un modo de razonamiento ("thinking") que por defecto está activado, pero que en este modelo debe desactivarse mediante la plantilla de chat `enable_thinking=false` para evitar que el JSON de salida se trunque. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens utilizados ni el método de alineación (RLHF, DPO, etc.).

Una innovación destacable es la inclusión de una cabeza MTP (multi-token prediction) en las variantes `-mtp-`, que permite decodificación especulativa en llama.cpp mediante `--spec-type draft-mtp`. Esto acelera la generación sin cambiar el trunk entrenado. El modelo está diseñado para producir exclusivamente un objeto JSON con la estructura `{claims:[{claim, verdict, sourceQuotes, rationale, hasNumericClaim}], overallVerdict, overallRationale}`.

## Capacidades

- Grounding de afirmaciones: verifica cada afirmación de un manuscrito contra extractos de texto completo y devuelve un veredicto (supported, refuted, etc.) con citas textuales.
- Salida estructurada en JSON: genera un único objeto JSON con detalle por afirmación y un veredicto global.
- Detección de afirmaciones numéricas: incluye el campo `hasNumericClaim` para señalar si la afirmación contiene datos cuantitativos.
- Multilingüe: soporta inglés y árabe, aunque el entrenamiento específico para grounding no detalla el equilibrio entre idiomas.
- Compatible con decodificación especulativa mediante MTP en llama.cpp, reduciendo la latencia en hardware compatible.
- Integración con Nassila 1.8.0+: funciona como único nivel de grounding en la aplicación, con soporte para LM Studio, Ollama, vLLM y servidores personalizados.

## Casos de uso

- Revisión editorial de manuscritos académicos: el modelo puede verificar automáticamente si las afirmaciones de un artículo se corresponden con las fuentes citadas, ayudando a detectar citas incorrectas o exageraciones.
- Control de calidad en publicaciones científicas: integrar Sanad 9B en un pipeline de pre-publicación para validar la exactitud de las referencias y afirmaciones, reduciendo el trabajo manual de los revisores.
- Investigación bibliográfica asistida: dado un conjunto de afirmaciones extraídas de una revisión de literatura, el modelo las contrasta con los textos completos de los artículos fuente, agilizando la síntesis de evidencias.
- Auditoría de informes técnicos: verificar que las conclusiones de un informe se sustentan en los datos y documentos adjuntos, generando un registro JSON auditable.
- Detección de inconsistencias en documentos legales o normativos: contrastar cláusulas o declaraciones contra el texto completo de la normativa aplicable.
- Asistencia a redacción académica: mientras se escribe un artículo, el modelo puede comprobar en tiempo real si las afirmaciones propuestas están respaldadas por las fuentes cargadas, sugiriendo citas correctas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona una "evaluación multi-seed full-text holdout" con resultados cualitativos incluidos en un documento de competición (GOAI Track 3 — Open Exploration), pero no se aportan métricas numéricas (MMLU, HumanEval, GSM8K, etc.). Se indica que los residuos de falsos positivos se localizaron en artefactos de copyright/pie de página de revistas y se corrigieron a nivel de datos.

## Requisitos de hardware

- VRAM estimada según cuantización (archivos no MTP):
  - Q2_K: 3,8 GB → cabe en 4 GB VRAM o 8 GB RAM
  - Q3_K_M: 4,6 GB → cabe en 6 GB VRAM o 8 GB RAM
  - Q4_K_M: 5,6 GB → cabe en 8 GB VRAM o 12 GB RAM
  - Q5_K_M: 6,5 GB → cabe en 8 GB VRAM o 16 GB RAM
  - Q6_K: 7,4 GB → requiere 10 GB+ VRAM
  - Q8_0: 9,5 GB → requiere 12 GB+ VRAM
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM puede ejecutar las cuantizaciones Q4_K_M o Q5_K_M. Para Q6_K o Q8_0 se recomienda una GPU de gama alta (RTX 4080/4090, A100, etc.). En CPU, las cuantizaciones Q2_K y Q3_K_M pueden ejecutarse con 8 GB de RAM.
- Opciones de despliegue: llama.cpp (llama-server), LM Studio, Ollama (versión 0.5+), vLLM y servidores personalizados compatibles con OpenAI.
- Latencia y throughput: no se proporcionan datos concretos. Las variantes MTP pueden acelerar la generación mediante decodificación especulativa, pero el rendimiento depende del hardware y la configuración.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con otros modelos de grounding específicos. Como referencia, el modelo base Qwen3.5-9B es un LLM generalista de 9B parámetros con licencia Apache 2.0, mientras que Nassila Sanad 9B es un ajuste fino para una tarea concreta. No se conocen alternativas equivalentes en el ecosistema open source con la misma especialización en verificación de afirmaciones con salida JSON estructurada.

## Limitaciones y advertencias

- El modelo solo proporciona grounding de asesoramiento: los veredictos finales ("ship verdict") siempre los emite el verificador determinista, nunca el modelo. No debe usarse como fuente única de verdad en decisiones críticas.
- Requiere desactivar el modo de razonamiento (`enable_thinking=false`) mediante una plantilla de chat específica; si no se hace, el JSON de salida puede truncarse.
- No está incluido en el instalador de Nassila; debe descargarse e integrarse manualmente.
- La evaluación cualitativa menciona que se detectaron falsos positivos residuales relacionados con artefactos de copyright y pies de página de revistas, aunque se corrigieron a nivel de datos.
- No se especifica la longitud máxima de contexto soportada por el modelo base; en los ejemplos se usa 8192 tokens, pero podría ser mayor o menor.
- Solo cubre inglés y árabe; no se garantiza un rendimiento adecuado en otros idiomas.
- Al ser un ajuste fino de un modelo base, puede heredar sesgos presentes en Qwen3.5-9B, aunque no se documentan explícitamente.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/QinEmPeRoR93/nassila-sanad-9b)
- [Repositorio nassila-goai](https://github.com/jamalesam93/nassila-goai)
- [Modelo base Qwen/Qwen3.5-9B](https://huggingface.co/Qwen/Qwen3.5-9B)
- [Licencia de Qwen](https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE)

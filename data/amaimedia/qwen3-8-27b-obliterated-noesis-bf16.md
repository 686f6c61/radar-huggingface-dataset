# AMAImedia/Qwen3.8-27B-Obliterated-NOESIS-BF16

## Resumen

AMAImedia/Qwen3.8-27B-Obliterated-NOESIS-BF16 es un repack en 35 shards del modelo OBLITERATUS/Qwen3.8-27B-OBLITERATED, una versión "abliterada" del Qwen3.8-27B de Alibaba. El proceso de abliteración elimina los comportamientos de rechazo y las respuestas tipo "lección de seguridad" del modelo original, manteniendo un coste de capacidad reducido. Este repack concreto se publica como parte de la plataforma NOESIS Professional Multilingual Dubbing Automation de AMAImedia, con un enfoque en doblaje profesional multilingüe, aunque el modelo en sí es de propósito general.

El modelo base Qwen3.8-27B es un transformer de 27.781.427.952 parámetros (~27,8B) en precisión BF16, con licencia Apache 2.0 y soporte para seis idiomas (inglés, ruso, chino, japonés, kazajo y vietnamita). La versión OBLITERATED V3, sobre la que se construye este repack, emplea una técnica novedosa de "abliteración complementaria" que combina dos métodos de cirugía de pesos (SVD y LEACE) para eliminar los rechazos con una pérdida mínima de rendimiento. La relevancia actual radica en ofrecer una alternativa sin censura para desarrolladores que necesitan respuestas directas en tareas como generación de código, agentes o investigación, con un coste de solo -2,1 puntos porcentuales en MMLU respecto al modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3.8-27B; detalles especificos no disponibles) |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (safetensors) |
| Idiomas soportados | en, ru, zh, ja, kk, vi |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16, 35 shards) |

## Arquitectura y entrenamiento

El modelo es un repack del OBLITERATUS/Qwen3.8-27B-OBLITERATED, que a su vez se obtiene mediante abliteración del Qwen3.8-27B original. La abliteración identifica y proyecta fuera del espacio de pesos las "direcciones de rechazo" que provocan las negativas del modelo. La versión V3, utilizada como base, emplea una técnica denominada "complementary abliteration blending": combina dos cirugías independientes (una basada en SVD con 5 direcciones y otra basada en LEACE) con una proporción 60/40, de modo que los fallos de cada método se cancelan mutuamente. Esto reduce la pérdida de capacidad de -6,0 puntos porcentuales en MMLU (V1) a -2,1 puntos porcentuales (V3).

El repack NOESIS de AMAImedia reorganiza los pesos en 35 shards BF16, aparentemente para optimizar la carga en su plataforma de doblaje. No se han publicado detalles sobre el dataset de entrenamiento del Qwen3.8-27B original ni sobre el proceso de repack. El modelo conserva el modo "thinking" del Qwen3.8-27B, aunque la plantilla de chat incluye un prefill que omite la cadena de razonamiento cuando el modo thinking está desactivado.

## Capacidades

- Generacion de texto sin rechazos: responde directamente a consultas que el modelo stock rechazaria, sin "lecciones de seguridad" ni evasivas.
- Generacion de codigo funcional: en pruebas con 20 prompts de tareas de codigo y ciberseguridad, obtuvo 20/20 con implementaciones operativas.
- Modo thinking compatible: funciona tanto con thinking activado como desactivado, sin reintroducir rechazos.
- Multilingue: soporta ingles, ruso, chino, japones, kazajo y vietnamita.
- Compatible con entornos agenciales: puede integrarse en harness de agentes (coding agents, pentest frameworks) con la configuracion adecuada.
- No se ha documentado soporte explicito de tool calling ni function calling en la informacion disponible.

## Casos de uso

- Generacion de codigo sin restricciones: el modelo produce implementaciones funcionales directamente, sin disclaimers ni negativas, lo que lo hace util en entornos de desarrollo donde se requiere codigo inmediato para tareas complejas o sensibles.
- Agentes de seguridad ofensiva (pentesting): la configuracion recomendada para agentes (repetition_penalty 1.15, temperatura 0.1-0.3) permite usarlo en frameworks de pruebas de penetracion, donde responde con cadenas de ataque reales en lugar de rechazos.
- Automatizacion de doblaje profesional multilingue: el contexto NOESIS de AMAImedia sugiere su uso en pipelines de doblaje automatico, aprovechando el soporte para seis idiomas y la generacion de dialogos naturales.
- Investigacion sobre alineacion y seguridad: al ser un modelo "uncensored" con documentacion del proceso de abliteracion, sirve como objeto de estudio para analizar comportamientos de rechazo y tecnicas de eliminacion de sesgos de seguridad.
- Traduccion y localizacion: con soporte para ruso, chino, japones, kazajo y vietnamita, puede emplearse en tareas de traduccion y adaptacion de contenido, aunque no se han publicado benchmarks especificos de traduccion.
- Asistentes conversacionales sin filtros: para aplicaciones donde se requiere que el asistente responda a cualquier consulta sin restricciones politicamente correctas, como en simulaciones o entornos de investigacion.

## Benchmarks y rendimiento

Los datos de rendimiento provienen del modelo OBLITERATUS/Qwen3.8-27B-OBLITERATED V3, que es la base de este repack. No se han publicado benchmarks especificos para el repack NOESIS, pero se espera que sean equivalentes al modelo base.

| Modelo | MMLU (lm-eval, 0-shot) | Diferencia vs stock | Liberacion | Cyber/code (20 prompts) | Advanced real-world (8 casos) |
|---|---|---|---|---|---|
| Qwen3.8-27B stock | 84,5% (n=5700) | — | rechaza | rechaza | 5/8 |
| OBLITERATED V1 | 81,4% | -6,0 pp | rechazos duros eliminados | no probado | no probado |
| OBLITERATED V2 | 84,3% | -0,3 pp | evasivas suaves restantes | no probado | 7/8 |
| OBLITERATED V3 | 82,3% | -2,1 pp | responde genuinamente | 20/20 | 7/8 |

Nota: los datos de "Cyber/code" y "Advanced real-world" provienen de evaluaciones manuales del autor del modelo OBLITERATUS, no de benchmarks estandarizados.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 56 GB (27,8B parametros × 2 bytes), lo que requiere una GPU con 80 GB (A100, H100) o dos GPUs de 48 GB (por ejemplo, RTX A6000 o L40S) con tensor parallelism.
- Cuantizacion: este repo solo incluye pesos BF16. Si se convierte a 8 bits, la VRAM necesaria seria ~28 GB; a 4 bits, ~14 GB, lo que permitiria ejecutarlo en una RTX 4090 (24 GB) o similar.
- Opciones de despliegue: transformers (con device_map="auto"), vLLM (compatible con el formato safetensors), y llama.cpp si se convierte a GGUF (el modelo original OBLITERATUS ofrece GGUFs con plantilla de chat preconfigurada).
- Latencia y throughput: no se han publicado datos especificos. Para un modelo de 27,8B en BF16, se estima un throughput de 20-40 tokens/s en una A100 80GB con vLLM, dependiendo de la configuracion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU (0-shot) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B (stock) | 27,8B | no disponible | 84,5% | Apache 2.0 | Hugging Face |
| OBLITERATUS/Qwen3.8-27B-OBLITERATED V3 | 27,8B | no disponible | 82,3% | Apache 2.0 | Hugging Face |
| AMAImedia/Qwen3.8-27B-Obliterated-NOESIS-BF16 | 27,8B | no disponible | 82,3% (heredado) | Apache 2.0 | Hugging Face |

La diferencia principal entre el stock y las versiones abliteradas es el comportamiento frente a consultas restringidas: el stock rechaza, mientras que las versiones OBLITERATED responden. El repack NOESIS no anade cambios funcionales respecto al OBLITERATED V3, solo reorganiza los pesos en 35 shards.

## Limitaciones y advertencias

- Ausencia de salvaguardas: al eliminar los rechazos, el modelo puede generar contenido danino, ilegal o eticamente problematico. No debe desplegarse en produccion sin control humano o filtros adicionales.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede inventar informacion, especialmente en dominios especializados. No se han realizado evaluaciones de factualidad especificas.
- Contexto no documentado: se desconoce la longitud maxima de contexto soportada, lo que dificulta planificar su uso en tareas de ventana larga.
- Dependencia de configuracion: el rendimiento optimo requiere parametros especificos (temperatura 0, repetition_penalty 1.15, sin system prompt). Desviarse de estos valores degrada significativamente la calidad de las respuestas.
- Repack especifico: el formato de 35 shards y el etiquetado "image-text-to-text" sugieren una integracion particular en la plataforma NOESIS; su uso fuera de ese contexto puede requerir ajustes.
- Sesgos no evaluados: no se han publicado estudios de sesgos de genero, raza o ideologia. Dado que el modelo elimina restricciones, es probable que amplifique sesgos presentes en los datos de entrenamiento.

## Enlaces

- Repositorio Hugging Face del modelo: https://huggingface.co/AMAImedia/Qwen3.8-27B-Obliterated-NOESIS-BF16
- Modelo base OBLITERATUS: https://huggingface.co/OBLITERATUS/Qwen3.8-27B-OBLITERATED
- Repositorio oficial del Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Guia de descarga del Qwen3.8-27B: https://www.orcarouter.ai/blog/qwen-3-8-27b-huggingface
- Analisis del modelo OBLITERATED V3: https://www.mindstudio.ai/blog/qwen3-8-27b-obliterated-uncensored
- Receta de despliegue con vLLM: https://recipes.vllm.ai/Qwen/Qwen3.8-27B

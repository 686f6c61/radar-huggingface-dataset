# esherialabs/saferide-gemma-3n

## Resumen

El modelo `esherialabs/saferide-gemma-3n` es un ajuste fino especializado del modelo multimodal `google/gemma-3n-E4B-it` de Google, desarrollado por el laboratorio esherialabs para asistir a supervivientes de violencia de género (GBV, por sus siglas en inglés) en contextos de transporte público y similares. El modelo combina capacidades de texto y audio para ofrecer orientación paso a paso, transcripción de narraciones de incidentes y sugerencia de etiquetas de delito, todo con un enfoque de privacidad por defecto y pensado para ejecutarse en dispositivos móviles Android y entornos de bajos recursos, sin dependencia de la nube.

La relevancia actual del modelo radica en su enfoque de dominio específico: no es un chatbot generalista, sino una herramienta de apoyo para supervivientes, trabajadores de primera línea, consejeros y personal de líneas de ayuda. El ajuste se realizó mediante LoRA sobre las capas de lenguaje, visión y audio del modelo base, que utiliza la arquitectura MatFormer con caché de parámetros Per-Layer Embedding (PLE). El repositorio actual está marcado como histórico y superado, ya que el proyecto SafeRide migró a una versión basada en Gemma 4 E2B en junio de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MatFormer (base Gemma 3n) con adaptadores LoRA en capas de lenguaje, vision y audio |
| Parametros totales | 4B (modelo base) + adaptadores LoRA (no especificado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128k tokens (capacidad del modelo base Gemma 3n) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (segun la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-3n-E4B-it`, un modelo multimodal de 4B parametros con arquitectura MatFormer, que permite reducir requisitos de computo y memoria mediante el cacheo de parametros Per-Layer Embedding (PLE). Esta arquitectura esta optimizada para dispositivos moviles y de bajo consumo. El ajuste fino se realizo con LoRA (Low-Rank Adaptation) de forma eficiente en parametros, aplicandose tanto a las capas de lenguaje como a las de vision y audio, lo que permite adaptar el modelo a las tareas especificas de asistencia en violencia de genero sin necesidad de reentrenar todos los pesos.

No se proporcionan detalles sobre el dataset de entrenamiento, el numero de tokens utilizados ni el proceso de alineacion (RLHF, DPO, etc.). La model card indica que el objetivo es construir un asistente especializado en GBV con tres funciones principales: guia conversacional paso a paso, transcripcion de audio con fines de evidencia y sugerencia de etiquetas de delito a partir de una taxonomia controlada. El entrenamiento se oriento a preservar la informacion clave (quien, que, cuando, donde) en las transcripciones y a minimizar la alucinacion.

## Capacidades

- Generacion de texto conversacional para orientacion post-incidente, con pasos claros y sensibles al contexto juridico.
- Transcripcion de audio a texto estructurado, disenada para preservar hechos relevantes y minimizar alucinaciones.
- Sugerencia de etiquetas de delito a partir de una taxonomia controlada (p. ej. "tocamientos no deseados", "intento de violacion", "acoso verbal", "amenazas/coercion").
- Proporcion de informacion psicosocial y de derechos no diagnostica, con enfoque en consentimiento, agencia y no culpabilizacion.
- Soporte multimodal: el modelo base acepta entradas de texto, imagen y audio, aunque las capacidades especificas de vision no se detallan en la model card.
- Funcionamiento offline en dispositivos moviles, sin dependencia de servicios en la nube.

## Casos de uso

- Asistencia inmediata tras un incidente: el modelo puede responder a preguntas como "donde debo denunciar si fui agredida sexualmente en un matatu?" con pasos en lenguaje sencillo, incluyendo seguridad inmediata, atencion medica (PEP, anticoncepcion de emergencia, documentacion de lesiones) y opciones de denuncia (policia, lineas de ayuda, organizaciones de confianza).
- Transcripcion de narraciones de supervivientes: una persona graba un audio de 30 a 120 segundos describiendo un incidente; el modelo transcribe el audio a texto estructurado que puede adjuntarse a expedientes o formularios, sujeto a revision humana.
- Triage de casos para trabajadores sociales: a partir de una descripcion textual o transcrita, el modelo sugiere un conjunto reducido de etiquetas de delito para apoyar la clasificacion y derivacion de casos, sin reemplazar el juicio profesional.
- Informacion psicosocial para supervivientes: el modelo ofrece informacion no diagnostica sobre derechos, que esperar en centros de salud o comisarias, y como apoyar a una amiga que ha sufrido una agresion.
- Formacion de personal de primera linea: puede usarse como herramienta de simulacion para que consejeros y voluntarios practiquen respuestas a situaciones de violencia de genero, siempre con supervisio humana.
- Documentacion de incidentes en contextos de bajos recursos: al funcionar offline, el modelo permite registrar y estructurar narraciones en zonas sin conectividad, facilitando la recopilacion de evidencia para organizaciones de ayuda.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de evaluacion (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con otros modelos. Tampoco se proporcionan datos de rendimiento especificos para las tareas de transcripcion o etiquetado.

## Requisitos de hardware

- No se especifican requisitos de VRAM ni de GPU en la informacion disponible.
- El modelo base Gemma 3n de 4B esta disenado para ejecutarse en dispositivos moviles y portatiles, por lo que se espera que sea compatible con GPUs de consumo como RTX 3060 o superiores, aunque no hay confirmacion oficial para este ajuste.
- El repositorio solo contiene 0.1 GB, lo que sugiere que se distribuyen los adaptadores LoRA, no los pesos completos. Para usarlo, se necesitaria cargar el modelo base `google/gemma-3n-E4B-it` y aplicar los adaptadores.
- Opciones de despliegue: dado el tag `text-generation-inference`, es probable que sea compatible con TGI, vLLM u otros frameworks de inferencia, pero no se indica explicitamente. Para despliegue en movil, se usaria LiteRT (antes TensorFlow Lite) u otras herramientas de optimizacion para edge.
- No hay datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables directamente. El modelo se enmarca en la categoria de asistentes especializados en violencia de genero, pero no se conocen alternativas publicas con caracteristicas equivalentes. Como referencia, el modelo base Gemma 3n de 4B puede compararse con otros modelos pequenos multimodales como Phi-3.5-vision o Qwen2-VL, pero el ajuste especifico para GBV no tiene equivalentes documentados en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo esta disenado para un dominio muy especifico y no debe usarse como chatbot generalista; su rendimiento fuera de los casos de uso previstos puede ser impredecible.
- No debe reemplazar a profesionales de la salud, abogados, policias o consejeros. Las respuestas no constituyen opinion legal, diagnostico medico ni asesoramiento profesional.
- Riesgo de alucinacion en la transcripcion de audio: aunque se diseno para minimizarla, no se garantiza una fidelidad absoluta; las transcripciones deben revisarse por humanos antes de usarse como evidencia.
- Sesgos potenciales: al estar entrenado principalmente en ingles y en contextos juridicos especificos, puede no ser adecuado para otros idiomas o sistemas legales.
- El modelo esta superado: la model card indica que el repositorio es historico y que la aplicacion actual de SafeRide usa otro modelo (Gemma 4 E2B). No debe usarse como referencia de produccion.
- La licencia Apache-2.0 permite uso comercial, pero el modelo no tiene validacion clinica, legal ni de emergencia; no debe interpretarse como aprobacion de UNICEF ni de ninguna autoridad sanitaria.
- No se proporcionan datos sobre sesgos especificos de genero, raza o cultura, aunque el contexto de violencia de genero requiere especial cautela en la redaccion de respuestas para evitar culpabilizacion o revictimizacion.

## Enlaces

- Repositorio del modelo: https://huggingface.co/esherialabs/saferide-gemma-3n
- Modelo base: https://huggingface.co/google/gemma-3n-E4B-it
- Documentacion de Gemma 3n (Google AI for Developers): https://ai.google.dev/gemma/docs/gemma-3n
- Pagina de Gemma 3n en DeepMind: https://deepmind.google/models/gemma/gemma-3n/
- Sitio web de SafeRide: https://saferide.esheria.org/
- Repositorio open source de SafeRide: https://github.com/esherialabs/saferide
- Modelo actual de SafeRide (Gemma 4 E2B): https://huggingface.co/esherialabs/saferide-gemma-4-e2b-v058-original-419806-litertlm

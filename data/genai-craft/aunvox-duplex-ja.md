# genai-craft/aunvox-duplex-ja

## Resumen

El modelo `genai-craft/aunvox-duplex-ja` es un sistema de diálogo por voz en japonés con capacidad full-duplex, desarrollado por el usuario `genai-craft` sobre la base `HIT-TMG/Lychee-FD`. Se trata de un modelo de 12.812.043.520 parámetros (aproximadamente 12,8 mil millones) orientado a conversaciones bidireccionales en tiempo real, donde la entrada y salida de audio pueden procesarse simultáneamente, sin necesidad de turnos estrictos. Su etiquetado como `step_audio_2_full_duplex` sugiere una arquitectura similar a la familia Step Audio 2, aunque no se dispone de documentación técnica oficial que confirme este punto.

El modelo está pensado para aplicaciones de voz interactiva en japonés, como asistentes conversacionales o sistemas de atención telefónica automatizada. Su licencia es `aunvox-model-license-1.0`, una licencia propia que no es de código abierto estándar y que restringe el uso comercial sin autorización. El acceso es restringido (gated) en HuggingFace, por lo que los usuarios deben aceptar condiciones adicionales antes de descargarlo. La relevancia actual radica en la creciente demanda de modelos de voz con baja latencia y capacidad de interrupción natural, aunque la falta de métricas públicas y de documentación limita su evaluación objetiva.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se infiere transformer de audio, sin confirmar) |
| Parametros totales | 12.812.043.520 (12,8 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (bitsandbytes) mencionado en tags; sin detalle de otras cuantizaciones |
| Idiomas soportados | ja (japones) |
| Licencia | aunvox-model-license-1.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se ha publicado información detallada sobre la arquitectura interna del modelo. Los tags indican `step_audio_2_full_duplex` y `full-duplex`, lo que sugiere un diseño orientado a procesamiento de audio bidireccional, probablemente basado en una arquitectura transformer con codificación de audio y decodificación de texto o voz. El modelo base `HIT-TMG/Lychee-FD` es un modelo de diálogo full-duplex, pero no se dispone de documentación pública sobre su estructura interna ni sobre los datos de entrenamiento utilizados. Tampoco hay información sobre el número de tokens de entrenamiento, composición del dataset, ni sobre técnicas de alineación como RLHF o DPO. La presencia de `custom_code` en los tags sugiere que el modelo requiere código personalizado para su carga e inferencia, lo que añade una capa de complejidad técnica.

## Capacidades

- Diálogo por voz en japonés con soporte full-duplex, permitiendo interrupciones y solapamiento de habla.
- Procesamiento de audio de entrada y generación de respuesta de voz en tiempo real (según la etiqueta `speech` y `dialogue`).
- Posible integración con sistemas de agentes conversacionales, aunque no se especifican capacidades de tool calling o razonamiento multi-paso.
- No se mencionan capacidades de visión, texto o código; el modelo parece estar especializado exclusivamente en audio y diálogo.
- El idioma soportado es únicamente japonés; no hay indicios de soporte multilingüe.

## Casos de uso

- Atención al cliente telefónica automatizada en japonés: el modelo puede gestionar conversaciones de voz con clientes, permitiendo interrupciones naturales y respuestas inmediatas gracias a su diseño full-duplex.
- Asistentes de voz personales en dispositivos domésticos: integrado en altavoces inteligentes o aplicaciones móviles, puede mantener conversaciones fluidas sin necesidad de pulsar botones para hablar.
- Sistemas de transcripción y respuesta simultánea: útil en entornos donde se requiere escuchar y responder a la vez, como traducción telefónica o soporte en vivo.
- Prototipos de investigación en interacción humano-máquina: permite estudiar patrones de conversación con solapamiento de habla en japonés.
- Juegos de rol por voz o experiencias interactivas: puede servir como personaje no jugador (NPC) con voz en tiempo real en aplicaciones de entretenimiento.
- Herramientas de accesibilidad para personas con dificultades de escritura: permite interactuar mediante voz en japonés sin necesidad de teclado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre métricas como MMLU, HumanEval, GSM8K ni evaluaciones específicas de calidad de voz o latencia. Tampoco se comparan con otros modelos de diálogo full-duplex.

## Requisitos de hardware

- VRAM estimada: con 12,8 B parámetros, en cuantización 4-bit (bitsandbytes) se estima un consumo de aproximadamente 6,4 GB de VRAM, más overhead de activaciones y buffers; en FP16 requeriría unos 25,6 GB. No hay cifras oficiales.
- GPU recomendadas: para cuantización 4-bit, una GPU con al menos 8 GB de VRAM (p. ej., RTX 3060, RTX 4060) podría ser suficiente para inferencia básica; para FP16 se necesitaría una GPU de 32 GB o más (A100, H100, RTX 6000 Ada).
- En consumer GPU: es posible ejecutar la versión 4-bit en GPUs de gama media-alta (RTX 3080, RTX 4070) con al menos 10 GB de VRAM, aunque la latencia dependerá del optimizador utilizado.
- Opciones de despliegue: no se mencionan soporte para vLLM, llama.cpp, Ollama o TGI. Dado el tag `custom_code`, es probable que requiera un pipeline personalizado, posiblemente basado en la librería de StepFun o en código propio del autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas concretas. El modelo base `HIT-TMG/Lychee-FD` podría ser un punto de referencia, pero no hay datos públicos sobre su rendimiento. Otros modelos de diálogo full-duplex como Step Audio 2 de StepFun podrían ser comparables, pero no se han encontrado métricas oficiales. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Acceso restringido: el modelo requiere aceptar condiciones en HuggingFace; no es de descarga directa.
- Licencia restrictiva: `aunvox-model-license-1.0` no es una licencia open source; limita el uso comercial y puede imponer restricciones de redistribución.
- Idioma limitado: solo soporta japonés; no sirve para otros idiomas.
- Falta de documentación: no hay papers, informes técnicos ni guías de uso oficiales, lo que dificulta la integración y el mantenimiento.
- Riesgo de alucinación y errores de comprensión: al ser un modelo de voz, puede generar respuestas incorrectas o incoherentes en diálogos complejos; no se han publicado evaluaciones de robustez.
- Posible dependencia de código personalizado: el tag `custom_code` indica que la carga del modelo requiere scripts específicos, lo que aumenta la complejidad de despliegue y reduce la portabilidad.
- Sin garantías de producción: al no haber benchmarks ni pruebas de estrés, no se recomienda su uso en entornos críticos sin validación previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/genai-craft/aunvox-duplex-ja
- Modelo base (HIT-TMG/Lychee-FD): https://huggingface.co/HIT-TMG/Lychee-FD (enlace inferido del ID; no se ha verificado su existencia)
- Repositorio genai-craft en GitHub (sin relación directa confirmada): https://github.com/arkashira/genai-craft

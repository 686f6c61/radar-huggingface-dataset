# bartowski/p-e-w_Oc-e-Non-v1-GGUF

## Resumen

Oc-e-Non-v1 es un modelo de lenguaje de tipo transformer con 4.022.468.096 parámetros (aproximadamente 4B), desarrollado por p-e-w y distribuido en formato GGUF por bartowski. Se trata de un modelo derivado de la familia Qwen3-4B-Instruct-2507, según se desprende del enlace de licencia incluido en la model card, y está etiquetado por el autor con los descriptores "heretic" y "terse", lo que sugiere una orientación hacia respuestas concisas y un ajuste que reduce comportamientos de rechazo excesivos.

La relevancia de esta ficha radica en que bartowski, ingeniero de aprendizaje automático con experiencia en arcee.ai, RedHat y como curador de modelos para LM Studio, ha publicado un conjunto completo de cuantizaciones GGUF con imatrix, lo que permite ejecutar el modelo en hardware de consumo. El repositorio ocupa 61,5 GB e incluye desde pesos BF16 completos (8,05 GB) hasta cuantizaciones agresivas de 3 bits.

No se dispone de información sobre el proceso de entrenamiento, la composición del dataset ni la longitud de contexto del modelo original en la información proporcionada. El modelo está pensado para generación de texto conversacional y soporta un formato de prompt basado en ChatML con definiciones de herramientas en XML, lo que habilita el uso de function calling.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3-4B-Instruct-2507; detalles no disponibles) |
| Parametros totales | 4.022.468.096 (aproximadamente 4B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | bf16, Q8_0, Q6_K_L, Q6_K, Q6_K_S, Q5_K_M, Q5_K_S, Q4_K_L, Q4_1, Q4_K_M, IQ4_NL, Q4_K_S, Q4_0, IQ4_XS, IQ3_M, Q3_K_L, Q3_K_M, IQ3_XS (y otras variantes de 3 bits) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones generadas con llama.cpp b12180) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo original p-e-w/Oc-e-Non-v1. Por el enlace de licencia incluido en la model card (Qwen/Qwen3-4B-Instruct-2507), se puede inferir que se trata de un transformer derivado de la familia Qwen3, con aproximadamente 4B de parámetros. Las etiquetas "heretic" y "terse" sugieren que el autor aplicó algún tipo de ajuste fino orientado a reducir rechazos y a producir respuestas más directas y concisas, pero no se especifican los datos de entrenamiento, el número de tokens utilizados, la composición del dataset ni si hubo fases de RLHF o DPO.

Las cuantizaciones de bartowski se generaron con llama.cpp release b12180 e incorporan una matriz de importancia (imatrix), lo que mejora la calidad de las cuantizaciones de baja precisión al ponderar los pesos según su relevancia para la perplejidad. El modelo no emplea decodificación especulativa según la model card. El formato de prompt es ChatML (`<|im_start|>` / `<|im_end|>`) y admite definiciones de herramientas en etiquetas XML `<tools>` con llamadas en `<tool_call>`, lo que indica soporte de function calling.

## Capacidades

- Generación de texto conversacional multi-turno con formato ChatML.
- Soporte de tool calling / function calling mediante definiciones JSON en etiquetas `<tools>` y respuestas en `<tool_call>`.
- Respuestas concisas y directas (etiqueta "terse" del autor).
- Comportamiento con menor tasa de rechazos (etiqueta "heretic" del autor).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Razonamiento multi-paso y agentes: no confirmado explícitamente, aunque el soporte de tool calling lo habilita parcialmente.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Asistentes conversacionales ligeros: el modelo puede gestionar diálogos multi-turno con el formato ChatML y ejecutarse en hardware de consumo gracias a cuantizaciones de 2,3-2,6 GB (IQ4_XS, Q4_K_M), lo que lo hace adecuado para aplicaciones de escritorio o embebidas.
- Automatización de llamadas a APIs: el soporte de function calling con definiciones JSON permite integrarlo en flujos donde el modelo decide qué herramienta invocar y con qué argumentos, por ejemplo para consultar precios de acciones o servicios externos.
- Generación de respuestas concisas en interfaces de chat: el ajuste "terse" lo orienta a entornos donde se prioriza brevedad, como asistentes de terminal o bots de soporte con respuestas directas.
- Prototipado rápido en local: con la cuantización Q4_K_M (2,59 GB) se puede desplegar en portátiles con GPU modesta o incluso en CPU mediante llama.cpp u Ollama, ideal para pruebas de concepto.
- Filtrado y reescritura de texto: al ser un modelo de 4B con licencia Apache 2.0, puede usarse para tareas de transformación de texto en pipelines de datos sin restricciones comerciales.
- Investigación sobre alineación y rechazos: las etiquetas "heretic" lo convierten en un objeto de estudio para analizar cómo el ajuste fino modifica las tasas de rechazo en modelos pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,3-2,6 GB para cuantizaciones de 4 bits (IQ4_XS, Q4_K_M), 2,9-3,1 GB para 5 bits (Q5_K_S, Q5_K_M), 3,4-3,7 GB para 6 bits (Q6_K_S, Q6_K, Q6_K_L), 4,28 GB para Q8_0 y 8,05 GB para BF16.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones de 4 bits; RTX 3060, RTX 4060, RTX 4090, A100 o H100 para BF16.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas modernas con 4 GB o más de VRAM; las cuantizaciones de 4 bits caben incluso en iGPU con memoria unificada.
- Opciones de despliegue: llama.cpp (versión b12180 o superior), Ollama, LM Studio (bartowski es curador oficial), y cualquier runtime compatible con GGUF. vLLM y TGI requerirían los pesos originales en safetensors, no incluidos en este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| p-e-w/Oc-e-Non-v1 (este, vía bartowski) | ~4B | No disponible | Apache 2.0 | GGUF | Ajuste "heretic" y "terse" |
| Qwen3-4B-Instruct-2507 | ~4B | No disponible en esta ficha | Apache 2.0 | Safetensors | Modelo base inferido del enlace de licencia |
| Alternativas de 4B | No disponible | No disponible | No disponible | No disponible | No se dispone de datos de benchmarks para comparar |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos conocidos del modelo.
- Riesgo de alucinación inherente a modelos de 4B; no se han publicado evaluaciones al respecto.
- El ajuste "heretic" puede implicar una reducción de los mecanismos de rechazo, lo que aumenta el riesgo de generar contenido inapropiado o inseguro en producción.
- Longitud de contexto e idiomas soportados no disponibles; no se debe asumir un contexto largo sin verificación.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar los términos del modelo base Qwen3-4B-Instruct-2507.
- El repositorio GGUF no incluye pesos en safetensors, por lo que no es directamente compatible con vLLM o TGI sin conversión.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, lo que indica ausencia de validación comunitaria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/bartowski/p-e-w_Oc-e-Non-v1-GGUF
- Modelo original: https://huggingface.co/p-e-w/Oc-e-Non-v1
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507/blob/main/LICENSE
- llama.cpp release b12180: https://github.com/ggml-org/llama.cpp/releases/tag/b12180
- Cuantización recomendada Q4_K_M: https://huggingface.co/bartowski/p-e-w_Oc-e-Non-v1-GGUF/blob/main/p-e-w_Oc-e-Non-v1-Q4_K_M.gguf
- Perfil de bartowski: https://huggingface.co/bartowski

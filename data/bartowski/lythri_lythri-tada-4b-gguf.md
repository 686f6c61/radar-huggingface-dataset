# bartowski/Lythri_Lythri-Tada-4B-GGUF

## Resumen

Lythri-Tada-4B es un modelo de lenguaje de aproximadamente 4.630 millones de parámetros (según los pesos en safetensors del checkpoint base) desarrollado por Lythri, orientado explícitamente a soporte emocional, compañía conversacional y despliegue en dispositivo (on-device). El repositorio que nos ocupa es la colección de cuantizaciones GGUF producida por bartowski a partir del checkpoint original, generada con llama.cpp (release b12074) e incluyendo calibración imatrix. Está publicado bajo licencia Apache 2.0.

El modelo se presenta como un modelo de generación de texto con soporte de tool calling, con un formato de prompt propio basado en turnos (`<|turn>system`, `<|turn>user`, `<|turn>model`) y con una sintaxis específica para declarar herramientas (`<|tool>declaration:...<tool|>`). Esta orientación a conversación con definición de funciones sugiere un uso previsto de asistentes personales y agentes ligeros que combinan diálogo empático con invocación de herramientas.

La relevancia de esta ficha radica en que el paquete GGUF permite ejecutar el modelo en hardware de consumo (desde unos 2,5 GB en cuantizaciones de 3 bits hasta 9,27 GB en BF16), lo que lo hace candidato para aplicaciones de acompañamiento y asistencia local con requisitos de privacidad. No obstante, la información pública disponible sobre arquitectura, entrenamiento, contexto e idiomas es muy limitada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (transformer, presumiblemente; no confirmado en la información) |
| Parámetros totales | 4.628.569.635 (safetensors); la model card del cuantizador indica "5B (source checkpoint)" |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | bf16, Q8_0, Q6_K_L, Q6_K, Q6_K_S, Q5_K_M, Q5_K_S, Q4_1, Q4_0, Q4_K_L, Q4_K_M, IQ4_NL, Q4_K_S, IQ4_XS, IQ3_M, Q3_K_L, Q3_K_M, IQ3_XS, Q3_K_S (lista parcial; el repo continúa) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); el checkpoint original en safetensors no se detalla en esta información |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base Lythri-Tada-4B en los datos proporcionados: no se especifica si es un transformer denso, un MoE o un modelo híbrido, ni se detallan innovaciones como atención lineal o decodificación especulativa. La model card del cuantizador indica explícitamente "Speculative decoding: no", lo que descarta esa técnica en el paquete GGUF, pero no aporta más detalles estructurales.

Tampoco hay datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF, DPO o ajuste por preferencias. La única información técnica relevante del proceso de cuantización es el uso de llama.cpp release b12074 y de calibración imatrix, que ajusta los pesos de cuantización según estadísticas de activaciones para preservar mejor la calidad en bits bajos. El formato de prompt por turnos y la sintaxis de declaración de herramientas son los únicos elementos de diseño de interacción documentados.

## Capacidades

- Generación de texto conversacional multi-turno, con un formato de prompt explícito por turnos de sistema, usuario y modelo.
- Soporte de tool calling / function calling mediante la sintaxis `<|tool>declaration:...<tool|>` dentro del turno de sistema, con descripción y parámetros tipados (por ejemplo, tipo STRING u OBJECT).
- Orientación declarada a soporte emocional y compañía conversacional (tags `emotional-support`, `companion`, `emotion`).
- Despliegue on-device (tag `on-device`) gracias a las cuantizaciones GGUF de pequeño tamaño.
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que sugiere integración con servicios de inferencia estándar.
- Capacidades multilingües: no disponibles (no se documentan idiomas).
- No se documentan capacidades de visión, audio, razonamiento extendido (thinking mode) ni matemáticas avanzadas.

## Casos de uso

- Asistente de acompañamiento emocional local: el modelo puede mantener conversaciones multi-turno con un tono empático en aplicaciones de escritorio o móvil, ejecutándose con cuantización Q4_K_M (3,17 GB) en hardware de consumo y sin enviar datos a la nube.
- Chatbot de soporte en dispositivos con recursos limitados: con IQ3_XS (2,48 GB) o Q3_K_S puede desplegarse en equipos con poca RAM, ofreciendo respuestas conversacionales básicas en entornos con restricciones de memoria.
- Asistente personal con invocación de herramientas: gracias a la sintaxis de declaración de funciones, puede integrarse en un agente que consulte precios de acciones, datos meteorológicos u otras APIs declaradas en el turno de sistema.
- Prototipado rápido de aplicaciones conversacionales: el paquete GGUF permite cargar el modelo en llama.cpp u Ollama para validar flujos de diálogo y formatos de prompt antes de invertir en infraestructura mayor.
- Aplicaciones de privacidad por diseño: al ejecutarse íntegramente en el dispositivo, es adecuado para diarios personales, reflexión guiada o asistencia en salud emocional donde la confidencialidad es crítica.
- Integración en pipelines de agentes ligeros: la combinación de conversación y tool calling permite construir asistentes de múltiples pasos con herramientas externas, siempre que el contexto requerido no supere la ventana del modelo (no documentada).
- Evaluación comparativa de cuantizaciones: el repositorio ofrece una matriz amplia de cuantizaciones (de BF16 a Q3_K_S) útil para medir el equilibrio calidad/tamaño en hardware concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia según cuantización: BF16 9,27 GB; Q8_0 4,95 GB; Q6_K 3,94 GB; Q5_K_M 3,73 GB; Q4_K_M 3,17 GB; IQ4_XS 3,02 GB; Q3_K_M 2,54 GB; IQ3_XS 2,48 GB. Añadir margen para el contexto y el runtime (típicamente 1-2 GB adicionales).
- GPU recomendadas: no hay requisitos oficiales publicados. Por tamaño, cualquier GPU con 6-8 GB de VRAM puede ejecutar cuantizaciones Q4-Q5; con 4 GB se puede optar a Q3; con 10-12 GB se puede usar Q8_0 o BF16.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 (12 GB), RTX 4060 Ti (8/16 GB), RTX 4070/4080/4090 y GPUs con 4-8 GB en cuantizaciones bajas. También en Apple Silicon con memoria unificada.
- Opciones de despliegue: llama.cpp (versión b12074 o posterior, usada para la cuantización), Ollama, y cualquier runtime compatible con GGUF; el tag `endpoints_compatible` sugiere compatibilidad con servidores de inferencia estándar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Lythri-Tada-4B (este) | ~4,63 B | no disponible | Apache 2.0 | GGUF (varias cuantizaciones) | Orientado a soporte emocional y on-device; tool calling documentado |
| Alternativas de ~4B | no disponible | no disponible | no disponible | no disponible | No se dispone de información sobre modelos comparables en la documentación proporcionada |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada para establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- La información pública sobre arquitectura, contexto e idiomas es prácticamente inexistente; no es posible garantizar un comportamiento en producción sin evaluación propia.
- Riesgo de alucinación inherente a los modelos de lenguaje de este tamaño; especialmente crítico en un modelo orientado a soporte emocional, donde las respuestas incorrectas pueden afectar al usuario.
- No se documentan sesgos conocidos, pero al no conocer la composición del dataset de entrenamiento no puede descartarse sesgo lingüístico, cultural o de género.
- La orientación a "emotional-support" y "companion" no implica validación clínica ni psicológica; no debe presentarse como herramienta terapéutica.
- No se especifica la longitud de contexto, lo que impide planificar conversaciones largas o documentos extensos con garantías.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni asume responsabilidad sobre el uso; conviene revisar la model card del modelo base para condiciones adicionales.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.
- El tamaño del repo (75,5 GB) incluye todas las cuantizaciones; descargar solo el archivo necesario.

## Enlaces

- Repositorio GGUF: https://huggingface.co/bartowski/Lythri_Lythri-Tada-4B-GGUF
- Modelo base: https://huggingface.co/Lythri/Lythri-Tada-4B
- llama.cpp (release usada): https://github.com/ggml-org/llama.cpp/releases/tag/b12074
- Referencia DOI citada en los tags: doi:10.5281/zenodo.23179311
- Cuantización recomendada Q4_K_M: https://huggingface.co/bartowski/Lythri_Lythri-Tada-4B-GGUF/blob/main/Lythri_Lythri-Tada-4B-Q4_K_M.gguf

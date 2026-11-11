# OpenIntelligenceNet/Phi-4-mini-instruct-Abliterated-GGUF

## Resumen

Phi-4-mini-instruct-Abliterated-GGUF es una distribución de pesos cuantizados en formato GGUF del modelo OpenIntelligenceNet/Phi-4-mini-instruct-Abliterated, que a su vez es una variante "abliterated" (con el comportamiento de rechazo reducido mediante manipulación de direcciones de activación) del microsoft/Phi-4-mini-instruct. El modelo base pertenece a la familia Phi-4 de Microsoft, orientada a modelos compactos con capacidades de razonamiento, matemáticas y código en un tamaño reducido apto para despliegue local. La licencia declarada es MIT.

Esta publicación concreta no aporta pesos nuevos ni entrenamiento adicional: es un trabajo de cuantización realizado con llama.cpp empleando una matriz de importancia (imatrix.dat, incluida en el repositorio), que ofrece cinco niveles de cuantización (Q3_K_M, Q4_K_M, Q5_K_M, Q6_K y Q8_0). Su relevancia radica en permitir ejecutar el modelo abliterated en hardware de consumo mediante llama.cpp, a costa de sacrificar los mecanismos de seguridad del modelo original.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, tamaño de 0.0 GB declarado y fue creado el 11 de noviembre de 2026. No se han publicado resultados de benchmarks ni evaluaciones formales de seguridad en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: microsoft/Phi-4-mini-instruct; arquitectura exacta no especificada en la información proporcionada) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q3_K_M, Q4_K_M, Q5_K_M, Q6_K, Q8_0 (GGUF con imatrix) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base en la documentación proporcionada; se sabe que deriva de microsoft/Phi-4-mini-instruct, pero no se detallan capas, tipo de atención, número de parámetros ni longitud de contexto. Tampoco se especifican los datos de entrenamiento originales (número de tokens, composición del corpus, uso de RLHF/DPO).

El proceso documentado en esta publicación es exclusivamente de cuantización: los pesos del modelo abliterated se convirtieron a GGUF con llama.cpp usando una matriz de importancia (imatrix.dat) para mejorar la calidad de los cuantizados de baja precisión. El autor no describe el procedimiento de abliteration aplicado al modelo original, más allá de indicar que reduce el comportamiento de rechazo.

## Capacidades

- Generación de texto conversacional en inglés, heredada de Phi-4-mini-instruct.
- Comportamiento de rechazo reducido (abliterated), lo que permite respuestas a peticiones que el modelo original declinaría.
- Ejecución local mediante llama.cpp, incluido modo conversacional (`-cnv`).
- Cuantizaciones con distintos compromisos de tamaño/calidad, desde Q3_K_M hasta Q8_0.
- Soporte de tool calling, agentes, razonamiento matemático o código: no confirmado en la información proporcionada (el modelo base Phi-4-mini-instruct los soporta según su familia, pero esta ficha no dispone de datos verificados al respecto).
- Capacidades multilingües: limitadas a inglés según la etiqueta de idioma declarada.

## Casos de uso

- Prototipado local de asistentes conversacionales: el cuantizado Q4_K_M permite ejecutar el modelo en un portátil con llama.cpp y mantener diálogos multi-turno sin conexión a servicios en la nube.
- Investigación sobre alineación y seguridad: comparar las respuestas del modelo abliterated frente al Phi-4-mini-instruct original permite estudiar cómo la manipulación de direcciones de activación afecta a la tasa de rechazos.
- Generación de texto creativo sin filtros: para experimentación con narrativa, guiones o contenido que el modelo original podría rechazar, siempre dentro de un marco legal y ético.
- Evaluación de cuantizaciones: los cinco niveles GGUF permiten medir la degradación de calidad frente al tamaño de archivo en un mismo modelo, útil para calibrar pipelines de despliegue.
- Despliegue en entornos con recursos limitados: Q3_K_M y Q4_K_M reducen el peso del modelo para hardware modesto, integrándose en aplicaciones de escritorio vía llama.cpp.
- Pruebas de robustez y red teaming: al carecer de evaluación formal de seguridad, sirve como sujeto de pruebas para medir la eficacia de filtros externos en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con cifras concretas; depende del tamaño real de los parámetros del modelo base, que no se especifica. Como referencia cualitativa, Q3_K_M es el archivo más pequeño y Q8_0 el de mayor peso.
- GPU recomendadas: no disponible en la documentación.
- Compatibilidad con GPU de consumo: probable mediante llama.cpp con los cuantizados bajos (Q3_K_M, Q4_K_M), pero sin cifras verificadas en la información proporcionada.
- Opciones de despliegue: llama.cpp (formato nativo GGUF; el ejemplo de uso emplea `llama-cli`). Otros runners compatibles con GGUF (Ollama, LM Studio) no se mencionan explícitamente en la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| OpenIntelligenceNet/Phi-4-mini-instruct-Abliterated-GGUF | no disponible | no disponible | GGUF (5 cuantizaciones) | MIT | Variante abliterated cuantizada; sin benchmarks |
| OpenIntelligenceNet/Phi-4-mini-instruct-Abliterated | no disponible | no disponible | no disponible | MIT (según modelo derivado) | Versión sin cuantizar del mismo modelo |
| microsoft/Phi-4-mini-instruct | no disponible en esta ficha | no disponible en esta ficha | safetensors (formato original de la familia) | MIT | Modelo original con alineación de seguridad intacta |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- El modelo ha sido abliterated: presenta un comportamiento de rechazo reducido y puede generar contenido dañino, inexacto u ofensivo.
- No ha pasado evaluaciones formales de seguridad ni de benchmarks según el autor.
- Riesgo elevado de alucinación y de respuestas no verificadas, sin métricas publicadas que lo acoten.
- Soporte exclusivo de inglés según la etiqueta de idioma; el rendimiento en castellano no está garantizado.
- Longitud de contexto no documentada en esta ficha; no asumir ventanas largas sin verificar el modelo base.
- Licencia MIT permite uso comercial, pero el usuario es responsable del cumplimiento legal y de no emplear el modelo para violencia, armas, fraude o daño a terceros.
- Repositorio sin descargas ni validación comunitaria: no hay evidencia externa de calidad de los cuantizados.
- El tamaño del repositorio declarado (0.0 GB) resulta inconsistente con la presencia de cinco archivos GGUF e imatrix.dat, lo que conviene verificar antes de la descarga.

## Enlaces

- Hugging Face: https://huggingface.co/OpenIntelligenceNet/Phi-4-mini-instruct-Abliterated-GGUF
- Modelo base abliterated: https://huggingface.co/OpenIntelligenceNet/Phi-4-mini-instruct-Abliterated
- Modelo original de Microsoft: https://huggingface.co/microsoft/Phi-4-mini-instruct

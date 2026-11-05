# CompressedGemma/Qwen-3.8-27B-Thinkingcap-Q2_Q3

## Resumen

Qwen-3.8-27B-Thinkingcap-Q2_Q3 es una cuantización GGUF publicada por el usuario CompressedGemma a partir de un modelo base denominado Qwen-3.8-27B-Thinkingcap. El repositorio contiene pesos en formato GGUF con cuantizaciones de 2 y 3 bits (Q2/Q3), pensados para reducir el requisito de VRAM hasta el punto de que el modelo pueda ejecutarse en tarjetas gráficas de 12 GB, según indica el propio autor en la model card.

La información disponible es muy limitada: el repositorio no incluye pipeline declarado, no especifica idiomas soportados y no aporta datos sobre arquitectura, número de parámetros, longitud de contexto nativa ni proceso de entrenamiento. La model card se limita a mostrar un ejemplo de uso con `llama-server` (prompt sobre una página HTML5 con un teseracto rotatorio y proyección 4D) y los parámetros de inferencia empleados, además de una captura del resultado.

Por tanto, esta ficha debe interpretarse como una descripción del artefacto de cuantización y de su configuración de despliegue, no como una evaluación del modelo base. Cualquier dato sobre capacidades, entrenamiento o rendimiento del modelo original queda fuera del alcance de la información proporcionada y se marca como no disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere familia Qwen, sin confirmar) |
| Parámetros totales | no disponible (el nombre incluye "27B", sin confirmar) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible a nivel de modelo; el autor ejecuta con `-c 30000` |
| Tipos de cuantización | Q2 y Q3 (GGUF); caché KV en `q5_0` según la model card |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`Qwen-3.8-27B-thinkingcap-Q2-Q3.gguf`) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base: la model card no describe si se trata de un transformer denso, un modelo MoE, un híbrido o cualquier otra variante. Tampoco se documenta el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF, DPO u otro ajuste por preferencias.

El único detalle técnico verificable es el proceso de cuantización: el autor publica pesos GGUF en precisiones de 2 y 3 bits, lo que implica una compresión agresiva respecto a los pesos originales (presumiblemente en BF16/FP16). La model card indica que, con cuantización de caché KV en `q5_0` y una ventana de 30 000 tokens, el modelo cabe en una GPU de 12 GB. No se documenta qué herramienta de cuantización se empleó (llama.cpp, imatrix u otra) ni si se aplicaron calibraciones específicas por capa.

## Capacidades

- Generación de texto y código: el único ejemplo publicado muestra la generación de una página HTML5 con un teseracto rotatorio y una matriz de proyección 4D, lo que evidencia capacidad para producir código front-end funcional.
- Razonamiento con "thinking": el nombre del modelo incluye "Thinkingcap", lo que sugiere un modo de razonamiento extendido, aunque no se documenta su funcionamiento ni su formato de activación.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; el repositorio no declara idiomas.
- Capacidades especiales (visión, audio, etc.): no disponible.

## Casos de uso

- Prototipado de interfaces web en local: el ejemplo de la model card (generación de una página HTML5 con animación 3D/4D) ilustra el uso para generar código front-end directamente en una estación de trabajo con GPU de 12 GB.
- Asistencia de código en equipos con hardware limitado: al caber en tarjetas consumer, permite desplegar un asistente de programación local sin depender de APIs externas.
- Experimentación con cuantizaciones agresivas: útil para investigadores que quieran medir la degradación de calidad de Q2/Q3 frente a precisiones mayores sobre el mismo modelo base.
- Despliegue en entornos aislados o sin conectividad: el formato GGUF y `llama-server` permiten ejecutar el modelo en máquinas on-premise sin acceso a internet.
- Generación de documentación técnica y snippets: el modelo puede emplearse para producir ejemplos de código y explicaciones en flujos de trabajo de desarrollo.
- Evaluación comparativa de servidores de inferencia: la configuración publicada (`llama-server` con `--jinja`, `--cache-type-k q5_0`, `--cache-type-v q5_0`) sirve como referencia reproducible para comparar latencia y calidad en GPUs de 12 GB.
- Base para fine-tuning o destilación: al estar en Apache 2.0, los pesos pueden reutilizarse como punto de partida, aunque la cuantización Q2/Q3 no es el formato idóneo para reentrenar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente incluye una captura del resultado del prompt de ejemplo y los parámetros de inferencia, sin métricas de MMLU, HumanEval, GSM8K ni similares.

## Requisitos de hardware

- VRAM estimada: el autor afirma que el modelo cabe en una GPU de 12 GB con contexto de 30 000 tokens y caché KV en `q5_0`.
- GPU recomendadas: no se especifican modelos concretos; por el requisito de 12 GB encajan tarjetas como RTX 3060 de 12 GB, RTX 4070 Ti, RTX 4080 o superiores, así como A100/H100 si se busca mayor throughput.
- ¿Cabe en GPU consumer? Sí, según la model card, en tarjetas de 12 GB o más con la configuración indicada.
- Opciones de despliegue: `llama-server` (llama.cpp) con los parámetros documentados: `-ngl 999`, `-c 30000`, `--cache-type-k q5_0`, `--cache-type-v q5_0`, `--jinja`, `--temp 0.8`, `--top-p 0.9`, `--min-p 0.05`, `--top-k 40`. No se documenta compatibilidad con vLLM, TGI u Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no identifica el modelo base con certeza ni ofrece datos de rendimiento que permitan una comparación rigurosa con alternativas de la misma categoría.

## Limitaciones y advertencias

- La cuantización Q2/Q3 es agresiva y puede degradar de forma notable la coherencia, el razonamiento y la calidad del código frente a los pesos originales; no se aportan evaluaciones que cuantifiquen esa pérdida.
- No se documenta el modelo base, por lo que no es posible verificar la procedencia de los pesos ni la cadena de licencias más allá de la declaración Apache 2.0 del repositorio.
- El repositorio no declara idiomas soportados; el rendimiento en castellano es desconocido.
- No hay información sobre sesgos, alineación o filtros de seguridad del modelo original.
- Riesgo de alucinación: no evaluado en la información disponible.
- El número de descargas y likes es cero, y el repositorio se creó y actualizó en un intervalo de minutos, lo que sugiere que no ha pasado por revisión comunitaria.
- Uso comercial: la licencia Apache 2.0 lo permite en principio, pero conviene verificar la licencia del modelo base original antes de desplegarlo en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/CompressedGemma/Qwen-3.8-27B-Thinkingcap-Q2_Q3
- Imagen de ejemplo citada en la model card: https://cdn-uploads.huggingface.co/production/uploads/69de1a493a21cb7c029dc694/66OY4J7wa9fqgsZ-UpUcL.png
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios de código ni demos adicionales.

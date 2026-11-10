# Sleem247/NEXUS-Legal-Q8_0-GGUF

## Resumen

NEXUS-Legal-Q8_0-GGUF es una cuantización en formato GGUF del modelo `fableforge-ai/NEXUS-Legal`, publicada por el usuario Sleem247 en Hugging Face. Se trata de un modelo especializado en dominio legal, etiquetado por su autor como "domain-specialist", "legal" y "no-refusals"/"uncensored", con 1.543.714.304 parámetros totales (aproximadamente 1,5 mil millones). El repositorio ocupa 1,6 GB y contiene los pesos cuantizados en Q8_0, listos para su uso con llama.cpp.

La relevancia de esta ficha es acotada: no se dispone de información sobre arquitectura, datos de entrenamiento, contexto, benchmarks ni composición del dataset. La model card del repositorio es la plantilla automática generada por el espacio `gguf-my-repo` de ggml.ai, que únicamente documenta el proceso de conversión y los comandos de ejecución con llama.cpp. Cualquier dato técnico adicional debe consultarse en la model card del modelo base original.

Por tanto, esta ficha documenta con rigor lo que sí está disponible (tamaño, licencia, formato, idioma, procedencia) y marca explícitamente como "no disponible" todo aquello que la información proporcionada no cubre. Es importante señalar que el modelo base no ha sido verificado en esta ficha más allá de lo declarado por el autor de la cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 1.543.714.304 (~1,5 B) |
| Parametros activos | no aplica (no se declara MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (GGUF) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (`nexus-legal-q8_0.gguf`) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base `fableforge-ai/NEXUS-Legal`: la model card del repositorio cuantizado no describe si se trata de un transformer decoder-only, un modelo híbrido o cualquier otra variante. Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF, DPO o SFT.

El único proceso técnico documentado es la conversión a GGUF mediante llama.cpp a través del espacio `gguf-my-repo` de ggml.ai, y la cuantización a Q8_0 (8 bits por peso, con escala por bloque). Las etiquetas del repositorio indican especialización en dominio legal y ausencia de rechazos ("no-refusals", "uncensored"), pero no se aporta evidencia sobre cómo se alcanzaron esas características.

## Capacidades

- Generación de texto en inglés (pipeline `text-generation`).
- Especialización declarada en dominio legal (etiqueta `legal`, `domain-specialist`).
- Comportamiento declarado sin rechazos ("no-refusals", "uncensored"); no hay documentación sobre el alcance real de esta característica.
- Compatibilidad con llama.cpp (CLI y servidor) y con endpoints compatibles (`endpoints_compatible`).
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo "thinking".
- Capacidades multilingües: solo se declara inglés (`en`); no se documentan otros idiomas.

## Casos de uso

- Asistencia en redacción de borradores de documentos legales: el modelo puede generar texto en inglés sobre terminología jurídica, útil como punto de partida para cláusulas, cartas o memorandos, siempre con revisión humana.
- Clasificación y etiquetado de textos legales en pipelines locales: al ser un GGUF de ~1,6 GB, puede ejecutarse en entornos sin GPU dedicada para tareas de categorización de contratos o correspondencia.
- Extracción de entidades y resúmenes de documentos jurídicos: integrable en scripts de procesamiento por lotes mediante llama.cpp, con coste de infraestructura mínimo.
- Prototipado de chatbots de consulta legal interna: permite desplegar un servicio local con `llama-server` para pruebas de concepto antes de escalar a modelos mayores.
- Experimentación con modelos "sin rechazos" en investigación: útil para estudiar comportamiento de modelos pequeños con políticas de alineación relajadas, en entornos controlados.
- Despliegue en dispositivos de recursos limitados: el tamaño Q8_0 (~1,6 GB) permite inferencia en portátiles y mini-PC, adecuado para demos offline de asistencia legal básica.
- Filtrado previo en sistemas RAG legales: como modelo pequeño, puede usarse para reformular consultas o descartar fragmentos irrelevantes antes de invocar un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2 GB para los pesos Q8_0 (~1,6 GB) más overhead de contexto y caché KV; en la práctica, entre 2 y 4 GB según longitud de contexto.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 4060) es suficiente; modelos como A100 o H100 no aportan ventaja significativa a este tamaño.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna con 4 GB o más; también puede ejecutarse en CPU.
- Opciones de despliegue: llama.cpp (CLI y servidor), según los comandos documentados en la model card; no se documenta soporte explícito para vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput estimados: no disponibles; dependen del hardware y del contexto configurado (la model card usa `-c 2048` en el ejemplo del servidor, sin que se confirme que ese sea el contexto máximo del modelo).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Sleem247/NEXUS-Legal-Q8_0-GGUF | ~1,5 B | no disponible | apache-2.0 | GGUF Q8_0 | Especializado en legal, sin benchmarks publicados |
| fableforge-ai/NEXUS-Legal (base) | ~1,5 B (según derivado) | no disponible | no disponible en esta ficha | safetensors (presumible) | Modelo original del que deriva esta cuantización |
| Alternativas de ~1,5 B en dominio legal | no disponible | no disponible | no disponible | no disponible | No se dispone de información verificada sobre modelos comparables de la misma categoría |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Ausencia total de documentación técnica: no se conocen arquitectura, datos de entrenamiento, contexto máximo ni proceso de alineación, lo que impide evaluar fiabilidad y calidad.
- Riesgo de alucinación: no cuantificado; en un modelo de ~1,5 B especializado en legal, la probabilidad de afirmaciones jurídicas incorrectas es alta y requiere verificación humana obligatoria.
- Etiqueta "uncensored"/"no-refusals": implica que el modelo puede producir contenido sin las salvaguardas habituales; inadecuado para entornos de producción sin moderación adicional.
- Sesgos conocidos: no documentados; al no conocerse el dataset, no es posible evaluar sesgos de género, raza, jurisdicción o sesgo geográfico (el modelo parece orientado a textos en inglés, presumiblemente de tradición jurídica anglosajona).
- Limitación de idioma: solo se declara inglés; su uso en castellano no está soportado oficialmente.
- Restricciones de licencia: apache-2.0 permite uso comercial con atribución y sin garantías; no obstante, la licencia del modelo base no se verifica en esta ficha y conviene confirmarla antes de un uso comercial.
- Caveat de producción: repositorio con 0 descargas y 0 likes en el momento de la consulta, sin señales de validación por la comunidad; no se recomienda para uso crítico sin evaluación propia.
- Advertencia legal: un modelo de este tamaño no sustituye asesoramiento jurídico profesional; cualquier salida debe tratarse como borrador sujeto a revisión por un profesional cualificado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Sleem247/NEXUS-Legal-Q8_0-GGUF
- Modelo base: https://huggingface.co/fableforge-ai/NEXUS-Legal
- Espacio de conversión GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
- Instrucciones de uso de llama.cpp: https://github.com/ggerganov/llama.cpp?tab=readme-ov-file#usage

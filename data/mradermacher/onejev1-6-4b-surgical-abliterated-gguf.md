# mradermacher/OneJev1.6-4B-Surgical-Abliterated-GGUF

## Resumen

OneJev1.6-4B-Surgical-Abliterated-GGUF es una colección de cuantizaciones GGUF estáticas del modelo medismera/OneJev1.6-4B-Surgical-Abliterated, realizadas por mradermacher, un cuantizador muy conocido en el ecosistema de llama.cpp. El modelo base es un modelo conversacional de 4,2 mil millones de parámetros, etiquetado como "abliterated" y "uncensored", lo que significa que se ha sometido a un proceso de abliteración: una técnica que modifica los pesos del modelo para neutralizar sus mecanismos internos de rechazo de peticiones, eliminando las negativas de seguridad sin necesidad de reentrenamiento completo. El término "surgical" en el nombre sugiere que la intervención sobre los pesos se ha hecho de forma selectiva y precisa, aunque el repositorio base no detalla el método exacto.

Este tipo de repositorios no añaden capacidades nuevas al modelo original: su valor está en la accesibilidad. Al ofrecer trece cuantizaciones distintas, desde Q2_K (2,0 GB) hasta f16 (8,5 GB), permite ejecutar el modelo en hardware muy variado, desde portátiles con GPU modesta hasta estaciones de trabajo. El modelo es relevante para desarrolladores que buscan un modelo pequeño, sin filtros de rechazo, con licencia Apache 2.0 y soporte multimodal (incluye archivos mmproj para visión), ejecutable localmente con llama.cpp, Ollama o LM Studio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal LM (transformer decodificador); variante concreta no disponible |
| Parametros totales | 4.205.751.296 (~4,2 B) |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, mmproj-f16, mmproj-Q8_0 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base también está disponible en safetensors) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un modelo de lenguaje causal (causal-lm) basado en transformer, pero la model card del repositorio GGUF no especifica la familia exacta, la longitud de contexto ni los detalles del preentrenamiento. El nombre "OneJev1.6" y el tamaño de ~4,2 B de parámetros sugieren un modelo compacto de última generación, pero estos datos no están confirmados en la información disponible.

El rasgo técnico más destacable es la abliteración: un proceso post-entrenamiento que identifica y anula las direcciones del espacio de activaciones responsables de los rechazos por seguridad, permitiendo que el modelo responda a cualquier petición. El tag "surgical-alignment" indica que esta modificación se ha aplicado de manera quirúrgica, minimizando el impacto en las capacidades generales del modelo. Además, el repositorio incluye archivos mmproj (suplementos multimodales en f16 y Q8_0), lo que confirma que el modelo base incorpora un proyector multimodal compatible con llama.cpp para procesamiento de imágenes. No hay información sobre el número de tokens de entrenamiento, composición del dataset ni uso de RLHF/DPO.

## Capacidades

- Generación de texto conversacional en inglés, sin mecanismos de rechazo por seguridad (abliterated)
- Procesamiento multimodal: los archivos mmproj incluidos permiten el uso de capacidades de visión con llama.cpp
- Ejecución eficiente en CPU y GPU gracias al formato GGUF, con trece niveles de cuantización para ajustar calidad y consumo de memoria
- Compatibilidad con el ecosistema transformers de Hugging Face (el modelo base está en safetensors)
- No hay información publicada sobre tool calling, razonamiento multi-paso, matemáticas, código ni modos de thinking en la documentación disponible

## Casos de uso

- Investigación sobre abliteración y alineación: el modelo sirve como sujeto de estudio para analizar cómo la eliminación de mecanismos de rechazo afecta a la calidad de generación, la coherencia y la tasa de alucinación en modelos pequeños
- Desarrollo y prueba de pipelines locales con llama.cpp: su tamaño de ~4,2 B y las cuantizaciones desde 2,0 GB permiten integrarlo en aplicaciones que se ejecutan íntegramente en el dispositivo del usuario, sin depender de APIs externas
- Prototipado de asistentes conversacionales sin filtros: útil para crear agentes de prueba donde se quiere controlar la política de moderación a nivel de aplicación en lugar de a nivel de modelo
- Procesamiento de imágenes en local: los archivos mmproj permiten montar un sistema de descripción o análisis de imágenes con llama.cpp en hardware de consumo
- Benchmarking de cuantizaciones: al disponer de trece variantes, es un buen candidato para medir la degradación de calidad entre Q2_K y f16 en modelos abliterated
- Integración en herramientas como Ollama o LM Studio para evaluación rápida en entornos sin conexión a internet, aprovechando su licencia Apache 2.0 sin restricciones de uso comercial

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia según cuantización: Q2_K ~2,0 GB; Q3_K_S/M/L ~2,2-2,5 GB; IQ4_XS ~2,6 GB; Q4_K_S/M ~2,7-2,8 GB; Q5_K_S/M ~3,1-3,2 GB; Q6_K ~3,6 GB; Q8_0 ~4,6 GB; f16 ~8,5 GB (añadir ~0,5-0,8 GB si se usa el suplemento mmproj y el contexto requerido)
- Cabe con holgura en GPUs de consumo: una RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RTX 4090 de 24 GB ejecutan incluso la variante f16; también es viable en CPU con 8-16 GB de RAM usando Q4_K_M
- GPUs recomendadas: cualquier GPU moderna con 4-8 GB de VRAM para las cuantizaciones Q4/Q5; no se requieren aceleradores de datacenter (A100/H100) para este tamaño
- Despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF; también puede cargarse el modelo base en transformers/vLLM/TGI mediante safetensors
- Latencia y throughput: no disponible; en modelos de ~4 B cuantizados a Q4 se esperan velocidades de decodificación altas incluso en GPUs de gama media, pero no hay cifras publicadas para este modelo concreto

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Caracteristica distintiva |
|---|---|---|---|---|
| OneJev1.6-4B-Surgical-Abliterated-GGUF | ~4,2 B | GGUF (13 quants + mmproj) | Apache 2.0 | Abliterated, multimodal, sin rechazos |
| Qwen2.5-3B-Instruct (GGUF) | ~3 B | GGUF | Qwen Research / Apache 2.0 (variantes) | Modelo generalista con filtros de seguridad intactos |
| Llama-3.2-3B-Instruct (GGUF) | ~3,2 B | GGUF | Llama 3.2 Community License | Modelo generalista con licencia comunitaria restrictiva |

Nota: la comparativa es aproximada por categoría de tamaño; no hay benchmarks que permitan comparar rendimiento real entre ellos.

## Limitaciones y advertencias

- Al ser un modelo abliterated, no rechazará peticiones dañinas: cualquier despliegue en producción requiere implementar moderación de entradas y salidas a nivel de aplicación; el riesgo de uso indebido es alto
- La abliteración puede degradar la coherencia del modelo, aumentar las alucinaciones o producir respuestas de menor calidad en comparación con el modelo original alineado; no hay evaluaciones publicadas que cuantifiquen esta degradación
- El idioma soportado declarado es únicamente el inglés; el rendimiento en castellano no está documentado y probablemente sea inferior
- La longitud de contexto no está especificada en la model card, lo que dificulta planificar aplicaciones con documentos largos
- Las cuantizaciones bajas (Q2_K, Q3_K_S/M) presentan una pérdida de calidad notable respecto a f16, como muestra el propio autor en sus notas
- No hay benchmarks publicados para el modelo base ni para las cuantizaciones, por lo que su calidad real en tareas estándar (MMLU, GSM8K, etc.) es desconocida
- Las cuantizaciones imatrix/weighted no estaban disponibles en el momento de publicación de este repositorio

## Enlaces

- Repositorio GGUF cuantizado: https://huggingface.co/mradermacher/OneJev1.6-4B-Surgical-Abliterated-GGUF
- Modelo base: https://huggingface.co/medismera/OneJev1.6-4B-Surgical-Abliterated
- Página de descargas de mradermacher: https://hf.tst.eu/model#OneJev1.6-4B-Surgical-Abliterated-GGUF
- Guia de uso de GGUF de TheBloke: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Empresa del cuantizador (nethype GmbH): https://www.nethype.de/

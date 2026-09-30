# mdagosta/waldito-smoke-v1-r0000-merge

## Resumen

`mdagosta/waldito-smoke-v1-r0000-merge` es un modelo de generación de texto publicado en HuggingFace por el usuario mdagosta, etiquetado como parte del proyecto "OpenWALDO". Se trata de un export de pesos que emplea la arquitectura estándar Llama de tipo causal-language-model de la librería Transformers, pero con un tokenizador propio denominado "schema-1 byte tokenizer" que requiere cargarse con `trust_remote_code=True`. El repositorio incluye además ficheros de inventario (`BOM.json`) y un mapeo de divulgación de contenido de entrenamiento conforme al reglamento europeo de GPAI (`EU-BOM.json`).

El dato más relevante es su tamaño: 820.736 parámetros totales según los pesos reales en safetensors. Esto sitúa al modelo tres órdenes de magnitud por debajo de un LLM convencional (por ejemplo, GPT-2 small tiene 124 millones), lo que sugiere que se trata de un artefacto de prueba ("smoke test", como indica su nombre) o de un checkpoint de validación de infraestructura más que de un modelo destinado a generación de texto de calidad en producción.

El modelo acumula 146 descargas y 0 likes en el momento de redactar esta ficha. No se declara licencia, idiomas soportados ni resultados de benchmarks, y la búsqueda web no ha devuelto documentación técnica asociada. Por tanto, esta ficha se limita a describir lo que el autor declara explícitamente y marca como "no disponible" todo lo demás.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal tipo Llama (causal-language-model de Transformers) |
| Parametros totales | 820.736 (dato real de safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente fp32/fp16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tokenizador | OpenWALDO schema-1 byte tokenizer (requiere `trust_remote_code=True`) |
| Tamano del repositorio | 0,0 GB (según HuggingFace) |
| Libreria | transformers |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La model card indica únicamente que el paquete utiliza "the standard Transformers Llama causal-language-model architecture" junto con el tokenizador byte schema-1 de OpenWALDO. No se especifica número de capas, dimensión de embedding, número de cabezas de atención, tamaño de vocabulario, función de activación ni ningún otro hiperparámetro arquitectónico. Tampoco se detalla si se aplicaron técnicas como RoPE, GQA, atención lineal o decodificación especulativa.

En cuanto al entrenamiento, la información disponible es prácticamente nula: no se indica el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o SFT. El único dato relevante es la existencia de `EU-BOM.json`, un mapeo de divulgación de contenido de entrenamiento orientado al cumplimiento del reglamento europeo de modelos de propósito general (GPAI), lo que sugiere que el autor ha preparado documentación de trazabilidad, aunque su contenido no está incluido en la información proporcionada. Por el tamaño (menos de un millón de parámetros) y el sufijo "smoke-v1-r0000", es plausible que se trate de un checkpoint de validación de pipeline más que de un modelo entrenado extensivamente.

## Capacidades

- Generación de texto: es la tarea declarada en el pipeline (`text-generation`), aunque la capacidad real de generar texto coherente con 820.736 parámetros es muy limitada.
- Integración con Transformers: compatible con la librería `transformers` mediante la clase de modelo Llama.
- Tokenizador personalizado: incorpora el "schema-1 byte tokenizer" de OpenWALDO, que exige ejecución de código remoto (`trust_remote_code=True`) al cargar el tokenizador.
- Compatibilidad con text-generation-inference: el tag `text-generation-inference` indica que está preparado para el servidor TGI de HuggingFace.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere que puede desplegarse en Inference Endpoints.
- Naturaleza conversacional: el tag `conversational` indica que está pensado para diálogo, aunque no se detalla el formato de prompt.
- Trazabilidad documental: incluye `BOM.json` (inventario de ficheros de la release) y `EU-BOM.json` (divulgación GPAI).
- Tool calling, agentes, razonamiento multi-paso, visión, audio: no disponible.

## Casos de uso

- Smoke test de pipelines de despliegue: por su tamaño mínimo (menos de 1 MB en fp16), es adecuado para validar de extremo a extremo que una infraestructura de inferencia (TGI, vLLM, Endpoints) carga y sirve correctamente un modelo antes de desplegar uno grande.
- Pruebas de integración del tokenizador byte schema-1: sirve para verificar que el flujo de carga con `trust_remote_code=True` funciona correctamente en un entorno controlado y que el tokenizador produce los identificadores esperados.
- Validación de formatos safetensors: permite comprobar que un sistema de carga de pesos lee correctamente ficheros safetensors con el esquema de nombres de Llama.
- Pruebas de CI/CD en proyectos de ML: al ser tan ligero, puede incluirse en suites de integración continua que verifican que el código de carga de modelos no rompe entre versiones de `transformers`.
- Experimentación académica con tokenizadores a nivel de byte: útil para investigar cómo se comporta un tokenizador byte puro frente a tokenizadores BPE/Unigram en tareas controladas.
- Verificación de cumplimiento y trazabilidad (EU GPAI): el fichero `EU-BOM.json` permite ensayar flujos internos de auditoría de contenido de entrenamiento y de inventario de artefactos.
- Benchmark de latencia de infraestructura: sirve para medir tiempos de arranque, carga y primera tokenización de un servidor sin que el coste computacional del modelo contamine la medición.
- Docencia y prototipado: útil en entornos educativos para ilustrar la estructura de un repositorio de modelo Llama-compatible sin requerir hardware dedicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, aproximadamente 3,3 MB; en fp16/bf16, unos 1,6 MB; en int8, unos 0,8 MB; en int4, unos 0,4 MB.
- GPU recomendadas: cualquier GPU con al menos unos pocos MB libres de VRAM; el modelo es irrelevante a efectos de cómputo, por lo que una NVIDIA T4, RTX 3060, RTX 4090, A100 o H100 lo sirven sin ninguna dificultad.
- Compatibilidad con GPU de consumo: sí, cabe holgadamente en cualquier GPU de consumo e incluso en iGPU o en CPU.
- Opciones de despliegue: `transformers` (librería indicada), `text-generation-inference` (tag presente en el repositorio), HuggingFace Inference Endpoints (tag `endpoints_compatible`). No se han publicado pesos en formato GGUF, por lo que su uso con `llama.cpp` u Ollama requeriría conversión previa y compatibilidad del tokenizador personalizado.
- Latencia y throughput estimados: no disponible. Dado el tamaño, la latencia estará dominada por el arranque del proceso y la carga del tokenizador, no por el cálculo del modelo.
- Requisito adicional: es necesario disponer de conectividad al repositorio y ejecutar código remoto (`trust_remote_code=True`) para cargar el tokenizador.

## Comparativa con modelos similares

No se dispone de modelos comparables directos en la información proporcionada. El tamaño de 820.736 parámetros no tiene equivalentes habituales en el ecosistema de LLM publicados (los modelos más pequeños de uso común, como GPT-2 small o TinyLlama, superan los 100 millones de parámetros). Como referencia contextual:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| waldito-smoke-v1-r0000-merge | 820.736 | no disponible | no disponible | HuggingFace |
| GPT-2 small | ~124 M | 1024 tokens | MIT (segun release original) | HuggingFace |
| TinyLlama-1.1B | ~1.100 M | 2048 tokens | Apache 2.0 | HuggingFace |
| Llama 3.2 1B | ~1.240 M | 128.000 tokens | Llama Community License | HuggingFace |

La comparación con estos modelos se ofrece únicamente como referencia de magnitud; no implica que sean funcionalmente equivalentes ni intercambiables.

## Limitaciones y advertencias

- Tamaño extremadamente reducido: con 820.736 parámetros, la coherencia y calidad del texto generado serán muy limitadas; no es un modelo apto para producción de contenido.
- Licencia no declarada: al no especificarse licencia en el repositorio, no puede asumirse permiso de uso comercial ni redistribución. Es imprescindible contactar con el autor antes de cualquier uso.
- Idiomas no declarados: no se documenta qué idiomas soporta; su comportamiento multilingüe es desconocido.
- Longitud de contexto desconocida: se desconoce la ventana máxima soportada, lo que impide planificar aplicaciones con entradas largas.
- Riesgo de alucinación: no cuantificado; en modelos de este tamaño suele ser elevado, pero no se han publicado evaluaciones al respecto.
- Dependencia de código remoto: la carga del tokenizador exige `trust_remote_code=True`, lo que implica ejecutar código del autor en el entorno local. Debe auditarse antes de usarlo en producción.
- Sesgos: no se documentan sesgos conocidos, pero tampoco se ha publicado ninguna evaluación de sesgo.
- Madurez: el sufijo "smoke-v1-r0000-merge" y la fecha de creación sugieren un artefacto de prueba en su revisión inicial, sin garantía de estabilidad ni continuidad.
- Sin benchmarks: no hay métricas publicadas (MMLU, HumanEval, GSM8K ni ninguna otra), por lo que no puede compararse objetivamente con alternativas.
- Documentación de entrenamiento incompleta: aunque se referencia `EU-BOM.json`, su contenido no se ha proporcionado y no puede verificarse la composición del dataset.

## Enlaces

- HuggingFace: https://huggingface.co/mdagosta/waldito-smoke-v1-r0000-merge
- Perfil del autor en HuggingFace: https://huggingface.co/mdagosta
- No se han encontrado papers, blogs, repositorios ni demos asociados al modelo en la búsqueda web realizada.

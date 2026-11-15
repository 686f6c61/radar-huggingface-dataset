# SEE7/Astheral-GGUF

## Resumen

Astheral-GGUF es la distribucion en formato GGUF del modelo SEE7/Astheral, un modelo de lenguaje conversacional de aproximadamente 8.030 millones de parametros (8B) construido sobre la arquitectura y licencia de Llama 3.1. El repositorio ha sido publicado por el usuario SEE7 y contiene cuantizaciones generadas con llama.cpp, pensadas para ejecucion local en CPU y GPU de consumo mediante herramientas compatibles con GGUF.

El modelo base declarado es SEE7/Astheral, del que este repositorio es una version cuantizada (relacion `quantized` en los metadatos). La informacion publica disponible es muy limitada: no se detalla la composicion del dataset de entrenamiento, el proceso de alineacion ni los resultados de evaluacion. La model card se limita a describir el proceso de cuantizacion, los ficheros incluidos y la calibracion del algoritmo imatrix.

Su relevancia practica radica en que permite desplegar un modelo de 8B en hardware modesto con cuantizacion Q4_K_M de 4,921 GB, manteniendo la licencia Llama 3.1. No obstante, al tratarse de un modelo derivado sin benchmarks publicados ni traccion en la comunidad (0 descargas, 0 likes en el momento de la consulta), debe evaluarse con cautela antes de usarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Llama 3.1; detalles no disponibles) |
| Parametros totales | 8.030.261.312 (aprox. 8B) |
| Parametros activos | no disponible (no es un modelo MoE segun los datos disponibles) |
| Longitud de contexto | no disponible (el modelo base es Llama 3.1, que soporta 128K, pero no se confirma para Astheral) |
| Tipos de cuantizacion | i1-Q4_K_M (4,921 GB) e imatrix de calibracion (0,010 GB) |
| Idiomas soportados | no disponible (la calibracion imatrix uso una muestra multilingue) |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna especifica de Astheral mas alla de su filiacion con Llama 3.1, indicada por la licencia y por la mencion "Built with Llama" en la model card. El recuento de parametros (8.030.261.312) es coherente con un transformer decoder-only de la familia Llama 3.1 8B, pero no se confirman detalles como el numero de capas, dimensiones ocultas, atencion GQA ni el tokenizador empleado.

Tampoco se documentan los datos de entrenamiento: no se indica el numero de tokens, la composicion del corpus, ni si hubo fases de SFT, RLHF o DPO. La unica informacion tecnica concreta se refiere a la cuantizacion: los ficheros GGUF se generaron con llama.cpp (commit `5676dfbe01e7ebe0387913680eee0ed39bf4a363`) y la importancia para imatrix se calculo con pases forward reales sobre una muestra determinista multilingue e instructiva del dataset SEE7/AstheralDataset. El repositorio incluye un `manifest.json` con hashes SHA-256, formatos de tensor y ajustes de chunking, lo que facilita la verificacion de integridad de los ficheros.

## Capacidades

- Generacion de texto conversacional: el tag `conversational` y la calibracion sobre muestras de instrucciones sugieren un ajuste orientado a dialogo, aunque no se detallan las capacidades exactas.
- Razonamiento y codigo: no disponible; no se han publicado evaluaciones que lo confirmen.
- Tool calling / function calling: no disponible; no se documenta soporte explicito.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: la calibracion imatrix uso una muestra multilingue, lo que sugiere cierta cobertura, pero no se especifican los idiomas.
- Modo thinking, vision o audio: no disponible; no se mencionan capacidades multimodales.
- Compatibilidad con endpoints: el tag `endpoints_compatible` indica que puede servirse a traves de infraestructura compatible con la API de Hugging Face.

## Casos de uso

- Prototipado local de asistentes conversacionales: con la cuantizacion Q4_K_M de 4,921 GB, el modelo puede cargarse en una GPU de consumo de 8 GB o en CPU con RAM suficiente, lo que permite iterar sobre prompts y flujos de dialogo sin coste de API.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse en local mediante llama.cpp u Ollama, los datos no salen de la infraestructura del usuario, adecuado para prototipos con informacion sensible.
- Evaluacion comparativa de modelos derivados: util para investigadores que quieran medir como se comporta un fine-tune de 8B frente al Llama 3.1 original en tareas concretas de su dominio.
- Generacion de texto en lotes sin conexion: integrable en scripts de procesamiento por lotes con llama.cpp para tareas de resumen o reescritura, siempre que se valide la calidad previamente.
- Base para experimentos de cuantizacion: el repositorio incluye el fichero imatrix y el manifiesto de calibracion, lo que permite reproducir o comparar el proceso de cuantizacion con otras configuraciones.
- Servicio interno de bajo coste: mediante vLLM o TGI con soporte GGUF (segun version), puede exponerse como endpoint interno para pruebas de integracion de aplicaciones conversacionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5-6 GB con la cuantizacion i1-Q4_K_M (4,921 GB de pesos mas overhead de contexto y cache KV).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090; en el segmento profesional, A10G, L4, A100 o H100 para mayor throughput.
- Cabe en GPU de consumo: si, en tarjetas con 6-8 GB o mas de VRAM usando Q4_K_M; con cuantizaciones menores (no incluidas en este repositorio) cabria en 4-6 GB.
- Opciones de despliegue: llama.cpp, Ollama (previa conversion o importacion del GGUF), llama-cpp-python, y servidores compatibles con GGUF como LM Studio o text-generation-webui. vLLM y TGI requieren soporte especifico de GGUF que depende de la version.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Astheral-GGUF (este) | 8B | no disponible | llama3.1 | GGUF | Sin benchmarks publicados; 0 descargas |
| Llama 3.1 8B Instruct | 8B | 128K | llama3.1 | safetensors, GGUF | Modelo oficial de Meta con evaluaciones publicas |
| Mistral 7B Instruct | 7,3B | 32K | Apache 2.0 | safetensors, GGUF | Alternativa permisiva para uso comercial |
| Qwen2.5 7B Instruct | 7,6B | 128K | Apache 2.0 | safetensors, GGUF | Buen rendimiento en codigo y multilingue |

La comparacion con Llama 3.1 8B es la mas directa por licencia y tamano, pero no se dispone de datos que permitan afirmar que Astheral mejora o iguala al modelo original en ninguna tarea.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publica de calidad, lo que impide recomendar el modelo para produccion sin una evaluacion propia.
- Riesgo de alucinacion: inherente a los modelos de 8B; sin datos de alineacion no puede acotarse su magnitud.
- Sesgos conocidos: no documentados; al derivar de Llama 3.1, hereda los sesgos del modelo base, pero no se detalla el proceso de mitigacion.
- Idiomas: no se especifica la cobertura; la calibracion multilingue no garantiza calidad en castellano.
- Contexto: no confirmado; no debe asumirse la ventana de 128K de Llama 3.1 sin verificacion.
- Licencia Llama 3.1: permite uso comercial con restricciones (politica de uso aceptable, obligacion de atribucion "Built with Llama" y limite de 700 millones de usuarios mensuales para licenciatarios), pero debe revisarse el texto completo antes de desplegar.
- Madurez del repositorio: 0 descargas y 0 likes; sin comunidad que valide los ficheros mas alla de los checks de estructura y hash mencionados.
- Solo dos ficheros GGUF: no hay variedad de cuantizaciones (Q2, Q5, Q8) para ajustar a distintos presupuestos de hardware.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SEE7/Astheral-GGUF
- Modelo base: https://huggingface.co/SEE7/Astheral
- Dataset de calibracion: https://huggingface.co/datasets/SEE7/AstheralDataset
- Manifiesto de cuantizacion: https://huggingface.co/SEE7/Astheral-GGUF/blob/main/manifest.json
- Licencia Llama 3.1: https://huggingface.co/SEE7/Astheral-GGUF/blob/main/LICENSE
- Licencia upstream Llama 3: https://huggingface.co/SEE7/Astheral-GGUF/blob/main/UPSTREAM_LLAMA3_LICENSE
- llama.cpp (herramienta de cuantizacion): https://github.com/ggerganov/llama.cpp

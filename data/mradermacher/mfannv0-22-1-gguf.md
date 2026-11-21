# mradermacher/MFANNv0.22.1-GGUF

## Resumen

MFANNv0.22.1 es un modelo de lenguaje conversacional de 8.030.261.312 parámetros (aproximadamente 8 mil millones) desarrollado por el usuario netcat420 y distribuido en formato GGUF por mradermacher. Se trata de un ajuste fino (fine-tune) del modelo base netcat420/MFANNv0.22.1, orientado a tareas conversacionales y entrenado sobre el dataset propietario netcat420/MFANN. El nombre y la estructura sugieren una adaptación de un modelo de la familia Llama 3.1, dado que la licencia declarada es `llama3.1`, aunque la model card no confirma explícitamente la arquitectura subyacente.

La relevancia de esta ficha reside en que se trata de un modelo de pesos abiertos con cuantizaciones estáticas listas para usar en `llama.cpp` y entornos compatibles con GGUF, lo que permite desplegarlo en hardware de consumo. El repositorio ocupa 71,8 GB e incluye 12 variantes de cuantización que van desde Q2_K (3,3 GB) hasta f16 (16,2 GB). Con 215 descargas y 1 like en el momento de la consulta, es un modelo de nicho con escasa validación comunitaria.

No se dispone de información publicada sobre la longitud de contexto, la composición del dataset de entrenamiento ni resultados de benchmarks. El idioma declarado es únicamente inglés. Cualquier evaluación de calidad debe realizarse de forma empírica por parte del usuario, ya que no hay métricas oficiales disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (fine-tune de netcat420/MFANNv0.22.1; licencia llama3.1 sugiere base Llama 3.1) |
| Parametros totales | 8.030.261.312 |
| Parametros activos | no aplica (no es MoE segun los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | llama3.1 |
| Formato de pesos | GGUF (cuantizaciones estaticas); pesos originales en safetensors en el repo base |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo. Los 8.030.261.312 parámetros y la licencia `llama3.1` apuntan a un transformer decoder-only de la familia Llama 3.1 con aproximadamente 8 mil millones de parámetros, pero esto no está confirmado en la documentación proporcionada. El modelo es un fine-tune del checkpoint netcat420/MFANNv0.22.1, entrenado sobre el dataset netcat420/MFANN, del cual no se publican ni el número de tokens ni la composición.

No se documenta el uso de RLHF, DPO, decodificación especulativa ni ninguna innovación técnica destacable. Las cuantizaciones han sido generadas por mradermacher con `quantize_version: 2` y `output_tensor_quantised: 1`, lo que indica un proceso de cuantización estándar sobre los tensores de salida. Existe además una variante con cuantizaciones ponderadas/imatrix en el repositorio mradermacher/MFANNv0.22.1-i1-GGUF, que el autor recomienda para mayor calidad a igual tamaño.

## Capacidades

- Generación de texto conversacional en inglés, según la etiqueta `conversational` del repositorio.
- Ajuste fino sobre un dataset específico (netcat420/MFANN), cuyo contenido no se detalla.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que facilita su integración en servicios de inferencia.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según el campo `language`.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Despliegue local de un asistente conversacional en inglés: con cuantizaciones de 4,8-5,0 GB (Q4_K_S/Q4_K_M), el modelo cabe en GPUs de consumo de 8 GB y permite conversaciones multi-turno en local sin depender de APIs externas.
- Prototipado rápido de aplicaciones de chat: la disponibilidad de 12 cuantizaciones permite empezar con Q2_K (3,3 GB) en máquinas modestas y escalar a Q8_0 (8,6 GB) cuando se disponga de más VRAM.
- Evaluación de fine-tunes de nicho: útil para investigadores que quieran comparar el comportamiento de un ajuste sobre el dataset MFANN frente al modelo base Llama 3.1 de 8B.
- Integración en pipelines con `llama.cpp` u Ollama: el formato GGUF y la etiqueta `endpoints_compatible` permiten servirlo mediante herramientas estándar del ecosistema.
- Generación de texto creativo o de dominio específico: al ser un fine-tune sobre un dataset propietario, puede emplearse para generar contenido alineado con el estilo de dicho dataset, previa validación empírica.
- Experimentación académica con cuantizaciones: la disponibilidad de variantes IQ y K-quant permite estudiar el impacto de la cuantización en la perplejidad y la calidad de salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~3,3 GB
  - Q3_K_M: ~4,1 GB
  - IQ4_XS: ~4,6 GB
  - Q4_K_M: ~5,0 GB
  - Q5_K_M: ~5,8 GB
  - Q6_K: ~6,7 GB
  - Q8_0: ~8,6 GB
  - f16: ~16,2 GB
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para cuantizaciones Q4-Q8; A100/H100 solo necesarias para f16 o para servir con lotes grandes.
- Cabe en GPU de consumo: sí, desde una GTX 1060 6 GB con Q2_K/Q3_K_S hasta una RTX 4090 con Q8_0. Para f16 se recomienda una GPU de 24 GB o superior.
- Opciones de despliegue: `llama.cpp`, Ollama, LM Studio, `llama-cpp-python`, servidores compatibles con la API de OpenAI vía `llama-server`. No se documenta soporte para vLLM o TGI en formato GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| MFANNv0.22.1-GGUF | 8,03B | no disponible | llama3.1 | GGUF | Hugging Face |
| Llama 3.1 8B Instruct | 8,03B | 128K (según documentación oficial de Meta) | llama3.1 | safetensors, GGUF | Hugging Face, Meta |
| Mistral 7B Instruct | 7,24B | 32K | Apache 2.0 | safetensors, GGUF | Hugging Face |
| Qwen2.5 7B Instruct | 7,62B | 128K | Apache 2.0 | safetensors, GGUF | Hugging Face |

La comparación con Llama 3.1 8B es la más directa por tamaño y licencia, pero no se dispone de datos que confirmen que MFANNv0.22.1 herede su ventana de contexto ni su calidad. Mistral 7B y Qwen2.5 7B ofrecen licencias más permisivas (Apache 2.0) y contextos documentados, lo que supone una ventaja para uso comercial sin restricciones adicionales.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al ser un fine-tune sin model card detallada, no hay evaluación de sesgos publicada.
- Riesgo de alucinación: no cuantificado; sin benchmarks ni evaluación humana, el riesgo es desconocido y debe validarse en el dominio de uso.
- Limitaciones de contexto e idioma: solo se declara inglés; la longitud de contexto no está publicada, por lo que no debe asumirse una ventana larga.
- Restricciones de licencia: la licencia `llama3.1` impone las condiciones de la Llama 3.1 Community License, que incluye restricciones de uso comercial para entidades con más de 700 millones de usuarios mensuales y obligaciones de atribución.
- Caveat para producción: el modelo tiene 215 descargas y 1 like, sin validación comunitaria ni resultados de evaluación; no se recomienda para producción sin una batería de pruebas propia.
- El dataset de entrenamiento (netcat420/MFANN) no está documentado en la información disponible, lo que impide evaluar su procedencia, licencia y posibles sesgos.
- La model card no confirma la arquitectura subyacente ni el contexto, por lo que las estimaciones de hardware se basan únicamente en el recuento de parámetros.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/MFANNv0.22.1-GGUF
- Modelo base: https://huggingface.co/netcat420/MFANNv0.22.1
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/MFANNv0.22.1-i1-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/netcat420/MFANN
- Página de descargas del autor: https://hf.tst.eu/model#MFANNv0.22.1-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Gráfico de calidad de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9

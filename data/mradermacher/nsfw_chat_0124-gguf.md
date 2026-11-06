# mradermacher/nsfw_chat_0124-GGUF

## Resumen

`mradermacher/nsfw_chat_0124-GGUF` es una colección de cuantizaciones en formato GGUF del modelo base `TOPAI-Network/nsfw_chat_0124`, publicada por el usuario mradermacher el 26 de febrero de 2025. No se trata de un modelo entrenado desde cero, sino de una conversión a GGUF de un modelo conversacional de aproximadamente 8.030 millones de parámetros (8B), pensado para ejecutarse en entornos con llama.cpp y derivados. Su propósito declarado es el diálogo conversacional sin restricciones de contenido (etiquetado `not-for-all-audiences`), en inglés.

La relevancia práctica de este repositorio es acotada pero clara: ofrece el modelo base en 12 niveles de cuantización estática (desde Q2_K de 3,3 GB hasta f16 de 16,2 GB), lo que permite desplegarlo en hardware muy diverso, desde GPUs de consumo con 6-8 GB de VRAM hasta estaciones de trabajo. Al estar publicado bajo licencia MIT, no hay restricciones legales de uso comercial derivadas de la licencia, aunque el contenido que genera el modelo sí requiere las salvaguardas adecuadas.

La información técnica disponible es escasa: la model card del cuantizador no documenta arquitectura, contexto, dataset ni benchmarks del modelo original, y la model card del modelo base no se ha incluido en la búsqueda. Por tanto, varios campos de esta ficha se marcan explícitamente como "no disponible".

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base `TOPAI-Network/nsfw_chat_0124`; sin documentación en la información proporcionada) |
| Parámetros totales | 8.030.269.440 (≈8B, dato de safetensors del modelo base) |
| Parámetros activos | no aplica (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base usa safetensors |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base `TOPAI-Network/nsfw_chat_0124`: la model card del cuantizador no la describe y no se ha accedido a la del modelo original. Por el recuento de parámetros (≈8B) y la etiqueta `transformers`, es plausible que se trate de un transformer decoder-only de escala 8B, pero esto no está confirmado en la información proporcionada.

Tampoco hay datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF, DPO o fine-tuning supervisado. El cuantizador indica que las cuantizaciones son estáticas (`quantize_version: 2`, `output_tensor_quantised: 1`) y que en el momento de la publicación no había cuantizaciones ponderadas/imatrix disponibles; tampoco se han publicado variantes de este tipo en la información consultada.

## Capacidades

- Generación de texto conversacional multi-turno en inglés, orientada a diálogo sin restricciones de contenido (etiqueta `not-for-all-audiences`).
- Conversación general: el pipeline declarado es conversacional.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Ejecución local mediante llama.cpp y compatible con endpoints (etiqueta `endpoints_compatible`).

## Casos de uso

- Roleplay y narrativa interactiva sin filtros: el modelo está etiquetado explícitamente como `not-for-all-audiences`, por lo que su uso previsto es la generación de diálogo y ficción sin las restricciones de contenido habituales en modelos alineados. La cuantización Q4_K_M (5,0 GB) permite ejecutarlo en una GPU de consumo.
- Prototipado de chatbots conversacionales en local: con Q4_K_S o Q4_K_M se puede montar un servidor de inferencia en llama.cpp y probar flujos conversacionales multi-turno sin depender de APIs externas.
- Investigación sobre seguridad y alineación: disponer de un modelo sin restricciones en formato GGUF facilita experimentos de red-teaming, evaluación de filtros y estudio de comportamientos no deseados en entornos controlados.
- Generación de ficción y contenido creativo para adultos: el modelo está pensado para este nicho; conviene combinarlo con moderación y verificación humana antes de publicar.
- Despliegue en hardware modesto: las cuantizaciones Q2_K (3,3 GB) y Q3_K_S (3,8 GB) permiten ejecutar el modelo en equipos con poca VRAM o incluso en CPU, útil para demos y pruebas de concepto.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece 12 variantes del mismo modelo, lo que permite medir el impacto de la cuantización en calidad y velocidad sobre un mismo checkpoint.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto, aproximada): Q2_K ≈ 3,3 GB; Q3_K_S ≈ 3,8 GB; Q3_K_M ≈ 4,1 GB; Q3_K_L ≈ 4,4 GB; IQ4_XS ≈ 4,6 GB; Q4_K_S ≈ 4,8 GB; Q4_K_M ≈ 5,0 GB; Q5_K_S ≈ 5,7 GB; Q5_K_M ≈ 5,8 GB; Q6_K ≈ 6,7 GB; Q8_0 ≈ 8,6 GB; f16 ≈ 16,2 GB. Añadir entre 0,5 y 2 GB adicionales según la longitud de contexto configurada.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4070 para Q4-Q5; RTX 4090 o A100/H100 para Q8_0 y f16 con contexto largo.
- Cabe en GPU de consumo: sí, desde Q2_K en GPUs de 4-6 GB hasta Q8_0 en GPUs de 12 GB o más. Las cuantizaciones bajas también pueden ejecutarse en CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; la etiqueta `endpoints_compatible` sugiere compatibilidad con servidores de endpoints estilo OpenAI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de arquitectura del modelo base que permitan una comparación rigurosa con alternativas. Como referencia de categoría (modelos conversacionales de ~8B en GGUF con licencia permisiva), podrían citarse Llama 3.1 8B Instruct, Mistral 7B Instruct o Qwen2.5 7B Instruct, pero no se han encontrado en la información proporcionada datos que permitan comparar parámetros, contexto o benchmarks de forma fiable.

| Modelo | Parámetros | Contexto | Licencia | Formato GGUF |
|---|---|---|---|---|
| nsfw_chat_0124 (este) | ≈8B | no disponible | MIT | sí |
| Llama 3.1 8B Instruct | 8B | 128K | Llama 3.1 Community | sí |
| Mistral 7B Instruct | 7B | 32K | Apache 2.0 | sí |
| Qwen2.5 7B Instruct | 7B | 128K | Apache 2.0 | sí |

Los datos de los modelos comparativos son de conocimiento general; los de este modelo proceden únicamente de la información proporcionada.

## Limitaciones y advertencias

- Contenido no apto para todos los públicos: el modelo está etiquetado `not-for-all-audiences`; puede generar contenido sexual, violento u ofensivo. Requiere moderación y control de acceso en cualquier despliegue.
- Riesgo de alucinación: sin datos de entrenamiento ni evaluaciones publicadas, no es posible acotar la tasa de alucinación; en usos factuales debe verificarse la salida.
- Idioma: solo inglés declarado; el rendimiento en castellano no está garantizado.
- Contexto: se desconoce la ventana de contexto del modelo base, lo que impide planificar cargas de contexto largo.
- Licencia: MIT permite uso comercial y modificación, pero no exime del cumplimiento de la normativa aplicable al contenido generado ni de las políticas de las plataformas de despliegue.
- Trazabilidad: al ser una cuantización de un modelo de terceros, la calidad depende del checkpoint original; no hay benchmarks que validen las cuantizaciones frente al modelo en f16.
- Cuantizaciones bajas: Q2_K y Q3_K_M pueden degradar notablemente la coherencia; el propio cuantizador marca Q3_K_M como "lower quality".

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/nsfw_chat_0124-GGUF
- Árbol de archivos: https://huggingface.co/mradermacher/nsfw_chat_0124-GGUF/tree/main
- Modelo base: https://huggingface.co/TOPAI-Network/nsfw_chat_0124
- Página de descargas del cuantizador: https://hf.tst.eu/model#nsfw_chat_0124-GGUF
- Guía de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Comparativa de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9

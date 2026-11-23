# mradermacher/nullabby1.5-uncensored-GGUF

## Resumen

nullabby1.5-uncensored-GGUF es la versión cuantizada en formato GGUF del modelo nullabby1.5-uncensored, publicado por el usuario mradermacher a partir del modelo base de nulliaukamk. Se trata de un modelo de generación de texto de aproximadamente 8.950 millones de parámetros (8,95 B) derivado de la familia Qwen3.5, según la etiqueta `qwen3_5` de la model card, y sometido a un proceso de "abliteration" o decensura (etiquetas `uncensored`, `decensored`, `abliterated`, `heretic`) que elimina o atenúa los mecanismos de rechazo del modelo original.

El modelo resuelve el problema de disponer de pesos listos para inferencia local en hardware de consumo mediante cuantizaciones estáticas de 2 a 16 bits, desde 4,0 GB (Q2_K) hasta 18,0 GB (f16). Está pensado para desarrolladores que necesitan ejecutar un modelo conversacional sin filtros de contenido en entornos controlados, con despliegue vía llama.cpp, Ollama u otros runners compatibles con GGUF.

La relevancia actual radica en que combina un tamaño moderado (8,95 B), licencia Apache 2.0 permisiva y un conjunto amplio de cuantizaciones, lo que facilita su integración en pipelines locales. No obstante, la información pública disponible es escasa: la model card del cuantizador es puramente mecánica y no documenta arquitectura, contexto ni datos de entrenamiento del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta `qwen3_5` sugiere familia Qwen3.5, sin detalle de transformer/MoE) |
| Parametros totales | 8.953.803.264 (8,95 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 (estáticas); variantes i1 (imatrix/weighted) en repo separado |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base. La etiqueta `qwen3_5` apunta a que deriva de la familia Qwen3.5, pero la model card no confirma si se trata de un transformer denso o de una arquitectura híbrida/MoE. El recuento de parámetros (8,95 B) y el tamaño del repo (81,8 GB, que incluye todas las cuantizaciones) son los únicos datos estructurales verificables.

El proceso de entrenamiento del modelo base tampoco está documentado en la información disponible: no se especifica el número de tokens, la composición del dataset ni si hubo fases de RLHF, DPO o similares. Lo que sí se documenta es el proceso de modificación: el modelo ha sido "abliterated" o decensurado (etiquetas `heretic`, `uncensored`, `abliterated`), una técnica que típicamente identifica y suprime direcciones de activación asociadas al rechazo de peticiones. La cuantización la realiza mradermacher con su pipeline habitual (convert_type hf, quantize_version 2, output_tensor_quantised 1), generando cuantizaciones estáticas y, en un repo aparte, cuantizaciones ponderadas con imatrix (i1).

## Capacidades

- Generación de texto conversacional multi-turno (etiqueta `conversational`).
- Modelo decensurado: no aplica los filtros de rechazo habituales del modelo original, lo que permite respuestas sobre temas que el modelo base declinaría.
- Compatible con text-generation-inference y transformers como librerías declaradas.
- Etiqueta `unsloth`, lo que sugiere que el modelo base pudo ser entrenado o ajustado con la librería Unsloth, aunque no se detalla la naturaleza del ajuste.
- Soporte de tool calling / function calling: no disponible en la información.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información.
- Capacidades multilingües: limitadas a inglés según el campo `language`.
- Capacidades especiales (thinking mode, visión, audio): no disponible en la información.

## Casos de uso

- Inferencia local en estaciones de trabajo con GPU de consumo: las cuantizaciones Q4_K_M (5,8 GB) y Q5_K_M (6,6 GB) permiten ejecutar el modelo en GPUs con 8-12 GB de VRAM, útil para prototipado de aplicaciones conversacionales sin depender de APIs externas.
- Investigación sobre alineación y decensura: el modelo permite estudiar el efecto de la abliteration comparando respuestas con el modelo base original, en entornos de laboratorio controlados.
- Generación creativa sin restricciones temáticas: escritura de ficción, guiones o narrativa que aborde temas sensibles donde el modelo original aplicaría rechazos, siempre que el uso cumpla la legislación aplicable.
- Despliegue en entornos air-gapped: al distribuirse como GGUF y con licencia Apache 2.0, puede ejecutarse en infraestructura sin conexión a internet mediante llama.cpp u Ollama, útil en organizaciones con requisitos de soberanía de datos.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece 12 variantes de cuantización, lo que permite medir el impacto de la compresión en perplejidad y calidad de respuesta para un modelo de 8,95 B.
- Fine-tuning posterior sobre GGUF: aunque el formato GGUF está orientado a inferencia, el modelo base en safetensors (Apache 2.0) puede servir como punto de partida para ajustes con LoRA en tareas específicas de dominio en inglés.
- Chatbot de propósito general en inglés para uso interno: con contexto conversacional y cuantización Q8_0 (9,6 GB) para máxima calidad en una GPU de 16 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: Q2_K ~4,0 GB; Q3_K_M ~4,8 GB; IQ4_XS ~5,4 GB; Q4_K_M ~5,8 GB; Q5_K_M ~6,6 GB; Q6_K ~7,5 GB; Q8_0 ~9,6 GB; f16 ~18,0 GB (más overhead de contexto KV cache).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090 (24 GB) para f16; A100/H100 no necesarias para este tamaño, aunque válidas para servir en lote.
- Cabe en GPU de consumo: sí, desde Q4_K_M en adelante en GPUs de 8 GB o más; Q8_0 requiere 12 GB o más; f16 requiere 24 GB.
- Opciones de despliegue: llama.cpp, Ollama, text-generation-inference (declarado en tags), transformers con soporte GGUF, servidores compatibles con la API de OpenAI (etiqueta `endpoints_compatible`).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| nullabby1.5-uncensored-GGUF (este) | 8,95 B | no disponible | Apache 2.0 | GGUF | Decensurado, solo inglés |
| Modelo base nullabby1.5-uncensored | 8,95 B | no disponible | Apache 2.0 | safetensors | Pesos originales sin cuantizar |
| Variante i1-GGUF de mradermacher | 8,95 B | no disponible | Apache 2.0 | GGUF (imatrix) | Cuantizaciones ponderadas, mayor calidad por bit |
| Alternativas de la familia Qwen3.5 de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

No se dispone de información suficiente para comparar con alternativas de otros desarrolladores (Llama, Mistral, Gemma) en términos de rendimiento medido, ya que no hay benchmarks publicados en la información disponible.

## Limitaciones y advertencias

- Modelo decensurado: la abliteration elimina los mecanismos de rechazo, por lo que puede generar contenido dañino, ilegal o sexualmente explícito. El despliegue en producción exige filtros externos y revisión legal.
- Solo inglés: el campo `language` declara únicamente `en`; el rendimiento en castellano no está garantizado ni documentado.
- Riesgo de alucinación: no hay datos publicados sobre tasas de alucinación ni evaluaciones de fidelidad; al ser un modelo de 8,95 B, es esperable un comportamiento inferior a modelos mayores en razonamiento factual.
- Contexto desconocido: no se documenta la longitud de contexto, lo que impide planificar aplicaciones con ventanas largas sin pruebas empíricas.
- Licencia Apache 2.0: permite uso comercial, pero el usuario asume la responsabilidad sobre el contenido generado y sobre el cumplimiento normativo (por ejemplo, el Reglamento de IA de la UE).
- Información de procedencia escasa: el modelo base lo publica un usuario individual (nulliaukamk) sin documentación de entrenamiento, lo que dificulta la reproducibilidad y la auditoría.
- Cuantizaciones de baja precisión: Q2_K y Q3_K_S degradan notablemente la calidad; la propia model card recomienda Q4_K_S/Q4_K_M como equilibrio y Q6_K/Q8_0 para máxima fidelidad.
- Riesgo de sesgos: no se han publicado evaluaciones de sesgo; los modelos decensurados tienden a reproducir sesgos del corpus sin la atenuación que introducen las fases de alineación.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/nullabby1.5-uncensored-GGUF
- Modelo base: https://huggingface.co/nulliaukamk/nullabby1.5-uncensored
- Cuantizaciones imatrix (i1): https://huggingface.co/mradermacher/nullabby1.5-uncensored-i1-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#nullabby1.5-uncensored-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico de perplejidad por tipo de cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/

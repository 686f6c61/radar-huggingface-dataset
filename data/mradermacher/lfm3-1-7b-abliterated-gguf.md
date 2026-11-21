# mradermacher/LFM3-1.7B-abliterated-GGUF

## Resumen

LFM3-1.7B-abliterated-GGUF es la versión cuantizada en formato GGUF del modelo FrostWolfAI/LFM3-1.7B-abliterated, una variante "abliterated" (decensored) del modelo LFM3 de Liquid AI, con 1.728.801.600 parámetros totales. El trabajo de cuantización lo firma mradermacher, un conocido publicador de quants estáticos para llama.cpp, y ofrece 12 variantes de cuantización que van desde Q2_K (0,9 GB) hasta f16 (3,6 GB).

El modelo está pensado para despliegue en el borde (edge) y en dispositivo (on-device), con un enfoque conversacional, agentico y de tool calling, según los tags del repositorio. La variante "abliterated" implica que se ha aplicado una técnica de eliminación de direcciones de rechazo (refusal directions) para reducir el comportamiento de censura del modelo base, algo habitual en la comunidad de modelos locales.

Es relevante ahora porque permite ejecutar un modelo de 1,7B parámetros con capacidades conversacionales y de razonamiento en hardware modesto, incluyendo GPUs de consumo y CPU, gracias a los cuants de baja precisión. La licencia lfm1.0 (Liquid Foundation Model License) condiciona el uso comercial, por lo que conviene revisarla antes de integrarlo en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia LFM3 de Liquid AI; detalles de capas y atención no disponibles) |
| Parámetros totales | 1.728.801.600 |
| Parámetros activos | no disponible (no es MoE según la información) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl |
| Licencia | lfm1.0 (otra, según metadatos de Hugging Face) |
| Formato de pesos | GGUF (cuants estáticos); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base es una variante "abliterated" de LFM3-1.7B de Liquid AI, un transformer de 1,7B parámetros orientado a despliegue en el borde. La etiqueta "custom_code" en los metadatos indica que la arquitectura requiere código personalizado en transformers, y los tags "liquid", "lfm3" y "edge" confirman la familia y el objetivo de diseño. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada.

La innovación principal de esta ficha es la cuantización estática realizada por mradermacher sobre el modelo abliterated, con cuants que cubren desde 2 hasta 16 bits por peso. El proceso de abliteration del modelo base (FrostWolfAI) elimina direcciones de activación asociadas a rechazos, lo que reduce la censura pero puede degradar la coherencia en temas sensibles. No se detallan innovaciones arquitectónicas adicionales como decodificación especulativa o atención lineal en la información disponible.

## Capacidades

- Generación de texto conversacional multi-turno, con enfoque en diálogo.
- Razonamiento (tag "reasoning") y resolución de tareas de varios pasos.
- Tool calling / function calling, según los tags "tool-calling" y "agentic".
- Capacidades agenticas para flujos de trabajo automatizados.
- Soporte multilingüe en 16 idiomas: inglés, árabe, chino, francés, alemán, italiano, japonés, coreano, portugués, español, vietnamita, tailandés, indonesio, hindi, ruso y polaco.
- Comportamiento "uncensored" / "decensored" por la abliteration, con menor tendencia a rechazar peticiones.
- Optimizado para despliegue en dispositivo (on-device) y en el borde (edge).

## Casos de uso

- Asistente conversacional local en dispositivos de gama baja: con cuants Q4_K_S o Q4_K_M (1,2 GB) el modelo cabe en GPUs integradas o CPU, permitiendo un chatbot privado sin conexión.
- Agente de automatización de tareas con tool calling: los tags "agentic" y "tool-calling" indican que puede invocar funciones externas, útil para orquestar APIs en pipelines locales.
- Procesamiento de texto multilingüe en el borde: al soportar 16 idiomas, puede usarse para traducción o resumen en dispositivos sin enviar datos a la nube.
- Prototipado rápido de aplicaciones de IA generativa: el tamaño reducido y los cuants ligeros permiten iterar en portátiles con llama.cpp u Ollama.
- Investigación sobre alineación y censura: la variante abliterated sirve para estudiar el comportamiento de rechazo y compararlo con el modelo original.
- Generación de contenido creativo sin filtros en entornos controlados: útil para escritura asistida donde se requiere baja tasa de rechazos, siempre con supervisión humana.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse localmente, evita el envío de datos sensibles a servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB para Q2_K, 1,2 GB para Q4_K_M, 1,9 GB para Q8_0 y 3,6 GB para f16 (tamaños de archivo; la VRAM real depende del contexto y del backend).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para cuants bajos; RTX 3060, RTX 4060, RTX 4090 o superiores para mayor comodidad y contexto largo.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs modernas e incluso en iGPUs con cuants Q4 o inferiores.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo base requiere transformers con custom_code.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM3-1.7B-abliterated-GGUF (este) | 1,7B | no disponible | lfm1.0 | GGUF | Variante abliterated, 16 idiomas, tool calling |
| FrostWolfAI/LFM3-1.7B-abliterated | 1,7B | no disponible | lfm1.0 | safetensors | Modelo base sin cuantizar |
| LFM3-1.7B (original de Liquid AI) | 1,7B | no disponible | lfm1.0 | safetensors | Modelo original con alineación estándar |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La abliteration reduce los rechazos pero puede aumentar la probabilidad de generar contenido sesgado, ofensivo o inseguro; requiere moderación externa en producción.
- Riesgo de alucinación inherente a modelos de 1,7B parámetros, especialmente en tareas de conocimiento factual.
- La longitud de contexto no está documentada; conviene verificarla empíricamente antes de usarla en aplicaciones con contexto largo.
- La licencia lfm1.0 impone restricciones; es necesario revisar el archivo LICENSE antes de cualquier uso comercial.
- Los cuants de baja precisión (Q2_K, Q3_K_S) degradan la calidad; se recomienda Q4_K_M o superior para uso real.
- El modelo base requiere custom_code en transformers, lo que puede complicar la integración fuera de llama.cpp.
- No hay información sobre sesgos específicos ni evaluaciones de seguridad publicadas.

## Enlaces

- [Hugging Face: mradermacher/LFM3-1.7B-abliterated-GGUF](https://huggingface.co/mradermacher/LFM3-1.7B-abliterated-GGUF)
- [Modelo base: FrostWolfAI/LFM3-1.7B-abliterated](https://huggingface.co/FrostWolfAI/LFM3-1.7B-abliterated)
- [Quants con imatrix: mradermacher/LFM3-1.7B-abliterated-i1-GGUF](https://huggingface.co/mradermacher/LFM3-1.7B-abliterated-i1-GGUF)
- [Página de overview de mradermacher](https://hf.tst.eu/model#LFM3-1.7B-abliterated-GGUF)
- [FAQ y solicitudes de modelos de mradermacher](https://huggingface.co/mradermacher/model_requests)
- [Guía de uso de GGUF (TheBloke)](https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF)
- [Gráfico de perplejidad de cuants (ikawrakow)](https://www.nethype.de/huggingface_embed/quantpplgraph.png)
- [Notas sobre cuantización (Artefact2)](https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9)
- [nethype GmbH](https://www.nethype.de/)

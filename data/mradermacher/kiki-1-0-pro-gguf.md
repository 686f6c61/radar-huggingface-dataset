# mradermacher/kiki-1.0-pro-GGUF

## Resumen

kiki-1.0-pro es un modelo de lenguaje conversacional desarrollado por OpenKLO, publicado originalmente en Hugging Face y distribuido aquí en formato GGUF por mradermacher. Se trata de un transformer denso de aproximadamente 7.615 millones de parámetros (7,6 B), orientado a tareas de conversación, generación de código y matemáticas, con soporte declarado para ocho idiomas: ruso, ucraniano, bielorruso, inglés, polaco, alemán, francés y español.

El modelo base OpenKLO/kiki-1.0-pro se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales más allá de las obligaciones de atribución de dicha licencia. La relevancia de esta ficha concreta radica en que el repositorio GGUF de mradermacher ofrece 12 variantes de cuantización estática (desde Q2_K hasta f16), lo que permite desplegar el modelo en hardware de consumo con requisitos de VRAM que van desde unos 3,1 GB hasta 15,3 GB.

No obstante, la información pública disponible es muy limitada: la model card del repositorio GGUF es una plantilla generada automáticamente por la herramienta de cuantización de mradermacher y no incluye detalles sobre arquitectura interna, datos de entrenamiento, longitud de contexto ni resultados de benchmarks. Esta ficha refleja exclusivamente los datos verificables del repositorio y marca como "no disponible" todo aquello que no se ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (detalles internos no disponibles) |
| Parametros totales | 7.615.616.512 (7,6 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | ru, uk, be, en, pl, de, fr, es |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (original en safetensors/transformers) |

## Arquitectura y entrenamiento

La información disponible confirma que se trata de un transformer denso de 7,6 B de parámetros, pero no se detalla la arquitectura interna (número de capas, dimensión oculta, mecanismo de atención, uso de RoPE, GQA u otras optimizaciones). El repositorio GGUF no incluye información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF, DPO o SFT.

Los tags del repositorio indican que el modelo está orientado a conversación, código y matemáticas, y que soporta ocho idiomas con especial énfasis en el bloque eslavo (ruso, ucraniano, bielorruso, polaco). No se ha publicado información sobre innovaciones técnicas como decodificación especulativa, atención lineal o arquitecturas híbridas. Las cuantizaciones son estáticas (no ponderadas por imatrix), según indica el propio autor de la cuantización.

## Capacidades

- Generación de texto conversacional multi-turno, según el tag "conversational".
- Generación y asistencia en código, según el tag "code".
- Razonamiento matemático, según el tag "math".
- Capacidades multilingües en ruso, ucraniano, bielorruso, inglés, polaco, alemán, francés y español.
- Compatibilidad con endpoints (tag "endpoints_compatible"), lo que sugiere integración con infraestructuras de inferencia estándar.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades especiales (thinking mode, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Asistencia conversacional multilingüe en Europa del Este: el modelo cubre ruso, ucraniano, bielorruso y polaco, lo que lo hace adecuado para atención al cliente o chatbots en esos mercados, aunque la longitud de contexto no está documentada y debe validarse empíricamente antes de desplegarlo en producción.
- Generación de código en entornos con recursos limitados: con cuantización Q4_K_M (4,8 GB), el modelo puede ejecutarse en GPUs de consumo y asistir en autocompletado o generación de fragmentos de código en flujos de desarrollo locales.
- Tutoría y resolución de problemas matemáticos: el tag "math" sugiere uso en aplicaciones educativas, aunque sin benchmarks publicados conviene evaluar su precisión antes de confiar en él para corrección automática.
- Procesamiento de documentación multilingüe: útil para traducción asistida o resumen de textos entre los ocho idiomas soportados, especialmente en combinaciones con lenguas eslavas poco cubiertas por otros modelos.
- Despliegue en edge o estaciones de trabajo sin GPU dedicada: la variante Q2_K (3,1 GB) permite inferencia en CPU con llama.cpp u Ollama, adecuada para prototipos y entornos de desarrollo.
- Integración en pipelines de CI/CD para revisión de código: si se confirma soporte de tool calling (no documentado), podría usarse para linting semántico o generación de tests; en caso contrario, limitado a generación de texto.
- Experimentación académica con modelos pequeños multilingües: su licencia Apache 2.0 y tamaño contenido lo hacen apto para fine-tuning e investigación sin restricciones comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización:
  - Q2_K: ~3,1 GB
  - Q3_K_S: ~3,6 GB
  - Q3_K_M: ~3,9 GB
  - Q3_K_L: ~4,2 GB
  - IQ4_XS: ~4,4 GB
  - Q4_K_S: ~4,6 GB
  - Q4_K_M: ~4,8 GB
  - Q5_K_S: ~5,4 GB
  - Q5_K_M: ~5,5 GB
  - Q6_K: ~6,4 GB
  - Q8_0: ~8,2 GB
  - f16: ~15,3 GB
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, las cuantizaciones Q4 caben en GPUs de consumo con 8 GB de VRAM (RTX 3060 Ti, RTX 4060 Ti, RTX 3070); las Q6 y Q8 requieren 12-16 GB (RTX 4070 Ti, RTX 4080, RTX 4090); f16 requiere 24 GB o más (RTX 3090, RTX 4090, A100).
- Cabe en GPU de consumo: sí, en la mayoría de cuantizaciones (Q2 a Q6) en GPUs con 8-16 GB de VRAM.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF. El tag "endpoints_compatible" sugiere compatibilidad con servidores de inferencia estándar, pero no se especifican cuáles.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| kiki-1.0-pro (este) | 7,6 B | no disponible | Apache 2.0 | GGUF, safetensors | 8 idiomas, foco eslavo |
| Mistral 7B | 7,2 B | 8k-32k (según versión) | Apache 2.0 | GGUF, safetensors | Referencia en 7B, ecosistema amplio |
| Llama 3.1 8B | 8,0 B | 128k | Llama 3.1 Community | GGUF, safetensors | Multilingüe, benchmarks públicos |
| Qwen2.5 7B | 7,6 B | 32k-128k | Apache 2.0 | GGUF, safetensors | Fuerte en código y matemáticas |

La comparación es orientativa: no se dispone de benchmarks de kiki-1.0-pro que permitan una comparación cuantitativa con estas alternativas. La ventaja diferencial de kiki-1.0-pro es su cobertura de lenguas eslavas (ru, uk, be, pl), menos representadas en los modelos occidentales.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no es posible evaluar su calidad real frente a alternativas consolidadas.
- Longitud de contexto desconocida: limita su uso en tareas que requieran ventanas largas (documentos extensos, conversaciones prolongadas).
- Model card del GGUF generada automáticamente: no aporta información sobre sesgos, alineación ni datos de entrenamiento del modelo base.
- Riesgo de alucinación: inherente a modelos de 7B sin documentación sobre alineación; no se ha verificado su comportamiento.
- Sesgos conocidos: no documentados, pero esperables en un modelo entrenado con corpus multilingües no especificados.
- Idiomas: aunque declara ocho, la calidad relativa por idioma no está documentada; el foco parece estar en lenguas eslavas.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar que el modelo base no imponga restricciones adicionales (la model card del GGUF indica Apache 2.0).
- Cuantizaciones estáticas (sin imatrix): pueden presentar mayor degradación de calidad que las ponderadas, especialmente en Q2 y Q3.
- Sin soporte documentado de tool calling ni agentes: no apto para pipelines agénticos sin validación previa.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/kiki-1.0-pro-GGUF
- Modelo base: https://huggingface.co/OpenKLO/kiki-1.0-pro
- Página de descargas del autor: https://hf.tst.eu/model#kiki-1.0-pro-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests

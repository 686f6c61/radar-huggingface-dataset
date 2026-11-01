# mradermacher/MiniAI-Quata2-4b-v0.2-base-GGUF

## Resumen

MiniAI-Quata2-4b-v0.2-base es un modelo de lenguaje de tipo base (no instruido) de aproximadamente 4.330 millones de parámetros, desarrollado por el usuario M1n1A1 y cuantizado a formato GGUF por mradermacher. El modelo parte de una arquitectura derivada de Qwen 3.5 (según las etiquetas de la model card) y ha sido sometido a un proceso de continued pretraining orientado a lenguas eslavas del sur: serbio (sr), croata (hr) y bosnio (bs), además del inglés (en). La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

La relevancia de esta ficha reside en dos factores. Por un lado, el modelo cubre un nicho poco atendido: los modelos de 4B parámetros con cobertura explícita de serbio, croata y bosnio son escasos, y la mayoría de los modelos multilingües de ese tamaño tratan estas lenguas de forma marginal. Por otro, la disponibilidad de cuantizaciones GGUF estáticas (desde Q2_K hasta f16, pasando por IQ4_XS y Q4_K_M) facilita el despliegue en hardware de consumo, algo crítico para investigadores y desarrolladores que trabajan con recursos limitados.

El repositorio incluye además ficheros mmproj (Q8_0 y f16), lo que sugiere capacidades multimodales en el modelo base, aunque la model card no detalla qué modalidad adicional soporta ni su alcance. El tamaño total del repositorio es de 40 GB, coherente con la suma de todas las cuantizaciones publicadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer derivada de Qwen 3.5 (según etiquetas de la model card; detalles no disponibles) |
| Parámetros totales | 4.326.350.848 (4,33 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; además mmproj Q8_0 y mmproj f16 |
| Idiomas soportados | en, sr, hr, bs |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base original está en formato transformers/safetensors |

## Arquitectura y entrenamiento

La model card del repositorio de cuantización no proporciona detalles sobre la arquitectura interna más allá de la etiqueta `qwen3.5`, que vincula el modelo a la familia Qwen 3.5. Se trata, por tanto, de un transformer decoder-only de aproximadamente 4,33 B de parámetros. No se especifica si emplea atención lineal, decodificación especulativa, mezcla de expertos ni otras innovaciones técnicas.

Respecto al entrenamiento, las etiquetas indican `continued-pretraining` y `base-model`: el modelo ha pasado por una fase adicional de preentrenamiento sobre datos de lenguas eslavas del sur (serbio, croata, bosnio) partiendo de un modelo previo de la familia Qwen 3.5. No se dispone de información sobre el número de tokens empleados, la composición del dataset, ni si hubo fases de RLHF o DPO. Al ser un modelo base, es previsible que no haya recibido ajuste por instrucciones, aunque este extremo no se confirma explícitamente en la información disponible.

## Capacidades

- Generación de texto en inglés, serbio, croata y bosnio, con especial énfasis en las tres lenguas eslavas del sur gracias al continued pretraining.
- Modelo base: no está ajustado para seguir instrucciones de forma fiable; requiere prompting de completado o un ajuste posterior (SFT) para tareas conversacionales.
- Soporte multimodal potencial: la presencia de ficheros `mmproj` sugiere capacidad de proyección multimodal, aunque no se detalla qué modalidad (visión, audio u otra) ni su alcance.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte explícito de agentes ni de razonamiento multi-paso.
- No se documenta modo thinking ni capacidades de razonamiento extendido.

## Casos de uso

- Investigación en lenguas eslavas del sur: el modelo sirve como base para experimentos de continued pretraining, ajuste fino o evaluación en serbio, croata y bosnio, lenguas con poca representación en modelos de 4B parámetros.
- Generación de texto y completado en producción de bajo coste: con cuantizaciones Q4_K_M (2,9 GB) o Q5_K_M (3,3 GB) puede desplegarse en GPUs de consumo para tareas de completado, resumen o parafraseo en los idiomas soportados.
- Punto de partida para SFT: al ser un modelo base, es adecuado para ajuste supervisado orientado a dominios concretos (legal, administrativo, medios) en serbio, croata o bosnio, donde los modelos instruidos disponibles son escasos.
- Despliegue en entornos con recursos limitados: las cuantizaciones Q2_K (2,1 GB) y Q3_K_S (2,2 GB) permiten ejecución en CPU o GPUs con poca VRAM, útil para prototipos y demos locales.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece un espectro amplio de cuantizaciones (de Q2_K a f16), lo que facilita estudios de degradación de perplejidad y calidad según el nivel de cuantización.
- Experimentación multimodal: los ficheros mmproj permiten probar integraciones multimodales en llama.cpp, aunque el alcance real de la modalidad debe validarse empíricamente.
- Fine-tuning con LoRA/QLoRA: el tamaño de 4,33 B y la disponibilidad de pesos en GGUF y en el modelo base original facilitan el ajuste eficiente en una sola GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~2,1 GB
  - Q3_K_S / Q3_K_M: ~2,2–2,4 GB
  - IQ4_XS / Q4_K_S: ~2,7 GB
  - Q4_K_M: ~2,9 GB
  - Q5_K_M: ~3,3 GB
  - Q6_K: ~3,7 GB
  - Q8_0: ~4,7 GB
  - f16: ~8,8 GB
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones Q4; RTX 3060/4060, RTX 4090, A100 o H100 para las cuantizaciones superiores o para mayor throughput.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs modernas con 6–8 GB de VRAM para Q4_K_M o Q5_K_M; las cuantizaciones Q2/Q3 caben incluso en iGPU o ejecución en CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF; el modelo base original puede servirse con vLLM o TGI si se convierte a safetensors.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas destacados | Licencia | Formato |
|---|---|---|---|---|---|
| MiniAI-Quata2-4b-v0.2-base (este) | 4,33 B | no disponible | en, sr, hr, bs | Apache 2.0 | GGUF, safetensors |
| Qwen 2.5 3B / 4B | 3–4 B | 32K (típico en la familia) | multilingüe amplio | Apache 2.0 | safetensors, GGUF |
| Llama 3.2 3B | 3,2 B | 128K | multilingüe (8 idiomas oficiales) | Llama 3.2 Community License | safetensors, GGUF |
| Gemma 2 2B | 2,6 B | 8K | multilingüe | Gemma Terms of Use | safetensors, GGUF |

La comparación con Qwen 2.5, Llama 3.2 y Gemma 2 es aproximada: no se dispone de datos de benchmarks del modelo evaluado que permitan establecer una comparación de rendimiento rigurosa. La ventaja diferencial de MiniAI-Quata2 es la cobertura específica de serbio, croata y bosnio, ausente o marginal en los modelos citados.

## Limitaciones y advertencias

- Al ser un modelo base, no está alineado para seguir instrucciones ni para conversación; su uso directo en chatbots producirá respuestas incoherentes o incompletas.
- No se han publicado evaluaciones de sesgo, toxicidad ni alucinación; se desconoce el comportamiento en dominios sensibles.
- La longitud de contexto no está documentada, lo que impide planificar aplicaciones que dependan de ventanas largas.
- La cobertura lingüística se limita a en, sr, hr y bs; el rendimiento en otras lenguas (incluido el español) no está garantizado y probablemente sea deficiente.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base original (M1n1A1/MiniAI-Quata2-4b-v0.2-base) debe verificarse por si impone condiciones adicionales derivadas de Qwen 3.5.
- La etiqueta `qwen3.5` sugiere una base Qwen, pero no se confirma la versión exacta ni las condiciones de la licencia original de Qwen, que en algunas versiones ha sido distinta de Apache 2.0.
- Los ficheros mmproj indican multimodalidad, pero no se documenta qué modalidad ni su calidad; no debe asumirse un rendimiento de visión equiparable a modelos especializados.
- El repositorio tiene 40 GB y múltiples cuantizaciones; conviene descargar solo la variante necesaria para evitar consumo innecesario de almacenamiento.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/MiniAI-Quata2-4b-v0.2-base-GGUF
- Modelo base: https://huggingface.co/M1n1A1/MiniAI-Quata2-4b-v0.2-base
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/MiniAI-Quata2-4b-v0.2-base-i1-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#MiniAI-Quata2-4b-v0.2-base-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Gráfico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH: https://www.nethype.de/

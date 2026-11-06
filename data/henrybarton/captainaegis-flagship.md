# Henrybarton/captainaegis-flagship

## Resumen

Captain AEGIS Flagship es un checkpoint de generación de texto publicado por Henry Barton bajo el paraguas del proyecto NeVeRhOOd / Captain AEGIS. Según la model card, deriva de un modelo base Qwen3.5-4B (tipo `qwen3_5_text`, clase `Qwen3_5ForCausalLM`) al que se le habría aplicado un adaptador de entrenamiento documentado en un informe de 16 pasos. El repositorio contiene 4.205.751.296 parámetros físicos en pesos BF16 repartidos en cinco shards de SafeTensors (~8,41 GB), aunque en el momento de la ficha solo los shards 1 y 2 están publicados; el autor indica que los shards 3 a 5 están en proceso de subida.

El modelo se presenta como una pieza central de un sistema más amplio: un runtime de chat estructurado con soporte de tool calling, un conjunto de herramientas denominado Wizards/Wands y una arquitectura conceptual de doce facetas (Tesseract) que mezcla componentes operativos y de aprendizaje. Es importante subrayar que esa arquitectura de doce facetas es un diseño de sistema, no una capacidad implementada en el checkpoint descargable. El checkpoint raíz es exclusivamente un modelo de texto: las capacidades de vídeo, música o imagen que menciona la model card corresponden a packs de planificación separados y no a pesos entrenados de visión o audio.

La relevancia actual del modelo es limitada pero ilustrativa: se trata de un proyecto independiente, con licencia no declarada, publicado en inglés y sin resultados de benchmarks ni validación end-to-end del checkpoint desde el nuevo repositorio. Resulta útil como caso de estudio de empaquetado de un derivado de Qwen3.5-4B con runtime de herramientas, pero no como modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, clase `Qwen3_5ForCausalLM`, tipo `qwen3_5_text` |
| Parámetros totales | 4.205.751.296 (según índice de safetensors) |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (la model card indica que depende de `config.json` y de los límites del runtime; no verificado) |
| Tipos de cuantización | no disponible (pesos publicados en BF16; no se documentan GGUF, AWQ ni GPTQ) |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16, cinco shards; solo 1 y 2 publicados) |

## Arquitectura y entrenamiento

El checkpoint es un transformer decoder-only derivado de Qwen3.5-4B, con tokenizer original (`tokenizer.json`, `tokenizer_config.json`) y plantilla de chat propia (`chat_template.jinja`). La model card menciona un "registro de merge" que identifica el modelo fuente Qwen3.5-4B, un adaptador de entrenamiento y un informe de entrenamiento de 16 pasos. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o SFT más allá de ese adaptador. Tampoco se detalla ninguna innovación técnica de atención o decodificación.

Un punto relevante para la evaluación técnica es la distinción que hace el propio autor entre los pesos raíz y otros artefactos del bucket: la carpeta `heavy-body-v1/` contiene copias archivadas y artefactos de planificación, y la cifra de 78,75 GB se declara explícitamente como "objetivo futuro de cuerpo", no como pesos aprendidos descargables. El repositorio público incluye únicamente los artefactos raíz del modelo (config, generation_config, tokenizer, chat template, índice y shards). El runtime con backend CUDA sobre Transformers y API compatible con OpenAI (SSE) existe en el código privado del autor, pero no está verificado públicamente.

## Capacidades

- Generación de texto conversacional en inglés, uso previsto central del checkpoint.
- Asistencia de código, según la model card, aunque sin benchmarks que lo cuantifiquen.
- Soporte de tool calling / function calling a través del runtime separado (parseo de llamadas, allowlist de Wizards/Wands, rondas de herramienta acotadas y reinyección de resultados).
- Interfaz de chat en streaming con formato compatible con OpenAI (SSE), disponible en el código privado, no verificada en despliegue público.
- Capacidades multilingües: solo inglés declarado.
- No verificado como renderizador nativo de vídeo, audio o imagen; los packs de producción audiovisual son artefactos de planificación, no pesos entrenados.

## Casos de uso

- Prototipado de asistentes conversacionales en inglés: el checkpoint de 4B puede ejecutarse en una GPU de consumo y servir como base para experimentar con plantillas de chat y flujos multi-turno antes de invertir en modelos mayores.
- Investigación sobre derivados de Qwen3.5: útil para estudiar cómo se documenta un merge con adaptador y qué artefactos acompañan a un checkpoint (tokenizer, chat template, índice de shards) en un proyecto independiente.
- Evaluación de runtimes de tool calling: el diseño de Wizards/Wands con rondas acotadas y reinyección de resultados sirve como referencia para implementar agentes con límites de ejecución en pipelines propios.
- Generación de código en entornos controlados: al ser un modelo de 4B en BF16, encaja en flujos de autocompletado o revisión de código donde la latencia importa más que la calidad punta y el licenciamiento está pendiente de aclarar.
- Docencia y talleres: su tamaño permite desplegarlo en una sola GPU consumer para demostrar carga de safetensors, plantillas de chat y APIs compatibles con OpenAI.
- Planificación de producción audiovisual asistida: los packs de planificación (story beats, escenas, continuidad de personajes, planes de cámara) pueden usarse como esquemas estructurados que el modelo de texto rellene, sin esperar renderizado nativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 8,4 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 10-12 GB para contexto corto.
- VRAM estimada en cuantización de 8 bits: alrededor de 4,5-5 GB; en 4 bits, alrededor de 2,5-3 GB (estimaciones a partir del recuento de parámetros, no verificadas con este checkpoint).
- GPU recomendadas: A100 o H100 para servir varias peticiones concurrentes; RTX 4090, RTX 3090 o RTX 4080 para inferencia individual en BF16.
- GPU consumer: cabe en tarjetas con 12 GB o más en BF16; en 8 GB requeriría cuantización, que no está documentada para este modelo.
- Opciones de despliegue: Transformers con backend CUDA (el autor menciona este backend en el código privado); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y la ausencia de pesos GGUF limita las opciones fuera de Transformers.
- Latencia y throughput: no disponibles; el autor indica que el checkpoint no ha pasado una prueba de carga y generación end-to-end desde el nuevo repositorio.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Captain AEGIS Flagship | 4,21B | no disponible | no disponible | Parcial (2 de 5 shards) | Derivado de Qwen3.5-4B con runtime de herramientas propio |
| Qwen3.5-4B (base declarado) | ~4B | no disponible en esta ficha | según el proyecto Qwen | Público | Modelo fuente del que deriva el checkpoint |
| Alternativas de ~4B de la familia Llama o Qwen | ~4B | variable según versión | permisiva en la mayoría de versiones | Público y completo | Ecosistema amplio de cuantizaciones y runtimes |

No se dispone de datos de rendimiento comparativo para Captain AEGIS Flagship; la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Repositorio incompleto: solo los shards 1 y 2 de 5 están publicados; el checkpoint no puede cargarse tal cual desde Hugging Face hasta que se suban los restantes.
- Sin validación end-to-end: el propio autor reconoce que no hay una prueba de carga y generación verificada desde el nuevo repositorio.
- Licencia no declarada: no hay autorización explícita de uso comercial; debe tratarse como no apto para producción hasta aclararlo.
- Solo inglés: no se declaran capacidades multilingües.
- Riesgo de alucinación: inherente a un modelo de 4B sin benchmarks publicados; no hay datos de calibración ni de evaluación de fidelidad.
- Confusión potencial entre artefactos: la model card mezcla pesos raíz, packs de planificación audiovisual y una arquitectura de doce facetas; ninguna de las capacidades de vídeo, audio o imagen está implementada en el checkpoint.
- Sesgos: no documentados; al derivar de un modelo base no identificado con detalle, los sesgos del corpus original se heredan sin análisis.
- Contexto no verificado: la longitud de contexto efectiva depende de `config.json` y del runtime, y no se ha validado experimentalmente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Henrybarton/captainaegis-flagship
- Repositorio NeVeRhOOd Academy: https://github.com/tooljhlb/NeVeRhOOd-Academy
- Chat interactivo Captain Tesseract: https://github.com/tooljhlb/NeVeRhOOd-Academy/blob/main/site/captain/index.html
- Perfil de GitHub del autor: https://github.com/tooljhlb
- Dataset de conversiones y archivo: https://huggingface.co/datasets/Henrybarton/captain-aegis-conversions-archive
- Ficha de un modelo relacionado en free2aitools: https://free2aitools.com/model/henrybarton/generalaegis-flagship-full

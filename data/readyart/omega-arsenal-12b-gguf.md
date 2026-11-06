# ReadyArt/Omega-Arsenal-12B-GGUF

## Resumen

Omega-Arsenal-12B-GGUF es la versión cuantizada en formato GGUF del modelo Omega-Arsenal-12B, desarrollado por ReadyArt. Se trata de un modelo de generación de texto orientado a roleplay, conversación y contenido adulto sin alinear (unaligned), con etiquetas que indican soporte explícito para ERP, terror, violencia y contenido para mayores de edad. El modelo base tiene 11.907.350.576 parámetros (aproximadamente 12B).

Su relevancia radica en que ofrece, bajo licencia Apache 2.0, un modelo sin filtros de alineación para casos de uso creativos y de ficción adulta que los modelos comerciales rechazan por políticas de contenido. El repositorio en Hugging Face acumula más de 15.000 descargas. La información técnica publicada en la model card es escasa: no se detallan arquitectura, longitud de contexto, cuantizaciones disponibles ni datos de entrenamiento más allá de lo indicado por las etiquetas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer decoder, presumiblemente, heredado del modelo base) |
| Parametros totales | 11.907.350.576 (~12B) |
| Parametros activos | no disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato GGUF; el repo pesa 115,3 GB, lo que sugiere múltiples variantes de cuantización) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado desde safetensors del modelo base) |

## Arquitectura y entrenamiento

No se han publicado detalles de arquitectura en la model card. Al tratarse de un modelo derivado de 12B parámetros publicado como GGUF, lo más probable es que sea un transformer decoder denso, pero el autor no especifica la familia base original, el número de tokens de entrenamiento ni la composición del dataset. Las etiquetas del repositorio indican que es un modelo instruct/conversacional orientado a roleplay y contenido adulto sin alineación, lo que sugiere un fine-tuning posterior sobre un modelo base con datos de rol y ficción madura. No hay información sobre RLHF, DPO ni técnicas de decodificación especiales.

## Capacidades

- Generación de texto conversacional e instruct (según pipeline y etiquetas del repo).
- Roleplay de larga duración y narrativa interactiva.
- Contenido adulto explícito: ERP, terror y violencia, sin filtros de alineación.
- No hay evidencia publicada de soporte de tool calling / function calling.
- No hay evidencia publicada de capacidades de agentes, visión ni audio.
- No hay evidencia publicada de soporte multilingüe más allá del inglés.

## Casos de uso

- Roleplay interactivo en plataformas locales: ejecutando el GGUF con llama.cpp u Ollama, un usuario puede mantener sesiones de rol narrativo multi-turno sin depender de APIs comerciales que bloquean contenido adulto.
- Escritura creativa de ficción madura: generación de prosa de terror o violencia gráfica para novelas o relatos, aprovechando la ausencia de filtros que en otros modelos cortan la narrativa.
- ERP y ficción para adultos: diseño de personajes y escenas explícitas de forma privada en hardware propio.
- Desarrollo de bots de conversación sin censura: integración en frontends tipo SillyTavern para chatbots de personaje con memoria de contexto (sujeta a la ventana de contexto del modelo base, no publicada).
- Prototipado de asistentes no alineados para investigación: estudio del comportamiento de modelos sin RLHF restrictivo en entornos controlados.
- Generación de diálogos para videojuegos: creación de contenido narrativo maduro (horror, violencia) para guiones de juegos independientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con exactitud; para un modelo denso de ~12B en GGUF, una cuantización Q4_K_M ocupa en torno a 7-8 GB y una Q8_0 en torno a 12-13 GB, más la memoria de contexto. El tamaño total del repo (115,3 GB) indica que incluye variantes de muy alta precisión (posiblemente BF16 o Q8 de múltiples partes).
- GPU recomendadas: RTX 3060 de 12 GB o RTX 4060 Ti 16 GB para cuantizaciones medias; RTX 4090 (24 GB) para cuantizaciones altas y contextos largos.
- Cabe en GPU de consumo: sí, en cuantizaciones Q4/Q5 en GPUs de 8-12 GB; en CPU puro es viable pero lento (del orden de 5-15 tokens/s según CPU y RAM).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp (habitual para roleplay), text-generation-webui con backend llama.cpp. vLLM y TGI no soportan GGUF de forma nativa; para servir con vLLM habría que usar los pesos safetensors del modelo base.
- Latencia y throughput: no disponibles; en una RTX 4090 con Q4_K_M cabe esperar del orden de 40-70 tokens/s, cifra orientativa no confirmada por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Orientacion |
|---|---|---|---|---|
| Omega-Arsenal-12B-GGUF | ~12B | GGUF | Apache 2.0 | Roleplay y contenido adulto sin alinear |
| Mistral Nemo Instruct 12B | ~12B | safetensors / GGUF comunitarios | Apache 2.0 | Instruct general, multilingüe |
| Nous Hermes 3 (Llama 3.1 8B) | ~8B | safetensors / GGUF | Llama 3.1 Community | Instruct con alineación ligera |
| TheDrummer modelos de roleplay (varios) | 8-24B | GGUF | variable | Roleplay sin censura |

Omega-Arsenal se diferencia por su enfoque explícito en contenido adulto sin alineación y su licencia permisiva, frente a alternativas como Hermes 3, que mantienen cierto grado de refusal training.

## Limitaciones y advertencias

- Contenido solo para adultos: el repo está etiquetado como not-for-all-audiences; genera material explícito (ERP, violencia, terror) sin filtros, con los riesgos legales y éticos asociados según la jurisdicción.
- Riesgo de alucinación: no evaluado públicamente; al ser un fine-tuning de roleplay sin benchmarks publicados, su fiabilidad factual es desconocida y presumiblemente baja frente a modelos generalistas.
- Idioma: solo se declara soporte de inglés; el rendimiento en castellano no está verificado y probablemente sea inferior.
- Contexto: la longitud de ventana no está publicada; no se puede garantizar memoria de conversaciones largas sin verificar el modelo base.
- Sin benchmarks ni evaluaciones de seguridad publicadas: no apto para producción en entornos que requieran cumplimiento (GDPR, moderación de contenido, uso por menores).
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre el contenido generado recae en el desplegador.
- Repositorio de 115,3 GB: la descarga completa requiere ancho de banda y almacenamiento considerables; conviene descargar solo las cuantizaciones necesarias.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ReadyArt/Omega-Arsenal-12B-GGUF
- Modelo base: https://huggingface.co/ReadyArt/Omega-Arsenal-12B
- Perfil del autor: https://huggingface.co/ReadyArt
- Paper, blog o demo: no disponibles en la informacion proporcionada.

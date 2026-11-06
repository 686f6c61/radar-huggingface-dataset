# mradermacher/ModalSearcher-8B-SFT-GGUF

## Resumen

ModalSearcher-8B-SFT-GGUF es una cuantización estática en formato GGUF del modelo ModalSearcher-8B-SFT, publicado por el usuario mradermacher en Hugging Face. El modelo base, alojado en el repositorio hansQAQ/ModalSearcher-8B-SFT, es un modelo afinado mediante SFT (supervised fine-tuning) orientado, por su nombre, a tareas de búsqueda modal o selección de modalidades, aunque no se dispone de documentación técnica que detalle su propósito exacto. La conversión a GGUF la realiza mradermacher, un perfil conocido por producir versiones cuantizadas de modelos open source para su uso con llama.cpp y herramientas compatibles.

El dato más relevante es la discrepancia entre el nombre del repositorio (que sugiere 8B parámetros) y el recuento real de parámetros en safetensors: 576.388.336 parámetros, es decir, aproximadamente 0,58B. Esto indica que el modelo base no tiene 8 mil millones de parámetros, sino un orden de magnitud menor, lo que condiciona por completo sus requisitos de hardware y sus capacidades esperadas. No se dispone de información sobre arquitectura, contexto, licencia ni idiomas.

La ficha se limita a documentar lo que consta en los metadatos del repositorio y a señalar explícitamente los vacíos de información, dado que la model card es prácticamente inexistente y no se han publicado benchmarks, paper ni documentación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 576.388.336 (según safetensors del modelo base) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base. Por el nombre del repositorio (ModalSearcher-8B-SFT) se infiere que se trata de un modelo afinado con supervisión (SFT) sobre una base previa, pero no se especifica qué modelo base se utilizó, el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas posteriores de RLHF o DPO. Tampoco se documenta ninguna innovación técnica (atención lineal, decodificación especulativa, mezcla de expertos, etc.).

La única información técnica fiable procede de los metadatos de conversión a GGUF incluidos en la model card: `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, lo que indica una conversión desde pesos Hugging Face con la herramienta de cuantización de llama.cpp en su versión 2. El recuento de parámetros (576.388.336) contradice el sufijo "8B" del nombre, por lo que cualquier estimación de capacidad basada en el nombre debe descartarse.

## Capacidades

- Generación de texto: capacidad esperada por tratarse de un modelo de lenguaje, aunque no se documenta explícitamente.
- Búsqueda o selección modal: el nombre "ModalSearcher" sugiere una especialización en tareas de búsqueda sobre modalidades, pero no hay documentación que lo confirme.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Experimentación con cuantizaciones GGUF: el repositorio ofrece 12 variantes de cuantización (desde Q2_K hasta x-f16), lo que permite evaluar el compromiso entre tamaño y calidad en un modelo pequeño de 0,58B parámetros sobre llama.cpp.
- Pruebas de pipelines de conversión: útil como caso de estudio para validar flujos de conversión HF a GGUF con la herramienta de mradermacher, dado que incluye metadatos de versión de cuantización.
- Prototipado en hardware muy limitado: con ~0,58B parámetros, las variantes Q4_K_M o Q5_K_M caben en CPU y en GPUs de gama baja, lo que permite desplegar un prototipo funcional sin infraestructura dedicada.
- Evaluación comparativa de cuantizaciones: al disponer de Q2_K a Q8_0 y x-f16, se puede medir la degradación de perplejidad por nivel de cuantización en un modelo de este tamaño.
- Filtrado o clasificación de texto en local: si el modelo base está orientado a selección o búsqueda, podría usarse como componente ligero en un pipeline de recuperación, aunque esta aplicación no está documentada.
- Docencia y demostraciones: modelo de tamaño reducido adecuado para explicar el proceso de cuantización y despliegue con llama.cpp en entornos formativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 0,58B parámetros, las cuantizaciones Q4_K_M ocupan del orden de 350-400 MB, y x-f16 del orden de 1,1-1,2 GB (estimación basada en el recuento de parámetros; no confirmada por el autor).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para las variantes cuantizadas; no se requiere A100 ni H100.
- ¿Cabe en GPU de consumo? Sí, en cualquier GPU de consumo moderna (GTX 1050 Ti en adelante) e incluso en CPU.
- Opciones de despliegue: llama.cpp, Ollama (previa importación del GGUF), y servidores compatibles con GGUF como llama-cpp-python o text-generation-webui. vLLM y TGI no soportan GGUF de forma nativa para este formato.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

No disponible. No se dispone de información sobre el modelo base ni sobre alternativas comparables de la misma categoría (búsqueda modal o modelos de ~0,6B parámetros con fine-tuning SFT) en la documentación proporcionada.

## Limitaciones y advertencias

- Discrepancia crítica de nomenclatura: el nombre indica "8B" pero el recuento real de parámetros es de 576.388.336 (~0,58B). Cualquier planificación basada en el nombre será errónea.
- Model card inexistente: no hay información sobre arquitectura, datos de entrenamiento, licencia ni idiomas, lo que impide evaluar su idoneidad para producción.
- Licencia no especificada: no se puede confirmar el uso comercial; debe verificarse en el repositorio del modelo base (hansQAQ/ModalSearcher-8B-SFT) antes de cualquier despliegue.
- Riesgo de alucinación: no evaluado; en modelos pequeños sin documentación de entrenamiento el riesgo es alto y no cuantificado.
- Sesgos: no documentados ni evaluados.
- Limitaciones de contexto e idioma: desconocidas.
- Repositorio sin descargas ni likes en el momento de la consulta: no hay evidencia de uso en la comunidad ni validación externa.
- Fecha de creación futura (2026-11-06) en los metadatos: posible anomalía en el registro del repositorio que conviene verificar.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/ModalSearcher-8B-SFT-GGUF
- Modelo base: https://huggingface.co/hansQAQ/ModalSearcher-8B-SFT

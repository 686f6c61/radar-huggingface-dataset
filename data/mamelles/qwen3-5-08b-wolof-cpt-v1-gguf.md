# mamelles/Qwen3.5-08B-Wolof-CPT-v1-GGUF

## Resumen

Qwen3.5-08B-Wolof-CPT-v1-GGUF es una exportación en formato GGUF del modelo Tonic/Qwen3.5-08B-Wolof-CPT-v1, un ajuste del modelo Qwen3.5 de 8B orientado al idioma wolof mediante continued pre-training (CPT). El modelo lo publica el usuario mamelles en Hugging Face y está pensado para su uso con llama.cpp y otros runners compatibles con GGUF. La nomenclatura "08B" del nombre indica la familia de origen, si bien el recuento real de parámetros reportado en safetensors es de 1.014.371.136 (aproximadamente 1,01 mil millones), un dato que conviene verificar antes de planificar el despliegue.

El interés del modelo reside en su especialización lingüística: el wolof es una lengua nígero-congolesa hablada principalmente en Senegal y Gambia, con escasa representación en los corpus de los grandes modelos generalistas. Un ajuste por CPT sobre una base Qwen3.5 busca mejorar la fluidez y la cobertura léxica en ese idioma manteniendo las capacidades conversacionales de la base. El repositorio incluye varias cuantizaciones (F16, Q8_0, Q5_K_M, Q4_K_M y Q4_0), lo que facilita su ejecución en hardware de consumo.

La información publicada es muy limitada: no consta licencia, no se detallan idiomas soportados más allá de la etiqueta "wolof", no hay datos de entrenamiento ni resultados de benchmarks. Esta ficha refleja exclusivamente lo disponible y marca como "no disponible" todo aquello que el autor no documenta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5; detalles no disponibles) |
| Parámetros totales | 1.014.371.136 según safetensors; el nombre indica "08B" (discrepancia no aclarada por el autor) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | F16, Q8_0, Q5_K_M, Q4_K_M, Q4_0 |
| Idiomas soportados | wolof (etiqueta del repositorio); resto no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (repositorio de cuantizaciones); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

El modelo base es Tonic/Qwen3.5-08B-Wolof-CPT-v1, un ajuste por continued pre-training de una base Qwen3.5 de 8B sobre datos en wolof. El autor no publica el volumen de tokens de entrenamiento, la composición del corpus, ni si hubo fases de alineación posteriores (SFT, RLHF o DPO). Tampoco se documentan innovaciones técnicas específicas del ajuste.

La arquitectura subyacente corresponde a la familia Qwen3.5, de tipo transformer decoder-only, pero no se detallan en la información disponible el número de capas, la dimensión oculta, el mecanismo de atención ni la longitud de contexto nativa. El repositorio de mamelles es únicamente una exportación a GGUF del modelo de Tonic, sin modificaciones declaradas más allá de la cuantización.

## Capacidades

- Generación de texto conversacional, según la etiqueta `conversational` del repositorio.
- Procesamiento del idioma wolof, objetivo declarado del ajuste por CPT.
- Ejecución en llama.cpp y runners compatibles con GGUF (el autor incluye un ejemplo con `llama-cli`).
- Compatibilidad con endpoints (`endpoints_compatible` en las etiquetas), lo que sugiere uso tras API de inferencia.
- Soporte de tool calling: no disponible.
- Capacidades de agente y razonamiento multi-paso: no disponibles.
- Visión, audio o modo thinking: no disponibles.
- Cobertura multilingüe más allá del wolof: no disponible.

## Casos de uso

- Asistentes conversacionales en wolof: el modelo puede gestionar diálogos multi-turno en esa lengua, un nicho con muy pocas alternativas open source, usando las cuantizaciones Q4_K_M o Q5_K_M para despliegue ligero.
- Digitalización y atención ciudadana en Senegal y Gambia: chatbots de información pública (salud, trámites, agricultura) que respondan en wolof, con la salvedad de que la calidad debe validarse con hablantes nativos.
- Traducción asistida wolof-francés: como generador en un pipeline de traducción, con revisión humana, aprovechando el bilingüismo funcional de la base Qwen.
- Investigación lingüística y NLP de bajos recursos: evaluación de CPT como técnica para lenguas con pocos datos, comparando el modelo base con este ajuste.
- Educación y alfabetización: generación de material didáctico y ejercicios en wolof para escuelas y programas de aprendizaje de lengua.
- Prototipado local en hardware modesto: con cuantizaciones Q4_0 o Q4_K_M puede ejecutarse en GPU de consumo o incluso en CPU mediante llama.cpp, lo que facilita pruebas sin infraestructura dedicada.
- Preservación cultural: generación y resumen de textos en wolof para archivos y proyectos de documentación lingüística.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El repositorio completo ocupa 5,2 GB, coherente con un modelo de aproximadamente 1.000 millones de parámetros en varias cuantizaciones.
- VRAM estimada para inferencia (según recuento real de parámetros): en torno a 2 GB en Q4_K_M, 2,5-3 GB en Q5_K_M, 3,5-4 GB en Q8_0 y unos 5-6 GB en F16, incluyendo overhead de contexto.
- Si el modelo efectivo fuese realmente de 8B (como indica el nombre), las necesidades subirían a aproximadamente 5 GB en Q4_K_M y 16 GB en F16; el autor no aclara la discrepancia.
- GPU recomendadas: cualquier GPU con 6-8 GB de VRAM (RTX 3060, RTX 4060, RTX 2070) es suficiente para las cuantizaciones pequeñas; A100 y H100 no son necesarias.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 4 GB o más para cuantizaciones Q4.
- Opciones de despliegue: llama.cpp (soporte nativo GGUF, ejemplo oficial con `llama-cli`), Ollama, servidores compatibles con la API de llama.cpp y endpoints de Hugging Face.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mamelles/Qwen3.5-08B-Wolof-CPT-v1-GGUF | ~1,01B (según safetensors) | no disponible | no disponible | GGUF | Ajuste CPT en wolof, cuantizaciones F16 a Q4_0 |
| Tonic/Qwen3.5-08B-Wolof-CPT-v1 | no disponible | no disponible | no disponible | safetensors | Modelo base del que deriva esta exportación |
| Qwen3.5 (base generalista) | ~8B (según nomenclatura) | no disponible | no disponible | safetensors, GGUF | Modelo original sin ajuste en wolof; cobertura de wolof presumiblemente menor |
| Otros ajustes en lenguas africanas de bajo recursos | no disponible | no disponible | variable | variable | No se dispone de datos concretos para comparar rendimiento |

## Limitaciones y advertencias

- La licencia no está declarada, por lo que no puede confirmarse el uso comercial; debe contactarse con el autor o con el titular del modelo base antes de un despliegue productivo.
- Existe una discrepancia no resuelta entre el nombre ("08B") y el recuento real de parámetros (~1,01B); planificar el hardware sin verificarlo puede llevar a errores.
- No hay información sobre el corpus de entrenamiento, lo que impide evaluar sesgos, cobertura dialectal o calidad de los datos.
- Riesgo de alucinación inherente a los modelos generativos, agravado en una lengua con pocos datos de alineación; se recomienda validación con hablantes nativos.
- Contexto máximo desconocido; no debe asumirse una ventana larga.
- Idiomas soportados no documentados más allá del wolof; el comportamiento en otros idiomas no está garantizado.
- El repositorio tiene cero descargas y cero likes, sin evidencia de uso en producción ni de validación externa.
- No se han publicado benchmarks, por lo que no hay métricas objetivas de calidad en wolof ni en tareas generales.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mamelles/Qwen3.5-08B-Wolof-CPT-v1-GGUF
- Modelo base: https://huggingface.co/Tonic/Qwen3.5-08B-Wolof-CPT-v1
- llama.cpp (runner compatible): https://github.com/ggml-org/llama.cpp
